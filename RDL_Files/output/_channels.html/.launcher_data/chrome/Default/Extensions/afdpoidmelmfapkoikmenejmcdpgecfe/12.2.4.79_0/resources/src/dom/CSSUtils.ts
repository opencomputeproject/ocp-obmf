const element = document.createElement("div");

/**
 * @return true if selector is valid native selector.
 */
export function isValidNativeSelector(cssSelector: string): boolean {
	try {
		element.querySelector(cssSelector);
		return true; // If the above line did not throw then the selector is legal
	} catch (e) {
		return false;
	}
}

/**
 * @param selector CSS Selector.
 * @return Selector that matches the any ancestor element with the given selector.
 */
export function makeSelectorWithAnyDescendant(selector: string): string {
	return `${selector} *`;
}
