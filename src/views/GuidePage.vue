<template>
  <div class="gp" :class="theme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- the landing's world (founder 2026-10-04: "make jinni.travel/@guide more powerful
         like the landing"); first child, so App.vue's chrome sync reads its colours -->
    <JinniNightSky v-if="theme === 'night-mode'" />
    <JinniDaySky v-else />
    <header class="gp-top">
      <router-link to="/" class="gp-brand"><img src="/images/lamp.webp" alt="" class="gp-lamp" /><span translate="no">Jinni</span></router-link>
      <div class="gp-top-right">
        <GuideLangSwitch />
        <router-link to="/guides" class="gp-link">{{ t('guides.nav.for_guides') }}</router-link>
      </div>
    </header>

    <main class="gp-main">
      <p v-if="loading" class="gp-muted">{{ t('guides.page.loading') }}</p>

      <section v-else-if="!guide" class="gp-panel gp-center">
        <h1>{{ t('guides.page.not_found_title') }}</h1>
        <p class="gp-muted">{{ t('guides.page.not_found_text') }}</p>
        <router-link to="/" class="gp-btn jinni-pill">{{ t('guides.page.go_jinni') }}</router-link>
      </section>

      <template v-else>
        <section class="gp-hero">
          <div class="gp-avatar"><span>{{ initials }}</span></div>
          <div class="gp-hero-text">
            <p class="gp-kicker">{{ t('guides.types_short.' + (guide.guideType || 'local')) }} · {{ guide.region }}</p>
            <h1>{{ guide.displayName }}</h1>
            <a :href="`https://www.instagram.com/${guide.instagram}/`" target="_blank" rel="noopener" class="gp-ig"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" class="dot"/></svg>{{ t('guides.page.instagram_link', { handle: '@' + guide.instagram }) }}</a>
            <p v-if="guide.bio" class="gp-bio">{{ guide.bio }}</p>
            <p v-if="guide.languages.length" class="gp-langs" :aria-label="t('guides.page.guides_in', { langs: languagesText })"><span v-for="l in guide.languages" :key="l">{{ t('guides.langs.' + l) }}</span></p>
          </div>
        </section>

        <div class="gp-ask">
          <router-link :to="askTo" class="gp-btn gp-cta" @click="tagGuideVisit(guide.handle)">{{ t('guides.page.ask', { name: firstName }) }}</router-link>
          <p class="gp-muted">{{ t('guides.page.ask_note') }}</p>
        </div>

        <nav class="gp-tabs" v-if="picks.length">
          <button v-for="tb in tabs" :key="tb.key" type="button" class="gp-tab" :class="{ on: tab === tb.key, 'jinni-chip-on': tab === tb.key }" @click="tab = tb.key">{{ tb.label }} <span>{{ tb.count }}</span></button>
        </nav>

        <p v-if="!picks.length" class="gp-muted gp-center">{{ t('guides.page.no_picks', { name: firstName }) }}</p>

        <section class="gp-grid">
          <article v-for="p in shown" :key="p.id" class="gp-card">
            <div v-if="p.image" class="gp-media"><img :src="guideImage(p.image)" :alt="p.name" class="gp-img" loading="lazy" /><span class="gp-tag on-photo">{{ t('guides.categories.' + p.category) }}</span></div>
            <div class="gp-body">
              <span v-if="!p.image" class="gp-tag">{{ t('guides.categories.' + p.category) }}</span>
              <h3>{{ p.name }}</h3>
              <p v-if="p.address" class="gp-muted gp-addr">{{ p.address }}</p>
              <p v-if="p.note" class="gp-note">"{{ p.note }}" <span>— {{ firstName }}</span></p>
              <div v-if="p.tour" class="gp-tour">
                <strong>{{ p.tour.title }}</strong>
                <span v-if="p.tour.durationHours">{{ t('guides.page.hours_short', { n: p.tour.durationHours }) }}</span>
                <span v-if="p.tour.price != null">{{ p.tour.price }} {{ p.tour.currency || '' }}</span>
                <span class="gp-book">{{ t('guides.page.book') }} <bdi>{{ p.tour.contact }}</bdi></span>
              </div>
              <div class="gp-card-actions">
                <a v-if="p.lat != null" :href="`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`" target="_blank" rel="noopener" class="gp-btn-ghost">{{ t('guides.page.map') }}</a>
                <button v-if="p.embedUrl" type="button" class="gp-btn-ghost gp-reel-btn" :class="{ on: openReel === p.id }" @click="toggleReel(p.id)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="15" height="15" rx="3.5"/><path d="M9 9.3v6.4l5.2-3.2z" class="fill"/><path d="M20 1.8l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" class="spark"/></svg>{{ openReel === p.id ? t('guides.page.hide_reel') : t('guides.page.watch_reel') }}</button>
              </div>
              <!-- only the video of the reel, without Instagram's header and details (founder 2026-10-05) -->
              <div v-if="openReel === p.id && p.embedUrl" class="gp-embed"><ReelCrop :embed="p.embedUrl" :ig-label="t('guides.page.watch_reel')" /></div>
            </div>
          </article>
        </section>
      </template>
    </main>

    <footer class="gp-foot">{{ t('guides.page.foot') }} <router-link to="/">Jinni</router-link> · <router-link to="/guides">{{ t('guides.page.become') }}</router-link></footer>
  </div>
</template>

<script setup>
import '@/assets/styles/jinni-pill.css'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { guideTheme, guideApi, CATEGORY_KEYS, tagGuideVisit, hasToken, initGuideLanguage, guideImage } from '@/utils/guides'
import GuideLangSwitch from '@/components/guides/GuideLangSwitch.vue'
import ReelCrop from '@/components/ui/ReelCrop.vue'
import JinniDaySky from '@/components/ui/JinniDaySky.vue'
import JinniNightSky from '@/components/ui/JinniNightSky.vue'

const { t, locale } = useI18n()
initGuideLanguage(locale)

const route = useRoute()
const theme = guideTheme()
const loading = ref(true)
const guide = ref(null)
const picks = ref([])
const tab = ref('all')
const openReel = ref(null)

const firstName = computed(() => String(guide.value?.displayName || '').split(' ')[0] || '')
const initials = computed(() => String(guide.value?.displayName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())
const languagesText = computed(() => (guide.value?.languages || []).map(l => t('guides.langs.' + l)).join(', '))
const askTo = computed(() => (hasToken() ? '/chat' : `/auth?redirect=/chat`))
const tabs = computed(() => [{ key: 'all', label: t('guides.categories_plural.all'), count: picks.value.length },
  ...CATEGORY_KEYS.map(key => ({ key, label: t('guides.categories_plural.' + key), count: picks.value.filter(p => p.category === key).length })).filter(x => x.count)])
const shown = computed(() => (tab.value === 'all' ? picks.value : picks.value.filter(p => p.category === tab.value)))
const toggleReel = (id) => { openReel.value = openReel.value === id ? null : id }

onMounted(async () => {
  const handle = String(route.params.handle || '').toLowerCase()
  try {
    const r = await guideApi(`/public/${encodeURIComponent(handle)}`)
    guide.value = r.guide
    picks.value = r.picks || []
    document.title = `${r.guide.displayName} — ${t('guides.page.title_suffix')}`
    tagGuideVisit(r.guide.handle)
  } catch { guide.value = null } finally { loading.value = false }
})
</script>

<style scoped>
.gp { min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 40px; box-sizing: border-box; }
.gp.day-mode { color: #3c2a1e; }
.gp.night-mode { color: #f5e6c8; }
/* Both themes end on their TOP colour: iOS 26 paints the area past the page
   with one solid colour (the top), so a page ending lighter showed a band at
   the bottom edge (founder 2026-10-03). */
.gp-top { max-width: 960px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
.gp-brand { display: inline-flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 600; text-decoration: none; color: inherit; }
.gp-lamp { width: 52px; margin-block: -8px; margin-inline: -8px -4px; }
.gp-top-right { display: flex; align-items: center; gap: 8px; }
.gp-link { color: inherit; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; box-sizing: border-box; font-size: 15px; line-height: 1; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); white-space: nowrap; }
.gp-main { max-width: 960px; margin: 0 auto; }
.gp-center { text-align: center; }
.gp-panel { border-radius: 20px; padding: 26px; display: grid; gap: 12px; justify-items: center; }
.day-mode .gp-panel { background: rgba(255, 255, 255, 0.65); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .gp-panel { background: rgba(255, 255, 255, 0.05); }
.gp-hero { display: flex; gap: 18px; align-items: flex-start; margin: 14px 0 20px; }
.gp-avatar { flex: 0 0 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; font-size: 28px; font-weight: 700; color: #2b1d0e; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 18px -2px rgba(255, 140, 0, 0.45); }
.gp-kicker { letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px; color: #b4540a; margin: 0 0 4px; }
.night-mode .gp-kicker { color: #ffd27a; }
.gp-hero h1 { margin: 0 0 4px; font-size: clamp(28px, 6vw, 40px); }
.gp-ig { color: #b4540a; font-size: 15px; }
.night-mode .gp-ig { color: #ffd27a; }
.gp-bio { margin: 10px 0 6px; line-height: 1.55; max-width: 620px; }
.gp-ask { margin: 0 0 24px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.gp-btn { justify-self: start; }
.gp-btn-ghost { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.6); background: transparent; color: inherit; cursor: pointer; text-decoration: none; }
.gp-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.gp-tab { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.5); background: transparent; color: inherit; cursor: pointer; }
.gp-tab span { opacity: 0.65; margin-left: 4px; }
.gp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.gp-card { border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
.day-mode .gp-card { background: rgba(255, 255, 255, 0.7); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .gp-card { background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.5); }
.gp-img { width: 100%; aspect-ratio: 3 / 2; object-fit: cover; display: block; }
.gp-body { padding: 14px 16px 16px; display: grid; gap: 8px; }
.gp-body h3 { margin: 0; font-size: 19px; }
.gp-tag { justify-self: start; font-size: 12px; padding: 2px 10px; border-radius: 999px; background: rgba(212, 175, 55, 0.2); }
.gp-addr { font-size: 13px; }
.gp-note { margin: 0; font-style: italic; line-height: 1.5; }
.gp-note span { font-style: normal; opacity: 0.7; font-size: 14px; }
.gp-tour { display: flex; flex-wrap: wrap; gap: 6px 12px; padding: 10px 12px; border-radius: 12px; border: 1px dashed rgba(212, 175, 55, 0.6); font-size: 14px; }
.gp-tour strong { width: 100%; }
.gp-book { width: 100%; font-weight: 600; }
.gp-card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.gp-embed { display: flex; justify-content: center; --reel-h: min(560px, calc((100vw - 64px) * 16 / 9)); }
.gp-muted { opacity: 0.7; font-size: 14px; margin: 0; }
.gp-foot { max-width: 960px; margin: 40px auto 0; text-align: center; font-size: 13px; opacity: 0.75; }
.gp-foot a { color: inherit; }


/* ═══ jinni.travel/@guide · the landing's world (founder 2026-10-04: "make the
   guides page more powerful like the design way we did in landing page").
   Sky behind, lamp + JINNI, EN glass pill, a centred hero — the guide's initials
   in the chat chip's story ring with lamplight behind, name in Cinzel, Instagram
   as a glass pill, bio as a quote, languages as chips, Ember Breath "Ask Jinni
   like …" — glass tabs (chosen = gold), frosted pick cards with the category on
   the photo, the guide's note as a gold-tinted quote, tour on a gold glass plate,
   glass Map / Watch reel buttons, ruled footer. Content and logic unchanged. ═══ */
.gp { position: relative; z-index: 1; background: none; --serif: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif;
  --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif; font-family: var(--lora); padding-inline: 16px; }
.gp.day-mode { background: none; color: #7a5434;
  --ink: #7A4A1C; --body: #7a5434; --soft: rgba(122,84,52,0.75); --accent: #c0702a; --link: #9a5a1e;
  --glass: rgba(255,255,255,0.5); --glass-rim: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 18px -2px rgba(140,61,7,0.12);
  --chip: rgba(255,255,255,0.55); --chip-rim: inset 0 0 0 0.75px rgba(255,255,255,0.9); --chip-hover: rgba(255,255,255,0.75);
  --gold-fill: rgba(212,175,55,0.1); --gold-rim: rgba(184,125,40,0.32); --rule: rgba(122,74,28,0.16);
  --ring: conic-gradient(from 210deg, #ffb36b, #ffd27a, #e9a23b, #c0702a, #ffb36b); --disc: linear-gradient(135deg, #ffb36b, #c0702a); --disc-gap: rgba(249,240,222,1);
  --halo: rgba(255,170,80,0.32);
  --lang-ink: #7A4A1C; --lang-glass: rgba(255,255,255,0.45); --lang-glass-hover: rgba(255,255,255,0.62);
  --lang-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), 0 0 18px -2px rgba(140,61,7,0.14);
  --cta-ink: #6e3f16; --cta-glass: rgba(255,255,255,0.35); --cta-ink-shadow: 0 0 8px rgba(255,248,235,0.8);
  --cta-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 18px -3px rgba(190,110,40,0.3);
  --cta-light: rgba(255,160,70,0.75); --cta-core: rgba(255,230,170,0.7) }
.gp.night-mode { background: none; color: #eee6f6;
  --ink: #fbf5ff; --body: #c9c0da; --soft: rgba(220,210,240,0.68); --accent: #ffb36b; --link: #ffd29a;
  --glass: rgba(255,255,255,0.05); --glass-rim: inset 0 0 0 0.75px rgba(220,210,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -2px rgba(0,0,0,0.45);
  --chip: rgba(255,255,255,0.06); --chip-rim: inset 0 0 0 0.75px rgba(220,210,255,0.18); --chip-hover: rgba(255,255,255,0.1);
  --gold-fill: rgba(255,210,140,0.07); --gold-rim: rgba(255,210,122,0.3); --rule: rgba(200,190,255,0.14);
  --ring: conic-gradient(from 210deg, #c58bff, #7c4dff, #4f7bff, #6ad0ff, #ffd27a, #c58bff); --disc: linear-gradient(135deg, #8b5cf6, #4338ca 60%, #1e3a8a); --disc-gap: rgba(10,1,24,1);
  --halo: rgba(124,77,255,0.45);
  --lang-ink: #f3eaf8; --lang-glass: rgba(255,255,255,0.06); --lang-glass-hover: rgba(255,255,255,0.12);
  --lang-rim: inset 0 0 0 0.75px rgba(220,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px -2px rgba(0,0,0,0.3);
  --cta-ink: #fffaf0; --cta-glass: rgba(255,255,255,0.04); --cta-ink-shadow: 0 0 10px rgba(120,50,0,0.55), 0 0 2px rgba(80,30,0,0.4);
  --cta-rim: inset 0 0 0 0.75px rgba(255,240,215,0.38), inset 0 1px 0 rgba(255,246,228,0.5), 0 0 18px -2px rgba(255,160,80,0.32);
  --cta-light: rgba(255,150,50,0.62); --cta-core: rgba(255,228,170,0.5) }
@media (min-width: 900px) { .gp { padding-inline: 32px; } }

/* header */
.gp-top { max-width: 1080px; padding: 20px 0; }
.gp-brand { font-family: var(--serif); font-size: 22px; letter-spacing: 2px; color: var(--ink); }
.day-mode .gp-brand { color: #b8741f; }
.gp-lamp { width: 44px; margin: -6px -4px -6px -6px; }
.night-mode .gp-lamp { filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)); }
.day-mode .gp-lamp { filter: saturate(0.88) brightness(0.95); }
.gp-link { border: 0; height: auto; padding: 8px 4px; font-size: 14px; color: var(--soft); }
.gp-link:hover { color: var(--ink); background: none; }
.gp-top-right :deep(.gls-btn) { height: 40px; padding: 0 14px 0 12px; border: 0; font-size: 13.5px; font-weight: 600; color: var(--lang-ink);
  background: var(--lang-glass); box-shadow: var(--lang-rim); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); }
.gp-top-right :deep(.gls-btn:hover) { background: var(--lang-glass-hover); }

/* hero: centred, the guide in the spotlight */
.gp-main { max-width: 1080px; }
.gp-hero { flex-direction: column; align-items: center; text-align: center; gap: 16px; margin: clamp(18px, 5vh, 48px) auto 22px; max-width: 720px; position: relative; }
.gp-hero::before { content: ''; position: absolute; top: -40px; left: 50%; width: 420px; max-width: 100vw; height: 300px; transform: translateX(-50%); z-index: -1;
  pointer-events: none; filter: blur(40px); background: radial-gradient(closest-side, var(--halo), transparent); }
.gp-avatar { flex: none; width: 112px; height: 112px; padding: 3px; box-sizing: border-box; border-radius: 50%; background: var(--ring); box-shadow: 0 0 30px -6px var(--halo); font-size: 0; }
.gp-avatar span { width: 100%; height: 100%; border-radius: 50%; display: grid; place-items: center; font: 600 36px/1 var(--serif); letter-spacing: 0.04em;
  color: #fff; background: var(--disc); box-shadow: 0 0 0 3px var(--disc-gap); }
.gp-hero-text { display: grid; justify-items: center; gap: 10px; }
.gp-kicker, .night-mode .gp-kicker { margin: 0; font-family: var(--serif); font-size: 12.5px; letter-spacing: 0.22em; color: var(--accent); }
.gp-hero h1 { margin: 0; font-family: var(--serif); font-weight: 500; font-size: clamp(34px, 6vw, 60px); line-height: 1.08; letter-spacing: 0.02em; color: var(--ink);
  text-wrap: balance; text-shadow: 0 0 30px rgba(255,170,90,0.16); }
.day-mode .gp-hero h1 { text-shadow: none; }
.gp-ig, .night-mode .gp-ig { display: inline-flex; align-items: center; gap: 8px; padding: 8px 15px 8px 12px; border-radius: 999px; text-decoration: none; font-size: 14.5px;
  color: var(--ink); background: var(--chip); box-shadow: var(--chip-rim); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.gp-ig:hover { background: var(--chip-hover); }
.gp-ig svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; }
.gp-ig svg .dot { fill: currentColor; stroke: none; }
.gp-bio { margin: 2px 0 0; max-width: 560px; font-style: italic; font-size: clamp(16.5px, 2vw, 18.5px); line-height: 1.6; color: var(--body); }
.gp-bio::before { content: '“'; } .gp-bio::after { content: '”'; }
.gp-langs { margin: 2px 0 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.gp-langs span { padding: 4px 11px; border-radius: 999px; font-size: 12.5px; color: var(--body); background: var(--chip); box-shadow: var(--chip-rim); }

/* Ask Jinni like … = Ember Breath glass (the landing's Make a Wish) */
.gp-ask { flex-direction: column; justify-content: center; gap: 10px; margin: 6px 0 34px; text-align: center; }
.gp .gp-cta { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 14px 36px;
  border: 0; border-radius: 999px; text-decoration: none; font: 600 17px/1.25 var(--lora); color: var(--cta-ink); text-shadow: var(--cta-ink-shadow); background: var(--cta-glass);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); box-shadow: var(--cta-rim); }
.gp .gp-cta::before { content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: radial-gradient(62% 120% at 50% 110%, var(--cta-light), transparent 70%), radial-gradient(34% 80% at 50% 110%, var(--cta-core), transparent 70%);
  animation: gp-breathe 3.4s ease-in-out infinite; }
@keyframes gp-breathe { 0%, 100% { opacity: 0.45 } 50% { opacity: 0.9 } }
@media (prefers-reduced-motion: reduce) { .gp .gp-cta::before { animation: none; } }
.gp-ask .gp-muted { color: var(--soft); opacity: 1; }

/* tabs: glass, the chosen one gold */
.gp-tabs { justify-content: center; margin-bottom: 22px; }
.gp-tab { border: 0; color: var(--body); background: var(--chip); box-shadow: var(--chip-rim); transition: background-color 0.2s ease; }
.gp-tab:hover { background: var(--chip-hover); }
.gp-tab.on, .gp-tab.jinni-chip-on { color: #fff !important; background: linear-gradient(45deg, #D4AF37, #FF8C00) !important; box-shadow: 0 0 14px -4px rgba(255,140,0,0.5) !important; border: 0 !important; }

/* pick cards: frosted glass like the landing cards */
.gp-grid { gap: 18px; }
.day-mode .gp-card, .night-mode .gp-card { border-radius: 22px; background: var(--glass); box-shadow: var(--glass-rim);
  backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%); }
.gp-media { position: relative; }
.gp-media::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(8,4,18,0.35) 0%, transparent 35%); }
.gp-tag { font-family: var(--serif); font-size: 11px; letter-spacing: 0.14em; color: var(--accent); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim); }
.gp-tag.on-photo { position: absolute; z-index: 1; top: 10px; left: 10px; color: #fff4e2; background: rgba(16,7,34,0.45); box-shadow: inset 0 0 0 0.75px rgba(255,235,200,0.35);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.gp-body { padding: 16px 18px 18px; gap: 9px; }
.gp-body h3 { font: 600 19px/1.3 var(--lora); color: var(--ink); }
.gp-addr { color: var(--soft); opacity: 1; }
.gp-note { padding: 10px 13px; border-radius: 14px; background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim); color: var(--body); font-size: 15px; }
.gp-note span { color: var(--accent); opacity: 1; font-size: 13px; }
.gp-tour { border: 0; border-radius: 14px; background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim), 0 0 16px -8px rgba(255,170,80,0.5); color: var(--body); }
.gp-tour strong { color: var(--ink); font-family: var(--lora); }
.gp-book { color: var(--link); }
.gp-btn-ghost { display: inline-flex; align-items: center; gap: 7px; border: 0; color: var(--ink); background: var(--chip); box-shadow: var(--chip-rim); }
.gp-btn-ghost:hover { background: var(--chip-hover); }
.gp-reel-btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; }
.gp-reel-btn svg .fill { fill: currentColor; stroke: none; }
.gp-reel-btn svg .spark { fill: #FFB347; stroke: none; filter: drop-shadow(0 0 2px rgba(255,170,70,0.9)); }
.gp-reel-btn.on { box-shadow: inset 0 0 0 0.75px rgba(255,200,120,0.6), 0 0 14px -2px rgba(255,160,70,0.55); }

/* not found + footer */
.day-mode .gp-panel, .night-mode .gp-panel { background: var(--glass); box-shadow: var(--glass-rim); border-radius: 26px; }
.gp-panel h1 { font-family: var(--serif); font-weight: 500; color: var(--ink); }
.gp-foot { max-width: 1080px; margin-top: clamp(48px, 8vw, 88px); padding: 22px 0 calc(26px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--rule); color: var(--soft); opacity: 1; }
.gp-foot a { color: var(--link); text-decoration: none; }

/* COMET ARC (design 3, founder 2026-10-04) — the same edge as the chat chip and video button */
.gp-avatar { background: none !important; padding: 0; position: relative; }
.gp-avatar span { box-shadow: none !important; }
.gp-avatar::before { content: ''; position: absolute; inset: -9px; border-radius: 50%; padding: 3px; pointer-events: none; background: conic-gradient(from 20deg, rgba(255,210,122,0) 0deg, rgba(255,210,122,0.15) 60deg, #ffd27a 300deg, #fff3d6 330deg, rgba(255,210,122,0) 331deg); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); }
.day-mode .gp-avatar::before { background: conic-gradient(from 20deg, rgba(192,112,42,0) 0deg, rgba(192,112,42,0.15) 60deg, #c0702a 300deg, #ffb36b 330deg, rgba(192,112,42,0) 331deg); }
</style>
