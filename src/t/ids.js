const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();await p.route(/fonts\.|cdn/,r=>r.abort());
await p.goto('file:///tmp/claude-0/-home-user-webs/78446037-9543-57ee-adbb-3cfd6f0dd372/scratchpad/srv/test.html');await p.waitForTimeout(800);
console.log((await p.evaluate(()=>window.__G.map(g=>g.id))).join('\n'));await b.close()})();
