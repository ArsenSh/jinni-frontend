<template>
  <div class="ga" :class="theme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- the guides page's world (founder 2026-10-04: "also the onboarding of
         guide registration page design"); first child for App.vue's chrome sync -->
    <JinniNightSky v-if="theme === 'night-mode'" />
    <JinniDaySky v-else />
    <header class="ga-top">
      <router-link to="/guides" class="ga-brand" aria-label="Jinni Guides">
        <img src="/images/lamp.webp" alt="" class="ga-lamp" />
        <span class="ga-word" translate="no">Jinni</span>
        <span class="ga-sep" aria-hidden="true"></span>
        <span class="ga-sub-brand">{{ t('guides.nav.guides_label') }}</span>
      </router-link>
      <GuideLangSwitch />
    </header>

    <main class="ga-main">
      <!-- where they are: Apply → Verify → Add your picks (the guides page's own steps) -->
      <ol v-if="!loading && step" class="ga-progress" :aria-label="t('guides.landing.how_title')">
        <li v-for="n in 3" :key="n" :class="{ done: n < step, now: n === step }" :aria-current="n === step ? 'step' : null">
          <span class="ga-progress-n">{{ n }}</span>{{ t(`guides.landing.step${n}_strong`) }}
        </li>
      </ol>
      <p v-if="loading" class="ga-muted">{{ t('guides.apply.loading') }}</p>

      <!-- Submitted: show the bio code -->
      <section v-else-if="guide && guide.status === 'pending'" class="ga-panel">
        <h1>{{ t('guides.apply.pending_title', { name: guide.displayName }) }}</h1>
        <p v-if="accountEmail" class="ga-who">{{ t('guides.apply.applying_as', { email: accountEmail }) }} · <button type="button" class="ga-linkbtn" @click="switchAccount">{{ t('guides.apply.switch_account') }}</button></p>
        <p>{{ t('guides.apply.pending_text_before') }} <strong dir="ltr">@{{ guide.instagram }}</strong> {{ t('guides.apply.pending_text_after') }}</p>
        <div class="ga-code" dir="ltr">
          <span>{{ guide.verificationCode }}</span>
          <button type="button" class="ga-btn-ghost" @click="copy(guide.verificationCode)">{{ copied ? t('guides.apply.copied') : t('guides.apply.copy') }}</button>
        </div>
        <ol class="ga-steps">
          <li>{{ t('guides.apply.step1') }}</li>
          <li>{{ t('guides.apply.step2') }}</li>
          <li>{{ t('guides.apply.step3') }}</li>
        </ol>
        <p class="ga-muted">{{ t('guides.apply.page_will_be') }} <strong dir="ltr">jinni.travel/@{{ guide.handle }}</strong></p>
        <router-link to="/guide/dashboard" class="ga-btn jinni-pill">{{ t('guides.apply.go_dashboard') }}</router-link>
      </section>

      <!-- Already active -->
      <section v-else-if="guide && guide.status === 'active'" class="ga-panel">
        <h1>{{ t('guides.apply.live_title') }}</h1>
        <p dir="ltr">jinni.travel/@{{ guide.handle }}</p>
        <router-link to="/guide/dashboard" class="ga-btn jinni-pill">{{ t('guides.apply.open_dashboard') }}</router-link>
      </section>

      <section v-else-if="guide && guide.status === 'suspended'" class="ga-panel">
        <h1>{{ t('guides.apply.paused_title') }}</h1>
        <p>{{ t('guides.apply.paused_before') }} <router-link to="/contact">{{ t('guides.apply.paused_link') }}</router-link> {{ t('guides.apply.paused_after') }}</p>
      </section>

      <!-- New account: the 6-digit email code, then the application goes out -->
      <section v-else-if="codeStep.active" class="ga-panel">
        <h1>{{ t('guides.apply.code_title') }}</h1>
        <p>{{ t('guides.apply.code_text', { email: codeStep.email }) }}</p>
        <label>{{ t('guides.apply.code_label') }}
          <input v-model="codeStep.code" class="ga-codein" dir="ltr" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" @input="codeStep.code = codeStep.code.replace(/\D/g, '').slice(0, 6)" @keyup.enter="verifyCode" />
        </label>
        <p class="ga-muted">{{ t('guides.apply.code_spam') }}</p>
        <p v-if="error" class="ga-alert">{{ error }}</p>
        <div class="ga-row-btns">
          <button type="button" class="ga-btn jinni-pill" :disabled="sending || codeStep.code.length !== 6" @click="verifyCode">{{ sending ? t('guides.apply.sending') : t('guides.apply.code_verify') }}</button>
          <button type="button" class="ga-btn-ghost" :disabled="sending || codeStep.resendIn > 0" @click="resendCode">{{ codeStep.resendIn > 0 ? t('guides.apply.code_resend_in', { s: codeStep.resendIn }) : t('guides.apply.code_resend') }}</button>
          <button type="button" class="ga-linkbtn" @click="codeStep.active = false; error = ''">{{ t('guides.apply.code_change_email') }}</button>
        </div>
      </section>

      <!-- Application form (new, or after a rejection) -->
      <form v-else class="ga-panel" @submit.prevent="submit">
        <h1>{{ t('guides.apply.title') }}</h1>
        <p v-if="guide && guide.status === 'rejected'" class="ga-alert">{{ t('guides.apply.rejected', { reason: guide.staffNotes || t('guides.apply.no_reason') }) }}</p>
        <p v-else class="ga-muted">{{ t('guides.apply.intro') }}</p>
        <p v-if="signedIn && accountEmail" class="ga-who">{{ t('guides.apply.applying_as', { email: accountEmail }) }} · <button type="button" class="ga-linkbtn" @click="switchAccount">{{ t('guides.apply.switch_account') }}</button></p>

        <label>{{ t('guides.apply.name') }}
          <input v-model.trim="form.displayName" maxlength="60" required :placeholder="t('guides.apply.name_ph')" />
        </label>

        <label>{{ t('guides.apply.instagram') }}
          <div class="ga-prefix" dir="ltr"><span>@</span><input v-model.trim="form.instagram" maxlength="31" required :placeholder="t('guides.apply.instagram_ph')" @input="syncHandle" /></div>
        </label>

        <label>{{ t('guides.apply.address') }}
          <div class="ga-prefix" dir="ltr"><span>jinni.travel/@</span><input v-model.trim="form.handle" maxlength="30" required @input="handleTouched = true; checkHandle()" /></div>
          <small v-if="handleState === 'checking'" class="ga-muted">{{ t('guides.apply.checking') }}</small>
          <small v-else-if="handleState === 'ok'" class="ga-ok">{{ t('guides.apply.available') }}</small>
          <small v-else-if="handleState === 'taken'" class="ga-bad">{{ t('guides.apply.taken') }}</small>
          <small v-else-if="handleState === 'invalid'" class="ga-bad">{{ t('guides.apply.invalid') }}</small>
          <small v-else-if="handleState === 'reserved'" class="ga-bad">{{ t('guides.apply.reserved') }}</small>
        </label>

        <label>{{ t('guides.apply.region') }}
          <input v-model.trim="form.region" maxlength="80" required :placeholder="t('guides.apply.region_ph')" />
        </label>

        <fieldset>
          <legend>{{ t('guides.apply.you_are') }}</legend>
          <div class="ga-chips">
            <button v-for="k in TYPES" :key="k" type="button" class="ga-chip" :class="{ on: form.guideType === k }" @click="form.guideType = k">{{ t('guides.types.' + k) }}</button>
          </div>
        </fieldset>

        <fieldset>
          <legend>{{ t('guides.apply.languages') }}</legend>
          <div class="ga-chips">
            <button v-for="l in GUIDING_LANGS" :key="l" type="button" class="ga-chip" :class="{ on: form.languages.includes(l) }" @click="toggleLang(l)">{{ t('guides.langs.' + l) }}</button>
          </div>
        </fieldset>

        <label><span>{{ t('guides.apply.bio') }} <span class="ga-muted">{{ t('guides.apply.optional') }}</span></span>
          <textarea v-model="form.bio" maxlength="400" rows="3" :placeholder="t('guides.apply.bio_ph')"></textarea>
        </label>

        <!-- Signed out: create the Jinni account (or sign in) right here, one page -->
        <fieldset v-if="!signedIn" class="ga-account">
          <legend>{{ t('guides.apply.acct_title') }}</legend>
          <div class="ga-chips">
            <button type="button" class="ga-chip" :class="{ on: acct.mode === 'new' }" @click="acct.mode = 'new'; error = ''">{{ t('guides.apply.acct_new') }}</button>
            <button type="button" class="ga-chip" :class="{ on: acct.mode === 'login' }" @click="acct.mode = 'login'; error = ''">{{ t('guides.apply.acct_have') }}</button>
          </div>
          <label v-if="acct.mode === 'new' && needsAccountName">{{ t('guides.apply.acct_name') }}
            <input v-model="acct.name" maxlength="50" autocomplete="name" />
            <small class="ga-muted">{{ t('guides.apply.acct_name_hint') }}</small>
          </label>
          <label>{{ t('guides.apply.acct_email') }}
            <input v-model.trim="acct.email" type="email" dir="ltr" autocomplete="email" required maxlength="100" />
          </label>
          <label>{{ t('guides.apply.acct_password') }}
            <div class="ga-pw">
              <input v-model="acct.password" :type="acct.showPw ? 'text' : 'password'" dir="ltr" required maxlength="128" :autocomplete="acct.mode === 'new' ? 'new-password' : 'current-password'" />
              <button type="button" class="ga-linkbtn" @click="acct.showPw = !acct.showPw">{{ acct.showPw ? t('guides.apply.acct_hide') : t('guides.apply.acct_show') }}</button>
            </div>
            <small v-if="acct.mode === 'new'" class="ga-pwrules">
              <span :class="{ met: pw.len }">✓ {{ t('guides.apply.pw_len') }}</span>
              <span :class="{ met: pw.upper }">✓ {{ t('guides.apply.pw_upper') }}</span>
              <span :class="{ met: pw.lower }">✓ {{ t('guides.apply.pw_lower') }}</span>
              <span :class="{ met: pw.digit }">✓ {{ t('guides.apply.pw_digit') }}</span>
            </small>
          </label>
          <p class="ga-muted ga-alt">
            <button v-if="acct.mode === 'login'" type="button" class="ga-linkbtn" @click="leaveForAuth">{{ t('guides.apply.acct_forgot') }}</button>
            <span v-if="acct.mode === 'login'"> · </span>
            <button type="button" class="ga-linkbtn" @click="leaveForAuth">{{ t('guides.apply.acct_google') }}</button>
          </p>
        </fieldset>

        <label class="ga-check">
          <input type="checkbox" v-model="form.acceptTerms" />
          <span>{{ t('guides.apply.consent_before') }} <router-link to="/guides/terms" target="_blank">{{ t('guides.apply.consent_terms') }}</router-link> {{ t('guides.apply.consent_and') }} <router-link to="/guides/privacy" target="_blank">{{ t('guides.apply.consent_privacy') }}</router-link>.</span>
        </label>

        <p v-if="error" class="ga-alert">{{ error }}</p>
        <button type="submit" class="ga-btn jinni-pill" :disabled="sending">{{ sending ? t('guides.apply.sending') : (signedIn ? t('guides.apply.send') : (acct.mode === 'new' ? t('guides.apply.send_new') : t('guides.apply.send_login'))) }}</button>
      </form>
    </main>
  </div>
</template>

<script setup>
import '@/assets/styles/jinni-pill.css'
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { guideTheme, guideApi, GUIDING_LANGS, initGuideLanguage, hasToken } from '@/utils/guides'
import { sendAcquisition } from '@/utils/acquisition'
import { track } from '@/utils/funnel'
import GuideLangSwitch from '@/components/guides/GuideLangSwitch.vue'
import JinniDaySky from '@/components/ui/JinniDaySky.vue'
import JinniNightSky from '@/components/ui/JinniNightSky.vue'

const { t, locale } = useI18n()
initGuideLanguage(locale)

const router = useRouter()
const theme = guideTheme()
const loading = ref(true)
const guide = ref(null)
const sending = ref(false)
const error = ref('')
const copied = ref(false)
const TYPES = ['local', 'licensed', 'creator']
const form = reactive({ displayName: '', instagram: '', handle: '', region: '', guideType: 'local', languages: ['en'], bio: '', acceptTerms: false })
const handleTouched = ref(false)
// Which account this application belongs to — the browser shares one login
// across tabs, so an admin signed in elsewhere would otherwise apply silently
// (live 2026-10-02).
const readEmail = () => { try { return JSON.parse(localStorage.getItem('user') || '{}').email || '' } catch { return '' } }
const accountEmail = ref(readEmail())
function switchAccount() {
  // Sign out here and show the account block on this same page (the form is kept).
  try { localStorage.removeItem('authToken'); localStorage.removeItem('user') } catch { /* storage blocked */ }
  signedIn.value = false; accountEmail.value = ''; guide.value = null; acct.mode = 'login'; error.value = ''
}

// ── One-page account (founder 2026-10-02): guides arrive from Instagram; the
// separate sign-in page lost them. Uses the SAME endpoints as the main sign-in
// (send-verification → verify-email, or login) and stores the session the same
// way AuthModal does (authToken + user).
const API = import.meta.env.VITE_API_BASE_URL || ''
const signedIn = ref(hasToken())
const acct = reactive({ mode: 'new', email: '', password: '', name: '', showPw: false })
const codeStep = reactive({ active: false, email: '', code: '', resendIn: 0 })
// progress line: 1 = applying (form or email code), 2 = verifying (bio code), 3 = live; none when paused
const step = computed(() => {
  const st = guide.value && guide.value.status
  if (st === 'active') return 3
  if (st === 'pending') return 2
  if (st === 'suspended') return 0
  return 1
})
let resendTimer = null
// Same rules as the server (utils/validation.js) so errors show before sending.
const NAME_STRIP = /[^\p{L}\p{M}\s'\-]/gu
const derivedName = computed(() => String(form.displayName || '').replace(NAME_STRIP, '').replace(/\s+/g, ' ').trim().slice(0, 50))
const needsAccountName = computed(() => derivedName.value.length < 2)
const accountName = computed(() => (needsAccountName.value ? String(acct.name || '').replace(NAME_STRIP, '').replace(/\s+/g, ' ').trim().slice(0, 50) : derivedName.value))
const pw = computed(() => ({ len: acct.password.length >= 6, upper: /[A-Z]/.test(acct.password), lower: /[a-z]/.test(acct.password), digit: /\d/.test(acct.password) }))

async function authPost(path, body) {
  const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 15000)
  let res
  try {
    res = await fetch(`${API}/api/auth/${path}`, { method: 'POST', signal: ac.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch { throw Object.assign(new Error(t('guides.apply.net_error')), { status: 0, data: {} }) } finally { clearTimeout(timer) }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || (data.details || []).map(d => d.message).join(', ') || `Request failed (${res.status})`), { status: res.status, data })
  return data
}
function storeSession(data) {
  localStorage.setItem('authToken', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  signedIn.value = true; accountEmail.value = data.user?.email || ''
}

// The draft survives a reload (Instagram's browser often reloads when the
// visitor switches to their mail app for the code). Never the password.
const DRAFT = 'jinni_guide_apply_draft'
function saveDraft() {
  // The form includes the consent the guide ticked — a reload mid sign-up must not drop it.
  try { localStorage.setItem(DRAFT, JSON.stringify({ at: Date.now(), form: { ...form }, acct: { mode: acct.mode, email: acct.email, name: acct.name }, codeEmail: codeStep.active ? codeStep.email : '' })) } catch { /* storage blocked */ }
}
function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT) || 'null')
    if (!d || Date.now() - d.at > 2 * 3600e3) return null
    return d
  } catch { return null }
}
const clearDraft = () => { try { localStorage.removeItem(DRAFT) } catch { /* storage blocked */ } }
function leaveForAuth() {
  // Google sign-in and password reset live on the main sign-in page; come back here after.
  saveDraft()
  try { sessionStorage.setItem('jinni_after_auth', '/guides/apply') } catch { /* storage blocked */ }
  router.push('/auth?redirect=/guides/apply')
}
function startResendTimer(sec = 60) {
  clearInterval(resendTimer); codeStep.resendIn = sec
  resendTimer = setInterval(() => { codeStep.resendIn -= 1; if (codeStep.resendIn <= 0) clearInterval(resendTimer) }, 1000)
}
onBeforeUnmount(() => clearInterval(resendTimer))
const handleState = ref('')
let checkTimer = null

const clean = (s) => String(s || '').trim().replace(/^@+/, '').toLowerCase()
// Instagram as people type it: '@Name', 'name' or a pasted profile link (same rule as the server).
const cleanIg = (s) => { let v = String(s || '').trim(); const m = v.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)/i); if (m) v = m[1]; return clean(v) }
function syncHandle() { if (!handleTouched.value) { form.handle = cleanIg(form.instagram); checkHandle() } }
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

async function sendApplication() {
  const r = await guideApi('/apply', { method: 'POST', body: { ...form, handle: clean(form.handle), instagram: cleanIg(form.instagram) } })
  guide.value = r.guide
  clearDraft()
  window.scrollTo({ top: 0 })
}

async function submit() {
  error.value = ''
  if (!form.acceptTerms) { error.value = t('guides.apply.accept_terms_error'); return }
  if (!signedIn.value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acct.email)) { error.value = t('guides.apply.acct_email_error'); return }
    if (acct.mode === 'new') {
      if (accountName.value.length < 2) { error.value = t('guides.apply.acct_name_error'); return }
      if (!pw.value.len || !pw.value.upper || !pw.value.lower || !pw.value.digit) { error.value = t('guides.apply.pw_error'); return }
    } else if (!acct.password) { error.value = t('guides.apply.pw_error_login'); return }
  }
  sending.value = true
  try {
    if (!signedIn.value && acct.mode === 'new') {
      await startSignup()          // continues in verifyCode() once the email code is entered
      return
    }
    if (!signedIn.value) {
      const data = await authPost('login', { email: acct.email.toLowerCase(), password: acct.password })
      storeSession(data)
      acct.password = ''
      // This account may already have a guide page.
      const me = await guideApi('/me')
      if (me.guide?.status === 'active') { clearDraft(); return router.replace('/guide/dashboard') }
      if (me.guide?.status === 'suspended') { guide.value = me.guide; return }
    }
    await sendApplication()
  } catch (e) {
    if (e.status === 400 && /invalid credentials/i.test(e.message)) error.value = t('guides.apply.login_failed')
    else error.value = e.message
  } finally { sending.value = false }
}

async function startSignup() {
  const email = acct.email.toLowerCase()
  try {
    await authPost('send-verification', { name: accountName.value, email, password: acct.password, language: locale.value })
    startResendTimer()
  } catch (e) {
    if (/already registered/i.test(e.message)) { acct.mode = 'login'; error.value = t('guides.apply.acct_exists'); return }
    // A code went out less than a minute ago: it is still valid — go enter it.
    if (e.status === 429 && !e.data?.blocked) startResendTimer(e.data?.retryAfter || 60)
    else throw e
  }
  track('signup_start')
  Object.assign(codeStep, { active: true, email, code: '' })
  saveDraft()
  window.scrollTo({ top: 0 })
}

async function verifyCode() {
  if (codeStep.code.length !== 6 || sending.value) return
  error.value = ''; sending.value = true
  try {
    const data = await authPost('verify-email', { email: codeStep.email, code: codeStep.code, language: locale.value })
    storeSession(data)
    acct.password = ''
    track('signup_done')
    sendAcquisition()            // where this new account came from (marketing report)
    codeStep.active = false
    await sendApplication()
  } catch (e) {
    if (e.data?.blocked) { error.value = t('guides.apply.code_blocked'); codeStep.active = false }
    else if (e.data?.attemptsLeft != null) error.value = t('guides.apply.code_wrong', { n: e.data.attemptsLeft })
    else if (/already registered/i.test(e.message)) { codeStep.active = false; acct.mode = 'login'; error.value = t('guides.apply.acct_exists') }
    else if (signedIn.value) { codeStep.active = false; error.value = e.message }   // account made; only the application failed — the form is still filled
    else error.value = e.message
  } finally { sending.value = false }
}

async function resendCode() {
  error.value = ''
  try { await authPost('resend-verification', { email: codeStep.email }); startResendTimer() }
  catch (e) {
    if (e.status === 404) { codeStep.active = false; error.value = t('guides.apply.code_expired') }
    else if (e.data?.retryAfter) startResendTimer(e.data.retryAfter)
    else error.value = e.message
  }
}

onMounted(async () => {
  const draft = loadDraft()
  if (draft) {
    Object.assign(form, draft.form || {})
    Object.assign(acct, draft.acct || {})
    if (form.handle) { handleTouched.value = true; checkHandle() }
  }
  if (!signedIn.value) {
    // Came back from the mail app mid sign-up: straight to the code box.
    if (draft?.codeEmail) Object.assign(codeStep, { active: true, email: draft.codeEmail, code: '' })
    loading.value = false
    return
  }
  try {
    const r = await guideApi('/me')
    guide.value = r.guide
    if (r.guide?.status === 'active') { clearDraft(); return router.replace('/guide/dashboard') }
    if (r.guide?.status === 'rejected' && !draft) Object.assign(form, { displayName: r.guide.displayName, instagram: r.guide.instagram, handle: r.guide.handle, region: r.guide.region, guideType: r.guide.guideType, languages: r.guide.languages || [], bio: r.guide.bio || '' })
  } catch (e) {
    // Expired / revoked session: show the account block on this page instead of leaving it.
    if (e.status === 401) { signedIn.value = false; accountEmail.value = '' }
  } finally { loading.value = false }
})
</script>

<style scoped>
.ga { min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 48px; box-sizing: border-box; }
.ga.day-mode { color: #3c2a1e; }
.ga.night-mode { color: #f5e6c8; }
/* Both themes end on their TOP colour: iOS 26 paints the area past the page
   with one solid colour (the top), so a page ending lighter showed a band at
   the bottom edge (founder 2026-10-03). */
.ga-top { max-width: 640px; margin: 0 auto; padding: 18px 0; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.ga-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
.ga-lamp { width: 54px; height: auto; margin-block: -8px; margin-inline: -8px -6px; }
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
@media (max-width: 400px) { .ga-sub-brand, .ga-sep { display: none; } }
.ga-check input { width: 18px; height: 18px; margin-top: 2px; }
.ga-check a { color: #b4540a; }
.night-mode .ga-check a { color: #ffd27a; }
.ga-btn { justify-self: start; }
.ga-btn-ghost { font: inherit; font-size: 14px; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.6); background: transparent; color: inherit; cursor: pointer; }
.ga-code { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border-radius: 14px; border: 1px dashed #D4AF37; font-size: 24px; font-weight: 700; letter-spacing: 0.06em; }
.ga-steps { margin: 0; padding-left: 20px; display: grid; gap: 6px; line-height: 1.5; }
.ga-muted { opacity: 0.7; font-size: 14px; }
.ga-who { font-size: 14px; padding: 9px 12px; border-radius: 12px; background: rgba(212, 175, 55, 0.12); }
.ga-linkbtn { font: inherit; background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; color: #b4540a; }
.night-mode .ga-linkbtn { color: #ffd27a; }
.ga-ok { color: #2e7d4f; }
.ga-account { padding: 16px; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.35); gap: 12px; }
.ga-account legend { padding: 0 6px; font-weight: 600; }
.ga-pw { display: flex; align-items: center; gap: 10px; }
.ga-pw input { flex: 1; }
.ga-pwrules { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; opacity: 0.75; }
.ga-pwrules .met { color: #2e7d4f; opacity: 1; }
.night-mode .ga-pwrules .met { color: #7bd69e; }
.ga-alt { font-size: 14px; }
.ga-codein { font-size: 26px; letter-spacing: 0.4em; text-align: center; max-width: 260px; }
.ga-row-btns { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }
.ga-btn-ghost:disabled { opacity: 0.5; cursor: default; }
.ga-bad, .ga-alert { color: #b3261e; }
.night-mode .ga-ok { color: #7bd69e; }
.night-mode .ga-bad, .night-mode .ga-alert { color: #ff9b8f; }

/* ═══ GUIDE REGISTRATION · the guides page's world (founder 2026-10-04).
   Sky behind, lamp + JINNI · GUIDES, globe/EN glass pill, a progress line
   (Apply → Verify → Add your picks), one frosted glass panel, Cinzel title,
   glass fields with the sign-in page's states (warm hover, lamplight focus,
   glass autofill, rose errors), glass chips that light gold when chosen, and
   the solid gold action button of sign-in. Content and logic unchanged. ═══ */
.ga { position: relative; z-index: 1; background: none; padding-inline: 16px; --serif: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif;
  --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif; font-family: var(--lora) }
.ga.day-mode { background: none; color: #7a5434;
  --ink: #7A4A1C; --body: #7a5434; --soft: rgba(122,84,52,0.75); --accent: #c0702a; --link: #9a5a1e;
  --panel: rgba(255,255,255,0.5); --panel-rim: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 18px -2px rgba(140,61,7,0.12);
  --f-fill: rgba(255,255,255,0.62); --f-fill-hover: rgba(255,255,255,0.78); --f-solid: #fdf8ee; --f-ink: #5a3c22; --f-ph: rgba(122,84,52,0.55);
  --f-rim: rgba(255,255,255,0.9); --f-rim-hover: rgba(232,190,130,0.75); --f-glow: rgba(212,140,60,0.22); --f-light: rgba(255,170,80,0.22); --f-focus-rim: rgba(200,140,50,0.7);
  --rose: #a83c28; --rose-rim: rgba(180,68,47,0.55); --ok: #4f8a3c; --gold-fill: rgba(212,175,55,0.1); --gold-rim: rgba(184,125,40,0.3);
  --lang-ink: #7A4A1C; --lang-glass: rgba(255,255,255,0.45); --lang-glass-hover: rgba(255,255,255,0.62);
  --lang-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), 0 0 18px -2px rgba(140,61,7,0.14) }
.ga.night-mode { background: none; color: #eee6f6;
  --ink: #fbf5ff; --body: #c9c0da; --soft: rgba(220,210,240,0.65); --accent: #ffb36b; --link: #ffd29a;
  --panel: rgba(255,255,255,0.05); --panel-rim: inset 0 0 0 0.75px rgba(220,210,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -2px rgba(0,0,0,0.45);
  --f-fill: rgba(255,255,255,0.06); --f-fill-hover: rgba(255,255,255,0.1); --f-solid: #2a2140; --f-ink: #f3eaf8; --f-ph: rgba(220,210,240,0.5);
  --f-rim: rgba(220,210,255,0.12); --f-rim-hover: rgba(255,214,160,0.3); --f-glow: rgba(255,170,90,0.18); --f-light: rgba(255,160,70,0.2); --f-focus-rim: rgba(255,200,120,0.6);
  --rose: #ffb3a7; --rose-rim: rgba(255,154,138,0.6); --ok: #8fd18a; --gold-fill: rgba(255,210,140,0.07); --gold-rim: rgba(255,210,122,0.3);
  --lang-ink: #f3eaf8; --lang-glass: rgba(255,255,255,0.06); --lang-glass-hover: rgba(255,255,255,0.12);
  --lang-rim: inset 0 0 0 0.75px rgba(220,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px -2px rgba(0,0,0,0.3) }

/* header */
.ga-lamp { width: 44px; margin: -6px -4px -6px -6px }
.night-mode .ga-lamp { filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)) }
.day-mode .ga-lamp { filter: saturate(0.88) brightness(0.95) }
.ga-word { font-size: 22px; letter-spacing: 2px; background: none; -webkit-text-fill-color: currentColor; color: var(--ink) }
.day-mode .ga-word { color: #b8741f }
.ga-sep { background: rgba(160,140,120,0.3) }
.ga-sub-brand { font-family: var(--serif); font-size: 12px; letter-spacing: 0.2em; color: var(--soft); opacity: 1 }
.ga-top :deep(.gls-btn) { height: 40px; padding: 0 14px 0 12px; border: 0; font-size: 13.5px; font-weight: 600; color: var(--lang-ink);
  background: var(--lang-glass); box-shadow: var(--lang-rim); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%) }
.ga-top :deep(.gls-btn:hover) { background: var(--lang-glass-hover) }

/* progress: Apply → Verify → Add your picks */
.ga-progress { list-style: none; margin: 4px 0 16px; padding: 0; display: flex; justify-content: center; gap: 6px 18px; flex-wrap: wrap; font-size: 14px; color: var(--soft) }
.ga-progress li { display: inline-flex; align-items: center; gap: 8px }
.ga-progress-n { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font: 400 13px/1 var(--serif);
  background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim) }
.ga-progress li.now { color: var(--ink); font-weight: 600 }
.ga-progress li.now .ga-progress-n { color: #fff; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 14px -3px rgba(255,140,0,0.55) }
.ga-progress li.done .ga-progress-n { color: var(--accent); box-shadow: inset 0 0 0 0.75px var(--gold-rim) }

/* the panel */
.ga-panel { border-radius: 28px; padding: 30px 24px; gap: 18px; color: var(--body) }
.day-mode .ga-panel, .night-mode .ga-panel { background: var(--panel); box-shadow: var(--panel-rim);
  backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%) }
.ga h1 { font-family: var(--serif); font-weight: 500; font-size: clamp(26px, 4.4vw, 34px); line-height: 1.15; letter-spacing: 0.02em; color: var(--ink); text-wrap: balance }
.ga label, .ga legend { color: var(--ink); font-size: 15px }
.ga-muted { color: var(--soft); opacity: 1 }
.ga-who { color: var(--body); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim); border-radius: 999px; padding: 9px 16px }
.ga-linkbtn, .night-mode .ga-linkbtn, .ga-check a, .night-mode .ga-check a { color: var(--link) }

/* fields: glass with the sign-in states */
.ga input:not([type="checkbox"]), .ga textarea, .night-mode input:not([type="checkbox"]), .night-mode textarea, .ga-prefix {
  border: 0; border-radius: 16px; color: var(--f-ink); background-color: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim);
  transition: background-color 0.25s ease, box-shadow 0.25s ease }
.ga input::placeholder, .ga textarea::placeholder { color: var(--f-ph) }
.ga-prefix input:not([type="checkbox"]), .night-mode .ga-prefix input:not([type="checkbox"]) { background: transparent; box-shadow: none; border-radius: 0 }
.ga-prefix span { color: var(--soft); opacity: 1 }
.ga input:not([type="checkbox"]):hover, .ga textarea:hover, .ga-prefix:hover { background-color: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover), 0 0 14px -6px var(--f-glow) }
.ga input:not([type="checkbox"]):focus, .ga textarea:focus, .ga-prefix:focus-within {
  outline: none; background-color: var(--f-fill-hover); background-image: radial-gradient(70% 130% at 50% 135%, var(--f-light), transparent 70%);
  box-shadow: inset 0 0 0 0.75px var(--f-focus-rim), 0 0 16px -4px var(--f-glow) }
.ga-prefix input:focus { background-image: none; box-shadow: none }
.ga input:-webkit-autofill, .ga input:-webkit-autofill:hover, .ga input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--f-ink); caret-color: var(--f-ink);
  -webkit-box-shadow: inset 0 0 0 0.75px var(--f-rim), inset 0 0 0 100px var(--f-solid); box-shadow: inset 0 0 0 0.75px var(--f-rim), inset 0 0 0 100px var(--f-solid);
  transition: background-color 600000s 0s, color 600000s 0s }
.ga-ok, .night-mode .ga-ok, .ga-pwrules .met, .night-mode .ga-pwrules .met { color: var(--ok) }
.ga-bad, .ga-alert, .night-mode .ga-bad, .night-mode .ga-alert { color: var(--rose) }
.ga-alert { padding: 11px 16px; border-radius: 16px; background: rgba(180,68,47,0.07); box-shadow: inset 0 0 0 0.75px var(--rose-rim) }

/* chips: glass, the chosen ones light gold */
.ga-chip { border: 0; color: var(--body); background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim); transition: background-color 0.2s ease, box-shadow 0.2s ease }
.ga-chip:hover { background: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover) }
.ga-chip.on, .ga-chip.jinni-chip-on { color: #fff; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 14px -4px rgba(255,140,0,0.5) }
/* the account box: a quieter glass inset, no border */
.ga-account { border: 0; padding: 18px 16px; border-radius: 22px; background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim) }
.ga-account legend { float: left; width: 100%; margin-bottom: 4px; padding: 0; color: var(--ink) }
/* actions: the solid gold of sign-in's Send Verification Code */
.ga .ga-btn { color: #fff; -webkit-text-fill-color: #fff; text-shadow: none; background: linear-gradient(45deg, #D4AF37, #FF8C00);
  box-shadow: 0 0 18px -4px rgba(255,140,0,0.5); min-height: 50px; padding: 13px 30px; font: 600 16.5px/1.25 var(--lora) }
.ga .ga-btn::before, .ga .ga-btn::after { content: none }
.ga .ga-btn:not(:disabled):hover { filter: brightness(1.05); box-shadow: 0 0 22px -3px rgba(255,140,0,0.6) }
.ga-btn-ghost { border: 0; color: var(--ink); background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim) }
.ga-btn-ghost:not(:disabled):hover { background: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover) }
/* the Instagram code: a gold glass plate */
.ga-code { border: 0; border-radius: 18px; color: var(--ink); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim), 0 0 18px -6px rgba(255,170,80,0.35);
  font-family: var(--serif); letter-spacing: 0.12em }
.ga-steps { color: var(--body) }
.ga-steps li::marker { color: var(--accent); font-family: var(--serif) }
.ga-check input { accent-color: #D4AF37 }
</style>
