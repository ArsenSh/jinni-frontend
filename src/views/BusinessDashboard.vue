<template>
  <div class="biz-dash" :class="theme">
    <SwitchModeOverlay :visible="isSwitching" label="Switching to Exploring" :theme="theme === 'day-mode' ? 'light' : 'dark'" />

    <!-- Sidebar overlay (mobile) -->
    <div v-if="mobileNavOpen && !isDesktop" class="sidebar-overlay" @click="handleOverlayClick"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen, 'sidebar-open': mobileNavOpen }">

      <!-- Brand header -->
      <div class="app-header">
        <div v-if="sidebarOpen || mobileNavOpen" class="app-brand">
          <img src="/images/bottle.png" class="app-icon" alt="Jinni" />
          <span class="app-name">Jinni</span>
          <button v-if="isDesktop" @click="sidebarOpen = false" class="collapse-btn collapse-btn-inline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>
        <div v-else class="app-brand-collapsed">
          <img src="/images/bottle.png" class="app-icon-collapsed" alt="Jinni" />
        </div>
      </div>

      <!-- Sidebar sub-header: tier badge when expanded, collapse/expand button when collapsed -->
      <div class="sidebar-header">
        <!-- Tier badge — visible when sidebar is open -->
        <div v-if="(sidebarOpen || mobileNavOpen) && business" class="sidebar-tier-badge" :class="business?.partnership?.tier">
          <template v-if="business?.partnership?.tier === 'signature'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Signature</span>
          </template>
          <template v-else-if="business?.partnership?.tier === 'spotlight'">
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
            <span>Spotlight</span>
          </template>
          <template v-else>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Verified</span>
          </template>
        </div>

        <!-- Collapsed: icon-only tier badge -->
        <div v-if="!sidebarOpen && !mobileNavOpen && isDesktop && business" class="sidebar-tier-badge sidebar-tier-badge--icon" :class="business?.partnership?.tier">
          <template v-if="business?.partnership?.tier === 'signature'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </template>
          <template v-else-if="business?.partnership?.tier === 'spotlight'">
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
          </template>
          <template v-else>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </template>
        </div>

        <button v-if="!sidebarOpen && isDesktop" @click="sidebarOpen = true" class="collapse-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <!-- Nav items (styled like chat sessions) -->
      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{
            active: activeTab === tab.id,
            disabled: tab.requiresActive && business?.status !== 'active'
          }"
          @click="tab.requiresActive && business?.status !== 'active' ? null : (setTab(tab.id), closeMobileSidebar())"
        >
          <span class="nav-icon" v-html="tab.icon"></span>
          <template v-if="sidebarOpen || mobileNavOpen">
            <span class="nav-label">{{ tab.label }}</span>
          </template>
        </button>
      </nav>

      <!-- Switch to Exploring -->
      <div v-if="sidebarOpen || mobileNavOpen" class="switch-mode-wrapper">
        <button @click="handleSwitchToExploring" class="switch-mode-btn">
          <span class="switch-mode-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </span>
          <span class="switch-mode-label">Switch to Exploring</span>
        </button>
      </div>

      <!-- Profile / footer -->
      <div v-if="sidebarOpen || mobileNavOpen" class="sidebar-footer">
        <button @click.stop="showProfileMenu = !showProfileMenu" class="profile-btn">
          <div class="profile-expanded">
            <div class="default-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <div class="profile-info">
              <div class="profile-name">{{ business?.name || 'Your Business' }}</div>
            </div>
          </div>
        </button>

        <transition name="profile-menu">
          <div v-if="showProfileMenu" class="profile-menu" v-click-outside="closeProfileMenu" @click.stop>
            <button @click="openSettings" class="profile-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              <span>Settings</span>
            </button>
            <button @click="goToContactUs" class="profile-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Contact us</span>
            </button>
            <button v-if="business?.partnership?.tier !== 'signature'" @click="$router.push('/business/apply')" class="profile-menu-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Upgrade plan</span>
            </button>
            <button @click="signOut" class="profile-menu-item logout-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Sign out</span>
            </button>
          </div>
        </transition>
      </div>
    </aside>

    <!-- Main content -->
    <main class="dash-main">

      <!-- Mobile header — outside dash-scroll so it stays pinned -->
      <div class="mobile-header">
        <div class="mobile-nav">
          <button class="mobile-menu-btn" @click="toggleSidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="4" y1="8" x2="20" y2="8"/>
              <line x1="4" y1="16" x2="14" y2="16"/>
            </svg>
          </button>
        </div>
        <span class="current-session-title">{{ tabs.find(t => t.id === activeTab)?.label }}</span>
      </div>

      <!-- Fixed header — mirrors JinniChat .fixed-header exactly -->
      <div class="dash-fixed-header">
        <div class="dash-header-inner">
          <span class="dash-tab-title">{{ tabs.find(t => t.id === activeTab)?.label }}</span>
          <div v-if="activeTab === 'overview' && business" class="status-pill" :class="business.status">{{ statusLabel }}</div>
        </div>
      </div>

      <div class="dash-scroll">

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loading-ring"></div>
        <p>Loading your listing…</p>
      </div>

      <!-- No business -->
      <div v-else-if="!business" class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h2>No listing found</h2>
        <p>You don't have an active business listing yet</p>
        <button class="cta-btn" @click="$router.push('/business/apply')">Submit a listing</button>
      </div>

      <template v-else>

        <!-- ==================== OVERVIEW TAB ==================== -->
        <div v-if="activeTab === 'overview'" class="tab-content">

          <!-- Status banner -->
          <div class="status-banner" :class="'s-' + business.status">
            <div class="status-banner-icon" v-html="statusIcon"></div>
            <div class="status-banner-body">
              <strong>{{ statusHeadline }}</strong>
              <p>{{ statusDetail }}</p>
            </div>
            <button v-if="business.status === 'frozen'" class="cta-btn small" @click="$router.push('/business/apply')">
              Upgrade tier
            </button>
            <button v-if="business.status === 'rejected' && !isHardRejected" class="cta-btn small" @click="setTab('edit')">
              Fix &amp; resubmit
            </button>
            <!-- Expired CTA: jumps the owner to the edit tab where the
                 expired notice + Event Schedule editor are waiting. We don't
                 link to /apply (that's for fresh applications); the owner's
                 existing listing just needs a new date and a re-review. -->
            <button v-if="business.status === 'expired' && canEdit" class="cta-btn small" @click="setTab('edit')">
              Reschedule event
            </button>
          </div>

          <!-- Listing card -->
          <div class="panel listing-panel">
            <div class="panel-head">
              <h2>Your listing</h2>
            </div>

            <!-- Images — all tiers see images (AI-assigned for Verified, URLs/uploads for paid).
                 When the listing is expired the whole gallery softens
                 (lower opacity + slight grayscale) to communicate "no longer
                 active" without removing access to the images. -->
            <div class="gallery" v-if="allImages.length" :class="{ 'gallery--expired': business?.status === 'expired' }">
              <img
                v-for="(img, i) in allImages.slice(0,8)"
                :key="i"
                :src="img"
                :alt="business.name"
                class="gallery-img"
                :class="{ featured: i === 0 }"
                @error="$event.target.style.display='none'"
              />
              <div class="gallery-img gallery-name-block">
                <span class="gallery-name-value">{{ business.name }}</span>
              </div>
            </div>
            <div v-else class="no-images-notice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Images will appear after approval</span>
            </div>

            <!-- Core info — all tiers -->
            <div class="listing-meta-grid">
              <div class="meta-block">
                <span class="meta-label">Category</span>
                <span class="meta-value">
                  {{ mainCategory }}
                  <span v-if="business.isHiddenGem" class="hidden-gem-badge">✦ Hidden Gem</span>
                </span>
              </div>
              <div class="meta-block">
                <span class="meta-label">Address</span>
                <span class="meta-value">{{ business?.location?.address }}, {{ business?.location?.city }}, {{ business?.location?.country }}</span>
              </div>
              <div class="meta-block" v-if="business?.contact?.phone">
                <span class="meta-label">Phone</span>
                <span class="meta-value">{{ business?.contact?.phone }}</span>
              </div>
              <div class="meta-block">
                <div class="meta-label-row">
                  <span class="meta-label">Email</span>
                  <button class="email-vis-toggle" :class="{ 'is-visible': business.contact.showEmail }" @click="toggleShowEmail" :disabled="savingShowEmail">
                    <svg v-if="!business.contact.showEmail" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {{ savingShowEmail ? '…' : (business.contact.showEmail ? 'Users can see email' : 'Users cannot see email') }}
                  </button>
                </div>
                <span class="meta-value">{{ currentUserEmail || '—' }}</span>
              </div>
              <div class="meta-block" v-if="business?.contact?.website">
                <span class="meta-label">Website</span>
                <a :href="business?.contact?.website" :title="business?.contact?.website" target="_blank" class="meta-link meta-link--truncate">{{ business?.contact?.website }}</a>
              </div>

              <!-- Pricing — half width (sits beside other meta blocks) -->
              <div class="meta-block" v-if="business?.pricing?.isFree || business?.pricing?.min != null || business?.pricing?.max != null || business?.pricing?.average != null || pricingLabel">
                <span class="meta-label">Pricing</span>
                <div class="pricing-display">
                  <!-- Free -->
                  <template v-if="business?.pricing?.isFree">
                    <span class="pricing-badge pricing-badge--free">
                      Free
                    </span>
                  </template>
                  <!-- Range -->
                  <template v-else-if="business?.pricing?.min != null && business?.pricing?.max != null">
                    <div class="pricing-range-row">
                      <span class="pricing-range-label">From</span>
                      <span class="pricing-amount">{{ business.pricing.currency || '' }}{{ business.pricing.min }}</span>
                      <span class="pricing-range-dash">—</span>
                      <span class="pricing-amount">{{ business.pricing.currency || '' }}{{ business.pricing.max }}</span>
                      <span class="pricing-range-label">per person</span>
                    </div>
                  </template>
                  <!-- Average -->
                  <template v-else-if="business?.pricing?.average != null">
                    <div class="pricing-range-row">
                      <span class="pricing-range-label">~</span>
                      <span class="pricing-amount">{{ business.pricing.currency || '' }}{{ business.pricing.average }}</span>
                      <span class="pricing-range-label">avg per person</span>
                    </div>
                  </template>
                  <!-- Fallback symbol -->
                  <template v-else-if="pricingLabel">
                    <span class="pricing-symbol">{{ pricingLabel }}</span>
                  </template>
                </div>
              </div>

              <!-- Event schedule — events only, full width so the date range
                   has room to breathe and a possible "Ended" pill fits.
                   Shows different shapes depending on recurrence and whether
                   times are set. See eventScheduleDisplay computed for the
                   formatting rules. -->
              <div class="meta-block meta-block--full" v-if="isEvent && eventScheduleDisplay">
                <span class="meta-label">{{ eventScheduleDisplay.isRecurring ? 'Schedule' : 'Event date' }}</span>
                <div class="event-schedule-display">
                  <span class="event-schedule-primary">{{ eventScheduleDisplay.primary }}</span>
                  <span v-if="eventScheduleDisplay.secondary" class="event-schedule-secondary">{{ eventScheduleDisplay.secondary }}</span>
                  <!-- "Ended" pill — only on expired listings. Sits inline
                       with the date so the state is unmissable. -->
                  <span v-if="business?.status === 'expired'" class="event-ended-pill">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Ended
                  </span>
                </div>
              </div>

              <!-- Description — Spotlight + Signature only, full width so long text isn't clipped -->
              <div class="meta-block meta-block--full meta-block--text" v-if="isPaidTier && business?.description?.short">
                <span class="meta-label">Description</span>
                <span class="meta-value meta-value--wrap">{{ business.description.short }}</span>
              </div>

              <!-- Highlights — Signature only, full width -->
              <div class="meta-block meta-block--full" v-if="isSignature && business?.description?.highlights?.length">
                <span class="meta-label">Highlights</span>
                <div class="highlights-chips">
                  <span v-for="h in business.description.highlights" :key="h" class="highlight-chip">{{ h }}</span>
                </div>
              </div>

              <!-- Social links — Signature only, inline inside meta grid -->
              <div v-if="isSignature && hasSocialLinks" class="meta-block meta-block--full">
                <span class="meta-label">Find us on</span>
                <div class="meta-social-links">
                  <a v-if="business?.contact?.socialMedia?.instagram" :href="business.contact.socialMedia.instagram" target="_blank" class="meta-social-link instagram">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                    Instagram
                  </a>
                  <a v-if="business?.contact?.socialMedia?.facebook" :href="business.contact.socialMedia.facebook" target="_blank" class="meta-social-link facebook">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                  </a>
                  <a v-if="business?.contact?.socialMedia?.tripadvisor" :href="business.contact.socialMedia.tripadvisor" target="_blank" class="meta-social-link tripadvisor">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3"/><path d="M5 8c0 0-1-1 0-2s4-1 7-1 6 0 7 1 0 2 0 2"/></svg>
                    TripAdvisor
                  </a>
                  <a v-if="business?.contact?.socialMedia?.booking" :href="business.contact.socialMedia.booking" target="_blank" class="meta-social-link booking">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    Booking.com
                  </a>
                </div>
              </div>
            </div>

            <!-- Traveler match tags — all tiers (Verified: 1 each, Spotlight: 2, Signature: 3) -->
            <div class="match-tags-row" v-if="listingInterests.length || listingStyles.length">
              <div class="match-tags-group" v-if="listingInterests.length">
                <span class="match-tags-label">Interests</span>
                <div class="match-chips">
                  <span v-for="tag in listingInterests" :key="tag" class="match-chip interest-chip-view">{{ tag }}</span>
                </div>
              </div>
              <div class="match-tags-group" v-if="listingStyles.length">
                <span class="match-tags-label">Traveler style</span>
                <div class="match-chips">
                  <span v-for="tag in listingStyles" :key="tag" class="match-chip style-chip-view">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- Opening hours — Spotlight + Signature only.
                 Hidden for one-time events (their single time window lives in
                 the Event Schedule block above the listing card). For
                 recurring events the label flips to "Weekly Schedule" to
                 match the language in the edit form. -->
            <div v-if="isPaidTier && business?.openingHours?.days?.length && (!isEvent || business?.eventSchedule?.isRecurring)" class="hours-section">
              <div class="hours-label">{{ isEvent ? 'Weekly Schedule' : 'Opening hours' }}</div>
              <div class="hours-grid">
                <div v-for="day in business.openingHours.days" :key="day.day" class="hours-row" :class="{ today: isToday(day.day) }">
                  <span class="day-name">{{ capitalize(day.day) }}</span>
                  <span class="day-hours">
                    <template v-if="day.closed">Closed</template>
                    <template v-else-if="day.open === '00:00' && day.close === '23:59'">Open 24h</template>
                    <template v-else>{{ day.open }} – {{ day.close }}</template>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Upgrade prompt -->
          <div class="panel upgrade-panel" v-if="business?.partnership?.tier === 'verified'">
            <div class="upgrade-eyebrow">Unlock more visibility</div>
            <h2 class="upgrade-headline">Your listing competes — but not at full strength</h2>
            <p class="upgrade-body">Free listings are the first to lose their zone slot when a paid business enters. Upgrade to protect your position and appear in Nearby mode</p>
            <div class="upgrade-cards-row">
              <div class="upgrade-option">
                <div class="upgrade-tier-badge spotlight">Spotlight</div>
                <div class="upgrade-price spotlight">$29<span>/mo</span></div>
                <ul class="upgrade-features spotlight">
                  <li>Nearby mode visibility</li>
                  <li>Protected zone slot</li>
                  <li>Analytics dashboard</li>
                  <li>Up to 8 images</li>
                  <li>Business description</li>
                </ul>
                <button class="upgrade-cta spotlight-cta" @click="$router.push('/business/apply?tier=spotlight')">Upgrade to Spotlight</button>
              </div>
              <div class="upgrade-option featured">
                <div class="upgrade-tier-badge signature">Signature</div>
                <div class="upgrade-price">$49<span>/mo</span></div>
                <ul class="upgrade-features">
                  <li>Everything in Spotlight</li>
                  <li>Top-ranked in every search</li>
                  <li>Hidden Gem category access</li>
                  <li>Business highlights &amp; social links</li>
                  <li>Full conversion analytics</li>
                </ul>
                <button class="upgrade-cta signature-cta" @click="$router.push('/business/apply?tier=signature')">Upgrade to Signature</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== ANALYTICS TAB ==================== -->
        <div v-else-if="activeTab === 'analytics'" class="tab-content">

          <div v-if="business?.partnership?.tier === 'verified'">

            <!-- Unified verified analytics card -->
            <div class="verified-analytics-card">

              <!-- Top: views stat (the one free metric) -->
              <div class="verified-views-row">
                <div class="verified-views-stat">
                  <div class="teaser-eyebrow">This week</div>
                  <div class="teaser-big-number">{{ (analytics?.views != null) ? analytics.views : '0' }}</div>
                  <div class="teaser-big-label">travelers saw your listing</div>
                </div>
                <div class="verified-views-divider"></div>
                <div class="teaser-upgrade-block">
                  <div class="teaser-lock-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <strong>Full analytics on paid tiers</strong>
                  </div>
                  <p>Upgrade to unlock saves, clicks, weekly trends, and your performance score</p>
                  <button class="cta-btn small" style="align-self: flex-start" @click="$router.push('/business/apply?tier=spotlight')">Upgrade to See</button>
                </div>
              </div>            
            </div>
          </div>

          <template v-else-if="analytics">
            <div v-if="analytics.teaser" class="teaser-message">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ analytics.message }}
            </div>
            <div class="analytics-tiles">
              <!-- 1. Views -->
              <div class="analytics-tile">
                <div class="tile-icon views"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
                <div class="tile-value">{{ analytics.views ?? 0 }}</div>
                <div class="tile-label">Views</div>
              </div>
              <!-- 2. Clicks -->
              <div class="analytics-tile">
                <div class="tile-icon clicks"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 9l5 12 1.8-5.2L21 14z"/><path d="M7.2 2.2L8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/></svg></div>
                <div class="tile-value">{{ analytics.clicks ?? 0 }}</div>
                <div class="tile-label">Clicks</div>
              </div>
              <!-- 3. AI Ask -->
              <div class="analytics-tile">
                <div class="tile-icon ai-ask"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8"/><path d="M8 14h5"/></svg></div>
                <div class="tile-value">{{ analytics.aiAsk ?? 0 }}</div>
                <div class="tile-label">AI Ask</div>
              </div>
              <!-- 4. More Images -->
              <div class="analytics-tile">
                <div class="tile-icon more-images"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>
                <div class="tile-value">{{ analytics.moreImages ?? 0 }}</div>
                <div class="tile-label">More Images</div>
              </div>
              <!-- 5. Saves -->
              <div class="analytics-tile">
                <div class="tile-icon saves"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div>
                <div class="tile-value">{{ analytics.saves ?? 0 }}</div>
                <div class="tile-label">Saves</div>
              </div>
              <!-- 6. Shares -->
              <div class="analytics-tile">
                <div class="tile-icon shares"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 8 12 4 8 8"/><line x1="12" y1="4" x2="12" y2="16"/><path d="M20 21H4a2 2 0 0 1-2-2v-5"/><path d="M22 14v5a2 2 0 0 1-2 2"/></svg></div>
                <div class="tile-value">{{ analytics.shares ?? 0 }}</div>
                <div class="tile-label">Shares</div>
              </div>
              <!-- 7. Likes -->
              <div class="analytics-tile">
                <div class="tile-icon likes"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></div>
                <div class="tile-value">{{ analytics.likes ?? 0 }}</div>
                <div class="tile-label">Likes</div>
              </div>
              <!-- 8. Dislikes -->
              <div class="analytics-tile">
                <div class="tile-icon dislikes"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></div>
                <div class="tile-value">{{ analytics.dislikes ?? 0 }}</div>
                <div class="tile-label">Dislikes</div>
              </div>
            </div>

            <!-- Conversion breakdown (Signature only) -->
            <div class="panel" style="margin-top: 20px" v-if="isSignature">
              <div class="panel-head"><h2>Conversion actions</h2></div>
              <div class="conversion-breakdown">
                <!-- Directions -->
                <div class="conv-item">
                  <div class="conv-icon directions-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  </div>
                  <div class="conv-info">
                    <div class="conv-label">Directions</div>
                    <div class="conv-bar-wrap"><div class="conv-bar" :style="{ width: convPct(analytics.directionClicks, analytics) + '%' }"></div></div>
                  </div>
                  <div class="conv-count">{{ analytics.directionClicks ?? 0 }}</div>
                </div>
                <!-- Online Search -->
                <div class="conv-item">
                  <div class="conv-icon search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <div class="conv-info">
                    <div class="conv-label">Online Search</div>
                    <div class="conv-bar-wrap"><div class="conv-bar" :style="{ width: convPct(analytics.searchClicks, analytics) + '%' }"></div></div>
                  </div>
                  <div class="conv-count">{{ analytics.searchClicks ?? 0 }}</div>
                </div>
                <!-- Phone Call -->
                <div class="conv-item">
                  <div class="conv-icon phone-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l1.27-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.04z"/></svg>
                  </div>
                  <div class="conv-info">
                    <div class="conv-label">Phone Call</div>
                    <div class="conv-bar-wrap"><div class="conv-bar" :style="{ width: convPct(analytics.phoneClicks, analytics) + '%' }"></div></div>
                  </div>
                  <div class="conv-count">{{ analytics.phoneClicks ?? 0 }}</div>
                </div>
                <!-- Website — always shown; greyed if not added -->
                <div class="conv-item" :class="{ 'conv-item--disabled': !business?.contact?.website }">
                  <div class="conv-icon website-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div class="conv-info">
                    <div class="conv-label">
                      Website
                      <span v-if="!business?.contact?.website" class="conv-not-added">· Not added</span>
                    </div>
                    <div class="conv-bar-wrap">
                      <div v-if="business?.contact?.website" class="conv-bar" :style="{ width: convPct(analytics.websiteClicks, analytics) + '%' }"></div>
                      <div v-else class="conv-bar-empty"></div>
                    </div>
                  </div>
                  <div class="conv-count">{{ business?.contact?.website ? (analytics.websiteClicks ?? 0) : '' }}</div>
                </div>
                <!-- Instagram — always shown; greyed if not added -->
                <div class="conv-item" :class="{ 'conv-item--disabled': !business?.contact?.socialMedia?.instagram }">
                  <div class="conv-icon instagram-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                  </div>
                  <div class="conv-info">
                    <div class="conv-label">
                      Instagram
                      <span v-if="!business?.contact?.socialMedia?.instagram" class="conv-not-added">· Not added</span>
                    </div>
                    <div class="conv-bar-wrap">
                      <div v-if="business?.contact?.socialMedia?.instagram" class="conv-bar conv-bar--instagram" :style="{ width: convPct(analytics.instagramClicks, analytics) + '%' }"></div>
                      <div v-else class="conv-bar-empty"></div>
                    </div>
                  </div>
                  <div class="conv-count">{{ business?.contact?.socialMedia?.instagram ? (analytics.instagramClicks ?? 0) : '' }}</div>
                </div>
                <!-- Facebook — always shown; greyed if not added -->
                <div class="conv-item" :class="{ 'conv-item--disabled': !business?.contact?.socialMedia?.facebook }">
                  <div class="conv-icon facebook-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
                  <div class="conv-info">
                    <div class="conv-label">
                      Facebook
                      <span v-if="!business?.contact?.socialMedia?.facebook" class="conv-not-added">· Not added</span>
                    </div>
                    <div class="conv-bar-wrap">
                      <div v-if="business?.contact?.socialMedia?.facebook" class="conv-bar conv-bar--facebook" :style="{ width: convPct(analytics.facebookClicks, analytics) + '%' }"></div>
                      <div v-else class="conv-bar-empty"></div>
                    </div>
                  </div>
                  <div class="conv-count">{{ business?.contact?.socialMedia?.facebook ? (analytics.facebookClicks ?? 0) : '' }}</div>
                </div>
                <!-- TripAdvisor — always shown; greyed if not added -->
                <div class="conv-item" :class="{ 'conv-item--disabled': !business?.contact?.socialMedia?.tripadvisor }">
                  <div class="conv-icon tripadvisor-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3"/><path d="M5 8c0 0-1-1 0-2s4-1 7-1 6 0 7 1 0 2 0 2"/></svg>
                  </div>
                  <div class="conv-info">
                    <div class="conv-label">
                      TripAdvisor
                      <span v-if="!business?.contact?.socialMedia?.tripadvisor" class="conv-not-added">· Not added</span>
                    </div>
                    <div class="conv-bar-wrap">
                      <div v-if="business?.contact?.socialMedia?.tripadvisor" class="conv-bar conv-bar--tripadvisor" :style="{ width: convPct(analytics.tripadvisorClicks, analytics) + '%' }"></div>
                      <div v-else class="conv-bar-empty"></div>
                    </div>
                  </div>
                  <div class="conv-count">{{ business?.contact?.socialMedia?.tripadvisor ? (analytics.tripadvisorClicks ?? 0) : '' }}</div>
                </div>
              </div>
            </div>

            <div class="panel" style="margin-top: 20px">
              <div class="panel-head"><h2>Performance score</h2><span class="score-badge">{{ performanceScore ?? '—' }}/100</span></div>
              <div class="score-factors">
                <div class="score-factor">
                  <span class="sf-label">Recent activity (4-week avg)</span>
                  <div class="sf-bar-wrap"><div class="sf-bar accent" :style="{ width: scoreBreakdown.recentActivity + '%' }"></div></div>
                  <span class="sf-pct">30%</span>
                </div>
                <div class="score-factor">
                  <span class="sf-label">Engagement quality</span>
                  <div class="sf-bar-wrap"><div class="sf-bar" :style="{ width: scoreBreakdown.engagement + '%' }"></div></div>
                  <span class="sf-pct">25%</span>
                </div>
                <div class="score-factor">
                  <span class="sf-label">Conversion actions</span>
                  <div class="sf-bar-wrap"><div class="sf-bar" :style="{ width: scoreBreakdown.conversions + '%' }"></div></div>
                  <span class="sf-pct">30%</span>
                </div>
                <div class="score-factor">
                  <span class="sf-label">Profile completeness</span>
                  <div class="sf-bar-wrap"><div class="sf-bar" :style="{ width: scoreBreakdown.completeness + '%' }"></div></div>
                  <span class="sf-pct">15%</span>
                </div>
              </div>
              <p class="score-note">Score determines zone ranking. Lowest scorer is displaced first when a higher-tier business enters your zone</p>
            </div>

            <div class="panel" style="margin-top:20px" v-if="isSignature">
              <div class="panel-head"><h2>Revenue impact</h2></div>
              <div class="revenue-tiles">
                <div class="rev-tile">
                  <span class="rev-label">Est. revenue attributed</span>
                  <span class="rev-value">${{ analytics.revenue?.total ?? 0 }}</span>
                  <span v-if="!(analytics.revenue?.total)" class="rev-hint">Grows as users click your contact links</span>
                </div>
                <div class="rev-tile">
                  <span class="rev-label">Cross-business interactions</span>
                  <span class="rev-value">{{ analytics.crossInteractions ?? 0 }}</span>
                  <span v-if="!(analytics.crossInteractions)" class="rev-hint">Counts users who visited multiple listings in your zone</span>
                </div>
              </div>
            </div>

            <!-- ── Zone Intelligence Panel ─────────────────────────────────── -->
            <div class="panel zone-intel-panel" v-if="isSignature">
              <div class="panel-head">
                <h2>Zone Intelligence</h2>
              </div>

              <div v-if="zoneIntelLoading" class="zi-loading">
                <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                <span>Loading zone data…</span>
              </div>

              <div v-else-if="zoneIntelError" class="zi-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Zone data temporarily unavailable
              </div>

              <template v-else-if="zoneIntel">
                <!-- Row 1: Zone Rank + Traffic Share -->
                <div class="zi-top-row">
                  <div class="zi-rank-card">
                    <div class="zi-rank-podium">
                      <span class="zi-rank-number">#{{ zoneIntel.rank }}</span>
                      <span class="zi-rank-label">in your zone</span>
                    </div>
                    <div class="zi-podium-bars">
                      <div
                        v-for="pos in zoneIntel.totalInZone"
                        :key="pos"
                        class="zi-podium-bar"
                        :class="{ 'zi-podium-bar--you': pos === zoneIntel.rank }"
                        :style="{ height: podiumHeight(pos, zoneIntel.rank, zoneIntel.totalInZone) + 'px' }"
                      >
                        <span v-if="pos === zoneIntel.rank" class="zi-podium-you-label">You</span>
                      </div>
                    </div>
                    <div class="zi-rank-sub">of {{ zoneIntel.totalInZone }} listing{{ zoneIntel.totalInZone !== 1 ? 's' : '' }} in {{ zoneIntel.zoneCategory }}</div>
                  </div>

                  <div class="zi-share-card">
                    <div class="zi-share-label">Zone traffic captured</div>

                      <svg class="zi-donut" viewBox="0 0 80 80" width="105" height="105">
                        <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(212,175,55,0.12)" stroke-width="10"/>
                        <circle
                          cx="40" cy="40" r="35"
                          fill="none"
                          stroke="#D4AF37"
                          stroke-width="10"
                          stroke-linecap="round"
                          :stroke-dasharray="`${(zoneIntel.trafficShare / 100) * 188.5} 188.5`"
                          stroke-dashoffset="47.1"
                          transform="rotate(-90 40 40)"
                          class="zi-donut-arc"
                        />
                        <text x="40" y="38" text-anchor="middle" class="zi-donut-pct">{{ zoneIntel.trafficShare }}%</text>
                        <text x="40" y="52" text-anchor="middle" class="zi-donut-sub">share</text>
                      </svg>

                    <div class="zi-share-delta" :class="zoneIntel.trafficShareDelta > 0 ? 'zi-delta--up' : (zoneIntel.trafficShareDelta < 0 ? 'zi-delta--down' : 'zi-delta--flat')">
                      {{ Math.abs(zoneIntel.trafficShareDelta) }}pp vs last week
                    </div>
                  </div>
                </div>

                <!-- Row 2: Competitor Benchmarks -->
                <div class="zi-section" v-if="zoneIntel.competitors?.length">
                  <div class="zi-section-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/></svg>
                    Zone competitors
                  </div>
                  <div class="zi-competitors">
                    <div v-for="(comp, idx) in zoneIntel.competitors" :key="idx" class="zi-comp-card">
                      <!-- Card header: avatar, name + city, tier badge -->
                      <div class="zi-comp-header">
                        <div class="zi-comp-avatar" :class="`zi-comp-avatar--${comp.tier}`">
                          {{ comp.name ? comp.name.split(' ').slice(0,2).map(w => w[0]).join('') : '?' }}
                        </div>
                        <div class="zi-comp-name-block">
                          <span class="zi-comp-name">{{ comp.name || 'Competitor' }}</span>
                          <span v-if="comp.city" class="zi-comp-city">{{ comp.city }}</span>
                        </div>
                        <div class="zi-comp-tier" :class="`zi-comp-tier--${comp.tier}`">
                          <template v-if="comp.tier === 'signature'">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          </template>
                          <template v-else-if="comp.tier === 'spotlight'">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>
                          </template>
                          <template v-else>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </template>
                          <span>{{ capitalize(comp.tier) }}</span>
                        </div>
                      </div>

                      <!-- Metric bars -->
                      <div class="zi-comp-metrics">
                        <div class="zi-comp-metric-row">
                          <span class="zi-comp-metric-label">Performance</span>
                          <div class="zi-comp-bar-wrap">
                            <div class="zi-comp-bar-fill" :style="{ left: comp.scoreRange[0] + '%', width: (comp.scoreRange[1] - comp.scoreRange[0]) + '%' }"></div>
                            <div class="zi-your-needle" :style="{ left: Math.min(100, Math.max(0, zoneIntel.yourScore)) + '%' }" :title="'Your score: ' + zoneIntel.yourScore"></div>
                          </div>
                          <span class="zi-comp-range-label">{{ comp.scoreRange[0] }}–{{ comp.scoreRange[1] }}</span>
                        </div>
                        <div class="zi-comp-metric-row">
                          <span class="zi-comp-metric-label">Traffic share</span>
                          <div class="zi-comp-bar-wrap">
                            <div class="zi-comp-bar-fill zi-comp-bar-fill--traffic" :style="{ left: '0%', width: comp.trafficShareRange[1] + '%' }"></div>
                          </div>
                          <span class="zi-comp-range-label">{{ comp.trafficShareRange[0] }}–{{ comp.trafficShareRange[1] }}%</span>
                        </div>
                      </div>

                      <!-- Card footer: overlap pill + displacement note -->
                      <div class="zi-comp-footer">
                        <div class="zi-comp-overlap" :class="comp.interestOverlap >= 2 ? 'zi-overlap--warn' : 'zi-overlap--low'">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          {{ comp.interestOverlap }}/{{ comp.totalInterests }} interests shared
                        </div>
                        <span class="zi-comp-displacement">
                          <!-- signatureCount = # of signature competitors (excluding self).
                               +1 for self = total signatures in zone.
                               If total == 3: zone is full of signatures — lowest scorer across all 3 is displaced next.
                               If comp is signature but zone not yet at 3: they can displace lower tiers.
                               If comp is spotlight/verified: you outrank them and are safe. -->
                          <template v-if="comp.tier === 'signature' && (zoneIntel.signatureCount + 1) >= 3">
                            Zone full (3 Signatures) — lowest scorer may be displaced next
                          </template>
                          <template v-else-if="comp.tier === 'signature'">
                            Can displace lowest Verified or Spotlight in zone
                          </template>
                          <template v-else>Protected — you outrank {{ capitalize(comp.tier) }}</template>
                        </span>
                      </div>
                    </div>
                  </div>
                  <p class="zi-overlap-note" v-if="zoneIntel.competitors.some(c => c.interestOverlap >= 2)">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-top:2px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    High interest overlap means you're competing for the same traveler profiles. Consider adding a unique interest tag in your listing edit.
                  </p>
                </div>

                <!-- Row 3: Opportunity Windows -->
                <div class="zi-section" v-if="zoneIntel.opportunityDays?.length">
                  <div class="zi-section-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Opportunity windows
                  </div>
                  <div class="zi-opportunity-list">
                    <div v-for="opp in zoneIntel.opportunityDays" :key="opp.day" class="zi-opportunity-row">
                      <span class="zi-opp-day">{{ opp.day }}</span>
                      <div class="zi-opp-detail">
                        <span class="zi-opp-traffic">Zone traffic <strong>{{ opp.zoneTrafficIndex > 100 ? '+' : '' }}{{ opp.zoneTrafficIndex - 100 }}%</strong> above avg</span>
                        <span class="zi-opp-share">Your share: <strong>{{ opp.yourSharePct }}%</strong>
                          <span class="zi-opp-share-gap"> ({{ Math.round(100 / (zoneIntel.totalInZone || 1)) - opp.yourSharePct > 0 ? Math.round(100 / (zoneIntel.totalInZone || 1)) - opp.yourSharePct + '% below fair share' : 'above fair share' }})</span>
                        </span>
                      </div>
                      <div class="zi-opp-bar-wrap">
                        <div class="zi-opp-bar-fill" :style="{ width: opp.yourSharePct + '%' }"></div>
                        <div class="zi-opp-fair-line" :style="{ left: Math.round(100 / (zoneIntel.totalInZone || 1)) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                  <p class="zi-opp-tip">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Update your images or description before these days to capture more of the traffic spike.
                  </p>
                </div>

                <!-- Row 4: Zone Map -->
                <div class="zi-section">
                  <div class="zi-section-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                    Zone map
                  </div>
                  <div id="zone-intel-map" class="zi-map"></div>
                  <div class="zi-map-legend">
                    <span class="zi-legend-item"><span class="zi-legend-dot zi-legend-dot--you"></span> You</span>
                    <span class="zi-legend-item" v-for="comp in zoneIntel.competitors" :key="comp.name || comp.tier">
                      <span class="zi-legend-dot" :class="`zi-legend-dot--${comp.tier}`"></span>
                      {{ comp.name || capitalize(comp.tier) }} · {{ capitalize(comp.tier) }}
                    </span>
                  </div>
                </div>

                <!-- Row 5: Opportunity Window -->
                <div class="zi-section zi-opportunity-window">
                  <div class="zi-section-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Opportunity window
                  </div>

                  <!-- Zone slot status bar -->
                  <div class="zi-ow-slot-bar">
                    <div class="zi-ow-slot-label">
                      <span>Zone slots</span>
                      <span class="zi-ow-slot-count">{{ zoneIntel.totalInZone }}/3 filled</span>
                    </div>
                    <div class="zi-ow-slot-track">
                      <div
                        v-for="slot in 3"
                        :key="slot"
                        class="zi-ow-slot"
                        :class="{
                          'zi-ow-slot--you': slot === zoneIntel.rank,
                          'zi-ow-slot--taken': slot <= zoneIntel.totalInZone && slot !== zoneIntel.rank,
                          'zi-ow-slot--open': slot > zoneIntel.totalInZone
                        }"
                      >
                        <span v-if="slot === zoneIntel.rank" class="zi-ow-slot-you-tag">You</span>
                      </div>
                    </div>
                    <p class="zi-ow-slot-hint" v-if="zoneIntel.totalInZone < 3">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {{ 3 - zoneIntel.totalInZone }} slot{{ 3 - zoneIntel.totalInZone !== 1 ? 's' : '' }} open — a new Signature could still enter your zone
                    </p>
                    <!-- Zone full AND all 3 are Signatures: incoming Signatures hit the waitlist -->
                    <p class="zi-ow-slot-hint zi-ow-slot-hint--safe" v-else-if="(zoneIntel.signatureCount + 1) >= 3">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      Zone is full (3 Signatures). Incoming Signatures join the waitlist.
                    </p>
                    <!-- Zone full but mixed tiers: a new Signature would displace, not waitlist -->
                    <p class="zi-ow-slot-hint" v-else>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Zone is full but not all Signatures — a new Signature would displace the lowest Verified or Spotlight first.
                    </p>
                  </div>

                  <!-- Displacement risk card

                       Risk model (matches resolveZoneEntry in businessRoutes.js):
                       - Displacement is RELATIVE, not absolute. The lowest performer in the
                         affected tier-pool gets displaced — there is no "safe score" cutoff.
                       - A Signature is only at risk when the zone is full of 3 Signatures
                         AND this listing is the lowest-scoring of the three. In every other
                         configuration (mixed tiers, zone not full, ranked above the floor),
                         a Signature is structurally safe.

                       isLowestSignature is computed server-side against raw scores because
                       competitor scoreRange is fuzzed ±8 and the client can't decide reliably. -->
                  <div class="zi-ow-risk-card" v-if="zoneIntel.rank && zoneIntel.yourScore !== undefined">
                    <div class="zi-ow-risk-header">
                      <div class="zi-ow-risk-icon" :class="zoneIntel.isLowestSignature ? 'zi-ow-risk-icon--warn' : 'zi-ow-risk-icon--safe'">
                        <svg v-if="!zoneIntel.isLowestSignature" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <div class="zi-ow-risk-body">
                        <strong v-if="!zoneIntel.isLowestSignature">Protected position</strong>
                        <strong v-else>Displacement risk</strong>

                        <!-- CASE 1: Genuinely at risk — lowest of 3 Signatures in a full zone -->
                        <p v-if="zoneIntel.isLowestSignature">
                          You're the lowest-scoring Signature in a full Signature zone — score
                          <span class="zi-ow-score-highlight zi-ow-score-highlight--warn">{{ zoneIntel.yourScore }}</span>.
                          If a waitlisted Signature renews ahead of you, your slot is the first to go. Raise your performance score to move out of last place.
                        </p>

                        <!-- CASE 2: Rank 1 in the zone overall — fully safe -->
                        <p v-else-if="zoneIntel.rank === 1">
                          You're ranked
                          <span class="zi-ow-score-highlight">#1</span>
                          in your zone (score {{ zoneIntel.yourScore }}). Signatures are only displaced when the zone is full of 3 Signatures and this listing is the lowest of them — neither applies to you.
                        </p>

                        <!-- CASE 3: Zone not yet at 3 Signatures — a new Signature would displace lower tiers, not you -->
                        <p v-else-if="(zoneIntel.signatureCount + 1) < 3">
                          Score
                          <span class="zi-ow-score-highlight">{{ zoneIntel.yourScore }}</span>
                          — your zone has fewer than 3 Signatures, so any new Signature would displace the lowest Verified or Spotlight first. Your slot is structurally protected.
                        </p>

                        <!-- CASE 4: Full Signature zone but you're not last (rank 1 or 2 of 3 Signatures) -->
                        <p v-else>
                          Score
                          <span class="zi-ow-score-highlight">{{ zoneIntel.yourScore }}</span>
                          — you're Signature
                          <span class="zi-ow-score-highlight">#{{ zoneIntel.signatureRank }}</span>
                          of {{ zoneIntel.totalSignatures }} in this zone. Only the lowest-scoring Signature is displaced when capacity changes, so you're safe as long as you stay above the floor.
                        </p>
                      </div>
                    </div>

                    <!-- Score tips
                         Mirrors buildScoreBreakdown() in businessRoutes.js — the function that
                         actually computes the score the user sees here. Pillars and weights:
                           Recent Activity     30% — last-4-week views, benchmark 100/wk
                           Engagement Quality  25% — saves×3, aiAsk×2, moreImages×1, benchmark 300
                           Conversion Actions  30% — directions/phone/website/search/IG/FB/TA, benchmark 150
                           Profile Completeness 15% — 5 groups × 20 pts (description, detailed, ≥3 images, contact, ≥2 highlights)
                         TODO: plan.txt lists 30/40/25/5 — code uses 30/25/30/15. Reconcile docs with code (or vice versa). -->
                    <div class="zi-ow-tips" v-if="zoneIntel.yourScore < 75">
                      <div class="zi-ow-tips-title">Boost your score</div>

                      <!-- Highest leverage when incomplete: Profile Completeness pillar (15%) is binary-ish — large jumps per group filled -->
                      <div class="zi-ow-tip-row" v-if="(zoneIntel.profileCompleteness ?? 0) < 100">
                        <div class="zi-ow-tip-dot zi-ow-tip-dot--amber"></div>
                        <span>Complete your profile — short description, detailed description, 3+ images, contact info, and 2+ highlights each unlock a full pillar group (15% pillar)</span>
                      </div>

                      <!-- Recent Activity (30%) — driven by views in the last 4 weeks -->
                      <div class="zi-ow-tip-row">
                        <div class="zi-ow-tip-dot zi-ow-tip-dot--green"></div>
                        <span>Recent views over the last 4 weeks are your single largest pillar (30%) — keep your listing surfacing in fresh searches</span>
                      </div>

                      <!-- Conversion Actions (30%) — list the actually-counted actions, not the wrong ones -->
                      <div class="zi-ow-tip-row">
                        <div class="zi-ow-tip-dot zi-ow-tip-dot--blue"></div>
                        <span>Directions, phone taps, website visits, and social link clicks (Instagram, Facebook, TripAdvisor) all feed the conversion pillar (30%)</span>
                      </div>

                      <!-- Engagement Quality (25%) — saves are weighted 3x, with the right ranking -->
                      <div class="zi-ow-tip-row">
                        <div class="zi-ow-tip-dot zi-ow-tip-dot--blue"></div>
                        <span>Saves count 3× as much as Ask-AI taps and 3× as much as image opens in the engagement pillar (25%) — getting saved is the highest-leverage action a user can take</span>
                      </div>
                    </div>
                  </div>

                  <!-- Waitlist status (if zone is full of Signatures) -->
                  <div class="zi-ow-waitlist" v-if="zoneIntel.waitlistCount > 0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div>
                      <strong>{{ zoneIntel.waitlistCount }} business{{ zoneIntel.waitlistCount !== 1 ? 'es' : '' }} waiting</strong> for a slot in your zone.
                      <span v-if="zoneIntel.earliestExpiry"> Earliest current slot expires {{ zoneIntel.earliestExpiry }}.</span>
                      Maintain renewals to hold your position — if you don't renew, the next waitlisted business takes your slot.
                    </div>
                  </div>

                  <!-- Event time-window note (if category is events) -->
                  <div class="zi-ow-event-note" v-if="zoneIntel.zoneCategory?.toLowerCase() === 'events'">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <div>
                      <strong>Event zone rules</strong> — Events compete by time window, not geography. Two events in the same 300m zone can coexist if their date ranges don't overlap. Recurring events are treated as always-on.
                      <span v-if="zoneIntel.eventConflicts > 0" class="zi-ow-event-conflict"> {{ zoneIntel.eventConflicts }} overlapping event{{ zoneIntel.eventConflicts !== 1 ? 's' : '' }} detected in your window.</span>
                    </div>
                  </div>

                  <!-- Discovery vs Nearby mode summary -->
                  <div class="zi-ow-modes">
                    <div class="zi-ow-mode-pill zi-ow-mode-pill--active">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Discovery mode
                    </div>
                    <div class="zi-ow-mode-pill zi-ow-mode-pill--active">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Nearby mode
                    </div>
                    <span class="zi-ow-mode-note">Signature is visible in both discovery and nearby modes — ranked #{{ zoneIntel.rank }} in your zone</span>
                  </div>
                </div>
              </template>
            </div>
            <!-- ── END Zone Intelligence Panel ──────────────────────────────── -->

          </template>

          <div v-else class="empty-analytics">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <p>Analytics will appear once your listing is live and receiving traffic</p>
          </div>
        </div>

        <!-- ==================== EDIT TAB ==================== -->
        <div v-else-if="activeTab === 'edit'" class="tab-content edit-tab-content">

          <!-- Permanent rejection: no edit, no resubmit. Show the reviewer note
               (if any) and point the owner at support. Takes precedence over
               the generic "upgrade to edit" locked panel. -->
          <div v-if="isHardRejected" class="panel locked-panel locked-panel--permanent">
            <div class="locked-body">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <h3>This listing has been permanently declined</h3>
              <p v-if="business?.verification?.staffNotes" class="rejection-reason">
                <em>Reviewer note:</em> {{ business.verification.staffNotes }}
              </p>
              <p>It can no longer be edited or resubmitted. If you believe this was a mistake, please contact our support team.</p>
            </div>
          </div>

          <div v-else-if="!canEdit" class="panel locked-panel">
            <div class="locked-body">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <h3>Editing requires Spotlight or Signature</h3>
              <p>Verified listings are reviewed by Jinni staff and cannot be self-edited. Upgrade to take full control of your listing</p>
              <button class="cta-btn" @click="$router.push('/business/apply?tier=spotlight')">Upgrade to edit</button>
            </div>
          </div>

          <form v-else class="edit-onboarding-form" @submit.prevent="saveEdits">
            <!-- ── Expired-event notice ──
                 Shown when the listing's status is 'expired'. Tells the owner
                 (a) their event is no longer shown to travelers, and (b) what
                 will happen when they save: status returns to pending and
                 staff re-reviews. Doesn't block editing — full edit is
                 allowed per product decision. -->
            <div v-if="business?.status === 'expired'" class="expired-edit-notice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="9" y1="15" x2="15" y2="21"/>
                <line x1="15" y1="15" x2="9" y2="21"/>
              </svg>
              <div>
                <strong>This event has ended.</strong>
                Update the Event Schedule below with a new date to bring it back. Any change you save here will return the listing to <em>pending</em> review — our team will check it again before it goes live.
              </div>
            </div>
            <!-- ── Rejected-listing notice ──
                 Shown when status is 'rejected'. Explains what the reviewer
                 said and what will happen on save: the listing returns to
                 pending. For rejected Verified listings it also notes the
                 limited field set the free tier can edit. -->
            <div v-if="business?.status === 'rejected'" class="rejected-edit-notice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <strong>Your application was not approved.</strong>
                <p v-if="business?.verification?.staffNotes" class="rejection-reason">
                  <em>Reviewer note:</em> {{ business.verification.staffNotes }}
                </p>
                <p v-else>Update the information below and resave. Any change you save will return the listing to <em>pending</em> review — our team will check it again.</p>
                <p v-if="isRejectedVerifiedEdit" class="rejection-scope-note">
                  Because you're on the Verified (free) tier, you can update your business name, description, address, phone, website, and category. Other fields (images, opening hours, social media, highlights) are reserved for paid tiers.
                </p>
              </div>
            </div>
            <!-- ── Section 1: Images ── -->
            <div class="preference-section active" v-if="!isRejectedVerifiedEdit">
              <div class="card">
                <div class="section-header">
                  <h3>Images <span class="section-sub-count">Up to 8</span></h3>
                  <p class="section-description">
                    <template v-if="isSignature">Add image URLs or upload photos directly (JPG, PNG, WEBP, GIF, AVIF — max 5MB each)</template>
                    <template v-else>Paste image URLs for your listing (must start with https://)</template>
                  </p>
                  <template v-for="(img, i) in editForm.images" :key="'img-err-'+i">
                    <span v-if="editErrors[`image_${i}`]" class="field-error" style="display:block;margin-top:4px">Image {{ i+1 }}: {{ editErrors[`image_${i}`] }}</span>
                  </template>
                  <span v-if="editErrors.images" class="field-error">{{ editErrors.images }}</span>
                </div>
                <div class="image-edit-grid">
                  <div v-for="(img, i) in editForm.images" :key="i" class="image-edit-slot" :class="{ 'image-edit-slot-error': editErrors[`image_${i}`] }">
                    <div class="image-edit-preview" v-if="img">
                      <img :src="img" @error="$event.target.style.opacity=0" />
                      <button type="button" class="remove-img-btn" @click="editForm.images[i] = ''; delete editErrors[`image_${i}`]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                    <div class="image-edit-empty" v-else>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <input type="text" :placeholder="'Image ' + (i+1) + ' URL'" v-model="editForm.images[i]" class="img-url-input" @blur="validateEditImageUrl(i)" @input="delete editErrors[`image_${i}`]" />
                      <label v-if="isSignature" class="upload-label">
                        or upload
                        <input type="file" accept="image/*" @change="e => handleUpload(e, i)" hidden />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- ── Sections 2, 3a, 3b: Business Info + Contact + Social (unified card) ── -->
            <div class="preference-section active">
              <div class="card">

                <!-- Sub-section: Business Information -->
                <div class="section-header">
                  <h3>Business Information, Social &amp; Booking Links</h3>
                  <p class="section-description">Your business name and public description</p>
                </div>
                <div class="edit-fields-grid">
                  <div class="edit-field">
                    <label class="edit-label">Business name</label>
                    <input class="edit-input" :class="{ 'edit-input-error': editErrors.name }" type="text" v-model="editForm.name" maxlength="34" placeholder="Your business name" @input="delete editErrors.name" />
                    <span v-if="editErrors.name" class="field-error">{{ editErrors.name }}</span>
                  </div>
                  <div class="edit-fields-grid">
                    <div class="edit-field edit-field-full">
                      <label class="edit-label">Website</label>
                      <input class="edit-input" :class="{ 'edit-input-error': editErrors.website }" type="text" v-model="editForm.website" placeholder="https://yourbusiness.com" @input="delete editErrors.website" />
                      <span v-if="editErrors.website" class="field-error">{{ editErrors.website }}</span>
                    </div>
                  </div>
                  <div class="edit-field edit-field-full">
                    <label class="edit-label">
                      Description <span v-if="isSignature" class="required"></span>
                      <span class="edit-char-count">{{ (editForm.description || '').length }}/{{ isSignature ? 600 : 300 }}</span>
                    </label>
                    <textarea class="edit-input edit-textarea"
                      :class="{ 'edit-input-error': editErrors.description }"
                      v-model="editForm.description"
                      :maxlength="isSignature ? 600 : 300"
                      :rows="isSignature ? 4 : 3"
                      :placeholder="isSignature ? 'Tell what makes your place special...' : 'A short description visible on your listing…'"
                      style="resize: none; overflow-y: auto;"
                      @input="delete editErrors.description"></textarea>
                    <span v-if="editErrors.description" class="field-error">{{ editErrors.description }}</span>
                  </div>
                  <div class="edit-field">
                    <label class="edit-label">Phone</label>
                    <div class="edit-input-prefix-wrap" :class="{ 'edit-input-prefix-error': editErrors.phone }">
                      <span class="edit-input-prefix">+</span>
                      <input class="edit-input edit-input-inner" type="text" inputmode="numeric" v-model="editForm.phone" placeholder="1 555 000 0000" maxlength="20" @input="editForm.phone = $event.target.value.replace(/[^0-9\s]/g, ''); delete editErrors.phone" />
                    </div>
                    <span v-if="editErrors.phone" class="field-error">{{ editErrors.phone }}</span>
                  </div>
                  <div class="edit-field">
                    <label class="edit-label">Email</label>
                    <div class="edit-readonly-field">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <span class="edit-readonly-value">{{ currentUserEmail || '—' }}</span>
                    </div>
                    <span class="edit-readonly-hint">To change your email, update it in account settings</span>
                  </div>
                </div>

                <!-- Sub-section: Social & Booking Links -->
                <div class="section-header" style="margin-top: 4px;" :class="{ 'locked-section': !isSignature, 'position-relative': !isSignature }">
                  <p class="section-description">Connect your Social &amp; Booking Links to your listing</p>
                </div>
                <div style="position: relative;">
                  <div v-if="!isSignature" class="locked-overlay">
                    <div class="locked-message">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Available on Signature
                    </div>
                  </div>
                  <div class="edit-fields-grid" :class="{ 'dimmed': !isSignature }">
                    <div class="edit-field">
                      <label class="edit-label">Instagram</label>
                      <div class="edit-input-prefix-wrap" :class="{ 'edit-input-prefix-error': editErrors.instagram }">
                        <span class="edit-input-prefix">@</span>
                        <input class="edit-input edit-input-inner" type="text" v-model="editForm.social.instagram" placeholder="yourbusiness" :disabled="!isSignature" @input="delete editErrors.instagram" />
                      </div>
                      <span v-if="editErrors.instagram" class="field-error">{{ editErrors.instagram }}</span>
                    </div>
                    <div class="edit-field">
                      <label class="edit-label">Facebook</label>
                      <div class="edit-input-prefix-wrap" :class="{ 'edit-input-prefix-error': editErrors.facebook }">
                        <span class="edit-input-prefix">@</span>
                        <input class="edit-input edit-input-inner" type="text" v-model="editForm.social.facebook" placeholder="yourbusiness" :disabled="!isSignature" @input="delete editErrors.facebook" />
                      </div>
                      <span v-if="editErrors.facebook" class="field-error">{{ editErrors.facebook }}</span>
                    </div>
                    <div class="edit-field">
                      <label class="edit-label">TripAdvisor</label>
                      <input class="edit-input" :class="{ 'edit-input-error': editErrors.tripadvisor }" type="text" v-model="editForm.social.tripadvisor" placeholder="https://tripadvisor.com/…" :disabled="!isSignature" @input="delete editErrors.tripadvisor" />
                      <span v-if="editErrors.tripadvisor" class="field-error">{{ editErrors.tripadvisor }}</span>
                    </div>
                    <div class="edit-field">
                      <label class="edit-label">Booking.com</label>
                      <input class="edit-input" :class="{ 'edit-input-error': editErrors.booking }" type="text" v-model="editForm.social.booking" placeholder="https://booking.com/…" :disabled="!isSignature" @input="delete editErrors.booking" />
                      <span v-if="editErrors.booking" class="field-error">{{ editErrors.booking }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ── Sections 4 & 5: Traveler Interests + Styles (unified card) ── -->
            <div class="preference-section active" v-if="!isRejectedVerifiedEdit">
              <div class="card">
                <div class="section-header" style="margin-bottom:12px">
                  <h3>Matching Traveler Interests & Styles</h3>
                  <p class="section-description">Select up to {{ isSignature ? 3 : 2 }} interests — these match your listing to the right travelers</p>
                  <span v-if="editErrors.interests" class="field-error">{{ editErrors.interests }}</span>
                </div>
                <div class="type-grid" style="margin-bottom:24px">
                  <div v-for="item in travelerInterestOptions" :key="item.key"
                    class="type-chip"
                    :class="{
                      selected: editForm.interests.includes(item.key),
                      disabled: !editForm.interests.includes(item.key) && editForm.interests.length >= (isSignature ? 3 : 2)
                    }"
                    @click="toggleEditInterest(item.key); delete editErrors.interests">
                    {{ item.label }}
                  </div>
                </div>

                <div class="section-header" style="margin-bottom:12px; margin-top:20px">
                  <p class="section-description">Select up to {{ isSignature ? 3 : 2 }} styles to refine who you attract</p>
                  <span v-if="editErrors.styles" class="field-error">{{ editErrors.styles }}</span>
                </div>
                <div class="type-grid">
                  <div v-for="item in travelerStyleOptions" :key="item.key"
                    class="type-chip"
                    :class="{
                      selected: editForm.styles.includes(item.key),
                      disabled: !editForm.styles.includes(item.key) && editForm.styles.length >= (isSignature ? 3 : 2)
                    }"
                    @click="toggleEditStyle(item.key); delete editErrors.styles">
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Section 5.5: Event Schedule (events only) ── -->
            <!-- Mirrors the event-schedule block in BusinessOnboarding.vue. Only
                 shown when this listing's primary category is 'events'. Owners
                 can change start/end date, optional times, and toggle weekly
                 recurrence. Recurrence drives whether the Weekly Schedule
                 section below is shown. -->
            <div class="preference-section active" v-if="isEvent">
              <div class="card">
                <div class="section-header">
                  <h3>Event Schedule</h3>
                  <p class="section-description">
                    Leave times empty if your event runs all day. Set an end date if it spans multiple days.
                  </p>
                </div>
                <!-- Timezone notice — event times are in the venue's local
                     zone (set from the address). Read-only here: the owner
                     changes it by changing the address, not by editing it. -->
                <p class="event-tz-note" v-if="editForm.eventTimezone && !editForm.eventRecurring">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                  <span>Times are in your event's local timezone: <strong>{{ editForm.eventTimezone.replace(/_/g, ' ') }}</strong></span>
                </p>
                <!-- Start block: date + time side by side -->
                <div class="event-datetime-block">
                  <div class="event-datetime-label">Start</div>
                  <div class="event-datetime-row">
                    <div class="event-datetime-field">
                      <label>Date <span class="required">*</span></label>
                      <input type="date"
                        v-model="editForm.eventStartDate"
                        class="event-datetime-input"
                        :class="{ 'error': editErrors.eventStartDate }"
                        @change="delete editErrors.eventStartDate" />
                    </div>
                    <div class="event-datetime-field">
                      <label>Time <span class="optional-tag">optional</span></label>
                      <input type="time"
                        v-model="editForm.eventStartTime"
                        class="event-datetime-input"
                        :class="{ 'error': editErrors.eventStartTime }"
                        @change="delete editErrors.eventStartTime" />
                    </div>
                  </div>
                  <span v-if="editErrors.eventStartDate" class="field-error">{{ editErrors.eventStartDate }}</span>
                  <span v-if="editErrors.eventStartTime" class="field-error">{{ editErrors.eventStartTime }}</span>
                </div>
                <!-- End block: date + time side by side, both optional -->
                <div class="event-datetime-block">
                  <div class="event-datetime-label">End <span class="optional-tag">optional</span></div>
                  <div class="event-datetime-row">
                    <div class="event-datetime-field">
                      <label>Date</label>
                      <input type="date"
                        v-model="editForm.eventEndDate"
                        :min="editForm.eventStartDate || ''"
                        class="event-datetime-input"
                        :class="{ 'error': editErrors.eventEndDate }"
                        @change="delete editErrors.eventEndDate" />
                    </div>
                    <div class="event-datetime-field">
                      <label>Time</label>
                      <input type="time"
                        v-model="editForm.eventEndTime"
                        class="event-datetime-input"
                        :class="{ 'error': editErrors.eventEndTime }"
                        @change="delete editErrors.eventEndTime" />
                    </div>
                  </div>
                  <span v-if="editErrors.eventEndDate" class="field-error">{{ editErrors.eventEndDate }}</span>
                  <span v-if="editErrors.eventEndTime" class="field-error">{{ editErrors.eventEndTime }}</span>
                </div>
                <!-- Recurring weekly toggle — secondary to date/time above.
                     Toggling this also shows/hides the Weekly Schedule section.
                     When unchecking (going recurring → one-time), the weekly
                     grid below disappears; we don't clear its values though,
                     so re-enabling recurrence restores the previous selections. -->
                <label class="event-repeat-check">
                  <input type="checkbox" v-model="editForm.eventRecurring" />
                  <span class="event-repeat-check-box">
                    <svg v-if="editForm.eventRecurring" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <span class="event-repeat-check-text">
                    This event repeats weekly
                    <span class="event-repeat-check-hint">e.g. every Friday night, every Sunday market</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- ── Section 6: Opening hours / Weekly schedule ──
                 Hidden for one-time events (they have a single time window in
                 the Event Schedule section above). For recurring events the
                 heading flips to "Weekly Schedule" to match the onboarding
                 language. -->
            <div class="preference-section active" v-if="(!isEvent || editForm.eventRecurring) && !isRejectedVerifiedEdit">
              <div class="card">
                <div class="section-header">
                  <h3>{{ isEvent ? 'Weekly Schedule' : 'Opening Hours' }}</h3>
                  <p class="section-description">
                    <template v-if="isEvent">Mark the days your recurring event runs and the times for each.</template>
                    <template v-else>Let travelers know when you're open</template>
                  </p>
                  <span v-if="editErrors.openingHours" class="field-error">{{ editErrors.openingHours }}</span>
                </div>
                <div class="hours-chips">
                  <div v-for="(dayEntry, idx) in editForm.openingHours" :key="dayEntry.day"
                    class="hours-chip"
                    :class="{
                      'hours-chip--active': editHoursDay === dayEntry.day,
                      'hours-chip--closed': dayEntry.closed,
                      'hours-chip--error': editErrors[`hours_${idx}`]
                    }"
                    @click="editHoursDay = editHoursDay === dayEntry.day ? null : dayEntry.day">
                    <span class="hours-chip-day">{{ dayEntry.day.slice(0, 3) }}</span>
                    <span class="hours-chip-time">{{ hoursDisplayEdit(dayEntry) }}</span>
                  </div>
                </div>
                <transition name="hours-panel">
                  <div v-if="editHoursDay" class="hours-edit-panel">
                    <template v-for="(dayEntry, idx) in editForm.openingHours" :key="dayEntry.day">
                      <div v-if="dayEntry.day === editHoursDay" class="hours-panel-inner">
                        <div class="hours-panel-header">
                          <div class="hours-panel-title">{{ capitalize(dayEntry.day) }}</div>
                          <div class="hours-status-pills">
                            <button type="button" class="hours-pill"
                              :class="{ 'hours-pill--active': !dayEntry.closed }"
                              @click="dayEntry.closed = false; delete editErrors.openingHours">Open</button>
                            <button type="button" class="hours-pill hours-pill--close"
                              :class="{ 'hours-pill--active': dayEntry.closed }"
                              @click="dayEntry.closed = true; editSnapshotCurrentDay(dayEntry); editHoursDay = null; delete editErrors[`hours_${idx}`]">Closed</button>
                          </div>
                        </div>
                        <div class="hours-time-row" v-if="!dayEntry.closed">
                          <div class="hours-time-block">
                            <label class="hours-time-label">Opens</label>
                            <input type="time" v-model="dayEntry.open" class="hours-time-input"
                              :class="{ 'error': editErrors[`hours_${idx}`] }"
                              @change="delete editErrors[`hours_${idx}`]" />
                          </div>
                          <div class="hours-time-block">
                            <label class="hours-time-label">Closes</label>
                            <input type="time" v-model="dayEntry.close" class="hours-time-input"
                              :class="{ 'error': editErrors[`hours_${idx}`] }"
                              @change="delete editErrors[`hours_${idx}`]; if (dayEntry.open && dayEntry.close) { editSnapshotCurrentDay(dayEntry); editHoursDay = null }" />
                          </div>
                        </div>
                        <span v-if="editErrors[`hours_${idx}`]" class="field-error" style="margin-top:4px;display:block">{{ editErrors[`hours_${idx}`] }}</span>
                        <button type="button" class="hours-last-btn"
                          v-if="!dayEntry.closed && editHoursLastUsed && !(dayEntry.open === editHoursLastUsed.open && dayEntry.close === editHoursLastUsed.close)"
                          @click="dayEntry.open = editHoursLastUsed.open; dayEntry.close = editHoursLastUsed.close; dayEntry.closed = false; editSnapshotCurrentDay(dayEntry); editHoursDay = null; delete editErrors[`hours_${idx}`]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/></svg>
                          Use {{ editHoursLastUsed.open }} – {{ editHoursLastUsed.close }}
                        </button>
                      </div>
                    </template>
                  </div>
                </transition>
              </div>
            </div>

            <!-- ── Section 7: Pricing ── -->
            <div class="preference-section active" v-if="!isRejectedVerifiedEdit">
              <div class="card">
                <div class="section-header">
                  <h3>Pricing</h3>
                  <p class="section-description">Help travelers understand your price range</p>
                </div>
                <div class="edit-fields-grid">
                  <!-- Price mode chips — pill style matching onboarding -->
                  <div class="edit-field edit-field-full">
                    <label class="edit-label">Price Mode</label>
                    <div class="edit-price-mode-chips">
                      <div class="edit-price-chip" :class="{ 'selected': editForm.priceMode === 'free' }"
                        @click="editForm.priceMode = 'free'; editForm.priceMedium = ''; editForm.priceMin = null; editForm.priceMax = null; delete editErrors.pricing">Free</div>
                      <div class="edit-price-chip" :class="{ 'selected': editForm.priceMode === 'average' }"
                        @click="editForm.priceMode = 'average'; delete editErrors.pricing">Average</div>
                      <div class="edit-price-chip" :class="{ 'selected': editForm.priceMode === 'range' }"
                        @click="editForm.priceMode = 'range'; editForm.priceMedium = ''; delete editErrors.pricing">Min &amp; Max</div>
                    </div>
                    <span v-if="editErrors.pricing" class="field-error">{{ editErrors.pricing }}</span>
                  </div>
                  <!-- Currency chips — pill style -->
                  <div class="edit-field edit-field-full" v-if="editForm.priceMode !== 'free'">
                    <label class="edit-label">Currency</label>
                    <div class="edit-price-mode-chips">
                      <div v-for="cur in ['USD','EUR','GBP', 'RUB','AED']" :key="cur"
                        class="edit-price-chip"
                        :class="{ selected: editForm.priceCurrency === cur }"
                        @click="editForm.priceCurrency = cur">{{ cur }}</div>
                    </div>
                  </div>
                  <!-- Average price -->
                  <div class="edit-field" v-if="editForm.priceMode === 'average'">
                    <label class="edit-label">Average price per person</label>
                    <div class="edit-input-prefix-wrap" :class="{ 'edit-input-prefix-error': editErrors.priceMedium }">
                      <span class="edit-input-prefix">Avg</span>
                      <input class="edit-input edit-input-inner" type="text" inputmode="numeric" v-model="editForm.priceMedium" placeholder="e.g. 25" @input="editForm.priceMedium = $event.target.value.replace(/[^0-9]/g, ''); delete editErrors.priceMedium; delete editErrors.pricing" />
                      <span class="edit-input-suffix">{{ editForm.priceCurrency }}</span>
                    </div>
                    <span v-if="editErrors.priceMedium" class="field-error">{{ editErrors.priceMedium }}</span>
                  </div>
                  <!-- Min / Max range -->
                  <div class="edit-field edit-field-full" v-if="editForm.priceMode === 'range'">
                    <label class="edit-label">Price range per person</label>
                    <div class="edit-price-minmax">
                      <div class="edit-input-prefix-wrap" :class="{ 'edit-input-prefix-error': editErrors.priceMin }">
                        <span class="edit-input-prefix">From</span>
                        <input class="edit-input edit-input-inner" type="text" inputmode="numeric" v-model="editForm.priceMin" placeholder="e.g. 10" @input="editForm.priceMin = $event.target.value.replace(/[^0-9]/g, ''); delete editErrors.priceMin; delete editErrors.pricing" />
                        <span class="edit-input-suffix">{{ editForm.priceCurrency }}</span>
                      </div>
                      <span class="edit-price-dash">—</span>
                      <div class="edit-input-prefix-wrap" :class="{ 'edit-input-prefix-error': editErrors.priceMax }">
                        <span class="edit-input-prefix">To</span>
                        <input class="edit-input edit-input-inner" type="text" inputmode="numeric" v-model="editForm.priceMax" placeholder="e.g. 60" @input="editForm.priceMax = $event.target.value.replace(/[^0-9]/g, ''); delete editErrors.priceMax; delete editErrors.pricing" />
                        <span class="edit-input-suffix">{{ editForm.priceCurrency }}</span>
                      </div>
                    </div>
                    <span v-if="editErrors.priceMin" class="field-error">{{ editErrors.priceMin }}</span>
                    <span v-if="editErrors.priceMax" class="field-error">{{ editErrors.priceMax }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Section 8: Highlights (Signature only — shown with lock for others) ── -->
            <div class="preference-section active" v-if="!isRejectedVerifiedEdit">
              <div class="card" :class="{ 'locked-section': !isSignature }">
                <div class="section-header">
                  <h3>Highlights <span class="section-sub-count">Up to 5</span></h3>
                  <p class="section-description">Short phrases that make your listing stand out in search results</p>
                </div>
                <!-- Locked overlay for non-signature -->
                <div v-if="!isSignature" class="locked-overlay">
                  <div class="locked-message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Available on Signature
                  </div>
                </div>
                <div class="highlights-list" :class="{ 'dimmed': !isSignature }">
                  <div v-for="(h, i) in editForm.highlights" :key="i" class="highlight-row">
                    <input type="text" v-model="editForm.highlights[i]"
                      :placeholder="`e.g. ${highlightPlaceholders[i] || 'Add a highlight...'}`"
                      maxlength="25"
                      :disabled="!isSignature"
                      :class="{ 'error': editErrors[`highlight_${i}`] }"
                      @input="delete editErrors[`highlight_${i}`]" />
                    <button type="button" class="remove-highlight-btn" @click="editForm.highlights.splice(i, 1)" v-if="editForm.highlights.length > 1 && isSignature">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <span v-if="editErrors[`highlight_${i}`]" class="field-error" style="grid-column: 1 / -1">{{ editErrors[`highlight_${i}`] }}</span>
                  </div>
                  <button type="button" class="add-highlight-btn" v-if="editForm.highlights.length < 5 && isSignature" @click="editForm.highlights.push('')">
                    + Add Highlight
                  </button>
                </div>
              </div>
            </div>

            <!-- ── Save / cancel ── -->
            <div class="edit-submit-row">
              <button type="submit" class="magic-button" :disabled="saving">
                <span v-if="saving" class="btn-loading">
                  <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Saving changes...
                </span>
                <span v-else>Save changes</span>
              </button>
              <button type="button" class="edit-cancel-btn" @click="setTab('overview')">Cancel</button>
            </div>
          </form>
        </div>

      </template>
      </div><!-- end dash-scroll -->
    </main>
  </div>

  <!-- ==================== SETTINGS MODAL ==================== -->
  <div class="settings-modal" v-if="showSettingsModal">
    <div class="modal-content settings-content" :class="theme === 'night-mode' ? 'night' : 'day'">
      <div class="modal-header">
        <h3>Settings</h3>
        <button @click="closeSettings" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="settings-body">
        <div class="settings-section">
          <h4>Display</h4>
          <div class="setting-item">
            <label>Language</label>
            <div class="expandable-selector" :class="{ 'expanded': showLanguageDropdown }">
              <button @click="toggleLanguageDropdown" class="selector-trigger">
                <span class="current-selection">
                  <span>{{ getLanguageName(userSettings.language) }}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'rotated': showLanguageDropdown }">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <transition name="expand">
                <div v-if="showLanguageDropdown" class="selector-dropdown-inline">
                  <input ref="languageSearchInput" v-model="languageSearch" placeholder="Search languages…" class="dropdown-search" @click.stop>
                  <div class="dropdown-list">
                    <div v-for="lang in filteredLanguages" :key="lang.code" @click="selectLanguage(lang.code)" class="dropdown-item" :class="{ 'selected': userSettings.language === lang.code }">
                      <span class="item-name">{{ lang.name }}</span>
                      <span class="item-native">{{ lang.nativeName }}</span>
                      <svg v-if="userSettings.language === lang.code" class="checkmark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
          <div class="setting-item">
            <label>Theme</label>
            <div class="theme-buttons">
              <button @click="setThemePref('light')" :class="{ active: userSettings.theme === 'light' }" class="theme-btn day-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                Light
              </button>
              <button @click="setThemePref('dark')" :class="{ active: userSettings.theme === 'dark' }" class="theme-btn night-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Dark
              </button>
              <button @click="setThemePref('auto')" :class="{ active: userSettings.theme === 'auto' }" class="theme-btn system-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                System
              </button>
            </div>
          </div>
        </div>
        <div class="settings-section danger-zone">
          <h4>Danger zone</h4>
          <div class="danger-item">
            <div class="danger-item-info">
              <label>Delete account</label>
              <span class="danger-description">
                Permanently
                <span class="danger-link delete-account-link" :class="{ 'danger-link--active': dangerConfirm.deleteAccount.step > 0 }" @click="dangerConfirm.deleteAccount.step === 0 && showDeleteAccountConfirm()">
                  delete your account
                </span>
                and all data
              </span>
            </div>
          </div>
          <div v-if="dangerConfirm.deleteAccount.step === 1" class="danger-confirm-box">
            <p>Are you sure? This action <strong>cannot be undone</strong></p>
            <div class="danger-confirm-actions">
              <button class="danger-btn-yes" @click="dangerConfirm.deleteAccount.step = 2">Yes, continue</button>
              <button class="danger-btn-no" @click="cancelDeleteAccount">No, keep it</button>
            </div>
          </div>
          <div v-if="dangerConfirm.deleteAccount.step === 2" class="danger-confirm-box danger-confirm-box--type">
            <p>Type <strong>DELETE</strong> to confirm permanent deletion of your account</p>
            <input v-model="dangerConfirm.deleteAccount.typedValue" class="danger-type-input" placeholder="Type DELETE" autocomplete="off" spellcheck="false"/>
            <div class="danger-confirm-actions">
              <button class="danger-btn-yes" :disabled="dangerConfirm.deleteAccount.typedValue !== 'DELETE'" @click="executeDeleteAccount">Delete my account</button>
              <button class="danger-btn-no" @click="cancelDeleteAccount">Cancel</button>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <button @click="resetSettings" class="reset-btn">
            Reset to defaults
          </button>
        </div>
        <div v-if="settingsSaved" class="settings-saved-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Saved
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { isNightTime } from '@/utils/timeUtils'
import SwitchModeOverlay from '@/components/ui/SwitchModeOverlay.vue'
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.5:5000/api'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export default {
  name: 'BusinessDashboard',
  components: { SwitchModeOverlay },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) { binding.value() }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
      },
      unmounted(el) { document.body.removeEventListener('click', el.clickOutsideEvent) }
    }
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const business = ref(null)
    const analytics = ref(null)
    const loading = ref(true)
    const saving = ref(false)
    const savingShowEmail = ref(false)
    const activeTab = ref('overview')

    // ── Zone Intelligence state ───────────────────────────────────────
    const zoneIntel        = ref(null)
    const zoneIntelLoading = ref(false)
    const zoneIntelError   = ref(false)
    let   zoneIntelMap     = null   // Leaflet instance — module-level

    const mobileNavOpen = ref(false)
    const sidebarOpen = ref(true)
    const showProfileMenu = ref(false)
    const isSwitching = ref(false)
    const isDesktop = ref(window.innerWidth >= 769)

    // ── Settings modal ──
    const showSettingsModal = ref(false)
    const settingsSaved = ref(false)
    const settingsSaveTimeout = ref(null)
    const showLanguageDropdown = ref(false)
    const languageSearch = ref('')
    const languageSearchInput = ref(null)
    const userSettings = ref({
      language: (() => { try { return JSON.parse(localStorage.getItem('jinni_settings') || '{}').language || 'en' } catch { return 'en' } })(),
      theme: (() => {
        // prefer jinni_settings, fall back to the 'theme' key written by JinniChat
        try {
          const s = JSON.parse(localStorage.getItem('jinni_settings') || '{}')
          if (s.theme) return s.theme
        } catch {}
        const t = localStorage.getItem('theme')
        if (t === 'dark') return 'dark'
        if (t === 'light') return 'light'
        return 'auto'
      })(),
    })
    const dangerConfirm = ref({ deleteAccount: { step: 0, typedValue: '' } })
    const currentUserEmail = ref(getStoredUser().email || '')

    const languageOptions = [
      { code: 'en', name: 'English',  nativeName: 'English',  flag: '🇺🇸' },
      { code: 'ru', name: 'Russian',  nativeName: 'Русский',  flag: '🇷🇺' },
      { code: 'fr', name: 'French',   nativeName: 'Français', flag: '🇫🇷' },
      { code: 'zh', name: 'Chinese',  nativeName: '中文',      flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic',   nativeName: 'العربية',  flag: '🇸🇦' },
      { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲' },
    ]

    const filteredLanguages = computed(() => {
      if (!languageSearch.value) return languageOptions
      const s = languageSearch.value.toLowerCase()
      return languageOptions.filter(l => l.name.toLowerCase().includes(s) || l.nativeName.toLowerCase().includes(s))
    })

    function getLanguageName(code) {
      const l = languageOptions.find(x => x.code === code)
      return l ? l.name : (code || 'English').toUpperCase()
    }

    function toggleLanguageDropdown() {
      showLanguageDropdown.value = !showLanguageDropdown.value
      if (showLanguageDropdown.value) {
        languageSearch.value = ''
        import('vue').then(({ nextTick }) => nextTick(() => languageSearchInput.value?.focus()))
      }
    }

    function selectLanguage(code) {
      userSettings.value.language = code
      localStorage.setItem('jinni_language', code)
      showLanguageDropdown.value = false
      saveSettings()
    }

    function applyTheme() {
      // Mirror JinniChat: keep <html data-theme> and <body class="theme-*">
      // in sync so globally-styled elements (modals, maps, scrollbars, etc.)
      // update immediately without a page refresh.
      const pref = userSettings.value.theme
      const resolved = pref === 'auto'
        ? (isNightTime() ? 'dark' : 'light')
        : pref
      document.documentElement.setAttribute('data-theme', resolved)
      document.body.classList.remove('theme-light', 'theme-dark')
      document.body.classList.add(`theme-${resolved}`)
    }

    async function setThemePref(t) {
      if (userSettings.value.theme === t) return   // no change → no reload
      userSettings.value.theme = t
      // mirror the key JinniChat uses so both pages share the same theme preference
      if (t === 'dark') localStorage.setItem('theme', 'dark')
      else if (t === 'light') localStorage.setItem('theme', 'light')
      else localStorage.removeItem('theme')
      applyTheme()
      // Notify the global settings store so #app (controlled by App.vue) updates too
      store.dispatch('settings/setPreference', t)

      const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      if (isIOS) {
        // iOS Safari only re-derives the toolbar tint on a fresh render → reload.
        // Make it INSTANT and revert-proof: (1) write localStorage now so the
        // store seeds the right theme on first paint; (2) stash the choice so the
        // startup loader honours it over the server for that one load; (3) save
        // with keepalive so the request outlives the reload.
        const stored = JSON.parse(localStorage.getItem('jinni_settings') || '{}')
        stored.theme = userSettings.value.theme
        stored.language = userSettings.value.language
        localStorage.setItem('jinni_settings', JSON.stringify(stored))
        sessionStorage.setItem('jinni_theme_pending', t)
        const token = localStorage.getItem('authToken')
        if (token) {
          fetch(`${API_URL}/settings`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ theme: userSettings.value.theme, language: userSettings.value.language }),
            keepalive: true,
          }).catch(() => {})
        }
        location.reload()
        return
      }
      // Desktop/Android update the chrome live — just save normally.
      saveSettings()
    }

    async function saveSettings() {
      try {
        const stored = JSON.parse(localStorage.getItem('jinni_settings') || '{}')
        stored.language = userSettings.value.language
        stored.theme    = userSettings.value.theme
        localStorage.setItem('jinni_settings', JSON.stringify(stored))
        // Persist to the backend so the Settings page (JinniChat) and the
        // dashboard read the same value after a reload / navigation.
        const token = localStorage.getItem('authToken')
        if (token) {
          await axios.patch(`${API_URL}/settings`,
            { theme: userSettings.value.theme, language: userSettings.value.language },
            { headers: { Authorization: `Bearer ${token}` } })
        }
        settingsSaved.value = true
        clearTimeout(settingsSaveTimeout.value)
        settingsSaveTimeout.value = setTimeout(() => { settingsSaved.value = false }, 2000)
      } catch (e) { console.error('Failed to save settings:', e) }
    }

    async function loadThemeFromBackend() {
      // Pull the canonical theme/language from the backend so the dashboard,
      // the Settings page and the global store all agree on load. This is what
      // seeds the store that App.vue uses to colour the browser chrome
      // (<meta theme-color>) and the <html> background.
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          const { data } = await axios.get(`${API_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } })
          if (data?.success && data.settings) {
            userSettings.value.theme    = data.settings.theme    || userSettings.value.theme
            userSettings.value.language = data.settings.language || userSettings.value.language
            // If the user just changed theme right before a reload (iOS toolbar
            // fix), trust that choice over the server for this one load — its own
            // save may still be in flight. One-shot: consume and clear the flag.
            const pendingTheme = sessionStorage.getItem('jinni_theme_pending')
            if (pendingTheme) {
              userSettings.value.theme = pendingTheme
              sessionStorage.removeItem('jinni_theme_pending')
            }
            // keep the localStorage keys both pages read in sync
            const stored = JSON.parse(localStorage.getItem('jinni_settings') || '{}')
            stored.theme    = userSettings.value.theme
            stored.language = userSettings.value.language
            localStorage.setItem('jinni_settings', JSON.stringify(stored))
            if (userSettings.value.theme === 'dark') localStorage.setItem('theme', 'dark')
            else if (userSettings.value.theme === 'light') localStorage.setItem('theme', 'light')
            else localStorage.removeItem('theme')
          }
        }
      } catch (e) {
        console.error('Failed to load settings from backend:', e)
      } finally {
        // Seed the global store even on failure so the browser chrome matches
        // whatever the page is rendering, instead of staying on its default.
        store.dispatch('settings/setPreference', userSettings.value.theme)
        applyTheme()
      }
    }

    function resetSettings() {
      userSettings.value = { language: 'en', theme: 'auto' }
      localStorage.setItem('theme', '')
      localStorage.setItem('jinni_language', 'en')
      saveSettings()
      store.dispatch('settings/setPreference', 'auto')
      applyTheme()
    }

    function openSettings() {
      showProfileMenu.value = false
      showSettingsModal.value = true
    }

    function closeSettings() {
      showSettingsModal.value = false
      showLanguageDropdown.value = false
    }

    function goToContactUs() {
      showProfileMenu.value = false
      router.push('/contact')
    }

    function showDeleteAccountConfirm() {
      dangerConfirm.value.deleteAccount = { step: 1, typedValue: '' }
    }

    function cancelDeleteAccount() {
      dangerConfirm.value.deleteAccount = { step: 0, typedValue: '' }
    }

    async function executeDeleteAccount() {
      if (dangerConfirm.value.deleteAccount.typedValue !== 'DELETE') return
      dangerConfirm.value.deleteAccount = { step: 0, typedValue: '' }
      try {
        const token = localStorage.getItem('authToken')
        const response = await axios.delete(`${API_URL.replace(/\/api$/, '')}/api/ai/user/account`, { headers: { Authorization: `Bearer ${token}` } })
        if (response.data.success) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('jinni_settings')
          router.push('/')
        }
      } catch (e) { console.error('Failed to delete account:', e) }
    }

    function checkScreenSize() {
      const wasDesktop = isDesktop.value
      isDesktop.value = window.innerWidth >= 769
      if (isDesktop.value && !wasDesktop) {
        mobileNavOpen.value = false
        document.body.style.overflow = ''
      }
    }

    function toggleSidebar() {
      if (!isDesktop.value) {
        if (mobileNavOpen.value) {
          closeMobileSidebar()
        } else {
          mobileNavOpen.value = true
          document.body.style.overflow = 'hidden'
        }
      } else {
        sidebarOpen.value = !sidebarOpen.value
      }
      showProfileMenu.value = false
    }

    function closeMobileSidebar() {
      mobileNavOpen.value = false
      document.body.style.overflow = ''
    }

    function handleOverlayClick() {
      if (mobileNavOpen.value && !isDesktop.value) {
        closeMobileSidebar()
      }
    }

    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      // Load the canonical theme from the backend, sync localStorage, seed the
      // store (so App.vue colours the browser chrome correctly), then apply.
      loadThemeFromBackend()
    })
    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkScreenSize)
      document.body.style.overflow = ''
      if (zoneIntelMap) { zoneIntelMap.remove(); zoneIntelMap = null }
    })

    // Re-apply globally if the preference changes from anywhere (store, settings modal, etc.)
    watch(() => userSettings.value.theme, applyTheme)

    const theme = computed(() => {
      const t = userSettings.value.theme
      if (t === 'dark') return 'night-mode'
      if (t === 'light') return 'day-mode'
      return isNightTime() ? 'night-mode' : 'day-mode'
    })

    const isSignature = computed(() => business.value?.partnership?.tier === 'signature')
    const isSpotlight = computed(() => business.value?.partnership?.tier === 'spotlight')
    const isPaidTier = computed(() => isSignature.value || isSpotlight.value)
    // A PERMANENT (hard) rejection. The owner can't edit or resubmit — the
    // server refuses the PUT — so we surface a "contact support" state instead
    // of the edit form / resubmit button.
    const isHardRejected = computed(() =>
      business.value?.status === 'rejected' &&
      business.value?.verification?.rejectionKind === 'hard'
    )
    const canEdit = computed(() => {
      // A permanently rejected listing can never be self-edited.
      if (isHardRejected.value) return false
      if (isPaidTier.value) return true
      // Verified tier may edit ONLY when the listing is in 'rejected' status,
      // so they can fix the issues that caused rejection and resubmit. The
      // server enforces a field whitelist for this case (see businessRoutes
      // PUT /:id), but we mirror the gating here so the UI matches.
      if (business.value?.status === 'rejected') return true
      return false
    })
    // True when the editor is open for a Verified-tier listing in 'rejected'
    // status — used to hide paid-tier-only sections from the form.
    const isRejectedVerifiedEdit = computed(() =>
      business.value?.status === 'rejected' &&
      business.value?.partnership?.tier === 'verified'
    )

    const tabs = [
      {
        id: 'overview',
        label: 'Overview',
        requiresActive: false,
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        requiresActive: false,
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
      },
      {
        id: 'edit',
        label: 'Edit listing',
        requiresActive: false,
        icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
      }
    ]

    function setTab(id) {
      activeTab.value = id
      if (id === 'analytics' && isSignature.value) fetchZoneIntelligence()
    }

    // ── Zone Intelligence helpers ─────────────────────────────────────
    function podiumHeight(pos, yourRank, total) {
      const MAX = 40, MIN = 18
      const inverted = total - pos
      return MIN + Math.round((inverted / Math.max(total - 1, 1)) * (MAX - MIN))
    }

    async function fetchZoneIntelligence() {
      if (!business.value?._id || !isSignature.value) return
      if (zoneIntel.value) return   // already loaded — use cache
      zoneIntelLoading.value = true
      zoneIntelError.value   = false
      try {
        const token = localStorage.getItem('authToken')
        const { data } = await axios.get(
          `${API_URL}/business/zone-intelligence/${business.value._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        zoneIntel.value = data
        import('vue').then(({ nextTick }) => nextTick(() => initZoneIntelMap(data)))
      } catch {
        zoneIntelError.value = true
      } finally {
        zoneIntelLoading.value = false
      }
    }

    function initZoneIntelMap(data) {
      if (!data?.coords) return
      if (typeof window === 'undefined') return
      function render() {
        const L  = window.L
        const el = document.getElementById('zone-intel-map')
        if (!el) return
        const isNight = theme.value === 'night-mode'
        const center  = [data.coords.lat, data.coords.lng]
        if (zoneIntelMap) { zoneIntelMap.remove(); zoneIntelMap = null }
        zoneIntelMap = L.map('zone-intel-map', {
          zoomControl: false, dragging: true, scrollWheelZoom: false, attributionControl: false
        }).setView(center, 15)
        const tileUrl = isNight
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 19, detectRetina: true }).addTo(zoneIntelMap)
        L.circle(center, { radius: data.zoneRadiusM, color: '#D4AF37', weight: 2, dashArray: '6 4', opacity: 0.85, fillColor: '#D4AF37', fillOpacity: 0.07 }).addTo(zoneIntelMap)
        const youHtml = `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center"><div style="position:absolute;width:36px;height:36px;border-radius:50%;background:#D4AF37;opacity:0.18"></div><div style="width:16px;height:16px;border-radius:50%;background:#D4AF37;border:2.5px solid white;box-shadow:0 0 8px #D4AF3799;display:flex;align-items:center;justify-content:center"><svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div></div>`
        const youMarker = L.marker(center, { icon: L.divIcon({ className: '', html: youHtml, iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(zoneIntelMap).bindPopup(`<strong>${data.businessName || 'Your business'}</strong><br><span style="opacity:0.7;font-size:12px">✦ Signature · Score: ${zoneIntel.value?.yourScore ?? '—'}</span>`)
        youMarker.openPopup()
        // Tier colors: Signature=gold, Spotlight=blue, Verified=green (matching badge spec)
        const fill   = { signature: '#D4AF37', spotlight: '#3b82f6', verified: '#10b981' }
        const border = { signature: '#b8942a', spotlight: '#2563eb', verified: '#059669' }
        ;(data.competitors ?? []).forEach(async comp => {
          const f = fill[comp.tier] || '#f87171'
          const b = border[comp.tier] || '#e53e3e'
          const compName = comp.name || capitalize(comp.tier)
          const labelBg     = isNight ? 'rgba(20,10,40,0.92)' : 'rgba(255,255,255,0.96)'
          const labelCol    = isNight ? '#e2d8ff' : '#1a0b2e'
          const labelBorder = isNight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
          const pinHtml = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:3px"><div style="background:${labelBg};color:${labelCol};border:1px solid ${labelBorder};border-radius:5px;padding:2px 7px;font-size:10px;font-weight:600;white-space:nowrap;font-family:system-ui">${compName}</div><div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center"><div style="position:absolute;width:28px;height:28px;border-radius:50%;background:${f};opacity:0.2"></div><div style="width:13px;height:13px;border-radius:50%;background:${f};border:2px solid white;box-shadow:0 0 6px ${f}99"></div></div></div>`
          const placePin = pos => {
            L.circle(pos, { radius: data.zoneRadiusM, color: b, weight: 1.5, dashArray: '5 4', opacity: 0.7, fillColor: f, fillOpacity: 0.12 }).addTo(zoneIntelMap)
            L.marker(pos, { icon: L.divIcon({ className: '', html: pinHtml, iconSize: [20, 44], iconAnchor: [10, 44] }) }).addTo(zoneIntelMap)
              .bindPopup(`<strong>${compName}</strong><br><span style="opacity:0.7;font-size:12px">${capitalize(comp.tier)} · Score: ${comp.scoreRange[0]}–${comp.scoreRange[1]}</span>`)
          }
          // Use coordinates from the API directly — no geocoding round-trip needed
          if (comp.lat && comp.lng) {
            placePin([comp.lat, comp.lng])
          } else if (comp.city) {
            // Fallback: geocode by city only if server omitted coords
            try {
              const q = [comp.city, comp.country].filter(Boolean).join(', ')
              const gRes  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'en' } })
              const gJson = await gRes.json()
              if (gJson.length) placePin([parseFloat(gJson[0].lat), parseFloat(gJson[0].lon)])
            } catch { /* geocoding failed — skip */ }
          }
        })
        const ZoomControl = L.Control.extend({
          onAdd(map) {
            const wrap = L.DomUtil.create('div', '')
            wrap.setAttribute('style', 'display:flex;flex-direction:column;gap:6px;margin:8px 8px 0 0')
            L.DomEvent.disableClickPropagation(wrap)
            const btnStyle = 'width:30px;height:30px;border:none;border-radius:7px;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;line-height:1;background:' + (isNight ? '#1e1438' : '#fff') + ';color:' + (isNight ? '#e2e8f0' : '#3c2a1e') + ';box-shadow:0 1px 4px rgba(0,0,0,0.18)'
            const svgPlus  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
            const svgMinus = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>'
            const zIn  = L.DomUtil.create('button', '', wrap); zIn.setAttribute('style', btnStyle);  zIn.innerHTML = svgPlus;  L.DomEvent.on(zIn,  'click', L.DomEvent.stop).on(zIn,  'click', () => map.zoomIn())
            const zOut = L.DomUtil.create('button', '', wrap); zOut.setAttribute('style', btnStyle); zOut.innerHTML = svgMinus; L.DomEvent.on(zOut, 'click', L.DomEvent.stop).on(zOut, 'click', () => map.zoomOut())
            return wrap
          }
        })
        zoneIntelMap.addControl(new ZoomControl({ position: 'topright' }))
      }
      if (window.L) {
        render()
      } else {
        const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link)
        const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = render; document.head.appendChild(script)
      }
    }

    const PRIMARY_CATS = ['restaurants','hotels','events','historical','hidden_gems','souvenirs','clothing','jewelry','food']
    // Singular human labels for the primary category enum. Source enum is
    // plural ("restaurants", "hotels", …) because it describes the category
    // bucket, but a single listing card reads better in the singular ("Your
    // listing · Event" not "Your listing · Events"). Also fixes the
    // "Hidden_gems" rendering that the previous title-case approach produced.
    const PRIMARY_CAT_LABELS = {
      restaurants: 'Restaurant',
      hotels:      'Hotel',
      events:      'Event',
      historical:  'Historical site',
      hidden_gems: 'Hidden gem',
      souvenirs:   'Souvenirs & gifts',
      clothing:    'Clothing & boutique',
      jewelry:     'Jewelry',
      food:        'Food & gourmet'
    }
    const mainCategory = computed(() => {
      const cat = business.value?.type?.find(t => PRIMARY_CATS.includes(t))
      return PRIMARY_CAT_LABELS[cat] || (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '')
    })
    // True when this listing is an event — controls the Event Schedule block and
    // gates the Weekly/Opening Hours section the same way the onboarding form does.
    const isEvent = computed(() => (business.value?.type || []).includes('events'))
    // Today's date as "YYYY-MM-DD" for the start-date <input type="date" :min>
    // attribute. Built from local-time getters (not toISOString) so users east
    // of UTC don't see "tomorrow" as the earliest selectable day.
    const today = (() => {
      const d = new Date()
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    })()

    // ── Event timezone helpers ────────────────────────────────────────────────
    //
    //  An event's startDate / endDate are absolute UTC instants. They only
    //  become a wall-clock time when paired with the event's home timezone
    //  (eventSchedule.timezone, e.g. "Europe/Moscow"). These helpers always
    //  convert against THAT timezone so the owner sees the same time they
    //  entered, no matter where they (or the server) are located. The same
    //  converter logic is used in BusinessOnboarding.vue and AdminDashboard.vue.
    //
    //  Legacy events stored before the timezone field existed have no
    //  es.timezone; those fall back to the browser zone, which keeps old
    //  behaviour rather than guessing wrongly.
    const browserTz = () => {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }
      catch { return 'UTC' }
    }
    // Wall-clock parts that `timeZone` shows for an absolute Date.
    const zonedParts = (date, timeZone) => {
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
    const tzOffsetMinutes = (date, timeZone) => {
      const p = zonedParts(date, timeZone)
      const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
      return Math.round((asUTC - date.getTime()) / 60000)
    }
    // Absolute UTC value -> { date:'YYYY-MM-DD', time:'HH:MM' } in `timeZone`.
    const splitDateTimeTz = (value, timeZone) => {
      if (!value) return { date: '', time: '' }
      const tz = timeZone || browserTz()
      const d = value instanceof Date ? value : new Date(value)
      if (isNaN(d)) return { date: '', time: '' }
      const p = zonedParts(d, tz)
      const pad = (n) => String(n).padStart(2, '0')
      return {
        date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
        time: `${pad(p.hour)}:${pad(p.minute)}`
      }
    }
    // { date, time } in `timeZone` -> absolute UTC ISO string (trailing Z).
    const combineDateTimeTz = (dateStr, timeStr, fallbackTime, timeZone) => {
      if (!dateStr) return ''
      const tz = timeZone || browserTz()
      const t = (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) ? timeStr : fallbackTime
      const [y, mo, d] = dateStr.split('-').map(Number)
      const [h, mi] = t.split(':').map(Number)
      if (!y || !mo || !d) return ''
      const utcGuess = Date.UTC(y, mo - 1, d, h, mi, 0)
      let off = tzOffsetMinutes(new Date(utcGuess), tz)
      let result = new Date(utcGuess - off * 60000)
      const off2 = tzOffsetMinutes(result, tz)
      if (off2 !== off) result = new Date(utcGuess - off2 * 60000)
      return result.toISOString()
    }
    // Short, readable timezone label, e.g. "Europe/Moscow" -> "Moscow".
    const tzShortLabel = (tz) => {
      if (!tz) return ''
      return (tz.split('/').pop() || tz).replace(/_/g, ' ')
    }

    // ── Event schedule presentation ──────────────────────────────────────────
    //
    //  Formats the stored eventSchedule for the overview meta block. The
    //  schedule has several shapes and the label adapts to each:
    //
    //    • Recurring                  → "Weekly · starting Sat, May 16"
    //    • Same-day with times        → "Sat, May 16 · 20:00 – 23:59"
    //    • Same-day, all-day          → "Sat, May 16 · All day"
    //    • Multi-day spans            → "Sat, May 16 – Sun, May 17"
    //    • Multi-day with times       → "Sat, May 16 · 20:00 – Sun, May 17 · 02:00"
    //    • Just a start, no end       → "Sat, May 16 · 20:00"
    //
    //  All times are read in the event's own timezone (eventSchedule.timezone)
    //  so the value the owner typed in onboarding is the value they see here,
    //  regardless of where the server or client lives.
    //
    //  Returns an object so the template can render the date and time spans
    //  with separate styling and so we can also expose the raw "is the event
    //  past" boolean cheaply for the dimming/badge logic below.
    const eventScheduleDisplay = computed(() => {
      const es = business.value?.eventSchedule
      if (!isEvent.value || !es?.startDate) return null

      const tz = es.timezone || browserTz()
      const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      // Format a {date:'YYYY-MM-DD'} part as "Sat, May 16".
      const fmtDate = (iso) => {
        const [y, m, d] = iso.split('-').map(Number)
        // Build the weekday from a UTC-anchored date to avoid host-tz drift —
        // the date string itself already carries the correct calendar day.
        const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
        return `${days[wd]}, ${months[m - 1]} ${d}`
      }
      // A "filler" time is the implicit 00:00 (start) / 23:59 (end) that the
      // payload stamps onto all-day events. Hidden so they read as "All day".
      const isFillerStart = (t) => t === '00:00'
      const isFillerEnd   = (t) => t === '23:59'

      const start = splitDateTimeTz(es.startDate, tz)
      const end   = es.endDate ? splitDateTimeTz(es.endDate, tz) : null
      const tzTag = es.timezone ? ` (${tzShortLabel(es.timezone)})` : ''

      // ── Recurring ─────────────────────────────────────────────────────────
      if (es.isRecurring) {
        return {
          isRecurring: true,
          primary: 'Weekly',
          secondary: `starting ${fmtDate(start.date)}`
        }
      }

      // ── One-time event ────────────────────────────────────────────────────
      const sameDay = end && end.date === start.date
      const showStartTime = !isFillerStart(start.time)
      const showEndTime   = end && !isFillerEnd(end.time)

      if (!end) {
        return {
          isRecurring: false,
          primary: fmtDate(start.date),
          secondary: (showStartTime ? start.time + tzTag : 'All day')
        }
      }
      if (sameDay) {
        if (!showStartTime && !showEndTime) {
          return { isRecurring: false, primary: fmtDate(start.date), secondary: 'All day' }
        }
        const startTxt = showStartTime ? start.time : '00:00'
        const endTxt   = showEndTime   ? end.time   : '23:59'
        return { isRecurring: false, primary: fmtDate(start.date), secondary: `${startTxt} – ${endTxt}${tzTag}` }
      }
      // Multi-day: show full range. Times included when not filler.
      const startBlock = showStartTime ? `${fmtDate(start.date)} · ${start.time}` : fmtDate(start.date)
      const endBlock   = showEndTime   ? `${fmtDate(end.date)} · ${end.time}`     : fmtDate(end.date)
      return { isRecurring: false, primary: `${startBlock} – ${endBlock}${tzTag}`, secondary: '' }
    })

    const allImages = computed(() => {
      const base = (import.meta.env.API_URL || '').replace(/\/api$/, '')
      const urls = business.value?.images || []
      const uploads = business.value?.uploadedImageUrls || []
      return [...urls, ...uploads]
        .filter(Boolean)
        .map(img => img.startsWith('/api/') ? `${base}${img}` : img)
    })

    const hasSocialLinks = computed(() => {
      const s = business.value?.contact?.socialMedia
      return s && (s.instagram || s.facebook || s.tripadvisor || s.booking)
    })

    const priceLabel = computed(() => {
      const p = business.value?.priceRange
      if (!p) return ''
      const map = { budget: '$', mid: '$$', upscale: '$$$', luxury: '$$$$' }
      return map[p] || p
    })

    // Traveler interest tags stored in type[] alongside category — extract for display
    const highlightPlaceholders = ['Award-winning chef', 'Stunning views', 'Live music', 'Locally sourced ingredients']
    const INTEREST_KEYS = ['cultural','history','adventure','relaxation','nature','art','nightlife','food&drink','family','romantic']
    const STYLE_KEYS    = ['luxury','budget']
    const INTEREST_LABELS = { cultural: 'Cultural', history: 'History', adventure: 'Adventure', relaxation: 'Relaxation', nature: 'Nature', art: 'Art', nightlife: 'Nightlife', 'food&drink': 'Food & Drink', family: 'Family', romantic: 'Romantic' }
    const STYLE_LABELS    = { luxury: 'Luxury', budget: 'Budget' }

    const listingInterests = computed(() =>
      (business.value?.type || []).filter(t => INTEREST_KEYS.includes(t)).map(t => INTEREST_LABELS[t] || t)
    )
    const listingStyles = computed(() =>
      (business.value?.type || []).filter(t => STYLE_KEYS.includes(t)).map(t => STYLE_LABELS[t] || t)
    )

    // Full pricing label — reads from pricing object (supports free, min/max range, average)
    // Falls back to priceRange symbol if pricing object is absent
    const pricingLabel = computed(() => {
      const p = business.value?.pricing
      if (p) {
        if (p.isFree) return 'Free'
        const cur = p.currency || ''
        if (p.min != null && p.max != null) return `${cur}${p.min} – ${cur}${p.max}`
        if (p.average != null) return `~${cur}${p.average}`
      }
      // Fallback to priceRange enum symbols
      const map = { budget: '$', mid: '$$', upscale: '$$$', luxury: '$$$$' }
      return map[business.value?.priceRange] || ''
    })

    // Single source of truth: compute all four pillars from live analytics data,
    // mirroring Business.js recalcPerformanceScore() exactly.
    // Both the score badge and the bar widths derive from this — they can never diverge.
    const scoreBreakdown = computed(() => {
      const a = analytics.value || business.value?.analytics || {}
      const b = business.value

      // ── Seed weeklyViews if empty (no cron has run yet) ──────────────────
      // Backend sends the seeded array — this fallback covers direct analytics reads.
      let weeklyViews = a.weeklyViews || []
      if (weeklyViews.length === 0 && (a.views || 0) > 0) {
        weeklyViews = [a.views]
      }

      // 1. Recent Activity (30%) — avg weekly views over last 4 weeks, benchmark 100/wk
      const recentWeeks = weeklyViews.slice(-4)
      const recentAvg = recentWeeks.length
        ? recentWeeks.reduce((sum, v) => sum + v, 0) / recentWeeks.length
        : 0
      const recentActivity = Math.min((recentAvg / 100) * 100, 100)

      // 2. Engagement Quality (25%) — saves*3, aiAsk*2, moreImages*1, benchmark 300
      const engagementRaw =
        (a.saves      || 0) * 3 +
        (a.aiAsk      || 0) * 2 +
        (a.moreImages || 0) * 1
      const engagement = Math.min((engagementRaw / 300) * 100, 100)

      // 3. Conversion Actions (30%) — all real-world intent clicks, benchmark 150
      const conversionRaw =
        (a.directionClicks   || 0) +
        (a.phoneClicks       || 0) +
        (a.websiteClicks     || 0) +
        (a.searchClicks      || 0) + 
        (a.instagramClicks   || 0) +
        (a.facebookClicks    || 0) +
        (a.tripadvisorClicks || 0)
      const conversions = Math.min((conversionRaw / 150) * 100, 100)

      // 4. Profile Completeness (15%) — 5 groups x 20pts each
      let completeness = 0
      if (b?.description?.short)                          completeness += 20
      if (b?.description?.detailed)                       completeness += 20
      if ((b?.images || []).length >= 3)                  completeness += 20
      if (b?.contact?.phone || b?.contact?.website)       completeness += 20
      if ((b?.description?.highlights || []).length >= 2) completeness += 20

      return {
        recentActivity: Math.round(recentActivity),
        engagement:     Math.round(engagement),
        conversions:    Math.round(conversions),
        completeness,
      }
    })

    // Final weighted score — same weights as Business.js (30/25/30/15).
    // Computed from scoreBreakdown so badge and bars always agree.
    const performanceScore = computed(() => {
      if (!analytics.value && !business.value?.analytics) return null
      const { recentActivity, engagement, conversions, completeness } = scoreBreakdown.value
      return Math.round(
        recentActivity * 0.30 +
        engagement     * 0.25 +
        conversions    * 0.30 +
        completeness   * 0.15
      )
    })
    const zoneSlots = computed(() => business.value?.zoneInfo?.slotsUsed ?? '—')
    const zoneRadiusLabel = computed(() => {
      const cat = business.value?.type?.find(t => PRIMARY_CATS.includes(t))
      const map = { restaurants: '300m', hotels: '900m', events: '300m', historical: '500m', hidden_gems: '900m', souvenirs: '300m', clothing: '300m', jewelry: '300m', food: '300m' }
      return cat ? (map[cat] || '—') : '—'
    })

    const statusLabel = computed(() => {
      const s = business.value?.status
      return { active: 'Live', pending: 'Under review', waitlisted: 'Waitlisted', frozen: 'Frozen', rejected: 'Rejected', expired: 'Ended' }[s] || s
    })
    const statusHeadline = computed(() => {
      const s = business.value?.status
      return { active: `Your listing is live`, pending: 'Under review', waitlisted: 'On the waitlist', frozen: 'Listing frozen', rejected: 'Application not approved', expired: 'This event has ended' }[s] || ''
    })
    const statusDetail = computed(() => {
      const b = business.value
      if (b?.status === 'active') return `Travelers can discover ${b.name} on Jinni.`
      if (b?.status === 'pending') return 'Our team is reviewing your application. This usually takes up to 24 hours.'
      if (b?.status === 'waitlisted') return 'Your listing was approved but your zone is currently full. You\'ll be notified when a slot opens.'
      if (b?.status === 'frozen') return 'A higher-tier business entered your zone. Upgrade your plan to re-enter immediately.'
      if (b?.status === 'rejected') {
        if (b?.verification?.rejectionKind === 'hard') {
          return 'This listing has been permanently declined and can no longer be edited or resubmitted. Please contact support if you believe this is a mistake.'
        }
        return b?.verification?.staffNotes || 'Your application did not meet our verification requirements. You may resubmit with updated information.'
      }
      if (b?.status === 'expired') return 'Your event\'s end date has passed and it\'s no longer shown to travelers. Open Edit to reschedule it for a new date or update any details — your changes will be re-reviewed by our team.'
      return ''
    })
    const statusIcon = computed(() => {
      const s = business.value?.status
      if (s === 'active') return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
      if (s === 'pending' || s === 'waitlisted') return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
      if (s === 'frozen') return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>'
      // expired — calendar with an X through it (visual: ended/done)
      if (s === 'expired') return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="15" x2="15" y2="21"/><line x1="15" y1="15" x2="9" y2="21"/></svg>'
      return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    })

    const editErrors = ref({})
    const editHoursDay = ref(null)
    const editHoursLastUsed = ref(null)

    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

    const travelerInterestOptions = [
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
    // Styles is the PRICE axis only (luxury / budget); family/romantic moved to
    // interests above. Behaves exactly like interests: cap-based selection
    // (non-signature 2 / signature 3), so both can be selected when the cap allows.
    const travelerStyleOptions = [
      { key: 'luxury', label: 'Luxury' },
      { key: 'budget', label: 'Budget' }
    ]
    const ALL_INTEREST_STYLE_KEYS = new Set([
      'cultural','history','adventure','relaxation','nature','art','nightlife','food&drink',
      'family','romantic','luxury','budget'
    ])

    const editForm = ref({
      name: '', description: '', detailedDescription: '', phone: '', website: '',
      images: Array(8).fill(''), highlights: [], social: {},
      interests: [], styles: [],
      priceMode: 'free', priceMedium: '',
      priceRange: '', priceMin: null, priceMax: null, priceCurrency: 'USD',
      openingHours: DAYS.map(d => ({ day: d, closed: false, open: '09:00', close: '22:00' })),
      // ── Event schedule (only used when category is 'events') ──────────────
      // Split into date + time strings because <input type="date"> / "time"
      // each take their own value. Recombined into ISO datetimes by
      // buildEditEventSchedulePayload() before sending to the API.
      eventStartDate: '',
      eventStartTime: '',
      eventEndDate: '',
      eventEndTime: '',
      eventRecurring: false,
      eventTimezone: ''
    })

    function initEditForm() {
      const b = business.value
      const rawType = b?.type || []
      const interests = rawType.filter(t => INTEREST_KEYS.includes(t))
      const styles = rawType.filter(t => STYLE_KEYS.includes(t))
      const storedHours = b?.openingHours?.days || []
      const hoursMap = {}
      storedHours.forEach(d => { hoursMap[d.day] = d })
      const openingHours = DAYS.map(d => hoursMap[d] ? { ...hoursMap[d] } : { day: d, closed: false, open: '09:00', close: '22:00' })
      const p = b?.pricing
      // Determine price mode from stored data
      let priceMode = 'free'
      if (p) {
        if (p.isFree) priceMode = 'free'
        else if (p.min != null || p.max != null) priceMode = 'range'
        else if (p.average != null) priceMode = 'average'
      } else if (b?.priceRange) {
        priceMode = 'range'
      }
      // ── Event schedule — split stored ISO datetimes back into date+time pairs.
      //
      //   eventSchedule.startDate / endDate are absolute UTC instants. They are
      //   split into date + time fields EXPRESSED IN THE EVENT'S OWN TIMEZONE
      //   (eventSchedule.timezone) so the owner edits the same wall-clock they
      //   originally entered — not a value shifted into the server's or their
      //   browser's zone. buildEditEventSchedulePayload() converts them back.
      //
      //   A legacy event with no stored timezone falls back to the browser
      //   zone; the owner can still see and edit it, just without the explicit
      //   venue-zone guarantee.
      const es = b?.eventSchedule || {}
      const eventTz = es.timezone || browserTz()
      const startParts = splitDateTimeTz(es.startDate, eventTz)
      const endParts   = splitDateTimeTz(es.endDate, eventTz)
      // NOTE: We previously stripped "00:00" and "23:59" times here as a guess
      // at "the user picked no time, just date". That heuristic was wrong: a
      // user who genuinely saves a midnight event or an event ending at 23:59
      // would see their time silently disappear when editing. We now always
      // round-trip whatever was stored. If the user wants to clear a time,
      // they can blank the field manually.
      editErrors.value = {}
      editForm.value = {
        name: b?.name || '',
        description: b?.description?.short || '',
        detailedDescription: b?.description?.detailed || '',
        phone: (b?.contact?.phone || '').replace(/^\+/, ''),
        website: b?.contact?.website || '',
        images: [...(b?.images || []), ...Array(8).fill('')].slice(0, 8),
        highlights: [...(b?.description?.highlights || [])].length ? [...(b?.description?.highlights || [])] : [''],
        social: {
          ...(b?.contact?.socialMedia || {}),
          instagram: (b?.contact?.socialMedia?.instagram || '').replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, '').replace(/\/$/, ''),
          facebook: (b?.contact?.socialMedia?.facebook || '').replace(/^https?:\/\/(www\.)?facebook\.com\/?/i, '').replace(/\/$/, ''),
        },
        interests,
        styles,
        priceMode,
        priceMedium: p?.average != null ? String(p.average) : '',
        priceRange: b?.priceRange || '',
        isFree: p?.isFree || false,
        priceMin: p?.min != null ? String(p.min) : null,
        priceMax: p?.max != null ? String(p.max) : null,
        priceCurrency: p?.currency || 'USD',
        openingHours,
        // Event schedule fields — empty strings when the listing isn't an event.
        eventStartDate: startParts.date,
        eventStartTime: startParts.time,
        eventEndDate:   endParts.date,
        eventEndTime:   endParts.time,
        eventRecurring: !!es.isRecurring,
        // The venue's timezone. Carried through unchanged so the save payload
        // re-uses it; the owner doesn't pick it here (the address determines
        // it). Falls back to the browser zone for legacy events.
        eventTimezone:  eventTz
      }
    }

    function validateEditImageUrl(index) {
      const url = (editForm.value.images[index] || '').trim()
      if (!url) { delete editErrors.value[`image_${index}`]; return true }
      if (/^data:/i.test(url)) {
        editErrors.value[`image_${index}`] = 'Data URIs are not allowed — please use a direct image URL'
        return false
      }
      if (url.length > 2000) {
        editErrors.value[`image_${index}`] = 'Image URL must be 2000 characters or fewer'
        return false
      }
      if (!/^https:\/\//i.test(url)) {
        editErrors.value[`image_${index}`] = 'Image URL must start with https://'
        return false
      }
      const ssrfPattern = /^https:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|0\.0\.0\.0|::1)/i
      if (ssrfPattern.test(url)) {
        editErrors.value[`image_${index}`] = 'Private or internal network URLs are not allowed'
        return false
      }

      // Allow URLs that end in a known image extension (with optional query string)
      const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url)

      // Also allow known image CDN domains that serve images without extensions
      const trustedImageCdns = /^https:\/\/(lh[0-9]+\.googleusercontent\.com|maps\.googleapis\.com|streetviewpixels-pa\.googleapis\.com|ggpht\.com)/i
      const isTrustedCdn = trustedImageCdns.test(url)

      if (!hasImageExtension && !isTrustedCdn) {
        editErrors.value[`image_${index}`] = 'Enter a valid image URL ending in .jpg, .png, .webp, .gif or .avif'
        return false
      }

      delete editErrors.value[`image_${index}`]
      return true
    }

    function handleUpload(event, index) {
      const file = event.target.files[0]
      if (!file) return
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
      if (!allowedTypes.includes(file.type)) {
        editErrors.value[`image_${index}`] = 'Only JPG, PNG, WEBP, GIF or AVIF files are allowed'
        event.target.value = ''
        return
      }
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        editErrors.value[`image_${index}`] = 'Image must be 5MB or smaller'
        event.target.value = ''
        return
      }
      const filename = file.name
      if (/(\.\.(\/|\\)|[<>{}\[\]|\\^~`])/.test(filename)) {
        editErrors.value[`image_${index}`] = 'File name contains invalid characters'
        event.target.value = ''
        return
      }
      const dangerousExtPattern = /\.(php|php[0-9]|phtml|phar|asp|aspx|jsp|exe|sh|bat|cmd|cgi|pl|py|rb)\./i
      if (dangerousExtPattern.test(filename)) {
        editErrors.value[`image_${index}`] = 'File name contains an invalid extension'
        event.target.value = ''
        return
      }
      delete editErrors.value[`image_${index}`]
      const reader = new FileReader()
      reader.onload = e => { editForm.value.images[index] = e.target.result }
      reader.readAsDataURL(file)
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

    function validateEditForm() {
      const errs = {}
      const f = editForm.value
      // Name — same rules as onboarding
      if (!f.name.trim()) errs.name = 'Business name is required'
      else if (f.name.trim().length < 2) errs.name = 'Business name must be at least 2 characters'
      else if (f.name.trim().length > 34) errs.name = 'Business name must be 34 characters or fewer'
      else if (hasNonLatin(f.name.trim())) errs.name = 'Please enter the business name in English'
      // Description — required for signature; optional but validated if filled
      const descMax = isSignature.value ? 600 : 300
      if (f.description && f.description.trim()) {
        if ((f.description.trim().match(/[a-zA-Z\u00C0-\u024F]/g) || []).length < 20)
          errs.description = 'Description must contain at least 20 letters'
        else if (f.description.trim().length > descMax)
          errs.description = `Description must be ${descMax} characters or fewer`
        else if (hasNonLatin(f.description.trim()))
          errs.description = 'Please write the description in English'
      }
      // Phone — optional but must be valid if filled
      if (f.phone.trim()) {
        if (hasNonLatin(f.phone)) errs.phone = 'Phone number must contain only digits'
        else {
          const phoneCleaned = ('+' + f.phone.trim()).replace(/[\s\-()]/g, '')
          if (!/^\+[1-9]\d{6,14}$/.test(phoneCleaned)) errs.phone = 'Enter a valid number with country code (e.g. 1 212 555 0100)'
        }
      }
      // Website — optional but must be valid https URL if filled
      if (f.website.trim()) {
        if (f.website.trim().length > 300) errs.website = 'Website URL must be 300 characters or fewer'
        else if (!/^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)+/.test(f.website.trim()))
          errs.website = 'Enter a valid URL starting with https://'
        else if (hasNonLatin(f.website)) errs.website = 'Website URL must be in standard format'
      }
      // Pricing
      if (f.priceMode === 'average') {
        if (!f.priceMedium || !String(f.priceMedium).trim() || Number(f.priceMedium) < 1) errs.priceMedium = 'Please enter an average price of at least 1 or choose a different option above'
        else if (isNaN(Number(f.priceMedium))) errs.priceMedium = 'Enter a valid positive number'
      }
      if (f.priceMode === 'range') {
        if (!f.priceMin && !f.priceMax) errs.pricing = 'Please enter both a minimum and maximum price'
        else if (!f.priceMin || !String(f.priceMin).trim()) errs.priceMin = 'Please enter a minimum price'
        else if (!f.priceMax || !String(f.priceMax).trim()) errs.priceMax = 'Please enter a maximum price'
        else if (isNaN(Number(f.priceMin)) || Number(f.priceMin) < 0) errs.priceMin = 'Minimum price cannot be negative'
        else if (isNaN(Number(f.priceMax)) || Number(f.priceMax) < 0) errs.priceMax = 'Maximum price cannot be negative'
        else if (Number(f.priceMin) > Number(f.priceMax)) errs.priceMax = 'Maximum must be greater than minimum'
      }
      // Interests & styles — must have at least 1
      if (!f.interests.length) errs.interests = 'Select at least one traveler interest'
      if (!f.styles.length) errs.styles = 'Select at least one traveler style'
      // Opening hours — only validated when the section is actually shown.
      //   - Non-event listings: always validated (must have ≥1 open day).
      //   - Events: only validated when the event is recurring (i.e. when the
      //     Weekly Schedule section is rendered). One-time events have their
      //     single time window in the Event Schedule block above and don't
      //     keep weekly hours, so we skip the "at least one day open" check
      //     for them — otherwise the form would be unsavable.
      //   - Overnight hours (close < open) remain intentionally allowed.
      const hoursApply = !isEvent.value || f.eventRecurring
      if (hoursApply) {
        const allClosed = f.openingHours.every(d => d.closed)
        if (allClosed) {
          errs.openingHours = 'At least one day must be open'
        } else {
          const toMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
          f.openingHours.forEach((d, idx) => {
            if (!d.closed) {
              if (!d.open || !d.close) {
                errs[`hours_${idx}`] = 'Enter both open and close time or mark as Closed'
              } else if (toMins(d.open) === toMins(d.close)) {
                // Equal times are ambiguous (0h or 24h?) — block to force a real choice
                errs[`hours_${idx}`] = 'Open and close time cannot be the same'
              }
              // close < open is intentionally allowed — it means the place closes the next day (e.g. 17:00 – 05:00)
            }
          })
        }
      }
      // ── Event schedule — required when category is events ────────────────
      // Mirrors the validation block in BusinessOnboarding.vue. Note: unlike
      // onboarding (where the event hasn't happened yet) we do NOT reject past
      // start dates here — an owner editing an already-approved event might
      // legitimately tweak description/images after the event has begun, and
      // forcing the start date forward would corrupt the schedule. We only
      // require the start date to exist and the date/time relations to be
      // self-consistent.
      if (isEvent.value) {
        if (!f.eventStartDate) {
          errs.eventStartDate = 'Event start date is required'
        }
        if (f.eventEndDate && f.eventStartDate && f.eventEndDate < f.eventStartDate) {
          errs.eventEndDate = 'End date must be on or after the start date'
        }
        // If end time is supplied but no end date, default the end date to start
        // date so the user doesn't have to set it manually.
        if (f.eventEndTime && !f.eventEndDate) {
          f.eventEndDate = f.eventStartDate
        }
        // Same-day events with both times set: end-time must be after start-time.
        // Cross-day events (e.g. 22:00 Fri → 02:00 Sat) are fine.
        if (f.eventStartTime && f.eventEndTime &&
            f.eventStartDate && f.eventEndDate &&
            f.eventStartDate === f.eventEndDate &&
            f.eventEndTime <= f.eventStartTime) {
          errs.eventEndTime = 'End time must be after the start time on the same day'
        }
      }
      // Images — validate each filled URL
      f.images.forEach((img, i) => {
        if (img && img.startsWith('http')) {
          const valid = validateEditImageUrl(i)
          if (!valid) errs[`image_${i}`] = editErrors.value[`image_${i}`]
        }
      })
      // Highlights (signature only) — validate filled ones
      if (isSignature.value) {
        f.highlights.forEach((h, i) => {
          const trimmed = (h || '').trim()
          if (trimmed) {
            if (trimmed.length < 5) errs[`highlight_${i}`] = 'Highlight must be at least 5 characters'
            else if (trimmed.length > 25) errs[`highlight_${i}`] = 'Highlight must be 25 characters or fewer'
          }
        })
      }
      // Social links (Signature only)
      if (isSignature.value) {
        const s = f.social || {}
        if (s.instagram && s.instagram.trim()) {
          const ig = s.instagram.trim()
          if (!/^[a-zA-Z0-9._]{1,30}$/.test(ig)) errs.instagram = 'Enter a valid Instagram handle (letters, numbers, dots, underscores only, max 30)'
          else if (/^\.|\.$/.test(ig)) errs.instagram = 'Instagram handle cannot start or end with a dot'
          else if (/\.{2,}/.test(ig)) errs.instagram = 'Instagram handle cannot contain consecutive dots'
        }
        if (s.facebook && s.facebook.trim()) {
          const fb = s.facebook.trim()
          if (!/^[a-zA-Z0-9.]{5,50}$/.test(fb)) errs.facebook = 'Enter a valid Facebook page name (letters, numbers, dots only, 5–50 characters)'
          else if (/^\.|\.$/.test(fb)) errs.facebook = 'Facebook page name cannot start or end with a dot'
          else if (/\.{2,}/.test(fb)) errs.facebook = 'Facebook page name cannot contain consecutive dots'
        }
        if (s.tripadvisor && s.tripadvisor.trim() && !/^https:\/\/([a-zA-Z0-9\-]+\.)?tripadvisor\.[a-z]{2,}(\.[a-z]{2,})?(\/.*)?$/.test(s.tripadvisor.trim()))
          errs.tripadvisor = 'Enter a valid TripAdvisor URL (e.g. https://www.tripadvisor.com/...)'
        if (s.booking && s.booking.trim() && !/^https:\/\/([a-zA-Z0-9\-]+\.)?booking\.com(\/.*)?$/.test(s.booking.trim()))
          errs.booking = 'Enter a valid Booking.com URL (e.g. https://www.booking.com/...)'
      }
      editErrors.value = { ...editErrors.value, ...errs }
      return Object.keys(errs).length === 0
    }

    async function toggleShowEmail() {
      if (savingShowEmail.value) return
      savingShowEmail.value = true
      try {
        const user = getStoredUser()
        const token = localStorage.getItem('authToken')
        const newVal = !business.value.contact.showEmail
        await axios.put(`${API_URL}/business/${user.businessId}`, { showEmail: newVal }, { headers: { Authorization: `Bearer ${token}` } })
        business.value.contact.showEmail = newVal
      } catch (err) {
        console.error('Failed to update email visibility:', err)
      } finally {
        savingShowEmail.value = false
      }
    }

    async function saveEdits() {
      if (!validateEditForm()) {
        // Scroll to first error
        import('vue').then(({ nextTick }) => nextTick(() => {
          const el = document.querySelector('.field-error, .edit-input-error, .edit-input-prefix-error')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }))
        return
      }
      saving.value = true
      try {
        const user = getStoredUser()
        const b = business.value
        const PRIMARY_CATS_SET = new Set(['restaurants','hotels','events','historical','hidden_gems','souvenirs','clothing','jewelry','food'])
        const primaryTypes = (b?.type || []).filter(t => PRIMARY_CATS_SET.has(t))
        const newType = [...primaryTypes, ...editForm.value.interests, ...editForm.value.styles]

        const f = editForm.value
        const pricing = f.priceMode === 'free'
          ? { isFree: true, min: null, max: null, average: null, currency: f.priceCurrency }
          : f.priceMode === 'average'
          ? { isFree: false, min: null, max: null, average: Number(f.priceMedium), currency: f.priceCurrency }
          : { isFree: false, min: Number(f.priceMin), max: Number(f.priceMax), average: null, currency: f.priceCurrency }

        const payload = {
          name: f.name,
          type: newType,
          description: {
            short: f.description,
            detailed: f.detailedDescription,
            ...(isSignature.value ? { highlights: f.highlights.filter(Boolean) } : { highlights: [] })
          },
          contact: {
            phone: f.phone.trim() ? '+' + f.phone.trim() : '',
            website: f.website,
            ...(isSignature.value ? {
              socialMedia: {
                instagram: f.social.instagram?.trim() ? `https://www.instagram.com/${f.social.instagram.trim()}` : '',
                facebook: f.social.facebook?.trim() ? `https://www.facebook.com/${f.social.facebook.trim()}` : '',
                tripadvisor: f.social.tripadvisor || '',
                booking: f.social.booking || ''
              }
            } : {})
          },
          pricing,
          images: f.images.filter(Boolean),
          // Opening hours: omitted entirely for one-time events (no weekly grid
          // is shown in the UI, so we must not overwrite stored hours with an
          // empty/invalid set). For non-events and recurring events, send the
          // grid as collected from the form.
          ...((!isEvent.value || f.eventRecurring)
            ? { openingHours: { is24Hours: false, days: f.openingHours } }
            : {}),
          // Event schedule: only sent when this listing is an event. The
          // backend PUT handler ignores this field for non-event types as an
          // extra safeguard, but we don't send it at all to keep payloads clean.
          ...(isEvent.value ? { eventSchedule: buildEditEventSchedulePayload() } : {})
        }
        await axios.put(`${API_URL}/business/${user.businessId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        })
        await load()
        setTab('overview')
      } catch (err) {
        console.error('Save failed:', err)
        alert('Failed to save changes. Please try again.')
      } finally {
        saving.value = false
      }
    }

    function trend(val) {
      if (!val) return 'neutral'
      return val > 0 ? 'up' : 'down'
    }

    function isToday(dayName) {
      const idx = new Date().getDay()
      const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
      return days[idx] === dayName.toLowerCase()
    }

    function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

    // Resolve the current user from the localStorage blob, filling any gaps
    // from the JWT. The manual login flow writes a full blob (incl. businessId);
    // Google / setup-password logins redirect with only a token, so businessId,
    // role and isAdmin must be recovered from the JWT payload instead.
    function getStoredUser() {
      let user = {}
      try { user = JSON.parse(localStorage.getItem('user') || '{}') } catch {}
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (user.businessId == null && payload.businessId != null) user.businessId = payload.businessId
          if (user.role == null && payload.role != null) user.role = payload.role
          if (user.isAdmin == null && payload.isAdmin != null) user.isAdmin = payload.isAdmin
          if (user.email == null && payload.email != null) user.email = payload.email
        }
      } catch {}
      return user
    }

    async function load() {
      loading.value = true
      try {
        const user = getStoredUser()
        if (!user.businessId) { loading.value = false; return }
        const { data } = await axios.get(`${API_URL}/business/${user.businessId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } })
        business.value = data

        // ── Permanent rejection → force sign-out ──────────────────────────
        // A hard reject deactivates the owner's account on the server. But
        // GET /business/:id is a PUBLIC route, so it never returns the 401
        // that would normally trigger logout — it just hands back the listing
        // with rejectionKind:'hard'. Detect that here and sign the owner out
        // rather than leaving them on a dashboard whose every authed action
        // will fail. Mirror the server's safety rail: admin/staff accounts are
        // never auto-deactivated, so don't force-logout a privileged viewer.
        const privileged = user.role === 'admin' || user.role === 'staff' || user.isAdmin === true
        if (data?.verification?.rejectionKind === 'hard' && !privileged) {
          loading.value = false
          signOut()
          return
        }

        initEditForm()

        try {
          const { data: a } = await axios.get(`${API_URL}/business/${user.businessId}/analytics`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          })
          const weekLabels = ['W-7', 'W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'This week']
          a.weeklyData = (a.weeklyViews || []).map((views, i) => ({
            label: weekLabels[i] ?? `W${i}`,
            views,
            saves: (a.weeklyClicks || [])[i] ?? 0
          }))
          analytics.value = a
        } catch (err) {
          // If the account was deactivated (e.g. owner banned for any reason),
          // this authed call returns 401 with code 'account_deactivated' — sign
          // them out instead of silently swallowing it.
          if (err?.response?.status === 401 && err?.response?.data?.code === 'account_deactivated') {
            loading.value = false
            signOut()
            return
          }
          console.error('Analytics fetch failed:', err?.response?.status, err?.response?.data)
        }

        // If the user lands directly on the analytics tab (e.g. page refresh),
        // setTab() never fires so we must kick off zone-intel fetch here.
        if (isSignature.value && activeTab.value === 'analytics') {
          fetchZoneIntelligence()
        }
      } catch (err) {
        console.error('Failed to load business:', err)
      } finally {
        loading.value = false
      }
    }

    function hoursDisplayEdit(dayEntry) {
      if (dayEntry.closed) return 'Closed'
      if (dayEntry.open === '00:00' && dayEntry.close === '23:59') return '24h'
      return `${dayEntry.open || '?'} – ${dayEntry.close || '?'}`
    }

    function editSnapshotCurrentDay(dayEntry) {
      if (!dayEntry.closed && dayEntry.open && dayEntry.close &&
          !(dayEntry.open === '00:00' && (dayEntry.close === '23:59' || dayEntry.close === '24:00'))) {
        editHoursLastUsed.value = { open: dayEntry.open, close: dayEntry.close }
      }
    }

    // ── Event schedule helpers ────────────────────────────────────────────────
    //
    //   The owner edits dates/times in the EVENT's timezone (editForm.
    //   eventTimezone, carried in from the stored eventSchedule). We convert
    //   those wall-clock values back to absolute UTC instants here so the
    //   stored value is unambiguous and reads back identically anywhere.
    function buildEditEventSchedulePayload() {
      const f = editForm.value
      const tz = f.eventTimezone || browserTz()
      const startDate = combineDateTimeTz(f.eventStartDate, f.eventStartTime, '00:00', tz)
      // End date falls back to the start date when only an end time is supplied.
      const endDateRaw = f.eventEndDate || (f.eventEndTime ? f.eventStartDate : '')
      const endDate = combineDateTimeTz(endDateRaw, f.eventEndTime, '23:59', tz)
      return {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isRecurring: !!f.eventRecurring,
        // Ship the timezone so the backend keeps it on the listing — it is
        // part of the schedule's identity.
        timezone: tz
      }
    }

    function toggleEditInterest(key) {
      const max = isSignature.value ? 3 : 2
      const idx = editForm.value.interests.indexOf(key)
      if (idx > -1) {
        editForm.value.interests.splice(idx, 1)
      } else {
        if (editForm.value.interests.length >= max) editForm.value.interests.splice(0, 1)
        editForm.value.interests.push(key)
      }
    }

    function toggleEditStyle(key) {
      const max = isSignature.value ? 3 : 2
      const idx = editForm.value.styles.indexOf(key)
      if (idx > -1) {
        editForm.value.styles.splice(idx, 1)
      } else {
        if (editForm.value.styles.length >= max) editForm.value.styles.splice(0, 1)
        editForm.value.styles.push(key)
      }
    }

    function barHeight(val, data, key) {
      const max = Math.max(...data.map(d => d[key] || 0), 1)
      return Math.round(((val || 0) / max) * 100)
    }

    function convPct(val, a) {
      const total = (a.directionClicks || 0) + (a.searchClicks || 0) + (a.phoneClicks || 0) + (a.websiteClicks || 0)
        + (a.instagramClicks || 0) + (a.facebookClicks || 0) + (a.tripadvisorClicks || 0)
      if (!total) return 0
      return Math.round(((val || 0) / total) * 100)
    }

    function sentimentPct(val, a) {
      const total = (a.likes || 0) + (a.dislikes || 0)
      if (!total) return 0
      return Math.round(((val || 0) / total) * 100)
    }

    function signOut() {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      router.push('/auth')
    }

    async function handleSwitchToExploring() {
      isSwitching.value = true
      await new Promise(resolve => setTimeout(resolve, 5000))
      router.push('/chat')
    }

    function closeProfileMenu() { showProfileMenu.value = false }

    onMounted(() => {
      load()
      // Honor ?tab= query (used by the rejection email's "Fix and resubmit"
      // CTA to deep-link straight to the edit tab). Only switch if the
      // requested tab is a real one.
      const requested = route?.query?.tab
      if (requested && tabs.some(t => t.id === requested)) {
        setTab(requested)
      }
    })

    return {
      theme, business, analytics, loading, saving,
      activeTab, tabs, setTab,
      mobileNavOpen, sidebarOpen, showProfileMenu, closeProfileMenu, isDesktop,
      isSwitching, handleSwitchToExploring,
      toggleSidebar, handleOverlayClick, closeMobileSidebar,
      mainCategory, allImages, hasSocialLinks, priceLabel,
      isEvent, today, eventScheduleDisplay,
      listingInterests, listingStyles, pricingLabel,
      performanceScore, scoreBreakdown, zoneSlots, zoneRadiusLabel,
      statusLabel, statusHeadline, statusDetail, statusIcon,
      isSignature, isSpotlight, isPaidTier, canEdit, isHardRejected, isRejectedVerifiedEdit,
      editForm, editErrors, handleUpload, validateEditImageUrl, saveEdits,
      hoursDisplayEdit, toggleEditInterest, toggleEditStyle,
      barHeight, convPct, sentimentPct,
      trend, isToday, capitalize,
      toggleShowEmail, savingShowEmail,
      editHoursDay, editHoursLastUsed, editSnapshotCurrentDay,
      travelerInterestOptions, travelerStyleOptions,
      highlightPlaceholders,
      signOut,
      showSettingsModal, settingsSaved, userSettings, dangerConfirm,
      showLanguageDropdown, languageSearch, languageSearchInput, filteredLanguages,
      getLanguageName, toggleLanguageDropdown, selectLanguage,
      setThemePref, saveSettings, resetSettings,
      openSettings, closeSettings, goToContactUs,
      showDeleteAccountConfirm, cancelDeleteAccount, executeDeleteAccount,
      currentUserEmail,
      // Zone Intelligence
      zoneIntel, zoneIntelLoading, zoneIntelError,
      fetchZoneIntelligence, podiumHeight,
    }
  }
}
</script>



<style scoped>
/* ===== LAYOUT ===== */
.biz-dash { display: flex; height: 100vh; overflow: hidden; }
.biz-dash.night-mode { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 40%, #16213e 100%); color: #c4b0ff; }
.biz-dash.day-mode { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 55%, #efe4cf 100%); color: #3c2a1e; }

/* ===== SIDEBAR — mirrors JinniChat exactly ===== */
.sidebar { width: 280px; display: flex; flex-direction: column; z-index: 10; transition: width 0.3s ease, transform 0.3s ease; flex-shrink: 0; }
.sidebar-collapsed { width: 60px; overflow: hidden; }
.sidebar-collapsed .app-header { padding: 15px 10px; align-items: center }
.sidebar-collapsed .sidebar-header { flex-direction: column; gap: 14px; justify-content: center; align-items: center; padding: 0 0 14px 0 }
.sidebar-collapsed .sidebar-nav { display: none }
.sidebar-collapsed .sidebar-footer { display: none }

/* Sidebar has explicit background — same gradient as root on desktop (seamless),
and opaque on mobile so it covers content when sliding in */
.night-mode .sidebar { background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 40%, #16213e 100%); }
.day-mode .sidebar { background: linear-gradient(180deg, #f9f5eb 0%, #f5edda 55%, #efe4cf 100%) }

/* Brand header */
.app-header { padding: 0 15px }
.app-brand { display: flex; align-items: center; gap: 8px; justify-content: flex-start }
.app-brand-collapsed { display: flex; justify-content: center; align-items: center }
.app-icon { width: 60px; height: 60px; object-fit: contain }
.app-icon-collapsed { width: 55px; height: 55px; object-fit: contain }

.app-name { font-size: 1.6rem; font-weight: 600; color: #FFD700; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; white-space: nowrap; }

/* Collapse button */
.collapse-btn { background: transparent; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; border: none; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.collapse-btn-inline { background: transparent; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: auto; border: none; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.night-mode .collapse-btn, .night-mode .collapse-btn-inline { color: #94a3b8; border: none; background: rgba(255,255,255,0.06); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1); }
.night-mode .collapse-btn:hover, .night-mode .collapse-btn-inline:hover { background: rgba(255,255,255,0.14); box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1); }
.day-mode .collapse-btn, .day-mode .collapse-btn-inline { color: #8b6b3d; border: none; background: rgba(255,255,255,0.45); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.day-mode .collapse-btn:hover, .day-mode .collapse-btn-inline:hover { background: rgba(255,255,255,0.75); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9); }

/* Sidebar sub-header row */
.sidebar-header { padding: 0 16px 3px; display: flex; justify-content: space-between; align-items: center; min-height: 40px; }

/* ===== NAV ITEMS — styled like JinniChat session-item ===== */
.sidebar-nav { flex: 1; overflow-y: auto; padding: 10px; }

.nav-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 8px; border-radius: 8px; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.95rem; font-weight: 500; text-align: left; width: 100%; transition: all 0.2s ease; }
.night-mode .nav-item { color: #94a3b8 }
.day-mode   .nav-item { color: #5a4a42 }

.night-mode .nav-item:hover { background: rgba(255,255,255,0.03); box-shadow: none; }
.day-mode .nav-item:hover { background: rgba(255,255,255,0.5); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }

/* Active state — matches JinniChat session-item.active */
.night-mode .nav-item.active { background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15)); color: #e2e8f0; box-shadow: none; overflow: hidden; }
.night-mode .nav-item.active::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: left 0.5s ease; }
.day-mode .nav-item.active { background: linear-gradient(135deg, rgba(184,115,51,0.35), rgba(205,133,63,0.2)); color: #4a3c2e; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); overflow: hidden; }
.day-mode .nav-item.active::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); transition: left 0.5s ease; }
.day-mode .nav-item.active:hover { background: linear-gradient(135deg, rgba(184,115,51,0.35), rgba(205,133,63,0.2)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6) }
.nav-item.disabled { opacity: 0.4; cursor: not-allowed }
.nav-icon { flex-shrink: 0; display: flex; align-items: center }
.nav-label { flex: 1 }
.nav-lock { margin-left: auto; opacity: 0.5 }

/* ===== PROFILE FOOTER — mirrors JinniChat sidebar-footer ===== */
.switch-mode-wrapper { padding: 5px 15px 0 15px; flex-shrink: 0 }
.switch-mode-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 4px 8px; border-radius: 25px; box-sizing: border-box; min-height: 44px; border: none; cursor: pointer; font-family: inherit; font-size: 1rem; font-weight: 500; transition: all 0.2s ease; text-align: left; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.switch-mode-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0 }
.switch-mode-label { font-size: 1rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.switch-arrow { margin-left: auto; flex-shrink: 0; transition: transform 0.2s ease }
.day-mode .switch-mode-btn { background: rgba(255,255,255,0.5); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); color: #8b6b3d }
.day-mode .switch-mode-btn:hover { background: rgba(255,255,255,0.75); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9) }

.night-mode .switch-mode-btn { background: rgba(255,255,255,0.06); color: #94a3b8; box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1) }
.night-mode .switch-mode-btn:hover { background: rgba(255,255,255,0.14); box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1) }
.sidebar-footer { position: relative; padding: 15px; display: flex; align-items: center; justify-content: center; }
.sidebar-collapsed .sidebar-footer { padding: 0 }

.profile-btn { display: flex; align-items: center; border: none; cursor: pointer; width: 100%; padding: 4px 8px; border-radius: 25px; box-sizing: border-box; min-height: 44px; transition: background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease; background: transparent; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.night-mode .profile-btn { color: #94a3b8; background: rgba(255,255,255,0.06); box-shadow: inset 0 0 0 0.7px rgba(255,255,255,0.1) }
.night-mode .profile-btn:hover { background: rgba(255,255,255,0.08); box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1) }
.night-mode .profile-btn .default-avatar { color: #94a3b8; border: none; background: transparent; box-shadow: none }
.day-mode .profile-btn { background: rgba(255,255,255,0.45); border: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); color: #8b6b3d }
.day-mode .profile-btn:hover { background: rgba(255,255,255,0.75); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9) }
.day-mode .profile-btn .default-avatar { color: #8b6b3d; border: none; background: transparent; box-shadow: none }

.default-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.night-mode .default-avatar { border: 1px solid rgba(191,167,106,0.45); color: #bfa76a }
.day-mode   .default-avatar { border: 1px solid rgba(212,175,55,0.5); color: #8b6b3d }

.profile-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; min-width: 0; }
.profile-name { font-size: 1rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Profile popup menu */
.profile-menu { position: absolute; bottom: 100%; left: 15px; right: 15px; margin-bottom: -8px; border-radius: 12px; overflow: hidden; z-index: 1000; backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); }
.night-mode .profile-menu { background: rgba(30,26,48,0.38); box-shadow: 0 0 1px rgba(0,0,0,0.2), inset 0 0 0 0.7px rgba(255,255,255,0.1) }
.day-mode .profile-menu { background: rgba(255,255,255,0.5); box-shadow: 0 0 1px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.6); }
.profile-expanded { display: flex; align-items: center; gap: 10px; overflow: hidden; min-width: 0; }
.profile-menu-item { width: 100%; padding: 12px 16px; display: flex; align-items: center; gap: 12px; border: none; background: transparent; cursor: pointer; font-size: 0.95rem; font-weight: 500; transition: all 0.2s ease; font-family: inherit; text-align: left; }
.night-mode .profile-menu-item { color: #94a3b8 }
.night-mode .profile-menu-item:hover { background: rgba(139,92,246,0.15) }
.day-mode   .profile-menu-item { color: #3c2a1e }
.day-mode .profile-menu-item:hover { background: rgba(212,175,55,0.1) }
.profile-menu-item:last-child { border-bottom: none }
.profile-menu-item.logout-item { color: #e53e3e }
.night-mode .profile-menu-item.logout-item { color: #ff6b6b }
.night-mode .profile-menu-item.logout-item:hover { background: rgba(255,107,107,0.1) }
.profile-menu-item.logout-item:hover { background: rgba(229,62,62,0.08) }

.profile-menu-enter-active, .profile-menu-leave-active { transition: all 0.2s ease; transform-origin: bottom center }
.profile-menu-enter-from, .profile-menu-leave-to { opacity: 0 }

/* ===== SIDEBAR TIER BADGE (in footer) ===== */
.sb-tier-badge { display: inline-flex; align-items: center; font-size: 0.68rem; font-weight: 700; }
.sb-tier-badge.verified  { color: #4CAF50 }
.sb-tier-badge.spotlight { color: #3b9edd }
.sb-tier-badge.signature { color: #D4AF37 }

/* ===== SIDEBAR HEADER TIER BADGE ===== */
.sidebar-tier-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 25px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.01em; transition: all 0.2s ease; }
.sidebar-tier-badge--icon { padding: 8px; border-radius: 50%; width: 35px; height: 35px; justify-content: center; }
.sidebar-tier-badge.verified { color: #4CAF50; background: rgba(76, 175, 80, 0.12) }
.sidebar-tier-badge.spotlight { color: #3b9edd; background: rgba(59, 158, 221, 0.12) }
.sidebar-tier-badge.signature { color: #D4AF37; background: linear-gradient(45deg, rgba(212, 175, 55, 0.15), rgba(255, 140, 0, 0.12)); box-shadow: 0 0 8px rgba(212, 175, 55, 0.15); }

/* ===== MOBILE header ===== */
.mobile-header { display: none; align-items: center; justify-content: center; padding: env(safe-area-inset-top, 0px) 15px 0; min-height: calc(56px + env(safe-area-inset-top, 0px)); z-index: 1001; position: absolute; top: 0; left: 0; right: 0; pointer-events: none; }
.mobile-header .mobile-menu-btn { pointer-events: auto }
.night-mode .mobile-header { color: #e2e8f0 }
.day-mode   .mobile-header { color: #5c3f2e }

.mobile-nav { position: absolute; left: 15px; top: calc(50% + env(safe-area-inset-top, 0px) / 2); transform: translateY(-50%); z-index: 1001; }
.mobile-new-chat { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); }
.mobile-menu-btn { background: transparent; border: none; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s ease; font-family: inherit; padding: 0; margin: 0; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.night-mode .mobile-nav .mobile-menu-btn { color: #bfa76a; background: rgba(255,255,255,0.06); box-shadow: inset 0 0 0 0.8px rgba(255,255,255,0.1) }
.night-mode .mobile-nav .mobile-menu-btn:hover { background: rgba(255,255,255,0.14); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1) }
.night-mode .mobile-nav .mobile-menu-btn:active { transform: scale(0.92) }
.day-mode .mobile-nav .mobile-menu-btn { color: #5a4a42; background: rgba(255,255,255,0.5); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6) }
.day-mode .mobile-nav .mobile-menu-btn:hover { background: rgba(255,255,255,0.78); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.9) }
.day-mode .mobile-nav .mobile-menu-btn:active { transform: scale(0.92) }
.day-mode .mobile-nav .mobile-menu-btn svg { stroke: #8b6b3d; color: #8b6b3d }

.current-session-title { font-size: 1.2rem; font-weight: 500; flex: 1; text-align: center; margin: 0 50px; }
.night-mode .current-session-title { color: #94a3b8 }
.day-mode   .current-session-title { color: #5c3f2e }

.mobile-tier { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
.mobile-tier.verified  { background: rgba(76,175,80,0.15); color: #4CAF50 }
.mobile-tier.spotlight { background: rgba(59,158,221,0.15); color: #3b9edd }
.mobile-tier.signature { background: rgba(212,175,55,0.15); color: #D4AF37 }

/* Sidebar overlay */
.sidebar-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999; display: block; }

/* When mobile sidebar is open, push dash-main to the right — mirrors JinniChat */
.sidebar.sidebar-open ~ .dash-main { transform: translateX(95vw); position: fixed; width: 100%; height: 100%; pointer-events: none; }
.sidebar.sidebar-open ~ .dash-main .mobile-nav { pointer-events: auto; }

/* ===== MAIN CONTENT ===== */
.dash-main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; position: relative; /* gradient stays pinned — only dash-scroll moves */ transition: transform 0.3s ease; }
.night-mode .dash-main { background: transparent }
.day-mode   .dash-main { background: transparent }

/* Inner scroll layer — content moves, gradient stays */
.dash-scroll { flex: 1; overflow-y: auto; min-height: 0; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column; align-items: center; padding-top: 58px; }

.tab-content { padding: 24px 40px 36px; max-width: 900px; width: 100% }

/* Fixed tab header — mirrors JinniChat .fixed-header + .chat-header exactly */
.dash-fixed-header { position: absolute; top: 0; left: 0; right: 0; z-index: 100; pointer-events: none; }
.night-mode .dash-fixed-header, .night-mode .mobile-header {background:linear-gradient(to bottom,rgba(10,1,24,10) 0%,rgba(10,1,24,1) 1%,rgba(10,1,24,0) 100%)}
.day-mode .dash-fixed-header, .day-mode .mobile-header {background:linear-gradient(to bottom,rgba(249,245,235,80) 0%,rgba(249,245,235,1) 0.01%,rgba(249,245,235,0) 100%)}
.dash-fixed-header::after { content: ''; position: absolute; bottom: -12px; height: 12px; left: 0; right: 0; pointer-events: none; z-index: 99; }
.night-mode .dash-fixed-header::after { background: transparent; }
.day-mode .dash-fixed-header::after { background: transparent; }
.mobile-header::after { content: ''; position: absolute; bottom: -12px; height: 12px; left: 0; right: 0; pointer-events: none; z-index: 99; }
.night-mode .mobile-header::after { background: transparent; }
.day-mode .mobile-header::after { background: transparent; }

.dash-header-inner { max-width: 900px; margin: 0 auto; padding: 15px 20px; display: flex; justify-content: center; align-items: center; gap: 14px; }

.dash-tab-title { font-size: 1.2rem; font-weight: 500; text-align: center; }
.night-mode .dash-tab-title { color: #94a3b8 }
.day-mode   .dash-tab-title { color: #5c3f2e }

.tab-header h1 { display: none }
.tab-title { display: none }

/* Status pill */
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.status-pill.active     { background: rgba(76,175,80,0.15);  color: #4caf50 }
.status-pill.pending    { background: rgba(245,158,11,0.15); color: #f59e0b }
.status-pill.waitlisted { background: rgba(96,165,250,0.15); color: #60a5fa }
.status-pill.frozen     { background: rgba(148,163,184,0.15);color: #94a3b8 }
.status-pill.rejected   { background: rgba(239,68,68,0.15);  color: #ef4444 }
.status-pill.expired    { background: rgba(168,162,158,0.15);color: #a8a29e }

/* Status banner */
.status-banner { display: flex; align-items: center; gap: 16px; border-radius: 14px; padding: 20px 24px; margin-bottom: 20px; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }
.status-banner-icon {width: 25px; height: 25px}
.night-mode .status-banner { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 3px rgba(0,0,0,0.3) }
.day-mode   .status-banner { background: rgba(255,255,255,0.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 3px rgba(120,80,30,0.12) }
.status-banner.s-active     .status-banner-icon { color: #4caf50 }
.status-banner.s-pending    .status-banner-icon { color: #f59e0b }
.status-banner.s-waitlisted .status-banner-icon { color: #60a5fa }
.status-banner.s-frozen     .status-banner-icon { color: #94a3b8 }
.status-banner.s-rejected   .status-banner-icon { color: #ef4444 }
.status-banner.s-expired    .status-banner-icon { color: #a8a29e }
.status-banner-body { flex: 1 }
.status-banner-body strong { display: block; font-size: 1rem; margin-bottom: 4px }
.status-banner-body p { margin: 0; font-size: 0.85rem; opacity: 0.7; line-height: 1.5 }

/* Panel */
.panel { border-radius: 14px; padding: 24px; margin-bottom: 16px; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%) }
.night-mode .panel { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 3px rgba(0,0,0,0.3); }
.day-mode   .panel { background: rgba(255,255,255,0.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 3px rgba(120,80,30,0.12) }

.panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px }
.panel-head h2 { margin: 0; font-size: 1rem; font-weight: 700 }
.panel-sub { font-weight: 400; opacity: 0.5; font-size: 0.82rem; margin-left: 6px }

/* Gallery */
.gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 24px }
.gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 10px }
.gallery-img.featured { grid-column: span 2; grid-row: span 2; aspect-ratio: unset; height: 100% }
.gallery-name-block { display: flex; flex-direction: column; justify-content: center; padding: 14px 16px; border-radius: 10px; gap: 6px; min-width: 0; overflow: hidden; }
.night-mode .gallery-name-block { background: rgba(139,92,246,0.1) }
.day-mode .gallery-name-block { background: rgba(212,175,55,0.1) }

.gallery-name-value { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em; line-height: 1.25; overflow-wrap: normal; word-break: normal; white-space: normal; min-width: 0; }
.no-images-notice { display: flex; align-items: center; gap: 8px; font-size: 0.83rem; opacity: 0.45; font-style: italic; margin-bottom: 16px }

/* Meta grid */
.listing-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px }
.meta-block { display: flex; flex-direction: column; gap: 5px; padding: 14px 16px; border-radius: 12px; overflow: hidden; min-width: 0; }
.meta-block--text { overflow: visible; }
.meta-value--wrap { white-space: normal; word-break: break-word; overflow-wrap: break-word; }
.night-mode .meta-block { background: rgba(255,255,255,0.03) }
.day-mode   .meta-block { background: rgba(212,175,55,0.04) }
.meta-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.night-mode .meta-label { color: #9D7BFF; opacity: 0.75; }
.day-mode   .meta-label { color: #A0522D; opacity: 0.7; }
.meta-value { font-size: 0.9rem; font-weight: 500; line-height: 1.4; }
.night-mode .meta-value { color: #94a3b8; }
.day-mode   .meta-value { color: #2c1810; }
.meta-link { color: #A0522D; opacity: 0.7; font-size: 0.9rem; font-weight: 500; text-decoration: none; }
.night-mode .meta-link {color: #9D7BFF}
.meta-link:hover { text-decoration: underline }
.meta-link--truncate { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

/* Highlights */
.highlights-row { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; padding: 16px; border-radius: 12px; }
.night-mode .highlights-row { background: rgba(212,175,55,0.04) }
.day-mode   .highlights-row { background: rgba(212,175,55,0.05) }
.highlights-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.highlight-chip { padding: 5px 14px; opacity: 0.7; border-radius: 20px; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.01em; }
.night-mode .highlight-chip { background: rgba(157,123,255,0.15); color: #c4b0ff }
.day-mode   .highlight-chip { background: rgba(212,175,55,0.12); color: #8B5E1A }

/* Social links — inline inside meta grid */
.meta-block--full { grid-column: 1 / -1; }
.meta-social-links { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 2px; }
.meta-social-link { display: inline-flex; opacity: 0.7; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 500; text-decoration: none; transition: opacity 0.2s; }
.meta-social-link:hover { opacity: 0.75; text-decoration: underline; text-underline-offset: 3px; }
.night-mode .meta-social-link { color: #c4b0ff; }
.day-mode   .meta-social-link { color: #A0522D; }

/* Opening hours */
.hours-section { margin-top: 12px; padding: 18px; border-radius: 12px; }
.night-mode .hours-section { background: rgba(255,255,255,0.02) }
.day-mode   .hours-section { background: rgba(212,175,55,0.04) }
.hours-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
.night-mode .hours-label { color: #9D7BFF; opacity: 0.75; }
.day-mode   .hours-label { color: #A0522D; opacity: 0.7; }
.hours-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 24px }
.hours-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 5px 8px; border-radius: 6px; }
.night-mode .hours-row.today { color: #c4b0ff; background: rgba(157,123,255,0.15) }
.day-mode   .hours-row.today { color: #8B6914; background: rgba(212,175,55,0.12) }
.day-name { opacity: 0.6 }
.hours-row.today .day-name { opacity: 1 }

/* Zone panel */
.zone-info-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px }
.zone-stat { display: flex; flex-direction: column; gap: 4px }
.zone-stat-value { font-size: 1.3rem; font-weight: 800; color: #D4AF37 }
.zone-stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.45 }
.waitlist-notice { display: flex; align-items: center; gap: 8px; font-size: 0.83rem; padding: 10px 14px; border-radius: 8px; margin-top: 8px; background: rgba(96,165,250,0.1); color: #60a5fa }
.frozen-notice   { display: flex; align-items: center; gap: 8px; font-size: 0.83rem; padding: 10px 14px; border-radius: 8px; margin-top: 8px; background: rgba(148,163,184,0.1); color: #94a3b8 }

/* Upgrade panel */
.night-mode .upgrade-panel { background: rgba(212,175,55,0.04) !important }
.day-mode   .upgrade-panel { background: rgba(212,175,55,0.03) !important }
.upgrade-eyebrow { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #D4AF37; margin-bottom: 8px }
.upgrade-headline { margin: 0 0 8px; font-size: 1.2rem; font-weight: 800 }
.upgrade-body { margin: 0 0 20px; font-size: 0.88rem; opacity: 0.65; line-height: 1.6 }
.upgrade-cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px }
.upgrade-option { border-radius: 12px; padding: 20px; position: relative; }
.night-mode .upgrade-option { background: rgba(255,255,255,0.03); border: 1px solid rgba(157,123,255,0.15) }
.day-mode   .upgrade-option { background: rgba(0,0,0,0.02); border: 1px solid rgba(212,175,55,0.2) }
.night-mode .upgrade-option.featured { background: rgba(212,175,55,0.05) !important }
.day-mode   .upgrade-option.featured { background: rgba(212,175,55,0.06) !important }
.best-value-tag { position: absolute; top: -10px; right: 16px; background: #D4AF37; color: #0a0118; font-size: 0.68rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.06em; }
.upgrade-tier-badge { font-size: 0.8rem; font-weight: 700; margin-bottom: 10px }
.upgrade-tier-badge.spotlight { color: #3b9edd; opacity: 0.9 }
.upgrade-price.spotlight {color: #3b9edd; opacity: 0.8}
.upgrade-tier-badge.signature { color: #D4AF37 }
.upgrade-price { font-size: 2rem; font-weight: 900; color: #D4AF37; margin-bottom: 12px }
.upgrade-price span { font-size: 0.9rem; font-weight: 400; opacity: 0.7 }
.upgrade-features { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-direction: column; gap: 6px }
.upgrade-features li { font-size: 0.83rem; opacity: 0.75; padding-left: 16px; position: relative }
.upgrade-features li::before { content: '✓'; position: absolute; left: 0; color: #D4AF37; font-weight: 700 }
.upgrade-features.spotlight li::before { color: #3b9edd; opacity: 0.8 }
.upgrade-cta { width: 100%; padding: 10px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; font-size: 0.85rem; font-weight: 700; transition: opacity 0.2s; }
.upgrade-cta:hover { opacity: 0.85 }
.spotlight-cta { background: rgba(59,158,221,0.15); color: #3b9edd }
.signature-cta { background: linear-gradient(45deg,#D4AF37,#FF8C00); color: white }

/* Analytics */
.analytics-locked-banner { display: flex; align-items: center; justify-content:center; gap: 50px; border-radius: 14px; padding: 20px 24px; margin-bottom: 20px; opacity: 0.7; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }
.night-mode .analytics-locked-banner { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 3px rgba(0,0,0,0.3) }
.day-mode   .analytics-locked-banner { background: rgba(255,255,255,0.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 3px rgba(120,80,30,0.12) }
.analytics-locked-banner strong { display: block; margin-bottom: 4px }
.analytics-locked-banner p { margin: 0; font-size: 0.85rem; opacity: 0.7 }

.analytics-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px }
.analytics-tile { border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 4px; backdrop-filter: blur(18px) saturate(180%); -webkit-backdrop-filter: blur(18px) saturate(180%); }
.night-mode .analytics-tile { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 3px rgba(0,0,0,0.3) }
.day-mode   .analytics-tile { background: rgba(255,255,255,0.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 3px rgba(120,80,30,0.12) }

.tile-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.tile-icon.views       { background: rgba(96,165,250,0.15);  color: #60a5fa }
.tile-icon.saves       { background: rgba(167,139,250,0.15); color: #a78bfa }
.tile-icon.clicks      { background: rgba(251,146,60,0.15);  color: #fb923c }
.tile-icon.ai-ask      { background: rgba(212,175,55,0.15);  color: #D4AF37 }
.tile-icon.more-images { background: rgba(56,189,248,0.15);  color: #38bdf8 }
.tile-icon.conversions { background: rgba(212,175,55,0.15);  color: #D4AF37 }
.tile-icon.likes       { background: rgba(52,211,153,0.15);  color: #34d399 }
.tile-icon.dislikes    { background: rgba(248,113,113,0.15); color: #f87171 }
.tile-icon.shares      { background: rgba(96,165,250,0.15);  color: #60a5fa }

.tile-value { font-size: 1.6rem; font-weight: 900 }
.tile-label { font-size: 0.72rem; opacity: 0.45; text-transform: uppercase; letter-spacing: 0.05em }
.tile-trend { font-size: 0.75rem; margin-top: 4px; font-weight: 600 }
.tile-trend.up      { color: #4caf50 }
.tile-trend.down    { color: #ef4444 }
.tile-trend.neutral { opacity: 0.4 }

.score-badge { background: rgba(212,175,55,0.15); color: #D4AF37; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; }
.night-mode .score-badge {color: #a78bfa; background: rgba(167,139,250,0.15)}
.score-factors { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px }
.score-factor { display: flex; align-items: center; gap: 12px }
.sf-label { font-size: 0.82rem; width: 160px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sf-bar-wrap { flex: 1; min-width: 40px; height: 6px; border-radius: 3px; overflow: hidden; background: rgba(128,128,128,0.15) }
.sf-bar { height: 100%; border-radius: 3px; background: rgba(157,123,255,0.5); transition: width 0.6s ease }
.night-mode .sf-bar { background: rgba(157,123,255,0.6) }
.day-mode   .sf-bar { background: rgba(160,82,45,0.5) }
.sf-bar.accent { background: #D4AF37 !important }
.sf-pct { font-size: 0.72rem; opacity: 0.45; width: 32px; flex-shrink: 0; text-align: right }
.score-note { margin: 0; font-size: 0.8rem; opacity: 0.45; line-height: 1.6 }
@media (max-width: 480px) {
  .score-factor { flex-wrap: wrap; gap: 6px 8px }
  .sf-label { width: 100%; white-space: normal; overflow: visible; text-overflow: clip; font-size: 0.78rem }
  .sf-bar-wrap { flex: 1; min-width: 0 }
  .sf-pct { width: auto }
}

.revenue-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }
.rev-tile { border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
.night-mode .rev-tile { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03) }
.day-mode   .rev-tile { background: rgba(255,255,255,0.45); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55) }
.rev-label { font-size: 0.75rem; opacity: 0.45; text-transform: uppercase; letter-spacing: 0.05em }
.rev-value { font-size: 1.5rem; font-weight: 800; color: #D4AF37 }
.night-mode .rev-value {color: #a78bfa}
.rev-hint { font-size: 0.72rem; opacity: 0.45; line-height: 1.4; margin-top: 2px }

/* ===== ANALYTICS — missing classes ===== */

/* ===== VERIFIED ANALYTICS — unified card ===== */
.verified-analytics-card { border-radius: 14px; overflow: hidden; margin-bottom: 4px; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }
.night-mode .verified-analytics-card { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 3px rgba(0,0,0,0.3) }
.day-mode   .verified-analytics-card { background: rgba(255,255,255,0.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 3px rgba(120,80,30,0.12) }

.verified-views-row { display: flex; align-items: center; gap: 0; padding: 24px 28px; }

.verified-views-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; min-width: 120px; }

.verified-views-divider { width: 1px; align-self: stretch; margin: 0 28px; flex-shrink: 0; }
.night-mode .verified-views-divider { background: rgba(157,123,255,0.18) }
.day-mode   .verified-views-divider { background: rgba(212,175,55,0.2) }

.verified-card-divider { height: 1px; margin: 0 28px; }
.night-mode .verified-card-divider { background: rgba(157,123,255,0.1) }
.day-mode   .verified-card-divider { background: rgba(212,175,55,0.12) }

/* legacy teaser classes still used */
.teaser-eyebrow { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; opacity: 0.45; }
.teaser-big-number { font-size: 3rem; font-weight: 900; line-height: 1; color: #D4AF37; }
.teaser-big-label { font-size: 0.78rem; opacity: 0.55; text-align: center; max-width: 90px; line-height: 1.4; }
.teaser-upgrade-block { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.teaser-upgrade-block p { margin: 0; font-size: 0.83rem; opacity: 0.65; line-height: 1.5 }
.teaser-lock-icon { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 0.95rem; font-weight: 700; }
.night-mode .teaser-lock-icon { color: #c4b0ff }
.day-mode   .teaser-lock-icon { color: #8B6914 }

/* Locked analytics preview: blurred tiles + overlay */
.locked-analytics-preview { position: relative; border-radius: 0 0 14px 14px; overflow: hidden; padding: 16px 28px 20px; }
.night-mode .locked-analytics-preview { background: rgba(20,13,45,0.5) }
.day-mode   .locked-analytics-preview { background: rgba(0,0,0,0.02) }

/* Blurred placeholder tiles */
.analytics-tiles-blurred { filter: blur(7px); pointer-events: none; user-select: none; opacity: 0.6; transform: scale(1.01); }

.locked-analytics-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.82rem; font-weight: 700; pointer-events: none; letter-spacing: 0.01em; }
.night-mode .locked-analytics-overlay { background: rgba(15, 10, 35, 0.5); color: #c4b0ff; backdrop-filter: blur(3px); }
.day-mode .locked-analytics-overlay { background: rgba(255, 251, 240, 0.55); color: #8B6914; backdrop-filter: blur(3px); }

/* Weekly bar chart */
.chart-legend { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; opacity: 0.6; }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.views-dot { background: #60a5fa }
.saves-dot { background: #a78bfa }

.weekly-chart { display: flex; align-items: flex-end; gap: 6px; height: 100px; padding-top: 8px; }
.chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.chart-bars { flex: 1; width: 100%; display: flex; align-items: flex-end; gap: 3px; }
.chart-bar { flex: 1; border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.5s ease; }
.views-bar { background: rgba(96,165,250,0.55) }
.saves-bar { background: rgba(167,139,250,0.55) }
.night-mode .views-bar { background: rgba(96,165,250,0.6) }
.night-mode .saves-bar { background: rgba(167,139,250,0.6) }
.day-mode   .views-bar { background: rgba(96,165,250,0.5) }
.day-mode   .saves-bar { background: rgba(167,139,250,0.5) }
.chart-day-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.4; }

/* Conversion breakdown */
.conversion-breakdown { display: flex; flex-direction: column; gap: 14px }
.conv-item { display: flex; align-items: center; gap: 14px }
.conv-icon { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.directions-icon  { background: rgba(52,168,83,0.15);   color: #34a853 }
.phone-icon       { background: rgba(52,211,153,0.15);  color: #34d399 }
.website-icon     { background: rgba(251,191,36,0.15);  color: #fbbf24 }
.search-icon      { background: rgba(96,165,250,0.15);  color: #60a5fa }
.instagram-icon   { background: rgba(232,121,249,0.15); color: #e879f9 }
.facebook-icon    { background: rgba(59,130,246,0.15);  color: #3b82f6 }
.tripadvisor-icon { background: rgba(52,168,83,0.15);   color: #34a853 }
.sentiment-bar-wrap { display: flex; height: 10px; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.08); margin: 12px 0 8px }
.sentiment-bar-likes    { background: #34d399; transition: width 0.4s ease }
.sentiment-bar-dislikes { background: #f87171; transition: width 0.4s ease }
.sentiment-legend { display: flex; gap: 16px; font-size: 0.78rem; opacity: 0.75 }
.sentiment-legend-item { display: flex; align-items: center; gap: 4px }
.conv-info { flex: 1; display: flex; flex-direction: column; gap: 5px }
.conv-label { font-size: 0.82rem; opacity: 0.75 }
.conv-bar-wrap { height: 6px; border-radius: 3px; overflow: hidden; background: rgba(128,128,128,0.15); }
.conv-bar { height: 100%; border-radius: 3px; transition: width 0.6s ease; background: linear-gradient(90deg, #D4AF37, #FF8C00); }
.conv-count { font-size: 1rem; font-weight: 800; text-align: right; color: #D4AF37 }
.night-mode .conv-count { color: #a78bfa }

/* ===== EDIT TAB — mirrors OnboardingPage exactly ===== */

/* Wrapper: same max-width, centered, gap between cards */
.edit-onboarding-form { display: flex; flex-direction: column; gap: 0 }

/* Reuse onboarding .preference-section / .card directly */
.edit-tab-content .preference-section { margin-bottom: 25px }
.edit-tab-content .preference-section.active { opacity: 1 }

.edit-tab-content .card { border-radius: 12px; padding: 25px; }
.night-mode .edit-tab-content .card { background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 3px rgba(0,0,0,0.3); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }
.day-mode .edit-tab-content .card { background: rgba(255,255,255,0.55); border: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 3px rgba(120,80,30,0.12); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }

/* Section headers — identical to onboarding .section-header */
.edit-tab-content .section-header { margin-bottom: 20px }
.edit-tab-content .section-header h3 { font-size: 1.1rem; margin: 0 0 6px; font-weight: 600 }
.night-mode .edit-tab-content .section-header h3 { color: #c4b0ff }
.day-mode   .edit-tab-content .section-header h3 { color: #A0522D }
.edit-tab-content .section-description { font-size: 0.9rem; margin: 0; opacity: 0.8 }
.night-mode .edit-tab-content .section-description { color: #94a3b8 }
.day-mode   .edit-tab-content .section-description { color: #5c3f2e }
.section-sub-count { font-size: 0.82rem; font-weight: 400; opacity: 0.5; margin-left: 6px }

/* Input fields inside edit cards */
.edit-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px }
.edit-field { display: flex; flex-direction: column; gap: 6px }
.edit-field-full { grid-column: 1 / -1 }
.edit-label { font-size: 0.78rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
.night-mode .edit-label { color: #94a3b8 }
.day-mode   .edit-label { color: #5c3f2e }
.edit-char-count { font-weight: 400; opacity: 0.55; font-size: 0.72rem }

.edit-readonly-field { display: flex; align-items: center; gap: 9px; border-radius: 8px; padding: 10px 14px; font-size: 0.9rem; cursor: default; user-select: none; }
.night-mode .edit-readonly-field { background: rgba(255,255,255,0.03); color: #94a3b8 }
.day-mode   .edit-readonly-field { background: rgba(0,0,0,0.03);  color: #7a6352 }

.edit-readonly-value { font-size: 0.9rem; }

.edit-readonly-hint { font-size: 0.72rem; opacity: 0.5; margin-top: -2px; }

.edit-input { border-radius: 8px; padding: 10px 14px; font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color 0.15s, box-shadow 0.15s; width: 100%; box-sizing: border-box; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.night-mode .edit-input { background: rgba(255,255,255,0.06); border: none; color: #cdd5e2; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); }
.night-mode .edit-input:focus { background: rgba(255,255,255,0.1); box-shadow: inset 0 0 0 1px rgba(157,123,255,0.5); }
.night-mode .edit-input::placeholder { color: rgba(226,232,240,0.4) }
.day-mode .edit-input { background: rgba(255,255,255,0.5); border: none; color: #2c1810; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); }
.day-mode .edit-input:focus { background: rgba(255,255,255,0.78); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.55); }
.day-mode .edit-input::placeholder { color: rgba(92,74,66,0.5) }
.edit-textarea { resize: vertical; min-height: 120px }

/* Interest / style — pill chips matching Onboarding type-chip exactly */
.edit-tab-content .type-grid { display: flex; flex-wrap: wrap; gap: 8px }
.edit-tab-content .type-chip { padding: 7px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1px solid; user-select: none; display: flex; align-items: center; gap: 5px; }
.edit-tab-content .type-chip.disabled { opacity: 0.4; cursor: default }
.edit-tab-content .type-chip.disabled:hover { background: inherit; border-color: inherit }
.night-mode .edit-tab-content .type-chip { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); color: #cdd5e2 }
.night-mode .edit-tab-content .type-chip:hover:not(.disabled):not(.selected) { background: rgba(157,123,255,0.15); border-color: rgba(157,123,255,0.55) }
.night-mode .edit-tab-content .type-chip.selected { background: linear-gradient(45deg,#D4AF37,#FF8C00); color: white; border-color: transparent }
.day-mode .edit-tab-content .type-chip { background: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.65); color: #3c2a1e }
.day-mode .edit-tab-content .type-chip:hover:not(.disabled):not(.selected) { background: rgba(212,175,55,0.1) }
.day-mode .edit-tab-content .type-chip.selected { background: linear-gradient(45deg,#D4AF37,#FF8C00); color: white; border-color: transparent }
/* Divider between Interests and Styles inside unified card */
.edit-section-divider { border: none; border-top: 1px solid; margin: 0 }
.night-mode .edit-section-divider { border-color: rgba(157,123,255,0.12) }
.day-mode   .edit-section-divider { border-color: rgba(212,175,55,0.15) }

/* Input error state */
.edit-input-error { border-color: #e53e3e !important }

/* Prefix/suffix input wrappers — mirrors onboarding input-with-prefix */
.edit-input-prefix-wrap { display: flex; align-items: center; border-radius: 8px; overflow: hidden; border: 1px solid; }
.night-mode .edit-input-prefix-wrap { background: rgba(255,255,255,0.06); border: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1) }
.night-mode .edit-input-prefix-wrap.focus { background: rgba(255,255,255,0.1); border: none; box-shadow: inset 0 0 0 1px rgba(157,123,255,0.5) }
.day-mode   .edit-input-prefix-wrap { background: rgba(255,255,255,0.5); border: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6) }
.edit-input-prefix-error { border-color: #e53e3e !important }
.edit-input-prefix, .edit-input-suffix { padding: 10px 12px; font-size: 0.9rem; font-weight: 400; opacity: 0.6; flex-shrink: 0; min-width: 44px; display: flex; align-items: center; justify-content: center; }
.night-mode .edit-input-prefix, .night-mode .edit-input-suffix { background: rgba(157,123,255,0.1); color: #94a3b8 }
.day-mode   .edit-input-prefix, .day-mode   .edit-input-suffix { background: rgba(212,175,55,0.1); color: #5c3f2e }
.edit-input-inner { border: none !important; border-radius: 0 !important; flex: 1; box-shadow: none !important; min-width: 0; background: transparent; }
.night-mode .edit-input-inner { background: transparent; color: #cdd5e2 }
.night-mode .edit-input-inner.focus { background: transparent }
.day-mode   .edit-input-inner { color: #3c2a1e }

/* Price mode / currency chips — pill style matching onboarding */
.edit-price-chip { padding: 7px 14px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; border: 1px solid; user-select: none; }
.night-mode .edit-price-chip { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); color: #cdd5e2 }
.night-mode .edit-price-chip:hover { background: rgba(157,123,255,0.12) }
.night-mode .edit-price-chip.selected { background: linear-gradient(45deg,#D4AF37,#FF8C00); color: white; border-color: transparent }
.day-mode .edit-price-chip { background: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.65); color: #3c2a1e }
.day-mode .edit-price-chip:hover { background: rgba(212,175,55,0.1) }
.day-mode .edit-price-chip.selected { background: linear-gradient(45deg,#D4AF37,#FF8C00); color: white; border-color: transparent }

/* Price mode chips row */
.edit-price-mode-chips { display: flex; flex-wrap: wrap; gap: 8px }

/* Min/Max price row */
.edit-price-minmax { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.edit-price-minmax .edit-input-prefix-wrap { flex: 1; min-width: 160px }
.edit-price-dash { font-weight: 700; font-size: 1.2rem; opacity: 0.5; flex-shrink: 0 }

/* field-error matches onboarding */
.field-error { font-size: 0.8rem; color: #e53e3e; display: block }

/* Locked section — signature-only features */
.locked-section { position: relative }
.locked-overlay { position: absolute; inset: 0; border-radius: 12px; z-index: 2; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(1px); }
.night-mode .locked-overlay { background: rgba(10,1,24,0.5) }
.day-mode   .locked-overlay { background: rgba(249,245,235,0.65) }
.locked-message { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 500; opacity: 0.85; }
.night-mode .locked-message { color: #94a3b8 }
.day-mode   .locked-message { color: #5c3f2e }
.dimmed { opacity: 0.25; pointer-events: none }

/* Image slot error highlight */
.image-edit-slot-error { border-color: rgba(229,62,62,0.6) !important }

/* Budget expand animation */
.budget-expand-enter-active, .budget-expand-leave-active { transition: all 0.3s ease; overflow: hidden }
.budget-expand-enter-from, .budget-expand-leave-to { opacity: 0; max-height: 0 }
.budget-expand-enter-to, .budget-expand-leave-from { opacity: 1; max-height: 400px }

/* Budget toggle button */
.edit-tab-content .budget-toggle-btn { color: white; border: none; padding: 12px 24px; border-radius: 20px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; font-size: 0.95rem; font-family: inherit; }
.night-mode .edit-tab-content .budget-toggle-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #e2e8f0; }
.night-mode .edit-tab-content .budget-toggle-btn:hover { background: rgba(157,123,255,0.12) }
.day-mode .edit-tab-content .budget-toggle-btn { background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.65); color: #3c2a1e; }
.day-mode .edit-tab-content .budget-toggle-btn:hover { background: rgba(212,175,55,0.1) }

/* Opening Hours — exact copy of Onboarding hours CSS */
.hours-chips { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 4px }
@media (max-width: 600px) { .hours-chips { grid-template-columns: repeat(4, 1fr) } }
.edit-tab-content .hours-chip { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border-radius: 10px; border: none; cursor: pointer; transition: all 0.18s ease; background: rgba(157,123,255,0.04); user-select: none }
.edit-tab-content .hours-chip:hover { background: rgba(157,123,255,0.1) }
.edit-tab-content .hours-chip--active {  background: rgba(157,123,255,0.15) !important }
.edit-tab-content .hours-chip--closed { opacity: 0.4 }
.edit-tab-content .hours-chip--error { border-color: rgba(229,62,62,0.6) !important }
.hours-chip-day { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; opacity: 0.75 }
.hours-chip-time { font-size: 0.62rem; opacity: 0.5; text-align: center; line-height: 1.3 }
.edit-tab-content .hours-edit-panel { margin-top: 14px; border-radius: 12px; background: rgba(157,123,255,0.07); overflow: hidden }
.hours-panel-inner { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px }
.hours-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px }
.hours-panel-title { font-size: 1rem; font-weight: 600 }
.hours-status-pills { display: flex; border-radius: 20px; overflow: hidden; border: 1px solid rgba(157,123,255,0.3) }
.hours-pill { padding: 5px 14px; font-size: 0.78rem; font-family: inherit; font-weight: 500; border: none; cursor: pointer; background: transparent; color: inherit; opacity: 0.5; transition: all 0.15s }
.hours-pill--active { background: rgba(157,123,255,0.2); opacity: 1; font-weight: 600 }
.hours-pill--close.hours-pill--active { background: rgba(229,62,62,0.15); color: #e53e3e }
.day-mode .edit-tab-content .hours-status-pills { border-color: rgba(212,175,55,0.35) }
.day-mode .edit-tab-content .hours-pill--active { background: rgba(212,175,55,0.15) }
.day-mode .edit-tab-content .hours-pill--close.hours-pill--active { background: rgba(229,62,62,0.1) }
.hours-time-row { display: flex; align-items: flex-end; gap: 8px }
.hours-time-block { display: flex; flex-direction: column; gap: 5px; flex: 1 }
@media (max-width: 480px) { .hours-time-row { flex-direction: column; gap: 10px } .hours-time-block { width: 100% } }
.hours-time-label { font-size: 0.72rem; opacity: 0.6; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; display: block; margin-bottom: 5px }
.hours-time-input { width: 100%; padding: 9px 12px; border-radius: 8px; font-size: 0.9rem; font-family: inherit; background: rgba(255,255,255,0.06); border: none; color: inherit; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box }
.hours-time-input:focus { outline: none;}
.hours-time-input.error { border-color: #e53e3e }
.hours-last-btn { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-family: inherit; cursor: pointer; border: 1px dashed rgba(157,123,255,0.4); background: rgba(157,123,255,0.07); color: inherit; opacity: 0.75; transition: all 0.15s; align-self: flex-start }
.hours-last-btn:hover { opacity: 1; background: rgba(157,123,255,0.15); border-color: rgba(157,123,255,0.6) }
.day-mode .hours-last-btn { border-color: rgba(212,175,55,0.4); background: rgba(212,175,55,0.06); color: #3c2a1e }
.day-mode .hours-last-btn:hover { background: rgba(212,175,55,0.15); border-color: rgba(212,175,55,0.6) }
.hours-panel-enter-active, .hours-panel-leave-active { transition: all 0.2s ease }
.hours-panel-enter-from, .hours-panel-leave-to { opacity: 0; transform: translateY(-6px) }
.day-mode .edit-tab-content .hours-chip { background: rgba(212,175,55,0.04) }
.day-mode .edit-tab-content .hours-chip:hover { background: rgba(212,175,55,0.1) }
.day-mode .edit-tab-content .hours-chip--active { background: rgba(212,175,55,0.2) !important }
.day-mode .edit-tab-content .hours-edit-panel { background: rgba(212,175,55,0.06) }
.day-mode .hours-time-input { background: rgba(255,255,255,0.5); color: #3c2a1e; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6) }

/* Images grid */
.image-edit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px }
.image-edit-slot { border-radius: 10px; overflow: hidden; aspect-ratio: 4/3; position: relative }
.night-mode .image-edit-slot { background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.25) }
.day-mode   .image-edit-slot { background: rgba(255,255,255,0.4); border: 1px dashed rgba(212,175,55,0.45) }
.image-edit-preview { width: 100%; height: 100%; position: relative }
.image-edit-preview img { width: 100%; height: 100%; object-fit: cover }
.remove-img-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.image-edit-empty { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px; }
.image-edit-empty svg { opacity: 0.3 }
.img-url-input { width: 100%; border: none; background: transparent; font-size: 0.7rem; text-align: center; font-family: inherit; outline: none; opacity: 0.5 }
.night-mode .img-url-input { color: #e2e8f0 }
.day-mode   .img-url-input { color: #2c1810 }
.upload-label { font-size: 0.68rem; opacity: 0.5; cursor: pointer; text-decoration: underline }
.upload-label:hover { opacity: 0.8 }

/* Highlights */
.highlights-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px }
.highlight-row { display: flex; gap: 8px; align-items: center }
.highlight-row input { flex: 1; padding: 10px 14px; border-radius: 8px; font-size: 0.9rem; font-family: inherit; outline: none }
.highlight-row input:disabled { opacity: 0.4 }
.highlight-row input.error { border-color: #ef4444 !important }
.remove-highlight-btn { background: none; border: none; cursor: pointer; border-radius: 6px; opacity: 0.5; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; }
.remove-highlight-btn:hover { opacity: 1 }
.add-highlight-btn { background: none; border: 1px dashed; border-radius: 8px; padding: 10px; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.2s; opacity: 0.7 }
.add-highlight-btn:hover { opacity: 1 }

/* Submit row — magic-button style matching onboarding */
.edit-submit-row {display: flex; gap: 10px}
.magic-button {padding: 10px 14px; border: none; border-radius: 20px; font-size: 0.85rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(45deg, #D4AF37, #FF8C00); color: white}
.magic-button:disabled { opacity: 0.7; cursor: not-allowed }
.night-mode .magic-button:hover { box-shadow: 0 0 6px rgba(255,140,0,0.45) }
.day-mode   .magic-button {box-shadow: 0 0 3px rgba(212,175,55,0.7)}
.day-mode   .magic-button:hover { box-shadow: 0 0 9px rgba(212,175,55,0.7) }
.btn-loading { display: flex; align-items: center; gap: 8px }
.edit-cancel-btn { padding: 10px 15px !important; border: none; border-radius: 20px; cursor: pointer; font-family: inherit; font-size: 0.85rem; padding: 8px; opacity: 0.5; transition: opacity 0.2s; text-align: center }
.edit-cancel-btn:hover { opacity: 0.7 }
.night-mode .edit-cancel-btn { color: #e2e8f0; background: rgba(139,92,246,0.1); opacity: 0.9 }
.night-mode .edit-cancel-btn:hover {box-shadow: 0 0 3px rgba(139,92,246,0.3) }
.day-mode   .edit-cancel-btn { box-shadow: 0 0 3px rgba(139,69,19,0.4); background: rgba(255,255,255,0.28); color: #3c2a1e }
.day-mode .edit-cancel-btn:hover {background: #f8f4e6; box-shadow: 0 0 6px rgba(139, 69, 19, 0.4)}
.spinner { animation: spin 1s linear infinite }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

/* Responsive */
@media (max-width: 768px) { .edit-fields-grid { grid-template-columns: 1fr } .edit-field-full { grid-column: 1 } .edit-price-minmax { flex-direction: column; align-items: stretch } .edit-price-dash { display: none } .image-edit-grid { grid-template-columns: repeat(2, 1fr) } .edit-tab-content .type-grid { gap: 6px } }
@media (max-width: 900px) { .image-edit-grid { grid-template-columns: repeat(3, 1fr) } }

/* ===== END EDIT TAB ===== */

.locked-body { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center }
.locked-body svg { opacity: 0.3 }
.locked-body h3 { margin: 0; font-size: 1rem }
.locked-body p { margin: 0; font-size: 0.87rem; opacity: 0.6; max-width: 360px; line-height: 1.6 }
.locked-panel--permanent .locked-body svg { opacity: 0.5; color: #ef4444 }
.locked-panel--permanent .locked-body h3 { color: #ef4444 }
.locked-body .rejection-reason { background: rgba(239,68,68,0.08); border-radius: 8px; padding: 10px 14px; opacity: 0.95; color: inherit }
.locked-body .rejection-reason em { font-style: italic; font-weight: 600; margin-right: 4px }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px }
.form-field { display: flex; flex-direction: column; gap: 6px }
.email-overview-row { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; margin-top: 1px; }
.meta-label-row { display: flex; align-items: center; gap: 8px; }
.email-vis-toggle { display: inline-flex; align-items: center; gap: 5px; border: none; border-radius: 20px; padding: 3px 8px 3px 6px; font-family: inherit; font-size: 0.68rem; opacity: 0.7; font-weight: 600; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.night-mode .email-vis-toggle { background: rgba(157,123,255,0.12); color: #9D7BFF; border: 1px solid rgba(157,123,255,0.25); }
.night-mode .email-vis-toggle:hover:not(:disabled) { background: rgba(157,123,255,0.2); }
.day-mode .email-vis-toggle { background: rgba(160,82,45,0.08); color: #A0522D }
.day-mode .email-vis-toggle:hover:not(:disabled) { background: rgba(160,82,45,0.14) }
.email-vis-toggle:disabled { cursor: not-allowed; opacity: 0.5; }
.form-field label { font-size: 0.78rem; font-weight: 600; opacity: 0.55; display: flex; justify-content: space-between }
.char-count { font-weight: 400; opacity: 0.6 }
.form-field input, .form-field textarea { border-radius: 8px; padding: 9px 12px; font-family: inherit; font-size: 0.88rem; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
.night-mode .form-field input, .night-mode .form-field textarea { background: rgba(255,255,255,0.06); border: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1); color: #e2e8f0; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.night-mode .form-field input:focus, .night-mode .form-field textarea:focus { border-color: #9D7BFF; box-shadow: 0 0 0 3px rgba(157,123,255,0.15); }
.day-mode .form-field input, .day-mode .form-field textarea { background: rgba(255,255,255,0.5); border: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6); color: #2c1810; backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); }
.day-mode .form-field input:focus, .day-mode .form-field textarea:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,0.2); }
.form-field textarea { resize: vertical; min-height: 72px }

.image-edit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px }
.image-edit-slot { border-radius: 10px; overflow: hidden; aspect-ratio: 4/3; position: relative }
.night-mode .image-edit-slot { background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2) }
.day-mode   .image-edit-slot { background: rgba(255,255,255,0.4); border: 1px dashed rgba(212,175,55,0.4) }
.image-edit-preview { width: 100%; height: 100%; position: relative }
.image-edit-preview img { width: 100%; height: 100%; object-fit: cover }
.remove-img-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.image-edit-empty { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px }
.image-edit-empty svg { opacity: 0.3 }
.img-url-input { width: 100%; border: none; background: transparent; font-size: 0.7rem; text-align: center; font-family: inherit; outline: none; opacity: 0.5 }
.night-mode .img-url-input { color: #e2e8f0 }
.day-mode   .img-url-input { color: #2c1810 }
.upload-label { font-size: 0.68rem; opacity: 0.5; cursor: pointer; text-decoration: underline }
.upload-label:hover { opacity: 0.8 }

/* Highlight input theming */
.night-mode .highlight-row input { background: rgba(255,255,255,0.06); border: none; color: #cdd5e2; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1) }
.night-mode .highlight-row input:focus { background: rgba(255,255,255,0.1); box-shadow: inset 0 0 0 1px rgba(157,123,255,0.5); }
.night-mode .highlight-row input::placeholder { color: rgba(226,232,240,0.4) }
.night-mode .add-highlight-btn { border-color: rgba(157,123,255,0.3); color: #94a3b8 }
.night-mode .add-highlight-btn:hover { background: rgba(157,123,255,0.1) }
.night-mode .remove-highlight-btn { color: #94a3b8 }
.day-mode .highlight-row input { background: rgba(255,255,255,0.5); border: none; color: #3c2a1e; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6) }
.day-mode .highlight-row input:focus { background: rgba(255,255,255,0.78); box-shadow: inset 0 0 0 1px rgba(212,175,55,0.55) }
.day-mode .highlight-row input::placeholder { color: rgba(92,74,66,0.5) }
.day-mode .add-highlight-btn { border-color: rgba(212,175,55,0.4); color: #5c3f2e }
.day-mode .add-highlight-btn:hover { background: rgba(212,175,55,0.1) }
.day-mode .remove-highlight-btn { color: #5c3f2e }

.form-actions { display: flex; align-items: center; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid }
.night-mode .form-actions { border-color: rgba(157,123,255,0.12) }
.day-mode   .form-actions { border-color: rgba(212,175,55,0.15) }
.cancel-btn { background: none; border: none; font-family: inherit; font-size: 0.85rem; cursor: pointer; opacity: 0.5; padding: 10px 16px; }
.cancel-btn:hover { opacity: 1 }
.night-mode .cancel-btn { color: #e2e8f0 }
.day-mode   .cancel-btn { color: #2c1810 }

/* Shared */
.cta-btn { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(45deg,#D4AF37,#FF8C00); color: white; border: none; border-radius: 20px; padding: 7px 14px; font-family: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.cta-btn:hover { opacity: 0.9 }
.cta-btn:disabled { opacity: 0.5; cursor: not-allowed }
.cta-btn.small { padding: 7px 14px; font-size: 0.8rem }
.edit-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.82rem; font-weight: 600; color: #D4AF37; }
.edit-btn:hover { text-decoration: underline }

/* States */
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: 60vh; text-align: center; padding: 40px; }
.loading-state p, .empty-state p { margin: 0; opacity: 0.5; font-size: 0.9rem }
.empty-icon { opacity: 0.25 }
.empty-state h2 { margin: 0; font-size: 1.2rem; opacity: 0.6 }

.loading-ring { width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent; border-top-color: #D4AF37; animation: spin 0.8s linear infinite; }

.empty-analytics { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; opacity: 0.3; text-align: center }
.empty-analytics p { margin: 0; font-size: 0.9rem }

.teaser-message { display: flex; align-items: center; gap: 8px; font-size: 0.83rem; opacity: 0.6; margin-bottom: 20px; padding: 10px 14px; border-radius: 8px; border: 1px dashed rgba(212,175,55,0.3); }

.spinner { animation: spin 1s linear infinite }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) { .analytics-tiles { grid-template-columns: repeat(2, 1fr) } .listing-meta-grid { grid-template-columns: 1fr } .zone-info-row { grid-template-columns: repeat(2, 1fr) } .upgrade-cards-row { grid-template-columns: 1fr } .image-edit-grid { grid-template-columns: repeat(3, 1fr) } .gallery { grid-template-columns: repeat(3, 1fr) } .gallery-img.featured { grid-column: span 2; grid-row: span 1 } .form-grid { grid-template-columns: 1fr } .revenue-tiles { grid-template-columns: 1fr } .hours-grid { grid-template-columns: 1fr } }

@media (max-width: 768px) { /* Sidebar: fixed off-screen, slides in — sidebar-collapsed has no meaning on mobile */ .sidebar { height: 100%; width: 80vw; position: fixed; left: 0; top: 0; bottom: 0; z-index: 1000; transform: translateX(-100%); overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } .sidebar:not(.sidebar-open) { transform: translateX(-100%) } .sidebar.sidebar-open { transform: translateX(0) } /* Reset any collapsed-state overrides so mobile always shows full sidebar */ .sidebar.sidebar-collapsed { width: 80vw; overflow: visible } .sidebar.sidebar-collapsed .app-header { padding: 15px 15px 0 15px } .sidebar.sidebar-collapsed .sidebar-header { justify-content: space-between; padding: 10px 16px 6px 16px } .sidebar.sidebar-collapsed .sidebar-nav { display: block } .sidebar.sidebar-collapsed .sidebar-footer { display: flex } .sidebar-overlay { z-index: 999 } .mobile-header { display: flex } .dash-fixed-header { display: none } .dash-scroll { padding-top: calc(56px + env(safe-area-inset-top, 0px)) } .mobile-nav, .mobile-new-chat { z-index: 1001 !important; position: absolute } .tab-content { padding: 20px 18px } .analytics-tiles { grid-template-columns: 1fr 1fr } .image-edit-grid { grid-template-columns: repeat(2, 1fr) } .gallery { grid-template-columns: repeat(2, 1fr) } .gallery-img.featured { grid-column: span 2; grid-row: span 2; aspect-ratio: unset; height: 100% } }
@supports (-webkit-touch-callout: none) { .biz-dash { position: fixed; width: 100%; height: 100%; overflow: hidden } .dash-scroll { overflow-y: scroll; -webkit-overflow-scrolling: touch; transform: translate3d(0,0,0) } }

/* ===== MATCH TAGS (interests + styles) ===== */
.match-tags-row { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; padding: 18px; border-radius: 12px; }
.night-mode .match-tags-row { background: rgba(255,255,255,0.02) }
.day-mode   .match-tags-row { background: rgba(212,175,55,0.04) }
.match-tags-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap }
.match-tags-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; min-width: 96px; flex-shrink: 0; }
.night-mode .match-tags-label { color: #9D7BFF; opacity: 0.75; }
.day-mode   .match-tags-label { color: #A0522D; opacity: 0.7; }
.match-chips { display: flex; gap: 6px; flex-wrap: wrap }
.match-chip { font-size: 0.78rem; opacity:0.7; padding: 5px 13px; border-radius: 20px; font-weight: 600; letter-spacing: 0.01em; }
.night-mode .interest-chip-view { background: rgba(157,123,255,0.15); color: #c4b0ff }
.day-mode   .interest-chip-view { background: rgba(212,175,55,0.12); color: #8B6914 }
.night-mode .style-chip-view { background: rgba(157,123,255,0.15); color: #c4b0ff }
.day-mode   .style-chip-view { background: rgba(212,175,55,0.12); color: #8B6914 }

/* Hidden Gem badge inline with category */
.hidden-gem-badge { display: inline-block; margin-left: 8px; font-size: 0.75rem; font-weight: 700; color: #D4AF37; }

/* ===== SCROLLBAR — mirrors JinniChat exactly ===== */
.biz-dash ::-webkit-scrollbar {width: 8px;height: 8px}
.biz-dash ::-webkit-scrollbar-track {background: transparent}
.biz-dash ::-webkit-scrollbar-thumb {border-radius: 4px;background: rgba(128, 128, 128, 0.5)}
.biz-dash ::-webkit-scrollbar-thumb:hover {background: rgba(128, 128, 128, 0.8)}
.biz-dash.night-mode ::-webkit-scrollbar-thumb {background: rgba(192, 132, 252, 0.1)}
.biz-dash.night-mode ::-webkit-scrollbar-thumb:hover {background: rgba(192, 132, 252, 0.3)}
.biz-dash.day-mode ::-webkit-scrollbar-thumb {background: rgba(160, 82, 45, 0.3)}
.biz-dash.day-mode ::-webkit-scrollbar-thumb:hover {background: rgba(160, 82, 45, 0.5)}
.settings-content.night .settings-body::-webkit-scrollbar {width: 8px;height: 8px}
.settings-content.night .settings-body::-webkit-scrollbar-track {background: transparent}
.settings-content.night .settings-body::-webkit-scrollbar-thumb {border-radius: 4px;background: rgba(192, 132, 252, 0.1)}
.settings-content.night .settings-body::-webkit-scrollbar-thumb:hover {background: rgba(192, 132, 252, 0.3)}
.settings-content.day .settings-body::-webkit-scrollbar {width: 8px;height: 8px}
.settings-content.day .settings-body::-webkit-scrollbar-track {background: transparent}
.settings-content.day .settings-body::-webkit-scrollbar-thumb {border-radius: 4px;background: rgba(160, 82, 45, 0.3)}
.settings-content.day .settings-body::-webkit-scrollbar-thumb:hover {background: rgba(160, 82, 45, 0.5)}
.dropdown-list {scrollbar-width: none; -ms-overflow-style: none}
.dropdown-list::-webkit-scrollbar {display: none; width: 0 !important; height: 0 !important}

/* ===== SETTINGS MODAL ===== */
/* modal-header + close-btn scoped here since BusinessDashboard uses scoped styles */
.settings-modal .modal-content{border-radius:15px;width:90%;max-width:500px;overflow:hidden}
.settings-modal .modal-header{display:flex;justify-content:space-between;align-items:center;padding:12px 15px 10px 20px}
.settings-modal .modal-header h3{margin:0;font-size:1.25rem;font-weight:600;background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.settings-modal .close-btn{border:none;color:#aaa;padding:0;width:34px;height:34px;font-size:1.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;border-radius:10px;backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);transition:background 0.18s ease;}
.expandable-selector{position:relative;width:100%;transition:all 0.3s ease}
.expandable-selector.expanded{z-index:100}
.selector-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;border:none;background:transparent;cursor:pointer;transition:all 0.2s ease;font-family:inherit;font-size:14px}
.selector-trigger:disabled{opacity:0.5;cursor:not-allowed}
.selector-trigger svg{flex-shrink:0;transition:transform 0.2s ease}
.selector-trigger svg.rotated{transform:rotate(180deg)}
.current-selection{display:flex;align-items:center;gap:8px;flex:1;text-align:left}
.current-selection .flag{font-size:18px;flex-shrink:0}
.selector-dropdown-inline{width:100%;border-radius:8px;overflow:hidden;margin-top:8px;max-height:280px;display:flex;flex-direction:column;border:1px solid}
.dropdown-search{padding:10px 12px;border:none;border-bottom:1px solid;font-size:14px;font-family:inherit;outline:none;flex-shrink:0}
.dropdown-list{overflow-y:auto;max-height:240px;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}
.dropdown-list::-webkit-scrollbar{display:none;width:0 !important;height:0 !important}
.dropdown-item{display:flex;align-items:center;padding:10px 12px;cursor:pointer;transition:all 0.2s ease;gap:10px}
.dropdown-item .flag{font-size:18px;flex-shrink:0}
.dropdown-item .item-name{flex:1;font-size:14px}
.dropdown-item .item-native{font-size:12px;opacity:0.7;margin-left:8px}
.dropdown-item .checkmark{flex-shrink:0;color:#10B981}
.expand-enter-active{transition:all 0.3s cubic-bezier(0.4,0,0.2,1);overflow:hidden}
.expand-leave-active{transition:all 0.2s cubic-bezier(0.4,0,1,1);overflow:hidden}
.expand-enter-from,.expand-leave-to{max-height:0;opacity:0;margin-top:0}
.expand-enter-to{max-height:300px;opacity:1;margin-top:8px}

.settings-content.night .selector-trigger{background:#241845;color:#A0AEC0}
.settings-content.night .selector-trigger:hover:not(:disabled){background:#2a1d4a}
.settings-content.night .selector-dropdown-inline{background:#241845;border-color:rgba(139,92,246,0.2)}
.settings-content.night .dropdown-search{background:#1e1438;color:#A0AEC0;border-bottom-color:rgba(139,92,246,0.2)}
.settings-content.night .dropdown-item{color:#A0AEC0}
.settings-content.night .dropdown-item:hover{background:rgba(139,92,246,0.1)}
.settings-content.night .dropdown-item.selected{background:rgba(139,92,246,0.2)}
.settings-content.day .selector-trigger{background:#f9f5eb;color:#3c2a1e}
.settings-content.day .selector-trigger:hover:not(:disabled){background:#fdf9f0}
.settings-content.day .selector-dropdown-inline{background:#ffffff;border-color:rgba(212,175,55,0.2)}
.settings-content.day .dropdown-search{background:#f9f5eb;color:#3c2a1e;border-bottom-color:rgba(212,175,55,0.2)}
.settings-content.day .dropdown-item{color:#3c2a1e}
.settings-content.day .dropdown-item:hover{background:rgba(212,175,55,0.1)}
.settings-content.day .dropdown-item.selected{background:rgba(212,175,55,0.2)}
/* Settings Modal */
.settings-modal{position:fixed;inset:0;background:rgba(0,0,0,0.2);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;animation:fadeIn 0.2s ease;overflow:hidden}
.settings-content{max-width:600px;width:100%;max-height:85vh;display:flex;flex-direction:column;border-radius:16px;animation:slideUp 0.3s ease;overflow:hidden}
.settings-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:12px 24px 24px 24px;-webkit-overflow-scrolling:touch}
.reset-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;background:transparent;border:transparent;border-radius:25px;font-size:14px;font-weight:500;cursor:pointer;margin:0 auto}
.settings-section{margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid rgba(128,128,128,0.15)}
.settings-section:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.settings-section h4{margin:0 0 18px 0;font-size:18px;font-weight:600;letter-spacing:-0.02em}
.settings-description{font-size:13px;opacity:0.9;margin:12px 0;line-height:1.6}
.setting-item{margin-bottom:24px}
.setting-item:last-child{margin-bottom:0}
.setting-item>label{display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:500;margin-bottom:10px;gap:12px}
.setting-value{font-size:13px;opacity:0.8;font-weight:600;letter-spacing:0.02em}
.slider-container{width:100%;padding:4px 0}
.setting-slider{width:100%;height:7px;border-radius:4px;background:rgba(128,128,128,0.15);outline:none;-webkit-appearance:none;appearance:none;cursor:pointer;transition:background 0.2s ease}
.setting-slider:hover{background:rgba(128,128,128,0.2)}
.setting-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#D4AF37;cursor:pointer;transition:all 0.2s ease;box-shadow:0 0 4px rgba(0,0,0,0.2)}
.setting-slider::-webkit-slider-thumb:hover{transform:scale(1.15);box-shadow:0 0 0 4px rgba(212,175,55,0.15),0 2px 6px rgba(0,0,0,0.3)}
.setting-slider::-webkit-slider-thumb:active{transform:scale(1.05)}
.setting-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#D4AF37;cursor:pointer;border:none;transition:all 0.2s ease;box-shadow:0 0 4px rgba(0,0,0,0.2)}
.setting-slider::-moz-range-thumb:hover{transform:scale(1.15);box-shadow:0 0 0 4px rgba(212,175,55,0.15),0 2px 6px rgba(0,0,0,0.3)}
.setting-slider::-moz-range-thumb:active{transform:scale(1.05)}
.slider-labels{display:flex;justify-content:space-between;margin-top:10px;font-size:11px;opacity:0.7;font-weight:500}
.setting-toggle{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:16px;border-radius:10px;background:rgba(128,128,128,0.05);transition:background 0.2s ease}
.setting-toggle:hover{background:rgba(128,128,128,0.08)}
.toggle-label{flex:1}
.toggle-label>span{display:block;font-size:14px;font-weight:500;margin-bottom:5px}
.setting-help{font-size:12px;opacity:0.8;margin:0;line-height:1.5}
.toggle-switch{position:relative;display:inline-block;width:52px;height:28px;flex-shrink:0}
.toggle-switch input{opacity:0;width:0;height:0}
.toggle-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:rgba(128,128,128,0.25);transition:0.3s ease;border-radius:28px}
.toggle-slider:before{position:absolute;content:"";height:22px;width:22px;left:3px;bottom:3px;background-color:white;transition:0.3s ease;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.2)}
input:checked+.toggle-slider{background-color:#D4AF37}
input:checked+.toggle-slider:before{transform:translateX(24px)}
input:focus+.toggle-slider{box-shadow:0 0 0 3px rgba(212,175,55,0.15)}
.settings-saved-indicator{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;padding:12px 20px;background:rgba(76,175,80,0.95);box-shadow:0 0 20px rgba(76,175,80,0.4);border-radius:50px;color:white;font-size:14px;font-weight:500;animation:slideInUp 0.3s ease,fadeOut 0.3s ease 1.7s forwards;z-index:10001}
.settings-saved-indicator svg{flex-shrink:0}
@keyframes slideInUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes fadeOut{to{opacity:0;transform:translate(-50%,-10px)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.theme-buttons{display:flex;gap:8px;margin-top:6px}
.theme-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 12px;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s ease;background:transparent;color:inherit;font-family:inherit}
.theme-btn svg{flex-shrink:0;width:16px;height:16px}
.theme-btn.active{border-color:currentColor;box-shadow:0 0 0 2px rgba(currentColor,0.1)}
.gps-active-placeholder{display:flex;align-items:center;gap:15px;padding:20px;border-radius:10px;margin-top:10px}

.settings-content.night{background:rgba(30,20,56,0.85);color:#e2e8f0;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:0 20px 60px rgba(0,0,0,0.5),inset 0 0 0 1px rgba(255,255,255,0.10)}
.settings-content .close-btn{background:rgba(127,127,127,0.14);color:#94a3b8;border-radius:6px;padding:5px;font-size:1.5rem;backdrop-filter:blur(8px) saturate(160%);-webkit-backdrop-filter:blur(8px) saturate(160%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12);transition:background 0.18s ease}
.settings-content.night .close-btn:hover{background:rgba(255,255,255,0.16)}
.settings-content.night .settings-section{border-bottom-color:rgba(139,92,246,0.15)}
.settings-content.night .settings-section h4{color:#c084fc}
.settings-content.night .settings-description{color:#94a3b8}
.settings-content.night .setting-slider{background:rgba(139,92,246,0.15)}
.settings-content.night .setting-slider:hover{background:rgba(139,92,246,0.2)}
.settings-content.night .setting-slider::-webkit-slider-thumb{background:#c084fc}
.settings-content.night .setting-slider::-webkit-slider-thumb:hover{box-shadow:0 0 0 4px rgba(192,132,252,0.15),0 2px 6px rgba(192,132,252,0.4)}
.settings-content.night .setting-slider::-moz-range-thumb{background:#c084fc}
.settings-content.night .setting-slider::-moz-range-thumb:hover{box-shadow:0 0 0 4px rgba(192,132,252,0.15),0 2px 6px rgba(192,132,252,0.4)}
.settings-content.night .setting-toggle{background:rgba(139,92,246,0.05)}
.settings-content.night .setting-toggle:hover{background:rgba(139,92,246,0.1)}
.settings-content.night .toggle-slider{background-color:rgba(139,92,246,0.2)}
.settings-content.night input:checked+.toggle-slider{background-color:#c084fc}
.settings-content.night input:focus+.toggle-slider{box-shadow:0 0 0 3px rgba(192,132,252,0.15)}
.settings-content.night .setting-item>label,.settings-content.night .toggle-label>span{color:#A0AEC0}
.settings-content.night .setting-value,.settings-content.night .setting-help,.settings-content.night .slider-labels{color:#94a3b8}
.settings-content.night .theme-btn{background:rgba(139,92,246,0.05);color:rgba(226,232,240,0.8)}
.settings-content.night .theme-btn:hover{background:rgba(139,92,246,0.1)}
.settings-content.night .theme-btn.active{background:rgba(139,92,246,0.2);color:#c084fc;box-shadow:0 0 8px rgba(192,132,252,0.2)}
.settings-content.night .day-btn.active{background:rgba(251,191,36,0.15);color:#fbbf24}
.settings-content.night .night-btn.active{background:rgba(192,132,252,0.2);color:#c084fc}
.settings-content.night .system-btn.active{background:rgba(192,132,252,0.2);color:#c084fc}
.settings-content.night .reset-btn{background:rgba(192,132,252,0.2);border:#c084fc;color:#c084fc}
.settings-content.night .reset-btn:hover{box-shadow:0 0 6px rgba(192,132,252,0.2)}
.settings-content.night .gps-active-placeholder{background:rgba(139,92,246,0.08);border:1px dashed rgba(139,92,246,0.3)}

.settings-content.day{background:rgba(255,255,255,0.85);color:#3c2a1e;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18),inset 0 0 0 1px rgba(255,255,255,0.6)}
.settings-content.day .settings-section{border-bottom-color:rgba(212,175,55,0.15)}
.settings-content.day .close-btn:hover{background:rgba(0,0,0,0.08)}
.settings-content.day .settings-section h4{color:#A0522D}
.settings-content.day .settings-description{color:rgba(92,74,66,0.7)}
.settings-content.day .setting-slider{background:rgba(212,175,55,0.15)}
.settings-content.day .setting-slider:hover{background:rgba(212,175,55,0.2)}
.settings-content.day .setting-slider::-webkit-slider-thumb{background:#A0522D}
.settings-content.day .setting-slider::-webkit-slider-thumb:hover{box-shadow:0 0 0 4px rgba(160,82,45,0.15),0 0 6px rgba(160,82,45,0.4)}
.settings-content.day .setting-slider::-moz-range-thumb{background:#A0522D}
.settings-content.day .setting-slider::-moz-range-thumb:hover{box-shadow:0 0 0 4px rgba(160,82,45,0.15),0 0 6px rgba(160,82,45,0.4)}
.settings-content.day .setting-toggle{background:rgba(212,175,55,0.05)}
.settings-content.day .setting-toggle:hover{background:rgba(212,175,55,0.1)}
.settings-content.day .toggle-slider{background-color:rgba(212,175,55,0.2)}
.settings-content.day input:checked+.toggle-slider{background-color:#A0522D}
.settings-content.day input:focus+.toggle-slider{box-shadow:0 0 0 3px rgba(160,82,45,0.15)}
.settings-content.day .setting-item>label,.settings-content.day .toggle-label>span{color:#3c2a1e}
.settings-content.day .setting-value,.settings-content.day .setting-help,.settings-content.day .slider-labels{color:rgba(92,74,66,0.7)}
.settings-content.day .theme-btn{background:rgba(212,175,55,0.05);color:rgba(92,74,66,0.8)}
.settings-content.day .theme-btn:hover{background:rgba(212,175,55,0.1)}
.settings-content.day .theme-btn.active{background:rgba(212,175,55,0.2);color:#A0522D;box-shadow:0 0 8px rgba(160,82,45,0.2)}
.settings-content.day .day-btn.active{background:rgba(212,175,55,0.25);color:#A0522D;box-shadow:0 0 8px rgba(212,175,55,0.2)}
.settings-content.day .night-btn.active{background:rgba(31,41,55,0.1);color:#374151;box-shadow:0 0 8px rgba(55,65,81,0.2)}
.settings-content.day .system-btn.active{background:rgba(212,175,55,0.25);color:#A0522D}
.settings-content.day .reset-btn{background:rgba(212,175,55,0.25);border:#d4af37;color:#A0522D}
.settings-content.day .reset-btn:hover{box-shadow:0 0 6px rgba(212,175,55,0.2)}
.settings-content.day .gps-active-placeholder{background:rgba(212,175,55,0.08);border:1px dashed rgba(212,175,55,0.3)}

.danger-zone h4{color:#ef4444;font-size:18px;font-weight:600}
.danger-item{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:10px 0}
.danger-item-info{flex:1}
.danger-item-info label{display:block;font-weight:500;font-size:15px;margin-bottom:5px;color:#A0AEC0}
.danger-description{display:block;font-size:13px;opacity:0.7;line-height:1.5}
.danger-link{color:#ef4444;text-decoration:underline;text-decoration-color:rgba(239,68,68,0.5);text-underline-offset:3px;cursor:pointer;transition:all 0.2s ease}
.danger-link:hover{color:#dc2626;text-decoration-color:#dc2626;text-shadow:0 0 6px rgba(239,68,68,0.3)}
.delete-account-link:hover{text-shadow:0 0 6px rgba(220,38,38,0.4)}
.danger-confirm-box{background:rgba(239,68,68,0.08);border-radius:10px;padding:16px 18px;margin:4px 0 14px;animation:dangerFadeIn 0.2s ease}
.danger-confirm-box p{font-size:14px;color:#A0AEC0;margin:0 0 12px;line-height:1.5}
.danger-confirm-box strong{color:#ef4444}
.danger-confirm-actions{display:flex;gap:10px}
.danger-btn-yes,.danger-btn-no{border:none;border-radius:6px;padding:7px 16px;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.2s,opacity 0.2s}
.danger-btn-yes{background:#ef4444;color:#fff;opacity:0.8}
.danger-btn-yes:hover{background:#dc2626;opacity:0.9}
.danger-btn-yes:disabled{opacity:0.35;cursor:not-allowed}
.danger-btn-no{background:rgba(255,255,255,0.08);color:#94a3b8}
.danger-btn-no:hover{background:rgba(255,255,255,0.14)}
.danger-type-input{width:100%;padding:8px 12px;border-radius:6px;border:1px solid rgba(239,68,68,0.3);background:rgba(0,0,0,0.25);color:#ef4444;font-size:14px;font-weight:600;letter-spacing:2px;outline:none;margin-bottom:12px;box-sizing:border-box}
.danger-type-input:focus{box-shadow:0 0 0 1px rgba(239,68,68,0.2)}
.danger-type-input::placeholder{color:rgba(239,68,68,0.35)}
.danger-link--active{opacity:0.4;pointer-events:none;text-shadow:none}
@keyframes dangerFadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.settings-content.day .danger-zone h4{color:#A0522D}
.settings-content.day .danger-item-info label{color:#3c2a1e}
.settings-content.day .danger-description{color:rgba(92,74,66,0.75)}
.settings-content.day .danger-confirm-box{background:rgba(239,68,68,0.06)}
.settings-content.day .danger-confirm-box p{color:#3c2a1e}
.settings-content.day .danger-confirm-box strong{color:#b91c1c}
.settings-content.day .danger-btn-no{background:rgba(92,74,66,0.08);color:rgba(92,74,66,0.75)}
.settings-content.day .danger-btn-no:hover{background:rgba(92,74,66,0.14)}
.settings-content.day .danger-type-input{background:rgba(255,255,255,0.9);border-color:rgba(185,28,28,0.35);color:#b91c1c}
.settings-content.day .danger-type-input:focus{border-color:#b91c1c;box-shadow:0 0 0 1px rgba(185,28,28,0.15)}
.settings-content.day .danger-type-input::placeholder{color:rgba(185,28,28,0.35)}
/* ── Glacier settings: buttons, surfaces & inputs ─────────────────────── */
.settings-content .close-btn{width:34px;height:34px;border-radius:10px;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);transition:background 0.18s ease,transform 0.15s ease}
.settings-content .close-btn svg{width:18px;height:18px}
.settings-content .close-btn:active{transform:scale(0.9)}
.settings-content .selector-trigger{backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.settings-content .selector-dropdown-inline{backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%)}
.settings-content .dropdown-search{backdrop-filter:blur(8px) saturate(160%);-webkit-backdrop-filter:blur(8px) saturate(160%)}
.settings-content .theme-btn{backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.settings-content .theme-btn.active{box-shadow:none}
.settings-content .setting-toggle{backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.settings-content .reset-btn{backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);font-weight:600;transition:background 0.18s ease,transform 0.15s ease}
.settings-content .reset-btn:active{transform:scale(0.97)}
.settings-content .danger-btn-yes,.settings-content .danger-btn-no{backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);border-radius:10px;padding:8px 18px;font-weight:600;transition:all 0.18s ease}
.settings-content .danger-confirm-box{box-shadow:inset 0 0 0 1px rgba(239,68,68,0.18)}
.settings-content .danger-type-input{backdrop-filter:blur(10px) saturate(160%);-webkit-backdrop-filter:blur(10px) saturate(160%);border-radius:10px}
/* NIGHT */
.settings-content.night .close-btn{background:rgba(255,255,255,0.08);color:#cbd5e1;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.14)}
.settings-content.night .close-btn:hover{background:rgba(255,255,255,0.18)}
.settings-content.night .selector-trigger{background:rgba(255,255,255,0.06);color:#cdd5e2;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.settings-content.night .selector-trigger:hover:not(:disabled){background:rgba(255,255,255,0.12)}
.settings-content.night .selector-dropdown-inline{background:rgba(36,24,69,0.6);border-color:rgba(255,255,255,0.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08),0 14px 34px rgba(0,0,0,0.45)}
.settings-content.night .dropdown-search{background:rgba(255,255,255,0.05);color:#cdd5e2;border-bottom-color:rgba(255,255,255,0.1)}
.settings-content.night .theme-btn{background:rgba(255,255,255,0.06);color:rgba(226,232,240,0.8);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.settings-content.night .theme-btn:hover{background:rgba(255,255,255,0.12)}
.settings-content.night .theme-btn.active{background:rgba(192,132,252,0.22);color:#d8b4fe;box-shadow:inset 0 0 0 1px rgba(192,132,252,0.5)}
.settings-content.night .day-btn.active{background:rgba(251,191,36,0.2);color:#fcd34d;box-shadow:inset 0 0 0 1px rgba(251,191,36,0.5)}
.settings-content.night .night-btn.active{background:rgba(192,132,252,0.22);color:#d8b4fe;box-shadow:inset 0 0 0 1px rgba(192,132,252,0.5)}
.settings-content.night .system-btn.active{background:rgba(192,132,252,0.22);color:#d8b4fe;box-shadow:inset 0 0 0 1px rgba(192,132,252,0.5)}
.settings-content.night .setting-toggle{background:rgba(255,255,255,0.05);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08)}
.settings-content.night .setting-toggle:hover{background:rgba(255,255,255,0.09)}
.settings-content.night .reset-btn{background:rgba(255,255,255,0.06);color:#d8b4fe;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12)}
.settings-content.night .reset-btn:hover{background:rgba(255,255,255,0.12)}
.settings-content.night .danger-btn-yes{background:rgba(239,68,68,0.82);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.2)}
.settings-content.night .danger-btn-yes:hover{background:rgba(220,38,38,0.95)}
.settings-content.night .danger-btn-no{background:rgba(255,255,255,0.07);color:#cbd5e1;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12)}
.settings-content.night .danger-btn-no:hover{background:rgba(255,255,255,0.14)}
.settings-content.night .danger-type-input{background:rgba(255,255,255,0.06);border-color:rgba(239,68,68,0.35);box-shadow:inset 0 0 0 1px rgba(239,68,68,0.22)}
/* DAY */
.settings-content.day .close-btn{background:rgba(255,255,255,0.6);color:#8b6b3d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.8)}
.settings-content.day .close-btn:hover{background:rgba(255,255,255,0.9)}
.settings-content.day .selector-trigger{background:rgba(255,255,255,0.55);color:#3c2a1e;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.65)}
.settings-content.day .selector-trigger:hover:not(:disabled){background:rgba(255,255,255,0.82)}
.settings-content.day .selector-dropdown-inline{background:rgba(255,255,255,0.72);border-color:rgba(255,255,255,0.7);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.7),0 14px 34px rgba(120,80,30,0.18)}
.settings-content.day .dropdown-search{background:rgba(255,255,255,0.5);color:#3c2a1e;border-bottom-color:rgba(120,80,30,0.15)}
.settings-content.day .theme-btn{background:rgba(255,255,255,0.5);color:rgba(92,74,66,0.85);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.65)}
.settings-content.day .theme-btn:hover{background:rgba(255,255,255,0.78)}
.settings-content.day .theme-btn.active{background:rgba(212,175,55,0.28);color:#8a5a1e;box-shadow:inset 0 0 0 1px rgba(212,175,55,0.6)}
.settings-content.day .day-btn.active{background:rgba(212,175,55,0.3);color:#8a5a1e;box-shadow:inset 0 0 0 1px rgba(212,175,55,0.6)}
.settings-content.day .night-btn.active{background:rgba(55,65,81,0.16);color:#374151;box-shadow:inset 0 0 0 1px rgba(55,65,81,0.4)}
.settings-content.day .system-btn.active{background:rgba(212,175,55,0.3);color:#8a5a1e;box-shadow:inset 0 0 0 1px rgba(212,175,55,0.6)}
.settings-content.day .setting-toggle{background:rgba(255,255,255,0.45);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.settings-content.day .setting-toggle:hover{background:rgba(255,255,255,0.72)}
.settings-content.day .reset-btn{background:rgba(255,255,255,0.5);color:#8a5a1e;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.65)}
.settings-content.day .reset-btn:hover{background:rgba(255,255,255,0.78)}
.settings-content.day .danger-btn-yes{background:rgba(220,38,38,0.88);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.28)}
.settings-content.day .danger-btn-yes:hover{background:rgba(185,28,28,0.95)}
.settings-content.day .danger-btn-no{background:rgba(255,255,255,0.5);color:#6b5840;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.65)}
.settings-content.day .danger-btn-no:hover{background:rgba(255,255,255,0.78)}
.settings-content.day .danger-type-input{background:rgba(255,255,255,0.75);border-color:rgba(185,28,28,0.35);box-shadow:inset 0 0 0 1px rgba(185,28,28,0.18)}
/* Saved indicator → frosted green glass */
.settings-saved-indicator{background:rgba(34,197,94,0.82);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.25),0 0 3px rgba(0,0,0,0.3)}
/* ── Pricing display (overview) ── */
.pricing-display{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:4px}
.pricing-badge--free{display:inline-flex;align-items:center;gap:5px;border-radius:20px;font-size:13px;font-weight:500;color:#10B981}
.pricing-range-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.pricing-amount{font-size:16px;opacity: 0.7; font-weight:600;letter-spacing:-0.02em}
.pricing-range-label{font-size:13px;opacity:0.6;font-weight:400}
.pricing-range-dash{font-size:14px;opacity:0.5}
.pricing-symbol{font-size:16px;font-weight:700;letter-spacing:0.05em}
.biz-dash.day-mode .pricing-badge--free{background:rgba(16,185,129,0.1);color:#059669}
@media (max-width:768px){.theme-buttons{gap:6px}.theme-btn{padding:10px;font-size:14px}.theme-btn svg{width:18px;height:18px}.settings-modal{padding:0}.settings-body{padding:20px 16px}.settings-section{margin-bottom:28px;padding-bottom:20px}.settings-section h4{font-size:16px}.settings-saved-indicator{bottom:16px;left:16px;right:16px;transform:none;width:calc(100% - 32px);justify-content:center}}

/* ═══════════════════════════════════════════════════════════
   ZONE INTELLIGENCE STYLES
   ═══════════════════════════════════════════════════════════ */
.zi-badge{font-size:0.72rem;font-weight:600;letter-spacing:0.04em;padding:3px 8px;border-radius:20px;background:linear-gradient(45deg,rgba(212,175,55,0.18),rgba(255,140,0,0.18));border:1px solid rgba(212,175,55,0.35);color:#D4AF37;text-transform:uppercase}
.zi-loading,.zi-error{display:flex;align-items:center;gap:10px;padding:20px 0 8px;font-size:0.85rem;opacity:0.6}
.zi-top-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}
.zi-rank-card{display:flex;flex-direction:column;align-items:center;gap:20px;padding:16px 12px;border-radius:12px;text-align:center;backdrop-filter:blur(16px) saturate(170%);-webkit-backdrop-filter:blur(16px) saturate(170%)}
.night-mode .zi-rank-card{background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03)}
.day-mode .zi-rank-card{background:rgba(255,255,255,0.45); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55)}
.zi-rank-podium{display:flex;flex-direction:column;align-items:center;gap:2px}
.zi-rank-number{font-size:2.4rem;font-weight:700;line-height:1;background:linear-gradient(135deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:transparent}
.zi-rank-label{font-size:0.75rem;opacity:0.55;margin-bottom:10px}
.zi-rank-sub{font-size:0.72rem;opacity:0.45;margin-top:6px}
.zi-podium-bars{display:flex;align-items:flex-end;gap:5px}
.zi-podium-bar{width:18px;border-radius:4px 4px 0 0;position:relative;min-height:8px;transition:height 0.5s cubic-bezier(.4,0,.2,1)}
.night-mode .zi-podium-bar{background:rgba(255,255,255,0.1)}
.day-mode .zi-podium-bar{background:rgba(0,0,0,0.08)}
.zi-podium-bar--you{background:linear-gradient(180deg,#D4AF37,#FF8C00) !important}
.zi-podium-you-label{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:0.6rem;font-weight:600;color:#D4AF37;white-space:nowrap}
.zi-share-card{display:flex;flex-direction:column;gap:12px;align-items:center;padding:16px 12px;border-radius:12px;text-align:center;backdrop-filter:blur(16px) saturate(170%);-webkit-backdrop-filter:blur(16px) saturate(170%)}
.night-mode .zi-share-card{background:rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03)}
.day-mode .zi-share-card{background:rgba(255,255,255,0.45); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55)}
.zi-share-label{font-size:0.75rem;opacity:0.55}
.zi-donut-pct{font-size:15px;font-weight:700;fill:#D4AF37;font-family:inherit}
.zi-donut-sub{font-size:9px;fill:currentColor;opacity:0.45;font-family:inherit}
.zi-share-delta{display:flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:600;padding:3px 8px;border-radius:20px}
.zi-delta--up{color:#4caf50}
.zi-delta--down{color:#f97316}
.zi-delta--flat{color:rgba(255,255,255,0.5)}
.zi-section{margin-top:22px}
.zi-section-title{display:flex;align-items:center;gap:6px;font-size:0.78rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;opacity:0.55;margin-bottom:12px}
/* competitor cards */
.zi-competitors{display:flex;flex-direction:column;gap:10px}
.zi-comp-card{border:0.5px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px}
.night-mode .zi-comp-card{background:rgba(255,255,255,0.03)}
.day-mode .zi-comp-card{background:rgba(0,0,0,0.02);border-color:rgba(0,0,0,0.08)}
/* header row: avatar + name block + tier badge */
.zi-comp-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.zi-comp-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;text-transform:uppercase}
.zi-comp-avatar--signature{background:rgba(212,175,55,0.18);color:#D4AF37}
.zi-comp-avatar--spotlight{background:rgba(59,130,246,0.15);color:#3b82f6}
.zi-comp-avatar--verified{background:rgba(16,185,129,0.15);color:#10b981}
.zi-comp-name-block{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.zi-comp-name{font-size:0.88rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zi-comp-city{font-size:0.7rem;opacity:0.45}
.zi-comp-tier{display:flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:600;padding:3px 7px;border-radius:6px;white-space:nowrap;margin-left:auto;flex-shrink:0}
.zi-comp-tier--signature{background:rgba(212,175,55,0.15);color:#D4AF37}
.zi-comp-tier--spotlight{background:rgba(59,130,246,0.12);color:#3b82f6}
.zi-comp-tier--verified{background:rgba(16,185,129,0.12);color:#10b981}
/* metric bars */
.zi-comp-metrics{display:flex;flex-direction:column;gap:6px}
.zi-comp-metric-row{display:grid;grid-template-columns:80px 1fr 40px;align-items:center;gap:8px}
.zi-comp-metric-label{font-size:0.7rem;opacity:0.5;white-space:nowrap}
.zi-comp-range-label{font-size:0.7rem;opacity:0.55;text-align:right;white-space:nowrap}
.zi-comp-bar-wrap{position:relative;height:6px;border-radius:3px;overflow:visible}
.night-mode .zi-comp-bar-wrap{background:rgba(255,255,255,0.07)}
.day-mode .zi-comp-bar-wrap{background:rgba(0,0,0,0.07)}
.zi-comp-bar-fill{position:absolute;top:0;height:100%;border-radius:3px;background:rgba(229,62,62,0.5)}
.zi-comp-bar-fill--traffic{background:rgba(249,115,22,0.45)}
.zi-your-needle{position:absolute;top:-3px;width:2.5px;height:12px;border-radius:2px;background:#D4AF37;transform:translateX(-50%);box-shadow:0 0 4px #D4AF3799}
/* card footer: overlap pill + displacement note */
.zi-comp-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px;padding-top:8px;border-top:0.5px solid rgba(255,255,255,0.07)}
.day-mode .zi-comp-footer{border-top-color:rgba(0,0,0,0.07)}
.zi-comp-overlap{display:flex;align-items:center;gap:4px;font-size:0.72rem;padding:3px 7px;border-radius:6px;white-space:nowrap;font-weight:600;flex-shrink:0}
.zi-overlap--warn{background:rgba(249,115,22,0.1);color:#f97316}
.zi-overlap--low{background:rgba(76,175,80,0.1);color:#4caf50}
.zi-comp-displacement{font-size:0.7rem;opacity:0.45;text-align:right}
.zi-overlap-note{margin-top:10px;font-size:0.76rem;opacity:0.55;display:flex;align-items:flex-start;gap:5px;line-height:1.5}
.zi-overlap-note svg{margin-top:2px;flex-shrink:0}
.zi-opportunity-list{display:flex;flex-direction:column;gap:10px}
.zi-opportunity-row{display:grid;grid-template-columns:70px 1fr;grid-template-rows:auto auto;gap:4px 10px;align-items:center;padding:10px 12px;border-radius:10px}
.night-mode .zi-opportunity-row{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)}
.day-mode .zi-opportunity-row{background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.07)}
.zi-opp-day{font-size:0.82rem;font-weight:600;grid-row:span 2;align-self:center}
.zi-opp-detail{display:flex;flex-direction:column;gap:2px;font-size:0.73rem;opacity:0.65}
.zi-opp-traffic strong,.zi-opp-share strong{opacity:1;font-weight:600}
.zi-opp-share-gap{opacity:0.65;font-size:0.68rem}
.zi-opp-bar-wrap{position:relative;height:5px;border-radius:3px;grid-column:2}
.night-mode .zi-opp-bar-wrap{background:rgba(255,255,255,0.07)}
.day-mode .zi-opp-bar-wrap{background:rgba(0,0,0,0.07)}
.zi-opp-bar-fill{position:absolute;left:0;top:0;height:100%;border-radius:3px;background:linear-gradient(90deg,#D4AF37,#FF8C00)}
.zi-opp-fair-line{position:absolute;top:-3px;width:1.5px;height:11px;background:rgba(255,255,255,0.35);transform:translateX(-50%)}
.day-mode .zi-opp-fair-line{background:rgba(0,0,0,0.2)}
.zi-opp-tip{margin-top:10px;font-size:0.76rem;opacity:0.5;display:flex;align-items:flex-start;gap:5px;line-height:1.5}
.zi-opp-tip svg{margin-top:2px;flex-shrink:0}
.zi-map{width:100%;height:300px;border-radius:12px;overflow:hidden}
.zi-map-legend{display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap}
.zi-legend-item{display:flex;align-items:center;gap:5px;font-size:0.8rem;opacity:0.65}
.zi-legend-dot{width:9px;height:9px;border-radius:50%;border:1.5px solid white;flex-shrink:0}
.zi-legend-dot--you{background:#D4AF37;box-shadow:0 0 4px #D4AF3788}
.zi-legend-dot--signature{background:#D4AF37}
.zi-legend-dot--spotlight{background:#3b82f6}
.zi-legend-dot--verified{background:#10b981}
/* ── Opportunity Window ─────────────────────────────────────────────────────── */
/* Slot bar */
.zi-ow-slot-bar{margin-bottom:14px}
.zi-ow-slot-label{display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;opacity:0.55;margin-bottom:6px}
.zi-ow-slot-count{font-weight:600;opacity:1}
.zi-ow-slot-track{display:flex;gap:6px;height:26px}
.zi-ow-slot{flex:1;border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;transition:background 0.3s}
.night-mode .zi-ow-slot{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08)}
.day-mode .zi-ow-slot{background:rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.08)}
.zi-ow-slot--you{background:linear-gradient(135deg,rgba(212,175,55,0.25),rgba(255,140,0,0.2)) !important;border-color:rgba(212,175,55,0.45) !important}
.night-mode .zi-ow-slot--taken{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.15)}
.day-mode .zi-ow-slot--taken{background:rgba(0,0,0,0.08);border-color:rgba(0,0,0,0.12)}
.zi-ow-slot--open{opacity:0.35}
.zi-ow-slot-you-tag{font-size:0.6rem;font-weight:700;color:#D4AF37;letter-spacing:0.04em;text-transform:uppercase}
.zi-ow-slot-hint{display:flex;align-items:center;gap:5px;font-size:0.72rem;opacity:0.5;margin-top:6px;line-height:1.5}
.zi-ow-slot-hint--safe{color:#10b981;opacity:0.8}
/* Risk card */
.zi-ow-risk-card{border-radius:10px;padding:12px 14px;margin-bottom:14px}
.night-mode .zi-ow-risk-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07)}
.day-mode .zi-ow-risk-card{background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.07)}
.zi-ow-risk-header{display:flex;gap:10px;align-items:flex-start}
.zi-ow-risk-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.zi-ow-risk-icon--safe{background:rgba(16,185,129,0.15);color:#10b981}
.zi-ow-risk-icon--warn{background:rgba(249,115,22,0.15);color:#f97316}
.zi-ow-risk-body{flex:1}
.zi-ow-risk-body strong{font-size:0.82rem;display:block;margin-bottom:4px}
.zi-ow-risk-body p{font-size:0.74rem;opacity:0.6;line-height:1.55;margin:0}
.zi-ow-score-highlight{font-weight:700;color:#10b981;opacity:1}
.zi-ow-score-highlight--warn{color:#f97316}
/* Tips */
.zi-ow-tips{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)}
.day-mode .zi-ow-tips{border-top-color:rgba(0,0,0,0.07)}
.zi-ow-tips-title{font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;opacity:0.4;margin-bottom:7px}
.zi-ow-tip-row{display:flex;align-items:flex-start;gap:8px;font-size:0.73rem;opacity:0.6;line-height:1.5;margin-bottom:5px}
.zi-ow-tip-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:5px}
.zi-ow-tip-dot--amber{background:#D4AF37}
.zi-ow-tip-dot--blue{background:#3b82f6}
.zi-ow-tip-dot--green{background:#10b981}
/* Waitlist */
.zi-ow-waitlist{display:flex;align-items:flex-start;gap:8px;font-size:0.74rem;opacity:0.6;line-height:1.55;padding:10px 12px;border-radius:8px;margin-bottom:12px}
.night-mode .zi-ow-waitlist{background:rgba(212,175,55,0.07);color:inherit}
.day-mode .zi-ow-waitlist{background:rgba(212,175,55,0.08)}
.zi-ow-waitlist svg{flex-shrink:0;margin-top:2px;color:#D4AF37}
.zi-ow-waitlist strong{font-weight:600;opacity:1}
/* Event note */
.zi-ow-event-note{display:flex;align-items:flex-start;gap:8px;font-size:0.74rem;opacity:0.6;line-height:1.55;padding:10px 12px;border-radius:8px;margin-bottom:12px}
.night-mode .zi-ow-event-note{background:rgba(59,130,246,0.07)}
.day-mode .zi-ow-event-note{background:rgba(59,130,246,0.06)}
.zi-ow-event-note svg{flex-shrink:0;margin-top:2px;color:#3b82f6}
.zi-ow-event-note strong{font-weight:600;opacity:1;display:block;margin-bottom:2px}
.zi-ow-event-conflict{color:#f97316;font-weight:600}
/* Mode pills */
.zi-ow-modes{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-top:4px}
.zi-ow-mode-pill{display:flex;align-items:center;gap:5px;font-size:0.7rem;font-weight:600;padding:4px 9px;border-radius:20px}
.zi-ow-mode-pill--active{background:rgba(16,185,129,0.12);color:#10b981}
.zi-ow-mode-note{font-size:0.7rem;opacity:0.45;margin-left:2px}


@media (prefers-reduced-motion: no-preference){.zi-donut-arc{transition:stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)}}
.spinner{transform-origin:center}
.zone-intel-panel{margin-top:20px}
@media (max-width:600px){
  .zi-top-row{grid-template-columns:1fr}
  .zi-comp-metric-row{grid-template-columns:70px 1fr 36px}
  .zi-comp-footer{flex-direction:column;align-items:flex-start;gap:6px}
  .zi-comp-displacement{text-align:left}
}

/* ========== EVENT SCHEDULE (edit form, mirrors BusinessOnboarding.vue) ========== */
.event-tz-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; line-height: 1.4;
  margin: 0 0 14px;
  padding: 7px 10px; border-radius: 8px;
  background: rgba(99,102,241,0.08); color: #6366f1;
}
.event-tz-note svg { flex-shrink: 0; opacity: 0.85 }
.event-tz-note strong { font-weight: 600 }
.night-mode .event-tz-note { background: rgba(129,140,248,0.12); color: #a5b4fc }
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
  resize: none;
  appearance: none;
  -webkit-appearance: none;
}
.event-datetime-input::-webkit-inner-spin-button,
.event-datetime-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
  margin: 0;
}
.event-datetime-input::-webkit-clear-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
.event-datetime-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.55;
  padding: 4px;
  transition: opacity 0.2s;
}
.event-datetime-input::-webkit-calendar-picker-indicator:hover { opacity: 1 }
.event-datetime-input.error { border-color: #e53e3e !important }

.optional-tag {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.55;
  text-transform: lowercase;
  letter-spacing: 0.02em;
  margin-left: 4px;
}

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

/* Theme variants */
.night-mode .event-datetime-input {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.12);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
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
  background: rgba(255,255,255,0.5);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
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

/* ========== EXPIRED-EVENT NOTICE (inside edit form) ========== */
/* High-contrast inline notice shown at the top of the edit form when the
   listing's status is 'expired'. Uses warm amber tones to feel like an
   actionable callout (do something) rather than a critical error (you broke
   something). */
.expired-edit-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: none;
  margin-bottom: 16px;
  font-size: 0.88rem;
  line-height: 1.55;
}
.expired-edit-notice strong { display: block; margin-bottom: 2px; font-weight: 600 }
.expired-edit-notice em { font-style: normal; font-weight: 600 }
.night-mode .expired-edit-notice {
  background: rgba(245,158,11,0.08);
  color: #fbbf24;
}
.day-mode .expired-edit-notice {
  background: rgba(245,158,11,0.06);
  color: #92400e;
}

/* ── Rejected-listing notice ──
   Sits at the top of the edit tab when a listing was rejected. Red accent
   distinguishes it from the warmer amber of the expired-event notice — they
   can both appear, but never on the same listing. */
.rejected-edit-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border-left: 4px solid #ef4444;
  margin-bottom: 16px;
  font-size: 0.88rem;
  line-height: 1.55;
}
.rejected-edit-notice strong { display: block; margin-bottom: 4px; font-weight: 600 }
.rejected-edit-notice em      { font-style: italic; font-weight: 600; margin-right: 4px }
.rejected-edit-notice .rejection-reason {
  margin: 6px 0;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.85em;
}
.rejected-edit-notice .rejection-scope-note {
  margin-top: 8px;
  font-size: 0.85em;
  opacity: 0.92;
}
.night-mode .rejected-edit-notice {
  background: rgba(239,68,68,0.12);
  color: #fca5a5;
}
.night-mode .rejected-edit-notice strong { color: #fecaca }
.night-mode .rejected-edit-notice .rejection-reason { background: rgba(0,0,0,0.2) }
.day-mode .rejected-edit-notice {
  background: rgba(239,68,68,0.08);
  color: #b91c1c;
}
.day-mode .rejected-edit-notice strong { color: #991b1b }
.day-mode .rejected-edit-notice .rejection-reason { background: rgba(255,255,255,0.5); color: #4b1010 }

/* ========== EVENT SCHEDULE DISPLAY (overview meta block) ========== */
/* Date + time + optional "Ended" pill, sitting in the listing meta grid.
   Designed to read as a single coherent piece of information: primary line
   gets the visual weight (date or "Weekly"), secondary line (time range or
   "starting …") sits beneath it lighter. The pill floats to the right on
   wide layouts and wraps below on narrow ones. */
.event-schedule-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-top: 2px;
}
.event-schedule-primary {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.event-schedule-secondary {
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.7;
}
.night-mode .event-schedule-primary { color: #e2e8f0 }
.day-mode   .event-schedule-primary { color: #3c2a1e }

/* "Ended" pill — warm grey, calm. Same palette as the status banner so the
   two read as the same state from different angles. */
.event-ended-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(168,162,158,0.18);
  color: #a8a29e;
  margin-left: auto;
}

/* ========== EXPIRED GALLERY DIMMING ========== */
/* Whole gallery softens when the listing is expired. Not aggressive — just
   enough that the "no longer active" state reads at a glance, without making
   the images look broken or like a loading state. */
.gallery--expired { filter: grayscale(0.4); opacity: 0.78; transition: filter 0.25s, opacity 0.25s }
.gallery--expired .gallery-name-block { opacity: 1 }

</style>