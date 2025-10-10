"use strict";

import { getLogger } from "../utils/log";
import * as Utils from "../utils/utils";
import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { timeProvider } from "../utils/timeProvider";
import { UXData } from "../common/UXData";
import { OutgoingEventMessage } from "../common/MessagingModel";
import { IIdleMonitoring } from "./IIdleMonitoring";

export const IDLE_EVENT_NAMESPACE = "ui:chrome:Idle";

function makeEventName(event: string): string {
	return IDLE_EVENT_NAMESPACE + "." + event;
}

/**
 * Create base tab message.
 */
function createDataMessage(event: string): OutgoingEventMessage<UXData> {
	const message = new OutgoingEventMessage<UXData>(makeEventName(event), timeProvider.now());
	return message;
}

export class IdleMonitoring implements IIdleMonitoring {
	private manager?: IBackgroundManager;
	private communication?: IAgentCommunication;

	private readonly onStateChanged = (newState: string) => {
		if (this.manager == null || !this.manager.active) {
			return;
		}

		getLogger().debug("Idle onStateChanged", newState);
		const message = createDataMessage(Utils.capitalize(newState));
		if (this.communication != null) {
			this.communication.postNativeMessage(message);
		}
	};

	private idleMonitoringEnabled = false;

	public initIdleMonitoring(manager: IBackgroundManager, communication: IAgentCommunication): void {
		if (this.idleMonitoringEnabled) {
			getLogger().error("You can't init idle monitoring twice in a row (without uninit)");
			return;
		}

		this.manager = manager;
		this.communication = communication;

		this.idleMonitoringEnabled = true;

		if (chrome.idle.onStateChanged != null) {
			chrome.idle.onStateChanged.addListener(this.onStateChanged);
		}
	}

	public uninitIdleMonitoring(): void {
		this.idleMonitoringEnabled = false;

		if (chrome.idle.onStateChanged != null) {
			chrome.idle.onStateChanged.removeListener(this.onStateChanged);
		}
	}
}
