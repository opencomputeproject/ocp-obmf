"use strict";

import { ITabsMonitoring } from "./ITabsMonitoring";
import { sendMessageToTabWithLog } from "./tabs";
import { ContentMessageType } from "../common/MessagingModel";
import { IHtmlEventsMonitoring } from "./IHtmlEventsMonitoring";

function sendAllTabsMessage(tabsMonitoring: ITabsMonitoring, message: string): void {
	tabsMonitoring.forAllTabs(tab => sendMessageToTabWithLog(tab, message));
}

/**
 * Monitor HTML events in content script.
 */
export class HtmlEventsMonitoring implements IHtmlEventsMonitoring {
	public initEventsMonitoring(tabsMonitoring: ITabsMonitoring): void {
		this.tabsMonitoring = tabsMonitoring;

		sendAllTabsMessage(tabsMonitoring, ContentMessageType.RECONFIGURE);
	}

	public uninitEventsMonitoring(): void {
		if (this.tabsMonitoring != null) {
			 sendAllTabsMessage(this.tabsMonitoring, ContentMessageType.UNINITIALIZE);
		}
	}

	private tabsMonitoring?: ITabsMonitoring;
}
