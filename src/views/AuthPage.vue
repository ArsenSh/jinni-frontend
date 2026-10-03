<template>
  <div class="auth-page" :class="isNightMode ? 'jinni-night' : 'day-mode'">
    <!-- The landing's skies (founder 2026-10-03): sign-up is the same world.
         First child, so App.vue's chrome sync finds its data-chrome colours. -->
    <JinniNightSky v-if="isNightMode" />
    <JinniDaySky v-else />
    <AuthModal
        :show="true"
        @close="handleClose"
        @login-success="handleLoginSuccess"
        v-bind="$attrs"
    />
  </div>
</template>

<script>
import AuthModal from '@/components/AuthModal.vue'
import JinniDaySky from '@/components/ui/JinniDaySky.vue'
import JinniNightSky from '@/components/ui/JinniNightSky.vue'

export default {
  name: 'AuthPage',
  components: { AuthModal, JinniDaySky, JinniNightSky },
  computed: {
    // Same source as AuthModal's currentTheme. This was MISSING: undefined
    // isNightMode meant day-mode was stamped even at night, so the painter
    // gave Safari's bars day cream ("white") under the dark modal.
    isNightMode() { return this.$store.getters['settings/effectiveTheme'] === 'dark' }
  },
  mounted() {
    // Guide pages (2026-10-02): remember where a guide came from, so signing
    // in — including the Google round trip — returns them to the application
    // or their dashboard instead of the traveler chat. Guide paths only.
    const r = String(this.$route.query.redirect || '')
    if (/^\/(guides?\/|@)/.test(r)) { try { sessionStorage.setItem('jinni_after_auth', r) } catch { /* no storage */ } }
  },
  methods: {
    handleClose() { this.$router.push('/') },
    handleLoginSuccess(authData) {
      let back = null
      try { back = sessionStorage.getItem('jinni_after_auth'); sessionStorage.removeItem('jinni_after_auth') } catch { /* no storage */ }
      if (back && /^\/(guides?\/|@)/.test(back)) { this.$router.push(back); return }
      if (authData.user.onboardingCompleted) { this.$router.push('/chat')  }
      else { this.$router.push('/onboarding') }
    }
  }
}
</script>

<style scoped>
/* CONTACT-US CONSTRUCTION (founder-diagnosed 2026-09-09): the modal's
   fixed overlay was a SECOND scroll surface — its 96px safe-area bottom
   padding makes it internally scrollable on phones, so it ate the finger
   drag and the document (and jinni-sky-shift) never scrolled. Here the
   overlay is flattened into the page flow (see the override below), so
   auth scrolls as ONE document, physics identical to ContactUs. On the
   landing page the modal stays a true fixed overlay. */
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  /* Deliberately TRANSPARENT: AuthModal's fixed full-screen overlay (night
   * radial / day desert gradient) is the page's visible background, and
   * App.vue derives the browser-chrome colors from the rendered DOM — an
   * opaque color here would shadow the overlay and mislead that derivation. */
  background: transparent;
  width: 100%;
}
@media (pointer: coarse) {
  .auth-page { min-height: 115vh; } /* slim scroll tail — still real range for sky-shift */
}

/* Below-sky continuation (founder 2026-09-08, Discovery-style): the absolute
   DesertSky covers the first viewport; the page floor carries its ending
   peach so scroll-past and overscroll stay seamless. Night needs nothing —
   the html base purple already matches StarrySky. */
/* (2026-10-03) the page floor is now the landing sky, which spans the page */
/* Night was transparent -> white Safari bars once the page became
   scrollable; paint it the overlay's own edge black-violet. */


/* Flatten the overlay into the document flow on this page only.
   (AuthModal's root carries this component's scope attr, so a plain
   scoped descendant selector reaches and outweighs its own rule.) */
.auth-page .auth-modal-overlay {
  position: static;
  height: auto;
  min-height: 100vh;
  overflow: visible;
}
@media (pointer: coarse) {
  .auth-page .auth-modal-overlay { min-height: 100svh; } /* first screenful only; the page supplies the tail */
}
/* Fit-to-screen entry (founder 2026-09-09): auto cross-axis margins center
   the card in the first viewport when it fits, top-align it when it's
   taller — never clipped either way. */
.auth-page :deep(.auth-card) { margin-top: auto; margin-bottom: auto; }
/* Android scroll fix (2026-09-30): AuthModal's card is overflow-y:auto +
   overscroll-behavior:contain with no max-height — a scroll container that
   can't scroll. Chrome 144+ (Android Chrome + Instagram/FB WebView) still
   applies `contain`, so a finger drag starting on the card never scrolled the
   page and the submit/Google buttons were unreachable on small screens. Here
   the page is the one scroll surface, so the card must not be a container.
   The landing-page modal (true fixed overlay) keeps its own rule. */
.auth-page :deep(.auth-card) { overflow-y: visible; overscroll-behavior: auto; }
@media (pointer: coarse) and (max-width: 480px) {
  .auth-page :deep(.auth-modal-overlay) { padding: 30px 16px calc(env(safe-area-inset-bottom, 0px) + 20px); }
}



/* ═══ JINNI SIGN-IN (founder 2026-10-03, LandingLab auth-directions.html:
   "ok, lets put this one"). The landing's world: its sky behind, a frosted
   glass card, lamp + JINNI in Cinzel, glass fields, the round glass close
   button of the landing menu, and the chosen Sign In / Sign Up side styled
   exactly like the gold Send Verification Code button. /auth only — the
   pop-up AuthModal elsewhere keeps its look. Scroll construction unchanged. */
.auth-page { z-index: 1 }   /* own stacking context, so the sky (z -1) sits above body */
.auth-page .auth-modal-overlay.day-mode,
.auth-page .auth-modal-overlay.night-mode { background: transparent }
.auth-page :deep(.auth-card) { position: relative; border-radius: 30px; padding: 30px 22px 24px;
  backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%) }
.auth-page.day-mode :deep(.auth-card) { background: rgba(255,255,255,0.55); box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 18px -2px rgba(140,61,7,0.12) }
.auth-page.jinni-night :deep(.auth-card) { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -2px rgba(0,0,0,0.45) }
/* close = the landing menu's round glass button */
.auth-page :deep(.close-button) { top: 14px; right: 14px; width: 38px; height: 38px; padding: 0; border-radius: 999px; display: grid; place-items: center;
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%) }
.auth-page :deep(.close-button svg) { width: 16px; height: 16px }
.auth-page :deep(.close-button path) { stroke-width: 1.6 }
.auth-page.day-mode :deep(.close-button), .auth-page.day-mode :deep(.close-button:hover) { color: #7A4A1C; background: rgba(255,255,255,0.45);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.85), 0 0 18px -2px rgba(140,61,7,0.14) }
.auth-page.jinni-night :deep(.close-button), .auth-page.jinni-night :deep(.close-button:hover) { color: #f3eaf8; background: rgba(255,255,255,0.06);
  box-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px -2px rgba(0,0,0,0.3) }
/* mark: lamp + JINNI (Cinzel's lowercase is small caps) */
.auth-page :deep(.bottle-image) { width: 92px; height: auto }
.auth-page.day-mode :deep(.bottle-image) { filter: saturate(0.88) brightness(0.95) drop-shadow(0 0 16px rgba(255,170,80,0.45)) }
.auth-page.jinni-night :deep(.bottle-image) { filter: drop-shadow(0 0 16px rgba(255,160,70,0.5)) }
.auth-page :deep(.auth-title) { margin-top: 2px; font-family: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif; font-size: 32px; font-weight: 600; letter-spacing: 3px;
  background: none; -webkit-text-fill-color: currentColor }
.auth-page.day-mode :deep(.auth-title) { color: #b8741f }
.auth-page.jinni-night :deep(.auth-title) { color: #f3eaf8 }
.auth-page :deep(.auth-subtitle) { font-size: 19px }
.auth-page.day-mode :deep(.auth-subtitle) { color: #7A4A1C }
.auth-page.jinni-night :deep(.auth-subtitle) { color: #e6dcf2 }
/* switch: the chosen side = the Send Verification Code button */
.auth-page.day-mode :deep(.auth-toggle) { background: rgba(140,61,7,0.06) }
.auth-page.jinni-night :deep(.auth-toggle) { background: rgba(255,255,255,0.05) }
.auth-page.day-mode :deep(.toggle-btn) { color: #7a5434 }
.auth-page.jinni-night :deep(.toggle-btn) { color: #c9c0da }
.auth-page :deep(.toggle-btn.active) { color: #fff; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 18px -4px rgba(255,140,0,0.5) }
.auth-page :deep(.submit-btn) { box-shadow: 0 0 18px -4px rgba(255,140,0,0.5) }
/* fields + Google: glass pills */
.auth-page.day-mode :deep(.input-field), .auth-page.day-mode :deep(.social-btn) { background: rgba(255,255,255,0.62); border: 0; color: #5a3c22;
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9) }
.auth-page.day-mode :deep(.input-field::placeholder) { color: rgba(122,84,52,0.7) }
.auth-page.jinni-night :deep(.input-field), .auth-page.jinni-night :deep(.social-btn) { background: rgba(255,255,255,0.06); border: 0; color: #f3eaf8;
  box-shadow: inset 0 0 0 0.75px rgba(220,210,255,0.12) }
.auth-page.jinni-night :deep(.input-field::placeholder) { color: rgba(220,210,240,0.6) }
.auth-page :deep(.input-field:focus) { box-shadow: inset 0 0 0 0.75px rgba(212,175,55,0.7), 0 0 14px -2px rgba(212,175,55,0.35) }
.auth-page :deep(.social-btn:hover:not(:disabled)) { filter: brightness(1.05) }
.auth-page.day-mode :deep(.password-toggle) { color: #9a5a1e }
.auth-page.jinni-night :deep(.password-toggle) { color: #ffd29a }
/* "or continue with" without the rules either side */
.auth-page :deep(.social-divider::before) { content: none }
.auth-page.day-mode :deep(.social-divider span) { color: rgba(122,84,52,0.75) }
.auth-page.jinni-night :deep(.social-divider span) { color: rgba(220,210,240,0.65) }
.auth-page.day-mode :deep(.auth-footer a) { color: #9a5a1e }
.auth-page.jinni-night :deep(.auth-footer a) { color: #ffd29a }

/* ── Field states (founder 2026-10-03: "the hover and so on we can make
   interesting"; iPhone Passwords painted filled fields bright yellow).
   Rules: no motion on hover, even shadows, light only. Hover = the glass
   brightens and its edge warms; focus = lamplight rises inside the field
   (the Make a Wish light, quiet); autofill keeps the glass (Safari/Chrome let
   the page restyle it — only iOS's own sheet and key icon are fixed); error
   = warm rose, not neon; messages = glass pills that fade in. ── */
.auth-page.day-mode {
  --f-fill: rgba(255,255,255,0.62); --f-fill-hover: rgba(255,255,255,0.78); --f-solid: #fdf8ee; --f-ink: #5a3c22;
  --f-rim: rgba(255,255,255,0.9); --f-rim-hover: rgba(232,190,130,0.75); --f-glow: rgba(212,140,60,0.22);
  --f-light: rgba(255,170,80,0.22); --f-focus-rim: rgba(200,140,50,0.7);
  --rose: #a83c28; --rose-rim: rgba(180,68,47,0.55); --rose-fill: rgba(180,68,47,0.07);
  --gold-ink: #8a5a14; --gold-fill: rgba(212,175,55,0.1); --gold-rim: rgba(184,125,40,0.3) }
.auth-page.jinni-night {
  --f-fill: rgba(255,255,255,0.06); --f-fill-hover: rgba(255,255,255,0.1); --f-solid: #2a2140; --f-ink: #f3eaf8;
  --f-rim: rgba(220,210,255,0.12); --f-rim-hover: rgba(255,214,160,0.3); --f-glow: rgba(255,170,90,0.18);
  --f-light: rgba(255,160,70,0.2); --f-focus-rim: rgba(255,200,120,0.6);
  --rose: #ffb3a7; --rose-rim: rgba(255,154,138,0.6); --rose-fill: rgba(255,120,110,0.08);
  --gold-ink: #ffd29a; --gold-fill: rgba(255,210,140,0.07); --gold-rim: rgba(255,210,122,0.3) }

.auth-page.day-mode :deep(.input-field), .auth-page.jinni-night :deep(.input-field),
.auth-page.day-mode :deep(.social-btn), .auth-page.jinni-night :deep(.social-btn) {
  background-color: var(--f-fill); color: var(--f-ink); border: 0; box-shadow: inset 0 0 0 0.75px var(--f-rim);
  transition: background-color 0.25s ease, box-shadow 0.25s ease }
.auth-page.day-mode :deep(.input-field:hover), .auth-page.jinni-night :deep(.input-field:hover),
.auth-page.day-mode :deep(.social-btn:hover:not(:disabled)), .auth-page.jinni-night :deep(.social-btn:hover:not(:disabled)) {
  background-color: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover), 0 0 14px -6px var(--f-glow); filter: none }
/* typing: lamplight rises from the bottom of the field */
.auth-page.day-mode :deep(.input-field:focus), .auth-page.jinni-night :deep(.input-field:focus) {
  outline: none; background-color: var(--f-fill-hover);
  background-image: radial-gradient(70% 130% at 50% 135%, var(--f-light), transparent 70%);
  box-shadow: inset 0 0 0 0.75px var(--f-focus-rim), 0 0 16px -4px var(--f-glow) }
/* autofill (iPhone Passwords, Chrome): stay glass, never yellow */
.auth-page.day-mode :deep(.input-field:-webkit-autofill), .auth-page.jinni-night :deep(.input-field:-webkit-autofill),
.auth-page.day-mode :deep(.input-field:-webkit-autofill:hover), .auth-page.jinni-night :deep(.input-field:-webkit-autofill:hover),
.auth-page.day-mode :deep(.input-field:-webkit-autofill:focus), .auth-page.jinni-night :deep(.input-field:-webkit-autofill:focus) {
  -webkit-text-fill-color: var(--f-ink); caret-color: var(--f-ink);
  -webkit-box-shadow: inset 0 0 0 0.75px var(--f-rim), inset 0 0 0 100px var(--f-solid);
  box-shadow: inset 0 0 0 0.75px var(--f-rim), inset 0 0 0 100px var(--f-solid);
  transition: background-color 600000s 0s, color 600000s 0s }
.auth-page.day-mode :deep(.input-field:autofill), .auth-page.jinni-night :deep(.input-field:autofill) {
  box-shadow: inset 0 0 0 0.75px var(--f-rim), inset 0 0 0 100px var(--f-solid) }
/* a field with a mistake (the glass fields have no border, so the old
   pink border never showed — 2026-10-03 regression, fixed here) */
.auth-page.day-mode :deep(.input-field.input-error), .auth-page.jinni-night :deep(.input-field.input-error) {
  box-shadow: inset 0 0 0 1px var(--rose-rim), 0 0 14px -6px var(--rose-rim) }
.auth-page .auth-modal-overlay.day-mode :deep(.error-text), .auth-page .auth-modal-overlay.night-mode :deep(.error-text) { color: var(--rose); font-size: 13px }
/* messages: glass pills that fade in */
.auth-page .auth-modal-overlay.day-mode :deep(.error-message), .auth-page .auth-modal-overlay.night-mode :deep(.error-message), .auth-page .auth-modal-overlay.day-mode :deep(.success-message), .auth-page .auth-modal-overlay.night-mode :deep(.success-message) {
  display: flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 999px; padding: 11px 18px; font-size: 14.5px;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); animation: auth-msg-in 0.35s ease-out }
.auth-page .auth-modal-overlay.day-mode :deep(.error-message), .auth-page .auth-modal-overlay.night-mode :deep(.error-message) { color: var(--rose); background: var(--rose-fill); box-shadow: inset 0 0 0 0.75px var(--rose-rim) }
.auth-page .auth-modal-overlay.day-mode :deep(.success-message), .auth-page .auth-modal-overlay.night-mode :deep(.success-message) { color: var(--gold-ink); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim) }
.auth-page :deep(.success-message)::before { content: ''; flex: none; width: 7px; height: 7px; border-radius: 50%;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 8px rgba(255,170,60,0.8) }
/* password strength: the palette's own weak / medium / strong */
.auth-page.day-mode { --pw-weak: #c0573f; --pw-mid: #c98a1e; --pw-ok: #4f8a3c }
.auth-page.jinni-night { --pw-weak: #ff9a8a; --pw-mid: #f0c060; --pw-ok: #8fd18a }
.auth-page :deep(.password-strength) { height: 2px; margin: 8px 20px 0; background: rgba(140,110,90,0.15) }
.auth-page :deep(.strength-bar.weak) { background: var(--pw-weak) }
.auth-page :deep(.strength-bar.medium) { background: var(--pw-mid) }
.auth-page :deep(.strength-bar.strong) { background: var(--pw-ok) }
.auth-page.day-mode :deep(.password-hints span) { color: rgba(122,84,52,0.6) }
.auth-page.jinni-night :deep(.password-hints span) { color: rgba(220,210,240,0.5) }
.auth-page :deep(.password-hints span.met) { color: var(--pw-ok) }
@keyframes auth-msg-in { from { opacity: 0 } to { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .auth-page :deep(.error-message), .auth-page :deep(.success-message) { animation: none } }
/* the other controls */
.auth-page.day-mode :deep(.toggle-btn:not(.active):hover) { color: #6e3f16; background: rgba(255,255,255,0.35) }
.auth-page.jinni-night :deep(.toggle-btn:not(.active):hover) { color: #fbf5ff; background: rgba(255,255,255,0.06) }
.auth-page.day-mode :deep(.back-btn), .auth-page.jinni-night :deep(.back-btn) { border: 0; color: var(--f-ink); background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim) }
.auth-page.day-mode :deep(.back-btn:hover), .auth-page.jinni-night :deep(.back-btn:hover) { color: var(--f-ink); background: var(--f-fill-hover);
  border: 0; box-shadow: inset 0 0 0 0.75px var(--f-rim-hover), 0 0 14px -6px var(--f-glow) }
.auth-page.day-mode :deep(.password-toggle:hover) { color: #6e3f16 }
.auth-page.jinni-night :deep(.password-toggle:hover) { color: #fff1d6 }
.auth-page.day-mode :deep(.email-address), .auth-page.jinni-night :deep(.email-address) { color: var(--gold-ink); background: var(--gold-fill); box-shadow: inset 0 0 0 0.75px var(--gold-rim) }
</style>