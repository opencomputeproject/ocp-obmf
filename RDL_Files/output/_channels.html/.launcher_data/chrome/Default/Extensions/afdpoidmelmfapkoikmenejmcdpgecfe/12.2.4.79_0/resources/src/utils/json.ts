/**
 * @file Workaround for broken JSON object when Prototype.js 1.6.0 is loaded.
 */

import { Lazy } from "./lazy";

// tslint:disable-next-line no-require-imports
declare function require(module: "json3"): JSON;

// ReSharper disable once InconsistentNaming
// tslint:disable-next-line no-require-imports
export const lazyJSON3 = new Lazy(() => require("json3"));

interface ToJSON {
	toJSON?(): string;
}

/**
 * @return true when Prototype.js is loaded and breaks JSON object.
 */
function isJSONBroken(): boolean {
	return (Object.prototype as ToJSON).toJSON != null ||
		(Array.prototype as ToJSON).toJSON != null;
}

/**
 * Set when JSON3 is used instead of built-it JSON object.
 */
let usingJSON3: boolean;

// Do not use JSON object directly, to no be replaced while compiling
interface WithJSON {
	// ReSharper disable once InconsistentNaming
	JSON?: JSON;
}

// tslint:disable-next-line no-non-null-assertion no-unbound-method
let jsonStringify = (window as WithJSON).JSON!.stringify;
// tslint:disable-next-line no-non-null-assertion no-unbound-method
let jsonParse = (window as WithJSON).JSON!.parse;

/**
 * Validate JSON object is not broken.
 */
function checkJSON(): void {
	// If JSON is broken, replace it with JSON3 implementation
	if (!usingJSON3 && isJSONBroken()) {
		const json3 = lazyJSON3.getValue();

		usingJSON3 = true;
		jsonStringify = json3.stringify;
		jsonParse = json3.parse;
	}
}

export function stringify(value: unknown, replacer?: (key: string, value: unknown) => unknown, space?: string | number): string {
	checkJSON();
	return jsonStringify(value, replacer, space);
}

export function parse(text: string, reviver?: (key: unknown, value: unknown) => unknown): unknown {
	checkJSON();
	return jsonParse(text, reviver) as unknown;
}
