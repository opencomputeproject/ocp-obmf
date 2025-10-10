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
import{util as e}from"../js/content-util.js";import{events as t}from"../../common/analytics.js";import{dcSessionStorage as n,dcLocalStorage as a}from"../../common/local-storage.js";import{OptionPageActions as s,OptionsPageSource as o}from"../../common/constant.js";import{sendPingEventHandler as i}from"../../common/util.js";await n.init(),chrome.runtime.sendMessage({main_op:"getFloodgateFlag",flag:"dc-cv-genai-markers-impression-analytics",cachePurge:"NO_CALL"},(n=>{n&&e.sendAnalytics(t.AI_ASSISTANT_SUMMARY_PILL_SHOWN)})),window.addEventListener("message",(e=>{"exit"===e.data.action&&document.querySelector(".popup").classList.add("exit")})),$(document).ready((()=>{e.translateElements(".translate");const m=e.getSearchParamFromURL("pdfMarkerLink",window.location.href);!function(e){const t=document.getElementById("assitantPopup");"dark"===e?t.setAttribute("data-theme","dark"):t.setAttribute("data-theme","light")}(e.getSearchParamFromURL("theme",window.location.href)),async function(e){"false"===(await chrome.storage.local.get("pdfViewer"))?.pdfViewer&&chrome.runtime.sendMessage({main_op:"hideAIMarkerPopup",href:e})}(m),function(e){chrome.runtime.sendMessage({main_op:"logOverlappingElements",elementRect:document.querySelector(".popup")?.getBoundingClientRect(),link:e})}(m),$("#getSummary").click((()=>{e.sendAnalytics(t.AI_ASSISTANT_SUMMARY_CTA_CLICKED),n.setWithTTL("pdfMarkerAction",!0,5e3),m&&(i(),chrome.runtime.sendMessage({main_op:"openPDFInNewTab",url:m}))}));let r=!1;$("#menu").click((()=>{r=!r,r?($("#menu").attr("src","../images/SDC_Close_18_N.svg"),$("#menu").addClass("active"),$(".menuList").show(),e.sendAnalytics(t.AI_ASSISTANT_MENU_DROPDOWN_SHOWN)):($("#menu").attr("src","../images/SDC_ShowMenu_18_N.svg"),$("#menu").removeClass("active"),$(".menuList").hide()),chrome.runtime.sendMessage({main_op:"updateIframeHeight",href:m,menuOpen:r})})),$("#menuItem1").click((()=>{e.sendAnalytics(t.AI_ASSISTANT_MENU_HIDE_FOR_SESSION_CLICKED),chrome.runtime.sendMessage({main_op:"hideAIMarkerPopup",href:m})})),$("#menuItem2").click((()=>{e.sendAnalytics(t.AI_ASSISTANT_MENU_SETTINGS_CLICKED),a.setItem("optionsPageSource",o.AI_CONTEXTUAL_MENU),chrome.runtime.openOptionsPage((e=>{setTimeout((()=>{chrome.runtime.sendMessage({requestType:s.OPTIONS_HIGHLIGHT_SECTION,sectionClassNames:["ai-contextual-menu-section","ai-contextual-menu-toggle"]})}),100)}))}))}));