import * as Utils from "../../utils/utils";
import * as Consts from "../consts";
import { ConfigurationFilters } from "./ConfigurationFilters";
import { EventFilters } from "./EventFilters";
import { ReadonlyConditionObject } from "../ConfigurationData";

/*
 * Report everything for this event.
 */
const EVERYTHING_EVENT_SUFFIX = new RegExp("(.*)" + Consts.REPORT_EVERYTHING + "$");

/*
 * The properties which must be send to the agent with any event
 */
const MANDATORY_PROPERTIES: ReadonlyArray<string> = ["tabId"];

export class EventConfiguration {
	public readonly eventFilters: EventFilters;

	/**
	 * Events prefixes which report everything.
	 */
	// tslint:disable-next-line readonly-array
	public readonly everythingPrefixEvents: string[];

	public readonly webRequestFilters: ConfigurationFilters;

	public webRequestEverything: boolean = false;

	// tslint:disable-next-line readonly-array
	public constructor(eventToLevels: { readonly [eventName: string]: ReadonlyArray<ReadonlyConditionObject>; }) {
		this.eventFilters = new EventFilters();
		this.everythingPrefixEvents = [];

		this.webRequestEverything = false;
		this.webRequestFilters = new ConfigurationFilters();

		for (const eventName in eventToLevels) {
			if (!eventToLevels.hasOwnProperty(eventName)) continue;
			if (this.tryAddEverything(eventName)) {
				continue;
			}

			const levels = eventToLevels[eventName];
			// Currently we support only one level
			for (let i = 0; i < Math.min(levels.length, 1); i++) {
				const conditions = levels[i].Conditions;
				for (const propertyName in conditions) {
					if (!conditions.hasOwnProperty(propertyName)) continue;
					const matchers = conditions[propertyName];
					for (const matcher of matchers) {
						const value = matcher.Value;
						const isExact = matcher.MatchType === "exact";
						this.addFilter(eventName, propertyName, value, isExact);
					}
				}
			}
		}

		this.verifyMandatoryProperties();
	}

	private tryAddEverything(eventName: string): boolean {
		// Test for everything case
		const everythingMatch = eventName.match(EVERYTHING_EVENT_SUFFIX);
		if (everythingMatch != null) {
			const eventPrefix = everythingMatch[1];

			// Add if hasn't been added before
			if (this.everythingPrefixEvents.indexOf(eventPrefix) === -1) {
				this.everythingPrefixEvents.push(eventPrefix);
			}

			// Special WebRequest everything case
			this.webRequestEverything =
				this.webRequestEverything ||
				Utils.startsWith(Consts.WEBREQUEST_EVENT_NAMESPACE, eventPrefix) ||
				eventPrefix.length === 0 ||
				Consts.WEBREQUEST_EVENT_RE.test(eventPrefix);

			return true;
		} else {
			return false;
		}
	}

	private addFilter(eventName: string, propertyName: string, value: string, isExact: boolean): void {
		const configPropertyName = EventConfiguration.normalizeProperty(propertyName);

		// Special webRequest properties.
		if (Consts.WEBREQUEST_EVENT_RE.test(eventName)) {
			this.webRequestFilters.addFilter(
				configPropertyName,
				value,
				isExact);
		}

		this.eventFilters.addFilter(
			eventName,
			configPropertyName,
			value,
			isExact);
	}

	private static readonly HEADER_PROPERTY = /^(requestHeader|responseHeader)(.*)/;

	/**
	 * Convert header property to be lower case.
	 * Leave other properties as-is.
	 */
	private static normalizeProperty(propertyName: string): string {
		const groups = propertyName.match(EventConfiguration.HEADER_PROPERTY);
		if (groups != null) {
			return groups[1] + groups[2].toLowerCase();
		} else {
			return propertyName;
		}
	}

	// Make sure that all the mandatory property names are in the configuration
	private verifyMandatoryProperties(): void {
		for (const propertyName of MANDATORY_PROPERTIES) {
			for (const event of this.eventFilters.getEventNames()) {
				this.addFilter(event, propertyName, ".*", false);
			}
		}
	}
}
