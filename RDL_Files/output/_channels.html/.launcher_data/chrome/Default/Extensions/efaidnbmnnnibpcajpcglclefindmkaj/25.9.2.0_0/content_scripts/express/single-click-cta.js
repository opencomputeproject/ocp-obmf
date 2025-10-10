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
import expressUtils from"./express-utils.js";class SingleClickCTA{ENTRY_POINT_DIV_WRAPPER_CLASS="cc440d50ba-express-entrypoint-wrapper";ENTRY_POINT_BUTTON_CLASS="cc440d50ba-express-entrypoint-button";ENTRY_POINT_BUTTON_ICON_IMG_CLASS="cc440d50ba-express-entrypoint-button-icon-img";constructor(){this.ready=this.init()}async init(){await fetch(chrome.runtime.getURL("resources/express/expressSingleClickCTA.html")).then((t=>t.text())).then((t=>{this.htmlData=t})),this.ExpressCTATooltip=(await import(chrome.runtime.getURL("content_scripts/express/express-cta-tooltip.js"))).default,expressUtils.addFontToDocument()}async renderMenuButton(t,e){await this.ready,this.surface=e;const s=document.createElement("div");s.innerHTML=this.htmlData,s.className=`${e} ${this.ENTRY_POINT_DIV_WRAPPER_CLASS}`;const i=s.getElementsByClassName(this.ENTRY_POINT_BUTTON_CLASS)[0];i.onclick=s=>{s.stopPropagation();const i="editImage",n=new URL(window.location.href).hostname;expressUtils.sendAnalyticsEvent([["DCBrowserExt:Express:SingleCTA:VERB:Clicked",{domain:n,VERB:i,expressTouchpoint:e}]]),t(i)};return i.getElementsByClassName(this.ENTRY_POINT_BUTTON_ICON_IMG_CLASS)[0].src=chrome.runtime.getURL("browser/images/acrobat_prodc_appicon_24.svg"),util.translateElements(".translate",s),this.button=i,s}attachTooltip(t,e=null){const s=new this.ExpressCTATooltip({button:this.button,tooltipPosition:t,surface:this.surface});return s.addTooltipToDOM(e),s}}export default SingleClickCTA;