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
import state from"./state.js";import{removeAllTouchPoints}from"./touchpoint-service.js";import{createUrlForAcrobatTouchPoint}from"./util.js";import{sendAnalytics,getDefaultViewershipStatusEventParam,incrementDVSessionCount}from"../gsuite/util.js";const isDefaultViewershipFeatureForGdriveEnabled=()=>state?.config?.enableDefaultViewershipFeatureForGoogleDrive,isDefaultViewer=()=>isDefaultViewershipFeatureForGdriveEnabled()&&state?.config?.isAcrobatDefaultForSurface&&chrome.runtime.id&&!1===state?.addOnStatus?.isAddOnDefault,takeDefaultViewerShip=()=>{isDefaultViewershipFeatureForGdriveEnabled()&&!isDefaultViewer()&&(state.config.isAcrobatDefaultForSurface=!0,removeAllTouchPoints())},resetDefaultViewership=()=>{state.config.isAcrobatDefaultForSurface=!1},openPdfInNewTabForDV=(e,t,r)=>{e.preventDefault(),e.stopPropagation();const i=createUrlForAcrobatTouchPoint(t,r);window.open(i,"_blank"),incrementDVSessionCount("gdrive"),chrome.runtime.sendMessage({main_op:"akamai-ping"})},isPartOfExperimentCohort=()=>state?.config?.isUserPartOfExperimentControlOrTreatmentForGoogleDriveDV,getDefaultViewershipEventParam=()=>getDefaultViewershipStatusEventParam(isDefaultViewer(),isDefaultViewershipFeatureForGdriveEnabled(),"gdrive",isPartOfExperimentCohort()),sendAnalyticsWithGdriveDVFeatureStatus=(e,t={})=>{e&&sendAnalytics([[e,{...getDefaultViewershipEventParam(),...t}]])};export{isDefaultViewer,takeDefaultViewerShip,resetDefaultViewership,openPdfInNewTabForDV,sendAnalyticsWithGdriveDVFeatureStatus};