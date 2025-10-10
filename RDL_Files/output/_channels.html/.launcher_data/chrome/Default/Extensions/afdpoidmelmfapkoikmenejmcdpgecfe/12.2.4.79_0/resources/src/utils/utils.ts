export type Primitive = string | number | boolean;

export function isSerializablePrimitive(value: unknown): value is Primitive {
	if (typeof value === "number" && isNaN(value)) {
		return false;
	}

	return typeof value === "string" ||
		typeof value === "boolean" ||
		typeof value === "number";
}

const HTTP_STATUS_CODE_REGEX = /HTTP\/\d\.\d (\d+)/;

export interface IStatusCodeDetails {
	readonly statusLine: string;
	readonly statusCode?: number;
}

/**
 * First try to get the status code from the details (available since Chrome 43),
 * if it isn't there try to parse it from the status line
 * According to RFC 2616:
 * Status-Line = HTTP-Version SP Status-Code SP Reason-Phrase CRLF
 *
 * @return Status code or null if the statusLine is invalid.
 */
export function getStatusCode(details: IStatusCodeDetails): number | null {
	if (details.statusCode != null) {
		return details.statusCode;
	}
	const statusCode = details.statusLine.match(HTTP_STATUS_CODE_REGEX);
	return statusCode !== null ? parseInt(statusCode[1], 10) : null;
}

export function startsWith(str: string, prefix: string): boolean {
	return str.substring(0, prefix.length) === prefix;
}

export function endsWith(str: string, suffix: string): boolean {
	return str.substring(str.length - suffix.length) === suffix;
}

export function capitalize(s: string): string {
	return s[0].toUpperCase() + s.slice(1);
}

function getSubstring(str: string, start: string, end: string): string {
	// Find start
	const startIndex = str.indexOf(start);
	if (startIndex === -1) {
		return "";
	}

	// Skip the hash if present
	const endIndex = str.indexOf(end);
	// Skip empty query
	if (endIndex === startIndex + 1) {
		return "";
	}

	// Return substring
	return str.substring(startIndex + 1, endIndex !== -1 ? endIndex : str.length);
}

/**
 * Generic interface for Key-Value object.
 */
export interface KeyValue<T> {
	[key: string]: T;
}

// tslint:disable-next-line readonly-array
export interface UrlParams extends KeyValue<string[]> {
}

/**
 * Parse url and extract query string.
 * The query string is parsed into key to value array.
 * Multiple values are supported.
 */
export function getUrlParams(url: string): UrlParams {
	const ret: UrlParams = {};

	// Get query string
	const query = getSubstring(url, "?", "#");
	if (query.length === 0) {
		return ret;
	}

	// Parse the query string
	const params = query.split("&");
	// No values, use the query as parameter name.
	if (params.length === 0) {
		pushOrInit(ret, query, "");
		return ret;
	}

	for (const param of params) {
		const nameIndex = param.indexOf("=");
		if (nameIndex === -1) {
			pushOrInit(ret, param, "");
			continue;
		}

		try {
			const name = decodeURI(param.substring(0, nameIndex));
			const value = decodeURI(param.substring(nameIndex + 1));
			pushOrInit(ret, name, value);
		} catch (e) {
			// Do not add invalid URI params
		}
	}

	return ret;
}

/**
 * Pushes value to array property if key exists or create a new array.
 */
export function pushOrInit<T>(keyValueObj: KeyValue<T[]>, key: string, value: T): void {
	if (key in keyValueObj) {
		keyValueObj[key].push(value);
	} else {
		keyValueObj[key] = [value];
	}
}

/**
 * Concatenate value to array property if key exists or assign the values.
 */
export function concatOrInit<T>(
	// tslint:disable-next-line readonly-array
	keyValueObj: { [prop: string]: T[] | undefined }, key: string, values: T[]): void {

	if (key in keyValueObj) {
		const currentValues = keyValueObj[key];
		if (currentValues != null) {
			keyValueObj[key] = currentValues.concat(values);
			return;
		}
	}

	keyValueObj[key] = values;
}

/**
 * Set properties values from source into destination.
 * Makes a shallow copy of the first level properties.
 */
export function populate(source: {readonly [prop: string]: unknown}, destination: {[prop: string]: unknown}): void {
	for (const prop in source) {
		if (source.hasOwnProperty(prop)) {
			destination[prop] = source[prop];
		}
	}
}

/**
 * @return A deep copy of the object.
 * Supports deep copy of inner arrays and objects.
 */
// tslint:disable readonly-array no-any no-unsafe-any
export function deepClone(obj: never): never;
export function deepClone(obj: null): null;
export function deepClone(obj: undefined): undefined;
export function deepClone(obj: number): number;
export function deepClone(obj: string): string;
export function deepClone(obj: boolean): boolean;
export function deepClone<T>(obj: ReadonlyArray<T>): T[];
export function deepClone<T>(obj: Readonly<T>): T;
export function deepClone<T>(obj: any): any;
export function deepClone<T>(obj: never | null | undefined | number | string | boolean | Readonly<T> | ReadonlyArray<T> | any):
	never | null | undefined | number | string | boolean | T | T[] | any {

	if (obj == null) {
		return obj;
	}
	if (typeof obj === "number" || typeof obj === "boolean" || typeof obj === "string") {
		return obj;
	}

	// Array is a special case
	if (Array.isArray(obj)) {
		const retArray = new Array<T>(obj.length);
		for (let i = 0; i < obj.length; i++) {
			retArray[i] = deepClone(obj[i]);
		}
		return retArray;
	}

	// Make sure the returned object has the same prototype as the original
	let proto = Object.getPrototypeOf != null
		? Object.getPrototypeOf(obj)
		: obj.__proto__;

	if (!proto) {
		// This line would probably only be reached by very old browsers
		proto = (obj as { constructor: { prototype: unknown; } }).constructor.prototype;
	}

	const ret = Object.create(proto);

	for (const prop in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue;
		// tslint:disable-next-line no-any no-unsafe-any
		ret[prop] = deepClone(obj[prop]);
	}

	return ret;
}
// tslint:enable readonly-array no-any no-unsafe-any

/**
 * Rewrites the object using given callback.
 * @param obj Object to rewrite
 * @param f Transformation function
 * @param leaveUndefined When set to 'true' it allows to set undefined value
 *  in case it is returned by the callback.
 * When set to 'false' the property is removed from the object
 *  when undefined value is returned from the callback.
 */
export function rewriteObject(
	// tslint:disable-next-line no-any
	obj: { [id: string]: any },
	// tslint:disable-next-line no-any
	convert: (name: string, value: any) => any,
	leaveUndefined: boolean = true): void {

	if (obj == null) {
		return;
	}

	for (const property in obj) {
		if (!obj.hasOwnProperty(property)) continue;
		const value = convert(property, obj[property]);

		// Special case for undefined
		if (typeof value === "undefined" && !leaveUndefined) {
			delete obj[property];
		} else {
			obj[property] = value;
		}
	}
}

/**
 * Allows access to nested properties of an object using a string key path.
 *
 * @param obj The object to access.
 * @param path The nested path to access separated by dots (e.g. "attributes.id"). If path is ""
 * then the original object is returned.
 */
// tslint:disable-next-line no-any
export function pick(obj: { [prop: string]: any; }, path: string): any {
	if (path === "") {
		return obj;
	}

	let ret = obj;

	const keys = path.split(".");
	for (let i = 0; i < keys.length && typeof ret !== "undefined"; i++) {
		/* tslint:disable-next-line no-unsafe-any */
		ret = ret[keys[i]];
	}

	return ret;
}

/**
 * Makes a string which calls function with given arguments.
 */
// tslint:disable max-line-length no-any
export function makeFunctionCall<R>(f: () => R): string;
export function makeFunctionCall<P0, R>(f: (p0: P0) => R, args: [P0]): string;
export function makeFunctionCall<P0, P1, R>(f: (p0: P0, p1: P1) => R, args: [P0, P1]): string;
export function makeFunctionCall<P0, P1, P2, R>(f: (p0: P0, p1: P1, p2: P2) => R, args: [P0, P1, P2]): string;
export function makeFunctionCall<P0, P1, P2, P3, R>(f: (p0: P0, p1: P1, p2: P2, p3: P3) => R, args: [P0, P1, P2, P3]): string;
export function makeFunctionCall<P0, P1, P2, P3, P4, R>(f: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4) => R, args: [P0, P1, P2, P3, P4]): string;
export function makeFunctionCall<P0, P1, P2, P3, P4, P5, R>(f: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R, args: [P0, P1, P2, P3, P4, P5]): string;
export function makeFunctionCall(f: Function, args?: ReadonlyArray<any>): string {
// tslint:enable max-line-length no-any

	const argsString: string[] = [];
	if (args != null) {
		for (const v of args) {
			// tslint:disable-next-line no-unsafe-any
			argsString.push((typeof v === "string") ? `"${v}"` : v);
		}
	}

	return `(${f})(${argsString})`;
}

/**
 * Tests whether a given value is one of a list of values.
 * @param value The value to test
 * @param values The possible values
 */
export function isValueOneOf<T>(value: T, values: Array<T>): boolean;
export function isValueOneOf<T>(value: T, values: ReadonlyArray<T>): boolean;
export function isValueOneOf<T>(value: T, values: Array<T> | ReadonlyArray<T>): boolean {
	return values.indexOf(value) !== -1;
}

const SUPPORTS_FREEZE = Object.freeze != null && Object.isFrozen != null && Object.getOwnPropertyNames != null;

/**
 * Recursively calls Object.freeze for each property and returns this object.
 *
 * Based on deep-freeze fork with fixes for PhantomJS
 */
export function deepFreeze<T>(obj: ReadonlyArray<T>): ReadonlyArray<T>;
export function deepFreeze<T>(obj: Readonly<T>): Readonly<T>;
export function deepFreeze<T>(obj: Readonly<T> | ReadonlyArray<T>): Readonly<T> | ReadonlyArray<T> {
	if (!SUPPORTS_FREEZE) {
		return obj;
	}

	// As of Jan 2018 gmail overwrites Object.Freeze, causing it to add an object property.
	// The workaround is to grab the property list before freezing the object.
	const originalProps = Object.getOwnPropertyNames(obj);

	const objIsFunction = typeof obj === "function";

	Object.freeze(obj);

	for (const prop of originalProps) {
		// Do not freeze special function properties.
		// PhantomJS doesn't like it.
		if (objIsFunction && (prop === "caller" || prop === "callee" || prop === "arguments")) {
			continue;
		}

		// Skip null
		// tslint:disable-next-line no-any
		if ((obj as any)[prop] === null) {
			continue;
		}

		// Recursively freeze only objects or functions
		// tslint:disable-next-line no-any
		if (typeof (obj as any)[prop] !== "object" && typeof (obj as any)[prop] !== "function") {
			continue;
		}

		// Do not freeze if frozen
		// tslint:disable-next-line no-any
		if (Object.isFrozen((obj as any)[prop])) {
			continue;
		}

		// Freeze recursively.
		// tslint:disable-next-line no-any no-unsafe-any
		deepFreeze((obj as any)[prop]);
	}

	return obj;
}

// tslint:disable readonly-array
export function asReadonly<T>(obj: T[]): ReadonlyArray<T>;
export function asReadonly<T>(obj: T): Readonly<T>;
export function asReadonly<T>(obj: T | T[]): Readonly<T> | ReadonlyArray<T> {
	return obj;
}
// tslint:enable readonly-array

/**
 * Add value to array only if it doesn't present in array.
 */
// tslint:disable-next-line readonly-array
export function addUnique<T>(array: T[], value: T): void {
	for (const elem of array) {
		if (elem === value) {
			return;
		}
	}

	array.push(value);
}

const REGEX_ESCAPED_CHARACTERS = /([\\^$.*+?()[\]{}|])/g; // Take the special characters
const REGEX_UNESCAPED_CHARACTERS = /\\([\\^$.*+?()[\]{}|])/g; // Take the special that are preceeded by \

export function escapeRegExp(unescaped: string): string {
	// Implementation copied from lodash implementation for escapeRegExp
	return (unescaped !== "" && REGEX_ESCAPED_CHARACTERS.test(unescaped))
		? unescaped.replace(REGEX_ESCAPED_CHARACTERS, "\\$&")
		: unescaped;
}

/**
 * Unescape string into regex format
 */
export function unescapeRegExp(escaped: string): string {
	// Implementation ammended from lodash implementation for escapeRegExp
	return (escaped !== "" && REGEX_UNESCAPED_CHARACTERS.test(escaped))
		? escaped.replace(REGEX_UNESCAPED_CHARACTERS, "$1")
		: escaped;
}

const DATA_REGEX = /^data\:/;

/**
 * @returns {string} Whether given URL is data URL.
 */
export function isDataUrl(url: string): boolean {
	return DATA_REGEX.test(url);
}

export const isInternetExplorer =
	// Conditional compilation: https://docs.microsoft.com/en-us/scripting/javascript/reference/at-cc-on-statement-javascript
	/*@cc_on!@*/false; // || document.documentMode != null;

/**
 * Set property value if it doesn't present in the object.
 */
export function setIfNotExist<T, P extends keyof T>(data: T, property: P, value: T[P]): void {
	// tslint:disable-next-line no-unsafe-any
	if (!data.hasOwnProperty(property)) {
		data[property] = value;
	}
}

/**
 * Set property value using valueFactory if it doesn't present in the object.
 */
export function setIfNotExistFactory<T, P extends keyof T>(data: T, property: P, valueFactory: () => T[P]): void {
	// tslint:disable-next-line no-unsafe-any
	if (!data.hasOwnProperty(property)) {
		data[property] = valueFactory();
	}
}

/**
 * Search element in array.
 * @see Array.prototype.find
 */
export function find<T>(arr: ArrayLike<T>, condition: (element: T) => boolean): T | undefined {
	for (let i = 0, n = arr.length; i < n; ++i) {
		const element = arr[i];
		if (condition(element)) {
			return element;
		}
	}

	return undefined;
}

/**
 * Converts a binary string to a Uint8Array
 * @param str input binary string to convert to a Uint8Array
 */
export function binstring2Buf(str: string): Uint8Array {
	const buf = new Uint8Array(str.length);
	for (let i = 0, len = buf.length; i < len; i++) {
		buf[i] = str.charCodeAt(i);
	}
	return buf;
}