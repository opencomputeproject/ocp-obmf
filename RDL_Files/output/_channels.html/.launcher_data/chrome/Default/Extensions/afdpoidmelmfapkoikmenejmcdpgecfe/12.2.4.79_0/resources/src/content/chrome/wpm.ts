"use strict";

import * as Utils from "../../utils/utils";
import { getOparxData } from "./AppInternals";
import { getLogger } from "../../utils/log";
import { ContentScriptParameters, WpmStatusCodeResponse as ContentParameters } from "../../common/ConfigurationData";
import {
	MessageType,
	OutgoingWpmErrorEventMessage,
	WebPageContext,
	OutgoingWpmPageLoadUXMessage,
	OutgoingWpmPageErrorUXMessage,
	OutgoingHttpChromeWebPageLoadEventMessage,
	OutgoingWpmPageLoadEventMessage
} from "../../common/MessagingModel";

let wpmReported = false;

function getTimings(start: number, end: number): number {
	if (start > end) {
		throw new Error(`Something is wrong, start (${start.toString()}) is greater than end (${end.toString()})!`);
	}
	return end - start;
}

function getTimingsOrZero(start: number, end: number): number {
	if (start > end) return 0;

	return end - start;
}

/**
 * Tries to get a real start time.
 * @return Either navigationStart or redirectStart or fetchStart, the first one that is not zero.
 * NOTE: Technically timing.navigationStart is always non-zero but we keep this code for same logic in IE.
 */
function getWpmStartTime(): number {
	const timing = performance.timing;

	let startTime = timing.navigationStart;
	if (startTime === 0) {
		startTime = timing.redirectStart;
		if (startTime === 0) {
			startTime = timing.fetchStart;
		} else {
			throw new Error("Zero response, not reporting");
		}
	}

	return startTime;
}

/**
 * Report WPM if we have all data needed.
 */
export function reportWpm(parameters: ContentScriptParameters): void {
	try {
		if (wpmReported) {
			return;
		}

		if (Utils.startsWith(location.href, "about:") || Utils.startsWith(location.href, "chrome:")) {
			getLogger().info(`WPM is not applicable for ${location.href} path.`);
			return;
		}

		if (parameters == null) {
			getLogger().info("Main parameters are not received, not reporting WPM now.");
			return;
		}

		// Check we have status code and if we don't, ask from the background
		let statusCode = parameters.statusCode;
		if (statusCode == null) {
			getLogger().info("statusCode didn't arrive with main parameters, asking synchronously");
			chrome.runtime.sendMessage(
				{ messageType: MessageType.GET_STATUS_CODE },
				(response: ContentParameters) => {
					if (chrome.runtime.lastError == null) {
						getLogger().info("Got main parameters");
						statusCode = response.statusCode;
					}
				});
		}
		if (statusCode == null) {
			getLogger().warn("Background didn't return statusCode, cannot report WPM");
			return;
		}

		if (parameters.wpmParameters.wpm) {
			// Do the same as IE does.
			// Treat [400,600) as failure, everything else is success.
			if (statusCode >= 400 && statusCode < 600) {
				// WPM HTML cartridge
				const wpmErrorMessage = new OutgoingWpmErrorEventMessage(
					window.location.href,
					window.name,
					statusCode);

				getLogger().log("Reporting WPM error to agent", wpmErrorMessage);
				// checked
				const promise1 = chrome.runtime.sendMessage(wpmErrorMessage);

				// wpm:Page
				const wpmPageErrorUXMessage = getwpmPageErrorUXMessage(parameters, statusCode);
				getLogger().log("Reporting UX WPM error to agent", wpmPageErrorUXMessage);
				// checked
				const promise2 = chrome.runtime.sendMessage(wpmPageErrorUXMessage);
			} else {
				// WPM HTML cartridge
				const wpmMessage = getWpmPageLoadMessage();
				getLogger().log("Reporting WPM load to agent", wpmMessage);
				// checked
				const promise3 = chrome.runtime.sendMessage(wpmMessage);

				// wpm:Page
				const wpmPageLoadUXMessage = getwpmPageLoadUXMessage(parameters, statusCode);
				getLogger().log("Reporting UX WPM load to agent", wpmPageLoadUXMessage);
				// checked
				const promise4 = chrome.runtime.sendMessage(wpmPageLoadUXMessage);
			}
		}

		// http:WebPage
		if (parameters.wpmParameters.httpWebPageLoad) {
			const httpChromeWebPageLoadMessage = getHttpChromeWebPageLoadMessage(parameters, statusCode);
			getLogger().log("Reporting Full WPM to agent", httpChromeWebPageLoadMessage);
			// checked
			const promise5 = chrome.runtime.sendMessage(httpChromeWebPageLoadMessage);
		}

		wpmReported = true;
	} catch (e) {
		getLogger().warn("Could not report WPM", e);
	}
}

function setWpmContext(
	eventData: WebPageContext,
	parameters: ContentScriptParameters,
	statusCode: number): void {

	eventData.url = window.location.href;
	eventData.title = window.document.title;

	eventData.type = parameters.pageInformation.frameId === 0 ? "document" : "frame";

	eventData.statusCode = statusCode;
	eventData.tabId = parameters.pageInformation.tabId;
	eventData.frameId = parameters.pageInformation.frameId;

	eventData.documentUrl = parameters.pageInformation.documentUrl;
	eventData.documentCommittedUrl = parameters.pageInformation.documentCommittedUrl;

	// Use document title for main frame, or given documentTitle for sub frame.
	if (parameters.pageInformation.frameId === 0) {
		eventData.documentTitle = window.document.title;
	}

	const oparxData = getOparxData();
	eventData.serverURL = oparxData.serverURL;
	eventData.userId = oparxData.userId;
	eventData.pageId = oparxData.pageId;
	eventData.aixId = oparxData.aixId;
}

/**
 * PerformanceTiming minus toJSON and msFirstPaint
 */
interface AternityPerformanceTiming {
	readonly connectEnd: number;
	readonly connectStart: number;
	readonly domComplete: number;
	readonly domContentLoadedEventStart: number;
	readonly domContentLoadedEventEnd: number;
	readonly domInteractive: number;
	readonly domLoading: number;
	readonly domainLookupEnd: number;
	readonly domainLookupStart: number;
	readonly fetchStart: number;
	readonly loadEventEnd: number;
	readonly loadEventStart: number;
	readonly navigationStart: number;
	readonly redirectEnd: number;
	readonly redirectStart: number;
	readonly requestStart: number;
	readonly responseEnd: number;
	readonly responseStart: number;
	readonly secureConnectionStart: number;
	readonly unloadEventEnd: number;
	readonly unloadEventStart: number;
}

function getPerformanceTimingMeasurement(
	measurement: keyof AternityPerformanceTiming,
	nextMeasurement: keyof AternityPerformanceTiming): number {
	// ReSharper 2018.1 bug: Cannot infer number type automatically
	const current = (window.performance.timing as Record<keyof AternityPerformanceTiming, number>)[measurement];
	const next = (window.performance.timing as Record<keyof AternityPerformanceTiming, number>)[nextMeasurement];

	// Both measurements zero is a bug in browser !
	if (current === 0 && next === 0) {
		throw new Error(`Measurements are zero: ${measurement}, ${nextMeasurement}`);
	}

	// Workaround browser zero values bug
	if (current === 0) {
		return next;
	}
	if (next === 0) {
		return current;
	}

	return Math.min(current, next);
}

/**
 * Force the proper ascending order on performance times - sometimes violated due to chrome bugs.
 * Implementation goes end-to-start, since we observed cases where this direction is the one that preserves
 * the request/response time.
 */
function getFixedTiming(): AternityPerformanceTiming {
	const timing = window.performance.timing;

	const connectEnd = getPerformanceTimingMeasurement("connectEnd", "requestStart");
	const connectStart = getPerformanceTimingMeasurement("connectStart", "connectEnd");
	const domComplete = getPerformanceTimingMeasurement("domComplete", "loadEventStart");
	const domContentLoadedEventEnd = getPerformanceTimingMeasurement("domContentLoadedEventEnd", "domComplete");
	const domContentLoadedEventStart =
		getPerformanceTimingMeasurement("domContentLoadedEventStart", "domContentLoadedEventEnd");
	const domInteractive = getPerformanceTimingMeasurement("domInteractive", "domContentLoadedEventStart");
	const domLoading = getPerformanceTimingMeasurement("domLoading", "domInteractive");
	const domainLookupEnd = getPerformanceTimingMeasurement("domainLookupEnd", "connectStart");
	const domainLookupStart = getPerformanceTimingMeasurement("domainLookupStart", "domainLookupEnd");
	const fetchStart = getPerformanceTimingMeasurement("fetchStart", "domainLookupStart");
	const loadEventEnd = timing.loadEventEnd;
	const loadEventStart = getPerformanceTimingMeasurement("loadEventStart", "loadEventEnd");
	// redirectEnd is allowed to be zero
	const redirectEnd = timing.redirectEnd;
	// redirectStart is allowed to be zero
	const redirectStart = Math.min(timing.redirectStart, timing.redirectEnd);
	const responseEnd = getPerformanceTimingMeasurement("responseEnd", "domLoading");
	const responseStart = getPerformanceTimingMeasurement("responseStart", "responseEnd");
	const requestStart = getPerformanceTimingMeasurement("requestStart", "responseStart");

	// secureConnectionStart was allowed to be undefined in earlier browser versions.
	// secureConnectionStart is set to zero when the connection is not secure.
	const secureConnectionStart =
		typeof timing.secureConnectionStart === "number"
		? timing.secureConnectionStart !== 0
		? getPerformanceTimingMeasurement("secureConnectionStart", "connectEnd")
		: 0
		: 0;
	// Unload time is allowed to be zero
	const unloadEventEnd = timing.unloadEventEnd;
	const unloadEventStart = timing.unloadEventStart;

	let navigationStart = 0;
	if (timing.navigationStart !== 0) {
		navigationStart = timing.navigationStart;
	} else if (timing.redirectStart === 0) {
		navigationStart = timing.redirectStart;
	} else if (timing.fetchStart !== 0) {
		navigationStart = timing.fetchStart;
	} else {
		throw new Error("Zero response, not reporting");
	}

	const fixedTiming: AternityPerformanceTiming = {
		connectEnd,
		connectStart,
		domComplete,
		domContentLoadedEventEnd,
		domContentLoadedEventStart,
		domInteractive,
		domLoading,
		domainLookupEnd,
		domainLookupStart,
		fetchStart,
		loadEventEnd,
		loadEventStart,
		navigationStart,
		redirectEnd,
		redirectStart,
		requestStart,
		responseEnd,
		responseStart,
		secureConnectionStart,
		unloadEventEnd,
		unloadEventStart
	};

	return fixedTiming;
}

function getwpmPageLoadUXMessage(parameters: ContentScriptParameters, statusCode: number): OutgoingWpmPageLoadUXMessage {
	const timing = getFixedTiming();
	const message = new OutgoingWpmPageLoadUXMessage();

	const eventData = message.messageData.Data[0];

	// We calculate everything here because this is what the agent expects.
	const wpmStartTime = getWpmStartTime();
	eventData.ActivityResponse = getTimings(wpmStartTime, timing.loadEventEnd);
	eventData.ResponseTime = getTimings(timing.responseStart, timing.responseEnd);
	eventData.TCPConnectTime = getTimings(timing.connectStart, timing.connectEnd);
	eventData.RedirectTime = getTimings(timing.redirectStart, timing.redirectEnd);
	eventData.DNSTime = getTimings(timing.domainLookupStart, timing.domainLookupEnd);
	eventData.RequestTime = getTimings(timing.requestStart, timing.responseStart);
	eventData.ProcessingTime = getTimings(timing.domLoading, timing.domComplete);
	eventData.LoadTime = getTimings(timing.loadEventStart, timing.loadEventEnd);
	const dataTime = getTimings(timing.requestStart, timing.responseEnd);
	const domResourceLoadTime = getTimings(timing.domContentLoadedEventEnd, timing.domComplete);
	eventData.TotalNetworkResponseTime =
		dataTime + eventData.TCPConnectTime + eventData.DNSTime + eventData.RedirectTime + domResourceLoadTime;
	eventData.TotalNetworkServerTime = eventData.RequestTime;
	eventData.ClientTime =
		getTimings(eventData.TotalNetworkResponseTime, eventData.ActivityResponse);
	// Detailed properties
	const startTime = timing.navigationStart;
	eventData.navigationStart = startTime;

	eventData.unloadEventStartOffset = getTimingsOrZero(startTime, timing.unloadEventStart);
	eventData.unloadEventEndOffset = getTimingsOrZero(startTime, timing.unloadEventEnd);
	eventData.redirectStartOffset = getTimingsOrZero(startTime, timing.redirectStart);
	eventData.redirectEndOffset = getTimingsOrZero(startTime, timing.redirectEnd);
	eventData.fetchStartOffset = getTimings(startTime, timing.fetchStart);
	eventData.domainLookupStartOffset = getTimings(startTime, timing.domainLookupStart);
	eventData.domainLookupEndOffset = getTimings(startTime, timing.domainLookupEnd);
	eventData.connectStartOffset = getTimings(startTime, timing.connectStart);
	eventData.connectEndOffset = getTimings(startTime, timing.connectEnd);

	// secureConnectionStart can be undefined
	eventData.secureConnectionStartOffset = 0;
	if (timing.secureConnectionStart !== 0) {
		eventData.secureConnectionStartOffset = getTimingsOrZero(startTime, timing.secureConnectionStart);
	}

	// Google Chrome has a bug when requestStart and responseStart have smaller timestamp than navigationStart.
	eventData.requestStartOffset = getTimingsOrZero(startTime, timing.requestStart);
	eventData.responseStartOffset = getTimingsOrZero(startTime, timing.responseStart);

	eventData.responseEndOffset = getTimings(startTime, timing.responseEnd);
	eventData.domLoadingOffset = getTimings(startTime, timing.domLoading);
	eventData.domInteractiveOffset = getTimings(startTime, timing.domInteractive);
	eventData.domContentLoadedEventStartOffset = getTimings(startTime, timing.domContentLoadedEventStart);
	eventData.domContentLoadedEventEndOffset = getTimings(startTime, timing.domContentLoadedEventEnd);
	eventData.domCompleteOffset = getTimings(startTime, timing.domComplete);
	eventData.loadEventStartOffset = getTimings(startTime, timing.loadEventStart);
	eventData.loadEventEndOffset = getTimings(startTime, timing.loadEventEnd);

	setWpmContext(eventData, parameters, statusCode);

	return message;
}

function getwpmPageErrorUXMessage(parameters: ContentScriptParameters, statusCode: number):
	OutgoingWpmPageErrorUXMessage {

	const message = new OutgoingWpmPageErrorUXMessage();

	const eventData = message.messageData.Data[0];

	setWpmContext(eventData, parameters, statusCode);

	return message;
}

function getHttpChromeWebPageLoadMessage(parameters: ContentScriptParameters, statusCode: number):
	OutgoingHttpChromeWebPageLoadEventMessage {

	const timing = getFixedTiming();
	const message = new OutgoingHttpChromeWebPageLoadEventMessage(timing.loadEventEnd);

	const eventData = message.messageData.Data[0];

	// Timing diff
	const startTime = timing.navigationStart;
	eventData.navigationStart = startTime;
	eventData.unloadEventStartTime = 0;
	if (timing.unloadEventStart !== 0) {
		eventData.unloadEventStartTime = getTimings(startTime, timing.unloadEventStart);
	}
	eventData.unloadEventEndTime = 0;
	if (timing.unloadEventEnd !== 0) {
		eventData.unloadEventEndTime = getTimings(startTime, timing.unloadEventEnd);
	}
	eventData.redirectStartTime = 0;
	if (timing.redirectStart !== 0) {
		eventData.redirectStartTime = getTimings(startTime, timing.redirectStart);
	}
	eventData.redirectEndTime = 0;
	if (timing.redirectEnd !== 0) {
		eventData.redirectEndTime = getTimings(startTime, timing.redirectEnd);
	}
	eventData.fetchStartTime = getTimings(startTime, timing.fetchStart);
	eventData.domainLookupStartTime = getTimings(startTime, timing.domainLookupStart);
	eventData.domainLookupEndTime = getTimings(startTime, timing.domainLookupEnd);
	eventData.connectStartTime = getTimings(startTime, timing.connectStart);
	eventData.connectEndTime = getTimings(startTime, timing.connectEnd);

	// secureConnectionStart can be undefined
	eventData.secureConnectionStartTime = 0;
	if (timing.secureConnectionStart !== 0) {
		eventData.secureConnectionStartTime = getTimings(startTime, timing.secureConnectionStart);
	}
	eventData.requestStartTime = getTimings(startTime, timing.requestStart);
	eventData.responseStartTime = getTimings(startTime, timing.responseStart);
	eventData.responseEndTime = getTimings(startTime, timing.responseEnd);
	eventData.domLoadingTime = getTimings(startTime, timing.domLoading);
	eventData.domInteractiveTime = getTimings(startTime, timing.domInteractive);
	eventData.domContentLoadedEventStartTime = getTimings(startTime, timing.domContentLoadedEventStart);
	eventData.domContentLoadedEventEndTime = getTimings(startTime, timing.domContentLoadedEventEnd);
	eventData.domCompleteTime = getTimings(startTime, timing.domComplete);
	eventData.loadEventStartTime = getTimings(startTime, timing.loadEventStart);
	eventData.loadEventEndTime = getTimings(startTime, timing.loadEventEnd);

	// Context
	setWpmContext(eventData, parameters, statusCode);

	return message;
}

function getWpmPageLoadMessage(): OutgoingWpmPageLoadEventMessage {
	const timing = getFixedTiming();
	// We calculate everything here because this is what the agent expects.
	const title = window.document.title;
	const url = window.location.href;
	const startTime = getWpmStartTime();
	const responseTime = getTimings(timing.responseStart, timing.responseEnd);
	const activityResponse = getTimings(startTime, timing.loadEventEnd);
	const tcpConnectTime = getTimings(timing.connectStart, timing.connectEnd);
	const redirectTime = getTimings(timing.redirectStart, timing.redirectEnd);
	const dnsTime = getTimings(timing.domainLookupStart, timing.domainLookupEnd);
	const requestTime = getTimings(timing.requestStart, timing.responseStart);
	const processingTime = getTimings(timing.domLoading, timing.domComplete);
	const loadTime = getTimings(timing.loadEventStart, timing.loadEventEnd);

	const dataTime = getTimings(timing.requestStart, timing.responseEnd);
	const domResourceLoadTime = getTimings(timing.domContentLoadedEventEnd, timing.domComplete);

	const totalNetworkResponseTime = dataTime + tcpConnectTime + dnsTime + redirectTime + domResourceLoadTime;
	const totalNetworkServerTime = requestTime;
	const clientTime = activityResponse - totalNetworkResponseTime;
	const oparxData = getOparxData();

	const wpmPageLoadMessage = new OutgoingWpmPageLoadEventMessage(
		title,
		url,
		responseTime,
		activityResponse,
		tcpConnectTime,
		redirectTime,
		dnsTime,
		requestTime,
		processingTime,
		loadTime,
		totalNetworkResponseTime,
		totalNetworkServerTime,
		clientTime,
		oparxData.serverURL,
		oparxData.userId,
		oparxData.pageId,
		oparxData.aixId);

	return wpmPageLoadMessage;
}
