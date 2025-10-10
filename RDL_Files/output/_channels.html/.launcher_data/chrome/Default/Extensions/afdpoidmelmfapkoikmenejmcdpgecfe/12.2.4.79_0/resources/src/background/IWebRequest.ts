import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { ITabsMonitoring } from "./ITabsMonitoring";
import { Configuration } from "../common/configuration/Configuration";

export interface IWebRequest {
	initWebRequest(m: IBackgroundManager, comm: IAgentCommunication, tm: ITabsMonitoring, configuration: Configuration): void;
	uninitWebRequest(): void;
}
