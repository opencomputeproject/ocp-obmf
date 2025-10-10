import { isValidNativeSelector, makeSelectorWithAnyDescendant } from "./CSSUtils";
import { SizzleToken } from "./jqueryTypings";
import * as Utils from "../utils/utils";

export interface SelectorPseudoWithData<T> {
	/** cssSelector CSS selector */
	cssSelector: string;

	/** cssSelectorData Data attached to CSS selector */
	cssSelectorData: T;

	/** Pseudo element part. */
	pseudo: string;
}

/** Readonly interface for export */
export interface ReadonlySelectorPseudoWithData<T> {
	/** cssSelector CSS selector */
	readonly cssSelector: string;

	/** cssSelectorData Data attached to CSS selector */
	cssSelectorData: T;

	/** Pseudo element part. */
	readonly pseudo: string;
}

/** Readonly interface for export */
export interface ReadonlyEndingPseudoSelectorWithData<T> {
	readonly nonpseudo: string;
	readonly nonpseudoWithAnyDescendant: string;
	readonly isNonPseudoNativeSelector: boolean;
	readonly pseudos: ReadonlyArray<ReadonlySelectorPseudoWithData<T>>;
}

class EndingPseudoSelectorWithData<T> implements ReadonlyEndingPseudoSelectorWithData<T> {
	public constructor(public readonly nonpseudo: string) {
		this.nonpseudoWithAnyDescendant = makeSelectorWithAnyDescendant(nonpseudo);
		this.isNonPseudoNativeSelector = isValidNativeSelector(nonpseudo);
	}

	/**
	 * Selector matching any descendant with the given selector in initialization.
	 */
	public readonly nonpseudoWithAnyDescendant: string;

	/**
	 * true if non pseudo part can be matched using native selectors.
	 */
	public readonly isNonPseudoNativeSelector: boolean;

	/**
	 * Collection of pseudo elements with data
	 */
	public readonly pseudos: SelectorPseudoWithData<T>[] = [];
}

type ForEachCallback<U> = (
	nonpseudo: string,
	pseudo: string,
	cssSelector: string,
	cssSelectorData: string,
	context: U) => void;

/**
 * Selectors ending with pseudo element.
 */
export class RulesEndingPseudoSelectors<T> {
	/**
	 * @param cssSelector CSS selector
	 * @param cssSelectorData Data attached to CSS selector
	 * @param nonpseudo Non-pseudo part of the selector
	 * @param pseudo Pseudo element part of the selector
	 *
	 * @return true if selector was added, false otherwise.
	 */
	public tryAdd(cssSelector: string, cssSelectorData: T, tokens: ReadonlyArray<SizzleToken>): boolean {
		const lastPartInFirstSelector: SizzleToken | undefined = tokens[tokens.length - 1];

		// Add only last part is pseudo element such as :contains
		if (tokens.length <= 1 ||
			lastPartInFirstSelector == null ||
			lastPartInFirstSelector.type !== "PSEUDO") {
			return false;
		}

		// Pseudo element
		const pseudo = lastPartInFirstSelector.value;

		// Non-pseudo part
		const nonpseudo = cssSelector.substr(0, cssSelector.length - pseudo.length);

		// Find already added non-pseudo or add a new one
		// ReSharper 2017.3 bug, must explicitly specify generic parameter
		const ruleEndingPseudoFromList = Utils.find<EndingPseudoSelectorWithData<T>>(
			this.endingPseudoSelectorWithData,
			endingPseudo => endingPseudo.nonpseudo === nonpseudo);

		let ruleEndingPseudo: EndingPseudoSelectorWithData<T>;
		if (ruleEndingPseudoFromList != null) {
			ruleEndingPseudo = ruleEndingPseudoFromList;
		} else {
			ruleEndingPseudo = new EndingPseudoSelectorWithData<T>(nonpseudo);
			this.endingPseudoSelectorWithData.push(ruleEndingPseudo);
		}

		ruleEndingPseudo.pseudos.push({
			cssSelector,
			cssSelectorData,
			pseudo
		});

		return true;
	}

	private readonly endingPseudoSelectorWithData: EndingPseudoSelectorWithData<T>[] = [];

	public getEndingPseudoSelectorWithData(): ReadonlyArray<ReadonlyEndingPseudoSelectorWithData<T>> {
		return this.endingPseudoSelectorWithData;
	}
}
