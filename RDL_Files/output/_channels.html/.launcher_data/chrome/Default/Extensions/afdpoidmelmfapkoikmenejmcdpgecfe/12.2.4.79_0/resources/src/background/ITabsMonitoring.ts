import { UXData } from "../common/UXData";
import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { IWebRequest } from "./IWebRequest";
import { IWebNavigation } from "./IWebNavigation";

import Tab = chrome.tabs.Tab;

export interface ITabEventData extends UXData {
	tabId: number;
	windowId: number;
	title: string;
	/**
	 * document.title property from the top frame
	 */
	documentTitle: string;
	status?: string;
	currentUrl?: string;
	isWindowClosing?: boolean;
	newTabId?: number;
}

export interface ITabsMonitoring {
	initTabsMonitoring(
		manager: IBackgroundManager,
		communication: IAgentCommunication,
		webRequest: IWebRequest,
		webNavigation: IWebNavigation): void;
	getTabState(tabId: number): ITabEventData | null;
	forAllTabs(func: (tab: Tab) => void): void;
	uninitTabsMonitoring(): void;
}
