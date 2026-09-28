const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\.|google|cdn/,r=>r.abort());
const U='http://localhost:8765/test.html';
const spot=async n=>{await p.click(`.esc-spot[aria-label="${n}"]`);await p.waitForTimeout(60)};
const right=async()=>{await p.click('.esc-nav.r');await p.waitForTimeout(40)};
const W=async n=>{for(let k=0;k<4;k++){const t=await p.$eval('.esc-wall',e=>e.textContent);if(t.includes('· '+(n+1)+'/'))return;await right()}};const item=async n=>{await p.click(`.esc-slot[aria-label="${n}"]`);await p.waitForTimeout(40)};
const msg=()=>p.$eval('.esc-msg',e=>e.textContent);
const dial=async(targets,syms)=>{const d=await p.$$('.esc-dial');for(let i=0;i<targets.length;i++){const cur=await d[i].$eval('div',e=>e.textContent);let k=(syms.indexOf(targets[i])-syms.indexOf(cur)+syms.length)%syms.length;for(let j=0;j<k;j++)await (await d[i].$('button')).click()}await p.click('.esc-card .btn.primary');await p.waitForTimeout(350)};
const won=async()=>!!(await p.$('.esc-win'));
const D='0123456789'.split(''),A='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Detention
await p.goto(U+'#esc_class');await p.waitForTimeout(700);await p.screenshot({path:__dirname+'/s/e1a.png'});
await W(3);await spot('Trash can');console.log('1',await msg());
await item('Crumpled note');await item('Crumpled note');await p.screenshot({path:__dirname+'/s/e1b.png'});await p.click('.esc-card .btn');
await W(2);await spot('Locker 2');await dial(['3','4','6'],D);await spot('Locker 2');console.log('2',await msg());
await W(1);await spot('Books');
for(const want of ['red','orange','yellow','green','blue','purple'].entries()){const [i,c]=want;const bs=await p.$$('.esc-books button');if(!bs.length)break;const labels=await Promise.all(bs.map(x=>x.getAttribute('aria-label')));const j=labels.indexOf(c+' book');if(j!==i){await bs[i].click();await p.waitForTimeout(40);const bs2=await p.$$('.esc-books button');await bs2[j].click();await p.waitForTimeout(60)}}
console.log('3',await msg());await p.screenshot({path:__dirname+'/s/e1c.png'});await spot('Panel');
await W(0);await item('Small brass key');await spot('Teacher’s drawer');await spot('Teacher’s drawer');console.log('4',await msg());
await item('UV flashlight');await item('Batteries');console.log('5',await msg());
await W(2);await item('Working UV light');await spot('Chalkboard');await p.screenshot({path:__dirname+'/s/e1d.png'});
await W(0);await spot('Door keypad');await dial(['1','0','2','5'],D);console.log('Detention won',await won());await p.screenshot({path:__dirname+'/s/e1e.png'});
// Lab
await p.goto('about:blank');await p.goto(U+'#esc_lab');await p.waitForTimeout(700);await p.screenshot({path:__dirname+'/s/e2a.png'});
await W(3);await spot('Fridge');await spot('Fridge');await W(1);await item('Sample slide');await spot('Microscope');await spot('Microscope');await p.screenshot({path:__dirname+'/s/e2b.png'});await p.click('.esc-card .btn');
await W(2);await spot('Computer');await dial(['G','E','N','E'],A);console.log('lab1',await msg());
await W(1);await spot('Safe');await dial(['3','1','4','2'],D);await spot('Safe');await spot('Safe');
await W(0);await item('Fuse');await spot('Fuse box');await spot('Door panel');for(const c of ['purple','green','orange'])await p.click(`.esc-pal button[aria-label="${c}"]`);await p.waitForTimeout(500);console.log('Lab won',await won());
// Tomb
await p.goto('about:blank');await p.goto(U+'#esc_tomb');await p.waitForTimeout(700);await p.screenshot({path:__dirname+'/s/e3a.png'});
await W(1);await spot('Torch');await W(3);await item('Unlit torch');await spot('Brazier');await p.screenshot({path:__dirname+'/s/e3b.png'});
await W(2);for(const j of ['falcon','human','jackal','baboon'])await spot('Canopic jar ('+j+')');console.log('tomb1',await msg());await spot('Bronze lever');await item('Bronze lever');await spot('Sarcophagus');await spot('Sarcophagus');await spot('Sarcophagus');await p.screenshot({path:__dirname+'/s/e3c.png'});
await W(0);await item('Golden scarab');await spot('Scarab socket');await spot('Symbol dials');await dial(['🪲','☀️','🐦','👁️'],['🪲','☀️','🐦','👁️','🌙']);console.log('Tomb won',await won());await p.screenshot({path:__dirname+'/s/e3d.png'});
console.log(errs.join('\n')||'no errors');await b.close()})();
