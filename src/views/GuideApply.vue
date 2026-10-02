<template>
  <div class="ga" :class="theme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
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
            <button v-for="k in TYPES" :key="k" type="button" class="ga-chip" :class="{ on: form.guideType === k, 'jinni-chip-on': form.guideType === k }" @click="form.guideType = k">{{ t('guides.types.' + k) }}</button>
          </div>
        </fieldset>

        <fieldset>
          <legend>{{ t('guides.apply.languages') }}</legend>
          <div class="ga-chips">
            <button v-for="l in GUIDING_LANGS" :key="l" type="button" class="ga-chip" :class="{ on: form.languages.includes(l), 'jinni-chip-on': form.languages.includes(l) }" @click="toggleLang(l)">{{ t('guides.langs.' + l) }}</button>
          </div>
        </fieldset>

        <label><span>{{ t('guides.apply.bio') }} <span class="ga-muted">{{ t('guides.apply.optional') }}</span></span>
          <textarea v-model="form.bio" maxlength="400" rows="3" :placeholder="t('guides.apply.bio_ph')"></textarea>
        </label>

        <!-- Signed out: create the Jinni account (or sign in) right here, one page -->
        <fieldset v-if="!signedIn" class="ga-account">
          <legend>{{ t('guides.apply.acct_title') }}</legend>
          <div class="ga-chips">
            <button type="button" class="ga-chip" :class="{ on: acct.mode === 'new', 'jinni-chip-on': acct.mode === 'new' }" @click="acct.mode = 'new'; error = ''">{{ t('guides.apply.acct_new') }}</button>
            <button type="button" class="ga-chip" :class="{ on: acct.mode === 'login', 'jinni-chip-on': acct.mode === 'login' }" @click="acct.mode = 'login'; error = ''">{{ t('guides.apply.acct_have') }}</button>
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
.ga.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 100%); color: #3c2a1e; }
.ga.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 100%); color: #f5e6c8; }
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
</style>
