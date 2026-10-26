# Handoff: Detourr (detourr.net)

Read this first when picking the project up in a new session. It covers what the project is, where things stand, how to build, test and ship, and the rules the owner has set.

_Last updated: 2026-09-29 (after the site checklist pass: privacy and terms pages, line icons, honest counts)._

---

## 1. What this is

**Detourr** is a free browser-games site for bored students: 272 games in the catalog, of which **158 are public**. The rest are hidden (69 removed: 50 in the audit, 19 in the owner's game review; plus 8 shelved shooter prototypes) or in progress (41). No sign-up, no ads, runs on school Chromebooks and phones.

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
2. **Every new or rebuilt game goes in "🚧 In progress" (`WIP_IDS` at the top of `js/app.js`), not the main list, and stays there until the owner has checked it and says it is done.** Never run `tools/release-game.cjs` on your own judgement. In-progress games must not be picked by the random button. `tools/new-game.cjs` enforces this: a brand-new id always lands in In progress, and re-running it for an existing game keeps its current place. (Going live still needs the owner's "deploy", rule 1.)
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

- **Live:** commit `8f2b573` "Release: reviews and ratings, rewards, 16+ notice … [deploy]". Preview and live are identical (the release merge took preview's Lumberjack page over the earlier round 3 cherry-pick).
- **Last full check:** `tools/test-games.cjs` reported **288 games tested, ALL CLEAN** (Oct 26 2026).
- **Open question for the owner:** should any of the 10 in-progress games move to the main list?

**Online polling cost (`js/lib/online.js`):** a host polls `/api/mp` every 1.3 s only while someone is connecting or for 20 s after the room changes, otherwise every 5 s (8 s in a hidden tab); heartbeats stay at 8 s (rooms go stale after 25 s). An idle public room went from about 27 calls per 30 s to about 10. Lumberjack and Disaster Dash open public rooms by default, so watch the Netlify function count.

### Built from the Oct 19-26 2026 request lists (all installed, all In progress, all live)

Builder agents write one deliverable each to the session scratchpad (`/tmp/claude-0/-home-user-webs/b2fe29ec-6401-52e7-8b76-eda5b927e5c7/scratchpad/`); the main session reviews screenshots, installs with `node tools/new-game.cjs <file> [--wip] [--libs=...]`, deletes the agent's `games/_*` test page, runs `node tools/allgames.cjs` and `tools/test-games.cjs`, commits to `preview`. Every new or rebuilt game goes to In progress. Not deployed until the owner says "deploy".

| Deliverable | Game | Install |
|---|---|---|
| `lumber3d.js` | Lumberjack rounds 3 and 4 (round 4 on preview only: toon look from the owner's TikTok references, patched three.js shader chunks restored on exit, first-person chopping with gloved hands, trees break into ~3 m chunks, crane remote (key 4), 5,000 starting loan paid at Pinecrest Bank, aggressive deer, raccoon that raids trucks) | INSTALLED (games/lumberjack-tycoon, In progress). Online by default (Play joins the busiest public world or hosts one; Play alone), own spawn and starter pickup, guests buy their own cars, passenger and truck-bed seats, bare-hands start, carry on your back, gems and classes at the Gem Stump, timed haul jobs, wobbly loads and straps, rebuildable bridges, the goose. Source in the session scratchpad `parts/` + `build.sh` |
| `disaster.js` | Natural disaster multiplayer survival | INSTALLED as Disaster Dash (games/disaster-dash, In progress) |
| `west3d.js` | Wild West sandbox (Westwood-inspired) | INSTALLED as Dusty Gulch (games/dusty-gulch, In progress) |
| `getaway3d.js` | Road-trip getaway (Runaways-inspired) | INSTALLED as Long Haul Runaway (games/long-haul-runaway, In progress) |
| `hustle3d.js` | First-person dealer sim, adult customers only, `age:16` | INSTALLED as Corner Hustle (In progress, age notice) |
| `cookempire.js` | Chemistry-teacher cook empire sim, fictional chemistry only, `age:16` | INSTALLED as Cook Theory (games/cook-theory, In progress, age notice) |
| `growop.js` | Licensed grow-op tycoon, `age:16` | INSTALLED as Green Thumb Grow Co. (In progress, age notice) |
| `hole.js` | Black hole orbit dodge, recreated from the owner's screen recording | INSTALLED as Rim Runner (games/rim-runner, In progress) |
| `climb3d.js` | Co-op mountain climb (Fall 2: Deadpoint reference) | INSTALLED as Summit Fall (games/summit-fall, In progress) |

Owner answers this round: drug games approved for 16+ players (built with the age notice); all sports games moved to In progress until the owner decides what's wrong with them; Bonk Buddy is fine now.

### Recently done (newest first)

- **Knuckle Through released** (`games/knuckle-through/`, id `knuckle`): out of In progress, indexable, in the sitemap, and in `MAJOR` so it shows under "Big games only" (it already has `big:true` for "Big 3D & story"). It is a first-person 3D digging tycoon: one 20×12×5000 voxel wall in 17 strata, fracture debris, a structural-support solver for cave-ins, health with falling-rock and fall damage, a dig crew, finds and a hidden needle per mountain. The game is a self-contained `KnuckleThrough(host, env)` that mounts in a shadow root inside a `.g3` frame, uses the local three.js r128 via `with3D`, the site Sound button and `c.best` (metres dug). Fonts Big Shoulders Stencil Display, IBM Plex Sans Condensed and Silkscreen are self-hosted in `assets/fonts/`. Still worth a real-mouse playtest for balance. Later added tools 4 to 6 (sledgehammer with area smash, throwable dynamite that chains and can hurt you, a mining laser that overheats), machines (drill rigs bolted to the face, a rock crusher that sells rubble, a tunnel boring machine), and upgrades (roof bolts, ground radar, geologist, tool tiers). Locked tools stay hidden until bought. The game source is built from one file and pasted in with `node tools/new-game.cjs <file>` (no `--wip`). Then added tools 7 to 9 (rock saw, cryo sprayer that makes rock brittle, singularity charge that eats rock and rubble), machines (excavator, blasting drones that wait for you to step clear, laser turrets), and rewrote the robot vacuums (they suck up everything nearby, hover to ledges, hold rubble in hoppers when the bag is full, and no longer get stuck on top of the rock). Machines find the tunnel floor with `groundAt()`, not `floorBelow(…, GY - 1, …)`, which lands on top of undug rock. A lighting change (brighter deep rock, helmet spotlight, more lamps) was tried and reverted at the owner's request: they prefer the original darker look, so leave the base lighting alone. The Headlamp upgrade came back on request: a helmet spotlight that is off at level 0 (so the default look is unchanged) and gets brighter and longer per level. Graphics pass after that: the world renders at screen resolution (hands and numbers stay pixel art), Phong rock with a height map, per-material gloss and glowing veins (magma, neutronium, crystal) from maps painted with the atlas, baked corner shading on voxel faces, textured machine skins, bloom + vignette post pass, soft round dust and grit, drifting dust in the headlamp. All of it is off when the site's Graphics button is on Low (`env.lowGfx`), which keeps the old chunky renderer.
  - **Endless tunnel (replaces the short-lived "next mountain" reset):** the owner wanted the game to keep going and get harder instead of restarting. `MTN = 5000` slices is one mountain and `DEEP = MTN * 20` is the end of the world. Breaking through the last slice of a mountain shows the "Broke through / Mountain N." screen (Keep digging) and the tunnel runs straight into the next mountain; there is no walk-out into daylight any more. Later mountains reuse the mountain layers in a seeded order ending in the heart (`STRATA` is extended at load; each layer has `mtn`, `j`, `of`). Rock HP follows the designed curve to 5,100 slices, then climbs 10^0.14 per 100 slices; value keeps `1.008^d`. Finds repeat per mountain (`z % MTN`). One needle per mountain (`S.needle.k`), each later needle ×1.5 damage ×1.25 value. Saves store fully dug slices as `dugFull` runs. Saves from the reset version (field `mtn`) are shifted back onto the long tunnel; old saves standing outside the old exit drop back to just behind the face. Balance past 2.5 km is an extrapolation and untested by a real player.
  - **Destruction restored (owner: "made it worse, the destruction isn't as good, go back"):** removed the far-away dust/grit culling and the automatic render-scale drop. Cave-ins match the original single check again: alongside the per-dig windows, `supportSweep()` walks every slice between the shallowest and deepest dig (160 slices per check, 24 padding), so stressed rock is found in the same places (verified identical to the pre-change build) at about 5 ms per check instead of ~107 ms. Rock past 5,100 slices now climbs 10^0.07 per 100 slices (was 0.14) because deep digging took too long.
  - **No offline progress** (owner request: it went too fast): the crew and machines only work while the game is open. The offline code was removed.
  - **Work Boots** go to level 20 (+15% per level to 6, then +30%), and movement runs in sub-steps so high speed can't pass through walls.
  - **Late-game lag fix (live):** after hours of play with many machines the game slowed down. Causes and fixes, no features removed:
    - The cave-in solver ran 8 times a second over one z range from the shallowest to the deepest dig since the last run, so machines far apart (crew near the top, tunnel borer deep) made it scan up to thousands of layers (38 ms per run over 2,000 layers). `requestSupport` now collects depths in `supZs`; `analyzeSupport` merges nearby ones and runs `supportWindow(z0, z1)` per cluster with reused buffers. Results are identical for every requested site.
    - Autosave re-encoded every dug slice every 5 s. Encoded slices are now cached in `saveDug` and only depths in `saveDirtyZ` are re-encoded; autosave runs every 15 s in idle time (hide, close and leave still save at once). `dispose.serialize` hands the host a copy.
    - Grit and dust beyond the fog (`fxRange = 2.6 / fog density`) are not spawned, dead particles are removed in one pass instead of `splice`/`shift`, stressed-rock grit respects `PMAX`.
    - HUD only rewrites `innerHTML` when the text changed (`setHTML`); rigs retarget without building lists; `recomputeFront` sorts a reused typed array.
    - High graphics only: if play runs under ~36 fps for 3 s the 3D view drops 10% in resolution (`renderScale`, floor 0.6), tries one step up after 20 smooth seconds, and stays put if that step was too much.
- **Paint Boy fixed and extended:**
  - From about level 12 the random mazes stopped growing (about 40 tiles), and some came out as a single tile, which can't be won (5% at level 12, 20%+ by level 20). That's why the owner felt the levels stop at 12.
  - Now each level is a seeded maze, so it's the same every time. The grid grows up to 17×17, and the builder keeps the best of up to 400 attempts, aiming for 30% of the grid, with a square-loop fallback. Difficulty changes the grid by ±1.
  - Checked headless: levels 1 to 60 on all difficulties can all be finished, with 90 to 110 tiles late on and builds under 50ms.
  - New: Undo (U/Backspace or button), Enter/Space/arrow goes to the next level, and the best move count per level (`pb_mv_<lvl>_<difficulty>`).
- **No more blur mid-game on High:** `Stage3D` (`core.js`) used to lower the render resolution (down to 0.55) whenever frames took over 24ms, so games like Octagon went blurry on phones after a few seconds. That adaptive drop now only happens in Low graphics.
- **Graphics default to High on every device, every time** (owner request; the old automatic Low on Chromebooks and weaker devices is gone). The Graphics button toggles High/Low for this browser tab only: `sessionStorage unb_gfx` (`gfxMode()`/`gfxLow()` in `core.js`). The superhero games' G toggle works the same way (`sessionStorage unb_hx_hq`).
- **Homepage trimmed:** the Silent and Keyboard-only filters and the "Today's top" box were removed.
- **Mobile pass and sign fix:**
  - The homepage sign's shadow is now drawn inside the SVG (`.bigsh`). The old CSS `drop-shadow` on a rotating button left a seam in Safari after hover.
  - No random zooming: `touch-action:manipulation` on `html` (no double-tap zoom), 16px text boxes on touch screens (iOS zooms into smaller ones), and `text-size-adjust:100%`.
  - Phones (≤640px):
    - Top-bar buttons are icon-only (the Sound and "Another detourr" buttons now have icons, with text in `.t`).
    - The game bar is one row. The less-used settings (difficulty, graphics, full screen, theme, sound) have class `.sbopt` and sit behind a "⋯" button (`.sbmore`).
    - The homepage has a smaller sign, one swipeable row of filters, and two compact cards per row.
    - The end-of-round strip is smaller and never shows for a score of 0.
  - The "turn your phone sideways" overlay is now a small bottom tip that hides itself after 9s. Closing it keeps it off (`S rotTipOff`).
  - Stillshot's "go full screen" bar hides itself after 9s, and closing it keeps it off (`S ssFsHintOff`).
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

### Analytics and the homepage first screen (Oct 2026)

- **Ratings and reviews (`RATE` in `js/app.js`, `netlify/functions/reviews.mjs`, Netlify Blobs store `reviews`):** every game page shows a "Rate this game" bar under the game (appears after the first click/key in the game or 40 s), 1 to 5 stars, changing it replaces the old rating. Homepage tiles show the real average once a game has 3+ ratings. The homepage has a "What players think of Detourr" section (`#reviews`): average, star breakdown, a review form (stars, optional text filtered with `cleanText` from ideas.mjs, optional name), recent written reviews. One live review per player id (`lb_id`), 2 reviews per day. Remove a review with `DELETE /api/reviews?review=ID&key=REVIEWS_ADMIN_KEY` (falls back to `IDEAS_ADMIN_KEY`). All numbers are real; nothing is seeded.
- **Rewards (`RW` in `js/app.js`, styles at the end of `css/site.css`):** 1 point per minute of active play (a game open, tab visible, input in the last 60 s; ticks every 5 s on game pages, tabs don't double count via `rw.last`). Daily bonus after 10 min of play in a day: 10 points, +5 per back-to-back day up to 30. Shop (dialog `#rewards`, opened from the "reward points" card next to the badges): card packs 60 / bundle of 5 for 270 (adds to `S 'rw_packs'`, which the card game consumes; `PACK_GAME` is its id), 6 patches 300 to 1440, 18 jerseys in three tiers: Club 2880 (48 h), Pro 5760 (96 h), Legend 10080 (168 h = 7 days of play). The jersey you wear shows on the back with your leaderboard name and a number you pick, and next to your name on leaderboards (sent as `jersey` with a new best, stored as `j` by `lb.mjs`, so it appears after the player's next best). Save key `unb_rw`. Device only, like the rest of the progress. GA events `reward_buy`, `rewards_open`.
- **Age notice (`ageGate` in `js/app.js`):** a game with `age:16` in its listing (kept by new-game.cjs and catalog-lite.cjs) shows a "For players 16 and up" card before it starts; accepting saves `unb_age_ok` (one acceptance covers every game up to that age). Age games are left out of Classroom mode and of every random or recommended pick (`randOK`), but stay in the grid and in Continue playing. Used for the owner-requested teen crime/grow games.
- **Games only filter:** the modes row has "Games only" (owner: strictly game games), which hides `NOT_GAMES` kinds (toy, info, weird, chill, puzzle, escape, geo) and `NOT_GAME_IDS` (word, memory and brain-test games filed under other kinds: hangman, memory, simon, typing, stroop, nummem, odd, tune, pianolearn, beatmaker). Filters renamed "Simple games" and "Big games".
- **Tracking (`TRACK` in `js/app.js`, right after `HIST`):** sends GA4 events through the page's `gtag` when present: `game_open`, `game_start` (first click, tap or key in the game), `game_time` (visible seconds, sent on hide/close/pagehide with beacon transport), `new_best` (at most once a minute per game), `random_game`, `home_pick` (first-screen cards, `source` continue/top), `filter`. User properties `visit_number` (counted on the device, a new visit after 30 min away; a wiped device shows as 1 again) and `device_kind` (chromebook/phone/tablet/computer from the user agent). The owner has to register custom dimensions in GA (event: `game_id`, `source`; user: `visit_number`, `device_kind`) and a custom metric `seconds` for these to show in reports.
- **Homepage first screen:** `#heroGames` under the headline, filled by `renderHero()`: Continue playing (the 3 most recent games in this device's `HIST`) and Top games from `TOP_PICKS` (6 for first-time visitors). Headline and sign were made smaller so the cards fit above the fold.
- **Random button:** players with fewer than 5 games in their history get a game from `TOP_PICKS` (was `CORE`).

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

**Owner's game review (Oct 2026):** the owner went through every game in a review page (private artifact https://claude.ai/artifact/RHnHhy9v459MhxaZZbVHrm, picks stored in its `choices` collection) and chose:
- **Removed (added to `HIDDEN`, 19):** Box Pusher, Bigger or Smaller, Capital Quiz, Continent Sort, Landmark Locator, Pin the City, Country Shapes, Goose Heist, Glow Spiro, Fact Machine, Jelly Buddies, Jigsaw, Kaleidoscope, Beat Lanes, Quick Math, Maze Runner, Pop Fidget, Sticky Goo, Teo's Escape.
- **Moved to In progress (added to `WIP_IDS`, 29):** Apex GT, Archery, Bowling, Breach 5v5, Darts, Field Goal, Tight Lines, Horizon Flight Sim, Gunmach, Hill Climb, Hoops, Dinger Derby, Frostline, Pocket, Titan, Spring Climber, Road Hopper, Rail Dash, Spiral Drop, Word Wheel, Open Road, Crash Dummy, Last Drop, Street Rumble, Farm Life, Lemonade Tycoon, Skyfront 1943, Tennis, Virus Attack. No notes were given on what each needs.
- Everything else was marked no change. `node tools/pull-game.cjs --wip|--hide <ids>` does the move (lists, noindex, sitemap); `tools/release-game.cjs` reverses `--wip`. Their ids are still in `TOP_PICKS`/`MAJOR`/`CORE`, which is harmless (the homepage drops in-progress and hidden games first) and keeps them ready to return.

**The owner chose to KEEP these 22** from the audit's remove list (Glow Spiro was later removed in the review), so don't hide them:
- breathe, gt_fireflies, ch_rain, info_life, info_pets, info_moon (gt_spiro below was removed in the review)
- info_prices, info_trip, info_clock, io_absorb, fifteen, scramble
- fishtank, fireworks, glowboard, gt_spiro, googly, pond
- lava, sparkler, spiro, warp, sand

### In progress (`WIP_IDS`)

| Game | What it needs |
|---|---|
| Lumberjack Tycoon | 3D open-world lumber game (`TimberTycoon(host, env)`, save key `unb_lumber3d_save`, installed with `--libs=online`). Round 2: PBR bark/ground textures, leaf-card trees, HDRI lighting, soft shadows, haze, wind grass and an animated character from `/assets`; chainsaws (3 tiers), a drivable tree-cutting machine, a log loader with crane, customer orders, daily order and login bonus, 24 awards, Cherry and Ironwood, a woodshop (beams, furniture crates), hired loggers and sellers (only while playing), storms, a rare giant tree; 4-player online co-op via `js/lib/online.js` (host world, per-player wallets, host owns land/machines). Source lives in the build agent's scratchpad (`parts/` + `build.sh`, which strips the `?ltdebug` hook). Needs a real-device fps check and longer play to tune prices; on short landscape phones the site header covers the bottom of the game unless full screen |
| Fishing Tycoon | 3D island fishing adventure (`TideCaster(host, env)`, save key `unb_fish3d_save`). Round 2 (owner: camera was bad and didn't follow the mouse): pointer-lock mouse look from an over-the-shoulder camera with collision (drag-to-look fallback and on touch), camera frames the bobber while fishing and sits behind the boat; HDRI lighting, textured terrain and buildings, `n_nature.glb` vegetation, an animated Quaternius fisherman, fish-leaps-to-hand catch moment, faster first bites and beginner luck, a Next goal line. Source in the build agent's scratchpad (`fish3d_work/`, `build.sh` strips the test hook). High graphics is heavier now: check on a mid laptop. 61 fish, 7 zones, rods, bait, boats, journal, bounties, day/night and weather. Leaderboard is total money earned |
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

**All sports games are in progress (owner, Oct 2026: "move all sports to in progress till I figure the issues out").** penalty, golf, airhockey, ski and kart joined the ones already there; the Sports filter button on the homepage is `hidden` while it would be empty. Bring them back with `tools/release-game.cjs` and remove `hidden` from `data-f="sports"` in index.html.

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
- `tools/new-game.cjs`: adds a new game page and catalog entry. New ids always go to In progress (owner rule); existing games keep their place.
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
