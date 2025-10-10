"use strict";
import { getLogger } from "../utils/log";
import { startsWith } from "../utils/utils";

// import { chrome } from "../common/globalChrome";

function makeHash(tabId: number, frameId: number): string {
	return tabId.toString() + "," + frameId.toString();
}

function tabIdFromHash(hash: string): number {
	const commaIdx = hash.indexOf(",");
	const tabIdStr = hash.substring(0, commaIdx);
	return Number(tabIdStr);
}

function getFrameUrl(): string {
	return window.location.href;
}

/**
 * Main frame or sub frame state.
 */
export class FrameState {
	/**
	 * Navigation url of the frame.
	 * Set by the first navigation.
	 */
	public readonly startUrl: string;

	/**
	 * This frame's id.
	 */
	public readonly frameId: number;

	/**
	 * This containing tab's id.
	 */
	public readonly tabId: number;

	/**
	 * Current url of the frame.
	 */
	public currentUrl: string;

	/**
	 * The final committed url that the frame is navigating to.
	 * Undefined in the beginning of navigation.
	 */
	public committedUrl?: string;

	/** chrome.webRequest.CallbackDetails.type */
	public readonly type: string;

	public readonly requestId: string;

	public statusCode?: number;

	constructor(
		frameId: number,
		tabId: number,
		url: string,
		type: string,
		requestId: string) {
		this.frameId = frameId;
		this.tabId = tabId;
		this.startUrl = url;
		this.currentUrl = url;
		this.type = type;
		this.requestId = requestId;
	}
}

interface Frames {
	[hash: string]: FrameState;
}

export class TabsStates {
	private frames: Frames;

	constructor() {
		this.frames = {};
	}

	public addFrame(
		tabId: number,
		frameId: number,
		url: string,
		type: string,
		requestId: string): FrameState {

		const hash = makeHash(tabId, frameId);
		this.frames[hash] = new FrameState(frameId, tabId, url, type, requestId);
		const frame = this.frames[hash];

		return frame;
	}

	public getTab(tabId: number): FrameState {
		return this.getFrame({ tabId: tabId, frameId: 0 });
	}

	public getFrame(
		{tabId, frameId, url = ""}: { tabId: number, frameId: number, url?: string | null }): FrameState {

		let frame = this.frames[makeHash(tabId, frameId)];

		if (frame == null) {
			// This can be a valid state: the extension is loaded in parallel with the pages,
			// and sometimes (in particular when url is given on the command line) it
			// finishes loading after some frames and this.frames[] is incomplete.
			// We add the missing frame lazily, here.

			if (url != null && url !== "") { // use the input details
				frame = this.addFrame(tabId, frameId, url, "unknown", "");
			} else {
				chrome.scripting.executeScript(
					{
						target: {tabId: tabId, allFrames: false, frameIds: [frameId]},
						func: getFrameUrl
					},
					(results) => {
						if (chrome.runtime.lastError !== undefined) {
							// There are valid scenarios where getFrame is called for a closed tab.
							// for example when an ajax is cancelled during tab closing:
							// WebRequest.onErrorOccured -> isMonitored -> tabStates.getTab -> getFrame
							// We try to log only errors from unexpected scenarios.

							if (chrome.runtime.lastError.message === "The frame was removed." ||
								// tslint:disable-next-line:no-non-null-assertion
								startsWith(chrome.runtime.lastError.message!, "No frame with id") ||
								// tslint:disable-next-line:no-non-null-assertion
								startsWith(chrome.runtime.lastError.message!, "No tab with id")) {
								return;  // frame null will be returned
							} else {
								getLogger().error("chrome.tabs.executeScript failed in tabId",
									tabId,
									chrome.runtime.lastError.message);
							}
						} else if (results != null) {
							this.addFrame(tabId, frameId, results[0].result as unknown as string, "unknown", "");
						} else {
							getLogger().error("chrome.scripting.executeScript returned empty");
						}
					}
				);
			}
		}

		return frame;
	}

	public getAllTabIds(): number[] {
		let tabIDs: number[] = [];
		chrome.tabs.query({},
			(resTabs: chrome.tabs.Tab[]) => {
				if (chrome.runtime.lastError != null) {
					getLogger().error(`chrome.runtime.lastError: ${chrome.runtime.lastError.message}`);
					return;
				}
				// tslint:disable-next-line:no-non-null-assertion
				tabIDs = resTabs.filter(tab => tab.id !== null).map(tab => tab.id!);
			}
		);
		return tabIDs;
	}

	public removeDeadFrames(): void {
		const liveTabIds = this.getAllTabIds();

		// Iterate on all frames and remove those in dead tabId's
		Object.keys(this.frames).forEach(hash => {
			const frame = this.frames[hash];
			if (liveTabIds.indexOf(frame.tabId) === -1) {
				delete this.frames[hash];
			}
		});
	}

	public getFramesByWindowUrl(windowUrl: string): FrameState[] {
		const frames: FrameState[] = [];

		for (const key in this.frames) {
			const frameState = this.frames[key];
			if (frameState.committedUrl === windowUrl) {
				frames.push(frameState);
			}
		}

		return frames;
	}

	public removeTab(tabId: number): void {
		// Iterate on all frames and remove those with the given tabId
		Object.keys(this.frames).forEach(hash => {
			const frame = this.frames[hash];
			if (frame.tabId === tabId) {
				delete this.frames[hash];
			}
		});
	}

	public removeFrame(tabId: number, frameId: number): void {
		if (frameId === 0) {
			// Remove the entire tab
			this.removeTab(tabId);
			return;
		}

		const removeHash = makeHash(tabId, frameId);
		// Remove the frame
		delete this.frames[removeHash];
	}


	public hasTab(tabId: number): boolean {
		return this.hasFrame(tabId, 0);
	}

	public hasFrame(tabId: number, frameId: number): boolean {
		return makeHash(tabId, frameId) in this.frames;
	}

	/**
	 * Clear the state.
	 */
	public clear(): void {
		this.frames = {};
	}

	public validateTab(tabId: number): void {
		chrome.tabs.get(tabId, tab => {
			// If tab doesn't exist we have an error.
			// It means that this tab is not real and used for instant search.
			if (chrome.runtime.lastError != null) {
				this.removeTab(tabId);
			}
		});
	}

	public validateAllTabs(): void {
		for (const hash in this.frames) {
			const tabId = tabIdFromHash(hash);
			this.validateTab(tabId);
		}

	}
}
