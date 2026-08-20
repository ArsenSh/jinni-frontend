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
  /* Was rgba(0,0,0,0.7) OVER the body — same dark look, but translucent, so
   * the browser chrome/overscroll/keyboard band (painted from the body color
   * by App.vue) showed CREAM around a dark page in day theme. These are the
   * exact composed colors the overlay used to produce: 70% black over cream
   * (#f9f5eb) and over night (#0a0118). App.vue derives the chrome from
   * these rendered colors automatically. */
  background: #4b4a47;
  overflow-y: auto;
  width: 100%;
}
body.theme-dark .auth-page {
  background: #0a0118;
}
</style>