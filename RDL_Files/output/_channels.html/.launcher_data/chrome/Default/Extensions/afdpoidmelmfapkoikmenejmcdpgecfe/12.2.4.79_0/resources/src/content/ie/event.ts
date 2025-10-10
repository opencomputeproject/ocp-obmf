// "use strict";

// tslint:disable readonly-array
/*
export class ChromeEvent<T extends Function> implements chrome.events.Event<T> {
	private readonly listeners: T[] = [];

	public addListener(callback: T): void {
		if (callback === null) {
			throw new Error("Null argument 'callback'");
		}
		if (this.listeners.some(c => c === callback)) return; // No duplicates
		this.listeners.push(callback);
	}

	public removeListener(callback: T): void {
		const index = this.listeners.indexOf(callback);
		if (index === -1) return;
		this.listeners.splice(index, 1);
	}

	public hasListener(callback: T): boolean {
		return this.listeners.some(c => c === callback);
	}

	public hasListeners(): boolean {
		return this.listeners.length > 0;
	}

	public invoke(...args: unknown[]): void {
		for (const c of this.listeners) {
			c.call(this, ...args);
		}
	}

	public invokeAsync(...args: unknown[]): void {
		window.setTimeout(this.invoke.bind(this, ...args), 0);
	}

	public getRules(callback: (rules: chrome.events.Rule[]) => void): void;
	public getRules(ruleIdentifiers: string[], callback: (rules: chrome.events.Rule[]) => void): void;
	public getRules(callbackOrRuleIdentifiers: ((rules: chrome.events.Rule[]) => void) | string[],
		callback?: (rules: chrome.events.Rule[]) => void): void {
		throw new Error("not implemented");
	}

	public removeRules(ruleIdentifiers?: string[], callback?: () => void): void;
	public removeRules(callback?: () => void): void;
	public removeRules(ruleIdentifiersOrCallback?: string[] | (() => void), callback?: () => void): void {
		throw new Error("not implemented");
	}

	public addRules(rules: chrome.events.Rule[], callback?: (rules: chrome.events.Rule[]) => void): void {
		throw new Error("not implemented");
	}
}
*/