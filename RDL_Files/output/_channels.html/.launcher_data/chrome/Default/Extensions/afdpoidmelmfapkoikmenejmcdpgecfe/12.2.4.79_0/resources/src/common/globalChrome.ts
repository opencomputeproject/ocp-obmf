// tslint:disable-next-line no-reference
///<reference path="../../node_modules/@types/chrome/index.d.ts"/>


// ReSharper disable once DeclarationHides
// In Chrome the object is window.chrome, FF calls setChrome to set its polyfill to 'chrome' (no 'window')
// IE calls setChrome to set its polyfill to our own Chrome().

// export let chrome = window.chrome; // at this point this is undefined, for IE and FF

/*
export let chrome = window.chrome;
export function setChrome(chromeImpl: typeof window.chrome): void {
	chrome = chromeImpl;
}*/
