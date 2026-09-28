/* ================= WHERE AM I? Street View guessing game ================= */
const WAI_LOCS=/*WAI_LOCS*/[];
let waiLeaflet=null;
function waiLoadLeaflet(){if(window.L)return Promise.resolve();if(waiLeaflet)return waiLeaflet;waiLeaflet=new Promise((res,rej)=>{const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.append(css);const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';s.onload=()=>res();s.onerror=()=>{waiLeaflet=null;rej()};document.head.append(s)});return waiLeaflet}
function waiCss(){if(document.getElementById('wai-css'))return;const s=document.createElement('style');s.id='wai-css';s.textContent=`
.wai{width:min(100%,1100px);margin:0 auto;display:grid;gap:10px}
.wai-top{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-weight:800}
.wai-top .pill{background:#FFFDF6;border:3px solid #1D1A2F;border-radius:99px;padding:4px 12px}
.wai-stage{position:relative;height:min(68vh,620px);min-height:360px;border:4px solid #1D1A2F;border-radius:14px;overflow:hidden;background:#1D1A2F;box-shadow:6px 6px 0 #1D1A2F}
.wai-stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.wai-cover{position:absolute;left:0;top:0;width:300px;height:74px;background:linear-gradient(135deg,#FFD23F,#FF9F43);border-right:3px solid #1D1A2F;border-bottom:3px solid #1D1A2F;border-radius:0 0 16px 0;display:flex;align-items:center;gap:8px;padding:0 14px;font:900 18px Figtree,sans-serif;color:#1D1A2F;z-index:3}
.wai-cover small{display:block;font-weight:700;font-size:12px;opacity:.8}
.wai-map{position:absolute;right:12px;bottom:12px;width:280px;height:190px;border:3px solid #1D1A2F;border-radius:12px;overflow:hidden;z-index:4;opacity:.8;transition:width .2s,height .2s,opacity .2s;background:#aad3df;box-shadow:4px 4px 0 #1D1A2F}
.wai-map:hover,.wai-map.big{width:min(560px,70%);height:min(400px,72%);opacity:1}
.wai-map .leaflet-container{width:100%;height:100%;cursor:crosshair}
.wai-guess{position:absolute;right:12px;bottom:12px;z-index:5;transform:translateY(calc(100% + 8px))}
.wai-bar{display:flex;gap:10px;justify-content:flex-end;align-items:center;flex-wrap:wrap}
.wai-res{position:absolute;inset:0;z-index:6;display:grid;grid-template-rows:1fr auto;background:#1D1A2F}
.wai-res .rmap{min-height:0}
.wai-res .rmap .leaflet-container{width:100%;height:100%}
.wai-res .rinfo{background:#FFFDF6;border-top:4px solid #1D1A2F;padding:12px 16px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.wai-res .rinfo b{font-size:20px}
.wai-meter{height:14px;border:3px solid #1D1A2F;border-radius:99px;background:#e8e4da;overflow:hidden;min-width:160px;flex:1}
.wai-meter i{display:block;height:100%;background:linear-gradient(90deg,#F2352A,#FFD23F,#2BB673)}
.wai-start{display:grid;gap:10px;justify-items:center;text-align:center;padding:24px}
.wai-start .modes{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.wai-mob{display:none}
@media (max-width:700px){.wai-map{width:44%;height:34%;opacity:1}.wai-map:hover{width:44%;height:34%}.wai-map.big{width:calc(100% - 24px);height:62%}.wai-mob{display:inline-flex}.wai-cover{width:210px;height:64px;font-size:15px}}`;document.head.append(s)}
function waiDist(a,b){const R=6371,r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r;const h=Math.sin(dLa/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)))}
const waiPts=km=>km<.15?5000:Math.round(5000*Math.exp(-km/2000));
const waiKm=km=>km<1?Math.round(km*1000)+' m':km<100?km.toFixed(1)+' km':Math.round(km).toLocaleString()+' km';
function wherAmI(root,c){waiCss();const wrap=el('div',{class:'wai'});root.append(wrap);let alive=true,maps=[];
  const MODES=[['all','🌍 Whole world'],['am','🌎 Americas'],['eu','🏰 Europe'],['as','🌏 Asia & Oceania'],['af','🦒 Africa']];
  const tiles=()=>L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'});
  const pin=col=>L.divIcon({className:'',html:'<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:'+col+';border:3px solid #1D1A2F;transform:rotate(-45deg);box-shadow:2px 2px 0 #1D1A2F"></div>',iconSize:[22,22],iconAnchor:[11,22]});
  function killMaps(){maps.forEach(m=>{try{m.off();m.stop&&m.stop();m.remove()}catch(e){}});maps=[]}
  function menu(){killMaps();wrap.innerHTML='';const box=el('div',{class:'wai-start'});
    box.append(el('div',{style:'font-size:54px'},'🧭'),el('h2',{style:'margin:0'},'Where am I?'),el('p',{style:'max-width:560px;margin:0'},'You get dropped somewhere on Earth in Google Street View. Look around, walk down the road, read the signs, then drop a pin on the map where you think you are. 5 rounds, up to 5,000 points each.'));
    const m=el('div',{class:'modes'});MODES.forEach(([k,t],i)=>{const b=el('button',{class:'btn'+(i?'':' primary'),type:'button'},t);b.addEventListener('click',()=>{try{unlockAudio()}catch(e){}play(k)});m.append(b)});box.append(m);
    box.append(el('small',{style:'opacity:.75'},'Tip: drag to look around, click the arrows on the road to walk. Hover (or tap) the mini map to make it bigger.'));wrap.append(box)}
  function play(mode){const pool=WAI_LOCS.filter(l=>mode==='all'||l[4]===mode);const picks=[];const used=new Set(S.get('wai_recent',[]));let cand=pool.filter(l=>!used.has(l[0]));if(cand.length<5)cand=pool.slice();while(picks.length<5&&cand.length){const k=Math.floor(Math.random()*cand.length);picks.push(cand.splice(k,1)[0])}
    S.set('wai_recent',[...used,...picks.map(p=>p[0])].slice(-60));const results=[];let round=0;
    const top=el('div',{class:'wai-top'}),rLbl=el('span',{class:'pill'}),sLbl=el('span',{class:'pill'});top.append(rLbl,el('span',null,MODES.find(x=>x[0]===mode)[1]),sLbl);
    const stage=el('div',{class:'wai-stage'}),bar=el('div',{class:'wai-bar'});wrap.innerHTML='';wrap.append(top,stage,bar);
    const total=()=>results.reduce((a,r)=>a+r.pts,0);
    function next(){killMaps();if(round>=picks.length)return finish();const P=picks[round];let guess=null,gm=null;rLbl.textContent='Round '+(round+1)+' / '+picks.length;sLbl.textContent=total().toLocaleString()+' pts';stage.innerHTML='';bar.innerHTML='';
      const heading=Math.floor(Math.random()*360);const fr=el('iframe',{src:'https://maps.google.com/maps?q=&layer=c&cbll='+P[2]+','+P[3]+'&cbp=11,'+heading+',0,0,0&output=svembed',loading:'eager',referrerpolicy:'no-referrer-when-downgrade',title:'Street View'});
      const cover=el('div',{class:'wai-cover'},el('span',{style:'font-size:28px'},'📍'),el('div',null,'Where am I?',el('small',null,'Round '+(round+1)+' of '+picks.length)));
      const mapBox=el('div',{class:'wai-map'});stage.append(fr,cover,mapBox);
      const bigB=el('button',{class:'btn wai-mob',type:'button'},'🗺️ Bigger map'),reset=el('button',{class:'btn',type:'button',title:'Back to the start of this round'},'↩︎ Back to start'),go=el('button',{class:'btn primary',type:'button',disabled:''},'📍 Place a pin on the map');
      bigB.addEventListener('click',()=>{mapBox.classList.toggle('big');setTimeout(()=>{if(maps.includes(gm))gm.invalidateSize()},250)});reset.addEventListener('click',()=>{fr.src=fr.src});bar.append(bigB,reset,go);
      gm=L.map(mapBox,{worldCopyJump:true,zoomControl:true,attributionControl:true,fadeAnimation:false}).setView([20,0],1);tiles().addTo(gm);maps.push(gm);let mk=null;
      mapBox.addEventListener('transitionend',()=>{if(maps.includes(gm))gm.invalidateSize()});
      gm.on('click',e=>{guess=[e.latlng.lat,((e.latlng.lng+540)%360)-180];if(mk)mk.setLatLng(e.latlng);else mk=L.marker(e.latlng,{icon:pin('#F2352A')}).addTo(gm);go.disabled=false;go.textContent='✅ Guess!';beep(520,.05,'triangle')});
      go.addEventListener('click',()=>{if(!guess)return;const km=waiDist(guess,[P[2],P[3]]),pts=waiPts(km);results.push({P,guess,km,pts});reveal()});
      function reveal(){killMaps();const r=results[results.length-1];sLbl.textContent=total().toLocaleString()+' pts';bar.innerHTML='';
        const res=el('div',{class:'wai-res'}),rm=el('div',{class:'rmap'});const info=el('div',{class:'rinfo'});res.append(rm,info);stage.append(res);
        const m=L.map(rm,{worldCopyJump:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false});tiles().addTo(m);maps.push(m);const A=[P[2],P[3]];L.marker(A,{icon:pin('#2BB673')}).addTo(m).bindTooltip('📍 '+P[0]+', '+P[1],{permanent:true,direction:'top',offset:[0,-22]});L.marker(r.guess,{icon:pin('#F2352A')}).addTo(m);
        L.polyline([r.guess,A],{color:'#1D1A2F',weight:3,dashArray:'8 8'}).addTo(m);m.fitBounds(L.latLngBounds([r.guess,A]).pad(.35),{maxZoom:12});
        const meter=el('div',{class:'wai-meter'},el('i',{style:'width:'+(r.pts/50)+'%'}));const nx=el('button',{class:'btn primary',type:'button'},round+1<picks.length?'Next round →':'See results');nx.addEventListener('click',()=>{round++;next()});
        info.append(el('div',null,el('b',null,P[0]+', '+P[1]),el('div',null,'Your guess was '+waiKm(r.km)+' away')),meter,el('b',null,'+'+r.pts.toLocaleString()),nx);
        [440,550,660].slice(0,r.pts>4000?3:r.pts>2000?2:1).forEach((f,i)=>setTimeout(()=>beep(f,.12,'triangle'),i*90))}}
    function finish(){killMaps();const tot=total();const best=c.best(tot);stage.innerHTML='';bar.innerHTML='';rLbl.textContent='Finished!';sLbl.textContent=tot.toLocaleString()+' pts';
      const res=el('div',{class:'wai-res'}),rm=el('div',{class:'rmap'}),info=el('div',{class:'rinfo'});res.append(rm,info);stage.append(res);const m=L.map(rm,{worldCopyJump:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false});tiles().addTo(m);maps.push(m);const pts=[];
      results.forEach((r,i)=>{const A=[r.P[2],r.P[3]];L.marker(A,{icon:pin('#2BB673')}).addTo(m).bindTooltip((i+1)+'. '+r.P[0]);L.marker(r.guess,{icon:pin('#F2352A')}).addTo(m);L.polyline([r.guess,A],{color:'#1D1A2F',weight:2,dashArray:'6 6'}).addTo(m);pts.push(A,r.guess)});m.fitBounds(L.latLngBounds(pts).pad(.15));
      const verdict=tot>22000?'🏆 Human GPS':tot>16000?'🧭 World traveller':tot>10000?'🗺️ Decent explorer':tot>5000?'🧳 Tourist':'😵 Totally lost';
      const again=el('button',{class:'btn primary',type:'button'},'Play again');again.addEventListener('click',()=>play(mode));const other=el('button',{class:'btn',type:'button'},'Change region');other.addEventListener('click',menu);
      info.append(el('div',null,el('b',null,verdict),el('div',null,results.map((r,i)=>(i+1)+'. '+r.P[0]+' · '+waiKm(r.km)+' · '+r.pts.toLocaleString()).join('   '))),el('b',null,tot.toLocaleString()+' / 25,000 · best '+Number(best).toLocaleString()),again,other);
      [523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.2,'triangle'),i*120))}
    next()}
  const ld=el('p',{class:'hint'},'Loading the world map…');wrap.append(ld);
  waiLoadLeaflet().then(()=>{if(alive)menu()}).catch(()=>{ld.textContent='Couldn’t load the map. Check your internet connection and reopen the game.'});
  c.stat('Street View · '+WAI_LOCS.length+' places');return()=>{alive=false;killMaps()}}
G.push({id:'geo_wai',name:'Where Am I?',kind:'geo',wide:true,tint:'#7FC8F8',blurb:'Dropped somewhere on Earth in real Google Street View. Look around, walk the roads, read the signs and pin where you think you are. Like GeoGuessr, free.',fmt:b=>Number(b).toLocaleString()+' pts',
art:'<rect width="120" height="72" fill="#7FC8F8"/><rect y="44" width="120" height="28" fill="#8c9a6a"/><path d="M40 72L56 44h8l16 28z" fill="#5A5470"/><path d="M60 50v6M60 62v8" stroke="#FFD23F" stroke-width="2.5"/><rect x="8" y="22" width="18" height="22" fill="#e8e1d0" stroke="#1D1A2F" stroke-width="2"/><rect x="92" y="16" width="20" height="28" fill="#f2c6a8" stroke="#1D1A2F" stroke-width="2"/><rect x="74" y="6" width="42" height="30" rx="4" fill="#FFFDF6" stroke="#1D1A2F" stroke-width="2.5"/><path d="M80 28q6-14 12-4t12-8" fill="none" stroke="#2BB673" stroke-width="3"/><path d="M95 20a5 5 0 1 1 10 0c0 5-5 9-5 9s-5-4-5-9z" fill="#F2352A" stroke="#1D1A2F" stroke-width="1.5"/><text x="30" y="20" font-size="16" font-weight="900" fill="#1D1A2F" font-family="Arial Black,Arial">?</text>',
run(root,c){return wherAmI(root,c)}});
