# Corl Communications website

Static site hosted on Wix, written from the Corl Communications Website Brief.

- Live: https://instant-ghxmeynhtlgx-mollycorl-1409.wix-site-host.com/
- Wix site ID: 496bdf91-86a0-4332-9d0e-96064e232fe7
- Dashboard: https://manage.wix.com/dashboard/496bdf91-86a0-4332-9d0e-96064e232fe7

## Edit and publish

1. Edit page content in `pages/` (shared header, footer and nav live in `build.py`; styles in `assets/`).
2. `python3 build.py` writes the full site to `dist/`.
3. Drop the full `dist/` file set onto the same Wix site (Wix "drop" endpoint for
   site 496bdf91-...); each drop replaces every file, so always send all of them.

Photo slots are blank gray blocks (`.photo`) until Corl's own photos are added.
Forms open the visitor's email program addressed to sales@ or careers@, because
the site is static.
