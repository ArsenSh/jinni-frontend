// ─────────────────────────────────────────────────────────────────────────────
//  shotSensors.js — device sensor helpers for Jinni Shot Spots (Stage 1).
//  Used only by ShotSpotsView.vue and ShotCaptureView.vue (deletable set).
//
//  Honesty contract (founder-approved 2026-09-06): GPS is the reliable
//  channel; the compass is BEST-EFFORT ASSIST. iOS requires a user-gesture
//  permission tap, Android headings jitter — so callers PROMISE position and
//  only ASSIST direction, degrading to cardinal text when heading is null.
// ─────────────────────────────────────────────────────────────────────────────

// True on iOS 13+ where DeviceOrientationEvent needs an explicit permission
// tap before any orientation event fires.
export function compassNeedsPermission() {
  return typeof DeviceOrientationEvent !== 'undefined'
    && typeof DeviceOrientationEvent.requestPermission === 'function';
}

// Must be called from inside a user gesture on iOS. Resolves true if granted.
export async function requestCompassPermission() {
  if (!compassNeedsPermission()) return true;
  try { return (await DeviceOrientationEvent.requestPermission()) === 'granted'; }
  catch { return false; }
}

// Start listening for compass heading (0-360, degrees clockwise from north)
// and pitch (degrees from level, + = tilted up). cb({heading, pitch, absolute}).
// Returns a stop() function. Heading stays null until a REAL reading arrives —
// never fabricate 0° (0° is a valid "due north", not a default).
export function startCompass(cb) {
  const onEvent = (e) => {
    let heading = null;
    if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
      heading = e.webkitCompassHeading;                    // iOS: already true-north
    } else if (e.absolute === true && typeof e.alpha === 'number') {
      heading = (360 - e.alpha) % 360;                     // Android absolute
    } else if (e.type === 'deviceorientationabsolute' && typeof e.alpha === 'number') {
      heading = (360 - e.alpha) % 360;
    }
    const pitch = typeof e.beta === 'number' ? Math.max(-90, Math.min(90, e.beta - 90)) : null;
    if (heading !== null || pitch !== null) cb({ heading, pitch, absolute: e.absolute === true });
  };
  // Android fires the absolute variant on a separate event name; listening to
  // both and preferring real headings covers iOS + Android with one path.
  window.addEventListener('deviceorientationabsolute', onEvent, true);
  window.addEventListener('deviceorientation', onEvent, true);
  return () => {
    window.removeEventListener('deviceorientationabsolute', onEvent, true);
    window.removeEventListener('deviceorientation', onEvent, true);
  };
}

// Great-circle distance in meters.
export function haversineM(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Initial bearing from a to b, 0-360 clockwise from north.
export function bearingDeg(a, b) {
  const r = Math.PI / 180;
  const y = Math.sin((b.lng - a.lng) * r) * Math.cos(b.lat * r);
  const x = Math.cos(a.lat * r) * Math.sin(b.lat * r)
    - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lng - a.lng) * r);
  return ((Math.atan2(y, x) / r) + 360) % 360;
}

// 8-wind cardinal KEY for a bearing — callers localize via i18n (shotspots.dir_*).
export function cardinalKey(bearing) {
  const keys = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
  return keys[Math.round(((bearing % 360) + 360) % 360 / 45) % 8];
}
