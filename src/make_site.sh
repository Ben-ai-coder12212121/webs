#!/bin/sh
# ARCHIVED (2026-09-28): the site was split into one page per game (see README.md).
# Running this would overwrite the new index.html with the old single-file build, so it stops here.
echo "src/make_site.sh is archived: edit games/<name>/index.html, js/ and css/ directly (see README.md)." >&2; exit 1
# Full Detourr build: index.html, then per-game SEO pages, sitemap, robots, A-Z list.
set -e
H=$(cd "$(dirname "$0")" && pwd)
python3 $H/heroes/build.py $H/srv/test.html >/dev/null
node $H/heroes/gen_meta.js $H/srv/test.html $H/meta.json
python3 $H/heroes/build.py
python3 $H/heroes/gen_site.py $H/meta.json $(cd "$H/.." && pwd)
