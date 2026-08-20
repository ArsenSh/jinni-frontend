<template>
  <div class="business-onboarding-page" :class="currentTheme">
    <div class="onboarding-wrapper">
      <div class="onboarding-container" :class="{ 'fade-in': isVisible }">

        <!-- Header -->
        <div class="header-section">
          <button class="back-button" @click="$router.push('/business')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Business Info
          </button>
          <h2 class="page-title">Pick Your Plan</h2>

          <!-- Tier selector -->
          <div class="tier-selector">
            <!-- While PAID_TIERS_LOCKED, Verified must stay joinable even in a
                 full zone — the paid escape hatch is unavailable. -->
            <div  class="tier-card"  :class="{ 'selected': form.tier === 'verified', 'zone-locked': !PAID_TIERS_LOCKED && zoneStatus.spotlightFull }"  @click="(PAID_TIERS_LOCKED || !zoneStatus.spotlightFull) && selectTier('verified')">
              <div v-if="!PAID_TIERS_LOCKED && zoneStatus.spotlightFull" class="zone-locked-overlay">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Zone requires Signature — 3 Spotlight slots taken
              </div>
              <div class="tier-badge verified-badge-display">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Jinni Verified
              </div>
              <div class="tier-price">Free</div>
              <ul class="tier-features">
                <li>✓ Listed in Jinni Discovery mode</li>
                <li>✓ Verified badge on your listing</li>
                <li>✓ AI automatically finds & assigns your images</li>
                <li>✓ AI verifies your business on submission</li>
                <li class="tier-feature-limit">✗ Not visible in Nearby mode</li>
                <li class="tier-feature-limit">✗ No analytics</li>
                <li class="tier-feature-limit">✗ Slot can be taken by paid listings</li>
              </ul>
            </div>
            <div  class="tier-card spotlight-card"  :class="{ 'selected': form.tier === 'spotlight', 'zone-locked': PAID_TIERS_LOCKED || zoneStatus.spotlightFull }"  @click="!PAID_TIERS_LOCKED && !zoneStatus.spotlightFull && selectTier('spotlight')">
              <div v-if="PAID_TIERS_LOCKED" class="zone-locked-overlay">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Subscriptions are under work — coming soon
              </div>
              <div v-else-if="zoneStatus.spotlightFull" class="zone-locked-overlay">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Zone full — 3 Spotlight listings
              </div>
              <div class="tier-badge spotlight-badge-display">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                </svg>
                Jinni Spotlight
              </div>
              <div class="tier-price">$29<span>/mo</span></div>
              <ul class="tier-features">
                <li>✓ Everything in Verified</li>
                <li>✓ Visible in Nearby mode</li>
                <li>✓ Enhanced ranking in Discovery results</li>
                <li>✓ Up to 2 traveler interests</li>
                <li>✓ Up to 2 traveler styles</li>
                <li>✓ Business description</li>
                <li>✓ Up to 8 image URLs</li>
                <li>✓ Analytics: views, saves, clicks, conversations</li>
                <li>✓ Edit your listing info after approval</li>
                <li>✓ Priority customer support</li>
                <li>✓ Protected slot — displaces free listings in your zone</li>
              </ul>
            </div>
            <div  class="tier-card signature-card"  :class="{ 'selected': form.tier === 'signature', 'zone-locked': PAID_TIERS_LOCKED }"  @click="!PAID_TIERS_LOCKED && selectTier('signature')">
              <div v-if="PAID_TIERS_LOCKED" class="zone-locked-overlay">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Subscriptions are under work — coming soon
              </div>
              <div class="tier-badge signature-badge-display">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Jinni Signature
              </div>
              <div class="tier-price">$49<span>/mo</span></div>
              <ul class="tier-features">
                <li>✓ Everything in Spotlight</li>
                <li>✓ Top-ranked in both Discovery & Nearby</li>
                <li>✓ Up to 8 images — URL or direct upload</li>
                <li>✓ Up to 3 traveler interests</li>
                <li>✓ Business highlights (up to 5)</li>
                <li>✓ Social & booking links — Instagram, Facebook, TripAdvisor, Booking</li>
                <li>✓ Full analytics: conversions, territory & cross-business interactions</li>
                <li>✓ Hidden Gem category access</li>
                <li>✓ Highest zone priority — can displace Spotlight listings</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitApplication" class="onboarding-form">
          <!-- Section 1: Business Info -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>Business Information</h3>
                <p class="section-description">Tell us about your business</p>
              </div>
              <div class="form-grid">
                <div class="form-field full-width">
                  <label>Business Name <span class="required">*</span></label>
                  <input  type="text"  v-model="form.name"  placeholder="e.g. The Golden Pomegranate Restaurant"  maxlength="34"  :class="{ 'error': errors.name }"  @input="clearError('name')"  @blur="form.name = capitalizeFirst(form.name)"/>
                  <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
                </div>

                <!-- Business Type -->
                <div class="form-field full-width">
                  <div class="type-group-label">Category <span class="required">*</span></div>
                  <p class="field-hint" style="margin-bottom:8px">Select the category that best describes your business</p>
                  <div class="type-grid">
                    <div  v-for="type in coreBusinessTypes"  :key="type.key"  class="type-chip"  :class="{'selected': form.businessType.includes(type.key),  'disabled': type.key === 'hidden_gems' && form.tier !== 'signature',  'dimmed': type.key !== 'hidden_gems' && !form.businessType.includes(type.key) && hasPrimaryType}"  @click="selectBusinessType(type.key)">
                      {{ type.label }}
                      <span v-if="type.key === 'hidden_gems' && form.tier !== 'signature'" class="chip-lock">✦ Signature only</span>
                    </div>
                  </div>
                  <span v-if="errors.businessType" class="field-error">{{ errors.businessType }}</span>
                </div>

                <!-- Matching Interests -->
                <div class="form-field full-width">
                  <div class="type-group-label">Matching Traveler Interests <span class="required">*</span></div>
                  <p class="field-hint" style="margin-bottom:8px">
                    Select interests that match your offering
                    (up to {{ form.tier === 'signature' ? 3 : form.tier === 'spotlight' ? 2 : 1 }})
                  </p>
                  <div class="type-grid">
                    <div  v-for="interest in travelerInterests"  :key="interest.key"  class="type-chip"  :class="{'selected': form.interests.includes(interest.key), 'disabled': !form.interests.includes(interest.key) && form.interests.length >= (form.tier === 'signature' ? 3 : form.tier === 'spotlight' ? 2 : 1)}"  @click="toggleInterest(interest.key)">
                      {{ interest.label }}
                    </div>
                  </div>
                  <span v-if="errors.interests" class="field-error">{{ errors.interests }}</span>
                </div>

                <!-- Matching Styles -->
                <div class="form-field full-width">
                  <div class="type-group-label">Matching Traveler Styles <span class="required">*</span></div>
                  <p class="field-hint" style="margin-bottom:8px">
                    Select travel styles that fit your business
                    (up to {{ form.tier === 'signature' ? 3 : form.tier === 'spotlight' ? 2 : 1 }})
                  </p>
                  <div class="type-grid">
                    <div  v-for="style in travelerStyles"  :key="style.key"  class="type-chip"  :class="{'selected': form.styles.includes(style.key), 'disabled': !form.styles.includes(style.key) && form.styles.length >= (form.tier === 'signature' ? 3 : form.tier === 'spotlight' ? 2 : 1)}"  @click="toggleStyle(style.key)">
                      {{ style.label }}
                    </div>
                  </div>
                  <span v-if="errors.styles" class="field-error">{{ errors.styles }}</span>
                </div>

                <div class="form-field full-width" v-if="form.tier !== 'verified'">
                  <label>Description <span class="required">*</span></label>
                  <textarea
                    v-model="form.description"
                    :placeholder="form.tier === 'signature' ? 'Tell what makes your place special...' : 'Describe your business...'"
                    :rows="form.tier === 'signature' ? 4 : 2"
                    :maxlength="form.tier === 'signature' ? 600 : 300"
                    style="resize: none; overflow-y: auto;"
                    :style="form.tier === 'signature' ? 'max-height: 160px' : 'max-height: 90px'"
                    :class="{ 'error': errors.description }"
                    @input="clearError('description')"
                  ></textarea>
                  <div class="char-count" :class="{
                    'char-warning': form.tier === 'signature' ? form.description.length > 500 : form.description.length > 250,
                    'char-danger':  form.tier === 'signature' ? form.description.length >= 600 : form.description.length >= 300
                  }">{{ form.description.length }}/{{ form.tier === 'signature' ? 600 : 300 }}</div>
                  <span v-if="errors.description" class="field-error">{{ errors.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Location -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>Location</h3>
                <p class="section-description">Where can travelers find you?</p>
              </div>
              <div class="form-grid">
                <div class="form-field">
                  <label>Country <span class="required">*</span></label>
                  <input  type="text"  v-model="form.country"  placeholder="e.g. France"  maxlength="60"  :class="{ 'error': errors.country }"  @input="clearError('country')"  @blur="form.country = capitalizeFirst(form.country)"/>
                  <span v-if="errors.country" class="field-error">{{ errors.country }}</span>
                </div>
                <div class="form-field">
                  <label>Region <span class="required">*</span></label>
                  <input  type="text"  v-model="form.region"  placeholder="e.g. Île-de-France"  maxlength="80"  :class="{ 'error': errors.region }"  @input="clearError('region')"  @blur="form.region = capitalizeFirst(form.region)"/>
                  <span v-if="errors.region" class="field-error">{{ errors.region }}</span>
                </div>
                <div class="form-field">
                  <label>City <span class="required">*</span></label>
                  <input  type="text"  v-model="form.city"  placeholder="e.g. Paris"  maxlength="85"  :class="{ 'error': errors.city }"  @input="clearError('city')"  @blur="form.city = capitalizeFirst(form.city)"/>
                  <span v-if="errors.city" class="field-error">{{ errors.city }}</span>
                </div>
                <div class="form-field">
                  <label>Full Address <span class="required">*</span></label>
                  <input  type="text"  v-model="form.address"  placeholder="e.g. 15 Main Street, Paris 75001"  maxlength="200"  :class="{ 'error': errors.address }"  @input="clearError('address')"  @blur="form.address = capitalizeFirst(form.address)"/>
                  <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
                </div>

                <!-- Zone Status Map / Event Dates -->
                <div class="form-field full-width" v-if="zoneStatus.visible">
                  <!-- Event date/time fields — shown when category is Event -->
                  <template v-if="isEvent">
                    <div class="event-schedule-section">
                      <div class="event-schedule-header">
                        <label>Event Schedule <span class="required">*</span></label>
                      </div>
                      <p class="field-hint" style="margin: -2px 0 12px">
                        Leave times empty if your event runs all day. Set an end date if it spans multiple days.
                      </p>
                      <!-- Timezone notice — times are interpreted in the venue's
                           local zone (derived from the address), so an organiser
                           anywhere in the world enters the time attendees will
                           actually see at the venue. -->
                      <p class="event-tz-note">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                        <span v-if="form.eventTimezone">
                          Times are in the event's local timezone:
                          <strong>{{ form.eventTimezone.replace(/_/g, ' ') }}</strong>
                        </span>
                        <span v-else>Enter your address above to set the event's timezone.</span>
                      </p>
                      <!-- Start block: date + time side by side, larger inputs -->
                      <div class="event-datetime-block">
                        <div class="event-datetime-label">Start</div>
                        <div class="event-datetime-row">
                          <div class="form-field event-datetime-field">
                            <label>Date <span class="required">*</span></label>
                            <input  type="date"  v-model="form.eventStartDate"  :min="today"  class="event-datetime-input"  :class="{ 'error': errors.eventStartDate }"  @change="clearError('eventStartDate'); onEventScheduleChange()"/>
                          </div>
                          <div class="form-field event-datetime-field">
                            <label>Time <span class="optional-tag">optional</span></label>
                            <input  type="time"  v-model="form.eventStartTime"  class="event-datetime-input"  :class="{ 'error': errors.eventStartTime }"  @change="clearError('eventStartTime'); onEventScheduleChange()"/>
                          </div>
                        </div>
                        <span v-if="errors.eventStartDate" class="field-error">{{ errors.eventStartDate }}</span>
                        <span v-if="errors.eventStartTime" class="field-error">{{ errors.eventStartTime }}</span>
                      </div>
                      <!-- End block: date + time side by side, larger inputs -->
                      <div class="event-datetime-block">
                        <div class="event-datetime-label">End <span class="optional-tag">optional</span></div>
                        <div class="event-datetime-row">
                          <div class="form-field event-datetime-field">
                            <label>Date</label>
                            <input  type="date"  v-model="form.eventEndDate"  :min="form.eventStartDate || today"  class="event-datetime-input"  :class="{ 'error': errors.eventEndDate }"  @change="clearError('eventEndDate'); onEventScheduleChange()"/>
                          </div>
                          <div class="form-field event-datetime-field">
                            <label>Time</label>
                            <input  type="time"  v-model="form.eventEndTime"  class="event-datetime-input"  :class="{ 'error': errors.eventEndTime }"  @change="clearError('eventEndTime'); onEventScheduleChange()"/>
                          </div>
                        </div>
                        <span v-if="errors.eventEndDate" class="field-error">{{ errors.eventEndDate }}</span>
                        <span v-if="errors.eventEndTime" class="field-error">{{ errors.eventEndTime }}</span>
                      </div>
                      <!-- Repeats-weekly checkbox — clearly secondary to the dates above.
                           Phrased as "repeats weekly" so users understand it means
                           the event recurs on the same weekday each week, not that
                           it spans multiple days (which is what end-date is for). -->
                      <label class="event-repeat-check">
                        <input type="checkbox" v-model="form.eventRecurring" @change="onEventScheduleChange()" />
                        <span class="event-repeat-check-box">
                          <svg v-if="form.eventRecurring" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        <span class="event-repeat-check-text">
                          This event repeats weekly
                          <span class="event-repeat-check-hint">e.g. every Friday night, every Sunday market</span>
                        </span>
                      </label>
                    </div>
                  </template>

                  <!-- Zone map — shown for all categories -->
                  <div class="zone-map-header" :style="isEvent ? 'margin-top:14px' : ''">
                    <label>{{ isEvent ? 'Event Location' : 'Your Zone' }}</label>
                    <span class="zone-checking" v-if="zoneStatus.loading">
                      <svg class="spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                      {{ isEvent ? 'Checking conflicts...' : 'Checking zone...' }}
                    </span>
                  </div>
                  <div id="zone-map" class="zone-map"></div>
                  <!-- Dual zone legend — shown only when primary + hidden_gems selected -->
                  <div class="zone-dual-legend" v-if="form.tier === 'signature' && form.businessType.includes('hidden_gems') && form.businessType.some(t => ['restaurants','hotels','historical','events','souvenirs','clothing','jewelry','food'].includes(t))">
                    <span class="zone-dual-item zone-dual-item--primary">
                      <span class="zone-dual-dot zone-dual-dot--primary"></span>
                      {{ form.businessType.find(t => ['restaurants','hotels','historical','events','souvenirs','clothing','jewelry','food'].includes(t)) }} zone
                    </span>
                    <span class="zone-dual-item zone-dual-item--hg">
                      <span class="zone-dual-dot zone-dual-dot--hg"></span>
                      Hidden Gem zone
                    </span>
                  </div>

                  <!-- Status bar -->
                  <div class="zone-status-bar" :class="zoneStatus.statusClass">
                    <div class="zone-status-left">
                      <span class="zone-status-dot"></span>
                      <span class="zone-status-text">{{ zoneStatus.message }}</span>
                    </div>
                    <!-- Slot indicators — shown for all categories -->
                    <div class="zone-slots">
                      <span
                        v-for="i in 3"
                        :key="i"
                        class="zone-slot"
                        :class="zoneStatus.slots[i - 1]"
                      ></span>
                    </div>
                  </div>

                  <!-- Zone Auction bid panel — full 3-Signature zone only -->
                  <div class="zone-auction-panel" v-if="zoneStatus.auction && form.tier === 'signature'">
                    <div class="zone-auction-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2l8 8-4 4-8-8 4-4zM2 22l7-7 3 3-7 7H2v-3z"/></svg>
                      <span>This zone is full — entry is by auction</span>
                    </div>
                    <p class="zone-auction-explainer">
                      All 3 Signature slots are taken. Enter the most you'll pay per month
                      (minimum ${{ zoneStatus.bidFloor + 1 }}). At the contested slot's
                      quarterly renewal, the lowest-performing current listing must beat
                      your bid within 72 hours or be replaced by the highest bidder.
                    </p>
                    <div class="zone-auction-bid-row">
                      <label class="zone-auction-label">Your monthly bid</label>
                      <div class="zone-auction-input-wrap">
                        <span class="zone-auction-currency">$</span>
                        <input
                          type="number"
                          v-model="form.bidAmount"
                          :min="zoneStatus.bidFloor + 1"
                          step="1"
                          class="zone-auction-input"
                          :class="{ 'error': errors.bidAmount }"
                          :placeholder="String(zoneStatus.bidFloor + 1)"
                          @input="clearError('bidAmount')"
                        />
                        <span class="zone-auction-per">/mo</span>
                      </div>
                    </div>
                    <div class="zone-auction-highbid" v-if="zoneStatus.currentHighBid">
                      Current high bid: <strong>${{ zoneStatus.currentHighBid }}/mo</strong>
                      — bid above this to lead the auction.
                    </div>
                    <div class="zone-auction-highbid" v-else>
                      No bids yet — you'd be first in the auction.
                    </div>
                    <span class="field-error" v-if="errors.bidAmount">{{ errors.bidAmount }}</span>
                  </div>

                  <!-- Existing businesses legend — non-event only -->
                  <div class="zone-legend" v-if="!isEvent && zoneStatus.businesses.length">
                    <span class="zone-legend-title">In your zone:</span>
                    <span  v-for="b in zoneStatus.businesses"  :key="b.name"  class="zone-legend-item"  :class="b.tier">
                      <span class="zone-legend-dot"></span>{{ b.name }}
                    </span>
                  </div>

                  <!-- Overlapping events list — event mode only -->
                  <div class="event-conflicts" v-if="isEvent && zoneStatus.overlappingEvents.length">
                    <span class="zone-legend-title">Overlapping events nearby:</span>
                    <div  v-for="e in zoneStatus.overlappingEvents"  :key="e.name"  class="event-conflict-row"  :class="{ 'high-conflict': e.interestMatch }">
                      <span class="event-conflict-dot" :class="e.tier"></span>
                      <span class="event-conflict-name">{{ e.name }}</span>
                      <span class="event-conflict-tier">{{ e.tier }}</span>
                      <span v-if="e.interestMatch" class="event-conflict-interest">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        {{ e.sharedInterests }} shared interest{{ e.sharedInterests > 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Contact -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>Contact Details</h3>
                <p class="section-description">How can travelers and Jinni reach you?</p>
              </div>
              <div class="form-grid">
                <div class="form-field">
                  <label>Phone Number <span class="required">*</span></label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">+</span>
                    <input  type="text"  inputmode="numeric"  v-model="form.phone"  placeholder="1 212 555 0100"  maxlength="20"  :class="{ 'error': errors.phone }"  @input="form.phone = $event.target.value.replace(/[^0-9\s]/g, ''); clearError('phone')"/>
                  </div>
                  <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
                </div>
                <div class="form-field">
                  <label>Business Email <span class="required">*</span></label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">✉️</span>
                    <input  type="email"  v-model="form.email"  placeholder="hello@yourbusiness.com"  maxlength="254"  :class="{ 'error': errors.email }"  @input="clearError('email')"/>
                  </div>
                  <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
                </div>
                <div class="form-field full-width">
                  <label>Website</label>
                  <input  type="text"  v-model="form.website"  placeholder="https://yourbusiness.com"  :class="{ 'error': errors.website }"  @input="clearError('website')"/>
                  <span v-if="errors.website" class="field-error">{{ errors.website }}</span>
                </div>
                <template v-if="form.tier === 'signature'">
                  <div class="form-field">
                    <label>Instagram</label>
                    <div class="input-with-prefix">
                      <span class="input-prefix">@</span>
                      <input  type="text"  v-model="form.instagram"  placeholder="yourbusiness"  :class="{ 'error': errors.instagram }"  @input="clearError('instagram')"/>
                    </div>
                    <span v-if="errors.instagram" class="field-error">{{ errors.instagram }}</span>
                  </div>
                  <div class="form-field">
                    <label>Facebook</label>
                    <div class="input-with-prefix">
                      <span class="input-prefix">@</span>
                      <input  type="text"  v-model="form.facebook"  placeholder="yourbusiness"  :class="{ 'error': errors.facebook }"  @input="clearError('facebook')"/>
                    </div>
                    <span v-if="errors.facebook" class="field-error">{{ errors.facebook }}</span>
                  </div>
                  <div class="form-field">
                    <label>TripAdvisor</label>
                    <input  type="text"  v-model="form.tripadvisor"  placeholder="https://tripadvisor.com/Restaurant_Review-..."  :class="{ 'error': errors.tripadvisor }"  @input="clearError('tripadvisor')"/>
                    <span v-if="errors.tripadvisor" class="field-error">{{ errors.tripadvisor }}</span>
                  </div>
                  <div class="form-field">
                    <label>Booking</label>
                    <input  type="text"  v-model="form.booking"  placeholder="https://booking.com/hotel/..."  :class="{ 'error': errors.booking }"  @input="clearError('booking')"/>
                    <span v-if="errors.booking" class="field-error">{{ errors.booking }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Section 4: Pricing -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>Pricing <span class="required">*</span></h3>
                <p class="section-description">Help travelers understand your price range</p>
              </div>
              <div class="form-grid">
                <!-- Free toggle chip -->
                <div class="form-field full-width">
                  <label>Price Mode</label>
                  <div class="price-mode-chips">
                    <div  class="price-chip"  :class="{ 'selected': priceFree }"  @click="priceFree = true; usePriceRange = false; form.priceMedium = ''; form.priceMin = ''; form.priceMax = ''; clearError('pricing')">Free</div>
                    <div  class="price-chip"  :class="{ 'selected': !priceFree && !usePriceRange }"  @click="priceFree = false; usePriceRange = false; clearError('pricing')">Average</div>
                    <div  class="price-chip"  :class="{ 'selected': !priceFree && usePriceRange }"  @click="priceFree = false; usePriceRange = true; form.priceMedium = ''; clearError('pricing')">Min & Max</div>
                  </div>
                  <span v-if="errors.pricing" class="field-error">{{ errors.pricing }}</span>
                </div>
                <!-- Currency (hidden when free) -->
                <div class="form-field" v-if="!priceFree">
                  <label>Currency</label>
                  <div class="currency-chips">
                    <div  v-for="currency in currencies"  :key="currency"  class="price-chip"  :class="{ 'selected': form.currency === currency }"  @click="form.currency = currency">
                      {{ currency }}
                    </div>
                  </div>
                </div>
                <!-- Average per person -->
                <div class="form-field" v-if="!priceFree && !usePriceRange">
                  <label>Average Price per Person</label>
                  <div class="price-min-max">
                    <div class="input-with-prefix">
                      <span class="input-prefix">Avg</span>
                      <input  type="text"  inputmode="numeric"  v-model="form.priceMedium"  placeholder="e.g. 25"  :class="{ 'error': errors.priceMedium }"  @input="form.priceMedium = $event.target.value.replace(/[^0-9]/g, ''); clearError('pricing')"/>
                      <span class="input-suffix">{{ form.currency }}</span>
                    </div>
                  </div>
                  <span v-if="errors.priceMedium" class="field-error">{{ errors.priceMedium }}</span>
                </div>
                <!-- Min / Max range -->
                <div class="form-field price-range-row" v-if="!priceFree && usePriceRange">
                  <label>Price Range per Person</label>
                  <div class="price-min-max">
                    <div class="input-with-prefix">
                      <span class="input-prefix">From</span>
                      <input  type="text"  inputmode="numeric"  v-model="form.priceMin"  placeholder="e.g. 10"  :class="{ 'error': errors.priceMin }"  @input="form.priceMin = $event.target.value.replace(/[^0-9]/g, ''); clearError('priceMin'); clearError('pricing')"/>
                      <span class="input-suffix">{{ form.currency }}</span>
                    </div>
                    <span class="price-range-dash">—</span>
                    <div class="input-with-prefix">
                      <span class="input-prefix">To</span>
                      <input  type="text"  inputmode="numeric"  v-model="form.priceMax"  placeholder="e.g. 60"  :class="{ 'error': errors.priceMax }"  @input="form.priceMax = $event.target.value.replace(/[^0-9]/g, ''); clearError('priceMax'); clearError('pricing')"/>
                      <span class="input-suffix">{{ form.currency }}</span>
                    </div>
                  </div>
                  <span v-if="errors.priceMin" class="field-error">{{ errors.priceMin }}</span>
                  <span v-if="errors.priceMax" class="field-error">{{ errors.priceMax }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 5: Opening Hours (Spotlight + Signature)
               Hidden for one-time events — they have a single time window
               in the Event Schedule section above and don't keep weekly hours. -->
          <div class="preference-section active" v-if="form.tier !== 'verified' && (!isEvent || form.eventRecurring)">
            <div class="card">
              <div class="section-header">
                <h3>{{ isEvent ? 'Weekly Schedule' : 'Opening Hours' }}</h3>
                <p class="section-description">
                  <template v-if="isEvent">Mark the days your recurring event runs and the times for each.</template>
                  <template v-else>Let travelers know when you're open</template>
                </p>
                <span v-if="errors.openingHours" class="field-error">{{ errors.openingHours }}</span>
              </div>
              <div class="hours-chips">
                <div  v-for="(dayEntry, idx) in form.openingHours.days"  :key="dayEntry.day"  class="hours-chip"  :class="{'hours-chip--active': selectedHoursDay === dayEntry.day, 'hours-chip--closed': dayEntry.closed, 'hours-chip--error':  errors[`hours_${idx}`]}"  @click="selectHoursDay(dayEntry.day)">
                  <span class="hours-chip-day">{{ dayEntry.day.slice(0, 3) }}</span>
                  <span class="hours-chip-time">{{ hoursDisplay(dayEntry) }}</span>
                </div>
              </div>
              <transition name="hours-panel">
                <div v-if="selectedHoursDay" class="hours-edit-panel">
                  <template v-for="(dayEntry, idx) in form.openingHours.days" :key="dayEntry.day">
                    <div v-if="dayEntry.day === selectedHoursDay" class="hours-panel-inner">
                      <div class="hours-panel-header">
                        <div class="hours-panel-title">{{ dayEntry.day }}</div>
                        <!-- Open / Closed pill buttons -->
                        <div class="hours-status-pills">
                          <button  type="button"  class="hours-pill"  :class="{ 'hours-pill--active': !dayEntry.closed }"  @click="dayEntry.closed = false; clearError('openingHours')">Open</button>
                          <button  type="button"  class="hours-pill hours-pill--close"  :class="{ 'hours-pill--active': dayEntry.closed }"  @click="dayEntry.closed = true; snapshotCurrentDay(); selectedHoursDay = null">Closed</button>
                        </div>
                      </div>
                      <!-- Time pickers — live, no Done button -->
                      <div class="hours-time-row" v-if="!dayEntry.closed">
                        <div class="hours-time-block">
                          <label class="hours-time-label">Opens</label>
                          <input type="time" v-model="dayEntry.open" class="hours-time-input" :class="{ 'error': errors[`hours_${idx}`] }" @change="clearError(`hours_${idx}`)" />
                        </div>
                        <div class="hours-time-block">
                          <label class="hours-time-label">Closes</label>
                          <input type="time" v-model="dayEntry.close" class="hours-time-input" :class="{ 'error': errors[`hours_${idx}`] }" @change="clearError(`hours_${idx}`); if (dayEntry.open && dayEntry.close) { snapshotCurrentDay(); selectedHoursDay = null }" />
                        </div>
                      </div>
                      <span v-if="errors[`hours_${idx}`]" class="field-error" style="margin-top:4px;display:block">{{ errors[`hours_${idx}`] }}</span>
                      <!-- Memory hint button — appears once user has set custom hours on another day -->
                      <button  type="button"  class="hours-last-btn"  v-if="!dayEntry.closed && lastCustomHours && !(dayEntry.open === lastCustomHours.open && dayEntry.close === lastCustomHours.close)"  @click="applyLastHours(dayEntry, idx); snapshotCurrentDay(); selectedHoursDay = null">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/></svg>
                        Use {{ lastCustomHours.open }} – {{ lastCustomHours.close }}
                      </button>
                    </div>
                  </template>
                </div>
              </transition>
            </div>
          </div>

          <!-- Section 6: Images -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>Images</h3>
                <p class="section-description">
                  <template v-if="form.tier === 'verified'">Our AI will automatically find the best images for your listing.</template>
                  <template v-else-if="form.tier === 'spotlight'">
                    <template v-if="isEvent">Add at least 1 image URL for your event (up to 8). <span class="required">*</span></template>
                    <template v-else>Add at least 4 image URLs for your listing (up to 8). <span class="required">*</span></template>
                  </template>
                  <template v-else>
                    <template v-if="isEvent">Add at least 1 image for your event (up to 8). <span class="required">*</span> <span class="signature-note"> You can also upload images directly</span></template>
                    <template v-else>Add at least 4 images for your listing (up to 8). <span class="required">*</span> <span class="signature-note"> You can also upload images directly</span></template>
                  </template>
                </p>
                <!-- Per-slot image errors -->
                <template v-if="form.tier !== 'verified'">
                  <template v-for="(img, index) in form.images" :key="'img-err-' + index">
                    <span  v-if="errors[`imageUrl_${index}`]"  class="field-error"  style="display:block; margin-top: 4px">
                      Image {{ index + 1 }}: {{ errors[`imageUrl_${index}`] }}
                    </span>
                  </template>
                </template>
              </div>
              <!-- Verified tier: AI handles images -->
              <div v-if="form.tier === 'verified'" class="ai-images-notice">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                <div>
                  <strong>AI-powered image discovery</strong>
                  <p>Jinni's AI will automatically find and curate the best images for your listing based on your business name, type, and location. Upgrade to Spotlight or Signature to provide your own images.</p>
                </div>
              </div>
              <div v-else class="images-grid">
                <div  v-for="(img, index) in form.images"  :key="index"  class="image-slot"  :class="{ 'has-image': img.url || img.file }">
                  <div class="image-slot-number">{{ index + 1 }}</div>
                  <!-- Preview -->
                  <div v-if="img.url || img.preview" class="image-preview">
                    <img :src="img.preview || img.url" alt="Preview" />
                    <button type="button" class="remove-image-btn" @click="clearImage(index)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <!-- Input area -->
                  <div v-else class="image-input-area">
                    <input  type="text"  v-model="img.url" placeholder="Paste image URL..."  class="image-url-input"  :class="{ 'error': errors[`imageUrl_${index}`] }"  @blur="validateImageUrl(index)"  @input="delete errors[`imageUrl_${index}`]"/>
                    <template v-if="form.tier === 'signature'">
                      <div class="image-or">or</div>
                      <label class="upload-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload
                        <input type="file" accept="image/*" @change="handleImageUpload($event, index)" />
                      </label>
                    </template>
                  </div>
                </div>
              </div>
              <span v-if="errors.images" class="field-error">{{ errors.images }}</span>
            </div>
          </div>

          <!-- Section 6: Highlights (Signature only) -->
          <div class="preference-section active">
            <div class="card" :class="{ 'locked-section': form.tier !== 'signature' }">
              <div class="section-header">
                <h3>Highlights</h3>
                <p class="section-description">What makes your place special? Add up to 5 highlights</p>
              </div>
              <!-- Locked overlay for verified and spotlight -->
              <div v-if="form.tier !== 'signature'" class="locked-overlay">
                <div class="locked-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Available on Jinni Signature only
                </div>
              </div>
              <div class="highlights-list" :class="{ 'dimmed': form.tier !== 'signature' }">
                <div  v-for="(highlight, index) in form.highlights"  :key="index"  class="highlight-row">
                  <input  type="text"  v-model="form.highlights[index]"  :placeholder="`e.g. ${highlightPlaceholders[index] || 'Add a highlight...'}`"  maxlength="25"  :disabled="form.tier !== 'signature'"  :class="{ 'error': errors[`highlight_${index}`] }"  @input="clearError(`highlight_${index}`)"/>
                  <button  type="button"  class="remove-highlight-btn"  @click="removeHighlight(index)"  v-if="form.highlights.length > 1 && form.tier === 'signature'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <span v-if="errors[`highlight_${index}`]" class="field-error" style="grid-column: 1 / -1">{{ errors[`highlight_${index}`] }}</span>
                </div>
                <button  type="button"  class="add-highlight-btn"  @click="addHighlight"  v-if="form.highlights.length < 5 && form.tier === 'signature'">
                  + Add Highlight
                </button>
              </div>
            </div>
          </div>

          <!-- Chosen tier summary -->
          <div class="tier-summary" :class="form.tier">
            <div class="tier-summary-badge">
              <template v-if="form.tier === 'signature'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Jinni Signature — $49/month
              </template>
              <template v-else-if="form.tier === 'spotlight'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                </svg>
                Jinni Spotlight — $29/month
              </template>
              <template v-else>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Jinni Verified — Free
              </template>
            </div>
            <button type="button" class="change-tier-btn" @click="scrollToTop">Change</button>
          </div>

          <!-- Terms Agreement -->
          <div class="terms-agreement" :class="{ 'terms-error': errors.terms }">
            <label class="terms-label">
              <input  type="checkbox"  v-model="form.agreedToTerms"  class="terms-checkbox"  :style="{ accentColor: form.tier === 'signature' ? '#D4AF37' : form.tier === 'spotlight' ? '#3b9edd' : '#4CAF50' }"  @change="clearError('terms')"/>
              <span class="terms-text" :class="{ 'terms-accepted': form.agreedToTerms }" :style="{ color: form.tier === 'signature' ? '#D4AF37' : form.tier === 'spotlight' ? '#3b9edd' : '#4CAF50' , opacity: form.agreedToTerms ? 1 : 0.7 }">
                By submitting, I confirm I've read and accept Jinni's
                <a :href="'/business/terms?tier=' + form.tier" target="_blank" class="terms-link" :style="{ color: form.tier === 'signature' ? '#D4AF37' : form.tier === 'spotlight' ? '#3b9edd' : '#4CAF50' }">Terms of Service</a>
                and
                <a :href="'/business/privacy?tier=' + form.tier" target="_blank" class="terms-link" :style="{ color: form.tier === 'signature' ? '#D4AF37' : form.tier === 'spotlight' ? '#3b9edd' : '#4CAF50' }">Privacy Policy</a>
              </span>
            </label>
            <span v-if="errors.terms" class="field-error">{{ errors.terms }}</span>
          </div>
          <div v-if="submitError" class="submit-error">{{ submitError }}</div>
          <!-- Submit -->
          <button  type="submit"  class="magic-button"  :disabled="isSubmitting">
            <span v-if="isSubmitting" class="btn-loading">
              <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Submitting Application...
            </span>
            <span v-else>Submit Application</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Verifying Overlay — shown while Google verification runs -->
    <transition name="fade">
      <div v-if="isVerifying && !showSuccess" class="success-modal-overlay">
        <div class="success-modal verifying-modal" :class="currentTheme">
          <div class="verifying-icon">
            <svg class="spinner" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
          <h3>Verifying your business</h3>
          <p>Our AI is reviewing details to confirm accuracy. This only takes a moment</p>
          <div class="verifying-steps">
            <div class="verifying-step active">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Looking up your business
            </div>
            <div class="verifying-step active">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Matching location &amp; address
            </div>
            <div class="verifying-step active">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              {{ form.tier === 'verified' ? 'Collecting images' : 'Reviewing listing details' }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Waitlist Confirmation Modal -->
    <transition name="fade">
      <div v-if="showWaitlistConfirm" class="success-modal-overlay">
        <div class="success-modal waitlist-modal" :class="currentTheme">
          <div class="waitlist-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h3>You're entering the Zone Auction</h3>
          <p>All 3 Signature slots in this zone are taken. Your application enters the auction with the bid below. At the contested slot's quarterly renewal, the lowest-performing current listing must beat your bid within 72 hours — or it's replaced by the highest bidder.</p>
          <div class="waitlist-detail-box" :class="currentTheme">
            <div class="waitlist-detail-row">
              <span class="waitlist-label">Your tier</span>
              <span class="waitlist-value">
                <template v-if="form.tier === 'signature'">
                  <div class="tier-badge signature-badge-display">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Jinni Signature
                  </div>
                </template>
                <template v-else-if="form.tier === 'spotlight'">
                  <div class="tier-badge spotlight-badge-display">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Jinni Spotlight
                  </div>
                </template>
                <template v-else>
                  <div class="tier-badge verified-badge-display">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Jinni Verified
                  </div>
                </template>
              </span>
            </div>
            <div class="waitlist-detail-row">
              <span class="waitlist-label">Zone</span>
              <span class="waitlist-value">{{ form.city }}, {{ form.country }}</span>
            </div>
            <div class="waitlist-detail-row">
              <span class="waitlist-label">Your monthly bid</span>
              <span class="waitlist-value waitlist-date">${{ form.bidAmount }}/mo</span>
            </div>
            <div class="waitlist-detail-row" v-if="zoneStatus.currentHighBid">
              <span class="waitlist-label">Current high bid</span>
              <span class="waitlist-value">${{ zoneStatus.currentHighBid }}/mo</span>
            </div>
            <div class="waitlist-detail-row" v-else>
              <span class="waitlist-label">Current high bid</span>
              <span class="waitlist-value" style="opacity:0.5">No bids yet — you'd lead</span>
            </div>
          </div>
          <p class="waitlist-note">No payment is charged now. If your bid wins or you're promoted into a freed slot, the price is locked for 3 months. You'll be emailed at every step of the auction.</p>
          <div class="waitlist-actions">
            <button class="magic-button" :disabled="isSubmitting" @click="doSubmit">
              <span v-if="isSubmitting" class="btn-loading">
                <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                Submitting...
              </span>
              <span v-else>Submit Auction Bid</span>
            </button>
            <button class="waitlist-cancel-btn" @click="showWaitlistConfirm = false">Go back</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Success Modal -->
    <transition name="fade">
      <div v-if="showSuccess" class="success-modal-overlay">
        <div class="success-modal" :class="currentTheme">
          <div class="success-icon" :class="{ 'waitlist-success-icon': zoneStatus.waitlisted }">
            <template v-if="zoneStatus.waitlisted">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </template>
            <template v-else>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </template>
          </div>
          <template v-if="zoneStatus.waitlisted">
            <h3>Your auction bid is in!</h3>
            <p>Thanks, <strong>{{ form.name }}</strong>. Your application has entered the Zone Auction.</p>
            <p class="success-detail">
              <template v-if="form.email">We'll email <strong>{{ form.email }}</strong> at every step — when the contested slot's renewal approaches and when the auction resolves.</template>
              <template v-else>We'll notify you at <strong>+{{ form.phone }}</strong> at every step of the auction.</template>
              Your listing details are saved and ready to go live if you win.
            </p>
            <div class="success-tier" style="background:rgba(212,175,55,0.1);color:#D4AF37;border-color:rgba(212,175,55,0.3)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2l8 8-4 4-8-8 4-4zM2 22l7-7 3 3-7 7H2v-3z"/></svg>
              Your bid: ${{ form.bidAmount }}/mo
            </div>
          </template>
          <template v-else>
            <h3>Application Submitted!</h3>
            <p>Welcome to Jinni, <strong>{{ form.name }}</strong>! 🎉</p>
            <p class="success-detail">
              <template v-if="form.email">Your login credentials have been sent to <strong>{{ form.email }}</strong>.</template>
              <template v-else>Your account is linked to your phone number <strong>+{{ form.phone }}</strong>.</template>
            </p>
            <!-- Verification status banner -->
            <div v-if="verificationScore !== null" class="verification-banner" :class="verificationScore >= 80 ? 'verif-good' : verificationScore >= 50 ? 'verif-review' : 'verif-flagged'">
              <template v-if="verificationScore >= 80">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Your listing passed our verification checks and will be activated after a quick team review
              </template>
              <template v-else-if="verificationScore >= 50">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Our team will take a closer look at your listing before activating it. This may take a little longer than usual
              </template>
              <template v-else>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Our team needs to manually verify some details before your listing can go live. We'll be in touch
              </template>
            </div>
            <template v-if="form.tier === 'signature'">
              <div class="tier-badge signature-badge-display" style="margin: 12px 0 24px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Jinni Signature application received
              </div>
            </template>
            <template v-else-if="form.tier === 'spotlight'">
              <div class="tier-badge spotlight-badge-display" style="margin: 12px 0 24px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                </svg>
                Jinni Spotlight application received
              </div>
            </template>
            <template v-else>
              <div class="tier-badge verified-badge-display" style="margin: 12px 0 24px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Jinni Verified application received
              </div>
            </template>
          </template>
          <button class="magic-button" @click="goHome">Back to Jinni</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { isNightTime } from '@/utils/timeUtils'

export default {
  name: 'BusinessOnboarding',
  setup() {
    const router = useRouter()
    const route = useRoute()
    // Local-date version of "today" (YYYY-MM-DD). Don't use toISOString() — it
    // returns UTC which can land on the wrong calendar day for users far from UTC.
    const today = (() => {
      const d = new Date()
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    })()
    const isVisible = ref(false)
    const isSubmitting = ref(false)
    const isVerifying = ref(false)
    const showSuccess = ref(false)
    const verificationScore = ref(null)   // score returned from apply
    const verificationFlags = ref([])
    const submitError = ref('')
    const currentTheme = computed(() => isNightTime() ? 'night-mode' : 'day-mode')
    const form = reactive({
      tier: 'verified',
      name: '',
      businessType: [],    // main type (restaurants/hotels/events) + optionally hidden_gems for signature
      interests: [],      // up to 4
      styles: [],         // multiple
      description: '',
      country: '',
      region: '',
      city: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      instagram: '',
      facebook: '',
      tripadvisor: '',
      booking: '',
      currency: 'USD',
      priceMedium: '',
      priceMin: '',
      priceMax: '',
      highlights: [''],
      // Zone Auction max bid ($/month) — only used when applying as Signature
      // into a full 3-Signature zone. Must be above the $49 floor.
      bidAmount: '',
      images: Array.from({ length: 8 }, () => ({ url: '', file: null, preview: '' })),
      openingHours: {
        days: [
          { day: 'Monday',    closed: false, open: '00:00', close: '23:59' },
          { day: 'Tuesday',   closed: false, open: '00:00', close: '23:59' },
          { day: 'Wednesday', closed: false, open: '00:00', close: '23:59' },
          { day: 'Thursday',  closed: false, open: '00:00', close: '23:59' },
          { day: 'Friday',    closed: false, open: '00:00', close: '23:59' },
          { day: 'Saturday',  closed: false, open: '00:00', close: '23:59' },
          { day: 'Sunday',    closed: false, open: '00:00', close: '23:59' },
        ]
      },
      // ── Event schedule (events category only) ────────────────────
      // Use local date (not UTC) so users east/west of UTC don't see a default
      // that's a day off from their actual local "today".
      eventStartDate: (() => {
        const d = new Date()
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
      })(),
      eventStartTime: '',  // "HH:MM" 24-hour — empty means "all day"
      eventEndDate: '',    // intentionally empty — user fills only if event spans multiple days
      eventEndTime: '',    // "HH:MM" 24-hour — empty means "open-ended"
      eventRecurring: false,
      // Venue's IANA timezone (e.g. "Europe/Moscow"). Derived from the address
      // by the backend zone-check and used to convert the wall-clock times
      // above into absolute UTC instants before submitting. Empty until the
      // address geocodes; falls back to the browser's zone if it never does.
      eventTimezone: '',
      agreedToTerms: false
    })
    const errors = reactive({})
    const selectedHoursDay = ref(null)
    const lastCustomHours = ref(null) // remembers last non-24/7 hours set by user
    const coreBusinessTypes = [
      { key: 'restaurants', label: 'Restaurant' },
      { key: 'hotels', label: 'Hotel' },
      { key: 'events', label: 'Event' },
      // Shopping sub-categories — a shop picks the concrete kind it is; there is
      // no generic "Shopping" (and no mall — malls don't self-onboard).
      // 'historical' removed from self-serve onboarding (founder decision
      // 2026-08-20): businesses aren't historical sites; existing rows keep it.
      { key: 'souvenirs', label: 'Souvenirs & Gifts' },
      { key: 'clothing', label: 'Clothing & Boutique' },
      { key: 'jewelry', label: 'Jewelry' },
      { key: 'food', label: 'Food & Gourmet' },
      { key: 'hidden_gems', label: 'Hidden Gem' }
    ]
    const travelerInterests = [
      { key: 'cultural', label: 'Cultural' },
      { key: 'history', label: 'History' },
      { key: 'adventure', label: 'Adventure' },
      { key: 'relaxation', label: 'Relaxation' },
      { key: 'nature', label: 'Nature' },
      { key: 'art', label: 'Art' },
      { key: 'nightlife', label: 'Nightlife' },
      { key: 'food&drink', label: 'Food & Drink' },
      { key: 'family', label: 'Family' },
      { key: 'romantic', label: 'Romantic' }
    ]
    // Styles is now the PRICE axis only (luxury / budget); family/romantic moved
    // to travelerInterests above. This group behaves exactly like interests:
    // cap-based selection (verified 1 → effectively one, the other dims;
    // spotlight 2 / signature 3 → both selectable).
    const travelerStyles = [
      { key: 'luxury', label: 'Luxury' },
      { key: 'budget', label: 'Budget' }
    ]
    const currencies = ['USD', 'EUR', 'GBP', 'RUB', 'AED']
    const highlightPlaceholders = ['Award-winning chef', 'Stunning views', 'Live music', 'Locally sourced ingredients']
    
    // Paid tiers barrier — payments aren't configured yet. Flip to false to
    // re-enable Spotlight/Signature selection (backend clamp must be lifted
    // too — see businessRoutes /apply).
    const PAID_TIERS_LOCKED = true

    function selectTier(tier) {
      if (PAID_TIERS_LOCKED && tier !== 'verified') return
      form.tier = tier
      const maxStyles    = tier === 'signature' ? 3 : tier === 'spotlight' ? 2 : 0
      const maxInterests = tier === 'signature' ? 3 : tier === 'spotlight' ? 2 : 0
      // ── Always reset terms agreement on tier switch ───────────────────────
      // Each tier has different terms (features, pricing, commitments) — user
      // must explicitly re-accept after switching plans.
      form.agreedToTerms = false
      clearError('terms')
      // Trim styles and interests to the new tier's max
      while (form.styles.length > maxStyles) form.styles.splice(0, 1)
      while (form.interests.length > maxInterests) form.interests.splice(0, 1)
      // Remove hidden_gems if not signature
      if (tier !== 'signature') {
        const hgIdx = form.businessType.indexOf('hidden_gems')
        if (hgIdx !== -1) form.businessType.splice(hgIdx, 1)
      }
      // Clear signature-only fields when downgrading
      if (tier !== 'signature') {
        form.instagram = ''
        form.facebook = ''
        form.tripadvisor = ''
        form.booking = ''
        form.highlights = ['']
      }
      // Clear spotlight + signature fields when switching to verified
      if (tier === 'verified') {
        form.description = ''
        form.images.forEach(img => { img.url = ''; img.file = null; img.preview = '' })
        clearError('images')
        clearError('description')
        // Reset hours UI state
        selectedHoursDay.value = null
        lastCustomHours.value = null
        form.openingHours.days.forEach(d => { d.closed = false; d.open = '00:00'; d.close = '23:59' })
      }
      // Clear all existing validation errors on tier switch — fresh slate
      Object.keys(errors).forEach(k => delete errors[k])
    }
    function selectBusinessType(key) {
      if (key === 'hidden_gems' && form.tier !== 'signature') return
      const idx = form.businessType.indexOf(key)
      if (idx === -1) {
        // For non-hidden_gems, max is 1 — swap out the existing primary
        if (key !== 'hidden_gems') {
          const primaryIdx = form.businessType.findIndex(t => t !== 'hidden_gems')
          if (primaryIdx !== -1) form.businessType.splice(primaryIdx, 1)
        }
        form.businessType.push(key)
      } else {form.businessType.splice(idx, 1)}
      clearError('businessType')
      // If the user moves away from events, clear event-only validation errors
      // so they don't linger on a form that no longer shows those fields.
      if (!form.businessType.includes('events')) {
        clearError('eventStartDate')
        clearError('eventStartTime')
        clearError('eventEndDate')
        clearError('eventEndTime')
      }
    }
    function toggleInterest(key) {
      const idx = form.interests.indexOf(key)
      const max = form.tier === 'signature' ? 3 : form.tier === 'spotlight' ? 2 : 1
      if (idx === -1) {
        if (form.interests.length >= max) form.interests.splice(0, 1)
        form.interests.push(key)
      } else {form.interests.splice(idx, 1)}
      clearError('interests')
    }
    function toggleStyle(key) {
      const idx = form.styles.indexOf(key)
      const max = form.tier === 'signature' ? 3 : form.tier === 'spotlight' ? 2 : 1
      if (idx === -1) {
        if (form.styles.length >= max) form.styles.splice(0, 1)
        form.styles.push(key)
      } else {form.styles.splice(idx, 1)}
      clearError('styles')
    }
    function snapshotCurrentDay() {
      if (!selectedHoursDay.value) return
      const current = form.openingHours.days.find(d => d.day === selectedHoursDay.value)
      if (current && !current.closed && !(current.open === '00:00' && (current.close === '23:59' || current.close === '24:00'))) {lastCustomHours.value = { open: current.open, close: current.close }}
    }
    function selectHoursDay(day) {
      snapshotCurrentDay()
      selectedHoursDay.value = selectedHoursDay.value === day ? null : day
    }
    function applyLastHours(dayEntry, idx) {
      if (!lastCustomHours.value) return
      dayEntry.open = lastCustomHours.value.open
      dayEntry.close = lastCustomHours.value.close
      clearError(`hours_${idx}`)
    }
    function hoursDisplay(d) {
      if (d.closed) return 'Closed'
      if (d.open === '00:00' && (d.close === '23:59' || d.close === '24:00')) return '24 / 7'
      return `${d.open} – ${d.close}`
    }
    function addHighlight() { if (form.tier === 'signature' && form.highlights.length < 5) form.highlights.push('') }
    function removeHighlight(index) { form.highlights.splice(index, 1) }
    function clearError(field) { delete errors[field] }

    // ── Event schedule helpers ────────────────────────────────────────────────
    // An event time is meaningless without a timezone: "20:00" at a Moscow
    // venue and "20:00" at a London venue are different instants. We treat the
    // wall-clock the organiser types as being in the VENUE's timezone
    // (form.eventTimezone, derived from the address), convert it to an absolute
    // UTC instant, and send that. The backend stores a real Date; every viewer
    // later converts that instant back into whatever zone they need. This makes
    // the time correct whether the listing is registered in Moscow, edited by
    // an admin in Yerevan, or viewed by a tourist in London.

    // The venue timezone, with a safe fallback to the organiser's browser zone
    // (better than UTC if the address never geocoded).
    function eventTz() {
      return form.eventTimezone
        || Intl.DateTimeFormat().resolvedOptions().timeZone
        || 'UTC'
    }

    // Wall-clock parts shown by `timeZone` for an absolute Date.
    function zonedParts(date, timeZone) {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      })
      const p = {}
      for (const part of dtf.formatToParts(date)) {
        if (part.type !== 'literal') p[part.type] = parseInt(part.value, 10)
      }
      if (p.hour === 24) p.hour = 0
      return p
    }

    // Offset (minutes, east-positive) of `timeZone` at instant `date`.
    function tzOffsetMinutes(date, timeZone) {
      const p = zonedParts(date, timeZone)
      const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
      return Math.round((asUTC - date.getTime()) / 60000)
    }

    // Combine a "YYYY-MM-DD" date + optional "HH:MM" time, interpret it in the
    // venue timezone, and return an absolute UTC ISO string (with the trailing
    // Z). When no time is given, start falls back to 00:00 and end to 23:59 so
    // an all-day event still spans the full local day.
    function combineDateTime(dateStr, timeStr, fallbackTime) {
      if (!dateStr) return undefined
      const t = (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) ? timeStr : fallbackTime
      const [y, mo, d] = dateStr.split('-').map(Number)
      const [h, mi] = t.split(':').map(Number)
      if (!y || !mo || !d) return undefined
      const tz = eventTz()
      // Guess the wall-clock is UTC, then correct by the zone offset (twice, to
      // settle DST-boundary cases where the offset itself changes).
      const utcGuess = Date.UTC(y, mo - 1, d, h, mi, 0)
      let off = tzOffsetMinutes(new Date(utcGuess), tz)
      let result = new Date(utcGuess - off * 60000)
      const off2 = tzOffsetMinutes(result, tz)
      if (off2 !== off) result = new Date(utcGuess - off2 * 60000)
      return result.toISOString()
    }

    function buildEventSchedulePayload() {
      // Start defaults to midnight if no time given; end defaults to end of day.
      const startDate = combineDateTime(form.eventStartDate, form.eventStartTime, '00:00')
      // End date falls back to start date when only end time is given.
      const endDateRaw = form.eventEndDate || (form.eventEndTime ? form.eventStartDate : '')
      const endDate = combineDateTime(endDateRaw, form.eventEndTime, '23:59')
      return {
        startDate,
        endDate: endDate || undefined,
        isRecurring: !!form.eventRecurring,
        // Ship the venue timezone so the backend stores it alongside the
        // instants — required to render the time correctly anywhere later.
        timezone: eventTz()
      }
    }

    // Re-run zone-check whenever the event schedule changes — overlapping-event
    // results depend on the time window, not just the geography.
    //
    // We also nudge Leaflet via invalidateSize() because adding/removing the
    // event-schedule rows above the map changes its container height, and the
    // map's cached pixel origin goes stale. Without this, the next zoom or pan
    // throws "undefined is not an object (evaluating 't._leaflet_pos')".
    function onEventScheduleChange() {
      if (isEvent.value) checkZone()
      nextTick(() => {
        try { leafletMap?.invalidateSize?.() } catch { /* map not ready yet */ }
      })
    }
    function capitalizeFirst(str) {
      if (!str) return str
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
    function validateImageUrl(index) {
      const url = form.images[index].url.trim()
      if (!url) return
      // Block data URIs.
      // These are pasted-in base64 blobs (e.g. from a clipboard copy of a rendered image).
      // We can't verify them server-side, they bloat the payload, and they're not cacheable.
      // Signature tier users can use the direct file upload control instead.
      if (/^data:/i.test(url)) {
        errors[`imageUrl_${index}`] = form.tier === 'signature'
          ? 'Pasted image data isn\u2019t supported here. Use a direct image URL, or click the upload button to add the file directly.'
          : 'Pasted image data isn\u2019t supported. Please paste a direct image URL (https://\u2026.jpg), or upgrade to Signature to upload image files directly.'
        return
      }
      // Max URL length
      if (url.length > 2000) {
        errors[`imageUrl_${index}`] = 'Image URL must be 2000 characters or fewer'
        return
      }
      // Must be https
      if (!/^https:\/\//i.test(url)) {
        errors[`imageUrl_${index}`] = 'Image URL must start with https://'
        return
      }
      // Block private/internal IPs (SSRF protection)
      const ssrfPattern = /^https:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|0\.0\.0\.0|::1)/i
      if (ssrfPattern.test(url)) {
        errors[`imageUrl_${index}`] = 'Private or internal network URLs are not allowed'
        return
      }
      // Must end with a valid image extension (before any query string)
      if (!/^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)+\/[^?#]*\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url)) {
        errors[`imageUrl_${index}`] = 'Enter a valid image URL ending in .jpg, .png, .webp, .gif or .avif'
        return
      }
      delete errors[`imageUrl_${index}`]
    }
    function handleImageUpload(event, index) {
      const file = event.target.files[0]
      if (!file) return
      // Allowed MIME types whitelist
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
      if (!allowedTypes.includes(file.type)) {
        errors[`imageUrl_${index}`] = 'Only JPG, PNG, WEBP, GIF or AVIF files are allowed'
        event.target.value = ''
        return
      }
      // Max file size: 5MB
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        errors[`imageUrl_${index}`] = 'Image must be 5MB or smaller'
        event.target.value = ''
        return
      }
      // Block dangerous filenames (path traversal, double extensions)
      const filename = file.name
      if (/(\.\.(\/|\\)|[<>{}\[\]|\\^~`])/.test(filename)) {
        errors[`imageUrl_${index}`] = 'File name contains invalid characters'
        event.target.value = ''
        return
      }
      const dangerousExtPattern = /\.(php|php[0-9]|phtml|phar|asp|aspx|jsp|exe|sh|bat|cmd|cgi|pl|py|rb)\./i
      if (dangerousExtPattern.test(filename)) {
        errors[`imageUrl_${index}`] = 'File name contains an invalid extension'
        event.target.value = ''
        return
      }
      delete errors[`imageUrl_${index}`]
      form.images[index].file = file
      form.images[index].url = ''
      const reader = new FileReader()
      reader.onload = e => { form.images[index].preview = e.target.result }
      reader.readAsDataURL(file)
    }
    function clearImage(index) {
      form.images[index].url = ''
      form.images[index].file = null
      form.images[index].preview = ''
      delete errors[`imageUrl_${index}`]
    }
    // Blocks any non-Latin script.
    // Allows Basic Latin (ASCII), Latin-1 Supplement, Latin Extended (accented chars like é, ü, ñ),
    // general punctuation, currency symbols, letterlike symbols, AND emoji / pictographic ranges
    // so users can decorate descriptions and names with emoji without being rejected.
    //
    // Allowed ranges:
    //   \u0000-\u024F  Basic Latin + Latin-1 + Latin Extended-A/B
    //   \u1E00-\u1EFF  Latin Extended Additional
    //   \u2000-\u206F  General Punctuation
    //   \u20A0-\u20CF  Currency Symbols
    //   \u2100-\u214F  Letterlike Symbols
    //   \u2190-\u21FF  Arrows
    //   \u2300-\u23FF  Miscellaneous Technical (⌚, ⌛, etc.)
    //   \u2460-\u24FF  Enclosed Alphanumerics
    //   \u2500-\u257F  Box Drawing
    //   \u2580-\u259F  Block Elements
    //   \u25A0-\u25FF  Geometric Shapes
    //   \u2600-\u26FF  Miscellaneous Symbols (☀, ☁, ★, ☎, etc.)
    //   \u2700-\u27BF  Dingbats (✂, ✈, ✉, ✓, ✔, ✨, etc.)
    //   \u2B00-\u2BFF  Miscellaneous Symbols and Arrows
    //   \u{1F000}-\u{1FAFF} Pictographs / emoji planes (🎉, 🍽, 🏨, 🎵, 🌟, ❤️, etc.)
    //   \u{E000}-\u{F8FF}   Private Use Area (some platform-specific emoji)
    //   \uFE00-\uFE0F  Variation Selectors (needed for emoji presentation, e.g. ❤️)
    //   \u200D         Zero-Width Joiner (needed for multi-codepoint emoji like 👨‍👩‍👧)
    function hasNonLatin(str) {
      return /[^\u0000-\u024F\u1E00-\u1EFF\u2000-\u206F\u20A0-\u20CF\u2100-\u214F\u2190-\u21FF\u2300-\u23FF\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u2B00-\u2BFF\uE000-\uF8FF\uFE00-\uFE0F\u200D\u{1F000}-\u{1FAFF}]/u.test(str)
    }
    function validate() {
      // Clear all existing errors before re-validating
      Object.keys(errors).forEach(k => delete errors[k])
      let valid = true
      // Zone Auction bid — required when applying as Signature into a full zone
      if (zoneStatus.auction && form.tier === 'signature') {
        const bid = Number(form.bidAmount)
        if (!form.bidAmount || Number.isNaN(bid)) {
          errors.bidAmount = 'Enter your monthly bid to join the auction'; valid = false
        } else if (bid <= zoneStatus.bidFloor) {
          errors.bidAmount = `Bid must be above the $${zoneStatus.bidFloor} floor`; valid = false
        } else if (zoneStatus.currentHighBid && bid <= zoneStatus.currentHighBid) {
          // Not blocking — a lower bid is allowed, it just sits lower in the book.
          // Surface it as guidance only; do not set valid=false.
        }
      }
      if (!form.name.trim()) {errors.name = 'Business name is required'; valid = false} 
      else if (form.name.trim().length < 2) {errors.name = 'Business name must be at least 2 characters'; valid = false} 
      else if (form.name.trim().length > 34) {errors.name = 'Business name must be 34 characters or fewer'; valid = false} 
      else if (hasNonLatin(form.name.trim())) {errors.name = 'Please enter the business name in English'; valid = false}
      // Business type
      if (!form.businessType.length) { errors.businessType = 'Select your business category'; valid = false }
      // Interests — required, at least 1
      if (!form.interests.length) { errors.interests = 'Select traveler interest'; valid = false }
      // Styles — required, at least 1
      if (!form.styles.length) { errors.styles = 'Select traveler style'; valid = false }
      // Description — required for spotlight and signature
      if (form.tier !== 'verified') {
        const maxLen = form.tier === 'signature' ? 600 : 300
        if (!form.description.trim()) {errors.description = 'Description is required'; valid = false}
        else if ((form.description.trim().match(/[a-zA-Z\u00C0-\u024F]/g) || []).length < 20) {errors.description = 'Description must contain at least 20 letters'; valid = false}
        else if (form.description.trim().length > maxLen) {errors.description = `Description must be ${maxLen} characters or less`; valid = false}
        else if (hasNonLatin(form.description.trim())) {errors.description = 'Please write the description in English'; valid = false}
      }
      // Country
      if (!form.country.trim()) {errors.country = 'Country is required'; valid = false}
      else if (/[0-9]/.test(form.country.trim())) {errors.country = 'Country name cannot contain numbers'; valid = false}
      else if (!/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s\-]+$/.test(form.country.trim())) {errors.country = 'Country name contains invalid characters'; valid = false}
      else if (form.country.trim().length > 60) {errors.country = 'Country name must be 60 characters or fewer'; valid = false}
      else if (hasNonLatin(form.country.trim())) {errors.country = 'Please enter the country name in English'; valid = false}
      // City
      if (!form.city.trim()) {errors.city = 'City is required'; valid = false}
      else if (/[0-9]/.test(form.city.trim())) {errors.city = 'City name cannot contain numbers'; valid = false}
      else if (!/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s\-]+$/.test(form.city.trim())) {errors.city = 'City name contains invalid characters'; valid = false}
      else if (form.city.trim().length > 85) {errors.city = 'City name must be 85 characters or fewer'; valid = false}
      else if (hasNonLatin(form.city.trim())) {errors.city = 'Please enter the city name in English'; valid = false}
      // Region
      if (!form.region.trim()) {errors.region = 'Region is required'; valid = false}
      else if (/[0-9]/.test(form.region.trim())) {errors.region = 'Region name cannot contain numbers'; valid = false}
      else if (!/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s\-]+$/.test(form.region.trim())) {errors.region = 'Region name contains invalid characters'; valid = false}
      else if (form.region.trim().length > 80) {errors.region = 'Region name must be 80 characters or fewer'; valid = false}
      else if (hasNonLatin(form.region.trim())) {errors.region = 'Please enter the region name in English'; valid = false}
      // Address
      if (!form.address.trim()) {errors.address = 'Address is required'; valid = false}
      else if (form.address.trim().length < 5) {errors.address = 'Please enter a full address'; valid = false}
      else if (form.address.trim().length > 200) {errors.address = 'Address must be 200 characters or fewer'; valid = false}
      else if (/[<>{}\[\]@$%^*=+|\\~]/.test(form.address.trim())) {errors.address = 'Address contains invalid characters'; valid = false}
      else if (hasNonLatin(form.address.trim())) {errors.address = 'Please enter the address in English'; valid = false}
      // Email — RFC 5321/5322 compliant
      const emailTrimmed = form.email.trim()
      const emailParts = emailTrimmed.split('@')
      const localPart = emailParts[0]
      const domainPart = emailParts[1]
      const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
      if (!emailTrimmed) {errors.email = 'Email address is required'; valid = false}
      else if (emailTrimmed.length > 254) {errors.email = 'Email address must be 254 characters or fewer'; valid = false}
      else if (!emailTrimmed.includes('@')) {errors.email = 'Enter a valid email address (e.g. hello@business.com)'; valid = false}
      else if (localPart.length > 64) {errors.email = 'The part before @ must be 64 characters or fewer'; valid = false}
      else if (/^\.|\.$/.test(localPart)) {errors.email = 'Email address cannot start or end with a dot before @'; valid = false}
      else if (/\.{2,}/.test(localPart)) {errors.email = 'Email address cannot contain consecutive dots'; valid = false}
      else if (!emailRegex.test(emailTrimmed)) {errors.email = 'Enter a valid email address (e.g. hello@business.com)'; valid = false}
      // Phone — + is shown as a prefix, model contains only digits and spaces
      const phoneCleaned = ('+' + form.phone.trim()).replace(/[\s\-()]/g, '')
      if (!form.phone.trim()) {errors.phone = 'Phone number is required'; valid = false}
      else if (hasNonLatin(form.phone)) {errors.phone = 'Phone number must contain only digits'; valid = false}
      else if (!/^\+[1-9]\d{6,14}$/.test(phoneCleaned)) {errors.phone = 'Enter a valid number with country code (e.g. 1 212 555 0100)'; valid = false}
      // Website — optional but must be a valid https URL if filled
      if (form.website.trim()) {
        if (form.website.trim().length > 300) {errors.website = 'Website URL must be 300 characters or fewer'; valid = false}
        else if (!/^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)+/.test(form.website.trim())) {errors.website = 'Enter a valid URL starting with https://'; valid = false} 
        else if (hasNonLatin(form.website)) {errors.website = 'Website URL must be in standard format'; valid = false}
      }
      // Instagram — optional, but must be plain ASCII handle if filled
      if (form.instagram.trim()) {
        const ig = form.instagram.trim()
        if (!/^[a-zA-Z0-9._]{1,30}$/.test(ig)) {errors.instagram = 'Enter a valid Instagram handle (letters, numbers, dots, underscores only, max 30)'; valid = false}
        else if (/^\.|\.$/.test(ig)) {errors.instagram = 'Instagram handle cannot start or end with a dot'; valid = false}
        else if (/\.{2,}/.test(ig)) {errors.instagram = 'Instagram handle cannot contain consecutive dots'; valid = false}
      }
      // TripAdvisor — optional, must be a tripadvisor.com URL if filled
      if (form.tripadvisor.trim() && !/^https:\/\/([a-zA-Z0-9\-]+\.)?tripadvisor\.[a-z]{2,}(\.[a-z]{2,})?(\/.*)?$/.test(form.tripadvisor.trim())) {errors.tripadvisor = 'Enter a valid TripAdvisor URL (e.g. https://www.tripadvisor.com/...)'; valid = false}
      // Facebook — optional, plain page username if filled (letters, numbers, periods only, 5-50 chars, no consecutive/leading/trailing dots)
      if (form.facebook.trim()) {
        const fb = form.facebook.trim()
        if (!/^[a-zA-Z0-9.]{5,50}$/.test(fb)) {errors.facebook = 'Enter a valid Facebook page name (letters, numbers, dots only, 5–50 characters)'; valid = false}
        else if (/^\.|\.$/.test(fb)) {errors.facebook = 'Facebook page name cannot start or end with a dot'; valid = false}
        else if (/\.{2,}/.test(fb)) {errors.facebook = 'Facebook page name cannot contain consecutive dots'; valid = false}
      }
      // Booking — optional, must be a booking.com URL if filled
      if (form.booking.trim() && !/^https:\/\/([a-zA-Z0-9\-]+\.)?booking\.com(\/.*)?$/.test(form.booking.trim())) {errors.booking = 'Enter a valid Booking.com URL (e.g. https://www.booking.com/...)'; valid = false}
      // Highlights — signature only, validate filled ones
      if (form.tier === 'signature') {
        form.highlights.forEach((h, i) => {
          const trimmed = h.trim()
          if (trimmed) {
            if (trimmed.length < 5) {errors[`highlight_${i}`] = 'Highlight must be at least 5 characters'; valid = false}
            else if (trimmed.length > 25) {errors[`highlight_${i}`] = 'Highlight must be 25 characters or fewer'; valid = false}
          }
        })
      }
      // Opening Hours — overnight hours (close < open) are allowed; only equal times are rejected
      if (form.tier !== 'verified') {
        // All days closed is not allowed
        const allClosed = form.openingHours.days.every(d => d.closed)
        if (allClosed) {
          errors.openingHours = 'At least one day must be open'
          valid = false
        }
        const toMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
        form.openingHours.days.forEach((d, i) => {
          if (!d.closed) {
            if (!d.open || !d.close) {
              errors[`hours_${i}`] = 'Enter both open and close time or mark as Closed'
              valid = false
            } else if (toMins(d.open) === toMins(d.close)) {
              // Equal times are ambiguous (0h or 24h?) — block to force a real choice
              errors[`hours_${i}`] = 'Open and close time cannot be the same'
              valid = false
            }
            // close < open is intentionally allowed — closes the next day (e.g. 17:00 – 05:00)
          }
        })
      }
      // Images — required for spotlight and signature, all filled URLs must be valid.
      //
      // Minimum count is category-dependent:
      //   - Events: 1 image is enough. Most events are one-off and organisers
      //     typically have a single hero shot (poster, lineup, venue photo).
      //     Forcing 4 photos for a Saturday night DJ event is overkill and a
      //     real onboarding friction point.
      //   - Everything else (restaurants, hotels, historical sites, hidden gems):
      //     4 images stays the minimum — those listings benefit from variety
      //     (interior, exterior, signature dishes/rooms, ambience).
      if (form.tier !== 'verified') {
        // Re-run URL validation on all filled URL slots
        form.images.forEach((img, i) => {if (img.url.trim()) validateImageUrl(i)})
        // Block if any filled URL slot has an error
        const hasInvalidUrl = form.images.some((img, i) => img.url.trim() && errors[`imageUrl_${i}`])
        if (hasInvalidUrl) { errors.images = 'Please fix the invalid image URLs before submitting'; valid = false }
        else {
          const validImages = form.images.filter((img, i) =>(img.url.trim() && !errors[`imageUrl_${i}`]) || img.file).length
          const minImages = isEvent.value ? 1 : 4
          if (validImages < minImages) {
            errors.images = isEvent.value
              ? 'Please provide at least 1 image for your event'
              : 'Please provide at least 4 valid images for your listing'
            valid = false
          }
        }
      }
      // Pricing — mandatory
      if (!priceFree.value) {
        if (!usePriceRange.value) { if (!form.priceMedium || Number(form.priceMedium) < 1) {errors.pricing = 'Please enter an average price of at least 1 or choose a different option above'; valid = false} } 
        else {
          if (!form.priceMin && !form.priceMax) {errors.pricing = 'Please enter both a minimum and maximum price'; valid = false}
          else if (!form.priceMin) {errors.priceMin = 'Please enter a minimum price'; valid = false}
          else if (!form.priceMax) {errors.priceMax = 'Please enter a maximum price'; valid = false}
          else if (Number(form.priceMin) < 0) {errors.priceMin = 'Minimum price cannot be negative'; valid = false}
          else if (Number(form.priceMax) < 0) {errors.priceMax = 'Maximum price cannot be negative'; valid = false}
          else if (Number(form.priceMin) > Number(form.priceMax)) {errors.priceMax = 'Maximum must be greater than minimum'; valid = false}
        }
      }
      // Event dates/times — required when category is events
      if (isEvent.value) {
        if (!form.eventStartDate) {
          errors.eventStartDate = 'Event start date is required'; valid = false
        } else if (form.eventStartDate < today) {
          errors.eventStartDate = 'Event start date cannot be in the past'; valid = false
        }

        // End date must be on or after start date
        if (form.eventEndDate && form.eventStartDate && form.eventEndDate < form.eventStartDate) {
          errors.eventEndDate = 'End date must be on or after the start date'; valid = false
        }

        // If end time is supplied, an end date should be too — otherwise we don't
        // know which day the end time refers to. Default to start date for the user.
        if (form.eventEndTime && !form.eventEndDate) {
          form.eventEndDate = form.eventStartDate
        }

        // If both start and end fall on the same day and both times are set,
        // the end time must be after the start time. (Cross-day events are fine —
        // an event can start 22:00 Friday and end 02:00 Saturday.)
        if (form.eventStartTime && form.eventEndTime &&
            form.eventStartDate && form.eventEndDate &&
            form.eventStartDate === form.eventEndDate &&
            form.eventEndTime <= form.eventStartTime) {
          errors.eventEndTime = 'End time must be after the start time on the same day'; valid = false
        }
      }
      // Terms agreement — must be accepted
      if (!form.agreedToTerms) {errors.terms = 'You must read and agree to the Terms of Service and Privacy Policy to continue'; valid = false}
      return valid
    }
    async function submitApplication() {
      submitError.value = ''
      if (!validate()) {
        const firstError = document.querySelector('.field-error')
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
      if (zoneStatus.waitlisted && !showWaitlistConfirm.value) {
        showWaitlistConfirm.value = true
        return
      }
      await doSubmit()
    }
    async function doSubmit() {
      showWaitlistConfirm.value = false
      isSubmitting.value = true
      isVerifying.value = true
      try {
        // ── Upload any file-based images first ──────────────────────────────
        // Signature tier allows direct file uploads. We upload each file slot
        // to the media endpoint and get back a URL before sending the main payload.
        const resolvedImages = [...form.images]
        if (form.tier === 'signature') {
          for (let i = 0; i < resolvedImages.length; i++) {
            const slot = resolvedImages[i]
            if (slot.file) {
              try {
                const fd = new FormData()
                fd.append('image', slot.file)
                const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/media/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                resolvedImages[i] = { url: uploadRes.data.url, file: null, preview: slot.preview }
              } catch (uploadErr) {
                submitError.value = `Image ${i + 1} upload failed. Please try again or use a URL instead.`
                isSubmitting.value = false
                isVerifying.value = false
                return
              }
            }
          }
        }
        const imageUrls = form.tier === 'verified' ? [] : resolvedImages.filter(img => img.url).map(img => img.url)
        const highlights = form.tier === 'signature' ? form.highlights.filter(h => h.trim()) : []
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/business/apply`, {
          tier: form.tier,
          name: form.name.trim(),
          type: [...form.businessType, ...form.interests, ...form.styles].filter(Boolean),
          description: {short:    form.tier !== 'verified' ? form.description.trim() : '', detailed: form.tier !== 'verified' ? form.description.trim() : '', highlights},
          location: {country: form.country.trim(), region: form.region.trim(), city: form.city.trim(), address: form.address.trim()},
          contact: {
            email: form.email.trim(),
            phone: form.phone.trim() ? '+' + form.phone.trim() : '',
            website: form.website.trim(),
            socialMedia: form.tier === 'signature' ? {instagram:   form.instagram.trim(), facebook:    form.facebook.trim() ? 'https://facebook.com/' + form.facebook.trim() : '', tripadvisor: form.tripadvisor.trim(), booking:     form.booking.trim()} : {}
          },
          pricing: {
            currency: priceFree.value ? undefined : form.currency,
            free: priceFree.value ? true : undefined,
            ...(priceFree.value ? {} : usePriceRange.value ? { priceMin: form.priceMin ? Number(form.priceMin) : undefined, priceMax: form.priceMax ? Number(form.priceMax) : undefined } : { averagePrice: form.priceMedium ? Number(form.priceMedium) : undefined })
          },
          images: imageUrls,
          openingHours: form.tier !== 'verified' ? form.openingHours : undefined,
          coordinates: resolvedCoords.value ?? undefined,
          eventSchedule: isEvent.value ? buildEventSchedulePayload() : undefined,
          // Zone Auction max bid — only meaningful for a Signature entering a
          // full 3-Signature zone; harmless (ignored server-side) otherwise.
          bidAmount: (zoneStatus.auction && form.tier === 'signature' && form.bidAmount)
            ? Number(form.bidAmount)
            : undefined
        })
        verificationScore.value = res.data.aiScore ?? null
        verificationFlags.value = res.data.aiFlags ?? []
        isVerifying.value = false
        isSubmitting.value = false 
        showSuccess.value = true
      } catch (err) {
        const data = err.response?.data || {}
        if (data.blocked) {
          // Zone full and this tier can't enter — guide the owner to upgrade.
          submitError.value = data.error || 'This zone is full for your tier.'
          if (data.mustUpgradeTo) {
            zoneStatus.blocked = true
            zoneStatus.mustUpgradeTo = data.mustUpgradeTo
          }
        } else if (data.requiresBid) {
          // Full 3-Signature zone — a valid bid is required.
          zoneStatus.auction = true
          if (typeof data.currentHighBid !== 'undefined') zoneStatus.currentHighBid = data.currentHighBid
          if (typeof data.floor !== 'undefined') zoneStatus.bidFloor = data.floor
          errors.bidAmount = data.error || `Enter a bid above the $${zoneStatus.bidFloor} floor`
          submitError.value = 'This zone is full — please enter your auction bid above.'
        } else {
          submitError.value = data.error || 'Something went wrong. Please try again.'
        }
        isVerifying.value = false
        isSubmitting.value = false
      } 
      finally {
        isSubmitting.value = false
        isVerifying.value = false
      }
    }
    // ── Zone Status ──────────────────────────────────────────────
    // Builds the 3 slot indicator classes coloured by tier of occupant
    // Order: signature first (highest), then spotlight, then verified
    function buildSlotIndicators(businesses) {
      const sig  = businesses.filter(b => b.tier === 'signature').length
      const spot = businesses.filter(b => b.tier === 'spotlight').length
      const ver  = businesses.filter(b => b.tier === 'verified').length
      const slots = []
      for (let i = 0; i < sig;  i++) slots.push('slot-signature')
      for (let i = 0; i < spot; i++) slots.push('slot-spotlight')
      for (let i = 0; i < ver;  i++) slots.push('slot-verified')
      while (slots.length < 3) slots.push('slot-empty')
      return slots.slice(0, 3)
    }
    const zoneStatus = reactive({
      visible: false,
      loading: false,
      message: '',
      statusClass: '',
      slots: [],
      businesses: [],
      waitlisted: false,
      spotlightFull: false,
      earliestExpiry: null,
      eventMode: false,
      overlappingEvents: [],   // conflicts found during live event check
      eventConflictMessage: '',
      // ── Zone Auction (full 3-Signature zone) ──────────────────────
      auction: false,          // true when this zone is a full 3-Signature zone
      currentHighBid: null,    // live high bid in the zone's auction
      bidFloor: 49,            // $/month minimum — no bid may be at or below this
      blocked: false,          // true when the chosen tier cannot enter this zone at all
      mustUpgradeTo: null      // 'spotlight' | 'signature' — suggested tier when blocked
    })
    const isEvent = computed(() => form.businessType.includes('events'))
    // Any selected type except the hidden_gems attach counts as the primary —
    // derived, so newly added categories dim the others automatically.
    const hasPrimaryType = computed(() => form.businessType.some(t => t !== 'hidden_gems'))
    let leafletMap = null
    let zoneDebounce = null
    let lastGeocoderCenter = null  // cache so re-renders don't re-geocode
    const resolvedCoords = ref(null)
    const showWaitlistConfirm = ref(false)
    const usePriceRange = ref(false)
    const priceFree = ref(false)
    // ── Nominatim geocode: address string → { lat, lng } ────────
    async function geocodeAddress(address, city, country) {
      const q = [address, city, country].filter(Boolean).join(', ')
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      if (!data.length) return null
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    async function checkZone() {
      const mainTypes = ['restaurants', 'hotels', 'events', 'historical', 'hidden_gems', 'souvenirs', 'clothing', 'jewelry', 'food']
      const hasMainType = form.businessType.some(t => mainTypes.includes(t))
      const hasAddress = form.address.trim().length >= 5 && form.city.trim().length >= 1
      if (!hasMainType || !hasAddress) {
        zoneStatus.visible = false
        zoneStatus.waitlisted = false
        zoneStatus.spotlightFull = false
        zoneStatus.earliestExpiry = null
        zoneStatus.eventMode = false
        zoneStatus.overlappingEvents = []
        resolvedCoords.value = null
        return
      }
      zoneStatus.visible = true
      zoneStatus.loading = true
      // 1. Geocode the address
      let coords
      try {coords = await geocodeAddress(form.address.trim(), form.city.trim(), form.country.trim())} 
      catch { coords = null }
      if (!coords) {
        zoneStatus.loading = false
        zoneStatus.statusClass = 'zone-warning'
        zoneStatus.message = 'Could not locate this address — please check and try again'
        zoneStatus.slots = ['slot-empty', 'slot-empty', 'slot-empty']
        zoneStatus.businesses = []
        zoneStatus.waitlisted = false
        zoneStatus.spotlightFull = false
        zoneStatus.earliestExpiry = null
        zoneStatus.eventMode = false
        zoneStatus.overlappingEvents = []
        resolvedCoords.value = null
        return
      }
      lastGeocoderCenter = coords
      resolvedCoords.value = coords
      // 2. Call the real zone-check API with actual coords
      // If user selected both a primary category AND hidden_gems, check both zones
      // and merge the competitor lists so the map shows all relevant businesses.
      let apiData = null
      const primaryCategories = ['restaurants', 'hotels', 'events', 'historical', 'souvenirs', 'clothing', 'jewelry', 'food']
      const primaryCategory = form.businessType.find(t => primaryCategories.includes(t))
      const hasHiddenGem = form.businessType.includes('hidden_gems')
      // Use primary category for the main zone check; fall back to hidden_gems if that's the only one
      const category = primaryCategory || (hasHiddenGem ? 'hidden_gems' : form.businessType.find(t => mainTypes.includes(t)))
      async function fetchZone(cat) {
        const params = new URLSearchParams({ lat: coords.lat, lng: coords.lng, category: cat, tier: form.tier, city: form.city.trim() })
        if (isEvent.value && form.eventStartDate) {
          // Send full ISO datetimes so the backend overlap check can distinguish
          // "Friday 18:00–22:00" from "Friday 23:00–02:00" on the same day.
          // Backwards-compatible: if the backend ignores the time portion, it still
          // gets a parseable date string.
          const sched = buildEventSchedulePayload()
          params.set('startDate', sched.startDate)
          if (sched.endDate) params.set('endDate', sched.endDate)
          if (form.eventRecurring) params.set('isRecurring', 'true')
          const interestTags = [...form.interests, ...form.styles].filter(Boolean)
          if (interestTags.length) params.set('interests', interestTags.join(','))
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/business/zone-check?${params}`)
        return res.ok ? res.json() : null
      }
      try {
        // Always fetch primary category zone
        apiData = await fetchZone(category)
        // If also has hidden_gems AND a different primary category, fetch hidden_gems zone too
        if (apiData && hasHiddenGem && primaryCategory) {
          const hgData = await fetchZone('hidden_gems')
          if (hgData && !hgData.eventMode) {
            // Merge competitor lists — deduplicate by name
            const existingNames = new Set((apiData.businesses || []).map(b => b.name))
            const hgBusinesses = (hgData.businesses || []).filter(b => !existingNames.has(b.name))
            apiData.businesses = [...(apiData.businesses || []), ...hgBusinesses]
            // Also merge cityBusinesses
            const existingCityNames = new Set((apiData.cityBusinesses || []).map(b => b.name))
            const hgCityBusinesses = (hgData.cityBusinesses || []).filter(b => !existingCityNames.has(b.name))
            apiData.cityBusinesses = [...(apiData.cityBusinesses || []), ...hgCityBusinesses]
          }
        }
      } catch { /* ignore */ }
      // If API failed entirely — don't fake an empty zone, warn the user.
      // Note: geocoding succeeded (we got coords above), so this is a backend/network
      // issue, not an address problem. The message reflects that honestly so users
      // don't go re-editing a correct address pointlessly.
      if (!apiData) {
        zoneStatus.loading = false
        zoneStatus.statusClass = 'zone-warning'
        zoneStatus.message = 'Couldn\u2019t reach our servers to check zone availability. Please try again in a moment — your address looks fine.'
        zoneStatus.slots = ['slot-empty', 'slot-empty', 'slot-empty']
        zoneStatus.businesses = []
        zoneStatus.waitlisted = false
        zoneStatus.spotlightFull = false
        zoneStatus.earliestExpiry = null
        zoneStatus.eventMode = false
        zoneStatus.overlappingEvents = []
        const fallbackRadius = { restaurants: 300, hotels: 900, events: 300, historical: 500, hidden_gems: 900, souvenirs: 300, clothing: 300, jewelry: 300, food: 300 }[category] ?? 300  // category already resolved above
        await nextTick()
        initZoneMap([], [], coords, currentTheme.value, fallbackRadius)
        return
      }
      // ── Event mode — same slot logic, time-window instead of geography ──────────
      if (apiData.eventMode) {
        zoneStatus.eventMode = true
        zoneStatus.loading = false
        // Capture the venue's timezone (derived backend-side from the address
        // coordinates) so event times are interpreted in the venue's zone, not
        // the organiser's browser zone.
        if (apiData.timezone) form.eventTimezone = apiData.timezone
        zoneStatus.overlappingEvents = apiData.overlappingEvents ?? []
        zoneStatus.businesses = apiData.overlappingEvents ?? []  // reuse for slot indicators
        zoneStatus.waitlisted = !!apiData.resolution?.waitlisted
        zoneStatus.earliestExpiry = apiData.earliestExpiry ?? null
        // Zone Auction state — same model as geographic zones
        zoneStatus.auction = !!apiData.resolution?.waitlisted
        zoneStatus.currentHighBid = apiData.currentHighBid ?? null
        zoneStatus.bidFloor = apiData.auctionFloor ?? 49
        zoneStatus.blocked = !!apiData.resolution?.blocked
        zoneStatus.mustUpgradeTo = apiData.resolution?.mustUpgradeTo ?? null
        const taken     = apiData.slots?.total ?? 0
        const breakdown = apiData.slots?.breakdown ?? { verified: 0, spotlight: 0, signature: 0 }
        const resolution = apiData.resolution ?? { canEnter: true, displaces: false, waitlisted: false }
        // Slot indicators — same colour logic as geographic
        zoneStatus.slots = buildSlotIndicators(apiData.overlappingEvents ?? [])
        // 3-Spotlight auto-upgrade applies to events too
        const threeSpotlights = breakdown.spotlight >= 3
        zoneStatus.spotlightFull = threeSpotlights
        if (threeSpotlights && (form.tier === 'verified' || form.tier === 'spotlight')) {
          form.tier = 'signature'
          const hgIdx = form.businessType.indexOf('hidden_gems')
          if (hgIdx !== -1) form.businessType.splice(hgIdx, 1)
        }
        // Message logic — mirrors geographic zone messages
        const incomingTier = form.tier
        if (!form.eventStartDate) {
          zoneStatus.statusClass = 'zone-open'
          zoneStatus.message = 'Select your event dates to check slot availability'
        } else if (taken === 0) {
          zoneStatus.statusClass = 'zone-open'
          zoneStatus.message = 'No events overlap your dates here — you\'ll be the first'
        } else if (resolution.waitlisted) {
          zoneStatus.statusClass = 'zone-full'
          if (incomingTier === 'signature') {zoneStatus.message = 'Time slot held by 3 Signature events — you will be placed on the waitlist'} 
          else if (incomingTier === 'spotlight') {zoneStatus.message = 'Time slot has no free events to displace — you will be placed on the waitlist'} 
          else {zoneStatus.message = 'Time slot is full — you will be placed on the waitlist'}
        } else if (resolution.displaces) {
          zoneStatus.statusClass = 'zone-warning'
          const displacedTier = resolution.displacedTier ?? 'lower-tier'
          if (incomingTier === 'signature' && displacedTier === 'spotlight') {zoneStatus.message = `Time slot full — your Signature event will displace the lowest-performing Spotlight`} 
          else if (incomingTier === 'signature' && displacedTier === 'verified') {zoneStatus.message = `Time slot full — your Signature event will displace the lowest-performing free listing`} 
          else if (incomingTier === 'spotlight' && displacedTier === 'verified') {zoneStatus.message = `Time slot full — your Spotlight event will displace the lowest-performing free listing`} 
          else {zoneStatus.message = `Time slot full — your event will displace a lower-tier listing`}
        } else if (taken < 3) {
          const remaining = 3 - taken
          if (incomingTier !== 'verified' && breakdown.verified > 0) {
            zoneStatus.statusClass = 'zone-open'
            zoneStatus.message = taken === 1 ? `1 event overlaps your dates (free listing) — 2 slots available` : `${taken} events overlap your dates — ${remaining} slot${remaining > 1 ? 's' : ''} available`
          } else {
            zoneStatus.statusClass = taken === 2 ? 'zone-warning' : 'zone-open'
            zoneStatus.message = taken === 1 ? '1 of 3 time slots taken — 2 slots available' : '2 of 3 time slots taken — 1 slot remaining'
          }
        }
        await nextTick()
        initZoneMap([], [], coords, currentTheme.value, 300)
        return
      }
      const taken     = apiData.slots?.total ?? 0
      const breakdown = apiData.slots?.breakdown ?? { verified: 0, spotlight: 0, signature: 0 }
      const resolution = apiData.resolution ?? { canEnter: true, displaces: false, waitlisted: false }
      zoneStatus.businesses = apiData.businesses ?? []
      zoneStatus.loading = false
      zoneStatus.waitlisted = !!resolution.waitlisted
      zoneStatus.earliestExpiry = apiData.earliestExpiry ?? null
      // ── Zone Auction state ────────────────────────────────────────
      // A waitlisted Signature means the zone is a full 3-Signature zone — the
      // only auction case. `blocked` means the chosen tier cannot enter at all.
      zoneStatus.auction = !!resolution.waitlisted
      zoneStatus.currentHighBid = apiData.currentHighBid ?? null
      zoneStatus.bidFloor = apiData.auctionFloor ?? 49
      zoneStatus.blocked = !!resolution.blocked
      zoneStatus.mustUpgradeTo = resolution.mustUpgradeTo ?? null
      // ── 3-Spotlight auto-upgrade ──────────────────────────────────
      const threeSpotlights = breakdown.spotlight >= 3
      zoneStatus.spotlightFull = threeSpotlights
      if (threeSpotlights && (form.tier === 'verified' || form.tier === 'spotlight')) {
        form.tier = 'signature'
        const hgIdx2 = form.businessType.indexOf('hidden_gems')
        if (hgIdx2 !== -1) form.businessType.splice(hgIdx2, 1)
      }
      // Slot indicators — colour by tier of occupant
      zoneStatus.slots = buildSlotIndicators(apiData.businesses ?? [])
      // ── Message logic ─────────────────────────────────────────────
      const incomingTier = form.tier
      if (taken === 0) {
        zoneStatus.statusClass = 'zone-open'
        zoneStatus.message = 'Zone is clear — you will be the first listing here'
      } else if (resolution.waitlisted) {
        zoneStatus.statusClass = 'zone-full'
        // Full 3-Signature zone — the Zone Auction. Only Signature can bid here.
        const bidNote = zoneStatus.currentHighBid
          ? ` Current high bid is $${zoneStatus.currentHighBid}/mo`
          : ` Opening bids start above $${zoneStatus.bidFloor}/mo`
        zoneStatus.message = `Zone is held by 3 Signature listings — entry is by auction${bidNote}`
      } else if (resolution.blocked) {
        zoneStatus.statusClass = 'zone-full'
        if (incomingTier === 'spotlight') {zoneStatus.message = 'Zone has no free listing to displace — only a Signature listing can enter. Please upgrade to Signature'}
        else {zoneStatus.message = 'Zone is full — a free Verified listing cannot enter. Please apply as Spotlight or Signature'}
      } else if (resolution.displaces) {
        zoneStatus.statusClass = 'zone-warning'
        const displacedTier = resolution.displacedTier ?? 'lower-tier'
        if (incomingTier === 'signature' && displacedTier === 'spotlight') {zoneStatus.message = `Zone is full — your Signature listing will displace the lowest-performing Spotlight`} 
        else if (incomingTier === 'signature' && displacedTier === 'verified') {zoneStatus.message = `Zone is full — your Signature listing will displace the lowest-performing listing`} 
        else if (incomingTier === 'spotlight' && displacedTier === 'verified') {zoneStatus.message = `Zone is full — your Spotlight listing will displace the lowest-performing listing`} 
        else {zoneStatus.message = `Zone is full — your listing will displace a lower-tier listing`}
      } else if (taken < 3) {
        const remaining = 3 - taken
        if (incomingTier !== 'verified' && breakdown.verified > 0) {
          zoneStatus.statusClass = 'zone-open'
          const freeCount = breakdown.verified
          zoneStatus.message = taken === 1 ? `1 slot taken (${freeCount} free listing) — 2 slots available. Your paid listing will rank above it` : `${taken} slots taken — ${remaining} slot${remaining > 1 ? 's' : ''} available. Your paid listing will rank above free listings`
        } else {
          zoneStatus.statusClass = taken === 2 ? 'zone-warning' : 'zone-open'
          zoneStatus.message = taken === 1 ? '1 of 3 slots taken — 2 slots available' : `2 of 3 slots taken — 1 slot remaining`
        }
      }
      // 3. Render map
      await nextTick()
      const zoneRadiusM = apiData.zoneRadiusM ?? 200
      // If user has both primary + hidden_gems, pass the hidden_gems radius (900m) as second ring
      const hgRadiusM = (hasHiddenGem && primaryCategory) ? 900 : null
      initZoneMap(apiData.businesses ?? [], apiData.cityBusinesses ?? [], coords, currentTheme.value, zoneRadiusM, hgRadiusM)
    }
    function initZoneMap(businesses, cityBusinesses, coords, theme, zoneRadiusM = 200, hgRadiusM = null) {
      if (typeof window === 'undefined') return
      if (!window.L) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => renderMap(businesses, cityBusinesses, coords, theme, zoneRadiusM, hgRadiusM)
        document.head.appendChild(script)
      } else {renderMap(businesses, cityBusinesses, coords, theme, zoneRadiusM, hgRadiusM)}
    }
    async function renderMap(businesses, cityBusinesses, coords, theme, zoneRadiusM = 200, hgRadiusM = null) {
      const L = window.L
      const el = document.getElementById('zone-map')
      if (!el) return
      const center = [coords.lat, coords.lng]
      const isNight = theme === 'night-mode'
      if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
      }
      // Loading overlay
      const loadingEl = document.createElement('div')
      loadingEl.id = 'zone-map-loading'
      loadingEl.setAttribute('style', [
        'position:absolute', 'inset:0', 'z-index:1000',
        'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
        'gap:8px', 'border-radius:10px',
        isNight ? 'background:rgba(10,1,24,0.55)' : 'background:rgba(249,245,235,0.7)',
        'backdrop-filter:blur(3px)'
      ].join(';'))
      loadingEl.innerHTML = `
        <svg style="animation:spin 1s linear infinite;color:#D4AF37" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span style="font-size:12px;color:#D4AF37;opacity:0.8;font-family:inherit">Loading map…</span>
      `
      el.style.position = 'relative'
      el.appendChild(loadingEl)
      leafletMap = L.map('zone-map', { zoomControl: false, dragging: true, scrollWheelZoom: false, attributionControl: false}).setView(center, 14)
      leafletMap.once('load', () => { document.getElementById('zone-map-loading')?.remove() })
      setTimeout(() => { document.getElementById('zone-map-loading')?.remove() }, 3000)
      // Zoom control
      const ZoomControl = L.Control.extend({
        onAdd(map) {
          const wrap = L.DomUtil.create('div', 'zone-zoom-control')
          wrap.setAttribute('style', 'display:flex;flex-direction:column;gap:8px;margin:8px 8px 0 0;')
          L.DomEvent.disableClickPropagation(wrap)
          const btnStyle = ['width:34px','height:34px','border:none','border-radius:8px','cursor:pointer','padding:0','margin:0','display:flex','align-items:center','justify-content:center','box-sizing:border-box','overflow:hidden'].join(';')
          const iconStyle = 'display:block;font-family:system-ui,sans-serif;font-size:18px;font-weight:400;line-height:1;position:relative;top:0;'
          const zIn = L.DomUtil.create('button', 'zone-zoom-btn', wrap)
          zIn.setAttribute('style', btnStyle); zIn.setAttribute('title', 'Zoom in')
          zIn.innerHTML = `<span style="${iconStyle}">+</span>`
          L.DomEvent.on(zIn, 'click', L.DomEvent.stop).on(zIn, 'click', () => map.zoomIn())
          const zOut = L.DomUtil.create('button', 'zone-zoom-btn', wrap)
          zOut.setAttribute('style', btnStyle); zOut.setAttribute('title', 'Zoom out')
          zOut.innerHTML = `<span style="${iconStyle}">−</span>`
          L.DomEvent.on(zOut, 'click', L.DomEvent.stop).on(zOut, 'click', () => map.zoomOut())
          return wrap
        }
      })
      leafletMap.addControl(new ZoomControl({ position: 'topright' }))
      // ── CartoDB tiles — same as MapSelector, theme-aware ──
      const tileUrl = isNight ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      L.tileLayer(tileUrl, { attribution: '', subdomains: 'abcd', maxZoom: 19, detectRetina: true }).addTo(leafletMap)
      // ── Competitor color palette ──
      const competitorFill   = { signature: '#e53e3e', spotlight: '#f97316', verified: '#a78bfa' }
      const competitorBorder = { signature: '#c53030', spotlight: '#dd6b20', verified: '#7c3aed' }
      // ── Geocode competitors by address — same method used for your own business ──
      // Each competitor must have address + city (+ optionally country) in the API response.
      // If geocoding fails the competitor is silently skipped rather than placed wrongly.
      async function geocodeCompetitor(b) {
        const q = [b.address, b.city, b.country].filter(Boolean).join(', ')
        if (!q.trim()) return null
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'en' } })
          const data = await res.json()
          if (data.length) {
            const lat = parseFloat(data[0].lat)
            const lng = parseFloat(data[0].lon)
            console.log(`[ZoneMap] "${b.name}" geocoded → ${lat}, ${lng}`)
            return { lat, lng }
          }
        } catch { /* ignore */ }
        console.warn(`[ZoneMap] "${b.name}" geocoding failed — skipped`)
        return null
      }
      // Geocode all competitors in parallel before drawing
      const [resolvedZone, resolvedCity] = await Promise.all([
        Promise.all(businesses.map(async b => ({ ...b, _coords: await geocodeCompetitor(b) }))),
        Promise.all(cityBusinesses.map(async b => ({ ...b, _coords: await geocodeCompetitor(b) })))
      ])
      // ── City-wide businesses — faint reference dots ──
      resolvedCity.forEach(b => {
        if (!b._coords) return
        const { lat, lng } = b._coords
        const fill   = competitorFill[b.tier]   || '#f87171'
        const border = competitorBorder[b.tier]  || '#e53e3e'
        L.circle([lat, lng], { radius: zoneRadiusM, color: border, weight: 1, dashArray: '4 5', opacity: 0.25, fillColor: fill, fillOpacity: 0.06 }).addTo(leafletMap)
        L.marker([lat, lng], { icon: L.divIcon({ className: '', html: `<div style="width:9px;height:9px;border-radius:50%;background:${fill};border:1.5px solid white;opacity:0.45;box-shadow:0 0 4px ${fill}66"></div>`, iconSize: [9, 9], iconAnchor: [4, 4]})}).addTo(leafletMap).bindPopup(`<strong>${b.name}</strong><br><span style="opacity:0.7;text-transform:capitalize">${b.tier}</span>`)
      })
      // ── Same-zone competitors — vivid filled circles with glow pin ──
      resolvedZone.forEach(b => {
        if (!b._coords) return
        const { lat, lng } = b._coords
        const fill   = competitorFill[b.tier]   || '#f87171'
        const border = competitorBorder[b.tier]  || '#e53e3e'
        L.circle([lat, lng], {radius: zoneRadiusM, color: border, weight: 1.5, dashArray: '5 4', opacity: 0.8, fillColor: fill, fillOpacity: 0.55}).addTo(leafletMap)
        L.marker([lat, lng], { icon: L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center">
              <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:${fill};opacity:0.2;
                animation:zone-pulse 2.2s ease-in-out infinite;
                transform:translate(-50%,-50%);top:50%;left:50%"></div>
              <div style="width:14px;height:14px;border-radius:50%;background:${fill};
                border:2.5px solid white;
                box-shadow:0 0 10px ${fill},0 0 4px ${border},0 2px 6px rgba(0,0,0,0.4);
                z-index:1"></div>
            </div>`,
          iconSize: [20, 20], iconAnchor: [10, 10]
        })}).addTo(leafletMap).bindPopup(`<strong>${b.name}</strong><br><span style="opacity:0.7;text-transform:capitalize">${b.tier}</span> · same zone`)
      })
      // ── Your business zone(s) — drawn on top ────────────────────────────────
      // If dual-category (primary + hidden_gems), draw two distinct rings:
      //   outer ring = hidden gems zone (900m) in gold, semi-transparent
      //   inner ring = primary category zone (e.g. 300m) in blue, more vivid
      // Where they overlap the blue sits on top of gold — like blue liquid poured into gold.
      // Single category: just the gold ring as before.
      if (hgRadiusM && hgRadiusM !== zoneRadiusM) {
        // Outer hidden-gem ring — gold, faint
        L.circle(center, {radius: hgRadiusM, color: '#c09930', weight: 1.5, dashArray: '6 5', opacity: 0.55, fillColor: '#D4AF37', fillOpacity: 0.08}).addTo(leafletMap)
        // Inner primary ring — warm brown, sits on top of gold outer
        L.circle(center, {radius: zoneRadiusM, color: '#8B4513', weight: 2, dashArray: '5 4', opacity: 0.75, fillColor: '#A0522D', fillOpacity: 0.22}).addTo(leafletMap)
        // Soft glow halo — brown bleeds into gold creating warm chemical mix
        L.circle(center, {radius: zoneRadiusM * 1.15, color: 'transparent', weight: 0, fillColor: '#A0522D', fillOpacity: 0.05}).addTo(leafletMap)
      } else {
        // Single zone — classic gold ring
        L.circle(center, {radius: zoneRadiusM * 1.55, color: '#D4AF37', weight: 0, opacity: 0, fillColor: '#D4AF37', fillOpacity: 0.06}).addTo(leafletMap)
        L.circle(center, {radius: zoneRadiusM, color: '#c09930', weight: 1.5, dashArray: '5 5', opacity: 0.6, fillColor: '#D4AF37', fillOpacity: 0.18}).addTo(leafletMap)
      }
      L.marker(center, { icon: L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center">
            <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:#D4AF37;opacity:0.2;
              animation:zone-pulse 2.4s ease-in-out infinite;
              transform:translate(-50%,-50%);top:50%;left:50%"></div>
            <div style="width:16px;height:16px;border-radius:50%;
              background:linear-gradient(135deg,#f4d03f,#D4AF37);
              border:2.5px solid white;
              box-shadow:0 0 14px rgba(212,175,55,0.95),0 0 5px #c09930,0 2px 6px rgba(0,0,0,0.4);
              z-index:1"></div>
          </div>`,
        iconSize: [22, 22], iconAnchor: [11, 11]
      })}).addTo(leafletMap).bindPopup('<strong>Your business</strong>')
      // Fit bounds
      const allPoints = [center, ...resolvedZone.filter(b => b._coords).map(b => [b._coords.lat, b._coords.lng]), ...resolvedCity.filter(b => b._coords).map(b => [b._coords.lat, b._coords.lng])]
      const effectiveRadius = hgRadiusM ? Math.max(zoneRadiusM, hgRadiusM) : zoneRadiusM
      if (allPoints.length > 1) {leafletMap.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 15 })} 
      else {
        // Zoom to fit the largest circle — hgRadiusM if present
        const zoomForRadius = effectiveRadius >= 800 ? 13 : effectiveRadius >= 400 ? 14 : 15
        leafletMap.setView(center, zoomForRadius)
      }
    }
    // Note: we previously wiped form.eventEndDate when the user toggled from
    // recurring to one-time. That assumption no longer holds — a one-time event
    // can legitimately span multiple days (e.g. a weekend festival), so we keep
    // whatever end-date the user has set.

    // Watch address + businessType + tier to trigger zone check (debounced).
    // form.tier is included because the backend zone-check resolution depends on
    // tier (e.g. a full 3-Signature zone returns `blocked` for Verified/Spotlight
    // but `waitlisted` for Signature, which is what surfaces the auction panel).
    // Without watching tier, switching to Signature on a full zone leaves the
    // auction panel hidden until the user hits Submit and the apply route
    // rejects with requiresBid — see /apply error handler in this file.
    watch(
      () => [form.address, form.city, form.country, form.businessType.join(','), form.tier],
      () => {
        clearTimeout(zoneDebounce)
        zoneDebounce = setTimeout(checkZone, 800)
      }
    )
    // Watch event schedule (dates, times, recurring) + interests — re-run
    // overlap check when any of them change. Time fields are included now
    // because overlap detection works on full datetimes, not just dates.
    watch(
      () => [
        form.eventStartDate, form.eventStartTime,
        form.eventEndDate, form.eventEndTime,
        form.eventRecurring,
        form.interests.join(','), form.styles.join(',')
      ],
      () => {
        if (!isEvent.value) return
        clearTimeout(zoneDebounce)
        zoneDebounce = setTimeout(checkZone, 600)
      }
    )
    // When the category flips between event and non-event, the layout above
    // the map changes height (event rows appear / vanish). Tell Leaflet so its
    // cached pixel origin stays in sync — without this, the next zoom or pan
    // throws "_leaflet_pos is undefined".
    watch(isEvent, () => {
      nextTick(() => {
        try { leafletMap?.invalidateSize?.() } catch { /* map not yet ready */ }
      })
    })
    // Watch images — clear the "not enough images" error once the user has
    // provided enough valid images for their category (1 for events, 4 otherwise).
    watch(
      () => form.images.map(img => !!(img.url || img.file)),
      () => {
        const validImages = form.images.filter((img, i) => (img.url.trim() && !errors[`imageUrl_${i}`]) || img.file).length
        const minImages = isEvent.value ? 1 : 4
        if (validImages >= minImages) clearError('images')
      },
      { deep: true }
    )
    // ── End Zone Status ──────────────────────────────────────────
    function formatExpiry(iso) {
      if (!iso) return null
      const d = new Date(iso)
      if (isNaN(d)) return null
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
    function goHome() { router.push('/') }
    function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
    onMounted(() => {
      setTimeout(() => { isVisible.value = true }, 100)
      const tierParam = route.query.tier
      if (tierParam && ['verified', 'spotlight', 'signature'].includes(tierParam)) {selectTier(tierParam)}
      syncThemeColor()
    })
    watch(currentTheme, syncThemeColor)
    // Keep the browser chrome (mobile address-bar) + page background in sync with
    // the day/night look — same colors/approach App.vue + LandingPage use.
    const THEME_COLORS = { dark: '#0a0118', light: '#f9f5eb' }
    function syncThemeColor() {
      const theme = currentTheme.value === 'night-mode' ? 'dark' : 'light'
      const color = THEME_COLORS[theme]
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.backgroundColor = color
      let meta = document.querySelector('meta[name="theme-color"]:not([media])')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'theme-color')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', color)
    }
    return {
      isVisible, isSubmitting, isVerifying, showSuccess, submitError,
      showWaitlistConfirm, resolvedCoords, isEvent, usePriceRange, priceFree,
      verificationScore, verificationFlags, today,
      currentTheme, form, errors, zoneStatus,
      coreBusinessTypes, travelerInterests, travelerStyles,
      currencies, highlightPlaceholders,
      selectTier, selectBusinessType, toggleInterest, toggleStyle, hasPrimaryType, PAID_TIERS_LOCKED,
      addHighlight, removeHighlight,
      handleImageUpload, clearImage, validateImageUrl,
      clearError, capitalizeFirst, submitApplication, doSubmit, goHome, scrollToTop, formatExpiry,
      selectedHoursDay, selectHoursDay, hoursDisplay, lastCustomHours, applyLastHours, snapshotCurrentDay,
      onEventScheduleChange
    }
  }
}
</script>




<style scoped>
* { box-sizing: border-box }
.business-onboarding-page { min-height: 100vh; padding: 15px 30px 30px 30px; font-family: inherit }
.onboarding-wrapper { display: flex; justify-content: center }
.onboarding-container { width: 100%; max-width: 720px; opacity: 0; transition: opacity 0.5s ease }
.onboarding-container.fade-in { opacity: 1 }
/* Header */
.header-section { text-align: center; margin-bottom: 40px }
.back-button { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.875rem; font-weight: 500; opacity: 0.55; transition: opacity 0.2s; margin-bottom: 10px; padding: 4px 0 }
.back-button:hover { opacity: 1 }
/* Gradient page title */
.page-title {font-size: 1.8rem; font-weight: 700; margin: 0 0 25px; background: linear-gradient(90deg, #D4AF37 0%, #FF8C00 50%, #D4AF37 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text}
.subtitle { font-size: 1rem; margin: 0 0 30px; opacity: 0.8 }
/* Tier selector */
.tier-selector { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 10px }
.tier-card { border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s ease; border: none; text-align: left }
.tier-price { font-size: 1.8rem; font-weight: 700; margin: 10px 0 14px }
.tier-price span { font-size: 1rem; font-weight: 400; opacity: 0.7 }
.tier-features { list-style: none; padding: 0; margin: 0; font-size: 0.85rem; line-height: 2; opacity: 0.85 }
/* Verified badge */
.verified-badge-display { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: rgba(46, 204, 113, 0.15); color: #27ae60 }
/* Spotlight badge */
.spotlight-badge-display { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: linear-gradient(45deg, rgba(74,144,226,0.15), rgba(80,200,230,0.15)); color: #3b9edd }
/* Signature badge */
.signature-badge-display { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: linear-gradient(45deg, rgba(212,175,55,0.15), rgba(255,140,0,0.15)); color: #FF8C00 }
/* Spotlight badge */
.spotlight-badge-inline { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: rgba(99,179,237,0.15); color: #3182ce; border: 1px solid rgba(99,179,237,0.4); margin-left: 8px; vertical-align: middle }
/* AI images notice */
.ai-images-notice { display: flex; align-items: flex-start; gap: 14px; padding: 16px; border-radius: 10px; border: none; background: rgba(212,175,55,0.07) }
.ai-images-notice svg { flex-shrink: 0; margin-top: 2px; color: #c49a28 }
.ai-images-notice strong { font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 4px }
.ai-images-notice p { margin: 0; font-size: 0.82rem; opacity: 0.75; line-height: 1.5 }
.signature-badge-inline { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: linear-gradient(45deg, rgba(212,175,55,0.15), rgba(255,140,0,0.15)); color: #FF8C00; border: 1px solid rgba(212,175,55,0.4); margin-left: 8px; vertical-align: middle }
.spotlight-badge-inline { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: rgba(99,179,237,0.15); color: #3182ce; border: 1px solid rgba(99,179,237,0.4); margin-left: 8px; vertical-align: middle }
/* Form */
.onboarding-form { display: flex; flex-direction: column; gap: 20px }
.preference-section.active { display: block }
.card { border-radius: 12px; padding: 24px }
.section-header { margin-bottom: 20px }
.section-header h3 { margin: 0 0 6px; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; flex-wrap: wrap; gap: 6px }
.section-description { margin: 0; font-size: 0.9rem; opacity: 0.7 }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px }
.form-field { display: flex; flex-direction: column; gap: 6px }
.form-field.full-width { grid-column: 1 / -1 }
.form-field label { font-size: 0.85rem; font-weight: 600; opacity: 0.85 }
.required { color: #e53e3e }
.optional-tag { font-size: 0.72rem; font-weight: 500; opacity: 0.55; margin-left: 6px; font-style: italic }
.form-field input,
.form-field textarea { width: 100%; padding: 10px 14px; border-radius: 8px; border: none; font-size: 0.95rem; font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s }
/* resize is a textarea property — applying it to <input> via the combined
   selector above made Safari render an interactive resize handle on
   input[type="time"] (and number) once appearance was reset elsewhere.
   Scope resize: vertical to textareas only. */
.form-field textarea { resize: vertical }
.form-field input { resize: none }
.form-field input.error,
.form-field textarea.error { border-color: #e53e3e !important }
.field-error { font-size: 0.8rem; color: #e53e3e }
.field-hint { font-size: 0.78rem; opacity: 0.6; margin: 0 }
.char-count { font-size: 0.75rem; opacity: 0.5; text-align: right; transition: color 0.2s }
.char-count.char-warning { opacity: 1; color: #FF8C00 }
.char-count.char-danger { opacity: 1; color: #e53e3e; font-weight: 600 }
/* Type groups */
.type-group-label { font-size: 0.82rem; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px }
/* Type grid */
.type-grid { display: flex; flex-wrap: wrap; gap: 8px }
.type-chip { padding: 7px 14px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; border: 1px solid; user-select: none; display: flex; align-items: center; gap: 5px }
.type-chip.disabled { opacity: 0.4; cursor: default }
.type-chip.disabled:hover { background: inherit; border-color: inherit }
.type-chip.dimmed { opacity: 0.35; cursor: pointer; pointer-events: auto }
.type-chip.dimmed:hover { opacity: 1 }
.day-mode .type-chip.dimmed { opacity: 0.35 }
.day-mode .type-chip.dimmed:hover { opacity: 1 }
.night-mode .type-chip.dimmed { opacity: 0.35 }
.night-mode .type-chip.dimmed:hover { opacity: 1 }
.chip-lock { font-size: 0.7rem; font-weight: 600; color: #FF8C00; white-space: nowrap }
/* Hide number input spinners */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0 }
/* Price mode chips */
.price-mode-chips { display: flex; flex-wrap: wrap; gap: 8px }
/* Price range toggle */
.price-range-hint { margin: 6px 0 0; font-size: 0.78rem; opacity: 0.6 }
.price-range-toggle { background: none; border: none; padding: 0; font-family: inherit; font-size: 0.78rem; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; opacity: 0.8; transition: opacity 0.2s }
.price-range-toggle:hover { opacity: 1 }
.day-mode .price-range-toggle { color: #A0522D }
.night-mode .price-range-toggle { color: #94a3b8 }
.currency-chips { display: flex; flex-wrap: wrap; gap: 8px }
.price-chip { padding: 7px 14px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; border: 1px solid; user-select: none }
.price-range-row { grid-column: 1 / -1 }
.price-min-max { display: flex; align-items: center; gap: 12px; flex-wrap: wrap }
.price-min-max .input-with-prefix { flex: 1; min-width: 160px }
.price-range-dash { font-weight: 700; font-size: 1.2rem; opacity: 0.5; flex-shrink: 0 }
/* Input with prefix/suffix */
.input-with-prefix,
.input-with-suffix { display: flex; align-items: center; border-radius: 8px; overflow: hidden; border: none }
.input-prefix,
.input-suffix { padding: 10px 12px; font-size: 0.9rem; font-weight: 400; opacity: 0.6; flex-shrink: 0; min-width: 44px; display: flex; align-items: center; justify-content: center; }
.input-with-prefix input,
.input-with-suffix input { border: none !important; border-radius: 0 !important; flex: 1; box-shadow: none !important; min-width: 0 }
.price-min-max .input-prefix,
.price-min-max .input-suffix { min-width: 62px }
/* Signature note */
.signature-note { font-size: 0.8rem; color: #FF8C00; font-weight: 600; margin-left: 4px }
/* Images grid */
.images-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px }
.image-slot { border-radius: 10px; border: 1px dashed; padding: 10px; position: relative; min-height: 110px; display: flex; flex-direction: column; gap: 6px }
.image-slot-number { font-size: 0.7rem; font-weight: 700; opacity: 0.4; text-align: right }
.image-preview { position: absolute; inset: 0; width: 100%; height: 100%; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; display: block }
.remove-image-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.55); border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; padding: 0 }
.image-input-area { display: flex; flex-direction: column; gap: 6px; flex: 1 }
.image-url-input { width: 100%; padding: 7px 10px; border-radius: 6px; border: none; font-size: 0.78rem; font-family: inherit; outline: none; opacity: 0.7 }
.image-url-input:focus { opacity: 1 }
.image-or { font-size: 0.72rem; text-align: center; opacity: 0.45 }
.upload-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px dashed; opacity: 0.55 }
.upload-btn:hover { opacity: 0.85 }
.upload-btn input[type="file"] { display: none }
/* Highlights */
.locked-section { position: relative }
.locked-overlay { position: absolute; inset: 0; border-radius: 12px; z-index: 2; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.04); backdrop-filter: blur(1px) }
.locked-message { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 500; opacity: 0.8 }
.upgrade-link-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.85rem; font-weight: 700; text-decoration: underline; color: #FF8C00; padding: 0; margin-left: 4px }
.dimmed { opacity: 0.25; pointer-events: none }
.highlights-list { display: flex; flex-direction: column; gap: 10px }
.highlight-row { display: flex; gap: 8px; align-items: center }
.highlight-row input { flex: 1; padding: 10px 14px; border-radius: 8px; border: none; font-size: 0.9rem; font-family: inherit; outline: none }
.highlight-row input:disabled { opacity: 0.4 }
.remove-highlight-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; opacity: 0.5; transition: opacity 0.2s }
.remove-highlight-btn:hover { opacity: 1 }
.add-highlight-btn { background: none; border: 1px dashed; border-radius: 8px; padding: 10px; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.2s; opacity: 0.7 }
.add-highlight-btn:hover { opacity: 1 }
/* Tier summary */
.tier-summary { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-radius: 10px }
.tier-summary-badge { display: flex; align-items: center; gap: 7px; font-weight: 600; font-size: 0.9rem }
.change-tier-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.85rem; text-decoration: underline; opacity: 0.7; transition: opacity 0.2s }
.change-tier-btn:hover { opacity: 1 }
/* Tier feature limitations */
.tier-features .tier-feature-limit { opacity: 0.5; }
.night-mode .tier-features .tier-feature-limit { color: #94a3b8 }
.day-mode .tier-features .tier-feature-limit { color: #5c3f2e }
/* Submit error */
.submit-error { padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; background: rgba(229, 62, 62, 0.1); color: #e53e3e; text-align: center }
/* Terms Agreement */
.terms-agreement { padding: 14px 16px; border-radius: 10px; transition: all 0.2s }
.terms-agreement.terms-error { background: rgba(229, 62, 62, 0.05) !important }
.terms-label { display: flex; align-items: flex-start; gap: 10px; cursor: pointer }
.terms-checkbox { margin-top: 2px; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0 }
.terms-text { font-size: 0.875rem; line-height: 1.5 }
.terms-link { text-decoration: underline; text-underline-offset: 2px; transition: color 0.3s }
.terms-link:hover { opacity: 0.8 }
/* Day mode */
.day-mode  .terms-agreement { background: rgba(255,255,255,0.6) }
.day-mode  .terms-text { color: #5c3f2e; transition: color 0.25s }
.day-mode  .terms-text.terms-accepted { color: #A0522D }
/* Night mode */
.night-mode .terms-agreement { background: rgba(30,20,56,0.6) }
.night-mode .terms-text { color: #94a3b8; transition: color 0.25s }
.night-mode .terms-text.terms-accepted { transition: color 0.3s }
/* Magic button */
.magic-button { width: 100%; padding: 16px; border: none; border-radius: 25px; font-size: 1.05rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px }
.magic-button:disabled { opacity: 0.7; cursor: not-allowed }
.btn-loading { display: flex; align-items: center; gap: 8px }
.form-note { text-align: center; font-size: 0.85rem; opacity: 0.65; margin: 0; line-height: 1.5 }
/* Success modal */
.success-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px }
.success-modal { border-radius: 16px; padding: 32px; max-width: 440px; width: 100%; text-align: center }
.success-icon { margin-bottom: 20px; color: #27ae60 }
.success-modal h3 { font-size: 1.5rem; margin: 0 0 12px }
.success-modal p { margin: 0 0 10px; opacity: 0.85; font-size: 0.95rem; line-height: 1.5 }
.success-detail { font-size: 0.9rem !important }
.success-tier { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin: 12px 0 24px; background: linear-gradient(45deg, rgba(212,175,55,0.15), rgba(255,140,0,0.15)); color: #FF8C00; border: 1px solid rgba(212,175,55,0.3) }
/* ========== ZONE MAP ========== */
.zone-map-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px }
.zone-map-header label { font-size: 0.9rem; font-weight: 600 }
.zone-checking { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; opacity: 0.6 }
.zone-map { width: 100%; height: 300px; border-radius: 10px; overflow: hidden; margin-bottom: 10px; border: 1px solid rgba(212,175,55,0.2) }
.zone-dual-legend { display: flex; gap: 16px; margin-top: 6px; margin-bottom: 6px; flex-wrap: wrap }
.zone-dual-item { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; opacity: 0.7; text-transform: capitalize }
.zone-dual-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid }
.zone-dual-dot--primary { background: rgba(160,82,45,0.25); border-color: #8B4513 }
.zone-dual-dot--hg { background: rgba(212,175,55,0.2); border-color: #c09930 }
/* Status bar */
.zone-status-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 8px }
.zone-status-left { display: flex; align-items: center; gap: 8px }
.zone-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0 }
.zone-open .zone-status-dot { background: #4CAF50 }
.zone-warning .zone-status-dot { background: #FF8C00 }
.zone-full .zone-status-dot { background: #e53e3e }
.night-mode .zone-open { background: rgba(76,175,80,0.1); color: #81C784 }
.night-mode .zone-warning { background: rgba(255,140,0,0.1); color: #FFB74D }
.night-mode .zone-full { background: rgba(229,62,62,0.1); color: #FC8181 }
.day-mode .zone-open { background: rgba(76,175,80,0.08); color: #2E7D32 }
.day-mode .zone-warning { background: rgba(255,140,0,0.08); color: #E65100 }
.day-mode .zone-full { background: rgba(229,62,62,0.08); color: #c53030 }
/* Slots */
.zone-slots { display: flex; gap: 5px }
.zone-slot { width: 20px; height: 8px; border-radius: 4px }
.night-mode .slot-empty     { background: rgba(255,255,255,0.1) }
.night-mode .slot-taken     { background: rgba(229,62,62,0.6) }
.night-mode .slot-signature { background: rgba(212,175,55,0.85) }
.night-mode .slot-spotlight { background: rgba(59,158,221,0.85) }
.night-mode .slot-verified  { background: rgba(136,136,136,0.7) }
.day-mode .slot-empty     { background: rgba(0,0,0,0.1) }
.day-mode .slot-taken     { background: rgba(229,62,62,0.5) }
.day-mode .slot-signature { background: rgba(212,175,55,0.9) }
.day-mode .slot-spotlight { background: rgba(59,158,221,0.9) }
.day-mode .slot-verified  { background: rgba(136,136,136,0.6) }
/* Legend */
.zone-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 0.8rem; opacity: 0.85 }
.zone-legend-title { opacity: 0.6 }
.zone-legend-item { display: flex; align-items: center; gap: 5px }
.zone-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0 }
.zone-legend-item.signature .zone-legend-dot { background: #D4AF37 }
.zone-legend-item.spotlight .zone-legend-dot { background: #3b9edd }
.zone-legend-item.verified .zone-legend-dot { background: #888 }
/* Attribution removed via attributionControl:false (matches MapSelector approach) */
/* Zone map zoom control */
.zone-zoom-control { display: flex; flex-direction: column; gap: 8px; margin: 8px 8px 0 0 }
.night-mode .zone-zoom-btn { background: rgba(30,20,56,0.88) !important; color: #e2e8f0 !important; box-shadow: 0 2px 8px rgba(0,0,0,0.4) }
.night-mode .zone-zoom-btn:hover { background: rgba(157,123,255,0.35) !important }
.day-mode .zone-zoom-btn { background: rgba(255,255,255,0.95) !important; color: #3c2a1e !important; box-shadow: 0 2px 8px rgba(0,0,0,0.18) }
.day-mode .zone-zoom-btn:hover { background: rgba(212,175,55,0.2) !important }
/* ========== END ZONE MAP ========== */

/* ========== ZONE AUCTION PANEL ==========
   Surfaces when a Signature applicant lands on a full 3-Signature zone.
   Visual language mirrors the waitlist-detail-box / form-field inputs so
   the panel feels like a native part of the Zone section, not an alert. */
.zone-auction-panel {
  margin: 10px 0 4px;
  padding: 16px 18px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: none;
  position: relative;
  overflow: hidden;
}
.zone-auction-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #D4AF37, #FF8C00);
}
.night-mode .zone-auction-panel {
  background: rgba(30,20,56,0.55);
  color: #e2e8f0;
}
.day-mode .zone-auction-panel {
  background: rgba(255,250,240,0.85);
  color: #3c2a1e;
}
.zone-auction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
}
.night-mode .zone-auction-header { color: #D4AF37 }
.day-mode  .zone-auction-header { color: #A0522D }
.zone-auction-header svg { flex-shrink: 0 }
.zone-auction-explainer {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  opacity: 0.78;
}
.zone-auction-bid-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.zone-auction-label {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.85;
}
.zone-auction-input-wrap {
  display: flex;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
  border: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.night-mode .zone-auction-input-wrap {
  background: rgba(15,10,30,0.5);
}
.day-mode .zone-auction-input-wrap {
  background: rgba(255,255,255,0.7);
}
.zone-auction-input-wrap:has(.zone-auction-input.error) {
  border-color: #e53e3e !important;
}
.zone-auction-currency,
.zone-auction-per {
  padding: 10px 12px;
  font-size: 0.9rem;
  opacity: 0.65;
  flex-shrink: 0;
  font-weight: 500;
}
.zone-auction-currency { padding-right: 6px }
.zone-auction-per { padding-left: 6px }
.zone-auction-input {
  border: none !important;
  border-radius: 0 !important;
  flex: 1;
  outline: none;
  background: transparent;
  padding: 10px 4px;
  font-size: 0.95rem;
  font-family: inherit;
  color: inherit;
  min-width: 0;
  -moz-appearance: textfield;
}
.zone-auction-input::-webkit-inner-spin-button,
.zone-auction-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0 }
.zone-auction-highbid {
  font-size: 0.8rem;
  line-height: 1.45;
  opacity: 0.78;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid #D4AF37;
}
.night-mode .zone-auction-highbid {
  background: rgba(212,175,55,0.08);
}
.day-mode .zone-auction-highbid {
  background: rgba(212,175,55,0.1);
}
.zone-auction-highbid strong {
  font-weight: 700;
  opacity: 1;
}
.night-mode .zone-auction-highbid strong { color: #D4AF37 }
.day-mode  .zone-auction-highbid strong { color: #A0522D }
/* ========== END ZONE AUCTION PANEL ========== */

/* ========== EVENT SCHEDULE ========== */
.event-schedule-section { margin-bottom: 4px }
.event-schedule-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px }
.event-schedule-header label { font-size: 0.95rem; font-weight: 600 }
.event-time-note { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; opacity: 0.55 }
.event-tz-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; line-height: 1.4;
  margin: -4px 0 12px;
  padding: 7px 10px; border-radius: 8px;
  background: rgba(99,102,241,0.08); color: #6366f1;
}
.event-tz-note svg { flex-shrink: 0; opacity: 0.85 }
.event-tz-note strong { font-weight: 600 }
.night-mode .event-tz-note { background: rgba(129,140,248,0.12); color: #a5b4fc }

/* Each "Start" / "End" block is a labelled group containing date + time side by side */
.event-datetime-block { margin-bottom: 14px }
.event-datetime-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 8px;
}
.event-datetime-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
}
.event-datetime-field label {
  font-size: 0.82rem;
  font-weight: 500;
  opacity: 0.85;
  margin-bottom: 6px;
  display: block;
}
.event-datetime-input {
  width: 100%;
  height: auto;
  min-height: 0;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: transparent;
  color: inherit;
  /* Block the resize handle. The generic .form-field input rule applies
     resize: vertical, which Safari respects on date/time inputs once
     appearance is reset — that's what was making the box stretchable
     (and stretched) like a textarea. Lock the dimensions explicitly. */
  resize: none;
  /* Native browser controls inside date/time inputs vary across browsers
     (Chromium shows a tiny up/down spinner + picker dropdown; Safari shows
     step buttons). They look cluttered. We hide the spinner buttons; the
     picker icon remains because it's the affordance the user needs to
     actually open the picker. */
  appearance: none;
  -webkit-appearance: none;
}
/* Hide the inner spinner buttons (up/down arrows) on Webkit/Blink */
.event-datetime-input::-webkit-inner-spin-button,
.event-datetime-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
  margin: 0;
}
/* Hide the clear ("x") button some browsers add on date/time inputs —
   we already have validation messages, the X is redundant clutter. */
.event-datetime-input::-webkit-clear-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
/* Firefox: hide spinner buttons on number-style steppers (rarely shown for
   date/time but cheap to include for safety) */
.event-datetime-input { -moz-appearance: textfield }
/* Style the calendar/clock picker icon so it matches the input and is large
   enough to tap on mobile */
.event-datetime-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.55;
  padding: 4px;
  transition: opacity 0.2s;
}
.event-datetime-input::-webkit-calendar-picker-indicator:hover { opacity: 1 }
.event-datetime-input.error { border-color: #e53e3e !important }

/* "Repeats weekly" checkbox — clearly secondary to the date/time blocks above.
   Uses a custom box so it visually reads as "a single optional setting" rather
   than a toggle (the old toggle implied a hard either/or choice, but actually
   recurring is independent of the date span). */
.event-repeat-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 12px 14px;
  margin-top: 6px;
  border-radius: 10px;
  border: 1px solid;
  transition: background 0.15s, border-color 0.15s;
}
.event-repeat-check input { display: none }
.event-repeat-check-box {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1.5px solid;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
  margin-top: 1px;
}
.event-repeat-check input:checked + .event-repeat-check-box {
  background: #D4AF37;
  border-color: #D4AF37;
  color: white;
}
.event-repeat-check-text {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.event-repeat-check-hint {
  font-size: 0.78rem;
  font-weight: 400;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .event-datetime-row { grid-template-columns: 1fr 1fr; gap: 10px }
  .event-datetime-input { padding: 9px 12px; font-size: 0.9rem }
}

/* Theme variants for the date/time inputs and repeat checkbox */
.night-mode .event-datetime-input {
  background: rgba(157,123,255,0.08);
  border-color: rgba(157,123,255,0.3);
  color: #e2e8f0;
}
.night-mode .event-datetime-input:focus {
  border-color: #9D7BFF;
  box-shadow: 0 0 0 2px rgba(157,123,255,0.25);
}
.night-mode .event-datetime-input::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.55);
}
.day-mode .event-datetime-input {
  background: #f9f5eb;
  border-color: rgba(212,175,55,0.4);
  color: #3c2a1e;
}
.day-mode .event-datetime-input:focus {
  border-color: #d4af37;
  box-shadow: 0 0 0 2px rgba(212,175,55,0.2);
}

.night-mode .event-repeat-check {
  background: rgba(157,123,255,0.05);
  border-color: rgba(157,123,255,0.2);
}
.night-mode .event-repeat-check:hover { background: rgba(157,123,255,0.1) }
.night-mode .event-repeat-check-box { border-color: rgba(157,123,255,0.5) }
.day-mode .event-repeat-check {
  background: rgba(212,175,55,0.04);
  border-color: rgba(212,175,55,0.3);
}
.day-mode .event-repeat-check:hover { background: rgba(212,175,55,0.08) }
.day-mode .event-repeat-check-box { border-color: rgba(212,175,55,0.55) }

/* Legacy toggle styles kept below — still used by other parts of the form */
.toggle-label { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; padding: 10px 0 }
.toggle-input { display: none }
.toggle-track { width: 36px; height: 20px; border-radius: 10px; transition: background 0.2s; flex-shrink: 0; position: relative }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3) }
.toggle-input:checked + .toggle-track { background: #D4AF37 }
.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(16px) }
.night-mode .toggle-track { background: rgba(157,123,255,0.25) }
.day-mode  .toggle-track { background: rgba(0,0,0,0.15) }
.toggle-text { font-size: 0.85rem; opacity: 0.75 }
/* Event conflicts list */
.event-conflicts { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; font-size: 0.82rem }
.event-conflict-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px }
.night-mode .event-conflict-row { background: rgba(255,255,255,0.04) }
.day-mode  .event-conflict-row { background: rgba(0,0,0,0.03) }
.night-mode .event-conflict-row.high-conflict { background: rgba(255,140,0,0.08); border: 1px solid rgba(255,140,0,0.2) }
.day-mode  .event-conflict-row.high-conflict { background: rgba(255,140,0,0.06); border: 1px solid rgba(255,140,0,0.18) }
.event-conflict-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0 }
.event-conflict-dot.signature { background: #D4AF37 }
.event-conflict-dot.spotlight  { background: #3b9edd }
.event-conflict-dot.verified   { background: #888 }
.event-conflict-name { font-weight: 600; flex: 1 }
.event-conflict-tier { opacity: 0.5; text-transform: capitalize; font-size: 0.78rem }
.event-conflict-interest { display: flex; align-items: center; gap: 3px; color: #FF8C00; font-size: 0.75rem; font-weight: 600; white-space: nowrap }
/* ========== ZONE-LOCKED TIER CARDS ========== */
.tier-card { position: relative }
.tier-card.zone-locked { opacity: 0.45; cursor: not-allowed; pointer-events: none; user-select: none }
.zone-locked-overlay { position: absolute; inset: 0; border-radius: 10px; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.78rem; font-weight: 600; pointer-events: none }
.night-mode .zone-locked-overlay { background: rgba(10,1,24,0.55); color: #94a3b8 }
.day-mode  .zone-locked-overlay { background: rgba(249,245,235,0.65); color: #5c3f2e }
/* ========== VERIFICATION BANNER ========== */
.verification-banner { display: flex; align-items: flex-start; gap: 8px; padding: 12px 14px; border-radius: 8px; font-size: 0.85rem; line-height: 1.45; margin: 12px 0; text-align: left }
.verif-good    { background: rgba(76,175,80,0.1); color: #2e7d32 }
.verif-review  { background: rgba(255,160,0,0.1); color: #e65100 }
.verif-flagged { background: rgba(229,62,62,0.08); color: #c62828 }
.night-mode .verif-good    { color: #81c784 }
.night-mode .verif-review  { color: #ffb74d }
.night-mode .verif-flagged { color: #ef9a9a }
.verification-banner svg { flex-shrink: 0; margin-top: 1px }
/* ========== VERIFYING MODAL ========== */
.verifying-modal { max-width: 400px; text-align: center }
.verifying-icon { margin-bottom: 20px }
.night-mode .verifying-icon { color: #D4AF37 }
.day-mode  .verifying-icon { color: #c09930 }
.verifying-steps { display: flex; flex-direction: column; gap: 10px; margin: 20px 0 0; text-align: left }
.verifying-step { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; opacity: 0.7 }
.verifying-step.active { opacity: 1 }
.night-mode .verifying-step { color: #94a3b8 }
.night-mode .verifying-step.active { color: #e2e8f0 }
.day-mode  .verifying-step { color: #5c3f2e }
.day-mode  .verifying-step.active { color: #3c2a1e }
/* ========== WAITLIST MODAL ========== */
.waitlist-modal { max-width: 460px }
.waitlist-icon { margin-bottom: 16px }
.night-mode .waitlist-icon { color: #D4AF37 }
.day-mode  .waitlist-icon { color: #c09930 }
.waitlist-success-icon { color: #D4AF37 !important }
.waitlist-detail-box { border-radius: 10px; padding: 16px 18px; margin: 18px 0 14px; display: flex; flex-direction: column; gap: 10px; text-align: left }
.night-mode .waitlist-detail-box { background: rgba(30,20,56,0.7); border: 1px solid rgba(157,123,255,0.2) }
.day-mode  .waitlist-detail-box { background: rgba(255,255,255,0.7); border: 1px solid rgba(212,175,55,0.2) }
.waitlist-detail-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 0.88rem }
.waitlist-label { opacity: 0.55; flex-shrink: 0 }
.waitlist-value { font-weight: 600 }
.waitlist-date { color: #D4AF37 }
/* ── Opening Hours ──────────────────────────────────────────────────────── */
.hours-chips { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 4px }
@media (max-width: 600px) { .hours-chips { grid-template-columns: repeat(4, 1fr) } }
.hours-chip { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border-radius: 10px; cursor: pointer; transition: all 0.18s ease; background: rgba(157,123,255,0.04); user-select: none }
.hours-chip:hover {  background: rgba(157,123,255,0.1) }
.hours-chip--active { background: rgba(157,123,255,0.15) !important }
.hours-chip--closed { opacity: 0.4 }
.hours-chip--error { border-color: rgba(229,62,62,0.6) !important }
.hours-chip-day { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; opacity: 0.75 }
.hours-chip-time { font-size: 0.62rem; opacity: 0.5; text-align: center; line-height: 1.3 }
.hours-edit-panel { margin-top: 14px; border-radius: 12px; background: rgba(157,123,255,0.07); overflow: hidden }
.hours-panel-inner { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px }
.hours-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px }
.hours-panel-title { font-size: 1rem; font-weight: 600 }
.hours-status-pills { display: flex; border-radius: 20px; overflow: hidden; border: 1px solid rgba(157,123,255,0.3) }
.hours-pill { padding: 5px 14px; font-size: 0.78rem; font-family: inherit; font-weight: 500; border: none; cursor: pointer; background: transparent; color: inherit; opacity: 0.5; transition: all 0.15s }
.hours-pill--active { background: rgba(157,123,255,0.2); opacity: 1; font-weight: 600 }
.hours-pill--close.hours-pill--active { background: rgba(229,62,62,0.15); color: #e53e3e }
.day-mode .hours-status-pills { border-color: rgba(212,175,55,0.35) }
.day-mode .hours-pill--active { background: rgba(212,175,55,0.15) }
.day-mode .hours-pill--close.hours-pill--active { background: rgba(229,62,62,0.1) }
.hours-time-row { display: flex; align-items: flex-end; gap: 8px }
.hours-time-block { display: flex; flex-direction: column; gap: 5px; flex: 1 }
@media (max-width: 480px) { .hours-time-row { flex-direction: column; gap: 10px } .hours-time-block { width: 100% } }
.hours-time-label { font-size: 0.72rem; opacity: 0.6; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase }
.hours-time-input { width: 100%; padding: 9px 12px; border-radius: 8px; font-size: 0.9rem; font-family: inherit; background: #241840; border: none; color: inherit }
.hours-time-input:focus { outline: none; background: rgba(157,123,255,0.08) }
.hours-time-input.error { border-color: #e53e3e }
.hours-last-btn { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-family: inherit; cursor: pointer; border: 1px dashed rgba(157,123,255,0.4); background: rgba(157,123,255,0.07); color: inherit; opacity: 0.75; transition: all 0.15s; align-self: flex-start }
.hours-last-btn:hover { opacity: 1; background: rgba(157,123,255,0.15); border-color: rgba(157,123,255,0.6) }
.day-mode .hours-last-btn { border-color: rgba(212,175,55,0.4); background: rgba(212,175,55,0.06); color: #3c2a1e }
.day-mode .hours-last-btn:hover { background: rgba(212,175,55,0.15); border-color: rgba(212,175,55,0.6) }
.hours-panel-enter-active, .hours-panel-leave-active { transition: all 0.2s ease }
.hours-panel-enter-from, .hours-panel-leave-to { opacity: 0; transform: translateY(-6px) }
.day-mode .hours-chip { background: rgba(212,175,55,0.04) }
.day-mode .hours-chip:hover { background: rgba(212,175,55,0.1) }
.day-mode .hours-chip--active { background: rgba(212,175,55,0.12) !important }
.day-mode .hours-edit-panel { background: rgba(212,175,55,0.06) }
.day-mode .hours-time-input { background: #f9f5eb; color: #3c2a1e }
.day-mode .hours-time-input:focus { background: #f4e8c9 !important }
.tier-pill { padding: 2px 10px; border-radius: 20px; font-size: 0.8rem }
.tier-pill.signature { background: rgba(212,175,55,0.15); color: #D4AF37;  border: 1px solid rgba(212,175,55,0.3) }
.tier-pill.spotlight  { background: rgba(59,158,221,0.15); color: #3b9edd; border: 1px solid rgba(59,158,221,0.3) }
.tier-pill.verified   { background: rgba(76,175,80,0.12);  color: #4CAF50; border: 1px solid rgba(76,175,80,0.25) }
.waitlist-note { font-size: 0.82rem !important; opacity: 0.6 !important; margin: 0 0 20px !important }
.waitlist-actions { display: flex; flex-direction: column; gap: 10px; width: 100% }
.waitlist-cancel-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.88rem; padding: 8px; opacity: 0.5; transition: opacity 0.2s }
.waitlist-cancel-btn:hover { opacity: 1 }
.night-mode .waitlist-cancel-btn { color: #e2e8f0 }
.day-mode  .waitlist-cancel-btn { color: #3c2a1e }
/* Spinner */
.spinner { animation: spin 1s linear infinite }
/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
/* ========== MOBILE ========== */
@media (max-width: 768px) {
  .business-onboarding-page { padding: 10px 15px 30px 15px }
  .tier-selector { grid-template-columns: 1fr }
  .form-grid { grid-template-columns: 1fr }
  .form-field.full-width { grid-column: 1 }
  .card { padding: 18px 15px }
  .images-grid { grid-template-columns: repeat(2, 1fr) }
  .price-min-max { flex-direction: column; align-items: stretch }
  .price-range-dash { display: none }
}
/* ========== DAY MODE ========== */
.day-mode { background: #f9f5eb; color: #3c2a1e }
.day-mode .subtitle { color: #5c3f2e }
.day-mode .back-button { color: #5c3f2e }
.day-mode .card { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px #8b45131a }
.day-mode .section-header h3 { color: #A0522D }
.day-mode .section-description { color: #5c3f2e }
.day-mode .form-field label { color: #5c3f2e }
.day-mode .form-field input,
.day-mode .form-field textarea,
.day-mode .highlight-row input,
.day-mode .image-url-input { background: #f9f5eb; color: #3c2a1e }
.day-mode .form-field input:focus,
.day-mode .form-field textarea:focus,
.day-mode .highlight-row input:focus { background: rgba(212,175,55,0.2) }
.day-mode .form-field input::placeholder,
.day-mode .form-field textarea::placeholder,
.day-mode .image-url-input::placeholder { color: rgba(92,74,66,0.5) }
.day-mode .type-chip, .day-mode .price-chip { background: rgba(255,255,255,0.9); border-color: rgba(212,175,55,0.3); color: #3c2a1e }
.day-mode .type-chip:hover:not(.disabled):not(.selected), .day-mode .price-chip:hover:not(.selected) { background: rgba(212,175,55,0.1) }
.day-mode .type-chip.selected, .day-mode .price-chip.selected { background: linear-gradient(45deg, #D4AF37, #FF8C00); color: white; border-color: transparent }
.day-mode .tier-card { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px #8b45131a }
.day-mode .tier-card:hover { box-shadow: 0 0 8px rgba(139,69,19,0.4) }
.day-mode .tier-card.selected { border-color: transparent; box-shadow: 0 0 10px rgba(76,175,80,0.5); background: rgba(76,175,80,0.2) }
.day-mode .spotlight-card.selected { border-color: transparent; box-shadow: 0 0 10px rgba(59,158,221,0.5); background: rgba(59,158,221,0.2) }
.day-mode .signature-card.selected { border-color: transparent; box-shadow: 0 0 10px rgba(212,175,55,0.6); background: rgba(212,175,55,0.2) }
.day-mode .tier-price { color: #3c2a1e }
.day-mode .add-highlight-btn { border-color: rgba(212,175,55,0.4); color: #5c3f2e }
.day-mode .add-highlight-btn:hover { background: rgba(212,175,55,0.1) }
.day-mode .remove-highlight-btn { color: #5c3f2e }
.day-mode .tier-summary { background: rgba(255,255,255,0.6) }
.day-mode .tier-summary-badge { color: #A0522D }
.day-mode .change-tier-btn { color: #5c3f2e }
.day-mode .ai-images-notice { background: rgba(212,175,55,0.08); color: #7a5c00 }
.day-mode .input-with-prefix, .day-mode .input-with-suffix { background: #f9f5eb }
.day-mode .input-prefix, .day-mode .input-suffix { background: rgba(212,175,55,0.1); color: #5c3f2e }
.day-mode .magic-button { background: linear-gradient(45deg, #D4AF37, #FF8C00); color: white }
.day-mode .magic-button:hover { box-shadow: 0 0 8px rgba(212,175,55,0.5) }
.day-mode .success-modal { background: rgba(255,255,255,0.98); color: #3c2a1e; border: 1px solid rgba(212,175,55,0.2) }
.day-mode .image-slot { border-color: rgba(212,175,55,0.35); background: rgba(255,255,255,0.6) }
.day-mode .upload-btn { border-color: rgba(212,175,55,0.4); color: #5c3f2e; background: rgba(212,175,55,0.05) }
.day-mode .upload-btn:hover { background: rgba(212,175,55,0.12) }
.day-mode .locked-overlay { background: rgba(249,245,235,0.75) }
.day-mode .type-group-label { color: #5c3f2e }
/* ========== NIGHT MODE ========== */
.night-mode { background: linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%); color: #e2e8f0 }
.night-mode .subtitle { color: #94a3b8 }
.night-mode .back-button { color: #94a3b8 }
.night-mode .card { background: #1e1438; box-shadow: 0 0 8px #8b5cf633 }
.night-mode .section-header h3 { color: #e2e8f0 }
.night-mode .section-description { color: #94a3b8 }
.night-mode .form-field label { color: #e2e8f0 }
.night-mode .form-field input,
.night-mode .form-field textarea,
.night-mode .highlight-row input,
.night-mode .image-url-input { background: #241840; border-color: rgba(157,123,255,0.3); color: #e2e8f0 }
.night-mode .form-field input:focus,
.night-mode .form-field textarea:focus,
.night-mode .highlight-row input:focus { background: #241845 }
.night-mode .form-field input::placeholder,
.night-mode .form-field textarea::placeholder,
.night-mode .image-url-input::placeholder { color: rgba(226,232,240,0.4) }
.night-mode .type-chip, .night-mode .price-chip { background: #241845; border-color: rgba(157,123,255,0.3); color: #e2e8f0 }
.night-mode .type-chip:hover:not(.disabled):not(.selected), .night-mode .price-chip:hover:not(.selected) { background: rgba(157,123,255,0.15) }
.night-mode .type-chip.selected, .night-mode .price-chip.selected { background: linear-gradient(45deg, #D4AF37, #FF8C00); color: white; border-color: transparent }
.night-mode .tier-card { background: #1e1438; box-shadow: 0 0 8px #8b5cf633 }
.night-mode .tier-card:hover { box-shadow: 0 0 12px rgba(157,123,255,0.25) }
.night-mode .tier-card.selected { border-color: transparent; box-shadow: 0 0 10px rgba(76,175,80,0.45); background: rgba(76,175,80,0.2) }
.night-mode .spotlight-card.selected { border-color: transparent; box-shadow: 0 0 10px rgba(59,158,221,0.45); background:rgba(59,158,221, 0.2) }
.night-mode .signature-card.selected { border-color: transparent; box-shadow: 0 0 10px rgba(212,175,55,0.55); background:rgba(212,175,55, 0.2) }
.night-mode .tier-price { color: #e2e8f0 }
.night-mode .tier-features { color: #94a3b8 }
.night-mode .add-highlight-btn { border-color: rgba(157,123,255,0.3); color: #94a3b8 }
.night-mode .add-highlight-btn:hover { background: rgba(157,123,255,0.1) }
.night-mode .remove-highlight-btn { color: #94a3b8 }
.night-mode .tier-summary { background: rgba(30,20,56,0.6) }
.night-mode .tier-summary-badge { color: #FF8C00 }
.night-mode .change-tier-btn { color: #94a3b8 }
.night-mode .ai-images-notice { background: rgba(148,163,184,0.06); border: none; color: #94a3b8 }
.night-mode .ai-images-notice svg { color: #94a3b8 }
.night-mode .input-with-prefix, .night-mode .input-with-suffix { border-color: rgba(157,123,255,0.3); background: #241845 }
.night-mode .input-prefix, .night-mode .input-suffix { background: rgba(157,123,255,0.1); color: #94a3b8 }
.night-mode .magic-button { background: linear-gradient(45deg, #D4AF37, #FF8C00); color: white }
.night-mode .magic-button:hover { box-shadow: 0 0 8px rgba(255,140,0,0.45) }
.night-mode .success-modal { background: #1e1438; color: #e2e8f0 }
.night-mode .image-slot { border-color: rgba(157,123,255,0.25); background: #1a1035 }
.night-mode .upload-btn { border-color: rgba(157,123,255,0.35); color: #94a3b8; background: rgba(157,123,255,0.06) }
.night-mode .upload-btn:hover { background: rgba(157,123,255,0.12) }
.night-mode .locked-overlay { background: rgba(10,1,24,0.6) }
.night-mode .locked-message { color: #94a3b8 }
.night-mode .type-group-label { color: #94a3b8 }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes zone-pulse { 0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.22 } 50% { transform: translate(-50%,-50%) scale(1.7); opacity: 0 } }
</style>

<style>
/* ── Thin themed scrollbar (matches JinniChat palette) ─────────────────────── */
/* Firefox */
html { scrollbar-width: thin; scrollbar-color: rgba(192,132,252,0.1) transparent }
html[data-theme="light"] { scrollbar-color: rgba(160,82,45,0.3) transparent }

/* WebKit (Chrome, Safari, Edge) */
::-webkit-scrollbar { width: 8px; height: 8px }
::-webkit-scrollbar-track { background: transparent }
::-webkit-scrollbar-thumb { border-radius: 4px; background: rgba(192,132,252,0.1); transition: background 0.3s ease }
::-webkit-scrollbar-thumb:hover { background: rgba(192,132,252,0.3) }

html[data-theme="light"] ::-webkit-scrollbar-thumb { background: rgba(160,82,45,0.3) }
html[data-theme="light"] ::-webkit-scrollbar-thumb:hover { background: rgba(160,82,45,0.5) }
</style>