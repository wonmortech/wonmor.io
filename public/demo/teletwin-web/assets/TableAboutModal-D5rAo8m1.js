const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./diamond-6kyCJf-c.js","./teact-CBM1OTpR.js","./fasterdom-DQsVp0-C.js","./core-DrMvlsKU.js","./rolldown-runtime-XKyaHtl9.js","./useBackgroundMode-DB4UnqVm.js","./math-DcsLM4n_.js","./Modal-CAvYta0d.js","./limits-C3GiSdYx.js","./generateUniqueId-D6eV4qQe.js","./Link-qwUg-Rs2.js","./index-DFHgDYYV.js","./colors-BhWmWPf4.js","./buffer-YzN4IJ47.js","./base64-Dy85X4Px.js","./Link-C1P5rrdk.css","./Modal-Dg5JqZy5.css","./animation-D_g_q3Rk.js","./WalletAppIcon-BWF3v5F2.js","./useDebouncedCallback-DHzqN5Zi.js","./Skeleton-D7zvsOd4.js","./Skeleton-qGub-uO-.css","./DropdownMenu-Bj7Tyh0i.js","./DropdownMenu-Dcls08u0.css","./WalletAppIcon-aBQbjrMG.css","./model-m4KnTD71.js","./gpu-BZVzCvUK.js"])))=>i.map(i=>d[i]);
import{t as e}from"./index-DFHgDYYV.js";import{Qt as t,r as n,t as r}from"./fasterdom-DQsVp0-C.js";import{g as i,u as a,v as o,x as s,y as c}from"./teact-CBM1OTpR.js";import{a as l,f as u,m as d,p as f}from"./limits-C3GiSdYx.js";import{t as p}from"./generateUniqueId-D6eV4qQe.js";import{x as m}from"./colors-BhWmWPf4.js";import{B as h,E as g,Fs as _,Ld as v,M as y,U as b,Xh as x,Yh as S,f as C,ng as w,z as T}from"./Link-qwUg-Rs2.js";import{s as E,t as D}from"./useBackgroundMode-DB4UnqVm.js";import{t as O}from"./Modal-CAvYta0d.js";import{f as k}from"./Skeleton-D7zvsOd4.js";import{t as A}from"./ListItem-BHdq72HW.js";import{h as ee}from"./Modal-E6O02Qrf.js";import{n as te}from"./DropdownMenu-Bj7Tyh0i.js";import{u as j}from"./WalletAppIcon-BWF3v5F2.js";var M=a(({ref:e,id:a,className:o,value:l,label:u,error:p,success:m,disabled:h,readOnly:_,placeholder:v,autoComplete:y,inputMode:x,maxLength:S,maxLengthIndicator:C,hasLengthIndicator:T,tabIndex:D,onChange:O,onInput:k,onKeyPress:A,onKeyDown:ee,onBlur:te,onPaste:j,noReplaceNewlines:M})=>{let N=s();e&&(N=e);let P=b(),F=p||m||u,I=w(`input-group`,l&&`touched`,p?`error`:m&&`success`,h&&`disabled`,_&&`disabled`,F&&`with-label`,o),L=s(),R=E(e=>{L.current=e.value,n(()=>{e.style.height=`0`,r(()=>{let t=e.scrollHeight;return()=>{e.style.height=`${t}px`}})})});c(()=>{let e=N.current;e&&e.value!==L.current&&R(e)},[l]);let z=i(e=>{let t=e.currentTarget;if(!M){let e=t.selectionEnd;t.value=t.value.replace(/\n/g,` `),t.selectionEnd=e}R(t),O?.(e)},[M,O]);return d(`div`,{className:I,dir:P.isRtl?`rtl`:void 0,children:[f(`textarea`,{ref:N,className:`form-control`,id:a,dir:`auto`,value:l||``,tabIndex:D,placeholder:v,maxLength:S,autoComplete:y,spellCheck:!t&&void 0,inputMode:x,disabled:h,readOnly:_,onChange:z,onInput:k,onKeyPress:A,onKeyDown:ee,onBlur:te,onPaste:j,"aria-label":F}),F&&f(`label`,{htmlFor:a,children:F}),(C||T&&S!==void 0)&&f(`div`,{className:`max-length-indicator`,children:f(g,{text:C||Math.max(0,S-(l||``).length).toString()})})]})}),N=m(`#0098EA`),P={blue:N,blueGradient:[m(`#0158AF`),m(`#67D0FF`)],purple:m(`#966FFE`),purpleGradient:[m(`#6B93FF`),m(`#E46ACE`)],gold:m(`#FFBF0A`),goldGradient:[m(`#FDEB32`),m(`#D75902`)]},F={particleCount:5,distanceLimit:1,fadeInTime:.05,minLifetime:3,maxLifetime:3,maxStartTimeDelay:0,selfDestroyTime:3,minSpawnRadius:5,maxSpawnRadius:50},I={width:350,height:230,particleCount:100,color:N,speed:18,baseSize:6,minSpawnRadius:35,maxSpawnRadius:70,distanceLimit:.7,fadeInTime:.25,fadeOutTime:1,minLifetime:4,maxLifetime:6,maxStartTimeDelay:3,edgeFadeZone:50,centerShift:[0,0],accelerationFactor:3,selfDestroyTime:0},L=.67,R=1.33,z=2.2,B=new Map;function V(e,t){let n=B.get(e);return n||(n=ne(e),B.set(e,n)),n.addSystem(t)}function ne(e){let t=e.getContext(`webgl`,{alpha:!0,antialias:!1,preserveDrawingBuffer:!1});if(!t)throw Error(`WebGL not supported`);let n=H(t,t.VERTEX_SHADER,re),r=H(t,t.FRAGMENT_SHADER,ie);if(!n||!r)throw Error(`Failed to create shaders`);let i=ae(t,n,r);if(!i)throw Error(`Failed to create shader program`);let a=window.devicePixelRatio||1,o=new Map,s={attributes:{startPosition:t.getAttribLocation(i,`a_startPosition`),velocity:t.getAttribLocation(i,`a_velocity`),startTime:t.getAttribLocation(i,`a_startTime`),lifetime:t.getAttribLocation(i,`a_lifetime`),size:t.getAttribLocation(i,`a_size`),baseOpacity:t.getAttribLocation(i,`a_baseOpacity`),color:t.getAttribLocation(i,`a_color`)},uniforms:{resolution:t.getUniformLocation(i,`u_resolution`),time:t.getUniformLocation(i,`u_time`),canvasWidth:t.getUniformLocation(i,`u_canvasWidth`),canvasHeight:t.getUniformLocation(i,`u_canvasHeight`),accelerationFactor:t.getUniformLocation(i,`u_accelerationFactor`),fadeInTime:t.getUniformLocation(i,`u_fadeInTime`),fadeOutTime:t.getUniformLocation(i,`u_fadeOutTime`),edgeFadeZone:t.getUniformLocation(i,`u_edgeFadeZone`),rotationMatrices:t.getUniformLocation(i,`u_rotationMatrices`),spawnCenter:t.getUniformLocation(i,`u_spawnCenter`)}},c,l;function u(e){let n=new oe(e.seed),{config:r}=e,i=new Float32Array(r.particleCount*2),o=new Float32Array(r.particleCount*2),s=new Float32Array(r.particleCount),c=new Float32Array(r.particleCount),l=new Float32Array(r.particleCount),u=new Float32Array(r.particleCount),d=new Float32Array(r.particleCount*3);for(let t=0;t<r.particleCount;t++){let f=n.next()*Math.PI*2,p=n.nextBetween(r.minSpawnRadius,r.maxSpawnRadius),m=Math.cos(f),h=Math.sin(f),g=e.centerX+m*p,_=e.centerY+h*p;i[t*2]=g*a,i[t*2+1]=_*a,c[t]=n.nextBetween(r.minLifetime,r.maxLifetime),s[t]=n.next()*r.maxStartTimeDelay;let v=n.nextBetween(e.avgDistance*r.distanceLimit*.5,e.avgDistance*r.distanceLimit)/c[t]*a;o[t*2]=m*v,o[t*2+1]=h*v;let y=n.next();y<.3?l[t]=r.baseSize*L*a:y<.7?l[t]=r.baseSize*R*a:l[t]=r.baseSize*z*a,u[t]=n.nextBetween(.3,.8);let[b,x,S]=ce(r.color,n).coords;d[t*3]=b||0,d[t*3+1]=x||0,d[t*3+2]=S||0}t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startPosition),t.bufferData(t.ARRAY_BUFFER,i,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.velocity),t.bufferData(t.ARRAY_BUFFER,o,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startTime),t.bufferData(t.ARRAY_BUFFER,s,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.lifetime),t.bufferData(t.ARRAY_BUFFER,c,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.size),t.bufferData(t.ARRAY_BUFFER,l,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.baseOpacity),t.bufferData(t.ARRAY_BUFFER,u,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.color),t.bufferData(t.ARRAY_BUFFER,d,t.STATIC_DRAW)}function d(){let n=0,r=0;o.forEach(e=>{n=Math.max(n,e.config.width),r=Math.max(r,e.config.height)}),o.size===0&&(n=I.width,r=I.height),(e.width!==n*a||e.height!==r*a)&&(e.width=n*a,e.height=r*a,e.style.width=n+`px`,e.style.height=r+`px`),t.viewport(0,0,e.width,e.height)}function f(){t.useProgram(i),t.uniform2f(s.uniforms.resolution,e.width,e.height),t.uniformMatrix2fv(s.uniforms.rotationMatrices,!1,se()),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.clearColor(0,0,0,0)}function m(e){c&&=(t.clear(t.COLOR_BUFFER_BIT),o.forEach(n=>{let r=(e-n.startTime)/1e3;t.uniform1f(s.uniforms.time,r),t.uniform1f(s.uniforms.canvasWidth,n.config.width*a),t.uniform1f(s.uniforms.canvasHeight,n.config.height*a),t.uniform1f(s.uniforms.accelerationFactor,n.config.accelerationFactor),t.uniform1f(s.uniforms.fadeInTime,n.config.fadeInTime),t.uniform1f(s.uniforms.fadeOutTime,n.config.fadeOutTime),t.uniform1f(s.uniforms.edgeFadeZone,n.config.edgeFadeZone*a),t.uniform2f(s.uniforms.spawnCenter,n.centerX*a,n.centerY*a),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startPosition),t.enableVertexAttribArray(s.attributes.startPosition),t.vertexAttribPointer(s.attributes.startPosition,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.velocity),t.enableVertexAttribArray(s.attributes.velocity),t.vertexAttribPointer(s.attributes.velocity,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startTime),t.enableVertexAttribArray(s.attributes.startTime),t.vertexAttribPointer(s.attributes.startTime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.lifetime),t.enableVertexAttribArray(s.attributes.lifetime),t.vertexAttribPointer(s.attributes.lifetime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.size),t.enableVertexAttribArray(s.attributes.size),t.vertexAttribPointer(s.attributes.size,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.baseOpacity),t.enableVertexAttribArray(s.attributes.baseOpacity),t.vertexAttribPointer(s.attributes.baseOpacity,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.color),t.enableVertexAttribArray(s.attributes.color),t.vertexAttribPointer(s.attributes.color,3,t.FLOAT,!1,0,0),t.drawArrays(t.POINTS,0,n.config.particleCount)}),requestAnimationFrame(m))}function h(e){let n=p(),r={...I,...e},i={id:n,config:r,buffers:{startPosition:t.createBuffer(),velocity:t.createBuffer(),startTime:t.createBuffer(),lifetime:t.createBuffer(),size:t.createBuffer(),baseOpacity:t.createBuffer(),color:t.createBuffer()},startTime:performance.now(),seed:Math.floor(Math.random()*1e6),centerX:r.width/2+r.centerShift[0],centerY:r.height/2+r.centerShift[1],avgDistance:(r.width/2+r.height/2)/2};return o.set(n,i),u(i),d(),r.selfDestroyTime&&(i.selfDestroyTimeout=window.setTimeout(()=>{g(n)},r.selfDestroyTime*1e3)),o.size===1&&(f(),l=D.subscribe(()=>{let e=!D();e&&!c?c=requestAnimationFrame(m):!e&&c&&(cancelAnimationFrame(c),c=void 0)}),c=requestAnimationFrame(m)),()=>g(n)}function g(e){let n=o.get(e);n&&(n.selfDestroyTimeout&&clearTimeout(n.selfDestroyTimeout),Object.values(n.buffers).forEach(e=>{e&&t.deleteBuffer(e)}),o.delete(e),o.size===0&&_())}function _(){c!==void 0&&(cancelAnimationFrame(c),c=void 0),l?.(),o.clear(),t.deleteProgram(i),t.deleteShader(n),t.deleteShader(r),B.delete(e)}return{addSystem:h}}var re=`
    attribute vec2 a_startPosition;
    attribute vec2 a_velocity;
    attribute float a_startTime;
    attribute float a_lifetime;
    attribute float a_size;
    attribute float a_baseOpacity;
    attribute vec3 a_color;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_canvasWidth;
    uniform float u_canvasHeight;
    uniform float u_accelerationFactor;
    uniform float u_fadeInTime;
    uniform float u_fadeOutTime;
    uniform float u_edgeFadeZone;
    uniform mat2 u_rotationMatrices[18];
    uniform vec2 u_spawnCenter;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        float totalAge = u_time - a_startTime;
        float age = mod(totalAge, a_lifetime);

        // For the initial animation, fade in all particles
        float globalFadeIn = min(u_time / u_fadeInTime, 1.0);

        float lifeRatio = age / a_lifetime;

        // Calculate rotation based on completed lifecycles
        float lifecycleCount = floor(totalAge / a_lifetime);
        int rotationIndex = int(mod(lifecycleCount, 18.0));

        // Get rotation matrix
        mat2 rotationMatrix = u_rotationMatrices[rotationIndex];

        // Rotate start position around spawn center
        vec2 startOffset = a_startPosition - u_spawnCenter;
        vec2 rotatedStartOffset = rotationMatrix * startOffset;
        vec2 rotatedStartPosition = u_spawnCenter + rotatedStartOffset;

        // Apply rotation matrix to velocity
        vec2 rotatedVelocity = rotationMatrix * a_velocity;

        // Apply shoot-out effect: fast initial speed that slows down
        float speedMultiplier = 1.0 + u_accelerationFactor * exp(-3.0 * lifeRatio);

        vec2 position = rotatedStartPosition + rotatedVelocity * age * speedMultiplier;

        float opacity = 1.0;
        if (lifeRatio < u_fadeInTime / a_lifetime) {
            opacity = (lifeRatio * a_lifetime) / u_fadeInTime;
        } else if (lifeRatio > 1.0 - u_fadeOutTime / a_lifetime) {
            opacity = (1.0 - lifeRatio) * a_lifetime / u_fadeOutTime;
        }
        opacity *= a_baseOpacity * globalFadeIn;

        float distToLeft = position.x;
        float distToRight = u_canvasWidth - position.x;
        float distToTop = position.y;
        float distToBottom = u_canvasHeight - position.y;
        float distToEdge = min(min(distToLeft, distToRight), min(distToTop, distToBottom));

        if (distToEdge < u_edgeFadeZone) {
            opacity *= distToEdge / u_edgeFadeZone;
        }

        vec2 clipSpace = ((position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
        gl_Position = vec4(clipSpace, 0, 1);
        gl_PointSize = a_size;
        v_opacity = opacity;
        v_color = a_color;
    }
`,ie=`
    precision mediump float;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);

        // Create a four-pointed star
        float absX = abs(coord.x);
        float absY = abs(coord.y);

        // Star parameters
        float innerSize = 0.12;    // Size of center square
        float armLength = 0.45;    // Length of star arms
        float armWidth = 0.08;     // Half-width of star arms at base

        float dist = 1.0; // Default to outside

        // Center square
        if (absX <= innerSize && absY <= innerSize) {
            dist = max(absX, absY) - innerSize;
        }
        // Horizontal arms (left and right points)
        else if (absY <= armWidth && absX <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedX = (absX - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedX * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absY - currentArmWidth;
        }
        // Vertical arms (top and bottom points)
        else if (absX <= armWidth && absY <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedY = (absY - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedY * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absX - currentArmWidth;
        }

        // Use smoothstep for anti-aliasing to reduce subpixel artifacts
        float alpha = 1.0 - smoothstep(-0.01, 0.01, dist);

        if (alpha <= 0.0) {
            discard;
        }

        gl_FragColor = vec4(v_color * v_opacity * alpha, v_opacity * alpha);
    }
`;function H(e,t,n){let r=e.createShader(t);if(r){if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))e.deleteShader(r);else return r}}function ae(e,t,n){let r=e.createProgram();if(r){if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))e.deleteProgram(r);else return r}}var oe=class{seed;constructor(e){this.seed=e}next(){return this.seed=(this.seed*9301+49297)%233280,this.seed/233280}nextBetween(e,t){return e+(t-e)*this.next()}},U;function se(){if(!U){U=new Float32Array(72);for(let e=0;e<18;e++){let t=220*Math.PI/180*e,n=Math.cos(t),r=Math.sin(t);U[e*4]=n,U[e*4+1]=r,U[e*4+2]=-r,U[e*4+3]=n}}return U}function ce(e,t){if(`coords`in e)return e;let[n,r]=e,[i,a,o]=n.coords,[s,c,l]=r.coords;return m({space:`srgb`,coords:[t.nextBetween(i||0,s||0),t.nextBetween(a||0,c||0),t.nextBetween(o||0,l||0)]})}var le={sparkles:`JxY8hVTW`},ue={centerShift:[0,-36]},de=15,W=a(({color:e=`purple`,centerShift:t=ue.centerShift,isDisabled:n,className:r,onRequestAnimation:i})=>{let a=s(),l=s(0);return c(()=>{if(!n)return V(a.current,{color:P[`${e}Gradient`],centerShift:t})},[t,e,n]),o(()=>{i&&i(()=>{if(n)return;let r=Date.now();r-l.current<de||(l.current=r,V(a.current,{color:P[`${e}Gradient`],centerShift:t,...F}))})},[t,e,n,i]),f(`canvas`,{ref:a,className:w(le.sparkles,r)})}),G={root:`woZWPU7X`,preview:`-moeQylm`,previewHidden:`mGT1XdIL`,canvas:`fDA6MU2y`,ready:`UbJiz6U-`},K=a(({size:t})=>{let n=s(),r=x(v),[i,a]=y(),[c,l]=y(),u=r&&!c;if(o(()=>{if(!u)return;let t=n.current,r,i=!1;return e(async()=>{let{setupDiamond:e}=await import(`./diamond-6kyCJf-c.js`);return{setupDiamond:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]),import.meta.url).then(({setupDiamond:e})=>{i||(r=e(t,a,l))},l),()=>{i=!0,r?.()}},[u]),!u)return f(te,{tgsUrl:h.BlueDiamond,previewUrl:T.BlueDiamond,size:t,play:r,nonInteractive:!r});let p=Math.round(t*(window.devicePixelRatio||1));return d(`div`,{className:G.root,style:`width: ${t}px; height: ${t}px`,children:[f(`img`,{src:T.BlueDiamond3d,alt:``,draggable:!1,className:w(G.preview,i&&G.previewHidden)}),f(`canvas`,{ref:n,className:w(G.canvas,i&&G.ready),width:p,height:p,style:`width: ${t}px; height: ${t}px`})]})}),q={root:`QcfrGLdX`,star:`nDPg-zs5`,star_purple:`-f2S1Tk6`,starPurple:`-f2S1Tk6`},J=50;function fe({className:e,color:t,centerShift:r,onMouseMove:i}){let a=b(),o=s(),c=E(e=>{let t=e.currentTarget.getBoundingClientRect(),a=t.left+t.width/2+r[0],s=t.top+t.height/2+r[1],c=e.clientX-a,l=e.clientY-s,u=Math.max(-1,Math.min(1,c/J)),d=Math.max(-1,Math.min(1,l/J)),f=u*40,p=-d*40;n(()=>{o.current.style.transform=`scale(1.1) rotateX(${p}deg) rotateY(${f}deg)`}),i()}),l=E(()=>{n(()=>{o.current.style.transform=``})});return f(`div`,{className:w(q.root,e),onMouseMove:c,onMouseLeave:l,children:f(`div`,{ref:o,className:w(q.star,q[`star_${t}`]),role:`img`,"aria-label":a(`TelegramStars`)})})}var pe=a(fe),Y={root:`cK6KQXnQ`,"ai-egg":`ZP86O9Hy`,aiEgg:`ZP86O9Hy`,title:`xRm-Im3m`,description:`IQdQ9MU9`,particles:`_8ooQ3s8b`,stickerWrapper:`hHs2sTV-`,diamond3d:`tPAJ2-tU`,diamond3D:`tPAJ2-tU`,cocoon:`Rlhm9gZk`},me=new URL(`cocoon-DzgJltGQ.webp`,import.meta.url).href,X=8*_,he=130,Z={centerShift:[0,-36]};function ge({model:e,sticker:t,color:n,title:r,description:i,isDisabled:a,className:o,modelClassName:c,titleClassName:l}){let u=s(),p=s(),m=E(()=>{p.current?.()}),h=E(e=>{p.current=e});return d(`div`,{className:w(Y.root,Y[e],o),children:[f(W,{color:n,centerShift:Z.centerShift,isDisabled:a,className:Y.particles,onRequestAnimation:h}),e===`swaying-star`?f(pe,{className:c,color:n,centerShift:Z.centerShift,onMouseMove:m}):e===`ai-egg`?f(`img`,{src:me,alt:``,role:`presentation`,"aria-hidden":`true`,className:w(Y.cocoon,c),draggable:!1,onMouseMove:m}):e===`diamond-3d`?f(`div`,{className:w(Y.diamond3d,c),onMouseMove:m,children:f(K,{size:he})}):e===`sticker`&&t&&f(`div`,{ref:u,className:w(Y.stickerWrapper,c),style:`width: ${X}px; height: ${X}px`,onMouseMove:m,children:f(k,{containerRef:u,sticker:t,size:X,shouldPreloadPreview:!0,shouldLoop:!0})}),f(`h2`,{className:w(Y.title,l),children:r}),f(`div`,{className:Y.description,children:i})]})}var _e=a(ge),Q={table:`RMEi5Sgb`,cell:`AEl8NMjg`,title:`IypKoG1m`,value:`ZO-KCUSl`,fullWidth:`_1WIqSuNB`,chatItem:`J6it2-iy`},ve=a(({tableData:e,className:t,onChatClick:n})=>{let{openChat:r}=l(),i=E(e=>{n?n(e):r({id:e})});if(e?.length)return f(`div`,{className:w(Q.table,t),children:e.map(([e,t])=>d(u,{children:[!!e&&f(`div`,{className:w(Q.cell,Q.title),children:e}),f(`div`,{className:w(Q.cell,Q.value,!e&&Q.fullWidth),children:typeof t==`object`&&`chatId`in t?f(ee,{peerId:t.chatId,className:Q.chatItem,forceShowSelf:!0,withEmojiStatus:t.withEmojiStatus,clickArg:t.chatId,onClick:i}):t})]}))})}),$={root:`FEEwg5rl`,secondary:`_51eeI1vd`,topIcon:`_0fVPMdEi`,premiumGradient:`oEaPoig5`,content:`_7xJ2IMc7`,listItems:`_4Smlf3-h`,listItemTitle:`lPVHA-w3`,separator:`V6iMhrLh`},ye=a(({className:e,isOpen:t,listItemData:n,headerIconName:r,headerIconPremiumGradient:i,header:a,footer:o,buttonText:s,hasBackdrop:c,absoluteCloseButtonColor:l,withSeparator:u,isNativeDialog:p,contentClassName:m,onClose:h,onButtonClick:g})=>d(O,{isOpen:t,className:w($.root,e),contentClassName:w($.content,m),hasAbsoluteCloseButton:!0,isNativeDialog:p,absoluteCloseButtonColor:l||(c?`translucent-white`:void 0),onClose:h,children:[r&&f(`div`,{className:w($.topIcon,i&&$.premiumGradient),children:f(S,{name:r})}),a,f(`div`,{className:$.listItems,children:n?.map(([e,t,n])=>d(A,{isStatic:!0,multiline:!0,icon:e,className:$.listItem,children:[f(`span`,{className:w(`title`,$.listItemTitle),children:t}),f(`span`,{className:`subtitle`,children:n})]}))}),u&&f(j,{className:$.separator}),o,!!s&&f(C,{onClick:g||h,children:s})]}));export{W as a,K as i,ve as n,M as o,_e as r,ye as t};