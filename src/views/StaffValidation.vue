<template>
  <div class="staff-val" :class="theme">
    <!-- ── Header ────────────────────────────────────────────────────── -->
    <header class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">
          <span class="page-title-mark">//</span>
          {{ activeTab === 'destinations' ? 'Destinations' : activeTab === 'explore' ? 'Explore' : 'Validation' }}<span v-if="userName" class="page-title-user"> — {{ userName }}</span>
        </h1>
        <p class="page-subtitle">
          {{ activeTab === 'destinations' ? 'Manage destinations in your scope' : activeTab === 'explore' ? 'Moderate Explore-page places in your scope' : 'Review and verify business applications' }}
        </p>
      </div>
      <div class="page-header-right">
        <!-- Status counts: only meaningful on the validation tab. On the
             destinations tab we show a compact pill row of summary KPIs
             in this same slot instead (see below). -->
        <div v-if="activeTab === 'validation'" class="counts-strip">
          <button v-for="s in statusList" :key="s.key" class="count-pill" :class="{ active: status === s.key }" @click="setStatus(s.key)">
            <span class="count-pill-label">{{ s.label }}</span>
            <span class="count-pill-num">{{ counts[s.key] ?? 0 }}</span>
          </button>
        </div>
        <!-- Destinations KPI pills — same visual language as the validation
             counts-strip (count-pill class) so the header feels consistent
             between tabs. Read-only: not clickable filters. -->
        <div v-else-if="activeTab === 'destinations'" class="counts-strip">
          <span class="count-pill count-pill--readonly" title="Total destinations in your scope">
            <span class="count-pill-label">In scope</span>
            <span class="count-pill-num">{{ fmt(destSummary.total) }}</span>
          </span>
          <span class="count-pill count-pill--readonly" title="Destinations flagged as hidden gems">
            <span class="count-pill-label">Hidden gems</span>
            <span class="count-pill-num">{{ fmt(destSummary.hiddenGems) }}</span>
          </span>
          <span class="count-pill count-pill--readonly" title="Total views across destinations in scope">
            <span class="count-pill-label">Views</span>
            <span class="count-pill-num">{{ fmt(destSummary.totalViews) }}</span>
          </span>
          <span class="count-pill count-pill--readonly" title="Total user clicks across destinations in scope">
            <span class="count-pill-label">Clicks</span>
            <span class="count-pill-num">{{ fmt(destSummary.totalClicks || 0) }}</span>
          </span>
        </div>
        <button class="theme-toggle-btn" @click="toggleTheme" :title="theme === 'night-mode' ? 'Switch to day mode' : 'Switch to night mode'" :aria-label="theme === 'night-mode' ? 'Switch to day mode' : 'Switch to night mode'">
          <!-- Sun icon (shown in night mode → click for day) -->
          <svg v-if="theme === 'night-mode'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </svg>
          <!-- Moon icon (shown in day mode → click for night) -->
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button class="logout-btn" @click="confirmLogout = true" title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </header>

    <!-- ── Tab strip (only shown when staff has more than one permission) ── -->
    <!-- Validation queue is the default landing tab. Destinations tab appears
         only when the admin granted manageDestinations. If staff only has one
         permission, no tabs render — the page goes straight to that surface. -->
    <nav v-if="visibleTabs.length > 1" class="tab-strip">
      <button v-for="t in visibleTabs" :key="t.key"
              class="tab-btn" :class="{ active: activeTab === t.key }"
              @click="activeTab = t.key">
        <span class="tab-mark">//</span>
        <span class="tab-label">{{ t.label }}</span>
        <span v-if="t.count != null" class="tab-count">{{ t.count }}</span>
      </button>
    </nav>

    <!-- ════════════════════════════════════════════════════════════════
         VALIDATION TAB
         ════════════════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'validation'">

    <!-- ── Scope banner ─────────────────────────────────────────────── -->
    <!-- States:
         - empty + unassigned: admin must set countries/cities
         - non-empty + zeroMatches: assignment is set but no businesses match
           (often means business records store country differently, e.g. "AM" vs "Armenia")
         - non-empty + matches: normal "Reviewing: ..." line -->
    <div v-if="scopeBanner" class="scope-banner" :class="{ 'scope-banner--empty':   scopeBanner.empty, 'scope-banner--warning': !scopeBanner.empty && scopeBanner.zeroMatches }">
      <svg v-if="scopeBanner.empty || scopeBanner.zeroMatches" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <div class="scope-banner-body">
        <template v-if="scopeBanner.empty">
          <strong>No territory assigned.</strong>
          You won't see any pending businesses until an admin assigns at least one country or city to your account.
        </template>
        <template v-else>
          <span class="scope-banner-label">Reviewing:</span>
          <strong>{{ scopeBanner.countries.join(', ') || '—' }}</strong>
          <span v-if="scopeBanner.cities.length" class="scope-banner-cities">+ cities: {{ scopeBanner.cities.join(', ') }}</span>
          <span v-if="scopeBanner.priority.length" class="scope-banner-priority">★ priority: {{ scopeBanner.priority.join(', ') }}</span>
          <div v-if="scopeBanner.zeroMatches" style="width:100%; margin-top:6px; font-size:12px; opacity:0.85">
            Your scope is set, but no business records match these names. Verify how country/city are stored on the business documents — they may use codes (e.g. <code>AM</code>) instead of full names.
          </div>
        </template>
      </div>
    </div>

    <!-- ── Filter bar ────────────────────────────────────────────────── -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Tier</label>
        <div class="filter-chips">
          <button v-for="t in tierList" :key="t.key" class="chip" :class="[t.key, { active: tier === t.key }]" @click="setTier(t.key)">
            {{ t.label }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-label">City</label>
        <input v-model="cityInput" @input="onCityInput" type="text" class="filter-input" placeholder="Search city…"/>
      </div>
      <div class="filter-group filter-group--right">
        <button class="ghost-btn" @click="loadList(true)" :disabled="listLoading">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- ── Main: table + drawer ─────────────────────────────────────── -->
    <main class="main-grid" :class="{ 'drawer-open': !!selected }">
      <!-- Table -->
      <section class="table-wrap">
        <div v-if="listLoading && !businesses.length" class="table-empty">
          <div class="spinner"/>
          <span>Loading applications…</span>
        </div>

        <div v-else-if="!businesses.length" class="table-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Nothing in the {{ statusLabel(status).toLowerCase() }} queue.</span>
        </div>

        <table v-else class="biz-table">
          <thead>
            <tr>
              <th class="col-name">Business</th>
              <th class="col-tier">Tier</th>
              <th class="col-cat">Category</th>
              <th class="col-city">City</th>
              <th class="col-ai">AI</th>
              <th class="col-age">Age</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in businesses" :key="b._id" class="biz-row" :class="{ 'biz-row--selected': selected?._id === b._id, [`status-${b.status}`]: true }" @click="select(b)">
              <td class="col-name" data-label="Business">
                <div class="row-name">
                  <span class="row-name-text">{{ b.name }}</span>
                  <span v-if="b.waitlist?.isWaiting" class="row-tag waitlist">waitlist</span>
                  <span v-if="isAuctionWinner(b)" class="row-tag auction-winner">⚑ auction win</span>
                  <span v-if="b.verification?.verifiedAction === 'approved' && b.status === 'waitlisted'" class="row-tag row-tag--verified" title="Approved bidder">✓ verified</span>
                  <span v-if="b.isHiddenGem" class="row-tag gem">✦ gem</span>
                  <span
                    v-if="b.verification?.watchFlags?.length"
                    class="row-tag row-tag--watch"
                    :title="watchFlagTooltip(b)"
                  >
                    ⚠ {{ b.verification.watchFlags.length }} blocklist
                  </span>
                </div>
                <div class="row-sub">{{ b.contact?.email || '—' }}</div>
              </td>
              <td class="col-tier" data-label="Tier"><span class="tier-pill" :class="b.partnership?.tier">{{ tierShort(b.partnership?.tier) }}</span></td>
              <td class="col-cat" data-label="Category"><span class="mono-sm">{{ mainCategory(b) || '—' }}</span></td>
              <td class="col-city" data-label="City">{{ b.location?.city || '—' }}</td>
              <td class="col-ai" data-label="AI">
                <span v-if="b.verification?.aiScore != null" class="ai-bar" :class="aiBucket(b.verification.aiScore)">
                  <span class="ai-bar-fill" :style="{ width: b.verification.aiScore + '%' }"/>
                  <span class="ai-bar-num">{{ b.verification.aiScore }}</span>
                </span>
                <span v-else class="muted">—</span>
              </td>
              <td class="col-age" data-label="Age"><span class="muted-sm">{{ relTime(b.createdAt) }}</span></td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="businesses.length" class="pagination">
          <button class="ghost-btn" :disabled="page <= 1 || listLoading" @click="changePage(-1)">‹ Prev</button>
          <span class="page-indicator">Page {{ page }} of {{ totalPages }} · {{ total }} total</span>
          <button class="ghost-btn" :disabled="page >= totalPages || listLoading" @click="changePage(1)">Next ›</button>
        </div>
      </section>

      <!-- Drawer -->
      <div v-if="selected" class="drawer-backdrop" @click="selected = null"></div>
      <aside v-if="selected" class="drawer">
        <div class="drawer-head">
          <div class="drawer-head-top">
            <span class="status-pill" :class="`status-${selected.status}`">{{ selected.status }}</span>
            <span v-if="selected.verification?.verifiedAction === 'approved'" class="verified-badge" title="Already approved by staff">✓ verified</span>
            <span v-else-if="selected.verification?.verifiedAction === 'rejected'" class="verified-badge verified-badge--rejected" title="Already rejected by staff">✗ rejected</span>
            <span class="tier-pill" :class="selected.partnership?.tier">{{ tierLabel(selected.partnership?.tier) }}</span>
            <button class="drawer-close" @click="selected = null" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <h2 class="drawer-title">{{ selected.name }}</h2>
          <div class="drawer-sub">
            <span class="mono-sm">id: {{ selected._id }}</span>
            <span class="dot-sep">·</span>
            <span>{{ formatDate(selected.createdAt) }}</span>
          </div>
        </div>

        <!-- AI Verification panel -->
        <section class="drawer-section ai-card">
          <header class="section-head">
            <h3>AI Pre-Verification</h3>
            <span v-if="selected.verification?.aiScore != null" class="ai-score-big" :class="aiBucket(selected.verification.aiScore)">
              {{ selected.verification.aiScore }}<span class="ai-score-pct">/100</span>
            </span>
            <span v-else class="muted-sm">no score</span>
          </header>
          <p v-if="selected.verification?.aiNotes" class="ai-notes">{{ selected.verification.aiNotes }}</p>
          <p v-else class="muted-sm">No AI notes recorded.</p>
          <p v-if="selected.verification?.staffNotes" class="staff-prefilled">
            <strong>Staff note:</strong> {{ selected.verification.staffNotes }}
          </p>
        </section>

        <!-- Blocklist matches — abuse-prevention signal -->
        <!-- Surfaced when one or more of the applicant's fingerprints (email,
             phone, IP, name+city, userId, or repeat-edit pattern) match an
             entry in the BlockedFingerprint registry. The applicant is NOT
             told about these — they're a private signal to staff. -->
        <section
          v-if="selected.verification?.watchFlags?.length"
          class="drawer-section watch-flags-card"
        >
          <header class="section-head">
            <h3>Blocklist matches</h3>
            <span class="action-pill action-rejected">
              {{ selected.verification.watchFlags.length }} match{{ selected.verification.watchFlags.length > 1 ? 'es' : '' }}
            </span>
          </header>
          <p class="muted-sm">
            This applicant's contact info matches one or more entries in the abuse-prevention blocklist. Review carefully before approving.
          </p>
          <ul class="watch-flag-list">
            <li v-for="(flag, i) in selected.verification.watchFlags" :key="i" class="watch-flag-item">
              <div class="watch-flag-head">
                <span class="watch-flag-type">{{ flag.type }}</span>
                <span class="watch-flag-severity" :class="`sev-${flag.severity}`">{{ flag.severity }}</span>
                <span v-if="flag.hitCount > 1" class="watch-flag-count">{{ flag.hitCount }}× hits</span>
              </div>
              <p v-if="flag.reason" class="watch-flag-reason">{{ flag.reason }}</p>
            </li>
          </ul>
        </section>

        <!-- Verification audit trail -->
        <section v-if="hasVerificationDetails(selected)" class="drawer-section">
          <header class="section-head">
            <h3>Verification record</h3>
            <span v-if="selected.verification?.verifiedAction"
                  class="action-pill"
                  :class="`action-${selected.verification.verifiedAction}`">
              {{ selected.verification.verifiedAction }}
            </span>
          </header>
          <dl class="kv-grid">
            <template v-if="selected.verification?.verifiedAt">
              <dt>Verified at</dt>
              <dd>{{ formatDate(selected.verification.verifiedAt) }}</dd>
            </template>
            <template v-if="selected.verification?.verifiedBy">
              <dt>Verified by</dt>
              <dd>{{ verifierLabel(selected.verification.verifiedBy) }}</dd>
            </template>
            <template v-if="selected.verification?.staffApproved != null">
              <dt>Staff approved</dt>
              <dd>{{ selected.verification.staffApproved ? 'Yes' : 'No' }}</dd>
            </template>
          </dl>
          <ul v-if="(selected.verification?.history || []).length" class="history-list">
            <li v-for="(h, i) in selected.verification.history.slice().reverse()" :key="i" class="history-item">
              <span class="action-pill" :class="`action-${h.action}`">{{ h.action }}</span>
              <span class="history-meta mono-sm">
                {{ formatDate(h.at) }}
                <span v-if="h.byRole" class="history-role">· {{ h.byRole }}</span>
                <span v-if="h.by" class="history-role">· {{ verifierLabel(h.by) }}</span>
              </span>
              <p v-if="h.notes" class="history-notes">{{ h.notes }}</p>
            </li>
          </ul>
          <p v-else-if="!(selected.verification?.verifiedAt)" class="muted-sm">
            No prior moderation events.
          </p>
        </section>

        <!-- Image gallery -->
        <section v-if="(selected.images || []).length || (selected.uploadedImages || []).length" class="drawer-section">
          <header class="section-head">
            <h3>Images <span class="count-tag">{{ (selected.images || []).length }}</span></h3>
            <span v-if="(selected.uploadedImages || []).length" class="muted-sm">
              + {{ selected.uploadedImages.length }} uploaded
            </span>
          </header>
          <div v-if="(selected.images || []).length" class="gallery">
            <a v-for="(img, i) in selected.images.slice(0, 8)" :key="i" :href="resolveImage(img, selected._id, i)" target="_blank" rel="noopener" class="gallery-item">
              <img :src="resolveImage(img, selected._id, i)" :alt="`${selected.name} ${i+1}`" loading="lazy" @error="onImgError"/>
            </a>
          </div>
          <ul v-if="(selected.uploadedImages || []).length" class="uploaded-list">
            <li v-for="(u, i) in selected.uploadedImages" :key="i" class="uploaded-item">
              <span class="mono-sm">#{{ i + 1 }}</span>
              <span class="muted-sm">{{ u.contentType || 'image' }}</span>
              <span v-if="u.width && u.height" class="muted-sm">· {{ u.width }}×{{ u.height }}</span>
              <span v-if="u.sizeBytes" class="muted-sm">· {{ formatBytes(u.sizeBytes) }}</span>
              <span v-if="u.storedAt" class="muted-sm">· {{ formatDate(u.storedAt) }}</span>
            </li>
          </ul>
        </section>

        <!-- Description -->
        <section class="drawer-section">
          <header class="section-head"><h3>Description</h3></header>
          <div v-if="selected.description?.short" class="desc-short">{{ selected.description.short }}</div>
          <div
            v-if="selected.description?.detailed && selected.description.detailed.trim() !== (selected.description.short || '').trim()"
            class="desc-detailed"
          >{{ selected.description.detailed }}</div>
          <div v-if="!selected.description?.short && !selected.description?.detailed" class="muted-sm">No description provided.</div>
          <div v-if="(selected.description?.highlights || []).length" class="highlights">
            <span v-for="(h, i) in selected.description.highlights" :key="i" class="highlight-tag">{{ h }}</span>
          </div>
        </section>

        <!-- Categories / interests / styles -->
        <section class="drawer-section">
          <header class="section-head"><h3>Categories &amp; tags</h3></header>
          <div class="tag-row">
            <span v-for="t in selected.type || []" :key="t" class="type-tag" :class="tagKind(t)">{{ t }}</span>
          </div>
        </section>

        <!-- Location -->
        <section class="drawer-section">
          <header class="section-head"><h3>Location</h3></header>
          <dl class="kv-grid">
            <dt>Address</dt>
            <dd>{{ selected.location?.address || '—' }}</dd>
            <dt>City</dt>
            <dd>{{ selected.location?.city || '—' }}<span v-if="selected.location?.region">, {{ selected.location.region }}</span></dd>
            <dt>Country</dt>
            <dd>{{ selected.location?.country || '—' }}</dd>
            <dt>Coords</dt>
            <dd class="mono-sm">
              <template v-if="selected.location?.coordinates?.lat != null">
                {{ selected.location.coordinates.lat.toFixed(5) }}, {{ selected.location.coordinates.lng.toFixed(5) }}
                <a class="link-sm" :href="mapLink(selected)" target="_blank" rel="noopener">open in map ↗</a>
              </template>
              <template v-else>—</template>
            </dd>
            <dt>Zone</dt>
            <dd class="mono-sm">{{ selected.zoneKey || '—' }}</dd>
          </dl>
        </section>

        <!-- Zone slots -->
        <section v-if="selected.zoneKey" class="drawer-section">
          <header class="section-head">
            <h3>Zone slots</h3>
            <button class="ghost-btn ghost-btn-sm" @click="loadZone(selected)" :disabled="zoneLoading">
              {{ zoneLoading ? 'loading…' : (zoneInfo ? 'reload' : 'check zone') }}
            </button>
          </header>
          <div v-if="zoneInfo" class="zone-summary">
            <div class="zone-counts">
              <div class="zone-count" :class="{ full: zoneInfo.total >= 3 }">
                <span class="zone-count-num">{{ zoneInfo.total }}</span>
                <span class="zone-count-label">/ 3 occupied</span>
              </div>
              <div class="zone-mini">
                <span class="mini-pill verified">v {{ zoneInfo.verified }}</span>
                <span class="mini-pill spotlight">s {{ zoneInfo.spotlight }}</span>
                <span class="mini-pill signature">★ {{ zoneInfo.signature }}</span>
              </div>
            </div>
            <ul v-if="zoneInfo.occupants?.length" class="zone-list">
              <li v-for="b in zoneInfo.occupants" :key="b._id" :class="{ 'zone-self': b._id === selected._id }">
                <span class="tier-pill" :class="b.partnership?.tier">{{ tierShort(b.partnership?.tier) }}</span>
                <span class="zone-list-name">{{ b.name }}</span>
                <span class="zone-list-score mono-sm">score {{ b.analytics?.performanceScore ?? 0 }}</span>
                <span v-if="b._id === selected._id" class="zone-self-tag">applicant</span>
              </li>
            </ul>
          </div>
          <p v-else class="muted-sm">Click "check zone" to see who else occupies this zone.</p>
        </section>

        <!-- Contact -->
        <section class="drawer-section">
          <header class="section-head"><h3>Contact</h3></header>
          <dl class="kv-grid">
            <dt>Email</dt>
            <dd>
              <a v-if="selected.contact?.email" :href="`mailto:${selected.contact.email}`" class="link-sm">{{ selected.contact.email }}</a>
              <span v-else class="muted">—</span>
              <span v-if="selected.contact?.email" class="privacy-tag" :class="{ shown: selected.contact?.showEmail }">
                {{ selected.contact?.showEmail ? 'public' : 'hidden from users' }}
              </span>
            </dd>
            <dt>Phone</dt>
            <dd>
              <a v-if="selected.contact?.phone" :href="`tel:${selected.contact.phone}`" class="link-sm">{{ selected.contact.phone }}</a>
              <span v-else class="muted">—</span>
            </dd>
            <dt>Website</dt>
            <dd>
              <a v-if="selected.contact?.website" :href="selected.contact.website" target="_blank" rel="noopener" class="link-sm">{{ selected.contact.website }} ↗</a>
              <span v-else class="muted">—</span>
            </dd>
            <template v-if="selected.contact?.socialMedia">
              <template v-for="key in ['instagram','facebook','tripadvisor','booking']" :key="key">
                <template v-if="selected.contact.socialMedia[key]">
                  <dt>{{ key }}</dt>
                  <dd><a :href="selected.contact.socialMedia[key]" target="_blank" rel="noopener" class="link-sm">{{ selected.contact.socialMedia[key] }} ↗</a></dd>
                </template>
              </template>
            </template>
          </dl>
        </section>

        <!-- Pricing -->
        <section v-if="hasPricing(selected)" class="drawer-section">
          <header class="section-head"><h3>Pricing</h3></header>
          <div class="pricing-row">
            <span v-if="selected.pricing.isFree" class="price-tag free">Free</span>
            <template v-else>
              <span v-if="selected.pricing.min != null" class="price-tag">min {{ selected.pricing.min }} {{ selected.pricing.currency }}</span>
              <span v-if="selected.pricing.max != null" class="price-tag">max {{ selected.pricing.max }} {{ selected.pricing.currency }}</span>
              <span v-if="selected.pricing.average != null" class="price-tag">avg {{ selected.pricing.average }} {{ selected.pricing.currency }}</span>
            </template>
          </div>
        </section>

        <!-- Opening hours / Weekly schedule.
             Hidden entirely for one-time events — they have a single time
             window in the Event schedule section below, and the weekly hours
             grid would either be empty or full of meaningless 00:00–23:59
             placeholder rows. For recurring events the heading flips to
             "Weekly schedule" to match the language the owner sees in the
             dashboard's edit form. -->
        <section v-if="hasHours(selected) && (!(selected.type || []).includes('events') || isRecurringEvent(selected))" class="drawer-section">
          <header class="section-head"><h3>{{ isRecurringEvent(selected) ? 'Weekly schedule' : 'Opening hours' }}</h3></header>
          <div v-if="selected.openingHours.is24Hours" class="hours-247">Open 24 / 7</div>
          <table v-else class="hours-table">
            <tr v-for="d in (selected.openingHours.days || [])" :key="d.day">
              <td class="hours-day">{{ d.day }}</td>
              <td class="hours-time mono-sm">
                <span v-if="d.closed" class="muted">closed</span>
                <span v-else>{{ d.open || '—' }} → {{ d.close || '—' }}</span>
              </td>
            </tr>
          </table>
        </section>

        <!-- Event schedule.
             formatEventDate converts against the event's own timezone
             (eventSchedule.timezone) so staff review the wall-clock time the
             event actually runs at the venue — not the staff member's local
             time. The timezone is shown explicitly so an approval is never
             ambiguous. When the event has already passed, a prominent "Ended"
             warning sits at the top — staff reviewing a pending event needs
             that context BEFORE deciding whether to approve. -->
        <section v-if="selected.eventSchedule" class="drawer-section">
          <header class="section-head">
            <h3>Event schedule</h3>
            <span v-if="isEventListingExpired(selected)" class="event-ended-flag" title="This event's end-date has already passed">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Already ended
            </span>
          </header>
          <dl class="kv-grid">
            <dt>Start</dt><dd>{{ formatEventDate(selected.eventSchedule.startDate, selected.eventSchedule.timezone) }}</dd>
            <dt>End</dt><dd>{{ selected.eventSchedule.endDate ? formatEventDate(selected.eventSchedule.endDate, selected.eventSchedule.timezone) : '—' }}</dd>
            <dt>Recurring</dt><dd>{{ selected.eventSchedule.isRecurring ? 'Yes (always-on)' : 'No' }}</dd>
            <dt>Timezone</dt><dd>{{ selected.eventSchedule.timezone ? selected.eventSchedule.timezone.replace(/_/g, ' ') : 'Not set (shown in UTC)' }}</dd>
          </dl>
          <!-- Inline guidance for staff: explains what will happen if they
               try to approve. Mirrors the server-side guard in
               POST /business/:id/approve — keep these two in sync. -->
          <div v-if="isEventListingExpired(selected) && selected.status === 'pending'" class="event-ended-hint">
            <strong>This event has already ended.</strong>
            Approving will mark the listing as <em>expired</em> instead — the owner needs to reschedule it via the dashboard before it can be approved.
          </div>
        </section>

        <!-- Partnership / Subscription -->
        <section v-if="selected.partnership" class="drawer-section">
          <header class="section-head">
            <h3>Subscription</h3>
            <span class="tier-pill" :class="selected.partnership?.tier">{{ tierLabel(selected.partnership?.tier) }}</span>
          </header>
          <dl class="kv-grid">
            <dt>Monthly fee</dt>
            <dd>{{ selected.partnership?.monthlyFee != null ? `${selected.partnership.monthlyFee} USD` : '—' }}</dd>
            <template v-if="selected.auction?.isBidding">
              <dt>Auction bid</dt>
              <dd><strong>{{ selected.auction?.maxBid != null ? `$${selected.auction.maxBid}/mo` : '—' }}</strong>
                <span class="muted-sm"> (floor $49 · monthly fee updates to this if it wins)</span></dd>
            </template>
            <template v-if="selected.auction?.wonAtPrice != null">
              <dt>Won at</dt>
              <dd><strong>${{ selected.auction.wonAtPrice }}/mo</strong></dd>
            </template>
            <dt>Priority</dt>
            <dd class="mono-sm">{{ selected.partnership?.priorityScore ?? '—' }}</dd>
            <dt>Started</dt>
            <dd>{{ selected.partnership?.subscriptionStart ? formatDate(selected.partnership.subscriptionStart) : '—' }}</dd>
            <dt>Ends</dt>
            <dd>
              <template v-if="selected.partnership?.subscriptionEnd">
                {{ formatDate(selected.partnership.subscriptionEnd) }}
                <span class="sub-rel muted-sm">({{ relTime(selected.partnership.subscriptionEnd) }})</span>
              </template>
              <span v-else class="muted">—</span>
            </dd>
          </dl>
        </section>

        <!-- Waitlist -->
        <section v-if="selected.waitlist?.isWaiting || selected.waitlist?.targetZoneKey" class="drawer-section">
          <header class="section-head">
            <h3>Waitlist</h3>
            <span v-if="selected.waitlist?.isWaiting" class="action-pill action-rejected">waiting</span>
          </header>
          <dl class="kv-grid">
            <dt>Position</dt>
            <dd class="mono-sm">{{ selected.waitlist?.position ?? '—' }}</dd>
            <dt>Reserved at</dt>
            <dd>{{ selected.waitlist?.reservedAt ? formatDate(selected.waitlist.reservedAt) : '—' }}</dd>
            <dt>Target zone</dt>
            <dd class="mono-sm">{{ selected.waitlist?.targetZoneKey || '—' }}</dd>
          </dl>
        </section>

        <!-- Analytics -->
        <section v-if="selected.analytics" class="drawer-section">
          <header class="section-head">
            <h3>Analytics</h3>
            <span class="ai-score-big" :class="aiBucket(selected.analytics?.performanceScore || 0)">
              {{ selected.analytics?.performanceScore ?? 0 }}<span class="ai-score-pct">/100</span>
            </span>
          </header>
          <p v-if="selected.analytics?.performanceUpdatedAt" class="muted-sm" style="margin: -4px 0 12px">
            Score updated {{ formatDate(selected.analytics.performanceUpdatedAt) }}
          </p>

          <!-- Top-line stats -->
          <div class="stat-grid">
            <div class="stat-cell">
              <span class="stat-num">{{ selected.analytics?.views ?? 0 }}</span>
              <span class="stat-lbl">views</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ selected.analytics?.saves ?? 0 }}</span>
              <span class="stat-lbl">saves</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ selected.analytics?.clicks ?? 0 }}</span>
              <span class="stat-lbl">clicks</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ selected.analytics?.shares ?? 0 }}</span>
              <span class="stat-lbl">shares</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num good">{{ selected.analytics?.likes ?? 0 }}</span>
              <span class="stat-lbl">likes</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num bad">{{ selected.analytics?.dislikes ?? 0 }}</span>
              <span class="stat-lbl">dislikes</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ selected.analytics?.conversions ?? 0 }}</span>
              <span class="stat-lbl">conversions</span>
            </div>
            <div class="stat-cell">
              <span class="stat-num">{{ selected.analytics?.revenue ?? 0 }}</span>
              <span class="stat-lbl">revenue</span>
            </div>
          </div>

          <!-- Engagement breakdown -->
          <h4 class="sub-head">Engagement</h4>
          <dl class="kv-grid">
            <dt>Ask AI</dt><dd class="mono-sm">{{ selected.analytics?.aiAsk ?? 0 }}</dd>
            <dt>More images</dt><dd class="mono-sm">{{ selected.analytics?.moreImages ?? 0 }}</dd>
            <dt>Cross-zone</dt><dd class="mono-sm">{{ selected.analytics?.crossInteractions ?? 0 }}</dd>
          </dl>

          <!-- Conversion clicks -->
          <h4 class="sub-head">Conversion clicks</h4>
          <dl class="kv-grid">
            <dt>Directions</dt><dd class="mono-sm">{{ selected.analytics?.directionClicks ?? 0 }}</dd>
            <dt>Phone</dt><dd class="mono-sm">{{ selected.analytics?.phoneClicks ?? 0 }}</dd>
            <dt>Website</dt><dd class="mono-sm">{{ selected.analytics?.websiteClicks ?? 0 }}</dd>
            <dt>Search</dt><dd class="mono-sm">{{ selected.analytics?.searchClicks ?? 0 }}</dd>
            <dt>Instagram</dt><dd class="mono-sm">{{ selected.analytics?.instagramClicks ?? 0 }}</dd>
            <dt>Facebook</dt><dd class="mono-sm">{{ selected.analytics?.facebookClicks ?? 0 }}</dd>
            <dt>TripAdvisor</dt><dd class="mono-sm">{{ selected.analytics?.tripadvisorClicks ?? 0 }}</dd>
          </dl>

          <!-- Weekly trends (sparkline-style bars) -->
          <template v-if="(selected.analytics?.weeklyViews || []).length || (selected.analytics?.weeklyClicks || []).length">
            <h4 class="sub-head">Last 8 weeks</h4>
            <div class="trend-row">
              <span class="trend-label">views</span>
              <div class="trend-bars">
                <span v-for="(v, i) in (selected.analytics?.weeklyViews || [])" :key="`v${i}`"
                      class="trend-bar"
                      :style="{ height: trendHeight(v, selected.analytics.weeklyViews) }"
                      :title="`week -${(selected.analytics.weeklyViews.length - 1 - i)}: ${v}`"></span>
              </div>
              <span class="trend-total mono-sm">{{ sumArr(selected.analytics?.weeklyViews) }}</span>
            </div>
            <div class="trend-row">
              <span class="trend-label">clicks</span>
              <div class="trend-bars">
                <span v-for="(v, i) in (selected.analytics?.weeklyClicks || [])" :key="`c${i}`"
                      class="trend-bar accent"
                      :style="{ height: trendHeight(v, selected.analytics.weeklyClicks) }"
                      :title="`week -${(selected.analytics.weeklyClicks.length - 1 - i)}: ${v}`"></span>
              </div>
              <span class="trend-total mono-sm">{{ sumArr(selected.analytics?.weeklyClicks) }}</span>
            </div>
          </template>
        </section>

        <!-- System / Owner / Flags -->
        <section class="drawer-section">
          <header class="section-head"><h3>System</h3></header>
          <dl class="kv-grid">
            <dt>Owner</dt>
            <dd class="mono-sm">{{ ownerLabel(selected.owner) }}</dd>
            <dt>Active</dt>
            <dd>
              <span class="flag-pill" :class="{ on: selected.isActive }">
                {{ selected.isActive ? 'yes' : 'no' }}
              </span>
            </dd>
            <dt>Hidden gem</dt>
            <dd>
              <span class="flag-pill" :class="{ on: selected.isHiddenGem }">
                {{ selected.isHiddenGem ? 'yes' : 'no' }}
              </span>
            </dd>
            <dt>Created</dt>
            <dd>{{ formatDate(selected.createdAt) }}</dd>
            <dt>Updated</dt>
            <dd>{{ formatDate(selected.updatedAt) }}</dd>
          </dl>
        </section>

        <!-- Action bar (sticky) -->
        <footer v-if="canModerate(selected)" class="drawer-actions">
          <div v-if="isAuctionWinner(selected)" class="auction-win-banner">
            ⚑ <strong>Zone Auction winner.</strong>
            Approving activates a paid <strong>Signature</strong> slot at the won price of
            <strong>${{ selected.auction?.wonAtPrice ?? selected.partnership?.monthlyFee ?? '—' }}/mo</strong>
            in zone <span class="mono-sm">{{ selected.zoneKey || '—' }}</span>.
            The slot is reserved for this business until you approve or reject.
          </div>
          <textarea v-model="staffNote" class="staff-note" placeholder="Notes for the owner / internal log…" rows="2"/>
          <div v-if="actionError" class="action-error">{{ actionError }}</div>
          <div class="action-buttons">
            <button class="action-btn reject" @click="confirm('reject')" :disabled="actionBusy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Reject (allow resubmit)
            </button>
            <button class="action-btn reject-permanent" @click="confirm('reject_permanent')" :disabled="actionBusy" title="Permanently decline — owner cannot resubmit and all fingerprints are blocked">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Reject permanently
            </button>
            <button class="action-btn approve" @click="confirm('approve')" :disabled="actionBusy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ actionBusy ? 'Working…' : 'Approve' }}
            </button>
          </div>
        </footer>
        <footer v-else class="drawer-actions drawer-actions--readonly">
          <span v-if="selected.verification?.verifiedAction === 'approved' && selected.status === 'waitlisted'" class="muted-sm">
            ✓ Already approved by staff — this business is a verified bidder in the Zone Auction. No further action needed.
          </span>
          <span v-else-if="selected.verification?.verifiedAction === 'approved'" class="muted-sm">
            ✓ Already approved by staff.
          </span>
          <span v-else-if="selected.verification?.verifiedAction === 'rejected'" class="muted-sm">
            ✗ Already rejected by staff.
          </span>
          <span v-else class="muted-sm">
            This application is already {{ selected.status }} — no actions available.
          </span>
        </footer>
      </aside>
    </main>

    </template>
    <!-- ════════════════════════════════════════════════════════════════
         /VALIDATION TAB
         ════════════════════════════════════════════════════════════════ -->


    <!-- ════════════════════════════════════════════════════════════════
         DESTINATIONS TAB
         For staff with permissions.manageDestinations === true.
         Mirrors the validation page's visual language: scope banner,
         filter bar, table on the left, slide-in drawer / centered modal
         on the right for the add/edit form.
         ════════════════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'destinations'">

    <!-- Scope banner (re-used; works the same way for destinations) -->
    <div v-if="scopeBanner" class="scope-banner" :class="{ 'scope-banner--empty': scopeBanner.empty }">
      <svg v-if="scopeBanner.empty" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <div class="scope-banner-body">
        <template v-if="scopeBanner.empty">
          <strong>No territory assigned.</strong>
          You can only add destinations inside countries / cities your admin assigns to you.
        </template>
        <template v-else>
          <span class="scope-banner-label">Adding in:</span>
          <strong>{{ scopeBanner.countries.join(', ') || '—' }}</strong>
          <span v-if="scopeBanner.cities.length" class="scope-banner-cities">+ cities: {{ scopeBanner.cities.join(', ') }}</span>
        </template>
      </div>
    </div>

    <!-- ── Filter bar (validation-style — same .filter-bar / .chip pattern
         the validation tab uses, so the two tabs feel like one product). ── -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Show</label>
        <div class="filter-chips">
          <button v-for="opt in destFilterOpts" :key="opt.value"
                  class="chip" :class="{ active: destFilter === opt.value }"
                  @click="destFilter = opt.value; loadDestinations()">
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-label">Owner</label>
        <div class="filter-chips">
          <button class="chip" :class="{ active: !destMineOnly }" @click="destMineOnly = false; loadDestinations()">All in scope</button>
          <button class="chip" :class="{ active: destMineOnly }" @click="destMineOnly = true; loadDestinations()">Added by me</button>
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-label">Search</label>
        <input v-model="destSearchInput" type="text" class="filter-input" placeholder="Search destinations…" @input="onDestSearchInput" />
      </div>
      <div class="filter-group filter-group--right">
        <button class="ghost-btn" @click="openDestCreate" :disabled="scopeBanner?.empty" :title="scopeBanner?.empty ? 'Assign a territory first' : 'Add a new destination'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add destination
        </button>
      </div>
    </div>

    <!-- ── Destinations table (validation-style .table-wrap + .biz-table).
         Column names are unchanged — we're only restyling the rows, headers,
         borders, hover, etc. so the table reads like the validation queue. -->
    <main class="main-grid">
      <section class="table-wrap">
        <div v-if="destLoading && !destinations.length" class="table-empty">
          <div class="spinner"/>
          <span>Loading destinations…</span>
        </div>

        <div v-else-if="!destinations.length" class="table-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ destMineOnly ? "You haven't added any destinations yet." : 'No destinations found in your scope.' }}</span>
        </div>

        <table v-else class="biz-table biz-table--dest">
          <thead>
            <tr>
              <th class="col-name">Name</th>
              <th class="col-city">Location</th>
              <th class="col-views">Views</th>
              <th class="col-clicks">Clicks</th>
              <th class="col-author">Added by</th>
              <th class="col-actions">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in destinations" :key="d._id" class="biz-row" :class="{ 'row-hidden-gem': d.isHiddenGem }">
              <td class="col-name" data-label="Name">
                <div class="row-name">
                  <span class="row-name-text">{{ d.name }}</span>
                  <span v-if="d.isHiddenGem" class="row-tag gem">✦ gem</span>
                </div>
              </td>
              <td class="col-city" data-label="Location">
                <template v-if="d.location?.city && d.location?.region && d.location.city !== d.location.region">
                  {{ d.location.city }}, {{ d.location.region }}
                </template>
                <template v-else>
                  {{ d.location?.city || d.location?.region || d.location?.country || '—' }}
                </template>
              </td>
              <td class="col-views" data-label="Views">{{ fmt(d.analytics?.views) }}</td>
              <td class="col-clicks" data-label="Clicks">{{ fmt(d.analytics?.clicks) }}</td>
              <td class="col-author" data-label="Added by">
                <template v-if="d.createdBy && typeof d.createdBy === 'object'">
                  {{ d.createdBy.name || d.createdBy.email || '—' }}
                </template>
                <template v-else>—</template>
              </td>
              <td class="col-actions" data-label="Action">
                <div class="action-group">
                  <!-- Owner-only: full action group (edit / toggle / delete).
                       canEditDest() returns true for admins and for the staff
                       member who created the destination — see definition in
                       <script> (around line 1651). -->
                  <template v-if="canEditDest(d)">
                    <button class="action-btn btn-edit" @click="openDestEdit(d)" title="Edit destination">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                    <button class="action-btn" :class="d.isActive ? 'btn-muted' : 'btn-accent'" @click="toggleDest(d)">
                      {{ d.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button class="action-btn btn-delete" @click="confirmDeleteDest(d)" title="Delete destination">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Delete
                    </button>
                  </template>
                  <!-- Non-owner: single View button. Opens the same modal in
                       read-only mode — staff can see the full record, photos,
                       map, hours, etc., but can't change anything. -->
                  <template v-else>
                    <button class="action-btn btn-muted" @click="openDestView(d)" title="View destination">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <!-- Pagination -->
    <div v-if="destinations.length && destTotalPages > 1" class="pagination">
      <button :disabled="destPage <= 1 || destLoading" @click="changeDestPage(-1)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Prev
      </button>
      <span>Page <strong>{{ destPage }}</strong> / {{ destTotalPages }} · {{ destTotal }} total</span>
      <button :disabled="destPage >= destTotalPages || destLoading" @click="changeDestPage(1)">
        Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- ════════════════════════════════════════════════════════════════
         Destination add / edit modal
         Uses the admin's .edit-overlay / .edit-panel chrome and the same
         section markup so the two forms look identical. Visual fidelity
         comes from the matching CSS at the bottom of this file, which
         mirrors AdminDashboard.vue's edit-panel rules.
         ════════════════════════════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="destModal.open" class="edit-overlay" @click.self="closeDestModal">
        <div class="edit-panel" :class="theme">

          <!-- Header ─ badge + title on the left, save + close on the right -->
          <div class="edit-header">
            <div class="edit-header-left">
              <!-- Badge swaps colour/text when staff is viewing someone
                   else's destination — makes it obvious nothing can be
                   changed without making it feel like an error state. -->
              <span class="edit-badge"
                    :style="destModal.readOnly ? 'background:rgba(99,102,241,0.18); color:#a5b4fc' : ''">
                {{ destModal.readOnly ? 'View only' : 'Destination' }}
              </span>
              <h2 class="edit-title">
                <template v-if="destModal.readOnly">View Destination</template>
                <template v-else-if="destModal.isNew">Add New Destination</template>
                <template v-else>Edit Destination</template>
              </h2>
            </div>
            <div class="edit-header-actions">
              <!-- Save button is hidden entirely in read-only mode — there's
                   nothing to save. Owners (and admin) still see it. -->
              <button v-if="!destModal.readOnly" class="edit-save-btn" :disabled="destModal.saving || !destFormValid" @click="submitDest">
                <svg v-if="!destModal.saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else class="loader-ring loader-ring--sm" style="width:14px;height:14px;border-width:2px"></div>
                {{ destModal.saving ? 'Saving…' : (destModal.isNew ? 'Create' : 'Save') }}
              </button>
              <button class="edit-close-btn" @click="closeDestModal" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Body ─ matches admin's destination edit form, section by section.
               When destModal.readOnly is true, .is-readonly disables every
               input / button visually (greyed) and via pointer-events: none.
               Cleaner than scattering :disabled across every field. -->
          <div class="edit-body" :class="{ 'is-readonly': destModal.readOnly }">

            <!-- ── Image Gallery (only when editing) ──────────────────────
                 First thing the staff sees when opening an existing
                 destination, so they can spot which one they're working on
                 at a glance. Mirrors admin's gallery: hero photo, prev/next
                 arrows, thumbnail strip, click-to-enlarge lightbox.
                 Hidden on create (no images yet) and when the destination
                 has no valid image URLs (empty state shown instead). -->
            <section v-if="!destModal.isNew" class="edit-section edit-gallery-section">
              <div class="edit-section-title edit-gallery-title-row">
                <span>Image Gallery</span>
                <span v-if="destGalleryImages.length" class="edit-gallery-counter">
                  {{ destModal.galleryIndex + 1 }} / {{ destGalleryImages.length }}
                </span>
              </div>

              <div v-if="destGalleryImages.length" class="edit-gallery">
                <!-- Hero (large) — clicking opens the lightbox -->
                <div class="edit-gallery-hero" @click="destModal.lightboxOpen = true">
                  <img
                    :src="destGalleryImages[Math.min(destModal.galleryIndex, destGalleryImages.length - 1)]"
                    class="edit-gallery-hero-img"
                    alt="Destination image"
                    @error="e => e.target.classList.add('edit-gallery-hero-img--error')"
                  />

                  <!-- Prev / Next arrows -->
                  <button
                    v-if="destGalleryImages.length > 1"
                    class="edit-gallery-nav edit-gallery-nav--prev"
                    @click.stop="destModal.galleryIndex = (destModal.galleryIndex - 1 + destGalleryImages.length) % destGalleryImages.length"
                    title="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    v-if="destGalleryImages.length > 1"
                    class="edit-gallery-nav edit-gallery-nav--next"
                    @click.stop="destModal.galleryIndex = (destModal.galleryIndex + 1) % destGalleryImages.length"
                    title="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>

                  <!-- Expand hint -->
                  <div class="edit-gallery-expand-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                    <span>Click to enlarge</span>
                  </div>
                </div>

                <!-- Thumbnail strip -->
                <div v-if="destGalleryImages.length > 1" class="edit-gallery-strip">
                  <button
                    v-for="(url, idx) in destGalleryImages"
                    :key="'thumb-'+idx"
                    class="edit-gallery-thumb"
                    :class="{ 'edit-gallery-thumb--active': idx === destModal.galleryIndex }"
                    @click="destModal.galleryIndex = idx"
                    :title="'Image ' + (idx + 1)"
                  >
                    <img :src="url" :alt="'Image ' + (idx + 1)" @error="e => e.target.style.display='none'" />
                  </button>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else class="edit-gallery-empty">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div class="edit-gallery-empty-title">No images yet</div>
                <div class="edit-gallery-empty-sub">Scroll down to the “Images” section to add image URLs.</div>
              </div>
            </section>

            <!-- Basic Info: name + location grid (admin's exact layout) -->
            <section class="edit-section">
              <div class="edit-section-title">Basic Info</div>
              <div class="edit-grid-2">
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Name *</label>
                  <input class="edit-input" v-model="destModal.form.name" placeholder="Name" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Region</label>
                  <input class="edit-input" v-model="destModal.form.location.region" placeholder="e.g. South Armenia" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">City</label>
                  <input class="edit-input" v-model="destModal.form.location.city" :placeholder="defaultCityHint" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Country</label>
                  <input class="edit-input" v-model="destModal.form.location.country" :placeholder="defaultCountryHint" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Address</label>
                  <input class="edit-input" v-model="destModal.form.location.address" placeholder="Street address" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Latitude</label>
                  <input class="edit-input" type="number" step="any" v-model.number="destModal.form.location.coordinates.lat" placeholder="40.177" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Longitude</label>
                  <input class="edit-input" type="number" step="any" v-model.number="destModal.form.location.coordinates.lng" placeholder="44.503" />
                </div>
              </div>
              <div v-if="destModal.scopeWarning" class="edit-warn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ destModal.scopeWarning }}
              </div>
            </section>

            <!-- ── Location Map (admin's exact section) ────────────────────
                 Leaflet map with a draggable pin. Type an address + city
                 above → the map locates it automatically. Drag the pin to
                 fine-tune. Faint dots are other destinations and businesses
                 nearby for context — no zone limits apply when staff edits
                 a destination they own. -->
            <section class="edit-section">
              <div class="edit-section-title dest-map-title-row">
                <span>Location on Map</span>
                <span class="dest-map-status" :class="`dest-map-status--${destMap.statusClass}`">{{ destMap.statusText }}</span>
              </div>
              <div class="dest-map-hint">
                Type an address and city above — the map will locate it automatically. Drag the pin to fine-tune the exact spot. Nearby destinations and businesses are shown as faint dots for context.
              </div>
              <div id="staff-dest-map" class="dest-map"></div>
              <div class="dest-map-actions">
                <button type="button" class="action-btn btn-muted" :disabled="destMap.loading || !destMap.canSearch" @click="reGeocodeDestination">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>
                  {{ destMap.loading ? 'Searching…' : 'Re-locate from address' }}
                </button>
                <span v-if="destModal.readOnly && destModal.form.location.coordinates.lat && destModal.form.location.coordinates.lng" class="dest-map-coords">
                  {{ Number(destModal.form.location.coordinates.lat).toFixed(5) }}, {{ Number(destModal.form.location.coordinates.lng).toFixed(5) }}
                </span>
              </div>
              <!-- Manual coordinates — for places Nominatim can't find or puts
                   in the wrong spot. Type lat/lng (or click the map / drag the
                   pin) and the form uses these exact coordinates. -->
              <div v-if="!destModal.readOnly" class="dest-map-manual">
                <input class="edit-input dest-coord-input" type="number" step="0.000001" min="-90" max="90"
                       v-model.number="destModal.form.location.coordinates.lat" placeholder="Latitude"/>
                <input class="edit-input dest-coord-input" type="number" step="0.000001" min="-180" max="180"
                       v-model.number="destModal.form.location.coordinates.lng" placeholder="Longitude"/>
                <button type="button" class="action-btn btn-muted" @click="applyManualCoords">Set on map</button>
                <span class="edit-help-sub" style="margin:0">or click the map to drop the pin</span>
              </div>
            </section>

            <!-- Types & Tags: admin's exact chip grid -->
            <section class="edit-section">
              <div class="edit-section-title">Types &amp; Tags</div>
              <div class="edit-type-grid">
                <label v-for="t in ALL_DEST_TYPES" :key="t" class="edit-type-chip" :class="{ active: destModal.form.type.includes(t) }" @click="toggleDestType(t)">
                  {{ t }}
                </label>
              </div>
            </section>

            <!-- Description -->
            <section class="edit-section">
              <div class="edit-section-title">Description</div>
              <textarea class="edit-textarea edit-textarea--description" v-model="destModal.form.description" rows="7" placeholder="Describe this destination…"></textarea>
            </section>

            <!-- Extra Details (destination-only fields) — same layout as admin -->
            <section class="edit-section">
              <div class="edit-section-title">Extra Details</div>
              <div class="edit-grid-2">
                <div class="edit-field">
                  <label class="edit-label">Best Time to Visit</label>
                  <input class="edit-input" v-model="destModal.form.bestTimeToVisit" placeholder="e.g. April–June" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Popularity (0–100)</label>
                  <input class="edit-input" type="number" min="0" max="100" v-model.number="destModal.form.popularity" />
                </div>
                <!-- Hidden Gem flag is derived from the 'hidden_gems' chip in
                     Types & Tags (see submitDest), and Active is toggled from
                     the destinations table's Activate / Deactivate button.
                     Same rule as the admin form. -->
              </div>
            </section>

            <!-- Contact (admin's exact 2-col layout, with show/hide email toggle) -->
            <section class="edit-section">
              <div class="edit-section-title">Contact</div>
              <div class="edit-grid-2">
                <div class="edit-field">
                  <label class="edit-label">Email</label>
                  <div class="edit-input-wrap">
                    <input class="edit-input edit-input--with-trailing" v-model="destModal.form.contact.email" placeholder="info@example.com" />
                    <button type="button" class="edit-input-icon-btn"
                            :class="{ 'edit-input-icon-btn--on': destModal.form.contact.showEmail }"
                            @click="destModal.form.contact.showEmail = !destModal.form.contact.showEmail"
                            :title="destModal.form.contact.showEmail ? 'Email is shown publicly — click to hide' : 'Email is hidden — click to show publicly'">
                      <svg v-if="destModal.form.contact.showEmail" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                  </div>
                </div>
                <div class="edit-field">
                  <label class="edit-label">Phone</label>
                  <div class="edit-phone-wrap">
                    <span class="edit-phone-prefix">+</span>
                    <input class="edit-input edit-phone-input" type="text" inputmode="numeric"
                           v-model="destModal.form.contact.phone"
                           placeholder="1 212 555 0100" maxlength="20"
                           @input="destModal.form.contact.phone = $event.target.value.replace(/[^0-9\s]/g, '')" />
                  </div>
                </div>
                <div class="edit-field">
                  <label class="edit-label">Website</label>
                  <input class="edit-input" v-model="destModal.form.contact.website" placeholder="https://…" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Facebook</label>
                  <input class="edit-input" v-model="destModal.form.contact.socialMedia.facebook" placeholder="https://facebook.com/…" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Instagram</label>
                  <input class="edit-input" v-model="destModal.form.contact.socialMedia.instagram" placeholder="https://instagram.com/…" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">TripAdvisor</label>
                  <input class="edit-input" v-model="destModal.form.contact.socialMedia.tripadvisor" placeholder="https://tripadvisor.com/…" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Booking.com</label>
                  <input class="edit-input" v-model="destModal.form.contact.socialMedia.booking" placeholder="https://booking.com/hotel/…" />
                </div>
              </div>
            </section>

            <!-- Opening Hours (admin's exact 24/7 button + day rows) -->
            <section class="edit-section">
              <div class="edit-section-title">Opening Hours</div>
              <div class="edit-field" style="margin-bottom: 12px">
                <label class="edit-label">Availability</label>
                <button type="button" class="edit-free-btn"
                        :class="{ 'edit-free-btn--active': destModal.form.openingHours.is24Hours }"
                        @click="destModal.form.openingHours.is24Hours = !destModal.form.openingHours.is24Hours">
                  <svg v-if="destModal.form.openingHours.is24Hours" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                  Open 24/7
                </button>
                <span class="edit-help-sub">Click if this place is open around the clock — per-day hours below will be hidden.</span>
              </div>
              <div v-if="!destModal.form.openingHours.is24Hours" class="edit-hours-list">
                <div v-for="(d, di) in destModal.form.openingHours.days" :key="d.day" class="edit-hours-row">
                  <span class="edit-hours-day">{{ d.day }}</span>
                  <div class="edit-hours-pills">
                    <button type="button" class="edit-hours-pill" :class="{ 'edit-hours-pill--active': !d.closed }" @click="d.closed = false">Open</button>
                    <button type="button" class="edit-hours-pill edit-hours-pill--close" :class="{ 'edit-hours-pill--active': d.closed }" @click="d.closed = true">Closed</button>
                  </div>
                  <input v-if="!d.closed" type="time" v-model="d.open"  class="edit-hours-time" />
                  <span  v-if="!d.closed" class="edit-hours-sep">–</span>
                  <input v-if="!d.closed" type="time" v-model="d.close" class="edit-hours-time" />
                  <span  v-else class="edit-hours-closed-text">Closed all day</span>
                  <button v-if="di === 0 && !d.closed" type="button" class="edit-hours-all-btn" @click="applyHoursToAllDays" title="Copy these hours to every day of the week">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Apply to all days
                  </button>
                </div>
              </div>
              <div v-else class="edit-help-sub">This place is open 24 hours a day, every day.</div>
            </section>

            <!-- Authorship (only when editing, only if createdBy populated) -->
            <section v-if="!destModal.isNew && destModal.form.createdBy" class="edit-section">
              <div class="edit-section-title">Authorship</div>
              <div class="edit-help-sub">
                Added by <strong>{{ verifierLabel(destModal.form.createdBy) }}</strong>
              </div>
            </section>

            <!-- Pricing (admin's exact Free button + currency chips + min/max/avg) -->
            <section class="edit-section">
              <div class="edit-section-title">Pricing</div>
              <div class="edit-field" style="margin-bottom: 12px">
                <label class="edit-label">Pricing Type</label>
                <button type="button" class="edit-free-btn"
                        :class="{ 'edit-free-btn--active': destModal.form.pricing.isFree }"
                        @click="() => {
                          const next = !destModal.form.pricing.isFree;
                          destModal.form.pricing.isFree = next;
                          if (next) {
                            destModal.form.pricing.min = null;
                            destModal.form.pricing.max = null;
                            destModal.form.pricing.average = null;
                          }
                        }">
                  <svg v-if="destModal.form.pricing.isFree" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
                  Free
                </button>
                <span class="edit-help-sub">Click if entry to this destination is free — min / max / average will be cleared.</span>
              </div>
              <div class="edit-field" style="margin-bottom: 12px">
                <label class="edit-label">Currency</label>
                <div class="edit-currency-chips" :class="{ 'edit-currency-chips--disabled': destModal.form.pricing.isFree }">
                  <button v-for="cur in PRICING_CURRENCIES" :key="cur" type="button"
                          class="edit-currency-chip"
                          :class="{ 'edit-currency-chip--active': destModal.form.pricing.currency === cur }"
                          :disabled="destModal.form.pricing.isFree"
                          @click="destModal.form.pricing.currency = cur">
                    {{ cur }}
                  </button>
                </div>
              </div>
              <div class="edit-grid-2">
                <div class="edit-field">
                  <label class="edit-label">Min Price</label>
                  <input class="edit-input" type="number" min="0" v-model.number="destModal.form.pricing.min" :disabled="destModal.form.pricing.isFree" placeholder="e.g. 10" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Max Price</label>
                  <input class="edit-input" type="number" min="0" v-model.number="destModal.form.pricing.max" :disabled="destModal.form.pricing.isFree" placeholder="e.g. 60" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Average Price</label>
                  <input class="edit-input" type="number" min="0" v-model.number="destModal.form.pricing.average" :disabled="destModal.form.pricing.isFree" placeholder="e.g. 25" />
                </div>
              </div>
            </section>

            <!-- Images (URL list — admin's row layout with thumbnail + delete) -->
            <section class="edit-section">
              <div class="edit-section-title">Images</div>
              <div class="edit-help-sub" style="margin-bottom:8px">
                Leave empty to fetch photos from Google automatically (by name + address).
                Pasted URLs are downloaded and stored on save — dead links are reported immediately — and always override the Google photos.
              </div>
              <div class="edit-img-list">
                <div v-for="(url, idx) in destModal.form.images" :key="idx" class="edit-img-row">
                  <div class="edit-img-thumb-wrap">
                    <img v-if="url" :src="url" class="edit-img-thumb" @error="e=>e.target.style.display='none'" />
                    <div v-else class="edit-img-thumb-empty">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  </div>
                  <input class="edit-input edit-img-input" v-model="destModal.form.images[idx]" placeholder="https://…" />
                  <button class="edit-img-del" @click="destModal.form.images.splice(idx,1)" title="Remove image">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <button class="edit-add-img-btn" @click="destModal.form.images.push('')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add URL
                </button>
              </div>
            </section>

            <div v-if="destModal.error" class="edit-error-banner">{{ destModal.error }}</div>
          </div><!-- /edit-body -->
        </div><!-- /edit-panel -->
      </div>
    </transition>

    <!-- ── Image lightbox ─────────────────────────────────────────────
         Shown when the staff clicks the hero in the edit modal's image
         gallery. Same dark overlay used by the admin lightbox: full-bleed
         image with a close button. Esc / overlay click also closes. -->
    <transition name="modal-fade">
      <div v-if="destModal.lightboxOpen" class="dest-lightbox" @click.self="destModal.lightboxOpen = false">
        <button class="dest-lightbox-close" @click="destModal.lightboxOpen = false" title="Close (Esc)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <img
          v-if="destGalleryImages.length"
          :src="destGalleryImages[Math.min(destModal.galleryIndex, destGalleryImages.length - 1)]"
          class="dest-lightbox-img"
          alt="Destination image enlarged"
        />
        <!-- Prev / Next inside the lightbox -->
        <button
          v-if="destGalleryImages.length > 1"
          class="dest-lightbox-nav dest-lightbox-nav--prev"
          @click="destModal.galleryIndex = (destModal.galleryIndex - 1 + destGalleryImages.length) % destGalleryImages.length">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button
          v-if="destGalleryImages.length > 1"
          class="dest-lightbox-nav dest-lightbox-nav--next"
          @click="destModal.galleryIndex = (destModal.galleryIndex + 1) % destGalleryImages.length">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </transition>

    <!-- ── Delete confirm ─────────────────────────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="destDeleteTarget" class="edit-overlay" @click.self="destDeleteTarget = null">
        <div class="edit-panel" :class="theme" style="max-width: 460px">
          <div class="edit-header">
            <div class="edit-header-left">
              <span class="edit-badge" style="background:rgba(239,68,68,0.15); color:#ef4444">Delete</span>
              <h2 class="edit-title">Delete this destination?</h2>
            </div>
            <button class="edit-close-btn" @click="destDeleteTarget = null">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="edit-body">
            <p style="margin:0 0 16px; line-height:1.6; font-size:14px">
              <strong>{{ destDeleteTarget.name }}</strong> will be permanently removed.
              This cannot be undone — users will lose access to it immediately.
            </p>
            <div style="display:flex; gap:10px; justify-content:flex-end">
              <button class="action-btn btn-muted" @click="destDeleteTarget = null" :disabled="destDeleteBusy">Cancel</button>
              <button class="action-btn btn-delete" @click="executeDestDelete" :disabled="destDeleteBusy">
                {{ destDeleteBusy ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    </template>
    <!-- ════════════════════════════════════════════════════════════════
         /DESTINATIONS TAB
         ════════════════════════════════════════════════════════════════ -->

    <!-- ════════════════════════════════════════════════════════════════
         EXPLORE MODERATION TAB
         For staff with permissions.moderateExplore === true.
         Post-moderation queue over the places cache: everything is visible
         by default; staff bury garbage (Hide) or endorse places (Verify).
         Sorted suspicion-first (most disliked → lowest rated) server-side.
         ════════════════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'explore'">

    <div v-if="scopeBanner" class="scope-banner" :class="{ 'scope-banner--empty': scopeBanner.empty }">
      <svg v-if="scopeBanner.empty" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <div class="scope-banner-body">
        <template v-if="scopeBanner.empty">
          <strong>No territory assigned.</strong>
          You can only moderate Explore places inside countries / cities your admin assigns to you.
        </template>
        <template v-else>
          <span class="scope-banner-label">Moderating:</span>
          <strong>{{ scopeBanner.countries.join(', ') || '—' }}</strong>
          <span v-if="scopeBanner.cities.length" class="scope-banner-cities">+ cities: {{ scopeBanner.cities.join(', ') }}</span>
        </template>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <div class="filter-chips">
          <button v-for="opt in expStatusOpts" :key="opt.value"
                  class="chip" :class="{ active: expStatus === opt.value }"
                  @click="expStatus = opt.value; expPage = 1; loadExplorePlaces()">
            {{ opt.label }}<span v-if="opt.countKey != null && expCounts[opt.countKey] != null" class="chip-count"> {{ fmt(expCounts[opt.countKey]) }}</span>
          </button>
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-label">Category</label>
        <div class="filter-chips">
          <button class="chip" :class="{ active: !expCategory }" @click="expCategory = ''; expPage = 1; loadExplorePlaces()">All</button>
          <button v-for="c in expCategories" :key="c.value"
                  class="chip" :class="{ active: expCategory === c.value }"
                  @click="expCategory = c.value; expPage = 1; loadExplorePlaces()">
            {{ c.label }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-label">Search</label>
        <input v-model="expSearchInput" type="text" class="filter-input" placeholder="Search places…" @input="onExpSearchInput" />
      </div>
    </div>

    <main class="main-grid">
      <section class="table-wrap">
        <div v-if="expLoading && !expPlaces.length" class="table-empty">
          <div class="spinner"/>
          <span>Loading places…</span>
        </div>

        <div v-else-if="!expPlaces.length" class="table-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          <span>No cached places found in your scope.</span>
        </div>

        <table v-else class="biz-table biz-table--explore">
          <thead>
            <tr>
              <th class="col-name">Place</th>
              <th class="col-city">Location</th>
              <th class="col-rating">Rating</th>
              <th class="col-feedback">Feedback</th>
              <th class="col-status">Status</th>
              <th class="col-actions">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in expPlaces" :key="p.placeId" class="biz-row exp-row" @click="openExpPlace(p)">
              <td class="col-name" data-label="Place">
                <div class="exp-place-cell">
                  <img v-if="p.imagesStored" :src="`${apiRoot}/ai/place-image/${p.placeId}/0`" class="exp-thumb" loading="lazy" @error="$event.target.style.visibility='hidden'"/>
                  <div v-else class="exp-thumb exp-thumb--empty">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
                  </div>
                  <div class="row-name">
                    <span class="row-name-text">{{ p.name }}</span>
                    <span class="exp-cats">{{ (p.actions || []).join(' · ') }}</span>
                  </div>
                </div>
              </td>
              <td class="col-city" data-label="Location">{{ p.city || p.country || p.details?.formatted_address || '—' }}</td>
              <td class="col-rating" data-label="Rating">
                <span v-if="Number.isFinite(p.rating)" :class="{ 'exp-rating-low': p.rating < 3.5 }">★ {{ p.rating.toFixed(1) }}</span>
                <span v-else>—</span>
              </td>
              <td class="col-feedback" data-label="Feedback">
                <span class="exp-fb">👍 {{ p.likes || 0 }}&nbsp;&nbsp;👎 {{ p.dislikes || 0 }}</span>
              </td>
              <td class="col-status" data-label="Status">
                <span class="exp-status" :class="'exp-status--' + (p.explore?.status || 'visible')">
                  {{ p.explore?.status === 'verified' ? '✓ Verified' : (p.explore?.status === 'hidden' ? 'Hidden' : 'Visible') }}
                </span>
              </td>
              <td class="col-actions" data-label="Action" @click.stop>
                <div class="action-group">
                  <button v-if="p.explore?.status !== 'verified'" class="action-btn exp-btn-verify" :disabled="expBusy === p.placeId" @click="setExpStatus(p, 'verified')">Verify</button>
                  <button v-if="p.explore?.status !== 'hidden'" class="action-btn exp-btn-hide" :disabled="expBusy === p.placeId" @click="setExpStatus(p, 'hidden')">Hide</button>
                  <button v-if="p.explore?.status === 'hidden' || p.explore?.status === 'verified'" class="action-btn btn-muted" :disabled="expBusy === p.placeId" @click="setExpStatus(p, 'visible')">Reset</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <div v-if="expPlaces.length && expTotalPages > 1" class="pagination">
      <button :disabled="expPage <= 1 || expLoading" @click="changeExpPage(-1)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Prev
      </button>
      <span>Page <strong>{{ expPage }}</strong> / {{ expTotalPages }} · {{ expTotal }} total</span>
      <button :disabled="expPage >= expTotalPages || expLoading" @click="changeExpPage(1)">
        Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- ── Place detail modal — click a row to inspect everything the cache
         knows about a place (all stored images, contacts, hours, stats)
         before deciding to hide or verify it. ── -->
    <transition name="fade">
      <div v-if="expSelected" class="modal-overlay" @click.self="expSelected = null">
        <div class="exp-modal">
          <button class="exp-modal-close" @click="expSelected = null" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div v-if="expImages.length" class="exp-modal-imgs">
            <img v-for="(im, i) in expImages" :key="i" :src="apiOrigin + im.url" class="exp-modal-img" loading="lazy" @error="$event.target.remove()"/>
          </div>
          <div v-else class="exp-modal-imgs exp-modal-imgs--empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
            <span>{{ expImagesLoading ? 'Loading images…' : 'No stored images' }}</span>
          </div>

          <div class="exp-modal-body">
            <h3 class="exp-modal-title">
              {{ expSelected.name }}
              <span class="exp-status" :class="'exp-status--' + (expSelected.explore?.status || 'visible')">
                {{ expSelected.explore?.status === 'verified' ? '✓ Verified' : (expSelected.explore?.status === 'hidden' ? 'Hidden' : 'Visible') }}
              </span>
            </h3>
            <div class="exp-modal-cats">{{ (expSelected.actions || []).join(' · ') }}<template v-if="expSelected.primaryType"> — {{ expSelected.primaryType }}</template></div>

            <dl class="exp-modal-info">
              <template v-if="expSelected.details?.formatted_address"><dt>Address</dt><dd>{{ expSelected.details.formatted_address }}</dd></template>
              <template v-if="Number.isFinite(expSelected.rating)"><dt>Rating</dt><dd><span :class="{ 'exp-rating-low': expSelected.rating < 3.5 }">★ {{ expSelected.rating.toFixed(1) }}</span></dd></template>
              <dt>Feedback</dt><dd>👍 {{ expSelected.likes || 0 }} &nbsp; 👎 {{ expSelected.dislikes || 0 }}</dd>
              <template v-if="expPrice(expSelected)"><dt>Price</dt><dd>{{ expPrice(expSelected) }}</dd></template>
              <template v-if="expSelected.website"><dt>Website</dt><dd><a :href="expSelected.website" target="_blank" rel="noopener noreferrer">{{ expSelected.website }}</a></dd></template>
              <template v-if="expSelected.formatted_phone_number || expSelected.international_phone_number"><dt>Phone</dt><dd>{{ expSelected.formatted_phone_number || expSelected.international_phone_number }}</dd></template>
              <template v-if="expSelected.eventSchedule?.startDate"><dt>Event</dt><dd>{{ fmtD(expSelected.eventSchedule.startDate) }}<template v-if="expSelected.eventSchedule.endDate"> – {{ fmtD(expSelected.eventSchedule.endDate) }}</template><template v-if="expSelected.eventSchedule.isRecurring"> (recurring)</template></dd></template>
              <template v-if="expSelected.types?.length"><dt>Google types</dt><dd class="exp-modal-types">{{ expSelected.types.join(', ') }}</dd></template>
              <dt>Cache</dt><dd>Used {{ fmt(expSelected.useCount || 0) }}× · fetched {{ fmt(expSelected.fetchCount || 0) }}× · added {{ fmtD(expSelected.createdAt) }} · last used {{ fmtD(expSelected.lastUsed) }}</dd>
              <template v-if="expSelected.explore?.reviewedAt"><dt>Reviewed</dt><dd>{{ fmtD(expSelected.explore.reviewedAt) }}</dd></template>
            </dl>

            <div v-if="expSelected.opening_hours?.weekday_text?.length" class="exp-modal-hours">
              <div class="exp-modal-hours-title">Opening hours</div>
              <div v-for="line in expSelected.opening_hours.weekday_text" :key="line" class="exp-modal-hours-line">{{ line }}</div>
            </div>

            <div class="exp-modal-actions">
              <a v-if="expMapsUrl(expSelected)" class="action-btn btn-muted" :href="expMapsUrl(expSelected)" target="_blank" rel="noopener noreferrer">Open in Maps</a>
              <span style="flex:1"></span>
              <button v-if="expSelected.explore?.status !== 'verified'" class="action-btn exp-btn-verify" :disabled="expBusy === expSelected.placeId" @click="setExpStatus(expSelected, 'verified')">Verify</button>
              <button v-if="expSelected.explore?.status !== 'hidden'" class="action-btn exp-btn-hide" :disabled="expBusy === expSelected.placeId" @click="setExpStatus(expSelected, 'hidden')">Hide</button>
              <button v-if="expSelected.explore?.status === 'hidden' || expSelected.explore?.status === 'verified'" class="action-btn btn-muted" :disabled="expBusy === expSelected.placeId" @click="setExpStatus(expSelected, 'visible')">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    </template>
    <!-- ════════════════════════════════════════════════════════════════
         /EXPLORE MODERATION TAB
         ════════════════════════════════════════════════════════════════ -->

    <!-- ── Confirm modal ────────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="confirmingAction" class="modal-overlay" @click.self="confirmingAction = null">
        <div class="modal" :class="theme">
          <h3 class="modal-title">
            {{ confirmingAction === 'approve' ? 'Approve this business?'
               : confirmingAction === 'reject_permanent' ? 'Permanently reject this application?'
               : 'Reject this application?' }}
          </h3>
          <p class="modal-body">
            <template v-if="confirmingAction === 'approve'">
              <!-- Warn BEFORE the click, not after. Server-side guard in
                   POST /business/:id/approve will reject the request and
                   return event_already_ended, but it's friendlier to tell
                   staff up-front what will actually happen. -->
              <template v-if="isEventListingExpired(selected)">
                <span class="modal-warn-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-right:6px;color:var(--warn)">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <strong>This event's end-date has already passed.</strong>
                </span>
                Approving will mark <strong>{{ selected.name }}</strong> as <em>expired</em> instead of active — travelers won't see it. The owner needs to reschedule it from their dashboard before it can be approved for a new date.
              </template>
              <template v-else>
                <strong>{{ selected.name }}</strong> will be activated as
                <span class="tier-pill" :class="selected.partnership?.tier">{{ tierLabel(selected.partnership?.tier) }}</span>.
                The zone resolution will run again — if the zone is now full, the lowest performer is displaced.
                The owner will receive an approval email.
              </template>
            </template>
            <template v-else-if="confirmingAction === 'reject_permanent'">
              <span class="modal-warn-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-right:6px;color:var(--bad)">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <strong>This is permanent.</strong>
              </span>
              <strong>{{ selected.name }}</strong> will be permanently rejected. The owner <strong>cannot edit or resubmit</strong> it, and their email, phone, name + city, IP, and account will be added to the blocklist so they can't re-apply. Only an admin can reverse this later. Use it for spam or bad-faith listings — not for fixable mistakes.
            </template>
            <template v-else>
              <strong>{{ selected.name }}</strong> will be marked as rejected.
              A rejection email will be sent to the owner with the reason below, and they can fix the issues and resubmit.
            </template>
          </p>
          <textarea v-if="isRejectFlow" v-model="rejectReason" class="staff-note" rows="3" placeholder="Reason (sent to the owner)…"/>
          <!-- Optional: also add this owner's email/phone to the blocklist
               as a 'watch' entry. Future applications from these fingerprints
               will show a warning banner in the validation queue. SOFT reject
               only — a permanent reject already blocks every fingerprint. -->
          <div v-if="confirmingAction === 'reject' && rejectReason && rejectReason.trim()" class="flag-options">
            <label class="flag-checkbox">
              <input type="checkbox" v-model="rejectFlagFingerprints" />
              <span>
                Also flag this owner's contact info for future submissions
                <span class="muted-sm flag-helper">
                  Adds a watchlist entry so future applications from these details show a warning to staff.
                </span>
              </span>
            </label>
            <div v-if="rejectFlagFingerprints" class="flag-type-picker">
              <label v-for="t in ['email','phone','ip']" :key="t" class="flag-type-option">
                <input type="checkbox" :value="t" v-model="rejectFlagTypes" />
                <span>{{ t }}</span>
              </label>
            </div>
          </div>
          <div v-if="confirmingAction === 'reject_permanent'" class="flag-options flag-options--permanent">
            <span class="muted-sm">
              On permanent rejection these fingerprints are blocked automatically:
              <strong>email, phone, name + city, IP, account</strong>.
            </span>
          </div>
          <div class="modal-actions">
            <button class="ghost-btn" @click="confirmingAction = null" :disabled="actionBusy">Cancel</button>
            <button class="action-btn" :class="confirmingAction" @click="executeAction" :disabled="actionBusy || (isRejectFlow && !rejectReason.trim())">
              {{ actionBusy ? 'Working…'
                 : confirmingAction === 'approve' ? 'Approve'
                 : confirmingAction === 'reject_permanent' ? 'Reject permanently'
                 : 'Reject' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Logout confirm modal ─────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="confirmLogout" class="modal-overlay" @click.self="confirmLogout = false">
        <div class="modal" :class="theme">
          <h3 class="modal-title">Sign out?</h3>
          <p class="modal-body">
            You'll be returned to the login page. Any unsaved staff notes in the open drawer will be lost.
          </p>
          <div class="modal-actions">
            <button class="ghost-btn" @click="confirmLogout = false">Cancel</button>
            <button class="action-btn reject" @click="doLogout">Sign out</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Toast ────────────────────────────────────────────────────── -->
    <transition name="slide-up">
      <div v-if="toast" class="toast" :class="toast.kind">{{ toast.text }}</div>
    </transition>
  </div>
</template>



<script>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { isNightTime } from '@/utils/timeUtils'
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.5:5000/api'
// Status keys & labels — match Business.js enum
// 'expired' was added when one-time events past their end-date became their
// own first-class status (separate from the displacement-driven 'frozen'),
// so staff can filter for and clean up dead event listings.
const STATUSES = [
  { key: 'pending',    label: 'Pending'    },
  { key: 'active',     label: 'Active'     },
  { key: 'waitlisted', label: 'Waitlisted' },
  { key: 'frozen',     label: 'Frozen'     },
  { key: 'rejected',   label: 'Rejected'   },
  { key: 'expired',    label: 'Expired'    },
  { key: 'all',        label: 'All'        },
]
const TIERS = [
  { key: '',          label: 'Any'       },
  { key: 'verified',  label: 'Verified'  },
  { key: 'spotlight', label: 'Spotlight' },
  { key: 'signature', label: 'Signature' },
]
const PRIMARY_CATS = ['restaurants', 'hotels', 'events', 'historical', 'hidden_gems']
const INTEREST_TAGS = ['cultural','history','adventure','relaxation','nature','art','nightlife','food&drink']
const STYLE_TAGS    = ['family','romantic','luxury','budget']

export default {
  name: 'StaffValidation',
  setup() {
    const store = useStore()
    // ── Theme (matches the rest of the app) ─────────────────────────
    const theme = ref('night-mode')
    const computeTheme = () => {
      try {
        const t = JSON.parse(localStorage.getItem('jinni_settings') || '{}').theme
        if (t === 'dark') return 'night-mode'
        if (t === 'light') return 'day-mode'
      } catch {}
      return isNightTime() ? 'night-mode' : 'day-mode'
    }
    theme.value = computeTheme()
    const toggleTheme = () => {
      const next = theme.value === 'night-mode' ? 'day-mode' : 'night-mode'
      const pref = next === 'night-mode' ? 'dark' : 'light'
      theme.value = next
      try {
        const settings = JSON.parse(localStorage.getItem('jinni_settings') || '{}')
        settings.theme = pref
        localStorage.setItem('jinni_settings', JSON.stringify(settings))
      } catch {}
      // Mirror JinniChat.applySettings: keep global theme hooks in sync.
      // <html data-theme> and <body class="theme-*"> are what the rest of the
      // app's global CSS uses to paint the page background — without these,
      // body keeps its previous theme class and shows gray on switch.
      try {
        document.documentElement.setAttribute('data-theme', pref)
        document.body.classList.remove('theme-light', 'theme-dark')
        document.body.classList.add(`theme-${pref}`)
      } catch {}
      // Dispatch to Vuex so App.vue updates <html> background — this is what
      // Safari samples for the browser chrome / status bar color.
      try { store.dispatch('settings/setPreference', pref) } catch {}
    }
    // Apply once on mount so body classes match local theme even on first paint.
    const applyThemeHooks = () => {
      const pref = theme.value === 'night-mode' ? 'dark' : 'light'
      try {
        document.documentElement.setAttribute('data-theme', pref)
        document.body.classList.remove('theme-light', 'theme-dark')
        document.body.classList.add(`theme-${pref}`)
      } catch {}
    }
    applyThemeHooks()
    // ── List state ──────────────────────────────────────────────────
    const status = ref('pending')
    const tier = ref('')
    const cityInput = ref('')
    const cityFilter = ref('')
    const page = ref(1)
    const limit = ref(20)
    const total = ref(0)
    const businesses = ref([])
    const counts = ref({})
    const listLoading = ref(false)
    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
    let cityDebounce = null
    const onCityInput = () => {
      clearTimeout(cityDebounce)
      cityDebounce = setTimeout(() => {
        cityFilter.value = cityInput.value.trim()
        page.value = 1
        loadList()
      }, 300)
    }
    const setStatus = (s) => { status.value = s; page.value = 1; loadList() }
    const setTier   = (t) => { tier.value = t;   page.value = 1; loadList() }
    const changePage = (delta) => {
      const next = page.value + delta
      if (next < 1 || next > totalPages.value) return
      page.value = next
      loadList()
    }
    const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('authToken')}` })
    // ── Logout ──────────────────────────────────────────────────────
    // Confirm-then-execute. Uses the same modal styling as approve/reject.
    // Mirrors AdminDashboard.handleLogout: clear both legacy and current
    // token keys, then bounce to /auth.
    const router = useRouter()
    const confirmLogout = ref(false)
    const doLogout = () => {
      try {
        localStorage.removeItem('authToken')
        localStorage.removeItem('token')
      } catch { /* localStorage may be unavailable in private mode */ }
      confirmLogout.value = false
      router.push('/auth')
    }
    // True when backend reports the staff has no countries/cities assigned.
    // Drives the warning banner above the filter bar.
    const noScope = ref(false)
    async function loadList(force = false) {
      listLoading.value = true
      try {
        const params = { status: status.value, page: page.value, limit: limit.value }
        if (tier.value) params.tier = tier.value
        if (cityFilter.value) params.city = cityFilter.value
        const { data } = await axios.get(`${API_URL}/business`, { params, headers: authHeader() })
        businesses.value = data.businesses || []
        total.value = data.total || 0
        noScope.value = !!data.noScope
      } catch (err) {
        console.error('[staff] list error:', err)
        showToast(err.response?.data?.error || 'Failed to load applications', 'error')
        businesses.value = []
        total.value = 0
      } finally {listLoading.value = false}
      if (force) loadCounts()
    }
    // Counts per status — fired in parallel, lightweight (we only need total)
    async function loadCounts() {
      const next = {}
      await Promise.all(STATUSES.map(async s => {
        try {
          const { data } = await axios.get(`${API_URL}/business`, {params: { status: s.key, page: 1, limit: 1 }, headers: authHeader()})
          next[s.key] = data.total || 0
        } catch { next[s.key] = 0 }
      }))
      counts.value = next
    }
    // ── Self profile (for the scope banner) ─────────────────────────
    // Reads the authenticated user's staffAssignment for the territory banner.
    // Tries the common endpoint paths in order — different deployments mount
    // /me under /auth, /users, or /user. Whichever resolves first wins.
    //
    // Also captures `permissions` from `/staff/me` (new endpoint we own) when
    // available — used to decide whether to show the Destinations tab.
    const myAssignment = ref(null)
    const userName = ref('')
    const userRole = ref('user')           // 'staff' | 'admin' | 'user'
    const myPermissions = ref({ validateBusinesses: true, manageDestinations: false, moderateExplore: false })
    const meEndpointHit = ref(null)        // for debug visibility
    async function loadMyAssignment() {
      // Try our own staff /me first because it ships permissions in a
      // predictable shape. The legacy endpoints come next as fallbacks for
      // older deployments where staff routes aren't mounted yet.
      const candidates = ['/staff/me', '/auth/me', '/users/me', '/user/me', '/me']
      for (const path of candidates) {
        try {
          const { data } = await axios.get(`${API_URL}${path}`, { headers: authHeader() })
          // Accept any of: { user: {...} }, { data: {...} }, or the user doc directly.
          const u = data?.user || data?.data || data
          if (u && (u.staffAssignment || u.role || u.permissions)) {
            myAssignment.value = u.staffAssignment || null
            userName.value = u.name || (u.email ? u.email.split('@')[0] : '')
            userRole.value = u.role || (u.isAdmin ? 'admin' : 'user')
            // Capture our own identifiers for canEditDest(). Mongo docs ship
            // either `_id` or `id` depending on the serializer; we grab
            // whichever is present. Email is a secondary match key for older
            // endpoints whose /me payload omits the id.
            myMongoId.value = u._id || u.id || null
            myEmail.value   = (u.email || '').toLowerCase() || null
            // Permissions: prefer the flattened object that /staff/me returns;
            // fall back to staffAssignment.permissions; default to validate-only
            // (legacy staff docs predate this field).
            const flat = u.permissions
            const nested = u.staffAssignment?.permissions
            const p = flat || nested || {}
            myPermissions.value = {
              validateBusinesses: p.validateBusinesses !== false,
              manageDestinations: p.manageDestinations === true,
              moderateExplore: p.moderateExplore === true,
            }
            // Admin sees everything regardless.
            if (userRole.value === 'admin' || u.isAdmin) {
              myPermissions.value = { validateBusinesses: true, manageDestinations: true, moderateExplore: true }
            }
            meEndpointHit.value = path
            return
          }
        } catch { /* try next */ }
      }
      // None resolved — banner falls back to noScope from list response.
      myAssignment.value = null
    }

    // Banner state machine:
    //  - { empty: true, reason: 'unassigned' } — user has no countries/cities set
    //  - { empty: true, reason: 'mismatch' }   — user IS assigned, but backend returned noScope
    //                                            (means /auth/me failed AND list returned noScope)
    //  - { empty: false, ..., zeroMatches: true } — assigned, queue is empty for current filters,
    //                                                possibly because business records use different
    //                                                strings (e.g. "AM" vs "Armenia"). Useful diagnostic.
    //  - { empty: false, ..., zeroMatches: false } — happy path
    //  - null — banner hidden entirely
    const scopeBanner = computed(() => {
      const a = myAssignment.value
      if (a) {
        const countries = (a.countries || []).filter(Boolean)
        const cities    = (a.cities    || []).filter(Boolean)
        if (!countries.length && !cities.length) {return { empty: true, reason: 'unassigned' }}
        const priority = [...(a.priorityCountries || []), ...(a.priorityCities    || [])].filter(Boolean)
        // If the backend says noScope but we KNOW the user has scope, that means
        // /auth/me hit but the JWT-loaded user (used by businessRoutes) lacks
        // staffAssignment. Surface this rather than silently showing "unassigned".
        return {empty: false, countries, cities, priority, zeroMatches: noScope.value === true}
      }
      // Couldn't load /me. Defer to the list response.
      if (noScope.value) return { empty: true, reason: 'unassigned' }
      return null
    })

    // ── Tab strip ────────────────────────────────────────────────────
    // Default to validation if the user has it; otherwise destinations.
    // (A staff member with manageDestinations only would land directly on
    // their working surface.) Admin sees both.
    const activeTab = ref('validation')
    const visibleTabs = computed(() => {
      const tabs = []
      if (myPermissions.value.validateBusinesses) {
        tabs.push({ key: 'validation', label: 'Validation', count: counts.value?.pending ?? null })
      }
      if (myPermissions.value.manageDestinations) {
        tabs.push({ key: 'destinations', label: 'Destinations', count: destTotal.value || null })
      }
      if (myPermissions.value.moderateExplore) {
        tabs.push({ key: 'explore', label: 'Explore', count: expTotal.value || null })
      }
      return tabs
    })
    // Once permissions load, land on the first tab the user is allowed to see.
    // Without this, e.g. an explore-only staff would land on 'validation' and
    // see nothing.
    watch(myPermissions, (p) => {
      const order = [['validation', 'validateBusinesses'], ['destinations', 'manageDestinations'], ['explore', 'moderateExplore']]
      const allowed = order.filter(([, perm]) => p[perm]).map(([tab]) => tab)
      if (allowed.length && !allowed.includes(activeTab.value)) activeTab.value = allowed[0]
    }, { immediate: false })

    // ════════════════════════════════════════════════════════════════
    //  DESTINATIONS TAB STATE
    // ════════════════════════════════════════════════════════════════
    const DEST_PRIMARY   = ['restaurants', 'hotels', 'historical', 'events', 'hidden_gems']
    const DEST_INTERESTS = ['cultural','history','adventure','relaxation','nature','art','nightlife','food&drink']
    const DEST_STYLES    = ['family','romantic','luxury','budget']

    // Flat list used by the admin-style edit-type-chip grid. Matches
    // AdminDashboard.ALL_TYPES exactly so the form behaves identically
    // (a single set of chips for interests + styles + primary categories).
    const ALL_DEST_TYPES = [
      'cultural','history','adventure','relaxation','nature','art','nightlife','food&drink',
      'family','romantic','luxury','budget',
      'restaurants','hotels','historical','events','hidden_gems'
    ]

    // Pricing currencies — same set as AdminDashboard.PRICING_CURRENCIES.
    const PRICING_CURRENCIES = ['USD', 'EUR', 'GBP', 'AMD', 'RUB', 'AED']

    // Compact number formatter used by KPI cards and table cells. Matches
    // admin's `fmt`: undefined / null → '0', regular numbers get thousands
    // separators ("1,234"), keeping cell widths predictable.
    const fmt = (n) => {
      if (n == null || isNaN(n)) return '0'
      return Number(n).toLocaleString('en-US')
    }

    const destFilterOpts = [
      { value: '',           label: 'All' },
      { value: 'active',     label: 'Active' },
      { value: 'inactive',   label: 'Inactive' },
      { value: 'hidden_gem', label: 'Hidden gems' },
    ]

    const destinations = ref([])
    const destSummary  = ref({ total: 0, active: 0, hiddenGems: 0, totalViews: 0 })
    const destTotal    = ref(0)
    const destPage     = ref(1)
    const destLimit    = ref(20)
    const destLoading  = ref(false)
    const destFilter   = ref('')
    const destMineOnly = ref(false)
    const destSearchInput = ref('')
    const destSearchTerm  = ref('')
    let destSearchDebounce = null
    const destTotalPages = computed(() => Math.max(1, Math.ceil(destTotal.value / destLimit.value)))

    const onDestSearchInput = () => {
      clearTimeout(destSearchDebounce)
      destSearchDebounce = setTimeout(() => {
        destSearchTerm.value = destSearchInput.value.trim()
        destPage.value = 1
        loadDestinations()
      }, 300)
    }
    const changeDestPage = (delta) => {
      const next = destPage.value + delta
      if (next < 1 || next > destTotalPages.value) return
      destPage.value = next
      loadDestinations()
    }

    async function loadDestinations() {
      if (!myPermissions.value.manageDestinations) return
      destLoading.value = true
      try {
        const params = {
          page: destPage.value,
          limit: destLimit.value,
        }
        if (destFilter.value)     params.filter = destFilter.value
        if (destSearchTerm.value) params.search = destSearchTerm.value
        if (destMineOnly.value)   params.mine   = 'true'
        const { data } = await axios.get(`${API_URL}/staff/destinations`, {
          params, headers: authHeader()
        })
        const payload = data?.data || data
        destinations.value = payload?.destinations || []
        destTotal.value    = payload?.total || 0
        destSummary.value  = payload?.summary || { total: 0, active: 0, hiddenGems: 0, totalViews: 0 }
      } catch (err) {
        console.error('[staff destinations] load error:', err)
        showToast(err.response?.data?.error || 'Failed to load destinations', 'error')
        destinations.value = []
        destTotal.value = 0
      } finally {
        destLoading.value = false
      }
    }

    // ════════════════════════════════════════════════════════════════
    //  EXPLORE MODERATION TAB STATE
    // ════════════════════════════════════════════════════════════════
    const apiRoot = API_URL   // template builds place-image URLs from this
    const expPlaces = ref([])
    const expTotal = ref(0)
    const expPage = ref(1)
    const expLimit = ref(24)
    const expLoading = ref(false)
    const expBusy = ref(null)          // placeId currently being updated
    const expStatus = ref('')          // '', 'visible', 'hidden', 'verified'
    const expCategory = ref('')
    const expSearchInput = ref('')
    const expSearchTerm = ref('')
    let expSearchDebounce = null
    const expCounts = ref({ visible: null, hidden: null, verified: null })
    const expTotalPages = computed(() => Math.max(1, Math.ceil(expTotal.value / expLimit.value)))
    const expStatusOpts = [
      { value: '', label: 'All', countKey: null },
      { value: 'visible', label: 'Visible', countKey: 'visible' },
      { value: 'hidden', label: 'Hidden', countKey: 'hidden' },
      { value: 'verified', label: 'Verified', countKey: 'verified' },
    ]
    const expCategories = [
      { value: 'restaurants', label: 'Restaurants' }, { value: 'hotels', label: 'Hotels' },
      { value: 'historical', label: 'Historical' }, { value: 'events', label: 'Events' },
      { value: 'photo_spots', label: 'Photo spots' }, { value: 'hidden_gems', label: 'Hidden gems' },
      { value: 'shopping', label: 'Shops' },
    ]
    // ── Place detail modal ──
    const expSelected = ref(null)
    const expImages = ref([])
    const expImagesLoading = ref(false)
    // API_URL already ends in /api and the images endpoint returns full
    // '/api/ai/place-image/…' paths — strip the suffix to get the origin.
    const apiOrigin = API_URL.replace(/\/api\/?$/, '')
    async function openExpPlace(p) {
      expSelected.value = p
      expImages.value = []
      expImagesLoading.value = true
      try {
        const { data } = await axios.get(`${API_URL}/ai/place-images/${p.placeId}`, { headers: authHeader() })
        expImages.value = (data?.images || []).filter(im => im.hasStoredImage)
      } catch { expImages.value = [] }
      finally { expImagesLoading.value = false }
    }
    const PRICE_LABELS = {
      PRICE_LEVEL_FREE: 'Free', PRICE_LEVEL_INEXPENSIVE: '$ · inexpensive',
      PRICE_LEVEL_MODERATE: '$$ · moderate', PRICE_LEVEL_EXPENSIVE: '$$$ · expensive',
      PRICE_LEVEL_VERY_EXPENSIVE: '$$$$ · very expensive',
    }
    const expPrice = (p) => PRICE_LABELS[p?.priceLevel] || null
    const fmtD = (d) => { const t = d ? new Date(d) : null; return t && !isNaN(t) ? t.toLocaleDateString() : '—' }
    const expMapsUrl = (p) => {
      const loc = p?.details?.geometry?.location
      if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
        return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`
      }
      return p?.name ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' ' + (p.city || p.country || ''))}` : null
    }

    const onExpSearchInput = () => {
      clearTimeout(expSearchDebounce)
      expSearchDebounce = setTimeout(() => {
        expSearchTerm.value = expSearchInput.value.trim()
        expPage.value = 1
        loadExplorePlaces()
      }, 300)
    }
    const changeExpPage = (delta) => {
      const next = expPage.value + delta
      if (next < 1 || next > expTotalPages.value) return
      expPage.value = next
      loadExplorePlaces()
    }
    async function loadExplorePlaces() {
      if (!myPermissions.value.moderateExplore) return
      expLoading.value = true
      try {
        const params = { page: expPage.value, limit: expLimit.value }
        if (expStatus.value)     params.status = expStatus.value
        if (expCategory.value)   params.category = expCategory.value
        if (expSearchTerm.value) params.search = expSearchTerm.value
        const { data } = await axios.get(`${API_URL}/staff/explore-places`, { params, headers: authHeader() })
        expPlaces.value = data?.places || []
        expTotal.value = data?.total || 0
        if (data?.counts) expCounts.value = data.counts
      } catch (err) {
        console.error('[staff explore] load error:', err)
        showToast(err.response?.data?.error || 'Failed to load places', 'error')
        expPlaces.value = []
        expTotal.value = 0
      } finally { expLoading.value = false }
    }
    async function setExpStatus(place, status) {
      expBusy.value = place.placeId
      try {
        const { data } = await axios.patch(`${API_URL}/staff/explore-places/${place.placeId}/status`, { status }, { headers: authHeader() })
        // Instant local update; the refetch below refreshes the scope counts
        // and re-applies the active status filter.
        place.explore = data?.place?.explore || { status }
        showToast(data?.message || `"${place.name}" → ${status}`)
        loadExplorePlaces()
      } catch (err) {
        showToast(err.response?.data?.error || 'Failed to update place', 'error')
      } finally { expBusy.value = null }
    }

    // True when the staff can edit/delete this row. Admins always can.
    // For staff: must be the creator. We match by _id (preferred) or email
    // (fallback when the createdBy ref is populated but the id types differ
    // — e.g. ObjectId vs string).
    //
    // IMPORTANT: when ownership is ambiguous (no creator, unknown identity)
    // we return FALSE, not true. The earlier "trust the server" fallback
    // meant every staff member saw Edit/Deactivate/Delete on every row that
    // wasn't theirs — visually indistinguishable from a real owner — and
    // only the server-side 403 prevented damage. Defaulting to view-only
    // matches the spec ("hidden if not created by that staff member") and
    // means the View button appears in the ambiguous case too.
    function canEditDest(d) {
      if (userRole.value === 'admin') return true
      if (!d?.createdBy) return false        // no creator → not yours
      const owner   = typeof d.createdBy === 'object' ? d.createdBy : null
      const ownerId = owner ? (owner._id || owner.id) : d.createdBy
      // Primary: _id match.
      if (ownerId && myMongoId.value && String(ownerId) === String(myMongoId.value)) return true
      // Fallback: email match against the populated createdBy.
      const ownerEmail = (owner?.email || '').toLowerCase()
      if (ownerEmail && myEmail.value && ownerEmail === myEmail.value) return true
      return false
    }
    // Best-effort capture of our own _id / email from /me responses
    // (filled by loadMyAssignment above). Used by canEditDest.
    const myMongoId = ref(null)
    const myEmail   = ref(null)

    // ── Default location hints — pre-fill from the staff's first scope item.
    // Saves typing when the staff is adding multiple destinations in their
    // assigned region.
    const defaultCountryHint = computed(() => {
      const a = myAssignment.value
      return a?.countries?.[0] || 'Country'
    })
    const defaultCityHint = computed(() => {
      const a = myAssignment.value
      return a?.cities?.[0] || a?.priorityCities?.[0] || 'City'
    })

    // ── Phone helpers (mirror admin pattern) ────────────────────────────────
    // Stored phone values are always prefixed with "+" (e.g. "+374 …"). The
    // edit form mirrors BusinessOnboarding's UX: the "+" is a fixed prefix
    // decoration outside the input, and the model carries digits + spaces
    // only. These helpers keep the two representations consistent.
    //   stripPlus  → load:  "+1 555 5555"   → "1 555 5555"
    //   addPlus    → save:  "1 555 5555"    → "+1 555 5555" (or "" if empty)
    const stripPlusFromPhone = (p) => {
      if (!p) return ''
      const s = String(p).trim()
      return s.startsWith('+') ? s.slice(1) : s
    }
    const addPlusToPhone = (p) => {
      if (!p) return ''
      const s = String(p).trim()
      if (!s) return ''
      return s.startsWith('+') ? s : `+${s}`
    }

    // ── Destination modal (add / edit) ──────────────────────────────────────
    const blankDest = () => {
      const a = myAssignment.value || {}
      return {
        name: '',
        type: [],
        description: '',
        bestTimeToVisit: '',
        popularity: 0,
        isHiddenGem: false,
        isActive: true,
        // Pre-seed location with the first assigned country/city, since staff
        // can only add inside their scope anyway.
        location: {
          country: a.countries?.[0] || '',
          city:    a.cities?.[0]    || a.priorityCities?.[0] || '',
          region:  '',
          address: '',
          coordinates: { lat: null, lng: null }
        },
        contact: {
          email: '', phone: '', website: '', showEmail: false,
          socialMedia: { instagram: '', facebook: '', tripadvisor: '', booking: '' }
        },
        pricing: { isFree: true, min: null, max: null, average: null, currency: 'USD' },
        images: [],
        // Same per-day defaults as a fresh business in AdminDashboard — admin
        // can toggle 24/7 or mark a day closed. Sunday closed by default to
        // mirror onboarding. Mirrors AdminDashboard.blankDestination().
        openingHours: {
          is24Hours: false,
          days: [
            { day: 'Monday',    closed: false, open: '09:00', close: '18:00' },
            { day: 'Tuesday',   closed: false, open: '09:00', close: '18:00' },
            { day: 'Wednesday', closed: false, open: '09:00', close: '18:00' },
            { day: 'Thursday',  closed: false, open: '09:00', close: '18:00' },
            { day: 'Friday',    closed: false, open: '09:00', close: '18:00' },
            { day: 'Saturday',  closed: false, open: '09:00', close: '18:00' },
            { day: 'Sunday',    closed: true,  open: '09:00', close: '18:00' },
          ]
        },
        createdBy: null
      }
    }

    const destModal = ref({
      open: false,
      isNew: true,
      saving: false,
      geocoding: false,
      error: '',
      scopeWarning: '',
      id: null,
      // Image gallery state (only relevant when editing an existing doc):
      //   galleryIndex   — which image is showing in the hero
      //   lightboxOpen   — full-screen overlay visible
      //   readOnly       — true when staff opens "View" on a destination they
      //                    don't own. Hides Save and disables every input.
      galleryIndex: 0,
      lightboxOpen: false,
      readOnly: false,
      form: blankDest()
    })

    // Filtered image list used by the gallery hero / lightbox — drops empty
    // / whitespace-only URL entries so the prev/next arrows don't land on
    // a blank slot. Same logic admin's gallery uses.
    const destGalleryImages = computed(() => {
      return (destModal.value.form?.images || []).map(s => (s || '').trim()).filter(Boolean)
    })

    function openDestCreate() {
      destModal.value = {
        open: true, isNew: true, saving: false, geocoding: false,
        error: '', scopeWarning: '', id: null,
        galleryIndex: 0, lightboxOpen: false, readOnly: false,
        form: blankDest()
      }
    }
    function openDestEdit(d) {
      if (!canEditDest(d)) {
        showToast("You can only edit destinations you created", 'error')
        return
      }
      // Deep-clone so editing doesn't mutate the list row until save.
      const form = JSON.parse(JSON.stringify(d))
      // Backfill nested objects that older docs may be missing.
      form.location = form.location || {}
      form.location.coordinates = form.location.coordinates || { lat: null, lng: null }
      form.contact = form.contact || { socialMedia: {} }
      form.contact.socialMedia = form.contact.socialMedia || {}
      // Strip the stored "+" prefix so the input shows digits/spaces only.
      // The visual "+" is rendered as a sibling prefix decoration.
      form.contact.phone = stripPlusFromPhone(form.contact.phone)
      form.pricing = form.pricing || { isFree: true, currency: 'USD' }
      form.type = form.type || []
      form.images = form.images || []
      // Opening hours: older destination docs may have no openingHours field
      // at all, or have it with an empty `days` array. Seed both cases with
      // the same 7-day defaults a fresh form uses so the edit modal can show
      // every row consistently. The admin form does the same thing.
      if (!form.openingHours || typeof form.openingHours !== 'object') {
        form.openingHours = { is24Hours: false, days: [] }
      }
      if (!Array.isArray(form.openingHours.days) || form.openingHours.days.length !== 7) {
        const defaults = [
          { day: 'Monday',    closed: false, open: '09:00', close: '18:00' },
          { day: 'Tuesday',   closed: false, open: '09:00', close: '18:00' },
          { day: 'Wednesday', closed: false, open: '09:00', close: '18:00' },
          { day: 'Thursday',  closed: false, open: '09:00', close: '18:00' },
          { day: 'Friday',    closed: false, open: '09:00', close: '18:00' },
          { day: 'Saturday',  closed: false, open: '09:00', close: '18:00' },
          { day: 'Sunday',    closed: true,  open: '09:00', close: '18:00' },
        ]
        const existing = form.openingHours.days || []
        // Preserve any rows the doc already has, fill the rest from defaults.
        form.openingHours.days = defaults.map(def => {
          const found = existing.find(e => e?.day === def.day)
          return found ? { ...def, ...found } : def
        })
      }
      destModal.value = {
        open: true, isNew: false, saving: false, geocoding: false,
        error: '', scopeWarning: '', id: d._id,
        galleryIndex: 0, lightboxOpen: false, readOnly: false,
        form
      }
    }
    function closeDestModal() {
      destModal.value.open = false
    }

    // ── Read-only view (non-owner) ──────────────────────────────────────────
    // Opens the same modal as openDestEdit but with readOnly = true. The
    // template guards Save, the modal badge, and input disabled state on
    // this flag. canEditDest() must be FALSE for this to make sense — it's
    // the path staff takes when looking at a destination another staff (or
    // admin) created.
    function openDestView(d) {
      // Re-use openDestEdit's data normalisation (gallery state, phone
      // strip, opening hours backfill, etc.) by building the form the same
      // way and then flipping readOnly on.
      const form = JSON.parse(JSON.stringify(d))
      form.location = form.location || {}
      form.location.coordinates = form.location.coordinates || { lat: null, lng: null }
      form.contact = form.contact || { socialMedia: {} }
      form.contact.socialMedia = form.contact.socialMedia || {}
      form.contact.phone = stripPlusFromPhone(form.contact.phone)
      form.pricing = form.pricing || { isFree: true, currency: 'USD' }
      form.type = form.type || []
      form.images = form.images || []
      if (!form.openingHours || typeof form.openingHours !== 'object') {
        form.openingHours = { is24Hours: false, days: [] }
      }
      if (!Array.isArray(form.openingHours.days) || form.openingHours.days.length !== 7) {
        const defaults = [
          { day: 'Monday',    closed: false, open: '09:00', close: '18:00' },
          { day: 'Tuesday',   closed: false, open: '09:00', close: '18:00' },
          { day: 'Wednesday', closed: false, open: '09:00', close: '18:00' },
          { day: 'Thursday',  closed: false, open: '09:00', close: '18:00' },
          { day: 'Friday',    closed: false, open: '09:00', close: '18:00' },
          { day: 'Saturday',  closed: false, open: '09:00', close: '18:00' },
          { day: 'Sunday',    closed: true,  open: '09:00', close: '18:00' },
        ]
        const existing = form.openingHours.days || []
        form.openingHours.days = defaults.map(def => {
          const found = existing.find(e => e?.day === def.day)
          return found ? { ...def, ...found } : def
        })
      }
      destModal.value = {
        open: true, isNew: false, saving: false, geocoding: false,
        error: '', scopeWarning: '', id: d._id,
        galleryIndex: 0, lightboxOpen: false, readOnly: true,
        form
      }
    }

    // Copy Monday's hours (open/close/closed) to every day of the week.
    function applyHoursToAllDays() {
      const days = destModal.value.form?.openingHours?.days
      if (!Array.isArray(days) || !days.length) return
      const first = days[0]
      days.forEach(d => { d.closed = first.closed; d.open = first.open; d.close = first.close })
    }

    // Manually typed coordinates → validate and re-center the map/pin on them.
    function applyManualCoords() {
      const c = destModal.value.form?.location?.coordinates || {}
      const lat = Number(c.lat), lng = Number(c.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        destMap.value.statusClass = 'error'
        destMap.value.statusText  = 'Enter valid coordinates (lat −90…90, lng −180…180)'
        return
      }
      destMap.value.statusClass = 'found'
      destMap.value.statusText  = 'Coordinates set manually'
      destRenderMap({ lat, lng })
    }

    function toggleDestType(t) {
      const arr = destModal.value.form.type
      const i = arr.indexOf(t)
      if (i === -1) arr.push(t)
      else arr.splice(i, 1)
      // Keep isHiddenGem in sync with the chip.
      if (t === 'hidden_gems') {
        destModal.value.form.isHiddenGem = arr.includes('hidden_gems')
      }
    }

    // Required-field check used to enable/disable the Save button.
    const destFormValid = computed(() => {
      const f = destModal.value.form
      if (!f?.name?.trim()) return false
      if (!Array.isArray(f.type) || !f.type.length) return false
      if (!f.location?.country && !f.location?.city) return false
      return true
    })

    // ════════════════════════════════════════════════════════════════
    //  LOCATION MAP (Leaflet)
    //  Mirrors AdminDashboard.vue's dest-map implementation. Map mounts
    //  into #staff-dest-map when the destination modal opens, gets torn
    //  down when it closes. CDN-loaded Leaflet, OpenStreetMap tiles,
    //  Nominatim geocoder — no API keys.
    //
    //  Differences from admin:
    //    - element id is `staff-dest-map` so the two pages can coexist if
    //      both somehow render at once.
    //    - nearby fetch uses `/api/business` (which staff already has
    //      scope-filtered access to) plus `/api/staff/destinations` so we
    //      overlay both kinds of dots for context.
    // ════════════════════════════════════════════════════════════════
    let destLeafletMap = null
    let destMarker     = null
    let destGeoDebounce = null
    const destMap = ref({
      loading: false,
      statusClass: 'idle',          // idle | searching | found | error
      statusText: 'Waiting for address…',
      canSearch: false,
    })

    // Have enough address info to attempt a geocode? Avoid hammering
    // Nominatim while the staff is mid-typing.
    const destHasGeoQuery = () => {
      const f = destModal.value.form
      if (!f || !f.location) return false
      const addr = (f.location.address || '').trim()
      const city = (f.location.city    || '').trim()
      return addr.length >= 5 && city.length >= 1
    }

    // Nominatim — same shape admin uses. Address + city + country.
    async function destGeocode(address, city, country) {
      const q = [address, city, country].filter(Boolean).join(', ')
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) return null
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }

    // Haversine — used to filter nearby points to ~3 km of the destination.
    const haversine = (a, b) => {
      const R = 6371e3
      const toRad = d => d * Math.PI / 180
      const dLat = toRad(b.lat - a.lat)
      const dLng = toRad(b.lng - a.lng)
      const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2
      return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    }

    // Fetches both businesses and destinations near the current city for
    // context dots on the map. Tries each endpoint independently — one
    // failing shouldn't blank the other.
    async function destFetchNearby(city, center) {
      if (!city || !center) return { businesses: [], destinations: [] }

      // Businesses — use the same endpoint staff already calls for validation.
      // The scope filter applies server-side, so we only see what we should.
      let businesses = []
      try {
        const { data } = await axios.get(`${API_URL}/business`, {
          params: { status: 'active', page: 1, limit: 50, city },
          headers: authHeader()
        })
        const list = data.businesses || data.data?.businesses || []
        businesses = list
          .map(b => {
            const c = b.location?.coordinates
            if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') return null
            return { name: b.name, tier: b.partnership?.tier || 'verified', lat: c.lat, lng: c.lng }
          })
          .filter(Boolean)
          .filter(b => haversine(center, b) <= 3000)
          .slice(0, 30)
      } catch (e) {
        console.warn('[DestMap] businesses fetch failed', e)
      }

      // Destinations — use our own staff endpoint. Skip the destination
      // being edited so the staff doesn't see their own pin twice.
      let nearbyDests = []
      try {
        const { data } = await axios.get(`${API_URL}/staff/destinations`, {
          params: { page: 1, limit: 50 },
          headers: authHeader()
        })
        const list = data?.data?.destinations || []
        const selfId = destModal.value.id
        nearbyDests = list
          .filter(d => !selfId || String(d._id) !== String(selfId))
          .map(d => {
            const c = d.location?.coordinates
            if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') return null
            return { name: d.name, lat: c.lat, lng: c.lng }
          })
          .filter(Boolean)
          .filter(d => haversine(center, d) <= 3000)
          .slice(0, 30)
      } catch (e) {
        console.warn('[DestMap] destinations fetch failed', e)
      }

      return { businesses, destinations: nearbyDests }
    }

    // CDN load Leaflet on demand — same trick admin uses, so the page
    // doesn't pay for Leaflet weight when the destinations tab isn't open.
    function destEnsureLeaflet(cb) {
      if (typeof window === 'undefined') return
      if (window.L) { cb(); return }
      const link = document.createElement('link')
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = cb
      document.head.appendChild(script)
    }

    async function destRenderMap(coords) {
      await nextTick()
      destEnsureLeaflet(async () => {
        const L  = window.L
        const el = document.getElementById('staff-dest-map')
        if (!el) return
        const center = [coords.lat, coords.lng]
        const isNight = theme.value === 'night-mode'

        // Tear down any previous instance so re-opening the modal works.
        if (destLeafletMap) {
          try { destLeafletMap.remove() } catch {}
          destLeafletMap = null
          destMarker     = null
        }
        destLeafletMap = L.map('staff-dest-map', {
          zoomControl: false, dragging: true, scrollWheelZoom: false, attributionControl: false
        }).setView(center, 15)

        // Carto basemap — light tiles work well in both themes, just inverted
        // hues. Admin uses the same.
        const tileUrl = isNight
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        L.tileLayer(tileUrl, { attribution: '', subdomains: 'abcd', maxZoom: 19, detectRetina: true }).addTo(destLeafletMap)

        // Custom zoom control (same styling admin uses).
        const ZoomControl = L.Control.extend({
          onAdd() {
            const wrap = L.DomUtil.create('div', 'dest-zoom-control')
            wrap.setAttribute('style', 'display:flex;flex-direction:column;gap:6px;margin:8px 8px 0 0;')
            L.DomEvent.disableClickPropagation(wrap)
            const btnStyle = 'width:30px;height:30px;border:none;border-radius:7px;cursor:pointer;background:rgba(255,255,255,0.95);color:#333;font-size:16px;font-weight:600;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.18)'
            const zIn = L.DomUtil.create('button', '', wrap)
            zIn.type = 'button'; zIn.setAttribute('style', btnStyle); zIn.textContent = '+'
            L.DomEvent.on(zIn, 'click', L.DomEvent.stop).on(zIn, 'click', () => destLeafletMap.zoomIn())
            const zOut = L.DomUtil.create('button', '', wrap)
            zOut.type = 'button'; zOut.setAttribute('style', btnStyle); zOut.textContent = '−'
            L.DomEvent.on(zOut, 'click', L.DomEvent.stop).on(zOut, 'click', () => destLeafletMap.zoomOut())
            return wrap
          }
        })
        destLeafletMap.addControl(new ZoomControl({ position: 'topright' }))

        // Context dots: businesses + destinations. Staff sees both because
        // their job is to fill in destinations alongside whatever business
        // listings already exist for the same area.
        const { businesses, destinations: nearbyDests } = await destFetchNearby(destModal.value.form.location.city, coords)
        const tierFill = { signature: '#e53e3e', spotlight: '#f97316', verified: '#a78bfa' }
        businesses.forEach(b => {
          const fill = tierFill[b.tier] || '#a78bfa'
          L.marker([b.lat, b.lng], { icon: L.divIcon({
            className: '',
            html: `<div style="width:10px;height:10px;border-radius:50%;background:${fill};border:1.5px solid white;opacity:0.55;box-shadow:0 0 4px ${fill}66"></div>`,
            iconSize: [10, 10], iconAnchor: [5, 5]
          })}).addTo(destLeafletMap).bindPopup(`<strong>${b.name}</strong><br><span style="opacity:0.7;text-transform:capitalize">${b.tier}</span>`)
        })
        // Destinations get a teal dot to visually separate from businesses.
        nearbyDests.forEach(d => {
          L.marker([d.lat, d.lng], { icon: L.divIcon({
            className: '',
            html: `<div style="width:11px;height:11px;border-radius:3px;background:#10b981;border:1.5px solid white;opacity:0.65;box-shadow:0 0 4px #10b98166"></div>`,
            iconSize: [11, 11], iconAnchor: [5.5, 5.5]
          })}).addTo(destLeafletMap).bindPopup(`<strong>${d.name}</strong><br><span style="opacity:0.7">destination</span>`)
        })

        // The destination pin itself — gold, draggable.
        const pinIcon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:24px;height:24px">
              <div style="position:absolute;width:34px;height:34px;border-radius:50%;background:#D4AF37;opacity:0.22;
                animation:dest-pulse 2.4s ease-in-out infinite;
                transform:translate(-50%,-50%);top:50%;left:50%"></div>
              <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;
                background:linear-gradient(135deg,#f4d03f,#D4AF37);
                border:2.5px solid white;
                box-shadow:0 0 14px rgba(212,175,55,0.95),0 2px 6px rgba(0,0,0,0.4);"></div>
            </div>`,
          iconSize: [24, 24], iconAnchor: [12, 12]
        })
        // Drag is disabled in read-only (view-as-non-owner) mode.
        const allowDrag = !destModal.value.readOnly
        destMarker = L.marker(center, { icon: pinIcon, draggable: allowDrag })
          .addTo(destLeafletMap)
          .bindPopup(allowDrag
            ? '<strong>Destination location</strong><br><span style="opacity:0.7">Drag to fine-tune</span>'
            : '<strong>Destination location</strong>')
        if (allowDrag) {
          destMarker.on('dragend', (e) => {
            const ll = e.target.getLatLng()
            destModal.value.form.location.coordinates.lat = +ll.lat.toFixed(6)
            destModal.value.form.location.coordinates.lng = +ll.lng.toFixed(6)
            destMap.value.statusClass = 'found'
            destMap.value.statusText  = 'Pin moved — coordinates updated'
          })
          // Click anywhere on the map to place the pin there — faster than
          // dragging when the geocoder landed far from the real spot.
          destLeafletMap.on('click', (e) => {
            const ll = e.latlng
            destMarker.setLatLng(ll)
            destModal.value.form.location.coordinates.lat = +ll.lat.toFixed(6)
            destModal.value.form.location.coordinates.lng = +ll.lng.toFixed(6)
            destMap.value.statusClass = 'found'
            destMap.value.statusText  = 'Pin placed — coordinates updated'
          })
        }
      })
    }

    // Main entrypoint — runs from the watcher or the "Re-locate" button.
    async function geocodeAndRenderDestination() {
      if (!destModal.value.open) return
      destMap.value.canSearch = destHasGeoQuery()
      if (!destMap.value.canSearch) {
        destMap.value.statusClass = 'idle'
        destMap.value.statusText  = 'Enter an address and city to locate'
        return
      }
      destMap.value.loading     = true
      destMap.value.statusClass = 'searching'
      destMap.value.statusText  = 'Locating address…'
      let coords = null
      try {
        coords = await destGeocode(
          destModal.value.form.location.address,
          destModal.value.form.location.city,
          destModal.value.form.location.country
        )
      } catch (e) {
        console.warn('[DestMap] geocode failed', e)
      }
      destMap.value.loading = false
      if (!coords) {
        destMap.value.statusClass = 'error'
        destMap.value.statusText  = 'Could not locate this address'
        return
      }
      // Write coords back into the form so the lat/lng inputs stay in sync.
      destModal.value.form.location.coordinates.lat = +coords.lat.toFixed(6)
      destModal.value.form.location.coordinates.lng = +coords.lng.toFixed(6)
      destMap.value.statusClass = 'found'
      destMap.value.statusText  = 'Located'
      await destRenderMap(coords)
    }

    const reGeocodeDestination = () => geocodeAndRenderDestination()

    // Watcher: re-geocode when the address/city/country changes. Debounced
    // 800ms so we don't fire while the staff is typing.
    watch(
      () => [
        destModal.value.open,
        destModal.value.form?.location?.address,
        destModal.value.form?.location?.city,
        destModal.value.form?.location?.country,
      ],
      () => {
        if (!destModal.value.open) return
        destMap.value.canSearch = destHasGeoQuery()
        clearTimeout(destGeoDebounce)
        destGeoDebounce = setTimeout(geocodeAndRenderDestination, 800)
      }
    )

    // When the modal opens for editing an existing destination that already
    // has coordinates, render the map immediately (skip geocoding). Reset
    // map state on close so the next open starts clean.
    watch(() => destModal.value.open, async (open) => {
      if (!open) {
        clearTimeout(destGeoDebounce)
        if (destLeafletMap) { try { destLeafletMap.remove() } catch {}; destLeafletMap = null; destMarker = null }
        destMap.value = { loading: false, statusClass: 'idle', statusText: 'Waiting for address…', canSearch: false }
        return
      }
      const c = destModal.value.form?.location?.coordinates
      if (c && typeof c.lat === 'number' && typeof c.lng === 'number' && (c.lat || c.lng)) {
        destMap.value.statusClass = 'found'
        destMap.value.statusText  = 'Saved location'
        destMap.value.canSearch   = destHasGeoQuery()
        await destRenderMap({ lat: c.lat, lng: c.lng })
      } else {
        destMap.value.canSearch = destHasGeoQuery()
        if (destMap.value.canSearch) {
          geocodeAndRenderDestination()
        }
      }
    })

    // ── Submit (POST or PATCH depending on isNew) ───────────────────────────
    async function submitDest() {
      const m = destModal.value
      if (!destFormValid.value) {
        m.error = 'Name, at least one type, and country/city are required.'
        return
      }
      m.saving = true
      m.error = ''
      m.scopeWarning = ''
      try {
        // Build payload (the backend ignores fields it doesn't recognise, but
        // we keep things tidy by dropping the empty image strings).
        const payload = JSON.parse(JSON.stringify(m.form))
        if (Array.isArray(payload.images)) {
          payload.images = payload.images.map(s => (s || '').trim()).filter(Boolean)
        }
        // Phone is shown without "+" in the input (the "+" is a visual prefix),
        // but stored with "+" so it dials correctly via tel: links.
        if (payload.contact) {
          payload.contact.phone = addPlusToPhone(payload.contact.phone)
        }
        if (payload.pricing?.isFree) {
          payload.pricing.min = null
          payload.pricing.max = null
          payload.pricing.average = null
        }
        // Keep isHiddenGem in sync with the chip (defence in depth).
        payload.isHiddenGem = (payload.type || []).includes('hidden_gems')

        const url = m.isNew
          ? `${API_URL}/staff/destinations`
          : `${API_URL}/staff/destinations/${m.id}`
        const method = m.isNew ? 'post' : 'patch'
        const { data } = await axios[method](url, payload, { headers: authHeader() })
        const saved = data?.data || data
        const list = destinations.value
        if (m.isNew) {
          list.unshift(saved)
          destTotal.value = (destTotal.value || 0) + 1
          showToast(`"${saved.name}" added`, 'success')
        } else {
          const i = list.findIndex(x => x._id === saved._id)
          if (i !== -1) list[i] = { ...list[i], ...saved }
          showToast(`"${saved.name}" updated`, 'success')
        }
        // Image mirroring report — tell the validator NOW if a URL is dead,
        // instead of clients silently seeing a broken image later.
        const rep = data?.imageReport
        if (rep && rep.failed && rep.failed.length) {
          showToast(`${rep.failed.length} image URL(s) could not be downloaded — check the gallery`, 'error')
        } else if ((saved.images || []).length && (!payload.images || !payload.images.some(u => String(u || '').trim()))) {
          showToast(`${saved.images.length} photos fetched from Google automatically`, 'success')
        }
        m.open = false
        // Refresh summary numbers in the background.
        loadDestinations()
      } catch (err) {
        const msg = err.response?.data?.error || 'Save failed'
        // The backend uses a 403 when the location falls outside scope — show
        // that one inline in the location section rather than as a top error.
        if (err.response?.status === 403 && /outside.*scope|outside.*countries/i.test(msg)) {
          m.scopeWarning = msg
        } else {
          m.error = msg
        }
      } finally {
        m.saving = false
      }
    }

    // ── Toggle active / inactive ────────────────────────────────────────────
    async function toggleDest(d) {
      if (!canEditDest(d)) return
      try {
        const { data } = await axios.patch(`${API_URL}/staff/destinations/${d._id}/toggle`, {}, { headers: authHeader() })
        const newActive = data?.data?.isActive ?? !d.isActive
        d.isActive = newActive
        showToast(`"${d.name}" ${newActive ? 'activated' : 'deactivated'}`, 'success')
      } catch (err) {
        showToast(err.response?.data?.error || 'Toggle failed', 'error')
      }
    }

    // ── Delete (with confirm) ───────────────────────────────────────────────
    const destDeleteTarget = ref(null)
    const destDeleteBusy   = ref(false)
    function confirmDeleteDest(d) {
      if (!canEditDest(d)) return
      destDeleteTarget.value = d
    }
    async function executeDestDelete() {
      const d = destDeleteTarget.value
      if (!d) return
      destDeleteBusy.value = true
      try {
        await axios.delete(`${API_URL}/staff/destinations/${d._id}`, { headers: authHeader() })
        destinations.value = destinations.value.filter(x => x._id !== d._id)
        destTotal.value = Math.max(0, destTotal.value - 1)
        showToast(`"${d.name}" deleted`, 'success')
        destDeleteTarget.value = null
      } catch (err) {
        showToast(err.response?.data?.error || 'Delete failed', 'error')
      } finally {
        destDeleteBusy.value = false
      }
    }

    // Auto-load when the tab opens for the first time.
    watch(activeTab, (tab) => {
      if (tab === 'destinations' && !destinations.value.length && myPermissions.value.manageDestinations) {
        loadDestinations()
      }
      if (tab === 'explore' && !expPlaces.value.length && myPermissions.value.moderateExplore) {
        loadExplorePlaces()
      }
    })

    // ── Selection / drawer ──────────────────────────────────────────
    const selected = ref(null)
    const staffNote = ref('')
    const rejectReason = ref('')
    // Optional blocklist-flag controls on the reject modal. Default false so
    // a routine rejection doesn't quietly add the owner to the watchlist —
    // staff must explicitly opt in.
    const rejectFlagFingerprints = ref(false)
    const rejectFlagTypes        = ref(['email', 'phone'])
    const actionBusy = ref(false)
    const actionError = ref('')

    // Tooltip string for the queue-row blocklist pill. Shows each flag's type,
    // severity, and reason on one line, joined with newlines.
    function watchFlagTooltip(b) {
      const flags = b?.verification?.watchFlags
      if (!flags?.length) return ''
      return flags.map(f => `${f.type} (${f.severity}): ${f.reason || '—'}`).join('\n')
    }

    function select(b) {
      selected.value = b
      staffNote.value = ''
      rejectReason.value = ''
      rejectFlagFingerprints.value = false
      rejectFlagTypes.value = ['email', 'phone']
      actionError.value = ''
      zoneInfo.value = null
    }
    // ── Zone check ──────────────────────────────────────────────────
    const zoneInfo = ref(null)
    const zoneLoading = ref(false)
    async function loadZone(b) {
      if (!b?.location?.coordinates?.lat || !b?.location?.coordinates?.lng) {
        showToast('No coordinates on file for this business', 'error')
        return
      }
      const cat = mainCategoryRaw(b)
      if (!cat) {
        showToast('No primary category set — cannot resolve zone', 'error')
        return
      }
      zoneLoading.value = true
      try {
        const { data } = await axios.get(`${API_URL}/business/zone-check`, {params: {category: cat, lat: b.location.coordinates.lat, lng: b.location.coordinates.lng, tier: b.partnership?.tier || 'verified'}})
        zoneInfo.value = {
          total: data.slots?.total ?? (data.occupants?.length || 0),
          verified:  data.slots?.verified  ?? 0,
          spotlight: data.slots?.spotlight ?? 0,
          signature: data.slots?.signature ?? 0,
          occupants: data.occupants || data.businesses || [],
        }
      } catch (err) {
        console.error('[staff] zone-check error:', err)
        showToast(err.response?.data?.error || 'Zone check failed', 'error')
      } finally {zoneLoading.value = false}
    }
    // ── Approve / reject ────────────────────────────────────────────
    const confirmingAction = ref(null)
    // True for either rejection flow (soft 'reject' or hard 'reject_permanent').
    // Both require a reason in the textarea before the action can fire.
    const isRejectFlow = computed(() =>
      confirmingAction.value === 'reject' || confirmingAction.value === 'reject_permanent'
    )
    function canModerate(b) {
      // Show Approve/Reject only for a business that hasn't been actioned yet.
      // pending = fresh registration awaiting review.
      // waitlisted = auction bidder; staff may approve it once (becomes a
      //   verified bidder) but must NOT see the buttons again on subsequent
      //   visits — that would let them re-approve indefinitely.
      // Once staff has stamped verifiedAction ('approved' or 'rejected'), the
      // action is done; show the read-only footer instead.
      if (!b) return false
      if (b.status !== 'pending' && b.status !== 'waitlisted') return false
      if (b.verification?.verifiedAction) return false
      return true
    }
    // An auction winner reserved into 'pending' awaiting staff verification:
    // it already holds a Signature slot at a won price, so approving it activates
    // a PAID listing, not a free one. Detected by the reservation marker the
    // zoneAuction promotion writes (auction.awaitingApprovalSince).
    function isAuctionWinner(b) { return !!(b?.auction && b.auction.awaitingApprovalSince) }
    function confirm(action) {
      actionError.value = ''
      if (action === 'reject' || action === 'reject_permanent') {
        rejectReason.value = staffNote.value || rejectReason.value
      }
      confirmingAction.value = action
    }
    async function executeAction() {
      if (!selected.value || !confirmingAction.value) return
      const id = selected.value._id
      const action = confirmingAction.value
      const isHard = action === 'reject_permanent'
      // The permanent reject reuses the /reject endpoint with permanent:true.
      const endpoint = isHard ? 'reject' : action
      actionBusy.value = true
      actionError.value = ''
      try {
        const body = action === 'approve'
          ? { staffNotes: staffNote.value || '' }
          : {
              reason: rejectReason.value || staffNote.value || 'Rejected by staff',
              permanent: isHard,
              // Watch-flag picker only applies to soft reject; a hard reject
              // already blocks every fingerprint server-side.
              flagFingerprints: isHard ? false : rejectFlagFingerprints.value,
              flagTypes: (!isHard && rejectFlagFingerprints.value) ? rejectFlagTypes.value : undefined
            }
        const { data } = await axios.post(`${API_URL}/business/${id}/${endpoint}`, body, { headers: authHeader() })

        const newStatus = data.status || (action === 'approve' ? 'active' : 'rejected')
        const msg = action === 'approve'
          ? (newStatus === 'waitlisted' ? `${selected.value.name} approved — waitlisted (zone full).` : data.displaced ? `${selected.value.name} approved. Displaced: ${data.displaced.name}.` : `${selected.value.name} approved and activated.`)
          : (isHard ? `${selected.value.name} permanently rejected.` : `${selected.value.name} rejected.`)
        showToast(msg, 'success')
        // Update list in place + bump counters, then close modal
        businesses.value = businesses.value.filter(x => x._id !== id)
        total.value = Math.max(0, total.value - 1)
        counts.value = {...counts.value, [status.value]: Math.max(0, (counts.value[status.value] || 1) - 1), [newStatus]: (counts.value[newStatus] || 0) + 1}
        confirmingAction.value = null
        selected.value = null
      } catch (err) {
        console.error(`[staff] ${action} error:`, err)
        const errData = err.response?.data || {}
        // Special-case the event-already-ended guard from
        // POST /business/:id/approve. The server has already flipped the
        // listing to 'expired' before returning the 400, so the local row
        // is stale. We:
        //   1. Surface the human-readable message (not the error code).
        //   2. Patch local state — remove the row from the current view if
        //      we're filtered to 'pending', or update its status if we're
        //      on 'all', and bump the expired counter.
        //   3. Show a toast so the staff sees what just happened even if
        //      they immediately close the drawer.
        if (errData.error === 'event_already_ended') {
          actionError.value = errData.message || 'This event has already ended.'
          showToast(`${selected.value?.name || 'Listing'} moved to "expired" — event already passed.`, 'error')
          // Patch list state
          businesses.value = businesses.value
            .map(x => x._id === id ? { ...x, status: 'expired' } : x)
            // If we're filtered to a specific status (and it's not 'all' or
            // 'expired'), the row should leave the current view.
            .filter(x => status.value === 'all' || status.value === 'expired' || x._id !== id)
          total.value = Math.max(0, total.value - (status.value === 'all' || status.value === 'expired' ? 0 : 1))
          counts.value = {
            ...counts.value,
            pending: Math.max(0, (counts.value.pending || 1) - 1),
            expired: (counts.value.expired || 0) + 1
          }
          confirmingAction.value = null
          selected.value = null
        } else {
          actionError.value = errData.error || `${action} failed`
        }
      } finally {actionBusy.value = false}
    }
    // ── Toast ───────────────────────────────────────────────────────
    const toast = ref(null)
    let toastTimeout = null
    function showToast(text, kind = 'info') {
      toast.value = { text, kind }
      clearTimeout(toastTimeout)
      toastTimeout = setTimeout(() => { toast.value = null }, 3500)
    }
    // ── Helpers (template-side) ─────────────────────────────────────
    const statusList = STATUSES
    const tierList = TIERS
    const statusLabel = (k) => STATUSES.find(s => s.key === k)?.label || k
    const tierShort = (t) => t === 'signature' ? '★' : t === 'spotlight' ? '◉' : t === 'verified' ? '✓' : '—'
    const tierLabel = (t) => t ? t[0].toUpperCase() + t.slice(1) : 'Verified'
    function mainCategoryRaw(b) {return (b.type || []).find(t => PRIMARY_CATS.includes(t)) || null}
    function mainCategory(b) {
      const c = mainCategoryRaw(b)
      return c ? c.replace('_', ' ') : null
    }
    function tagKind(t) {
      if (PRIMARY_CATS.includes(t)) return 'primary'
      if (INTEREST_TAGS.includes(t)) return 'interest'
      if (STYLE_TAGS.includes(t)) return 'style'
      return 'other'
    }
    function aiBucket(score) {
      if (score == null) return 'neutral'
      if (score >= 75) return 'good'
      if (score >= 50) return 'mid'
      return 'low'
    }
    function relTime(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      const diff = Date.now() - d.getTime()
      const m = Math.floor(diff / 60000)
      if (m < 1) return 'just now'
      if (m < 60) return `${m}m`
      const h = Math.floor(m / 60)
      if (h < 24) return `${h}h`
      const days = Math.floor(h / 24)
      if (days < 30) return `${days}d`
      const months = Math.floor(days / 30)
      return `${months}mo`
    }
    function formatDate(d) {
      if (!d) return '—'
      try { return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) } 
      catch { return String(d) }
    }
    // Formats an event's stored datetime for staff review. The stored value
    // (eventSchedule.startDate / endDate) is an absolute UTC instant; it only
    // means a wall-clock time when paired with the event's home timezone
    // (eventSchedule.timezone, e.g. "Europe/Moscow"). We convert against THAT
    // zone — never the staff member's browser zone — so staff approve the time
    // the event actually runs at the venue. A listing with no stored timezone
    // (legacy data) falls back to UTC, which keeps the old behaviour.
    function formatEventDate(d, timeZone) {
      if (!d) return '—'
      try {
        const dt = new Date(d)
        if (isNaN(dt.getTime())) return String(d)
        const tz = timeZone || 'UTC'
        // Read the wall-clock parts the venue timezone shows for this instant.
        const dtf = new Intl.DateTimeFormat('en-US', {
          timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        })
        const p = {}
        for (const part of dtf.formatToParts(dt)) {
          if (part.type !== 'literal') p[part.type] = parseInt(part.value, 10)
        }
        if (p.hour === 24) p.hour = 0
        const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        // Weekday of the zoned calendar date, anchored via a UTC date so the
        // host timezone can't shift it.
        const weekday = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()
        const hh = String(p.hour).padStart(2, '0')
        const mi = String(p.minute).padStart(2, '0')
        return `${days[weekday]}, ${months[p.month - 1]} ${p.day}, ${p.year} · ${hh}:${mi}`
      } catch { return String(d) }
    }
    // Mirrors Business.js isEventExpired(). The server has the authoritative
    // version (used by lazy-expire and the staff-approve guard) but the staff
    // UI needs a local copy so it can warn BEFORE staff clicks Approve and
    // gets a 400 back. Logic must stay in lockstep with the schema method.
    function isEventListingExpired(b) {
      if (!Array.isArray(b?.type) || !b.type.includes('events')) return false
      if (b.eventSchedule?.isRecurring) return false
      const end = b.eventSchedule?.endDate || b.eventSchedule?.startDate
      if (!end) return false
      return new Date(end).getTime() < Date.now()
    }
    // True when the listing has a recurring weekly schedule (changes whether
    // the Opening Hours / Weekly Schedule section in the drawer is shown for
    // an event listing).
    function isRecurringEvent(b) {
      return Array.isArray(b?.type) && b.type.includes('events') && !!b?.eventSchedule?.isRecurring
    }
    // ── Helpers for extended drawer sections ────────────────────────
    function hasVerificationDetails(b) {
      const v = b?.verification || {}
      return !!(v.verifiedAt || v.verifiedBy || v.verifiedAction || (v.history || []).length)
    }
    // verifiedBy / owner can be either an ObjectId string or a populated user object
    function verifierLabel(ref) {
      if (!ref) return '—'
      if (typeof ref === 'string') return ref
      if (typeof ref === 'object') {
        const name = ref.name || ref.fullName || ref.username
        const email = ref.email
        const role = ref.role
        if (name && email) return `${name} <${email}>${role ? ` · ${role}` : ''}`
        if (name) return name + (role ? ` · ${role}` : '')
        if (email) return email
        if (ref._id) return String(ref._id)
      }
      return '—'
    }
    function ownerLabel(ref) {
      if (!ref) return '—'
      return verifierLabel(ref)
    }
    function formatBytes(n) {
      if (!n && n !== 0) return ''
      if (n < 1024) return `${n} B`
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
      return `${(n / (1024 * 1024)).toFixed(1)} MB`
    }
    function sumArr(arr) {
      return (arr || []).reduce((s, v) => s + (Number(v) || 0), 0)
    }
    function trendHeight(value, arr) {
      const max = Math.max(1, ...(arr || []).map(v => Number(v) || 0))
      const pct = Math.max(4, ((Number(value) || 0) / max) * 100)
      return `${pct}%`
    }
    function mapLink(b) {
      const { lat, lng } = b.location?.coordinates || {}
      return `https://www.google.com/maps?q=${lat},${lng}`
    }
    function hasPricing(b) {
      const p = b.pricing
      return p && (p.isFree || p.min != null || p.max != null || p.average != null)
    }
    function hasHours(b) {return b.openingHours && (b.openingHours.is24Hours || (b.openingHours.days || []).length)}
    // Image src: prefix any relative server URL with the API host
    function resolveImage(img, id, idx) {
      if (!img) return ''
      // Already absolute (http:// or https://) — use as-is
      if (typeof img === 'string' && /^https?:\/\//.test(img)) return img
      // Server-relative URL (starts with /) — prefix with API host
      const base = API_URL.replace(/\/api$/, '')
      if (typeof img === 'string' && img.startsWith('/')) return `${base}${img}`
      // Fallback: build the binary URL pattern from id + idx
      return `${base}/api/media/business/${id}/image/${idx}`
    }
    function onImgError(e) { e.target.style.opacity = '0.25' }
    // ── Theme reactivity ────────────────────────────────────────────
    let themeInterval = null
    onMounted(() => {
      loadMyAssignment()
      loadList(true)
      themeInterval = setInterval(() => { theme.value = computeTheme() }, 60_000)
    })
    onBeforeUnmount(() => {
      clearInterval(themeInterval)
      clearTimeout(toastTimeout)
      clearTimeout(cityDebounce)
    })
    // Keyboard: Esc closes whichever overlay is visible, innermost first
    // (lightbox → confirm modals → dest modal → validation drawer).
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (destModal.value.lightboxOpen) { destModal.value.lightboxOpen = false; return }
        if (expSelected.value)             { expSelected.value = null; return }
        if (confirmLogout.value)           { confirmLogout.value = false; return }
        if (confirmingAction.value)        { confirmingAction.value = null; return }
        if (destDeleteTarget.value)        { destDeleteTarget.value = null; return }
        if (destModal.value.open)          { closeDestModal(); return }
        if (selected.value)                { selected.value = null; return }
      }
    }
    onMounted(() => window.addEventListener('keydown', onKey))
    onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

    return {
      theme, toggleTheme, statusList, tierList,
      status, tier, cityInput, page, total, totalPages, businesses, counts, listLoading,
      setStatus, setTier, onCityInput, changePage, loadList,
      selected, select, staffNote, rejectReason, rejectFlagFingerprints, rejectFlagTypes, actionBusy, actionError, canModerate, isAuctionWinner,
      confirmingAction, isRejectFlow, confirm, executeAction, watchFlagTooltip,
      zoneInfo, zoneLoading, loadZone,
      toast,
      statusLabel, tierShort, tierLabel, mainCategory, tagKind, aiBucket,
      relTime, formatDate, formatEventDate, mapLink, hasPricing, hasHours, resolveImage, onImgError,
      // event helpers (mirror Business.js isEventExpired / dashboard's isEvent)
      isEventListingExpired, isRecurringEvent,
      // extended drawer helpers
      hasVerificationDetails, verifierLabel, ownerLabel, formatBytes, sumArr, trendHeight,
      // scope banner
      scopeBanner,
      // user (for header greeting)
      userName,
      // logout
      confirmLogout, doLogout,
      // ── Tabs & permissions ───────────────────────────────────────
      activeTab, visibleTabs, myPermissions,
      // ── Destinations tab ─────────────────────────────────────────
      destinations, destSummary, destTotal, destPage, destTotalPages,
      destLoading, destFilter, destFilterOpts, destMineOnly,
      destSearchInput, onDestSearchInput, loadDestinations, changeDestPage,
      // Explore moderation tab
      apiRoot, expPlaces, expTotal, expPage, expTotalPages, expLoading, expBusy,
      expStatus, expStatusOpts, expCategory, expCategories, expCounts,
      expSearchInput, onExpSearchInput, loadExplorePlaces, changeExpPage, setExpStatus,
      expSelected, expImages, expImagesLoading, openExpPlace, apiOrigin, expPrice, fmtD, expMapsUrl,
      DEST_PRIMARY, DEST_INTERESTS, DEST_STYLES,
      ALL_DEST_TYPES, PRICING_CURRENCIES, fmt,
      destModal, destGalleryImages, openDestCreate, openDestEdit, openDestView, closeDestModal,
      toggleDestType, destFormValid, applyHoursToAllDays, applyManualCoords,
      // Map (Leaflet)
      destMap, reGeocodeDestination,
      submitDest, toggleDest, canEditDest,
      destDeleteTarget, destDeleteBusy, confirmDeleteDest, executeDestDelete,
      defaultCountryHint, defaultCityHint,
    }
  }
}
</script>



<style scoped>
/* ── Type system & themes ─────────────────────────────────────────── */
.staff-val{--font-sans:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--font-mono:'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh;font-family:var(--font-sans);padding:24px clamp(16px,3vw,36px) 80px;box-sizing:border-box}
.staff-val.night-mode{background:linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%);color:#e8d8ff;--bg:#0f0620;--bg-elev:#211440;--bg-elev-2:#2c1d54;--bg-elev-3:#1a0e36;--line:rgba(167,139,250,0.28);--line-soft:rgba(167,139,250,0.14);--text:#ece0ff;--text-mute:#a8a0c4;--text-faint:#7a7396;--accent:#a78bfa;--accent-2:#c4b0ff;--good:#34d399;--warn:#fbbf24;--bad:#f87171}
.staff-val.day-mode{background:#f9f5eb;color:#3c2a1e;--bg:#fff;--bg-elev:#fff7e8;--bg-elev-2:#f4e6cc;--bg-elev-3:#fff7e8;--line:rgba(184,115,51,0.30);--line-soft:rgba(184,115,51,0.15);--text:#3c2a1e;--text-mute:#7a6450;--text-faint:#b09679;--accent:#b87333;--accent-2:#8b5e1a;--good:#1e7d4a;--warn:#b45309;--bad:#b91c1c}
/* ── Page header ─────────────────────────────────────────────────── */
.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:20px}
.page-title{font-size:clamp(24px,3vw,34px);font-weight:600;letter-spacing:-0.02em;margin:0;display:flex;align-items:baseline;gap:10px}
.page-title-mark{font-family:var(--font-mono);color:var(--accent);font-weight:400;font-size:0.7em;opacity:0.7}
.page-title-user{color:var(--text-mute);font-weight:400;font-size:0.75em;letter-spacing:-0.01em}
.page-subtitle{margin:4px 0 0;color:var(--text-mute);font-size:14px}
.page-header-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px}
/* ── Theme toggle & logout ───────────────────────────────────────── */
.theme-toggle-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border-radius:999px;background:transparent;color:var(--text-mute);border:none;cursor:pointer;font-family:inherit;transition:all 0.15s ease}
.theme-toggle-btn:hover{color:var(--accent);background:var(--bg-elev-2);transform:rotate(15deg)}
.theme-toggle-btn svg{flex-shrink:0}
.logout-btn{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:transparent;color:var(--text-mute);border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all 0.15s ease}
.logout-btn:hover{border-color:var(--bad);color:var(--bad);background:rgba(248,113,113,0.06)}
.logout-btn svg{flex-shrink:0}
/* ── Status counts strip ─────────────────────────────────────────── */
.counts-strip{display:flex;gap:6px;flex-wrap:wrap}
.count-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;border:none;background:var(--bg-elev);color:var(--text-mute);cursor:pointer;font-size:13px;font-weight:500;transition:all 0.15s ease}
.count-pill:hover{background:var(--bg-elev-2);color:var(--text)}
.count-pill.active{background:var(--accent);color:#fff}
.day-mode .count-pill.active{color:#fff}
.count-pill-num{font-family:var(--font-mono);font-size:12px;padding:2px 7px;background:rgba(0,0,0,0.18);border-radius:10px;min-width:22px;text-align:center}
.count-pill:not(.active) .count-pill-num{background:rgba(0,0,0,0.06)}
.night-mode .count-pill:not(.active) .count-pill-num{background:rgba(255,255,255,0.06)}
/* Read-only variant — used for the destination summary pills in the header
   slot. Visually identical to a non-active count-pill, but not interactive
   (no hover, no pointer) since these are KPI displays, not filters. */
.count-pill--readonly{cursor:default}
.count-pill--readonly:hover{background:var(--bg-elev);color:var(--text-mute)}
/* ── Scope banner ────────────────────────────────────────────────── */
.scope-banner{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:var(--bg-elev);border-left:3px solid var(--accent);border-radius:10px;margin-bottom:12px;font-size:13px;line-height:1.5;color:var(--text)}
.scope-banner svg{flex-shrink:0;margin-top:2px;color:var(--accent)}
.scope-banner-body{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline}
.scope-banner-label{color:var(--text-mute);font-size:12px;text-transform:uppercase;letter-spacing:0.05em}
.scope-banner-cities{color:var(--text-mute);font-size:12.5px}
.scope-banner-priority{color:#f59e0b;font-size:12px;font-weight:600}
.scope-banner--empty{border-left-color:var(--bad);background:rgba(248,113,113,0.06)}
.scope-banner--empty svg{color:var(--bad)}
.scope-banner--empty strong{color:var(--bad)}
.scope-banner--warning{border-left-color:#f59e0b;background:rgba(245,158,11,0.06)}
.scope-banner--warning svg{color:#f59e0b}
.scope-banner--warning code{font-family:var(--font-mono);font-size:0.95em;padding:1px 5px;background:rgba(245,158,11,0.12);border-radius:3px;color:#f59e0b}
/* ── Filter bar ──────────────────────────────────────────────────── */
.filter-bar{display:flex;align-items:center;gap:16px;padding:12px 14px;background:var(--bg-elev);border-radius:12px;margin-bottom:16px;flex-wrap:wrap}
.filter-group{display:flex;align-items:center;gap:8px}
.filter-group--right{margin-left:auto}
.filter-label{font-size:12px;font-weight:600;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.06em}
.filter-chips{display:flex;gap:4px}
.chip{padding:5px 12px;border-radius:6px;background:transparent;color:var(--text-mute);border:none;font-size:13px;cursor:pointer;transition:all 0.15s ease}
.chip:hover{color:var(--text);background:var(--bg-elev-2)}
.chip.active{background:var(--bg-elev-2);color:var(--text);border-color:var(--line)}
.chip.signature.active{color:#d4af37;border-color:#d4af3744}
.chip.spotlight.active{color:#60a5fa;border-color:#60a5fa44}
.chip.verified.active{color:var(--good);border-color:rgba(52,211,153,0.3)}
.filter-input{padding:6px 10px;border-radius:6px;background:var(--bg-elev-2);color:var(--text);border:none;font-size:13px;width:180px;outline:none;transition:border-color 0.15s ease,box-shadow 0.15s ease}
.filter-input::placeholder{color:var(--text-faint)}
.filter-input:focus{background: var(--bg)}
/* ── Ghost button ────────────────────────────────────────────────── */
.ghost-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:6px;background:transparent;border:none;color:var(--text);font-size:13px;font-family:inherit;cursor:pointer;transition:all 0.15s ease}
.ghost-btn:hover:not(:disabled){background:var(--bg-elev-2)}
.ghost-btn:disabled{opacity:0.45;cursor:not-allowed}
.ghost-btn-sm{padding:4px 10px;font-size:12px}
/* ── Main grid ───────────────────────────────────────────────────── */
.main-grid{display:grid;grid-template-columns:1fr;gap:16px}
/* Drawer is now centered (modal-style); grid stays single-column even when open */
/* ── Table ───────────────────────────────────────────────────────── */
.table-wrap{background:var(--bg-elev);border-radius:12px;overflow:hidden}
.biz-table{width:100%;border-collapse:collapse;font-size:13.5px}
.biz-table thead th{text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-mute);padding:12px 14px;background:var(--bg-elev-2);position:sticky;top:0;z-index:1}
.biz-row{cursor:pointer;transition:background 0.12s ease}
.biz-row:hover{background:var(--bg-elev-2)}
.biz-row td{padding:12px 14px;vertical-align:middle}
.biz-row--selected{background:var(--bg-elev-2)}
.biz-row--selected td.col-name{box-shadow:inset 3px 0 0 var(--accent)}
.row-name{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.row-name-text{font-weight:600;color:var(--text)}
.row-sub{font-size:12px;color:var(--text-faint);margin-top:3px}
.row-tag{font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:0.05em}
.row-tag.waitlist{background:rgba(251,191,36,0.15);color:var(--warn)}
.row-tag.auction-winner{background:rgba(99,102,241,0.18);color:#818cf8}
.row-tag.row-tag--verified{background:rgba(34,197,94,0.18);color:#22c55e}
.auction-win-banner{font-size:12px;line-height:1.5;padding:10px 12px;margin-bottom:10px;border-radius:8px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.35);color:var(--text)}
.verified-badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(34,197,94,0.18);color:#22c55e;letter-spacing:0.04em}
.verified-badge--rejected{background:rgba(239,68,68,0.18);color:#ef4444}
.row-tag.gem{background:rgba(212,175,55,0.18);color:#d4af37}
.row-tag.row-tag--watch{background:rgba(245,158,11,0.18);color:#f59e0b;cursor:help}

/* ── Blocklist matches card (drawer) ─────────────────────────────────
   Amber accent — sits between green (clean) and red (rejected). The
   intent is "review carefully", not "auto-reject". */
.watch-flags-card{border-left:3px solid #f59e0b;padding-left:12px}
.watch-flag-list{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:8px}
.watch-flag-item{padding:8px 10px;background:rgba(245,158,11,0.06);border-radius:8px;border:1px solid rgba(245,158,11,0.2)}
.watch-flag-head{display:flex;align-items:center;gap:8px}
.watch-flag-type{font-family:var(--font-mono);font-size:12px;color:#b45309;font-weight:600}
.watch-flag-severity{font-size:10px;padding:1px 6px;border-radius:999px;text-transform:uppercase;letter-spacing:0.04em}
.watch-flag-severity.sev-watch{background:rgba(245,158,11,0.18);color:#b45309}
.watch-flag-severity.sev-block{background:rgba(239,68,68,0.18);color:#b91c1c}
.watch-flag-count{font-size:11px;color:var(--text-mute);margin-left:auto}
.watch-flag-reason{margin:4px 0 0;font-size:12px;color:#4b3a10}
.staff-val.day-mode .watch-flag-reason{color:#4b3a10}
.staff-val.night-mode .watch-flag-reason{color:#fde68a}

/* ── Flag-on-reject checkbox in the confirm modal ───────────────────── */
.flag-options{margin-top:12px;padding:10px 12px;background:rgba(245,158,11,0.06);border-radius:8px;font-size:13px;text-align:left}
.flag-checkbox{display:flex;gap:8px;align-items:flex-start;cursor:pointer}
.flag-checkbox input[type=checkbox]{margin-top:3px;flex-shrink:0}
.flag-helper{display:block;margin-top:2px;font-size:11.5px;opacity:0.85}
.flag-type-picker{display:flex;gap:12px;margin-top:8px;padding-left:24px}
.flag-type-option{display:inline-flex;gap:4px;align-items:center;font-family:var(--font-mono);font-size:12px;cursor:pointer}
.col-tier{width:120px;text-align:center}
.col-cat{width:180px;text-align:center}
.col-city{width:200px;text-align:center}
.col-ai{width:200px;text-align:center}
.col-age{width:130px;text-align:right;white-space:nowrap}
/* Header cells inherit the same alignment as their column */
.biz-table th.col-tier,.biz-table td.col-tier{text-align:center}
.biz-table th.col-cat,.biz-table td.col-cat{text-align:center}
.biz-table th.col-city,.biz-table td.col-city{text-align:center}
.biz-table th.col-ai,.biz-table td.col-ai{text-align:center}
.biz-table th.col-age,.biz-table td.col-age{text-align:right}
/* ── Destinations biz-table modifier ─────────────────────────────────
   Column alignments for the destinations tab's table. We piggy-back on
   .biz-table's row/hover/borders/typography but the column set is
   different from validation (no tier / AI / age columns), so we declare
   our own col-* alignment rules under the modifier class. Column header
   text itself stays whatever the markup says — these rules only handle
   alignment, width hints, and a few small things like action-button
   wrapping. */
.biz-table--dest th.col-city,.biz-table--dest td.col-city{text-align:center}
.biz-table--dest th.col-views,.biz-table--dest td.col-views{text-align:center;font-family:var(--font-mono);font-size:12.5px}
.biz-table--dest th.col-clicks,.biz-table--dest td.col-clicks{text-align:center;font-family:var(--font-mono);font-size:12.5px}
.biz-table--dest th.col-author,.biz-table--dest td.col-author{text-align:center;color:var(--text-mute);font-size:12.5px}
.biz-table--dest th.col-actions,.biz-table--dest td.col-actions{text-align:right;white-space:nowrap}
.biz-table--dest td.col-actions .action-group{justify-content:flex-end}
/* Faint gem-tint on hidden-gem rows so they stand out at a glance. */
.biz-table--dest .biz-row.row-hidden-gem{background:linear-gradient(90deg,rgba(212,175,55,0.05),transparent 40%)}
.night-mode .biz-table--dest .biz-row.row-hidden-gem{background:linear-gradient(90deg,rgba(192,132,252,0.06),transparent 40%)}
/* ── Tier pills ──────────────────────────────────────────────────── */
.tier-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:4px;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em}
.tier-pill.verified{background:rgba(34,197,94,0.12);color:var(--good);border-color:rgba(34,197,94,0.25)}
.tier-pill.spotlight{background:rgba(59,130,246,0.12);color:#60a5fa;border-color:rgba(59,130,246,0.30)}
.tier-pill.signature{background:rgba(212,175,55,0.14);color:#d4af37;border-color:rgba(212,175,55,0.35)}
.day-mode .tier-pill.spotlight{color:#1d4ed8}
/* ── Text utilities ──────────────────────────────────────────────── */
.mono-sm{font-family:var(--font-mono);font-size:11.5px;color:var(--text-mute)}
.muted{color:var(--text-faint)}
.muted-sm{color:var(--text-faint);font-size:12px}
/* ── AI bar ──────────────────────────────────────────────────────── */
.ai-bar{position:relative;display:flex;align-items:center;height:18px;background:var(--bg-elev-2);border-radius:4px;padding:0 6px;font-family:var(--font-mono);font-size:11px;font-weight:600;overflow:hidden;width:100%;max-width:130px;margin:0 auto}
.ai-bar-fill{position:absolute;inset:0 auto 0 0;background:var(--good);opacity:0.22;transition:width 0.3s ease}
.ai-bar.mid .ai-bar-fill{background:var(--warn)}
.ai-bar.low .ai-bar-fill{background:var(--bad)}
.ai-bar-num{position:relative}
.ai-bar.good .ai-bar-num{color:var(--good)}
.ai-bar.mid .ai-bar-num{color:var(--warn)}
.ai-bar.low .ai-bar-num{color:var(--bad)}
/* ── Empty state & spinner ───────────────────────────────────────── */
.table-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:60px 20px;color:var(--text-mute);font-size:14px}
.spinner{width:22px;height:22px;border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* ── Pagination ──────────────────────────────────────────────────── */
.pagination{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg-elev-2)}
.page-indicator{font-size:12px;color:var(--text-mute);font-family:var(--font-mono)}
/* ── Drawer ──────────────────────────────────────────────────────── */
/* Backdrop behind the centered drawer */
.drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(2px);z-index:49;animation:drawer-fade .15s ease-out}
.night-mode .drawer-backdrop{background:rgba(0,0,0,0.72);backdrop-filter:blur(4px)}
/* Centered modal-style drawer */
.drawer{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:min(720px,92vw);max-height:90vh;background:var(--bg-elev);border-radius:12px;display:flex;flex-direction:column;overflow-y:auto;z-index:50;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:drawer-pop .18s ease-out}
.night-mode .drawer{border:1px solid var(--line-soft);box-shadow:0 24px 70px rgba(0,0,0,0.6)}
@keyframes drawer-fade{from{opacity:0}to{opacity:1}}
@keyframes drawer-pop{from{opacity:0;transform:translate(-50%,-48%) scale(.98)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
/* ── Scrollbars (matches JinniChat) ──────────────────────────────── */
/* Descendants only here. The host (.staff-val) scrollbar is styled in a
   separate non-scoped block at the bottom because Vue's scoped CSS
   mangles `.staff-val::-webkit-scrollbar` selectors. */
.staff-val ::-webkit-scrollbar{width:8px;height:8px}
.staff-val ::-webkit-scrollbar-track{background:transparent}
.staff-val ::-webkit-scrollbar-thumb{border-radius:4px;background:rgba(128,128,128,0.5)}
.staff-val ::-webkit-scrollbar-thumb:hover{background:rgba(128,128,128,0.8)}
.staff-val.night-mode ::-webkit-scrollbar-thumb{background:rgba(192,132,252,0.1)}
.staff-val.night-mode ::-webkit-scrollbar-thumb:hover{background:rgba(192,132,252,0.3)}
.staff-val.day-mode ::-webkit-scrollbar-thumb{background:rgba(160,82,45,0.3)}
.staff-val.day-mode ::-webkit-scrollbar-thumb:hover{background:rgba(160,82,45,0.5)}
.staff-val.night-mode{scrollbar-width:thin;scrollbar-color:rgba(192,132,252,0.3) transparent}
.staff-val.day-mode{scrollbar-width:thin;scrollbar-color:rgba(160,82,45,0.4) transparent}
/* ── Drawer header ───────────────────────────────────────────────── */
.drawer-head{padding:18px 20px 14px;background:var(--bg-elev-3);position:sticky;top:0;z-index:2}
.drawer-head-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.drawer-close{margin-left:auto;background:var(--bg-elev-2);color:var(--text-mute);width:30px;height:30px;border-radius:6px;border:none;display:grid;place-items:center;cursor:pointer;transition:all 0.15s ease}
.drawer-close:hover{background:var(--bg-elev-2);color:var(--text)}
.drawer-title{margin:0;font-size:20px;font-weight:600;letter-spacing:-0.01em}
.drawer-sub{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-faint);margin-top:4px;flex-wrap:wrap}
.dot-sep{color:var(--text-faint)}
/* ── Status pills ────────────────────────────────────────────────── */
.status-pill{padding:3px 9px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;background:var(--bg-elev-2)}
.status-pill.status-pending{color:var(--warn);border-color:rgba(251,191,36,0.4);background:rgba(251,191,36,0.08)}
.status-pill.status-active{color:var(--good);border-color:rgba(52,211,153,0.4);background:rgba(52,211,153,0.08)}
.status-pill.status-rejected{color:var(--bad);border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.08)}
.status-pill.status-frozen{color:#94a3b8}
.status-pill.status-waitlisted{color:var(--accent);border-color:var(--line)}
.status-pill.status-expired{color:#a8a29e;border-color:rgba(168,162,158,0.4);background:rgba(168,162,158,0.08)}
/* ── Drawer sections ─────────────────────────────────────────────── */
.drawer-section{padding:16px 20px;border-bottom:1px solid var(--line-soft)}
.drawer-section:last-of-type{border-bottom:none}
.section-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.section-head h3{margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-mute)}
.count-tag{font-family:var(--font-mono);font-size:11px;background:var(--bg-elev-2);padding:1px 6px;border-radius:8px;color:var(--text-faint);margin-left:6px}
/* ── AI card (featured) ──────────────────────────────────────────── */
.ai-card{background:linear-gradient(135deg,var(--bg-elev-2),transparent)}
.ai-score-big{font-family:var(--font-mono);font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1}
.ai-score-big.good{color:var(--good)}
.ai-score-big.mid{color:var(--warn)}
.ai-score-big.low{color:var(--bad)}
.ai-score-pct{font-size:14px;font-weight:500;opacity:0.5;margin-left:1px}
.ai-notes{margin:0;font-size:13px;line-height:1.55;color:var(--text);white-space:pre-wrap}
.staff-prefilled{margin:10px 0 0;padding:8px 10px;background:var(--bg-elev-2);border-left:2px solid var(--accent);border-radius:4px;font-size:12.5px;line-height:1.5}
/* ── Gallery ─────────────────────────────────────────────────────── */
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
.gallery-item{aspect-ratio:4/3;border-radius:6px;overflow:hidden;background:var(--bg-elev-2);display:block;transition:transform 0.18s ease,box-shadow 0.18s ease}
.gallery-item:hover{transform:scale(1.03);box-shadow:0 8px 20px rgba(0,0,0,0.18)}
.gallery-item img{width:100%;height:100%;object-fit:cover;display:block}
/* ── Description & highlights ────────────────────────────────────── */
.desc-short{font-size:14px;font-weight:500;line-height:1.5;margin-bottom:8px;color:var(--text)}
.desc-detailed{font-size:13px;line-height:1.6;color:var(--text);white-space:pre-wrap}
.highlights{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.highlight-tag{padding:3px 8px;border-radius:4px;font-size:12px;background:var(--bg-elev-2);color:var(--text)}
/* ── Tag rows ────────────────────────────────────────────────────── */
.tag-row{display:flex;flex-wrap:wrap;gap:5px}
.type-tag{padding:3px 8px;border-radius:4px;font-size:11.5px;font-family:var(--font-mono)}
.type-tag.primary{background:var(--bg-elev-2);color:var(--text);border-color:var(--line)}
.type-tag.interest{color:var(--accent-2);border-color:rgba(167,139,250,0.35)}
.type-tag.style{color:#d4af37;border-color:rgba(212,175,55,0.35)}
.day-mode .type-tag.interest{color:#6d28d9}
/* ── KV grid ─────────────────────────────────────────────────────── */
.kv-grid{display:grid;grid-template-columns:90px 1fr;gap:6px 12px;margin:0;font-size:13px}
.kv-grid dt{color:var(--text-mute);font-weight:500;text-transform:lowercase;font-variant:small-caps;letter-spacing:0.04em}
.kv-grid dd{margin:0;color:var(--text);word-break:break-word}
.link-sm{color:var(--accent);text-decoration:none;font-size:13px;word-break:break-all}
.link-sm:hover{text-decoration:underline}
/* ── Zone summary ────────────────────────────────────────────────── */
.zone-summary{display:flex;flex-direction:column;gap:10px}
.zone-counts{display:flex;align-items:center;gap:14px}
.zone-count{display:flex;align-items:baseline;gap:6px;padding:6px 12px;background:var(--bg-elev-2);border-radius:8px}
.zone-count.full{border-color:var(--bad);color:var(--bad)}
.zone-count-num{font-family:var(--font-mono);font-size:22px;font-weight:700}
.zone-count-label{font-size:12px;color:var(--text-mute)}
.zone-mini{display:flex;gap:5px}
.mini-pill{padding:2px 7px;border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:600}
.mini-pill.verified{background:rgba(34,197,94,0.12);color:var(--good)}
.mini-pill.spotlight{background:rgba(59,130,246,0.12);color:#60a5fa}
.mini-pill.signature{background:rgba(212,175,55,0.14);color:#d4af37}
.zone-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.zone-list li{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;background:var(--bg-elev-2);font-size:13px}
.zone-list li.zone-self{outline:1px solid var(--accent)}
.zone-list-name{flex:1;font-weight:500}
.zone-self-tag{font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--accent);padding:1px 6px;border-radius:3px}
/* ── Pricing ─────────────────────────────────────────────────────── */
.pricing-row{display:flex;flex-wrap:wrap;gap:6px}
.price-tag{padding:3px 9px;border-radius:4px;font-size:12px;background:var(--bg-elev-2);font-family:var(--font-mono)}
.price-tag.free{color:var(--good);border-color:rgba(52,211,153,0.4)}
/* ── Hours ───────────────────────────────────────────────────────── */
.hours-247{font-size:14px;font-weight:600;color:var(--good);padding:8px 12px;background:rgba(52,211,153,0.08);border-radius:6px;text-align:center}
.hours-table{width:100%;border-collapse:collapse}
.hours-table tr td{padding:4px 8px;font-size:13px}
.hours-table tr td:first-child{color:var(--text-mute);text-transform:capitalize}
.hours-day{width:100px}
/* ── Verification audit trail ───────────────────────────────────── */
.action-pill{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-family:var(--font-mono);font-weight:600;text-transform:uppercase;letter-spacing:0.04em}
.action-pill.action-approved{color:var(--good);background:rgba(52,211,153,0.12)}
.action-pill.action-rejected{color:var(--bad);background:rgba(248,113,113,0.12)}
.action-pill.action-reassigned{color:var(--accent);background:rgba(96,165,250,0.12)}
.action-pill.action-reset{color:var(--text-mute);background:var(--bg-elev-2)}
.history-list{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.history-item{padding:8px 10px;background:var(--bg-elev-2);border-radius:6px;display:flex;flex-direction:column;gap:4px}
.history-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.history-role{color:var(--text-faint)}
.history-notes{margin:4px 0 0;font-size:13px;line-height:1.5;color:var(--text);white-space:pre-wrap}
/* ── Uploaded image metadata ───────────────────────────────────── */
.uploaded-list{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}
.uploaded-item{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 10px;background:var(--bg-elev-2);border-radius:4px;font-size:12px}
/* ── Privacy / flag pills ───────────────────────────────────────── */
.privacy-tag{margin-left:8px;font-size:10.5px;font-family:var(--font-mono);padding:1px 6px;border-radius:3px;background:var(--bg-elev-2);color:var(--text-faint);text-transform:uppercase;letter-spacing:0.05em}
.privacy-tag.shown{color:var(--good);background:rgba(52,211,153,0.10)}
.flag-pill{display:inline-block;padding:1px 8px;border-radius:3px;font-size:11px;font-family:var(--font-mono);background:var(--bg-elev-2);color:var(--text-mute);text-transform:uppercase;letter-spacing:0.05em}
.flag-pill.on{color:var(--good);background:rgba(52,211,153,0.10)}
/* ── Subscription ───────────────────────────────────────────────── */
.sub-rel{margin-left:6px}
/* ── Analytics ──────────────────────────────────────────────────── */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px}
.stat-cell{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;background:var(--bg-elev-2);border-radius:6px}
.stat-num{font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--text);line-height:1}
.stat-num.good{color:var(--good)}
.stat-num.bad{color:var(--bad)}
.stat-lbl{font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-faint)}
.sub-head{margin:14px 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-mute)}
.trend-row{display:flex;align-items:flex-end;gap:10px;margin-bottom:8px}
.trend-label{width:50px;font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.05em;padding-bottom:2px}
.trend-bars{flex:1;display:flex;align-items:flex-end;gap:3px;height:36px;padding:2px 0}
.trend-bar{flex:1;min-height:2px;background:var(--good);opacity:0.55;border-radius:2px 2px 0 0;transition:opacity 0.15s}
.trend-bar.accent{background:var(--accent)}
.trend-bar:hover{opacity:1}
.trend-total{min-width:32px;text-align:right;color:var(--text-mute)}
/* ── Drawer actions ──────────────────────────────────────────────── */
.drawer-actions{position:sticky;bottom:0;background:var(--bg-elev);padding:14px 20px;display:flex;flex-direction:column;gap:10px}
.drawer-actions--readonly{padding:16px 20px;align-items:center}
.staff-note{width:100%;padding:10px 12px;border-color: transparent;font-family:inherit;font-size:14px;line-height:1.5;background:var(--bg);border-radius:6px;color:var(--text);resize:vertical;outline:none;box-sizing:border-box;min-height:80px}
.staff-note:focus{border-color:var(--accent)}
.action-error{font-size:12px;color:var(--bad);padding:6px 10px;background:rgba(248,113,113,0.08);border-radius:4px}
.action-buttons{display:flex;gap:8px}
.action-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 14px;border-radius:8px;background:var(--bg-elev-2);color:var(--text);font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.15s ease}
.action-btn:disabled{opacity:0.5;cursor:not-allowed}
.action-btn.approve{background:var(--good);color:#fff;border-color:transparent}
.action-btn.approve:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 6px 14px rgba(52,211,153,0.25)}
.action-btn.reject{background:transparent;border-color:transparent;color:var(--bad)}
.action-btn.reject:hover:not(:disabled){background:rgba(248,113,113,0.10)}
/* Permanent reject — solid red so it reads as the heavier, irreversible action.
   The action-bar button uses `reject-permanent`; the modal confirm button gets
   `reject_permanent` from :class="confirmingAction". Style both. */
.action-btn.reject-permanent,.action-btn.reject_permanent{background:var(--bad);color:#fff;border-color:transparent}
.action-btn.reject-permanent:hover:not(:disabled),.action-btn.reject_permanent:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 6px 14px rgba(248,113,113,0.30)}
.flag-options--permanent{margin-top:10px;padding:10px 12px;background:rgba(248,113,113,0.08);border-radius:8px}
/* ── Modal ───────────────────────────────────────────────────────── */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px;z-index:100}
.modal{width:100%;max-width:460px;background:var(--bg);border-radius:14px;padding:22px;color:var(--text)}
.night-mode .modal{background:#1a0b2e}
.day-mode .modal{background:#fff}
.modal-title{margin:0 0 8px;font-size:18px;font-weight:600}
.modal-body{margin:0 0 14px;font-size:13.5px;line-height:1.6;color:var(--text-mute)}
.modal-body strong{color:var(--text)}
.modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
.modal-actions .action-btn{flex:0 1 auto;min-width:110px}
.fade-enter-active,.fade-leave-active{transition:opacity 0.18s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
/* ── Toast ───────────────────────────────────────────────────────── */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 18px;border-radius:10px;font-size:13.5px;font-weight:500;background:var(--bg);color:var(--text);box-shadow:0 10px 30px rgba(0,0,0,0.25);z-index:200;max-width:90vw}
.toast.success{border-color:var(--good);color:var(--good)}
.toast.error{border-color:var(--bad);color:var(--bad)}
.slide-up-enter-active,.slide-up-leave-active{transition:all 0.25s ease}
.slide-up-enter-from,.slide-up-leave-to{opacity:0;transform:translate(-50%,12px)}
/* ── Mobile ──────────────────────────────────────────────────────── */
@media (max-width:768px){
  .staff-val{padding:16px 12px 80px}
  .page-header{flex-direction:column}
  .page-header-right{width:100%}
  .filter-bar{flex-direction:column;align-items:stretch}
  .filter-group{flex-wrap:wrap}
  .filter-group--right{margin-left:0}
  .filter-input{width:100%}
  .drawer{top:0;left:0;transform:none;width:100%;max-height:100vh;border-radius:0;inset:0}

  /* ── Mobile: convert table into stacked cards ─────────────────────────
     A 6-column table doesn't fit on a phone. Each <tr> becomes a card,
     each <td> becomes a labeled row. <thead> is hidden because the
     data-label on each <td> shows the column name inline.            */
  .table-wrap{background:transparent;border-radius:0;overflow:visible}
  .biz-table{display:block;font-size:14px}
  .biz-table thead{display:none}
  .biz-table tbody{display:block}
  .biz-row{display:block;background:var(--bg-elev);border:1px solid var(--line-soft);border-radius:10px;margin-bottom:10px;padding:4px 0}
  .biz-row:hover{background:var(--bg-elev)}
  .biz-row--selected{background:var(--bg-elev-2);border-color:var(--accent)}
  .biz-row--selected td.col-name{box-shadow:none}
  .biz-row td{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 14px;width:auto !important;text-align:right !important;border-bottom:1px solid var(--line-soft)}
  .biz-row td:last-child{border-bottom:none}
  .biz-row td::before{content:attr(data-label);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-mute);flex-shrink:0}

  /* Name cell: full-width header style, no label, no right-align */
  .biz-row td.col-name{display:block;text-align:left !important;padding:12px 14px;background:var(--bg-elev-2);border-radius:9px 9px 0 0;border-bottom:1px solid var(--line-soft)}
  .biz-row td.col-name::before{display:none}
  .row-name{justify-content:flex-start}

  /* AI bar: keep it visible on the right, but cap width sensibly */
  .biz-row td.col-ai .ai-bar{max-width:120px;margin:0}

  /* Pagination: stack the buttons + indicator vertically with breathing room */
  .pagination{flex-direction:column;gap:10px;text-align:center}
}

/* ─────────────────────────────────────────────────────────────────
   TAB STRIP — between header and content. Pure typography, no
   gradient gimmicks; matches the page's terminal-ish aesthetic.
   ───────────────────────────────────────────────────────────────── */
.tab-strip{display:flex;gap:4px;padding:4px;background:var(--bg-elev);border-radius:12px;margin-bottom:16px;width:fit-content;max-width:100%;overflow-x:auto}
.tab-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:8px;background:transparent;border:none;color:var(--text-mute);font-family:inherit;font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap;transition:all 0.18s ease}
.tab-btn:hover{background:var(--bg-elev-2);color:var(--text)}
.tab-btn.active{background:var(--accent);color:#fff}
.day-mode .tab-btn.active{color:#fff}
.tab-mark{font-family:var(--font-mono);opacity:0.5;font-size:0.85em}
.tab-btn.active .tab-mark{opacity:0.7}
.tab-label{letter-spacing:0.01em}
.tab-count{font-family:var(--font-mono);font-size:11px;padding:2px 7px;background:rgba(0,0,0,0.18);border-radius:10px;min-width:18px;text-align:center}
.tab-btn:not(.active) .tab-count{background:rgba(0,0,0,0.06)}
.night-mode .tab-btn:not(.active) .tab-count{background:rgba(255,255,255,0.06)}

/* ─────────────────────────────────────────────────────────────────
   DESTINATIONS TAB
   Visual language matches the validation tab (cards, pills, chips).
   The form modal is wider than the approve/reject confirm modal so
   the location grid and category chips have room to breathe.
   ───────────────────────────────────────────────────────────────── */
.dest-kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px}
.dest-kpi{display:flex;flex-direction:column;gap:2px;padding:12px 14px;background:var(--bg-elev);border-radius:10px;border:1px solid var(--line-soft)}
.dest-kpi-num{font-size:22px;font-weight:700;font-family:var(--font-mono);color:var(--text);letter-spacing:-0.02em}
.dest-kpi-num.good{color:var(--good)}
.dest-kpi-num.accent{color:var(--accent)}
.dest-kpi-lbl{font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.06em}

/* "Add destination" button — uses accent + filled treatment to draw the eye */
.add-dest-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;background:var(--accent);color:#fff;border:none;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s ease}
.add-dest-btn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
.add-dest-btn:disabled{opacity:0.4;cursor:not-allowed}
.day-mode .add-dest-btn{color:#fff}

/* Row actions in the destinations table */
.dest-actions{display:inline-flex;gap:4px;flex-wrap:wrap}
.row-inactive{opacity:0.55}
.row-tag.inactive{background:var(--bg-elev-3);color:var(--text-mute);font-size:10px;padding:1px 6px;border-radius:6px;text-transform:uppercase;letter-spacing:0.06em}
.ghost-btn.danger{color:var(--bad)}
.ghost-btn.danger:hover:not(:disabled){background:rgba(248,113,113,0.1)}

/* Wide variant of the existing .modal for the destination form. */
.modal--wide{max-width:680px;width:96vw;max-height:90vh;display:flex;flex-direction:column;padding:0}
.dest-modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--line-soft);flex-shrink:0}
.dest-modal-badge{display:inline-block;padding:2px 10px;border-radius:10px;background:var(--accent);color:#fff;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em}
.dest-modal-body{padding:14px 22px;overflow-y:auto;flex:1;min-height:0}
.dest-modal-actions{display:flex;justify-content:flex-end;gap:10px;padding:14px 22px;border-top:1px solid var(--line-soft);background:var(--bg-elev);flex-shrink:0}

/* Form fields */
.dest-field{margin-bottom:12px}
.dest-field--full{grid-column:1/-1}
.dest-label{display:block;font-size:12px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;font-weight:600}
.req{color:var(--bad);font-size:0.9em}
.dest-input{width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);font-family:inherit;font-size:13.5px;box-sizing:border-box;outline:none;transition:border-color 0.15s ease,box-shadow 0.15s ease}
.dest-input::placeholder{color:var(--text-faint)}
.dest-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(167,139,250,0.18)}
.day-mode .dest-input:focus{box-shadow:0 0 0 3px rgba(184,115,51,0.18)}
textarea.dest-input{resize:vertical;min-height:60px;font-family:inherit}

.dest-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
.dest-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.dest-coords-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dest-help{display:flex;align-items:center;gap:10px;margin-top:6px;flex-wrap:wrap}

.dest-checkbox-row{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:8px}
.dest-checkbox-row label{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text)}
.dest-checkbox-row input[type="checkbox"]{accent-color:var(--accent);width:15px;height:15px;cursor:pointer}

/* Category chip groups */
.dest-type-group{margin-bottom:10px}
.dest-type-label{display:block;font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;font-weight:600}
.dest-chip-row{display:flex;flex-wrap:wrap;gap:6px}
.dest-chip{padding:5px 12px;border-radius:999px;background:transparent;color:var(--text-mute);border:1px solid var(--line);font-size:12.5px;font-family:inherit;cursor:pointer;transition:all 0.15s ease}
.dest-chip:hover{color:var(--text);border-color:var(--accent)}
.dest-chip.active{background:var(--accent);border-color:var(--accent);color:#fff}
.dest-chip.primary.active{background:var(--accent)}
.dest-chip.interest.active{background:var(--good);border-color:var(--good)}
.dest-chip.style.active{background:var(--warn);border-color:var(--warn);color:#1a0e36}
.day-mode .dest-chip.style.active{color:#3c2a1e}

.dest-image-row{display:flex;gap:8px;align-items:stretch;margin-bottom:6px}
.dest-image-row .dest-input{flex:1}

.dest-warn{display:flex;align-items:center;gap:8px;padding:8px 12px;margin-top:8px;background:rgba(245,158,11,0.1);color:#f59e0b;border-radius:8px;font-size:12.5px;line-height:1.45}

/* Section heads inside the dest modal reuse .drawer-section / .section-head
   from the validation tab — but the dest modal lives outside the drawer
   container so we re-declare just the spacing & colour pieces they need. */
.dest-modal-body .drawer-section{padding:14px 0;border-bottom:1px solid var(--line-soft)}
.dest-modal-body .drawer-section:last-of-type{border-bottom:none}
.dest-modal-body .section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px}
.dest-modal-body .section-head h3{margin:0;font-size:13px;font-weight:600;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.06em}

/* Mobile tweaks for the destinations tab */
@media (max-width: 720px){
  .tab-strip{width:100%;justify-content:flex-start}
  .tab-btn{flex:1;justify-content:center;padding:9px 8px;font-size:12.5px}
  .dest-grid-2{grid-template-columns:1fr}
  .dest-grid-3{grid-template-columns:1fr 1fr}
  .dest-modal-head, .dest-modal-body, .dest-modal-actions{padding-left:14px;padding-right:14px}
  .add-dest-btn{padding:7px 10px;font-size:12.5px}
}


@keyframes spin { to { transform: rotate(360deg); } }
.loader-ring { width: 38px; height: 38px; border: 3px solid transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
.loader-ring--sm { width: 16px; height: 16px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 6px; }
/* ── KPI CARDS ── */
.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.kpi-grid--4 { grid-template-columns: repeat(4, 1fr); }
.kpi-grid--5 { grid-template-columns: repeat(5, 1fr); }
.kpi-card { border-radius: 14px; padding: 10px 15px; transition: all 0.2s ease; position: relative; overflow: hidden; }
.kpi-card::before { content: ''; position: absolute; inset: 0; border-radius: inherit; opacity: 0; }
.kpi-card:hover::before { opacity: 1; }
.kpi-icon { font-size: 18px; margin-bottom: 10px; display: block; line-height: 1; }
.kpi-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Mono', monospace; margin-bottom: 5px; }
.kpi-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; line-height: 1; margin-bottom: 5px; }
.kpi-sub { font-size: 11px; font-family: 'DM Mono', monospace; }
.kpi-progress-bar { margin-top: 10px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.2); overflow: hidden; }
.kpi-progress-fill { height: 100%; border-radius: 2px; background: rgba(255,255,255,0.7); transition: width 0.6s ease; }
/* ── CARDS ── */
.card { border-radius: 14px; overflow: hidden; transition: all 0.2s; }
.card-head { display: flex; align-items: baseline; gap: 10px; padding: 16px 20px 13px; flex-wrap: wrap; }
.card-head h2 { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: -0.2px; }
.card-sub { font-size: 11px; font-family: 'DM Mono', monospace; }
.card-head-spacer { flex: 1; }
/* ── TOOLBAR ── */
.toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.search-wrap { display: flex; align-items: center; gap: 8px; flex: 1; max-width: 320px; border-radius: 20px; padding: 0 14px; }
.search-icon { flex-shrink: 0 }
.search-input { flex: 1; border: none; background: transparent; outline: none; padding: 9px 0; font-family: 'DM Sans', sans-serif; font-size: 13px; border-radius: 20px; padding: 9px 14px 9px 14px;}
/* ── SEGMENTED FILTER BUTTONS ── */
.seg-group { display: inline-flex; border-radius: 10px; overflow: hidden; gap: 2px; padding: 3px; }
.seg-btn { padding: 6px 14px; border: none; border-radius: 7px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.18s ease; background: transparent; white-space: nowrap; }
/* ── TABLES ── */
.table-card { overflow: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 11px 12px; text-align: center; font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; font-family: 'DM Mono', monospace; white-space: nowrap; }
.data-table td { padding: 11px 12px; vertical-align: middle; text-align: center; }
.data-table th:first-child { text-align: left; padding-left: 16px; }
.data-table td:first-child { text-align: left; padding-left: 16px; }
.data-table th:last-child { padding-right: 16px; }
.data-table td:last-child { padding-right: 16px; }
.table-row { transition: background 0.1s; }
.table-row:last-child { border-bottom: none !important; }
.loading-cell, .empty-cell { text-align: center; padding: 40px; font-size: 13px; }
.user-name { font-weight: 600; font-size: 13px; }
.num-cell { font-family: 'DM Mono', monospace; font-size: 13px; }
.dim-cell { font-size: 12px; font-family: 'DM Mono', monospace; }
/* Toolbar wrap: lets the search/filter row break onto multiple lines when there are many controls */
.toolbar.toolbar--wrap { flex-wrap: wrap; row-gap: 8px; }
/* ── Edit modal: opening hours ──────────────────────────────────────────── */
.edit-hours-list { display: flex; flex-direction: column; gap: 8px; }
.edit-hours-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 6px 0; }
.edit-hours-day { width: 90px; font-size: 12px; font-weight: 600; }
.edit-hours-pills { display: inline-flex; gap: 0; border-radius: 6px; overflow: hidden; }
.edit-hours-pill { padding: 4px 10px; font-size: 11px; font-weight: 600; border: none; cursor: pointer; background: transparent; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.staff-val.night-mode .edit-hours-pill { border-color: rgba(255,255,255,0.12); color: #94a3b8; }
.staff-val.day-mode  .edit-hours-pill { border-color: rgba(0,0,0,0.10); color: #5c3f2e }
.edit-hours-pill.edit-hours-pill--active { background: rgba(34,197,94,0.14); color: #16a34a }
.edit-hours-pill.edit-hours-pill--close.edit-hours-pill--active { background: rgba(239,68,68,0.14); color: #dc2626 }
.staff-val.night-mode .edit-hours-pill.edit-hours-pill--active { color: #4ade80; }
.staff-val.night-mode .edit-hours-pill.edit-hours-pill--close.edit-hours-pill--active { color: #fb7185; }
.edit-hours-time { padding: 5px 8px; border-radius: 6px; font-size: 12px; font-family: 'DM Mono', monospace; border: none; }
.staff-val.night-mode .edit-hours-time { background: rgba(255,255,255,0.04); color: #e2e8f0 }
.staff-val.day-mode  .edit-hours-time { background: #fff;                  color: #3c2a1e }
.edit-hours-sep { opacity: 0.5; }
.edit-hours-closed-text { font-size: 11.5px; opacity: 0.6; font-style: italic; }
.edit-help-sub { font-size: 11.5px; opacity: 0.65; margin-top: 4px; }
/* ── Edit modal: verification read-only fields (AI score, Last Verified) ── */
.edit-readonly-value { padding: 9px 12px; border-radius: 8px; font-size: 13px; min-height: 38px; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.staff-val.night-mode .edit-readonly-value { background: rgba(255,255,255,0.03) }
.staff-val.day-mode  .edit-readonly-value { background: rgba(0,0,0,0.02) }
.edit-readonly-empty { opacity: 0.5; font-style: italic; font-size: 12px; }
.edit-verified-by { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.edit-verified-name { font-weight: 600; font-size: 12.5px; }
.edit-verified-at { font-size: 11px; opacity: 0.7; font-family: 'DM Mono', monospace; }
.edit-section-title--sub { font-size: 11px; opacity: 0.7; margin-bottom: 4px; }
/* ── Edit modal: analytics grid + weekly trend ──────────────────────────── */
.edit-analytics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
.edit-trend { margin-top: 14px; }
.edit-trend-label { font-size: 11px; opacity: 0.7; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
.edit-trend-bars { display: flex; gap: 3px; align-items: flex-end; height: 60px; }
.edit-trend-bar { flex: 1; min-height: 2px; border-radius: 2px 2px 0 0; transition: opacity 0.15s; }
.staff-val.night-mode .edit-trend-bar { background: linear-gradient(to top, rgba(139,92,246,0.6), rgba(139,92,246,0.3)); }
.staff-val.day-mode  .edit-trend-bar { background: linear-gradient(to top, rgba(212,175,55,0.7), rgba(212,175,55,0.35)); }
.edit-trend-bar:hover { opacity: 0.8; }
/* ── Edit modal: highlights (5 numbered single-line inputs) ─────────────── */
/* ── Edit modal: currency chips (compact, wraps to multiple rows) ──────── */
.edit-currency-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.edit-currency-chip { padding: 6px 12px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.03em; font-family: 'DM Mono', monospace; border: 1px solid; cursor: pointer; background: transparent; border-radius: 7px; transition: all 0.15s; }
.staff-val.night-mode .edit-currency-chip { color: #94a3b8; border-color: rgba(139,92,246,0.22); }
.staff-val.day-mode  .edit-currency-chip { color: #5c3f2e; border-color: rgba(0,0,0,0.12); }
.staff-val.night-mode .edit-currency-chip:hover:not(:disabled) { background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.45); }
.staff-val.day-mode  .edit-currency-chip:hover:not(:disabled) { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.45); }
.edit-currency-chip--active { background: rgba(139,92,246,0.16); color: #c084fc; border-color: rgba(139,92,246,0.55); }
.staff-val.day-mode  .edit-currency-chip--active { background: rgba(212,175,55,0.18); color: #8B6914; border-color: rgba(212,175,55,0.55); }
.edit-currency-chip:disabled { cursor: not-allowed; opacity: 0.4; }
.edit-currency-chips--disabled { opacity: 0.55; }
/* ── Edit modal: Free pricing button ───────────────────────────────────── */
.edit-free-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; border: 1px solid; border-radius: 8px; cursor: pointer; background: transparent; transition: all 0.15s; }
.staff-val.night-mode .edit-free-btn { color: #94a3b8; border-color: rgba(139,92,246,0.25); }
.staff-val.day-mode  .edit-free-btn { color: #5c3f2e; border-color: rgba(0,0,0,0.14); }
.staff-val.night-mode .edit-free-btn:hover:not(.edit-free-btn--active) { background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.45); }
.staff-val.day-mode  .edit-free-btn:hover:not(.edit-free-btn--active) { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.45); }
.edit-free-btn--active { background: rgba(34,197,94,0.14); color: #16a34a; border-color: rgba(34,197,94,0.5); }
.staff-val.night-mode .edit-free-btn--active { background: rgba(34,197,94,0.16); color: #4ade80; border-color: rgba(34,197,94,0.5); }
.staff-val.day-mode  .edit-free-btn--active { background: rgba(34,197,94,0.12); color: #15803d; border-color: rgba(34,197,94,0.5); }
.edit-free-btn--active:hover { box-shadow: 0 0 0 3px rgba(34,197,94,0.12); }
/* ── Edit modal: currency button group (replaces select dropdown) ──────── */
.edit-currency-group { display: inline-flex; gap: 0; border-radius: 8px; overflow: hidden; border: 1px solid; }
.staff-val.night-mode .edit-currency-group { border-color: rgba(139,92,246,0.22); }
.staff-val.day-mode  .edit-currency-group { border-color: rgba(0,0,0,0.10); }
.edit-currency-btn { padding: 7px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.03em; font-family: 'DM Mono', monospace; border: none; cursor: pointer; background: transparent; transition: background 0.15s, color 0.15s; }
/* Vertical separators between adjacent buttons (like a segmented control) */
.edit-currency-btn + .edit-currency-btn { border-left: 1px solid; }
.staff-val.night-mode .edit-currency-btn + .edit-currency-btn { border-left-color: rgba(139,92,246,0.18); }
.staff-val.day-mode  .edit-currency-btn + .edit-currency-btn { border-left-color: rgba(0,0,0,0.08); }
.staff-val.night-mode .edit-currency-btn { color: #94a3b8; }
.staff-val.day-mode  .edit-currency-btn { color: #5c3f2e; }
.edit-currency-btn:hover:not(:disabled) { opacity: 0.85; }
.staff-val.night-mode .edit-currency-btn:hover:not(:disabled) { background: rgba(255,255,255,0.04); }
.staff-val.day-mode  .edit-currency-btn:hover:not(:disabled) { background: rgba(0,0,0,0.04); }
.edit-currency-btn--active { background: rgba(139,92,246,0.16); color: #c084fc; }
.staff-val.day-mode  .edit-currency-btn--active { background: rgba(212,175,55,0.16); color: #8B6914; }
.edit-currency-btn:disabled { cursor: not-allowed; opacity: 0.4; }
.edit-currency-group--disabled { opacity: 0.55; }
.action-group { display: flex; align-items: center; justify-content: center; gap: 4px; }
.action-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 7px; border: none; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
.btn-cooldown { background: rgba(99,102,241,0.1); color: #6366f1; }
.btn-cooldown:hover { background: rgba(99,102,241,0.2); }
.btn-warning { background: rgba(234,179,8,0.12); color: #ca8a04; }
.btn-warning:hover { background: rgba(234,179,8,0.22); }
.btn-delete { background: rgba(239,68,68,0.08); color: #dc2626; }
.btn-delete:hover { background: rgba(239,68,68,0.18); }
.btn-danger-outline { padding: 8px 12px; border-radius: 9px; border: 1px solid currentColor; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
/* ── PAGINATION ── */
.pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0; font-size: 13px; }
.pagination button { border-radius: 8px; padding: 7px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; transition: all 0.15s; display: flex; align-items: center; gap: 5px; border: none}
.pagination button:disabled { opacity: 0.25; cursor: not-allowed; }
/* ── TOAST ── */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 11px 18px; border-radius: 11px; font-size: 13px; font-weight: 500; z-index: 9999; box-shadow: 0 0 30px rgba(0,0,0,0.18); display: flex; align-items: center; gap: 8px; }
.empty-state { padding: 40px 20px; text-align: center; font-size: 14px; font-family: 'DM Mono', monospace; }
.staff-val.night-mode .loader-ring { border-color: rgba(139,92,246,0.15); border-top-color: #8b5cf6; }
.staff-val.night-mode .kpi-card { background: #1e1438; box-shadow: 0 0 8px rgba(139,92,246,0.2); }
.staff-val.night-mode .kpi-accent { background: #6d28d9; border-color: transparent; box-shadow: 0 0 8px rgba(168,85,247,0.4); }
.staff-val.night-mode .kpi-accent .kpi-label, .staff-val.night-mode .kpi-accent .kpi-value, .staff-val.night-mode .kpi-accent .kpi-sub { color: white; }
.staff-val.night-mode .kpi-accent .kpi-icon svg { stroke: white; }
.staff-val.night-mode .kpi-highlight { background: #1e1438; border-color: rgba(212,175,55,0.2); }
.staff-val.night-mode .kpi-highlight .kpi-icon svg { stroke: #bfa76a; }
.staff-val.night-mode .kpi-danger { background: #1e1438; border-color: rgba(244,63,94,0.25); }
.staff-val.night-mode .kpi-danger .kpi-value { color: #fb7185; }
.staff-val.night-mode .kpi-label { color: #c084fc; }
.staff-val.night-mode .kpi-value { color: #e2e8f0; }
.staff-val.night-mode .kpi-sub { color: #94a3b8; }
.staff-val.night-mode .kpi-icon svg { stroke: #c084fc; }
.staff-val.night-mode .kpi-progress-fill { background: #8b5cf6; }
.staff-val.night-mode .card { background: #1e1438; box-shadow: 0 0 8px rgba(139,92,246,0.2); }
.staff-val.night-mode .card-head { border-bottom: 1px dashed rgba(139,92,246,0.2); }
.staff-val.night-mode .card-head h2 { color: #e2e8f0; }
.staff-val.night-mode .card-sub { color: #94a3b8; }
.staff-val.night-mode .search-input { background: #241845; color: #e2e8f0; }
.staff-val.night-mode .search-input::placeholder { color: rgba(226,232,240,0.5); }
.staff-val.night-mode .search-input:focus { box-shadow: 0 0 4px rgba(168,85,247,0.3); border-color: rgba(168,85,247,0.5); }
.staff-val.night-mode .search-icon { color: #c084fc; }
.staff-val.night-mode .seg-group { background: #241845 }
.staff-val.night-mode .seg-btn { color: rgba(226,232,240,0.45); }
.staff-val.night-mode .seg-btn:hover:not(.seg-btn--active) { background: rgba(139,92,246,0.12); color: rgba(226,232,240,0.85); }
.staff-val.night-mode .data-table thead tr { border-bottom: 1px solid rgba(139,92,246,0.15); }
.staff-val.night-mode .data-table th { color: #c084fc; }
.staff-val.night-mode .table-row { border-bottom: 1px solid rgba(139,92,246,0.07); }
.staff-val.night-mode .table-row:hover { background: rgba(139,92,246,0.08); }
.staff-val.night-mode .user-name { color: #e2e8f0; }
.staff-val.night-mode .num-cell { color: #e2e8f0; }
.staff-val.night-mode .dim-cell { color: #94a3b8; }
.staff-val.night-mode .loading-cell, .staff-val.night-mode .empty-cell, .staff-val.night-mode .empty-state { color: #94a3b8; }
.staff-val.night-mode .btn-accent { background: #6d28d9; color: white; border: none; box-shadow: 0 0 4px rgba(168,85,247,0.4); }
.staff-val.night-mode .btn-accent:hover { background: #7c3aed; box-shadow: 0 0 10px rgba(168,85,247,0.4); }
.staff-val.night-mode .btn-muted { background: rgba(192,132,252,0.1); color: #c084fc }
.staff-val.night-mode .btn-muted:hover { background: rgba(192,132,252,0.2); box-shadow: 0 0 4px rgba(192,132,252,0.3); }
.staff-val.night-mode .btn-danger-outline { color: #fb7185; }
.staff-val.night-mode .btn-danger-outline:hover { background: rgba(244,63,94,0.1); }
.staff-val.night-mode .pagination button { background: rgba(192,132,252,0.1); color: #c084fc; }
.staff-val.night-mode .pagination button:not(:disabled):hover { background: rgba(192,132,252,0.2); box-shadow: 0 0 4px rgba(192,132,252,0.3); }
.staff-val.night-mode .pagination span { color: #94a3b8; }
.staff-val.night-mode .toast--success { background: #1e1438; color: #4ade80; box-shadow: 0 0 8px rgba(139,92,246,0.15); }
.staff-val.night-mode .toast--error { background: #1e1438; color: #fb7185; box-shadow: 0 0 8px rgba(139,92,246,0.15); }
.staff-val.night-mode .btn-danger { color: #f43f5e; }
.staff-val.night-mode .btn-danger:hover { background: rgba(244,63,94,0.1); }
.staff-val.day-mode .loader-ring { border-color: rgba(212,175,55,0.2); border-top-color: #D4AF37; }
.staff-val.day-mode .kpi-card { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px rgba(139,69,19,0.05); }
.staff-val.day-mode .kpi-accent { background: linear-gradient(135deg, #D4AF37, #B8860B); border-color: transparent; box-shadow: 0 0 20px rgba(212,175,55,0.4); }
.staff-val.day-mode .kpi-accent .kpi-label, .staff-val.day-mode .kpi-accent .kpi-value, .staff-val.day-mode .kpi-accent .kpi-sub { color: white; }
.staff-val.day-mode .kpi-highlight { background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(160,82,45,0.05)); border-color: rgba(212,175,55,0.25); }
.staff-val.day-mode .kpi-danger { border-color: rgba(229,62,62,0.3); }
.staff-val.day-mode .kpi-danger .kpi-value { color: #c53030; }
.staff-val.day-mode .kpi-label { color: #A0522D; font-weight: 600; }
.staff-val.day-mode .kpi-value { color: #2c1e10; }
.staff-val.day-mode .kpi-sub { color: #7a5c3e; }
.staff-val.day-mode .card { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px rgba(139,69,19,0.04); }
.staff-val.day-mode .card-head { border-bottom: 1px solid rgba(212,175,55,0.12); }
.staff-val.day-mode .card-head h2 { color: #2c1e10; }
.staff-val.day-mode .card-sub { color: #A0522D; }
.staff-val.day-mode .search-input { background: #fdfaf4; color: #2c1e10; }
.staff-val.day-mode .search-input:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,0.12); }
.staff-val.day-mode .search-input::placeholder { color: rgba(92,63,46,0.4); }
.staff-val.day-mode .search-icon { color: #A0522D }
.staff-val.day-mode .seg-group { background: rgba(255,255,255,0.75) }
.staff-val.day-mode .seg-btn { color: rgba(92,63,46,0.5); }
.staff-val.day-mode .seg-btn:hover:not(.seg-btn--active) { background: rgba(212,175,55,0.1); color: #3c2a1e; }
.staff-val.day-mode .data-table thead tr { border-bottom: 1px solid rgba(212,175,55,0.18); }
.staff-val.day-mode .data-table th { color: #A0522D; }
.staff-val.day-mode .table-row { border-bottom: 1px solid rgba(212,175,55,0.07); }
.staff-val.day-mode .table-row:hover { background: rgba(212,175,55,0.05); }
.staff-val.day-mode .user-name { color: #2c1e10; }
.staff-val.day-mode .num-cell { color: #2c1e10; }
.staff-val.day-mode .dim-cell { color: #7a5c3e; }
.staff-val.day-mode .loading-cell, .staff-val.day-mode .empty-cell, .staff-val.day-mode .empty-state { color: #A0522D; }
.staff-val.day-mode .btn-accent { background: linear-gradient(135deg, #D4AF37, #C09040); color: white; border: none; }
.staff-val.day-mode .btn-accent:hover { box-shadow: 0 0 14px rgba(212,175,55,0.45); }
.staff-val.day-mode .btn-muted { background: rgba(255,255,255,0.9); color: #5c3f2e }
.staff-val.day-mode .btn-muted:hover { background: rgba(212,175,55,0.07); color: #2c1e10; }
.staff-val.day-mode .btn-danger-outline { color: #c53030; }
.staff-val.day-mode .btn-cooldown { background: rgba(99,102,241,0.08); color: #4f46e5; }
.staff-val.day-mode .btn-cooldown:hover { background: rgba(99,102,241,0.16); }
.staff-val.day-mode .btn-warning { background: rgba(234,179,8,0.1); color: #b45309; }
.staff-val.day-mode .btn-warning:hover { background: rgba(234,179,8,0.2); }
.staff-val.day-mode .btn-delete { background: rgba(239,68,68,0.07); color: #b91c1c; }

/* ── Explore moderation tab ─────────────────────────────────────────
   Theme-agnostic: built on the page's CSS variables so night/day both work. */
.exp-place-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.exp-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex: none; background: var(--bg-elev-2); }
.exp-thumb--empty { display: grid; place-items: center; color: var(--text-faint); }
.exp-cats { display: block; font-size: 11px; color: var(--text-faint); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
.exp-rating-low { color: var(--bad); font-weight: 600; }
.exp-fb { font-size: 12px; white-space: nowrap; }
.exp-status { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.exp-status--visible  { background: var(--bg-elev-2); color: var(--text-mute); }
.exp-status--hidden   { background: rgba(239,68,68,0.12); color: var(--bad); }
.exp-status--verified { background: rgba(52,211,153,0.14); color: var(--good); }
.exp-btn-verify { background: rgba(52,211,153,0.12); color: var(--good); }
.exp-btn-hide   { background: rgba(239,68,68,0.10); color: var(--bad); }
.chip-count { opacity: 0.65; font-variant-numeric: tabular-nums; margin-left: 4px; }
.exp-row { cursor: pointer; }

/* Place detail modal */
.exp-modal { position: relative; width: min(680px, 94vw); max-height: 88vh; overflow-y: auto; border-radius: 16px;
  background: var(--bg-elev); border: 1px solid var(--line-soft); box-shadow: 0 18px 60px rgba(0,0,0,0.35); }
.exp-modal-close { position: absolute; top: 10px; right: 10px; z-index: 2; width: 30px; height: 30px; border-radius: 9px; border: none; cursor: pointer;
  display: grid; place-items: center; background: rgba(0,0,0,0.35); color: #fff; transition: background 0.15s; }
.exp-modal-close:hover { background: rgba(0,0,0,0.55); }
.exp-modal-imgs { display: flex; gap: 6px; overflow-x: auto; background: var(--bg-elev-3); min-height: 120px; }
.exp-modal-img { height: 220px; min-width: 160px; flex: 1 1 auto; object-fit: cover; }
.exp-modal-imgs--empty { align-items: center; justify-content: center; gap: 10px; color: var(--text-faint); font-size: 13px; height: 120px; }
.exp-modal-body { padding: 16px 20px 18px; }
.exp-modal-title { margin: 0 0 4px; font-size: 18px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.exp-modal-cats { font-size: 12px; color: var(--text-faint); margin-bottom: 12px; }
.exp-modal-info { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 0 0 12px; font-size: 13px; }
.exp-modal-info dt { color: var(--text-mute); font-weight: 600; white-space: nowrap; }
.exp-modal-info dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.exp-modal-info a { color: var(--accent); }
.exp-modal-types { color: var(--text-mute); font-size: 12px; }
.exp-modal-hours { margin-bottom: 14px; font-size: 12.5px; }
.exp-modal-hours-title { font-weight: 700; color: var(--text-mute); margin-bottom: 4px; }
.exp-modal-hours-line { color: var(--text-mute); line-height: 1.5; }
.exp-modal-actions { display: flex; gap: 8px; align-items: center; border-top: 1px solid var(--line-soft); padding-top: 14px; }
.exp-modal-actions .action-btn { text-decoration: none; }
.staff-val.day-mode .btn-delete:hover { background: rgba(239,68,68,0.15); }
.staff-val.day-mode .btn-danger-outline:hover { background: rgba(229,62,62,0.07); }
.staff-val.day-mode .pagination button { background: rgba(255,255,255,0.9); color: #5c3f2e }
.staff-val.day-mode .pagination button:not(:disabled):hover { border-color: #D4AF37; color: #A0522D; background: rgba(212,175,55,0.06); }
.staff-val.day-mode .pagination span { color: #5c3f2e; }
.staff-val.day-mode .toast--success { background: rgba(255,255,255,0.97); color: #166534; box-shadow: 0 0 30px rgba(0,0,0,0.1); }
.staff-val.day-mode .toast--error { background: rgba(255,255,255,0.97); color: #c53030; box-shadow: 0 0 30px rgba(0,0,0,0.1); }
.staff-val.day-mode .btn-danger { color: #e53e3e; }
.staff-val.day-mode .btn-danger:hover { background: rgba(229,62,62,0.07); }
.price-card .card-head { display: flex; align-items: center; gap: 8px; padding: 14px 18px 12px; }
.price-card .card-head h2 { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
/* ── HIDDEN GEM ROW ── */
.row-hidden-gem { position: relative; }
.staff-val.night-mode .row-hidden-gem { background: linear-gradient(90deg, rgba(212,175,55,0.07) 0%, transparent 60%) !important; border-left: 2px solid rgba(212,175,55,0.5); }
.staff-val.day-mode  .row-hidden-gem { background: linear-gradient(90deg, rgba(212,175,55,0.09) 0%, transparent 60%) !important; border-left: 2px solid rgba(212,175,55,0.55); }
.gem-badge { display: inline-flex; align-items: center; gap: 3px; margin-left: 7px; padding: 1px 6px; border-radius: 10px; font-size: 9px; font-family: 'DM Mono', monospace; font-weight: 600; letter-spacing: 0.04em; white-space: nowrap; vertical-align: middle; }
.staff-val.night-mode .gem-badge { background: rgba(212,175,55,0.14); color: #D4AF37 }
.staff-val.day-mode  .gem-badge { background: rgba(212,175,55,0.15); color: #8B6914 }
/* ── EDIT BUTTON ── */
.btn-edit { display: inline-flex; align-items: center; gap: 4px; }
.staff-val.night-mode .btn-edit { background: rgba(99,179,237,0.1); color: #63b3ed }
.staff-val.night-mode .btn-edit:hover { background: rgba(99,179,237,0.2); box-shadow: 0 0 6px rgba(99,179,237,0.2); }
.staff-val.day-mode .btn-edit { background: rgba(49,130,206,0.08); color: #2b6cb0 }
.staff-val.day-mode .btn-edit:hover { background: rgba(49,130,206,0.15); }
/* ── MODAL OVERLAY ── */
.edit-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.72); display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .edit-panel { transition: transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s ease; }
.modal-fade-leave-active .edit-panel { transition: transform 0.22s cubic-bezier(.4,0,.2,1), opacity 0.22s ease; }
.modal-fade-enter-from .edit-panel, .modal-fade-leave-to .edit-panel { transform: translateY(16px) scale(0.97); opacity: 0; }
/* ── PANEL SHELL ── */
.edit-panel { width: min(880px, 100%); max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,0.45); }
.edit-panel.night-mode { background: linear-gradient(180deg, #0e0a1e 0%, #130f2a 100%); }
.edit-panel.day-mode { background: linear-gradient(180deg, #fdfaf4 0%, #faf6ec 100%); }
@media (max-width: 640px) {
  .edit-overlay { padding: 10px; }
  .edit-panel { border-radius: 12px; max-height: 95vh; }
}
/* ── HEADER ── */
.edit-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 28px 18px; flex-shrink: 0; }
.edit-panel.night-mode .edit-header { background: rgba(139,92,246,0.03); }
.edit-panel.day-mode   .edit-header { background: rgba(212,175,55,0.03); }
.edit-header-left { display: flex; flex-direction: column; gap: 5px; }
.edit-badge { display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 9px; border-radius: 5px; align-self: flex-start; font-family: 'DM Mono', monospace; }
.edit-panel.night-mode .edit-badge { background: rgba(139,92,246,0.18); color: #c084fc }
.edit-panel.day-mode   .edit-badge { background: rgba(212,175,55,0.15); color: #8B6914 }
.edit-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; line-height: 1.2; }
.edit-panel.night-mode .edit-title { color: #e2e8f0; }
.edit-panel.day-mode   .edit-title { color: #2c1e10; }
.edit-header-actions { display: flex; align-items: center; gap: 10px; }
.edit-save-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 9px; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
.edit-panel.night-mode .edit-save-btn { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff}
.edit-panel.night-mode .edit-save-btn:hover:not(:disabled) { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 0 10px rgba(139,92,246,0.5); }
.edit-panel.day-mode   .edit-save-btn { background: linear-gradient(135deg, #D4AF37, #C09040); color: #fff }
.edit-panel.day-mode   .edit-save-btn:hover:not(:disabled) { box-shadow: 0 0 10px rgba(212,175,55,0.5); }
.edit-save-btn:disabled { opacity: 0.45; cursor: default; }
.edit-close-btn { width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.edit-panel.night-mode .edit-close-btn { background: rgba(255,255,255,0.05); color: #94a3b8; }
.edit-panel.night-mode .edit-close-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; box-shadow: 0 0 6px rgba(139,92,246,0.15); }
.edit-panel.day-mode   .edit-close-btn { background: rgba(0,0,0,0.05); color: #7a5c3e; }
.edit-panel.day-mode   .edit-close-btn:hover { background: rgba(0,0,0,0.1); color: #2c1e10; }
/* ── BODY ── */
.edit-body { flex: 1; overflow-y: auto; padding: 26px 28px 48px; display: flex; flex-direction: column; gap: 26px; }
.edit-body::-webkit-scrollbar { width: 5px; }
.edit-panel.night-mode .edit-body::-webkit-scrollbar-track { background: transparent; }
.edit-panel.night-mode .edit-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.28); border-radius: 3px; }
.edit-panel.day-mode   .edit-body::-webkit-scrollbar-thumb { background: rgba(160,82,45,0.18); border-radius: 3px; }
/* ── SECTION ── */
.edit-section { display: flex; flex-direction: column; gap: 14px; }
.edit-section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding-bottom: 9px; font-family: 'DM Mono', monospace; }
.edit-panel.night-mode .edit-section-title { color: #c084fc }
.edit-panel.day-mode   .edit-section-title { color: #A0522D }
/* ── GRID / FIELDS ── */
.edit-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.edit-field { display: flex; flex-direction: column; gap: 5px; }
.edit-field--full { grid-column: 1 / -1; }
.edit-label { font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; letter-spacing: 0.04em; }
.edit-panel.night-mode .edit-label { color: #94a3b8; }
.edit-panel.day-mode   .edit-label { color: #A0522D; }
.edit-label--toggle { display: flex; align-items: center; justify-content: space-between; }
/* ── INPUTS ── */
.edit-input, .edit-textarea { padding: 9px 12px; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; border: none; outline: none; transition: border-color 0.15s, background 0.15s, box-shadow 0.15s; width: 100%; }
.edit-textarea { resize: vertical }
/* Input with a trailing icon button (currently used by Email + showEmail toggle).
   The wrap is positioned so the absolute-positioned button sits inside the input's
   right edge; the input gets extra right padding so text never goes under the icon. */
.edit-input-wrap { position: relative; display: block; }
.edit-input.edit-input--with-trailing { padding-right: 38px; }
.edit-input-icon-btn { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: transparent; border-radius: 6px; cursor: pointer; opacity: 0.45; transition: opacity 0.15s, background 0.15s, color 0.15s; }
.edit-input-icon-btn:hover { opacity: 0.85; }
.staff-val.night-mode .edit-input-icon-btn:hover { background: rgba(255,255,255,0.05); }
.staff-val.day-mode  .edit-input-icon-btn:hover { background: rgba(0,0,0,0.04); }
/* "On" state = email is publicly visible. Highlights the icon so the admin can
   tell at a glance which fields are exposed without hovering each one. */
.edit-input-icon-btn.edit-input-icon-btn--on { opacity: 1; color: #16a34a; }
.staff-val.night-mode .edit-input-icon-btn.edit-input-icon-btn--on { color: #4ade80; }
/* Description textarea: fixed comfortable height, no manual resize handle.
   The corner grabber felt awkward — taller default works better for the
   amount of text owners write at onboarding (typically ~200–600 chars). */
.edit-textarea.edit-textarea--description { resize: none }
select.edit-input { cursor: pointer; }
.edit-input::placeholder, .edit-textarea::placeholder { opacity: 0.38; }
.edit-panel.night-mode .edit-input,
.edit-panel.night-mode .edit-textarea { background: #241845; color: #e2e8f0; }
.edit-panel.night-mode .edit-input:focus,
.edit-panel.night-mode .edit-textarea:focus {background: #2a1c52}
.edit-panel.night-mode select.edit-input option { background: #1e1438; }
.edit-panel.day-mode .edit-input,
.edit-panel.day-mode .edit-textarea {background: rgba(212,175,55,0.06); color: #2c1e10}
.edit-panel.day-mode .edit-input:focus,
.edit-panel.day-mode .edit-textarea:focus {background: #fff}
/* Hide native number input spinners (up/down arrows) inside edit panel */
.edit-panel input[type="number"].edit-input::-webkit-outer-spin-button,
.edit-panel input[type="number"].edit-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.edit-panel input[type="number"].edit-input { -moz-appearance: textfield; appearance: textfield; }
/* ── TYPE CHIP SELECTOR ── */
.edit-type-grid { display: flex; flex-wrap: wrap; gap: 7px; }
.edit-type-chip { padding: 5px 13px; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; user-select: none; font-family: 'DM Mono', monospace; }
.edit-panel.night-mode .edit-type-chip {color: #94a3b8; background: rgba(139,92,246,0.04)}
.edit-panel.night-mode .edit-type-chip:hover { color: #c4b5fd; background: rgba(139,92,246,0.1) }
.edit-panel.night-mode .edit-type-chip.active { background: rgba(139,92,246,0.2); color: #a78bfa }
.edit-panel.day-mode .edit-type-chip {color: #7a5c3e; background: rgba(212,175,55,0.04)}
.edit-panel.day-mode .edit-type-chip:hover { color: #A0522D; background: rgba(212,175,55,0.1) }
.edit-panel.day-mode .edit-type-chip.active { background: rgba(212,175,55,0.15); color: #8B6914 }
/* ── TOGGLE SWITCH ── */
.edit-toggle { width: 40px; height: 22px; border-radius: 11px; cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.2s; }
.edit-panel.night-mode .edit-toggle { background: rgba(255,255,255,0.1) }
.edit-panel.night-mode .edit-toggle.on { background: #7c3aed; box-shadow: 0 0 8px rgba(139,92,246,0.35); }
.edit-panel.day-mode   .edit-toggle { background: rgba(0,0,0,0.1) }
.edit-panel.day-mode   .edit-toggle.on { background: linear-gradient(135deg,#D4AF37,#C09040); box-shadow: 0 0 8px rgba(212,175,55,0.3); }
.edit-toggle-knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.edit-toggle.on .edit-toggle-knob { transform: translateX(18px); }
/* ── IMAGE MANAGER ── */
.edit-img-list { display: flex; flex-direction: column; gap: 10px; }
.edit-img-row { display: flex; align-items: center; gap: 8px; }
.edit-img-input { flex: 1; }
.edit-img-thumb-wrap { width: 38px; height: 38px; border-radius: 6px; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.edit-panel.night-mode .edit-img-thumb-wrap { background: rgba(139,92,246,0.1) }
.edit-panel.day-mode   .edit-img-thumb-wrap { background: rgba(212,175,55,0.08) }
.edit-img-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
.edit-img-thumb-empty svg { opacity: 0.35; }
.edit-panel.night-mode .edit-img-thumb-empty svg { stroke: #8b5cf6; }
.edit-panel.day-mode   .edit-img-thumb-empty svg { stroke: #D4AF37; }
.edit-img-del { width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
.edit-panel.night-mode .edit-img-del { background: rgba(244,63,94,0.1); color: #fb7185; }
.edit-panel.night-mode .edit-img-del:hover { background: rgba(244,63,94,0.22); }
.edit-panel.day-mode   .edit-img-del { background: rgba(229,62,62,0.08); color: #c53030; }
.edit-panel.day-mode   .edit-img-del:hover { background: rgba(229,62,62,0.16); }
/* ── ADD URL BUTTON ── */
.edit-add-img-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: 1px dashed; align-self: flex-start; transition: all 0.15s; }
.edit-panel.night-mode .edit-add-img-btn {color: #a78bfa; background: transparent; }
.edit-panel.night-mode .edit-add-img-btn:hover { background: rgba(139,92,246,0.1)}
.edit-panel.day-mode   .edit-add-img-btn {color: #8B6914; background: transparent; }
.edit-panel.day-mode   .edit-add-img-btn:hover { background: rgba(212,175,55,0.1)}
/* ── PHONE FIELD WITH "+" PREFIX ──
   Mirrors the input-with-prefix pattern from BusinessOnboarding.vue. The
   wrapper holds the prefix label and the input side-by-side, sharing a
   single border. We disable the input's own border / radius so the seam
   between the "+" and the digits disappears. */
.edit-phone-wrap {
  display: flex; align-items: stretch;
  border-radius: 8px;
  overflow: hidden;
}
.edit-panel.night-mode .edit-phone-wrap { background: #241845; }
.edit-panel.day-mode   .edit-phone-wrap { background: rgba(212,175,55,0.06); }
.edit-phone-prefix {
  display: flex; align-items: center; justify-content: center;
  padding: 0 12px;
  font-size: 14px; font-weight: 500; line-height: 1;
  flex-shrink: 0;
  user-select: none;
}
.edit-panel.night-mode .edit-phone-prefix { color: #94a3b8; border-right: 1px solid rgba(139,92,246,0.18); }
.edit-panel.day-mode   .edit-phone-prefix { color: #8B6914; border-right: 1px solid rgba(212,175,55,0.25); }
.edit-phone-input.edit-input {
  border-radius: 0 !important;
  flex: 1; min-width: 0;
  background: transparent !important;
}

/* ── Supplements specific to the staff destination form ───────────── */
.edit-help-row { display: flex; align-items: center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
.edit-help-link { font-size: 11.5px; text-decoration: none; opacity: 0.7; transition: opacity 0.15s; }
.edit-help-link:hover { opacity: 1; text-decoration: underline; }
.staff-val.night-mode .edit-help-link { color: #c4b5fd; }
.staff-val.day-mode  .edit-help-link { color: #8B6914; }

.edit-warn { display: flex; align-items: center; gap: 8px; padding: 9px 13px; margin-top: 12px; border-radius: 8px; font-size: 12.5px; line-height: 1.45; }
.staff-val.night-mode .edit-warn,
.edit-panel.night-mode .edit-warn { background: rgba(245,158,11,0.12); color: #fbbf24; }
.staff-val.day-mode  .edit-warn,
.edit-panel.day-mode  .edit-warn { background: rgba(245,158,11,0.10); color: #b45309; }

.edit-error-banner { padding: 10px 14px; border-radius: 8px; font-size: 12.5px; margin-top: 8px; }
.edit-panel.night-mode .edit-error-banner { background: rgba(239,68,68,0.12); color: #fca5a5; }
.edit-panel.day-mode  .edit-error-banner { background: rgba(239,68,68,0.10); color: #b91c1c; }

/* Reuse admin Syne font for tab labels so the chrome reads as one product */
.staff-val .tab-strip { font-family: 'DM Sans', sans-serif; }

/* ── Read-only mode (View) ─────────────────────────────────────────────
   When .edit-body has .is-readonly we disable everything that mutates the
   destination — inputs, textareas, the form-side buttons (Free / 24-7 /
   currency chips / type chips / hours pills / image delete) and the map's
   "Re-locate" button. Things that DON'T write — gallery hero / prev / next
   / lightbox close / modal close — stay clickable.
   Visually: 0.85 opacity on inputs so they look slightly muted, but still
   readable. We use pointer-events + cursor:default to block clicks and
   `disabled` on form fields where the browser supports it. */
.edit-body.is-readonly .edit-input,
.edit-body.is-readonly .edit-textarea,
.edit-body.is-readonly select.edit-input,
.edit-body.is-readonly .edit-hours-time,
.edit-body.is-readonly .edit-phone-input,
.edit-body.is-readonly .edit-img-input { pointer-events: none; opacity: 0.85; }
.edit-body.is-readonly input[type="checkbox"],
.edit-body.is-readonly input[type="radio"] { pointer-events: none; opacity: 0.6; }
/* Form-side buttons that mutate state — disable cleanly */
.edit-body.is-readonly .edit-type-chip,
.edit-body.is-readonly .edit-currency-chip,
.edit-body.is-readonly .edit-free-btn,
.edit-body.is-readonly .edit-hours-pill,
.edit-body.is-readonly .edit-img-del,
.edit-body.is-readonly .edit-add-img-btn,
.edit-body.is-readonly .edit-input-icon-btn,
.edit-body.is-readonly .dest-map-actions .action-btn { pointer-events: none; opacity: 0.55; cursor: default; }
/* Map: pin must not be draggable in read-only mode — we already guard this
   in JS (allowDrag), but also block click-handlers on the map container to
   keep things from going weird if Leaflet binds late. */
.edit-body.is-readonly .dest-map { cursor: default; }

/* ── IMAGE GALLERY (large preview at top of edit modal) ──
   Mirrors AdminDashboard.vue's .edit-gallery block. Without these rules the
   hero <img> renders at the source's natural pixel size (often 1920+ px wide)
   instead of being constrained to a 16:9 box scaled to the modal width, so
   the photos appear gigantic and push the rest of the form way down. */
.edit-gallery-section { padding-bottom: 4px; }
.edit-gallery-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.edit-gallery-counter { font-size: 11px; font-family: 'DM Mono', monospace; padding: 3px 8px; border-radius: 6px; }
.edit-panel.night-mode .edit-gallery-counter { background: rgba(139,92,246,0.14); color: #c4b5fd; }
.edit-panel.day-mode   .edit-gallery-counter { background: rgba(212,175,55,0.12); color: #8B4513; }

.edit-gallery { display: flex; flex-direction: column; gap: 10px; }

/* Hero: fixed aspect ratio (16:9), responsive width, cover-fit image. This
   is the rule that actually caps the image size. */
.edit-gallery-hero { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; cursor: zoom-in; display: flex; align-items: center; justify-content: center; }
.edit-panel.night-mode .edit-gallery-hero { background: rgba(139,92,246,0.06); box-shadow: 0 8px 24px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(139,92,246,0.18); }
.edit-panel.day-mode   .edit-gallery-hero { background: rgba(212,175,55,0.05); box-shadow: 0 8px 22px rgba(60,42,30,0.12), inset 0 0 0 1px rgba(212,175,55,0.25); }
.edit-gallery-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
.edit-gallery-hero:hover .edit-gallery-hero-img { transform: scale(1.02); }
.edit-gallery-hero-img--error { opacity: 0.2; }

/* Prev / next arrows floating over the hero */
.edit-gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: all 0.18s; }
.edit-gallery-nav--prev { left: 12px; }
.edit-gallery-nav--next { right: 12px; }
.edit-panel.night-mode .edit-gallery-nav { background: rgba(15,15,30,0.55); color: #fff; }
.edit-panel.night-mode .edit-gallery-nav:hover { background: rgba(139,92,246,0.7); }
.edit-panel.day-mode   .edit-gallery-nav { background: rgba(255,255,255,0.7); color: #3c2a1e; }
.edit-panel.day-mode   .edit-gallery-nav:hover { background: rgba(212,175,55,0.85); color: #fff; }

/* "Click to expand" hint that fades in on hover */
.edit-gallery-expand-hint { position: absolute; bottom: 12px; right: 12px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 7px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); pointer-events: none; opacity: 0; transition: opacity 0.2s; }
.edit-gallery-hero:hover .edit-gallery-expand-hint { opacity: 1; }
.edit-panel.night-mode .edit-gallery-expand-hint { background: rgba(15,15,30,0.6); color: #e2e8f0; }
.edit-panel.day-mode   .edit-gallery-expand-hint { background: rgba(255,255,255,0.78); color: #3c2a1e; }

/* Horizontal thumbnail strip beneath the hero */
.edit-gallery-strip { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px; scrollbar-width: thin; }
.edit-panel.night-mode .edit-gallery-strip::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
.edit-panel.day-mode   .edit-gallery-strip::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px; }
.edit-gallery-strip::-webkit-scrollbar { height: 5px; }

.edit-gallery-thumb { flex-shrink: 0; width: 72px; height: 72px; padding: 0; border-radius: 8px; overflow: hidden; border: 2px solid transparent; cursor: pointer; background: transparent; transition: all 0.18s; opacity: 0.7; }
.edit-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.edit-gallery-thumb:hover { opacity: 1; transform: translateY(-2px); }
.edit-panel.night-mode .edit-gallery-thumb--active { border-color: #a78bfa; opacity: 1; box-shadow: 0 0 0 1px rgba(167,139,250,0.4), 0 4px 12px rgba(139,92,246,0.3); }
.edit-panel.day-mode   .edit-gallery-thumb--active { border-color: #D4AF37; opacity: 1; box-shadow: 0 0 0 1px rgba(212,175,55,0.4), 0 4px 12px rgba(160,82,45,0.2); }

/* Empty state shown when a destination has no image URLs yet */
.edit-gallery-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; border-radius: 14px; text-align: center; }
.edit-panel.night-mode .edit-gallery-empty { background: rgba(139,92,246,0.04); color: #94a3b8; }
.edit-panel.night-mode .edit-gallery-empty svg { stroke: #8b5cf6; opacity: 0.5; }
.edit-panel.day-mode   .edit-gallery-empty { background: rgba(212,175,55,0.04); color: #A0522D; }
.edit-panel.day-mode   .edit-gallery-empty svg { stroke: #D4AF37; opacity: 0.6; }
.edit-gallery-empty-title { font-size: 14px; font-weight: 600; margin-top: 4px; }
.edit-panel.night-mode .edit-gallery-empty-title { color: #cbd5e1; }
.edit-panel.day-mode   .edit-gallery-empty-title { color: #3c2a1e; }
.edit-gallery-empty-sub { font-size: 12px; max-width: 320px; line-height: 1.5; }

/* Phones: shorter hero + smaller thumbs so the modal stays usable */
@media (max-width: 640px) {
  .edit-gallery-hero { aspect-ratio: 4 / 3; border-radius: 10px; }
  .edit-gallery-nav { width: 32px; height: 32px; }
  .edit-gallery-nav--prev { left: 8px; }
  .edit-gallery-nav--next { right: 8px; }
  .edit-gallery-thumb { width: 58px; height: 58px; }
}

/* ── DESTINATION LOCATION MAP ──
   Embedded Leaflet map for the destination edit modal. Mirrors the
   AdminDashboard.vue .dest-map block 1-for-1 so both pages look identical.
   Without these rules the #staff-dest-map div collapses to height:0 and the
   map appears invisible (Leaflet renders, but into a zero-height container). */
.dest-map-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px }
.dest-map-status { font-size: 11px; font-family: 'DM Mono', monospace; padding: 3px 8px; border-radius: 999px; }
.edit-panel.night-mode .dest-map-status--idle      { background: rgba(255,255,255,0.05); color: #94a3b8 }
.edit-panel.night-mode .dest-map-status--searching { background: rgba(139,92,246,0.18); color: #c4b5fd }
.edit-panel.night-mode .dest-map-status--found     { background: rgba(74,222,128,0.15); color: #4ade80 }
.edit-panel.night-mode .dest-map-status--error     { background: rgba(239,68,68,0.18);  color: #fca5a5 }
.edit-panel.day-mode   .dest-map-status--idle      { background: rgba(0,0,0,0.04);      color: #7a5c3e }
.edit-panel.day-mode   .dest-map-status--searching { background: rgba(212,175,55,0.18); color: #8B6914 }
.edit-panel.day-mode   .dest-map-status--found     { background: rgba(34,197,94,0.16);  color: #166534 }
.edit-panel.day-mode   .dest-map-status--error     { background: rgba(239,68,68,0.14);  color: #b91c1c }

.dest-map-hint { font-size: 11.5px; line-height: 1.45; margin: 8px 0 10px; }
.edit-panel.night-mode .dest-map-hint { color: #94a3b8 }
.edit-panel.day-mode   .dest-map-hint { color: #7a5c3e }

.dest-map {
  width: 100%; height: 320px; border-radius: 10px; overflow: hidden;
  position: relative;
}
.edit-panel.night-mode .dest-map { border: 1px solid rgba(139,92,246,0.25); background: rgba(139,92,246,0.04) }
.edit-panel.day-mode   .dest-map { border: 1px solid rgba(212,175,55,0.30); background: rgba(212,175,55,0.04) }
/* Empty-state look before any geocode runs */
.dest-map:empty::before {
  content: 'Map will appear here once an address is located.';
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-family: 'DM Mono', monospace; pointer-events: none;
}
.edit-panel.night-mode .dest-map:empty::before { color: #64748b }
.edit-panel.day-mode   .dest-map:empty::before { color: #A0522D; opacity: 0.6 }

.dest-map-actions { display: flex; align-items: center; gap: 12px; margin-top: 10px; flex-wrap: wrap }
.dest-map-coords { font-size: 11px; font-family: 'DM Mono', monospace }
.edit-panel.night-mode .dest-map-coords { color: #94a3b8 }
.edit-panel.day-mode   .dest-map-coords { color: #A0522D }

/* Manual coordinate entry + apply-hours-to-all */
.dest-map-manual { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-top: 8px; }
.dest-coord-input { width: 128px; font-size: 12.5px; padding: 7px 9px; font-variant-numeric: tabular-nums; }
.edit-hours-all-btn { display: inline-flex; align-items: center; gap: 5px; margin-left: 8px; padding: 5px 10px; border: none; border-radius: 999px;
  cursor: pointer; font-family: inherit; font-size: 11.5px; font-weight: 600; color: var(--accent); background: var(--bg-elev-2); transition: background .15s; }
.edit-hours-all-btn:hover { background: var(--bg-elev-3); }

/* Pulsing halo behind the gold destination pin. Referenced inline by the
   pinIcon HTML in destRenderMap(). Without this @keyframes block the pin
   still shows but doesn't breathe. */
@keyframes dest-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.22 }
  50%      { transform: translate(-50%, -50%) scale(1.7); opacity: 0    }
}

/* Shrink the map on small screens so it doesn't dominate the modal. */
@media (max-width: 640px) {
  .dest-map { height: 240px; }
}
/* The Image section's "Add URL" row should also be inert in read-only.
   The wrapper already covers it via the rules above. */

/* ── Image lightbox ─────────────────────────────────────────────────── */
.dest-lightbox {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(0,0,0,0.88);
  display: flex; align-items: center; justify-content: center;
  padding: 4vh 4vw;
  backdrop-filter: blur(6px);
  cursor: zoom-out;
}
.dest-lightbox-img {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  cursor: default;
}
.dest-lightbox-close {
  position: absolute; top: 16px; right: 18px;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.dest-lightbox-close:hover { background: rgba(255,255,255,0.22); }
.dest-lightbox-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 50px; height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.dest-lightbox-nav:hover { background: rgba(255,255,255,0.24); }
.dest-lightbox-nav--prev { left: 18px; }
.dest-lightbox-nav--next { right: 18px; }

/* ── Event "Already ended" flag (drawer header) ──
   Sits next to the "Event schedule" h3 to give staff an at-a-glance signal
   that the event they're looking at has already passed. Same warm-grey
   palette as the BusinessDashboard's status pill so the visual language
   stays consistent across the owner and staff views. */
.event-ended-flag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 9px;
  border-radius: 20px;
  background: rgba(168,162,158,0.18);
  color: #a8a29e;
}

/* ── Event-ended hint (drawer event-schedule section) ──
   Inline explanation under the schedule grid, shown when the listing is
   still 'pending' but the event has already passed. Mirrors the server-side
   guard's message so staff knows what'll happen if they hit Approve. */
.event-ended-hint {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.84rem;
  line-height: 1.5;
  border: 1px solid;
}
.event-ended-hint strong { display: block; margin-bottom: 2px; font-weight: 600 }
.event-ended-hint em { font-style: normal; font-weight: 600 }
.night-mode .event-ended-hint { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.3); color: #fbbf24 }
.day-mode   .event-ended-hint { background: rgba(245,158,11,0.06); border-color: rgba(245,158,11,0.35); color: #92400e }

/* Confirm-modal warning row used when staff tries to approve an already-
   ended event. Sits as an inline flex line so the icon and text align with
   the rest of the modal body copy. */
.modal-warn-line {
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px;
}

</style>
<!-- Unscoped: window/page scrollbar styling.
     The page-level scrollbar in this app is the WINDOW scrollbar.
     Depending on the browser, it may render on <html>, <body>, or be
     painted through the #app wrapper. Different OSes also route it
     differently. So this block targets ALL three elements, hooked to
     the existing theme markers the StaffValidation component already
     sets on mount/toggle:
       - <html data-theme="dark|light">    (set in applyThemeHooks)
       - <body class="theme-dark|theme-light">  (set in applyThemeHooks)
       - #app.day-mode|night-mode               (set by App.vue + Vuex)
     !important is used because earlier attempts showed something else
     in the cascade was winning — probably a global stylesheet or a
     browser default. We're being defensive. -->
<style>
/* ── Dark / Night mode: faint purple scrollbar (matches JinniChat) ─── */
html[data-theme="dark"]::-webkit-scrollbar,body.theme-dark::-webkit-scrollbar,html:has(#app.night-mode)::-webkit-scrollbar,body:has(#app.night-mode)::-webkit-scrollbar{width:8px !important;height:8px !important}
html[data-theme="dark"]::-webkit-scrollbar-track,body.theme-dark::-webkit-scrollbar-track,html:has(#app.night-mode)::-webkit-scrollbar-track,body:has(#app.night-mode)::-webkit-scrollbar-track{background:transparent !important}
html[data-theme="dark"]::-webkit-scrollbar-thumb,body.theme-dark::-webkit-scrollbar-thumb,html:has(#app.night-mode)::-webkit-scrollbar-thumb,body:has(#app.night-mode)::-webkit-scrollbar-thumb{border-radius:4px !important;background:rgba(192,132,252,0.1) !important}
html[data-theme="dark"]::-webkit-scrollbar-thumb:hover,body.theme-dark::-webkit-scrollbar-thumb:hover,html:has(#app.night-mode)::-webkit-scrollbar-thumb:hover,body:has(#app.night-mode)::-webkit-scrollbar-thumb:hover{background:rgba(192,132,252,0.3) !important}
/* ── Light / Day mode: warm copper scrollbar (matches JinniChat) ───── */
html[data-theme="light"]::-webkit-scrollbar,body.theme-light::-webkit-scrollbar,html:has(#app.day-mode)::-webkit-scrollbar,body:has(#app.day-mode)::-webkit-scrollbar{width:8px !important;height:8px !important}
html[data-theme="light"]::-webkit-scrollbar-track,body.theme-light::-webkit-scrollbar-track,html:has(#app.day-mode)::-webkit-scrollbar-track,body:has(#app.day-mode)::-webkit-scrollbar-track{background:transparent !important}
html[data-theme="light"]::-webkit-scrollbar-thumb,body.theme-light::-webkit-scrollbar-thumb,html:has(#app.day-mode)::-webkit-scrollbar-thumb,body:has(#app.day-mode)::-webkit-scrollbar-thumb{border-radius:4px !important;background:rgba(160,82,45,0.3) !important}
html[data-theme="light"]::-webkit-scrollbar-thumb:hover,body.theme-light::-webkit-scrollbar-thumb:hover,html:has(#app.day-mode)::-webkit-scrollbar-thumb:hover,body:has(#app.day-mode)::-webkit-scrollbar-thumb:hover{background:rgba(160,82,45,0.5) !important}
/* ── Firefox: themed scrollbar-color ────────────────────────────────── */
html[data-theme="dark"],body.theme-dark,html:has(#app.night-mode),body:has(#app.night-mode){scrollbar-width:thin !important;scrollbar-color:rgba(192,132,252,0.3) transparent !important}
html[data-theme="light"],body.theme-light,html:has(#app.day-mode),body:has(#app.day-mode){scrollbar-width:thin !important;scrollbar-color:rgba(160,82,45,0.4) transparent !important}
</style>