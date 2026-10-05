<template>
  <!-- The app's language pill outside the landing (guide pages, legal pages). Since
       2026-10-05 it is the LANDING's selector, look and behaviour (founder: "the language
       selector is beautiful only in landing page and in business landing page, all other
       locations it behaves differently when i open it"): a clear-glass pill with a line
       globe + the code; the list is a glass panel hanging from it, each language in its
       own script, the current one bold; it fades in, closes on a tap outside and by
       itself after 3 seconds. Colours follow the page's --lang-* tokens when it has them. -->
  <div class="gls" :class="{ open }" @click.stop>
    <button type="button" class="gls-btn" :title="currentTitle" :aria-label="t('guides.nav.language')" aria-haspopup="true" :aria-expanded="open ? 'true' : 'false'" @click="toggle">
      <svg class="gls-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9s1.200-6.500 3.600-9z"/></svg>
      <span class="gls-code">{{ locale.toUpperCase() }}</span>
    </button>
    <div v-if="open" class="gls-menu" role="menu">
      <button v-for="l in GUIDE_LANGS" :key="l.code" type="button" role="menuitemradio" :aria-checked="locale === l.code ? 'true' : 'false'"
              :lang="l.code" class="gls-opt" :class="{ on: locale === l.code }" @click="pick(l.code)">{{ l.label }}</button>
    </div>
  </div>
</template>

<script setup>
// Same storage as the business legal pages: jinni_settings.language.
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { GUIDE_LANGS, setGuideLanguage } from '@/utils/guides'

const { t, locale } = useI18n()
const open = ref(false)
const currentTitle = computed(() => GUIDE_LANGS.find(l => l.code === locale.value)?.label || 'Language')
let timer = null
const close = () => { open.value = false }
const stop = () => { clearTimeout(timer); document.removeEventListener('click', close) }
// The trigger stays on screen while the list is open, so it toggles.
const toggle = () => { open.value = !open.value }
watch(open, (on) => {
  stop()
  if (!on) return
  timer = setTimeout(close, 3000)
  setTimeout(() => { if (open.value) document.addEventListener('click', close, { once: true }) }, 0)
})
function pick(code) { setGuideLanguage(locale, code); close() }
onBeforeUnmount(stop)
</script>

<style scoped>
.gls { position: relative; display: inline-flex; align-items: center; }
.gls-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 44px; min-width: 44px; padding: 0 15px 0 13px; margin: 0; box-sizing: border-box;
  border: none; border-radius: 999px; cursor: pointer; white-space: nowrap; font-family: inherit; font-size: 14px; font-weight: 600; line-height: 1; letter-spacing: 0.08em;
  color: var(--lang-ink, var(--gls-ink)); background: var(--lang-glass, var(--gls-glass)); box-shadow: var(--lang-rim, var(--gls-rim));
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); transition: background-color 0.2s ease; }
.gls-btn:hover, .gls-btn:focus-visible, .gls.open .gls-btn { background: var(--lang-glass-hover, var(--gls-glass-hover)); outline: none; }
.gls-globe { width: 18px; height: 18px; flex: none; display: block; }
.gls-code { display: block; padding-top: 1px; }
/* Phones: a smaller pill; the tap area stays 44px through an invisible ::before. */
@media (max-width: 768px) {
  .gls-btn { height: 38px; min-width: 38px; padding: 0 12px 0 10px; gap: 6px; font-size: 13px; position: relative; }
  .gls-btn::before { content: ''; position: absolute; inset: -3px -2px; }
  .gls-globe { width: 16px; height: 16px; }
}
/* Width follows the longest language name. saturate 110%, not more: a stronger one
   turned the blurred sky glow behind the list into a purple panel (landing, 2026-10-01). */
.gls-menu { position: absolute; top: calc(100% + 8px); inset-inline-end: 0; z-index: 1001; width: max-content; min-width: 0; display: flex; flex-direction: column; gap: 2px;
  padding: 6px; border-radius: 20px; background: var(--lang-panel, var(--gls-panel)); box-shadow: var(--lang-panel-shadow, var(--gls-panel-rim));
  backdrop-filter: blur(24px) saturate(110%); -webkit-backdrop-filter: blur(24px) saturate(110%); animation: gls-in 0.18s ease-out; }
@keyframes gls-in { from { opacity: 0 } to { opacity: 1 } }
.gls-opt { display: flex; align-items: center; width: 100%; min-height: 44px; padding: 0 16px 0 14px; margin: 0; border: none; border-radius: 14px; background: transparent; cursor: pointer;
  font-family: inherit; font-size: 16px; font-weight: 400; line-height: 1.2; text-align: start; white-space: nowrap; color: var(--lang-ink, var(--gls-ink)); transition: background-color 0.15s ease; }
.gls-opt:hover, .gls-opt:focus-visible, .gls-opt:active { background: var(--lang-hover, var(--gls-hover)); outline: none; }
.gls-opt.on { font-weight: 700; }
@media (prefers-reduced-motion: reduce) { .gls-menu { animation: none; } }
</style>

<!-- Not scoped: the theme class sits on the page's root, outside this component
     (":global(.day-mode) .gls" in a scoped block does not reach .gls). -->
<style>
.gls {
  --gls-ink: #f3eaf8; --gls-glass: rgba(255,255,255,0.06); --gls-glass-hover: rgba(255,255,255,0.12);
  --gls-rim: inset 0 0 0 0.75px rgba(220,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px -2px rgba(0,0,0,0.3);
  --gls-panel: rgba(255,255,255,0.07); --gls-panel-rim: inset 0 0 0 0.75px rgba(255,240,215,0.28), inset 0 1px 0 rgba(255,240,215,0.2), 0 0 18px -2px rgba(0,0,0,0.3);
  --gls-hover: rgba(220,210,255,0.1);
}
.day-mode .gls {
  --gls-ink: #7A4A1C; --gls-glass: rgba(255,255,255,0.45); --gls-glass-hover: rgba(255,255,255,0.62);
  --gls-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), 0 0 18px -2px rgba(140,61,7,0.14);
  --gls-panel: rgba(255,255,255,0.24); --gls-panel-rim: inset 0 0 0 0.75px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55), 0 0 18px -2px rgba(140,61,7,0.14);
  --gls-hover: rgba(140,61,7,0.08);
}
</style>
