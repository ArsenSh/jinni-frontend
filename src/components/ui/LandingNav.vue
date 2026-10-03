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
        <b>{{ t('landing.nav.discover_cities') }}</b><small>{{ t('landing.nav.discover_sub') }}</small></a>
      <router-link v-else to="/" class="lnav-item" @click="open = false">
        <b>{{ t('landing.nav.travelers') }}</b><small>{{ t('landing.nav.travelers_sub') }}</small></router-link>
      <router-link to="/guides" class="lnav-item" @click="open = false">
        <b>{{ t('landing.nav.guides') }}</b><small>{{ t('landing.nav.guides_sub') }}</small></router-link>
      <router-link v-if="variant === 'travel'" to="/business" class="lnav-item" @click="open = false">
        <b>{{ t('landing.nav.business') }}</b><small>{{ t('landing.nav.business_sub') }}</small></router-link>
      <div class="lnav-actions">
        <router-link to="/auth" class="lnav-ghost" @click="open = false">{{ t('landing.nav.sign_in') }}</router-link>
        <button type="button" class="lnav-primary" @click="open = false; $emit('primary')">{{ primaryLabel || t('landing.nav.create_account') }}</button>
      </div>
      <div class="lnav-langs" role="group" :aria-label="t('landing.nav.language')">
        <button v-for="l in languages" :key="l.code" type="button" :lang="l.code" :class="{ on: l.code === currentLanguage }"
                :aria-pressed="l.code === currentLanguage ? 'true' : 'false'" @click="$emit('select-language', l.code)">{{ l.title }}</button>
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
.lnav-sheet {
  position: fixed; z-index: 2;
  top: calc(var(--hdr-top, 16px) + var(--hdr-h, 48px) + 6px);
  left: var(--gutter, 16px); right: var(--gutter, 16px);
  display: grid; gap: 2px; padding: 10px; border-radius: 22px; text-align: start;
  color: var(--lnav-sheet-ink, #f6ebdf); background: var(--lnav-sheet, rgba(18,10,30,0.97));
  backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
  box-shadow: var(--lnav-sheet-shadow, inset 0 0 0 0.75px rgba(255,240,215,0.16), 0 0 18px -2px rgba(0,0,0,0.6));
}
.lnav-item { display: grid; gap: 3px; padding: 12px 14px; border-radius: 14px; color: inherit; text-decoration: none }
.lnav-item:hover, .lnav-item:focus-visible { background: var(--lang-hover, rgba(255,240,215,0.1)); outline: none }
.lnav-item b { font-weight: 600; font-size: 16px }
.lnav-item small { font-size: 13px; opacity: 0.65; line-height: 1.35 }
.lnav-actions { display: grid; grid-template-columns: 1fr 1.35fr; gap: 8px; padding: 10px 4px 4px; margin-top: 4px; border-top: 1px solid var(--lnav-rule, rgba(255,240,215,0.12)) }
.lnav-ghost, .lnav-primary {
  display: flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 999px; padding: 0 12px;
  font: inherit; font-size: 15px; font-weight: 600; text-decoration: none; text-align: center; cursor: pointer; border: 0;
}
.lnav-ghost { color: inherit; background: transparent; box-shadow: inset 0 0 0 0.75px currentColor }
.lnav-primary { color: var(--lnav-primary-ink, #2a1405); background: var(--lnav-primary, linear-gradient(45deg, #E9C766, #FFA640)) }
.lnav-langs { display: flex; flex-wrap: wrap; gap: 4px; padding: 10px 4px 2px }
.lnav-langs button {
  font: inherit; font-size: 13px; padding: 6px 11px; border-radius: 999px; border: 0; cursor: pointer;
  color: inherit; background: transparent; opacity: 0.72;
}
.lnav-langs button.on { opacity: 1; background: var(--lang-hover, rgba(255,240,215,0.12)) }

@media (max-width: 768px) {
  .lnav-links { display: none }
  .lnav-menu-btn { display: inline-block }
  /* Founder 2026-10-03: on phones the menu button sits at the far edge,
     the language pill before it (the header row is the pages' flex row). */
  .lnav { order: 2 }
}
</style>
