// utils/guides.js — shared bits for the guide pages (2026-10-02).
import { computed } from 'vue'
import { isNightTime } from '@/utils/timeUtils'
import { visibleLanguageOptions } from '@/utils/languages'

const API = import.meta.env.VITE_API_BASE_URL || ''

export const hasToken = () => {
  const t = localStorage.getItem('authToken')
  if (!t) return false
  try { return JSON.parse(atob(t.split('.')[1])).exp * 1000 > Date.now() } catch { return false }
}

/** fetch against /api/guides with the stored token; throws Error(message) on a non-2xx. */
export async function guideApi(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('authToken')
  // Never wait forever: a hung request would leave a page on "Loading…".
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 15000)
  let res
  try {
    res = await fetch(`${API}/api/guides${path}`, {
      method, signal: ac.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch (e) {
    throw Object.assign(new Error(e.name === 'AbortError' ? 'The server is taking too long. Please try again.' : 'Could not reach Jinni. Check your connection and try again.'), { status: 0 })
  } finally { clearTimeout(timer) }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status })
  return data
}

/** A pick's image: Jinni's own image paths get the API host; full https links (staff Destination photos) stay as they are. */
export function guideImage(src) {
  if (!src || typeof src !== 'string') return ''
  if (/^https:\/\//.test(src)) return src
  return src.startsWith('/') ? `${API}${src}` : ''
}

/** Day/night the same way the business pages decide it. */
export function guideTheme() {
  return computed(() => {
    let t = 'auto'
    try { t = JSON.parse(localStorage.getItem('jinni_settings') || '{}').theme || localStorage.getItem('theme') || 'auto' } catch { /* auto */ }
    if (t === 'dark') return 'night-mode'
    if (t === 'light') return 'day-mode'
    return isNightTime() ? 'night-mode' : 'day-mode'
  })
}

export const CATEGORY_KEYS = ['restaurant', 'hidden_gem', 'photo_spot', 'activity']
/** Languages a guide can say they guide in (labels: guides.langs.<code>). */
export const GUIDING_LANGS = ['en', 'hy', 'ru', 'fr', 'es', 'de', 'it', 'fa', 'ar', 'zh', 'ka']

/** The app's own languages — each shown in its own script. */
export const GUIDE_LANGS = visibleLanguageOptions([
  { code: 'en', label: 'English' }, { code: 'hy', label: 'Հայերեն' }, { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' }, { code: 'zh', label: '中文' }, { code: 'ar', label: 'العربية' },
])   // hidden languages (utils/languages.js) drop out here, so a saved or browser hy falls to English
const APP_CODES = GUIDE_LANGS.map(l => l.code)

/** Switch the page language and remember it (same key the business pages use). */
export function setGuideLanguage(localeRef, code) {
  if (!APP_CODES.includes(code)) return
  localeRef.value = code
  try {
    const s = JSON.parse(localStorage.getItem('jinni_settings') || '{}')
    s.language = code
    localStorage.setItem('jinni_settings', JSON.stringify(s))
  } catch { /* storage blocked — the switch still works for this visit */ }
}

/** On page open: the saved choice, else the browser's language when the app speaks it. */
export function initGuideLanguage(localeRef) {
  let code = null
  try { code = JSON.parse(localStorage.getItem('jinni_settings') || '{}').language || null } catch { /* none saved */ }
  if (!APP_CODES.includes(code)) {
    const b = String(navigator.language || '').slice(0, 2).toLowerCase()
    code = APP_CODES.includes(b) ? b : null
  }
  if (code && localeRef.value !== code) localeRef.value = code
}

/** instagram.com/reel/<code> → its official embed URL, or null (mirrors the backend rule). */
export function instagramEmbed(url) {
  try {
    const u = new URL(String(url || '').trim())
    if (!/^(www\.)?instagram\.com$/i.test(u.hostname) || u.protocol !== 'https:') return null
    const m = u.pathname.match(/^\/(?:[a-z0-9._]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]{5,40})\/?$/i)
    if (!m) return null
    const kind = m[1].toLowerCase() === 'p' ? 'p' : (m[1].toLowerCase() === 'tv' ? 'tv' : 'reel')
    return `https://www.instagram.com/${kind}/${m[2]}/embed`
  } catch { return null }
}

/** Remember which guide brought this visitor: first-touch only, same shape acquisition.js stores. */
export function tagGuideVisit(handle) {
  try {
    if (!handle) return
    localStorage.setItem('jinni_guide', handle)
    if (!localStorage.getItem('jinni_acq')) {
      localStorage.setItem('jinni_acq', JSON.stringify({ source: `guide-${handle}`, medium: 'guide', campaign: null, term: null, content: null, landing: `/@${handle}`, referrer: document.referrer || null }))
    }
  } catch { /* storage blocked — attribution is best-effort */ }
}

/**
 * Upload a pick's video (founder 2026-10-05: the guide's own clip, played in Jinni's
 * player). XHR rather than fetch, for the progress number. Resolves once the file has
 * ARRIVED — the server then prepares it, and /me reports video.status.
 */
export function guideVideoUpload(pickId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API}/api/guides/me/picks/${pickId}/video`)
    const token = localStorage.getItem('authToken')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)) }
    xhr.onload = () => {
      let data = {}
      try { data = JSON.parse(xhr.responseText) } catch { /* not JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data)
      else reject(new Error(data.error || `Upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Could not reach Jinni. Check your connection and try again.'))
    const body = new FormData()
    body.append('video', file)
    xhr.send(body)
  })
}
