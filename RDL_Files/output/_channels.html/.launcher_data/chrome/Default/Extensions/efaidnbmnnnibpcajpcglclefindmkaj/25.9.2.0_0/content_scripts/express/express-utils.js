/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property laws,
* including trade secret and or copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
class ExpressUtils{addFontToDocument=async()=>{if("true"===sessionStorage.getItem("adobeCleanFontAdded"))return;const e=chrome.runtime.getURL("browser/css/fonts/AdobeClean-Regular.otf"),t=chrome.runtime.getURL("browser/css/fonts/AdobeClean-Bold.otf"),s=new FontFace("AdobeClean-Regular",`url(${e})`),n=new FontFace("AdobeClean-Bold",`url(${t})`);document.fonts.add(s),document.fonts.add(n),await s.load(),await n.load(),sessionStorage.setItem("adobeCleanFontAdded","true")};isExpressFteTooltipSecond=async()=>{const{env:e}=await chrome.storage.local.get("env");if("prod"===e)return!1;return!!new URLSearchParams(window.location.search).has("expressFteTooltipSecond")};sendAnalyticsEvent=e=>{try{chrome.runtime.sendMessage({main_op:"analytics",analytics:e})}catch(e){}};sendAnalyticsEventOncePerDay=e=>{try{const t=(new Date).toISOString().split("T")[0];chrome.storage.local.get(["expressEventsLastSent"],(s=>{let n=s.expressEventsLastSent||{};for(const s of e){const[e,o]=s;n[e]!==t&&(this.sendAnalyticsEvent(s),n[e]=t)}chrome.storage.local.set({expressEventsLastSent:n})}))}catch(e){}};getElementsFromClassNames(e,t){const s=[];for(const n of t){const t=e?.getElementsByClassName?.(n);t&&s.push(...t)}return s}}const expressUtils=new ExpressUtils;export default expressUtils;