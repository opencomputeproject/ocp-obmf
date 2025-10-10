"use strict";

import { Primitive } from "../utils/utils";
import * as ContentEvents from "../common/helpers/ContentEvents";
import { ConfigurationData, ConditionObject } from "../common/ConfigurationData";
import { UXData } from "../common/UXData";

export interface PropertyTransformationRule {
	originalPropertyNames: ReadonlyArray<string>;
	// tslint:disable-next-line readonly-array
	transformation(data: Event): Primitive | Primitive[] | undefined;
}

const transformationRules: { [originalPropertyNames: string]: PropertyTransformationRule } = {
	aternityModifierKeys: {
		originalPropertyNames: ["altKey", "ctrlKey", "shiftKey", "metaKey"],
		transformation: transformModifierKeys
	},
	aternityMouseButton: {
		originalPropertyNames: ["button"],
		transformation: transformMouseButton
	}
};

export function amendConfigurationData(configuration: ConfigurationData): void {
	if (configuration.EventConfig != null) {
		amendEventConfig(configuration.EventConfig);
	}
	const consolidatedEventConfig = configuration.ConsolidatedEventConfig;
	if (consolidatedEventConfig != null) {
		for (const consolidationProperty in consolidatedEventConfig) {
			if (!consolidatedEventConfig.hasOwnProperty(consolidationProperty)) continue;

			const consolidatedConfiguration = consolidatedEventConfig[consolidationProperty];
			for (const matcher in consolidatedConfiguration) {
				if (!consolidatedConfiguration.hasOwnProperty(matcher)) continue;

				amendEventConfig(consolidatedConfiguration[matcher]);
			}
		}
	}
}

// tslint:disable-next-line readonly-array
function amendEventConfig(eventConfig: { [eventName: string]: ConditionObject[]; }): void {
	for (const transformedProperty in transformationRules) {
		if (!transformationRules.hasOwnProperty(transformedProperty)) continue;

		for (const eventName in eventConfig) {
			if (!eventConfig.hasOwnProperty(eventName)) continue;

			// If it's not a document event or empty we don't care
			if (!ContentEvents.isHtmlDocumentEvent(eventName)) {
				continue;
			}

			// If we didn't request for the merged property there's nothing to amend
			const conditions = eventConfig[eventName];
			if (!hasPropertyFilter(conditions, transformedProperty)) {
				continue;
			}

			const propertiesToAdd = transformationRules[transformedProperty].originalPropertyNames;
			// Add all the properties that it's made of to the configuration
			// Note that it's OK that we add a few extra properties because they will be
			//   filtered out by the background script anyway. If it becomes performance-
			//   critical, we can have another filtering pass in the end.
			for (const property of propertiesToAdd) {
				// Unless it's already there and then we don't change the condition
				if (hasPropertyFilter(conditions, property)) {
					continue;
				}
				addFilter(conditions, property, ".*", false);
			}
		}
	}
}

function hasPropertyFilter(conditions: ReadonlyArray<ConditionObject>, propertyName: string): boolean {
	return conditions.some(c => c.Conditions.hasOwnProperty(propertyName));
}

// tslint:disable-next-line readonly-array
function addFilter(conditions: ConditionObject[], propertyName: string, pattern: string, isExact: boolean): void {
	// Currently the code only uses the first element so we add the conditions to the first one
	conditions[0].Conditions[propertyName] = [{
		Value: pattern,
		MatchType: isExact ? "exact" : "regex"
	}];
}

export function getTransformedProperties(event: Event): UXData {
	const result: UXData = {};

	for (const transformedProperty in transformationRules) {
		if (!transformationRules.hasOwnProperty(transformedProperty)) continue;
		result[transformedProperty] = transformationRules[transformedProperty].transformation(event);
	}

	return result;
}

// #region Transformation functions

function transformModifierKeys(event: Event): string {
	let value = "";

	const keyboardEvent: Partial<KeyboardEvent> = event;
	if (keyboardEvent.shiftKey != null && keyboardEvent.shiftKey) {
		value += "Shift, ";
	}
	if (keyboardEvent.ctrlKey != null && keyboardEvent.ctrlKey) {
		value += "Control, ";
	}
	if (keyboardEvent.altKey != null && keyboardEvent.altKey) {
		value += "Alt, ";
	}
	if (keyboardEvent.metaKey != null && keyboardEvent.metaKey) {
		value += "Meta, ";
	}
	if (value.length > 0) {
		return value.substr(0, value.length - 2); // Remove the last ', '
	}
	return "None";
}

enum MouseKeys {
	Left = 0,
	Middle = 1,
	Right = 2
}

function transformMouseButton(event: Event): string | undefined {
	const mouseEvent: Partial<MouseEvent> = event;

	const eventButton = mouseEvent.button;
	if (eventButton == null) {
		return undefined;
	}

	const button = MouseKeys[eventButton];

	// If it's not one of the main 3 buttons
	return button != null ? button.toString() : eventButton.toString();
}

// #endregion
