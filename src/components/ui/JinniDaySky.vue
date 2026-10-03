<template>
  <!-- data-chrome-*: the colours this backdrop really shows at the screen's
       top and bottom, read by App.vue's chrome sync (see findPagePaint). -->
  <div class="jinni-day-sky" data-chrome-top="#f9f5eb" data-chrome-bottom="#efe4cf" aria-hidden="true">
    <span class="orb orb-apricot"></span>
    <span class="orb orb-honey"></span>
    <span class="orb orb-lamp"></span>
  </div>
</template>

<script>
/* ═══════════════════════════════════════════════════════════════════════════
   JINNI DAY (founder 2026-10-03: the LandingLab preview's day twin, design 5 —
   "where is the background color same as in your preview"). JinniChat's own
   day gradient, so a visitor lands in the world they will see in the app:
     #f9f5eb (top) → #f5edda (55%) → #efe4cf (bottom)
   Two warm glows (apricot, honey) drift slowly, and a soft pool of lamplight
   sits behind the hero. Mirrors JinniNightSky: fixed to the viewport, pure
   CSS, reduced motion stops the drift.
   ═══════════════════════════════════════════════════════════════════════════ */
export default { name: 'JinniDaySky' }
</script>

<style scoped>
.jinni-day-sky {
  position: fixed; top: 0; left: 0; width: 100%;
  height: 100vh; height: 100lvh;
  z-index: -1; overflow: hidden; pointer-events: none;
  background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 55%, #efe4cf 100%);
}
@media (max-width: 768px) {
  .jinni-day-sky { height: calc(100lvh + env(safe-area-inset-bottom, 0px) + 140px) }
}
.orb { position: absolute; border-radius: 50%; filter: blur(70px); will-change: transform }
.orb-apricot {
  width: 540px; height: 540px; left: -170px; top: 16%;
  background: radial-gradient(circle, rgba(255,170,110,0.45), rgba(255,170,110,0) 70%);
  animation: orb-a 22s ease-in-out infinite;
}
.orb-honey {
  width: 620px; height: 620px; right: -230px; top: 46%;
  background: radial-gradient(circle, rgba(242,196,96,0.42), rgba(242,196,96,0) 70%);
  animation: orb-b 26s ease-in-out infinite;
}
.orb-lamp {
  width: 760px; height: 560px; left: 50%; top: -120px; transform: translateX(-50%); filter: blur(40px);
  background: radial-gradient(closest-side, rgba(255,214,150,0.45), rgba(255,200,130,0.12) 55%, rgba(255,255,255,0));
}
@media (max-width: 768px) {
  .orb-apricot { width: 380px; height: 380px; left: -150px }
  .orb-honey { width: 440px; height: 440px; right: -200px }
  .orb-lamp { width: 520px; height: 420px }
}
@keyframes orb-a { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(140px, 90px) } }
@keyframes orb-b { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(-160px, -120px) } }
@media (prefers-reduced-motion: reduce) { .orb-apricot, .orb-honey { animation: none } }
</style>
