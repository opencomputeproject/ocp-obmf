export interface ExecutionLimit {
	maxWorkTime: number;
	timeFrame: number;
}

// Hack to imitate getters which don't exist in old IE
type MutableExecutionLimits = { maxTimeFrame: number; };

/**
 * ExecutionLimits collection.
 * Limits are sorted by ratio from lowest to biggest, e.g.: 10 of 1000 is stored before 10 of 100.
 */
export class ExecutionLimits {
	/**
	 * TimeFrame -> MaxWorkTime
	 */
	// tslint:disable-next-line readonly-array
	private readonly executionLimits: ExecutionLimit[] = [];

	public readonly maxTimeFrame = 0;

	public addLimit(maxWorkTime: number, timeFrame: number): void {
		if (timeFrame <= 0) throw new Error(`timeFrame ${timeFrame} is negative`);
		if (maxWorkTime <= 0) throw new Error(`maxWorkTime ${maxWorkTime} is negative`);
		if (maxWorkTime > timeFrame) throw new Error(`maxWorkTime ${maxWorkTime} is greater than timeFrame ${timeFrame}`);

		(this as MutableExecutionLimits).maxTimeFrame = Math.max(this.maxTimeFrame, timeFrame);

		// If time frame added, use the minimum
		for (const executionLimit of this.executionLimits) {
			if (executionLimit.timeFrame === timeFrame) {
				executionLimit.maxWorkTime = Math.min(executionLimit.maxWorkTime, maxWorkTime);
				return;
			}
		}

		// Put smaller timeFrame / maxWorkTime ratio first.
		// For same ratio use smaller timeFrame
		const ratio = maxWorkTime / timeFrame;
		let index = 0;
		for (; index < this.executionLimits.length; ++index) {
			const limitRatio = this.executionLimits[index].maxWorkTime / this.executionLimits[index].timeFrame;

			if (ratio < limitRatio) {
				break;
			} else if (ratio === limitRatio && timeFrame < this.executionLimits[index].timeFrame) {
				break;
			}
		}

		this.executionLimits.splice(index, 0, { maxWorkTime, timeFrame });
	}

	public isEmpty(): boolean {
		return this.executionLimits.length === 0;
	}

	/**
	 * Iterate all limits as long as callback returns false.
	 */
	public iterateLimits(callback: (executionLimit: Readonly<ExecutionLimit>) => boolean): void {
		for (const executionLimit of this.executionLimits) {
			if (callback(executionLimit)) {
				break;
			}
		}
	}
}
