const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/EffectComposer-CLocaWOp.js","assets/three.module-CDJkRhUe.js","assets/CopyShader-CHGAmNbz.js","assets/Pass-RUNplyFz.js","assets/RenderPass-6DaOuvm8.js","assets/UnrealBloomPass-CsLyIxkz.js","assets/OutputPass-Cj8gX04X.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,r as n}from"./index-Wam82g8y.js";import{a as r,createRenderer as i,disposeScene as a,i as o,l as s,loadThree as c,n as l,o as u,prefersReducedMotion as d,releaseRenderer as f,s as p,t as ee}from"./runtime-CH9vMIgq.js";var m=Math.PI,h=m*2,te=34,ne=.4,re=-.15,ie=160,ae=3,oe=2.4,se=1.6,g={particles:7e3,stars:2200,dpr:2,size:1,octaves:5},_={particles:2600,stars:800,dpr:1.5,size:1.3,octaves:3},v=(e,t,n)=>e+(t-e)*n,y=(e,t,n)=>Math.max(t,Math.min(n,e)),ce=e=>(e%24+24)%24,b=Math.random,x=()=>{let e=0;for(;!e;)e=b();return Math.sqrt(-2*Math.log(e))*Math.cos(h*b())},le=(e,t)=>{let n=(t-e)%h;return n>m&&(n-=h),n<-m&&(n+=h),n},S=e=>e.map(e=>`${e.id}:${e.hour.toFixed(3)}:${+!!e.sub}`).join(`|`),C=()=>Promise.all([n(()=>import(`./EffectComposer-CLocaWOp.js`),__vite__mapDeps([0,1,2,3])),n(()=>import(`./RenderPass-6DaOuvm8.js`),__vite__mapDeps([4,1,3])),n(()=>import(`./UnrealBloomPass-CsLyIxkz.js`),__vite__mapDeps([5,1,2,3])),n(()=>import(`./OutputPass-Cj8gX04X.js`),__vite__mapDeps([6,1,3]))]);function w(){let e=/Mobi/i.test(navigator.userAgent),t=navigator.hardwareConcurrency||4,n=typeof window.matchMedia==`function`&&window.matchMedia(`(pointer: coarse)`).matches;return!e&&(!n||t>=8)?g:_}var T=e=>{let t=1-e;return{x:t*t*53+2*t*e*53+e*e*69,y:t*t*64+2*t*e*79+e*e*79,dx:32*e,dy:30*t}},E=(()=>{let e=0,t=T(0);for(let n=1;n<=48;n++){let r=T(n/48);e+=Math.hypot(r.x-t.x,r.y-t.y),t=r}return[h*17,50,e,23]})(),D=E.reduce((e,t)=>e+t,0);function ue(){let e=b()*D,t=(b()+b()-1)*5.5;if(e<E[0]){let n=e/17;return[36+Math.cos(n)*(17+t),60+Math.sin(n)*(17+t),!1]}if(e-=E[0],e<E[1])return[53+t,14+e,!1];if(e-=E[1],e<E[2]){let n=T(e/E[2]),r=Math.hypot(n.dx,n.dy)||1;return[n.x-n.dy/r*t,n.y+n.dx/r*t,!1]}return e-=E[2],[53+e,33+t,!0]}var O=`
#include <colorspace_fragment>
`,de=`uniform float uOpacity;
uniform float uCore;
varying vec3 vC;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float a = 1.0 - d;
  a *= a;
  float core = 1.0 - smoothstep(0.0, 0.35, d);
  gl_FragColor = vec4(vC * (1.0 + core * uCore), clamp(a * vA * uOpacity, 0.0, 1.0));${O}}`,fe=`uniform float uTime;
uniform float uIntro;
uniform float uScale;
uniform float uPx;
uniform float uSize;
uniform float uFocus;
uniform float uMark;
uniform float uSurge;
uniform float uFlare;
uniform vec3 uSurgeAt;
uniform vec3 uSun;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform vec4 uWaves[${ae}];
attribute vec3 aMark;
attribute vec4 aRing;
attribute vec4 aSeed;
varying vec3 vC;
varying float vA;
vec2 rot(vec2 p, float a) { float c = cos(a); float s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
void main() {
  float ta = clamp((uIntro - aSeed.y * 0.3) / 0.95, 0.0, 1.0);
  float a = ta * ta * (3.0 - 2.0 * ta);
  vec3 m = aMark * uMark + vec3(sin(uTime * 2.3 + aSeed.z * 40.0), cos(uTime * 1.9 + aSeed.y * 40.0), 0.0) * 0.004;
  vec3 p = mix(position, m, a);
  p.xy = rot(p.xy, (1.0 - a) * (1.0 - a) * (3.0 + aSeed.z * 2.5));
  float tb = clamp((uIntro - 1.35 - aSeed.z * 0.35) / 0.85, 0.0, 1.0);
  float b = tb * tb * (3.0 - 2.0 * tb);
  float ang = aRing.x + uTime * aRing.w;
  vec3 r = vec3(cos(ang) * aRing.y, aRing.z, -sin(ang) * aRing.y);
  vec3 q = mix(p, r, b);
  float arc = sin(3.14159265 * b);
  q += (normalize(m + vec3(0.0001, 0.0002, 0.0)) * 0.35 + vec3(0.0, (aSeed.w - 0.5) * 0.3, 0.25)) * arc;
  float glow = 0.0;
  for (int i = 0; i < ${ae}; i++) {
    float age = uTime - uWaves[i].w;
    if (age > 0.0 && age < ${oe.toFixed(1)}) {
      vec3 dir = q - uWaves[i].xyz;
      float dist = length(dir);
      float k = exp(-pow((dist - age * ${se.toFixed(1)}) * 4.5, 2.0)) * (1.0 - age / ${oe.toFixed(1)});
      q += dir / max(dist, 0.001) * k * 0.11;
      q.y += k * 0.04;
      glow += k;
    }
  }
  float join = step(0.3, aSeed.y);
  vec3 dest = uSurgeAt + (vec3(aSeed.z, aSeed.w, aSeed.y) - 0.5) * 0.45;
  q = mix(q, dest, uSurge * join * (0.55 + 0.45 * aSeed.w));
  float heat = exp(-pow(length(r - uSun) * 3.2, 2.0)) * b;
  vec3 col = mix(uColA, uColB, aSeed.w);
  col = mix(col, uColC, min(1.0, heat * 0.6 + glow * 0.3));
  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  float depth = max(0.05, -mv.z);
  float coc = abs(depth - uFocus) / uFocus;
  float hold = a * (1.0 - b);
  float boost = 1.0 + glow * 1.8 + uFlare * 0.9 + heat * 1.2 + uSurge * 0.6 + hold * 0.5;
  gl_PointSize = clamp(aSeed.x * uSize * uPx * uScale / depth * (1.0 + coc * 2.2) * (0.7 + 0.3 * boost), 1.0, 72.0);
  float born = smoothstep(0.0, 0.6, uIntro - aSeed.y * 0.25);
  vA = (0.35 + 0.65 * aSeed.z) * born * boost / (1.0 + coc * coc * 9.0);
  vC = col;
  gl_Position = projectionMatrix * mv;
}`,pe=`uniform float uTime;
uniform float uPx;
uniform float uIntro;
uniform float uLight;
uniform vec3 uTint;
attribute vec3 aSeed;
attribute vec3 aColor;
varying vec3 vC;
varying float vA;
void main() {
  float tw = 0.55 + 0.45 * sin(uTime * aSeed.z + aSeed.y);
  vA = tw * smoothstep(0.0, 1.4, uIntro - fract(aSeed.y) * 0.5);
  vC = mix(aColor, uTint, uLight);
  gl_PointSize = aSeed.x * uPx * (0.85 + 0.3 * tw);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,k=`uniform float uTheta;
uniform float uLen;
uniform float uTime;
uniform float uScale;
uniform float uPx;
uniform float uShow;
uniform vec3 uColA;
uniform vec3 uColB;
varying vec3 vC;
varying float vA;
void main() {
  float k = position.x;
  float th = uTheta + k * uLen;
  float wob = sin(k * 60.0 - uTime * 3.0) * 0.006 * k;
  vec3 p = vec3(cos(th) * (1.0 + wob), wob * 0.5, -sin(th) * (1.0 + wob));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = max(0.05, -mv.z);
  float f = 1.0 - k;
  gl_PointSize = clamp(mix(0.012, 0.075, f * f) * uPx * uScale / depth, 1.0, 72.0);
  vA = pow(f, 1.6) * uShow * 0.9;
  vC = mix(uColA, uColB, k);
  gl_Position = projectionMatrix * mv;
}`,me=`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,he=`uniform vec3 uTop;
uniform vec3 uBot;
uniform vec3 uGlow;
uniform vec3 uGround;
uniform vec2 uSun;
uniform vec2 uCenter;
uniform float uAspect;
uniform float uTime;
uniform float uRays;
uniform float uNeb;
uniform float uVig;
uniform float uDither;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCT; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = vUv;
  vec3 c = mix(uBot, uTop, smoothstep(0.05, 0.95, uv.y));
  vec2 p = (uv - uCenter) * vec2(uAspect, 1.0);
  float n = fbm(p * 2.2 + vec2(uTime * 0.012, -uTime * 0.008));
  float n2 = fbm(p * 4.5 - n * 1.5 + uTime * 0.01);
  float neb = smoothstep(0.35, 0.95, n * 0.7 + n2 * 0.5) * exp(-dot(p, p) * 1.4);
  c += mix(uGlow, uTop * 2.0 + uGlow * 0.3, n2) * neb * uNeb;
  vec2 d = (uv - uSun) * vec2(uAspect, 1.0);
  float r = length(d);
  float ang = atan(d.y, d.x);
  float rays = 0.5 + 0.5 * sin(ang * 9.0 + sin(ang * 4.0 + uTime * 0.15) * 1.6);
  rays *= 0.5 + 0.5 * sin(ang * 23.0 - uTime * 0.07 + n * 3.0);
  rays = rays * rays * rays;
  c += uGlow * (rays * exp(-r * 2.4) * 0.55 + exp(-r * r * 22.0) * 0.6 + exp(-r * 4.0) * 0.18) * uRays;
  c = mix(uGround, c, smoothstep(0.0, 0.38, uv.y));
  float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(uAspect * 0.8, 1.0)));
  c *= mix(1.0, vig, uVig);
  gl_FragColor = vec4(c, 1.0);${O}  gl_FragColor.rgb += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * uDither;
}`,ge=`varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,_e=`uniform vec3 uBase;
uniform vec3 uRim;
uniform vec3 uLit;
uniform vec3 uSunDir;
uniform float uTime;
uniform float uFlare;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  vec3 n = normalize(vN);
  float f = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.2);
  float l = max(dot(n, uSunDir), 0.0);
  float band = 0.5 + 0.5 * sin(vP.y * 38.0 + sin(vP.x * 14.0 + uTime * 0.2) * 1.4);
  vec3 c = uBase * (0.25 + 0.75 * l) * (0.85 + 0.3 * band) + uLit * pow(l, 6.0) * 0.5 + uRim * f * (1.2 + uFlare);
  gl_FragColor = vec4(c, 1.0);${O}}`,ve=`uniform vec3 uDay;
uniform vec3 uMoon;
uniform vec3 uPhase;
uniform float uNight;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 n = normalize(vN);
  float f = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.0);
  float lit = smoothstep(-0.08, 0.12, dot(n, uPhase));
  vec3 moon = uMoon * (0.07 + 0.93 * lit) + uMoon * f * 0.25;
  vec3 sun = uDay * (1.2 + f * 0.6);
  gl_FragColor = vec4(mix(sun, moon, uNight), 1.0);${O}}`,ye=`varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,be=`uniform float uFront;
uniform float uFade;
uniform vec3 uColor;
varying vec2 vP;
void main() {
  float d = length(vP);
  float k = exp(-pow((d - uFront) * 10.0, 2.0)) + exp(-pow((d - uFront * 0.8) * 16.0, 2.0)) * 0.35;
  float a = k * uFade;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));${O}}`;function xe(e){let t=document.createElement(`canvas`);t.width=t.height=256;let n=t.getContext(`2d`);if(n){n.translate(128,128);let e=n.createRadialGradient(0,0,8,0,0,128);e.addColorStop(0,`rgba(255,255,255,0.6)`),e.addColorStop(1,`rgba(255,255,255,0)`),n.fillStyle=e;for(let e=0;e<12;e++){n.rotate(h/12);let t=e%2?128:92;n.beginPath(),n.moveTo(-2,0),n.lineTo(-6,t),n.lineTo(6,t),n.lineTo(2,0),n.closePath(),n.fill()}}return new e.CanvasTexture(t)}function Se(e){let t=document.createElement(`canvas`);t.width=t.height=128;let n=t.getContext(`2d`);return n&&(n.strokeStyle=`#fff`,n.lineWidth=4,n.shadowColor=`#fff`,n.shadowBlur=10,n.beginPath(),n.arc(64,64,52,0,h),n.stroke()),new e.CanvasTexture(t)}async function A(n){let T=await c(),{host:E,pointerTarget:D}=n,O=i(T,E),A=d(),j=w(),M=new T.Scene,Ce=[],N=null,we=()=>{if(N){for(let e of N.passes)e.dispose();N.composer.dispose(),N=null}};try{let i=j===g?2:1,o=j.dpr;O.setPixelRatio(Math.min(window.devicePixelRatio||1,o));let c=new T.PerspectiveCamera(te,1,.05,400),d=u(T,[[0,1],[.18,.55],[.5,.12],[1,0]]),w=xe(T),Te=Se(T),Ee=new T.SphereGeometry(1,32,20);Ce.push(d,w,Te,Ee);let P=(e,t)=>e.copy(s(T,t)),De=[],Oe=e=>(De.push(e),e),F={uTop:{value:new T.Color},uBot:{value:new T.Color},uGlow:{value:new T.Color},uGround:{value:new T.Color},uSun:{value:new T.Vector2(.5,.7)},uCenter:{value:new T.Vector2(.5,.6)},uAspect:{value:1},uTime:{value:0},uRays:{value:0},uNeb:{value:.5},uVig:{value:.5},uDither:{value:1/255}},ke=new T.ShaderMaterial({uniforms:F,vertexShader:me,fragmentShader:he,defines:{OCT:j.octaves},depthTest:!1,depthWrite:!1}),Ae=new T.Mesh(new T.PlaneGeometry(2,2),ke);Ae.frustumCulled=!1,Ae.renderOrder=-10,M.add(Ae);let je=(e,t)=>Oe(new T.ShaderMaterial({uniforms:{uOpacity:{value:1},uCore:{value:.9},...e},vertexShader:t,fragmentShader:de,transparent:!0,depthWrite:!1,blending:T.AdditiveBlending})),Me=j.stars,Ne=new Float32Array(Me*3),Pe=new Float32Array(Me*3),Fe=new Float32Array(Me*3),Ie=[[245,242,234],[245,242,234],[170,190,255],[255,214,150]];for(let e=0;e<Me;e++){let t=b()<.5?0:b()<.6?1:2,n=[14,30,70][t]*(.85+b()*.3),r=Math.acos(1-b()*(1-Math.cos(1.05))),i=b()*h,a=Math.sin(r)*Math.cos(i),o=Math.sin(r)*Math.sin(i),c=-Math.cos(r),l=o*Math.cos(-.4)-c*Math.sin(-.4),u=o*Math.sin(-.4)+c*Math.cos(-.4);Ne.set([a*n,l*n,u*n],e*3);let d=[[.9,.9],[1.1,1.3],[1.4,2]][t],f=b()<.04?1.8:1;Pe.set([(d[0]+b()**2.5*d[1])*f,b()*h,.5+b()*2.4],e*3);let p=s(T,Ie[Math.floor(b()*Ie.length)]);Fe.set([p.r,p.g,p.b],e*3)}let Le=new T.BufferGeometry;Le.setAttribute(`position`,new T.BufferAttribute(Ne,3)),Le.setAttribute(`aSeed`,new T.BufferAttribute(Pe,3)),Le.setAttribute(`aColor`,new T.BufferAttribute(Fe,3));let Re={uTime:{value:0},uPx:{value:1},uIntro:{value:0},uLight:{value:0},uTint:{value:new T.Color}},ze=je(Re,pe),Be=new T.Points(Le,ze);Be.frustumCulled=!1,Be.renderOrder=0,M.add(Be);let I=new T.Group;I.rotation.set(0,0,re),M.add(I);let L={uBase:{value:new T.Color},uRim:{value:new T.Color},uLit:{value:new T.Color},uSunDir:{value:new T.Vector3(1,.4,.3).normalize()},uTime:{value:0},uFlare:{value:0}},Ve=new T.Mesh(new T.SphereGeometry(.2,48,32),new T.ShaderMaterial({uniforms:L,vertexShader:ge,fragmentShader:_e}));Ve.renderOrder=1;let He=Oe(new T.SpriteMaterial({map:d,transparent:!0,depthWrite:!1,blending:T.AdditiveBlending,opacity:.5})),Ue=new T.Sprite(He);Ue.renderOrder=2,I.add(Ve,Ue);let We=[];for(let e=0;e<256;e++)We.push(new T.Vector3(Math.cos(e/256*h),0,-Math.sin(e/256*h)));let Ge=Oe(new T.LineBasicMaterial({transparent:!0,depthWrite:!1,opacity:.25,blending:T.AdditiveBlending})),Ke=new T.LineLoop(new T.BufferGeometry().setFromPoints(We),Ge);Ke.renderOrder=2,I.add(Ke);let R=j.particles,qe=new Float32Array(R*3),Je=new Float32Array(R*3),Ye=new Float32Array(R*4),Xe=new Float32Array(R*4),Ze=Math.cos(ne),Qe=Math.sin(ne),$e=Math.cos(.15),et=Math.sin(.15);for(let e=0;e<R;e++){if(b()<.12){let t=b()*h,n=.6+b()*2.2;qe.set([Math.cos(t)*n,Math.sin(t)*n*.7,1.4+b()*1.6],e*3)}else{let t=b()*h,n=2+b()**.7*6;qe.set([Math.cos(t)*n,Math.sin(t)*n*.8,-3-b()*13],e*3)}let[t,n,r]=ue(),i=(t-47.5)/65,a=-(n-46.5)/65,o=x()*.012,s=i,c=a*Ze+o*Qe,l=-a*Qe+o*Ze;Je.set([s*$e-c*et,s*et+c*$e,l],e*3);let u=b(),d,f,p;u<.76?(d=1+x()*.04,f=x()*.012,p=.007+b()**3*.016):u<.92?(d=1+x()*.15,f=x()*.035,p=.009+b()**3*.018):(d=.35+b()*1.9,f=x()*.14,p=.01+b()**2*.02),b()<.025&&(p*=2.4),d=Math.max(.28,d),Ye.set([b()*h,d,f,-(.045/Math.max(.35,d)**1.5)*(.75+b()*.5)],e*4),Xe.set([p,b(),b(),r?1:b()*.75],e*4)}let z=new T.BufferGeometry;z.setAttribute(`position`,new T.BufferAttribute(qe,3)),z.setAttribute(`aMark`,new T.BufferAttribute(Je,3)),z.setAttribute(`aRing`,new T.BufferAttribute(Ye,4)),z.setAttribute(`aSeed`,new T.BufferAttribute(Xe,4));let B=Array.from({length:ae},()=>new T.Vector4(0,0,0,-99)),V={uTime:{value:0},uIntro:{value:A?99:0},uScale:{value:400},uPx:{value:1},uSize:{value:j.size},uFocus:{value:5},uMark:{value:1},uSurge:{value:0},uFlare:{value:0},uSurgeAt:{value:new T.Vector3},uSun:{value:new T.Vector3},uColA:{value:new T.Color},uColB:{value:new T.Color},uColC:{value:new T.Color},uWaves:{value:B}},tt=je(V,fe),nt=new T.Points(z,tt);nt.frustumCulled=!1,nt.renderOrder=3,I.add(nt);let rt=new Float32Array(480);for(let e=0;e<ie;e++)rt[e*3]=e/159;let it=new T.BufferGeometry;it.setAttribute(`position`,new T.BufferAttribute(rt,3));let H={uTheta:{value:m},uLen:{value:.9},uTime:{value:0},uScale:{value:400},uPx:{value:1},uShow:{value:0},uColA:{value:new T.Color},uColB:{value:new T.Color}},at=new T.Points(it,je(H,k));at.frustumCulled=!1,at.renderOrder=6,I.add(at);let ot=(e,t)=>{let n=new T.Sprite(e);return n.renderOrder=t,n},st=(e,t)=>Oe(new T.SpriteMaterial({map:e,transparent:!0,depthWrite:!1,blending:T.AdditiveBlending,opacity:t})),ct={uDay:{value:new T.Color},uMoon:{value:new T.Color},uPhase:{value:new T.Vector3(0,0,1)},uNight:{value:0}},lt=new T.Group,ut=new T.Mesh(Ee,new T.ShaderMaterial({uniforms:ct,vertexShader:ge,fragmentShader:ve}));ut.renderOrder=7;let dt=st(d,.95),ft=st(d,.28),pt=st(w,.35),mt=ot(dt,8),ht=ot(ft,5),gt=ot(pt,5);lt.add(ht,gt,mt,ut),I.add(lt);let _t=new T.Group;I.add(_t);let vt=B.map(()=>{let e=Oe(new T.ShaderMaterial({uniforms:{uFront:{value:0},uFade:{value:0},uColor:{value:new T.Color}},vertexShader:ye,fragmentShader:be,transparent:!0,depthWrite:!1,side:T.DoubleSide,blending:T.AdditiveBlending})),t=new T.Mesh(new T.PlaneGeometry(8,8).rotateX(-m/2),e);return t.visible=!1,t.renderOrder=9,t.frustumCulled=!1,I.add(t),{mesh:t,material:e}}),yt=0,U=n.input,bt=performance.now(),xt=t(U.hour,U.hours,U.light),St=new T.Color,Ct=new T.Color,wt=new T.Color,Tt=new T.Color,Et=new T.Color,Dt=new T.Color,Ot=new T.Color,kt=new T.Color,At=new T.Color,W={past:new T.Color,now:new T.Color,future:new T.Color,sub:new T.Color},G=1,K=[],jt=``,Mt=()=>{let e=getComputedStyle(E),t=(t,n)=>p(e.getPropertyValue(t))??n,n=U.light,r=t(`--acc`,n?[150,112,46]:[217,183,121]);P(Tt,t(`--bg`,n?[247,246,242]:[9,9,11])),P(Et,r),P(V.uColA.value,n?[150,112,46]:r),P(V.uColB.value,n?[190,128,52]:[255,238,206]),P(V.uColC.value,n?[214,120,60]:[255,214,150]),tt.uniforms.uOpacity.value=n?.8:1;for(let e of De){let t=e;t.uniforms?.uCore&&(t.uniforms.uCore.value=n?0:.9)}P(Re.uTint.value,[109,118,160]),Re.uLight.value=+!!n,P(L.uBase.value,n?[238,233,222]:[18,22,44]),P(L.uLit.value,n?[255,255,255]:[255,226,180]),Ge.color.copy(s(T,n?[150,112,46]:r)),Ge.opacity=n?.35:.25,P(ct.uDay.value,n?[240,166,64]:[255,240,214]),P(ct.uMoon.value,n?[115,124,158]:[243,241,232]),Dt.copy(s(T,n?[240,166,64]:[255,236,200])),Ot.copy(s(T,n?[242,180,92]:[255,201,122])),At.copy(s(T,n?[244,194,122]:[233,138,94])),kt.copy(s(T,n?[154,163,200]:[127,144,198])),pt.color.copy(s(T,n?[242,180,92]:[255,215,154])),W.past.copy(s(T,r)),W.now.copy(s(T,t(`--now`,n?[196,82,54]:[240,138,108]))),W.future.copy(s(T,t(`--mute`,n?[108,108,116]:[139,139,148]))),W.sub.copy(s(T,[234,170,74]));for(let e of vt)e.material.uniforms.uColor.value.copy(s(T,n?[176,128,52]:[255,222,168]));F.uNeb.value=n?.22:.55,F.uVig.value=n?.12:.55,G=n?.6:1;let i=n?T.NormalBlending:T.AdditiveBlending;for(let e of[...De,...K.flatMap(e=>[e.glowMat,e.pulseMat])])e.blending=i,e.needsUpdate=!0},Nt=t=>{for(let e of K)e.coreMat.dispose(),e.glowMat.dispose(),e.pulseMat.dispose();_t.clear();let n=U.light?T.NormalBlending:T.AdditiveBlending;K=U.nodes.map((r,i)=>{let a=new T.MeshBasicMaterial({transparent:!0}),o=new T.SpriteMaterial({map:d,transparent:!0,depthWrite:!1,opacity:0,blending:n}),s=new T.SpriteMaterial({map:Te,transparent:!0,depthWrite:!1,opacity:0,blending:n}),c=new T.Mesh(Ee,a);c.renderOrder=4;let l=ot(o,5),u=ot(s,5),f=new T.Group;f.add(l,u,c),f.scale.setScalar(.001),_t.add(f);let p=(r.sub?W.sub:W[r.state]).clone();return a.color.copy(p),o.color.copy(p),s.color.copy(p),{node:r,group:f,core:c,coreMat:a,glow:l,glowMat:o,pulse:u,pulseMat:s,color:p,theta:e(r.hour,U.hours),born:t<0?2.2+i*.09:t+i*.06}})},q={w:0,h:0,top:-1,floor:-1,dist:5,rpx:150},Pt=()=>{let e=Math.min(window.devicePixelRatio||1,o);O.setPixelRatio(e),q.w&&q.h&&O.setSize(q.w,q.h,!1),N?.composer.setPixelRatio(e),q.w&&q.h&&N?.composer.setSize(q.w,q.h),V.uPx.value=e,Re.uPx.value=e,H.uPx.value=e},Ft=(e=!1)=>{let t=E.clientWidth,r=E.clientHeight;if(!t||!r)return;let i=n.bounds(E),a=y(i.floor-14,r*.4,r*.9),o=y(i.top,0,a-60);if(!e&&t===q.w&&r===q.h&&Math.abs(a-q.floor)<1&&Math.abs(o-q.top)<1)return;let s=t!==q.w||r!==q.h;q.w=t,q.h=r,q.top=o,q.floor=a,(s||e)&&(O.setSize(t,r,!1),N?.composer.setSize(t,r));let l=a-o,u=y(Math.min(t*.43,l*1.12),70,640),d=o+l*.5,f=Math.tan(te*m/360);q.rpx=u,q.dist=r/2/(u*f),c.aspect=t/r,c.setViewOffset(t,r,0,r/2-d,t,r),c.updateProjectionMatrix();let p=r/2/f;V.uScale.value=p,H.uScale.value=p,V.uMark.value=y(.88*l/u,.7,1.25),F.uAspect.value=t/r},It=()=>i===2&&!U.light,Lt=!1,Rt=!0,zt=()=>{N||Lt||!It()||(Lt=!0,C().then(([e,t,n,r])=>{if(Lt=!1,!Rt||N||!It()||!q.w)return;let i=new e.EffectComposer(O);i.setPixelRatio(O.getPixelRatio()),i.setSize(q.w,q.h);let a=new t.RenderPass(M,c),o=new n.UnrealBloomPass(new T.Vector2(q.w,q.h),.45,.4,.55),s=new r.OutputPass;i.addPass(a),i.addPass(o),i.addPass(s),N={composer:i,bloom:o,passes:[a,o,s]},$()}).catch(()=>{Lt=!1,i=Math.min(i,1)}))},Bt=R,Vt=Me,Ht=()=>{--i,i<=1&&Bt>_.particles?(we(),o=Math.min(o,_.dpr),Bt=_.particles,Vt=Math.min(Vt,_.stars),V.uSize.value=1.25,ke.defines.OCT=_.octaves,ke.needsUpdate=!0):(we(),o=1,Bt=Math.round(Bt*.6),Vt=Math.round(Vt*.6),V.uSize.value=Math.max(V.uSize.value,1.3)),z.setDrawRange(0,Bt),Le.setDrawRange(0,Vt),Pt()},J={x:0,y:0},Ut=null,Wt=e=>{if(e.pointerType!==`mouse`)return;let t=D.getBoundingClientRect();t.width&&t.height&&(J.x=y((e.clientX-t.left)/t.width*2-1,-1,1),J.y=y((e.clientY-t.top)/t.height*2-1,-1,1))},Gt=()=>{J.x=0,J.y=0},Kt=e=>{e.gamma!==null&&e.beta!==null&&(Ut===null&&(Ut=e.beta),J.x=y(e.gamma/22,-1,1),J.y=y((e.beta-Ut)/22,-1,1))},qt=new T.Raycaster,Jt=new T.Vector2,Yt=new T.Plane,Xt=new T.Quaternion,Zt=(e,t,n,r)=>{let i=E.getBoundingClientRect();if(!i.width||!i.height)return r.set(0,0,0);let a=y(e-i.left,10,i.width-10),o=y(t-i.top,10,i.height-10);Jt.set(a/i.width*2-1,1-o/i.height*2),c.updateMatrixWorld(),I.updateMatrixWorld(),qt.setFromCamera(Jt,c);let s=null;return n&&(Yt.normal.set(0,1,0).applyQuaternion(I.getWorldQuaternion(Xt)),Yt.constant=0,s=qt.ray.intersectPlane(Yt,r),s&&s.length()>2.4&&(s=null)),s||=(c.getWorldDirection(Yt.normal),Yt.constant=0,qt.ray.intersectPlane(Yt,r)),s||r.set(0,0,0),I.worldToLocal(r)},Y=0,Qt=!1,X=e(U.hour,U.hours),$t=-99,en=-99,tn=A,nn=0,rn=0,an=NaN,on=NaN,sn=0,cn=new T.Vector3,ln=new T.Vector3,un=new T.Vector3,dn=new T.Vector3,Z=new T.Vector3,fn=new T.Vector3,pn=e=>{let t=B[yt];yt=(yt+1)%ae,t.set(e.x,e.y,e.z,Y)},mn=e=>{e.target instanceof Element&&e.target.closest(`a,button,input,label`)||(pn(Zt(e.clientX,e.clientY,!0,fn)),$())},hn=t=>{Y+=t,sn++;let i=A?99:Y,a=A?1:l((Y-1.5)/1.2),o=A?1:r(l(Y/3.2)),s=ce(U.hour+(A?0:(performance.now()-bt)/36e5)),u=e(s,U.hours);if(!Qt||A)X=u;else{let e=le(X,u);X=Math.abs(e)>1?u:X+e*Math.min(1,t*2)}let d=l((Math.sin(X)+.12)/.24),f=1-d,p=U.light;if(!A){let e=Math.min(1,t*3);nn=v(nn,J.x,e),rn=v(rn,J.y,e)}I.rotation.set(rn*.08,nn*.13,re);let m=A?0:o,te=(Math.sin(Y*.045)*.12+nn*.05)*m,ie=ne+(Math.sin(Y*.061)*.035-rn*.03)*m,g=q.dist*(1+(A?0:.32*(1-o))+Math.sin(Y*.031)*.015*m);c.position.set(Math.sin(te)*Math.cos(ie)*g,Math.sin(ie)*g,Math.cos(te)*Math.cos(ie)*g),c.lookAt(0,0,0),c.updateMatrixWorld(),I.updateMatrixWorld(),!tn&&Y>2.35&&(tn=!0,pn(Z.set(0,0,0)));let _=Y-$t,b=_>=0&&_<2.4?l(_/.35)*(1-l((_-.8)/1.4)):0,x=Y-en,S=x>=0&&x<3?Math.exp(-x*1.6):0,C=A?0:Y;V.uTime.value=C,V.uIntro.value=i,V.uFocus.value=g,V.uSurge.value=b,V.uFlare.value=S,cn.set(Math.cos(X),0,-Math.sin(X)),V.uSun.value.copy(cn),Re.uTime.value=C,Re.uIntro.value=i,ze.uniforms.uOpacity.value=p?.35:.35+.65*(.35+f*.65);for(let e=0;e<ae;e++){let t=C-B[e].w,n=vt[e];t>0&&t<oe?(n.mesh.visible=!0,n.mesh.position.set(B[e].x,B[e].y,B[e].z),n.material.uniforms.uFront.value=t*se,n.material.uniforms.uFade.value=(1-t/oe)**1.5*(p?.6:.9)):n.mesh.visible=!1}let w=A?1:ee(l((Y-2.15)/.6)),T=A?1:1+.05*Math.sin(Y*1.3);lt.position.copy(cn),lt.visible=w>.001,ut.scale.setScalar(Math.max(.001,v(.05,.04,f)*w*(1+S*.3))),mt.scale.setScalar(Math.max(.001,v(.5,.36,f)*T*w*(1+S*.5))),dt.color.copy(Ot).lerp(kt,f),dt.opacity=v(.95,.6,f)*G,ht.scale.setScalar(Math.max(.001,1.4*w*(1+S*.3))),ft.color.copy(At).lerp(kt,f),ft.opacity=(.28*d+.12*f)*G*(1+S),gt.scale.setScalar(Math.max(.001,1*T*w)),pt.opacity=.35*d*G,pt.rotation=A?.2:Y*.04,ct.uNight.value=f;let E=U.moonPhase*h;ct.uPhase.value.set(Math.sin(E),0,-Math.cos(E)),H.uTheta.value=X,H.uTime.value=C,H.uShow.value=a*(p?.8:1),H.uLen.value=.9*(A?1:r(a)),H.uColA.value.copy(Dt),H.uColB.value.copy(Ot).lerp(kt,f);let D=A?1:ee(l((Y-1.7)/.8));Ve.scale.setScalar(Math.max(.001,D)),Ve.rotation.y=C*.05,Ue.scale.setScalar(Math.max(.001,.8*D*(1+S*.25))),He.opacity=(p?.3:.5)*(1+S*.6),He.color.copy(Et).lerp(wt,.5),L.uRim.value.copy(Et).lerp(wt,.5),L.uTime.value=C,L.uFlare.value=S,ln.copy(cn),I.localToWorld(ln),un.copy(ln).applyMatrix4(c.matrixWorldInverse),dn.set(0,0,0).applyMatrix4(c.matrixWorldInverse),L.uSunDir.value.copy(un).sub(dn).normalize();for(let e of K){e.group.position.set(Math.cos(e.theta),0,-Math.sin(e.theta));let n=e.node.state,r=e.node.sub?W.sub:W[n];e.color.lerp(r,!Qt||A?1:Math.min(1,t*3)),e.coreMat.color.copy(e.color),e.glowMat.color.copy(e.color),e.pulseMat.color.copy(e.color);let i=n===`now`,a=i&&!A?Math.sin(Y*3):0;e.core.scale.setScalar(e.node.sub?.022:i?.038*(1+.12*a):.03),e.glow.scale.setScalar(e.node.sub?.16:i?.36*(1+.15*a):.24);let o=i?.85+.15*a:e.node.sub?.4:n===`past`?.55:.28;if(e.glowMat.opacity=o*G*(1+S*.6),e.coreMat.opacity=n===`future`?.75:1,i){let t=A?.35:Y%2.4/2.4;e.pulse.visible=!0,e.pulse.scale.setScalar(.08+t*.38),e.pulseMat.opacity=(1-t)**2*.7*G}else e.pulse.visible=!1;e.group.scale.setScalar(A?1:Math.max(.001,ee(l((Y-e.born)/.55))))}let ue=!Qt||A?1:Math.min(1,t*2.5);F.uTop.value.lerp(P(St,xt.top),ue),F.uBot.value.lerp(P(Ct,xt.bot),ue),F.uGlow.value.lerp(P(wt,xt.glow),ue),F.uGround.value.lerp(Tt,ue),F.uTime.value=C,Z.copy(ln).project(c),F.uSun.value.set(Z.x*.5+.5,Z.y*.5+.5);let de=(Z.x*.5+.5)*q.w,fe=(.5-Z.y*.5)*q.h;Z.set(0,0,0).project(c),F.uCenter.value.set(Z.x*.5+.5,Z.y*.5+.5),F.uRays.value=(p?.45:1)*(d+f*.35)*v(.3,1,a)*(1+S*.8);let pe=N!==null&&It();F.uDither.value=pe?0:1/255,N&&pe?(N.bloom.strength=.45+S*.5+b*.2,N.composer.render(t)):O.render(M,c),Qt=!0;let k=n.tag();if(k){let e=y(de,70,q.w-70);(Math.abs(e-an)>.3||Math.abs(fe-on)>.3)&&(an=e,on=fe,k.style.transform=`translate(${e.toFixed(1)}px,${fe.toFixed(1)}px)`);let t=fe<64?`1`:`0`;k.dataset.flip!==t&&(k.dataset.flip=t);let n=A||Y>2.7?`1`:`0`;k.dataset.on!==n&&(k.dataset.on=n)}},Q=0,gn=0,_n=!0,vn=12,yn=0,bn=0,xn=!A,Sn=e=>{if(Q=0,!Rt||!_n||document.hidden){gn=0;return}A||(Q=requestAnimationFrame(Sn));let t=gn?(e-gn)/1e3:0;gn=e,sn%30==0&&Ft(),xn&&t>0&&t<.25&&(vn>0?vn--:(yn++,bn+=t,yn>=60&&(yn/bn<40&&i>0?(Ht(),vn=12,xn=i>0):xn=!1,yn=0,bn=0))),hn(A?0:Math.min(.05,t))},$=()=>{!Q&&Rt&&(Q=requestAnimationFrame(Sn))},Cn=()=>{gn=0,vn=12,yn=0,bn=0,$()},wn=new IntersectionObserver(e=>{_n=e.some(e=>e.isIntersecting),gn=0,$()});wn.observe(E);let Tn=new ResizeObserver(()=>{Ft(),$()});Tn.observe(E),document.addEventListener(`visibilitychange`,Cn),jt=S(U.nodes),Nt(A?0:-1),Mt(),Pt(),Ft(!0),zt();let En=e=>{e.preventDefault(),n.onLost()};return O.domElement.addEventListener(`webglcontextlost`,En),A||(D.addEventListener(`pointermove`,Wt,{passive:!0}),D.addEventListener(`pointerleave`,Gt,{passive:!0}),D.addEventListener(`pointerdown`,mn,{passive:!0}),window.addEventListener(`deviceorientation`,Kt,{passive:!0})),document.fonts?.ready.then(()=>{Rt&&(Ft(!0),$())}).catch(()=>void 0),$(),{update:e=>{let n=e.light!==U.light,r=S(e.nodes);if(U=e,bt=performance.now(),r!==jt){let e=jt===``;jt=r,Nt(A?0:e&&Y<2.2?-1:Y),Mt()}else{for(let t=0;t<K.length;t++)K[t].node=e.nodes[t];n&&Mt()}n&&zt(),xt=t(e.hour,e.hours,e.light),$()},bloom:(e,t)=>{if(A||!Rt)return;let n=E.getBoundingClientRect(),r=e??n.left+n.width/2,i=t??n.bottom;Zt(r,i,!1,V.uSurgeAt.value),$t=Y,en=Y,pn(cn),$()},dispose:()=>{Rt=!1,Q&&cancelAnimationFrame(Q),Q=0,wn.disconnect(),Tn.disconnect(),document.removeEventListener(`visibilitychange`,Cn),O.domElement.removeEventListener(`webglcontextlost`,En),D.removeEventListener(`pointermove`,Wt),D.removeEventListener(`pointerleave`,Gt),D.removeEventListener(`pointerdown`,mn),window.removeEventListener(`deviceorientation`,Kt),we(),a(M);for(let e of Ce.splice(0))e.dispose();f(O)}}}catch(e){we(),o(M);for(let e of Ce.splice(0))e.dispose();throw f(O),e}}export{A as mountLoginSky};