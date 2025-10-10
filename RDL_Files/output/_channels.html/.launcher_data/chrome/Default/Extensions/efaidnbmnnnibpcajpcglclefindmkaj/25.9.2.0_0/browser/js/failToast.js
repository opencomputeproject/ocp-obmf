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
import{util as e}from"./content-util.js";$(document).ready((()=>{const t=new URLSearchParams(window.location.search).get("errorType");if(t){document.getElementsByClassName("toastDescription")[0].id=t+"ToastText"}e.translateElements(".translate"),$("#closeFailToast").click((()=>{chrome.runtime.sendMessage({main_op:"closeExpressApp"})}))}));