# Generates crawlable SEO pages for Detourr from meta.json (made by gen_meta.js):
#   games/<slug>/index.html for every game, sitemap.xml, robots.txt, favicon.svg,
#   and fills the <!--ALLGAMES--> A-Z list in index.html.
import json, re, sys, os, html, datetime

SITE = 'https://detourr.netlify.app'
ROOT = sys.argv[2] if len(sys.argv) > 2 else '/home/user/webs'
meta = json.load(open(sys.argv[1]))
games = meta['games']
KIND = {'game': 'Arcade & Quick', 'toy': 'Toys', 'chill': 'Chill', 'sports': 'Sports', 'music': 'Music', 'weird': 'Weird',
        'puzzle': 'Puzzle', 'shooter': '3D Shooter', 'hero': 'Superhero', 'smash': 'Smash & Physics', 'geo': 'Geography',
        'info': 'Cool Info', 'io': '.io', 'arcade': 'Arcade', 'casual': 'Casual', 'board': 'Board & Classic',
        'cooking': 'Cooking', 'sim': 'Simulator', 'escape': 'Escape Room'}
NOLB = {'toy', 'chill', 'info', 'smash'}
TOP = ['hs_kaiju', 'zsurv', 'stillshot', 'gunsim', 'hs_villain', 'hs_havoc', 'ph_buddy']
slug = lambda n: re.sub(r'^-+|-+$', '', re.sub(r'[^a-z0-9]+', '-', n.lower()))
esc = lambda s: html.escape(str(s), quote=True)
today = datetime.date.today().isoformat()
N = len(games)

def page(g, related):
    s = slug(g['name']); kind = KIND.get(g['kind'], 'Game'); url = f'{SITE}/games/{s}/'
    title = f"{g['name']}: Play Free Online, No Download | Detourr"
    desc = (g['blurb'] or f"Play {g['name']} free in your browser.").strip()
    if len(desc) > 155: desc = desc[:152].rsplit(' ', 1)[0] + '…'
    feats = ['Free, no download and no sign-up', 'Works on phones, tablets, Chromebooks and computers']
    if g['levels']: feats.append('Easy, Normal and Hard difficulty')
    if g['scored'] and g['kind'] not in NOLB: feats.append('Live leaderboard: beat other players’ high scores')
    if g['id'] in TOP: feats.insert(0, '⭐ One of Detourr’s top rated 3D games')
    ld = {"@context": "https://schema.org", "@type": "VideoGame", "name": g['name'], "description": g['blurb'], "url": url,
          "genre": kind, "gamePlatform": "Web browser", "applicationCategory": "Game", "operatingSystem": "Any",
          "isAccessibleForFree": True, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
          "publisher": {"@type": "Organization", "name": "Detourr", "url": SITE + '/'}}
    rel = ''.join(f'<a class="rg" href="/games/{slug(r["name"])}/"><span class="ra" style="background:{esc(r["tint"])}"><svg viewBox="0 0 120 72" aria-hidden="true">{r["art"]}</svg></span><b>{esc(r["name"])}</b></a>' for r in related)
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#FFD23F">
<meta property="og:type" content="website"><meta property="og:site_name" content="Detourr">
<meta property="og:title" content="{esc(g['name'])}: play free on Detourr"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{SITE}/og.png"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Figtree:wght@600;800;900&display=swap">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6D1DVZMJG8"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-6D1DVZMJG8');</script>
<script type="application/ld+json">{json.dumps(ld)}</script>
<style>
:root{{--ink:#1D1A2F;--sun:#FFD23F;--paper:#FFFDF6;--red:#F2352A}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--sun);color:var(--ink);font:600 17px/1.5 Figtree,system-ui,sans-serif}}
a{{color:inherit}}.wrap{{max-width:880px;margin:0 auto;padding:18px 16px 40px}}
.top{{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}}
.brand{{display:flex;align-items:center;gap:8px;text-decoration:none;font:900 28px/1 'Arial Black','Helvetica Neue',Arial,sans-serif;letter-spacing:-.06em;color:#161616}}.brand svg{{width:40px;height:40px}}
.pill{{background:var(--paper);border:3px solid var(--ink);border-radius:99px;padding:6px 14px;box-shadow:3px 3px 0 var(--ink);text-decoration:none;font-weight:800}}
.card{{background:var(--paper);border:3px solid var(--ink);border-radius:18px;box-shadow:6px 6px 0 var(--ink);overflow:hidden}}
.hero{{display:block;aspect-ratio:120/72;max-height:340px;width:100%;border-bottom:3px solid var(--ink)}}.hero svg{{width:100%;height:100%;display:block}}
.body{{padding:18px 22px 24px}}h1{{font:400 44px/1.05 'Bagel Fat One',system-ui;margin:4px 0 8px}}
.chip{{display:inline-block;background:var(--sun);border:2px solid var(--ink);border-radius:99px;padding:2px 10px;font-size:13px;font-weight:800}}
.play{{display:inline-block;margin:14px 0 6px;background:var(--red);color:#fff;border:3px solid var(--ink);border-radius:14px;padding:12px 26px;font:900 22px Figtree,system-ui;text-decoration:none;box-shadow:4px 4px 0 var(--ink)}}
ul.f{{padding-left:20px;margin:10px 0}}h2{{font:400 26px 'Bagel Fat One',system-ui;margin:28px 0 10px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}}
.rg{{display:block;background:var(--paper);border:3px solid var(--ink);border-radius:12px;overflow:hidden;text-decoration:none;box-shadow:3px 3px 0 var(--ink)}}
.rg .ra{{display:block;aspect-ratio:120/72;border-bottom:2px solid var(--ink)}}.rg svg{{width:100%;height:100%;display:block}}.rg b{{display:block;padding:6px 8px;font-size:14px}}
footer{{margin-top:30px;font-size:14px}}
</style></head><body><div class="wrap">
<div class="top"><a class="brand" href="/" aria-label="Detourr home"><svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(45 50 50)"><rect x="17" y="17" width="66" height="66" rx="7" fill="#161616"/><rect x="24.5" y="24.5" width="51" height="51" rx="3" fill="none" stroke="#FF7A1A" stroke-width="3.2"/></g><path d="M44.5 73V60.5C44.5 55.5 46.5 52.5 49.5 49.5L53.5 45.5C56 43 57 41 57 37.5V35" fill="none" stroke="#FF7A1A" stroke-width="8.5"/><path d="M47.5 37.5L56.5 24L66 37.5Z" fill="#FF7A1A"/></svg><span>detourr</span></a><a class="pill" href="/">All {N} games</a></div>
<main class="card"><a class="hero" href="/#{esc(g['id'])}" style="background:{esc(g['tint'])}" aria-label="Play {esc(g['name'])}"><svg viewBox="0 0 120 72" aria-hidden="true">{g['art']}</svg></a>
<div class="body"><span class="chip">{esc(kind)}</span><h1>{esc(g['name'])}</h1>
<p>{esc(g['blurb'])}</p>
<a class="play" href="/#{esc(g['id'])}">▶ Play {esc(g['name'])} free</a>
<ul class="f">{''.join(f'<li>{esc(f)}</li>' for f in feats)}</ul>
<p>{esc(g['name'])} is one of {N} free games on Detourr. It runs right in your browser, so there’s nothing to install and no account to make. Press play and it starts instantly.</p>
</div></main>
<h2>More {esc(kind)} games</h2><div class="grid">{rel}</div>
<footer><p><a href="/">← Back to all {N} free games on Detourr</a></p></footer>
</div></body></html>'''

by_kind = {}
for g in games: by_kind.setdefault(g['kind'], []).append(g)
os.makedirs(os.path.join(ROOT, 'games'), exist_ok=True)
for g in games:
    same = [x for x in by_kind[g['kind']] if x['id'] != g['id']]
    i = games.index(g); others = [x for x in games if x['kind'] != g['kind']]
    related = (same[:10] + [others[(i * 7 + k * 13) % len(others)] for k in range(4)])[:12]
    d = os.path.join(ROOT, 'games', slug(g['name'])); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w').write(page(g, related))

# remove pages for games that are no longer listed
import shutil
keep = {slug(g['name']) for g in games}
for d in os.listdir(os.path.join(ROOT, 'games')):
    if d not in keep and os.path.isdir(os.path.join(ROOT, 'games', d)):
        shutil.rmtree(os.path.join(ROOT, 'games', d))

# A-Z list injected into the home page footer (crawlable links to every game page)
order = ['hero', 'escape', 'sim', 'cooking', 'arcade', 'game', 'casual', 'io', 'puzzle', 'board', 'sports', 'smash', 'geo', 'music', 'weird', 'info', 'toy', 'chill']
secs = ''
for k in order + [k for k in by_kind if k not in order]:
    if k not in by_kind: continue
    items = ''.join(f'<li><a href="/games/{slug(g["name"])}/">{esc(g["name"])}</a></li>' for g in sorted(by_kind[k], key=lambda x: x['name'].lower()))
    secs += f'<div><h4>{esc(KIND.get(k, k))}</h4><ul>{items}</ul></div>'
allg = f'<details class="allgames"><summary>All {N} games A–Z</summary><div class="allcols">{secs}</div></details>'
ip = os.path.join(ROOT, 'index.html'); s = open(ip).read()
s = re.sub(r'<!--ALLGAMES-->(<details class="allgames">.*?</details>)?', '<!--ALLGAMES-->' + allg, s, count=1, flags=re.S)
if '.allgames{' not in s:
    s = s.replace('</style>', '.allgames{text-align:left;margin:10px auto 18px;max-width:1100px;background:var(--paper,#FFFDF6);border:3px solid #1D1A2F;border-radius:14px;padding:10px 16px}.allgames summary{cursor:pointer;font-weight:800}.allcols{columns:4 200px;column-gap:24px}.allcols div{break-inside:avoid;margin-bottom:10px}.allcols h4{margin:10px 0 4px}.allcols ul{margin:0;padding-left:18px;font-size:14px}</style>', 1)
open(ip, 'w').write(s)

urls = [(SITE + '/', '1.0')] + [(f'{SITE}/games/{slug(g["name"])}/', '0.9' if g['id'] in TOP else '0.7') for g in games]
open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{u}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>\n' for u, p in urls) + '</urlset>\n')
open(os.path.join(ROOT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nDisallow: /tiktok-ads/\nDisallow: /netlify/\n\nSitemap: {SITE}/sitemap.xml\n')
open(os.path.join(ROOT, 'favicon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#FF7A1A"/><g transform="rotate(45 50 50)"><rect x="17" y="17" width="66" height="66" rx="7" fill="#161616"/><rect x="24.5" y="24.5" width="51" height="51" rx="3" fill="none" stroke="#FF7A1A" stroke-width="3.2"/></g><path d="M44.5 73V60.5C44.5 55.5 46.5 52.5 49.5 49.5L53.5 45.5C56 43 57 41 57 37.5V35" fill="none" stroke="#FF7A1A" stroke-width="8.5"/><path d="M47.5 37.5L56.5 24L66 37.5Z" fill="#FF7A1A"/></svg>')
print('pages', len(games), 'sitemap urls', len(urls))
