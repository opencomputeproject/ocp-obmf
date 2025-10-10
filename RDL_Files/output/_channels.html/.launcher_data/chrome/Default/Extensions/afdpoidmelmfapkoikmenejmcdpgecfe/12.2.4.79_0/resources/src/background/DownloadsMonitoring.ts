import { IDownloadsMonitoring } from "./IDownloadsMonitoring";
import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { getLogger } from "../utils/log";
// import { BackgroundPageInformation } from "../common/PageInformation";
import { MessageType, OutgoingBaseNativeMessage, OutgoingEventMessageData } from "../common/MessagingModel";
import { UXData } from "../common/UXData";
import { timeProvider } from "../utils/timeProvider";

export const DOWNLOADS_EVENT_NAMESPACE = "ui:chrome:Downloads";

class DownloadItem implements chrome.downloads.DownloadItem {
	/** Number of bytes received so far from the host, without considering file compression. */
	public bytesReceived!: number;
	/** Indication of whether this download is thought to be safe or known to be suspicious. */
	public danger!: chrome.downloads.DangerType;
	/** Absolute download URL. == finalUrl? */
	public url!: string;
	/**
	 * The absolute URL that this download is being made from, after all redirects.
	 * @since Since Chrome 54.
	 */
	public finalUrl!: string;
	/** Number of bytes in the whole file, without considering file compression, or -1 if unknown. */
	public totalBytes!: number;
	/** Absolute local path. */
	public filename!: string;
	/** True if the download has stopped reading data from the host, but kept the connection open. */
	public paused!: boolean;
	/** Indicates whether the download is progressing, interrupted, or complete. */
	public state!: chrome.downloads.DownloadState;
	/** The file's MIME type. */
	public mime!: string;
	/** Number of bytes in the whole file post-decompression, or -1 if unknown. */
	public fileSize!: number;
	/** The time when the download began in ISO 8601 format. May be passed directly to the Date constructor:
	 * chrome.downloads.search({}, function(items){items.forEach(function(item){console.log(new Date(item.startTime))})})
	 */
	public startTime!: string;
	/** Optional. Why the download was interrupted. Several kinds of HTTP errors may be grouped under one of the errors
	 * beginning with SERVER_. Errors relating to the network begin with NETWORK_, errors relating to the process of
	 * writing the file to the file system begin with FILE_, and interruptions initiated by the user begin with USER_.
	 */
	public error?: chrome.downloads.DownloadInterruptReason;
	/** Optional. The time when the download ended in ISO 8601 format. May be passed directly to the Date constructor:
	 * chrome.downloads.search({}, function(items){items.forEach(function(item){if (item.endTime) console.log(new Date(item.endTime))})})
	 */
	public endTime?: string;
	/** An identifier that is persistent across browser sessions. */
	public id!: number;
	/** False if this download is recorded in the history, true if it is not recorded. */
	public incognito!: boolean;
	/** Absolute URL. */
	public referrer!: string;
	/** Optional. Estimated time when the download will complete in ISO 8601 format. May be passed directly to the Date
	 * constructor: chrome.downloads.search({}, function(items){items.forEach(function(item){if (item.estimatedEndTime)
	 * console.log(new Date(item.estimatedEndTime))})})
	 */
	public estimatedEndTime?: string;
	/** True if the download is in progress and paused, or else if it is interrupted and can be resumed starting from
	 * where it was interrupted.
	 */
	public canResume!: boolean;
	/** Whether the downloaded file still exists. This information may be out of date because Chrome does not
	 * automatically watch for file removal. Call search() in order to trigger the check for file existence.
	 * When the existence check completes, if the file has been deleted, then an onChanged event will fire.
	 * Note that search() does not wait for the existence check to finish before returning, so results from
	 * search() may not accurately reflect the file system. Also, search() may be called as often as necessary,
	 * but will not check for file existence any more frequently than once every 10 seconds.
	 */
	public exists!: boolean;
	/** Optional. The identifier for the extension that initiated this download if this download was
	 * initiated by an extension. Does not change once it is set.
	 */
	public byExtensionId?: string;
	/** Optional. The localized name of the extension that initiated this download if this download
	 * was initiated by an extension. May change if the extension changes its name or if the user changes their locale.
	 */
	public byExtensionName?: string;
	public totalTimeMillis: number;
	public interactionTimeMillis: number;
	public transferTimeMillis: number;
	public lastResumeTime: number;   // onCreated.startTime

	constructor(item: chrome.downloads.DownloadItem) {
		Object.assign(this, item);

		this.totalTimeMillis = 0;
		this.interactionTimeMillis = 0;
		this.transferTimeMillis = 0;
		this.lastResumeTime = new Date(item.startTime).getTime();
		this.bytesReceived = 0;
	}

	public static getDownloadInterruptReason(reason: string): chrome.downloads.DownloadInterruptReason {
		switch (reason) {
			case "FILE_FAILED":
			case "FILE_ACCESS_DENIED":
			case "FILE_NO_SPACE":
			case "FILE_NAME_TOO_LONG":
			case "FILE_TOO_LARGE":
			case "FILE_VIRUS_INFECTED":
			case "FILE_TRANSIENT_ERROR":
			case "FILE_BLOCKED":
			case "FILE_SECURITY_CHECK_FAILED":
			case "FILE_TOO_SHORT":
			case "FILE_HASH_MISMATCH":
			case "FILE_SAME_AS_SOURCE":
			case "NETWORK_FAILED":
			case "NETWORK_TIMEOUT":
			case "NETWORK_DISCONNECTED":
			case "NETWORK_SERVER_DOWN":
			case "NETWORK_INVALID_REQUEST":
			case "SERVER_FAILED":
			case "SERVER_NO_RANGE":
			case "SERVER_BAD_CONTENT":
			case "SERVER_UNAUTHORIZED":
			case "SERVER_CERT_PROBLEM":
			case "SERVER_FORBIDDEN":
			case "SERVER_UNREACHABLE":
			case "SERVER_CONTENT_LENGTH_MISMATCH":
			case "SERVER_CROSS_ORIGIN_REDIRECT":
			case "USER_CANCELED":
			case "USER_SHUTDOWN":
			case "CRASH":
				return reason;
			default:
				return "CRASH";
		}
	}
}

// The sent message does *not* include tab/frame info. So it extends BaseNativeMessage,
// not PageNativeMessage.
export class OutgoingDownloadMessage extends OutgoingBaseNativeMessage {
	public messageData: OutgoingEventMessageData<UXData>;

	constructor(eventType: string, timeStamp: number) {
		super(MessageType.EVENT, timeStamp);
		this.messageData = {
			EventType: eventType,
			// tslint:disable-next-line no-any
			Data: [({}) as any as UXData]
		};
	}
}

interface Downloads {
	[id: number]: DownloadItem;
}

export class DownloadsMonitoring implements IDownloadsMonitoring {
	private manager?: IBackgroundManager;   // for configuration
	private communication?: IAgentCommunication;
	// TODO: Ever accumulating? Shouldn't we remove items after we send a complete/failed message for them?
	private readonly downloads: Downloads;
	private readonly activeDownloadIDs: number[];
	private pollingTimer?: NodeJS.Timer ;

	constructor() {
		this.downloads = {};
		this.activeDownloadIDs = [];
	}

	public initDownloadsMonitoring(manager: IBackgroundManager, communication: IAgentCommunication): void {

		this.manager = manager;
		this.communication = communication;

		chrome.downloads.onChanged.addListener(this.onDownloadChanged);
		chrome.downloads.onCreated.addListener(this.onDownloadCreated);
	}

	public uninitDownloadsMonitoring(): void {
		chrome.downloads.onChanged.removeListener(this.onDownloadChanged);
		chrome.downloads.onCreated.removeListener(this.onDownloadCreated);
	}

	private makeEventName(event: string): string {
		return DOWNLOADS_EVENT_NAMESPACE + "." + event;
	}

	private createDataMessage(event: string, item: DownloadItem): OutgoingDownloadMessage {
		const message = new OutgoingDownloadMessage(this.makeEventName(event), timeProvider.now());
		const messageData = message.messageData.Data[0];

		messageData.downloadUrl = item.url;
		messageData.referrerPageUrl = item.referrer;
		messageData.totalBytes = item.totalBytes;
		messageData.filename = item.filename;
		messageData.mime = item.mime;
		messageData.startTime = new Date(item.startTime).getTime();

		if (item.error !== undefined) {
			messageData.error = item.error;
		}

		messageData.totalTimeMillis = item.totalTimeMillis;
		messageData.transferTimeMillis = item.transferTimeMillis;
		messageData.interactionTimeMillis = item.interactionTimeMillis;
		messageData.waitTimeMillis = item.totalTimeMillis - item.interactionTimeMillis;
		messageData.bytesReceived = item.bytesReceived;
		return message;
	}

	private pollDownloads(): void {
		this.activeDownloadIDs.forEach(id => chrome.downloads.search({ id: id }, (item: chrome.downloads.DownloadItem[]) => {
			// Make changes only if download is in progress (bytesReceived for failed / cancelled downloads are 0)
			if (item[0].bytesReceived > 0) {
				const downloadingItem = this.downloads[id];
				downloadingItem.bytesReceived = item[0].bytesReceived;

				//  If item was completely downloaded - handle completion
				if (item[0].bytesReceived === downloadingItem.totalBytes) {
					const now = timeProvider.now();
					downloadingItem.transferTimeMillis += now - downloadingItem.lastResumeTime;
					downloadingItem.lastResumeTime = now;
					this.removeItemFromPolling(item[0].id);
				}
			}
		}));
	}

	private handleCompletion(item: DownloadItem): void {
		getLogger().info("Download complete message", item);
		if (this.communication == null) {
			return;
		}

		// Can happen when the file is too small and item.bytesReceived were not updated yet
		if (item.bytesReceived === 0) {
			item.bytesReceived = item.totalBytes;
			const now = timeProvider.now();
			item.transferTimeMillis += now - item.lastResumeTime;
			item.totalTimeMillis = now - new Date(item.startTime).getTime(); // update total time - to be more accurate
		}
		this.removeItemFromPolling(item.id);
		const message = this.createDataMessage("Completed", item);
		this.communication.postNativeMessage(message);
	}

	private removeItemFromDownloads(id: number): void {
		const itemDownloaded = this.downloads[id];
		if (itemDownloaded !== undefined) {
			delete this.downloads[id];
		}
	}

	private startPolling(): void {
		this.pollingTimer = setInterval(this.pollDownloads.bind(this), 100);
		getLogger().info("Started downloads polling, interval ID: ", this.pollingTimer);
	}

	private removeItemFromPolling(downloadId: number): void {
		const index = this.activeDownloadIDs.indexOf(downloadId);
		if (index !== -1) {
			this.activeDownloadIDs.splice(index, 1);
		}

		if (this.activeDownloadIDs.length === 0) {
			this.stopPolling();
		}
	}

	private stopPolling(): void {
		if (this.pollingTimer !== undefined) {
			clearInterval(this.pollingTimer);
			getLogger().info("Stopped downloads polling, interval ID: ", this.pollingTimer);
			this.pollingTimer = undefined;
		}
	}

	private readonly onDownloadCreated = (item: chrome.downloads.DownloadItem) => {
		if (this.manager == null || !this.manager.active || this.communication == null) {
			return;
		}

		if (item.state !== "in_progress") {
			// When opening the 'downloads' page for the first time in a session,
			// already-downloaded items fire onCreated with state 'complete', or 'interrupted' etc.
			return;
		}

		// Add the item's id to the activeDownloadIDs array, only if it does not exist
		const index = this.activeDownloadIDs.indexOf(item.id);
		if (index === -1) {
			this.activeDownloadIDs.push(item.id);
		}

		// Start the polling only once
		if (this.activeDownloadIDs.length === 1) {
			this.startPolling();
		}

		this.downloads[item.id] = new DownloadItem(item);
		this.downloads[item.id].lastResumeTime = new Date(item.startTime).getTime();

		// Save the original final name, before the override
		this.downloads[item.id].filename = item.url.split("/").pop() as string;
	};

	private readonly onDownloadChanged = (delta: chrome.downloads.DownloadDelta) => {
		if (this.manager == null || !this.manager.active || this.communication == null) {
			return;
		}

		// Verify the change is relevant
		if (delta.fileSize === undefined &&
			delta.totalBytes === undefined &&
			delta.filename === undefined &&
			delta.paused === undefined &&
			delta.endTime === undefined &&
			delta.error === undefined) {
			return;
		}

		const item = this.downloads[delta.id];
		if (item === undefined) {
			getLogger().error("DownloadChanged without matching DownloadCreated: ", delta);
			return;
		}

		if (delta.fileSize !== undefined && delta.fileSize.current !== undefined) {
			item.fileSize = delta.fileSize.current;
		}

		if (delta.totalBytes !== undefined && delta.totalBytes.current !== undefined) {
			item.totalBytes = delta.totalBytes.current;
		}

		if (delta.filename !== undefined && delta.filename.current !== undefined) {
			// Filename is set - interaction has ended
			if (item.filename === "") { // In case filename was missing
				item.filename = delta.filename.current;
			}
			// Track here when it's time to rethink this code: https://bugs.chromium.org/p/chromium/issues/detail?id=982232#c0
			item.interactionTimeMillis = timeProvider.now() - new Date(item.startTime).getTime();
		}

		// Handle pause/resume
		if (delta.paused !== undefined && delta.paused.current !== undefined) {
			if (delta.paused.current === false) {
				// Just resumed
				getLogger().debug("Download resumed: ", item);
				item.lastResumeTime = timeProvider.now();
			}
			else {
				getLogger().debug("Download paused: ", item);
				item.transferTimeMillis += timeProvider.now() - item.lastResumeTime;
			}
		}

		// Handle completion
		if (delta.endTime !== undefined) {
			item.totalTimeMillis = timeProvider.now() - new Date(item.startTime).getTime();
			this.handleCompletion(item);
		}

		// Handle cancellation/failure
		if (delta.error !== undefined ||
			(delta.state !== undefined && delta.state.current === "interrupted")) {

			this.removeItemFromPolling(item.id);

			item.totalTimeMillis = timeProvider.now() - new Date(item.startTime).getTime();
			item.transferTimeMillis += timeProvider.now() - item.lastResumeTime;

			if (item.interactionTimeMillis === 0) {
				// User just cancelled at the file dialog
				item.interactionTimeMillis = item.totalTimeMillis;
			}

			if (delta.error !== undefined && delta.error.current !== undefined) {
				item.error = DownloadItem.getDownloadInterruptReason(delta.error.current);
			}

			getLogger().info("Download failed message", item);
			const message = this.createDataMessage("Failed", item);
			this.communication.postNativeMessage(message);

			this.removeItemFromDownloads(delta.id);
		}
	};
}
