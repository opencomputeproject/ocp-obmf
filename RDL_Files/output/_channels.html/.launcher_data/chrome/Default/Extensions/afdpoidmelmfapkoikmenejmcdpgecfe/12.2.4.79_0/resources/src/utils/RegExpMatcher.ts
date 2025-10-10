"use strict";

import { getLogger } from "./log";
import * as Utils from "./utils";
import { Lazy, CanbeLazy } from "./lazy";

// .NET style for case insensitive option
const DOTNET_CASE_INSENSITIVE = /^(\^?)\(\?i\)(\^?)(.*)/;

function isValidRegex(pattern: string): boolean {
	try {
		// ReSharper disable once WrongExpressionStatement
		/* tslint:disable-next-line no-unused-expression*/
		new RegExp(pattern);
		return true;
	} catch (e) {
		getLogger().error("Invalid regular expression", pattern);
		return false;
	}
}

/**
 * A special class for optimized regular expression matching.
 */
export class RegExpMatcher {
	/** Case sensitive pattern. */
	private multiPattern?: string;
	/** Case sensitive regular expression. */
	private regexMatcher?: RegExp;

	/** Case insensitive pattern. */
	private imultiPattern?: string;
	/** Case insensitive regular expression.  */
	private iregexMatcher?: RegExp;

	/**
	 * @param pattern Pattern to match.
	 * @param isExact Whether to use exact match or equality
	 * @param caseInsensitive Force case insensitive pattern. Valid only if isExact is false.
	 */
	public addMatcher(pattern: string, isExact: boolean, caseInsensitive: boolean = false): void {
		if (isExact) {
			this.multiPattern =
				RegExpMatcher.addMultiPattern(this.multiPattern, `^${Utils.escapeRegExp(pattern)}$`);
		} else {
			// Handle case insensitive option
			const groups = pattern.match(DOTNET_CASE_INSENSITIVE);
			const icase = groups != null ? (groups[1] !== "" ? groups[1] : groups[2]) : "";
			const matchPattern = groups != null ? (icase + groups[3]) : pattern;

			// Test regular expression
			if (!isValidRegex(matchPattern)) return;

			if (groups != null || caseInsensitive) {
				// Store previous value
				const previMultiPattern = this.imultiPattern;
				// Get new pattern
				const newIMultiPattern = RegExpMatcher.addMultiPattern(this.imultiPattern, matchPattern);

				// If regex is not valid, restore previous value
				if (isValidRegex(newIMultiPattern)) {
					// Update pattern and clear cache
					this.imultiPattern = newIMultiPattern;
					this.iregexMatcher = undefined;
				} else {
					this.imultiPattern = previMultiPattern;
					return;
				}
			} else {
				// Store previous value
				const prevMultiPattern = this.multiPattern;
				// Get new pattern
				const newMultiPattern = RegExpMatcher.addMultiPattern(this.multiPattern, matchPattern);

				// If regex is not valid, restore previous value
				if (isValidRegex(newMultiPattern)) {
					// Update pattern and clear cache
					this.multiPattern = newMultiPattern;
					this.regexMatcher = undefined;
				} else {
					this.multiPattern = prevMultiPattern;
					return;
				}
			}
		}
	}

	private static addMultiPattern(multiPattern: string | undefined, matchPattern: string): string {
		return (multiPattern == null ? "" : multiPattern + "|") + matchPattern;
	}

	public isMatch(input: CanbeLazy<string>): boolean {
		if (this.multiPattern != null) {
			if (this.regexMatcher == null) {
				this.regexMatcher = new RegExp(this.multiPattern);
			}

			if (this.regexMatcher.test(Lazy.extract(input))) {
				return true;
			}
		}

		if (this.imultiPattern != null) {
			if (this.iregexMatcher == null) {
				this.iregexMatcher = new RegExp(this.imultiPattern, "i");
			}
			if (this.iregexMatcher.test(Lazy.extract(input))) {
				return true;
			}
		}

		return false;
	}

	public hasMatcher(): boolean {
		return this.multiPattern != null || this.imultiPattern != null;
	}
}
