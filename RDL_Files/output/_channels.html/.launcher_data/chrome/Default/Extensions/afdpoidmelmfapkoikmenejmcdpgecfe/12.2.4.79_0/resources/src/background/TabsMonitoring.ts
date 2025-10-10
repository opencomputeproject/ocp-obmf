"use strict";

import { getLogger } from "../utils/log";
import { sendMessageToTab, executeFunctionInTab } from "./tabs";
import { IBackgroundManager } from "./IBackgroundManager";
import { IAgentCommunication } from "./IAgentCommunication";
import { ITabEventData, ITabsMonitoring } from "./ITabsMonitoring";
import { timeProvider } from "../utils/timeProvider";
import * as Utils from "../utils/utils";
import {
	OutgoingEventMessage,
	ChromeDocumentTitleRequest,
	ChromeContentMessageType,
	ChromeDocumentTitleResponse,
	ChromeDocumentTitleUpdate
	} from "../common/MessagingModel";

import Tab = chrome.tabs.Tab;

export class TabsMonitoring implements ITabsMonitoring {
	public static readonly TAB_EVENT_NAMESPACE = "ui:chrome:Tab";

	private manager?: IBackgroundManager;
	private communication?: IAgentCommunication;

	// #region Utility

	private makeEventName(event: string): string {
		return TabsMonitoring.TAB_EVENT_NAMESPACE + "." + event;
	}

	private globalTabsStates: { [tabId: number]: ITabEventData; } = {};

	/**
	 * Create base tab message.
	 */
	private createDataMessage(event: string, tabId: number, timestamp: number = timeProvider.now()):
		OutgoingEventMessage<ITabEventData> {

		const message = new OutgoingEventMessage<ITabEventData>(this.makeEventName(event), timestamp);

		const tabState = this.globalTabsStates[tabId];
		const messageData = message.messageData.Data[0];

		messageData.tabId = tabId;
		messageData.title = tabState.title;
		if (tabState.status != null) {
			messageData.status = tabState.status;
		}
		if (tabState.currentUrl != null) {
			messageData.currentUrl = tabState.currentUrl;
		}

		return message;
	}

	private addTab(tab: Tab): void {
		const tabId = tab.id;
		if (tabId == null) {
			return;
		}

		const title = tab.title != null ? tab.title : "";
		this.globalTabsStates[tabId] = {
			currentUrl: tab.url,
			tabId: tabId,
			windowId: tab.windowId,
			title: title,
			documentTitle: title
		};
		if (tab.status != null) {
			this.globalTabsStates[tabId].status = tab.status;
		}
	}

	private addTabIfDoesntExists(tabId: number, tab: Tab): void {
		if (this.globalTabsStates[tabId] == null) {
			getLogger().log("Adding tab: ", tab);
			this.addTab(tab);
		}
	}

	// #endregion

	// #region Exported privates

	/**
	 * @param tabId Tab identifier
	 * @return Tab state.
	 */
	public getTabState(tabId: number): ITabEventData | null {
		const tabState = this.globalTabsStates[tabId];
		if (tabState != null) {
			return {...tabState};
		} else {
			return null;
		}
	}

	/**
	 * Get a Tab State object accordant to some Tab ID.
	 * @param tabId The ID of the Tab whose Tab State object is to be fetched or created.
	 * @param browserTab Optional Browser Tab object, used in the creation of the requested Tab State object.
	 * @return Promise to deliver a Tab State object or a null, if such object does not exist and should not be created.
	 */
	private getOrCreateTabStateAsync(
		tabId: number,
		browserTab: chrome.tabs.Tab | null = null): Promise<ITabEventData | null> {
		const tabDataPromise = new Promise<ITabEventData | null>((resolve, reject) => {
			// This is the body of the output Promise.
			const tabState = this.globalTabsStates[tabId];
			if (tabState != null) {
				// Tab State object with the requested ID already exists.
				// Resolve the Promise with the existing Tab State.
				resolve(tabState);
			} else {
				// Tab State object with the requested ID does not exist.
				// As there is no Tab State object accordant to the requested Tab ID, resolve the output Promise with null.
				resolve(null);
			}
		});

		return tabDataPromise;
	}

	/**
	 * Get a browser Tab object accordant to some Tab ID.
	 * @param tabId The ID of the Tab whose browser Tab object is to be fetched or created.
	 * @return Promise to deliver a browser Tab object.
	 */
	private getTab(tabId: number): Promise<chrome.tabs.Tab> {
		const browserTabPromise = new Promise<chrome.tabs.Tab>((resolve, reject) => {
			// This is the body of the Promise.
			try {
				chrome.tabs.get(tabId, (browserTab: chrome.tabs.Tab) => {
					// This is the body of the callback supplied to 'chrome.tabs.get'.
					if (chrome.runtime.lastError == null) {
						// The browser Tab object accordant to the requested Tab ID had been found.
						// Resolve the Promise with that Tab object.
						resolve(browserTab);
					}
					else {
						// There is no browser Tab with the requested Tab ID.
						// Reject the Promise.
						getLogger().error("No Browser Tab object for Tab ID.", tabId, chrome.runtime.lastError);
						reject(chrome.runtime.lastError);
					}
				});
			} catch (err) {
				// Exception occured in the call to 'chrome.tabs.get'.
				// Reject the Promise.
				getLogger().error("Exception while getting Browser Tab object.", tabId, err);
				reject(err);
			}
		});

		return browserTabPromise;
	}

	// #endregion

	// #region Handlers

	private readonly onCreated = (tab: chrome.tabs.Tab) => {
		const timestamp = timeProvider.now();
		this.onCreatedImpl(tab, timestamp);
	}

	private onCreatedImpl(tab: chrome.tabs.Tab, timestamp: number): void {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onCreated", tab.id, tab);
		if (tab.id == null) {
			getLogger().error(`No tab.id for ${tab}`);
			return;
		}
		delete this.globalTabsStates[tab.id];
		this.addTab(tab);

		const message = this.createDataMessage("Created", tab.id, timestamp);
		if (this.communication != null) {
			this.communication.postNativeMessage(message);
		}
	}

	private readonly onUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onUpdated", tabId, changeInfo, tab);
		if (tab.id == null) {
			getLogger().error(`No tab.id for ${tab}`);
			return;
		}

		// Update title in content script
		if (typeof tab.title === "string") {
			this.updateDocumentTitleInFrames(tab);
		}

		// Fetch the Tab State object asynchronously, create it if needed.
		this.getOrCreateTabStateAsync(tabId)
			.then(tabState => {
				if (tabState == null) {
					return;
				}
				if (typeof changeInfo.title !== "undefined") {
					getLogger().log(`Tab onUpdated previous title: ${tabState.title}, new title: ${changeInfo.title}`);
					tabState.title = changeInfo.title;

					// Set initial documentTitle as title.
					// It will be updated later in the updateDocumentTitleInFrames
					tabState.documentTitle = changeInfo.title;
				}

				if (changeInfo.url != null) {
					tabState.currentUrl = changeInfo.url;
				}
				if (changeInfo.status != null) {
					// If we got here following a refresh there's an excellent chance the content script
					// hadn't finished processing the config yet and TitleManager isn't available.
					// It suffices to delay the message passing a bit. If some day it doesn't - add some
					// 'CONTENT_READY' message, and do this only afterwards.
					if (changeInfo.status === "complete") {
						setTimeout(
							() => this.updateDocumentTitleInFrames(tab),
							0);
					}
				}

				const message = this.createDataMessage("Updated", tabId);
				if (this.communication != null) {
					this.communication.postNativeMessage(message);
				}
			}
			)
			.catch(err => {
				getLogger().error("Error while getting Tab State object on Tab Update.", tabId, err);
			});
	}

	private readonly onRemoved = (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
		this.onRemovedImpl(tabId, removeInfo, timeProvider.now());
	}

	private onRemovedImpl(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo, timestamp: number): void {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onRemoved", tabId, removeInfo);

		// Fetch the Tab State object asynchronously, create it if needed.
		this.getOrCreateTabStateAsync(tabId)
			.then(tabState => {
				if (tabState != null) {
					const message = this.createDataMessage("Removed", tabId, timestamp);
					const messageData = message.messageData.Data[0];
					messageData.isWindowClosing = removeInfo.isWindowClosing;
					if (this.communication != null) {
						this.communication.postNativeMessage(message);
					}

					delete this.globalTabsStates[tabId];
				}
			})
			.catch(err => {
				getLogger().error("Error while getting Tab State object on Tab Remove.", tabId, err);
			});
	}

	private readonly onReplaced = (addedTabId: number, removedTabId: number) => {
		const timestamp = timeProvider.now();
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onReplaced", addedTabId, removedTabId);

		// Replaced is like remove and then create so we need to insert the new data and report
		// And these must be reported in this order (remove -> create -> replace) because the
		// meaning of replace is that there was a remove and then a create
		chrome.tabs.get(addedTabId,
			addedTab => {
				// This is the body of the callback that will be called when the Tab accordant to the
				// addedTabId is retrieved.
				const addedTabObjectFetched = chrome.runtime.lastError == null;
				// Fetch the removed Tab State object asynchronously, create it if needed.
				this.getOrCreateTabStateAsync(removedTabId)
					.then(tabState => {
						// This is the body of the resolve of the Promise that retrieves the Tab State
						// object accordant to the removed Tab ID.
						let replacedMessage: OutgoingEventMessage<ITabEventData> | undefined;
						if (addedTabObjectFetched && tabState != null) {
							replacedMessage = this.createDataMessage("Replaced", removedTabId, timestamp);
							const messageData = replacedMessage.messageData.Data[0];
							messageData.newTabId = addedTabId;
						}

						// Must first report removed, then created and only after both - replaced.
						// Removed must be reported anyway - regardless of whether the new tabId exists or not.
						this.onRemovedImpl(
							removedTabId,
							{
								windowId: addedTab.windowId, // Obviously they're in the same window.
								isWindowClosing: false // Because the window isn't closing when it's replace.
							},
							timestamp);

						if (addedTabObjectFetched) {
							this.onCreatedImpl(addedTab, timestamp);
						}

						// ReSharper disable once ConditionIsAlwaysConst
						if (replacedMessage != null) {
							if (this.communication != null) {
								this.communication.postNativeMessage(replacedMessage);
							}
						}
					})
					.catch(err => {
						getLogger().error("Error while getting removed Tab State object on Tab Replace.", removedTabId, err);
					});
			});
	}

	private readonly onActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onActivated", activeInfo);

		// Fetch the Tab State object asynchronously, create it if needed.
		this.getOrCreateTabStateAsync(activeInfo.tabId)
			.then(tabState => {
				if (tabState != null) {
					const message = this.createDataMessage("Activated", activeInfo.tabId);
					if (this.communication != null) {
						this.communication.postNativeMessage(message);
					}
					// fixing WAC bug with focus
					chrome.tabs.get(activeInfo.tabId,
						(tab: chrome.tabs.Tab) => {
							executeFunctionInTab(tab, () => { window.focus(); }, "focus");
						});
				}
			})
			.catch(err => {
				getLogger().error("Error while getting Tab State object on Tab Activation.", activeInfo.tabId, err);
			});
	}

	private readonly onMoved = (tabId: number, moveInfo: chrome.tabs.TabMoveInfo) => {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onMoved", moveInfo);

		// Fetch the Tab State object asynchronously, create it if needed.
		this.getOrCreateTabStateAsync(tabId)
			.then(tabState => {
				if (tabState != null) {
					const message = this.createDataMessage("Moved", tabId);
					if (this.communication != null) {
						this.communication.postNativeMessage(message);
					}
				}
			})
			.catch(err => {
				getLogger().error("Error while getting Tab State object on Tab Move.", tabId, err);
			});
	}

	private readonly onAttached = (tabId: number, attachInfo: chrome.tabs.TabAttachInfo) => {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onAttached", attachInfo);

		// Fetch the Tab State object asynchronously, create it if needed.
		this.getOrCreateTabStateAsync(tabId)
			.then(tabState => {
				if (tabState != null) {
					const message = this.createDataMessage("Attached", tabId);
					if (this.communication != null) {
						this.communication.postNativeMessage(message);
					}
				}
			})
			.catch(err => {
				getLogger().error("Error while getting Tab State object on Tab Attach.", tabId, err);
			});
	}

	private readonly onDetached = (tabId: number, detachInfo: chrome.tabs.TabDetachInfo) => {
		if (this.manager == null || !this.manager.active) {
			return;
		}
		getLogger().log("Tab onDetached", detachInfo);

		// Fetch the Tab State object asynchronously, create it if needed.
		this.getOrCreateTabStateAsync(tabId)
			.then(tabState => {
				if (tabState != null) {
					const message = this.createDataMessage("Detached", tabId);
					if (this.communication != null) {
						this.communication.postNativeMessage(message);
					}
				}
			})
			.catch(err => {
				getLogger().error("Error while getting Tab State object on Tab Detach.", tabId, err);
			});
	}

	// #endregion

	/**
	 * Ask document.title property from top frame and publish it to other frames in the tab.
	 * This way we are bypassing the cross-site domain issue.
	 */
	private updateDocumentTitleInFrames(tab: Tab): void {
		if (tab.id == null || tab.title == null || tab.url == null) {
			return;
		}
		if (!Utils.startsWith(tab.url, "http")) {
			return;
		}

		let documentTitle: string | undefined;

		// Ask documentTitle from top frame (frameId = 0) and then publish it to all frames in tab.
		const documentTitleRequest: ChromeDocumentTitleRequest = {
			messageType: ChromeContentMessageType.DOCUMENT_TITLE_REQUEST
		};

		getLogger().log(`Requesting document title from tab id: ${tab.id}, url: ${tab.url}`);
		sendMessageToTab(
			tab,
			0, // Request only top frame
			documentTitleRequest,
			(response) => {
				const documentTitleResponse = response as Partial<ChromeDocumentTitleResponse>;
				if (typeof response === "undefined") {
					getLogger().warn("Bad response", response);
					return;
				}

				getLogger().log(`Requesting document title from tab id: ${tab.id}, url: ${tab.url}`);
				// ReSharper disable once SuspiciousTypeofCheck
				if (documentTitleResponse === null ||
					documentTitleResponse.messageType !== ChromeContentMessageType.DOCUMENT_TITLE_RESPONSE ||
					typeof documentTitleResponse.documentTitle !== "string") {
					getLogger().warn("Bad documentTitleResponse", response);
					if (tab.title !== undefined) {
						documentTitle = tab.title;
					}
				}
				else { // documentTitleResponse is valid
					documentTitle = documentTitleResponse.documentTitle;
				}
				if (documentTitle === undefined) {
					return;
				}

				// Send title update to all frames
				const documentTitleUpdate: ChromeDocumentTitleUpdate = {
					messageType: ChromeContentMessageType.DOCUMENT_TITLE_UPDATE,
					documentTitle: documentTitle
				};
				sendMessageToTab(tab, undefined, documentTitleUpdate);
			},
			(lastError) => {
				getLogger().warn(`Couldn't request document.title from tab id: ${tab.id}, url: ${tab.url}`, lastError);
			});
	}

	public forAllTabs(func: (tab: Tab) => void): void {
		chrome.tabs.query({}, tabs => tabs.forEach(func));
	}

	private readonly findNameChanged = (tab: Tab) => {
		if (tab.id == null) {
			return;
		}

		const tabState = this.globalTabsStates[tab.id];
		if (tabState != null && tabState.title !== tab.title) {
			if (typeof tab.title !== "undefined") {
				tabState.title = tab.title;
			}
			getLogger().log("Interval found a titleChange", tabState);

			const message = this.createDataMessage("TitleChange", tab.id);
			if (this.communication != null) {
				this.communication.postNativeMessage(message);
			}
		}
	}

	private updateTabInterval: NodeJS.Timer | undefined;
	private tabMonitoringEnabled = false;

	public initTabsMonitoring(
		manager: IBackgroundManager,
		communication: IAgentCommunication): void {

		this.manager = manager;
		this.communication = communication;

		if (this.tabMonitoringEnabled) {
			getLogger().error("You can't init tab monitoring twice in a row (without uninit)");
			return;
		}

		this.tabMonitoringEnabled = true;

		chrome.tabs.onCreated.addListener(this.onCreated);
		chrome.tabs.onUpdated.addListener(this.onUpdated);
		chrome.tabs.onRemoved.addListener(this.onRemoved);

		if (chrome.tabs.onReplaced != null) {
			chrome.tabs.onReplaced.addListener(this.onReplaced);
		}

		chrome.tabs.onActivated.addListener(this.onActivated);

		if (chrome.tabs.onMoved != null) {
			chrome.tabs.onMoved.addListener(this.onMoved);
		}

		chrome.tabs.onAttached.addListener(this.onAttached);
		chrome.tabs.onDetached.addListener(this.onDetached);

		this.updateTabInterval = setInterval(() => this.forAllTabs(this.findNameChanged), 1000);

		// Query existing tabs
		this.forAllTabs(tab => {
			if (tab.id == null) return;

			this.addTabIfDoesntExists(tab.id, tab);
			const message = this.createDataMessage("Discovered", tab.id);

			if (this.communication != null) {
				this.communication.postNativeMessage(message);
			}
		});
	}

	public uninitTabsMonitoring(): void {
		this.tabMonitoringEnabled = false;

		this.globalTabsStates = {};

		if (this.updateTabInterval !== undefined) {
			clearInterval(this.updateTabInterval);
			this.updateTabInterval = undefined;
		}

		chrome.tabs.onCreated.removeListener(this.onCreated);
		chrome.tabs.onUpdated.removeListener(this.onUpdated);
		chrome.tabs.onRemoved.removeListener(this.onRemoved);
		if (chrome.tabs.onReplaced != null) {
			chrome.tabs.onReplaced.removeListener(this.onReplaced);
		}
		chrome.tabs.onActivated.removeListener(this.onActivated);
		if (chrome.tabs.onMoved != null) {
			chrome.tabs.onMoved.removeListener(this.onMoved);
		}
		chrome.tabs.onAttached.removeListener(this.onAttached);
		chrome.tabs.onDetached.removeListener(this.onDetached);

		this.manager = undefined;
		this.communication = undefined;
	}
}
