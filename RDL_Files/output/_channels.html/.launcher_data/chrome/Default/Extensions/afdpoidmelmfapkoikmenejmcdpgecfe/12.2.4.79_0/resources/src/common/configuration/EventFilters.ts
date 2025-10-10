"use strict";

import { CanbeLazy } from "../../utils/lazy";
import { ConfigurationFilters } from "./ConfigurationFilters";

export class EventFilters {
	private readonly eventFilters: { [eventName: string]: ConfigurationFilters; } = {};

	// tslint:disable-next-line readonly-array
	public getEventNames(): string[] {
		return Object.getOwnPropertyNames(this.eventFilters);
	}

	public getEventFilters(eventName: string): ConfigurationFilters {
		return this.eventFilters[eventName];
	}

	public addFilter(eventName: string, propertyName: string, pattern: string, isExact: boolean): void {
		if (this.eventFilters[eventName] == null) {
			this.eventFilters[eventName] = new ConfigurationFilters();
		}

		this.eventFilters[eventName].addFilter(propertyName, pattern, isExact);
	}

	public hasFilter(eventName: string): boolean {
		return eventName in this.eventFilters;
	}

	public isMatch(eventName: string, propertyName: string, input: CanbeLazy<string>): boolean {
		const filters = this.eventFilters[eventName];
		return filters != null && filters.isMatch(propertyName, input);
	}
}
