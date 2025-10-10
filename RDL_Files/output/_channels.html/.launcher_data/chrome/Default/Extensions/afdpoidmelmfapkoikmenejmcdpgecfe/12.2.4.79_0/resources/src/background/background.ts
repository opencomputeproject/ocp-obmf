// Make logging globally visible
export { enableLogs, disableLogs } from "../utils/log";

import { AgentCommunication } from "./AgentCommunication";
import { BackgroundManager } from "./BackgroundManager";
import { WebRequest } from "./WebRequest";
import { WebNavigation } from "./WebNavigation";
import { TabsMonitoring } from "./TabsMonitoring";
import { WindowsMonitoring } from "./WindowsMonitoring";
import { IdleMonitoring } from "./IdleMonitoring";
import { HtmlEventsMonitoring } from "./HtmlEventsMonitoring";
import { WacCommunication } from "./WacCommunication";
import { ConfigurationManager } from "./ConfigurationManager";
import { WacEventReporter } from "./WacEventReporter";
import { DownloadsMonitoring } from "./DownloadsMonitoring";

const configurationManager = new ConfigurationManager();

const wacCommunication = new WacCommunication();
const wacEventReporter = new WacEventReporter(wacCommunication);
const communication = new AgentCommunication(wacCommunication, configurationManager, wacCommunication, wacEventReporter);
const webNavigation = new WebNavigation();
const webRequest = new WebRequest(webNavigation.webNavigationTabsStates);
const tabsMonitoring = new TabsMonitoring();
const windowsMonitoring = new WindowsMonitoring();
const idleMonitoring = new IdleMonitoring();
const htmlEventsMonitoring = new HtmlEventsMonitoring();
const downloadsMonitoring = new DownloadsMonitoring();

export const manager = new BackgroundManager(
	communication,
	configurationManager,
	tabsMonitoring,
	webRequest,
	webNavigation,
	windowsMonitoring,
	idleMonitoring,
	htmlEventsMonitoring,
	wacCommunication,
	downloadsMonitoring);
