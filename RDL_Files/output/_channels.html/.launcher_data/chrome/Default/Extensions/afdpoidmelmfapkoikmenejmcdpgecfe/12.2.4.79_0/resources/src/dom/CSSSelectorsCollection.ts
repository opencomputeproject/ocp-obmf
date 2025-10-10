import { lazyJQuery } from "./jquery";
import { elementMatches, getElementByIdFromDocument } from "./DomUtils";
import { isValidNativeSelector } from "./CSSUtils";
import { Lazy } from "../utils/lazy";
import { SizzleToken } from "./jqueryTypings";
import { CSSSelectorWithData, CSSNativeSelectorWithData } from "./CSSSelectorWithData";
import { RulesEndingPseudoSelectors, ReadonlyEndingPseudoSelectorWithData } from "./RulesEndingPseudoSelectors";

type GetElements = () => ArrayLike<Element>;
type MatchElementsCallback<T> = (cssSelector: string, getElements: GetElements, cssSelectorData: T) => void;

type MatchesClosest = () => boolean;
type MatchesClosestCallback<T> = (cssSelector: string, matchesClosest: MatchesClosest, cssSelectorData: T) => void;

// tslint:disable-next-line no-unbound-method
const tokenize = new Lazy(() => lazyJQuery.getValue().find.tokenize);
const EMPTY_JQUERY = new Lazy(() => lazyJQuery.getValue()());


/**
 * @param cssSelector CSS selector which will be evaluated using native functions.
 * @returns Unescaped native selector to evaluate.
 */
function makeNativeSelector(cssSelector: string): string {
	// Replace \x with x as escaping is not required in native functions.
	return cssSelector.substr(1).replace(/\\(.)/g, "$1");
}

/**
 * Store CSS selection and run queries in the most optimized.
 * Selector can have additional data.
 */
export class CSSSelectorsCollection<T = undefined> {
	public static fromSet(selectors: Set<string>): CSSSelectorsCollection {
		const collection = new CSSSelectorsCollection<undefined>();
		selectors.forEach(selector => {
			collection.add(selector, undefined);
		});
		return collection;
	}

	public readonly size: number = 0;

	private textMatchingSelector: boolean = false;

	/**
	 * @return true if there are selectors with text matching (:contains)
	 */
	public hasTextMatchingSelector(): boolean {
		return this.textMatchingSelector;
	}

	private readonly attributesInSelectors = new Set<string>();

	/**
	 * @return Attributes mentioned in the selectors if were.
	 */
	public getAttributesInSelectors(): ReadonlySet<string> {
		return this.attributesInSelectors;
	}

	/**
	 * Add selector to collection
	 *
	 * @param cssSelector A valid CSS selector.
	 * @param cssSelectorData Additional data bound to this selector if required
	 *
	 * @return true if added new selector to collection, false if selector was already added.
	 * @throws {Error} When selector is invalid.
	 * @throws {Error} When there is more than one selector passed (using comma, e.g. "a,b")
	 */
	public add(cssSelector: string, cssSelectorData: T): boolean {
		if (this.allSelectors.has(cssSelector)) {
			return false;
		}

		const cssTokens = tokenize.getValue()(cssSelector);

		if (cssTokens.length === 0) {
			throw new Error("Must provide at least one selector");
		}
		if (cssTokens.length !== 1) {
			throw new Error("Multiple selectors are not supported");
		}

		this.allSelectors.add(cssSelector);

		// Increment size
		(this as { size: number; }).size++;

		// Support single selector case
		const firstSelector = cssTokens[0];

		// Update selector data
		this.analyzeSelector(firstSelector);

		// Try adding to rule ending pseudo element
		if (this.rulesEndingPseudoSelectors.tryAdd(cssSelector, cssSelectorData, firstSelector)) {
			return true;
		}

		// Fall back to other selectors or jquery selectors.
		if (isValidNativeSelector(cssSelector)) {
			this.addNativeSelectorsCollection(firstSelector, cssSelector, cssSelectorData);
		} else {
			this.jquerySelectors.push(new CSSSelectorWithData(cssSelector, cssSelectorData));
		}

		return true;
	}

	private static readonly TEXT_PSEUDO_ELEMENTS: ReadonlyArray<string> = [
		"contains",
		"text"
	];

	private analyzeSelector(tokens: ReadonlyArray<SizzleToken>): void {
		for (const token of (tokens as Array<SizzleToken>)) {
			switch (token.type) {
				case "ATTR":
					this.attributesInSelectors.add(token.matches[0]);
					break;
				case "PSEUDO":
					if (!this.textMatchingSelector &&
						CSSSelectorsCollection.TEXT_PSEUDO_ELEMENTS.some(e => token.matches[0] === e)) {
						this.textMatchingSelector = true;
					}
					break;
				default:
					break;
			}
		}
	}

	/**
	 * Iterates over all selectors.
	 */
	public forEach(f: (cssSelector: string, cssSelectorData: T) => void): void {
		this.forEachImpl(this.idSelectors, f);
		this.forEachImpl(this.tagSelectors, f);
		this.forEachImpl(this.classSelectors, f);
		this.forEachImpl(this.nativeSelectors, f);
		this.forEachImplEndingPsuedo(f);
		this.forEachImpl(this.jquerySelectors, f);
	}

	private forEachImpl(
		cssSelectorsWithData: ReadonlyArray<CSSSelectorWithData<T>>,
		f: (cssSelector: string, cssSelectorData: T) => void): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			f(cssSelectorWithData.cssSelector, cssSelectorWithData.cssSelectorData);
		}
	}

	private forEachImplEndingPsuedo(f: (cssSelector: string, cssSelectorData: T) => void): void {
		for (const ruleEndingPseudo of this.rulesEndingPseudoSelectors.getEndingPseudoSelectorWithData()) {
			for (const endingPseudo of ruleEndingPseudo.pseudos) {
				f(endingPseudo.cssSelector, endingPseudo.cssSelectorData);
			}
		}
	}

	// #region closest

	/**
	 * Test for closest element with matching selectors using optimized order with optimizations.
	 *
	 * @return true if the given element has any closest element matching selectors.
	 */
	public matchesClosest(element: Element, callback: MatchesClosestCallback<T>): void {
		// No selectors, no elements
		if (this.allSelectors.size === 0) {
			return;
		}

		const jqElement = lazyJQuery.getValue()(element);

		this.matchesClosestId(this.idSelectors, callback, element);
		this.matchesClosestTag(this.tagSelectors, callback, element);
		this.matchesClosestSelector(this.classSelectors, callback, element);
		this.matchesClosestSelector(this.nativeSelectors, callback, element);
		this.matchesClosestEndingPseudo(callback, jqElement);
		this.matchesClosestJQuery(this.jquerySelectors, callback, jqElement);
	}

	private matchesClosestId(
		cssSelectorsWithData: ReadonlyArray<CSSNativeSelectorWithData<T>>,
		callback: MatchesClosestCallback<T>,
		element: Element): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				// Element either matches itself, or has any descendant with the match
				() => element.id === cssSelectorWithData.nativeSelector ||
				elementMatches(element, cssSelectorWithData.cssSelectorWithAnyDescendant),
				cssSelectorWithData.cssSelectorData);
		}
	}

	private matchesClosestTag(
		cssSelectorsWithData: ReadonlyArray<CSSNativeSelectorWithData<T>>,
		callback: MatchesClosestCallback<T>,
		element: Element): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				// Element either matches itself, or has any descendant with the match
				() => element.tagName === cssSelectorWithData.nativeSelector ||
				elementMatches(element, cssSelectorWithData.cssSelectorWithAnyDescendant),
				cssSelectorWithData.cssSelectorData);
		}
	}

	private matchesClosestSelector(
		cssSelectorsWithData: ReadonlyArray<CSSSelectorWithData<T>>,
		callback: MatchesClosestCallback<T>,
		element: Element): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				// Element either matches itself, or has any descendant with the match
				() => elementMatches(element, cssSelectorWithData.cssSelector) ||
					elementMatches(element, cssSelectorWithData.cssSelectorWithAnyDescendant),
				cssSelectorWithData.cssSelectorData);
		}
	}

	private matchesClosestEndingPseudo(
		callback: MatchesClosestCallback<T>,
		element: JQuery<Element>): void {
		// Iterate all rules
		for (const ruleEndingPseudo of this.rulesEndingPseudoSelectors.getEndingPseudoSelectorWithData()) {
			this.matchesOneRuleClosestEndingPseudo(callback, element, ruleEndingPseudo);
		}
	}

	private matchesOneRuleClosestEndingPseudo(
		callback: MatchesClosestCallback<T>,
		element: JQuery<Element>,
		ruleEndingPseudo: ReadonlyEndingPseudoSelectorWithData<T>): void {

		// Elements cache for matching non-pseudo parts
		const matchingElements: JQuery<Element>[] = [];
		// Whether all parents were tested.
		let testedAllParents = false;

		const makeisClosest = (pseudo: string) => () => {
			// First match all cached elements.
			const result = matchingElements.some(matchingElement => matchingElement.is(pseudo));
			if (result || testedAllParents) return result;

			// Set starting element according to the cache.
			// If there are elements in cache, start from parent of last element.
			let currentElement: typeof element;
			if (matchingElements.length > 0) {
				currentElement = matchingElements[matchingElements.length - 1].parent();

				// No more parents, no more search is required.
				if (currentElement.length === 0) {
					testedAllParents = true;
					return false;
				}
			} else {
				currentElement = element;
			}

			// Iterate elements and their parents, cache all elements being matched.
			for (; currentElement.length > 0; currentElement = currentElement.parent()) {
				// Optimized check for native selector in non-pseudo part
				if (ruleEndingPseudo.isNonPseudoNativeSelector) {
					const nativeElement = currentElement[0];

					if (elementMatches(nativeElement, ruleEndingPseudo.nonpseudo)) {
						// This element is matched, just test pseudo part.
					} else if (elementMatches(
						nativeElement,
						ruleEndingPseudo.nonpseudoWithAnyDescendant)) {
						// Some ancestor is matched, use parent for faster search.
						currentElement = currentElement.parent();
					} else {
						// No element will be matched, all parents checked.
						testedAllParents = true;
						return false;
					}
				} else {
					// JQuery closest implementation
					currentElement = currentElement.closest(ruleEndingPseudo.nonpseudo);
				}

				// No more parents, no more search is required.
				if (currentElement.length === 0) {
					testedAllParents = true;
					return false;
				}

				// Add element to cache
				matchingElements.push(currentElement);

				// Found closest, test pseudo element
				if (currentElement.is(pseudo)) {
					return true;
				}
			}

			testedAllParents = true;
			return false;
		};

		// Iterate all pseudo elements
		for (const endingPseudo of ruleEndingPseudo.pseudos) {
			callback(
				endingPseudo.cssSelector,
				makeisClosest(endingPseudo.pseudo),
				endingPseudo.cssSelectorData);
		}
	}

	private matchesClosestJQuery(
		cssSelectorsWithData: ReadonlyArray<CSSSelectorWithData<T>>,
		callback: MatchesClosestCallback<T>,
		element: JQuery<Element>): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(cssSelectorWithData.cssSelector,
				() => element.closest(cssSelectorWithData.cssSelector).length > 0,
				cssSelectorWithData.cssSelectorData);
		}
	}

	// #endregion

	// #region matchElements

	/**
	 * Matches document using optimized order with optimizations
	 */
	public matchElements(callback: MatchElementsCallback<T>): void {
		// No selectors, no elements
		if (this.allSelectors.size === 0) {
			return;
		}

		this.matchSelectorsId(this.idSelectors, callback);
		this.matchSelectorsTag(this.tagSelectors, callback);
		this.matchSelectorsClass(this.classSelectors, callback);
		this.matchSelectorsNative(this.nativeSelectors, callback);
		this.matchSelectorsEndingPseudo(callback);
		this.matchSelectorsJQuery(this.jquerySelectors, callback);
	}

	private matchSelectorsId(
		cssSelectorsWithData: ReadonlyArray<CSSNativeSelectorWithData<T>>,
		callback: MatchElementsCallback<T>): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				() => {
					const element = getElementByIdFromDocument(cssSelectorWithData.nativeSelector, cssSelectorWithData.cssSelector);
					return element != null ? [element] : [];
				},
				cssSelectorWithData.cssSelectorData);
		}
	}

	private matchSelectorsTag(
		cssSelectorsWithData: ReadonlyArray<CSSNativeSelectorWithData<T>>,
		callback: MatchElementsCallback<T>): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				() => document.getElementsByTagName(cssSelectorWithData.nativeSelector),
				cssSelectorWithData.cssSelectorData);
		}
	}

	private matchSelectorsClass(
		cssSelectorsWithData: ReadonlyArray<CSSNativeSelectorWithData<T>>,
		callback: MatchElementsCallback<T>): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				() => document.getElementsByClassName(cssSelectorWithData.nativeSelector),
				cssSelectorWithData.cssSelectorData);
		}
	}

	private matchSelectorsNative(
		cssSelectorsWithData: ReadonlyArray<CSSSelectorWithData<T>>,
		callback: MatchElementsCallback<T>): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				() => document.querySelectorAll(cssSelectorWithData.cssSelector),
				cssSelectorWithData.cssSelectorData);
		}
	}

	private matchSelectorsEndingPseudo(callback: MatchElementsCallback<T>): void {
		for (const ruleEndingPseudo of this.rulesEndingPseudoSelectors.getEndingPseudoSelectorWithData()) {
			// Elements cache
			let elements: JQuery<Element>;

			for (const endingPseudo of ruleEndingPseudo.pseudos) {
				callback(
					endingPseudo.cssSelector,
					() => {
						// Search elements only once
						if (elements == null) {
							elements = lazyJQuery.getValue()(ruleEndingPseudo.nonpseudo);
						}

						return elements.length !== 0
							? elements.filter(endingPseudo.pseudo)
							: EMPTY_JQUERY.getValue();
					},
					endingPseudo.cssSelectorData);
			}
		}
	}

	private matchSelectorsJQuery(
		cssSelectorsWithData: ReadonlyArray<CSSSelectorWithData<T>>,
		callback: MatchElementsCallback<T>): void {

		for (const cssSelectorWithData of cssSelectorsWithData) {
			callback(
				cssSelectorWithData.cssSelector,
				() => lazyJQuery.getValue()(cssSelectorWithData.cssSelector), cssSelectorWithData.cssSelectorData);
		}
	}

	// #endregion

	private addNativeSelectorsCollection(
		tokens: ReadonlyArray<SizzleToken>,
		cssSelector: string,
		cssSelectorData: T): void {

		// Optimization for single token
		if (tokens.length === 1) {
			switch (tokens[0].type) {
			case "ID":
				this.idSelectors.push(
					new CSSNativeSelectorWithData(cssSelector, cssSelectorData, makeNativeSelector(cssSelector)));
				return;
			case "TAG":
				this.tagSelectors.push(
					new CSSNativeSelectorWithData(cssSelector, cssSelectorData, cssSelector.toUpperCase()));
				return;
			case "CLASS":
				this.classSelectors.push(
					new CSSNativeSelectorWithData(cssSelector, cssSelectorData, makeNativeSelector(cssSelector)));
				return;
			}
		}

		// Default native selectors match
		this.nativeSelectors.push(new CSSSelectorWithData(cssSelector, cssSelectorData));
	}

	private readonly allSelectors = new Set<string>();

	private readonly idSelectors: CSSNativeSelectorWithData<T>[] = [];
	private readonly tagSelectors: CSSNativeSelectorWithData<T>[] = [];
	private readonly classSelectors: CSSNativeSelectorWithData<T>[] = [];
	private readonly nativeSelectors: CSSSelectorWithData<T>[] = [];
	private readonly rulesEndingPseudoSelectors = new RulesEndingPseudoSelectors<T>();
	private readonly jquerySelectors: CSSSelectorWithData<T>[] = [];
}

/**
 * @return true if selector is valid for CSSSelectorsCollection.
 */
export function isValidCSSSelectorsCollectionSelector(cssSelector: string): boolean {
	try {
		new CSSSelectorsCollection().add(cssSelector, undefined);
		return true; // If the above line did not throw then the selector is legal
	} catch (e) {
		return false;
	}
}
