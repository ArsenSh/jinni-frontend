// Browser-chrome tint (<meta name="theme-color">) — split by pointer type.
//
// One meta can't serve two masters (found 2026-08-22): on iPhone Safari the
// URL bar sits at the BOTTOM, so the meta must carry the page's bottom edge
// (device-settled 2026-08-21). But macOS Safari's toolbar sits at the TOP and
// reads the SAME meta — Arsen saw the ocean-blue page bottom painted across
// the desktop tab bar. Safari honors the `media` attribute on theme-color, so:
//
//   media="(pointer: coarse)"  → touch devices (iPhone/iPad): BOTTOM edge
//   media="(pointer: fine)"    → desktop (Safari macOS, Chrome): TOP edge
//
// Replace-on-change quirk kept from App.vue: several iOS versions ignore
// content edits on an existing meta during SPA navigation but re-read a
// freshly inserted one — so a changed color REPLACES the node.

const SLOTS = [
    { media: '(pointer: coarse)', pick: (c) => c.bottom },
    { media: '(pointer: fine)', pick: (c) => c.top },
];

function setThemeColorMeta({ top, bottom }) {
    const colors = { top, bottom };
    for (const slot of SLOTS) {
        const want = slot.pick(colors);
        if (!want) continue;
        let meta = document.querySelector(`meta[name="theme-color"][media="${slot.media}"]`);
        if (meta && meta.getAttribute('content') !== want) { meta.remove(); meta = null; }
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            meta.setAttribute('media', slot.media);
            meta.setAttribute('content', want);
            document.head.appendChild(meta);
        }
    }
    // Any legacy un-scoped meta would override/conflict per tree order — drop it.
    document.querySelectorAll('meta[name="theme-color"]:not([media])').forEach(m => m.remove());
}

/** Current {top, bottom} the metas carry (for save/restore flows). */
function getThemeColorMeta() {
    return {
        bottom: document.querySelector('meta[name="theme-color"][media="(pointer: coarse)"]')?.getAttribute('content') ?? null,
        top: document.querySelector('meta[name="theme-color"][media="(pointer: fine)"]')?.getAttribute('content') ?? null,
    };
}

export { setThemeColorMeta, getThemeColorMeta };
