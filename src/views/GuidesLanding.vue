<template>
  <div class="gl" :class="theme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <header class="gl-top">
      <router-link to="/" class="gl-brand" aria-label="Jinni">
        <img src="/images/lamp.webp" alt="" class="gl-lamp" />
        <span class="gl-word" translate="no">Jinni</span>
        <span class="gl-sep" aria-hidden="true"></span>
        <span class="gl-sub-brand">{{ t('guides.nav.guides_label') }}</span>
      </router-link>
      <div class="gl-top-right">
        <GuideLangSwitch />
        <router-link v-if="signedIn" :to="isGuide ? '/guide/dashboard' : '/guides/apply'" class="gl-link">{{ isGuide ? t('guides.nav.my_page') : t('guides.nav.apply') }}</router-link>
        <router-link v-else to="/auth?redirect=/guides/apply" class="gl-link">{{ t('guides.nav.sign_in') }}</router-link>
      </div>
    </header>

    <section class="gl-hero">
      <div class="gl-hero-text">
        <p class="gl-badge"><span class="gl-dot" aria-hidden="true"></span>{{ t('guides.landing.badge') }} <span class="gl-badge-free">· {{ t('guides.landing.badge_free') }}</span></p>
        <h1>{{ t('guides.landing.h1_a') }}<br />{{ t('guides.landing.h1_b') }}<br /><span class="grad">{{ t('guides.landing.h1_c') }}</span></h1>
        <p class="gl-sub">{{ t('guides.landing.sub_before') }} <strong dir="ltr">{{ t('guides.landing.sub_page') }}</strong> {{ t('guides.landing.sub_after') }}</p>
        <div class="gl-cta-row">
          <router-link :to="ctaTo" class="gl-cta jinni-pill">{{ isGuide ? t('guides.landing.cta_dashboard') : t('guides.landing.cta_apply') }}</router-link>
          <span class="gl-note">{{ t('guides.landing.note') }}</span>
        </div>
      </div>

      <!-- What a guide gets, shown, not told. Clearly an example. -->
      <aside class="gl-example" :aria-label="t('guides.landing.example_label')">
        <span class="gl-example-tag">{{ t('guides.landing.example_tag') }}</span>
        <div class="gl-ex-head">
          <div class="gl-ex-avatar">AP</div>
          <div>
            <strong>Ani Petrosyan</strong>
            <small>{{ t('guides.landing.ex_meta') }}</small>
          </div>
        </div>
        <ul class="gl-ex-list">
          <li><span class="gl-ex-cat">{{ t('guides.categories.hidden_gem') }}</span><b>{{ t('guides.landing.ex1_title') }}</b><em>{{ t('guides.landing.ex1_note') }}</em></li>
          <li><span class="gl-ex-cat">{{ t('guides.categories.restaurant') }}</span><b>{{ t('guides.landing.ex2_title') }}</b><em>{{ t('guides.landing.ex2_note') }}</em></li>
          <li><span class="gl-ex-cat">{{ t('guides.categories.activity') }}</span><b>{{ t('guides.landing.ex3_title') }}</b><em>{{ t('guides.landing.ex3_note') }}</em></li>
        </ul>
        <div class="gl-ex-foot"><span dir="ltr">jinni.travel/@ani.travels</span> <span class="gl-ex-badge">{{ t('guides.landing.ex_badge') }}</span></div>
      </aside>
    </section>

    <section class="gl-grid">
      <div class="gl-card"><div class="gl-ico">★</div><h3>{{ t('guides.landing.b1_title') }}</h3><p>{{ t('guides.landing.b1_text') }}</p></div>
      <div class="gl-card"><div class="gl-ico">◎</div><h3>{{ t('guides.landing.b2_title') }}</h3><p>{{ t('guides.landing.b2_text') }}</p></div>
      <div class="gl-card"><div class="gl-ico">✉</div><h3>{{ t('guides.landing.b3_title') }}</h3><p>{{ t('guides.landing.b3_text') }}</p></div>
    </section>

    <section class="gl-steps">
      <h2>{{ t('guides.landing.how_title') }}</h2>
      <ol>
        <li><span>1</span><div><strong>{{ t('guides.landing.step1_strong') }}</strong> {{ t('guides.landing.step1_text') }}</div></li>
        <li><span>2</span><div><strong>{{ t('guides.landing.step2_strong') }}</strong> {{ t('guides.landing.step2_text') }}</div></li>
        <li><span>3</span><div><strong>{{ t('guides.landing.step3_strong') }}</strong> {{ t('guides.landing.step3_text') }}</div></li>
      </ol>
      <router-link :to="ctaTo" class="gl-cta jinni-pill">{{ isGuide ? t('guides.landing.cta_dashboard') : t('guides.landing.cta_start') }}</router-link>
    </section>

    <footer class="gl-foot">
      <div class="gl-foot-line" aria-hidden="true"></div>
      <router-link to="/" class="gl-foot-brand"><img src="/images/lamp.webp" alt="" /><span translate="no">Jinni</span></router-link>
      <nav class="gl-foot-links">
        <router-link to="/guides/terms">{{ t('guides.landing.foot_guide_terms') }}</router-link>
        <router-link to="/guides/privacy">{{ t('guides.landing.foot_guide_privacy') }}</router-link>
        <router-link to="/terms">{{ t('guides.landing.foot_terms') }}</router-link>
        <router-link to="/privacy">{{ t('guides.landing.foot_privacy') }}</router-link>
        <router-link to="/contact">{{ t('guides.landing.foot_contact') }}</router-link>
        <router-link to="/business">{{ t('guides.landing.foot_business') }}</router-link>
      </nav>
      <p class="gl-foot-copy">{{ t('guides.landing.foot_copy', { year }) }}</p>
    </footer>
  </div>
</template>

<script setup>
import '@/assets/styles/jinni-pill.css'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { guideTheme, guideApi, hasToken, initGuideLanguage } from '@/utils/guides'
import GuideLangSwitch from '@/components/guides/GuideLangSwitch.vue'

const { t, locale } = useI18n()
initGuideLanguage(locale)

const theme = guideTheme()
const signedIn = hasToken()
const isGuide = ref(false)
const year = new Date().getFullYear()
// The apply page creates the account itself — no detour through the sign-in page.
const ctaTo = computed(() => (isGuide.value ? '/guide/dashboard' : '/guides/apply'))

onMounted(async () => {
  if (!signedIn) return
  try { const r = await guideApi('/me'); isGuide.value = !!r.guide } catch { /* stays a visitor */ }
})
</script>

<style scoped>
.gl { --serif: var(--brand-serif, 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif);
  min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 0; box-sizing: border-box; overflow-x: hidden; }
.gl.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 50%, #f9f5eb 100%); color: #3c2a1e; }
.gl.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 50%, #0a0118 100%); color: #f5e6c8; }
/* Both themes end on their TOP colour: iOS 26 paints the area past the page
   with one solid colour (the top), so a page ending lighter showed a band at
   the bottom edge (founder 2026-10-03). */

/* Header: lamp + gold wordmark + "Guides" */
.gl-top { max-width: 1080px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 20px 0; gap: 12px; }
.gl-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; min-width: 0; }
.gl-lamp { width: 58px; height: auto; flex: 0 0 auto; margin-block: -8px; margin-inline: -8px -6px; }
.gl-word { font-family: var(--serif); font-size: 28px; font-weight: 600; line-height: 1; letter-spacing: 1px;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gl-sep { width: 1px; height: 22px; background: linear-gradient(180deg, rgba(212, 175, 55, 0), rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0)); }
.gl-sub-brand { font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; }
.gl-link { color: inherit; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; box-sizing: border-box; font-size: 15px; line-height: 1; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); white-space: nowrap; }
.gl-link:hover { background: rgba(212, 175, 55, 0.12); }
.gl-top-right { display: flex; align-items: center; gap: 8px; }

/* Hero */
.gl-hero { max-width: 1080px; margin: 28px auto 0; display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
.gl-badge { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 18px; padding: 7px 14px; border-radius: 999px; font-size: 14px; letter-spacing: 0.02em; backdrop-filter: blur(12px); }
.night-mode .gl-badge { background: rgba(255, 255, 255, 0.06); box-shadow: inset 0 0 0 1px rgba(255, 210, 122, 0.35); color: #ffd27a; }
.day-mode .gl-badge { background: rgba(255, 255, 255, 0.55); box-shadow: inset 0 0 0 1px rgba(122, 74, 28, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8); color: #7A4A1C; }
.gl-dot { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 8px rgba(255, 170, 60, 0.8); }
.gl-badge-free { opacity: 0.75; }
.gl-hero h1 { font-size: clamp(36px, 6.2vw, 60px); line-height: 1.06; margin: 0 0 18px; font-weight: 600; }
.grad { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gl-sub { font-size: 18px; line-height: 1.6; max-width: 560px; margin: 0 0 26px; opacity: 0.92; }
.gl-cta-row { display: flex; align-items: center; gap: 14px 18px; flex-wrap: wrap; }
.gl-note { font-size: 13px; opacity: 0.7; }

/* Example guide page */
.gl-example { position: relative; border-radius: 22px; padding: 22px 20px 18px; backdrop-filter: blur(20px) saturate(160%); max-width: 440px; width: 100%; justify-self: center; box-sizing: border-box; }
.night-mode .gl-example { background: rgba(255, 255, 255, 0.06); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.06); }
.day-mode .gl-example { background: rgba(255, 255, 255, 0.7); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.16); }
.gl-example-tag { position: absolute; top: 14px; right: 16px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.55; }
.gl-ex-head { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.gl-ex-head strong { display: block; font-size: 17px; }
.gl-ex-head small { opacity: 0.7; font-size: 13px; }
.gl-ex-avatar { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #2b1d0e; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 14px -2px rgba(255, 140, 0, 0.5); }
.gl-ex-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.gl-ex-list li { display: grid; gap: 2px; padding: 10px 12px; border-radius: 14px; }
.night-mode .gl-ex-list li { background: rgba(255, 255, 255, 0.04); }
.day-mode .gl-ex-list li { background: rgba(249, 245, 235, 0.9); }
.gl-ex-cat { justify-self: start; font-size: 11px; padding: 1px 9px; border-radius: 999px; background: rgba(212, 175, 55, 0.2); }
.gl-ex-list b { font-size: 15px; font-weight: 600; }
.gl-ex-list em { font-size: 13px; opacity: 0.8; }
.gl-ex-foot { margin-top: 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; opacity: 0.85; }
.gl-ex-badge { font-size: 11px; padding: 3px 9px; border-radius: 999px; }
.night-mode .gl-ex-badge { color: #ffd27a; box-shadow: inset 0 0 0 1px rgba(255, 210, 122, 0.4); }
.day-mode .gl-ex-badge { color: #b4540a; box-shadow: inset 0 0 0 1px rgba(180, 84, 10, 0.35); }

/* Benefits + steps */
.gl-grid { max-width: 1080px; margin: 56px auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.gl-card { border-radius: 18px; padding: 22px; backdrop-filter: blur(20px) saturate(160%); }
.day-mode .gl-card { background: rgba(255, 255, 255, 0.6); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .gl-card { background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.5); }
.gl-ico { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; color: #fff; background: linear-gradient(45deg, #D4AF37, #FF8C00); margin-bottom: 12px; }
.gl-card h3 { margin: 0 0 8px; font-size: 18px; }
.gl-card p { margin: 0; line-height: 1.5; font-size: 15px; opacity: 0.9; }
.gl-steps { max-width: 1080px; margin: 0 auto; }
.gl-steps h2 { font-size: 26px; margin: 0 0 16px; }
.gl-steps ol { list-style: none; padding: 0; margin: 0 0 26px; display: grid; gap: 14px; }
.gl-steps li { display: flex; gap: 14px; align-items: flex-start; font-size: 16px; line-height: 1.5; }
.gl-steps li span { flex: 0 0 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; border: 1px solid rgba(212, 175, 55, 0.6); color: #b4540a; }
.night-mode .gl-steps li span { color: #ffd27a; }

/* Footer */
.gl-foot { max-width: 1080px; margin: 64px auto 0; padding: 0 0 34px; display: grid; justify-items: center; gap: 14px; text-align: center; }
.gl-foot-line { width: 100%; height: 1px; background: linear-gradient(90deg, rgba(212, 175, 55, 0), rgba(212, 175, 55, 0.55), rgba(212, 175, 55, 0)); margin-bottom: 18px; }
.gl-foot-brand { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; font-family: var(--serif); font-size: 20px; font-weight: 600; letter-spacing: 1px; }
.gl-foot-brand img { width: 44px; margin: -6px -4px -6px -6px; }
.gl-foot-brand span { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gl-foot-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 22px; }
.gl-foot-links a { font-family: var(--serif); font-size: 15px; text-decoration: none; padding: 6px 2px; }
.night-mode .gl-foot-links a { color: #FF8C00; }
.day-mode .gl-foot-links a { color: #7A4A1C; }
.gl-foot-links a:hover { text-decoration: underline; text-underline-offset: 4px; }
.gl-foot-copy { margin: 0; font-size: 13px; opacity: 0.65; font-family: var(--serif); }

/* Desktop: hero in two columns, the example on the right */
@media (min-width: 900px) {
  .gl { padding: 0 32px; }
  .gl-hero { grid-template-columns: 1.15fr 0.85fr; gap: 56px; margin-top: 48px; }
  .gl-example { justify-self: end; }
  .gl-steps ol { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}
@media (max-width: 430px) { .gl-sub-brand, .gl-sep { display: none; } }
@media (max-width: 360px) { .gl-word { font-size: 24px; } }
</style>
