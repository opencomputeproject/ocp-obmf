// ReSharper disable once InconsistentNaming
// Aternity objects have weird names on purpose
/**
 * @return {(string | undefined)} Tab title as seen by user.
 * Most time it is same as document.title property except for some corner cases such as empty title.
 */
declare function __AternityGetDocumentTitle__$$(window: Window): string | undefined;
