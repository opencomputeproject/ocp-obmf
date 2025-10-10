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
import{analytics as e}from"../../../common/analytics.js";import{dcTabStorage as o}from"../tab-storage.js";export function sendFileBufferToViewerForDirectFlow(o,t,r,n){r.then((e=>{const r=e.downLoadEndTime,a=e.buffer,i=e.buffer.byteLength,c=e.mimeType,m=e.pdffilename||"document.doc";o.executeDirectVerb("executeDirectVerb",a,i,m,n,r,c,t.origin)})).catch((o=>{e.event("DCBrowserExt:Viewer:Error:DirectFlow:FileDownload:Failed")}))}export async function handlePostPDFConversionInDirectFlow(e,t,r){o.setItem("acrobatPromotionWorkflow","preview"),t+=`?pdfurl=${encodeURIComponent(r)}&pdffilename=${encodeURIComponent(e.data.fileName)}`;const n=(await chrome.tabs.getCurrent())?.id;chrome.tabs.update(n,{url:t})}export const isDirectFlowWithoutPreview=()=>"createpdf"===o.getItem("acrobatPromotionWorkflow");export async function handleUpsellCloseInDirectFlow(e){"gmail"===e?.data?.source&&"createpdf"===e?.data?.workflow&&(o.removeItem("acrobatPromotionWorkflow"),chrome.runtime.sendMessage({main_op:"get-welcome-pdf-url"}).then((e=>{chrome.tabs.update({url:e})})))}