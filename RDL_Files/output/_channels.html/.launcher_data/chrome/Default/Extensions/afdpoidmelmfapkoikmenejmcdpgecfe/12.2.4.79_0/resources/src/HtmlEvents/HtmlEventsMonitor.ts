"use strict";

import { getLogger } from "../utils/log";
import * as Utils from "../utils/utils";
import * as DomUtils from "../dom/DomUtils";
import * as Consts from "../common/consts";
import * as PropertyTransformer from "./PropertyTransformer";
import * as InterestingEventsFilter from "./InterestingEventFilter";
import * as HtmlEventSanitizer from "./HtmlEventSanitizer";
import * as ContentEvents from "../common/helpers/ContentEvents";
import { Lazy } from "../utils/lazy";
import { Configuration } from "../common/configuration/Configuration";
// import { chrome } from "../common/globalChrome";
import { ExecutionLimiter, ExecutionBackoff } from "../performance/ExecutionLimiter";
import { DocumentTitleGetter } from "../DocumentTitle/DocumentTitleGetter";
import { timeProvider } from "../utils/timeProvider";
import { CSSSelectorsCollection } from "../dom/CSSSelectorsCollection";
import { PropertyMatch } from "../common/ConfigurationData";
import { BackgroundPageInformation, populateContentPageInformation } from "../common/PageInformation";
import { UXData } from "../common/UXData";
import * as EventNames from "../HtmlMonitoring/EventNames";
import {
	OutgoingLogMessage,
	OutgoingPageNativeMessage,
	OutgoingEventMessage
	} from "../common/MessagingModel";
import { WithCSSSelector } from "../HtmlMonitoring/AternityProperties";
import * as EventProperties from "../HtmlMonitoring/EventProperties";

type DocumentEvents = keyof DocumentEventMap;

/**
 * Monitors document object events.
 */
export class HtmlEventsMonitor {
	private static readonly EVERYTHING_EVENTS: ReadonlyArray<DocumentEvents> = [
		"click",
		"dblclick",
		"contextmenu",
		"keydown",
		"keypress",
		"keyup",
		"focus",
		"submit"];
	private static readonly ALL_KEY_PATHS: ReadonlyArray<string> = ["target", "target.attributes"];

	// tslint:disable-next-line readonly-array
	private eventListeners: { [id: string]: EventListener[] } = {};
	// tslint:disable-next-line readonly-array
	private readonly eventCssSelectors: { [cssSelector: string]: CSSSelectorsCollection } = {};

	/**
	 * Event to PropertyMatch array if defined in activity.
	 */
	private readonly eventTargetNodeNameMap: { [eventName: string]: ReadonlyArray<PropertyMatch> | undefined } = {};

	/**
	 * Initializes handlers of Chrome HTML events
	 */
	public constructor(
		private readonly configuration: Readonly<Configuration>,
		private readonly pageInformation: Readonly<BackgroundPageInformation>,
		private readonly executionLimiter: ExecutionLimiter,
		private readonly documentTitleGetter: DocumentTitleGetter) {
		this.registerForAllRequiredEvents();
	}

	private registerForAllRequiredEvents(): void {
		const eventsOfInterest = this.getEventsOfInterest();

		eventsOfInterest.forEach(eventName => {
			// If there's no documentUrl filter or the filter matches
			const passesDocumentUrlFilter =
				!this.configuration.hasPropertyMatchers(
						eventName,
						"documentUrl") ||
				this.configuration.isMatchEvent(
					eventName,
					"documentUrl",
					this.pageInformation.documentUrl);

			// If there's no documentCommittedUrl filter or the filter matches
			const passesDocumentCommittedUrlFilter =
				!this.configuration.hasPropertyMatchers(
					eventName,
					"documentCommittedUrl") ||
				this.configuration.isMatchEvent(
					eventName,
					"documentCommittedUrl",
					this.pageInformation.documentUrl);

			if (passesDocumentUrlFilter || passesDocumentCommittedUrlFilter) {
				const matchers = this.configuration
					.getPropertyMatchers(eventName, "aternityCSSSelector");

				this.eventCssSelectors[eventName] =
					CSSSelectorsCollection.fromSet(ContentEvents.getValidUnescapedSelectors(matchers));

				const targetNodeNameMatchers =
					this.configuration.getPropertyMatchers(eventName, EventProperties.TARGET_NODE_NAME_PROPERTY);
				if (targetNodeNameMatchers.length > 0) {
					this.eventTargetNodeNameMap[eventName] = targetNodeNameMatchers;
				}

				this.registerEventListener(eventName);
			} else {
				getLogger().info(`DocumentUrl ${this.pageInformation.documentUrl} is not a match and will not be monitored.`);
			}
		});
	}

	/**
	 * Uninitializes handlers of Chrome HTML events. Removes all the previously
	 * registered event listeners.
	 */
	public uninitialize(): void {
		const eventListeners = this.eventListeners;
		for (const eventType in eventListeners) {
			if (!eventListeners.hasOwnProperty(eventType)) continue;
			for (const listener of eventListeners[eventType]) {
				DomUtils.unsubscribeEventListener(document, eventType, listener, true);
			}
		}
		this.eventListeners = {};
	}

	/**
	 * @return Distinct list of events.
	 */
	private getEventsOfInterest(): Set<string> {
		const result = new Set<string>();

		const eventNames = this.configuration.globalEventConfiguration.eventFilters.getEventNames();
		for (const eventName of eventNames) {
			if (ContentEvents.isHtmlDocumentEvent(eventName)) {
				result.add(eventName);
			}
		}

		const everythingEventPrefixes = this.configuration.globalEventConfiguration.everythingPrefixEvents;
		// "everything" is only supported for designer events
		if (everythingEventPrefixes.some(prefix => ContentEvents.isDesignerHtmlDocumentEvent(prefix))) {
			for (const eventName of HtmlEventsMonitor.EVERYTHING_EVENTS) {
				result.add(`${EventNames.HTML_DESIGNER_EVENT_NAMESPACE}.${eventName}`);
			}
		}

		return result;
	}

	private registerEventListener(fullEventName: string): void {
		getLogger().info(`Registering for ${fullEventName}`);
		const listener = this.createEventListener(fullEventName);
		const eventNameIndex = fullEventName.lastIndexOf("."); // We assume there are not dots
		// in the actual event name
		const eventType = fullEventName.substr(eventNameIndex + 1);
		DomUtils.subscribeEventListener(document, eventType, listener, true);
		if (!this.eventListeners.hasOwnProperty(eventType)) {
			this.eventListeners[eventType] = [];
		}
		this.eventListeners[eventType].push(listener);
	}

	private createEventListener(fullEventName: string): EventListener {
		return (event: Event) => {
			try {
				// We are interested only in elements
				const target = event.target;
				if (DomUtils.isElement(target)) {
					this.handleEvent(event, target, fullEventName);
				}
			} catch (e) {
				getLogger().error(`Could not handle ${fullEventName}`, e);
			}
		};
	}

	private handleEvent(event: Event, element: Element, fullEventName: string): void {
		this.executionLimiter.doWork(fullEventName, () => {
			try {
				this.handleEventImpl(event, element, fullEventName);
			} catch (e) {
				getLogger().error(`Could not handle ${fullEventName}`, e);
			}
		});
	}

	private handleEventImpl(event: Event, element: Element, fullEventName: string): void {
		// Skip non-interesting events
		if (!InterestingEventsFilter.isInteresting(event)) {
			return;
		}

		// Skip non-interesting nodes
		const nodeNameMatchers = this.eventTargetNodeNameMap[fullEventName];
		if (nodeNameMatchers != null) {
			// If a targetNodeName was given then we must make sure it's a match
			const targetNodeName = element.nodeName;
			if (!this.configuration.isMatchEvent(
				fullEventName,
				EventProperties.TARGET_NODE_NAME_PROPERTY,
				targetNodeName)) {
				return;
			}
		}

		const cssSelectors = this.eventCssSelectors[fullEventName];

		// Do not test selector if it isn't relevant for this event
		if (cssSelectors.size === 0) {
			// checked
			const promise = chrome.runtime.sendMessage(
				 this.createDataMessage(
					fullEventName,
					event,
					this.configuration,
					this.pageInformation));
		} else {
			const matchingSelectors =
				this.getMatchingSelectors(
					cssSelectors,
					event,
					element,
					fullEventName);

			if (matchingSelectors.length > 0) {
				// checked
				const promise2 = chrome.runtime.sendMessage(
					this.createDataMessageWithCssSelector(
						fullEventName,
						event,
						ContentEvents.createAternityCssSelectorPayload(matchingSelectors),
						this.configuration,
						this.pageInformation));
			}
		}
	}

	private getMatchingSelectors(
		cssSelectors: CSSSelectorsCollection,
		event: Event,
		element: Element,
		fullEventName: string): string[] {

		const matchingSelectors: string[] = [];

		let processedSelectors = 0;
		let nextBackoff: ExecutionBackoff | undefined;
		let lastProcessedSelector = "";

		let longestSelectorTime = 0;
		let longestSelector = "";

		try {
			cssSelectors.matchesClosest(element, (selector, isClosest) => {
				nextBackoff = this.executionLimiter.doWork(`${fullEventName}: ${selector}`, () => {
					const start = timeProvider.now();

					if (isClosest()) {
						matchingSelectors.push(selector);
					}

					const end = timeProvider.now();
					const selectorTime = end - start;
					if (selectorTime > longestSelectorTime) {
						longestSelectorTime = selectorTime;
						longestSelector = selector;
					}

					lastProcessedSelector = selector;
					processedSelectors++;
				});

				if (nextBackoff != null) {
					throw new Error("HtmlEvents, Maximum allowed work time reached");
				}
			});
		} catch (e) {
			// NV prevention
			if (nextBackoff != null) {
				const nvMsg = ContentEvents.createNVWorkTimeViolationMessage(
					fullEventName,
					this.pageInformation,
					this.documentTitleGetter.getDocumentTitle(),
					nextBackoff.backoffInterval,
					nextBackoff.executionLimit.maxWorkTime,
					nextBackoff.executionLimit.timeFrame,
					nextBackoff.totalRunningTime,
					cssSelectors.size,
					processedSelectors,
					lastProcessedSelector,
					longestSelector,
					longestSelectorTime
				);
				// checked
				const promise = chrome.runtime.sendMessage(nvMsg);
				// checked
				const promise2 = chrome.runtime.sendMessage(
					new OutgoingLogMessage(Consts.LogLevel.ERROR, JSON.stringify(nvMsg)));

				getLogger().warn(e, nvMsg);
			} else {
				// Unexpected error
				const promise3 = chrome.runtime.sendMessage(
					new OutgoingLogMessage(Consts.LogLevel.ERROR, JSON.stringify(e)));

				getLogger().warn(document.URL, "Unexpected error", e);
			}
		}

		return matchingSelectors;
	}

	private getAllPrimitivePropertiesNamedNodeMap(
		nodeMap: NamedNodeMap,
		basePropertyName: string,
		eventName: string,
		configuration: Readonly<Configuration>): UXData {

		const result: UXData = {};

		for (let i = 0; i < nodeMap.length; ++i) {
			const node = nodeMap.item(i);
			// This cannot happen since i is in range [0, nodeMap.length), make type checker happy.
			if (node == null) continue;

			const properties = this.getAllPrimitivePropertiesObject(
				node,
				basePropertyName + "." + node.name,
				eventName,
				configuration);

			for (const p in properties) {
				if (!properties.hasOwnProperty(p)) continue;
				result[node.name + "." + p] = properties[p];
			}
		}

		return result;
	}

	private getAllPrimitiveProperties(
		obj: object | NamedNodeMap,
		basePropertyName: string,
		eventName: string,
		configuration: Readonly<Configuration>): UXData {
		if (obj instanceof NamedNodeMap) {
			return this
				.getAllPrimitivePropertiesNamedNodeMap(obj, basePropertyName, eventName, configuration);
		} else {
			return this
				.getAllPrimitivePropertiesObject(obj, basePropertyName, eventName, configuration);
		}
	}

	private getAllPrimitivePropertiesObject<T extends object>(
		obj: T,
		basePropertyName: string,
		eventName: string,
		configuration: Readonly<Configuration>): UXData {
		const result: UXData = {};

		// ReSharper disable once MissingHasOwnPropertyInForeach
		// Must not check hasOwnProperty since event is a special object.
		// tslint:disable-next-line no-unsafe-any
		for (const propertyName in obj) {
			try {
				const property = new Lazy(() => obj[propertyName] as unknown as (Utils.Primitive | Utils.Primitive[]));
				if (configuration.isMatchEvent(
					eventName,
					basePropertyName === "" ? propertyName : `${basePropertyName}.${propertyName}`,
					// We need another lazy here because the original property is not a string
					// but matching works with strings only
					// tslint:disable-next-line no-unsafe-any
					new Lazy(() => property.getValue().toString())) && Utils.isSerializablePrimitive(property.getValue())) {

					// tslint:disable-next-line no-unsafe-any
					result[propertyName] = property.getValue();
				}
			} catch (e) {
				getLogger().warn("Error while handling property", propertyName, `${e}`);
				const promise4 = chrome.runtime.sendMessage(
					new OutgoingLogMessage(
						Consts.LogLevel.WARN, `Error while handling property: ${e}`));
			}
		}

		return result;
	}

	private getAllProperties(
		event: Event,
		eventName: string,
		configuration: Readonly<Configuration>,
		eventData: UXData): void {

		Utils.populate(this.getAllPrimitiveProperties(event, "", eventName, configuration), eventData);

		for (const keyPath of HtmlEventsMonitor.ALL_KEY_PATHS) {
			const pathValue = Utils.pick(event, keyPath);
			if (pathValue !== undefined) {
				// tslint:disable-next-line no-unsafe-any
				const properties = this.getAllPrimitiveProperties(pathValue, keyPath, eventName, configuration);
				for (const p in properties) {
					if (!properties.hasOwnProperty(p)) continue;
					const prop = properties[p];
					eventData[keyPath + "." + p] =
						prop === null
						? ""
						: typeof prop === "string"
						? prop.substring(0, Math.min(prop.length, configuration.maxPropertyLength))
						: prop;
				}
			}
		}
	}

	private getMatchingProperties(
		event: Event,
		eventName: string,
		configuration: Readonly<Configuration>,
		eventData: UXData): void {

		// Nothing to add
		if (!configuration.globalEventConfiguration.eventFilters.hasFilter(eventName)) {
			return;
		}

		const filters = configuration.globalEventConfiguration.eventFilters.getEventFilters(eventName);
		if (!filters.hasRegexPropertyNames()) {
			// We can just get what we need without any matching
			const propertyNames = filters.getExactPropertyNames();
			for (const propertyName of propertyNames) {
				let value = Utils.pick(event, propertyName);
				if (typeof value === "undefined") {
					continue;
				}

				if (value === null) {
					value = "";
				}

				// tslint:disable no-unsafe-any
				if (configuration.isMatchEvent(eventName, propertyName, value)) {
					eventData[propertyName] =
						typeof value === "string" ?
						value.substring(0, Math.min(value.length, configuration.maxPropertyLength)) :
						value;
				}
				// tslint:enable no-unsafe-any
			}
		} else {
			this.getAllProperties(event, eventName, configuration, eventData);
		}
	}

	private createDataMessage(
		eventName: string,
		event: Readonly<Event>,
		configuration: Readonly<Configuration>,
		pageInformation: Readonly<BackgroundPageInformation>): OutgoingPageNativeMessage {
		return this.createDataMessageWithCssSelector(
			eventName,
			event,
			null,
			configuration,
			pageInformation);
	}

	private createDataMessageWithCssSelector(
		eventName: string,
		event: Readonly<Event>,
		cssSelector: string | null,
		configuration: Readonly<Configuration>,
		pageInformation: Readonly<BackgroundPageInformation>): OutgoingPageNativeMessage {

		const message = new OutgoingEventMessage<UXData>(eventName, timeProvider.now());

		const eventData = message.messageData.Data[0];

		this.populateWithAternityProperties(pageInformation, cssSelector, eventData);

		if (configuration.globalEventConfiguration.everythingPrefixEvents.some(
			p => ContentEvents.isDesignerHtmlDocumentEvent(p))) {

			this.getAllProperties(event, eventName, configuration, eventData);
		} else {
			this.getMatchingProperties(event, eventName, configuration, eventData);
		}

		Utils.populate(PropertyTransformer.getTransformedProperties(event), eventData);

		HtmlEventSanitizer.sanitizeEventData(event, eventData);

		return message;
	}

	private populateWithAternityProperties(
		pageInformation: BackgroundPageInformation,
		cssSelector: string | null,
		eventData: UXData): void {

		populateContentPageInformation(
			this.pageInformation,
			this.documentTitleGetter.getDocumentTitle(),
			eventData);

		if (cssSelector != null) {
			const withCSSSelector: Partial<WithCSSSelector> = eventData;
			withCSSSelector.aternityCSSSelector = cssSelector;
		}
	}
}
