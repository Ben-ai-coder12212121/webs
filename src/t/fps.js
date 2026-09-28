const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [,,file,...ids]=process.argv;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const id of ids){const p=await b.newPage({viewport:{width:1000,height:650}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+file+'?g='+id+'#'+id);await p.waitForTimeout(1800);const bt=await p.$('.ov3 .btn.primary');if(bt)await bt.click();await p.waitForTimeout(800);
await p.evaluate(()=>{const R=THREE.WebGLRenderer.prototype.render;THREE.WebGLRenderer.prototype.render=function(a,b){R.call(this,a,b);window.__lastR={calls:this.info.render.calls,tris:this.info.render.triangles,pr:this.getPixelRatio(),sh:this.shadowMap.enabled}}});
const r=await p.evaluate(()=>new Promise(res=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else res({fps:(n/3).toFixed(1),i:JSON.stringify(window.__lastR)})};requestAnimationFrame(f)}));
const info=await p.evaluate(()=>{let meshes=0;return document.querySelectorAll('canvas').length});
console.log(id.padEnd(12),'fps',r.fps,r.i,errs.length?errs[0]:'');await p.close()}await b.close()})();
