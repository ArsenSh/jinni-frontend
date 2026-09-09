<template>
  <div class="starry-sky" ref="starrySky"></div>
</template>



<script>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

/* Every tunable of the sky, with the values that shipped. SkyLab (dev only)
   overrides them live; production passes nothing and gets exactly these. */
export const SKY_DEFAULTS = {
  starCount: 2000,
  starSizeMin: 0.5, starSizeSpread: 1.2,
  starOpacityMin: 0.3, starOpacitySpread: 0.8,
  starHueMin: 210, starHueSpread: 30,
  starGlow: 4,
  twinkleChance: 0.05, twinkleMin: 10, twinkleSpread: 10,
  cometDelayMin: 4000, cometDelaySpread: 2000, cometChance: 0.7,
  cometDurMin: 1.5, cometDurSpread: 1.5,
  cometWidthMin: 1.5, cometWidthSpread: 1,
  cometLenMin: 150, cometLenSpread: 200,
  cometPurpleChance: 0.3,
  cometBlurMin: 0.5, cometBlurSpread: 0.5,
  cometGlow: 15, cometDistance: 3000,
}

export default {
  props: { config: { type: Object, default: () => ({}) } },
  setup(props) {
    const cfg = () => ({ ...SKY_DEFAULTS, ...(props.config || {}) })
    const starrySky = ref(null)
    let resizeObserver = null
    let resizeTimer = null
    let lastWidth = 0
    const createStars = () => {
      if (!starrySky.value) return
      while (starrySky.value.firstChild) {starrySky.value.removeChild(starrySky.value.firstChild)}
      const containerHeight = starrySky.value.offsetHeight
      const containerWidth = starrySky.value.offsetWidth
      const c = cfg()
      for (let i = 0; i < c.starCount; i++) {
        const star = document.createElement('div')
        star.classList.add('star')
        const x = Math.random() * containerWidth
        const y = Math.random() * containerHeight
        const size = Math.random() * c.starSizeSpread + c.starSizeMin
        const opacity = Math.random() * c.starOpacitySpread + c.starOpacityMin
        const blueHue = c.starHueMin + Math.random() * c.starHueSpread
        const saturation = 80 + Math.random() * 20
        const lightness = 80 + Math.random() * 20
        star.style.position = 'absolute'
        star.style.left = `${x}px`
        star.style.top = `${y}px`
        star.style.width = `${size}px`
        star.style.height = `${size}px`
        star.style.opacity = String(opacity)
        star.style.backgroundColor = `hsl(${blueHue}, ${saturation}%, ${lightness}%)`
        star.style.boxShadow = `0 0 ${size * c.starGlow}px hsla(${blueHue}, ${saturation}%, ${lightness}%, 0.8)`
        starrySky.value.appendChild(star)
        if (Math.random() < c.twinkleChance) {star.style.animation = `gentle-twinkle ${Math.random() * c.twinkleSpread + c.twinkleMin}s infinite`}
      }
    }
    const updateContainerHeight = () => {
      if (!starrySky.value) return
      starrySky.value.style.height = `${document.documentElement.scrollHeight}px`
    }
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        updateContainerHeight()
        // Only rebuild the starfield when the WIDTH actually changes (a genuine
        // layout / orientation change). Height-only changes — the mobile address
        // bar collapsing/expanding on scroll, or 100dvh reflow — must NOT trigger
        // createStars(), or every star gets a new random position and the whole
        // field appears to "shuffle" as you scroll.
        const width = starrySky.value ? starrySky.value.offsetWidth : 0
        if (Math.abs(width - lastWidth) > 1) {
          lastWidth = width
          createStars()
        }
        resizeTimer = null
      }, 150)
    }
    const createShootingStar = () => {
      if (!starrySky.value) return
      const shootingStar = document.createElement('div')
      shootingStar.classList.add('shooting-star')
      const c = cfg()
      const startX = Math.random() * 100
      const angle = Math.random() * 360
      const duration = c.cometDurMin + Math.random() * c.cometDurSpread
      const width = c.cometWidthMin + Math.random() * c.cometWidthSpread
      const height = c.cometLenMin + Math.random() * c.cometLenSpread
      const blueHue = Math.random() < c.cometPurpleChance ? 290 : c.starHueMin + Math.random() * c.starHueSpread
      const distance = c.cometDistance
      const rad = angle * Math.PI / 180
      const endX = startX + Math.cos(rad) * distance / window.innerWidth * 100
      const endY = Math.sin(rad) * distance / window.innerHeight * 100
      shootingStar.style.position = 'absolute'
      shootingStar.style.left = `${startX}%`
      shootingStar.style.top = '0'
      shootingStar.style.width = `${width}px`
      shootingStar.style.height = `${height}px`
      shootingStar.style.transform = `rotate(${angle}deg)`
      shootingStar.style.transformOrigin = 'left center'
      shootingStar.style.borderRadius = '50%'
      shootingStar.style.background = `linear-gradient(90deg,
        rgba(255, 255, 255, 1) 0%,
        hsla(${blueHue}, 100%, 95%, 0.9) 10%,
        hsla(${blueHue}, 100%, 85%, 0.7) 30%,
        hsla(${blueHue}, 100%, 75%, 0.4) 60%,
        hsla(${blueHue}, 100%, 70%, 0.1) 80%,
        transparent 100%)`
      shootingStar.style.boxShadow = `0 0 ${width * c.cometGlow}px hsla(${blueHue}, 100%, 85%, 0.8), 0 0 ${width * c.cometGlow * 2}px hsla(${blueHue}, 100%, 80%, 0.4)`
      shootingStar.style.filter = `blur(${Math.random() * c.cometBlurSpread + c.cometBlurMin}px) brightness(1.5)`
      shootingStar.style.willChange = 'transform, opacity'
      starrySky.value.appendChild(shootingStar)
      const keyframes = [
        { opacity: 0, transform: `rotate(${angle}deg) translate(0, 0) scale(0.1, 0.1)`, offset: 0 },
        { opacity: 0.2, transform: `rotate(${angle}deg) translate(0, 0) scale(0.3, 0.3)`, offset: 0.05 },
        { opacity: 1, transform: `rotate(${angle}deg) translate(${endX / 4}%, ${endY / 4}%) scale(1, 1)`, offset: 0.15 },
        { opacity: 0.8, transform: `rotate(${angle}deg) translate(${endX / 2}%, ${endY / 2}%) scale(1, 0.8)`, offset: 0.5 },
        { opacity: 0.4, transform: `rotate(${angle}deg) translate(${endX * 0.75}%, ${endY * 0.75}%) scale(0.8, 0.5)`, offset: 0.8 },
        { opacity: 0, transform: `rotate(${angle}deg) translate(${endX}%, ${endY}%) scale(0.3, 0.1)`, offset: 1 }
      ]
      const animation = shootingStar.animate(keyframes, {duration: duration * 1000, easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'})
      animation.onfinish = () => shootingStar.remove()
    }
    let shootingStarTimeout
    const scheduleShootingStar = () => {
      const c = cfg()
      const delay = Math.random() * c.cometDelaySpread + c.cometDelayMin
      shootingStarTimeout = setTimeout(() => {
        if (Math.random() < c.cometChance) createShootingStar()
        scheduleShootingStar()
      }, delay)
    }
    onMounted(() => {
      updateContainerHeight()
      createStars()
      lastWidth = starrySky.value ? starrySky.value.offsetWidth : 0
      scheduleShootingStar()
      resizeObserver = new ResizeObserver(() => {handleResize()})
      resizeObserver.observe(document.documentElement)
      window.addEventListener('resize', handleResize)
    })
    onBeforeUnmount(() => {
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      clearTimeout(shootingStarTimeout)
      if (resizeTimer) clearTimeout(resizeTimer)
    })
    watch(() => props.config, () => {
      createStars()
      clearTimeout(shootingStarTimeout)
      scheduleShootingStar()
    }, { deep: true })
    return { starrySky, createShootingStar, createStars }
  }
}
</script>



<style scoped>
.starry-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  /* Top fades from the night-mode chrome color (#0a0118 from App.vue) into the
     cosmic radial gradient below, so there's no seam with the browser chrome. */
  background:
    linear-gradient(to bottom,
      #0a0118 0px,
      rgba(10, 1, 24, 0) 300px
    ),
    radial-gradient(ellipse at center,
    #1a0933 0%,
    #0f0520 50%,
    #05020d 80%,
    #000000 100%
    );
}
.starry-sky::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 30%,
  rgba(123, 97, 255, 0.15) 0%,
  transparent 40%);
  pointer-events: none;
}
.star {
  position: absolute;
  border-radius: 50%;
}
.shooting-star {
  transition: opacity 0.3s ease-out;
  mask-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0.8) 30%,
      rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}
.shooting-star::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(6px);
  z-index: -1;
  opacity: 0.7;
}
@keyframes tail-flicker {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}
.shooting-star::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  filter: blur(8px);
  z-index: -1;
}
@keyframes gentle-twinkle {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.4);
  }
}
</style>