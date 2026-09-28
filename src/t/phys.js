const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const W=13;
  const torque=(P,rpm)=>{const x=clamp(rpm/P.red,0,1.05);return P.tq*clamp(.62+1.35*x-1.1*x*x,.3,1.05)};
  function stepCar(k,dt,assist){const P=k.spec,sn=Math.sin(k.psi),cs=Math.cos(k.psi);let u=k.vx*sn+k.vz*cs,w=k.vx*cs-k.vz*sn,r=k.r;const L=P.a+P.b;const ad=Math.abs(k.d);const onT=ad<W/2+.4,curb=!onT&&ad<W/2+1.3;const mu=P.mu*(onT||curb?1:.6);
    const down=P.cl*u*u,g=9.81*P.m;let Nf=g*P.b/L-P.m*k.ax*P.h/L+down*P.dfF,Nr=g*P.a/L+P.m*k.ax*P.h/L+down*(1-P.dfF);Nf=Math.max(Nf,300);Nr=Math.max(Nr,300);
    const gr=k.rev?-3.2*P.fd:P.gears[k.gear-1]*P.fd;k.rpm=clamp(Math.abs(u)/P.rw*Math.abs(gr)*60/(2*Math.PI),900,P.red*1.02);if(k.shiftT>0)k.shiftT-=dt;
    let Fd=(k.shiftT>0||k.rpm>=P.red*1.01?0:torque(P,k.rpm)*k.thr*gr/P.rw*.9);if(k.rev&&u<-9)Fd=0;const Nd=P.drive==='F'?Nf:P.drive==='R'?Nr:Nf+Nr;const maxT=mu*Nd;let spinning=false;if(Math.abs(Fd)>maxT){if(assist.tcs)Fd=Math.sign(Fd)*maxT*.97;else{spinning=true;Fd=Math.sign(Fd)*maxT}}
    let Fb=k.brk*P.bf;let lockF=false;const maxB=mu*(Nf+Nr)*.98;if(Fb>maxB){if(assist.abs)Fb=maxB;else{Fb=maxB*.85;lockF=true}}if(k.hb)Fb+=mu*Nr*.5;
    const Fx=Fd-Math.sign(u)*Math.min(Fb,Math.abs(u)*P.m*8)-P.cd*u*Math.abs(u)-(onT?30:320)*u*(onT?.1:1);
    const uu=Math.max(Math.abs(u),1);const aF=Math.atan2(w+P.a*r,uu)-k.delta*(u<-.5?-1:1),aR=Math.atan2(w-P.b*r,uu);const muF=mu*(lockF?.45:1)*(spinning&&P.drive!=='R'?.55:1),muR=mu*1.12*(k.hb?.3:1)*(spinning&&P.drive!=='F'?.5:1);
    const FyF=-muF*Nf*Math.tanh(P.cf*aF/(muF*Nf)),FyR=-muR*Nr*Math.tanh(P.cr*aR/(muR*Nr));
    const du=(Fx-FyF*Math.sin(k.delta))/P.m,dw=(FyF*Math.cos(k.delta)+FyR)/P.m,dr=(P.a*FyF*Math.cos(k.delta)-P.b*FyR)/P.iz;
    u+=du*dt;w+=dw*dt;r+=dr*dt;if(Math.abs(u)<3){const t=1-Math.abs(u)/3;r=r*(1-t)+u*Math.tan(k.delta)/L*t;w*=1-t*.5}
    if(assist.stm){const rk=u*Math.tan(k.delta)/L;const slip=Math.abs(Math.atan2(w,uu));if(slip>.08)r+=(rk-r)*Math.min(1,dt*4*(slip-.06)*8);const rmax=mu*9.81*1.15/Math.max(3,Math.abs(u));if(Math.abs(r)>rmax)r=Math.sign(r)*rmax;if(slip>.12)w*=1-Math.min(.5,dt*3)}
    k.ax+=(du-k.ax)*Math.min(1,dt*6);k.slipF=Math.abs(aF);k.slipR=Math.abs(aR);k.spin=spinning?1:0;k.lock=lockF;
    k.vx=u*sn+w*cs;k.vz=u*cs-w*sn;k.r=r;k.psi+=r*dt;k.x+=k.vx*dt;k.z+=k.vz*dt;k.u=u;k.w=w;k.wspin+=(spinning?u*1.4+12:u)/P.rw*dt}
  function autoShift(k){const P=k.spec;if(k.rev||k.shiftT>0)return;if(k.rpm>P.red*.94&&k.gear<P.gears.length){k.gear++;k.shiftT=.14}else if(k.rpm<P.red*.46&&k.gear>1){k.gear--;k.shiftT=.1}}

const P={m:1420,a:1.3,b:1.35,h:.46,iz:2300,cf:108000,cr:118000,mu:1.08,tq:570,red:7600,gears:[3.2,2.2,1.65,1.3,1.07,.9,.76],fd:3.5,rw:.33,bf:20000,cd:.4,cl:.8,dfF:.42,drive:'R'};
for(const [spd,del] of [[10,.1],[20,.05],[30,.03],[40,.02],[30,.08]]){const k={spec:P,x:0,z:0,psi:0,vx:0,vz:spd,r:0,delta:del,thr:0.3,brk:0,hb:0,gear:3,rev:false,rpm:900,shiftT:0,ax:0,d:0};
 for(let t=0;t<3;t+=1/240){stepCar(k,1/240,{abs:true,tcs:true,stm:false})}
 const u=k.u,r=k.r;console.log('v',spd,'del',del,'-> u',u.toFixed(1),'w',k.w.toFixed(2),'r',r.toFixed(3),'kin',(u*Math.tan(del)/2.65).toFixed(3),'ay',(u*r).toFixed(1),'psi',k.psi.toFixed(2))}
