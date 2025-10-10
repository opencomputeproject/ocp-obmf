export enum FrameType {
	DOCUMENT = "document",
	FRAME = "frame"
}

/**
 * @param {number} frameId Frame id to retrieve type from.
 * @returns {string} Return property 'type' value.
 */
export function getFrameType(frameId: number): FrameType {
	return frameId === 0 ? FrameType.DOCUMENT : FrameType.FRAME;
}
