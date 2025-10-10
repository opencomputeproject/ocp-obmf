import { TimeSeries } from "./TimeSeries";
import { TimeProvider, relativeTimeProvider } from "../utils/timeProvider";
import { ExecutionLimit, ExecutionLimits } from "./ExecutionLimits";
import { TimeRange } from "./TimeRange";
import * as Utils from "../utils/utils";

/**
 * Result type of ExecutionLimiter.doWork if work took too much time.
 */
export interface ExecutionBackoff {
	/**
	 * Interval to wait before next operation is allowed to run.
	 */
	readonly backoffInterval: number;
	readonly executionLimit: Readonly<ExecutionLimit>;
	readonly totalRunningTime: number;
}

/**
 * Should be called in safe points to stop work as earlier as possible.
 */
export interface ExecutionWorkLimiter {
	/**
	 * @returns Either backoff result if limit was reached or undefined meaning no backoff.
	 */
	nextBackoff(): ExecutionBackoff | undefined;
}

export interface TotalRunningTimeStatistics {
	readonly totalTime: number;
	readonly count: number;
}


/**
 * Counts time spent by function and suggest how much time to wait between sequential calls.
 */
export class ExecutionLimiter {
	/**
	 * Total previous runs
	 */
	private readonly previousRuns = new TimeSeries();

	/**
	 * Previous runs with tagging
	 */
	private readonly taggedPreviousRuns: { [tag: string]: TimeSeries; } = {};

	/**
	 * Last time the backoff was tested.
	 */
	private lastBackoffCheckTime = 0;

	public static bypassLimits: boolean = false;

	/**
	 * @param limits List of limits for different time frames. Must have at least one limit.
	 * @param timeProvider Time provider used for calculating function running time.
	 * @param gracePeriod Time that must pass between two sequential backoff checks.
	 */
	constructor(
		private readonly limits: ExecutionLimits,
		private readonly gracePeriod: number,
		private readonly timeProvider: TimeProvider = relativeTimeProvider) {

		if (limits.isEmpty()) throw new Error("Limits are empty");
	}


	/**
	 * Calls func callback if work is permitted.
	 *
	 * @param tag Tag for current work
	 * @param func callback to call if work is permitted according to the limits.
	 * @return Either backoff meaning next work slot is not immediate or 'undefined' meaning
	 * next work slot is immediately available.
	 */
	public doWork(
		tag: string,
		func: (workLimiter: ExecutionWorkLimiter) => void): ExecutionBackoff | undefined {

		// Check backoff only if enough time has been passed
		if (this.shouldCheckBackoff()) {
			// Remove old measurements
			this.removeOldMeasurements(tag);

			const result = this.nextBackoff(tag);
			if (result != null) {
				return result;
			}
		}

		let beforeFunc = this.timeProvider.now();

		const nextBackoff = () => {
			// Check backoff only if enough time has been passed
			if (!this.shouldCheckBackoff()) {
				return undefined;
			}

			// Add previous run range to the previousRanges
			const inFunc = this.timeProvider.now();
			this.addTimeRange({ from: beforeFunc, to: inFunc }, tag);

			// Update beforeFunc to calculate next 'canWork' correctly.
			beforeFunc = inFunc;

			return this.nextBackoff(tag);
		};

		try {
			func({ nextBackoff });
		} finally {
			// Add previous run range to the previousRanges
			const afterFunc = this.timeProvider.now();
			this.addTimeRange({ from: beforeFunc, to: afterFunc }, tag);
		}

		// Check backoff only if enough time has been passed
		return this.shouldCheckBackoff() ? this.nextBackoff(tag) : undefined;
	}

	/**
	 * @param tag Tag for current work
	 *
	 * @returns Either backoff result if limit was reached or undefined meaning no backoff.
	 */
	private nextBackoff(tag: string): ExecutionBackoff | undefined {

		if (ExecutionLimiter.bypassLimits) {
			return undefined;
		}

		const now = this.timeProvider.now();

		// Do not check limits if didn't run at all.
		if (!this.previousRuns.hasValues()) {
			return undefined;
		}

		// Validate working time is not beyond defined limits.
		let backoffInterval = 0;
		let executionLimit: Readonly<ExecutionLimit> | undefined;
		let totalRunningTime = 0;

		this.limits.iterateLimits(limit => {
			// Test whether we worked at least maximum working time.
			const timeFrameStart = now - limit.timeFrame;
			const violationMoment = this.previousRuns.momentWithTotalTime(limit.maxWorkTime, timeFrameStart);
			if (violationMoment == null) return false;

			// If running time is exactly the limit and work is consolidated at the end of the window then as time
			// goes on we don't gain more available running time
			//
			// |----- frame ----------|
			//       | ---- work -----|
			//       start            now
			//       start of work is later than start of frame
			const nextTimeToRunAbsolute = violationMoment + limit.timeFrame;
			const limitBackoffInterval = nextTimeToRunAbsolute - now;
			totalRunningTime = this.previousRuns.totalTime(timeFrameStart, violationMoment) + limit.maxWorkTime;

			// Use the smallest ratio for violation.
			if (executionLimit == null || executionLimit.timeFrame < limit.timeFrame) {
				// Backoff for at least maxWorkTime.
				backoffInterval = Math.max(limitBackoffInterval, limit.maxWorkTime);
				executionLimit = limit;
				return true;
			}

			return false;
		});

		// No backoff, just return undefined
		if (backoffInterval === 0 || typeof executionLimit === "undefined") {
			return undefined;
		} else {
			return { backoffInterval, executionLimit, totalRunningTime };
		}
	}

	private addTimeRange(timeRange: TimeRange, tag: string): void {
		this.previousRuns.addRange(timeRange);

		Utils.setIfNotExistFactory(this.taggedPreviousRuns, tag, () => new TimeSeries());
		this.taggedPreviousRuns[tag].addRange(timeRange);
	}

	private removeOldMeasurements(tag: string): void {
		const now = this.timeProvider.now();
		const measurementStartTime = now - this.limits.maxTimeFrame * 2;
		this.previousRuns.dropBefore(measurementStartTime);

		// Remove only specified tag if specified, or everything if wasn't
		if (this.taggedPreviousRuns[tag] != null) {
			this.taggedPreviousRuns[tag].dropBefore(measurementStartTime);
		}
	}

	private removedOldTaggedMeasurements(): void {
		const now = this.timeProvider.now();
		const measurementStartTime = now - this.limits.maxTimeFrame * 2;

		// Remove tags without previous measurements
		for (const tagRun in this.taggedPreviousRuns) {
			if (!this.taggedPreviousRuns.hasOwnProperty(tagRun)) continue;

			const taggedPreviousRun = this.taggedPreviousRuns[tagRun];
			taggedPreviousRun.dropBefore(measurementStartTime);
			if (taggedPreviousRun.timeRangesCount() === 0) {
				delete this.taggedPreviousRuns[tagRun];
			}
		}
	}

	public getMaxTimeFrame(): number {
		return this.limits.maxTimeFrame;
	}

	public getPreviousRuns(): TimeSeries {
		return this.previousRuns;
	}

	public getTotalRunningTime(): number {
		return this.previousRuns.totalTime(this.timeProvider.now() - this.limits.maxTimeFrame);
	}

	public getTaggedPreviousRuns(): { [tag: string]: TimeSeries; } {
		this.removeOldMeasurements("");
		this.removedOldTaggedMeasurements();
		return this.taggedPreviousRuns;
	}

	public getTaggedTotalRunningTime(): { [tag: string]: TotalRunningTimeStatistics; } {
		const startTime = this.timeProvider.now() - this.limits.maxTimeFrame;

		// _.mapKeys(this.getTaggedPreviousRuns(), (v, k) => v.totalTime(startTime))
		const ret: { [tag: string]: TotalRunningTimeStatistics; } = {};
		const taggedPreviousRuns = this.getTaggedPreviousRuns();
		for (const tagRun in taggedPreviousRuns) {
			if (!taggedPreviousRuns.hasOwnProperty(tagRun)) continue;
			ret[tagRun] = {
				totalTime: this.taggedPreviousRuns[tagRun].totalTime(startTime),
				count: this.taggedPreviousRuns[tagRun].timeRangesCount()
			};
		}

		return ret;
	}

	/**
	 * Checks whether backoff should be tested and if it is, then updates last test time.
	 *
	 * @return true if backoff should be tested.
	 */
	private shouldCheckBackoff(): boolean {
		const now = this.timeProvider.now();
		if (now - this.lastBackoffCheckTime >= this.gracePeriod) {
			this.lastBackoffCheckTime = now;
			return true;
		}

		return false;
	}
}
/**
 * At the content script console you can type:  AternityExtension.content.bypassExecLimit()
 */
export function bypassExecLimit(): void {
	ExecutionLimiter.bypassLimits = true;
}