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
let gsuiteUtil;(async()=>{if(!await chrome.runtime.sendMessage({main_op:"getFloodgateFlag",flag:"dc-cv-onenote-analytics-visited"}))return;try{const t=await(async()=>(gsuiteUtil||(gsuiteUtil=await import(chrome.runtime.getURL("content_scripts/gsuite/util.js"))),gsuiteUtil))();if((()=>{const t=window.top!==window.self,e="onenote.officeapps.live.com"===window?.location?.hostname;return t&&e})()){const e="DCBrowserExt:OneNote:Visited";t?.isAnalyticsSentInTheMonthOrSession(e)||t?.sendAnalyticsOncePerMonth(e)}}catch(t){gsuiteUtil?.sendErrorLog("OneNote analytics error",t)}})();