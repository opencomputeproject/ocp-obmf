"use strict";

import * as Utils from "../../utils/utils";
import * as ConfigurationUtils from "./ConfigurationUtils";
import {
	ReadonlyConfigurationData,
	PropertyMatch,
	VISIBILITY_MONITORING_INTERVAL_MS,
	ELEMENTS_DISCOVERY_INTERVAL_MS,
	STARTING_CONFIGURATION
} from "../ConfigurationData";
import { CanbeLazy } from "../../utils/lazy";
import { RegExpMatcher } from "../../utils/RegExpMatcher";
import { EventConfiguration } from "./EventConfiguration";
import { BackgroundPageInformation } from "../PageInformation";
import { WithCSSSelector } from "../../HtmlMonitoring/AternityProperties";
import { TARGET_NODE_NAME_PROPERTY } from "../../HtmlMonitoring/EventProperties";

// tslint:disable-next-line no-require-imports
import SimpleLRU = require("simple-lru");

const MAX_CONFIGURATION_CACHE_SIZE = 100;

type PropertyMatcherName =
	keyof BackgroundPageInformation |
	keyof WithCSSSelector |
	typeof TARGET_NODE_NAME_PROPERTY;

/**
 * Encapsulates Data.Configuration
 */
export class Configuration {
	/**
	 * WPM using HTML cartridge for navigation url.
	 */
	private readonly wpmDocumentUrlFilters: RegExpMatcher;

	/**
	 * WPM using HTML cartridge for committed url.
	 */
	private readonly wpmCommittedUrlFilters: RegExpMatcher;

	/**
	 * http:chrome:WebPage.PageLoad.
	 */
	private readonly httpWebPageLoadUrlFilters: RegExpMatcher;

	public readonly globalEventConfiguration: EventConfiguration;

	private readonly specializedEventConfiguration: {
		 [consolidationProperty: string]: {
			  [matcher: string]: Readonly<EventConfiguration>
		 }
	} = {};

	public readonly maxPropertyLength: number;

	public readonly visibilityMonitoringIntervalMs: number;

	public readonly elementsDiscoveryIntervalMs: number;

	private readonly configurationData: ReadonlyConfigurationData;

	private readonly configurationDataCache = new SimpleLRU<string, ReadonlyConfigurationData>(MAX_CONFIGURATION_CACHE_SIZE);

	public getEventsForPage(
		consolidationKeys: { [consolidationPropertyName: string]: string }): ReadonlyConfigurationData {

		const key = JSON.stringify(consolidationKeys);

		const configurationDataFromCache = this.configurationDataCache.get(key);
		if (configurationDataFromCache != null) {
			return configurationDataFromCache;
		}

		const configuration = ConfigurationUtils.getEventsForPage(this.configurationData, consolidationKeys);
		this.configurationDataCache.set(key, configuration);
		return configuration;
	}

	constructor(configurationData: Partial<ReadonlyConfigurationData>) {
		this.configurationData = STARTING_CONFIGURATION;
		Utils.populate(configurationData, this.configurationData);

		this.maxPropertyLength =
			configurationData.MaxPropertyLength != null
			? configurationData.MaxPropertyLength
			: VISIBILITY_MONITORING_INTERVAL_MS;

		this.visibilityMonitoringIntervalMs =
			configurationData.VisibilityMonitoringIntervalMs != null
			? configurationData.VisibilityMonitoringIntervalMs
			: VISIBILITY_MONITORING_INTERVAL_MS;

		this.elementsDiscoveryIntervalMs =
			configurationData.ElementsDiscoveryIntervalMs != null
			? configurationData.ElementsDiscoveryIntervalMs
			: ELEMENTS_DISCOVERY_INTERVAL_MS;

		// WPM
		this.wpmDocumentUrlFilters = new RegExpMatcher();
		if (configurationData.WPMDocumentUrlFiltersList != null) {
			for (const wpmUrlFilter of configurationData.WPMDocumentUrlFiltersList) {
				this.wpmDocumentUrlFilters.addMatcher(wpmUrlFilter, false);
			}
		}

		this.wpmCommittedUrlFilters = new RegExpMatcher();
		if (configurationData.WPMCommittedUrlFiltersList != null) {
			for (const wpmUrlFilter of configurationData.WPMCommittedUrlFiltersList) {
				this.wpmCommittedUrlFilters.addMatcher(wpmUrlFilter, false);
			}
		}

		// Full page
		this.httpWebPageLoadUrlFilters = new RegExpMatcher();
		if (configurationData.FullWpmFiltersList != null) {
			for (const fullWpmUrlFilter of configurationData.FullWpmFiltersList) {
				this.httpWebPageLoadUrlFilters.addMatcher(fullWpmUrlFilter, false, true);
			}
		}

		const eventConfig = configurationData.EventConfig != null ? configurationData.EventConfig : {};
		this.globalEventConfiguration = new EventConfiguration(eventConfig);
		const consolidatedEventConfig = configurationData.ConsolidatedEventConfig;

		if (consolidatedEventConfig != null) {
			for (const consolidationProperty in consolidatedEventConfig) {
				if (!consolidatedEventConfig.hasOwnProperty(consolidationProperty)) continue;
				const consolidatedConfiguration = consolidatedEventConfig[consolidationProperty];

				for (const matcher in consolidatedConfiguration) {
					if (!consolidatedConfiguration.hasOwnProperty(matcher)) continue;
					if (this.specializedEventConfiguration[consolidationProperty] == null) {
						this.specializedEventConfiguration[consolidationProperty] = {};
					}
					this.specializedEventConfiguration[consolidationProperty][matcher] =
						new EventConfiguration(consolidatedConfiguration[matcher]);
				}
			}
		}
	}

	public hasEventFilter(eventName: string): boolean {
		// Check both in event filters and in everything prefixes.
		return this.globalEventConfiguration.eventFilters.hasFilter(eventName) || this.isMatchEverything(eventName);
	}

	/**
	 * Check if the given monitoringEvent is monitored.
	 *
	 * For given event http:chrome:WebRequest.Start those even categories return true:
	 * http:chrome:WebRequest
	 * http:chrome
	 * http
	 *
	 * @return true if monitored, false otherwise.
	 */
	public isMonitoring(monitoringEvent: string): boolean {
		// Check event filter
		if (this.hasEventFilter(monitoringEvent)) {
			return true;
		}

		// Check everything event filters by prefix
		for (const everythingEventFilter of this.globalEventConfiguration.everythingPrefixEvents) {
			if (Utils.startsWith(everythingEventFilter, monitoringEvent)) return true;
		}

		// Check event filters by prefix
		for (const eventFilter of this.globalEventConfiguration.eventFilters.getEventNames()) {
			if (Utils.startsWith(eventFilter, monitoringEvent)) return true;
		}

		return false;
	}

	public isMatchEvent(eventName: string, propertyName: string, input: CanbeLazy<string>): boolean {
		// Check both in event filters and in everything prefixes.
		return this.isMatchEverything(eventName) ||
			this.globalEventConfiguration.eventFilters.isMatch(eventName, propertyName, input);
	}

	private isMatchEverything(eventName: string): boolean {
		return this.globalEventConfiguration.everythingPrefixEvents.some(p => Utils.startsWith(eventName, p));
	}

	public isMatchWebRequestEvent(propertyName: string, input: string): boolean {
		// First check whether event is in everything filters
		if (this.globalEventConfiguration.webRequestEverything) {
			return true;
		}

		return this.globalEventConfiguration.webRequestFilters.isMatch(propertyName, input);
	}

	public hasWebRequestFilter(propertyName: string): boolean {
		// First check whether event is in everything filters
		if (this.globalEventConfiguration.webRequestEverything) {
			return true;
		}

		return this.globalEventConfiguration.webRequestFilters.hasFilter(propertyName);
	}

	public isMatchForWpmUrls(documentUrl: string, documentCommittedUrl?: string): boolean {
		if (this.wpmDocumentUrlFilters.isMatch(documentUrl)) {
			return true;
		}

		if (documentCommittedUrl != null) {
			return this.wpmCommittedUrlFilters.isMatch(documentCommittedUrl);
		}

		return false;
	}

	public isMatchForHttpWebPageLoadUrl(url: string): boolean {
		return this.httpWebPageLoadUrlFilters.isMatch(url);
	}

	public hasWpmFilter(): boolean {
		return this.wpmDocumentUrlFilters.hasMatcher() ||
			this.wpmCommittedUrlFilters.hasMatcher() ||
			this.httpWebPageLoadUrlFilters.hasMatcher();
	}

	public getPropertyMatchers(eventName: string, propertyName: PropertyMatcherName): PropertyMatch[] {
		const result: PropertyMatch[] = [];
		const eventConfig = this.configurationData.EventConfig[eventName];
		if (typeof eventConfig === "undefined") {
			return result;
		}

		for (const conditions of eventConfig) {
			const propertyConditions = conditions.Conditions[propertyName];
			if (typeof propertyConditions === "undefined") {
				continue;
			}
			for (const propertyMatch of propertyConditions) {
				result.push(propertyMatch);
			}
		}

		return result;
	}

	public hasPropertyMatchers(eventName: string, propertyName: PropertyMatcherName): boolean {
		const eventConfig = this.configurationData.EventConfig[eventName];
		if (typeof eventConfig === "undefined") {
			return false;
		}

		for (const conditions of eventConfig) {
			const propertyConditions = conditions.Conditions[propertyName];
			if (typeof propertyConditions === "undefined") {
				continue;
			}
			return true;
		}

		return false;
	}
}
// #endregion
