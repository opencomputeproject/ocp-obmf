"use strict";

// import { chrome } from "./globalChrome";
import { Lazy } from "../utils/lazy";

export enum LogLevel {
	TRACE = 6,
	DEBUG = 5,
	INFO = 4,
	WARN = 3,
	ERROR = 2,
	FATAL = 1
}

export const EXTENSION_VERSION = new Lazy(() => chrome.runtime.getManifest().version);

/**
 * Key name delimiter for nested structure.
 */
export const KEY_DELIMITER = ".";

/**
 * Report everything.
 */
export const REPORT_EVERYTHING = "Everything";

/**
 * WebRequest event regex.
 */
export const WEBREQUEST_EVENT_RE = /^http\:chrome\:WebRequest/;
export const WEBREQUEST_EVENT_NAMESPACE = "http:chrome:WebRequest";

/**
 * Required properties in WebRequest events.
 */
export const WEBREQUEST_REQUIRED_PROPERTIES: ReadonlyArray<ReadonlyArray<string>> = [
	["documentUrl", "type"],
	["documentCommittedUrl", "type"]
];
