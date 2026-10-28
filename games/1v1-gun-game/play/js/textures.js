import * as THREE from 'three';

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function speckle(g, w, h, n, colors, size = [1, 3]) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    const s = size[0] + Math.random() * (size[1] - size[0]);
    g.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
}

export function makeTextures() {
  const T = {};

  { // grass
    const [c, g] = canvas(256);
    g.fillStyle = '#5da83c'; g.fillRect(0, 0, 256, 256);
    speckle(g, 256, 256, 2600, ['#4f9632', '#6cb848', '#579f37', '#77c052', '#4a8c2e'], [1, 3]);
    for (let i = 0; i < 500; i++) {
      g.strokeStyle = Math.random() < 0.5 ? 'rgba(40,90,25,0.5)' : 'rgba(140,200,90,0.45)';
      const x = Math.random() * 256, y = Math.random() * 256;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.random() * 2 - 1, y - 3 - Math.random() * 4); g.stroke();
    }
    T.grass = tex(c);
  }
  { // asphalt
    const [c, g] = canvas(256);
    g.fillStyle = '#55585e'; g.fillRect(0, 0, 256, 256);
    speckle(g, 256, 256, 4000, ['#4a4d52', '#606369', '#3f4246', '#6b6e74'], [1, 2]);
    g.strokeStyle = 'rgba(30,30,32,0.35)'; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      g.beginPath(); let x = Math.random() * 256, y = Math.random() * 256; g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += Math.random() * 30 - 15; y += Math.random() * 30 - 15; g.lineTo(x, y); }
      g.stroke();
    }
    T.asphalt = tex(c);
  }
  { // sidewalk tiles
    const [c, g] = canvas(128);
    g.fillStyle = '#e4e1da'; g.fillRect(0, 0, 128, 128);
    speckle(g, 128, 128, 900, ['#d6d2ca', '#ecebe6', '#cfcac1'], [1, 2]);
    g.strokeStyle = '#a9a49b'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128);
    T.tiles = tex(c);
  }
  { // generic noise (tinted by material colour)
    const [c, g] = canvas(128);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    speckle(g, 128, 128, 1400, ['#e8e8e8', '#f4f4f4', '#dcdcdc', '#d2d2d2'], [1, 3]);
    T.noise = tex(c);
  }
  { // horizontal siding planks
    const [c, g] = canvas(128);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 16) {
      g.fillStyle = '#e2e2e2'; g.fillRect(0, y + 13, 128, 3);
      g.fillStyle = '#f7f7f7'; g.fillRect(0, y, 128, 3);
    }
    speckle(g, 128, 128, 300, ['#efefef', '#e9e9e9'], [1, 2]);
    T.siding = tex(c);
  }
  { // wood planks
    const [c, g] = canvas(128);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    for (let x = 0; x < 128; x += 21) {
      g.fillStyle = `rgb(${215 + Math.random() * 30},${215 + Math.random() * 30},${215 + Math.random() * 30})`;
      g.fillRect(x, 0, 21, 128);
      g.fillStyle = '#b8b8b8'; g.fillRect(x, 0, 2, 128);
      g.fillRect(x, Math.random() * 128, 21, 2);
    }
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = 'rgba(150,150,150,0.35)';
      const x = Math.random() * 128; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + Math.random() * 4 - 2, 128); g.stroke();
    }
    T.planks = tex(c);
  }
  { // brick
    const [c, g] = canvas(128);
    g.fillStyle = '#d9d2c6'; g.fillRect(0, 0, 128, 128);
    for (let row = 0; row < 8; row++) {
      const off = row % 2 ? 16 : 0;
      for (let x = -32; x < 128; x += 32) {
        const v = 200 + Math.random() * 55;
        g.fillStyle = `rgb(${v},${v * 0.92},${v * 0.88})`;
        g.fillRect(x + off + 2, row * 16 + 2, 28, 12);
      }
    }
    T.brick = tex(c);
  }
  { // hedge leaves
    const [c, g] = canvas(128);
    g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 700; i++) {
      const v = 150 + Math.random() * 105;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.beginPath(); g.arc(Math.random() * 128, Math.random() * 128, 2 + Math.random() * 4, 0, Math.PI * 2); g.fill();
    }
    T.leaves = tex(c);
  }
  { // white picket fence (alpha tested)
    const [c, g] = canvas(128);
    g.clearRect(0, 0, 128, 128);
    g.fillStyle = '#ffffff';
    for (let x = 6; x < 128; x += 32) {
      g.beginPath();
      g.moveTo(x, 128); g.lineTo(x, 22); g.lineTo(x + 10, 6); g.lineTo(x + 20, 22); g.lineTo(x + 20, 128);
      g.fill();
    }
    g.fillRect(0, 40, 128, 10); g.fillRect(0, 96, 128, 10);
    g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 48, 128, 2); g.fillRect(0, 104, 128, 2);
    const t = tex(c);
    T.picket = t;
  }
  { // shingle / roof
    const [c, g] = canvas(128);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 12) {
      const off = (y / 12) % 2 ? 10 : 0;
      for (let x = -20; x < 128; x += 20) {
        const v = 200 + Math.random() * 55;
        g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x + off, y, 19, 11);
      }
    }
    T.roof = tex(c);
  }
  { // camo (tinted)
    const [c, g] = canvas(128);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    const shades = ['#b9b9b9', '#7c7c7c', '#dedede', '#5b5b5b'];
    for (let i = 0; i < 60; i++) {
      g.fillStyle = shades[i % shades.length];
      g.beginPath();
      const x = Math.random() * 128, y = Math.random() * 128;
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2, r = 6 + Math.random() * 10;
        g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      g.fill();
    }
    T.camo = tex(c);
  }
  return T;
}

export function signTexture() {
  const [c, g] = canvas(512, 256);
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#d7333a'); grd.addColorStop(1, '#a3181f');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#f6efe2'; g.lineWidth = 12; g.strokeRect(10, 10, 492, 236);
  g.fillStyle = '#f6efe2';
  g.font = 'italic bold 48px Georgia, serif';
  g.textAlign = 'center';
  g.fillText('Welcome to', 256, 82);
  g.font = 'bold 96px Impact, "Arial Black", sans-serif';
  g.fillText('NUKETOWN', 256, 190);
  g.font = 'bold 26px Arial, sans-serif';
  g.fillText('POP. 40', 256, 228);
  // little starbursts
  g.strokeStyle = '#ffe9a8'; g.lineWidth = 3;
  for (const [x, y] of [[452, 210], [60, 60]]) {
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); g.stroke();
    }
  }
  return tex(c, false);
}

export function bunkerTexture() {
  const [c, g] = canvas(256);
  g.fillStyle = '#5b5f63'; g.fillRect(0, 0, 256, 256);
  speckle(g, 256, 256, 1200, ['#53575b', '#666a6e', '#4c5054'], [1, 3]);
  // hazard stripes border
  g.save();
  g.beginPath(); g.rect(0, 0, 256, 28); g.rect(0, 228, 256, 28); g.clip();
  g.fillStyle = '#f2c200'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#1c1c1c';
  for (let x = -256; x < 512; x += 36) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 18, 0); g.lineTo(x + 18 + 256, 256); g.lineTo(x + 256, 256); g.fill();
  }
  g.restore();
  // radiation trefoil
  const cx = 128, cy = 128;
  g.fillStyle = '#f2c200'; g.beginPath(); g.arc(cx, cy, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1c1c1c';
  for (let k = 0; k < 3; k++) {
    const a = -Math.PI / 2 + k * (Math.PI * 2 / 3);
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 52, a - Math.PI / 6, a + Math.PI / 6); g.closePath(); g.fill();
  }
  g.fillStyle = '#f2c200'; g.beginPath(); g.arc(cx, cy, 13, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1c1c1c'; g.beginPath(); g.arc(cx, cy, 9, 0, Math.PI * 2); g.fill();
  return tex(c, false);
}

export function busTextTexture() {
  const [c, g] = canvas(512, 64);
  g.fillStyle = '#f2b822'; g.fillRect(0, 0, 512, 64);
  g.fillStyle = '#1c1c1c';
  g.font = 'bold 40px Arial, sans-serif'; g.textAlign = 'center';
  g.fillText('NUKETOWN SCHOOL DISTRICT', 256, 46);
  return tex(c, false);
}

export function glowTexture(inner = 'rgba(255,240,200,1)', outer = 'rgba(255,140,30,0)') {
  const [c, g] = canvas(64);
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, inner); grd.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.6)')); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return tex(c, false);
}

export function flashTexture() {
  const [c, g] = canvas(128);
  g.translate(64, 64);
  for (let k = 0; k < 7; k++) {
    g.rotate(Math.PI * 2 / 7);
    const grd = g.createLinearGradient(0, 0, 60, 0);
    grd.addColorStop(0, 'rgba(255,250,210,1)'); grd.addColorStop(1, 'rgba(255,150,40,0)');
    g.fillStyle = grd;
    g.beginPath(); g.moveTo(0, -7); g.lineTo(58 + Math.random() * 6, 0); g.lineTo(0, 7); g.fill();
  }
  const grd = g.createRadialGradient(0, 0, 0, 0, 0, 30);
  grd.addColorStop(0, 'rgba(255,255,230,1)'); grd.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = grd; g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill();
  return tex(c, false);
}

export function smokeTexture() {
  const [c, g] = canvas(64);
  const grd = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return tex(c, false);
}
