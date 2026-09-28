// One-time trademark clean-up: replaces franchise/brand references in user-visible text and logs every change.
// Usage: node tools/tm-rename.cjs > TRADEMARK-CHANGES.md
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const files = [];
const walk = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(html|js|xml)$/.test(f)) files.push(p); } };
['games', 'js'].forEach(d => walk(path.join(ROOT, d)));
files.push(path.join(ROOT, 'index.html'), path.join(ROOT, 'sitemap.xml'));

// [what, from, to]
const R = [
  // descriptions that named other games
  ['Neon Harbor description', 'An open-world crime story in the spirit of GTA.', 'An open-world crime story inspired by classic sandbox crime games.'],
  ['The Hollow description', 'A survival horror story in the spirit of The Forest.', 'A survival horror story in the spirit of wilderness survival games.'],
  ['Silent Contract description', 'A stealth assassination sandbox in the spirit of Hitman.', 'A stealth assassination sandbox inspired by classic stealth-action games.'],
  ['Silent Contract rating name', 'Silent Assassin', 'Perfect Ghost'],
  ['Spellbound Academy description', 'A wizard school card-duel RPG in the spirit of Wizard101.', 'A wizard school card-duel RPG inspired by classic online card-battle adventures.'],
  ['Street Rumble description', 'A Street Fighter-style 2D fighting game', 'A classic arcade-style 2D fighting game'],
  ['Breach 5v5 description', 'A Counter-Strike-style competitive shooter: AK-47, M4A4, AWP and the full CS2 lineup with real stats and spray patterns', 'A tactical 5v5 team shooter: a full arsenal of pistols, SMGs, shotguns, rifles and sniper rifles with realistic stats and recoil patterns'],
  ['Blob Feast description', 'Like agar.io, with bots.', 'Classic .io arena action, with bots.'],
  ['Noodle description', 'Like slither.io, with bots.', 'Classic .io snake action, with bots.'],
  ['Paper Land description', 'Like paper.io.', 'Classic territory-grab .io action.'],
  ['Tank Arena description', 'Like diep.io.', 'Classic .io tank-arena action.'],
  ['Where Am I description', 'Like GeoGuessr, free.', 'Free, no account needed.'],
  ['Learn Piano description', 'Learn Für Elise, Seven Nation Army, the Mario theme and more.', 'Learn Für Elise, Ode to Joy, The Entertainer and more.'],
  ['Learn Piano description (encoded)', 'Learn F\\u00fcr Elise, Seven Nation Army, the Mario theme and more.', 'Learn F\\u00fcr Elise, Ode to Joy, The Entertainer and more.'],
  ['Beat Lanes description', 'Play real songs, from Seven Nation Army to Megalovania:', 'Play real songs, from Für Elise to the William Tell Overture:'],
  ['Beat Lanes description (encoded)', 'Play real songs, from Seven Nation Army to Megalovania:', 'Play real songs, from F\\u00fcr Elise to the William Tell Overture:'],
  ['Homepage section text', 'Chess, checkers, cards and Connect Four', 'Chess, checkers, cards and four-in-a-row'],
  ['Homepage section text', 'Street View, maps, flags and capitals', 'Street-level photos, maps, flags and capitals'],
  ['Homepage description', 'Street View guessing', 'street-level photo guessing'],
  ['Field Goal message', 'That’s NFL range!', 'That’s pro range!'],
  // game title that is a trademark
  ['Game title (Battleship → Fleet Strike)', 'Battleship', 'Fleet Strike'],
  ['Game page address', '/games/battleship/', '/games/fleet-strike/'],
  // weapon brand/model names (Breach 5v5, Last Drop, Gun Sim)
  ['Breach weapon', "n:'Glock-18'", "n:'P-18 Auto'"], ['Breach weapon', "n:'USP-S'", "n:'P-45S'"], ['Breach weapon', "n:'P250'", "n:'P-25'"],
  ['Breach weapon', "n:'Tec-9'", "n:'TX-9'"], ['Breach weapon', "n:'Five-SeveN'", "n:'P-57'"], ['Breach weapon', "n:'Desert Eagle'", "n:'Hand Cannon'"],
  ['Breach weapon', "n:'MAC-10'", "n:'MX-10'"], ['Breach weapon', "n:'MP9'", "n:'SMG-9'"], ['Breach weapon', "n:'UMP-45'", "n:'SMG-45'"],
  ['Breach weapon', "n:'P90'", "n:'PDW-50'"], ['Breach weapon', "n:'Nova'", "n:'Pump 12'"], ['Breach weapon', "n:'XM1014'", "n:'Auto 12'"],
  ['Breach weapon', "n:'Galil AR'", "n:'GR-35'"], ['Breach weapon', "n:'FAMAS'", "n:'BP-3'"], ['Breach weapon', "n:'AK-47'", "n:'KR-47'"],
  ['Breach weapon', "n:'M4A4'", "n:'CR-4'"], ['Breach weapon', "n:'M4A1-S'", "n:'CR-4S'"], ['Breach weapon', "n:'SG 553'", "n:'SR-55'"],
  ['Breach weapon', "n:'AUG'", "n:'BP-8'"], ['Breach weapon', "n:'SSG 08'", "n:'Scout'"], ['Breach weapon', "n:'AWP'", "n:'Magnum Sniper'"],
  ['Breach quick-buy button', "['AWP',()=>['awp']]", "['Magnum Sniper',()=>['awp']]"],
  ['Breach armor', "n:'Kevlar Vest'", "n:'Armor Vest'"], ['Breach armor', "n:'Kevlar + Helmet'", "n:'Armor + Helmet'"],
  ['Gun Sim weapon', "name:'AK-47'", "name:'KR-47'"],
  // music: the Tetris melody is the public-domain folk song Korobeiniki
  ['Music library song name', "'Tetris Theme (Korobeiniki)','Russian folk song'", "'Korobeiniki','Russian folk song'"],
];
// film, TV and game themes removed from the music games (copyrighted melodies named after franchises)
const DROP_SONGS = ['The Imperial March', 'Star Wars Main Title', 'Hedwig’s Theme', 'Super Mario Bros. Theme', 'Game of Thrones Theme', 'He’s a Pirate', 'Mission: Impossible Theme', 'Megalovania', 'Pac-Man Intro', 'Pink Panther Theme', 'Jaws Theme', 'Axel F'];

const log = [];
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8'), o = s;
  const rel = path.relative(ROOT, f);
  for (const [what, a, b] of R) {
    const n = s.split(a).length - 1;
    if (n) { s = s.split(a).join(b); log.push({ rel, what, a, b, n }); }
  }
  if (rel === path.join('js', 'lib', 'music2.js')) {
    for (const t of DROP_SONGS) {
      const re = new RegExp("^  \\['" + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "',.*\\n", 'm');
      if (re.test(s)) { s = s.replace(re, ''); log.push({ rel, what: 'Music library: removed song', a: t, b: '(removed)', n: 1 }); }
    }
  }
  if (s !== o) fs.writeFileSync(f, s);
}
// move the Battleship page to its new address
const oldDir = path.join(ROOT, 'games/battleship'), newDir = path.join(ROOT, 'games/fleet-strike');
if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) { fs.renameSync(oldDir, newDir); log.push({ rel: 'games/battleship/ → games/fleet-strike/', what: 'Page moved (old address redirects)', a: '', b: '', n: 1 }); }

// report
const out = ['# Trademark clean-up: every text change', '', 'Generated by `tools/tm-rename.cjs`. Each row: file, what changed, before → after, and how many times.', ''];
let cur = '';
for (const r of log.sort((x, y) => (x.what + x.rel).localeCompare(y.what + y.rel))) {
  if (r.what !== cur) { cur = r.what; out.push('', '### ' + cur, ''); }
  out.push(`- \`${r.rel}\`${r.n > 1 ? ` (×${r.n})` : ''}: ${r.a ? `“${r.a}” → “${r.b}”` : ''}`);
}
console.log(out.join('\n'));
