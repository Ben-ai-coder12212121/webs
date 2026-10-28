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

## Controls
WASD to move, mouse to look, LMB to fire, RMB or Q to aim, Shift to sprint, Space to jump, C to crouch, R to reload, V to melee, E to use, Tab for the scoreboard, Esc to pause. On phones and tablets the game shows touch controls: a stick on the left, drag on the right to look, and action buttons.

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
| `js/effects.js`, `js/audio.js`, `js/textures.js` | Particles and tracers, WebAudio synthesized sounds, canvas textures |

Three.js r160 is vendored in `vendor/` (MIT license).
