import {
	ReadonlyConfigurationData,
	ConditionObject,
	ReadonlyConditionObject,
	PropertyMatch
} from "../ConfigurationData";
import * as Utils from "../../utils/utils";
import { RegExpMatcher } from "../../utils/RegExpMatcher";

/**
 * Gets the configuration for given consolidation keys
 *
 * @param configurationData Configuration data to extract configuration from.
 * @param consolidationKeys Mapping from consolidation key to value.
 */
export function getEventsForPage(
	configurationData: ReadonlyConfigurationData,
	consolidationKeys: { readonly [propertyName: string]: string }
	): ReadonlyConfigurationData {

	const result: { [eventName: string]: ConditionObject[]; } = {};

	for (const property in consolidationKeys) {
		if (!consolidationKeys.hasOwnProperty(property)) continue;

		const forProperty = configurationData.ConsolidatedEventConfig[property];
		if (forProperty == null) continue; // Then we don't have a consolidation by this property

		for (const filter in forProperty) {
			if (!forProperty.hasOwnProperty(filter)) continue;

			const matcher = new RegExpMatcher();
			matcher.addMatcher(filter, false);

			if (matcher.isMatch(consolidationKeys[property])) {
				const events = forProperty[filter];
				extendEventConfig(result, events);
			}
		}
	}

	const ret: ReadonlyConfigurationData = {
		ConfigurationVersion: configurationData.ConfigurationVersion,
		MaxPropertyLength: configurationData.MaxPropertyLength,
		VisibilityMonitoringIntervalMs: configurationData.VisibilityMonitoringIntervalMs,
		BackoffGracePeriodMs: configurationData.BackoffGracePeriodMs,
		ElementsDiscoveryIntervalMs: configurationData.ElementsDiscoveryIntervalMs,
		WorkTimeThresholds: configurationData.WorkTimeThresholds,
		EventConfig: result,
		ConsolidatedEventConfig: {},

		// DE22560: WPM is part of the configuration intended for the background only -
		// it's of no use to the content script
		WPMDocumentUrlFiltersList: [],
		WPMCommittedUrlFiltersList: [],
		FullWpmFiltersList: []
	};

	return ret;
}

function extendEventConfig(
	target: { [eventName: string]: ConditionObject[]; },
	source: { readonly [eventName: string]: ReadonlyArray<ReadonlyConditionObject>; }): void {

	for (const eventName in source) {
		if (!source.hasOwnProperty(eventName)) continue;
		const conditions = source[eventName];
		if (conditions.length !== 1) {
			throw new Error("Multiple ConditionObjects not supported");
		}

		if (!target.hasOwnProperty(eventName)) {
			// ReSharper 2017.3 bug workaround
			// tslint:disable-next-line no-unnecessary-type-assertion
			target[eventName] = Utils.deepClone(conditions) as ConditionObject[];
		} else {
			if (target[eventName].length !== 1) {
				throw new Error("Multiple ConditionObjects not supported");
			}
			const targetConditions = target[eventName][0].Conditions;
			const sourceConditions = conditions[0].Conditions;

			extendConditions(targetConditions, sourceConditions);
		}
	}
}

function comparePropertyMatch(a: PropertyMatch, b: PropertyMatch): boolean {
	return a.MatchType === b.MatchType && a.Value === b.Value;
}

function extendConditions(
	target: { [property: string]: PropertyMatch[]; },
	source: { readonly [property: string]: ReadonlyArray<Readonly<PropertyMatch>>; }): void {
	for (const propertyName in source) {
		if (!source.hasOwnProperty(propertyName)) continue;
		if (!target.hasOwnProperty(propertyName)) {
			// ReSharper 2017.3 bug workaround
			// tslint:disable-next-line no-unnecessary-type-assertion
			target[propertyName] = Utils.deepClone(source[propertyName]) as PropertyMatch[];
		} else {
			const targetMatchers = target[propertyName];
			const sourceMatcher = source[propertyName];
			for (const matcher of sourceMatcher) {
				if (targetMatchers.some(m => comparePropertyMatch(m, matcher))) {
					continue; // We already have it
				}
				targetMatchers.push(matcher);
			}
		}
	}
}
