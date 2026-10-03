<template>
  <!-- data-chrome-*: the colours this backdrop really shows at the screen's
       top and bottom, read by App.vue's chrome sync (see findPagePaint). -->
  <div class="jinni-night-sky" data-chrome-top="#0a0118" data-chrome-bottom="#16213e" aria-hidden="true">
    <span class="orb orb-violet"></span>
    <span class="orb orb-blue"></span>
  </div>
</template>

<script>
/* ═══════════════════════════════════════════════════════════════════════════
   JINNI NIGHT (founder 2026-10-03, picked from the LandingLab night
   directions: "that one is powerful, set it for night mode"). The landing and
   /business at night take JinniChat's own night gradient, so a visitor lands
   in the same world they will see inside the app:
     #0a0118 (top) → #1a0b2e (40%) → #16213e (bottom)   — JinniChat.vue
   Two soft glows, one violet and one blue, drift very slowly behind the
   content. Pinned to the viewport like StarrySky was (same reasons: one
   screen of atmosphere, no density change on long pages). Pure CSS — no
   canvas, no per-frame JS; reduced motion stops the drift.
   ═══════════════════════════════════════════════════════════════════════════ */
export default { name: 'JinniNightSky' }
</script>

<style scoped>
.jinni-night-sky {
  position: fixed; top: 0; left: 0; width: 100%;
  height: 100vh; height: 100lvh;          /* tallest viewport: covers every Safari bar state */
  z-index: -1; overflow: hidden; pointer-events: none;
  background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 40%, #16213e 100%);
}
/* Phones: run on under Safari's glass bottom bar and the home-indicator strip
   (same reason as StarrySky, founder 2026-10-01). Clipped by the viewport. */
@media (max-width: 768px) {
  .jinni-night-sky { height: calc(100lvh + env(safe-area-inset-bottom, 0px) + 140px) }
}
.orb { position: absolute; border-radius: 50%; filter: blur(70px); will-change: transform }
.orb-violet {
  width: 560px; height: 560px; left: -180px; top: 14%;
  background: radial-gradient(circle, rgba(124,77,255,0.42), rgba(124,77,255,0) 70%);
  animation: orb-a 22s ease-in-out infinite;
}
.orb-blue {
  width: 640px; height: 640px; right: -240px; top: 46%;
  background: radial-gradient(circle, rgba(56,104,214,0.38), rgba(56,104,214,0) 70%);
  animation: orb-b 26s ease-in-out infinite;
}
@media (max-width: 768px) {
  .orb-violet { width: 380px; height: 380px; left: -150px }
  .orb-blue { width: 440px; height: 440px; right: -200px }
}
@keyframes orb-a { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(140px, 90px) } }
@keyframes orb-b { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(-160px, -120px) } }
@media (prefers-reduced-motion: reduce) { .orb { animation: none } }
</style>
