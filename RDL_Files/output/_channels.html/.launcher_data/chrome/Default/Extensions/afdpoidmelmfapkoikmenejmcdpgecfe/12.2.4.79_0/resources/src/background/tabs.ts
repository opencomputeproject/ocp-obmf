import { getLogger } from "../utils/log";
import { startsWith } from "../utils/utils";
import Tab = chrome.tabs.Tab;

/**
 * Execute script with error handling in a specified tab.
 */
export function executeFunctionInTab(tab: Tab, f: () => void, method: string): void {
	if (typeof tab.id === "undefined") return;
	if (tab.url == null) return;
	if (!startsWith(tab.url, "http")) return;

	chrome.scripting.executeScript(
		{
			target: {tabId: tab.id, allFrames: true}, func: f, args: []
		}
	).then((value) => {
		if (chrome.runtime.lastError != null) {
			// ReSharper disable once TsResolvedFromInaccessibleModule
			getLogger().error(`Could not execute ${method} in tab`, tab.id, chrome.runtime.lastError.message);
		}
	}).catch((reason) => {
		// ReSharper disable once TsResolvedFromInaccessibleModule
		getLogger().error(`Could not execute ${method} in tab`, tab.id, reason);
	});


	// chrome.tabs.executeScript(tab.id,
	// 	{
	// 		code: makeFunctionCall(f),
	// 		allFrames: true
	// 	},
	// 	() => {
	// 		if (chrome.runtime.lastError != null) {
	// 			// ReSharper disable once TsResolvedFromInaccessibleModule
	// 			getLogger().error(`Could not execute ${method} in tab`, tab.id, chrome.runtime.lastError.message);
	// 		}
	// 	}
	// );
}

/**
 * Send message with error handling to a specified tab.
 */
export function sendMessageToTab<T>(
	tab: Tab,
	frameId: number | undefined,
	message: T,
	success?: ((response: unknown) => void) | undefined,
	failure?: (lastError: chrome.runtime.LastError) => void): void {

	if (typeof tab.id === "undefined") return;
	if (tab.url == null) return;
	if (!startsWith(tab.url, "http")) return;

	chrome.tabs.sendMessage(
		tab.id,
		message,
		{ frameId: frameId },
		(response: unknown) => {
			if (chrome.runtime.lastError == null) {
				if (success != null) success(response);
			} else {
				if (success === undefined &&
					chrome.runtime.lastError.message === "The message port closed before a response was received.") {
					// This is expected and could be avoided by sendMessage without a response callback.
					// We still call sendMessage this way to log any other errors.
					return;
				}

				if (failure != null) failure(chrome.runtime.lastError);
			}
		});
}

/**
 * Send message with error handling to a specified tab.
 */
export function sendMessageToTabWithLog<T>(tab: Tab, message: T): void {
	sendMessageToTab(
		tab,
		undefined,
		message,
		undefined,
		(lastError) => {
			getLogger().error("Could not send message to tab", tab.id, "error:", lastError.message, "message to be sent:", message);
		});
}
