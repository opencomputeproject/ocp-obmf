"use strict";

/* tslint:disable no-any */
export enum IncomingAction {
	Configuration = "configuration",
	Deactivate = "deactivate",
	WacMessage = "wac",
}
/* tslint:disable no-any */

export const INCOMING_VERSION = 1;

export interface IncomingNativeMessage {
	version: number;
	type: IncomingAction;
	data: {};
}

export interface NativeConfigurationMessage extends IncomingNativeMessage {
	data: string;
}

export type WacNativeMessage = IncomingNativeMessage;