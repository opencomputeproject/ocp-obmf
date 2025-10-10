/**
 * Time provider interface for testing the class
 * The interface is compatible with Rx.IScheduler.
 */
export interface TimeProvider {
	now(): number;
}

/**
 * window.performance.now provider.
 */
const performanceNowProvider: TimeProvider = {
	now(): number {
		return window.performance.now();
	}
};

/**
 * Returns current time using the best available option.
 */
export const timeProvider: TimeProvider = {
	// Some IE modes don't have Date.now.
	now: Date.now != null
		? (): number => Date.now()
		: (): number => new Date().getTime()
};

// Validate window.performance exists and working correctly (IE bug !)
/*
	const HAS_PERFORMANCE_NOW =
	window.performance != null &&
	window.performance.now != null &&
	window.performance.now() !== Infinity;
	*/

/**
 * Time provider for relative calculations.
 * It doesn't necessarily returns the current time.
 *
 * performance.now is too slow in IE, using inaccurate timeProvider now.
 */
export const relativeTimeProvider = timeProvider;
