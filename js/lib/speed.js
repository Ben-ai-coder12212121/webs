/* lib/speed.js: code shared by several games (from src/heroes/speed.js) */
function toonCar(K,col,big){const{T,TM}=K;const g=new T.Group();const L=big?5.6:3.6,W=big?2.3:1.8;
  part(T,bx(T,W,big?1.7:.8,L),TM(col),0,big?1.3:.72,0,g);part(T,bx(T,W*.88,big?1.1:.62,L*(big?.3:.48)),TM(big?0x3a3552:0x9fd6ff),0,big?2.6:1.42,big?L*.33:-L*.06,g);
  if(big){part(T,bx(T,W+.04,.3,L*.6),TM(0xF2352A),0,1.3,-L*.15,g)}
  const wm=TM(0x1D1A2F);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const w=part(T,cy(T,big?.5:.36,big?.5:.36,.32,10),wm,a*W/2,big?.5:.36,b*L*.32,g);w.rotation.z=Math.PI/2});
  K.ink(g,.05);[-1,1].forEach(a=>{part(T,bx(T,.34,.2,.06),TM(0xFFE27A),a*W*.3,big?1.4:.8,L/2+.02,g).userData.noInk=1});return g}
function wrapA(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a}
