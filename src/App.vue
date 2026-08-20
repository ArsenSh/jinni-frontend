<template>
  <div id="app" :class="themeClass">
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { syncPageChrome } from './utils/pageChrome';

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
      // 3. Browser chrome (meta theme-color + overscroll canvas) is handled by
      //    utils/pageChrome.js, which SAMPLES the page's real edge colors —
      //    no hardcoded tones, and it owns the <html>/<body> inline paints.
      //    (`color` stays as the CSS pre-paint fallback; see THEME_COLORS.)
      void color;
      syncPageChrome();
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