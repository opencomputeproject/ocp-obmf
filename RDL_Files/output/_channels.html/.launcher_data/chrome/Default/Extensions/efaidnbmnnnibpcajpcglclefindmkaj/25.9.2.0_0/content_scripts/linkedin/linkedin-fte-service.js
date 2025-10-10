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
import state from"./state.js";import{createFteTooltip,updateOneTimeFteToolTipCoolDown}from"../gsuite/fte-utils.js";import{sendAnalytics,sendErrorLog}from"../gsuite/util.js";const LINKEDIN_FTE_TOOLTIP_CONTAINER_CLASS="acrobat-fte-tooltip-container",LINKEDIN_FTE_TOOLTIP_BUTTON_CLASS="acrobat-fte-tooltip-button",LINKEDIN_TOUCH_POINT_CONTAINER_CLASS="linkedin-acrobat-touch-point-container",LINKEDIN_FTE_STATE_STORAGE_KEY="acrobat-linkedin-fte-state",acrobatPromotionSource="linkedInPDF",removeFteTooltip=()=>{const t=document.getElementsByClassName("acrobat-fte-tooltip-container");t.length>0&&t[0]?.remove(),state?.disconnectEventListeners()},handleFteClickOutside=t=>{const e=document.getElementsByClassName("acrobat-fte-tooltip-container");e.length>0&&(e[0]?.contains(t?.target)||(removeFteTooltip(),sendAnalytics([["DCBrowserExt:LinkedIn:FTE:Dismissed"]])))},handleFteButtonClick=()=>{removeFteTooltip(),sendAnalytics([["DCBrowserExt:LinkedIn:FTE:Closed"]])},addFTETooltipEventListeners=t=>{const e=t?.querySelector(".acrobat-fte-tooltip-button");e?.addEventListener("click",handleFteButtonClick),document.addEventListener("click",handleFteClickOutside,{signal:state?.eventControllerSignal})},addFTE=async()=>{try{const t=document.getElementsByClassName(LINKEDIN_TOUCH_POINT_CONTAINER_CLASS),e=document.getElementsByClassName("acrobat-fte-tooltip-container");if(t?.length>0&&t[0]&&0===e?.length){const e=state?.config,o=createFteTooltip(e?.fteToolTipStrings,"linkedInPDF");addFTETooltipEventListeners(o),t[0].appendChild(o),sendAnalytics([["DCBrowserExt:LinkedIn:FTE:Shown"]]),await updateOneTimeFteToolTipCoolDown("acrobat-linkedin-fte-state")}}catch(t){sendErrorLog("LinkedInTouchPoint","Failure in addFTE")}};export{addFTE,removeFteTooltip};