const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});p.on('pageerror',e=>console.log('ERR',e.message));await p.route(/fonts\.|google|cdn/,r=>r.abort());
await p.goto('http://localhost:8765/test.html#esc_class');await p.waitForTimeout(700);
const info=()=>p.evaluate(()=>{const n=document.querySelector('.esc-nav.r');const r=n.getBoundingClientRect();const e=document.elementFromPoint(r.x+20,r.y+30);return [e.className,e.getAttribute('aria-label'),Math.round(r.y),scrollY,document.querySelector('.esc-wall').textContent]});
for(let i=0;i<3;i++){await p.click('.esc-nav.r');console.log(await info())}
await p.click('.esc-spot[aria-label="Trash can"]');console.log(await info());await p.click('.esc-nav.r',{timeout:3000}).catch(e=>console.log('fail'));console.log(await info());await b.close()})();
