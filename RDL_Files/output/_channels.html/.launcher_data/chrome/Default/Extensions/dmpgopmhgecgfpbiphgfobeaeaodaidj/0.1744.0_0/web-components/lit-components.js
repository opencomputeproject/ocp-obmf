(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function e(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=e(o);fetch(o.href,n)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const d2=window,mt=d2.ShadowRoot&&(d2.ShadyCSS===void 0||d2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Et=Symbol(),kt=new WeakMap;let me=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(mt&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=kt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&kt.set(e,t))}return t}toString(){return this.cssText}};const p3=i=>new me(typeof i=="string"?i:i+"",void 0,Et),N=(i,...t)=>{const e=i.length===1?i[0]:t.reduce(((s,o,n)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+i[n+1]),i[0]);return new me(e,i,Et)},C3=(i,t)=>{mt?i.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):t.forEach((e=>{const s=document.createElement("style"),o=d2.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)}))},Xt=mt?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return p3(e)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var q2;const u2=window,Wt=u2.trustedTypes,u3=Wt?Wt.emptyScript:"",Yt=u2.reactiveElementPolyfillSupport,ot={toAttribute(i,t){switch(t){case Boolean:i=i?u3:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},Ee=(i,t)=>t!==i&&(t==t||i==i),k2={attribute:!0,type:String,converter:ot,reflect:!1,hasChanged:Ee},nt="finalized";let y1=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;this.finalize(),((e=this.h)!==null&&e!==void 0?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,s)=>{const o=this._$Ep(s,e);o!==void 0&&(this._$Ev.set(o,s),t.push(o))})),t}static createProperty(t,e=k2){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const s=typeof t=="symbol"?Symbol():"__"+t,o=this.getPropertyDescriptor(t,s,e);o!==void 0&&Object.defineProperty(this.prototype,t,o)}}static getPropertyDescriptor(t,e,s){return{get(){return this[e]},set(o){const n=this[t];this[e]=o,this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||k2}static finalize(){if(this.hasOwnProperty(nt))return!1;this[nt]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),t.h!==void 0&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,s=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const o of s)this.createProperty(o,e[o])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const o of s)e.unshift(Xt(o))}else t!==void 0&&e.push(Xt(t));return e}static _$Ep(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(t=this.constructor.h)===null||t===void 0||t.forEach((e=>e(this)))}addController(t){var e,s;((e=this._$ES)!==null&&e!==void 0?e:this._$ES=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((s=t.hostConnected)===null||s===void 0||s.call(t))}removeController(t){var e;(e=this._$ES)===null||e===void 0||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return C3(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$ES)===null||t===void 0||t.forEach((e=>{var s;return(s=e.hostConnected)===null||s===void 0?void 0:s.call(e)}))}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$ES)===null||t===void 0||t.forEach((e=>{var s;return(s=e.hostDisconnected)===null||s===void 0?void 0:s.call(e)}))}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$EO(t,e,s=k2){var o;const n=this.constructor._$Ep(t,s);if(n!==void 0&&s.reflect===!0){const r=(((o=s.converter)===null||o===void 0?void 0:o.toAttribute)!==void 0?s.converter:ot).toAttribute(e,s.type);this._$El=t,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$El=null}}_$AK(t,e){var s;const o=this.constructor,n=o._$Ev.get(t);if(n!==void 0&&this._$El!==n){const r=o.getPropertyOptions(n),u=typeof r.converter=="function"?{fromAttribute:r.converter}:((s=r.converter)===null||s===void 0?void 0:s.fromAttribute)!==void 0?r.converter:ot;this._$El=n,this[n]=u.fromAttribute(e,r.type),this._$El=null}}requestUpdate(t,e,s){let o=!0;t!==void 0&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||Ee)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),s.reflect===!0&&this._$El!==t&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(t,s))):o=!1),!this.isUpdatePending&&o&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((o,n)=>this[n]=o)),this._$Ei=void 0);let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(t=this._$ES)===null||t===void 0||t.forEach((o=>{var n;return(n=o.hostUpdate)===null||n===void 0?void 0:n.call(o)})),this.update(s)):this._$Ek()}catch(o){throw e=!1,this._$Ek(),o}e&&this._$AE(s)}willUpdate(t){}_$AE(t){var e;(e=this._$ES)===null||e===void 0||e.forEach((s=>{var o;return(o=s.hostUpdated)===null||o===void 0?void 0:o.call(s)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){this._$EC!==void 0&&(this._$EC.forEach(((e,s)=>this._$EO(s,this[s],e))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};y1[nt]=!0,y1.elementProperties=new Map,y1.elementStyles=[],y1.shadowRootOptions={mode:"open"},Yt?.({ReactiveElement:y1}),((q2=u2.reactiveElementVersions)!==null&&q2!==void 0?q2:u2.reactiveElementVersions=[]).push("1.6.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var X2;const f2=window,R1=f2.trustedTypes,Zt=R1?R1.createPolicy("lit-html",{createHTML:i=>i}):void 0,rt="$lit$",t1=`lit$${(Math.random()+"").slice(9)}$`,ve="?"+t1,f3=`<${ve}>`,c1=document,g2=()=>c1.createComment(""),W1=i=>i===null||typeof i!="object"&&typeof i!="function",we=Array.isArray,g3=i=>we(i)||typeof i?.[Symbol.iterator]=="function",W2=`[ 	
\f\r]`,z1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Gt=/-->/g,jt=/>/g,r1=RegExp(`>|${W2}(?:([^\\s"'>=/]+)(${W2}*=${W2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_t=/'/g,Kt=/"/g,xe=/^(?:script|style|textarea|title)$/i,b1=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),Jt=new WeakMap,a1=c1.createTreeWalker(c1,129,null,!1);function Ie(i,t){if(!Array.isArray(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Zt!==void 0?Zt.createHTML(t):t}const m3=(i,t)=>{const e=i.length-1,s=[];let o,n=t===2?"<svg>":"",r=z1;for(let u=0;u<e;u++){const A=i[u];let c,E,C=-1,m=0;for(;m<A.length&&(r.lastIndex=m,E=r.exec(A),E!==null);)m=r.lastIndex,r===z1?E[1]==="!--"?r=Gt:E[1]!==void 0?r=jt:E[2]!==void 0?(xe.test(E[2])&&(o=RegExp("</"+E[2],"g")),r=r1):E[3]!==void 0&&(r=r1):r===r1?E[0]===">"?(r=o??z1,C=-1):E[1]===void 0?C=-2:(C=r.lastIndex-E[2].length,c=E[1],r=E[3]===void 0?r1:E[3]==='"'?Kt:_t):r===Kt||r===_t?r=r1:r===Gt||r===jt?r=z1:(r=r1,o=void 0);const w=r===r1&&i[u+1].startsWith("/>")?" ":"";n+=r===z1?A+f3:C>=0?(s.push(c),A.slice(0,C)+rt+A.slice(C)+t1+w):A+t1+(C===-2?(s.push(void 0),u):w)}return[Ie(i,n+(i[e]||"<?>")+(t===2?"</svg>":"")),s]};let lt=class ye{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let n=0,r=0;const u=t.length-1,A=this.parts,[c,E]=m3(t,e);if(this.el=ye.createElement(c,s),a1.currentNode=this.el.content,e===2){const C=this.el.content,m=C.firstChild;m.remove(),C.append(...m.childNodes)}for(;(o=a1.nextNode())!==null&&A.length<u;){if(o.nodeType===1){if(o.hasAttributes()){const C=[];for(const m of o.getAttributeNames())if(m.endsWith(rt)||m.startsWith(t1)){const w=E[r++];if(C.push(m),w!==void 0){const q=o.getAttribute(w.toLowerCase()+rt).split(t1),k=/([.?@])?(.*)/.exec(w);A.push({type:1,index:n,name:k[2],strings:q,ctor:k[1]==="."?v3:k[1]==="?"?x3:k[1]==="@"?I3:v2})}else A.push({type:6,index:n})}for(const m of C)o.removeAttribute(m)}if(xe.test(o.tagName)){const C=o.textContent.split(t1),m=C.length-1;if(m>0){o.textContent=R1?R1.emptyScript:"";for(let w=0;w<m;w++)o.append(C[w],g2()),a1.nextNode(),A.push({type:2,index:++n});o.append(C[m],g2())}}}else if(o.nodeType===8)if(o.data===ve)A.push({type:2,index:n});else{let C=-1;for(;(C=o.data.indexOf(t1,C+1))!==-1;)A.push({type:7,index:n}),C+=t1.length-1}n++}}static createElement(t,e){const s=c1.createElement("template");return s.innerHTML=t,s}};function B1(i,t,e=i,s){var o,n,r,u;if(t===b1)return t;let A=s!==void 0?(o=e._$Co)===null||o===void 0?void 0:o[s]:e._$Cl;const c=W1(t)?void 0:t._$litDirective$;return A?.constructor!==c&&((n=A?._$AO)===null||n===void 0||n.call(A,!1),c===void 0?A=void 0:(A=new c(i),A._$AT(i,e,s)),s!==void 0?((r=(u=e)._$Co)!==null&&r!==void 0?r:u._$Co=[])[s]=A:e._$Cl=A),A!==void 0&&(t=B1(i,A._$AS(i,t.values),A,s)),t}let E3=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:s},parts:o}=this._$AD,n=((e=t?.creationScope)!==null&&e!==void 0?e:c1).importNode(s,!0);a1.currentNode=n;let r=a1.nextNode(),u=0,A=0,c=o[0];for(;c!==void 0;){if(u===c.index){let E;c.type===2?E=new Re(r,r.nextSibling,this,t):c.type===1?E=new c.ctor(r,c.name,c.strings,this,t):c.type===6&&(E=new y3(r,this,t)),this._$AV.push(E),c=o[++A]}u!==c?.index&&(r=a1.nextNode(),u++)}return a1.currentNode=c1,n}v(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},Re=class be{constructor(t,e,s,o){var n;this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cp=(n=o?.isConnected)===null||n===void 0||n}get _$AU(){var t,e;return(e=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&e!==void 0?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=B1(this,t,e),W1(t)?t===y||t==null||t===""?(this._$AH!==y&&this._$AR(),this._$AH=y):t!==this._$AH&&t!==b1&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):g3(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==y&&W1(this._$AH)?this._$AA.nextSibling.data=t:this.$(c1.createTextNode(t)),this._$AH=t}g(t){var e;const{values:s,_$litType$:o}=t,n=typeof o=="number"?this._$AC(t):(o.el===void 0&&(o.el=lt.createElement(Ie(o.h,o.h[0]),this.options)),o);if(((e=this._$AH)===null||e===void 0?void 0:e._$AD)===n)this._$AH.v(s);else{const r=new E3(n,this),u=r.u(this.options);r.v(s),this.$(u),this._$AH=r}}_$AC(t){let e=Jt.get(t.strings);return e===void 0&&Jt.set(t.strings,e=new lt(t)),e}T(t){we(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,o=0;for(const n of t)o===e.length?e.push(s=new be(this.k(g2()),this.k(g2()),this,this.options)):s=e[o],s._$AI(n),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,e);t&&t!==this._$AB;){const o=t.nextSibling;t.remove(),t=o}}setConnected(t){var e;this._$AM===void 0&&(this._$Cp=t,(e=this._$AP)===null||e===void 0||e.call(this,t))}},v2=class{constructor(t,e,s,o,n){this.type=1,this._$AH=y,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=y}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,s,o){const n=this.strings;let r=!1;if(n===void 0)t=B1(this,t,e,0),r=!W1(t)||t!==this._$AH&&t!==b1,r&&(this._$AH=t);else{const u=t;let A,c;for(t=n[0],A=0;A<n.length-1;A++)c=B1(this,u[s+A],e,A),c===b1&&(c=this._$AH[A]),r||(r=!W1(c)||c!==this._$AH[A]),c===y?t=y:t!==y&&(t+=(c??"")+n[A+1]),this._$AH[A]=c}r&&!o&&this.j(t)}j(t){t===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},v3=class extends v2{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===y?void 0:t}};const w3=R1?R1.emptyScript:"";let x3=class extends v2{constructor(){super(...arguments),this.type=4}j(t){t&&t!==y?this.element.setAttribute(this.name,w3):this.element.removeAttribute(this.name)}},I3=class extends v2{constructor(t,e,s,o,n){super(t,e,s,o,n),this.type=5}_$AI(t,e=this){var s;if((t=(s=B1(this,t,e,0))!==null&&s!==void 0?s:y)===b1)return;const o=this._$AH,n=t===y&&o!==y||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,r=t!==y&&(o===y||n);n&&this.element.removeEventListener(this.name,this,o),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,s;typeof this._$AH=="function"?this._$AH.call((s=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&s!==void 0?s:this.element,t):this._$AH.handleEvent(t)}};class y3{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){B1(this,t)}}const $t=f2.litHtmlPolyfillSupport;$t?.(lt,Re),((X2=f2.litHtmlVersions)!==null&&X2!==void 0?X2:f2.litHtmlVersions=[]).push("2.8.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Y2;const m2=window,H1=m2.trustedTypes,te=H1?H1.createPolicy("lit-html",{createHTML:i=>i}):void 0,at="$lit$",e1=`lit$${(Math.random()+"").slice(9)}$`,Be="?"+e1,R3=`<${Be}>`,d1=document,Y1=()=>d1.createComment(""),Z1=i=>i===null||typeof i!="object"&&typeof i!="function",He=Array.isArray,b3=i=>He(i)||typeof i?.[Symbol.iterator]=="function",Z2=`[ 	
\f\r]`,F1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ee=/-->/g,ie=/>/g,l1=RegExp(`>|${Z2}(?:([^\\s"'>=/]+)(${Z2}*=${Z2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),se=/'/g,oe=/"/g,Me=/^(?:script|style|textarea|title)$/i,B3=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),f=B3(1),M1=Symbol.for("lit-noChange"),T=Symbol.for("lit-nothing"),ne=new WeakMap,A1=d1.createTreeWalker(d1,129,null,!1),H3=(i,t)=>{const e=i.length-1,s=[];let o,n=t===2?"<svg>":"",r=F1;for(let A=0;A<e;A++){const c=i[A];let E,C,m=-1,w=0;for(;w<c.length&&(r.lastIndex=w,C=r.exec(c),C!==null);)w=r.lastIndex,r===F1?C[1]==="!--"?r=ee:C[1]!==void 0?r=ie:C[2]!==void 0?(Me.test(C[2])&&(o=RegExp("</"+C[2],"g")),r=l1):C[3]!==void 0&&(r=l1):r===l1?C[0]===">"?(r=o??F1,m=-1):C[1]===void 0?m=-2:(m=r.lastIndex-C[2].length,E=C[1],r=C[3]===void 0?l1:C[3]==='"'?oe:se):r===oe||r===se?r=l1:r===ee||r===ie?r=F1:(r=l1,o=void 0);const q=r===l1&&i[A+1].startsWith("/>")?" ":"";n+=r===F1?c+R3:m>=0?(s.push(E),c.slice(0,m)+at+c.slice(m)+e1+q):c+e1+(m===-2?(s.push(void 0),A):q)}const u=n+(i[e]||"<?>")+(t===2?"</svg>":"");if(!Array.isArray(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return[te!==void 0?te.createHTML(u):u,s]};class G1{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let n=0,r=0;const u=t.length-1,A=this.parts,[c,E]=H3(t,e);if(this.el=G1.createElement(c,s),A1.currentNode=this.el.content,e===2){const C=this.el.content,m=C.firstChild;m.remove(),C.append(...m.childNodes)}for(;(o=A1.nextNode())!==null&&A.length<u;){if(o.nodeType===1){if(o.hasAttributes()){const C=[];for(const m of o.getAttributeNames())if(m.endsWith(at)||m.startsWith(e1)){const w=E[r++];if(C.push(m),w!==void 0){const q=o.getAttribute(w.toLowerCase()+at).split(e1),k=/([.?@])?(.*)/.exec(w);A.push({type:1,index:n,name:k[2],strings:q,ctor:k[1]==="."?D3:k[1]==="?"?T3:k[1]==="@"?V3:w2})}else A.push({type:6,index:n})}for(const m of C)o.removeAttribute(m)}if(Me.test(o.tagName)){const C=o.textContent.split(e1),m=C.length-1;if(m>0){o.textContent=H1?H1.emptyScript:"";for(let w=0;w<m;w++)o.append(C[w],Y1()),A1.nextNode(),A.push({type:2,index:++n});o.append(C[m],Y1())}}}else if(o.nodeType===8)if(o.data===Be)A.push({type:2,index:n});else{let C=-1;for(;(C=o.data.indexOf(e1,C+1))!==-1;)A.push({type:7,index:n}),C+=e1.length-1}n++}}static createElement(t,e){const s=d1.createElement("template");return s.innerHTML=t,s}}function D1(i,t,e=i,s){var o,n,r,u;if(t===M1)return t;let A=s!==void 0?(o=e._$Co)===null||o===void 0?void 0:o[s]:e._$Cl;const c=Z1(t)?void 0:t._$litDirective$;return A?.constructor!==c&&((n=A?._$AO)===null||n===void 0||n.call(A,!1),c===void 0?A=void 0:(A=new c(i),A._$AT(i,e,s)),s!==void 0?((r=(u=e)._$Co)!==null&&r!==void 0?r:u._$Co=[])[s]=A:e._$Cl=A),A!==void 0&&(t=D1(i,A._$AS(i,t.values),A,s)),t}class M3{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:s},parts:o}=this._$AD,n=((e=t?.creationScope)!==null&&e!==void 0?e:d1).importNode(s,!0);A1.currentNode=n;let r=A1.nextNode(),u=0,A=0,c=o[0];for(;c!==void 0;){if(u===c.index){let E;c.type===2?E=new $1(r,r.nextSibling,this,t):c.type===1?E=new c.ctor(r,c.name,c.strings,this,t):c.type===6&&(E=new P3(r,this,t)),this._$AV.push(E),c=o[++A]}u!==c?.index&&(r=A1.nextNode(),u++)}return A1.currentNode=d1,n}v(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class $1{constructor(t,e,s,o){var n;this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cp=(n=o?.isConnected)===null||n===void 0||n}get _$AU(){var t,e;return(e=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&e!==void 0?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=D1(this,t,e),Z1(t)?t===T||t==null||t===""?(this._$AH!==T&&this._$AR(),this._$AH=T):t!==this._$AH&&t!==M1&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):b3(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==T&&Z1(this._$AH)?this._$AA.nextSibling.data=t:this.$(d1.createTextNode(t)),this._$AH=t}g(t){var e;const{values:s,_$litType$:o}=t,n=typeof o=="number"?this._$AC(t):(o.el===void 0&&(o.el=G1.createElement(o.h,this.options)),o);if(((e=this._$AH)===null||e===void 0?void 0:e._$AD)===n)this._$AH.v(s);else{const r=new M3(n,this),u=r.u(this.options);r.v(s),this.$(u),this._$AH=r}}_$AC(t){let e=ne.get(t.strings);return e===void 0&&ne.set(t.strings,e=new G1(t)),e}T(t){He(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,o=0;for(const n of t)o===e.length?e.push(s=new $1(this.k(Y1()),this.k(Y1()),this,this.options)):s=e[o],s._$AI(n),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,e);t&&t!==this._$AB;){const o=t.nextSibling;t.remove(),t=o}}setConnected(t){var e;this._$AM===void 0&&(this._$Cp=t,(e=this._$AP)===null||e===void 0||e.call(this,t))}}class w2{constructor(t,e,s,o,n){this.type=1,this._$AH=T,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=T}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,s,o){const n=this.strings;let r=!1;if(n===void 0)t=D1(this,t,e,0),r=!Z1(t)||t!==this._$AH&&t!==M1,r&&(this._$AH=t);else{const u=t;let A,c;for(t=n[0],A=0;A<n.length-1;A++)c=D1(this,u[s+A],e,A),c===M1&&(c=this._$AH[A]),r||(r=!Z1(c)||c!==this._$AH[A]),c===T?t=T:t!==T&&(t+=(c??"")+n[A+1]),this._$AH[A]=c}r&&!o&&this.j(t)}j(t){t===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class D3 extends w2{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===T?void 0:t}}const L3=H1?H1.emptyScript:"";class T3 extends w2{constructor(){super(...arguments),this.type=4}j(t){t&&t!==T?this.element.setAttribute(this.name,L3):this.element.removeAttribute(this.name)}}class V3 extends w2{constructor(t,e,s,o,n){super(t,e,s,o,n),this.type=5}_$AI(t,e=this){var s;if((t=(s=D1(this,t,e,0))!==null&&s!==void 0?s:T)===M1)return;const o=this._$AH,n=t===T&&o!==T||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,r=t!==T&&(o===T||n);n&&this.element.removeEventListener(this.name,this,o),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,s;typeof this._$AH=="function"?this._$AH.call((s=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&s!==void 0?s:this.element,t):this._$AH.handleEvent(t)}}class P3{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){D1(this,t)}}const re=m2.litHtmlPolyfillSupport;re?.(G1,$1),((Y2=m2.litHtmlVersions)!==null&&Y2!==void 0?Y2:m2.litHtmlVersions=[]).push("2.7.4");const O3=(i,t,e)=>{var s,o;const n=(s=e?.renderBefore)!==null&&s!==void 0?s:t;let r=n._$litPart$;if(r===void 0){const u=(o=e?.renderBefore)!==null&&o!==void 0?o:null;n._$litPart$=r=new $1(t.insertBefore(Y1(),u),u,void 0,e??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var G2,j2;let R=class extends y1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const s=super.createRenderRoot();return(t=(e=this.renderOptions).renderBefore)!==null&&t!==void 0||(e.renderBefore=s.firstChild),s}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=O3(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!1)}render(){return M1}};R.finalized=!0,R._$litElement$=!0,(G2=globalThis.litElementHydrateSupport)===null||G2===void 0||G2.call(globalThis,{LitElement:R});const le=globalThis.litElementPolyfillSupport;le?.({LitElement:R});((j2=globalThis.litElementVersions)!==null&&j2!==void 0?j2:globalThis.litElementVersions=[]).push("3.3.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const P=i=>t=>typeof t=="function"?((e,s)=>(customElements.define(e,s),s))(i,t):((e,s)=>{const{kind:o,elements:n}=s;return{kind:o,elements:n,finisher(r){customElements.define(e,r)}}})(i,t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const S3=(i,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(e){e.createProperty(t.key,i)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(e){e.createProperty(t.key,i)}},Q3=(i,t,e)=>{t.constructor.createProperty(e,i)};function p(i){return(t,e)=>e!==void 0?Q3(i,t,e):S3(i,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function b(i){return p({...i,state:!0})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var _2;((_2=window.HTMLSlotElement)===null||_2===void 0?void 0:_2.prototype.assignedElements)!=null;const N3={composed:!0,cancelable:!0,bubbles:!0},B=(i,{eventType:t,detail:e})=>{i.dispatchEvent(new CustomEvent(t,{...N3,detail:e}))},U3=N`
    .access-blocked {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-flow: column;
        background-color: white;
        justify-content: center;
        position: fixed;
        inset: 0;
        direction: ltr;
        font-family: 'Montserrat';
        align-items: center;
        z-index: 2147483647; // Max Int
        color: black;
    }

    .frame {
        width: 850px;
        padding: 8px;
        border-radius: 20px;
        border: 1px solid #dbe3e8;
        box-sizing: border-box;
        background-color: #f5f7fa;
    }

    .main {
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-content: center;
        text-align: center;
        padding: 40px;
        border-radius: 16px;
        box-sizing: border-box;
        background: #ffffff;
    }

    .bypass {
        margin-top: 40px;
    }

    .bypass-button {
        max-width: 120px;
        margin: auto;
        border-radius: 4px;
        font-weight: 500;
        border-color: #c7d3db !important;
    }

    .contact-support {
        margin-top: 20px;
        font-size: 14px;
        font-weight: 500;
        color: #576f7d;
    }

    .email {
        color: #725bf6;
        text-decoration: none;
    }

    .access-block-image {
        margin: auto;
        margin-top: 40px;
        width: 450px;
    }

    .switch-profile {
        display: flex;
        justify-content: center;
        margin-top: 40px;
        gap: 20px;
    }

    .company-logo {
        margin: auto;
        max-width: 200px;
        max-height: 55px;
        height: auto;
        margin-bottom: 20px;
    }

    .title {
        font-weight: 600;
        font-size: 20px;
        line-height: 35px;
        color: #1b2f39;
        margin-top: 20px;
    }
    .sub-title {
        margin: auto;
        font-weight: 400;
        font-size: 14px;
        line-height: 23px;
        color: #576f7d;
        max-width: 600px;
    }

    .item-title {
        margin-top: 20px;
        font-weight: 600;
        font-size: 14px;
        line-height: 27px;
        color: #1b2f39;
    }

    .item-sub-title {
        margin: auto;
        max-width: 305px;
        font-weight: 400;
        font-size: 14px;
        line-height: 23px;
        color: #576f7d;
    }

    .contact-email {
        color: #725bf6;
        text-decoration: none;
        font-weight: 600;
        white-space: nowrap;
    }
`;var De=(i=>(i.SkipSafeLogin="skipSafeLogin",i))(De||{}),z3=Object.defineProperty,F3=Object.getOwnPropertyDescriptor,P1=(i,t,e,s)=>{for(var o=s>1?void 0:s?F3(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&z3(t,e,o),o};let h1=class extends R{constructor(){super(...arguments),this.contactEmail="",this.showSkipLoginBtn=!1,this.companyLogo="",this.subTitle="",this.title="",this.handleSkipSafeLogin=()=>{B(this,{eventType:De.SkipSafeLogin}),this.remove()},this.getShowSkipLoginBtn=()=>{if(this.showSkipLoginBtn)return f`
            <div class="bypass">
                <lit-button
                    type="secondary"
                    class="bypass-button"
                    text="Bypass Once"
                    .onclick=${this.handleSkipSafeLogin}
                >
                </lit-button>
            </div>
        `},this.getContactEmail=()=>{if(this.contactEmail)return f`
            <span>
                <a class="contact-email" href="mailto::${this.contactEmail}"> ${this.contactEmail} </a>
            </span>
        `}}render(){return f`
            <style>
                ${U3}
            </style>
            <div class="access-blocked">
                <div class="frame">
                    <div class="main">
                        <img class="company-logo" src=${this.companyLogo} alt="company-logo" />
                        <div class="title">Switch to Work Profile</div>
                        <div class="sub-title">
                            To access this site, please switch to your work profile by clicking on the profile icon and
                            selecting your work profile from the menu
                        </div>
                        <div class="switch-profile">
                            <div >
                                <custom-icon class="access-block-image" icon="accessBlockedLogo"></custom-icon>
                                <div class="item-title">Find Your Profile Icon</div>
                                <div class="item-sub-title">
                                    In the top-right corner, click on your profile icon (circle with your picture or
                                    initial)
                                </div>
                            </div>
                                <div>
                                    <custom-icon class="access-block-image" icon="accessBlockSwitch"></custom-icon>
                                    <div class="item-title">Switch Profile</div>
                                    <div class="item-sub-title">
                                        Select your work account from the menu. If you don’t see your work account
                                        listed, click on "Add"
                                    </div>
                                </div>
                            </div>
                            ${this.getShowSkipLoginBtn()}
                            <div class="contact-support">
                                <span>Need help?</span>
                                <a class="email" href="mailto::${this.contactEmail}">Contact Support</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `}};P1([p()],h1.prototype,"contactEmail",2);P1([p({type:Boolean})],h1.prototype,"showSkipLoginBtn",2);P1([p()],h1.prototype,"companyLogo",2);P1([p()],h1.prototype,"subTitle",2);P1([p()],h1.prototype,"title",2);h1=P1([P("lit-access-blocked")],h1);function Le(i){var t,e,s="";if(typeof i=="string"||typeof i=="number")s+=i;else if(typeof i=="object")if(Array.isArray(i))for(t=0;t<i.length;t++)i[t]&&(e=Le(i[t]))&&(s&&(s+=" "),s+=e);else for(t in i)i[t]&&(s&&(s+=" "),s+=t);return s}function j1(){for(var i,t,e=0,s="";e<arguments.length;)(i=arguments[e++])&&(t=Le(i))&&(s&&(s+=" "),s+=t);return s}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const q3=i=>i.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Te={ATTRIBUTE:1,CHILD:2},Ve=i=>(...t)=>({_$litDirective$:i,values:t});let Pe=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const X1=(i,t)=>{var e,s;const o=i._$AN;if(o===void 0)return!1;for(const n of o)(s=(e=n)._$AO)===null||s===void 0||s.call(e,t,!1),X1(n,t);return!0},E2=i=>{let t,e;do{if((t=i._$AM)===void 0)break;e=t._$AN,e.delete(i),i=t}while(e?.size===0)},Oe=i=>{for(let t;t=i._$AM;i=t){let e=t._$AN;if(e===void 0)t._$AN=e=new Set;else if(e.has(i))break;e.add(i),W3(t)}};function k3(i){this._$AN!==void 0?(E2(this),this._$AM=i,Oe(this)):this._$AM=i}function X3(i,t=!1,e=0){const s=this._$AH,o=this._$AN;if(o!==void 0&&o.size!==0)if(t)if(Array.isArray(s))for(let n=e;n<s.length;n++)X1(s[n],!1),E2(s[n]);else s!=null&&(X1(s,!1),E2(s));else X1(this,i)}const W3=i=>{var t,e,s,o;i.type==Te.CHILD&&((t=(s=i)._$AP)!==null&&t!==void 0||(s._$AP=X3),(e=(o=i)._$AQ)!==null&&e!==void 0||(o._$AQ=k3))};class Y3 extends Pe{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,s){super._$AT(t,e,s),Oe(this),this.isConnected=t._$AU}_$AO(t,e=!0){var s,o;t!==this.isConnected&&(this.isConnected=t,t?(s=this.reconnected)===null||s===void 0||s.call(this):(o=this.disconnected)===null||o===void 0||o.call(this)),e&&(X1(this,t),E2(this))}setValue(t){if(q3(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Z3=()=>new G3;let G3=class{};const K2=new WeakMap,j3=Ve(class extends Y3{render(i){return y}update(i,[t]){var e;const s=t!==this.G;return s&&this.G!==void 0&&this.ot(void 0),(s||this.rt!==this.lt)&&(this.G=t,this.dt=(e=i.options)===null||e===void 0?void 0:e.host,this.ot(this.lt=i.element)),y}ot(i){var t;if(typeof this.G=="function"){const e=(t=this.dt)!==null&&t!==void 0?t:globalThis;let s=K2.get(e);s===void 0&&(s=new WeakMap,K2.set(e,s)),s.get(this.G)!==void 0&&this.G.call(this.dt,void 0),s.set(this.G,i),i!==void 0&&this.G.call(this.dt,i)}else this.G.value=i}get rt(){var i,t,e;return typeof this.G=="function"?(t=K2.get((i=this.dt)!==null&&i!==void 0?i:globalThis))===null||t===void 0?void 0:t.get(this.G):(e=this.G)===null||e===void 0?void 0:e.value}disconnected(){this.rt===this.lt&&this.ot(void 0)}reconnected(){this.ot(this.lt)}});/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Se="important",_3=" !"+Se,K3=Ve(class extends Pe{constructor(i){var t;if(super(i),i.type!==Te.ATTRIBUTE||i.name!=="style"||((t=i.strings)===null||t===void 0?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(i){return Object.keys(i).reduce(((t,e)=>{const s=i[e];return s==null?t:t+`${e=e.includes("-")?e:e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`}),"")}update(i,[t]){const{style:e}=i.element;if(this.ht===void 0){this.ht=new Set;for(const s in t)this.ht.add(s);return this.render(t)}this.ht.forEach((s=>{t[s]==null&&(this.ht.delete(s),s.includes("-")?e.removeProperty(s):e[s]="")}));for(const s in t){const o=t[s];if(o!=null){this.ht.add(s);const n=typeof o=="string"&&o.endsWith(_3);s.includes("-")||n?e.setProperty(s,n?o.slice(0,-11):o,n?Se:""):e[s]=o}}return b1}}),J3=N`
    .card {
        display: flex;
        color: black;
        width: fit-content;
        align-items: center;
        flex-direction: column;
        border: 2px solid var(--layer-x-color);
        border-radius: 4px;
        height: fit-content;
        box-shadow: 2px 2px 24px rgba(0, 0, 0, 0.5);
        padding: 26px;
        box-sizing: border-box;
        background-color: white;
        z-index: 2147483647; // Max int
        font-family: 'Montserrat';
    }

    .left {
        position: fixed;
        left: 20px;
    }

    .top {
        top: 20px;
    }

    .bottom {
        bottom: 20px;
    }

    .right {
        position: fixed;
        right: 20px;
    }

    .center {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .center-left {
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
    }

    .center-right {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
    }
`;var u1=(i=>(i.Center="center",i.LeftTop="top left",i.RightTop="top right",i.LeftBottom="bottom left",i.RightBottom="bottom right",i.LeftCenter="center-left",i.RightCenter="center-right",i))(u1||{}),$3=Object.defineProperty,t0=Object.getOwnPropertyDescriptor,t2=(i,t,e,s)=>{for(var o=s>1?void 0:s?t0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&$3(t,e,o),o};let L1=class extends R{constructor(){super(...arguments),this.cardRef=Z3(),this.position=u1.Center,this.styles={},this.shouldFocusAssurance={},this.dataTestId="",this.cleanupCallback=()=>{}}render(){return f`
            <style>
                ${J3}
            </style>
            <div
                data-test-id="${this.dataTestId}"
                ${j3(this.cardRef)}
                class=${j1("card",this.position)}
                style=${K3(this.styles)}
            >
                <slot></slot>
            </div>
        `}connectedCallback(){super.connectedCallback();const i=setTimeout(()=>{this.shouldFocusAssurance&&this.initFocusAssurance()},10);this.cleanupCallback=()=>{clearTimeout(i)}}disconnectedCallback(){super.disconnectedCallback(),this.cleanupCallback()}initFocusAssurance(){const i=new AbortController,t=this.cardRef.value;let e=null;t.addEventListener("focusin",o=>{const n=o.composedPath()[0];e&&clearTimeout(e),e=setTimeout(()=>{t.contains(this.shadowRoot.activeElement)||(n.addEventListener("focus",r=>{r.stopPropagation()},{once:!0,capture:!0,signal:i.signal}),n.focus())},100)},{capture:!0,signal:i.signal});const s=this.cleanupCallback;this.cleanupCallback=()=>{i.abort(),s()}}};t2([p()],L1.prototype,"position",2);t2([p({type:Object})],L1.prototype,"styles",2);t2([p({type:Boolean})],L1.prototype,"shouldFocusAssurance",2);t2([p()],L1.prototype,"dataTestId",2);L1=t2([P("lit-card")],L1);const e0={display:"grid",width:"370px",height:"auto",maxHeight:"95%",right:"-4px",borderRadius:"10px",gridTemplateRows:"auto auto 1fr auto",direction:"ltr",fontSize:"16px",fontFamily:"Montserrat",background:"white",color:"black",overflowWrap:"break-word"},i0=N`
    .message {
        overflow-y: auto;
        max-height: 100%;
    }

    .divider {
        background-color: $divider-color;
        margin: 15px 0;
        width: 100%;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        width: 100%;
    }

    .company-logo {
        max-width: 60%;
        max-height: 70px;
    }

    .content-title {
        display: block;
        width: 100%;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
    }

    p {
        line-height: 23px;
    }

    h1 {
        line-height: 28px !important;
    }

    h2 {
        line-height: 25px !important;
    }

    h3 {
        line-height: 23px !important;
    }

    .empty-hide:empty {
        display: none;
    }

    .reason {
        margin-top: 8px;
        font-size: 12px;
        color: #718794;
    }

    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding-top: 20px;
        gap: 12px;
    }
`;var At=(i=>(i.Close="close",i.Bypass="bypass",i))(At||{}),s0=Object.defineProperty,o0=Object.getOwnPropertyDescriptor,f1=(i,t,e,s)=>{for(var o=s>1?void 0:s?o0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&s0(t,e,o),o};let i1=class extends R{constructor(){super(...arguments),this.content="",this.reason="",this.contentTitle="",this.contactEmail="",this.companyLogo="",this.isByPassable=!1,this.getEffectiveTitle=()=>/<h[1-3]>/.test(this.content)?null:this.contentTitle,this.handleClose=()=>{B(this,{eventType:At.Close}),this.remove()},this.handleByPass=()=>{B(this,{eventType:At.Bypass}),this.remove()},this.getBypassBtn=()=>this.isByPassable?f`<lit-button .onclick=${this.handleByPass} dataTestId="bypass-button" text="Bypass"></lit-button>`:null}render(){return f`
            <style>
                ${i0}
            </style>
            <lit-card dataTestId="lit-block-alert" position=${u1.RightBottom} .styles=${e0}>
                <div class="header">
                    <img data-test-id="company-logo" class="company-logo" src=${this.companyLogo} />
                    <custom-icon dataTestId="close-button" .onclick=${this.handleClose} icon="closeIcon"></custom-icon>
                </div>
                <hr class="divider" />
                <div class="message">
                    <span class="content-title empty-hide">${this.getEffectiveTitle()}</span>
                    <lit-rich-text text="${this.content}"></lit-rich-text>

                    ${this.reason.length?f`<div class="reason" data-test-id="block-alert-reasons">${this.reason}</div>`:null}
                </div>
                <div class="actions">
                    <lit-button
                        dataTestId="dismiss-button"
                        .onclick=${this.handleClose}
                        type="secondary"
                        text="Dismiss"
                    ></lit-button>
                    ${this.getBypassBtn()}
                </div>
            </lit-card>
        `}};f1([p()],i1.prototype,"content",2);f1([p()],i1.prototype,"reason",2);f1([p()],i1.prototype,"contentTitle",2);f1([p()],i1.prototype,"contactEmail",2);f1([p()],i1.prototype,"companyLogo",2);f1([p()],i1.prototype,"isByPassable",2);i1=f1([P("lit-block-alert")],i1);const n0={height:"auto",width:"750px",borderRadius:"16px",padding:"20px",paddingBottom:"15px",boxSizing:"border-box",position:"relative"},r0=N`
    .backdrop {
        height: 100%;
        width: 100%;
        background: rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(4px);
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        direction: ltr;
        font-family: 'Montserrat';
        display: flex;
        justify-content: center;
        align-content: center;
    }

    .popup {
        height: auto;
        width: 750px;
        border-radius: 16px;
        padding: 20px;
        padding-bottom: 15px;
        box-sizing: border-box;
        position: relative;
    }

    .content {
        width: 100%;
        display: flex;
        flex-flow: column;
        align-items: center;
        text-align: center;
        height: 100%;
        background-color: #fff;
    }

    .header {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }

    .company-logo {
        max-width: 120px;
    }

    .title {
        font-weight: 700;
        font-size: 28px;
        line-height: 41px;
        color: #1b2f39;
        margin-top: 30px;
        margin-bottom: 20px;
    }

    .sub-title {
        margin-top: 6px;
        margin-left: 50px;
        margin-right: 50px;
    }

    .main {
        margin-top: 35px;
    }

    .purple {
        color: var(--layer-x-color);
        cursor: pointer;
    }

    .relaunch {
        color: #1b2f39;
    }

    .footer {
        margin-top: 35px;
        margin-bottom: 35px;
        width: 100%;
    }

    .actions {
        display: flex;
        gap: 13px;
        position: absolute;
        right: 10px;
    }
`;var ct=(i=>(i.Close="close",i.NavigateToSettings="navigateToSettings",i))(ct||{}),l0=Object.defineProperty,a0=Object.getOwnPropertyDescriptor,x2=(i,t,e,s)=>{for(var o=s>1?void 0:s?a0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&l0(t,e,o),o};let _1=class extends R{constructor(){super(...arguments),this.browserType="",this.companyLogo="",this.content="",this.handleClose=()=>{B(this,{eventType:ct.Close}),this.remove()},this.handleNavigateToSettings=()=>{B(this,{eventType:ct.NavigateToSettings}),this.remove()}}render(){return f`
            <style>
                ${r0}
            </style>
            <div class="backdrop">
                <lit-card position="${u1.Center}" .styles=${n0}>
                    <div class="content">
                        <div class="header">
                            <img class="company-logo" src="${this.companyLogo}" />
                            <custom-icon icon="closeIcon" .onclick=${this.handleClose}></custom-icon>
                        </div>
                        <div class="title">Browser Version Out Of Date</div>
                        <div class="sub-title">
                            <lit-rich-text text="${this.content}"></lit-rich-text>
                        </div>
                        <div class="footer">
                            <div class="actions">
                                <lit-button type="secondary" .onclick=${this.handleClose} text="Remind Me Later">
                                </lit-button>
                                <lit-button
                                    type="primary"
                                    .onclick=${this.handleNavigateToSettings}
                                    text="Go To Settings"
                                >
                                </lit-button>
                            </div>
                        </div>
                    </div>
                </lit-card>
            </div>
        `}};x2([p()],_1.prototype,"browserType",2);x2([p()],_1.prototype,"companyLogo",2);x2([p()],_1.prototype,"content",2);_1=x2([P("lit-browser-version-alert")],_1);const A0=N`
    .button {
        border: 1px solid var(--layer-x-color);
        color: white;
        width: 100%;
        padding: 10px 12px;
        border-radius: 4px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid var(--layer-x-color);
        white-space: nowrap;
        font-family: 'Montserrat';
    }

    .primary {
        background-color: var(--layer-x-color);
        color: white;
    }

    .disabled {
        background: lightgray;
        color: white;
        border-color: lightgray;
    }

    .secondary {
        color: var(--layer-x-color);
        background-color: white;
    }
    .text {
        color: var(--layer-x-color);
        background-color: transparent;
        border: none;
    }
`;var c0=Object.defineProperty,d0=Object.getOwnPropertyDescriptor,O1=(i,t,e,s)=>{for(var o=s>1?void 0:s?d0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&c0(t,e,o),o};let p1=class extends R{constructor(){super(...arguments),this.class="",this.type="primary",this.text="",this.disabled=!1,this.dataTestId=""}createRenderRoot(){return this}render(){return f`
            <style>
                ${A0}
            </style>
            <button
                data-test-id="${this.dataTestId}"
                .disabled=${this.disabled}
                class=${j1("button",{primary:this.type==="primary",secondary:this.type==="secondary",text:this.type==="text",disabled:this.disabled},this.class)}
            >
                ${this.text}
            </button>
        `}};O1([p()],p1.prototype,"class",2);O1([p()],p1.prototype,"type",2);O1([p()],p1.prototype,"text",2);O1([p()],p1.prototype,"disabled",2);O1([p()],p1.prototype,"dataTestId",2);p1=O1([P("lit-button")],p1);const h0={minHeight:"550px",width:"875px",borderRadius:"10px",padding:"24px",boxSizing:"border-box",position:"relative"},p0=N`
    .backdrop {
        height: 100%;
        width: 100%;
        background: rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(4px);
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        direction: ltr;
        font-family: 'Montserrat';
        display: flex;
        justify-content: center;
        align-content: center;
    }

    .content {
        display: flex;
        gap: 24px;
        justify-content: space-between;
        align-items: center;
        flex-flow: column;
        height: 100%;
        background-color: #fff;
        justify-content: center;
    }

    .main {
        width: 100%;
        height: 300px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 24px;
        margin-top: 12px;
    }

    .header {
        width: 100%;
        text-align: right;
    }

    .alert-message {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    h1 {
        font-weight: 700;
        font-size: 20px;
        line-height: 22px;
        color: #1b2f39;
        margin: 0;
    }

    .dots {
        width: 100%;
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        gap: 3px;
    }

    .dot {
        cursor: pointer;
        height: 8px;
        width: 8px;
        margin: 0 2px;
        background-color: #d9d9d9;
        border-radius: 50%;
        display: inline-block;
        transition: background-color 0.6s ease;
        &.active {
            background-color: var(--layer-x-color);
        }
    }

    .footer {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .company-logo {
        max-width: 120px;
    }
`;var dt=(i=>(i.Acknowledge="acknowledge",i.Close="close",i))(dt||{}),C0=Object.defineProperty,u0=Object.getOwnPropertyDescriptor,J=(i,t,e,s)=>{for(var o=s>1?void 0:s?u0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&C0(t,e,o),o};const J2=6;let G=class extends R{constructor(){super(...arguments),this.companyLogo="",this.extensions="",this.content="",this.isDisabled=!1,this.shouldRenderActions=!1,this._extensionsData="",this._currentPage=1,this._numberOfPages=1,this.handleClose=()=>{B(this,{eventType:dt.Close}),this.isDisabled||B(this,{eventType:dt.Acknowledge}),this.remove()},this.firstUpdated=()=>{this._extensionsData=this.extensions,this._currentPage=1,this._numberOfPages=Math.ceil(JSON.parse(this._extensionsData).length/J2)},this.renderExtensions=i=>{if(!this._extensionsData)return;const t=JSON.parse(this._extensionsData).slice(J2*(i-1),J2*i);return f`
            ${t.map(e=>f`
                    <lit-extension-info
                        .extension=${e}
                        .isDisabled=${this.isDisabled}
                        .shouldRenderActions=${this.shouldRenderActions}
                    ></lit-extension-info>
                `)}
        `},this.renderPagination=()=>{const i=Array.from({length:this._numberOfPages},(t,e)=>e+1);if(i.length!==1)return f`<div class="dots">
            ${i.map(t=>f`<span
                    class="${j1("dot",{active:this._currentPage===t})}"
                    .onclick=${()=>{this._currentPage=t}}
                ></span>`)}
        </div>`}}render(){return f`
            <style>
                ${p0}
            </style>
            <div class="backdrop">
                <lit-card position=${u1.Center} .styles=${h0}>
                    <div class="header">
                        <custom-icon class="close" icon="closeIcon" .onclick=${this.handleClose}></custom-icon>
                    </div>
                    <div class="content">
                        <div class="alert-message">
                            <h1>Manage Extensions</h1>
                            <lit-rich-text text="${this.content}"></lit-rich-text>
                        </div>
                        <div
                            class="main"
                            .style=${{minHeight:this._currentPage>1?"300px":""}}
                        >
                            ${this.renderExtensions(this._currentPage)}
                        </div>
                        ${this.renderPagination()}
                        <div class="footer">
                            <img class="company-logo" src=${this.companyLogo} />
                        </div>
                    </div>
                </lit-card>
            </div>
        `}};J([p()],G.prototype,"companyLogo",2);J([p()],G.prototype,"extensions",2);J([p()],G.prototype,"content",2);J([p({type:Boolean})],G.prototype,"isDisabled",2);J([p({type:Boolean})],G.prototype,"shouldRenderActions",2);J([b()],G.prototype,"_extensionsData",2);J([b()],G.prototype,"_currentPage",2);J([b()],G.prototype,"_numberOfPages",2);G=J([P("lit-extension-alert")],G);const ae=N`
    .extension-card {
        width: 100%;
        height: 100%;
        padding: 14px 18px 16px 18px;
        box-sizing: border-box;
        border: 1px solid #dbe3e8;
        box-shadow: 2px 2px 24px rgba(220, 205, 205, 0.08);
        display: flex;
        flex-flow: column;
        justify-content: space-between;
        background-color: #fff;
    }

    .header {
        display: flex;
    }

    .icon {
        align-self: flex-start;
        width: 36px;
        height: 36px;
        margin-right: 16px;
    }

    .extension-content {
        display: grid;
        grid-template-rows: auto 1fr;
    }

    .extension-name {
        font-size: 13px;
        color: #0f4354;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
        white-space: nowrap;
    }

    .extension-desc {
        margin-top: 5px;
        line-height: 15px !important;
        font-size: 12px;
        color: #708794;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .remove-btn {
        width: 87px;
        height: 32px;
        font-size: 12px;
    }
`;var ht=(i=>(i.ExtensionChange="extensionChange",i.NavigateToExtensions="navigateToExtensions",i))(ht||{}),f0=Object.defineProperty,g0=Object.getOwnPropertyDescriptor,e2=(i,t,e,s)=>{for(var o=s>1?void 0:s?g0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&f0(t,e,o),o};let T1=class extends R{constructor(){super(...arguments),this.isDisabled=!1,this.shouldRenderActions=!1,this.extension={id:"",name:"",description:"",enabled:!1},this.handleExtensionChange=i=>{const t=i.target;B(this,{eventType:ht.ExtensionChange,detail:{extensionId:t.id,status:t.checked}})},this.handleNavigateToExtensions=()=>{B(this,{eventType:ht.NavigateToExtensions})},this.getActions=()=>{if(!this.shouldRenderActions)return;const{id:i,enabled:t}=this.extension;return f`
            <style>
                ${ae}
            </style>
            <div class="actions">
                <lit-button
                    type="secondary"
                    class="remove-btn"
                    .onclick=${this.handleNavigateToExtensions}
                    text="Remove"
                >
                </lit-button>
                <lit-switch
                    id="${i}"
                    .checked=${this.isDisabled?!1:t}
                    .disabled=${this.isDisabled}
                    .onchange=${this.handleExtensionChange}
                ></lit-switch>
            </div>
        `}}setImage(){const i=`https://layerx-dev-assets.s3.amazonaws.com/extension/${this.extension.id}.png`,t=new Image;t.src=i,t.onerror=()=>{this.icon=f`<custom-icon id="extension-icon" class="icon" icon="defaultExtensionIcon"></custom-icon>`},this.icon=f`<img id="extension-icon" class="icon" src=${i} />`}firstUpdated(){this.setImage()}render(){const{description:i,name:t}=this.extension;return f`
            <style>
                ${ae}
            </style>
            <div class="extension-card">
                <div class="header">
                    ${this.icon}
                    <div class="extension-content">
                        <div class="extension-name">${t}</div>
                        <div class="extension-desc">${i}</div>
                    </div>
                </div>
                ${this.getActions()}
            </div>
        `}};e2([p({type:Boolean})],T1.prototype,"isDisabled",2);e2([p({type:Boolean})],T1.prototype,"shouldRenderActions",2);e2([p({type:Object})],T1.prototype,"extension",2);e2([b()],T1.prototype,"icon",2);T1=e2([P("lit-extension-info")],T1);const m0=f`
    <svg
        width="114"
        height="29"
        viewBox="0 0 114 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
    >
        <rect width="114" height="29" fill="url(#pattern0)" />
        <defs>
            <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_2_17798" transform="matrix(0.000825928 0 0 0.00324675 0.00444292 0)" />
            </pattern>
            <image
                id="image0_2_17798"
                width="1200"
                height="308"
                xlink:href="data:image/png;base64,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U1EUl1HHcWEc5efoKMIlOsqMCzOOK6IO4LiM64g7RlABoVkSOqGTWk5VVxrbbJ29k65znvmjkxgge6rqqapzf66LixBC1zchqTrnOe95j0rlRwBm1eo1iIiIiIiIiIjooNZO3jn1w9YR1eBq8UUznncJxP0SHF4REREREREREdkQvG9g3cA264xqqPoAK9OTeqWqfg9Ae7W/NhERERERERERHZE7cr7/beuIaqnqACvTk7pCRb8FCJ80SERERERERERkY0M8DK4AoNYh1VK1Adae4dXNAGLV+ppERERERERERHSUBG8ZHBoats6opqqslEp73gtV9SZweEVEREREREREZEaht+T94g+tO6rtuFdg9fb0ng/F9wEkqtBDRERERERERETHRPpDkb+1rqiF4xpgzU8mT3ES/gjAlCr1EBERERERERHR0dsQOlzm+/6YdUgtHPMAq7e3d3oI+aECM6sZRERERERERERER0UheEuhUChah9TKsQ6wYhIE3wOwoJoxRERERERERER0lAR/l/P9ltv3an/HNMBKJ1PXAXJhtWOIiIiIiIiIiOjIieDanO9/ybqj1o56gJVOJp8H6AdqEUNEREREREREREdGgJuzvn+tdUc9HNUAq6en50RA/uto/zsiIiIiIiIiIqoixRezRf/NANQ6pR6OahCVcO6zALpq1EJERERERERERIej+GKu5L8DERleAUcxwMp43kVQXFHLGCIiIiIiIiIiOjiB3Jor+e9EhIZXwBEOsJ4+Z85UVXwZgNS4h4iIiIiIiIiInkxFcG22WLgCQGAdU2/xI/lBO6ZMuRqKnlrHEBERERERERHRk+yG4K1Z3/+GdYiVww6wPM/zVPH+esQQEREREREREdHjjCr0tXm/eLt1iKXDDrBiio8DmFKHFiIiIiIiIiIi+qt7pBJ/ZW5ttmwdYu2Qe2D1dveeBuBVdWohIiIiIiIiIiIAENwoifjSLIdXAA6zAsvFwg/oUTypkGpqFIJfieoyEemXMFw3Bmza+y9FpG2y6pRQZDpEJoeh6xAXdgCYLKpzFUgJ4CkkBSAFoN3sZ0JEREREREREB6HbFHhP3i9+zbqkkRx0gOV53smqeHU9Y+jJFHhIBJ/dVal8p1wu76zW102lUnPiwMJA9ZkCnAHVZwI4GZAj2tifiIiIiIiIiKpN+jXmLs/n86utSxrNQYcVsRBXQbj6yooC2x30I7li8XOoweMxC4XCCIARAHfu/b7u7u4pU+Lxp4ehnAXoBRAsBTC92q9NRERERERERI8TAPrpto6p/zwwMLDbOqYRHXCAdfLcubPGBVfUO4b2GVYnL84W/Ifr+aJ7Vnjdu+evfwcQy3jemap6ASAXADgHQFs9m4iIiIiIiIhamQAPh6H72/xQ/j7rlkZ2wBVWlUTireAeSVbyoZNzC4VCXYdXBxFkff+eXLF4fa7oPw/AD6yDiIiIiIiIiFrEThF8cHrnrDM5vDq8A63Acqp4W91LCAC2ioZ/UyiUitYhRERERERERFQTCsF3Y2H4T6uL6WeajAAAIABJREFUpTx837qnKTxpgJXxvCWqSFrEkL4hWyoNWFcQERERERERUS3o753I+9b4/r3WJc3mSQMsVX0dIBYtkSbAbdlikbfoEREREREREbUYBR4SwbU5v/hD65Zm9bgBlud5bVC8wiomunQ9EomrrCuIiIiIiIiIqKruVuj1+WLxdgBqHdPMHjfAiofyfBWdYRUTWSo3ZLPZddYZRERERERERHTcFIpfQvSTuWLxt9YxreJxA6xQcAlvHqy7dVN37fy8dQQRERERERERHZe/iOALsSD48uDQ0LB1TKvZf4AlAn2hWUlk6ZeWj4xst64gIiIiIiIiomMh/VB8aequHbfx/L529g2wMsnkGQrMtYyJoDAQuck6goiIiIiIiIiOyjpR3BrE5OZCobDcOiYK9g2wQpXnC+8frDO9w/eLvnUFERERERERER3WGICfQ/CNGbNm/bS/v3/cOihK/noLocN53A+/zkRusU4gIiIiIiIiooPaDOB2UfnB5J3tPxtYN7ANAOD7plFRtHeA5ZziPM6v6iqI7Z70U+sIIiIiIiIiInqcEhQ/g+iPJJG4I5vN7rIOoj0DrFQqdaqGOtM6JmLuXD28er11BBEREREREVG06TaI/Ayh/Dou4a8Gi8WCdRE9WRwAJAwXA9wAq54E+mvrBiIiIiIiIqII8gE8CMiDqvIg4rgrn89vto6iQ4sDgFM5TTm/qisF7rZuICIiIiIiImphjwFYDegawA0C4QPjqg+WSqVN1mF09OIAoCKngTu411PQtqPjPusIIiIiIiIioia2U4AiBENQlBWaE3VrIOGayTs61uzbcJ1awp5N3PXpthkRI1jJP0hEREREREREB7QV0BFA1kGwThTrQ8WIQB4TRREuHHLjk4e4r3S0xBd0LegMsHu2dUjErLIOICIiIiIiIqqyrQAqADYBGAdkG0R3QLEVwBYItgiwSVW3Qt0WON0y8e3YlpgL10ulsi5sa1vPp/7RgcSD+FgScNYdkSLAo9YNRERERERE1Or0BlXZ8MTvFYdRhPKkfYRkYvA08V86HdfQ7btzSCTYAdV9gyVRHQ3i8UoQBFvCMBwrl8s7a/EzINorriJJ7t9eXyEHWERERERERFRrQfzL+XIua51BVA3OAZ51RNRIGJasG4iIiIiIiIiImoWDyjzriMgJEyPWCUREREREREREzcJBhBu419nOcOewdQMRERERERERUbNwCp1pHRExY8PDwzusI4iIiIiIiIiImoVTgAOs+tpuHUBERERERERE1EycCAdYdaXg6isiIiIiIiIioqPgoJhmHREpgp3WCUREREREREREzcQJMMk6ImLUOoCIiIiIiIiIqJk4hXKAVV8J6wAiIiIiIiIiombiAOEAq77i1gFERERERERERM3EgSuC6o0DLGp8ofBW13pzEOsEIiIiIiKiRuUAVKwjIoYDLGp4KiHfF+pMgTbrBiIiIqLaknHrgsgRHmNS63AK7LaOiBiueKOG59TxfaHOVKXDuoGIiIioppTnnvXmYsFU6waianHCAVa9cQUWNT4eXNSdQHlwQURERC1NHY8x6y1UHmNS63DgAKveOMCihqcx5ftCnQmUK7CIiIiopTkVHmPWmajjAItahlNgh3VExEwGuFkzNTYnwveFOlMIDy6IiIiopSlCHmPWmTquwKLW4QSy0ToiYlwmk5lmHUF0KBoE660bokfnWRcQERER1ZTw3LPuVLqtE4iqxanqBuuIqFHV6dYNRIeiiQQHWHUnqUwmM9m6goiIiKhWNAQHWPUmOt86gahanAjfROpNxsdPsG4gOpR5uXkbAah1R8TEZHy81zqCiIiIqFaccPFE3SkWWCcQVYtTCN9E6izQ2EzrBqJDWYZlFQCbrTuiRkPHK2RERETUslR47ll/mrEuIKoWJ6ol64iocTHtsm4gOhwBitYNURPG9GnWDUREREQ1w3NPAzI3k8nwDiBqCU4gvnVE1AjAARY1PAXy1g1RI6oXWDcQERER1UoFKFg3RJBopfI86wiianDilKss6kxVT7JuIDocBXzr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"
            />
        </defs>
    </svg>
`,E0=f`
    <style>
        ${N`
            svg {
                height: 24px;
                width: 24px;
                cursor: pointer;
                stroke: var(--layer-x-color);
            }`}
    </style>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2L22 22" stroke-width="3" />
        <path d="M22 2L2 22" stroke-width="3" />
    </svg>
`,v0=f`
    <svg width="38" height="39" viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M33.4166 18.7174H30.7784V11.587C30.7784 9.62614 29.1955 8.02179 27.2609 8.02179H20.2258V5.34788C20.2258 2.85223 18.2912 0.891357 15.8289 0.891357C13.3666 0.891357 11.432 2.85223 11.432 5.34788V8.02179H4.39693C2.46228 8.02179 0.879395 9.62614 0.879395 11.587V18.3609H3.51754C6.15569 18.3609 8.26621 20.5001 8.26621 23.174C8.26621 25.8479 6.15569 27.987 3.51754 27.987H0.879395V34.7609C0.879395 36.7218 2.46228 38.3261 4.39693 38.3261H11.0802V35.6522C11.0802 32.9783 13.1908 30.8392 15.8289 30.8392C18.4671 30.8392 20.5776 32.9783 20.5776 35.6522V38.3261H27.2609C29.1955 38.3261 30.7784 36.7218 30.7784 34.7609V27.6305H33.4166C35.8788 27.6305 37.8135 25.6696 37.8135 23.174C37.8135 20.6783 35.8788 18.7174 33.4166 18.7174Z"
            fill="#B9CCD6"
        />
    </svg>
`,w0=f`
    <svg width="144" height="22" viewBox="0 0 144 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M1.104 9.116H3.288C4.224 9.116 4.944 9.296 5.448 9.656C5.96 10.008 6.216 10.592 6.216 11.408C6.216 12.2 5.96 12.8 5.448 13.208C4.936 13.608 4.232 13.808 3.336 13.808H1.992V17H1.104V9.116ZM3.204 13.076C3.932 13.076 4.468 12.944 4.812 12.68C5.156 12.408 5.328 11.984 5.328 11.408C5.328 10.832 5.152 10.428 4.8 10.196C4.448 9.956 3.9 9.836 3.156 9.836H1.992V13.076H3.204ZM9.68531 17.144C9.20531 17.144 8.76131 17.024 8.35331 16.784C7.94531 16.536 7.61731 16.184 7.36931 15.728C7.12931 15.264 7.00931 14.72 7.00931 14.096C7.00931 13.472 7.12931 12.928 7.36931 12.464C7.61731 12 7.94531 11.648 8.35331 11.408C8.76131 11.16 9.20531 11.036 9.68531 11.036C10.1653 11.036 10.6093 11.16 11.0173 11.408C11.4253 11.648 11.7493 12 11.9893 12.464C12.2373 12.928 12.3613 13.472 12.3613 14.096C12.3613 14.72 12.2373 15.264 11.9893 15.728C11.7493 16.184 11.4253 16.536 11.0173 16.784C10.6093 17.024 10.1653 17.144 9.68531 17.144ZM9.68531 16.412C10.0293 16.412 10.3333 16.316 10.5973 16.124C10.8693 15.932 11.0813 15.66 11.2333 15.308C11.3853 14.956 11.4613 14.552 11.4613 14.096C11.4613 13.64 11.3853 13.236 11.2333 12.884C11.0813 12.532 10.8693 12.26 10.5973 12.068C10.3333 11.868 10.0293 11.768 9.68531 11.768C9.34131 11.768 9.03331 11.868 8.76131 12.068C8.49731 12.26 8.28931 12.532 8.13731 12.884C7.99331 13.236 7.92131 13.64 7.92131 14.096C7.92131 14.792 8.08531 15.352 8.41331 15.776C8.74131 16.2 9.16531 16.412 9.68531 16.412ZM13.1786 11.18H14.0786L14.9906 14.648L15.0986 15.164C15.2106 15.644 15.2906 16.008 15.3386 16.256H15.3866C15.5386 15.632 15.6746 15.096 15.7946 14.648L16.7306 11.18H17.6066L18.5546 14.648L18.9626 16.256H19.0106L19.3946 14.648L20.2826 11.18H21.1226L19.5386 17H18.4586L17.5706 13.748L17.3426 12.8C17.3266 12.736 17.2706 12.496 17.1746 12.08H17.1266C16.9506 12.872 16.8106 13.436 16.7066 13.772L15.8426 17H14.8226L13.1786 11.18ZM26.835 13.76C26.835 13.968 26.823 14.144 26.799 14.288H22.779C22.819 14.968 23.027 15.496 23.403 15.872C23.787 16.248 24.255 16.436 24.807 16.436C25.319 16.436 25.811 16.28 26.283 15.968L26.607 16.544C26.319 16.728 26.023 16.876 25.719 16.988C25.415 17.092 25.075 17.144 24.699 17.144C24.187 17.144 23.719 17.024 23.295 16.784C22.879 16.536 22.547 16.18 22.299 15.716C22.059 15.252 21.939 14.712 21.939 14.096C21.939 13.488 22.059 12.952 22.299 12.488C22.547 12.024 22.871 11.668 23.271 11.42C23.671 11.164 24.095 11.036 24.543 11.036C25.263 11.036 25.823 11.28 26.223 11.768C26.631 12.248 26.835 12.912 26.835 13.76ZM26.055 13.652C26.055 13.036 25.923 12.564 25.659 12.236C25.395 11.908 25.027 11.744 24.555 11.744C24.123 11.744 23.739 11.908 23.403 12.236C23.067 12.564 22.867 13.036 22.803 13.652H26.055ZM28.3013 11.18H29.0213L29.0933 12.248H29.1293C29.3293 11.872 29.5733 11.576 29.8613 11.36C30.1493 11.144 30.4573 11.036 30.7853 11.036C31.0173 11.036 31.2173 11.076 31.3853 11.156L31.2173 11.924C31.0093 11.86 30.8253 11.828 30.6653 11.828C30.3933 11.828 30.1213 11.94 29.8493 12.164C29.5853 12.388 29.3573 12.736 29.1653 13.208V17H28.3013V11.18ZM36.7022 13.76C36.7022 13.968 36.6902 14.144 36.6662 14.288H32.6462C32.6862 14.968 32.8942 15.496 33.2702 15.872C33.6542 16.248 34.1222 16.436 34.6742 16.436C35.1862 16.436 35.6782 16.28 36.1502 15.968L36.4742 16.544C36.1862 16.728 35.8902 16.876 35.5862 16.988C35.2822 17.092 34.9422 17.144 34.5662 17.144C34.0542 17.144 33.5862 17.024 33.1622 16.784C32.7462 16.536 32.4142 16.18 32.1662 15.716C31.9262 15.252 31.8062 14.712 31.8062 14.096C31.8062 13.488 31.9262 12.952 32.1662 12.488C32.4142 12.024 32.7382 11.668 33.1382 11.42C33.5382 11.164 33.9622 11.036 34.4102 11.036C35.1302 11.036 35.6902 11.28 36.0902 11.768C36.4982 12.248 36.7022 12.912 36.7022 13.76ZM35.9222 13.652C35.9222 13.036 35.7902 12.564 35.5262 12.236C35.2622 11.908 34.8942 11.744 34.4222 11.744C33.9902 11.744 33.6062 11.908 33.2702 12.236C32.9342 12.564 32.7342 13.036 32.6702 13.652H35.9222ZM40.1244 17.144C39.3884 17.144 38.8044 16.876 38.3724 16.34C37.9484 15.804 37.7364 15.056 37.7364 14.096C37.7364 13.488 37.8524 12.952 38.0844 12.488C38.3164 12.024 38.6244 11.668 39.0084 11.42C39.4004 11.164 39.8204 11.036 40.2684 11.036C40.5804 11.036 40.8604 11.092 41.1084 11.204C41.3564 11.316 41.6284 11.488 41.9244 11.72L41.8884 10.712V8.432H42.7524V17H42.0324L41.9604 16.292H41.9244C41.6764 16.548 41.3964 16.756 41.0844 16.916C40.7804 17.068 40.4604 17.144 40.1244 17.144ZM40.3164 16.4C40.5964 16.4 40.8604 16.332 41.1084 16.196C41.3644 16.06 41.6244 15.852 41.8884 15.572V12.416C41.6324 12.192 41.3844 12.032 41.1444 11.936C40.9044 11.832 40.6564 11.78 40.4004 11.78C40.0724 11.78 39.7724 11.88 39.5004 12.08C39.2364 12.28 39.0244 12.556 38.8644 12.908C38.7124 13.26 38.6364 13.656 38.6364 14.096C38.6364 14.816 38.7804 15.38 39.0684 15.788C39.3644 16.196 39.7804 16.4 40.3164 16.4ZM49.6879 17.144C49.4159 17.144 49.1319 17.08 48.8359 16.952C48.5399 16.816 48.2639 16.632 48.0079 16.4H47.9719L47.8879 17H47.1919V8.432H48.0559V10.808L48.0319 11.876C48.6799 11.316 49.3039 11.036 49.9039 11.036C50.6479 11.036 51.2159 11.304 51.6079 11.84C52.0079 12.368 52.2079 13.088 52.2079 14C52.2079 14.64 52.0919 15.2 51.8599 15.68C51.6279 16.152 51.3199 16.516 50.9359 16.772C50.5519 17.02 50.1359 17.144 49.6879 17.144ZM49.5439 16.4C49.8799 16.4 50.1799 16.304 50.4439 16.112C50.7159 15.912 50.9279 15.632 51.0799 15.272C51.2319 14.912 51.3079 14.492 51.3079 14.012C51.3079 13.316 51.1759 12.772 50.9119 12.38C50.6559 11.98 50.2519 11.78 49.6999 11.78C49.2039 11.78 48.6559 12.06 48.0559 12.62V15.764C48.3119 15.98 48.5679 16.14 48.8239 16.244C49.0879 16.348 49.3279 16.4 49.5439 16.4ZM53.7781 19.544C53.5381 19.544 53.3181 19.504 53.1181 19.424L53.2861 18.716C53.4461 18.78 53.5981 18.812 53.7421 18.812C54.0621 18.812 54.3341 18.692 54.5581 18.452C54.7821 18.212 54.9621 17.888 55.0981 17.48L55.2421 17.036L52.8901 11.18H53.7901L55.0381 14.516L55.6141 16.148H55.6621C55.7741 15.812 55.8901 15.444 56.0101 15.044L56.1661 14.516L57.2581 11.18H58.1101L55.9021 17.54C55.6781 18.164 55.3981 18.652 55.0621 19.004C54.7341 19.364 54.3061 19.544 53.7781 19.544Z"
            fill="#708794"
        />
        <g clip-path="url(#clip0_762_30388)">
            <path
                d="M74.6002 15.2741V16.6974C74.6002 17.0246 74.3428 17.2894 74.0248 17.2894H65.5754C65.2574 17.2894 65 17.0246 65 16.6974V0.842928C65 0.515752 65.2574 0.250977 65.5754 0.250977H67.1427C67.4607 0.250977 67.7181 0.515752 67.7181 0.842928V14.0885C67.7181 14.4156 67.9755 14.6804 68.2935 14.6804H74.0248C74.3428 14.6804 74.6002 14.9452 74.6002 15.2724V15.2741Z"
                fill="#1B2F39"
            />
            <path
                d="M88.1103 4.73034V16.6891C88.1103 17.0163 87.8529 17.2811 87.5349 17.2811H86.4808C86.1988 17.2811 85.9578 17.0719 85.9119 16.7852L85.7349 15.6823C84.5775 16.8864 82.9643 17.6082 81.102 17.6082C77.297 17.6082 74.4494 14.6485 74.4494 10.7089C74.4494 6.76928 77.2953 3.82471 81.102 3.82471C82.9856 3.82471 84.6152 4.55663 85.7758 5.78101L85.9939 4.61735C86.0463 4.33908 86.2824 4.1367 86.5595 4.1367H87.5349C87.8529 4.1367 88.1103 4.40148 88.1103 4.72865V4.73034ZM85.3693 11.7444C86.0414 8.61934 83.8069 6.03061 80.72 6.43536C78.6167 6.71026 77.1248 8.45407 77.1248 10.7089C77.1248 13.1694 78.9003 15.0212 81.3102 15.0212C83.3692 15.0212 84.9529 13.6804 85.3709 11.7427L85.3693 11.7444Z"
                fill="#1B2F39"
            />
            <path
                d="M101.701 4.14502C102.119 4.14502 102.397 4.58856 102.225 4.98151L96.722 17.5272C95.2793 20.831 94.0072 21.9997 91.4038 21.9997H90.6809C90.3628 21.9997 90.1054 21.7349 90.1054 21.4077V19.5661H91.2005C92.8907 19.5661 93.4104 19.0585 94.3465 16.9554L94.6318 16.3365L89.4546 4.98825C89.2759 4.59531 89.5546 4.14502 89.9759 4.14502H91.5563C91.7825 4.14502 91.9858 4.27994 92.0809 4.49243L95.6056 12.4475C95.7531 12.7781 96.2121 12.773 96.3498 12.4391L99.6483 4.50592C99.7384 4.28837 99.9466 4.14671 100.178 4.14671H101.701V4.14502Z"
                fill="#1B2F39"
            />
            <path
                d="M115.116 11.6347H105.421C105.058 11.6347 104.801 12.0024 104.909 12.3566C105.434 14.0565 106.811 15.0751 108.655 15.0751C110.063 15.0751 111.226 14.4562 111.927 13.419C112.037 13.2554 112.211 13.1492 112.403 13.1492H113.963C114.396 13.1492 114.68 13.6265 114.478 14.0211C113.324 16.2742 111.196 17.6082 108.655 17.6082C104.919 17.6082 102.091 14.6417 102.091 10.7173C102.091 6.79289 104.912 3.82471 108.655 3.82471C112.398 3.82471 115.168 6.92275 115.168 10.7477C115.168 11.0428 115.144 11.3396 115.114 11.6347H115.116ZM105.54 9.43897H111.798C112.176 9.43897 112.442 9.03927 112.294 8.68005C111.663 7.14705 110.34 6.26334 108.655 6.26334C106.97 6.26334 105.64 7.1791 105.04 8.6868C104.898 9.04433 105.165 9.43897 105.54 9.43897Z"
                fill="#1B2F39"
            />
            <path
                d="M123.888 4.26306C124.055 4.4452 124.05 4.87019 124.05 4.87019V6.03217C124.05 6.35934 123.793 6.62412 123.475 6.62412H122.663C120.491 6.62412 119.408 7.89909 119.408 10.2787V16.6957C119.408 17.0229 119.15 17.2877 118.832 17.2877H117.357C117.039 17.2877 116.781 17.0229 116.781 16.6957V4.73696C116.781 4.40978 117.039 4.14501 117.357 4.14501H118.111C118.375 4.14501 118.604 4.32883 118.668 4.59023L119.003 5.93772C119.918 4.69142 121.17 4.0708 122.914 4.0708H123.327C123.327 4.0708 123.721 4.07923 123.888 4.26137V4.26306Z"
                fill="#1B2F39"
            />
            <path
                d="M139.636 11.1642C138.364 9.85551 138.364 7.73562 139.636 6.4286L143.52 2.43336C144.033 1.90549 144.033 1.04876 143.52 0.520899C143.007 -0.00696628 142.174 -0.00696628 141.661 0.520899L137.777 4.51615C136.505 5.82485 134.444 5.82485 133.174 4.51615L129.29 0.520899C128.777 -0.00696628 127.944 -0.00696628 127.431 0.520899C126.918 1.04876 126.918 1.90549 127.431 2.43336L131.314 6.4286C132.587 7.7373 132.587 9.8572 131.314 11.1642L127.498 15.0903C127.003 15.5996 126.903 16.4395 127.355 16.9893C127.619 17.3097 127.99 17.4682 128.36 17.4682C128.696 17.4682 129.032 17.3367 129.29 17.0719L133.174 13.0767C134.446 11.768 136.506 11.768 137.777 13.0767L141.661 17.0719C141.918 17.3367 142.254 17.4682 142.59 17.4682C142.961 17.4682 143.329 17.308 143.595 16.9893C144.049 16.4395 143.949 15.6013 143.452 15.0903L139.636 11.1642Z"
                fill="#1B2F39"
            />
            <path
                d="M134.539 0.386202C134.782 0.136604 135.105 0 135.447 0C135.79 0 136.113 0.136604 136.356 0.387888C136.598 0.637486 136.731 0.96972 136.731 1.32219C136.731 1.67466 136.598 2.0069 136.356 2.2565C136.295 2.3189 136.229 2.37455 136.159 2.42177C135.949 2.56512 135.703 2.6427 135.447 2.6427C135.19 2.6427 134.944 2.56512 134.736 2.42177C134.665 2.37455 134.6 2.3189 134.539 2.2565C134.297 2.0069 134.164 1.67466 134.164 1.32219C134.164 0.96972 134.297 0.637486 134.541 0.387888L134.539 0.386202Z"
                fill="#725BF6"
            />
            <path
                d="M136.356 17.2072C136.113 17.4568 135.79 17.5951 135.447 17.5951C135.105 17.5951 134.782 17.4585 134.539 17.2072C134.297 16.9576 134.164 16.6254 134.164 16.2729C134.164 15.9204 134.297 15.5882 134.539 15.3386C134.782 15.089 135.105 14.9524 135.447 14.9524C135.79 14.9524 136.113 15.089 136.356 15.3386C136.598 15.5882 136.731 15.9204 136.731 16.2729C136.731 16.6254 136.598 16.9576 136.356 17.2072Z"
                fill="#725BF6"
            />
            <path
                d="M126.896 8.7968C126.896 8.44433 127.029 8.11209 127.272 7.8625C127.514 7.6129 127.837 7.47461 128.18 7.47461C128.523 7.47461 128.846 7.6129 129.088 7.8625C129.331 8.11209 129.464 8.44433 129.464 8.7968C129.464 8.8845 129.455 8.97219 129.439 9.05652C129.39 9.31118 129.27 9.54391 129.088 9.73111C128.846 9.9807 128.523 10.1173 128.18 10.1173C127.837 10.1173 127.514 9.9807 127.272 9.73111C127.029 9.48151 126.896 9.14927 126.896 8.7968Z"
                fill="#725BF6"
            />
            <path
                d="M143.623 9.73262C143.121 10.2487 142.307 10.2487 141.807 9.73262C141.564 9.48302 141.431 9.15078 141.431 8.79831C141.431 8.71062 141.439 8.62292 141.456 8.5386C141.467 8.47451 141.485 8.41211 141.507 8.35308C141.569 8.17094 141.672 8.00567 141.808 7.86569C142.059 7.60766 142.389 7.47949 142.716 7.47949C143.044 7.47949 143.374 7.60766 143.625 7.86569C143.867 8.11529 144 8.44753 144 8.8C144 9.15247 143.867 9.48471 143.625 9.7343L143.623 9.73262Z"
                fill="#725BF6"
            />
        </g>
        <defs>
            <clipPath id="clip0_762_30388">
                <rect width="79" height="22" fill="white" transform="translate(65)" />
            </clipPath>
        </defs>
    </svg>
`,x0=f`
    <svg width="118" height="18" viewBox="0 0 118 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M0.903273 14.0908V7.64027H2.69018C3.168 7.64027 3.58691 7.70246 3.94691 7.82682C4.30691 7.94464 4.58509 8.141 4.78145 8.41591C4.98436 8.68427 5.08582 9.05082 5.08582 9.51555C5.08582 9.96064 4.98764 10.3272 4.79127 10.6152C4.59491 10.9032 4.32 11.1192 3.96655 11.2632C3.61309 11.4072 3.20073 11.4792 2.72945 11.4792H1.62982V14.0908H0.903273ZM1.62982 10.8803H2.62145C3.21055 10.8803 3.64582 10.7723 3.92727 10.5563C4.21527 10.3337 4.35927 9.98682 4.35927 9.51555C4.35927 9.03118 4.20873 8.69737 3.90764 8.51409C3.61309 8.32427 3.17127 8.22937 2.58218 8.22937H1.62982V10.8803ZM8.16405 14.2086C7.77787 14.2086 7.41787 14.1105 7.08405 13.9141C6.75023 13.7177 6.48187 13.4363 6.27896 13.0697C6.07605 12.6966 5.97459 12.245 5.97459 11.7148C5.97459 11.1846 6.07605 10.733 6.27896 10.3599C6.48187 9.98682 6.75023 9.70209 7.08405 9.50573C7.41787 9.30937 7.77787 9.21118 8.16405 9.21118C8.55023 9.21118 8.90696 9.30937 9.23423 9.50573C9.56805 9.70209 9.83641 9.98682 10.0393 10.3599C10.2488 10.733 10.3535 11.1846 10.3535 11.7148C10.3535 12.245 10.2488 12.6966 10.0393 13.0697C9.83641 13.4363 9.56805 13.7177 9.23423 13.9141C8.90696 14.1105 8.55023 14.2086 8.16405 14.2086ZM8.16405 13.6097C8.45205 13.6097 8.70405 13.5312 8.92005 13.3741C9.14259 13.217 9.31278 12.9977 9.43059 12.7163C9.55496 12.4283 9.61714 12.0945 9.61714 11.7148C9.61714 11.3417 9.55496 11.0112 9.43059 10.7232C9.31278 10.4352 9.14259 10.2126 8.92005 10.0555C8.70405 9.89191 8.45205 9.81009 8.16405 9.81009C7.88259 9.81009 7.63059 9.89191 7.40805 10.0555C7.19205 10.2126 7.02187 10.4352 6.8975 10.7232C6.77968 11.0112 6.72078 11.3417 6.72078 11.7148C6.72078 12.0945 6.77968 12.4283 6.8975 12.7163C7.02187 12.9977 7.19205 13.217 7.40805 13.3741C7.63059 13.5312 7.88259 13.6097 8.16405 13.6097ZM12.3961 14.0908L11.051 9.329H11.7873L12.5335 12.1665C12.5859 12.389 12.635 12.6083 12.6808 12.8243C12.7332 13.0337 12.779 13.253 12.8183 13.4821H12.8575C12.9164 13.253 12.9721 13.0337 13.0244 12.8243C13.0768 12.6083 13.1324 12.389 13.1913 12.1665L13.9572 9.329H14.6739L15.4495 12.1665C15.5084 12.389 15.5641 12.6083 15.6164 12.8243C15.6753 13.0337 15.731 13.253 15.7833 13.4821H15.8226C15.8815 13.253 15.9339 13.0337 15.9797 12.8243C16.0321 12.6083 16.0844 12.389 16.1368 12.1665L16.8633 9.329H17.5506L16.2546 14.0908H15.371L14.6444 11.4301C14.5921 11.201 14.5397 10.9752 14.4873 10.7526C14.435 10.5301 14.3793 10.301 14.3204 10.0654H14.2812C14.2288 10.301 14.1732 10.5334 14.1143 10.7625C14.0619 10.9915 14.003 11.2206 13.9375 11.4497L13.2306 14.0908H12.3961ZM20.5055 14.2086C20.0931 14.2086 19.7135 14.1105 19.3666 13.9141C19.0262 13.7112 18.7546 13.4265 18.5517 13.0599C18.3488 12.6868 18.2473 12.2385 18.2473 11.7148C18.2473 11.1977 18.3488 10.7526 18.5517 10.3795C18.7546 10.0065 19.0164 9.71846 19.3371 9.51555C19.6644 9.31264 20.0113 9.21118 20.3779 9.21118C20.7706 9.21118 21.1077 9.30282 21.3891 9.48609C21.6706 9.66937 21.8833 9.92791 22.0273 10.2617C22.1779 10.589 22.2531 10.9817 22.2531 11.4399C22.2531 11.5185 22.2499 11.597 22.2433 11.6755C22.2433 11.7475 22.2368 11.813 22.2237 11.8719H18.807L18.7971 11.3515H21.615C21.615 10.841 21.507 10.4548 21.291 10.193C21.075 9.92464 20.7739 9.79046 20.3877 9.79046C20.152 9.79046 19.923 9.85918 19.7004 9.99664C19.4779 10.1341 19.2946 10.3435 19.1506 10.625C19.0066 10.9065 18.9346 11.2697 18.9346 11.7148C18.9346 12.1403 19.0099 12.4937 19.1604 12.7752C19.311 13.0566 19.5106 13.2694 19.7593 13.4134C20.0146 13.5574 20.2928 13.6294 20.5939 13.6294C20.836 13.6294 21.052 13.5934 21.2419 13.5214C21.4382 13.4494 21.6248 13.3577 21.8015 13.2465L22.0666 13.7177C21.8637 13.8486 21.6346 13.9632 21.3793 14.0614C21.1306 14.1595 20.8393 14.2086 20.5055 14.2086ZM23.4528 14.0908V9.329H24.0419L24.1008 10.2028H24.1303C24.2939 9.90173 24.4903 9.66282 24.7193 9.48609C24.955 9.30282 25.2103 9.21118 25.4852 9.21118C25.5833 9.21118 25.6717 9.221 25.7503 9.24064C25.8288 9.25373 25.9041 9.27664 25.9761 9.30937L25.8386 9.93773C25.7601 9.91155 25.6881 9.89191 25.6226 9.87882C25.5637 9.86573 25.4852 9.85918 25.387 9.85918C25.1841 9.85918 24.9713 9.94427 24.7488 10.1145C24.5263 10.2781 24.3299 10.5694 24.1597 10.9883V14.0908H23.4528ZM28.6745 14.2086C28.2622 14.2086 27.8825 14.1105 27.5356 13.9141C27.1953 13.7112 26.9236 13.4265 26.7207 13.0599C26.5178 12.6868 26.4164 12.2385 26.4164 11.7148C26.4164 11.1977 26.5178 10.7526 26.7207 10.3795C26.9236 10.0065 27.1854 9.71846 27.5062 9.51555C27.8334 9.31264 28.1804 9.21118 28.5469 9.21118C28.9396 9.21118 29.2767 9.30282 29.5582 9.48609C29.8396 9.66937 30.0524 9.92791 30.1964 10.2617C30.3469 10.589 30.4222 10.9817 30.4222 11.4399C30.4222 11.5185 30.4189 11.597 30.4124 11.6755C30.4124 11.7475 30.4058 11.813 30.3927 11.8719H26.976L26.9662 11.3515H29.784C29.784 10.841 29.676 10.4548 29.46 10.193C29.244 9.92464 28.9429 9.79046 28.5567 9.79046C28.3211 9.79046 28.092 9.85918 27.8694 9.99664C27.6469 10.1341 27.4636 10.3435 27.3196 10.625C27.1756 10.9065 27.1036 11.2697 27.1036 11.7148C27.1036 12.1403 27.1789 12.4937 27.3294 12.7752C27.48 13.0566 27.6796 13.2694 27.9284 13.4134C28.1836 13.5574 28.4618 13.6294 28.7629 13.6294C29.0051 13.6294 29.2211 13.5934 29.4109 13.5214C29.6073 13.4494 29.7938 13.3577 29.9705 13.2465L30.2356 13.7177C30.0327 13.8486 29.8036 13.9632 29.5484 14.0614C29.2996 14.1595 29.0084 14.2086 28.6745 14.2086ZM33.2222 14.2086C32.6266 14.2086 32.152 13.9926 31.7986 13.5606C31.4451 13.1221 31.2684 12.5068 31.2684 11.7148C31.2684 11.2043 31.3633 10.7625 31.5531 10.3894C31.7495 10.0163 32.0047 9.72827 32.3189 9.52537C32.6331 9.31591 32.9735 9.21118 33.34 9.21118C33.6215 9.21118 33.8637 9.26027 34.0666 9.35846C34.2695 9.45664 34.4789 9.59409 34.6949 9.77082L34.6655 8.94609V7.08064H35.3724V14.0908H34.7833L34.7244 13.5115H34.6949C34.5117 13.7014 34.2924 13.865 34.0371 14.0025C33.7884 14.1399 33.5167 14.2086 33.2222 14.2086ZM33.3793 13.5999C33.6084 13.5999 33.8277 13.5443 34.0371 13.433C34.2466 13.3152 34.456 13.145 34.6655 12.9225V10.3403C34.4495 10.1505 34.2433 10.0163 34.0469 9.93773C33.8506 9.85918 33.6509 9.81991 33.448 9.81991C33.1797 9.81991 32.9342 9.90173 32.7117 10.0654C32.4957 10.2225 32.3222 10.445 32.1913 10.733C32.0669 11.0145 32.0047 11.3417 32.0047 11.7148C32.0047 12.2974 32.1226 12.7588 32.3582 13.0992C32.6004 13.433 32.9407 13.5999 33.3793 13.5999ZM41.0468 14.2086C40.8243 14.2086 40.5919 14.1563 40.3497 14.0515C40.1141 13.9403 39.8883 13.7897 39.6723 13.5999H39.6428L39.5741 14.0908H39.0046V7.08064H39.7116V9.02464L39.6919 9.89846C39.9145 9.70209 40.1566 9.53846 40.4185 9.40755C40.6803 9.27664 40.9486 9.21118 41.2236 9.21118C41.6359 9.21118 41.9828 9.31264 42.2643 9.51555C42.5457 9.71191 42.7552 9.99337 42.8926 10.3599C43.0366 10.7199 43.1086 11.1454 43.1086 11.6363C43.1086 12.1795 43.0105 12.6443 42.8141 13.0305C42.6243 13.4101 42.3723 13.7014 42.0581 13.9043C41.7439 14.1072 41.4068 14.2086 41.0468 14.2086ZM40.929 13.5999C41.2105 13.5999 41.4592 13.5214 41.6752 13.3643C41.8912 13.2072 42.0614 12.9814 42.1857 12.6868C42.3101 12.3923 42.3723 12.0454 42.3723 11.6461C42.3723 11.2861 42.3265 10.9686 42.2348 10.6937C42.1497 10.4188 42.009 10.2061 41.8126 10.0555C41.6228 9.89846 41.3708 9.81991 41.0566 9.81991C40.8472 9.81991 40.6312 9.87882 40.4086 9.99664C40.1861 10.1079 39.9537 10.2781 39.7116 10.5072V13.0795C39.9341 13.2694 40.1534 13.4035 40.3694 13.4821C40.5854 13.5606 40.7719 13.5999 40.929 13.5999ZM44.4221 16.1723C44.3174 16.1723 44.2192 16.1625 44.1276 16.1428C44.036 16.1232 43.9541 16.1003 43.8821 16.0741L44.0196 15.4948C44.072 15.5145 44.1309 15.5308 44.1963 15.5439C44.2683 15.5635 44.3338 15.5734 44.3927 15.5734C44.6676 15.5734 44.8967 15.4686 45.08 15.2592C45.2632 15.0563 45.404 14.7977 45.5021 14.4835L45.62 14.1203L43.6956 9.329H44.432L45.453 12.0585C45.5316 12.2614 45.6101 12.4806 45.6887 12.7163C45.7738 12.9454 45.8523 13.1712 45.9243 13.3937H45.9636C46.0356 13.1777 46.1076 12.9552 46.1796 12.7261C46.2516 12.4905 46.317 12.2679 46.376 12.0585L47.2694 9.329H47.9665L46.16 14.5326C46.0487 14.8337 45.9178 15.1086 45.7672 15.3574C45.6167 15.6061 45.4301 15.8025 45.2076 15.9465C44.9916 16.097 44.7298 16.1723 44.4221 16.1723Z"
            fill="#708794"
        />
        <g clip-path="url(#clip0_5793_15930)">
            <path
                d="M61.0365 12.4972V13.6618C61.0365 13.9294 60.8259 14.1461 60.5657 14.1461H53.6526C53.3924 14.1461 53.1818 13.9294 53.1818 13.6618V0.68989C53.1818 0.422201 53.3924 0.205566 53.6526 0.205566H54.9349C55.1951 0.205566 55.4057 0.422201 55.4057 0.68989V11.5271C55.4057 11.7948 55.6163 12.0115 55.8765 12.0115H60.5657C60.8259 12.0115 61.0365 12.2281 61.0365 12.4958V12.4972Z"
                fill="#1B2F39"
            />
            <path
                d="M72.0902 3.87037V13.6548C72.0902 13.9225 71.8797 14.1391 71.6194 14.1391H70.757C70.5263 14.1391 70.3291 13.968 70.2916 13.7335L70.1467 12.831C69.1997 13.8162 67.8799 14.4068 66.3562 14.4068C63.243 14.4068 60.9131 11.9852 60.9131 8.7619C60.9131 5.53859 63.2416 3.12939 66.3562 3.12939C67.8973 3.12939 69.2306 3.72824 70.1802 4.73001L70.3586 3.77792C70.4015 3.55025 70.5947 3.38466 70.8214 3.38466H71.6194C71.8797 3.38466 72.0902 3.6013 72.0902 3.86899V3.87037ZM69.8476 9.60912C70.3975 7.05228 68.5693 4.93422 66.0436 5.26539C64.3227 5.4903 63.1021 6.91705 63.1021 8.7619C63.1021 10.7751 64.5548 12.2901 66.5265 12.2901C68.2112 12.2901 69.5069 11.1932 69.8489 9.60774L69.8476 9.60912Z"
                fill="#1B2F39"
            />
            <path
                d="M83.2097 3.3916C83.5517 3.3916 83.7798 3.7545 83.6389 4.076L79.1361 14.3406C77.9558 17.0437 76.9149 18 74.7849 18H74.1934C73.9332 18 73.7226 17.7833 73.7226 17.5156V16.0088H74.6186C76.0015 16.0088 76.4267 15.5935 77.1926 13.8729L77.426 13.3665L73.1901 4.08152C73.0439 3.76002 73.2719 3.3916 73.6167 3.3916H74.9097C75.0948 3.3916 75.2611 3.50199 75.3389 3.67585L78.2227 10.1845C78.3434 10.455 78.719 10.4509 78.8317 10.1776L81.5304 3.68689C81.6042 3.50889 81.7745 3.39298 81.9636 3.39298H83.2097V3.3916Z"
                fill="#1B2F39"
            />
            <path
                d="M94.1857 9.51943H86.2531C85.9567 9.51943 85.7461 9.82023 85.8347 10.11C86.2639 11.5009 87.3906 12.3343 88.8995 12.3343C90.0517 12.3343 91.0027 11.8279 91.5768 10.9793C91.6667 10.8455 91.8088 10.7585 91.9658 10.7585H93.2427C93.5968 10.7585 93.8289 11.149 93.6639 11.4719C92.7196 13.3154 90.9786 14.4068 88.8995 14.4068C85.8427 14.4068 83.5289 11.9797 83.5289 8.7688C83.5289 5.55791 85.8373 3.12939 88.8995 3.12939C91.9618 3.12939 94.2286 5.66416 94.2286 8.79363C94.2286 9.03511 94.2085 9.27796 94.1843 9.51943H94.1857ZM86.3511 7.72288H91.4708C91.7807 7.72288 91.998 7.39586 91.8773 7.10195C91.3609 5.84768 90.2784 5.12464 88.8995 5.12464C87.5207 5.12464 86.4329 5.87389 85.942 7.10747C85.8253 7.4 86.0439 7.72288 86.3511 7.72288Z"
                fill="#1B2F39"
            />
            <path
                d="M101.363 3.48811C101.5 3.63714 101.496 3.98485 101.496 3.98485V4.93556C101.496 5.20325 101.285 5.41989 101.025 5.41989H100.361C98.5838 5.41989 97.6972 6.46305 97.6972 8.41V13.6603C97.6972 13.928 97.4866 14.1446 97.2264 14.1446H96.0192C95.759 14.1446 95.5484 13.928 95.5484 13.6603V3.87585C95.5484 3.60816 95.759 3.39152 96.0192 3.39152H96.6362C96.8522 3.39152 97.0399 3.54193 97.0922 3.7558L97.3659 4.85829C98.1143 3.83859 99.1391 3.33081 100.566 3.33081H100.904C100.904 3.33081 101.226 3.33771 101.363 3.48673V3.48811Z"
                fill="#1B2F39"
            />
            <path
                d="M114.248 9.13438C113.207 8.06362 113.207 6.32916 114.248 5.25979L117.425 1.99095C117.845 1.55906 117.845 0.858102 117.425 0.426212C117.005 -0.00567748 116.324 -0.00567748 115.904 0.426212L112.727 3.69505C111.686 4.76581 110 4.76581 108.96 3.69505L105.783 0.426212C105.363 -0.00567748 104.681 -0.00567748 104.262 0.426212C103.842 0.858102 103.842 1.55906 104.262 1.99095L107.439 5.25979C108.48 6.33054 108.48 8.065 107.439 9.13438L104.317 12.3466C103.911 12.7634 103.83 13.4505 104.2 13.9003C104.416 14.1625 104.719 14.2922 105.022 14.2922C105.297 14.2922 105.572 14.1846 105.783 13.968L108.96 10.6991C110.001 9.62836 111.687 9.62836 112.727 10.6991L115.904 13.968C116.115 14.1846 116.39 14.2922 116.665 14.2922C116.968 14.2922 117.27 14.1611 117.487 13.9003C117.858 13.4505 117.777 12.7647 117.37 12.3466L114.248 9.13438Z"
                fill="#1B2F39"
            />
            <path
                d="M110.077 0.315983C110.276 0.111767 110.54 0 110.821 0C111.101 0 111.365 0.111767 111.564 0.317363C111.762 0.521579 111.871 0.793407 111.871 1.08179C111.871 1.37018 111.762 1.64201 111.564 1.84622C111.514 1.89728 111.46 1.94281 111.403 1.98145C111.231 2.09873 111.03 2.16221 110.821 2.16221C110.61 2.16221 110.409 2.09873 110.238 1.98145C110.181 1.94281 110.127 1.89728 110.077 1.84622C109.879 1.64201 109.77 1.37018 109.77 1.08179C109.77 0.793407 109.879 0.521579 110.079 0.317363L110.077 0.315983Z"
                fill="#725BF6"
            />
            <path
                d="M111.564 14.0787C111.365 14.2829 111.101 14.3961 110.821 14.3961C110.54 14.3961 110.276 14.2843 110.077 14.0787C109.879 13.8745 109.77 13.6027 109.77 13.3143C109.77 13.0259 109.879 12.7541 110.077 12.5499C110.276 12.3457 110.54 12.2339 110.821 12.2339C111.101 12.2339 111.365 12.3457 111.564 12.5499C111.762 12.7541 111.871 13.0259 111.871 13.3143C111.871 13.6027 111.762 13.8745 111.564 14.0787Z"
                fill="#725BF6"
            />
            <path
                d="M103.824 7.19727C103.824 6.90889 103.933 6.63706 104.131 6.43284C104.33 6.22863 104.594 6.11548 104.874 6.11548C105.155 6.11548 105.419 6.22863 105.618 6.43284C105.816 6.63706 105.925 6.90889 105.925 7.19727C105.925 7.26902 105.918 7.34078 105.905 7.40977C105.864 7.61812 105.766 7.80854 105.618 7.9617C105.419 8.16592 105.155 8.27769 104.874 8.27769C104.594 8.27769 104.33 8.16592 104.131 7.9617C103.933 7.75749 103.824 7.48566 103.824 7.19727Z"
                fill="#725BF6"
            />
            <path
                d="M117.51 7.96309C117.099 8.38532 116.433 8.38532 116.023 7.96309C115.825 7.75888 115.716 7.48705 115.716 7.19866C115.716 7.12691 115.723 7.05516 115.736 6.98617C115.746 6.93373 115.761 6.88268 115.778 6.83439C115.829 6.68536 115.914 6.55014 116.025 6.43561C116.23 6.2245 116.5 6.11963 116.768 6.11963C117.036 6.11963 117.306 6.2245 117.511 6.43561C117.71 6.63983 117.818 6.91166 117.818 7.20004C117.818 7.48843 117.71 7.76026 117.511 7.96447L117.51 7.96309Z"
                fill="#725BF6"
            />
        </g>
        <defs>
            <clipPath id="clip0_5793_15930">
                <rect width="64.6364" height="18" fill="white" transform="translate(53.1818)" />
            </clipPath>
        </defs>
    </svg>
`,I0=f`
    <svg width="52" height="51" viewBox="0 0 52 51" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1554_32502)">
            <path d="M12.5861 17.2412H0.763672V48.4446H12.5861V17.2412Z" fill="#725BF6" />
            <path
                d="M50.1307 30.283C50.1307 29.1574 49.7572 28.1175 49.1279 27.2803C50.3852 26.3695 51.2054 24.8906 51.2054 23.2231C51.2054 20.4619 48.9588 18.2154 46.1976 18.2154H34.8141L36.3983 12.7433V10.1214C36.3983 5.29004 32.4676 1.35938 27.6363 1.35938C26.4648 1.35938 25.5118 2.31246 25.5118 3.48387V9.29657C24.7217 10.561 20.3344 15.484 15.541 20.642V46.5026L19.6314 48.0365C22.0626 48.9482 24.6119 49.4104 27.2085 49.4104H42.9736C45.7348 49.4104 47.9813 47.1639 47.9813 44.4026C47.9813 43.2775 47.6083 42.2378 46.9795 41.4008C48.2366 40.4901 49.056 39.0102 49.056 37.3428C49.056 36.2172 48.6825 35.1773 48.0532 34.3401C49.3105 33.4295 50.1307 31.9506 50.1307 30.283Z"
                fill="#725BF6"
            />
        </g>
        <defs>
            <clipPath id="clip0_1554_32502">
                <rect width="50.4424" height="50.4424" fill="white" transform="translate(0.763672 0.163574)" />
            </clipPath>
        </defs>
    </svg>
`,y0=f`
    <svg
        width="646"
        height="531"
        viewBox="0 0 646 531"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
    >
        <rect x="118" y="3" width="528" height="528" fill="url(#pattern0)" />
        <g filter="url(#filter0_d_2_17655)">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M401.598 104.051C401.323 104.051 401.06 104.164 400.871 104.364L382.157 124.142C381.763 124.559 381.099 124.559 380.704 124.142L361.99 104.364C361.801 104.164 361.538 104.051 361.263 104.051L18 104.051C16.8954 104.051 16 103.156 16 102.051L16 17C16 15.8954 16.8954 15 18 15L428.77 15C429.874 15 430.77 15.8954 430.77 17L430.77 102.051C430.77 103.156 429.874 104.051 428.77 104.051H401.598Z"
                fill="#FE5C67"
            />
        </g>
        <path
            d="M50.3938 48.664V62.488C50.3938 64.0027 50.7884 65.1653 51.5778 65.976C52.3671 66.7653 53.4764 67.16 54.9058 67.16C56.3564 67.16 57.4764 66.7653 58.2658 65.976C59.0551 65.1653 59.4498 64.0027 59.4498 62.488V48.664H63.9618V62.456C63.9618 64.3547 63.5458 65.9653 62.7138 67.288C61.9031 68.5893 60.8044 69.5707 59.4178 70.232C58.0524 70.8933 56.5271 71.224 54.8418 71.224C53.1778 71.224 51.6631 70.8933 50.2978 70.232C48.9538 69.5707 47.8871 68.5893 47.0978 67.288C46.3084 65.9653 45.9138 64.3547 45.9138 62.456V48.664H50.3938ZM78.1143 53.016C80.2263 53.016 81.9329 53.688 83.2343 55.032C84.5356 56.3547 85.1863 58.2107 85.1863 60.6V71H80.7063V61.208C80.7063 59.8 80.3543 58.7227 79.6503 57.976C78.9463 57.208 77.9863 56.824 76.7703 56.824C75.5329 56.824 74.5516 57.208 73.8263 57.976C73.1223 58.7227 72.7703 59.8 72.7703 61.208V71H68.2903V53.272H72.7703V55.48C73.3676 54.712 74.1249 54.1147 75.0423 53.688C75.9809 53.24 77.0049 53.016 78.1143 53.016ZM88.2945 62.072C88.2945 60.28 88.6465 58.6907 89.3505 57.304C90.0759 55.9173 91.0465 54.8507 92.2625 54.104C93.4999 53.3573 94.8759 52.984 96.3905 52.984C97.7132 52.984 98.8652 53.2507 99.8465 53.784C100.849 54.3173 101.649 54.9893 102.247 55.8V53.272H106.759V71H102.247V68.408C101.671 69.24 100.871 69.9333 99.8465 70.488C98.8439 71.0213 97.6812 71.288 96.3585 71.288C94.8652 71.288 93.4999 70.904 92.2625 70.136C91.0465 69.368 90.0759 68.2907 89.3505 66.904C88.6465 65.496 88.2945 63.8853 88.2945 62.072ZM102.247 62.136C102.247 61.048 102.033 60.12 101.607 59.352C101.18 58.5627 100.604 57.9653 99.8785 57.56C99.1532 57.1333 98.3745 56.92 97.5425 56.92C96.7105 56.92 95.9425 57.1227 95.2385 57.528C94.5345 57.9333 93.9585 58.5307 93.5105 59.32C93.0839 60.088 92.8705 61.0053 92.8705 62.072C92.8705 63.1387 93.0839 64.0773 93.5105 64.888C93.9585 65.6773 94.5345 66.2853 95.2385 66.712C95.9639 67.1387 96.7319 67.352 97.5425 67.352C98.3745 67.352 99.1532 67.1493 99.8785 66.744C100.604 66.3173 101.18 65.72 101.607 64.952C102.033 64.1627 102.247 63.224 102.247 62.136ZM127.87 53.272V71H123.358V68.76C122.782 69.528 122.025 70.136 121.086 70.584C120.169 71.0107 119.166 71.224 118.078 71.224C116.691 71.224 115.465 70.936 114.398 70.36C113.331 69.7627 112.489 68.8987 111.87 67.768C111.273 66.616 110.974 65.2507 110.974 63.672V53.272H115.454V63.032C115.454 64.44 115.806 65.528 116.51 66.296C117.214 67.0427 118.174 67.416 119.39 67.416C120.627 67.416 121.598 67.0427 122.302 66.296C123.006 65.528 123.358 64.44 123.358 63.032V53.272H127.87ZM137.506 56.952V65.528C137.506 66.1253 137.645 66.5627 137.922 66.84C138.221 67.096 138.712 67.224 139.394 67.224H141.474V71H138.658C134.882 71 132.994 69.1653 132.994 65.496V56.952H130.882V53.272H132.994V48.888H137.506V53.272H141.474V56.952H137.506ZM154.681 53.016C156.025 53.016 157.219 53.3147 158.265 53.912C159.31 54.488 160.121 55.352 160.697 56.504C161.294 57.6347 161.593 59 161.593 60.6V71H157.113V61.208C157.113 59.8 156.761 58.7227 156.057 57.976C155.353 57.208 154.393 56.824 153.177 56.824C151.939 56.824 150.958 57.208 150.233 57.976C149.529 58.7227 149.177 59.8 149.177 61.208V71H144.697V47.32H149.177V55.48C149.753 54.712 150.521 54.1147 151.481 53.688C152.441 53.24 153.507 53.016 154.681 53.016ZM173.725 71.288C172.018 71.288 170.482 70.9147 169.117 70.168C167.751 69.4 166.674 68.3227 165.885 66.936C165.117 65.5493 164.733 63.9493 164.733 62.136C164.733 60.3227 165.127 58.7227 165.917 57.336C166.727 55.9493 167.826 54.8827 169.213 54.136C170.599 53.368 172.146 52.984 173.853 52.984C175.559 52.984 177.106 53.368 178.493 54.136C179.879 54.8827 180.967 55.9493 181.757 57.336C182.567 58.7227 182.973 60.3227 182.973 62.136C182.973 63.9493 182.557 65.5493 181.725 66.936C180.914 68.3227 179.805 69.4 178.397 70.168C177.01 70.9147 175.453 71.288 173.725 71.288ZM173.725 67.384C174.535 67.384 175.293 67.192 175.997 66.808C176.722 66.4027 177.298 65.8053 177.725 65.016C178.151 64.2267 178.365 63.2667 178.365 62.136C178.365 60.4507 177.917 59.16 177.021 58.264C176.146 57.3467 175.069 56.888 173.789 56.888C172.509 56.888 171.431 57.3467 170.557 58.264C169.703 59.16 169.277 60.4507 169.277 62.136C169.277 63.8213 169.693 65.1227 170.525 66.04C171.378 66.936 172.445 67.384 173.725 67.384ZM190.739 56.024C191.315 55.0853 192.062 54.3493 192.979 53.816C193.918 53.2827 194.984 53.016 196.179 53.016V57.72H194.995C193.587 57.72 192.52 58.0507 191.795 58.712C191.091 59.3733 190.739 60.5253 190.739 62.168V71H186.259V53.272H190.739V56.024ZM201.469 51.16C200.679 51.16 200.018 50.9147 199.485 50.424C198.973 49.912 198.717 49.2827 198.717 48.536C198.717 47.7893 198.973 47.1707 199.485 46.68C200.018 46.168 200.679 45.912 201.469 45.912C202.258 45.912 202.909 46.168 203.421 46.68C203.954 47.1707 204.221 47.7893 204.221 48.536C204.221 49.2827 203.954 49.912 203.421 50.424C202.909 50.9147 202.258 51.16 201.469 51.16ZM203.677 53.272V71H199.197V53.272H203.677ZM212.199 67.32H220.103V71H207.111V67.384L214.855 56.952H207.143V53.272H220.007V56.888L212.199 67.32ZM240.052 61.752C240.052 62.392 240.009 62.968 239.924 63.48H226.964C227.07 64.76 227.518 65.7627 228.308 66.488C229.097 67.2133 230.068 67.576 231.22 67.576C232.884 67.576 234.068 66.8613 234.772 65.432H239.604C239.092 67.1387 238.11 68.5467 236.66 69.656C235.209 70.744 233.428 71.288 231.316 71.288C229.609 71.288 228.073 70.9147 226.708 70.168C225.364 69.4 224.308 68.3227 223.54 66.936C222.793 65.5493 222.42 63.9493 222.42 62.136C222.42 60.3013 222.793 58.6907 223.54 57.304C224.286 55.9173 225.332 54.8507 226.676 54.104C228.02 53.3573 229.566 52.984 231.316 52.984C233.001 52.984 234.505 53.3467 235.828 54.072C237.172 54.7973 238.206 55.832 238.932 57.176C239.678 58.4987 240.052 60.024 240.052 61.752ZM235.412 60.472C235.39 59.32 234.974 58.4027 234.164 57.72C233.353 57.016 232.361 56.664 231.188 56.664C230.078 56.664 229.14 57.0053 228.372 57.688C227.625 58.3493 227.166 59.2773 226.996 60.472H235.412ZM242.17 62.072C242.17 60.28 242.522 58.6907 243.226 57.304C243.951 55.9173 244.932 54.8507 246.17 54.104C247.407 53.3573 248.783 52.984 250.298 52.984C251.45 52.984 252.548 53.24 253.594 53.752C254.639 54.2427 255.471 54.904 256.09 55.736V47.32H260.634V71H256.09V68.376C255.535 69.2507 254.756 69.9547 253.754 70.488C252.751 71.0213 251.588 71.288 250.266 71.288C248.772 71.288 247.407 70.904 246.17 70.136C244.932 69.368 243.951 68.2907 243.226 66.904C242.522 65.496 242.17 63.8853 242.17 62.072ZM256.122 62.136C256.122 61.048 255.908 60.12 255.482 59.352C255.055 58.5627 254.479 57.9653 253.754 57.56C253.028 57.1333 252.25 56.92 251.418 56.92C250.586 56.92 249.818 57.1227 249.114 57.528C248.41 57.9333 247.834 58.5307 247.386 59.32C246.959 60.088 246.746 61.0053 246.746 62.072C246.746 63.1387 246.959 64.0773 247.386 64.888C247.834 65.6773 248.41 66.2853 249.114 66.712C249.839 67.1387 250.607 67.352 251.418 67.352C252.25 67.352 253.028 67.1493 253.754 66.744C254.479 66.3173 255.055 65.72 255.482 64.952C255.908 64.1627 256.122 63.224 256.122 62.136ZM297.21 53.272L292.026 71H287.194L283.962 58.616L280.73 71H275.866L270.65 53.272H275.194L278.33 66.776L281.722 53.272H286.458L289.786 66.744L292.922 53.272H297.21ZM316.114 61.752C316.114 62.392 316.071 62.968 315.986 63.48H303.026C303.133 64.76 303.581 65.7627 304.37 66.488C305.159 67.2133 306.13 67.576 307.282 67.576C308.946 67.576 310.13 66.8613 310.834 65.432H315.666C315.154 67.1387 314.173 68.5467 312.722 69.656C311.271 70.744 309.49 71.288 307.378 71.288C305.671 71.288 304.135 70.9147 302.77 70.168C301.426 69.4 300.37 68.3227 299.602 66.936C298.855 65.5493 298.482 63.9493 298.482 62.136C298.482 60.3013 298.855 58.6907 299.602 57.304C300.349 55.9173 301.394 54.8507 302.738 54.104C304.082 53.3573 305.629 52.984 307.378 52.984C309.063 52.984 310.567 53.3467 311.89 54.072C313.234 54.7973 314.269 55.832 314.994 57.176C315.741 58.4987 316.114 60.024 316.114 61.752ZM311.474 60.472C311.453 59.32 311.037 58.4027 310.226 57.72C309.415 57.016 308.423 56.664 307.25 56.664C306.141 56.664 305.202 57.0053 304.434 57.688C303.687 58.3493 303.229 59.2773 303.058 60.472H311.474ZM323.864 55.864C324.44 55.0107 325.229 54.3173 326.232 53.784C327.256 53.2507 328.419 52.984 329.72 52.984C331.235 52.984 332.6 53.3573 333.816 54.104C335.053 54.8507 336.024 55.9173 336.728 57.304C337.453 58.6693 337.816 60.2587 337.816 62.072C337.816 63.8853 337.453 65.496 336.728 66.904C336.024 68.2907 335.053 69.368 333.816 70.136C332.6 70.904 331.235 71.288 329.72 71.288C328.397 71.288 327.235 71.032 326.232 70.52C325.251 69.9867 324.461 69.304 323.864 68.472V71H319.384V47.32H323.864V55.864ZM333.24 62.072C333.24 61.0053 333.016 60.088 332.568 59.32C332.141 58.5307 331.565 57.9333 330.84 57.528C330.136 57.1227 329.368 56.92 328.536 56.92C327.725 56.92 326.957 57.1333 326.232 57.56C325.528 57.9653 324.952 58.5627 324.504 59.352C324.077 60.1413 323.864 61.0693 323.864 62.136C323.864 63.2027 324.077 64.1307 324.504 64.92C324.952 65.7093 325.528 66.3173 326.232 66.744C326.957 67.1493 327.725 67.352 328.536 67.352C329.368 67.352 330.136 67.1387 330.84 66.712C331.565 66.2853 332.141 65.6773 332.568 64.888C333.016 64.0987 333.24 63.16 333.24 62.072ZM347.856 71.288C346.405 71.288 345.104 71.032 343.952 70.52C342.8 69.9867 341.882 69.272 341.2 68.376C340.538 67.48 340.176 66.488 340.112 65.4H344.624C344.709 66.0827 345.04 66.648 345.616 67.096C346.213 67.544 346.949 67.768 347.824 67.768C348.677 67.768 349.338 67.5973 349.808 67.256C350.298 66.9147 350.544 66.4773 350.544 65.944C350.544 65.368 350.245 64.9413 349.648 64.664C349.072 64.3653 348.144 64.0453 346.864 63.704C345.541 63.384 344.453 63.0533 343.6 62.712C342.768 62.3707 342.042 61.848 341.424 61.144C340.826 60.44 340.528 59.4907 340.528 58.296C340.528 57.3147 340.805 56.4187 341.36 55.608C341.936 54.7973 342.746 54.1573 343.792 53.688C344.858 53.2187 346.106 52.984 347.536 52.984C349.648 52.984 351.333 53.5173 352.592 54.584C353.85 55.6293 354.544 57.048 354.672 58.84H350.384C350.32 58.136 350.021 57.5813 349.488 57.176C348.976 56.7493 348.282 56.536 347.408 56.536C346.597 56.536 345.968 56.6853 345.52 56.984C345.093 57.2827 344.88 57.6987 344.88 58.232C344.88 58.8293 345.178 59.288 345.776 59.608C346.373 59.9067 347.301 60.216 348.56 60.536C349.84 60.856 350.896 61.1867 351.728 61.528C352.56 61.8693 353.274 62.4027 353.872 63.128C354.49 63.832 354.81 64.7707 354.832 65.944C354.832 66.968 354.544 67.8853 353.968 68.696C353.413 69.5067 352.602 70.1467 351.536 70.616C350.49 71.064 349.264 71.288 347.856 71.288ZM360.781 51.16C359.992 51.16 359.33 50.9147 358.797 50.424C358.285 49.912 358.029 49.2827 358.029 48.536C358.029 47.7893 358.285 47.1707 358.797 46.68C359.33 46.168 359.992 45.912 360.781 45.912C361.57 45.912 362.221 46.168 362.733 46.68C363.266 47.1707 363.533 47.7893 363.533 48.536C363.533 49.2827 363.266 49.912 362.733 50.424C362.221 50.9147 361.57 51.16 360.781 51.16ZM362.989 53.272V71H358.509V53.272H362.989ZM372.631 56.952V65.528C372.631 66.1253 372.77 66.5627 373.047 66.84C373.346 67.096 373.837 67.224 374.519 67.224H376.599V71H373.783C370.007 71 368.119 69.1653 368.119 65.496V56.952H366.007V53.272H368.119V48.888H372.631V53.272H376.599V56.952H372.631ZM396.302 61.752C396.302 62.392 396.259 62.968 396.174 63.48H383.214C383.32 64.76 383.768 65.7627 384.558 66.488C385.347 67.2133 386.318 67.576 387.47 67.576C389.134 67.576 390.318 66.8613 391.022 65.432H395.854C395.342 67.1387 394.36 68.5467 392.91 69.656C391.459 70.744 389.678 71.288 387.566 71.288C385.859 71.288 384.323 70.9147 382.958 70.168C381.614 69.4 380.558 68.3227 379.79 66.936C379.043 65.5493 378.67 63.9493 378.67 62.136C378.67 60.3013 379.043 58.6907 379.79 57.304C380.536 55.9173 381.582 54.8507 382.926 54.104C384.27 53.3573 385.816 52.984 387.566 52.984C389.251 52.984 390.755 53.3467 392.078 54.072C393.422 54.7973 394.456 55.832 395.182 57.176C395.928 58.4987 396.302 60.024 396.302 61.752ZM391.662 60.472C391.64 59.32 391.224 58.4027 390.414 57.72C389.603 57.016 388.611 56.664 387.438 56.664C386.328 56.664 385.39 57.0053 384.622 57.688C383.875 58.3493 383.416 59.2773 383.246 60.472H391.662Z"
            fill="white"
        />
        <path
            d="M382 141.188C346.293 141.188 317.031 170.449 317.031 206.156C317.031 241.864 346.293 271.125 382 271.125C417.707 271.125 446.969 241.864 446.969 206.156C446.969 170.449 417.707 141.188 382 141.188ZM332.512 206.156C332.512 178.9 354.743 156.668 382 156.668C392.278 156.668 402.176 159.866 410.627 165.88L382 194.507L341.725 234.783C335.71 226.332 332.512 216.434 332.512 206.156ZM382 255.644C371.722 255.644 361.824 252.446 353.373 246.432L422.276 177.529C428.29 185.98 431.488 195.878 431.488 206.156C431.488 233.412 409.257 255.644 382 255.644Z"
            fill="#FF3636"
        />
        <path
            d="M446.969 206.156C446.969 241.864 417.707 271.125 382 271.125V255.644C409.257 255.644 431.488 233.412 431.488 206.156C431.488 195.878 428.29 185.98 422.275 177.529L382 217.805V194.507L410.627 165.88C402.176 159.866 392.278 156.668 382 156.668V141.188C417.707 141.188 446.969 170.449 446.969 206.156Z"
            fill="#F40000"
        />
        <defs>
            <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_2_17655" transform="scale(0.00195312)" />
            </pattern>
            <filter
                id="filter0_d_2_17655"
                x="0"
                y="0"
                width="446.77"
                height="141.455"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_2_17655" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="7.5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_17655" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_17655" result="shape" />
            </filter>
            <image
                id="image0_2_17655"
                width="512"
                height="512"
                xlink:href="data:image/png;base64,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"
            />
        </defs>
    </svg>
`,R0=f`
    <svg width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1554_32524)">
            <path d="M38.6444 33.5283H50.4668V2.32495H38.6444V33.5283Z" fill="#B9CCD6" />
            <path
                d="M1.09974 20.4865C1.09974 21.6121 1.47323 22.652 2.10258 23.4892C0.845264 24.4001 0.0250816 25.879 0.0250816 27.5464C0.0250816 30.3076 2.27164 32.5541 5.03287 32.5541H16.4164L14.8322 38.0262V40.6481C14.8322 45.4795 18.7629 49.4102 23.5942 49.4102C24.7657 49.4102 25.7187 48.4571 25.7187 47.2857V41.473C26.5087 40.2086 30.896 35.2855 35.6895 30.1276V4.26694L31.5991 2.73308C29.1679 1.82137 26.6186 1.35911 24.022 1.35911H8.25685C5.49562 1.35911 3.24916 3.60567 3.24916 6.3669C3.24916 7.492 3.62216 8.53169 4.25102 9.36872C2.9939 10.2794 2.1745 11.7593 2.1745 13.4268C2.1745 14.5524 2.54799 15.5923 3.17724 16.4295C1.91993 17.34 1.09974 18.8189 1.09974 20.4865Z"
                fill="#B9CCD6"
            />
        </g>
        <defs>
            <clipPath id="clip0_1554_32524">
                <rect
                    width="50.4424"
                    height="50.4424"
                    fill="white"
                    transform="translate(50.4668 50.606) rotate(-180)"
                />
            </clipPath>
        </defs>
    </svg>
`,b0=f`
    <svg height="24" width="1.1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none"></path>
        <path
            d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
            fill="#140AE4"
        ></path>
    </svg>
`,B0=f`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="214" viewBox="0 0 200 107">
        <rect fill="#140AE4" width="200" height="107"></rect>
        <g>
            <path
                fill="#ffffff"
                d="M29.19,39.86c1.65-0.01,3.29,0.27,4.84,0.82c1.46,0.53,2.78,1.38,3.87,2.49c1.14,1.18,2.02,2.6,2.58,4.15
		c0.64,1.88,0.95,3.86,0.92,5.84c0.02,1.84-0.23,3.67-0.75,5.43c-0.46,1.58-1.24,3.04-2.29,4.3c-1.04,1.22-2.35,2.2-3.81,2.85
		c-1.7,0.72-3.53,1.08-5.37,1.04H17.58V39.86H29.19z M28.78,61.79c0.85,0,1.69-0.14,2.49-0.41c0.82-0.28,1.55-0.75,2.15-1.37
		c0.68-0.72,1.2-1.58,1.53-2.52c0.42-1.21,0.63-2.49,0.61-3.77c0.01-1.24-0.12-2.47-0.4-3.68c-0.23-1.02-0.67-1.97-1.3-2.81
		c-0.63-0.79-1.45-1.41-2.4-1.78c-1.17-0.45-2.42-0.67-3.68-0.63H23.5v16.96H28.78z"
            ></path>
            <path
                fill="#ffffff"
                d="M43.74,50.14c0.54-0.81,1.26-1.49,2.11-1.98c0.89-0.52,1.87-0.89,2.88-1.08c1.07-0.2,2.15-0.3,3.23-0.29
		c1,0,1.99,0.08,2.97,0.21c0.96,0.12,1.89,0.39,2.76,0.81c0.81,0.38,1.5,0.96,2.03,1.68c0.57,0.83,0.85,1.83,0.79,2.84v10.14
		c0,0.85,0.05,1.69,0.15,2.53c0.05,0.64,0.23,1.25,0.53,1.82h-5.43c-0.1-0.3-0.19-0.61-0.24-0.93c-0.07-0.32-0.11-0.64-0.14-0.96
		c-0.84,0.87-1.89,1.51-3.05,1.85c-1.15,0.35-2.34,0.53-3.54,0.53c-0.87-0.01-1.74-0.14-2.58-0.38c-0.77-0.2-1.49-0.56-2.11-1.05
		c-0.61-0.47-1.1-1.09-1.42-1.8c-0.35-0.82-0.53-1.71-0.5-2.61c-0.03-0.94,0.17-1.88,0.58-2.73c0.36-0.69,0.88-1.27,1.53-1.71
		c0.64-0.45,1.35-0.78,2.11-0.98c0.79-0.21,1.59-0.38,2.4-0.5c0.81-0.12,1.6-0.23,2.38-0.31c0.7-0.06,1.39-0.17,2.07-0.34
		c0.52-0.11,1.01-0.33,1.43-0.66c0.35-0.32,0.53-0.79,0.49-1.27c0.03-0.48-0.07-0.95-0.29-1.37c-0.17-0.33-0.43-0.61-0.75-0.79
		c-0.33-0.2-0.7-0.33-1.08-0.38c-0.44-0.06-0.89-0.09-1.34-0.09c-0.86-0.03-1.72,0.2-2.44,0.67c-0.66,0.57-1.04,1.4-1.05,2.27H42.8
		C42.83,52.17,43.16,51.08,43.74,50.14z M54.33,57.76c-0.35,0.11-0.72,0.21-1.1,0.29c-0.38,0.08-0.81,0.14-1.24,0.18
		s-0.85,0.11-1.28,0.18c-0.4,0.08-0.8,0.18-1.19,0.31c-0.36,0.12-0.7,0.3-1.01,0.52c-0.29,0.21-0.53,0.49-0.7,0.81
		c-0.18,0.39-0.27,0.81-0.26,1.24c-0.01,0.42,0.08,0.83,0.26,1.21c0.16,0.32,0.41,0.59,0.72,0.78c0.32,0.19,0.68,0.33,1.05,0.4
		c0.41,0.07,0.83,0.11,1.25,0.11c0.85,0.05,1.69-0.13,2.44-0.52c0.53-0.31,0.98-0.74,1.3-1.27c0.27-0.47,0.44-0.99,0.5-1.53
		c0.05-0.4,0.08-0.8,0.09-1.21v-2.03c-0.24,0.21-0.53,0.37-0.84,0.47V57.76z"
            ></path>
            <path fill="#ffffff" d="M67.59,66.78l-6.64-19.5h5.63l4.06,13.3l0,0l4.1-13.3h5.32l-6.48,19.5H67.59z"></path>
            <path
                fill="#ffffff"
                d="M81.39,44.26v-4.41h5.37v4.41H81.39z M86.76,47.31v19.47h-5.37v-19.5L86.76,47.31z"
            ></path>
            <path
                fill="#ffffff"
                d="M94.1,61.93c0.24,0.4,0.55,0.75,0.93,1.02c0.39,0.27,0.83,0.47,1.3,0.58c0.5,0.12,1.01,0.18,1.53,0.18
		c0.4,0,0.8-0.04,1.19-0.12c0.4-0.08,0.78-0.23,1.13-0.43c0.34-0.18,0.63-0.43,0.85-0.75c0.24-0.35,0.36-0.77,0.34-1.19
		c0-0.79-0.53-1.4-1.53-1.8c-1.46-0.52-2.95-0.92-4.47-1.21c-0.78-0.18-1.53-0.4-2.27-0.63c-0.7-0.23-1.37-0.54-1.98-0.95
		c-0.58-0.39-1.06-0.92-1.4-1.53c-0.37-0.66-0.55-1.41-0.52-2.17c-0.04-1.06,0.21-2.12,0.73-3.05c0.47-0.79,1.14-1.45,1.94-1.91
		c0.84-0.48,1.76-0.81,2.72-0.98c2.02-0.39,4.09-0.39,6.1,0c0.94,0.18,1.84,0.52,2.65,1.01c0.78,0.49,1.44,1.16,1.94,1.94
		c0.56,0.92,0.88,1.97,0.93,3.05h-5.05c0.02-0.86-0.43-1.66-1.17-2.09c-0.77-0.38-1.63-0.57-2.49-0.55c-0.33-0.02-0.65-0.02-0.98,0
		c-0.33,0.02-0.66,0.11-0.96,0.24c-0.29,0.12-0.54,0.31-0.73,0.55c-0.22,0.27-0.33,0.61-0.31,0.96c0,0.44,0.19,0.87,0.52,1.16
		c0.41,0.33,0.88,0.58,1.39,0.73c0.63,0.22,1.28,0.39,1.94,0.52c0.73,0.15,1.53,0.31,2.23,0.49c0.77,0.16,1.53,0.38,2.27,0.64
		c0.71,0.23,1.38,0.56,1.98,0.99c0.56,0.41,1.04,0.93,1.4,1.53c0.36,0.72,0.52,1.52,0.47,2.32c0.04,1.13-0.23,2.25-0.78,3.23
		c-0.49,0.85-1.18,1.57-2.01,2.09c-0.87,0.55-1.84,0.93-2.85,1.11c-1.07,0.21-2.16,0.32-3.25,0.32c-1.12,0-2.23-0.12-3.33-0.35
		c-1.02-0.19-2-0.57-2.88-1.11c-0.84-0.54-1.55-1.26-2.07-2.11c-0.56-0.97-0.87-2.07-0.88-3.19h5.1C93.75,61,93.87,61.49,94.1,61.93
		z"
            ></path>
            <path
                fill="#ffffff"
                d="M133.28,52.88c0.44-1.21,1.13-2.32,2.03-3.25c0.9-0.9,1.98-1.61,3.17-2.07c1.32-0.52,2.73-0.78,4.15-0.78
		c1.42-0.02,2.83,0.23,4.16,0.73c2.45,0.93,4.36,2.89,5.22,5.37c0.5,1.36,0.74,2.8,0.72,4.24c0.02,1.44-0.22,2.87-0.72,4.23
		c-0.45,1.18-1.15,2.25-2.04,3.14c-0.89,0.93-1.97,1.66-3.17,2.12c-1.33,0.49-2.74,0.73-4.16,0.72c-1.42,0.02-2.82-0.22-4.15-0.72
		c-1.19-0.45-2.28-1.15-3.17-2.06c-0.9-0.92-1.59-2.01-2.03-3.22c-0.5-1.35-0.74-2.78-0.72-4.23
		C132.54,55.67,132.78,54.24,133.28,52.88z M138.14,59.4c0.13,0.71,0.39,1.39,0.76,2.01c0.38,0.59,0.91,1.07,1.53,1.4
		c0.69,0.38,1.47,0.56,2.26,0.53c0.79,0.02,1.57-0.16,2.27-0.53c0.62-0.33,1.15-0.81,1.53-1.4c0.37-0.62,0.63-1.3,0.78-2.01
		c0.14-0.75,0.21-1.51,0.21-2.27c0-0.77-0.07-1.54-0.21-2.3c-0.14-0.71-0.41-1.38-0.78-2c-0.38-0.59-0.91-1.08-1.53-1.42
		c-0.69-0.39-1.48-0.58-2.27-0.55c-0.81-0.06-1.61,0.12-2.32,0.5c-0.62,0.34-1.14,0.83-1.53,1.42c-0.37,0.61-0.63,1.29-0.76,2
		c-0.15,0.76-0.23,1.53-0.23,2.3c0.02,0.76,0.12,1.51,0.29,2.24V59.4z"
            ></path>
            <path d="M160,39.86v26.93h-5.34V39.86H160z" fill="#ffffff"></path>
            <path
                fill="#ffffff"
                d="M168.09,39.86V54.3l6.74-7.02h6.35l-7.35,7.12L182,66.78h-6.48l-5.35-8.71l-2.07,2v6.71h-5.35V39.86H168.09z"
            ></path>
            <path
                fill="#ffffff"
                d="M123.45,39.86c1.46-0.04,2.91,0.21,4.27,0.73c1.08,0.43,2.06,1.08,2.87,1.92c0.73,0.79,1.28,1.72,1.62,2.75
		c0.67,2.06,0.67,4.28,0,6.35c-0.32,1.04-0.88,2-1.62,2.81c-0.81,0.84-1.78,1.5-2.87,1.92c-1.36,0.52-2.81,0.77-4.27,0.73h-5.17
		v9.76h-5.92V39.86H123.45z M121.83,52.44c0.65,0,1.31-0.05,1.95-0.15c0.58-0.09,1.14-0.28,1.65-0.58c0.48-0.3,0.88-0.72,1.14-1.22
		c0.34-0.63,0.51-1.34,0.5-2.06c0.03-0.71-0.11-1.42-0.43-2.06c-0.26-0.51-0.66-0.93-1.14-1.22c-0.5-0.3-1.06-0.5-1.65-0.58
		c-0.65-0.11-1.3-0.16-1.95-0.15h-3.63v8.02H121.83z"
            ></path>
        </g>
    </svg>
`,H0=f`
    <svg width="324" height="185" viewBox="0 0 324 185" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1.21216" width="322" height="183" rx="7.5" fill="#F5F7FA" />
        <rect x="1" y="1.21216" width="322" height="183" rx="7.5" stroke="#DBE3E8" />
        <g clip-path="url(#clip0_4371_1299)">
            <rect x="20.5" y="20.7122" width="283" height="144" rx="8" fill="#C6D7F8" />
            <g clip-path="url(#clip1_4371_1299)">
                <path d="M21 57.0002H291C297.627 57.0002 303 62.3728 303 69.0002V185H21V57.0002Z" fill="white" />
                <circle cx="278.5" cy="78.5002" r="1.5" fill="#576F7D" />
                <circle cx="278.5" cy="83.5002" r="1.5" fill="#576F7D" />
                <circle cx="278.5" cy="88.5002" r="1.5" fill="#576F7D" />
                <g clip-path="url(#clip2_4371_1299)">
                    <rect x="233" y="73.0002" width="20" height="20" rx="10" fill="#4483FF" />
                    <path
                        d="M245.405 78.2702V85.2842C245.405 86.1522 245.139 86.8382 244.607 87.3422C244.084 87.8462 243.393 88.0982 242.535 88.0982C241.676 88.0982 240.981 87.8462 240.449 87.3422C239.926 86.8382 239.665 86.1522 239.665 85.2842H241.275C241.284 85.7136 241.391 86.0542 241.597 86.3062C241.811 86.5582 242.124 86.6842 242.535 86.6842C242.945 86.6842 243.258 86.5582 243.473 86.3062C243.687 86.0449 243.795 85.7042 243.795 85.2842V78.2702H245.405Z"
                        fill="white"
                    />
                </g>
                <rect x="231" y="71.0002" width="24" height="24" rx="12" stroke="#F1F4F8" stroke-width="4" />
                <g filter="url(#filter0_d_4371_1299)">
                    <path
                        d="M252.651 104.889L249 89.6292L262.495 97.4796L256.502 98.9136L252.651 104.889Z"
                        fill="#1B2F39"
                    />
                    <path
                        d="M252.651 104.889L249 89.6292L262.495 97.4796L256.502 98.9136L252.651 104.889Z"
                        stroke="white"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
                <path
                    d="M181.5 82.5002C181.864 82.5002 182.206 82.5982 182.5 82.7685V78.5002H178.232C178.402 78.206 178.5 77.8646 178.5 77.5002C178.5 76.3957 177.605 75.5002 176.5 75.5002C175.395 75.5002 174.5 76.3957 174.5 77.5002C174.5 77.8646 174.598 78.206 174.768 78.5002H170.5V82.7685C170.206 82.5982 169.864 82.5002 169.5 82.5002C168.395 82.5002 167.5 83.3957 167.5 84.5002C167.5 85.6048 168.395 86.5002 169.5 86.5002C169.864 86.5002 170.206 86.4023 170.5 86.232V90.5002H174.768C174.598 90.206 174.5 89.8646 174.5 89.5002C174.5 88.3957 175.395 87.5002 176.5 87.5002C177.605 87.5002 178.5 88.3957 178.5 89.5002C178.5 89.8646 178.402 90.206 178.232 90.5002H182.5V86.232C182.206 86.4023 181.864 86.5002 181.5 86.5002C180.395 86.5002 179.5 85.6048 179.5 84.5002C179.5 83.3957 180.395 82.5002 181.5 82.5002Z"
                    stroke="#1B2F39"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path d="M209 77.0002L209 90.0002" stroke="#C6D7F8" stroke-width="1.5" stroke-linecap="round" />
                <rect x="-25" y="65.0002" width="171" height="37" rx="18.5" fill="#F1F4F8" />
                <path
                    d="M127.804 85.7939L131.471 82.9964C132.237 82.4121 131.841 81.1452 130.893 81.1452H126.358L124.931 76.6172C124.634 75.6748 123.356 75.6801 123.066 76.6248L121.679 81.1452H117.107C116.156 81.1452 115.762 82.4174 116.533 82.9993L120.234 85.7939L118.809 90.3142C118.512 91.2573 119.544 92.0462 120.314 91.4645L124.019 88.667L127.682 91.4616C128.448 92.0462 129.483 91.2659 129.194 90.3219L127.804 85.7939Z"
                    stroke="#1B2F39"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                />
                <line x1="21" y1="109.288" x2="331" y2="109.288" stroke="#DBE3E8" />
            </g>
        </g>
        <rect x="21" y="21.2122" width="282" height="143" rx="7.5" stroke="#DBE3E8" />
        <defs>
            <filter
                id="filter0_d_4371_1299"
                x="246.5"
                y="88.1292"
                width="18.495"
                height="20.2603"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4371_1299" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4371_1299" result="shape" />
            </filter>
            <clipPath id="clip0_4371_1299">
                <rect x="20.5" y="20.7122" width="283" height="144" rx="8" fill="white" />
            </clipPath>
            <clipPath id="clip1_4371_1299">
                <path d="M21 57.0002H291C297.627 57.0002 303 62.3728 303 69.0002V185H21V57.0002Z" fill="white" />
            </clipPath>
            <clipPath id="clip2_4371_1299">
                <rect x="233" y="73.0002" width="20" height="20" rx="10" fill="white" />
            </clipPath>
        </defs>
    </svg>
`,M0=f`
    <svg width="324" height="185" viewBox="0 0 324 185" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1.21216" width="322" height="183" rx="7.5" fill="#F5F7FA" />
        <rect x="1" y="1.21216" width="322" height="183" rx="7.5" stroke="#DBE3E8" />
        <g filter="url(#filter0_d_4371_1321)">
            <g clip-path="url(#clip0_4371_1321)">
                <mask id="path-2-inside-1_4371_1321" fill="white">
                    <path
                        d="M20.5 1.71216H303.5V153.712C303.5 160.34 298.127 165.712 291.5 165.712H32.5C25.8726 165.712 20.5 160.34 20.5 153.712V1.71216Z"
                    />
                </mask>
                <path
                    d="M20.5 1.71216H303.5V153.712C303.5 160.34 298.127 165.712 291.5 165.712H32.5C25.8726 165.712 20.5 160.34 20.5 153.712V1.71216Z"
                    fill="white"
                />
                <path
                    d="M45.8487 29.0982C44.934 29.0982 44.094 28.8836 43.3287 28.4542C42.5633 28.0249 41.9567 27.4322 41.5087 26.6762C41.0607 25.9109 40.8367 25.0476 40.8367 24.0862C40.8367 23.1342 41.0607 22.2802 41.5087 21.5242C41.9567 20.7589 42.5633 20.1616 43.3287 19.7322C44.094 19.3029 44.934 19.0882 45.8487 19.0882C46.7727 19.0882 47.6127 19.3029 48.3687 19.7322C49.134 20.1616 49.736 20.7589 50.1747 21.5242C50.6227 22.2802 50.8467 23.1342 50.8467 24.0862C50.8467 25.0476 50.6227 25.9109 50.1747 26.6762C49.736 27.4322 49.134 28.0249 48.3687 28.4542C47.6033 28.8836 46.7633 29.0982 45.8487 29.0982ZM45.8487 27.3482C46.4367 27.3482 46.9547 27.2176 47.4027 26.9562C47.8507 26.6856 48.2007 26.3029 48.4527 25.8082C48.7047 25.3136 48.8307 24.7396 48.8307 24.0862C48.8307 23.4329 48.7047 22.8636 48.4527 22.3782C48.2007 21.8836 47.8507 21.5056 47.4027 21.2442C46.9547 20.9829 46.4367 20.8522 45.8487 20.8522C45.2607 20.8522 44.738 20.9829 44.2807 21.2442C43.8327 21.5056 43.4827 21.8836 43.2307 22.3782C42.9787 22.8636 42.8527 23.4329 42.8527 24.0862C42.8527 24.7396 42.9787 25.3136 43.2307 25.8082C43.4827 26.3029 43.8327 26.6856 44.2807 26.9562C44.738 27.2176 45.2607 27.3482 45.8487 27.3482ZM54.5869 22.8542V26.6062C54.5869 26.8676 54.6475 27.0589 54.7689 27.1802C54.8995 27.2922 55.1142 27.3482 55.4129 27.3482H56.3229V29.0002H55.0909C53.4389 29.0002 52.6129 28.1976 52.6129 26.5922V22.8542H51.6889V21.2442H52.6129V19.3262H54.5869V21.2442H56.3229V22.8542H54.5869ZM62.1006 21.1322C62.6886 21.1322 63.2113 21.2629 63.6686 21.5242C64.1259 21.7762 64.4806 22.1542 64.7326 22.6582C64.9939 23.1529 65.1246 23.7502 65.1246 24.4502V29.0002H63.1646V24.7162C63.1646 24.1002 63.0106 23.6289 62.7026 23.3022C62.3946 22.9662 61.9746 22.7982 61.4426 22.7982C60.9013 22.7982 60.4719 22.9662 60.1546 23.3022C59.8466 23.6289 59.6926 24.1002 59.6926 24.7162V29.0002H57.7326V18.6402H59.6926V22.2102C59.9446 21.8742 60.2806 21.6129 60.7006 21.4262C61.1206 21.2302 61.5873 21.1322 62.1006 21.1322ZM74.1985 24.9542C74.1985 25.2342 74.1798 25.4862 74.1425 25.7102H68.4725C68.5191 26.2702 68.7151 26.7089 69.0605 27.0262C69.4058 27.3436 69.8305 27.5022 70.3345 27.5022C71.0625 27.5022 71.5805 27.1896 71.8885 26.5642H74.0025C73.7785 27.3109 73.3491 27.9269 72.7145 28.4122C72.0798 28.8882 71.3005 29.1262 70.3765 29.1262C69.6298 29.1262 68.9578 28.9629 68.3605 28.6362C67.7725 28.3002 67.3105 27.8289 66.9745 27.2222C66.6478 26.6156 66.4845 25.9156 66.4845 25.1222C66.4845 24.3196 66.6478 23.6149 66.9745 23.0082C67.3011 22.4016 67.7585 21.9349 68.3465 21.6082C68.9345 21.2816 69.6111 21.1182 70.3765 21.1182C71.1138 21.1182 71.7718 21.2769 72.3505 21.5942C72.9385 21.9116 73.3911 22.3642 73.7085 22.9522C74.0351 23.5309 74.1985 24.1982 74.1985 24.9542ZM72.1685 24.3942C72.1591 23.8902 71.9771 23.4889 71.6225 23.1902C71.2678 22.8822 70.8338 22.7282 70.3205 22.7282C69.8351 22.7282 69.4245 22.8776 69.0885 23.1762C68.7618 23.4656 68.5611 23.8716 68.4865 24.3942H72.1685ZM77.5891 22.4482C77.8411 22.0376 78.1678 21.7156 78.5691 21.4822C78.9798 21.2489 79.4464 21.1322 79.9691 21.1322V23.1902H79.4511C78.8351 23.1902 78.3684 23.3349 78.0511 23.6242C77.7431 23.9136 77.5891 24.4176 77.5891 25.1362V29.0002H75.6291V21.2442H77.5891V22.4482ZM91.7512 22.2522C91.7512 22.7749 91.6252 23.2649 91.3732 23.7222C91.1305 24.1796 90.7432 24.5482 90.2112 24.8282C89.6885 25.1082 89.0258 25.2482 88.2232 25.2482H86.5852V29.0002H84.6252V19.2282H88.2232C88.9792 19.2282 89.6232 19.3589 90.1552 19.6202C90.6872 19.8816 91.0838 20.2409 91.3452 20.6982C91.6158 21.1556 91.7512 21.6736 91.7512 22.2522ZM88.1392 23.6662C88.6805 23.6662 89.0818 23.5449 89.3432 23.3022C89.6045 23.0502 89.7352 22.7002 89.7352 22.2522C89.7352 21.3002 89.2032 20.8242 88.1392 20.8242H86.5852V23.6662H88.1392ZM95.1028 22.4482C95.3548 22.0376 95.6814 21.7156 96.0828 21.4822C96.4934 21.2489 96.9601 21.1322 97.4828 21.1322V23.1902H96.9648C96.3488 23.1902 95.8821 23.3349 95.5648 23.6242C95.2568 23.9136 95.1028 24.4176 95.1028 25.1362V29.0002H93.1428V21.2442H95.1028V22.4482ZM102.247 29.1262C101.5 29.1262 100.828 28.9629 100.231 28.6362C99.6336 28.3002 99.1622 27.8289 98.8169 27.2222C98.4809 26.6156 98.3129 25.9156 98.3129 25.1222C98.3129 24.3289 98.4856 23.6289 98.8309 23.0222C99.1856 22.4156 99.6662 21.9489 100.273 21.6222C100.88 21.2862 101.556 21.1182 102.303 21.1182C103.05 21.1182 103.726 21.2862 104.333 21.6222C104.94 21.9489 105.416 22.4156 105.761 23.0222C106.116 23.6289 106.293 24.3289 106.293 25.1222C106.293 25.9156 106.111 26.6156 105.747 27.2222C105.392 27.8289 104.907 28.3002 104.291 28.6362C103.684 28.9629 103.003 29.1262 102.247 29.1262ZM102.247 27.4182C102.602 27.4182 102.933 27.3342 103.241 27.1662C103.558 26.9889 103.81 26.7276 103.997 26.3822C104.184 26.0369 104.277 25.6169 104.277 25.1222C104.277 24.3849 104.081 23.8202 103.689 23.4282C103.306 23.0269 102.835 22.8262 102.275 22.8262C101.715 22.8262 101.244 23.0269 100.861 23.4282C100.488 23.8202 100.301 24.3849 100.301 25.1222C100.301 25.8596 100.483 26.4289 100.847 26.8302C101.22 27.2222 101.687 27.4182 102.247 27.4182ZM111.287 22.8542H109.929V29.0002H107.941V22.8542H107.059V21.2442H107.941V20.8522C107.941 19.9002 108.211 19.2002 108.753 18.7522C109.294 18.3042 110.111 18.0942 111.203 18.1222V19.7742C110.727 19.7649 110.395 19.8442 110.209 20.0122C110.022 20.1802 109.929 20.4836 109.929 20.9222V21.2442H111.287V22.8542ZM113.551 20.3202C113.205 20.3202 112.916 20.2129 112.683 19.9982C112.459 19.7742 112.347 19.4989 112.347 19.1722C112.347 18.8456 112.459 18.5749 112.683 18.3602C112.916 18.1362 113.205 18.0242 113.551 18.0242C113.896 18.0242 114.181 18.1362 114.405 18.3602C114.638 18.5749 114.755 18.8456 114.755 19.1722C114.755 19.4989 114.638 19.7742 114.405 19.9982C114.181 20.2129 113.896 20.3202 113.551 20.3202ZM114.517 21.2442V29.0002H112.557V21.2442H114.517ZM118.413 18.6402V29.0002H116.453V18.6402H118.413ZM127.56 24.9542C127.56 25.2342 127.541 25.4862 127.504 25.7102H121.834C121.88 26.2702 122.076 26.7089 122.422 27.0262C122.767 27.3436 123.192 27.5022 123.696 27.5022C124.424 27.5022 124.942 27.1896 125.25 26.5642H127.364C127.14 27.3109 126.71 27.9269 126.076 28.4122C125.441 28.8882 124.662 29.1262 123.738 29.1262C122.991 29.1262 122.319 28.9629 121.722 28.6362C121.134 28.3002 120.672 27.8289 120.336 27.2222C120.009 26.6156 119.846 25.9156 119.846 25.1222C119.846 24.3196 120.009 23.6149 120.336 23.0082C120.662 22.4016 121.12 21.9349 121.708 21.6082C122.296 21.2816 122.972 21.1182 123.738 21.1182C124.475 21.1182 125.133 21.2769 125.712 21.5942C126.3 21.9116 126.752 22.3642 127.07 22.9522C127.396 23.5309 127.56 24.1982 127.56 24.9542ZM125.53 24.3942C125.52 23.8902 125.338 23.4889 124.984 23.1902C124.629 22.8822 124.195 22.7282 123.682 22.7282C123.196 22.7282 122.786 22.8776 122.45 23.1762C122.123 23.4656 121.922 23.8716 121.848 24.3942H125.53ZM131.958 29.1262C131.324 29.1262 130.754 29.0142 130.25 28.7902C129.746 28.5569 129.345 28.2442 129.046 27.8522C128.757 27.4602 128.598 27.0262 128.57 26.5502H130.544C130.582 26.8489 130.726 27.0962 130.978 27.2922C131.24 27.4882 131.562 27.5862 131.944 27.5862C132.318 27.5862 132.607 27.5116 132.812 27.3622C133.027 27.2129 133.134 27.0216 133.134 26.7882C133.134 26.5362 133.004 26.3496 132.742 26.2282C132.49 26.0976 132.084 25.9576 131.524 25.8082C130.946 25.6682 130.47 25.5236 130.096 25.3742C129.732 25.2249 129.415 24.9962 129.144 24.6882C128.883 24.3802 128.752 23.9649 128.752 23.4422C128.752 23.0129 128.874 22.6209 129.116 22.2662C129.368 21.9116 129.723 21.6316 130.18 21.4262C130.647 21.2209 131.193 21.1182 131.818 21.1182C132.742 21.1182 133.48 21.3516 134.03 21.8182C134.581 22.2756 134.884 22.8962 134.94 23.6802H133.064C133.036 23.3722 132.906 23.1296 132.672 22.9522C132.448 22.7656 132.145 22.6722 131.762 22.6722C131.408 22.6722 131.132 22.7376 130.936 22.8682C130.75 22.9989 130.656 23.1809 130.656 23.4142C130.656 23.6756 130.787 23.8762 131.048 24.0162C131.31 24.1469 131.716 24.2822 132.266 24.4222C132.826 24.5622 133.288 24.7069 133.652 24.8562C134.016 25.0056 134.329 25.2389 134.59 25.5562C134.861 25.8642 135.001 26.2749 135.01 26.7882C135.01 27.2362 134.884 27.6376 134.632 27.9922C134.39 28.3469 134.035 28.6269 133.568 28.8322C133.111 29.0282 132.574 29.1262 131.958 29.1262Z"
                    fill="#1B2F39"
                />
                <path
                    d="M281.529 27.272L280.842 26.724C280.372 26.3487 280.373 25.6511 280.842 25.2765L281.529 24.7285C282.018 24.3386 282.143 23.6699 281.826 23.1385L280.47 20.862C280.154 20.3307 279.493 20.1013 278.901 20.3165L278.068 20.6189C277.497 20.8261 276.874 20.4767 276.774 19.8952L276.628 19.0447C276.524 18.4395 275.989 18.0002 275.356 18.0002H272.644C272.011 18.0002 271.476 18.4395 271.372 19.0447L271.226 19.8952C271.125 20.4777 270.502 20.8257 269.932 20.619L269.099 20.3165C268.507 20.1013 267.847 20.3307 267.53 20.862L266.174 23.1384C265.857 23.6698 265.982 24.3385 266.471 24.7285L267.158 25.2764C267.628 25.6518 267.627 26.3494 267.158 26.724L266.471 27.2719C265.982 27.6619 265.857 28.3307 266.174 28.862L267.53 31.1384C267.847 31.6698 268.506 31.8992 269.099 31.684L269.932 31.3815C270.503 31.1743 271.126 31.5239 271.226 32.1053L271.372 32.9557C271.476 33.561 272.011 34.0002 272.644 34.0002H275.356C275.989 34.0002 276.524 33.561 276.628 32.9557L276.774 32.1054C276.874 31.5229 277.498 31.1747 278.068 31.3816L278.901 31.684C279.494 31.8992 280.154 31.6698 280.47 31.1385L281.826 28.862C282.143 28.3307 282.018 27.6619 281.529 27.272V27.272ZM279.353 30.5135L278.52 30.211C277.189 29.7275 275.736 30.5432 275.502 31.8998L275.356 32.7502H272.644L272.498 31.8998C272.264 30.5406 270.809 29.7285 269.48 30.211L268.647 30.5135L267.291 28.237L267.978 27.6891C269.075 26.8132 269.073 25.1855 267.978 24.3114L267.291 23.7635L268.647 21.487L269.48 21.7895C270.811 22.2729 272.265 21.4573 272.498 20.1007L272.644 19.2502H275.356L275.502 20.1007C275.736 21.4601 277.191 22.2719 278.52 21.7895L279.353 21.487L280.709 23.7632C280.709 23.7632 280.709 23.7632 280.709 23.7634L280.022 24.3114C278.925 25.1872 278.927 26.8149 280.022 27.6891L280.709 28.237L279.353 30.5135ZM274 22.9169C272.246 22.9169 270.819 24.3001 270.819 26.0002C270.819 27.7004 272.246 29.0836 274 29.0836C275.754 29.0836 277.181 27.7004 277.181 26.0002C277.181 24.3001 275.754 22.9169 274 22.9169ZM274 27.8336C272.957 27.8336 272.108 27.0112 272.108 26.0002C272.108 24.9893 272.957 24.1669 274 24.1669C275.043 24.1669 275.892 24.9893 275.892 26.0002C275.892 27.0112 275.043 27.8336 274 27.8336Z"
                    fill="#1B2F39"
                />
                <rect x="40.5" y="47.2122" width="20" height="20" rx="10" fill="#4483FF" />
                <path
                    d="M52.0613 53.3722V59.3842C52.0613 60.1282 51.8333 60.7162 51.3773 61.1482C50.9293 61.5802 50.3373 61.7962 49.6013 61.7962C48.8653 61.7962 48.2693 61.5802 47.8133 61.1482C47.3653 60.7162 47.1413 60.1282 47.1413 59.3842H48.5213C48.5293 59.7522 48.6213 60.0442 48.7973 60.2602C48.9813 60.4762 49.2493 60.5842 49.6013 60.5842C49.9533 60.5842 50.2213 60.4762 50.4053 60.2602C50.5893 60.0362 50.6813 59.7442 50.6813 59.3842V53.3722H52.0613Z"
                    fill="white"
                />
                <path
                    d="M75.2837 51.9822V58.9962C75.2837 59.8642 75.0177 60.5502 74.4857 61.0542C73.9631 61.5582 73.2724 61.8102 72.4137 61.8102C71.5551 61.8102 70.8597 61.5582 70.3277 61.0542C69.8051 60.5502 69.5437 59.8642 69.5437 58.9962H71.1537C71.1631 59.4255 71.2704 59.7662 71.4757 60.0182C71.6904 60.2702 72.0031 60.3962 72.4137 60.3962C72.8244 60.3962 73.1371 60.2702 73.3517 60.0182C73.5664 59.7568 73.6737 59.4162 73.6737 58.9962V51.9822H75.2837ZM81.2261 61.8382C80.4981 61.8382 79.8401 61.6748 79.2521 61.3482C78.6641 61.0122 78.2021 60.5455 77.8661 59.9482C77.5301 59.3415 77.3621 58.6415 77.3621 57.8482C77.3621 57.0642 77.5347 56.3688 77.8801 55.7622C78.2254 55.1555 78.6967 54.6888 79.2941 54.3622C79.8914 54.0355 80.5587 53.8722 81.2961 53.8722C82.0334 53.8722 82.7007 54.0355 83.2981 54.3622C83.8954 54.6888 84.3667 55.1555 84.7121 55.7622C85.0574 56.3688 85.2301 57.0642 85.2301 57.8482C85.2301 58.6322 85.0527 59.3275 84.6981 59.9342C84.3434 60.5408 83.8581 61.0122 83.2421 61.3482C82.6354 61.6748 81.9634 61.8382 81.2261 61.8382ZM81.2261 60.4522C81.6367 60.4522 82.0194 60.3542 82.3741 60.1582C82.7381 59.9622 83.0321 59.6682 83.2561 59.2762C83.4801 58.8842 83.5921 58.4082 83.5921 57.8482C83.5921 57.2882 83.4847 56.8168 83.2701 56.4342C83.0554 56.0422 82.7707 55.7482 82.4161 55.5522C82.0614 55.3562 81.6787 55.2582 81.2681 55.2582C80.8574 55.2582 80.4747 55.3562 80.1201 55.5522C79.7747 55.7482 79.4994 56.0422 79.2941 56.4342C79.0887 56.8168 78.9861 57.2882 78.9861 57.8482C78.9861 58.6788 79.1961 59.3228 79.6161 59.7802C80.0454 60.2282 80.5821 60.4522 81.2261 60.4522ZM90.7978 53.8722C91.3858 53.8722 91.9085 53.9982 92.3658 54.2502C92.8325 54.5022 93.1965 54.8755 93.4578 55.3702C93.7285 55.8648 93.8638 56.4622 93.8638 57.1622V61.7122H92.2818V57.4002C92.2818 56.7095 92.1091 56.1822 91.7638 55.8182C91.4185 55.4448 90.9471 55.2582 90.3498 55.2582C89.7525 55.2582 89.2765 55.4448 88.9218 55.8182C88.5765 56.1822 88.4038 56.7095 88.4038 57.4002V61.7122H86.8078V51.3522H88.4038V54.8942C88.6745 54.5675 89.0151 54.3155 89.4258 54.1382C89.8458 53.9608 90.3031 53.8722 90.7978 53.8722ZM99.7916 53.8722C100.398 53.8722 100.94 53.9982 101.416 54.2502C101.901 54.5022 102.279 54.8755 102.55 55.3702C102.82 55.8648 102.956 56.4622 102.956 57.1622V61.7122H101.374V57.4002C101.374 56.7095 101.201 56.1822 100.856 55.8182C100.51 55.4448 100.039 55.2582 99.4416 55.2582C98.8443 55.2582 98.3683 55.4448 98.0136 55.8182C97.6683 56.1822 97.4956 56.7095 97.4956 57.4002V61.7122H95.8996V53.9982H97.4956V54.8802C97.7569 54.5628 98.0883 54.3155 98.4896 54.1382C98.9003 53.9608 99.3343 53.8722 99.7916 53.8722ZM111.806 51.9822C112.842 51.9822 113.747 52.1828 114.522 52.5842C115.306 52.9762 115.908 53.5455 116.328 54.2922C116.757 55.0295 116.972 55.8928 116.972 56.8822C116.972 57.8715 116.757 58.7302 116.328 59.4582C115.908 60.1862 115.306 60.7462 114.522 61.1382C113.747 61.5208 112.842 61.7122 111.806 61.7122H108.628V51.9822H111.806ZM111.806 60.4102C112.945 60.4102 113.817 60.1022 114.424 59.4862C115.031 58.8702 115.334 58.0022 115.334 56.8822C115.334 55.7528 115.031 54.8708 114.424 54.2362C113.817 53.6015 112.945 53.2842 111.806 53.2842H110.224V60.4102H111.806ZM121.9 61.8382C121.172 61.8382 120.514 61.6748 119.926 61.3482C119.338 61.0122 118.876 60.5455 118.54 59.9482C118.204 59.3415 118.036 58.6415 118.036 57.8482C118.036 57.0642 118.209 56.3688 118.554 55.7622C118.899 55.1555 119.371 54.6888 119.968 54.3622C120.565 54.0355 121.233 53.8722 121.97 53.8722C122.707 53.8722 123.375 54.0355 123.972 54.3622C124.569 54.6888 125.041 55.1555 125.386 55.7622C125.731 56.3688 125.904 57.0642 125.904 57.8482C125.904 58.6322 125.727 59.3275 125.372 59.9342C125.017 60.5408 124.532 61.0122 123.916 61.3482C123.309 61.6748 122.637 61.8382 121.9 61.8382ZM121.9 60.4522C122.311 60.4522 122.693 60.3542 123.048 60.1582C123.412 59.9622 123.706 59.6682 123.93 59.2762C124.154 58.8842 124.266 58.4082 124.266 57.8482C124.266 57.2882 124.159 56.8168 123.944 56.4342C123.729 56.0422 123.445 55.7482 123.09 55.5522C122.735 55.3562 122.353 55.2582 121.942 55.2582C121.531 55.2582 121.149 55.3562 120.794 55.5522C120.449 55.7482 120.173 56.0422 119.968 56.4342C119.763 56.8168 119.66 57.2882 119.66 57.8482C119.66 58.6788 119.87 59.3228 120.29 59.7802C120.719 60.2282 121.256 60.4522 121.9 60.4522ZM134.552 57.6662C134.552 57.9555 134.533 58.2168 134.496 58.4502H128.602C128.648 59.0662 128.877 59.5608 129.288 59.9342C129.698 60.3075 130.202 60.4942 130.8 60.4942C131.658 60.4942 132.265 60.1348 132.62 59.4162H134.342C134.108 60.1255 133.684 60.7088 133.068 61.1662C132.461 61.6142 131.705 61.8382 130.8 61.8382C130.062 61.8382 129.4 61.6748 128.812 61.3482C128.233 61.0122 127.776 60.5455 127.44 59.9482C127.113 59.3415 126.95 58.6415 126.95 57.8482C126.95 57.0548 127.108 56.3595 127.426 55.7622C127.752 55.1555 128.205 54.6888 128.784 54.3622C129.372 54.0355 130.044 53.8722 130.8 53.8722C131.528 53.8722 132.176 54.0308 132.746 54.3482C133.315 54.6655 133.758 55.1135 134.076 55.6922C134.393 56.2615 134.552 56.9195 134.552 57.6662ZM132.886 57.1622C132.876 56.5742 132.666 56.1028 132.256 55.7482C131.845 55.3935 131.336 55.2162 130.73 55.2162C130.179 55.2162 129.708 55.3935 129.316 55.7482C128.924 56.0935 128.69 56.5648 128.616 57.1622H132.886Z"
                    fill="#1B2F39"
                />
                <rect x="21.5" y="79.7122" width="316" height="37" fill="#F5F7FA" />
                <rect x="40.5" y="88.2122" width="20" height="20" rx="10" fill="#725BF6" />
                <path
                    d="M56.2659 94.3722L53.7939 102.712H52.2459L50.4939 96.4002L48.6339 102.712L47.0979 102.724L44.7339 94.3722H46.1859L47.9139 101.164L49.7859 94.3722H51.3219L53.0619 101.128L54.8019 94.3722H56.2659Z"
                    fill="white"
                />
                <path
                    d="M82.2327 92.9822L79.3487 102.712H77.5427L75.4987 95.3482L73.3287 102.712L71.5367 102.726L68.7787 92.9822H70.4727L72.4887 100.906L74.6727 92.9822H76.4647L78.4947 100.864L80.5247 92.9822H82.2327ZM86.895 102.838C86.167 102.838 85.509 102.675 84.921 102.348C84.333 102.012 83.871 101.545 83.535 100.948C83.199 100.341 83.031 99.6415 83.031 98.8482C83.031 98.0642 83.2037 97.3688 83.549 96.7622C83.8944 96.1555 84.3657 95.6888 84.963 95.3622C85.5604 95.0355 86.2277 94.8722 86.965 94.8722C87.7024 94.8722 88.3697 95.0355 88.967 95.3622C89.5644 95.6888 90.0357 96.1555 90.381 96.7622C90.7264 97.3688 90.899 98.0642 90.899 98.8482C90.899 99.6322 90.7217 100.327 90.367 100.934C90.0124 101.541 89.527 102.012 88.911 102.348C88.3044 102.675 87.6324 102.838 86.895 102.838ZM86.895 101.452C87.3057 101.452 87.6884 101.354 88.043 101.158C88.407 100.962 88.701 100.668 88.925 100.276C89.149 99.8842 89.261 99.4082 89.261 98.8482C89.261 98.2882 89.1537 97.8168 88.939 97.4342C88.7244 97.0422 88.4397 96.7482 88.085 96.5522C87.7304 96.3562 87.3477 96.2582 86.937 96.2582C86.5264 96.2582 86.1437 96.3562 85.789 96.5522C85.4437 96.7482 85.1684 97.0422 84.963 97.4342C84.7577 97.8168 84.655 98.2882 84.655 98.8482C84.655 99.6788 84.865 100.323 85.285 100.78C85.7144 101.228 86.251 101.452 86.895 101.452ZM94.0728 96.1182C94.3061 95.7262 94.6141 95.4228 94.9968 95.2082C95.3888 94.9842 95.8508 94.8722 96.3828 94.8722V96.5242H95.9768C95.3514 96.5242 94.8754 96.6828 94.5488 97.0002C94.2314 97.3175 94.0728 97.8682 94.0728 98.6522V102.712H92.4768V94.9982H94.0728V96.1182ZM100.902 98.8622L104.458 102.712H102.302L99.4458 99.3942V102.712H97.8498V92.3522H99.4458V98.3722L102.246 94.9982H104.458L100.902 98.8622ZM116.042 95.8802C116.042 96.3748 115.926 96.8415 115.692 97.2802C115.459 97.7188 115.086 98.0782 114.572 98.3582C114.059 98.6288 113.401 98.7642 112.598 98.7642H110.834V102.712H109.238V92.9822H112.598C113.345 92.9822 113.975 93.1128 114.488 93.3742C115.011 93.6262 115.398 93.9715 115.65 94.4102C115.912 94.8488 116.042 95.3388 116.042 95.8802ZM112.598 97.4622C113.205 97.4622 113.658 97.3268 113.956 97.0562C114.255 96.7762 114.404 96.3842 114.404 95.8802C114.404 94.8162 113.802 94.2842 112.598 94.2842H110.834V97.4622H112.598ZM119.161 96.1182C119.394 95.7262 119.702 95.4228 120.085 95.2082C120.477 94.9842 120.939 94.8722 121.471 94.8722V96.5242H121.065C120.439 96.5242 119.963 96.6828 119.637 97.0002C119.319 97.3175 119.161 97.8682 119.161 98.6522V102.712H117.565V94.9982H119.161V96.1182ZM126.284 102.838C125.556 102.838 124.898 102.675 124.31 102.348C123.722 102.012 123.26 101.545 122.924 100.948C122.588 100.341 122.42 99.6415 122.42 98.8482C122.42 98.0642 122.592 97.3688 122.938 96.7622C123.283 96.1555 123.754 95.6888 124.352 95.3622C124.949 95.0355 125.616 94.8722 126.354 94.8722C127.091 94.8722 127.758 95.0355 128.356 95.3622C128.953 95.6888 129.424 96.1555 129.77 96.7622C130.115 97.3688 130.288 98.0642 130.288 98.8482C130.288 99.6322 130.11 100.327 129.756 100.934C129.401 101.541 128.916 102.012 128.3 102.348C127.693 102.675 127.021 102.838 126.284 102.838ZM126.284 101.452C126.694 101.452 127.077 101.354 127.432 101.158C127.796 100.962 128.09 100.668 128.314 100.276C128.538 99.8842 128.65 99.4082 128.65 98.8482C128.65 98.2882 128.542 97.8168 128.328 97.4342C128.113 97.0422 127.828 96.7482 127.474 96.5522C127.119 96.3562 126.736 96.2582 126.326 96.2582C125.915 96.2582 125.532 96.3562 125.178 96.5522C124.832 96.7482 124.557 97.0422 124.352 97.4342C124.146 97.8168 124.044 98.2882 124.044 98.8482C124.044 99.6788 124.254 100.323 124.674 100.78C125.103 101.228 125.64 101.452 126.284 101.452ZM135.099 96.3002H133.671V102.712H132.061V96.3002H131.151V94.9982H132.061V94.4522C132.061 93.5655 132.295 92.9215 132.761 92.5202C133.237 92.1095 133.979 91.9042 134.987 91.9042V93.2342C134.502 93.2342 134.161 93.3275 133.965 93.5142C133.769 93.6915 133.671 94.0042 133.671 94.4522V94.9982H135.099V96.3002ZM137.326 93.9762C137.037 93.9762 136.794 93.8782 136.598 93.6822C136.402 93.4862 136.304 93.2435 136.304 92.9542C136.304 92.6648 136.402 92.4222 136.598 92.2262C136.794 92.0302 137.037 91.9322 137.326 91.9322C137.606 91.9322 137.844 92.0302 138.04 92.2262C138.236 92.4222 138.334 92.6648 138.334 92.9542C138.334 93.2435 138.236 93.4862 138.04 93.6822C137.844 93.8782 137.606 93.9762 137.326 93.9762ZM138.11 94.9982V102.712H136.514V94.9982H138.11ZM141.801 92.3522V102.712H140.205V92.3522H141.801ZM150.967 98.6662C150.967 98.9555 150.948 99.2168 150.911 99.4502H145.017C145.063 100.066 145.292 100.561 145.703 100.934C146.113 101.307 146.617 101.494 147.215 101.494C148.073 101.494 148.68 101.135 149.035 100.416H150.757C150.523 101.125 150.099 101.709 149.483 102.166C148.876 102.614 148.12 102.838 147.215 102.838C146.477 102.838 145.815 102.675 145.227 102.348C144.648 102.012 144.191 101.545 143.855 100.948C143.528 100.341 143.365 99.6415 143.365 98.8482C143.365 98.0548 143.523 97.3595 143.841 96.7622C144.167 96.1555 144.62 95.6888 145.199 95.3622C145.787 95.0355 146.459 94.8722 147.215 94.8722C147.943 94.8722 148.591 95.0308 149.161 95.3482C149.73 95.6655 150.173 96.1135 150.491 96.6922C150.808 97.2615 150.967 97.9195 150.967 98.6662ZM149.301 98.1622C149.291 97.5742 149.081 97.1028 148.671 96.7482C148.26 96.3935 147.751 96.2162 147.145 96.2162C146.594 96.2162 146.123 96.3935 145.731 96.7482C145.339 97.0935 145.105 97.5648 145.031 98.1622H149.301Z"
                    fill="#1B2F39"
                />
                <path
                    d="M50.5005 135.212V143.212"
                    stroke="#1B2F39"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M46.5 139.213H54.5"
                    stroke="#1B2F39"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M81.5469 141.724H77.4729L76.7729 143.712H75.1069L78.5929 133.968H80.4409L83.9269 143.712H82.2469L81.5469 141.724ZM81.0989 140.422L79.5169 135.9L77.9209 140.422H81.0989ZM84.9106 139.82C84.9106 139.045 85.0692 138.359 85.3866 137.762C85.7132 137.165 86.1519 136.703 86.7026 136.376C87.2626 136.04 87.8832 135.872 88.5646 135.872C89.0686 135.872 89.5632 135.984 90.0486 136.208C90.5432 136.423 90.9352 136.712 91.2246 137.076V133.352H92.8346V143.712H91.2246V142.55C90.9632 142.923 90.5992 143.231 90.1326 143.474C89.6752 143.717 89.1479 143.838 88.5506 143.838C87.8786 143.838 87.2626 143.67 86.7026 143.334C86.1519 142.989 85.7132 142.513 85.3866 141.906C85.0692 141.29 84.9106 140.595 84.9106 139.82ZM91.2246 139.848C91.2246 139.316 91.1126 138.854 90.8886 138.462C90.6739 138.07 90.3892 137.771 90.0346 137.566C89.6799 137.361 89.2972 137.258 88.8866 137.258C88.4759 137.258 88.0932 137.361 87.7386 137.566C87.3839 137.762 87.0946 138.056 86.8706 138.448C86.6559 138.831 86.5486 139.288 86.5486 139.82C86.5486 140.352 86.6559 140.819 86.8706 141.22C87.0946 141.621 87.3839 141.929 87.7386 142.144C88.1026 142.349 88.4852 142.452 88.8866 142.452C89.2972 142.452 89.6799 142.349 90.0346 142.144C90.3892 141.939 90.6739 141.64 90.8886 141.248C91.1126 140.847 91.2246 140.38 91.2246 139.848ZM94.3989 139.82C94.3989 139.045 94.5575 138.359 94.8749 137.762C95.2015 137.165 95.6402 136.703 96.1909 136.376C96.7509 136.04 97.3715 135.872 98.0529 135.872C98.5569 135.872 99.0515 135.984 99.5369 136.208C100.032 136.423 100.424 136.712 100.713 137.076V133.352H102.323V143.712H100.713V142.55C100.452 142.923 100.088 143.231 99.6209 143.474C99.1635 143.717 98.6362 143.838 98.0389 143.838C97.3669 143.838 96.7509 143.67 96.1909 143.334C95.6402 142.989 95.2015 142.513 94.8749 141.906C94.5575 141.29 94.3989 140.595 94.3989 139.82ZM100.713 139.848C100.713 139.316 100.601 138.854 100.377 138.462C100.162 138.07 99.8775 137.771 99.5229 137.566C99.1682 137.361 98.7855 137.258 98.3749 137.258C97.9642 137.258 97.5815 137.361 97.2269 137.566C96.8722 137.762 96.5829 138.056 96.3589 138.448C96.1442 138.831 96.0369 139.288 96.0369 139.82C96.0369 140.352 96.1442 140.819 96.3589 141.22C96.5829 141.621 96.8722 141.929 97.2269 142.144C97.5909 142.349 97.9735 142.452 98.3749 142.452C98.7855 142.452 99.1682 142.349 99.5229 142.144C99.8775 141.939 100.162 141.64 100.377 141.248C100.601 140.847 100.713 140.38 100.713 139.848Z"
                    fill="#1B2F39"
                />
                <g filter="url(#filter1_d_4371_1321)">
                    <path
                        d="M167.652 123.89L164 108.629L177.495 116.48L171.502 117.914L167.652 123.89Z"
                        fill="#1B2F39"
                    />
                    <path
                        d="M167.652 123.89L164 108.629L177.495 116.48L171.502 117.914L167.652 123.89Z"
                        stroke="white"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
            </g>
            <path
                d="M20.5 1.71216H303.5H20.5ZM304.5 153.712C304.5 160.892 298.68 166.712 291.5 166.712H32.5C25.3203 166.712 19.5 160.892 19.5 153.712H21.5C21.5 159.787 26.4249 164.712 32.5 164.712H291.5C297.575 164.712 302.5 159.787 302.5 153.712H304.5ZM32.5 166.712C25.3203 166.712 19.5 160.892 19.5 153.712V1.71216H21.5V153.712C21.5 159.787 26.4249 164.712 32.5 164.712V166.712ZM304.5 1.71216V153.712C304.5 160.892 298.68 166.712 291.5 166.712V164.712C297.575 164.712 302.5 159.787 302.5 153.712V1.71216H304.5Z"
                fill="#DBE3E8"
                mask="url(#path-2-inside-1_4371_1321)"
            />
        </g>
        <defs>
            <filter
                id="filter0_d_4371_1321"
                x="18.5"
                y="0.712158"
                width="287"
                height="168"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4371_1321" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4371_1321" result="shape" />
            </filter>
            <filter
                id="filter1_d_4371_1321"
                x="161.5"
                y="107.129"
                width="18.495"
                height="20.2603"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4371_1321" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4371_1321" result="shape" />
            </filter>
            <clipPath id="clip0_4371_1321">
                <path
                    d="M20.5 1.71216H303.5V153.712C303.5 160.34 298.127 165.712 291.5 165.712H32.5C25.8726 165.712 20.5 160.34 20.5 153.712V1.71216Z"
                    fill="white"
                />
            </clipPath>
        </defs>
    </svg>
`,D0=Object.freeze(Object.defineProperty({__proto__:null,accessBlockSwitch:M0,accessBlockedLogo:H0,acmeLogo:m0,backArrow:b0,closeIcon:E0,defaultExtensionIcon:v0,dpLogo:B0,layerXLogo:w0,layerXLogoNew:x0,likeIcon:I0,unauthorizedWebsiteLogo:y0,unlikeIcon:R0},Symbol.toStringTag,{value:"Module"}));var L0=Object.defineProperty,T0=Object.getOwnPropertyDescriptor,I2=(i,t,e,s)=>{for(var o=s>1?void 0:s?T0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&L0(t,e,o),o};let K1=class extends R{constructor(){super(...arguments),this.svgProps={},this.dataTestId="",this.setStyles=()=>{const i=this.shadowRoot?.querySelector("svg");i?.setAttribute("data-test-id",this.dataTestId),!(!i||!this.svgProps)&&Object.entries(this.svgProps).forEach(t=>{const[e,s]=t;i.style[e]!==s&&(i.style[e]=s)})}}render(){return D0[this.icon]}updated(){this.setStyles()}};I2([p({type:String})],K1.prototype,"icon",2);I2([p({type:Object})],K1.prototype,"svgProps",2);I2([p()],K1.prototype,"dataTestId",2);K1=I2([P("custom-icon")],K1);const V0={width:"370px",right:"-4px",borderRadius:"10px",display:"grid",gridTemplateRows:"auto auto 1fr auto",direction:"ltr",fontFamily:"Montserrat",background:"white",color:"black",fontSize:"16px",height:"auto"},Qe=N`
    .content-title {
        font-size: 18px;
        font-weight: 600;
    }

    .options {
        display: flex;
        flex-flow: column;
        margin-top: 10px;
    }

    .option {
        max-width: 320px;
        margin: 5px 0;
        border: 1px solid #e8e8e8;
        border-radius: 11px;
        color: #708794;
        line-height: 20px;
        font-size: 14px;
        padding: 10px 13px;
        box-sizing: border-box;
        box-shadow: 0px 23px 35px rgba(0, 0, 0, 0.03);
        cursor: pointer;
    }

    .selected {
        border-color: var(--layer-x-color);
        color: #232b35;
    }

    .other-text {
        color: #708794;
        font-size: 12px;
        margin-top: 20px;
    }

    .textarea {
        margin-top: 10px;
        background: #ffffff;
        border: 1px solid #dedede;
        color: #708794;
        font-size: 12px;
        padding: 8px 10px;
        resize: none;
        width: 100%;
        height: 90px;
        box-sizing: border-box;
        font-family: 'Montserrat';
        font-size: 12px;
        outline: none;
    }

    .justification {
        width: 370px;
        right: -4px;
        border-radius: 10px;
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        direction: ltr;
        font-family: 'Montserrat';
        background-color: white;
        color: black;
        font-size: 16px;
    }
`,P0=N`
    .divider {
        border: 1px solid rgba(159, 157, 158, 0.1);
        margin: 20px 0;
        width: 100%;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        width: 100%;
    }

    .company-logo {
        max-width: 114px;
    }

    p {
        line-height: 1.3;
        margin: 0;
        padding: 0;
    }

    p:not(first-child) {
        padding-top: 14px;
    }

    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding-top: 25px;
    }

    ${Qe}
`,O0=i=>{const{parsedOptions:t,selectedIdx:e,other:s,showTextArea:o,handleSelectOption:n,onChangeShowTextArea:r}=i,u=t?.map((A,c)=>f`<div
                key="${c}"
                id="option-${c}"
                data-test-id="option-${c}"
                class="${j1("option",{selected:e-1===c})}"
                .onclick="${()=>n(c)}"
            >
                ${c+1}. ${A}
            </div>`);return s&&u.push(f`<div
                id="other-option"
                data-test-id="other-option"
                class=${j1("option",{selected:o})}
                .onclick=${()=>{n(t.length),r(!0)}}
            >
                ${t.length+1}. Other
            </div>`),u},Ne=i=>{if(i.parsedOptions)return f`<div class="options">${O0(i)}</div>`},Ue=(i,t)=>{if(i)return f`
        <div>
            <div class="other-text">Please write here:</div>
            <textarea
                id="option-text-area"
                data-test-id="option-text-area"
                class="textarea"
                placeholder="Type..."
                .oninput=${t}
            ></textarea>
        </div>
    `};var pt=(i=>(i.Justification="justification",i.Close="close",i))(pt||{}),S0=Object.defineProperty,Q0=Object.getOwnPropertyDescriptor,$=(i,t,e,s)=>{for(var o=s>1?void 0:s?Q0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&S0(t,e,o),o};let j=class extends R{constructor(){super(...arguments),this.companyLogo="",this.content="",this.options="",this.other=!1,this._parsedOptions=[""],this._selectedIdx=0,this._showTextarea=!1,this._otherText="",this.firstUpdated=()=>{this._parsedOptions=JSON.parse(this.options),this.addEventListener("keydown",i=>i.stopPropagation())},this.onChangeShowTextArea=i=>{this._showTextarea=i},this.handleChangeInput=i=>{if(!i)return;const t=i.target;this._otherText=t.value},this.handleClose=()=>{B(this,{eventType:pt.Close}),this.remove()},this.handleJustification=()=>{const i={justification:this._otherText||this._parsedOptions[this._selectedIdx-1]};B(this,{eventType:pt.Justification,detail:i}),this.remove()},this.handleSelectOption=i=>{this._selectedIdx=i+1,this._showTextarea=!1}}render(){return f`
            <style>
                ${P0}
            </style>
            <lit-card
                position=${u1.RightBottom}
                dataTestId="user-justification"
                .styles="${V0}"
                shouldFocusAssurance=${!0}
            >
                <div class="header">
                    <img data-test-id="company-logo" class="company-logo" src="${this.companyLogo}" />
                    <custom-icon
                        dataTestId="close-button"
                        class="close-button"
                        .onclick=${this.handleClose}
                        icon="closeIcon"
                    ></custom-icon>
                </div>
                <hr class="divider" />
                <div class="content">
                    <span class="content-title">Request Access</span>
                    <br />
                    <br />
                    <lit-rich-text text="${this.content}"></lit-rich-text>
                    ${Ne({parsedOptions:this._parsedOptions,selectedIdx:this._selectedIdx,other:this.other,showTextArea:this._showTextarea,handleSelectOption:this.handleSelectOption,onChangeShowTextArea:this.onChangeShowTextArea})}
                    ${Ue(this._showTextarea,this.handleChangeInput)}
                </div>
                <div class="actions">
                    <div></div>
                    <lit-button
                        id="justification-button"
                        dataTestId="justification-button"
                        .onclick=${this.handleJustification}
                        .disabled=${!this._selectedIdx&&!this._otherText}
                        text="Send Note"
                    >
                    </lit-button>
                </div>
            </lit-card>
        `}};$([p()],j.prototype,"companyLogo",2);$([p()],j.prototype,"content",2);$([p()],j.prototype,"options",2);$([p()],j.prototype,"other",2);$([b()],j.prototype,"_parsedOptions",2);$([b()],j.prototype,"_selectedIdx",2);$([b()],j.prototype,"_showTextarea",2);$([b()],j.prototype,"_otherText",2);j=$([P("lit-justification")],j);const N0={fontFamily:"Montserrat",height:"auto",width:"472px",background:"#ffff",boxShadow:"2px 2px 24px rgba(0, 0, 0, 0.5)",borderRadius:"20px 0px 0px 20px",padding:"24px",display:"grid",boxSizing:"border-box",gap:"6px",gridTemplateRows:"auto 1fr auto",border:"4px solid #725BF6",borderRight:"unset",direction:"ltr",right:"-4px"},U0=N`
    .content-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .title {
        color: #1b2f39;
        font-weight: 700;
        font-size: 24px;
    }
    .sub-title {
        font-weight: 400;
        font-size: 17px;
        color: #708794;
        margin-top: 6px;
    }

    .action-icons {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 37px;
    }

    .icons-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 37px;
        margin-bottom: 20px;
    }

    .like-icon,
    .unlike-icon {
        background: #f1f4f8;
        border-radius: 7px;
        padding: 14px 25px;
        box-sizing: border-box;
        margin-right: 25px;
        cursor: pointer;
    }

    .like-icon:hover,
    .unlike-icon:hover {
        transform: scale(1.05);
        box-shadow: 0px 5px 13px rgba(0, 0, 0, 0.2);
        transition: all 200ms linear;
    }
`;var h2=(i=>(i.Close="close",i.Like="like",i.Unlike="unlike",i))(h2||{}),z0=Object.getOwnPropertyDescriptor,F0=(i,t,e,s)=>{for(var o=s>1?void 0:s?z0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=r(o)||o);return o};let Ae=class extends R{constructor(){super(...arguments),this.onClose=()=>{B(this,{eventType:h2.Close}),this.remove()},this.onLike=()=>{B(this,{eventType:h2.Like}),this.remove()},this.onUnlike=()=>{B(this,{eventType:h2.Unlike}),this.remove()}}render(){return f`
            <style>
                ${U0}
            </style>
            <lit-card dataTestId="lit-mark-as-safe" .styles=${N0} position=${u1.RightBottom}>
                <div class="content-header">
                    <div class="title">Is this website safe?</div>
                    <custom-icon .onclick=${this.onClose} icon="closeIcon" dataTestId="close-button"></custom-icon>
                </div>
                <div class="sub-title">Please let us know</div>
                <div class="icons-container">
                    <custom-icon .onclick=${this.onLike} icon="likeIcon" class="like-icon"></custom-icon>
                    <custom-icon .onclick=${this.onUnlike} icon="unlikeIcon" class="unlike-icon"></custom-icon>
                </div>
            </lit-card>
        `}};Ae=F0([P("lit-mark-as-safe")],Ae);const q0=N`
    .loading {
        height: 100vh;
        width: 100vw;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2147483647;
        backdrop-filter: blur(3px);
    }
`,k0={background:"#bcc4c92e",cursor:"pointer",fontWeight:"bold"},ce="REVEAL_PII",X0=3e3,W0=i=>"*".repeat(i.length),Y0="Click to reveal masking";var Z0=Object.defineProperty,G0=Object.getOwnPropertyDescriptor,ze=(i,t,e,s)=>{for(var o=s>1?void 0:s?G0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&Z0(t,e,o),o};let Ct=class extends R{constructor(){super(...arguments),this.timeout=X0}connectedCallback(){super.connectedCallback(),setTimeout(()=>this.remove(),this.timeout)}render(){return f`
            <style>
                ${q0}
            </style>
            <div class="loading"></div>
        `}};ze([p({type:Number})],Ct.prototype,"timeout",2);Ct=ze([P("pii-loading")],Ct);var Fe=(i=>(i.Click="click",i))(Fe||{}),j0=Object.defineProperty,_0=Object.getOwnPropertyDescriptor,S1=(i,t,e,s)=>{for(var o=s>1?void 0:s?_0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&j0(t,e,o),o};let C1=class extends R{constructor(){super(...arguments),this.originalInnerHTML="",this.originalParts=[],this.getReplacedText=i=>{const t=new RegExp(this.regexes.join("|"),"igm");let e=null,s=i,o=0;do if(e=t.exec(s),e){const n=e[0],r=`${this.maskingElementDataId}_${o}`,u=W0(n),A=`<span id="${r}">${u}</span>`;s=s.replace(n,A),this.originalParts.push(n),o++}while(e);return s},this.insertMaskingElements=()=>{if(!this.element||!this.regexes)return;const i=this.element.innerText||"",t=this.getReplacedText(i);this.originalInnerHTML=i,this.element.innerHTML=t},this.reveal=i=>{const{maskingElementDataId:t,maskingElementId:e,remove:s}=i.detail;if(this.maskingElementDataId===t){if(!this.element||s)return this.remove();this.removeMaskingElement(e)}},this.removeMaskingElement=i=>{const t=document.querySelector(`[id^="${i}"]`);if(t){const e=Number(i.split("_")[1]),s=this.originalParts[e],o=document.createTextNode(s);this.element.replaceChild(o,t),t.removeEventListener("click",this.handleMaskingElementClick),t.remove()}},this.getElement=()=>{const i=`[data-masking-id="${this.maskingElementDataId}"]`;return document.querySelector(i)},this.handleMaskingElementClick=i=>{i.stopImmediatePropagation(),i.preventDefault();const t=i.target.id;B(this,{eventType:Fe.Click,detail:{maskingElementId:t}})},this.addStylesAndListener=i=>{i.addEventListener("click",this.handleMaskingElementClick),Object.entries(k0).forEach(t=>{const[e,s]=t;i.style[e]=s}),i.title=Y0},this.addEventListeners=()=>{document.querySelectorAll(`[id^="${this.maskingElementDataId}"]`).forEach(this.addStylesAndListener)}}connectedCallback(){if(super.connectedCallback(),document.addEventListener(ce,this.reveal),this.element=this.getElement(),!this.element)return console.error(`Element with dataId ${this.maskingElementDataId} was not found.`),this.remove();this.insertMaskingElements(),this.addEventListeners()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(ce,this.reveal)}};S1([p()],C1.prototype,"maskingElementDataId",2);S1([p({type:Array})],C1.prototype,"regexes",2);S1([b()],C1.prototype,"element",2);S1([b()],C1.prototype,"originalInnerHTML",2);S1([b()],C1.prototype,"originalParts",2);C1=S1([P("pii-replace")],C1);const K0=N`
    .redirect-page {
        width: 100%;
        height: 100%;
        display: grid;
        color: black;
        background-color: white;
        grid-template-rows: 1fr auto;
        justify-content: center;
        position: fixed;
        inset: 0;
        direction: ltr;
        font-family: 'Montserrat';
        background-color: white;
        color: black;
        z-index: 2147483647; // Max Int
    }

    .company-logo {
        max-width: 200px;
        max-height: 100px;
    }

    .main {
        width: 100%;
        height: 100%;
        display: flex;
        max-width: 1600px;
        position: relative;
        padding: 59px 72px 0 72px;
        box-sizing: border-box;
    }

    p {
        padding: 0;
        margin: 0;
        line-height: 21px;
    }

    .left {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 30px;
    }

    .title {
        font-weight: 700;
        font-size: 32px;
        line-height: 39px;
    }

    .url {
        font-weight: 600;
        line-break: anywhere;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 25px;
        font-size: 16px;
        font-weight: 400;
    }

    .actions {
        display: flex;
        gap: 13px;
    }

    .blocked-website {
        font-weight: 600;
    }

    a {
        color: var(--layer-x-color);
        text-decoration: none;
        font-weight: 600;
        white-space: nowrap;
    }

    .right {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .unauthorized-logo {
        max-width: 100%;
        max-height: 100%;
    }

    .justification-actions {
        display: flex;
        justify-content: space-between;
        max-width: 320px;
    }

    ${Qe}
`;var p2=(i=>(i.BackToSafety="backToSafety",i.Bypass="bypass",i))(p2||{}),J0=Object.defineProperty,$0=Object.getOwnPropertyDescriptor,O=(i,t,e,s)=>{for(var o=s>1?void 0:s?$0(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&J0(t,e,o),o};let V=class extends R{constructor(){super(...arguments),this.companyLogo="",this.isByPassable=!1,this.hideUnauthorizedLogo=!1,this.content="",this.blockedWebsite="",this.justificationAlertMessage="",this.justificationOther=!1,this.justificationOptions="",this._parsedOptions=[],this._shouldJustify=!1,this.title="Access Blocked",this._isJustificationVisible=!1,this._selectedIdx=0,this._showTextarea=!1,this._otherText="",this.firstUpdated=()=>{this.justificationOptions&&(this._parsedOptions=JSON.parse(this.justificationOptions)),this._shouldJustify=!!this._parsedOptions.length,this.addEventListener("keydown",i=>i.stopPropagation())},this.handleSelectOption=i=>{this._selectedIdx=i+1,this._showTextarea=!1},this.handleChangeInput=i=>{if(!i)return;const t=i.target;this._otherText=t.value},this.onChangeShowTextArea=i=>{this._showTextarea=i},this.handleBypass=()=>{if(!this._shouldJustify){B(this,{eventType:p2.Bypass});return}if(!this._isJustificationVisible){this._isJustificationVisible=!0;return}const i=this._otherText||this._parsedOptions[this._selectedIdx-1];i&&B(this,{eventType:p2.Bypass,detail:{justification:i}})},this.handleBackToSafety=()=>{B(this,{eventType:p2.BackToSafety})},this.getBypassBtn=()=>{if(this.isByPassable)return f`<lit-button
            data-test-id="bypass-button"
            class="bypass"
            .onclick=${this.handleBypass}
            text=${this._isJustificationVisible?"Send":"Continue to website"}
        ></lit-button>`},this.getCompanyLogo=()=>{if(this.companyLogo)return f`
            <img alt="Company Logo" data-test-id="company-logo" class="company-logo" src="${this.companyLogo}" />
        `},this.renderUnauthorizedLogo=()=>{if(!this.hideUnauthorizedLogo)return f` <custom-icon class="unauthorized-logo" icon="unauthorizedWebsiteLogo"></custom-icon> `},this.getTitle=()=>{if(!this.content.startsWith("<h1>"))return this.title;const t=this.content.match(/<h1>(.*?)<\/h1>/);return this.content=this.content.replace(/<h1>(.*?)<\/h1>/,""),t?t[1]:this.title},this.getContent=()=>this._isJustificationVisible?f`<span class="content-title">Request Access</span>
                <lit-rich-text text="${this.justificationAlertMessage}"></lit-rich-text>
                ${Ne({parsedOptions:this._parsedOptions,selectedIdx:this._selectedIdx,other:this.justificationOther,showTextArea:this._showTextarea,handleSelectOption:this.handleSelectOption,onChangeShowTextArea:this.onChangeShowTextArea})}
                ${Ue(this._showTextarea,this.handleChangeInput)}`:f`<lit-rich-text text="${this.content}"></lit-rich-text>
            <div>
                Blocked website:
                <div class="url">${this.blockedWebsite}</div>
            </div>`}render(){return f`
            <style>
                ${K0}
            </style>
            <div class="redirect-page" data-test-id="redirect-page">
                <div class="main">
                    <div class="left">
                        <div>${this.getCompanyLogo()}</div>
                        <div class="title">${this.getTitle()}</div>
                        <div class="content">${this.getContent()}</div>
                        <div class="${this._isJustificationVisible?"justification-":""}actions">
                            <lit-button
                                data-test-id="back-to-safety-button"
                                class="back-to-safety"
                                .onclick=${this.handleBackToSafety}
                                text="Back to safety"
                            >
                            </lit-button>
                            ${this.getBypassBtn()}
                        </div>
                    </div>
                    <div class="right">${this.renderUnauthorizedLogo()}</div>
                </div>
            </div>
        `}};O([p()],V.prototype,"companyLogo",2);O([p({type:Boolean})],V.prototype,"isByPassable",2);O([p({type:Boolean})],V.prototype,"hideUnauthorizedLogo",2);O([p()],V.prototype,"content",2);O([p()],V.prototype,"blockedWebsite",2);O([p()],V.prototype,"justificationAlertMessage",2);O([p()],V.prototype,"justificationOther",2);O([p()],V.prototype,"justificationOptions",2);O([b()],V.prototype,"_parsedOptions",2);O([b()],V.prototype,"_shouldJustify",2);O([b()],V.prototype,"title",2);O([b()],V.prototype,"_isJustificationVisible",2);O([b()],V.prototype,"_selectedIdx",2);O([b()],V.prototype,"_showTextarea",2);O([b()],V.prototype,"_otherText",2);V=O([P("lit-redirect-page")],V);/*! @license DOMPurify 3.0.5 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.0.5/LICENSE */const{entries:qe,setPrototypeOf:de,isFrozen:t6,getPrototypeOf:e6,getOwnPropertyDescriptor:i6}=Object;let{freeze:Q,seal:W,create:s6}=Object,{apply:ut,construct:ft}=typeof Reflect<"u"&&Reflect;ut||(ut=function(t,e,s){return t.apply(e,s)});Q||(Q=function(t){return t});W||(W=function(t){return t});ft||(ft=function(t,e){return new t(...e)});const o6=F(Array.prototype.forEach),he=F(Array.prototype.pop),q1=F(Array.prototype.push),C2=F(String.prototype.toLowerCase),$2=F(String.prototype.toString),n6=F(String.prototype.match),X=F(String.prototype.replace),r6=F(String.prototype.indexOf),l6=F(String.prototype.trim),U=F(RegExp.prototype.test),k1=a6(TypeError);function F(i){return function(t){for(var e=arguments.length,s=new Array(e>1?e-1:0),o=1;o<e;o++)s[o-1]=arguments[o];return ut(i,t,s)}}function a6(i){return function(){for(var t=arguments.length,e=new Array(t),s=0;s<t;s++)e[s]=arguments[s];return ft(i,e)}}function g(i,t,e){var s;e=(s=e)!==null&&s!==void 0?s:C2,de&&de(i,null);let o=t.length;for(;o--;){let n=t[o];if(typeof n=="string"){const r=e(n);r!==n&&(t6(t)||(t[o]=r),n=r)}i[n]=!0}return i}function I1(i){const t=s6(null);for(const[e,s]of qe(i))t[e]=s;return t}function A2(i,t){for(;i!==null;){const s=i6(i,t);if(s){if(s.get)return F(s.get);if(typeof s.value=="function")return F(s.value)}i=e6(i)}function e(s){return console.warn("fallback value for",s),null}return e}const pe=Q(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),tt=Q(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),et=Q(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),A6=Q(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),it=Q(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),c6=Q(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Ce=Q(["#text"]),ue=Q(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns","slot"]),st=Q(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),fe=Q(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),c2=Q(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),d6=W(/\{\{[\w\W]*|[\w\W]*\}\}/gm),h6=W(/<%[\w\W]*|[\w\W]*%>/gm),p6=W(/\${[\w\W]*}/gm),C6=W(/^data-[\-\w.\u00B7-\uFFFF]/),u6=W(/^aria-[\-\w]+$/),ke=W(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),f6=W(/^(?:\w+script|data):/i),g6=W(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Xe=W(/^html$/i);var ge=Object.freeze({__proto__:null,MUSTACHE_EXPR:d6,ERB_EXPR:h6,TMPLIT_EXPR:p6,DATA_ATTR:C6,ARIA_ATTR:u6,IS_ALLOWED_URI:ke,IS_SCRIPT_OR_DATA:f6,ATTR_WHITESPACE:g6,DOCTYPE_NAME:Xe});const m6=()=>typeof window>"u"?null:window,E6=function(t,e){if(typeof t!="object"||typeof t.createPolicy!="function")return null;let s=null;const o="data-tt-policy-suffix";e&&e.hasAttribute(o)&&(s=e.getAttribute(o));const n="dompurify"+(s?"#"+s:"");try{return t.createPolicy(n,{createHTML(r){return r},createScriptURL(r){return r}})}catch{return console.warn("TrustedTypes policy "+n+" could not be created."),null}};function We(){let i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:m6();const t=h=>We(h);if(t.version="3.0.5",t.removed=[],!i||!i.document||i.document.nodeType!==9)return t.isSupported=!1,t;const e=i.document,s=e.currentScript;let{document:o}=i;const{DocumentFragment:n,HTMLTemplateElement:r,Node:u,Element:A,NodeFilter:c,NamedNodeMap:E=i.NamedNodeMap||i.MozNamedAttrMap,HTMLFormElement:C,DOMParser:m,trustedTypes:w}=i,q=A.prototype,k=A2(q,"cloneNode"),je=A2(q,"nextSibling"),_e=A2(q,"childNodes"),R2=A2(q,"parentNode");if(typeof r=="function"){const h=o.createElement("template");h.content&&h.content.ownerDocument&&(o=h.content.ownerDocument)}let S,Q1="";const{implementation:b2,createNodeIterator:Ke,createDocumentFragment:Je,getElementsByTagName:$e}=o,{importNode:t3}=e;let Y={};t.isSupported=typeof qe=="function"&&typeof R2=="function"&&b2&&b2.createHTMLDocument!==void 0;const{MUSTACHE_EXPR:B2,ERB_EXPR:H2,TMPLIT_EXPR:M2,DATA_ATTR:e3,ARIA_ATTR:i3,IS_SCRIPT_OR_DATA:s3,ATTR_WHITESPACE:vt}=ge;let{IS_ALLOWED_URI:wt}=ge,H=null;const xt=g({},[...pe,...tt,...et,...it,...Ce]);let M=null;const It=g({},[...ue,...st,...fe,...c2]);let I=Object.seal(Object.create(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),N1=null,D2=null,yt=!0,L2=!0,Rt=!1,bt=!0,g1=!1,s1=!1,T2=!1,V2=!1,m1=!1,s2=!1,o2=!1,Bt=!0,Ht=!1;const o3="user-content-";let P2=!0,U1=!1,E1={},v1=null;const Mt=g({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Dt=null;const Lt=g({},["audio","video","img","source","image","track"]);let O2=null;const Tt=g({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),n2="http://www.w3.org/1998/Math/MathML",r2="http://www.w3.org/2000/svg",_="http://www.w3.org/1999/xhtml";let w1=_,S2=!1,Q2=null;const n3=g({},[n2,r2,_],$2);let o1;const r3=["application/xhtml+xml","text/html"],l3="text/html";let D,x1=null;const a3=o.createElement("form"),Vt=function(l){return l instanceof RegExp||l instanceof Function},N2=function(l){if(!(x1&&x1===l)){if((!l||typeof l!="object")&&(l={}),l=I1(l),o1=r3.indexOf(l.PARSER_MEDIA_TYPE)===-1?o1=l3:o1=l.PARSER_MEDIA_TYPE,D=o1==="application/xhtml+xml"?$2:C2,H="ALLOWED_TAGS"in l?g({},l.ALLOWED_TAGS,D):xt,M="ALLOWED_ATTR"in l?g({},l.ALLOWED_ATTR,D):It,Q2="ALLOWED_NAMESPACES"in l?g({},l.ALLOWED_NAMESPACES,$2):n3,O2="ADD_URI_SAFE_ATTR"in l?g(I1(Tt),l.ADD_URI_SAFE_ATTR,D):Tt,Dt="ADD_DATA_URI_TAGS"in l?g(I1(Lt),l.ADD_DATA_URI_TAGS,D):Lt,v1="FORBID_CONTENTS"in l?g({},l.FORBID_CONTENTS,D):Mt,N1="FORBID_TAGS"in l?g({},l.FORBID_TAGS,D):{},D2="FORBID_ATTR"in l?g({},l.FORBID_ATTR,D):{},E1="USE_PROFILES"in l?l.USE_PROFILES:!1,yt=l.ALLOW_ARIA_ATTR!==!1,L2=l.ALLOW_DATA_ATTR!==!1,Rt=l.ALLOW_UNKNOWN_PROTOCOLS||!1,bt=l.ALLOW_SELF_CLOSE_IN_ATTR!==!1,g1=l.SAFE_FOR_TEMPLATES||!1,s1=l.WHOLE_DOCUMENT||!1,m1=l.RETURN_DOM||!1,s2=l.RETURN_DOM_FRAGMENT||!1,o2=l.RETURN_TRUSTED_TYPE||!1,V2=l.FORCE_BODY||!1,Bt=l.SANITIZE_DOM!==!1,Ht=l.SANITIZE_NAMED_PROPS||!1,P2=l.KEEP_CONTENT!==!1,U1=l.IN_PLACE||!1,wt=l.ALLOWED_URI_REGEXP||ke,w1=l.NAMESPACE||_,I=l.CUSTOM_ELEMENT_HANDLING||{},l.CUSTOM_ELEMENT_HANDLING&&Vt(l.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(I.tagNameCheck=l.CUSTOM_ELEMENT_HANDLING.tagNameCheck),l.CUSTOM_ELEMENT_HANDLING&&Vt(l.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(I.attributeNameCheck=l.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),l.CUSTOM_ELEMENT_HANDLING&&typeof l.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements=="boolean"&&(I.allowCustomizedBuiltInElements=l.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),g1&&(L2=!1),s2&&(m1=!0),E1&&(H=g({},[...Ce]),M=[],E1.html===!0&&(g(H,pe),g(M,ue)),E1.svg===!0&&(g(H,tt),g(M,st),g(M,c2)),E1.svgFilters===!0&&(g(H,et),g(M,st),g(M,c2)),E1.mathMl===!0&&(g(H,it),g(M,fe),g(M,c2))),l.ADD_TAGS&&(H===xt&&(H=I1(H)),g(H,l.ADD_TAGS,D)),l.ADD_ATTR&&(M===It&&(M=I1(M)),g(M,l.ADD_ATTR,D)),l.ADD_URI_SAFE_ATTR&&g(O2,l.ADD_URI_SAFE_ATTR,D),l.FORBID_CONTENTS&&(v1===Mt&&(v1=I1(v1)),g(v1,l.FORBID_CONTENTS,D)),P2&&(H["#text"]=!0),s1&&g(H,["html","head","body"]),H.table&&(g(H,["tbody"]),delete N1.tbody),l.TRUSTED_TYPES_POLICY){if(typeof l.TRUSTED_TYPES_POLICY.createHTML!="function")throw k1('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof l.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw k1('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');S=l.TRUSTED_TYPES_POLICY,Q1=S.createHTML("")}else S===void 0&&(S=E6(w,s)),S!==null&&typeof Q1=="string"&&(Q1=S.createHTML(""));Q&&Q(l),x1=l}},Pt=g({},["mi","mo","mn","ms","mtext"]),Ot=g({},["foreignobject","desc","title","annotation-xml"]),A3=g({},["title","style","font","a","script"]),l2=g({},tt);g(l2,et),g(l2,A6);const U2=g({},it);g(U2,c6);const c3=function(l){let a=R2(l);(!a||!a.tagName)&&(a={namespaceURI:w1,tagName:"template"});const d=C2(l.tagName),v=C2(a.tagName);return Q2[l.namespaceURI]?l.namespaceURI===r2?a.namespaceURI===_?d==="svg":a.namespaceURI===n2?d==="svg"&&(v==="annotation-xml"||Pt[v]):!!l2[d]:l.namespaceURI===n2?a.namespaceURI===_?d==="math":a.namespaceURI===r2?d==="math"&&Ot[v]:!!U2[d]:l.namespaceURI===_?a.namespaceURI===r2&&!Ot[v]||a.namespaceURI===n2&&!Pt[v]?!1:!U2[d]&&(A3[d]||!l2[d]):!!(o1==="application/xhtml+xml"&&Q2[l.namespaceURI]):!1},n1=function(l){q1(t.removed,{element:l});try{l.parentNode.removeChild(l)}catch{l.remove()}},z2=function(l,a){try{q1(t.removed,{attribute:a.getAttributeNode(l),from:a})}catch{q1(t.removed,{attribute:null,from:a})}if(a.removeAttribute(l),l==="is"&&!M[l])if(m1||s2)try{n1(a)}catch{}else try{a.setAttribute(l,"")}catch{}},St=function(l){let a,d;if(V2)l="<remove></remove>"+l;else{const z=n6(l,/^[\r\n\t ]+/);d=z&&z[0]}o1==="application/xhtml+xml"&&w1===_&&(l='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+l+"</body></html>");const v=S?S.createHTML(l):l;if(w1===_)try{a=new m().parseFromString(v,o1)}catch{}if(!a||!a.documentElement){a=b2.createDocument(w1,"template",null);try{a.documentElement.innerHTML=S2?Q1:v}catch{}}const L=a.body||a.documentElement;return l&&d&&L.insertBefore(o.createTextNode(d),L.childNodes[0]||null),w1===_?$e.call(a,s1?"html":"body")[0]:s1?a.documentElement:L},Qt=function(l){return Ke.call(l.ownerDocument||l,l,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT,null,!1)},d3=function(l){return l instanceof C&&(typeof l.nodeName!="string"||typeof l.textContent!="string"||typeof l.removeChild!="function"||!(l.attributes instanceof E)||typeof l.removeAttribute!="function"||typeof l.setAttribute!="function"||typeof l.namespaceURI!="string"||typeof l.insertBefore!="function"||typeof l.hasChildNodes!="function")},a2=function(l){return typeof u=="object"?l instanceof u:l&&typeof l=="object"&&typeof l.nodeType=="number"&&typeof l.nodeName=="string"},K=function(l,a,d){Y[l]&&o6(Y[l],v=>{v.call(t,a,d,x1)})},Nt=function(l){let a;if(K("beforeSanitizeElements",l,null),d3(l))return n1(l),!0;const d=D(l.nodeName);if(K("uponSanitizeElement",l,{tagName:d,allowedTags:H}),l.hasChildNodes()&&!a2(l.firstElementChild)&&(!a2(l.content)||!a2(l.content.firstElementChild))&&U(/<[/\w]/g,l.innerHTML)&&U(/<[/\w]/g,l.textContent))return n1(l),!0;if(!H[d]||N1[d]){if(!N1[d]&&zt(d)&&(I.tagNameCheck instanceof RegExp&&U(I.tagNameCheck,d)||I.tagNameCheck instanceof Function&&I.tagNameCheck(d)))return!1;if(P2&&!v1[d]){const v=R2(l)||l.parentNode,L=_e(l)||l.childNodes;if(L&&v){const z=L.length;for(let x=z-1;x>=0;--x)v.insertBefore(k(L[x],!0),je(l))}}return n1(l),!0}return l instanceof A&&!c3(l)||(d==="noscript"||d==="noembed"||d==="noframes")&&U(/<\/no(script|embed|frames)/i,l.innerHTML)?(n1(l),!0):(g1&&l.nodeType===3&&(a=l.textContent,a=X(a,B2," "),a=X(a,H2," "),a=X(a,M2," "),l.textContent!==a&&(q1(t.removed,{element:l.cloneNode()}),l.textContent=a)),K("afterSanitizeElements",l,null),!1)},Ut=function(l,a,d){if(Bt&&(a==="id"||a==="name")&&(d in o||d in a3))return!1;if(!(L2&&!D2[a]&&U(e3,a))){if(!(yt&&U(i3,a))){if(!M[a]||D2[a]){if(!(zt(l)&&(I.tagNameCheck instanceof RegExp&&U(I.tagNameCheck,l)||I.tagNameCheck instanceof Function&&I.tagNameCheck(l))&&(I.attributeNameCheck instanceof RegExp&&U(I.attributeNameCheck,a)||I.attributeNameCheck instanceof Function&&I.attributeNameCheck(a))||a==="is"&&I.allowCustomizedBuiltInElements&&(I.tagNameCheck instanceof RegExp&&U(I.tagNameCheck,d)||I.tagNameCheck instanceof Function&&I.tagNameCheck(d))))return!1}else if(!O2[a]){if(!U(wt,X(d,vt,""))){if(!((a==="src"||a==="xlink:href"||a==="href")&&l!=="script"&&r6(d,"data:")===0&&Dt[l])){if(!(Rt&&!U(s3,X(d,vt,"")))){if(d)return!1}}}}}}return!0},zt=function(l){return l.indexOf("-")>0},Ft=function(l){let a,d,v,L;K("beforeSanitizeAttributes",l,null);const{attributes:z}=l;if(!z)return;const x={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:M};for(L=z.length;L--;){a=z[L];const{name:Z,namespaceURI:F2}=a;if(d=Z==="value"?a.value:l6(a.value),v=D(Z),x.attrName=v,x.attrValue=d,x.keepAttr=!0,x.forceKeepAttr=void 0,K("uponSanitizeAttribute",l,x),d=x.attrValue,x.forceKeepAttr||(z2(Z,l),!x.keepAttr))continue;if(!bt&&U(/\/>/i,d)){z2(Z,l);continue}g1&&(d=X(d,B2," "),d=X(d,H2," "),d=X(d,M2," "));const qt=D(l.nodeName);if(Ut(qt,v,d)){if(Ht&&(v==="id"||v==="name")&&(z2(Z,l),d=o3+d),S&&typeof w=="object"&&typeof w.getAttributeType=="function"&&!F2)switch(w.getAttributeType(qt,v)){case"TrustedHTML":{d=S.createHTML(d);break}case"TrustedScriptURL":{d=S.createScriptURL(d);break}}try{F2?l.setAttributeNS(F2,Z,d):l.setAttribute(Z,d),he(t.removed)}catch{}}}K("afterSanitizeAttributes",l,null)},h3=function h(l){let a;const d=Qt(l);for(K("beforeSanitizeShadowDOM",l,null);a=d.nextNode();)K("uponSanitizeShadowNode",a,null),!Nt(a)&&(a.content instanceof n&&h(a.content),Ft(a));K("afterSanitizeShadowDOM",l,null)};return t.sanitize=function(h){let l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a,d,v,L;if(S2=!h,S2&&(h="<!-->"),typeof h!="string"&&!a2(h))if(typeof h.toString=="function"){if(h=h.toString(),typeof h!="string")throw k1("dirty is not a string, aborting")}else throw k1("toString is not a function");if(!t.isSupported)return h;if(T2||N2(l),t.removed=[],typeof h=="string"&&(U1=!1),U1){if(h.nodeName){const Z=D(h.nodeName);if(!H[Z]||N1[Z])throw k1("root node is forbidden and cannot be sanitized in-place")}}else if(h instanceof u)a=St("<!---->"),d=a.ownerDocument.importNode(h,!0),d.nodeType===1&&d.nodeName==="BODY"||d.nodeName==="HTML"?a=d:a.appendChild(d);else{if(!m1&&!g1&&!s1&&h.indexOf("<")===-1)return S&&o2?S.createHTML(h):h;if(a=St(h),!a)return m1?null:o2?Q1:""}a&&V2&&n1(a.firstChild);const z=Qt(U1?h:a);for(;v=z.nextNode();)Nt(v)||(v.content instanceof n&&h3(v.content),Ft(v));if(U1)return h;if(m1){if(s2)for(L=Je.call(a.ownerDocument);a.firstChild;)L.appendChild(a.firstChild);else L=a;return(M.shadowroot||M.shadowrootmode)&&(L=t3.call(e,L,!0)),L}let x=s1?a.outerHTML:a.innerHTML;return s1&&H["!doctype"]&&a.ownerDocument&&a.ownerDocument.doctype&&a.ownerDocument.doctype.name&&U(Xe,a.ownerDocument.doctype.name)&&(x="<!DOCTYPE "+a.ownerDocument.doctype.name+`>
`+x),g1&&(x=X(x,B2," "),x=X(x,H2," "),x=X(x,M2," ")),S&&o2?S.createHTML(x):x},t.setConfig=function(h){N2(h),T2=!0},t.clearConfig=function(){x1=null,T2=!1},t.isValidAttribute=function(h,l,a){x1||N2({});const d=D(h),v=D(l);return Ut(d,v,a)},t.addHook=function(h,l){typeof l=="function"&&(Y[h]=Y[h]||[],q1(Y[h],l))},t.removeHook=function(h){if(Y[h])return he(Y[h])},t.removeHooks=function(h){Y[h]&&(Y[h]=[])},t.removeAllHooks=function(){Y={}},t}var v6=We(),Ye=(i=>(i.LitHTML="lit-html",i.AllowDuplicates="'allow-duplicates'",i.LayerXRichText="layer-x-rich-text",i))(Ye||{});const w6=N`
    html,
    body {
        padding: 0px;
        margin: 0px;
        background-color: white;
        color: black;
        height: -webkit-fit-content;
    }

    .layerXRichText {
        font-size: 16px;
        line-height: 21px;
        padding: 0;
        margin: 0;
    }

    p {
        margin: 0;
        padding: 0;
    }

    strong {
        font-weight: 600;
    }

    h1 {
        font-size: 24px;
        line-height: 39px;
        font-weight: 600;
    }

    h2 {
        font-size: 22px;
        line-height: 39px;
        font-weight: 600;
    }

    h3 {
        font-size: 18px;
        line-height: 39px;
        font-weight: 600;
    }

    a {
        color: var(--layer-x-color);
        text-decoration: none;
        font-weight: 500;
        white-space: nowrap;
    }
`;var Ze=(i=>(i.LinkClick="linkClick",i))(Ze||{}),x6=Object.defineProperty,I6=Object.getOwnPropertyDescriptor,y2=(i,t,e,s)=>{for(var o=s>1?void 0:s?I6(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&x6(t,e,o),o};let J1=class extends R{constructor(){super(...arguments),this.text="",this.parser=new DOMParser,this.trustedPolicy=window.trustedTypes?.createPolicy(Ye.LayerXRichText,{createHTML:i=>i}),this.onLinkClick=i=>{B(this,{eventType:Ze.LinkClick,detail:{link:i.getAttribute("href")}})},this.addOnClickListener=i=>i.addEventListener("click",()=>this.onLinkClick(i),!1)}createRenderRoot(){return this}render(){const i=v6.sanitize(this.text,{ADD_ATTR:["target"]}),t=this.trustedPolicy?.createHTML(i),{documentElement:e}=this.parser.parseFromString(t||i,"text/html");return(e?.querySelectorAll("a")).forEach(this.addOnClickListener),e.dataset.testId="rich-text",f`
            <style>
                ${w6}
            </style>
            <div>${e}</div>
        `}};y2([p()],J1.prototype,"text",2);y2([b()],J1.prototype,"parser",2);y2([b()],J1.prototype,"trustedPolicy",2);J1=y2([P("lit-rich-text")],J1);const y6=N`
    .switch {
        position: relative;
        display: inline-block;
        width: 2.5rem;
        height: 1.5rem;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: 0.4s;
        transition: 0.4s;
    }

    .slider:before {
        position: absolute;
        content: '';
        height: 1rem;
        width: 1rem;
        left: 0.25rem;
        bottom: 0.25rem;
        background-color: white;
        -webkit-transition: 0.4s;
        transition: 0.4s;
    }

    input:checked + .slider {
        background-color: var(--layer-x-color);
    }

    input:focus + .slider {
        box-shadow: 0 0 1px var(--layer-x-color);
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(1rem);
        -ms-transform: translateX(1rem);
        transform: translateX(1rem);
    }

    .slider.round {
        border-radius: 34px;
    }

    .slider.round:before {
        border-radius: 50%;
    }
`;var R6=Object.defineProperty,b6=Object.getOwnPropertyDescriptor,i2=(i,t,e,s)=>{for(var o=s>1?void 0:s?b6(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&R6(t,e,o),o};let V1=class extends R{constructor(){super(...arguments),this.id="",this.label="",this.checked=!1,this.disabled=!0}createRenderRoot(){return this}render(){const{id:i,checked:t,label:e,disabled:s}=this;return f`
            <style>
                ${y6}
            </style>
            <label id=${i} class="switch">
                <input id=${i} type="checkbox" .disabled=${s} .checked=${t} />
                <span class="slider round">${e}</span>
            </label>
        `}};i2([p()],V1.prototype,"id",2);i2([p()],V1.prototype,"label",2);i2([p({type:Boolean})],V1.prototype,"checked",2);i2([p({type:Boolean})],V1.prototype,"disabled",2);V1=i2([P("lit-switch")],V1);var B6=Object.defineProperty,H6=Object.getOwnPropertyDescriptor,Ge=(i,t,e,s)=>{for(var o=s>1?void 0:s?H6(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&B6(t,e,o),o};const M6=25,D6=15;let gt=class extends R{constructor(){super(...arguments),this.text=""}render(){let i=M6,t=this.text;return this.text.length>13&&(i=D6,t=this.text.substring(0,20)+"..."),f`
            <style>
                .watermark {
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .watermark::before {
                    content: '';
                    z-index: 2147483647;
                    position: fixed;
                    inset: 0;
                    opacity: 0.085;
                    background: -10px 0/200px 300px
                        url('data:image/svg+xml;utf8,<svg style="transform:rotate(-45deg)" viewBox="0 -35 175 30" xmlns="http://www.w3.org/2000/svg"><text style="font-family:arial;font-weight:600;font-size:${i}px;">${t}</text></svg>');
                }
            </style>
            <div data-test-id="lit-watermark" class="watermark"></div>
        `}};Ge([p()],gt.prototype,"text",2);gt=Ge([P("lit-watermark")],gt);
