<template>
  <div class="glg" :class="theme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <header class="glg-top">
      <router-link to="/guides" class="glg-brand" aria-label="Jinni Guides">
        <img src="/images/lamp.webp" alt="" class="glg-lamp" />
        <span class="glg-word" translate="no">Jinni</span>
        <span class="glg-sep" aria-hidden="true"></span>
        <span class="glg-sub">{{ t('guides.nav.guides_label') }}</span>
      </router-link>
      <GuideLangSwitch />
    </header>

    <main class="glg-main">
      <h1>{{ t(ns + '.title') }}</h1>
      <p class="glg-date">{{ t(ns + '.last_updated') }}</p>
      <section v-for="(sec, key) in sections" :key="key" class="glg-section">
        <h2>{{ rt(sec.title) }}</h2>
        <p v-if="sec.content">{{ rt(sec.content) }}</p>
        <ul v-if="sec.points">
          <li v-for="(pt, i) in sec.points" :key="i">{{ rt(pt) }}</li>
        </ul>
      </section>
      <nav class="glg-links">
        <router-link v-if="ns !== 'guideTerms'" to="/guides/terms">{{ t('guideTerms.title') }}</router-link>
        <router-link v-if="ns !== 'guidePrivacy'" to="/guides/privacy">{{ t('guidePrivacy.title') }}</router-link>
        <router-link to="/terms">{{ t('guides.landing.foot_terms') }}</router-link>
        <router-link to="/privacy">{{ t('guides.landing.foot_privacy') }}</router-link>
        <router-link to="/guides">Jinni · {{ t('guides.nav.guides_label') }}</router-link>
      </nav>
    </main>
  </div>
</template>

<script setup>
// Guide Terms of Service + Guide Privacy Policy (2026-10-02, founder: "then
// write privacy policy and terms of service in other section"). One page,
// two documents: the route says which (meta.legal = 'guideTerms' | 'guidePrivacy');
// the text lives in the locale files, so every app language gets it.
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { guideTheme, initGuideLanguage } from '@/utils/guides'
import GuideLangSwitch from '@/components/guides/GuideLangSwitch.vue'

const route = useRoute()
const { t, tm, rt, locale } = useI18n()
initGuideLanguage(locale)
const theme = guideTheme()
const ns = computed(() => (route.meta.legal === 'guidePrivacy' ? 'guidePrivacy' : 'guideTerms'))
const sections = computed(() => tm(ns.value + '.sections') || {})
watch([ns, locale], () => { document.title = `${t(ns.value + '.title')} — Jinni` }, { immediate: true })
</script>

<style scoped>
.glg { min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 56px; box-sizing: border-box; }
.glg.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 50%, #f9f5eb 100%); color: #3c2a1e; }
.glg.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 50%, #0a0118 100%); color: #f5e6c8; }
/* Both themes end on their TOP colour: iOS 26 paints the area past the page
   with one solid colour (the top), so a page ending lighter showed a band at
   the bottom edge (founder 2026-10-03). */
.glg-top { max-width: 760px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 18px 0; gap: 10px; }
.glg-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
.glg-lamp { width: 52px; height: auto; margin-block: -8px; margin-inline: -8px -6px; }
.glg-word { font-family: var(--brand-serif, 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif); font-size: 26px; font-weight: 600; line-height: 1; letter-spacing: 1px;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.glg-sep { width: 1px; height: 20px; background: linear-gradient(180deg, rgba(212, 175, 55, 0), rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0)); }
.glg-sub { font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; }
.glg-main { max-width: 760px; margin: 12px auto 0; border-radius: 20px; padding: 28px 24px; backdrop-filter: blur(20px) saturate(160%); }
.day-mode .glg-main { background: rgba(255, 255, 255, 0.65); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .glg-main { background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.5); }
h1 { margin: 0 0 6px; font-size: clamp(26px, 5vw, 34px); }
.glg-date { margin: 0 0 22px; font-size: 14px; opacity: 0.7; }
.glg-section { margin: 0 0 22px; }
.glg-section h2 { font-size: 19px; margin: 0 0 8px; color: #b4540a; }
.night-mode .glg-section h2 { color: #ffd27a; }
.glg-section p, .glg-section li { line-height: 1.65; font-size: 16px; }
.glg-section p { margin: 0 0 8px; }
.glg-section ul { margin: 0; padding-inline-start: 22px; display: grid; gap: 6px; }
.glg-links { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(212, 175, 55, 0.3); font-size: 14px; }
.glg-links a { color: #7A4A1C; } .night-mode .glg-links a { color: #FF8C00; }
@media (max-width: 400px) { .glg-sub, .glg-sep { display: none; } .glg-main { padding: 22px 18px; } }
</style>
