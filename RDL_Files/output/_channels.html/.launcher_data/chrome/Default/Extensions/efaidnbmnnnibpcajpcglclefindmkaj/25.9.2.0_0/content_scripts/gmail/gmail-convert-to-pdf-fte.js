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
const GMAIL_CONVERT_TO_PDF_NATIVE_VIEWER="acrobat-native-viewer-prompt",GMAIL_CONVERT_TO_PDF_VERB_FTE_TOOLTIP_STORAGE_KEY="acrobat-gmail-convert-to-pdf-verb-fte-config",GMAIL_CONVERT_TO_PDF_VERB_FTE_TOOLTIP_CONTAINER_CLASS="acrobat-fte-tooltip-container-convertToPdf",SOURCE="Gmail",WORKFLOW="ConvertToPdf";class GmailConvertToPdfFte{id="GmailConvertToPdfFte";timeout=3e3;static GMAIL_DOMAINS=["mail.google.com"];constructor(){const t=window.location.hostname;if(!GmailConvertToPdfFte.GMAIL_DOMAINS.some((e=>t.includes(e))))return this.isEligible=async()=>!1,void(this.render=async()=>{});this.initPromise=this.loadServices()}async loadServices(){[this.fteUtils,this.state,this.gmailFteService]=await Promise.all([import(chrome.runtime.getURL("content_scripts/gsuite/fte-utils.js")),import(chrome.runtime.getURL("content_scripts/gmail/state.js")).then((t=>t.default)),import(chrome.runtime.getURL("content_scripts/gmail/gmail-fte-service.js"))])}async render(){this.gmailFteService?.addFTE("acrobat-native-viewer-prompt","acrobat-fte-tooltip-container-convertToPdf","acrobat-gmail-convert-to-pdf-verb-fte-config",this.state?.gmailConvertToPdfConfig,"convertToPdf",SOURCE,WORKFLOW)}async initFteStateAndConfig(){let t={count:0,nextDate:(new Date).getTime()};return t=(await chrome.storage.local.get("acrobat-gmail-convert-to-pdf-verb-fte-config"))?.["acrobat-gmail-convert-to-pdf-verb-fte-config"]||t,chrome.storage.local.set({[GMAIL_CONVERT_TO_PDF_VERB_FTE_TOOLTIP_STORAGE_KEY]:t}),t}async isEligible(){const t=await chrome.runtime.sendMessage({main_op:"gmail-convert-to-pdf-init"});if(!t?.enableConvertToPdfTouchpointInGmail)return!1;await this.initPromise;const e=await this.initFteStateAndConfig(),i=t?.fteConfig?.tooltip,o=t?.enableGmailConvertToPdfFteToolTip,a=document.getElementsByClassName("acrobat-native-viewer-prompt");return a?.length>0&&await(this.fteUtils?.shouldShowFteTooltip(i,e,o))}}