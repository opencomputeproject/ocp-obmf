import { ReadonlyConfigurationData } from "../common/ConfigurationData";
import { Configuration } from "../common/configuration/Configuration";

export interface IPersistentConfiguration {
	parseAndSetConfiguration(configurationString: string): void;
	getConfiguration(): Configuration;
	clearConfiguration(): void;
	setConfiguration(configurationData: ReadonlyConfigurationData): void;
}