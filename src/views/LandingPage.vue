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
      <!-- day only: the sand arrives, builds the lamp, and stops for good -->
      <!-- `&& lampEl`: template refs are only assigned after the first render,
           so without this the component mounts with a null lamp and silently
           does nothing -->
      <DesertSand v-if="isDayMode && lampEl" :lamp-el="lampEl" />
      <div class="hero-content">
        <span class="lamp" ref="lampEl"><img src="/images/bottle.png?v=3" alt="Jinni — the AI travel guide's genie lamp" class="static-bottle"></span>
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
import DesertSand from '@/components/ui/DesertSand.vue'
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
    DesertSky,
    DesertSand
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
    const isDayMode = computed(() => !isNightMode.value)
    const lampEl = ref(null)
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
      isNightMode,
      isDayMode,
      lampEl
    }
  }
}
</script>




<style scoped>
/* Hero title, day mode (founder 2026-09-09): the full gradient sat at ~2:1
   contrast on cream. Dark ink for the sentence, gradient kept for the brand
   word only — more readable AND more brand-forward. Night is untouched. */
/* Founder 2026-09-11: #4a3226 was a cocoa brown — the one warm colour on the
   page that belonged to no light source. The headings take the lamp's own
   burnt end instead, the shadow side of the metal rather than a new hue. It
   is the deepest stop of the lamp and still clears 4.5:1 on the peach sky;
   the bright half of the brand gradient sits under 2:1 there and cannot be
   used for running type. */
.day-mode .magic-title { background: none; -webkit-text-fill-color: initial; color: #732F06 }
.day-mode .features-heading { background: none; -webkit-text-fill-color: initial; color: #732F06 }
/* :deep — v-html content carries NO scope attribute, so a plain scoped
   descendant rule never matches this span. */
.magic-title :deep(.brand-grad), .features-heading :deep(.brand-grad) { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }

/* Wish button, day mode (founder's pick): the glacier glass of the Discovery
   chips, with the label in the brand gradient. A gradient text-clip needs the
   element's own background, so the glass lives on the button and the gradient
   on the label span. Even shadow; hover changes light only, nothing moves.
   Night mode is deliberately untouched. */
.day-mode .hero .magic-button {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; padding: 14px 8px 22px; position: relative;
  font-size: 1.32rem; letter-spacing: 0.01em;
}
.day-mode .hero .magic-button::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 10px; height: 1.5px;
  background: rgba(115, 47, 6, 0.8); box-shadow: 0 0 12px rgba(214, 120, 40, 0.4);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.day-mode .hero .magic-button:hover { background: transparent; box-shadow: none }
.day-mode .hero .magic-button:hover::after { background: #732F06; box-shadow: 0 0 16px rgba(214, 120, 40, 0.6) }
/* Solid, exactly as night's is, and for night's reason: a gradient text-clip
   paints over a transparent fill, so it can carry neither a glow nor enough
   contrast here — the bright half of the brand gradient falls under 2:1 on
   the sand. */
.day-mode .hero .wish-label {
  background: none; -webkit-text-fill-color: initial; color: #732F06; font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 224, 176, 0.7);
}

.landing-container { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column }
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2 }
.hero, .features { position: relative; z-index: 2 }
.hero-content { max-width: 800px; animation: fadeInUp 1s ease-out }
.lamp { position: relative; display: block; width: 150px; margin: auto }
.static-bottle { width: 100%; height: auto; max-height: 250px; display: block }
/* Colour ON the metal, not only behind it: the lamp's own silhouette masks a
   gradient that is blended INTO the image, so the body carries a lit edge and
   a deep base instead of reading as one flat orange. Night takes the sky's
   violet in its shadow; day takes the ground's terracotta. */
.lamp::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  -webkit-mask-image: url('/images/bottle.png?v=3'); mask-image: url('/images/bottle.png?v=3');
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
.landing-container:not(.day-mode) .lamp::after {
  background: linear-gradient(148deg,
    rgba(255,244,214,0.85) 0%, rgba(255,178,96,0.28) 38%,
    rgba(120,70,170,0.42) 72%, rgba(48,22,86,0.62) 100%);
}
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
.wish-item p { font-size: 1.02rem; line-height: 1.55; text-wrap: pretty }
.demo h2 { font-size: 2.5rem; margin-bottom: 2rem; color: #D4AF37 }
.header-container { position: absolute; top: 0; left: 0; padding: 27px; z-index: 1000 }
.app-name { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 600; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 1px }
.language-selector-container { position: fixed; top: 20px; right: 20px; z-index: 1001 }
/* No capsule, no ring (founder 2026-09-11): the flags sit in a row and the
   chosen one is LIT — the same grammar the CTAs and the mode switch use. A
   flag emoji is a rectangular colour bitmap, so light can never be drawn ON
   the glyph (a filter traces its box and the halo comes out square); the rule
   underneath carries the state instead. */
.language-selector { display: flex; gap: 14px; background: transparent; padding: 0; border: none; border-radius: 0; backdrop-filter: none; -webkit-backdrop-filter: none; overflow: visible; transition: none }
.language-selector button {
  background: transparent; border: none; box-shadow: none; border-radius: 0;
  padding: 6px 2px 12px; width: 44px; height: 40px; font-size: 24px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; position: relative;
  opacity: 0.5; transition: opacity 0.3s ease;
}
/* Same rule as every other control — 1.5px, 6px off the bottom — but drawn to
   the FLAG, not to the button. The button is 44px because a tap target has to
   be; the glyph inside it is about 30px, and a rule run to the button's full
   width overhangs the flag at both ends and reads as a stray line. Every other
   control on the page has a label as wide as itself, so there the two are the
   same measurement; here they are not. */
.language-selector button::after {
  content: ''; position: absolute; left: 7px; right: 7px; bottom: 6px; height: 1.5px;
  background: transparent; transition: background 0.3s ease, box-shadow 0.3s ease;
}
/* Nothing moves under the pointer — light only. */
.language-selector button:hover { opacity: 0.85; transform: none; background: transparent; box-shadow: none }
.language-selector button.active { opacity: 1; background: transparent; box-shadow: none; animation: none }
/* Collapsed, the row is a single flag: it is neither dimmed nor unlit — it is
   the current language, and it carries the same rule every other control does.
   Opening the row is what introduces unchosen siblings to dim. */
.language-selector button:only-child { opacity: 1 }
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
.day-mode .wish-num { color: rgba(130,82,14,0.62) }
.day-mode .wish-item h3 { color: #4a3226 }
.day-mode .wish-item p { color: #6b4a36 }
/* #b87d4e is the same value as the peach behind it — mid-tone on
   mid-tone, so the links nearly vanished on the lower half of the page. */
.day-mode .footer-links a { color: #7a4a24 }
.day-mode .footer-links a:hover { color: #5c3416; text-shadow: 0 0 10px rgba(255,255,255,0.35) }
/* Glacier glass, same recipe as the wish button: the hard 1.5px border and
   the downward-offset shadow are replaced by an inset hairline and an even
   glow, so the pill reads as frosted material rather than an outlined box. */
/* Same three rings as the wish button, so the pill is the same ice. */
.day-mode .language-selector button { color: #732F06 }
.day-mode .language-selector button:hover::after { background: rgba(115,47,6,0.35) }
.day-mode .language-selector button.active::after,
.day-mode .language-selector button:only-child::after { background: rgba(115,47,6,0.85); box-shadow: 0 0 12px rgba(214,120,40,0.5) }
/* The 44px glow drew a RECTANGLE around the lamp (founder 2026-09-11). Not a
   filter bug: .lamp::after blends with mix-blend-mode, which forces this whole
   subtree into its own blending group, and that group is the 150x150 .lamp box
   — so a glow wider than the box is clipped to it and the clip is a straight
   edge. Measured: with these radii the falloff completes inside the box and
   the edge reads 0,0,0 against the sky on all three sides. The 0 3px offset
   went too: shadows here are even on all sides, never dropped down. */
.day-mode .static-bottle {
  filter: drop-shadow(0 0 8px rgba(255,170,80,0.45))
          drop-shadow(0 0 18px rgba(206,96,26,0.22));
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
/* Halation has no boxes, so the pill goes too (founder 2026-09-10). The flag
   keeps a soft warm halo instead of a rim — findable, but nothing is drawn. */
.landing-container:not(.day-mode) .language-selector button { color: #f5e6c8 }
.landing-container:not(.day-mode) .language-selector button:hover::after { background: rgba(255,214,150,0.45) }
.landing-container:not(.day-mode) .language-selector button.active::after,
.landing-container:not(.day-mode) .language-selector button:only-child::after { background: rgba(255,214,150,0.85); box-shadow: 0 0 12px rgba(255,180,90,0.9) }

.landing-container:not(.day-mode) .hero .magic-button {
  background: rgba(52,38,80,0.62);
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
  box-shadow: inset 0 0 0 1px rgba(233,196,124,0.3), 0 0 20px -2px rgba(0,0,0,0.42);
  padding: 14px 32px;
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
/* Warm pools only — each fades to fully transparent INSIDE its section, so
   no edge can appear. The vignette moved to a single page-level layer below,
   because a per-section vignette reaches the section boundary still opaque
   and draws a visible line across the page (founder saw it under the
   features band). */
.landing-container:not(.day-mode) .hero::before {
  background: radial-gradient(46% 38% at 50% 38%, rgba(255,196,110,0.16) 0%, rgba(255,190,105,0.07) 38%, rgba(255,190,105,0) 70%);
}
.landing-container:not(.day-mode) .features::before {
  background: radial-gradient(58% 46% at 50% 32%, rgba(255,196,110,0.08) 0%, rgba(255,190,105,0) 70%);
}
/* One vignette for the whole page: fixed, so it never meets a section edge. */
.landing-container:not(.day-mode)::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(122% 88% at 50% 42%, rgba(6,2,20,0) 46%, rgba(6,2,20,0.5) 100%);
}
.landing-container:not(.day-mode) .hero-content,
.landing-container:not(.day-mode) .features-container { position: relative; z-index: 1 }

/* Lit, not merely light: the headline gains a faint warm bloom, the way type
   behaves when a lamp is actually in the room. */
/* HALATION (founder's pick 2026-09-09, from the specimen sheet): night stops
   imitating daylight and behaves like a long exposure. Type blooms in three
   layers — a tight warm core, a mid halo, a wide spill — which is what film
   does around a bright source, and the hero button drops its capsule for a
   word over a lit hairline: on a sky, a shape is a hole, but light is not. */
/* The lamp joins the halation (founder 2026-09-09): the PNG is a saturated
   orange next to parchment type, so it read as a sticker dropped on the page.
   Pulled toward the text's gold and given the same three-layer bloom, it now
   looks like the source of the light the type is catching. */
/* The wordmark had no glow at all while everything around it bloomed — a
   gradient-clipped element can't use text-shadow (the fill is transparent),
   so the halo comes from drop-shadow filters on the rendered pixels. */
/* The wordmark, the hero's brand word and the lamp all bloom the same way —
   one light source, three sizes. Gradient-clipped text can't use text-shadow
   (the fill is transparent), so the halo is a drop-shadow on the pixels. */
.landing-container:not(.day-mode) .app-name {
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
     1.6:1, which is why it gets a hairline EDGE instead of a deeper colour:
     a 0.7px stroke in the lamp's burnt end draws the letterform while the
     fill stays pure icon gold. An edge is what the earlier blurred shadow
     was reaching for and could not do — a blur under a light word on a light
     ground has nowhere to hide, a 0.7px line has. */
  background: linear-gradient(45deg, #D4AF37, #FF8C00);
  -webkit-text-stroke: 0.7px rgba(122, 58, 6, 0.55);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  filter: drop-shadow(0 1px 1px rgba(110,45,6,0.3));
}
/* The subtitle's brand word leaves the gradient (founder 2026-09-11: "Jinni
   there is hard to see"). The same gold that carries a 4rem headline is body
   text here, and it lands near 1.9:1 on the sand — a gradient cannot be read
   at 1.5rem on a light ground. Weight marks the word instead of colour, and
   the colour drops to the lamp's deep end at 5.2:1. The display sizes keep
   the gradient: large type is held to a lower bar, and it was approved. */
.day-mode .magic-subtitle :deep(.brand-grad) {
  background: none; -webkit-background-clip: initial; background-clip: initial;
  -webkit-text-fill-color: initial; color: #7A3A06; font-weight: 700;
  filter: none;
}
/* The dark half of a heading keeps a real shadow — it has letters to hide
   behind — but a tighter one, so the type stays sharp. */
.day-mode .magic-title { text-shadow: 0 1px 3px rgba(150,62,12,0.18) }
.day-mode .features-heading { text-shadow: 0 1px 3px rgba(150,62,12,0.16) }
.landing-container:not(.day-mode) .static-bottle {
  filter: saturate(0.76) brightness(1.06) contrast(0.96)
          drop-shadow(0 0 8px rgba(255,214,150,0.5))
          drop-shadow(0 0 26px rgba(255,170,90,0.4))
          drop-shadow(0 0 60px rgba(255,140,60,0.26));
}
/* Founder 2026-09-10: the sentence stops blooming and only the brand word is
   lit, so the halation marks the name instead of the whole line. The word is
   gradient-clipped, so its glow has to come from drop-shadow on the rendered
   pixels — text-shadow paints behind a transparent fill and shows nothing. */
.landing-container:not(.day-mode) .magic-title { color: #fff6e2; text-shadow: none }
.landing-container:not(.day-mode) .magic-title :deep(.brand-grad) {
  filter: drop-shadow(0 0 4px rgba(255,214,150,0.5))
          drop-shadow(0 0 16px rgba(255,170,90,0.42))
          drop-shadow(0 0 40px rgba(255,140,60,0.26));
}
/* Same rule as the hero (founder 2026-09-10): the plain half of the heading
   carries no bloom and only the accent half is lit, so the light marks the
   payoff instead of the whole line. */
.landing-container:not(.day-mode) .features-heading { color: #fbf0d8; text-shadow: none }
.landing-container:not(.day-mode) .features-heading :deep(.brand-grad) {
  filter: drop-shadow(0 0 4px rgba(255,214,150,0.45))
          drop-shadow(0 0 14px rgba(255,170,90,0.36))
          drop-shadow(0 0 34px rgba(255,140,60,0.22));
}
.landing-container:not(.day-mode) .hero .magic-button {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; padding: 14px 8px 22px; position: relative;
  font-size: 1.32rem; letter-spacing: 0.01em;
}
.landing-container:not(.day-mode) .hero .magic-button::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 10px; height: 1.5px;
  background: rgba(255,214,150,0.85); box-shadow: 0 0 12px rgba(255,180,90,0.9);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.landing-container:not(.day-mode) .hero .magic-button:hover { background: transparent; box-shadow: none }
.landing-container:not(.day-mode) .hero .magic-button:hover::after { background: #fff3dc; box-shadow: 0 0 16px rgba(255,190,105,1) }
/* the label leaves the gradient clip: halation needs a solid colour to bloom */
.landing-container:not(.day-mode) .hero .wish-label {
  /* Same restraint as the Explore switch (founder preferred it): one soft
     glow on the words, and only the rule beneath them answers the pointer. */
  background: none; -webkit-text-fill-color: initial; color: #ffe8c4; font-weight: 700;
  text-shadow: 0 0 12px rgba(255,180,90,0.5);
}

/* ── Starfield palette (founder 2026-09-09) ──
   The night page was one temperature: everything beige on indigo, so the
   numerals came out muddy brown and the orange footer links shouted. Two
   temperatures instead — warm gold carries meaning (headings, the brand,
   the accent half of a heading), cool lavender carries structure (numerals,
   rules, body copy, links). That's the sky's own contrast: starlight against
   a violet ground, with gold only where the lamp light falls. */
.landing-container:not(.day-mode) .wish-num {
  background: linear-gradient(180deg, rgba(255,231,181,0.72), rgba(226,175,88,0.3));
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
/* Explore / For Business, halation form (founder 2026-09-10): the pill and
   both fills are gone. Two words share a hairline baseline; only the chosen
   one is LIT — its rule glows and its text blooms — so the state is carried
   by light instead of by a filled shape. Same grammar as the wish button. */
.landing-container:not(.day-mode) .mode-switch-pill {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  box-shadow: none; border-radius: 0; padding: 0; gap: 26px;
}
.landing-container:not(.day-mode) .mode-switch-btn {
  color: rgba(232,218,190,0.5); background: transparent; box-shadow: none;
  padding: 8px 2px 14px; border-radius: 0; position: relative;
}
.landing-container:not(.day-mode) .mode-switch-btn::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 6px; height: 1px;
  background: rgba(232,218,190,0.16); box-shadow: none;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.landing-container:not(.day-mode) .mode-switch-btn:hover { color: #f7e6c2; background: transparent; box-shadow: none }
.landing-container:not(.day-mode) .mode-switch-btn:hover::after { background: rgba(255,214,150,0.45) }
.landing-container:not(.day-mode) .mode-switch-btn--active,
.landing-container:not(.day-mode) .mode-switch-btn--active:hover {
  background: transparent; box-shadow: none; color: #ffe8c4;
  text-shadow: 0 0 12px rgba(255,180,90,0.5);
}
.landing-container:not(.day-mode) .mode-switch-btn--active::after {
  background: rgba(255,214,150,0.85); box-shadow: 0 0 12px rgba(255,180,90,0.9);
}
.landing-container:not(.day-mode) .language-selector button { color: #f5e6c8 }
.landing-container:not(.day-mode) .footer-copyright { color: rgba(245,230,200,0.6) }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  /* The lamp's 60px spill is sized for a desktop hero; on a phone it covers a
     third of the screen and its outer edge bands against the dark sky, which
     reads as a border drawn across the top. */
  .landing-container:not(.day-mode) .static-bottle {
    filter: saturate(0.76) brightness(1.06) contrast(0.96)
            drop-shadow(0 0 7px rgba(255,214,150,0.45))
            drop-shadow(0 0 20px rgba(255,170,90,0.3));
  }
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
  .language-selector { gap: 6px }
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