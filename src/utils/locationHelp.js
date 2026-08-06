// src/utils/locationHelp.js
//
// Detects the user's OS + browser so we can show the correct
// "how to unblock location" instructions. UA sniffing is imperfect,
// but for help text the worst case is the generic fallback.

export function detectPlatform() {
  const ua = navigator.userAgent || '';

  // iPadOS 13+ reports as MacIntel but has a touch screen
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // On iOS every browser is WebKit, but the Location toggle is per-app.
    // Chrome / Edge / Firefox on iOS all live under their own app entry.
    if (/CriOS|EdgiOS|FxiOS/.test(ua)) return 'ios-chrome';
    return 'ios-safari';
  }

  if (/Android/.test(ua)) {
    if (/SamsungBrowser/.test(ua)) return 'android-samsung';
    if (/Firefox/.test(ua)) return 'android-firefox';
    return 'android-chrome';
  }

  // Desktop. Order matters: Edge/Opera UA strings also contain "Chrome".
  if (/Edg\//.test(ua)) return 'desktop-chrome'; // Edge uses the Chromium UI
  if (/OPR\//.test(ua)) return 'desktop-chrome';
  if (/Firefox/.test(ua)) return 'desktop-firefox';
  if (/Chrome/.test(ua)) return 'desktop-chrome';
  if (/Safari/.test(ua)) return 'desktop-safari';

  return 'desktop-generic';
}

// Returns the i18n key for the right set of instructions, e.g.
// "location_help.android-chrome". Use with $t(...).
export function locationHelpKey() {
  return `location_help.${detectPlatform()}`;
}