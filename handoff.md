# Handoff — Detourr (detourr.net)

Read this first when picking the project up in a new session. It covers what the project is, where things stand, how to build, test and ship, and the rules the owner has set.

_Last updated: 2026-09-28._

---

## 1. What this is

**Detourr** is a free browser-games site: about 240 games and toys (3D story games, driving, superheroes, puzzles, sports, music, geography, .io, cooking, sims, escape rooms). It needs no sign-up and runs on any device.

- **Live site:** https://detourr.net (Netlify; `detourr.netlify.app` redirects there).
- **Repo / branch:** `ben-ai-coder12212121/webs`, branch **`claude/website-sync-claude-code-ctibq1`**. Netlify deploys from this branch.
- **Site format:** the whole site is one static `index.html` (HTML, CSS and JS inline), built from the sources in `src/`.
- **Other generated files:** per-game SEO pages in `games/<id>/`, plus `sitemap.xml` and `robots.txt`.
- **Game art:** served from `/assets` (see section 5).

## 2. Rules from the owner (follow these)

1. **Don't deploy every change.** Commit and push as usual; that keeps the work safe, because the cloud workspace is temporary. Netlify **skips** any push whose latest commit message lacks `[deploy]`. This is set by the `ignore =` rule in `netlify.toml`.
   - When the owner says **"deploy"**, make one commit whose message contains `[deploy]`; an empty commit is fine. Push it, then check the live site with `curl -sL https://detourr.net/ | grep <something new>`.
2. **New games go to the "🚧 In progress" section, not the main listings.** They must not be picked by the random button. Move a game out only when the owner says so, by editing `WIP_IDS` near the end of `src/heroes/build.py`.
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

## 4. Build, run and test

All sources live in **`src/`**.

```sh
sh src/make_site.sh
```

This does four things:

1. Builds a test build at `src/srv/test.html` (with debug hooks).
2. Extracts game metadata (`src/heroes/gen_meta.js`).
3. Builds the real `index.html` at the repo root.
4. Generates the `games/` SEO pages, `sitemap.xml` and `robots.txt`.

It needs `python3`, `node` and Playwright at `/opt/node22/lib/node_modules/playwright`.

**Sources (`src/heroes/`):**

- `orig.html`: the base site, with the grid, filters, `Stage3D`, `with3D`, `load3D` and site CSS.
- `build.py`: concatenates the game JS files (the list is near the top) into `orig.html`, then applies patches with `rep(...)`. This file holds the WIP section, the random-button logic and so on.
- `*.js`: one file (or a few) per game family.
  - `bk.js` is "bigKit", the engine for the big story games.
  - `crime.js`, `hollow.js`, `contract.js`, `blade.js`, `palm.js` and `wizard.js` are the six in-progress games.
  - `tx1–6.js` are Breach 5v5 and Last Drop.
  - `gunsim.js` is Gun Sim and Dead Zone.
- The folders `nh/`, `hl/`, `sc/`, `bl/`, `ip/` and `wz/` hold the part-files the six big games were first written in.
  - **The concatenated `.js` files in `src/heroes/` are the ones used now. Edit those.**

**Tests (`src/t/`):**

- **Setup:** run `npm i` in `src/t` (installs three@0.128, matter-js, d3-geo and topojson).
- **`all.js`:** full regression. Every game id in `ids.txt` must open with no errors. It takes about 20 minutes. Run it as:
  ```
  npx http-server src/srv -p 8765 -s &
  cd src/t && PW=/opt/node22/lib/node_modules/playwright node all.js
  ```
  It should print `ALL CLEAN`.
- **Flow tests** play each big game to the end through hooks. They are:
  - Neon Harbor: `nhflow.js`
  - The Hollow: `hlflow.js`
  - Silent Contract: `scflow.js`
  - Moonblade: `mbflow.js`
  - Iron Palm: `ipflow.js`
  - Spellbound Academy: `wzflow.js` and `wzduel.js`
  - Each game exposes a debug hook with `sim(n)` and `tick()`: `window.__NH`, `__HL`, `__SC`, `__MB`, `__IP` and `__WZ`. `window.__BK` points to the one currently running.
- **`art.js`:** screenshot helper. Set `GAME=<id>` and `STEPS='[{"js":"…"},{"wait":2000},{"shot":"name"}]'`.
- **`route.js`:** test routing. It serves `https://detour.test/` from `srv/test.html` and `/assets/*` from `srv/assets`, which is a symlink to the repo's `assets/`.
- **Headless-testing tips.**
  - Software rendering is very slow. For long real-time flows, set `K.scene.visible=false` so frames stay cheap.
  - When screenshotting, clip the page to the `.g3` box's rectangle. Screenshotting the `.g3` element itself times out waiting for it to be stable.
- **Lint:**
  ```
  cat src/heroes/bk.js src/heroes/<game>.js > x.js && npx eslint x.js
  ```
  The only expected errors are site globals: `el`, `S`, `muted`, `ac`, `with3D`, `Stage3D`, `G`, `load3D`, `unlockAudio` and `THREE`.

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

**Kit API (in `bk.js`):**

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
- **Games marked PC-only** live in the `PC_ONLY` list in `orig.html`. The six in-progress games are on it.
- **Headless tests use swiftshader.** Screenshots there look fine, but timings are about 50× slower than a real GPU.
- **Breach's scope** is toggled by a key or mousedown handler in `tx6.js`, not by `input.right`.

## 7. Suggested next steps

1. Wait for the owner's review of the six in-progress games, then move the approved ones out of `WIP_IDS`.
2. Swap Neon Harbor's procedural cars for a low-poly CC0 car model.
3. Add more rigged character bodies (clothing variety, real hair).
4. Deploy only when the owner says "deploy".
