import { IBackgroundManagerController } from "./IBackgroundManagerController";
import { IWebNavigation } from "./IWebNavigation";
import { INativeMessagePoster } from "./INativeMessagePoster";

export interface PostNativeMessageOptions {
	forcePost: boolean;
}

export interface IAgentCommunication extends INativeMessagePoster {
	initCommunication(
		manager: IBackgroundManagerController,
		webNavigation: IWebNavigation,
		onlineConfiguration?: boolean): boolean;
	uninitCommunication(): void;
}
