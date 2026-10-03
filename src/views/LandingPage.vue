<template>
  <div class="landing-container" :class="isNightMode ? 'jinni-night' : 'day-mode'">
    <!-- Night = "Jinni Night" (founder 2026-10-03): JinniChat's own gradient
         with two drifting glows, replacing the starry sky on this page. -->
    <JinniNightSky v-if="isNightMode" />
    <JinniDaySky v-else />
    <div class="header-container">
      <img class="brand-lamp" src="/images/lamp.webp" alt="" aria-hidden="true">
      <div class="app-name" translate="no">Jinni</div>
    </div>
    <div class="language-selector-container">
      <LandingNav variant="travel" :languages="languageOptions" :current-language="selectedLanguage"
                  @discover="scrollToCities" @primary="openSignup" @select-language="selectLanguage" />
      <div class="language-selector" :class="{ open: showAllLanguages }" ref="languageSelectorRef" @click.stop>
        <!-- No flag emojis (founder 2026-10-01): a line globe + the current
             code, and a menu of language names each in its own script. -->
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
      <!-- day only: the sand arrives from below, fills the lamp left to right,
           and stops for good -->
      <!-- `&& lampEl`: template refs are only assigned after the first render,
           so without this the component mounts with a null lamp and silently
           does nothing -->
      <DesertSand v-if="isDayMode && lampEl" :lamp-el="lampEl" />
      <div class="hero-content">
        <span class="lamp" ref="lampEl"><img src="/images/lamp.webp" alt="Jinni — the AI travel guide's genie lamp" class="static-bottle"></span>
        <h1 class="magic-title" v-html="heroTitleHtml"></h1>
        <p class="magic-subtitle">{{ $t('landing.hero.subtitle') }}</p>
        <MagicButton ref="wishBtn" @click="openAuthModal"><span class="wish-label">{{ $t('landing.hero.cta') }}</span></MagicButton>
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
    <!-- Cities Jinni has filled (founder 2026-09-16): the public /discover
         pages, linked from here so search engines and visitors find them.
         Derived from the data — a city appears once it has enough places.
         Hidden entirely while there are none, so the landing never shows an
         empty section. -->
    <section v-if="cities.length" id="cities" class="cities">
      <div class="features-container">
        <h2 class="features-heading cities-heading" v-html="citiesTitleHtml"></h2>
        <p class="cities-sub">{{ $t('landing.cities.subtitle') }}</p>
        <!-- Grouped by country, the visitor's own country first (Cloudflare's
             country header via the API), then by how much Jinni knows there. -->
        <div v-for="g in cityGroups" :key="g.code || g.name" class="cities-country">
          <h3 class="cities-country-name">{{ g.name }}</h3>
          <div class="cities-grid">
            <router-link v-for="c in g.cities" :key="c.slug" :to="{ path: `${selectedLanguage === 'ru' ? '/ru' : ''}/discover/${c.slug}`, query: { from: 'landing' } }" class="city-card">
              <div class="city-card-body">
                <span class="city-card-name">{{ c.name }}</span>
                <span class="city-card-meta">{{ $t('landing.cities.places', { count: c.count }) }}</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
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
import { track } from '@/utils/funnel'
import AuthModal from '@/components/AuthModal.vue'
import StarrySky from '@/components/ui/StarrySky.vue'
import DaySky from "@/components/ui/DaySky.vue";
import DesertSky from '@/components/ui/DesertSky.vue'
import DesertSand from '@/components/ui/DesertSand.vue'
import JinniDaySky from '@/components/ui/JinniDaySky.vue'
import JinniNightSky from '@/components/ui/JinniNightSky.vue'
import LandingNav from '@/components/ui/LandingNav.vue'
import { startEmberBreath } from '@/utils/emberBreath'
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
    // Cities heading: same brand-word treatment as the hero (founder 2026-09-17).
    citiesTitleHtml() {
      const raw = String(this.$t('landing.cities.title') || '');
      const esc = raw.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      return esc.replace(/Jinni/g, '<span class="brand-grad" translate="no">Jinni</span>');
    },
    heroTitleHtml() {
      const raw = String(this.$t('landing.hero.title') || '');
      const esc = raw.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      return esc.replace(/Jinni/g, '<span class="brand-grad" translate="no">Jinni</span>');
    },
  },
  components: {
    MagicButton,
    AuthModal,
    StarrySky,
    DaySky,
    DesertSky,
    DesertSand,
    JinniDaySky, JinniNightSky,
    LandingNav
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const selectedLanguage = ref('en')
    const showAllLanguages = ref(true)
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
    const currentLanguageCode = computed(() => (selectedLanguage.value || 'en').toUpperCase())
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
    // Public city pages, cache-only on the backend (never a Google call).
    const cities = ref([])
    const visitorCountry = ref(null)
    const cityGroups = computed(() => {
      const groups = new Map()
      for (const c of cities.value) {
        const code = c.countryCode || ''
        if (!groups.has(code)) groups.set(code, { code, name: c.country || code, cities: [], total: 0 })
        const g = groups.get(code); g.cities.push(c); g.total += c.count || 0
      }
      const mine = visitorCountry.value
      return [...groups.values()].sort((a, b) => (Number(b.code === mine) - Number(a.code === mine)) || (b.total - a.total))
    })
    const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
    const cityImg = (u) => (u && u.startsWith('/api/') ? `${API_BASE}${u}` : u)
    const loadCities = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/discover/cities`)
        const data = await res.json().catch(() => ({}))
        cities.value = Array.isArray(data.cities) ? data.cities : []
        visitorCountry.value = data.visitorCountry || null
      } catch (e) { cities.value = [] }
    }
    // Landing CTA opens /auth on Create account (founder 2026-09-30): a visitor
    // from an ad has no account yet; every other /auth entry keeps Sign In.
    const openAuthModal = () => { track('wish_tap'); router.push({ path: '/auth', query: { mode: 'signup' } }) }
    const goBusinessLanding = () => {router.push('/business')}
    // Nav (2026-10-03): "Discover" scrolls to the cities; the panel's main
    // button is a plain sign-up (the hero CTA keeps its own wish_tap event).
    const scrollToCities = () => {
      const el = document.getElementById('cities')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const openSignup = () => { router.push({ path: '/auth', query: { mode: 'signup' } }) }
    // Night Make a Wish = Ember Breath: the glow rises from a new spot each breath.
    const wishBtn = ref(null)
    let stopEmber = () => {}
    watch([isNightMode, wishBtn], ([night, btn]) => {
      stopEmber()
      const el = btn && (btn.$el || btn)
      stopEmber = el ? startEmberBreath(el) : () => {}   // both themes now (day = copper light)
    }, { immediate: true })
    const selectLanguage = (lang) => {
      clearAutoCloseTimer()
      store.dispatch('i18n/changeLanguage', lang)
      selectedLanguage.value = lang
      showAllLanguages.value = false
    }
    // The trigger stays on screen while the menu is open, so it toggles.
    const toggleLanguageSelector = () => {
      showAllLanguages.value = !showAllLanguages.value
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
      loadCities()
      track('landing_view')
    })
    onBeforeUnmount(() => {clearAutoCloseTimer(); stopEmber()})
    return {
      features,
      languageOptions,
      selectedLanguage,
      showAllLanguages,
      currentLanguageCode,
      currentLanguageTitle,
      openAuthModal,
      goBusinessLanding,
      scrollToCities,
      openSignup,
      wishBtn,
      selectLanguage,
      toggleLanguageSelector,
      languageSelectorRef,
      isNightMode,
      isDayMode,
      lampEl,
      cities,
      cityGroups,
      cityImg
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
.landing-container {
  --brand-serif: 'Cinzel', 'Noto Serif Armenian', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
  /* One size system for the first screen (founder 2026-09-30: "text sizes,
     symmetrical things... for mobile"). Pixels, not rem — the in-app text-size
     setting scales the root and the hero must read the same for everyone.
     --gutter is the SAME on both sides and for the header and the hero, so the
     wordmark, the flag and the headline all sit on one inset. The header row
     is one band (--hdr-top / --hdr-h): the wordmark and the flag each centre
     inside it, so their centres share an axis by construction. */
  --gutter: 16px; --hdr-top: 16px; --hdr-h: 48px;
  /* Type scale: headline > subtitle >= button label. */
  --title-fs: clamp(30px, calc(3.3vw + 18px), 56px);
  --sub-fs: clamp(18px, calc(0.5vw + 16px), 22px);
  --cta-fs: clamp(17px, calc(0.3vw + 16px), 20px);
  --cta-h: 52px;
  /* Vertical rhythm on an 8px scale: lamp -> headline -> subtitle -> button. */
  --gap-lamp: 16px; --gap-sub: 16px; --gap-cta: 32px;
}
@media (min-width: 769px) {
  .landing-container { --gutter: 24px; --hdr-top: 24px; --hdr-h: 56px; --cta-h: 56px; --gap-lamp: 24px }
}
@media (min-width: 1200px) {
  .landing-container { --gutter: 32px; --hdr-top: 28px }
}

/* Hero title, day mode (founder 2026-09-09): the full gradient sat at ~2:1
   contrast on cream. Dark ink for the sentence, gradient kept for the brand
   word only — more readable AND more brand-forward. Night is untouched. */
/* Founder 2026-09-11: #4a3226 was a cocoa brown — the one warm colour on the
   page that belonged to no light source. The headings take the lamp's own
   burnt end instead, the shadow side of the metal rather than a new hue. It
   is the deepest stop of the lamp and still clears 4.5:1 on the peach sky;
   the bright half of the brand gradient sits under 2:1 there and cannot be
   used for running type. */
/* Founder 2026-09-11: closer to the Jinni gold. It moves from #732F06 to
   #8C3D07 — warmer, more orange, the same family as the brand gradient's
   burnt end rather than a dark red-brown sitting near it. It deliberately
   stops SHORT of that end (#B4540A): the plain words have to stay a step
   below the brand word, or "Jinni" loses the contrast that makes it read as
   the lit one. At #8C3D07 the heading still measures 4.5:1 on the sand, so
   it gains warmth without spending legibility. */
.day-mode .magic-title { background: none; -webkit-text-fill-color: initial; color: #8C3D07 }
.day-mode .features-heading { background: none; -webkit-text-fill-color: initial; color: #8C3D07 }
/* :deep — v-html content carries NO scope attribute, so a plain scoped
   descendant rule never matches this span. */
.magic-title :deep(.brand-grad), .features-heading :deep(.brand-grad) { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent }

/* Wish button, day mode (founder's pick): the glacier glass of the Discovery
   chips, with the label in the brand gradient. A gradient text-clip needs the
   element's own background, so the glass lives on the button and the gradient
   on the label span. Even shadow; hover changes light only, nothing moves.
   Night mode is deliberately untouched. */
/* CLEAR GLASS, BOLDER (founder 2026-09-30, lab proposed-v2.html cta 6) —
   replaces the underlined-word CTA and the bare flag. JinniChat's own
   colourless glass (JinniChat.vue .session-limit-modal .btn-secondary:
   --glass-fill / --glass-sheen + the white base), with a larger blur. No
   colour of its own and NO border: it is a light blur that takes the tone of
   whatever is behind it, and its edge is only the inset sheen. Hover changes
   light only (the white base brightens); nothing moves or scales. */
/* Founder 2026-09-30 (2nd pass): "not glacier like, not even transparent" —
   the 50% white base made a solid cream pill. Now the body is nearly clear
   (10% day / 4% night): the page shows through, and the pane is drawn only by
   light — a lit rim, a soft inner glow and a brighter top from the fill
   gradient — plus an even lift shadow. Still no border and no tint. */
/* 3rd pass (founder: "the buttons are like iPhone 4S UI") — the top-bright
   gradient + inner glow + drop of shadow read as 2011 gloss. Modern (iOS 26)
   glass is FLAT: no gloss gradient, no inner glow, almost no shadow — just a
   nearly clear pane, the backdrop blur/saturation, and a hairline of light
   at the rim. */
/* 4th pass — iOS 26 Liquid Glass (founder: "more realistic, more iOS"). Real
   Liquid Glass is nearly clear in the middle; all the work is at the rim: a
   crisp specular line along the TOP edge (light from above), a fainter one
   along the bottom, a hairline around the shape, a whisper of inner light,
   and the backdrop blurred + saturated. Refraction (SVG displacement) is
   left out: backdrop-filter:url() works in Chrome only, not iOS Safari. */
/* THE JINNI GOLD, A LITTLE TRANSPARENT (founder 2026-10-01: "see what
   settings are applied to the lamp colour and the colour of the Jinni text in
   night mode, apply that to the button, then make the button a LITTLE
   transparent"). The fill is the wordmark's own gradient (45deg #D4AF37 ->
   #FF8C00) at ~86% alpha over a light backdrop blur; at night the fill takes
   the lamp's tone treatment (saturate .76 / brightness 1.06 / contrast .96)
   and the halo is the "Jinni" word's three-layer warm bloom as box-shadows,
   even on every side. The filter lives on the ::before fill only, never the
   label. No gloss gradient, no border. White semibold label with a soft warm
   seat. Hover = the halo brightens; nothing moves. */
.landing-container.day-mode {
  /* Day = option D "copper" (founder 2026-10-01): the light gold measured
     2.1:1 under the white label; copper -> burnt orange measures 4.0:1. */
  --wish-body: linear-gradient(45deg, rgba(176,106,24,0.94), rgba(207,83,23,0.94));
  --wish-tone: none;
  --wish-halo: 0 0 4px rgba(207,120,50,0.35), 0 0 14px rgba(190,90,30,0.28);
  --wish-halo-hover: 0 0 4px rgba(207,120,50,0.5), 0 0 20px rgba(190,90,30,0.42);
  --wish-filter: blur(10px) saturate(150%);
  --wish-ink-shadow: 0 0 6px rgba(70,25,0,0.4);
}
.landing-container:not(.day-mode) {
  --wish-body: linear-gradient(45deg, rgba(212,175,55,0.86), rgba(255,140,0,0.86));
  --wish-tone: saturate(0.76) brightness(1.06) contrast(0.96);
  --wish-halo: 0 0 4px rgba(255,214,150,0.5), 0 0 16px rgba(255,170,90,0.42), 0 0 40px rgba(255,140,60,0.26);
  --wish-halo-hover: 0 0 5px rgba(255,214,150,0.62), 0 0 20px rgba(255,170,90,0.54), 0 0 48px rgba(255,140,60,0.34);
  --wish-filter: blur(10px) saturate(150%);
  --wish-ink-shadow: 0 0 6px rgba(90,40,0,0.45);
}
/* Both themes: a text-sized pill, 52px tall on phones / 56px from tablets
   up (touch target clears 48). On a 320px phone the longest label (Armenian)
   may wrap to two lines and the pill grows instead of spilling off screen. */
.landing-container .hero .magic-button,
.landing-container:not(.day-mode) .hero .magic-button {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: var(--cta-h); min-width: 48px; max-width: 100%; padding: 12px 28px; margin: var(--gap-cta) 0 0; border: none; border-radius: 999px; position: relative;
  background: none; box-shadow: var(--wish-halo); backdrop-filter: none; -webkit-backdrop-filter: none;
  font-size: var(--cta-fs); line-height: 1.25; letter-spacing: 0.01em; text-wrap: balance;
  transition: box-shadow 0.25s ease;
}
.landing-container .hero .magic-button::before {
  content: ''; position: absolute; inset: 0; z-index: 0; border-radius: inherit; pointer-events: none;
  background: var(--wish-body); filter: var(--wish-tone);
  backdrop-filter: var(--wish-filter); -webkit-backdrop-filter: var(--wish-filter);
}
.landing-container .hero .magic-button::after { content: none }
.landing-container .hero .magic-button:hover,
.landing-container:not(.day-mode) .hero .magic-button:hover { background: none; box-shadow: var(--wish-halo-hover) }
.landing-container .hero .wish-label,
.landing-container:not(.day-mode) .hero .wish-label,
.landing-container .hero .magic-button:hover .wish-label,
.landing-container:not(.day-mode) .hero .magic-button:hover .wish-label {
  position: relative; z-index: 2;
  background: none; -webkit-text-fill-color: #ffffff; color: #ffffff; opacity: 1;
  font-weight: 600; font-variant-caps: normal; letter-spacing: 0.01em; font-size: 1em;
  text-shadow: var(--wish-ink-shadow);
}

.landing-container { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column }
/* The inset lives HERE, not on .hero-content: that box has a max-width,
   and padding on a content-box max-width ADDS to it — 800 + 44 — so the
   hero grew wider than the viewport and the page scrolled sideways into
   a white strip. .hero is full width with nothing to overflow. */
.hero { padding-inline: var(--gutter); min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2 }
.hero, .features { position: relative; z-index: 2 }
.hero-content { max-width: 800px; animation: fadeInUp 1s ease-out; display: flex; flex-direction: column; align-items: center }
/* Founder 2026-09-30: on a laptop the title must sit on ONE line — at 56px
   "Where Will Jinni Take You?" is ~830px, wider than the 800px box, so it
   wrapped like on a phone. Longer locales still wrap (balanced). */
@media (min-width: 1024px) { .hero-content { max-width: min(1100px, 100%) } }
/* bottle.png is square with 24% transparent space under the lamp (measured
   2026-09-30: ink ends at row 948 of 1254), so at 150px the lamp carried
   ~36px of invisible gap on top of --gap-lamp and sat far from the heading
   (founder: "lamp is little far from main heading"). The negative bottom
   margin cancels that empty band, so --gap-lamp is the gap the eye sees. */
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
.landing-container:not(.day-mode) .lamp::after {
  background: linear-gradient(148deg,
    rgba(255,244,214,0.85) 0%, rgba(255,178,96,0.28) 38%,
    rgba(120,70,170,0.42) 72%, rgba(48,22,86,0.62) 100%);
}
/* Size lives on .magic-title only (founder 2026-09-17: this fixed 3.5rem
   outranked the responsive clamp below and the title wrapped on desktop). */
.hero h1 { margin: var(--gap-lamp) 0 0; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
.hero p { font-size: 1.3rem; margin-bottom: 2rem; color: #e0e0e0 }
.features { padding: 2rem 1rem 4rem 1rem; position: relative; z-index: 2 }
.features-container { max-width: 1200px; margin: 0 auto }
.features-heading { text-align: center; margin-bottom: 3rem }
.features h2 { font-family: var(--brand-serif); font-style: normal; font-size: 2.5rem; margin-bottom: 2rem; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
/* Manifest features (founder 2026-09-09): the boxes are gone. Translucent
   cards on a peach sky sat under 1.2:1 contrast and read as stains; three
   numbered columns divided by hairlines carry the section on type alone —
   and the numerals finally deliver the "three wishes" the heading promises.
   Body copy leaves Cinzel, which is a display face and slows paragraphs. */
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); position: relative }
.wish-item { padding: 6px 30px }
.wish-num { display: block; font-family: var(--brand-serif); font-size: 2.6rem; font-weight: 700; line-height: 1; margin-bottom: 12px; font-variant-numeric: tabular-nums }
/* Measured at one font size across all six: French card titles want 39%
   more width than English and Armenian 31%, so those two wrap to a second
   line in a column English fills with one. Nothing is scaled up — the
   words are longer. balance splits the two lines evenly instead of
   leaving one word stranded underneath. */
.wish-item h3 { font-family: var(--brand-serif); font-size: 1.4rem; margin-bottom: 10px; text-wrap: balance }
.wish-item p { font-size: 1.02rem; line-height: 1.55; text-wrap: pretty }
.demo h2 { font-size: 2.5rem; margin-bottom: 2rem; color: #D4AF37 }
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
/* Language control without emoji (founder 2026-10-01: "not beautiful with
   emoji"). A quiet secondary control: a line globe + the current code in a
   small pill of CLEAR glass — no orange, so Make a Wish stays the only
   coloured thing on the first screen. The menu is a glass panel hanging from
   the pill, each language named in its own script; the current one is bold
   (no underline, founder 2026-09-30). Hover = a light pane, nothing moves. */
.landing-container.day-mode {
  --lang-ink: #8C3D07;
  --lang-glass: rgba(255,255,255,0.22); --lang-glass-hover: rgba(255,255,255,0.36);
  --lang-rim: inset 0 0 0 0.75px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55), 0 0 18px -2px rgba(140,61,7,0.12);
  /* Open list = the SAME clear glass as the pill (founder 2026-10-01 disliked
     the milky cream panel): near-clear, hairline light rim, soft even lift. */
  --lang-panel: rgba(255,255,255,0.24);
  --lang-panel-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55), 0 0 18px -2px rgba(140,61,7,0.14);
  --lang-hover: rgba(140,61,7,0.08);
}
.landing-container:not(.day-mode) {
  --lang-ink: #f5e6c8;
  --lang-glass: rgba(255,255,255,0.06); --lang-glass-hover: rgba(255,255,255,0.12);
  --lang-rim: inset 0 0 0 0.75px rgba(255,240,215,0.28), inset 0 1px 0 rgba(255,240,215,0.2), 0 0 18px -2px rgba(0,0,0,0.3);
  /* Night: the pill's clear glass instead of the purple panel. */
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
/* Phones: a smaller pill (founder 2026-10-01) — 38px tall instead of 44,
   tighter sides, 13px code, 16px globe. The tap area stays 44px through an
   invisible ::before, so it is no harder to hit. */
@media (max-width: 768px) {
  .lang-trigger { height: 38px; min-width: 38px; padding: 0 12px 0 10px; gap: 6px; font-size: 13px; position: relative }
  .lang-trigger::before { content: ''; position: absolute; inset: -3px -2px }
  .lang-globe { width: 16px; height: 16px }
}
.lang-menu {
  /* Width follows the longest language name (founder 2026-10-01: the list was
     wider than its text needed) — max-content, no fixed minimum. */
  position: absolute; top: calc(100% + 8px); inset-inline-end: 0; width: max-content; min-width: 0;
  display: flex; flex-direction: column; gap: 2px; padding: 6px; border-radius: 20px;
  background: var(--lang-panel); box-shadow: var(--lang-panel-shadow);
  /* saturate 110%, not 180%: at 180% the blurred violet sky glow behind the
     list came through as a purple panel (checked 2026-10-01). */
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
/* text-wrap: balance so no language can strip a fragment onto a line of its
   own — French put the "?" there by itself, since the space before it is a
   legal break point. The locale now uses a narrow no-break space (U+202F),
   which is the correct French space before ? ! : ; anyway; balance is the
   general guard for every other language. */
/* Was a flat 4rem, where the business page already scaled. At 64px this
   wraps on an iPad in portrait and breaks apart on a foldable's cover
   screen — and the longest translation decides, not English. clamp lets the
   line find one row wherever it can and shrink instead of wrapping where it
   cannot; 5.4vw is the same curve the business hero uses. */
/* Pixels, not rem: the in-app text-size setting scales the root to 112.5% /
   125% and survives logout, so a rem title grew to ~4.4rem for a Large user
   (founder 2026-09-17). The hero must read the same for every visitor. */
.hero .magic-title { font-family: var(--brand-serif); font-size: var(--title-fs); line-height: 1.15; letter-spacing: 1px; max-width: 100%; text-wrap: pretty; text-wrap: balance }
/* balance (pretty where balance is missing) so no line ends on one stranded
   word — English left "existed" alone on a phone's second line. */
.hero .magic-subtitle { font-family: var(--brand-serif); font-size: var(--sub-fs); line-height: 1.45; max-width: 700px; margin: var(--gap-sub) auto 0; text-wrap: pretty; text-wrap: balance; text-shadow: 0 0 7px rgba(255,255,255,0.3) }
/* ── Mode switch pill ──────────────────────────────────────────────────────── */
/* Cities — a row of underlined text links in the Make a Wish dress (founder
   2026-09-17): no box, no image, gradient word with a hairline beneath that
   strengthens on hover. Same colours as the hero button in each theme. */
/* Same breathing room above and below the switch pill (founder 2026-09-17):
   the pill's wrapper keeps its 4rem below; the section adds nothing on top
   and matches that 4rem underneath before the footer. */
.cities { padding: 0 1rem 4rem; margin-top: 0; position: relative; z-index: 2 }
.cities-heading { margin-bottom: 0.6rem }
.cities-sub { text-align: center; opacity: 0.8; margin: 0 auto 1.6rem; max-width: 640px; line-height: 1.55 }
.cities-country { margin: 0 auto 1.4rem; max-width: 1000px }
.cities-country-name { text-align: center; font-family: var(--brand-serif); font-weight: 500; font-size: 1.05rem; letter-spacing: 0.04em; margin: 0 0 4px; color: #f4e7c9; opacity: 0.85 }
.day-mode .cities-country-name { color: #5a3c2e }
.cities-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 28px; max-width: 1000px; margin: 0 auto }
.city-card { position: relative; display: inline-block; padding: 10px 6px 16px; text-decoration: none; color: inherit; background: transparent }
.city-card::after { content: ''; position: absolute; left: 0; right: 0; bottom: 8px; height: 1.5px;
  background: rgba(233,196,124,0.45); box-shadow: 0 0 10px rgba(255,190,110,0.25);
  transition: background 0.3s ease, box-shadow 0.3s ease }
.city-card:hover::after { background: rgba(255,224,176,0.95); box-shadow: 0 0 16px rgba(255,190,110,0.7) }
.city-card-body { display: flex; flex-direction: column; align-items: center; gap: 2px }
.city-card-name { font-family: var(--brand-serif); font-size: 1.3rem; font-weight: 600;
  background: linear-gradient(45deg, #D4AF37 0%, #E8860C 38%, #B4540A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
/* Night: the same cream the headings use (founder 2026-09-17: the gold
   gradient read wrong beside them), warming on hover like the wish label. */
.landing-container:not(.day-mode) .city-card-name { background: none; -webkit-text-fill-color: initial; color: #f4e7c9 }
.landing-container:not(.day-mode) .city-card:hover .city-card-name { color: #fff6e6; text-shadow: 0 0 20px rgba(255,190,110,0.55) }
.city-card-meta { font-size: 0.86rem; color: rgba(224,224,224,0.7) }
/* Day (founder 2026-09-17): rest at half strength, full brown on hover — the
   same trip the day wish label makes, so the link visibly answers the cursor. */
.day-mode .city-card-name { background: none; -webkit-text-fill-color: initial; color: rgba(115,47,6,0.58); transition: color 0.3s ease, text-shadow 0.3s ease }
.day-mode .city-card:hover .city-card-name { color: #732F06; text-shadow: 0 0 14px rgba(255,224,176,1) }
.day-mode .city-card::after { background: rgba(115,47,6,0.5); box-shadow: 0 0 10px rgba(214,120,40,0.22) }
.day-mode .city-card:hover::after { background: rgba(115,47,6,0.95); box-shadow: 0 0 14px rgba(214,120,40,0.6) }
.day-mode .city-card-meta { color: rgba(90,60,46,0.7); transition: color 0.3s ease }
.day-mode .city-card:hover .city-card-meta { color: #5a3c2e }
.mode-switch-wrapper { display: flex; justify-content: center; padding: 4rem 0 8rem 0; position: relative; z-index: 2 }
.mode-switch-pill { display: inline-flex; align-items: center; gap: 2px; background: rgba(26,9,51,0.8); border-radius: 50px; padding: 4px; backdrop-filter: blur(10px); box-shadow: 0 0 12px rgba(212,175,55,0.1), 0 0 24px rgba(0,0,0,0.35) }
.mode-switch-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 20px; border-radius: 40px; border: none; background: transparent; font-family: var(--brand-serif); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; color: rgba(212,175,55,0.45); transition: all 0.25s ease; white-space: nowrap }
.mode-switch-btn:hover { color: #D4AF37; background: rgba(212,175,55,0.12); box-shadow: 0 0 10px rgba(212,175,55,0.12) }
.mode-switch-btn--active { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); color: #D4AF37; box-shadow: 0 0 14px rgba(212,175,55,0.25); cursor: default }
.mode-switch-btn--active:hover { background: linear-gradient(45deg, rgba(212,175,55,0.28), rgba(255,140,0,0.2)); box-shadow: 0 0 14px rgba(212,175,55,0.25) }
.footer { margin-top: auto; padding: 0.3rem 0.3rem; position: relative; z-index: 2; width: 100%; }
.footer-content { max-width: 1200px; margin: 0 auto; text-align: center }
/* wrap: Russian's short labels ("Использования" + "Конфиденциальность")
   are wider than a 320px phone together and pushed the page sideways. */
.footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 0 2rem }
.footer-links a { color: #FF8C00; text-decoration: none; font-family: var(--brand-serif); font-size: 1.1rem; transition: all 0.3s ease; position: relative; padding: 0.5rem }
.footer-copyright { color: rgba(224,224,224,0.7); font-family: var(--brand-serif); font-size: 0.9rem }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(50px) } to { opacity: 1; transform: translateY(0) } }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.1) } 100% { transform: scale(1) } }
/* ── Day mode ──────────────────────────────────────────────────────────────── */
.day-mode .hero p, .day-mode .footer-copyright { color: #5a3c2e; text-shadow: 0 0 2px rgba(255,255,255,0.3) }
.day-mode .magic-subtitle { color: #5a3c2e; text-shadow: 0 0 7px rgba(255,255,255,0.4) }
.day-mode .wish-item { border-inline-start: 1px solid rgba(150,100,55,0.28) }
.day-mode .wish-item:first-child { border-inline-start: none; padding-inline-start: 0 }
.day-mode .wish-item:last-child { padding-inline-end: 0 }
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
  /* Tone matched to the "Jinni" text (founder 2026-10-01: night matched, day
     did not). Measured: bottle.png mean #fba50a (h39 s.96 v.99) vs the day
     "Jinni" ink #e7a024 (h38 s.84 v.91) — same hue, so only saturation
     (x0.88) and brightness (x0.92) move. Glow lives on .lamp. */
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

/* ── Night mode explicit colors (override inherited body color) ───────────── */
.landing-container:not(.day-mode) .magic-subtitle { color: #f5e6c8; text-shadow: 0 0 7px rgba(255,200,120,0.25) }
.landing-container:not(.day-mode) .wish-item { border-inline-start: 1px solid rgba(212,175,55,0.22) }
.landing-container:not(.day-mode) .wish-item:first-child { border-inline-start: none; padding-inline-start: 0 }
.landing-container:not(.day-mode) .wish-item:last-child { padding-inline-end: 0 }
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
/* One vignette for the whole page: fixed, so it never meets a section edge.
   It reached rgba(6,2,20,0.5) at its rim, which is half-opaque near-black —
   enough to erase the stars along the bottom of a phone, and because the
   element is fixed with inset:0 it RE-SCALES every time Safari's toolbar
   collapses or expands, so the dead band grew and shrank as you scrolled.
   The transparent core now runs to 58% and the rim stops at 0.30: the corners
   still fall away, but the starfield reads through them. */
.landing-container:not(.day-mode)::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(128% 96% at 50% 46%, rgba(6,2,20,0) 58%, rgba(6,2,20,0.30) 100%);
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
     1.6:1 against the sand, so the separation is made with light rather than
     with colour — see the filter below. */
  background: linear-gradient(45deg, #D4AF37, #FF8C00);
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
/* Night glow lives on .lamp, NOT on the image (founder 2026-10-01: "the lamp
   will be like an empty block without shadow"). .lamp::after blends with
   mix-blend-mode, and Chrome clips everything painted inside that blending
   group to the 150px .lamp box — the 26px/60px bloom on the image was cut
   into a rectangle, visibly and intermittently. A filter on .lamp itself is
   applied to the group's finished output, so its drop-shadows extend freely.
   The tone treatment stays on the image. */
.landing-container:not(.day-mode) .static-bottle {
  filter: saturate(0.76) brightness(1.06) contrast(0.96);
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
.landing-container:not(.day-mode) .wish-item { border-inline-start-color: rgba(240,218,170,0.2) }
.landing-container:not(.day-mode) .wish-item h3 { color: #f0dcae }
.landing-container:not(.day-mode) .wish-item p { color: #e4d7bd }
.landing-container:not(.day-mode) .magic-subtitle { color: #ead9b8; text-shadow: 0 0 14px rgba(212,175,55,0.18) }
/* Founder 2026-09-30: night text "can be a little transparent, but little" —
   the sky shows faintly through the ink. The gold "Jinni" stays solid (it is
   the light source); title ink 70%, subtitle 72%, wish label 80% (2nd pass,
   "a little more transparent"). All still above 4.5:1 on the #0a0118 sky. */
.landing-container:not(.day-mode) .magic-title { color: rgba(255,246,226,0.7) }
.landing-container:not(.day-mode) .magic-subtitle { color: rgba(234,217,184,0.72) }
/* Same night transparency below the hero (founder 2026-10-01: the texts under
   Make a Wish were "too bright" next to the 70% heading). Headings 70%, body
   72%, like the hero; gold "Jinni" words stay solid. */
.landing-container:not(.day-mode) .features-heading { color: rgba(251,240,216,0.7) }
.landing-container:not(.day-mode) .wish-item h3 { color: rgba(240,220,174,0.72) }
.landing-container:not(.day-mode) .wish-item p { color: rgba(228,215,189,0.68) }
.landing-container:not(.day-mode) .city-card-name { color: rgba(244,231,201,0.72) }

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
.landing-container:not(.day-mode) .footer-copyright { color: rgba(245,230,200,0.6) }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  /* The lamp's 60px spill is sized for a desktop hero; on a phone it covers a
     third of the screen and its outer edge bands against the dark sky, which
     reads as a border drawn across the top. */

  /* One column: the vertical hairline becomes a horizontal one between items. */
  .features-grid { grid-template-columns: 1fr }
  .wish-item { padding: 20px 0 }
  .day-mode .wish-item, .landing-container:not(.day-mode) .wish-item { border-inline-start: none; border-top: 1px solid rgba(150,100,55,0.26) }
  .landing-container:not(.day-mode) .wish-item { border-top-color: rgba(212,175,55,0.2) }
  .day-mode .wish-item:first-child, .landing-container:not(.day-mode) .wish-item:first-child { border-top: none; padding-top: 0 }
  .wish-num { font-size: 2.1rem; margin-bottom: 8px }
  .features h2, .demo h2 { font-size: 2rem }
  .footer-links { gap: 0 0.1rem }
  .footer-links a { font-size: 1rem }
}

/* Phone landscape: a 390px-tall screen cannot hold a 150px lamp plus the
   copy under a 76px header, so the lamp shrinks and the hero clears the band. */
@media (max-height: 500px) and (orientation: landscape) {
  .hero { padding-block: calc(var(--hdr-top) + var(--hdr-h) + 8px) 24px }
  .lamp { width: 84px; margin-bottom: -20px }
  .landing-container { --title-fs: clamp(26px, 3.4vw, 34px); --gap-lamp: 8px; --gap-sub: 8px; --gap-cta: 16px; --cta-h: 48px }
}

/* Below-sky continuation — DesertSky's ending peach (Discovery-style fix) */
.landing-container.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}

/* Moved from the global block (2026-10-01): :deep() only works in scoped CSS
   — the copper rule was silently dropped there — and .lamp must not leak. */
.hero .magic-subtitle,
.day-mode .magic-subtitle,
.landing-container:not(.day-mode) .magic-subtitle { text-shadow: none } /* founder 2026-10-01: its glow rendered unreliably */
/* Shape-following glow (2nd approach): drop-shadows that trace the lamp's own
   silhouette, placed on .lamp — the element that CONTAINS the ::after blend —
   so they are computed on the finished lamp and are never clipped to its box
   (the clipping only happens to filters painted INSIDE the blend group). */
.day-mode .lamp {
  filter: drop-shadow(0 0 8px rgba(255,170,80,0.45)) drop-shadow(0 0 18px rgba(206,96,26,0.18));
}
.landing-container:not(.day-mode) .lamp {
  filter: drop-shadow(0 0 8px rgba(255,214,150,0.5))
          drop-shadow(0 0 26px rgba(255,170,90,0.4))
          drop-shadow(0 0 60px rgba(255,140,60,0.26));
}
@media (max-width: 768px) {
  .landing-container:not(.day-mode) .lamp {
    filter: drop-shadow(0 0 7px rgba(255,214,150,0.45)) drop-shadow(0 0 20px rgba(255,170,90,0.3));
  }
}

/* (2026-10-01) Day brand word stays the shared gold — the founder reverted the
   copper test: the brand colour must match every other page. */



/* DAY CHOICE (founder 2026-10-01, from the four rendered options; night
   unchanged): brand words = option 2 "clean gold" — the shared gradient
   (#D4AF37 -> #FF8C00, same as every page) with NO glow; Make a Wish =
   option 4 "glass" — clear glass pill, hairline light rim, soft even lift,
   label in the headline brown. */
.day-mode .magic-title :deep(.brand-grad),
.day-mode .features-heading :deep(.brand-grad),
.landing-container.day-mode .app-name { filter: none; text-shadow: none }
.landing-container.day-mode .hero .magic-button {
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.75), 0 0 16px -4px rgba(140,61,7,0.2);
}
.landing-container.day-mode .hero .magic-button:hover {
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 20px -4px rgba(140,61,7,0.28);
}
.landing-container.day-mode .hero .magic-button::before {
  background: rgba(255,255,255,0.28); filter: none;
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: background-color 0.2s ease;
}
.landing-container.day-mode .hero .magic-button:hover::before { background: rgba(255,255,255,0.4) }
.landing-container.day-mode .hero .wish-label,
.landing-container.day-mode .hero .magic-button:hover .wish-label { color: #8C3D07; -webkit-text-fill-color: #8C3D07; text-shadow: none }
/* DAY Make a Wish = glacier glass filled with a moving warm light (founder
   2026-10-01: chosen over the plain glass; DAY ONLY — night keeps its gold
   pill, the starry sky is night's animation). Clear glass on the pill itself;
   ::before = three soft warm light pools far LARGER than the pill
   (inset -150% / -45%) drifting by translate only — no rotation, so no layer
   edge can ever enter the pill. Overrides the plain-glass day choice above. */
.landing-container.day-mode .hero .magic-button {
  overflow: hidden; isolation: isolate;
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.65), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 16px -3px rgba(190,110,40,0.28);
}
.landing-container.day-mode .hero .magic-button:hover {
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.85), 0 0 20px -3px rgba(190,110,40,0.36);
}
.landing-container.day-mode .hero .magic-button::before,
.landing-container.day-mode .hero .magic-button:hover::before {
  inset: -150% -45%; border-radius: 0; filter: blur(12px); opacity: 0.8;
  backdrop-filter: none; -webkit-backdrop-filter: none;
  background:
    radial-gradient(22% 26% at 34% 52%, rgba(255,168,60,0.75), rgba(255,168,60,0) 100%),
    radial-gradient(20% 24% at 62% 46%, rgba(255,214,120,0.7), rgba(255,214,120,0) 100%),
    radial-gradient(18% 22% at 48% 58%, rgba(226,112,52,0.55), rgba(226,112,52,0) 100%),
    rgba(255,255,255,0.22);
  animation: wishFlow 9s ease-in-out infinite;
}
.landing-container.day-mode .hero .magic-button:hover::before { opacity: 0.95 }
.landing-container.day-mode .hero .wish-label,
.landing-container.day-mode .hero .magic-button:hover .wish-label { color: #4a2508; -webkit-text-fill-color: #4a2508; text-shadow: 0 0 8px rgba(255,248,235,0.75) }
@keyframes wishFlow {
  0%   { transform: translate(-9%, 2%) }
  33%  { transform: translate(7%, -3%) }
  66%  { transform: translate(-3%, 4%) }
  100% { transform: translate(-9%, 2%) }
}
@media (prefers-reduced-motion: reduce) { .landing-container.day-mode .hero .magic-button::before { animation: none } }

/* ONE BROWN FAMILY for day text, built on BRONZE #7A4A1C (founder
   2026-10-01 picked "bronze" from four rendered heading colours; before that
   there were four unrelated browns). Full bronze for headings, the wish
   label, footer links and the language control; a softened tone of the SAME
   hue for body copy (#7a5434, ~4.6:1 on the sand). The brand gold "Jinni"
   stays as it is. */
.day-mode .magic-title,
.day-mode .features-heading,
.day-mode .wish-item h3,
.day-mode .cities-country-name { color: #7A4A1C }
.day-mode .hero .magic-subtitle,
.day-mode .wish-item p,
.day-mode .footer-copyright { color: #7a5434 }
.landing-container.day-mode .hero .wish-label,
.landing-container.day-mode .hero .magic-button:hover .wish-label { color: #7A4A1C; -webkit-text-fill-color: #7A4A1C }
.day-mode .footer-links a { color: #7A4A1C }
.landing-container.day-mode { --lang-ink: #7A4A1C }

/* NIGHT HOVER GLOW AS A FADING LAYER (founder 2026-10-01: "if I hover Make a
   Wish the upper side of the shadow may vanish"). Hover used to TRANSITION
   box-shadow from --wish-halo to the larger --wish-halo-hover; while a shadow
   grows, Chrome can leave the newly covered area above the pill unpainted, so
   the top of the glow dropped out. Now the base glow is a static box-shadow
   and the stronger hover glow lives on ::after, always painted, fading in by
   opacity only — no shadow geometry ever changes on hover. Night only: the
   day pill clips its children (overflow: hidden) for the moving light. */
.landing-container:not(.day-mode) .hero .magic-button,
.landing-container:not(.day-mode) .hero .magic-button:hover { box-shadow: var(--wish-halo); transition: none }
.landing-container:not(.day-mode) .hero .magic-button::after {
  /* a blurred pool of the glow's own colours UNDER and around the pill, not a
     box-shadow: a shadow stops at the box edge, and through the 86% gold that
     edge showed as a thin dark ring on hover. */
  content: ''; position: absolute; inset: -10px -12px; z-index: -1; border-radius: 999px; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,200,120,0.55), rgba(255,160,80,0.32) 60%, rgba(255,140,60,0) 100%);
  filter: blur(10px); opacity: 0; transition: opacity 0.25s ease;
}
.landing-container:not(.day-mode) .hero .magic-button:hover::after,
.landing-container:not(.day-mode) .hero .magic-button:focus-visible::after { opacity: 1 }

/* ═══════════════════════════════════════════════════════════════════════════
   JINNI NIGHT (founder 2026-10-03, LandingLab night direction 4: "that one is
   powerful, set it for night mode"). Overrides the older night rules above by
   order (same specificity, later wins) — day mode is untouched.
   Background = <JinniNightSky> (JinniChat's gradient + drifting glows).
   ═══════════════════════════════════════════════════════════════════════════ */
/* nav + EN pill share one row */
.language-selector-container { gap: 8px }
/* nav panel tokens, per theme (LandingNav reads them) */
.landing-container.day-mode {
  --lnav-sheet: rgba(255,250,242,0.97); --lnav-sheet-ink: #7A4A1C; --lnav-rule: rgba(122,74,28,0.15);
  --lnav-sheet-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.8), 0 0 18px -2px rgba(140,61,7,0.18);
  --lnav-primary: linear-gradient(45deg, rgba(176,106,24,0.94), rgba(207,83,23,0.94)); --lnav-primary-ink: #fff;
}
.landing-container.jinni-night {
  --lnav-sheet: rgba(18,10,30,0.97); --lnav-sheet-ink: #f3eaf8; --lnav-rule: rgba(220,210,255,0.14);
  --lnav-sheet-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.16), 0 0 18px -2px rgba(0,0,0,0.6);
  --lnav-primary: linear-gradient(45deg, #E9C766, #FFA640); --lnav-primary-ink: #2a1405;
  --lang-ink: #f3eaf8; --lang-glass: rgba(255,255,255,0.06); --lang-glass-hover: rgba(255,255,255,0.12);
  --lang-rim: inset 0 0 0 0.75px rgba(220,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px -2px rgba(0,0,0,0.3);
  --lang-hover: rgba(220,210,255,0.1);
}
/* the starry-sky vignette is not part of this look */
.landing-container.jinni-night::after { content: none }

/* lamp: bigger, glowing — the warm light of the page */
.landing-container.jinni-night .lamp { width: 190px; margin-bottom: -46px;
  filter: drop-shadow(0 0 28px rgba(255,160,70,0.45)) drop-shadow(0 0 70px rgba(255,130,50,0.22)) }
@media (max-width: 768px) { .landing-container.jinni-night .lamp { width: 130px; margin-bottom: -31px } }

/* type: full-strength, plain (the lab version) */
.landing-container.jinni-night .magic-title,
.landing-container.jinni-night .features-heading { color: #fbf5ff; text-shadow: 0 0 30px rgba(255,170,90,0.16) }
.landing-container.jinni-night .magic-title :deep(.brand-grad),
.landing-container.jinni-night .features-heading :deep(.brand-grad) {
  background: none; -webkit-text-fill-color: currentColor; color: inherit; filter: none }
.landing-container.jinni-night .magic-subtitle { color: #c5bcd6; text-shadow: none }
.landing-container.jinni-night .app-name { filter: drop-shadow(0 0 10px rgba(255,170,90,0.35)) }

/* Make a Wish = Ember Breath: clear glass, the light lives inside and rises
   from a new spot each breath (utils/emberBreath.js moves --ex/--ey) */
.landing-container.jinni-night .hero .magic-button,
.landing-container.jinni-night .hero .magic-button:hover {
  overflow: hidden; isolation: isolate; background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  box-shadow: inset 0 0 0 0.75px rgba(255,240,215,0.38), inset 0 1px 0 rgba(255,246,228,0.5), 0 0 18px -2px rgba(255,160,80,0.32);
  transition: --ex 3.4s ease-in-out, --ey 3.4s ease-in-out, box-shadow 0.25s ease;
}
.landing-container.jinni-night .hero .magic-button:hover,
.landing-container.jinni-night .hero .magic-button:focus-visible {
  box-shadow: inset 0 0 0 0.75px rgba(255,240,215,0.5), inset 0 1px 0 rgba(255,246,228,0.62), 0 0 22px -2px rgba(255,160,80,0.44);
}
.landing-container.jinni-night .hero .magic-button::before {
  filter: none; backdrop-filter: none; -webkit-backdrop-filter: none;
  background: radial-gradient(62% 120% at var(--ex, 50%) var(--ey, 110%), rgba(255,150,50,0.62), rgba(255,150,50,0) 70%),
              radial-gradient(34% 80% at var(--ex, 50%) var(--ey, 110%), rgba(255,228,170,0.5), rgba(255,228,170,0) 70%);
  animation: ember-breathe 3.4s ease-in-out infinite;
}
.landing-container.jinni-night .hero .magic-button::after,
.landing-container.jinni-night .hero .magic-button:hover::after {
  content: ''; position: absolute; inset: -60% -30%; z-index: 0; border-radius: 0; opacity: 1; pointer-events: none; filter: blur(12px);
  background: radial-gradient(18% 30% at 30% 50%, rgba(233,199,102,0.34), rgba(233,199,102,0) 100%);
  animation: ember-drift 11s ease-in-out infinite; transition: none;
}
.landing-container.jinni-night .hero .wish-label,
.landing-container.jinni-night .hero .magic-button:hover .wish-label {
  color: #fffaf0; -webkit-text-fill-color: #fffaf0; text-shadow: 0 0 10px rgba(120,50,0,0.55), 0 0 2px rgba(80,30,0,0.4) }
@keyframes ember-breathe { 0%, 100% { opacity: 0.38 } 50% { opacity: 0.82 } }
@keyframes ember-drift { 0% { transform: translate(-9%, 2%) } 33% { transform: translate(7%, -3%) } 66% { transform: translate(-3%, 4%) } 100% { transform: translate(-9%, 2%) } }
@media (prefers-reduced-motion: reduce) {
  .landing-container.jinni-night .hero .magic-button::before,
  .landing-container.jinni-night .hero .magic-button::after { animation: none }
}

/* features = three frosted-glass cards over the moving glows */
.landing-container.jinni-night .features-grid { gap: 16px }
.landing-container.jinni-night .wish-item,
.landing-container.jinni-night .wish-item:first-child,
.landing-container.jinni-night .wish-item:last-child {
  padding: 26px 24px; border: none; border-radius: 22px; background: rgba(255,255,255,0.05);
  backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%);
  box-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -2px rgba(0,0,0,0.45);
}
.landing-container.jinni-night .wish-num { color: #ffb36b; text-shadow: none; opacity: 1 }
.landing-container.jinni-night .wish-item h3 { color: #f3eaf8 }
.landing-container.jinni-night .wish-item p { color: #c9c0da }
@media (max-width: 768px) {
  .landing-container.jinni-night .features-grid { gap: 12px }
  .landing-container.jinni-night .wish-item { border-top: none }
}

/* cities = glass pills */
.landing-container.jinni-night .cities-grid { gap: 10px }
.landing-container.jinni-night .city-card { padding: 9px 16px; border-radius: 999px; background: rgba(255,255,255,0.06);
  box-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.18) }
.landing-container.jinni-night .city-card:hover { background: rgba(255,255,255,0.1) }
.landing-container.jinni-night .city-card::after { content: none }
.landing-container.jinni-night .city-card-body { flex-direction: row; align-items: baseline; gap: 8px }
.landing-container.jinni-night .city-card-name { color: #f3eaf8; text-shadow: none }
.landing-container.jinni-night .city-card:hover .city-card-name { color: #fff; text-shadow: none }
.landing-container.jinni-night .city-card-meta { color: #a99fbf }
.landing-container.jinni-night .cities-country-name { color: #c5bcd6 }
.landing-container.jinni-night .cities-sub { color: #c5bcd6 }
.landing-container.jinni-night .footer-links a { color: #e6dcf2 }
.landing-container.jinni-night .footer-copyright { color: rgba(220,210,240,0.55) }

/* ── JINNI NIGHT · the preview's layout and type (founder 2026-10-03: "the font
   there, layout, everything was interesting and better … mine looked
   childish"). Ported from LandingLab/night-directions.html design 4 so the
   live page IS the preview: Cinzel titles at 500 (not bold), Lora for every
   sentence, lamp + JINNI mark, a hero that flows instead of filling the
   screen, one section rhythm, the plain-link desktop bar, a ruled footer.
   Night only — day keeps its own layout. ── */
.landing-container.jinni-night { --section: clamp(64px, 9vw, 104px); --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif }

/* mark: small lamp + JINNI (Cinzel's lowercase is small caps) */
.landing-container.jinni-night .header-container { gap: 10px }
.landing-container.jinni-night .brand-lamp { width: 44px; height: auto; margin: -6px -4px -6px -6px; filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)) }
.landing-container.jinni-night .app-name { font-size: 22px; font-weight: 600; letter-spacing: 2px; background: none; -webkit-text-fill-color: #f3eaf8; color: #f3eaf8; filter: none }

/* desktop bar: plain links, an outlined Sign in — no capsule */
.landing-container.jinni-night :deep(.lnav-links) { background: none; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; gap: 8px; padding: 0 }
.landing-container.jinni-night :deep(.lnav-links a) { font-family: var(--lora); font-weight: 400; opacity: 0.75 }
.landing-container.jinni-night :deep(.lnav-links a:hover) { opacity: 1; background: none }
.landing-container.jinni-night :deep(.lnav-links .lnav-signin) { opacity: 0.9; padding: 8px 16px; margin-inline-start: 8px }
.landing-container.jinni-night .lang-trigger { font-family: var(--lora) }

/* hero: flows from under the bar; lamp → title → line → button */
.landing-container.jinni-night .hero { min-height: 0; display: block; padding: calc(var(--hdr-top) + var(--hdr-h) + clamp(40px, 7vh, 88px)) 24px var(--section) }
.landing-container.jinni-night .hero-content { max-width: 1180px; margin: 0 auto }
.landing-container.jinni-night .lamp { width: min(210px, 50vw); margin: 0 auto -8px }
.landing-container.jinni-night .hero .magic-title { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(36px, 6.4vw, 76px); line-height: 1.08;
  letter-spacing: 0.02em; max-width: 900px; margin: 0 auto 18px }
.landing-container.jinni-night .hero .magic-subtitle { font-family: var(--lora); font-size: clamp(17px, 2vw, 20px); line-height: 1.55; max-width: 560px; margin: 0 auto 34px }
.landing-container.jinni-night .hero .magic-button, .landing-container.jinni-night .hero .magic-button:hover { margin: 0; min-height: 56px; padding: 14px 36px }
.landing-container.jinni-night .hero .wish-label, .landing-container.jinni-night .hero .magic-button:hover .wish-label { font-family: var(--lora); font-size: 17px; font-weight: 600 }

/* features / plans */
.landing-container.jinni-night .features { padding: 0 24px var(--section) }
.landing-container.jinni-night .features-container { max-width: 1180px }
.landing-container.jinni-night .features h2.features-heading { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(24px, 3.2vw, 34px); line-height: 1.2;
  letter-spacing: 0.02em; margin: 0 0 clamp(28px, 4vw, 44px) }
.landing-container.jinni-night .wish-num { font-family: var(--brand-serif); font-size: 13px; font-weight: 400; line-height: 1; letter-spacing: 0.2em; margin: 0; opacity: 0.6 }
.landing-container.jinni-night .wish-item h3 { font-family: var(--lora); font-size: 18px; font-weight: 600; line-height: 1.3; margin: 14px 0 10px }
.landing-container.jinni-night .wish-item p { font-family: var(--lora); font-size: 15.5px; line-height: 1.6; margin: 0; color: rgba(238,230,246,0.78) }

/* the Explore / For Business switch: the bar's links do this job now */
.landing-container.jinni-night .mode-switch-wrapper { display: none }

/* cities */
.landing-container.jinni-night .cities { padding: 0 24px var(--section) }
.landing-container.jinni-night .cities .features-container { max-width: 900px }
.landing-container.jinni-night .cities h2.cities-heading { font-size: clamp(22px, 2.8vw, 30px); margin: 0 0 8px }
.landing-container.jinni-night .cities-sub { font-family: var(--lora); font-size: 16px; color: rgba(238,230,246,0.7); margin: 0 0 26px }
.landing-container.jinni-night .cities-country { margin: 0 auto 22px }
.landing-container.jinni-night .cities-country-name { font-family: var(--brand-serif); font-size: 12px; font-weight: 400; letter-spacing: 0.2em; color: rgba(238,230,246,0.55); opacity: 1; margin: 0 0 12px }
.landing-container.jinni-night .cities-grid { justify-content: center; gap: 10px 14px }
.landing-container.jinni-night .city-card-name { font-family: var(--lora); font-size: 17px; font-weight: 400 }
.landing-container.jinni-night .city-card-meta { font-family: var(--lora); font-size: 13px; opacity: 0.8 }

/* footer: one ruled line — © left, links right */
.landing-container.jinni-night .footer { margin-top: auto; padding: 0 }
.landing-container.jinni-night .footer-content { max-width: 1180px; margin: 0 auto; padding: 26px 24px calc(26px + env(safe-area-inset-bottom, 0px));
  display: flex; justify-content: space-between; align-items: center; gap: 12px 16px; flex-wrap: wrap;
  border-top: 1px solid rgba(200,190,255,0.14); text-align: start }
.landing-container.jinni-night .footer-copyright { order: -1; margin: 0; font-family: var(--lora); font-size: 13px; color: rgba(238,230,246,0.6) }
.landing-container.jinni-night .footer-links { gap: 0; justify-content: flex-end }
.landing-container.jinni-night .footer-links a { font-family: var(--lora); font-size: 13px; padding: 0; color: rgba(238,230,246,0.6) }
.landing-container.jinni-night .footer-links a:hover { color: #f3eaf8 }
.landing-container.jinni-night .footer-links a + a::before { content: '·'; margin: 0 8px; color: rgba(238,230,246,0.4) }
@media (max-width: 768px) {
  .landing-container.jinni-night .header-container { gap: 8px }
  .landing-container.jinni-night .brand-lamp { width: 38px }
  .landing-container.jinni-night .app-name { font-size: 20px }
  .landing-container.jinni-night .footer-content { justify-content: center; text-align: center }
}

/* Cinzel now loads (2026-10-03): it is a capitals face, so day keeps it for
   titles only and sets its sentence in Lora, as the Jinni Day preview does. */
.landing-container.day-mode .hero .magic-subtitle { font-family: 'Lora', 'Noto Serif Armenian', Georgia, serif }

/* day: the same preview layout as night */
.landing-container.day-mode { --section: clamp(64px, 9vw, 104px); --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif }

/* mark: small lamp + JINNI (Cinzel's lowercase is small caps) */
.landing-container.day-mode .header-container { gap: 10px }
.landing-container.day-mode .brand-lamp { width: 44px; height: auto; margin: -6px -4px -6px -6px; filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)) }
.landing-container.day-mode .app-name { font-size: 22px; font-weight: 600; letter-spacing: 2px; background: none; -webkit-text-fill-color: #f3eaf8; color: #f3eaf8; filter: none }

/* desktop bar: plain links, an outlined Sign in — no capsule */
.landing-container.day-mode :deep(.lnav-links) { background: none; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; gap: 8px; padding: 0 }
.landing-container.day-mode :deep(.lnav-links a) { font-family: var(--lora); font-weight: 400; opacity: 0.75 }
.landing-container.day-mode :deep(.lnav-links a:hover) { opacity: 1; background: none }
.landing-container.day-mode :deep(.lnav-links .lnav-signin) { opacity: 0.9; padding: 8px 16px; margin-inline-start: 8px }
.landing-container.day-mode .lang-trigger { font-family: var(--lora) }

/* hero: flows from under the bar; lamp → title → line → button */
.landing-container.day-mode .hero { min-height: 0; display: block; padding: calc(var(--hdr-top) + var(--hdr-h) + clamp(40px, 7vh, 88px)) 24px var(--section) }
.landing-container.day-mode .hero-content { max-width: 1180px; margin: 0 auto }
.landing-container.day-mode .lamp { width: min(210px, 50vw); margin: 0 auto -8px }
.landing-container.day-mode .hero .magic-title { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(36px, 6.4vw, 76px); line-height: 1.08;
  letter-spacing: 0.02em; max-width: 900px; margin: 0 auto 18px }
.landing-container.day-mode .hero .magic-subtitle { font-family: var(--lora); font-size: clamp(17px, 2vw, 20px); line-height: 1.55; max-width: 560px; margin: 0 auto 34px }
.landing-container.day-mode .hero .magic-button, .landing-container.day-mode .hero .magic-button:hover { margin: 0; min-height: 56px; padding: 14px 36px }
.landing-container.day-mode .hero .wish-label, .landing-container.day-mode .hero .magic-button:hover .wish-label { font-family: var(--lora); font-size: 17px; font-weight: 600 }

/* features / plans */
.landing-container.day-mode .features { padding: 0 24px var(--section) }
.landing-container.day-mode .features-container { max-width: 1180px }
.landing-container.day-mode .features h2.features-heading { font-family: var(--brand-serif); font-weight: 500; font-size: clamp(24px, 3.2vw, 34px); line-height: 1.2;
  letter-spacing: 0.02em; margin: 0 0 clamp(28px, 4vw, 44px) }
.landing-container.day-mode .wish-num { font-family: var(--brand-serif); font-size: 13px; font-weight: 400; line-height: 1; letter-spacing: 0.2em; margin: 0; opacity: 0.6 }
.landing-container.day-mode .wish-item h3 { font-family: var(--lora); font-size: 18px; font-weight: 600; line-height: 1.3; margin: 14px 0 10px }
.landing-container.day-mode .wish-item p { font-family: var(--lora); font-size: 15.5px; line-height: 1.6; margin: 0; color: rgba(238,230,246,0.78) }

/* the Explore / For Business switch: the bar's links do this job now */
.landing-container.day-mode .mode-switch-wrapper { display: none }

/* cities */
.landing-container.day-mode .cities { padding: 0 24px var(--section) }
.landing-container.day-mode .cities .features-container { max-width: 900px }
.landing-container.day-mode .cities h2.cities-heading { font-size: clamp(22px, 2.8vw, 30px); margin: 0 0 8px }
.landing-container.day-mode .cities-sub { font-family: var(--lora); font-size: 16px; color: rgba(238,230,246,0.7); margin: 0 0 26px }
.landing-container.day-mode .cities-country { margin: 0 auto 22px }
.landing-container.day-mode .cities-country-name { font-family: var(--brand-serif); font-size: 12px; font-weight: 400; letter-spacing: 0.2em; color: rgba(238,230,246,0.55); opacity: 1; margin: 0 0 12px }
.landing-container.day-mode .cities-grid { justify-content: center; gap: 10px 14px }
.landing-container.day-mode .city-card-name { font-family: var(--lora); font-size: 17px; font-weight: 400 }
.landing-container.day-mode .city-card-meta { font-family: var(--lora); font-size: 13px; opacity: 0.8 }

/* footer: one ruled line — © left, links right */
.landing-container.day-mode .footer { margin-top: auto; padding: 0 }
.landing-container.day-mode .footer-content { max-width: 1180px; margin: 0 auto; padding: 26px 24px calc(26px + env(safe-area-inset-bottom, 0px));
  display: flex; justify-content: space-between; align-items: center; gap: 12px 16px; flex-wrap: wrap;
  border-top: 1px solid rgba(200,190,255,0.14); text-align: start }
.landing-container.day-mode .footer-copyright { order: -1; margin: 0; font-family: var(--lora); font-size: 13px; color: rgba(238,230,246,0.6) }
.landing-container.day-mode .footer-links { gap: 0; justify-content: flex-end }
.landing-container.day-mode .footer-links a { font-family: var(--lora); font-size: 13px; padding: 0; color: rgba(238,230,246,0.6) }
.landing-container.day-mode .footer-links a:hover { color: #f3eaf8 }
.landing-container.day-mode .footer-links a + a::before { content: '·'; margin: 0 8px; color: rgba(238,230,246,0.4) }
@media (max-width: 768px) {
  .landing-container.day-mode .header-container { gap: 8px }
  .landing-container.day-mode .brand-lamp { width: 38px }
  .landing-container.day-mode .app-name { font-size: 20px }
  .landing-container.day-mode .footer-content { justify-content: center; text-align: center }
}

/* ── JINNI DAY (founder 2026-10-03: "below make a wish button, everything
   stayed as before … where is the background colour as in your preview").
   Day takes the same preview layout as night (the block above, re-keyed to
   day) plus LandingLab design 5's own colours: <JinniDaySky> behind, bronze
   type, white-glass cards and pills, Ember Breath with a copper light. ── */
.landing-container.day-mode { background: none; color: #7a5434;
  --lang-ink: #7A4A1C; --lang-glass: rgba(255,255,255,0.45); --lang-glass-hover: rgba(255,255,255,0.62);
  --lang-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), 0 0 18px -2px rgba(140,61,7,0.14); --lang-hover: rgba(140,61,7,0.08);
  --lnav-primary-ink: #6e3f16 }
.landing-container.day-mode::after { content: none }
.landing-container.day-mode .app-name { -webkit-text-fill-color: #b8741f; color: #b8741f }
.landing-container.day-mode .brand-lamp { filter: saturate(0.88) brightness(0.95) }
.landing-container.day-mode .lamp { filter: drop-shadow(0 0 26px rgba(255,170,80,0.45)) drop-shadow(0 0 60px rgba(230,140,60,0.2)) }
.landing-container.day-mode .static-bottle { filter: saturate(0.88) brightness(0.95) }
.landing-container.day-mode .hero .magic-title, .landing-container.day-mode .features h2.features-heading { color: #7A4A1C; -webkit-text-fill-color: #7A4A1C; background: none; text-shadow: none }
.landing-container.day-mode .magic-title :deep(.brand-grad), .landing-container.day-mode .features-heading :deep(.brand-grad) { background: none; -webkit-text-fill-color: currentColor; color: inherit; filter: none }
.landing-container.day-mode .hero .magic-subtitle { color: #8a6444; text-shadow: none }
/* cards */
.landing-container.day-mode .features-grid { gap: 16px }
.landing-container.day-mode .wish-item, .landing-container.day-mode .wish-item:first-child, .landing-container.day-mode .wish-item:last-child {
  padding: 26px 24px; border: none; border-radius: 22px; background: rgba(255,255,255,0.5);
  backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 18px -2px rgba(140,61,7,0.12) }
.landing-container.day-mode .wish-num { color: #c0702a; opacity: 1; text-shadow: none }
.landing-container.day-mode .wish-item h3 { color: #6e3f16 }
.landing-container.day-mode .wish-item p { color: rgba(122,84,52,0.85) }
@media (max-width: 768px) { .landing-container.day-mode .features-grid { gap: 12px } .landing-container.day-mode .wish-item { border-top: none } }
/* cities */
.landing-container.day-mode .cities-sub { color: rgba(122,84,52,0.8) }
.landing-container.day-mode .cities-country-name { color: rgba(122,74,28,0.6) }
.landing-container.day-mode .cities-grid { gap: 10px }
.landing-container.day-mode .city-card { padding: 9px 16px; border-radius: 999px; background: rgba(255,255,255,0.5);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 14px -4px rgba(140,61,7,0.14) }
.landing-container.day-mode .city-card:hover { background: rgba(255,255,255,0.7) }
.landing-container.day-mode .city-card::after { content: none }
.landing-container.day-mode .city-card-body { flex-direction: row; align-items: baseline; gap: 8px }
.landing-container.day-mode .city-card-name, .landing-container.day-mode .city-card:hover .city-card-name { color: #6e3f16; -webkit-text-fill-color: #6e3f16; background: none; text-shadow: none }
.landing-container.day-mode .city-card-meta { color: rgba(122,84,52,0.65) }
/* footer */
.landing-container.day-mode .footer-content { border-top-color: rgba(122,74,28,0.16) }
.landing-container.day-mode .footer-copyright, .landing-container.day-mode .footer-links a { color: rgba(122,84,52,0.75) }
.landing-container.day-mode .footer-links a:hover { color: #6e3f16 }
.landing-container.day-mode .footer-links a + a::before { color: rgba(122,84,52,0.4) }
/* Make a Wish = Ember Breath, day: clear white glass, copper light inside */
.landing-container.day-mode .hero .magic-button, .landing-container.day-mode .hero .magic-button:hover {
  overflow: hidden; isolation: isolate; background: rgba(255,255,255,0.35);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 18px -3px rgba(190,110,40,0.3);
  transition: --ex 3.4s ease-in-out, --ey 3.4s ease-in-out, box-shadow 0.25s ease }
.landing-container.day-mode .hero .magic-button:hover, .landing-container.day-mode .hero .magic-button:focus-visible {
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,1), 0 0 22px -2px rgba(190,110,40,0.42) }
.landing-container.day-mode .hero .magic-button::before {
  content: ''; position: absolute; inset: 0; z-index: 0; border-radius: inherit; pointer-events: none;
  filter: none; backdrop-filter: none; -webkit-backdrop-filter: none;
  background: radial-gradient(62% 120% at var(--ex, 50%) var(--ey, 110%), rgba(255,160,70,0.75), rgba(255,160,70,0) 70%),
              radial-gradient(34% 80% at var(--ex, 50%) var(--ey, 110%), rgba(255,230,170,0.7), rgba(255,230,170,0) 70%);
  animation: ember-breathe 3.4s ease-in-out infinite }
.landing-container.day-mode .hero .magic-button::after, .landing-container.day-mode .hero .magic-button:hover::after {
  content: ''; position: absolute; inset: -60% -30%; z-index: 0; border-radius: 0; opacity: 1; pointer-events: none; filter: blur(12px);
  background: radial-gradient(18% 30% at 30% 50%, rgba(255,200,120,0.5), rgba(255,200,120,0) 100%);
  animation: ember-drift 11s ease-in-out infinite; transition: none }
.landing-container.day-mode .hero .wish-label, .landing-container.day-mode .hero .magic-button:hover .wish-label {
  position: relative; z-index: 2; background: none; color: #6e3f16; -webkit-text-fill-color: #6e3f16; text-shadow: 0 0 8px rgba(255,248,235,0.8) }
@media (prefers-reduced-motion: reduce) { .landing-container.day-mode .hero .magic-button::before, .landing-container.day-mode .hero .magic-button::after { animation: none } }
.landing-container.day-mode { --lnav-wish-ink: #6e3f16; --lnav-wish-glass: rgba(255,255,255,0.35); --lnav-wish-ink-shadow: 0 0 8px rgba(255,248,235,0.8);
  --lnav-wish-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 18px -3px rgba(190,110,40,0.3);
  --lnav-wish-light: rgba(255,160,70,0.75); --lnav-wish-core: rgba(255,230,170,0.7) }
.landing-container.day-mode { --lnav-ghost-glass: rgba(140,61,7,0.06); --lnav-ghost-glass-hover: rgba(140,61,7,0.1); --lnav-ghost-shadow: none }
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