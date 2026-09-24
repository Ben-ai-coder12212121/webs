# Detour

A collection of free browser games, puzzles, sports challenges, music toys and time-killers. No sign-up, no ads.

Synced from the Claude artifact:
https://claude.ai/code/artifact/9fa7501d-64c2-425a-a97f-c56062a25530

## Files

- `index.html`: the whole site, with its HTML, CSS and JavaScript in one file
- `hypeimg/`: the images used by the Hype Check game
- `geo/`: map data for the geography games (world countries and US states from
  [world-atlas](https://github.com/topojson/world-atlas) and
  [us-atlas](https://github.com/topojson/us-atlas)) and the flag images, bundled
  into `flags.json` from [flag-icons](https://github.com/lipis/flag-icons) (MIT)

Libraries are loaded from CDNs when a game needs them: three.js (3D games),
Matter.js (physics games), and d3-geo and topojson-client (map games).

The geography games load files with `fetch`, so use a local server (below)
rather than opening the file directly.

## Running locally

It's a static site. Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.
