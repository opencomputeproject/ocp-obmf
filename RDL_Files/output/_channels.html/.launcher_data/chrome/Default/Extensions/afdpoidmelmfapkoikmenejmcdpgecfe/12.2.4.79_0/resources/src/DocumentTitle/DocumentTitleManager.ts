"use strict";

import { isInternetExplorer } from "../utils/utils";
import { DocumentTitleGetter } from "./DocumentTitleGetter";
import { getLogger } from "../utils/log";

// These imports don't generate real code as long as modules are used as a type.
// https://github.com/basarat/typescript-book/blob/master/docs/project/external-modules.md#use-case-lazy-loading
import * as ieDocumentTitle from "./ieDocumentTitle";
import * as ChromeDocumentTitleManagerModule from "./ChromeDocumentTitleManager";

// ReSharper disable once InconsistentNaming
type IEDocumentTitleModuleType = typeof ieDocumentTitle;
type ChromeDocumentTitleManagerModuleType = typeof ChromeDocumentTitleManagerModule;

declare function require(module: "./ieDocumentTitle"): IEDocumentTitleModuleType;
declare function require(module: "./ChromeDocumentTitleManager"): ChromeDocumentTitleManagerModuleType;

export class DocumentTitleManager implements DocumentTitleGetter {
	public readonly getDocumentTitle: () => string;

	/**
	 * @param documentTitle Relevant only to Chrome. IE doesn't need it.
	 * @param frameId Relevant only to Chrome (Firefox, Edge). IE doesn't need it.
	 */
	constructor(documentTitle?: string, frameId?: number) {
		try {
			// Try naive way when top window title is accessible.
			this.getDocumentTitle = () => window.top.document.title;
			this.getDocumentTitle();

			getLogger().info("DocumentTitleManager using window.top.document.title. Got title: ", this.getDocumentTitle());

			// Add listen to DOCUMENT_TITLE_REQUEST message in the main frame
			if (window === window.top) {
				// ReSharper disable once CommonJsExternalModule
				// tslint:disable-next-line no-require-imports
				const chromeDocumentTitleModule = require("./ChromeDocumentTitleManager");
				// ReSharper disable once UnusedLocals
				const chromeDocumentTitleManager =
					new chromeDocumentTitleModule.ChromeDocumentTitleManager(
						frameId == null ? -1 : frameId,
						documentTitle);
			}
		} catch (e) {
			getLogger().info("DocumentTitleManager window.top.document.title failed!");
			// Cannot get top window title, use workaround per browser.
			if (isInternetExplorer) {
				// ReSharper disable once CommonJsExternalModule
				// tslint:disable-next-line no-require-imports
				this.getDocumentTitle = require("./ieDocumentTitle").getDocumentTitle;
				getLogger().info("DocumentTitleManager using ieDocumentTitle");
			} else {
				getLogger().info("DocumentTitleManager window.top.document.title failed!");
				// ReSharper disable once CommonJsExternalModule
				// tslint:disable-next-line no-require-imports
				const chromeDocumentTitleModule = require("./ChromeDocumentTitleManager");
				const chromeDocumentTitleManager =
					new chromeDocumentTitleModule.ChromeDocumentTitleManager(
						frameId == null ? -1 : frameId,
						documentTitle);
				this.getDocumentTitle = () => chromeDocumentTitleManager.getDocumentTitle();
				getLogger().info("DocumentTitleManager using ChromeDocumentTitleManager. Got title: ", this.getDocumentTitle());
			}
		}
	}
}
