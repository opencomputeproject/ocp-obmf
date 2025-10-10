import { OutgoingBaseNativeMessage } from "../common/MessagingModel";
import { PostNativeMessageOptions } from "./IAgentCommunication";

export interface INativeMessagePoster {
	postNativeMessage(message: OutgoingBaseNativeMessage): void;
	postNativeMessage(message: OutgoingBaseNativeMessage, options: PostNativeMessageOptions): void;
}