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
import state from"./state.js";import{createFteTooltip,updateFteToolTipCoolDown}from"../gsuite/fte-utils.js";import{sendAnalyticsOncePerMonth,sendErrorLog}from"../gsuite/util.js";const documentListenerOptions={signal:state?.eventControllerSignal},removeFteTooltip=e=>{const t=document.getElementsByClassName(e);t.length>0&&t[0]?.remove(),document.removeEventListener("click",handleFteClickOutside,documentListenerOptions)},handleFteClickOutside=(e,t,o,n)=>{const s=document.getElementsByClassName(t);if(s.length>0&&e&&e.target){const i=s[0];i&&!i.contains(e.target)&&(removeFteTooltip(t),sendAnalyticsOncePerMonth("DCBrowserExt:DirectVerb:Fte:Dismissed",{source:o,workflow:n}))}},handleFteButtonClick=(e,t,o,n)=>{e.preventDefault(),removeFteTooltip(t),sendAnalyticsOncePerMonth("DCBrowserExt:DirectVerb:Fte:Closed",{source:o,workflow:n})},addFTETooltipEventListeners=(e,t,o,n)=>{const s=e?.getElementsByClassName("acrobat-fte-tooltip-button");s.length>0&&s[0].addEventListener("click",(e=>handleFteButtonClick(e,t,o,n))),document.addEventListener("click",(e=>handleFteClickOutside(e,t,o,n)),documentListenerOptions)},addFTE=async(e,t,o,n,s,i,r)=>{try{const l=document.getElementsByClassName(e),c=document.getElementsByClassName(t);if(l?.length>0&&l[0]&&0===c?.length){const e=createFteTooltip(n?.fteTooltipStrings,s);addFTETooltipEventListeners(e,t,i,r),l[0].appendChild(e),sendAnalyticsOncePerMonth("DCBrowserExt:DirectVerb:Fte:Shown",{source:i,workflow:r}),await updateFteToolTipCoolDown(n?.fteConfig?.tooltip,o)}}catch(e){sendErrorLog(`Failure in adding FTE in ${i} for ${r}`,e)}};export{addFTE,removeFteTooltip};