"use strict";

import { getLogger } from "../utils/log";
import {
	ChromeDocumentTitleRequest,
	ChromeDocumentTitleUpdate,
	ChromeContentMessageType,
	ChromeDocumentTitleResponse
} from "../common/MessagingModel";

export class ChromeDocumentTitleManager {
	private readonly frameId: number;
	// document.title of the top frame.
	private documentTitle?: string;

	constructor(frameId: number, documentTitle?: string) {
		this.frameId = frameId;
		if (documentTitle != null) {
			this.documentTitle = documentTitle;
		}

		// Subscribe to tab update message
		chrome.runtime.onMessage.addListener(this.onMessage);
	}

	private readonly onMessage =
		(message: unknown,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response: object) => void) => {
		// Validate message
		if (typeof message !== "object") {
			return;
		}

		// tslint:disable-next-line no-unsafe-any
		const backgroundMessage = message as Partial<ChromeDocumentTitleRequest | ChromeDocumentTitleUpdate>;
		if (typeof backgroundMessage.messageType !== "string") {
			return;
		}

		getLogger().info("Received message from background", message);

		switch (backgroundMessage.messageType) {
			case ChromeContentMessageType.DOCUMENT_TITLE_REQUEST:
				// ChromeDocumentTitleRequest relevant only for top frame.
				if (this.frameId === 0) {
					const response: ChromeDocumentTitleResponse = {
						messageType: ChromeContentMessageType.DOCUMENT_TITLE_RESPONSE,
						documentTitle: document.title
					};
					sendResponse(response);
				}
				return true;
			case ChromeContentMessageType.DOCUMENT_TITLE_UPDATE:
				const documentTitleUpdateMessage = backgroundMessage as Partial<ChromeDocumentTitleUpdate>;
				// ReSharper disable once SuspiciousTypeofCheck
				if (typeof documentTitleUpdateMessage.documentTitle === "string") {
					this.documentTitle = documentTitleUpdateMessage.documentTitle;
					getLogger().info("Updating title to: ", documentTitleUpdateMessage.documentTitle);
				}
				// If we don't return true, updateDocumentTitleInFrames would log a 'message port closed' error.
				// We return true although we're not sending a response, and let garbage collection delete the port
				// (alternatively we could send a dummy response).
				return true;
		}

		getLogger().warn("Invalid message format", backgroundMessage);
	};

	/**
	 * Document title implementation for Chrome.
	 * If the title is not set, use document.title property.
	 */
	public getDocumentTitle(): string {
		return this.documentTitle != null ? this.documentTitle : document.title;
	}
}
