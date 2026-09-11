<template>
  <canvas class="desert-sand" ref="cv"></canvas>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'

/* ═══════════════════════════════════════════════════════════════════════════
   THE DESERT ARRIVAL (day mode)

   Vents open in the ground and breathe columns of sand up an S-shaped channel
   — the same shared-path idea as the lamp's smoke in AnimatedLamp, so a column
   reads as one moving body rather than as scattered dots. Every channel ends
   at the lamp, which starts as a faint shape made of sand, fills as the wind
   delivers, and only then hands over to the real icon.

   Tuned in ~/Desktop/DesertLab — a standalone copy of this page with sliders.
   Paste new values from its "Copy as SAND_DEFAULTS" button straight in below.
   ═══════════════════════════════════════════════════════════════════════════ */

export const SAND_DEFAULTS = {
  // the vents, and how hard each one breathes. The birth line sits further
  // below the fold (see startY). Spread went back to 84 after 70 crowded the
  // columns into each other — narrowing the BIRTH line is not what moved the
  // meeting point; reach is.
  ventCount: 6, ventSpread: 84, ventDrift: 4,
  emitPerSec: 680, life: 0.85, lifeSpread: 0.4,
  // the serpent: one shared channel per vent, widening low, narrowing high
  snakeAmp: 46, snakeWaves: 2.2, snakeWiden: 70, snakePhase: 22, personal: 34,
  // the climb, leaning into the lamp. reach 34 -> 21 (founder 2026-09-11):
  // the columns met low on the body; they now converge about half a
  // centimetre higher, centred behind the lamp instead of under it.
  converge: 98, rise: 140, riseEase: 22, reach: 21,
  // the grains
  /* squash 94 -> 58: a grain is a chip, not a ball, and because each one
     carries its own rotation a field of elongated chips reads as grit
     while a field of circles reads as foam. grow 35 -> 6: a dot that
     swells over its life is the other half of the bubble impression —
     sand does not expand as it travels. The size range widens and its
     floor drops, because uniform size is itself a tell. */
  sizeMin: 1.2, sizeSpread: 2.8, squash: 70, alpha: 100, fadeIn: 3, fadeOut: 6,
  /* depthSpread 70 meant the faintest grains rendered at 30% of their
     size — good for depth, but stacked on top of the shrink above it
     left most of the field below a pixel. 55 keeps the depth without
     spending the whole range on it. */
  depthSpread: 55, spin: 26, wobble: 26, wobbleRate: 42, flicker: 46, grow: 6,
  // colour: the sand lamp's own palette, weighted to the tones that show
  darkShare: 72, tintDepth: 6, warmDistance: 190, absorbAt: 9,
  // the becoming
  formSeconds: 1.5, baseOpacity: 0, maxOpacity: 20,
  waitForSand: 1, clearBelow: 1400,
  holdMs: 120, revealMs: 1600, sandHoldMs: 700, sandFadeMs: 900,
  /* 38 -> 0 (founder 2026-09-11): this ramped a hue-shifted COPY of the
     bottle over the real one, which is the other half of the warm gold
     cast. The lamp the sand hands over to is now the PNG itself. */
  warmAmount: 0, warmDelayMs: 900, warmMs: 3200,
  stopWhenFormed: 1,
  // performance: the canvas renders small and is scaled up, because dust is
  // blurry by nature and fill rate is the whole cost of this layer
  renderScale: 70, maxPuffs: 6200,
}

/* Every colour the sand lamp is made of, read from the PNG by coverage. One
   flat tint made the grains read as dots; real sand is many close browns. */
const SAND = [[189, 117, 45], [171, 99, 27], [207, 135, 63], [225, 153, 81], [153, 81, 9],
              [171, 99, 45], [153, 81, 27], [225, 153, 63], [189, 99, 27]]
const SAND_SORTED = [...SAND].sort((a, b) =>
  (a[0] * 0.3 + a[1] * 0.59 + a[2] * 0.11) - (b[0] * 0.3 + b[1] * 0.59 + b[2] * 0.11))

export default {
  name: 'DesertSand',
  props: {
    /* The element holding the lamp image. The sand and tint layers are added
       inside it and removed again on unmount, so the page keeps ownership of
       its own markup and a page without this component renders a normal lamp. */
    lampEl: { type: Object, default: null },
    config: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const cv = ref(null)
    const cfg = { ...SAND_DEFAULTS, ...(props.config || {}) }

    let ctx, W = 0, H = 0, RS = 1, raf = 0
    let vents = [], dust = [], puff = null
    const tintCache = {}
    let fill = 0, formed = false, revealAt = 0, revealFrom = 0
    let lampImg = null, sandLamp = null, warmLamp = null
    let lampBox = { x: 0, y: 0, w: 0, h: 0 }
    let stopped = false

    const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    /* Phones get a much thinner wind: this layer is fill-rate bound, and a
       phone has a quarter of the pixels but nothing like a quarter of the
       fill rate. */
    const phone = () => window.innerWidth < 760 || window.matchMedia?.('(pointer: coarse)').matches
    if (phone()) {
      cfg.emitPerSec = Math.round(cfg.emitPerSec * 0.5)
      cfg.maxPuffs = Math.round(cfg.maxPuffs * 0.4)
      cfg.renderScale = 55
      cfg.ventCount = 4
      /* 84% of a 1440px desktop is 1210px between four columns; 84% of a
         390px phone is 328px, and at that width the columns overlap into one
         smear. The span has to open up as the screen narrows, not hold a
         constant fraction of it. */
      cfg.ventSpread = 96
      /* A phone sits closer to the eye than a monitor, so a grain that reads
         as grit at arm's length reads as a pebble at 30cm. */
      cfg.sizeMin *= 0.8
      cfg.sizeSpread *= 0.8
    }

    function buildPuff() {
      const S = 128
      const c = document.createElement('canvas')
      c.width = c.height = S
      const x = c.getContext('2d')
      /* Sand is opaque grit, not vapour. The old stops held full strength to
         62% and then faded over the remaining 38% — a lit core inside a soft
         halo, which is exactly how a bubble is drawn. A grain is solid almost
         to its edge and only the last few percent antialias, so at 1-3px it
         lands as a speck rather than a dot with a glow around it. */
      const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.80, 'rgba(255,255,255,1)')
      g.addColorStop(0.93, 'rgba(255,255,255,0.72)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = g
      x.fillRect(0, 0, S, S)
      puff = c
    }
    /* One sprite per colour, drawn once. Building a gradient per grain per
       frame costs more than everything else in this component combined. */
    function tinted(r, g, b) {
      const key = r + '_' + g + '_' + b
      if (tintCache[key]) return tintCache[key]
      const S = puff.width
      const c = document.createElement('canvas')
      c.width = c.height = S
      const x = c.getContext('2d')
      x.drawImage(puff, 0, 0)
      x.globalCompositeOperation = 'source-in'
      x.fillStyle = `rgb(${r},${g},${b})`
      x.fillRect(0, 0, S, S)
      tintCache[key] = c
      return c
    }
    function pickSand() {
      const half = Math.ceil(SAND_SORTED.length / 2)
      const dark = Math.random() * 100 < cfg.darkShare
      const from = dark ? 0 : half
      const span = dark ? half : SAND_SORTED.length - half
      return SAND_SORTED[from + Math.floor(Math.random() * span)]
    }

    function measureLamp() {
      if (!props.lampEl || !cv.value) return
      const r = props.lampEl.getBoundingClientRect()
      const h = cv.value.parentElement.getBoundingClientRect()
      lampBox = { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height }
    }
    function placeVents() {
      vents = []
      const spread = (cfg.ventSpread / 100) * W
      const left = (W - spread) / 2
      for (let i = 0; i < cfg.ventCount; i++) {
        const slot = cfg.ventCount === 1 ? 0.5 : i / (cfg.ventCount - 1)
        vents.push({
          x: left + spread * slot + (Math.random() - 0.5) * (spread / Math.max(1, cfg.ventCount * 2)),
          seed: Math.random() * 6.28,
          dir: Math.random() < 0.5 ? -1 : 1,
          due: 0,
        })
      }
    }
    function resize() {
      if (!cv.value || !ctx) return
      const host = cv.value.parentElement
      /* devicePixelRatio was missing here, and it is the whole reason the sand
         looked coarse on a phone. The canvas backing store was renderScale of
         the CSS size — 55% on a phone — and the browser then stretched that up
         to the DEVICE pixels, 3x on a modern handset. A 1.2px grain therefore
         arrived on screen as a soft blob about six device pixels across: not
         bigger by design, just magnified 5.5x from too few pixels.

         It also cost the columns their tip. A grain fades over the last 6% of
         its life, which is exactly when it arrives at the lamp, and a fade
         blurred 5.5x washes out well before the grain gets there — so the
         column appeared to stop short of the lamp on phones and reach it on
         desktop, where the same stretch was only 2.9x.

         DPR is capped at 2 and the product at 1.25 so this cannot run away on
         a 3x screen: fill cost is the square of this number, and fill rate is
         the entire budget of this layer. It is affordable here only because
         the animation stops for good once the lamp forms. */
      const DPR = Math.min(window.devicePixelRatio || 1, 2)
      RS = Math.min(1.25, Math.max(0.25, cfg.renderScale / 100) * DPR)
      W = host.clientWidth; H = host.clientHeight
      cv.value.width = Math.round(W * RS); cv.value.height = Math.round(H * RS)
      cv.value.style.width = W + 'px'; cv.value.style.height = H + 'px'
      ctx.setTransform(RS, 0, 0, RS, 0, 0)
      measureLamp(); placeVents()
    }

    const pool = []
    function emit(v) {
      const d = pool.pop() || {}
      Object.assign(d, {
        v, t: 0,
        life: cfg.life + Math.random() * cfg.lifeSpread,
        off: (Math.random() * 2 - 1) * cfg.personal,
        size: cfg.sizeMin + Math.random() * cfg.sizeSpread,
        seed: Math.random(),
        sand: pickSand(),
        depth: 1 - (cfg.depthSpread / 100) * Math.random(),
        rot: Math.random() * Math.PI,
        spin: (Math.random() * 2 - 1),
        wob: Math.random(),
        warm: 0, x: 0, y: 0,
      })
      dust.push(d)
    }
    /* Every puff from a vent walks the SAME serpent — that shared path is what
       makes a column look like one body of sand instead of confetti. */
    function channel(v, t, off, now) {
      const lampCx = lampBox.x + lampBox.w / 2
      const lampCy = lampBox.y + lampBox.h * (cfg.reach / 100)
      const eased = t + (1 - t) * t * (cfg.riseEase / 100)
      const startY = H + 34
      const y = startY + (lampCy - startY) * eased
      const pull = Math.pow(t, 1.6) * (cfg.converge / 100)
      const baseX = v.x + (lampCx - v.x) * pull
      const widen = 1 - (cfg.snakeWiden / 100) * t
      const phase = v.seed + now * (cfg.snakePhase / 1000)
      const swing = Math.sin(t * Math.PI * 2 * cfg.snakeWaves + phase) * cfg.snakeAmp * widen * v.dir
      return { x: baseX + swing + off * widen, y }
    }

    const put = (el, prop, value) => { if (el && el.style[prop] !== value) el.style[prop] = value }

    let last = performance.now()
    function frame(now) {
      if (stopped) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const tSec = now / 1000
      ctx.clearRect(0, 0, W, H)

      if (!formed) {
        fill = Math.min(1, fill + dt / Math.max(0.5, cfg.formSeconds))
        if (fill >= 1) { formed = true; revealAt = now }
      }

      for (const v of vents) {
        v.x += Math.sin(tSec * 0.3 + v.seed) * cfg.ventDrift * dt
        v.due -= dt
        if (v.due <= 0) {
          const closed = formed && cfg.stopWhenFormed
          const per = 1 / Math.max(1, cfg.emitPerSec)
          let owed = 0
          // a vent may release the whole backlog it has earned: capping it at
          // one per frame silently ignored anything above ~60 per second
          while (v.due <= 0 && owed < 14) { v.due += per; owed++ }
          if (!closed) for (let k = 0; k < owed && dust.length < cfg.maxPuffs; k++) emit(v)
        }
      }

      const lampCx = lampBox.x + lampBox.w / 2
      const lampCy = lampBox.y + lampBox.h * (cfg.reach / 100)

      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i]
        d.t += dt / d.life
        if (d.t >= 1) { pool.push(dust.splice(i, 1)[0]); continue }
        const wob = Math.sin(d.t * cfg.wobbleRate / 6 + d.wob * 6.28) * cfg.wobble * d.depth
        const pos = channel(d.v, d.t, d.off + wob, tSec)
        d.x = pos.x; d.y = pos.y
        d.rot += d.spin * (cfg.spin / 1000) * (1 + d.t)
        const dd = Math.hypot(lampCx - d.x, lampCy - d.y)
        d.warm = cfg.warmDistance > 0 ? Math.max(0, 1 - dd / cfg.warmDistance) : 0
        if (dd < cfg.absorbAt) { pool.push(dust.splice(i, 1)[0]); continue }

        const fi = Math.min(1, d.t / Math.max(0.01, cfg.fadeIn / 100))
        const fo = d.t > 1 - cfg.fadeOut / 100
          ? Math.max(0, (1 - d.t) / Math.max(0.01, cfg.fadeOut / 100)) : 1
        const flick = 1 + Math.sin(d.t * 9 + d.seed * 6.28) * (cfg.flicker / 100) * 0.5
        const a = (cfg.alpha / 100) * fi * fo * (0.6 + 0.4 * d.seed) * d.depth * flick
        const warm = Math.round(d.warm * 4) / 4
        const s = d.sand
        const r = Math.min(255, Math.round(s[0] + cfg.tintDepth * -0.45 + warm * 50))
        const g = Math.min(255, Math.round(s[1] + cfg.tintDepth * -0.55 + warm * 46))
        const b = Math.max(0, Math.round(s[2] + cfg.tintDepth * -0.5 - warm * 10))
        /* The 0.55 floor existed because grow was 35: a grain started at 55%
           and swelled to 90% of its size. With grow at 6 that floor never
           got repaid and every grain rendered at 58% — which is why the
           sand went faint the moment it stopped inflating. The grain is
           full size now and simply does not grow. */
        const w = d.size * (0.92 + (cfg.grow / 100) * d.t)
        const h = w * (cfg.squash / 100)
        ctx.globalAlpha = Math.max(0, Math.min(1, a))
        ctx.translate(d.x, d.y)
        ctx.rotate(d.rot)
        ctx.drawImage(tinted(r, g, b), -w / 2, -h / 2, w, h)
        ctx.setTransform(RS, 0, 0, RS, 0, 0)
      }
      ctx.globalAlpha = 1

      /* THE LAMP. Before: a shape made of sand, filling as the columns feed it.
         After: the real icon rises THROUGH the sand — never a swap — and the
         metal itself then warms toward AnimatedLamp's golden. */
      const base = cfg.baseOpacity / 100
      const top = Math.max(base, cfg.maxOpacity / 100)
      if (!formed) {
        const eased = fill * fill * fill * fill
        put(sandLamp, 'opacity', (base + eased * (top - base)).toFixed(3))
        put(lampImg, 'opacity', '0')
        put(warmLamp, 'opacity', '0')
      } else {
        /* The gold waits for an empty sky: grains already in flight kept
           arriving for a second after the vents closed, and revealing during
           that put the icon into a stream of sand. */
        if (!revealFrom) {
          const held = now - revealAt >= cfg.holdMs
          const clear = !cfg.waitForSand || dust.length <= cfg.clearBelow
          if (held && clear) revealFrom = now
        }
        const since = revealFrom ? now - revealFrom : -1
        const rev = Math.max(0, Math.min(1, since / cfg.revealMs))
        const out = Math.max(0, Math.min(1, (since - cfg.sandHoldMs) / cfg.sandFadeMs))
        const warmT = Math.max(0, Math.min(1, (since - cfg.warmDelayMs) / cfg.warmMs))
        put(lampImg, 'opacity', rev.toFixed(2))
        put(sandLamp, 'opacity', ((1 - out) * top).toFixed(3))
        put(warmLamp, 'opacity', (warmT * (cfg.warmAmount / 100)).toFixed(3))
        // vents shut, air empty, lamp arrived: there is nothing left to draw
        if (cfg.stopWhenFormed && dust.length === 0 && rev >= 1 && warmT >= 1) {
          ctx.clearRect(0, 0, W, H)
          stopped = true
          return
        }
      }
      raf = requestAnimationFrame(frame)
    }

    /* The extra layers are created here rather than in the page's template, so
       a page without this component renders a normal lamp and a failure here
       can never leave the icon invisible. */
    function attachLamp() {
      if (!props.lampEl) return
      lampImg = props.lampEl.querySelector('img')
      if (!lampImg) return
      const mk = (src, filter, z) => {
        const el = document.createElement('img')
        el.src = src
        el.alt = ''
        el.setAttribute('aria-hidden', 'true')
        el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;' +
          'pointer-events:none;opacity:0;z-index:' + z + ';'
        if (filter) el.style.filter = filter
        props.lampEl.appendChild(el)
        return el
      }
      // ?v=1 is not decoration: while the deploy was stale this path returned
      // the SPA's index.html with a 200, and Cloudflare cached that HTML under
      // the .png URL for 4 hours. A version query is a fresh cache key, so the
      // poisoned entry can never be served again — bump it if it ever recurs.
      sandLamp = mk('/images/sand-lamp.png?v=2', null, 2)
      /* No transform any more: sand-lamp.png is now generated FROM bottle.png's
         own alpha, so the two silhouettes are the same shape to within
         anti-aliasing (16px of 219,378 — 0.01%). The handover is a pure
         cross-fade with nothing moving. The transform that used to sit here
         mapped one bounding box onto the other and got the mismatch from
         50.5% to 14.9%; regenerating the asset took it to zero, so aligning
         it again would now push it back OUT of place. */
      // the metal's own colour, the way AnimatedLamp does it: a second copy of
      // the same image, hue-shifted, over the natural gold
      warmLamp = mk('/images/bottle.png?v=3', 'hue-rotate(-9deg) saturate(1.4) brightness(0.9)', 3)
      lampImg.style.opacity = '0'
    }
    function detachLamp() {
      if (lampImg) lampImg.style.opacity = ''
      if (sandLamp) sandLamp.remove()
      if (warmLamp) warmLamp.remove()
    }

    let ro = null
    onMounted(() => {
      if (!cv.value) return
      // Reduce Motion: no columns, no becoming — the lamp is simply there.
      if (reduced()) { stopped = true; return }
      ctx = cv.value.getContext('2d')
      buildPuff()
      attachLamp()
      resize()
      ro = new ResizeObserver(() => resize())
      ro.observe(cv.value.parentElement)
      raf = requestAnimationFrame(frame)
    })
    onBeforeUnmount(() => {
      stopped = true
      cancelAnimationFrame(raf)
      if (ro) ro.disconnect()
      detachLamp()
    })

    return { cv }
  },
}
</script>

<style scoped>
.desert-sand {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
