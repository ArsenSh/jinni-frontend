<template>
  <div class="lamp-container" :class="{ 'lamp-collapsing': isCollapsing }">
    <img
        src="/images/bottle.png"
        alt="Genie Bottle"
        class="genie-bottle"
        :class="{ 'vanishing': isVanishing, 'rtl-flip': isRtl }"
        :style="{
          opacity: bottleOpacity,
          ...((isLoading || smokeParticles.length > 0) && currentGlowColor ? { filter: `drop-shadow(0 0 3px ${currentGlowColor}) drop-shadow(0 0 6px ${currentGlowColor})` } : {})
        }"
    >
    <div class="smoke-container" :class="{ 'rtl-flip': isRtl }">
      <div
          v-for="(smoke, index) in smokeParticles"
          :key="index"
          class="smoke-particle"
          :class="[smoke.type]"
          :style="{
            width: smoke.size + 'px',
            height: smoke.size + 'px',
            left: smoke.left + '%',
            bottom: smoke.bottom + '%',
            filter: `blur(${smoke.blur}px) drop-shadow(0 0 5px ${smoke.glowColor})`,
            animation: `smoke-rise ${smoke.duration}s linear ${smoke.delay}s 1`,
            opacity: 0
          }"
      ></div>
    </div>
  </div>
</template>



<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { isNightTime } from '@/utils/timeUtils';
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
    let interval = null
    let collapseTimer = null
    let clearParticlesTimer = null
    let glowStartTimer = null
    let fadeInTimer = null
    let fadeOutTimer = null
    const isNight = computed(() => {
      if (props.theme === 'light') return false;
      if (props.theme === 'dark') return true;
      return isNightTime();
    });
    const bottleGlowColor = ref(null)
    const currentGlowColor = computed(() => bottleGlowColor.value)
    const glowColors = {
      'light-amber':  'rgba(243, 231, 201, 0.9)',
      'deep-amber':   'rgba(255, 183, 77, 0.9)',
      'golden':       'rgba(217, 119, 6, 0.9)',
      'mystic-amber': 'rgba(201, 162, 39, 0.9)',
      'light-blue':   'rgba(180, 235, 255, 0.9)',
      'deep-blue':    'rgba(90, 150, 255, 0.9)',
      'purple-blue':  'rgba(180, 140, 255, 0.9)',
      'mystic-blue':  'rgba(120, 110, 255, 0.9)',
    }
    const dayTypes = ['light-amber', 'deep-amber', 'golden', 'mystic-amber'];
    const nightTypes = ['light-blue', 'deep-blue', 'purple-blue', 'mystic-blue'];
    // Sequential color index shared by both glow cycle and smoke particles
    let colorIndex = 0
    let glowCycleInterval = null
    const startGlowCycle = () => {
      if (glowCycleInterval) return
      const types = isNight.value ? nightTypes : dayTypes
      colorIndex = 0
      bottleGlowColor.value = glowColors[types[colorIndex]]
      glowCycleInterval = setInterval(() => {
        const currentTypes = isNight.value ? nightTypes : dayTypes
        colorIndex = (colorIndex + 1) % currentTypes.length
        bottleGlowColor.value = glowColors[currentTypes[colorIndex]]
      }, 6000)
    }
    const stopGlowCycle = () => {
      if (glowCycleInterval) {
        clearInterval(glowCycleInterval)
        glowCycleInterval = null
      }
      bottleGlowColor.value = null
    }
    const createSmokeParticle = () => {
      const types = isNight.value ? nightTypes : dayTypes;
      // Use the current sequential colorIndex instead of random
      const type = types[colorIndex % types.length];
      const particle = {
        id: Date.now() + Math.random(),
        type,
        glowColor: glowColors[type],
        size: Math.random() * 100 + 30,
        left: 70,
        bottom: 45,
        opacity: Math.random() * 0.7 + 0.3,
        blur: Math.random() * 8 + 2,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 0.5
      }
      smokeParticles.value.push(particle)
      setTimeout(() => {
        smokeParticles.value = smokeParticles.value.filter(p => p.id !== particle.id)
      }, (particle.duration + particle.delay) * 1000)
    }
    const startAnimation = () => {
      if (interval) return
      refreshRtl()
      colorIndex = 0
      isVanishing.value = false
      bottleOpacity.value = 0.1
      // Fade bottle 0.1 → 1 over 1s, then smoke, then glow
      fadeInTimer = setTimeout(() => {
        bottleOpacity.value = 1
        fadeInTimer = null
        interval = setInterval(createSmokeParticle, 100)
        glowStartTimer = setTimeout(() => {
          startGlowCycle()
          glowStartTimer = null
        }, 1000)
      }, 50)
    }
    const stopAnimation = () => {
      if (fadeInTimer) {
        clearTimeout(fadeInTimer)
        fadeInTimer = null
      }
      if (glowStartTimer) {
        clearTimeout(glowStartTimer)
        glowStartTimer = null
      }
      stopGlowCycle()
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      /* Fade bottle out over 0.5s. Generation stopped above, in the same
       * frame — that IS the "lamp and smoke stop together" rule.
       *
       * What was here before broke it twice over. `isAccelerating` re-timed
       * every running animation to 2s; the particles were `infinite`, so any
       * particle older than 2s wrapped to a NEW cycle and replayed from the
       * spout — fresh-looking smoke pouring from a lamp already gone. Then a
       * 2500ms timer wiped all particles mid-air in one frame. Lamp gone at
       * ~500ms, wipe at 2500ms: the exact 2-second gap Arsen measured.
       *
       * Now: nothing is re-timed, nothing is wiped. Each particle finishes
       * its own rise (already fading along the keyframes) and its own removal
       * timer cleans it up; the container collapse at 1.5s dissolves whatever
       * still lingers, gently, while it rises. */
      isVanishing.value = true
      bottleOpacity.value = 0
    }
    watch(() => props.isLoading, (newValue) => {
      if (newValue) {
        clearTimeout(collapseTimer)
        clearTimeout(clearParticlesTimer)
        if (fadeInTimer) {
          clearTimeout(fadeInTimer)
          fadeInTimer = null
        }
        if (glowStartTimer) {
          clearTimeout(glowStartTimer)
          glowStartTimer = null
        }
        clearParticlesTimer = null
        collapseTimer = null
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
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      if (glowCycleInterval) {
        clearInterval(glowCycleInterval)
        glowCycleInterval = null
      }
      if (fadeInTimer) {
        clearTimeout(fadeInTimer)
        fadeInTimer = null
      }
      if (fadeOutTimer) {
        clearTimeout(fadeOutTimer)
        fadeOutTimer = null
      }
      if (collapseTimer) {
        clearTimeout(collapseTimer)
        collapseTimer = null
      }
      if (glowStartTimer) {
        clearTimeout(glowStartTimer)
        glowStartTimer = null
      }
      if (clearParticlesTimer) {
        clearTimeout(clearParticlesTimer)
        clearParticlesTimer = null
      }
      smokeParticles.value = []
    })
    return {smokeParticles, isCollapsing, currentGlowColor, bottleOpacity, isVanishing, isRtl}
  }
}
</script>



<style scoped>
.lamp-container {position: relative; width: 100px; height: 100px; display: flex; justify-content: center; align-items: center; overflow: visible; transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1), margin 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out, transform 1.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center center}
.lamp-container.lamp-collapsing {height: 0; margin: 0; opacity: 0; transform: scale(0.8); pointer-events: none}
.genie-bottle {width: 90px; height: auto; max-height: 90px; object-fit: contain; z-index: 10; transition: opacity 1s ease-in, filter 1.8s ease-in-out}
.genie-bottle.vanishing {transition: opacity 0.5s ease-out, filter 0.5s ease-out}
.smoke-container {position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 11}
/* RTL (Arabic): mirror the bottle and the smoke column horizontally. Applied to
   these two elements rather than .lamp-container so it never clashes with the
   container's collapse transform. */
.genie-bottle.rtl-flip,.smoke-container.rtl-flip {transform: scaleX(-1)}
.smoke-particle {position: absolute; border-radius: 60% 40% 80% 20%; will-change: transform, opacity; transform-origin: center bottom}
.smoke-particle.light-amber {background: radial-gradient(circle, rgba(243, 231, 201, 0.6) 0%, rgba(230, 192, 103, 0.35) 45%, rgba(217, 151, 6, 0.15) 75%, transparent 100%)}
.smoke-particle.deep-amber {background: radial-gradient(circle, rgba(230, 192, 103, 0.85) 0%, rgba(255, 183, 77, 0.55) 50%, rgba(201, 162, 39, 0.25) 80%, transparent 100%)}
.smoke-particle.golden {background: radial-gradient(circle, rgba(255, 183, 77, 0.75) 0%, rgba(217, 119, 6, 0.45) 55%, rgba(153, 101, 21, 0.2) 80%, transparent 100%)}
.smoke-particle.mystic-amber {background: radial-gradient(circle, rgba(201, 162, 39, 0.8) 0%, rgba(184, 134, 11, 0.5) 55%, rgba(153, 101, 21, 0.25) 80%, transparent 100%)}
.smoke-particle.light-blue {background: radial-gradient(circle, rgba(180, 235, 255, 0.85) 0%, rgba(120, 190, 240, 0.55) 50%, rgba(80, 140, 200, 0.25) 80%, transparent 100%)}
.smoke-particle.deep-blue {background: radial-gradient(circle, rgba(90, 150, 255, 0.9) 0%, rgba(60, 100, 220, 0.6) 50%, rgba(40, 60, 160, 0.3) 80%, transparent 100%)}
.smoke-particle.purple-blue {background: radial-gradient(circle, rgba(180, 140, 255, 0.8) 0%, rgba(130, 90, 210, 0.55) 50%, rgba(90, 60, 150, 0.3) 80%, transparent 100%)}
.smoke-particle.mystic-blue {background: radial-gradient(circle, rgba(120, 110, 255, 0.75) 0%, rgba(80, 70, 200, 0.5) 50%, rgba(50, 40, 130, 0.25) 80%, transparent 100%)}
@keyframes smoke-rise {
  0%   { transform: scale(0.6)  rotate(0deg)   translateX(0px)   translateY(0%);    opacity: 0.9 }
  5%   { transform: scale(0.7)  rotate(10deg)  translateX(1px)   translateY(-25%);  opacity: 0.85 }
  10%  { transform: scale(0.75) rotate(25deg)  translateX(-2px)  translateY(-55%);  opacity: 0.8 }
  20%  { transform: scale(0.8)  rotate(50deg)  translateX(3px)   translateY(-115%); opacity: 0.75 }
  30%  { transform: scale(0.85) rotate(80deg)  translateX(-4px)  translateY(-210%); opacity: 0.7 }
  40%  { transform: scale(0.9)  rotate(120deg) translateX(5px)   translateY(-360%); opacity: 0.65 }
  50%  { transform: scale(0.95) rotate(160deg) translateX(-6px)  translateY(-560%); opacity: 0.6 }
  60%  { transform: scale(1.0)  rotate(200deg) translateX(7px)   translateY(-800%); opacity: 0.55 }
  70%  { transform: scale(1.05) rotate(240deg) translateX(-8px)  translateY(-910%); opacity: 0.5 }
  80%  { transform: scale(1.0)  rotate(280deg) translateX(9px)   translateY(-910%); opacity: 0.4 }
  90%  { transform: scale(1.05) rotate(320deg) translateX(-10px) translateY(-910%); opacity: 0.3 }
  100% { transform: scale(1.0)  rotate(360deg) translateX(0px)   translateY(-910%); opacity: 0.2 }
}
</style>