import{r as e,a as t,d as n,t as s,c as o,w as a,b as r,e as i,f as u,g as c,p as l,h as m,o as d,i as p,l as h,j as v,k as f,n as _,m as x,F as y,q as w,s as b,u as M,v as g,x as E,y as L}from"./vendor.2817f45f.js";let R;!function(e=".",t="__import__"){try{self[t]=new Function("u","return import(u)")}catch(n){const s=new URL(e,location),o=e=>{URL.revokeObjectURL(e.src),e.remove()};self[t]=e=>new Promise(((n,a)=>{const r=new URL(e,s);if(self[t].moduleMap[r])return n(self[t].moduleMap[r]);const i=new Blob([`import * as m from '${r}';`,`${t}.moduleMap['${r}']=m;`],{type:"text/javascript"}),u=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(i),onerror(){a(new Error(`Failed to import: ${e}`)),o(u)},onload(){n(self[t].moduleMap[r]),o(u)}});document.head.appendChild(u)})),self[t].moduleMap={}}}("assets/");const z={},I=e(""),k=t({x:{min:0,max:0},y:{min:0,max:0}});function O(e){let t=!1;return function(...n){t||(t=!0,window.requestAnimationFrame((()=>{e.apply(this,n),t=!1})))}}const j=10,P=10,[S,$]=[120,88],[B,C]=[S/4,$/4];var D=n({props:{mousePoint:{type:Object,required:!0},canvas:{type:Object,required:!0}},setup(t){const{mousePoint:n,canvas:r}=s(t),i=e(null),u=o((()=>{const e={};if(n.value){const[t,s]=n.value,[o,a]=[j+120,P+120],r=t+o>k.x.max?t-o:t+j,i=s+a>k.y.max?s-a:s+P;e.left=`${r}px`,e.top=`${i}px`}return e}));return a(n,O((e=>{if(!e||!r.value||!i.value)return;const[t,n]=e,s=i.value.getContext("2d");s.clearRect(0,0,S,$),s.drawImage(r.value,t-B/2,n-C/2,B,C,0,0,S,$)}))),document.body.style,{canvasRef:i,DW:S,DH:$,style:u}}});const T=c("data-v-123d3f4b");l("data-v-123d3f4b");const U={class:"capture-info__view"},V=i("svg",{viewBox:"0 0 120 88",xmlns:"http://www.w3.org/2000/svg",fill:"none"},[i("path",{d:"M 0 1 H 119 V87 H1 V1",stroke:"red","stroke-width":"2"}),i("path",{d:"M 0 44 H 119",stroke:"red","stroke-width":"2"}),i("path",{d:"M 60 0 V 88",stroke:"red","stroke-width":"2"})],-1),H={class:"capture-info__p"};m();const q=T(((e,t)=>(d(),r("div",{class:"capture-info__wrap",style:e.style},[i("div",U,[i("canvas",{ref:"canvasRef",width:e.DW,height:e.DH},null,8,["width","height"]),V]),i("div",H,[u(e.$slots,"default")])],4))));D.render=q,D.__scopeId="data-v-123d3f4b";const A=function(e){for(const t of e){const e=t.target.__resizeListeners__||[];e.length&&e.forEach((e=>{e()}))}};let Z=null;function F(e=document.getElementsByTagName("head")[0]){let t=document.createElement("style");return t.media="screen",e.appendChild(t),t}function N(e,t,n=function(){return null!=Z?Z:Z=F()}()){n&&t&&n.sheet.insertRule(e+"{"+t+"}",0)}const W=[{position:["top"],cursor:"ns-resize"},{position:["bottom"],cursor:"ns-resize"},{position:["left"],cursor:"ew-resize"},{position:["right"],cursor:"ew-resize"},{position:["top","left"],cursor:"nwse-resize"},{position:["bottom","right"],cursor:"nwse-resize"},{position:["top","right"],cursor:"nesw-resize"},{position:["bottom","left"],cursor:"nesw-resize"}];var G=n({name:"App",props:{imageSource:{type:HTMLImageElement,required:!0}},components:{InfoBox:D},setup(n){const s=e(null),r=e(null),i=t({x:0,y:0,h:0,w:0}),u=e(null);let c=null;const l=e(null),m=e("0, 0, 0");let d=h.cloneDeep(i),x=[],y=null;const w=o((()=>u.value&&["CREATE","RESIZE"].includes(u.value))),b=o((()=>{const{x:e,y:t,h:n,w:s}=i,[o,a,r,u]=[e,t,n,s].map((e=>`${e}px`));return{left:o,top:a,height:r,width:u}})),M=o((()=>{var e;return null==(e=s.value)?void 0:e.getContext("2d")}));a(l,O((e=>{if(!M.value||!e)return;const{data:t}=M.value.getImageData(e[0],e[1],1,1);m.value=t.slice(0,3).join(", ")})));const g=O((async function(){const{clientHeight:e,clientWidth:t}=document.body;k.x.max=t,k.y.max=e,await _(),M.value.drawImage(n.imageSource,0,0)}));function E(e){const{x:t,y:n}=e;Object.assign(i,{x:t,y:n}),u.value="CREATE",N("*","cursor: crosshair !important;",y=F()),L(e)}function L(e){d=h.cloneDeep(i),e.stopImmediatePropagation();const{x:t,y:n}=e;c=[t,n],l.value=[t,n],document.addEventListener("mousemove",R),document.addEventListener("mouseup",z),document.onselectstart=()=>!1}function R(e){if(!c||!u.value)return;const[t,n]=c,s=Math.min(Math.max(e.x,k.x.min),k.x.max),o=Math.min(Math.max(e.y,k.y.min),k.y.max),[a,r]=[s-t,o-n];switch(l.value=[s,o],u.value){case"CREATE":const[e,u]=[Math.min(t,s),Math.min(n,o)],[c,l]=[Math.abs(a),Math.abs(r)],[m,p]=[Math.min(c,k.x.max-e),Math.min(l,k.y.max-u)];Object.assign(i,{x:e,y:u,w:m,h:p});break;case"MOVE":{const{x:e,y:t}=d,{h:n,w:s}=i;i.x=Math.min(Math.max(e+a,k.x.min),k.x.max-s),i.y=Math.min(Math.max(t+r,k.y.min),k.y.max-n);break}case"RESIZE":{const{h:e,y:t,w:n,x:a}=d;x.includes("top")?(i.y=Math.min(o,t+e),i.h=Math.abs(t-o+e)):x.includes("bottom")&&(i.y=Math.min(o,t),i.h=Math.abs(o-t)),x.includes("left")?(i.x=Math.min(s,a+n),i.w=Math.abs(a-s+n)):x.includes("right")&&(i.x=Math.min(s,a),i.w=Math.abs(s-a))}}}function z(){var e;c=null,document.onselectstart=null,u.value=null,null==(e=null==y?void 0:y.parentNode)||e.removeChild(y),document.removeEventListener("mousemove",R),document.removeEventListener("mouseup",z)}return v((()=>{var e,t;e=document.body,t=g,e&&(e.__resizeListeners__||(e.__resizeListeners__=[],e.__ro__=new p(A),e.__ro__.observe(e)),e.__resizeListeners__.push(t)),function(e,t,n){const s=function(o){n&&n.call(this,o),function(e,t,n){e&&t&&n&&e.removeEventListener(t,n,!1)}(e,t,s)};!function(e,t,n,s=!1){e&&t&&n&&e.addEventListener(t,n,s)}(e,t,s)}(r.value,"mousedown",E)})),f((()=>{var e,t;e=document.body,t=g,e&&e.__resizeListeners__&&(e.__resizeListeners__.splice(e.__resizeListeners__.indexOf(t),1),e.__resizeListeners__.length||e.__ro__.disconnect())})),{startCapture:E,startMove:function(e){u.value="MOVE",N("*","cursor: move !important;",y=F()),L(e)},startResize:function(e,{position:t,cursor:n}){u.value="RESIZE",x=t,N("*",`cursor: ${n} !important;`,y=F()),L(e)},captureLayerStyle:b,mousePoint:l,RESIZE_POINTS:W,RGB:m,captureLayer:i,infoBoxVisible:w,bound:k,canvasRef:s,wrapRef:r}}});const J={class:"wrapper",ref:"wrapRef"};G.render=function(e,t){const n=x("InfoBox");return d(),r("div",J,[i("canvas",{ref:"canvasRef",width:e.bound.x.max,height:e.bound.y.max},null,8,["width","height"]),i("div",{class:"capture-layer",style:e.captureLayerStyle,onMousedown:t[1]||(t[1]=(...t)=>e.startMove&&e.startMove(...t))},[(d(!0),r(y,null,w(e.RESIZE_POINTS,(t=>(d(),r("i",{onMousedown:g((n=>e.startResize(n,t)),["prevent"]),key:t.position.join(),style:t.position.reduce(((e,t)=>Object.assign(e,{[t]:"-3px"})),{cursor:t.cursor}),class:"resize-point"},null,44,["onMousedown"])))),128))],36),e.infoBoxVisible?(d(),r(n,{key:0,mousePoint:e.mousePoint,canvas:e.canvasRef},{default:b((()=>[i("p",null,E(e.captureLayer.w)+" x "+E(e.captureLayer.h),1),i("p",null,"RGB("+E(e.RGB)+")",1)])),_:1},8,["mousePoint","canvas"])):M("",!0)],512)},function(e,t){if(!t)return e();if(void 0===R){const e=document.createElement("link").relList;R=e&&e.supports&&e.supports("modulepreload")?"modulepreload":"preload"}return Promise.all(t.map((e=>{if(e in z)return;z[e]=!0;const t=e.endsWith(".css"),n=t?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${e}"]${n}`))return;const s=document.createElement("link");return s.rel=t?"stylesheet":R,t||(s.as="script",s.crossOrigin=""),s.href=e,document.head.appendChild(s),t?new Promise(((e,t)=>{s.addEventListener("load",e),s.addEventListener("error",t)})):void 0}))).then((()=>e()))}((()=>__import__("./bigbadfox1080p.mkv_20201108_104416.220.8e277ed3.js")),void 0).then((e=>fetch(e.default))).then((e=>e.blob())).then((e=>{const t=new Image;I.value=t.src=URL.createObjectURL(e),t.onload=()=>L(G,{imageSource:t}).mount("#app")}));
