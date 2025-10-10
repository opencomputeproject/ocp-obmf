import { TimeRange } from "./TimeRange";

/**
 * Encapsulate time ranges without any additional logic.
 */
export class TimeSeries {
	/**
	 * Normalized list of TimeRange.
	 * Ranges are ordered from small to big, don't overlap, aren't empty and don't touch.
	 */
	// tslint:disable-next-line readonly-array
	private timeRanges: TimeRange[] = [];

	public hasValues(): boolean {
		return this.timeRanges.length !== 0;
	}

	public timeRangesCount(): number {
		return this.timeRanges.length;
	}

	/**
	 * Add time range to the ranges list.
	 *
	 * @exception Error if timeRange.from is greater than timeRange.to
	 */
	public addRange(timeRange: TimeRange): void {
		if (timeRange.from > timeRange.to) {
			throw new Error(`from ${timeRange.from} is greater than to ${timeRange.to}`);
		}

		// Empty range
		if (timeRange.from === timeRange.to) {
			return;
		}
		// First range
		else if (this.timeRanges.length === 0) {
			this.timeRanges.push(timeRange);
		}
		// Range before first
		else if (timeRange.to < this.timeRanges[0].from) {
			this.timeRanges.unshift(timeRange);
		}
		// Range touching first
		else if (timeRange.to === this.timeRanges[0].from) {
			this.timeRanges[0] = { from: timeRange.from, to: this.timeRanges[0].to };
		}
		// Range after last
		else if (timeRange.from > this.timeRanges[this.timeRanges.length - 1].to) {
			this.timeRanges.push(timeRange);
		}
		// Range touching last
		else if (timeRange.from === this.timeRanges[this.timeRanges.length - 1].to) {
			this.timeRanges[this.timeRanges.length - 1] = {
				from: this.timeRanges[this.timeRanges.length - 1].from,
				to: timeRange.to
			};
		}
		// Range between ranges
		else {
			// tslint:disable-next-line readonly-array
			const timeRangesResult: TimeRange[] = [];

			// Add ranges until new time range begins before ending of stored time range.
			let i = 0;
			for (; i < this.timeRanges.length; ++i) {
				if (timeRange.from > this.timeRanges[i].to) {
					timeRangesResult.push(this.timeRanges[i]);
				} else {
					timeRangesResult.push(this.mergeRanges(this.timeRanges[i], timeRange));
					break;
				}
			}

			// Try merging next ranges if new time range is overlapping
			for (; i < this.timeRanges.length; ++i) {
				const mergedRange = this.maybeMergeRanges(
					timeRangesResult[timeRangesResult.length - 1],
					this.timeRanges[i]);

				if (typeof mergedRange === "undefined") {
					break;
				}

				timeRangesResult[timeRangesResult.length - 1] = mergedRange;
			}

			// The left ranges don't overlap, just add all.
			for (; i < this.timeRanges.length; ++i) {
				timeRangesResult.push(this.timeRanges[i]);
			}

			this.timeRanges = timeRangesResult;
		}
	}

	/**
	 * Merges ranges if touching or overlapping.
	 * @returns New merged range if can merge or undefined if couldn't.
	 */
	private maybeMergeRanges(range1: TimeRange, range2: TimeRange): TimeRange | undefined {
		if (range1.to < range2.from || range1.from > range2.to) return undefined;

		return this.mergeRanges(range1, range2);
	}

	/**
	 * Merges ranges
	 * @returns New merged range
	 */
	private mergeRanges(range1: TimeRange, range2: TimeRange): TimeRange {
		return {
			from: Math.min(range1.from, range2.from),
			to: Math.max(range1.to, range2.to)
		};
	}

	/**
	 * Drop all previous measurements before start.
	 */
	public dropBefore(start: number): void {
		// Validate length
		if (this.timeRanges.length === 0) return;
		// Drop nothing if start is before begin
		if (start <= this.timeRanges[0].from) return;
		// Drop all if start is after end
		if (start >= this.timeRanges[this.timeRanges.length - 1].to) {
			this.timeRanges = [];
			return;
		}

		let i = 0;
		// Find timeRange which begins after start or ends before start
		for (; i < this.timeRanges.length; ++i) {
			if (start < this.timeRanges[i].from || start < this.timeRanges[i].to) break;
		}

		// Drop all before the given index
		this.timeRanges.splice(0, i);

		// Split first timeRange
		this.timeRanges[0] = {
			from: Math.max(this.timeRanges[0].from, start),
			to: this.timeRanges[0].to
		};
	}

	/**
	 * Searches for total time from the last time range.
	 * Returns the timestamp when the total time from that timestamp forward is equal to the specified duration.
	 * In case there was not enough total time as requested, returns the starting first range.
	 *
	 * e.g.:
	 * 01234...				- timestamps
	 * 00000111100010001100 - 0 rest, 1 work
	 * ==> momentWithTotalTime(0, 7, 0) = 5
	 *     momentWithTotalTime(0, 4, 0) = 8
	 *     momentWithTotalTime(0, 1, 0) = 23
	 *     momentWithTotalTime(1, 22) = undefined
	 *
	 * @param start Starting point from which to calculate the total time.
	 * @param requiredTotalTime The requested total time from the end of the series.
	 * This parameter is difference from the last range ending.
	 *
	 * @returns undefined if stored total time is smaller then requested totalTime.
	 * Or the time point from where the total time is at least requested totalTime with
	 * totalTime from given start point.
	 */
	public momentWithTotalTime(requiredTotalTime: number, start?: number): number | undefined {
		let totalTimeInRanges = 0;

		if (this.timeRanges.length === 0) {
			return undefined;
		}

		const startInterval = start != null ? start : this.timeRanges[this.timeRanges.length - 1].to;

		for (let i = this.timeRanges.length - 1; i >= 0; --i) {
			const range = this.timeRanges[i];

			// Do not continue beyond start point.
			if (range.to <= startInterval) break;

			// Calculate time from start point
			const from = Math.max(startInterval, range.from);

			totalTimeInRanges += range.to - from;

			// If aggregated total time is greater than requested, return the timestamp.
			if (totalTimeInRanges >= requiredTotalTime) {
				const timePoint = from + totalTimeInRanges - requiredTotalTime;

				// Now calculate totalTime till the start
				return timePoint;
			}
		}

		return undefined;
	}

	/**
	 * Calculates total time ranges from start to end.
	 *
	 * @param start Start time point
	 * @param end End time point. Default is the end of time series.
	 * @return {number} Total time from the given point.
	 */
	public totalTime(start: number, end?: number): number {
		// No ranges - total time is zero
		if (this.timeRanges.length === 0) {
			return 0;
		}

		// End not specified, use the last time range.
		const endInterval = end != null ? end : this.timeRanges[this.timeRanges.length - 1].to;

		// No range between start and end, return zero.
		if (start >= endInterval) {
			return 0;
		}

		let i = this.timeRanges.length - 1;
		// Skip ranges after 'end'
		for (; i >= 0; --i) {
			if (endInterval > this.timeRanges[i].from) break;
		}

		let sum = 0;
		for (; i >= 0; --i) {
			const timeRange = this.timeRanges[i];

			// Stop when we are passed 'start'.
			if (timeRange.to < start) break;

			// If time range after 'start' and before 'end', use whole range.
			if (start <= timeRange.from && timeRange.to <= endInterval) {
				// Add full range if 'start' not in the middle
				sum += timeRange.to - timeRange.from;
			} else {
				const startRange = Math.max(timeRange.from, start);
				const endRange = Math.min(timeRange.to, endInterval);

				// Add part of range
				sum += endRange - startRange;
			}
		}

		return sum;
	}
}
