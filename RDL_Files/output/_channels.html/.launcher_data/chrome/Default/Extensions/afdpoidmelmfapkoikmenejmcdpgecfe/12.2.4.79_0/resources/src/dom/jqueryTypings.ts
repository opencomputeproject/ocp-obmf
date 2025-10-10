export type SizzleType = "ID" | "TAG" | "CLASS" | "ATTR" | "PSEUDO" | "CHILD";

export interface SizzleToken {
	matches: RegExpExecArray;
	type: SizzleType;
	value: string;
}

export interface SizzleStatic {
	/**
	 * @param selector CSS selector
	 * @returns {Array<Array<SizzleToken>>} Parsed CSS selectors.
	 * Nested array is returned for multiple rules selector with comma, e.g: "a,b,c"
	 */
	tokenize(cssSelector: string): ReadonlyArray<ReadonlyArray<SizzleToken>>;
}

declare global {
	/**
	 * Internal jQuery implementation
	 */
	interface JQueryStatic<TElement extends Node = HTMLElement> {
		find: SizzleStatic;
	}
}
