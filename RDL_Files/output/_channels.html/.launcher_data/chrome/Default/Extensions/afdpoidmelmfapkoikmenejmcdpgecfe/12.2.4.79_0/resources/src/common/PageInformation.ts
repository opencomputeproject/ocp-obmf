import { populate } from "../utils/utils";
import { getFrameType } from "./FrameType";

/**
 * Page information received from background.
 */
export interface BackgroundPageInformation {
	documentUrl: string;
	frameUrl: string;
	documentCommittedUrl: string;
	frameCommittedUrl: string;
	frameId: number;
	tabId: number;
}

/**
 * Page information sent from content.
 */
export interface ContentPageInformation extends BackgroundPageInformation {
	type: string;
	title: string;
	documentTitle?: string;
	frameTitle: string;
	documentCurrentUrl?: string;
	frameCurrentUrl: string;
}

/**
 * Add information from content to background information.
 */
export function populateContentPageInformation(
	pageInformation: Readonly<BackgroundPageInformation>,
	documentTitle: string,
	destination: { [prop: string]: unknown; } ): void {

	populate(pageInformation, destination);

	const contentPageInformation: Partial<ContentPageInformation> = destination;

	contentPageInformation.type = getFrameType(pageInformation.frameId);
	contentPageInformation.title = window.document.title;
	contentPageInformation.frameTitle = window.document.title;
	contentPageInformation.frameCurrentUrl = document.URL;

	// Add document properties if script is running inside top frame.
	if (pageInformation.frameId === 0) {
		contentPageInformation.documentCurrentUrl = contentPageInformation.frameCurrentUrl;
	}

	contentPageInformation.documentTitle = documentTitle;
}
