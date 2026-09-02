// User display preferences (Settings → font style / text size), applied
// app-wide (founder 2026-09-01: "will it be changed everywhere?"). Font is
// a CSS variable the base stack reads (--app-font); size scales the ROOT
// font-size so every rem-based measure scales together. Admin/staff/landing
// keep their deliberate brand faces (DM Sans/Mono, Cinzel, Syne). Called at
// boot from main.js and on every change/reset via JinniChat.applySettings.
// An Armenian face is in EVERY stack on purpose, and it MATCHES the stack's
// style: --app-font REPLACES the whole body stack (genie-theme.css), and none
// of Georgia / Palatino / Optima / the slabs carries Armenian. Without one,
// picking any non-Standard option brought back the per-character OS
// substitution Arsen reported 2026-08-24 ("some characters bolder than
// others"). Serif stacks take 'Noto Serif Armenian' and the sans stacks take
// 'Noto Sans Armenian' — pairing a serif Latin with a sans Armenian put two
// styles inside one sentence, which reads as broken rather than as a choice.
// Keep it last before the generic.
//
// The 'modern' key is historical: the option used to be geometric (Avenir
// Next / Futura), which read Bauhaus-cold against the parchment-and-gold day
// palette, and resolved to nothing on Android — where it silently became
// Standard. It is now Optima/Candara, a humanist face whose stroke modulation
// reads carved rather than drawn, and which shares Hermann Zapf's logic with
// the Palatino behind 'elegant'. The key stays 'modern' because it is
// persisted in localStorage and server-side settings; only the label changed
// (settings.display.font_modern -> "Warm").
export const FONT_STACKS = {
  standard: '',
  classic: "Georgia, 'Times New Roman', 'Noto Serif Armenian', serif",
  elegant: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Noto Serif Armenian', serif",
  modern: "Optima, Candara, 'Gill Sans', 'Gill Sans MT', 'Segoe UI', 'Noto Sans Armenian', sans-serif",
  // Slab: the axis the other four miss (neutral sans / two old-style serifs /
  // humanist sans). Reads like a field guide or a stamped travel journal, which
  // suits the app better than a third calligraphic face. Zilla Slab is webfont-
  // loaded so this is a real choice on Android too, where American Typewriter
  // and Rockwell do not exist and every other option collapses to Standard.
  journal: "'American Typewriter', Rockwell, 'Zilla Slab', 'Noto Serif Armenian', Georgia, serif",
};

export function applyDisplayPrefs(settings = null) {
  try {
    let s = settings;
    if (!s) { try { s = JSON.parse(localStorage.getItem('jinni_settings') || '{}'); } catch (e) { s = {}; } }
    const size = s.textSize || 'normal';
    document.documentElement.style.fontSize = size === 'small' ? '93.75%' : size === 'big' ? '112.5%' : '';
    // Stamp the choice for CSS that needs EXACT per-size values (e.g. the
    // itinerary region overlap, hand-tuned per size by the founder).
    document.documentElement.setAttribute('data-text-size', size);
    // Font stamp too: serif faces carry their optical mass differently, and
    // icon-beside-text controls want per-font sub-pixel nudges (SVGs cannot
    // take a font — they are drawings, so the correction is positional).
    document.documentElement.setAttribute('data-font-style', s.fontStyle || 'standard');
    const stack = FONT_STACKS[s.fontStyle || 'standard'] || '';
    if (stack) document.documentElement.style.setProperty('--app-font', stack);
    else document.documentElement.style.removeProperty('--app-font');
  } catch (e) { /* display prefs must never break a page */ }
}
