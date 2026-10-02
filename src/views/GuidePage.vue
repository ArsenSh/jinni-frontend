<template>
  <div class="gp" :class="theme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <header class="gp-top">
      <router-link to="/" class="gp-brand"><img src="/images/bottle.png" alt="" class="gp-lamp" /><span translate="no">Jinni</span></router-link>
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
          <div class="gp-avatar">{{ initials }}</div>
          <div>
            <p class="gp-kicker">{{ t('guides.types_short.' + (guide.guideType || 'local')) }} · {{ guide.region }}</p>
            <h1>{{ guide.displayName }}</h1>
            <a :href="`https://www.instagram.com/${guide.instagram}/`" target="_blank" rel="noopener" class="gp-ig">{{ t('guides.page.instagram_link', { handle: '@' + guide.instagram }) }}</a>
            <p v-if="guide.bio" class="gp-bio">{{ guide.bio }}</p>
            <p v-if="guide.languages.length" class="gp-muted">{{ t('guides.page.guides_in', { langs: languagesText }) }}</p>
          </div>
        </section>

        <div class="gp-ask">
          <router-link :to="askTo" class="gp-btn jinni-pill" @click="tagGuideVisit(guide.handle)">{{ t('guides.page.ask', { name: firstName }) }}</router-link>
          <p class="gp-muted">{{ t('guides.page.ask_note') }}</p>
        </div>

        <nav class="gp-tabs" v-if="picks.length">
          <button v-for="tb in tabs" :key="tb.key" type="button" class="gp-tab" :class="{ on: tab === tb.key, 'jinni-chip-on': tab === tb.key }" @click="tab = tb.key">{{ tb.label }} <span>{{ tb.count }}</span></button>
        </nav>

        <p v-if="!picks.length" class="gp-muted gp-center">{{ t('guides.page.no_picks', { name: firstName }) }}</p>

        <section class="gp-grid">
          <article v-for="p in shown" :key="p.id" class="gp-card">
            <img v-if="p.image" :src="guideImage(p.image)" :alt="p.name" class="gp-img" loading="lazy" />
            <div class="gp-body">
              <span class="gp-tag">{{ t('guides.categories.' + p.category) }}</span>
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
                <button v-if="p.embedUrl" type="button" class="gp-btn-ghost" @click="toggleReel(p.id)">{{ openReel === p.id ? t('guides.page.hide_reel') : t('guides.page.watch_reel') }}</button>
              </div>
              <div v-if="openReel === p.id && p.embedUrl" class="gp-embed"><iframe :src="p.embedUrl" loading="lazy" scrolling="no" allowtransparency="true" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="strict-origin-when-cross-origin" :title="guide.displayName + ' — Instagram'"></iframe></div>
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
.gp.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 100%); color: #3c2a1e; }
.gp.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 100%); color: #f5e6c8; }
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
.gp-embed { display: flex; justify-content: center; }
.gp-embed iframe { width: 100%; max-width: 360px; height: 560px; border: 0; border-radius: 14px; background: #fff; }
.gp-muted { opacity: 0.7; font-size: 14px; margin: 0; }
.gp-foot { max-width: 960px; margin: 40px auto 0; text-align: center; font-size: 13px; opacity: 0.75; }
.gp-foot a { color: inherit; }
@media (max-width: 520px) { .gp-hero { flex-direction: column; } }
</style>
