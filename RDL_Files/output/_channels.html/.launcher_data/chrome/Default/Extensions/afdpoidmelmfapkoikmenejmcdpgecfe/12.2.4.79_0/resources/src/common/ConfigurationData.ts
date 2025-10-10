import { deepFreeze } from "../utils/utils";
import { BackgroundPageInformation } from "./PageInformation";

export interface PropertyMatch {
	// ReSharper disable InconsistentNaming
	Value: string;
	MatchType: string;
	// ReSharper restore InconsistentNaming
}

export interface ConditionObject {
	// ReSharper disable InconsistentNaming
	// tslint:disable-next-line readonly-array
	Conditions: { [property: string]: PropertyMatch[]; };
	// ReSharper restore InconsistentNaming
}

export interface ReadonlyConditionObject {
	// ReSharper disable InconsistentNaming
	// tslint:disable-next-line readonly-array
	readonly Conditions: { readonly [property: string]: ReadonlyArray<PropertyMatch>; };
	// ReSharper restore InconsistentNaming
}

// tslint:disable-next-line readonly-array
export interface ConditionsPerEvent { [eventName: string]: ConditionObject[]; }
export interface EventsPerPropertyValue { [propertyMatcher: string]: ConditionsPerEvent; }
export interface ConsolidatedEventConfig { [consolidationPropertyName: string]: EventsPerPropertyValue; }

export interface ReadonlyConditionsPerEvent { readonly [eventName: string]: ReadonlyArray<ReadonlyConditionObject>; }
export interface ReadonlyEventsPerPropertyValue { readonly [propertyMatcher: string]: ReadonlyConditionsPerEvent; }
export interface ReadonlyConsolidatedEventConfig { readonly [consolidationPropertyName: string]: ReadonlyEventsPerPropertyValue; }

export interface WorkTimeThreshold {
	// ReSharper disable InconsistentNaming
	WorkTime: number;
	TimeFrame: number;
	// ReSharper restore InconsistentNaming
}

/**
 * Must match names in the Agent !
 *
 * Must be synchronized with HtmlConfigurationData.
 */
export interface ConfigurationData {
	// ReSharper disable InconsistentNaming
	ConfigurationVersion: number;
	// tslint:disable-next-line readonly-array
	WPMDocumentUrlFiltersList: Array<string>;
	// tslint:disable-next-line readonly-array
	WPMCommittedUrlFiltersList: Array<string>;
	/**
	 * URL filter list for http:chrome:WebPage.PageLoad.
	 */
	// tslint:disable-next-line readonly-array
	FullWpmFiltersList: Array<string>;
	MaxPropertyLength: number;
	VisibilityMonitoringIntervalMs: number;
	ElementsDiscoveryIntervalMs: number;
	BackoffGracePeriodMs: number;
	// tslint:disable-next-line readonly-array
	WorkTimeThresholds: Array<WorkTimeThreshold>;
	EventConfig: ConditionsPerEvent;
	ConsolidatedEventConfig: ConsolidatedEventConfig;
	// ReSharper restore InconsistentNaming
}

/**
 * Must match names in the Agent !
 *
 * Must be synchronized with HtmlConfigurationData.
 */
export interface ReadonlyConfigurationData {
	// ReSharper disable InconsistentNaming
	readonly ConfigurationVersion: number;
	// tslint:disable-next-line readonly-array
	readonly WPMDocumentUrlFiltersList: ReadonlyArray<string>;
	// tslint:disable-next-line readonly-array
	readonly WPMCommittedUrlFiltersList: ReadonlyArray<string>;
	/**
	 * URL filter list for http:chrome:WebPage.PageLoad.
	 */
	// tslint:disable-next-line readonly-array
	readonly FullWpmFiltersList: ReadonlyArray<string>;
	readonly MaxPropertyLength: number;
	readonly VisibilityMonitoringIntervalMs: number;
	readonly ElementsDiscoveryIntervalMs: number;
	readonly BackoffGracePeriodMs: number;
	// tslint:disable-next-line readonly-array
	readonly WorkTimeThresholds: ReadonlyArray<Readonly<WorkTimeThreshold>>;
	readonly EventConfig: ReadonlyConditionsPerEvent;
	readonly ConsolidatedEventConfig: ReadonlyConsolidatedEventConfig;
	// ReSharper restore InconsistentNaming
}

export interface WpmParameters {
	/** WPM using HTML cartridge */
	wpm: boolean;
	/** WPM using UX cartridge http:chrome event */
	httpWebPageLoad: boolean;
}

/**
 * Parameters passed to content script.
 */
export interface ContentScriptParameters {
	configurationData: ReadonlyConfigurationData;
	pageInformation: BackgroundPageInformation;
	statusCode?: number;
	wpmParameters: WpmParameters;
	/**
	 * Document title.
	 * Ignored by frames that are in the same domain, since they can access top frame title directly.
	 */
	documentTitle?: string;
}

export interface WpmStatusCodeResponse {
	statusCode: number;
}

/**
 * Configuration version format.
 */
export const CONFIGURATION_VERSION = 2;

export const VISIBILITY_MONITORING_INTERVAL_MS = 300;

export const ELEMENTS_DISCOVERY_INTERVAL_MS = 1500;

export const DEFAULT_BACKOFF_GRACE_PERIOD = 1000;

export const MAX_PROPERTY_LENGTH = 256;

const WORKTIME_THRESHOLD_ALLOW_ALL = [{ WorkTime: 1000000, TimeFrame: 1000000 }];

function makeMutableDefaultConfiguration(
	wpmUrl: string,
	eventConfig: ConditionsPerEvent,
	allowEvents: boolean): ConfigurationData {

	const ret: ConfigurationData = {
		ConfigurationVersion: CONFIGURATION_VERSION,
		MaxPropertyLength: MAX_PROPERTY_LENGTH,
		WPMDocumentUrlFiltersList: [wpmUrl],
		WPMCommittedUrlFiltersList: [wpmUrl],
		FullWpmFiltersList: [wpmUrl],
		EventConfig: eventConfig,
		WorkTimeThresholds: allowEvents ? WORKTIME_THRESHOLD_ALLOW_ALL : [],
		ConsolidatedEventConfig: {},
		VisibilityMonitoringIntervalMs: VISIBILITY_MONITORING_INTERVAL_MS,
		ElementsDiscoveryIntervalMs: ELEMENTS_DISCOVERY_INTERVAL_MS,
		BackoffGracePeriodMs: DEFAULT_BACKOFF_GRACE_PERIOD
	};

	return ret;
}

function makeReadonlyDefaultConfiguration(
	wpmUrl: string,
	eventConfig: ConditionsPerEvent,
	allowEvents: boolean): ReadonlyConfigurationData {

	const configurationData = makeMutableDefaultConfiguration(wpmUrl, eventConfig, allowEvents);
	// Workaround ReSharper 2017.3 bug, specify generic parameter explicitly
	return deepFreeze<ReadonlyConfigurationData>(configurationData);
}

/** Default configuration, do nothing. */
export const EMPTY_CONFIGURATION = makeReadonlyDefaultConfiguration("", {}, false);

/* Starting configuration to be overwritten by configuration from the Agent. */
export const STARTING_CONFIGURATION = makeMutableDefaultConfiguration("", {}, false);

/** Report everything configuration */
export const REPORT_EVERYTHING_CONFIGURATION =
	makeReadonlyDefaultConfiguration(
		".*",
		{
			Everything: [],
			"ui:chrome:Tab.Everything": [],
			"ui:chrome:Document.Everything": []
		},
		true);

/** Report wpm configuration */
export const REPORT_WPM_CONFIGURATION =
	makeReadonlyDefaultConfiguration(
		".*",
		{
			"http:chrome:WebPage.Everything": [],
			"wpm:chrome:Page.Everything": []
		},
		true);
