"use strict";
import { WacCommunication } from "./WacCommunication";
import { OutgoingEventMessage, OutgoingPageNativeMessage } from "../common/MessagingModel";
import { BrowserType, EventMatchReport, isEventMatchReport, MatchEventType } from "./WacAPI";
import { UXData } from "../common/UXData";
import { browserInfo } from "../utils/browserInfo";

export class WacEventReporter {

	constructor(private readonly wacCommunication: WacCommunication) {
	}

	public reportToWac(pageMessage: Partial<OutgoingPageNativeMessage>): void {
		const rawData = (pageMessage as OutgoingEventMessage<UXData>);
		// create basic structure
		const eventType: MatchEventType = rawData.messageData.EventType.split(".").pop() as MatchEventType;
		// make tab and frame and tab ids as numbers
		const frameId: number = rawData.frameId != null ? rawData.frameId :
			parseInt((rawData.messageData.Data[0].frameId as string), 10);
		const tabId = rawData.tabId != null ? rawData.tabId :
			parseInt((rawData.messageData.Data[0].tabId as string), 10);

		// build message body
		const dataToSend: EventMatchReport = {
			messageType: "EventMatchReport",
			event: {
				documentCommittedUrl: rawData.messageData.Data[0].documentCommittedUrl as string,
				modifierKeys: rawData.messageData.Data[0].aternityModifierKeys as string,
				documentTitle: rawData.messageData.Data[0].documentTitle as string,
				eventType: eventType,
				frameId: frameId,
				tabId: tabId,
				timeStamp: rawData.timeStamp,
				browser: browserInfo.name,
			}
		};

		if (rawData.messageData.Data[0].aternityMouseButton != null) {
			dataToSend.event.mouseButton = rawData.messageData.Data[0].aternityMouseButton as string;
		}

		if (rawData.messageData.Data[0].key !== undefined) {
			dataToSend.event.key = rawData.messageData.Data[0].key as string;
		}

		// if there a frame
		if (frameId > 0) {
			dataToSend.event.frameCommittedUrl = rawData.messageData.Data[0].frameCommittedUrl as string;
		}

		const aternityCSSSelector = rawData.messageData.Data[0].aternityCSSSelector;
		if (typeof aternityCSSSelector === "string") {
			dataToSend.event.cssSelector = aternityCSSSelector;
		}

		// if (isEventMatchReport(dataToSend)) {
		// 	console.log(dataToSend);
		// }
		// send message to WAC
		this.wacCommunication.sendMessageToWac(dataToSend);
	}

	public wacMode(): boolean {
		return this.wacCommunication.isActive();
	}
}
