import { getLogger } from "../utils/log";
import { EventCondition } from "./WacAPI";
import { Configuration } from "../common/configuration/Configuration";
import { PersistentConfiguration } from "./PersistentConfiguration";
import { transform } from "./ConfigurationManagerHelper";
import { IConfigurationManager } from "./IConfigurationManager";
import { IBackgroundManagerController } from "./IBackgroundManagerController";

const CONFIGURATION_STORAGE = "_AternityConfiguration_";

/**
 * Manages configurations from Agent and from WAC
 */
export class ConfigurationManager implements IConfigurationManager {
	private readonly agentConfiguration = new PersistentConfiguration(CONFIGURATION_STORAGE);
	private wacConfiguration?: Configuration;
	private wacActive: boolean = false;
	private manager?: IBackgroundManagerController;

	public initConfigurationManager(manager: IBackgroundManagerController): void {
		this.manager = manager;
	}

	public setAgentConfiguration(jsonString: string): void {
		getLogger().log("Received new configuration from Agent");
		this.agentConfiguration.parseAndSetConfiguration(jsonString);
		this.activateAgentConfigurationIfConfigured();
	}

	public setWacConfiguration(wacConfiguration: EventCondition[]): void {
		getLogger().log("Received new configuration from WAC", wacConfiguration);
		if (this.wacActive && this.manager != null) {
			this.manager.deactivate();
			this.wacConfiguration = transform(wacConfiguration);
			this.manager.activate(this.wacConfiguration);
		}
	}

	public setWacActive(active: boolean): void {
		this.wacActive = active;
		this.activateAgentConfigurationIfConfigured();
	}

	public resetConfiguration(): void {
		if (this.agentConfiguration != null) {
			this.agentConfiguration.clearConfiguration();
		}
	}

	public getConfiguration(): Configuration {
		return this.wacActive && this.wacConfiguration != null ? this.wacConfiguration : this.agentConfiguration.getConfiguration();
	}

	private activateAgentConfigurationIfConfigured(): void {
		if (!this.wacActive && this.manager != null) {
			this.manager.deactivate();
			this.manager.activate(this.agentConfiguration.getConfiguration());
		}
	}
}
