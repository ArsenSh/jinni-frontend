<template>
  <div class="explore" :class="theme">
    <!-- ═══ PUBLIC city page (founder 2026-09-16) — Jinni's Discoveries without
         a login: same look, same cards, but no saving, no preferences, no
         search, no personal ordering. Every action that needs Jinni goes to
         sign-up. Data comes from /api/public (cache only, never Google). ═══ -->
    <!-- The landing's world (founder 2026-10-05): sky first (App.vue's chrome sync reads its
         colours), lamp + JINNI bar, then the city as the hero. The language follows the
         address (/ru/discover/…), so there is no language pill here. -->
    <JinniNightSky v-if="theme === 'night-mode'" />
    <JinniDaySky v-else />
    <div class="ex-top">
      <router-link to="/" class="ex-brand"><img src="/images/lamp.webp" alt="" class="ex-brand-lamp"/><span translate="no">JINNI</span></router-link>
      <router-link to="/auth" class="ex-signin">{{ t('landing.nav.sign_in') || 'Sign in' }}</router-link>
    </div>
    <header class="ex-head">
      <p class="ex-kicker">{{ t('explore.title') || "Jinni's Discoveries" }}</p>
      <h1 class="ex-title">{{ city ? city.name : (t('explore.title') || "Jinni's Discoveries") }}</h1>
      <p class="ex-sub" v-if="city"><b v-if="city.country">{{ city.country }}</b><i v-if="city.country && city.count" aria-hidden="true"></i><span v-if="city.count">{{ t('discover.places_count', { n: city.count }) }}</span></p>
      <p class="ex-intro">{{ city ? (t('discover.intro', { city: city.name }) || `The places Jinni knows in ${city.name}. Open to everyone, no account needed.`) : '' }}</p>
      <!-- Meet Jinni → sign-up; Preferences → the public copy of the onboarding page,
           which returns here after saving (founder 2026-09-17). -->
      <div class="ex-head-cta">
        <button class="ex-back" @click="goAuth">
          <span class="jinni-grad">{{ t('explore.back_chat') || 'Meet Jinni' }}</span>
        </button>
        <button class="ex-pref" @click="goPreferences">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 9 4-18 3 9h4"/></svg>
          <span class="jinni-grad">{{ t('explore.preferences') || 'Preferences' }}</span>
        </button>
      </div>
    </header>

    <!-- Same one-liner Jinni's Discoveries shows under its search: the page
         is shaped by the visitor's saved preferences (founder 2026-09-17). -->
    <div v-if="hasAnyRaw && filtersActive" class="ex-pref-row">
      <span class="ex-pref-lead">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9l-5.6 1.9L12 16.5l-1.9-5.6L4.5 9l5.6-1.4L12 2zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z"/></svg>
        {{ t('explore.based_on') || 'Curated to your taste' }}
      </span>
    </div>

    <p v-if="hasAnyRaw && !hasAny && !loading" class="dc-nomatch">{{ t('discover.no_match') || 'No places match these filters — clear one to see more.' }}</p>

    <nav v-if="hasAny" class="ex-nav" :class="{ 'is-stuck': navStuck }" ref="navEl">
      <div class="ex-nav-inner">
        <button v-for="c in orderedCategories" :key="c" :ref="el => chipEls[c] = el"
                class="ex-chip" :class="{ active: activeCat === c }" @click="scrollToCat(c)">
          {{ catLabel(c) }}<span class="ex-chip-count">{{ categories[c].length }}</span>
        </button>
      </div>
    </nav>

    <div v-if="loading" class="ex-section">
      <span class="ex-sk-title shimmer"></span>
      <div class="ex-rail ex-rail--sk">
        <div v-for="n in 5" :key="'sk'+n" class="ex-card ex-card--sk">
          <div class="ex-card-imgwrap shimmer"></div>
          <span class="ex-sk-line shimmer" style="width:75%"></span>
          <span class="ex-sk-line shimmer" style="width:45%"></span>
        </div>
      </div>
    </div>

    <div v-else-if="!hasAnyRaw" class="ex-empty">
      <div class="ex-empty-icon">✨</div>
      <p class="ex-empty-title">{{ t('discover.not_found') || 'Jinni has no public page for this city yet.' }}</p>
      <p class="ex-empty-sub">{{ t('discover.not_found_sub') || 'Ask Jinni in chat — the places it finds appear here as the city fills in.' }}</p>
      <button class="ex-cta" @click="goAuth">{{ t('explore.ask_chat') || 'Ask Jinni' }}</button>
    </div>

    <template v-else>
      <section v-for="c in orderedCategories" :key="c" :ref="el => catEls[c] = el" class="ex-section">
        <div class="ex-section-head"><h2 class="ex-section-title">{{ catLabel(c) }}</h2><span class="ex-section-count">{{ t('discover.places_count', { n: categories[c].length }) }}</span><span class="ex-section-rule" aria-hidden="true"></span></div>
        <div class="ex-rail-wrap">
          <button class="ex-rail-btn ex-rail-btn--prev" @click="scrollRail(c, -1)" tabindex="-1" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="ex-rail-btn ex-rail-btn--next" @click="scrollRail(c, 1)" tabindex="-1" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div class="ex-rail" :ref="el => railEls[c] = el" @scroll.passive="onRailScroll(c, $event)">
            <div v-for="(p, pi) in categories[c]" :key="c + p.placeId"
                 class="ex-card" :class="[p.tier ? 'ex-card--' + p.tier : '', { 'is-center': (railIx[c] || 0) === pi }]"
                 @click="openPlace(p)" @touchstart.passive="cardTouchStart">
              <div class="ex-card-imgwrap">
                <img v-if="p.image" class="ex-card-img" :src="imgUrl(p.image)" :alt="`${p.name} — ${catLabelOne(c)} in ${city ? city.name : ''}`"
                     :loading="pi < 4 ? 'eager' : 'lazy'" decoding="async"
                     @load="$event.target.classList.add('ex-img-in')" @error="$event.target.style.display='none'"/>
                <div v-else class="ex-card-imgless">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
                <!-- Partner tier chip — businesses only, the three tones the
                     Discoveries cards use (verified / spotlight / signature). -->
                <span v-if="p.tier" class="ex-tier" :class="'ex-tier--' + p.tier">✦ {{ tierLabel(p.tier) }}</span>
                <div class="ex-card-acts ex-card-acts--bottom" @click.stop>
                  <button class="ex-act-more" @click="openInfo(p, c)">{{ t('chat.recommendations.more') || 'More' }}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
                  <button v-if="(p.photos && p.photos.length > 1) || p.photoCount > 1" class="ex-act ex-act--photo" :title="t('explore.photos') || 'Photos'" @click="openGallery(p)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>{{ p.photoCount > 1 ? p.photoCount : (p.photos ? p.photos.length : '') }}
                  </button>
                </div>
              </div>
              <div class="ex-card-name">{{ p.name }}</div>
              <div class="ex-card-sub">
                <span v-if="p.region" class="ex-card-region">{{ p.region }}</span><span v-if="p.region && Number.isFinite(p.distanceKm)"> · </span><span v-if="Number.isFinite(p.distanceKm)" class="ex-card-dist">{{ p.distanceKm }} {{ t('explore.km') || 'km' }}</span>
              </div>
            </div>
          </div>
          <div class="ex-rail-scroll" :class="{ on: railBar[c] && railBar[c].on }">
            <span class="ex-rail-thumb" :style="railBar[c] ? { width: railBar[c].w, left: railBar[c].x } : {}"></span>
          </div>
        </div>
        <div v-if="(categories[c] || []).length > 1" class="ex-dots">
          <button v-for="di in dotCount(c)" :key="di" type="button" class="ex-dot" :class="{ 'is-on': activeDot(c) === di - 1 }"
                  :aria-label="`${di} / ${dotCount(c)}`" @click.stop="goToDot(c, di - 1)"></button>
        </div>
      </section>

      <footer class="ex-footer">
        <div class="ex-footer-divider" aria-hidden="true">
          <span class="ex-fd-line"></span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9l-5.6 1.9L12 16.5l-1.9-5.6L4.5 9l5.6-1.4L12 2zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z"/></svg>
          <span class="ex-fd-line"></span>
        </div>
        <p class="ex-footer-line">{{ t('discover.footer_line') || 'This is what Jinni already knows here — in chat it finds what fits you.' }}</p>
        <p class="ex-footer-ask">{{ t('explore.footer_ask') || "Didn't find what you were looking for?" }}</p>
        <button class="ex-footer-cta" @click="goAuth">
          <span class="jinni-grad">{{ t('explore.ask_chat') || 'Ask Jinni' }}</span>
        </button>
        <div class="ex-footer-links">
          <router-link to="/">Jinni</router-link>
          <span>·</span>
          <router-link to="/business">{{ t('landing.mode_switch.for_business') || 'For Business' }}</router-link>
          <span>·</span>
          <router-link to="/terms"><span class="lbl-full">{{ t('terms.title') || 'Terms of Service' }}</span><span class="lbl-short">{{ t('explore.terms') || 'Terms' }}</span></router-link>
          <span>·</span>
          <router-link to="/privacy"><span class="lbl-full">{{ t('privacy.title') || 'Privacy Policy' }}</span><span class="lbl-short">{{ t('explore.privacy') || 'Privacy' }}</span></router-link>
        </div>
      </footer>
    </template>

    <div v-if="gallery.open" class="ex-gallery" @click.self="closeGallery">
      <button class="ex-gallery-close" @click="closeGallery">✕</button>
      <!-- Phones (founder 2026-09-17): a native swipe strip with snap and
           position dots instead of arrows. Rendered only on narrow screens
           so desktop never loads every photo twice. -->
      <div v-if="galleryMobile" class="ex-gallery-strip" ref="galleryStrip" @scroll.passive="onGalleryScroll" @click.self="closeGallery">
        <div v-for="(img, i) in gallery.images" :key="i" class="ex-gallery-slide" @click.self="closeGallery">
          <img :src="img" :alt="gallery.name" :loading="Math.abs(i - gallery.idx) <= 1 ? 'eager' : 'lazy'" decoding="async"/>
        </div>
      </div>
      <button v-if="!galleryMobile && gallery.images.length > 1" class="ex-gallery-nav ex-gallery-nav--prev" @click="galleryStep(-1)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <img v-if="!galleryMobile" class="ex-gallery-img" :src="gallery.images[gallery.idx]" :alt="gallery.name"/>
      <button v-if="!galleryMobile && gallery.images.length > 1" class="ex-gallery-nav ex-gallery-nav--next" @click="galleryStep(1)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div v-if="galleryMobile && gallery.images.length > 1" class="ex-gallery-dots">
        <button v-for="(img, i) in gallery.images" :key="'d' + i" type="button" class="ex-gallery-dot" :class="{ 'is-on': gallery.idx === i }"
                :aria-label="`${i + 1} / ${gallery.images.length}`" @click.stop="galleryGo(i)"></button>
      </div>
      <div class="ex-gallery-bar">
        <span class="ex-gallery-name">{{ gallery.name }}</span>
        <span v-if="!galleryMobile && gallery.images.length > 1" class="ex-gallery-count">{{ gallery.idx + 1 }} / {{ gallery.images.length }}</span>
      </div>
    </div>

    <!-- More window: stored facts only (address, hours, website, phone). -->
    <div v-if="info.open" class="info-modal-overlay" @click.self="closeInfo">
      <div class="info-modal" :class="[theme === 'night-mode' ? 'night' : 'day', infoTierClass]">
        <div class="modal-header"><h3>{{ info.data?.name || info.place?.name }}</h3></div>
        <div class="modal-body">
          <div v-if="info.loading" class="loading-container"><p>{{ t('place_info.loading') || 'Loading…' }}</p></div>
          <div v-else class="place-details">
            <div class="pd-subtitle" v-if="info.cat">{{ catLabelOne(info.cat) }}</div>
            <div class="pd-rating" v-if="Number.isFinite(info.data?.rating) && (info.cat === 'restaurants' || info.cat === 'hotels')">
              <svg class="pd-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26 6.85.6-5.18 4.52 1.55 6.7L12 17.27 5.88 20.58l1.55-6.7L2.25 8.86l6.85-.6z"/></svg>
              <span class="pd-rating-num">{{ info.data.rating }}</span><span class="pd-rating-out">/5</span>
            </div>
            <div class="pd-actions">
              <button @click="openPlace(info.place)" class="pd-action pd-action--primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                <span>{{ t('place_info.get_directions') || 'Get Directions' }}</span>
              </button>
              <a v-if="info.data?.phone" :href="`tel:${info.data.phone}`" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{{ t('place_info.phone') || 'Phone' }}</span>
              </a>
              <a v-if="info.data?.website" :href="info.data.website" target="_blank" rel="noopener noreferrer" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>{{ t('place_info.website') || 'Website' }}</span>
              </a>
              <button @click="goAuth" class="pd-action">
                <img src="/images/lamp.webp" class="ex-back-lamp" alt=""/>
                <span>{{ t('explore.ask_chat') || 'Ask Jinni' }}</span>
              </button>
            </div>
            <div class="pd-divider"></div>
            <div class="pd-fact" v-if="info.data?.address || info.place?.region">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
              <div class="pd-fact-body">{{ info.data?.address || info.place?.region }}</div>
            </div>
            <div class="pd-fact pd-fact--desc" v-if="info.data?.description">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
              <div class="pd-fact-body">{{ info.data.description }}</div>
            </div>
            <div class="pd-fact" v-if="info.data?.hours?.length">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
              <div class="pd-fact-body pd-hours">
                <div v-for="(h, i) in hoursParsed" :key="i" class="pd-hours-row">
                  <span class="pd-hours-day">{{ h.day }}</span><span v-if="h.time" class="pd-hours-time">{{ h.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isNightTime } from '../utils/timeUtils';
import { startEmberBreath } from '@/utils/emberBreath';
import JinniDaySky from '@/components/ui/JinniDaySky.vue';
import JinniNightSky from '@/components/ui/JinniNightSky.vue';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
const CAT_LABELS = {
  restaurants: 'Restaurants', hotels: 'Hotels', historical: 'Historical sites',
  events: 'Events', photo_spots: 'Photo spots', hidden_gems: 'Hidden gems', shopping: 'Shops', activities: 'Activities',
};

export default {
  name: 'DiscoverCity',
  components: { JinniDaySky, JinniNightSky },
  data() {
    return {
      loading: true, rawCategories: {}, city: null, serverOrder: null, rates: null,
      prefs: { interests: [], travelStyle: '', budget: { min: null, max: null, currency: 'USD' } },
      activeCat: null, navStuck: false, catEls: {}, railEls: {}, chipEls: {}, railIx: {}, railBar: {}, _railTimers: {},
      theme: 'night-mode',
      gallery: { open: false, images: [], idx: 0, name: '' },
      galleryMobile: false,
      info: { open: false, loading: false, data: null, place: null, cat: null },
    };
  },
  computed: {
    // '/ru' on Russian URLs, '' on English ones — the only two languages
    // served as URLs (founder 2026-09-18).
    langPrefix() { return this.$route.params.lang === 'ru' ? '/ru' : ''; },
    pageTitle() {
      const base = this.t('explore.title') || "Jinni's Discoveries";
      return this.city ? `${base} — ${this.city.name}` : base;
    },
    interestOptions() { const m = this.$tm ? this.$tm('onboarding.interests') : null; return (m && typeof m === 'object' && Object.keys(m).length) ? m : { family: 'Family', romantic: 'Romantic', nature: 'Nature', adventure: 'Adventure', cultural: 'Cultural', history: 'History', art: 'Art', food_drink: 'Cuisine', nightlife: 'Nightlife', relaxation: 'Relaxation' }; },
    styleOptions() { const m = this.$tm ? this.$tm('onboarding.styles') : null; return (m && typeof m === 'object' && Object.keys(m).length) ? m : { luxury: 'Luxury', budget: 'Budget' }; },
    budgetSet() { const b = this.prefs.budget; return this.prefs.travelStyle === 'budget' && Number.isFinite(b.min) && Number.isFinite(b.max) && b.min > 0 && b.max > 0; },
    budgetInvalid() { const b = this.prefs.budget; return Number.isFinite(b.min) && Number.isFinite(b.max) && b.min > b.max; },
    filtersActive() { return this.prefs.interests.length > 0 || !!this.prefs.travelStyle || this.budgetSet; },
    // Budget bounds in USD — the server's live rates (USD-based) when the
    // page carries them, else the bounds are used only when already in USD.
    budgetUsd() {
      if (!this.budgetSet || this.budgetInvalid) return null;
      const b = this.prefs.budget, cur = String(b.currency || 'USD').toUpperCase();
      if (cur === 'USD') return { min: b.min, max: b.max };
      const rate = this.rates && Number(this.rates[cur]);
      return rate > 0 ? { min: b.min / rate, max: b.max / rate } : null;
    },
    // Same rules the Discoveries page applies server-side to a signed-in
    // user's preferences: an interest tag must match when the place carries
    // tags (untagged places stay); a style drops the opposite price tier;
    // a budget of ≤ $15 drops upscale, ≥ $60 drops budget places.
    categories() {
      const want = new Set(this.prefs.interests.map(i => i === 'food_drink' ? 'food&drink' : i));
      const style = this.prefs.travelStyle, nb = this.budgetUsd;
      const keep = (p) => {
        if (want.size && (p.interests || []).length && !(p.interests || []).some(t => want.has(t))) return false;
        const pt = p.priceTier;
        if (p.priced && pt) {
          if (style === 'luxury' && pt <= 2) return false;
          if (style === 'budget' && pt >= 3) return false;
          if (nb && nb.max <= 15 && pt >= 3) return false;
          if (nb && nb.min >= 60 && pt === 1) return false;
        }
        return true;
      };
      // Interest matches lead each rail, as on the Discoveries page; the
      // server's verified-then-rating order holds within each group.
      const matches = (p) => want.size ? (p.interests || []).filter(t => want.has(t)).length : 0;
      const out = {};
      for (const c of Object.keys(this.rawCategories)) {
        const list = (this.rawCategories[c] || []).filter(keep);
        if (want.size) list.sort((a, b) => matches(b) - matches(a));
        if (list.length) out[c] = list;
      }
      return out;
    },
    orderedCategories() {
      const order = (Array.isArray(this.serverOrder) && this.serverOrder.length) ? this.serverOrder
        : ['restaurants', 'historical', 'hidden_gems', 'activities', 'photo_spots', 'shopping', 'hotels'];
      return order.filter(c => this.categories[c] && this.categories[c].length);
    },
    hasAny() { return this.orderedCategories.length > 0; },
    hasAnyRaw() { return Object.values(this.rawCategories).some(l => l && l.length); },
    infoTierClass() {
      const tier = this.info.place?.tier;
      if (tier === 'signature') return 'info-modal--signature';
      if (tier === 'spotlight') return 'info-modal--spotlight';
      if (tier === 'verified') return 'info-modal--verified';
      return '';
    },
    hoursParsed() {
      const hrs = this.info.data?.hours;
      if (!Array.isArray(hrs)) return [];
      return hrs.map(line => {
        const s = String(line), idx = s.indexOf(': ');
        if (idx > 0) return { day: this.localDay(s.slice(0, idx).trim()), time: this.localTime(s.slice(idx + 2).trim()) };
        return { day: this.localDay(s.trim()), time: '' };
      });
    },
  },
  created() {
    this.theme = this.resolveTheme();
    this.loadPrefs();
    // Founder 2026-09-17: a first-time visitor arriving from the landing's
    // city cards goes through the short preferences page first (interests +
    // style), then lands here. Only on that path — a search-engine visitor
    // or a shared link opens the city directly, so crawlers index the city,
    // not the form. "First time" = nothing saved yet; the preferences page
    // saves even an empty choice, so this happens once per browser.
    this.applyUrlLang();
    if (this.$route.query.from === 'landing') {
      let seen = false;
      try { seen = !!localStorage.getItem('jinni_public_prefs'); } catch (e) { seen = true; }
      if (!seen) {
        this.$router.replace({ path: `${this.langPrefix}/discover/preferences`, query: { returnTo: `${this.langPrefix}/discover/${this.$route.params.slug}` } });
        return;
      }
      this.$router.replace({ path: `${this.langPrefix}/discover/${this.$route.params.slug}` });
    }
  },
  watch: { '$route.params.slug'() { this.load(); } },
  // Meet Jinni / Ask Jinni breathe like the landing's Make a Wish: each button gets its
  // moving light once it is on the page (the footer one arrives after the data).
  updated() { this.emberSync(); },
  mounted() {
    this.load();
    this._onKey = (e) => {
      if (e.key === 'Escape') { this.closeGallery(); this.closeInfo(); }
      else if (this.gallery.open && e.key === 'ArrowRight') this.galleryStep(1);
      else if (this.gallery.open && e.key === 'ArrowLeft') this.galleryStep(-1);
    };
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('scroll', this.onWinScroll, { passive: true });
    this.computeRailN();
    window.addEventListener('resize', this.computeRailN, { passive: true });
  },
  beforeUnmount() {
    (this._embers || []).forEach(stop => stop());
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('scroll', this.onWinScroll);
    window.removeEventListener('resize', this.computeRailN);
    if (this._spy) this._spy.disconnect();
    this.lockScroll(false);
    this.clearSeo();
  },
  methods: {
    emberSync() {
      if (!this.$el || !this.$el.querySelectorAll) return;
      this._embers = this._embers || [];
      this.$el.querySelectorAll('.ex-back, .ex-footer-cta').forEach((el) => { if (!el._ember) { el._ember = true; this._embers.push(startEmberBreath(el)); } });
    },
    t(key, params) {
      if (!this.$t) return null;
      const s = this.$t(key, params);
      return (s && s !== key) ? s : null;
    },
    resolveTheme() {
      try {
        const s = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
        if (s.theme === 'light') return 'day-mode';
        if (s.theme === 'dark') return 'night-mode';
      } catch (e) { /* auto */ }
      return isNightTime() ? 'night-mode' : 'day-mode';
    },
    imgUrl(u) { return u && u.startsWith('/api/') ? `${API_BASE}${u}` : u; },
    uiLocale() { return localStorage.getItem('jinni_language') || localStorage.getItem('lang') || 'en'; },
    localDay(name) {
      const IX = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      const ix = IX[String(name).toLowerCase().replace(/[.,]/g, '').trim()];
      if (ix == null) return name;
      const loc = this.uiLocale();
      if (loc === 'en') return name;
      try {
        const d = new Date(Date.UTC(2024, 0, 7 + ix));
        const out = new Intl.DateTimeFormat(loc, { weekday: 'long', timeZone: 'UTC' }).format(d);
        return out.charAt(0).toUpperCase() + out.slice(1);
      } catch (e) { return name; }
    },
    localTime(time) {
      if (this.uiLocale() === 'en') return time;
      return String(time).replace(/(\d{1,2}):(\d{2})\s*([AP])M/gi, (m, h, mm, ap) => {
        let hr = parseInt(h, 10) % 12;
        if (ap.toUpperCase() === 'P') hr += 12;
        return String(hr).padStart(2, '0') + ':' + mm;
      });
    },
    catLabelOne(c) { const key = 'explore.cat_one.' + c; const s = this.$t ? this.$t(key) : null; return (s && s !== key) ? s : this.catLabel(c); },
    catLabel(c) { const key = 'explore.cat.' + c; const s = this.$t ? this.$t(key) : null; return (s && s !== key) ? s : (CAT_LABELS[c] || c); },
    async load() {
      this.loading = true;
      this.rawCategories = {}; this.city = null;
      try {
        const slug = String(this.$route.params.slug || '').toLowerCase();
        const res = await fetch(`${API_BASE}/api/public/discover/${encodeURIComponent(slug)}`);
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          this.rawCategories = data.categories || {};
          this.city = data.city || null;
          this.serverOrder = Array.isArray(data.order) ? data.order : null;
          this.rates = (data.rates && typeof data.rates === 'object') ? data.rates : null;
        }
        this.activeCat = this.orderedCategories[0] || null;
      } catch (e) {
        console.error('Discover load failed:', e);
      } finally {
        this.loading = false;
        this.applySeo();
        this.$nextTick(() => this.setupScrollSpy());
      }
    },
    // A Russian URL switches the interface to Russian (persisted like the
    // language picker does, without the picker's full reload).
    applyUrlLang() {
      const lang = this.$route.params.lang === 'ru' ? 'ru' : null;
      if (!lang) return;
      try {
        if (this.$i18n && this.$i18n.locale !== lang) this.$i18n.locale = lang;
        if (this.$store && this.$store.state.i18n?.locale !== lang) this.$store.commit('i18n/SET_LANGUAGE', lang);
        document.documentElement.lang = lang;
      } catch (e) { /* the page still works in the current language */ }
    },
    // ── Search-engine facing bits: title, description, canonical, hreflang, ItemList ──
    applySeo() {
      const name = this.city?.name;
      const count = Object.values(this.rawCategories).reduce((n, a) => n + a.length, 0);
      document.title = name
        ? (this.t('discover.seo_title', { city: name, count }) || `${name}: ${count} places to eat, see and discover — Jinni's Discoveries`)
        : (this.t('explore.title') || "Jinni's Discoveries");
      const desc = name
        ? (this.t('discover.seo_desc', { city: name, count }) || `${count} restaurants, sights, hidden gems and activities in ${name} that Jinni knows and trusts. Free to browse — ask Jinni for what fits you.`)
        : 'Places Jinni has discovered, open to everyone.';
      this._setMeta('description', desc);
      const slug = this.$route.params.slug, origin = window.location.origin;
      this._setLink('canonical', `${origin}${this.langPrefix}/discover/${slug}`);
      // The two language versions point at each other; English is the default.
      this._setAlt('en', `${origin}/discover/${slug}`);
      this._setAlt('ru', `${origin}/ru/discover/${slug}`);
      this._setAlt('x-default', `${origin}/discover/${slug}`);
      if (name) this._setMeta('robots', 'index,follow'); else this._setMeta('robots', 'noindex,follow');
      const items = [];
      for (const c of this.orderedCategories) for (const p of this.categories[c]) items.push(p);
      const ld = name ? {
        '@context': 'https://schema.org', '@type': 'ItemList', name: document.title, numberOfItems: items.length,
        itemListElement: items.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name,
          ...(p.image ? { image: `${API_BASE || window.location.origin}${p.image}` } : {}) })),
      } : null;
      let el = document.getElementById('discover-ld');
      if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'discover-ld'; document.head.appendChild(el); }
      el.textContent = ld ? JSON.stringify(ld) : '';
    },
    _setAlt(lang, href) {
      let l = document.querySelector(`link[rel="alternate"][hreflang="${lang}"][data-discover]`);
      if (!l) { l = document.createElement('link'); l.rel = 'alternate'; l.hreflang = lang; l.setAttribute('data-discover', '1'); document.head.appendChild(l); }
      l.href = href;
    },
    clearSeo() {
      document.getElementById('discover-ld')?.remove();
      document.querySelectorAll('link[rel="alternate"][data-discover]').forEach(el => el.remove());
      document.querySelector('link[rel="canonical"][data-discover]')?.remove();
      document.querySelector('meta[name="robots"][data-discover]')?.remove();
      document.querySelector('meta[name="description"][data-discover]')?.remove();
    },
    _setMeta(name, content) {
      let m = document.querySelector(`meta[name="${name}"][data-discover]`);
      if (!m) { m = document.createElement('meta'); m.name = name; m.setAttribute('data-discover', '1'); document.head.appendChild(m); }
      m.content = content;
    },
    _setLink(rel, href) {
      let l = document.querySelector(`link[rel="${rel}"][data-discover]`);
      if (!l) { l = document.createElement('link'); l.rel = rel; l.setAttribute('data-discover', '1'); document.head.appendChild(l); }
      l.href = href;
    },
    computeRailN() {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const rail = this.$el && this.$el.querySelector && this.$el.querySelector('.ex-rail');
      if (!rail) return;
      const g = 14, inner = rail.clientWidth - 28;
      this.$el.style.setProperty('--ex-n', Math.max(1, Math.floor((inner + g) / (280 + g))));
    },
    onWinScroll() { const el = this.$refs.navEl; this.navStuck = !!el && el.getBoundingClientRect().top <= 0.5 && window.scrollY > 8; },
    setupScrollSpy() {
      if (this._spy) this._spy.disconnect();
      if (typeof IntersectionObserver === 'undefined') return;
      this._spy = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const c = Object.keys(this.catEls).find(k => this.catEls[k] === en.target);
          if (c && c !== this.activeCat) { this.activeCat = c; this.centerActiveChip(c); }
        }
      }, { rootMargin: '-15% 0px -70% 0px' });
      for (const c of this.orderedCategories) if (this.catEls[c]) this._spy.observe(this.catEls[c]);
    },
    centerActiveChip(c) {
      const nav = this.$refs.navEl, chip = this.chipEls[c];
      if (!nav || !chip || nav.scrollWidth <= nav.clientWidth) return;
      nav.scrollTo({ left: chip.offsetLeft - (nav.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
    },
    scrollToCat(c) { this.activeCat = c; this.catEls[c]?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }); this.centerActiveChip(c); },
    onRailScroll(c, e) {
      const el = e.target;
      if (!el || el.scrollWidth <= el.clientWidth) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0, bestD = Infinity;
      for (let i = 0; i < el.children.length; i++) {
        const ch = el.children[i], d = Math.abs(ch.offsetLeft + ch.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (this.railIx[c] !== best) this.railIx = { ...this.railIx, [c]: best };
      const w = Math.max((el.clientWidth / el.scrollWidth) * 100, 8), x = (el.scrollLeft / el.scrollWidth) * 100;
      this.railBar = { ...this.railBar, [c]: { w: w + '%', x: x + '%', on: true } };
      clearTimeout(this._railTimers[c]);
      this._railTimers[c] = setTimeout(() => { if (this.railBar[c]) this.railBar = { ...this.railBar, [c]: { ...this.railBar[c], on: false } }; }, 1000);
    },
    cardTouchStart(e) {
      if (this._activeCardEl && this._activeCardEl !== e.currentTarget) this._activeCardEl.classList.remove('touch-active');
      this._activeCardEl = e.currentTarget;
      e.currentTarget.classList.add('touch-active');
    },
    dotCount(c) { const n = (this.categories[c] || []).length; return n <= 14 ? n : 12; },
    activeDot(c) { const n = (this.categories[c] || []).length, d = this.dotCount(c), ix = this.railIx[c] || 0; return d === n ? ix : Math.round(ix / Math.max(1, n - 1) * (d - 1)); },
    goToDot(c, di) { const n = (this.categories[c] || []).length, d = this.dotCount(c); this.goToRailCard(c, d === n ? di : Math.round(di / Math.max(1, d - 1) * (n - 1))); },
    goToRailCard(c, i) {
      const el = this.railEls[c], ch = el && el.children[i];
      if (!el || !ch) return;
      el.scrollTo({ left: Math.max(0, ch.offsetLeft - (el.clientWidth - ch.offsetWidth) / 2), behavior: 'smooth' });
    },
    scrollRail(c, dir) {
      const rail = this.railEls[c];
      if (!rail) return;
      const card = rail.querySelector('.ex-card'), g = 14, inner = rail.clientWidth - 28;
      const w = card ? card.getBoundingClientRect().width : 300;
      rail.scrollBy({ left: dir * Math.max(1, Math.floor((inner + g) / (w + g))) * (w + g), behavior: 'smooth' });
    },
    // Stored photos only: /api/ai/place-image/:placeId/:i is public and
    // serves what Jinni already keeps. photoCount comes from the list.
    tierLabel(tier) {
      return this.t('map.tier_' + tier)
        || ({ signature: "Jinni's Signature", spotlight: "Jinni's Spotlight", verified: 'Jinni Verified' })[tier] || tier;
    },
    openGallery(p) {
      const n = Math.max(1, p.photoCount || 1);
      const images = (Array.isArray(p.photos) && p.photos.length)
        ? p.photos.map(u => this.imgUrl(u))                                    // owned rows: their own photos
        : Array.from({ length: n }, (_, i) => this.imgUrl(`/api/ai/place-image/${p.placeId}/${i}`));
      this.gallery = { open: true, images, idx: 0, name: p.name };
      this.lockScroll(true);
      try { this.galleryMobile = window.matchMedia('(max-width: 768px)').matches; } catch (e) { this.galleryMobile = false; }
    },
    // Phone comfort (founder 2026-09-17): swipe to step, and the page behind
    // the overlay must not scroll while it is open.
    onGalleryScroll(e) {
      const el = e.target;
      if (!el || !el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      if (i !== this.gallery.idx && i >= 0 && i < this.gallery.images.length) this.gallery.idx = i;
    },
    galleryGo(i) {
      this.gallery.idx = i;
      const el = this.$refs.galleryStrip;
      if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    },
    lockScroll(on) { try { document.documentElement.style.overflow = on ? 'hidden' : ''; } catch (e) { /* ignore */ } },
    galleryStep(dir) {
      const n = this.gallery.images.length;
      if (!n) return;
      const next = (this.gallery.idx + dir + n) % n;
      if (this.galleryMobile) this.galleryGo(next); else this.gallery.idx = next;
    },
    closeGallery() { this.gallery = { open: false, images: [], idx: 0, name: '' }; this.lockScroll(false); },
    async openInfo(p, cat) {
      this.info = { open: true, loading: true, data: null, place: p, cat: cat || null };
      try {
        const res = await fetch(`${API_BASE}/api/public/discover/place/${encodeURIComponent(p.placeId)}`);
        const data = await res.json().catch(() => ({}));
        this.info = { ...this.info, loading: false, data: data?.data || null };
      } catch (e) { this.info = { ...this.info, loading: false, data: null }; }
    },
    closeInfo() { this.info = { open: false, loading: false, data: null, place: null, cat: null }; },
    openPlace(p) {
      const q = encodeURIComponent(`${p.name} ${[this.city?.name, this.city?.country].filter(Boolean).join(' ')}`);
      const a = document.createElement('a');
      a.href = `https://www.google.com/maps/search/?api=1&query=${q}`; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a); a.click(); a.remove();
    },
    // Choices saved by /discover/preferences in this browser only.
    loadPrefs() {
      try {
        const p = JSON.parse(localStorage.getItem('jinni_public_prefs') || 'null');
        if (p && typeof p === 'object') {
          this.prefs = {
            interests: Array.isArray(p.interests) ? p.interests.filter(x => typeof x === 'string') : [],
            travelStyle: p.travelStyle === 'luxury' || p.travelStyle === 'budget' ? p.travelStyle : '',
            budget: { min: Number.isFinite(p.budget?.min) ? p.budget.min : null, max: Number.isFinite(p.budget?.max) ? p.budget.max : null, currency: typeof p.budget?.currency === 'string' ? p.budget.currency : 'USD' },
          };
        }
      } catch (e) { /* storage unavailable → defaults */ }
    },

    goAuth() { this.$router.push('/auth'); },
    goPreferences() { this.$router.push({ path: `${this.langPrefix}/discover/preferences`, query: { returnTo: `${this.langPrefix}/discover/${this.$route.params.slug}` } }); },
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
  --ex-bg-grad: linear-gradient(180deg, #f9f5eb 0%, #f5edda 45%, #f3ead8 78%, #f9f5eb 100%);
  /* Chat's glacier active recipe (settings theme-btn.active, day) */
  --ex-chip-active-bg: rgba(255,255,255,0.92); --ex-chip-active-fg: #8a5a1e;
  --ex-chip-active-shadow: 0 1px 4px rgba(120,80,30,0.16);
  --ex-search-bg: rgba(255,255,255,0.6);
}
.explore.night-mode {
  --ex-bg: #0a0118; --ex-heading: #c084fc; --ex-text: #c8cee2; --ex-muted: #94a3b8;
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
  /* Night gradient returns to the base purple at the bottom (founder
     2026-09-08): the overscroll canvas shows the LAST stop, and the old
     navy end read as a foreign color when rubber-banding past the footer. */
  --ex-bg-grad: linear-gradient(180deg, #0a0118 0%, #1a0b2e 45%, #141031 78%, #0a0118 100%);
  /* Chat's glacier active recipe (settings theme-btn.active, night) */
  --ex-chip-active-bg: rgba(255,255,255,0.16); --ex-chip-active-fg: #d8b4fe;
  --ex-chip-active-shadow: 0 1px 4px rgba(0,0,0,0.28);
  --ex-search-bg: rgba(255,255,255,0.08);
}

.explore { min-height: 100vh; background: var(--ex-bg-grad); color: var(--ex-text); padding: 0 0 40px; }

/* Search — TripAdvisor-style pill */
.ex-search { display: flex; align-items: center; gap: 10px; width: min(640px, calc(100% - 36px)); margin: 14px auto 0;
  padding: 6px 6px 6px 18px; border-radius: 999px; background: var(--ex-search-bg);
  box-shadow: var(--ex-ring), 0 0 5px #0000001a; backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); }
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
  padding: 26px 18px 4px; max-width: 1395px; margin: 0 auto; }
/* Same recipe as .ex-pref (founder 2026-09-08: one button family, no
   special treatment for Meet Jinni). */
.ex-back { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.88rem; font-weight: 600; color: var(--ex-text); background: var(--ex-chip); box-shadow: var(--ex-ring), 0 0 5px #0000001a;
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s; }
.ex-back:active { transform: scale(0.98); }
.ex-head-cta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
.ex-pref { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.88rem; font-weight: 600; color: var(--ex-text); background: var(--ex-chip); box-shadow: var(--ex-ring), 0 0 5px #0000001a;
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s; }
.ex-pref:hover { background: var(--ex-glass-2); }
/* App icon above the title — same asset the chat header uses. */
.ex-app-icon { width: 92px; height: 92px; object-fit: contain; margin-bottom: -6px;
  filter: drop-shadow(0 4px 14px rgba(212,175,55,0.28)); }
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
/* Full-bleed sticky bar: the frosted background now spans the whole viewport
   instead of floating as a 1200px translucent band over the gradient (the
   "different background" strip), and a hairline grounds it while stuck. */
/* Materialize-on-stick (founder 2026-09-08): transparent at the top of the
   page — chips float as content; frosted glass + hairline appear only once
   real content scrolls underneath. */
.ex-nav { position: sticky; top: 0; z-index: 10; overflow-x: auto; padding: 10px 0; margin: 4px 0 0;
  scrollbar-width: none; background: transparent; transition: background .25s ease, box-shadow .25s ease; }
/* Clearer glass when stuck (founder 2026-09-08): more transparent tint,
   deeper blur doing the separating work — no hairline, no border. */
.ex-nav.is-stuck { background: color-mix(in srgb, var(--ex-bg) 42%, transparent);
  backdrop-filter: blur(20px) saturate(170%); -webkit-backdrop-filter: blur(20px) saturate(170%); }
.explore.night-mode .ex-nav.is-stuck { background: color-mix(in srgb, var(--ex-bg) 34%, transparent); }
.ex-nav-inner { display: flex; gap: 8px; width: max-content; margin-inline: auto; padding-inline: 18px; }
.ex-nav::-webkit-scrollbar { display: none; }
.ex-chip { flex: none; display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.85rem; font-weight: 600; color: var(--ex-chip-text); background: var(--ex-chip); box-shadow: var(--ex-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s, color .18s; white-space: nowrap; }
.ex-chip:hover { background: var(--ex-glass-2); }
.ex-chip.active { color: var(--ex-chip-active-fg); background: var(--ex-chip-active-bg); box-shadow: var(--ex-chip-active-shadow); }
.ex-chip-count { font-size: 0.72rem; font-weight: 700; opacity: 0.75; font-variant-numeric: tabular-nums; }
.ex-chip.active .ex-chip-count { opacity: 0.9; }

/* Sections + rails */
.ex-section { max-width: 1395px; margin: 0 auto; padding: 22px 0 2px; scroll-margin-top: 64px; }
.ex-section-head { display: flex; align-items: baseline; gap: 10px; margin: 0 64px 20px; }
.ex-section-title { margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.01em; color: var(--ex-heading); }
.ex-section-count { font-size: 0.82rem; color: var(--ex-muted); font-variant-numeric: tabular-nums; }

/* Horizontal rail — snap scrolling, hidden scrollbar. The mask fades cards
   out at both edges ("shadow borders") as they scroll under it, and the
   wrap's side gutters keep the paging arrows clear of the images. */
.ex-rail { display: flex; gap: 14px; overflow-x: auto; padding: 2px 14px 16px; /* side pad == gap: card N+1 starts exactly at the edge, no sliver */
  scroll-snap-type: x proximity; scroll-padding-left: 14px; scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
.ex-rail::-webkit-scrollbar { display: none; }

/* TripAdvisor-style borderless tile — rounded image block, plain text below
   on the page background. No motion on hover: image brightens slightly. */
.ex-card { position: relative; flex: none; width: 300px; cursor: pointer; scroll-snap-align: start; }
/* Integer-fit rail (founder 2026-09-09): JS sets --ex-n = floor((W+g)/(280+g))
   from the rail's real inner width, and each card is (W-(N-1)g)/N so a WHOLE
   number of cards fills the row at any window size — 4 on a 13" MBP, 3 when
   narrower. Arrows page by exactly N cards, so pages land flush. */
@media (hover: hover) and (pointer: fine) {
  .ex-card { width: calc((100% - (var(--ex-n, 4) - 1) * 14px) / var(--ex-n, 4)); }
}
.ex-card-imgwrap { position: relative; aspect-ratio: 1 / 1; border-radius: 16px; overflow: hidden; margin-bottom: 9px;
  background: var(--ex-glass-2); box-shadow: var(--ex-ring); }
.ex-card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
  opacity: 0; transition: opacity .3s ease, filter .25s ease; }
.ex-card-img.ex-img-in { opacity: 1; }
.ex-card:hover .ex-card-img { filter: brightness(1.06) saturate(1.04); }
.ex-card-imgless { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--ex-muted); }

/* Card actions — the chat's glacier glass (text-action-btn.info-btn recipe):
   translucent white glass with a hairline inset ring, on the image. */
.ex-card-acts { position: absolute; top: 10px; right: 10px; display: flex; gap: 6px; }
.ex-act { width: 34px; height: 34px; border-radius: 999px; border: none; cursor: pointer; display: grid; place-items: center;
  /* Dark glass (founder 2026-09-07: buttons were invisible on bright photos):
     a scrim-toned fill reads on ANY image, white glyph, crisp hairline. */
  color: #fff; background: rgba(15,18,30,0.62); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7), 0 0 8px rgba(0,0,0,0.28);
  backdrop-filter: blur(8px) saturate(160%); -webkit-backdrop-filter: blur(8px) saturate(160%); transition: background .2s, box-shadow .2s; }
.ex-act:hover { background: rgba(15,18,30,0.8); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95), 0 0 8px rgba(0,0,0,0.28); }
.ex-card-acts--bottom { top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; }
.ex-card-acts--bottom > * { pointer-events: auto; }
/* "More" — JinniChat's text-action-btn/info-btn recipe, centred on the image
   (a text-shadow stands in for the chat's dark hover overlay) */
.ex-act-more { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  padding: 9px 16px; border: none; border-radius: 25px; cursor: pointer; min-width: 80px; text-align: center;
  font-family: inherit; font-size: 0.8rem; line-height: 1.1; font-weight: 500; color: #fff;
  background: rgba(255,255,255,0.3); box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.6);
  text-shadow: 0 1px 2px rgba(0,0,0,0.45);
  backdrop-filter: blur(2px) saturate(160%); -webkit-backdrop-filter: blur(2px) saturate(160%); transition: background .2s, box-shadow .2s; }
.ex-act-more:hover { background: rgba(255,255,255,0.42); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9); }
/* photo roundel — same glass family, 40px, bottom-right */
.ex-act--photo { position: absolute; right: 10px; bottom: 10px; width: 40px; height: 40px;
  background: rgba(255,255,255,0.3); box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.6);
  backdrop-filter: blur(2px) saturate(160%); -webkit-backdrop-filter: blur(2px) saturate(160%); }
.ex-act--photo:hover { background: rgba(255,255,255,0.42); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9); }
.ex-act--photo svg { filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.4)); }
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
.ex-card--verified  .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(34,197,94,0.55), 0 0 16px rgba(34,197,94,0.16); }
.ex-card--spotlight .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(59,159,221,0.6), 0 0 16px rgba(59,159,221,0.18); }
.ex-card--signature .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(212,175,55,0.65), 0 0 18px rgba(212,175,55,0.22); }

/* Rail paging arrows — TripAdvisor-style solid circles, always visible on
   desktop pointer devices, sitting in the side gutters OFF the images. */
.ex-rail-wrap { position: relative; }
@media (hover: hover) and (pointer: fine) { .ex-rail-wrap { padding: 0 62px; } }
/* Same glass recipe as the chat cards' "More" button. */
/* Rail squircles (founder's pick C, 2026-09-07 fitting): 42px rounded
   squares in the app's 14px corner vocabulary — strongest glass of the
   set, accent chevron, glow-only hover. */
.ex-rail-btn { position: absolute; top: 131px; z-index: 5; width: 42px; height: 42px; border-radius: 14px; cursor: pointer;
  display: none; place-items: center; border: none; transition: background .18s, box-shadow .18s;
  backdrop-filter: blur(14px) saturate(180%); -webkit-backdrop-filter: blur(14px) saturate(180%); }
/* Same family as the page's chip buttons (founder 2026-09-08: the navy/
   violet variant didn't sit right) — neutral glass, page-text chevron. */
.ex-rail-btn { background: var(--ex-chip); color: var(--ex-text); box-shadow: var(--ex-ring), 0 0 5px #0000001a; }
.ex-rail-btn:hover { background: var(--ex-glass-2); }
.ex-rail-btn--prev { left: 8px; }
.ex-rail-btn--next { right: 8px; }
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
.ex-card-dates { font-size: 0.78rem; color: var(--ex-accent, #b8860b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ex-card-dist { font-variant-numeric: tabular-nums; }

/* Empty / not explored */
.ex-empty { max-width: 520px; margin: 60px auto; padding: 0 24px; text-align: center; }
.ex-empty-icon { font-size: 2.75rem; margin-bottom: 14px; }
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

/* ── Info modal — ported VERBATIM from JinniChat's info-modal (glacier glass,
   gold gradient title, pd-* fact layout, partner-tier tints) so the two
   surfaces read identically. Explore adds nothing of its own here; if the
   chat modal design changes, re-port rather than diverge. ── */
.info-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.2);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000}
.info-modal{border-radius:12px;max-width:500px;width:90%;overflow:hidden;position:relative;display:flex;flex-direction:column}
.info-modal.night{background:rgba(30,20,56,0.85);color:#e2e8f0;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:0 0 5px rgba(0,0,0,0.5),inset 0 0 0 0.5px rgba(255,255,255,0.08)}
.info-modal.day{background:rgba(255,255,255,0.85);color:#2d3748;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:none;box-shadow:0 0 30px rgba(0,0,0,0.18),inset 0 0 0 1px rgba(255,255,255,0.6)}
.info-modal .modal-header{position:relative;z-index:4;background:transparent;border:none;padding:14px 20px 8px 20px;flex-shrink:0;display:flex;justify-content:space-between;align-items:center}
.info-modal .modal-header h3{margin:0;font-size:1.25rem;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.25;background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal .modal-body{flex:1 1 auto;min-height:0;padding:2px 20px 20px 20px;max-height:60vh;overflow-y:auto;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;-webkit-mask-image:linear-gradient(to bottom,#000 calc(100% - 14px),transparent 100%);mask-image:linear-gradient(to bottom,#000 calc(100% - 14px),transparent 100%)}
.info-modal.night .modal-body::-webkit-scrollbar{width:4px}
.info-modal.night .modal-body::-webkit-scrollbar-track{background:transparent}
.info-modal.night .modal-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(192,132,252,0.1)}
.info-modal.night .modal-body::-webkit-scrollbar-thumb:hover{background:rgba(192,132,252,0.3)}
.info-modal.day .modal-body::-webkit-scrollbar{width:8px}
.info-modal.day .modal-body::-webkit-scrollbar-track{background:transparent}
.info-modal.day .modal-body::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(160,82,45,0.3)}
.info-modal.day .modal-body::-webkit-scrollbar-thumb:hover{background:rgba(160,82,45,0.5)}
.loading-container{text-align:center;padding:20px}
.info-modal.night .loading-container p{color:#aaa}
.info-modal.day .loading-container p{color:#2d3748}
.place-details{display:flex;flex-direction:column;gap:12px}
.info-row{display:flex;flex-direction:column}
.label{font-weight:600;color:#4a5568;font-size:0.875rem}
.value{color:#2d3748;line-height:1.5}
.info-modal.night .label,.info-modal.night .value{color:#e2e8f0}
.info-modal.day .label{background:linear-gradient(0deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal.day .value{color:#3c2a1e}
.info-modal .info-row--event .value.event-schedule-value{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}
.event-schedule-primary{font-weight:600;font-size:0.95rem}
.review-count{color:#718096;font-size:0.875rem}
.pd-subtitle{font-size:0.82rem;opacity:0.6;margin-top:-2px;text-transform:capitalize}
.pd-rating{display:flex;align-items:center;gap:6px;font-size:1rem;font-weight:600}
.pd-star{width:16px;height:16px;flex-shrink:0;color:#f5b301}
.pd-rating-out{opacity:0.5;font-weight:400;margin-left:-3px}
.pd-rating .review-count{font-weight:400;opacity:0.6;margin-left:2px}
.pd-actions{display:flex;flex-wrap:wrap;gap:8px}
.pd-action{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:22px;font-size:0.85rem;font-weight:600;line-height:1;cursor:pointer;border:none;text-decoration:none;white-space:nowrap;font-family:inherit;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);transition:all 0.2s ease}
.pd-action svg{width:16px;height:16px;flex-shrink:0}
.pd-action:active{transform:scale(0.96)}
.info-modal.night .pd-action{background:rgba(255,255,255,0.06);color:#d5dce4;box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.1)}
.info-modal.night .pd-action:hover{background:rgba(255,255,255,0.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.info-modal.night .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7));color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12)}
.info-modal.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.2)}
.info-modal.day .pd-action{background:rgba(255,255,255,0.55);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}
.info-modal.day .pd-action:hover{background:rgba(255,255,255,0.8);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.95)}
.info-modal.day .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8));color:#fff;box-shadow:inset 0 0 0 0.6px rgba(255,255,255,0.4)}
.info-modal.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.9),rgba(255,140,0,0.9));box-shadow:inset 0 0 0 0.7px rgba(255,255,255,0.45)}
.pd-divider{height:1px;width:100%;margin:2px 0}
.info-modal.night .pd-divider{background:rgba(255,255,255,0.08)}
.info-modal.day .pd-divider{background:rgba(150,100,40,0.14)}
.pd-fact{display:flex;gap:12px;align-items:flex-start}
.pd-fact-ic{flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center}
.pd-fact-ic svg{width:17px;height:17px}
.pd-fact-body{flex:1;min-width:0;font-size:0.92rem;line-height:1.45}
.pd-fact-body a{text-decoration:none}
.pd-fact--desc .pd-fact-body{opacity:0.82;font-size:0.88rem}
.info-modal.night .pd-fact-ic{color:#c9b8ff}
.info-modal.night .pd-fact-body a{background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal.day .pd-fact-ic{color:#b87a2a}
.info-modal.day .pd-fact-body a{color:#b8860b}
.pd-hours{display:flex;flex-direction:column;width:100%}
.pd-hours-row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:6px 0}
.pd-hours-row:first-child{padding-top:0}
.pd-hours-row + .pd-hours-row{border-top:1px solid transparent}
.pd-hours-day{font-weight:600;white-space:nowrap}
.pd-hours-time{opacity:0.72;text-align:right;font-variant-numeric:tabular-nums}
.info-modal.night .pd-hours-row + .pd-hours-row{border-top-color:rgba(255,255,255,0.08)}
.info-modal.day .pd-hours-row + .pd-hours-row{border-top-color:rgba(150,100,40,0.13)}
.pd-highlights{border-radius:16px;padding:12px 14px 13px;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.pd-highlights-head{display:flex;align-items:center;gap:6px;font-size:0.7rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;opacity:0.7;margin-bottom:10px}
.info-modal.night .pd-highlights{background:rgba(255,255,255,0.04);box-shadow:inset 0 0 0 0.8px rgba(255,255,255,0.08)}
.info-modal.day .pd-highlights{background:rgba(255,255,255,0.4);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.pd-highlights-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px 16px}
.pd-highlight-item{display:flex;align-items:flex-start;gap:9px;font-size:0.9rem;line-height:1.35;font-weight:500}
.info-modal .pd-highlight-check{width:15px;height:15px;margin-top:1px}
.pd-chips{display:flex;flex-wrap:wrap;gap:6px}
.social-links{display:flex;flex-wrap:wrap;gap:8px;padding-top:2px}
.social-link{display:inline-flex;align-items:center;gap:5px;font-size: 0.75rem;font-weight:500;padding:4px 10px;border-radius:20px;text-decoration:none;transition:opacity 0.15s}
.social-link:hover{opacity:0.8}
.social-link--instagram{background:rgba(225,48,108,0.12);color:#e1306c}
.social-link--facebook{background:rgba(24,119,242,0.12);color:#1877f2}
.social-link--tripadvisor{background:rgba(52,168,83,0.12);color:#34a853}
.info-modal.day .social-link{background:rgba(255,255,255,0.55);color:#6b5840;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7)}
.info-modal.day .social-link:hover{background:rgba(255,255,255,0.8);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.95);opacity:1}

/* Tier tints — verified / spotlight / signature (same recipes as chat) */
.info-modal.night.info-modal--verified{background:linear-gradient(rgba(34,197,94,0.13),rgba(34,197,94,0.13)),rgba(30,20,56,0.84)}
.info-modal.day.info-modal--verified{background:linear-gradient(rgba(34,197,94,0.10),rgba(34,197,94,0.10)),rgba(255,255,255,0.85)}
.info-modal--verified.night .modal-header h3,.info-modal--verified.night .label{background:linear-gradient(45deg,#34d399,#22c55e);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--verified.day .modal-header h3,.info-modal--verified.day .label{background:linear-gradient(45deg,#16a34a,#15803d);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--verified.night .pd-fact-ic{color:#4ade80}
.info-modal--verified.day .pd-fact-ic{color:#16a34a}
.info-modal--verified.night .pd-action--primary{background:linear-gradient(45deg,rgba(34,197,94,0.7),rgba(16,185,129,0.7))}
.info-modal--verified.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(34,197,94,0.8),rgba(16,185,129,0.8))}
.info-modal--verified.day .pd-action--primary{background:linear-gradient(45deg,rgba(34,197,94,0.8),rgba(16,185,129,0.8))}
.info-modal--verified.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(34,197,94,0.9),rgba(16,185,129,0.9))}
.info-modal--verified .info-row--event{background:linear-gradient(135deg,rgba(34,197,94,0.16),rgba(16,185,129,0.07))}
.info-modal.night.info-modal--spotlight{background:linear-gradient(rgba(59,158,221,0.15),rgba(59,158,221,0.15)),rgba(30,20,56,0.84)}
.info-modal.day.info-modal--spotlight{background:linear-gradient(rgba(59,158,221,0.11),rgba(59,158,221,0.11)),rgba(255,255,255,0.85)}
.info-modal--spotlight.night .modal-header h3,.info-modal--spotlight.night .label{background:linear-gradient(45deg,#5cb3e8,#3b9fdd);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--spotlight.day .modal-header h3,.info-modal--spotlight.day .label{background:linear-gradient(45deg,#2b85c0,#1f6ea8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.info-modal--spotlight.night .pd-fact-ic{color:#5cb3e8}
.info-modal--spotlight.day .pd-fact-ic{color:#2b85c0}
.info-modal--spotlight.night .pd-action--primary{background:linear-gradient(45deg,rgba(59,158,221,0.7),rgba(37,128,190,0.7))}
.info-modal--spotlight.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(59,158,221,0.8),rgba(37,128,190,0.8))}
.info-modal--spotlight.day .pd-action--primary{background:linear-gradient(45deg,rgba(59,158,221,0.8),rgba(37,128,190,0.8))}
.info-modal--spotlight.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(59,158,221,0.9),rgba(37,128,190,0.9))}
.info-modal--spotlight .info-row--event{background:linear-gradient(135deg,rgba(59,158,221,0.16),rgba(37,128,190,0.07))}
.info-modal.night.info-modal--signature{background:linear-gradient(rgba(212,175,55,0.15),rgba(212,175,55,0.15)),rgba(30,20,56,0.84)}
.info-modal.day.info-modal--signature{background:linear-gradient(rgba(212,175,55,0.13),rgba(212,175,55,0.13)),rgba(255,255,255,0.86)}
.info-modal--signature.night .pd-fact-ic{color:#e8c45f}
.info-modal--signature.day .pd-fact-ic{color:#c79a2e}
.info-modal--signature.night .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7))}
.info-modal--signature.night .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.82),rgba(255,140,0,0.82))}
.info-modal--signature.day .pd-action--primary{background:linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8))}
.info-modal--signature.day .pd-action--primary:hover{background:linear-gradient(45deg,rgba(212,175,55,0.9),rgba(255,140,0,0.9))}
.info-modal--signature .info-row--event{background:linear-gradient(135deg,rgba(212,175,55,0.18),rgba(255,140,0,0.08))}

@media (max-width: 520px) {
  .ex-title { font-size: 1.35rem; }
  .ex-section { padding: 16px 0 2px; }
  .ex-section-head { margin: 0 14px 10px; }
  .ex-head { padding-left: 14px; padding-right: 14px; }
  .ex-nav-inner { padding-inline: 14px; }
  /* Centered snapping (founder 2026-09-08): each card settles in the middle
     with the neighbors peeking equally on both sides. */
  .ex-rail { gap: 11px; padding: 2px 8vw 14px; scroll-padding: 0; scroll-snap-type: x mandatory; }
  .ex-card { width: 84vw; scroll-snap-align: center; }
  .ex-gallery-nav { width: 42px; height: 42px; }
  .ex-gallery-nav--prev { left: 10px; }
  .ex-gallery-nav--next { right: 10px; }
}

/* Rail position dots — iPhone-home pattern, mobile only */
.ex-dots { display: none; align-items: center; justify-content: center; gap: 6px; margin: 10px 0 2px; }
/* Phones show the dots and hide the desktop's slim thumb — one position
   indicator per rail, not two (founder 2026-09-17). */
@media (max-width: 768px) { .ex-dots { display: flex; } .ex-rail-scroll { display: none; } }
/* Gallery on phones: swipe replaces the arrows (they sat on the photo's
   edges), the photo leaves room for the caption bar, the close target grows. */
@media (max-width: 768px) {
  .ex-gallery-close { top: 14px; right: 14px; width: 44px; height: 44px; z-index: 2; }
  .ex-gallery-bar { bottom: max(16px, env(safe-area-inset-bottom)); max-width: 92vw; }
}
/* Phone strip: one snap point per photo, native momentum, no scrollbar. */
.ex-gallery-strip { display: flex; width: 100vw; height: 100%; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; align-items: center; scrollbar-width: none; }
.ex-gallery-strip::-webkit-scrollbar { display: none; }
.ex-gallery-slide { flex: 0 0 100vw; height: 100%; scroll-snap-align: center; scroll-snap-stop: always; display: flex; align-items: center; justify-content: center; padding: 0 3vw; box-sizing: border-box; }
.ex-gallery-slide img { max-width: 94vw; max-height: 72vh; object-fit: contain; border-radius: 10px; box-shadow: 0 18px 60px rgba(0,0,0,0.55); }
.ex-gallery-dots { position: absolute; left: 0; right: 0; bottom: calc(max(16px, env(safe-area-inset-bottom)) + 40px); display: flex; justify-content: center; gap: 7px; pointer-events: none; }
.ex-gallery-dot { width: 7px; height: 7px; border-radius: 999px; border: none; padding: 0; background: rgba(255,255,255,0.4); pointer-events: auto; transition: background 0.2s, transform 0.2s; }
.ex-gallery-dot.is-on { background: #fff; transform: scale(1.25); }
.ex-dot { position: relative; width: 6px; height: 6px; padding: 0; border: none; border-radius: 99px; cursor: pointer;
  /* Same palette as the desktop rail scrollbar: track tone idle, accent active. */
  background: color-mix(in srgb, var(--ex-line) 55%, transparent); opacity: 0.9;
  transition: width 0.28s ease, opacity 0.28s ease, background 0.28s ease; }
.ex-dot::before { content: ''; position: absolute; inset: -9px -5px; }
.ex-dot.is-on { width: 18px; opacity: 1; background: var(--ex-accent); }

/* Preference chips — three families so location / style / interests read
   apart at a glance: location = accent-filled anchor, style = tinted accent
   outline, interests = quiet glass with per-interest glyphs. */
.ex-pref-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 7px; margin: 14px auto 0; max-width: 720px; padding: 0 16px; }
.ex-pref-lead { display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; opacity: 0.7; margin-right: 3px; color: #A0522D; }
.explore.night-mode .ex-pref-lead { color: #c084fc; opacity: 0.85; }
/* two-tone: glyphs carry the accent, text stays muted */

/* Footer — quiet sign-off, genie hand-back, muted legal row */
.ex-footer { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 34px 18px 44px; text-align: center; }
.ex-footer-divider { display: flex; align-items: center; gap: 12px; width: min(340px, 70%); color: #b8862c; opacity: 0.8; }
.explore.night-mode .ex-footer-divider { color: #c084fc; }
.ex-fd-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, currentColor); opacity: 0.4; }
.ex-fd-line:last-child { background: linear-gradient(90deg, currentColor, transparent); }
.ex-footer-line { margin: 0; font-size: 0.86rem; color: var(--ex-text); opacity: 0.75; max-width: 46ch; }
.ex-footer-ask { margin: 0; font-size: 0.92rem; font-weight: 600; color: var(--ex-text); }
.ex-footer-cta { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.88rem; font-weight: 600; color: var(--ex-text); background: var(--ex-chip); box-shadow: var(--ex-ring), 0 0 5px #0000001a;
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s; }
.ex-footer-links { display: flex; gap: 10px; font-size: 0.76rem; opacity: 0.55; }
.ex-footer-links a { color: inherit; text-decoration: none; }
.ex-footer-links a:hover { text-decoration: underline; }

/* Family hovers (Meet Jinni / Ask Jinni had none after the chip restyle) */
.ex-back { color: #D4AF37; }
.ex-back:hover { background: var(--ex-glass-2); }
.ex-footer-cta { color: #D4AF37; }
.ex-footer-cta:hover { background: var(--ex-glass-2); }

.ex-back-lamp { width: 19px; height: 19px; object-fit: contain; }
/* Mobile: JinniChat's hold-to-reveal — buttons appear while a finger is on
   the card (scrolling included), fade 200ms after release. */
@media (max-width: 768px) {
  .ex-card .ex-card-acts--bottom, .ex-card .ex-save { opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
  .ex-card.touch-active .ex-card-acts--bottom, .ex-card.touch-active .ex-save,
  .ex-card:active .ex-card-acts--bottom, .ex-card:active .ex-save { opacity: 1; pointer-events: auto; }
}

/* Card buttons get a tone (founder 2026-09-08: white glass was invisible):
   gold-tinted glass day, violet night — white glyphs stay. */
/* Borders tinted to the tone too (founder 2026-09-08) — pale gold ring in
   day, pale violet in night, instead of plain white. */
.ex-act-more, .ex-act--photo { background: rgba(184,134,44,0.5) !important; box-shadow: inset 0 0 0 1px rgba(255,231,176,0.85) !important; }
.ex-act-more:hover, .ex-act--photo:hover { background: rgba(184,134,44,0.68) !important; box-shadow: inset 0 0 0 1px rgba(255,231,176,1) !important; }
.explore.night-mode .ex-act-more, .explore.night-mode .ex-act--photo { background: rgba(139,92,246,0.5) !important; box-shadow: inset 0 0 0 1px rgba(216,180,254,0.8) !important; }
.explore.night-mode .ex-act-more:hover, .explore.night-mode .ex-act--photo:hover { background: rgba(139,92,246,0.68) !important; box-shadow: inset 0 0 0 1px rgba(216,180,254,1) !important; }
.ex-save { color: rgba(233,196,106,0.85); }
.explore.night-mode .ex-save { color: rgba(192,132,252,0.85); }

/* Brand-gradient text — the JinniChat app-name recipe verbatim */
.jinni-grad{background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#FFD700}

/* Toned glyphs/text on card buttons + ribbon outline (founder 2026-09-08):
   pale gold day / pale violet night instead of pure white. */
.ex-act-more, .ex-act--photo { color: #ffe9b8 !important; }
.explore.night-mode .ex-act-more, .explore.night-mode .ex-act--photo { color: #e9dcff !important; }
.ex-save svg path { stroke: rgba(255,231,176,0.85); stroke-width: 2; } /* = More button's ring */
.explore.night-mode .ex-save svg path { stroke: rgba(216,180,254,0.8); }
.ex-pref { color: #D4AF37; }

.dc-nomatch { text-align: center; margin: 22px auto 0; padding: 0 18px; color: var(--ex-muted); }
/* Back button in the landing's underlined dress (founder 2026-09-17): no
   box, the word rests at half strength with a hairline beneath, and both
   come to full on hover — the same trip the day wish label makes. */
.dc-back { position: relative; display: inline-flex; align-items: center; gap: 6px; padding: 8px 6px 14px; margin: 0 auto 2px; border: none; font-family: var(--brand-serif, inherit); font-size: 15px; font-weight: 600; cursor: pointer; background: transparent; transition: color 0.3s ease, text-shadow 0.3s ease; }
.dc-back::after { content: ''; position: absolute; left: 0; right: 0; bottom: 7px; height: 1.5px; transition: background 0.3s ease, box-shadow 0.3s ease; }
.explore.day-mode .dc-back { color: rgba(115,47,6,0.58); }
.explore.day-mode .dc-back::after { background: rgba(115,47,6,0.5); box-shadow: 0 0 10px rgba(214,120,40,0.22); }
.explore.day-mode .dc-back:hover { color: #732F06; text-shadow: 0 0 14px rgba(255,224,176,1); }
.explore.day-mode .dc-back:hover::after { background: rgba(115,47,6,0.95); box-shadow: 0 0 14px rgba(214,120,40,0.6); }
.explore.night-mode .dc-back { color: rgba(244,231,201,0.7); }
.explore.night-mode .dc-back::after { background: rgba(233,196,124,0.45); box-shadow: 0 0 10px rgba(255,190,110,0.25); }
.explore.night-mode .dc-back:hover { color: #fff6e6; text-shadow: 0 0 20px rgba(255,190,110,0.55); }
.explore.night-mode .dc-back:hover::after { background: rgba(255,224,176,0.95); box-shadow: 0 0 16px rgba(255,190,110,0.7); }
/* Public page only: the lamp is a link home; the More window's Ask Jinni
   action reuses the lamp glyph at button size. */
.ex-app-link { display: inline-block; line-height: 0; }
.pd-action .ex-back-lamp { width: 16px; height: 16px; }

/* ═══ EXPLORE · the landing's world (founder 2026-10-05: "edit the discovery
   page design too, the way we have in landing and business landing"; approved
   in the artifact preview "Jinni Discover Redesign"). The same block lives in
   ExploreView.vue and DiscoverCity.vue and overrides the rules above by order.
   Sky = JinniDaySky / JinniNightSky as the first child; lamp + JINNI top bar;
   a centred hero with the city in Cinzel; Meet Jinni / Ask Jinni = the
   landing's Make a Wish (Ember Breath glass); NO category chip bar (founder:
   "without that will be more interesting"); the rails keep their own measures
   — square photos, squircle arrows in the gutters, dots on phones (founder:
   "old version maybe better … also the card sizes"); More + photos are two
   dark-glass marks on the photo's lower edge, always visible. Content, order
   and logic unchanged; the info modal + gallery stay the chat's port. ═══ */
.explore { position: relative; z-index: 1; background: none;
  --serif: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif;
  --lora: 'Lora', 'Noto Serif Armenian', Georgia, serif; font-family: var(--lora) }
.explore.day-mode { background: none; color: #7a5434;
  --ink: #7A4A1C; --body: #7a5434; --soft: rgba(122,84,52,0.8); --accent: #c0702a; --rule: rgba(122,74,28,0.16); --halo: rgba(255,170,80,0.3);
  --glass: rgba(255,255,255,0.5); --glass-hover: rgba(255,255,255,0.66);
  --glass-rim: inset 0 0 0 0.75px rgba(255,255,255,0.9), 0 0 18px -2px rgba(140,61,7,0.12);
  --glass-rim-hover: inset 0 0 0 0.75px rgba(232,190,130,0.75), 0 0 18px -2px rgba(140,61,7,0.16);
  --f-fill: rgba(255,255,255,0.62); --f-fill-hover: rgba(255,255,255,0.78); --f-ink: #5a3c22; --f-ph: rgba(122,84,52,0.55);
  --f-rim: rgba(255,255,255,0.9); --f-rim-hover: rgba(232,190,130,0.75); --f-glow: rgba(212,140,60,0.22); --f-light: rgba(255,170,80,0.22); --f-focus-rim: rgba(200,140,50,0.7);
  --cta-ink: #6e3f16; --cta-glass: rgba(255,255,255,0.35); --cta-ink-shadow: 0 0 8px rgba(255,248,235,0.8);
  --cta-rim: inset 0 0 0 0.75px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 18px -3px rgba(190,110,40,0.3);
  --cta-rim-hover: inset 0 0 0 0.75px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.95), 0 0 22px -3px rgba(190,110,40,0.42);
  --cta-light: rgba(255,160,70,0.75); --cta-core: rgba(255,230,170,0.7); --cta-speck: rgba(255,214,120,0.4);
  /* the older tokens, re-pointed so rules above follow the new world */
  --ex-text: var(--body); --ex-heading: var(--ink); --ex-muted: var(--soft); --ex-accent: var(--accent); --ex-line: var(--rule);
  --ex-chip: var(--glass); --ex-glass-2: var(--glass-hover); --ex-ring: inset 0 0 0 0.75px rgba(255,255,255,0.9);
  --ex-shimmer: rgba(255,255,255,0.45); --ex-glint: rgba(255,255,255,0.7) }
.explore.night-mode { background: none; color: #eee6f6;
  --ink: #fbf5ff; --body: #c9c0da; --soft: rgba(238,230,246,0.72); --accent: #ffb36b; --rule: rgba(200,190,255,0.14); --halo: rgba(124,77,255,0.42);
  --glass: rgba(255,255,255,0.05); --glass-hover: rgba(255,255,255,0.1);
  --glass-rim: inset 0 0 0 0.75px rgba(220,210,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px -2px rgba(0,0,0,0.45);
  --glass-rim-hover: inset 0 0 0 0.75px rgba(255,214,160,0.3), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 18px -2px rgba(0,0,0,0.45);
  --f-fill: rgba(255,255,255,0.06); --f-fill-hover: rgba(255,255,255,0.1); --f-ink: #f3eaf8; --f-ph: rgba(220,210,240,0.5);
  --f-rim: rgba(220,210,255,0.16); --f-rim-hover: rgba(255,214,160,0.3); --f-glow: rgba(255,170,90,0.18); --f-light: rgba(255,160,70,0.2); --f-focus-rim: rgba(255,200,120,0.6);
  --cta-ink: #fffaf0; --cta-glass: rgba(255,255,255,0.04); --cta-ink-shadow: 0 0 10px rgba(120,50,0,0.55), 0 0 2px rgba(80,30,0,0.4);
  --cta-rim: inset 0 0 0 0.75px rgba(255,240,215,0.38), inset 0 1px 0 rgba(255,246,228,0.5), 0 0 18px -2px rgba(255,160,80,0.32);
  --cta-rim-hover: inset 0 0 0 0.75px rgba(255,240,215,0.5), inset 0 1px 0 rgba(255,246,228,0.62), 0 0 22px -2px rgba(255,160,80,0.44);
  --cta-light: rgba(255,150,50,0.62); --cta-core: rgba(255,228,170,0.5); --cta-speck: rgba(233,199,102,0.34);
  --ex-text: var(--body); --ex-heading: var(--ink); --ex-muted: var(--soft); --ex-accent: var(--accent); --ex-line: var(--rule);
  --ex-chip: var(--glass); --ex-glass-2: var(--glass-hover); --ex-ring: inset 0 0 0 0.75px rgba(220,210,255,0.14);
  --ex-shimmer: rgba(255,255,255,0.05); --ex-glint: rgba(255,255,255,0.08) }

/* top bar: lamp + JINNI, like the landing */
.ex-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; max-width: 1180px; margin: 0 auto; padding: 16px 20px 0 }
.ex-brand { display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font: 500 22px/1 var(--serif); letter-spacing: 0.14em; color: var(--ink) }
.explore.day-mode .ex-brand { color: #b8741f }
.ex-brand-lamp { width: 44px; height: auto; margin: -6px 0 -6px -6px }
.explore.night-mode .ex-brand-lamp { filter: drop-shadow(0 0 8px rgba(255,170,90,0.35)) }
.explore.day-mode .ex-brand-lamp { filter: saturate(0.88) brightness(0.95) }
.ex-signin { padding: 8px 4px; font-size: 14.5px; color: var(--soft); text-decoration: none; transition: color .2s ease }
.ex-signin:hover { color: var(--ink) }

/* hero: the city in the spotlight */
/* about a centimetre of air between the top bar and "Jinni's Discoveries" (founder 2026-10-05) */
.ex-head { position: relative; padding-top: clamp(56px, calc(5vw + 38px), 92px); gap: 14px }
.ex-head::before { content: ''; position: absolute; z-index: -1; top: -10px; left: 50%; width: 440px; max-width: 100vw; height: 280px; margin-left: -220px;
  pointer-events: none; filter: blur(40px); background: radial-gradient(closest-side, var(--halo), transparent) }
.ex-kicker { margin: 0; font: 500 12.5px/1.2 var(--serif); letter-spacing: 0.26em; text-transform: uppercase; color: var(--accent) }
.ex-title { margin: 0; font-family: var(--serif); font-weight: 500; font-size: clamp(44px, 9vw, 84px); line-height: 1.02; letter-spacing: 0.04em;
  color: var(--ink); background: none; -webkit-text-fill-color: currentColor; text-wrap: balance; text-shadow: none }
.ex-sub { display: inline-flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 10px; margin: 0; font: 400 15px/1.4 var(--lora);
  letter-spacing: 0; text-transform: none; color: var(--soft) }
.ex-sub b { font-weight: 600; color: var(--ink) }
.ex-sub i { width: 4px; height: 4px; border-radius: 50%; background: var(--accent) }
.ex-intro { margin: 2px 0 0; max-width: 520px; font-style: italic; font-size: clamp(16.5px, 2vw, 18.5px); line-height: 1.6; color: var(--body); opacity: 1; text-wrap: balance }
.ex-head-cta { margin-top: 10px; gap: 12px }

/* buttons: Meet Jinni / Ask Jinni = the landing's Make a Wish (Ember Breath:
   clear glass, the light lives inside and rises from a new spot each breath —
   utils/emberBreath.js moves --ex/--ey); Preferences = a glass pill */
.ex-back, .ex-footer-cta { position: relative; overflow: hidden; isolation: isolate; justify-content: center; min-height: 56px; padding: 14px 36px; border: 0;
  font: 600 17px/1.25 var(--lora); color: var(--cta-ink); text-shadow: var(--cta-ink-shadow); background: var(--cta-glass); box-shadow: var(--cta-rim);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: --ex 3.4s ease-in-out, --ey 3.4s ease-in-out, box-shadow .25s ease }
.ex-back:hover, .ex-footer-cta:hover { background: var(--cta-glass); box-shadow: var(--cta-rim-hover) }
.ex-back:active { transform: none }
.ex-back::before, .ex-footer-cta::before { content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: radial-gradient(62% 120% at var(--ex, 50%) var(--ey, 110%), var(--cta-light), transparent 70%), radial-gradient(34% 80% at var(--ex, 50%) var(--ey, 110%), var(--cta-core), transparent 70%);
  animation: ex-breathe 3.4s ease-in-out infinite }
.ex-back::after, .ex-footer-cta::after { content: ''; position: absolute; inset: -60% -30%; z-index: -1; pointer-events: none; filter: blur(12px);
  background: radial-gradient(18% 30% at 30% 50%, var(--cta-speck), transparent 100%); animation: ex-drift 11s ease-in-out infinite }
@keyframes ex-breathe { 0%, 100% { opacity: 0.38 } 50% { opacity: 0.82 } }
@keyframes ex-drift { 0% { transform: translate(-9%, 2%) } 33% { transform: translate(7%, -3%) } 66% { transform: translate(-3%, 4%) } 100% { transform: translate(-9%, 2%) } }
@media (prefers-reduced-motion: reduce) { .ex-back::before, .ex-footer-cta::before, .ex-back::after, .ex-footer-cta::after { animation: none } }
.ex-back .jinni-grad, .ex-pref .jinni-grad, .ex-footer-cta .jinni-grad { background: none; -webkit-text-fill-color: currentColor; color: inherit }
.ex-pref { min-height: 52px; padding: 12px 24px; border: 0; font: 500 16px/1.25 var(--lora); color: var(--ink); background: var(--glass); box-shadow: var(--glass-rim);
  backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); transition: background-color .2s ease, box-shadow .2s ease }
.ex-pref:hover { background: var(--glass-hover); box-shadow: var(--glass-rim-hover) }
.ex-pref svg { color: var(--accent) }

/* search: a glass field with the sign-in states + the solid gold action */
.ex-search { margin-top: 24px; padding: 6px 6px 6px 18px; background: var(--f-fill); box-shadow: inset 0 0 0 0.75px var(--f-rim), 0 0 18px -2px rgba(0,0,0,0.12);
  backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%); transition: background-color .25s ease, box-shadow .25s ease }
.explore.day-mode .ex-search { box-shadow: inset 0 0 0 0.75px var(--f-rim), 0 0 18px -2px rgba(140,61,7,0.12) }
.ex-search:hover { background-color: var(--f-fill-hover); box-shadow: inset 0 0 0 0.75px var(--f-rim-hover), 0 0 14px -6px var(--f-glow) }
.ex-search:focus-within { background-color: var(--f-fill-hover); background-image: radial-gradient(70% 130% at 50% 135%, var(--f-light), transparent 70%);
  box-shadow: inset 0 0 0 0.75px var(--f-focus-rim), 0 0 16px -4px var(--f-glow) }
.ex-search-icon { color: var(--accent) }
.ex-search-input { font: 400 16px/1.3 var(--lora); color: var(--f-ink) }
.ex-search-input::placeholder { color: var(--f-ph) }
.ex-search-btn { min-height: 42px; padding: 10px 22px; font: 600 15px/1.2 var(--lora); color: #fff; -webkit-text-fill-color: #fff;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 16px -4px rgba(255,140,0,0.5); transition: filter .2s ease, box-shadow .2s ease }
.ex-search-btn:hover:not(:disabled) { filter: brightness(1.05); box-shadow: 0 0 20px -3px rgba(255,140,0,0.6) }
.ex-search-btn:disabled { opacity: 0.5 }
.ex-showing { padding: 7px 14px; font-family: var(--lora); font-size: 14px; color: var(--ink); background: var(--glass); box-shadow: var(--glass-rim);
  backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%) }
.ex-showing svg { color: var(--accent) }
.ex-showing-clear { color: var(--soft) }
.ex-showing-clear:hover { color: var(--ink) }
.ex-showing--miss { color: var(--soft) }
.ex-pref-lead, .explore.night-mode .ex-pref-lead { font-size: 14px; color: var(--soft); opacity: 1; gap: 7px }
.ex-pref-lead svg { color: var(--accent) }

/* no category chip bar: the page runs from the hero straight into the rails */
.ex-nav { display: none }

/* sections: a Cinzel title, its count, a fading rule */
.ex-section { padding-top: clamp(30px, 5vw, 46px) }
.ex-section-head { align-items: center; gap: 14px; margin-bottom: 16px }
.ex-section-title { font-family: var(--serif); font-weight: 500; font-size: clamp(19px, 2.6vw, 24px); line-height: 1.2; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink) }
.ex-section-count { flex: none; font-size: 13.5px; font-style: italic; color: var(--soft) }
.ex-section-rule { flex: 1; min-width: 12px; height: 1px; background: linear-gradient(90deg, var(--rule), transparent) }

/* cards keep their measures; the photo gets the glass rim, the text the new inks */
.ex-card-imgwrap { border-radius: 18px; margin-bottom: 10px; background: var(--f-fill); box-shadow: var(--glass-rim) }
.ex-card-name { font: 600 16.5px/1.3 var(--lora); color: var(--ink) }
.ex-card-dates { font-size: 13px; color: var(--accent) }
.ex-card-sub { font-size: 13.5px; color: var(--soft) }
.ex-card-imgless { color: var(--soft) }
.ex-tier { font-family: var(--lora); font-weight: 600 }

/* More + photos: two quiet dark-glass marks on the photo's lower edge, always
   there (no hover, no hold) — the same glass in both themes, like the guide
   page's tag on a photo */
.explore .ex-card .ex-card-acts--bottom { opacity: 1 !important; background: linear-gradient(180deg, transparent 58%, rgba(8,4,18,0.5) 100%) }
.explore .ex-card .ex-card-acts--bottom > * { pointer-events: auto }
.explore .ex-act-more, .explore.night-mode .ex-act-more, .explore .ex-act--photo, .explore.night-mode .ex-act--photo {
  display: inline-flex; align-items: center; height: 34px; border-radius: 999px; text-shadow: none;
  color: #fff4e2 !important; background: rgba(16,7,34,0.42) !important; box-shadow: inset 0 0 0 0.75px rgba(255,235,200,0.4) !important;
  backdrop-filter: blur(10px) saturate(150%); -webkit-backdrop-filter: blur(10px) saturate(150%); transition: background-color .2s ease, box-shadow .2s ease }
.explore .ex-act-more:hover, .explore.night-mode .ex-act-more:hover, .explore .ex-act--photo:hover, .explore.night-mode .ex-act--photo:hover {
  background: rgba(16,7,34,0.62) !important; box-shadow: inset 0 0 0 0.75px rgba(255,226,170,0.8), 0 0 14px -3px rgba(255,180,90,0.6) !important }
.ex-act-more { left: 12px; top: auto; bottom: 12px; transform: none; min-width: 0; gap: 8px; padding: 0 12px 0 15px;
  font: 500 11.5px/1 var(--serif); letter-spacing: 0.2em; text-transform: uppercase }
.ex-act-more svg { flex: none; width: 13px; height: 13px; fill: none; stroke: #ffd27a; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round }
:lang(ar) .ex-act-more, :lang(ar) .ex-kicker, :lang(ar) .ex-section-title, [dir="rtl"] .ex-act-more, [dir="rtl"] .ex-kicker, [dir="rtl"] .ex-section-title { letter-spacing: 0 }
.ex-act--photo { right: 12px; bottom: 12px; width: auto; gap: 6px; padding: 0 11px; font: 600 12.5px/1 system-ui, sans-serif; font-variant-numeric: tabular-nums }
.ex-act--photo svg { width: 15px; height: 15px; filter: none }

/* save = the Slim silk ribbon in GLACIER glass (founder 2026-10-05, preview options C6 then
   G1): a narrow pane of clear frosted glass cut to the ribbon's shape, hanging from the
   photo's top edge, with a bright rim drawn over it. Saved: the same glass lit from inside by
   warm light rising from the tip, and a soft glow. Always visible, like More and photos; the
   tap area stays 44px wide. The glow sits on the rim's svg, not on the button: a filter on
   the button would stop the pane's backdrop blur from seeing the photo. */
.explore .ex-card .ex-save { top: 0; right: 20px; width: 18px; height: 56px; border-radius: 0; opacity: 1 !important; pointer-events: auto }
.explore .ex-save::before { content: ''; position: absolute; inset: -2px -13px -8px }
.explore .ex-save-glass { position: absolute; inset: 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%); background: rgba(255,255,255,0.24);
  backdrop-filter: blur(9px) saturate(170%) brightness(1.12); -webkit-backdrop-filter: blur(9px) saturate(170%) brightness(1.12); transition: background .25s ease }
.explore .ex-save svg { position: relative; display: block; overflow: visible; filter: drop-shadow(0 0 4px rgba(0,0,0,0.3)); transition: filter .25s ease }
.explore .ex-save svg path, .explore.night-mode .ex-save svg path { fill: none; stroke: rgba(255,255,255,0.85); stroke-width: 1.1 }
.explore .ex-save.saved .ex-save-glass { background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,214,140,0.62) 45%, rgba(255,160,60,0.9) 100%) }
.explore .ex-save.saved svg { filter: drop-shadow(0 0 7px rgba(255,170,80,0.85)) }

/* rail arrows: the same squircles, in the new glass */
.ex-rail-btn { color: var(--ink); background: var(--glass); box-shadow: var(--glass-rim); transition: background-color .2s ease, box-shadow .2s ease }
.ex-rail-btn:hover { background: var(--glass-hover); box-shadow: var(--glass-rim-hover) }

/* not explored yet */
.ex-empty { margin: 44px auto 60px; padding: 34px 26px 30px; max-width: 540px; border-radius: 28px; background: var(--glass); box-shadow: var(--glass-rim);
  backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%) }
@media (max-width: 600px) { .ex-empty { margin-inline: 16px } }
.ex-empty-title { font-family: var(--serif); font-weight: 500; font-size: clamp(21px, 3.4vw, 26px); line-height: 1.25; letter-spacing: 0.02em; color: var(--ink); text-wrap: balance }
.ex-empty-sub { font-size: 16px; line-height: 1.6; color: var(--body) }
.ex-cta { min-height: 50px; padding: 13px 30px; font: 600 16.5px/1.25 var(--lora); color: #fff; -webkit-text-fill-color: #fff;
  background: linear-gradient(45deg, #D4AF37, #FF8C00); box-shadow: 0 0 18px -4px rgba(255,140,0,0.5); transition: filter .2s ease, box-shadow .2s ease }
.ex-cta:hover { filter: brightness(1.05); box-shadow: 0 0 22px -3px rgba(255,140,0,0.6) }
.ex-cta:active { transform: none }

/* footer: a ruled sign-off. Each step has its own distance, so the rhythm holds
   whatever the sentence length: spark · sentence · question · button · links. The sentence
   may run to 640px (one line on a desktop in most languages) and wraps in even lines on a
   phone; the links wrap as whole words instead of running off the screen (ru, fr). */
.ex-footer { gap: 0; max-width: 1120px; margin: clamp(40px, 7vw, 76px) auto 0; padding: 34px 18px 44px; border-top: 1px solid var(--rule) }
.explore .ex-footer-divider, .explore.night-mode .ex-footer-divider { width: auto; color: var(--accent); opacity: 0.9 }
.ex-fd-line { display: none }
.ex-footer-line { margin-top: 14px; max-width: min(640px, 100%); font-style: italic; font-size: 17px; line-height: 1.55; color: var(--body); opacity: 1; text-wrap: balance }
.ex-footer-ask { margin-top: 18px; max-width: min(520px, 100%); font-size: 15px; font-weight: 400; line-height: 1.45; color: var(--soft); text-wrap: balance }
.ex-footer-cta { margin-top: 18px }
.ex-footer-links { margin-top: 28px; flex-wrap: wrap; justify-content: center; gap: 6px 12px; max-width: 100%; font-family: var(--lora); font-size: 13.5px; color: var(--soft); opacity: 1 }
.ex-footer-links a { white-space: nowrap }
.ex-footer-links a:hover { color: var(--ink); text-decoration: none }

@media (max-width: 520px) {
  .ex-top { padding: 12px 16px 0 }
  .ex-back, .ex-footer-cta { min-height: 52px; padding: 12px 28px; font-size: 16px }
  .ex-pref { min-height: 48px; padding: 10px 20px; font-size: 15px }
  .ex-search-btn { padding: 10px 18px }
}
</style>

