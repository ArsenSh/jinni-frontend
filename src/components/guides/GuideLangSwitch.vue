<template>
  <div class="gls" @click.stop>
    <button type="button" class="gls-btn" :aria-label="t('guides.nav.language')" :aria-expanded="open ? 'true' : 'false'" @click="open = !open">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9s1.2-6.5 3.6-9z"/></svg>
      <span>{{ locale.toUpperCase() }}</span>
    </button>
    <div v-if="open" class="gls-backdrop" @click="open = false"></div>
    <div v-if="open" class="gls-menu" role="menu">
      <button v-for="l in GUIDE_LANGS" :key="l.code" type="button" role="menuitemradio" :aria-checked="locale === l.code ? 'true' : 'false'"
              :lang="l.code" class="gls-opt" :class="{ on: locale === l.code }" @click="pick(l.code)">{{ l.label }}</button>
    </div>
  </div>
</template>

<script setup>
// Guide pages' language switch (2026-10-02, founder: "also add russian language
// too or other languages too"). Same storage as the business legal pages:
// jinni_settings.language.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { GUIDE_LANGS, setGuideLanguage } from '@/utils/guides'

const { t, locale } = useI18n()
const open = ref(false)
function pick(code) { setGuideLanguage(locale, code); open.value = false }
</script>

<style scoped>
.gls { position: relative; }
.gls-btn { font: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; box-sizing: border-box; font-size: 15px; line-height: 1; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); white-space: nowrap; letter-spacing: 0.04em; color: inherit; background: transparent; cursor: pointer; }
.gls-btn:hover { background: rgba(212, 175, 55, 0.12); }
.gls-backdrop { position: fixed; inset: 0; z-index: 40; }
.gls-menu { position: absolute; top: calc(100% + 8px); inset-inline-end: 0; z-index: 41; min-width: 150px; padding: 6px; border-radius: 14px; display: grid; gap: 2px; backdrop-filter: blur(20px) saturate(160%); }
:global(.night-mode) .gls-menu { background: rgba(26, 11, 46, 0.96); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 210, 122, 0.18); }
:global(.day-mode) .gls-menu { background: rgba(255, 253, 248, 0.97); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.18); }
.gls-opt { font: inherit; font-size: 15px; text-align: start; padding: 9px 12px; border: 0; border-radius: 10px; background: transparent; color: inherit; cursor: pointer; }
.gls-opt:hover { background: rgba(212, 175, 55, 0.14); }
.gls-opt.on { color: #b4540a; font-weight: 600; }
:global(.night-mode) .gls-opt.on { color: #ffd27a; }
</style>
