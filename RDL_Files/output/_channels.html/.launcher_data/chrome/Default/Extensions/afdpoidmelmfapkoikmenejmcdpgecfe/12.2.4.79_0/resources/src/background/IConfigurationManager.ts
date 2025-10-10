import { IBackgroundManagerController } from "./IBackgroundManagerController";

export interface IConfigurationManager {
	initConfigurationManager(manager: IBackgroundManagerController): void;
}