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
  mounted() {
    // iOS 26 overscroll for a SHORT page (2026-09-08): the scroll-timeline
    // trick needs range this page lacks, but the bounce tracks LIVE body
    // background-color — flip it at the bottom edge by hand.
    this._skyScroll = () => {
      if (this.isNightMode) return;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      document.body.style.backgroundColor = atBottom ? '#e0a082' : '#f9f5eb';
    };
    window.addEventListener('scroll', this._skyScroll, { passive: true });
    this._skyScroll();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this._skyScroll);
  },
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

/* Below-sky continuation (founder 2026-09-08, Discovery-style): the absolute
   DesertSky covers the first viewport; the page floor carries its ending
   peach so scroll-past and overscroll stay seamless. Night needs nothing —
   the html base purple already matches StarrySky. */
.auth-page.day-mode{background:linear-gradient(180deg,#f9f5eb 0%,#e0a082 30%,#e0a082 100%)}

/* Phones: guarantee the scroll timeline a real range — a borderline
   zero-range page made iOS lock the bounce entirely (2026-09-08). The
   40px cushion is imperceptible; desktop keeps exact-fit. */
@media (pointer: coarse) { .auth-page { min-height: calc(100vh + 40px); } }
</style>