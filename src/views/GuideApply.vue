<template>
  <div class="ga" :class="theme">
    <header class="ga-top">
      <router-link to="/guides" class="ga-brand" aria-label="Jinni Guides">
        <img src="/images/bottle.png" alt="" class="ga-lamp" />
        <span class="ga-word" translate="no">Jinni</span>
        <span class="ga-sep" aria-hidden="true"></span>
        <span class="ga-sub-brand">Guides</span>
      </router-link>
    </header>

    <main class="ga-main">
      <p v-if="loading" class="ga-muted">Loading…</p>

      <!-- Submitted: show the bio code -->
      <section v-else-if="guide && guide.status === 'pending'" class="ga-panel">
        <h1>Almost there, {{ guide.displayName }}</h1>
        <p>To prove <strong>@{{ guide.instagram }}</strong> is yours, add this code to your Instagram bio:</p>
        <div class="ga-code">
          <span>{{ guide.verificationCode }}</span>
          <button type="button" class="ga-btn-ghost" @click="copy(guide.verificationCode)">{{ copied ? 'Copied' : 'Copy' }}</button>
        </div>
        <ol class="ga-steps">
          <li>Open Instagram → your profile → <em>Edit profile</em> → <em>Bio</em>.</li>
          <li>Paste the code anywhere in your bio and save.</li>
          <li>Our team checks it, usually within a day, and emails you. Then you can remove it.</li>
        </ol>
        <p class="ga-muted">Your page will be: <strong>jinni.travel/@{{ guide.handle }}</strong></p>
        <router-link to="/guide/dashboard" class="ga-btn jinni-pill">Go to my dashboard</router-link>
      </section>

      <!-- Already active -->
      <section v-else-if="guide && guide.status === 'active'" class="ga-panel">
        <h1>Your page is live</h1>
        <p>jinni.travel/@{{ guide.handle }}</p>
        <router-link to="/guide/dashboard" class="ga-btn jinni-pill">Open my dashboard</router-link>
      </section>

      <section v-else-if="guide && guide.status === 'suspended'" class="ga-panel">
        <h1>Your guide page is paused</h1>
        <p>Please <router-link to="/contact">contact us</router-link> and we'll help.</p>
      </section>

      <!-- Application form (new, or after a rejection) -->
      <form v-else class="ga-panel" @submit.prevent="submit">
        <h1>Apply as a Jinni guide</h1>
        <p v-if="guide && guide.status === 'rejected'" class="ga-alert">Your last application wasn't approved: {{ guide.staffNotes || 'no reason given' }}. You can fix it and apply again.</p>
        <p v-else class="ga-muted">Free for local guides and travel creators. It takes about 3 minutes.</p>

        <label>Your name, as travelers will see it
          <input v-model.trim="form.displayName" maxlength="60" required placeholder="e.g. Ani Petrosyan" />
        </label>

        <label>Instagram username
          <div class="ga-prefix"><span>@</span><input v-model.trim="form.instagram" maxlength="31" required placeholder="ani.travels" @input="syncHandle" /></div>
        </label>

        <label>Your page address
          <div class="ga-prefix"><span>jinni.travel/@</span><input v-model.trim="form.handle" maxlength="30" required @input="handleTouched = true; checkHandle()" /></div>
          <small v-if="handleState === 'checking'" class="ga-muted">Checking…</small>
          <small v-else-if="handleState === 'ok'" class="ga-ok">Available</small>
          <small v-else-if="handleState === 'taken'" class="ga-bad">Taken — try another</small>
          <small v-else-if="handleState === 'invalid'" class="ga-bad">3–30 letters, digits, dots or underscores</small>
          <small v-else-if="handleState === 'reserved'" class="ga-bad">That name is reserved — please choose another</small>
        </label>

        <label>Where do you guide?
          <input v-model.trim="form.region" maxlength="80" required placeholder="e.g. Yerevan, Dilijan, Syunik" />
        </label>

        <fieldset>
          <legend>You are a…</legend>
          <div class="ga-chips">
            <button v-for="t in types" :key="t[0]" type="button" class="ga-chip" :class="{ on: form.guideType === t[0], 'jinni-chip-on': form.guideType === t[0] }" @click="form.guideType = t[0]">{{ t[1] }}</button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Languages you guide in</legend>
          <div class="ga-chips">
            <button v-for="l in LANGUAGE_OPTIONS" :key="l[0]" type="button" class="ga-chip" :class="{ on: form.languages.includes(l[0]), 'jinni-chip-on': form.languages.includes(l[0]) }" @click="toggleLang(l[0])">{{ l[1] }}</button>
          </div>
        </fieldset>

        <label><span>A few words about you <span class="ga-muted">(optional)</span></span>
          <textarea v-model="form.bio" maxlength="400" rows="3" placeholder="What makes your recommendations different?"></textarea>
        </label>

        <label class="ga-check">
          <input type="checkbox" v-model="form.acceptTerms" />
          <span>I confirm the posts and recommendations I add are my own, I allow Jinni to show my Instagram posts through Instagram's official embed, and I agree to the <router-link to="/terms" target="_blank">terms</router-link>.</span>
        </label>

        <p v-if="error" class="ga-alert">{{ error }}</p>
        <button type="submit" class="ga-btn jinni-pill" :disabled="sending">{{ sending ? 'Sending…' : 'Send application' }}</button>
      </form>
    </main>
  </div>
</template>

<script setup>
import '@/assets/styles/jinni-pill.css'
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { guideTheme, guideApi, LANGUAGE_OPTIONS } from '@/utils/guides'

const router = useRouter()
const theme = guideTheme()
const loading = ref(true)
const guide = ref(null)
const sending = ref(false)
const error = ref('')
const copied = ref(false)
const types = [['local', 'Local expert'], ['licensed', 'Licensed tour guide'], ['creator', 'Travel creator']]
const form = reactive({ displayName: '', instagram: '', handle: '', region: '', guideType: 'local', languages: ['en'], bio: '', acceptTerms: false })
const handleTouched = ref(false)
const handleState = ref('')
let checkTimer = null

const clean = (s) => String(s || '').trim().replace(/^@+/, '').toLowerCase()
function syncHandle() { if (!handleTouched.value) { form.handle = clean(form.instagram); checkHandle() } }
function checkHandle() {
  clearTimeout(checkTimer)
  const h = clean(form.handle)
  if (!/^[a-z0-9._]{3,30}$/.test(h)) { handleState.value = h ? 'invalid' : ''; return }
  handleState.value = 'checking'
  checkTimer = setTimeout(async () => {
    try {
      const r = await guideApi(`/handle-available/${encodeURIComponent(h)}`)
      const mine = guide.value && guide.value.handle === h
      handleState.value = r.reason === 'invalid' || r.reason === 'reserved' ? r.reason : (r.available || mine ? 'ok' : 'taken')
    } catch { handleState.value = '' }
  }, 350)
}
function toggleLang(l) { const i = form.languages.indexOf(l); if (i >= 0) form.languages.splice(i, 1); else form.languages.push(l) }
async function copy(text) { try { await navigator.clipboard.writeText(text); copied.value = true; setTimeout(() => (copied.value = false), 1600) } catch { /* manual copy */ } }

async function submit() {
  error.value = ''
  if (!form.acceptTerms) { error.value = 'Please accept the terms.'; return }
  sending.value = true
  try {
    const r = await guideApi('/apply', { method: 'POST', body: { ...form, handle: clean(form.handle), instagram: clean(form.instagram) } })
    guide.value = r.guide
    window.scrollTo({ top: 0 })
  } catch (e) { error.value = e.message } finally { sending.value = false }
}

onMounted(async () => {
  try {
    const r = await guideApi('/me')
    guide.value = r.guide
    if (r.guide?.status === 'active') return router.replace('/guide/dashboard')
    if (r.guide?.status === 'rejected') Object.assign(form, { displayName: r.guide.displayName, instagram: r.guide.instagram, handle: r.guide.handle, region: r.guide.region, guideType: r.guide.guideType, languages: r.guide.languages || [], bio: r.guide.bio || '' })
  } catch (e) { if (e.status === 401) return router.replace('/auth?redirect=/guides/apply') } finally { loading.value = false }
})
</script>

<style scoped>
.ga { min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 48px; box-sizing: border-box; }
.ga.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 100%); color: #3c2a1e; }
.ga.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 100%); color: #f5e6c8; }
.ga-top { max-width: 640px; margin: 0 auto; padding: 18px 0; }
.ga-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
.ga-lamp { width: 36px; height: auto; }
.ga-word { font-family: var(--brand-serif, 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif); font-size: 26px; font-weight: 600; line-height: 1; letter-spacing: 1px;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.ga-sep { width: 1px; height: 20px; background: linear-gradient(180deg, rgba(212, 175, 55, 0), rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0)); }
.ga-sub-brand { font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; }
@media (min-width: 900px) { .ga-top { padding: 28px 0 22px; } .ga-main { margin-top: 12px; } }
.ga-main { max-width: 640px; margin: 0 auto; }
.ga-panel { border-radius: 20px; padding: 26px 22px; display: grid; gap: 16px; backdrop-filter: blur(20px) saturate(160%); }
.day-mode .ga-panel { background: rgba(255, 255, 255, 0.65); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .ga-panel { background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.5); }
h1 { margin: 0; font-size: 26px; }
p { margin: 0; line-height: 1.5; }
label, fieldset { display: grid; gap: 6px; font-size: 15px; border: 0; padding: 0; margin: 0; }
legend { font-size: 15px; margin-bottom: 6px; padding: 0; }
input, textarea { font: inherit; font-size: 16px; padding: 11px 13px; border-radius: 12px; border: 1px solid rgba(139, 107, 61, 0.35); background: rgba(255, 255, 255, 0.85); color: #3c2a1e; width: 100%; box-sizing: border-box; }
.night-mode input, .night-mode textarea { background: rgba(255, 255, 255, 0.08); color: #f5e6c8; border-color: rgba(245, 230, 200, 0.25); }
input:focus, textarea:focus { outline: none; border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.25); }
.ga-prefix { display: flex; align-items: center; border-radius: 12px; border: 1px solid rgba(139, 107, 61, 0.35); overflow: hidden; }
.ga-prefix span { padding: 0 4px 0 12px; opacity: 0.7; white-space: nowrap; font-size: 15px; }
.ga-prefix input { border: 0; border-radius: 0; background: transparent; padding-left: 2px; box-shadow: none; }
.ga-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.ga-chip { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.5); background: transparent; color: inherit; cursor: pointer; }
.ga-check { grid-template-columns: 22px 1fr; align-items: start; font-size: 14px; line-height: 1.45; }
.ga-check input { width: 18px; height: 18px; margin-top: 2px; }
.ga-check a { color: #b4540a; }
.night-mode .ga-check a { color: #ffd27a; }
.ga-btn { justify-self: start; }
.ga-btn-ghost { font: inherit; font-size: 14px; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.6); background: transparent; color: inherit; cursor: pointer; }
.ga-code { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border-radius: 14px; border: 1px dashed #D4AF37; font-size: 24px; font-weight: 700; letter-spacing: 0.06em; }
.ga-steps { margin: 0; padding-left: 20px; display: grid; gap: 6px; line-height: 1.5; }
.ga-muted { opacity: 0.7; font-size: 14px; }
.ga-ok { color: #2e7d4f; }
.ga-bad, .ga-alert { color: #b3261e; }
.night-mode .ga-ok { color: #7bd69e; }
.night-mode .ga-bad, .night-mode .ga-alert { color: #ff9b8f; }
</style>
