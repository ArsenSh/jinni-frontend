<template>
  <div class="auth-page">
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
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  /* Deliberately TRANSPARENT: AuthModal's fixed full-screen overlay (night
   * radial / day desert gradient) is the page's visible background, and
   * App.vue derives the browser-chrome colors from the rendered DOM — an
   * opaque color here would shadow the overlay and mislead that derivation. */
  background: transparent;
  overflow-y: auto;
  width: 100%;
}
</style>