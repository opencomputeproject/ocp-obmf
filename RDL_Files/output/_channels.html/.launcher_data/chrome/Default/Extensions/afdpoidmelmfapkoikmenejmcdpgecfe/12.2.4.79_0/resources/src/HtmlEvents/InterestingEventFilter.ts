"use strict";

import { KeyCodes } from "./KeyCodes";
import * as Utils from "../utils/utils";
import { isKeyboardEvent } from "./KeyboardEvent";

const FILTERS: ReadonlyArray<(event: Event) => boolean> = [
	notModifierOnly,
	isOnInputAndNonPrintable
];

export function isInteresting(event: Event): boolean {
	return FILTERS.every(f => f(event));
}

/*
 * Gets the key code from one of the deprecated properties 'keyCode' or 'which'.
*/
function getKeyCode(keyboadEvent: KeyboardEvent): number | null {
	if (typeof keyboadEvent.keyCode !== "undefined") {
		return keyboadEvent.keyCode;
	}
	if (typeof keyboadEvent.which !== "undefined") {
		return keyboadEvent.which;
	}
	return null;
}

/**
 * @param event KeyboardEvent
 * @return true if event either:
 * 1. Not KeyboardEvent
 * 2. Key press without any modifier
 * 3. Modifiers with any key
 */
function notModifierOnly(event: Event): boolean {
	if (!isKeyboardEvent(event)) {
		return true;
	}

	const keyboardEvent = event;
	const code = getKeyCode(keyboardEvent);

	// Cast number to KeyCodes
	const shift = keyboardEvent.shiftKey &&
		Utils.isValueOneOf(code,
			[KeyCodes.ShiftKey, KeyCodes.LShiftKey, KeyCodes.RShiftKey, KeyCodes.Shift]);
	const ctrl = keyboardEvent.ctrlKey &&
		Utils.isValueOneOf(code,
			[KeyCodes.ControlKey, KeyCodes.LControlKey, KeyCodes.RControlKey, KeyCodes.Control]);
	const alt = keyboardEvent.altKey &&
		Utils.isValueOneOf(code, [KeyCodes.Menu, KeyCodes.LMenu, KeyCodes.RMenu]);
	const windows = keyboardEvent.metaKey &&
		Utils.isValueOneOf(code, [KeyCodes.LWin, KeyCodes.RWin]);

	const modifierOnly = shift || ctrl || alt || windows;
	return !modifierOnly;
}

/**
 * @return true in following cases:
 * 1. Event arrives from HTMLElement.
 * 2. Event arrives from non-editable element.
 * 3. Event arrives from editable element and just modifier has been pressed.
 * 4. Event arrives from editable element and printable key pressed with some modifier.
 * 5. Non printable key is pressed.
 */
function isOnInputAndNonPrintable(event: Event): boolean {
	if (!isKeyboardEvent(event)) {
		return true;
	}

	// If there are modifiers, we're interested
	if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
		return true;
	}

	const element = event.target as Partial<HTMLElement>;
	// Either non input element or not editable
	if (element.nodeName != null &&
		element.nodeName !== "INPUT" &&
		element.nodeName !== "TEXTAREA" &&
		(element.isContentEditable == null || !element.isContentEditable)) {
		return true;
	}


	// If it's printable we're not interested
	// Cast number to KeyCodes
	const codeOrNull = getKeyCode(event);
	// Valid code
	if (codeOrNull == null) return false;
	// ReSharper 2017.3 bug workaround
	const code = codeOrNull;
	// Space
	if (code === KeyCodes.Space) return false;
	// Digits
	if (code >= KeyCodes.D0 && code <= KeyCodes.D9) return false;
	// Letters
	if (code >= KeyCodes.A && code <= KeyCodes.Z) return false;
	// NumPad digit
	if (code >= KeyCodes.NumPad0 && code <= KeyCodes.NumPad9) return false;
	// Arithmetic operators
	if (Utils.isValueOneOf(
		code,
		[KeyCodes.Multiply, KeyCodes.Add, KeyCodes.Subtract, KeyCodes.Decimal, KeyCodes.Divide])) {
		return false;
	}
	// Punctuation, etc.
	if (code >= KeyCodes.Oem1 && code <= KeyCodes.Oem102) return false;

	// Everything else is non-printable
	return true;
}
