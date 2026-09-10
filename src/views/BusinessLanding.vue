<template>
  <div class="business-landing" :class="currentTheme">
    <StarrySky v-if="isNightMode" />
    <DesertSky v-else />
    <div class="header-container">
      <div class="app-name">Jinni</div>
    </div>

    <div class="language-selector-container">
      <div class="language-selector" ref="languageSelectorRef" @click.stop>
        <button v-if="showAllLanguages" v-for="lang in languageOptions" :key="lang.code" @click="selectLanguage(lang.code)" :title="lang.title" :class="{ active: selectedLanguage === lang.code }">{{ lang.flag }}</button>
        <button v-else @click="toggleLanguageSelector" :title="currentLanguageTitle">
          {{ currentLanguageFlag }}
        </button>
      </div>
    </div>

    <section class="hero">
      <div class="hero-content">
        <img src="/images/bottle.png?v=3" alt="Jinni — the AI travel guide's genie lamp" class="static-bottle">
        <h1 class="magic-title">{{ $t('businessLanding.hero.title') }}</h1>
        <p class="magic-subtitle" v-html="heroSubtitleHtml"></p>
        <MagicButton @click="goApply('verified')"><span class="wish-label">{{ $t('businessLanding.hero.cta') }}</span></MagicButton>
      </div>
    </section>

    <section class="features">
      <div class="features-container">
        <h2 class="features-heading">{{ $t('businessLanding.features.title') }}</h2>
        <div class="features-grid">
          <div v-for="tier in tiers" :key="tier.key" class="wish-item">
            <span class="tier-mark">
              <svg v-if="tier.key === 'verified'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="8.4"/>
                <polyline points="8.4 12.2 10.9 14.7 15.6 9.5"/>
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
            <button class="tier-cta" @click="goApply(tier.key)">
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
export default {
  name: 'BusinessLanding',
  components: { MagicButton, StarrySky, DesertSky },
  setup() {
    const router = useRouter()
    const store = useStore()
    const selectedLanguage = ref('en')
    const showAllLanguages = ref(false)
    const autoCloseTimer = ref(null)
    const languageSelectorRef = ref(null)
    const languageOptions = ref([
      { code: 'en', flag: '🇬🇧', title: 'English' },
      { code: 'fr', flag: '🇫🇷', title: 'Français' },
      { code: 'ru', flag: '🇷🇺', title: 'Русский' },
      { code: 'zh', flag: '🇨🇳', title: '中文' },
      { code: 'ar', flag: '🇸🇦', title: 'العربية' },
      { code: 'hy', flag: '🇦🇲', title: 'Հայերեն' }
    ])
    /* The brand word carries the gradient, the sentence stays solid — the
       landing page's rule. Inserted with v-html, so the span carries no scope
       attribute and the CSS has to reach it with :deep(). */
    const { t: translate } = useI18n()
    const heroSubtitleHtml = computed(() => {
      const raw = String(translate('businessLanding.hero.subtitle') || '')
      const esc = raw.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
      return esc.replace(/Jinni/g, '<span class="brand-grad">Jinni</span>')
    })
    const tiers = [
      { key: 'verified', suffix: false },
      { key: 'spotlight', suffix: true },
      { key: 'signature', suffix: true }
    ]
    const currentLanguageFlag = computed(() => languageOptions.value.find(l => l.code === selectedLanguage.value)?.flag || '🌐')
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
    const toggleLanguageSelector = () => { showAllLanguages.value = true; startAutoCloseTimer() }
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
    onMounted(() => {
      if (store.state.i18n?.locale) selectedLanguage.value = store.state.i18n.locale
      showAllLanguages.value = false
    })
    onBeforeUnmount(() => { clearAutoCloseTimer() })
    function goHome()  { router.push('/') }
    function goApply(tier = 'verified') { router.push({ path: '/business/apply', query: { tier } }) }
    return {
      currentTheme, isNightMode,
      selectedLanguage, showAllLanguages, languageOptions,
      currentLanguageFlag, currentLanguageTitle,
      selectLanguage, toggleLanguageSelector, languageSelectorRef,
      heroSubtitleHtml, tiers,
      goHome, goApply
    }
  }
}
</script>




<style scoped>
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
.header-container { position: absolute; top: 0; left: 0; padding: 27px; z-index: 1000 }
.app-name { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 600; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 1px }
.language-selector-container { position: fixed; top: 20px; right: 20px; z-index: 1001 }
.language-selector { display: flex; gap: 12px; background: rgba(26,9,51,0.5); padding: 10px; border-radius: 50px; backdrop-filter: blur(5px); border: 1px solid rgba(157,123,255,0.3); transition: all 0.3s ease; overflow: hidden }
.language-selector button { background: transparent; color: #9D7BFF; border: none; padding: 12px; border-radius: 50%; cursor: pointer; transition: transform 0.3s ease, background 0.3s ease, opacity 0.3s ease; font-size: 24px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(157,123,255,0.2) }
.language-selector button:hover { transform: scale(1.1); background: rgba(157,123,255,0.2); box-shadow: 0 0 15px rgba(157,123,255,0.4) }
.language-selector button.active { background: rgba(157,123,255,0.3); box-shadow: 0 0 15px rgba(157,123,255,0.5); animation: pulse 0.5s ease }

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2 }
.hero-content { max-width: 1080px; animation: fadeInUp 1s ease-out }
.static-bottle { width: 150px; height: auto; max-height: 250px; margin: auto; display: block }
/* The sentence used to break with one word stranded on the second line: an
   800px box at a fixed 4rem. It now scales with the window and balances, so
   longer translations split evenly instead of orphaning a word. */
.magic-title { font-family: 'Cinzel', serif; font-size: clamp(2.4rem, 5.4vw, 4rem); text-wrap: balance; letter-spacing: 1px; margin-bottom: 0.5rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.magic-subtitle { font-family: 'Cinzel', serif; font-size: 1.5rem; max-width: 700px; margin: 0 auto 2rem; text-shadow: 0 0 7px rgba(255,255,255,0.3) }
/* v-html content carries NO scope attribute — a plain scoped descendant rule
   would never match this span. */
.magic-subtitle :deep(.brand-grad) { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }

/* ── The tiers, as a manifest ──────────────────────────────────────────────── */
.features { padding: 2rem 1rem 4rem 1rem; position: relative; z-index: 2 }
.features-container { max-width: 1200px; margin: 0 auto }
.features-heading { font-family: 'Cinzel', serif; text-align: center; margin-bottom: 3rem; font-size: 2.5rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); position: relative }
.wish-item { padding: 6px 30px; display: flex; flex-direction: column; align-items: flex-start }
/* The tier icons come back as line marks, not filled discs: a stroke drawn
   in the same ink as the type, so it belongs to the manifest instead of
   sitting on it. */
.tier-mark { display: block; margin-bottom: 10px; line-height: 0 }
.tier-mark svg { width: 24px; height: 24px }
.tier-label { font-family: 'Cinzel', serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px }
.tier-price { font-family: 'Cinzel', serif; font-size: 2.6rem; font-weight: 700; line-height: 1; margin-bottom: 12px; font-variant-numeric: tabular-nums }
.tier-price-suffix { font-size: 1rem; font-weight: 400; letter-spacing: 0.02em }
.wish-item h3 { font-family: 'Cinzel', serif; font-size: 1.4rem; margin-bottom: 10px }
.wish-item p { font-size: 1.02rem; line-height: 1.55; text-wrap: pretty; margin-bottom: 1.4rem }
.tier-cta { margin-top: auto; font-family: 'Cinzel', serif; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.02em; cursor: pointer; border: none; background: transparent; padding: 12px 26px; border-radius: 50px; transition: background 0.3s ease, box-shadow 0.3s ease, color 0.3s ease }

/* ── Mode switch ───────────────────────────────────────────────────────────── */
.mode-switch-wrapper { display: flex; justify-content: center; padding: 0 0 4rem; position: relative; z-index: 2 }
.mode-switch-pill { display: inline-flex; align-items: center; gap: 2px; background: rgba(26,9,51,0.8); border-radius: 50px; padding: 4px; backdrop-filter: blur(10px); box-shadow: 0 0 12px rgba(212,175,55,0.1), 0 0 24px rgba(0,0,0,0.35) }
.mode-switch-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 20px; border-radius: 40px; border: none; background: transparent; font-family: 'Cinzel', serif; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; color: rgba(212,175,55,0.45); transition: all 0.25s ease; white-space: nowrap }
.mode-switch-btn:hover { color: #D4AF37; background: rgba(212,175,55,0.12); box-shadow: 0 0 10px rgba(212,175,55,0.12) }
.mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); color: #D4AF37; box-shadow: 0 0 14px rgba(212,175,55,0.25); cursor: default }
.mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); box-shadow: 0 0 14px rgba(212,175,55,0.25) }

/* ── Footer ────────────────────────────────────────────────────────────────── */
.footer { margin-top: auto; padding: 0.3rem 0.3rem; position: relative; z-index: 2; width: 100% }
.footer-content { max-width: 1200px; margin: 0 auto; text-align: center }
.footer-links { display: flex; justify-content: center; gap: 2rem }
.footer-links a { color: #FF8C00; text-decoration: none; font-family: 'Cinzel', serif; font-size: 1.1rem; transition: all 0.3s ease; padding: 0.5rem }
.footer-copyright { color: rgba(224,224,224,0.7); font-family: 'Cinzel', serif; font-size: 0.9rem }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(50px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.1) } 100% { transform: scale(1) } }

/* ── Day mode: glacier glass on cream ──────────────────────────────────────── */
/* The full gradient sat at ~2:1 contrast on cream, so the sentence takes dark
   ink and only the brand word keeps the gradient. */
.day-mode .magic-title, .day-mode .features-heading { background: none; -webkit-text-fill-color: initial; color: #4a3226 }
.day-mode .magic-subtitle { color: #5a3c2e; text-shadow: 0 0 7px rgba(255,255,255,0.4) }
.day-mode .footer-copyright { color: #5a3c2e }
/* Wish button: the glacier glass of the Discovery chips, label in the brand
   gradient. A gradient text-clip needs the element's own background, so the
   glass lives on the button and the gradient on the label span. Even shadow;
   hover changes light only, nothing moves. */
.day-mode .hero .magic-button,
.day-mode .tier-cta {
  background: rgba(255, 251, 245, 0.6);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  backdrop-filter: blur(14px) saturate(160%);
  box-shadow: inset 0 0 0 1px rgba(184, 125, 78, 0.35), 0 0 16px -2px rgba(120, 80, 30, 0.16);
  padding: 14px 32px;
}
.day-mode .tier-cta { padding: 13px 24px }
.day-mode .hero .magic-button:hover,
.day-mode .tier-cta:hover {
  background: rgba(255, 251, 245, 0.86);
  box-shadow: inset 0 0 0 1px rgba(184, 125, 78, 0.5), 0 0 22px -2px rgba(120, 80, 30, 0.22);
}
.day-mode .wish-label {
  background: linear-gradient(45deg, #D4AF37, #FF8C00);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  font-weight: 600;
}
.day-mode .wish-item { border-left: 1px solid rgba(150,100,55,0.28) }
.day-mode .wish-item:first-child { border-left: none; padding-left: 0 }
.day-mode .wish-item:last-child { padding-right: 0 }
.day-mode .tier-mark { color: rgba(168,114,15,0.75) }
.day-mode .tier-label { color: rgba(150,100,55,0.75) }
.day-mode .tier-price { color: rgba(168,114,15,0.9) }
.day-mode .tier-price-suffix { color: rgba(150,100,55,0.6) }
.day-mode .wish-item h3 { color: #4a3226 }
.day-mode .wish-item p { color: #6b4a36 }
.day-mode .footer-links a { color: #b87d4e }
.day-mode .footer-links a:hover { color: #a06c42; text-shadow: 0 0 10px rgba(184,125,78,0.3) }
/* Same glass recipe on the language pill: an inset hairline and an even glow
   instead of a hard border and a downward shadow. */
.day-mode .language-selector { background: rgba(255,251,245,0.6); border: none; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); box-shadow: inset 0 0 0 1px rgba(184,125,78,0.3), 0 0 16px -2px rgba(120,80,30,0.14) }
.day-mode .language-selector:hover { background: rgba(255,251,245,0.8); box-shadow: inset 0 0 0 1px rgba(184,125,78,0.42), 0 0 20px -2px rgba(120,80,30,0.18) }
.day-mode .language-selector button { color: #a8720f; box-shadow: none }
.day-mode .language-selector button:hover { background: rgba(255,252,246,0.75); box-shadow: inset 0 0 0 1px rgba(184,125,78,0.28); transform: none }
.day-mode .language-selector button.active { background: rgba(255,252,246,0.9); box-shadow: inset 0 0 0 1px rgba(184,125,78,0.4); color: #7a4d10 }
.day-mode .button-glow-wrapper { filter: drop-shadow(0 0 25px rgba(212,175,55,0.4)) drop-shadow(0 0 50px rgba(255,140,0,0.3)) }
.day-mode .mode-switch-pill { background: rgba(255,248,240,0.45); box-shadow: 0 0 18px rgba(160,100,30,0.09), 0 0 20px rgba(0,0,0,0.06) }
.day-mode .mode-switch-btn { color: rgba(150,90,25,0.45) }
.day-mode .mode-switch-btn:hover { background: rgba(160,100,30,0.13); box-shadow: 0 0 10px rgba(160,100,30,0.12) }
.day-mode .mode-switch-btn--active { background: linear-gradient(45deg, rgba(200,140,60,0.32), rgba(150,90,25,0.24)); color: #4a2600; box-shadow: 0 0 14px rgba(139,69,19,0.18) }
.day-mode .mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(200,140,60,0.32), rgba(150,90,25,0.24)); box-shadow: 0 0 14px rgba(139,69,19,0.18) }

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
.night-mode::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(122% 88% at 50% 42%, rgba(6,2,20,0) 46%, rgba(6,2,20,0.5) 100%);
}
.night-mode .hero-content, .night-mode .features-container { position: relative; z-index: 1 }
/* A gradient-clipped element can't use text-shadow — the fill is transparent —
   so the wordmark's halo comes from drop-shadow on the rendered pixels. */
.night-mode .app-name {
  filter: drop-shadow(0 0 3px rgba(255,214,150,0.5)) drop-shadow(0 0 9px rgba(255,170,90,0.28));
}
/* The lamp PNG is a saturated orange next to parchment type, so on its own it
   reads as a sticker dropped on the page. Pulled toward the type's gold and
   given the same bloom, it becomes the source of the light. */
.night-mode .static-bottle {
  filter: saturate(0.76) brightness(1.06) contrast(0.96)
          drop-shadow(0 0 8px rgba(255,214,150,0.5))
          drop-shadow(0 0 26px rgba(255,170,90,0.4))
          drop-shadow(0 0 60px rgba(255,140,60,0.26));
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
  background: none; -webkit-text-fill-color: initial; color: #ffd9a0;
  text-shadow: 0 0 10px rgba(255,180,90,0.45);
}
/* CTAs drop the capsule for a word over a lit hairline — the same grammar as
   the landing's Make a Wish and its Explore switch. */
.night-mode .hero .magic-button, .night-mode .tier-cta {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; padding: 14px 8px 22px; position: relative;
  font-size: 1.32rem; letter-spacing: 0.01em;
}
.night-mode .tier-cta { font-size: 0.98rem; padding: 10px 4px 18px }
.night-mode .hero .magic-button::after, .night-mode .tier-cta::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 10px; height: 1.5px;
  background: rgba(255,214,150,0.85); box-shadow: 0 0 12px rgba(255,180,90,0.9);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.night-mode .tier-cta::after { bottom: 6px; height: 1px; background: rgba(255,214,150,0.55); box-shadow: 0 0 9px rgba(255,180,90,0.5) }
.night-mode .hero .magic-button:hover, .night-mode .tier-cta:hover { background: transparent; box-shadow: none }
.night-mode .hero .magic-button:hover::after { background: #fff3dc; box-shadow: 0 0 16px rgba(255,190,105,1) }
.night-mode .tier-cta:hover::after { background: #fff3dc; box-shadow: 0 0 14px rgba(255,190,105,0.9) }
/* the label leaves the gradient clip: halation needs a solid colour to bloom */
.night-mode .wish-label {
  background: none; -webkit-text-fill-color: initial; color: #ffe8c4; font-weight: 700;
  text-shadow: 0 0 12px rgba(255,180,90,0.5);
}
.night-mode .tier-cta .wish-label { font-weight: 600 }
/* Two temperatures, the sky's own contrast: warm gold where the lamp light
   falls (headings, prices, the brand), cool parchment for structure. */
.night-mode .wish-item { border-left: 1px solid rgba(240,218,170,0.2) }
.night-mode .wish-item:first-child { border-left: none; padding-left: 0 }
.night-mode .wish-item:last-child { padding-right: 0 }
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
/* Halation has no boxes, so the language pill goes too — the flag keeps a soft
   warm halo instead of a rim: findable, but nothing is drawn. */
.night-mode .language-selector { background: transparent; border: none; backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: none }
.night-mode .language-selector:hover { background: transparent; box-shadow: none }
.night-mode .language-selector button {
  background: transparent; box-shadow: none; color: #f5e6c8;
  filter: drop-shadow(0 0 5px rgba(255,190,110,0.45));
}
.night-mode .language-selector button:hover, .night-mode .language-selector button.active {
  background: transparent; box-shadow: none; transform: none;
  filter: drop-shadow(0 0 11px rgba(255,200,120,0.85));
}
/* Lavender at rest, warming to gold on hover — the link behaves like a star
   catching the lamp. The flat #FF8C00 was the loudest thing on the page. */
.night-mode .footer-links a { color: #dcb977 }
.night-mode .footer-links a:hover { color: #f7dc9c; text-shadow: 0 0 12px rgba(212,175,55,0.4) }
.night-mode .footer-copyright { color: rgba(234,217,184,0.55) }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  /* The lamp's 60px spill is sized for a desktop hero; on a phone it covers a
     third of the screen and its outer edge bands against the dark sky, which
     reads as a border drawn across the top. */
  .night-mode .static-bottle {
    filter: saturate(0.76) brightness(1.06) contrast(0.96)
            drop-shadow(0 0 7px rgba(255,214,150,0.45))
            drop-shadow(0 0 20px rgba(255,170,90,0.3));
  }
  /* One column: the vertical hairline becomes a horizontal one between items. */
  .features-grid { grid-template-columns: 1fr }
  .wish-item { padding: 20px 0 }
  .day-mode .wish-item, .night-mode .wish-item { border-left: none; border-top: 1px solid rgba(150,100,55,0.26) }
  .night-mode .wish-item { border-top-color: rgba(212,175,55,0.2) }
  .day-mode .wish-item:first-child, .night-mode .wish-item:first-child { border-top: none; padding-top: 0 }
  .tier-price { font-size: 2.1rem; margin-bottom: 8px }
  .tier-mark svg { width: 21px; height: 21px }
  .magic-title { font-size: 2.5rem }
  .magic-subtitle { font-size: 1.1rem }
  .features-heading { font-size: 2rem }
  .language-selector-container { top: 10px; right: 10px }
  .header-container { padding: 25px }
  .app-name { font-size: 1.5rem }
  .language-selector button { width: 40px; height: 40px; font-size: 20px }
  .footer-links { gap: 0.1rem }
  .footer-links a { font-size: 1rem }
}

/* Below-sky continuation — DesertSky's ending peach (Discovery-style fix) */
.business-landing.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}
</style>

<style>
/* ── Hide the page scrollbar (matches JinniChat's approach) ────────────────── */
/* Firefox */
html { scrollbar-width: none; -ms-overflow-style: none }
/* WebKit (Chrome, Safari, Edge) */
html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important }
</style>