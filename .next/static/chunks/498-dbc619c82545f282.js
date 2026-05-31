(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[498],{227:function(e){var t;t=()=>(()=>{"use strict";var e,t,r,n,o={d:(e,t)=>{for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},i={};o.r(i),o.d(i,{default:()=>y,getNetwork:()=>_,getNetworkDetails:()=>u,getPublicKey:()=>E,getUserInfo:()=>C,isAllowed:()=>A,isBrowser:()=>d,isConnected:()=>l,requestAccess:()=>N,setAllowed:()=>S,signAuthEntry:()=>a,signBlob:()=>T,signTransaction:()=>s}),(e=r||(r={})).CREATE_ACCOUNT="CREATE_ACCOUNT",e.FUND_ACCOUNT="FUND_ACCOUNT",e.ADD_ACCOUNT="ADD_ACCOUNT",e.IMPORT_ACCOUNT="IMPORT_ACCOUNT",e.IMPORT_HARDWARE_WALLET="IMPORT_HARDWARE_WALLET",e.LOAD_ACCOUNT="LOAD_ACCOUNT",e.MAKE_ACCOUNT_ACTIVE="MAKE_ACCOUNT_ACTIVE",e.UPDATE_ACCOUNT_NAME="UPDATE_ACCOUNT_NAME",e.GET_MNEMONIC_PHRASE="GET_MNEMONIC_PHRASE",e.CONFIRM_MNEMONIC_PHRASE="CONFIRM_MNEMONIC_PHRASE",e.CONFIRM_MIGRATED_MNEMONIC_PHRASE="CONFIRM_MIGRATED_MNEMONIC_PHRASE",e.RECOVER_ACCOUNT="RECOVER_ACCOUNT",e.CONFIRM_PASSWORD="CONFIRM_PASSWORD",e.REJECT_ACCESS="REJECT_ACCESS",e.GRANT_ACCESS="GRANT_ACCESS",e.SIGN_TRANSACTION="SIGN_TRANSACTION",e.SIGN_BLOB="SIGN_BLOB",e.SIGN_AUTH_ENTRY="SIGN_AUTH_ENTRY",e.HANDLE_SIGNED_HW_TRANSACTION="HANDLE_SIGNED_HW_TRANSACTION",e.REJECT_TRANSACTION="REJECT_TRANSACTION",e.SIGN_FREIGHTER_TRANSACTION="SIGN_FREIGHTER_TRANSACTION",e.SIGN_FREIGHTER_SOROBAN_TRANSACTION="SIGN_FREIGHTER_SOROBAN_TRANSACTION",e.ADD_RECENT_ADDRESS="ADD_RECENT_ADDRESS",e.LOAD_RECENT_ADDRESSES="LOAD_RECENT_ADDRESSES",e.SIGN_OUT="SIGN_OUT",e.SHOW_BACKUP_PHRASE="SHOW_BACKUP_PHRASE",e.SAVE_ALLOWLIST="SAVE_ALLOWLIST",e.SAVE_SETTINGS="SAVE_SETTINGS",e.LOAD_SETTINGS="LOAD_SETTINGS",e.GET_CACHED_ASSET_ICON="GET_CACHED_ASSET_ICON",e.CACHE_ASSET_ICON="CACHE_ASSET_ICON",e.GET_CACHED_ASSET_DOMAIN="GET_CACHED_ASSET_DOMAIN",e.CACHE_ASSET_DOMAIN="CACHE_ASSET_DOMAIN",e.GET_BLOCKED_ACCOUNTS="GET_BLOCKED_ACCOUNTS",e.GET_BLOCKED_DOMAINS="GET_BLOCKED_DOMAINS",e.ADD_CUSTOM_NETWORK="ADD_CUSTOM_NETWORK",e.CHANGE_NETWORK="CHANGE_NETWORK",e.REMOVE_CUSTOM_NETWORK="REMOVE_CUSTOM_NETWORK",e.EDIT_CUSTOM_NETWORK="EDIT_CUSTOM_NETWORK",e.RESET_EXP_DATA="RESET_EXP_DATA",e.ADD_TOKEN_ID="ADD_TOKEN_ID",e.GET_TOKEN_IDS="GET_TOKEN_IDS",e.REMOVE_TOKEN_ID="REMOVE_TOKEN_ID",e.GET_MIGRATABLE_ACCOUNTS="GET_MIGRATABLE_ACCOUNTS",e.GET_MIGRATED_MNEMONIC_PHRASE="GET_MIGRATED_MNEMONIC_PHRASE",e.MIGRATE_ACCOUNTS="MIGRATE_ACCOUNTS",(t=n||(n={})).REQUEST_ACCESS="REQUEST_ACCESS",t.REQUEST_PUBLIC_KEY="REQUEST_PUBLIC_KEY",t.SUBMIT_TRANSACTION="SUBMIT_TRANSACTION",t.SUBMIT_BLOB="SUBMIT_BLOB",t.SUBMIT_AUTH_ENTRY="SUBMIT_AUTH_ENTRY",t.REQUEST_NETWORK="REQUEST_NETWORK",t.REQUEST_NETWORK_DETAILS="REQUEST_NETWORK_DETAILS",t.REQUEST_CONNECTION_STATUS="REQUEST_CONNECTION_STATUS",t.REQUEST_ALLOWED_STATUS="REQUEST_ALLOWED_STATUS",t.SET_ALLOWED_STATUS="SET_ALLOWED_STATUS",t.REQUEST_USER_INFO="REQUEST_USER_INFO";let c=e=>{let t=Date.now()+Math.random();return window.postMessage({source:"FREIGHTER_EXTERNAL_MSG_REQUEST",messageId:t,...e},window.location.origin),new Promise(r=>{let o=0;e.type!==n.REQUEST_CONNECTION_STATUS&&e.type!==n.REQUEST_PUBLIC_KEY||(o=setTimeout(()=>{r({isConnected:!1,publicKey:""}),window.removeEventListener("message",i)},2e3));let i=e=>{var n,c;e.source===window&&"FREIGHTER_EXTERNAL_MSG_RESPONSE"===(null===(n=null==e?void 0:e.data)||void 0===n?void 0:n.source)&&(null===(c=null==e?void 0:e.data)||void 0===c?void 0:c.messagedId)===t&&(r(e.data),window.removeEventListener("message",i),clearTimeout(o))};window.addEventListener("message",i,!1)})},E=()=>d?(async()=>{let e={publicKey:"",error:""};try{e=await c({type:n.REQUEST_PUBLIC_KEY})}catch(e){console.error(e)}let{publicKey:t,error:r}=e;if(r)throw r;return t})():Promise.resolve(""),s=(e,t)=>d?(async(e,t,r)=>{let o="",i="",E="";"object"==typeof t?(o=t.network||"",i=t.accountToSign||"",E=t.networkPassphrase||""):(o=t||"",i="");let s={signedTransaction:"",error:""};try{s=await c({transactionXdr:e,network:o,networkPassphrase:E,accountToSign:i,type:n.SUBMIT_TRANSACTION})}catch(e){throw console.error(e),e}let{signedTransaction:T,error:a}=s;if(a)throw a;return T})(e,t):Promise.resolve(""),T=(e,t)=>d?(async(e,t)=>{let r={signedBlob:"",error:""},o=(t||{}).accountToSign||"";try{r=await c({blob:e,accountToSign:o,type:n.SUBMIT_BLOB})}catch(e){throw console.error(e),e}let{signedBlob:i,error:E}=r;if(E)throw E;return i})(e,t):Promise.resolve(""),a=(e,t)=>d?(async(e,t)=>{let r={signedAuthEntry:"",error:""},o=(t||{}).accountToSign||"";try{r=await c({entryXdr:e,accountToSign:o,type:n.SUBMIT_AUTH_ENTRY})}catch(e){console.error(e)}let{signedAuthEntry:i,error:E}=r;if(E)throw E;return i})(e,t):Promise.resolve(""),l=()=>d?window.freighter?Promise.resolve(window.freighter):(async()=>{let e={isConnected:!1};try{e=await c({type:n.REQUEST_CONNECTION_STATUS})}catch(e){console.error(e)}return e.isConnected})():Promise.resolve(!1),_=()=>d?(async()=>{let e={network:"",error:""};try{e=await c({type:n.REQUEST_NETWORK})}catch(e){console.error(e)}let{network:t,error:r}=e;if(r)throw r;return t})():Promise.resolve(""),u=()=>d?(async()=>{let e={networkDetails:{network:"",networkName:"",networkUrl:"",networkPassphrase:"",sorobanRpcUrl:void 0},error:""};try{e=await c({type:n.REQUEST_NETWORK_DETAILS})}catch(e){console.error(e)}let{networkDetails:t,error:r}=e,{network:o,networkUrl:i,networkPassphrase:E,sorobanRpcUrl:s}=t;if(r)throw r;return{network:o,networkUrl:i,networkPassphrase:E,sorobanRpcUrl:s}})():Promise.resolve({network:"",networkUrl:"",networkPassphrase:"",sorobanRpcUrl:""}),A=()=>d?(async()=>{let e={isAllowed:!1};try{e=await c({type:n.REQUEST_ALLOWED_STATUS})}catch(e){console.error(e)}return e.isAllowed})():Promise.resolve(!1),S=()=>d?(async()=>{let e={isAllowed:!1,error:""};try{e=await c({type:n.SET_ALLOWED_STATUS})}catch(e){console.error(e)}let{isAllowed:t,error:r}=e;if(r)throw r;return t})():Promise.resolve(!1),C=()=>d?(async()=>{let e={userInfo:{publicKey:""},error:""};try{e=await c({type:n.REQUEST_USER_INFO})}catch(e){console.error(e)}let{userInfo:t,error:r}=e;if(r)throw r;return t})():Promise.resolve({publicKey:""}),N=()=>d?(async()=>{let e={publicKey:"",error:""};try{e=await c({type:n.REQUEST_ACCESS})}catch(e){console.error(e)}let{publicKey:t,error:r}=e;if(r)throw r;return t})():Promise.resolve(""),d="undefined"!=typeof window,y={getPublicKey:E,signTransaction:s,signBlob:T,signAuthEntry:a,isConnected:l,getNetwork:_,getNetworkDetails:u,isAllowed:A,setAllowed:S,getUserInfo:C,requestAccess:N};return i})(),e.exports=t()},8030:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});var n=r(2265);/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),i=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return t.filter((e,t,r)=>!!e&&r.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var c={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let E=(0,n.forwardRef)((e,t)=>{let{color:r="currentColor",size:o=24,strokeWidth:E=2,absoluteStrokeWidth:s,className:T="",children:a,iconNode:l,..._}=e;return(0,n.createElement)("svg",{ref:t,...c,width:o,height:o,stroke:r,strokeWidth:s?24*Number(E)/Number(o):E,className:i("lucide",T),..._},[...l.map(e=>{let[t,r]=e;return(0,n.createElement)(t,r)}),...Array.isArray(a)?a:[a]])}),s=(e,t)=>{let r=(0,n.forwardRef)((r,c)=>{let{className:s,...T}=r;return(0,n.createElement)(E,{ref:c,iconNode:t,className:i("lucide-".concat(o(e)),s),...T})});return r.displayName="".concat(e),r}},2468:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},6780:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},3231:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},6273:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("CirclePlus",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]])},933:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},6164:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Coins",[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]])},690:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]])},5931:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},3274:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},9896:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]])},8094:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]])},6706:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]])},994:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]])},4341:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]])},6141:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},2022:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},5737:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]])},4697:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.379.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},357:function(e,t,r){"use strict";var n,o;e.exports=(null==(n=r.g.process)?void 0:n.env)&&"object"==typeof(null==(o=r.g.process)?void 0:o.env)?r.g.process:r(8081)},8081:function(e){!function(){var t={229:function(e){var t,r,n,o=e.exports={};function i(){throw Error("setTimeout has not been defined")}function c(){throw Error("clearTimeout has not been defined")}function E(e){if(t===setTimeout)return setTimeout(e,0);if((t===i||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(r){try{return t.call(null,e,0)}catch(r){return t.call(this,e,0)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:i}catch(e){t=i}try{r="function"==typeof clearTimeout?clearTimeout:c}catch(e){r=c}}();var s=[],T=!1,a=-1;function l(){T&&n&&(T=!1,n.length?s=n.concat(s):a=-1,s.length&&_())}function _(){if(!T){var e=E(l);T=!0;for(var t=s.length;t;){for(n=s,s=[];++a<t;)n&&n[a].run();a=-1,t=s.length}n=null,T=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===c||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function u(e,t){this.fun=e,this.array=t}function A(){}o.nextTick=function(e){var t=Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];s.push(new u(e,t)),1!==s.length||T||E(_)},u.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=A,o.addListener=A,o.once=A,o.off=A,o.removeListener=A,o.removeAllListeners=A,o.emit=A,o.prependListener=A,o.prependOnceListener=A,o.listeners=function(e){return[]},o.binding=function(e){throw Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw Error("process.chdir is not supported")},o.umask=function(){return 0}}},r={};function n(e){var o=r[e];if(void 0!==o)return o.exports;var i=r[e]={exports:{}},c=!0;try{t[e](i,i.exports,n),c=!1}finally{c&&delete r[e]}return i.exports}n.ab="//";var o=n(229);e.exports=o}()}}]);