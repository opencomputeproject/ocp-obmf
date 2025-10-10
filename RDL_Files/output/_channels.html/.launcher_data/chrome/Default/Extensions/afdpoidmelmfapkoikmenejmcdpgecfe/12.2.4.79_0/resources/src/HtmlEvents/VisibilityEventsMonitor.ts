"use strict";

import { getLogger } from "../utils/log";
import * as DomUtils from "../dom/DomUtils";
import * as Consts from "../common/consts";
// import { chrome } from "../common/globalChrome";
import { ExecutionLimiter, ExecutionBackoff, ExecutionWorkLimiter } from "../performance/ExecutionLimiter";
import { DocumentTitleGetter } from "../DocumentTitle/DocumentTitleGetter";
import { timeProvider } from "../utils/timeProvider";
import { CSSSelectorsCollection } from "../dom/CSSSelectorsCollection";
import { setUnion, setToArray, setFromArray } from "../utils/SetOperations";
import {
	ElementsStateManager,
	SelectorMonitoring,
	ElementsBySelector,
	ElementsSelectorMonitoring,
	ReadonlyElementsBySelector
	} from "./ElementsStateManager";
import { MutationObserverManager } from "../dom/MutationObserverManager";
import { BackgroundPageInformation, populateContentPageInformation } from "../common/PageInformation";
import { OutgoingLogMessage, OutgoingEventMessage } from "../common/MessagingModel";
import { UXData } from "../common/UXData";
import { Configuration } from "../common/configuration/Configuration";
import * as EventNames from "../HtmlMonitoring/EventNames";
import * as AternityProperties from "../HtmlMonitoring/AternityProperties";
import * as ContentEvents from "../common/helpers/ContentEvents";

/**
 * Selector to Count mapping
 */
interface CSSSelectorsReport {
	[cssSelector: string]: number;
}

/**
 * @return true if mutation changes the DOM significantly.
 */
function isMutationInteresting(mutations: ReadonlyArray<MutationRecord>): boolean {
	return mutations.some(mutation => !(mutation.type === "attributes" && mutation.attributeName === "style"));
}

const EMPTY_MAP: ReadonlyMap<string, ElementsSelectorMonitoring> = new Map();

/**
 * Monitors elements visibility.
 * This class preserves visible elements state and compares new visible elements with previous ones.
 */
export class VisibilityEventsMonitor {
	private readonly allVisibilitySelectors: CSSSelectorsCollection<SelectorMonitoring>;

	private readonly elementsStateManager: ElementsStateManager;

	private readonly mutationObserverDiscovery?: MutationObserverManager;

	/**
	 * Initializes handlers of Chrome DOM events.
	 * Stops any previous handler.
	 */
	constructor(
		private readonly configuration: Readonly<Configuration>,
		private readonly pageInformation: Readonly<BackgroundPageInformation>,
		private readonly executionLimiter: ExecutionLimiter,
		private readonly documentTitleGetter: DocumentTitleGetter) {

		getLogger().info("Initializing DOM events...");

		this.elementsStateManager = new ElementsStateManager(DomUtils.isElementVisible);

		// Initialize CSS selectors collection
		const visibleSelectors = this.extractVisibilitySelectors(EventNames.VISIBLE_EVENT_NAME);
		const invisibleSelectors = this.extractVisibilitySelectors(EventNames.INVISIBLE_EVENT_NAME);

		this.allVisibilitySelectors = new CSSSelectorsCollection<SelectorMonitoring>();
		setUnion(visibleSelectors, invisibleSelectors).forEach(selector => {
			this.allVisibilitySelectors.add(
				selector,
				{
					monitorVisible: visibleSelectors.has(selector),
					monitorInvisible: invisibleSelectors.has(selector)
				});
		});

		// If there are no selectors, don't monitor visibility.
		if (this.allVisibilitySelectors.size === 0) {
			return;
		}

		// Subscribe only to relevant events
		const attributesInSelectors = this.allVisibilitySelectors.getAttributesInSelectors();
		const mutationObserverDiscoveryOptions: MutationObserverInit = {
			childList: true,
			subtree: true,
			characterData: this.allVisibilitySelectors.hasTextMatchingSelector()
		};

		// Add attributes if required
		if (attributesInSelectors.size > 0) {
			mutationObserverDiscoveryOptions.attributes = true;
			mutationObserverDiscoveryOptions.attributeFilter = setToArray(attributesInSelectors);
		}

		this.mutationObserverDiscovery = new MutationObserverManager(
			mutationObserverDiscoveryOptions,
			document,
			this.onPageMutationDiscovery);


		// Visibility testing is much cheaper than DOM scans, so as an optimization we add a second MutationObserver
		// That runs more often

		// Any DOM mutation can affect visibility.
		const mutationObserverVisibilityOptions: MutationObserverInit = {
			childList: true,
			subtree: true,
			attributes: true
		};
		this.mutationObserverVisibility = new MutationObserverManager(
			mutationObserverVisibilityOptions,
			document,
			this.onPageChange);

		this.initializeDiscovery();
		this.initializeVisibility();
	}

	/**
	 * @return Distinct list of selectors for given event.
	 */
	private extractVisibilitySelectors(fullEventName: string): Set<string> {
		// If there's no documentUrl filter or the filter matches
		const passesDocumentUrlFilter =
			!this.configuration.hasPropertyMatchers(
				fullEventName,
				"documentUrl") ||
			this.configuration.isMatchEvent(
				fullEventName,
				"documentUrl",
				this.pageInformation.documentUrl);

		// If there's no documentCommittedUrl filter or the filter matches
		const passesDocumentCommittedUrlFilter =
			!this.configuration.hasPropertyMatchers(
				fullEventName,
				"documentCommittedUrl") ||
			this.configuration.isMatchEvent(
				fullEventName,
				"documentCommittedUrl",
				this.pageInformation.documentUrl);

		if (passesDocumentUrlFilter || passesDocumentCommittedUrlFilter) {
			const matchers = this.configuration
				.getPropertyMatchers(fullEventName, "aternityCSSSelector");
			return ContentEvents.getValidUnescapedSelectors(matchers);
		} else { // No need in selectors
			return new Set<string>();
		}
	}

	/**
	 * Uninitializes handlers of Chrome DOM events. Removes all the previously
	 * registered event listeners and stops monitoring for visibility.
	 */
	public uninitialize(): void {
		getLogger().info("Uninitializing DOM events...");
		this.uninitializeDiscovery();
		this.uninitializeVisibility();
	}

	// #region Periodic elements discovery

	private elementsMonitoringTimerId: number = 0;

	private initializeDiscovery(): void {
		this.scheduleDiscovery(0);
	}

	private uninitializeDiscovery(): void {
		// Stop observer
		if (this.mutationObserverDiscovery != null) {
			this.mutationObserverDiscovery.disconnect();
		}

		// Stop timer
		if (this.elementsMonitoringTimerId !== 0) {
			window.clearTimeout(this.elementsMonitoringTimerId);
			this.elementsMonitoringTimerId = 0;
		}
	}

	private discoverElements(): void {
		this.executionLimiter.doWork("Discovery",
			() => {
				try {
					let currentElementsBySelector: ReadonlyElementsBySelector | undefined;

					this.executionLimiter.doWork("Discovery. Find elements",
						() => {
							currentElementsBySelector = this.getCurrentElementsBySelector();
						});

					this.executionLimiter.doWork("Discovery. Update elements state",
						() => {
							if (currentElementsBySelector != null) {
								this.updateElementsState(currentElementsBySelector);
							}
						});

				} catch (e) {
					getLogger().error("Error while discovering elements", e);
				}
			});

		if (this.mutationObserverDiscovery != null) {
			this.mutationObserverDiscovery.observe();
		}
	}

	private setupNextElementsCycle(nextTimeout: number): void {
		// Take maximum from visibility interval configuration and return from discoverElements
		const timeout = Math.max(
			nextTimeout,
			this.configuration.elementsDiscoveryIntervalMs);
		this.scheduleDiscovery(timeout);
	}

	private scheduleDiscovery(timeout: number): void {
		this.elementsMonitoringTimerId = window.setTimeout(() => {
				try {
					this.elementsMonitoringTimerId = 0;
					this.discoverElements();
				} catch (e) {
					getLogger().error("Error while monitoring visibility", e);
				}
			},
			timeout);
	}

	private readonly onPageMutationDiscovery = (mutations: MutationRecord[]) => {
		if (!isMutationInteresting(mutations)) return;

		if (this.mutationObserverDiscovery != null) {
			this.mutationObserverDiscovery.disconnect();
		}
		this.setupNextElementsCycle(0);
	}

	// #endregion

	// #region Elements discovery

	/**
	 * Compare known elements with current elements and update elements state.
	 * If visible element is added and there is matching visibility selector, report Visible event.
	 * If element is removed and there is matching invisibility selector, report Invisible event.
	 */
	private updateElementsState(currentElementsBySelector: ReadonlyElementsBySelector): void {
		// Reporting data
		const visibleData: CSSSelectorsReport = {};
		const invisibleData: CSSSelectorsReport = {};

		// Iterate all selectors and compare elements with stored elements.
		this.elementsStateManager.updateElements(
			currentElementsBySelector,
			selector => {
				if (visibleData[selector] == null) visibleData[selector] = 0;
				++visibleData[selector];
			},
			selector => {
				if (invisibleData[selector] == null) invisibleData[selector] = 0;
				++invisibleData[selector];
			});

		// Report found visible and invisible elements
		this.reportVisibility(EventNames.VISIBLE_EVENT_NAME, visibleData);
		this.reportVisibility(EventNames.INVISIBLE_EVENT_NAME, invisibleData);
	}

	/**
	 * Retrieve current element state.
	 *
	 * New visible elements are reported as visible.
	 * Removed elements are reported as invisible.
	 */
	private getCurrentElementsBySelector(): ReadonlyElementsBySelector {
		let processedSelectors = 0;
		let nextBackoff: ExecutionBackoff | undefined;
		let lastProcessedSelector = "";
		let longestSelector = "";
		let longestSelectorTime = 0;

		// Currently discovered elements to be compared with knownElements
		let discoveredElements: ElementsBySelector | undefined;

		try {
			this.allVisibilitySelectors.matchElements((selector, getElements, selectorsMonitoring) => {
				nextBackoff = this.executionLimiter.doWork(`Discovery. Find elements for: ${selector}`, () => {
					const start = timeProvider.now();

					const elements = getElements();

					// Create map when we get here first time.
					if (discoveredElements == null) {
						discoveredElements = new Map();
					}

					discoveredElements.set(
						selector,
						{
							elements: setFromArray(elements, element => element instanceof HTMLElement) as Set<HTMLElement>,
							monitoring: selectorsMonitoring
						});

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
					throw new Error("DomEvents. Elements discovery. Maximum allowed work time reached");
				}
			});
		} catch (e) {
			// NV prevention
			if (nextBackoff != null) {
				const nvMsg = ContentEvents.createNVWorkTimeViolationMessage(
					"Discovery elements",
					this.pageInformation,
					this.documentTitleGetter.getDocumentTitle(),
					nextBackoff.backoffInterval,
					nextBackoff.executionLimit.maxWorkTime,
					nextBackoff.executionLimit.timeFrame,
					nextBackoff.totalRunningTime,
					this.allVisibilitySelectors.size,
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
					new OutgoingLogMessage(
						Consts.LogLevel.ERROR,
						JSON.stringify(e)));

				getLogger().warn(document.URL, "Unexpected error", e);
			}
		}

		// Return elements discovered so far.
		return discoveredElements != null ? discoveredElements : EMPTY_MAP;
	}

	// #endregion

	// #region Messaging

	private createDataMessage(
		eventName: string,
		cssSelectorsReport: Readonly<CSSSelectorsReport>): OutgoingEventMessage<UXData> {

		const message = new OutgoingEventMessage<UXData>(eventName, timeProvider.now());

		const eventData = message.messageData.Data[0];

		populateContentPageInformation(
			this.pageInformation,
			this.documentTitleGetter.getDocumentTitle(),
			eventData);

		const cssSelectors = Object.keys(cssSelectorsReport);
		if (cssSelectors.length > 0) {
			const withCSSSelector: Partial<AternityProperties.WithCSSSelector> = eventData;
			withCSSSelector.aternityCSSSelector =
				ContentEvents.createAternityCssSelectorPayload(cssSelectors);

			for (const cssSelector of cssSelectors) {
				eventData[
					`${AternityProperties.ATERNITY_ELEMENTS_COUNT_PROPERTY_NAME}.${cssSelector}`] = cssSelectorsReport[cssSelector];
			}
		}

		return message;
	}

	// #endregion

	/**
	 * Report visibility event if there is any css selector with changed visibility.
	 *
	 * @param eventName Event name to use for the report
	 * @param cssSelectors CSS selectors which were affected.
	 */
	private reportVisibility(eventName: string, cssSelectorsReport: Readonly<CSSSelectorsReport>): void {
		if (Object.keys(cssSelectorsReport).length > 0) {
			const message = this.createDataMessage(eventName, cssSelectorsReport);
			getLogger().info("Reporting visibility -> ", message);
			// checked
			const promise = chrome.runtime.sendMessage(message);
		}
	}

	// #region Visibility periodic monitoring

	private visibilityTimerId: number = 0;
	private readonly mutationObserverVisibility?: MutationObserverManager;

	private handlingVisibilityNow: boolean = false;

	private initializeVisibility(): void {
		this.scheduleVisibilityMonitoring(0);
	}

	private uninitializeVisibility(): void {
		// Stop observer
		if (this.mutationObserverVisibility != null) {
			this.mutationObserverVisibility.disconnect();
		}

		// Stop timer
		if (this.visibilityTimerId !== 0) {
			window.clearTimeout(this.visibilityTimerId);
			this.visibilityTimerId = 0;
		}
	}

	/**
	 * Check which elements turned to be visible and which ones turned to be invisible.
	 */
	private monitorVisibility(): void {
		try {
			this.executionLimiter.doWork("Visibility",
				workLimiter => {
					try {
						this.testElementsVisibility(workLimiter);
					} catch (e) {
						getLogger().error("Error while monitoring visibility", e);
					}
				});
		} catch (ee) {
			getLogger().error("Cannot run visibility check", ee);
		}

		this.subscribeAllVisibility();
	}

	/**
	 * Tests all stored elements for visibility change.
	 * Reports the relevant event if state was changed.
	 */
	private testElementsVisibility(workLimiter: ExecutionWorkLimiter): void {
		// Reporting data
		const visibleData: CSSSelectorsReport = {};
		const invisibleData: CSSSelectorsReport = {};

		let processedElements = 0;
		let nextBackoff: ExecutionBackoff | undefined;
		let lastProcessedElement = "";
		let longestElement = "";
		let longestVisibleTime = 0;

		try {
			// Some counter to distinguish between different elements.
			let i = 0;
			// Iterate all elements and check visibility state
			this.elementsStateManager.iterateElements((elementData, element) => {
				const start = timeProvider.now();

				// Test visibility
				const currentlyVisible = DomUtils.isElementVisible(element);

				const elementDescription = `Visibility element ${element.tagName}, #${element.id}, .${element.className}, ${i++}`;

				const end = timeProvider.now();
				const visibleTime = end - start;
				if (visibleTime > longestVisibleTime) {
					longestVisibleTime = visibleTime;
					longestElement = elementDescription;
				}

				++processedElements;
				lastProcessedElement = elementDescription;

				if (currentlyVisible === elementData.currentlyVisible) return;

				// Update visible state
				elementData.currentlyVisible = currentlyVisible;

				// Add all element selectors to report
				const reportData = currentlyVisible ? visibleData : invisibleData;
				const reportSelectors =
					currentlyVisible ? elementData.visibleSelectors : elementData.invisibleSelectors;

				reportSelectors.forEach(cssSelector => {
					if (reportData[cssSelector] == null) reportData[cssSelector] = 0;
					++reportData[cssSelector];
				});

				nextBackoff = workLimiter.nextBackoff();
				if (nextBackoff != null) {
					throw new Error("VisibilityEventsMonitor. Visibility monitoring. Maximum allowed work time reached");
				}
			});
		} catch (e) {
			// NV prevention
			if (nextBackoff != null) {
				const nvMsg = ContentEvents.createNVWorkTimeViolationMessage(
					"Test visibility",
					this.pageInformation,
					this.documentTitleGetter.getDocumentTitle(),
					nextBackoff.backoffInterval,
					nextBackoff.executionLimit.maxWorkTime,
					nextBackoff.executionLimit.timeFrame,
					nextBackoff.totalRunningTime,
					this.allVisibilitySelectors.size,
					processedElements,
					lastProcessedElement,
					longestElement,
					longestVisibleTime);
				// checked
				const promise = chrome.runtime.sendMessage(nvMsg);
				// checked
				const promise2 = chrome.runtime.sendMessage(
					new OutgoingLogMessage(Consts.LogLevel.ERROR, JSON.stringify(nvMsg)));

				getLogger().warn(e, nvMsg);
			} else {
				// Unexpected error
				// checked
				const promise3 = chrome.runtime.sendMessage(
					new OutgoingLogMessage(
						Consts.LogLevel.ERROR,
						JSON.stringify(e)));

				getLogger().warn(document.URL, "Unexpected error", e);
			}
		}

		// Report found visible and invisible elements
		this.reportVisibility(EventNames.VISIBLE_EVENT_NAME, visibleData);
		this.reportVisibility(EventNames.INVISIBLE_EVENT_NAME, invisibleData);
	}

	/**
	 * Set next visibility cycle according to proposed timeout and visibility interval in configuration.
	 *
	 * @param nextTimeout Minimum required time to wait before checking visibility.
	 */
	private setupNextVisibilityCycle(nextTimeout: number): void {
		this.handlingVisibilityNow = true;

		// Take maximum from visibility interval configuration and return from monitorVisibility
		const timeout = Math.max(nextTimeout, this.configuration.visibilityMonitoringIntervalMs);
		this.scheduleVisibilityMonitoring(timeout);
	}

	/**
	 * Schedule timer for next visibility check.
	 *
	 * @param timeout Waiting time before checking visibility.
	 */
	private scheduleVisibilityMonitoring(timeout: number): void {
		this.visibilityTimerId = window.setTimeout(() => {
				try {
					this.visibilityTimerId = 0;
					this.monitorVisibility();
				} catch (e) {
					getLogger().error("Error while monitoring visibility", e);
				}

				// End handling visibility
				this.handlingVisibilityNow = false;
			},
			timeout);
	}

	private readonly onPageChange = () => {
		if (this.handlingVisibilityNow) return;

		this.unsubscribeAllVisibility();
		this.setupNextVisibilityCycle(0);
	};

	private subscribeAllVisibility(): void {
		if (this.mutationObserverVisibility != null) {
			this.mutationObserverVisibility.observe();
		}
		window.addEventListener("resize", this.onPageChange, true);
		window.addEventListener("scroll", this.onPageChange, true);
	}

	private unsubscribeAllVisibility(): void {
		if (this.mutationObserverVisibility != null) {
			this.mutationObserverVisibility.disconnect();
		}
		window.removeEventListener("resize", this.onPageChange, true);
		window.removeEventListener("scroll", this.onPageChange, true);
	}

	// #endregion
}
