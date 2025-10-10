"use strict";

import { getLogger } from "../utils/log";
import { Configuration } from "../common/configuration/Configuration";
import * as Utils from "../utils/utils";
import { IPersistentConfiguration } from "./IPersistentConfiguration";
import {
	EMPTY_CONFIGURATION,
	ConfigurationData,
	CONFIGURATION_VERSION,
	ReadonlyConfigurationData
} from "../common/ConfigurationData";

/**
 * Stores and loads configuration from persistent storage.
 */
export class PersistentConfiguration implements IPersistentConfiguration {
	private configuration: Configuration = new Configuration(Utils.deepClone(EMPTY_CONFIGURATION));

	/**
	 * Load configuration from the localStorage if exists.
	 * Use default configuration if no configuration was stored.
	 *
	 * @param storageKey {string} Key used for configuration storage in localStorage object.
	 */
	constructor(private readonly storageKey: string) {
		// Set configuration from the local storage

		// mv3 change - Tested
		const p = this.myInit(storageKey);
	}
	// mv3
	private async myInit(storageKey: string): Promise<void> {
		await chrome.storage.local.get(null)
			.then((items) => {
				this.parseAndSetConfiguration(String(items.storageKey));
			})
			.catch((response) => getLogger().error(response));
	}

	/**
	 * Parse configuration string and update configuration if successfully parsed.
	 * If configuration string is invalid, set default configuration.
	 */
	public parseAndSetConfiguration(configurationString: string | null): void {
		// Start with default
		const configurationData = Utils.deepClone(EMPTY_CONFIGURATION);
		if (configurationString != null && configurationString.length > 0) {
			let parsedConfiguration: ConfigurationData;
			try {
				// tslint:disable-next-line no-unsafe-any
				parsedConfiguration = JSON.parse(configurationString);
			} catch (e) {
				getLogger().error("Failed parsing configuration", configurationString);
				return;
			}

			Utils.populate(parsedConfiguration, configurationData);
		}

		this.setConfigurationImpl(configurationData);
	}

	public setConfiguration(configurationData: Partial<ReadonlyConfigurationData>): void {
		let newConfigurationData: Partial<ReadonlyConfigurationData>;

		// Validate version
		if (configurationData == null) {
			getLogger().log("No configuration found, using empty");
			newConfigurationData = Utils.deepClone(EMPTY_CONFIGURATION);
		} else if (configurationData.ConfigurationVersion !== CONFIGURATION_VERSION) {
			getLogger().log("Found configuration in old format, using empty");
			newConfigurationData = Utils.deepClone(EMPTY_CONFIGURATION);
		} else {
			getLogger().log("Set new configuration", configurationData);
			newConfigurationData = Utils.deepClone(configurationData);
		}

		this.setConfigurationImpl(newConfigurationData);
	}

	/**
	 * Set configuration implementation.
	 */
	private setConfigurationImpl(configurationData: Partial<ReadonlyConfigurationData>): void {
		const resultingConfigurationData = Utils.deepClone(configurationData);

		// Do not allow negative values.
		if (resultingConfigurationData.MaxPropertyLength != null &&
			resultingConfigurationData.MaxPropertyLength < 0) {
			resultingConfigurationData.MaxPropertyLength = 0;
		}

		this.configuration = new Configuration(resultingConfigurationData);

		// Store locally
		// oroginal
		// localStorage.setItem(this.storageKey, JSON.stringify(configurationData));

		// chrome.storage.local.set([this.storageKey], JSON.stringify(configurationData));

		// const storageKey = this.storageKey;
		const config = JSON.stringify(configurationData);
		const promise = chrome.storage.local.set({storageKey: config});
	}

	public clearConfiguration(): void {
		this.setConfiguration(EMPTY_CONFIGURATION);
	}

	public getConfiguration(): Configuration {
		return this.configuration;
	}

	/**
	 * Serialized configuration object.
	 */
	public getSerializedConfiguration(): string | null {
		// mv3
		let storageKeyValue = "";
		// chrome.storage.local.get([this.storageKey], ( items) => {storageKeyValue = String(items[this.storageKey]);
		// 	return storageKeyValue;
		// });

		const promise = chrome.storage.local.get([this.storageKey]);

		promise.then(value => storageKeyValue = String(value[this.storageKey])).catch(reason => getLogger().error("storage key error", reason));

		return storageKeyValue;
		// original
		// return localStorage.getItem(this.storageKey);
	}

	public static clearPersistentConfiguration(storageKey: string): void {
		// mv3
		const promise = chrome.storage.local.remove(storageKey).catch(reason => getLogger().error("storage key remove error", reason));

		// localStorage.removeItem(storageKey);
	}
}
