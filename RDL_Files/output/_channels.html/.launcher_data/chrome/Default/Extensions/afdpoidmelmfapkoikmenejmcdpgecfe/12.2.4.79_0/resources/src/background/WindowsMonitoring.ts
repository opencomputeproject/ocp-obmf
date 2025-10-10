"use strict";

import { getLogger } from "../utils/log";
import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { timeProvider } from "../utils/timeProvider";
import { OutgoingEventMessage } from "../common/MessagingModel";
import { UXData } from "../common/UXData";
import { IWindowsMonitoring } from "./IWindowsMonitoring";

// #region Utility

export const WINDOW_EVENT_NAMESPACE = "ui:chrome:Window";

function makeEventName(event: string): string {
	return WINDOW_EVENT_NAMESPACE + "." + event;
}

interface WindowEventData extends UXData {
	tabId?: number;
	windowId?: number;
	url?: string;
}

/**
 * Create base tab message.
 */
function createDataMessage(
	event: string,
	timestamp: number = timeProvider.now(),
	tab?: chrome.tabs.Tab): OutgoingEventMessage<WindowEventData> {
	const message = new OutgoingEventMessage<WindowEventData>(makeEventName(event), timestamp);

	const messageData = message.messageData.Data[0];

	if (tab != null) {
		messageData.windowId = tab.windowId;
		messageData.tabId = tab.id;
		messageData.url = tab.url;
	}

	return message;
}

// #endregion

export class WindowsMonitoring implements IWindowsMonitoring {
	private manager?: IBackgroundManager;
	private communication?: IAgentCommunication;

	private readonly onFocusChanged = (windowId: number) => {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		const communication = this.communication;
		if (communication == null) {
			return;
		}

		if (windowId !== chrome.windows.WINDOW_ID_NONE) {
			const now = timeProvider.now();

			chrome.tabs.query({ active: true, windowId: windowId },
				result => {
					const tab = (result != null && result.length >= 0 ? result[0] : undefined);
					getLogger().debug("Window onFocusChanged", tab);
					const message = createDataMessage("FocusChanged", now, tab);
					communication.postNativeMessage(message);
				});
		} else {
			getLogger().debug("Window LostFocus");
			const message = createDataMessage("LostFocus");
			communication.postNativeMessage(message);
		}
	};

	private windowMonitoringEnabled = false;

	public initWindowsMonitoring(manager: IBackgroundManager, communication: IAgentCommunication): void {
		if (this.windowMonitoringEnabled) {
			getLogger().error("You can't init windows monitoring twice in a row (without uninit)");
			return;
		}

		this.manager = manager;
		this.communication = communication;

		this.windowMonitoringEnabled = true;
		chrome.windows.onFocusChanged.addListener(this.onFocusChanged);
	}

	public uninitWindowsMonitoring(): void {
		this.windowMonitoringEnabled = false;

		chrome.windows.onFocusChanged.removeListener(this.onFocusChanged);
	}
}
