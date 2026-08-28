<template>
  <div class="lamp-container" :class="{ 'lamp-collapsing': isCollapsing }">
    <!-- Two stacked bottles: the natural gold underneath, a hue-shifted clone
         above at 50% opacity — the cycle color washes OVER the original
         instead of replacing it. The wrap (not the imgs) carries visibility,
         the RTL flip and the WAAPI tremble, and rides ABOVE the smoke
         (z 12 > 11): the old smoke-over-bottle order buried the lamp once
         births were centered on the spout. -->
    <div class="bottle-wrap" ref="bottleWrapEl"
         :class="{ 'vanishing': isVanishing, 'rtl-flip': isRtl }"
         :style="{ opacity: bottleOpacity }">
      <img src="/images/bottle.png?v=2" alt="Genie Bottle" class="genie-bottle" :style="baseGlowStyle">
      <img src="/images/bottle.png?v=2" alt="" class="genie-bottle bottle-tint" aria-hidden="true" :style="tintStyle">
    </div>
    <!-- The serpent's bends live as CSS vars on the container; every particle
         inherits them. One shared channel per awakening, a new channel each
         awakening (drawNewSerpent). -->
    <div class="smoke-container" :class="{ 'rtl-flip': isRtl }" :style="serpent">
      <div v-for="smoke in smokeParticles" :key="smoke.id" class="smoke-particle" :style="smoke.style"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { isNightTime } from '@/utils/timeUtils';

/* ═══════════════════════════ I_Loved3 ═══════════════════════════════════
 * Lab-designed with Arsen (2026-08-14) from his two pencil sketches
 * (HowIWant.png, HowIWant2.png); reference build + parameter sheets live in
 * ~/Desktop/LampLab/approved/. Versus the previous animation:
 *   • smoke rises through ONE serpentine channel that redraws itself on
 *     every start (CSS vars --b0..--b5), inside a ±14px-thick column;
 *   • particles are DUST, not bubbles: born as vertical streaks on the spout
 *     tip (center-anchored — the old left:70% edge anchor wandered up to
 *     60px off-lamp with the random size), heavily blurred, irregular
 *     silhouettes, soft elliptical gradients;
 *   • colors LERP continuously across the 6s cycle (stepped colors outlined
 *     each new generation against the old — the "visible bubbles" bug);
 *   • the bottle trembles awake (WAAPI rattle → calm sway) and its body is
 *     tinted 50% by the live cycle color;
 *   • ~3x cheaper than before (measured 17fps → ~50fps): fewer, smaller,
 *     shadowless particles.
 * The keyframes sit in the UNSCOPED style block below under a lamp-only
 * name: scoped @keyframes get renamed by Vue while inline `animation:` does
 * not — which is exactly how this component's previous fancy keyframes
 * turned out to be dead code shadowed by animations.css `smoke-rise`.
 * Do NOT rename them back to `smoke-rise`. */
export default {
  props: {
    isLoading: { type: Boolean, default: true },
    theme: { type: String, default: null },
    autoStart: { type: Boolean, default: false }
  },
  setup(props) {
    const smokeParticles = ref([])
    // Mirror the bottle + smoke in RTL (Arabic) so it streams the other way.
    const isRtl = ref(false)
    const refreshRtl = () => {
      isRtl.value = (typeof document !== 'undefined') &&
        document.documentElement.getAttribute('dir') === 'rtl'
    }
    const isCollapsing = ref(false)
    const bottleOpacity = ref(0.1)
    const isVanishing = ref(false)
    const bottleWrapEl = ref(null)
    const serpent = ref({})
    let interval = null
    let collapseTimer = null
    let glowStartTimer = null
    let fadeInTimer = null
    let particleSeq = 0

    const isNight = computed(() => {
      if (props.theme === 'light') return false;
      if (props.theme === 'dark') return true;
      return isNightTime();
    });

    /* light-amber is deliberately absent from the DAY palette (it read as
       near-white dust); night keeps all four blues. */
    const dayTypes = ['deep-amber', 'golden', 'mystic-amber'];
    const nightTypes = ['light-blue', 'deep-blue', 'purple-blue', 'mystic-blue'];
    const glowColors = {
      'deep-amber':   'rgba(255, 183, 77, 0.9)',
      'golden':       'rgba(217, 119, 6, 0.9)',
      'mystic-amber': 'rgba(201, 162, 39, 0.9)',
      'light-blue':   'rgba(180, 235, 255, 0.9)',
      'deep-blue':    'rgba(90, 150, 255, 0.9)',
      'purple-blue':  'rgba(180, 140, 255, 0.9)',
      'mystic-blue':  'rgba(120, 110, 255, 0.9)',
    }
    const paletteRGB = {
      'deep-amber': [255, 183, 77], 'golden': [217, 119, 6], 'mystic-amber': [201, 162, 39],
      'light-blue': [180, 235, 255], 'deep-blue': [90, 150, 255], 'purple-blue': [180, 140, 255], 'mystic-blue': [120, 110, 255]
    }
    // Hue-rotations that carry the bottle's gold into each cycle color; the
    // clone sits at 50% opacity so the original always shows through.
    const tintRecipes = {
      'deep-amber':   'saturate(1.05)',
      'golden':       'hue-rotate(-6deg) saturate(1.2) brightness(0.96)',
      'mystic-amber': 'hue-rotate(10deg) saturate(0.95) brightness(0.92)',
      'light-blue':   'hue-rotate(165deg) saturate(0.85) brightness(1.15)',
      'deep-blue':    'hue-rotate(185deg) saturate(1.35) brightness(0.95)',
      'purple-blue':  'hue-rotate(225deg) saturate(1.05) brightness(1.05)',
      'mystic-blue':  'hue-rotate(210deg) saturate(1.25) brightness(0.95)'
    }

    // Sequential color index shared by glow, tint and smoke; cycleAt lets
    // each particle LERP between this color and the next by cycle progress.
    let colorIndex = 0
    let glowCycleInterval = null
    let cycleAt = 0
    const bottleGlowColor = ref(null)
    const currentType = ref(null)
    const baseGlowStyle = computed(() => bottleGlowColor.value
      ? { filter: `drop-shadow(0 0 2px ${bottleGlowColor.value}) drop-shadow(0 0 4px ${bottleGlowColor.value})` }
      : {})
    const tintStyle = computed(() => currentType.value
      ? { filter: tintRecipes[currentType.value], opacity: 0.5 }
      : { opacity: 0 })
    const startGlowCycle = () => {
      if (glowCycleInterval) return
      const apply = () => {
        const types = isNight.value ? nightTypes : dayTypes
        currentType.value = types[colorIndex % types.length]
        bottleGlowColor.value = glowColors[currentType.value]
      }
      colorIndex = 0; cycleAt = Date.now(); apply()
      glowCycleInterval = setInterval(() => {
        const types = isNight.value ? nightTypes : dayTypes
        colorIndex = (colorIndex + 1) % types.length   // palette LENGTH, not 4
        cycleAt = Date.now(); apply()
      }, 6000)
    }
    const stopGlowCycle = () => {
      if (glowCycleInterval) { clearInterval(glowCycleInterval); glowCycleInterval = null }
      bottleGlowColor.value = null
      currentType.value = null
    }

    /* A fresh serpent on every awakening: random first direction, bends that
       usually alternate sides but kink 25% of the time, per-snake intensity
       0.5–1.5x. Skipped when smoke from the previous run is still airborne —
       re-routing live particles would teleport them sideways. */
    const drawNewSerpent = () => {
      if (smokeParticles.value.length) return
      const bends = {}
      const master = 0.5 + Math.random()
      let sign = Math.random() < 0.5 ? 1 : -1
      const ranges = [[1, 6], [4, 24], [6, 34], [8, 44], [10, 46], [2, 16]]
      ranges.forEach((r, i) => {
        if (i > 0 && Math.random() >= 0.25) sign = -sign
        bends[`--b${i}`] = `${(sign * (r[0] + Math.random() * (r[1] - r[0])) * master).toFixed(1)}px`
      })
      serpent.value = bends
    }

    const createSmokeParticle = () => {
      const types = isNight.value ? nightTypes : dayTypes;
      // Seamless color: lerp between the current cycle color and the next by
      // how far the 6s cycle has run — no generation boundaries.
      const p = cycleAt ? Math.min(1, (Date.now() - cycleAt) / 6000) : 0
      const c1 = paletteRGB[types[colorIndex % types.length]]
      const c2 = paletteRGB[types[(colorIndex + 1) % types.length]]
      const L = i => Math.round(c1[i] + (c2[i] - c1[i]) * p)
      const rgb = `${L(0)},${L(1)},${L(2)}`
      const size = Math.random() * 50 + 35
      const blur = Math.random() * 6 + 6
      const squash = Math.random() * 0.55 + 0.75
      const br = `${55 + Math.random() * 35 | 0}% ${35 + Math.random() * 40 | 0}% ${55 + Math.random() * 35 | 0}% ${25 + Math.random() * 45 | 0}%`
      const duration = Math.random() * 3.5 + 2.5
      const delay = Math.random() * 0.5
      // Birth CENTERED on the spout tip (x=90, 46% up), ±4px jitter; --dx is
      // the particle's small thickness offset inside the shared channel.
      const jitter = Math.random() * 8 - 4
      const dx = ((Math.random() * 2 - 1) * 14).toFixed(1)
      const particle = {
        id: `p${++particleSeq}`,
        style: {
          '--dx': `${dx}px`,
          width: `${size}px`,
          height: `${(size * squash).toFixed(0)}px`,
          borderRadius: br,
          left: `${(90 + jitter - size / 2).toFixed(1)}px`,
          bottom: '46%',
          background: `radial-gradient(ellipse 60% 75% at 50% 55%, rgba(${rgb},0.55) 0%, rgba(${rgb},0.32) 45%, rgba(${rgb},0.12) 68%, transparent 100%)`,
          filter: `blur(${blur.toFixed(1)}px)`,
          animation: `lamp-smoke-rise ${duration}s ease-in-out ${delay}s 1`
        }
      }
      smokeParticles.value.push(particle)
      setTimeout(() => {
        smokeParticles.value = smokeParticles.value.filter(x => x.id !== particle.id)
      }, (duration + delay) * 1000)
    }

    /* ── Tremble (Web Animations API) ────────────────────────────────────
     * CSS cannot ramp an animation's speed; WAAPI's playbackRate can. The
     * arc: wake at 0.15x, accelerate to the full 130ms genie rattle over 1s,
     * hold the drama 1.5s, then settle to a 0.1x sway (~1.3s/swing) for the
     * long stream; on stop, wind down and still. composite:'add' keeps the
     * RTL scaleX(-1) flip intact underneath the rotation. */
    let trembleAnim = null, trembleRAF = null, trembleCalmTimer = null
    const rampPlayback = (target, ms, done) => {
      cancelAnimationFrame(trembleRAF)
      if (!trembleAnim) return
      const from = trembleAnim.playbackRate, t0 = performance.now()
      const step = (now) => {
        if (!trembleAnim) return
        const k = Math.min(1, (now - t0) / ms)
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
        trembleAnim.updatePlaybackRate(from + (target - from) * e)
        if (k < 1) trembleRAF = requestAnimationFrame(step)
        else if (done) done()
      }
      trembleRAF = requestAnimationFrame(step)
    }
    const startTremble = () => {
      const el = bottleWrapEl.value
      if (!el || typeof el.animate !== 'function') return
      if (trembleAnim) trembleAnim.cancel()
      clearTimeout(trembleCalmTimer)
      trembleAnim = el.animate(
        [{ transform: 'rotate(2.6deg)' }, { transform: 'rotate(-2.6deg)' }, { transform: 'rotate(2.6deg)' }],
        { duration: 130, iterations: Infinity, easing: 'ease-in-out', composite: 'add' })
      trembleAnim.playbackRate = 0.15
      rampPlayback(1, 1000, () => {
        trembleCalmTimer = setTimeout(() => rampPlayback(0.1, 2400), 1500)
      })
    }
    const stopTremble = () => {
      clearTimeout(trembleCalmTimer)
      rampPlayback(0.08, 900, () => { if (trembleAnim) { trembleAnim.cancel(); trembleAnim = null } })
    }

    const startAnimation = () => {
      if (interval) return
      refreshRtl()
      colorIndex = 0
      isVanishing.value = false
      bottleOpacity.value = 0.1
      drawNewSerpent()
      // Fade bottle 0.1 → 1 over 1s, then smoke + tremble, then glow
      fadeInTimer = setTimeout(() => {
        bottleOpacity.value = 1
        fadeInTimer = null
        startTremble()
        interval = setInterval(createSmokeParticle, 50)
        glowStartTimer = setTimeout(() => {
          startGlowCycle()
          glowStartTimer = null
        }, 1000)
      }, 50)
    }
    const stopAnimation = () => {
      if (fadeInTimer) { clearTimeout(fadeInTimer); fadeInTimer = null }
      if (glowStartTimer) { clearTimeout(glowStartTimer); glowStartTimer = null }
      stopGlowCycle()
      stopTremble()
      if (interval) { clearInterval(interval); interval = null }
      /* Fade bottle out over 0.5s. Generation stops in the same frame;
         airborne dust finishes its own rise (each particle removes itself)
         and the container collapse below dissolves the last of it. */
      isVanishing.value = true
      bottleOpacity.value = 0
    }
    watch(() => props.isLoading, (newValue) => {
      if (newValue) {
        clearTimeout(collapseTimer)
        collapseTimer = null
        if (fadeInTimer) { clearTimeout(fadeInTimer); fadeInTimer = null }
        if (glowStartTimer) { clearTimeout(glowStartTimer); glowStartTimer = null }
        isCollapsing.value = false
        startAnimation()
      } else {
        stopAnimation()
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => {
          isCollapsing.value = true
          collapseTimer = null
        }, 1500)  // 1.5 seconds - optimized for view-more scenario
      }
    }, { immediate: true })
    onMounted(() => { refreshRtl(); if (!props.isLoading && props.autoStart) { startAnimation() } })
    onUnmounted(() => {
      if (interval) { clearInterval(interval); interval = null }
      if (glowCycleInterval) { clearInterval(glowCycleInterval); glowCycleInterval = null }
      if (fadeInTimer) { clearTimeout(fadeInTimer); fadeInTimer = null }
      if (collapseTimer) { clearTimeout(collapseTimer); collapseTimer = null }
      if (glowStartTimer) { clearTimeout(glowStartTimer); glowStartTimer = null }
      clearTimeout(trembleCalmTimer)
      cancelAnimationFrame(trembleRAF)
      if (trembleAnim) { trembleAnim.cancel(); trembleAnim = null }
      smokeParticles.value = []
    })
    return { smokeParticles, isCollapsing, baseGlowStyle, tintStyle, bottleOpacity, isVanishing, isRtl, bottleWrapEl, serpent }
  }
}
</script>

<!-- UNSCOPED on purpose: inline `animation:` names are not rewritten by Vue's
     scoped transform, so scoped keyframes here would be dead code (as this
     component's previous ones were, silently shadowed by animations.css
     smoke-rise). Lamp-only name; do not reuse `smoke-rise`. -->
<style>
@keyframes lamp-smoke-rise {
  0%   { transform: translateY(0)      translateX(calc(var(--b0, 0px) + var(--dx, 0px) * 0.2)) scale(0.22, 0.65); opacity: 0.75; }
  18%  { transform: translateY(-42px)  translateX(calc(var(--b1, 0px) + var(--dx, 0px) * 0.4)) scale(0.45, 0.7);  opacity: 0.72; }
  38%  { transform: translateY(-88px)  translateX(calc(var(--b2, 0px) + var(--dx, 0px) * 0.6)) scale(0.68, 0.78); opacity: 0.7; }
  58%  { transform: translateY(-135px) translateX(calc(var(--b3, 0px) + var(--dx, 0px) * 0.8)) scale(0.9);        opacity: 0.68; }
  78%  { transform: translateY(-181px) translateX(calc(var(--b4, 0px) + var(--dx, 0px)))       scale(1.1);        opacity: 0.5; }
  100% { transform: translateY(-232px) translateX(calc(var(--b5, 0px) + var(--dx, 0px)))       scale(1.3);        opacity: 0; }
}
</style>

<style scoped>
.lamp-container {position: relative; width: 100px; height: 100px; display: flex; justify-content: center; align-items: center; overflow: visible; transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1), margin 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out, transform 1.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center center}
.lamp-container.lamp-collapsing {height: 0; margin: 0; opacity: 0; transform: scale(0.8); pointer-events: none}
/* The wrap carries visibility, the tremble and the RTL flip; z 12 > the
   smoke's 11 so the lamp rides ABOVE its own cloud. */
.bottle-wrap { position: relative; z-index: 12; width: 90px; transition: opacity 1s ease-in; transform-origin: 50% 92%; }
.bottle-wrap.vanishing { transition: opacity 0.5s ease-out; }
.bottle-wrap.rtl-flip { transform: scaleX(-1); }
.genie-bottle {width: 90px; height: auto; max-height: 90px; object-fit: contain; display: block; transition: filter 1.8s ease-in-out}
.bottle-tint { position: absolute; inset: 0; transition: opacity 1.8s ease-in-out, filter 1.8s ease-in-out; }
.smoke-container {position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 11}
.smoke-container.rtl-flip {transform: scaleX(-1)}
/* Silhouette (border-radius), gradient, blur and animation are all inline —
   randomized per particle. Origin center-center: dust puffs out equally in
   every direction at whatever height it has reached. */
.smoke-particle {position: absolute; will-change: transform, opacity; transform-origin: center center; opacity: 0}
</style>
