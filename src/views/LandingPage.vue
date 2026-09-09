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
        <img src="/images/bottle.png?v=3" alt="Genie Bottle" class="static-bottle">
        <h1 class="magic-title" v-html="heroTitleHtml"></h1>
        <p class="magic-subtitle">{{ $t('landing.hero.subtitle') }}</p>
        <MagicButton @click="openAuthModal"><span class="wish-label">{{ $t('landing.hero.cta') }}</span></MagicButton>
      </div>
    </section>
    <section class="features">
      <div class="features-container">
        <h2 class="features-heading" v-html="featuresTitleHtml"></h2>
        <div class="features-grid">
          <div v-for="(feature, index) in features" :key="index" class="wish-item">
            <span class="wish-num">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ $t(feature.title) }}</h3>
            <p>{{ $t(feature.description) }}</p>
          </div>
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
          <a href="/terms"><span class="lbl-full">{{ $t('terms.title') }}</span><span class="lbl-short">{{ $t('landing.footer.terms') }}</span></a>
          <a href="/privacy"><span class="lbl-full">{{ $t('privacy.title') }}</span><span class="lbl-short">{{ $t('landing.footer.privacy') }}</span></a>
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
import AuthModal from '@/components/AuthModal.vue'
import StarrySky from '@/components/ui/StarrySky.vue'
import DaySky from "@/components/ui/DaySky.vue";
import DesertSky from '@/components/ui/DesertSky.vue'
export default {
  computed: {
    // Only the brand word carries the gradient; the rest of the sentence is
    // dark ink in day mode. The source is our own locale string, escaped
    // before the one substitution, so v-html can never carry foreign markup.
    // The features heading splits at its separator (every locale has one:
    // ',' '—' '،' '，'): the promise stays dark ink, the payoff takes the
    // gradient. Escaped first, so v-html can only ever emit our own markup.
    featuresTitleHtml() {
      const raw = String(this.$t('landing.features.title') || '');
      const esc = raw.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const m = esc.match(/^(.*?[,—،，])\s*(.+)$/);
      return m ? `${m[1]} <span class="brand-grad">${m[2]}</span>` : esc;
    },
    heroTitleHtml() {
      const raw = String(this.$t('landing.hero.title') || '');
      const esc = raw.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      return esc.replace(/Jinni/g, '<span class="brand-grad">Jinni</span>');
    },
  },
  components: {
    MagicButton,
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
      { code: 'ar', flag: '🇸🇦', title: 'العربية' },
      { code: 'hy', flag: '🇦🇲', title: 'Հայերեն' }
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
/* Hero title, day mode (founder 2026-09-09): the full gradient sat at ~2:1
   contrast on cream. Dark ink for the sentence, gradient kept for the brand
   word only — more readable AND more brand-forward. Night is untouched. */
.day-mode .magic-title { background: none; -webkit-text-fill-color: initial; color: #4a3226 }
.day-mode .features-heading { background: none; -webkit-text-fill-color: initial; color: #4a3226 }
/* :deep — v-html content carries NO scope attribute, so a plain scoped
   descendant rule never matches this span. */
.magic-title :deep(.brand-grad), .features-heading :deep(.brand-grad) { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }

/* Wish button, day mode (founder's pick): the glacier glass of the Discovery
   chips, with the label in the brand gradient. A gradient text-clip needs the
   element's own background, so the glass lives on the button and the gradient
   on the label span. Even shadow; hover changes light only, nothing moves.
   Night mode is deliberately untouched. */
.day-mode .hero .magic-button {
  background: rgba(255, 251, 245, 0.6);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  backdrop-filter: blur(14px) saturate(160%);
  box-shadow: inset 0 0 0 1px rgba(184, 125, 78, 0.35), 0 0 16px -2px rgba(120, 80, 30, 0.16);
  padding: 14px 32px;
}
.day-mode .hero .magic-button:hover {
  background: rgba(255, 251, 245, 0.86);
  box-shadow: inset 0 0 0 1px rgba(184, 125, 78, 0.5), 0 0 22px -2px rgba(120, 80, 30, 0.22);
}
.day-mode .hero .wish-label {
  background: linear-gradient(45deg, #D4AF37, #FF8C00);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  font-weight: 600;
}

.landing-container { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column }
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2 }
.hero, .features { position: relative; z-index: 2 }
.hero-content { max-width: 800px; animation: fadeInUp 1s ease-out }
.static-bottle { width: 150px; height: auto; max-height: 250px; margin: auto; display: block }
.hero h1 { font-size: 3.5rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.hero p { font-size: 1.3rem; margin-bottom: 2rem; color: #e0e0e0 }
.features { padding: 2rem 1rem 4rem 1rem; position: relative; z-index: 2 }
.features-container { max-width: 1200px; margin: 0 auto }
.features-heading { text-align: center; margin-bottom: 3rem }
.features h2 { font-family: 'Cinzel', serif; font-style: normal; font-size: 2.5rem; margin-bottom: 2rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
/* Manifest features (founder 2026-09-09): the boxes are gone. Translucent
   cards on a peach sky sat under 1.2:1 contrast and read as stains; three
   numbered columns divided by hairlines carry the section on type alone —
   and the numerals finally deliver the "three wishes" the heading promises.
   Body copy leaves Cinzel, which is a display face and slows paragraphs. */
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); position: relative }
.wish-item { padding: 6px 30px }
.wish-num { display: block; font-family: 'Cinzel', serif; font-size: 2.6rem; font-weight: 700; line-height: 1; margin-bottom: 12px; font-variant-numeric: tabular-nums }
.wish-item h3 { font-family: 'Cinzel', serif; font-size: 1.4rem; margin-bottom: 10px }
.wish-item p { font-size: 1.02rem; line-height: 1.55 }
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
.footer { margin-top: auto; padding: 0.3rem 0.3rem; position: relative; z-index: 2; width: 100%; }
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
.day-mode .wish-item { border-left: 1px solid rgba(150,100,55,0.28) }
.day-mode .wish-item:first-child { border-left: none; padding-left: 0 }
.day-mode .wish-item:last-child { padding-right: 0 }
.day-mode .wish-num { color: rgba(168,114,15,0.34) }
.day-mode .wish-item h3 { color: #4a3226 }
.day-mode .wish-item p { color: #6b4a36 }
.day-mode .footer-links a { color: #b87d4e }
.day-mode .footer-links a:hover { color: #a06c42; text-shadow: 0 0 10px rgba(184,125,78,0.3) }
/* Glacier glass, same recipe as the wish button: the hard 1.5px border and
   the downward-offset shadow are replaced by an inset hairline and an even
   glow, so the pill reads as frosted material rather than an outlined box. */
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

/* ── Night mode explicit colors (override inherited body color) ───────────── */
.landing-container:not(.day-mode) .magic-subtitle { color: #f5e6c8; text-shadow: 0 0 7px rgba(255,200,120,0.25) }
.landing-container:not(.day-mode) .wish-item { border-left: 1px solid rgba(212,175,55,0.22) }
.landing-container:not(.day-mode) .wish-item:first-child { border-left: none; padding-left: 0 }
.landing-container:not(.day-mode) .wish-item:last-child { padding-right: 0 }
.landing-container:not(.day-mode) .wish-num { color: rgba(212,175,55,0.38) }
.landing-container:not(.day-mode) .wish-item h3 { color: #f0d9a8 }
.landing-container:not(.day-mode) .wish-item p { color: #e8d9bb }
.landing-container:not(.day-mode) .mode-switch-pill { background: rgba(20,10,45,0.7); border: none }
.landing-container:not(.day-mode) .mode-switch-btn { color: rgba(245,230,200,0.55) }
.landing-container:not(.day-mode) .mode-switch-btn:hover { color: #f5e6c8; background: rgba(212,175,55,0.15); box-shadow: 0 0 10px rgba(212,175,55,0.15) }
.landing-container:not(.day-mode) .mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.32), rgba(255,140,0,0.22)); color: #fff3d4; box-shadow: 0 0 14px rgba(212,175,55,0.3) }
.landing-container:not(.day-mode) .mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.32), rgba(255,140,0,0.22)); color: #fff3d4; box-shadow: 0 0 14px rgba(212,175,55,0.3) }
/* ── Night mode, matching the day pass (founder 2026-09-09) ──
   Same three moves: glacier glass on the wish button and the language pill
   (night tint: violet-ink glass with a lilac hairline, the app's night
   chip recipe), and the headings in light ink with only the brand word /
   the payoff carrying the gradient. */
.landing-container:not(.day-mode) .language-selector { background: rgba(40,30,62,0.55); border: none; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); box-shadow: inset 0 0 0 1px rgba(233,196,124,0.26), 0 0 16px -2px rgba(0,0,0,0.35) }
.landing-container:not(.day-mode) .language-selector:hover { background: rgba(48,36,74,0.7); box-shadow: inset 0 0 0 1px rgba(233,196,124,0.4), 0 0 20px -2px rgba(0,0,0,0.4) }
.landing-container:not(.day-mode) .language-selector button { box-shadow: none }
.landing-container:not(.day-mode) .language-selector button:hover { background: rgba(233,196,124,0.14); box-shadow: inset 0 0 0 1px rgba(233,196,124,0.3); transform: none }
.landing-container:not(.day-mode) .language-selector button.active { background: rgba(233,196,124,0.2); box-shadow: inset 0 0 0 1px rgba(233,196,124,0.45) }

.landing-container:not(.day-mode) .hero .magic-button {
  background: rgba(52,38,80,0.62);
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
  box-shadow: inset 0 0 0 1px rgba(233,196,124,0.3), 0 0 20px -2px rgba(0,0,0,0.42);
  padding: 14px 32px;
}
.landing-container:not(.day-mode) .hero .magic-button:hover {
  background: rgba(66,49,100,0.78);
  box-shadow: inset 0 0 0 1px rgba(233,196,124,0.5), 0 0 26px -2px rgba(0,0,0,0.45);
}
.landing-container:not(.day-mode) .hero .wish-label {
  background: linear-gradient(45deg, #D4AF37, #FF8C00);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  font-weight: 600;
}
.landing-container:not(.day-mode) .magic-title,
.landing-container:not(.day-mode) .features-heading { background: none; -webkit-text-fill-color: initial; color: #f4e7c9 }

/* ── Night atmosphere (founder 2026-09-09: "night is not aesthetic like day") ──
   The gap was never colour. Day has a smooth cream→peach gradient that
   organises the page: content sits inside soft light. Night had text floating
   on flat star noise — no depth, no focus, nothing lit. So night gets the same
   organising light, sourced from the object the brand is about: a warm pool
   spilling from the lamp, plus a vignette that darkens the far corners so the
   eye is pulled to the middle and the stars stop competing with the words. */
.landing-container:not(.day-mode) .hero::before,
.landing-container:not(.day-mode) .features::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
}
.landing-container:not(.day-mode) .hero::before {
  background:
    radial-gradient(46% 38% at 50% 38%, rgba(255,196,110,0.16) 0%, rgba(255,190,105,0.07) 38%, rgba(255,190,105,0) 70%),
    radial-gradient(115% 85% at 50% 40%, rgba(6,2,20,0) 42%, rgba(6,2,20,0.5) 100%);
}
.landing-container:not(.day-mode) .features::before {
  background:
    radial-gradient(60% 50% at 50% 30%, rgba(255,196,110,0.09) 0%, rgba(255,190,105,0) 72%),
    radial-gradient(120% 90% at 50% 45%, rgba(6,2,20,0) 40%, rgba(6,2,20,0.55) 100%);
}
.landing-container:not(.day-mode) .hero-content,
.landing-container:not(.day-mode) .features-container { position: relative; z-index: 1 }

/* Lit, not merely light: the headline gains a faint warm bloom, the way type
   behaves when a lamp is actually in the room. */
.landing-container:not(.day-mode) .magic-title { color: #fbf2df; text-shadow: 0 0 26px rgba(255,190,95,0.2) }
.landing-container:not(.day-mode) .features-heading { color: #f8ecd3; text-shadow: 0 0 22px rgba(255,190,95,0.16) }
.landing-container:not(.day-mode) .hero .magic-button { box-shadow: inset 0 0 0 1px rgba(233,196,124,0.32), 0 0 34px -8px rgba(255,186,88,0.45), 0 0 20px -2px rgba(0,0,0,0.42) }
.landing-container:not(.day-mode) .hero .magic-button:hover { box-shadow: inset 0 0 0 1px rgba(233,196,124,0.5), 0 0 44px -6px rgba(255,186,88,0.6), 0 0 24px -2px rgba(0,0,0,0.45) }

/* ── Starfield palette (founder 2026-09-09) ──
   The night page was one temperature: everything beige on indigo, so the
   numerals came out muddy brown and the orange footer links shouted. Two
   temperatures instead — warm gold carries meaning (headings, the brand,
   the accent half of a heading), cool lavender carries structure (numerals,
   rules, body copy, links). That's the sky's own contrast: starlight against
   a violet ground, with gold only where the lamp light falls. */
.landing-container:not(.day-mode) .wish-num {
  background: linear-gradient(180deg, rgba(252,243,220,0.58), rgba(233,196,124,0.2));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.landing-container:not(.day-mode) .wish-item { border-left-color: rgba(240,218,170,0.2) }
.landing-container:not(.day-mode) .wish-item h3 { color: #f0dcae }
.landing-container:not(.day-mode) .wish-item p { color: #e4d7bd }
.landing-container:not(.day-mode) .magic-subtitle { color: #ead9b8; text-shadow: 0 0 14px rgba(212,175,55,0.18) }

/* Footer: lavender at rest, warming to gold on hover — the link behaves like
   a star catching the lamp. The flat #FF8C00 was the loudest thing on the page. */
.landing-container:not(.day-mode) .footer-links a { color: #dcb977 }
.landing-container:not(.day-mode) .footer-links a:hover { color: #f7dc9c; text-shadow: 0 0 12px rgba(212,175,55,0.4) }
.landing-container:not(.day-mode) .footer-copyright { color: rgba(234,217,184,0.55) }

/* Mode switch: violet glass to match the button and the language pill; the
   selected side keeps the gold lettering so the choice still reads as lit. */
.landing-container:not(.day-mode) .mode-switch-pill { background: rgba(40,30,62,0.55); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); box-shadow: inset 0 0 0 1px rgba(233,196,124,0.24), 0 0 18px -2px rgba(0,0,0,0.4) }
.landing-container:not(.day-mode) .mode-switch-btn { color: #d9c8a2 }
.landing-container:not(.day-mode) .mode-switch-btn:hover { color: #f5e3ba; background: rgba(233,196,124,0.12); box-shadow: none }
.landing-container:not(.day-mode) .mode-switch-btn--active,
.landing-container:not(.day-mode) .mode-switch-btn--active:hover { background: rgba(233,196,124,0.18); color: #f7e3b4; box-shadow: inset 0 0 0 1px rgba(233,196,124,0.42) }
.landing-container:not(.day-mode) .language-selector button { color: #f5e6c8; box-shadow: 0 0 10px rgba(212,175,55,0.1) }
.landing-container:not(.day-mode) .language-selector button:hover { background: rgba(212,175,55,0.18); box-shadow: 0 0 15px rgba(212,175,55,0.3) }
.landing-container:not(.day-mode) .language-selector button.active { background: rgba(212,175,55,0.25); box-shadow: 0 0 18px rgba(212,175,55,0.4) }
.landing-container:not(.day-mode) .footer-copyright { color: rgba(245,230,200,0.6) }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  /* One column: the vertical hairline becomes a horizontal one between items. */
  .features-grid { grid-template-columns: 1fr }
  .wish-item { padding: 20px 0 }
  .day-mode .wish-item, .landing-container:not(.day-mode) .wish-item { border-left: none; border-top: 1px solid rgba(150,100,55,0.26) }
  .landing-container:not(.day-mode) .wish-item { border-top-color: rgba(212,175,55,0.2) }
  .day-mode .wish-item:first-child, .landing-container:not(.day-mode) .wish-item:first-child { border-top: none; padding-top: 0 }
  .wish-num { font-size: 2.1rem; margin-bottom: 8px }
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

/* Below-sky continuation — DesertSky's ending peach (Discovery-style fix) */
.landing-container.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}
</style>

<style>
/* ── Hide the page scrollbar (matches JinniChat's approach) ────────────────── */
/* Firefox */
html { scrollbar-width: none; -ms-overflow-style: none }
/* WebKit (Chrome, Safari, Edge) */
html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important }
</style>