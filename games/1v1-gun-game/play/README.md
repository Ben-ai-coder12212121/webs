# 1v1 Gun Game — Nuketown (Style)

A browser first-person 1v1 Gun Game against an AI bot on a Nuketown-style map. Built with Three.js, with no build step and no asset files: models, textures and sounds are all generated in code.

Open `gungame/index.html` through any static web server (on the deployed site it's at `/gungame/`).

## Rules
- Every kill upgrades your weapon: Pistol → SMG → Assault Rifle → Shotgun → Sniper → LMG → Marksman Rifle → Rocket Launcher → Knife.
- The first player to get a kill with the knife wins. If time runs out, whoever is further up the ladder wins.
- A melee kill (V) **humiliates** the victim, which sets them back one weapon. Dying to your own rocket also costs you a weapon.
- A 3-kill streak gives you a UAV, which shows the enemy on your minimap.
- Power-ups: Speed Boost, Health Regen and Double Damage.
- There's an easter egg somewhere in the back yards. Press E near it.

## Online
- **Quick Match** pairs you with a random player: it joins an open quick-match room or opens one and waits. If two players open rooms at the same moment, the one with the later code switches to the other's room.
- **Play a Friend** makes a room with a 5-letter code and an invite link (`?room=CODE`). On detourr.net the link points at the Detourr game page.
- Players connect directly over WebRTC. Detourr's `/api/mp` function only lists rooms and passes the connection setup along (same protocol as the site's `js/lib/online.js`, game id `gungame1v1`). Online play needs that function, so it doesn't work outside detourr.net or `tools/dev-server.mjs`.
- Each game runs its own player (movement, health, weapons, ladder progress) and sends position and stats 20 times a second. Hits are judged on the shooter's screen and sent to the other game. The victim's game reports the death, and the killer's game then awards the kill. The host's clock decides the time limit, and the host's kills-per-weapon and time settings are used.
- `js/net.js` handles the connection and `js/online.js` handles matchmaking and the start, rematch and leave messages. The match messages are handled in `Game.onNet()` in `js/main.js`. Bump `PROTO` in `net.js` when the messages change, so old and new versions never get matched.

## Controls
WASD to move, mouse to look, LMB to fire, RMB or Q to aim, Shift to sprint, Space to jump, hold C to crouch, R to reload, V to melee, E to use, Tab for the scoreboard, Esc to pause. On phones and tablets the game shows touch controls: a stick on the left, drag on the right to look, and action buttons.

## Code layout
| File | Purpose |
|---|---|
| `js/main.js` | Game loop, player controller, combat, viewmodel, match flow |
| `js/map.js` | Nuketown-style level (point-symmetric), colliders, spawns, nav waypoints, minimap |
| `js/bot.js` | Bot AI: A* over waypoints, perception, aim error, weapon-specific tactics, 4 difficulties |
| `js/physics.js` | AABB world: body movement with step-up, ray casts, line of sight |
| `js/weapons.js` | Weapon stats plus box models (the same data draws the 3D guns and the HUD icons) |
| `js/character.js` | Blocky character models and skins (Blue/Red team, Urban, Desert, Camo) |
| `js/hud.js`, `js/touch.js` | HUD, menus and touch controls |
| `js/net.js`, `js/online.js` | Online play: WebRTC links through `/api/mp`, Quick Match, friend rooms, rematches |
| `js/effects.js`, `js/audio.js`, `js/textures.js` | Particles and tracers, WebAudio synthesized sounds, canvas textures |

Three.js r160 is vendored in `vendor/` (MIT license).
