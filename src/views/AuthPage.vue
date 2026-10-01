<template>
  <div class="auth-page" :class="{ 'day-mode': !isNightMode }">
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

export default {
  name: 'AuthPage',
  components: { AuthModal },
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
.auth-page.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}
/* Night was transparent -> white Safari bars once the page became
   scrollable; paint it the overlay's own edge black-violet. */
.auth-page:not(.day-mode){background:#000} /* = the night radial's edge color: tail and bounce merge seamlessly */

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
/* Day: same sky floor as the page so bounce, bars and background agree. */
.auth-page.day-mode .auth-modal-overlay.day-mode {
  background: linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%);
}

</style>