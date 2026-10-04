<template>
  <!-- A guide's Instagram reel showing ONLY the video (founder 2026-10-05: Instagram's box
       "looks like колхоз" — its account header, likes, caption; LandingLab
       guide-reel-crop.html). The embed is a sealed box, but its layout is fixed: a 54px
       header, a 4:5 media area with the 9:16 reel centred in it, then the footer. This is
       a window exactly the size of the video with the box shifted behind it. One tap
       plays — Instagram's own player; it cannot be started from outside. A plain post
       link (/p/) has no known shape, so only its header and footer are cut.
       The parent sets the video's height with --reel-h (675px at most: the embed stops
       growing at 540px wide). If Instagram changes its layout, the numbers here move. -->
  <div class="reel-crop" :class="{ post: isPost }" @click.stop>
    <iframe :src="embed" title="Instagram reel" scrolling="no" allowtransparency="true" allow="encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation" referrerpolicy="strict-origin-when-cross-origin"></iframe>
    <a class="reel-ig" :href="postUrl" target="_blank" rel="noopener" :aria-label="igLabel" :title="igLabel" @click.stop>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" class="f"/></svg>
    </a>
  </div>
</template>

<script>
export default {
  name: 'ReelCrop',
  props: {
    embed: { type: String, required: true },          // https://www.instagram.com/<reel|p|tv>/<code>/embed (utils/guides instagramEmbed)
    igLabel: { type: String, default: 'Instagram' },
  },
  computed: {
    postUrl() { return this.embed.replace(/embed\/?$/, '') },
    isPost() { return /instagram\.com\/p\//i.test(this.embed) },
  },
}
</script>

<style scoped>
.reel-crop { --h: var(--reel-h, min(86vh, 675px)); --hdr: 54px; flex: none;
  position: relative; height: var(--h); width: calc(var(--h) * 9 / 16); overflow: hidden; border-radius: 14px; background: #000;
  box-shadow: 0 0 24px -6px rgba(0,0,0,0.6); }
.reel-crop iframe { position: absolute; border: 0; background: #000; max-width: none;
  top: calc(var(--hdr) * -1 - 1px);                                   /* the header, out of sight (1px of overscan) */
  width: calc(var(--h) / 1.25 + 2px);                                 /* the 4:5 media area is as tall as the window */
  left: calc((var(--h) * 9 / 16 - var(--h) / 1.25 - 2px) / 2);        /* centred: the black side bars fall outside */
  height: calc(var(--h) + var(--hdr) + 260px); }                      /* the footer, below the window */
/* a post link: the whole 4:5 media area, header and footer cut */
.reel-crop.post { --h: min(var(--reel-h, min(86vh, 675px)), calc(92vw * 1.25)); width: calc(var(--h) / 1.25); }
.reel-crop.post iframe { left: -1px; }
/* the one thing added: a small Instagram mark that opens the original post */
.reel-ig { position: absolute; left: 10px; bottom: 10px; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #fff; text-decoration: none;
  background: rgba(16,7,34,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.35);
  transition: background-color 0.2s ease, box-shadow 0.2s ease; }
.reel-ig:hover { background: rgba(16,7,34,0.7); box-shadow: inset 0 0 0 0.75px rgba(255,255,255,0.6); }
.reel-ig svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.6; }
.reel-ig svg .f { fill: currentColor; stroke: none; }
</style>
