<template>
  <!-- A guide's pick ON the card photo (founder 2026-10-04, LandingLab
       guide-reel-card.html, version "one tap" + desktop grid/stage): the guide
       as a glass chip, the reel behind one tap. Open, the photo area becomes
       the reel — the card's own CSS decides the height (9:16 on phones, two
       grid rows on desktop, a stage on a large card); this component fills it,
       centring the 9:16 reel over the place's blurred photo. Instagram's
       official embed; it never autoplays (Instagram's rule), so one tap. -->
  <div class="gr" :class="{ open }" @click.stop>
    <a class="gr-chip" :href="'/@' + pick.handle" target="_blank" rel="noopener" :title="pick.note || ''">
      <i aria-hidden="true">{{ initials }}</i><b>@{{ pick.handle }}</b><em>· {{ t('guides.chat.guide_pick') }}</em>
    </a>
    <button v-if="embed && !open" type="button" class="gr-play" @click.stop="$emit('toggle')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>{{ t('guides.page.watch_reel') }}
    </button>
    <div v-if="embed && open" class="gr-stage">
      <div class="gr-blur" :style="photo ? { backgroundImage: `url(${photo})` } : null"></div>
      <iframe class="gr-frame" :src="embed" title="Instagram reel" scrolling="no" allowtransparency="true" allow="encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"></iframe>
      <button type="button" class="gr-close" aria-label="Close" @click.stop="$emit('toggle')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { instagramEmbed } from '@/utils/guides'

export default {
  name: 'GuideReel',
  props: {
    pick: { type: Object, required: true },     // guidePicks[0]: { handle, displayName, note, reelUrl, category }
    photo: { type: String, default: '' },       // the card photo — blurred behind the reel
    open: { type: Boolean, default: false },
  },
  emits: ['toggle'],
  setup() { const { t } = useI18n(); return { t } },
  computed: {
    embed() { return this.pick.reelUrl ? instagramEmbed(this.pick.reelUrl) : null },
    initials() {
      const n = String(this.pick.displayName || this.pick.handle || '').trim().split(/\s+/).filter(Boolean)
      return ((n[0] || '')[0] || '') + ((n[1] || '')[0] || '')
    },
  },
}
</script>

<style scoped>
.gr { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
.gr > * { pointer-events: auto; }
.gr-chip { position: absolute; top: 10px; left: 10px; display: inline-flex; align-items: center; gap: 7px; max-width: calc(100% - 60px); padding: 3px 11px 3px 3px; border-radius: 999px;
  text-decoration: none; font-size: 11.5px; color: #fff4e2; white-space: nowrap; overflow: hidden;
  background: rgba(20,10,34,0.45); backdrop-filter: blur(12px) saturate(150%); -webkit-backdrop-filter: blur(12px) saturate(150%);
  box-shadow: inset 0 0 0 0.75px rgba(255,235,200,0.35); }
.gr-chip i { flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font: 700 10px/1 system-ui, sans-serif; font-style: normal;
  color: #2b1d0e; text-transform: uppercase; background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 10px -2px rgba(255,140,0,0.7); }
.gr-chip b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
.gr-chip em { font-style: normal; opacity: 0.8; }
.gr-chip:hover { background: rgba(20,10,34,0.6); }
.gr-play { position: absolute; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px 7px 10px; border: 0; border-radius: 999px; cursor: pointer;
  font: 600 12.5px/1 system-ui, sans-serif; color: #fff; background: rgba(255,255,255,0.16); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.55), 0 0 18px -4px rgba(255,170,80,0.6); }
.gr-play svg { width: 13px; height: 13px; fill: currentColor; }
.gr-play:hover { background: rgba(255,255,255,0.24); }
.gr-stage { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; background: #000; }
.gr-blur { position: absolute; inset: -30px; background: center / cover no-repeat; filter: blur(22px) brightness(0.45) saturate(1.2); }
.gr-frame { position: relative; height: 100%; aspect-ratio: 9 / 16; max-width: 100%; border: 0; background: #000; }
.gr-close { position: absolute; top: 10px; right: 10px; z-index: 2; width: 32px; height: 32px; border-radius: 999px; border: 0; display: grid; place-items: center; cursor: pointer;
  color: #fff; background: rgba(20,10,34,0.55); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.gr-close svg { width: 15px; height: 15px; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; fill: none; }
.gr.open .gr-chip { z-index: 2; }
/* phones: the reel fills the card, and its own header already names the account */
@media (max-width: 600px) { .gr.open .gr-chip { display: none; } }
</style>
