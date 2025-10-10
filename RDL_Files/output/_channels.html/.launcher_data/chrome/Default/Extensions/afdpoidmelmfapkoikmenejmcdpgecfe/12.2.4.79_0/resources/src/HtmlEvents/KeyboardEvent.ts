/**
 * Check whether event is KeyboardEvent.
 * This function supports IE8.
 * @return true if event is Keyboard event.
 */
export function isKeyboardEvent(event: Event): event is KeyboardEvent {
	if ("keyCode" in event) {
		return true;
	} else {
		// IE8 support
		return typeof KeyboardEvent !== "undefined" && event instanceof KeyboardEvent;
	}
}
