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
import{communicate as e}from"./communicate.js";import{Proxy as t}from"./proxy.js";import{analytics as o}from"../common/analytics.js";import{common as r}from"./common.js";import{util as n}from"./util.js";import{dcLocalStorage as s}from"../common/local-storage.js";import{floodgate as i}from"./floodgate.js";import{CACHE_PURGE_SCHEME as c}from"./constant.js";var a=null;let l=["word-to-pdf","png-to-pdf","jpg-to-pdf","excel-to-pdf","ppt-to-pdf","pdf-to-ppt","pdf-to-excel","pdf-to-image","pdf-to-word","compress-pdf","createpdf","reorder-pages","rotate-pages","delete-pages","split-pdf","extract-pages","insert-pdf","protect-pdf","crop-pages","number-pages","add-comment","ocr-pdf","sendforsignature","fillsign","combine-pdf","chat-pdf"];a||(a=new function(){this.proxy=t.proxy.bind(this),this.LOG=(...e)=>r.LOG(...e),this.isGoogleQuery=function(e){try{const t=new URL(e.url);if(t.host.startsWith("www.google.")||t.host.startsWith("www.bing."))return!0}catch(e){return!1}return!1},this.getSearchQuery=function(e){try{const t=new URL(e.url).searchParams.get("q");if(t)return decodeURIComponent(t)}catch(e){return o.event(o.e.GOOGLE_URL_DECODE_ERROR),null}return null},this.mapQueryStringToAction=function(t,i){const c=s.getItem("appLocale"),a=chrome.i18n.getMessage("@@ui_locale"),l=c||n.getFrictionlessLocale(a);if(null==l)return;const p=chrome.runtime.getURL("browser/data/searchterms.json");fetch(p).then((e=>{if(e.status>=200&&e.status<=299)return e.json();throw o.event(o.e.GOOGLE_SEARCHTERM_FETCH_ERROR),Error(o.e.GOOGLE_SEARCHTERM_FETCH_ERROR)})).then((async o=>{const n=this.findAction(o,t);this.validLocale(n)&&(i.pdf_action=n,i.frictionless_uri=r.getFrictionlessUri(),i.env=r.getEnv(),i.panel_op="load-frictionless",i.frame_visibility="hidden",i.frictionless_workflow="search",i.locale=l,e.sendMessage(i))})).catch((e=>{n.consoleError("googlequeryanalyzer::mapQueryStringToAction",e)}))},this.validLocale=function(e){const t=chrome.i18n.getMessage("@@ui_locale");return"chat-pdf"==e?n.getFrictionlessLocaleChatPdf(t):"ocr-pdf"!=e||n.getFrictionlessLocaleOcrPdf(t)},this.findAction=function(e,t){const r=(" "+t.replace(/^\s+|\s+$/g,"").replace(/\s+/g," ")+" ").toLowerCase();for(let t=0;t<l.length;++t){const n=l[t],s=e[n]||[];for(let e=0;e<s.length;e++)if(r.includes(s[e]))return i.hasFlag("dc-cv-frictionless-false-positive-test",c.NO_CALL).then((()=>{o.event(`${o.e.GOOGLE_SEARCHTERM_FOUND_MATCH}:${n}:${s[e]}:${chrome.i18n.getMessage("@@ui_locale")}`)})),n}return null}});export const googleQueryAnalyzer=a;