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
import{floodgate as t}from"./floodgate.js";import{dcLocalStorage as e}from"../common/local-storage.js";import{setExperimentCodeForAnalytics as n,removeExperimentCodeForAnalytics as i}from"../common/experimentUtils.js";import{util as o}from"./util.js";import{sendErrorLog as a}from"../content_scripts/gsuite/util.js";import{viewerModuleUtils as r}from"./viewer-module-utils.js";const l=e=>{try{return JSON.parse(t.getFeatureMeta(e))}catch(t){return a("LinkedInTouchPoint",`Failure in parsing FeatureFlag ${e}`),{}}};async function c(c,s){await e.init();const[d,u,m]=await Promise.all([t.hasFlag("dc-cv-linkedin-pdf-touch-point"),t.hasFlag("dc-cv-linkedin-pdf-touch-point-control"),t.hasFlag("dc-cv-linkedin-chat-pdf")]);try{await r.initializeViewerVariables(c)}catch(t){a("LinkedInTouchPoint","Error initializing viewer variables for LinkedIn")}let p,h,f,g,I;const F="false"===e.getItem("acrobat-touch-points-in-other-surfaces"),k=l("dc-cv-linkedin-pdf-touch-point");p=k?k.selectors:{},h=!!k&&k.fteEnabled,f=!!k&&k.enLocaleEnabled,g=!!k&&k.nonEnLocaleEnabled,I=((t,n)=>{const i="en-US"===e.getItem("locale")||"en-GB"===e.getItem("locale");return i&&t||!i&&n})(f,g);const L=l("dc-cv-linkedin-chat-pdf");return p={...p,linkedInChat:L},d&&I?(i("LIC"),n("LI")):u&&I?(i("LI"),n("LIC")):(i("LI"),i("LIC")),{enableLinkedinPDFTouchPoint:d&&!F&&I,enableLinkedinChatPDF:m,selectors:p,touchPointString:o.getTranslation("gsuiteOpenWithAcrobat"),fteToolTipStrings:{title:o.getTranslation("outlookPDFTouchPointFTEHeader"),description:o.getTranslation("linkedInFeedPDFTouchPointFTEBody"),button:o.getTranslation("closeButton")},enableLinkedinFteTooltip:h,frameId:s?.frameId}}export{c as linkedinInit};