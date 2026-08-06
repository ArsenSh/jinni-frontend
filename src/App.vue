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
      // 3. <html> AND <body> background — app-wide page background.
      //    iOS 26+ Safari ignores <meta theme-color> and derives the toolbar
      //    tint from the <body> background (or a fixed/sticky edge element),
      //    so <body> MUST be painted for the mobile chrome to follow the theme.
      document.documentElement.style.backgroundColor = color;
      document.body.style.backgroundColor = color;
      // 4. <meta name="theme-color"> — Safari/Chrome browser chrome
      let meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', color);

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
        window.scrollBy(0, 1);
        requestAnimationFrame(() => window.scrollBy(0, -1));
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