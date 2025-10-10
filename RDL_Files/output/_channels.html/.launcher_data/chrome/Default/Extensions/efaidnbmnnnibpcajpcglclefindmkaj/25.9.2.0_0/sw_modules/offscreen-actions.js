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
import{OFFSCREEN_DOCUMENT_PATH as e}from"../common/constant.js";import{dcLocalStorage as t}from"../common/local-storage.js";import{common as n}from"./common.js";import{communicate as o}from"./communicate.js";import{Proxy as r}from"./proxy.js";import{util as s}from"./util.js";let i=null;i||(i=new function(){this.proxy=r.proxy.bind(this),this.getDocState=function(e){const n=t.getItem("filesData")||{};if(n.filePath)try{const t=new Map(JSON.parse(n.filePath));if(!t.has(e))return;return t.get(e)}catch(e){}},this.setupWorkerOffscreen=async function(o){if(t.getItem("rrv")){const r=n.getEnv(),i=`${e}?env=${r}&rrv=true`;await s.setupOffscreenDocument(i);const a=await chrome.runtime.sendMessage({main_op:"createIframeToLoadAjsWorker",target:"offscreen",rrvEnabled:!0,env:r}),c=t.getItem("lrrv");if(a.iframeLoaded&&c&&o&&!o.startup&&o.acceptRanges&&o.pdfSize>0){const e=this.getDocState(o.pdfURL)||{};chrome.runtime.sendMessage({main_op:"getLinearizedRendition",target:"offscreen",tabId:o.tabId,pdfURL:decodeURIComponent(o.pdfURL),pdfSize:o.pdfSize,docLastOpenState:e})}}},this.closeOffscreenDocument=function(){chrome.offscreen.closeDocument()},this.rapidRenditionResponse=function(e){delete e.main_op,e.content_op="rapidRenditionResponse",chrome.tabs.sendMessage(e.tabId,e)},this.rapidRenditionError=function(e){delete e.main_op,e.content_op="rapidRenditionError",chrome.tabs.sendMessage(e.tabId,e)},this.handleFgResponseFromCDN=async function(o){const r=o.response,i=JSON.parse(r);i.timestamp=Date.now(),t.setItem("ffResponse_anon",JSON.stringify(i));const a=n.getEnv(),c=`${e}?env=${a}`;await s.setupOffscreenDocument(c),setTimeout((()=>{chrome.runtime.sendMessage({main_op:"fgResponseFromCDN",target:"offscreen",response:JSON.stringify(i),iframeURL:n.getSignInUrl()})}),50)}}),o.registerHandlers({setupWorkerOffscreen:i.proxy(i.setupWorkerOffscreen),closeOffscreenDocument:i.proxy(i.closeOffscreenDocument),rapidRenditionResponse:i.proxy(i.rapidRenditionResponse),rapidRenditionError:i.proxy(i.rapidRenditionError),fgResponseFromCDN:i.proxy(i.handleFgResponseFromCDN)});export const offscreenActions=i;