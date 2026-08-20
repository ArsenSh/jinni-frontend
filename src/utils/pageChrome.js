// utils/pageChrome.js
//
// Browser-chrome color sync with NO per-page color constants: instead of being
// told each page's palette, it samples what the page ACTUALLY paints at the
// top and bottom screen edges and mirrors that onto:
//   • <meta name="theme-color">           — Safari/Chrome top chrome tint
//   • <html> inline background            — the overscroll (rubber-band) canvas,
//     painted as a two-tone gradient when the page's top and bottom edges
//     differ (e.g. StaffValidation's night gradient)
//
// How an edge color is found (effectiveEdgeColor):
//   1. elementFromPoint at the screen edge → the topmost visible element there
//      (a fixed navbar counts, deliberately — its color IS the visible edge).
//   2. Walk up parents until a background wins:
//      – solid backgroundColor with alpha ≥ 0.5 → use it;
//      – translucent (glass bars) → keep walking to the color behind it;
//      – gradient/image: computed backgroundImage always normalizes colors to
//        rgb(...), so the first stop is the top color, the last the bottom.
//   3. Fallback: the body's computed background.
//
// Re-runs automatically: route changes, any class/data-theme attribute change
// anywhere in the document (catches every page-local theme toggle with zero
// cooperation from the page), and resize/orientation. rAF-debounced.
//
// NOTE: this module owns the <html>/<body> inline background writes. Nothing
// else may set them (App.vue used to — that inline paint was overriding the
// validator's CSS theme flip).

let rafId = null

function bgAlpha(color) {
  if (!color || color === 'transparent') return 0
  const m = color.match(/rgba?\(([^)]+)\)/)
  if (!m) return 1 // hex or named color — treat as opaque
  const parts = m[1].split(',').map(s => parseFloat(s))
  return parts.length === 4 ? (Number.isFinite(parts[3]) ? parts[3] : 1) : 1
}

function effectiveEdgeColor(atTop) {
  const x = Math.max(1, Math.floor(window.innerWidth / 2))
  const y = atTop ? 1 : Math.max(1, window.innerHeight - 2)
  let el = null
  try { el = document.elementFromPoint(x, y) } catch { /* pre-render */ }
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el)
    if (bgAlpha(cs.backgroundColor) >= 0.5) return cs.backgroundColor
    const stops = (cs.backgroundImage || '').match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g)
    if (stops && stops.length) return atTop ? stops[0] : stops[stops.length - 1]
    el = el.parentElement
  }
  const bodyBg = getComputedStyle(document.body).backgroundColor
  return bgAlpha(bodyBg) > 0 ? bodyBg : '#f9f5eb'
}

function nudgeSafariToolbar() {
  // iOS Safari computes the toolbar tint at render time and can ignore
  // post-paint changes; a 1px scroll provokes re-derivation where supported.
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (!isIOS) return
  requestAnimationFrame(() => {
    window.scrollBy(0, 1)
    requestAnimationFrame(() => window.scrollBy(0, -1))
  })
}

export function syncPageChrome() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const top = effectiveEdgeColor(true)
    const bottom = effectiveEdgeColor(false)

    let meta = document.querySelector('meta[name="theme-color"]:not([media])')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    if (meta.getAttribute('content') !== top) meta.setAttribute('content', top)

    // Overscroll canvas: the <html> background spans the whole scrollable
    // canvas, so top overscroll reveals its very top and bottom overscroll its
    // very bottom — a 50/50 gradient gives each edge its own tone.
    const paint = top === bottom ? top : `linear-gradient(${top} 50%, ${bottom} 50%)`
    if (document.documentElement.style.background !== paint) {
      document.documentElement.style.background = paint
      nudgeSafariToolbar()
    }
    // Clear any legacy inline body paint so page CSS themes can win.
    if (document.body.style.backgroundColor) document.body.style.backgroundColor = ''
  })
}

let installed = false
export function installPageChrome(router) {
  if (installed) return
  installed = true
  // After each navigation: sample once the new page has painted (double delay
  // covers route transitions + first data render reflows).
  router.afterEach(() => {
    setTimeout(syncPageChrome, 60)
    setTimeout(syncPageChrome, 400)
  })
  // Any class / data-theme flip anywhere (page-local theme toggles included).
  const mo = new MutationObserver(syncPageChrome)
  mo.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class', 'data-theme'],
  })
  window.addEventListener('resize', syncPageChrome, { passive: true })
  window.addEventListener('orientationchange', syncPageChrome, { passive: true })
  syncPageChrome()
}
