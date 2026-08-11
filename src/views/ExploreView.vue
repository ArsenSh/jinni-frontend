<template>
  <div class="explore" :class="theme">
    <!-- ═══ Header — centered, chat-glacier back pill ═══ -->
    <header class="ex-head">
      <button class="ex-back" @click="goBack">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        {{ t('explore.back_chat') || 'Back to Chat' }}
      </button>
      <h1 class="ex-title">{{ t('explore.title') || "Jinni's Discoveries" }}</h1>
      <!-- Framed as an open, growing set rather than a finished one. Saying
           Jinni "already analysed/visited" these places would read as a closed
           list and make a region look thin when it only holds a few finds;
           "so far / keeps growing" says the same thing while making clear
           Jinni is still enriching itself. -->
      <p class="ex-intro">{{ t('explore.intro') || 'Places Jinni has discovered here so far — the list keeps growing.' }}</p>
      <p class="ex-sub" v-if="location && (location.city || location.country)">
        {{ [location.city, location.country].filter(Boolean).join(', ') }}
      </p>
    </header>

    <!-- ═══ Search — explore any city / region / country (TripAdvisor-style) ═══ -->
    <form class="ex-search" @submit.prevent="searchPlace">
      <svg class="ex-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="searchQ" class="ex-search-input" type="search" enterkeyhint="search"
             :placeholder="t('explore.search_ph') || 'Where to? City, region, country…'"/>
      <button type="submit" class="ex-search-btn" :disabled="searchBusy || !searchQ.trim()">
        {{ searchBusy ? '…' : (t('explore.search') || 'Search') }}
      </button>
    </form>
    <div v-if="override" class="ex-showing">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <strong>{{ override.label }}</strong>
      <button class="ex-showing-clear" @click="clearSearch" :title="t('map.clear_route') || 'Clear'">✕</button>
    </div>
    <div v-else-if="searchMiss" class="ex-showing ex-showing--miss">{{ t('explore.search_none') || "Couldn't find that place." }}</div>

    <!-- ═══ Category nav (sticky) ═══ -->
    <nav v-if="hasAny" class="ex-nav">
      <button v-for="c in orderedCategories" :key="c"
              class="ex-chip" :class="{ active: activeCat === c }"
              @click="scrollToCat(c)">
        {{ catLabel(c) }}
        <span class="ex-chip-count">{{ categories[c].length }}</span>
      </button>
    </nav>

    <!-- ═══ Loading ═══ -->
    <div v-if="loading" class="ex-section">
      <span class="ex-sk-title shimmer"></span>
      <div class="ex-rail ex-rail--sk">
        <div v-for="n in 5" :key="'sk'+n" class="ex-card ex-card--sk">
          <div class="ex-card-imgwrap shimmer"></div>
          <span class="ex-sk-line shimmer" style="width:75%"></span>
          <span class="ex-sk-line shimmer" style="width:45%"></span>
        </div>
      </div>
      <span class="ex-sk-title shimmer" style="width:120px"></span>
      <div class="ex-rail ex-rail--sk">
        <div v-for="n in 5" :key="'sk2'+n" class="ex-card ex-card--sk">
          <div class="ex-card-imgwrap shimmer"></div>
          <span class="ex-sk-line shimmer" style="width:70%"></span>
        </div>
      </div>
    </div>

    <!-- ═══ Not explored yet ═══ -->
    <div v-else-if="!hasAny" class="ex-empty">
      <div class="ex-empty-icon">✨</div>
      <p class="ex-empty-title">{{ notExploredTitle }}</p>
      <p class="ex-empty-sub">{{ t('explore.empty_sub') || 'Ask Jinni in chat to discover places here — they’ll appear on this page as you explore.' }}</p>
      <button class="ex-cta" @click="goChat">{{ t('explore.ask_chat') || 'Ask Jinni' }}</button>
    </div>

    <!-- ═══ Content — one horizontal rail of cover cards per category ═══ -->
    <template v-else>
      <section v-for="c in orderedCategories" :key="c" :ref="el => catEls[c] = el" class="ex-section">
        <div class="ex-section-head">
          <h2 class="ex-section-title">{{ catLabel(c) }}</h2>
        </div>
        <div class="ex-rail-wrap">
          <button class="ex-rail-btn ex-rail-btn--prev" @click="scrollRail(c, -1)" tabindex="-1" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="ex-rail-btn ex-rail-btn--next" @click="scrollRail(c, 1)" tabindex="-1" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div class="ex-rail" :ref="el => railEls[c] = el" @scroll.passive="onRailScroll(c, $event)">
          <!-- TripAdvisor-style borderless tile: rounded image with actions on
               it, name + meta as plain text below on the page background. -->
          <div v-for="p in categories[c]" :key="c + p.placeId"
               class="ex-card" :class="p.tier ? 'ex-card--' + p.tier : ''"
               @click="openPlace(p)">
            <div class="ex-card-imgwrap">
              <img v-if="p.image" class="ex-card-img" :src="imgUrl(p.image)" :alt="p.name" loading="lazy"
                   @error="$event.target.style.display='none'"/>
              <div v-else class="ex-card-imgless">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
              </div>

              <!-- Partner tier chip (same wording as the map tier labels) -->
              <span v-if="p.tier" class="ex-tier" :class="'ex-tier--' + p.tier">✦ {{ tierLabel(p.tier) }}</span>

              <!-- Save — the chat's hanging ribbon bookmark, gold when saved -->
              <button class="ex-save" :class="{ saved: !!saved[p.placeId] }" @click.stop="toggleSave(p, c)"
                      :title="saved[p.placeId] ? (t('chat.saved.remove_saved') || 'Remove from saved') : (t('chat.saved.save_place') || 'Save place')">
                <svg v-if="saved[p.placeId]" width="24" height="90" viewBox="0 0 24 90" fill="url(#exSaveGradient)" stroke="none">
                  <defs>
                    <linearGradient id="exSaveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="rgb(212,175,55)"/>
                      <stop offset="100%" stop-color="rgb(255,140,0)"/>
                    </linearGradient>
                  </defs>
                  <path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-else width="24" height="90" viewBox="0 0 24 90" fill="rgba(255,255,255,0.34)" stroke="none"><path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
              <!-- Photos / info — revealed on hover (always visible on touch) -->
              <div class="ex-card-acts ex-card-acts--bottom" @click.stop>
                <button class="ex-act" :title="t('explore.photos') || 'Photos'" @click="openGallery(p)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
                </button>
                <button class="ex-act" :title="t('place_info.more_info') || 'More info'" @click="openInfo(p)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </button>
              </div>
            </div>

            <div class="ex-card-name">{{ p.name }}</div>
            <div class="ex-card-sub">
              <span v-if="p.region" class="ex-card-region">{{ p.region }}</span><span v-if="p.region && Number.isFinite(p.distanceKm)"> · </span><span v-if="Number.isFinite(p.distanceKm)" class="ex-card-dist">{{ p.distanceKm }} {{ t('explore.km') || 'km' }}</span>
            </div>
          </div>
          </div>
          <!-- Slim scroll indicator — appears only while the rail is scrolling -->
          <div class="ex-rail-scroll" :class="{ on: railBar[c] && railBar[c].on }">
            <span class="ex-rail-thumb" :style="railBar[c] ? { width: railBar[c].w, left: railBar[c].x } : {}"></span>
          </div>
        </div>
      </section>
    </template>

    <!-- ═══ Fullscreen gallery ═══ -->
    <div v-if="gallery.open" class="ex-gallery" @click.self="closeGallery">
      <button class="ex-gallery-close" @click="closeGallery">✕</button>
      <button v-if="gallery.images.length > 1" class="ex-gallery-nav ex-gallery-nav--prev" @click="galleryStep(-1)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <img class="ex-gallery-img" :src="gallery.images[gallery.idx]" :alt="gallery.name"/>
      <button v-if="gallery.images.length > 1" class="ex-gallery-nav ex-gallery-nav--next" @click="galleryStep(1)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div class="ex-gallery-bar">
        <span class="ex-gallery-name">{{ gallery.name }}</span>
        <span v-if="gallery.images.length > 1" class="ex-gallery-count">{{ gallery.idx + 1 }} / {{ gallery.images.length }}</span>
      </div>
    </div>

    <!-- ═══ Place info modal ═══ -->
    <div v-if="info.open" class="ex-info-overlay" @click.self="closeInfo">
      <div class="ex-info">
        <button class="ex-info-close" @click="closeInfo">✕</button>
        <div v-if="info.loading" class="ex-info-loading"><span class="ex-info-spinner"></span></div>
        <template v-else>
          <img v-if="info.image" class="ex-info-img" :src="info.image" :alt="info.data?.name"/>
          <div class="ex-info-body">
            <h3 class="ex-info-name">
              {{ info.data?.name || info.place?.name }}
              <span v-if="info.place?.tier" class="ex-tier ex-tier--inline" :class="'ex-tier--' + info.place.tier">✦ {{ tierLabel(info.place.tier) }}</span>
            </h3>
            <div v-if="Number.isFinite(info.data?.rating)" class="ex-info-rating">★ {{ info.data.rating.toFixed(1) }}</div>
            <p v-if="info.data?.description" class="ex-info-desc">{{ info.data.description }}</p>
            <div class="ex-info-rows">
              <div v-if="info.data?.address" class="ex-info-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{{ info.data.address }}</span>
              </div>
              <div v-if="info.data?.phone" class="ex-info-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a :href="'tel:' + info.data.phone" @click.stop>{{ info.data.phone }}</a>
              </div>
              <div v-if="info.data?.website" class="ex-info-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <a :href="info.data.website" target="_blank" rel="noopener noreferrer" @click.stop>{{ t('place_info.visit_website') || 'Visit Website' }}</a>
              </div>
            </div>
            <div v-if="info.data?.hours?.length" class="ex-info-hours">
              <div class="ex-info-hours-title">{{ t('place_info.hours') || 'Hours' }}</div>
              <div v-for="line in info.data.hours" :key="line" class="ex-info-hours-line">{{ line }}</div>
            </div>
            <div class="ex-info-actions">
              <button class="ex-cta ex-cta--sm" @click="openPlace(info.place)">{{ t('place_info.get_directions') || 'Get Directions' }}</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { isNightTime } from '../utils/timeUtils';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

const CAT_LABELS = {
  restaurants: 'Restaurants', hotels: 'Hotels', historical: 'Historical sites',
  events: 'Events', photo_spots: 'Photo spots', hidden_gems: 'Hidden gems', shopping: 'Shops',
};

export default {
  name: 'ExploreView',
  data() {
    return {
      loading: true,
      categories: {},
      location: null,
      activeCat: null,
      serverOrder: null,
      catEls: {},
      railEls: {},
      railBar: {},          // per-category scroll indicator state { w, x, on }
      _railTimers: {},
      theme: 'night-mode',
      // placeId → SavedPlace _id (from GET /api/saves); presence = saved.
      saved: {},
      saveBusy: null,
      searchQ: '',
      searchBusy: false,
      searchMiss: false,
      override: null,   // { lat, lng, label } — explore a searched place instead of the user's area
      gallery: { open: false, images: [], idx: 0, name: '' },
      info: { open: false, loading: false, data: null, image: null, place: null },
    };
  },
  computed: {
    orderedCategories() {
      // Prefer the server's interest-weighted order (user preferences first);
      // fall back to a sensible default. Only categories that have places.
      const order = (Array.isArray(this.serverOrder) && this.serverOrder.length)
        ? this.serverOrder
        : ['restaurants', 'historical', 'hidden_gems', 'photo_spots', 'events', 'shopping', 'hotels'];
      return order.filter(c => this.categories[c] && this.categories[c].length);
    },
    hasAny() { return this.orderedCategories.length > 0; },
    notExploredTitle() {
      const where = this.location && (this.location.city || this.location.country)
        ? [this.location.city, this.location.country].filter(Boolean).join(', ')
        : (this.t('explore.this_area') || 'this area');
      return this.t('explore.not_explored', { place: where }) || `Jinni hasn’t been to ${where} yet`;
    },
  },
  mounted() {
    this.theme = this.resolveTheme();
    this.load();
    this.loadSaved();
    this._onKey = (e) => {
      if (e.key === 'Escape') { this.closeGallery(); this.closeInfo(); }
      else if (this.gallery.open && e.key === 'ArrowRight') this.galleryStep(1);
      else if (this.gallery.open && e.key === 'ArrowLeft') this.galleryStep(-1);
    };
    window.addEventListener('keydown', this._onKey);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this._onKey);
    if (this._spy) this._spy.disconnect();
  },
  methods: {
    t(key, params) { return this.$t ? this.$t(key, params) : null; },
    // Same resolution as JinniChat's currentTheme: explicit setting wins,
    // 'auto' follows the time of day.
    resolveTheme() {
      try {
        const s = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
        if (s.theme === 'light') return 'day-mode';
        if (s.theme === 'dark') return 'night-mode';
      } catch (e) { /* corrupt settings → fall through to auto */ }
      return isNightTime() ? 'night-mode' : 'day-mode';
    },
    imgUrl(u) { return u && u.startsWith('/api/') ? `${API_BASE}${u}` : u; },
    catLabel(c) {
      // $t returns the key itself when a message is missing (e.g. a new
      // server-side category) — fall back to the English label then.
      const key = 'explore.cat.' + c;
      const s = this.$t ? this.$t(key) : null;
      return (s && s !== key) ? s : (CAT_LABELS[c] || c);
    },
    async load() {
      this.loading = true;
      try {
        const qs = this.override
          ? `?lat=${this.override.lat}&lng=${this.override.lng}&label=${encodeURIComponent(this.override.label)}`
          : '';
        const res = await fetch(`${API_BASE}/api/ai/explore${qs}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          this.categories = data.categories || {};
          this.location = data.location || null;
          this.serverOrder = Array.isArray(data.order) ? data.order : null;
        } else {
          this.categories = {};
          this.location = null;
        }
        this.activeCat = this.orderedCategories[0] || null;
      } catch (e) {
        console.error('Explore load failed:', e);
        this.categories = {};
      } finally {
        this.loading = false;
        this.$nextTick(() => this.setupScrollSpy());
      }
    },
    // Highlight the category chip of the section currently in view.
    setupScrollSpy() {
      if (this._spy) this._spy.disconnect();
      if (typeof IntersectionObserver === 'undefined') return;
      this._spy = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const c = Object.keys(this.catEls).find(k => this.catEls[k] === en.target);
          if (c) this.activeCat = c;
        }
      }, { rootMargin: '-15% 0px -70% 0px' });
      for (const c of this.orderedCategories) {
        if (this.catEls[c]) this._spy.observe(this.catEls[c]);
      }
    },
    scrollToCat(c) {
      this.activeCat = c;
      this.catEls[c]?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    },
    // Slim per-rail scroll indicator: reflects position while scrolling,
    // fades out ~1s after the last scroll event.
    onRailScroll(c, e) {
      const el = e.target;
      if (!el || el.scrollWidth <= el.clientWidth) return;
      const w = Math.max((el.clientWidth / el.scrollWidth) * 100, 8);
      const x = (el.scrollLeft / el.scrollWidth) * 100;
      this.railBar = { ...this.railBar, [c]: { w: w + '%', x: x + '%', on: true } };
      clearTimeout(this._railTimers[c]);
      this._railTimers[c] = setTimeout(() => {
        if (this.railBar[c]) this.railBar = { ...this.railBar, [c]: { ...this.railBar[c], on: false } };
      }, 1000);
    },
    // Desktop rail paging — one "page" of cards per click.
    scrollRail(c, dir) {
      const rail = this.railEls[c];
      if (!rail) return;
      rail.scrollBy({ left: dir * Math.round(rail.clientWidth * 0.85), behavior: 'smooth' });
    },
    authHeaders() { return { Authorization: `Bearer ${localStorage.getItem('authToken')}` }; },
    // ── Search any destination (Nominatim — same geocoder the rest of the app uses) ──
    async searchPlace() {
      const q = this.searchQ.trim();
      if (!q || this.searchBusy) return;
      this.searchBusy = true;
      this.searchMiss = false;
      try {
        const lang = (this.$i18n && this.$i18n.locale) || 'en';
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=${lang}&q=${encodeURIComponent(q)}`);
        const rows = await res.json().catch(() => []);
        if (Array.isArray(rows) && rows[0]) {
          const label = String(rows[0].display_name || q).split(',').slice(0, 2).map(s => s.trim()).join(', ');
          this.override = { lat: +rows[0].lat, lng: +rows[0].lon, label };
          this.load();
        } else {
          this.searchMiss = true;
          setTimeout(() => { this.searchMiss = false; }, 3000);
        }
      } catch (e) { console.error('Search failed:', e); }
      finally { this.searchBusy = false; }
    },
    clearSearch() { this.override = null; this.searchQ = ''; this.searchMiss = false; this.load(); },
    tierLabel(tier) {
      return this.t('map.tier_' + tier)
        || ({ signature: "Jinni's Signature", spotlight: "Jinni's Spotlight", verified: 'Jinni Verified' })[tier] || tier;
    },
    // ── Saves (same API the chat uses) ──
    async loadSaved() {
      try {
        const res = await fetch(`${API_BASE}/api/saves?limit=200`, { headers: this.authHeaders() });
        const data = await res.json().catch(() => ({}));
        const rows = Array.isArray(data?.data) ? data.data : [];
        const map = {};
        for (const s of rows) if (s.googlePlaceId) map[s.googlePlaceId] = s._id;
        this.saved = map;
      } catch (e) { /* saved states just stay empty */ }
    },
    async toggleSave(p, category) {
      if (this.saveBusy === p.placeId) return;
      this.saveBusy = p.placeId;
      try {
        const existing = this.saved[p.placeId];
        if (existing) {
          const res = await fetch(`${API_BASE}/api/saves/${existing}`, { method: 'DELETE', headers: this.authHeaders() });
          if (res.ok) { const m = { ...this.saved }; delete m[p.placeId]; this.saved = m; }
        } else {
          const res = await fetch(`${API_BASE}/api/saves`, {
            method: 'POST',
            headers: { ...this.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googlePlaceId: p.placeId,
              snapshot: {
                name: p.name,
                category: category || null,
                image: p.image || '',
                address: p.region || '',
                location: p.region || '',
                distance: Number.isFinite(p.distanceKm) ? `${p.distanceKm} km` : '',
                rating: Number.isFinite(p.rating) ? p.rating : null,
                partnerTier: p.tier || null,
              },
            }),
          });
          const data = await res.json().catch(() => ({}));
          const id = data?.data?._id || data?.save?._id || data?._id;
          if (res.ok && id) this.saved = { ...this.saved, [p.placeId]: id };
          else if (res.ok) this.loadSaved();
        }
      } catch (e) { console.error('toggleSave failed:', e); }
      finally { this.saveBusy = null; }
    },
    // ── Gallery ──
    async openGallery(p) {
      this.gallery = { open: true, images: p.image ? [this.imgUrl(p.image)] : [], idx: 0, name: p.name };
      try {
        const res = await fetch(`${API_BASE}/api/ai/place-images/${p.placeId}`, { headers: this.authHeaders() });
        const data = await res.json().catch(() => ({}));
        const stored = (data?.images || []).filter(im => im.hasStoredImage).map(im => `${API_BASE}${im.url}`);
        if (stored.length) this.gallery = { ...this.gallery, images: stored, idx: 0 };
      } catch (e) { /* keep the card image */ }
    },
    galleryStep(dir) {
      const n = this.gallery.images.length;
      if (n) this.gallery.idx = (this.gallery.idx + dir + n) % n;
    },
    closeGallery() { this.gallery = { open: false, images: [], idx: 0, name: '' }; },
    // ── Info ──
    async openInfo(p) {
      this.info = { open: true, loading: true, data: null, image: p.image ? this.imgUrl(p.image) : null, place: p };
      try {
        const res = await fetch(`${API_BASE}/api/ai/place-details/${encodeURIComponent(p.placeId)}?name=${encodeURIComponent(p.name)}`, { headers: this.authHeaders() });
        const data = await res.json().catch(() => ({}));
        this.info = { ...this.info, loading: false, data: data?.data || null };
      } catch (e) {
        this.info = { ...this.info, loading: false, data: null };
      }
    },
    closeInfo() { this.info = { open: false, loading: false, data: null, image: null, place: null }; },
    openPlace(p) {
      // Open on Google Maps (a public maps search URL — no API key exposed).
      const q = encodeURIComponent(`${p.name} ${[this.location?.city, this.location?.country].filter(Boolean).join(' ')}`);
      const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a); a.click(); a.remove();
    },
    goChat() { this.$router.push({ name: 'JinniChat' }).catch(() => { window.location.href = '/chat'; }); },
    goBack() { if (window.history.length > 1) this.$router.back(); else this.goChat(); },
  },
};
</script>

<style scoped>
/* ── Glacier tokens — same palette as JinniChat ──
   day: cream #f9f5eb bg, warm-white glass, #B7791F headings, gold actives
   night: #0a0118 bg, violet glass rgba(40,30,62,…), #c084fc headings, purple actives */
.explore.day-mode {
  --ex-bg: #f9f5eb; --ex-heading: #B7791F; --ex-text: #3c2a1e; --ex-muted: #5a4a42;
  --ex-glass: rgba(255,251,245,0.74); --ex-glass-2: rgba(255,255,255,0.85);
  --ex-ring: inset 0 0 0 1px rgba(255,255,255,0.7); --ex-line: rgba(160,82,45,0.18);
  --ex-chip: rgba(255,255,255,0.55); --ex-chip-text: rgba(92,74,66,0.9);
  --ex-shadow: 0 8px 24px rgba(120,80,30,0.10); --ex-shimmer: rgba(160,82,45,0.10); --ex-glint: rgba(255,255,255,0.6);
  --ex-accent: #A0522D;
  --ex-active-grad: linear-gradient(135deg, rgba(212,175,55,0.85), rgba(255,140,0,0.85));
  --ex-active-ring: inset 0 0 0 1px rgba(255,255,255,0.35);
  --ex-active-shadow: 0 4px 14px rgba(212,175,55,0.35);
  --ex-act-bg: rgba(255,255,255,0.94); --ex-act-bg-hover: #ffffff; --ex-act-fg: #3c2a1e;
  --ex-arrow-bg: #ffffff; --ex-arrow-fg: #3c2a1e; --ex-arrow-line: rgba(160,82,45,0.22);
  --ex-bg-grad: linear-gradient(180deg, #f9f5eb 0%, #f5edda 55%, #efe4cf 100%);
  /* Chat's glacier active recipe (settings theme-btn.active, day) */
  --ex-chip-active-bg: rgba(255,255,255,0.92); --ex-chip-active-fg: #8a5a1e;
  --ex-chip-active-shadow: 0 1px 4px rgba(120,80,30,0.16);
  --ex-search-bg: rgba(255,255,255,0.6);
}
.explore.night-mode {
  --ex-bg: #0a0118; --ex-heading: #c084fc; --ex-text: #d5dce4; --ex-muted: #94a3b8;
  --ex-glass: rgba(40,30,62,0.55); --ex-glass-2: rgba(255,255,255,0.10);
  --ex-ring: inset 0 0 0 1px rgba(167,139,250,0.14); --ex-line: rgba(255,255,255,0.10);
  --ex-chip: rgba(40,30,62,0.62); --ex-chip-text: #cbd5e1;
  --ex-shadow: 0 8px 26px rgba(0,0,0,0.45); --ex-shimmer: rgba(255,255,255,0.06); --ex-glint: rgba(255,255,255,0.10);
  --ex-accent: #c084fc;
  --ex-active-grad: linear-gradient(135deg, rgba(139,92,246,0.82), rgba(168,85,247,0.82));
  --ex-active-ring: inset 0 0 0 1px rgba(255,255,255,0.18);
  --ex-active-shadow: 0 4px 14px rgba(139,92,246,0.35);
  --ex-act-bg: rgba(18,12,34,0.78); --ex-act-bg-hover: rgba(18,12,34,0.95); --ex-act-fg: #ffffff;
  --ex-arrow-bg: #241a3f; --ex-arrow-fg: #e8e0f5; --ex-arrow-line: rgba(167,139,250,0.28);
  --ex-bg-grad: linear-gradient(180deg, #0a0118 0%, #1a0b2e 40%, #16213e 100%);
  /* Chat's glacier active recipe (settings theme-btn.active, night) */
  --ex-chip-active-bg: rgba(255,255,255,0.16); --ex-chip-active-fg: #d8b4fe;
  --ex-chip-active-shadow: 0 1px 4px rgba(0,0,0,0.28);
  --ex-search-bg: rgba(255,255,255,0.08);
}

.explore { min-height: 100vh; background: var(--ex-bg-grad); background-attachment: fixed; color: var(--ex-text); padding: 0 0 40px; }

/* Search — TripAdvisor-style pill */
.ex-search { display: flex; align-items: center; gap: 10px; width: min(640px, calc(100% - 36px)); margin: 16px auto 0;
  padding: 6px 6px 6px 18px; border-radius: 999px; background: var(--ex-search-bg);
  box-shadow: var(--ex-ring), 0 8px 26px rgba(0,0,0,0.10); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); }
.ex-search-icon { flex: none; color: var(--ex-muted); }
.ex-search-input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-family: inherit;
  font-size: 0.95rem; color: var(--ex-text); padding: 9px 0; }
.ex-search-input::placeholder { color: var(--ex-muted); }
.ex-search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
.ex-search-btn { flex: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.88rem; font-weight: 700;
  padding: 10px 20px; border-radius: 999px; color: var(--ex-chip-active-fg); background: var(--ex-chip-active-bg); transition: filter .18s; }
.ex-search-btn:hover:not(:disabled) { filter: brightness(1.12); }
.ex-search-btn:disabled { opacity: 0.55; cursor: default; }
.ex-showing { display: flex; align-items: center; gap: 7px; width: fit-content; max-width: calc(100% - 36px); margin: 10px auto 0;
  padding: 6px 12px; border-radius: 999px; font-size: 0.84rem; color: var(--ex-text);
  background: var(--ex-chip); box-shadow: var(--ex-ring); }
.ex-showing svg { color: var(--ex-accent); flex: none; }
.ex-showing strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ex-showing-clear { border: none; cursor: pointer; background: transparent; color: var(--ex-muted); font-size: 0.8rem; padding: 2px 4px; }
.ex-showing-clear:hover { color: var(--ex-text); }
.ex-showing--miss { color: var(--ex-muted); }

/* Header — centered column */
.ex-head { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
  padding: 26px 18px 4px; max-width: 1200px; margin: 0 auto; }
.ex-back { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.84rem; font-weight: 600; color: var(--ex-text); background: var(--ex-chip); box-shadow: var(--ex-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s; }
.ex-back:hover { background: var(--ex-glass-2); }
.ex-title { margin: 0; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.01em;
  color: #D4AF37; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.ex-sub { margin: -4px 0 0; font-size: 0.88rem; color: var(--ex-muted); }
/* Intro line under the title. Sits above .ex-sub (the city/country line) and
   is deliberately quieter than it — it's framing, not data. max-width keeps
   the sentence from stretching edge-to-edge on desktop, where a full-width
   single line reads as a banner rather than a caption. */
.ex-intro {
  margin: 2px auto 0;
  max-width: 34rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: var(--ex-muted);
  opacity: 0.85;
}

/* Sticky category nav */
.ex-nav { position: sticky; top: 0; z-index: 10; display: flex; gap: 8px; overflow-x: auto; padding: 10px 18px; max-width: 1200px; margin: 12px auto 0;
  scrollbar-width: none; background: color-mix(in srgb, var(--ex-bg) 45%, transparent); backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%); }
.ex-nav::-webkit-scrollbar { display: none; }
.ex-chip { flex: none; display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.85rem; font-weight: 600; color: var(--ex-chip-text); background: var(--ex-chip); box-shadow: var(--ex-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s, color .18s; white-space: nowrap; }
.ex-chip:hover { background: var(--ex-glass-2); }
.ex-chip.active { color: var(--ex-chip-active-fg); background: var(--ex-chip-active-bg); box-shadow: var(--ex-chip-active-shadow); }
.ex-chip-count { font-size: 0.72rem; font-weight: 700; opacity: 0.75; font-variant-numeric: tabular-nums; }
.ex-chip.active .ex-chip-count { opacity: 0.9; }

/* Sections + rails */
.ex-section { max-width: 1200px; margin: 0 auto; padding: 22px 0 2px; scroll-margin-top: 64px; }
.ex-section-head { display: flex; align-items: baseline; gap: 10px; margin: 0 64px 12px; }
.ex-section-title { margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.01em; color: var(--ex-heading); }
.ex-section-count { font-size: 0.82rem; color: var(--ex-muted); font-variant-numeric: tabular-nums; }

/* Horizontal rail — snap scrolling, hidden scrollbar. The mask fades cards
   out at both edges ("shadow borders") as they scroll under it, and the
   wrap's side gutters keep the paging arrows clear of the images. */
.ex-rail { display: flex; gap: 14px; overflow-x: auto; padding: 2px 16px 16px;
  scroll-snap-type: x proximity; scroll-padding-left: 16px; scrollbar-width: none; -webkit-overflow-scrolling: touch;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%); }
.ex-rail::-webkit-scrollbar { display: none; }

/* TripAdvisor-style borderless tile — rounded image block, plain text below
   on the page background. No motion on hover: image brightens slightly. */
.ex-card { position: relative; flex: none; width: 252px; cursor: pointer; scroll-snap-align: start; }
.ex-card-imgwrap { position: relative; aspect-ratio: 1 / 1; border-radius: 16px; overflow: hidden; margin-bottom: 9px;
  background: var(--ex-glass-2); box-shadow: var(--ex-ring); }
.ex-card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transition: filter .25s ease; }
.ex-card:hover .ex-card-img { filter: brightness(1.06) saturate(1.04); }
.ex-card-imgless { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--ex-muted); }

/* Card actions — the chat's glacier glass (text-action-btn.info-btn recipe):
   translucent white glass with a hairline inset ring, on the image. */
.ex-card-acts { position: absolute; top: 10px; right: 10px; display: flex; gap: 6px; }
.ex-act { width: 31px; height: 31px; border-radius: 999px; border: none; cursor: pointer; display: grid; place-items: center;
  color: #fff; background: rgba(255,255,255,0.3); box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.6);
  backdrop-filter: blur(2px) saturate(160%); -webkit-backdrop-filter: blur(2px) saturate(160%); transition: background .2s, box-shadow .2s; }
.ex-act:hover { background: rgba(255,255,255,0.42); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9); }
.ex-card-acts--bottom { top: auto; bottom: 10px; }
/* Photos / info stay quiet until the pointer is on the card (touch: always shown) */
@media (hover: hover) and (pointer: fine) {
  .ex-card-acts--bottom { opacity: 0; transition: opacity .2s ease; }
  .ex-card:hover .ex-card-acts--bottom { opacity: 1; }
}

/* Save — the chat's hanging ribbon bookmark (rec-image-save-btn recipe) */
.ex-save { position: absolute; top: -6px; right: 8px; width: 24px; height: 90px; border: none; border-radius: 8px; background: transparent;
  cursor: pointer; display: flex; align-items: flex-start; justify-content: center; overflow: visible; color: #fff; z-index: 6; padding: 0;
  opacity: 0.9; transition: opacity 0.25s ease; }
@media (hover: hover) and (pointer: fine) {
  .ex-save { opacity: 0; }
  .ex-card:hover .ex-save { opacity: 0.85; }
  .ex-card:hover .ex-save:hover { opacity: 1; }
}
.ex-save.saved { opacity: 1 !important; }

/* Partner tier chip + card treatments — chat palette:
   verified green, spotlight blue #3b9fdd, signature gold. */
.ex-tier { position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; color: #fff; white-space: nowrap;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22); }
.ex-tier--verified  { background: rgba(34,197,94,0.72); }
.ex-tier--spotlight { background: rgba(59,159,221,0.75); }
.ex-tier--signature { background: linear-gradient(135deg, rgba(212,175,55,0.88), rgba(255,140,0,0.88)); }
.ex-tier--inline { position: static; margin-left: 8px; font-size: 0.68rem; vertical-align: middle; }
.ex-card--verified  .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(34,197,94,0.55), 0 0 16px rgba(34,197,94,0.16); }
.ex-card--spotlight .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(59,159,221,0.6), 0 0 16px rgba(59,159,221,0.18); }
.ex-card--signature .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(212,175,55,0.65), 0 0 18px rgba(212,175,55,0.22); }

/* Rail paging arrows — TripAdvisor-style solid circles, always visible on
   desktop pointer devices, sitting in the side gutters OFF the images. */
.ex-rail-wrap { position: relative; }
@media (hover: hover) and (pointer: fine) { .ex-rail-wrap { padding: 0 48px; } }
.ex-rail-btn { position: absolute; top: 118px; z-index: 5; width: 40px; height: 40px; border-radius: 999px; cursor: pointer;
  display: none; place-items: center; color: var(--ex-arrow-fg); background: var(--ex-arrow-bg);
  border: 1px solid var(--ex-arrow-line); box-shadow: 0 4px 14px rgba(0,0,0,0.18); transition: background .18s; }
.ex-rail-btn:hover { background: var(--ex-act-bg-hover); }
.ex-rail-btn--prev { left: 0; }
.ex-rail-btn--next { right: 0; }
@media (hover: hover) and (pointer: fine) { .ex-rail-btn { display: grid; } }

/* Slim scroll indicator — appears only while scrolling, fades out after */
.ex-rail-scroll { position: relative; height: 4px; margin: -8px 16px 6px; border-radius: 999px;
  background: color-mix(in srgb, var(--ex-line) 55%, transparent); opacity: 0; transition: opacity .35s ease; pointer-events: none; }
.ex-rail-scroll.on { opacity: 1; }
.ex-rail-thumb { position: absolute; top: 0; height: 100%; border-radius: 999px; min-width: 8%;
  background: linear-gradient(90deg, var(--ex-accent), color-mix(in srgb, var(--ex-accent) 55%, transparent)); }

.ex-card-name { font-size: 0.97rem; font-weight: 700; line-height: 1.3; color: var(--ex-text); margin-bottom: 2px;
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.ex-card-sub { font-size: 0.8rem; color: var(--ex-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ex-card-dist { font-variant-numeric: tabular-nums; }

/* Empty / not explored */
.ex-empty { max-width: 520px; margin: 60px auto; padding: 0 24px; text-align: center; }
.ex-empty-icon { font-size: 44px; margin-bottom: 14px; }
.ex-empty-title { font-size: 1.25rem; font-weight: 800; color: var(--ex-heading); margin: 0 0 8px; }
.ex-empty-sub { font-size: 0.95rem; color: var(--ex-muted); line-height: 1.5; margin: 0 0 22px; }
.ex-cta { padding: 11px 24px; border: none; border-radius: 999px; cursor: pointer; font-family: inherit; font-size: 0.95rem; font-weight: 700; color: #fff;
  background: var(--ex-active-grad); box-shadow: var(--ex-active-ring), 0 6px 20px rgba(0,0,0,0.18), var(--ex-active-shadow); transition: filter .18s, transform .15s; }
.ex-cta:hover { filter: brightness(1.06); }
.ex-cta:active { transform: scale(0.98); }

/* Skeleton */
.ex-card--sk { cursor: default; }
.ex-sk-line { display: block; height: 12px; border-radius: 6px; margin-top: 7px; }
.ex-sk-title { display: block; width: 170px; height: 18px; border-radius: 8px; margin: 0 18px 12px; }
.ex-rail--sk { overflow: hidden; }
.shimmer { position: relative; overflow: hidden; background: var(--ex-shimmer); }
.shimmer::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, var(--ex-glint), transparent); animation: exShimmer 1.5s infinite; }
@keyframes exShimmer { 100% { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .shimmer::after { animation: none; } }

/* Fullscreen gallery */
.ex-gallery { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;
  background: rgba(6,2,16,0.9); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.ex-gallery-img { max-width: min(92vw, 1100px); max-height: 82vh; border-radius: 14px; object-fit: contain; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
.ex-gallery-close { position: absolute; top: 18px; right: 18px; width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer;
  color: #fff; font-size: 1rem; background: rgba(255,255,255,0.1); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.16);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: background .18s; }
.ex-gallery-close:hover { background: rgba(255,255,255,0.22); }
.ex-gallery-nav { position: absolute; top: 50%; margin-top: -24px; width: 48px; height: 48px; border-radius: 999px; border: none; cursor: pointer;
  display: grid; place-items: center; color: #fff; background: rgba(255,255,255,0.1); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.16);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: background .18s; }
.ex-gallery-nav:hover { background: rgba(255,255,255,0.22); }
.ex-gallery-nav--prev { left: 22px; }
.ex-gallery-nav--next { right: 22px; }
.ex-gallery-bar { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 12px;
  padding: 8px 16px; border-radius: 999px; color: #fff; font-size: 0.88rem; background: rgba(0,0,0,0.5);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); max-width: 86vw; }
.ex-gallery-name { font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ex-gallery-count { flex: none; font-variant-numeric: tabular-nums; opacity: 0.8; }

/* Info modal — chat modal chrome: violet glass at night, warm cream by day */
.ex-info-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;
  background: rgba(0,0,0,0.35); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.ex-info { position: relative; width: min(520px, 94vw); max-height: 86vh; overflow-y: auto; border-radius: 18px; color: var(--ex-text); }
.night-mode .ex-info { background: rgba(40,30,62,0.72); box-shadow: inset 0 0 0 1px rgba(167,139,250,0.16), 0 0 40px rgba(0,0,0,0.5);
  backdrop-filter: blur(30px) saturate(190%); -webkit-backdrop-filter: blur(30px) saturate(190%); }
.day-mode .ex-info { background: rgba(255,251,245,0.85); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 0 30px rgba(0,0,0,0.2);
  backdrop-filter: blur(30px) saturate(180%); -webkit-backdrop-filter: blur(30px) saturate(180%); }
.ex-info-close { position: absolute; top: 12px; right: 12px; z-index: 2; width: 32px; height: 32px; border-radius: 999px; border: none; cursor: pointer;
  color: #fff; background: rgba(0,0,0,0.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: background .18s; }
.ex-info-close:hover { background: rgba(0,0,0,0.6); }
.ex-info-loading { display: grid; place-items: center; min-height: 220px; }
.ex-info-spinner { width: 34px; height: 34px; border-radius: 999px; border: 3px solid var(--ex-line); border-top-color: var(--ex-accent); animation: exSpin 0.8s linear infinite; }
@keyframes exSpin { to { transform: rotate(360deg); } }
.ex-info-img { width: 100%; height: 210px; object-fit: cover; display: block; }
.ex-info-body { padding: 16px 20px 20px; }
.ex-info-name { margin: 0 0 4px; font-size: 1.25rem; font-weight: 800; color: var(--ex-heading); }
.ex-info-rating { font-size: 0.92rem; font-weight: 700; color: var(--ex-accent); margin-bottom: 8px; }
.ex-info-desc { margin: 0 0 12px; font-size: 0.92rem; line-height: 1.55; color: var(--ex-text); }
.ex-info-rows { display: flex; flex-direction: column; gap: 9px; margin-bottom: 12px; }
.ex-info-row { display: flex; align-items: flex-start; gap: 9px; font-size: 0.88rem; color: var(--ex-text); }
.ex-info-row svg { flex: none; margin-top: 2px; color: var(--ex-accent); }
.ex-info-row a { color: var(--ex-accent); text-decoration: none; font-weight: 600; overflow-wrap: anywhere; }
.ex-info-hours { margin-bottom: 14px; font-size: 0.82rem; color: var(--ex-muted); }
.ex-info-hours-title { font-weight: 700; color: var(--ex-text); margin-bottom: 4px; font-size: 0.88rem; }
.ex-info-hours-line { line-height: 1.55; }
.ex-info-actions { display: flex; justify-content: flex-end; }
.ex-cta--sm { padding: 9px 18px; font-size: 0.88rem; }

@media (max-width: 520px) {
  .ex-title { font-size: 1.35rem; }
  .ex-section { padding: 16px 0 2px; }
  .ex-section-head { margin: 0 14px 10px; }
  .ex-head, .ex-nav { padding-left: 14px; padding-right: 14px; }
  .ex-rail { gap: 11px; padding: 2px 14px 14px; scroll-padding-left: 14px;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%); }
  .ex-card { width: 46vw; }
  .ex-gallery-nav { width: 42px; height: 42px; }
  .ex-gallery-nav--prev { left: 10px; }
  .ex-gallery-nav--next { right: 10px; }
}
</style>
