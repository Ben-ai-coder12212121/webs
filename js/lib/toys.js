/* lib/toys.js: code shared by several games (from src/heroes/toys.js) */
function glowCanvas(root,hint,cursor){const W=800,H=500;const[cv,x]=mk(W,H,'width:100%;touch-action:none;cursor:'+(cursor||'crosshair'));root.append(cv,el('p',{class:'hint'},hint));const P={x:W/2,y:H/2,down:false,moved:0,px:W/2,py:H/2};
  cv.addEventListener('pointermove',e=>{const p=canvasPos(cv,e);P.px=P.x;P.py=P.y;P.x=p.x;P.y=p.y;P.moved=performance.now()});cv.addEventListener('pointerdown',e=>{const p=canvasPos(cv,e);P.x=p.x;P.y=p.y;P.down=true;P.moved=performance.now();try{cv.setPointerCapture(e.pointerId)}catch(_){}});cv.addEventListener('pointerup',()=>{P.down=false});cv.addEventListener('pointercancel',()=>{P.down=false});return{cv,x,W,H,P}}
const idle=P=>performance.now()-P.moved>2500;
