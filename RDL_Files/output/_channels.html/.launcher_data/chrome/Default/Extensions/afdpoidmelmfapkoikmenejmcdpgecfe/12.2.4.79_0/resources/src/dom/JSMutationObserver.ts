/**
 * @file MutationObserver implementation using DOM mutation events.
 * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
 *
 * Code based on https://github.com/bitovi/mutationobserver
 * The only difference that it uses setTimeout instead of setImmediate as the last one is not reliable,
 * and its polyfill breaks pages (it uses messaging, and some frames add listeners to messages).
 * See: https://codeforhire.com/2013/09/21/setimmediate-and-messagechannel-broken-on-internet-explorer-10/
 *
 * The Mutation Events polyfill is taken from the Polymer Project (https://github.com/Polymer/MutationObservers) and has a BSD license.
 */

// ReSharper disable Lambda
// tslint:disable no-non-null-assertion
// tslint:disable strict-boolean-expressions
// tslint:disable call-signature
// tslint:disable no-unnecessary-type-assertion
// tslint:disable variable-name
// tslint:disable curly
// tslint:disable no-use-before-declare

const registrationsTable = new WeakMap<Node, Registration[]>();

// This is used to ensure that we never schedule 2 callas to setImmediate
let isScheduled = false;

// Keep track of observers that needs to be notified next time.
let scheduledObservers: JSMutationObserverInternal[] = [];

/**
 * Schedules |dispatchCallback| to be called in the future.
 * @param {MutationObserver} observer
 */
function scheduleCallback(observer: JSMutationObserverInternal): void {
	scheduledObservers.push(observer);
	if (!isScheduled) {
		isScheduled = true;
		setTimeout(dispatchCallbacks, 0);
	}
}

function dispatchCallbacks(): void {
	// http://dom.spec.whatwg.org/#mutation-observers

	isScheduled = false; // Used to allow a new setImmediate call above.

	const observers = scheduledObservers;
	scheduledObservers = [];

	// Sort observers based on their creation UID (incremental).
	observers.sort(function(o1: JSMutationObserverInternal, o2: JSMutationObserverInternal): number {
		return o1.uid_ - o2.uid_;
	});

	let anyNonEmpty = false;
	observers.forEach(function(observer: JSMutationObserverInternal): void {

		// 2.1, 2.2
		const queue = observer.takeRecords();
		// 2.3. Remove all transient registered observers whose observer is mo.
		removeTransientObserversFor(observer);

		// 2.4
		if (queue.length) {
			observer.callback_(queue, observer);
			anyNonEmpty = true;
		}
	});

// 3.
	if (anyNonEmpty)
		dispatchCallbacks();
}

function removeTransientObserversFor(observer: JSMutationObserverInternal): void {
	observer.nodes.forEach(function(node: Node): void {
		const registrations = registrationsTable.get(node);
		if (!registrations)
			return;
		registrations.forEach(function(registration: Registration): void {
			if (registration.observer === observer)
				registration.removeTransientObservers();
		});
	});
}

/**
 * This function is used for the "For each registered observer observer (with
 * observer's options as options) in target's list of registered observers,
 * run these substeps:" and the "For each ancestor ancestor of target, and for
 * each registered observer observer (with options options) in ancestor's list
 * of registered observers, run these substeps:" part of the algorithms. The
 * |options.subtree| is checked to ensure that the callback is called
 * correctly.
 *
 * @param {Node} target
 * @param {function(MutationObserverInit):MutationRecord} callback
 */
function forEachAncestorAndObserverEnqueueRecord(
	target: Node,
	callback: (options: MutationObserverInit) => JSMutationRecord | undefined): void {

	for (let node = target; node; node = node.parentNode!) {
		const registrations = registrationsTable.get(node);

		if (registrations) {
			for (let j = 0; j < registrations.length; j++) {
				const registration = registrations[j];
				const options = registration.options;

				// Only target ignores subtree.
				if (node !== target && !options.subtree)
					continue;

				const record = callback(options);
				if (record)
					registration.enqueue(record);
			}
		}
	}
}

/**
 * Global identifier counter.
 */
let uidCounter = 0;

// ReSharper disable once InconsistentNaming
export class JSMutationObserver implements MutationObserver {
	/**
	 * The class that maps to the DOM MutationObserver interface.
	 * @param {Function} callback.
	 * @constructor
	 */
	public constructor(callback: MutationCallback) {
		this.callback_ = callback;
		this.nodes = [];
		this.records_ = [];
		this.uid_ = ++uidCounter;
	}

	public observe(target: Node, options: MutationObserverInit): void {
		// 1.1
		if (!options.childList && !options.attributes && !options.characterData ||

			// 1.2
			options.attributeOldValue && !options.attributes ||

			// 1.3
			options.attributeFilter &&
			options.attributeFilter.length &&
			!options.attributes ||

			// 1.4
			options.characterDataOldValue && !options.characterData) {

			throw new SyntaxError();
		}

		let registrations = registrationsTable.get(target);
		if (!registrations) {
			registrations = [];
			registrationsTable.set(target, registrations!);
		}

		// 2
		// If target's list of registered observers already includes a registered
		// observer associated with the context object, replace that registered
		// observer's options with options.
		let registration: Registration | undefined;
		for (let i = 0; i < registrations!.length; i++) {
			if (registrations[i].observer as object === this) {
				registration = registrations[i];
				registration!.removeListeners();
				registration!.options = options;
				break;
			}
		}

		// 3.
		// Otherwise, add a new registered observer to target's list of registered
		// observers with the context object as the observer and options as the
		// options, and add target to context object's list of nodes on which it
		// is registered.
		// ReSharper disable once UsageOfPossiblyUnassignedValue
		if (!registration) {
			registration = new Registration(this as unknown as JSMutationObserverInternal, target, options);
			registrations!.push(registration);
			this.nodes.push(target);
		}

		registration!.addListeners();
	}

	public disconnect(): void {
		this.nodes.forEach((node: Node) => {
			const registrations = registrationsTable.get(node);
			if (registrations == null) return;

			for (let i = 0; i < registrations.length; i++) {
				const registration = registrations[i];
				if (registration.observer as object === this) {
					registration.removeListeners();
					registrations.splice(i, 1);
					// Each node can only have one registered observer associated with
					// this observer.
					break;
				}
			}
		});
		this.records_ = [];
	}

	public takeRecords(): JSMutationRecord[] {
		const copyOfRecords = this.records_;
		this.records_ = [];
		return copyOfRecords;
	}

	// ReSharper disable once InconsistentNaming
	private readonly callback_: MutationCallback;

	private readonly nodes: Node[];

	// ReSharper disable once InconsistentNaming
	private records_: JSMutationRecord[];

	private readonly uid_: number;
}

/**
 * Internal interface of JSMutaitonObserver with public properties
 */
interface JSMutationObserverInternal extends MutationObserver {
	// ReSharper disable once InconsistentNaming
	readonly callback_: MutationCallback;

	readonly nodes: Node[];

	// ReSharper disable once InconsistentNaming
	records_: JSMutationRecord[];

	// ReSharper disable once InconsistentNaming
	readonly uid_: number;
}

// ReSharper disable once InconsistentNaming
type JSMutationRecordType = "attributes" | "characterData" | "childList";

/**
 * Array based implementation of NodeList
 */
class JSArrayNodeList extends Array<Node> implements NodeList {
	constructor(items?: Array<Node>) {
		if (items) {
			super(...items);
		} else {
			super();
		}
	}

	public forEach(
		callbackfn: ((value: Node, index: number, array: Node[]) => void) | ((value: Node, key: number, parent: NodeList) => void),
		thisArg?: unknown): void {

		super.forEach(callbackfn as (value: Node, index: number, array: Node[]) => void, thisArg);
	}

	public item(index: number): Node {
		return this[index];
	}

	public copy(): JSArrayNodeList {
		return new JSArrayNodeList(this);
	}
}

// ReSharper disable once InconsistentNaming
class JSMutationRecord implements MutationRecord {
	constructor(
		public readonly type: JSMutationRecordType,
		public readonly target: Node) {
	}

	public addedNodes: JSArrayNodeList = new JSArrayNodeList();
	public removedNodes: JSArrayNodeList = new JSArrayNodeList();
	public previousSibling: Node | null = null;
	public nextSibling: Node | null  = null;
	public attributeName: string| null = null;
	public attributeNamespace: string| null = null;
	public oldValue: string| null = null;
}

function copyMutationRecord(original: JSMutationRecord): JSMutationRecord {
	const record = new JSMutationRecord(original.type, original.target);
	record.addedNodes = original.addedNodes.copy();
	record.removedNodes = original.removedNodes.copy();
	record.previousSibling = original.previousSibling;
	record.nextSibling = original.nextSibling;
	record.attributeName = original.attributeName;
	record.attributeNamespace = original.attributeNamespace;
	record.oldValue = original.oldValue;
	return record;
}

// We keep track of the two (possibly one) records used in a single mutation.
let currentRecord: JSMutationRecord | undefined;
let recordWithOldValue: JSMutationRecord | undefined;

/**
 * Creates a record without |oldValue| and caches it as |currentRecord| for
 * later use.
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecord(type: JSMutationRecordType, target: Node): JSMutationRecord {
	return currentRecord = new JSMutationRecord(type, target);
}

/**
 * Gets or creates a record with |oldValue| based in the |currentRecord|
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecordWithOldValue(oldValue: string | null): JSMutationRecord {
	if (recordWithOldValue)
		return recordWithOldValue;
	recordWithOldValue = copyMutationRecord(currentRecord!);
	recordWithOldValue.oldValue = oldValue;
	return recordWithOldValue;
}

function clearRecords(): void {
	currentRecord = recordWithOldValue = undefined;
}

/**
 * @param {MutationRecord} record
 * @return {boolean} Whether the record represents a record from the current
 * mutation event.
 */
function recordRepresentsCurrentMutation(record: JSMutationRecord): boolean {
	return record === recordWithOldValue || record === currentRecord;
}

/**
 * Selects which record, if any, to replace the last record in the queue.
 * This returns |null| if no record should be replaced.
 *
 * @param {MutationRecord} lastRecord
 * @param {MutationRecord} newRecord
 * @param {MutationRecord}
 */
function selectRecord(lastRecord: JSMutationRecord, newRecord: JSMutationRecord): JSMutationRecord | null {
	if (lastRecord === newRecord)
		return lastRecord;

	// Check if the the record we are adding represents the same record. If
	// so, we keep the one with the oldValue in it.
	if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
		return recordWithOldValue;

	return null;
}

/**
 * Class used to represent a registered observer.
 */
class Registration implements EventListenerObject {
	private transientObservedNodes: Node[];

	constructor(public observer: JSMutationObserverInternal, public target: Node, public options: MutationObserverInit) {
		this.transientObservedNodes = [];
	}

	public enqueue(record: JSMutationRecord): void {
		const records = this.observer.records_;
		const length = records.length;

		// There are cases where we replace the last record with the new record.
		// For example if the record represents the same mutation we need to use
		// the one with the oldValue. If we get same record (this can happen as we
		// walk up the tree) we ignore the new record.
		if (records.length > 0) {
			const lastRecord = records[length - 1];
			const recordToReplaceLast = selectRecord(lastRecord, record);
			if (recordToReplaceLast) {
				records[length - 1] = recordToReplaceLast;
				return;
			}
		} else {
			scheduleCallback(this.observer);
		}

		records[length] = record;
	}

	public addListeners(): void {
		this.addListeners_(this.target);
	}

	// ReSharper disable once InconsistentNaming
	private addListeners_(node: Node): void {
		const options = this.options;
		if (options.attributes)
			node.addEventListener("DOMAttrModified", this, true);

		if (options.characterData)
			node.addEventListener("DOMCharacterDataModified", this, true);

		if (options.childList)
			node.addEventListener("DOMNodeInserted", this, true);

		if (options.childList || options.subtree)
			node.addEventListener("DOMNodeRemoved", this, true);
	}

	public removeListeners(): void {
		this.removeListeners_(this.target);
	}

	// ReSharper disable once InconsistentNaming
	public removeListeners_(node: Node): void {
		const options = this.options;
		if (options.attributes)
			node.removeEventListener("DOMAttrModified", this, true);

		if (options.characterData)
			node.removeEventListener("DOMCharacterDataModified", this, true);

		if (options.childList)
			node.removeEventListener("DOMNodeInserted", this, true);

		if (options.childList || options.subtree)
			node.removeEventListener("DOMNodeRemoved", this, true);
	}

	/**
	 * Adds a transient observer on node. The transient observer gets removed
	 * next time we deliver the change records.
	 * @param {Node} node
	 */
	public addTransientObserver(node: Node): void {
		// Don't add transient observers on the target itself. We already have all
		// the required listeners set up on the target.
		if (node === this.target)
			return;

		this.addListeners_(node);
		this.transientObservedNodes.push(node);
		let registrations = registrationsTable.get(node);
		if (!registrations) {
			registrations = [];
			registrationsTable.set(node, registrations!);
		}

		// We know that registrations does not contain this because we already
		// checked if node === this.target.
		registrations!.push(this);
	}

	public removeTransientObservers(): void {
		const transientObservedNodes = this.transientObservedNodes;
		this.transientObservedNodes = [];

		transientObservedNodes.forEach((node: Node) => {
			// Transient observers are never added to the target.
			this.removeListeners_(node);

			const registrations = registrationsTable.get(node);
			if (registrations == null) return;

			for (let i = 0; i < registrations.length; i++) {
				if (registrations[i] === this) {
					registrations.splice(i, 1);
					// Each node can only have one registered observer associated with
					// this observer.
					break;
				}
			}
		});
	}

	public handleEvent(e: MutationEvent): void {
		// Stop propagation since we are managing the propagation manually.
		// This means that other mutation events on the page will not work
		// correctly but that is by design.
		e.stopImmediatePropagation();

		switch (e.type) {
		case "DOMAttrModified":
			this.onDOMAttrModified(e);
			break;

		case "DOMCharacterDataModified":
			this.onDOMCharacterDataModified(e);
			break;

		case "DOMNodeRemoved":
			this.onDOMNodeRemoved(e);
			break;

		case "DOMNodeInserted":
			this.onDOMNodeInserted(e);
		}

		clearRecords();
	}


	// ReSharper disable once InconsistentNaming
	private onDOMAttrModified(e: MutationEvent): void {
		// http://dom.spec.whatwg.org/#concept-mo-queue-attributes

		const name = e.attrName;
		const namespace = e.relatedNode.namespaceURI!;
		const target = e.target as Node;

		// 1.
		const record = getRecord("attributes", target);
		record.attributeName = name;
		record.attributeNamespace = namespace;

		// 2.
		const oldValue =
			e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;

		forEachAncestorAndObserverEnqueueRecord(target,
			function(options): JSMutationRecord | undefined {
				// 3.1, 4.2
				// ReSharper disable once InconsistentFunctionReturns
				// ReSharper disable once EmptyReturnValueForTypeAnnotatedFunction
				if (!options.attributes)
					return;

				// 3.2, 4.3
				if (options.attributeFilter &&
					options.attributeFilter.length &&
					options.attributeFilter.indexOf(name) === -1 &&
					options.attributeFilter.indexOf(namespace) === -1) {
					// ReSharper disable once InconsistentFunctionReturns
					// ReSharper disable once EmptyReturnValueForTypeAnnotatedFunction
					return;
				}
				// 3.3, 4.4
				if (options.attributeOldValue)
					return getRecordWithOldValue(oldValue);

				// 3.4, 4.5
				return record;
			});
	}

	// ReSharper disable once InconsistentNaming
	private onDOMCharacterDataModified(e: MutationEvent): void {
		// http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
		const target = e.target as Node;

		// 1.
		const record = getRecord("characterData", target);

		// 2.
		const oldValue = e.prevValue;


		forEachAncestorAndObserverEnqueueRecord(target,
			function(options): JSMutationRecord | undefined {
				// 3.1, 4.2
				// ReSharper disable once InconsistentFunctionReturns
				// ReSharper disable once EmptyReturnValueForTypeAnnotatedFunction
				if (!options.characterData)
					return;

				// 3.2, 4.3
				if (options.characterDataOldValue)
					return getRecordWithOldValue(oldValue);

				// 3.3, 4.4
				return record;
			});

	}

	// ReSharper disable once InconsistentNaming
	private onDOMNodeRemoved(e: MutationEvent): void {
		this.addTransientObserver(e.target! as Node);
		this.onDOMNodeInserted(e);
	}

	// ReSharper disable once InconsistentNaming
	private onDOMNodeInserted(e: MutationEvent): void {
		// http://dom.spec.whatwg.org/#concept-mo-queue-childlist
		const target = e.relatedNode as Node;
		const changedNode = e.target as Node;
		let addedNodes: JSArrayNodeList;
		let removedNodes: JSArrayNodeList;
		if (e.type === "DOMNodeInserted") {
			addedNodes = new JSArrayNodeList([changedNode]);
			removedNodes = new JSArrayNodeList([]);
		} else {
			addedNodes = new JSArrayNodeList([]);
			removedNodes = new JSArrayNodeList([changedNode]);
		}
		const previousSibling = changedNode.previousSibling;
		const nextSibling = changedNode.nextSibling;

		// 1.
		const record = getRecord("childList", target);
		record.addedNodes = addedNodes;
		record.removedNodes = removedNodes;
		record.previousSibling = previousSibling;
		record.nextSibling = nextSibling;

		forEachAncestorAndObserverEnqueueRecord(target,
			function(options: MutationObserverInit): JSMutationRecord | undefined {
				// 2.1, 3.2
				// ReSharper disable once InconsistentFunctionReturns
				// ReSharper disable once EmptyReturnValueForTypeAnnotatedFunction
				if (!options.childList)
					return;

				// 2.2, 3.3
				return record;
			});
	}
}