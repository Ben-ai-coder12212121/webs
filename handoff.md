# Handoff — Detourr (detourr.net)

Read this first when picking the project up in a new session. It covers what the project is, where things stand, how to build, test and ship, and the rules the owner has set.

_Last updated: 2026-09-28 (site split into one page per game)._

---

## 1. What this is

**Detourr** is a free browser-games site: about 240 games and toys (3D story games, driving, superheroes, puzzles, sports, music, geography, .io, cooking, sims, escape rooms). It needs no sign-up and runs on any device.

- **Live site:** https://detourr.net (Netlify; `detourr.netlify.app` redirects there).
- **Repo / branch:** `ben-ai-coder12212121/webs`, branch **`claude/website-sync-claude-code-ctibq1`**. Netlify deploys from this branch.
- **Site format (since 2026-09-28):** one page per game at `games/<name>/index.html`, with shared code in `js/` and `css/`, and a homepage (`index.html`) that links to them. No build step: edit the files directly. `README.md` has the full layout; `GAMES.md` lists each game's libraries and external files.
- **The old single-file build in `src/` is archived.** `src/make_site.sh` refuses to run, because it would overwrite the new `index.html`.
- **Game art:** served from `/assets` (see section 5).

## 2. Rules from the owner (follow these)

1. **Don't deploy every change, and never push to the live branch unless the owner says "deploy".** Work goes on the `preview` branch (free). Commit and push as usual; that keeps the work safe, because the cloud workspace is temporary. Netlify **skips** any push whose latest commit message lacks `[deploy]`. This is set by the `ignore =` rule in `netlify.toml`.
   - When the owner says **"deploy"**, make one commit whose message contains `[deploy]`; an empty commit is fine. Push it, then check the live site with `curl -sL https://detourr.net/ | grep <something new>`.
   - **Previews:** the `preview` branch always builds (branch deploys are free on Netlify; production deploys cost 15 credits each) at **https://preview--detourr.netlify.app**. Push work there when the owner wants to try it: `git push origin HEAD:preview` (merge the live branch into `preview` first so it's up to date). When the owner says "deploy", merge `preview` into the live branch with a `[deploy]` commit.
2. **New games go to the "🚧 In progress" section, not the main listings.** They must not be picked by the random button. Move a game out only when the owner says so, by editing `WIP_IDS` near the top of `js/app.js`.
   - Currently in progress: `neonharbor`, `hollow`, `contract`, `moonblade`, `ironpalm`, `spellbound`.
3. **Q is an aim button in every shooter.** The owner plays on a laptop without a mouse. Any new shooter needs Q = aim / ADS.
   - For games built on `Stage3D`, pass `qAim:true`.
4. **Add new requests to the to-do list without dropping the current work.** Finish what's in flight, then pick them up.
5. **Don't say art can't be good. Get real assets.** The owner rejected procedural "it won't look good" answers.
6. **Git commit trailer:**
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_011Z2ycXtWSLanB7gfyJGRG5
   ```
   Push with:
   ```
   git pull -q --no-rebase origin claude/website-sync-claude-code-ctibq1 && git push -q -u origin claude/website-sync-claude-code-ctibq1
   ```

## 3. Current state

- **Last deploy:** commit `5da5142`, "Release: handbrake … [deploy]". Everything up to it is live.
- **Undeployed:** this handoff, the `src/` sources and `.gitignore`. None of these change the site; `/src/*` and `/handoff.md` return 404 publicly through `_redirects`.
- **Latest checks:**
  - Full-site regression: **241 games, ALL CLEAN**.
  - All six in-progress games play to their endings in scripted flows.

### Recently done (newest first)

- **Highway Weave and Parking Pro:** handbrake on Space; Parking Pro also has an HB touch button.
- **Netlify:** only deploys `[deploy]` commits.
- **Q to aim:**
  - Neon Harbor, The Hollow and Silent Contract use `qAim`. Silent Contract's Instinct moved from Q to **V**.
  - Breach 5v5: Q toggles the scope; "last weapon" moved to **L**.
  - Gun Sim, Dead Zone and Last Drop already used Q.
- **Real art for the six in-progress games:**
  - CC0 photo PBR textures and HDRI lighting.
  - Scanned glTF props and leaf-card foliage.
  - Rigged human characters driven by the existing pose system.
  - Painted-on short haircuts for the bald stock avatar.
- **Bug fix:** a CSS class clash shrank The Hollow's 3D view to half width during dialogue. Wrap classes are now `hlg` and `bkdlg`.

### Known weak spots / ideas (not requested yet)

- **Neon Harbor cars are still procedural boxes.** The only free car model found (three.js `ferrari.glb`, CC-BY) is about 110k triangles, and meshopt couldn't simplify it. A low-poly CC0 car (for example from Quaternius or Kenney) would fix this.
- **Little character variety.**
  - The male base is the ReadyPlayerMe sample avatar: tuxedo-style top recoloured per character, hair painted in the shader.
  - Other bodies: Michelle (female), the Soldier (armoured roles) and Xbot (mannequins and ghosts).
  - More CC0 rigged bodies would help.
- **Performance.**
  - Each in-progress game downloads 10–20 MB the first time; after that the browser caches it for 30 days.
  - Scenes with many skinned characters are heavy. They're fine on real GPUs, but software rendering takes about 1 s per frame.
- **Spellbound Academy looks realistic**, not stylised like Wizard101.

## 4. Edit, run and test

There is no build step. Layout (details in `README.md`):

- `games/<name>/index.html`: one page per game. The game's own code is in the `<script>` marked `===== <name>: game code =====`, and styles only it uses are in its `<style>`. `window.PAGE_GAME` holds the game id.
- `js/core.js`: shared helpers (`el`, `S`, `beep`, `Stage3D`, `with3D`, `load3D` …). `G.push` is overridden here: a game's full definition replaces its catalog entry, and the catalog's listing details win.
- `js/catalog.js`: every game's listing (name, blurb, art, kind, `fmt`, `url`). Homepage and random button use it.
- `js/lib/*.js`: code shared by several games, named after the old source file (`bk.js` = bigKit for the six story games, `havoc.js` = Havoc and Overlord, `tx1.js` = Breach and Last Drop, `gunsim.js` = Gun Sim and Dead Zone …). A page loads only the libs it needs.
- `js/app.js`: game player and homepage grid. `WIP_IDS`, `PC_ONLY`, `HIDDEN` and the top section's `TOP` list are here. Grid tiles are real links to `/games/<name>/`; old `/#<id>` links forward to the page.
- `games/_hidden/`: games removed from the site (3D shooters being reworked). Not listed, `noindex`, blocked in `robots.txt`.

Scripts are classic (non-module) scripts sharing one global scope, so a top-level name in a game page must not clash with one in `core.js`, `app.js` or a loaded lib.


**Online play (`js/lib/online.js`):** `Online.pair({game,onStart,onMsg,onEnd})` for 1v1 games where both sides run the rules and exchange moves; `Online.party({game,max,onStart,onJoin,onLeave,onInput,onAct,onSnap,onEnd})` where the host's browser runs the game, friends send `input` (~20/s) and `act` (reliable), and the host sends each friend a snapshot with `snapTo`. Rooms and signalling go through `netlify/functions/mp.mjs` (Netlify Blobs); `tools/dev-server.mjs` runs the same handler in memory for local testing. Both helpers add their own button and handle `?room=CODE` invite links. Apex GT is the one game with computer rivals that isn't online yet (its AI cars are kinematic, not physics-driven).

**Run locally:** `npx serve .` (or `npx http-server . -p 8766 -s`). Leaderboards need Netlify; everything else works.

**Test:** with a server on port 8766,
```
PW=/opt/node22/lib/node_modules/playwright CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node tools/test-games.cjs http://localhost:8766 [ids…]
```
It opens every game page and prints `ALL CLEAN`. Run `npm i` in `src/t` first to serve three.js and Matter.js locally (faster). The old flow tests in `src/t/` target the archived single-file build and need porting before reuse; the debug hooks (`window.__NH`, `__BK`, …) are still in the game code.

**Lint:**
```
cat js/core.js js/lib/bk.js > x.js && sed -n '/game code =====/,/<\/script>/p' games/neon-harbor/index.html | sed '1d;$d' >> x.js && npx eslint x.js
```

## 5. Art pipeline (`assets/`, about 50 MB)

**Asset folders:**

- `assets/tex/{key}_{col|nor|rgh}.jpg`: Poly Haven CC0 texture sets. The keys are:
  - Ground and surfaces: asphalt, sidewalk, concrete, brick, plaster, planks, darkwood, forest, grass, rock, sand, bark, marble, tiles, metal, roof, cobble, mud, stonewall, bamboo, carpet, facade, castle, gravel.
  - Foliage cards: `fol_{broad,pine,maple,bamboo}.png`, made from ambientCG CC0 leaf sets.
- `assets/hdr/*.hdr`: Poly Haven CC0 skies. The names are day, citynight, forest, night, lake, sunset, roofnight, workshop, neon, museum and garden.
- `assets/models/*.glb`: Poly Haven CC0 props, simplified to be light enough (barrel, crate, katana, bat, hydrant, trashcan, bench, sofa, streetlamp, boulder …).
- `assets/chars/`: Soldier, Xbot and Michelle (Mixamo rigs) and `readyplayer.me.glb`, all taken from the three.js examples.
- `assets/lib/loaders.js`: three r128 `GLTFLoader`, `RGBELoader` and `SkeletonUtils`.
- `assets/CREDITS.txt`: attribution.

**Kit API (in `js/lib/bk.js`):**

- **`withArt(root, c, ['tex:asphalt','hdr:day','glb:bench','chr:Soldier', …], start)`:** preloads the listed assets behind the loading card.
- **Materials and lighting:**
  - `mat(key, col, {map:'asphalt'})` picks up the photo colour, normal and roughness maps automatically.
  - `K.pbr(key, col)` and `K.pbrRep(key, col, rx, ry)` build photo materials; the second tiles the texture a set number of times.
  - `K.env(name, {int})` lights the scene from an HDR sky; `K.envInt(v)` changes the strength.
- **Props:**
  - `K.prop(key, {h|w|l, center})` places a glTF model, scaled and sitting on the ground.
  - `K.propParts(...)` returns the model's parts for instancing.
  - `K.propAlong(key, len, grip)` makes a hand-held item.
  - `gunMesh('katana'|'bat'|…)` uses the real model when it's loaded.
- **Foliage and terrain:** `K.leafMat`, `K.crownGeo`, `K.pineCrownGeo`, `K.realTree` and `K.splatMat` (splats terrain textures by weight).
- **Characters:**
  - `K.human(o)` builds the invisible procedural driver rig and attaches a skinned body that follows it bone by bone. Choose the body with `o.model` ('rpm', 'michelle', 'soldier' or 'xbot'); `o.real:false` keeps the old procedural look.
  - Any material swapped onto a skinned mesh must have `skinning:true`, or the mesh freezes in its T-pose.
- **Fallback:** if an asset is missing, everything falls back to the procedural look.

**Re-fetching assets:** the scripts in `src/assetwork/` do it (`fetch_tex.py`, `fetch_models.py`, `foliage.py`, `pack.mjs`, `simp.mjs`). Poly Haven needs a `User-Agent` header on requests.

## 6. Gotchas

- **Asset paths:** `ARTX` loads from **`/assets/`**, which is absolute so the SEO pages under `/games/<id>/` also work.
- **Name clashes with site globals.** The site already defines `ART`, which is why the kit uses `ARTX`. Short CSS classes can also collide with site rules; that is how `.hl` broke The Hollow's layout. Prefix new classes.
- **`src/package.json` sets `"type":"commonjs"`.** The repo root is `"type":"module"`, and the build and test scripts use `require`.
- **Games marked PC-only** live in the `PC_ONLY` list in `js/app.js`. The six in-progress games are on it.
- **Headless tests use swiftshader.** Screenshots there look fine, but timings are about 50× slower than a real GPU.
- **Breach's scope** is toggled by a key or mousedown handler in the Breach code (now in `js/lib/tx1.js` or `games/breach-5v5/`), not by `input.right`.

## 7. Suggested next steps

1. Wait for the owner's review of the six in-progress games, then move the approved ones out of `WIP_IDS`.
2. Swap Neon Harbor's procedural cars for a low-poly CC0 car model.
3. Add more rigged character bodies (clothing variety, real hair).
4. Deploy only when the owner says "deploy".
