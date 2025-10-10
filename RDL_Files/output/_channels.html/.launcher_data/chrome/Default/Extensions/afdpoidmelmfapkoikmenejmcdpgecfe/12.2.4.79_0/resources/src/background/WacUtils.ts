import InjectDetails = chrome.tabs.InjectDetails;
import { MessageToInjected, isExtensionMessage, WacIncoming, WacOutgoing, isMessageFromInjected, MessageFromInjected } from "./WacAPI";

function getAllFramesForTabId(tabId: number): Promise<number[]> {
	return new Promise<number[]>((resolve, reject) => {
		chrome.webNavigation.getAllFrames({tabId}, details => {
			if (chrome.runtime.lastError != null) {
				reject(new Error(`chrome.runtime.lastError: ${chrome.runtime.lastError.message}`));
			} else if (details == null || details.length === 0) {
				reject(new Error(`no details`));
			} else {
				resolve(details.map(detail => detail.frameId));
			}
		});
	});
}
export function sendToExtensionWithResponse(extensionId: string, message: WacIncoming): Promise<WacOutgoing | null> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(extensionId, message, (response: WacOutgoing) => {
			if (chrome.runtime.lastError != null) {
				reject(new Error(`chrome.runtime.lastError: ${chrome.runtime.lastError.message}`));
			} else if (response == null) { // no reply
				resolve(null);
			} else if (!isExtensionMessage(response)) {
				reject(new Error(`Not a valid response: ${response}`));
			} else {
				resolve(response);
			}
		});
	});
}

export function sendToFrameWithResponse(tabId: number, frameId: number, message: MessageToInjected): Promise<MessageFromInjected | null> {
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(tabId, message, {frameId}, (response: Partial<MessageFromInjected> | undefined | null) => {
			// todo: find different way to handle closed port on no reply
			if (chrome.runtime.lastError != null && chrome.runtime.lastError.message !== "The message port closed before a response was received.") {
				reject(new Error(`chrome.runtime.lastError: ${chrome.runtime.lastError.message}`));
			} else if (response == null) {
				resolve(null);
			} else if (!isMessageFromInjected(response)) {
				reject(new Error(`Not a valid response: ${response}`));
			} else {
				resolve(response);
			}
		});
	});
}

function mapCallbacks<T, U>(
	arr: T[],
	mapFunc: (item: T, result: (res?: U, err?: string) => void) => void,
	callback: (results: { item: T, result?: U, err?: string }[]) => void
): void {
	const results = new Array(arr.length);
	let count = arr.length;
	arr.forEach((item, index) => mapFunc(item, (res?, err?) => {
		results[index] = {item, res, err};
		if (--count === 0) {
			callback(results);
		}
	}));
}
