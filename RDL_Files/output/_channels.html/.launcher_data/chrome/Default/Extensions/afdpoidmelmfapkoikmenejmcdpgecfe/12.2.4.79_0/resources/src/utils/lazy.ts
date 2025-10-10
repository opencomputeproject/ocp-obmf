"use strict";

export type CanbeLazy<T> = T | Lazy<T>;

// Hack to imitate getters which don't exist in old IE
type MutableLazy = { hasValue: boolean; };

export class Lazy<T> {
	private readonly generator?: () => T;
	private value?: T;
	public readonly hasValue: boolean;

	constructor(generatorOrValue: (() => T) | T) {
		if (typeof generatorOrValue === "function") {
			this.generator = generatorOrValue as (() => T);
			this.hasValue = false;
		} else {
			this.value = generatorOrValue;
			this.hasValue = true;
		}
	}

	public getValue(): T {
		// tslint:disable no-non-null-assertion
		if (!this.hasValue) {
			this.value = this.generator!();
			(this as MutableLazy).hasValue = true;
		}
		return this.value!;
		// tslint:enable no-non-null-assertion
	}

	public static from<U>(value: U): Lazy<U> {
		return new Lazy(value);
	}

	/**
	 * Extract value either from immediate or from lazy.
	 */
	public static extract<U>(canbeLazy: CanbeLazy<U>): U {
		if (canbeLazy instanceof Lazy) {
			// ReSharper disable once TsResolvedFromInaccessibleModule
			return canbeLazy.getValue();
		} else {
			return canbeLazy;
		}
	}
}
