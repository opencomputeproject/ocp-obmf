"use strict";

// ReSharper disable InconsistentNaming

/**
 * WebRequest events.
 * This must be synchronized with the Agent.
 */
export enum WebRequestEvent {
	BeforeRequest,
	BeforeSendHeaders,
	SendHeaders,
	HeadersReceived,
	AuthRequired,
	ResponseStarted,
	BeforeRedirect,
	Completed,
	ErrorOccurred,
}
