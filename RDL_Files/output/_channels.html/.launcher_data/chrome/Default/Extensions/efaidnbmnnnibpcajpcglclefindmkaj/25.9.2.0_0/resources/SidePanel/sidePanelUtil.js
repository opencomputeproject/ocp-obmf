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
import e from"../../libs/readability.js";const{Readability:t,isProbablyReaderable:n}=e;function a(e){return e.clientHeight>0&&e.clientWidth>0}async function r(e,t=!0){const r=()=>n(e,{visibilityChecker:t?a:void 0});if(r())return!0;const i=(await chrome.runtime.sendMessage({type:"get_sidepanel_state"})).isOpen?1500:5e3,s=Date.now();return new Promise((e=>{const t=setInterval((()=>{r()&&(clearInterval(t),clearTimeout(n),e(!0),chrome.runtime.sendMessage({main_op:"log-info",log:{message:"Webpage is readable after x seconds",seconds:((Date.now()-s)/1e3).toFixed(1)}}))}),300),n=setTimeout((()=>{clearInterval(t),e(!1)}),i)}))}async function i(e){const n=(new DOMParser).parseFromString(e,"text/html");if(await r(n,!1)){return new t(n).parse().content}return e}async function s(e){return(await chrome.i18n.detectLanguage(e)).languages.reduce(((e,t)=>e.percentage>t.percentage?e:t),{language:"en",percentage:0})}export{r as isProbablyReaderableAsync,i as getReadableContent,s as getContentLocale};