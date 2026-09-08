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
/* FIXED SHELL (founder 2026-09-08): the real UI is AuthModal's fixed
   overlay with its own inner scroll — like JinniChat. A fixed shell has no
   body scroll, so iOS has no bounce to color; that's WHY chat always
   behaves. The cushion/JS/timeline experiments are all gone. */
.auth-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  /* Deliberately TRANSPARENT: AuthModal's fixed full-screen overlay (night
   * radial / day desert gradient) is the page's visible background, and
   * App.vue derives the browser-chrome colors from the rendered DOM — an
   * opaque color here would shadow the overlay and mislead that derivation. */
  background: transparent;
  overflow-y: auto;
  width: 100%;
}

/* Below-sky continuation (founder 2026-09-08, Discovery-style): the absolute
   DesertSky covers the first viewport; the page floor carries its ending
   peach so scroll-past and overscroll stay seamless. Night needs nothing —
   the html base purple already matches StarrySky. */
.auth-page.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}

</style>