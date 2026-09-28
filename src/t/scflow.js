const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#contract');await p.waitForFunction(()=>window.__SC,null,{timeout:60000});await p.waitForTimeout(1000);
const r=await p.evaluate(async(LVI)=>{const N=__SC,K=N.K,log=[];const V=K.V3;const run=n=>N.sim(n);const at=(i,j)=>N.tw(i,j);
 const process_trs=0;try{K.menuOff();N.startLevel(LVI);N.P.god=1;run(5);const L=N.LV;
  // validate data
  const bad=[];const chk=(nm,i,j)=>{const q=N.tw(i,j);const cl=N.cellAt(q.x,q.z);if(!cl||cl.wall||cl.z==='water')bad.push(nm+' '+i+','+j)};L.targets.forEach(t=>t.route.forEach(r=>chk(t.name,r[0],r[1])));L.guards.forEach(g=>(g.route||[g.post]).forEach(r=>chk('guard',r[0],r[1])));L.staff.forEach(s=>(s.route||[s.post]).forEach(r=>chk(s.kind,r[0],r[1])));L.guests.forEach(g=>chk('guest',g[0],g[1]));L.items.forEach(i=>chk(i[0],i[1],i[2]));L.hides.forEach(h=>chk(h[2],h[0],h[1]));L.exits.forEach(e=>chk(e[2],e[0],e[1]));L.ops.forEach(o=>{chk(o.k,o.at[0],o.at[1]);if(o.panel)chk('panel',o.panel[0],o.panel[1])});chk('start',L.start[0],L.start[1]);log.push('bad: '+bad.join(' | '));
  // reachability via astar from start to each op
  const s0=N.tw(...L.start);L.ops.forEach(o=>{const q=N.tw(...(o.panel||o.at));const pth=K.astar(s0.x,s0.z,q.x,q.z,20000);log.push(o.k+' path '+(pth?pth.length:'NONE'))});
  // trespass test: teleport into a staff room in suit
  if(process_trs){const room=L.rooms.find(r=>r[4]==='staff');N.P.pos.copy(N.tw((room[0]+room[2])>>1,(room[1]+room[3])>>1));run(90);log.push('trespass: allowed '+N.allowed()+' '+JSON.stringify(N.tick()))}
  // disguise: KO a staff npc
  const w=N.NPCS.find(n=>n.role==='civ'&&n.kind!=='guest');N.koNPC(w);N.P.pos.copy(w.pos).add(new V(.8,0,0));run(3);let a=N.findAction();log.push('action: '+(a&&a.text));if(a)a.fn();run(40);log.push('outfit '+N.P.outfit+' allowed '+N.allowed());w.hidden=true;w.ch.g.visible=false;log.push('spotted? '+N.P.spotted);
  // kill targets through ops
  const tg=N.NPCS.filter(n=>n.role==='target');for(const op of N.OPS){if(op.k==='poison'){N.P.inv.poison=1;N.P.pos.copy(op.p).add(new V(.6,0,0));run(3);a=N.findAction();log.push('poison action: '+(a&&a.text));if(a)a.fn();run(40);N.P.pos.copy(N.tw(...L.start))}}
  let t=0;for(;t<200&&tg.some(n=>!n.dead);t++){run(60);for(const op of N.OPS){if(op.done)continue;if(op.k==='chandelier'&&tg.some(n=>!n.dead&&n.pos.distanceTo(op.p)<1.6)){N.P.pos.copy(op.panelP).add(new V(.5,0,0));run(2);a=N.findAction();log.push('panel: '+(a&&a.text));if(a)a.fn();run(20);N.P.pos.copy(N.tw(...L.start))}if(op.k==='drown'||op.k==='push'){const x=tg.find(n=>!n.dead&&n.curAct===(op.k==='drown'?'sun':'smoke')&&n.pos.distanceTo(op.p)<2.4);if(x){N.P.pos.copy(x.pos).add(new V(-Math.sin(x.yaw)*1.2,0,-Math.cos(x.yaw)*1.2));run(2);a=N.findAction();log.push(op.k+': '+(a&&a.text));if(a)a.fn();run(40);N.P.pos.copy(N.tw(...L.start))}}if(op.k==='bell'){N.P.pos.copy(op.p);run(2);a=N.findAction();if(a&&a.text.startsWith('Snipe ')){log.push('bell: '+a.text);a.fn();run(5)}}}}
  log.push('after '+t+' mins-ish: '+tg.map(n=>n.name+(n.dead?' DEAD':' alive')+(n.accident?'(acc)':'')).join(', ')+' '+JSON.stringify(N.tick()));
  tg.forEach(n=>{if(!n.dead)N.killNPC(n,'wire',false)});const ex=N.tw(L.exits[0][0],L.exits[0][1]);N.P.pos.copy(ex);run(3);a=N.findAction();log.push('exit: '+(a&&a.text));if(a)a.fn();log.push('won '+N.P.won+' menu '+document.querySelector('.bk-menu').textContent.slice(0,120));
 }catch(e){log.push('ERR '+e.message+' '+e.stack.split('\n')[1])}return log},+(process.env.LVI||0));
console.log(r.join('\n'));console.log(errs.join('\n')||'no errors');await b.close()})();
