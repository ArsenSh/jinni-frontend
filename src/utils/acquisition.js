// Sign-up source capture (founder 2026-09-18) — in-house, no third-party tag.
//
// On the visitor's FIRST landing the utm_* fields (or the external referrer)
// are kept in this browser. After the first successful login they are posted
// once to /api/auth/acquisition, which attaches them to a fresh account and
// ignores everything else. The admin Users list and the marketing report
// then split sign-ups and returning users by source.
const KEY = 'jinni_acq';
const SENT = 'jinni_acq_sent';
const API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

export function captureAcquisition() {
  try {
    if (localStorage.getItem(KEY)) return;                       // first touch wins
    const q = new URLSearchParams(window.location.search);
    const pick = (k) => { const v = q.get(k); return v ? String(v).slice(0, 160) : null; };
    const acq = {
      source: pick('utm_source') || pick('ref'),
      medium: pick('utm_medium'),
      campaign: pick('utm_campaign'),
      term: pick('utm_term'),
      content: pick('utm_content'),
      landing: (window.location.pathname || '/').slice(0, 160),
      referrer: (document.referrer || '').slice(0, 160),
    };
    // An external referrer without utm still counts (a post on Instagram);
    // a plain direct visit records nothing.
    let external = false;
    try { external = !!acq.referrer && new URL(acq.referrer).hostname !== window.location.hostname; } catch (e) { external = false; }
    if (!acq.source && !external) return;
    localStorage.setItem(KEY, JSON.stringify(acq));
  } catch (e) { /* storage unavailable → no attribution */ }
}

export async function sendAcquisition() {
  try {
    const token = localStorage.getItem('authToken');
    const raw = localStorage.getItem(KEY);
    if (!token || !raw || localStorage.getItem(SENT)) return;
    localStorage.setItem(SENT, '1');                             // once per browser, even if the call fails
    await fetch(`${API}/api/auth/acquisition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ acquisition: JSON.parse(raw) }),
    });
  } catch (e) { /* attribution is best-effort */ }
}
