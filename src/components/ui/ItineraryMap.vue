<template>
  <!-- Fullscreen teleports to <body> so the fixed overlay escapes any
       transformed/filtered ancestor (same approach as RecommendationMap). -->
  <Teleport to="body" :disabled="!fullscreen">
    <div v-if="mappable.length" class="itin-map" :class="[theme, { 'is-open': expanded, 'is-fullscreen': fullscreen, 'popup-open': popupOpen, 'has-cards': showCards, 'nav-mode': navMode }]">
      <!-- Bar: tap the text to open/close the inline map; one fullscreen button.
           Same pattern as RecommendationMap's rec-map-bar, but the itinerary map
           defaults to OPEN (the day route is core content here, not a supplement)
           and the user's explicit choice is remembered across sessions. -->
      <div v-show="!fullscreen" class="itin-map-bar">
        <button class="itin-map-toggle" type="button" :aria-expanded="expanded ? 'true' : 'false'" @click="toggleExpanded">
          <span class="itin-map-toggle-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            <span>{{ expanded ? hideLabel : showLabel }}</span>
            <span class="itin-map-count">{{ mappable.length }}</span>
          </span>
          <!-- chevron is a state indicator only — clicking anywhere on this button toggles -->
          <svg class="itin-map-chevron" :class="{ open: expanded }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="itin-map-bar-actions">
          <button class="itin-map-iconbtn" type="button" :title="openFullscreenLabel" @click.stop="enterFullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>
      <!-- Animated reveal. Body stays in the DOM so Leaflet measures a real box. -->
      <div class="itin-map-body">
      <div class="itin-map-stage">
        <div ref="mapEl" class="itin-map-canvas"></div>

        <!-- Route summary — bottom-centre glass pill (mirrors rec-map-routeinfo).
             Day-route overview only (hidden while navigating to one stop).
             The mode button cycles the route style available for this trip:
             discovery = vector ⇄ car; nearby = walk → car → vector. -->
        <div v-if="mappable.length >= 2 && !navMode" class="itin-map-routeinfo" :class="{ 'itin-map-routeinfo--soft': !routeSummary }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
          <span>{{ routeText }}</span>
          <button v-if="routeStyles.length > 1" type="button" class="itin-map-routeinfo-mode" :title="routeStyleLabel" @click.stop="cycleRouteStyle">
            <svg v-if="routeStyle === 'car'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
            <svg v-else-if="routeStyle === 'walk'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="m14 12 2 2v6"/><path d="m10 9-2 3 3 2-1 6"/><path d="m8 22 2-8"/><path d="M15 13.5 17.5 12 19 9"/></svg>
            <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><line x1="7.6" y1="17.4" x2="16.4" y2="6.6"/></svg>
          </button>
        </div>

        <!-- Nav-route summary chip — distance / duration + exit (navigation mode).
             Same glass pill; distance/time count down as you drive (route-trim ratio). -->
        <div v-if="navMode && navInfo && !arrived" class="itin-map-routeinfo itin-map-navinfo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="{ color: dayColor }"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
          <span>{{ fmtDistance(navInfo.distance) }}<template v-if="navInfo.duration != null"> &middot; {{ fmtDuration(navInfo.duration) }}</template></span>
          <button class="itin-map-navinfo-clear" type="button" :title="exitRouteLabel" @click.stop="exitNav">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Turn-by-turn banner — next maneuver + metres to it (nav mode only) -->
        <div v-if="navMode && navStep && !arrived && !wrongWay" class="itin-map-maneuver">
          <span class="itin-map-maneuver-ic" :style="{ color: dayColor }" v-html="maneuverSvg(navStep.type)"></span>
          <div class="itin-map-maneuver-body">
            <div class="itin-map-maneuver-dist">{{ fmtDistance(navStep.distance) }}</div>
            <div v-if="navStep.instruction" class="itin-map-maneuver-instr">{{ navStep.instruction }}</div>
          </div>
        </div>
        <!-- Wrong-way warning — you're driving against the route; turn around -->
        <div v-if="navMode && wrongWay && !arrived" class="itin-map-maneuver itin-map-maneuver--warn">
          <span class="itin-map-maneuver-ic" v-html="maneuverSvg(9)"></span>
          <div class="itin-map-maneuver-body">
            <div class="itin-map-maneuver-dist">{{ wrongWayLabel }}</div>
            <div class="itin-map-maneuver-instr">{{ wrongWayHint }}</div>
          </div>
        </div>
        <!-- Arrival banner — shown when the destination is reached -->
        <div v-if="navMode && arrived" class="itin-map-arrive">
          <span class="itin-map-arrive-ic" :style="{ color: dayColor }">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22V4"/><path d="M5 4h11l-1.5 3.2L16 10H5"/><rect x="5" y="4" width="3.6" height="3" fill="currentColor" stroke="none"/><rect x="12.4" y="4" width="3.6" height="3" fill="currentColor" stroke="none" opacity="0.55"/><rect x="8.6" y="7" width="3.8" height="3" fill="currentColor" stroke="none" opacity="0.55"/></svg>
          </span>
          <div class="itin-map-arrive-body">
            <div class="itin-map-arrive-title">{{ arriveLabel }}</div>
            <div v-if="destName" class="itin-map-arrive-sub">{{ destName }}</div>
          </div>
        </div>

        <!-- Transient glass toast (location-permission message, etc.) -->
        <div v-if="locateMsg" class="itin-map-toast">{{ locateMsg }}</div>

        <!-- Place carousel (fullscreen, browse mode): swipe through the day's stops
             in visit order; the centred card is emphasised and the map flies to it.
             Same interaction & glass as RecommendationMap's rec-map-cards, now with
             the same "Tap for distance" route CTA per card. -->
        <div v-show="showCards" ref="cardsEl" class="itin-map-cards" @scroll.passive="onCardsScroll" @scrollend="onCardSettle">
          <div
            v-for="(s, i) in mappable"
            :key="s.slotId || i"
            class="itin-map-card"
            :class="{ 'is-active': i === activeCard }"
            :style="cardStyle(s.place)"
            role="button"
            tabindex="0"
            @click="onCardClick(i)"
            @keydown.enter="onCardClick(i)"
          >
            <div class="itin-map-card-photo" :style="cardPhotoStyle(s.place)">
              <span class="itin-map-card-num" :style="{ background: dayColor }">{{ i + 1 }}</span>
            </div>
            <div class="itin-map-card-info">
              <div class="itin-map-card-name">{{ s.place.name || placeFallbackLabel }}</div>
              <div v-if="s.time || s.place.region" class="itin-map-card-cat">
                <template v-if="s.time">{{ s.time }}</template>
                <template v-if="s.time && s.place.region"> &middot; </template>
                <template v-if="s.place.region">{{ s.place.region }}</template>
              </div>
              <div v-if="cardRoutes[i]" class="itin-map-card-route" :style="{ color: dayColor }">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
                <span>{{ fmtDistance(cardRoutes[i].distance) }}<template v-if="cardRoutes[i].duration != null"> &middot; {{ fmtDuration(cardRoutes[i].duration) }}</template></span>
              </div>
              <div v-else-if="cardLoading === i" class="itin-map-card-route itin-map-card-route--loading">
                <span class="itin-map-card-spinner"></span><span>{{ routingLabel }}</span>
              </div>
              <!-- The single source for computing a route/distance: an explicit tap.
                   Hidden in public/share mode (routing needs an authed account). -->
              <button v-else-if="!publicMode" type="button" class="itin-map-card-route itin-map-card-route--cta" @click.stop="onCardRoute(i)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
                <span>{{ showRouteLabel }}</span>
              </button>
            </div>
          </div>
        </div>



        <!-- Close / Exit-route — glass chip, top-right (mirrors rec-map-close-fs).
             Fullscreen only: the inline "enter fullscreen" action lives in the
             bar above the map now. In nav mode it becomes a back arrow. -->
        <button v-show="fullscreen" class="itin-map-close-fs" type="button" :title="navMode ? exitRouteLabel : closeLabel" @click.stop="onCloseButton">
          <svg v-if="navMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- Locate me (GPS), only in fullscreen, sits just under the close button -->
        <button v-show="fullscreen" class="itin-map-locate-fs" :class="{ 'is-busy': locating }" type="button" :title="locateTitle" @click.stop="goToMyLocation">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <circle cx="12" cy="12" r="7" stroke-dasharray="2 2"/>
          </svg>
        </button>

        <!-- Travel-mode switcher (car ⇄ walking) — under the locate button, only while navigating -->
        <button v-show="navMode" class="itin-map-modeswitch" :class="{ 'is-busy': navRouting }" type="button" :title="navProfile === 'driving-car' ? modeCarLabel : modeWalkLabel" @click.stop="toggleNavProfile">
          <svg v-if="navProfile === 'driving-car'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="16.5" r="0.7"/><circle cx="16.5" cy="16.5" r="0.7"/><path d="M5 13h14"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="13.5" cy="3.5" r="2"/><path d="M9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/></svg>
        </button>
      </div>
      </div><!-- /itin-map-body -->
    </div>
  </Teleport>
</template>

<script>
/* Visual design mirrors RecommendationMap.vue 1:1 — same Carto tiles, the same
   --rm-* glass control variables, photo-pins with numbered badges, frosted
   popup + action pills. Behaviour is now a superset of the original:
   an ordered day-route overview (numbered visit order + one connected
   multi-waypoint path) PLUS the full navigator ported from RecommendationMap —
   locate-me (GPS + IP fallback), live tracking, per-card "tap for distance",
   and turn-by-turn navigation to a single stop (maneuver banner, wrong-way
   warning, arrival banner, snapped driver puck, heading-up rotation,
   speed-matched zoom, live re-routing). */
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('/api/')) return `${API_BASE}${url}`;
  return url;
}

// Tiles match RecommendationMap / MapSelector: voyager (day) / light_all (night).
// CARTO began requiring a (free) basemap API key — without one the label
// tiles render every street/place name as "api_key_required" (live
// 2026-08-31). Free key: carto.com/basemaps/apikey → set VITE_CARTO_KEY at
// build time. Empty key keeps the old keyless URLs (graceful, not fixed).
const CARTO_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CARTO_KEY) || '';
const TILE_KEY = CARTO_KEY ? `?key=${CARTO_KEY}` : '';
const TILE_DAY   = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${TILE_KEY}`;
const TILE_NIGHT = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${TILE_KEY}`;
// Self-hosted tiles (Protomaps .pmtiles served by OUR backend — founder
// doctrine 2026-08-31, after CARTO's "api_key_required" watermark + 14-day
// trial): set VITE_PMTILES_URL (e.g. https://api.jinni.travel/tiles/jinni.pmtiles)
// and the maps render from OUR archive via protomaps-leaflet — no third-party
// tile service at all, $0, no expiry. Unset = CARTO URLs above.
const PMTILES_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PMTILES_URL) || '';

// Leaflet is loaded from a CDN at runtime (shared promise with the other maps —
// injected only once). leaflet-rotate adds map.setBearing() for heading-up
// navigation. Best-effort: if it can't load we resolve anyway and the map
// simply stays north-up. Same loader logic as RecommendationMap so whichever
// map initialises first provides the plugin for both.
let leafletPromise = null;
function loadLeaflet() {
  if (typeof window !== 'undefined' && window.L && window.L.Map && window.L.Map.prototype.setBearing && (!PMTILES_URL || window.protomapsL)) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const done = () => resolve(window.L);
    // protomaps-leaflet (UMD binds to the global L, same CDN approach) —
    // loaded only when self-hosted tiles are configured. Best-effort: a
    // failed load falls back to the raster tile layer.
    const addProtomaps = () => {
      if (!PMTILES_URL || (window.protomapsL && window.protomapsL.leafletLayer)) return done();
      const pm = document.createElement('script');
      pm.src = 'https://unpkg.com/protomaps-leaflet@5/dist/protomaps-leaflet.js';
      pm.onload = done; pm.onerror = done;
      document.head.appendChild(pm);
    };
    const addRotate = () => {
      if (window.L && window.L.Map.prototype.setBearing) return addProtomaps();
      const p = document.createElement('script');
      p.src = 'https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate.js';
      p.onload = addProtomaps; p.onerror = addProtomaps;
      document.head.appendChild(p);
    };
    if (window.L && window.L.map) return addRotate();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = addRotate;
    script.onerror = () => { leafletPromise = null; reject(new Error('Leaflet failed to load')); };
    document.head.appendChild(script);
  });
  return leafletPromise;
}

// Driving marker: a Google-style navigation chevron (coloured fill, white
// casing), pointing "up". Heading is applied by rotating the wrapper (north-up)
// or by rotating the whole map (heading-up), so the glyph itself stays upright.
function navArrowSvg(color) {
  return `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M12 2.4 L19.4 20.4 a0.6 0.6 0 0 1-0.85 0.72 L12 17.6 L5.45 21.12 a0.6 0.6 0 0 1-0.85-0.72 Z" fill="${color || '#1a73e8'}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

// Remembered show/hide state for the inline day map. Defaults to OPEN — an
// itinerary is spatial content, so the route map should be visible unless the
// user has explicitly hidden it before. try/catch guards privacy modes where
// localStorage throws. Only explicit bar toggles persist (fullscreen doesn't).
const EXPAND_PREF_KEY = 'jinni-itin-map-open';
function readExpandPref() {
  try { const v = localStorage.getItem(EXPAND_PREF_KEY); return v == null ? true : v === '1'; }
  catch { return true; }
}

export default {
  name: 'ItineraryMap',
  props: {
    /** Ordered, enriched stops of ONE day: [{ slotId, time, place:{...} }] */
    stops: { type: Array, default: () => [] },
    /** Optional home-base anchor: { name, lat, lng } */
    homeBase: { type: Object, default: null },
    theme: { type: String, default: 'day-mode' },
    /** Day accent used for the route line + pin rims. */
    dayColor: { type: String, default: '#4285F4' },
    routeProfile: { type: String, default: 'foot-walking' },
    /** 'roads' → real ORS route with distance/time chip (Nearby mode);
     *  'vector' → straight connecting lines between stops (Discovery mode —
     *  city-scale trips don't need a walking route or its cost). */
    routeMode: { type: String, default: 'roads' },
    /** Language for turn-by-turn instructions (ORS code, e.g. 'en', 'ru', 'fr'). */
    routeLanguage: { type: String, default: 'en' },
    /** Public/share mode: the map is rendered for a viewer with NO Jinni account,
     *  so every feature that calls an authenticated backend route is removed —
     *  the route-style cycle (walk/car → /api/routing/itinerary-route) and the
     *  per-card "tap for distance" + turn-by-turn nav (→ /api/routing/directions).
     *  What stays works with zero auth: the vector day-path, fullscreen, the
     *  browse carousel, pin popups (Details + external Google/Yandex directions +
     *  Call + Website), and GPS locate-me. */
    publicMode: { type: Boolean, default: false },
    // Coarse IP-based geolocation fallback for devices without GPS (same as rec-map).
    ipFallback: { type: Boolean, default: true },
    ipLocationUrl: { type: String, default: 'https://ipwho.is/' },
    // labels (parent passes translated strings)
    showLabel: { type: String, default: 'Show on map' },
    hideLabel: { type: String, default: 'Hide map' },
    openFullscreenLabel: { type: String, default: 'Open full screen' },
    closeLabel: { type: String, default: 'Close (Esc)' },
    modeCarLabel: { type: String, default: 'Driving' },
    modeWalkLabel: { type: String, default: 'Walking' },
    straightLineLabel: { type: String, default: 'Approximate path' },
    detailsLabel: { type: String, default: 'Details' },
    directionsLabel: { type: String, default: 'Directions' },
    transitLabel: { type: String, default: 'Transit' },
    callLabel: { type: String, default: 'Call' },
    websiteLabel: { type: String, default: 'Website' },
    placeFallbackLabel: { type: String, default: 'Place' },
    // Tier labels — same defaults as RecommendationMap; overridable for i18n.
    tierSignatureLabel: { type: String, default: "Jinni's Signature" },
    tierSpotlightLabel: { type: String, default: "Jinni's Spotlight" },
    tierVerifiedLabel: { type: String, default: 'Jinni Verified' },
    unitKm: { type: String, default: 'km' },
    unitMeter: { type: String, default: 'm' },
    unitMinute: { type: String, default: 'min' },
    unitHour: { type: String, default: 'h' },
    // Locate-me / geolocation labels (ported from RecommendationMap)
    locateTitle: { type: String, default: 'My location' },
    youAreHereLabel: { type: String, default: 'You are here' },
    locationDeniedLabel: { type: String, default: "Location is off. Turn it on for this site in your browser/phone settings to use this." },
    locationUnavailableLabel: { type: String, default: "Couldn't get your location. Please try again." },
    locationUnsupportedLabel: { type: String, default: "This device can't pinpoint your location." },
    locationApproxLabel: { type: String, default: 'Using your approximate location.' },
    // Navigation labels (ported from RecommendationMap)
    routingLabel: { type: String, default: 'Finding route\u2026' },
    routeErrorLabel: { type: String, default: "Couldn't find a route." },
    showRouteLabel: { type: String, default: 'Tap for distance' },
    exitRouteLabel: { type: String, default: 'Exit route' },
    arriveLabel: { type: String, default: "You've arrived" },
    uturnLabel: { type: String, default: 'Make a U-turn' },
    wrongWayLabel: { type: String, default: 'Turn around' },
    wrongWayHint: { type: String, default: 'You\u2019re heading away from the route' },
  },
  emits: ['stop-click', 'view-details'],
  data() {
    return {
      L: null, map: null, tileLayer: null, markerLayer: null, routeLayer: null,
      expanded: readExpandPref(),   // inline show/hide (bar toggle); open by default
      fullscreen: false, routing: false, routeFallback: false, popupOpen: false,
      profile: this.routeProfile,
      // Active route rendering style. Nearby trips default to a real walking
      // route; discovery trips default to cheap vector lines (no ORS call until
      // the user asks for a car/walk route via the cycle button).
      // Public shares never call the (authenticated) road-route endpoint, so
      // they always start — and stay — on the free vector path.
      routeStyle: this.publicMode ? 'vector' : (this.routeMode === 'roads' ? 'walk' : 'vector'),
      routeDistance: null, routeDuration: null,
      _routeToken: 0, _markers: [],
      activeCard: 0, _flownTo: null, _cardRaf: null, _cardSettleT: null,
      // ── Ported navigator state (rec-map parity) ──
      locating: false, locateMsg: null, locationMarker: null, accuracyCircle: null, myCoords: null,
      navMode: false, navLayer: null, navInfo: null, navRouting: false,
      navProfile: 'foot-walking',   // nav travel mode (independent of the day-route profile)
      navStep: null, arrived: false, destName: '', wrongWay: false,
      cardRoutes: {}, cardLoading: null,
    };
  },
  computed: {
    mappable() {
      return (this.stops || []).filter(s =>
        Number.isFinite(s?.place?.latitude) && Number.isFinite(s?.place?.longitude));
    },
    pathPoints() {
      const pts = this.mappable.map(s => ({ lat: s.place.latitude, lng: s.place.longitude }));
      if (this.homeBase && Number.isFinite(this.homeBase.lat) && Number.isFinite(this.homeBase.lng)) {
        return [{ lat: this.homeBase.lat, lng: this.homeBase.lng }, ...pts, { lat: this.homeBase.lat, lng: this.homeBase.lng }];
      }
      return pts;
    },
    // The carousel only shows in fullscreen browse mode (nav mode takes over the
    // screen with its own framing + summary chip — same rule as rec-map).
    showCards() { return this.fullscreen && !this.navMode && this.mappable.length > 0; },
    // Which route styles the cycle button offers. Nearby adds a real walking
    // route; every trip can toggle between a driving route and vector lines.
    // Public shares get vector only → routeStyles.length === 1 hides the
    // route-style cycle button (its only other options call the authed ORS route).
    routeStyles() {
      if (this.publicMode) return ['vector'];
      return this.routeMode === 'roads' ? ['walk', 'car', 'vector'] : ['vector', 'car'];
    },
    // Pill text: distance/time for a real route, else the "approximate path" label.
    routeText() {
      if (this.routeStyle === 'vector') return this.straightLineLabel;
      if (this.routeSummary) return this.routeSummary;
      return this.routing ? '…' : this.straightLineLabel;
    },
    routeStyleLabel() {
      return this.routeStyle === 'car' ? this.modeCarLabel
        : this.routeStyle === 'walk' ? this.modeWalkLabel
        : this.straightLineLabel;
    },
    routeSummary() {
      if (!Number.isFinite(this.routeDistance)) return null;
      const km = this.routeDistance / 1000;
      const dist = km >= 1 ? `${km.toFixed(km >= 10 ? 0 : 1)} ${this.unitKm}` : `${Math.round(this.routeDistance)} ${this.unitMeter}`;
      let dur = '';
      if (Number.isFinite(this.routeDuration)) {
        const mins = Math.round(this.routeDuration / 60);
        dur = mins >= 60 ? ` · ${Math.floor(mins / 60)}${this.unitHour} ${mins % 60}${this.unitMinute}` : ` · ${mins} ${this.unitMinute}`;
      }
      return `${dist}${dur}`;
    },
  },
  watch: {
    theme() {
      if (!this.tileLayer || !this.map) return;
      if (this._pmtiles) return;   // protomaps: one flavor serves both themes
      this.tileLayer.setUrl(this.tileUrl());
    },
    // Day switched / slots changed: any active navigation targets a stop that may
    // no longer exist — leave nav mode, drop cached card distances, re-render.
    stops: { handler() { this.cardRoutes = {}; if (this.navMode) this.exitNav(); this.$nextTick(this.render); }, deep: true },
    homeBase() { this.$nextTick(this.render); },
    routeMode(m) { this.routeStyle = m === 'roads' ? 'walk' : 'vector'; this.$nextTick(this.render); },
    routeLanguage() { this._navCache = null; },   // instructions are localized server-side
  },
  async mounted() {
    try { this.L = await loadLeaflet(); } catch (e) { console.error(e); return; }
    this.initMap();
    this.render();
    this.settleSize();
    this._onEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (this.navMode) this.exitNav();
      else if (this.fullscreen) this.exitFullscreen();
    };
    window.addEventListener('keydown', this._onEsc);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this._onEsc);
    if (this.fullscreen) document.body.style.overflow = this._prevBodyOverflow || '';
    clearTimeout(this._locateMsgTimer);
    clearTimeout(this._arriveTimer);
    this.stopLiveTracking();
    if (this.map) { this.map.remove(); this.map = null; }
  },
  methods: {
    tileUrl() { return this.theme === 'night-mode' ? TILE_NIGHT : TILE_DAY; },
    esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    num(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : null; },

    initMap() {
      const L = this.L;
      if (!this.$refs.mapEl || this.map) return;
      this.map = L.map(this.$refs.mapEl, {
        zoomControl: true, scrollWheelZoom: false, touchZoom: true,
        bounceAtZoomLimits: false, attributionControl: false,
        rotate: true, rotateControl: false, touchRotate: false, bearing: 0,
      });
      // True only if leaflet-rotate actually loaded and the device supports it.
      this._rotateEnabled = typeof this.map.setBearing === 'function' && !!this.map.options.rotate && !!(L.Browser && L.Browser.any3d);
      const usePm = PMTILES_URL && window.protomapsL && window.protomapsL.leafletLayer;
      this._pmtiles = !!usePm;
      this.tileLayer = usePm
        // Our own basemap. 'light' flavor for BOTH themes — the night map
        // deliberately uses light tiles (dark renders effectively invisible
        // here, settled decision above).
        ? window.protomapsL.leafletLayer({ url: PMTILES_URL, flavor: 'light', lang: 'en', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(this.map)
        : L.tileLayer(this.tileUrl(), { attribution: '', subdomains: 'abcd', maxZoom: 19, detectRetina: true }).addTo(this.map);
      this.markerLayer = L.layerGroup().addTo(this.map);
      this.map.on('popupopen', () => { this.popupOpen = true; });
      this.map.on('popupclose', () => { this.popupOpen = false; });
      this.map.setView([0, 0], 2);
      // First map init: show the "you are here" dot silently, but ONLY when
      // permission was already granted (never pops the OS dialog unasked).
      this.showMyLocationIfPermitted();
    },

    /** Numbered teardrop pin — photo variant when the place has an image,
     *  solid-fill variant otherwise. Mirrors RecommendationMap.markerIcon,
     *  including its tier behaviour: business stops take their tier colour
     *  (photo ring, tail and number badge all run off --pin-color), everything
     *  else keeps the day colour so the day identity still reads. */
    pinIcon(place, n) {
      const L = this.L;
      const color = this.tierColor(this.tierOf(place)) || this.dayColor;
      const img = resolveImg(place.image);
      if (img) {
        const safe = String(img).replace(/'/g, '%27');
        return L.divIcon({
          className: 'itin-pin-wrap',
          html: `<div class="itin-photo-pin" style="--pin-color:${color}">`
              + `<div class="itin-photo" style="background-image:url('${safe}')"></div>`
              + `<span class="itin-badge">${n}</span></div>`,
          iconSize: [46, 56], iconAnchor: [23, 56], popupAnchor: [0, -52],
        });
      }
      return L.divIcon({
        className: 'itin-pin-wrap',
        html: `<div class="itin-pin" style="--pin-color:${color}"><span>${n}</span></div>`,
        iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -34],
      });
    },

    homeIcon() {
      const L = this.L;
      return L.divIcon({
        className: 'itin-pin-wrap',
        html: `<div class="itin-home-pin" style="--pin-color:${this.dayColor}">`
            + `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${this.dayColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`
            + `</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
      });
    },

    /** Frosted popup — full-bleed image, name, category, action pills.
     *  Structure & classnames mirror RecommendationMap.popupHtml. */
    popupHtml(s) {
      const p = s.place;
      const name = this.esc(p.name || this.placeFallbackLabel);
      const cat = this.esc(s.category || '');
      const img = resolveImg(p.image);
      const safe = img ? String(img).replace(/'/g, '%27') : '';
      const lat = p.latitude, lng = p.longitude;

      const navIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>';
      const telIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
      const webIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
      const infoIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="11"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

      const phone = p.phone || '';
      const website = p.website || '';
      const telHref = phone ? 'tel:' + String(phone).replace(/[^\d+]/g, '') : '';
      // Prefill "from" with the user's known location (same as rec-map).
      const from = this.myCoords ? `${this.myCoords.lat},${this.myCoords.lng}` : '';
      const gUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const yUrl = `https://yandex.com/maps/?rtext=${from}~${lat},${lng}&rtt=auto`;
      const tUrl = `https://yandex.com/maps/?rtext=${from}~${lat},${lng}&rtt=mt`;

      const detailsBtn = `<button type="button" class="itin-pop-btn itin-pop-details">${infoIcon}<span>${this.esc(this.detailsLabel)}</span></button>`;
      const dirBtn = `<button type="button" class="itin-pop-btn itin-pop-dir-toggle">${navIcon}<span>${this.esc(this.directionsLabel)}</span></button>`;
      const callBtn = phone ? `<a class="itin-pop-btn" href="${telHref}">${telIcon}<span>${this.esc(this.callLabel)}</span></a>` : '';
      const webBtn = website ? `<a class="itin-pop-btn" href="${this.esc(website)}" target="_blank" rel="noopener">${webIcon}<span>${this.esc(this.websiteLabel)}</span></a>` : '';
      const dirMenu = `<div class="itin-pop-dirs">`
        + `<a class="itin-pop-dir" href="${gUrl}" target="_blank" rel="noopener">Google</a>`
        + `<a class="itin-pop-dir" href="${yUrl}" target="_blank" rel="noopener">Yandex</a>`
        + `<a class="itin-pop-dir" href="${tUrl}" target="_blank" rel="noopener">${this.esc(this.transitLabel)}</a>`
        + `</div>`;

      // Partner tier (business stops only) — same treatment as the rec map's
      // popup: soft tier-tinted body (JinniChat card-glow fills), tier-coloured
      // name via the itin-pop-body--{tier} class, and an icon+label row.
      const tier = this.tierOf(p);
      const tint = this.tierTint(tier);
      const bodyStyle = tint ? ` style="background:${tint}"` : '';
      const tierLbl = tier
        ? `<div class="itin-pop-tier itin-pop-tier--${tier}">${this.tierIconSvg(tier)}<span>${this.esc(this.tierLabel(tier))}</span></div>`
        : '';

      return `
        <div class="itin-pop">
          ${img ? `<div class="itin-pop-img" style="background-image:url('${safe}')"></div>` : ''}
          <div class="itin-pop-body${tier ? ' itin-pop-body--' + tier : ''}"${bodyStyle}>
            <div class="itin-pop-name">${name}</div>
            ${cat ? `<div class="itin-pop-cat">${cat}</div>` : ''}
            ${tierLbl}
            <div class="itin-pop-actions">${detailsBtn}${dirBtn}${callBtn}${webBtn}</div>
            ${dirMenu}
          </div>
        </div>`;
    },

    wirePopup(el, s) {
      // Directions chooser toggle (same interaction as rec-map).
      const dir = el.querySelector('.itin-pop-dir-toggle');
      if (dir && !dir._wired) {
        dir._wired = true;
        dir.addEventListener('click', () => { const pop = el.querySelector('.itin-pop'); if (pop) pop.classList.toggle('show-dirs'); });
      }
      const det = el.querySelector('.itin-pop-details');
      if (det && !det._wired) {
        det._wired = true;
        det.addEventListener('click', () => this.$emit('view-details', s.place));
      }
      // Pan so the popup's image + close button always stay on-screen (rec-map parity).
      this.centerPopup(el);
    },

    // Pan so the open popup is horizontally centred in the map and sits a little
    // below the vertical centre — but never so high that its top (image + close
    // button) clips off. Measures the real popup box, so it's correct for any pin
    // position and any map height (short inline map or fullscreen).
    // (Ported verbatim from RecommendationMap.centerPopup.)
    centerPopup(el) {
      if (!this.map || !el) return;
      this.$nextTick(() => {
        try {
          const mapRect = this.map.getContainer().getBoundingClientRect();
          const popRect = el.getBoundingClientRect();
          const dx = (popRect.left + popRect.width / 2) - (mapRect.left + mapRect.width / 2);
          const topSafe = mapRect.top + 14;
          const bottomSafe = mapRect.bottom - (this.showCards ? 132 : 76);
          let desiredTop = mapRect.top + (mapRect.height - popRect.height) / 2 + 20;
          if (desiredTop + popRect.height > bottomSafe) desiredTop = bottomSafe - popRect.height;
          if (desiredTop < topSafe) desiredTop = topSafe;
          const dy = popRect.top - desiredTop;
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.map.panBy([dx, dy], { animate: true, duration: 0.3 });
        } catch (e) { /* map busy / torn down */ }
      });
    },

    render() {
      const L = this.L;
      if (!L) return;
      // The container only exists once there's an enriched stop (v-if="mappable.length").
      // On first build, day 1 mounts while its stops are still enriching, so the
      // map couldn't init at mount — retry here the moment the container appears.
      if (!this.map) { this.initMap(); if (!this.map) return; this.settleSize(); }
      // Day switch can shrink the stop list — keep the carousel index valid.
      if (this.activeCard >= this.mappable.length) { this.activeCard = 0; this._flownTo = null; }
      this.markerLayer.clearLayers();
      this._markers = [];
      this._homeMarker = null;
      if (this.routeLayer) { this.map.removeLayer(this.routeLayer); this.routeLayer = null; }
      this.routeDistance = null; this.routeDuration = null; this.routeFallback = false;

      const pts = [];

      if (this.homeBase && Number.isFinite(this.homeBase.lat) && Number.isFinite(this.homeBase.lng)) {
        const home = L.marker([this.homeBase.lat, this.homeBase.lng], { icon: this.homeIcon(), zIndexOffset: 500 })
          .addTo(this.markerLayer);
        home.bindPopup(`<div class="itin-pop"><div class="itin-pop-body"><div class="itin-pop-name">${this.esc(this.homeBase.name || 'Home base')}</div></div></div>`, { closeButton: true, className: 'itin-map-popup', minWidth: 200, maxWidth: 260, autoPan: false });
        this._homeMarker = home;
        pts.push([this.homeBase.lat, this.homeBase.lng]);
      }

      this.mappable.forEach((s, i) => {
        const { latitude: lat, longitude: lng } = s.place;
        const marker = L.marker([lat, lng], { icon: this.pinIcon(s.place, i + 1), title: s.place.name || '', riseOnHover: true })
          .addTo(this.markerLayer);
        marker.bindPopup(this.popupHtml(s), { closeButton: true, className: 'itin-map-popup', minWidth: 300, maxWidth: 320, keepInView: false, autoPan: false });
        marker.on('popupopen', (e) => this.wirePopup(e.popup.getElement(), s));
        marker.on('click', () => {
          this.$emit('stop-click', s);
          if (this.showCards) {
            this.activeCard = i;
            this.highlightPin(i);
            this._flownTo = i;   // popup positioning wins; don't re-fly on settle
            this.$nextTick(() => this.scrollCardIntoView(i));
          }
        });
        this._markers.push(marker);
        pts.push([lat, lng]);
      });

      if (pts.length) {
        this.map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 16 });
        setTimeout(() => this.map && this.map.invalidateSize(), 120);
      }
      if (this.pathPoints.length >= 2) this.applyRouteStyle();
      if (this.showCards) this.highlightPin(this.activeCard);
    },

    /** Discovery mode: clean straight segments in visit order — no ORS call,
     *  no distance chip. Solid (unlike the dashed roads-fallback) so it reads
     *  as intentional, not as a failed route. */
    drawVectorPath() {
      const L = this.L;
      if (!this.map || this.pathPoints.length < 2) return;
      this._routeToken++;   // invalidate any in-flight roads fetch
      const casing = L.polyline(this.pathPoints.map(p => [p.lat, p.lng]), { color: '#ffffff', weight: 6, opacity: 0.8, interactive: false });
      const line = L.polyline(this.pathPoints.map(p => [p.lat, p.lng]), { color: this.dayColor, weight: 3, opacity: 0.8, interactive: false });
      this.routeLayer = L.layerGroup([casing, line]).addTo(this.map);
      this.routeDistance = null; this.routeDuration = null; this.routeFallback = false;
    },

    async fetchDayRoute() {
      if (this.publicMode) return;   // never hit the authed road-route endpoint on a share
      const L = this.L;
      const token = ++this._routeToken;
      this.routing = true;
      try {
        const res = await fetch(`${API_BASE}/api/routing/itinerary-route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify({ coordinates: this.pathPoints, profile: this.profile }),
        });
        const data = await res.json().catch(() => ({}));
        if (token !== this._routeToken || !this.map) return;
        if (this.routeLayer) { this.map.removeLayer(this.routeLayer); this.routeLayer = null; }
        if (data.success && data.geometry) {
          // Casing + coloured line, same layering idea as rec-map's route.
          const casing = L.geoJSON(data.geometry, { interactive: false, style: { color: '#ffffff', weight: 8, opacity: 0.9 } });
          const line = L.geoJSON(data.geometry, { interactive: false, style: { color: this.dayColor, weight: 4.5, opacity: 0.95 } });
          this.routeLayer = L.layerGroup([casing, line]).addTo(this.map);
          this.routeDistance = data.distance; this.routeDuration = data.duration;
          this.routeFallback = false;
        } else {
          this.drawStraightFallback();
        }
      } catch (_) {
        if (token === this._routeToken) this.drawStraightFallback();
      } finally {
        if (token === this._routeToken) this.routing = false;
      }
    },

    drawStraightFallback() {
      const L = this.L;
      if (!this.map || this.pathPoints.length < 2) return;
      this.routeLayer = L.polyline(this.pathPoints.map(p => [p.lat, p.lng]), {
        color: this.dayColor, weight: 3.5, opacity: 0.6, dashArray: '7 8', interactive: false,
      }).addTo(this.map);
      this.routeFallback = true;
    },

    /* ── Card carousel (same behaviour as rec-map-cards) ── */
    cardPhotoStyle(place) {
      const img = resolveImg(place.image);
      return img ? { backgroundImage: `url('${String(img).replace(/'/g, '%27')}')` } : {};
    },
    /* ── Partner tier — mirror of RecommendationMap's tierOf/tierColor/tierTint/
       tierLabel/tierIconSvg, keyed on the itinerary slot's stored place. A
       "business" = a partner listing (has verifiedId, or a db- rec id); verified
       DESTINATIONS are public sites and never carry tier colours (same rule as
       the chat and the rec map). */
    tierOf(p) {
      if (!p) return null;
      const isPartner = p.verifiedId || (p.id && String(p.id).startsWith('db-'));
      if (!isPartner) return null;
      if (p.verifiedModel === 'destination' || p._verifiedModel === 'destination') return null;
      const t = p.partnerTier;
      if (t === 'featured' || t === 'signature') return 'signature';
      if (t === 'spotlight') return 'spotlight';
      return 'verified';
    },
    tierColor(tier) {
      return tier === 'signature' ? '#D4AF37'
        : tier === 'spotlight' ? '#3b9edd'
        : tier === 'verified' ? '#4CAF50'
        : null;
    },
    // Soft tier-tint fills — identical to the rec map (and JinniChat's
    // .card-glow--* card backgrounds) so business stops read as the same
    // component across chat, rec map and itinerary map.
    tierTint(tier) {
      return tier === 'signature' ? 'rgba(212,175,55,0.2)'
        : tier === 'spotlight' ? 'rgba(59,158,221,0.1)'
        : tier === 'verified' ? 'rgba(76,175,80,0.15)'
        : null;
    },
    tierLabel(tier) {
      return tier === 'signature' ? this.tierSignatureLabel
        : tier === 'spotlight' ? this.tierSpotlightLabel
        : tier === 'verified' ? this.tierVerifiedLabel
        : '';
    },
    tierIconSvg(tier) {
      if (tier === 'signature') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      if (tier === 'spotlight') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5" stroke="none"/><line x1="12" y1="1.5" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.5"/><line x1="3.8" y1="3.8" x2="5.5" y2="5.5"/><line x1="18.5" y1="18.5" x2="20.2" y2="20.2"/><line x1="1.5" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.5" y2="12"/><line x1="3.8" y1="20.2" x2="5.5" y2="18.5"/><line x1="18.5" y1="5.5" x2="20.2" y2="3.8"/></svg>';
      if (tier === 'verified') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      return '';
    },
    // Soft tier tint behind the carousel card (rec-map's cardStyle recipe),
    // layered over the glass so business stops carry their tier colour.
    cardStyle(place) {
      const tint = this.tierTint(this.tierOf(place));
      return tint ? { '--im-card-tint': tint } : {};
    },
    nearestCard() {
      const el = this.$refs.cardsEl;
      if (!el) return null;
      const center = el.scrollLeft + el.clientWidth / 2;
      const cards = el.querySelectorAll('.itin-map-card');
      let best = null, bestD = Infinity;
      cards.forEach((c, i) => {
        const cc = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cc - center);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    },
    onCardsScroll() {
      if (!this._cardRaf) {
        this._cardRaf = requestAnimationFrame(() => {
          this._cardRaf = null;
          const i = this.nearestCard();
          if (i != null && i !== this.activeCard) { this.activeCard = i; this.highlightPin(i); }
        });
      }
      // scrollend fallback for browsers without the event (Safari < 17)
      clearTimeout(this._cardSettleT);
      this._cardSettleT = setTimeout(() => this.onCardSettle(), 160);
    },
    // Native scroll-snap has already centred the nearest card — read which one
    // and fly the map to it. Never scroll here (no second re-centring).
    onCardSettle() {
      const i = this.nearestCard();
      if (i == null) return;
      if (i !== this.activeCard) { this.activeCard = i; this.highlightPin(i); }
      if (i !== this._flownTo) {
        this._flownTo = i;
        const s = this.mappable[i];
        if (s && this.map) {
          this.map.flyTo([s.place.latitude, s.place.longitude], Math.max(this.map.getZoom(), 15), { duration: 0.5 });
        }
      }
    },
    onCardClick(i) {
      this.activeCard = i;
      this.highlightPin(i);
      this._flownTo = i;
      this.scrollCardIntoView(i);
      const s = this.mappable[i];
      if (s && this.map) {
        this.map.flyTo([s.place.latitude, s.place.longitude], Math.max(this.map.getZoom(), 15), { duration: 0.5 });
        this._markers[i]?.openPopup();
      }
      this.$emit('stop-click', s);
    },
    scrollCardIntoView(i, smooth = true) {
      const el = this.$refs.cardsEl;
      if (!el) return;
      const card = el.querySelectorAll('.itin-map-card')[i];
      if (!card) return;
      el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
    },
    // Emphasise the active stop's pin (others stay normal) — rec-map parity.
    highlightPin(i) {
      (this._markers || []).forEach((m, mi) => {
        if (!m._icon) return;
        m._icon.classList.toggle('itin-pin-active', i != null && mi === i);
      });
    },
    // keepIndex = the stop marker to keep visible (null = show all). Hides the
    // rest — including the home-base pin — while navigating to one stop.
    setPinsHidden(keepIndex) {
      (this._markers || []).forEach((m, mi) => {
        if (!m._icon) return;
        m._icon.classList.toggle('itin-pin-hidden', keepIndex != null && mi !== keepIndex);
      });
      if (this._homeMarker && this._homeMarker._icon) {
        this._homeMarker._icon.classList.toggle('itin-pin-hidden', keepIndex != null);
      }
    },

    // Render the currently selected style. Vector is free (client-side lines);
    // car/walk fetch a real ORS route. Clears any previous route layer first.
    // Skipped entirely while navigating — the nav route owns the map then.
    applyRouteStyle() {
      if (!this.map || this.pathPoints.length < 2 || this.navMode) return;
      if (this.routeLayer) { this.map.removeLayer(this.routeLayer); this.routeLayer = null; }
      this.routeDistance = null; this.routeDuration = null; this.routeFallback = false;
      if (this.routeStyle === 'vector') { this._routeToken++; this.drawVectorPath(); return; }
      this.profile = this.routeStyle === 'car' ? 'driving-car' : 'foot-walking';
      this.fetchDayRoute();
    },
    cycleRouteStyle() {
      if (this.publicMode) return;   // button is hidden; guard defensively
      const styles = this.routeStyles;
      const i = styles.indexOf(this.routeStyle);
      this.routeStyle = styles[(i + 1) % styles.length];
      this.applyRouteStyle();
    },

    // ── Inline show/hide (the bar above the map, rec-map parity) ──
    toggleExpanded() { this.expanded ? this.closeInline() : this.openInline(); },
    openInline() {
      this.expanded = true;
      this.persistExpandPref();
      // Re-measure once the reveal animation gives the canvas real height,
      // and re-frame the day route (same staggered pass as mount).
      this.$nextTick(() => this.settleSize());
      this.$emit('opened');
    },
    closeInline() { this.expanded = false; this.persistExpandPref(); },
    persistExpandPref() {
      try { localStorage.setItem(EXPAND_PREF_KEY, this.expanded ? '1' : '0'); } catch { /* privacy mode */ }
    },

    // The top-right button (fullscreen only): back-arrow exits the route, ✕ exits fullscreen.
    onCloseButton() {
      if (!this.fullscreen) return;
      if (this.navMode) return this.exitNav();
      this.exitFullscreen();
    },
    enterFullscreen() {
      // Keep the inline state coherent for when we exit fullscreen — but do NOT
      // persist: going fullscreen isn't the user choosing to show the inline map.
      this.expanded = true;
      this.fullscreen = true;
      // Lock the page behind the fullscreen overlay (prevents scroll bleed on mobile).
      this._prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Zoom to bottom-right for fullscreen (thumb-reachable, clear of the
      // top-right close button) — mirrors RecommendationMap.
      if (this.map && this.map.zoomControl) this.map.zoomControl.setPosition('bottomright');
      this.afterResize();
      this.$nextTick(() => {
        this.scrollCardIntoView(this.activeCard, false);
        this.highlightPin(this.activeCard);
        // If we already know where the user is, start following them live.
        this.ensureTracking();
      });
    },
    exitFullscreen() {
      this.fullscreen = false;
      if (this.navMode) this.exitNav();
      this.stopLiveTracking();          // drop the live GPS watch when the big map closes
      document.body.style.overflow = this._prevBodyOverflow || '';
      if (this.map && this.map.zoomControl) this.map.zoomControl.setPosition('topleft');
      this.highlightPin(null);
      this.afterResize();
    },
    afterResize() {
      this.$nextTick(() => setTimeout(() => {
        if (!this.map) return;
        this.map.invalidateSize();
        if (this.pathPoints.length && !this.navMode) this.map.fitBounds(this.L.latLngBounds(this.pathPoints.map(p => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 16 });
      }, 60));
    },
    // Re-measure across a few frames so the first paint lands correctly even
    // when the container was mid-layout at init (mirrors rec-map's staggered pass).
    settleSize() {
      [60, 220, 450].forEach(ms => setTimeout(() => {
        if (!this.map) return;
        this.map.invalidateSize();
        if (this.pathPoints.length && !this.navMode) this.map.fitBounds(this.L.latLngBounds(this.pathPoints.map(p => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 16 });
      }, ms));
    },

    /* ═══════════════════════════════════════════════════════════════════
       Everything below is the navigator ported from RecommendationMap:
       locate-me, live tracking, per-card distance, and turn-by-turn.
       ═══════════════════════════════════════════════════════════════════ */

    showLocateMsg(msg) {
      this.locateMsg = msg;
      clearTimeout(this._locateMsgTimer);
      this._locateMsgTimer = setTimeout(() => { this.locateMsg = null; }, 4500);
    },
    // Like showLocateMsg, but won't repeat the same message within 30s.
    showLocateMsgOnce(msg) {
      const now = Date.now();
      if (this._lastMsg === msg && now - (this._lastMsgAt || 0) < 30000) return;
      this._lastMsg = msg; this._lastMsgAt = now;
      this.showLocateMsg(msg);
    },

    // Render/move the driver marker only (no camera, no myCoords side-effects).
    // Reuses the existing marker when the glyph type is unchanged, so position
    // updates glide via CSS transition instead of a teardown/rebuild flicker.
    updateDriverMarker(lat, lng, { heading = null, speed = null, accuracy = null } = {}) {
      if (!this.map || !this.L) return;
      const L = this.L;
      const moving = Number.isFinite(speed) && speed >= 2.2 && Number.isFinite(heading);
      const type = moving ? 'arrow' : 'dot';
      const color = (this.navMode && this.dayColor) ? this.dayColor : '#1a73e8';
      const headingUp = this.navMode && this._rotateEnabled && !this.arrived;
      const glyphRot = (moving && !headingUp) ? heading : 0;
      if (this.accuracyCircle) { this.accuracyCircle.remove(); this.accuracyCircle = null; }
      if (!moving && !this.navMode && Number.isFinite(accuracy) && accuracy > 0) {
        this.accuracyCircle = L.circle([lat, lng], {
          radius: accuracy, color: '#4285F4', weight: 1, opacity: 0.35,
          fillColor: '#4285F4', fillOpacity: 0.12, interactive: false,
        }).addTo(this.map);
      }
      if (this.locationMarker && this._meType === type && this._meColor === color) {
        this.locationMarker.setLatLng([lat, lng]);
        if (type === 'arrow') {
          const el = this.locationMarker.getElement && this.locationMarker.getElement();
          const a = el && el.querySelector('.itin-map-mearrow');
          if (a) a.style.transform = `rotate(${glyphRot}deg)`;
        }
      } else {
        if (this.locationMarker) this.locationMarker.remove();
        const icon = moving
          ? L.divIcon({ className: 'itin-map-medot-wrap', html: `<div class="itin-map-mearrow" style="transform:rotate(${glyphRot}deg)">${navArrowSvg(color)}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] })
          : L.divIcon({ className: 'itin-map-medot-wrap', html: `<div class="itin-map-medot" style="background:${color}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
        this.locationMarker = L.marker([lat, lng], {
          icon, interactive: !!this.youAreHereLabel, keyboard: false, zIndexOffset: 1000,
        }).addTo(this.map);
        if (this.youAreHereLabel) this.locationMarker.bindPopup(this.youAreHereLabel, { autoPan: false });
        this._meType = type; this._meColor = color;
      }
    },
    // Draw (or move) the "you are here" marker + remember it as the route start.
    // Pass fly:true to recenter/zoom and pop the label — used by the button.
    setMyLocation(lat, lng, accuracy, { fly = false, heading = null, speed = null } = {}) {
      if (!this.map || !this.L) return;
      this.updateDriverMarker(lat, lng, { heading, speed, accuracy });
      this.myCoords = { lat, lng };          // routing truth = raw GPS
      if (fly) {
        this.map.setView([lat, lng], 14);
        if (this.youAreHereLabel && this.locationMarker) this.locationMarker.openPopup();
      }
    },
    // First map open: show the dot silently, but ONLY when permission was already
    // granted. We never call getCurrentPosition while the state is 'prompt' — that
    // would pop the OS permission dialog unasked. The button covers that case.
    async showMyLocationIfPermitted() {
      if (!navigator.geolocation || !navigator.permissions) return;
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state !== 'granted') return;
      } catch (e) { return; }
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        const { latitude, longitude, accuracy } = position.coords;
        this.setMyLocation(latitude, longitude, accuracy, { fly: false });
        this.ensureTracking();                 // permission granted — keep following live
      } catch (e) { /* silent — button is still available to retry */ }
    },
    // Get the user's position: precise (GPS / browser) first, then a coarse
    // IP-based fallback, nagging once (with a cooldown) when nothing works.
    // Returns { lat, lng, accuracy } or null. force:true bypasses the cooldown.
    async acquireMyLocation({ force = false } = {}) {
      if (!force && this._geoCooldownUntil && Date.now() < this._geoCooldownUntil) return null;
      const precise = await this.tryPreciseLocation();
      if (precise) return precise;
      if (this.ipFallback) {
        const ip = await this.tryIpLocation();
        if (ip) { this.showLocateMsgOnce(this.locationApproxLabel); return ip; }
      }
      this._geoCooldownUntil = Date.now() + 60000;
      this.showLocateMsgOnce(this._lastGeoReason || this.locationUnavailableLabel);
      return null;
    },
    async tryPreciseLocation() {
      if (!navigator.geolocation) { this._lastGeoReason = this.locationUnsupportedLabel; return null; }
      try {
        if (navigator.permissions) {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (status.state === 'denied') { this._lastGeoReason = this.locationDeniedLabel; return null; }
        }
      } catch (e) { /* Permissions API unavailable — fall through to the prompt */ }
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        const { latitude, longitude, accuracy } = position.coords;
        return { lat: latitude, lng: longitude, accuracy };
      } catch (e) {
        if (e && e.code === 1) this._lastGeoReason = this.locationDeniedLabel;
        else if (e && e.code === 2) this._lastGeoReason = this.locationUnsupportedLabel;
        else this._lastGeoReason = this.locationUnavailableLabel;
        return null;
      }
    },
    // Coarse, city-level location from the visitor's IP. Tried once per session
    // (cached); silent on failure. No accuracy circle — it's approximate by nature.
    async tryIpLocation() {
      if (this._ipCoords) return this._ipCoords;
      if (this._ipTried) return null;
      this._ipTried = true;
      const url = this.ipLocationUrl;
      if (!url) return null;
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (data && data.success === false) return null;
        const lat = this.num(data.latitude ?? data.lat);
        const lng = this.num(data.longitude ?? data.lng ?? data.lon);
        if (lat != null && lng != null) {
          this._ipCoords = { lat, lng, accuracy: null, approximate: true };
          return this._ipCoords;
        }
      } catch (e) { /* offline / blocked / CORS — give up quietly */ }
      return null;
    },
    async goToMyLocation() {
      if (this.locating) return;
      this.locating = true;
      try {
        const c = await this.acquireMyLocation({ force: true });
        if (c) {
          this.setMyLocation(c.lat, c.lng, c.accuracy, { fly: true });
          this.ensureTracking();
        }
      } finally {
        this.locating = false;
      }
    },
    // Keep a single live GPS watch running the whole time the full-screen map is
    // open (once we actually have a location, i.e. permission was granted).
    // Idempotent, and never starts a watch unsolicited (guarded on myCoords).
    ensureTracking() {
      if (!navigator.geolocation || !this.fullscreen || !this.myCoords) return;
      if (this._watchId != null) return;
      this._watchId = navigator.geolocation.watchPosition(
        (pos) => this.onLivePosition(pos),
        () => { /* keep the last known dot on transient errors */ },
        { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 },
      );
    },
    stopLiveTracking() {
      this.cancelDriverAnim();
      if (this._watchId != null && navigator.geolocation) { navigator.geolocation.clearWatch(this._watchId); this._watchId = null; }
    },

    /* ── Per-card "Tap for distance" → full navigation (rec-map's onCardRoute) ── */
    async onCardRoute(i) {
      if (this.publicMode) return;   // routing/nav needs an authed account
      this.activeCard = i;
      this.highlightPin(i);
      if (this.map) this.map.closePopup();
      const s = this.mappable[i];
      if (!s) return;
      // Make sure we have somewhere to route from (prompts for location if needed).
      if (!this.myCoords) {
        const c = await this.acquireMyLocation({ force: true });
        if (!c) return;                              // toast already shown
        this.setMyLocation(c.lat, c.lng, c.accuracy, { fly: false });
      }
      this.navToStop(i);
    },
    setCardRoute(i, distance, duration) {
      this.cardRoutes = { ...this.cardRoutes, [i]: { distance, duration } };
    },

    // Enter nav mode: hide the other pins + the day route, route to the picked
    // stop, and start tracking the user's GPS live (rec-map's selectPlace).
    async navToStop(i) {
      const s = this.mappable[i];
      if (!s) return;
      this.arrived = false;
      this._navMoved = false;
      this.wrongWay = false; this._wrongWayUntil = 0; this._progPeak = 0;
      this._bearingTarget = null; this._bearingCur = 0;
      if (this._rotateEnabled && this.map) { try { this.map.setBearing(0); } catch (e) { /* noop */ } }
      this.destName = s.place.name || '';
      this._navTo = { lat: s.place.latitude, lng: s.place.longitude };
      this._navIndex = i;
      const ok = await this.drawNavRoute(this._navTo);
      if (ok) {
        this.navMode = true;
        this.setPinsHidden(i);                       // remove the other places
        // The day-path overview would visually collide with the nav route.
        if (this.routeLayer) { this.map.removeLayer(this.routeLayer); this.routeLayer = null; }
        this.ensureTracking();
      } else {
        this._navTo = null; this._navIndex = null;
      }
    },
    // Leave nav mode: clear the nav route, bring every pin + the day path back.
    // The live location watch stays on (we're still in the full-screen map).
    exitNav() {
      if (this.map) this.map.closePopup();
      clearTimeout(this._arriveTimer);
      this.cancelDriverAnim();
      this.clearNavRoute();
      this.setPinsHidden(null);
      this.navMode = false;
      this._navTo = null; this._navIndex = null;
      // Revert the directional arrow to a plain dot once we're out of nav mode.
      if (this.myCoords) this.updateDriverMarker(this.myCoords.lat, this.myCoords.lng, { speed: 0 });
      // Back to north-up for browsing.
      if (this._rotateEnabled && this.map) { try { this.map.setBearing(0); } catch (e) { /* noop */ } }
      // Restore the day-route overview + framing.
      this.$nextTick(() => { this.applyRouteStyle(); this.afterResize(); });
    },
    // Switch travel mode car ⇄ walking and re-route the active stop.
    toggleNavProfile() {
      if (this.navRouting) return;
      this.navProfile = this.navProfile === 'driving-car' ? 'foot-walking' : 'driving-car';
      this.cardRoutes = {};                          // card distances are mode-specific
      if (this._navTo) this.drawNavRoute(this._navTo);
    },

    // Route from the user's location to `to` ({ lat, lng }). Returns true on
    // success. Caches by mode+start+destination+language so re-taps are free.
    async drawNavRoute(to, { live = false } = {}) {
      if (this.publicMode) return false;   // never hit the authed directions endpoint on a share
      if (this.navRouting || !to) return false;
      let from = this.myCoords;
      if (!from) {
        const c = await this.acquireMyLocation();
        if (!c) return false;                        // toast already shown
        this.setMyLocation(c.lat, c.lng, c.accuracy, { fly: false });
        from = this.myCoords;
      }
      if (!this._navCache) this._navCache = new Map();
      const profile = this.navProfile;
      // Round the start (~11 m) so tiny GPS jitter still hits the cache.
      const key = `${profile}|${from.lat.toFixed(4)},${from.lng.toFixed(4)}|${to.lat.toFixed(5)},${to.lng.toFixed(5)}|${this.routeLanguage || 'en'}`;
      const cached = this._navCache.get(key);
      if (cached) { this.renderNavRoute(cached.geometry, cached.distance, cached.duration, { fit: !live, steps: cached.steps }); return true; }

      this.navRouting = true;
      if (!live) this.showLocateMsg(this.routingLabel);  // live re-routes stay silent
      try {
        const res = await fetch(`${API_BASE}/api/routing/directions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify({ from, to, profile, language: this.routeLanguage || undefined }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success || !data.geometry) {
          if (!live) this.showLocateMsg(data.message || this.routeErrorLabel);
          return false;
        }
        this._navCache.set(key, { geometry: data.geometry, distance: data.distance, duration: data.duration, steps: data.steps || null });
        this.renderNavRoute(data.geometry, data.distance, data.duration, { fit: !live, steps: data.steps });
        return true;
      } catch (e) {
        if (!live) this.showLocateMsg(this.routeErrorLabel);
        return false;
      } finally {
        this.navRouting = false;
      }
    },
    renderNavRoute(geometry, distance, duration, { fit = true, steps = null } = {}) {
      if (!this.map || !this.L) return;
      this.clearNavRoute();
      const L = this.L;
      this._routeCoords = this.flattenRoute(geometry);   // for off-route detection + trimming
      this._routeSteps = Array.isArray(steps) ? steps : null;   // turn-by-turn guidance
      // Cumulative metres at each vertex — lets us interpolate the driver *along*
      // the line (so the puck and the trimmed tail share one point) and measure
      // distance-to-maneuver cheaply.
      this._routeCum = this.buildCumulative(this._routeCoords);
      this._drvProgress = 0; this._segHint = 0; this._drvPos = null;
      this._progPeak = 0;                                // furthest-along tracker for wrong-way
      this._badFixes = 0;                                // re-route debounce counter
      this._bearingTarget = null;                        // re-targeted on the next fix
      this.cancelDriverAnim();
      // A single clean line in the day colour — no casing. Rendered as a plain
      // polyline (not geoJSON) so we can trim the already-driven part live.
      const style = { interactive: false, color: this.dayColor || '#4285F4', weight: 5, opacity: 1, lineJoin: 'round', lineCap: 'round' };
      this.navLayer = (this._routeCoords.length >= 2)
        ? L.polyline(this._routeCoords, style).addTo(this.map)
        : L.geoJSON(geometry, { interactive: false, style }).addTo(this.map);
      if (fit) {
        try {
          // One camera move only. Extra top padding leaves room for the
          // destination popup (which opens upward).
          this.map.fitBounds(this.navLayer.getBounds(), { paddingTopLeft: [40, 220], paddingBottomRight: [40, 64], maxZoom: 16, animate: false });
        } catch (e) { /* empty bounds */ }
      } else if (this.myCoords) {
        // Live re-route while driving: don't yank the zoom — keep the driver centred.
        this.map.panTo([this.myCoords.lat, this.myCoords.lng], { animate: true, duration: 0.6 });
      }
      // Keep the ORS totals + the polyline's own length, so the live trim can
      // report remaining distance/time by ratio without re-querying ORS.
      this._routeTotal = { distance, duration, len: this.coordsLength(this._routeCoords) };
      this.navInfo = { distance, duration };
      if (this._navIndex != null) this.setCardRoute(this._navIndex, distance, duration);
      // Show the first turn straight away (from the start point), before any GPS tick.
      if (this._routeCoords.length >= 2) {
        const startNear = this.myCoords
          ? this.nearestOnRoute(this.myCoords.lat, this.myCoords.lng)
          : { seg: 0, point: this._routeCoords[0] };
        this.computeManeuver(startNear);
      }
      clearTimeout(this._locateMsgTimer);
      this.locateMsg = null;                             // clear the "Finding route…" toast
    },
    clearNavRoute() {
      if (this.navLayer) { this.navLayer.remove(); this.navLayer = null; }
      this.navInfo = null;
      this._routeCoords = null;
      this._routeTotal = null;
      this._routeSteps = null;
      this._routeCum = null;
      this._drvProgress = 0; this._segHint = 0; this._drvPos = null;
      this._progPeak = 0;
      this.wrongWay = false; this._wrongWayUntil = 0;
      this._bearingTarget = null; this._bearingCur = 0;
      this.cancelDriverAnim();
      this.navStep = null;
      this.arrived = false;
      this.destName = '';
    },

    // Live GPS tick: move the puck (snapped to the route so it hugs the line),
    // follow + rotate the camera, detect arrival, and re-route on a wrong turn
    // or a wrong-way (U-turn) situation. Ported from rec-map's onLivePosition.
    onLivePosition(pos) {
      const { latitude, longitude, accuracy, heading, speed } = pos.coords;
      const moving = Number.isFinite(speed) && speed >= 2.2;    // ≈8 km/h+
      if (moving) this._navMoved = true;
      this.myCoords = { lat: latitude, lng: longitude };        // routing truth = raw GPS

      const navigating = this.navMode && this._navTo && !this.arrived
        && this._routeCoords && this._routeCoords.length >= 2;
      if (!navigating) {
        this.cancelDriverAnim();
        this.updateDriverMarker(latitude, longitude, { heading, speed, accuracy });
        return;
      }

      const near = this.nearestOnRoute(latitude, longitude);
      const off = near ? near.dist : Infinity;
      const SNAP = 22;                                           // snap-to-route radius
      const now = Date.now();

      // Arrival: trigger when we reach the END OF THE ROUTE — the routed end is
      // the closest road point to the place, which can be >28 m from the pin.
      const totalLen = (this._routeCum && this._routeCum.length) ? this._routeCum[this._routeCum.length - 1] : 0;
      const remainingToEnd = near ? Math.max(0, totalLen - this.progressOf(near)) : Infinity;
      if (remainingToEnd <= 25 || this.haversine(latitude, longitude, this._navTo.lat, this._navTo.lng) <= 28) {
        this.onArrive(); return;
      }

      // Wrong-way detection: PROGRESS regressing from the furthest point reached
      // is the reliable signal; heading-opposed is secondary.
      let isWrong = false;
      if (near && off <= 45) {
        const prog = this.progressOf(near);
        if (prog > (this._progPeak || 0)) this._progPeak = prog;
        const regress = (this._progPeak || 0) - prog;
        const headingOpposed = moving && Number.isFinite(heading)
          && this.angleDiff(heading, this.routeBearingAt(near.seg)) > 110;
        isWrong = moving && (regress > 20 || headingOpposed);
      }
      // Hold the "turn around" banner for at least 8 s after the last wrong-way tick.
      if (isWrong) { this.wrongWay = true; this._wrongWayUntil = now + 8000; }
      else if (now >= (this._wrongWayUntil || 0)) { this.wrongWay = false; }

      // Re-route on a real detour OR a wrong-way situation. Debounced: the
      // condition must persist for a couple of fixes, throttled to 8 s.
      const needsReroute = (off > 45 || isWrong);
      this._badFixes = needsReroute ? (this._badFixes || 0) + 1 : 0;
      if (this._badFixes >= 2 && !this.navRouting && now - (this._lastReroute || 0) > 8000) {
        this._lastReroute = now;
        this._badFixes = 0;
        this._drvSnapped = false;
        this.cancelDriverAnim();
        this.updateDriverMarker(latitude, longitude, { heading, speed, accuracy });
        this.drawNavRoute(this._navTo, { live: true });
        return;
      }

      if (near && off <= 45) {
        const prog = this.progressOf(near);
        if (off <= SNAP) {
          // On the line: the rAF loop moves the puck AND the trimmed tail together
          // along the route, so they never drift apart.
          this.setDriverGlyph(moving, heading);
          this.animateDriverAlong(prog);
        } else {
          // Near but not snapped — show raw GPS, keep the tail current.
          this._drvSnapped = false;
          this.cancelDriverAnim();
          this.updateDriverMarker(latitude, longitude, { heading, speed, accuracy });
          this.trimToProgress(prog);
          this._drvProgress = prog;                              // stay in sync for re-snap
        }
        this.computeManeuver(near);
      } else {
        this._drvSnapped = false;
        this.cancelDriverAnim();
        this.updateDriverMarker(latitude, longitude, { heading, speed, accuracy });
      }

      // Camera: heading-up bearing (eased in the loop), plus a comfortable
      // speed-matched altitude.
      if (moving && this._rotateEnabled && Number.isFinite(heading)) {
        this._bearingTarget = ((-heading) % 360 + 360) % 360;
        if (this._bearingCur == null) { try { this._bearingCur = this.map.getBearing ? this.map.getBearing() : 0; } catch (e) { this._bearingCur = 0; } }
        if (!this._drvRAF) this.driverAnimStep();
      }
      const z = this.desiredZoom(speed);
      const zoomChanged = Math.abs(z - this.map.getZoom()) >= 0.75;
      const center = (near && off <= SNAP) ? near.point : [latitude, longitude];
      if (moving) {
        if (zoomChanged) this.map.setView(center, z, { animate: true, duration: 1.1 });
        else this.map.panTo(center, { animate: true, duration: 1.0 });
      } else if (zoomChanged && this._navMoved) {
        this.map.setZoom(z, { animate: true });
      }
    },
    // Comfortable map "altitude" for the current speed — faster ⇒ zoomed out.
    desiredZoom(speed) {
      const kmh = (Number.isFinite(speed) ? speed : 0) * 3.6;
      if (kmh < 15) return 18;
      if (kmh < 35) return 17;
      if (kmh < 60) return 16;
      if (kmh < 90) return 15;
      return 14;
    },
    // Cumulative metres at each route vertex.
    buildCumulative(coords) {
      const cum = [0];
      if (!coords || coords.length < 2) return cum;
      for (let i = 1; i < coords.length; i++) {
        cum[i] = cum[i - 1] + this.haversine(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
      }
      return cum;
    },
    // Distance (m) along the route to the projected point `near`.
    progressOf(near) {
      if (!near || !this._routeCum) return 0;
      const c = this._routeCoords, seg = near.seg;
      return (this._routeCum[seg] || 0) + this.haversine(c[seg][0], c[seg][1], near.point[0], near.point[1]);
    },
    // Point (and segment) at distance `d` along the route — uses a forward hint.
    pointAtDistance(d) {
      const c = this._routeCoords, cum = this._routeCum;
      if (!c || c.length < 2 || !cum) return null;
      d = Math.max(0, Math.min(d, cum[cum.length - 1]));
      let i = Math.min(this._segHint || 0, c.length - 2);
      if (cum[i] > d) i = 0;
      while (i < c.length - 2 && cum[i + 1] < d) i++;
      this._segHint = i;
      const segLen = (cum[i + 1] - cum[i]) || 1e-9;
      const t = Math.max(0, Math.min(1, (d - cum[i]) / segLen));
      return { lat: c[i][0] + (c[i + 1][0] - c[i][0]) * t, lng: c[i][1] + (c[i + 1][1] - c[i][1]) * t, seg: i };
    },
    // Trim the rendered route so it begins at distance `d` along the line, and
    // count the chip's distance/time down by the remaining ratio (no ORS re-query).
    trimToProgress(d) {
      if (!this.navLayer || typeof this.navLayer.setLatLngs !== 'function') return;
      const p = this.pointAtDistance(d);
      if (!p) return;
      const remaining = [[p.lat, p.lng], ...this._routeCoords.slice(p.seg + 1)];
      if (remaining.length < 2) return;
      try { this.navLayer.setLatLngs(remaining); } catch (e) { /* noop */ }
      const t = this._routeTotal;
      if (t && t.len > 0) {
        const ratio = Math.max(0, Math.min(1, this.coordsLength(remaining) / t.len));
        this.navInfo = {
          distance: t.distance != null ? t.distance * ratio : null,
          duration: t.duration != null ? t.duration * ratio : null,
        };
      }
    },
    // Animate the puck + tail forward to `target` metres along the route.
    animateDriverAlong(target) {
      const from = (this._drvProgress != null) ? this._drvProgress : target;
      this._animFromD = from;
      this._animToD = Math.max(target, from);                   // forward-only, ignore GPS backslide
      this._drvSnapped = true;                                  // loop owns the marker position
      const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const dt = t0 - (this._lastFixAt || t0);
      this._lastFixAt = t0;
      this._animStart = t0;
      this._animDur = Math.max(450, Math.min(1600, dt || 1000));
      if (!this._drvRAF) this.driverAnimStep();
    },
    driverAnimStep() {
      const nowT = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const k = this._animDur ? Math.max(0, Math.min(1, (nowT - this._animStart) / this._animDur)) : 1;
      if (this._drvSnapped) {
        const d = this._animFromD + (this._animToD - this._animFromD) * k;
        this._drvProgress = d;
        const p = this.pointAtDistance(d);
        if (p && this.locationMarker) {
          this.locationMarker.setLatLng([p.lat, p.lng]);
          this._drvPos = { lat: p.lat, lng: p.lng };
          if (this.navLayer && typeof this.navLayer.setLatLngs === 'function') {
            const remaining = [[p.lat, p.lng], ...this._routeCoords.slice(p.seg + 1)];
            if (remaining.length >= 2) { try { this.navLayer.setLatLngs(remaining); } catch (e) { /* noop */ } }
          }
        }
      }
      // Ease the heading-up rotation toward its target so the map turns smoothly.
      let turning = false;
      if (this._rotateEnabled && this._bearingTarget != null && this.map && this.map.setBearing) {
        const cur = (this._bearingCur == null) ? this._bearingTarget : this._bearingCur;
        const delta = (((this._bearingTarget - cur) % 360) + 540) % 360 - 180;   // shortest signed turn
        if (Math.abs(delta) > 0.25) {
          this._bearingCur = (cur + delta * 0.10 + 360) % 360;                    // 10%/frame ease
          turning = true;
        } else {
          this._bearingCur = this._bearingTarget;
        }
        try { this.map.setBearing(this._bearingCur); } catch (e) { /* noop */ }
      }
      this._drvRAF = ((this._drvSnapped && k < 1) || turning) ? requestAnimationFrame(() => this.driverAnimStep()) : null;
    },
    cancelDriverAnim() {
      if (this._drvRAF) { cancelAnimationFrame(this._drvRAF); this._drvRAF = null; }
    },
    // Ensure the puck has the right glyph/colour/rotation; position is owned by
    // the rAF loop, so we only (re)build the icon on a type/colour change.
    setDriverGlyph(moving, heading) {
      if (!this.map || !this.L) return;
      const L = this.L;
      const type = moving ? 'arrow' : 'dot';
      const color = (this.navMode && this.dayColor) ? this.dayColor : '#1a73e8';
      const glyphRot = (moving && !this._rotateEnabled) ? heading : 0;
      if (this.locationMarker && this._meType === type && this._meColor === color) {
        if (type === 'arrow') {
          const el = this.locationMarker.getElement && this.locationMarker.getElement();
          const a = el && el.querySelector('.itin-map-mearrow');
          if (a) a.style.transform = `rotate(${glyphRot}deg)`;
        }
        return;
      }
      const at = this._drvPos || this.myCoords || { lat: 0, lng: 0 };
      if (this.locationMarker) this.locationMarker.remove();
      const html = moving
        ? `<div class="itin-map-mearrow" style="transform:rotate(${glyphRot}deg)">${navArrowSvg(color)}</div>`
        : `<div class="itin-map-medot" style="background:${color}"></div>`;
      this.locationMarker = L.marker([at.lat, at.lng], {
        icon: L.divIcon({ className: 'itin-map-medot-wrap', html, iconSize: moving ? [36, 36] : [18, 18], iconAnchor: moving ? [18, 18] : [9, 9] }),
        interactive: !!this.youAreHereLabel, keyboard: false, zIndexOffset: 1000,
      }).addTo(this.map);
      if (this.youAreHereLabel) this.locationMarker.bindPopup(this.youAreHereLabel, { autoPan: false });
      this._meType = type; this._meColor = color;
    },
    // Arrival: stop the nav animation, square the map up, show the finish banner.
    onArrive() {
      this.arrived = true;
      this.navStep = null;
      this.navInfo = { distance: 0, duration: 0 };
      this._bearingTarget = null;
      this.cancelDriverAnim();
      if (this.myCoords) this.updateDriverMarker(this.myCoords.lat, this.myCoords.lng, { speed: 0 });
      if (this.navLayer && typeof this.navLayer.setLatLngs === 'function') {
        try { this.navLayer.setLatLngs([]); } catch (e) { /* noop */ }   // route fully consumed
      }
      if (this._rotateEnabled && this.map) { try { this.map.setBearing(0); } catch (e) { /* noop */ } this._bearingCur = 0; }
      if (this.map && this._navTo) this.map.panTo([this._navTo.lat, this._navTo.lng], { animate: true, duration: 0.6 });
      // Show "You've arrived" briefly, then finish the route on its own.
      clearTimeout(this._arriveTimer);
      this._arriveTimer = setTimeout(() => { this.exitNav(); }, 5000);
    },
    // Great-circle distance in metres between two lat/lng points.
    haversine(la1, lo1, la2, lo2) {
      const R = 6371000, toRad = Math.PI / 180;
      const dLat = (la2 - la1) * toRad, dLng = (lo2 - lo1) * toRad;
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1 * toRad) * Math.cos(la2 * toRad) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
    },
    // Compass bearing (deg) along the route around segment `seg`.
    routeBearingAt(seg) {
      const n = (this._routeCoords || []).length;
      return this.segBearing(seg, Math.min(seg + 3, n - 1));
    },
    // Compass bearing (deg) from route vertex i to vertex j (clamped).
    segBearing(i, j) {
      const c = this._routeCoords;
      if (!c || c.length < 2) return 0;
      i = Math.max(0, Math.min(i, c.length - 1));
      j = Math.max(0, Math.min(j, c.length - 1));
      if (i === j) { if (j < c.length - 1) j++; else i--; }
      const a = c[i], b = c[j];
      const toRad = Math.PI / 180, toDeg = 180 / Math.PI;
      const y = Math.sin((b[1] - a[1]) * toRad) * Math.cos(b[0] * toRad);
      const x = Math.cos(a[0] * toRad) * Math.sin(b[0] * toRad)
        - Math.sin(a[0] * toRad) * Math.cos(b[0] * toRad) * Math.cos((b[1] - a[1]) * toRad);
      return (Math.atan2(y, x) * toDeg + 360) % 360;
    },
    // Smallest angle (0–180) between two compass bearings.
    angleDiff(a, b) { const d = Math.abs((a - b) % 360); return d > 180 ? 360 - d : d; },
    // Nearest point on the route to (lat,lng): the projected point on the line,
    // which segment it sits on, and the distance.
    nearestOnRoute(lat, lng) {
      const c = this._routeCoords;
      if (!c || c.length < 2) return null;
      const R = 6371000, toRad = Math.PI / 180;
      const lat0 = lat * toRad, cosLat0 = Math.cos(lat0) || 1e-9;
      const X = (lo) => lo * toRad * cosLat0 * R;
      const Y = (la) => la * toRad * R;
      const px = X(lng), py = Y(lat);
      let best = { dist: Infinity, seg: 0, point: c[0] };
      for (let i = 0; i < c.length - 1; i++) {
        const a = c[i], b = c[i + 1];
        const ax = X(a[1]), ay = Y(a[0]);
        const bx = X(b[1]), by = Y(b[0]);
        const dx = bx - ax, dy = by - ay;
        const len2 = dx * dx + dy * dy || 1e-9;
        let t = ((px - ax) * dx + (py - ay) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        const cx = ax + t * dx, cy = ay + t * dy;
        const d = Math.hypot(px - cx, py - cy);
        if (d < best.dist) {
          best = { dist: d, seg: i, point: [cy / (toRad * R), cx / (toRad * cosLat0 * R)] };
        }
      }
      return best;
    },
    // Total geodesic length (metres) of a [[lat,lng],…] polyline.
    coordsLength(coords) {
      if (!coords || coords.length < 2) return 0;
      const R = 6371000, toRad = Math.PI / 180;
      let total = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i], b = coords[i + 1];
        const dLat = (b[0] - a[0]) * toRad, dLng = (b[1] - a[1]) * toRad;
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toRad) * Math.cos(b[0] * toRad) * Math.sin(dLng / 2) ** 2;
        total += 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
      }
      return total;
    },
    // Work out the next turn ahead of the driver and how far away it is, from the
    // ORS steps. Sets this.navStep = { type, instruction, name, distance } or null.
    computeManeuver(near) {
      const steps = this._routeSteps, c = this._routeCoords, cum = this._routeCum;
      if (!steps || !steps.length || !c || c.length < 2 || !near) { this.navStep = null; return; }
      const curIdx = near.seg;
      let chosen = null;
      for (const s of steps) {
        if (s.type === 11) continue;                 // skip "depart"/head-out
        const at = s.way_points ? s.way_points[0] : null;
        if (at != null && at > curIdx) { chosen = { step: s, at }; break; }
      }
      // No turn ahead → we're on the final leg; point at the destination (arrive).
      if (!chosen) chosen = { step: steps[steps.length - 1], at: c.length - 1 };
      const at = Math.min(chosen.at, c.length - 1);
      let type = chosen.step.type;
      let instruction = chosen.step.instruction || '';
      // Geometric U-turn: if the route reverses ~180° at the maneuver point, show a
      // U-turn even when ORS labelled it a sharp left/right.
      if (type !== 10 && this.angleDiff(this.segBearing(at - 4, at), this.segBearing(at, at + 4)) > 150) {
        type = 9;
        if (this.uturnLabel) instruction = this.uturnLabel;
      }
      const dist = (cum && cum[at] != null)
        ? Math.max(0, cum[at] - this.progressOf(near))
        : this.coordsLength([near.point, ...c.slice(curIdx + 1, at + 1)]);
      this.navStep = { type, instruction, name: chosen.step.name || '', distance: dist };
    },
    // A maneuver glyph for an ORS step type. Several similar turns share an icon.
    maneuverSvg(type) {
      const O = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">';
      const C = '</svg>';
      const ICON = {
        left:      '<path d="M16 20v-6a4 4 0 0 0-4-4H6"/><polyline points="10 5 5 10 10 15"/>',
        right:     '<path d="M8 20v-6a4 4 0 0 1 4-4h6"/><polyline points="14 5 19 10 14 15"/>',
        straight:  '<line x1="12" y1="20" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/>',
        roundabout:'<circle cx="10" cy="14" r="4.4"/><path d="M14.4 14H19V5"/><polyline points="16 7 19 4 22 7"/>',
        uturn:     '<path d="M16 20V10a4 4 0 0 0 -8 0v6"/><polyline points="11.5 13 8 16.5 4.5 13"/>',
        arrive:    '<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
      };
      const map = {
        0: 'left', 2: 'left', 4: 'left', 12: 'left',
        1: 'right', 3: 'right', 5: 'right', 13: 'right',
        6: 'straight', 11: 'straight',
        7: 'roundabout', 8: 'roundabout',
        9: 'uturn', 10: 'arrive',
      };
      return O + (ICON[map[type]] || ICON.straight) + C;
    },
    // Flatten a GeoJSON LineString / MultiLineString into [[lat, lng], …].
    flattenRoute(geometry) {
      if (!geometry) return [];
      const out = [];
      const push = (coords) => coords.forEach(c => { if (Array.isArray(c) && c.length >= 2) out.push([c[1], c[0]]); });
      if (geometry.type === 'LineString') push(geometry.coordinates);
      else if (geometry.type === 'MultiLineString') geometry.coordinates.forEach(push);
      return out;
    },
    fmtDistance(m) {
      if (m == null) return '';
      return m >= 1000 ? `${(m / 1000).toFixed(1)} ${this.unitKm}` : `${Math.round(m)} ${this.unitMeter}`;
    },
    fmtDuration(s) {
      if (s == null) return '';
      const mins = Math.round(s / 60);
      if (mins < 60) return `${mins} ${this.unitMinute}`;
      const h = Math.floor(mins / 60), mm = mins % 60;
      return mm ? `${h} ${this.unitHour} ${mm} ${this.unitMinute}` : `${h} ${this.unitHour}`;
    },
  },
};
</script>

<style scoped>
/* ── Theme tokens: identical recipe to RecommendationMap's --rm-* set ── */
.itin-map.day-mode {
  --rm-text: #A0522D; --rm-muted: #A0522D; --rm-biz-text: #3c2a1e;
  --rm-surface: rgba(255,255,255,0.45); --rm-bar-hover: rgba(255,255,255,0.75); --svg-color: #A0522D;
  --rm-hover: rgba(212,175,55,0.14);
  --rm-ctrl-bg: rgba(255,255,255,0.72); --rm-ctrl-text: #A0522D;
  --rm-ctrl-ring: rgba(0,0,0,0.08); --rm-ctrl-glint: rgba(255,255,255,0.85);
  --rm-ctrl-hover: rgba(240,221,170,0.95);
  --rm-popup-bg: rgba(255,253,248,0.9); --rm-rim: inset 0 0 0 1px rgba(255,255,255,0.6); --rm-border: none;
  --rm-glass: rgba(255,255,255,0.5); --rm-glass-hover: rgba(255,255,255,0.75);
  --rm-glass-ring: inset 0 0 0 1px rgba(255,255,255,0.6);
}
.itin-map.night-mode {
  --rm-text: #c084fc; --rm-muted: #9ca3af; --rm-biz-text: #94a3b8;
  --rm-surface: rgba(255,255,255,0.06); --rm-bar-hover: rgba(255,255,255,0.14); --svg-color: #c084fc;
  --rm-hover: rgba(139,92,246,0.16);
  --rm-ctrl-bg: rgba(22,15,44,0.55); --rm-ctrl-text: #e2e8f0;
  --rm-ctrl-ring: rgba(255,255,255,0.2); --rm-ctrl-glint: rgba(255,255,255,0.28);
  --rm-ctrl-hover: rgba(76,52,140,0.82);
  --rm-popup-bg: rgba(30,20,56,0.85); --rm-rim: inset 0 0 0 0.7px rgba(255,255,255,0.1); --rm-border: none;
  --rm-glass: rgba(255,255,255,0.08); --rm-glass-hover: rgba(255,255,255,0.14);
  --rm-glass-ring: inset 0 0 0 1.5px rgba(255,255,255,0.1);
}

.itin-map {
  border-radius: 14px; overflow: hidden; position: relative;
  /* Surface so the show/hide bar reads as a card even while the map is hidden
     (same frosted recipe as rec-map's root). */
  background: var(--rm-surface);
  backdrop-filter: blur(2px) saturate(180%); -webkit-backdrop-filter: blur(2px) saturate(180%);
  box-shadow: var(--rm-rim);
}

/* ── Show/Hide bar — mirrors rec-map-bar 1:1 ── */
.itin-map-bar { display: flex; align-items: center; transition: background 0.18s ease; }
.itin-map-bar:hover { background: var(--rm-bar-hover); }
.itin-map-toggle {
  flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 11px 6px 11px 14px; background: transparent; border: none; cursor: pointer;
  color: var(--rm-text); font-size: 14px; font-weight: 600;
}
.itin-map-toggle:hover { background: transparent; }
.itin-map-toggle-left { display: flex; align-items: center; gap: 9px; }
.itin-map-toggle-left > svg { color: var(--svg-color); flex-shrink: 0; }
.itin-map-count { font-size: 12px; font-weight: 700; color: var(--rm-muted); background: var(--rm-hover); border-radius: 10px; padding: 1px 8px; }
.itin-map-bar-actions { display: flex; align-items: center; gap: 2px; padding-right: 8px; }
.itin-map-iconbtn {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 9px; cursor: pointer;
  color: var(--rm-muted); transition: color 0.18s ease;
}
.itin-map-iconbtn svg { transition: transform 0.18s ease; }
.itin-map-iconbtn:hover svg { transform: scale(1.18); }
.itin-map-chevron { color: var(--rm-muted); flex-shrink: 0; transition: transform 0.25s ease; }
.itin-map-chevron.open { transform: rotate(180deg); }
/* Grow the chevron while the toggle is hovered; open state must re-apply its
   rotation alongside the scale or the chevron would un-rotate on hover. */
.itin-map-toggle:hover .itin-map-chevron { transform: scale(1.18); }
.itin-map-toggle:hover .itin-map-chevron.open { transform: rotate(180deg) scale(1.18); }

/* ── Animated reveal (body stays in the DOM so Leaflet measures a real box) ── */
.itin-map-body { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.35s ease, opacity 0.28s ease; }
.itin-map.is-open .itin-map-body { max-height: 420px; opacity: 1; }

.itin-map-stage { position: relative; }
.itin-map-canvas { width: 100%; height: 350px; background: #e8eaed; touch-action: none; }
.itin-map.is-fullscreen { position: fixed; inset: 0; z-index: 4000; border-radius: 0; }
.itin-map.is-fullscreen .itin-map-body { max-height: none; height: 100%; opacity: 1; }
.itin-map.is-fullscreen .itin-map-stage { height: 100%; }
.itin-map.is-fullscreen .itin-map-canvas { height: 100vh; height: 100dvh; }

/* ── Fullscreen toggle — glass chip (rec-map-close-fs recipe) ── */
.itin-map-close-fs {
  position: absolute;
  top: calc(12px + env(safe-area-inset-top, 0px));
  right: calc(12px + env(safe-area-inset-right, 0px));
  z-index: 1200;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 12px; cursor: pointer;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
  transition: background 0.18s ease, transform 0.15s ease;
}
.itin-map-close-fs:hover { background: var(--rm-ctrl-hover); }
.itin-map-close-fs:active { transform: scale(0.94); }
@media (max-width: 600px) { .itin-map-close-fs { width: 34px; height: 34px; } }
/* In fullscreen the button is the ✕ close — match rec-map's larger, thumb-
   friendly size (inline it stays zoom-button-sized). */
.itin-map.is-fullscreen .itin-map-close-fs { width: 44px; height: 44px; }
@media (max-width: 600px) { .itin-map.is-fullscreen .itin-map-close-fs { width: 48px; height: 48px; } }

/* ── Locate-me (GPS) button — same glass chip, stacked under the close button
     (rec-map-locate-fs recipe) ── */
.itin-map-locate-fs {
  position: absolute;
  top: calc(66px + env(safe-area-inset-top, 0px));     /* 12 (close top) + 44 (close h) + 10 gap */
  right: calc(12px + env(safe-area-inset-right, 0px));
  z-index: 1200;
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 12px; cursor: pointer;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
  transition: background 0.18s ease, transform 0.15s ease, opacity 0.18s ease;
}
.itin-map-locate-fs:hover { background: var(--rm-ctrl-hover); }
.itin-map-locate-fs:active { transform: scale(0.94); }
.itin-map-locate-fs.is-busy { opacity: 0.55; pointer-events: none; }
@media (max-width: 600px) {
  .itin-map-locate-fs { width: 48px; height: 48px; top: calc(70px + env(safe-area-inset-top, 0px)); }
}

/* ── Travel-mode switcher — same glass chip, stacked under the locate button
     (rec-map-modeswitch recipe) ── */
.itin-map-modeswitch {
  position: absolute;
  top: calc(120px + env(safe-area-inset-top, 0px));    /* 66 (locate top) + 44 (locate h) + 10 gap */
  right: calc(12px + env(safe-area-inset-right, 0px));
  z-index: 1200;
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 12px; cursor: pointer;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
  transition: background 0.18s ease, transform 0.15s ease, opacity 0.18s ease;
}
.itin-map-modeswitch:hover { background: var(--rm-ctrl-hover); }
.itin-map-modeswitch:active { transform: scale(0.94); }
.itin-map-modeswitch.is-busy { opacity: 0.55; pointer-events: none; }
@media (max-width: 600px) {
  .itin-map-modeswitch { width: 48px; height: 48px; top: calc(128px + env(safe-area-inset-top, 0px)); }
}

/* ── Glass toast (location-permission message, etc.) — top-centre, theme-aware ── */
.itin-map-toast {
  position: absolute;
  top: calc(12px + env(safe-area-inset-top, 0px));
  left: 50%; transform: translateX(-50%);
  z-index: 1300; max-width: min(86%, 420px);
  padding: 10px 14px; border-radius: 12px;
  font-size: 13px; font-weight: 600; line-height: 1.35; text-align: center;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.22), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
}

/* ── Turn-by-turn banner — top-centre glass; informational so taps pass through
     (rec-map-maneuver recipe) ── */
.itin-map-maneuver {
  position: absolute; z-index: 1260; pointer-events: none;
  top: calc(14px + env(safe-area-inset-top, 0px));
  left: 50%; transform: translateX(-50%);
  width: max-content; max-width: min(58vw, 300px); box-sizing: border-box;
  display: flex; align-items: center; gap: 11px;
  padding: 9px 15px 9px 11px; border-radius: 16px;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
}
.itin-map-maneuver-ic { flex: 0 0 auto; display: flex; }
.itin-map-maneuver-ic :deep(svg) { display: block; }
.itin-map-maneuver--warn {
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1.5px rgba(245,158,11,0.55), inset 0 1px 0 var(--rm-ctrl-glint);
}
.itin-map-maneuver--warn .itin-map-maneuver-ic { color: #f59e0b; }
.itin-map-maneuver--warn .itin-map-maneuver-dist { color: #f59e0b; }
.itin-map-maneuver-body { min-width: 0; }
.itin-map-maneuver-dist { font-size: 18px; font-weight: 800; line-height: 1.15; }
.itin-map-maneuver-instr {
  margin-top: 2px; font-size: 12.5px; font-weight: 600; color: var(--rm-ctrl-text);
  line-height: 1.25;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Arrival banner — same glass; sits where the maneuver was (rec-map-arrive) ── */
.itin-map-arrive {
  position: absolute; z-index: 1260;
  top: calc(14px + env(safe-area-inset-top, 0px));
  left: 50%; transform: translateX(-50%);
  width: max-content; max-width: min(80vw, 340px); box-sizing: border-box;
  display: flex; align-items: center; gap: 11px;
  padding: 10px 10px 10px 13px; border-radius: 16px;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
}
.itin-map-arrive-ic { flex: 0 0 auto; display: flex; }
.itin-map-arrive-ic svg { display: block; }
.itin-map-arrive-body { min-width: 0; }
.itin-map-arrive-title { font-size: 15px; font-weight: 800; line-height: 1.2; }
.itin-map-arrive-sub {
  margin-top: 1px; font-size: 12.5px; font-weight: 600; color: var(--rm-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
}

/* ── Route summary — bottom-centre glass pill (rec-map-routeinfo recipe) ── */
.itin-map-routeinfo {
  position: absolute; z-index: 1250;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  padding: 8px 8px 8px 13px; border-radius: 13px;
  font-size: 13px; font-weight: 700; line-height: 1; white-space: nowrap;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
}
.itin-map-routeinfo > svg { color: var(--rm-ctrl-text); flex-shrink: 0; opacity: 0.85; }
.itin-map-routeinfo--soft { font-weight: 500; padding: 8px 13px; opacity: 0.9; }
.itin-map-routeinfo-mode {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; border-radius: 9px; cursor: pointer;
  color: var(--rm-ctrl-text); background: var(--rm-hover);
  transition: background 0.18s ease, transform 0.12s ease;
}
.itin-map-routeinfo-mode:hover { background: var(--rm-ctrl-hover); }
.itin-map-routeinfo-mode:active { transform: scale(0.92); }
/* Nav-mode chip: same pill, coloured route icon + exit button (rec-map-routeinfo-clear) */
.itin-map-navinfo > svg { opacity: 1; }
.itin-map-navinfo-clear {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; border-radius: 8px; cursor: pointer;
  color: var(--rm-ctrl-text); background: var(--rm-hover);
  transition: background 0.18s ease, transform 0.12s ease;
}
.itin-map-navinfo-clear:hover { background: var(--rm-ctrl-hover); }
.itin-map-navinfo-clear:active { transform: scale(0.92); }

/* ── Place carousel — bottom strip, scroll-snap (rec-map-cards recipe) ── */
.itin-map-cards {
  --card-w: 300px;
  position: absolute; left: 0; right: 0;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  z-index: 1250;
  display: flex; gap: 12px; align-items: center;
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 6px max(14px, calc((100% - var(--card-w)) / 2));
  scrollbar-width: none;
}
.itin-map-cards::-webkit-scrollbar { display: none; }
/* Mobile: narrower cards — long names/addresses truncate with … instead of
   stretching the card. */
@media (max-width: 600px) { .itin-map-cards { --card-w: min(72vw, 300px); } }
.itin-map-card {
  flex: 0 0 var(--card-w); box-sizing: border-box;
  width: var(--card-w); min-width: 0; max-width: var(--card-w); overflow: hidden;
  scroll-snap-align: center; scroll-snap-stop: always;
  display: flex; align-items: center; gap: 12px;
  padding: 10px; border: none; border-radius: 16px; cursor: pointer; text-align: left;
  color: var(--rm-ctrl-text); background-color: var(--rm-ctrl-bg);
  /* Soft tier tint for business stops (rec-map's --rm-card-tint recipe) —
     transparent for non-partner places, so the plain glass is unchanged. */
  background-image: linear-gradient(var(--im-card-tint, transparent), var(--im-card-tint, transparent));
  box-shadow: 0 0 5px rgba(0,0,0,0.15), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
  opacity: 0.45;
  transition: opacity 0.18s ease;
}
.itin-map-card.is-active { opacity: 1; }
.itin-map-card-photo {
  position: relative; flex: 0 0 auto;
  width: 56px; height: 56px; border-radius: 12px;
  background-size: cover; background-position: center; background-color: var(--rm-hover);
  box-shadow: inset 0 0 0 1px var(--rm-ctrl-ring);
}
.itin-map-card-num {
  position: absolute; top: -6px; left: -6px;
  min-width: 19px; height: 19px; padding: 0 4px; box-sizing: border-box;
  border-radius: 10px; border: 1.5px solid #fff;
  color: #fff; font-size: 11px; font-weight: 700; line-height: 16px; text-align: center;
  box-shadow: 0 0 3px rgba(0,0,0,0.35);
}
.itin-map-card-info { min-width: 0; flex: 1; }
.itin-map-card-name {
  font-size: 14px; font-weight: 700; line-height: 1.25; color: var(--rm-biz-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.itin-map.night-mode .itin-map-card-name { color: var(--rm-ctrl-text); }
.itin-map-card-cat {
  margin-top: 2px; font-size: 12px; color: var(--rm-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* Distance / "Tap for distance" row on a card (rec-map-card-route recipe) */
.itin-map-card-route {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 6px; font-size: 12px; font-weight: 700;
  max-width: 100%;
}
.itin-map-card-route > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.itin-map-card-route svg { flex-shrink: 0; }
.itin-map-card-route--loading { color: var(--rm-muted); font-weight: 600; }
/* The "Tap for distance" button — the sole route/distance trigger. Frosted glass
   to match the popup buttons; it's a real <button>, hence the resets. */
.itin-map-card-route--cta {
  color: var(--rm-ctrl-text); font: inherit; font-size: 12px; font-weight: 600;
  cursor: pointer; -webkit-appearance: none; appearance: none; border: none;
  padding: 5px 12px 5px 9px; border-radius: 999px;
  background: var(--rm-glass); box-shadow: var(--rm-glass-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: background 0.18s ease, transform 0.12s ease;
}
.itin-map-card-route--cta:hover { background: var(--rm-glass-hover); }
.itin-map-card-route--cta:active { transform: scale(0.96); }
.itin-map.night-mode .itin-map-card-route--cta {
  background: rgba(255,255,255,0.05);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
}
.itin-map.night-mode .itin-map-card-route--cta:hover { background: rgba(255,255,255,0.1); }
.itin-map-card-spinner {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid var(--rm-ctrl-ring); border-top-color: var(--rm-ctrl-text);
  animation: itinMapSpin 0.7s linear infinite;
}
@keyframes itinMapSpin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .itin-map-card { transition: none; }
  .itin-map-card-spinner { animation: none; }
}
/* With the strip showing: route chip moves to top-centre (its bottom slot is
   taken) and the zoom control lifts above the cards. */
.itin-map.has-cards .itin-map-routeinfo {
  bottom: auto; top: calc(14px + env(safe-area-inset-top, 0px));
}
/* …but the NAV chip stays bottom-centred (the cards are hidden in nav mode,
   and the maneuver banner owns the top-centre slot). */
.itin-map.nav-mode .itin-map-navinfo {
  bottom: calc(16px + env(safe-area-inset-bottom, 0px)); top: auto;
}
.itin-map.is-fullscreen.has-cards :deep(.leaflet-bottom.leaflet-right) {
  bottom: calc(96px + env(safe-area-inset-bottom, 0px));
}

/* ── Zoom control — themed glass (rec-map recipe) ── */
.itin-map :deep(.leaflet-control-zoom) {
  border: none !important; border-radius: 12px !important; overflow: hidden;
  background: var(--rm-ctrl-bg) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint) !important;
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
}
.itin-map :deep(.leaflet-control-zoom a) {
  width: 34px; height: 34px; line-height: 34px; font-size: 18px; font-weight: 700;
  border: none !important; background: transparent !important; color: var(--rm-ctrl-text) !important;
  transition: background 0.18s ease !important;
}
.itin-map :deep(.leaflet-control-zoom a:first-child) { box-shadow: inset 0 -1px 0 var(--rm-ctrl-ring) !important; }
.itin-map :deep(.leaflet-control-zoom a:hover) { background: var(--rm-ctrl-hover) !important; }
.itin-map.is-fullscreen :deep(.leaflet-control-zoom) {
  margin-bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important;
  margin-right: calc(16px + env(safe-area-inset-right, 0px)) !important;
}
.itin-map.is-fullscreen :deep(.leaflet-control-zoom a) { width: 44px; height: 44px; line-height: 44px; font-size: 24px; }
@media (max-width: 600px) { .itin-map.is-fullscreen :deep(.leaflet-control-zoom a) { width: 48px; height: 48px; line-height: 48px; } }
/* Hide overlapping controls while a popup is open — same courtesy as rec-map. */
.itin-map.popup-open .itin-map-close-fs,
.itin-map.popup-open .itin-map-locate-fs,
.itin-map.popup-open .itin-map-modeswitch,
.itin-map.popup-open :deep(.leaflet-control-zoom) { opacity: 0; pointer-events: none; transition: opacity 0.15s ease; }

/* ── Pins — teardrop + photo variants (rec-map-pin / rec-map-photo-pin) ── */
:deep(.itin-pin-wrap) { background: transparent; border: none; transition: opacity 0.25s ease; }
:deep(.itin-pin) {
  width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
  background: var(--pin-color, #4285F4);
  box-shadow: 0 0 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}
:deep(.itin-pin span) { transform: rotate(45deg); color: #fff; font-size: 13px; font-weight: 700; }
:deep(.itin-photo-pin) { position: relative; width: 46px; height: 46px; }
:deep(.itin-photo) {
  width: 46px; height: 46px; border-radius: 50%; background-size: cover; background-position: center;
  border: 3px solid var(--pin-color, #fff); box-shadow: 0 0 4px rgba(0,0,0,0.4);
}
:deep(.itin-photo-pin::after) {
  content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
  border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 9px solid var(--pin-color, #fff);
}
:deep(.itin-badge) {
  position: absolute; top: -5px; right: -5px; min-width: 19px; height: 19px; padding: 0 4px;
  border-radius: 10px; background: var(--pin-color, #4285F4);
  color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;
  border: 1.5px solid #fff; box-shadow: 0 0 3px rgba(0,0,0,0.35);
}
:deep(.itin-home-pin) {
  width: 34px; height: 34px; border-radius: 50%; background: #fff;
  display: grid; place-items: center; border: 2.5px solid var(--pin-color, #4285F4);
  box-shadow: 0 1px 6px rgba(0,0,0,0.3);
}
/* Pins hidden entirely while navigating to one stop (rm-pin-hidden recipe) */
:deep(.itin-pin-wrap.itin-pin-hidden) { display: none; }
/* Active place (the focused carousel card) — its pin grows from its tip.
   Lifted above Leaflet's Y-based inline z-index so a nearby smaller pin never
   overlaps the enlarged one (rm-pin-active recipe). */
:deep(.itin-photo-pin), :deep(.itin-pin) { transition: transform 0.2s cubic-bezier(.22,1,.36,1); }
:deep(.itin-pin-wrap.itin-pin-active) { z-index: 100000 !important; }
:deep(.itin-pin-wrap.itin-pin-active .itin-photo-pin) { transform: scale(1.5); transform-origin: bottom center; }
:deep(.itin-pin-wrap.itin-pin-active .itin-pin) { transform: rotate(-45deg) scale(1.32); }

/* ── "You are here" — blue dot with a soft outward pulse (rec-map-medot) ── */
:deep(.itin-map-medot-wrap) { background: transparent; border: none; }
:deep(.itin-map-medot) {
  width: 18px; height: 18px; border-radius: 50%;
  background: #4285F4; border: 3px solid #fff; position: relative;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.35);
}
:deep(.itin-map-medot)::before {
  content: ''; position: absolute; left: 50%; top: 50%;
  width: 18px; height: 18px; border-radius: 50%;
  transform: translate(-50%, -50%);
  background: rgba(66,133,244,0.45);
  animation: itinMapPulse 2s ease-out infinite;
}
@keyframes itinMapPulse {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
  70%, 100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  :deep(.itin-map-medot)::before { animation: none; }
}
/* "You are here", moving — a navigation chevron that points the way we're
   travelling (rec-map-mearrow recipe). */
:deep(.itin-map-mearrow) {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s ease-out;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45));
  -webkit-filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45));
}
:deep(.itin-map-mearrow) svg { display: block; }

/* ── Popup — frosted wrapper, full-bleed image, action pills (rec-pop recipe) ── */
.itin-map :deep(.leaflet-popup-content-wrapper) {
  background: var(--rm-popup-bg); color: var(--rm-text);
  backdrop-filter: blur(30px) saturate(190%); -webkit-backdrop-filter: blur(30px) saturate(190%);
  border-radius: 16px; box-shadow: 0 0 30px rgba(0,0,0,0.22), var(--rm-rim);
  border: 1px solid var(--rm-border); padding: 0; overflow: hidden;
}
.itin-map :deep(.leaflet-popup-tip) { background: var(--rm-popup-bg); }
.itin-map :deep(.itin-map-popup .leaflet-popup-content) { margin: 0; width: 300px !important; }
/* Themed close button — real SVG X, masked to the theme text colour. */
.itin-map :deep(.itin-map-popup .leaflet-popup-close-button) {
  top: 8px; right: 8px; width: 26px; height: 26px; padding: 0;
  border-radius: 50%; background: var(--rm-ctrl-bg);
  font-size: 0; color: transparent !important;
  box-shadow: 0 0 8px rgba(0,0,0,0.3); z-index: 5;
  backdrop-filter: blur(8px) saturate(160%); -webkit-backdrop-filter: blur(8px) saturate(160%);
}
.itin-map :deep(.itin-map-popup .leaflet-popup-close-button)::before {
  content: ""; position: absolute; inset: 0;
  background-color: var(--rm-ctrl-text);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 6 L18 18 M18 6 L6 18' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E") center / 13px 13px no-repeat;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 6 L18 18 M18 6 L6 18' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E") center / 13px 13px no-repeat;
}
.itin-map :deep(.itin-map-popup .leaflet-popup-close-button:hover) { background: var(--rm-hover); }

:deep(.itin-pop-img) { width: 100%; height: 120px; background-size: cover; background-position: center; }
:deep(.itin-pop-body) { padding: 12px 14px 14px; }
:deep(.itin-pop-name) { font-weight: 700; font-size: 15px; line-height: 1.25; margin-bottom: 2px; color: var(--rm-biz-text); }
:deep(.itin-pop-cat) { font-size: 12px; color: var(--rm-muted); margin-bottom: 11px; }
.itin-map.day-mode :deep(.itin-pop-cat) { color: #5a4a42; }
/* Tier label inside the popup — mirrors RecommendationMap's rec-pop-tier
   (which itself mirrors JinniChat's partner-label colours). */
:deep(.itin-pop-tier) {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
  margin: -4px 0 11px;
}
:deep(.itin-pop-tier svg) { width: 12px; height: 12px; flex-shrink: 0; }
:deep(.itin-pop-tier--signature) { color: #FF8C00; }
:deep(.itin-pop-tier--spotlight) { color: #3b9edd; }
:deep(.itin-pop-tier--verified)  { color: #27ae60; }
/* Tier-coloured place name, matching the rec map's popup palette */
:deep(.itin-pop-body--signature .itin-pop-name) { color: #FF8C00; }
:deep(.itin-pop-body--spotlight .itin-pop-name) { color: #3b9edd; }
:deep(.itin-pop-body--verified .itin-pop-name)  { color: #27ae60; }

:deep(.itin-pop-actions) { display: flex; flex-wrap: wrap; gap: 7px; }
:deep(.itin-pop-btn) {
  display: inline-flex; align-items: center; gap: 7px; box-sizing: border-box;
  padding: 9px 14px; border: none; border-radius: 22px; text-decoration: none; white-space: nowrap;
  font-family: inherit; font-size: 12.5px; font-weight: 600; line-height: 1; color: var(--rm-text);
  -webkit-appearance: none; appearance: none; cursor: pointer;
  background: var(--rm-glass); box-shadow: var(--rm-glass-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: background 0.2s ease, transform 0.1s ease;
}
:deep(.itin-pop-btn:hover) { background: var(--rm-glass-hover); }
:deep(.itin-pop-btn:active) { transform: scale(0.96); }
:deep(.itin-pop-btn span) { line-height: 1; }
:deep(.itin-pop-btn svg) { width: 15px; height: 15px; flex-shrink: 0; display: block; }

.itin-map.day-mode :deep(.itin-pop-btn), .itin-map.day-mode :deep(.itin-pop-dir) {
  background: rgba(255,255,255,0.55); color: var(--rm-biz-text);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);
}
.itin-map.day-mode :deep(.itin-pop-btn:hover), .itin-map.day-mode :deep(.itin-pop-dir:hover) {
  background: rgba(255,255,255,0.8);
}

/* Directions chooser — hidden until the toggle adds .show-dirs */
:deep(.itin-pop-dirs) { display: none; gap: 7px; margin-top: 8px; }
:deep(.itin-pop.show-dirs .itin-pop-dirs) { display: flex; flex-wrap: wrap; }
:deep(.itin-pop-dir) {
  padding: 8px 14px; border-radius: 20px; font-size: 12.5px; font-weight: 600; text-decoration: none;
  color: var(--rm-text); background: var(--rm-glass); box-shadow: var(--rm-glass-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: background 0.2s ease;
}
:deep(.itin-pop-dir:hover) { background: var(--rm-glass-hover); }
</style>