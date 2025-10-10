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
import{common as e}from"./common.js";async function o(){const o=await fetch(e.getVersionConfigUrl(),{method:"GET",headers:{Accept:"application/json"}}),t=o.headers.get("content-type");if(o.ok&&t&&t.includes("application/json"))return o.json()}export async function checkForImsSidCookie(){const e=await chrome.cookies.get({url:"https://www.services.adobe.com/",name:"ims_sid"});let o=!1;if(e?.value){o=1e3*e.expirationDate>(new Date).getTime()}return o}export{o as getVersionConfig};