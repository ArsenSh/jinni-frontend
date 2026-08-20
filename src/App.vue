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

/* Per-page edge colors [top, bottom] — from the 2026-08-20 audit of every
 * routed view's real background. The browser chrome (meta theme-color = top)
 * and the overscroll canvas (html two-tone gradient) follow the page the user
 * is actually on, so the rubber-band matches each page's own gradient ends.
 * Pages absent here use the theme default. Known limitation: pages with their
 * own LOCAL theme toggle (admin, validator, marketing) are painted for the
 * store theme — their local toggle doesn't reach this map. */
const PAGE_EDGES = {
  dark: {
    default:               ['#0a0118', '#16213e'],   // the app-wide night gradient ends
    '/':                   ['#0a0118', '#080313'],   // starry sky
    '/business':           ['#0a0118', '#080313'],
    '/marketing':          ['#0a0118', '#0a0118'],   // flat pages
    '/admin':              ['#0a0118', '#0a0118'],   // flat in BOTH themes (Arsen)
  },
  light: {
    default:               ['#f9f5eb', '#f9f5eb'],
    '/':                   ['#f9f5eb', '#e0a082'],   // desert sky pages
    '/business':           ['#f9f5eb', '#e0a082'],
    '/contact':            ['#f9f5eb', '#e0a082'],
    '/terms':              ['#f9f5eb', '#e0a082'],
    '/privacy':            ['#f9f5eb', '#e0a082'],
    '/business/terms':     ['#f9f5eb', '#e0a082'],
    '/business/privacy':   ['#f9f5eb', '#e0a082'],
    '/chat':               ['#f9f5eb', '#efe4cf'],   // cream gradient pages
    '/explore':            ['#f9f5eb', '#efe4cf'],
    '/business/dashboard': ['#f9f5eb', '#efe4cf'],
    '/share':              ['#f9f5eb', '#efe4cf'],
    '/admin':              ['#f4efe4', '#f4efe4'],   // admin's own cream tone
  },
};

function pageEdges(theme, path) {
  const map = PAGE_EDGES[theme] || PAGE_EDGES.light;
  if (map[path]) return map[path];
  // Prefix routes (/share/:token, /marketing/:token)
  if (path.startsWith('/share')) return map['/share'] || map.default;
  if (path.startsWith('/marketing')) return map['/marketing'] || map.default;
  return map.default;
}

export default {
  name: 'App',
  computed: {...mapGetters('settings', ['effectiveTheme', 'themeClass'])},
  watch: {
    effectiveTheme: {
      immediate: true,
      handler() { this.applyGlobalTheme(); },
    },
    // Re-assert on every navigation, so a page that touched these globals
    // (or a stale value) can't leave the browser chrome out of sync.
    $route() { this.applyGlobalTheme(); },
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
  beforeUnmount() { this._unsub && this._unsub(); },     // beforeDestroy() in Vue 2
  methods: {
    applyGlobalTheme() {
      const theme = THEME_COLORS[this.effectiveTheme] ? this.effectiveTheme : 'light';
      const color = THEME_COLORS[theme];

      // 1. <html data-theme> — drives global CSS (modals, maps, scrollbars…)
      document.documentElement.setAttribute('data-theme', theme);
      // 2. body.theme-* — legacy class hooks used across pages
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${theme}`);
      // 3. <html> AND <body> background — per-page edge colors (see PAGE_EDGES).
      //    The <html> canvas gets a two-tone 50/50 gradient: top overscroll
      //    reveals its top half, bottom overscroll its bottom half. <body>
      //    stays painted with the TOP color — iOS 26+ Safari ignores the meta
      //    and derives the toolbar tint from the body paint.
      const [edgeTop, edgeBottom] = pageEdges(theme, this.$route?.path || '/');
      // The canvas TILES this background beyond the page: the area revealed by
      // TOP overscroll is the previous tile's BOTTOM half, and vice versa — so
      // the halves must be swapped (bottom color first). In-page the gradient
      // is hidden behind the painted <body>, only the tiled edges ever show.
      document.documentElement.style.background = edgeTop === edgeBottom
        ? edgeTop
        : `linear-gradient(${edgeBottom} 50%, ${edgeTop} 50%)`;
      // Body backdrop: iOS keyboard open/close shifts the visual viewport and
      // exposes the area BEHIND the page (fixed-100vh shells like chat show it
      // the most). A flat backdrop against a gradient page reads as broken
      // black bands — so gradient pages get a matching gradient backdrop.
      const NIGHT_GRAD = 'linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%)';
      const DAY_GRAD   = 'linear-gradient(180deg,#f9f5eb 0%,#f5edda 55%,#efe4cf 100%)';
      const GRADIENT_ROUTES = ['/chat', '/explore', '/business/dashboard', '/share',
        '/onboarding', '/business/apply', '/admin/businesses', '/contact',
        '/terms', '/privacy', '/business/terms', '/business/privacy'];
      const p = this.$route?.path || '/';
      const isGrad = GRADIENT_ROUTES.some(r => p === r || p.startsWith(r + '/'));
      document.body.style.background = isGrad
        ? (theme === 'dark' ? NIGHT_GRAD : (p === '/chat' || p === '/explore' || p === '/share' || p === '/business/dashboard' ? DAY_GRAD : edgeTop))
        : edgeTop;
      void color;
      // 4. <meta name="theme-color"> — Safari/Chrome browser chrome (top edge)
      let meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', edgeTop);

      // 5. Best-effort: iOS Safari computes the toolbar tint at render time and
      //    ignores post-paint JS changes, so the bar can lag until a reload.
      //    A 1px scroll provokes a re-derivation on versions that re-evaluate
      //    on scroll. Harmless elsewhere. NOTE: only works if the *document*
      //    itself scrolls — pages that scroll inside an inner container won't
      //    trigger it, and on some iOS versions nothing will short of reload.
      this.nudgeSafariToolbar();
    },
    nudgeSafariToolbar() {
      const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (!isIOS) return;
      requestAnimationFrame(() => {
        // Safari only re-derives the canvas/toolbar tint on a DOCUMENT scroll.
        // Fixed-height shells (chat, business dashboard) have nothing to
        // scroll, so the old 1px nudge was a no-op there and Safari kept the
        // PREVIOUS page's colors until a full reload (auth → dashboard bug).
        // Temporarily grant 2px of scroll slack — invisible on fixed shells —
        // so the nudge always actually scrolls.
        const de = document.documentElement;
        const needsSlack = de.scrollHeight <= window.innerHeight;
        if (needsSlack) document.body.style.minHeight = 'calc(100vh + 2px)';
        window.scrollBy(0, 1);
        requestAnimationFrame(() => {
          window.scrollBy(0, -1);
          if (needsSlack) document.body.style.minHeight = '';
        });
      });
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
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>