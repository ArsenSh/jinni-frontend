<template>
  <Transition name="switch-screen">
    <div v-if="visible" class="switch-screen" :class="{ day: !isNight }">
      <div class="bottle-scene" :class="{ rtl: isRtl }">
        <!-- Dust particles: fully DOM-driven, no Vue reactivity -->
        <div class="smoke-container" ref="smokeContainerEl"></div>
        <!-- Bottle wrap: rotation driven by JS so speed can ramp up from 0 -->
        <div class="switch-bottle-wrap" ref="bottleWrapEl">
          <img src="/images/bottle.png?v=2"  alt="Jinni"  class="switch-bottle"  :class="isNight ? 'night-glow' : 'day-glow'"/>
        </div>
      </div>
      <p class="switch-label">{{ label }}</p>
    </div>
  </Transition>
</template>



<script>
import { ref, watch, onUnmounted, computed, nextTick } from 'vue'
import { isNightTime } from '@/utils/timeUtils'
export default {
  name: 'SwitchModeOverlay',
  props: { visible: { type: Boolean, default: false }, label: { type: String, default: 'Switching...' }, theme: { type: String, default: null } },
  setup(props) {
    const smokeContainerEl = ref(null)
    const bottleWrapEl = ref(null)
    // Mirror the whole bottle scene when the document is in RTL (Arabic) so the
    // bottle faces — and the smoke streams — the other way. Read at show time.
    const isRtl = ref(false)
    // Plain JS array — no Vue reactivity, no re-renders
    let particles = []
    const SIZE_STEPS =          [10,15,20,25,30,35]
    let particleSize = SIZE_STEPS[0]
    let sizeStepIndex = 0
    let sizeStepTimer = null
    // ── Emit interval stepping ──────────────────────────────────────
    const EMIT_INTERVAL_STEPS = [10,10,2,2,1,1]
    let emitIntervalStepIndex = 0
    let currentEmitIntervalMs = EMIT_INTERVAL_STEPS[0]
    let emitStepTimer = null
    // ── Spin constants ──────────────────────────────────────────────
    const FULL_SPEED_DEG_PER_MS = 360 / 720
    const ACCEL_DEG_PER_MS2     = FULL_SPEED_DEG_PER_MS / 1000  // reach full speed in 1.5s
    // No easing function — pure linear acceleration so speed only ever increases
    // ── Mouth tracking ───────────────────────────────────────────────
    const SCENE_CX = 80
    const SCENE_CY = 90
    const MOUTH_DX = 30
    const MOUTH_DY = -20
    const MOUTH_RADIUS     = Math.sqrt(MOUTH_DX ** 2 + MOUTH_DY ** 2) * 2
    const MOUTH_BASE_ANGLE = Math.atan2(MOUTH_DY, MOUTH_DX) * 180 / Math.PI
    // ── RAF loop state ───────────────────────────────────────────────
    let rafId           = null
    let currentSpeedDegPerMs = 0       // starts at rest, only ever increases until cap
    let currentAngleDeg = MOUTH_BASE_ANGLE
    let lastFrameTime   = null
    // ── Particle emission state ──────────────────────────────────────
    let lastEmitTime = null
    // ── Color phase state ────────────────────────────────────────────
    // Each color type gets its own window (ms), cycling 0→1→2→3→0→…
    // Durations: ~1000, ~1200, ~1400, ~1100 ms — all close to 1 second
    const PHASE_DURATIONS_MS = [3000, 1500, 1500, 2500]
    let colorPhase     = 0          // index 0–3, current active color type
    let phaseStartTime = null       // when the current phase began
    // ── Physics constants ────────────────────────────────────────────
    const GRAVITY      = -0.00005   // px/ms² downward pull — gentle arc
    const DRAG         = 0.008    // very low drag so particles drift slowly for seconds
    const THROW_SPEED  = 0.5     // softer throw — particles linger near the bottle longer


    const startSizeStepping = () => {
      sizeStepIndex = 0
      particleSize = SIZE_STEPS[0]
      sizeStepTimer = setInterval(() => {
        sizeStepIndex++
        if (sizeStepIndex < SIZE_STEPS.length) { particleSize = SIZE_STEPS[sizeStepIndex] }
        if (sizeStepIndex >= SIZE_STEPS.length - 1) {
          clearInterval(sizeStepTimer)
          sizeStepTimer = null
        }
      }, 500)
    }
    const stopSizeStepping = () => {
      if (sizeStepTimer) { clearInterval(sizeStepTimer); sizeStepTimer = null }
      particleSize = SIZE_STEPS[0]
    }
    const startEmitStepping = () => {
      emitIntervalStepIndex = 0
      currentEmitIntervalMs = EMIT_INTERVAL_STEPS[0]
      emitStepTimer = setInterval(() => {
        emitIntervalStepIndex++
        if (emitIntervalStepIndex < EMIT_INTERVAL_STEPS.length) {currentEmitIntervalMs = EMIT_INTERVAL_STEPS[emitIntervalStepIndex]}
        if (emitIntervalStepIndex >= EMIT_INTERVAL_STEPS.length - 1) {
          clearInterval(emitStepTimer)
          emitStepTimer = null
        }
      }, 500)
    }
    const stopEmitStepping = () => {
      if (emitStepTimer) { clearInterval(emitStepTimer); emitStepTimer = null }
      currentEmitIntervalMs = EMIT_INTERVAL_STEPS[0]
    }
    const isNight = computed(() => {
      if (props.theme === 'light') return false
      if (props.theme === 'dark') return true
      return isNightTime()
    })
    const advancePhase = (now) => {
      if (phaseStartTime === null) { phaseStartTime = now; return }
      if (now - phaseStartTime >= PHASE_DURATIONS_MS[colorPhase]) {
        colorPhase    = (colorPhase + 1) % 4
        phaseStartTime = now
      }
    }
    const createParticle = (mouthX, mouthY, now) => {
      advancePhase(now)
      const dayTypes   = ['golden', 'deep-amber', 'light-amber', 'mystic-amber']
      const nightTypes = ['light-blue',  'deep-blue',  'purple-blue', 'mystic-blue']
      const types = isNight.value ? nightTypes : dayTypes
      const size = particleSize
      const dx  = mouthX - SCENE_CX
      const dy  = mouthY - SCENE_CY
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const ux  = dx / len
      const uy  = dy / len
      const speedFactor = currentSpeedDegPerMs / FULL_SPEED_DEG_PER_MS
      const speed = THROW_SPEED * (0.5 + speedFactor * 1.2) * (0.8 + Math.random() * 0.4)
      const spread = 0
      const vx =  ux * speed + (-uy) * spread
      const vy =  uy * speed + ( ux) * spread
      const x = mouthX - size / 2 + (Math.random() * 16 - 8)  // was ±3, now ±8
      const y = mouthY - size / 2 + (Math.random() * 16 - 8)
      const blur = Math.random() * 8 + 3
      // Create real DOM element directly
      const el = document.createElement('div')
      el.className = `smoke-particle ${types[colorPhase]}`
      el.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;opacity:0.8;filter:blur(${blur}px);`
      // Copy Vue's scoped attribute from container so scoped CSS applies
      if (smokeContainerEl.value) {
        const scopeAttr = Array.from(smokeContainerEl.value.attributes).find(a => a.name.startsWith('data-v-'))
        if (scopeAttr) el.setAttribute(scopeAttr.name, '')
        smokeContainerEl.value.appendChild(el)
      }
      particles.push({
        el, size, origSize: size, x, y, vx, vy,
        opacity: 0.8, blur,
        life: 0,
        maxLife: Math.min((Math.random() * 5000 + 6000) / Math.max(speedFactor, 0.3), 20000),
      })
    }
    // ── Main RAF tick ────────────────────────────────────────────────
    const tick = (now) => {
      const dt = lastFrameTime !== null ? now - lastFrameTime : 0
      lastFrameTime = now
      // Accelerate linearly — speed only ever increases until cap
      currentSpeedDegPerMs = Math.min(
        currentSpeedDegPerMs + ACCEL_DEG_PER_MS2 * dt,
        FULL_SPEED_DEG_PER_MS
      )
      // Advance rotation
      currentAngleDeg += currentSpeedDegPerMs * dt
      if (bottleWrapEl.value) {
        bottleWrapEl.value.style.transform = `rotate(${currentAngleDeg}deg)`
      }
      // Mouth position (top/left coords, origin = top-left of scene)
      const rad    = (currentAngleDeg * Math.PI) / 180
      const mouthX = SCENE_CX + MOUTH_RADIUS * Math.cos(rad)
      const mouthY = SCENE_CY + MOUTH_RADIUS * Math.sin(rad)
      // ── Update existing particles (physics step) ──────────────────
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life += dt
        if (p.life >= p.maxLife) {
          p.el.remove()
          particles.splice(i, 1)
          continue
        }
        p.vx *= (1 - DRAG * dt)
        p.vy *= (1 - DRAG * dt)
        p.vy += GRAVITY * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        const t = p.life / p.maxLife
        p.opacity = 0.8 * (1 - t * t)
        p.size = Math.min(p.size * (1 + 0.0003 * dt), p.origSize * 1.5)
        // Write directly to DOM — no Vue involved
        p.el.style.left    = `${p.x}px`
        p.el.style.top     = `${p.y}px`
        p.el.style.opacity = p.opacity
        p.el.style.width   = `${p.size}px`
        p.el.style.height  = `${p.size}px`
      }
      // ── Emit new particles ────────────────────────────────────────
      const speedFactor = currentSpeedDegPerMs / FULL_SPEED_DEG_PER_MS
      if (speedFactor > 0.05) {
        const emitInterval = currentEmitIntervalMs / speedFactor
        if (lastEmitTime === null) {
          createParticle(mouthX, mouthY, now)
          lastEmitTime = now
        } else if (now - lastEmitTime >= emitInterval) {
          createParticle(mouthX, mouthY, now)
          lastEmitTime += emitInterval
          if (now - lastEmitTime > emitInterval * 2) lastEmitTime = now
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    const start = () => {
      if (rafId) return
      currentSpeedDegPerMs = 0
      currentAngleDeg      = MOUTH_BASE_ANGLE
      if (bottleWrapEl.value) { bottleWrapEl.value.style.transform = `rotate(${MOUTH_BASE_ANGLE}deg)` }
      lastFrameTime        = null
      lastEmitTime         = null
      colorPhase           = 0
      phaseStartTime       = null
      startSizeStepping()
      startEmitStepping()
      rafId = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null }
      particles.forEach(p => p.el.remove())
      particles = []
      if (smokeContainerEl.value) { smokeContainerEl.value.innerHTML = '' }
      if (bottleWrapEl.value) { bottleWrapEl.value.style.transform = '' }
      lastFrameTime  = null
      lastEmitTime   = null
      colorPhase     = 0
      phaseStartTime = null
      stopSizeStepping()
      stopEmitStepping()
    }
    watch(() => props.visible, (v) => {
      if (v) {
        isRtl.value = (typeof document !== 'undefined') &&
          document.documentElement.getAttribute('dir') === 'rtl'
        nextTick(start)
      } else {
        stop()
      }
    }, { immediate: true })
    onUnmounted(stop)
    return { isNight, isRtl, bottleWrapEl, smokeContainerEl }
  }
}
</script>



<style scoped>
/* ── Screen ── */
.switch-screen {position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 32px; background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 40%, #16213e 100%)}
.switch-screen.day {background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 55%, #efe4cf 100%)}
/* ── Transitions ── */
.switch-screen-enter-active { transition: opacity 0.25s ease; }
.switch-screen-leave-active { transition: opacity 0.35s ease 0.1s; }
.switch-screen-enter-from,
.switch-screen-leave-to { opacity: 0; }
/* ── Scene ── */
.bottle-scene {position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center}
/* RTL: mirror the whole scene so the bottle faces — and smoke streams — the
   other way. Mirroring the parent keeps the JS-driven rotation + mouth tracking
   visually consistent; the label is a sibling and stays un-mirrored. */
.bottle-scene.rtl {transform: scaleX(-1)}
/* ── Bottle wrap: rotation is now JS-driven via inline transform ── */
.switch-bottle-wrap {position: absolute; inset: 0; display: flex; align-items: center; justify-content: center}
/* ── Bottle ── */
.switch-bottle {width: 120px; height: auto; position: relative; z-index: 2; transform-origin: center center}
.switch-bottle.day-glow {filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.7)); animation: bottle-glow-day 3s ease-in-out infinite alternate}
.switch-bottle.night-glow {filter: drop-shadow(0 0 12px rgba(65, 105, 225, 0.7)); animation: bottle-glow-night 3s ease-in-out infinite alternate}
@keyframes bottle-glow-day {0%   { filter: drop-shadow(0 0 6px rgba(255, 193, 7, 0.6)); } 100% { filter: drop-shadow(0 0 18px rgba(255, 193, 7, 0.95)); }}
@keyframes bottle-glow-night {0%   { filter: drop-shadow(0 0 6px rgba(65, 105, 225, 0.6)); } 100% { filter: drop-shadow(0 0 18px rgba(65, 105, 225, 0.95)); }}
/* ── Label ── */
.switch-label {font-size: 1.15rem; font-weight: 500; color: rgba(255, 255, 255, 0.85); margin: 0; letter-spacing: -0.01em; animation: label-fade-in 0.5s ease 0.2s both; position: relative; z-index: 1}
.day .switch-label {color: #3c2a1e}
@keyframes label-fade-in {from { opacity: 0; transform: translateY(6px); }   to   { opacity: 1; transform: translateY(0); }}
/* ── Smoke ── */
.smoke-container {position: absolute; inset: 0; overflow: visible; pointer-events: none; z-index: 3}
.smoke-particle {position: absolute; border-radius: 60% 40% 70% 30%; will-change: transform, opacity, left, top; transform-origin: center center; pointer-events: none}
/* Day colors */
.light-amber  { background: radial-gradient(circle, rgba(243,231,201,0.6) 0%, rgba(230,192,103,0.35) 45%, rgba(217,151,6,0.15) 75%, transparent 100%); }
.deep-amber   { background: radial-gradient(circle, rgba(230,192,103,0.85) 0%, rgba(255,183,77,0.55) 50%, rgba(201,162,39,0.25) 80%, transparent 100%); }
.golden       { background: radial-gradient(circle, rgba(255,183,77,0.8) 0%, rgba(217,119,6,0.5) 55%, rgba(153,101,21,0.25) 80%, transparent 100%); }
.mystic-amber { background: radial-gradient(circle, rgba(201,162,39,0.8) 0%, rgba(184,134,11,0.5) 55%, rgba(153,101,21,0.25) 80%, transparent 100%); }
/* Night colors */
.light-blue   { background: radial-gradient(circle, rgba(180,235,255,0.85) 0%, rgba(120,190,240,0.55) 50%, rgba(80,140,200,0.25) 80%, transparent 100%); }
.deep-blue    { background: radial-gradient(circle, rgba(90,150,255,0.9) 0%, rgba(60,100,220,0.6) 50%, rgba(40,60,160,0.3) 80%, transparent 100%); }
.purple-blue  { background: radial-gradient(circle, rgba(180,140,255,0.8) 0%, rgba(130,90,210,0.55) 50%, rgba(90,60,150,0.3) 80%, transparent 100%); }
.mystic-blue  { background: radial-gradient(circle, rgba(120,110,255,0.75) 0%, rgba(80,70,200,0.5) 50%, rgba(50,40,130,0.25) 80%, transparent 100%); }
/* Particles are fully JS-driven — no CSS keyframe needed */
</style>