import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";

export interface IWindowsMonitoring {
	initWindowsMonitoring(manager: IBackgroundManager, communication: IAgentCommunication): void;
	uninitWindowsMonitoring(): void;
}
