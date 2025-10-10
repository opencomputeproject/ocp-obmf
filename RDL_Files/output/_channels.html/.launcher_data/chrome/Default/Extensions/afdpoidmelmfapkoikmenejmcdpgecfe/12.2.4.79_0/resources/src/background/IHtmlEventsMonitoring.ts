import { ITabsMonitoring } from "./ITabsMonitoring";

export interface IHtmlEventsMonitoring {
	initEventsMonitoring(tabsMonitoring: ITabsMonitoring): void;
	uninitEventsMonitoring(): void;
}
