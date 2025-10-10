/**
 * Stores MutationObserver with options and callback.
 */

export class MutationObserverManager {
	public constructor(
		private readonly options: MutationObserverInit,
		private readonly target: Node,
		private readonly callback: MutationCallback) {

		this.mutationObserver = new MutationObserver(callback);
	}

	private readonly mutationObserver: MutationObserver;

	public observe(): void {
		this.mutationObserver.observe(this.target, this.options);
	}

	public disconnect(): void {
		this.mutationObserver.disconnect();
	}
}