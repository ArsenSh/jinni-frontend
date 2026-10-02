<template>
  <div class="gd" :class="theme">
    <header class="gd-top">
      <router-link to="/guides" class="gd-brand"><img src="/images/bottle.png" alt="" class="gd-lamp" />Jinni Guides</router-link>
      <router-link to="/chat" class="gd-link">Open Jinni</router-link>
    </header>

    <main class="gd-main">
      <p v-if="loading" class="gd-muted">Loading…</p>

      <section v-else-if="!guide" class="gd-panel">
        <h1>You don't have a guide page yet</h1>
        <router-link to="/guides/apply" class="gd-btn jinni-pill">Apply as a guide</router-link>
      </section>

      <section v-else-if="guide.status === 'pending'" class="gd-panel">
        <h1>Waiting for approval</h1>
        <p>Make sure this code is in your Instagram bio (<strong>@{{ guide.instagram }}</strong>):</p>
        <div class="gd-code">{{ guide.verificationCode }}</div>
        <p class="gd-muted">We'll email you as soon as your page is approved — usually within a day.</p>
      </section>

      <section v-else-if="guide.status !== 'active'" class="gd-panel">
        <h1>Your guide page isn't active</h1>
        <p v-if="guide.status === 'rejected'">{{ guide.staffNotes }}</p>
        <router-link v-if="guide.status === 'rejected'" to="/guides/apply" class="gd-btn jinni-pill">Fix and apply again</router-link>
        <p v-else>Please <router-link to="/contact">contact us</router-link>.</p>
      </section>

      <template v-else>
        <!-- Page link -->
        <section class="gd-panel gd-head">
          <div>
            <p class="gd-kicker">Your page</p>
            <h1>{{ guide.displayName }}</h1>
            <a :href="pageUrl" target="_blank" class="gd-url">jinni.travel/@{{ guide.handle }}</a>
          </div>
          <div class="gd-head-actions">
            <button type="button" class="gd-btn-ghost" @click="copy(pageUrl)">{{ copied ? 'Copied' : 'Copy link' }}</button>
            <a :href="pageUrl" target="_blank" class="gd-btn-ghost">View page</a>
          </div>
          <p class="gd-muted gd-tip">Put this link in your Instagram bio. Followers who open it see your picks first.</p>
        </section>

        <!-- Add a pick -->
        <section class="gd-panel">
          <h2>{{ editing ? 'Edit pick' : 'Add a pick' }}</h2>

          <template v-if="!editing">
            <label>Find the place on Jinni
              <input v-model="query" placeholder="Type a name, e.g. Lavash, Garni Temple" @input="search" />
            </label>
            <p v-if="searching" class="gd-muted">Searching…</p>
            <p v-else-if="query.length >= 2 && !results.length && searched" class="gd-muted">No place with that name in Jinni yet. Try another spelling — new places can be added by our team.</p>
            <div v-if="results.length && !draft.place" class="gd-results">
              <button v-for="p in results" :key="p.placeId" type="button" class="gd-result" @click="choose(p)">
                <img v-if="p.image" :src="apiBase + p.image" alt="" loading="lazy" /><span v-else class="gd-noimg">◎</span>
                <span><strong>{{ p.name }}</strong><small>{{ p.address }}</small></span>
              </button>
            </div>
          </template>

          <div v-if="draft.place" class="gd-chosen">
            <img v-if="draft.place.image" :src="apiBase + draft.place.image" alt="" />
            <div><strong>{{ draft.place.name }}</strong><small>{{ draft.place.address }}</small></div>
            <button v-if="!editing" type="button" class="gd-btn-ghost" @click="draft.place = null">Change</button>
          </div>

          <template v-if="draft.place">
            <fieldset>
              <legend>What is it?</legend>
              <div class="gd-chips">
                <button v-for="(label, key) in CATEGORY_LABELS" :key="key" type="button" class="gd-chip" :class="{ on: draft.category === key, 'jinni-chip-on': draft.category === key }" @click="draft.category = key">{{ label }}</button>
              </div>
            </fieldset>
            <label><span>Why you love it <span class="gd-muted">(one or two lines, in your words)</span></span>
              <textarea v-model="draft.note" maxlength="280" rows="2" placeholder="e.g. Order the gata — the best in Garni, baked every morning."></textarea>
            </label>
            <label><span>Your Instagram reel or post about it <span class="gd-muted">(optional)</span></span>
              <input v-model.trim="draft.reelUrl" placeholder="https://www.instagram.com/reel/…" />
            </label>
            <p v-if="draft.reelUrl && !reelEmbed" class="gd-bad">Paste a link to one of your Instagram posts or reels.</p>
            <div v-if="reelEmbed" class="gd-embed"><iframe :src="reelEmbed" loading="lazy" scrolling="no" allowtransparency="true" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="strict-origin-when-cross-origin" title="Instagram preview"></iframe></div>

            <div v-if="draft.category === 'activity'" class="gd-tour">
              <p><strong>Is this one of your tours?</strong> <span class="gd-muted">Fill this in and travelers can book you directly.</span></p>
              <label>Tour name <input v-model="draft.tour.title" maxlength="80" placeholder="e.g. Sunrise hike to Lastiver" /></label>
              <div class="gd-row">
                <label>Hours <input v-model="draft.tour.durationHours" type="number" min="0" step="0.5" /></label>
                <label>Price <input v-model="draft.tour.price" type="number" min="0" /></label>
                <label>Currency <input v-model="draft.tour.currency" maxlength="3" placeholder="AMD" /></label>
              </div>
              <label>How to book <input v-model="draft.tour.contact" maxlength="160" placeholder="WhatsApp +374 …, @telegram, or your website" /></label>
            </div>

            <p v-if="error" class="gd-bad">{{ error }}</p>
            <div class="gd-actions">
              <button type="button" class="gd-btn jinni-pill" :disabled="saving || !draft.category" @click="save">{{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Add to my page') }}</button>
              <button type="button" class="gd-btn-ghost" @click="reset">Cancel</button>
            </div>
          </template>
        </section>

        <!-- My picks -->
        <section class="gd-panel">
          <h2>My picks <span class="gd-muted">({{ picks.length }})</span></h2>
          <p v-if="!picks.length" class="gd-muted">No picks yet. Start with 5–10 places you recommend most.</p>
          <ul class="gd-list">
            <li v-for="p in picks" :key="p.id">
              <div>
                <span class="gd-tag">{{ CATEGORY_LABELS[p.category] }}</span>
                <strong>{{ p.placeName }}</strong>
                <p v-if="p.note" class="gd-note">"{{ p.note }}"</p>
                <small v-if="p.tour" class="gd-muted">Tour: {{ p.tour.title }}{{ p.tour.price != null ? ` · ${p.tour.price} ${p.tour.currency || ''}` : '' }}</small>
                <small v-if="p.reelUrl" class="gd-muted"> · reel attached</small>
              </div>
              <div class="gd-list-actions">
                <button type="button" class="gd-btn-ghost" @click="edit(p)">Edit</button>
                <button type="button" class="gd-btn-ghost gd-danger" @click="remove(p)">Remove</button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { guideTheme, guideApi, CATEGORY_LABELS, instagramEmbed } from '@/utils/guides'

const apiBase = import.meta.env.VITE_API_BASE_URL || ''
const theme = guideTheme()
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
function choose(p) { draft.place = p; results.value = [] }
function reset() {
  Object.assign(draft, { place: null, category: '', note: '', reelUrl: '', tour: emptyTour() })
  editing.value = null; query.value = ''; results.value = []; error.value = ''; searched.value = false
}
function edit(p) {
  reset()
  editing.value = p.id
  Object.assign(draft, { place: { placeId: p.placeId, name: p.placeName, address: '', image: `/api/ai/place-image/${p.placeId}/0` },
    category: p.category, note: p.note || '', reelUrl: p.reelUrl || '', tour: p.tour ? { ...emptyTour(), ...p.tour } : emptyTour() })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function save() {
  error.value = ''
  if (draft.reelUrl && !reelEmbed.value) { error.value = 'That reel link is not an Instagram post or reel.'; return }
  saving.value = true
  const body = { placeId: draft.place.placeId, category: draft.category, note: draft.note, reelUrl: draft.reelUrl || null,
    tour: draft.category === 'activity' && draft.tour.title ? draft.tour : null }
  try {
    if (editing.value) await guideApi(`/me/picks/${editing.value}`, { method: 'PUT', body })
    else await guideApi('/me/picks', { method: 'POST', body })
    await load(); reset()
  } catch (e) { error.value = e.message } finally { saving.value = false }
}
async function remove(p) {
  if (!window.confirm(`Remove ${p.placeName} from your page?`)) return
  try { await guideApi(`/me/picks/${p.id}`, { method: 'DELETE' }); picks.value = picks.value.filter(x => x.id !== p.id) } catch (e) { window.alert(e.message) }
}
async function copy(text) { try { await navigator.clipboard.writeText(text); copied.value = true; setTimeout(() => (copied.value = false), 1600) } catch { /* manual copy */ } }

onMounted(async () => { try { await load() } catch { /* shows the empty state */ } finally { loading.value = false } })
</script>

<style scoped>
.gd { min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 48px; box-sizing: border-box; }
.gd.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 100%); color: #3c2a1e; }
.gd.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 100%); color: #f5e6c8; }
.gd-top { max-width: 760px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
.gd-brand { display: inline-flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; text-decoration: none; color: inherit; }
.gd-lamp { width: 30px; }
.gd-link { color: inherit; text-decoration: none; font-size: 15px; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); }
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
</style>
