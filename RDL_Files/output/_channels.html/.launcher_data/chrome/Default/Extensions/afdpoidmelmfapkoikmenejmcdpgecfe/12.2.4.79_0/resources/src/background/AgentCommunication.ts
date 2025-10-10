"use strict";

import * as Utils from "../utils/utils";
import * as Pako from "pako";
import * as Consts from "../common/consts";
import { getLogger } from "../utils/log";
import { isSerializablePrimitive, setIfNotExist } from "../utils/utils";
import { getFrameType } from "../common/FrameType";
import { getNativeMessageOrder } from "./MessageOrder";
import * as NativeMessaging from "./NativeMessaging";
import { IncomingAction, IncomingNativeMessage, NativeConfigurationMessage } from "./NativeMessaging";
import { IAgentCommunication, PostNativeMessageOptions } from "./IAgentCommunication";
import { IBackgroundManagerController } from "./IBackgroundManagerController";
import { IWebNavigation } from "./IWebNavigation";
import {
	CONTENT_MESSAGES,
	MessageType,
	WPM_PAGE_ERROR_UX,
	NV_CHROME_WORKTIME_VIOLATION,
	OutgoingBaseNativeMessage,
	OutgoingEventMessage,
	OutgoingEventMessageData,
	OutgoingLogMessage,
	OutgoingPageNativeMessage
} from "../common/MessagingModel";

import { UXData } from "../common/UXData";
import { ContentPageInformation } from "../common/PageInformation";
import { IWacNativeCommunication } from "./IWacNativeCommunication";
import { ConfigurationManager } from "./ConfigurationManager";
import { WacEventReporter } from "./WacEventReporter";
import MessageSender = chrome.runtime.MessageSender;
import { WacCommunication } from "./WacCommunication";
import { DOWNLOADS_EVENT_NAMESPACE } from "./DownloadsMonitoring";
import { browserInfo } from "../utils/browserInfo";
import { BrowserType } from "./WacAPI";

export class AgentCommunication implements IAgentCommunication {
	constructor(private readonly wacNativeCommunication: IWacNativeCommunication,
				private readonly configurationManager: ConfigurationManager,
				private readonly wacCommunication: WacCommunication,
				private readonly wacEventReporter: WacEventReporter) {
	}

	private nativeMessagingPort?: chrome.runtime.Port;
	private disconnectCallback?: (() => void);

	private manager?: IBackgroundManagerController;
	private webNavigation?: IWebNavigation;

	private static readonly HOST_NAME = "com.aternity.fpi";

	// tslint:disable-next-line no-any
	private readonly onNativeMessage = (message?: any) => {
		getLogger().log("message", message);
		if (this.manager == null) {
			return;
		}

		// Validate parameters
		if (message == null) {
			getLogger().error("Invalid request, no parameters");
			return;
		}

		let incomingMessage: Partial<IncomingNativeMessage> = {};
		if (typeof message !== "object") {
			getLogger().error("Invalid request, not object type");
			return;
		}
		incomingMessage = message as Partial<IncomingNativeMessage>;
		if (incomingMessage.version !== NativeMessaging.INCOMING_VERSION) {
			getLogger().error("Incoming message version is not supported", incomingMessage);
			return;
		}

		switch (incomingMessage.type) {
			case IncomingAction.Configuration:
				/* tslint:disable no-unsafe-any */
				const encoded = JSON.parse((incomingMessage as NativeConfigurationMessage).data).Configuration;
				const decoded = atob(encoded);
				// Unzip data
				// ReSharper bug: The cast is must to get string return type.
				// tslint:disable-next-line no-object-literal-type-assertion
				const unzippedJson = Pako.inflate(Utils.binstring2Buf(decoded), {to: "string"} as { to: "string"; });
				this.configurationManager.setAgentConfiguration(unzippedJson);
				break;
			case IncomingAction.Deactivate:
				this.manager.deactivate();
				break;

			case IncomingAction.WacMessage:
				if (message.message == null) {
					getLogger().log("Incoming WAC message has null data", incomingMessage);
					// return;
				} else {
					if (typeof message.message === "string") {
						message.message = JSON.parse(message.message);
					}
				}

				this.wacNativeCommunication.incomingMessage(message);
				break;
			default:
				getLogger().error("Unsupported message", message);
		}
	};

	/** Forward message from content to native */

		// tslint:disable-next-line no-any
	private readonly onRuntimeMessage = (message: any, sender: MessageSender, sendResponse: Function) => {
		if (message.messageType == null || CONTENT_MESSAGES.indexOf(message.messageType) !== -1) return;

		// Enrich it with tabId and frameId
		if (sender != null) {
			if (sender.tab != null) {
				message.tabId = sender.tab.id;
			}
			if (typeof (sender.frameId) !== "undefined") {
				message.frameId = sender.frameId;
			}
		}

		if (this.validateMessageStructure(message)) {
			this.postNativeMessage(message);
		} else {
			getLogger().error("Message structure is not according to protocol.", message);
			return;
		}
	};

	// tslint:disable-next-line no-any
	public validateMessageStructure(message: any): message is OutgoingPageNativeMessage {
		if (typeof message.messageType !== "string") {
			return false;
		}

		if (typeof message.timeStamp !== "number") {
			return false;
		}

		// messageData either absent or array
		// See Data.OutgoingEventMessage and Data.OutgoingWpmPageLoadEventMessage for instance.
		const messageData = message.messageData;
		if (messageData === undefined) {
			return true;
		} else {
			const data = message.messageData.Data;

			if (!Array.isArray(data)) {
				return false;
			}

			// tslint:disable-next-line no-any
			return !data.some((d: any) => !this.validateMessageDataStructure(d));
		}
	}

	/* tslint:disable-next-line no-any no-unsafe-any */
	private validateMessageDataStructure(messageData: any): boolean {
		for (const propertyName in messageData) {
			if (!messageData.hasOwnProperty(propertyName)) continue;
			const value = messageData[propertyName];
			if (isSerializablePrimitive(value)) {
				continue;
			} else if (Array.isArray(value)) {
				// tslint:disable-next-line no-any
				if (value.some((element: any) => !isSerializablePrimitive(element))) {
					return false;
				}
			} else {
				return false;
			}
		}

		return true;
	}

	private onDisconnect(unsubscribeRuntimeMessage: boolean): void {
		getLogger().info("NMH disconnected");

		if (unsubscribeRuntimeMessage) {
			chrome.runtime.onMessage.removeListener(this.onRuntimeMessage);
		}

		if (this.nativeMessagingPort != null) {
			this.nativeMessagingPort.onMessage.removeListener(this.onNativeMessage);
			if (this.disconnectCallback != null) {
				this.nativeMessagingPort.onDisconnect.removeListener(this.disconnectCallback);
			}
		}

		this.disconnectCallback = undefined;
		this.nativeMessagingPort = undefined;

		// Reset configuration
		this.configurationManager.resetConfiguration();

		// Ask the manager to try to connect again...
		if (this.manager != null) {
			this.manager.scheduleConnectAttempt();
		}
	}

	private start(onlineConfiguration: boolean = true): chrome.runtime.Port | undefined {
		try {
			let port: chrome.runtime.Port | undefined = undefined;
			if (onlineConfiguration) {
				console.trace("Starting and connecting NMH");
				port = chrome.runtime.connectNative(AgentCommunication.HOST_NAME);
			}

			chrome.runtime.onMessage.removeListener(this.onRuntimeMessage);
			chrome.runtime.onMessage.addListener(this.onRuntimeMessage);

			if (this.disconnectCallback != null) {
				if (this.nativeMessagingPort != null) {
					this.nativeMessagingPort.onDisconnect.removeListener(this.disconnectCallback);
				}
			}

			if (onlineConfiguration && port != null) {
				port.onMessage.addListener(this.onNativeMessage);

				this.disconnectCallback = () => this.onDisconnect(onlineConfiguration);
				if (this.disconnectCallback != null) {
					port.onDisconnect.addListener(this.disconnectCallback);
				}
				getLogger().info("Connect");

				const message = "Connected extension with id " + chrome.runtime.id;
				port.postMessage(new OutgoingLogMessage(Consts.LogLevel.INFO, message));
			}

			return port;
		} catch (e) {
			getLogger().error("Cannot connect to native messaging. Pages are not monitored. ", e);

			return undefined;
		}
	}

	private stop(): void {
		if (this.nativeMessagingPort != null) {
			chrome.runtime.onMessage.removeListener(this.onRuntimeMessage);

			this.nativeMessagingPort.onMessage.removeListener(this.onNativeMessage);
			if (this.disconnectCallback != null) {
				this.nativeMessagingPort.onDisconnect.removeListener(this.disconnectCallback);
			}

			this.disconnectCallback = undefined;
			this.nativeMessagingPort = undefined;
		}
	}

	// todo: Idea, Move to class Reporter
	/**
	 * Post message to the native messaging host.
	 * WARNING: This private changes the object.
	 */
	public postNativeMessage(
		message: OutgoingBaseNativeMessage,
		options: PostNativeMessageOptions = {forcePost: false}): void {

		if (this.manager == null) {
			return;
		}

		const messageProcessor = this.manager.getMessageProcessor();
		if (messageProcessor == null) {
			return;
		}

		// Do not send messages if not activated. Log is exception.
		if (!this.manager.active && message.messageType !== MessageType.LOG) {
			return;
		}

		// Add data for event message
		if (message.messageType === MessageType.EVENT) {
			const messageData = (message as OutgoingEventMessage<UXData>).messageData;
			if (messageData == null) {
				return;
			}

			// Negative value messages are always sent
			if (messageData.EventType === NV_CHROME_WORKTIME_VIOLATION) {
				options.forcePost = true;
			}

			// Downloads events are only reported if they are configured
			if (Utils.startsWith(messageData.EventType, DOWNLOADS_EVENT_NAMESPACE)) {
				options.forcePost = true;
			}

			// Filter out unmonitored events
			if (!options.forcePost && !messageProcessor.isEventMonitored(messageData)) {
				return;
			}

			// Handle optional AppInternals information
			const pageMessage = message as Partial<OutgoingPageNativeMessage>;
			const tabId = pageMessage.tabId != null ? pageMessage.tabId : (messageData.Data[0]["tabId"] as number);
			const frameId = pageMessage.frameId != null ? pageMessage.frameId : (messageData.Data[0]["frameId"] as number);
			if (tabId != null && frameId != null) {
				this.addPageInformationProperties(tabId, frameId, messageData);
			}

			// WAC mode
			if (this.wacEventReporter.wacMode()) {
				this.wacEventReporter.reportToWac(pageMessage);
				return;
			}

			// Adjust the timestamp of the WPM page error message, since it can be timestamped earlier than the corresponding committed event
			if (messageData.EventType === WPM_PAGE_ERROR_UX) {
				const now = Date.now().valueOf();
				if (message.timeStamp < now) {
					message.timeStamp = now;
				}
			}

			messageProcessor.processMessageData(messageData, options);
			this.addAdditionalData(messageData);
			getLogger().log("Sending event to native", message.timeStamp, messageData);
		} else if (message.messageType === MessageType.WPM_PAGELOAD_EVENT ||
			message.messageType === MessageType.WPM_ERROR_EVENT) {
			getLogger().log("Sending wpm to native", message);
		} else if (message.messageType === MessageType.LOG) {
			getLogger().log("Logging", (message as OutgoingLogMessage).message);
		} else if (message.messageType === MessageType.WAC_TO_IE) {
			getLogger().log("Sending WACtoIE to native", message);
		} else {
			getLogger().warn("Unknown message type", message.messageType);
		}

		if (this.nativeMessagingPort != null) {
			// Set order only if wasn't set manually
			if (typeof message.order === "undefined") {
				message.order = getNativeMessageOrder();
			}
			this.nativeMessagingPort.postMessage(message);
		}
	}

	public initCommunication(
		manager: IBackgroundManagerController,
		webNavigation: IWebNavigation,
		onlineConfiguration: boolean = true): boolean {

		this.manager = manager;
		this.webNavigation = webNavigation;

		if (this.nativeMessagingPort !== undefined) {
			console.trace("Existing NMH found, disconnecting from previous NMH.");
			this.nativeMessagingPort.disconnect();
			this.nativeMessagingPort = undefined;
		}

		this.nativeMessagingPort = this.start(onlineConfiguration);
		this.configurationManager.initConfigurationManager(this.manager);
		if (this.wacCommunication.isBrowserChromiumBased(browserInfo.name)) { // see DE23408
			this.wacCommunication.activate(this, this.manager.getTabsMonitoring(), this.configurationManager);
		} else {
			getLogger().log("wacCommunication was not activated. Browser name in use: ", browserInfo.name);
		}

		if (this.nativeMessagingPort == null && onlineConfiguration) {
			console.trace("Failed connecting to native messaging port");
			return false;
		} else {
			getLogger().info("Succeeded connecting to native messaging port");
			console.trace("Succeeded connecting to native messaging port");
			return true;
		}
	}

	public uninitCommunication(): void {
		this.stop();
		this.wacCommunication.deactivate();
	}


	/**
	 * Add additional data to the message like extension version and any other information.
	 * This should never be trimmed since it is essential.
	 */
	private addAdditionalData(messageData: OutgoingEventMessageData<{}>): void {
		const eventData = messageData.Data[0] as { extensionVersion: string; };
		eventData.extensionVersion = Consts.EXTENSION_VERSION.getValue();
	}

	private addPageInformationProperties(
		tabId: number,
		frameId: number,
		messageData: OutgoingEventMessageData<UXData>): void {

		if (this.manager == null || this.webNavigation == null) {
			return;
		}

		const tabState = this.manager.getTabsMonitoring().getTabState(tabId);
		const frameState = frameId === 0 ? null : this.webNavigation.getFrame(tabId, frameId);
		const mainFrameState = this.webNavigation.getFrame(tabId, 0);

		const data: Partial<ContentPageInformation> = messageData.Data[0];

		// Ids
		setIfNotExist(data, "tabId", tabId);
		setIfNotExist(data, "frameId", frameId);
		setIfNotExist(data, "type", getFrameType(frameId));


		// Properties from main frame state
		if (mainFrameState != null) {
			setIfNotExist(data, "documentUrl", mainFrameState.startUrl);
			if (mainFrameState.committedUrl != null) {
				setIfNotExist(data, "documentCommittedUrl", mainFrameState.committedUrl);
			}

			if (frameId === 0) {
				// Frame properties
				setIfNotExist(data, "frameUrl", mainFrameState.startUrl);
				if (mainFrameState.committedUrl != null) {
					setIfNotExist(data, "frameCommittedUrl", mainFrameState.committedUrl);
				}
			}
		}

		// Properties from tab
		if (tabState != null) {
			setIfNotExist(data, "documentTitle", tabState.title);
			setIfNotExist(data, "documentCurrentUrl", tabState.currentUrl);

			if (frameId === 0) {
				// Context dependent properties
				setIfNotExist(data, "title", tabState.title);

				// Frame properties
				setIfNotExist(data, "frameTitle", tabState.title);
				setIfNotExist(data, "frameCurrentUrl", tabState.currentUrl);
			}
		}

		// Properties from frame state, only applicable to frames
		if (frameState != null) {
			setIfNotExist(data, "frameUrl", frameState.startUrl);
			if (frameState.committedUrl != null) {
				setIfNotExist(data, "frameCommittedUrl", frameState.committedUrl);
			}
			setIfNotExist(data, "frameCurrentUrl", frameState.currentUrl);
		}

		// Set documentCurrentUrl if wasn't set
		if (mainFrameState != null) {
			setIfNotExist(data, "documentCurrentUrl", mainFrameState.currentUrl);
		}
	}
}
