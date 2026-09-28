const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('console',m=>{if(m.text().startsWith('QP'))console.log(m.text())});p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#spellbound');await p.waitForFunction(()=>window.__WZ,null,{timeout:60000});await p.waitForTimeout(1000);
const r=await p.evaluate(async()=>{const N=__WZ,K=N.K,log=[];const sl=ms=>new Promise(r=>setTimeout(r,ms));try{N.DUEL.speed=.02;K.scene.visible=false;
 [...document.querySelectorAll('.bk-menu .bk-btn.pri')].pop().click();await sl(100);console.log('QP start');log.push('started '+N.started()+' school '+N.ME.school+' deck '+N.ME.deck.length);
 const talk=k=>{N.talk(N.NPCS.find(n=>n.key===k));[...document.querySelectorAll('.bk-menu .bk-btn.pri')].pop().click()};talk('head');await sl(50);talk('prof_'+N.ME.school);await sl(50);log.push(JSON.stringify(N.tick()));
 const fight=async(pred)=>{const m=N.MOBS.find(m=>!m.dead&&pred(m));if(!m)return 'nomob';N.ME.hp=99999;N.PPOS.copy(m.pos).add(new K.V3(1,0,1));N.DUEL.cool=0;N.sim(2);if(!N.DUEL.on)return 'noduel';let g=0;while(N.DUEL.on&&g++<60){N.DUEL.me.hp=N.DUEL.me.max;const hi=N.DUEL.hand.findIndex(s=>{const S=K&&window.__WZ&&0;return true});const aff=N.DUEL.hand.map((s,i)=>i).filter(i=>{const S=N.__sp?0:0;return true});console.log('QP turn '+g+' '+(performance.now()/1000|0));await N.playerTurn(null);N.DUEL.ents.forEach(e=>{e.hp-=150;});if(N.DUEL.ents.every(e=>e.hp<=0)){N.DUEL.ents.forEach(e=>e.dead=true);N.endDuel('win')}await sl(20)}return 'rounds '+g};
 for(let i=0;i<14&&N.ME.q<15;i++){const q=N.ME.q;const Q=[null];let res='';const qq=['','','lostsoul','darkfairy','rattlebones','','pirate','wraith','blackrib','firecat','scorch','','shade','warden'][q];if(q===5||q===11||q===14){talk('head');await sl(50);continue}
   for(let t=0;t<12&&N.ME.q===q;t++){res=await fight(m=>m.k===qq);await sl(2000)}log.push('q'+q+' '+qq+' -> q'+N.ME.q+' lvl '+N.ME.lvl+' '+res);console.log('QP '+log[log.length-1]+' t='+(performance.now()/1000|0))}
 // real duel test with actual cards
 const m=N.MOBS.find(m=>!m.dead&&m.k==='lostsoul')||N.MOBS[0];m.dead=false;N.PPOS.copy(m.pos).add(new K.V3(1,0,1));N.DUEL.cool=0;N.sim(2);let g=0;while(N.DUEL.on&&g++<30){const i=N.DUEL.hand.findIndex(s=>1);await N.playerTurn(i>=0?0:null,N.DUEL.ents.find(e=>!e.dead));await sl(30)}log.push('real duel rounds '+g+' on '+N.DUEL.on+' '+JSON.stringify(N.tick()))
 }catch(e){log.push('ERR '+e.message+' '+e.stack.split('\n')[1])}return log});
console.log(r.join('\n'));console.log(errs.join('\n')||'no errors');await b.close()})();
