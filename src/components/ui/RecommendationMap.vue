<template>
  <!-- When fullscreen, teleport to <body> so the fixed overlay escapes any
       transformed/filtered ancestor in JinniChat (otherwise "fullscreen" is
       clipped to that ancestor on mobile). Inline when not fullscreen. -->
  <Teleport to="body" :disabled="!fullscreen">
  <div v-if="mappable.length" class="rec-map" :class="[theme, { 'is-open': expanded, 'is-fullscreen': fullscreen, 'has-cards': showCards, 'popup-open': popupOpen }]">
    <!-- Bar: tap the text to open/close the inline map; one fullscreen button -->
    <div v-show="!fullscreen" class="rec-map-bar">
      <button class="rec-map-toggle" type="button" :aria-expanded="expanded ? 'true' : 'false'" @click="toggle">
        <span class="rec-map-toggle-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          <span>{{ expanded ? hideLabel : showLabel }}</span>
          <span class="rec-map-count">{{ mappable.length }}</span>
        </span>
        <!-- chevron is a state indicator only — clicking anywhere on this button toggles -->
        <svg class="rec-map-chevron" :class="{ open: expanded }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="rec-map-bar-actions">
        <button class="rec-map-iconbtn" type="button" :title="openFullscreenLabel" @click.stop="enterFullscreen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>
    </div>
    <!-- Animated reveal. Body stays in the DOM so Leaflet measures a real box. -->
    <div class="rec-map-body">
      <div class="rec-map-stage">
        <div ref="mapEl" class="rec-map-canvas"></div>
        <!-- Tier filter — one button that opens a chooser (fullscreen only; hidden in route mode) -->
        <div v-if="availableTiers.length && !routeMode && fullscreen" class="rec-map-filterwrap">
          <button type="button" class="rec-map-filterbtn" :style="activeFilter ? { color: tierColor(activeFilter) } : {}" @click.stop="filterOpen = !filterOpen">
            <span class="rec-map-filter-ic" v-html="tierIconSvg(activeFilter || 'all')"></span>
            <span>{{ activeFilter ? tierLabel(activeFilter) : filterAllLabel }}</span>
            <svg class="rec-map-filter-chev" :class="{ open: filterOpen }" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="filterOpen" class="rec-map-filtermenu">
            <button v-for="opt in filterOptions" :key="opt" type="button" class="rec-map-filteropt" :style="opt !== 'all' ? { color: tierColor(opt) } : {}" @click.stop="chooseFilter(opt)">
              <span class="rec-map-filter-ic" v-html="tierIconSvg(opt)"></span>
              <span>{{ opt === 'all' ? filterAllLabel : tierLabel(opt) }}</span>
            </button>
          </div>
        </div>
        <!-- Close / Exit-route button (fullscreen). In route mode it exits the route. -->
        <button v-show="fullscreen" class="rec-map-close-fs" type="button" :title="routeMode ? exitRouteLabel : closeLabel" @click.stop="onCloseButton">
          <svg v-if="routeMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <!-- Locate me (GPS), only in fullscreen, sits just under the close button -->
        <button v-show="fullscreen" class="rec-map-locate-fs" :class="{ 'is-busy': locating }" type="button" :title="locateTitle" @click.stop="goToMyLocation">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <circle cx="12" cy="12" r="7" stroke-dasharray="2 2"/>
          </svg>
        </button>
        <!-- Travel-mode switcher (car ⇄ walking) — under the locate button, only while routing -->
        <button v-show="routeMode" class="rec-map-modeswitch" :class="{ 'is-busy': routing }" type="button" :title="activeProfile === 'driving-car' ? modeCarLabel : modeWalkLabel" @click.stop="toggleProfile">
          <svg v-if="activeProfile === 'driving-car'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="16.5" r="0.7"/><circle cx="16.5" cy="16.5" r="0.7"/><path d="M5 13h14"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="13.5" cy="3.5" r="2"/><path d="M9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/></svg>
        </button>
        <!-- Transient glass toast (e.g. location-permission message) -->
        <div v-if="locateMsg" class="rec-map-toast">{{ locateMsg }}</div>
        <!-- Turn-by-turn banner — next maneuver + metres to it (route mode only) -->
        <div v-if="routeMode && routeStep && !arrived && !wrongWay" class="rec-map-maneuver">
          <span class="rec-map-maneuver-ic" :style="{ color: routeColor }" v-html="maneuverSvg(routeStep.type)"></span>
          <div class="rec-map-maneuver-body">
            <div class="rec-map-maneuver-dist">{{ fmtDistance(routeStep.distance) }}</div>
            <div v-if="routeStep.instruction" class="rec-map-maneuver-instr">{{ routeStep.instruction }}</div>
          </div>
        </div>
        <!-- Wrong-way warning — you're driving against the route; turn around -->
        <div v-if="routeMode && wrongWay && !arrived" class="rec-map-maneuver rec-map-maneuver--warn">
          <span class="rec-map-maneuver-ic" v-html="maneuverSvg(9)"></span>
          <div class="rec-map-maneuver-body">
            <div class="rec-map-maneuver-dist">{{ wrongWayLabel }}</div>
            <div class="rec-map-maneuver-instr">{{ wrongWayHint }}</div>
          </div>
        </div>
        <!-- Arrival banner — shown when the destination is reached -->
        <div v-if="routeMode && arrived" class="rec-map-arrive">
          <span class="rec-map-arrive-ic" :style="{ color: routeColor }">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22V4"/><path d="M5 4h11l-1.5 3.2L16 10H5"/><rect x="5" y="4" width="3.6" height="3" fill="currentColor" stroke="none"/><rect x="12.4" y="4" width="3.6" height="3" fill="currentColor" stroke="none" opacity="0.55"/><rect x="8.6" y="7" width="3.8" height="3" fill="currentColor" stroke="none" opacity="0.55"/></svg>
          </span>
          <div class="rec-map-arrive-body">
            <div class="rec-map-arrive-title">{{ arriveLabel }}</div>
            <div v-if="destName" class="rec-map-arrive-sub">{{ destName }}</div>
          </div>
        </div>
        <!-- Route summary chip — distance / duration, exit-route -->
        <div v-if="routeInfo && !arrived" class="rec-map-routeinfo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="{ color: routeColor }"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
          <span class="rec-map-routeinfo-text">{{ fmtDistance(routeInfo.distance) }}<template v-if="routeInfo.duration != null"> &middot; {{ fmtDuration(routeInfo.duration) }}</template></span>
          <button class="rec-map-routeinfo-clear" type="button" :title="exitRouteLabel" @click.stop="exitRoute">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <!-- ChatGPT-style place carousel (fullscreen, browse mode). Swipe through
             places: the centred card is emphasised and the map flies to it; the
             rest dim. Tapping a card computes distance/duration to that place. -->
        <div v-show="showCards" ref="cardsEl" class="rec-map-cards" @scroll.passive="onCardsScroll" @scrollend="onCardSettle">
          <div
            v-for="m in visibleCards"
            :key="m.index"
            class="rec-map-card"
            :class="{ 'is-active': m.mi === activeCard }"
            :style="cardStyle(m.rec)"
            role="button"
            tabindex="0"
            @click="onCardClick(m.mi)"
            @keydown.enter="onCardClick(m.mi)"
          >
            <div class="rec-map-card-photo" :style="cardPhotoStyle(m.rec)">
              <span class="rec-map-card-num" :style="cardNumStyle(m.rec)">{{ m.mi + 1 }}</span>
            </div>
            <div class="rec-map-card-info">
              <div class="rec-map-card-name">{{ m.rec.name || placeFallbackLabel }}</div>
              <div v-if="cardCat(m.rec)" class="rec-map-card-cat">{{ cardCat(m.rec) }}</div>
              <div
                v-if="cardRoutes[m.mi]"
                class="rec-map-card-route"
                :style="tierColor(tierOf(m.rec)) ? { color: tierColor(tierOf(m.rec)) } : {}"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
                <span>{{ fmtDistance(cardRoutes[m.mi].distance) }}<template v-if="cardRoutes[m.mi].duration != null"> &middot; {{ fmtDuration(cardRoutes[m.mi].duration) }}</template></span>
              </div>
              <div v-else-if="cardLoading === m.mi" class="rec-map-card-route rec-map-card-route--loading">
                <span class="rec-map-card-spinner"></span><span>{{ routingLabel }}</span>
              </div>
              <!-- The single source for computing a route/distance: an explicit tap.
                   Hidden entirely when allowRouting is false (public share). -->
              <button
                v-else-if="allowRouting"
                type="button"
                class="rec-map-card-route rec-map-card-route--cta"
                @click.stop="onCardRoute(m.mi)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 18.4h6.2a2.8 2.8 0 0 0 0-5.6H9.4a2.8 2.8 0 0 1 0-5.6h6.2"/></svg>
                <span>{{ showRouteLabel }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>



<script>
// Leaflet is loaded from a CDN at runtime (same approach as MapSelector.vue) —
// NOT an npm package. The shared promise injects the script/CSS only once.
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
    // leaflet-rotate adds map.setBearing() for heading-up navigation. Best-effort:
    // if it can't load we resolve anyway and the map simply stays north-up.
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
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletPromise;
}
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('/api/')) return `${API_BASE}${url}`;
  return url;
}
// Tiles match MapSelector.vue: voyager (day) / light_all (night).
// dark_all is intentionally NOT used — it renders effectively invisible here.
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
// One pmtiles layer per theme. Night flavor chosen against JinniChat's night
// chrome (deep purple-navy #0a0118→#1a0b2e→#16213e, violet accents): protomaps
// 'dark' sits naturally under it. Founder wants it deeper? — change to 'black'.
function pmLayer(theme) {
  return window.protomapsL.leafletLayer({
    url: PMTILES_URL,
    flavor: theme === 'night-mode' ? 'dark' : 'light',
    lang: 'en',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
}
// Driving marker: a Google-style navigation chevron (coloured fill, white
// casing), pointing "up". Heading is applied by rotating the wrapper (north-up)
// or by rotating the whole map (heading-up), so the glyph itself stays upright.
function navArrowSvg(color) {
  return `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M12 2.4 L19.4 20.4 a0.6 0.6 0 0 1-0.85 0.72 L12 17.6 L5.45 21.12 a0.6 0.6 0 0 1-0.85-0.72 Z" fill="${color || '#1a73e8'}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

export default {
  name: 'RecommendationMap',
  props: {
    recommendations: { type: Array, default: () => [] },
    theme: { type: String, default: 'day-mode' },
    autoOpen: { type: Boolean, default: false },
    showLabel: { type: String, default: 'Show on map' },
    hideLabel: { type: String, default: 'Hide map' },
    // Text props so the parent can pass translated strings (like showLabel/hideLabel).
    locateTitle: { type: String, default: 'My location' },
    youAreHereLabel: { type: String, default: 'You are here' },
    // Shown when the user has location turned off / not permitted.
    locationDeniedLabel: { type: String, default: "Location is off. Turn it on for this site in your browser/phone settings to use this." },
    locationUnavailableLabel: { type: String, default: "Couldn't get your location. Please try again." },
    // Shown when the device simply has no way to locate itself (e.g. a desktop
    // with no GPS and no network-location provider) rather than a denied permission.
    locationUnsupportedLabel: { type: String, default: "This device can't pinpoint your location." },
    locationApproxLabel: { type: String, default: 'Using your approximate location.' },
    // Coarse IP-based geolocation fallback for devices without GPS. ipLocationUrl
    // must return JSON with latitude/longitude (the default is a free, key-less,
    // CORS-enabled service; point it at your own backend to avoid the third party).
    ipFallback: { type: Boolean, default: true },
    ipLocationUrl: { type: String, default: 'https://ipwho.is/' },
    // Routing
    // Master switch for server-side routing. Defaults to true so the in-app
    // behaviour is unchanged; public/unauthenticated hosts (the share page)
    // pass false so no visitor can spend ORS quota via /api/routing/directions.
    // This is a UX guard, NOT a security control — the endpoint itself must
    // still be rate-limited and authenticated server-side.
    allowRouting: { type: Boolean, default: true },
    routeProfile: { type: String, default: 'driving-car' }, // ORS profile
    // Language for turn-by-turn instructions (ORS code, e.g. 'en', 'ru', 'hy').
    routeLanguage: { type: String, default: 'en' },
    routeFromMeLabel: { type: String, default: 'Route from here' },
    clearRouteLabel: { type: String, default: 'Clear route' },
    routingLabel: { type: String, default: 'Finding route\u2026' },
    routeErrorLabel: { type: String, default: "Couldn't find a route." },
    // Shown on a card before its distance/time is calculated — tapping the card
    // runs the calculation (we no longer calculate automatically on swipe).
    showRouteLabel: { type: String, default: 'Tap for distance' },
    modeCarLabel: { type: String, default: 'Driving' },
    modeWalkLabel: { type: String, default: 'Walking' },
    modeCycleLabel: { type: String, default: 'Cycling' },
    // Tiers / filter / details
    detailsLabel: { type: String, default: 'Details' },
    filterAllLabel: { type: String, default: 'All' },
    tierSignatureLabel: { type: String, default: "Jinni's Signature" },
    tierSpotlightLabel: { type: String, default: "Jinni's Spotlight" },
    tierVerifiedLabel: { type: String, default: 'Jinni Verified' },
    // Route mode / directions chooser
    exitRouteLabel: { type: String, default: 'Exit route' },
    // Arrival (route termination)
    arriveLabel: { type: String, default: "You've arrived" },
    doneLabel: { type: String, default: 'Done' },
    // Shown for a U-turn maneuver (overrides ORS text when the route doubles back).
    uturnLabel: { type: String, default: 'Make a U-turn' },
    // Shown when driving the wrong way down the route (held ~8 s).
    wrongWayLabel: { type: String, default: 'Turn around' },
    wrongWayHint: { type: String, default: 'You\u2019re heading away from the route' },
    directionsLabel: { type: String, default: 'Directions' },
    transitLabel: { type: String, default: 'Transit' },
    // Popup action buttons (phone / website).
    callLabel: { type: String, default: 'Call' },
    websiteLabel: { type: String, default: 'Website' },
    // Previously hardcoded in the template / formatters — now translatable.
    openFullscreenLabel: { type: String, default: 'Open full screen' },
    closeLabel: { type: String, default: 'Close (Esc)' },
    placeFallbackLabel: { type: String, default: 'Place' },
    // Distance / duration units, used by fmtDistance / fmtDuration.
    unitKm: { type: String, default: 'km' },
    unitMeter: { type: String, default: 'm' },
    unitMinute: { type: String, default: 'min' },
    unitHour: { type: String, default: 'h' },
  },
  emits: ['marker-click', 'opened', 'view-details', 'track'],
  data() { return { L: null, map: null, tileLayer: null, markerLayer: null, expanded: false, fullscreen: false, locating: false, locateMsg: null, locationMarker: null, accuracyCircle: null, myCoords: null, routeLayer: null, routeInfo: null, routing: false, activeProfile: this.routeProfile, activeFilter: null, routeColor: '#4285F4', routeMode: false, filterOpen: false, activeCard: 0, cardRoutes: {}, cardLoading: null, routeStep: null, arrived: false, destName: '', wrongWay: false, popupOpen: false } },
  computed: {
    mappable() {
      return (this.recommendations || [])
        .map((rec, index) => {
          const lat = this.num(rec.latitude ?? rec.lat ?? rec.coordinates?.lat);
          const lng = this.num(rec.longitude ?? rec.lng ?? rec.coordinates?.lng);
          return lat != null && lng != null ? { rec, index, lat, lng } : null;
        })
        .filter(Boolean);
    },
    // Distinct partner tiers present in the current results, in display order.
    availableTiers() {
      const present = new Set();
      this.mappable.forEach(({ rec }) => { const t = this.tierOf(rec); if (t) present.add(t); });
      return ['signature', 'spotlight', 'verified'].filter(t => present.has(t));
    },
    // Options shown in the open chooser = everything except the current selection.
    filterOptions() {
      const all = ['all', ...this.availableTiers];
      const current = this.activeFilter || 'all';
      return all.filter(o => o !== current);
    },
    // The bottom place-carousel only shows in fullscreen browse mode (route mode
    // takes over the screen with its own framing + summary chip).
    showCards() {
      return this.fullscreen && !this.routeMode && this.mappable.length > 0;
    },
    // Cards to show in the carousel — same set as the visible pins, so the tier
    // filter narrows the strip too. `mi` is the position in `mappable` (== the
    // marker's _recRef.i and the pin's number), kept stable across filtering.
    visibleCards() {
      return this.mappable
        .map((m, i) => ({ ...m, mi: i }))
        .filter(m => !this.activeFilter || this.tierOf(m.rec) === this.activeFilter);
    },
  },
  watch: {
    theme() {
      if (!this.tileLayer || !this.map) return;
      if (this._pmtiles) {
        // Flavors are baked into the layer — swap it for the other theme's.
        this.map.removeLayer(this.tileLayer);
        this.tileLayer = pmLayer(this.theme).addTo(this.map);
        return;
      }
      this.tileLayer.setUrl(this.tileUrl());
    },
    recommendations() { if (this.map) { this.activeFilter = null; this.cardRoutes = {}; this.activeCard = 0; this.exitRoute(); this.renderMarkers(); this.$nextTick(() => this.initCards()); } },
  },
  mounted() { if (this.autoOpen && this.mappable.length) this.open(); },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onEsc);
    if (this.fullscreen) document.body.style.overflow = this._prevBodyOverflow || '';
    clearTimeout(this._locateMsgTimer);
    clearTimeout(this._deselectTimer);
    this.stopLiveTracking();
    this.destroyMap();
  },

  methods: {
    num(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : null; },
    // Mirror of JinniChat's partner-tier logic so the map matches the chat cards.
    tierOf(rec) {
      if (!rec) return null;
      const isPartner = rec.verifiedId || (rec.id && String(rec.id).startsWith('db-'));
      if (!isPartner || rec._verifiedModel === 'destination') return null;
      const t = rec.partnerTier;
      if (t === 'featured' || t === 'signature') return 'signature';
      if (t === 'spotlight') return 'spotlight';
      return 'verified';
    },
    // A "business" = a partner listing (has a tier). Destinations/plain places aren't.
    isBusiness(rec) {
      if (!rec || rec._verifiedModel === 'destination') return false;
      return !!(rec.verifiedId || (rec.id && String(rec.id).startsWith('db-')));
    },
    tierColor(tier) {
      // Accent/fill colours — matched to BusinessOnboarding (pills/terms/dots).
      return tier === 'signature' ? '#D4AF37'
        : tier === 'spotlight' ? '#3b9edd'
        : tier === 'verified' ? '#4CAF50'
        : null;                                          // non-partner → default styling
    },
    // Soft tier-tint fills — identical to JinniChat's .card-glow--* card backgrounds
    // so the map popup reads as the same component as the chat card.
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
    setFilter(tier) {
      this.activeFilter = tier;                          // null = show all
      this.exitRoute();                                  // clear any active route/route mode
      this.applyFilter();
      // Re-frame the map to what's now visible and refocus the carousel on the
      // first visible card (the old active card may have been filtered out).
      this.$nextTick(() => { this.fitToMarkers(); this.initCards(); });
    },
    chooseFilter(opt) {
      this.setFilter(opt === 'all' ? null : opt);
      this.filterOpen = false;
    },
    // Tier glyphs mirrored from JinniChat's getPartnerIcon so the map matches the chat.
    tierIconSvg(tier) {
      if (tier === 'signature') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      if (tier === 'spotlight') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5" stroke="none"/><line x1="12" y1="1.5" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.5"/><line x1="3.8" y1="3.8" x2="5.5" y2="5.5"/><line x1="18.5" y1="18.5" x2="20.2" y2="20.2"/><line x1="1.5" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.5" y2="12"/><line x1="3.8" y1="20.2" x2="5.5" y2="18.5"/><line x1="18.5" y1="5.5" x2="20.2" y2="3.8"/></svg>';
      if (tier === 'verified') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      // 'all'
      return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';
    },
    applyFilter() {
      (this._markers || []).forEach((m) => {
        if (!m._icon || !m._recRef) return;
        const hide = this.activeFilter && this.tierOf(m._recRef.rec) !== this.activeFilter;
        m._icon.classList.toggle('rm-pin-filtered', !!hide);
      });
    },
    tileUrl() { return this.theme === 'night-mode' ? TILE_NIGHT : TILE_DAY; },
    toggle() { this.expanded ? this.close() : this.open(); },

    async ensureMap() {
      if (!this.L) {
        try { this.L = await loadLeaflet(); }
        catch (e) { console.error('[RecommendationMap] Leaflet failed to load', e); return false; }
      }
      return true;
    },
    async open() {
      this.expanded = true;
      if (!(await this.ensureMap())) return;
      this.$nextTick(() => {
        if (!this.map) this.initMap();
        [80, 380].forEach(ms => setTimeout(() => this.safeInvalidate(), ms));
        setTimeout(() => this.fitToMarkers(), 400);
      });
      this.$emit('opened');
    },
    close() { this.expanded = false; },
    async enterFullscreen() {
      this.expanded = true;            // keep inline state coherent for when we exit
      if (!(await this.ensureMap())) return;
      this.fullscreen = true;
      document.addEventListener('keydown', this.onEsc);
      // Lock the page behind the fullscreen overlay (prevents scroll bleed on mobile).
      this._prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.$nextTick(() => {
        if (!this.map) this.initMap();
        // Reposition zoom to bottom-right for fullscreen (thumb-reachable, clear
        // of the top-right close button).
        if (this.map && this.map.zoomControl) this.map.zoomControl.setPosition('bottomright');
        // Re-measure after the teleport + layout settle (mobile needs the later pass).
        [80, 250, 450].forEach(ms => setTimeout(() => { if (this.map) { this.map.scrollWheelZoom.enable(); this.safeInvalidate(); this.fitToMarkers(); } }, ms));
        setTimeout(() => this.initCards(), 220);
        // If we already know where the user is, start following them live.
        this.ensureTracking();
      });
      this.$emit('opened');
    },
    exitFullscreen() {
      this.fullscreen = false;
      this.stopLiveTracking();          // drop the live GPS watch when the big map closes
      document.removeEventListener('keydown', this.onEsc);
      document.body.style.overflow = this._prevBodyOverflow || '';
      if (this.map && this.map.zoomControl) this.map.zoomControl.setPosition('topleft');
      this.$nextTick(() => setTimeout(() => { if (this.map) { this.map.scrollWheelZoom.disable(); this.safeInvalidate(); this.fitToMarkers(); } }, 80));
    },
    // invalidateSize fires Leaflet's internal pan/zoom handlers; if a popup is
    // mid-close or the map is tearing down, those can throw. Swallow it.
    safeInvalidate() {
      try { if (this.map && this.map._container) this.map.invalidateSize(); } catch (e) { /* map busy/torn down */ }
    },
    onEsc(e) { if (e.key === 'Escape') { if (this.routeMode) this.exitRoute(); else if (this.fullscreen) this.exitFullscreen(); } },
    showLocateMsg(msg) {
      this.locateMsg = msg;
      clearTimeout(this._locateMsgTimer);
      this._locateMsgTimer = setTimeout(() => { this.locateMsg = null; }, 4500);
    },
    // Render/move the driver marker only (no camera, no myCoords side-effects).
    // Reuses the existing marker when the glyph type is unchanged, so position
    // updates glide via CSS transition instead of a teardown/rebuild flicker.
    updateDriverMarker(lat, lng, { heading = null, speed = null, accuracy = null } = {}) {
      if (!this.map || !this.L) return;
      const L = this.L;
      const moving = Number.isFinite(speed) && speed >= 2.2 && Number.isFinite(heading);
      const type = moving ? 'arrow' : 'dot';
      const color = (this.routeMode && this.routeColor) ? this.routeColor : '#1a73e8';
      // Point the arrow at the heading, UNLESS we're in heading-up route mode (then
      // the map rotates and the glyph stays upright). Browsing/ambient/arrived is north-up.
      const headingUp = this.routeMode && this._rotateEnabled && !this.arrived;
      const glyphRot = (moving && !headingUp) ? heading : 0;
      if (this.accuracyCircle) { this.accuracyCircle.remove(); this.accuracyCircle = null; }
      if (!moving && !this.routeMode && Number.isFinite(accuracy) && accuracy > 0) {
        this.accuracyCircle = L.circle([lat, lng], {
          radius: accuracy, color: '#4285F4', weight: 1, opacity: 0.35,
          fillColor: '#4285F4', fillOpacity: 0.12, interactive: false,
        }).addTo(this.map);
      }
      if (this.locationMarker && this._meType === type && this._meColor === color) {
        this.locationMarker.setLatLng([lat, lng]);
        if (type === 'arrow') {
          const el = this.locationMarker.getElement && this.locationMarker.getElement();
          const a = el && el.querySelector('.rec-map-mearrow');
          if (a) a.style.transform = `rotate(${glyphRot}deg)`;
        }
      } else {
        if (this.locationMarker) this.locationMarker.remove();
        const icon = moving
          ? L.divIcon({ className: 'rec-map-medot-wrap', html: `<div class="rec-map-mearrow" style="transform:rotate(${glyphRot}deg)">${navArrowSvg(color)}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] })
          : L.divIcon({ className: 'rec-map-medot-wrap', html: `<div class="rec-map-medot" style="background:${color}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
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
    // Get the user's position. Tries precise (GPS / browser network) location
    // first, then falls back to a coarse IP-based lookup for devices with no GPS,
    // and only nags once (with a cooldown) when nothing at all is available.
    // Returns { lat, lng, accuracy } or null. force:true (the Locate button)
    // bypasses the post-failure cooldown.
    async acquireMyLocation({ force = false } = {}) {
      if (!force && this._geoCooldownUntil && Date.now() < this._geoCooldownUntil) return null;
      // 1. Precise location.
      const precise = await this.tryPreciseLocation();
      if (precise) return precise;
      // 2. Coarse IP-based fallback (no GPS required).
      if (this.ipFallback) {
        const ip = await this.tryIpLocation();
        if (ip) { this.showLocateMsgOnce(this.locationApproxLabel); return ip; }
      }
      // 3. Nothing worked — surface the most accurate reason once, then back off
      //    so we don't repeat it on every tap.
      this._geoCooldownUntil = Date.now() + 60000;
      this.showLocateMsgOnce(this._lastGeoReason || this.locationUnavailableLabel);
      return null;
    },
    // Precise location via the Geolocation API. Returns coords or null, and records
    // the reason for failure in _lastGeoReason (without showing it — acquireMyLocation
    // decides whether a message is still needed after the IP fallback).
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
        if (e && e.code === 1) this._lastGeoReason = this.locationDeniedLabel;            // user blocked it
        else if (e && e.code === 2) this._lastGeoReason = this.locationUnsupportedLabel;  // no GPS / no provider
        else this._lastGeoReason = this.locationUnavailableLabel;                          // timeout / other
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
        if (data && data.success === false) return null;                 // e.g. rate-limited
        const lat = this.num(data.latitude ?? data.lat);
        const lng = this.num(data.longitude ?? data.lng ?? data.lon);
        if (lat != null && lng != null) {
          this._ipCoords = { lat, lng, accuracy: null, approximate: true };
          return this._ipCoords;
        }
      } catch (e) { /* offline / blocked / CORS — give up quietly */ }
      return null;
    },
    // Like showLocateMsg, but won't repeat the same message within 30s (stops the
    // toast firing on every interaction when location can't be obtained).
    showLocateMsgOnce(msg) {
      const now = Date.now();
      if (this._lastMsg === msg && now - (this._lastMsgAt || 0) < 30000) return;
      this._lastMsg = msg; this._lastMsgAt = now;
      this.showLocateMsg(msg);
    },
    async goToMyLocation() {
      if (this.locating) return;
      this.locating = true;
      try {
        const c = await this.acquireMyLocation({ force: true });
        if (c) {
          this.setMyLocation(c.lat, c.lng, c.accuracy, { fly: true });
          this.ensureTracking();           // keep following live (so the dot can't go stale while driving)
        }
      } finally {
        this.locating = false;
      }
    },
    // Route from the user's location to `to` ({ lat, lng }). Uses the existing dot
    // as the start if we have it; otherwise asks for location first.
    // Draw a route from the user to `to` ({ lat, lng }). Returns true on success.
    // Caches by start+destination so clicking the same place doesn't re-spend quota.
    async drawRoute(to, { live = false } = {}) {
      // Single choke point for /api/routing/directions — gating here covers every
      // entry path (card CTA, marker route mode, toggleProfile, live re-routes).
      if (!this.allowRouting) return false;
      if (this.routing || !to) return false;
      let from = this.myCoords;
      if (!from) {
        const c = await this.acquireMyLocation();
        if (!c) return false;                            // toast already shown
        this.setMyLocation(c.lat, c.lng, c.accuracy, { fly: false });
        from = this.myCoords;
      }
      if (!this._routeCache) this._routeCache = new Map();
      const profile = this.activeProfile || this.routeProfile;
      // Round the start (~11 m) so tiny GPS jitter still hits the cache.
      // Language is part of the key so switching app language re-fetches the
      // route (instructions are localized server-side) instead of reusing a
      // cached set of steps in the previous language.
      const key = `${profile}|${from.lat.toFixed(4)},${from.lng.toFixed(4)}|${to.lat.toFixed(5)},${to.lng.toFixed(5)}|${this.routeLanguage || 'en'}`;
      const cached = this._routeCache.get(key);
      if (cached) { this.renderRoute(cached.geometry, cached.distance, cached.duration, { fit: !live, steps: cached.steps }); return true; }

      this.routing = true;
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
        this._routeCache.set(key, { geometry: data.geometry, distance: data.distance, duration: data.duration, steps: data.steps || null });
        this.renderRoute(data.geometry, data.distance, data.duration, { fit: !live, steps: data.steps });
        return true;
      } catch (e) {
        if (!live) this.showLocateMsg(this.routeErrorLabel);
        return false;
      } finally {
        this.routing = false;
      }
    },
    renderRoute(geometry, distance, duration, { fit = true, steps = null } = {}) {
      if (!this.map || !this.L) return;
      this.clearRoute();
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
      // A single clean line in the place's tier colour — no casing. Rendered as a
      // plain polyline (not geoJSON) so we can trim the already-driven part live.
      const style = { interactive: false, color: this.routeColor || '#4285F4', weight: 5, opacity: 1, lineJoin: 'round', lineCap: 'round' };
      this.routeLayer = (this._routeCoords.length >= 2)
        ? L.polyline(this._routeCoords, style).addTo(this.map)
        : L.geoJSON(geometry, { interactive: false, style }).addTo(this.map);
      if (fit) {
        try {
          // One camera move only. Extra top padding leaves room for the
          // destination popup (which opens upward) so we don't need panInside —
          // that second nudge is what made the map shuffle left/right.
          this.map.fitBounds(this.routeLayer.getBounds(), { paddingTopLeft: [40, 220], paddingBottomRight: [40, 64], maxZoom: 16, animate: false });
        } catch (e) { /* empty bounds */ }
      } else if (this.myCoords) {
        // Live re-route while driving: don't yank the zoom — keep the driver centred.
        this.map.panTo([this.myCoords.lat, this.myCoords.lng], { animate: true, duration: 0.6 });
      }
      // Keep the ORS totals + the polyline's own length, so the live trim can
      // report remaining distance/time by ratio without re-querying ORS.
      this._routeTotal = { distance, duration, len: this.coordsLength(this._routeCoords) };
      this.routeInfo = { distance, duration };
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
    clearRoute() {
      if (this.routeLayer) { this.routeLayer.remove(); this.routeLayer = null; }
      this.routeInfo = null;
      this._routeCoords = null;
      this._routeTotal = null;
      this._routeSteps = null;
      this._routeCum = null;
      this._drvProgress = 0; this._segHint = 0; this._drvPos = null;
      this._progPeak = 0;
      this.wrongWay = false; this._wrongWayUntil = 0;
      this._bearingTarget = null; this._bearingCur = 0;
      this.cancelDriverAnim();
      this.routeStep = null;
      this.arrived = false;
      this.destName = '';
    },
    // Enter route mode: hide the other places, route to the picked one, and start
    // tracking the user's GPS live so the "you are here" dot follows them.
    async selectPlace(marker) {
      if (!marker || !marker._recRef) return;
      this.arrived = false;
      this._navMoved = false;
      this.wrongWay = false; this._wrongWayUntil = 0; this._progPeak = 0;
      this._bearingTarget = null; this._bearingCur = 0;
      if (this._rotateEnabled && this.map) { try { this.map.setBearing(0); } catch (e) { /* noop */ } }
      this.destName = (marker._recRef.rec && marker._recRef.rec.name) || '';
      this.routeColor = this.tierColor(this.tierOf(marker._recRef.rec)) || '#4285F4';
      this._routeTo = { lat: marker._recRef.lat, lng: marker._recRef.lng };
      const ok = await this.drawRoute(this._routeTo);
      if (ok) {
        this.routeMode = true;
        this.setPinsHidden(marker._recRef.i);            // remove the other places
        this.ensureTracking();
      } else {
        this._routeTo = null;
      }
    },
    // Leave route mode: clear the route, bring every place back. The live location
    // watch stays on (we're still in the full-screen map) so the dot keeps tracking.
    exitRoute() {
      if (this.map) this.map.closePopup();
      clearTimeout(this._arriveTimer);
      this.cancelDriverAnim();
      this.clearRoute();
      this.setPinsHidden(null);
      this.routeMode = false;
      this._routeTo = null;
      this.routeColor = '#4285F4';
      // Revert the directional arrow to a plain dot once we're out of route mode.
      if (this.myCoords) this.updateDriverMarker(this.myCoords.lat, this.myCoords.lng, { speed: 0 });
      // Back to north-up for browsing.
      if (this._rotateEnabled && this.map) { try { this.map.setBearing(0); } catch (e) { /* noop */ } }
    },
    // The fullscreen × : exit the route first if one is active, otherwise close.
    onCloseButton() { if (this.routeMode) this.exitRoute(); else this.exitFullscreen(); },
    // keepIndex = the marker to keep visible (null = show all). Hides the rest.
    // Compares by index so it works regardless of object proxying.
    setPinsHidden(keepIndex) {
      (this._markers || []).forEach((m) => {
        if (!m._icon || !m._recRef) return;
        m._icon.classList.toggle('rm-pin-hidden', keepIndex != null && m._recRef.i !== keepIndex);
      });
    },
    // Keep a single live GPS watch running the whole time the full-screen map is
    // open (once we actually have a location, i.e. permission was granted), so the
    // dot tracks the user continuously — route or not. Idempotent: safe to call
    // from anywhere. Never starts a watch unsolicited (guarded on myCoords), so it
    // can't trigger a permission prompt on its own.
    ensureTracking() {
      if (!navigator.geolocation || !this.fullscreen || !this.myCoords) return;
      if (this._watchId != null) return;                       // already watching
      this._watchId = navigator.geolocation.watchPosition(
        (pos) => this.onLivePosition(pos),
        () => { /* keep the last known dot on transient errors */ },
        { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 },
      );
    },
    // Live GPS tick while routing: move the puck (snapped to the route so it
    // hugs the line), follow + rotate the camera, detect arrival, and re-route on
    // a wrong turn or a wrong-way (U-turn) situation.
    onLivePosition(pos) {
      const { latitude, longitude, accuracy, heading, speed } = pos.coords;
      const moving = Number.isFinite(speed) && speed >= 2.2;    // ≈8 km/h+
      if (moving) this._navMoved = true;                        // nav is underway
      this.myCoords = { lat: latitude, lng: longitude };        // routing truth = raw GPS

      const routing = this.routeMode && this._routeTo && !this.arrived
        && this._routeCoords && this._routeCoords.length >= 2;
      if (!routing) {
        this.cancelDriverAnim();
        this.updateDriverMarker(latitude, longitude, { heading, speed, accuracy });
        return;
      }

      const near = this.nearestOnRoute(latitude, longitude);
      const off = near ? near.dist : Infinity;
      const SNAP = 22;                                           // snap-to-route radius
      const now = Date.now();

      // Arrival: trigger when we reach the END OF THE ROUTE (driving is done) — the
      // routed end is the closest road point to the place, which can be >28 m from
      // the business pin, so keying arrival on the pin alone could loop forever.
      const totalLen = (this._routeCum && this._routeCum.length) ? this._routeCum[this._routeCum.length - 1] : 0;
      const remainingToEnd = near ? Math.max(0, totalLen - this.progressOf(near)) : Infinity;
      if (remainingToEnd <= 25 || this.haversine(latitude, longitude, this._routeTo.lat, this._routeTo.lng) <= 28) {
        this.onArrive(); return;
      }

      // Wrong-way detection. The reliable signal isn't heading (noisy) but
      // PROGRESS regressing: track the furthest point reached along the route, and
      // if we slip back from it while moving, we're driving the wrong way — the
      // tail is getting longer. Heading-opposed is a secondary trigger.
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

      // Re-route on a real detour OR a wrong-way situation. Routing from the
      // current GPS, ORS returns a route that heads back toward the destination —
      // i.e. it understands we went the wrong way and guides us to turn around.
      // Debounced: a single noisy GPS fix shouldn't spend an ORS call — the
      // condition must persist for a couple of fixes, and we throttle to 8 s.
      const needsReroute = (off > 45 || isWrong);
      this._badFixes = needsReroute ? (this._badFixes || 0) + 1 : 0;
      if (this._badFixes >= 2 && !this.routing && now - (this._lastReroute || 0) > 8000) {
        this._lastReroute = now;
        this._badFixes = 0;
        this._drvSnapped = false;
        this.cancelDriverAnim();
        this.updateDriverMarker(latitude, longitude, { heading, speed, accuracy });
        this.drawRoute(this._routeTo, { live: true });
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
      // speed-matched altitude. Altitude settles even when stopped; we only chase
      // the position while actually moving (so a parked GPS jitter can't drift us).
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
    // Comfortable map "altitude" for the current speed — faster ⇒ zoomed out so
    // you can see further ahead; slow ⇒ zoomed in. Hysteresis in the caller keeps
    // it from flapping between levels.
    desiredZoom(speed) {
      const kmh = (Number.isFinite(speed) ? speed : 0) * 3.6;
      if (kmh < 15) return 18;     // stopped / crawling — close in
      if (kmh < 35) return 17;
      if (kmh < 60) return 16;
      if (kmh < 90) return 15;
      return 14;                   // highway — but never as far out as before
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
    // Trim the rendered route so it begins at distance `d` along the line.
    trimToProgress(d) {
      if (!this.routeLayer || typeof this.routeLayer.setLatLngs !== 'function') return;
      const p = this.pointAtDistance(d);
      if (!p) return;
      const remaining = [[p.lat, p.lng], ...this._routeCoords.slice(p.seg + 1)];
      if (remaining.length < 2) return;
      try { this.routeLayer.setLatLngs(remaining); } catch (e) { /* noop */ }
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
      // Only the loop drives the puck/tail while snapped to the route; off the line
      // the marker is shown at raw GPS and the loop just eases the bearing.
      if (this._drvSnapped) {
        const d = this._animFromD + (this._animToD - this._animFromD) * k;
        this._drvProgress = d;
        const p = this.pointAtDistance(d);
        if (p && this.locationMarker) {
          this.locationMarker.setLatLng([p.lat, p.lng]);
          this._drvPos = { lat: p.lat, lng: p.lng };
          if (this.routeLayer && typeof this.routeLayer.setLatLngs === 'function') {
            const remaining = [[p.lat, p.lng], ...this._routeCoords.slice(p.seg + 1)];
            if (remaining.length >= 2) { try { this.routeLayer.setLatLngs(remaining); } catch (e) { /* noop */ } }
          }
        }
      }
      // Ease the heading-up rotation toward its target so the map turns smoothly
      // instead of snapping once per GPS fix.
      let turning = false;
      if (this._rotateEnabled && this._bearingTarget != null && this.map && this.map.setBearing) {
        const cur = (this._bearingCur == null) ? this._bearingTarget : this._bearingCur;
        const delta = (((this._bearingTarget - cur) % 360) + 540) % 360 - 180;   // shortest signed turn
        if (Math.abs(delta) > 0.25) {
          this._bearingCur = (cur + delta * 0.10 + 360) % 360;                    // 10%/frame ease — spreads the turn out
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
      const color = (this.routeMode && this.routeColor) ? this.routeColor : '#1a73e8';
      const glyphRot = (moving && !this._rotateEnabled) ? heading : 0;
      if (this.locationMarker && this._meType === type && this._meColor === color) {
        if (type === 'arrow') {
          const el = this.locationMarker.getElement && this.locationMarker.getElement();
          const a = el && el.querySelector('.rec-map-mearrow');
          if (a) a.style.transform = `rotate(${glyphRot}deg)`;
        }
        return;
      }
      const at = this._drvPos || this.myCoords || { lat: 0, lng: 0 };
      if (this.locationMarker) this.locationMarker.remove();
      const html = moving
        ? `<div class="rec-map-mearrow" style="transform:rotate(${glyphRot}deg)">${navArrowSvg(color)}</div>`
        : `<div class="rec-map-medot" style="background:${color}"></div>`;
      this.locationMarker = L.marker([at.lat, at.lng], {
        icon: L.divIcon({ className: 'rec-map-medot-wrap', html, iconSize: moving ? [36, 36] : [18, 18], iconAnchor: moving ? [18, 18] : [9, 9] }),
        interactive: !!this.youAreHereLabel, keyboard: false, zIndexOffset: 1000,
      }).addTo(this.map);
      if (this.youAreHereLabel) this.locationMarker.bindPopup(this.youAreHereLabel, { autoPan: false });
      this._meType = type; this._meColor = color;
    },
    // Arrival: stop tracking, square the map up, show the finish banner.
    onArrive() {
      this.arrived = true;
      this.routeStep = null;
      this.routeInfo = { distance: 0, duration: 0 };
      this._bearingTarget = null;                                 // stop heading-up easing
      this.cancelDriverAnim();                                    // stop the nav animation, keep the live watch
      // Drop the directional triangle — show a plain "you are here" dot instead, so
      // it doesn't linger pointing somewhere after you've stopped.
      if (this.myCoords) this.updateDriverMarker(this.myCoords.lat, this.myCoords.lng, { speed: 0 });
      if (this.routeLayer && typeof this.routeLayer.setLatLngs === 'function') {
        try { this.routeLayer.setLatLngs([]); } catch (e) { /* noop */ }   // route fully consumed
      }
      if (this._rotateEnabled && this.map) { try { this.map.setBearing(0); } catch (e) { /* noop */ } this._bearingCur = 0; }
      if (this.map && this._routeTo) this.map.panTo([this._routeTo.lat, this._routeTo.lng], { animate: true, duration: 0.6 });
      // Show "You've arrived" briefly, then finish the route on its own.
      clearTimeout(this._arriveTimer);
      this._arriveTimer = setTimeout(() => { this.exitRoute(); }, 5000);
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
    // Shortest distance (metres) from a point to the rendered route polyline.
    distanceToRoute(lat, lng) {
      const c = this._routeCoords;
      if (!c || c.length < 2) return 0;
      let min = Infinity;
      for (let i = 0; i < c.length - 1; i++) {
        const d = this.metresPointToSeg([lat, lng], c[i], c[i + 1]);
        if (d < min) min = d;
      }
      return min === Infinity ? 0 : min;
    },
    // Nearest point on the route to (lat,lng): returns the projected point on the
    // line, which segment it sits on, and the distance. Used to trim the driven part.
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
    // Repaint the route starting at the driver's current position: keep the
    // projected point + every coordinate ahead of the matched segment, drop the
    // rest. _routeCoords stays the full route, so this is recomputed each tick
    // (never destructive) and resets cleanly on a re-route.
    trimRouteBehind(lat, lng) {
      if (!this.routeLayer || typeof this.routeLayer.setLatLngs !== 'function') return;
      const near = this.nearestOnRoute(lat, lng);
      if (!near) return;
      const remaining = [near.point, ...this._routeCoords.slice(near.seg + 1)];
      if (remaining.length < 2) return;                  // basically arrived
      try { this.routeLayer.setLatLngs(remaining); } catch (e) { /* noop */ }
      // Count the chip's distance/time down to match the road still ahead. Scaled
      // by how much of the line is left — no ORS re-query, so it's free. (Duration
      // is proportional, so it's an estimate, not a per-road-speed ETA.)
      const t = this._routeTotal;
      if (t && t.len > 0) {
        const ratio = Math.max(0, Math.min(1, this.coordsLength(remaining) / t.len));
        this.routeInfo = {
          distance: t.distance != null ? t.distance * ratio : null,
          duration: t.duration != null ? t.duration * ratio : null,
        };
      }
    },
    // Total geodesic length (metres) of a [[lat,lng],…] polyline. Haversine per
    // segment — cheap enough to run every GPS tick.
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
    // ORS steps. `near` is the result of nearestOnRoute (the driver's spot on the
    // line). Sets this.routeStep = { type, instruction, name, distance } or null.
    computeManeuver(near) {
      const steps = this._routeSteps, c = this._routeCoords, cum = this._routeCum;
      if (!steps || !steps.length || !c || c.length < 2 || !near) { this.routeStep = null; return; }
      const curIdx = near.seg;                       // segment the driver is on (coords[curIdx]→[curIdx+1])
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
      // U-turn even when ORS labelled it a sharp left/right. Fixes "turn left" being
      // shown where the line clearly doubles back.
      if (type !== 10 && this.angleDiff(this.segBearing(at - 4, at), this.segBearing(at, at + 4)) > 150) {
        type = 9;
        if (this.uturnLabel) instruction = this.uturnLabel;
      }
      const dist = (cum && cum[at] != null)
        ? Math.max(0, cum[at] - this.progressOf(near))
        : this.coordsLength([near.point, ...c.slice(curIdx + 1, at + 1)]);
      this.routeStep = { type, instruction, name: chosen.step.name || '', distance: dist };
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
        0: 'left', 2: 'left', 4: 'left', 12: 'left',     // left / sharp-left / slight-left / keep-left
        1: 'right', 3: 'right', 5: 'right', 13: 'right', // right / sharp-right / slight-right / keep-right
        6: 'straight', 11: 'straight',                   // continue / depart
        7: 'roundabout', 8: 'roundabout',                // enter / exit roundabout
        9: 'uturn', 10: 'arrive',
      };
      return O + (ICON[map[type]] || ICON.straight) + C;
    },
    // Point→segment distance using a local equirectangular projection (fine at
    // city scale). a/b/p are [lat, lng].
    metresPointToSeg(p, a, b) {
      const R = 6371000, toRad = Math.PI / 180;
      const lat0 = p[0] * toRad;
      const X = (lng) => lng * toRad * Math.cos(lat0) * R;
      const Y = (lat) => lat * toRad * R;
      const px = X(p[1]), py = Y(p[0]);
      const ax = X(a[1]), ay = Y(a[0]);
      const bx = X(b[1]), by = Y(b[0]);
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy || 1e-9;
      let t = ((px - ax) * dx + (py - ay) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax + t * dx, cy = ay + t * dy;
      return Math.hypot(px - cx, py - cy);
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
    stopLiveTracking() {
      this.cancelDriverAnim();
      if (this._watchId != null && navigator.geolocation) { navigator.geolocation.clearWatch(this._watchId); this._watchId = null; }
    },
    onPopupOpen(e) {
      const m = e.popup && e.popup._source;
      // Tapping a pin now ONLY shows its details popup. Drawing the route + live
      // tracking is started explicitly from the card's "Tap for distance" button
      // (onCardRoute → selectPlace), never automatically on popup open.
      const el = e.popup && e.popup.getElement && e.popup.getElement();
      if (!el || !m || !m._recRef) return;
      this.popupOpen = true;                   // hide overlapping map controls while it's up
      // Bring this place's card into view in the strip and mark it active, so its
      // "Tap for distance/route" button is right there to tap — no scrolling to find it.
      if (this.showCards && m._recRef.i != null) {
        const mi = m._recRef.i;
        this.activeCard = mi;
        this.highlightPin(mi);
        // Mark this card as already "flown to" BEFORE scrolling it in: the strip's
        // scroll-settle handler would otherwise flyTo the pin and fight centerPopup,
        // making the popup land in a different spot depending on whether the card
        // moved. With this, centerPopup is the single source of truth → consistent.
        this._flownTo = mi;
        this.$nextTick(() => this.scrollCardIntoView(mi));
      }
      // No route reframes the view here anymore, so always position the popup so
      // its image + close button stay on-screen.
      this.centerPopup(el);
      // Delegate the popup buttons (popup HTML is a string).
      const rec = m._recRef.rec;
      const details = el.querySelector('.rec-pop-details');
      if (details && !details._wired) {
        details._wired = true;
        details.addEventListener('click', () => {
          // Open the parent's info-modal ON TOP of the map. The modal is teleported
          // to <body> at a z-index above the fullscreen map, so we no longer drop
          // out of fullscreen/route to show it — the user stays in the map.
          this.$emit('view-details', rec);
        });
      }
      // Mirror JinniChat's info-modal tracking: the popup's quick actions fire the
      // same interaction types through the parent's trackInteraction (which owns
      // verifiedId resolution + cross-session logic), so behaviour matches the chat.
      const callLink = el.querySelector('.rec-pop-call');
      if (callLink && !callLink._wired) {
        callLink._wired = true;
        callLink.addEventListener('click', () => this.$emit('track', { rec, type: 'phone_click' }));
      }
      const webLink = el.querySelector('.rec-pop-web');
      if (webLink && !webLink._wired) {
        webLink._wired = true;
        webLink.addEventListener('click', () => this.$emit('track', { rec, type: 'website_click' }));
      }
      // Directions provider links (Google / Yandex / Transit) — same as the modal's
      // "Get directions" (openInMaps), tracked as map_open.
      el.querySelectorAll('.rec-pop-dir').forEach((a) => {
        if (a._wired) return;
        a._wired = true;
        a.addEventListener('click', () => this.$emit('track', { rec, type: 'map_open' }));
      });
      const dir = el.querySelector('.rec-pop-dir-toggle');
      if (dir && !dir._wired) { dir._wired = true; dir.addEventListener('click', () => { const pop = el.querySelector('.rec-pop'); if (pop) pop.classList.toggle('show-dirs'); }); }
    },
    // Pan so the open popup is horizontally centred in the map and sits a little
    // below the vertical centre — but never so high that its top (image + close
    // button) clips off. Measures the real popup box, so it's correct for any pin
    // position and any map height (short inline map or fullscreen).
    centerPopup(el) {
      if (!this.map || !el) return;
      this.$nextTick(() => {
        try {
          const mapRect = this.map.getContainer().getBoundingClientRect();
          const popRect = el.getBoundingClientRect();
          // Horizontal: bring the popup's centre to the map's centre.
          const dx = (popRect.left + popRect.width / 2) - (mapRect.left + mapRect.width / 2);
          // Vertical: sit a bit BELOW centre (reads more naturally), but clamp so the
          // top stays under the safe area and the bottom stays clear of the card strip.
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
    // Switch travel mode car ⇄ walking and re-route the active place.
    toggleProfile() {
      if (this.routing) return;
      this.activeProfile = this.activeProfile === 'driving-car' ? 'foot-walking' : 'driving-car';
      this.cardRoutes = {};                              // card distances are mode-specific
      if (this._routeTo) this.drawRoute(this._routeTo);
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
    initMap() {
      if (!this.$refs.mapEl || this.map || !this.L) return;
      const L = this.L;
      this.map = L.map(this.$refs.mapEl, { zoomControl: true, scrollWheelZoom: false, attributionControl: false, rotate: true, rotateControl: false, touchRotate: false, bearing: 0 });
      // True only if leaflet-rotate actually loaded and the device supports it.
      this._rotateEnabled = typeof this.map.setBearing === 'function' && !!this.map.options.rotate && !!(L.Browser && L.Browser.any3d);
      this.map.on('focus', () => this.map.scrollWheelZoom.enable());
      this.map.on('blur', () => { if (!this.fullscreen) this.map.scrollWheelZoom.disable(); });
      const usePm = PMTILES_URL && window.protomapsL && window.protomapsL.leafletLayer;
      this._pmtiles = !!usePm;
      this.tileLayer = usePm
        // Our own basemap — light by day, protomaps 'dark' at night (matched
        // to JinniChat's night chrome; the old CARTO dark was unusable).
        ? pmLayer(this.theme).addTo(this.map)
        : L.tileLayer(this.tileUrl(), { attribution: '', subdomains: 'abcd', maxZoom: 19, detectRetina: true }).addTo(this.map);
      this.markerLayer = L.layerGroup().addTo(this.map);
      this.map.on('popupopen', this.onPopupOpen);
      this.map.on('popupclose', () => { this.popupOpen = false; });
      this.map.on('click', () => { this.filterOpen = false; });
      this.renderMarkers();
      this.showMyLocationIfPermitted();
    },
    renderMarkers() {
      if (!this.markerLayer || !this.L) return;
      this.markerLayer.clearLayers();
      this._markers = [];                                // non-reactive: Leaflet objects must not be proxied
      this.mappable.forEach(({ rec, index, lat, lng }, i) => {
        const marker = this.L.marker([lat, lng], { icon: this.markerIcon(rec, i + 1), title: rec.name || '', riseOnHover: true });
        marker._recRef = { rec, index, lat, lng, i };
        // autoPan/keepInView OFF: Leaflet's popup auto-pan was one of the camera
      // nudges, and its _adjustPan handler is what throws "_panAnim of null" when
      // invalidateSize/zoom fires on a detached popup. The route fitBounds frames
      // the destination anyway, so we don't need it.
      marker.bindPopup(this.popupHtml(rec, lat, lng), { closeButton: true, className: 'rec-map-popup', minWidth: 300, maxWidth: 320, keepInView: false, autoPan: false });
        marker.on('click', () => this.$emit('marker-click', { rec, index }));
        marker.addTo(this.markerLayer);
        this._markers.push(marker);
      });
      this.applyFilter();
      this.fitToMarkers();
    },
    fitToMarkers() {
      if (!this.map || !this.L || !this.mappable.length) return;
      if (this.routeMode) return;        // the route framing owns the camera here
      const pts = this.visibleCards.length ? this.visibleCards : this.mappable;
      // Leave room at the bottom for the card strip so pins don't hide behind it.
      const pad = this.showCards
        ? { paddingTopLeft: [40, 40], paddingBottomRight: [40, 150] }
        : { padding: [40, 40] };
      if (pts.length === 1) {
        this.map.setView([pts[0].lat, pts[0].lng], 15);
      } else {
        const bounds = this.L.latLngBounds(pts.map(m => [m.lat, m.lng]));
        this.map.fitBounds(bounds, { ...pad, maxZoom: 16 });
      }
    },
    markerIcon(rec, n) {
      const color = this.tierColor(this.tierOf(rec));    // null for non-partners
      const cv = color ? ` style="--pin-color:${color}"` : '';
      const img = resolveImg(rec.image);
      if (img) {
        const safe = String(img).replace(/'/g, '%27');
        return this.L.divIcon({
          className: 'rec-map-pin-wrap',
          html: `<div class="rec-map-photo-pin"${cv}>` + `<div class="rec-map-photo" style="background-image:url('${safe}')"></div>` + `<span class="rec-map-badge">${n}</span>` + `</div>`,
          iconSize: [46, 56], iconAnchor: [23, 56], popupAnchor: [0, -52],
        });
      }
      return this.L.divIcon({ className: 'rec-map-pin-wrap', html: `<div class="rec-map-pin"${cv}><span>${n}</span></div>`, iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -34] });
    },
    popupHtml(rec, lat, lng) {
      const name = this.esc(rec.name || this.placeFallbackLabel);
      const cat = this.esc(rec.category || rec.type || '');
      const img = resolveImg(rec.image);
      const safe = img ? String(img).replace(/'/g, '%27') : '';
      // Contact actions — only rendered when the rec actually carries the data.
      const phone = rec.phone || rec.formatted_phone_number || rec.international_phone_number || '';
      const website = rec.website || '';
      const telHref = phone ? 'tel:' + String(phone).replace(/[^\d+]/g, '') : '';
      const navIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>';
      const telIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
      const webIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
      const infoIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="11"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      // Details opens JinniChat's place panel — only meaningful for businesses.
      const detailsBtn = this.isBusiness(rec) ? `<button type="button" class="rec-pop-btn rec-pop-details">${infoIcon}<span>${this.esc(this.detailsLabel)}</span></button>` : '';
      // Directions toggle reveals a provider chooser (Google / Yandex / Transit).
      const dirBtn = `<button type="button" class="rec-pop-btn rec-pop-dir-toggle">${navIcon}<span>${this.esc(this.directionsLabel)}</span></button>`;
      const from = this.myCoords ? `${this.myCoords.lat},${this.myCoords.lng}` : '';
      const gUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const yUrl = `https://yandex.com/maps/?rtext=${from}~${lat},${lng}&rtt=auto`;
      const tUrl = `https://yandex.com/maps/?rtext=${from}~${lat},${lng}&rtt=mt`;
      // Plain text chips — clean and unambiguous across platforms.
      const dirMenu = `<div class="rec-pop-dirs">`
        + `<a class="rec-pop-dir" href="${gUrl}" target="_blank" rel="noopener">Google</a>`
        + `<a class="rec-pop-dir" href="${yUrl}" target="_blank" rel="noopener">Yandex</a>`
        + `<a class="rec-pop-dir" href="${tUrl}" target="_blank" rel="noopener">${this.esc(this.transitLabel)}</a>`
        + `</div>`;
      const actions = detailsBtn + dirBtn + (phone   ? `<a class="rec-pop-btn rec-pop-call" href="${telHref}">${telIcon}<span>${this.esc(this.callLabel)}</span></a>` : '') + (website ? `<a class="rec-pop-btn rec-pop-web" href="${this.esc(website)}" target="_blank" rel="noopener">${webIcon}<span>${this.esc(this.websiteLabel)}</span></a>` : '');
      const tier = this.tierOf(rec);
      // Match JinniChat's recommendation card: a soft tier-tinted fill (no left
      // accent border). tierTint mirrors the card backgrounds 1:1.
      const tint = this.tierTint(tier);
      const bodyStyle = tint ? ` style="background:${tint}"` : '';
      const tierLbl = tier
        ? `<div class="rec-pop-tier rec-pop-tier--${tier}">${this.tierIconSvg(tier)}<span>${this.esc(this.tierLabel(tier))}</span></div>`
        : '';
      return `
        <div class="rec-pop">
          ${img ? `<div class="rec-pop-img" style="background-image:url('${safe}')"></div>` : ''}
          <div class="rec-pop-body${tier ? ' rec-pop-body--' + tier : ''}"${bodyStyle}>
            <div class="rec-pop-name">${name}</div>
            ${cat ? `<div class="rec-pop-cat">${cat}</div>` : ''}
            ${tierLbl}
            <div class="rec-pop-actions">${actions}</div>
            ${dirMenu}
          </div>
        </div>`;
    },
    esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) },
    // ---- Bottom place carousel -------------------------------------------------
    cardCat(rec) { return rec.category || rec.type || ''; },
    cardPhotoStyle(rec) {
      const img = resolveImg(rec.image);
      if (!img) return {};
      const safe = String(img).replace(/'/g, '%27');
      return { backgroundImage: `url('${safe}')` };
    },
    cardNumStyle(rec) {
      const c = this.tierColor(this.tierOf(rec));
      return c ? { background: c } : {};
    },
    // Soft tier tint behind the card (same fill the popup body uses), layered over
    // the glass so partner cards carry their tier colour.
    cardStyle(rec) {
      const tint = this.tierTint(this.tierOf(rec));
      return tint ? { '--rm-card-tint': tint } : {};
    },
    // First open / refocus of the carousel: focus the first visible place. We pass
    // the mappable index (== pin number, stable across filtering) as activeCard.
    initCards() {
      if (!this.fullscreen || !this.visibleCards.length) return;
      const first = this.visibleCards[0].mi;
      this.activeCard = first;
      this._flownTo = first;
      this.highlightPin(first);
      this.$nextTick(() => this.scrollCardIntoView(first, false));
    },
    // Emphasise the active place's pin (others stay normal). `mi` is the mappable
    // index, which equals each marker's _recRef.i.
    highlightPin(mi) {
      (this._markers || []).forEach((m) => {
        if (!m._icon || !m._recRef) return;
        m._icon.classList.toggle('rm-pin-active', mi != null && m._recRef.i === mi);
      });
    },
    // mappable index (mi) of the card nearest the horizontal centre of the strip.
    nearestCard() {
      const el = this.$refs.cardsEl;
      if (!el) return null;
      const center = el.scrollLeft + el.clientWidth / 2;
      const cards = el.querySelectorAll('.rec-map-card');
      let best = null, bestD = Infinity;
      cards.forEach((c, i) => {
        const cc = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cc - center);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best != null && this.visibleCards[best] ? this.visibleCards[best].mi : null;
    },
    // Smooth-scroll the card for mappable index `mi` to the centre of the strip.
    scrollCardIntoView(mi, smooth = true) {
      const el = this.$refs.cardsEl;
      if (!el) return;
      const pos = this.visibleCards.findIndex(m => m.mi === mi);
      if (pos < 0) return;
      const card = el.querySelectorAll('.rec-map-card')[pos];
      if (!card) return;
      const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
      el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    },
    // Live during a swipe: cheaply update which card looks active + emphasise its
    // pin (no camera move). The map fly + distance fetch wait for the scroll to
    // settle so we don't fight the gesture or burn routing quota mid-drag.
    onCardsScroll() {
      if (!this._cardRaf) {
        this._cardRaf = requestAnimationFrame(() => {
          this._cardRaf = null;
          const mi = this.nearestCard();
          if (mi != null && mi !== this.activeCard) {
            this.activeCard = mi;
            this.highlightPin(mi);
          }
        });
      }
      clearTimeout(this._cardSettleT);
      this._cardSettleT = setTimeout(() => this.onCardSettle(), 160);
    },
    // Fires when scrolling/snapping has finished (scrollend, or a debounced
    // fallback). Native CSS scroll-snap has already centred the nearest card —
    // we only read which one it is and move the map. We never scroll here, so
    // there's no second, delayed re-centring animation.
    onCardSettle() {
      const mi = this.nearestCard();
      if (mi == null) return;
      if (mi !== this.activeCard) { this.activeCard = mi; this.highlightPin(mi); }
      if (mi !== this._flownTo) {
        this._flownTo = mi;
        const m = this.mappable[mi];
        if (m && this.map) {
          const z = Math.max(this.map.getZoom(), 14);
          this.map.flyTo([m.lat, m.lng], z, { duration: 0.5 });
        }
        // No distance/time fetch on a plain swipe — the user triggers that by
        // tapping the card (see onCardClick), so switching cards stays free.
      }
    },
    // Tapping a card body: focus it, centre it, fly there. No route calc — that's
    // exclusively the "Tap for distance" button now (onCardRoute).
    onCardClick(mi) {
      this.activeCard = mi;
      this.highlightPin(mi);
      this.scrollCardIntoView(mi);
      this._flownTo = mi;
      const m = this.mappable[mi];
      if (m && this.map) {
        const z = Math.max(this.map.getZoom(), 14);
        this.map.flyTo([m.lat, m.lng], z, { duration: 0.5 });
      }
    },
    // Chat→map bridge: called by JinniChat when a transport answer names a
    // card on THIS map ("how do I get to X?"). Opens the map and starts the
    // exact "Tap for distance" flow for that card. Retries briefly because
    // open() builds the map + markers asynchronously.
    routeToPlace(target, _attempt = 0) {
      if (!target) return false;
      const norm = s => String(s || '').toLowerCase().trim();
      const mi = this.mappable.findIndex(({ rec }) =>
        (target.placeId && rec.placeId && rec.placeId === target.placeId)
        || (target.name && norm(rec.name) === norm(target.name)));
      if (mi < 0) return false;
      if (!this.expanded) this.open();
      if (!this.map || !(this._markers || []).length) {
        if (_attempt < 25) setTimeout(() => this.routeToPlace(target, _attempt + 1), 200);
        return true;
      }
      this.onCardRoute(mi);
      return true;
    },
    // The "Tap for distance" button — the one and only way to start a route. It
    // draws the route line, shows the distance/time, and begins turn-by-turn
    // (tapping a map pin just opens its details popup now).
    async onCardRoute(mi) {
      this.activeCard = mi;
      this.highlightPin(mi);
      if (this.map) this.map.closePopup();
      const marker = (this._markers || []).find(m => m._recRef && m._recRef.i === mi);
      if (!marker) return;
      // Make sure we have somewhere to route from (prompts for location if needed).
      if (!this.myCoords) {
        const c = await this.acquireMyLocation({ force: true });
        if (!c) return;                              // toast already shown
        this.setMyLocation(c.lat, c.lng, c.accuracy, { fly: false });
      }
      this.selectPlace(marker);
    },
    setCardRoute(mi, distance, duration) {
      this.cardRoutes = { ...this.cardRoutes, [mi]: { distance, duration } };
    },
    // Fetch (and cache) the distance + duration from the user to a place, for the
    // card label. Shares the route cache with drawRoute. force:true will prompt for
    // location if needed (used on tap); a passive swipe never prompts.
    async computeCardRoute(idx, { force = false } = {}) {
      const m = this.mappable[idx];
      if (!m || this.cardRoutes[idx]) return;
      let from = this.myCoords;
      if (!from) {
        if (!force) return;
        const c = await this.acquireMyLocation();
        if (!c) return;                                  // toast already shown
        this.setMyLocation(c.lat, c.lng, c.accuracy, { fly: false });
        from = this.myCoords;
      }
      const to = { lat: m.lat, lng: m.lng };
      const profile = this.activeProfile || this.routeProfile;
      if (!this._routeCache) this._routeCache = new Map();
      const key = `${profile}|${from.lat.toFixed(4)},${from.lng.toFixed(4)}|${to.lat.toFixed(5)},${to.lng.toFixed(5)}|${this.routeLanguage || 'en'}`;
      const cached = this._routeCache.get(key);
      if (cached) { this.setCardRoute(idx, cached.distance, cached.duration); return; }
      if (this.cardLoading === idx) return;
      this.cardLoading = idx;
      try {
        const res = await fetch(`${API_BASE}/api/routing/directions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          body: JSON.stringify({ from, to, profile, language: this.routeLanguage || undefined }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.distance != null) {
          if (data.geometry) this._routeCache.set(key, { geometry: data.geometry, distance: data.distance, duration: data.duration, steps: data.steps || null });
          this.setCardRoute(idx, data.distance, data.duration);
        }
      } catch (e) { /* silent — card just stays without a distance */ }
      finally { if (this.cardLoading === idx) this.cardLoading = null; }
    },
    destroyMap() {
      if (!this.map) return;
      try { this.map.closePopup(); } catch (e) { /* noop */ }
      try { if (this.routeLayer) this.routeLayer.remove(); } catch (e) { /* noop */ }
      try { if (this.markerLayer) this.markerLayer.clearLayers(); } catch (e) { /* noop */ }
      this.map.off();
      this.map.remove();
      this.map = null; this.tileLayer = null; this.markerLayer = null; this._markers = [];
      this.locationMarker = null; this.accuracyCircle = null; this.routeLayer = null; this.routeInfo = null;
    }
  }
};
</script>




<style scoped>
.rec-map {
  margin: 12px 0 4px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--rm-border);
  background: var(--rm-surface);
  backdrop-filter: blur(2px) saturate(180%);
  -webkit-backdrop-filter: blur(2px) saturate(180%);
  box-shadow: var(--rm-rim);
}
.rec-map.day-mode {
  --rm-surface: rgba(255,255,255,0.45); --rm-border: none; --rm-text: #A0522D; --rm-muted: #A0522D;
  /* Business/card content text — matches JinniChat's recommendation-card text (day) */
  --rm-biz-text: #3c2a1e;
  --rm-hover: rgba(212,175,55,0.14); --rm-ctrl-bg: rgba(255,255,255,0.72); --rm-ctrl-text: #A0522D;
  --svg-color: #A0522D; --rm-rim: inset 0 0 0 1px rgba(255,255,255,0.6); --rm-popup-bg: rgba(255,253,248,0.9);
  --rm-ctrl-ring: rgba(0,0,0,0.08); --rm-ctrl-glint: rgba(255,255,255,0.85);
  /* white-lift hover to match JinniChat's "view more" button (not a color tint) */
  --rm-bar-hover: rgba(255,255,255,0.75);
  /* warm gold-tinted hover: clearly different from the solid-white rest state,
     and the brown icon stays high-contrast against it (a whiter hover washed out
     against the pale day tiles) */
  --rm-ctrl-hover: rgba(240,221,170,0.95);
  /* "glacier" frosted-white buttons — same recipe as JinniChat's view-more btn */
  --rm-glass: rgba(255,255,255,0.5); --rm-glass-hover: rgba(255,255,255,0.75);
  --rm-glass-ring: inset 0 0 0 1px rgba(255,255,255,0.6)
}
.rec-map.night-mode {
  --rm-surface: rgba(255,255,255,0.06); --rm-border: none; --rm-text: #c084fc; --rm-muted: #9ca3af;
  /* Business/card content text — matches JinniChat's recommendation-card text (night) */
  --rm-biz-text: #94a3b8;
  --rm-hover: rgba(139,92,246,0.16); --rm-ctrl-bg: rgba(22,15,44,0.55); --rm-ctrl-text: #e2e8f0;
  --svg-color: #c084fc; --rm-rim: inset 0 0 0 0.7px rgba(255,255,255,0.1); --rm-popup-bg: rgba(30,20,56,0.85);
  --rm-ctrl-ring: rgba(255,255,255,0.2); --rm-ctrl-glint: rgba(255,255,255,0.28);
  /* white-lift hover to match JinniChat's "view more" button (not a color tint) */
  --rm-bar-hover: rgba(255,255,255,0.14);
  /* control hover stays a solid-ish dark purple so the light icon doesn't vanish
     against the (light) night-mode map tiles */
  --rm-ctrl-hover: rgba(76,52,140,0.82);
  /* "glacier" frosted-white buttons — same recipe as JinniChat's view-more btn */
  --rm-glass: rgba(255,255,255,0.08); --rm-glass-hover: rgba(255,255,255,0.14);
  --rm-glass-ring: inset 0 0 0 1.5px rgba(255,255,255,0.1)
}
/* Bar */
.rec-map-bar { display: flex; align-items: center; transition: background 0.18s ease; }
.rec-map-bar:hover { background: var(--rm-bar-hover); }
.rec-map-toggle {
  flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 11px 6px 11px 14px; background: transparent; border: none; cursor: pointer;
  color: var(--rm-text); font-size: 14px; font-weight: 600;
  transition: background 0.18s ease;
}
.rec-map-toggle:hover { background: transparent; }
.rec-map-toggle-left { display: flex; align-items: center; gap: 9px; }
.rec-map-toggle-left > svg { color: var(--svg-color); flex-shrink: 0; }
.rec-map-count { font-size: 12px; font-weight: 700; color: var(--rm-muted); background: var(--rm-hover); border-radius: 10px; padding: 1px 8px; }
.rec-map-bar-actions { display: flex; align-items: center; gap: 2px; padding-right: 8px; }
.rec-map-iconbtn {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 9px; cursor: pointer;
  color: var(--rm-muted); transition: background 0.18s ease, color 0.18s ease;
}
.rec-map-iconbtn svg { transition: transform 0.18s ease; }
.rec-map-iconbtn:hover svg { transform: scale(1.18); }
.rec-map-chevron { color: var(--rm-muted); flex-shrink: 0; transition: transform 0.25s ease; }
.rec-map-chevron.open { transform: rotate(180deg); }
/* Grow the chevron while the toggle is hovered (mirrors the fullscreen button's
   svg scale). transform is a single property, so the open state must re-apply
   its rotation alongside the scale or the chevron would un-rotate on hover. */
.rec-map-toggle:hover .rec-map-chevron { transform: scale(1.18); }
.rec-map-toggle:hover .rec-map-chevron.open { transform: rotate(180deg) scale(1.18); }
/* Animated reveal */
.rec-map-body { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.35s ease, opacity 0.28s ease; }
.rec-map.is-open .rec-map-body { max-height: 520px; opacity: 1; }
.rec-map-stage { position: relative; }
.rec-map-canvas { width: 100%; height: 450px; }
@media (max-width: 600px) { .rec-map-canvas { height: 360px } }
/* Fullscreen */
.rec-map.is-fullscreen { position: fixed; inset: 0; height: 100dvh; z-index: 99999; margin: 0; border-radius: 0; border: none; }
.rec-map.is-fullscreen .rec-map-body { max-height: none; height: 100%; opacity: 1; }
.rec-map.is-fullscreen .rec-map-stage, .rec-map.is-fullscreen .rec-map-canvas { height: 100%; }
.rec-map-close-fs {
  position: absolute;
  top: calc(12px + env(safe-area-inset-top, 0px));
  right: calc(12px + env(safe-area-inset-right, 0px));
  z-index: 1200;                       /* above Leaflet panes/controls */
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 12px; cursor: pointer;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
  transition: background 0.18s ease, transform 0.15s ease;
}
.rec-map-close-fs:hover { background: var(--rm-ctrl-hover); }
.rec-map-close-fs:active { transform: scale(0.94); }
@media (max-width: 600px) { .rec-map-close-fs { width: 48px; height: 48px; } }
/* Locate-me (GPS) button — same glass chip as the close button, stacked under it */
.rec-map-locate-fs {
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
.rec-map-locate-fs:hover { background: var(--rm-ctrl-hover); }
.rec-map-locate-fs:active { transform: scale(0.94); }
.rec-map-locate-fs.is-busy { opacity: 0.55; pointer-events: none; }
@media (max-width: 600px) {
  .rec-map-locate-fs { width: 48px; height: 48px; top: calc(70px + env(safe-area-inset-top, 0px)); }
}
/* Travel-mode switcher — same glass chip, stacked under the locate button */
.rec-map-modeswitch {
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
.rec-map-modeswitch:hover { background: var(--rm-ctrl-hover); }
.rec-map-modeswitch:active { transform: scale(0.94); }
.rec-map-modeswitch.is-busy { opacity: 0.55; pointer-events: none; }
@media (max-width: 600px) {
  .rec-map-modeswitch { width: 48px; height: 48px; top: calc(128px + env(safe-area-inset-top, 0px)); }
}
/* Glass toast (location-permission message, etc.) — top-centre, theme-aware */
.rec-map-toast {
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
/* Tier filter — single button + chooser, top-left (sized like the control chips) */
.rec-map-filterwrap { position: absolute; z-index: 1150; top: calc(10px + env(safe-area-inset-top, 0px)); left: calc(10px + env(safe-area-inset-left, 0px)); }
/* RTL: the wrap stays pinned on the left (the right edge holds the close/locate/
   mode controls), but it shrink-wraps its content and the button is inline, so in
   RTL it right-aligns and rides the wrap's right edge as the menu opens/closes —
   the button appears to jump right on open, left on close. Forcing the wrap's
   inline content to the left keeps the button on the fixed left edge while the
   menu still grows rightward. The button's own contents stay RTL. */
[dir="rtl"] .rec-map-filterwrap { text-align: left; }
/* While a place popup is open, the popup is structurally pinned beneath the floating
   controls (it lives inside Leaflet's transformed map pane). Rather than fight the
   stacking, we step the overlapping controls out of the way so the popup — and its
   close button — are fully reachable. They return the moment the popup closes. */
.rec-map.popup-open .rec-map-close-fs,
.rec-map.popup-open .rec-map-locate-fs,
.rec-map.popup-open .rec-map-modeswitch,
.rec-map.popup-open .rec-map-filterwrap,
.rec-map.popup-open :deep(.leaflet-control-zoom) { opacity: 0; pointer-events: none; transition: opacity 0.15s ease; }
.rec-map-filterbtn, .rec-map-filteropt {
  display: inline-flex; align-items: center; gap: 7px;
  height: 44px; padding: 0 14px; border: none; border-radius: 12px; cursor: pointer;
  font-size: 13px; font-weight: 700; line-height: 1; white-space: nowrap;
  color: var(--rm-ctrl-text); background: var(--rm-ctrl-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
  transition: background 0.18s ease, transform 0.12s ease;
}
.rec-map-filterbtn:hover { background: color-mix(in srgb, currentColor 15%, var(--rm-ctrl-bg)); }
.rec-map-filterbtn:active { transform: scale(0.97); }
.rec-map-filter-ic { display: inline-flex; align-items: center; }
.rec-map-filter-chev { margin-left: 1px; color: var(--rm-muted); transition: transform 0.2s ease; }
.rec-map-filter-chev.open { transform: rotate(180deg); }
.rec-map-filtermenu { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.rec-map-filteropt { width: 100%; justify-content: flex-start; }
.rec-map-filteropt:hover { background: color-mix(in srgb, currentColor 15%, var(--rm-ctrl-bg)); }
.rec-map-filteropt:active { transform: scale(0.98); }
/* Night: the transparent control bg washes the hover out, so mix more tier colour
   over a near-opaque dark base — gives the same solid, tinted hover day mode has. */
.rec-map.night-mode .rec-map-filterbtn:hover,
.rec-map.night-mode .rec-map-filteropt:hover {
  background: color-mix(in srgb, currentColor 26%, rgba(36,24,69,0.92));
}
@media (max-width: 600px) {
  .rec-map-filterbtn, .rec-map-filteropt { height: 48px; }
}
:deep(.rec-map-pin-wrap) { background: transparent; border: none; transition: opacity 0.25s ease; }
:deep(.rec-map-pin) {
  width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
  background: var(--pin-color, linear-gradient(135deg, rgb(212,175,55), rgb(255,140,0)));
  box-shadow: 0 0 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}
:deep(.rec-map-pin span) { transform: rotate(45deg); color: #fff; font-size: 13px; font-weight: 700; }
/* Photo marker */
:deep(.rec-map-photo-pin) { position: relative; width: 46px; height: 46px; }
:deep(.rec-map-photo) {
  width: 46px; height: 46px; border-radius: 50%; background-size: cover; background-position: center;
  border: 3px solid var(--pin-color, #fff); box-shadow: 0 0 4px rgba(0,0,0,0.4);
}
:deep(.rec-map-photo-pin::after) {
  content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
  border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 9px solid var(--pin-color, #fff);
}
:deep(.rec-map-badge) {
  position: absolute; top: -5px; right: -5px; min-width: 19px; height: 19px; padding: 0 4px;
  border-radius: 10px; background: var(--pin-color, linear-gradient(135deg, rgb(212,175,55), rgb(255,140,0)));
  color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;
  border: 1.5px solid #fff; box-shadow: 0 0 3px rgba(0,0,0,0.35);
}
/* Route summary chip — bottom-centre glass pill */
.rec-map-routeinfo {
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
.rec-map-routeinfo > svg { color: #4285F4; flex-shrink: 0; }
/* Travel-mode segmented control inside the chip */
.rec-map-routeinfo-clear {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; border-radius: 8px; cursor: pointer;
  color: var(--rm-ctrl-text); background: var(--rm-hover); transition: background 0.18s ease, transform 0.12s ease;
}
.rec-map-routeinfo-clear:hover { background: var(--rm-ctrl-hover); }
.rec-map-routeinfo-clear:active { transform: scale(0.92); }
/* Turn-by-turn banner — top-centre, glass; informational so taps pass through.
   Kept narrow so it clears the top-right close/locate buttons, and allowed to
   grow downward so the full instruction (incl. the road name) can wrap. */
.rec-map-maneuver {
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
.rec-map-maneuver-ic { flex: 0 0 auto; display: flex; }
/* Wrong-way variant — amber so it reads as "act now: turn around". */
.rec-map-maneuver--warn {
  box-shadow: 0 2px 8px rgba(0,0,0,0.16), inset 0 0 0 1.5px rgba(245,158,11,0.55), inset 0 1px 0 var(--rm-ctrl-glint);
}
.rec-map-maneuver--warn .rec-map-maneuver-ic { color: #f59e0b; }
.rec-map-maneuver--warn .rec-map-maneuver-dist { color: #f59e0b; }
.rec-map-maneuver-ic :deep(svg) { display: block; }
.rec-map-maneuver-body { min-width: 0; }
.rec-map-maneuver-dist { font-size: 18px; font-weight: 800; line-height: 1.15; }
.rec-map-maneuver-instr {
  margin-top: 2px; font-size: 12.5px; font-weight: 600; color: var(--rm-ctrl-text);
  line-height: 1.25;
  /* up to two lines, so "Turn left onto <street>" stays readable */
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
/* Arrival banner — same glass as the controls; sits where the maneuver was. */
.rec-map-arrive {
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
.rec-map-arrive-ic { flex: 0 0 auto; display: flex; }
.rec-map-arrive-ic svg { display: block; }
.rec-map-arrive-body { min-width: 0; }
.rec-map-arrive-title { font-size: 15px; font-weight: 800; line-height: 1.2; }
.rec-map-arrive-sub {
  margin-top: 1px; font-size: 12.5px; font-weight: 600; color: var(--rm-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
}
.rec-map-arrive-done {
  flex: 0 0 auto; margin-left: 4px; border: none; cursor: pointer;
  padding: 8px 16px; border-radius: 11px; font: inherit; font-size: 13px; font-weight: 700;
  -webkit-appearance: none; appearance: none;
  color: #fff; background: #1a73e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  transition: transform 0.12s ease, filter 0.18s ease;
}
.rec-map-arrive-done:hover { filter: brightness(1.07); }
.rec-map-arrive-done:active { transform: scale(0.95); }
/* Popup route button uses the shared .rec-pop-btn glass style; it's a <button>,
   so normalise it against the <a> siblings. */
/* Pins: dimmed for filter transitions (fade lives on .rec-map-pin-wrap above), hidden entirely in route mode */
:deep(.rec-map-pin-wrap.rm-pin-hidden) { display: none; }
:deep(.rec-map-pin-wrap.rm-pin-filtered) { display: none; }
/* Active place (the focused carousel card) — its pin grows from its tip.
   Leaflet gives every marker an inline z-index equal to its on-screen pixel Y
   (lower pins stack in front), which on a tall/zoomed map can exceed a few
   hundred. Lift the active pin well above any of those so the enlarged image is
   never overlapped by a nearby smaller one. This only orders markers within
   Leaflet's marker pane, so it can't cover the floating controls. */
:deep(.rec-map-photo-pin), :deep(.rec-map-pin) { transition: transform 0.2s cubic-bezier(.22,1,.36,1); }
:deep(.rec-map-pin-wrap.rm-pin-active) { z-index: 100000 !important; }
:deep(.rec-map-pin-wrap.rm-pin-active .rec-map-photo-pin) { transform: scale(1.5); transform-origin: bottom center; }
:deep(.rec-map-pin-wrap.rm-pin-active .rec-map-pin) { transform: rotate(-45deg) scale(1.32); }
/* ---- Bottom place carousel (fullscreen browse mode) ----------------------- */
/* With the card strip up, the +/- zoom would sit on top of the cards at the
   bottom-right. Float it on the right edge, vertically centred, clear of both the
   cards and the top-right control stack. Extra class (.has-cards) outweighs the
   .rec-map.is-fullscreen zoom rule regardless of source order. */
.rec-map.is-fullscreen.has-cards :deep(.leaflet-bottom.leaflet-right) {
  bottom: 50%;
  transform: translateY(50%);
}
.rec-map.is-fullscreen.has-cards :deep(.leaflet-control-zoom) {
  margin-bottom: 0 !important;
  margin-right: calc(12px + env(safe-area-inset-right, 0px)) !important;
}
.rec-map-cards {
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
.rec-map-cards::-webkit-scrollbar { display: none; }
@media (max-width: 600px) { .rec-map-cards { --card-w: min(80vw, 320px); } }
.rec-map-card {
  flex: 0 0 var(--card-w); box-sizing: border-box;
  scroll-snap-align: center; scroll-snap-stop: always;
  display: flex; align-items: center; gap: 12px;
  padding: 10px; border: none; border-radius: 16px; cursor: pointer; text-align: left;
  color: var(--rm-ctrl-text);
  background-color: var(--rm-ctrl-bg);
  background-image: linear-gradient(var(--rm-card-tint, transparent), var(--rm-card-tint, transparent));
  box-shadow: 0 0 5px rgba(0,0,0,0.15), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint);
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
  opacity: 0.45;
  transition: opacity 0.18s ease;
}
.rec-map-card.is-active { opacity: 1; }
.rec-map-card-photo {
  position: relative; flex: 0 0 auto;
  width: 56px; height: 56px; border-radius: 12px;
  background-size: cover; background-position: center; background-color: var(--rm-hover);
  box-shadow: inset 0 0 0 1px var(--rm-ctrl-ring);
}
.rec-map-card-num {
  position: absolute; top: -6px; left: -6px;
  min-width: 19px; height: 19px; padding: 0 4px; box-sizing: border-box;
  border-radius: 10px; border: 1.5px solid #fff;
  background: linear-gradient(135deg, rgb(212,175,55), rgb(255,140,0));
  color: #fff; font-size: 11px; font-weight: 700; line-height: 16px; text-align: center;
  box-shadow: 0 0 3px rgba(0,0,0,0.35);
}
.rec-map-card-info { min-width: 0; flex: 1; }
.rec-map-card-name {
  font-size: 14px; font-weight: 700; line-height: 1.25; color: var(--rm-biz-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rec-map-card-cat {
  margin-top: 2px; font-size: 12px; color: var(--rm-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rec-map-card-route {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 6px; font-size: 12px; font-weight: 700;
}
.rec-map-card-route svg { flex-shrink: 0; }
.rec-map-card-route--loading { color: var(--rm-muted); font-weight: 600; }
/* The "Tap for distance" button — the sole route/distance trigger. Frosted glass
   to match the popup buttons; it's a real <button> now, hence the resets. */
.rec-map-card-route--cta {
  color: var(--rm-ctrl-text); font: inherit; font-size: 12px; font-weight: 600;
  cursor: pointer; -webkit-appearance: none; appearance: none; border: none;
  padding: 5px 12px 5px 9px; border-radius: 999px;
  background: var(--rm-glass); box-shadow: var(--rm-glass-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: background 0.18s ease, transform 0.12s ease;
}
.rec-map-card-route--cta:hover { background: var(--rm-glass-hover); }
.rec-map-card-route--cta:active { transform: scale(0.96); }
/* Night mode card tweaks: the place name should read in the normal (bright) text
   colour, not the dim biz-slate; and the route chip should be a weaker, frostier
   pill (over the opaque card the glass can't blur the map, so a strong fill looks
   solid rather than glacier). Day mode is untouched. */
.rec-map.night-mode .rec-map-card-name { color: var(--rm-ctrl-text); }
.rec-map.night-mode .rec-map-card-route--cta {
  background: rgba(255,255,255,0.05);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
}
.rec-map.night-mode .rec-map-card-route--cta:hover { background: rgba(255,255,255,0.1); }
.rec-map-card-spinner {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid var(--rm-ctrl-ring); border-top-color: var(--rm-ctrl-text);
  animation: recMapSpin 0.7s linear infinite;
}
@keyframes recMapSpin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .rec-map-card, .rec-map-card-photo { transition: none; }
  .rec-map-card-spinner { animation: none; }
}
/* Directions provider chooser (revealed by the Directions button) */
:deep(.rec-pop-dirs) { display: none; gap: 7px; margin-top: 8px; }
:deep(.rec-pop.show-dirs .rec-pop-dirs) { display: flex; flex-wrap: wrap; }
:deep(.rec-pop-dir) {
  flex: 1; min-width: 80px; text-align: center; text-decoration: none;
  padding: 10px 12px; border-radius: 22px; font-size: 12.5px; font-weight: 600;
  color: var(--rm-text); background: var(--rm-glass); box-shadow: var(--rm-glass-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: background 0.2s ease;
}
:deep(.rec-pop-dir:hover) { background: var(--rm-glass-hover); }
/* "You are here" — Google-style blue dot with a soft outward pulse */
:deep(.rec-map-medot-wrap) { background: transparent; border: none; }
:deep(.rec-map-medot) {
  width: 18px; height: 18px; border-radius: 50%;
  background: #4285F4; border: 3px solid #fff; position: relative;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.35);
}
:deep(.rec-map-medot)::before {
  content: ''; position: absolute; left: 50%; top: 50%;
  width: 18px; height: 18px; border-radius: 50%;
  transform: translate(-50%, -50%);
  background: rgba(66,133,244,0.45);
  animation: recMapPulse 2s ease-out infinite;
}
@keyframes recMapPulse {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
  70%, 100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  :deep(.rec-map-medot)::before { animation: none; }
}
/* "You are here", moving — a navigation chevron that points the way we're
   travelling. Its own white casing + drop shadow lift it off the (same-coloured)
   route line, so it reads as the driver rather than part of the route. */
:deep(.rec-map-mearrow) {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s ease-out;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45));
  -webkit-filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45));
}
:deep(.rec-map-mearrow) svg { display: block; }
/* Themed zoom control */
.rec-map :deep(.leaflet-control-zoom) {
  border: none !important; border-radius: 12px !important; overflow: hidden;
  background: var(--rm-ctrl-bg) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14), inset 0 0 0 1px var(--rm-ctrl-ring), inset 0 1px 0 var(--rm-ctrl-glint) !important;
  backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
}
.rec-map :deep(.leaflet-control-zoom a) {
  width: 34px; height: 34px; line-height: 34px; font-size: 18px; font-weight: 700;
  border: none !important; background: transparent !important; color: var(--rm-ctrl-text) !important;
  transition: background 0.18s ease !important;
}
.rec-map :deep(.leaflet-control-zoom a:first-child) { box-shadow: inset 0 -1px 0 var(--rm-ctrl-ring) !important; }
.rec-map :deep(.leaflet-control-zoom a:hover) { background: var(--rm-ctrl-hover) !important; }
/* Fullscreen: bigger zoom buttons (match the close button's weight) and
   bottom-right placement with safe-area spacing. */
.rec-map.is-fullscreen :deep(.leaflet-control-zoom) {
  border-radius: 12px !important;
  margin-bottom: calc(18px + env(safe-area-inset-bottom, 0px)) !important;
  margin-right: calc(16px + env(safe-area-inset-right, 0px)) !important;
}
.rec-map.is-fullscreen :deep(.leaflet-control-zoom a) { width: 44px; height: 44px; line-height: 44px; font-size: 24px; }
@media (max-width: 600px) { .rec-map.is-fullscreen :deep(.leaflet-control-zoom a) { width: 48px; height: 48px; line-height: 48px; } }
/* Popup — themed wrapper, full-bleed image, action row */
.rec-map :deep(.leaflet-popup-content-wrapper) {
  background: var(--rm-popup-bg); color: var(--rm-text);
  backdrop-filter: blur(30px) saturate(190%); -webkit-backdrop-filter: blur(30px) saturate(190%);
  border-radius: 16px; box-shadow: 0 0 30px rgba(0,0,0,0.22), var(--rm-rim);
  border: 1px solid var(--rm-border); padding: 0; overflow: hidden;
}
.rec-map :deep(.leaflet-popup-tip) { background: var(--rm-popup-bg); }
.rec-map :deep(.rec-map-popup .leaflet-popup-content) { margin: 0; width: 300px !important; }
/* Visible, themed close button. Leaflet's default is a text "×" glyph that
   won't optically center — hide it and paint a real SVG X (masked so it still
   takes the theme color). */
.rec-map :deep(.rec-map-popup .leaflet-popup-close-button) {
  top: 8px; right: 8px; width: 26px; height: 26px; padding: 0;
  border-radius: 50%; background: var(--rm-ctrl-bg);
  font-size: 0; color: transparent !important;
  box-shadow: 0 0 8px rgba(0,0,0,0.3); z-index: 5;
  backdrop-filter: blur(8px) saturate(160%); -webkit-backdrop-filter: blur(8px) saturate(160%);
}
.rec-map :deep(.rec-map-popup .leaflet-popup-close-button)::before {
  content: ""; position: absolute; inset: 0;
  background-color: var(--rm-ctrl-text);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 6 L18 18 M18 6 L6 18' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E") center / 13px 13px no-repeat;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 6 L18 18 M18 6 L6 18' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E") center / 13px 13px no-repeat;
}
.rec-map :deep(.rec-map-popup .leaflet-popup-close-button:hover) { background: var(--rm-hover); }
:deep(.rec-pop-img) { width: 100%; height: 120px; background-size: cover; background-position: center; }
:deep(.rec-pop-body) { padding: 12px 14px 14px; }
:deep(.rec-pop-name) { font-weight: 700; font-size: 15px; line-height: 1.25; margin-bottom: 2px; color: var(--rm-biz-text); }
:deep(.rec-pop-cat) { font-size: 12px; color: var(--rm-muted); margin-bottom: 11px; }
.rec-map.day-mode :deep(.rec-pop-cat) { color: #5a4a42; }
/* Tier label inside the popup — mirrors JinniChat's partner-label colours */
:deep(.rec-pop-tier) {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
  margin: -4px 0 11px;
}
:deep(.rec-pop-tier svg) { width: 12px; height: 12px; flex-shrink: 0; }
:deep(.rec-pop-tier--signature) { color: #FF8C00; }
:deep(.rec-pop-tier--spotlight) { color: #3b9edd; }
:deep(.rec-pop-tier--verified)  { color: #27ae60; }
/* Tier-coloured place name, mirroring the tier-label palette */
/* Tier-coloured place name, matching the onboarding badge text colours */
:deep(.rec-pop-body--signature .rec-pop-name) { color: #FF8C00; }
:deep(.rec-pop-body--spotlight .rec-pop-name) { color: #3b9edd; }
:deep(.rec-pop-body--verified .rec-pop-name)  { color: #27ae60; }
:deep(.rec-pop-actions) { display: flex; flex-wrap: wrap; gap: 7px; }
:deep(.rec-pop-btn) {
  display: inline-flex; align-items: center; gap: 7px; box-sizing: border-box;
  padding: 9px 14px; border: none; border-radius: 22px; text-decoration: none; white-space: nowrap;
  font-family: inherit; font-size: 12.5px; font-weight: 600; line-height: 1; color: var(--rm-text);
  -webkit-appearance: none; appearance: none; cursor: pointer;
  background: var(--rm-glass); box-shadow: var(--rm-glass-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: background 0.2s ease, transform 0.1s ease;
}
:deep(.rec-pop-btn:hover) { background: var(--rm-glass-hover) }
:deep(.rec-pop-btn:active) { transform: scale(0.96) }
:deep(.rec-pop-btn span) { line-height: 1 }
:deep(.rec-pop-btn svg) { width: 15px; height: 15px; flex-shrink: 0; display: block; }
/* Match JinniChat's info-modal action buttons (.pd-action) backgrounds, but keep
   the button text in the map's mode text colour (--rm-text) for day + night. */
.rec-map.day-mode :deep(.rec-pop-btn),
.rec-map.day-mode :deep(.rec-pop-dir) {
  background: rgba(255,255,255,0.55); color: var(--rm-biz-text);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);
}
.rec-map.day-mode :deep(.rec-pop-btn:hover),
.rec-map.day-mode :deep(.rec-pop-dir:hover) {
  background: rgba(255,255,255,0.8);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95);
}
.rec-map.night-mode :deep(.rec-pop-btn),
.rec-map.night-mode :deep(.rec-pop-dir) {
  background: rgba(255,255,255,0.06); color: var(--rm-biz-text);
  box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1);
}
.rec-map.night-mode :deep(.rec-pop-btn:hover),
.rec-map.night-mode :deep(.rec-pop-dir:hover) {
  background: rgba(255,255,255,0.14);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
}
</style>