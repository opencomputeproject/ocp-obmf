import { JSMutationObserver } from "./JSMutationObserver";

declare global {
	interface Window {
		// ReSharper disable once InconsistentNaming
		MutationObserver: typeof MutationObserver;
	}
}
export const mutationObserverImplementation =
	window.MutationObserver != null ? window.MutationObserver : JSMutationObserver;
