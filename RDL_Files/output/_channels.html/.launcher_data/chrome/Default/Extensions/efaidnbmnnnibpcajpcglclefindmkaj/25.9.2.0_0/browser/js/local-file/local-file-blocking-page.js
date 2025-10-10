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
import{dcLocalStorage as e}from"../../../common/local-storage.js";import{LOCAL_FILE_PERMISSION_URL as t}from"../../../common/constant.js";import{events as o}from"../../../common/analytics.js";import{util as r}from"../../js/content-util.js";import{loggingApi as n}from"../../../common/loggingApi.js";const i="Error in Local File Prompt";async function a(){try{r.translateElements(".translate");const t=document.getElementById("local-file-animated-fte");t?t.style.backgroundImage="url(../../images/LocalizedFte/en_US/fte_old.svg)":n.error({message:i+"initialize: FTE element not found"});const o=document.getElementById("localFileBlockingPageOpenInChrome"),a=document.getElementById("localFilePromptContinueButton");o.addEventListener("click",c),a.addEventListener("click",l),await e.init()}catch(e){n.error({message:i,error:`initialize: Error in initialization: ${e}`})}}function c(){try{r.sendAnalytics(o.LOCAL_FILE_OPEN_IN_CHROME_CLICKED),window.history.back()}catch(e){n.error({message:i,error:`handleOpenFileInChromeClick: Error in openInChrome button click handler: ${e}`})}}async function l(){try{r.sendAnalytics(o.LOCAL_FTE_GO_TO_SETTINGS_CLICKED),chrome.tabs.create({url:t},(t=>{chrome.runtime.lastError?n.error({message:i,error:"handleSwitchToAcrobatClick: Error creating tab"}):(e.setItem("settingsWindow",{id:t.id}),window.history.back())}))}catch(e){n.error({message:i,error:`handleSwitchToAcrobatClick: Error in switchToAcrobat button click handler: ${e}`})}}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",a):a();