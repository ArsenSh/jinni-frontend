// User display preferences (Settings → font style / text size), applied
// app-wide (founder 2026-09-01: "will it be changed everywhere?"). Font is
// a CSS variable the base stack reads (--app-font); size scales the ROOT
// font-size so every rem-based measure scales together. Admin/staff/landing
// keep their deliberate brand faces (DM Sans/Mono, Cinzel, Syne). Called at
// boot from main.js and on every change/reset via JinniChat.applySettings.
export const FONT_STACKS = {
  standard: '',
  classic: "Georgia, 'Times New Roman', serif",
  elegant: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
  modern: "'Avenir Next', Futura, 'Century Gothic', 'Trebuchet MS', sans-serif",
};

export function applyDisplayPrefs(settings = null) {
  try {
    let s = settings;
    if (!s) { try { s = JSON.parse(localStorage.getItem('jinni_settings') || '{}'); } catch (e) { s = {}; } }
    const size = s.textSize || 'normal';
    document.documentElement.style.fontSize = size === 'small' ? '93.75%' : size === 'big' ? '112.5%' : '';
    const stack = FONT_STACKS[s.fontStyle || 'standard'] || '';
    if (stack) document.documentElement.style.setProperty('--app-font', stack);
    else document.documentElement.style.removeProperty('--app-font');
  } catch (e) { /* display prefs must never break a page */ }
}
