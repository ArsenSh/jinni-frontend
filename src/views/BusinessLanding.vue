<template>
  <div class="business-landing" :class="[currentTheme, { 'jinni-night': isNightMode }]">
    <!-- Night = "Jinni Night" (founder 2026-10-03), same as the main landing. -->
    <JinniNightSky v-if="isNightMode" />
    <JinniDaySky v-else />
    <div class="header-container">
      <img class="brand-lamp" src="/images/lamp.webp" alt="" aria-hidden="true">
      <div class="app-name" translate="no">Jinni</div>
    </div>

    <div class="language-selector-container">
      <LandingNav variant="business" :languages="languageOptions" :current-language="selectedLanguage"
                  :primary-label="$t('businessLanding.hero.cta')" @primary="goApply('verified')" @select-language="selectLanguage" />
      <div class="language-selector" :class="{ open: showAllLanguages }" ref="languageSelectorRef" @click.stop>
        <!-- Same control as the main landing (founder 2026-10-01): a line
             globe + the current code, and a menu of language names each in
             its own script. No flag emojis. -->
        <button type="button" class="lang-trigger" @click="toggleLanguageSelector" :title="currentLanguageTitle" :aria-label="currentLanguageTitle" aria-haspopup="true" :aria-expanded="showAllLanguages ? 'true' : 'false'">
          <svg class="lang-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9s1.2-6.5 3.6-9z"/></svg>
          <span class="lang-code">{{ currentLanguageCode }}</span>
        </button>
        <div v-if="showAllLanguages" class="lang-menu" role="menu">
          <button v-for="lang in languageOptions" :key="lang.code" type="button" role="menuitemradio" :aria-checked="selectedLanguage === lang.code ? 'true' : 'false'" :lang="lang.code" class="lang-option" :class="{ active: selectedLanguage === lang.code }" @click="selectLanguage(lang.code)">{{ lang.title }}</button>
        </div>
      </div>
    </div>

    <section class="hero">
      <!-- day only: the sand arrives, builds the lamp, and stops for good -->
      <!-- `&& lampEl`: template refs are only assigned after the first render,
           so without this the component mounts with a null lamp and silently
           does nothing -->
      <DesertSand v-if="isDayMode && lampEl" :lamp-el="lampEl" />
      <div class="hero-content">
        <span class="lamp" ref="lampEl"><img src="/images/lamp.webp" alt="Jinni — the AI travel guide's genie lamp" class="static-bottle"></span>
        <h1 class="magic-title">{{ $t('businessLanding.hero.title') }}</h1>
        <p class="magic-subtitle" v-html="heroSubtitleHtml"></p>
        <MagicButton ref="wishBtn" @click="goApply('verified')"><span class="wish-label">{{ $t('businessLanding.hero.cta') }}</span></MagicButton>
      </div>
    </section>

    <section class="features">
      <div class="features-container">
        <h2 class="features-heading">{{ $t('businessLanding.features.title') }}</h2>
        <div class="features-grid">
          <div v-for="tier in tiers" :key="tier.key" class="wish-item" :class="`tier-${tier.key}`">
            <span class="tier-mark">
              <svg v-if="tier.key === 'verified'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4.2 12.9 9.4 18.1 19.8 6.4"/>
              </svg>
              <svg v-else-if="tier.key === 'spotlight'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4.2"/>
                <path d="M12 2.4v2.6M12 19v2.6M4.2 12H1.6M22.4 12h-2.6M6.5 6.5L4.7 4.7M19.3 19.3l-1.8-1.8M17.5 6.5l1.8-1.8M4.7 19.3l1.8-1.8"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <!-- filled: the top tier is the only solid mark of the three -->
                <path fill="currentColor" d="M12 2.8l2.9 5.9 6.5.95-4.7 4.6 1.11 6.47L12 17.66l-5.81 3.06L7.3 14.25 2.6 9.65l6.5-.95L12 2.8z"/>
              </svg>
            </span>
            <span class="tier-label">{{ $t(`businessLanding.tiers.${tier.key}.label`) }}</span>
            <span class="tier-price">{{ $t(`businessLanding.tiers.${tier.key}.price`) }}<span
              v-if="tier.suffix" class="tier-price-suffix">{{ $t(`businessLanding.tiers.${tier.key}.priceSuffix`) }}</span></span>
            <h3>{{ $t(`businessLanding.tiers.${tier.key}.heading`) }}</h3>
            <p>{{ $t(`businessLanding.tiers.${tier.key}.description`) }}</p>
            <button class="tier-cta" :class="`tier-cta--${tier.key}`" @click="goApply(tier.key)">
              <span class="wish-label">{{ $t(`businessLanding.tiers.${tier.key}.cta`) }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="mode-switch-wrapper">
      <div class="mode-switch-pill">
        <button class="mode-switch-btn" @click="goHome">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          {{ $t('landing.mode_switch.explore') }}
        </button>
        <button class="mode-switch-btn mode-switch-btn--active">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><path d="M2 12h20"/></svg>
          {{ $t('landing.mode_switch.for_business') }}
        </button>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="/business/terms"><span class="lbl-full">{{ $t('terms.title') }}</span><span class="lbl-short">{{ $t('landing.footer.terms') }}</span></a>
          <a href="/business/privacy"><span class="lbl-full">{{ $t('privacy.title') }}</span><span class="lbl-short">{{ $t('landing.footer.privacy') }}</span></a>
        </div>
        <p class="footer-copyright">{{ $t('landing.footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>




<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { isNightTime } from '@/utils/timeUtils'
import MagicButton from '@/components/ui/MagicButton.vue'
import StarrySky from '@/components/ui/StarrySky.vue'
import DesertSky from '@/components/ui/DesertSky.vue'
import DesertSand from '@/components/ui/DesertSand.vue'
import JinniDaySky from '@/components/ui/JinniDaySky.vue'
import JinniNightSky from '@/components/ui/JinniNightSky.vue'
import LandingNav from '@/components/ui/LandingNav.vue'
import { startEmberBreath } from '@/utils/emberBreath'
import { trackVisit } from '@/utils/funnel'
export default {
  name: 'BusinessLanding',
  components: { MagicButton, StarrySky, DesertSky, DesertSand, JinniDaySky, JinniNightSky, LandingNav },
  setup() {
    const router = useRouter()
    const store = useStore()
    const selectedLanguage = ref('en')
    const showAllLanguages = ref(false)
    const autoCloseTimer = ref(null)
    const languageSelectorRef = ref(null)
    const languageOptions = ref([
      { code: 'en', title: 'English' },
      { code: 'fr', title: 'Français' },
      { code: 'ru', title: 'Русский' },
      { code: 'zh', title: '中文' },
      { code: 'ar', title: 'العربية' }
      // hy hidden (utils/languages.js)
    ])
    /* The brand word carries the gradient, the sentence stays solid — the
       landing page's rule. Inserted with v-html, so the span carries no scope
       attribute and the CSS has to reach it with :deep(). */
    const { t: translate } = useI18n()
    const heroSubtitleHtml = computed(() => {
      const raw = String(translate('businessLanding.hero.subtitle') || '')
      const esc = raw.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
      return esc.replace(/Jinni/g, '<span class="brand-grad" translate="no">Jinni</span>')
    })
    const tiers = [
      { key: 'verified', suffix: false },
      { key: 'spotlight', suffix: true },
      { key: 'signature', suffix: true }
    ]
    const currentLanguageCode = computed(() => (selectedLanguage.value || 'en').toUpperCase())
    const currentLanguageTitle = computed(() => languageOptions.value.find(l => l.code === selectedLanguage.value)?.title || 'Select Language')
    const startAutoCloseTimer = () => {
      clearAutoCloseTimer()
      autoCloseTimer.value = setTimeout(() => { showAllLanguages.value = false }, 3000)
    }
    const clearAutoCloseTimer = () => {if (autoCloseTimer.value) { clearTimeout(autoCloseTimer.value); autoCloseTimer.value = null }}
    const selectLanguage = (lang) => {
      clearAutoCloseTimer()
      store.dispatch('i18n/changeLanguage', lang)
      selectedLanguage.value = lang
      showAllLanguages.value = false
    }
    // The trigger stays on screen while the menu is open, so it toggles
    // (same as LandingPage; the watcher below starts the auto-close timer).
    const toggleLanguageSelector = () => { showAllLanguages.value = !showAllLanguages.value }
    const handleClickOutside = () => { showAllLanguages.value = false; clearAutoCloseTimer() }
    watch(showAllLanguages, (newValue) => {
      if (newValue) {
        startAutoCloseTimer()
        setTimeout(() => { document.addEventListener('click', handleClickOutside, { once: true }) }, 0)
      } else { clearAutoCloseTimer() }
    })
    // Theme follows the app STORE (was clock-based, which split page vs chrome
    // whenever the saved preference disagreed with the hour). App.vue paints
    // the browser chrome for this route (/business edge pair) — no local
    // chrome writes needed anymore.
    const isNightMode = computed(() => store.getters['settings/effectiveTheme'] === 'dark')
    const currentTheme = computed(() => isNightMode.value ? 'night-mode' : 'day-mode')
    const isDayMode = computed(() => !isNightMode.value)
    const lampEl = ref(null)
    // Night Make a Wish = Ember Breath (same as the main landing).
    const wishBtn = ref(null)
    let stopEmber = () => {}
    watch([isNightMode, wishBtn], ([night, btn]) => {
      stopEmber()
      const el = btn && (btn.$el || btn)
      stopEmber = el ? startEmberBreath(el) : () => {}   // both themes now (day = copper light)
    }, { immediate: true })
    onMounted(() => {
      trackVisit('business')   // admin Overview · Most Used Pages
      if (store.state.i18n?.locale) selectedLanguage.value = store.state.i18n.locale
      showAllLanguages.value = false
    })
    onBeforeUnmount(() => { clearAutoCloseTimer(); stopEmber() })
    function goHome()  { router.push('/') }
    function goApply(tier = 'verified') { router.push({ path: '/business/apply', query: { tier } }) }
    return {
      currentTheme, isNightMode, isDayMode, lampEl, wishBtn,
      selectedLanguage, showAllLanguages, languageOptions,
      currentLanguageCode, currentLanguageTitle,
      selectLanguage, toggleLanguageSelector, languageSelectorRef,
      heroSubtitleHtml, tiers,
      goHome, goApply
    }
  }
}
</script>




<style scoped>
/* Cinzel is a Latin-only face. Every heading here asked for 'Cinzel', serif,
   so in Armenian, Russian, Arabic and Chinese the script fell through to the
   generic serif — whatever the OS happened to pick, different on every device,
   sitting in the same line as a Cinzel "Jinni". Two typefaces per sentence,
   one of them unchosen.

   The stack now names what each script should land on, and it is the Elegant
   pairing from Settings (founder's own preference): Palatino for Latin it
   cannot give to Cinzel, Noto Serif Armenian — already loaded in index.html —
   for Armenian, and Georgia/Palatino for Cyrillic, both of which carry it.
   Serif throughout, so a mixed line reads as one decision.

   The brand word is unaffected in every case: "Jinni" is Latin, so it always
   lands on Cinzel, in all six languages. */
.business-landing {
  --brand-serif: 'Cinzel', 'Noto Serif Armenian', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
  /* The main landing's size system (LandingPage.vue, founder 2026-09-30),
     mirrored so the two first screens are the same page (founder 2026-10-01:
     "make the business landing page same like"). Pixels, not rem — the in-app
     text-size setting must not resize the hero. --gutter is the same on both
     sides and for header and hero; the header row is one band
     (--hdr-top / --hdr-h) whose wordmark and language pill share a centre. */
  --gutter: 16px; --hdr-top: 16px; --hdr-h: 48px;
  --title-fs: clamp(30px, calc(3.3vw + 18px), 56px);
  --sub-fs: clamp(18px, calc(0.5vw + 16px), 22px);
  --cta-fs: clamp(17px, calc(0.3vw + 16px), 20px);
  --cta-h: 52px;
  --gap-lamp: 16px; --gap-sub: 16px; --gap-cta: 32px;
}
@media (min-width: 769px) {
  .business-landing { --gutter: 24px; --hdr-top: 24px; --hdr-h: 56px; --cta-h: 56px; --gap-lamp: 24px }
}
@media (min-width: 1200px) {
  .business-landing { --gutter: 32px; --hdr-top: 28px }
}

/* This page speaks the landing page's language (founder 2026-09-10: "make it
   same like the landing page", both modes). Day = glacier glass on cream;
   night = halation, where nothing is a box and everything is lit. The tiers
   keep the landing's manifest layout: hairline-divided columns carried by
   type, with the PRICE as the display numeral — on a pricing page the number
   is real information, so it earns the position 01/02/03 holds on the
   landing. */

/* ── Base ──────────────────────────────────────────────────────────────────── */
.business-landing { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column; flex: 1 }
.hero, .features { position: relative; z-index: 2 }
/* The wordmark and the language row are set from the same top and given the
   same height, then each centres its own contents — so what lines up is their
   CENTRES, not their top edges. Matching top edges is what made them look off:
   a 2rem serif line box and a 40px flag button are different heights, so equal
   tops put the wordmark's centre about 7px below the flag's. */
.header-container { position: absolute; top: var(--hdr-top); left: var(--gutter); padding: 0; height: var(--hdr-h); display: flex; align-items: center; z-index: 1000 }
/* The two pinned corners are the only things on these pages that a logical
   property cannot flip for us: they are positioned, not laid out. In Arabic
   the wordmark takes the right corner and the language row the left, the way
   every other element already mirrors. */
[dir="rtl"] .header-container { left: auto; right: var(--gutter) }
[dir="rtl"] .language-selector-container { right: auto; left: var(--gutter) }

.app-name { font-family: var(--brand-serif); font-size: clamp(27px, calc(1.2vw + 23px), 36px); line-height: 1; font-weight: 600; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 1px }
.language-selector-container { position: fixed; top: var(--hdr-top); right: var(--gutter); height: var(--hdr-h); display: flex; align-items: center; z-index: 1001 }
/* Language control = the main landing's (founder 2026-10-01: "not beautiful
   with emoji"). A quiet secondary control: a line globe + the current code in
   a small pill of CLEAR glass — no orange, so the hero CTA stays the only
   coloured thing on the first screen. The menu is the same clear glass, sized
   to its longest name, each language in its own script; the current one is
   bold. Hover = a light pane, nothing moves. */
.business-landing.day-mode {
  --lang-ink: #7A4A1C;
  --lang-glass: rgba(255,255,255,0.22); --lang-glass-hover: rgba(255,255,255,0.36);
  --lang-rim: inset 0 0 0 0.75px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55), 0 0 18px -2px rgba(140,61,7,0.12);
  --lang-panel: rgba(255,255,255,0.24);
  --lang-panel-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55), 0 0 18px -2px rgba(140,61,7,0.14);
  --lang-hover: rgba(140,61,7,0.08);
}
.business-landing.night-mode {
  --lang-ink: #f5e6c8;
  --lang-glass: rgba(255,255,255,0.06); --lang-glass-hover: rgba(255,255,255,0.12);
  --lang-rim: inset 0 0 0 0.75px rgba(255,240,215,0.28), inset 0 1px 0 rgba(255,240,215,0.2), 0 0 18px -2px rgba(0,0,0,0.3);
  --lang-panel: rgba(255,255,255,0.07);
  --lang-panel-shadow: inset 0 0 0 0.75px rgba(255,240,215,0.28), inset 0 1px 0 rgba(255,240,215,0.2), 0 0 18px -2px rgba(0,0,0,0.3);
  --lang-hover: rgba(255,240,215,0.1);
}
.language-selector { position: relative; display: flex; align-items: center }
.lang-trigger {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  height: 44px; min-width: 44px; padding: 0 15px 0 13px; margin: 0; border: none; border-radius: 999px; cursor: pointer;
  font-family: inherit; font-size: 14px; font-weight: 600; line-height: 1; letter-spacing: 0.08em;
  color: var(--lang-ink); background: var(--lang-glass); box-shadow: var(--lang-rim);
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
  transition: background-color 0.2s ease;
}
.lang-trigger:hover, .lang-trigger:focus-visible, .language-selector.open .lang-trigger { background: var(--lang-glass-hover); outline: none }
.lang-globe { width: 18px; height: 18px; flex: none; display: block }
.lang-code { display: block; padding-top: 1px }
/* Phones: a smaller pill — 38px tall, 13px code, 16px globe. The tap area
   stays 44px through an invisible ::before. */
@media (max-width: 768px) {
  .lang-trigger { height: 38px; min-width: 38px; padding: 0 12px 0 10px; gap: 6px; font-size: 13px; position: relative }
  .lang-trigger::before { content: ''; position: absolute; inset: -3px -2px }
  .lang-globe { width: 16px; height: 16px }
}
.lang-menu {
  position: absolute; top: calc(100% + 8px); inset-inline-end: 0; width: max-content; min-width: 0;
  display: flex; flex-direction: column; gap: 2px; padding: 6px; border-radius: 20px;
  background: var(--lang-panel); box-shadow: var(--lang-panel-shadow);
  /* saturate 110%: at 180% the violet sky glow came through as a purple panel */
  backdrop-filter: blur(24px) saturate(110%); -webkit-backdrop-filter: blur(24px) saturate(110%);
  animation: fadeIn 0.18s ease-out;
}
.lang-option {
  display: flex; align-items: center; width: 100%; min-height: 44px; padding: 0 16px 0 14px; margin: 0;
  border: none; border-radius: 14px; background: transparent; cursor: pointer;
  font-family: inherit; font-size: 16px; font-weight: 400; line-height: 1.2; text-align: start; white-space: nowrap;
  color: var(--lang-ink); transition: background-color 0.15s ease;
}
.lang-option:hover, .lang-option:focus-visible, .lang-option:active { background: var(--lang-hover); outline: none }
.lang-option.active { font-weight: 700 }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

/* ── Hero ──────────────────────────────────────────────────────────────────── */
/* The inset lives HERE, not on .hero-content: that box has a max-width,
   and padding on a content-box max-width ADDS to it — 800 + 44 — so the
   hero grew wider than the viewport and the page scrolled sideways into
   a white strip. .hero is full width with nothing to overflow. */
.hero { padding-inline: var(--gutter); min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2 }
.hero-content { max-width: 800px; animation: fadeInUp 1s ease-out; display: flex; flex-direction: column; align-items: center }
/* Laptop and up: room for the headline on one line where it fits (as on the
   main landing); longer sentences wrap, balanced. */
@media (min-width: 1024px) { .hero-content { max-width: min(1100px, 100%) } }
/* bottle.png carries ~24% transparent space under the lamp (ink ends at row
   948 of 1254), so at 150px the lamp sat ~36px further from the heading than
   --gap-lamp says. The negative margin cancels that band (main landing,
   2026-09-30). */
.lamp { position: relative; display: block; width: 150px; margin: auto auto -36px }
.static-bottle { width: 100%; height: auto; max-height: 250px; display: block }
/* Colour ON the metal, not only behind it: the lamp's own silhouette masks a
   gradient that is blended INTO the image, so the body carries a lit edge and
   a deep base instead of reading as one flat orange. Night takes the sky's
   violet in its shadow; day takes the ground's terracotta. */
.lamp::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  -webkit-mask-image: url('/images/lamp.webp'); mask-image: url('/images/lamp.webp');
  -webkit-mask-size: contain; mask-size: contain;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: center; mask-position: center;
  mix-blend-mode: soft-light;
}
/* Day takes NO colour on the metal (founder 2026-09-11): the tint read as a
   warm gold wash over the whole lamp, and the lamp should be its own PNG. Not
   a transparent background but `display: none` — an element with a blend mode
   forms a blending group even when it paints nothing, and that group is what
   clipped the bottle's glow into a rectangle. Removing it in day also removes
   the clip, so the glow below could afford to go wider again if wanted.
   Night keeps its tint: there the violet is the sky landing on the metal. */
.day-mode .lamp::after { display: none }
.night-mode .lamp::after {
  background: linear-gradient(148deg,
    rgba(255,244,214,0.85) 0%, rgba(255,178,96,0.28) 38%,
    rgba(120,70,170,0.42) 72%, rgba(48,22,86,0.62) 100%);
}
/* The sentence used to break with one word stranded on the second line: an
   800px box at a fixed 4rem. It now scales with the window and balances, so
   longer translations split evenly instead of orphaning a word. */
/* Pixels, not rem — see LandingPage: the text-size setting must not resize the hero. */
.magic-title { font-family: var(--brand-serif); font-size: var(--title-fs); line-height: 1.15; max-width: 100%; text-wrap: pretty; text-wrap: balance; letter-spacing: 1px; margin: var(--gap-lamp) 0 0; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
/* No text-shadow (main landing 2026-10-01: its glow rendered unreliably). */
.magic-subtitle { font-family: var(--brand-serif); font-size: var(--sub-fs); line-height: 1.45; max-width: 700px; margin: var(--gap-sub) auto 0; text-wrap: pretty; text-wrap: balance; text-shadow: none }
/* v-html content carries NO scope attribute — a plain scoped descendant rule
   would never match this span. */
/* The brand word was the only gradient-clipped run in the line, and clipped
   type renders thinner than the solid text around it — so Jinni read as the
   skinniest word in its own sentence. Heavier weight and a shadow of its own
   put it back on equal footing. */
.magic-subtitle :deep(.brand-grad) { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; font-weight: 700 }


/* ── The tiers, as a manifest ──────────────────────────────────────────────── */
.features { padding: 2rem 1rem 4rem 1rem; position: relative; z-index: 2 }
.features-container { max-width: 1200px; margin: 0 auto }
.features-heading { font-family: var(--brand-serif); text-align: center; margin-bottom: 3rem; font-size: 2.5rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); position: relative }
.wish-item { padding: 6px 30px; display: flex; flex-direction: column; align-items: flex-start }
/* The tier icons come back as line marks, not filled discs: a stroke drawn
   in the same ink as the type, so it belongs to the manifest instead of
   sitting on it. */
.tier-mark { display: block; margin-bottom: 10px; line-height: 0 }
.tier-mark svg { width: 24px; height: 24px }
.tier-label { font-family: var(--brand-serif); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px }
.tier-price { font-family: var(--brand-serif); font-size: 2.6rem; font-weight: 700; line-height: 1; margin-bottom: 12px; font-variant-numeric: tabular-nums }
.tier-price-suffix { font-size: 1rem; font-weight: 400; letter-spacing: 0.02em }
/* Measured at one font size across all six: French card titles want 39%
   more width than English and Armenian 31%, so those two wrap to a second
   line in a column English fills with one. Nothing is scaled up — the
   words are longer. balance splits the two lines evenly instead of
   leaving one word stranded underneath. */
.wish-item h3 { font-family: var(--brand-serif); font-size: 1.4rem; margin-bottom: 10px; text-wrap: balance }
.wish-item p { font-size: 1.02rem; line-height: 1.55; text-wrap: pretty; margin-bottom: 1.4rem }
.tier-cta { margin-top: auto; font-family: var(--brand-serif); font-size: 0.9rem; font-weight: 600; letter-spacing: 0.02em; cursor: pointer; border: none; background: transparent; padding: 12px 26px; border-radius: 50px; transition: background 0.3s ease, box-shadow 0.3s ease, color 0.3s ease }

/* ── Mode switch ───────────────────────────────────────────────────────────── */
.mode-switch-wrapper { display: flex; justify-content: center; padding: 0 0 4rem; position: relative; z-index: 2 }
.mode-switch-pill { display: inline-flex; align-items: center; gap: 2px; background: rgba(26,9,51,0.8); border-radius: 50px; padding: 4px; backdrop-filter: blur(10px); box-shadow: 0 0 12px rgba(212,175,55,0.1), 0 0 24px rgba(0,0,0,0.35) }
.mode-switch-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 20px; border-radius: 40px; border: none; background: transparent; font-family: var(--brand-serif); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; color: rgba(212,175,55,0.45); transition: all 0.25s ease; white-space: nowrap }
.mode-switch-btn:hover { color: #D4AF37; background: rgba(212,175,55,0.12); box-shadow: 0 0 10px rgba(212,175,55,0.12) }
.mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); color: #D4AF37; box-shadow: 0 0 14px rgba(212,175,55,0.25); cursor: default }
.mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); box-shadow: 0 0 14px rgba(212,175,55,0.25) }

/* ── Footer ────────────────────────────────────────────────────────────────── */
.footer { margin-top: auto; padding: 0.3rem 0.3rem; position: relative; z-index: 2; width: 100% }
.footer-content { max-width: 1200px; margin: 0 auto; text-align: center }
.footer-links { display: flex; justify-content: center; gap: 2rem }
.footer-links a { color: #FF8C00; text-decoration: none; font-family: var(--brand-serif); font-size: 1.1rem; transition: all 0.3s ease; padding: 0.5rem }
.footer-copyright { color: rgba(224,224,224,0.7); font-family: var(--brand-serif); font-size: 0.9rem }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(50px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.1) } 100% { transform: scale(1) } }

/* ── Day mode: glacier glass on cream ──────────────────────────────────────── */
/* The full gradient sat at ~2:1 contrast on cream, so the sentence takes dark
   ink and only the brand word keeps the gradient. */
/* Same change as the landing page (founder 2026-09-11): the cocoa brown goes,
   the lamp's burnt end carries the headings. */
/* Founder 2026-09-11: closer to the Jinni gold. It moves from #732F06 to
   #8C3D07 — warmer, more orange, the same family as the brand gradient's
   burnt end rather than a dark red-brown sitting near it. It deliberately
   stops SHORT of that end (#B4540A): the plain words have to stay a step
   below the brand word, or "Jinni" loses the contrast that makes it read as
   the lit one. At #8C3D07 the heading still measures 4.5:1 on the sand, so
   it gains warmth without spending legibility. */
.day-mode .magic-title, .day-mode .features-heading { background: none; -webkit-text-fill-color: initial; color: #8C3D07 }
.day-mode .magic-subtitle { color: #5a3c2e; text-shadow: 0 0 7px rgba(255,255,255,0.4) }
.day-mode .footer-copyright { color: #5a3c2e }
/* Day now carries the SAME grammar as night (founder 2026-09-11): no glacier
   capsule anywhere — every call to action is a word over a lit hairline. Only
   the palette differs, because the two grounds differ: night lights the rule
   in lamp-gold on indigo, day draws it in the lamp's burnt end so it holds
   against a peach sky. */
.day-mode .tier-cta {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; position: relative;
  letter-spacing: 0.01em; font-size: 0.98rem; padding: 10px 4px 18px;
}
/* The rest state sits BELOW full strength or the hover has nowhere to go
   (founder 2026-09-11). Night can answer by moving toward white, which is a
   long way on a dark ground; day can only move down into the colour, and that
   trip is short — so it starts at half strength and arrives at full. */
.day-mode .tier-cta::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 10px; height: 1.5px;
  background: rgba(122, 74, 28, 0.5); box-shadow: 0 0 10px rgba(214, 120, 40, 0.22);
  transition: background 0.3s ease, box-shadow 0.3s ease, height 0.3s ease;
}
/* The tier rules sit a step quieter than the hero's, the same way night's do,
   so three of them in a row don't compete with the one wish above. */
.day-mode .tier-cta::after { bottom: 6px; height: 1px; background: rgba(122, 74, 28, 0.55); box-shadow: 0 0 9px rgba(214, 120, 40, 0.3) }
.day-mode .tier-cta:hover { background: transparent; box-shadow: none }
.day-mode .tier-cta:hover::after { background: #7A4A1C; box-shadow: 0 0 14px rgba(214, 120, 40, 0.5) }
/* the label leaves the gradient clip: a clip carries no glow, and on a light
   ground the bright half of the brand gradient falls under 2:1. Bronze
   #7A4A1C = the day text family (main landing 2026-10-01). */
.day-mode .wish-label {
  background: none; -webkit-text-fill-color: initial; color: #7A4A1C; font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 224, 176, 0.7);
}
.day-mode .tier-cta .wish-label { font-weight: 600 }
/* Each tier still answers the pointer in its own colour (founder 2026-09-10)
   and the buttons still hold still — but as a solid colour now, because the
   label left the gradient clip and a clip shows nothing through an opaque
   -webkit-text-fill-color. */
/* Founder 2026-09-11: the green and the blue read far darker than the gold.
   They were, measurably — the signature sits at 0.18 relative luminance and
   those two at 0.16 and 0.14. All three now match the gold, so the row reads
   as one family answering the pointer rather than one lit and two muddy.
   The rule beneath takes the tier's colour too, so the whole control answers
   rather than just its word. */
.day-mode .tier-cta--verified:hover .wish-label { color: #35853C }
.day-mode .tier-cta--spotlight:hover .wish-label { color: #2A7DA8 }
.day-mode .tier-cta--signature:hover .wish-label { color: #A8660F }
.day-mode .tier-cta--verified:hover::after { background: #35853C; box-shadow: 0 0 12px rgba(53,133,60,0.45) }
.day-mode .tier-cta--spotlight:hover::after { background: #2A7DA8; box-shadow: 0 0 12px rgba(42,125,168,0.45) }
.day-mode .tier-cta--signature:hover::after { background: #A8660F; box-shadow: 0 0 12px rgba(168,102,15,0.45) }
.day-mode .wish-item { border-inline-start: 1px solid rgba(150,100,55,0.28) }
.day-mode .wish-item:first-child { border-inline-start: none; padding-inline-start: 0 }
.day-mode .wish-item:last-child { padding-inline-end: 0 }
/* Day text = ONE bronze family (main landing, founder 2026-10-01): headings,
   labels and links #7A4A1C, body #7a5434. The tier mark and price keep their
   gold — they play the part the landing's numerals do. */
.day-mode .tier-mark { color: rgba(168,114,15,0.75) }
.day-mode .tier-label { color: rgba(122,74,28,0.78) }
.day-mode .tier-price { color: rgba(168,114,15,0.9) }
.day-mode .tier-price-suffix { color: rgba(122,84,52,0.7) }
.day-mode .wish-item h3 { color: #7A4A1C }
.day-mode .wish-item p { color: #7a5434 }
.day-mode .footer-links a { color: #7A4A1C }
.day-mode .footer-links a:hover { color: #5c3416; text-shadow: 0 0 10px rgba(255,255,255,0.35) }
/* The 44px glow drew a RECTANGLE around the lamp (founder 2026-09-11). Not a
   filter bug: .lamp::after blends with mix-blend-mode, which forces this whole
   subtree into its own blending group, and that group is the 150x150 .lamp box
   — so a glow wider than the box is clipped to it and the clip is a straight
   edge. Measured: with these radii the falloff completes inside the box and
   the edge reads 0,0,0 against the sky on all three sides. The 0 3px offset
   went too: shadows here are even on all sides, never dropped down. */
.day-mode .static-bottle {
  /* Founder 2026-09-11: shorter. Both radii are 8px now, which is denser
     rather than layered — a chained drop-shadow filters the OUTPUT of the one
     before it, so the second casts a shadow of the first instead of sitting
     at its own distance. The old 18px was sized to a constraint that is gone:
     it had to fade out inside the 150px blend group .lamp::after used to
     create. Day has no such group any more, so radius is free. */
  /* Tone matched to the "Jinni" text (main landing 2026-10-01): same hue, so
     only saturation and brightness move. The glow lives on .lamp. */
  filter: saturate(0.88) brightness(0.92);
}
.day-mode .button-glow-wrapper { filter: none }
/* The switch takes the wish button's glacier glass (founder 2026-09-10), so
   day mode has one material instead of a frosted button beside a muddy pill.
   The chosen side is a brighter pane of the same glass — no saturated fill. */
/* One glass track holding two plain words; the chosen side is a flat white
   pill with darker ink (founder 2026-09-10 — glass inside glass was the
   problem, not the track itself). */
/* The switch follows the CTAs (founder 2026-09-11): no capsule, no filled
   tab. Two words, each over a rule, and the one you are on is LIT — state
   carried by light, exactly as night carries it. */
.day-mode .mode-switch-pill {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; padding: 0; gap: 26px;
}
.day-mode .mode-switch-btn {
  color: rgba(122,77,16,0.55); background: transparent; box-shadow: none;
  padding: 8px 2px 14px; border-radius: 0; position: relative;
}
.day-mode .mode-switch-btn::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 6px; height: 1px;
  background: rgba(115,47,6,0.18); box-shadow: none;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.day-mode .mode-switch-btn:hover { color: #7a4d10; background: transparent; box-shadow: none }
.day-mode .mode-switch-btn:hover::after { background: rgba(115,47,6,0.45) }
.day-mode .mode-switch-btn--active,
.day-mode .mode-switch-btn--active:hover {
  background: transparent; box-shadow: none; color: #732F06;
  text-shadow: 0 0 10px rgba(255,224,176,0.7);
}
.day-mode .mode-switch-btn--active::after {
  background: rgba(115,47,6,0.85); box-shadow: 0 0 12px rgba(214,120,40,0.5);
}

/* ── Night mode: halation ──────────────────────────────────────────────────── */
/* Night stops imitating daylight and behaves like a long exposure: type blooms
   in three layers — tight warm core, mid halo, wide spill — and every capsule
   is gone. On a sky a filled shape reads as a hole punched in the stars;
   light does not. */
/* The organising light comes from the object the brand is about: a warm pool
   spilling from the lamp, and one page-level vignette so the far corners fall
   away and the stars stop competing with the words. A per-section vignette
   reaches the section boundary still opaque and draws a visible line. */
.night-mode .hero::before, .night-mode .features::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
}
.night-mode .hero::before {
  background: radial-gradient(46% 38% at 50% 38%, rgba(255,196,110,0.16) 0%, rgba(255,190,105,0.07) 38%, rgba(255,190,105,0) 70%);
}
.night-mode .features::before {
  background: radial-gradient(58% 46% at 50% 32%, rgba(255,196,110,0.08) 0%, rgba(255,190,105,0) 70%);
}
/* Same change as the landing page: the rim reached half-opaque near-black,
   which erased the stars along the bottom of a phone, and a fixed inset:0
   element re-scales every time Safari's toolbar moves — so the dead band grew
   and shrank as you scrolled. Core to 58%, rim to 0.30. */
.night-mode::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(128% 96% at 50% 46%, rgba(6,2,20,0) 58%, rgba(6,2,20,0.30) 100%);
}
.night-mode .hero-content, .night-mode .features-container { position: relative; z-index: 1 }
/* A gradient-clipped element can't use text-shadow — the fill is transparent —
   so the wordmark's halo comes from drop-shadow on the rendered pixels. */
/* The wordmark, the hero's brand word and the lamp all bloom the same way —
   one light source, three sizes. Gradient-clipped text can't use text-shadow
   (the fill is transparent), so the halo is a drop-shadow on the pixels. */
.night-mode .app-name {
  filter: drop-shadow(0 0 3px rgba(255,214,150,0.55))
          drop-shadow(0 0 11px rgba(255,170,90,0.4))
          drop-shadow(0 0 26px rgba(255,140,60,0.24));
}
/* Day mode, gradient words (founder 2026-09-10: "the brand name with this
   shadow is not good"). A blurred dark shadow works under DARK letters — it
   hides behind them. Under a LIGHT gold word on a light peach ground it has
   nowhere to hide: the halo spreads out past every stroke and the word reads
   as out of focus. So the gradient words take their weight from COLOUR
   instead — a deeper, more burnt gradient that holds its own against the
   sand — with a 1px ink shadow to seat them, and no blur at all. */
.day-mode .app-name,
.day-mode .magic-title :deep(.brand-grad),
.day-mode .features-heading :deep(.brand-grad) {
  /* Founder 2026-09-11: the icon's own gradient, the same one night uses —
     #D4AF37 to #FF8C00 — so the word is the brand rather than a darkened
     version of it. On a light ground that gradient alone measures about
     1.6:1 against the sand, so the separation is made with light rather than
     with colour — see the filter below. */
  /* Three stops, not two (founder 2026-09-11: "Infinite became yellow, is not
     visible"). A two-stop gold->orange ramp spends most of a short word in
     its pale half, and #D4AF37 measures 1.6:1 on the sand — fine for a 4rem
     headline carried by the halo below, invisible for one word inside a
     smaller heading. The ramp now passes through the icon's orange quickly
     and lands on the lamp's burnt base, so every word has dark mass in it
     while the opening stop keeps the brand's gold. */
  background: linear-gradient(45deg, #D4AF37 0%, #E8860C 38%, #B4540A 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  /* The gold is lifted off the sand by PALE light behind it, not by an edge
     around it — a stroke drew a border on every glyph. This is night's
     halation with the colour inverted: night blooms warm light into the dark,
     day blooms near-white into the peach, so the letters sit in a patch of
     lit paper. A gradient clip paints over a transparent fill, so it has to
     be drop-shadow on the rendered pixels; text-shadow would show nothing.
     The last one is a 1px warm seat so the word still touches the page. */
  /* Founder 2026-09-17: the near-white bloom read as a white smear on the
     peach sky. Lit PEACH now — the sky's own upper tones (#f2e3d3 / #ebc4a6)
     pushed a step brighter — so the glow reads as sun on the paper, not
     paint. Same two radii, same warm seat below. */
  /* Founder 2026-09-17, second pass: no bloom at all by day — the lit halo
     read wrong in every tone tried. Only the 1px warm seat remains, so the
     gradient word sits crisply on the paper and still touches it. */
  /* Third pass (founder 2026-09-17): an ORANGE bloom — the text's own end
     colour, so it belongs to both the gold-orange word and the peach sky.
     Kept light so it reads as warmth around the letters, not a smear. */
  filter: drop-shadow(0 0 6px rgba(255,140,0,0.32))
          drop-shadow(0 0 14px rgba(232,134,12,0.2))
          drop-shadow(0 1px 1px rgba(110,45,6,0.22));
}
/* The subtitle keeps the icon gradient but not the halo. That bloom is sized
   for 2.5-4rem display type; under a 1.5rem word it has nowhere to fall off
   and reads as a smudge around the letters rather than as light behind them.
   A 1px warm seat instead, and a deeper opening stop so the word holds its
   own at this size. */
.day-mode .magic-subtitle :deep(.brand-grad) {
  background: linear-gradient(45deg, #C89114 0%, #D2760C 38%, #9E4708 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  filter: drop-shadow(0 1px 1px rgba(110,45,6,0.3));
  font-weight: 700;
}
/* Founder 2026-09-11: the Jinni in "Let Jinni find them" is the brand, so it
   wears the brand — icon gradient and Cinzel, like every other Jinni on the
   site. It was solid for a while because pure gold at this size measured under
   2:1 on the sand; what changed is the pale halo the headings gained, which
   lifts the word off the ground by light instead of by darkening it. The face
   was never the problem: --brand-serif already puts Latin on Cinzel here. */
/* The dark half of a heading keeps a real shadow — it has letters to hide
   behind — but a tighter one, so the type stays sharp. */
.day-mode .magic-title { text-shadow: 0 1px 3px rgba(150,62,12,0.18) }
.day-mode .features-heading { text-shadow: 0 1px 3px rgba(150,62,12,0.16) }
/* The lamp PNG is a saturated orange next to parchment type, so on its own it
   reads as a sticker dropped on the page. Pulled toward the type's gold and
   given the same bloom, it becomes the source of the light. */
/* Tone only on the image; the bloom moved to .lamp (see the end of this
   block) — inside the ::after blend group Chrome clipped it to the 150px box. */
.night-mode .static-bottle {
  filter: saturate(0.76) brightness(1.06) contrast(0.96);
}
.night-mode .magic-title, .night-mode .features-heading { background: none; -webkit-text-fill-color: initial }
/* Founder 2026-09-10: at hero size the three-layer bloom is too much — the
   same glow that flatters a small line becomes glare on the biggest sentence
   on the page. A tight core halo only, and the wide spill goes. */
.night-mode .magic-title { color: #fff6e2;
  text-shadow: 0 0 3px rgba(255,214,150,0.3), 0 0 14px rgba(255,170,90,0.2) }
.night-mode .features-heading { color: #fbf0d8;
  text-shadow: 0 0 4px rgba(255,214,150,0.4), 0 0 16px rgba(255,170,90,0.3), 0 0 40px rgba(255,140,60,0.2) }
.night-mode .magic-subtitle { color: #ead9b8; text-shadow: 0 0 14px rgba(212,175,55,0.18) }
.night-mode .magic-subtitle :deep(.brand-grad) {
  background: none; -webkit-text-fill-color: initial; color: #ffd9a0; font-weight: 700;
  text-shadow: 0 0 4px rgba(255,235,200,0.55), 0 0 13px rgba(255,180,90,0.5);
}
/* CTAs drop the capsule for a word over a lit hairline — the same grammar as
   the landing's Make a Wish and its Explore switch. */
.night-mode .tier-cta {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; position: relative;
  letter-spacing: 0.01em; font-size: 0.98rem; padding: 10px 4px 18px;
}
.night-mode .tier-cta::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 6px; height: 1px;
  background: rgba(255,214,150,0.55); box-shadow: 0 0 9px rgba(255,180,90,0.5);
  transition: background 0.3s ease, box-shadow 0.3s ease, height 0.3s ease;
}
.night-mode .tier-cta:hover { background: transparent; box-shadow: none }
/* Nothing moves; only the light changes. */
.night-mode .tier-cta:hover::after { background: #ffffff; box-shadow: 0 0 18px rgba(255,205,130,0.95), 0 0 34px rgba(255,160,60,0.4) }
.night-mode .tier-cta:hover .wish-label { color: #fff6e6; text-shadow: 0 0 16px rgba(255,190,110,0.85) }
/* the label leaves the gradient clip: halation needs a solid colour to bloom */
.night-mode .wish-label {
  background: none; -webkit-text-fill-color: initial; color: #ffe8c4; font-weight: 700;
  text-shadow: 0 0 12px rgba(255,180,90,0.5);
}
.night-mode .tier-cta .wish-label { font-weight: 600 }
/* Two temperatures, the sky's own contrast: warm gold where the lamp light
   falls (headings, prices, the brand), cool parchment for structure. */
.night-mode .wish-item { border-inline-start: 1px solid rgba(240,218,170,0.2) }
.night-mode .wish-item:first-child { border-inline-start: none; padding-inline-start: 0 }
.night-mode .wish-item:last-child { padding-inline-end: 0 }
.night-mode .tier-mark { color: #f0d9a8; filter: drop-shadow(0 0 7px rgba(255,180,90,0.45)) }
.night-mode .tier-label { color: rgba(240,218,170,0.55) }
.night-mode .tier-price {
  background: linear-gradient(180deg, rgba(255,231,181,0.82), rgba(226,175,88,0.38));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.night-mode .tier-price-suffix { color: rgba(240,218,170,0.5); -webkit-text-fill-color: initial }
.night-mode .wish-item h3 { color: #f0dcae }
.night-mode .wish-item p { color: #e4d7bd }
/* Explore / For Business: the pill and both fills are gone. Two words share a
   hairline baseline and only the chosen one is LIT, so the state is carried by
   light instead of by a filled shape. */
.night-mode .mode-switch-pill {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; padding: 0; gap: 26px;
}
.night-mode .mode-switch-btn {
  color: rgba(232,218,190,0.5); background: transparent; box-shadow: none;
  padding: 8px 2px 14px; border-radius: 0; position: relative;
}
.night-mode .mode-switch-btn::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 6px; height: 1px;
  background: rgba(232,218,190,0.16); box-shadow: none;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.night-mode .mode-switch-btn:hover { color: #f7e6c2; background: transparent; box-shadow: none }
.night-mode .mode-switch-btn:hover::after { background: rgba(255,214,150,0.45) }
.night-mode .mode-switch-btn--active, .night-mode .mode-switch-btn--active:hover {
  background: transparent; box-shadow: none; color: #ffe8c4;
  text-shadow: 0 0 12px rgba(255,180,90,0.5);
}
.night-mode .mode-switch-btn--active::after {
  background: rgba(255,214,150,0.85); box-shadow: 0 0 12px rgba(255,180,90,0.9);
}
/* Lavender at rest, warming to gold on hover — the link behaves like a star
   catching the lamp. The flat #FF8C00 was the loudest thing on the page. */
.night-mode .footer-links a { color: #dcb977 }
.night-mode .footer-links a:hover { color: #f7dc9c; text-shadow: 0 0 12px rgba(212,175,55,0.4) }
.night-mode .footer-copyright { color: rgba(234,217,184,0.55) }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  /* One column: the vertical hairline becomes a horizontal one between items. */
  .features-grid { grid-template-columns: 1fr }
  .wish-item { padding: 20px 0 }
  .day-mode .wish-item, .night-mode .wish-item { border-inline-start: none; border-top: 1px solid rgba(150,100,55,0.26) }
  .night-mode .wish-item { border-top-color: rgba(212,175,55,0.2) }
  .day-mode .wish-item:first-child, .night-mode .wish-item:first-child { border-top: none; padding-top: 0 }
  .tier-price { font-size: 2.1rem; margin-bottom: 8px }
  .tier-mark svg { width: 21px; height: 21px }
  .features-heading { font-size: 2rem }
  .footer-links { gap: 0.1rem }
  .footer-links a { font-size: 1rem }
}

/* Phone landscape: a 390px-tall screen cannot hold a 150px lamp plus the
   copy under the header band, so the lamp shrinks and the hero clears it. */
@media (max-height: 500px) and (orientation: landscape) {
  .hero { padding-block: calc(var(--hdr-top) + var(--hdr-h) + 8px) 24px }
  .lamp { width: 84px; margin-bottom: -20px }
  .business-landing { --title-fs: clamp(26px, 3.4vw, 34px); --gap-lamp: 8px; --gap-sub: 8px; --gap-cta: 16px; --cta-h: 48px }
}

/* Below-sky continuation — DesertSky's ending peach (Discovery-style fix) */
.business-landing.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}

/* ══ MIRROR OF THE MAIN LANDING (founder 2026-10-01: "make the business
   landing page same like"). LandingPage.vue is the source of truth for every
   element the two pages share; the blocks below port its latest decisions
   (its late blocks, same order) onto this page's classes. Business-only parts
   — the tier manifest, its per-tier CTAs, the copy — keep their own rules
   above. ══ */

/* ── Lamp glow: shape-following drop-shadows on the .lamp CONTAINER, never
   the image — the ::after blend group clips filters painted inside it. ── */
.day-mode .lamp {
  filter: drop-shadow(0 0 8px rgba(255,170,80,0.45)) drop-shadow(0 0 18px rgba(206,96,26,0.18));
}
.night-mode .lamp {
  filter: drop-shadow(0 0 8px rgba(255,214,150,0.5))
          drop-shadow(0 0 26px rgba(255,170,90,0.4))
          drop-shadow(0 0 60px rgba(255,140,60,0.26));
}
@media (max-width: 768px) {
  .night-mode .lamp {
    filter: drop-shadow(0 0 7px rgba(255,214,150,0.45)) drop-shadow(0 0 20px rgba(255,170,90,0.3));
  }
}

/* ── Hero CTA = the main landing's Make a Wish ──
   Night: the "Jinni" gold pill — the wordmark gradient at ~86% alpha with the
   lamp's tone filter on the ::before fill, the wordmark's three-layer warm
   halo as a STATIC box-shadow, and the hover glow as a FADING ::after layer.
   Day: clear glacier glass filled with a slow moving warm light. Text-sized
   pill, 52px phones / 56px tablet+. Nothing moves or scales on hover. */
.business-landing.day-mode {
  --wish-body: linear-gradient(45deg, rgba(176,106,24,0.94), rgba(207,83,23,0.94));
  --wish-tone: none;
  --wish-halo: 0 0 4px rgba(207,120,50,0.35), 0 0 14px rgba(190,90,30,0.28);
  --wish-filter: blur(10px) saturate(150%);
  --wish-ink-shadow: 0 0 6px rgba(70,25,0,0.4);
}
.business-landing.night-mode {
  --wish-body: linear-gradient(45deg, rgba(212,175,55,0.86), rgba(255,140,0,0.86));
  --wish-tone: saturate(0.76) brightness(1.06) contrast(0.96);
  --wish-halo: 0 0 4px rgba(255,214,150,0.5), 0 0 16px rgba(255,170,90,0.42), 0 0 40px rgba(255,140,60,0.26);
  --wish-filter: blur(10px) saturate(150%);
  --wish-ink-shadow: 0 0 6px rgba(90,40,0,0.45);
}
.business-landing .hero .magic-button {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: var(--cta-h); min-width: 48px; max-width: 100%; padding: 12px 28px; margin: var(--gap-cta) 0 0; border: none; border-radius: 999px; position: relative;
  background: none; box-shadow: var(--wish-halo); backdrop-filter: none; -webkit-backdrop-filter: none;
  font-size: var(--cta-fs); line-height: 1.25; letter-spacing: 0.01em; text-wrap: balance;
  transition: none;
}
.business-landing .hero .magic-button::before {
  content: ''; position: absolute; inset: 0; z-index: 0; border-radius: inherit; pointer-events: none;
  background: var(--wish-body); filter: var(--wish-tone);
  backdrop-filter: var(--wish-filter); -webkit-backdrop-filter: var(--wish-filter);
}
.business-landing .hero .magic-button:hover { background: none; box-shadow: var(--wish-halo) }
.business-landing .hero .wish-label,
.business-landing .hero .magic-button:hover .wish-label {
  position: relative; z-index: 2;
  background: none; -webkit-text-fill-color: #ffffff; color: #ffffff; opacity: 1;
  font-weight: 600; font-variant-caps: normal; letter-spacing: 0.01em; font-size: 1em;
  text-shadow: var(--wish-ink-shadow);
}
/* Night hover glow as a FADING LAYER: a blurred radial pool of the glow's own
   colours under and around the pill, fading in by opacity only. A growing
   box-shadow left the top of the glow unpainted, and a box-shadow layer
   showed as a thin dark ring through the 86% gold. */
.business-landing.night-mode .hero .magic-button::after {
  content: ''; position: absolute; inset: -10px -12px; z-index: -1; border-radius: 999px; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,200,120,0.55), rgba(255,160,80,0.32) 60%, rgba(255,140,60,0) 100%);
  filter: blur(10px); opacity: 0; transition: opacity 0.25s ease;
}
.business-landing.night-mode .hero .magic-button:hover::after,
.business-landing.night-mode .hero .magic-button:focus-visible::after { opacity: 1 }
/* Day: glacier glass filled with a moving warm light — clear glass on the
   pill; ::before = three soft warm pools far larger than the pill, drifting
   by translate only (no rotation, so no layer edge ever enters the pill). */
.business-landing.day-mode .hero .magic-button {
  overflow: hidden; isolation: isolate;
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.65), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 16px -3px rgba(190,110,40,0.28);
  transition: box-shadow 0.25s ease;
}
.business-landing.day-mode .hero .magic-button:hover {
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.85), 0 0 20px -3px rgba(190,110,40,0.36);
}
.business-landing.day-mode .hero .magic-button::after { content: none }
.business-landing.day-mode .hero .magic-button::before,
.business-landing.day-mode .hero .magic-button:hover::before {
  inset: -150% -45%; border-radius: 0; filter: blur(12px); opacity: 0.8;
  backdrop-filter: none; -webkit-backdrop-filter: none;
  background:
    radial-gradient(22% 26% at 34% 52%, rgba(255,168,60,0.75), rgba(255,168,60,0) 100%),
    radial-gradient(20% 24% at 62% 46%, rgba(255,214,120,0.7), rgba(255,214,120,0) 100%),
    radial-gradient(18% 22% at 48% 58%, rgba(226,112,52,0.55), rgba(226,112,52,0) 100%),
    rgba(255,255,255,0.22);
  animation: wishFlow 9s ease-in-out infinite;
}
.business-landing.day-mode .hero .magic-button:hover::before { opacity: 0.95 }
.business-landing.day-mode .hero .wish-label,
.business-landing.day-mode .hero .magic-button:hover .wish-label {
  color: #7A4A1C; -webkit-text-fill-color: #7A4A1C; text-shadow: 0 0 8px rgba(255,248,235,0.75);
}
@keyframes wishFlow {
  0%   { transform: translate(-9%, 2%) }
  33%  { transform: translate(7%, -3%) }
  66%  { transform: translate(-3%, 4%) }
  100% { transform: translate(-9%, 2%) }
}
@media (prefers-reduced-motion: reduce) { .business-landing.day-mode .hero .magic-button::before { animation: none } }

/* ── Day text: one bronze family; the brand gold carries no glow by day ── */
.day-mode .magic-title, .day-mode .features-heading { color: #7A4A1C }
.day-mode .magic-subtitle, .day-mode .footer-copyright { color: #7a5434; text-shadow: none }
.business-landing.day-mode .app-name {
  background: linear-gradient(45deg, #D4AF37, #FF8C00);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  filter: none; text-shadow: none;
}
/* The subtitle's brand word at body size: solid deep lamp tone, bold — the
   main landing's rule (a gradient cannot be read at this size on the sand). */
.day-mode .magic-subtitle :deep(.brand-grad) {
  background: none; -webkit-background-clip: initial; background-clip: initial;
  -webkit-text-fill-color: initial; color: #7A3A06; font-weight: 700; filter: none;
}

/* ── Night text: slightly transparent ink, gold accent words solid ── */
.night-mode .magic-title { color: rgba(255,246,226,0.7); text-shadow: none }
.night-mode .magic-subtitle { color: rgba(234,217,184,0.72); text-shadow: none }
.night-mode .features-heading { color: rgba(251,240,216,0.7); text-shadow: none }
.night-mode .wish-item h3 { color: rgba(240,220,174,0.72) }
.night-mode .wish-item p { color: rgba(228,215,189,0.68) }

/* ═══════════════════════════════════════════════════════════════════════════
   JINNI NIGHT (founder 2026-10-03: "set it for night mode please and same way
   in BusinessLandingpage"). Mirrors LandingPage.vue's block; overrides the
   older night rules above by order. Day mode untouched.
   ═══════════════════════════════════════════════════════════════════════════ */
.language-selector-container { gap: 8px }
.business-landing.day-mode {
  --lnav-sheet: rgba(255,250,242,0.97); --lnav-sheet-ink: #7A4A1C; --lnav-rule: rgba(122,74,28,0.15);
  --lnav-sheet-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.8), 0 0 18px -2px rgba(140,61,7,0.18);
  --lnav-primary: linear-gradient(45deg, rgba(176,106,24,0.94), rgba(207,83,23,0.94)); --lnav-primary-ink: #fff;
}
.business-landing.jinni-night {
  --lnav-sheet: rgba(18,10,30,0.97); --lnav-sheet-ink: #f3eaf8; --lnav-rule: rgba(220,210,255,0.14);
  --lnav-sheet-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.16), 0 0 18px -2px rgba(0,0,0,0.6);
  --lnav-primary: linear-gradient(45deg, #E9C766, #FFA640); --lnav-primary-ink: #2a1405;
  --lang-ink: #f3eaf8; --lang-glass: rgba(255,255,255,0.06); --lang-glass-hover: rgba(255,255,255,0.12);
  --lang-rim: inset 0 0 0 0.75px rgba(220,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px -2px rgba(0,0,0,0.3);
  --lang-hover: rgba(220,210,255,0.1);
}
.business-landing.jinni-night::after { content: none }
.business-landing.jinni-night .lamp { width: 190px; margin-bottom: -46px;
  filter: drop-shadow(0 0 28px rgba(255,160,70,0.45)) drop-shadow(0 0 70px rgba(255,130,50,0.22)) }
@media (max-width: 768px) { .business-landing.jinni-night .lamp { width: 130px; margin-bottom: -31px } }
.business-landing.jinni-night .magic-title,
.business-landing.jinni-night .features-heading { color: #fbf5ff; text-shadow: 0 0 30px rgba(255,170,90,0.16) }
.business-landing.jinni-night .magic-subtitle { color: #c5bcd6; text-shadow: none }
.business-landing.jinni-night .magic-subtitle :deep(.brand-grad) { background: none; -webkit-text-fill-color: #ffd29a; color: #ffd29a; filter: none; font-weight: 600 }
.business-landing.jinni-night .app-name { filter: drop-shadow(0 0 10px rgba(255,170,90,0.35)) }

/* Make a Wish = Ember Breath */
.business-landing.jinni-night .hero .magic-button,
.business-landing.jinni-night .hero .magic-button:hover {
  overflow: hidden; isolation: isolate; background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  box-shadow: inset 0 0 0 0.75px rgba(255,240,215,0.38), inset 0 1px 0 rgba(255,246,228,0.5), 0 0 18px -2px rgba(255,160,80,0.32);
  transition: --ex 3.4s ease-in-out, --ey 3.4s ease-in-out, box-shadow 0.25s ease;
}
.business-landing.jinni-night .hero .magic-button:hover,
.business-landing.jinni-night .hero .magic-button:focus-visible {
  box-shadow: inset 0 0 0 0.75px rgba(255,240,215,0.5), inset 0 1px 0 rgba(255,246,228,0.62), 0 0 22px -2px rgba(255,160,80,0.44);
}
.business-landing.jinni-night .hero .magic-button::before {
  filter: none; backdrop-filter: none; -webkit-backdrop-filter: none;
  background: radial-gradient(62% 120% at var(--ex, 50%) var(--ey, 110%), rgba(255,150,50,0.62), rgba(255,150,50,0) 70%),
              radial-gradient(34% 80% at var(--ex, 50%) var(--ey, 110%), rgba(255,228,170,0.5), rgba(255,228,170,0) 70%);
  animation: ember-breathe 3.4s ease-in-out infinite;
}
.business-landing.jinni-night .hero .magic-button::after,
.business-landing.jinni-night .hero .magic-button:hover::after {
  content: ''; position: absolute; inset: -60% -30%; z-index: 0; border-radius: 0; opacity: 1; pointer-events: none; filter: blur(12px);
  background: radial-gradient(18% 30% at 30% 50%, rgba(233,199,102,0.34), rgba(233,199,102,0) 100%);
  animation: ember-drift 11s ease-in-out infinite; transition: none;
}
.business-landing.jinni-night .hero .wish-label,
.business-landing.jinni-night .hero .magic-button:hover .wish-label {
  color: #fffaf0; -webkit-text-fill-color: #fffaf0; text-shadow: 0 0 10px rgba(120,50,0,0.55), 0 0 2px rgba(80,30,0,0.4) }
@keyframes ember-breathe { 0%, 100% { opacity: 0.38 } 50% { opacity: 0.82 } }
@keyframes ember-drift { 0% { transform: translate(-9%, 2%) } 33% { transform: translate(7%, -3%) } 66% { transform: translate(-3%, 4%) } 100% { transform: translate(-9%, 2%) } }
@media (prefers-reduced-motion: reduce) {
  .business-landing.jinni-night .hero .magic-button::before,
  .business-landing.jinni-night .hero .magic-button::after { animation: none }
}

/* tiers = frosted-glass cards */
.business-landing.jinni-night .features-grid { gap: 16px }
.business-landing.jinni-night .wish-item,
.business-landing.jinni-night .wish-item:first-child,
.business-landing.jinni-night .wish-item:last-child {
  padding: 26px 24px; border: none; border-radius: 22px; background: rgba(255,255,255,0.05);
  backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%);
  box-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -2px rgba(0,0,0,0.45);
}
.business-landing.jinni-night .tier-mark { color: #ffb36b; filter: drop-shadow(0 0 6px rgba(255,170,90,0.35)) }
.business-landing.jinni-night .tier-label { color: #a99fbf }
.business-landing.jinni-night .wish-item h3 { color: #f3eaf8 }
.business-landing.jinni-night .wish-item p { color: #c9c0da }
.business-landing.jinni-night .tier-cta .wish-label { color: #ffd29a; -webkit-text-fill-color: #ffd29a; text-shadow: none }
@media (max-width: 768px) {
  .business-landing.jinni-night .features-grid { gap: 12px }
  .business-landing.jinni-night .wish-item { border-top: none }
}
.business-landing.jinni-night .footer-links a { color: #e6dcf2 }
.business-landing.jinni-night .footer-copyright { color: rgba(220,210,240,0.55) }

/* ── JINNI NIGHT · the preview's layout and type (founder 2026-10-03: "the font
   there, layout, everything was interesting and better … mine looked
   childish"). Ported from LandingLab/night-directions.html design 4 so the
   live page IS the preview: Cinzel titles at 500 (not bold), Lora for every
   sentence, lamp + JINNI mark, a hero that flows instead of filling the
   screen, one section rhythm, the plain-link desktop bar, a ruled footer.
   Night only — day keeps its own layout. ── */
.business-landing.jinni-night { --section: clamp(64px, 9vw, 104px); --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif }

/* mark: small lamp + JINNI (Cinzel's lowercase is small caps) */
.business-landing.jinni-night .header-container { gap: 10px }
.business-landing.jinni-night .brand-lamp { width: 44px; height: auto; margin: -6px -4px -6px -6px; filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)) }
.business-landing.jinni-night .app-name { font-size: 22px; font-weight: 600; letter-spacing: 2px; background: none; -webkit-text-fill-color: #f3eaf8; color: #f3eaf8; filter: none }

/* desktop bar: plain links, an outlined Sign in — no capsule */
.business-landing.jinni-night :deep(.lnav-links) { background: none; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; gap: 8px; padding: 0 }
.business-landing.jinni-night :deep(.lnav-links a) { font-family: var(--lora); font-weight: 400; opacity: 0.75 }
.business-landing.jinni-night :deep(.lnav-links a:hover) { opacity: 1; background: none }
.business-landing.jinni-night :deep(.lnav-links .lnav-signin) { opacity: 0.9; padding: 8px 16px; margin-inline-start: 8px }
.business-landing.jinni-night .lang-trigger { font-family: var(--lora) }

/* hero: flows from under the bar; lamp → title → line → button */
.business-landing.jinni-night .hero { min-height: 0; display: block; padding: calc(var(--hdr-top) + var(--hdr-h) + clamp(40px, 7vh, 88px)) 24px var(--section) }
.business-landing.jinni-night .hero-content { max-width: 1180px; margin: 0 auto }
.business-landing.jinni-night .lamp { width: min(210px, 50vw); margin: 0 auto -8px }
.business-landing.jinni-night .hero .magic-title { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(36px, 6.4vw, 76px); line-height: 1.08;
  letter-spacing: 0.02em; max-width: 900px; margin: 0 auto 18px }
.business-landing.jinni-night .hero .magic-subtitle { font-family: var(--lora); font-size: clamp(17px, 2vw, 20px); line-height: 1.55; max-width: 560px; margin: 0 auto 34px }
.business-landing.jinni-night .hero .magic-button, .business-landing.jinni-night .hero .magic-button:hover { margin: 0; min-height: 56px; padding: 14px 36px }
.business-landing.jinni-night .hero .wish-label, .business-landing.jinni-night .hero .magic-button:hover .wish-label { font-family: var(--lora); font-size: 17px; font-weight: 600 }

/* features / plans */
.business-landing.jinni-night .features { padding: 0 24px var(--section) }
.business-landing.jinni-night .features-container { max-width: 1180px }
.business-landing.jinni-night .features h2.features-heading { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(24px, 3.2vw, 34px); line-height: 1.2;
  letter-spacing: 0.02em; margin: 0 0 clamp(28px, 4vw, 44px) }
.business-landing.jinni-night .wish-num { font-family: var(--brand-serif); font-size: 13px; font-weight: 400; line-height: 1; letter-spacing: 0.2em; margin: 0; opacity: 0.6 }
.business-landing.jinni-night .wish-item h3 { font-family: var(--lora); font-size: 18px; font-weight: 600; line-height: 1.3; margin: 14px 0 10px }
.business-landing.jinni-night .wish-item p { font-family: var(--lora); font-size: 15.5px; line-height: 1.6; margin: 0; color: rgba(238,230,246,0.78) }

/* the Explore / For Business switch: the bar's links do this job now */
.business-landing.jinni-night .mode-switch-wrapper { display: none }

/* cities */
.business-landing.jinni-night .cities { padding: 0 24px var(--section) }
.business-landing.jinni-night .cities .features-container { max-width: 900px }
.business-landing.jinni-night .cities h2.cities-heading { font-size: clamp(22px, 2.8vw, 30px); margin: 0 0 8px }
.business-landing.jinni-night .cities-sub { font-family: var(--lora); font-size: 16px; color: rgba(238,230,246,0.7); margin: 0 0 26px }
.business-landing.jinni-night .cities-country { margin: 0 auto 22px }
.business-landing.jinni-night .cities-country-name { font-family: var(--brand-serif); font-size: 12px; font-weight: 400; letter-spacing: 0.2em; color: rgba(238,230,246,0.55); opacity: 1; margin: 0 0 12px }
.business-landing.jinni-night .cities-grid { justify-content: center; gap: 10px 14px }
.business-landing.jinni-night .city-card-name { font-family: var(--lora); font-size: 17px; font-weight: 400 }
.business-landing.jinni-night .city-card-meta { font-family: var(--lora); font-size: 13px; opacity: 0.8 }

/* footer: one ruled line — © left, links right */
.business-landing.jinni-night .footer { margin-top: auto; padding: 0 }
.business-landing.jinni-night .footer-content { max-width: 1180px; margin: 0 auto; padding: 26px 24px calc(26px + env(safe-area-inset-bottom, 0px));
  display: flex; justify-content: space-between; align-items: center; gap: 12px 16px; flex-wrap: wrap;
  border-top: 1px solid rgba(200,190,255,0.14); text-align: start }
.business-landing.jinni-night .footer-copyright { order: -1; margin: 0; font-family: var(--lora); font-size: 13px; color: rgba(238,230,246,0.6) }
.business-landing.jinni-night .footer-links { gap: 0; justify-content: flex-end }
.business-landing.jinni-night .footer-links a { font-family: var(--lora); font-size: 13px; padding: 0; color: rgba(238,230,246,0.6) }
.business-landing.jinni-night .footer-links a:hover { color: #f3eaf8 }
.business-landing.jinni-night .footer-links a + a::before { content: '·'; margin: 0 8px; color: rgba(238,230,246,0.4) }
@media (max-width: 768px) {
  .business-landing.jinni-night .header-container { gap: 8px }
  .business-landing.jinni-night .brand-lamp { width: 38px }
  .business-landing.jinni-night .app-name { font-size: 20px }
  .business-landing.jinni-night .footer-content { justify-content: center; text-align: center }
}

/* Cinzel now loads (2026-10-03): it is a capitals face, so day keeps it for
   titles only and sets its sentence in Lora, as the Jinni Day preview does. */
.business-landing.day-mode .hero .magic-subtitle { font-family: 'Lora', 'Noto Serif Armenian', Georgia, serif }

/* day: the same preview layout as night */
.business-landing.day-mode { --section: clamp(64px, 9vw, 104px); --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif }

/* mark: small lamp + JINNI (Cinzel's lowercase is small caps) */
.business-landing.day-mode .header-container { gap: 10px }
.business-landing.day-mode .brand-lamp { width: 44px; height: auto; margin: -6px -4px -6px -6px; filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)) }
.business-landing.day-mode .app-name { font-size: 22px; font-weight: 600; letter-spacing: 2px; background: none; -webkit-text-fill-color: #f3eaf8; color: #f3eaf8; filter: none }

/* desktop bar: plain links, an outlined Sign in — no capsule */
.business-landing.day-mode :deep(.lnav-links) { background: none; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; gap: 8px; padding: 0 }
.business-landing.day-mode :deep(.lnav-links a) { font-family: var(--lora); font-weight: 400; opacity: 0.75 }
.business-landing.day-mode :deep(.lnav-links a:hover) { opacity: 1; background: none }
.business-landing.day-mode :deep(.lnav-links .lnav-signin) { opacity: 0.9; padding: 8px 16px; margin-inline-start: 8px }
.business-landing.day-mode .lang-trigger { font-family: var(--lora) }

/* hero: flows from under the bar; lamp → title → line → button */
.business-landing.day-mode .hero { min-height: 0; display: block; padding: calc(var(--hdr-top) + var(--hdr-h) + clamp(40px, 7vh, 88px)) 24px var(--section) }
.business-landing.day-mode .hero-content { max-width: 1180px; margin: 0 auto }
.business-landing.day-mode .lamp { width: min(210px, 50vw); margin: 0 auto -8px }
.business-landing.day-mode .hero .magic-title { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(36px, 6.4vw, 76px); line-height: 1.08;
  letter-spacing: 0.02em; max-width: 900px; margin: 0 auto 18px }
.business-landing.day-mode .hero .magic-subtitle { font-family: var(--lora); font-size: clamp(17px, 2vw, 20px); line-height: 1.55; max-width: 560px; margin: 0 auto 34px }
.business-landing.day-mode .hero .magic-button, .business-landing.day-mode .hero .magic-button:hover { margin: 0; min-height: 56px; padding: 14px 36px }
.business-landing.day-mode .hero .wish-label, .business-landing.day-mode .hero .magic-button:hover .wish-label { font-family: var(--lora); font-size: 17px; font-weight: 600 }

/* features / plans */
.business-landing.day-mode .features { padding: 0 24px var(--section) }
.business-landing.day-mode .features-container { max-width: 1180px }
.business-landing.day-mode .features h2.features-heading { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(24px, 3.2vw, 34px); line-height: 1.2;
  letter-spacing: 0.02em; margin: 0 0 clamp(28px, 4vw, 44px) }
.business-landing.day-mode .wish-num { font-family: var(--brand-serif); font-size: 13px; font-weight: 400; line-height: 1; letter-spacing: 0.2em; margin: 0; opacity: 0.6 }
.business-landing.day-mode .wish-item h3 { font-family: var(--lora); font-size: 18px; font-weight: 600; line-height: 1.3; margin: 14px 0 10px }
.business-landing.day-mode .wish-item p { font-family: var(--lora); font-size: 15.5px; line-height: 1.6; margin: 0; color: rgba(238,230,246,0.78) }

/* the Explore / For Business switch: the bar's links do this job now */
.business-landing.day-mode .mode-switch-wrapper { display: none }

/* cities */
.business-landing.day-mode .cities { padding: 0 24px var(--section) }
.business-landing.day-mode .cities .features-container { max-width: 900px }
.business-landing.day-mode .cities h2.cities-heading { font-size: clamp(22px, 2.8vw, 30px); margin: 0 0 8px }
.business-landing.day-mode .cities-sub { font-family: var(--lora); font-size: 16px; color: rgba(238,230,246,0.7); margin: 0 0 26px }
.business-landing.day-mode .cities-country { margin: 0 auto 22px }
.business-landing.day-mode .cities-country-name { font-family: var(--brand-serif); font-size: 12px; font-weight: 400; letter-spacing: 0.2em; color: rgba(238,230,246,0.55); opacity: 1; margin: 0 0 12px }
.business-landing.day-mode .cities-grid { justify-content: center; gap: 10px 14px }
.business-landing.day-mode .city-card-name { font-family: var(--lora); font-size: 17px; font-weight: 400 }
.business-landing.day-mode .city-card-meta { font-family: var(--lora); font-size: 13px; opacity: 0.8 }

/* footer: one ruled line — © left, links right */
.business-landing.day-mode .footer { margin-top: auto; padding: 0 }
.business-landing.day-mode .footer-content { max-width: 1180px; margin: 0 auto; padding: 26px 24px calc(26px + env(safe-area-inset-bottom, 0px));
  display: flex; justify-content: space-between; align-items: center; gap: 12px 16px; flex-wrap: wrap;
  border-top: 1px solid rgba(200,190,255,0.14); text-align: start }
.business-landing.day-mode .footer-copyright { order: -1; margin: 0; font-family: var(--lora); font-size: 13px; color: rgba(238,230,246,0.6) }
.business-landing.day-mode .footer-links { gap: 0; justify-content: flex-end }
.business-landing.day-mode .footer-links a { font-family: var(--lora); font-size: 13px; padding: 0; color: rgba(238,230,246,0.6) }
.business-landing.day-mode .footer-links a:hover { color: #f3eaf8 }
.business-landing.day-mode .footer-links a + a::before { content: '·'; margin: 0 8px; color: rgba(238,230,246,0.4) }
@media (max-width: 768px) {
  .business-landing.day-mode .header-container { gap: 8px }
  .business-landing.day-mode .brand-lamp { width: 38px }
  .business-landing.day-mode .app-name { font-size: 20px }
  .business-landing.day-mode .footer-content { justify-content: center; text-align: center }
}

/* ── JINNI DAY (founder 2026-10-03: "below make a wish button, everything
   stayed as before … where is the background colour as in your preview").
   Day takes the same preview layout as night (the block above, re-keyed to
   day) plus LandingLab design 5's own colours: <JinniDaySky> behind, bronze
   type, white-glass cards and pills, Ember Breath with a copper light. ── */
.business-landing.day-mode { background: none; color: #7a5434;
  --lang-ink: #7A4A1C; --lang-glass: rgba(255,255,255,0.45); --lang-glass-hover: rgba(255,255,255,0.62);
  --lang-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), 0 0 18px -2px rgba(140,61,7,0.14); --lang-hover: rgba(140,61,7,0.08);
  --lnav-primary-ink: #6e3f16 }
.business-landing.day-mode::after { content: none }
.business-landing.day-mode .app-name { -webkit-text-fill-color: #b8741f; color: #b8741f }
.business-landing.day-mode .brand-lamp { filter: saturate(0.88) brightness(0.95) }
.business-landing.day-mode .lamp { filter: drop-shadow(0 0 26px rgba(255,170,80,0.45)) drop-shadow(0 0 60px rgba(230,140,60,0.2)) }
.business-landing.day-mode .static-bottle { filter: saturate(0.88) brightness(0.95) }
.business-landing.day-mode .hero .magic-title, .business-landing.day-mode .features h2.features-heading { color: #7A4A1C; -webkit-text-fill-color: #7A4A1C; background: none; text-shadow: none }
.business-landing.day-mode .magic-title :deep(.brand-grad), .business-landing.day-mode .features-heading :deep(.brand-grad) { background: none; -webkit-text-fill-color: currentColor; color: inherit; filter: none }
.business-landing.day-mode .hero .magic-subtitle { color: #8a6444; text-shadow: none }
/* cards */
.business-landing.day-mode .features-grid { gap: 16px }
.business-landing.day-mode .wish-item, .business-landing.day-mode .wish-item:first-child, .business-landing.day-mode .wish-item:last-child {
  padding: 26px 24px; border: none; border-radius: 22px; background: rgba(255,255,255,0.5);
  backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 18px -2px rgba(140,61,7,0.12) }
.business-landing.day-mode .wish-num { color: #c0702a; opacity: 1; text-shadow: none }
.business-landing.day-mode .wish-item h3 { color: #6e3f16 }
.business-landing.day-mode .wish-item p { color: rgba(122,84,52,0.85) }
@media (max-width: 768px) { .business-landing.day-mode .features-grid { gap: 12px } .business-landing.day-mode .wish-item { border-top: none } }
/* cities */
.business-landing.day-mode .cities-sub { color: rgba(122,84,52,0.8) }
.business-landing.day-mode .cities-country-name { color: rgba(122,74,28,0.6) }
.business-landing.day-mode .cities-grid { gap: 10px }
.business-landing.day-mode .city-card { padding: 9px 16px; border-radius: 999px; background: rgba(255,255,255,0.5);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 14px -4px rgba(140,61,7,0.14) }
.business-landing.day-mode .city-card:hover { background: rgba(255,255,255,0.7) }
.business-landing.day-mode .city-card::after { content: none }
.business-landing.day-mode .city-card-body { flex-direction: row; align-items: baseline; gap: 8px }
.business-landing.day-mode .city-card-name, .business-landing.day-mode .city-card:hover .city-card-name { color: #6e3f16; -webkit-text-fill-color: #6e3f16; background: none; text-shadow: none }
.business-landing.day-mode .city-card-meta { color: rgba(122,84,52,0.65) }
/* footer */
.business-landing.day-mode .footer-content { border-top-color: rgba(122,74,28,0.16) }
.business-landing.day-mode .footer-copyright, .business-landing.day-mode .footer-links a { color: rgba(122,84,52,0.75) }
.business-landing.day-mode .footer-links a:hover { color: #6e3f16 }
.business-landing.day-mode .footer-links a + a::before { color: rgba(122,84,52,0.4) }
/* Make a Wish = Ember Breath, day: clear white glass, copper light inside */
.business-landing.day-mode .hero .magic-button, .business-landing.day-mode .hero .magic-button:hover {
  overflow: hidden; isolation: isolate; background: rgba(255,255,255,0.35);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 18px -3px rgba(190,110,40,0.3);
  transition: --ex 3.4s ease-in-out, --ey 3.4s ease-in-out, box-shadow 0.25s ease }
.business-landing.day-mode .hero .magic-button:hover, .business-landing.day-mode .hero .magic-button:focus-visible {
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,1), 0 0 22px -2px rgba(190,110,40,0.42) }
.business-landing.day-mode .hero .magic-button::before {
  content: ''; position: absolute; inset: 0; z-index: 0; border-radius: inherit; pointer-events: none;
  filter: none; backdrop-filter: none; -webkit-backdrop-filter: none;
  background: radial-gradient(62% 120% at var(--ex, 50%) var(--ey, 110%), rgba(255,160,70,0.75), rgba(255,160,70,0) 70%),
              radial-gradient(34% 80% at var(--ex, 50%) var(--ey, 110%), rgba(255,230,170,0.7), rgba(255,230,170,0) 70%);
  animation: ember-breathe 3.4s ease-in-out infinite }
.business-landing.day-mode .hero .magic-button::after, .business-landing.day-mode .hero .magic-button:hover::after {
  content: ''; position: absolute; inset: -60% -30%; z-index: 0; border-radius: 0; opacity: 1; pointer-events: none; filter: blur(12px);
  background: radial-gradient(18% 30% at 30% 50%, rgba(255,200,120,0.5), rgba(255,200,120,0) 100%);
  animation: ember-drift 11s ease-in-out infinite; transition: none }
.business-landing.day-mode .hero .wish-label, .business-landing.day-mode .hero .magic-button:hover .wish-label {
  position: relative; z-index: 2; background: none; color: #6e3f16; -webkit-text-fill-color: #6e3f16; text-shadow: 0 0 8px rgba(255,248,235,0.8) }
@media (prefers-reduced-motion: reduce) { .business-landing.day-mode .hero .magic-button::before, .business-landing.day-mode .hero .magic-button::after { animation: none } }
.business-landing.day-mode { --lnav-wish-ink: #6e3f16; --lnav-wish-glass: rgba(255,255,255,0.35); --lnav-wish-ink-shadow: 0 0 8px rgba(255,248,235,0.8);
  --lnav-wish-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 18px -3px rgba(190,110,40,0.3);
  --lnav-wish-light: rgba(255,160,70,0.75); --lnav-wish-core: rgba(255,230,170,0.7) }
.business-landing.day-mode { --lnav-ghost-glass: rgba(140,61,7,0.06); --lnav-ghost-glass-hover: rgba(140,61,7,0.1); --lnav-ghost-shadow: none }

/* founder 2026-10-03 (phone screenshots): the header scrolls away with the
   page as in the preview — pinned, EN + menu floated over the text */
.business-landing.jinni-night .language-selector-container { position: absolute }
.business-landing.jinni-night .cities h2.cities-heading { font-family: var(--brand-serif); font-weight: 500; letter-spacing: 0.02em; line-height: 1.2 }

/* founder 2026-10-03 (phone screenshots): the header scrolls away with the
   page as in the preview — pinned, EN + menu floated over the text */
.business-landing.day-mode .language-selector-container { position: absolute }
.business-landing.day-mode .cities h2.cities-heading { font-family: var(--brand-serif); font-weight: 500; letter-spacing: 0.02em; line-height: 1.2 }

/* Tier colours (founder 2026-10-03: "each has its colour, green, blue and gold
   orange — check the onboarding page"). Same identities as BusinessOnboarding:
   Verified #4CAF50, Spotlight #3b9edd, Signature #D4AF37→#FF8C00. Day uses the
   deeper tones already chosen for the day hovers so they read on cream. */
.business-landing.jinni-night .tier-verified .tier-mark, .business-landing.jinni-night .tier-verified .tier-label { color: #5cc062 }
.business-landing.jinni-night .tier-verified .tier-price { background: linear-gradient(45deg, #5cc062, #4CAF50); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }
.business-landing.jinni-night .tier-verified .tier-price-suffix { -webkit-text-fill-color: #5cc062; color: #5cc062; opacity: .75 }
.business-landing.jinni-night .tier-verified .tier-cta .wish-label, .business-landing.jinni-night .tier-verified .tier-cta:hover .wish-label { color: #5cc062; -webkit-text-fill-color: #5cc062; background: none; text-shadow: none }
.business-landing.jinni-night .tier-verified .tier-cta { border-color: #5cc062; --tier-ink: #5cc062 }
.business-landing.jinni-night .tier-spotlight .tier-mark, .business-landing.jinni-night .tier-spotlight .tier-label { color: #4fb0ec }
.business-landing.jinni-night .tier-spotlight .tier-price { background: linear-gradient(45deg, #4fb0ec, #3b9edd); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }
.business-landing.jinni-night .tier-spotlight .tier-price-suffix { -webkit-text-fill-color: #4fb0ec; color: #4fb0ec; opacity: .75 }
.business-landing.jinni-night .tier-spotlight .tier-cta .wish-label, .business-landing.jinni-night .tier-spotlight .tier-cta:hover .wish-label { color: #4fb0ec; -webkit-text-fill-color: #4fb0ec; background: none; text-shadow: none }
.business-landing.jinni-night .tier-spotlight .tier-cta { border-color: #4fb0ec; --tier-ink: #4fb0ec }
.business-landing.jinni-night .tier-signature .tier-mark, .business-landing.jinni-night .tier-signature .tier-label { color: #D4AF37 }
.business-landing.jinni-night .tier-signature .tier-price { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }
.business-landing.jinni-night .tier-signature .tier-price-suffix { -webkit-text-fill-color: #D4AF37; color: #D4AF37; opacity: .75 }
.business-landing.jinni-night .tier-signature .tier-cta .wish-label, .business-landing.jinni-night .tier-signature .tier-cta:hover .wish-label { color: #D4AF37; -webkit-text-fill-color: #D4AF37; background: none; text-shadow: none }
.business-landing.jinni-night .tier-signature .tier-cta { border-color: #D4AF37; --tier-ink: #D4AF37 }
.business-landing.day-mode .tier-verified .tier-mark, .business-landing.day-mode .tier-verified .tier-label { color: #35853C }
.business-landing.day-mode .tier-verified .tier-price { background: linear-gradient(45deg, #35853C, #35853C); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }
.business-landing.day-mode .tier-verified .tier-price-suffix { -webkit-text-fill-color: #35853C; color: #35853C; opacity: .75 }
.business-landing.day-mode .tier-verified .tier-cta .wish-label, .business-landing.day-mode .tier-verified .tier-cta:hover .wish-label { color: #35853C; -webkit-text-fill-color: #35853C; background: none; text-shadow: none }
.business-landing.day-mode .tier-verified .tier-cta { border-color: #35853C; --tier-ink: #35853C }
.business-landing.day-mode .tier-spotlight .tier-mark, .business-landing.day-mode .tier-spotlight .tier-label { color: #2A7DA8 }
.business-landing.day-mode .tier-spotlight .tier-price { background: linear-gradient(45deg, #2A7DA8, #2A7DA8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }
.business-landing.day-mode .tier-spotlight .tier-price-suffix { -webkit-text-fill-color: #2A7DA8; color: #2A7DA8; opacity: .75 }
.business-landing.day-mode .tier-spotlight .tier-cta .wish-label, .business-landing.day-mode .tier-spotlight .tier-cta:hover .wish-label { color: #2A7DA8; -webkit-text-fill-color: #2A7DA8; background: none; text-shadow: none }
.business-landing.day-mode .tier-spotlight .tier-cta { border-color: #2A7DA8; --tier-ink: #2A7DA8 }
.business-landing.day-mode .tier-signature .tier-mark, .business-landing.day-mode .tier-signature .tier-label { color: #B8860B }
.business-landing.day-mode .tier-signature .tier-price { background: linear-gradient(45deg, #B8860B, #C2570C); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }
.business-landing.day-mode .tier-signature .tier-price-suffix { -webkit-text-fill-color: #B8860B; color: #B8860B; opacity: .75 }
.business-landing.day-mode .tier-signature .tier-cta .wish-label, .business-landing.day-mode .tier-signature .tier-cta:hover .wish-label { color: #B8860B; -webkit-text-fill-color: #B8860B; background: none; text-shadow: none }
.business-landing.day-mode .tier-signature .tier-cta { border-color: #B8860B; --tier-ink: #B8860B }
.business-landing.jinni-night .tier-verified .tier-cta::after { background: #5cc062; box-shadow: none; opacity: .7 }
.business-landing.jinni-night .tier-spotlight .tier-cta::after { background: #4fb0ec; box-shadow: none; opacity: .7 }
.business-landing.jinni-night .tier-signature .tier-cta::after { background: #E8A33A; box-shadow: none; opacity: .7 }
.business-landing.day-mode .tier-verified .tier-cta::after { background: #35853C; box-shadow: none; opacity: .7 }
.business-landing.day-mode .tier-spotlight .tier-cta::after { background: #2A7DA8; box-shadow: none; opacity: .7 }
.business-landing.day-mode .tier-signature .tier-cta::after { background: #B8700B; box-shadow: none; opacity: .7 }
</style>

<style>
/* ── Hide the page scrollbar (matches JinniChat's approach) ────────────────── */
/* Firefox */
html, body { scrollbar-width: none; -ms-overflow-style: none }
/* WebKit (Chrome, Safari, Edge) */
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important }
/* founder 2026-10-03: a white bar showed on desktop. body carries overflow-x:
   hidden (genie-theme.css), so some browsers draw the page bar from body, not
   html — hide it on both. */
</style>