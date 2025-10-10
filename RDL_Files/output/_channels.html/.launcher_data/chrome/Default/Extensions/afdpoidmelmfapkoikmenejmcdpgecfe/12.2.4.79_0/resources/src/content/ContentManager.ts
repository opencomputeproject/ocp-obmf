import { getLogger } from "../utils/log";
import * as Utils from "../utils/utils";
import { doAfterDomReady } from "../dom/DomUtils";
import * as PropertyTransformer from "../HtmlEvents/PropertyTransformer";
import { HtmlEventsMonitor } from "../HtmlEvents/HtmlEventsMonitor";
import { VisibilityEventsMonitor } from "../HtmlEvents/VisibilityEventsMonitor";
import { Configuration } from "../common/configuration/Configuration";
import { BackgroundPageInformation } from "../common/PageInformation";
import { ExecutionLimiter, TotalRunningTimeStatistics } from "../performance/ExecutionLimiter";
import { ExecutionLimits } from "../performance/ExecutionLimits";
import { DocumentTitleManager } from "../DocumentTitle/DocumentTitleManager";
import {
	ReadonlyConfigurationData,
	ConfigurationData,
	ContentScriptParameters
} from "../common/ConfigurationData";

interface GeneralStatistics {
	url: string;
	type: string;
	totalRunningTime: number;
	timeFrame: number;
}

interface TaggedStatistics {
	url: string;
	type: string;
	totalRunningTime: number;
	taggedTotalRunningTime: { [tag: string]: TotalRunningTimeStatistics; };
	timeFrame: number;
}

function createExecutionLimiter(pageConfigurationData: ReadonlyConfigurationData): ExecutionLimiter {
	const executionLimits = new ExecutionLimits();
	for (const workTimeThreshold of pageConfigurationData.WorkTimeThresholds) {
		executionLimits.addLimit(workTimeThreshold.WorkTime, workTimeThreshold.TimeFrame);
	}

	return new ExecutionLimiter(executionLimits, pageConfigurationData.BackoffGracePeriodMs);
}

export class ContentManager {
	private readonly pageInformation: BackgroundPageInformation;
	private visibilityEventsMonitor?: VisibilityEventsMonitor;
	private readonly htmlEventsMonitor: HtmlEventsMonitor;
	private readonly documentTitleManager: DocumentTitleManager;
	private readonly configuration: Configuration;
	private readonly executionLimiter: ExecutionLimiter;

	/**
	 * Configure manager with the given parameters.
	 */
	constructor(parameters: Readonly<ContentScriptParameters>) {
		if (parameters == null) {
			getLogger().error("No callback parameters arrived from background script");
			throw new Error("No callback parameters arrived from background script");
		}

		if (parameters.configurationData == null) {
			getLogger().error("No configuration arrived from background script");
			throw new Error("No configuration arrived from background script");
		}

		if (parameters.pageInformation == null) {
			getLogger().error("No pageInformation data arrived from background script");
			throw new Error("No pageInformation data arrived from background script");
		}

		getLogger().info("Got main parameters", parameters);
		getLogger().info("Configuration", parameters.configurationData, document.URL);

		// Initialize if was not initialized.
		this.pageInformation = parameters.pageInformation;
		this.documentTitleManager = new DocumentTitleManager(
			parameters.documentTitle,
			parameters.pageInformation.frameId);

		// Prepare configuration
		const configurationData = Utils.deepClone(parameters.configurationData) as ConfigurationData;
		PropertyTransformer.amendConfigurationData(configurationData);
		this.configuration = new Configuration(parameters.configurationData);

		this.executionLimiter = createExecutionLimiter(parameters.configurationData);

		this.htmlEventsMonitor = new HtmlEventsMonitor(
			this.configuration,
			this.pageInformation,
			this.executionLimiter,
			this.documentTitleManager);

		doAfterDomReady(() => {
			try {
				this.visibilityEventsMonitor = new VisibilityEventsMonitor(
					this.configuration,
					this.pageInformation,
					this.executionLimiter,
					this.documentTitleManager);
			} catch (e) {
				getLogger().error("Cannot initialize DomEvents", e);
			}
		});
	}

	public uninitialize(): void {
		this.htmlEventsMonitor.uninitialize();
		if (this.visibilityEventsMonitor != null) {
			this.visibilityEventsMonitor.uninitialize();
		}
	}

	/**
	 * @return Configuration for this page
	 */
	public getConfiguration(): Configuration {
		return this.configuration;
	}

	/**
	 * @return How much time extension worked in which period.
	 */
	public getStatistics(): GeneralStatistics {
		return {
			url: document.URL,
			type: this.pageInformation.frameId === 0 ? "document" : "frame",
			totalRunningTime: this.executionLimiter.getTotalRunningTime(),
			timeFrame: this.executionLimiter.getMaxTimeFrame()
		};
	}

	/**
	 * @return How much time extension worked in which period.
	 */
	public getTaggedStatistics(): TaggedStatistics {
		return {
			url: document.URL,
			type: this.pageInformation.frameId === 0 ? "document" : "frame",
			totalRunningTime: this.executionLimiter.getTotalRunningTime(),
			taggedTotalRunningTime: this.executionLimiter.getTaggedTotalRunningTime(),
			timeFrame: this.executionLimiter.getMaxTimeFrame()
		};
	}
}
