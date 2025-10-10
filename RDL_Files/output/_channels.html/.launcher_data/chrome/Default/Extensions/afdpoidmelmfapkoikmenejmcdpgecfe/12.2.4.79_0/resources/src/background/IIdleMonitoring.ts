import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";

export interface IIdleMonitoring {
	initIdleMonitoring(manager: IBackgroundManager, communication: IAgentCommunication): void;
	uninitIdleMonitoring(): void;
}
