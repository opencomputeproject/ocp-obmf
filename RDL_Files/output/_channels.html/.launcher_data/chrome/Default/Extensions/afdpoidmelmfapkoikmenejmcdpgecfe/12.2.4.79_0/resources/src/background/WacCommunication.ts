import { getLogger } from "../utils/log";
import {
	BrowserType,
	ContentInjected,
	FarewellRequest,
	FarewellResponse,
	GreetingRequest,
	GreetingResponse,
	isExtensionMessage,
	MessageAddressFrame,
	MessageFromInjected,
	MessageToInjected,
	NotActiveResponse,
	TabRemoved,
	validateConfigurationUpdate,
	validateFarewellRequest,
	validateGreetingRequest,
	WacIncoming,
	WacOutgoing
} from "./WacAPI";
import { browserInfo } from "../utils/browserInfo";
import { IWacCommunication } from "./IWacCommunication";
import { WebNavigationEvent } from "./IWebNavigation";
import { FrameState } from "./TabsState";
import { IWacNativeCommunication } from "./IWacNativeCommunication";
import { INativeMessagePoster } from "./INativeMessagePoster";
import { WacOutgoingNativeMessage } from "../common/MessagingModel";
import { ConfigurationManager } from "./ConfigurationManager";
import { ITabsMonitoring } from "./ITabsMonitoring";
import MessageSender = chrome.runtime.MessageSender;
import ExtensionInfo = chrome.management.ExtensionInfo;

/**
 * Default response with all features.
 */
const GREETING_RESPONSE: Readonly<GreetingResponse & { features: ReadonlyArray<string>; }> = {
	messageType: "GreetingResponse",
	features: ["HTMLEvents", "Visibility"]
};

const FAREWELL_RESPONSE: Readonly<FarewellResponse> = {
	messageType: "FarewellResponse",
};

const NOT_ACTIVE_RESPONSE: Readonly<NotActiveResponse> = {
	messageType: "NotActiveResponse"
};

const WAC_EXTENSION_IDS: ReadonlyArray<string> = [
	"poffncjphkchclemkfpadkjfgkbfkafp",
	"cdnnpklbhipmnknojapkdiocjgmplpcc",
	"nckjcpchnnejhldedgelopkoemdhdbbf"
];


const SUPPORTS_CHROME_MANAGEMENT = chrome.management != null;

/**
 * Communication between Agent extension and WAC
 */
export class WacCommunication implements IWacCommunication, IWacNativeCommunication {
	private active = false;
	private wacExtensionId?: string;
	private nativeMessagePoster?: INativeMessagePoster;
	private configurationManager?: ConfigurationManager;
	private tabsMonitoring?: ITabsMonitoring;

	public activate(nativeMessageSender: INativeMessagePoster, tabsMonitoring: ITabsMonitoring, configManager: ConfigurationManager): void {
		getLogger().trace("activate WacCommunication");
		if (this.active || !SUPPORTS_CHROME_MANAGEMENT) {
			return;
		}

		this.active = true;
		this.nativeMessagePoster = nativeMessageSender;
		this.tabsMonitoring = tabsMonitoring;
		this.configurationManager = configManager;

		if (chrome !== undefined && chrome.runtime !== undefined && chrome.runtime.onMessageExternal !== undefined) {
			// Unit tests run in page (not background) context, so chrome.runtime isn't available
			chrome.runtime.onMessageExternal.addListener(this.onMessageExternal);
			chrome.runtime.onMessage.addListener(this.onInjectedMessage);
		}
	}

	public isActive(): boolean {
		return this.active === true && this.wacExtensionId != null;
	}

	public deactivate(): void {
		getLogger().trace("deactivate WacCommunication");
		if (!this.active || !SUPPORTS_CHROME_MANAGEMENT) {
			return;
		}

		this.active = false;
		this.nativeMessagePoster = undefined;
		this.wacExtensionId = undefined;

		if (chrome !== undefined && chrome.runtime !== undefined && chrome.runtime.onMessageExternal !== undefined) {
			// Unit tests run in page (not background) context, so chrome.runtime isn't available
			chrome.runtime.onMessageExternal.removeListener(this.onMessageExternal);
			chrome.runtime.onMessage.removeListener(this.onInjectedMessage);
			chrome.management.onDisabled.removeListener(this.onDisabledListener);
		}
		getLogger().log("Sending farewell response");
		if (this.wacExtensionId != null) {
			this.sendMessageToWac(FAREWELL_RESPONSE);
		}
	}

	private readonly onInjectedMessage = ({messageType, message}: Partial<MessageFromInjected>, messageSender: MessageSender) => {
		if (messageType !== "MessageFromInjected" || message == null) {
			return;
		}

		if (messageSender.tab == null || messageSender.tab.id == null || messageSender.frameId == null) {
			return;
		}

		const sender: MessageAddressFrame = {
			browser: browserInfo.name,
			tabId: messageSender.tab.id,
			frameId: messageSender.frameId
		};
		this.sendMessageToWac({messageType, message, sender});
	};

	private readonly onTabRemoved = (tabId: number) => {
		this.sendMessageToWac({messageType: "TabRemoved", removed: {browser: browserInfo.name, tabId}});
	};

	private readonly onMessageExternal = async (message: WacOutgoing, sender: MessageSender) => {
		getLogger().log("Got message", message, sender);
		// Reply with error when manager is not active
		if (!this.active) {
			getLogger().log("Extension is not ready");
			return;
		}
		if (sender.id == null) {
			return;
		}

		if (!isExtensionMessage(message)) return;

		switch (message.messageType) {
			case "GreetingRequest":
				if (!validateGreetingRequest(message)) return;
				this.handleGreeting(sender.id, message);
				break;

			case "FarewellRequest":
				if (!validateFarewellRequest(message)) 	 return;
				this.handleFarewell(sender.id);
				break;

			case "MessageToInjected":
				getLogger().log("Sending exec script response");
				if (message.recipient.browser === BrowserType.IE) {
					this.sendToIE(message);
				}
				break;

			case "InjectNotificationsFrame":
				const {browser, tabId} = message.recipient;
				if (!(this.isBrowserChromiumBased(browser) && tabId != null)) {
					this.sendToIE({
						messageType: "InjectNotificationsFrame",
						recipient: message.recipient
					});
				}
				break;

			case "ConfigurationUpdate":
				getLogger().log("ConfigurationUpdate received");
				if (!validateConfigurationUpdate(message)) return;
				if (this.configurationManager != null) {
					this.configurationManager.setWacConfiguration(message.eventConditions);
					this.handleConfigurationUpdate(message);
				}
				break;
		}
	};

	public sendMessageToWac(message: WacIncoming): void {
		if (this.wacExtensionId == null) {
			throw new Error("Not connected to Wac Extension");
		}
		const promise = chrome.runtime.sendMessage(this.wacExtensionId, message);
	}

	public isBrowserChromiumBased(browserName: string): boolean {
		return (browserName === BrowserType.Chrome || browserName === BrowserType.Edge);
	}

	private readonly onDisabledListener = (disabledExtInfo: ExtensionInfo) => {
		if (disabledExtInfo.id === this.wacExtensionId) {
			this.handleFarewell(disabledExtInfo.id);
		}
	};

	private handleGreeting(extId: string, greetingRequest: GreetingRequest): void {
		this.wacExtensionId = extId;
		chrome.tabs.onRemoved.addListener(this.onTabRemoved);

		chrome.management.onDisabled.addListener(this.onDisabledListener);

		this.sendToIE(greetingRequest);
		if (this.configurationManager != null) {
			this.configurationManager.setWacActive(true);
		}
		getLogger().log("Sending greeting response", greetingRequest);
		this.sendMessageToWac(GREETING_RESPONSE);

		// todo (inject to all frames) or (send list of all tabs/frames to wac)
	}

	private handleFarewell(extId: string): void {
		// Unsubscribe to WAC disablement
		chrome.management.onDisabled.removeListener(this.onDisabledListener);
		chrome.tabs.onRemoved.removeListener(this.onTabRemoved);

		// Forward to IE
		this.sendToIE({messageType: "FarewellRequest"});

		// todo: Forward to frames

		getLogger().log("Sending farewell response");
		this.sendMessageToWac(FAREWELL_RESPONSE);
		this.wacExtensionId = undefined;
		if (this.configurationManager != null) {
			this.configurationManager.setWacActive(false);
		}
	}

	private handleConfigurationUpdate(message: WacOutgoing): void {
		this.sendToIE(message);
		getLogger().log("Sending Configuration Update To IE");
	}

	private isNavigationFinished(httpStatusCode?: number): boolean {
		if (httpStatusCode === undefined) return false;

		if (httpStatusCode === 304) {
			// Special case, https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304 :
			// "no need to retransmit the requested resources. It is an implicit redirection to a cached resource"
			return true;
		}
		if (httpStatusCode < 200 || httpStatusCode >= 300) {
			return false;
		}
		return true;
	}


	public readonly onWebNavigation = (
		event: WebNavigationEvent,
		details: chrome.webNavigation.WebNavigationCallbackDetails,
		frameState?: FrameState | null,
		tabState?: FrameState | null) => {

		if (tabState == null || frameState == null) {
			return;
		}

		if (!this.isNavigationFinished(tabState.statusCode)) {
			return;
		}
		if (this.wacExtensionId == null) {
			return;
		}
		if (event !== "Completed" || frameState.committedUrl == null) {
			return;
		}
		if (this.tabsMonitoring == null) {
			return;
		}

		const tabId = tabState.tabId;
		const frameId = frameState.frameId;
		const frameCurrentUrl = frameState.currentUrl;
		const frameUrl = frameState.startUrl;
		const frameCommittedUrl = frameState.committedUrl;
		const tabMonitoringState = this.tabsMonitoring.getTabState(tabId);
		if (tabMonitoringState == null) {
			throw new Error(`No tab state in tabId ${tabId}`);
		}

		this.sendMessageToWac({
			messageType: "ContentInjected",
			frameInfo: {
				title: tabMonitoringState.title,
				browser: browserInfo.name,
				frameId,
				tabId,
				frameCurrentUrl,
				frameUrl,
				frameCommittedUrl
			}
		});
	}

	public incomingMessage(message: WacIncoming): void {
		if (!isExtensionMessage(message)) {
			return;
		}
		this.sendMessageToWac(message);
	}

	private sendToIE(message: WacOutgoing): void {
		if (this.nativeMessagePoster == null) {
			console.error(new Error("Unable to exec script in 'InternetExplorer': No nativeMessagePoster"));
		} else {
			this.nativeMessagePoster.postNativeMessage(new WacOutgoingNativeMessage(message));
		}
	}
}
