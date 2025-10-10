"use strict";

import { browserInfo } from "../utils/browserInfo";
import { EXTENSION_VERSION, LogLevel } from "./consts";
import { timeProvider } from "../utils/timeProvider";
import { deepClone } from "../utils/utils";
import { UXData } from "./UXData";
import { ExtensionMessage } from "../background/WacAPI";


/**
 * Message from background to content script.
 */
export enum ContentMessageType {
	RECONFIGURE = "reconfigure",
	UNINITIALIZE = "uninitialize"
}

/**
 * Chrome only messages between background and content scripts
 */
export enum ChromeContentMessageType {
	DOCUMENT_TITLE_UPDATE = "documentTitleUpdate",
	DOCUMENT_TITLE_REQUEST = "documentTitleRequest",
	DOCUMENT_TITLE_RESPONSE = "documentTitleResponse"
}

/**
 * Background -> Content
 */
export interface ChromeDocumentTitleRequest {
	messageType: ChromeContentMessageType.DOCUMENT_TITLE_REQUEST;
}

/**
 * Content -> Background
 */
export interface ChromeDocumentTitleResponse {
	messageType: ChromeContentMessageType.DOCUMENT_TITLE_RESPONSE;
	documentTitle: string;
}

/**
 * Background -> Content
 */
export interface ChromeDocumentTitleUpdate {
	messageType: ChromeContentMessageType.DOCUMENT_TITLE_UPDATE;
	documentTitle: string;
}

export enum MessageType {
	EVENT = "event",
	LOG = "log",
	WPM_PAGELOAD_EVENT = "wpmpageloadevent",
	WPM_ERROR_EVENT = "wpmerrorevent",
	CONTENT_SCRIPT_LOAD = "contentscriptload",
	GET_STATUS_CODE = "getstatuscode",
	WAC_FROM_INJECTED = "MessageFromInjected",
	WAC_TO_IE = "wac2ie"
}

/**
 *
 * Messages from content script to background
 */
export const CONTENT_MESSAGES: ReadonlyArray<MessageType> = [
	MessageType.WAC_FROM_INJECTED,
	MessageType.CONTENT_SCRIPT_LOAD,
	MessageType.GET_STATUS_CODE
];


const HTTP_CHROME_WEBPAGE_PAGELOAD = "http:chrome:WebPage.PageLoad";
const WPM_PAGE_LOAD_UX = "wpm:chrome:Page.Load";
export const WPM_PAGE_ERROR_UX = "wpm:chrome:Page.Error";
export const NV_CHROME_WORKTIME_VIOLATION = "nv:chrome:WorkTime.Violation";

export abstract class OutgoingBaseNativeMessage {
	protected constructor(public messageType: MessageType, public timeStamp: number) {
		this.browserName = browserInfo.name;
		this.browserVersion = browserInfo.version;
		this.extensionVersion = EXTENSION_VERSION.getValue();
	}

	public readonly browserName: string;
	public readonly browserVersion: string;
	public readonly extensionVersion: string;

	public order?: number;
}

export abstract class OutgoingPageNativeMessage extends OutgoingBaseNativeMessage {
	protected constructor(public messageType: MessageType, public timeStamp: number) {
		super(messageType, timeStamp);
	}

	public tabId?: number;
	public frameId?: number;
	public isMainFrame?: boolean;
	public windowUrl?: string;
}

export interface OutgoingEventMessageData<T extends {}> {
	// ReSharper disable once InconsistentNaming
	EventType: string;
	// ReSharper disable once InconsistentNaming
	// tslint:disable-next-line readonly-array
	Data: T[];
}

export class OutgoingEventMessage<T extends UXData> extends OutgoingPageNativeMessage {
	public messageData: OutgoingEventMessageData<T>;

	constructor(eventType: string, timeStamp: number) {
		super(MessageType.EVENT, timeStamp);
		this.messageData = {
			EventType: eventType,
			// tslint:disable-next-line no-any
			Data: [({}) as any as T]
		};
	}
}

export class WacOutgoingNativeMessage<T extends ExtensionMessage> extends OutgoingPageNativeMessage {
	constructor(public readonly wacMessageData: T) {
		super(MessageType.WAC_TO_IE, timeProvider.now());
	}
}

export interface WebPerformanceTiming {
// ReSharper disable InconsistentNaming
	ResponseTime: number;
	ActivityResponse: number;
	TCPConnectTime: number;
	RedirectTime: number;
	DNSTime: number;
	RequestTime: number;
	ProcessingTime: number;
	LoadTime: number;
	ClientTime: number;
	TotalNetworkResponseTime: number;
// ReSharper restore InconsistentNaming

	navigationStart: number;
	unloadEventStartOffset: number;
	unloadEventEndOffset: number;
	redirectStartOffset: number;
	redirectEndOffset: number;
	fetchStartOffset: number;
	domainLookupStartOffset: number;
	domainLookupEndOffset: number;
	connectStartOffset: number;
	connectEndOffset: number;
	secureConnectionStartOffset: number;
	requestStartOffset: number;
	responseStartOffset: number;
	responseEndOffset: number;
	domLoadingOffset: number;
	domInteractiveOffset: number;
	domContentLoadedEventStartOffset: number;
	domContentLoadedEventEndOffset: number;
	domCompleteOffset: number;
	loadEventStartOffset: number;
	loadEventEndOffset: number;
}

export interface WebPageContext {
	// #region Context

	url: string;
	title: string;

	type: string;
	statusCode: number;
	tabId: number;
	frameId: number;

	documentUrl: string;
	documentCommittedUrl: string;
	documentTitle: string;

	// #endregion

	// #region OPARX

	serverURL: string;
	userId: string;
	pageId: string;
	aixId: string;

	// #endregion
}

/**
 * chrome:http:WebPage.PageLoad
 */
export interface HttpWebPageLoadEventData extends UXData, WebPageContext {
	// #region WPM

	navigationStart: number;
	unloadEventStartTime: number;
	unloadEventEndTime: number;
	redirectStartTime: number;
	redirectEndTime: number;
	fetchStartTime: number;
	domainLookupStartTime: number;
	domainLookupEndTime: number;
	connectStartTime: number;
	connectEndTime: number;
	secureConnectionStartTime: number;
	requestStartTime: number;
	responseStartTime: number;
	responseEndTime: number;
	domLoadingTime: number;
	domInteractiveTime: number;
	domContentLoadedEventStartTime: number;
	domContentLoadedEventEndTime: number;
	domCompleteTime: number;
	loadEventStartTime: number;
	loadEventEndTime: number;

	// #endregion
}

interface WpmPageLoadUXEventData extends UXData, WebPerformanceTiming, WebPageContext {
}

interface WpmPageErrorUXEventData extends UXData, WebPageContext {
}

export class OutgoingHttpChromeWebPageLoadEventMessage extends OutgoingEventMessage<HttpWebPageLoadEventData> {
	constructor(timeStamp: number) { super(HTTP_CHROME_WEBPAGE_PAGELOAD, timeStamp); }
}

export class OutgoingWpmPageLoadUXMessage extends OutgoingEventMessage<WpmPageLoadUXEventData> {
	constructor() { super(WPM_PAGE_LOAD_UX, performance.timing.loadEventEnd); }
}

export class OutgoingWpmPageErrorUXMessage extends OutgoingEventMessage<WpmPageErrorUXEventData> {
	constructor() { super(WPM_PAGE_ERROR_UX, performance.timing.loadEventEnd); }
}

// ReSharper disable once InconsistentNaming
export interface NVWorkTimeViolationEventData extends UXData {
	description: string;
	backoffInterval: number;
	maxWorkTime: number;
	timeFrame: number;
	totalRunningTime: number;
	totalSelectors: number;
	processedSelectors: number;
	lastProcessedSelector: string;
	longestSelector: string;
	longestSelectorTime: number;
}

// ReSharper disable once InconsistentNaming
export class OutgoingNVWorkTimeViolationUXMessage extends OutgoingEventMessage<NVWorkTimeViolationEventData> {
	constructor(nvViolationData: NVWorkTimeViolationEventData) {
		super(NV_CHROME_WORKTIME_VIOLATION, timeProvider.now());
		this.messageData.Data = [deepClone(nvViolationData) as NVWorkTimeViolationEventData];
	}
}

export class OutgoingWpmPageLoadEventMessage extends OutgoingPageNativeMessage {
	constructor(
		public title: string,
		public url: string,
		public responseTime: number,
		public activityResponse: number,
		public tcpConnectTime: number,
		public redirectTime: number,
		public dnsTime: number,
		public requestTime: number,
		public processingTime: number,
		public loadTime: number,
		public totalNetworkResponseTime: number,
		public totalNetworkServerTime: number,
		public clientTime: number,
		public serverURL: string,
		public userId: string,
		public pageId: string,
		public aixId: string) {
		super(MessageType.WPM_PAGELOAD_EVENT, performance.timing.loadEventEnd);
	}
}

export class OutgoingWpmErrorEventMessage extends OutgoingPageNativeMessage {
	constructor(
		public url: string,
		public targetFrameName: string,
		public statusCode: number) {
		super(MessageType.WPM_ERROR_EVENT, performance.timing.loadEventEnd);
	}
}

export class OutgoingLogMessage extends OutgoingPageNativeMessage {
	public level: LogLevel;
	public message: string;

	constructor(level: LogLevel, message: string) {
		super(MessageType.LOG, timeProvider.now());
		this.level = level;
		this.message = EXTENSION_VERSION.getValue() + ": " + message;
	}
}
