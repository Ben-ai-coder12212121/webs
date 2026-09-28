const JELLY_LV=[
 ['#########','#.......#','#.......#','#..r....#','#.###.r.#','#########'],
 ['#########','#.......#','#.g...b.#','#.#...#.#','#.b...g.#','#########'],
 ['##########','#........#','#.r....r.#','#.##..##.#','#...rr...#','##########'],
 ['##########','#........#','#..g..b..#','#..#..#..#','#.b....g.#','#.##..##.#','##########'],
 ['###########','#.........#','#.r.....y.#','#.#.....#.#','#...y.r...#','#..###.##.#','###########'],
 ['###########','#.........#','#.b.g.b.g.#','#.#.#.#.#.#','#.........#','###########'],
 ['###########','#.........#','#..rg.....#','#..##..gr.#','#......##.#','#.........#','###########'],
 ['############','#..........#','#.y..b..y..#','#.#..#..#..#','#....b.....#','#.#.####.#.#','#..........#','############']];
function jellyParse(L){const H=L.length,W=L[0].length,g=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ch=L[y][x];g.push(ch==='#'?'#':ch==='.'?null:ch)}return{W,H,g}}
function jellyGroups(st){const{W,H,g}=st;const id=Array(W*H).fill(-1);let n=0;const groups=[];for(let i=0;i<W*H;i++){if(!g[i]||g[i]==='#'||id[i]>=0)continue;const col=g[i],cells=[],q=[i];id[i]=n;while(q.length){const k=q.pop();cells.push(k);for(const d of[1,-1,W,-W]){const j=k+d;if(j<0||j>=W*H||(d===1&&j%W===0)||(d===-1&&k%W===0))continue;if(g[j]===col&&id[j]<0){id[j]=n;q.push(j)}}}groups.push({col,cells});n++}return{id,groups}}
function jellySettle(st){const{W,H}=st;let moved=true;while(moved){moved=false;const{id,groups}=jellyGroups(st);for(let gi=0;gi<groups.length;gi++){const G2=groups[gi];if(G2.cells.every(k=>{const b=k+W;return b<W*H&&(st.g[b]===null||id[b]===gi)})){const col=G2.col;G2.cells.forEach(k=>st.g[k]=null);G2.cells.forEach(k=>st.g[k+W]=col);moved=true;break}}}return st}
function jellyMove(st,cell,dir){const{W}=st;const{id,groups}=jellyGroups(st);const gi=id[cell];if(gi<0)return null;const G2=groups[gi];if(!G2.cells.every(k=>{const j=k+dir;return st.g[j]===null||id[j]===gi}))return null;const ns={W:st.W,H:st.H,g:st.g.slice()};G2.cells.forEach(k=>ns.g[k]=null);G2.cells.forEach(k=>ns.g[k+dir]=G2.col);return jellySettle(ns)}
function jellyWon(st){const{groups}=jellyGroups(st);const cols={};groups.forEach(G2=>cols[G2.col]=(cols[G2.col]||0)+1);return Object.values(cols).every(v=>v===1)}
const PEB_LV=[
 ['..........','..........','..........','.....#...D','P.o..#...#','##########'],
 ['...........','...........','........#.D','P..o...##.#','###########'],
 ['..........','..........','.........D','...#.....#','Po.#...o.#','##########'],
 ['.............','.............','......#.....D','P.o.o.##...##','#############'],
 ['...........','...........','..........D','......###.#','Po..o.###.#','###########'],
 ['............','............','............','.....#....oD','Po.o.##...##','############'],
 ['.............','.............','.............','.........o...','.........#...','P..oo.##.##.D','#############'],
 ['..............','..............','..............','........o.....','........#...#D','Poo.o...###.##','##############']];
function pebParse(L){const H=L.length,W=L[0].length;let p=null,d=null;const g=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ch=L[y][x];if(ch==='P')p={x,y};if(ch==='D')d={x,y};g.push(ch==='#'?1:ch==='o'?2:0)}return{W,H,g,px:p.x,py:p.y,f:1,carry:0,door:d}}
function pebFall(st,x,y){while(y+1<st.H&&st.g[(y+1)*st.W+x]===0)y++;return y}
function pebStep(st,a){const s={W:st.W,H:st.H,g:st.g.slice(),px:st.px,py:st.py,f:st.f,carry:st.carry,door:st.door};const W=s.W,at=(x,y)=>x<0||x>=W||y<0||y>=s.H?1:s.g[y*W+x];
  if(a==='L'||a==='R'){const dx=a==='L'?-1:1;if(s.f!==dx){s.f=dx;return s}const nx=s.px+dx;if(at(nx,s.py)===0&&(!s.carry||at(nx,s.py-1)===0)){s.px=nx;s.py=pebFall(s,nx,s.py);return s}return s}
  if(a==='U'){const nx=s.px+s.f;if(at(nx,s.py)!==0&&at(nx,s.py-1)===0&&at(s.px,s.py-1)===0&&(!s.carry||(at(s.px,s.py-2)===0&&at(nx,s.py-2)===0))){s.px=nx;s.py=s.py-1;return s}return s}
  if(a==='D'){const nx=s.px+s.f;if(!s.carry){if(at(nx,s.py)===2&&at(nx,s.py-1)===0&&at(s.px,s.py-1)===0){s.g[s.py*W+nx]=0;s.carry=1;const top=s.py-1;void top}}else{if(at(nx,s.py)===0&&at(nx,s.py-1)===0){const yy=pebFall(s,nx,s.py);s.g[yy*W+nx]=2;s.carry=0}else if(at(nx,s.py)!==0&&at(nx,s.py-1)===0){s.g[(s.py-1)*W+nx]=2;s.carry=0}}return s}return s}
const pebWon=s=>s.px===s.door.x&&s.py===s.door.y;

function solveJ(L){let st=jellySettle(jellyParse(L));if(jellyWon(st))return 'already won';const key=s=>s.g.map(v=>v||'.').join('');const seen=new Set([key(st)]);let fr=[st];for(let d=1;d<=14;d++){const nf=[];for(const s of fr){for(let i=0;i<s.g.length;i++){if(!s.g[i]||s.g[i]==='#')continue;for(const dir of[-1,1]){const n=jellyMove(s,i,dir);if(!n)continue;const k=key(n);if(seen.has(k))continue;seen.add(k);if(jellyWon(n))return d;nf.push(n)}}}fr=nf;if(!fr.length)break}return 'UNSOLVABLE'}
JELLY_LV.forEach((L,i)=>console.log('jelly',i+1,solveJ(L)));
function solveP(L){const st=pebParse(L);const key=s=>s.g.join('')+'|'+s.px+','+s.py+','+s.f+','+s.carry;const seen=new Set([key(st)]);let fr=[st];for(let d=1;d<=80;d++){const nf=[];for(const s of fr)for(const a of['L','R','U','D']){const n=pebStep(s,a);const k=key(n);if(seen.has(k))continue;seen.add(k);if(pebWon(n))return d;nf.push(n)}fr=nf;if(!fr.length)break}return 'UNSOLVABLE'}
PEB_LV.forEach((L,i)=>console.log('pebble',i+1,solveP(L)));
