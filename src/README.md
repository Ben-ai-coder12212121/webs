# Archived build system

Until 2026-09-28 the whole site was one `index.html` built from these sources (`sh make_site.sh`).
The site has since been split into one page per game (see the top-level `README.md`), and those
files are now edited directly. Nothing here is used by the live site, and `make_site.sh` refuses to run.

- `heroes/`: the old sources (base page, game families, build patches).
- `t/`: the old tests, written for the single-file build.
- `split/`: the one-time scripts that produced the new layout from the last single-file build.
