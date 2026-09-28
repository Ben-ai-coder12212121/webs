const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);await p.addInitScript(()=>{window.__GS_TEST=1});await p.goto('https://detour.test/#breach');await p.waitForFunction(()=>window.__TX,null,{timeout:60000});await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{const X=__TX;X.startLocal('solo');await new Promise(r=>setTimeout(r,3000));const me=X.me;if(!me)return 'no me '+X.state;me.inv[1]='awp';me.cur='awp';me.rel=0;const s0=me.scoped;document.dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));const s1=me.scoped;document.dispatchEvent(new KeyboardEvent('keyup',{key:'q'}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));const s2=me.scoped;return {state:X.state,s0,s1,s2}});
console.log(JSON.stringify(r));console.log(errs.join('\n')||'no errors');await b.close()})();
