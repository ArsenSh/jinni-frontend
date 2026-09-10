<template>
  <!-- DEV ONLY. The router registers this behind import.meta.env.DEV, so the
       page and its panel never exist in a production build. It renders the
       REAL StarrySky, so what looks right here looks right on the landing
       page — copy the values out and they become the shipped defaults. -->
  <div class="lab">
    <StarrySky ref="sky" :config="cfg" />

    <div class="stage">
      <p class="stage-title">Where Will <span>Jinni</span> Take You?</p>
      <p class="stage-sub">Tune the sky against real type, not against an empty page.</p>
    </div>

    <aside class="panel" :class="{ folded }">
      <header>
        <strong>Sky Lab</strong>
        <button class="mini" @click="folded = !folded">{{ folded ? 'show' : 'hide' }}</button>
      </header>

      <div v-show="!folded" class="body">
        <div class="row">
          <button class="act" @click="fire">Fire comet</button>
          <button class="act" @click="rebuild">Rebuild stars</button>
          <button class="act" @click="reset">Reset</button>
        </div>

        <section v-for="group in groups" :key="group.name">
          <h4>{{ group.name }}</h4>
          <label v-for="k in group.keys" :key="k">
            <span class="k">{{ label(k) }}</span>
            <input type="range" :min="meta[k][0]" :max="meta[k][1]" :step="meta[k][2]" v-model.number="cfg[k]">
            <span class="v">{{ cfg[k] }}</span>
          </label>
        </section>

        <div class="row">
          <button class="act wide" @click="copy">{{ copied ? 'Copied ✓' : 'Copy as SKY_DEFAULTS' }}</button>
        </div>
        <pre class="out">{{ diff }}</pre>
      </div>
    </aside>
  </div>
</template>

<script>
import StarrySky, { SKY_DEFAULTS } from '@/components/ui/StarrySky.vue'

// [min, max, step] per knob — the range each slider sweeps.
const META = {
  starCount: [0, 6000, 50], starSizeMin: [0.1, 3, 0.1], starSizeSpread: [0, 4, 0.1],
  starOpacityMin: [0, 1, 0.05], starOpacitySpread: [0, 1, 0.05], starGlow: [0, 12, 0.5],
  starHueMin: [0, 360, 5], starHueSpread: [0, 180, 5],
  starDot: [0, 1, 1], starHalo: [1, 8, 0.5],
  starWarmChance: [0, 1, 0.01], starWarmHueMin: [0, 60, 1], starWarmHueSpread: [0, 60, 1],
  starEmberChance: [0, 1, 0.01], starEmberHueMin: [0, 60, 1], starEmberHueSpread: [0, 60, 1],
  twinkleChance: [0, 1, 0.01], twinkleMin: [1, 30, 1], twinkleSpread: [0, 30, 1],
  cometDelayMin: [200, 20000, 100], cometDelaySpread: [0, 20000, 100], cometChance: [0, 1, 0.05],
  cometDurMin: [0.3, 6, 0.1], cometDurSpread: [0, 6, 0.1],
  cometWidthMin: [0.5, 10, 0.5], cometWidthSpread: [0, 10, 0.5],
  cometLenMin: [20, 800, 10], cometLenSpread: [0, 800, 10],
  cometAngleMin: [0, 360, 5], cometAngleSpread: [0, 360, 5],
  cometMirrorChance: [0, 1, 0.05], cometFromTopChance: [0, 1, 0.05], cometMargin: [0, 40, 1],
  cometEntryXMin: [-80, 60, 5], cometEntryXSpread: [0, 200, 5],
  cometEntryYMin: [-40, 80, 5], cometEntryYSpread: [0, 140, 5],
  cometHueJitter: [0, 60, 1], cometColorCycle: [0, 1, 1],
  cometBlurMin: [0, 5, 0.1], cometBlurSpread: [0, 5, 0.1],
  // a percentage of the container diagonal, not pixels
  cometGlow: [0, 60, 1], cometDistance: [20, 200, 5],
}

export default {
  name: 'SkyLab',
  components: { StarrySky },
  data() {
    return {
      cfg: { ...SKY_DEFAULTS },
      meta: META,
      folded: false,
      copied: false,
      groups: [
        { name: 'Stars', keys: ['starCount', 'starSizeMin', 'starSizeSpread', 'starOpacityMin', 'starOpacitySpread', 'starDot', 'starHalo', 'starGlow', 'starHueMin', 'starHueSpread'] },
        { name: 'Star colour', keys: ['starWarmChance', 'starWarmHueMin', 'starWarmHueSpread', 'starEmberChance', 'starEmberHueMin', 'starEmberHueSpread'] },
        { name: 'Twinkle', keys: ['twinkleChance', 'twinkleMin', 'twinkleSpread'] },
        { name: 'Comet timing', keys: ['cometDelayMin', 'cometDelaySpread', 'cometChance', 'cometDurMin', 'cometDurSpread'] },
        { name: 'Comet path', keys: ['cometAngleMin', 'cometAngleSpread', 'cometMirrorChance', 'cometDistance'] },
        { name: 'Comet birth', keys: ['cometFromTopChance', 'cometMargin', 'cometEntryXMin', 'cometEntryXSpread', 'cometEntryYMin', 'cometEntryYSpread'] },
        { name: 'Comet shape', keys: ['cometWidthMin', 'cometWidthSpread', 'cometLenMin', 'cometLenSpread'] },
        { name: 'Comet light', keys: ['cometGlow', 'cometBlurMin', 'cometBlurSpread', 'cometHueJitter', 'cometColorCycle'] },
      ],
    }
  },
  computed: {
    // Only what differs from the shipped values — that's all you need to paste.
    diff() {
      const out = {}
      for (const k of Object.keys(SKY_DEFAULTS)) {
        if (!Array.isArray(this.cfg[k]) && this.cfg[k] !== SKY_DEFAULTS[k]) out[k] = this.cfg[k]
      }
      return Object.keys(out).length
        ? Object.entries(out).map(([k, v]) => `  ${k}: ${v},`).join('\n')
        : '— unchanged —'
    },
  },
  methods: {
    label(k) { return k.replace(/([A-Z])/g, ' $1').toLowerCase() },
    fire() { this.$refs.sky?.createShootingStar?.() },
    rebuild() { this.$refs.sky?.createStars?.() },
    reset() { this.cfg = { ...SKY_DEFAULTS } },
    copy() {
      const body = Object.keys(SKY_DEFAULTS).map(k => `  ${k}: ${JSON.stringify(this.cfg[k])},`).join('\n')
      navigator.clipboard?.writeText(`export const SKY_DEFAULTS = {\n${body}\n}`)
      this.copied = true
      setTimeout(() => { this.copied = false }, 1500)
    },
  },
}
</script>

<style scoped>
.lab { position: relative; min-height: 100vh; overflow: hidden; }
.stage { position: relative; z-index: 1; padding: 22vh 40px 0; text-align: center; pointer-events: none; }
.stage-title {
  font-family: 'Cinzel', serif; font-size: clamp(2rem, 5vw, 3.6rem); color: #fff6e2; margin: 0 0 12px;
  text-shadow: 0 0 4px rgba(255,214,150,0.5), 0 0 18px rgba(255,170,90,0.4), 0 0 46px rgba(255,140,60,0.26);
}
.stage-title span {
  background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
.stage-sub { color: #cdc5e4; margin: 0; font-size: 0.95rem; }

.panel {
  position: fixed; top: 14px; right: 14px; z-index: 10; width: 320px; max-height: calc(100vh - 28px);
  display: flex; flex-direction: column; border-radius: 14px; color: #ece7f5;
  font-family: system-ui, sans-serif; font-size: 12px;
  background: rgba(18,12,32,0.86); backdrop-filter: blur(14px);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 28px -6px rgba(0,0,0,0.7);
}
.panel.folded { width: auto; }
.panel header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; }
.panel .body { overflow-y: auto; padding: 0 12px 12px; }
h4 { margin: 12px 0 6px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #a99fc0; font-weight: 600; }
label { display: grid; grid-template-columns: 108px 1fr 44px; align-items: center; gap: 8px; margin-bottom: 5px; }
.k { color: #cdc5e4; }
.v { text-align: right; font-variant-numeric: tabular-nums; color: #ffe8c4; }
input[type=range] { width: 100%; accent-color: #e6c163; }
.row { display: flex; gap: 6px; margin: 10px 0 2px; }
.act, .mini {
  font: inherit; cursor: pointer; color: #ffe8c4; border: none; border-radius: 8px; padding: 6px 10px;
  background: rgba(233,196,124,0.14); box-shadow: inset 0 0 0 1px rgba(233,196,124,0.3);
}
.act:hover, .mini:hover { background: rgba(233,196,124,0.26); }
.act.wide { flex: 1; }
.out { margin: 8px 0 0; padding: 8px; border-radius: 8px; background: rgba(0,0,0,0.35); color: #cfeeff; white-space: pre-wrap; font-size: 11px; }
</style>
