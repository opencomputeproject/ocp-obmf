export const PROTOCOL_VERSION = 1;

export type WacOutgoing =
	// messages
	MessageToInjected |
	// requests
	GreetingRequest |
	FarewellRequest |
	InjectNotificationsFrame |
	ConfigurationUpdate |

	ErrorResponse
	;

export type WacIncoming =
	// messages
	TabRemoved |
	MessageFromInjected |
	EventMatchReport |
	ContentInjected |
	WacFrameInjected |
	// responses
	GreetingResponse |
	FarewellResponse |

	ErrorResponse
	;

export interface ExtensionMessage {
	messageType: string;
}

export interface InjectNotificationsFrame extends ExtensionMessage {
	messageType: "InjectNotificationsFrame";
	recipient: MessageAddressTab;
}

export interface GreetingRequest extends ExtensionMessage {
	messageType: "GreetingRequest";
	protocolVersion: number;
	contentScript: string;
	notificationsScript: string;
}

export interface FarewellRequest extends ExtensionMessage {
	messageType: "FarewellRequest";
}

export interface MessageAddressTab {
	browser: BrowserType;
	tabId: number;
}

export interface MessageAddressFrame {
	browser: BrowserType;
	tabId: number;
	frameId: number;
}

export interface MessageToInjected extends ExtensionMessage {
	messageType: "MessageToInjected";
	recipient: MessageAddressFrame;
	message: unknown;
}

export interface ConfigurationUpdate extends ExtensionMessage {
	messageType: "ConfigurationUpdate";
	eventConditions: EventCondition[];
}

export interface TabRemoved extends ExtensionMessage {
	messageType: "TabRemoved";
	removed: MessageAddressTab;
}

export function isMessageToInjected(m: unknown): m is MessageToInjected {
	const mm = m as Partial<MessageToInjected>;
	return mm.messageType === "MessageToInjected";
}

export interface WacFrameInjected extends ExtensionMessage {
	messageType: "WacFrameInjected";
	address: MessageAddressFrame;
}

export interface ContentInjected extends ExtensionMessage {
	messageType: "ContentInjected";
	frameInfo: FrameInfo;
}

export interface MessageFromInjected extends ExtensionMessage {
	messageType: "MessageFromInjected";
	sender: MessageAddressFrame;
	message: unknown;
}

export function isMessageFromInjected(m: unknown): m is MessageFromInjected {
	const mm = m as Partial<MessageFromInjected>;
	return mm.messageType === "MessageFromInjected" && typeof mm.sender === "object";
}

export interface EventMatchReport extends ExtensionMessage {
	messageType: "EventMatchReport";
	event: MatchReportEvent;
}

export type MatchEventType = "Committed" | "Completed" | "Visible" | "keydown" | "click" | "dblclick" |
	"mousedown" | "mouseenter" | "mouseup" | "change" | "contextmenu";

export interface MatchReportEvent {
	documentCommittedUrl: string;
	frameCommittedUrl?: string;
	modifierKeys: string; // todo: needed?
	mouseButton?: string;
	documentTitle: string;
	cssSelector?: string;
	eventType: MatchEventType;
	frameId: number;
	tabId: number;
	timeStamp: number;
	browser?: BrowserType;
	key?: string;
}

function isMatchReportEvent(event: MatchReportEvent): event is MatchReportEvent {
	const validateEventType = (eventType: string) => eventType === "Committed" ||
		eventType === "Completed" ||
		eventType === "Visible" ||
		eventType === "keydown" ||
		eventType === "click" ||
		eventType === "dblclick" ||
		eventType === "mousedown" ||
		eventType === "mouseenter" ||
		eventType === "mouseup" ||
		eventType === "change" ||
		eventType === "contextmenu";

	return typeof event.documentCommittedUrl === "string" &&
		(event.eventType !== "keydown" || typeof event.modifierKeys === "string") &&
		typeof event.documentTitle === "string" &&
		typeof event.tabId === "number" &&
		typeof event.frameId === "number" &&
		typeof event.timeStamp === "number" &&
		validateEventType(event.eventType);
}

export function isEventMatchReport(message: Partial<EventMatchReport>): message is EventMatchReport {
	return message.messageType === "EventMatchReport" &&
		typeof message.event === "object" &&
		isMatchReportEvent(message.event);
}

export function validateGreetingRequest(message: Partial<GreetingRequest>): message is GreetingRequest {
	return message.messageType === "GreetingRequest" &&
		typeof message.contentScript === "string" &&
		typeof message.protocolVersion === "number" &&
		message.protocolVersion === PROTOCOL_VERSION;
}

export function validateFarewellRequest(message: ExtensionMessage): message is FarewellRequest {
	return message.messageType === "FarewellRequest";
}

// New properties
// New events
// New matching capabilities e.g. get data from parent or child
export type Feature = "HTMLEvents" | "Visibility" | "UnifiedClick" | "GenericStart";

export interface ErrorResponse extends ExtensionMessage {
	messageType: "ErrorResponse";
	error: string;
}

export interface NotActiveResponse extends ExtensionMessage {
	messageType: "NotActiveResponse";
}

export interface GreetingResponse extends ExtensionMessage {
	messageType: "GreetingResponse";
	features: Feature[];
}

export interface FarewellResponse extends ExtensionMessage {
	messageType: "FarewellResponse";
}

// synced with WAC 2.0 project in file extensionApi.ts
export const enum BrowserType {
	IE = "InternetExplorer",
	Chrome = "Chrome",
	Firefox = "Firefox",
	Edge = "Edge",
	Safari = "Safari",
	NA = "N/A"
}

export function isGreetingResponse(message: ExtensionMessage): message is GreetingResponse {
	if (message.messageType !== "GreetingResponse") {
		return false;
	}

	const {features} = message as ExtensionMessage & Partial<GreetingResponse>;
	if (!Array.isArray(features) ||
		features.length === 0 ||
		features.some((f: string) => typeof f !== "string")) {
		throw new Error("GreetingResponse");
	}

	return true;
}

function validateConditionProperty(con: ConditionProperty): con is ConditionProperty {
	return (con.matchType === "exact" || con.matchType === "regex") &&
		typeof con.property === "string" &&
		typeof con.value === "string";
}

function validateHtmlEventCondition(eventCondition: EventCondition): eventCondition is EventCondition { // wac
	return typeof eventCondition.name === "string" &&
		typeof eventCondition.event === "string" &&
		Array.isArray(eventCondition.conditionProperties) &&
		eventCondition.conditionProperties.every(validateConditionProperty);
}

export function validateConfigurationUpdate(message: ConfigurationUpdate): message is ConfigurationUpdate {
	return message.messageType === "ConfigurationUpdate" &&
		Array.isArray(message.eventConditions) &&
		message.eventConditions.every(validateHtmlEventCondition);
}

export interface EventCondition {
	name: string;
	event: string;
	conditionProperties: ConditionProperty[];
}

export interface ConditionProperty {
	property: string;
	matchType: "exact" | "regex";
	value: string;
}

export interface FrameInfo {
	frameUrl: string;
	frameCommittedUrl: string;
	frameCurrentUrl: string;
	title: string;
	tabId: number;
	frameId: number;
	browser: BrowserType;
}

/**
 * @return true when message is Extension message.
 */
export function isExtensionMessage(message: Partial<ExtensionMessage>): message is WacOutgoing | WacIncoming {
	const {messageType} = message;
	return typeof messageType === "string";
}
