// ReSharper disable InconsistentNaming
export const NV_CHROME_WORKTIME_VIOLATION = "nv:chrome:WorkTime.Violation";

export const HTML_DESIGNER_EVENT_NAMESPACE = "ui:chrome:Document";
export const HTML_ONAPP_EVENT_NAMESPACE = "ui:chrome:OnApp:Document";

export const DOM_EVENT_NAMESPACE = "ui:chrome:OnApp:Dom";

export const VISIBLE_EVENT_NAME = getFullDomEventName("Visible");
export const INVISIBLE_EVENT_NAME = getFullDomEventName("Invisible");
// ReSharper restore InconsistentNaming

function getFullDomEventName(name: string): string {
	return DOM_EVENT_NAMESPACE + "." + name;
}
