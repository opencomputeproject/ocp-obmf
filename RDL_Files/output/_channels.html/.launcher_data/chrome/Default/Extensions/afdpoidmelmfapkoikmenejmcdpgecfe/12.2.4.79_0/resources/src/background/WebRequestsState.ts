"use strict";

import { getLogger } from "../utils/log";
import { WebRequestEvent } from "./WebRequestEvent";
import { IWebRequestEventData } from "./WebRequest";
import { OutgoingEventMessage } from "../common/MessagingModel";

/**
 * Event name -> Duration
 */
export interface WebRequestDurations {
	// tslint:disable-next-line readonly-array
	[eventName: string]: number[];
}

// Hack to imitate getters which don't exist in old IE
type MutableWebRequestState = { eventTimes: WebRequestDurations; };

export class WebRequestState {
	/**
	 * First before request event.
	 * Removed after the Start event is sent !
	 */
	public beforeRequestEvent?: OutgoingEventMessage<IWebRequestEventData>;

	/**
	 * True when beforeRequestEvent member is set.
	 */
	public setBeforeRequestEvent: boolean = false;

	/**
	 * True when Start event has been posted.
	 */
	public postedStart: boolean = false;

	public startMesageOrder?: number;

	public totalIncomingBytes = 0;
	public totalOutgoingBytes = 0;
	public requestStartTime: number;

	/**
	 * Used to get the "server time" that is the time between sending headers and receiving the server response.
	 */
	public totalServerTime = 0;

	/**
	 * Used to remember the last timestamp that we went through OnSendHeaders.
	 */
	public lastOnSendHeadersTs = 0;

	/**
	 * Stored event times.
	 */
	public readonly eventTimes: WebRequestDurations = {};

	/**
	 * Indicates request came with AppInternals header.
	 */
	public appInternalsMonitoring: boolean = false;

	/**
	 * Stores event time for the given event
	 *
	 * @param requestEvent Request event name.
	 * @param eventTime Time of this event.
	 */
	public storeEventTime(requestEvent: WebRequestEvent, eventTime: number): void {
		let duration = 10 * (eventTime - this.requestStartTime);
		duration = Math.floor(duration) / 10;

		const requestEventStr = WebRequestEvent[requestEvent];
		if (!(requestEventStr in this.eventTimes)) {
			this.eventTimes[requestEventStr] = [];
		}

		this.eventTimes[requestEventStr].push(duration);
	}

	constructor(requestStartTime: number) {
		this.requestStartTime = requestStartTime;
	}
}

export interface IWebRequests {
	[requestId: string]: WebRequestState;
}

export class WebRequestsStates {
	private requests: IWebRequests = {};

	public add(requestId: string, timeStamp: number): WebRequestState {
		getLogger().debug("Adding request", requestId);
		return this.requests[requestId] = new WebRequestState(timeStamp);
	}

	public get(requestId: string): WebRequestState | undefined {
		return this.requests[requestId];
	}

	public remove(requestId: string): void {
		getLogger().debug("Removing request", requestId);
		delete this.requests[requestId];
	}

	public clear(): void {
		this.requests = {};
	}
}
