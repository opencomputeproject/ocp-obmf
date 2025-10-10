import { getLogger } from "../utils/log";
import { setExcept } from "../utils/SetOperations";

/**
 * Element current state and matching selectors.
 */
interface ElementData {
	visibleSelectors: Readonly<Set<string>>;
	invisibleSelectors: Readonly<Set<string>>;
	currentlyVisible: boolean;
}

type ElementsState = Map<Readonly<HTMLElement>, ElementData>;

export interface SelectorMonitoring {
	monitorVisible: boolean;
	monitorInvisible: boolean;
}

export interface ElementsSelectorMonitoring {
	elements: Set<Readonly<HTMLElement>>;
	monitoring: SelectorMonitoring;
}

export type ElementsBySelector = Map<string, ElementsSelectorMonitoring>;
export type ReadonlyElementsBySelector = ReadonlyMap<string, ElementsSelectorMonitoring>;

/**
 * Empty elements for selector.
 */
const NO_ELEMENTS_FOR_SELECTOR: Readonly<ElementsSelectorMonitoring> = {
	elements: new Set(),
	monitoring: { monitorVisible: false, monitorInvisible: false }
};

/**
 * Manages elements state in the page.
 * Provides mapping from selector to element and from element to selectors.
 */
export class ElementsStateManager {
	/**
	 * Known elements grouped by selector.
	 */
	private readonly knownElements: ElementsBySelector = new Map();

	/**
	 * Elements state for checking visibility.
	 * Updated from elements discovery.
	 * Tested for visibility via visibility periodic test.
	 */
	private readonly elementsState: ElementsState;

	constructor(private readonly isElementVisible: (element: HTMLElement) => boolean) {
		this.elementsState = new Map();
	}

	public updateElements(
		currentElementsBySelector: ReadonlyElementsBySelector,
		onVisibleElement: (selector: string) => void,
		onInvisibleElement: (selector: string) => void): void {

		currentElementsBySelector.forEach((elementsSelectorMonitoring, selector) => {
			const knownElementsForSelector = this.getElementsBySelector(selector);

			// Compare current elements with known elements.
			const currentElements = elementsSelectorMonitoring.elements;
			const monitoring = elementsSelectorMonitoring.monitoring;

			// Check for added and removed elements
			const addedElements = setExcept(currentElements, knownElementsForSelector.elements);
			const removedElements = setExcept(knownElementsForSelector.elements, currentElements);

			if (addedElements.size === 0 && removedElements.size === 0) {
				return;
			}

			// Add added elements to elements state
			addedElements.forEach(addedElement => {
				// Add new element data if it is a new element
				const elementDataFromMap = this.elementsState.get(addedElement);

				let elementData: ElementData;
				if (elementDataFromMap != null) {
					elementData = elementDataFromMap;
				} else {
					elementData = {
						currentlyVisible: this.isElementVisible(addedElement),
						visibleSelectors: new Set(),
						invisibleSelectors: new Set()
					};
					this.elementsState.set(addedElement, elementData);
				}

				// Add new selectors for the element
				if (monitoring.monitorVisible) {
					elementData.visibleSelectors.add(selector);
				}
				if (monitoring.monitorInvisible) {
					elementData.invisibleSelectors.add(selector);
				}

				// report visibility for added elements
				if (monitoring.monitorVisible && elementData.currentlyVisible) {
					onVisibleElement(selector);
				}
			});

			// Remove removed elements from elements state
			removedElements.forEach(removedElement => {
				// Element should stored.
				const elementData = this.elementsState.get(removedElement);

				if (elementData == null) {
					getLogger()
						.warn(
							"Element found by selector but doesn't exist in elementsState",
							removedElement,
							selector);
					return;
				}

				if (monitoring.monitorVisible) {
					elementData.visibleSelectors.delete(selector);
				}
				if (monitoring.monitorInvisible) {
					elementData.invisibleSelectors.delete(selector);
				}
				// Report invisibility for removed elements
				if (elementData.currentlyVisible && !elementData.currentlyVisible) {
					onInvisibleElement(selector);
				}

				// Remove element if no selectors left for this element
				if (elementData.visibleSelectors.size === 0 &&
					elementData.invisibleSelectors.size === 0) {
					this.elementsState.delete(removedElement);
				}
			});

			// Update knownElements with current state
			this.knownElements.set(selector, elementsSelectorMonitoring);
		});
	}

	/**
	 * Iterate all element with given callback.
	 *
	 * @param func Callback for each element and its data.
	 */
	public iterateElements(func: (elementData: ElementData, element: HTMLElement) => void): void {
		this.elementsState.forEach(func);
	}

	private getElementsBySelector(selector: string): Readonly<ElementsSelectorMonitoring> {
		const elementsSelectorMonitoring = this.knownElements.get(selector);
		return elementsSelectorMonitoring != null ? elementsSelectorMonitoring : NO_ELEMENTS_FOR_SELECTOR;
	}
}
