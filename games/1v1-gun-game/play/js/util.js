export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Shortest signed angle from a to b.
export function angleDiff(a, b) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// yaw 0 looks down -Z (three.js camera convention), positive pitch looks up.
export function dirFromYawPitch(yaw, pitch, out) {
  const cp = Math.cos(pitch);
  out.x = -Math.sin(yaw) * cp;
  out.y = Math.sin(pitch);
  out.z = -Math.cos(yaw) * cp;
  return out;
}

export const yawTo = (dx, dz) => Math.atan2(-dx, -dz);

export function loadSettings(defaults) {
  try {
    const raw = localStorage.getItem('gungame.settings');
    if (raw) return Object.assign({}, defaults, JSON.parse(raw));
  } catch (e) { /* storage unavailable */ }
  return Object.assign({}, defaults);
}

export function saveSettings(s) {
  try { localStorage.setItem('gungame.settings', JSON.stringify(s)); } catch (e) { /* ignore */ }
}
