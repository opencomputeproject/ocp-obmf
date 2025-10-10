"use strict";

import { getLogger } from "../utils/log";
import { MessageType, OutgoingEventMessage, OutgoingPageNativeMessage } from "../common/MessagingModel";
import * as Consts from "../common/consts";
import * as Utils from "../utils/utils";
import { getNativeMessageOrder } from "./MessageOrder";
import { Configuration } from "../common/configuration/Configuration";
import { FrameState, TabsStates } from "./TabsState";
import { WebRequestsStates, WebRequestState } from "./WebRequestsState";
import { WebRequestEvent } from "./WebRequestEvent";
import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { ITabsMonitoring } from "./ITabsMonitoring";
import { IWebRequest } from "./IWebRequest";
import { UXData } from "../common/UXData";
import { ContentScriptParameters, WpmParameters, WpmStatusCodeResponse as ContentParameters } from "../common/ConfigurationData";
import webRequest = chrome.webRequest;
import HttpHeader = webRequest.HttpHeader;
import BlockingResponse = webRequest.BlockingResponse;
import RequestFilter = webRequest.RequestFilter;
import { sendMessageToTabWithLog } from "./tabs";
import { ContentMessageType } from "../common/MessagingModel";

export interface IWebRequestEventData extends UXData {
	// #region Generic event properties

	requestId: string;
	url: string;

	method: string;
	type: string;
	frameId: number;
	parentFrameId: number;
	tabId: number;

	frameUrl: string;
	frameCurrentUrl: string;
	frameCommittedUrl: string;
	documentUrl: string;
	documentCurrentUrl: string;
	documentCommittedUrl: string;

	// #endregion

	// #region Event specific properties

	requestBodyType?: string;
	requestBodyError?: string;
	// tslint:disable-next-line readonly-array
	requestBodyRaw?: string[];
	statusCode?: number;
	statusLine?: string;
	isProxy?: boolean;
	realm?: string;
	scheme?: string;
	challengerHost?: string;
	challengerPort?: number;
	ip?: string;
	redirectUrl?: string;
	error?: string;
	fromCache?: boolean;

	// #endregion
}

interface IWebRequestNetworkEventData extends IWebRequestEventData {
	aternityOutgoingBytes?: number;
	aternityIncomingBytes?: number;
	aternityNetworkStartTime?: number;
	aternityNetworkEndTime?: number;
	aternityTotalServerTime?: number;
	aternityEventTimes?: string;
}

/**
 * Frame monitored state for given frame state.
 */
interface FrameMonitoredState {
	readonly monitorWebRequest: boolean;
	readonly monitorWPM: boolean;
}

function isMonitoredState(frameMonitoredState: Readonly<FrameMonitoredState>): boolean {
	return frameMonitoredState.monitorWebRequest || frameMonitoredState.monitorWPM;
}


export const WEB_REQUEST_EVENT_NAMESPACE = "http:chrome:WebRequest";

function makeEventName(event: string): string {
	return WEB_REQUEST_EVENT_NAMESPACE + "." + event;
}

export class WebRequest implements IWebRequest {

	private readonly tabsStates: TabsStates;
	private readonly webRequestsStates = new WebRequestsStates();

	private manager?: IBackgroundManager;
	private communication?: IAgentCommunication;
	private configuration?: Configuration;
	private tabsMonitoring?: ITabsMonitoring;

	public constructor(tabsStates: TabsStates) {
		this.tabsStates = tabsStates;
	}

	// #region Utility functions

	/**
	 * Create base webRequest message.
	 */
	private createDataMessage(
		event: string,
		details: Readonly<webRequest.ResourceRequest>,
		frameState: Readonly<FrameState>):
		OutgoingEventMessage<IWebRequestEventData> {

		const message =
			new OutgoingEventMessage<IWebRequestEventData>(makeEventName(event), details.timeStamp);

		const eventData = message.messageData.Data[0];
		eventData.requestId = details.requestId;
		eventData.url = details.url;

		if (typeof (details as webRequest.WebRequestDetails).method !== "undefined") {
			eventData.method = (details as webRequest.WebRequestDetails).method;
		}

		eventData.type = details.type;
		eventData.frameId = details.frameId;
		eventData.parentFrameId = details.parentFrameId;
		eventData.tabId = details.tabId;

		// Add urls
		eventData.frameUrl = frameState.startUrl;
		eventData.frameCurrentUrl = frameState.currentUrl;
		if (frameState.committedUrl != null) {
			eventData.frameCommittedUrl = frameState.committedUrl;
		}

		if (details.frameId === 0) {
			eventData.documentUrl = frameState.startUrl;
			eventData.documentCurrentUrl = frameState.currentUrl;
			if (frameState.committedUrl != null) {
				eventData.documentCommittedUrl = frameState.committedUrl;
			}
		} else {
			const mainFrameState = this.tabsStates.getTab(details.tabId);
			if (mainFrameState != null) {
				eventData.documentUrl = mainFrameState.startUrl;
				eventData.documentCurrentUrl = mainFrameState.currentUrl;
				if (mainFrameState.committedUrl != null) {
					eventData.documentCommittedUrl = mainFrameState.committedUrl;
				}
			}
		}

		return message;
	}

	/*
	 * Frame is either main_frame or sub_frame type.
	 */
	private isFrameType(type: string): boolean {
		return type === "main_frame" || type === "sub_frame";
	}

	/**
	 * @return true if the tab is monitored or false otherwise.
	 */
	private isMonitored(details: Readonly<webRequest.ResourceRequest>, validateTabState: boolean = true): boolean {
		if (this.manager == null) return false;

		return this.manager.active &&
			// tabId set to -1 if the request isn't related to a tab.
			details.tabId !== -1 &&
			(!validateTabState || this.tabsStates.getTab(details.tabId) != null);
	}

	/**
	 * Check filters according to configuration
	 * If the main frame doesn't exist, the given frame is not monitored since we don't know
	 * the URL of the page.
	 */
	private getMonitoredState(
		frameState: Readonly<FrameState>,
		details: Readonly<webRequest.ResourceRequest>): FrameMonitoredState {

		const mainFrameState = details.frameId === 0 ?
			frameState :
			this.tabsStates.getTab(details.tabId);

		// No main frame state, not monitoring.
		if (mainFrameState == null || this.configuration == null) {
			return { monitorWebRequest: false, monitorWPM: false };
		}

		const configuration = this.configuration;
		const documentNavigationUrl = mainFrameState.startUrl;
		const monitorWebRequest = this.isWebRequestMonitored(configuration, mainFrameState, details);

		const monitorWPM =
			this.configuration.isMatchForWpmUrls(documentNavigationUrl, mainFrameState.committedUrl) ||
			this.configuration.isMatchForHttpWebPageLoadUrl(documentNavigationUrl);

		return { monitorWebRequest, monitorWPM };
	}

	/**
	 * Check whether webRequest should be reported for this tab.
	 */
	private isWebRequestMonitored(
		configuration: Readonly<Configuration>,
		mainFrameState: Readonly<FrameState>,
		details: Readonly<webRequest.ResourceRequest>): boolean {

		const documentNavigationUrl = mainFrameState.startUrl;

		// Check documentUrl and type
		if (configuration.isMatchWebRequestEvent("documentUrl", documentNavigationUrl) &&
			configuration.isMatchWebRequestEvent("type", details.type)) {
			return true;
		}

		// If there are no documentCommittedUrl filters, don't report webRequest.
		if (!configuration.hasWebRequestFilter("documentCommittedUrl")) {
			return false;
		}

		// Main frame is always reported when documentCommittedUrl filter is present.
		if (details.type === "main_frame") {
			return true;
		}

		// documentCommitted url should be set in onResponseStarted callback of main frame.
		// If it is not set, something bad happened, don't report.
		const documentCommittedUrl = mainFrameState.committedUrl;
		if (documentCommittedUrl == null) {
			return false;
		}

		// Check documentCommittedUrl and type
		return configuration.isMatchWebRequestEvent("documentCommittedUrl", documentCommittedUrl) &&
			configuration.isMatchWebRequestEvent("type", details.type);
	}

	// tslint:disable-next-line readonly-array
	private static makeKey(...s: string[]): string {
		return s.join(Consts.KEY_DELIMITER);
	}

	private static getContentLength(details: webRequest.WebRequestHeadersDetails, headers: ReadonlyArray<HttpHeader>): number {

		let contentLength = 0;
		let headersLength = 0;

		for (const header of headers) {
			if (header.name.toLowerCase() === "content-length") {
				if (typeof header.value !== "undefined") {
					contentLength = parseInt(header.value, 10);
				}
			} else {
				headersLength += header.name.length;
				if (typeof header.value !== "undefined") {
					headersLength += header.value.length;
				}
			}
		}

		// Sometimes no Content-Length is received, we calculate an approximation ourselves

		if (contentLength === 0 && typeof details.url !== "undefined") {
			contentLength += details.url.length;
		}

		return contentLength + headersLength;
	}

	// #endregion

	// #region Populate utility private

	/**
	 * Returns normalized header proprety key.
	 */
	private static makeHeaderProperty(prefix: string, header: string): string {
		return WebRequest.makeKey(prefix, header.toLowerCase());
	}

	/**
	 * Header indicating AppInternals monitoring.
	 */
	private static readonly APPINTERNALS_TRACE_HEADER = "X-OPNET-Transaction-Trace";

	/**
	 * Header indicating AppInternals monitoring in UX property format.
	 */
	private static readonly WEBREQUEST_APPINTERNALS_RESPONSE_HEADER =
		WebRequest.makeHeaderProperty("responseHeaders", WebRequest.APPINTERNALS_TRACE_HEADER);

	/**
	 * Add headers to the object.
	 * The headers are added with the given prefix.
	 *
	 * Header name is case insensitive, therefore it is converted to lowercase.
	 */
	private static populateHeaders(
		headers: ReadonlyArray<HttpHeader> | undefined,
		prefix: string,
		eventData: IWebRequestEventData): void {

		if (headers == null) {
			return;
		}

		for (const header of headers) {
			const key = WebRequest.makeKey(prefix, header.name.toLowerCase());

			if (header.value != null) {
				eventData[key] = header.value;
			} else {
				eventData[key] = "|BinaryValue|";
			}
		}
	}

	/**
	 * Add network values.
	 */
	private static populateNetwork(
		requestState: WebRequestState | undefined,
		timeStamp: number,
		eventData: IWebRequestNetworkEventData): void {

		if (requestState == null) {
			return;
		}

		eventData.aternityIncomingBytes = requestState.totalIncomingBytes;
		eventData.aternityOutgoingBytes = requestState.totalOutgoingBytes;
		eventData.aternityNetworkStartTime = Math.floor(requestState.requestStartTime);
		eventData.aternityNetworkEndTime = Math.floor(timeStamp);
		eventData.aternityTotalServerTime = Math.floor(requestState.totalServerTime);
		eventData.aternityEventTimes = JSON.stringify(requestState.eventTimes);
	}

	/**
	 * We don't want to send out passwords (if we can help it)
	 * Most websites use the same names for password fields, so we try and find those values
	 */
	private static readonly passwordRegEx = new RegExp(
		"(.*pwd$)|(pass)|(.*pw$)|(heslo)|(contraseña)|(contrasena)|(adgangskode)|" +
		"(пароль)|(senha)|(ordine)|(paswoord)|(密码)|(密碼)|(पासवर्ड)|(סיס)", "i");

	private static isFieldBlacklisted(fieldName: string): boolean {
		return WebRequest.passwordRegEx.test(fieldName);
	}

	/**
	 * Add formData as array of strings
	 * @return ~total number of chars (NOT EXACT!)
	 */
	private populateFormData(
		// tslint:disable-next-line readonly-array
		formData: { [key: string]: string[] },
		eventData: UXData): number {
		let ret = 0;
		for (const name in formData) {
			if (!formData.hasOwnProperty(name)) continue;
			ret += name.length + formData[name].toString().length;
			if (WebRequest.isFieldBlacklisted(name)) {
				getLogger().debug("Just filtered " + name + ".");
				continue;
			}
			const key = WebRequest.makeKey("formData", name);

			// Workaround Firefox parsing incorrect formData which is not in key=value format.
			// When the request body is not in the correct format, it creates a key with value of undefined.
			// Make an empty value instead.
			if (!(formData[name].length === 1 && formData[name][0] === undefined)) {
				Utils.concatOrInit(eventData as typeof formData, key, formData[name]);
			} else {
				eventData[key] = [];
			}
		}
		return ret;
	}

	/**
	 * Adds a new frame to tabs states and a new requestId to webRequests states.
	 */
	private addFrame(details: Readonly<webRequest.WebRequestBodyDetails>): FrameState {
		return this.tabsStates.addFrame(
			details.tabId,
			details.frameId,
			details.url,
			details.type,
			details.requestId);
	}

	private postStartMessage(
		// tslint:disable-next-line readonly-array
		requestHeaders: HttpHeader[] | undefined,
		originalMessage: OutgoingEventMessage<IWebRequestEventData>,
		order: number): void {

		// Make a new message with combined data and time stamp from BeforeRequest
		const startMessage = new OutgoingEventMessage<IWebRequestEventData>(
			makeEventName("Start"),
			originalMessage.timeStamp);
		startMessage.order = order;
		startMessage.messageData.Data = originalMessage.messageData.Data;

		// Add requestHeaders
		const eventData = startMessage.messageData.Data[0];
		if (requestHeaders != null) {
			WebRequest.populateHeaders(requestHeaders, "requestHeaders", eventData);
		}

		if (this.communication != null) {
			this.communication.postNativeMessage(startMessage);
		}
	}


	// #endregion

	// #region Handlers

	private readonly onBeforeRequest = (details: webRequest.WebRequestBodyDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details, false)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onBeforeRequest", details);

		// Get frame state
		let frameState = this.tabsStates.getFrame(details);

		// In case we have the same tab id and frame id and the requestId is different,
		// and the type is "main_frame" or "sub_frame", we have a new navigation.
		if (frameState != null && frameState.requestId !== details.requestId) {
			// Frame state exists, only frame type means navigation.
			if (this.isFrameType(details.type)) {
				// Remove states
				this.tabsStates.removeFrame(details.tabId, details.frameId);
				this.webRequestsStates.remove(frameState.requestId);

				frameState = this.addFrame(details);

				// Remove instant tabs
				setTimeout(() => this.tabsStates.validateTab(details.tabId), 60 * 1000);
			}
		}


		// Web request is initialized only for start navigation event.
		let requestState = this.webRequestsStates.get(details.requestId);
		if (requestState == null) {
			requestState = this.webRequestsStates.add(details.requestId, details.timeStamp);
		}

		// This check never positive since there is assignment before.
		if (frameState == null || requestState == null) {
			return undefined;
		}

		// Update frame's current url if it is frame request.
		if (this.isFrameType(details.type)) {
			frameState.currentUrl = details.url;
		} else {
			// Update only if wasn't defined before
			if (typeof frameState.currentUrl === "undefined") {
				frameState.currentUrl = details.url;
			}
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Mark down the time
		requestState.storeEventTime(WebRequestEvent.BeforeRequest, details.timeStamp);

		// Create message
		const message = this.createDataMessage("BeforeRequest", details, frameState);
		const eventData = message.messageData.Data[0];

		// Parse url parameters into formData
		const urlParams = Utils.getUrlParams(details.url);
		this.populateFormData(urlParams, eventData);

		// Add requestBody
		if (details.requestBody != null) {
			if (details.requestBody.error != null) {
				eventData.requestBodyType = "Error";
				eventData.requestBodyError = details.requestBody.error;
			} else if (details.requestBody.formData != null) {
				eventData.requestBodyType = "FormData";
				requestState.totalOutgoingBytes += this.populateFormData(details.requestBody.formData, eventData);
			} else if (details.requestBody.raw != null) {
				eventData.requestBodyType = "Raw";
				eventData.requestBodyRaw = [];
				for (const uploadData of details.requestBody.raw) {
					if (uploadData.bytes != null) {
						requestState.totalOutgoingBytes += uploadData.bytes.byteLength;
						eventData.requestBodyRaw.push("Bytes");
					} else {
						if (uploadData.file != null) {
							requestState.totalOutgoingBytes += uploadData.file.length;
							eventData.requestBodyRaw.push(uploadData.file);
						}
					}
				}
			}
		}

		// Set beforeRequestEvent only in the first request.
		if (!requestState.setBeforeRequestEvent) {
			requestState.beforeRequestEvent = Utils.deepClone(message);
			requestState.startMesageOrder = getNativeMessageOrder();
			requestState.setBeforeRequestEvent = true;
		}

		if (this.communication != null && monitoredState.monitorWebRequest) {
			// Always post if AppInternals header present
			this.communication.postNativeMessage(message);
		}

		return undefined;
	}

	private readonly onBeforeSendHeaders = (details: webRequest.WebRequestHeadersDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onBeforeSendHeaders", details);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		// Mark down the time
		const requestState = this.webRequestsStates.get(details.requestId);
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.BeforeSendHeaders, details.timeStamp);
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Create message
		const message = this.createDataMessage("BeforeSendHeaders", details, frameState);
		const eventData = message.messageData.Data[0];

		if (details.requestHeaders != null) {
			WebRequest.populateHeaders(details.requestHeaders, "requestHeaders", eventData);
		}

		if (this.communication != null && monitoredState.monitorWebRequest) {
			this.communication.postNativeMessage(message);
		}

		return undefined;
	}

	private readonly onSendHeaders = (details: webRequest.WebRequestHeadersDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onSendHeaders", details);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		const requestState = this.webRequestsStates.get(details.requestId);

		// Mark down the time
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.SendHeaders, details.timeStamp);
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Create message
		const message = this.createDataMessage("SendHeaders", details, frameState);
		const eventData = message.messageData.Data[0];

		if (details.requestHeaders != null) {
			WebRequest.populateHeaders(details.requestHeaders, "requestHeaders", eventData);
		}

		// Send the message
		if (this.communication != null && monitoredState.monitorWebRequest) {
			this.communication.postNativeMessage(message);
		}

		// Check we have requestState
		if (requestState != null) {
			// Send WebRequest.Start event
			if (!requestState.postedStart) {
				// Validate request state
				if (requestState.beforeRequestEvent == null ||
					requestState.startMesageOrder == null) {
					getLogger().error("Request state didn't initialize beforeRequestEvent or startMessageOrder");
				}
				else if (monitoredState.monitorWebRequest) {
					this.postStartMessage(
						details.requestHeaders,
						requestState.beforeRequestEvent,
						requestState.startMesageOrder);
				}

				requestState.postedStart = true;
				delete requestState.beforeRequestEvent;
			}

			// Add outgoing bytes if we have them
			if (details.requestHeaders != null) {
				requestState.totalOutgoingBytes += WebRequest.getContentLength(details, details.requestHeaders);
			}

			// Remember the time so we can subtract it once the server gets back to us.
			requestState.lastOnSendHeadersTs = details.timeStamp;
		}

		return undefined;
	}

	private readonly onHeadersReceived = (details: webRequest.WebResponseHeadersDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onHeadersReceived", details);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		const requestState = this.webRequestsStates.get(details.requestId);
		// Mark down the time
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.HeadersReceived, details.timeStamp);
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		const message = this.createDataMessage("HeadersReceived", details, frameState);
		const eventData = message.messageData.Data[0];

		if (details.responseHeaders != null) {
			WebRequest.populateHeaders(details.responseHeaders, "responseHeaders", eventData);
		}

		const statusCode = Utils.getStatusCode(details);
		if (statusCode != null) {
			frameState.statusCode = statusCode;
		}
		if (frameState.statusCode != null) {
			eventData.statusCode = frameState.statusCode;
		}
		eventData.statusLine = details.statusLine;

		// Check we have requestState
		if (requestState != null) {
			if (details.responseHeaders != null) {
				// Update incoming bytes
				requestState.totalIncomingBytes += WebRequest.getContentLength(details, details.responseHeaders);

				// Check AppInternals header
				if (WebRequest.WEBREQUEST_APPINTERNALS_RESPONSE_HEADER in eventData) {
					// prefix, header.name.toLowerCase()
					requestState.appInternalsMonitoring = true;
				}
			}

			// Add (now - last On send headers) to get this request's server time
			requestState.totalServerTime += details.timeStamp - requestState.lastOnSendHeadersTs;
			requestState.lastOnSendHeadersTs = 0;
		}

		if (this.communication != null && monitoredState.monitorWebRequest) {
			this.communication.postNativeMessage(message);
		}

		return undefined;
	}

	private readonly onAuthRequired = (details: webRequest.WebAuthenticationChallengeDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onAuthRequired", details);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		// Mark down the time
		const requestState = this.webRequestsStates.get(details.requestId);
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.AuthRequired, details.timeStamp);
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Create message
		const message = this.createDataMessage("AuthRequired", details, frameState);
		const eventData = message.messageData.Data[0];

		if (details.responseHeaders != null) {
			WebRequest.populateHeaders(details.responseHeaders, "responseHeaders", eventData);
		}

		eventData.statusLine = details.statusLine;
		eventData.isProxy = details.isProxy;
		if (details.realm != null) {
			eventData.realm = details.realm;
		}
		eventData.scheme = details.scheme;
		eventData.challengerHost = details.challenger.host;
		eventData.challengerPort = details.challenger.port;

		if (this.communication != null && monitoredState.monitorWebRequest) {
			this.communication.postNativeMessage(message);
		}

		return undefined;
	}

	private readonly onResponseStarted = (details: webRequest.WebResponseCacheDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onResponseStarted", details);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		if (this.isFrameType(details.type)) {
			frameState.committedUrl = details.url;
			// Calculate configuration and put it into cache for faster page load.
			// Data URLs are ignored.
			if (this.configuration != null) {
				const mainFrameState = this.tabsStates.getTab(details.tabId);

				// Special handling for chrome shortcuts
				let mainCommittedUrl = mainFrameState != null ? mainFrameState.committedUrl : "";
				const tabReady = mainCommittedUrl != null && mainCommittedUrl !== "";
				if (mainFrameState != null && !tabReady) {
					// When running chrome with url on the command line mainFrameState might still have empty documentCommittedUrl,
					// or even empty documentUrl. We must fall back to currentUrl, stripped of path (to support SPAs)
					getLogger().warn("Tab",
						details.tabId,
						" committedUrl not ready, falling back to frame",
						details.frameId);
					if (details.url !== undefined) {
						const url: URL = new URL(details.url);
						mainCommittedUrl = url.protocol + "//" + url.hostname;
						getLogger().warn("Using url:", mainCommittedUrl);
						mainFrameState.committedUrl = mainCommittedUrl;
					}
				}

				if (mainFrameState != null && mainFrameState.committedUrl != null) {
					this.configuration.getEventsForPage({
						documentUrl: mainFrameState.startUrl,
						documentCommittedUrl: mainFrameState.committedUrl
					});
				}
			}
		}

		// Mark down the time
		const requestState = this.webRequestsStates.get(details.requestId);
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.ResponseStarted, details.timeStamp);
		}

		const statusCode = Utils.getStatusCode(details);
		if (statusCode != null) {
			frameState.statusCode = statusCode;
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Create message
		const message = this.createDataMessage("ResponseStarted", details, frameState);
		const eventData = message.messageData.Data[0];


		if (frameState.statusCode != null) {
			eventData.statusCode = frameState.statusCode;
		}

		if (details.responseHeaders != null) {
			WebRequest.populateHeaders(details.responseHeaders, "responseHeaders", eventData);
		}

		if (details.ip != null) {
			eventData.ip = details.ip;
		}
		eventData.statusLine = details.statusLine;
		eventData.statusCode = details.statusCode;
		eventData.fromCache = details.fromCache;

		if (this.communication != null && monitoredState.monitorWebRequest) {
			this.communication.postNativeMessage(message);
		}

		return undefined;
	}

	private readonly onBeforeRedirect = (details: webRequest.WebRedirectionResponseDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onBeforeRedirect", details);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		// Mark down the time
		const requestState = this.webRequestsStates.get(details.requestId);
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.BeforeRedirect, details.timeStamp);
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Create message
		const message = this.createDataMessage("BeforeRedirect", details, frameState);

		const eventData = message.messageData.Data[0];

		if (details.responseHeaders != null) {
			WebRequest.populateHeaders(details.responseHeaders, "responseHeaders", eventData);
		}

		if (details.ip != null) {
			eventData.ip = details.ip;
		}
		eventData.statusLine = details.statusLine;
		eventData.statusCode = details.statusCode;
		eventData.fromCache = details.fromCache;
		eventData.redirectUrl = details.redirectUrl;

		// Data URI is a special case. There is no further requests.
		if (Utils.isDataUrl(details.redirectUrl)) {
			// Remove web request
			this.webRequestsStates.remove(details.requestId);

			// Update committed url
			frameState.committedUrl = details.url;

			// Add more meta data for further analysis by the agent
			WebRequest.populateNetwork(requestState, details.timeStamp, eventData);
		}

		if (this.communication != null && monitoredState.monitorWebRequest) {
			this.communication.postNativeMessage(message);
		}

		return undefined;
	}

	private readonly onCompleted = (details: webRequest.WebResponseCacheDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onCompleted", details);

		// Find the request
		const requestState = this.webRequestsStates.get(details.requestId);

		// Remove web request
		this.webRequestsStates.remove(details.requestId);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Add additional data
		const message = this.createDataMessage("Completed", details, frameState);

		const eventData = message.messageData.Data[0];

		if (details.responseHeaders != null) {
			WebRequest.populateHeaders(details.responseHeaders, "responseHeaders", eventData);
		}

		if (details.ip != null) {
			eventData.ip = details.ip;
		}
		eventData.statusLine = details.statusLine;
		eventData.statusCode = details.statusCode;
		eventData.fromCache = details.fromCache;

		let forcePost = false;

		// Mark down the time
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.Completed, details.timeStamp);

			// Always post if AppInternals header present.
			forcePost = requestState.appInternalsMonitoring;
		}

		// Add more meta data for further analysis by the agent
		WebRequest.populateNetwork(requestState, details.timeStamp, eventData);

		if (this.communication != null) {
			this.communication.postNativeMessage(message, { forcePost });
		}

		return undefined;
	}

	private readonly onErrorOccurred = (details: webRequest.WebResponseErrorDetails): BlockingResponse | undefined => {
		if (!this.isMonitored(details)) {
			return undefined;
		}
		getLogger().debug("WebRequest.onErrorOccurred", details);

		// Find the request
		const requestState = this.webRequestsStates.get(details.requestId);

		// Remove web request
		this.webRequestsStates.remove(details.requestId);

		const frameState = this.tabsStates.getFrame(details);
		// Skip unmonitored frames
		if (frameState == null) {
			return undefined;
		}

		// Filter event
		const monitoredState = this.getMonitoredState(frameState, details);
		if (!isMonitoredState(monitoredState)) {
			return undefined;
		}

		// Mark down the time
		if (requestState != null) {
			requestState.storeEventTime(WebRequestEvent.ErrorOccurred, details.timeStamp);
		}

		// Create message
		const message = this.createDataMessage("ErrorOccurred", details, frameState);
		const eventData = message.messageData.Data[0];

		if (details.ip != null) {
			eventData.ip = details.ip;
		}
		eventData.error = details.error;
		eventData.fromCache = details.fromCache;

		// Add more meta data for further analysis by the agent
		WebRequest.populateNetwork(requestState, details.timeStamp, eventData);

		if (this.communication != null && monitoredState.monitorWebRequest) {
			this.communication.postNativeMessage(message);
		}
		return undefined;
	}

	/**
	 * Message handler to pass configuration to content script.
	 * The reason for handling message in WebRequest is to provide page information properties
	 * with status code and frame ids.
	 */
	private readonly onMessage = (
		message: OutgoingPageNativeMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response: unknown) => void): boolean | void => {

		switch (message.messageType) {
			case MessageType.CONTENT_SCRIPT_LOAD:
				return this.onContentScriptLoad(message, sender, sendResponse);
			case MessageType.GET_STATUS_CODE:
				this.onGetStatusCode(sender, sendResponse);
				break;
			default:
				break;
		}

		return undefined;
	}

	private onContentScriptLoad(
		message: OutgoingPageNativeMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response: ContentScriptParameters) => void): boolean {
		if (this.configuration == null) {
			getLogger().log("No configuration, no reply");
			return false;
		}

		if (sender.tab == null || sender.tab.id == null) {
			return false;
		}

		// Determine if this is the content script was loaded by the main frame of the page, or by some
		// sub frame.
		const frameId = sender.frameId != null ? sender.frameId : -1;
		const isMainFrame = (frameId === 0);
		const tabId = sender.tab.id;
		const configuration = this.configuration;
		const mainFrameState = this.tabsStates.getTab(tabId);

		// Special handling for Chrome shortcuts
		let committedUrl = mainFrameState != null ? mainFrameState.committedUrl : "";
		const tabReady = committedUrl != null && committedUrl !== "";
		if (mainFrameState != null && !tabReady) {
			// When running chrome with url on the command line mainFrameState might still have empty documentCommittedUrl,
			// or even empty documentUrl. We must fall back to currentUrl, stripped of path (to support SPAs)
			getLogger().warn(`Tab${tabId} committedUrl not ready, falling back to currentUrl host`);
			if (sender.tab.url !== undefined) {
				const url: URL = new URL(sender.tab.url);
				committedUrl = url.protocol + "//" + url.hostname;
				getLogger().log(`Using url: ${committedUrl}`);
				mainFrameState.committedUrl = committedUrl;
			}
		}

		// Send the response asynchronously, so that we don't block content.
		setTimeout(
			() => { this.onContentScriptLoadImpl(tabId, frameId, isMainFrame, configuration, sendResponse); },
			0);

		// Keep connection with content script opened.
		return true;
	}

	private onContentScriptLoadImpl(
		tabId: number,
		frameId: number,
		isMainFrame: boolean,
		configuration: Configuration,
		sendResponse: (response: ContentScriptParameters) => void): void {

		try {
			const mainFrameState = this.tabsStates.getTab(tabId);

			// Frame not present means that extension ran after it has been loaded.
			const currentFrameState =
				frameId !== -1
					? this.tabsStates.getFrame({ tabId: tabId, frameId: frameId })
					: null;
			const wpmParameters: WpmParameters = {
				wpm: false,
				httpWebPageLoad: false
			};

			if (mainFrameState != null) {
				if (isMainFrame) {
					wpmParameters.wpm =
						configuration.isMatchForWpmUrls(mainFrameState.startUrl, mainFrameState.committedUrl);
				}
				wpmParameters.httpWebPageLoad = configuration.isMatchForHttpWebPageLoadUrl(mainFrameState.startUrl);
			}

			const documentUrl = mainFrameState != null ? mainFrameState.startUrl : "";
			const documentCommittedUrl = (mainFrameState != null && mainFrameState.committedUrl != null) ? mainFrameState.committedUrl : "";
			let documentTitle: string | undefined = undefined;
			if (this.tabsMonitoring != null) {
				const tabState = this.tabsMonitoring.getTabState(tabId);
				if (tabState != null) {
					documentTitle = tabState.documentTitle;
				}
			}

			const response: ContentScriptParameters = {
				configurationData: configuration.getEventsForPage({
					documentUrl,
					documentCommittedUrl
				}),
				pageInformation: {
					documentUrl: documentUrl,
					documentCommittedUrl: documentCommittedUrl,
					frameUrl: currentFrameState != null ? currentFrameState.startUrl : "",
					frameCommittedUrl:
						currentFrameState != null
						? currentFrameState.committedUrl != null
						? currentFrameState.committedUrl : "" : "",
					tabId: tabId,
					frameId: frameId,
				},
				statusCode: currentFrameState != null ? currentFrameState.statusCode : 0,
				wpmParameters: wpmParameters,
				documentTitle: documentTitle,
			};

			sendResponse(response);
			getLogger().info("Sent configuration to content", response);
		} catch (e) {
			getLogger().warn(`Couldn't send configuration to tab: ${tabId}, frame: ${frameId}, error: `, e);
		}
	}

	private onGetStatusCode(
		sender: chrome.runtime.MessageSender,
		sendResponse: (response: ContentParameters) => void): void {

		const tabId =
			sender.tab != null && sender.tab.id != null
				? sender.tab.id
				: -1;

		// ReSharper disable once AssignedValueIsNeverUsed
		let statusCode = -1;

		const currentFrame =
			sender.frameId != null
				? this.tabsStates.getFrame({ tabId: tabId, frameId: sender.frameId })
				: null;
		if (currentFrame == null) {
			getLogger().error("Did not receive frameId from sender. Probably not supported in this Chrome version.");
			statusCode = -1;
		} else if (currentFrame.statusCode == null) {
			getLogger().error("Did not receive statusCode.");
			statusCode = -1;
		} else {
			statusCode = currentFrame.statusCode;
		}

		sendResponse({ statusCode });
	}

	// #endregion

	public initWebRequest(
		manager: IBackgroundManager,
		communication: IAgentCommunication,
		tabsMonitoring: ITabsMonitoring,
		configuration: Configuration): void {

		this.manager = manager;
		this.communication = communication;
		this.tabsMonitoring = tabsMonitoring;
		this.configuration = configuration;
		const filter: RequestFilter = { urls: ["<all_urls>"] };

		webRequest.onBeforeRequest.addListener(this.onBeforeRequest, filter, ["requestBody"]);
		webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeaders, filter, ["requestHeaders"]);
		webRequest.onSendHeaders.addListener(this.onSendHeaders, filter, ["requestHeaders"]);
		webRequest.onHeadersReceived.addListener(this.onHeadersReceived, filter, ["responseHeaders"]);
		webRequest.onAuthRequired.addListener(this.onAuthRequired, filter, ["responseHeaders"]);
		webRequest.onResponseStarted.addListener(this.onResponseStarted, filter, ["responseHeaders"]);
		webRequest.onBeforeRedirect.addListener(this.onBeforeRedirect, filter, ["responseHeaders"]);
		webRequest.onCompleted.addListener(this.onCompleted, filter, ["responseHeaders"]);
		webRequest.onErrorOccurred.addListener(this.onErrorOccurred, filter);

		chrome.runtime.onMessage.addListener(this.onMessage);

		this.tabsStates.validateAllTabs();
	}

	public uninitWebRequest(): void {

		webRequest.onBeforeRequest.removeListener(this.onBeforeRequest);
		webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeaders);
		webRequest.onSendHeaders.removeListener(this.onSendHeaders);
		webRequest.onHeadersReceived.removeListener(this.onHeadersReceived);
		webRequest.onAuthRequired.removeListener(this.onAuthRequired);
		webRequest.onResponseStarted.removeListener(this.onResponseStarted);
		webRequest.onBeforeRedirect.removeListener(this.onBeforeRedirect);
		webRequest.onCompleted.removeListener(this.onCompleted);
		webRequest.onErrorOccurred.removeListener(this.onErrorOccurred);

		chrome.runtime.onMessage.removeListener(this.onMessage);

		this.manager = undefined;
		this.communication = undefined;
		this.configuration = undefined;
		this.tabsMonitoring = undefined;
	}
}
