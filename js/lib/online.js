/* lib/online.js: play with friends online.
   Players' browsers connect directly to each other (WebRTC). The small Netlify function at /api/mp only
   helps them find each other with a room code, so a match costs a handful of function calls, not a server.
   The host's browser runs the game; guests send their moves/inputs and receive the game state.

   Online.host(game,{max,name})        -> link (role 'host'): link.code, link.peers, link.send(msg,peerId), link.broadcast(msg,{fast}), link.close()
   Online.join(game,code,{name})        -> link (role 'guest'): link.send(msg,{fast}), link.close()
   links emit: 'ready'(code) 'join'(peer) 'leave'(peer) 'msg'(msg,peer) 'open' 'close' 'error'(message)
   Online.lobby({root,game,title,max,minStart,onStart,onCancel}) -> shows the create/join panel; onStart(link) when a match is ready
   Online.button(text) -> a "🌐 Play online" button;  Online.inviteCode() -> room code from an invite link (?room=CODE), once */
const Online=(()=>{
  const API='/api/mp';
  const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]};
  const rid=()=>(Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/g,'').slice(0,16);
  async function api(method,body,q){const r=await fetch(API+(q||''),method==='GET'?{cache:'no-store'}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error==='no room'?'No room with that code. Check it and try again.':'Server error '+r.status);return j}
  function waitIce(pc,ms){return new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,ms||2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res()}})})}
  function emitter(o){const h={};o.on=(e,f)=>{(h[e]=h[e]||[]).push(f);return o};o.off=(e,f)=>{h[e]=(h[e]||[]).filter(x=>x!==f);return o};o.emit=(e,...a)=>{(h[e]||[]).slice().forEach(f=>{try{f(...a)}catch(er){console.error(er)}})};return o}
  const myName=()=>{let n='';try{n=S.get('lb_name','')}catch(e){}return n||('Player '+(100+Math.floor(Math.random()*900)))};
  const wire=(ch,fn)=>{ch.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(er){return}fn(m)}};
  const sendOn=(ch,m)=>{if(ch&&ch.readyState==='open'){try{ch.send(JSON.stringify(m));return true}catch(e){}}return false};

  function host(game,opts){opts=opts||{};const max=Math.max(2,opts.max||2);const L=emitter({role:'host',me:rid(),code:null,peers:new Map(),closed:false});
    let pollT=null,beatT=null;const pending=new Map();
    const beat=()=>api('POST',{op:'beat',game,room:L.code,peer:L.me,n:1+L.peers.size,open:L.peers.size<max-1&&!L.locked}).catch(()=>{});
    const setPolling=()=>{const want=!L.closed&&!L.locked&&L.peers.size<max-1;if(want&&!pollT)pollT=setInterval(poll,1300);if(!want&&pollT){clearInterval(pollT);pollT=null}};
    async function poll(){try{const r=await api('GET',null,'?room='+L.code+'&peer='+L.me);for(const{from,msg}of r.msgs){if(!msg)continue;if(msg.type==='join')await accept(from,msg.name);else if(msg.type==='answer'){const p=pending.get(from);if(p&&p.pc.signalingState!=='stable')await p.pc.setRemoteDescription(msg.sdp)}}}catch(e){}}
    async function accept(from,name){if(L.peers.has(from)||pending.has(from))return;if(L.locked||L.peers.size+pending.size>=max-1){api('POST',{op:'send',room:L.code,from:L.me,to:from,msg:{type:'full'}}).catch(()=>{});return}
      const pc=new RTCPeerConnection(ICE);const rl=pc.createDataChannel('r'),u=pc.createDataChannel('u',{ordered:false,maxRetransmits:0});
      const peer={id:from,name:String(name||'Player').replace(/[^A-Za-z0-9 _.\-']/g,'').slice(0,16)||'Player',pc,rl,u};pending.set(from,peer);
      const onM=m=>L.emit('msg',m,peer);wire(rl,onM);wire(u,onM);
      rl.onopen=()=>{pending.delete(from);L.peers.set(from,peer);L.emit('join',peer);beat();setPolling()};
      const gone=()=>{pending.delete(from);if(L.peers.delete(from)){L.emit('leave',peer);beat();setPolling()}};
      rl.onclose=gone;pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState))gone()};
      setTimeout(()=>{if(pending.get(from)===peer){pending.delete(from);try{pc.close()}catch(e){}}},30000);
      const off=await pc.createOffer();await pc.setLocalDescription(off);await waitIce(pc);await api('POST',{op:'send',room:L.code,from:L.me,to:from,msg:{type:'offer',sdp:pc.localDescription}})}
    L.send=(m,to,o)=>{const p=L.peers.get(to);if(!p)return false;return sendOn(o&&o.fast?p.u:p.rl,m)};
    L.broadcast=(m,o)=>{const s=JSON.stringify(m);for(const p of L.peers.values()){const ch=o&&o.fast?p.u:p.rl;if(ch.readyState==='open')try{ch.send(s)}catch(e){}}};
    L.lock=v=>{L.locked=v!==false;setPolling();beat()};
    L.close=()=>{if(L.closed)return;L.closed=true;clearInterval(pollT);clearInterval(beatT);pollT=null;if(L.code)api('POST',{op:'close',game,room:L.code,peer:L.me}).catch(()=>{});for(const p of[...L.peers.values(),...pending.values()])try{p.pc.close()}catch(e){}L.peers.clear();pending.clear();L.emit('close')};
    api('POST',{op:'host',game,peer:L.me,name:opts.name||myName(),max,mode:opts.mode||''}).then(r=>{if(L.closed)return;L.code=r.id;setPolling();beatT=setInterval(beat,8000);L.emit('ready',L.code)}).catch(e=>L.emit('error','Could not create a room: '+e.message));
    return L}

  function join(game,code,opts){opts=opts||{};code=String(code||'').toLowerCase().replace(/[^a-z0-9]/g,'');const L=emitter({role:'guest',me:rid(),code,closed:false,name:opts.name||myName()});let pollT=null,pc=null,rl=null,u=null,done=false;
    const fail=msg=>{if(done)return;done=true;clearInterval(pollT);try{pc&&pc.close()}catch(e){}L.emit('error',msg)};
    L.send=(m,o)=>sendOn(o&&o.fast?u:rl,m);
    L.close=()=>{if(L.closed)return;L.closed=true;clearInterval(pollT);try{pc&&pc.close()}catch(e){}L.emit('close')};
    (async()=>{let f;try{f=await api('POST',{op:'find',game,room:code})}catch(e){return fail(e.message)}
      L.hostName=f.name;await api('POST',{op:'send',room:code,from:L.me,to:f.host,msg:{type:'join',name:L.name}}).catch(()=>{});
      const to=setTimeout(()=>fail('Could not connect to your friend. One of your networks may block direct connections (common on school and work Wi-Fi). Try a different network.'),30000);
      pollT=setInterval(async()=>{try{const r=await api('GET',null,'?room='+code+'&peer='+L.me);for(const{msg}of r.msgs){if(!msg)continue;if(msg.type==='full'){clearTimeout(to);return fail('That room is full or the match already started.')}
          if(msg.type==='offer'&&!pc){pc=new RTCPeerConnection(ICE);pc.ondatachannel=e=>{const ch=e.channel;if(ch.label==='u')u=ch;else{rl=ch;ch.onopen=()=>{clearTimeout(to);clearInterval(pollT);done=true;L.emit('open')};ch.onclose=()=>{if(!L.closed){L.closed=true;L.emit('close')}}}wire(ch,m=>L.emit('msg',m))};
            pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState)&&done&&!L.closed){L.closed=true;L.emit('close')}};
            await pc.setRemoteDescription(msg.sdp);const ans=await pc.createAnswer();await pc.setLocalDescription(ans);await waitIce(pc);await api('POST',{op:'send',room:code,from:L.me,to:f.host,msg:{type:'answer',sdp:pc.localDescription}})}}}catch(e){}},1000)})();
    return L}

  /* ---------- the create / join panel ---------- */
  let invite=null;try{const q=new URLSearchParams(location.search).get('room');if(q)invite=q.toLowerCase().replace(/[^a-z0-9]/g,'')}catch(e){}
  const inviteCode=()=>{const c=invite;invite=null;try{if(c){const u=new URL(location.href);u.searchParams.delete('room');history.replaceState(null,'',u.pathname+u.search+u.hash)}}catch(e){}return c};
  function lobby(o){const max=o.max||2,minStart=o.minStart||(max===2?2:2);let link=null,started=false;
    const box=el('div',{class:'onl'});const card=el('div',{class:'onl-card'});box.append(card);(o.root||document.body).append(box);
    const close=()=>{box.remove();if(link&&!started)link.close();if(!started&&o.onCancel)o.onCancel()};
    const x=el('button',{type:'button',class:'onl-x','aria-label':'Close'},'✕');x.addEventListener('click',close);
    const start=()=>{if(started)return;started=true;box.remove();o.onStart(link)};
    function home(err){card.innerHTML='';card.append(x,el('h3',null,'🌐 Play online with friends'),el('p',{class:'onl-sub'},o.title||('Up to '+max+' players. One of you makes a room, everyone else joins with the code.')));
      if(err)card.append(el('p',{class:'onl-err'},err));
      const mk=el('button',{type:'button',class:'btn primary onl-big'},'Create a room');mk.addEventListener('click',hostView);
      const inp=el('input',{class:'onl-in',maxlength:'8',placeholder:'CODE',autocomplete:'off',spellcheck:'false','aria-label':'Room code'});['keydown','keyup','keypress'].forEach(ev=>inp.addEventListener(ev,e=>{e.stopPropagation();if(ev==='keydown'&&e.key==='Enter')jb.click()}));
      const jb=el('button',{type:'button',class:'btn onl-big'},'Join');jb.addEventListener('click',()=>{const c=inp.value.trim();if(c.length<4){inp.focus();return}joinView(c)});
      card.append(mk,el('div',{class:'onl-or'},'or join a friend'),el('div',{class:'onl-row'},inp,jb),el('p',{class:'onl-note'},'Players connect directly. Some school and work networks block this.'))}
    function hostView(){card.innerHTML='';const st=el('p',{class:'onl-st'},'Making a room…');card.append(x,el('h3',null,'🌐 Your room'),st);link=host(o.game,{max});
      const who=el('ul',{class:'onl-who'});const go=el('button',{type:'button',class:'btn primary onl-big',hidden:true},'Start the match');go.addEventListener('click',()=>{link.lock();start()});
      const upd=()=>{who.innerHTML='';who.append(el('li',null,'👑 You (host)'));for(const p of link.peers.values())who.append(el('li',null,'🎮 '+p.name));const n=1+link.peers.size;st.textContent=n>=max?'Everyone’s here!':max===2?'Waiting for your friend to join…':'Waiting for friends… ('+n+'/'+max+')';go.hidden=n<minStart||max===2};
      link.on('ready',code=>{const url=location.origin+location.pathname+'?room='+code;const cb=el('button',{type:'button',class:'btn onl-copy'},'📋 Copy invite link');cb.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);cb.textContent='✅ Copied!'}catch(e){cb.textContent=url}setTimeout(()=>cb.textContent='📋 Copy invite link',2500)});
        card.insertBefore(el('div',{class:'onl-code'},code.toUpperCase()),st);card.insertBefore(el('p',{class:'onl-sub'},'Tell your friend this code, or send them the link.'),st);card.insertBefore(cb,st);card.append(who,go);upd()});
      link.on('join',()=>{upd();if(max===2)start()});link.on('leave',upd);link.on('error',e=>{link=null;home(e)})}
    function joinView(code){card.innerHTML='';card.append(x,el('h3',null,'🌐 Joining '+code.toUpperCase()),el('p',{class:'onl-st'},'Connecting to your friend…'));link=join(o.game,code);link.on('open',start);link.on('error',e=>{link=null;home(e)})}
    if(o.code)joinView(o.code);else home();
    return {close}}
  function button(t){return el('button',{type:'button',class:'btn onl-btn'},t||'🌐 Play online')}
  /* two-player helper for turn-based and 1v1 games: a button, the lobby, invite links and leave handling.
     o: {game, onStart(role,friendName), onMsg(msg), onEnd(message), button}; role is 'host' (moves first) or 'guest' */
  function pair(o){let link=null;const P={active:false,role:null,friend:''};const btn=button(o.button||'🌐 Play a friend online');
    P.button=btn;P.send=m=>{if(!link)return false;return link.role==='host'?(link.broadcast(m),true):link.send(m)};
    const stop=msg=>{if(!P.active&&!link)return;const was=P.active;P.active=false;const l=link;link=null;btn.textContent=o.button||'🌐 Play a friend online';try{l&&l.close()}catch(e){}if(was&&o.onEnd)o.onEnd(msg)};
    const begin=l=>{link=l;P.active=true;P.role=l.role;P.friend=l.role==='host'?([...l.peers.values()][0]||{}).name||'Friend':(l.hostName||'Friend');btn.textContent='✕ Leave online game';
      l.on('msg',m=>{if(m&&m.__bye)return stop('Your friend left the game.');o.onMsg(m)});l.on('leave',()=>stop('Your friend left the game.'));l.on('close',()=>stop('The connection to your friend was lost.'));o.onStart(P.role,P.friend)};
    const open=code=>lobby({game:o.game,max:2,code,onStart:begin});P.open=open;
    btn.addEventListener('click',()=>{if(P.active){P.send({__bye:1});stop('You left the online game.')}else open()});
    const inv=inviteCode();if(inv)setTimeout(()=>open(inv),250);
    const watch=setInterval(()=>{if(!btn.isConnected){clearInterval(watch);if(P.active)P.send({__bye:1});stop()}},1500);
    P.leave=()=>{if(P.active)P.send({__bye:1});stop()};
    return P}
  (()=>{if(document.getElementById('onl-css'))return;const s=document.createElement('style');s.id='onl-css';s.textContent=`
.onl{position:fixed;inset:0;z-index:80;background:rgba(29,26,47,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.onl-card{position:relative;background:#FFFDF6;color:#1D1A2F;border:3px solid #1D1A2F;border-radius:18px;box-shadow:6px 6px 0 #1D1A2F;width:min(420px,100%);padding:20px 22px;text-align:center;font:600 15px/1.4 Figtree,system-ui,sans-serif}
.onl-card h3{margin:0 0 6px;font:400 26px 'Bagel Fat One',system-ui}.onl-sub{margin:4px 0 12px;color:#5A5470}.onl-note{margin:12px 0 0;font-size:12px;color:#8c86a3}
.onl-x{position:absolute;top:8px;right:10px;border:0;background:none;font-size:18px;cursor:pointer;color:#1D1A2F}
.onl-big{width:100%;font-size:17px;padding:12px}.onl-or{margin:14px 0 8px;font-size:13px;color:#8c86a3;text-transform:uppercase;letter-spacing:.08em}
.onl-row{display:flex;gap:8px}.onl-row .onl-big{width:auto;flex:0 0 auto}.onl-in{flex:1;min-width:0;border:3px solid #1D1A2F;border-radius:12px;padding:10px 12px;font:800 20px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.2em;text-align:center}
.onl-code{font:800 44px 'JetBrains Mono',monospace;letter-spacing:.18em;background:#FFD23F;border:3px solid #1D1A2F;border-radius:14px;padding:6px 10px;margin:6px 0}
.onl-copy{margin:0 0 10px}.onl-st{font-weight:800}.onl-err{background:#ffe1dc;border:2px solid #F2352A;border-radius:10px;padding:8px 10px;color:#8a1a10}
.onl-who{list-style:none;padding:0;margin:8px 0 12px;text-align:left}.onl-who li{padding:6px 10px;border:2px solid #1D1A2F;border-radius:10px;margin:5px 0;background:#fff}
.onl-btn{background:#7FC8F8}
.onl-tag{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:30;background:rgba(29,26,47,.85);color:#fff;font:800 13px Figtree,system-ui,sans-serif;padding:5px 12px;border-radius:99px;pointer-events:none}`;document.head.append(s)})();
  /* party helper for games where the host's browser runs everything (.io arenas, races):
     o: {game, max, button, onStart(role, info), onJoin(peer), onLeave(peer), onInput(peer,input), onAct(peer,action), onSnap(snapshot), onEnd(message)}
     host: P.snapTo(peer, snapshot) per player, P.everyone(msg); guest: P.input(obj) (sent ~20×/s, latest wins), P.act(obj) (reliable), P.myId */
  function party(o){let link=null,inT=0,lastIn=null;const P={active:false,role:null,myId:null,friends:[]};const label=o.button||'🌐 Play with friends online';const btn=button(label);P.button=btn;
    const stop=msg=>{if(!P.active&&!link)return;const was=P.active;P.active=false;const l=link;link=null;btn.textContent=label;clearInterval(inT);try{l&&l.close()}catch(e){}if(was&&o.onEnd)o.onEnd(msg||'')};
    const begin=l=>{link=l;P.active=true;P.role=l.role;P.myId=l.role==='host'?'h':l.me;btn.textContent='✕ Leave online game';
      if(l.role==='host'){P.friends=[...l.peers.values()];l.on('msg',(m,peer)=>{if(!m)return;if(m.__bye){try{peer.pc.close()}catch(e){}return}if(m.i)o.onInput&&o.onInput(peer,m.i);if(m.a)o.onAct&&o.onAct(peer,m.a)});
        l.on('join',peer=>{P.friends=[...l.peers.values()];o.onJoin&&o.onJoin(peer)});l.on('leave',peer=>{P.friends=[...l.peers.values()];o.onLeave&&o.onLeave(peer)});l.on('close',()=>stop());l.lock(false);
        o.onStart('host',{friends:P.friends});P.friends.forEach(peer=>o.onJoin&&o.onJoin(peer))}
      else{l.on('msg',m=>{if(!m)return;if(m.__bye)return stop('The host ended the game.');if(m.s)o.onSnap&&o.onSnap(m.s);if(m.e&&o.onEvent)o.onEvent(m.e)});l.on('close',()=>stop('The connection to the host was lost.'));
        inT=setInterval(()=>{if(lastIn)l.send({i:lastIn},{fast:true})},50);o.onStart('guest',{host:l.hostName})}};
    P.snapTo=(peer,s)=>link&&link.send({s},peer.id,{fast:true});P.everyone=e=>link&&link.broadcast({e});
    P.input=i=>{lastIn=i};P.act=a=>link&&link.send({a});
    const open=code=>lobby({game:o.game,max:o.max||8,minStart:1,code,title:o.title||'Friends join your arena and replace bots. Start now: they can drop in any time.',onStart:begin});P.open=open;
    btn.addEventListener('click',()=>{if(P.active){try{link.role==='host'?link.broadcast({__bye:1}):link.send({__bye:1})}catch(e){}stop('You left the online game.')}else open()});
    const inv=inviteCode();if(inv)setTimeout(()=>open(inv),250);
    const watch=setInterval(()=>{if(!btn.isConnected){clearInterval(watch);try{link&&(link.role==='host'?link.broadcast({__bye:1}):link.send({__bye:1}))}catch(e){}stop()}},1500);
    return P}
  return {host,join,lobby,button,pair,party,inviteCode,api}})();
