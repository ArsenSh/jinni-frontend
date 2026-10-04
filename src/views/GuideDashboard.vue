<template>
  <div class="gd" :class="theme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- the guides page's world, same as /guides/apply (founder 2026-10-04:
         "the guide/dashboard page we can make same design we did"); first child for App.vue's chrome sync -->
    <JinniNightSky v-if="theme === 'night-mode'" />
    <JinniDaySky v-else />
    <SwitchModeOverlay :visible="isSwitching" :label="t('guides.nav.switching_to_jinni')" :theme="theme === 'day-mode' ? 'light' : 'dark'" />
    <header class="gd-top">
      <router-link :to="guide?.status === 'active' ? `/@${guide.handle}` : '/guides'" class="gd-brand">
        <img src="/images/lamp.webp" alt="" class="gd-lamp" />
        <span class="gd-word" translate="no">Jinni</span>
        <span class="gd-sep" aria-hidden="true"></span>
        <!-- The guide's own name once their page exists (founder 2026-10-02) -->
        <span class="gd-sub" :class="{ 'gd-sub--name': guide?.displayName }">{{ guide?.displayName || t('guides.nav.guides_label') }}</span>
      </router-link>
      <div class="gd-top-right">
        <GuideLangSwitch />
        <a href="/chat" class="gd-link" @click.prevent="switchToChat">{{ t('guides.nav.open_jinni') }}</a>
      </div>
    </header>

    <main class="gd-main">
      <p v-if="loading" class="gd-muted">{{ t('guides.apply.loading') }}</p>

      <section v-else-if="!guide" class="gd-panel">
        <h1>{{ t('guides.dashboard.no_page_title') }}</h1>
        <router-link to="/guides/apply" class="gd-btn jinni-pill">{{ t('guides.dashboard.apply') }}</router-link>
      </section>

      <section v-else-if="guide.status === 'pending'" class="gd-panel">
        <h1>{{ t('guides.dashboard.waiting_title') }}</h1>
        <p>{{ t('guides.dashboard.waiting_text', { handle: '@' + guide.instagram }) }}</p>
        <div class="gd-code" dir="ltr">{{ guide.verificationCode }}</div>
        <p class="gd-muted">{{ t('guides.dashboard.waiting_note') }}</p>
      </section>

      <section v-else-if="guide.status !== 'active'" class="gd-panel">
        <h1>{{ t('guides.dashboard.inactive_title') }}</h1>
        <p v-if="guide.status === 'rejected'">{{ guide.staffNotes }}</p>
        <router-link v-if="guide.status === 'rejected'" to="/guides/apply" class="gd-btn jinni-pill">{{ t('guides.dashboard.fix_apply') }}</router-link>
        <p v-else>{{ t('guides.dashboard.contact_before') }} <router-link to="/contact">{{ t('guides.dashboard.contact_link') }}</router-link>.</p>
      </section>

      <template v-else>
        <section class="gd-panel gd-head">
          <div>
            <p class="gd-kicker">{{ t('guides.dashboard.your_page') }}</p>
            <h1>{{ guide.displayName }}</h1>
            <a :href="pageUrl" target="_blank" class="gd-url" dir="ltr">jinni.travel/@{{ guide.handle }}</a>
          </div>
          <div class="gd-head-actions">
            <button type="button" class="gd-btn-ghost" @click="copy(pageUrl)">{{ copied ? t('guides.dashboard.copied') : t('guides.dashboard.copy_link') }}</button>
            <a :href="pageUrl" target="_blank" class="gd-btn-ghost">{{ t('guides.dashboard.view_page') }}</a>
          </div>
          <p class="gd-muted gd-tip">{{ t('guides.dashboard.tip') }}</p>
        </section>

        <section class="gd-panel">
          <h2>{{ editing ? t('guides.dashboard.edit_pick') : t('guides.dashboard.add_pick') }}</h2>

          <template v-if="!editing">
            <label>{{ t('guides.dashboard.find_place') }}
              <input v-model="query" :placeholder="t('guides.dashboard.find_place_ph')" @input="search" />
            </label>
            <p v-if="searching" class="gd-muted">{{ t('guides.dashboard.searching') }}</p>
            <p v-else-if="query.length >= 2 && !results.length && searched && !draft.place" class="gd-muted">{{ t('guides.dashboard.no_place') }}</p>
            <div v-if="results.length && !draft.place" class="gd-results">
              <button v-for="p in results" :key="p.placeId" type="button" class="gd-result" @click="choose(p)">
                <img v-if="p.image" :src="guideImage(p.image)" alt="" loading="lazy" /><span v-else class="gd-noimg">◎</span>
                <span><strong>{{ p.name }}</strong><small>{{ p.address }}</small><small v-if="p.source === 'destination'" class="gd-curated">{{ t('guides.dashboard.staff_place') }}</small></span>
              </button>
            </div>
          </template>

          <div v-if="draft.place" class="gd-chosen">
            <img v-if="draft.place.image" :src="guideImage(draft.place.image)" alt="" />
            <div><strong>{{ draft.place.name }}</strong><small>{{ draft.place.address }}</small></div>
            <button v-if="!editing" type="button" class="gd-btn-ghost" @click="draft.place = null">{{ t('guides.dashboard.change') }}</button>
          </div>

          <template v-if="draft.place">
            <fieldset>
              <legend>{{ t('guides.dashboard.what_is_it') }}</legend>
              <div class="gd-chips">
                <button v-for="key in CATEGORY_KEYS" :key="key" type="button" class="gd-chip" :disabled="!catAllowed(key)" :class="{ on: draft.category === key, off: !catAllowed(key) }" @click="draft.category = key">{{ t('guides.categories.' + key) }}</button>
              </div>
              <!-- Why some chips are off: the place's categories were set by Jinni's team, or it doesn't serve food. -->
              <p v-if="catHint" class="gd-muted gd-cat-hint">{{ catHint }}</p>
            </fieldset>
            <label><span>{{ t('guides.dashboard.why') }} <span class="gd-muted">{{ t('guides.dashboard.why_hint') }}</span></span>
              <textarea v-model="draft.note" maxlength="280" rows="2" :placeholder="t('guides.dashboard.why_ph')"></textarea>
            </label>
            <!-- The guide's own clip (founder 2026-10-05): Jinni plays it in its own player — no Instagram box. -->
            <label><span>{{ t('guides.dashboard.video') }} <span class="gd-muted">{{ t('guides.dashboard.video_hint') }}</span></span>
              <input :key="fileKey" type="file" accept="video/mp4,video/quicktime,video/webm" @change="pickFile" />
            </label>
            <p v-if="uploadPct != null" class="gd-muted">{{ t('guides.dashboard.video_uploading', { pct: uploadPct }) }}</p>
            <div v-if="editingVideo?.status === 'ready' && !videoFile" class="gd-embed gd-video">
              <GuideVideo :src="guideImage(editingVideo.videoUrl)" :poster="editingVideo.posterUrl ? guideImage(editingVideo.posterUrl) : ''" :autoplay="false" />
              <button type="button" class="gd-btn-ghost gd-danger" @click="removeVideo">{{ t('guides.dashboard.video_remove') }}</button>
            </div>
            <label><span>{{ t('guides.dashboard.reel') }} <span class="gd-muted">{{ t('guides.dashboard.reel_hint') }}</span></span>
              <input v-model.trim="draft.reelUrl" dir="ltr" :placeholder="t('guides.dashboard.reel_ph')" />
            </label>
            <p v-if="draft.reelUrl && !reelEmbed" class="gd-bad">{{ t('guides.dashboard.reel_bad') }}</p>
            <div v-if="reelEmbed" class="gd-embed"><iframe :src="reelEmbed" loading="lazy" scrolling="no" allowtransparency="true" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="strict-origin-when-cross-origin" :title="t('guides.dashboard.reel_preview')"></iframe></div>

            <div v-if="draft.category === 'activity'" class="gd-tour">
              <p><strong>{{ t('guides.dashboard.tour_q') }}</strong> <span class="gd-muted">{{ t('guides.dashboard.tour_hint') }}</span></p>
              <label>{{ t('guides.dashboard.tour_name') }} <input v-model="draft.tour.title" maxlength="80" :placeholder="t('guides.dashboard.tour_name_ph')" /></label>
              <div class="gd-row">
                <label>{{ t('guides.dashboard.hours') }} <input v-model="draft.tour.durationHours" type="number" min="0" step="0.5" /></label>
                <label>{{ t('guides.dashboard.price') }} <input v-model="draft.tour.price" type="number" min="0" /></label>
                <label>{{ t('guides.dashboard.currency') }} <input v-model="draft.tour.currency" maxlength="3" placeholder="AMD" /></label>
              </div>
              <label>{{ t('guides.dashboard.how_book') }} <input v-model="draft.tour.contact" maxlength="160" :placeholder="t('guides.dashboard.how_book_ph')" /></label>
            </div>

            <p v-if="error" class="gd-bad">{{ error }}</p>
            <div class="gd-actions">
              <button type="button" class="gd-btn jinni-pill" :disabled="saving || !draft.category || !catAllowed(draft.category)" @click="save">{{ saving ? t('guides.dashboard.saving') : (editing ? t('guides.dashboard.save_changes') : t('guides.dashboard.add_to_page')) }}</button>
              <button type="button" class="gd-btn-ghost" @click="reset">{{ t('guides.dashboard.cancel') }}</button>
            </div>
          </template>
        </section>

        <section class="gd-panel">
          <h2>{{ t('guides.dashboard.my_picks') }} <span class="gd-muted">({{ picks.length }})</span></h2>
          <p v-if="!picks.length" class="gd-muted">{{ t('guides.dashboard.no_picks') }}</p>
          <ul class="gd-list">
            <li v-for="p in picks" :key="p.id">
              <div>
                <span class="gd-tag">{{ t('guides.categories.' + p.category) }}</span>
                <strong>{{ p.placeName }}</strong>
                <small v-if="p.placeGone" class="gd-bad"> · {{ t('guides.dashboard.place_gone') }}</small>
                <p v-if="p.note" class="gd-note">"{{ p.note }}"</p>
                <small v-if="p.tour" class="gd-muted">{{ t('guides.dashboard.tour_line') }} {{ p.tour.title }}{{ p.tour.price != null ? ` · ${p.tour.price} ${p.tour.currency || ''}` : '' }}</small>
                <small v-if="p.reelUrl" class="gd-muted"> · {{ t('guides.dashboard.reel_attached') }}</small>
                <small v-if="p.video?.status === 'ready'" class="gd-muted"> · {{ t('guides.dashboard.video_ready') }}</small>
                <small v-else-if="p.video?.status === 'processing'" class="gd-muted"> · {{ t('guides.dashboard.video_processing') }}</small>
                <small v-else-if="p.video?.status === 'failed'" class="gd-bad"> · {{ t('guides.dashboard.video_failed') }}{{ p.video.error ? ' — ' + p.video.error : '' }}</small>
              </div>
              <div class="gd-list-actions">
                <button type="button" class="gd-btn-ghost" @click="edit(p)">{{ t('guides.dashboard.edit') }}</button>
                <button type="button" class="gd-btn-ghost gd-danger" @click="remove(p)">{{ t('guides.dashboard.remove') }}</button>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import '@/assets/styles/jinni-pill.css'
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { guideTheme, guideApi, CATEGORY_KEYS, instagramEmbed, initGuideLanguage, guideImage, guideVideoUpload } from '@/utils/guides'
import GuideVideo from '@/components/ui/GuideVideo.vue'
import GuideLangSwitch from '@/components/guides/GuideLangSwitch.vue'
import SwitchModeOverlay from '@/components/ui/SwitchModeOverlay.vue'
import JinniDaySky from '@/components/ui/JinniDaySky.vue'
import JinniNightSky from '@/components/ui/JinniNightSky.vue'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
initGuideLanguage(locale)

const theme = guideTheme()
// Back to the chat the same way the business dashboard does it: the switching overlay, then /chat.
const router = useRouter()
const isSwitching = ref(false)
function switchToChat() {
  isSwitching.value = true
  setTimeout(() => router.push('/chat'), 1500)
}
const loading = ref(true)
const guide = ref(null)
const picks = ref([])
const copied = ref(false)
const query = ref('')
const results = ref([])
const searching = ref(false)
const searched = ref(false)
const saving = ref(false)
const error = ref('')
const editing = ref(null)
const emptyTour = () => ({ title: '', durationHours: '', price: '', currency: 'AMD', contact: '', languages: [] })
const draft = reactive({ place: null, category: '', note: '', reelUrl: '', tour: emptyTour() })
let timer = null
// The pick's video: chosen here, sent after the pick itself is saved, then prepared by the server.
const MAX_VIDEO_BYTES = 80 * 1024 * 1024
const videoFile = ref(null)
const uploadPct = ref(null)
const fileKey = ref(0)                      // re-creates the file input to clear it
const editingVideo = computed(() => (editing.value ? picks.value.find(x => x.id === editing.value)?.video : null))
let pollTimer = null, polls = 0
function pickFile(e) {
  const f = e.target.files?.[0] || null
  error.value = ''
  if (f && f.size > MAX_VIDEO_BYTES) { error.value = t('guides.dashboard.video_too_big'); videoFile.value = null; fileKey.value++; return }
  videoFile.value = f
}
// While the server prepares a video, ask again every few seconds (for about four minutes).
function pollVideos() {
  clearTimeout(pollTimer)
  if (!picks.value.some(p => p.video?.status === 'processing') || polls > 60) { polls = 0; return }
  pollTimer = setTimeout(async () => { polls++; try { await load() } catch { /* next round */ } pollVideos() }, 4000)
}
async function removeVideo() {
  if (!editing.value) return
  try { await guideApi(`/me/picks/${editing.value}/video`, { method: 'DELETE' }); await load() } catch (e) { error.value = e.message }
}

const pageUrl = computed(() => `${window.location.origin}/@${guide.value?.handle || ''}`)
const reelEmbed = computed(() => (draft.reelUrl ? instagramEmbed(draft.reelUrl) : null))

async function load() {
  const r = await guideApi('/me')
  guide.value = r.guide
  picks.value = r.picks || []
}
function search() {
  clearTimeout(timer)
  draft.place = null
  if (query.value.trim().length < 2) { results.value = []; searched.value = false; return }
  searching.value = true
  timer = setTimeout(async () => {
    try { results.value = (await guideApi(`/me/place-search?q=${encodeURIComponent(query.value.trim())}`)).places || [] } catch { results.value = [] }
    searching.value = false; searched.value = true
  }, 300)
}
function choose(p) {
  draft.place = p; results.value = []
  // Start on the category Jinni already knows for this place, when it has one.
  draft.category = p.categories?.suggested || (p.categories?.allowed?.length === 1 ? p.categories.allowed[0] : '')
}
// Category rules come from the server with each place (null = older data → all open; the server still checks).
const catAllowed = (key) => { const c = draft.place?.categories; return !c || c.allowed.includes(key) }
const catHint = computed(() => {
  const c = draft.place?.categories
  if (!c) return ''
  const names = c.allowed.map(k => t('guides.categories.' + k)).join(', ')
  if (c.curated) return c.allowed.length ? t('guides.dashboard.cat_team', { cats: names }) : t('guides.dashboard.cat_none')
  if (!c.allowed.includes('restaurant')) return t('guides.dashboard.cat_not_food')
  return ''
})
function reset() {
  Object.assign(draft, { place: null, category: '', note: '', reelUrl: '', tour: emptyTour() })
  editing.value = null; query.value = ''; results.value = []; error.value = ''; searched.value = false
  videoFile.value = null; uploadPct.value = null; fileKey.value++
}
function edit(p) {
  reset()
  editing.value = p.id
  Object.assign(draft, { place: { placeId: p.placeId, name: p.placeName, address: p.address || '', image: p.image || null, source: p.placeId.startsWith('dest:') ? 'destination' : 'place',
      // Editing keeps the pick's own category available even if the rules changed since.
      categories: p.categories ? { ...p.categories, allowed: [...new Set([...p.categories.allowed, p.category])] } : null },
    category: p.category, note: p.note || '', reelUrl: p.reelUrl || '', tour: p.tour ? { ...emptyTour(), ...p.tour } : emptyTour() })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function save() {
  error.value = ''
  if (draft.reelUrl && !reelEmbed.value) { error.value = t('guides.dashboard.reel_error'); return }
  saving.value = true
  const body = { placeId: draft.place.placeId, category: draft.category, note: draft.note, reelUrl: draft.reelUrl || null,
    tour: draft.category === 'activity' && draft.tour.title ? draft.tour : null }
  try {
    let id = editing.value
    if (id) await guideApi(`/me/picks/${id}`, { method: 'PUT', body })
    else id = (await guideApi('/me/picks', { method: 'POST', body })).pick?.id
    if (videoFile.value && id) {
      uploadPct.value = 0
      try { await guideVideoUpload(id, videoFile.value, (pct) => { uploadPct.value = pct }) }
      catch (e) {
        // The pick itself is saved; stay on it so the video can be tried again.
        await load(); editing.value = id; uploadPct.value = null; error.value = e.message; return
      }
    }
    await load(); reset(); pollVideos()
  } catch (e) { error.value = e.message } finally { saving.value = false }
}
async function remove(p) {
  if (!window.confirm(t('guides.dashboard.remove_confirm', { name: p.placeName }))) return
  try { await guideApi(`/me/picks/${p.id}`, { method: 'DELETE' }); picks.value = picks.value.filter(x => x.id !== p.id) } catch (e) { window.alert(e.message) }
}
async function copy(text) { try { await navigator.clipboard.writeText(text); copied.value = true; setTimeout(() => (copied.value = false), 1600) } catch { /* manual copy */ } }

onMounted(async () => { try { await load(); pollVideos() } catch { /* shows the empty state */ } finally { loading.value = false } })
onBeforeUnmount(() => clearTimeout(pollTimer))
</script>

<style scoped>
.gd { min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 48px; box-sizing: border-box; }
.gd.day-mode { color: #3c2a1e; }
.gd.night-mode { color: #f5e6c8; }
/* Both themes end on their TOP colour: iOS 26 paints the area past the page
   with one solid colour (the top), so a page ending lighter showed a band at
   the bottom edge (founder 2026-10-03). */
.gd-top { max-width: 760px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
.gd-brand { display: inline-flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; text-decoration: none; color: inherit; }
.gd-lamp { width: 50px; margin-block: -8px; margin-inline: -8px -4px; }
.gd-brand { min-width: 0; }
.gd-word { font-family: var(--brand-serif, 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif); font-size: 26px; font-weight: 600; line-height: 1; letter-spacing: 1px;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gd-sep { width: 1px; height: 20px; flex: none; background: linear-gradient(180deg, rgba(212, 175, 55, 0), rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0)); }
.gd-sub { font-size: 15px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 38vw; }
.gd-sub--name { text-transform: none; letter-spacing: 0.01em; font-size: 17px; font-weight: 600; opacity: 1; }
/* Phones: the lamp alone carries the brand, so the guide's name gets the room. */
@media (max-width: 480px) {
  .gd-brand:has(.gd-sub--name) .gd-word, .gd-brand:has(.gd-sub--name) .gd-sep { display: none; }
  .gd-sub { max-width: 42vw; }
}
.gd-top-right { display: flex; align-items: center; gap: 8px; }
.gd-chip.off, .gd-chip:disabled { opacity: 0.38; cursor: not-allowed; }
.gd-cat-hint { margin: 8px 0 0; font-size: 14px; }
.gd-curated { display: block; color: #b4540a; font-size: 12px; letter-spacing: 0.04em; }
.night-mode .gd-curated { color: #ffd27a; }
.gd-link { color: inherit; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; box-sizing: border-box; font-size: 15px; line-height: 1; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); white-space: nowrap; }
.gd-main { max-width: 760px; margin: 0 auto; display: grid; gap: 16px; }
.gd-panel { border-radius: 20px; padding: 22px; display: grid; gap: 14px; backdrop-filter: blur(20px) saturate(160%); }
.day-mode .gd-panel { background: rgba(255, 255, 255, 0.65); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .gd-panel { background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.5); }
h1 { margin: 0; font-size: 26px; } h2 { margin: 0; font-size: 21px; }
p { margin: 0; line-height: 1.5; }
.gd-head { grid-template-columns: 1fr auto; align-items: center; }
.gd-head-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.gd-tip { grid-column: 1 / -1; }
.gd-kicker { letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; color: #b4540a; }
.night-mode .gd-kicker { color: #ffd27a; }
.gd-url { color: #b4540a; font-size: 16px; }
.night-mode .gd-url { color: #ffd27a; }
label, fieldset { display: grid; gap: 6px; font-size: 15px; border: 0; padding: 0; margin: 0; }
legend { font-size: 15px; margin-bottom: 6px; padding: 0; }
input, textarea { font: inherit; font-size: 16px; padding: 11px 13px; border-radius: 12px; border: 1px solid rgba(139, 107, 61, 0.35); background: rgba(255, 255, 255, 0.85); color: #3c2a1e; width: 100%; box-sizing: border-box; }
.night-mode input, .night-mode textarea { background: rgba(255, 255, 255, 0.08); color: #f5e6c8; border-color: rgba(245, 230, 200, 0.25); }
input:focus, textarea:focus { outline: none; border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.25); }
.gd-results { display: grid; gap: 8px; }
.gd-result { display: flex; gap: 12px; align-items: center; text-align: left; font: inherit; color: inherit; padding: 8px; border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.3); background: transparent; cursor: pointer; }
.gd-result:hover { background: rgba(212, 175, 55, 0.1); }
.gd-result img, .gd-chosen img { width: 56px; height: 56px; object-fit: cover; border-radius: 10px; flex: 0 0 56px; }
.gd-noimg { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 10px; background: rgba(212, 175, 55, 0.15); }
.gd-result small, .gd-chosen small { display: block; opacity: 0.7; font-size: 13px; }
.gd-chosen { display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 14px; border: 1px solid #D4AF37; }
.gd-chosen > div { flex: 1; }
.gd-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.gd-chip { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.5); background: transparent; color: inherit; cursor: pointer; }
.gd-embed { display: flex; justify-content: center; }
.gd-embed iframe { width: 100%; max-width: 360px; height: 560px; border: 0; border-radius: 14px; background: #fff; }
.gd-video { --gv-max-h: 420px; flex-direction: column; align-items: center; gap: 10px; }
.gd-tour { display: grid; gap: 10px; padding: 14px; border-radius: 14px; border: 1px dashed rgba(212, 175, 55, 0.6); }
.gd-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.gd-actions, .gd-list-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.gd-btn { justify-self: start; }
.gd-btn-ghost { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.6); background: transparent; color: inherit; cursor: pointer; text-decoration: none; }
.gd-danger { border-color: rgba(179, 38, 30, 0.5); }
.gd-code { font-size: 24px; font-weight: 700; letter-spacing: 0.06em; padding: 12px 16px; border-radius: 14px; border: 1px dashed #D4AF37; justify-self: start; }
.gd-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.gd-list li { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 12px; border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.25); }
.gd-tag { display: inline-block; font-size: 12px; padding: 2px 9px; border-radius: 999px; margin-right: 6px; background: rgba(212, 175, 55, 0.18); }
.gd-note { font-style: italic; margin-top: 4px; font-size: 14px; }
.gd-muted { opacity: 0.7; font-size: 14px; }
.gd-bad { color: #b3261e; } .night-mode .gd-bad { color: #ff9b8f; }
@media (max-width: 560px) { .gd-head { grid-template-columns: 1fr; } .gd-head-actions { justify-content: flex-start; } .gd-row { grid-template-columns: 1fr 1fr; } }

/* ═══ GUIDE DASHBOARD · the guides page's world (founder 2026-10-04: "the
   guide/dashboard page we can make same design we did"). The same tokens and
   pieces as /guides/apply (GuideApply.vue "GUIDE REGISTRATION" block): sky
   behind, lamp + JINNI · name, glass pills, frosted panels, Cinzel titles,
   glass fields with the sign-in states, glass chips that light gold when
   chosen, the solid gold action button, gold glass plates. Content and logic
   unchanged. Keep the token values identical to GuideApply.vue. ═══ */
.gd { position: relative; z-index: 1; background: none; padding-inline: 16px; --serif: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif;
  --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif; font-family: var(--lora) }
.gd.day-mode { background: none; color: #7a5434;
  --ink: #7A4A1C; --body: #7a5434; --soft: rgba(122,84,52,0.75); --accent: #c0702a; --link: #9a5a1e;
  --panel: rgba(255,255,255,0.5); --panel-rim: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 18px -2px rgba(140,61,7,0.12);
  --f-fill: rgba(255,255,255,0.62); --f-fill-hover: rgba(255,255,255,0.78); --f-solid: #fdf8ee; --f-ink: #5a3c22; --f-ph: rgba(122,84,52,0.55);
  --f-rim: rgba(255,255,255,0.9); --f-rim-hover: rgba(232,190,130,0.75); --f-glow: rgba(212,140,60,0.22); --f-light: rgba(255,170,80,0.22); --f-focus-rim: rgba(200,140,50,0.7);
  --rose: #a83c28; --rose-rim: rgba(180,68,47,0.55); --ok: #4f8a3c; --gold-fill: rgba(212,175,55,0.1); --gold-rim: rgba(184,125,40,0.3);
  --lang-ink: #7A4A1C; --lang-glass: rgba(255,255,255,0.45); --lang-glass-hover: rgba(255,255,255,0.62);
  --lang-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), 0 0 18px -2px rgba(140,61,7,0.14) }
.gd.night-mode { background: none; color: #eee6f6;
  --ink: #fbf5ff; --body: #c9c0da; --soft: rgba(220,210,240,0.65); --accent: #ffb36b; --link: #ffd29a;
  --panel: rgba(255,255,255,0.05); --panel-rim: inset 0 0 0 0.75px rgba(220,210,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -2px rgba(0,0,0,0.45);
  --f-fill: rgba(255,255,255,0.06); --f-fill-hover: rgba(255,255,255,0.1); --f-solid: #2a2140; --f-ink: #f3eaf8; --f-ph: rgba(220,210,240,0.5);
  --f-rim: rgba(220,210,255,0.12); --f-rim-hover: rgba(255,214,160,0.3); --f-glow: rgba(255,170,90,0.18); --f-light: rgba(255,160,70,0.2); --f-focus-rim: rgba(255,200,120,0.6);
  --rose: #ffb3a7; --rose-rim: rgba(255,154,138,0.6); --ok: #8fd18a; --gold-fill: rgba(255,210,140,0.07); --gold-rim: rgba(255,210,122,0.3);
  --lang-ink: #f3eaf8; --lang-glass: rgba(255,255,255,0.06); --lang-glass-hover: rgba(255,255,255,0.12);
  --lang-rim: inset 0 0 0 0.75px rgba(220,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px -2px rgba(0,0,0,0.3) }

/* header */
.gd-brand { gap: 10px }
.gd-lamp { width: 44px; height: auto; margin: -6px -4px -6px -6px }
.night-mode .gd-lamp { filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)) }
.day-mode .gd-lamp { filter: saturate(0.88) brightness(0.95) }
.gd-word { font-size: 22px; letter-spacing: 2px; background: none; -webkit-text-fill-color: currentColor; color: var(--ink) }
.day-mode .gd-word { color: #b8741f }
.gd-sep { background: rgba(160,140,120,0.3) }
.gd-sub { font-family: var(--serif); font-size: 12px; font-weight: 400; letter-spacing: 0.2em; color: var(--soft); opacity: 1 }
/* once the page exists the guide's own name stands there: Lora, the ink colour */
.gd-sub--name { font-family: var(--lora); font-size: 17px; font-weight: 600; letter-spacing: 0.01em; color: var(--ink) }
.gd-top :deep(.gls-btn), .gd-link { height: 40px; padding: 0 14px 0 12px; border: 0; font-size: 13.5px; font-weight: 600; color: var(--lang-ink);
  background: var(--lang-glass); box-shadow: var(--lang-rim); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
  transition: background-color 0.2s ease }
.gd-link { padding: 0 16px }
.gd-top :deep(.gls-btn:hover), .gd-link:hover { background: var(--lang-glass-hover) }

/* panels */
.gd-main { gap: 18px }
.gd-panel { border-radius: 28px; padding: 30px 24px; gap: 18px; color: var(--body) }
.day-mode .gd-panel, .night-mode .gd-panel { background: var(--panel); box-shadow: var(--panel-rim);
  backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%) }
.gd h1 { font-family: var(--serif); font-weight: 500; font-size: clamp(26px, 4.4vw, 34px); line-height: 1.15; letter-spacing: 0.02em; color: var(--ink); text-wrap: balance }
.gd h2 { font-family: var(--serif); font-weight: 500; font-size: clamp(20px, 3.4vw, 24px); line-height: 1.2; letter-spacing: 0.02em; color: var(--ink) }
.gd h2 .gd-muted { font-family: var(--lora); letter-spacing: 0 }
.gd label, .gd legend { color: var(--ink); font-size: 15px }
.gd-muted { color: var(--soft); opacity: 1 }
.gd-kicker { font-family: var(--serif); letter-spacing: 0.2em; color: var(--accent); margin-bottom: 4px }
.night-mode .gd-kicker { color: var(--accent) }
.gd-url, .night-mode .gd-url, .gd a:not([class]), .gd-curated, .night-mode .gd-curated { color: var(--link) }
.gd-url { text-underline-offset: 3px }
.gd-head p:not(.gd-kicker):not(.gd-muted) { color: var(--body) }

/* fields: glass with the sign-in states */
.gd input:not([type="checkbox"]), .gd textarea, .night-mode input:not([type="checkbox"]), .night-mode textarea {
  border: 0; border-radius: 16px; color: var(--f-ink); background-color: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim);
  transition: background-color 0.25s ease, box-shadow 0.25s ease }
.gd input::placeholder, .gd textarea::placeholder { color: var(--f-ph) }
.gd input:not([type="checkbox"]):hover, .gd textarea:hover { background-color: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover), 0 0 14px -6px var(--f-glow) }
.gd input:not([type="checkbox"]):focus, .gd textarea:focus {
  outline: none; background-color: var(--f-fill-hover); background-image: radial-gradient(70% 130% at 50% 135%, var(--f-light), transparent 70%);
  box-shadow: inset 0 0 0 0.75px var(--f-focus-rim), 0 0 16px -4px var(--f-glow) }
.gd input:-webkit-autofill, .gd input:-webkit-autofill:hover, .gd input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--f-ink); caret-color: var(--f-ink);
  -webkit-box-shadow: inset 0 0 0 0.75px var(--f-rim), inset 0 0 0 100px var(--f-solid); box-shadow: inset 0 0 0 0.75px var(--f-rim), inset 0 0 0 100px var(--f-solid);
  transition: background-color 600000s 0s, color 600000s 0s }
.gd-bad, .night-mode .gd-bad { color: var(--rose) }
p.gd-bad { padding: 11px 16px; border-radius: 16px; background: rgba(180,68,47,0.07); box-shadow: inset 0 0 0 0.75px var(--rose-rim) }

/* place search: glass rows that warm on hover; the chosen place a gold glass plate */
.gd-result { border: 0; border-radius: 18px; padding: 8px 12px 8px 8px; color: var(--body); background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim);
  transition: background-color 0.2s ease, box-shadow 0.2s ease }
[dir="rtl"] .gd-result { text-align: right; padding: 8px 8px 8px 12px }
.gd-result:hover { background: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover), 0 0 14px -6px var(--f-glow) }
.gd-result strong, .gd-chosen strong { color: var(--ink); font-weight: 600 }
.gd-result small, .gd-chosen small { color: var(--soft); opacity: 1 }
.gd-curated { color: var(--accent) }
.gd-result img, .gd-chosen img, .gd-noimg { border-radius: 12px }
.gd-noimg { color: var(--accent); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim) }
.gd-chosen { border: 0; border-radius: 18px; color: var(--body); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim), 0 0 18px -6px rgba(255,170,80,0.35) }

/* chips: glass, the chosen one lights gold */
.gd-chip { border: 0; color: var(--body); background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim); transition: background-color 0.2s ease, box-shadow 0.2s ease }
.gd-chip:not(:disabled):hover { background: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover) }
.gd-chip.on { color: #fff; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 14px -4px rgba(255,140,0,0.5) }
.gd-cat-hint { color: var(--soft) }

/* the reel preview and the optional tour: a quieter gold glass inset, no dashed border */
.gd-embed iframe { border-radius: 18px; box-shadow: 0 0 18px -2px rgba(0,0,0,0.18) }
.gd-tour { border: 0; padding: 18px 16px; gap: 12px; border-radius: 22px; background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim) }
.gd-tour p { color: var(--body) }
.gd-tour strong { color: var(--ink) }

/* actions: the solid gold of sign-in's Send Verification Code; ghosts are glass */
.gd .gd-btn { color: #fff; -webkit-text-fill-color: #fff; text-shadow: none; background: linear-gradient(45deg, #D4AF37, #FF8C00);
  box-shadow: 0 0 18px -4px rgba(255,140,0,0.5); min-height: 50px; padding: 13px 30px; font: 600 16.5px/1.25 var(--lora) }
.gd .gd-btn::before, .gd .gd-btn::after { content: none }
.gd .gd-btn:not(:disabled):hover { filter: brightness(1.05); box-shadow: 0 0 22px -3px rgba(255,140,0,0.6) }
.gd-actions { align-items: center; gap: 10px 12px }
.gd-btn-ghost { border: 0; display: inline-flex; align-items: center; color: var(--ink); background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim);
  transition: background-color 0.2s ease, box-shadow 0.2s ease }
.gd-btn-ghost:not(:disabled):hover { background: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover) }
.gd-btn-ghost:disabled { opacity: 0.5; cursor: default }
.gd-danger { color: var(--rose) }
.gd-danger:not(:disabled):hover { box-shadow: inset 0 0 0 0.75px var(--rose-rim) }

/* the Instagram code: a gold glass plate */
.gd-code { border: 0; border-radius: 18px; color: var(--ink); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim), 0 0 18px -6px rgba(255,170,80,0.35);
  font-family: var(--serif); letter-spacing: 0.12em }

/* my picks: glass rows, a gold glass tag */
.gd-list { gap: 12px }
.gd-list li { border: 0; border-radius: 20px; padding: 14px 16px; color: var(--body); background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim) }
.gd-list strong { color: var(--ink); font-weight: 600 }
.gd-tag { font-family: var(--serif); letter-spacing: 0.06em; color: var(--accent); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim); padding: 3px 10px; margin-right: 0; margin-inline-end: 8px }
.gd-note { color: var(--body) }
/* each detail of a pick on its own line ("…on JinniTour: …" ran together, 2026-10-04) */
li > div > small { display: block; margin-top: 3px; }
</style>
