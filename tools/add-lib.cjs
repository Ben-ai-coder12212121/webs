// Adds a shared library <script> to a game page, before the game's own code. Usage: node tools/add-lib.cjs online games/<name>/index.html ...
const fs=require('fs');const lib=process.argv[2];
for(const f of process.argv.slice(3)){let s=fs.readFileSync(f,'utf8');const tag=`<script src="/js/lib/${lib}.js"></script>`;if(s.includes(tag))continue;
  const i=s.indexOf('<script>\n/* ====================');if(i<0){console.error('no game code marker in',f);continue}
  s=s.slice(0,i)+tag+'\n'+s.slice(i);fs.writeFileSync(f,s);console.log('added',lib,'to',f)}
