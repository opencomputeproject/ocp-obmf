"use strict";

import { getLogger } from "../utils/log";
import { doAfterWindowLoad } from "../dom/DomUtils";
import { reportWpm } from "./chrome/wpm";
import { initializeAppInternals } from "./chrome/AppInternals";
// import { chrome } from "../common/globalChrome";
import { isInternetExplorer } from "../utils/utils";
import { ContentManager } from "./ContentManager";
import { ContentScriptParameters } from "../common/ConfigurationData";
import { MessageType, ContentMessageType } from "../common/MessagingModel";
// import { configurationChange } from "./ie/chromeRuntime";

// Make logging globally visible
export { enableLogs, disableLogs } from "../utils/log";
export { bypassExecLimit } from "../performance/ExecutionLimiter";

export let manager: ContentManager | undefined;

function getStatisticsLogger(): Console {
	return window.console;
}

function uninitializeManager(): void {
	if (manager != null) {
		manager.uninitialize();
		manager = undefined;
	}
}

function initializeManager(parameters: ContentScriptParameters): void {
	uninitializeManager();
	manager = new ContentManager(parameters);
}

let timerId = 0;

export function showRunningStatistics(interval: number, taggedStatistics: boolean = false): void {
	if (manager == null) {
		getStatisticsLogger().warn("Manager is not initialized");
		return;
	}

	if (timerId !== 0) {
		getStatisticsLogger().info("Already showing statistics");
		return;
	}

	getStatisticsLogger().log(`Show statistics each ${interval}ms`);

	function timerShowStatistics(): void {
		if (manager != null) {
			if (taggedStatistics) {
				getStatisticsLogger().log(manager.getTaggedStatistics());
			} else {
				getStatisticsLogger().log(manager.getStatistics());
			}
		}

		timerId = window.setTimeout(timerShowStatistics, interval);
	}

	timerId = window.setTimeout(timerShowStatistics, interval);
}

export function hideRunningStatistics(): void {
	getStatisticsLogger().log("Hiding statistics");
	window.clearTimeout(timerId);
	timerId = 0;
}

export function invokeWithMainParametersAsync(managerInitFunc: (parameters: ContentScriptParameters) => void): void {
	getLogger().info("Asking for parameters from background");
	try {
		const messageParameters = { messageType: MessageType.CONTENT_SCRIPT_LOAD };

		chrome.runtime.sendMessage(
			messageParameters,
			(contentScriptParams: ContentScriptParameters) => {
				try {
					if (chrome.runtime.lastError == null) {
						getLogger().info("Got main parameters");
						// tslint:disable no-unsafe-any
						managerInitFunc(contentScriptParams);
					} else {
						getLogger().warn("Background script is not ready, not monitoring");
					}
				} catch (ee) {
					getLogger().error("Failed handling parameters from background", ee, contentScriptParams);
				}
			});
	} catch (e) {
		getLogger().error("Couldn't run script from background", e);
	}
}

function subscribeBackgroundMessages(): void {
	chrome.runtime.onMessage.addListener( (message) => {
		if (typeof message !== "string") return;

		try {
			getLogger().info("Received message from background", message);

			switch (message) {
				case ContentMessageType.RECONFIGURE:
					invokeWithMainParametersAsync(initializeManager);
					break;
				case ContentMessageType.UNINITIALIZE:
					uninitializeManager();
					break;
				default:
					getLogger().warn("Unknown message from background", message);
					break;
			}
		} catch (e) {
			getLogger().error("Message handling failed", e, message);
		}
	});
}

function initialize(parameters: ContentScriptParameters): void {
	try {
		if (parameters == null) {
			getLogger().error("No callback parameters arrived from background script");
			return;
		}

		initializeManager(parameters);

		// WPM only for Chrome
		if (!isInternetExplorer) {
			doAfterWindowLoad(() => reportWpm(parameters));
		}
	} catch (e) {
		getLogger().error("Initialization failed", e);
	}
}

const WAC_FRAME_ID = "AternityWacNotificationsFrame";

function main(): void {
	try {
		// if this is a WAC frame - do nothing
		try {
			if (window.frameElement != null && window.frameElement.id === WAC_FRAME_ID) {
				return;
			}
		} catch (e) {
			// There was a case in IE where accessing window.frameElement threw an access exception
			getLogger().warn("frameElement.id test failed", e);
		}

		// Chrome only features
		if (!isInternetExplorer) {
			subscribeBackgroundMessages();
			initializeAppInternals();
		}
		/*
		if (isInternetExplorer) {
			configurationChange.callback = (parameters => initialize(parameters));
		}
		*/
		invokeWithMainParametersAsync(initialize);
	} catch (e) {
		getLogger().error("main failed", e);
	}
}

main();
