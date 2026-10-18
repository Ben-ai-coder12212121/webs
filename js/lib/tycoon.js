/* tycoon.js: shared helpers for the idle tycoon games (Lumberjack Tycoon, Fishing Tycoon).
   Big-number formatting, a canvas UI (buttons rebuilt every frame, scrollable lists, taps on the scene),
   shop cards, an income meter, and saves with offline earnings. Needs mob.js. */
const TY = {
  fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
    const u = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
    let i = -1;
    while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
    return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + u[i];
  },
  money: n => '$' + TY.fmt(n),
  cost: (base, growth, lvl) => Math.ceil(base * Math.pow(growth, lvl)),

  /* Canvas UI. Buttons are re-added every frame with U.btn; U.scroll registers a scrollable region.
     A press that lands on no button and no scroll region goes straight to onTap (so tapping the scene is instant). */
  ui(c, cv, W, H, onTap) {
    const U = { btns: [], scrolls: {}, down: null };
    const inside = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
    const hitBtn = p => { for (let i = U.btns.length - 1; i >= 0; i--) { const b = U.btns[i]; if (inside(p, b) && (!b.clip || inside(p, b.clip))) return b; } return null; };
    MOB.drag(c, cv, W, H, {
      down: p => {
        const s = Object.values(U.scrolls).find(r => r.h && inside(p, r)), b = hitBtn(p);
        U.down = { x: p.x, y: p.y, moved: 0, s, off0: s ? s.off : 0, b };
        if (!s && !b && onTap) { onTap(p); U.down.tapped = true; }
      },
      move: p => {
        const d = U.down; if (!d) return;
        d.moved = Math.max(d.moved, Math.hypot(p.x - d.x, p.y - d.y));
        if (d.s && d.moved > 6) d.s.off = MOB.clamp(d.off0 - (p.y - d.y), 0, Math.max(0, d.s.content - d.s.h));
      },
      up: p => {
        const d = U.down; U.down = null; if (!d || d.tapped || d.moved > 8) return;
        const b = hitBtn(p); if (b && b.fn) b.fn();
      }
    });
    c.on(cv, 'wheel', e => {
      const r = cv.getBoundingClientRect(), p = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
      const s = Object.values(U.scrolls).find(q => q.h && inside(p, q)); if (!s) return;
      s.off = MOB.clamp(s.off + e.deltaY, 0, Math.max(0, s.content - s.h)); e.preventDefault();
    }, { passive: false });
    U.btn = (x, y, w, h, fn, clip) => U.btns.push({ x, y, w, h, fn, clip });
    U.scroll = (id, x, y, w, h) => { const s = U.scrolls[id] || (U.scrolls[id] = { off: 0, content: 0 }); Object.assign(s, { x, y, w, h }); return s; };
    U.begin = () => { U.btns = []; for (const s of Object.values(U.scrolls)) s.h = 0; };
    return U;
  },

  /* drawing */
  txt(x, s, px, py, size, col, align, bold, font) {
    x.font = (bold == null ? '800 ' : bold) + size + 'px ' + (font || 'Figtree, system-ui, sans-serif');
    x.textAlign = align || 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, px, py);
  },
  title(x, s, px, py, size, col, outline) {
    x.font = size + 'px "Bagel Fat One", Figtree, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (outline) { x.lineJoin = 'round'; x.lineWidth = size / 5; x.strokeStyle = outline; x.strokeText(s, px, py); }
    x.fillStyle = col; x.fillText(s, px, py);
  },
  box(x, px, py, w, h, r, fill, stroke, lw) { MOB.rr(x, px, py, w, h, r); if (fill) { x.fillStyle = fill; x.fill(); } if (stroke) { x.lineWidth = lw || 2; x.strokeStyle = stroke; x.stroke(); } },
  coin(x, px, py, r) {
    x.beginPath(); x.arc(px, py, r, 0, 7); x.fillStyle = '#ffd23f'; x.fill(); x.lineWidth = 2; x.strokeStyle = '#a8740f'; x.stroke();
    x.fillStyle = '#a8740f'; x.font = '900 ' + Math.round(r * 1.25) + 'px Figtree, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$', px, py + 1);
  },
  /* A shop card like the upgrade lists in the design sheet: icon on the left, name and level, a short effect, and a green price button. */
  card(x, U, clip, o) {
    const { px, py, w, h } = o;
    TY.box(x, px, py, w, h, 12, 'rgba(18,30,44,.92)', 'rgba(255,255,255,.12)', 1.5);
    TY.box(x, px + 8, py + 8, h - 16, h - 16, 10, 'rgba(255,255,255,.08)');
    x.save(); x.translate(px + 8 + (h - 16) / 2, py + h / 2); o.icon && o.icon(x, (h - 16) * .38); x.restore();
    const tx = px + h + 2;
    TY.txt(x, o.name, tx, py + 18, 14, '#fff', 'left');
    if (o.lvl != null) TY.txt(x, o.lvl, tx, py + 35, 11.5, '#9fb6cc', 'left', '700 ');
    if (o.sub) TY.txt(x, o.sub, tx, py + h - 13, 10.5, '#7fd4a0', 'left', '600 ');
    const bw = 84, bh = 30, bx = px + w - bw - 10, by = py + h / 2 - bh / 2;
    if (o.max) { TY.box(x, bx, by, bw, bh, 8, 'rgba(255,255,255,.1)'); TY.txt(x, o.maxLabel || 'MAX', bx + bw / 2, by + bh / 2 + 1, 13, '#9fb6cc'); return; }
    TY.box(x, bx, by + 3, bw, bh, 8, o.can ? '#1f7a3a' : 'rgba(0,0,0,.3)');
    TY.box(x, bx, by, bw, bh, 8, o.can ? '#34c25a' : '#3a4a5a');
    TY.txt(x, o.label || TY.money(o.cost), bx + bw / 2, by + bh / 2 + 1, 13, o.can ? '#fff' : '#8fa0b0');
    U.btn(bx, by, bw, bh, o.can ? o.fn : null, clip);
  },
  /* income per second, averaged over the last few seconds */
  meter(win = 5) {
    const M = { log: [], add(v) { M.log.push([performance.now(), v]); },
      rate() { const now = performance.now(); M.log = M.log.filter(([t]) => now - t < win * 1000); return M.log.reduce((a, [, v]) => a + v, 0) / win; } };
    return M;
  },
  /* saves: S is the site's storage helper. Offline earnings pay half the saved income rate, for up to 2 hours. */
  load(key, def) { const s = S.get(key, null); return s ? Object.assign(JSON.parse(JSON.stringify(def)), s) : JSON.parse(JSON.stringify(def)); },
  save(key, st) { st.seen = Date.now(); S.set(key, st); },
  offline(st) {
    if (!st.seen || !st.rate) return null;
    const secs = Math.min(7200, (Date.now() - st.seen) / 1000);
    return secs > 60 ? { secs, amt: st.rate * secs * .5 } : null;
  },
  dur(s) { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + 'h ' + m + 'm' : m + 'm'; }
};
