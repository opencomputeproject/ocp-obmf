"use strict";

import { getLogger } from "../../utils/log";
import * as Utils from "../../utils/utils";
import { doAfterDomReady } from "../../dom/DomUtils";

declare global {
	interface Window {
		// ReSharper disable once InconsistentNaming
		OPARX?: {
			ensureUserId?: () => string;
			// ReSharper disable once InconsistentNaming
			ensurePID?: () => string;
			ensureAixId?: () => string;
		};
		// ReSharper disable once InconsistentNaming
		RVBD_EUE?: {
			collector?: string;
			collectorHttpPort?: number;
			collectorHttpsPort?: number;
		};
		// ReSharper disable once InconsistentNaming
		AternityLogEnabled?: boolean;
	}
}

interface OparxData {
	serverURL: string;
	userId: string;
	pageId: string;
	aixId: string;
}

const APPINTERNALS_SCRIPT_NAME = "riverbed_appinternals.";
const APPINTERNALS_OPARX_DATA_SETTER_SCRIPT_ID = "Aternity-Riverbed-OPARX-Script";
const APPINTERNALS_DATA_ELEMENT_ID = "Aternity-Riverbed-OPARX-Information";
const APPINTERNALS_SERVERURL_ATTRIBUTE_ID = "serverURL";
const APPINTERNALS_USERID_ATTRIBUTE_ID = "userId";
const APPINTERNALS_PAGEID_ATTRIBUTE_ID = "pageId";
const APPINTERNALS_AIXID_ATTRIBUTE_ID = "aixId";

export function getOparxData(): OparxData {
	let serverURL = "";
	let userId = "";
	let pageId = "";
	let aixId = "";

	// Get AppInternals information
	const oparxInfo = document.getElementById(APPINTERNALS_DATA_ELEMENT_ID);
	if (oparxInfo != null) {
		const serverURLValue = oparxInfo.getAttribute(APPINTERNALS_SERVERURL_ATTRIBUTE_ID);
		if (serverURLValue != null) {
			serverURL = serverURLValue;
		}

		const userIdValue = oparxInfo.getAttribute(APPINTERNALS_USERID_ATTRIBUTE_ID);
		if (userIdValue != null) {
			userId = userIdValue;
		}

		const pageIdValue = oparxInfo.getAttribute(APPINTERNALS_PAGEID_ATTRIBUTE_ID);
		if (pageIdValue != null) {
			pageId = pageIdValue;
		}

		const aixIdValue = oparxInfo.getAttribute(APPINTERNALS_AIXID_ATTRIBUTE_ID);
		if (aixIdValue != null) {
			aixId = aixIdValue;
		}
		getLogger().info(`OPARX info: Server = ${serverURL}, User = ${userId}, Page = ${pageId}, Transaction = ${aixId}`);
	}

	return {
		serverURL: serverURL,
		userId: userId,
		pageId: pageId,
		aixId: aixId
	};
}
/**
 * Returns the app internals script (with a valid ID) or null if it doesn't.
 */
function getAppInternalsScript(): HTMLScriptElement | null {
	// document.head is null for PDF and Videos
	if (document.head == null) {
		return null;
	}

	// Search all the scripts in the document head
	const scripts = document.head.getElementsByTagName("script");
	for (let i = 0; i < scripts.length; i++) {
		const script = scripts[i];
		if (script.src.indexOf(APPINTERNALS_SCRIPT_NAME) > -1) {
			getLogger().info("AppInternals script found!");
			if (script.id === "") {
				script.id = APPINTERNALS_OPARX_DATA_SETTER_SCRIPT_ID;
			}
			return script;
		}
	}

	getLogger().debug("AppInternals script was not found");

	return null;
}

/**
 * Creates a meta element with the OPARX data as attributes.
 * NOTE: this must be called from the page context and not from the extension (content/
 * background) as it accesses a page object!
 * @param scriptId The id of the appinternals script which defines the OPARX object
 * @param metaElementId The id of the meta element to be created
 * @param serverURLAttribute The id of the attribute which will hold the serverURL
 * @param userIdAttribute The id of the attribute which will hold the userId
 * @param pageIdAttribute The id of the attribute which will hold the pageId
 * @param aixIdAttribute The id of the attribute which will hold the aixId
 *
 * @remark Must use only globally valid functions since this code is evaluated as-is.
 */
function setOparxData(scriptId: string,
	metaElementId: string,
	serverURLAttribute: string,
	userIdAttribute: string,
	pageIdAttribute: string,
	aixIdAttribute: string): void {

	// ReSharper disable UnusedParameter
	let pageLog = (message?: unknown, ...optionalParams: unknown[]) => { };
	// ReSharper restore UnusedParameter
	if (window.AternityLogEnabled != null && window.AternityLogEnabled) {
		const logAvailable =
			// tslint:disable-next-line no-unbound-method
			window != null && window.console != null && window.console.log != null && typeof window.console.log === "function";
		if (logAvailable) {
			pageLog = window.console.log;
		}
	}

	function setData(): boolean {
		try {
			if (window == null ||
				window.OPARX == null ||
				typeof window.OPARX !== "object" ||
				window.OPARX.ensureUserId == null ||
				typeof window.OPARX.ensureUserId !== "function" ||
				window.OPARX.ensurePID == null ||
				typeof window.OPARX.ensurePID !== "function" ||
				window.OPARX.ensureAixId == null ||
				typeof window.OPARX.ensureAixId !== "function") {

				pageLog("OPARX data is not currently available in this context");
				return false;

			} else {
				pageLog("OPARX data is currently available in this context");

				const serverURL = "";
				/* // Since the collector URL is not the server URL we want, this is commented out for the moment.
				if (window.RVBD_EUE && typeof window.RVBD_EUE === "object",
					window.RVBD_EUE.collector && typeof window.RVBD_EUE.collector === "string") {
					// Prefer HTTPS
					if (window.RVBD_EUE.collectorHttpsPort && typeof window.RVBD_EUE.collectorHttpsPort === "number",
						window.RVBD_EUE.collectorHttpsPort > 0 && window.RVBD_EUE.collectorHttpsPort <= 65535) {
						serverURL = "https://" + window.RVBD_EUE.collector + ":" + window.RVBD_EUE.collectorHttpsPort;
					}
					else if (window.RVBD_EUE.collectorHttpPort && typeof window.RVBD_EUE.collectorHttpPort === "number",
						window.RVBD_EUE.collectorHttpPort > 0 && window.RVBD_EUE.collectorHttpPort <= 65535) {
						serverURL = "http://" + window.RVBD_EUE.collector + ":" + window.RVBD_EUE.collectorHttpPort;
					}

					pageLog("OPARX serverURL is: " + serverURL);
				}*/

				const meta = document.createElement("meta");
				meta.id = metaElementId;
				meta.setAttribute(serverURLAttribute, serverURL);
				meta.setAttribute(userIdAttribute, window.OPARX.ensureUserId());
				meta.setAttribute(pageIdAttribute, window.OPARX.ensurePID());
				meta.setAttribute(aixIdAttribute, window.OPARX.ensureAixId());
				document.head.appendChild(meta);

				pageLog("Successfully set OPARX data into a meta element");
				return true;
			}
		} catch (e) {
			pageLog("There was an error setting OPARX data", e as unknown);
			return false;
		}
	}

	// If we couldn't set data immediately then script probably didn't run
	if (!setData()) {
		pageLog("OPARX data isn't available at the time, will register on AppInternals script load");
		const script = document.getElementById(scriptId) as HTMLScriptElement;
		if (script != null) {
			const handler: EventListener = () => {
				script.removeEventListener("load", handler);
				setData();
			};
			script.addEventListener("load", handler);
		} else {
			pageLog("AppInternals script is not available in the page");
		}
	}
}

export function initializeAppInternals(): void {
	doAfterDomReady(() => {
		getLogger().info("DOM loaded");

		const appInternalsScript = getAppInternalsScript();
		// If the Riverbed appinternals script was found then we need to inject a script
		// which reads OPARX data and saves it in a location (DOM) accessible to the content
		// script.
		if (appInternalsScript != null) {
			const dataSetterScript = document.createElement("script");
			// Get the code for the script from setOparxData and pass all the IDs into it
			dataSetterScript.text = Utils.makeFunctionCall(
				setOparxData,
				[
					appInternalsScript.id,
					APPINTERNALS_DATA_ELEMENT_ID,
					APPINTERNALS_SERVERURL_ATTRIBUTE_ID,
					APPINTERNALS_USERID_ATTRIBUTE_ID,
					APPINTERNALS_PAGEID_ATTRIBUTE_ID,
					APPINTERNALS_AIXID_ATTRIBUTE_ID
				]);
			document.head.appendChild(dataSetterScript);
		}
	});
}
