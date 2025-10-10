"use strict";

import { BrowserType } from "../background/WacAPI";


interface IBrowserInfo {
	name: BrowserType;
	version: string;
	major: number;
	minor: number;
}

// tslint:disable max-line-length

/* Chrome UserAgent:
 * "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36"
 * "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
 * "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
 * Chrome AppVersion:
 * "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
 */
const CHROME_VERSION = /Chrome\/(([0-9]+)\.([0-9]+)\.([.0-9]+))/;

/* Safari UserAgent:
 * "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17"
 * "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15"
 * Safari AppVersion:
 * "5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15"
 */
const SAFARI_VERSION = /Version\/(([0-9])\.([0-9])\.([.0-9]+))\s+Safari/;

/*
 * Firefox UserAgent:
 * "Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0"
 * "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0"
 */
const FIREFOX_VERSION = /Firefox\/(([0-9]+)\.([0-9]+))/;

/*
 * Chromium Edge UserAgent (the new Chromium Edge introduced on 01/2020):
 * "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36 Edg/80.0.361.50"
 * Chromium Edge AppVersion:
 * "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36 Edg/80.0.361.50"
 */
const CHROMIUM_EDGE_VERSION = /Edg\/(([0-9]+)\.([0-9]+)\.([.0-9]+))/;

function createBrowserInfo(name: BrowserType, matches: ReadonlyArray<string>): IBrowserInfo {
	const major = matches[2];
	const minor = matches[3];

	return {
		name,
		version: matches[1],
		major: parseInt(major, 10),
		minor: parseInt(minor, 10)
	};
}

/**
 * @return Browser name and version extracted from appVersion string or userAgent string, obtained from the window.navigator object.
 */
export function getBrowserInfo(appVersion: string, userAgent: string): IBrowserInfo {
	// The Chromium Edge regex should be executed before the Chrome and the Safari regex, as its User Agent and App Version strings contain the later.
	// const matches = CHROMIUM_EDGE_VERSION.exec(appVersion);
	/*
	if (matches != null) {
		return createBrowserInfo(BrowserType.Edge, matches);
	}
	*/
	const matches = CHROME_VERSION.exec(appVersion);
	if (matches != null) {
		return createBrowserInfo(BrowserType.Chrome, matches);
	}
	/*
	matches = SAFARI_VERSION.exec(appVersion);
	if (matches != null) {
		return createBrowserInfo(BrowserType.Safari, matches);
	}

	matches = FIREFOX_VERSION.exec(userAgent);
	if (matches != null) {
		return createBrowserInfo(BrowserType.Firefox, matches);
	}
	*/
	return createBrowserInfo(BrowserType.NA, ["", "0.0.0.0", "0", "0"]);
}

export const browserInfo = getBrowserInfo(navigator.appVersion, navigator.userAgent);
