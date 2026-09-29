// Lists what each game page needs besides its own file. Usage: node deps.cjs <outDir> > GAMES.md
const fs=require('fs');const OUT=process.argv[2];
const cat=require('./catalog.json');const rep=require('./pages-report.json');
const lib=f=>fs.readFileSync(OUT+'/js/lib/'+f+'.js','utf8');
const core=fs.readFileSync(OUT+'/js/core.js','utf8');
const slugOf=u=>u;
const rows=[];
for(const [id,url,libs] of rep){
  const e=cat.find(x=>x.o.id===id);const p=OUT+url+'index.html';const h=fs.readFileSync(p,'utf8');
  const a=h.indexOf(': game code =====');const own=h.slice(a,h.indexOf('</script>',a));
  const txt=own+'\n'+(libs?libs.split(' ').filter(Boolean).map(lib).join('\n'):'');
  const need=[];
  if(/with3D|Stage3D|load3D|runShooter|THREE\./.test(txt))need.push('three.js (CDN)');
  if(/matter\.min\.js|Matter\./.test(txt)||/loadMatter|withMatter/.test(txt))need.push('Matter.js (CDN)');
  if(/d3-geo|topojson|loadGeo/.test(txt))need.push('map libraries (CDN)');
  const geo=[...new Set([...txt.matchAll(/geo\/([a-z]+\.json)/g)].map(m=>'geo/'+m[1]))];need.push(...geo);
  if(/hypeimg\//.test(txt))need.push('hypeimg/');
  if(/wikimedia|wikipedia/.test(txt))need.push('Wikipedia API');
  const art=[...new Set([...txt.matchAll(/'(tex|hdr|glb|chr):([A-Za-z0-9_]+)'/g)].map(m=>m[1]+':'+m[2]))];
  if(art.length)need.push('assets/ ('+art.length+' files)');
  rows.push({id,name:e.o.name,url,libs,need,hidden:url.includes('_hidden')});
}
const out=['# Game pages','','Every game is one file: `games/<name>/index.html`. It holds the game\'s own code (and any styles only it uses).','All pages also load `css/site.css`, `js/core.js`, `js/catalog.js` and `js/app.js`. The table lists what else each game needs.','','| Game | Page | Shared libraries (js/lib/) | Other files it loads |','|---|---|---|---|'];
for(const r of rows.filter(r=>!r.hidden))out.push(`| ${r.name} | \`${r.url}\` | ${r.libs||'none'} | ${r.need.join(', ')||'none'} |`);
out.push('','## Hidden games (not listed, not indexed)','','| Game | Page | Shared libraries | Other files |','|---|---|---|---|');
for(const r of rows.filter(r=>r.hidden))out.push(`| ${r.name} | \`${r.url}\` | ${r.libs||'none'} | ${r.need.join(', ')||'none'} |`);
console.log(out.join('\n'));
const s=rows.filter(r=>/^(hs_villain|hs_havoc|ph_buddy|2048)$/.test(r.id));console.error(s);
const ext=rows.filter(r=>r.need.some(n=>/geo\/|hypeimg|assets/.test(n))).map(r=>r.name+': '+r.need.filter(n=>/geo\/|hypeimg|assets/.test(n)).join(', '));console.error(ext.join('\n'));
