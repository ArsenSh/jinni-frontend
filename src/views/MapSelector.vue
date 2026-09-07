<template>
  <div class="map-selector-page" :class="currentTheme">
    <div class="map-header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="currentTheme === 'night-mode' ? '#c084fc' : '#A0522D'" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        {{ $t('map_selector.back') }}
      </button>
      <h1>{{ $t('map_selector.title') }}</h1>
      <div class="header-right">
        <button @click="confirmSelection" class="confirm-btn" :disabled="!hasChanges">
          {{ $t('map_selector.confirm') }}
        </button>
        <button @click="goToMyLocation" class="my-location-btn" :title="$t('map_selector.my_location_btn')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <circle cx="12" cy="12" r="7" stroke-dasharray="2 2"/>
          </svg>
        </button>
      </div>
    </div>
    <div v-if="marketNotice" class="market-notice" :class="{ 'market-notice--blocked': marketBlocked }">{{ marketNotice }}</div>
    <div class="search-container">
      <div class="search-wrapper">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="currentTheme === 'night-mode' ? '#c084fc' : '#A0522D'" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          @keyup.enter="searchLocation"
          @input="handleSearchInput"
          type="text"
          :placeholder="$t('map_selector.search_placeholder')"
          class="search-input"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="clear-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="currentTheme === 'night-mode' ? '#c084fc' : '#A0522D'" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div v-if="searchResults.length > 0" class="search-results">
        <div 
          v-for="result in searchResults" 
          :key="result.place_id"
          @click="selectSearchResult(result)"
          class="search-result-item"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="currentTheme === 'night-mode' ? '#c084fc' : '#A0522D'" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <div class="result-info">
            <div class="result-name">{{ result.display_name.split(',')[0] }}</div>
            <div class="result-address">{{ result.display_name }}</div>
          </div>
        </div>
      </div>
      <div v-if="isSearching" class="searching-indicator">
        <div class="spinner"></div>
        {{ $t('map_selector.searching') }}
      </div>
    </div>
    <div v-if="gpsDenied" class="gps-denied-banner" :class="currentTheme">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="currentTheme === 'night-mode' ? '#c084fc' : '#A0522D'" stroke-width="2" style="flex-shrink:0">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ $t(locationHelpKey) }}</span>
    </div>
    <div ref="mapContainer" class="map-container">
      <!-- map will be rendered here -->
    </div>
    <!-- Location capsule (founder 2026-09-07): the three-row panel collapsed
         into a one-line floating pill; tap flips it open for address +
         coordinates; brightness flash acknowledges each new pick. -->
    <div class="location-capsule" :class="[currentTheme, { flash: capsuleFlash }]" @click="capsuleOpen = !capsuleOpen">
      <div class="capsule-line">
        <svg class="capsule-pin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="capsule-name">{{ locationName || $t('map_selector.click_to_select') }}</span>
        <span v-if="address" class="capsule-addr">{{ address }}</span>
        <svg class="capsule-chev" :class="{ up: !capsuleOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        <button class="capsule-confirm" :disabled="!hasChanges" @click.stop="confirmSelection">{{ $t('map_selector.confirm') }}</button>
      </div>
      <div v-if="capsuleOpen" class="capsule-detail" @click.stop>
        <div class="cap-row"><span class="cap-label">{{ $t('map_selector.address') }}</span><span class="cap-value">{{ address || '—' }}</span></div>
        <div class="cap-row"><span class="cap-label">{{ $t('map_selector.coordinates') }}</span><span class="cap-value cap-coords">{{ selectedCoords.lat?.toFixed(6) || '0.000000' }}, {{ selectedCoords.lng?.toFixed(6) || '0.000000' }}</span></div>
      </div>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner large"></div>
        <p>{{ $t('map_selector.loading_map') }}</p>
      </div>
    </div>

    <!-- Leave-confirm modal — same glacier recipe as JinniChat's modals
         (founder 2026-09-07), replacing the native browser confirm(). -->
    <div v-if="showLeaveModal" class="leave-modal-overlay" @click="showLeaveModal = false">
      <div class="leave-modal" :class="currentTheme" @click.stop>
        <div class="leave-modal-icon">
          <svg width="44" height="44" viewBox="0 2 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="8" x2="12" y2="14"/>
            <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <h3>{{ $t('map_selector.unsaved_changes') }}</h3>
        <div class="leave-modal-actions">
          <button class="leave-modal-btn leave-modal-btn--stay" @click="showLeaveModal = false">{{ $t('map_selector.stay') }}</button>
          <button class="leave-modal-btn leave-modal-btn--leave" @click="confirmLeave">{{ $t('map_selector.leave') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isNightTime } from '@/utils/timeUtils';
import { locationHelpKey } from '@/utils/locationHelp';

export default {
  name: 'MapSelector',
  data() {
    return {
      map: null,
      marker: null,
      currentLocationMarker: null,  
      selectedCoords: { lat: 0, lng: 0 },
      marketNotice: null,
      marketBlocked: false,
      _marketTimer: null,
      locationName: '',
      address: '',
      countryName: '',
      countryCode: '', 
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      isLoading: true,
      hasChanges: false,
      showLeaveModal: false,
      capsuleOpen: false,
      capsuleFlash: false,
      searchDebounce: null,
      returnTo: '/chat',
      gpsDenied: false
    };
  },
  computed: {
    currentTheme() {
      const savedSettings = localStorage.getItem('jinni_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.theme === 'light') return 'day-mode';
          if (settings.theme === 'dark') return 'night-mode';
          return isNightTime() ? 'night-mode' : 'day-mode';
        } catch (error) { console.error('Failed to parse settings:', error) }
      }
      return isNightTime() ? 'night-mode' : 'day-mode';
    },
    gpsAllowed() {
      try {
        const settings = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
        return settings.privacy?.autoDetectLocation === true;
      } catch { return false; }
    },
    locationHelpKey() { return locationHelpKey(); }
  },
  mounted() {
    this.returnTo = this.$route.query.returnTo || '/chat';
    this.loadInitialLocation();
    this.initializeMap();
    this.checkGpsDenied();
  },
  beforeUnmount() {if (this.map) { this.map.remove() }},
  watch: {
    // A new pin (map tap, search pick, my-location) re-checks whether Jinni has
    // launched there; the notice is informative only — confirming still works.
    selectedCoords() {
      clearTimeout(this._marketTimer);
      this._marketTimer = setTimeout(() => this.checkMarket(), 600);
    }
  },
  methods: {
    async checkMarket() {
      try {
        const { lat, lng } = this.selectedCoords || {};
        if (!lat || !lng || (lat === 20 && lng === 0)) { this.marketNotice = null; return }
        const token = localStorage.getItem('authToken');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const r = await fetch(`${API_BASE_URL}/api/ai/market-status?lat=${lat}&lng=${lng}&lang=${this.$i18n?.locale || 'en'}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const d = await r.json();
        this.marketNotice = (d && d.mode === 'closed') ? d.message : null;
        if (!this.marketNotice) this.marketBlocked = false;
      } catch { this.marketNotice = null; this.marketBlocked = false }
    },
    loadInitialLocation() {
      try {
        const savedSettings = localStorage.getItem('jinni_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          const coords = settings.location?.coordinates;
          if (coords && coords.lat !== 0 && coords.lng !== 0) {
            this.selectedCoords = { lat: coords.lat, lng: coords.lng };
            this.locationName = settings.location.city || '';
            return;
          }
        }
      } catch (error) { console.error('Failed to load initial location:', error) }
      this.selectedCoords = { lat: 20, lng: 0 };
    },
    async initializeMap() {
      try {
        const L = await this.loadLeaflet();
        this.L = L;
        const initialZoom = (this.selectedCoords.lat === 20 && this.selectedCoords.lng === 0) ? 2 : 13;
        this.map = L.map(this.$refs.mapContainer, {minZoom: 2, maxZoom: 18, worldCopyJump: false, continuousWorld: false, noWrap: true}).setView([this.selectedCoords.lat, this.selectedCoords.lng], initialZoom);
        this.map.attributionControl.remove();
        // Paint the zoom control inline (founder 2026-09-07: +/- rendered
        // white in night mode on device despite the CSS overrides — Leaflet's
        // stylesheet is injected at runtime and can land after ours; inline
        // styles are immune to load order).
        this.$nextTick(() => {
          const night = this.currentTheme === 'night-mode';
          const bar = this.$refs.mapContainer && this.$refs.mapContainer.querySelector('.leaflet-control-zoom');
          if (!bar) return;
          bar.style.cssText += `;border:none;border-radius:12px;overflow:hidden;background:${night ? 'rgba(17,25,52,0.62)' : 'rgba(255,255,255,0.72)'};box-shadow:0 2px 8px rgba(0,0,0,0.14), inset 0 0 0 1px ${night ? 'rgba(165,192,255,0.15)' : 'rgba(0,0,0,0.08)'}, inset 0 1px 0 ${night ? 'rgba(185,208,255,0.16)' : 'rgba(255,255,255,0.85)'};backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%)`;
          bar.querySelectorAll('a').forEach((el, i) => {
            el.style.cssText += `;border:none;background:transparent;color:${night ? '#e2e8f0' : '#A0522D'};font-weight:700${i === 0 ? `;box-shadow:inset 0 -1px 0 ${night ? 'rgba(165,192,255,0.15)' : 'rgba(0,0,0,0.08)'}` : ''}`;
          });
        });
        const PMTILES_URL = import.meta.env.VITE_PMTILES_URL || '';
        if (PMTILES_URL && window.protomapsL && window.protomapsL.leafletLayer) {
          window.protomapsL.leafletLayer({
            url: PMTILES_URL,
            flavor: this.currentTheme === 'night-mode' ? 'dark' : 'light',
            lang: this.mapLang(),
            attribution: '',
          }).addTo(this.map);
        } else {
          const tileUrl = this.currentTheme === 'night-mode' ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
          L.tileLayer(tileUrl, {attribution: '',subdomains: 'abcd',maxZoom: 19,detectRetina: true, noWrap: true}).addTo(this.map);
        }        
        // "Dot & halo" pin (founder's pick, 2026-09-07, from the pin-fitting
        // artifact): jewel dot in a thin glass ring, needle to the exact
        // coordinate. Colors resolved at creation; theme is fixed per visit.
        const night = this.currentTheme === 'night-mode';
        const jewel1 = night ? '#cdb0ff' : '#f0d98c';
        const jewel2 = night ? '#6d3fd6' : '#b8742c';
        const needle = night ? '#8b5cf6' : '#b8742c';
        const halo   = night ? 'rgba(23,20,46,0.4)' : 'rgba(255,251,240,0.35)';
        const haloRim = night ? 'rgba(185,208,255,0.5)' : 'rgba(255,255,255,0.8)';
        const jewelRim = night ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.85)';
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="marker-container">
              <div class="marker-pin">
                <svg width="44" height="54" viewBox="0 0 44 54" aria-hidden="true">
                  <defs>
                    <radialGradient id="jinniJewel" cx="0.35" cy="0.3" r="0.8">
                      <stop offset="0" stop-color="${jewel1}"/><stop offset="1" stop-color="${jewel2}"/>
                    </radialGradient>
                  </defs>
                  <path d="M22 30v21" stroke="${needle}" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="22" cy="17" r="13" fill="${halo}" stroke="${haloRim}" stroke-width="1.4"/>
                  <circle cx="22" cy="17" r="7" fill="url(#jinniJewel)" stroke="${jewelRim}" stroke-width="1.6"/>
                </svg>
              </div>
              <div class="marker-shadow"></div>
              <div class="marker-pulse"></div>
            </div>
          `,
          iconSize: [44, 54],
          iconAnchor: [22, 52]
        });
        this.marker = L.marker([this.selectedCoords.lat, this.selectedCoords.lng], { icon: customIcon, draggable: true, autoPan: true }).addTo(this.map);
        this.marker.on('dragend', (e) => {
          const position = e.target.getLatLng();
          this.updateLocation(position.lat, position.lng);
        });
        let clickTimeout = null;
        let lastClickTime = 0;
        this.map.on('click', (e) => {
          const currentTime = new Date().getTime();
          const timeDiff = currentTime - lastClickTime;          
          if (timeDiff < 300) {
            clearTimeout(clickTimeout);
            lastClickTime = 0;
            return; 
          }
          lastClickTime = currentTime;
          clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            this.updateLocation(e.latlng.lat, e.latlng.lng);
            this.marker.setLatLng([e.latlng.lat, e.latlng.lng]);
          }, 300);
        });
        this.map.on('dblclick', (e) => { this.map.setZoomAround(e.latlng, this.map.getZoom() + 1) });
        this.map.zoomControl.remove();
        const currentTheme = this.currentTheme;
        const ZoomControl = L.Control.extend({
          onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            L.DomEvent.disableClickPropagation(container);
            const zoomIn = L.DomUtil.create('a', 'leaflet-control-zoom-in', container);
            const zoomIconColor = currentTheme === 'night-mode' ? '#c084fc' : '#A0522D';
            zoomIn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${zoomIconColor}" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
            zoomIn.href = '#';
            zoomIn.title = 'Zoom in';
            L.DomEvent.on(zoomIn, 'click', L.DomEvent.stop).on(zoomIn, 'click', function() { map.zoomIn() });
            const zoomOut = L.DomUtil.create('a', 'leaflet-control-zoom-out', container);
            zoomOut.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${zoomIconColor}" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
            zoomOut.href = '#';
            zoomOut.title = 'Zoom out';
            L.DomEvent.on(zoomOut, 'click', L.DomEvent.stop).on(zoomOut, 'click', function() { map.zoomOut() });
            return container;            
          }
        });
        this.map.addControl(new ZoomControl({ position: 'topright' }));
        await this.reverseGeocode(this.selectedCoords.lat, this.selectedCoords.lng);
        this.isLoading = false;
      } catch (error) {
        console.error('Failed to initialize map:', error);
        this.isLoading = false;
      }
    },
    async loadLeaflet() {
      // Same stack as RecommendationMap (founder 2026-09-07: "change to that
      // recommendation map"): Leaflet + protomaps-leaflet rendering OUR
      // self-hosted .pmtiles — no third-party tile service, night flavor
      // matches the chat maps. Falls back to CARTO raster when the env var
      // is unset (dev without tiles).
      const PMTILES_URL = import.meta.env.VITE_PMTILES_URL || '';
      if (window.L && (!PMTILES_URL || window.protomapsL)) return window.L;
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      if (PMTILES_URL && !window.protomapsL) {
        await new Promise((resolve) => {
          const pm = document.createElement('script');
          pm.src = 'https://unpkg.com/protomaps-leaflet@5/dist/protomaps-leaflet.js';
          pm.onload = resolve;
          pm.onerror = resolve; // CARTO fallback below still works
          document.head.appendChild(pm);
        });
      }
      return window.L;
    },
    // Map-label language follows the Settings language (same whitelist as
    // RecommendationMap.mapLang) — protomaps renders labels client-side.
    mapLang() {
      try {
        const l = String(JSON.parse(localStorage.getItem('jinni_settings') || '{}').language || '').slice(0, 2);
        if (['en','ru','hy','fr','zh','ar','es','de','it','el'].includes(l)) return l;
      } catch (e) { /* settings must never break the map */ }
      return 'en';
    },
    updateLocation(lat, lng) {
      this.selectedCoords = { lat, lng };
      this.hasChanges = true;
      if (this.marker) { this.marker.setLatLng([lat, lng]) }
      if (this.map) { this.map.panTo([lat, lng]) }
      this.reverseGeocode(lat, lng);
      // acknowledge the pick (light-only)
      this.capsuleFlash = false;
      clearTimeout(this._capsuleTimer);
      requestAnimationFrame(() => { this.capsuleFlash = true; });
      this._capsuleTimer = setTimeout(() => { this.capsuleFlash = false; }, 1000);
    },
    async reverseGeocode(lat, lng) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        this.locationName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown location';
        this.address = data.display_name;
        this.countryName = data.address?.country || '';
        this.countryCode = data.address?.country_code?.toUpperCase() || '';
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        this.locationName = 'Unknown location';
      }
    },
    handleSearchInput() {
      clearTimeout(this.searchDebounce);
      if (this.searchQuery.length < 3) {
        this.searchResults = [];
        return;
      }
      this.searchDebounce = setTimeout(() => {this.searchLocation()}, 500);
    },
    async searchLocation() {
      if (!this.searchQuery.trim()) return;
      this.isSearching = true;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchQuery)}&format=json&limit=5`);
        const data = await response.json();
        this.searchResults = data;
      } catch (error) { console.error('Search failed:', error) } 
      finally { this.isSearching = false }
    },
    selectSearchResult(result) {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      this.updateLocation(lat, lng);
      this.map.setView([lat, lng], 13);
      this.searchResults = [];
      this.searchQuery = '';
    },
    clearSearch() {
      this.searchQuery = '';
      this.searchResults = [];
    },
    async confirmSelection() {
      try {
        // Closed market: re-verify at confirm time (the pin watcher is
        // debounced) and refuse to save an unlaunched location.
        await this.checkMarket();
        if (this.marketNotice) { this.marketBlocked = true; return }
        if (!this.locationName || !this.address) { await this.reverseGeocode(this.selectedCoords.lat, this.selectedCoords.lng) }
        const savedSettings = localStorage.getItem('jinni_settings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        const locationData = {
          country: this.countryCode,
          countryName: this.countryName,
          city: this.locationName,
          address: this.address,
          coordinates: {lat: this.selectedCoords.lat, lng: this.selectedCoords.lng}
        };
        console.log('📍 Saving location data:', locationData);
        settings.location = locationData;            
        if (!settings.privacy) { settings.privacy = {} }
        settings.privacy.autoDetectLocation = false;
        settings.privacy.locationPermissionGranted = settings.privacy.locationPermissionGranted ?? false;
        localStorage.setItem('jinni_settings', JSON.stringify(settings));
        console.log('💾 Saved to localStorage:', settings);            
        await this.saveToBackend(settings);            
        window.dispatchEvent(new CustomEvent('location-updated', { detail: settings }));            
        if (this.returnTo === 'onboarding') { this.$router.push({ path: '/onboarding', query: this._onboardingReturnQuery() }) }
        else { this.$router.push(this.returnTo) }
      } catch (error) {
        console.error('Failed to save location:', error);
        alert('Failed to save location. Please try again.');
      }
    },
    async saveToBackend(settings) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found');
          return;
        }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        console.log('📤 Sending to backend:', settings);
        const response = await fetch(`${API_BASE_URL}/api/settings`, {method: 'PATCH',headers: {'Content-Type': 'application/json','Authorization': `Bearer ${token}`}, body: JSON.stringify(settings)});
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to save to backend:', response.status, errorText);
        } else {
          const result = await response.json();
          console.log('✅ Backend save successful:', result);
        }
      } catch (error) { console.error('Backend save error:', error) }
    },
    async checkGpsDenied() {
      if (!navigator.permissions) return;
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        this.gpsDenied = result.state === 'denied';
        result.onchange = () => { this.gpsDenied = result.state === 'denied'; };
      } catch (e) { /* Permissions API unavailable */ }
    },
    async goToMyLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      try {
        const position = await new Promise((resolve, reject) => {navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })});
        const { latitude: lat, longitude: lng } = position.coords;
        this.gpsDenied = false;
        this.updateLocation(lat, lng);
        this.map.setView([lat, lng], 13);
        if (this.currentLocationMarker) { this.currentLocationMarker.remove(); }
        this.currentLocationMarker = this.L.circleMarker([lat, lng], {radius: 10, fillColor: '#4285F4', color: '#fff', weight: 2, fillOpacity: 0.9}).addTo(this.map).bindPopup('You are here').openPopup();
      } catch (e) {
        /* iOS: Safari location off in Settings fails instantly with NO prompt —
           code 1 (Safari access denied) or code 2 (Location Services off
           globally). Both mean the OS blocked us: show the settings help. */
        if (e && (e.code === 1 || e.code === 2)) {
          this.gpsDenied = true;
          alert(this.$t(this.locationHelpKey));
        } else {
          alert(this.$t('map_selector.gps_unavailable'));
        }
      }
    },
    goBack() {
      if (this.hasChanges) { this.showLeaveModal = true; return; }
      this._navigateBack();
    },
    confirmLeave() { this.showLeaveModal = false; this._navigateBack(); },
    _navigateBack() {
      if (this.returnTo === 'onboarding') { this.$router.push({ path: '/onboarding', query: this._onboardingReturnQuery() }) }
      else { this.$router.push(this.returnTo) }
    },
    // Restore the flags onboarding forwarded here (obEditing/obReturnTo) so
    // the round-trip doesn't strip edit mode or the Explore return path.
    // Empty for new users — a bare /onboarding, exactly as before.
    _onboardingReturnQuery() {
      const q = {};
      if (this.$route.query.obEditing)  q.editing  = this.$route.query.obEditing;
      if (this.$route.query.obReturnTo) q.returnTo = this.$route.query.obReturnTo;
      return q;
    }
  }
};
</script>

<style>
.map-selector-page .market-notice { position: absolute; top: 74px; left: 50%; transform: translateX(-50%); z-index: 1000; max-width: min(560px, 92vw); padding: 11px 16px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.map-selector-page.night-mode .market-notice { background: rgba(26,11,46,0.88); color: #e8d9b5; box-shadow: 0 0 18px rgba(212,175,55,0.18); }
.map-selector-page.day-mode .market-notice { background: rgba(255,253,248,0.92); color: #5c3f2e; box-shadow: 0 4px 18px rgba(139,69,19,0.14); }
.map-selector-page.night-mode .market-notice--blocked { color: #f2a3a3; box-shadow: 0 0 18px rgba(248,113,113,0.28); }
.map-selector-page.day-mode .market-notice--blocked { color: #c0504d; box-shadow: 0 4px 18px rgba(220,80,80,0.22); }
.gps-denied-banner{display:flex;align-items:flex-start;gap:10px;padding:10px 20px;font-size:13px;line-height:1.5;z-index:998;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.day-mode.gps-denied-banner,.gps-denied-banner.day-mode{background:rgba(212,175,55,0.14);color:#7a4a10;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5)}
.night-mode.gps-denied-banner,.gps-denied-banner.night-mode{background:rgba(139,92,246,0.14);color:#c084fc;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.header-right{display:flex;align-items:center;gap:8px}
.map-selector-page{position:fixed;inset:0;display:flex;flex-direction:column;overflow:hidden}
.map-selector-page.day-mode{background:#f9f5eb}
.map-selector-page.night-mode{background:linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%)}
.map-container{flex:1;position:relative;border-radius:0}
.leaflet-container{font-family:inherit}
.map-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;z-index:1000;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.map-header h1{margin:0;font-size:18px;font-weight:600}
.back-btn,.confirm-btn{display:flex;align-items:center;justify-content:center;gap:6px;min-height:38px;box-sizing:border-box;padding:0 16px;border-radius:12px;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.back-btn{background:transparent}
.confirm-btn{color:white}
.back-btn:active,.confirm-btn:active,.my-location-btn:active{filter:brightness(0.97)}
.confirm-btn:disabled{opacity:0.45;cursor:not-allowed;box-shadow:none!important}
.search-container{position:relative;padding:16px 20px;z-index:999;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.search-wrapper{position:relative;display:flex;align-items:center}
/* z-index lifts the icon ABOVE the input: the input's backdrop-filter makes
   it a stacking layer that paints over the earlier icon — day's translucent
   fill let it ghost through, night's blur swallowed it entirely. */
.search-icon{position:absolute;left:14px;pointer-events:none;z-index:2}
.search-input{width:100%;padding:12px 40px 12px 44px;border-radius:12px;border:none;font-size:16px;font-family:inherit;transition:all 0.2s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.clear-btn{position:absolute;right:10px;padding:6px;border:none;background:transparent;cursor:pointer;border-radius:8px;display:flex;align-items:center;transition:all 0.2s ease}
.search-results{position:absolute;top:70px;left:20px;right:20px;max-height:300px;overflow-y:auto;border-radius:14px;z-index:1000;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%)}
.search-result-item{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;cursor:pointer;transition:all 0.2s ease}
.search-result-item svg{flex-shrink:0}
.result-info{flex:1;min-width:0}
.result-name{font-weight:600;font-size:14px;margin-bottom:4px}
.result-address{font-size:12px;opacity:0.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.searching-indicator{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;font-size:13px;opacity:0.7}
.location-panel{z-index:999;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.panel-content{padding:20px}
.location-info{display:flex;flex-direction:column;gap:8px}
.info-row{display:flex;align-items:center;gap:8px;margin-bottom:0}
.info-label{font-size:13px;font-weight:600;flex-shrink:0;min-width:90px;display:inline-flex;align-items:center;gap:6px}
.info-value{font-size:13px;line-height:1.4;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.coords{font-family:'Courier New',monospace;font-size:12px;background:rgba(128,128,128,0.1);padding:2px 6px;border-radius:4px;font-weight:500}
.address-text{font-size:12px;opacity:0.85;line-height:1.3}
.loading-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.loading-content{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:30px 40px;border-radius:18px;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%)}
.loading-content p{margin:0;font-size:14px;font-weight:500;letter-spacing:0.2px}
.spinner{width:20px;height:20px;border-radius:50%;-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - 3px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - 3px),#000 0);animation:spin 0.8s linear infinite}
.spinner.large{width:42px;height:42px;-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - 4px),#000 0);mask:radial-gradient(farthest-side,#0000 calc(100% - 4px),#000 0)}
.leaflet-control-zoom{margin-top:70px!important;border:none!important;box-shadow:0 8px 24px rgba(0,0,0,0.12)!important;border-radius:12px!important;overflow:hidden;backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important}
.leaflet-control-zoom a{border-radius:0!important;border:none!important;color:inherit!important;transition:all 0.2s ease!important}
.leaflet-control-custom{border:none!important;box-shadow:0 8px 24px rgba(0,0,0,0.12)!important;border-radius:12px!important;overflow:hidden;backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important}
.leaflet-control-zoom-in,.leaflet-control-zoom-out{position:relative!important;width:36px!important;height:36px!important;line-height:36px!important;text-align:center!important;text-decoration:none!important;color:inherit!important;display:flex!important;align-items:center!important;justify-content:center!important;transition:all 0.2s ease!important;border:none!important}
.custom-marker{background:transparent!important;border:none!important}
.marker-container{position:relative;animation:markerDrop 0.5s cubic-bezier(0.34,1.56,0.64,1)}
.marker-pin{position:relative;width:44px;height:54px;margin:0 auto}
.marker-pin svg{display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.28))}
.marker-shadow{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:24px;height:6px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,0.22) 0%,transparent 70%);animation:shadowPulse 2s ease-in-out infinite}
.marker-pulse{position:absolute;top:20px;left:20px;transform:translate(-50%,-50%);width:70px;height:70px;border-radius:50%;animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;pointer-events:none}
.marker-container:hover .marker-pin svg{filter:drop-shadow(0 3px 6px rgba(0,0,0,0.28)) brightness(1.05)}
.my-location-btn{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:12px;border:none;cursor:pointer;transition:all 0.2s ease;flex-shrink:0;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.day-mode .my-location-btn{background:rgba(255,255,255,0.5);color:#A0522D;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .my-location-btn:hover{background:rgba(212,175,55,0.16);box-shadow:0 2px 8px rgba(139,69,19,0.08),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .map-header{background:#f9f5eb;color:#3c2a1e}
.day-mode .back-btn{color:#3c2a1e;background:rgba(255,255,255,0.5);box-shadow:inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .back-btn:hover{background:rgba(212,175,55,0.16);box-shadow:0 2px 8px rgba(139,69,19,0.08),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .confirm-btn{background:linear-gradient(45deg,#D4AF37,#C19A6B);box-shadow:0 0 7px rgba(212,175,55,0.28),inset 0 1px 0 rgba(255,255,255,0.45)}
.day-mode .confirm-btn:hover{box-shadow:0 0 10px rgba(212,175,55,0.5),inset 0 1px 0 rgba(255,255,255,0.45)}
.day-mode .search-container{background:#f9f5eb;box-shadow:0 4px 20px rgba(139,69,19,0.04)}
.day-mode .search-input{background:rgba(255,255,255,0.55);color:#3c2a1e;box-shadow:inset 0 1px 0 rgba(255,255,255,0.55)}
.day-mode .search-input::placeholder{color:rgba(92,74,66,0.7)}
.day-mode .search-input:focus{outline:none;background:rgba(255,255,255,0.66);box-shadow:inset 0 1px 0 rgba(255,255,255,0.55)}
.day-mode .clear-btn:hover{background:rgba(212,175,55,0.15)}
.day-mode .search-results{background:rgba(255,255,255,0.72);box-shadow:0 18px 44px rgba(0,0,0,0.14),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .search-result-item:hover{background:rgba(212,175,55,0.1)}
.day-mode .result-name{color:#3c2a1e}
.day-mode .result-address{color:#5c4a42;opacity:0.85}
.day-mode .location-panel{background:#f9f5eb;box-shadow:0 -4px 20px rgba(139,69,19,0.04)}
.day-mode .info-label{color:#A0522D;opacity:0.9}
.day-mode .info-value{color:#5c4a42;opacity:0.95}
.day-mode .coords{background:rgba(212,175,55,0.12);color:#A0522D}
.day-mode .loading-overlay{background:rgba(249,245,235,0.6)}
.day-mode .loading-content{background:rgba(255,255,255,0.72);box-shadow:0 0 10px rgba(0,0,0,0.14),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .spinner{background:conic-gradient(from 90deg,#d4af3700,#c19a6b 35%,#d4af37)}
.day-mode .loading-content p{color:#3c2a1e}
.day-mode .leaflet-control-zoom{background:rgba(255,255,255,0.6)!important}
.day-mode .leaflet-control-zoom a{background:transparent!important;color:#3c2a1e!important}
.day-mode .leaflet-control-zoom a:hover{background:rgba(212,175,55,0.16)!important}
.day-mode .leaflet-control-custom{background:rgba(255,255,255,0.6)!important;box-shadow:0 8px 24px rgba(139,69,19,0.12),inset 0 1px 0 rgba(255,255,255,0.6)!important}
.day-mode .marker-pulse{background:radial-gradient(circle,rgba(212,175,55,0.18) 0%,rgba(212,175,55,0) 65%)}
.night-mode .map-header{background:#0a0118;color:#e2e8f0}
.night-mode .back-btn{color:#e2e8f0;background:rgba(255,255,255,0.05);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .back-btn:hover{background:rgba(139,92,246,0.18);box-shadow:0 0 7px rgba(139,92,246,0.28),inset 0 1px 0 rgba(255,255,255,0.1)}
.night-mode .confirm-btn{background:linear-gradient(135deg,#8b5cf6,#a855f7);box-shadow:0 0 5px rgba(139,92,246,0.45),inset 0 1px 0 rgba(255,255,255,0.28)}
.night-mode .confirm-btn:hover{background:linear-gradient(135deg,#7c3aed,#9333ea);box-shadow:0 0 9px rgba(139,92,246,0.6),inset 0 1px 0 rgba(255,255,255,0.28)}
.night-mode .my-location-btn{background:rgba(255,255,255,0.05);color:#c084fc;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .my-location-btn:hover{background:rgba(139,92,246,0.18);box-shadow:0 0 7px rgba(139,92,246,0.28),inset 0 1px 0 rgba(255,255,255,0.1)}
.night-mode .search-container{background:#0a0118;box-shadow:0 4px 20px rgba(0,0,0,0.35)}
.night-mode .search-input{background:rgba(255,255,255,0.06);color:#e2e8f0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .search-input::placeholder{color:rgba(226,232,240,0.5)}
.night-mode .search-input:focus{outline:none;background:rgba(255,255,255,0.1);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .clear-btn:hover{background:rgba(139,92,246,0.15)}
.night-mode .search-results{background:rgba(26,11,46,0.92);box-shadow:0 20px 50px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.1)}
.night-mode .search-result-item:hover{background:rgba(139,92,246,0.1)}
.night-mode .result-name{color:#e2e8f0}
.night-mode .result-address{color:#94a3b8;opacity:0.85}
.night-mode .location-panel{background:#0a0118;box-shadow:0 -4px 20px rgba(0,0,0,0.35)}
.night-mode .info-label{color:#c084fc;opacity:0.9}
.night-mode .info-value{color:#e2e8f0;opacity:0.95}
.night-mode .coords{background:rgba(139,92,246,0.12);color:#c084fc}
.night-mode .loading-overlay{background:rgba(10,1,24,0.6)}
.night-mode .loading-content{background:rgba(26,11,46,0.92);box-shadow:0 0 5px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.1)}
.night-mode .spinner{background:conic-gradient(from 90deg,#8b5cf600,#a855f7 35%,#c084fc)}
.night-mode .loading-content p{color:#e2e8f0}
.night-mode .leaflet-control-zoom{background:rgba(20,14,40,0.65)!important}
.night-mode .leaflet-control-zoom a{background:transparent!important;color:#e2e8f0!important}
.night-mode .leaflet-control-zoom a:hover{background:rgba(139,92,246,0.18)!important}
.night-mode .leaflet-control-custom{background:rgba(20,14,40,0.65)!important;box-shadow:0 8px 24px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.08)!important}
.night-mode .marker-pulse{background:radial-gradient(circle,rgba(139,92,246,0.18) 0%,rgba(139,92,246,0) 65%)}
@keyframes markerDrop{0%{transform:translateY(-100px) scale(0.5);opacity:0}60%{transform:translateY(5px) scale(1.1)}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes shadowPulse{0%,100%{transform:translateX(-50%) scale(1);opacity:0.3}50%{transform:translateX(-50%) scale(1.2);opacity:0.2}}
@keyframes pulse{0%{transform:translate(-50%,-50%) scale(0.8);opacity:1}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@media (max-width:768px){.map-header{padding:10px 14px}.my-location-btn{width:32px;height:32px}.map-header h1{font-size:15px}.back-btn,.confirm-btn{padding:0 10px;font-size:12px;min-height:32px}.back-btn svg,.confirm-btn svg{width:16px;height:16px}.search-container{padding:12px 16px}.panel-content{padding:16px}.info-value{font-size:13px}}

/* Day zoom chrome — exact RecommendationMap day recipe (founder 2026-09-07):
   warm glass, sienna glyphs, parchment hover. */
.map-selector-page.day-mode .leaflet-control-zoom{border:none!important;border-radius:12px!important;overflow:hidden;background:rgba(255,255,255,0.72)!important;box-shadow:0 2px 8px rgba(0,0,0,0.14),inset 0 0 0 1px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.85)!important;backdrop-filter:blur(22px) saturate(180%)!important;-webkit-backdrop-filter:blur(22px) saturate(180%)!important}
.map-selector-page.day-mode .leaflet-control-zoom a{border:none!important;background:transparent!important;color:#A0522D!important;font-weight:700!important;transition:background 0.18s ease!important}
.map-selector-page.day-mode .leaflet-control-zoom a:first-child{box-shadow:inset 0 -1px 0 rgba(0,0,0,0.08)!important}
.map-selector-page.day-mode .leaflet-control-zoom a:hover{background:rgba(240,221,170,0.95)!important}

/* Night zoom chrome — exact RecommendationMap night recipe: navy glass,
   violet-tinged ring + glint, deep hover, no bright white rims. */
.map-selector-page.night-mode .leaflet-control-zoom{border:none!important;border-radius:12px!important;overflow:hidden;background:rgba(17,25,52,0.62)!important;box-shadow:0 2px 8px rgba(0,0,0,0.14),inset 0 0 0 1px rgba(165,192,255,0.15),inset 0 1px 0 rgba(185,208,255,0.16)!important;backdrop-filter:blur(22px) saturate(180%)!important;-webkit-backdrop-filter:blur(22px) saturate(180%)!important}
.map-selector-page.night-mode .leaflet-control-zoom a{border:none!important;background:transparent!important;color:#e2e8f0!important;font-weight:700!important;transition:background 0.18s ease!important}
.map-selector-page.night-mode .leaflet-control-zoom a:first-child{box-shadow:inset 0 -1px 0 rgba(165,192,255,0.15)!important}
.map-selector-page.night-mode .leaflet-control-zoom a:hover{background:rgba(40,58,108,0.86)!important}

/* Leave-confirm modal — glacier surfaces copied from JinniChat's
   session-limit modal (day 74% warm glass, night 62% violet-navy glass). */
.leave-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.2);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px}
.leave-modal{border-radius:16px;max-width:380px;width:100%;padding:24px 24px 20px;text-align:center}
.leave-modal.day-mode{background:rgba(255,251,245,0.74);color:#3c2a1e;backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%);box-shadow:0 0 30px rgba(0,0,0,0.18),inset 0 0 0 1px rgba(255,255,255,0.45)}
.leave-modal.night-mode{background:rgba(40,30,62,0.62);color:#e2e8f0;backdrop-filter:blur(30px) saturate(190%);-webkit-backdrop-filter:blur(30px) saturate(190%);box-shadow:inset 0 0 0 1px rgba(167,139,250,0.12),0 0 40px rgba(0,0,0,0.4)}
.leave-modal-icon{width:72px;height:72px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff}
.leave-modal.day-mode .leave-modal-icon{background:linear-gradient(135deg,rgba(212,175,55,0.85),rgba(255,140,0,0.85));box-shadow:inset 0 0 0 1px rgba(255,255,255,0.3)}
.leave-modal.night-mode .leave-modal-icon{background:linear-gradient(135deg,rgba(139,92,246,0.7),rgba(168,85,247,0.7));box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18)}
.leave-modal h3{margin:0 0 18px;font-size:1.05rem;font-weight:600;line-height:1.45}
.leave-modal.day-mode h3{color:#B7791F;font-weight:700}
.leave-modal.night-mode h3{background:linear-gradient(135deg,#8b5cf6,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700}
.leave-modal-actions{display:flex;gap:10px}
.leave-modal-btn{flex:1;padding:11px 14px;border-radius:12px;font-size:0.9rem;font-weight:600;font-family:inherit;cursor:pointer;border:none;transition:background 0.18s ease,box-shadow 0.18s ease}
.leave-modal.day-mode .leave-modal-btn--stay{background:linear-gradient(135deg,rgba(212,175,55,0.9),rgba(227,194,94,0.9));color:#fff;box-shadow:0 0 12px -2px rgba(212,175,55,0.5),inset 0 0 0 1px rgba(255,255,255,0.3)}
.leave-modal.day-mode .leave-modal-btn--leave{background:rgba(255,255,255,0.5);color:#5d4037;box-shadow:inset 0 0 0 1px rgba(160,82,45,0.25)}
.leave-modal.day-mode .leave-modal-btn--leave:hover{background:rgba(240,221,170,0.6)}
.leave-modal.night-mode .leave-modal-btn--stay{background:linear-gradient(135deg,rgba(139,92,246,0.85),rgba(168,85,247,0.85));color:#fff;box-shadow:0 0 12px -2px rgba(139,92,246,0.5),inset 0 0 0 1px rgba(255,255,255,0.18)}
.leave-modal.night-mode .leave-modal-btn--leave{background:rgba(255,255,255,0.07);color:#e2e8f0;box-shadow:inset 0 0 0 1px rgba(167,139,250,0.25)}
.leave-modal.night-mode .leave-modal-btn--leave:hover{background:rgba(139,92,246,0.16)}

/* Location capsule — glacier pill floating over the map (replaces the
   three-row panel; same glass recipes as the zoom controls). */
.location-capsule{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:999;max-width:min(560px,calc(100% - 28px));border-radius:22px;padding:11px 16px;cursor:pointer;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);transition:background .25s ease}
.location-capsule.day-mode{background:rgba(255,251,245,0.74);color:#3c2a1e;box-shadow:inset 0 0 0 1px rgba(160,82,45,0.25),inset 0 1px 0 rgba(255,255,255,0.8),0 0 18px -2px rgba(0,0,0,0.28)}
.location-capsule.night-mode{background:rgba(17,25,52,0.68);color:#e2e8f0;box-shadow:inset 0 0 0 1px rgba(167,139,250,0.3),inset 0 1px 0 rgba(185,208,255,0.18),0 0 18px -2px rgba(0,0,0,0.5)}
.location-capsule.flash{animation:capsule-flash 0.9s ease-out}
@keyframes capsule-flash{0%{filter:brightness(1.3) saturate(1.25)}100%{filter:none}}
.capsule-line{display:flex;align-items:center;gap:8px;min-width:0}
.capsule-pin{flex:none;color:#A0522D}
.location-capsule.night-mode .capsule-pin{color:#c084fc}
.capsule-name{font-weight:600;font-size:0.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none;max-width:48%}
.capsule-addr{font-size:0.8rem;opacity:0.68;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.capsule-chev{flex:none;opacity:0.6;transition:transform .25s ease}
.capsule-chev.up{transform:rotate(180deg)}
.capsule-detail{margin-top:10px;padding-top:10px;display:flex;flex-direction:column;gap:7px;cursor:default;border-top:1px solid rgba(160,82,45,0.18)}
.location-capsule.night-mode .capsule-detail{border-top-color:rgba(167,139,250,0.22)}
.cap-row{display:flex;justify-content:space-between;gap:14px;font-size:0.82rem}
.cap-label{opacity:0.6;flex:none}
.cap-value{text-align:right;word-break:break-word}
.cap-coords{font-variant-numeric:tabular-nums}
.capsule-confirm{flex:none;margin-left:2px;padding:7px 14px;border:none;border-radius:999px;cursor:pointer;font-family:inherit;font-size:0.82rem;font-weight:600;color:#fff;transition:filter .18s ease}
.location-capsule.day-mode .capsule-confirm{background:linear-gradient(135deg,rgba(212,175,55,0.95),rgba(184,116,44,0.95));box-shadow:inset 0 0 0 1px rgba(255,255,255,0.3),0 0 10px -2px rgba(212,175,55,0.5)}
.location-capsule.night-mode .capsule-confirm{background:linear-gradient(135deg,rgba(139,92,246,0.9),rgba(168,85,247,0.9));box-shadow:inset 0 0 0 1px rgba(255,255,255,0.2),0 0 10px -2px rgba(139,92,246,0.55)}
.capsule-confirm:hover:not(:disabled){filter:brightness(1.08)}
.capsule-confirm:disabled{opacity:0.4;cursor:default}
</style>