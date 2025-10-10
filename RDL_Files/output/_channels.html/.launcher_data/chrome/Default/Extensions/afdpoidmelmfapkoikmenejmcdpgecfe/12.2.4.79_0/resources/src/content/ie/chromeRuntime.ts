// "use strict";
/*
import { IChromeRuntime } from "./IChromeRuntime";
import { getLogger } from "../../utils/log";
import { LogLevel } from "../../common/consts";
import * as ConfigurationUtils from "../../common/configuration/ConfigurationUtils";
import { ConfigurationData, ContentScriptParameters } from "../../common/ConfigurationData";
import { OutgoingPageNativeMessage, MessageType, OutgoingEventMessage, OutgoingLogMessage } from "../../common/MessagingModel";
import { UXData } from "../../common/UXData";
import { BackgroundPageInformation } from "../../common/PageInformation";
/*

// ReSharper disable once InconsistentNaming
// Aternity objects have weird names on purpose
/**
 * Send JSON message to the Agent.
 * @param {number} Timestamp of the message
 * @param {string} message to send.
 */
// declare function __AternitySendJsonMessage__$$(timestamp: number, message: string, window: Window): void;

// ReSharper disable once InconsistentNaming
// Aternity objects have weird names on purpose
/**
 * @returns {string} Page information as JSON string.
 */
// declare function __AternityGetPageInformation_$$(): string;

// ReSharper disable once InconsistentNaming
// Aternity objects have weird names on purpose
/**
 * Retrieves current url of the window.
 *
 * @returns {string} window.location.href or empty string if cannot get url.
 */
// declare function __AternityGetWindowLocationHRef__$$(window: Window): string;

// ReSharper disable once InconsistentNaming
/**
 * Log into hooks.log
 *
 */
// declare function __AternityScriptLog__$$(log: LogLevel, str: string): void;

// tslint:disable-next-line
// let ATERNITY_CONFIGURATION: ConfigurationData;

// tslint:disable-next-line no-any
// (window as any)["__AternityWacConfigurationUpdate__$$"] = (configuration: string) => onConfigurationUpdate(configuration);
/*
try {
	// Will be here var ATERNITY_CONFIGURATION = { ... };
	// ReSharper disable once WrongExpressionStatement
	"ATERNITY_CONFIGURATION_PLACEHOLDER";
} catch (e) {
	getLogger().error("Configuration is invalid", e);
}
*/

// Placeholder to be initialized with correct Agent build.
// const IE_ADDON_VERSION = "0.0.0.0";
/*
function assertNonNullObject<T extends object>(obj: T): void {
	for (const key in obj) {
		if (!obj.hasOwnProperty(key)) continue;

		if (obj[key] == null) {
			throw new Error(`${key} is null`);
		}
	}
}
*/
// type Callback = (config: ContentScriptParameters) => void;
// export const configurationChange: { callback: null | Callback } = {callback: null};

/*function onConfigurationUpdate(configuration: string): void {
	ATERNITY_CONFIGURATION = (JSON.parse(configuration)) as ConfigurationData;
	if (configurationChange.callback !== null) {
		// tslint:disable-next-line no-any
		const parameters: ContentScriptParameters = buildContentScriptParameters();
		configurationChange.callback(parameters);
	}
}*/

/*function buildContentScriptParameters(): ContentScriptParameters {

	const pageInfo = __AternityGetPageInformation_$$();
	if (pageInfo == null) {
		getLogger().error("__AternityGetPageInformation_$$ didn't return meaningful value. " +
			"Cannot inspect events.");
	}
	*/
	// tslint:disable-next-line no-unsafe-any
	/* const parsedPageInfo: BackgroundPageInformation = JSON.parse(pageInfo);
	assertNonNullObject(parsedPageInfo);

	const documentUrl = parsedPageInfo.documentUrl;
	const documentCommittedUrl = parsedPageInfo.documentCommittedUrl;
	const parameters: ContentScriptParameters = {
		configurationData:
			ConfigurationUtils.getEventsForPage(
				ATERNITY_CONFIGURATION,
				{documentUrl, documentCommittedUrl}),
		statusCode: 200,
		pageInformation: parsedPageInfo,
		wpmParameters: {
			wpm: false,
			httpWebPageLoad: false
		},
		// To enable logs in IE content - add log_1.enableLogs() in the main function of  C:\ProgramData\Aternity\hooks\addon.js
	};
	return parameters;
}*/

/*
export class ChromeRuntime implements IChromeRuntime {
	public lastError?: chrome.runtime.LastError;

	public getManifest(): chrome.runtime.Manifest {
		return {
			manifest_version: 2,
			name: "Aternity IE Addon for Agent",
			version: IE_ADDON_VERSION
		};
	}

	public sendMessage(
		message: Partial<OutgoingPageNativeMessage>,
		responseCallback?: (response: unknown) => void): void {

		setTimeout(() => this.dispatchMessage(message, responseCallback), 0);
	}

	private dispatchMessage<T>(
		message: Partial<OutgoingPageNativeMessage>,
		responseCallback?: (response: unknown) => void): void {

		getLogger().log("Sending message", message);

		const type = message.messageType;

		switch (type) {
			case MessageType.CONTENT_SCRIPT_LOAD:
				this.handleContentScriptLoadMessage(message as OutgoingEventMessage<UXData>, responseCallback);
				break;
			case MessageType.EVENT:
				this.handleEventMessage(message as OutgoingEventMessage<UXData>, responseCallback);
				break;
			case MessageType.LOG:
				this.handleLogMessage(message as OutgoingLogMessage);
				break;
		}
	}*/

/*
	private handleContentScriptLoadMessage(
		message: OutgoingEventMessage<UXData>,
		responseCallback?: (response: unknown) => void): void {

		if (responseCallback == null) {
			return;
		}

		if (typeof ATERNITY_CONFIGURATION === "undefined" || ATERNITY_CONFIGURATION == null) {
			getLogger().error("ATERNITY_CONFIGURATION is not defined. " +
				"Cannot inspect events.",
				JSON.stringify(message.messageData));
			return;
		}

		try {
			if (typeof __AternityGetPageInformation_$$ === "undefined" ||
				__AternityGetPageInformation_$$ == null) {
				getLogger().error("__AternityGetPageInformation_$$ is not defined. " +
					"Cannot inspect events.",
					JSON.stringify(message.messageData));
			}
			const parameters: ContentScriptParameters = buildContentScriptParameters();

			window.setTimeout(() => responseCallback(parameters), 0);
		} catch (e) {
			getLogger().error(
				"Unexpected error occurred. Cannot inspect events.",
				JSON.stringify(message.messageData),
				`${e}`);
		}
	}

	private handleLogMessage(
		logMessage: OutgoingLogMessage): void {

		if (typeof __AternityScriptLog__$$ !== "undefined" && __AternityScriptLog__$$ != null) {
			__AternityScriptLog__$$(logMessage.level, `{${logMessage.timeStamp}} ${logMessage.message}`);
		}
	}

	private handleEventMessage(
		message: OutgoingEventMessage<UXData>,
		responseCallback?: (response: unknown) => void): void {

		if (typeof __AternitySendJsonMessage__$$ === "undefined" ||
			__AternitySendJsonMessage__$$ === null) {
			getLogger().error("__AternitySendJsonMessage__$$ is not defined. " +
				"Cannot send message to agent.",
				JSON.stringify(message.messageData));
			return;
		}

		// Add current urls
		// If top level window, use current url.
		const currentUrl = document.URL;
		const messageData = message.messageData.Data[0];

		messageData["frameCurrentUrl"] = currentUrl;
		if (window === window.top) {
			messageData["documentCurrentUrl"] = currentUrl;
		} else {
			const documentCurrentUrl = __AternityGetWindowLocationHRef__$$(window.top);
			messageData["documentCurrentUrl"] = documentCurrentUrl != null ? documentCurrentUrl : currentUrl;
		}

		if (typeof message.timeStamp === "number") {
			messageData["timeStamp"] = message.timeStamp;
			__AternitySendJsonMessage__$$(message.timeStamp, JSON.stringify(message.messageData), window);
			return;
		}

		// timeProvider produces Date.now(), which is officially a number. However there were support cases where
		// IE started producing Date objects instead, and this is the mitigation.

		// Log the type error
		const errMsg = {
			msg: "message.timeStamp type is different than number",
			type: typeof message.timeStamp,
			timestamp: message.timeStamp
		};
		this.handleLogMessage(new OutgoingLogMessage(LogLevel.WARN, JSON.stringify(errMsg)));

		// Send with a fallback type
		interface IHasGetTime {
			getTime?: () => number;
		}
		const t = message.timeStamp as IHasGetTime;
		if (t.getTime !== undefined) {
			messageData["timeStamp"] = t.getTime();
			__AternitySendJsonMessage__$$(t.getTime(), JSON.stringify(message.messageData), window);
		}
	}
	*/
/*
	public readonly onMessage = {
		addListener<T>(callback: (p: T) => void): void {
			throw new Error("not implemented");
		}
	};
}
*/
