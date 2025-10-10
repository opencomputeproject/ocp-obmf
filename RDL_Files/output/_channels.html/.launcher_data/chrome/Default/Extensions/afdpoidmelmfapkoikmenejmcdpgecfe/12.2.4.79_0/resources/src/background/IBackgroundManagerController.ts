import { ITabsMonitoring } from "./ITabsMonitoring";
import { IBackgroundManager } from "./IBackgroundManager";
import { Configuration } from "../common/configuration/Configuration";
import { MessageProcessor } from "./MessageProcessor";

export interface IBackgroundManagerController extends IBackgroundManager {
	activate(conf: Configuration): void;
	deactivate(): void;
	scheduleConnectAttempt(): void;

	getTabsMonitoring(): ITabsMonitoring;
	getMessageProcessor(): MessageProcessor | undefined;
}
