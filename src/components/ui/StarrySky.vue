<template>
  <div class="starry-sky" ref="starrySky"></div>
</template>



<script>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

/* Every tunable of the sky, with the values that shipped. SkyLab (dev only)
   overrides them live; production passes nothing and gets exactly these. */
export const SKY_DEFAULTS = {
  starCount: 4200,
  starSizeMin: 0.3, starSizeSpread: 0.9,
  starOpacityMin: 0.2, starOpacitySpread: 0.8,
  starHueMin: 210, starHueSpread: 30,
  starGlow: 2.5,
  /* A sub-pixel div cannot render a circle — the browser has no subpixels to
     round, so tiny stars came out square. Drawing each star as a radial
     gradient instead gives a soft round point at any size, and drops the
     box-shadow that 4000+ elements were each paying for. */
  starDot: 1, starHalo: 3,
  /* Real starfields are not white: most stars read blue-white, a minority burn
     gold, a few amber. The warm share also rhymes with the golden type. */
  starWarmChance: 0.22, starWarmHueMin: 34, starWarmHueSpread: 14,
  starEmberChance: 0.05, starEmberHueMin: 18, starEmberHueSpread: 10,
  twinkleChance: 0.12, twinkleMin: 10, twinkleSpread: 10,
  cometDelayMin: 3500, cometDelaySpread: 3500, cometChance: 0.8,
  cometDurMin: 1.0, cometDurSpread: 0.9,
  cometWidthMin: 1.6, cometWidthSpread: 1.4,
  cometLenMin: 160, cometLenSpread: 220,
  cometPurpleChance: 0.3,
  cometBlurMin: 0.3, cometBlurSpread: 0.5,
  /* cometDistance is a PERCENTAGE of the distance from the comet's start to
     the screen edge it is aimed at, so a comet crosses any screen the same. */
  cometGlow: 10, cometDistance: 100,
  cometAngleMin: 22, cometAngleSpread: 36,
  cometStartXMin: -10, cometStartXSpread: 60,
  cometStartYMin: 0, cometStartYSpread: 35,
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
        const roll = Math.random()
        let blueHue, saturation, lightness
        if (roll < c.starEmberChance) {
          blueHue = c.starEmberHueMin + Math.random() * c.starEmberHueSpread
          saturation = 85 + Math.random() * 15; lightness = 68 + Math.random() * 12
        } else if (roll < c.starEmberChance + c.starWarmChance) {
          blueHue = c.starWarmHueMin + Math.random() * c.starWarmHueSpread
          saturation = 85 + Math.random() * 15; lightness = 76 + Math.random() * 14
        } else {
          blueHue = c.starHueMin + Math.random() * c.starHueSpread
          saturation = 80 + Math.random() * 20; lightness = 80 + Math.random() * 20
        }
        star.style.position = 'absolute'
        star.style.left = `${x}px`
        star.style.top = `${y}px`
        const px = c.starDot ? size * c.starHalo : size
        star.style.width = `${px}px`
        star.style.height = `${px}px`
        star.style.opacity = String(opacity)
        if (c.starDot) {
          const core = 50 / c.starHalo
          star.style.background = `radial-gradient(circle,
            hsla(${blueHue}, ${saturation}%, ${lightness}%, 1) 0%,
            hsla(${blueHue}, ${saturation}%, ${lightness}%, 0.85) ${core * 0.7}%,
            hsla(${blueHue}, ${saturation}%, ${lightness}%, 0.28) ${core * 1.8}%,
            hsla(${blueHue}, ${saturation}%, ${lightness}%, 0) 70%)`
        } else {
          star.style.backgroundColor = `hsl(${blueHue}, ${saturation}%, ${lightness}%)`
          star.style.boxShadow = `0 0 ${size * c.starGlow}px hsla(${blueHue}, ${saturation}%, ${lightness}%, 0.8)`
        }
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
      /* GEOMETRY, corrected. Three bugs lived here:
         1. FATAL — travel was computed as a percentage of the VIEWPORT but
            applied to translate(), whose percentages are relative to the
            ELEMENT. A 1.5px-wide element told to move "190%" moved 3px, so
            comets flickered in place and were effectively invisible.
         2. The element was tall and thin (width = thickness, height = length)
            while its gradient and mask ran at 90deg — across the 1.5px axis.
            The tail therefore never faded along its own length.
         3. Angle was random over the full 360° from a fixed y=0 start, so
            roughly half of them flew up off the screen and none crossed the
            sky. Now the streak is a horizontal bar (width = length), aimed by
            rotation, moved along its own axis in PIXELS, head leading. */
      /* Start in the upper-left region so the down-right flight crosses the
         sky instead of leaving it. Starting anywhere across the full width
         put most comets off the right edge within a few frames. */
      const startX = c.cometStartXMin + Math.random() * c.cometStartXSpread
      const startY = c.cometStartYMin + Math.random() * c.cometStartYSpread
      const angle = c.cometAngleMin + Math.random() * c.cometAngleSpread
      const thickness = c.cometWidthMin + Math.random() * c.cometWidthSpread
      const length = c.cometLenMin + Math.random() * c.cometLenSpread
      const hue = Math.random() < c.cometPurpleChance ? 290 : c.starHueMin + Math.random() * c.starHueSpread
      /* Fly to the EDGE, not a fixed pixel count. 1400px crosses a laptop but
         leaves a small window in a few frames, which is why firing one could
         look like nothing happened. Measuring the distance from this start
         point to the edge it is aimed at means every comet is visible for its
         whole flight, on any screen. cometDistance is a percentage of that. */
      const w = starrySky.value.offsetWidth || 1440
      const h = starrySky.value.offsetHeight || 900
      const rad = angle * Math.PI / 180
      const x0 = (startX / 100) * w
      const y0 = (startY / 100) * h
      const dx = Math.cos(rad), dy = Math.sin(rad)
      const exit = Math.min(dx > 0.001 ? (w - x0) / dx : Infinity, dy > 0.001 ? (h - y0) / dy : Infinity)
      const travel = (exit + length) * (c.cometDistance / 100)
      // constant apparent speed: the sliders set the pace of a full-screen trip
      const diagonal = Math.hypot(w, h)
      const pace = Math.min(1.5, Math.max(0.55, travel / (0.7 * diagonal)))
      const duration = (c.cometDurMin + Math.random() * c.cometDurSpread) * pace
      shootingStar.style.position = 'absolute'
      shootingStar.style.left = `${startX}%`
      shootingStar.style.top = `${startY}%`
      shootingStar.style.width = `${length}px`
      shootingStar.style.height = `${thickness}px`
      shootingStar.style.transformOrigin = 'left center'
      shootingStar.style.borderRadius = '999px'
      shootingStar.style.maskImage = 'none'
      shootingStar.style.webkitMaskImage = 'none'
      // head at the leading (right) end, tail dissolving behind it
      shootingStar.style.background = `linear-gradient(90deg,
        hsla(${hue}, 100%, 75%, 0) 0%,
        hsla(${hue}, 100%, 80%, 0.18) 35%,
        hsla(${hue}, 100%, 88%, 0.55) 72%,
        hsla(${hue}, 100%, 95%, 0.95) 93%,
        rgba(255, 255, 255, 1) 100%)`
      shootingStar.style.boxShadow = `0 0 ${thickness * c.cometGlow}px hsla(${hue}, 100%, 85%, 0.55)`
      shootingStar.style.filter = `blur(${Math.random() * c.cometBlurSpread + c.cometBlurMin}px)`
      shootingStar.style.willChange = 'transform, opacity'
      starrySky.value.appendChild(shootingStar)
      const keyframes = [
        { opacity: 0, transform: `rotate(${angle}deg) translateX(0px)`, offset: 0 },
        { opacity: 1, transform: `rotate(${angle}deg) translateX(${travel * 0.08}px)`, offset: 0.08 },
        { opacity: 1, transform: `rotate(${angle}deg) translateX(${travel * 0.75}px)`, offset: 0.75 },
        { opacity: 0, transform: `rotate(${angle}deg) translateX(${travel}px)`, offset: 1 }
      ]
      // linear: an eased comet rushes out of frame in the first quarter, then crawls
      const animation = shootingStar.animate(keyframes, { duration: duration * 1000, easing: 'linear' })
      animation.onfinish = () => shootingStar.remove()
    }
    let shootingStarTimeout
    const scheduleShootingStar = () => {
      clearTimeout(shootingStarTimeout)
      if (document.hidden) return
      const c = cfg()
      const delay = Math.random() * c.cometDelaySpread + c.cometDelayMin
      shootingStarTimeout = setTimeout(() => {
        /* A hidden tab paints no frames, so an animation started there never
           advances — comets queued up in the DOM and all struck at once the
           moment you came back. Fire only while the page is actually on
           screen, and drop anything left mid-flight when it goes away. */
        if (!document.hidden && Math.random() < c.cometChance) createShootingStar()
        scheduleShootingStar()
      }, delay)
    }
    const handleVisibility = () => {
      if (document.hidden) {
        clearTimeout(shootingStarTimeout)
        if (starrySky.value) {
          starrySky.value.querySelectorAll('.shooting-star').forEach(el => el.remove())
        }
      } else {
        scheduleShootingStar()
      }
    }
    onMounted(() => {
      updateContainerHeight()
      createStars()
      lastWidth = starrySky.value ? starrySky.value.offsetWidth : 0
      scheduleShootingStar()
      resizeObserver = new ResizeObserver(() => {handleResize()})
      resizeObserver.observe(document.documentElement)
      window.addEventListener('resize', handleResize)
      document.addEventListener('visibilitychange', handleVisibility)
    })
    onBeforeUnmount(() => {
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
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