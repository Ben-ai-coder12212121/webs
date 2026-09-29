/* Helpers for the portrait, touch-first "mobile" games: a sharp canvas sized for phones, swipe/drag input,
   particles, rounded rectangles and text. */
const MOB={
  /* W×H logical pixels, drawn at the screen's pixel density, scaled to fit the page (portrait) */
  canvas(root,W,H){const dpr=Math.min(2,window.devicePixelRatio||1);const cv=el('canvas',{class:'board',width:W*dpr,height:H*dpr,style:`width:min(100%,calc(70vh*${(W/H).toFixed(4)}));touch-action:none`});
    const x=cv.getContext('2d');x.scale(dpr,dpr);root.append(cv);return{cv,x,W,H}},
  /* pointer position in logical pixels */
  pos(cv,e,W,H){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}},
  /* down/move/up with logical coordinates; move fires only while pressed unless hover is true */
  drag(c,cv,W,H,h,hover){let on=false;c.on(cv,'pointerdown',e=>{e.preventDefault();on=true;try{cv.setPointerCapture(e.pointerId)}catch(_){}h.down&&h.down(MOB.pos(cv,e,W,H),e)});
    c.on(cv,'pointermove',e=>{if(on||hover)h.move&&h.move(MOB.pos(cv,e,W,H),on,e)});c.on(cv,'pointerup',e=>{if(!on)return;on=false;h.up&&h.up(MOB.pos(cv,e,W,H),e)});c.on(cv,'pointercancel',()=>{on=false})},
  /* swipe: calls fn('left'|'right'|'up'|'down'|'tap') */
  swipe(c,cv,W,H,fn){let s=null;MOB.drag(c,cv,W,H,{down:p=>{s=p},up:p=>{if(!s)return;const dx=p.x-s.x,dy=p.y-s.y;s=null;if(Math.hypot(dx,dy)<18)return fn('tap');fn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))}})},
  keys(c,map){c.on(document,'keydown',e=>{const f=map[e.key]||map[e.code];if(f){e.preventDefault();f(e)}})},
  rr(x,px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath()},
  txt(x,s,px,py,size,col,align,font){x.font=(font||'800 ')+size+'px Figtree, system-ui, sans-serif';x.textAlign=align||'center';x.textBaseline='middle';x.fillStyle=col||'#fff';x.fillText(s,px,py)},
  big(x,s,px,py,size,col,stroke){x.font=size+'px "Bagel Fat One", sans-serif';x.textAlign='center';x.textBaseline='middle';if(stroke){x.lineWidth=size/7;x.strokeStyle=stroke;x.strokeText(s,px,py)}x.fillStyle=col||'#FFD23F';x.fillText(s,px,py)},
  /* particles */
  parts(){const P=[];return{P,burst(px,py,n,col,sp,life,g){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(sp||3)*(.3+Math.random());P.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(g?2:0),l:life||600,t:0,c:Array.isArray(col)?col[i%col.length]:col,r:2+Math.random()*3,g:g||0})}},
    step(dt){for(const p of P){p.t+=dt;p.x+=p.vx*dt/16;p.y+=p.vy*dt/16;p.vy+=p.g*dt/16}for(let i=P.length-1;i>=0;i--)if(P[i].t>P[i].l)P.splice(i,1)},
    draw(x){for(const p of P){x.globalAlpha=Math.max(0,1-p.t/p.l);x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fill()}x.globalAlpha=1}}},
  /* pop-up floating text */
  floats(){const F=[];return{add(s,px,py,col){F.push({s,x:px,y:py,t:0,c:col||'#fff'})},step(dt){for(const f of F){f.t+=dt;f.y-=dt*.04}for(let i=F.length-1;i>=0;i--)if(F[i].t>900)F.splice(i,1)},draw(x){for(const f of F){x.globalAlpha=1-f.t/900;MOB.txt(x,f.s,f.x,f.y,20,f.c)}x.globalAlpha=1}}},
  rnd:(a,b)=>a+Math.random()*(b-a),pick:a=>a[Math.random()*a.length|0],clamp:(v,a,b)=>v<a?a:v>b?b:v,
  /* shuffle in place */
  shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}};
