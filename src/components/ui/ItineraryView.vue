<template>
  <div class="itin" :class="theme">
    <!-- ═══ Header ═══ -->
    <div class="itin-head">
      <div class="itin-head-main">
        <div class="itin-title">{{ itinerary?.title || (findingHotels ? L.findingHotelsTitle : (itineraryId ? L.loadingTitle : L.planningTitle)) }}</div>
        <div class="itin-sub">
          <span v-if="itinerary">{{ itinerary.destination?.name }}</span>
          <span v-if="dateRangeLabel"> · {{ dateRangeLabel }}</span>
          <span v-if="stage === 'planning'" class="itin-stage">{{ L.stagePlanning }}</span>
          <span v-else-if="stage === 'enriching'" class="itin-stage">{{ L.stageEnriching }}</span>
        </div>
        <!-- Approximate per-day cost from validator-priced stops. Deliberately
             "~approx" and only shown when real prices exist (never invented). -->
        <div v-if="itinerary && itinerary.costEstimate && itinerary.costEstimate.perPersonPerDay > 0" class="itin-estimate">
          ≈ {{ itinerary.costEstimate.perPersonPerDay }} {{ itinerary.costEstimate.currency }} {{ L.perPersonDay }}
          <span class="itin-estimate-note">{{ L.estimateApprox }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ Error ═══ -->
    <div v-if="fatalError" class="itin-error">
      {{ fatalError }}
      <button v-if="req" class="itin-btn" @click="req.usePool === false ? startGeneration() : startPoolBuild()">{{ L.retry }}</button>
    </div>

    <!-- ═══ Hotel chooser (pool flow, when the user asked for suggestions) ═══ -->
    <div v-else-if="hotelChoices" class="itin-choose">
      <!-- Breakfast question — asked right AFTER a suggested hotel is picked
           (the composer no longer asks it up-front on the suggest path,
           since before this moment no hotel existed to have breakfast at). -->
      <template v-if="breakfastAsk">
        <div class="itin-choose-head"><span>{{ breakfastAsk.name }}</span></div>
        <div class="itin-breakfast-row">
          <span class="itin-breakfast-q">{{ L.breakfastQ }}</span>
          <button class="itin-btn itin-btn--small" @click="answerBreakfast(true)">{{ L.breakfastYes }}</button>
          <button class="itin-btn itin-btn--small" @click="answerBreakfast(false)">{{ L.breakfastNo }}</button>
        </div>
      </template>
      <template v-else>
      <div class="itin-choose-head"><span>{{ L.chooseHotel }}</span></div>
      <div class="itin-choose-list">
        <!-- div (not <button>) because the card hosts an inner Details button —
             nested buttons are invalid HTML. Details opens the same info-modal
             the place cards use (view-place → showPlaceInfo), so the user can
             see photos / rating / business info before committing to a hotel. -->
        <div v-for="h in hotelChoices" :key="h.placeId || h.name" class="itin-cand itin-cand--hotel"
             role="button" tabindex="0" @click="selectHotel(h)" @keyup.enter="selectHotel(h)">
          <img v-if="imgUrl(h)" :src="imgUrl(h)" alt="" loading="lazy" @error="$event.target.style.display='none'"/>
          <span class="itin-cand-name">{{ h.name }}</span>
          <span class="itin-cand-meta">
            <span v-if="Number.isFinite(h.rating)" class="itin-cand-rating">★ {{ h.rating.toFixed(1) }}</span>
            <span v-if="h.distance" class="itin-cand-dist">{{ h.distance }}</span>
          </span>
          <span class="itin-cand-actions">
            <button type="button" class="itin-cand-info" @click.stop="$emit('view-place', h)">{{ L.details }}</button>
            <button type="button" class="itin-cand-info itin-cand-photo" :class="{ 'is-loading': photoLoadingId === hotelKey(h) }" :title="L.viewPhoto" @click.stop="openHotelPhotos(h)">
              <svg v-if="photoLoadingId === hotelKey(h)" class="itin-loading-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
            </button>
          </span>
        </div>
      </div>
      <div class="itin-day-actions">
        <button class="itin-btn itin-btn--small" @click="selectHotel(null)">{{ L.skipHotel }}</button>
      </div>
      </template>
    </div>

    <!-- ═══ Planning shimmer / pool-collection progress ═══ -->
    <div v-else-if="!days.length" class="itin-skeleton">
      <!-- Pool flow: live checklist of category fetches -->
      <div v-if="poolProgress" class="itin-pool-progress">
        <div v-for="row in poolProgress" :key="row.action + (row.day || '')" class="itin-pool-row" :class="{ 'is-done': row.count !== null }">
          <!-- Every pending row pulses (categories fetch in PARALLEL), and a
               row whose View More top-up is in flight shows its interim count
               NEXT TO the pulse — the "3… → 8" moment is now visible instead
               of the number appearing once, fully resolved. -->
          <span v-if="row.count === null || row.more" class="itin-pool-spinner is-active"></span>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="itin-pool-label">{{ poolRowLabel(row) }}</span>
          <span v-if="row.count !== null" class="itin-pool-count">{{ row.count }}<template v-if="row.more">…</template></span>
        </div>
      </div>
      <div v-if="!itineraryId" class="itin-sk-tabs"><span v-for="n in requestDays" :key="n" class="itin-sk-tab shimmer"></span></div>
      <div v-for="n in 4" :key="'r'+n" class="itin-sk-row">
        <span class="itin-sk-dot shimmer"></span>
        <span class="itin-sk-line shimmer" :style="{ width: (58 + n * 9) + '%' }"></span>
      </div>
    </div>

    <template v-else>
      <!-- ═══ Day tabs ═══ -->
      <div class="itin-tabs" role="tablist">
        <button v-for="d in days" :key="d.dayNumber" class="itin-tab" role="tab"
                :class="{ active: d.dayNumber === activeDay }"
                :style="d.dayNumber === activeDay ? {
                  color: dayColor(d.dayNumber),
                  background: dayTint(d.dayNumber, 0.16),
                } : {}"
                @click="activeDay = d.dayNumber">
          <span>{{ L.day }} {{ d.dayNumber }}</span>
          <span v-if="dayDateLabel(d.dayNumber)" class="itin-tab-date">{{ dayDateLabel(d.dayNumber) }}</span>
        </button>
      </div>

      <!-- A failed edit is shown, not swallowed. Dismissible; the next
           successful edit clears it automatically. -->
      <div v-if="editError" class="itin-error itin-error--inline" role="alert">
        {{ editError }}
        <button class="itin-icon" :title="L.close" @click="editError = null">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div v-if="currentDay" :key="activeDay" class="itin-day">
        <!-- Day title — machine-written (auto/AI) with an inline rename;
             a user-set title is protected server-side from auto refresh, and
             clearing it hands the title back to the machine. -->
        <div v-if="currentDay.title || editingDayTitle" class="itin-day-title" :style="{ color: dayColor(activeDay) }">
          <template v-if="!editingDayTitle">
            <span class="itin-day-title-text">{{ currentDay.title }}</span>
            <button class="itin-day-title-edit" :title="L.renameDay" :disabled="busy" @click="startDayTitleEdit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
          </template>
          <input v-else
                 ref="dayTitleInput"
                 v-model="dayTitleDraft"
                 class="itin-day-title-input"
                 maxlength="60"
                 @keydown.enter.prevent="saveDayTitle"
                 @keydown.esc.prevent="cancelDayTitleEdit"
                 @blur="saveDayTitle" />
        </div>

        <!-- ═══ Map of the active day ═══ -->
        <ItineraryMap
          :stops="enrichedStops"
          :home-base="homeBaseForMap"
          :theme="theme"
          :route-mode="itinerary && itinerary.nearbyMode ? 'roads' : 'vector'"
          :day-color="dayColor(activeDay)"
          v-bind="navLabels"
          :open-fullscreen-label="L.openFullscreen"
          :close-label="L.close"
          :mode-car-label="L.driving"
          :mode-walk-label="L.walking"
          :straight-line-label="L.approxPath"
          :details-label="L.details"
          :directions-label="L.directions"
          :transit-label="L.transit"
          :call-label="L.call"
          :website-label="L.website"
          :place-fallback-label="L.placeFallback"
          :unit-km="L.unitKm" :unit-meter="L.unitMeter" :unit-minute="L.unitMinute" :unit-hour="L.unitHour"
          @stop-click="onMapStopClick"
          @view-details="rec => $emit('view-place', rec)"
        />

        <!-- ═══ Slots ═══ -->
        <div class="itin-slots">
          <div v-for="(slot, idx) in currentDay.slots" :key="slot.slotId"
               :ref="el => slotEls[slot.slotId] = el"
               class="itin-slot" :class="[{ 'is-pending': slot.status === 'pending', 'is-failed': slot.status === 'failed', 'is-flash': flashSlotId === slot.slotId }, slotTierClass(slot)]">
            <div class="itin-slot-rail">
              <span class="itin-slot-num" :style="slot.status === 'failed' ? null : { background: slotTierHex(slot) || dayColor(activeDay) }">{{ idx + 1 }}</span>
              <span v-if="idx < currentDay.slots.length - 1" class="itin-slot-line"></span>
            </div>

            <div class="itin-slot-body">
              <div class="itin-slot-top">
                <span v-if="slot.time" class="itin-slot-time">{{ slot.time }}</span>
                <span v-else-if="slot.place && slot.place.eventSchedule && slot.place.eventSchedule.startDate" class="itin-slot-time itin-slot-time--allday">{{ L.allDay }}</span>
                <span class="itin-slot-cat">{{ L.cat[slot.category] || slot.category }}</span>
              </div>

              <!-- pending → shimmer card -->
              <div v-if="slot.status === 'pending'" class="itin-card itin-card--sk">
                <span class="itin-card-imgwrap shimmer"></span>
                <span class="itin-card-lines">
                  <span class="itin-sk-line shimmer" style="width:70%"></span>
                  <span class="itin-sk-line shimmer" style="width:45%"></span>
                </span>
              </div>

              <!-- failed → offer replacement. The message tells the truth
                   about WHY: a duplicate was verified fine, it is just already
                   on the trip; an out-of-area place exists, just not here. -->
              <div v-else-if="slot.status === 'failed'" class="itin-card itin-card--failed">
                <div class="itin-card-name">{{ slot.name }}</div>
                <div class="itin-failed-note">{{ failedNote(slot) }}</div>
                <button class="itin-btn itin-btn--action itin-btn--small" :disabled="!!replaceFor" @click="openReplace(slot)">{{ L.findReplacement }}</button>
              </div>

              <!-- enriched card — same anatomy as the chat's recommendation
                   card: full-width photo with a hover overlay (More info /
                   Ask AI, desktop pointers only) and the round image button
                   next to the name. -->
              <div v-else class="itin-card" @click="onCardClick(slot)" @touchstart="cardTouchStart" @touchend="cardTouchEnd">
                <div v-if="imgUrl(slot.place)" class="itin-card-imgwrap">
                  <img class="itin-card-img" :src="imgUrl(slot.place)" alt="" loading="lazy" @error="$event.target.parentElement.style.display='none'"/>
                  <div class="itin-card-overlay">
                    <div class="itin-overlay-actions">
                      <button type="button" class="itin-overlay-btn itin-overlay-btn--info" @click.stop="$emit('view-place', slot.place)">{{ L.more }}</button>
                      <button type="button" class="itin-overlay-btn itin-overlay-btn--ask" @click.stop="askAi(slot)">{{ L.askAi }}</button>
                    </div>
                  </div>
                  <!-- Save ribbon — the chat card's rec-image-save-btn recipe:
                       a bookmark hanging from the top edge of the photo,
                       revealed on hover, gold gradient once saved. -->
                  <button v-if="savedKeys && slotRefId(slot)" type="button" class="itin-card-save" :class="{ saved: isSlotSaved(slot) }" :title="isSlotSaved(slot) ? L.unsave : L.save" @click.stop="$emit('toggle-save', slotToRec(slot))">
                    <svg v-if="isSlotSaved(slot)" width="24" height="90" viewBox="0 0 24 90" fill="url(#itinSaveGradient)" stroke="none">
                      <defs>
                        <linearGradient id="itinSaveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="rgb(212,175,55)"/>
                          <stop offset="100%" stop-color="rgb(255,140,0)"/>
                        </linearGradient>
                      </defs>
                      <path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    <svg v-else width="24" height="90" viewBox="0 0 24 90" fill="rgba(255,255,255,0.34)" stroke="none"><path d="M19 87l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>
                <div class="itin-card-info">
                  <div class="itin-card-header">
                    <div class="itin-card-name">{{ slot.place.name }}</div>
                    <button v-if="imgUrl(slot.place)" type="button" class="itin-img-btn" :class="{ 'is-loading': photoLoadingId === slot.slotId }" :title="L.viewPhoto" @click.stop="openPhotos(slot)">
                      <svg v-if="photoLoadingId !== slot.slotId" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                      <svg v-else class="itin-loading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                    </button>
                  </div>
                  <div v-if="slot.place.region" class="itin-card-region">{{ slot.place.region }}</div>
                  <div v-if="slot.note" class="itin-card-note">{{ slot.note }}</div>
                </div>
              </div>

              <!-- per-slot actions — ordered like the chat card's footer:
                   feedback (like/dislike) first, then keep/lock, then the
                   structural ops, with the destructive remove last. -->
              <div class="itin-slot-actions">
                <!-- Like / dislike — enriched slots only. A dislike also hides
                     the place from this user's future suggestions. -->
                <button v-if="slot.status === 'enriched'" class="itin-icon itin-icon--fb" :class="{ 'is-liked': slot.feedback === 'like' }" :disabled="feedbackBusyId === slot.slotId" :title="L.like" @click.stop="slotFeedback(slot, 'like')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                </button>
                <button v-if="slot.status === 'enriched'" class="itin-icon itin-icon--fb" :class="{ 'is-disliked': slot.feedback === 'dislike' }" :disabled="feedbackBusyId === slot.slotId" :title="L.dislike" @click.stop="slotFeedback(slot, 'dislike')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                </button>
                <!-- Keep/lock. -->
                <button v-if="slot.status !== 'failed'" class="itin-icon" :class="{ 'is-on': slot.locked }" :title="L.keep" @click="patchOp({ op: 'toggleLock', dayNumber: activeDay, slotId: slot.slotId })">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </button>
                <button class="itin-icon" :disabled="idx === 0 || busy" :title="L.moveUp" @click="patchOp({ op: 'moveSlot', dayNumber: activeDay, slotId: slot.slotId, direction: -1 })">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button class="itin-icon" :disabled="idx === currentDay.slots.length - 1 || busy" :title="L.moveDown" @click="patchOp({ op: 'moveSlot', dayNumber: activeDay, slotId: slot.slotId, direction: 1 })">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button v-if="days.length > 1" class="itin-icon" :class="{ 'is-on': moveFor === slot.slotId }" :disabled="busy" :title="L.moveToDay" @click="moveFor = moveFor === slot.slotId ? null : slot.slotId">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
                </button>
                <button v-if="slot.status === 'enriched'" class="itin-icon" :disabled="!!replaceFor || busy" :title="L.replace" @click="openReplace(slot)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                </button>
                <button class="itin-icon itin-icon--danger" :disabled="busy" :title="L.remove" @click="patchOp({ op: 'removeSlot', dayNumber: activeDay, slotId: slot.slotId })">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>

              <!-- Partner badge — the chat card's .partner-label recipe, shown
                   BELOW the slot's action row. Verified BUSINESSES only:
                   destinations are public sites, not paying partners, so they
                   never carry a badge (mirrors getPartnerLabel). -->
              <div v-if="slot.status === 'enriched' && slotTier(slot)"
                   :class="['itin-partner-label', 'itin-partner-label--' + slotTier(slot)]"
                   v-html="tierIcon(slot) + ' ' + tierLabel(slot)"></div>

              <!-- move-to-day picker attached to this slot -->
              <div v-if="moveFor === slot.slotId" class="itin-add-cats itin-move-days">
                <span class="itin-add-prompt">{{ L.moveToDay }}:</span>
                <button v-for="d in otherDays" :key="d.dayNumber" class="itin-chip" :disabled="busy"
                        :style="{ color: dayColor(d.dayNumber) }"
                        @click="moveSlotToDay(slot, d.dayNumber)">
                  {{ L.day }} {{ d.dayNumber }}
                </button>
                <!-- Spill into a NEW day — the backend creates it on this move. -->
                <button v-if="nextDayNumber" class="itin-chip" :disabled="busy"
                        :style="{ color: dayColor(nextDayNumber) }"
                        @click="moveSlotToDay(slot, nextDayNumber)">
                  ＋ {{ L.day }} {{ nextDayNumber }}
                </button>
              </div>

              <!-- replacement / add chooser attached to this slot -->
              <div v-if="replaceFor && replaceFor.slotId === slot.slotId" class="itin-choose">
                <div class="itin-choose-head">
                  <span>{{ L.pickReplacement }}</span>
                  <button class="itin-icon" @click="closeReplace">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div v-if="candidatesLoading" class="itin-choose-loading">
                  <span v-for="n in 3" :key="n" class="itin-cand itin-cand--sk shimmer"></span>
                </div>
                <div v-else-if="candidates.length" class="itin-choose-list">
                  <!-- div (not <button>) — hosts inner Details/photo buttons; nested
                       buttons are invalid HTML. Same pattern as the hotel chooser. -->
                  <div v-for="c in candidates" :key="c.id || c.placeId || c.name" class="itin-cand itin-cand--rich"
                       role="button" tabindex="0" @click="pickCandidate(c)" @keyup.enter="pickCandidate(c)">
                    <img v-if="imgUrl(c)" :src="imgUrl(c)" alt="" loading="lazy" @error="$event.target.style.display='none'"/>
                    <span class="itin-cand-name">{{ c.name }}</span>
                    <span class="itin-cand-meta">
                      <span v-if="Number.isFinite(c.rating)" class="itin-cand-rating">★ {{ c.rating.toFixed(1) }}</span>
                      <span v-if="c.distance" class="itin-cand-dist">{{ c.distance }}</span>
                    </span>
                    <span class="itin-cand-actions">
                      <button type="button" class="itin-cand-info" @click.stop="$emit('view-place', c)">{{ L.details }}</button>
                      <button type="button" class="itin-cand-info itin-cand-photo" :class="{ 'is-loading': photoLoadingId === candKey(c) }" :title="L.viewPhoto" @click.stop="openCandPhotos(c)">
                        <svg v-if="photoLoadingId === candKey(c)" class="itin-loading-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
                      </button>
                    </span>
                  </div>
                </div>
                <div v-else class="itin-choose-empty">{{ L.noCandidates }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Day-level actions ═══ -->
        <div class="itin-day-actions">
          <div class="itin-add">
            <button v-if="!addOpen" class="itin-btn itin-btn--action" :disabled="busy || streaming" @click="addOpen = true">＋ {{ L.addStop }}</button>
            <!-- shopping sub-type clarifier — mirrors the chat input clarifier -->
            <div v-else-if="shopSubOpen" class="itin-add-cats">
              <span class="itin-add-prompt">{{ L.shopping.prompt }}</span>
              <button v-for="st in shoppingSubTypes" :key="st" class="itin-chip" @click="openAdd('shopping', st)">{{ L.shopping[st] || st }}</button>
              <button class="itin-icon" :title="L.close" @click="addOpen = false; shopSubOpen = false">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div v-else class="itin-add-cats">
              <!-- The user's own curation first — saved places, geofenced to
                   this trip server-side (GET /:id/saved-candidates). -->
              <button v-if="savedKeys && itinerary && itinerary._id" class="itin-chip itin-chip--saved" @click="openSavedAdd">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                {{ L.fromSaved }}
              </button>
              <button v-for="c in addCategories" :key="c" class="itin-chip" @click="onAddCategory(c)">{{ L.cat[c] || c }}</button>
              <button class="itin-icon" @click="addOpen = false; shopSubOpen = false">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <button v-if="!addOpen" class="itin-btn itin-btn--action" :disabled="busy || streaming" @click="regenerateDay">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3z"/><path d="M19 15.5v4.5"/><path d="M16.8 17.8h4.4"/></svg>
            {{ L.regenerateDay }}
          </button>
        </div>

        <!-- add-stop chooser (day-level) -->
        <div v-if="addFor" class="itin-choose">
          <div class="itin-choose-head">
            <span>{{ addFor === '__saved' ? L.fromSaved : L.pickStop }}</span>
            <button class="itin-icon" @click="closeAdd">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div v-if="candidatesLoading" class="itin-choose-loading">
            <span v-for="n in 3" :key="n" class="itin-cand itin-cand--sk shimmer"></span>
          </div>
          <div v-else-if="candidates.length" class="itin-choose-list">
            <!-- div (not <button>) — hosts inner Details/photo buttons; nested
                 buttons are invalid HTML. Same pattern as the hotel chooser. -->
            <div v-for="c in candidates" :key="c.id || c.placeId || c.name" class="itin-cand itin-cand--rich"
                 role="button" tabindex="0" @click="pickCandidate(c)" @keyup.enter="pickCandidate(c)">
              <img v-if="imgUrl(c)" :src="imgUrl(c)" alt="" loading="lazy" @error="$event.target.style.display='none'"/>
              <span class="itin-cand-name">{{ c.name }}</span>
              <span class="itin-cand-meta">
                <span v-if="Number.isFinite(c.rating)" class="itin-cand-rating">★ {{ c.rating.toFixed(1) }}</span>
                <span v-if="c.distance" class="itin-cand-dist">{{ c.distance }}</span>
              </span>
              <span class="itin-cand-actions">
                <button type="button" class="itin-cand-info" @click.stop="$emit('view-place', c)">{{ L.details }}</button>
                <button type="button" class="itin-cand-info itin-cand-photo" :class="{ 'is-loading': photoLoadingId === candKey(c) }" :title="L.viewPhoto" @click.stop="openCandPhotos(c)">
                  <svg v-if="photoLoadingId === candKey(c)" class="itin-loading-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
                </button>
              </span>
            </div>
          </div>
          <div v-else class="itin-choose-empty">{{ addFor === '__saved' ? L.noSavedNearby : L.noCandidates }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import ItineraryMap from '@/components/ui/ItineraryMap.vue';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
const DAY_COLORS = ['#7c5cff', '#ff7043', '#26a69a', '#ec407a', '#5c9dff', '#f2b100', '#8d6e63', '#00acc1', '#ab47bc', '#66bb6a'];

/** itinerary slot category → existing quick-action id, for replacements. */
const CATEGORY_TO_ACTION = {
  restaurants: 'restaurants', cafe: 'restaurants', hotels: 'hotels',
  hidden_gems: 'hidden_gems', historical: 'historical', museum: 'historical',
  events: 'events', photo_spots: 'photo_spots', viewpoint: 'photo_spots',
  shopping: 'shopping', nature: 'hidden_gems',
  // Without this, "Replace" on an activity slot falls through to the
  // `|| 'hidden_gems'` default and quietly fetches the wrong kind.
  activities: 'activities',
};

const DEFAULT_LABELS = {
  renameDay: 'Rename day',
  breakfastQ: 'Breakfast at the hotel?', breakfastYes: 'Yes', breakfastNo: 'No',
  planningTitle: 'Planning your trip…',
  loadingTitle: 'Loading…',
  findingHotelsTitle: 'Finding hotels for you…',
  stagePlanning: 'planning', stageEnriching: 'finding real places…',
  day: 'Day', dayWord: 'day', daysWord: 'days', retry: 'Try again',
  keep: 'Keep this stop', moveUp: 'Move up', moveDown: 'Move down',
  replace: 'Replace', remove: 'Remove', viewPhoto: 'View photo',
  notVerified: "Couldn't verify this place exists.",
  findReplacement: 'Find a replacement', pickReplacement: 'Pick a replacement',
  addStop: 'Add stop', pickStop: 'Pick a stop', noCandidates: 'Nothing found — try another category.',
  fromSaved: 'From saved', noSavedNearby: 'No saved places near this destination yet.',
  // Excursion food pass — searching for somewhere to eat out where the day
  // actually goes, rather than back in town. {n} is the day number.
  foodNearDay: 'Somewhere to eat on day {n}',
  moveToDay: 'Move to another day',
  regenerateDay: 'Regenerate day',
  openFullscreen: 'Open full screen', close: 'Close',
  driving: 'Driving', walking: 'Walking', approxPath: 'Approximate path',
  chooseHotel: 'Choose your hotel', skipHotel: 'Skip', collecting: 'Collecting the best places...',
  more: 'More info', askAi: 'Ask AI',
  details: 'Details', directions: 'Directions', transit: 'Transit',
  call: 'Call', website: 'Website', placeFallback: 'Place',
  like: 'Like', dislike: "Don't suggest again", save: 'Save place', unsave: 'Remove from saved',
  unitKm: 'km', unitMeter: 'm', unitMinute: 'min', unitHour: 'h',
  genericError: 'Something went wrong. Please try again.',
  editFailed: "Couldn't save that change. Please try again.",
  notVerifiedDuplicate: 'Already somewhere else on this trip.',
  notVerifiedFar: 'This one turned out to be too far from your destination.',
  stoppedMessage: 'Generation stopped.',
  // Shopping sub-type clarifier (reuses the chat's chat.shopping.* strings).
  shopping: {
    prompt: 'What are you shopping for?',
    souvenirs: 'Souvenirs & Gifts', clothing: 'Clothing & Boutiques',
    market: 'Markets & Bazaars', mall: 'Malls', jewelry: 'Jewelry', food: 'Food & Gourmet',
  },
  cat: {
    restaurants: 'Food', cafe: 'Café', hotels: 'Hotel', hidden_gems: 'Hidden gem',
    historical: 'Historical', museum: 'Museum', events: 'Event',
    photo_spots: 'Photo spot', viewpoint: 'Viewpoint', shopping: 'Shopping', nature: 'Nature',
    activities: 'Activity',
  },
  allDay: 'All day',
  perPersonDay: 'per person / day',
  estimateApprox: '· approximate',
};

export default {
  name: 'ItineraryView',
  components: { ItineraryMap },
  props: {
    /** Fresh generation params: { daysCount, startDate, destination?, pace, interests?, homeBase? } */
    request: { type: Object, default: null },
    /** Restore an existing itinerary (session reload). */
    itineraryId: { type: String, default: null },
    theme: { type: String, default: 'day-mode' },
    /** BCP-47 app locale ('fr', 'ru', …) — date labels follow the APP
     *  language, not the browser's. Omitted → browser default. */
    locale: { type: String, default: undefined },
    /** Partial overrides of DEFAULT_LABELS — pass translated strings from JinniChat's t(). */
    labels: { type: Object, default: () => ({}) },
    /** JinniChat's mapLabels object (the same one RecommendationMap receives).
     *  Only the navigator-related keys are forwarded to <ItineraryMap> — see
     *  the navLabels computed. Optional: omitted keys fall back to the map's
     *  built-in English defaults. */
    mapLabels: { type: Object, default: () => ({}) },
    /** JinniChat's reactive savedKeys Set — lights up the per-slot save button.
     *  Null → save buttons are hidden entirely (parent doesn't support saves). */
    savedKeys: { type: Object, default: null },
  },
  emits: ['created', 'error', 'view-place', 'view-photos', 'usage-headers', 'generation-start', 'generation-end', 'toggle-save', 'hotel-choice', 'ask-ai'],
  data() {
    return {
      itinerary: null,
      activeDay: 1,
      editingDayTitle: false,
      dayTitleDraft: '',
      streaming: false,
      findingHotels: false,      // hotels fetch in flight (before the chooser shows)
      stage: null,               // 'planning' | 'enriching' | null
      fatalError: null,
      busy: false,               // a PATCH in flight — serialize edits
      editError: null,           // last failed edit — surfaced, not swallowed
      // replacement / add flows
      replaceFor: null,          // slot being replaced
      addFor: null,              // category being added
      candidates: [],
      candidatesLoading: false,
      candAbort: null,
      addOpen: false,
      shopSubOpen: false,        // showing the shopping sub-type chips (add flow)
      flashSlotId: null,
      moveFor: null,             // slotId whose move-to-day picker is open
      photoLoadingId: null,      // slotId whose photo gallery is opening (spinner)
      feedbackBusyId: null,      // slotId with a like/dislike request in flight
      slotEls: {},
      // Local, writable copy of the `request` prop. The build flow needs to
      // record answers (chosen hotel, breakfast, pool->LLM fallback) as it
      // goes; it used to write them straight into the prop, which mutates the
      // parent's object from a child. Seeded in created().
      req: null,
      // Pool flow
      poolProgress: null,      // [{ action, count|null }] while collecting
      hotelChoices: null,      // hotel suggestions awaiting a pick
      breakfastAsk: null,      // picked hotel awaiting the breakfast answer
      _hotelResolve: null,     // promise resolver for the pick
    };
  },
  computed: {
    L() {
      // deep-merge labels over defaults (cat & shopping are nested)
      return {
        ...DEFAULT_LABELS, ...this.labels,
        cat: { ...DEFAULT_LABELS.cat, ...(this.labels?.cat || {}) },
        shopping: { ...DEFAULT_LABELS.shopping, ...(this.labels?.shopping || {}) },
      };
    },
    // The navigator-related subset of JinniChat's mapLabels, forwarded to
    // <ItineraryMap> via v-bind. Filtered (rather than spreading the whole
    // object) so rec-map-only keys like the tier filter labels don't leak onto
    // the itinerary map's root element as unknown attributes.
    navLabels() {
      const keys = [
        'routeLanguage',
        // The show/hide bar reuses JinniChat's existing map.show / map.hide
        // translations — same wording as RecommendationMap's toggle.
        'showLabel', 'hideLabel',
        'locateTitle', 'youAreHereLabel',
        'locationDeniedLabel', 'locationUnavailableLabel', 'locationUnsupportedLabel', 'locationApproxLabel',
        'routingLabel', 'routeErrorLabel', 'showRouteLabel',
        'exitRouteLabel', 'arriveLabel', 'uturnLabel', 'wrongWayLabel', 'wrongWayHint',
      ];
      const out = {};
      for (const k of keys) if (this.mapLabels && this.mapLabels[k] != null) out[k] = this.mapLabels[k];
      return out;
    },
    days() { return this.itinerary?.days || []; },
    currentDay() { return this.days.find(d => d.dayNumber === this.activeDay) || null; },
    enrichedStops() { return (this.currentDay?.slots || []).filter(s => s.status === 'enriched' && s.place); },
    homeBaseForMap() {
      const hb = this.itinerary?.homeBase;
      return hb?.name ? { name: hb.name, lat: hb.latitude ?? hb.lat, lng: hb.longitude ?? hb.lng } : null;
    },
    requestDays() { return Math.min(this.req?.daysCount || 3, 7); },
    // Fetches run sequentially, so the first row without a count is the one
    // currently in flight — the only one that should animate.
    addCategories() { return ['restaurants', 'hidden_gems', 'historical', 'events', 'photo_spots', 'activities', 'shopping']; },
    otherDays() { return this.days.filter(d => d.dayNumber !== this.activeDay); },
    // One past the last day = the "+ Day N" chip in the move picker; null once
    // the 10-day cap (DAY_COLORS depth, backend-enforced too) is reached.
    nextDayNumber() {
      const max = this.days.reduce((m, d) => Math.max(m, d.dayNumber), 0);
      return max >= 1 && max < 10 ? max + 1 : null;
    },
    shoppingSubTypes() { return ['souvenirs', 'clothing', 'market', 'mall', 'jewelry', 'food']; },
    dateRangeLabel() {
      const s = this.itinerary?.startDate;
      if (!s) return this.itinerary ? `${this.itinerary.daysCount} ${this.itinerary.daysCount === 1 ? this.L.dayWord : this.L.daysWord}` : '';
      const start = new Date(s);
      const end = new Date(start); end.setDate(end.getDate() + (this.itinerary.daysCount - 1));
      const fmt = (d) => d.toLocaleDateString(this.locale || undefined, { month: 'short', day: 'numeric' });
      return `${fmt(start)} – ${fmt(end)}`;
    },
  },
  created() {
    // Shallow copy is enough — only top-level keys are written below.
    this.req = this.request ? { ...this.request } : null;
  },
  mounted() {
    if (this.itineraryId) this.loadExisting();
    else if (this.request) {
      // Pool composition is the default; it falls back to the LLM-skeleton
      // stream on a thin pool or orchestration failure.
      if (this.req.usePool === false) this.startGeneration();
      else this.startPoolBuild();
    }
  },
  beforeUnmount() { this.candAbort?.abort(); this._genAbort?.abort(); clearTimeout(this._photoTimer); },
  methods: {
    authHeaders(json = true) {
      return { ...(json ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${localStorage.getItem('authToken')}` };
    },
    imgUrl(place) {
      const u = place?.image;
      if (!u) return null;
      return u.startsWith('/api/') ? `${API_BASE}${u}` : u;
    },
    dayColor(n) { return DAY_COLORS[(n - 1) % DAY_COLORS.length]; },
    /** Day colour as rgba() at the given alpha — used for glass tints. */
    dayTint(n, a) {
      const h = this.dayColor(n).replace('#', '');
      const int = parseInt(h, 16);
      return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${a})`;
    },
    dayDateLabel(n) {
      const s = this.itinerary?.startDate;
      if (!s) return '';
      const d = new Date(s); d.setDate(d.getDate() + (n - 1));
      return d.toLocaleDateString(this.locale || undefined, { month: 'short', day: 'numeric' });
    },

    /* ── restore ─────────────────────────────────────────────── */
    async loadExisting() {
      try {
        const id = this.itineraryId || this.itinerary?._id;
        if (!id) return;
        const res = await fetch(`${API_BASE}/api/itinerary/${id}`, { headers: this.authHeaders(false) });
        const data = await res.json();
        if (data.success) this.itinerary = data.itinerary;
        else this.fatalError = this.L.genericError;
      } catch (_) { this.fatalError = this.L.genericError; }
    },

    /* ── pool flow: quick-action fetches → algorithmic build ──────────── */
    // Fetch one category through the EXISTING quick-action-stream (untouched
    // endpoint — same call the Replace flow already makes) and return its recs.
    async fetchPoolAction(action, count, excludePlaceIds = [], opts = {}) {
      try {
        const res = await fetch(`${API_BASE}/api/ai/quick-action-stream`, {
          method: 'POST', headers: this.authHeaders(), signal: this._genAbort?.signal,
          body: JSON.stringify({
            action, count,
            // Top-up taps go through the endpoint's own View More machinery
            // (actionType 'view_more' + viewMoreCount) — taps ≥ 1 are served
            // cache-first server-side, so auto top-ups are cheap and fast.
            actionType: opts.viewMore ? 'view_more' : 'quick_action',
            ...(opts.viewMore ? { viewMoreCount: opts.viewMore } : {}),
            ...(opts.excludeNames?.length ? { excludeNames: opts.excludeNames } : {}),
            nearbyMode: !!this.req?.nearbyMode,
            excludePlaceIds,
            // Search centre, most specific first:
            //  1. an explicit override — used by the excursion food pass to
            //     look for restaurants near Garni rather than near the user;
            //  2. a chat-named destination ("plan 3 days in Paris");
            //  3. otherwise the endpoint's own default (the user's location).
            ...(opts.location
              ? { location: opts.location }
              : (Number.isFinite(this.req?.destination?.lat) && Number.isFinite(this.req?.destination?.lng)
                ? { location: { lat: this.req.destination.lat, lng: this.req.destination.lng } }
                : {})),
          }),
        });
        if (!res.ok) return [];
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', recs = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if ((data.type === 'complete' || data.type === 'recommendations') && data.recommendations?.length) {
                  recs = data.recommendations;
                }
              } catch (_) {}
            }
          }
        }
        return recs.filter(r => Number.isFinite(r.latitude) && Number.isFinite(r.longitude));
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        console.error(`pool fetch failed for ${action}:`, e);
        return [];   // one thin category never sinks the build
      }
    },

    /** Fetch one pool category with a TARGET (what we'd like — gives the
     *  composer choice) and a MINIMUM (what the trip NEEDS for its length).
     *  Auto-taps the endpoint's own View More — same request the button
     *  sends — with demand-driven persistence:
     *    · below the minimum → keep tapping, up to 3 taps;
     *    · minimum met but still >1 short of target → one courtesy tap;
     *    · a tap that yields nothing new stops immediately (the area is
     *      genuinely exhausted — looping would just burn calls).
     *  So "3 historical places on a 6-day trip" now re-asks up to three
     *  times before the build proceeds with what exists. */
    async fetchPoolCategory(action, target, minimum = 0) {
      // Live checklist row for this category: the first answer lands as a
      // visible count immediately, and while View More taps run the row keeps
      // its spinner next to the number — so a thin category visibly goes
      // "3…" → "3…" (tap in flight) → "8 ✓" instead of silently resolving
      // once at the end (which made the top-up look like it never ran).
      const row = this.poolProgress?.find(p => p.action === action);
      let recs = await this.fetchPoolAction(action, target);
      if (row) row.count = recs.length;
      // Tap View More for EVERY category until the target is met, not just
      // until the bare minimum is. The old rule stopped after one courtesy tap
      // once the minimum was reached, so a long trip settled for barely enough
      // — and the composer then had no leftovers to fill the later days with.
      // Taps at or above 1 are served cache-first server-side, so persisting
      // is cheap; a tap that returns nothing new still breaks immediately,
      // because that means the area is genuinely exhausted.
      const HARD_TAP_CAP = 5;
      try {
        for (let tap = 1; tap <= HARD_TAP_CAP; tap++) {
          const missing = target - recs.length;
          if (missing <= 0) break;
          if (row) row.more = true;
          const more = await this.fetchPoolAction(
            action, missing,
            recs.map(r => r.placeId).filter(Boolean),
            { viewMore: tap, excludeNames: recs.map(r => r.name).filter(Boolean) },
          );
          const seen = new Set(recs.map(r => r.placeId || r.name));
          const fresh = more.filter(r => !seen.has(r.placeId || r.name));
          if (!fresh.length) break;
          recs = recs.concat(fresh);
          if (row) row.count = recs.length;
        }
      } finally {
        if (row) row.more = false;
      }
      return recs;
    },

    async startPoolBuild() {
      this.fatalError = null;
      this.streaming = true;
      this.stage = 'collecting';
      this.$emit('generation-start');
      this._genAbort = new AbortController();
      const days = this.req?.daysCount || 3;
      try {
        // Optional hotel step: suggest 5 hotels, wait for the user's pick.
        const homeBase = await this.chooseHomeBaseIfRequested();

        // Collect the pool. Each category has a TARGET (what we ask for) and
        // a MINIMUM (what a trip of this length needs before the build should
        // settle) — fetchPoolCategory keeps tapping View More while below the
        // minimum. The math: the composer schedules ~2 meals + ~4 other stops
        // per day, so restaurants must cover days×2 and the non-meal
        // categories together must comfortably cover days×4 (with slack for
        // dedupe and the geofence dropping outliers).
        // Targets raised alongside the server's day capacity: the composer now
        // schedules ~6 activities/day instead of 4, so a pool sized for the old
        // count left the new day-filling pass with nothing to fill days WITH.
        // Rule of thumb: the non-meal categories together must comfortably
        // cover days×6, with slack for dedupe, the geofence and the excursion
        // gate — all of which drop candidates before composition.
        // Targets are derived from what the trip actually CONSUMES rather than
        // from hand-tuned constants. The server schedules ACTS_PER_DAY
        // activities plus two meals per day, and roughly a third of everything
        // collected is lost to dedupe, the geofence and the excursion gate —
        // so aim for demand x OVERSHOOT and split it by category weight.
        // Under-collecting is what starved days 6 and 7 on a week-long trip.
        const ACTS_PER_DAY = 6;           // mirrors activityCapacity('balanced') server-side
        const OVERSHOOT = 1.4;
        const needActs = Math.ceil(days * ACTS_PER_DAY * OVERSHOOT);
        const share = (weight, cap) => Math.max(3, Math.min(cap, Math.ceil(needActs * weight)));
        const plan = [
          //  action        target                   minimum (never settle below this)
          ['restaurants', Math.min(26, days * 3),  days * 2],
          // Non-restaurant shares sum to 1.00 by construction. 'activities'
          // was funded by trimming historical and hidden_gems 0.04 each and
          // photo_spots/shopping 0.02 each — appending without rebalancing
          // would over-collect and burn Google taps.
          ['historical',  share(0.22, 18),         Math.min(14, days + 3)],
          ['hidden_gems', share(0.22, 18),         Math.min(14, days + 3)],
          ['activities',  share(0.12, 14),         Math.min(8, days + 1)],
          ['photo_spots', share(0.18, 16),         Math.min(10, days + 1)],
          ['shopping',    share(0.14, 12),         Math.min(7, Math.ceil(days / 2) + 1)],
          // Events are a calendar lottery — a town may honestly have none this
          // week, so no minimum: never burn taps chasing them.
          ['events',      share(0.12, 10),         0],
        ];
        this.poolProgress = plan.map(([action]) => ({ action, count: null, more: false }));
        // All categories in PARALLEL — restaurants and events (etc.) fetch at
        // the same time, so collection takes roughly one category's time
        // instead of six. The old sequential cross-category exclude list is
        // replaced by the dedupe below: with parallel calls no category can
        // see another's results up front, so overlaps are dropped afterwards
        // in plan order (and the server-side pool build dedupes again anyway).
        // Each checklist row still fills live as its own stream completes.
        const results = await Promise.all(plan.map(async ([action, target, minimum]) => {
          // fetchPoolCategory drives the checklist row live (interim counts
          // while View More taps run); nothing to update here.
          const recs = await this.fetchPoolCategory(action, target, minimum);
          return [action, recs];
        }));
        const pool = {};
        const seen = new Set();
        for (const [action, recs] of results) {
          pool[action] = recs.filter(r => {
            const key = r.placeId || r.name;
            if (!key) return true;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }

        // Compose server-side (pure algorithm, no AI).
        this.stage = 'planning';
        const postBuild = async (foodPass) => {
          const r = await fetch(`${API_BASE}/api/itinerary/build-from-pool`, {
            method: 'POST', headers: this.authHeaders(), signal: this._genAbort.signal,
            body: JSON.stringify({
              daysCount: days,
              nearbyMode: !!this.req?.nearbyMode,
              homeBase,
              hotelBreakfast: !!this.req?.hotelBreakfast,
              // The pool builder used to hardcode 'balanced' and ignore the
              // caller entirely — forwarding this is what lets a request ask
              // for a fuller (or lighter) day on the pool path.
              pace: this.req?.pace || 'balanced',
              // Whole-trip budget (distinct from the per-place preference
              // budget) — the pool build filters/steers stops to fit it.
              tripBudget: this.req?.tripBudget || null,
              foodPass,
              pool,
            }),
          });
          this.$emit('usage-headers', r.headers);
          return { res: r, data: await r.json().catch(() => ({})) };
        };

        let { res, data } = await postBuild(false);

        // ── Excursion food pass ────────────────────────────────────────────
        // The pool was collected around the traveler, so a day out at Garni or
        // Tsaghkadzor has nowhere to eat in it. The server clusters the days,
        // spots which excursions lack local food, and hands back the exact
        // coordinates to search. We fetch restaurants THERE and rebuild once.
        // Clustering runs on activities only, so the second build composes the
        // very same days — just with somewhere to eat.
        if (data.error === 'food_gap' && Array.isArray(data.needFood) && data.needFood.length) {
          this.stage = 'collecting';
          this.poolProgress = data.needFood.map(g => ({ action: 'nearbyFood', day: g.dayNumber, count: null, more: false }));
          const known = new Set(pool.restaurants.map(r => r.placeId || r.name));
          const found = await Promise.all(data.needFood.map(async (gap, i) => {
            const recs = await this.fetchPoolAction('restaurants', 6, [...known].filter(Boolean), {
              location: { lat: gap.lat, lng: gap.lng },
            });
            if (this.poolProgress?.[i]) this.poolProgress[i].count = recs.length;
            return recs;
          }));
          for (const rec of found.flat()) {
            const key = rec.placeId || rec.name;
            if (key && known.has(key)) continue;
            if (key) known.add(key);
            pool.restaurants.push(rec);
          }
          this.poolProgress = null;
          this.stage = 'planning';
          // foodPass: true — the server proceeds even if the area genuinely
          // has no restaurants, so this can never loop.
          ({ res, data } = await postBuild(true));
        }

        if (data.success && data.itinerary) {
          this.poolProgress = null;
          this.itinerary = data.itinerary;
          this.$emit('created', data.itinerary._id, { destination: data.itinerary.destination?.name || '', daysCount: data.itinerary.daysCount });
        } else if (data.error === 'pool_too_small') {
          // Thin pool (small town) → the LLM-skeleton path knows more.
          this.poolProgress = null;
          if (homeBase && this.req) this.req.homeBase = homeBase;
          // The hotel question was already answered (picked or skipped) —
          // startGeneration also runs the chooser now, so switch it off or
          // the fallback would ask the user to pick a hotel a second time.
          if (this.req) { this.req.pickHotel = false; this.req.prefetchedHotels = null; }
          this.streaming = false; this.stage = null;
          this.$emit('generation-end');
          return this.startGeneration();
        } else {
          this.fatalError = data.userMessage || data.message || this.L.genericError;
          this.$emit('error', data);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Pool build failed:', e);
          this.fatalError = this.L.genericError;
        } else if (!this.days.length) {
          // User pressed Stop before anything was built — without this, the
          // "Planning your trip…" skeleton shimmers forever. The error block
          // renders it with a Retry button (request is still set).
          this.fatalError = this.L.stoppedMessage;
        }
      } finally {
        this.poolProgress = null;
        this.hotelChoices = null;
        this.findingHotels = false;
        this.streaming = false;
        this.stage = null;
        this._genAbort = null;
        this.$emit('hotel-choice', false); // safety net for abort/error paths
        this.$emit('generation-end');
      }
    },

    selectHotel(h) {
      // A real pick detours through the breakfast question; Skip resolves
      // straight away (no hotel → nothing to have breakfast at).
      if (h) { this.breakfastAsk = h; return; }
      if (this.req) this.req.hotelBreakfast = false;
      if (this._hotelResolve) { this._hotelResolve(h); this._hotelResolve = null; }
    },
    answerBreakfast(yes) {
      if (this.req) this.req.hotelBreakfast = !!yes;
      const picked = this.breakfastAsk;
      this.breakfastAsk = null;
      if (this._hotelResolve) { this._hotelResolve(picked); this._hotelResolve = null; }
    },

    /* ── generation stream ───────────────────────────────────── */
    /* Shared hotel step: suggest 5 hotels, wait for the user's pick, return
     * the resolved home base (or the request's typed one, or null). Used by
     * BOTH build paths — previously it lived only in startPoolBuild, so a
     * generate-stream build (usePool: false, e.g. a chat-named destination)
     * silently ignored "Suggest hotels". fetchPoolAction is destination-aware,
     * so for a chat-named city the suggestions center on THAT city. */
    async chooseHomeBaseIfRequested() {
      let homeBase = this.req?.homeBase || null;
      if (this.req?.pickHotel) {
        // Header says "Finding hotels for you…" (not "Planning your trip…")
        // while this fetch runs — the trip isn't being planned yet.
        this.findingHotels = true;
        // The clarifier prefetches hotels the moment "Suggest hotels" is
        // toggled, so by the time Build is pressed the list is usually
        // already here. The handed-over promise never rejects (it resolves
        // null on failure) — any miss falls back to our own fetch.
        let hotels = null;
        if (this.req.prefetchedHotels) {
          try { hotels = await this.req.prefetchedHotels; } catch (_) { hotels = null; }
        }
        if (!Array.isArray(hotels) || !hotels.length) hotels = await this.fetchPoolAction('hotels', 5);
        this.findingHotels = false;
        if (hotels.length) {
          this.hotelChoices = hotels;
          // Pause the parent's lamp while the chooser is on screen — its dust
          // was covering the first hotel cards. It resumes after pick/skip.
          this.$emit('hotel-choice', true);
          const picked = await new Promise(resolve => { this._hotelResolve = resolve; });
          this.hotelChoices = null;
          this.breakfastAsk = null;
          this.$emit('hotel-choice', false);
          if (picked) homeBase = { name: picked.name, placeId: picked.placeId || null, lat: picked.latitude, lng: picked.longitude };
        }
      }
      return homeBase;
    },

    async startGeneration() {
      this.fatalError = null;
      this.streaming = true;
      this.stage = 'planning';
      this.$emit('generation-start');
      this._genAbort = new AbortController();
      try {
        // Same optional hotel step as the pool path (no-op unless pickHotel).
        const homeBase = await this.chooseHomeBaseIfRequested();
        this.stage = 'planning';
        const res = await fetch(`${API_BASE}/api/itinerary/generate-stream`, {
          method: 'POST', headers: this.authHeaders(),
          body: JSON.stringify({ ...this.req, homeBase, prefetchedHotels: undefined }),
          signal: this._genAbort.signal,
        });
        this.$emit('usage-headers', res.headers);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          this.fatalError = err.userMessage || err.message || this.L.genericError;
          this.$emit('error', err);
          return;
        }
        await this.consumeStream(res);
      } catch (e) {
        if (e.name === 'AbortError') {
          // User pressed Stop — keep whatever arrived; backend halts on disconnect.
          // Nothing arrived at all → show the stopped state instead of an
          // eternal "Planning your trip…" skeleton.
          if (!this.days.length) this.fatalError = this.L.stoppedMessage;
        } else {
          console.error('Itinerary generation failed:', e);
          this.fatalError = this.L.genericError;
        }
      } finally {
        this.streaming = false;
        this.stage = null;
        this._genAbort = null;
        this.$emit('generation-end');
      }
    },

    /** Called imperatively by JinniChat's Stop button (ref registry). */
    abortGeneration() {
      try { this._genAbort?.abort(); } catch (_) {}
      try { this.candAbort?.abort(); } catch (_) {}
      this.breakfastAsk = null;
      if (this._hotelResolve) { this._hotelResolve(null); this._hotelResolve = null; }
    },

    async regenerateDay() {
      if (!this.itinerary?._id) return;
      const dayNumber = this.activeDay;
      this.streaming = true;
      this.stage = 'planning';
      this.$emit('generation-start');
      this._genAbort = new AbortController();
      try {
        const res = await fetch(`${API_BASE}/api/itinerary/${this.itinerary._id}/regenerate-day-stream`, {
          method: 'POST', headers: this.authHeaders(),
          body: JSON.stringify({ dayNumber }),
          signal: this._genAbort.signal,
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); this.$emit('error', err); return; }
        await this.consumeStream(res);
      } catch (e) { if (e.name !== 'AbortError') console.error('Day regeneration failed:', e); }
      finally { this.streaming = false; this.stage = null; this._genAbort = null; this.$emit('generation-end'); }
    },

    /** Shared SSE consumer — identical wire format to chat/quick-action streams. */
    async consumeStream(response) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';
        for (const chunk of chunks) {
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            let data;
            try { data = JSON.parse(line.slice(6)); } catch (_) { continue; }
            this.handleEvent(data);
          }
        }
      }
    },

    handleEvent(data) {
      switch (data.type) {
        case 'status':
          this.stage = data.stage;
          break;
        case 'meta':
          this.itinerary = {
            _id: data.itineraryId, title: data.title,
            destination: data.destination, daysCount: data.daysCount,
            startDate: data.startDate, pace: data.pace, homeBase: data.homeBase,
            nearbyMode: !!data.nearbyMode,
            days: [], status: 'generating',
          };
          this.$emit('created', data.itineraryId, { destination: data.destination?.name || '', daysCount: data.daysCount });
          break;
        case 'skeleton': {
          if (!this.itinerary) break;
          for (const incoming of data.days) {
            const slots = incoming.slots.map(s => ({ locked: false, status: 'pending', place: null, ...s }));
            const existing = this.itinerary.days.find(d => d.dayNumber === incoming.dayNumber);
            if (existing) { existing.title = incoming.title; existing.slots = slots; }
            else this.itinerary.days.push({ dayNumber: incoming.dayNumber, title: incoming.title, slots });
          }
          this.itinerary.days.sort((a, b) => a.dayNumber - b.dayNumber);
          if (!this.itinerary.days.some(d => d.dayNumber === this.activeDay)) this.activeDay = this.itinerary.days[0].dayNumber;
          break;
        }
        case 'slot_enriched': {
          const slot = this.findSlot(data.dayNumber, data.slotId);
          if (slot) { slot.place = data.place; slot.status = 'enriched'; }
          break;
        }
        case 'slot_failed': {
          const slot = this.findSlot(data.dayNumber, data.slotId);
          if (slot) { slot.status = 'failed'; slot.failedReason = data.reason || null; }
          break;
        }
        case 'complete':
          if (data.itinerary) this.itinerary = data.itinerary;
          break;
        case 'error':
          if (!this.days.length) this.fatalError = data.message || this.L.genericError;
          break;
      }
    },

    /** Checklist row label — category name, or the excursion food pass. */
    poolRowLabel(row) {
      if (row.action === 'nearbyFood') return this.L.foodNearDay.replace('{n}', row.day);
      return this.L.cat[row.action] || row.action;
    },

    /** Why this slot has no place, in the user's words. */
    failedNote(slot) {
      if (slot.failedReason === 'duplicate') return this.L.notVerifiedDuplicate;
      if (slot.failedReason === 'out_of_area') return this.L.notVerifiedFar;
      return this.L.notVerified;
    },

    findSlot(dayNumber, slotId) {
      const day = this.itinerary?.days?.find(d => d.dayNumber === dayNumber);
      return day?.slots.find(s => s.slotId === slotId) || null;
    },

    /* ── structural edits (CRUD, no AI) ──────────────────────── */
    /* ── Inline day-title rename ─────────────────────────────────────────
       Enter/blur saves, Esc cancels. Saving an unchanged title is a no-op;
       clearing the field reverts the title to auto (server regenerates it).
       The saved/cancelled guard exists because Enter triggers blur too. */
    startDayTitleEdit() {
      this.dayTitleDraft = this.currentDay?.title || '';
      this.editingDayTitle = true;
      this.$nextTick(() => { this.$refs.dayTitleInput?.focus(); this.$refs.dayTitleInput?.select(); });
    },
    cancelDayTitleEdit() {
      this.editingDayTitle = false;   // saveDayTitle's guard sees this and no-ops on the trailing blur
    },
    async saveDayTitle() {
      if (!this.editingDayTitle) return;
      this.editingDayTitle = false;
      const next = this.dayTitleDraft.trim().slice(0, 60);
      if (next === (this.currentDay?.title || '')) return;
      await this.patchOp({ op: 'renameDay', dayNumber: this.activeDay, title: next });
    },
    /* A failed edit used to be invisible: console.error and nothing else, so
       the button simply appeared not to work. Failures now surface, and a
       version conflict (someone edited from another tab, or a day
       regeneration landed) is retried once against fresh state rather than
       reported as an error. */
    async patchOp(body, { isRetry = false } = {}) {
      if (!this.itinerary?._id || this.busy) return false;
      this.busy = true;
      this.editError = null;
      try {
        const res = await fetch(`${API_BASE}/api/itinerary/${this.itinerary._id}`, {
          method: 'PATCH', headers: this.authHeaders(), body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          this.itinerary = data.itinerary;
          // The day being viewed may have been pruned (trailing empty days
          // self-clean server-side) — snap to the last remaining day.
          if (!this.days.some(d => d.dayNumber === this.activeDay)) {
            this.activeDay = this.days.length ? this.days[this.days.length - 1].dayNumber : 1;
          }
          return true;
        }
        if (res.status === 409 && !isRetry) {
          this.busy = false;
          await this.loadExisting();               // re-read, then replay once
          return this.patchOp(body, { isRetry: true });
        }
        this.editError = this.L.editFailed;
        return false;
      } catch (e) {
        console.error('Itinerary edit failed:', e);
        this.editError = this.L.editFailed;
        return false;
      } finally { this.busy = false; }
    },

    /* ── per-slot like / dislike ─────────────────────────────────────────────
       Toggle semantics match the chat cards: tapping the active side clears
       the vote. Optimistic UI — the icon flips immediately; on request failure
       the previous value is restored. The backend also syncs PlaceFeedback so
       a dislike hides this place from future candidates and itineraries. */
    async slotFeedback(slot, vote) {
      if (!this.itinerary?._id || this.feedbackBusyId) return;
      const next = slot.feedback === vote ? null : vote;
      const previous = slot.feedback ?? null;
      slot.feedback = next;                     // optimistic
      this.feedbackBusyId = slot.slotId;
      try {
        const res = await fetch(`${API_BASE}/api/itinerary/${this.itinerary._id}/slot-feedback`, {
          method: 'POST', headers: this.authHeaders(),
          body: JSON.stringify({ dayNumber: this.activeDay, slotId: slot.slotId, feedback: next }),
        });
        const data = await res.json();
        if (!data.success) slot.feedback = previous;   // roll back
      } catch (e) {
        slot.feedback = previous;
        console.error('Slot feedback failed:', e);
      } finally { this.feedbackBusyId = null; }
    },

    /* ── per-slot save ───────────────────────────────────────────────────────
       The itinerary Place shape → a rec-card-shaped object, so JinniChat's
       existing toggleSave()/savedKeys machinery works unchanged. Slots may be
       Google places (placeId → saved as googlePlaceId + snapshot) OR business
       recommendations (verifiedId → saved as verifiedId). The identity fields
       are passed through untouched so getRecRef() picks the right ref, using
       the same precedence as JinniChat: verifiedId first, then placeId.
       Note the field mapping mirrors toggleSave's snapshot:
       rec.location = full address, rec.region = short area. */
    slotToRec(slot) {
      const p = slot.place || {};
      return {
        placeId:     p.placeId || null,
        verifiedId:  p.verifiedId || null,
        _verifiedModel: p.verifiedModel || p._verifiedModel || null,
        id:          p.id || null,
        name:        p.name || slot.name,
        category:    this.L.cat?.[slot.category] || slot.category || null,
        type:        slot.category || null,
        description: p.description || slot.note || '',
        image:       p.image    || '',
        location:    p.location || '',
        region:      p.region   || '',
        rating:      p.rating   ?? null,
        website:     p.website  || '',
        latitude:    p.latitude  ?? null,
        longitude:   p.longitude ?? null,
        partnerTier: p.partnerTier || null,
      };
    },
    /* The savedKeys key for a slot — verifiedId beats placeId, matching
       JinniChat's getRecRef(). Null → the place has no saveable identity
       and the ribbon is hidden. */
    slotRefId(slot) {
      const p = slot.place || {};
      return p.verifiedId || p.placeId || null;
    },
    isSlotSaved(slot) {
      const key = this.slotRefId(slot);
      return !!(key && this.savedKeys && typeof this.savedKeys.has === 'function' && this.savedKeys.has(key));
    },

    /* ── partner tier (badge + card tint) ────────────────────────────────────
       Mirrors JinniChat's getPartnerLabel / getPartnerIcon / getPartnerLabelClass
       / getPartnerWrapperClass, keyed on the slot's stored place instead of a
       rec card. Verified BUSINESSES only — destinations are public sites, not
       paying partners, so they sit outside the verified/spotlight/signature
       ladder (same rule as the chat). Returns '' | 'verified' | 'spotlight'
       | 'signature'. */
    slotTier(slot) {
      const p = slot.place || {};
      if (!p.verifiedId) return '';
      if (p.verifiedModel === 'destination' || p._verifiedModel === 'destination') return '';
      const tier = p.partnerTier;
      if (tier === 'featured' || tier === 'signature') return 'signature';
      if (tier === 'spotlight') return 'spotlight';
      return 'verified';
    },
    /* Wrapper class on .itin-slot — the card-glow--* equivalent. Enriched
       slots only, so shimmer/failed cards never pick up a tint. */
    slotTierClass(slot) {
      const t = slot.status === 'enriched' ? this.slotTier(slot) : '';
      return t ? `itin-tier--${t}` : '';
    },
    tierLabel(slot) {
      const t = this.slotTier(slot);
      if (t === 'signature') return "Jinni's Signature";
      if (t === 'spotlight') return "Jinni's Spotlight";
      return 'Jinni Verified';
    },
    /* Solid tier colour for the rail number badge — the rec map's cardNumStyle
       palette, so a business stop's number matches its map pin. null for
       non-business slots (and pending/failed), which keep the day colour. */
    slotTierHex(slot) {
      const t = slot.status === 'enriched' ? this.slotTier(slot) : '';
      return t === 'signature' ? '#D4AF37'
        : t === 'spotlight' ? '#3b9edd'
        : t === 'verified' ? '#4CAF50'
        : null;
    },
    /* Same SVGs as JinniChat's getPartnerIcon (star / sun / check). */
    tierIcon(slot) {
      const t = this.slotTier(slot);
      if (t === 'signature') { return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`; }
      if (t === 'spotlight') { return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/></svg>`; }
      return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
    },

    /* ── replace / add: reuse the EXISTING quick-action-stream ── */
    openReplace(slot) { this.addFor = null; this.replaceFor = slot; this.fetchCandidates(slot.category); },
    closeReplace() { this.replaceFor = null; this.candidates = []; this.candAbort?.abort(); },
    // Shopping asks "what are you shopping for?" first (like the chat clarifier);
    // every other category searches straight away.
    onAddCategory(category) {
      if (category === 'shopping') { this.shopSubOpen = true; return; }
      this.openAdd(category);
    },
    openAdd(category, subType = null) {
      this.replaceFor = null; this.addOpen = false; this.shopSubOpen = false;
      this.addFor = category;
      this.fetchCandidates(category, subType);
    },
    closeAdd() { this.addFor = null; this.shopSubOpen = false; this.candidates = []; this.candAbort?.abort(); },

    /* ── "From saved": the user's own saved places, geofenced to this trip
       server-side and returned rec-shaped, so the rich candidate cards and
       the addSlot PATCH op consume them unchanged. ── */
    openSavedAdd() {
      this.replaceFor = null; this.addOpen = false; this.shopSubOpen = false;
      this.addFor = '__saved';
      this.fetchSavedCandidates();
    },
    async fetchSavedCandidates() {
      this.candidates = [];
      this.candidatesLoading = true;
      this.candAbort?.abort();
      this.candAbort = new AbortController();
      try {
        const res = await fetch(`${API_BASE}/api/itinerary/${this.itinerary._id}/saved-candidates`, {
          headers: this.authHeaders(false), signal: this.candAbort.signal,
        });
        const data = await res.json();
        if (data.success) this.candidates = data.candidates || [];
      } catch (e) { if (e.name !== 'AbortError') console.error('Saved candidates failed:', e); }
      finally { this.candidatesLoading = false; }
    },

    /* Move a stop to another day — backend op existed all along. The slot
       lands at the end of the target day (reorder there with up/down). */
    async moveSlotToDay(slot, toDay) {
      await this.patchOp({ op: 'moveSlotToDay', dayNumber: this.activeDay, slotId: slot.slotId, toDay });
      this.moveFor = null;
    },

    async fetchCandidates(category, subType = null) {
      this.candidates = [];
      this.candidatesLoading = true;
      this.candAbort?.abort();
      this.candAbort = new AbortController();
      const action = CATEGORY_TO_ACTION[category] || 'hidden_gems';
      // Everything already in the itinerary is excluded — the whole point of
      // reusing quick-action-stream is that its exclude/ranking machinery,
      // community feedback and PlaceCache all come along for free.
      const excludePlaceIds = []; const excludeNames = [];
      for (const d of this.days) for (const s of d.slots) {
        if (s.place?.placeId) excludePlaceIds.push(s.place.placeId);
        excludeNames.push(s.place?.name || s.name);
      }
      try {
        const res = await fetch(`${API_BASE}/api/ai/quick-action-stream`, {
          method: 'POST', headers: this.authHeaders(), signal: this.candAbort.signal,
          body: JSON.stringify({
            action, count: 5, actionType: 'quick_action',
            excludePlaceIds: [...new Set(excludePlaceIds)],
            excludeNames: [...new Set(excludeNames)],
            // Follow the trip's own geofence. Hardcoding false here offered
            // 60 km replacements on a 5 km walking trip — exactly what the
            // server-side geofence exists to prevent.
            nearbyMode: !!this.itinerary?.nearbyMode,
            ...(subType && { subType }),   // shopping sub-type ('souvenirs', 'market', …)
            location: this.itinerary?.destination ? { lat: this.itinerary.destination.lat, lng: this.itinerary.destination.lng } : undefined,
          }),
        });
        if (!res.ok) { this.candidatesLoading = false; return; }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if ((data.type === 'complete' || data.type === 'recommendations') && data.recommendations?.length) {
                  // Bound candidates by THIS trip's radius, not a fixed 60 km.
                  const maxKm = Number.isFinite(this.itinerary?.radiusKm) && this.itinerary.radiusKm > 0
                    ? this.itinerary.radiusKm : 60;
                  this.candidates = data.recommendations
                    .filter(r => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
                    .filter(r => !Number.isFinite(r.distanceKm) || r.distanceKm <= maxKm)
                    .slice(0, 6);
                }
              } catch (_) {}
            }
          }
        }
      } catch (e) { if (e.name !== 'AbortError') console.error('Candidate fetch failed:', e); }
      finally { this.candidatesLoading = false; }
    },

    async pickCandidate(rec) {
      if (this.replaceFor) {
        const slot = this.replaceFor;
        await this.patchOp({ op: 'replaceSlot', dayNumber: this.activeDay, slotId: slot.slotId, place: rec, category: slot.category });
        this.closeReplace();
      } else if (this.addFor) {
        const category = this.addFor === '__saved' ? (rec.suggestedCategory || 'hidden_gems') : this.addFor;
        await this.patchOp({ op: 'addSlot', dayNumber: this.activeDay, place: rec, category });
        this.closeAdd();
      }
    },

    /* "Ask AI" — same as the chat card's ask button. The slot's place is
       reshaped to a rec (slotToRec) so JinniChat's handleRecommendationClick
       consumes it unchanged (category-aware prompt, tracking, cooldown). */
    askAi(slot) { this.$emit('ask-ai', this.slotToRec(slot)); },

    /* Touch reveal — the chat card's handleCardTouchStart/End recipe: while
       a finger is on the card (including scroll-throughs) `.touch-active`
       shows the More info / Ask AI overlay and the save ribbon; it clears
       200ms after the finger lifts. The PERSISTENT reveal after the finger
       lifts comes from the browser's emulated sticky :hover (the ungated
       .itin-card:hover overlay rule) — same mechanism as the chat card, and
       it dismisses natively when the user taps elsewhere. */
    cardTouchStart(e) {
      e.currentTarget.classList.add('touch-active');
      // Mark that the next click on a card originated from touch, so
      // onCardClick can swallow it (chat parity: on touch, a card tap only
      // reveals the overlay; the info modal opens from the More pill).
      this._cardTouched = true;
    },
    cardTouchEnd(e) {
      const card = e.currentTarget;
      setTimeout(() => { card.classList.remove('touch-active'); }, 200);
      // Safety valve for hybrid (touch + mouse) devices: if no click follows
      // this touch (e.g. it was a scroll), don't let the flag swallow a later
      // genuine mouse click.
      clearTimeout(this._cardTouchReset);
      this._cardTouchReset = setTimeout(() => { this._cardTouched = false; }, 700);
    },
    /* Card click. The chat's recommendation-card has NO click handler at all —
       on touch the tap only reveals the overlay and everything routes through
       the pills. We keep the desktop nicety (mouse click opens the info
       modal) but swallow touch-originated clicks for chat parity; without
       this, the reveal tap would immediately open the modal over the overlay. */
    onCardClick(slot) {
      if (this._cardTouched) { this._cardTouched = false; return; }
      this.$emit('view-place', slot.place);
    },

    /* Open the photo gallery (parent's requestImages). Mirrors the card's
       image button: show a spinner while it resolves. The parent signals
       completion via the `done` callback; a safety timeout clears the spinner
       if an older parent doesn't pass one back. */
    openPhotos(slot) {
      if (this.photoLoadingId) return;   // one gallery opening at a time
      this.photoLoadingId = slot.slotId;
      const done = () => { if (this.photoLoadingId === slot.slotId) this.photoLoadingId = null; };
      this.$emit('view-photos', slot.place, done);
      clearTimeout(this._photoTimer);
      this._photoTimer = setTimeout(done, 15000);
    },

    /* Hotel-chooser photo gallery — same flow as slot cards, keyed on the
       hotel itself (chooser hotels have no slotId yet). */
    hotelKey(h) { return `hotel-${h.placeId || h.name}`; },
    /* Candidate-chooser photo gallery — same flow, keyed on the candidate
       (candidates have no slotId). */
    candKey(c) { return `cand-${c.placeId || c.id || c.name}`; },
    openCandPhotos(c) {
      if (this.photoLoadingId) return;
      const key = this.candKey(c);
      this.photoLoadingId = key;
      const done = () => { if (this.photoLoadingId === key) this.photoLoadingId = null; };
      this.$emit('view-photos', c, done);
      clearTimeout(this._photoTimer);
      this._photoTimer = setTimeout(done, 15000);
    },
    openHotelPhotos(h) {
      if (this.photoLoadingId) return;
      const key = this.hotelKey(h);
      this.photoLoadingId = key;
      const done = () => { if (this.photoLoadingId === key) this.photoLoadingId = null; };
      this.$emit('view-photos', h, done);
      clearTimeout(this._photoTimer);
      this._photoTimer = setTimeout(done, 15000);
    },

    onMapStopClick(slot) {
      this.flashSlotId = slot.slotId;
      this.$nextTick(() => {
        this.slotEls[slot.slotId]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { this.flashSlotId = null; }, 1400);
      });
    },
  },
};
</script>

<style scoped>
/* ── Glacier design tokens — same recipes as JinniChat ──
   buttons: view-more-btn (blur 12px sat 160%; day rgba(255,255,255,.5)+#A0522D+
   inset white ring; night rgba(255,255,255,.08)+#c084fc+inset ring)
   cards: recommendation-card (blur 20px sat 180%; day rgba(255,255,255,.5)+
   soft brown glow; night rgba(255,255,255,.06)) */
.itin.day-mode {
  /* Verified against JinniChat (day): view-more-btn = #A0522D on white-glass
     0.5 + 1px white ring; action-chip text = rgba(92,74,66,0.85); card =
     recommendation-card (0.5 + brown glow); headings #8B4513. */
  --it-text: #A0522D;                       /* buttons (view-more recipe) */
  --it-chip-text: rgba(92,74,66,0.85);      /* chips (action-chip recipe) */
  --it-heading: #8B4513;                    /* clarifier-title day colour */
  --it-biz: #3c2a1e; 
  --it-muted: #5a4a42;
  --it-glass: rgba(255,255,255,0.5); 
  --it-glass-hover: rgba(255,255,255,0.75);
  --it-ring: inset 0 0 0 1px rgba(255,255,255,0.6);
  --it-ring-hover: inset 0 0 0 1px rgba(255,255,255,0.9);
  --it-chip-ring: inset 0 0 0 1px rgba(255,255,255,0.6);
  --it-chip-bg: rgba(255,255,255,0.5); 
  --it-chip-bg-hover: rgba(255,255,255,0.75);
  --it-card-bg: rgba(255,255,255,0.5);
  --it-card-shadow:inset 0 0 0 1px rgba(255,255,255,0.6);
  --it-line: rgba(160,82,45,0.22);
  --it-shimmer: rgba(160,82,45,0.10); 
  --it-shimmer-glint: rgba(255,255,255,0.5);
}
.itin.night-mode {
  /* Verified against JinniChat (night): view-more-btn = #c084fc on 0.08 +
     1.5px ring; action-chip = #94a3b8 on 0.06 + 0.7px ring (hover 0.14 +
     0.8px); body/name text #d5dce4, secondary #94a3b8. */
  --it-text: #c084fc;                       /* buttons (view-more recipe) */
  --it-chip-text: #94a3b8;                  /* chips (action-chip recipe) */
  --it-heading: #94a3b8;                    /* clarifier-title night colour */
  --it-biz: #d5dce4; 
  --it-muted: #94a3b8;
  --it-glass: rgba(255,255,255,0.08); 
  --it-glass-hover: rgba(255,255,255,0.14);
  --it-ring: inset 0 0 0 1px rgba(255,255,255,0.1);
  --it-ring-hover: inset 0 0 0 1px rgba(255,255,255,0.1);
  --it-chip-ring: inset 0 0 0 0.7px rgba(255,255,255,0.1);
  --it-chip-bg: rgba(255,255,255,0.06); 
  --it-chip-bg-hover: rgba(255,255,255,0.14);
  --it-card-bg: rgba(139,92,246,0.15);
  --it-card-shadow: 0 0 1px rgba(0,0,0,0.50), inset 0 0 0 0.7px rgba(255,255,255,0.05);
  --it-line: rgba(255,255,255,0.14);
  --it-shimmer: rgba(255,255,255,0.08); 
  --it-shimmer-glint: rgba(255,255,255,0.08);
}

.itin { margin-top: 10px; color: var(--it-biz); }

/* ── Header ── */
.itin-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.itin-head-main { flex: 1; min-width: 0; }
.itin-title { font-weight: 800; font-size: 1rem; line-height: 1.3; color: var(--it-heading); }
.itin-sub { font-size: 0.78125rem; color: var(--it-muted); margin-top: 2px; }
.itin-estimate { font-size: 0.78125rem; font-weight: 700; color: var(--it-heading); margin-top: 3px; }
.itin-estimate-note { font-weight: 400; color: var(--it-muted); font-size: 0.71875rem; }
.itin-stage { margin-left: 8px; font-style: italic; animation: itin-pulse 1.4s ease-in-out infinite; }
@keyframes itin-pulse { 50% { opacity: 0.35; } }

/* Inline edit failure — same glass recipe, tighter, sits above the day. */
.itin-error--inline {
  justify-content: space-between; margin-bottom: 10px;
  padding: 8px 10px 8px 12px; font-size: 0.78125rem;
}
.itin-error--inline .itin-icon { color: #e05555; flex: none; }

.itin-error {
  padding: 11px 14px; border-radius: 14px; font-size: 0.84375rem;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: #e05555; background: rgba(224,85,85,0.1); box-shadow: inset 0 0 0 1px rgba(224,85,85,0.25);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
}

/* ── Shimmer (skeleton) ── */
.shimmer { position: relative; overflow: hidden; background: var(--it-shimmer); border-radius: 8px; }
.shimmer::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, var(--it-shimmer-glint), transparent);
  animation: itin-shimmer 1.5s infinite; }
@keyframes itin-shimmer { 100% { transform: translateX(100%); } }

.itin-skeleton { padding: 4px 0; }
.itin-sk-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
.itin-sk-tab { width: 64px; height: 30px; border-radius: 999px; }
.itin-sk-row { display: flex; align-items: center; gap: 10px; margin: 12px 0; }
.itin-sk-dot { width: 26px; height: 26px; border-radius: 50%; flex: none; }
.itin-sk-line { height: 12px; border-radius: 6px; display: inline-block; }

/* ── Pool collection checklist ── */
.itin-pool-progress { margin-bottom: 12px; display: flex; flex-direction: column; gap: 7px; }
.itin-pool-row { display: flex; align-items: center; gap: 9px; font-size: 0.8125rem; color: var(--it-muted); }
.itin-pool-row.is-done { color: var(--it-biz); }
.itin-pool-row svg { color: #27ae60; flex: none; }
.itin-pool-label { flex: 1; }
.itin-pool-count { font-weight: 700; color: var(--it-text); font-variant-numeric: tabular-nums; }
/* Pending rows: a small static dim dot. Only the row whose fetch is in
   flight (.is-active) pulses — one dot walks down the list as checkmarks
   accumulate above it, instead of six rings spinning at once. */
.itin-pool-spinner {
  width: 8px; height: 8px; margin: 0 2px; border-radius: 50%; flex: none;
  background: currentColor; opacity: .25;
}
.itin-pool-spinner.is-active { animation: itinPoolPulse 1.1s ease-in-out infinite; }
@keyframes itinPoolPulse { 50% { opacity: 1; transform: scale(1.35); } }
/* Keep: the photo-button loading arc (.itin-loading-icon) still spins. */
@keyframes itinPoolSpin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .itin-pool-spinner.is-active { animation: none; opacity: .6; }
}

/* ── Day tabs — glacier chips; active carries the day colour ── */
.itin-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 10px; scrollbar-width: none; }
.itin-tabs::-webkit-scrollbar { display: none; }
.itin-tab {
  flex: none; border: none; cursor: pointer;
  border-radius: 999px; padding: 7px 14px; font-size: 0.8125rem; font-weight: 700;
  display: flex; flex-direction: column; align-items: center; line-height: 1.15;
  color: var(--it-chip-text); background: var(--it-chip-bg);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: all 0.25s ease;
}
.itin-tab:hover { background: var(--it-chip-bg-hover); box-shadow: var(--it-chip-ring); }
/* Active tab is styled inline (tinted glass in the day's colour); the base
   glass/backdrop-filter above stays in effect, so it reads as glacier glass
   rather than a solid pill. */
.itin-tab.active { font-weight: 800; }
.itin-tab-date { font-size: 0.65625rem; font-weight: 500; opacity: 0.85; }

.itin-day-title { font-weight: 700; font-size: 1.125rem; margin: 4px 0 10px;
  display: flex; align-items: center; gap: 7px; min-width: 0; }
.itin-day-title-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Pencil — quiet until pointed at; inherits the day colour via currentColor */
.itin-day-title-edit { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; border-radius: 7px; cursor: pointer;
  background: transparent; color: currentColor; opacity: 0.45; padding: 0;
  transition: opacity 0.15s ease, background 0.15s ease; }
.itin-day-title-edit:hover:not(:disabled) { opacity: 1; background: var(--it-chip-bg-hover); }
.itin-day-title-edit:disabled { opacity: 0.2; cursor: default; }
/* Inline input — same type as the title it replaces, day-coloured underline */
.itin-day-title-input { flex: 1; min-width: 0; font: inherit; color: inherit;
  background: transparent; border: none; border-bottom: 2px solid currentColor;
  outline: none; padding: 0 0 2px; border-radius: 0; }

/* ── Slots timeline ── */
.itin-slots { margin-top: 12px; }
.itin-slot { display: flex; gap: 10px; }
.itin-slot.is-flash .itin-card { box-shadow: 0 0 0 2px currentColor; transition: box-shadow 0.3s; }
/* Slot state hooks: pending number dims with the shimmer; failed number
   carries the same amber as the failed card ring. */
.itin-slot.is-pending .itin-slot-num { opacity: 0.55; }
/* Failed (couldn't verify) — number badge is solid red, matching the failed
   card's accent, so the broken stop is spottable at a glance in the rail. */
.itin-slot.is-failed .itin-slot-num {
  background: #e05555;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(224,85,85,0.35), inset 0 0 0 1px rgba(255,255,255,0.25);
}
/* …and its time label carries the same red, so the whole row reads as broken. */
.itin-slot.is-failed .itin-slot-time { color: #e05555; }
.itin-slot-rail { display: flex; flex-direction: column; align-items: center; flex: none; }
.itin-slot-num {
  width: 26px; height: 26px; border-radius: 50%; color: #fff; font-size: 0.78125rem; font-weight: 800;
  display: grid; place-items: center; flex: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.25);
}
.itin-slot-line { flex: 1; width: 2px; background: var(--it-line); margin: 4px 0; min-height: 18px; }
.itin-slot-body { flex: 1; min-width: 0; padding-bottom: 14px; }

.itin-slot-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.itin-slot-time { font-size: 0.75rem; font-weight: 800; color: var(--it-text); font-variant-numeric: tabular-nums; }
.itin-slot-cat { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;
  color: var(--it-muted); margin-right: auto; }

/* ── Cards — recommendation-card recipe ──
   Same anatomy as the chat's ordinary recommendation card on ALL widths:
   photo flush to the card edges at the chat card's fixed 140px height
   (.rec-image recipe), name/region/note padded below. Mobile is full-width
   (like ordinary cards on phones); desktop is capped near the ordinary
   card's grid size. */
.itin-card {
  display: flex; flex-direction: column; align-items: stretch; gap: 0;
  border-radius: 12px; padding: 0; cursor: pointer; overflow: hidden;
  background: var(--it-card-bg); box-shadow: var(--it-card-shadow);
  backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.3s ease;
}
.itin-card:hover { background: var(--it-glass-hover); }
.itin-card--sk, .itin-card--failed { cursor: default; }
.itin-card--sk:hover { background: var(--it-card-bg); }
.itin-card--failed:hover { background: rgba(224,85,85,0.06); }
.itin-card-imgwrap {
  position: relative;
  /* Width-driven height (like the chat card / Explore grid) so the photo keeps
     its shape instead of being zoom-cropped into a fixed 140px letterbox. 16:9
     is deliberately shorter than the chat card's 3:2 — the itinerary is a DENSE
     list of many stops, so compact beats tall here. ~225px desktop (400w),
     ~214px mobile (~380w). */
  width: 100%; aspect-ratio: 16 / 9;
  border-radius: 0; overflow: hidden; flex: none;
}
.itin-card-img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.itin-card-info { padding: 12px 12px 10px; }
.itin-card--sk .itin-card-lines { padding: 10px 12px; }
.itin-card--failed { padding: 10px 12px; }

/* Desktop: ordinary cards live in a minmax(250px,1fr) grid (~250–320px
   rendered), so cap the itinerary card near the top of that range instead
   of stretching the whole slot like the inline/large chat cards do. The
   time/category/lock row above and the actions row below are capped to the
   SAME width, so the lock button hugs the card's right edge instead of
   drifting to the far side of the slot. */
@media (min-width: 481px) {
  .itin-slot-body { --it-card-max: 400px; }
  .itin-card { width: 100%; max-width: var(--it-card-max); }
  /* Badge joins the same cap so its centering is relative to the CARD, not
     the full slot width (uncapped, it drifted right of the card on desktop). */
  .itin-slot-top, .itin-slot-actions, .itin-partner-label { max-width: var(--it-card-max); }
}

/* Hover overlay — the chat card's image-overlay recipe (More info / Ask AI).
   Deliberately NOT gated behind (hover:hover)/(pointer:fine): on touch
   devices the browser's emulated sticky :hover is exactly what keeps the
   chat card's overlay up after a tap (until the user taps elsewhere), so the
   ungated rule is what gives the itinerary card the same persistent mobile
   reveal. The reveal tap itself is swallowed in onCardClick so it doesn't
   also open the info modal. */
.itin-card-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; z-index: 2;
  transition: opacity 0.25s ease;
}
.itin-card:hover .itin-card-overlay { opacity: 1; pointer-events: auto; }
.itin-overlay-actions { display: flex; gap: 10px; }
.itin-overlay-btn {
  padding: 8px; border: none; border-radius: 25px; cursor: pointer;
  font-size: 0.8rem; font-weight: 500; min-width: 80px; text-align: center;
  transition: all 0.25s ease;
  backdrop-filter: blur(1px) saturate(160%); -webkit-backdrop-filter: blur(1px) saturate(160%);
}
/* Same colours as JinniChat's .text-action-btn info/ask variants. */
.itin.day-mode .itin-overlay-btn--info { background: rgba(255,255,255,0.3); color: #fff; box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.6); }
.itin.day-mode .itin-overlay-btn--info:hover { background: rgba(255,255,255,0.4); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.9); }
.itin.day-mode .itin-overlay-btn--ask { background: linear-gradient(45deg, rgba(212,175,55,0.5), rgba(255,140,0,0.5)); color: #fff; box-shadow: inset 0 0 0 0.6px rgba(255,255,255,0.35); }
.itin.day-mode .itin-overlay-btn--ask:hover { background: linear-gradient(45deg, rgba(212,175,55,0.72), rgba(255,140,0,0.72)); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.4); }
.itin.night-mode .itin-overlay-btn--info { background: rgba(255,255,255,0.3); color: #e2e8f0; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.itin.night-mode .itin-overlay-btn--info:hover { background: rgba(255,255,255,0.35); color: #f1f5f9; box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.1); }
.itin.night-mode .itin-overlay-btn--ask { background: linear-gradient(45deg, rgba(212,175,55,0.6), rgba(255,140,0,0.6)); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.itin.night-mode .itin-overlay-btn--ask:hover { background: linear-gradient(45deg, rgba(212,175,55,0.7), rgba(255,140,0,0.7)); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.2); }

/* Save ribbon — the chat card's .rec-image-save-btn recipe: bookmark hanging
   from the photo's top-right, revealed on card hover, gold gradient when
   saved. On touch devices (no hover) it rests at the touch-active opacity so
   it stays discoverable now that the actions-row bookmark is gone. */
.itin-card-save {
  position: absolute; top: -6px; right: 6px; width: 24px; height: 90px;
  border: none; border-radius: 8px; background: transparent; cursor: pointer;
  display: flex; align-items: flex-start; justify-content: center; overflow: visible;
  color: #fff; z-index: 15; flex-shrink: 0; padding: 0; opacity: 0;
  transition: opacity 0.25s ease;
  transform: translateZ(0); -webkit-transform: translateZ(0);
  will-change: opacity; backface-visibility: hidden; -webkit-backface-visibility: hidden;
}
.itin-card:hover .itin-card-save { opacity: 0.85; }
.itin-card-save.saved, .itin-card:hover .itin-card-save.saved { opacity: 1; }
.itin-card:hover .itin-card-save:hover { opacity: 1; }
.itin-card-save:not(.saved):hover svg { fill: rgba(255,255,255,0.55); }
.itin-card-save.saved { color: #D4AF37; }
.itin-card-save:disabled { opacity: 0.3; cursor: default; pointer-events: none; }

/* Touch reveal — exact copy of the chat card's ≤768px behaviour: while the
   card is touched (scrolling counts) or :active, the overlay pops in with
   stacked pill buttons, the ribbon shows at 0.55 (1 when saved), and the
   card dips to 0.98. */
@media (max-width: 768px) {
  .itin-card.touch-active .itin-card-overlay,
  .itin-card:active .itin-card-overlay { opacity: 1; pointer-events: auto; z-index: 10; }
  .itin-card.touch-active .itin-card-save,
  .itin-card:active .itin-card-save { opacity: 0.55; }
  .itin-card.touch-active .itin-card-save.saved,
  .itin-card:active .itin-card-save.saved { opacity: 1; }
  .itin-card.touch-active { transform: scale(0.98); transition: transform 0.1s ease; }
  .itin-overlay-actions { flex-direction: row; gap: 8px; }
  .itin-overlay-btn { padding: 10px 14px; border-radius: 20px; }
}

.itin-card-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.itin-card-info { min-width: 0; }
/* Header row — name + round image button, the chat card's .rec-header/.image-request-btn recipe. */
.itin-card-header { display: flex; align-items: flex-start; gap: 8px; }
.itin-card-header .itin-card-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.itin-img-btn {
  /* rem, not px: the button carries the SAME text-size multiplier as the
     row beside it, so the tuned top/bottom fit survives Small/Large
     (founder 2026-09-01). 2.375rem == 38px at Normal. */
  width: 2.375rem; height: 2.375rem; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  position: relative; overflow: hidden; transition: all 0.25s ease;
  color: var(--it-text); background: var(--it-glass); box-shadow: var(--it-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
}
.itin-img-btn:hover:not(.is-loading) { background: var(--it-glass-hover); box-shadow: var(--it-ring-hover); }
.itin-img-btn.is-loading { cursor: default; }
.itin-card-name { font-weight: 700; font-size: 0.84375rem; line-height: 1.25; color: var(--it-biz); }
.itin-card-region { font-size: 0.75rem; color: var(--it-muted); margin-top: -18px; margin-right: 42px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.itin-card-note { font-size: 0.75rem; color: var(--it-muted); margin-top: 4px; font-style: italic; }
.itin-card--failed { flex-direction: column; align-items: flex-start; gap: 6px;
  background: rgba(224,85,85,0.06); box-shadow: none; }
.itin-failed-note { font-size: 0.75rem; color: #d16a6a; }

/* ── Per-slot icon buttons — small glacier chips ── */
.itin-slot-actions { display: flex; gap: 6px; margin-top: 6px; }
.itin-icon {
  width: 28px; height: 28px; display: grid; place-items: center; border: none; cursor: pointer;
  border-radius: 9px; color: var(--it-chip-text);
  background: var(--it-chip-bg); box-shadow: var(--it-chip-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: all 0.25s ease;
}
.itin-icon:hover:not(:disabled) { background: var(--it-chip-bg-hover); box-shadow: var(--it-chip-ring); }
.itin-icon:active:not(:disabled) { transform: scale(0.94); }
.itin-icon:disabled { opacity: 0.3; cursor: default; }
/* Image button loading — spinning arc, mirrors the card's image-request btn. */
.itin-icon.is-loading { color: var(--it-text); cursor: default; }
.itin-loading-icon { animation: itinPoolSpin 1s linear infinite; }
@media (prefers-reduced-motion: reduce) { .itin-loading-icon { animation: none; } }
/* Kept stop — green-tinted glass, ring barely there. */
.itin-icon.is-on { color: #27ae60; background: rgba(39,174,96,0.14); box-shadow: inset 0 0 0 1px rgba(39,174,96,0.16); }
.itin-icon.is-on:hover:not(:disabled) { background: rgba(39,174,96,0.2); box-shadow: inset 0 0 0 1px rgba(39,174,96,0.16); }
.itin-icon.is-liked { color: #27ae60; background: rgba(39,174,96,0.14); box-shadow: inset 0 0 0 1px rgba(39,174,96,0.16); }
.itin-icon.is-liked:hover:not(:disabled) { background: rgba(39,174,96,0.2); }
.itin-icon.is-disliked { color: #e05555; background: rgba(224,85,85,0.14); box-shadow: inset 0 0 0 1px rgba(224,85,85,0.16); }
.itin-icon.is-disliked:hover:not(:disabled) { background: rgba(224,85,85,0.2); }
.itin-icon.is-saved { color: #d4af37; background: rgba(212,175,55,0.14); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.18); }
.itin-icon.is-saved:hover:not(:disabled) { background: rgba(212,175,55,0.2); }
/* Delete hover — red-tinted glass, soft edge. */
.itin-icon--danger:hover:not(:disabled) { color: #e05555; background: rgba(224,85,85,0.14); box-shadow: inset 0 0 0 1px rgba(224,85,85,0.18); }

/* ── Choosers (replace / add) — frosted panel + mini cards ── */
.itin-choose {
  margin-top: 10px; border-radius: 14px; padding: 10px;
  background: var(--it-card-bg); box-shadow: var(--it-card-shadow);
  backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);
}
.itin-choose-head { display: flex; align-items: center; justify-content: space-between;
  font-size: 0.78125rem; font-weight: 700; color: var(--it-heading); margin-bottom: 8px; }
.itin-choose-list, .itin-choose-loading { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
.itin-cand {
  flex: none; width: 120px; border: none; border-radius: 12px; padding: 6px;
  cursor: pointer; text-align: left; color: var(--it-biz);
  background: var(--it-glass); box-shadow: var(--it-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: all 0.25s ease;
}
.itin-cand:hover { background: var(--it-glass-hover); }
.itin-cand--sk { height: 118px; box-shadow: none; background: var(--it-shimmer); }
.itin-cand img { width: 100%; height: 62px; object-fit: cover; border-radius: 8px; display: block; margin-bottom: 5px; }
.itin-cand-name { font-size: 0.75rem; font-weight: 700; line-height: 1.2; display: block; }
.itin-cand-dist { font-size: 0.6875rem; color: var(--it-muted); }
/* Hotel variant — bigger card so the photo is actually judgeable, plus a
   rating/distance meta row and a Details button (opens the info-modal). */
.itin-cand--hotel, .itin-cand--rich { width: 158px; display: flex; flex-direction: column; }
.itin-cand--hotel img, .itin-cand--rich img { height: 88px; }
.itin-cand--hotel .itin-cand-name, .itin-cand--rich .itin-cand-name {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: 2.4em;
}
.itin-cand-meta { display: flex; align-items: center; gap: 8px; font-size: 0.6875rem; color: var(--it-muted); margin-top: 2px; }
.itin-cand-rating { font-weight: 700; color: var(--it-text); }
.itin-cand-actions { display: flex; gap: 5px; margin-top: 6px; }
.itin-cand-info {
  flex: 1; height: 26px; padding: 0; border: none; border-radius: 8px;
  font-size: 0.71875rem; font-weight: 600; cursor: pointer; color: var(--it-biz);
  background: var(--it-glass); box-shadow: var(--it-ring);
  display: inline-flex; align-items: center; justify-content: center;
}
.itin-cand-info:hover { background: var(--it-glass-hover); }
/* Square block — same fixed height as Details, equal width. */
.itin-cand-photo { flex: 0 0 26px; width: 26px; height: 26px; }
.itin-cand-photo.is-loading { cursor: default; }
.itin-choose-empty { font-size: 0.78125rem; color: var(--it-muted); padding: 6px 2px; }

/* ── Day-level actions — view-more-btn glacier pills ── */
.itin-day-actions { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
.itin-btn {
  display: inline-flex; align-items: center; gap: 6px; border: none; cursor: pointer;
  border-radius: 20px; padding: 8px 16px; font-size: 0.85rem; font-weight: 600;
  color: var(--it-text); background: var(--it-glass); box-shadow: var(--it-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: all 0.25s ease;
}
.itin-btn:hover:not(:disabled) { background: var(--it-glass-hover); box-shadow: var(--it-ring-hover); }
.itin-btn:active:not(:disabled) { transform: scale(0.97); }
.itin-btn:disabled { opacity: 0.3; cursor: default; }
.itin-btn--small { padding: 6px 12px; font-size: 0.75rem; }
/* Action-chip variant — matches the per-slot glacier action buttons
   (chip bg / chip ring / chip text) instead of the warmer view-more pill. */
.itin-btn--action {
  color: var(--it-chip-text);
  background: var(--it-chip-bg);
  box-shadow: var(--it-chip-ring);
}
.itin-btn--action:hover:not(:disabled) { background: var(--it-chip-bg-hover); box-shadow: var(--it-chip-ring); }
.itin-add-cats { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.itin-add-prompt { font-size: 0.75rem; font-weight: 600; color: var(--it-muted); margin-right: 2px; align-self: center; }
.itin-chip {
  border: none; cursor: pointer; border-radius: 20px; padding: 6px 13px;
  font-size: 0.75rem; font-weight: 600; color: var(--it-chip-text);
  background: var(--it-chip-bg); box-shadow: var(--it-chip-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: all 0.25s ease;
}
.itin-chip:hover { background: var(--it-chip-bg-hover); box-shadow: var(--it-chip-ring); }
/* "From saved" chip — bookmark-gold accent so the user's own curation reads
   as distinct from the suggestion categories. */
/* "From saved" chip — same text colour as its sibling category chips
   (--it-chip-text); the inline-flex/gap is just for the bookmark icon. */
.itin-chip--saved { display: inline-flex; align-items: center; gap: 5px; }
.itin-move-days { margin-top: 8px; }

/* Breakfast question inside the hotel chooser (post-pick) */
.itin-breakfast-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 10px 0 4px; }
.itin-breakfast-q { font-size: 0.875rem; font-weight: 600; margin-right: 2px; }

/* ════════════════ Partner tier — badge + card tint ════════════════
   Ported 1:1 from JinniChat's tier styling so a verified stop reads the
   same in the itinerary as in the chat. Selector mapping:
     .card-glow--*  .recommendation-card → .itin-tier--*  .itin-card
     .partner-label(--*)                 → .itin-partner-label(--*)
     .rec-type                           → .itin-slot-cat
     .feedback-btn (:hover / .active)    → .itin-icon--fb (:hover / .is-liked/.is-disliked)
     .image-request-btn                  → .itin-img-btn
     .text-action-btn.info-btn           → .itin-overlay-btn--info
   Colour values are copied verbatim per mode (night: #22c556b1 / #3b9fdda2 /
   #ffbf0085; day: #22c556ea / #3b9fdda2 / #d39510). The tier class lives on
   .itin-slot so it can reach the category label and footer buttons, which sit
   outside .itin-card. Note the tier rules out-specify .itin-card:hover, so —
   exactly like the chat — the tint holds steady on hover. */

/* ── Badge (.partner-label recipe) ──
   width/max-width: the badge is a block-level flex container, so without a
   cap it spans the WHOLE slot column and its centered content lands to the
   right of the desktop card (which is left-anchored at --it-card-max). Capping
   here to the same variable keeps the badge centered relative to the CARD on
   desktop; on mobile --it-card-max is undefined, the fallback kicks in, and
   full-width centering is exactly right. Self-contained on purpose — it holds
   even without the cap line in the 481px media query. */
.itin-partner-label { display: flex; align-items: center; justify-content: center; gap: 4px;
  width: 100%; max-width: var(--it-card-max, none);
  font-size: 0.68rem; font-weight: 400; letter-spacing: 0.03em; text-align: center;
  pointer-events: none; opacity: 0.85; flex-shrink: 0; margin: 6px 0 0; }
.itin-partner-label :deep(svg) { flex-shrink: 0; vertical-align: middle; }
.itin.night-mode .itin-partner-label--verified  { color: #22c556b1; }
.itin.day-mode   .itin-partner-label--verified  { color: #22c556ea; }
.itin-partner-label--spotlight                  { color: #3b9fdda2; }
.itin.night-mode .itin-partner-label--signature { color: #ffbf0085; }
.itin.day-mode   .itin-partner-label--signature { color: #d39510; }

/* ── Mode-agnostic fallback ring (chat's .card-glow--* base) ── */
.itin-tier--verified .itin-card,
.itin-tier--spotlight .itin-card,
.itin-tier--signature .itin-card { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12); }

/* ── Slot actions — a little tone of the badge colour ──
   The icons read their colours from the --it-chip-* vars, so tinting the row
   is just re-scoping those vars: every icon (idle / hover / ring) shifts
   toward the tier colour through the EXISTING .itin-icon rules, while the
   literal-valued states (is-liked, is-disliked, is-on lock, is-saved gold,
   --danger red hover) keep their own colours untouched. Ring hairline
   thickness mirrors the theme (night 0.7px, day 1px). */
.itin.night-mode .itin-tier--verified .itin-slot-actions  { --it-chip-text: #22c556b1; --it-chip-bg: rgba(34,197,94,0.08);  --it-chip-bg-hover: rgba(34,197,94,0.16);  --it-chip-ring: inset 0 0 0 0.7px rgba(34,197,94,0.14); }
.itin.day-mode   .itin-tier--verified .itin-slot-actions  { --it-chip-text: #22c556ea; --it-chip-bg: rgba(34,197,94,0.10);  --it-chip-bg-hover: rgba(34,197,94,0.20);  --it-chip-ring: inset 0 0 0 1px   rgba(34,197,94,0.20); }
.itin.night-mode .itin-tier--spotlight .itin-slot-actions { --it-chip-text: #3b9fdda2; --it-chip-bg: rgba(59,158,221,0.08); --it-chip-bg-hover: rgba(59,158,221,0.16); --it-chip-ring: inset 0 0 0 0.7px rgba(59,158,221,0.14); }
.itin.day-mode   .itin-tier--spotlight .itin-slot-actions { --it-chip-text: #3b9fdda2; --it-chip-bg: rgba(59,158,221,0.10); --it-chip-bg-hover: rgba(59,158,221,0.20); --it-chip-ring: inset 0 0 0 1px   rgba(59,158,221,0.20); }
.itin.night-mode .itin-tier--signature .itin-slot-actions { --it-chip-text: #ffbf0085; --it-chip-bg: rgba(212,175,55,0.08); --it-chip-bg-hover: rgba(212,175,55,0.16); --it-chip-ring: inset 0 0 0 0.7px rgba(212,175,55,0.14); }
.itin.day-mode   .itin-tier--signature .itin-slot-actions { --it-chip-text: #d39510;   --it-chip-bg: rgba(212,175,55,0.10); --it-chip-bg-hover: rgba(212,175,55,0.20); --it-chip-ring: inset 0 0 0 1px   rgba(212,175,55,0.20); }

/* ── NIGHT MODE (chat's .genie-chat-container.night-mode .card-glow--*) ── */
.itin.night-mode .itin-tier--verified .itin-card { background: rgba(34,197,94,0.15); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.itin.night-mode .itin-tier--verified .itin-slot-cat { color: #22c556b1; }
.itin.night-mode .itin-tier--verified .itin-icon--fb:hover:not(:disabled) { color: #22c556b1; }
.itin.night-mode .itin-tier--verified .itin-icon--fb.is-liked,
.itin.night-mode .itin-tier--verified .itin-icon--fb.is-disliked { color: #22c556b1; background: rgba(34,197,94,0.14); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.16); }
.itin.night-mode .itin-tier--verified .itin-img-btn { color: #22c5567c; background: rgba(34,197,94,0.1); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.09); }
.itin.night-mode .itin-tier--verified .itin-img-btn:hover:not(.is-loading) { background: rgba(34,197,94,0.2) !important; box-shadow: inset 0 0 0 1px rgba(34,197,94,0.1) !important; }
.itin.night-mode .itin-tier--verified .itin-overlay-btn--info { background: rgba(34,197,94,0.3); box-shadow: inset 0 0 0 0.7px rgba(34,197,94,0.3); }
.itin.night-mode .itin-tier--verified .itin-overlay-btn--info:hover { background: rgba(34,197,94,0.35); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.4); }
.itin.night-mode .itin-tier--verified .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger) { background: rgba(34,197,94,0.10); box-shadow: inset 0 0 0 0.7px rgba(34,197,94,0.14); }
.itin.night-mode .itin-tier--verified .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger):hover:not(:disabled) { background: rgba(34,197,94,0.18); }

.itin.night-mode .itin-tier--spotlight .itin-card { background: rgba(59,158,221,0.1); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.itin.night-mode .itin-tier--spotlight .itin-slot-cat { color: #3b9fdda2; }
.itin.night-mode .itin-tier--spotlight .itin-icon--fb:hover:not(:disabled) { color: #3b9fdda2; }
.itin.night-mode .itin-tier--spotlight .itin-icon--fb.is-liked,
.itin.night-mode .itin-tier--spotlight .itin-icon--fb.is-disliked { color: #3b9fdda2; background: rgba(59,158,221,0.14); box-shadow: inset 0 0 0 1px rgba(59,158,221,0.16); }
.itin.night-mode .itin-tier--spotlight .itin-img-btn { color: #3b9fdda2; background: rgba(59,158,221,0.1); box-shadow: inset 0 0 0 1px rgba(59,158,221,0.09); }
.itin.night-mode .itin-tier--spotlight .itin-img-btn:hover:not(.is-loading) { background: rgba(59,158,221,0.2) !important; box-shadow: inset 0 0 0 1px rgba(59,158,221,0.1) !important; }
.itin.night-mode .itin-tier--spotlight .itin-overlay-btn--info { background: rgba(59,158,221,0.3); box-shadow: inset 0 0 0 0.7px rgba(59,158,221,0.3); }
.itin.night-mode .itin-tier--spotlight .itin-overlay-btn--info:hover { background: rgba(59,158,221,0.4); box-shadow: inset 0 0 0 1px rgba(59,158,221,0.4); }
.itin.night-mode .itin-tier--spotlight .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger) { background: rgba(59,158,221,0.10); box-shadow: inset 0 0 0 0.7px rgba(59,158,221,0.14); }
.itin.night-mode .itin-tier--spotlight .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger):hover:not(:disabled) { background: rgba(59,158,221,0.18); }

.itin.night-mode .itin-tier--signature .itin-card { background: rgba(212,175,55,0.2); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.itin.night-mode .itin-tier--signature .itin-slot-cat { color: #ffbf0085; }
.itin.night-mode .itin-tier--signature .itin-icon--fb:hover:not(:disabled) { color: #ffbf0085; }
.itin.night-mode .itin-tier--signature .itin-icon--fb.is-liked,
.itin.night-mode .itin-tier--signature .itin-icon--fb.is-disliked { color: #ffbf0085; background: rgba(212,175,55,0.14); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.16); }
.itin.night-mode .itin-tier--signature .itin-img-btn { color: #ffbf0085; background: rgba(212,175,55,0.1); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.09); }
.itin.night-mode .itin-tier--signature .itin-img-btn:hover:not(.is-loading) { background: rgba(212,175,55,0.2) !important; box-shadow: inset 0 0 0 1px rgba(212,175,55,0.1) !important; }
.itin.night-mode .itin-tier--signature .itin-overlay-btn--info { background: rgba(212,175,55,0.3); box-shadow: inset 0 0 0 0.7px rgba(212,175,55,0.3); }
.itin.night-mode .itin-tier--signature .itin-overlay-btn--info:hover { background: rgba(212,175,55,0.4); box-shadow: inset 0 0 0 0.8px rgba(212,175,55,0.6); }
.itin.night-mode .itin-tier--signature .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger) { background: rgba(212,175,55,0.10); box-shadow: inset 0 0 0 0.7px rgba(212,175,55,0.14); }
.itin.night-mode .itin-tier--signature .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger):hover:not(:disabled) { background: rgba(212,175,55,0.18); }

/* ── DAY MODE (chat's .genie-chat-container.day-mode .card-glow--*) —
      same tint, but the hairline goes tier-coloured instead of white. ── */
.itin.day-mode .itin-tier--verified .itin-card { background: rgba(34,197,94,0.15); box-shadow: inset 0 0 0 0.7px rgba(34,197,94,0.2); }
.itin.day-mode .itin-tier--verified .itin-slot-cat { color: #22c556ea; }
.itin.day-mode .itin-tier--verified .itin-icon--fb:hover:not(:disabled) { color: #22c556ea; }
.itin.day-mode .itin-tier--verified .itin-icon--fb.is-liked,
.itin.day-mode .itin-tier--verified .itin-icon--fb.is-disliked { color: #22c556ea; background: rgba(34,197,94,0.14); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.16); }
.itin.day-mode .itin-tier--verified .itin-img-btn { color: #22c556ea; background: rgba(34,197,94,0.1); box-shadow: inset 0 0 0 1.5px rgba(34,197,94,0.3); }
.itin.day-mode .itin-tier--verified .itin-img-btn:hover:not(.is-loading) { background: rgba(34,197,94,0.3) !important; box-shadow: inset 0 0 0 1.5px rgba(34,197,94,0.2) !important; }
.itin.day-mode .itin-tier--verified .itin-overlay-btn--info { background: rgba(34,197,94,0.3); color: #fff; box-shadow: inset 0 0 0 0.7px rgba(34,197,94,0.3); }
.itin.day-mode .itin-tier--verified .itin-overlay-btn--info:hover { background: rgba(34,197,94,0.45); box-shadow: inset 0 0 0 0.8px rgba(34,197,94,0.6); }
.itin.day-mode .itin-tier--verified .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger) { background: rgba(34,197,94,0.12); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.2); }
.itin.day-mode .itin-tier--verified .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger):hover:not(:disabled) { background: rgba(34,197,94,0.22); }

.itin.day-mode .itin-tier--spotlight .itin-card { background: rgba(59,158,221,0.2); box-shadow: inset 0 0 0 0.7px rgba(59,158,221,0.2); }
.itin.day-mode .itin-tier--spotlight .itin-slot-cat { color: #3b9fdda2; }
.itin.day-mode .itin-tier--spotlight .itin-icon--fb:hover:not(:disabled) { color: #3b9fdda2; }
.itin.day-mode .itin-tier--spotlight .itin-icon--fb.is-liked,
.itin.day-mode .itin-tier--spotlight .itin-icon--fb.is-disliked { color: #3b9fdda2; background: rgba(59,158,221,0.14); box-shadow: inset 0 0 0 1px rgba(59,158,221,0.16); }
.itin.day-mode .itin-tier--spotlight .itin-img-btn { color: #3b9fdda2; background: rgba(59,158,221,0.1); box-shadow: inset 0 0 0 1.5px rgba(59,158,221,0.3); }
.itin.day-mode .itin-tier--spotlight .itin-img-btn:hover:not(.is-loading) { background: rgba(59,158,221,0.3) !important; box-shadow: inset 0 0 0 1.5px rgba(59,158,221,0.2) !important; }
.itin.day-mode .itin-tier--spotlight .itin-overlay-btn--info { background: rgba(59,158,221,0.3); color: #fff; box-shadow: inset 0 0 0 0.7px rgba(59,158,221,0.3); }
.itin.day-mode .itin-tier--spotlight .itin-overlay-btn--info:hover { background: rgba(59,158,221,0.45); box-shadow: inset 0 0 0 0.8px rgba(59,158,221,0.6); }
.itin.day-mode .itin-tier--spotlight .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger) { background: rgba(59,158,221,0.12); box-shadow: inset 0 0 0 1px rgba(59,158,221,0.2); }
.itin.day-mode .itin-tier--spotlight .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger):hover:not(:disabled) { background: rgba(59,158,221,0.22); }

.itin.day-mode .itin-tier--signature .itin-card { background: rgba(212,175,55,0.2); box-shadow: inset 0 0 0 0.7px rgba(212,175,55,0.2); }
.itin.day-mode .itin-tier--signature .itin-slot-cat { color: #d39510; }
.itin.day-mode .itin-tier--signature .itin-icon--fb:hover:not(:disabled) { color: #d39510; }
.itin.day-mode .itin-tier--signature .itin-icon--fb.is-liked,
.itin.day-mode .itin-tier--signature .itin-icon--fb.is-disliked { color: #d39510; background: rgba(212,175,55,0.14); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.16); }
.itin.day-mode .itin-tier--signature .itin-img-btn { color: #d39510; background: rgba(212,175,55,0.1); box-shadow: inset 0 0 0 1.5px rgba(212,175,55,0.3); }
.itin.day-mode .itin-tier--signature .itin-img-btn:hover:not(.is-loading) { background: rgba(212,175,55,0.3) !important; box-shadow: inset 0 0 0 1.5px rgba(212,175,55,0.2) !important; }
.itin.day-mode .itin-tier--signature .itin-overlay-btn--info { background: rgba(212,175,55,0.3); color: #fff; box-shadow: inset 0 0 0 0.7px rgba(212,175,55,0.3); }
.itin.day-mode .itin-tier--signature .itin-overlay-btn--info:hover { background: rgba(212,175,55,0.45); box-shadow: inset 0 0 0 0.8px rgba(212,175,55,0.6); }
.itin.day-mode .itin-tier--signature .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger) { background: rgba(212,175,55,0.12); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.2); }
.itin.day-mode .itin-tier--signature .itin-slot-actions .itin-icon:not(.is-on):not(.is-liked):not(.is-disliked):not(.is-saved):not(.itin-icon--danger):hover:not(:disabled) { background: rgba(212,175,55,0.22); }

/* Region overlap, founder-tuned per text size (2026-09-01): -18 normal,
   -20 large, -17.5 small — read from the data-text-size stamp. */
html[data-text-size="big"] .itin-card-region { margin-top: -20px; }
html[data-text-size="small"] .itin-card-region { margin-top: -17.5px; }
</style>