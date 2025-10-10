"use strict";

import { getLogger } from "../utils/log";
import { enableLogs } from "../utils/log";
import * as EventNames from "../HtmlMonitoring/EventNames";
import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { ITabsMonitoring } from "./ITabsMonitoring";
import { IWebRequest } from "./IWebRequest";
import { IWebNavigation } from "./IWebNavigation";
import { WEB_REQUEST_EVENT_NAMESPACE } from "./WebRequest";
import * as IdleMonitoring from "./IdleMonitoring";
import * as WindowsMonitoring from "./WindowsMonitoring";
import * as DownloadsMonitoring from "./DownloadsMonitoring";
import { timeProvider } from "../utils/timeProvider";
import { ReadonlyConfigurationData, REPORT_EVERYTHING_CONFIGURATION, REPORT_WPM_CONFIGURATION } from "../common/ConfigurationData";
import { IIdleMonitoring } from "./IIdleMonitoring";
import { IWindowsMonitoring } from "./IWindowsMonitoring";
import { IHtmlEventsMonitoring } from "./IHtmlEventsMonitoring";
import { IWacCommunication } from "./IWacCommunication";
import { IDownloadsMonitoring } from "./IDownloadsMonitoring";
import { WebNavigationReporter } from "./WebNavigationReporter";
import { ConfigurationManager } from "./ConfigurationManager";
import { Configuration } from "../common/configuration/Configuration";
import { MessageProcessor } from "./MessageProcessor";

// Hack to imitate getters which don't exist in old IE
type BackgroundMutableManager = { active: boolean; };

/**
 * Manages all subscriptions
 */
export class BackgroundManager implements IBackgroundManager {
	public readonly active: boolean = false;
	private isConnectionTimeoutActive: boolean = false;
	private timeoutId: NodeJS.Timer | null = null;
	private messageProcessor?: MessageProcessor;

	private readonly webNavigationReporter: WebNavigationReporter;

	constructor(
		private readonly communication: IAgentCommunication,
		private readonly configurationManager: ConfigurationManager,
		private readonly tabsMonitoring: ITabsMonitoring,
		private readonly webRequest: IWebRequest,
		private readonly webNavigation: IWebNavigation,
		private readonly windowsMonitoring: IWindowsMonitoring,
		private readonly idleMonitoring: IIdleMonitoring,
		private readonly htmlEventsMonitoring: IHtmlEventsMonitoring,
		private readonly wacCommunication: IWacCommunication,
		private readonly downloadsMonitoring: IDownloadsMonitoring) {

		this.webNavigationReporter = new WebNavigationReporter(communication);
		enableLogs();

		this.connectToPort();
	}

	public getTabsMonitoring(): ITabsMonitoring {
		return this.tabsMonitoring;
	}

	public getMessageProcessor(): MessageProcessor | undefined {
		return this.messageProcessor;
	}

	public scheduleConnectAttempt(): void {
		if (this.isConnectionTimeoutActive) {
			getLogger().error("There is already a connection attempt.");
		} else {
			this.isConnectionTimeoutActive = true;
			const retryConnectMs = 60 * 1000;
			const dateObjWithOffset = new Date(timeProvider.now() + retryConnectMs);
			getLogger().info(`Scheduling another connection attempt on ${dateObjWithOffset}.`);
			if (this.timeoutId === null) {
				this.timeoutId = setTimeout(() => {
						this.isConnectionTimeoutActive = false;
						this.connectToPort();
						this.timeoutId = null;
					},
					retryConnectMs);
			}
		}
	}

	public connectToPort(): void {
		if (this.isConnectionTimeoutActive) {
			getLogger().error("it isn't allowed to try to connect");
		} else {
			getLogger().info("Trying to connect....");
			if (!this.communication.initCommunication(this, this.webNavigation)) {
				getLogger().warn("Failed");
				this.scheduleConnectAttempt();
			} else {
				getLogger().info("Success");
			}
		}
	}

	public activate(configuration: Configuration): void {
		if (this.active) {
			return;
		}

		getLogger().log("Activating");

		(this as BackgroundMutableManager).active = true;

		this.messageProcessor = new MessageProcessor(configuration);

		this.webNavigation.subscribe(this.webNavigationReporter.onWebNavigation);
		this.webNavigation.subscribe(this.wacCommunication.onWebNavigation);

		// HTML events monitoring
		const hasHtmlEventsMonitoring =
			configuration.isMonitoring(EventNames.HTML_DESIGNER_EVENT_NAMESPACE) ||
			configuration.isMonitoring(EventNames.HTML_ONAPP_EVENT_NAMESPACE) ||
			configuration.isMonitoring(EventNames.DOM_EVENT_NAMESPACE);

		const hasWebRequestMonitoring =
			hasHtmlEventsMonitoring ||
			configuration.hasWpmFilter() ||
			configuration.isMonitoring(WEB_REQUEST_EVENT_NAMESPACE);

		this.tabsMonitoring.initTabsMonitoring(this, this.communication, this.webRequest, this.webNavigation);

		if (hasWebRequestMonitoring) {
			this.webRequest.initWebRequest(this, this.communication, this.tabsMonitoring, this.configurationManager.getConfiguration());
		}

		if (configuration.isMonitoring(WindowsMonitoring.WINDOW_EVENT_NAMESPACE)) {
			this.windowsMonitoring.initWindowsMonitoring(this, this.communication);
		}

		if (configuration.isMonitoring(IdleMonitoring.IDLE_EVENT_NAMESPACE)) {
			this.idleMonitoring.initIdleMonitoring(this, this.communication);
		}

		if (configuration.isMonitoring(DownloadsMonitoring.DOWNLOADS_EVENT_NAMESPACE)) {
			if (typeof chrome.downloads === "object") {
				this.downloadsMonitoring.initDownloadsMonitoring(this, this.communication);
			}
		}

		if (hasHtmlEventsMonitoring) {
			this.htmlEventsMonitoring.initEventsMonitoring(this.tabsMonitoring);
		}
	}

	public deactivate(): void {
		if (!this.active) {
			return;
		}

		getLogger().log("Deactivating");

		this.webNavigation.unsubscribe(this.webNavigationReporter.onWebNavigation);

		(this as BackgroundMutableManager).active = false;

		// Deactivate all
		this.tabsMonitoring.uninitTabsMonitoring();
		this.webRequest.uninitWebRequest();
		this.windowsMonitoring.uninitWindowsMonitoring();
		this.idleMonitoring.uninitIdleMonitoring();
		this.htmlEventsMonitoring.uninitEventsMonitoring();
		this.downloadsMonitoring.uninitDownloadsMonitoring();
	}

	public reportEverything(): void {
		this.changeConfiguration(REPORT_EVERYTHING_CONFIGURATION);
	}

	public reportAllWpm(): void {
		this.changeConfiguration(REPORT_WPM_CONFIGURATION);
	}

	public reportNothing(): void {
		this.deactivate();
	}

	private changeConfiguration(configData: ReadonlyConfigurationData): void {

		this.deactivate();
		this.isConnectionTimeoutActive = false;
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}

		const configuration = new Configuration(configData);
		this.activate(configuration);
		this.communication.initCommunication(this, this.webNavigation, false);
	}
}
