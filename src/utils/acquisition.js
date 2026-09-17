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

// Which account a token belongs to — the "sent" mark is per account, not
// per browser. Founder 2026-09-18: a tagged link opened while an older
// login was still in the browser posted the source for THAT account (the
// server rightly refused it) and marked the whole browser as sent, so the
// new Google account created minutes later recorded "direct".
function userIdOf(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return String(payload.userId || payload.id || payload.sub || '');
  } catch (e) { return ''; }
}

export async function sendAcquisition() {
  try {
    const token = localStorage.getItem('authToken');
    const raw = localStorage.getItem(KEY);
    if (!token || !raw) return;
    const uid = userIdOf(token);
    const sentKey = uid ? `${SENT}:${uid}` : SENT;
    if (localStorage.getItem(sentKey)) return;
    localStorage.setItem(sentKey, '1');                          // once per account, even if the call fails
    const res = await fetch(`${API}/api/auth/acquisition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ acquisition: JSON.parse(raw) }),
    });
    const data = await res.json().catch(() => ({}));
    // Consumed only when a fresh account took it; an old account leaves the
    // source in place for the sign-up that may follow in this browser.
    if (data && data.attached) localStorage.removeItem(KEY);
  } catch (e) { /* attribution is best-effort */ }
}
