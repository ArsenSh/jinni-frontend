<template>
  <div class="desert-sky" ref="desertSky">
    <div class="sky-base"></div>
    <div class="cloud-layer layer-top"></div>
    <div class="cloud-layer layer-mid"></div>
    <div class="cloud-layer layer-bottom"></div>
    <div class="shimmer-zone zone-left"></div>
    <div class="shimmer-zone zone-right"></div>
    <div class="atmosphere-overlay"></div>
  </div>
</template>




<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'
export default {
  setup() {
    const desertSky = ref(null)
    let ro = null
    onMounted(() => {
      ro = new ResizeObserver(() => {if (desertSky.value) {desertSky.value.style.height = `${document.documentElement.scrollHeight}px`}})
      ro.observe(document.documentElement)
    })
    onBeforeUnmount(() => {if (ro) ro.disconnect()})
    return { desertSky }
  }
}
</script>




<style scoped>
.desert-sky {position: absolute;top: 0;left: 0;width: 100%;z-index: -1;overflow: hidden;pointer-events: none;isolation: isolate}
/* ── Base sky ───────────────────────────────────────────────────────────────── */
/* Static gradient — zero per-frame cost */
.sky-base {position: absolute;inset: 0;background: linear-gradient(to bottom,#f9f5eb 0%,#f2e3d3 8%,#ecd6c2 16%,#e9ccb3 24%,#ebc4a6 32%,#efbc9b 40%,#f3b692 48%,#f7be98 56%,#f9c8a0 64%,#f5c099 72%,#f0b893 80%,#ebb08d 88%,#e6a888 96%,#e0a082 100%)}
/* ── Cloud layers ───────────────────────────────────────────────────────────── */
/*
  KEY CHANGE: No filter:blur() and no mix-blend-mode on animated elements.
  Softness comes from the gradients themselves (large ellipses, low opacity).
  Only `opacity` is animated — the browser compositor handles this entirely
  on the GPU with zero repaint, so no thermal pressure.
  animation-direction: alternate fixes the snap-back bug (0→1.5→0 was missing).
*/
.cloud-layer {position: absolute;left: 0;width: 100%;pointer-events: none;animation-timing-function: ease-in-out;animation-iteration-count: infinite;animation-direction: alternate}
.layer-top {top: 8%;height: 28%;background:radial-gradient(ellipse 900px 240px at 25% 50%, rgba(233, 169, 131, 0.22) 0%, transparent 70%),radial-gradient(ellipse 800px 220px at 72% 50%, rgba(237, 175, 137, 0.20) 0%, transparent 68%);opacity: 0.7;animation-name: breathe-a;animation-duration: 90s}
.layer-mid {top: 32%;height: 32%;background:radial-gradient(ellipse 1000px 280px at 35% 50%, rgba(238, 156, 115, 0.26) 0%, transparent 72%),radial-gradient(ellipse 850px 250px at 76% 50%, rgba(242, 165, 122, 0.24) 0%, transparent 70%);opacity: 0.65;animation-name: breathe-b;animation-duration: 110s}
.layer-bottom {top: 60%;height: 30%;background:radial-gradient(ellipse 1100px 320px at 30% 50%, rgba(227, 144, 98, 0.28) 0%, transparent 75%),radial-gradient(ellipse 950px 280px at 68% 50%, rgba(234, 152, 106, 0.26) 0%, transparent 73%);opacity: 0.68;animation-name: breathe-a;animation-duration: 100s}
/* Gentle opacity breathe — compositor-only, no repaint */
@keyframes breathe-a {
  from { opacity: 0.55; }
  to   { opacity: 0.75; }
}
@keyframes breathe-b {
  from { opacity: 0.50; }
  to   { opacity: 0.70; }
}
/* ── Light shimmer zones ────────────────────────────────────────────────────── */
/*
  Non-overlapping: left zone ends at 50%, right zone starts at 52%.
  No mix-blend-mode: screen (was causing compositor bypass).
  Opacity-only animation.
*/
.shimmer-zone {position: absolute;top: 30%;height: 35%;pointer-events: none;animation-timing-function: ease-in-out;animation-iteration-count: infinite;animation-direction: alternate}
.zone-left {left: 5%;width: 45%;background: radial-gradient(ellipse at center,rgba(255, 220, 170, 0.18) 0%,rgba(248, 208, 158, 0.08) 55%,transparent 100%);opacity: 0.35;animation-name: shimmer-a;animation-duration: 60s}
.zone-right {right: 5%;width: 45%;background: radial-gradient(ellipse at center,rgba(250, 215, 165, 0.20) 0%,rgba(242, 205, 155, 0.10) 55%,transparent 100%);opacity: 0.30;animation-name: shimmer-b;animation-duration: 75s}
@keyframes shimmer-a {
  from { opacity: 0.25; }
  to   { opacity: 0.45; }
}
@keyframes shimmer-b {
  from { opacity: 0.20; }
  to   { opacity: 0.38; }
}
/* ── Atmosphere overlay ─────────────────────────────────────────────────────── */
/*
  Static — no animation, no blend mode, no blur.
  Just adds gentle depth variation across the canvas.
*/
.atmosphere-overlay {position: absolute;inset: 0;background: radial-gradient(ellipse 900px 450px at 20% 30%, rgba(242, 180, 140, 0.10) 0%, transparent 65%), radial-gradient(ellipse 850px 400px at 75% 55%, rgba(235, 165, 125, 0.12) 0%, transparent 68%), radial-gradient(ellipse 950px 480px at 45% 75%, rgba(228, 155, 110, 0.14) 0%, transparent 70%);opacity: 0.5;pointer-events: none}
/* ── Reduced motion ─────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {.cloud-layer, .shimmer-zone {animation: none}}
/* ── High contrast ──────────────────────────────────────────────────────────── */
@media (prefers-contrast: high) {.desert-sky {display: none}}
</style>