"use strict";

import * as Utils from "../../utils/utils";
import { getLogger } from "../../utils/log";
import * as EventNames from "../../HtmlMonitoring/EventNames";
import { isValidCSSSelectorsCollectionSelector } from "../../dom/CSSSelectorsCollection";
import { PropertyMatch } from "../ConfigurationData";
import { BackgroundPageInformation, populateContentPageInformation } from "../PageInformation";
import { OutgoingNVWorkTimeViolationUXMessage } from "../MessagingModel";

// Used to separate between multiple CSS selectors in output property
export const CSS_SELECTOR_DELIMITER = ";";
export const CSS_SELECTOR_DELIMITER_ENCODED = ";;";

/**
 * Returns the list of valid CSS selectors unencoded from input format.
 * @param matchers
 */
export function getValidUnescapedSelectors(matchers: ReadonlyArray<PropertyMatch>): Set<string> {
	const mapped = new Set<string>();
	for (const matcher of matchers) {
		const selector = convertCssSelectorFromInputConfiguration(matcher.Value);
		if (selector != null) {
			mapped.add(selector);
		}
	}

	const validSelectors = new Set<string>();
	mapped.forEach(selector => {
		if (isValidCSSSelectorsCollectionSelector(selector)) {
			validSelectors.add(selector);
		} else {
			getLogger().error("Invalid selector", selector);
		}
	});

	return validSelectors;
}

/**
 * Encodes the provided list of CSS selectors into a single encoded list.
 * @param selectors In raw unencoded format.
 */
export function createAternityCssSelectorPayload(selectors: ReadonlyArray<string>): string {
	if (selectors.length === 0) return "";

	return CSS_SELECTOR_DELIMITER
		+ selectors.map(convertPureCssSelectorToOutputFormat)
			.join(CSS_SELECTOR_DELIMITER)
		+ CSS_SELECTOR_DELIMITER;
}

/**
 * @param pureSelector
 */
export function convertPureCssSelectorToOutputFormat(pureSelector: string): string {
	// The delimiter should be encoded if used inside
	return pureSelector.replace(
		new RegExp(CSS_SELECTOR_DELIMITER, "g"),
		CSS_SELECTOR_DELIMITER_ENCODED);

	// No regex escaping is necessary because we need to match raw selector
}

/**
 * Converts encoded CSS selector in configuration format into raw format.
 * @param input
 */
export function convertCssSelectorFromInputConfiguration(input: string): string | null {
	if (!Utils.startsWith(input, CSS_SELECTOR_DELIMITER) ||
		!Utils.endsWith(input, CSS_SELECTOR_DELIMITER)) {
		getLogger().error("Invalid selector", input);
		return null;
	}

	let ret = input;

	// Trim leading the following delimiter
	ret = ret.substring(CSS_SELECTOR_DELIMITER.length,
		ret.length - CSS_SELECTOR_DELIMITER.length);

	// Take care or regex escaping - this should be done before decoding delimiter!
	ret = Utils.unescapeRegExp(ret);

	// If the delimiter is used inside the selector it should be decoded
	return ret.replace(
		new RegExp(CSS_SELECTOR_DELIMITER_ENCODED, "g"),
		CSS_SELECTOR_DELIMITER);
}

// ReSharper disable once InconsistentNaming
export function createNVWorkTimeViolationMessage(
	description: string,
	pageInformation: Readonly<BackgroundPageInformation>,
	documentTitle: string,
	backoffInterval: number,
	maxWorkTime: number,
	timeFrame: number,
	totalRunningTime: number,
	totalSelectors: number,
	processedSelectors: number,
	lastProcessedSelector: string,
	longestSelector: string,
	longestSelectorTime: number
	): OutgoingNVWorkTimeViolationUXMessage {

	const nvMsg = new OutgoingNVWorkTimeViolationUXMessage({
		description,
		backoffInterval,
		maxWorkTime,
		timeFrame,
		totalRunningTime,
		totalSelectors,
		processedSelectors,
		lastProcessedSelector,
		longestSelector,
		longestSelectorTime
	});

	populateContentPageInformation(
		pageInformation,
		documentTitle,
		nvMsg.messageData.Data[0]);

	return nvMsg;
}

export function isDesignerHtmlDocumentEvent(eventName: string): boolean {
	return Utils.startsWith(eventName, EventNames.HTML_DESIGNER_EVENT_NAMESPACE + ".");
}

export function isOnAppHtmlDocumentEvent(eventName: string): boolean {
	return Utils.startsWith(eventName, EventNames.HTML_ONAPP_EVENT_NAMESPACE + ".");
}

export function isHtmlDocumentEvent(eventName: string): boolean {
	return isDesignerHtmlDocumentEvent(eventName) || isOnAppHtmlDocumentEvent(eventName);
}

export function isDomEvent(eventName: string): boolean {
	return Utils.startsWith(eventName, EventNames.DOM_EVENT_NAMESPACE + ".");
}
