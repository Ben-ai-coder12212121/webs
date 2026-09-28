/* lib/info.js: code shared by several games (from src/heroes/info.js) */
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const pad2=n=>String(n).padStart(2,'0');
function bdayInput(c,onGo){const saved=S.get('bday','');const wrap=el('div',{class:'bdform'});const inp=el('input',{type:'date',class:'typein',value:saved,max:new Date().toISOString().slice(0,10),min:'1900-01-01','aria-label':'Your birthday'});const go=el('button',{class:'btn primary',type:'button'},'Go!');
  const run=()=>{if(!inp.value){inp.focus();return}S.set('bday',inp.value);onGo(new Date(inp.value+'T12:00:00'))};go.addEventListener('click',run);c.on(inp,'keydown',e=>{if(e.key==='Enter')run()});wrap.append(el('label',null,'Your birthday'),inp,go);if(saved)setTimeout(run,50);return wrap}
function infoCard(title,kids,col){return el('div',{class:'icard',style:col?'--c:'+col:''},el('h4',null,title),...kids)}
