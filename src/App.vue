<template>
  <div id="app" :class="themeClass">
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

const THEME_COLORS = {
  dark:  '#0a0118',
  light: '#f9f5eb',
};

/* ── Chrome follows the PAGE, not a map ─────────────────────────────────────
 * The browser chrome (meta theme-color), the overscroll canvas (<html>) and
 * the keyboard-exposed backdrop (<body>) are DERIVED from the background the
 * routed page actually renders, via getComputedStyle. There is no per-page
 * color table to keep in sync: restyle a page, add a route, or flip a page's
 * LOCAL theme toggle (admin / validator / marketing) and the chrome follows
 * by construction. Used only as a last resort when nothing parseable paints. */
const FALLBACK_EDGES = {
  dark:  ['#0a0118', '#16213e'],
  light: ['#f9f5eb', '#f9f5eb'],
};

const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* Alpha of a computed CSS color ('rgb(…)', 'rgba(…)', '#hex', keyword). */
function colorAlpha(str) {
  if (!str) return 0;
  const s = String(str).trim().toLowerCase();
  if (s === 'transparent' || s === 'none') return 0;
  const m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[,/]+/).map(x => x.trim()).filter(Boolean);
    return parts.length >= 4 ? parseFloat(parts[3]) : 1;
  }
  if (s[0] === '#') {
    if (s.length === 9) return parseInt(s.slice(7, 9), 16) / 255;
    if (s.length === 5) return parseInt(s[4] + s[4], 16) / 255;
  }
  return 1;
}

/* Split a computed background-image list on top-level commas (colors inside
 * rgb()/gradient() contain commas of their own). */
function splitLayers(img) {
  const layers = [];
  let depth = 0, start = 0;
  for (let i = 0; i < img.length; i++) {
    const ch = img[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) { layers.push(img.slice(start, i).trim()); start = i + 1; }
  }
  layers.push(img.slice(start).trim());
  return layers;
}

/* Opaque end colors of one gradient layer, as {top, bottom}. Computed styles
 * normalize stops to rgb()/rgba(); transparent stops (fade-outs) are skipped.
 * Only vertical flips need direction handling — the app's gradients are
 * default/180deg except explicit '0deg'/'to top'. */
function layerEnds(layer) {
  const stops = (layer.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi) || [])
    .filter(c => colorAlpha(c) >= 0.99);
  if (!stops.length) return null;
  const reversed = /gradient\(\s*(0deg|to top)\b/.test(layer);
  return reversed
    ? { top: stops[stops.length - 1], bottom: stops[0] }
    : { top: stops[0], bottom: stops[stops.length - 1] };
}

/* What does this element visibly paint? {top, bottom, image} or null.
 * Top edge comes from the first (frontmost) gradient layer, bottom from the
 * last (backmost) — matches how layered skies compose (StarrySky's top fade
 * over its radial base). A translucent background-color (old auth overlay
 * style) is NOT accepted: chrome must never trust a color that composites. */
function parsePaint(cs) {
  const img = cs.backgroundImage;
  if (img && img !== 'none') {
    const layers = splitLayers(img).filter(l => l.includes('gradient('));
    if (layers.length) {
      const top = layerEnds(layers[0]);
      const bottom = layerEnds(layers[layers.length - 1]);
      if (top && bottom) return { top: top.top, bottom: bottom.bottom, image: img };
    }
    return null;
  }
  const bc = cs.backgroundColor;
  if (colorAlpha(bc) >= 0.99) return { top: bc, bottom: bc, image: null };
  return null;
}

/* Find the element that paints the page: the routed view's root, or — for
 * transparent roots (landing, contact, legal) — its backdrop child (the sky
 * components deliberately sit first in the DOM, so document-order BFS finds
 * them before any content). Bounded: depth ≤ 4, ≤ 40 elements scanned. */
function findPagePaint(rootEl) {
  const queue = [[rootEl, 0]];
  let scanned = 0;
  while (queue.length && scanned < 40) {
    const [el, depth] = queue.shift();
    scanned++;
    let paint = null;
    try { paint = parsePaint(getComputedStyle(el)); } catch (e) { /* detached node */ }
    if (paint) return paint;
    if (depth < 4) {
      for (const child of el.children) {
        const tag = child.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') continue;
        queue.push([child, depth + 1]);
      }
    }
  }
  return null;
}

export default {
  name: 'App',
  computed: {...mapGetters('settings', ['effectiveTheme', 'themeClass'])},
  watch: {
    effectiveTheme: {
      immediate: true,
      handler(val, oldVal) {
        this.applyGlobalTheme();
        // iOS Safari freezes its chrome tint at page LOAD (device-verified:
        // no meta change, repaint or scroll re-tints it). So when the RESOLVED
        // theme changes MID-SESSION — the account's server settings arriving
        // after login (dark load → day account = white page under dark bars),
        // a manual toggle, or the 21:00 auto flip — the only real fix is one
        // reload. localStorage already holds the new theme by now (the store
        // persists it), so the reloaded page pre-paints correctly. The
        // sessionStorage guard makes it one-shot per theme value — a reloaded
        // page starts with oldVal undefined, so it can never loop.
        if (IS_IOS && oldVal && val !== oldVal) {
          try {
            if (sessionStorage.getItem('jinni_theme_reloaded') !== val) {
              sessionStorage.setItem('jinni_theme_reloaded', val);
              window.location.reload();
            }
          } catch (e) { /* private mode denying sessionStorage — just skip */ }
        }
      },
    },
    // Re-derive after every navigation — nextTick so the NEW view is in the
    // DOM before its background is read (the watcher fires before router-view
    // swaps). The #app observer below catches the swap too; both are cheap.
    $route() { this.$nextTick(() => this.applyGlobalTheme()); },
  },
  created() {
    this.$store.dispatch('settings/startAutoThemeCheck');
    // Re-apply on EVERY settings change — even when the resolved theme value
    // didn't change (e.g. re-selecting the already-active option). This is what
    // fixes "click light, chrome stays dark until refresh": the watcher above
    // only fires on a value *change*, this fires on every preference write.
    this._unsub = this.$store.subscribe((mutation) => {
      if (mutation.type.startsWith('settings/')) this.applyGlobalTheme();
    });
  },
  mounted() {
    // Route swaps replace #app's child — re-derive when that happens, so the
    // chrome reads the page that is actually on screen.
    this._appMo = new MutationObserver(() => this.queueSync());
    const app = document.getElementById('app');
    if (app) this._appMo.observe(app, { childList: true });
    this.applyGlobalTheme();
  },
  beforeUnmount() {
    this._unsub && this._unsub();
    this._appMo && this._appMo.disconnect();
    this._rootMo && this._rootMo.disconnect();
    clearTimeout(this._resyncT);
    (this._nudgeTimers || []).forEach(clearTimeout);
  },
  methods: {
    applyGlobalTheme() {
      const theme = THEME_COLORS[this.effectiveTheme] ? this.effectiveTheme : 'light';
      // 1. <html data-theme> — drives global CSS (modals, maps, scrollbars…)
      document.documentElement.setAttribute('data-theme', theme);
      // 2. body.theme-* — legacy class hooks used across pages
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${theme}`);
      // 3. Chrome/canvas/backdrop — derived from the rendered page.
      this.syncChromeToPage();
      // Pages transition their backgrounds (0.5s) — read the settled value
      // once more after the transition so the chrome lands on the final color.
      clearTimeout(this._resyncT);
      this._resyncT = setTimeout(() => this.syncChromeToPage(), 650);
    },
    // Coalesce observer bursts into one read per frame.
    queueSync() {
      if (this._syncQueued) return;
      this._syncQueued = true;
      requestAnimationFrame(() => {
        this._syncQueued = false;
        this.syncChromeToPage();
      });
    },
    syncChromeToPage() {
      const theme = THEME_COLORS[this.effectiveTheme] ? this.effectiveTheme : 'light';
      const app = document.getElementById('app');
      const paint = app ? findPagePaint(app) : null;
      const [fbTop, fbBottom] = FALLBACK_EDGES[theme];
      const top = paint ? paint.top : fbTop;
      const bottom = paint ? paint.bottom : fbBottom;

      // <html> canvas: the area beyond the page at top and bottom. Safari
      // TILES (repeats) this gradient beyond the document — the original
      // swap theory was CORRECT (re-verified on device 2026-08-21 after a
      // wrong "natural orientation" detour): with natural halves the repeated
      // tile BELOW the page starts with its TOP half, so every bottom bar
      // showed the page's TOP color ("true white" on day landing/contact/
      // explore/business, #0a0118 instead of blue on contact night). Swapped
      // halves (bottom color first): the tile below the page leads with the
      // BOTTOM color and the tile above ends with the TOP color — both
      // overscroll edges correct.
      // CRITICAL: background-color is set as a LONGHAND, always solid. The
      // old code wrote the `background` shorthand with a gradient, which
      // resets background-color to TRANSPARENT — and iOS Safari tints from
      // background-color, so it fell back to WHITE (the white-band shots).
      const de = document.documentElement;
      de.style.backgroundImage = top === bottom
        ? 'none'
        : `linear-gradient(${bottom} 50%, ${top} 50%)`;
      // SPLIT tint sources — settled by the Iphone_Jinni_Look screenshots
      // (2026-08-21): iOS Safari tints the TOP strip from <body>'s
      // background-color and the BOTTOM bar / keyboard band from <html>'s.
      // (IMG_1362/1364/1367: top strip showed the color assigned to body;
      // IMG_1361: auth's bottom bar showed the color assigned to html.)
      // So <html> carries the page's BOTTOM edge and <body> its TOP edge.
      // Both are ALWAYS solid longhands — the old `background` shorthand
      // blanked background-color to transparent and Safari's tint fell back
      // to WHITE (the original white-band screenshots).
      de.style.backgroundColor = bottom;
      // <body> backdrop: exposed when the iOS keyboard shifts the visual
      // viewport behind fixed-100vh shells. Carries the page's OWN computed
      // background image verbatim (or none for flat pages) over a solid color.
      document.body.style.backgroundImage = (paint && paint.image) ? paint.image : 'none';
      document.body.style.backgroundColor = top;
      // <meta theme-color> — on iOS Safari the URL bar sits at the BOTTOM, so
      // this meta colors the BOTTOM bar, and it must carry the page's BOTTOM
      // edge. This was the "external factor" behind the day-mode-only bottom
      // defects (device-settled 2026-08-21): the meta held the TOP color the
      // whole time — night hid it (both edges near-black), day exposed it
      // (cream meta under a sandy page bottom = the "true white" bars).
      // The TOP strip is driven by body's background-color, set above.
      // When the color CHANGES the node is REPLACED rather than mutated:
      // several iOS versions ignore content edits on an existing meta during
      // SPA navigation but re-read a freshly inserted one.
      let meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (meta && meta.getAttribute('content') !== bottom) {
        meta.remove();
        meta = null;
      }
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        meta.setAttribute('content', bottom);
        document.head.appendChild(meta);
      }

      // Watch the CURRENT page root: local theme toggles (admin / validator /
      // marketing), the landing's clock-based sky swap, and v-if backdrop
      // changes all mutate class/children here — the chrome follows live.
      this.observePageRoot();
      // Best-effort: iOS Safari computes the toolbar tint at render time and
      // ignores post-paint JS changes, so the bar can lag until a reload.
      // A 1px scroll provokes a re-derivation on versions that re-evaluate
      // on scroll. Harmless elsewhere.
      this.nudgeSafariToolbar();
    },
    observePageRoot() {
      const app = document.getElementById('app');
      const root = (app && app.firstElementChild) || null;
      if (root === this._observedRoot) return;
      this._rootMo && this._rootMo.disconnect();
      this._observedRoot = root;
      if (!root) return;
      this._rootMo = new MutationObserver(() => this.queueSync());
      this._rootMo.observe(root, { attributes: true, attributeFilter: ['class'], childList: true });
    },
    nudgeSafariToolbar() {
      const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (!isIOS) return;
      // Safari only re-derives the canvas/toolbar tint on a DOCUMENT scroll —
      // and a single early nudge can fire BEFORE the new route has painted,
      // making Safari re-sample the OLD page and then go quiet (the stale bar
      // on auth → business-onboarding). So nudge in a staggered series after
      // each sync; later nudges hit the settled paint. Timers are reset on
      // every call so bursts don't stack.
      (this._nudgeTimers || []).forEach(clearTimeout);
      this._nudgeTimers = [0, 350, 900].map(delay => setTimeout(() => {
        requestAnimationFrame(() => {
          // Fixed-height shells (chat, business dashboard) have nothing to
          // scroll, so a bare 1px nudge would be a no-op there. Temporarily
          // grant 2px of scroll slack — invisible on fixed shells — so the
          // nudge always actually scrolls the document.
          const de = document.documentElement;
          const needsSlack = de.scrollHeight <= window.innerHeight;
          if (needsSlack) document.body.style.minHeight = 'calc(100vh + 2px)';
          window.scrollBy(0, 1);
          requestAnimationFrame(() => {
            window.scrollBy(0, -1);
            if (needsSlack) document.body.style.minHeight = '';
          });
        });
      }, delay));
    },
  },
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background-color: #f9f5eb;
  transition: background-color 0.5s ease;
}
/* index.html's inline pre-paint script sets data-theme BEFORE this stylesheet
 * loads, so a night user never sees the cream base between CSS apply and Vue
 * mount (the JS bundle is big — first paint happens well before mount). */
html[data-theme="dark"], html[data-theme="dark"] body {
  background-color: #0a0118;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>