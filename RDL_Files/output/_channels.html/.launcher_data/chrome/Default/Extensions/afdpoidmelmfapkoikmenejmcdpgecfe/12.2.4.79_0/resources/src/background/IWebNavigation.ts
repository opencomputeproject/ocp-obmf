import { FrameState } from "./TabsState";

export type WebNavigationEvent =
	"CreateNavigationTarget" |
	"BeforeNavigate" |
	"Committed" |
	"DOMContentLoaded" |
	"Completed" |
	"ErrorOccurred";

export type WebNavigationReportCallback = (
	event: WebNavigationEvent,
	details: chrome.webNavigation.WebNavigationCallbackDetails,
	frameState?: FrameState | null,
	tabState?: FrameState | null) => void;

export interface IWebNavigation {
	getFrame(tabId: number, frameId: number): FrameState | null;
	subscribe(callback: WebNavigationReportCallback): void;
	unsubscribe(callback: WebNavigationReportCallback): void;
}
