"use strict";

import { getLogger } from "../utils/log";
import { TabsStates, FrameState } from "./TabsState";
import { getFrameType } from "../common/FrameType";
import { IWebNavigation, WebNavigationEvent, WebNavigationReportCallback } from "./IWebNavigation";

import webNavigation = chrome.webNavigation;

const WEBNAVIGATION_URL_FILTER: Readonly<webNavigation.WebNavigationEventFilter> = {
	url: [{schemes: ["http", "https"]}]
};

export class WebNavigation implements IWebNavigation {
	public readonly webNavigationTabsStates = new TabsStates();

	public constructor() {
		// Monitor removed tabs for instance navigations.
		chrome.tabs.onRemoved.addListener(this.onRemoved);

		webNavigation.onCreatedNavigationTarget.addListener(this.onCreatedNavigationTarget, WEBNAVIGATION_URL_FILTER);
		webNavigation.onBeforeNavigate.addListener(this.onBeforeNavigate, WEBNAVIGATION_URL_FILTER);
		webNavigation.onCommitted.addListener(this.onCommitted, WEBNAVIGATION_URL_FILTER);
		webNavigation.onDOMContentLoaded.addListener(this.onDOMContentLoaded, WEBNAVIGATION_URL_FILTER);
		webNavigation.onCompleted.addListener(this.onCompleted, WEBNAVIGATION_URL_FILTER);
		webNavigation.onErrorOccurred.addListener(this.onErrorOccurred, WEBNAVIGATION_URL_FILTER);

		webNavigation.onHistoryStateUpdated.addListener(this.onLocationChanged, WEBNAVIGATION_URL_FILTER);
		webNavigation.onReferenceFragmentUpdated.addListener(this.onLocationChanged, WEBNAVIGATION_URL_FILTER);

		this.webNavigationTabsStates.validateAllTabs();
	}

	private readonly reportCallbacks: Set<WebNavigationReportCallback> = new Set<WebNavigationReportCallback>();

	/**
	 * Subscribe to events.
	 * Only one subscription is supported.
	 * If was subscribed before, new subscription doesn't replace old.
	 *
	 * @param callback Callback to receive all WebNavigation events.
	 */
	public subscribe(callback: WebNavigationReportCallback): void {
		if (!this.reportCallbacks.has(callback)) {
			this.reportCallbacks.add(callback);
		}
	}

	/**
	 * Remove last subscription if any.
	 */
	public unsubscribe(callback: WebNavigationReportCallback): void {
		if (this.reportCallbacks.has(callback)) {
			this.reportCallbacks.delete(callback);
		}
	}

	public getFrame(tabId: number, frameId: number): FrameState {
		return this.webNavigationTabsStates.getFrame({ tabId: tabId, frameId: frameId });
	}

	// #region Utility functions

	private addFrame(details: Readonly<webNavigation.WebNavigationParentedCallbackDetails>): FrameState {
		return this.webNavigationTabsStates.addFrame(
			details.tabId,
			details.frameId,
			details.url,
			getFrameType(details.frameId),
			"");
	}

	// #endregion

	// #region Handlers

	private readonly onCreatedNavigationTarget = (details: webNavigation.WebNavigationSourceCallbackDetails) => {
		getLogger().debug("WebNavigation.onCreatedNavigationTarget", details);

		this.reportCallbacks.forEach(reportCallback => reportCallback("CreateNavigationTarget", details));
	}

	private readonly onBeforeNavigate = (details: webNavigation.WebNavigationParentedCallbackDetails) => {
		getLogger().debug("WebNavigation.onBeforeNavigate", details);

		// Get frame state
		let frameState = this.webNavigationTabsStates.getFrame(details);

		// No frame state -> Create a new one
		if (frameState == null) {
			frameState = this.addFrame(details);

			// Remove instant tabs
			setTimeout(() => this.webNavigationTabsStates.validateTab(details.tabId), 60 * 1000);
		} else {
			// Remove and add a new one
			this.webNavigationTabsStates.removeFrame(details.tabId, details.frameId);
			frameState = this.addFrame(details);
		}

		// Initial values when starting navigation - these will be updated along the way
		frameState.currentUrl = details.url;

		this.reportEvent("BeforeNavigate", details);
	}

	private readonly onCommitted = (details: webNavigation.WebNavigationTransitionCallbackDetails) => {
		getLogger().debug("onCommitted", details);

		const frameState = this.webNavigationTabsStates.getFrame(details);
		if (frameState != null) {
			// Update current url
			frameState.currentUrl = details.url;

			// The URL to which the given frame will navigate.
			frameState.committedUrl = details.url;
		} else {
			getLogger().error("Frame state is null for tab: ", details.tabId, "frame: ", details.frameId);
		}

		this.reportEvent("Committed", details);
	}

	// ReSharper disable once InconsistentNaming

	private readonly onDOMContentLoaded = (details: webNavigation.WebNavigationFramedCallbackDetails) => {
		this.reportEvent("DOMContentLoaded", details);
	}

	private readonly onCompleted = (details: webNavigation.WebNavigationFramedCallbackDetails) => {
		this.reportEvent("Completed", details);
	}

	private readonly onErrorOccurred = (details: webNavigation.WebNavigationFramedErrorCallbackDetails) => {
		this.reportEvent("ErrorOccurred", details);
	}

	private readonly onLocationChanged = (details: webNavigation.WebNavigationTransitionCallbackDetails) => {
		getLogger().debug("WebNavigation.onLocationChanged", details);

		const currentFrame = this.webNavigationTabsStates.getFrame(details);

		if (currentFrame == null) {
			getLogger().error("Frame does not exist in tab states");
			return;
		}

		currentFrame.currentUrl = details.url;
	}

	private reportEvent(
		event: WebNavigationEvent,
		details: webNavigation.WebNavigationFramedCallbackDetails): void {
		getLogger().debug(`WebNavigation.on${event}`, details);

		const frameState = this.webNavigationTabsStates.getFrame(details);
		const tabState = this.webNavigationTabsStates.getTab(details.tabId);

		this.reportCallbacks.forEach(reportCallback => reportCallback(event, details, frameState, tabState));
	}

	private readonly onRemoved = (tabId: number) => {
		this.webNavigationTabsStates.removeTab(tabId);
	}

	// #endregion
}
