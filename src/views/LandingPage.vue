<template>
  <div class="landing-container" :class="isNightMode ? '' : 'day-mode'">
    <StarrySky v-if="isNightMode" />
    <DesertSky v-else />
    <div class="header-container">
      <div class="app-name">Jinni</div>
    </div>
    <div class="language-selector-container">
      <div class="language-selector" ref="languageSelectorRef" @click.stop>
        <button v-if="showAllLanguages" v-for="lang in languageOptions" :key="lang.code" @click="selectLanguage(lang.code)" :title="lang.title" :class="{ active: selectedLanguage === lang.code }">
          {{ lang.flag }}
        </button>
        <button v-else @click="toggleLanguageSelector" :title="currentLanguageTitle">
          {{ currentLanguageFlag }}
        </button>
      </div>
    </div>
    <section class="hero">
      <div class="hero-content">
        <img src="/images/bottle.png?v=2" alt="Genie Bottle" class="static-bottle">
        <h1 class="magic-title">{{ $t('landing.hero.title') }}</h1>
        <p class="magic-subtitle">{{ $t('landing.hero.subtitle') }}</p>
        <MagicButton @click="openAuthModal">{{ $t('landing.hero.cta') }}</MagicButton>
      </div>
    </section>
    <section class="features">
      <div class="features-container">
        <h2 class="features-heading">{{ $t('landing.features.title') }}</h2>
        <div class="features-grid">
          <GoldCard v-for="(feature, index) in features" :key="index" class="feature-card">
            <h3>{{ $t(feature.title) }}</h3>
            <p>{{ $t(feature.description) }}</p>
          </GoldCard>
        </div>
      </div>
    </section>
    <div class="mode-switch-wrapper">
      <div class="mode-switch-pill">
        <button class="mode-switch-btn mode-switch-btn--active">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          {{ $t('landing.mode_switch.explore') }}
        </button>
        <button class="mode-switch-btn" @click="goBusinessLanding">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><path d="M2 12h20"/></svg>
          {{ $t('landing.mode_switch.for_business') }}
        </button>
      </div>
    </div>
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="/terms">{{ $t('landing.footer.terms') }}</a>
          <a href="/privacy">{{ $t('landing.footer.privacy') }}</a>
        </div>
        <p class="footer-copyright">{{ $t('landing.footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>



<script>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import MagicButton from '@/components/ui/MagicButton.vue'
import { useRouter } from 'vue-router'
import GoldCard from '@/components/ui/GoldCard.vue'
import AuthModal from '@/components/AuthModal.vue'
import StarrySky from '@/components/ui/StarrySky.vue'
import DaySky from "@/components/ui/DaySky.vue";
import DesertSky from '@/components/ui/DesertSky.vue'
export default {
  components: {
    MagicButton,
    GoldCard,
    AuthModal,
    StarrySky,
    DaySky,
    DesertSky
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const selectedLanguage = ref('en')
    const showAllLanguages = ref(true)
    const autoCloseTimer = ref(null)
    const languageSelectorRef = ref(null)
    const languageOptions = ref([
      { code: 'en', flag: '🇬🇧', title: 'English' },
      { code: 'fr', flag: '🇫🇷', title: 'Français' },
      { code: 'ru', flag: '🇷🇺', title: 'Русский' },
      { code: 'zh', flag: '🇨🇳', title: '中文' },
      { code: 'ar', flag: '🇸🇦', title: 'العربية' }
    ])
    const currentLanguageFlag = computed(() => {return languageOptions.value.find(l => l.code === selectedLanguage.value)?.flag || '🌐'})
    const currentLanguageTitle = computed(() => {return languageOptions.value.find(l => l.code === selectedLanguage.value)?.title || 'Select Language'})
    const startAutoCloseTimer = () => {
      clearAutoCloseTimer()
      autoCloseTimer.value = setTimeout(() => {showAllLanguages.value = false}, 3000)
    }
    const clearAutoCloseTimer = () => {
      if (autoCloseTimer.value) {
        clearTimeout(autoCloseTimer.value)
        autoCloseTimer.value = null
      }
    }
    // STORE theme, not the raw clock — same source as BusinessLanding and the
    // rest of the app ('auto' still resolves by clock inside the getter).
    // Keying this on the clock while /business keyed on the store made the
    // sky flip day/night when navigating between the two landings whenever a
    // manually chosen theme disagreed with the hour.
    const isNightMode = computed(() => store.getters['settings/effectiveTheme'] === 'dark')
    // Browser-chrome painting was removed here: App.vue now DERIVES the
    // chrome/canvas/backdrop colors from whatever the page actually renders
    // (getComputedStyle on the rendered sky), so the landing's clock-based
    // theme is picked up automatically — no separate edge pair to maintain,
    // and no second writer fighting App.vue over <html>/<body>/meta.
    const features = [
      {
        title: 'landing.features.ai.title',
        description: 'landing.features.ai.description'
      },
      {
        title: 'landing.features.gems.title',
        description: 'landing.features.gems.description'
      },
      {
        title: 'landing.features.business.title',
        description: 'landing.features.business.description'
      }
    ]
    const openAuthModal = () => {router.push('/auth')}
    const goBusinessLanding = () => {router.push('/business')}
    const selectLanguage = (lang) => {
      clearAutoCloseTimer()
      store.dispatch('i18n/changeLanguage', lang)
      selectedLanguage.value = lang
      showAllLanguages.value = false
    }
    const toggleLanguageSelector = () => {
      showAllLanguages.value = true
      startAutoCloseTimer()
    }
    const handleClickOutside = (event) => {
      showAllLanguages.value = false
      clearAutoCloseTimer()
    }
    watch(showAllLanguages, (newValue) => {
      if (newValue) {
        startAutoCloseTimer()
        setTimeout(() => {document.addEventListener('click', handleClickOutside, { once: true })}, 0)
      } else {clearAutoCloseTimer()}
    })
    onMounted(() => {
      if (store.state.i18n?.locale) {selectedLanguage.value = store.state.i18n.locale}
      showAllLanguages.value = false
    })
    onBeforeUnmount(() => {clearAutoCloseTimer()})
    return {
      features,
      languageOptions,
      selectedLanguage,
      showAllLanguages,
      currentLanguageFlag,
      currentLanguageTitle,
      openAuthModal,
      goBusinessLanding,
      selectLanguage,
      toggleLanguageSelector,
      languageSelectorRef,
      isNightMode
    }
  }
}
</script>




<style scoped>
.landing-container { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column }
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2; padding: 2rem }
.hero, .features { position: relative; z-index: 2 }
.hero-content { max-width: 800px; animation: fadeInUp 1s ease-out }
.static-bottle { width: 150px; height: auto; max-height: 250px; margin: auto; display: block }
.hero h1 { font-size: 3.5rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.hero p { font-size: 1.3rem; margin-bottom: 2rem; color: #e0e0e0 }
.features { padding: 1rem 2rem 4rem 2rem; position: relative; z-index: 2 }
.features-container { max-width: 1200px; margin: 0 auto }
.features-heading { text-align: center; margin-bottom: 3rem }
.features h2 { font-family: 'Cinzel', serif; font-style: normal; font-size: 2.5rem; margin-bottom: 2rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; position: relative }
.feature-card { background: rgba(25,25,35,0.15); backdrop-filter: blur(2px); box-shadow: none; border: none; position: relative; overflow: hidden }
.feature-card p { font-family: 'Cinzel', serif; font-size: 1.1rem }
.feature-card h3 { font-family: 'Cinzel', serif; font-size: 1.5rem; margin-bottom: 1rem; color: #FF8C00 }
.demo h2 { font-size: 2.5rem; margin-bottom: 2rem; color: #D4AF37 }
.header-container { position: absolute; top: 0; left: 0; padding: 27px; z-index: 1000 }
.app-name { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 600; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 1px }
.language-selector-container { position: fixed; top: 20px; right: 20px; z-index: 1001 }
.language-selector { display: flex; gap: 12px; background: rgba(26,9,51,0.5); padding: 10px; border-radius: 50px; backdrop-filter: blur(5px); border: 1px solid rgba(157,123,255,0.3); transition: all 0.3s ease; overflow: hidden }
.language-selector button { background: transparent; color: #9D7BFF; border: none; padding: 12px; border-radius: 50%; cursor: pointer; transition: transform 0.3s ease, background 0.3s ease, opacity 0.3s ease; font-size: 24px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(157,123,255,0.2) }
.language-selector button:hover { transform: scale(1.1); background: rgba(157,123,255,0.2); box-shadow: 0 0 15px rgba(157,123,255,0.4) }
.language-selector button.active { background: rgba(157,123,255,0.3); box-shadow: 0 0 15px rgba(157,123,255,0.5); animation: pulse 0.5s ease }
.magic-title { font-family: 'Cinzel', serif; font-size: 4rem; letter-spacing: 1px }
.magic-subtitle { font-family: 'Cinzel', serif; font-size: 1.5rem; max-width: 700px; margin: 0 auto 2rem; text-shadow: 0 0 7px rgba(255,255,255,0.3) }
/* ── Mode switch pill ──────────────────────────────────────────────────────── */
.mode-switch-wrapper { display: flex; justify-content: center; padding: 0 0 4rem; position: relative; z-index: 2 }
.mode-switch-pill { display: inline-flex; align-items: center; gap: 2px; background: rgba(26,9,51,0.8); border-radius: 50px; padding: 4px; backdrop-filter: blur(10px); box-shadow: 0 0 12px rgba(212,175,55,0.1), 0 0 24px rgba(0,0,0,0.35) }
.mode-switch-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 20px; border-radius: 40px; border: none; background: transparent; font-family: 'Cinzel', serif; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; color: rgba(212,175,55,0.45); transition: all 0.25s ease; white-space: nowrap }
.mode-switch-btn:hover { color: #D4AF37; background: rgba(212,175,55,0.12); box-shadow: 0 0 10px rgba(212,175,55,0.12) }
.mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); color: #D4AF37; box-shadow: 0 0 14px rgba(212,175,55,0.25); cursor: default }
.mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); box-shadow: 0 0 14px rgba(212,175,55,0.25) }
.footer { margin-top: auto; padding: 0.3rem 0.3rem; position: relative; z-index: 2; width: 100%; background: rgba(25,25,35,0.15); backdrop-filter: blur(2px) }
.footer-content { max-width: 1200px; margin: 0 auto; text-align: center }
.footer-links { display: flex; justify-content: center; gap: 2rem }
.footer-links a { color: #FF8C00; text-decoration: none; font-family: 'Cinzel', serif; font-size: 1.1rem; transition: all 0.3s ease; position: relative; padding: 0.5rem }
.footer-copyright { color: rgba(224,224,224,0.7); font-family: 'Cinzel', serif; font-size: 0.9rem }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(50px) } to { opacity: 1; transform: translateY(0) } }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.1) } 100% { transform: scale(1) } }
/* ── Day mode ──────────────────────────────────────────────────────────────── */
.day-mode .hero p, .day-mode .footer-copyright { color: #5a3c2e; text-shadow: 0 0 2px rgba(255,255,255,0.3) }
.day-mode .magic-subtitle { color: #5a3c2e; text-shadow: 0 0 7px rgba(255,255,255,0.4) }
.day-mode .feature-card { background: rgba(255,248,240,0.45); backdrop-filter: blur(6px); border-image: linear-gradient(145deg, #d9a770, #c9915f, #b87d4e) 1 }
.day-mode .feature-card p { color: #5a3c2e }
.day-mode .feature-card h3 { color: #b87d4e; text-shadow: 0 0 2px rgba(255,255,255,0.3) }
.day-mode .footer { background: rgba(255,248,240,0.4); backdrop-filter: blur(4px); border-top: 1px solid rgba(217,167,112,0.2) }
.day-mode .footer-links a { color: #b87d4e }
.day-mode .footer-links a:hover { color: #a06c42; text-shadow: 0 0 10px rgba(184,125,78,0.3) }
.day-mode .language-selector { background: rgba(255,248,240,0.5); border: 1.5px solid rgba(217,167,112,0.35); box-shadow: 0 4px 15px rgba(184,125,78,0.1) }
.day-mode .language-selector button { color: #b87d4e; box-shadow: 0 0 10px rgba(217,167,112,0.15) }
.day-mode .language-selector button:hover { background: rgba(217,167,112,0.2); box-shadow: 0 0 15px rgba(217,167,112,0.35); transform: scale(1.1) }
.day-mode .language-selector button.active { background: rgba(184,125,78,0.3); box-shadow: 0 0 20px rgba(184,125,78,0.4); color: #8b5a3c }
.day-mode .button-glow-wrapper { filter: drop-shadow(0 0 25px rgba(212,175,55,0.4)) drop-shadow(0 0 50px rgba(255,140,0,0.3)) }
.day-mode .mode-switch-pill { background: rgba(255,248,240,0.45); box-shadow: 0 0 18px rgba(160,100,30,0.09), 0 0 20px rgba(0,0,0,0.06) }
.day-mode .mode-switch-btn { color: rgba(150,90,25,0.45) }
.day-mode .mode-switch-btn:hover { background: rgba(160,100,30,0.13); box-shadow: 0 0 10px rgba(160,100,30,0.12) }
.day-mode .mode-switch-btn--active { background: linear-gradient(45deg, rgba(200,140,60,0.32), rgba(150,90,25,0.24)); color: #4a2600; box-shadow: 0 0 14px rgba(139,69,19,0.18) }
.day-mode .mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(200,140,60,0.32), rgba(150,90,25,0.24)); box-shadow: 0 0 14px rgba(139,69,19,0.18) }

/* ── Night mode explicit colors (override inherited body color) ───────────── */
.landing-container:not(.day-mode) .magic-subtitle { color: #f5e6c8; text-shadow: 0 0 7px rgba(255,200,120,0.25) }
.landing-container:not(.day-mode) .feature-card { background: rgba(20,10,45,0.55); backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,120,0.05) }
.landing-container:not(.day-mode) .feature-card h3 { color: #FF8C00 }
.landing-container:not(.day-mode) .feature-card p { color: #e8d9bb }
.landing-container:not(.day-mode) .mode-switch-pill { background: rgba(20,10,45,0.7); border: none }
.landing-container:not(.day-mode) .mode-switch-btn { color: rgba(245,230,200,0.55) }
.landing-container:not(.day-mode) .mode-switch-btn:hover { color: #f5e6c8; background: rgba(212,175,55,0.15); box-shadow: 0 0 10px rgba(212,175,55,0.15) }
.landing-container:not(.day-mode) .mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.32), rgba(255,140,0,0.22)); color: #fff3d4; box-shadow: 0 0 14px rgba(212,175,55,0.3) }
.landing-container:not(.day-mode) .mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.32), rgba(255,140,0,0.22)); color: #fff3d4; box-shadow: 0 0 14px rgba(212,175,55,0.3) }
.landing-container:not(.day-mode) .language-selector { background: rgba(20,10,45,0.7); border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.3) }
.landing-container:not(.day-mode) .language-selector button { color: #f5e6c8; box-shadow: 0 0 10px rgba(212,175,55,0.1) }
.landing-container:not(.day-mode) .language-selector button:hover { background: rgba(212,175,55,0.18); box-shadow: 0 0 15px rgba(212,175,55,0.3) }
.landing-container:not(.day-mode) .language-selector button.active { background: rgba(212,175,55,0.25); box-shadow: 0 0 18px rgba(212,175,55,0.4) }
.landing-container:not(.day-mode) .footer { background: rgba(20,10,45,0.45); backdrop-filter: blur(6px); border-top: none }
.landing-container:not(.day-mode) .footer-copyright { color: rgba(245,230,200,0.6) }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero h1 { font-size: 2.5rem }
  .hero p { font-size: 1.1rem }
  .features h2, .demo h2 { font-size: 2rem }
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