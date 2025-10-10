// TS 1.5 and above don't have IE-specific functions

interface EventTarget {
	attachEvent(type: string, listener: EventListener): boolean;
	detachEvent(type: string, listener: EventListener): void;
}

interface IEDocumentEventMap {
	"onreadystatechange": Event;
}

interface IEWindowEventMap {
	"onload": Event;
}

interface Document {
	attachEvent<K extends keyof IEDocumentEventMap>(type: K, listener: (this: Window, ev: IEDocumentEventMap[K]) => void): boolean;
	attachEvent(type: string, listener: EventListener): boolean;
	detachEvent<K extends keyof IEDocumentEventMap>(type: K, listener: (this: Window, ev: IEDocumentEventMap[K]) => void): void;
	detachEvent(type: string, listener: EventListener): void;
}

interface Window {
	attachEvent<K extends keyof IEWindowEventMap>(type: K, listener: (this: Window, ev: IEWindowEventMap[K]) => void): boolean;
	attachEvent(type: string, listener: EventListener): boolean;
	detachEvent<K extends keyof IEWindowEventMap>(type: K, listener: (this: Window, ev: IEWindowEventMap[K]) => void): void;
	detachEvent(type: string, listener: EventListener): void;
}

interface HTMLElement {
	doScroll(component: string): boolean;
}

interface Document {
	documentMode?: number;
}
