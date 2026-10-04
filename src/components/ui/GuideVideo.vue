<template>
  <!-- Jinni's own player for a guide's uploaded clip (founder 2026-10-05: Instagram's
       embed "looks like колхоз" — its account header, likes and caption). Only the
       video: it starts by itself (muted — browsers allow nothing else), a tap pauses
       or resumes, one button turns the sound on, and a small Instagram mark links to
       the original post when the guide gave its link. -->
  <div class="gv" :class="{ paused }" @click.stop="toggle">
    <video ref="video" class="gv-video" :src="src" :poster="poster || undefined" playsinline webkit-playsinline loop preload="metadata"
           @play="paused = false" @pause="paused = true" @timeupdate="onTime" @error="$emit('error')"></video>
    <span v-if="paused" class="gv-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
    <button type="button" class="gv-btn gv-sound" :aria-label="muted ? 'Sound on' : 'Sound off'" @click.stop="toggleMute">
      <svg v-if="muted" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" class="fill"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" class="fill"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/></svg>
    </button>
    <a v-if="igUrl" class="gv-btn gv-ig" :href="igUrl" target="_blank" rel="noopener" :aria-label="igLabel" :title="igLabel" @click.stop>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.9" class="fill"/></svg>
    </a>
    <span class="gv-bar" aria-hidden="true"><i :style="{ transform: `scaleX(${progress})` }"></i></span>
  </div>
</template>

<script>
export default {
  name: 'GuideVideo',
  props: {
    src: { type: String, required: true },
    poster: { type: String, default: '' },
    igUrl: { type: String, default: '' },          // the original post — shown as a small Instagram mark
    igLabel: { type: String, default: 'Instagram' },
    autoplay: { type: Boolean, default: true },
  },
  emits: ['error'],
  data() { return { paused: true, muted: true, progress: 0 } },
  mounted() {
    const v = this.$refs.video
    v.muted = true                                 // set on the element itself: the attribute alone is not enough for autoplay
    if (this.autoplay) v.play().catch(() => { /* blocked (data saver, low power) — the play mark stays */ })
  },
  beforeUnmount() { const v = this.$refs.video; if (v) { v.pause(); v.removeAttribute('src'); v.load() } },
  methods: {
    toggle() { const v = this.$refs.video; if (v.paused) v.play().catch(() => {}); else v.pause() },
    toggleMute() {
      const v = this.$refs.video
      v.muted = !v.muted; this.muted = v.muted
      if (!v.muted && v.paused) v.play().catch(() => {})
    },
    onTime() { const v = this.$refs.video; this.progress = v.duration ? Math.min(1, v.currentTime / v.duration) : 0 },
  },
}
</script>

<style scoped>
.gv { position: relative; display: inline-flex; max-width: 100%; max-height: 100%; border-radius: 14px; overflow: hidden; background: #000; cursor: pointer;
  -webkit-tap-highlight-color: transparent; box-shadow: 0 0 24px -6px rgba(0,0,0,0.6); }
.gv-video { display: block; max-width: 100%; max-height: var(--gv-max-h, 100%); min-width: 180px; background: #000; }
.gv-play { position: absolute; inset: 0; margin: auto; width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; pointer-events: none;
  color: #fff; background: rgba(16,7,34,0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.5), 0 0 18px -2px rgba(255,190,110,0.5); }
.gv-play svg { width: 26px; height: 26px; fill: currentColor; margin-left: 3px; }
.gv-btn { position: absolute; bottom: 14px; width: 34px; height: 34px; border-radius: 50%; border: 0; padding: 0; display: grid; place-items: center; cursor: pointer;
  color: #fff; background: rgba(16,7,34,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.35); transition: background-color 0.2s ease, box-shadow 0.2s ease; }
.gv-btn:hover { background: rgba(16,7,34,0.7); box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.6); }
.gv-btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.gv-btn svg .fill { fill: currentColor; stroke: none; }
.gv-sound { right: 12px; }
.gv-ig { left: 12px; text-decoration: none; }
.gv-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,0.18); pointer-events: none; }
.gv-bar i { display: block; height: 100%; transform-origin: left center; background: linear-gradient(90deg, #ffd27a, #fff3d6); }
</style>
