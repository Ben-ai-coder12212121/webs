# Detourr

Free browser games at https://detourr.net. No sign-up, no ads.

## How the site is laid out

Each game is its own page. There is no build step: edit a file, refresh the browser.

| Path | What it is |
|---|---|
| `index.html` | The homepage: the grid, filters, search and the random button. It links to the game pages and contains no game code. |
| `games/<name>/index.html` | One page per game, e.g. `games/overlord/`, `games/havoc-unleashed/`, `games/bonk-buddy/`, `games/2048/`. The game's own code is in the `<script>` marked `===== <name>: game code =====`; styles only that game uses are in its `<style>`. The description below is what search engines read. |
| `games/_hidden/<name>/` | Games taken off the site (3D shooters being reworked). Not listed and not indexed. |
| `js/core.js` | Helpers every game can use: `el`, `S` (saved scores), sound, the 3D engine (`Stage3D`, `with3D`, `load3D`) and shared game helpers. |
| `js/catalog.js` | Every game's listing: name, blurb, card art, section, score format and page address. The homepage is built from this. |
| `js/lib/*.js` | Code shared by a family of games (e.g. `havoc.js` for Havoc Unleashed and Overlord, `bk.js` for the big story games). A game page loads only the ones it needs. |
| `js/lib/mob.js` | Helpers for the portrait, touch-first mobile games (sharp canvas, swipe and drag input, particles). |
| `js/lib/qchar.js` | Animated glTF characters (CC0 Quaternius models and motion clips): pick an outfit, cloth colour, hair and headwear, then play clips like `Walk_Loop` or `Sword_Attack`. Used by Moonblade. The asset build scripts are in `tools/assets/`. |
| `js/app.js` | The game player (top bar, difficulty, leaderboards, full screen, "Another detourr") and the homepage grid. The top section's order is the `TOP` list here. |
| `css/site.css` | Shared styles. |
| `assets/`, `geo/`, `hypeimg/` | Art, map data and photos that some games load. `GAMES.md` lists which games need which files. |
| `netlify/functions/` | Leaderboards, multiplayer and the suggestion box (these only run on Netlify). |
| `_redirects`, `netlify.toml` | Netlify redirects and deploy rules. |
| `tools/test-games.cjs` | Opens every game page in a headless browser and reports errors. |
| `src/` | The old single-file build system. Archived: the site no longer builds from it. |

Every page loads, in order: `css/site.css`, `js/core.js`, `js/catalog.js`, the game's `js/lib/` files, the game's own code, `js/app.js`.

### Editing

- **Change a game:** edit `games/<name>/index.html`. If the change is in a `js/lib/` file, it affects every game that loads it (listed in `GAMES.md`).
- **Change a game's name, blurb, card art or section on the homepage:** edit its line in `js/catalog.js`. The catalog's details win over the ones in the game's own code.
- **Add a game:** copy a simple page such as `games/2048/index.html` to `games/<new-name>/index.html`, change `window.PAGE_GAME`, the title and description, and the game code, then add a line to `js/catalog.js` with the same `id` and `"url":"/games/<new-name>/"`.
- **Old links keep working:** `/#<id>` links from before the split forward to the game's page, and `/games/<name>.html` redirects to `/games/<name>/` (see `_redirects`).

## Online play with friends

`js/lib/online.js` adds a **🌐 Play online** button to multiplayer games. One player creates a room and shares the 5-letter code or the invite link (`?room=CODE`); friends join with it. Browsers connect directly to each other (WebRTC). The Netlify function `/api/mp` only matches players up, so a match costs a handful of function calls. Some school and work networks block direct connections.

- **Friend vs friend (turn-based):** Tic-Tac-Toe, Four in a Row, Chess, Checkers, Mancala, Dots & Boxes, Fleet Strike.
- **Friend vs friend (real time):** Paddle Ball, Air Hockey, Tennis, Street Rumble, Penalty Shootout.
- **Friends join the host's game in place of computer players:** all seven .io games (Blob Feast, Noodle, Absorb, Paper Land, Swallow, Tank Arena, Sumo Bash), Four Colors, Detourr Rally.
- Breach 5v5 and Last Drop have their own server-browser online mode.

In games where the host's browser runs the game, friends send their controls and get back what they can see about 15–30 times a second.

To try online play locally, run `node tools/dev-server.mjs` (it serves the site and a local copy of the room server) and open the game in two browser tabs.

## Preview locally (free)

You need [Node.js](https://nodejs.org). From the project folder:

```sh
npx serve .
```

Open the address it prints (usually http://localhost:3000). To test online play too, use `node tools/dev-server.mjs` instead. Use a local server rather than opening files directly: pages load shared files from `/js/` and `/css/`. Everything works locally except the leaderboards and suggestion box, which run on Netlify.

To check every game for errors (takes about 15 minutes):

```sh
npx http-server . -p 8766 -s &
npm i --no-save playwright && npx playwright install chromium
node tools/test-games.cjs http://localhost:8766
```

It prints `ALL CLEAN` when every game opens without errors. Pass game ids to test only some: `node tools/test-games.cjs http://localhost:8766 hs_villain 2048`.

## Deploying

Netlify deploys from GitHub, and production deploys cost credits, so pushes don't go live on their own:

- **`preview` branch:** push work here to try it at https://preview--detourr.netlify.app (free branch deploy; log in to Netlify to view it).
- **Live branch (`claude/website-sync-claude-code-ctibq1`):** Netlify skips every push unless the latest commit message contains `[deploy]` (the `ignore` rule in `netlify.toml`). To go live, merge `preview` into it with a commit whose message contains `[deploy]`.
- Netlify's Deploys page also has **Lock to stop auto publishing**, a manual switch that stops anything from going live until you unlock it.

## Credits

Map data from [world-atlas](https://github.com/topojson/world-atlas) and [us-atlas](https://github.com/topojson/us-atlas); flags from [flag-icons](https://github.com/lipis/flag-icons) (MIT). Game art credits are in `assets/CREDITS.txt`. Libraries load from CDNs when a game needs them: three.js (3D games), Matter.js (physics games), d3-geo and topojson-client (map games).
