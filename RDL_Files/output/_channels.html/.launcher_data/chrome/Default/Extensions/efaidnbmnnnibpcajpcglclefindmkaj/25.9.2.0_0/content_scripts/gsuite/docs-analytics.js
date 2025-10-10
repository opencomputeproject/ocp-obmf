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
let gsuiteUtil;(async()=>{try{if(!await chrome.runtime.sendMessage({main_op:"getFloodgateFlag",flag:"dc-cv-docs-analytics-visited"}))return;gsuiteUtil||(gsuiteUtil=await import(chrome.runtime.getURL("content_scripts/gsuite/util.js")));const{pathname:t}=window.location;let e=null;if(t.startsWith("/document/")?e="Document":t.startsWith("/spreadsheets/")?e="Spreadsheet":t.startsWith("/presentation/")&&(e="Presentation"),!e)return;const s=`DCBrowserExt:DocsGoogle:Visited:${e}`;gsuiteUtil?.isAnalyticsSentInTheMonthOrSession(s)||gsuiteUtil?.sendAnalyticsOncePerMonth(s)}catch(t){gsuiteUtil?.sendErrorLog("Docs analytics error",t)}})();