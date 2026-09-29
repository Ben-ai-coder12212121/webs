/* lib/cooking.js: code shared by several games (from src/heroes/cooking.js) */
function cookUI(cv,c){const btns=[];let hover=null;const ui={W:cv.width,H:cv.height,btns,
  button(x,y,w,h,label,fn,o){o=o||{};btns.push({x,y,w,h,fn,drag:o.drag});const g=cv.getContext('2d');const on=o.on,dis=o.dis;g.fillStyle=dis?'#d8d4e4':on?'#FFD23F':o.col||'#FFFDF6';g.strokeStyle='#1D1A2F';g.lineWidth=3;g.beginPath();g.roundRect(x,y,w,h,10);g.fill();g.stroke();g.fillStyle=dis?'#8c86a3':'#1D1A2F';g.font=(o.font||'800 16px Figtree, sans-serif');g.textAlign='center';g.textBaseline='middle';g.fillText(label,x+w/2,y+h/2+1);g.textBaseline='alphabetic';if(o.badge){g.fillStyle='#F2352A';g.beginPath();g.arc(x+w-6,y+6,10,0,7);g.fill();g.fillStyle='#fff';g.font='800 12px Figtree, sans-serif';g.textAlign='center';g.fillText(o.badge,x+w-6,y+10)}},
  frame(){btns.length=0}};
  c.on(cv,'pointerdown',e=>{e.preventDefault();const p=canvasPos(cv,e);ui.down=p;ui.drag=null;for(let i=btns.length-1;i>=0;i--){const b=btns[i];if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){b.fn(p);return}}ui.onDown&&ui.onDown(p)});
  c.on(cv,'pointermove',e=>{const p=canvasPos(cv,e);ui.mouse=p;ui.onMove&&ui.onMove(p)});c.on(window,'pointerup',e=>{const p=ui.mouse||ui.down;ui.onUp&&ui.onUp(p);ui.down=null});return ui}
const COOK_NAMES=['Ava','Leo','Maya','Noah','Zoe','Kai','Ivy','Omar','Lily','Max','Nina','Theo','Ruby','Sam','Aria','Finn','Jade','Eli','Mila','Jax','Rosa','Ben','Luna','Ezra'];
const COOK_FACES=['🧑','👩','👨','🧒','👧','👦','👵','👴','🧔','👱','👮','👲','🧕','🤠'];
function cookCustomer(){return{name:pick(COOK_NAMES),face:pick(COOK_FACES),pat:1}}
function cookStars(x,cx,cy,sc){const n=Math.round(sc*5);for(let i=0;i<5;i++){x.fillStyle=i<n?'#FFD23F':'#d8d4e4';x.font='30px sans-serif';x.textAlign='center';x.fillText('★',cx+(i-2)*32,cy)}}
function cookReact(sc){return sc>.9?['🤩','Perfect! Best in town!']:sc>.75?['😋','Delicious, thanks!']:sc>.55?['🙂','Pretty good.']:sc>.35?['😕','Hmm… not quite what I asked for.']:['😠','This is NOT my order!']}
const COOK_SHIRTS=['#F2352A','#2BB673','#7FC8F8','#FF8FB1','#B9A7FF','#FF9F43','#FFD23F','#5A5470','#6EE7B7','#e0a458'];
function cookShop(x,w,h,queue,o){const T=performance.now()/1000;x.fillStyle=o.wall;x.fillRect(0,64,w,h-64);
  const wx=24,wy=96,ww=w-48,wh=236;const sky=x.createLinearGradient(0,wy,0,wy+wh);sky.addColorStop(0,'#8fd3ff');sky.addColorStop(1,'#e4f5ff');x.fillStyle=sky;x.fillRect(wx,wy,ww,wh);
  x.fillStyle='rgba(255,255,255,.85)';[[.2,40],[.62,62]].forEach(([f,yy],i)=>{const cx=wx+((f*ww+T*6*(i+1))%(ww+120))-60;[[0,0,18],[20,-6,22],[42,0,16]].forEach(([a,b,r])=>{x.beginPath();x.arc(cx+a,wy+yy+b,r,0,7);x.fill()})});
  for(let i=0;i<9;i++){const bx=wx+i*ww/9,bh=70+((i*53)%80);x.fillStyle=i%2?'#aebde0':'#c3cdea';x.fillRect(bx+5,wy+wh-56-bh,ww/9-10,bh);x.fillStyle='rgba(255,255,255,.55)';for(let r=0;r<bh-20;r+=22)for(let k=0;k<2;k++)x.fillRect(bx+14+k*(ww/9-36)/1.5,wy+wh-44-bh+r,10,12)}
  x.fillStyle='#d8d1c6';x.fillRect(wx,wy+wh-56,ww,56);x.fillStyle='#bdb5a8';for(let i=0;i<ww;i+=46)x.fillRect(wx+i,wy+wh-56,2,56);
  x.strokeStyle='#1D1A2F';x.lineWidth=6;x.strokeRect(wx,wy,ww,wh);x.lineWidth=4;x.beginPath();x.moveTo(wx+ww/2,wy);x.lineTo(wx+ww/2,wy+wh);x.stroke();
  x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.moveTo(wx+30,wy);x.lineTo(wx+90,wy);x.lineTo(wx+20,wy+wh);x.lineTo(wx,wy+wh);x.lineTo(wx,wy+40);x.fill();
  for(let i=0;i<w/40;i++){x.fillStyle=i%2?'#FFFDF6':o.accent;x.beginPath();x.moveTo(i*40,64);x.lineTo(i*40+40,64);x.lineTo(i*40+40,84);x.arc(i*40+20,84,20,0,Math.PI);x.closePath();x.fill()}
  queue.forEach((q,i)=>{const cx=130+i*200,bob=Math.sin(T*3+i*2)*2.5;q.shirt=q.shirt||pick(COOK_SHIRTS);
    x.fillStyle=q.shirt;x.strokeStyle='#1D1A2F';x.lineWidth=3;x.beginPath();x.roundRect(cx-50,318+bob,100,140,44);x.fill();x.stroke();
    x.font='86px sans-serif';x.textAlign='center';x.textBaseline='alphabetic';x.fillText(q.face,cx,322+bob);
    x.fillStyle='#FFFDF6';x.beginPath();x.roundRect(cx-52,196+bob,104,34,10);x.fill();x.stroke();x.fillStyle='#1D1A2F';x.font='800 15px Figtree, sans-serif';x.fillText(q.name,cx,214+bob);x.fillStyle='#e8e3f2';x.fillRect(cx-40,219+bob,80,6);x.fillStyle=q.pat>.5?'#2BB673':q.pat>.25?'#FF9F43':'#F2352A';x.fillRect(cx-40,219+bob,80*q.pat,6);
    if(i===0&&o.say){x.font='700 14px Figtree, sans-serif';const tw=x.measureText(o.say).width+26;x.fillStyle='#FFFDF6';x.beginPath();x.roundRect(cx+44,238,tw,40,14);x.fill();x.stroke();x.beginPath();x.moveTo(cx+56,276);x.lineTo(cx+40,292);x.lineTo(cx+72,276);x.fill();x.fillStyle='#1D1A2F';x.textAlign='left';x.fillText(o.say,cx+57,263)}});
  x.fillStyle=o.counter;x.fillRect(0,420,w,h-420);x.fillStyle='rgba(255,255,255,.28)';x.fillRect(0,420,w,8);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(0,428,w,5);x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=2;for(let i=0;i<w;i+=70){x.beginPath();x.moveTo(i,440);x.lineTo(i,h);x.stroke()}}
function cookKitchen(x,w,h,split,o){x.fillStyle=o.wall;x.fillRect(0,64,w,split-64);x.strokeStyle='rgba(29,26,47,.08)';x.lineWidth=1.5;x.beginPath();for(let yy=64,k=0;yy<split;yy+=30,k++){x.moveTo(0,yy);x.lineTo(w,yy);for(let xx=(k%2)*22;xx<w;xx+=44){x.moveTo(xx,yy);x.lineTo(xx,Math.min(split,yy+30))}}x.stroke();
  const g=x.createLinearGradient(0,split,0,h);g.addColorStop(0,o.wood);g.addColorStop(1,o.wood2);x.fillStyle=g;x.fillRect(0,split,w,h-split);x.fillStyle='rgba(255,255,255,.22)';x.fillRect(0,split,w,6);x.strokeStyle='rgba(70,35,10,.13)';x.lineWidth=2;for(let yy=split+22;yy<h;yy+=26){x.beginPath();x.moveTo(0,yy);for(let xx=0;xx<=w;xx+=60)x.lineTo(xx,yy+Math.sin(xx*.03+yy)*3);x.stroke()}}
