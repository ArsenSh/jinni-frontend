<template>
  <div class="gl" :class="theme">
    <header class="gl-top">
      <router-link to="/" class="gl-brand" aria-label="Jinni home">
        <img src="/images/bottle.png" alt="" class="gl-lamp" />
        <span class="gl-word" translate="no">Jinni</span>
        <span class="gl-sep" aria-hidden="true"></span>
        <span class="gl-sub-brand">Guides</span>
      </router-link>
      <router-link v-if="signedIn" :to="isGuide ? '/guide/dashboard' : '/guides/apply'" class="gl-link">{{ isGuide ? 'My guide page' : 'Apply' }}</router-link>
      <router-link v-else to="/auth?redirect=/guides/apply" class="gl-link">Sign in</router-link>
    </header>

    <section class="gl-hero">
      <div class="gl-hero-text">
        <p class="gl-badge"><span class="gl-dot" aria-hidden="true"></span>Jinni for Guides <span class="gl-badge-free">· Free</span></p>
        <h1>Your picks.<br />Your page.<br /><span class="grad">Travelers listening.</span></h1>
        <p class="gl-sub">A free page at <strong>jinni.travel/@you</strong> for local guides and travel creators. Share your favourite places, photo spots and tours — and every traveler who asks Jinni about them sees your name.</p>
        <div class="gl-cta-row">
          <router-link :to="ctaTo" class="gl-cta jinni-pill">{{ isGuide ? 'Open my dashboard' : 'Apply as a guide' }}</router-link>
          <span class="gl-note">Takes 3 minutes · approved by our team</span>
        </div>
      </div>

      <!-- What a guide gets, shown, not told. Clearly an example. -->
      <aside class="gl-example" aria-label="Example guide page">
        <span class="gl-example-tag">Example</span>
        <div class="gl-ex-head">
          <div class="gl-ex-avatar">AP</div>
          <div>
            <strong>Ani Petrosyan</strong>
            <small>Local expert · Dilijan</small>
          </div>
        </div>
        <ul class="gl-ex-list">
          <li><span class="gl-ex-cat">Hidden gem</span><b>Old Dilijan street</b><em>"Come at 8am, before the buses."</em></li>
          <li><span class="gl-ex-cat">Restaurant</span><b>A family kitchen by the lake</b><em>"Order the trout — caught that morning."</em></li>
          <li><span class="gl-ex-cat">Activity</span><b>Sunrise hike · 4 h</b><em>Book Ani on WhatsApp</em></li>
        </ul>
        <div class="gl-ex-foot">jinni.travel/@ani.travels <span class="gl-ex-badge">Picked by @ani.travels</span></div>
      </aside>
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
      <div class="gl-foot-line" aria-hidden="true"></div>
      <router-link to="/" class="gl-foot-brand"><img src="/images/bottle.png" alt="" /><span translate="no">Jinni</span></router-link>
      <nav class="gl-foot-links">
        <router-link to="/terms">Terms</router-link>
        <router-link to="/privacy">Privacy</router-link>
        <router-link to="/contact">Contact</router-link>
        <router-link to="/business">For business</router-link>
      </nav>
      <p class="gl-foot-copy">© {{ year }} Jinni · Your AI travel companion</p>
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
const year = new Date().getFullYear()
const ctaTo = computed(() => (isGuide.value ? '/guide/dashboard' : (signedIn ? '/guides/apply' : '/auth?redirect=/guides/apply')))

onMounted(async () => {
  if (!signedIn) return
  try { const r = await guideApi('/me'); isGuide.value = !!r.guide } catch { /* stays a visitor */ }
})
</script>

<style scoped>
.gl { --serif: var(--brand-serif, 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif);
  min-height: 100vh; font-family: 'Lora', Georgia, serif; padding: 0 16px 0; box-sizing: border-box; overflow-x: hidden; }
.gl.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 100%); color: #3c2a1e; }
.gl.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 100%); color: #f5e6c8; }

/* Header: lamp + gold wordmark + "Guides" */
.gl-top { max-width: 1080px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 20px 0; gap: 12px; }
.gl-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; min-width: 0; }
.gl-lamp { width: 40px; height: auto; flex: 0 0 auto; }
.gl-word { font-family: var(--serif); font-size: 28px; font-weight: 600; line-height: 1; letter-spacing: 1px;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gl-sep { width: 1px; height: 22px; background: linear-gradient(180deg, rgba(212, 175, 55, 0), rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0)); }
.gl-sub-brand { font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; }
.gl-link { color: inherit; text-decoration: none; font-size: 15px; padding: 9px 18px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); white-space: nowrap; }
.gl-link:hover { background: rgba(212, 175, 55, 0.12); }

/* Hero */
.gl-hero { max-width: 1080px; margin: 28px auto 0; display: grid; grid-template-columns: 1fr; gap: 32px; align-items: center; }
.gl-badge { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 18px; padding: 7px 14px; border-radius: 999px; font-size: 14px; letter-spacing: 0.02em; backdrop-filter: blur(12px); }
.night-mode .gl-badge { background: rgba(255, 255, 255, 0.06); box-shadow: inset 0 0 0 1px rgba(255, 210, 122, 0.35); color: #ffd27a; }
.day-mode .gl-badge { background: rgba(255, 255, 255, 0.55); box-shadow: inset 0 0 0 1px rgba(122, 74, 28, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8); color: #7A4A1C; }
.gl-dot { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 8px rgba(255, 170, 60, 0.8); }
.gl-badge-free { opacity: 0.75; }
.gl-hero h1 { font-size: clamp(36px, 6.2vw, 60px); line-height: 1.06; margin: 0 0 18px; font-weight: 600; }
.grad { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gl-sub { font-size: 18px; line-height: 1.6; max-width: 560px; margin: 0 0 26px; opacity: 0.92; }
.gl-cta-row { display: flex; align-items: center; gap: 14px 18px; flex-wrap: wrap; }
.gl-note { font-size: 13px; opacity: 0.7; }

/* Example guide page */
.gl-example { position: relative; border-radius: 22px; padding: 22px 20px 18px; backdrop-filter: blur(20px) saturate(160%); max-width: 440px; width: 100%; justify-self: center; box-sizing: border-box; }
.night-mode .gl-example { background: rgba(255, 255, 255, 0.06); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.06); }
.day-mode .gl-example { background: rgba(255, 255, 255, 0.7); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.16); }
.gl-example-tag { position: absolute; top: 14px; right: 16px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.55; }
.gl-ex-head { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.gl-ex-head strong { display: block; font-size: 17px; }
.gl-ex-head small { opacity: 0.7; font-size: 13px; }
.gl-ex-avatar { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #2b1d0e; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 14px -2px rgba(255, 140, 0, 0.5); }
.gl-ex-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.gl-ex-list li { display: grid; gap: 2px; padding: 10px 12px; border-radius: 14px; }
.night-mode .gl-ex-list li { background: rgba(255, 255, 255, 0.04); }
.day-mode .gl-ex-list li { background: rgba(249, 245, 235, 0.9); }
.gl-ex-cat { justify-self: start; font-size: 11px; padding: 1px 9px; border-radius: 999px; background: rgba(212, 175, 55, 0.2); }
.gl-ex-list b { font-size: 15px; font-weight: 600; }
.gl-ex-list em { font-size: 13px; opacity: 0.8; }
.gl-ex-foot { margin-top: 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; opacity: 0.85; }
.gl-ex-badge { font-size: 11px; padding: 3px 9px; border-radius: 999px; }
.night-mode .gl-ex-badge { color: #ffd27a; box-shadow: inset 0 0 0 1px rgba(255, 210, 122, 0.4); }
.day-mode .gl-ex-badge { color: #b4540a; box-shadow: inset 0 0 0 1px rgba(180, 84, 10, 0.35); }

/* Benefits + steps */
.gl-grid { max-width: 1080px; margin: 56px auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.gl-card { border-radius: 18px; padding: 22px; backdrop-filter: blur(20px) saturate(160%); }
.day-mode .gl-card { background: rgba(255, 255, 255, 0.6); box-shadow: 0 0 18px -2px rgba(60, 42, 30, 0.14); }
.night-mode .gl-card { background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 18px -2px rgba(0, 0, 0, 0.5); }
.gl-ico { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; color: #fff; background: linear-gradient(45deg, #D4AF37, #FF8C00); margin-bottom: 12px; }
.gl-card h3 { margin: 0 0 8px; font-size: 18px; }
.gl-card p { margin: 0; line-height: 1.5; font-size: 15px; opacity: 0.9; }
.gl-steps { max-width: 1080px; margin: 0 auto; }
.gl-steps h2 { font-size: 26px; margin: 0 0 16px; }
.gl-steps ol { list-style: none; padding: 0; margin: 0 0 26px; display: grid; gap: 14px; }
.gl-steps li { display: flex; gap: 14px; align-items: flex-start; font-size: 16px; line-height: 1.5; }
.gl-steps li span { flex: 0 0 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; border: 1px solid rgba(212, 175, 55, 0.6); color: #b4540a; }
.night-mode .gl-steps li span { color: #ffd27a; }

/* Footer */
.gl-foot { max-width: 1080px; margin: 64px auto 0; padding: 0 0 34px; display: grid; justify-items: center; gap: 14px; text-align: center; }
.gl-foot-line { width: 100%; height: 1px; background: linear-gradient(90deg, rgba(212, 175, 55, 0), rgba(212, 175, 55, 0.55), rgba(212, 175, 55, 0)); margin-bottom: 18px; }
.gl-foot-brand { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; font-family: var(--serif); font-size: 20px; font-weight: 600; letter-spacing: 1px; }
.gl-foot-brand img { width: 30px; }
.gl-foot-brand span { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.gl-foot-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 22px; }
.gl-foot-links a { font-family: var(--serif); font-size: 15px; text-decoration: none; padding: 6px 2px; }
.night-mode .gl-foot-links a { color: #FF8C00; }
.day-mode .gl-foot-links a { color: #7A4A1C; }
.gl-foot-links a:hover { text-decoration: underline; text-underline-offset: 4px; }
.gl-foot-copy { margin: 0; font-size: 13px; opacity: 0.65; font-family: var(--serif); }

/* Desktop: hero in two columns, the example on the right */
@media (min-width: 900px) {
  .gl { padding: 0 32px; }
  .gl-hero { grid-template-columns: 1.15fr 0.85fr; gap: 56px; margin-top: 48px; }
  .gl-example { justify-self: end; }
  .gl-steps ol { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}
@media (max-width: 380px) { .gl-word { font-size: 24px; } .gl-sub-brand { display: none; } .gl-sep { display: none; } }
</style>
