import { makeSelectorWithAnyDescendant } from "./CSSUtils";

/**
 * Simple CSS selector with data attached.
 */
export class CSSSelectorWithData<T> {
	/**
	 * Selector matching any descendant with the given selector in initialization.
	 */
	public readonly cssSelectorWithAnyDescendant: string;

	/**
	 * @param cssSelector CSS selector
	 * @param cssSelectorData Data attached to CSS selector
	 */
	constructor(
		public readonly cssSelector: string,
		public readonly cssSelectorData: T) {
		this.cssSelectorWithAnyDescendant = makeSelectorWithAnyDescendant(this.cssSelector);
	}
}

/**
 * Simple CSS selector with data attached.
 */
export class CSSNativeSelectorWithData<T> extends CSSSelectorWithData<T> {
	/**
	 * @param cssSelector CSS selector
	 * @param cssSelectorData Data attached to CSS selector
	 * @param nativeSelector Native selector for faster matches.
	 */
	constructor(
		public readonly cssSelector: string,
		public readonly cssSelectorData: T,
		public readonly nativeSelector: string) {
		super(cssSelector, cssSelectorData);
	}
}
