<template>
  <!-- A guide's pick ON the card photo (founder 2026-10-04, LandingLab
       guide-reel-card.html, version "one tap" + desktop grid/stage): the guide
       as a glass chip, the reel behind one tap. Open, the photo area becomes
       the reel — the card's own CSS decides the height (9:16 on phones, two
       grid rows on desktop, a stage on a large card); this component fills it,
       centring the 9:16 reel over the place's blurred photo. Instagram's
       official embed; it never autoplays (Instagram's rule), so one tap. -->
  <div class="gr" :class="{ open }" @click.stop>
    <a class="gr-chip" :href="'/@' + pick.handle" target="_blank" rel="noopener" :title="'@' + pick.handle + (pick.note ? ' — ' + pick.note : '')">
      <i aria-hidden="true"><span>{{ initials }}</span></i><b>{{ firstName }}</b><em>· {{ t('guides.chat.guide_pick') }}</em>
    </a>
    <!-- no play pill on the photo: the card's images button opens the gallery on the reel -->
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
    firstName() { return String(this.pick.displayName || '').trim().split(/\s+/)[0] || '@' + this.pick.handle },
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
/* The guide chip (founder 2026-10-04: "more interesting, and the profile icon colour can
   match the chat"): a story-style ring in the chat's own light — violet → blue → a touch
   of gold at night, apricot → honey → bronze by day — around the initials, then the
   guide's first name. Theme from the page's night-mode / day-mode ancestor. */
.gr-chip { position: absolute; top: 10px; left: 10px; display: inline-flex; align-items: center; gap: 8px; max-width: calc(100% - 60px); padding: 3px 13px 3px 3px; border-radius: 999px;
  text-decoration: none; font-size: 12px; white-space: nowrap; overflow: hidden; color: #f6efff;
  background: rgba(16,7,34,0.5); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
  box-shadow: inset 0 0 0 0.75px rgba(200,170,255,0.4), 0 0 16px -4px rgba(124,77,255,0.6); transition: background-color 0.2s ease, box-shadow 0.2s ease; }
.gr-chip:hover { background: rgba(16,7,34,0.66); box-shadow: inset 0 0 0 0.75px rgba(200,170,255,0.6), 0 0 20px -4px rgba(124,77,255,0.8); }
.gr-chip i { flex: none; width: 28px; height: 28px; padding: 2px; border-radius: 50%; box-sizing: border-box; font-style: normal;
  background: conic-gradient(from 210deg, #c58bff, #7c4dff, #4f7bff, #6ad0ff, #ffd27a, #c58bff); }
.gr-chip i span { width: 100%; height: 100%; border-radius: 50%; display: grid; place-items: center; font: 700 9.5px/1 system-ui, sans-serif; letter-spacing: 0.04em;
  text-transform: uppercase; color: #fff; background: linear-gradient(135deg, #8b5cf6, #4338ca 60%, #1e3a8a); box-shadow: 0 0 0 1.5px rgba(16,7,34,0.85); }
.gr-chip b { font-weight: 650; letter-spacing: 0.01em; overflow: hidden; text-overflow: ellipsis; }
.gr-chip em { font-style: normal; opacity: 0.72; }
:global(.day-mode) .gr-chip { color: #6e3f16; background: rgba(255,250,242,0.72);
  box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 16px -4px rgba(192,112,42,0.45); }
:global(.day-mode) .gr-chip:hover { background: rgba(255,250,242,0.88); }
:global(.day-mode) .gr-chip i { background: conic-gradient(from 210deg, #ffb36b, #ffd27a, #e9a23b, #c0702a, #ffb36b); }
:global(.day-mode) .gr-chip i span { background: linear-gradient(135deg, #ffb36b, #c0702a); box-shadow: 0 0 0 1.5px rgba(255,250,242,0.95); }
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
