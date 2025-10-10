import { WebNavigationReportCallback } from "./IWebNavigation";
import { INativeMessagePoster } from "./INativeMessagePoster";
import { EventCondition } from "./WacAPI";
import { ConfigurationManager } from "./ConfigurationManager";
import { ITabsMonitoring } from "./ITabsMonitoring";

export interface IWacCommunication {
	onWebNavigation: WebNavigationReportCallback;
	activate(nativeMessageSender: INativeMessagePoster, tabsMonitoring: ITabsMonitoring, configurationManager: ConfigurationManager): void;
	deactivate(): void;
	isActive(): boolean;
}
