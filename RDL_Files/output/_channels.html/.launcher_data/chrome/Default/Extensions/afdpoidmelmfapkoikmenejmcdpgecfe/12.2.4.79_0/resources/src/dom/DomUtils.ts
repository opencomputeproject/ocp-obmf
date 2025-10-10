// tslint:disable-next-line no-reference
/// <reference path="../types/iedom.d.ts"/>

"use strict";

import { lazyJQuery } from "./jquery";

/**
 * Check whether window.load event was fired.
 * document.readyState must be set to "complete" and all performance timing values are set.
 *
 * @return true if window.load event is fired, false otherwise.
 */
export function isWindowLoaded(): boolean {
	return document.readyState === "complete" &&
		window.performance.timing.fetchStart !== 0 &&
		window.performance.timing.connectStart !== 0 &&
		window.performance.timing.connectEnd !== 0 &&
		window.performance.timing.domainLookupStart !== 0 &&
		window.performance.timing.domainLookupEnd !== 0 &&
		window.performance.timing.loadEventStart !== 0 &&
		window.performance.timing.loadEventEnd !== 0;
}

/**
 * Calls addEventListener or attachEvent depending on browser feature
 */
export function subscribeEventListener(
	obj: EventTarget,
	type: string,
	listener: EventListener,
	useCapture?: boolean): void {

	if (obj.addEventListener != null) {
		obj.addEventListener(type, listener, useCapture);
	} else {
		// ReSharper disable once InconsistentNaming
		obj.attachEvent(`on${type}`, e => {
			// Imitate target property if doesn't exist
			if (e.target == null) {
				(e as { target: EventTarget | null; }).target = e.srcElement;
			}
			listener(e);
		});
	}
}

/**
 * Calls removeEventListener or detachEvent depending on browser feature
 */
export function unsubscribeEventListener(
	obj: EventTarget,
	type: string,
	listener: EventListener,
	useCapture?: boolean): void {

	if (obj.removeEventListener != null) {
		obj.removeEventListener(type, listener, useCapture);
	} else {
		obj.detachEvent(`on${type}`, listener);
	}
}

/**
 * Call function when event in the object fired.
 *
 * @param listener function to call when event is fired.
 */
export function doWhen(obj: EventTarget, type: string, listener: EventListener, useCapture?: boolean): void {
	const handler: EventListener = ev => {
		unsubscribeEventListener(obj, type, handler, useCapture);
		listener(ev);
	};

	subscribeEventListener(obj, type, handler, useCapture);
}

/**
 * Call function after event in the object fired.
 *
 * @param listener function to call after event is fired.
 */
export function doAfter(obj: EventTarget, type: string, listener: EventListener, useCapture?: boolean): void {
	doWhen(obj, type, () => window.setTimeout(listener, 0), useCapture);
}

/**
 * Call function after window load event is fired.
 *
 * @param listener function to call after window load event is fired.
 */
export function doAfterWindowLoad(listener: EventListener): void {
	// Check if window load event is fired.
	if (isWindowLoaded()) {
		setTimeout(listener, 0);
	} else {
		doAfter(window, "load", listener);
	}
}

/**
 * Optimized version of JQuery's $(node).is(":visible").
 */
export function isElementVisible(elem: Readonly<HTMLElement>): boolean {
	return !!(elem.offsetWidth !== 0 || elem.offsetHeight !== 0 || elem.getClientRects().length !== 0);
}

/**
 * Calls callback when DOM is ready.
 *
 * The code is based on jQuery v1.12.4
 * @see https://code.jquery.com/jquery-1.12.4.js
 * @see http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
 */
export function doAfterDomReady(callback: () => void): void {
	let ready = false;

	function detach(): void {
		if (document.addEventListener != null) {
			document.removeEventListener("DOMContentLoaded", completed);
			window.removeEventListener("load", completed);

		} else {
			document.detachEvent("onreadystatechange", completed);
			window.detachEvent("onload", completed);
		}
	}

	function completed(): void {
		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if (!ready && (
			// tslint:disable-next-line no-unbound-method
			document.addEventListener != null ||
			(window.event != null && window.event.type === "load") ||
			document.readyState === "complete")) {

			ready = true;

			detach();
			callback();
		}
	}

	// Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE6-10
	// Older IE sometimes signals "interactive" too soon
	if (document.readyState === "complete" ||
		// tslint:disable-next-line no-unbound-method
		(document.readyState !== "loading" && document.documentElement.doScroll != null)) {

		// Handle it asynchronously to allow scripts the opportunity to delay ready
		window.setTimeout(callback);

	// Standards-based browsers support DOMContentLoaded
	// tslint:disable-next-line no-unbound-method
	} else if (document.addEventListener != null) {

		// Use the handy event callback
		document.addEventListener("DOMContentLoaded", completed);

		// A fallback to window.onload, that will always work
		window.addEventListener("load", completed);

		// If IE event model is used
	} else {

		// Ensure firing before onload, maybe late but safe also for iframes
		document.attachEvent("onreadystatechange", completed);

		// A fallback to window.onload, that will always work
		window.attachEvent("onload", completed);

		// If IE and not a frame
		// continually check to see if the document is ready
		let top: HTMLElement | undefined;

		try {
			if (window.frameElement == null && document.documentElement != null) {
				top = document.documentElement;
			}
		} catch (e) { }

		// ReSharper disable once UsageOfPossiblyUnassignedValue
		if (top != null && top.doScroll != null) {
			(function doScrollCheck(): void {
				if (!ready) {

					try {
						// Use the trick by Diego Perini
						// http://javascript.nwbox.com/IEContentLoaded/
						top.doScroll("left");
					} catch (e) {
						window.setTimeout(doScrollCheck, 50);
						return;
					}

					ready = true;

					// detach all dom ready events
					detach();
					callback();
				}
			})();
		}
	}
}

/**
 * Polyfill Element.prototype.matches using jQuery
 */
class ElementWithMatchesPolyfill extends Element {
	public matches(selector: string): boolean {
		return lazyJQuery.getValue()(this).closest(selector).length > 0;
	}
}

interface ElementPrototype {
	msMatchesSelector?: typeof Element.prototype.matches;
	matchesSelector?: typeof Element.prototype.matches;
	mozMatchesSelector?: typeof Element.prototype.matches;
	oMatchesSelector?: typeof Element.prototype.matches;
	webkitMatchesSelector?: typeof Element.prototype.matches;
}

/**
 * Element.prototype.matches using the working one.
 */
// tslint:disable no-unbound-method no-non-null-assertion
const elementMatchesImpl =
	Element.prototype.matches != null
		? Element.prototype.matches
		: (Element.prototype as ElementPrototype).msMatchesSelector != null
		? (Element.prototype as ElementPrototype).msMatchesSelector!
		: (Element.prototype as ElementPrototype).matchesSelector != null
		? (Element.prototype as ElementPrototype).matchesSelector!
		: (Element.prototype as ElementPrototype).mozMatchesSelector != null
		? (Element.prototype as ElementPrototype).mozMatchesSelector!
		: (Element.prototype as ElementPrototype).oMatchesSelector != null
		? (Element.prototype as ElementPrototype).oMatchesSelector!
		: (Element.prototype as ElementPrototype).webkitMatchesSelector != null
		? (Element.prototype as ElementPrototype).webkitMatchesSelector!
		: ElementWithMatchesPolyfill.prototype.matches;
// tslint:disable no-unbound-method no-non-null-assertion

/**
 * Element.prototype.matches wrapper
 */
export function elementMatches(element: Element, selector: string): boolean {
	// tslint:disable-next-line no-unsafe-any
	return (elementMatchesImpl.call as (element: Element, selector: string) => boolean)(element, selector);
}

/**
 * @see Element.prototype.ELEMENT_NODE
 */
const ELEMENT_NODE = 1;

/**
 * Checks whether given object is type of Element
 * Supports IE5
 */
export function isElement(obj: EventTarget | null | undefined): obj is Element {
	if (obj == null) return false;

	return typeof Element !== "undefined"
		? obj instanceof Element
		: (obj as Partial<Element>).nodeType === ELEMENT_NODE;
}


/**
 * IE quirks mode document.getElementById
 *
 * @param id Identifier
 * @param idCSS Identifier in CSS selector format
 * @returns Element if present with this id or null if element is not found.
 */
function getElementByIdFromDocumentIEQuirks(id: string, idCSS: string): HTMLElement | null {
	// Use workaround for older modes
	const element = document.getElementById(id);
	if (element == null) return null;

	// Validate element's id is the requested id
	// https://msdn.microsoft.com/en-us/ie/ms536437(v=vs.94)
	if (element.id === id) return element;

	// If id is not the same, use jQuery
	// Convert ID to CSS selector format
	const idElements = lazyJQuery.getValue()(idCSS);
	return idElements.length > 0 ? idElements[0] : null;
}

/**
 * Choose working implementation of document.getElementById
 */
export const getElementByIdFromDocument =
	document.documentMode == null || document.documentMode >= 8
		// tslint:disable-next-line no-unbound-method
		? (id: string) => document.getElementById(id)
		: getElementByIdFromDocumentIEQuirks;
