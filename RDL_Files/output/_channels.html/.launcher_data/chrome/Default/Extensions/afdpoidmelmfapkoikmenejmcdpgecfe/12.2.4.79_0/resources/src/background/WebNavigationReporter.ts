import { getLogger } from "../utils/log";
import { FrameState } from "./TabsState";
import { IAgentCommunication } from "./IAgentCommunication";
import { getFrameType } from "../common/FrameType";
import { UXData } from "../common/UXData";
import { OutgoingEventMessage } from "../common/MessagingModel";
import { WebNavigationEvent } from "./IWebNavigation";
import { isSerializablePrimitive } from "../utils/utils";

interface WebNavigationEventData extends UXData {
	// #region Generic event properties

	url: string;
	tabId: number;
	frameId: number;
	type: string;

	frameUrl: string;
	frameCurrentUrl: string;
	frameCommittedUrl: string;
	documentUrl: string;
	documentCurrentUrl: string;
	documentCommittedUrl: string;

	// #endregion

	// #region Event specific properties

	sourceFrameId?: number;
	sourceTabId?: number;
	parentFrameId?: number;
	error?: string;
	transitionQualifiers?: string;
	transitionType?: string;

	// #endregion
}

export const WEB_NAVIGATION_EVENT_NAMESPACE = "html:chrome:WebNavigation";

function makeEventName(event: string): string {
	return WEB_NAVIGATION_EVENT_NAMESPACE + "." + event;
}

/**
 * Reports WebNavigation events to Agent.
 */
export class WebNavigationReporter {
	public constructor(private readonly communication: IAgentCommunication) {
	}

	public readonly onWebNavigation = (
		event: WebNavigationEvent,
		details: chrome.webNavigation.WebNavigationCallbackDetails,
		frameState?: FrameState | null,
		tabState?: FrameState | null) => {

		const message = new OutgoingEventMessage(makeEventName(event), details.timeStamp);
		const eventData = message.messageData.Data[0] as WebNavigationEventData;
		const detailsRecord = details as Record<string, unknown>;

		// Copy all properties
		for (const prop in details) {
			if (details.hasOwnProperty(prop)) {
				const propValue = detailsRecord[prop];

				if (isSerializablePrimitive(propValue)) {
					eventData[prop] = propValue;
				} else {
					// Array has special treatment
					if (Array.isArray(propValue)) {
						// tslint:disable-next-line no-unsafe-any
						for (const item of propValue) {
							eventData[`${prop}.${item}`] = "true";
						}
					}
				}
			}
		}


		// Add urls
		if (frameState != null) {
			eventData.frameUrl = frameState.startUrl;
			eventData.frameCurrentUrl = frameState.currentUrl;
			if (frameState.committedUrl != null) {
				eventData.frameCommittedUrl = frameState.committedUrl;
			}

			eventData.type = getFrameType(frameState.frameId);
		}

		if (tabState != null) {
			eventData.documentUrl = tabState.startUrl;
			eventData.documentCurrentUrl = tabState.currentUrl;
			if (tabState.committedUrl != null) {
				eventData.documentCommittedUrl = tabState.committedUrl;
			}
		}

		// Get type using details if was not set.
		if (event !== "CreateNavigationTarget" && eventData.type == null) {
			// ReSharper disable once SuspiciousTypeofCheck
			// tslint:disable-next-line no-any no-unnecessary-type-assertion
			const frameId = detailsRecord["frameId"] as unknown | number;
			if (typeof frameId === "number") {
				eventData.type = getFrameType(frameId);
			} else {
				getLogger().warn("Neither frameState nor details has frame identifier");
			}
		}

		this.communication.postNativeMessage(message);
	}
}
