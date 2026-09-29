# Handoff: Detourr (detourr.net)

Read this first when picking the project up in a new session. It covers what the project is, where things stand, how to build, test and ship, and the rules the owner has set.

_Last updated: 2026-09-29 (after the site checklist pass: privacy and terms pages, line icons, honest counts)._

---

## 1. What this is

**Detourr** is a free browser-games site for bored students: 272 games in the catalog, of which **204 are public**. The rest are hidden (50 removed in the audit, plus 8 shelved shooter prototypes) or in progress (10). No sign-up, no ads, runs on school Chromebooks and phones.

- **Live site:** https://detourr.net (Netlify; `detourr.netlify.app` redirects there).
- **Repo:** `ben-ai-coder12212121/webs`.
- **Branches:**
  - **`preview`**: where all work goes. Always builds, free, at **https://preview--detourr.netlify.app**.
  - **`claude/website-sync-claude-code-ctibq1`**: the live branch. Netlify builds it only when the latest commit message contains `[deploy]` (the `ignore =` rule in `netlify.toml`).
- **Site format:** one page per game at `games/<name>/index.html`, with shared code in `js/` and `css/`. The homepage is `index.html`. There is no build step, so edit the files directly. `README.md` has the full layout; `GAMES.md` lists each game's libraries.
- **`src/` is the archived old single-file build.** Don't use it.

## 2. Rules from the owner (follow these)

1. **Never push to the live branch unless the owner says "deploy".** Commit and push work to `preview`; the cloud workspace is temporary, so push often.
   - **To deploy:**
     ```
     git checkout -B live-rel origin/claude/website-sync-claude-code-ctibq1
     git merge --no-ff origin/preview -m "Release: <summary> [deploy] + trailer"
     git push origin HEAD:claude/website-sync-claude-code-ctibq1
     ```
     Before merging, check that `git diff origin/preview HEAD` is empty. Afterwards, check the live site with `curl -s https://detourr.net/... | grep <something new>`.
   - The sandbox's Chromium can't open external HTTPS sites (certificate error), so check the live site with curl.
2. **New games go in "🚧 In progress" (`WIP_IDS` at the top of `js/app.js`), not the main list.** They must not be picked by the random button. Move a game out only when the owner says so.
3. **Q is an aim button in every shooter** (the owner plays on a laptop without a mouse). For games built on `Stage3D`, pass `qAim:true`.
4. **Add new requests to the to-do list without dropping current work.**
5. **Don't say art can't be good; get real assets** (CC0 models and textures, see section 6).
6. **Don't create pull requests unless asked.**
7. **Site style checklist (the owner asked for this, and the site now passes it):**
   - No purple gradients.
   - No vague hero text.
   - No fake reviews, ratings or metrics. Every number shown must be real (for example, the game count is computed from the visible list).
   - No scroll animations.
   - No pill-shaped buttons.
   - No emoji used as UI icons: use `ico()` (see section 5).
   - No em dashes in public text.
   - No "made with AI" tag.
   - Keep the favicon, the privacy and terms pages, and the custom domain.
8. **Commit trailer** (no model names anywhere in commits):
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01GnySxEr5YJ89frW2WUHhnw
   ```

## 3. Current state

- **Live:** everything up to commit `f0146d2`, "Release: site checklist pass … [deploy]". Preview and live are identical.
- **Last full check:** `tools/test-games.cjs` reported **272 games tested, ALL CLEAN**.
- **Open question for the owner:** should any of the 10 in-progress games move to the main list?

### Recently done (newest first)

- **Absorb rebuilt** as the screen-only game the owner wanted (not agar.io): your ball sits at the pointer (arrow keys/WASD also work), balls fly across from the edges, absorb smaller (blue) ones, avoid bigger (red) ones. Reaching radius 46 levels up (shrink back, faster balls). Scores in points (`fmt` `b+' pts'`), kind moved from `io` to `arcade`, no online mode.
- **Homepage "Latest high scores" feed:** `netlify/functions/lb.mjs` now keeps a `recent` blob (the newest 30 improved bests on any board, filled from existing boards the first time) served at `GET /api/lb?recent=1`. `recentBoard()` in `app.js` shows 5 of them next to "Today's top". Why: the owner set a high score and expected it on the homepage, but "Today's top" only shows the daily-challenge game.
- `tools/dev-server.mjs` now runs `/api/lb` locally (in memory), so leaderboards can be tested offline.
- **Dark site theme** (the owner found the yellow too bright in class): page background `#121019`, dark cards, light text, violet `#7a68e8` for selected chips, `theme-color` `#121019`.
  - Tokens at the end of `css/site.css`: `--bg`, `--paper`, `--ink` (text), `--line` (borders and shadows), `--onbg`/`--onfg` (selected chips), `--tx` (text on light boxes).
  - Inside `#arena` / `.arena` the original light palette is restored, so games keep their own colours. Plain text on the arena is light, and every rule with a light background got `color:var(--tx)` so it keeps dark text.
  - New pages from `tools/new-game.cjs` use the dark `theme-color`.
  - **Dark/Light toggle** next to each Sound button (added by the snippet at the end of `js/app.js`). It stores `S.set('theme','light'|'dark')` (localStorage `unb_theme`). A one-line script right after `<meta charset>` in every page (and in the `new-game.cjs` template) sets `<html data-theme="light">` before first paint. The dark CSS is scoped with `:root:not([data-theme=light])` / `html:not([data-theme=light])`.
- **Stillshot made distinct from SUPERHOT** (so it can't be mistaken for a copy):
  - Enemies are now "Tickers": navy clockwork guards with brass joints, a glowing clock face and a wind-up key. They burst into gears, not red glass. Rooms have a warm sepia "paused photo" palette, and the UI accent is amber.
  - Taglines reworded; the "leap into their body" move is now **Swap** (trade places and take their weapon); the flashing replay words are gone (plain "REPLAY").
  - **Story:** 5 chapters of 10 levels (Meridian Clockworks, Director Hale, the Regulator), a story card before each level, and an epilogue. Data: `CH`, `STORY`, `EPILOGUE`.
  - **Unlocks by chapter:** Dash (Shift, ch 2), Parry (punch bullets back, ch 3), Flash (G, ch 4), Overclock (ch 5). New guards: shield Tickers (ch 3+) and blue synced Tickers that move while you stand still (ch 5). A boss with a health bar ends each chapter.
  - **Arena:** the same powers and enemies unlock by kill count, with a supply drop every 8 kills and a Champion boss every 25.
- **Site checklist pass:**
  - New `/privacy/` and `/terms/` pages, linked from every footer and listed in the sitemap.
  - UI emoji replaced by line icons.
  - Pill buttons squared off.
  - Em dashes removed from all public text.
  - Hero rewritten ("Free browser games that start in one click.").
  - The count now shows the real public number (204). Stale "235 games" and "Top rated" claims removed.
- **Random spinner on game pages:** game pages load the slim catalog, which has no card art. `js/catalog-art.js` (generated) now loads in the background, so the spinner shows every game's picture.
- **Wanted Wheels:** civilian traffic on every road. You can get out on foot (E) and steal any car: moving, parked, or a stalled or roadblock cop car. A wrecked car throws you out instead of ending the run. New garage rides: bus, fire truck, cop car.
- **Breach 5v5 / Last Drop (`js/lib/tx1.js`):** the character poses were mirrored, so arms and knees bent backwards and aim tilt was inverted. Fixed, plus two-bone arm IK so the hands sit on the gun's grip and foregrip, and sturdier body proportions.
- **Bonk Buddy:** grabbing is always on (drag him; tapping uses the current tool). New health bar, K.O., stages with prizes (coins plus a new weapon, outfit or room), combos, 3 rotating missions, 10 outfits and 6 rooms.
- **Blur:** backing up is a controllable jog, capped speed.
- **Homepage:** the "Big games only" filter is back (`MAJOR` set / `isMajor` in `app.js`).
- **Earlier in this stretch:**
  - Student audit: report published as a private artifact at https://claude.ai/artifact/WF8eHo2Uk5GDtKvCM8xfFZ. 43 games hidden, 12 released, core list of 75.
  - Homepage time picks (1 / 5 / 15+ min) and modes.
  - Daily challenge and daily leaderboard, streaks, badges, the Continue row, the end-of-round strip, and "beat my score" links.
  - Low-graphics mode for 3D games.
  - Fonts and libraries self-hosted.
  - 15 mobile-style games.
  - Moonblade art upgrade.

### Removed from the site (hidden, pages kept, `noindex`)

**In the `HIDDEN` set in `js/app.js` (50):**
- Doodle Pad, Something To Do, Higher or Lower, Cactus Hop, Rock Paper Scissors, Tower of Hanoi
- Guess the Number, Balloon Pop, Piano, Beat Maker, Conway's Life, Oracle Ball
- Fortune Cookie, Weird Facts, Pitch Check, Melody Memory, Keep the Beat, Theremin
- Chord Pad, Drum Pads, Peg Jump, Greater Than, Highway Weave, Monster Rush
- Sky Race, Mitoza, Pebble Boy, Torch Maze, Hundred Blocks, Ojello
- Hexaginta, Ancient Blocks, Day & Night, Million vs Billion, How Old Is It?, Neon Ribbons
- Hyper Tunnel, Aurora, Meteor Shower, Light Painter, Fractal Bloom, Wind Chimes
- Constellations, 100m Dash, Newton's Cradle, Rope Swing, Word Magnets, Knob Sketch
- Snow Globe, Zipper

**Shelved shooter prototypes (`kind:'shooter'`, in `games/_hidden/`):** Boredom Outbreak, Operation Breadcrumb, Snowball Siege, Vacuum Wars, Gnome Patrol, Pizza Heist, Jailbreak Dog, Space Llama.

**The owner chose to KEEP these 23** from the audit's remove list, so don't hide them:
- breathe, gt_fireflies, ch_rain, info_life, info_pets, info_moon
- info_prices, info_trip, info_clock, io_absorb, fifteen, scramble
- fishtank, fireworks, glowboard, gt_spiro, googly, pond
- lava, sparkler, spiro, warp, sand

### In progress (`WIP_IDS`)

| Game | What it needs |
|---|---|
| Neon Harbor | Open-world crime game; heavy, and the theme isn't classroom-friendly |
| The Hollow | Survival horror; heavy |
| Silent Contract | Unfinished |
| Moonblade | Looks great, but downloads over 10 MB |
| Iron Palm | Kung fu brawler, unfinished |
| Spellbound Academy | Unfinished |
| Garden Guard | Needs balance tuning |
| Lane Lords | The computer opponent and balance need work |
| Pocket Pet | Needs more to do |
| Corner Pocket | The computer opponent needs tuning; aiming needs help lines |

### Live but needs work (from the audit)

- **Plain looks or thin content:** Memory Match, Hangman, Code Breaker, Maze Runner, Space Dodge, Teo's Escape, Box Pusher (12 levels), Riddle Box.
- **No goal or little replay:** Lights Off, Bouncy Balls, Orbit Lab, Planet Age, Earth Right Now, Continent Sort, Open Road.
- **Hard to get into:** Cryptogram, Word Ladder, Jelly Buddies, Virus Attack, Tennis, Darts, Parking Pro, Tic-Tac-Toe.
- **Overlap with another game:**
  - Crash Dummy overlaps Bonk Buddy.
  - Cupcake Café overlaps Pizza Shop.
  - Tractor Fields overlaps Farm Life.
- **Naming / look:** Gunmach has tiny sprites, and the name is a poor fit for schools.
- **Heavy 3D or long sessions:**
  - Superhero games: Skybound, Pocket, Frostline.
  - Big 3D games: Goose Heist, Power Lab, Gun Sim Pro, Dead Zone, Apex GT, Horizon Flight Sim, Skyfront 1943, Last Drop.
  - Escape 3D rooms: The Study, Sinking Sub, Snowbound Cabin.
- **Already fixed since the audit:** Click Frenzy (clicks-per-second test), Decide for Me, Color Valley, Let's Park, Ink Swirl, Domino Run, Sticky Goo, Wanted Wheels, Blur, Breach.

The audit data (`verdicts.js`, screenshots) was in a session scratchpad and is gone. The verdicts are summarised above.

## 4. Edit, run and test

### Layout

- **`games/<name>/index.html`:** one page per game. The game code is in the `<script>` marked `===== <name>: game code =====`, and `window.PAGE_GAME` holds the game id.
  - The static header buttons (Leaderboard, Full screen) and the footer (Privacy · Terms) are copied into every page.
  - `tools/new-game.cjs` uses `games/2048/index.html` as the template.
- **`js/core.js`:** shared helpers: `el`, `S` (localStorage, `unb_` prefix), `beep`, `noise`, `Stage3D`, `with3D`, `gfxLow()`, plus the **icon set** (`ICONS`, `ico(name)`, `icoPath`, `icoEl`).
  - `G.push` is overridden here: a game's own definition merges into its catalog entry, and the catalog's listing keys win.
- **`js/catalog.js`:** every game's listing: name, blurb, `art` (inline SVG), kind, `fmt` and url.
- **Generated catalog files** (run `node tools/catalog-lite.cjs` after changing `catalog.js`):
  - `js/catalog-lite.js`: listings without art or blurbs, for game pages.
  - `js/catalog-art.js`: `window.GART`, card art by id.
- **`js/app.js`:** the homepage and the game player.
  - Curation lists: `WIP_IDS`, `HIDDEN`, `CORE`, `MAJOR`, `PC_ONLY`, `TOP`.
  - Filters: `MODES`, `META_RAW` (duration and flags).
  - Retention features: daily game, streak, badges, end strip, beat links, Continue row.
  - The spinner (`spinTo`, which lazy-loads art), `LB` (leaderboards) and `SUGG` (the ideas board).
- **`js/lib/*.js`:** code shared by several games:
  - `tx1.js`: Breach and Last Drop.
  - `bk.js`: the six story games.
  - `online.js`: multiplayer.
  - `physics.js`: Matter.js games.
  - `kit.js`, `roam.js`, `speed.js`: superhero games.
- **`css/site.css`:** all shared styles. `.ico` sizes the icons.
- **`privacy/` and `terms/`:** standalone pages. Update the privacy page if a new feature sends data anywhere.
- **`netlify/functions/`:** `lb.mjs` (leaderboards; keys match `/^best_[a-z0-9_]{1,48}$/`), `ideas.mjs` (the Suggest board) and `mp.mjs` (online-play signalling). All use Netlify Blobs.
- **`games/_hidden/`:** shelved shooter prototypes.

Scripts are classic (non-module) scripts sharing one global scope. A top-level name in a game page must not clash with `core.js`, `app.js` or a loaded lib. Also avoid short CSS class names: `.peg`, for example, once broke Tower of Hanoi.

### Tools

- `tools/dev-server.mjs`: a local server with the Netlify functions in memory. Run `node tools/dev-server.mjs` (port 3100).
- `tools/test-games.cjs`: opens every game page and reports errors and missing same-origin files:
  ```
  PW=/opt/node22/lib/node_modules/playwright CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node tools/test-games.cjs http://localhost:3100 [ids…]
  ```
  It should print `ALL CLEAN`. It takes about 10 minutes for all games.
- `tools/new-game.cjs`: adds a new game page and catalog entry (in progress by default).
- `tools/release-game.cjs`: moves a game out of in progress (sitemap, noindex, lists).
- `tools/allgames.cjs`: rebuilds the homepage footer's "All N games A–Z" list. Run it after changing `HIDDEN` or `WIP_IDS`.
- `tools/catalog-lite.cjs`: see above.
- `tools/assets/*`: Quaternius model build scripts.

**Screenshots and flows:** use Playwright with `executablePath` set to the chromium above. For 3D pages, add the args `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- Breach exposes `window.__TX` when `window.__GS_TEST=1` is set before the page loads.
- Rendering is roughly 50× slower than a real GPU.

## 5. Icons and UI conventions

- **Icons:** `ico('trophy')` returns an inline SVG line icon (24×24, drawn in the text colour). In `el()`, use `html:ico(...)`.
  - Available names: trophy, x, expand, phone, share, link, calendar, check, flame, globe, compass, puzzle, sparkle, pawn, io, star, dice, target, gear, bulb, wrench, heart, clock, bolt, pad, mute, keys, school, cone, lock, shuffle, back, laptop, medal, flag, note, leaf, eye, fork, plus, sound.
  - Add new icons to `ICONS` in `core.js`.
  - For static HTML, generate the same markup with Node, reusing `ico()` from `core.js`.
- **Buttons:** `.btn` has a 10px radius. No pill (99px) buttons; round shapes are fine for progress bars and toggle tracks.
- **Emoji inside game artwork and gameplay** (card suits, chess pieces, props) is fine. Only UI icons must use `ico()`.

## 6. Art pipeline (`assets/`)

- `assets/tex`, `assets/hdr`, `assets/models`, `assets/chars`: CC0 textures, skies, props and rigged characters, used through `js/lib/bk.js` (`withArt`, `K.pbr`, `K.env`, `K.prop`, `K.human`).
- `assets/lib/`: local copies of three.js, Matter.js, d3 and topojson. `core.js` and `geo.js` load them locally first.
- `assets/fonts/`: self-hosted fonts (`css/fonts.css`).
- `assets/CREDITS.txt`: attributions.

## 7. Suggested next steps

1. Get the owner's answer on moving in-progress games to the main list.
2. Work through the "needs work" list, starting with the plain-looks / thin-content group (quick wins).
3. Neon Harbor: swap its procedural cars for a low-poly CC0 car model.
4. Deploy only when the owner says "deploy".
