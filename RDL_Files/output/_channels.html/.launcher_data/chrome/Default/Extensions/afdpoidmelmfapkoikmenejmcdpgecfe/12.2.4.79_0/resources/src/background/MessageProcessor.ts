"use strict";

import { Configuration } from "../common/configuration/Configuration";
import * as Consts from "../common/consts";
import { UXData } from "../common/UXData";
import { getLogger } from "../utils/log";
import * as Utils from "../utils/utils";
import { Lazy } from "../utils/lazy";
import { PostNativeMessageOptions } from "./IAgentCommunication";
import { OutgoingEventMessageData } from "../common/MessagingModel";
import Primitive = Utils.Primitive;

export class MessageProcessor {
	private static readonly DEFAULT_POST_NATIVE_MESSAGE_OPTIONS: PostNativeMessageOptions = {
		forcePost: false
	};

	constructor(private readonly configuration: Configuration) {
	}

	/*
	 * @return true if event is in the event filters list and it has all required properties
	 * for this event.
	 */
	public isEventMonitored(message: OutgoingEventMessageData<UXData>): boolean {
		// Validate message and event
		if (message.Data == null ||
			message.Data[0] == null ||
			!this.configuration.hasEventFilter(message.EventType)) {
			return false;
		}

		// WebRequest required properties
		if (Consts.WEBREQUEST_EVENT_RE.test(message.EventType)) {
			const data = message.Data[0];

			if (!Consts.WEBREQUEST_REQUIRED_PROPERTIES.some(
				properties => properties.every(p => this.isMatchEvent(message.EventType, p, data[p])))) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Call isMatchEvent with check for null or undefined.
	 */
	private isMatchEvent<T>(eventName: string, propertyName: string, input: T): boolean {
		if (input == null) return false;

		return this.configuration.isMatchEvent(
			eventName,
			propertyName,
			// tslint:disable-next-line no-unsafe-any
			input.toString());
	}

	/**
	 * @return Whether property is not truncated.
	 */
	private isNonTruncated(name: string): boolean {
		// All aternity properties are not truncated.
		return Utils.startsWith(name, "aternity");
	}

	/**
	 * Convert and filter array values.
	 * The string returned doesn't have the precise size of maxPropertyLength due to JSON format.
	 */
	private processMessageDataArray(
		eventType: string,
		name: string,
		array: ReadonlyArray<Primitive>,
		options: PostNativeMessageOptions): string | undefined {

		const valueStr = new Lazy(() => {
			const newArray: string[] = [];
			let remainingChars = this.isNonTruncated(name)
				? Infinity
				: this.configuration.maxPropertyLength;

			// Go over all the elements
			for (const element of array) {
				if (!Utils.isSerializablePrimitive(element)) {
					getLogger().error("Unsupported type in array", element);
					continue;
				}

				// ReSharper disable once TsResolvedFromInaccessibleModule
				const objAtElement = element.toString();
				const objAtElementLength = objAtElement.length;

				newArray.push(objAtElement.substr(0, remainingChars));
				// Add 3 more characters, it is the average length for each element: ",".
				remainingChars -= objAtElementLength + 3;

				// If no chars remaining, break
				if (remainingChars <= 0) {
					break;
				}
			}

			return JSON.stringify(newArray);
		});

		// Test property
		return options.forcePost || this.configuration.isMatchEvent(eventType, name, valueStr) ?
			valueStr.getValue() :
			undefined;
	}

	private processMessageDataValue(
		eventType: string,
		name: string,
		value: Primitive,
		options: PostNativeMessageOptions): string | undefined {
		if (!Utils.isSerializablePrimitive(value)) {
			return undefined;
		}

		// Convert
		const valueStr = new Lazy(() => {
			let result = value.toString();

			// Do not truncate aternity properties.
			if (!this.isNonTruncated(name)) {
				result = result.substr(0, this.configuration.maxPropertyLength);
			}

			return result;
		});


		// Test property
		return options.forcePost || this.configuration.isMatchEvent(eventType, name, valueStr) ?
			valueStr.getValue() :
			undefined;
	}

	/**
	 * Converts a property to string representation.
	 * @return Converted property or undefined if it doesn't match filters.
	 */
	private processMessageDataProperty(
		eventType: string,
		name: string,
		value: ReadonlyArray<Primitive> | Primitive,
		options: PostNativeMessageOptions): string | undefined {
		if (Array.isArray(value)) {
			return this.processMessageDataArray(eventType, name, value, options);
		} else {
			return this.processMessageDataValue(eventType, name, value as Primitive, options);
		}
	}

	public processMessageDataObject(
		eventType: string,
		data: UXData,
		options: PostNativeMessageOptions = MessageProcessor.DEFAULT_POST_NATIVE_MESSAGE_OPTIONS): void {
		Utils.rewriteObject(
			data,
			(n: string, v: Primitive | ReadonlyArray<Primitive>) => this.processMessageDataProperty(eventType, n, v, options),
			false);
	}

	/**
	 * Converts every property to string representation and removes unmatched ones.
	 * If the property matches, then it is trimmed to Configuration.maxPropertyLength.
	 */
	public processMessageData(
		messageData: OutgoingEventMessageData<UXData>,
		options: PostNativeMessageOptions = MessageProcessor.DEFAULT_POST_NATIVE_MESSAGE_OPTIONS): void {
		for (const data of messageData.Data) {
			this.processMessageDataObject(messageData.EventType, data, options);
		}
	}
}
