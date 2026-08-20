<template>
  <div class="explore" :class="theme">
    <!-- ═══ Header — centered, chat-glacier back pill ═══ -->
    <header class="ex-head">
      <img src="/images/bottle.png" class="ex-app-icon" alt="Jinni"/>
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
      <!-- No back arrow: "Meet Jinni" is an invitation, not a return trip.
           Sits under the intro as the page's primary CTA, in the brand
           gradient — same treatment as the other conversion buttons. -->
      <div class="ex-head-cta">
        <button class="ex-back" @click="goBack">
          {{ t('explore.back_chat') || 'Meet Jinni' }}
        </button>
        <!-- Preferences round-trip: onboarding returns here (returnTo), and the
             feed refetches on mount — section order follows the new interests. -->
        <button class="ex-pref" @click="goPreferences">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
          {{ t('explore.preferences') || 'Preferences' }}
        </button>
      </div>
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
    <nav v-if="hasAny" class="ex-nav" ref="navEl">
      <!-- Inner track: width max-content + margin auto centers the chips when
           they fit the viewport and still scrolls cleanly when they overflow
           (justify-content:center would clip the left end instead). -->
      <div class="ex-nav-inner">
        <button v-for="c in orderedCategories" :key="c" :ref="el => chipEls[c] = el"
                class="ex-chip" :class="{ active: activeCat === c }"
                @click="scrollToCat(c)">
          {{ catLabel(c) }}
          <span class="ex-chip-count">{{ categories[c].length }}</span>
        </button>
      </div>
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
          <div v-for="(p, pi) in categories[c]" :key="c + p.placeId"
               class="ex-card" :class="p.tier ? 'ex-card--' + p.tier : ''"
               @click="openPlace(p)">
            <div class="ex-card-imgwrap">
              <img v-if="p.image" class="ex-card-img" :src="imgUrl(p.image)" :alt="p.name"
                   :loading="pi < 4 ? 'eager' : 'lazy'" decoding="async"
                   @load="$event.target.classList.add('ex-img-in')"
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
                <button class="ex-act" :title="t('place_info.more_info') || 'More info'" @click="openInfo(p, c)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </button>
              </div>
            </div>

            <div class="ex-card-name">{{ p.name }}</div>
            <div v-if="p.eventDates" class="ex-card-dates">{{ evDates(p.eventDates) }}</div>
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

    <!-- ═══ Place info modal — the chat's info-modal, same structure & design
         (glacier glass, gold gradient title, pd-* layout, partner-tier tints).
         Ported verbatim from JinniChat.vue so both surfaces read identically;
         closes like the chat's: tap outside or Escape, no ✕ button. ═══ -->
    <div v-if="info.open" class="info-modal-overlay" @click.self="closeInfo">
      <div class="info-modal" :class="[theme === 'night-mode' ? 'night' : 'day', infoTierClass]">
        <div class="modal-header">
          <h3>{{ info.data?.name || info.place?.name }}</h3>
        </div>
        <div class="modal-body">
          <div v-if="info.loading" class="loading-container"><p>{{ t('place_info.loading') || 'Loading…' }}</p></div>
          <div v-else class="place-details">
            <!-- Category subtitle, directly under the title -->
            <div class="pd-subtitle" v-if="info.cat">{{ catLabel(info.cat) }}</div>

            <!-- Event date — surfaced first: for an event the date IS the primary fact -->
            <div class="info-row info-row--event" v-if="info.place?.eventDates">
              <span class="label">{{ t('chat.event.event_date') || 'Event date' }}</span>
              <div class="value event-schedule-value">
                <span class="event-schedule-primary">{{ evDates(info.place.eventDates) }}</span>
              </div>
            </div>

            <!-- Inline star rating (restaurants/hotels, same rule as the chat modal) -->
            <div class="pd-rating" v-if="Number.isFinite(info.data?.rating) && (info.cat === 'restaurants' || info.cat === 'hotels')">
              <svg class="pd-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26 6.85.6-5.18 4.52 1.55 6.7L12 17.27 5.88 20.58l1.55-6.7L2.25 8.86l6.85-.6z"/></svg>
              <span class="pd-rating-num">{{ info.data.rating }}</span>
              <span class="pd-rating-out">/5</span>
              <span v-if="info.data.totalReviews" class="review-count">{{ t('place_info.reviews', { count: info.data.totalReviews }) || `${info.data.totalReviews} reviews` }}</span>
            </div>

            <!-- Quick actions: Directions (primary), Call, Search, Website -->
            <div class="pd-actions">
              <button @click="openPlace(info.place)" class="pd-action pd-action--primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                <span>{{ t('place_info.get_directions') || 'Get Directions' }}</span>
              </button>
              <a v-if="info.data?.phone" :href="`tel:${info.data.phone}`" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{{ t('place_info.phone') || 'Phone' }}</span>
              </a>
              <button @click="searchOnline(info.place)" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>{{ t('place_info.search_online') || 'Search' }}</span>
              </button>
              <a v-if="info.data?.website" :href="info.data.website" target="_blank" rel="noopener noreferrer" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>{{ t('place_info.website') || 'Website' }}</span>
              </a>
            </div>

            <div class="pd-divider"></div>

            <!-- Icon-leading facts -->
            <div class="pd-fact" v-if="info.data?.address || info.place?.region">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
              <div class="pd-fact-body">{{ info.data?.address || info.place?.region }}</div>
            </div>

            <div class="pd-fact" v-if="info.data?.hours?.length">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
              <div class="pd-fact-body pd-hours">
                <div v-for="(h, i) in hoursParsed" :key="i" class="pd-hours-row">
                  <span class="pd-hours-day">{{ h.day }}</span>
                  <span v-if="h.time" class="pd-hours-time">{{ h.time }}</span>
                </div>
              </div>
            </div>

            <div class="pd-fact" v-if="info.data?.pricing">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
              <div class="pd-fact-body">{{ info.data.pricing }}</div>
            </div>

            <div class="pd-fact" v-if="info.data?.email">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg></span>
              <div class="pd-fact-body"><a :href="`mailto:${info.data.email}`">{{ info.data.email }}</a></div>
            </div>

            <div class="pd-fact pd-fact--desc" v-if="infoDescription">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
              <div class="pd-fact-body">{{ infoDescription }}</div>
            </div>

            <!-- Highlights — curated feature showcase -->
            <div class="pd-highlights" v-if="info.data?.highlights?.length">
              <div class="pd-highlights-head">{{ t('place_info.highlights') || 'Highlights' }}</div>
              <div class="pd-highlights-grid">
                <div v-for="h in info.data.highlights" :key="h" class="pd-highlight-item">
                  <svg class="pd-highlight-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ h }}</span>
                </div>
              </div>
            </div>

            <!-- Social -->
            <div class="social-links pd-chips" v-if="info.data?.socialMedia?.instagram || info.data?.socialMedia?.facebook || info.data?.socialMedia?.tripadvisor">
              <a v-if="info.data.socialMedia?.instagram" :href="info.data.socialMedia.instagram" target="_blank" rel="noopener noreferrer" class="social-link social-link--instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </a>
              <a v-if="info.data.socialMedia?.facebook" :href="info.data.socialMedia.facebook" target="_blank" rel="noopener noreferrer" class="social-link social-link--facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a v-if="info.data.socialMedia?.tripadvisor" :href="info.data.socialMedia.tripadvisor" target="_blank" rel="noopener noreferrer" class="social-link social-link--tripadvisor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c1.93 0 3.75.58 5.27 1.57l1.6-1.6 1.06 1.06-1.48 1.48A9.44 9.44 0 0 1 21.5 12c0 5.247-4.253 9.5-9.5 9.5S2.5 17.247 2.5 12 6.753 2.5 12 2.5zm0 2a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm-3.5 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 1.5c-.69 0-1.327.212-1.856.574l.67.67a1 1 0 0 1 0 1.414l-.67.67c.53.362 1.166.572 1.856.572s1.326-.21 1.856-.572l-.67-.67a1 1 0 0 1 0-1.414l.67-.67A3.144 3.144 0 0 0 12 12z"/></svg>
                TripAdvisor
              </a>
            </div>
          </div>
        </div>
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
      chipEls: {},
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
      // cat = the rail the card was opened from; drives the modal's subtitle
      // and the restaurants/hotels-only rating rule (same as the chat modal).
      info: { open: false, loading: false, data: null, place: null, cat: null },
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
    // ── Info modal (ported from JinniChat) ──
    // Parse each backend hours string ("Mon: 09:00–22:00") into a day/time
    // pair for the two-column schedule; a line with no "day: time" separator
    // shows whole in the day column. Same shape as the chat's hoursParsed.
    hoursParsed() {
      const hrs = this.info.data?.hours;
      if (!Array.isArray(hrs)) return [];
      return hrs.map(line => {
        const s = String(line);
        const idx = s.indexOf(': ');
        if (idx > 0) return { day: s.slice(0, idx).trim(), time: s.slice(idx + 2).trim() };
        return { day: s.trim(), time: '' };
      });
    },
    // Tier tint for the modal — only partners get one (mirrors the chat's
    // infoModalTierClass; Explore's p.tier IS the partner tier, so no
    // verifiedId gymnastics needed here).
    infoTierClass() {
      const tier = this.info.place?.tier;
      if (tier === 'signature' || tier === 'featured') return 'info-modal--signature';
      if (tier === 'spotlight') return 'info-modal--spotlight';
      if (tier === 'verified') return 'info-modal--verified';
      return '';
    },
    // Description arrives either as a plain string or {short, detailed}.
    infoDescription() {
      const d = this.info.data?.description;
      if (!d) return '';
      return typeof d === 'string' ? d.trim() : (d.short || d.detailed || '');
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
    // vue-i18n returns the KEY ITSELF for a missing message (a truthy string),
    // which silently defeats every `t(...) || fallback` in this template — the
    // "explore.preferences" raw-key bug. Normalize a miss to null so the
    // inline English fallbacks genuinely take over.
    t(key, params) {
      if (!this.$t) return null;
      const s = this.$t(key, params);
      return (s && s !== key) ? s : null;
    },
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
    // "Thu, Aug 20 → Sun, Aug 23" (single day: just the start) — same shape as
    // the chat event cards, in the browser's locale.
    evDates(ed) {
      const f = d => new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (!ed?.start) return '';
      return ed.end && f(ed.end) !== f(ed.start) ? `${f(ed.start)} → ${f(ed.end)}` : f(ed.start);
    },
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
          if (c && c !== this.activeCat) { this.activeCat = c; this.centerActiveChip(c); }
        }
      }, { rootMargin: '-15% 0px -70% 0px' });
      for (const c of this.orderedCategories) {
        if (this.catEls[c]) this._spy.observe(this.catEls[c]);
      }
    },
    /* Keep the highlighted chip visible as the page scrollspy moves through
       categories — on mobile the active chip otherwise drifts off the right
       edge of the nav while the page scrolls, and the bar looks stuck. */
    centerActiveChip(c) {
      const nav = this.$refs.navEl, chip = this.chipEls[c];
      if (!nav || !chip || nav.scrollWidth <= nav.clientWidth) return;   // chips all fit — nothing to follow
      nav.scrollTo({ left: chip.offsetLeft - (nav.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
    },
    scrollToCat(c) {
      this.activeCat = c;
      this.catEls[c]?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      this.centerActiveChip(c);
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
    async openInfo(p, cat) {
      this.info = { open: true, loading: true, data: null, place: p, cat: cat || null };
      try {
        const res = await fetch(`${API_BASE}/api/ai/place-details/${encodeURIComponent(p.placeId)}?name=${encodeURIComponent(p.name)}`, { headers: this.authHeaders() });
        const data = await res.json().catch(() => ({}));
        this.info = { ...this.info, loading: false, data: data?.data || null };
      } catch (e) {
        this.info = { ...this.info, loading: false, data: null };
      }
    },
    closeInfo() { this.info = { open: false, loading: false, data: null, place: null, cat: null }; },
    // Same as the chat modal's Search action — a plain web search on the name.
    searchOnline(p) {
      if (!p?.name) return;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(p.name)}`, '_blank');
    },
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
    // `editing: 'true'` is REQUIRED: the router guard bounces onboarding-
    // completed users from /onboarding back to JinniChat unless the editing
    // flag is set (router/index.js `completedOnboarding` check) — without it
    // this button silently landed on the chat page.
    goPreferences() { this.$router.push({ path: '/onboarding', query: { editing: 'true', returnTo: '/explore' } }) },
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

.explore { min-height: 100vh; background: var(--ex-bg-grad); color: var(--ex-text); padding: 0 0 40px; }

/* Search — TripAdvisor-style pill */
.ex-search { display: flex; align-items: center; gap: 10px; width: min(640px, calc(100% - 36px)); margin: 16px auto 0;
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
  padding: 26px 18px 4px; max-width: 1200px; margin: 0 auto; }
.ex-back { display: inline-flex; align-items: center; gap: 7px; padding: 11px 26px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.95rem; font-weight: 700; color: #fff; background: var(--ex-active-grad);
  box-shadow: var(--ex-active-ring), 0 0 5px #0000002e, var(--ex-active-shadow); transition: filter .18s, transform .15s; }
.ex-back:hover { filter: brightness(1.06); }
.ex-back:active { transform: scale(0.98); }
.ex-head-cta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
.ex-pref { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.88rem; font-weight: 600; color: var(--ex-text); background: var(--ex-chip); box-shadow: var(--ex-ring), 0 0 5px #0000001a;
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s; }
.ex-pref:hover { background: var(--ex-glass-2); }
/* App icon above the title — same asset the chat header uses. */
.ex-app-icon { width: 76px; height: 76px; object-fit: contain; margin-bottom: -6px;
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
.ex-nav { position: sticky; top: 0; z-index: 10; overflow-x: auto; padding: 10px 0; margin: 12px 0 0;
  scrollbar-width: none; background: color-mix(in srgb, var(--ex-bg) 72%, transparent); backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%); }
/* Night: lighter tint so the frosted bar doesn't read as a solid band. */
.explore.night-mode .ex-nav { background: color-mix(in srgb, var(--ex-bg) 60%, transparent); }
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
.ex-card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
  opacity: 0; transition: opacity .3s ease, filter .25s ease; }
.ex-card-img.ex-img-in { opacity: 1; }
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
.ex-card--verified  .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(34,197,94,0.55), 0 0 16px rgba(34,197,94,0.16); }
.ex-card--spotlight .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(59,159,221,0.6), 0 0 16px rgba(59,159,221,0.18); }
.ex-card--signature .ex-card-imgwrap { box-shadow: inset 0 0 0 1.5px rgba(212,175,55,0.65), 0 0 18px rgba(212,175,55,0.22); }

/* Rail paging arrows — TripAdvisor-style solid circles, always visible on
   desktop pointer devices, sitting in the side gutters OFF the images. */
.ex-rail-wrap { position: relative; }
@media (hover: hover) and (pointer: fine) { .ex-rail-wrap { padding: 0 48px; } }
/* Same glass recipe as the chat cards' "More" button. */
.ex-rail-btn { position: absolute; top: 118px; z-index: 5; width: 40px; height: 40px; border-radius: 999px; cursor: pointer;
  display: none; place-items: center; border: none; transition: background .18s;
  backdrop-filter: blur(4px) saturate(160%); -webkit-backdrop-filter: blur(4px) saturate(160%); }
.night-mode .ex-rail-btn { background: rgba(255,255,255,0.3); color: #e2e8f0; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.night-mode .ex-rail-btn:hover { background: rgba(255,255,255,0.35); }
.day-mode .ex-rail-btn { background: rgba(255,255,255,0.55); color: var(--ex-text); box-shadow: inset 0 0 0 0.7px #ffffffe6, 0 0 4px #0000001a; }
.day-mode .ex-rail-btn:hover { background: rgba(255,255,255,0.7); }
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
.ex-card-dates { font-size: 0.78rem; color: var(--ex-accent, #b8860b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
.social-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;padding:4px 10px;border-radius:20px;text-decoration:none;transition:opacity 0.15s}
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
  .ex-rail { gap: 11px; padding: 2px 14px 14px; scroll-padding-left: 14px;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%); }
  .ex-card { width: 46vw; }
  .ex-gallery-nav { width: 42px; height: 42px; }
  .ex-gallery-nav--prev { left: 10px; }
  .ex-gallery-nav--next { right: 10px; }
}
</style>
