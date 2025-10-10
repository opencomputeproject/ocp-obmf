"use strict";

/**
 * Function which does nothing.
 */
function emptyFunction(): void { }

// Global console object and window.console don't exist in IE by default.
// But it magically appears when opening developer tools.
function hasConsole(): boolean {
	return console != null;
}

// Bind is supported only in modern browsers
const SUPPORTS_BIND = Function.prototype.bind != null;

type ConsoleLogFunctionsList = "debug" | "log" | "info" | "warn" | "error" | "trace";
type ConsoleLogFunction = Console["log"];

/**
 * Wrap log function with message and optional parameters.
 *
 * @param f console object function
 */
function wrapConsoleLogFunction(f: ConsoleLogFunctionsList): ConsoleLogFunction {

	if (!hasConsole()) {
		return emptyFunction;
	}

	// Resharper 2017.3 bug
	// ReSharper disable ImplicitAnyError

	// Validate function exist.
	// If function doesn't exist try using 'console.log'.
	if (console[f] == null) {
		if (f !== "log") {
			return wrapConsoleLogFunction("log");
		} else {
			return emptyFunction;
		}
	}

	// Use bind if possible
	try {
		if (SUPPORTS_BIND &&
			console[f] != null &&
			console[f].bind != null) {

			return console[f].bind(console) as ConsoleLogFunction;
		}
	} catch (e) {
	}

	return console[f];
	// ReSharper restore ImplicitAnyError
}

type Logger = { [P in ConsoleLogFunctionsList]: Console[P]; };

const emptyLogger: Logger = {
	debug: emptyFunction,
	log: emptyFunction,
	info: emptyFunction,
	warn: emptyFunction,
	error: emptyFunction,
	trace: emptyFunction
};

function wrapConsole(): Logger {
	return {
		debug: wrapConsoleLogFunction("debug"),
		log: wrapConsoleLogFunction("log"),
		info: wrapConsoleLogFunction("info"),
		warn: wrapConsoleLogFunction("warn"),
		error: wrapConsoleLogFunction("error"),
		trace: wrapConsoleLogFunction("trace")
	};
}

/**
 * @return Logger which logs if window.console present or logger stub which does nothing.
 */
function createConsoleLogger(): Logger {
	return hasConsole() ? wrapConsole() : emptyLogger;
}

// Current logger implementation
let currentLogger = emptyLogger;

export function getLogger(): Logger {
	return currentLogger;
}

/**
 * Enable logs.
 */
export function enableLogs(): void {
	currentLogger = createConsoleLogger();
}

/**
 * Disable logs.
 */
export function disableLogs(): void {
	currentLogger = emptyLogger;
}
