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

    <!-- Hero — now using i18n -->
    <section class="hero">
      <div class="hero-content">
        <img src="/images/bottle.png" alt="Genie Bottle" class="static-bottle">
        <h1 class="magic-title">{{ $t('businessLanding.hero.title') }}</h1>
        <p class="magic-subtitle">{{ $t('businessLanding.hero.subtitle') }}</p>
        <MagicButton @click="goApply('verified')">{{ $t('businessLanding.hero.cta') }}</MagicButton>
      </div>
    </section>

    <section class="features">
      <div class="features-container">
        <h2 class="features-heading">{{ $t('businessLanding.features.title') }}</h2>
        <div class="features-grid">
          <!-- Verified -->
          <GoldCard class="feature-card">
            <div class="tier-icon tier-icon--verified">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="tier-label tier-label--verified">{{ $t('businessLanding.tiers.verified.label') }}</div>
            <div class="tier-price">{{ $t('businessLanding.tiers.verified.price') }}</div>
            <h3>{{ $t('businessLanding.tiers.verified.heading') }}</h3>
            <p>{{ $t('businessLanding.tiers.verified.description') }}</p>
            <button class="tier-cta tier-cta--verified" @click="goApply('verified')">{{ $t('businessLanding.tiers.verified.cta') }}</button>
          </GoldCard>
          <!-- Spotlight -->
          <GoldCard class="feature-card">
            <div class="tier-icon tier-icon--spotlight">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#3b9edd">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="#3b9edd" stroke-width="2"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="#3b9edd" stroke-width="2"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#3b9edd" stroke-width="2"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#3b9edd" stroke-width="2"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="#3b9edd" stroke-width="2"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="#3b9edd" stroke-width="2"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#3b9edd" stroke-width="2"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#3b9edd" stroke-width="2"/>
              </svg>
            </div>
            <div class="tier-label tier-label--spotlight">{{ $t('businessLanding.tiers.spotlight.label') }}</div>
            <div class="tier-price">{{ $t('businessLanding.tiers.spotlight.price') }}<span>{{ $t('businessLanding.tiers.spotlight.priceSuffix') }}</span></div>
            <h3>{{ $t('businessLanding.tiers.spotlight.heading') }}</h3>
            <p>{{ $t('businessLanding.tiers.spotlight.description') }}</p>
            <button class="tier-cta tier-cta--spotlight" @click="goApply('spotlight')">{{ $t('businessLanding.tiers.spotlight.cta') }}</button>
          </GoldCard>
          <!-- Signature -->
          <GoldCard class="feature-card">
            <div class="tier-icon tier-icon--signature">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#D4AF37">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="tier-label tier-label--signature">{{ $t('businessLanding.tiers.signature.label') }}</div>
            <div class="tier-price">{{ $t('businessLanding.tiers.signature.price') }}<span>{{ $t('businessLanding.tiers.signature.priceSuffix') }}</span></div>
            <h3>{{ $t('businessLanding.tiers.signature.heading') }}</h3>
            <p>{{ $t('businessLanding.tiers.signature.description') }}</p>
            <button class="tier-cta tier-cta--signature" @click="goApply('signature')">{{ $t('businessLanding.tiers.signature.cta') }}</button>
          </GoldCard>
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
          <a href="/business/terms">{{ $t('landing.footer.terms') }}</a>
          <a href="/business/privacy">{{ $t('landing.footer.privacy') }}</a>
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
import { isNightTime } from '@/utils/timeUtils'
import MagicButton from '@/components/ui/MagicButton.vue'
import GoldCard from '@/components/ui/GoldCard.vue'
import StarrySky from '@/components/ui/StarrySky.vue'
import DesertSky from '@/components/ui/DesertSky.vue'
export default {
  name: 'BusinessLanding',
  components: { MagicButton, GoldCard, StarrySky, DesertSky },
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
      { code: 'ar', flag: '🇸🇦', title: 'العربية' }
    ])
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
    const isNightMode = computed(() => isNightTime())
    const currentTheme = computed(() => isNightMode.value ? 'night-mode' : 'day-mode')
    onMounted(() => {
      if (store.state.i18n?.locale) selectedLanguage.value = store.state.i18n.locale
      showAllLanguages.value = false
      syncThemeColor()
    })
    watch(isNightMode, syncThemeColor)
    // Keep the browser chrome (mobile address-bar) + page background in sync with
    // the page's day/night look — same colors/approach App.vue + LandingPage use.
    const THEME_COLORS = { dark: '#0a0118', light: '#f9f5eb' }
    function syncThemeColor() {
      const theme = isNightMode.value ? 'dark' : 'light'
      const color = THEME_COLORS[theme]
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.backgroundColor = color
      let meta = document.querySelector('meta[name="theme-color"]:not([media])')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'theme-color')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', color)
    }
    onBeforeUnmount(() => { clearAutoCloseTimer() })
    function goHome()  { router.push('/') }
    function goApply(tier = 'verified') { router.push({ path: '/business/apply', query: { tier } }) }
    return {
      currentTheme, isNightMode,
      selectedLanguage, showAllLanguages, languageOptions,
      currentLanguageFlag, currentLanguageTitle,
      selectLanguage, toggleLanguageSelector, languageSelectorRef,
      goHome, goApply
    }
  }
}
</script>




<style scoped>
/* ── Base ──────────────────────────────────────────────────────────────────── */
.business-landing { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column; flex: 1 }
.hero, .features { position: relative; z-index: 2 }
/* ── Header ────────────────────────────────────────────────────────────────── */
.header-container { position: absolute; top: 0; left: 0; padding: 27px; z-index: 1000 }
.app-name { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 600; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,140,0,0.3) }
/* ── Language selector (mirrors LandingPage) ──────────────────────────────── */
.language-selector-container { position: fixed; top: 20px; right: 20px; z-index: 1001 }
.language-selector { display: flex; gap: 12px; background: rgba(26,9,51,0.5); padding: 10px; border-radius: 50px; backdrop-filter: blur(5px); border: 1px solid rgba(157,123,255,0.3); transition: all 0.3s ease; overflow: hidden }
.language-selector button { background: transparent; color: #9D7BFF; border: none; padding: 12px; border-radius: 50%; cursor: pointer; transition: transform 0.3s ease, background 0.3s ease; font-size: 24px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(157,123,255,0.2) }
.language-selector button:hover { transform: scale(1.1); background: rgba(157,123,255,0.2); box-shadow: 0 0 15px rgba(157,123,255,0.4) }
.language-selector button.active { background: rgba(157,123,255,0.3); box-shadow: 0 0 15px rgba(157,123,255,0.5); animation: pulse 0.5s ease }
.static-bottle { width: 150px; height: auto; max-height: 250px; margin: auto; display: block }
/* ── Hero — matches LandingPage hero exactly ──────────────────────────────── */
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2; padding: 2rem }
.hero-content { max-width: 800px; animation: fadeInUp 1s ease-out }
.magic-title { font-family: 'Cinzel', serif; font-size: 3.5rem; letter-spacing: 1px; margin-bottom: 0.5rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.magic-subtitle { font-family: 'Cinzel', serif; font-size: 1.3rem; max-width: 700px; margin: 0 auto 2rem; color: #e0e0e0; text-shadow: 0 0 7px rgba(255,255,255,0.3) }
.hero-note { font-family: 'Cinzel', serif; font-size: 0.78rem; opacity: 0.45; margin: 1rem 0 0; color: #e0e0e0 }
/* ── Features — matches LandingPage features section ─────────────────────── */
.features { padding: 1rem 2rem 4rem 2rem; position: relative; z-index: 2 }
.features-container { max-width: 1200px; margin: 0 auto }
.features-heading { font-family: 'Cinzel', serif; text-align: center; margin-bottom: 3rem; font-size: 2.5rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; position: relative }
/* Card base — matches LandingPage .feature-card */
.feature-card { background: rgba(25,25,35,0.15); backdrop-filter: blur(2px); box-shadow: none; border: none; position: relative; overflow: hidden }
.feature-card h3 { font-family: 'Cinzel', serif; font-size: 1.5rem; margin-bottom: 1rem; color: #FF8C00 }
.feature-card p  { font-family: 'Cinzel', serif; font-size: 1.05rem; line-height: 1.7; opacity: 0.85 }
/* Tier icon circle */
.tier-icon { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.tier-icon--verified  { background: rgba(76,175,80,0.12);  box-shadow: 0 0 14px rgba(76,175,80,0.25) }
.tier-icon--spotlight { background: rgba(59,158,221,0.12); box-shadow: 0 0 14px rgba(59,158,221,0.25) }
.tier-icon--signature { background: rgba(212,175,55,0.12); box-shadow: 0 0 16px rgba(212,175,55,0.35) }
/* Tier name label */
.tier-label { font-family: 'Cinzel', serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-align: center; margin-bottom: 6px }
.tier-label--verified  { color: #4CAF50 }
.tier-label--spotlight { color: #3b9edd }
.tier-label--signature { color: #D4AF37 }
/* Price */
.tier-price { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 800; text-align: center; margin-bottom: 0.6rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.tier-price span { font-size: 1rem; font-weight: 400; opacity: 1 }
/* CTA button inside each card */
.tier-cta { width: 100%; margin-top: 1.4rem; padding: 10px 0; border-radius: 50px; font-family: 'Cinzel', serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.3s ease; border: none }
.tier-cta--verified  { color: #4CAF50; border-color: rgba(76,175,80,0.45) }
.tier-cta--verified:hover  { background: rgba(76,175,80,0.12);  box-shadow: 0 0 12px rgba(76,175,80,0.2) }
.tier-cta--spotlight { color: #3b9edd; border-color: rgba(59,158,221,0.45) }
.tier-cta--spotlight:hover { background: rgba(59,158,221,0.12); box-shadow: 0 0 12px rgba(59,158,221,0.2) }
.tier-cta--signature { color: #D4AF37; border-color: rgba(212,175,55,0.45) }
.tier-cta--signature:hover { background: rgba(212,175,55,0.12); box-shadow: 0 0 14px rgba(212,175,55,0.25) }
.tier-cta { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); color: #D4AF37; box-shadow: 0 0 7px rgba(212,175,55,0.25) }
.tier-cta:hover {background: linear-gradient(45deg, rgba(255,140,0,0.1), rgba(255,140,0,0.2)); box-shadow: 0 0 7px rgba(212, 175, 55, 0.25) }
/* ── Mode switch pill (mirrors LandingPage exactly) ──────────────────────── */
.mode-switch-wrapper { display: flex; justify-content: center; padding: 0 0 4rem; position: relative; z-index: 2 }
.mode-switch-pill { display: inline-flex; align-items: center; gap: 2px; background: rgba(26,9,51,0.8); border-radius: 50px; padding: 4px; backdrop-filter: blur(10px); box-shadow: 0 0 12px rgba(212,175,55,0.1), 0 0 24px rgba(0,0,0,0.35) }
.mode-switch-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 20px; border-radius: 40px; border: none; background: transparent; font-family: 'Cinzel', serif; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; color: rgba(212,175,55,0.45); transition: all 0.25s ease; white-space: nowrap }
.mode-switch-btn:hover { color: #D4AF37; background: rgba(212,175,55,0.12); box-shadow: 0 0 10px rgba(212,175,55,0.12) }
.mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); color: #D4AF37; box-shadow: 0 0 14px rgba(212,175,55,0.25); cursor: default }
.mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); box-shadow: 0 0 14px rgba(212,175,55,0.25) }
/* ── Footer (mirrors LandingPage exactly) ────────────────────────────────── */
.footer { margin-top: auto; padding: 0.3rem 0.3rem; position: relative; z-index: 2; width: 100%; background: rgba(25,25,35,0.15); backdrop-filter: blur(2px) }
.footer-content { max-width: 1200px; margin: 0 auto; text-align: center }
.footer-links { display: flex; justify-content: center; gap: 2rem }
.footer-links a { color: #FF8C00; text-decoration: none; font-family: 'Cinzel', serif; font-size: 1.1rem; transition: all 0.3s ease; padding: 0.5rem }
.footer-copyright { color: rgba(224,224,224,0.7); font-family: 'Cinzel', serif; font-size: 0.9rem }
/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(50px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.1) } 100% { transform: scale(1) } }
/* ── Day mode ────────────────────────────────────────────────────────────── */
.day-mode .magic-subtitle { color: #5a3c2e; text-shadow: 0 0 7px rgba(255,255,255,0.4) }
.day-mode .hero-note { color: #5a3c2e }
.day-mode .feature-card { background: rgba(255,248,240,0.45); backdrop-filter: blur(6px) }
.day-mode .feature-card p { color: #5a3c2e }
.day-mode .feature-card h3 { color: #b87d4e }
.day-mode .tier-cta--verified  { color: #3a8f3e; border-color: rgba(58,143,62,0.45) }
.day-mode .tier-cta--spotlight { color: #2a7daa; border-color: rgba(42,125,170,0.45) }
.day-mode .tier-cta--signature { color: #7a3e1a; border-color: rgba(184,125,78,0.5) }
.day-mode .footer { background: rgba(255,248,240,0.4); backdrop-filter: blur(4px); border-top: 1px solid rgba(217,167,112,0.2) }
.day-mode .footer-links a { color: #b87d4e }
.day-mode .footer-copyright { color: #5a3c2e }
.day-mode .language-selector { background: rgba(255,248,240,0.5); border: 1.5px solid rgba(217,167,112,0.35); box-shadow: 0 0 15px rgba(184, 125, 78, 0.1) }
.day-mode .language-selector button { color: #b87d4e; box-shadow: 0 0 10px rgba(217, 167, 112, 0.15) }
.day-mode .language-selector button:hover { background: rgba(217,167,112,0.2); box-shadow: 0 0 15px rgba(217, 167, 112, 0.35); transform: scale(1.1) }
.day-mode .language-selector button.active { background: rgba(184,125,78,0.3); box-shadow: 0 0 20px rgba(184, 125, 78, 0.4); color: #8b5a3c }
.day-mode .mode-switch-pill { background: rgba(255,248,240,0.45); box-shadow: 0 0 18px rgba(160,100,30,0.09), 0 0 20px rgba(0,0,0,0.06) }
.day-mode .mode-switch-btn { color: rgba(150,90,25,0.45) }
.day-mode .mode-switch-btn:hover { background: rgba(160,100,30,0.13); box-shadow: 0 0 10px rgba(160,100,30,0.12) }
.day-mode .mode-switch-btn--active { background: linear-gradient(45deg, rgba(200,140,60,0.32), rgba(150,90,25,0.24)); color: #4a2600; box-shadow: 0 0 14px rgba(139,69,19,0.18) }
.day-mode .mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(200,140,60,0.32), rgba(150,90,25,0.24)); box-shadow: 0 0 14px rgba(139,69,19,0.18) }

/* ── Night mode ──────────────────────────────────────────────────────────── */
.night-mode .magic-subtitle { color: #f5e6c8; text-shadow: 0 0 7px rgba(255,200,120,0.25) }
.night-mode .hero-note { color: #f5e6c8 }
.night-mode .feature-card { background: rgba(20,10,45,0.55); backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,120,0.05) }
.night-mode .feature-card h3 { color: #FF8C00 }
.night-mode .feature-card p { color: #e8d9bb }
.night-mode .mode-switch-pill { background: rgba(20,10,45,0.7); border: none }
.night-mode .mode-switch-btn { color: rgba(245,230,200,0.55) }
.night-mode .mode-switch-btn:hover { color: #f5e6c8; background: rgba(212,175,55,0.15); box-shadow: 0 0 10px rgba(212,175,55,0.15) }
.night-mode .mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.32), rgba(255,140,0,0.22)); color: #fff3d4; box-shadow: 0 0 14px rgba(212,175,55,0.3) }
.night-mode .mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.32), rgba(255,140,0,0.22)); color: #fff3d4; box-shadow: 0 0 14px rgba(212,175,55,0.3) }
.night-mode .language-selector { background: rgba(20,10,45,0.7); border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.3) }
.night-mode .language-selector button { color: #f5e6c8; box-shadow: 0 0 10px rgba(212,175,55,0.1) }
.night-mode .language-selector button:hover { background: rgba(212,175,55,0.18); box-shadow: 0 0 15px rgba(212,175,55,0.3) }
.night-mode .language-selector button.active { background: rgba(212,175,55,0.25); box-shadow: 0 0 18px rgba(212,175,55,0.4) }
.night-mode .footer { background: rgba(20,10,45,0.45); backdrop-filter: blur(6px); border-top: none }
.night-mode .footer-links a { color: #FF8C00 }
.night-mode .footer-copyright { color: rgba(245,230,200,0.6) }
/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
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
</style>

<style>
/* ── Hide the page scrollbar (matches JinniChat's approach) ────────────────── */
/* Firefox */
html { scrollbar-width: none; -ms-overflow-style: none }
/* WebKit (Chrome, Safari, Edge) */
html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important }
</style>