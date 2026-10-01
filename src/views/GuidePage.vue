<template>
  <div class="gp" :class="theme">
    <header class="gp-top">
      <router-link to="/" class="gp-brand"><img src="/images/bottle.png" alt="" class="gp-lamp" />Jinni</router-link>
      <router-link to="/guides" class="gp-link">For guides</router-link>
    </header>

    <main class="gp-main">
      <p v-if="loading" class="gp-muted">Loading…</p>

      <section v-else-if="!guide" class="gp-panel gp-center">
        <h1>Guide not found</h1>
        <p class="gp-muted">This page doesn't exist or isn't public yet.</p>
        <router-link to="/" class="gp-btn">Go to Jinni</router-link>
      </section>

      <template v-else>
        <section class="gp-hero">
          <div class="gp-avatar">{{ initials }}</div>
          <div>
            <p class="gp-kicker">{{ typeLabel }} · {{ guide.region }}</p>
            <h1>{{ guide.displayName }}</h1>
            <a :href="`https://www.instagram.com/${guide.instagram}/`" target="_blank" rel="noopener" class="gp-ig">@{{ guide.instagram }} on Instagram</a>
            <p v-if="guide.bio" class="gp-bio">{{ guide.bio }}</p>
            <p v-if="guide.languages.length" class="gp-muted">Guides in {{ languagesText }}</p>
          </div>
        </section>

        <div class="gp-ask">
          <router-link :to="askTo" class="gp-btn" @click="tagGuideVisit(guide.handle)">Ask Jinni with {{ firstName }}'s picks</router-link>
          <p class="gp-muted">Free · your AI travel companion</p>
        </div>

        <nav class="gp-tabs" v-if="picks.length">
          <button v-for="t in tabs" :key="t.key" type="button" class="gp-tab" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }} <span>{{ t.count }}</span></button>
        </nav>

        <p v-if="!picks.length" class="gp-muted gp-center">{{ firstName }} hasn't added picks yet.</p>

        <section class="gp-grid">
          <article v-for="p in shown" :key="p.id" class="gp-card">
            <img v-if="p.image" :src="apiBase + p.image" :alt="p.name" class="gp-img" loading="lazy" />
            <div class="gp-body">
              <span class="gp-tag">{{ CATEGORY_LABELS[p.category] }}</span>
              <h3>{{ p.name }}</h3>
              <p v-if="p.address" class="gp-muted gp-addr">{{ p.address }}</p>
              <p v-if="p.note" class="gp-note">"{{ p.note }}" <span>— {{ firstName }}</span></p>
              <div v-if="p.tour" class="gp-tour">
                <strong>{{ p.tour.title }}</strong>
                <span v-if="p.tour.durationHours">{{ p.tour.durationHours }} h</span>
                <span v-if="p.tour.price != null">{{ p.tour.price }} {{ p.tour.currency || '' }}</span>
                <span class="gp-book">Book: {{ p.tour.contact }}</span>
              </div>
              <div class="gp-card-actions">
                <a v-if="p.lat != null" :href="`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`" target="_blank" rel="noopener" class="gp-btn-ghost">Map</a>
                <button v-if="p.embedUrl" type="button" class="gp-btn-ghost" @click="toggleReel(p.id)">{{ openReel === p.id ? 'Hide reel' : 'Watch reel' }}</button>
              </div>
              <div v-if="openReel === p.id && p.embedUrl" class="gp-embed"><iframe :src="p.embedUrl" loading="lazy" scrolling="no" allowtransparency="true" :title="`${guide.displayName} on Instagram`"></iframe></div>
            </div>
          </article>
        </section>
      </template>
    </main>

    <footer class="gp-foot">Picks by real local guides on <router-link to="/">Jinni</router-link> · <router-link to="/guides">Become a guide</router-link></footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { guideTheme, guideApi, CATEGORY_LABELS, LANGUAGE_OPTIONS, tagGuideVisit, hasToken } from '@/utils/guides'

const route = useRoute()
const apiBase = import.meta.env.VITE_API_BASE_URL || ''
const theme = guideTheme()
const loading = ref(true)
const guide = ref(null)
const picks = ref([])
const tab = ref('all')
const openReel = ref(null)

const firstName = computed(() => String(guide.value?.displayName || '').split(' ')[0] || 'this guide')
const initials = computed(() => String(guide.value?.displayName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())
const typeLabel = computed(() => ({ licensed: 'Licensed guide', creator: 'Travel creator', local: 'Local expert' }[guide.value?.guideType] || 'Local guide'))
const languagesText = computed(() => (guide.value?.languages || []).map(l => (LANGUAGE_OPTIONS.find(o => o[0] === l) || [l, l])[1]).join(', '))
const askTo = computed(() => (hasToken() ? '/chat' : `/auth?redirect=/chat`))
const tabs = computed(() => [{ key: 'all', label: 'All', count: picks.value.length },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label: label + 's', count: picks.value.filter(p => p.category === key).length })).filter(t => t.count)])
const shown = computed(() => (tab.value === 'all' ? picks.value : picks.value.filter(p => p.category === tab.value)))
const toggleReel = (id) => { openReel.value = openReel.value === id ? null : id }

onMounted(async () => {
  const handle = String(route.params.handle || '').toLowerCase()
  try {
    const r = await guideApi(`/public/${encodeURIComponent(handle)}`)
    guide.value = r.guide
    picks.value = r.picks || []
    document.title = `${r.guide.displayName} — local picks on Jinni`
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
.gp-lamp { width: 32px; }
.gp-link { color: inherit; text-decoration: none; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); }
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
.gp-btn { display: inline-block; font-weight: 700; font-size: 16px; padding: 13px 26px; border-radius: 999px; text-decoration: none; background: linear-gradient(45deg, #D4AF37, #FF8C00); color: #2b1d0e; box-shadow: 0 0 18px -2px rgba(255, 140, 0, 0.45); }
.gp-btn-ghost { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.6); background: transparent; color: inherit; cursor: pointer; text-decoration: none; }
.gp-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.gp-tab { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.5); background: transparent; color: inherit; cursor: pointer; }
.gp-tab span { opacity: 0.65; margin-left: 4px; }
.gp-tab.on { background: linear-gradient(45deg, #D4AF37, #FF8C00); color: #2b1d0e; border-color: transparent; }
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
