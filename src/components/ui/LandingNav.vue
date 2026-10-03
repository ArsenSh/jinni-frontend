<template>
  <!-- Sits inside the landing's fixed .language-selector-container, before the
       EN pill. Desktop: one glass capsule of links + Sign in. Phone: a menu
       button that opens a panel (founder 2026-10-03: "menu near languages for
       iPhone to navigate discovery page, business page, guide page, sign in or
       sign up"). Looks come from the page's own pill tokens (--lang-glass,
       --lang-rim, --lang-ink …) so day and night match the EN pill exactly. -->
  <nav class="lnav" :aria-label="t('landing.nav.menu')">
    <div class="lnav-links">
      <a v-if="variant === 'travel'" href="#cities" @click.prevent="$emit('discover')">{{ t('landing.nav.discover') }}</a>
      <router-link v-else to="/">{{ t('landing.nav.travelers') }}</router-link>
      <router-link to="/guides">{{ t('landing.nav.guides') }}</router-link>
      <router-link v-if="variant === 'travel'" to="/business">{{ t('landing.nav.business') }}</router-link>
      <router-link to="/auth" class="lnav-signin">{{ t('landing.nav.sign_in') }}</router-link>
    </div>

    <button type="button" class="lnav-menu-btn" :aria-expanded="open ? 'true' : 'false'"
            :aria-label="open ? t('landing.nav.close_menu') : t('landing.nav.menu')" @click.stop="open = !open">
      <span></span><span></span>
    </button>

    <div v-if="open" class="lnav-backdrop" @click="open = false"></div>
    <div v-if="open" class="lnav-sheet" role="dialog" :aria-label="t('landing.nav.menu')" @click.stop>
      <a v-if="variant === 'travel'" href="#cities" class="lnav-item" @click.prevent="open = false; $emit('discover')">
        <svg class="lnav-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg><span class="lnav-txt"><b>{{ t('landing.nav.discover_cities') }}</b><small>{{ t('landing.nav.discover_sub') }}</small></span><svg class="lnav-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a>
      <router-link v-else to="/" class="lnav-item" @click="open = false">
        <svg class="lnav-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg><span class="lnav-txt"><b>{{ t('landing.nav.travelers') }}</b><small>{{ t('landing.nav.travelers_sub') }}</small></span><svg class="lnav-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></router-link>
      <router-link to="/guides" class="lnav-item" @click="open = false">
        <svg class="lnav-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg><span class="lnav-txt"><b>{{ t('landing.nav.guides') }}</b><small>{{ t('landing.nav.guides_sub') }}</small></span><svg class="lnav-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></router-link>
      <router-link v-if="variant === 'travel'" to="/business" class="lnav-item" @click="open = false">
        <svg class="lnav-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6z"/><path d="M10 20v-5h4v5"/></svg><span class="lnav-txt"><b>{{ t('landing.nav.business') }}</b><small>{{ t('landing.nav.business_sub') }}</small></span><svg class="lnav-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></router-link>
      <div class="lnav-actions">
        <router-link to="/auth" class="lnav-ghost" @click="open = false">{{ t('landing.nav.sign_in') }}</router-link>
        <button type="button" class="lnav-primary" @click="open = false; $emit('primary')">{{ primaryLabel || t('landing.nav.create_account') }}</button>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default {
  name: 'LandingNav',
  props: {
    variant: { type: String, default: 'travel' },          // 'travel' (/) or 'business' (/business)
    languages: { type: Array, default: () => [] },          // [{ code, title }]
    currentLanguage: { type: String, default: 'en' },
    primaryLabel: { type: String, default: '' },            // panel's main button; default "Create free account"
  },
  emits: ['discover', 'primary', 'select-language'],
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const open = ref(false)
    const onKey = (e) => { if (e.key === 'Escape') open.value = false }
    watch(() => route.fullPath, () => { open.value = false })
    onMounted(() => document.addEventListener('keydown', onKey))
    onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
    return { t, open }
  },
}
</script>

<style scoped>
.lnav { display: flex; align-items: center }
/* Desktop capsule: the EN pill's own glass, height and ink. */
.lnav-links {
  display: flex; align-items: center; gap: 2px; height: 44px; padding: 0 6px; border-radius: 999px;
  background: var(--lang-glass, rgba(255,255,255,0.06)); box-shadow: var(--lang-rim, none);
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
}
.lnav-links a {
  font-size: 14px; font-weight: 500; text-decoration: none; color: var(--lang-ink, #f5e6c8); opacity: 0.82;
  padding: 8px 12px; border-radius: 999px; white-space: nowrap; transition: background-color 0.2s ease, opacity 0.2s ease;
}
.lnav-links a:hover, .lnav-links a:focus-visible { opacity: 1; background: var(--lang-hover, rgba(255,240,215,0.1)); outline: none }
.lnav-links .lnav-signin { opacity: 1; font-weight: 600; box-shadow: inset 0 0 0 0.75px currentColor; margin-inline-start: 4px }

.lnav-menu-btn {
  display: none; position: relative; width: 38px; height: 38px; border: 0; border-radius: 999px; cursor: pointer; padding: 0;
  color: var(--lang-ink, #f5e6c8); background: var(--lang-glass, rgba(255,255,255,0.06)); box-shadow: var(--lang-rim, none);
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
}
.lnav-menu-btn span {
  position: absolute; left: 11px; right: 11px; height: 1.5px; border-radius: 2px; background: currentColor;
  transition: transform 0.25s ease, top 0.25s ease;
}
.lnav-menu-btn span:first-child { top: 15px }
.lnav-menu-btn span:last-child { top: 22px }
.lnav-menu-btn[aria-expanded="true"] span:first-child { top: 18.25px; transform: rotate(45deg) }
.lnav-menu-btn[aria-expanded="true"] span:last-child { top: 18.25px; transform: rotate(-45deg) }
.lnav-menu-btn:focus-visible { outline: 2px solid var(--lang-ink, #f5e6c8); outline-offset: 2px }

.lnav-backdrop { position: fixed; inset: 0; z-index: 1 }
/* Compact panel (founder 2026-10-03: "the menu section … compact and more
   understandable for mobile"): drops from the button instead of spanning the
   screen; each row = icon, name, one hint line, chevron; no language list —
   the EN pill sits right beside the button. */
.lnav-sheet {
  position: fixed; z-index: 2;
  top: calc(var(--hdr-top, 16px) + var(--hdr-h, 48px) + 4px);
  right: var(--gutter, 16px); width: min(320px, calc(100vw - 2 * var(--gutter, 16px)));
  display: grid; gap: 0; padding: 6px; border-radius: 20px; text-align: start;
  color: var(--lnav-sheet-ink, #f6ebdf); background: var(--lnav-sheet, rgba(18,10,30,0.97));
  backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
  box-shadow: var(--lnav-sheet-shadow, inset 0 0 0 0.75px rgba(255,240,215,0.16), 0 0 18px -2px rgba(0,0,0,0.6));
  transform-origin: top right; animation: lnav-in 0.18s ease-out;
}
[dir="rtl"] .lnav-sheet { right: auto; left: var(--gutter, 16px); transform-origin: top left }
@keyframes lnav-in { from { opacity: 0 } to { opacity: 1 } }
.lnav-item { display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 10px; border-radius: 14px; color: inherit; text-decoration: none }
.lnav-item:hover, .lnav-item:focus-visible { background: var(--lang-hover, rgba(255,240,215,0.1)); outline: none }
.lnav-ico, .lnav-chev { flex: none; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round }
.lnav-ico { width: 20px; height: 20px; opacity: 0.85 }
.lnav-chev { width: 16px; height: 16px; opacity: 0.4 }
[dir="rtl"] .lnav-chev { transform: scaleX(-1) }
.lnav-txt { flex: 1; min-width: 0; display: grid; gap: 1px }
.lnav-txt b { font-weight: 600; font-size: 15px; line-height: 1.3 }
.lnav-txt small { font-size: 12.5px; line-height: 1.35; opacity: 0.62; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden }
.lnav-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 6px; padding: 8px 4px 4px; margin-top: 4px; border-top: 1px solid var(--lnav-rule, rgba(255,240,215,0.12)) }
.lnav-ghost, .lnav-primary {
  display: flex; align-items: center; justify-content: center; min-height: 44px; border-radius: 999px; padding: 0 12px;
  font: inherit; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center; cursor: pointer; border: 0;
}
.lnav-ghost { color: inherit; background: transparent; box-shadow: inset 0 0 0 0.75px currentColor }
.lnav-primary { color: var(--lnav-primary-ink, #2a1405); background: var(--lnav-primary, linear-gradient(45deg, #E9C766, #FFA640)) }
@media (prefers-reduced-motion: reduce) { .lnav-sheet { animation: none } }

@media (max-width: 768px) {
  .lnav-links { display: none }
  .lnav-menu-btn { display: inline-block }
  /* Founder 2026-10-03: on phones the menu button sits at the far edge,
     the language pill before it (the header row is the pages' flex row). */
  .lnav { order: 2 }
}
</style>
