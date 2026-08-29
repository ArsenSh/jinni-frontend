<template>
  <div class="share-page" :class="[theme, { 'share-page--centered': loading || error }]" :dir="isRtl ? 'rtl' : 'ltr'">

    <!-- ── Header ─────────────────────────────────────────────────── -->
    <header class="share-header">
      <div class="share-header-inner">
        <div class="brand">
          <img src="/images/bottle.png?v=3" class="brand-icon" alt="Jinni">
        </div>
      </div>
    </header>

    <!-- ── Loading ────────────────────────────────────────────────── -->
    <div v-if="loading" class="share-center">
      <div class="share-spinner"></div>
      <p class="share-loading-text">{{ t('share.loading') }}</p>
    </div>

    <!-- ── Error ──────────────────────────────────────────────────── -->
    <div v-else-if="error" class="share-center">
      <div class="share-error-icon">✨</div>
      <p class="share-error-title">{{ t('share.link_expired') }}</p>
      <a href="https://jinni.travel/chat" class="cta-btn">{{ t('share.discover_places') }}</a>
    </div>

    <!-- ── Content ────────────────────────────────────────────────── -->
    <main v-else class="share-main">
      <!-- ══ SCENARIO A: Recommendation card (single) ══ -->
      <template v-if="payload.type === 'recommendation'">
        <div :class="['rec-card-wrapper', partnerWrapperClass]">
          <!-- A single shared place is always a hero card (the page IS the card).
               In-message cards below follow JinniChat's isChatRecommendation flag. -->
          <div class="recommendation-card large-card"
               @touchstart="handleCardTouchStart($event)" @touchend="handleCardTouchEnd($event)">
            <!-- Image + hover/tap overlay action — same recipe as JinniChat -->
            <div class="rec-image" v-if="rec.image">
              <img :src="getImageUrl(rec.image)" :alt="rec.name" @error="handleImageError" loading="lazy">
              <div class="image-overlay">
                <div class="overlay-actions">
                  <button @click.stop="openInfoModal(rec)" class="text-action-btn info-btn">
                    {{ t('share.more_info') }}
                  </button>
                </div>
              </div>
            </div>
            <!-- Details -->
            <div class="rec-details">
              <div class="rec-header">
                <div class="rec-name">{{ rec.name }}</div>
              </div>
              <div class="rec-type">{{ rec.category || rec.type }}</div>
              <!-- Event date/time row — events only. The single most important
                   fact for a shared event. -->
              <div v-if="isEventRec(rec) && formatEventScheduleCard(rec)" class="rec-event-schedule">
                <svg class="rec-event-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div class="rec-event-schedule-text">
                  <span class="rec-event-schedule-primary">{{ formatEventScheduleCard(rec).primary }}</span>
                  <span v-if="formatEventScheduleCard(rec).secondary" class="rec-event-schedule-secondary">{{ formatEventScheduleCard(rec).secondary }}</span>
                </div>
                <span v-if="rec._isExpired" class="rec-event-ended">{{ t('share.ended') }}</span>
              </div>
              <!-- Imageless cards have no overlay to host the action, so the
                   pill falls back inline. -->
              <button v-if="!rec.image" @click.stop="openInfoModal(rec)" class="more-btn-no-img">{{ t('share.more_info') }}</button>
              <div class="rec-metadata">
                <div v-if="rec.address || rec.location" class="rec-location">{{ rec.address || rec.location }}</div>
              </div>
            </div>
          </div>
          <!-- Partner label -->
          <div v-if="partnerLabel" :class="['partner-label', partnerLabelClass]" v-html="partnerIcon + ' ' + partnerLabel"></div>
        </div>
        <!-- Map for the single shared place. Self-hides if the rec has no
             coordinates (RecommendationMap renders nothing when nothing is
             mappable), so it's safe to always include. -->
        <RecommendationMap
          v-if="rec && rec.name"
          :recommendations="[rec]"
          :theme="theme"
          :allow-routing="false"
          :ip-fallback="false"
          v-bind="mapLabels"
          @marker-click="onMapMarkerClick"
        />
      </template>

      <!-- ══ SCENARIO B: AI message ══ -->
      <template v-else-if="payload.type === 'message'">
        <div class="message-share-card">
          <!-- NEW: Render interleaved contentParts (text + inline rec cards with descriptions) -->
          <template v-if="payload.contentParts && payload.contentParts.length">
            <div class="content-parts-wrapper">
              <template v-for="(part, idx) in payload.contentParts" :key="idx">
                <!-- Text part -->
                <div v-if="part.type === 'text'" class="text message-text">
                  <div v-html="formatTextSegment(part.content)"></div>
                </div>
                <!-- Recommendation part (inline card with description) -->
                <div v-else-if="part.type === 'recommendation' && payload.recommendations && payload.recommendations[part.index]" class="inline-recommendation-wrapper">
                  <div :class="['rec-card-wrapper', getPartnerWrapperClass(payload.recommendations[part.index])]">
                    <div class="recommendation-card inline-card" :class="{ 'large-card': useLargeCards }"
                         @touchstart="handleCardTouchStart($event)" @touchend="handleCardTouchEnd($event)">
                      <!-- Image + hover/tap overlay action — same recipe as JinniChat -->
                      <div class="rec-image" v-if="payload.recommendations[part.index].image">
                        <img :src="getImageUrl(payload.recommendations[part.index].image)" :alt="payload.recommendations[part.index].name" @error="handleImageError" loading="lazy">
                        <div class="image-overlay">
                          <div class="overlay-actions">
                            <button @click.stop="openInfoModal(payload.recommendations[part.index])" class="text-action-btn info-btn">
                              {{ t('share.more_info') }}
                            </button>
                          </div>
                        </div>
                      </div>
                      <!-- Details (includes description) -->
                      <div class="rec-details">
                        <div class="rec-header">
                          <div class="rec-name">{{ payload.recommendations[part.index].name }}</div>
                        </div>
                        <div class="rec-type">{{ payload.recommendations[part.index].category || payload.recommendations[part.index].type }}</div>
                        <!-- Event date/time row — events only. -->
                        <div v-if="isEventRec(payload.recommendations[part.index]) && formatEventScheduleCard(payload.recommendations[part.index])" class="rec-event-schedule">
                          <svg class="rec-event-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <div class="rec-event-schedule-text">
                            <span class="rec-event-schedule-primary">{{ formatEventScheduleCard(payload.recommendations[part.index]).primary }}</span>
                            <span v-if="formatEventScheduleCard(payload.recommendations[part.index]).secondary" class="rec-event-schedule-secondary">{{ formatEventScheduleCard(payload.recommendations[part.index]).secondary }}</span>
                          </div>
                          <span v-if="payload.recommendations[part.index]._isExpired" class="rec-event-ended">{{ t('share.ended') }}</span>
                        </div>
                        <div v-if="payload.recommendations[part.index].description" class="rec-description">
                          {{ payload.recommendations[part.index].description }}
                        </div>
                        <button v-if="!payload.recommendations[part.index].image" @click.stop="openInfoModal(payload.recommendations[part.index])" class="more-btn-no-img">{{ t('share.more_info') }}</button>
                        <div class="rec-metadata">
                          <div v-if="payload.recommendations[part.index].address || payload.recommendations[part.index].location" class="rec-location">
                            {{ payload.recommendations[part.index].address || payload.recommendations[part.index].location }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Partner label -->
                    <div v-if="getPartnerLabel(payload.recommendations[part.index])" :class="['partner-label', getPartnerLabelClass(payload.recommendations[part.index])]" v-html="getPartnerIcon(payload.recommendations[part.index]) + ' ' + getPartnerLabel(payload.recommendations[part.index])"></div>
                  </div>
                </div>
              </template>
            </div>
          </template>

          <!-- LEGACY: Flat recommendations (grid, no descriptions) – for old shares or quick‑action shares -->
          <template v-else-if="payload.recommendations && payload.recommendations.length">
            <div class="message-recs-grid">
              <div
                v-for="(r, i) in payload.recommendations"
                :key="i"
                :class="['rec-card-wrapper', getPartnerWrapperClass(r), 'message-rec-card']"
              >
                <div class="recommendation-card" :class="{ 'large-card': useLargeCards }"
                     @touchstart="handleCardTouchStart($event)" @touchend="handleCardTouchEnd($event)">
                  <!-- Image + hover/tap overlay action — same recipe as JinniChat -->
                  <div class="rec-image" v-if="r.image">
                    <img :src="getImageUrl(r.image)" :alt="r.name" @error="handleImageError" loading="lazy">
                    <div class="image-overlay">
                      <div class="overlay-actions">
                        <button @click.stop="openInfoModal(r)" class="text-action-btn info-btn">
                          {{ t('share.more_info') }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="rec-details">
                    <div class="rec-header">
                      <div class="rec-name">{{ r.name }}</div>
                    </div>
                    <div class="rec-type">{{ r.category || r.type }}</div>
                    <!-- Event date/time row — events only. -->
                    <div v-if="isEventRec(r) && formatEventScheduleCard(r)" class="rec-event-schedule">
                      <svg class="rec-event-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <div class="rec-event-schedule-text">
                        <span class="rec-event-schedule-primary">{{ formatEventScheduleCard(r).primary }}</span>
                        <span v-if="formatEventScheduleCard(r).secondary" class="rec-event-schedule-secondary">{{ formatEventScheduleCard(r).secondary }}</span>
                      </div>
                      <span v-if="r._isExpired" class="rec-event-ended">{{ t('share.ended') }}</span>
                    </div>
                    <button v-if="!r.image" @click.stop="openInfoModal(r)" class="more-btn-no-img">{{ t('share.more_info') }}</button>
                    <div class="rec-metadata">
                      <div v-if="r.address || r.location" class="rec-location">{{ r.address || r.location }}</div>
                    </div>
                  </div>
                </div>
                <div v-if="getPartnerLabel(r)" :class="['partner-label', getPartnerLabelClass(r)]" v-html="getPartnerIcon(r) + ' ' + getPartnerLabel(r)"></div>
              </div>
            </div>
          </template>

          <!-- Fallback: plain message text -->
          <div v-if="payload.message && (!payload.contentParts || !payload.contentParts.length) && (!payload.recommendations || !payload.recommendations.length)" class="message-share-bubble">
            <div class="text message-text" v-html="formattedMessageText"></div>
          </div>

          <!-- Map of every recommendation in this shared message. Coordinates
               already travel in payload.recommendations; the component drops
               any rec without lat/lng and renders nothing when none are
               mappable, so this is safe regardless of the action type
               (restaurants, shopping, photo spots, …). -->
          <RecommendationMap
            v-if="payload.recommendations && payload.recommendations.length"
            :recommendations="payload.recommendations"
            :theme="theme"
            :allow-routing="false"
            :ip-fallback="false"
            v-bind="mapLabels"
            @marker-click="onMapMarkerClick"
          />
        </div>
      </template>

      <!-- ══ SCENARIO C: Itinerary (shared trip plan) ══ -->
      <!-- Uses the SAME markup + classes as <ItineraryView> so the shared page
           is pixel-identical to the in-app trip (read-only: no edit controls). -->
      <template v-else-if="payload.type === 'itinerary' && itin">
        <div class="itin" :class="theme">
          <!-- ═══ Header ═══ -->
          <div class="itin-head">
            <div class="itin-head-main">
              <div class="itin-title">{{ itin.title || itin.destination.name }}</div>
              <div class="itin-sub">
                <span v-if="itin.destination && itin.destination.name">{{ itin.destination.name }}</span>
                <span v-if="itinDateRange"> · {{ itinDateRange }}</span>
              </div>
            </div>
          </div>

          <!-- ═══ Day tabs ═══ -->
          <div class="itin-tabs" role="tablist">
            <button v-for="d in shareDays" :key="d.dayNumber" class="itin-tab" role="tab"
                    :class="{ active: d.dayNumber === activeShareDay }"
                    :style="d.dayNumber === activeShareDay ? {
                      color: dayColor(d.dayNumber),
                      background: dayTint(d.dayNumber, 0.16),
                    } : {}"
                    @click="activeShareDay = d.dayNumber">
              <span>{{ t('share.itinerary.day', { n: d.dayNumber }) }}</span>
              <span v-if="dayDateLabel(d.dayNumber)" class="itin-tab-date">{{ dayDateLabel(d.dayNumber) }}</span>
            </button>
          </div>

          <div v-if="currentShareDay" :key="activeShareDay" class="itin-day">
            <div class="itin-day-title" :style="{ color: dayColor(activeShareDay) }">{{ currentShareDay.title }}</div>

            <!-- ═══ Map of the active day (self-hides if nothing is mappable) ═══
                 public-mode strips every feature that calls an authenticated
                 backend route (the walk/car route-style cycle and the per-card
                 "tap for distance" + turn-by-turn nav), since a share viewer has
                 no Jinni account. What remains needs zero auth: the vector day
                 path, fullscreen, the browse carousel, pin popups (Details +
                 external Google/Yandex directions + Call + Website) and GPS
                 locate-me. -->
            <ItineraryMap
              v-if="shareEnrichedStops.length"
              :stops="shareEnrichedStops"
              :home-base="shareHomeBase"
              :theme="theme"
              route-mode="vector"
              :public-mode="true"
              v-bind="mapLabels"
              :day-color="dayColor(activeShareDay)"
              @view-details="openInfoModal"
            />

            <!-- ═══ Slots ═══ -->
            <div class="itin-slots">
              <div v-for="(slot, idx) in currentShareDay.slots" :key="slot.slotId" class="itin-slot">
                <div class="itin-slot-rail">
                  <span class="itin-slot-num" :style="{ background: dayColor(activeShareDay) }">{{ idx + 1 }}</span>
                  <span v-if="idx < currentShareDay.slots.length - 1" class="itin-slot-line"></span>
                </div>

                <div class="itin-slot-body">
                  <div class="itin-slot-top">
                    <span v-if="slot.time" class="itin-slot-time">{{ slot.time }}</span>
                    <span class="itin-slot-cat">{{ catLabel(slot.category) }}</span>
                  </div>

                  <!-- enriched card (tap → info modal) -->
                  <div v-if="slot.place && slot.place.name" class="itin-card" @click="openInfoModal(slot.place)">
                    <div v-if="getImageUrl(slot.place.image)" class="itin-card-imgwrap">
                      <img class="itin-card-img" :src="getImageUrl(slot.place.image)" :alt="slot.place.name" loading="lazy" @error="$event.target.parentElement.style.display='none'"/>
                    </div>
                    <div class="itin-card-info">
                      <div class="itin-card-name">{{ slot.place.name }}</div>
                      <div v-if="slot.place.region" class="itin-card-region">{{ slot.place.region }}</div>
                      <div v-if="slot.note" class="itin-card-note">{{ slot.note }}</div>
                    </div>
                  </div>

                  <!-- planned-only fallback (never enriched) -->
                  <div v-else class="itin-card itin-card--failed">
                    <div class="itin-card-name">{{ slot.name }}</div>
                    <div v-if="slot.note" class="itin-card-note">{{ slot.note }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── CTA ────────────────────────────────────────────────────── -->
      <div class="share-cta-block">
        <p class="share-cta-text">{{ t('share.cta_question') }}</p>
        <a href="https://jinni.travel/chat" class="cta-btn">{{ t('share.discover') }}</a>
      </div>

    </main>

    <!-- ── Footer ─────────────────────────────────────────────────── -->
    <footer class="share-footer">
      <span>© Jinni</span>
    </footer>

    <!-- ================= INFO MODAL (exactly as in JinniChat.vue) =================
         Teleported to <body> and wrapped in a themed `.share-page` portal so it
         renders ABOVE the map's fullscreen layer (ItineraryMap teleports itself
         to <body> at z-index 4000 when fullscreen). The wrapper re-establishes
         the theme CSS variables the modal relies on; `.share-modal-portal`
         is `display: contents`, so it paints no box of its own. -->
    <Teleport to="body">
      <div v-if="showInfoModal" class="share-page share-modal-portal" :class="theme">
        <div class="info-modal-overlay" @click="closeInfoModal">
      <div class="info-modal" :class="[theme === 'night-mode' ? 'night' : 'day', infoModalTierClass]" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedRec?.name }}</h3>
        </div>
        <div class="modal-body">
          <div class="place-details">
            <!-- Category / type subtitle -->
            <div class="pd-subtitle" v-if="selectedRec?.category || selectedRec?.type">
              {{ selectedRec.category || selectedRec.type }}
            </div>

            <!-- Event schedule (events only) — primary fact, shown first. -->
            <div class="info-row info-row--event" v-if="isEventRec(selectedRec) && formatEventScheduleFull(selectedRec)">
              <span class="label">{{ formatEventScheduleFull(selectedRec).recurring ? t('share.schedule') : t('share.event_date') }}</span>
              <div class="value event-schedule-value">
                <span class="event-schedule-primary">{{ formatEventScheduleFull(selectedRec).primary }}</span>
                <span v-if="formatEventScheduleFull(selectedRec).secondary" class="event-schedule-secondary">{{ formatEventScheduleFull(selectedRec).secondary }}</span>
                <span v-if="selectedRec?._isExpired" class="event-schedule-ended-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ t('share.ended') }}
                </span>
              </div>
            </div>

            <!-- Inline star rating -->
            <div class="pd-rating" v-if="selectedRec?.rating">
              <svg class="pd-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26 6.85.6-5.18 4.52 1.55 6.7L12 17.27 5.88 20.58l1.55-6.7L2.25 8.86l6.85-.6z"/></svg>
              <span class="pd-rating-num">{{ selectedRec.rating }}</span>
              <span class="pd-rating-out">/5</span>
            </div>

            <!-- Quick actions: Directions (primary), Call, Search, Website -->
            <div class="pd-actions">
              <button @click="openInMaps" class="pd-action pd-action--primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                <span>{{ t('place_info.get_directions') }}</span>
              </button>
              <a v-if="selectedRec?.phone" :href="`tel:${selectedRec.phone}`" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{{ t('map.call') }}</span>
              </a>
              <button @click="searchOnline" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>{{ t('place_info.search_online') }}</span>
              </button>
              <a v-if="selectedRec?.website" :href="selectedRec.website" target="_blank" class="pd-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>{{ t('place_info.website') }}</span>
              </a>
            </div>

            <div class="pd-divider"></div>

            <!-- Address -->
            <div class="pd-fact" v-if="selectedRec?.address || selectedRec?.location">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
              <div class="pd-fact-body">{{ selectedRec.address || selectedRec.location }}</div>
            </div>

            <!-- Hours -->
            <div class="pd-fact" v-if="selectedRec?.hours?.length">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
              <div class="pd-fact-body pd-hours">
                <div v-for="(h, i) in hoursParsed" :key="i" class="pd-hours-row">
                  <span class="pd-hours-day">{{ h.day }}</span>
                  <span v-if="h.time" class="pd-hours-time">{{ h.time }}</span>
                </div>
              </div>
            </div>

            <!-- Pricing -->
            <div class="pd-fact" v-if="selectedRec?.pricing">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
              <div class="pd-fact-body">{{ selectedRec.pricing }}</div>
            </div>

            <!-- Email -->
            <div class="pd-fact" v-if="selectedRec?.email">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg></span>
              <div class="pd-fact-body"><a :href="`mailto:${selectedRec.email}`">{{ selectedRec.email }}</a></div>
            </div>

            <!-- Description -->
            <div class="pd-fact pd-fact--desc" v-if="selectedRec?.description && payload.type !== 'message'">
              <span class="pd-fact-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
              <div class="pd-fact-body">{{ selectedRec.description }}</div>
            </div>

            <!-- Highlights -->
            <div class="pd-highlights" v-if="selectedRec?.highlights?.length">
              <div class="pd-highlights-head">{{ t('place_info.highlights') }}</div>
              <div class="pd-highlights-grid">
                <div v-for="h in selectedRec.highlights" :key="h" class="pd-highlight-item">
                  <svg class="pd-highlight-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ h }}</span>
                </div>
              </div>
            </div>

            <!-- Social -->
            <div class="social-links pd-chips" v-if="selectedRec?.socialMedia?.instagram || selectedRec?.socialMedia?.facebook || selectedRec?.socialMedia?.tripadvisor">
              <a v-if="selectedRec.socialMedia?.instagram" :href="selectedRec.socialMedia.instagram" target="_blank" class="social-link social-link--instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </a>
              <a v-if="selectedRec.socialMedia?.facebook" :href="selectedRec.socialMedia.facebook" target="_blank" class="social-link social-link--facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a v-if="selectedRec.socialMedia?.tripadvisor" :href="selectedRec.socialMedia.tripadvisor" target="_blank" class="social-link social-link--tripadvisor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c1.93 0 3.75.58 5.27 1.57l1.6-1.6 1.06 1.06-1.48 1.48A9.44 9.44 0 0 1 21.5 12c0 5.247-4.253 9.5-9.5 9.5S2.5 17.247 2.5 12 6.753 2.5 12 2.5zm0 2a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm-3.5 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3.5 1.5c-.69 0-1.327.212-1.856.574l.67.67a1 1 0 0 1 0 1.414l-.67.67c.53.362 1.166.572 1.856.572s1.326-.21 1.856-.572l-.67-.67a1 1 0 0 1 0-1.414l.67-.67A3.144 3.144 0 0 0 12 12z"/></svg>
                TripAdvisor
              </a>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>




<script>
import RecommendationMap from '@/components/ui/RecommendationMap.vue';
import ItineraryMap from '@/components/ui/ItineraryMap.vue';
import DOMPurify from 'dompurify';
import { isNightTime } from '@/utils/timeUtils';
import { setThemeColorMeta, getThemeColorMeta } from '@/utils/themeColorMeta';
import { useI18n } from 'vue-i18n';

// Locales the app ships (matches the locale JSON files). A share opens in the
// language its creator had set; anything unknown falls back to English.
const SHARE_LOCALES = ['en', 'ru', 'ar', 'zh', 'fr'];
// i18n code → BCP-47 tag for Intl date formatting (weekday / month names).
const LOCALE_TAG = { en: 'en-US', ru: 'ru-RU', ar: 'ar', zh: 'zh-CN', fr: 'fr-FR' };

// Any link that survives sanitisation and opens in a new tab gets
// rel="noopener noreferrer" so a shared (attacker-submittable) payload can't
// reverse-tabnab the opener. Registered once at module load.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Same values as App.vue's THEME_COLORS, and the first stop of each
// .share-page --bg gradient, so the browser chrome blends with the page top.
const SHARE_CHROME = { dark: '#0a0118', light: '#f9f5eb' };

// Per-day accent palette — mirrors ItineraryView so a shared trip keeps the
// same colour coding it had in the app.
const ITIN_DAY_COLORS = ['#7c5cff', '#ff7043', '#26a69a', '#ec407a', '#5c9dff', '#f2b100', '#8d6e63', '#00acc1', '#ab47bc', '#66bb6a'];
// Slot category → English label (the share page is English-only).
const ITIN_CAT = {
  restaurants: 'Food', cafe: 'Café', hotels: 'Hotel', hidden_gems: 'Hidden gem',
  historical: 'Historical', museum: 'Museum', events: 'Event',
  photo_spots: 'Photo spot', viewpoint: 'Viewpoint', shopping: 'Shopping', nature: 'Nature',
  activities: 'Activity',
};

export default {
  name: 'JinniShare',
  components: { RecommendationMap, ItineraryMap },
  setup() {
    // Global i18n scope (same as JinniChat): setting `locale` re-translates the
    // whole page, including the maps (their labels come from `t()`).
    const { t, locale } = useI18n();
    return { t, locale };
  },
  data() {
    return {
      loading: true,
      error: false,
      payload: null,    // { type: 'recommendation'|'message'|'itinerary', rec?, message?, recommendations?, contentParts?, itinerary?, theme? }
      // Decided by the VIEWER's device clock, never by the share payload — a
      // link made at 2am must still read as day mode to someone opening it at
      // noon. Re-evaluated on an interval + on tab focus (see mounted()).
      theme: isNightTime() ? 'night-mode' : 'day-mode',
      showInfoModal: false,
      selectedRec: null,
      showAllHours: false,
      activeShareDay: 1,   // selected day tab for a shared itinerary
    };
  },
  computed: {
    rec() {return this.payload?.rec || {}},
    // BCP-47 tag for Intl date formatting in the active locale.
    localeTag() { return LOCALE_TAG[this.locale] || 'en-US'; },
    // Arabic reads right-to-left; the share page mirrors for it.
    isRtl() { return this.locale === 'ar'; },
    // All translatable strings for <RecommendationMap> / <ItineraryMap>, spread
    // onto each instance via v-bind="mapLabels". Mirrors JinniChat.mapLabels, so
    // a shared map speaks the creator's language. ORS turn-by-turn has no Arabic,
    // but public shares never route (:allow-routing="false" on both map
    // instances), so routeLanguage is moot here.
    mapLabels() {
      const t = this.t;
      const ORS_ROUTE_LANG = { en: 'en', fr: 'fr', ru: 'ru', zh: 'zh' };
      return {
        routeLanguage: ORS_ROUTE_LANG[this.locale] || 'en',
        openFullscreenLabel: t('map.open_fullscreen'),
        closeLabel: t('map.close'),
        locateTitle: t('map.my_location'),
        youAreHereLabel: t('map.you_are_here'),
        locationDeniedLabel: t('map.location_denied'),
        locationUnavailableLabel: t('map.location_unavailable'),
        locationUnsupportedLabel: t('map.location_unsupported'),
        locationApproxLabel: t('map.location_approx'),
        routingLabel: t('map.routing'),
        routeErrorLabel: t('map.route_error'),
        showRouteLabel: t('map.tap_for_distance'),
        modeCarLabel: t('map.mode_car'),
        modeWalkLabel: t('map.mode_walk'),
        detailsLabel: t('map.details'),
        exitRouteLabel: t('map.exit_route'),
        arriveLabel: t('map.arrived'),
        uturnLabel: t('map.uturn'),
        wrongWayLabel: t('map.wrong_way'),
        wrongWayHint: t('map.wrong_way_hint'),
        directionsLabel: t('map.directions'),
        transitLabel: t('map.transit'),
        callLabel: t('map.call'),
        websiteLabel: t('map.website'),
        placeFallbackLabel: t('map.place_fallback'),
        straightLineLabel: t('share.approximate_path'),
        unitKm: t('map.units.km'),
        unitMeter: t('map.units.m'),
        unitMinute: t('map.units.min'),
        unitHour: t('map.units.hour'),
      };
    },
    partnerLabel()      { return this.getPartnerLabel(this.rec); },
    partnerIcon()       { return this.getPartnerIcon(this.rec); },
    partnerLabelClass() { return this.getPartnerLabelClass(this.rec); },
    partnerWrapperClass(){ return this.getPartnerWrapperClass(this.rec); },
    formattedMessageText() {
      const text = this.payload?.message || '';
      const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      // Public share payloads are attacker-submittable → sanitize before v-html.
      return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['strong', 'em', 'a', 'br'], ALLOWED_ATTR: ['href', 'target', 'rel'] });
    },

    // ── Shared itinerary ──────────────────────────────────────────────────────
    itin() { return this.payload?.itinerary || null; },
    shareDays() { return this.itin?.days || []; },
    currentShareDay() {
      return this.shareDays.find(d => d.dayNumber === this.activeShareDay) || this.shareDays[0] || null;
    },
    // Enriched, mappable stops of the active day, shaped for <ItineraryMap>
    // ([{ slotId, time, place }] with finite lat/lng on place).
    shareEnrichedStops() {
      const day = this.currentShareDay;
      if (!day) return [];
      return (day.slots || [])
        .filter(s => s.place && Number.isFinite(s.place.latitude) && Number.isFinite(s.place.longitude))
        .map(s => ({ slotId: s.slotId, time: s.time, place: s.place }));
    },
    shareHomeBase() {
      const hb = this.itin?.homeBase;
      return hb?.name ? { name: hb.name, lat: hb.latitude ?? hb.lat, lng: hb.longitude ?? hb.lng } : null;
    },
    itinDateRange() {
      const it = this.itin;
      if (!it) return '';
      if (!it.startDate) return it.daysCount ? this.t('share.itinerary.days', { count: it.daysCount }) : '';
      const start = new Date(it.startDate);
      const end = new Date(start); end.setDate(end.getDate() + ((it.daysCount || 1) - 1));
      const fmt = (d) => d.toLocaleDateString(this.localeTag, { month: 'short', day: 'numeric' });
      return `${fmt(start)} – ${fmt(end)}`;
    },

    // ── Card size ────────────────────────────────────────────────────────────
    // JinniChat sizes in-message cards off `message.isChatRecommendation`:
    // true → 250px hero ("large-card"), false → ordinary 140px card. The share
    // payload carries the same flag so a shared message renders at the size the
    // sender actually saw. Absent flag ⇒ ordinary, matching JinniChat's default.
    // NOTE: the backend that builds the share payload must forward
    // `isChatRecommendation` for this to be faithful.
    useLargeCards() {
      return this.payload?.isChatRecommendation === true;
    },

    // ── Info modal (place details) ───────────────────────────────────────────
    infoModalTierClass() {
      const rec = this.selectedRec;
      if (!rec) return '';
      const isPartner = rec.verifiedId || (rec.id && String(rec.id).startsWith('db-'));
      if (!isPartner) return '';
      const tier = rec.partnerTier;
      if (tier === 'featured' || tier === 'signature') return 'info-modal--signature';
      if (tier === 'spotlight') return 'info-modal--spotlight';
      return 'info-modal--verified';
    },
    // Split each hours string ("Monday: 9:00–17:00") into day + time columns.
    hoursParsed() {
      const hours = this.selectedRec?.hours;
      if (!Array.isArray(hours)) return [];
      return hours.map((h) => {
        const s = String(h);
        const i = s.indexOf(':');
        return i === -1 ? { day: s, time: '' } : { day: s.slice(0, i).trim(), time: s.slice(i + 1).trim() };
      });
    },
  },
  async mounted() {
    // The share page owns its own theme for as long as it is mounted: it is a
    // public page, so there is no signed-in preference to honour, and App.vue's
    // global theme (driven by the Vuex settings store) can legitimately disagree
    // with what a logged-out viewer should see. Paint the browser chrome to
    // match and restore it on unmount.
    this.applyShareChrome();
    // Catch the day/night boundary while the tab sits open, and re-check on
    // return from background (timers are throttled/suspended there).
    this._themeTimer = setInterval(this.refreshTheme, 60000);
    this._onVisible = () => { if (!document.hidden) this.refreshTheme(); };
    document.addEventListener('visibilitychange', this._onVisible);

    const token = this.$route?.params?.token || window.location.pathname.split('/share/')[1];
    if (!token) { this.error = true; this.loading = false; return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/share/${token}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      this.payload = data;
      // NOTE: data.theme is deliberately ignored. It records the mode the
      // SENDER was in when they created the link, which says nothing about the
      // recipient's time of day.
      // Render the share in the language its creator used. Falls back to the
      // current UI locale (then English) for older shares with no language.
      const lang = data.language;
      if (lang && SHARE_LOCALES.includes(lang)) this.locale = lang;
    } catch {this.error = true} 
    finally {this.loading = false}
  },
  beforeUnmount() {          // beforeDestroy() on Vue 2
    clearInterval(this._themeTimer);
    document.removeEventListener('visibilitychange', this._onVisible);
    this.restoreChrome();
  },
  methods: {
    // ── Theme (viewer's device clock) ─────────────────────────────────────────
    refreshTheme() {
      const next = isNightTime() ? 'night-mode' : 'day-mode';
      if (next !== this.theme) { this.theme = next; this.applyShareChrome(); }
    },
    // Paint <html>/<body> and <meta theme-color> so the browser chrome and any
    // overscroll area match the share, instead of App.vue's global theme. The
    // previous values are stashed once so beforeUnmount can hand control back.
    applyShareChrome() {
      const color = this.theme === 'night-mode' ? SHARE_CHROME.dark : SHARE_CHROME.light;
      if (!this._chromeSaved) {
        this._chromeSaved = {
          dataTheme: document.documentElement.getAttribute('data-theme'),
          htmlBg: document.documentElement.style.backgroundColor,
          bodyBg: document.body.style.backgroundColor,
          meta: getThemeColorMeta(),   // {top, bottom} — pointer-split metas (2026-08-22)
        };
      }
      document.documentElement.setAttribute('data-theme', this.theme === 'night-mode' ? 'dark' : 'light');
      document.documentElement.style.backgroundColor = color;
      document.body.style.backgroundColor = color;
      // Share pages are one flat color — both chrome edges carry it.
      setThemeColorMeta({ top: color, bottom: color });
    },
    restoreChrome() {
      const s = this._chromeSaved;
      if (!s) return;
      if (s.dataTheme === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', s.dataTheme);
      document.documentElement.style.backgroundColor = s.htmlBg;
      document.body.style.backgroundColor = s.bodyBg;
      if (s.meta && (s.meta.top !== null || s.meta.bottom !== null)) {
        setThemeColorMeta({ top: s.meta.top, bottom: s.meta.bottom });
      }
      this._chromeSaved = null;
    },
    getImageUrl(url) {
      if (!url) return null;
      if (url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
      return url;
    },
    handleImageError(e) { e.target.style.display = 'none'; },
    // ── Shared-itinerary helpers ──────────────────────────────────────────────
    dayColor(n) { return ITIN_DAY_COLORS[(n - 1) % ITIN_DAY_COLORS.length]; },
    dayTint(n, a) {
      const int = parseInt(this.dayColor(n).replace('#', ''), 16);
      return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${a})`;
    },
    catLabel(c) {
      const key = `share.itinerary.category.${c}`;
      const label = this.t(key);
      return label === key ? (ITIN_CAT[c] || c) : label;   // fall back if key missing
    },
    dayDateLabel(n) {
      const s = this.itin?.startDate;
      if (!s) return '';
      const d = new Date(s); d.setDate(d.getDate() + (n - 1));
      return d.toLocaleDateString(this.localeTag, { month: 'short', day: 'numeric' });
    },
    // Tapping a map pin opens the same info modal as the card's "More info".
    onMapMarkerClick({ rec }) {
      if (rec) this.openInfoModal(rec);
    },
    // Touch devices have no hover, so a tap on the card reveals .image-overlay
    // for a beat — identical to JinniChat's handleCardTouchStart/End.
    handleCardTouchStart(event) {
      const card = event.currentTarget.closest('.recommendation-card');
      if (card) card.classList.add('touch-active');
    },
    handleCardTouchEnd(event) {
      const card = event.currentTarget.closest('.recommendation-card');
      if (card) setTimeout(() => card.classList.remove('touch-active'), 200);
    },
    openInfoModal(rec) {
      this.selectedRec = rec;
      this.showInfoModal = true;
    },
    closeInfoModal() {
      this.showInfoModal = false;
      this.selectedRec = null;
    },

    // ── Event schedule helpers ────────────────────────────────────────────────
    //  Shared events carry an eventSchedule { startDate, endDate, isRecurring,
    //  timezone }. startDate / endDate are absolute UTC instants; they only
    //  mean a wall-clock time when paired with the venue timezone. We convert
    //  against that zone so a Moscow event reads as "20:00" to anyone opening
    //  the share link, anywhere. A share with no timezone falls back to UTC
    //  display (legacy shares created before the timezone field existed).
    isEventRec(rec) {
      if (!rec) return false;
      if (rec.eventSchedule) return true;
      const cat = String(rec.category || rec.type || '').toLowerCase();
      return cat === 'event' || cat === 'events';
    },
    // Wall-clock parts shown by `timeZone` for an absolute Date.
    _evZonedParts(date, timeZone) {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
      const p = {};
      for (const part of dtf.formatToParts(date)) {
        if (part.type !== 'literal') p[part.type] = parseInt(part.value, 10);
      }
      if (p.hour === 24) p.hour = 0;
      return p;
    },
    // Absolute UTC value -> { y, mo, d, h, mi, weekday } in `timeZone`.
    _evParts(value, timeZone) {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return null;
      const p = this._evZonedParts(date, timeZone || 'UTC');
      const weekday = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
      return { y: p.year, mo: p.month, d: p.day, h: p.hour, mi: p.minute, weekday };
    },
    _evTzLabel(tz) {
      if (!tz) return '';
      return (tz.split('/').pop() || tz).replace(/_/g, ' ');
    },
    // Localised full date from event-parts (weekday + month + day [+ year]),
    // formatted in the active locale so word order is correct everywhere.
    _fmtEvDate(p, withYear) {
      const dt = new Date(Date.UTC(p.y, p.mo - 1, p.d));
      return new Intl.DateTimeFormat(this.localeTag, {
        weekday: 'short', month: 'short', day: 'numeric',
        ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC',
      }).format(dt);
    },
    // Full weekday name in the active locale (0=Sun … 6=Sat).
    _wkLong(weekdayIndex) {
      const ref = new Date(Date.UTC(2023, 0, 1 + weekdayIndex));   // 2023-01-01 was a Sunday
      return new Intl.DateTimeFormat(this.localeTag, { weekday: 'long', timeZone: 'UTC' }).format(ref);
    },
    // Compact { primary, secondary } label for the rec card's event row.
    formatEventScheduleCard(rec) {
      const es = rec?.eventSchedule;
      if (!es?.startDate) return null;
      const tz = es.timezone || 'UTC';
      const start = this._evParts(es.startDate, tz);
      if (!start) return null;
      const pad = (n) => String(n).padStart(2, '0');
      const fmtDate = (p) => this._fmtEvDate(p, false);
      const fmtTime = (p) => `${pad(p.h)}:${pad(p.mi)}`;
      const isFillerStart = (p) => p.h === 0  && p.mi === 0;
      const isFillerEnd   = (p) => p.h === 23 && p.mi === 59;
      const tzTag = es.timezone ? ` (${this._evTzLabel(es.timezone)})` : '';

      if (es.isRecurring) {
        return { primary: this.t('share.event.weekly'), secondary: this.t('share.event.every', { day: this._wkLong(start.weekday) }) };
      }
      const end = this._evParts(es.endDate, tz);
      const sameDay = end && start.y === end.y && start.mo === end.mo && start.d === end.d;
      const showStartTime = !isFillerStart(start);
      const showEndTime   = end && !isFillerEnd(end);

      if (end && !sameDay) {
        return { primary: `${fmtDate(start)} → ${fmtDate(end)}`, secondary: '' };
      }
      if (!showStartTime && !showEndTime) {
        return { primary: fmtDate(start), secondary: this.t('share.event.all_day') };
      }
      const s = showStartTime ? fmtTime(start) : '00:00';
      if (showEndTime) {
        return { primary: fmtDate(start), secondary: `${s} – ${fmtTime(end)}${tzTag}` };
      }
      return { primary: fmtDate(start), secondary: s + tzTag };
    },
    // Longer { primary, secondary, recurring } label for the info modal.
    formatEventScheduleFull(rec) {
      const es = rec?.eventSchedule;
      if (!es?.startDate) return null;
      const tz = es.timezone || 'UTC';
      const start = this._evParts(es.startDate, tz);
      if (!start) return null;
      const pad = (n) => String(n).padStart(2, '0');
      const fmtDate = (p) => this._fmtEvDate(p, true);
      const fmtTime = (p) => `${pad(p.h)}:${pad(p.mi)}`;
      const isFillerStart = (p) => p.h === 0  && p.mi === 0;
      const isFillerEnd   = (p) => p.h === 23 && p.mi === 59;
      const tzTag = es.timezone ? ` (${this._evTzLabel(es.timezone)})` : '';

      if (es.isRecurring) {
        const every = this.t('share.event.every', { day: this._wkLong(start.weekday) });
        const starting = this.t('share.event.starting', { date: fmtDate(start) });
        return { primary: this.t('share.event.weekly'), secondary: `${every}, ${starting}`, recurring: true };
      }
      const end = this._evParts(es.endDate, tz);
      const sameDay = end && start.y === end.y && start.mo === end.mo && start.d === end.d;
      const showStartTime = !isFillerStart(start);
      const showEndTime   = end && !isFillerEnd(end);

      if (!end) {
        return { primary: fmtDate(start), secondary: showStartTime ? fmtTime(start) + tzTag : this.t('share.event.all_day'), recurring: false };
      }
      if (sameDay) {
        if (!showStartTime && !showEndTime) return { primary: fmtDate(start), secondary: this.t('share.event.all_day'), recurring: false };
        const s = showStartTime ? fmtTime(start) : '00:00';
        const e = showEndTime   ? fmtTime(end)   : '23:59';
        return { primary: fmtDate(start), secondary: `${s} – ${e}${tzTag}`, recurring: false };
      }
      const sb = showStartTime ? `${fmtDate(start)} · ${fmtTime(start)}` : fmtDate(start);
      const eb = showEndTime   ? `${fmtDate(end)} · ${fmtTime(end)}`     : fmtDate(end);
      return { primary: `${sb} → ${eb}${tzTag}`, secondary: '', recurring: false };
    },
    // Get Directions (Google Maps)
    openInMaps() {
      const rec = this.selectedRec;
      if (!rec) return;
      let url = 'https://www.google.com/maps';
      if (rec.latitude && rec.longitude) {url = `https://www.google.com/maps/search/?api=1&query=${rec.latitude},${rec.longitude}`} 
      else if (rec.address || rec.location) {url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.address || rec.location)}`} 
      else if (rec.name) {url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.name)}`}
      window.open(url, '_blank');
    },
    // Search Online (Google search)
    searchOnline() {
      const rec = this.selectedRec;
      if (!rec) return;
      const query = encodeURIComponent(`${rec.name}`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    },
    formatTextSegment(text) {
      if (!text) return '';
      let formatted = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>').replace(/\n/g, '<br>');
      // Public share payloads are attacker-submittable → sanitize before v-html.
      return DOMPurify.sanitize(formatted, { ALLOWED_TAGS: ['strong', 'em', 'a', 'br'], ALLOWED_ATTR: ['href', 'target', 'rel'] });
    },
    // Partner helpers
    getPartnerLabel(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return '';
      const tier = rec.partnerTier;
      if (tier === 'featured' || tier === 'signature') return this.t('map.tier_signature');
      if (tier === 'spotlight') return this.t('map.tier_spotlight');
      return this.t('map.tier_verified');
    },
    getPartnerIcon(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return '';
      const tier = rec.partnerTier;
      if (tier === 'featured' || tier === 'signature') return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      if (tier === 'spotlight') return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/></svg>`;
      return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
    },
    getPartnerLabelClass(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return '';
      const tier = rec.partnerTier;
      if (tier === 'featured' || tier === 'signature') return 'partner-label--signature';
      if (tier === 'spotlight') return 'partner-label--spotlight';
      return 'partner-label--verified';
    },
    getPartnerWrapperClass(rec) {
      if (!rec?.verifiedId && !rec?.id?.startsWith('db-')) return '';
      const tier = rec.partnerTier;
      if (tier === 'featured' || tier === 'signature') return 'card-glow--signature';
      if (tier === 'spotlight') return 'card-glow--spotlight';
      return 'card-glow--verified';
    }
  }
};
</script>




<style scoped>
/* ═══════════════════════════════════════════════════════════════════
   THEME VARIABLES
═══════════════════════════════════════════════════════════════════ */
.share-page.night-mode {
  --bg:           linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%);
  --surface:      #1e1438;
  --surface2:     #241845;
  --border:       rgba(139,92,246,0.2);
  --text:         #e2e8f0;
  --text-muted:   #94a3b8;
  --gold:         #D4AF37;
  --text-address: #828f9e;
  --accent:       #c084fc;
  --card-shadow:  rgba(139,92,246,0.2);
  --rec-bg:       #1e1438;
  --btn-bg:       linear-gradient(45deg,#7c3aed,#6d28d9);
  --btn-hover:    linear-gradient(45deg,#8b5cf6,#7c3aed);
  --header-bg:    transparent;
}
.share-page.day-mode {
  --bg:           linear-gradient(180deg,#f9f5eb 0%,#f5edda 55%,#efe4cf 100%);
  --surface:      #ffffff;
  --surface2:     #f9f5eb;
  --border:       rgba(212,175,55,0.25);
  --text:         #3c2a1e;
  --text-muted:   #5a4a42;
  --text-address: #828f9e;
  --gold:         #D4AF37;
  --accent:       #A0522D;
  --card-shadow:  rgba(160,82,45,0.1);
  --rec-bg:       rgba(255,255,255,0.95);
  --btn-bg:       linear-gradient(45deg,#D4AF37,#FF8C00);
  --btn-hover:    linear-gradient(45deg,#c79e2e,#e67d00);
  /* Transparent, same as night mode. A near-opaque cream fill sat as a flat
     constant band on top of the --bg gradient instead of blending with it.
     The header isn't sticky, so it needs no backdrop of its own. */
  --header-bg:    transparent;
}



/* 100vh on iOS Safari measures the viewport with the URL bar HIDDEN, so the
   page is taller than what you can actually see and picks up a phantom scroll.
   dvh tracks the live viewport; the vh line stays as a fallback for old
   browsers, which must come first so dvh wins where supported. */
.share-page { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: inherit; }
.share-header { align-items: center; justify-content: center; top: 0; background: var(--header-bg); }
.share-header-inner { max-width: 800px; margin: 0 auto; padding: 30px 20px 10px 20px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
.brand { display: flex; align-items: center; gap: 8px; }
.brand-icon { width: 72px; height: 72px; object-fit: contain; }
.header-cta { padding: 7px 18px; border-radius: 20px; background: var(--btn-bg); color: white; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
.header-cta:hover { opacity: 0.85; }
.share-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 60px 20px; }

/* Loading / expired: the header logo and the © footer are decorative here, and
   the header (~90px) outweighs the footer (~48px), so plain flex centring lands
   the block ~20px below the optical centre. Taking both out of the flow lets
   .share-center own the full viewport height and centre for real. */
.share-page--centered { position: relative; }
.share-page--centered .share-header,
.share-page--centered .share-footer { position: absolute; left: 0; right: 0; }
.share-page--centered .share-header { top: 0; }
.share-page--centered .share-footer { bottom: 0; }
.share-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.9s linear infinite; }
.share-loading-text { color: var(--text-muted); font-size: 0.9rem; }
.share-error-icon { font-size: 2.5rem; }
.share-error-title { font-size: 1rem; color: var(--text-muted); text-align: center; }
/* Mirrors JinniChat's `.chat-messages` content box (max-width 800px, 20px
   horizontal padding) so a shared card is the same width as the one the
   sender saw. Vertical padding is share-specific. */
.share-main { flex: 1; max-width: 800px; width: 100%; margin: 0 auto; padding: 30px 20px 30px 20px; display: flex; flex-direction: column; gap: 20px; box-sizing: border-box; }
.share-attribution { display: inline-flex; align-items: center; gap: 6px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 5px 12px 5px 8px; font-size: 0.78rem; color: var(--text-muted); align-self: flex-start; }
.attr-icon { width: 18px; height: 18px; object-fit: contain; }
.share-attribution strong { color: var(--gold); }
.rec-card-wrapper { display: flex; flex-direction: column; align-items: stretch; border-radius: 12px; width: 100%; }
.recommendation-card { position: relative; border-radius: 12px; overflow: hidden; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; height: 100%; flex: 1 1 auto; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }
.share-page.night-mode .recommendation-card, .share-page.night-mode .large-card { background: rgba(139,92,246,0.10); box-shadow: 0 0 1px rgba(0,0,0,0.45), inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.share-page.day-mode .recommendation-card, .share-page.day-mode .large-card { background: rgba(255,255,255,0.5); box-shadow: 0 0 10px rgba(139,69,19,0.05), inset 0 0 0 1px rgba(255,255,255,0.6); }
.large-card { display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }
.large-card .rec-image { height: 250px; }
.large-card .rec-details { padding: 16px; }
.large-card .rec-name { font-size: 1.3rem; font-weight: 600; margin-bottom: 8px; }
.large-card .rec-type { font-size: 1rem; margin-bottom: 5px; font-weight: 500; }
.large-card .rec-description { margin-bottom: 5px; line-height: 1.5; color: #666; }
.large-card .rec-metadata { display: flex; flex-direction: column; }
.large-card .rec-distance, .large-card .rec-location { font-size: 0.9rem; }
.large-card .text-action-btn { padding: 10px 16px; }
.large-card .overlay-actions { gap: 15px; }
.rec-image { height: 140px; overflow: hidden; position: relative; flex-shrink: 0; }
.rec-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; opacity: 0; animation: fadeIn 0.5s ease-in forwards; }
.rec-image-placeholder { display: flex; align-items: center; justify-content: center; background: var(--surface2); }
.image-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3)); display: flex; align-items: center; justify-content: center; opacity: 0; z-index: 2; }
.recommendation-card:hover .image-overlay { opacity: 1; }
.overlay-actions { display: flex; gap: 10px; }
.text-action-btn { padding: 8px; border: none; border-radius: 25px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.25s ease; min-width: 80px; text-align: center; backdrop-filter: blur(1px) saturate(160%); -webkit-backdrop-filter: blur(1px) saturate(160%); }
/* info-btn colours are themed below (share-page.night-mode / .day-mode),
   mirroring JinniChat's .genie-chat-container scoping. */
.rec-details { padding: 8px 12px 6px 12px; }
.rec-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.rec-name { font-weight: 500; margin-bottom: 4px; flex: 1; line-height: 1.3; }
.rec-type { font-size: 0.8rem; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
/* Themed per mode like JinniChat (tier overrides further down win over these). */
.share-page.night-mode .rec-type { color: #c084fc; }
.share-page.day-mode .rec-type { color: #A0522D; }
/* ── Event date/time row (events only) — JinniChat recipe ──────────────── */
.rec-event-schedule { display: flex; align-items: center; gap: 5px; margin-top: 3px; font-variant-numeric: tabular-nums; }
.rec-event-icon { flex-shrink: 0; opacity: 0.85; }
.share-page.night-mode .rec-event-icon, .share-page.night-mode .rec-event-schedule-primary { color: #c084fc; }
.share-page.day-mode .rec-event-icon, .share-page.day-mode .rec-event-schedule-primary { color: #b87333; }
.rec-event-schedule-text { display: flex; align-items: baseline; gap: 6px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.rec-event-schedule-primary { font-size: 0.8rem; font-weight: 600; }
.rec-event-schedule-secondary { font-size: 0.78rem; opacity: 0.7; }
.rec-event-schedule-secondary::before { content: "·"; margin-right: 6px; opacity: 0.6; font-weight: 600; }
.large-card .rec-event-schedule-primary { font-size: 0.9rem; }
.large-card .rec-event-schedule-secondary { font-size: 0.86rem; }
.rec-event-ended { display: inline-flex; align-items: center; padding: 1px 8px; border-radius: 10px; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: rgba(168,162,158,0.18); color: #a8a29e; margin-left: auto; flex-shrink: 0; align-self: center; }
/* Event row inside the info modal — JinniChat recipe */
.info-modal .info-row--event .value.event-schedule-value { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; }
.event-schedule-primary { font-weight: 600; font-size: 0.95rem; }
.event-schedule-secondary { opacity: 0.75; font-size: 0.88rem; }
.event-schedule-ended-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 14px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: rgba(168,162,158,0.18); color: #a8a29e; margin-left: auto; }
.rec-metadata { display: flex; flex-direction: column; gap: 3px; padding: 6px 0 0 0 }
.rec-location, .rec-rating { font-size: 0.8rem; color: var(--text-address); }
.rec-rating { color: var(--gold); }
.partner-label { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.68rem; font-weight: 400; letter-spacing: 0.03em; text-align: center; pointer-events: none; opacity: 0.85; flex-shrink: 0; }
.partner-label svg { flex-shrink: 0; vertical-align: middle; }
.night-mode .partner-label--verified { color: #22c556b1; }
.day-mode .partner-label--verified { color: #22c556ea; }
.partner-label--spotlight { color: #3b9fdda2; }
.night-mode .partner-label--signature { color: #ffbf0085; }
.day-mode .partner-label--signature { color: #d39510; }
/* ── Card glow per tier — JinniChat recipe (inset ring + tinted glass) ──── */
.card-glow--verified .recommendation-card,
.card-glow--spotlight .recommendation-card,
.card-glow--signature .recommendation-card { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12); }
.share-page.night-mode .card-glow--verified .recommendation-card { background: rgba(34,197,94,0.15); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.share-page.night-mode .card-glow--verified .rec-type { color: #22c556b1; }
.share-page.night-mode .card-glow--spotlight .recommendation-card { background: rgba(59,158,221,0.1); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.share-page.night-mode .card-glow--spotlight .rec-type { color: #3b9fdda2; }
.share-page.night-mode .card-glow--signature .recommendation-card { background: rgba(212,175,55,0.2); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.share-page.night-mode .card-glow--signature .rec-type { color: #ffbf0085; }
.share-page.day-mode .card-glow--verified .recommendation-card { background: rgba(34,197,94,0.15); box-shadow: inset 0 0 0 0.7px rgba(34,197,94,0.2); }
.share-page.day-mode .card-glow--verified .rec-type { color: #22c556ea; }
.share-page.day-mode .card-glow--spotlight .recommendation-card { background: rgba(59,158,221,0.2); box-shadow: inset 0 0 0 0.7px rgba(59,158,221,0.2); }
.share-page.day-mode .card-glow--spotlight .rec-type { color: #3b9fdda2; }
.share-page.day-mode .card-glow--signature .recommendation-card { background: rgba(212,175,55,0.2); box-shadow: inset 0 0 0 0.7px rgba(212,175,55,0.2); }
.share-page.day-mode .card-glow--signature .rec-type { color: #d39510; }
.message-share-card { display: flex; flex-direction: column; gap: 16px; }
.message-share-bubble { background: transparent; padding: 18px 0; }
.text { line-height: 1.5; word-wrap: break-word; }
.message-text { color: var(--text-muted); }
.message-text :deep(strong) { font-weight: 600; color: var(--text); }
.message-recs-label { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: -8px; }
.message-rec-card { width: 100%; }
.message-recs-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 600px) { .message-recs-grid { grid-template-columns: repeat(2, 1fr); } .message-recs-grid .rec-card-wrapper:has(.large-card) { grid-column: 1 / -1; } }
.inline-recommendation-wrapper { margin: 16px 0; display: flex; justify-content: flex-start; }
.recommendation-card.inline-card { width: 100%; border-radius: 12px; overflow: hidden; }
/* Description sizing/colour comes from `.large-card .rec-description` above so
   it matches JinniChat exactly; only the ordinary-card spacing is share-local. */
.recommendation-card:not(.large-card) .rec-description { margin: 6px 0; line-height: 1.5; color: var(--text-muted); }
.share-page.night-mode .large-card .rec-description { color: #94a3b8; }
.share-page.day-mode .large-card .rec-description { color: #5a4a42; }
/* ── Overlay action button (ported from JinniChat, rescoped to .share-page) ── */
.share-page.night-mode .text-action-btn.info-btn { background: rgba(255,255,255,0.3); color: #e2e8f0; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.share-page.night-mode .text-action-btn.info-btn:hover { background: rgba(255,255,255,0.35); color: #f1f5f9; box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.1); }
.share-page.day-mode .text-action-btn.info-btn { background: rgba(255,255,255,0.3); color: white; box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.6); }
.share-page.day-mode .text-action-btn.info-btn:hover { background: rgba(255,255,255,0.4); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.9); }
.share-page.night-mode .card-glow--verified .text-action-btn.info-btn { background: rgba(34,197,94,0.3); box-shadow: inset 0 0 0 0.7px rgba(34,197,94,0.3); }
.share-page.night-mode .card-glow--verified .text-action-btn.info-btn:hover { background: rgba(34,197,94,0.35); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.4); }
.share-page.night-mode .card-glow--spotlight .text-action-btn.info-btn { background: rgba(59,158,221,0.3); box-shadow: inset 0 0 0 0.7px rgba(59,158,221,0.3); }
.share-page.night-mode .card-glow--spotlight .text-action-btn.info-btn:hover { background: rgba(59,158,221,0.4); box-shadow: inset 0 0 0 1px rgba(59,158,221,0.4); }
.share-page.night-mode .card-glow--signature .text-action-btn.info-btn { background: rgba(212,175,55,0.3); box-shadow: inset 0 0 0 0.7px rgba(212,175,55,0.3); }
.share-page.night-mode .card-glow--signature .text-action-btn.info-btn:hover { background: rgba(212,175,55,0.4); box-shadow: inset 0 0 0 0.8px rgba(212,175,55,0.6); }
.share-page.day-mode .card-glow--verified .text-action-btn.info-btn { background: rgba(34,197,94,0.3); color: white; box-shadow: inset 0 0 0 0.7px rgba(34,197,94,0.3); }
.share-page.day-mode .card-glow--verified .text-action-btn.info-btn:hover { background: rgba(34,197,94,0.45); box-shadow: inset 0 0 0 0.8px rgba(34,197,94,0.6); }
.share-page.day-mode .card-glow--spotlight .text-action-btn.info-btn { background: rgba(59,158,221,0.3); color: white; box-shadow: inset 0 0 0 0.7px rgba(59,158,221,0.3); }
.share-page.day-mode .card-glow--spotlight .text-action-btn.info-btn:hover { background: rgba(59,158,221,0.45); box-shadow: inset 0 0 0 0.8px rgba(59,158,221,0.6); }
.share-page.day-mode .card-glow--signature .text-action-btn.info-btn { background: rgba(212,175,55,0.3); color: white; box-shadow: inset 0 0 0 0.7px rgba(212,175,55,0.3); }
.share-page.day-mode .card-glow--signature .text-action-btn.info-btn:hover { background: rgba(212,175,55,0.45); box-shadow: inset 0 0 0 0.8px rgba(212,175,55,0.6); }

.more-btn-no-img { border: none; border-radius: 20px; padding: 8px 14px; cursor: pointer; font-size: 0.8rem; font-weight: 500; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: all 0.2s ease; }
.share-page.night-mode .more-btn-no-img { color: #d5dce4; background: rgba(255,255,255,0.06); box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1); }
.share-page.night-mode .more-btn-no-img:hover { background: rgba(255,255,255,0.14); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.share-page.day-mode .more-btn-no-img { color: #8b6b3d; background: rgba(255,255,255,0.5); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.share-page.day-mode .more-btn-no-img:hover { color: #5a4a42; background: rgba(255,255,255,0.75); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9); }
/* Teleported modal portal — carries the theme vars (via .share-page.<theme>)
   but produces no box, so only the overlay inside it paints. */
.share-modal-portal { display: contents; }
/* z-index 100000 (JinniChat's value) sits above ItineraryMap's fullscreen
   layer (4000), so the info modal is visible even while the map is fullscreen. */
/* No padding here — JinniChat's overlay has none, and `width: 90%` below
   resolves against the overlay's content box. A 20px inset made the modal
   ~36px narrower than the in-app one on a 390px phone. */
.info-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100000; }
.info-modal { border-radius: 12px; max-width: 500px; width: 90%; overflow: hidden; position: relative; }
.info-modal.night { background: rgba(30,20,56,0.85); color: #e2e8f0; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); box-shadow: 0 0 5px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.08); }
.info-modal.day { background: rgba(255,255,255,0.85); color: #2d3748; backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: none; box-shadow: 0 0 30px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.6); }
/* Floating, transparent header — the body scrolls underneath and dissolves */
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 12px 8px 18px; }
.info-modal .modal-header { position: absolute; top: 0; left: 0; right: 0; z-index: 4; background: transparent; border: none; pointer-events: none; padding: 14px 20px 8px 20px; }
.info-modal .modal-header h3, .info-modal .modal-header .close-btn { pointer-events: auto; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 600; background: linear-gradient(0deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.info-modal.night .modal-header h3 { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.close-btn { background: transparent; border: none; color: #aaa; border-radius: 6px; padding: 5px; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: background 0.2s; }
.info-modal.night .close-btn:hover { background: #2a1f4d; }
.info-modal.day .close-btn:hover { background: rgba(0,0,0,0.06); }
.modal-body { padding: 0 20px 20px 20px; max-height: 60vh; overflow-y: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
.info-modal .modal-body { padding-top: 54px; -webkit-mask-image: linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.4) 20px, #000 52px, #000 calc(100% - 16px), rgba(0,0,0,0.45) calc(100% - 6px), transparent 100%); mask-image: linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.4) 20px, #000 52px, #000 calc(100% - 16px), rgba(0,0,0,0.45) calc(100% - 6px), transparent 100%); }
.info-modal.night .modal-body::-webkit-scrollbar { width: 4px; }
.info-modal.night .modal-body::-webkit-scrollbar-track { background: transparent; }
.info-modal.night .modal-body::-webkit-scrollbar-thumb { border-radius: 4px; background: rgba(192,132,252,0.1); }
.info-modal.night .modal-body::-webkit-scrollbar-thumb:hover { background: rgba(192,132,252,0.3); }
.info-modal.day .modal-body::-webkit-scrollbar { width: 8px; }
.info-modal.day .modal-body::-webkit-scrollbar-track { background: transparent; }
.info-modal.day .modal-body::-webkit-scrollbar-thumb { border-radius: 4px; background: rgba(160,82,45,0.3); }
.info-modal.day .modal-body::-webkit-scrollbar-thumb:hover { background: rgba(160,82,45,0.5); }
.place-details { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; flex-direction: column; }
.label { font-weight: 600; color: #4a5568; font-size: 0.875rem; }
.value { color: #2d3748; line-height: 1.5; font-size: 0.85rem; word-break: break-word; }
.value a { color: #D4AF37; text-decoration: none; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.value a:hover { text-decoration: underline; color: #FF8C00; }
.info-modal.night .label, .info-modal.night .value, .info-modal.night .btn-secondary { color: #e2e8f0; }
.info-modal.night .value a { background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.info-modal.day .label { background: linear-gradient(0deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.info-modal.day .value { color: #3c2a1e; }
.modal-actions { display: flex; padding: 12px 0 0 0; gap: 20px; }
.btn-primary { flex: 1; padding: 10px; background: linear-gradient(45deg, #D4AF37, #FF8C00); color: white; border: none; border-radius: 25px; font-weight: 500; font-size: 0.9rem; cursor: pointer; }
.btn-primary:hover { box-shadow: 0 0 6px rgba(212,175,55,1); }
.btn-secondary { flex: 1; padding: 10px; background: transparent; border-radius: 25px; color: #4a5568; font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; }
.info-modal .btn-primary, .info-modal .btn-secondary { backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: all 0.2s ease; }
.info-modal.night .btn-primary { background: linear-gradient(45deg, rgba(212,175,55,0.6), rgba(255,140,0,0.6)); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.info-modal.night .btn-primary:hover { background: linear-gradient(45deg, rgba(212,175,55,0.7), rgba(255,140,0,0.7)); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.2); }
.info-modal.day .btn-primary { background: linear-gradient(45deg, rgba(212,175,55,0.5), rgba(255,140,0,0.5)); color: #fff; box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.35); }
.info-modal.day .btn-primary:hover { background: linear-gradient(45deg, rgba(212,175,55,0.72), rgba(255,140,0,0.72)); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.4); }
.info-modal.night .btn-secondary { color: #d5dce4; background: rgba(255,255,255,0.06); border: none; box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1); }
.info-modal.night .btn-secondary:hover { background: rgba(255,255,255,0.14); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.info-modal.day .btn-secondary { color: #8b6b3d; background: rgba(255,255,255,0.5); border: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.info-modal.day .btn-secondary:hover { color: #5a4a42; background: rgba(255,255,255,0.75); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9); }
.highlights-list { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 2px; }
.highlight-tag { font-size: 11px; padding: 2px 8px; border-radius: 20px; background: rgba(139,92,246,0.12); color: #a78bfa; }
.info-modal.night .highlight-tag { background: rgba(192,132,252,0.12); color: #e7defb; box-shadow: inset 0 0 0 0.8px rgba(192,132,252,0.22); }
.info-modal.day .highlight-tag { background: rgba(212,175,55,0.14); color: #7a5f1e; box-shadow: inset 0 0 0 1px rgba(212,175,55,0.28); }
.social-links { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 2px; }
.social-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px; text-decoration: none; transition: opacity 0.15s; }
.social-link:hover { opacity: 0.8; }
.social-link--instagram { background: rgba(225,48,108,0.12); color: #e1306c; }
.social-link--facebook { background: rgba(24,119,242,0.12); color: #1877f2; }
.social-link--tripadvisor { background: rgba(52,168,83,0.12); color: #34a853; }
.info-modal.night .social-link { background: rgba(255,255,255,0.06); color: #d5dce4; box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1); }
.info-modal.night .social-link:hover { background: rgba(255,255,255,0.14); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); opacity: 1; }
.info-modal.day .social-link { background: rgba(255,255,255,0.55); color: #6b5840; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7); }
.info-modal.day .social-link:hover { background: rgba(255,255,255,0.8); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95); opacity: 1; }

/* ═══════════════════════════════════════════════════════════════════
   PLACE-DETAILS (pd-*) — ported verbatim from JinniChat.vue so the
   shared info modal is pixel-identical to the in-app one. The block is
   already scoped under .info-modal.night / .info-modal.day in JinniChat,
   so it drops in unchanged (no .genie-chat-container rescoping needed).
   Keep in sync with JinniChat's "Glacier place-details" section.
═══════════════════════════════════════════════════════════════════ */
.info-modal .place-details { gap: 14px; }
.pd-subtitle { font-size: 0.82rem; opacity: 0.6; margin-top: -2px; text-transform: capitalize; }
.pd-rating { display: flex; align-items: center; gap: 6px; font-size: 1rem; font-weight: 600; }
.pd-star { width: 16px; height: 16px; flex-shrink: 0; color: #f5b301; }
.pd-rating-out { opacity: 0.5; font-weight: 400; margin-left: -3px; }
.pd-rating .review-count { font-weight: 400; opacity: 0.6; margin-left: 2px; }
.pd-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.pd-action { display: inline-flex; align-items: center; gap: 7px; padding: 9px 15px; border-radius: 22px; font-size: 0.85rem; font-weight: 600; line-height: 1; cursor: pointer; border: none; text-decoration: none; white-space: nowrap; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: all 0.2s ease; }
.pd-action svg { width: 16px; height: 16px; flex-shrink: 0; }
.pd-action:active { transform: scale(0.96); }
.pd-divider { height: 1px; width: 100%; margin: 2px 0; }
.pd-fact { display: flex; gap: 12px; align-items: flex-start; }
.pd-fact-ic { flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; }
.pd-fact-ic svg { width: 17px; height: 17px; }
.pd-fact-body { flex: 1; min-width: 0; font-size: 0.92rem; line-height: 1.45; }
.pd-fact-body a { text-decoration: none; }
.pd-fact--desc .pd-fact-body { opacity: 0.82; font-size: 0.88rem; }
.pd-fact .hours-list div { padding: 2px 0; }
.pd-chips { display: flex; flex-wrap: wrap; gap: 6px; }
/* night */
.info-modal.night .pd-action { background: rgba(255,255,255,0.06); color: #d5dce4; box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1); }
.info-modal.night .pd-action:hover { background: rgba(255,255,255,0.14); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.info-modal.night .pd-action--primary { background: linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7)); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12); }
.info-modal.night .pd-action--primary:hover { background: linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8)); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.2); }
.info-modal.night .pd-divider { background: rgba(255,255,255,0.08); }
.info-modal.night .pd-fact-ic { color: #c9b8ff; }
.info-modal.night .pd-fact-body a { background: linear-gradient(45deg,#D4AF37,#FF8C00); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
/* day */
.info-modal.day .pd-action { background: rgba(255,255,255,0.55); color: #8b6b3d; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7); }
.info-modal.day .pd-action:hover { background: rgba(255,255,255,0.8); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.95); }
.info-modal.day .pd-action--primary { background: linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8)); color: #fff; box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.4); }
.info-modal.day .pd-action--primary:hover { background: linear-gradient(45deg,rgba(212,175,55,0.9),rgba(255,140,0,0.9)); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.45); }
.info-modal.day .pd-divider { background: rgba(150,100,40,0.14); }
.info-modal.day .pd-fact-ic { color: #b87a2a; }
.info-modal.day .pd-fact-body a { color: #b8860b; }

/* ── Glacier social links (frosted pill, brand-tinted icon) ───────────── */
.info-modal .social-link { padding: 6px 12px; border-radius: 20px; font-weight: 600; gap: 6px; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: all 0.18s ease; }
.info-modal .social-link svg { flex-shrink: 0; }
.info-modal .social-link--instagram svg { color: #e1306c; }
.info-modal .social-link--facebook svg { color: #1877f2; }
.info-modal .social-link--tripadvisor svg { color: #22a06b; }

/* ── Highlights showcase panel ────────────────────────────────────────── */
.pd-highlights { border-radius: 16px; padding: 12px 14px 13px; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.pd-highlights-head { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.7; margin-bottom: 10px; }
.info-modal.night .pd-highlights { background: rgba(255,255,255,0.04); box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.08); }
.info-modal.day .pd-highlights { background: rgba(255,255,255,0.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.pd-highlights-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 10px 16px; }
.pd-highlight-item { display: flex; align-items: flex-start; gap: 9px; font-size: 0.9rem; line-height: 1.35; font-weight: 500; }
.info-modal .pd-highlight-check { width: 15px; height: 15px; margin-top: 1px; }

/* ── Hours schedule (day left, time right) ───────────────────────────── */
.pd-hours { display: flex; flex-direction: column; width: 100%; }
.pd-hours-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 6px 0; }
.pd-hours-row:first-child { padding-top: 0; }
.pd-hours-row + .pd-hours-row { border-top: 1px solid transparent; }
.pd-hours-day { font-weight: 600; white-space: nowrap; }
.pd-hours-time { opacity: 0.72; text-align: right; font-variant-numeric: tabular-nums; }
.info-modal.night .pd-hours-row + .pd-hours-row { border-top-color: rgba(255,255,255,0.08); }
.info-modal.day .pd-hours-row + .pd-hours-row { border-top-color: rgba(150,100,40,0.13); }

/* ── Tier tints: verified / spotlight / signature ─────────────────────── */
/* Applied via infoModalTierClass(). Only `background` is overridden so the
   base modal box-shadow / inset highlight survives. */
/* — VERIFIED (green) — */
.info-modal.night.info-modal--verified { background: linear-gradient(rgba(34,197,94,0.13),rgba(34,197,94,0.13)), rgba(30,20,56,0.84); }
.info-modal.day.info-modal--verified { background: linear-gradient(rgba(34,197,94,0.10),rgba(34,197,94,0.10)), rgba(255,255,255,0.85); }
.info-modal--verified.night .modal-header h3, .info-modal--verified.night .label { background: linear-gradient(45deg,#34d399,#22c55e); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.info-modal--verified.day .modal-header h3, .info-modal--verified.day .label { background: linear-gradient(45deg,#16a34a,#15803d); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.info-modal--verified.night .pd-fact-ic { color: #4ade80; }
.info-modal--verified.day .pd-fact-ic { color: #16a34a; }
.info-modal--verified.night .pd-action--primary { background: linear-gradient(45deg,rgba(34,197,94,0.7),rgba(16,185,129,0.7)); }
.info-modal--verified.night .pd-action--primary:hover { background: linear-gradient(45deg,rgba(34,197,94,0.8),rgba(16,185,129,0.8)); }
.info-modal--verified.day .pd-action--primary { background: linear-gradient(45deg,rgba(34,197,94,0.8),rgba(16,185,129,0.8)); }
.info-modal--verified.day .pd-action--primary:hover { background: linear-gradient(45deg,rgba(34,197,94,0.9),rgba(16,185,129,0.9)); }
.info-modal--verified.night .highlight-tag { background: rgba(34,197,94,0.14); box-shadow: inset 0 0 0 0.8px rgba(34,197,94,0.3); }
.info-modal--verified.day .highlight-tag { background: rgba(34,197,94,0.13); color: #15803d; box-shadow: inset 0 0 0 1px rgba(34,197,94,0.32); }
.info-modal--verified .info-row--event { background: linear-gradient(135deg,rgba(34,197,94,0.16),rgba(16,185,129,0.07)); }
/* — SPOTLIGHT (blue) — */
.info-modal.night.info-modal--spotlight { background: linear-gradient(rgba(59,158,221,0.15),rgba(59,158,221,0.15)), rgba(30,20,56,0.84); }
.info-modal.day.info-modal--spotlight { background: linear-gradient(rgba(59,158,221,0.11),rgba(59,158,221,0.11)), rgba(255,255,255,0.85); }
.info-modal--spotlight.night .modal-header h3, .info-modal--spotlight.night .label { background: linear-gradient(45deg,#5cb3e8,#3b9fdd); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.info-modal--spotlight.day .modal-header h3, .info-modal--spotlight.day .label { background: linear-gradient(45deg,#2b85c0,#1f6ea8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.info-modal--spotlight.night .pd-fact-ic { color: #5cb3e8; }
.info-modal--spotlight.day .pd-fact-ic { color: #2b85c0; }
.info-modal--spotlight.night .pd-action--primary { background: linear-gradient(45deg,rgba(59,158,221,0.7),rgba(37,128,190,0.7)); }
.info-modal--spotlight.night .pd-action--primary:hover { background: linear-gradient(45deg,rgba(59,158,221,0.8),rgba(37,128,190,0.8)); }
.info-modal--spotlight.day .pd-action--primary { background: linear-gradient(45deg,rgba(59,158,221,0.8),rgba(37,128,190,0.8)); }
.info-modal--spotlight.day .pd-action--primary:hover { background: linear-gradient(45deg,rgba(59,158,221,0.9),rgba(37,128,190,0.9)); }
.info-modal--spotlight.night .highlight-tag { background: rgba(59,158,221,0.14); box-shadow: inset 0 0 0 0.8px rgba(59,158,221,0.3); }
.info-modal--spotlight.day .highlight-tag { background: rgba(59,158,221,0.13); color: #1f6ea8; box-shadow: inset 0 0 0 1px rgba(59,158,221,0.32); }
.info-modal--spotlight .info-row--event { background: linear-gradient(135deg,rgba(59,158,221,0.16),rgba(37,128,190,0.07)); }
/* — SIGNATURE (gold) — */
.info-modal.night.info-modal--signature { background: linear-gradient(rgba(212,175,55,0.15),rgba(212,175,55,0.15)), rgba(30,20,56,0.84); }
.info-modal.day.info-modal--signature { background: linear-gradient(rgba(212,175,55,0.13),rgba(212,175,55,0.13)), rgba(255,255,255,0.86); }
.info-modal--signature.night .pd-fact-ic { color: #e8c45f; }
.info-modal--signature.day .pd-fact-ic { color: #c79a2e; }
.info-modal--signature.night .pd-action--primary { background: linear-gradient(45deg,rgba(212,175,55,0.7),rgba(255,140,0,0.7)); }
.info-modal--signature.night .pd-action--primary:hover { background: linear-gradient(45deg,rgba(212,175,55,0.82),rgba(255,140,0,0.82)); }
.info-modal--signature.day .pd-action--primary { background: linear-gradient(45deg,rgba(212,175,55,0.8),rgba(255,140,0,0.8)); }
.info-modal--signature.day .pd-action--primary:hover { background: linear-gradient(45deg,rgba(212,175,55,0.9),rgba(255,140,0,0.9)); }
.info-modal--signature.night .highlight-tag { background: rgba(212,175,55,0.18); box-shadow: inset 0 0 0 0.8px rgba(212,175,55,0.34); }
.info-modal--signature.day .highlight-tag { background: rgba(212,175,55,0.16); color: #7a5f1e; box-shadow: inset 0 0 0 1px rgba(212,175,55,0.34); }
.info-modal--signature .info-row--event { background: linear-gradient(135deg,rgba(212,175,55,0.18),rgba(255,140,0,0.08)); }
.hours-list { font-size: 0.875rem; }
.hours-list div { padding: 2px 0; }
.see-more-btn { background: none; border: none; color: #D4AF37; cursor: pointer; font-size: 0.875rem; padding: 4px 0; text-decoration: underline; }
.see-more-btn:hover { color: #FF8C00; }
.share-cta-block { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px 10px 20px; text-align: center; }
.share-cta-text { font-size: 1rem; color: var(--text-muted); margin: 0; }
/* Glacier CTA — glass gradient primary, mirroring JinniChat's branded buttons
   (session-limit / warning primary recipe): themed gradient + frosted
   backdrop-filter + inset white sheen. */
.cta-btn { display: inline-block; width: auto; max-width: 100%; padding: 10px 22px; border-radius: 25px; color: #fff; font-size: 1rem; font-weight: 700; text-align: center; text-decoration: none; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); transition: all 0.2s ease; }
.share-page.day-mode .cta-btn { background: linear-gradient(135deg, rgba(212,175,55,0.85) 0%, rgba(255,140,0,0.85) 100%); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35); }
.share-page.day-mode .cta-btn:hover { background: linear-gradient(135deg, rgba(199,158,46,0.95) 0%, rgba(230,125,0,0.95) 100%); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5); }
.share-page.night-mode .cta-btn { background: linear-gradient(135deg, rgba(139,92,246,0.7) 0%, rgba(168,85,247,0.7) 100%); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18); }
.share-page.night-mode .cta-btn:hover { background: linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(147,51,234,0.8) 100%); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.28); }
.share-footer { text-align: center; padding: 16px 20px; font-size: 0.75rem; color: var(--text-muted); }
.share-footer a { color: var(--gold); text-decoration: none; }
.share-footer a:hover { text-decoration: underline; }
@keyframes fadeIn { to { opacity: 1; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (max-width: 768px) {
  .large-card .rec-image { height: 140px; }
  .large-card .rec-name { font-size: 1.1rem; }
  .rec-header { gap: 8px; }
  /* 20px horizontal, same as JinniChat's .chat-messages on mobile — 14px was
     making shared cards 12px wider than the in-app ones. */
  .share-main { padding: 16px 20px 0 20px; gap: 16px; }
  /* No width override — the pill hugs its label. Forcing width:100% here made
     "Discover places with Jinni" a full-bleed bar on iPhone. */
  /* Tap-to-reveal the overlay action, exactly as JinniChat does on touch. */
  .recommendation-card.touch-active .image-overlay,
  .recommendation-card:active .image-overlay { opacity: 1; visibility: visible; z-index: 10; }
  .recommendation-card.touch-active { transform: scale(0.98); transition: transform 0.1s ease; }
  .overlay-actions { flex-direction: column; gap: 8px; }
  .text-action-btn { padding: 10px 14px; border-radius: 20px; }
  .modal-header h3 { font-size: 1rem; }
  .modal-actions { flex-direction: column; gap: 10px; }
  .btn-primary, .btn-secondary { width: 100%; }
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED ITINERARY — ported verbatim from ItineraryView.vue so the shared
   page is pixel-identical to the in-app trip. Same glacier design tokens
   (--it-*) and the same .itin-* class rules; edit-only chrome is omitted.
═══════════════════════════════════════════════════════════════════ */
.itin.day-mode {
  --it-text: #A0522D;                       /* buttons (view-more recipe) */
  --it-chip-text: rgba(92,74,66,0.85);      /* chips (action-chip recipe) */
  --it-heading: #8B4513;                    /* clarifier-title day colour */
  --it-biz: #3c2a1e; --it-muted: #5a4a42;
  --it-glass: rgba(255,255,255,0.5); --it-glass-hover: rgba(255,255,255,0.75);
  --it-ring: inset 0 0 0 1px rgba(255,255,255,0.6);
  --it-ring-hover: inset 0 0 0 1px rgba(255,255,255,0.9);
  --it-chip-ring: inset 0 0 0 1px rgba(255,255,255,0.6);
  --it-chip-bg: rgba(255,255,255,0.5); --it-chip-bg-hover: rgba(255,255,255,0.75);
  --it-card-bg: rgba(255,255,255,0.5);
  --it-card-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
  --it-line: rgba(160,82,45,0.22);
  --it-shimmer: rgba(160,82,45,0.10); --it-shimmer-glint: rgba(255,255,255,0.5);
}
.itin.night-mode {
  --it-text: #c084fc;                       /* buttons (view-more recipe) */
  --it-chip-text: #94a3b8;                  /* chips (action-chip recipe) */
  --it-heading: #94a3b8;                    /* clarifier-title night colour */
  --it-biz: #d5dce4; --it-muted: #94a3b8;
  --it-glass: rgba(255,255,255,0.08); --it-glass-hover: rgba(255,255,255,0.14);
  --it-ring: inset 0 0 0 1.5px rgba(255,255,255,0.1);
  --it-ring-hover: inset 0 0 0 1.5px rgba(255,255,255,0.1);
  --it-chip-ring: inset 0 0 0 0.7px rgba(255,255,255,0.1);
  --it-chip-bg: rgba(255,255,255,0.06); --it-chip-bg-hover: rgba(255,255,255,0.14);
  --it-card-bg: rgba(255,255,255,0.06);
  --it-card-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1);
  --it-line: rgba(255,255,255,0.14);
  --it-shimmer: rgba(255,255,255,0.08); --it-shimmer-glint: rgba(255,255,255,0.08);
}

.itin { margin-top: 10px; color: var(--it-biz); }

/* ── Header ── */
.itin-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.itin-head-main { flex: 1; min-width: 0; }
.itin-title { font-weight: 800; font-size: 16px; line-height: 1.3; color: var(--it-heading); }
.itin-sub { font-size: 12.5px; color: var(--it-muted); margin-top: 2px; }

/* ── Day tabs — glacier chips; active carries the day colour ── */
.itin-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 10px; scrollbar-width: none; }
.itin-tabs::-webkit-scrollbar { display: none; }
.itin-tab {
  flex: none; border: none; cursor: pointer;
  border-radius: 999px; padding: 7px 14px; font-size: 13px; font-weight: 700;
  display: flex; flex-direction: column; align-items: center; line-height: 1.15;
  color: var(--it-chip-text); background: var(--it-chip-bg);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: all 0.25s ease;
}
/* Hover-gated: on iOS, :hover latches onto the last-tapped element and stays
   there, so after tapping a day the ring would remain stuck on the active tab.
   A mouse still gets the hover ring; touch never does. */
@media (hover: hover) and (pointer: fine) {
  .itin-tab:hover { background: var(--it-chip-bg-hover); box-shadow: var(--it-chip-ring); }
}
/* Active tab is styled inline (tinted glass in the day's colour); the base
   glass/backdrop-filter above stays in effect, so it reads as glacier glass
   rather than a solid pill. No shadow at rest — the ring is hover-only. */
.itin-tab.active { font-weight: 800; }
.itin-tab-date { font-size: 10.5px; font-weight: 500; opacity: 0.85; }

.itin-day-title { font-weight: 700; font-size: 18px; margin: 4px 0 10px; }

/* ── Slots timeline ── */
.itin-slots { margin-top: 12px; }
.itin-slot { display: flex; gap: 10px; }
.itin-slot-rail { display: flex; flex-direction: column; align-items: center; flex: none; }
.itin-slot-num {
  width: 26px; height: 26px; border-radius: 50%; color: #fff; font-size: 12.5px; font-weight: 800;
  display: grid; place-items: center; flex: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.25);
}
.itin-slot-line { flex: 1; width: 2px; background: var(--it-line); margin: 4px 0; min-height: 18px; }
.itin-slot-body { flex: 1; min-width: 0; padding-bottom: 14px; }
.itin-slot-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.itin-slot-time { font-size: 12px; font-weight: 800; color: var(--it-text); font-variant-numeric: tabular-nums; }
.itin-slot-cat { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;
  color: var(--it-muted); margin-right: auto; }

/* ── Cards — recommendation-card recipe ── */
.itin-card {
  display: flex; gap: 10px; align-items: center;
  border-radius: 12px; padding: 8px; cursor: pointer; overflow: hidden;
  background: var(--it-card-bg); box-shadow: var(--it-card-shadow);
  backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.3s ease;
}
.itin-card:hover { background: var(--it-glass-hover); }
.itin-card--failed { cursor: default; }
.itin-card--failed:hover { background: rgba(224,85,85,0.06); }
/* Photo frame — landscape 162×92; hover pops it out to 1.3× as a preview. */
.itin-card-imgwrap { width: 162px; height: 92px; border-radius: 10px; overflow: hidden; flex: none; }
.itin-card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
@media (hover: hover) and (pointer: fine) {
  .itin-card:hover { overflow: visible; }
  .itin-slot:hover { position: relative; z-index: 40; }
  .itin-card-imgwrap { transition: transform 0.25s ease, box-shadow 0.25s ease; transition-delay: 0s; }
  .itin-card-imgwrap:hover {
    transform: scale(1.3); transform-origin: center center; transition-delay: 0.4s;
    box-shadow: 0 0 10px rgba(0,0,0,0.35); position: relative; z-index: 50;
  }
  .itin-slot:has(.itin-card-imgwrap:hover) .itin-slot-top { opacity: 0; pointer-events: none; transition: opacity 0.2s ease 0.4s; }
  .itin-slot-top { transition: opacity 0.15s ease 0s; }
}
@media (prefers-reduced-motion: reduce) {
  .itin-card-imgwrap { transition: none; }
  .itin-card-imgwrap:hover { transform: none; box-shadow: none; }
}
@media (max-width: 480px) {
  .itin-card { flex-direction: column; align-items: stretch; gap: 8px; }
  .itin-card-imgwrap { width: 100%; height: auto; aspect-ratio: 16 / 9; }
  .itin-card-info { width: 100%; }
}
.itin-card-info { min-width: 0; }
.itin-card-name { font-weight: 700; font-size: 13.5px; line-height: 1.25; color: var(--it-biz); }
.itin-card-region { font-size: 12px; color: var(--it-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.itin-card-note { font-size: 12px; color: var(--it-muted); margin-top: 4px; font-style: italic; }
.itin-card--failed { flex-direction: column; align-items: flex-start; gap: 6px;
  background: rgba(224,85,85,0.06); box-shadow: none; }

</style>