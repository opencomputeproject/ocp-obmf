import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";

export interface IDownloadsMonitoring {
	initDownloadsMonitoring(manager: IBackgroundManager, communication: IAgentCommunication): void;
	uninitDownloadsMonitoring(): void;
}