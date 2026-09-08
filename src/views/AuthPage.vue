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
  methods: {
    handleClose() { this.$router.push('/') },
    handleLoginSuccess(authData) {
      if (authData.user.onboardingCompleted) { this.$router.push('/chat')  } 
      else { this.$router.push('/onboarding') }
    }
  }
}
</script>

<style scoped>
/* TALL BACKGROUND (founder 2026-09-08): the card lives in AuthModal's
   fixed overlay and never moves; the PAGE behind is deliberately taller
   than the phone screen so the document really scrolls — which puts auth
   in the same family as Contact/Landing, where the scroll-driven
   jinni-sky-shift animation (genie-theme.css) colors both bounce edges. */
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  /* Deliberately TRANSPARENT: AuthModal's fixed full-screen overlay (night
   * radial / day desert gradient) is the page's visible background, and
   * App.vue derives the browser-chrome colors from the rendered DOM — an
   * opaque color here would shadow the overlay and mislead that derivation. */
  background: transparent;
  width: 100%;
}
@media (pointer: coarse) {
  .auth-page { min-height: 145vh; }
}

/* Below-sky continuation (founder 2026-09-08, Discovery-style): the absolute
   DesertSky covers the first viewport; the page floor carries its ending
   peach so scroll-past and overscroll stay seamless. Night needs nothing —
   the html base purple already matches StarrySky. */
.auth-page.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}
/* Night was transparent -> white Safari bars once the page became
   scrollable; paint it the overlay's own edge black-violet. */
.auth-page:not(.day-mode){background:#05020d}

</style>