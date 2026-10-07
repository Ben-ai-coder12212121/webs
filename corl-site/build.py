"""Build the Corl Communications static site.

Each file in pages/ starts with a header block:
    title: <page title>
    description: <meta description>
    nav: <nav key, matches NAV below>
    ---
followed by the page's <main> content. This script wraps every page in the
shared header and footer and writes the result to dist/, alongside assets/.
"""
import html
import json
import pathlib
import shutil

ROOT = pathlib.Path(__file__).parent
PAGES = ROOT / "pages"
ASSETS = ROOT / "assets"
DIST = ROOT / "dist"

PHONE = "717.564.1896"
PHONE_TEL = "+17175641896"
EMAIL = "sales@corlcommunications.com"
ADDRESS_1 = "1601 South 19th Street"
ADDRESS_2 = "Harrisburg, PA 17104"

# (key, label, href, children)
NAV = [
    ("home", "Home", "index.html", None),
    ("services", "Services", "services.html", None),
    ("projects", "Projects", "projects.html", None),
    ("areas", "Service Areas", "service-areas.html", None),
    ("about", "About", "about.html", [
        ("about", "Our Story", "about.html"),
        ("team", "Our Team", "team.html"),
        ("credentials", "Credentials", "credentials.html"),
    ]),
    ("careers", "Careers", "careers.html", None),
]

BUSINESS_JSONLD = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Corl Communications, Inc.",
    "description": (
        "Structured cabling, fiber optic, and low-voltage contractor "
        "headquartered in Harrisburg, Pennsylvania."
    ),
    "telephone": PHONE_TEL,
    "email": EMAIL,
    "address": {
        "@type": "PostalAddress",
        "streetAddress": ADDRESS_1,
        "addressLocality": "Harrisburg",
        "addressRegion": "PA",
        "postalCode": "17104",
        "addressCountry": "US",
    },
    "areaServed": "Pennsylvania",
}


def parse_page(path):
    text = path.read_text(encoding="utf-8")
    head, body = text.split("\n---\n", 1)
    meta = {}
    for line in head.strip().splitlines():
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip()
    return meta, body


CURRENT = ' aria-current="page"'


def render_nav(active):
    items = []
    for key, label, href, children in NAV:
        if children:
            group_active = active in {c[0] for c in children}
            sub = "".join(
                f'<li><a href="{c_href}"{CURRENT if c_key == active else ""}>{c_label}</a></li>'
                for c_key, c_label, c_href in children
            )
            items.append(
                f'<li class="has-sub{" is-active" if group_active else ""}">'
                f'<a href="{href}">{label}</a><ul class="sub">{sub}</ul></li>'
            )
        else:
            items.append(f'<li><a href="{href}"{CURRENT if key == active else ""}>{label}</a></li>')
    return "".join(items)


def render(meta, body):
    title = html.escape(meta["title"])
    description = html.escape(meta["description"])
    nav = render_nav(meta.get("nav", ""))
    jsonld = json.dumps(BUSINESS_JSONLD, indent=2)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="stylesheet" href="assets/styles.css">
<script type="application/ld+json">
{jsonld}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="index.html">Corl Communications</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>{nav}</ul>
    </nav>
    <div class="header-cta">
      <a class="header-phone" href="tel:{PHONE_TEL}">{PHONE}</a>
      <a class="btn" href="quote.html">Request a Quote</a>
    </div>
  </div>
</header>
<main id="main">
{body.strip()}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-name">Corl Communications, Inc.</p>
      <p>{ADDRESS_1}<br>{ADDRESS_2}</p>
    </div>
    <div>
      <p><a href="tel:{PHONE_TEL}">{PHONE}</a><br><a href="mailto:{EMAIL}">{EMAIL}</a></p>
    </div>
    <div>
      <p><a href="services.html">Services</a> · <a href="projects.html">Projects</a> · <a href="service-areas.html">Service Areas</a><br>
      <a href="about.html">About</a> · <a href="careers.html">Careers</a> · <a href="quote.html">Request a Quote</a></p>
    </div>
  </div>
</footer>
<script src="assets/site.js"></script>
</body>
</html>
"""


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    shutil.copytree(ASSETS, DIST / "assets")
    for path in sorted(PAGES.glob("*.html")):
        meta, body = parse_page(path)
        (DIST / path.name).write_text(render(meta, body), encoding="utf-8")
        print("built", path.name)


if __name__ == "__main__":
    main()
