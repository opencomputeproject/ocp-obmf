"use strict";

import { KeyCodes } from "./KeyCodes";
import { UXData } from "../common/UXData";
import { isKeyboardEvent } from "./KeyboardEvent";

interface SanitationRule {
	filter: (event: Event) => boolean;
	propertiestoRemove: ReadonlyArray<string>;
}

const CONTENT_PROPERTIES: ReadonlyArray<string> = [
	"target.nodeValue",
	"target.textContent",
	"target.innerHTML",
	"target.innerText",
	"target.outerHTML",
	"target.outerText",
	"target.value"
];

const INPUT_PROPERTIES: ReadonlyArray<keyof KeyboardEvent | "keyIdentifier"> = [
	"char",
	"charCode",
	"code",
	"key",
	"keyCode",
	"keyIdentifier",
	"which"
];

const MODIFIER_PROPERTIES: ReadonlyArray<keyof KeyboardEvent> = [
	"altKey",
	"ctrlKey",
	"metaKey",
	"shiftKey"
];

const DUPLICATE_ATTRIBUTES: ReadonlyArray<string> = [
	"target.attributes.id.value",
	"target.attributes.class.value"
];

const sanitationRules: ReadonlyArray<SanitationRule> = [
	// Remove duplicate attributes
	{
		filter: event => true,
		propertiestoRemove: DUPLICATE_ATTRIBUTES
	},
	// If dealing with input/editable element - remove anything which contains content
	{
		filter: event => {
			const element = (event.target as HTMLElement);
			return element.nodeName === "INPUT" || element.nodeName === "TEXTAREA" || element.isContentEditable;
		},
		propertiestoRemove: CONTENT_PROPERTIES
	},
	// If typing in input/editable element - we're only interested in the case of modified keys or ENTER
	// TODO: in fact we're also interested in non-printable keys, need to figure out how to detect them
	{
		filter: event => {
			if (!isKeyboardEvent(event)) {
				return false;
			}

			const element = (event.target as HTMLElement);

			const keyboardEvent = event;

			// We want Enter key
			if (keyboardEvent.keyCode === KeyCodes.Enter || keyboardEvent.which === KeyCodes.Enter) {
				return false;
			}

			return (element.nodeName === "INPUT" ||
				element.nodeName === "TEXTAREA" ||
				element.isContentEditable) &&
				MODIFIER_PROPERTIES.every(p => event[p] === false); // No modifiers
		},
		propertiestoRemove: INPUT_PROPERTIES
	}
];

export function sanitizeEventData(event: Event, data: UXData): void {
	for (const rule of sanitationRules) {
		if (rule.filter(event)) {
			for (const property of rule.propertiestoRemove) {
				delete data[property];
			}
		}
	}
}
