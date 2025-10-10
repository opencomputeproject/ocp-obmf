"use strict";

/**
 * Order of the native message.
 */
let nativeMessageOrder = 0;
export function getNativeMessageOrder(): number {
	// Limit order by max uint32
	if (nativeMessageOrder > 2 * 1024 * 1024 * 1024) {
		nativeMessageOrder = 0;
	}
	return nativeMessageOrder++;
}
