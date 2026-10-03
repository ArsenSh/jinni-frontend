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
</style>