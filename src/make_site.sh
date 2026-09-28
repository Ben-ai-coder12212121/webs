#!/bin/sh
# Full Detourr build: index.html, then per-game SEO pages, sitemap, robots, A-Z list.
set -e
H=$(cd "$(dirname "$0")" && pwd)
python3 $H/heroes/build.py $H/srv/test.html >/dev/null
node $H/heroes/gen_meta.js $H/srv/test.html $H/meta.json
python3 $H/heroes/build.py
python3 $H/heroes/gen_site.py $H/meta.json $(cd "$H/.." && pwd)
