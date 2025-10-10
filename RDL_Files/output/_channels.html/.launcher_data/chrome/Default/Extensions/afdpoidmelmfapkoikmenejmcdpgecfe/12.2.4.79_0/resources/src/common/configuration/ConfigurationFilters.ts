"use strict";

import { CanbeLazy } from "../../utils/lazy";
import { RegExpMatcher } from "../../utils/RegExpMatcher";

interface RegexPropertyFilters {
	property: RegExp;
	matcher: RegExpMatcher;
}

/**
 * Match property name by regular expression.
 * Use with caution !
 */
const REGEX_PROPERTY = /(.*)~$/;

export class ConfigurationFilters {
	private readonly propertyFilters: { [propertyName: string]: RegExpMatcher; } = {};

	// tslint:disable-next-line readonly-array
	private readonly regexPopertyFilters: RegexPropertyFilters[] = [];

	// tslint:disable-next-line readonly-array
	public getExactPropertyNames(): string[] {
		return Object.getOwnPropertyNames(this.propertyFilters);
	}

	public hasRegexPropertyNames(): boolean {
		return this.regexPopertyFilters.length > 0;
	}

	public addFilter(propertyName: string, pattern: string, isExact: boolean): void {
		// Special case for regular expression property name
		const regexProperty = propertyName.match(REGEX_PROPERTY);
		if (regexProperty != null) {
			this.addRegexPropertyFilter(regexProperty[1], pattern, isExact);
		} else {
			if (this.propertyFilters[propertyName] == null) {
				this.propertyFilters[propertyName] = new RegExpMatcher();
			}
			this.propertyFilters[propertyName].addMatcher(pattern, isExact);
		}
	}

	private addRegexPropertyFilter(property: string, pattern: string, isExact: boolean): void {
		try {
			const re = new RegExp(property);

			let filter: RegexPropertyFilters | undefined;

			// Add to existing
			for (const propertyFilter of this.regexPopertyFilters) {
				if (propertyFilter.property.toString() === re.toString()) {
					filter = propertyFilter;
				}
			}

			// Or create a new one
			// ReSharper disable once ConditionIsAlwaysConst
			// ReSharper disable once HeuristicallyUnreachableCode
			if (filter == null) {
				filter = {
					property: re,
					matcher: new RegExpMatcher()
				};

				this.regexPopertyFilters.push(filter);
			}

			// Add matcher
			// ReSharper disable once TsResolvedFromInaccessibleModule
			filter.matcher.addMatcher(pattern, isExact);
		} catch (e) {
			// Regular expression is not valid, skip it.
			return;
		}
	}

	public hasFilter(propertyName: string): boolean {
		return propertyName in this.propertyFilters ||
			this.regexPopertyFilters.some(f => f.property.test(propertyName));
	}

	/**
	 * First checking exact ones and then the regular expression.
	 */
	public isMatch(propertyName: string, input: CanbeLazy<string>): boolean {
		const filters = this.propertyFilters[propertyName];
		if (filters != null && filters.isMatch(input)) {
			return true;
		} else {
			return this.regexPopertyFilters.some(
				f => f.property.test(propertyName) && f.matcher.isMatch(input));
		}
	}
}
