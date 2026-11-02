# 1v1 Gun Game

A browser first-person 1v1 Gun Game against an AI bot or another player online. Built with Three.js, with no build step and no asset files: models, textures and sounds are all generated in code.

Open `play/index.html` through any static web server (`node tools/dev-server.mjs` also runs the online room server).

## Rules
- Every kill upgrades your weapon. The first player to get a kill with the knife (the last rung) wins. If time runs out, whoever is further up the ladder wins.
- **Weapon ladders** (menu): Standard (12), Classic (the original 9), Full Arsenal (all 20), Quick (6), Heavy Metal (9) or Random (10 random guns, easiest first, rolled every match). Online, the host's ladder is used.
- A melee kill (V) **humiliates** the victim, which sets them back one weapon. Killing yourself (rocket, grenade) also costs you a weapon.
- **Killstreaks**: 3 kills = UAV (enemy on your minimap), 5 = Armor (absorbs 60% of damage until it breaks), 7 = Airstrike (a jet bombs the enemy's area; incoming bombs show on the minimap).
- **Grenades**: two per life (G or middle mouse). They bounce and go off after about 2 seconds. A red icon warns you when an enemy grenade is near.
- **Movement**: crouch while sprinting to **slide**; jump out of a slide to keep the speed. Explosions knock you around, so rocket and grenade jumps work. Jump pads launch you onto high ground. Ice is slippery; water slows you down.
- **Power-ups**: Speed Boost, Health Regen, Double Damage and Armor.
- **Medals** pop up for First Blood, Headshot, Longshot, Point Blank, Revenge, Comeback, Backstab, Airborne, Top Gun, Slider, Last Stand, Quickdraw, Buzzkill, streaks and more.
- The final kill plays in slow motion before the results.
- There's an easter egg somewhere in the back yards of the suburban map. Press E near it.

## Weapons
| Class | Weapons |
|---|---|
| Pistols | Pistol, Magnum Revolver |
| SMGs | Machine Pistol, SMG |
| Rifles | Burst Rifle (3-round burst), Assault Rifle, Battle Rifle |
| Shotguns | Shotgun, Double Barrel, Auto Shotgun |
| Heavy | LMG, Minigun (spins up before it fires) |
| Marksman / Sniper | Marksman Rifle, Lever Rifle, Sniper |
| Special | Railgun (shoots through walls, 75% damage), Crossbow (arcing bolts that stick in walls) |
| Launchers | Grenade Launcher (bouncing rounds, burst on contact or after 1.6 s), Rocket Launcher |
| Melee | Knife |

## Maps
All maps are point-symmetric (each half is the other rotated 180°), so neither spawn side has an advantage.

| Map | Theme | Features |
|---|---|---|
| Nuketown (Style) | Suburbia | The original: two houses across a street, a bus, the bunker easter egg |
| Dust Yard | Desert | Barracks with roof access, a market street, a central watchtower with jump pads, dust storm |
| Frostbite | Snow | Slippery frozen lake with a hut, raised research stations, walk-through container stacks, snowfall |
| Temple Ruins | Jungle | Stepped temple with a shrine on top, a wading stream on each side, crumbling walls |
| Steelyard | Construction | Two-storey steel frame, scaffolding, crawl-through pipes, jump pads to the second floor |
| Neon Killhouse | Arena (night) | Compact plywood rooms, team-coloured neon, overwatch platform with stairs and jump pads |

The Lighting option can force Day, Sunset or Night on any map ("Map" uses each map's own look). At night and dusk the map's lamps light up.

## Online
- **Quick Match** pairs you with a random player: it joins an open quick-match room or opens one and waits. If two players open rooms at the same moment, the one with the later code switches to the other's room.
- **Play a Friend** makes a room with a 5-letter code and an invite link (`?room=CODE`). On detourr.net the link points at the Detourr game page.
- Players connect directly over WebRTC. Detourr's `/api/mp` function only lists rooms and passes the connection setup along (same protocol as the site's `js/lib/online.js`, game id `gungame1v1`). Online play needs that function, so it doesn't work outside detourr.net or `tools/dev-server.mjs`.
- Each game runs its own player (movement, health, armor, weapons, ladder progress) and sends position and stats 20 times a second. Hits are judged on the shooter's screen and sent to the other game; projectiles, grenades and airstrikes are simulated on both screens, but only the owner's screen deals their damage. The victim's game reports the death, and the killer's game then awards the kill. The host's clock decides the time limit, and the host's map, ladder, kills-per-weapon and time settings are used.
- `js/net.js` handles the connection and `js/online.js` handles matchmaking and the start, rematch and leave messages. The match messages are handled in `Game.onNet()` in `js/main.js`. Bump `PROTO` in `net.js` when the messages change, so old and new versions never get matched (it is 2 since the maps/weapons update).

## Controls
WASD to move, mouse to look, LMB to fire, RMB or Q to aim, Shift to sprint, Space to jump, hold C to crouch (slide while sprinting), R to reload, V to melee, G or middle mouse for a grenade, E to use, Tab for the scoreboard, Esc to pause. On phones and tablets the game shows touch controls: a stick on the left, drag on the right to look, and action buttons (including NADE).

## Code layout
| File | Purpose |
|---|---|
| `js/main.js` | Game loop, player controller (slides, pads, zones), combat, projectiles, grenades, airstrikes, medals, viewmodel, match flow |
| `js/map.js` | Map registry, the shared map kit (merged geometry per material, builder helpers like stairs, containers, lamps and jump pads), nav waypoint generation, minimap |
| `js/maps/*.js` | One file per map. Each exports `{ id, name, light, build(K) }`; `build` returns bounds, spawns, nav points/links, pickups, zones and weather |
| `js/bot.js` | Bot AI: A* over waypoints, perception, aim error, ballistic aim, grenades, slides, falling back to cover when hurt, 4 difficulties |
| `js/physics.js` | AABB world: body movement with step-up, ray casts, line of sight |
| `js/weapons.js` | Weapon stats, ladders, and box models (the same data draws the 3D guns and the HUD icons) |
| `js/character.js` | Blocky character models and skins (Blue/Red team, Urban, Desert, Camo) |
| `js/hud.js`, `js/touch.js` | HUD, menus, medals, damage numbers, grenade warnings, and touch controls |
| `js/net.js`, `js/online.js` | Online play: WebRTC links through `/api/mp`, Quick Match, friend rooms, rematches |
| `js/effects.js`, `js/audio.js`, `js/textures.js` | Particles, tracers and railgun beams; WebAudio synthesized sounds; canvas textures |

### Adding a map
Copy one of `js/maps/*.js`, give it a new `id`, and add it to `MAPS` in `js/map.js`. Build the south half with `K.builder(s)` inside `for (const s of [1, -1])` so it is mirrored, and centre pieces once with `K.B0`. Ground-level nav points are generated on a grid; list raised floors in `navSouth` and connect stairs with `navLinks` (pairs of `[x, y, z]`). Add a thumbnail class in `style.css` (`.thumb.<thumb>`).

Three.js r160 is vendored in `vendor/` (MIT license).
