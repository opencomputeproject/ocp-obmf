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
const LINKEDIN_FTE_STATE_STORAGE_KEY="acrobat-linkedin-fte-state";let linkedinTouchPointAddedPromiseResolve,linkedinTouchPointAddedPromise=new Promise((i=>{linkedinTouchPointAddedPromiseResolve=i}));class LinkedInFte{id="linkedinfte";timeout=2e3;static LINKEDIN_DOMAINS=["www.linkedin.com"];constructor(){const i=window.location.hostname;if(!LinkedInFte.LINKEDIN_DOMAINS.some((e=>i.includes(e))))return this.isEligible=async()=>!1,void(this.render=async()=>{});this.initPromise=this.loadServices()}async loadServices(){[this.fteUtils]=await Promise.all([import(chrome.runtime.getURL("content_scripts/gsuite/fte-utils.js"))])}async render(){chrome.runtime.sendMessage({main_op:"linkedin-fte-render",frameId:this.frameId})}isTouchPointPresent(){return linkedinTouchPointAddedPromise}isTouchPointPositionAllowsForFTE(i){return!(i?.top<0||i?.left<0||i?.bottom+50>window.innerHeight||i?.right>window.innerWidth)}async initFteStateAndConfig(){let i={count:0};return i=(await chrome.storage.local.get("acrobat-linkedin-fte-state"))?.["acrobat-linkedin-fte-state"]||i,chrome.storage.local.set({[LINKEDIN_FTE_STATE_STORAGE_KEY]:i}),i}async isEligible(){const i=await chrome.runtime.sendMessage({main_op:"linkedin-init"});if(!i?.enableLinkedinPDFTouchPoint)return!1;await this.initPromise;const e=await this.initFteStateAndConfig(),{isTouchPointPresent:t,frameId:n,position:o}=await this.isTouchPointPresent();if(this.frameId=n,t&&this.isTouchPointPositionAllowsForFTE(o)){const t=i?.enableLinkedinFteTooltip;return await(this.fteUtils?.shouldShowOneTimeFteTooltip(e,t))}return!1}}chrome.runtime.onMessage.addListener((i=>{"added-linkedin-pdf-touch-point"===i?.type&&linkedinTouchPointAddedPromiseResolve({isTouchPointPresent:!0,frameId:i.frameId,position:i.position})}));