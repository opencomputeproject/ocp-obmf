"use strict";

import { getLogger } from "../utils/log";

/**
 * Tab title implementation for Internet Explorer
 */
function ieDocumentTitle(): string {
	const documentTitle = __AternityGetDocumentTitle__$$(window.top);
	return documentTitle != null ? documentTitle : document.title;
}

const documentTitleGetter = (() => {
	if (typeof __AternityGetDocumentTitle__$$ === "undefined" || __AternityGetDocumentTitle__$$ == null) {
		getLogger().error(
			"__AternityGetDocumentTitle__$$ is not defined, documentTitle is not fully correct. Using document.title property");
		return () => "";
	} else {
		return ieDocumentTitle;
	}
})();

export function getDocumentTitle(): string {
	return documentTitleGetter();
}
