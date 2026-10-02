<template>
  <div class="gl" :class="theme">
    <header class="gl-top">
      <router-link to="/" class="gl-brand"><img src="/images/bottle.png" alt="" class="gl-lamp" />Jinni</router-link>
      <router-link v-if="signedIn" :to="isGuide ? '/guide/dashboard' : '/guides/apply'" class="gl-link">{{ isGuide ? 'My guide page' : 'Apply' }}</router-link>
      <router-link v-else to="/auth?redirect=/guides/apply" class="gl-link">Sign in</router-link>
    </header>

    <section class="gl-hero">
      <p class="gl-kicker">Jinni for Guides</p>
      <h1>Your picks.<br />Your page.<br /><span class="grad">Travelers listening.</span></h1>
      <p class="gl-sub">A free page at <strong>jinni.travel/@you</strong> for local guides and travel creators. Share your favourite places, photo spots and tours — and every traveler who asks Jinni about them sees your name.</p>
      <router-link :to="ctaTo" class="gl-cta jinni-pill">{{ isGuide ? 'Open my dashboard' : 'Apply as a guide' }}</router-link>
      <p class="gl-note">Free · takes 3 minutes · approved by our team</p>
    </section>

    <section class="gl-grid">
      <div class="gl-card">
        <div class="gl-ico">★</div>
        <h3>Your name on your places</h3>
        <p>Restaurants, hidden gems, photo spots and activities you pick show "Picked by @you" to everyone who meets them on Jinni.</p>
      </div>
      <div class="gl-card">
        <div class="gl-ico">◎</div>
        <h3>Customers for your tours</h3>
        <p>List your tours under activities. Travelers book you directly — on WhatsApp, Telegram, phone or your site. You keep 100%.</p>
      </div>
      <div class="gl-card">
        <div class="gl-ico">✉</div>
        <h3>Fewer "where is this?" DMs</h3>
        <p>Put your page in your Instagram bio. Followers open it and ask Jinni — your picks come first, with your reels.</p>
      </div>
    </section>

    <section class="gl-steps">
      <h2>How it works</h2>
      <ol>
        <li><span>1</span><div><strong>Apply</strong> with your Jinni account: your name, Instagram, where you guide.</div></li>
        <li><span>2</span><div><strong>Verify</strong> — put a short code in your Instagram bio for a day. Our team checks it.</div></li>
        <li><span>3</span><div><strong>Add your picks</strong> — choose places from Jinni, add a line in your words and your reel.</div></li>
      </ol>
      <router-link :to="ctaTo" class="gl-cta jinni-pill">{{ isGuide ? 'Open my dashboard' : 'Start my page' }}</router-link>
    </section>

    <footer class="gl-foot">
      <router-link to="/terms">Terms</router-link> · <router-link to="/privacy">Privacy</router-link> · <router-link to="/contact">Contact</router-link>
    </footer>
  </div>
</template>

<script setup>
import '@/assets/styles/jinni-pill.css'
import { ref, computed, onMounted } from 'vue'
import { guideTheme, guideApi, hasToken } from '@/utils/guides'

const theme = guideTheme()
const signedIn = hasToken()
const isGuide = ref(false)
const ctaTo = computed(() => (isGuide.value ? '/guide/dashboard' : (signedIn ? '/guides/apply' : '/auth?redirect=/guides/apply')))

onMounted(async () => {
  if (!signedIn) return
  try { const r = await guideApi('/me'); isGuide.value = !!r.guide } catch { /* stays a visitor */ }
})
</script>

<style scoped>
.gl { min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 40px; box-sizing: border-box; }
.gl.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 100%); color: #3c2a1e; }
.gl.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 100%); color: #f5e6c8; }
.gl-top { max-width: 960px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
.gl-brand { display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 600; text-decoration: none; color: inherit; }
.gl-lamp { width: 34px; height: auto; }
.gl-link { color: inherit; text-decoration: none; font-size: 15px; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); }
.gl-link:hover { background: rgba(212, 175, 55, 0.12); }
.gl-hero { max-width: 760px; margin: 28px auto 8px; text-align: left; }
.gl-kicker { letter-spacing: 0.12em; text-transform: uppercase; font-size: 13px; color: #b4540a; margin: 0 0 10px; }
.night-mode .gl-kicker { color: #ffd27a; }
.gl-hero h1 { font-size: clamp(34px, 7vw, 56px); line-height: 1.08; margin: 0 0 16px; font-weight: 600; }
.grad { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gl-sub { font-size: 18px; line-height: 1.55; max-width: 620px; margin: 0 0 24px; opacity: 0.92; }
.gl-cta { justify-self: start; }
.gl-note { font-size: 13px; opacity: 0.7; margin: 10px 0 0; }
.gl-grid { max-width: 960px; margin: 44px auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.gl-card { border-radius: 18px; padding: 22px; backdrop-filter: blur(20px) saturate(160%); }
.day-mode .gl-card { background: rgba(255, 255, 255, 0.6); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .gl-card { background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.5); }
.gl-ico { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; color: #fff; background: linear-gradient(45deg, #D4AF37, #FF8C00); margin-bottom: 12px; }
.gl-card h3 { margin: 0 0 8px; font-size: 18px; }
.gl-card p { margin: 0; line-height: 1.5; font-size: 15px; opacity: 0.9; }
.gl-steps { max-width: 760px; margin: 0 auto; }
.gl-steps h2 { font-size: 26px; margin: 0 0 16px; }
.gl-steps ol { list-style: none; padding: 0; margin: 0 0 24px; display: grid; gap: 14px; }
.gl-steps li { display: flex; gap: 14px; align-items: flex-start; font-size: 16px; line-height: 1.5; }
.gl-steps li span { flex: 0 0 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; border: 1px solid rgba(212, 175, 55, 0.6); color: #b4540a; }
.night-mode .gl-steps li span { color: #ffd27a; }
.gl-foot { max-width: 960px; margin: 48px auto 0; font-size: 13px; opacity: 0.7; text-align: center; }
.gl-foot a { color: inherit; }
</style>
