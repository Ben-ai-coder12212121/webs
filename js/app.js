/* app.js: the game player (top bar, levels, leaderboards, full screen, random button) and the homepage grid */
const ALLG=G.slice();const PAGE=window.PAGE_GAME||null;const gameUrl=g=>(g.url||("/games/"+g.id+"/"));
const WIP_IDS=['neonharbor', 'hollow', 'contract', 'moonblade', 'ironpalm', 'spellbound'];
const WIP=G.filter(g=>WIP_IDS.includes(g.id));
WIP.forEach(g=>G.splice(G.indexOf(g),1));
const stage=$('#stage'),arena=$('#arena'),statEl=$('#stat'),grid=$('#grid');
let ctx=null,current=null;
function makeCtx(g){const ds=[];let alive=true;return{
  on(t,ev,fn,o){t.addEventListener(ev,fn,o);ds.push(()=>t.removeEventListener(ev,fn,o))},
  after(fn,ms){const i=setTimeout(()=>{if(alive)fn()},ms);ds.push(()=>clearTimeout(i));return i},
  loop(fn){let id,last=performance.now();const t=now=>{if(!alive)return;const dt=Math.min(40,now-last);last=now;fn(dt,now);id=requestAnimationFrame(t)};id=requestAnimationFrame(t);ds.push(()=>cancelAnimationFrame(id))},
  stat(t){statEl.textContent=t},
  level:g.levels?S.get('lvl_'+g.id,1):1,
  pick(a,b,c){return[a,b,c][this.level]},
  best(v,lower){const k=bestKey(g),b=S.get(k,null);if(v!=null&&(b==null||(lower?v<b:v>b))){S.set(k,v);try{LB.best(g,k,v,lower)}catch(e){}return v}return b},
  dispose(){alive=false;ds.forEach(f=>f())}}}
const LVN=['Easy','Normal','Hard'];
function bestKey(g){const l=g.levels?S.get('lvl_'+g.id,1):1;return'best_'+g.id+(l!==1?'_'+l:'')}
document.querySelectorAll('#lvl button').forEach(b=>b.addEventListener('click',()=>{if(!current)return;S.set('lvl_'+current.id,+b.dataset.l);beep(500,.05,'triangle');openGame(current)}));
const LB=(function(){const API='/api/lb',SKIP=new Set(['toy','chill','info','smash']),LVN2=['Easy','Normal','Hard'];let ok=null,cur=null,timer=null,pend={},shown=false;
  const btn=$('#lbBtn'),panel=el('div',{id:'lbPanel',hidden:true}),toastEl=el('div',{id:'lbToast'});document.body.append(panel,toastEl);
  const cid=()=>{let v=S.get('lb_id',null);if(!v||!/^[a-z0-9]{8,40}$/.test(v)){v=(Math.random().toString(36).slice(2)+Date.now().toString(36)).replace(/[^a-z0-9]/g,'').slice(0,24);S.set('lb_id',v)}return v};
  const eligible=g=>!!(g&&g.fmt&&!SKIP.has(g.kind)&&!g.noLb);
  const name=()=>S.get('lb_name','');
  async function probe(){if(ok!==null)return ok;if(location.protocol==='file:'){ok=false;return ok}try{const r=await fetch(API+'?probe=1',{cache:'no-store'});ok=r.ok&&(await r.json()).ok===true}catch(e){ok=false}return ok}
  let tT=0;function toast(t){toastEl.textContent=t;toastEl.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>toastEl.classList.remove('on'),4200)}
  async function send(k,g,v,lower,quiet){if(!await probe()||!name())return null;try{const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({game:k,name:name(),score:v,lower:!!lower,id:cid()})});if(!r.ok)return null;const j=await r.json();if(!quiet&&j.rank)toast('🏆 New best in '+g.name+'! You’re #'+j.rank+' of '+j.total+' on the leaderboard');if(cur&&cur.k===k&&!panel.hidden)refresh();return j}catch(e){return null}}
  function best(g,k,v,lower){if(!eligible(g))return;lower=!!(lower||g.lower);const p=pend[k]||(pend[k]={});clearTimeout(p.t);p.t=setTimeout(()=>{delete pend[k];if(!name()){if(ok!==false&&!shown){shown=true;probe().then(o=>{if(o)toast('🏆 New best! Tap the trophy to put it on the leaderboard')})}return}send(k,g,v,lower)},2500)}
  const ago=t=>{const s=Math.max(1,Math.round((Date.now()-t)/1000));return s<60?s+'s ago':s<3600?Math.round(s/60)+'m ago':s<86400?Math.round(s/3600)+'h ago':Math.round(s/86400)+'d ago'};
  function keyInfo(g){const k=bestKey(g);const l=g.levels?S.get('lvl_'+g.id,1):1;return{k,label:g.levels?LVN2[l]:''}}
  async function refresh(){if(!cur)return;const {g,k,label}=cur;try{const r=await fetch(API+'?game='+encodeURIComponent(k)+'&id='+cid(),{cache:'no-store'});const j=await r.json();if(!cur||cur.k!==k)return;render(j)}catch(e){panel.querySelector('.lbl').innerHTML='<p class="lbmuted">Couldn’t reach the leaderboard. Retrying…</p>'}}
  function render(j){const {g,label}=cur;const L=panel.querySelector('.lbl');const fmt=v=>{try{return g.fmt(v)}catch(e){return String(v)}};
    if(!j.top||!j.top.length){L.innerHTML='<p class="lbmuted">No scores yet. Be the first!</p>'}else L.innerHTML='<ol>'+j.top.map((e,i)=>'<li class="'+(e.me?'me':'')+'"><b>'+(i<3?['🥇','🥈','🥉'][i]:(i+1)+'.')+'</b><span class="lbn"></span><span class="s">'+fmt(e.s)+'</span><small>'+ago(e.t)+'</small></li>').join('')+'</ol>';
    L.querySelectorAll('li .lbn').forEach((s,i)=>{s.textContent=j.top[i].n});
    const you=panel.querySelector('.lbyou');const mine=S.get(cur.k,null);
    if(j.you)you.innerHTML='You: <b>#'+j.you.rank+'</b> of '+j.total+' · '+fmt(j.you.s);else if(!name())you.textContent='Set a name to join the leaderboard'+(mine!=null?' with your best: '+fmt(mine):'.');else if(mine!=null)you.textContent='Your best '+fmt(mine)+' is being submitted…';else you.textContent='Play to get on the board! '+j.total+' players so far.';
    panel.querySelector('.lblive').textContent='● Live · updated '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'})}
  function openPanel(){if(!current)return;const g=current;const ki=keyInfo(g);cur={g,...ki};
    panel.innerHTML='<div class="lbhead"><b>🏆 '+g.name+(ki.label?' · '+ki.label:'')+'</b><button class="btn lbx" type="button" aria-label="Close">✕</button></div><div class="lblive">● Live</div><div class="lbyou"></div><button class="btn lbshare" type="button">📣 Challenge a friend</button><div class="lbl"><p class="lbmuted">Loading…</p></div><div class="lbname"><label>Your leaderboard name <input maxlength="14" placeholder="Pick a nickname" autocomplete="off" spellcheck="false"></label><button class="btn primary lbsave" type="button">Save</button><p class="lbmuted">Nicknames only, please. It’s shown publicly next to your scores.</p></div>';
    const inp=panel.querySelector('input');inp.value=name();['keydown','keyup','keypress'].forEach(ev=>inp.addEventListener(ev,e=>e.stopPropagation()));
    panel.querySelector('.lbx').addEventListener('click',closePanel);panel.querySelector('.lbshare').addEventListener('click',()=>share(g));panel.querySelector('.lbsave').addEventListener('click',()=>{const n=inp.value.replace(/[^A-Za-z0-9 _.\-]/g,'').trim().slice(0,14);if(n.length<2){inp.focus();toast('Names need at least 2 letters or numbers');return}const first=!name();S.set('lb_name',n);toast(first?'🏆 Welcome, '+n+'! Uploading your best scores…':'Name updated to '+n);syncAll(first?null:cur.k)});
    panel.hidden=false;if(document.pointerLockElement)document.exitPointerLock();refresh();clearInterval(timer);timer=setInterval(()=>{if(!document.hidden)refresh()},8000)}
  function closePanel(){panel.hidden=true;clearInterval(timer);timer=null;cur=null}
  async function syncAll(only){const jobs=[];G.forEach(g=>{if(!eligible(g))return;const lv=g.levels?[0,1,2]:[1];lv.forEach(l=>{const k='best_'+g.id+(l!==1?'_'+l:'');if(only&&k!==only)return;const v=S.get(k,null);if(v!=null&&Number.isFinite(+v))jobs.push([k,g,+v,!!g.lower])})});
    let i=0;const worker=async()=>{while(i<jobs.length){const j=jobs[i++];await send(j[0],j[1],j[2],j[3],true)}};await Promise.all([worker(),worker(),worker(),worker()]);if(cur)refresh()}
  const slug=n=>String(n).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  async function share(g){const v=S.get(bestKey(g),null);let sc='';try{sc=v!=null?g.fmt(v):''}catch(e){}const url=location.origin+'/games/'+slug(g.name)+'/';const text=sc?'I got '+sc+' in '+g.name+' on Detourr. Can you beat me? 🏆':'Come play '+g.name+' with me on Detourr! 🎮';
    try{if(navigator.share){await navigator.share({title:g.name+' · Detourr',text,url});return}}catch(e){if(e&&e.name==='AbortError')return}
    try{await navigator.clipboard.writeText(text+' '+url);toast('🔗 Link copied! Paste it to a friend')}catch(e){toast(url)}}
  btn.addEventListener('click',()=>panel.hidden?openPanel():closePanel());
  function open(g){closePanel();btn.hidden=true;if(!eligible(g))return;probe().then(o=>{if(o&&current===g)btn.hidden=false})}
  return{best,open,close:()=>{closePanel();btn.hidden=true},eligible,probe}})();
const DOC_TITLE=document.title;
function openGame(g){if(g.id!==PAGE){location.href=gameUrl(g);return}setTimeout(()=>{try{rotCheck()}catch(e){}},700);if(ctx){ctx.dispose();if(ctx.extra)ctx.extra()}current=g;arena.innerHTML='';arena.classList.toggle('wide',!!g.wide);statEl.textContent='';$('#stTitle').textContent=g.name;stage.hidden=false;document.body.style.overflow='hidden';const lv=$('#lvl');lv.hidden=!g.levels;if(g.levels){const l=S.get('lvl_'+g.id,1);lv.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.l===l))}stage.scrollTop=0;
  ctx=makeCtx(g);try{HIST.open(g)}catch(e){}try{document.title=g.name+' · Play free on Detourr'}catch(e){}try{LB.open(g)}catch(e){}const r=g.run(arena,ctx);if(typeof r==='function')ctx.extra=r;if(fsEl()){setTimeout(fsFit,60);setTimeout(fsFit,1500)}}
function closeGame(){if(PAGE){location.href='/';return}try{HIST.close()}catch(e){}try{LB.close()}catch(e){}try{document.title=DOC_TITLE}catch(e){}try{if(fsEl())fsExit()}catch(e){}try{rotq.classList.remove('on');rotSkip=false}catch(e){}if(ctx){ctx.dispose();if(ctx.extra)ctx.extra();ctx=null}current=null;arena.innerHTML='';stage.hidden=true;document.body.style.overflow='';renderGrid();try{history.replaceState(null,'',location.pathname)}catch(e){}}
const isBig=g=>g.big!=null?g.big:(g.kind==='hero'||g.kind==='shooter'||/with3D|runShooter/.test(String(g.run)));
let rndMode=S.get('rndMode','all');
function syncRnd(){document.querySelectorAll('#rndMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===rndMode));$('#rndPlate').textContent=rndMode==='simple'?'Random simple game':rndMode==='big'?'Random big game':'Random game (anything)'}
document.querySelectorAll('#rndMode button').forEach(b=>b.addEventListener('click',()=>{rndMode=b.dataset.m;S.set('rndMode',rndMode);beep(500,.05,'triangle');syncRnd()}));
syncRnd();
function rnd01(){try{const u=new Uint32Array(1);crypto.getRandomValues(u);return u[0]/4294967296}catch(e){return Math.random()}}
function surprise(){const MAJOR=new Set(['openroad','apexgt','wanted','zsurv','stillshot','fishing','flightsim','skyfront','rumble','breach','royale','e3_study','e3_sub','e3_cabin','kart','octagon','jetpack','sim_farm','sim_town','geo_wai']);const isMajor=g=>g.major||g.kind==='hero'||MAJOR.has(g.id);let pool=G.filter(g=>g!==current&&(rndMode==='all'||(rndMode==='big'?isMajor(g):!isBig(g)))&&poolOK(g));if(!pool.length)pool=G.filter(g=>g!==current&&poolOK(g));if(!pool.length)pool=G.filter(g=>g!==current);let seen=S.get('rndSeen',[]);const keep=Math.floor(pool.length*.6);let fresh=pool.filter(g=>!seen.includes(g.id));if(!fresh.length){seen=[];fresh=pool}const g=fresh[Math.floor(rnd01()*fresh.length)];seen.push(g.id);if(seen.length>keep)seen=seen.slice(-keep);S.set('rndSeen',seen);spinTo(g)}
$('#back').addEventListener('click',closeGame);
$('#again').addEventListener('click',surprise);
const fsBtn=$('#fs'),fsApi=()=>document.fullscreenElement||document.webkitFullscreenElement||null,fsEl=()=>fsApi()||(stage.classList.contains('pfs')?stage:null);
const coarse=(()=>{try{return matchMedia('(pointer:coarse)').matches}catch(e){return false}})();
fsBtn.hidden=!(document.fullscreenEnabled||document.webkitFullscreenEnabled||coarse);
function fsFit(){const on=fsEl()===stage;if(!on)stage.classList.remove('pfs');const g3=!!arena.querySelector('.g3');stage.classList.toggle('fs',on);stage.classList.toggle('fs3',on&&g3);fsBtn.innerHTML=on?'✕<span class="t"> Exit full screen</span>':'⛶<span class="t"> Full screen</span>';fsBtn.title=on?'Exit full screen':'Full screen';stage.style.setProperty('--sbh',stage.querySelector('.sbar').offsetHeight+'px');
  arena.querySelectorAll('canvas[data-fsw]').forEach(cv=>{cv.style.width=cv.dataset.fsw;cv.style.maxWidth=cv.dataset.fsm;delete cv.dataset.fsw;delete cv.dataset.fsm});arena.style.zoom='';arena.style.maxWidth='';if(!on||g3)return;
  let cv=null,best=0;arena.querySelectorAll('canvas').forEach(q=>{const a=q.offsetWidth*q.offsetHeight;if(a>best&&!q.closest('.g3')){best=a;cv=q}});if(!cv||!cv.width||!cv.height)return fitZoom();
  const other=arena.offsetHeight-cv.offsetHeight,availH=window.innerHeight-stage.querySelector('.sbar').offsetHeight-other,w=Math.max(200,Math.min(window.innerWidth-24,availH*cv.offsetWidth/cv.offsetHeight));cv.dataset.fsw=cv.style.width;cv.dataset.fsm=cv.style.maxWidth;cv.style.width=w+'px';cv.style.maxWidth='none';
  /* anything still hanging off the bottom (padding, controls under the canvas): shrink the canvas until it fits */
  const over=stage.scrollHeight-stage.clientHeight;if(over>0&&cv.offsetHeight)cv.style.width=Math.max(200,w-over*cv.offsetWidth/cv.offsetHeight-2)+'px';fitZoom()}
/* games built from page elements (not one canvas): scale the whole game down until it fits the screen */
function fitZoom(){let over=stage.scrollHeight-stage.clientHeight;if(over<=2||arena.querySelector('[data-nofit]'))return;
  /* grids of square pads grow with the width: narrow the game first, then scale if it still doesn't fit */
  for(let k=0;k<3&&over>2;k++){const prevW=arena.style.maxWidth,prev=over;arena.style.maxWidth=Math.max(360,arena.offsetWidth*stage.clientHeight/stage.scrollHeight)+'px';over=stage.scrollHeight-stage.clientHeight;if(over>=prev){arena.style.maxWidth=prevW;over=prev;break}}if(over<=2)return;arena.style.zoom=Math.max(.5,stage.clientHeight/stage.scrollHeight*.99);const o2=stage.scrollHeight-stage.clientHeight;if(o2>2&&parseFloat(arena.style.zoom)>.5)arena.style.zoom=Math.max(.5,parseFloat(arena.style.zoom)*stage.clientHeight/stage.scrollHeight)}
function fsEnter(){const rf=stage.requestFullscreen||stage.webkitRequestFullscreen;let ok=false;if(rf&&(document.fullscreenEnabled||document.webkitFullscreenEnabled)){try{const r=rf.call(stage,{navigationUI:'hide'});ok=true;const lock=()=>{try{const o=screen.orientation;if(o&&o.lock&&current&&(current.wide||arena.querySelector('.g3')))o.lock('landscape').catch(()=>{})}catch(e){}};if(r&&r.then)r.then(lock).catch(()=>{stage.classList.add('pfs');fsFit()});else lock()}catch(e){ok=false}}if(!ok){stage.classList.add('pfs');setTimeout(()=>{window.scrollTo(0,1);fsFit()},50)}}
function fsExit(){if(stage.classList.contains('pfs')){stage.classList.remove('pfs');fsFit();return}try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}}
fsBtn.addEventListener('click',()=>{if(fsEl())fsExit();else fsEnter()});
const rotq=el('div',{class:'rotq'});
rotq.innerHTML='<div class="ph">📱</div><b>Turn your phone sideways</b><p>This game plays best in full screen, landscape.</p>';
const rqGo=el('button',{class:'btn',type:'button'},'⛶ Full screen');
const rqNo=el('button',{class:'lnk',type:'button'},'Keep playing like this');
rotq.append(rqGo,rqNo);
document.body.append(rotq);
rqGo.addEventListener('click',()=>{rotq.classList.remove('on');fsEnter()});
rqNo.addEventListener('click',()=>{rotq.classList.remove('on');rotSkip=true});
let rotSkip=false;
function rotCheck(){if(!coarse||stage.hidden||rotSkip){rotq.classList.remove('on');return}const portrait=window.innerHeight>window.innerWidth;const wide=current&&(current.wide||arena.querySelector('.g3'));rotq.classList.toggle('on',!!(portrait&&wide&&!fsEl()));if(!portrait)rotq.classList.remove('on')}
window.addEventListener('resize',()=>setTimeout(rotCheck,120));
window.addEventListener('orientationchange',()=>setTimeout(()=>{rotCheck();if(fsEl())fsFit()},300));
['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>setTimeout(fsFit,60)));
window.addEventListener('resize',()=>{if(fsEl())fsFit()});
const big=$('#bigBtn');
big.addEventListener('click',()=>{if(spinning)return;beep(160,.09,'square',.06);setTimeout(()=>beep(440,.1,'triangle',.06),70);setTimeout(()=>beep(880,.08,'triangle',.05),140);big.classList.remove('squish');void big.offsetWidth;big.classList.add('squish');setTimeout(()=>{big.classList.remove('squish');surprise()},300)});
let plcT=0;
document.addEventListener('pointerlockchange',()=>{plcT=performance.now()});
document.addEventListener('keydown',e=>{if(stage.hidden)return;if(e.key==='Escape'){if(fsEl()||document.pointerLockElement||performance.now()-plcT<600||arena.querySelector('.g3'))return;closeGame();return}const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea')return;if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault()});
let filter='all';
const PC_ONLY=new Set(['neonharbor','hollow','contract','moonblade','ironpalm','hs_speed','hs_flight','hs_strength','hs_size','hs_ice','hs_havoc','hs_villain','hs_kaiju','breach','royale','zsurv','stillshot','flightsim','skyfront','openroad','apexgt','typing']);
const mobileOK=g=>!PC_ONLY.has(g.id);
const isPhone=(()=>{try{return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<900}catch(e){return false}})();
let mobileMode=S.get('mobileMode',null);
if(mobileMode==null)mobileMode=isPhone;
const poolOK=g=>!mobileMode||mobileOK(g);
function syncMob(){document.querySelectorAll('.mobtog').forEach(b=>{b.classList.toggle('on',!!mobileMode);b.setAttribute('aria-pressed',mobileMode?'true':'false')})}
function setMobile(v){mobileMode=!!v;S.set('mobileMode',mobileMode);syncMob();renderGrid();if(typeof renderQuick==='function')try{renderQuick()}catch(e){}}
document.querySelectorAll('.mobtog').forEach(b=>b.addEventListener('click',()=>setMobile(!mobileMode)));
syncMob();
document.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.f;document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x===b));renderGrid()}));
const KIND={game:'Game',toy:'Toy',chill:'Chill',sports:'Sports',music:'Music',weird:'Weird',puzzle:'Puzzle',shooter:'3D Shooter',hero:'Superhero',smash:'Smash',geo:'Geography',info:'Cool Info',io:'.io',arcade:'Arcade',casual:'Casual',board:'Board & Classic',cooking:'Cooking',sim:'Simulators',escape:'Escape Room'};
let query='';
$('#search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderGrid()});
try{const q0=new URLSearchParams(location.search).get('q');if(q0){$('#search').value=q0;query=q0.trim().toLowerCase()}}catch(e){}
const HIST={get(){return S.get('hist',{})},open(g){this.close();const h=this.get();const e=h[g.id]||{n:0,s:0,t:0};e.n++;e.t=Date.now();h[g.id]=e;S.set('hist',h);this.cur={id:g.id,t0:Date.now()}},close(){if(!this.cur)return;const h=this.get();const e=h[this.cur.id];if(e){e.s=Math.min(36e5,(e.s||0)+Math.round((Date.now()-this.cur.t0)/1000));S.set('hist',h)}this.cur=null}};
const REC_POP=['hs_villain','hs_havoc','ph_buddy','hs_kaiju','stack','cook_pizza','sim_tractor','hs_speed','sim_town','snake','2048','io_blob'];
const STOPW=new Set('with your from that this into over they them then than what when where which while their there these those just more most very each every only also have like make made game games play free your you and the for are can but not all out get got its it’s it’s'.split(' '));
function recFeat(g){if(g._rf)return g._rf;const words=new Set((g.name+' '+g.blurb).toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOPW.has(w)));return g._rf={words,d3:/\b3d\b/i.test(g.blurb)||['hero','shooter'].includes(g.kind)||!!g.big}}
function recSim(a,b){const A=recFeat(a),B=recFeat(b);let inter=0;A.words.forEach(w=>{if(B.words.has(w))inter++});const jac=inter/Math.max(1,A.words.size+B.words.size-inter);return(a.kind===b.kind?3:0)+(A.d3&&B.d3?1.6:0)+jac*8}
function recommend(max){const h=HIST.get();const played=G.filter(g=>h[g.id]);if(!played.length)return REC_POP.map(id=>G.find(g=>g.id===id)).filter(Boolean).map(g=>({g,why:'Popular on Detourr'}));
  const w=g=>{const e=h[g.id];const days=(Date.now()-e.t)/864e5;return(Math.log(1+(e.s||0)/30)+.6*Math.min(e.n,6))*Math.pow(.85,Math.min(days,20))};
  const out=G.map(c=>{let sc=0,best=null,bv=0;played.forEach(p=>{if(p===c)return;const v=w(p)*recSim(p,c);sc+=v;if(v>bv){bv=v;best=p}});if(REC_POP.includes(c.id))sc*=1.15;if(['toy','info','chill'].includes(c.kind)&&!played.some(p=>p.kind===c.kind))sc*=.3;const e=h[c.id];if(e)sc*=e.n>=3?.25:.5;return{g:c,sc,why:e?(e.n>=3?'One of your favorites':'Pick up where you left off'):best?'Because you played '+best.name:'Popular on Detourr'}}).filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc);
  const pick=[],kinds={};for(const r of out){if(pick.length>=max)break;kinds[r.g.kind]=(kinds[r.g.kind]||0)+1;if(kinds[r.g.kind]>Math.ceil(max/3))continue;pick.push(r)}return pick}
const SUGG=(function(){const API='/api/ideas';let data=null,sort='top',kind='new',draft='',game='',msg='',msgBad=false,loading=false;
  const cid=()=>{let v=S.get('lb_id',null);if(!v||!/^[a-z0-9]{8,40}$/.test(v)){v=(Math.random().toString(36).slice(2)+Date.now().toString(36)).replace(/[^a-z0-9]/g,'').slice(0,24);S.set('lb_id',v)}return v};
  const ago=t=>{const s=(Date.now()-t)/1000;return s<60?'just now':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago'};
  async function load(){loading=true;try{const r=await fetch(API+'?id='+cid(),{cache:'no-store'});if(!r.ok)throw 0;data=await r.json()}catch(e){data={offline:true}}loading=false;if(filter==='ideas')render()}
  async function post(b){const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({id:cid()},b))});const j=await r.json().catch(()=>({error:'Something went wrong. Try again?'}));if(!r.ok||j.error)throw new Error(j.error||'Something went wrong. Try again?');data=j;return j}
  const stop=n=>['keydown','keyup','keypress'].forEach(ev=>n.addEventListener(ev,e=>e.stopPropagation()));
  function render(){if(filter!=='ideas')return;grid.innerHTML='';
    grid.append(el('div',{class:'sec ideasec'},el('h3',null,'💡 Suggest a game or an update'),el('span',null,'Tell us what to build next, or what to fix. Give the ideas you like a 👍: the most-liked ones get made first.')));
    const f=el('div',{class:'ideaform'});
    const seg=el('div',{class:'seg ideakind',role:'group','aria-label':'Kind of idea'});[['new','🎮 A new game'],['update','🛠️ Improve a game']].forEach(([k,t])=>{const b=el('button',{type:'button',class:kind===k?'on':''},t);b.addEventListener('click',()=>{kind=k;render()});seg.append(b)});
    const sel=el('select',{'aria-label':'Which game'});sel.append(el('option',{value:''},'Which game?'));[...G].sort((a,b)=>a.name.localeCompare(b.name)).forEach(g=>{const o=el('option',{value:g.name},g.name);if(g.name===game)o.selected=true;sel.append(o)});sel.hidden=kind!=='update';sel.addEventListener('change',()=>{game=sel.value});
    const ta=el('textarea',{maxlength:'240',rows:'3',placeholder:kind==='new'?'e.g. A zombie survival game where you build a fort at night':'e.g. Let Titan pick up and throw buses'});ta.value=draft;stop(ta);
    const cnt=el('small',{class:'ideacnt'},draft.length+'/240');ta.addEventListener('input',()=>{draft=ta.value;cnt.textContent=draft.length+'/240'});
    const send=el('button',{type:'button',class:'btn primary'},'Send idea');const m=el('p',{class:'ideamsg'+(msgBad?' bad':'')},msg);
    send.addEventListener('click',async()=>{const t=ta.value.trim();if(t.length<8){msg='Tell us a bit more (at least 8 characters).';msgBad=true;render();return}if(kind==='update'&&!game){msg='Pick which game to improve.';msgBad=true;render();return}
      send.disabled=true;send.textContent='Sending…';try{await post({op:'add',kind,game:kind==='update'?game:'',text:t});draft='';msg='🎉 Thanks! Your idea is on the board. Share it so people can vote for it.';msgBad=false;sort='new';beep(660,.12,'triangle');setTimeout(()=>beep(990,.15,'triangle'),110)}catch(e){msg=e.message;msgBad=true}render()});
    f.append(seg,sel,ta,el('div',{class:'ideabar'},cnt,send),m);grid.append(f);
    const hd=el('div',{class:'ideahd'},el('b',null,data&&data.total?data.total+' idea'+(data.total>1?'s':'')+' so far':'Ideas from players'));const s2=el('div',{class:'seg'});[['top','🔥 Most liked'],['new','🆕 Newest']].forEach(([k,t])=>{const b=el('button',{type:'button',class:sort===k?'on':''},t);b.addEventListener('click',()=>{sort=k;render()});s2.append(b)});hd.append(s2);grid.append(hd);
    const list=el('div',{class:'idealist'});grid.append(list);
    if(!data){list.append(el('p',{class:'lbmuted'},'Loading ideas…'));return}
    if(data.offline){list.append(el('p',{class:'lbmuted'},'Ideas can’t load right now. Check your connection and try again in a moment.'));return}
    const items=(sort==='top'?data.top:data.recent)||[];if(!items.length)list.append(el('p',{class:'lbmuted'},'No ideas yet. Be the first!'));
    items.forEach(it=>{const v=el('button',{type:'button',class:'ideav'+(it.me?' on':''),'aria-label':'Like this idea'},el('span',null,'👍'),el('b',null,String(it.v)));
      v.addEventListener('click',async()=>{if(v.disabled)return;v.disabled=true;it.me=!it.me;it.v+=it.me?1:-1;v.classList.toggle('on',it.me);v.querySelector('b').textContent=it.v;beep(it.me?700:400,.06,'triangle');try{await post({op:'vote',idea:it.i})}catch(e){}v.disabled=false});
      list.append(el('div',{class:'idea'},v,el('div',null,el('p',null,it.x),el('small',null,(it.k==='update'?'🛠️ Improve'+(it.g?' '+it.g:''):'🎮 New game')+' · '+ago(it.t)+(it.own?' · your idea':'')))))})}
  return{render,load}})();
function renderIdeas(){SUGG.render();SUGG.load()}
const DETOUR_EMO={hero:'🔥',shooter:'💥',smash:'💀',toy:'💀',sports:'🏆',music:'🎵',puzzle:'🧠',chill:'😌',info:'🤓',weird:'👀',cooking:'🍕',sim:'🚜',io:'🟢',geo:'🌍',board:'♟️'};
const detourEmo=g=>DETOUR_EMO[g.kind]||'🎮';
function updDetourrs(){const n=S.get('detours',0);const d=$('#dcount');if(d)d.textContent=n?'You’ve taken '+n+' detourr'+(n>1?'s':'')+'.':'Press it. You know you want to.'}
let spinning=false;
function spinTo(g){if(spinning)return;spinning=true;const n=S.get('detours',0)+1;S.set('detours',n);updDetourrs();
  const quick=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;const pool=G.filter(x=>x!==g&&x!==current&&poolOK(x));const seq=[];let prev=null;for(let i=0;i<(quick?2:15);i++){let x;do{x=pick(pool)}while(x===prev&&pool.length>1);seq.push(x);prev=x}seq.push(g);
  const ov=el('div',{class:'spin',role:'status','aria-live':'polite'});ov.innerHTML='<div class="spinbox"><div class="spinlbl">Detourr #'+n+'</div><div class="reel"><div class="pin"></div><div class="rcard"></div></div><div class="spinsub">Spinning…</div></div>';document.body.append(ov);
  const card=ov.querySelector('.rcard'),sub=ov.querySelector('.spinsub');
  const show=(x,land)=>{card.style.background=x.tint||'#fff';card.innerHTML='<svg viewBox="0 0 120 72" aria-hidden="true">'+(x.art||'')+'</svg><b></b>';card.querySelector('b').textContent=x.name;card.classList.remove('tick','land');void card.offsetWidth;card.classList.add(land?'land':'tick')};
  let i=0,done=false;const finish=()=>{if(done)return;done=true;ov.classList.add('out');setTimeout(()=>{ov.remove();spinning=false;openGame(g)},170)};
  const step=()=>{const x=seq[i],last=i===seq.length-1;show(x,last);
    if(last){beep(523,.12,'triangle',.07);setTimeout(()=>beep(784,.12,'triangle',.07),90);setTimeout(()=>beep(1046,.22,'triangle',.08),180);sub.textContent=detourEmo(g)+' '+(KIND[g.kind]||'Game')+'!';ov.classList.add('landed');setTimeout(finish,quick?250:800);return}
    beep(260+i*28,.035,'square',.03);i++;const t=i/seq.length;setTimeout(step,quick?60:45+Math.pow(t,3)*250)};
  ov.addEventListener('click',()=>{if(i<seq.length-1){i=seq.length-1}});step()}
updDetourrs();
function renderForYou(){const recs=recommend(40).filter(r=>poolOK(r.g)).slice(0,18);const h=HIST.get();const n=Object.keys(h).length;
  grid.append(el('div',{class:'sec fysec'},el('h3',null,'✨ Recommended for you'),el('span',null,n?'Picked from the '+n+' game'+(n>1?'s':'')+' you’ve played. The more you play, the better it gets.':'You haven’t played anything yet, so here are the favourites. Play a few and this tab learns what you like.')));
  recs.forEach(({g,why})=>{const t=el('a',{class:'tile',href:gameUrl(g)},el('div',{class:'art',style:'background:'+g.tint,html:'<svg viewBox="0 0 120 72" aria-hidden="true">'+g.art+'</svg>'}),el('div',{class:'txt'},el('small',{class:'why'},why),el('b',null,g.name),el('span',null,g.blurb),el('div',{class:'meta'},el('em',null,KIND[g.kind]||''),el('span',null,''))));grid.append(t)});
  if(n){const c=el('button',{class:'linkbtn fyclear',type:'button'},'Clear my play history');c.addEventListener('click',()=>{S.set('hist',{});renderGrid()});grid.append(el('div',{class:'sec'},c))}}
const QUICK_KINDS=['toy','info','weird','chill','game','casual','arcade','puzzle','geo','music','smash','io','escape'];
function renderQuick(){const pool=G.filter(g=>QUICK_KINDS.includes(g.kind)&&poolOK(g)&&!(typeof isBig==='function'&&isBig(g)&&g.kind!=='geo'));const w=g=>['toy','info','weird','chill'].includes(g.kind)?2.2:1;const pick2=[];const left=pool.slice();while(pick2.length<8&&left.length){let tot=left.reduce((a,g)=>a+w(g),0),r=Math.random()*tot,k=0;for(;k<left.length-1;k++){r-=w(left[k]);if(r<=0)break}pick2.push(left.splice(k,1)[0])}
  const sh=el('button',{class:'btn qshuf',type:'button'},'🔀 Shuffle');sh.addEventListener('click',()=>{beep(500,.05,'triangle');renderGrid()});
  grid.append(el('div',{class:'sec qsec'},el('h3',null,'⚡ Quick detourrs'),el('span',null,'Ten seconds to ten minutes: satisfying toys, weird little games, cool facts and quick brain-teasers. Hit shuffle for a new batch.'),sh));
  pick2.forEach(g=>{const t=el('a',{class:'tile qtile',href:gameUrl(g)},el('div',{class:'art',style:'background:'+g.tint,html:'<svg viewBox="0 0 120 72" aria-hidden="true">'+g.art+'</svg>'}),el('div',{class:'txt'},el('b',null,g.name),el('span',null,g.blurb),el('div',{class:'meta'},el('em',null,KIND[g.kind]||''),el('span',null,''))));grid.append(t)})}
(function(){let fast=null,fastT=0;document.addEventListener('pointerdown',e=>{try{if(typeof unlockAudio==='function')unlockAudio()}catch(er){}if(e.pointerType==='touch'||e.button!==0)return;const t=e.target.closest&&e.target.closest('#arena button');if(!t||t.disabled||t.closest('.no-fast'))return;fast=t;fastT=performance.now();t.click()},true);document.addEventListener('click',e=>{if(fast&&e.isTrusted&&performance.now()-fastT<1500&&(e.target===fast||fast.contains(e.target)||!fast.isConnected)){e.stopImmediatePropagation();e.preventDefault();fast=null}},true)})();
function renderGrid(){if(PAGE)return;grid.innerHTML='';if(filter==='foryou'&&!query){renderForYou();return}if(filter==='ideas'&&!query){renderIdeas();return}const list=(filter==='wip'?WIP:G).filter(g=>(filter==='all'||filter==='wip'||(filter==='simple'&&!isBig(g))||(filter==='big'&&isBig(g))||g.kind===filter||(g.tags||[]).includes(filter))&&(!query||(g.name+' '+g.blurb).toLowerCase().includes(query)));const all0=list.slice();list.splice(0,list.length,...all0.filter(poolOK));const hid=all0.length-list.length;if(hid){const b=el('button',{type:'button'},'Show all');b.addEventListener('click',()=>setMobile(false));grid.append(el('p',{class:'mobnote'},'📱 Mobile-friendly mode is on: '+hid+' game'+(hid>1?'s':'')+' that play best on a computer '+(hid>1?'are':'is')+' hidden. ',b))}
  if(!list.length)grid.append(el('p',{class:'empty'},'Nothing matches that. Try another word, or press the red button.'));
  const SEC=[['hero', 'Superheroes', 'Pick a power and wreck the city, comic-book style'], ['toy', 'Satisfying Toys', 'Things to poke, drag, pop and watch'], ['info', 'Cool Info', 'Facts, stats and mind-blowing numbers'], ['weird', 'Weird', 'Games that make no sense, in the best way'], ['game', 'Quick Games', 'Short bursts of fun'], ['casual', 'Casual & Friv', 'Quirky one-more-go games'], ['escape', 'Escape Rooms', 'Search every corner, crack the locks and break out'], ['geo', 'Geography', 'Street-level photos, maps, flags and capitals'], ['puzzle', 'Puzzles', 'Brain-benders, from sudoku to jigsaws'], ['io', '.io Games', 'Eat, grow and take over the map (with bots)'], ['smash', 'Smash & Physics', 'Wreck stuff, bonk buddies, smash screens'], ['music', 'Music', 'Make noise, find the beat, name the tune'], ['chill', 'Chill Stuff', 'Low-key ways to pass the time'], ['arcade', 'Arcade', 'Quick-reflex classics: bounce, dodge, dash and park'], ['board', 'Board & Classic', 'Chess, checkers, cards and four-in-a-row'], ['cooking', 'Cooking', 'Run a pizzeria, a burger bar and a cupcake café'], ['sim', 'Simulators', 'Farm, run a business, build a town'], ['sports', 'Sports', '3D games for every season'], ['shooter', '3D Shooters', 'Story missions in first and third person']];
  const grouped=(filter==='all'||filter==='simple'||filter==='big')&&!query;const TOP=['hs_villain','hs_havoc','ph_buddy','hs_kaiju','zsurv','stillshot','gunsim'];const isTop=g=>TOP.includes(g.id);const tops=TOP.map(id=>list.find(g=>g.id===id)).filter(Boolean);const order=grouped?[...tops,...SEC.flatMap(([k])=>list.filter(g=>g.kind===k&&!isTop(g)))]:[...tops,...list.filter(g=>!isTop(g))];let lastK=null;
  if(grouped)renderQuick();
  order.forEach(g=>{const gk=grouped&&isTop(g)?'top':g.kind;if(grouped&&gk==='top'&&lastK!=='top'){lastK='top';grid.append(el('div',{class:'sec topsec'},el('h3',null,'⭐ Big 3D games'),el('span',null,'When you want chaos: a giant monster rampage, villain mayhem, block-by-block city destruction and the ultimate stress buddy')))}else if(grouped&&gk!==lastK){lastK=gk;const sc=SEC.find(x=>x[0]===g.kind);const n=list.filter(x=>x.kind===g.kind&&!isTop(x)).length;grid.append(el('div',{class:'sec'},el('h3',null,sc[1]),el('span',null,n+' · '+sc[2])))}const best=S.get(bestKey(g),null);const lvl=g.levels?S.get('lvl_'+g.id,1):1;
  const t=el('a',{class:isTop(g)?'tile top':'tile',href:gameUrl(g)},isTop(g)?el('i',{class:'topb'},'⭐ TOP RATED 3D'):'',el('div',{class:'art',style:'background:'+g.tint,html:'<svg viewBox="0 0 120 72" aria-hidden="true">'+g.art+'</svg>'}),
    el('div',{class:'txt'},el('b',null,g.name),el('span',null,g.blurb),el('div',{class:'meta'},el('em',null,KIND[g.kind]),best!=null&&g.fmt?el('span',null,'Best: '+g.fmt(best)+(lvl!==1?' ('+LVN[lvl]+')':'')):el('span',null,g.levels?'Easy–Hard':''))));
  if(isPhone&&!mobileOK(g))t.append(el('i',{class:'pcbadge'},'💻 Best on computer'));grid.append(t)})}
const HIDDEN=new Set(['rps','monsterrush','skyrace','pebble','torchmaze','jelloreversi','ancient']);
for(let i=G.length-1;i>=0;i--)if(G[i].kind==='shooter'||HIDDEN.has(G[i].id))G.splice(i,1);
$('#count').textContent=G.length;
{const c2=$('#count2');if(c2)c2.textContent=G.length}
const about=$('#about');
$('#aboutBtn').addEventListener('click',()=>{about.hidden=false;document.body.style.overflow='hidden';$('#aboutClose').focus()});
const closeAbout=()=>{about.hidden=true;if(stage.hidden)document.body.style.overflow=''};
$('#aboutClose').addEventListener('click',closeAbout);
about.addEventListener('click',e=>{if(e.target===about)closeAbout()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!about.hidden)closeAbout()});
$('#imgCredits').addEventListener('click',()=>{const L=$('#imgList');if(!L.hidden){L.hidden=true;return}L.innerHTML='';(window.HYPE_CREDITS||[]).forEach(([t,f,a,l,u])=>{const p=el('p',null,el('b',null,t+': '),'“'+f+'” by '+a+', '+l+' ');p.append(el('a',{href:u,target:'_blank',rel:'noopener'},'(source)'));L.append(p)});if(!L.children.length)L.append(el('p',null,'No photos loaded.'));L.hidden=false});
renderGrid();
/* each game has its own page; old /#id links from before the split are sent there */
if(PAGE){const g=ALLG.find(x=>x.id===PAGE);if(g)openGame(g)}else{const h=(location.hash||'').slice(1);const old=h&&ALLG.find(g=>g.id===h);if(old)location.replace(gameUrl(old));addEventListener('hashchange',()=>{const g=ALLG.find(x=>x.id===location.hash.slice(1));if(g)location.replace(gameUrl(g))})}
