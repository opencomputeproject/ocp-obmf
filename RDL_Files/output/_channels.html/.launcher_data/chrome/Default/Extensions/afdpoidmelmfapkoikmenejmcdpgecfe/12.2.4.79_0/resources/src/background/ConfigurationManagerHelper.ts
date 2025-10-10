import { EventCondition } from "./WacAPI";
import {
	ConditionsPerEvent,
	EventsPerPropertyValue,
	PropertyMatch,
	ReadonlyConfigurationData,
	STARTING_CONFIGURATION
} from "../common/ConfigurationData";
import { deepClone, populate } from "../utils/utils";
import { Configuration } from "../common/configuration/Configuration";

function createConsolidatedEventConfig(eventConditions: EventCondition[]): EventsPerPropertyValue[] {
	return eventConditions.map((eventCondition: EventCondition) => {
		const conditions: { [property: string]: PropertyMatch[]; } = {};
		const eventName = eventCondition.event;
		const committedUrl: string = eventCondition.conditionProperties.filter(value => value.property === "documentCommittedUrl")[0].value;
		for (const {value, matchType, property} of eventCondition.conditionProperties) {
			if (conditions[property] == null) {
				conditions[property] = [];
			}
			conditions[property].push({MatchType: matchType, Value: value});
		}
		const eventsPerPropertyValue: EventsPerPropertyValue = {};
		eventsPerPropertyValue[committedUrl] = {};
		eventsPerPropertyValue[committedUrl][eventName] = [{Conditions: conditions}];
		return eventsPerPropertyValue;
	});
}

/**
 * Makes configuration readable by agent
 * @param eventsPerProperty
 */
export function transform(eventsPerProperty: EventCondition[]): Configuration {
	const eventsPerPropertyValue: EventsPerPropertyValue = {};
	const eventConfig: ConditionsPerEvent = {};
	const consolidatedEventConfig: EventsPerPropertyValue[] = createConsolidatedEventConfig(eventsPerProperty);

	for (const event of consolidatedEventConfig) {
		// get documentCommittedUrl
		const documentCommittedUrl = Object.keys(event)[0];
		if (eventsPerPropertyValue[documentCommittedUrl] == null) {
			eventsPerPropertyValue[documentCommittedUrl] = {};
		}
		const conditionsPerEvent: ConditionsPerEvent = event[documentCommittedUrl];
		for (const eventName of Object.keys(conditionsPerEvent)) {
			if (eventConfig[eventName] == null) {
				eventConfig[eventName] = conditionsPerEvent[eventName];
			}
			if (eventsPerPropertyValue[documentCommittedUrl][eventName] == null) {
				const conditionPerEventCopy = deepClone(conditionsPerEvent);
				eventsPerPropertyValue[documentCommittedUrl][eventName] = conditionPerEventCopy[eventName];
			} else {
				// tslint:disable-next-line:no-any
				for (const conditionName of Object.keys(conditionsPerEvent[eventName][0].Conditions)) {
					const propertyMatch: PropertyMatch = conditionsPerEvent[eventName][0].Conditions[conditionName][0];
					if (conditionName === "aternityCSSSelector" || conditionName === "documentCommittedUrl") {
						if (conditionName !== "documentCommittedUrl") {
							eventsPerPropertyValue[documentCommittedUrl][eventName][0].Conditions[conditionName].push(propertyMatch);
						}
						eventConfig[eventName][0].Conditions[conditionName].push(propertyMatch);
					}
				}
			}
		}
	}

	// creating new empty configuration
	const configurationData = deepClone(STARTING_CONFIGURATION);
	// update new configuration data with data received from WAC
	populate({
		ConsolidatedEventConfig: {
			documentCommittedUrl: eventsPerPropertyValue
		}, EventConfig: eventConfig,
		WorkTimeThresholds: [
			{WorkTime: 300, TimeFrame: 1000},
			{WorkTime: 1500, TimeFrame: 10000},
			{WorkTime: 3000, TimeFrame: 60000}
		]
	}, configurationData);

	return new Configuration(configurationData);
}