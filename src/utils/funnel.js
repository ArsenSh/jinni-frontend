// Anonymous sign-up funnel (founder 2026-09-30) — in-house, no third-party tag.
//
// One tiny beacon per step (landing_view → wish_tap → auth_view → …) so the
// admin Overview can show WHERE visitors leave: the landing → /auth hop is a
// client-side route the server never sees. The browser keeps a random id of
// its own (localStorage `jinni_sid`) — no account, no personal data. The
// server counts each browser once per step per day (backend
// models/FunnelEvent.js). Everything here is best-effort: it must never
// break or slow the page.
const SID_KEY = 'jinni_sid';
const ACQ_KEY = 'jinni_acq';
const API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

function makeId() {
  try { if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID(); } catch (e) { /* fall through */ }
  let s = '';
  for (let i = 0; i < 4; i++) s += Math.random().toString(36).slice(2, 10);
  return (Date.now().toString(36) + '-' + s).slice(0, 64);
}

let memSid = null;   // storage blocked (private tab) → one id for this page life
function sid() {
  try {
    let v = localStorage.getItem(SID_KEY);
    if (!v) { v = makeId(); localStorage.setItem(SID_KEY, v); }
    return v;
  } catch (e) {
    if (!memSid) memSid = makeId();
    return memSid;
  }
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

// Same first-touch record acquisition.js keeps: utm source, else the
// external referrer that brought the visitor, else "direct".
function source() {
  try {
    const acq = JSON.parse(localStorage.getItem(ACQ_KEY) || 'null');
    if (acq && acq.source) return String(acq.source).slice(0, 60);
    if (acq && acq.referrer) { const h = hostOf(acq.referrer); if (h) return h.slice(0, 60); }
  } catch (e) { /* no record */ }
  try {
    const h = hostOf(document.referrer || '');
    if (h && h !== window.location.hostname.replace(/^www\./, '')) return h.slice(0, 60);
  } catch (e) { /* no referrer */ }
  return 'direct';
}

export function track(event) {
  try {
    const body = JSON.stringify({ event, sid: sid(), source: source() });
    const url = `${API}/api/public/funnel`;
    // text/plain is the only beacon body a cross-origin API accepts without
    // a CORS preflight; the server parses the JSON from the text.
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
      if (ok) return;
    }
    fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  } catch (e) { /* tracking is best-effort */ }
}
