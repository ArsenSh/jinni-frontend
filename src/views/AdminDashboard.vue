<template>
  <div class="admin-shell" :class="theme">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <img src="/images/bottle.png" alt="Jinni" class="brand-logo" />
        <span class="brand-text">Ars</span>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <svg v-if="tab.icon === 'overview'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <svg v-else-if="tab.icon === 'users'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-else-if="tab.icon === 'ai'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
          <svg v-else-if="tab.icon === 'businesses'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
          <svg v-else-if="tab.icon === 'places'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
          <svg v-else-if="tab.icon === 'destinations'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          <svg v-else-if="tab.icon === 'google'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.454 0-.769-.085-1.357-.187-1.857H12.24z"/></svg>
          <svg v-else-if="tab.icon === 'prices'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <svg v-else-if="tab.icon === 'staff'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <div class="sidebar-spacer"></div>

      <div class="sidebar-footer">
        <button class="theme-toggle" @click="toggleTheme">
          <svg v-if="theme === 'night-mode'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <span class="theme-label">{{ theme === 'night-mode' ? 'Day mode' : 'Night mode' }}</span>
        </button>
        <button class="logout-btn" @click="handleLogout" title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span class="theme-label">Logout</span>
        </button>
      </div>

      <!-- ── Mobile-only: looping horizontal nav strip ──────────────────────
           Renders 3 copies of all sidebar items (tabs + theme + logout) so
           the strip can be scrolled infinitely in either direction. A
           scroll listener (see setup) snaps the position back to the
           middle copy when nearing either edge — invisible to the user. -->
      <div class="sidebar-loop-strip" ref="loopStrip" @scroll="onLoopStripScroll">
        <button
          v-for="(item, idx) in mobileNavItemsTripled"
          :key="idx + '-' + item.key"
          class="nav-item"
          :class="[item.type === 'tab' && activeTab === item.id ? 'active' : '', item.extraClass || '']"
          @click="onMobileNavClick(item)"
          :title="item.label"
        >
          <span v-html="item.svg"></span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main-content">
      <header class="topbar">
        <div class="topbar-title">
          <div class="topbar-breadcrumb">Dashboard / <span>{{ currentTabLabel }}</span></div>
          <h1>{{ currentTabLabel }}</h1>
        </div>
        <div class="topbar-actions">
          <span class="topbar-date">{{ formattedDate }}</span>
          <button class="refresh-btn" :class="{ spinning: loading }" @click="fetchAll" title="Refresh all data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/>
            </svg>
          </button>
        </div>
      </header>

      <div v-if="loading && !overviewData" class="loading-screen">
        <div class="loader-ring"></div>
        <p>Loading analytics…</p>
      </div>

      <div v-else class="content-area">

        <!-- ── OVERVIEW ── -->
        <section v-if="activeTab === 'overview'" class="tab-section">
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div class="kpi-label">Total Users</div>
              <div class="kpi-value">{{ fmt(overview.users?.total) }}</div>
              <div class="kpi-sub trend-up">↑ {{ fmt(overview.users?.newThisWeek) }} this week</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
              <div class="kpi-label">Premium Users</div>
              <div class="kpi-value">{{ fmt(overview.users?.premium) }}</div>
              <div class="kpi-sub">{{ premiumPct }}% of total</div>
              <div class="kpi-progress-bar"><div class="kpi-progress-fill" :style="{ width: premiumPct + '%' }"></div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></div>
              <div class="kpi-label">AI Queries</div>
              <div class="kpi-value">{{ fmtK(overview.ai?.totalQueries) }}</div>
              <div class="kpi-sub">{{ fmtK(overview.ai?.totalTokensUsed) }} tokens</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div class="kpi-label">Active This Week</div>
              <div class="kpi-value">{{ fmt(overview.users?.activeThisWeek) }}</div>
              <div class="kpi-sub">{{ fmt(overview.chatSessions) }} sessions</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
              <div class="kpi-label">Businesses</div>
              <div class="kpi-value">{{ fmt(overview.businesses?.total) }}</div>
              <div class="kpi-sub">{{ fmt(overview.businesses?.active) }} active</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
              <div class="kpi-label">New Today</div>
              <div class="kpi-value">{{ fmt(overview.users?.newToday) }}</div>
              <div class="kpi-sub">{{ fmt(overview.users?.newThisMonth) }} this month</div>
            </div>
          </div>

          <div class="card chart-card">
            <div class="card-head">
              <h2>Registrations</h2>
              <span class="card-sub">Last 30 days · {{ registrations.length }} data points</span>
              <div class="card-head-spacer"></div>
              <div class="chart-legend">
                <span class="legend-dot"></span> New users / day
              </div>
            </div>
            <div class="sparkbar-wrap" v-if="registrations.length">
              <div v-for="r in registrations" :key="r._id" class="sparkbar-col" :title="`${r._id}: ${r.count} users`">
                <div class="sparkbar-value">{{ r.count > 0 ? r.count : '' }}</div>
                <div class="sparkbar" :style="{ height: barHeight(r.count) + 'px' }"></div>
                <div class="sparkbar-label">{{ r._id.slice(8) }}</div>
              </div>
            </div>
            <p v-else class="empty-state">No registration data yet.</p>
          </div>

          <!-- Feature Usage Chart: Quick Actions + Chat Stream -->
          <div class="card chart-card">
            <div class="card-head">
              <h2>Feature Usage</h2>
              <span class="card-sub">All-time · {{ quickActionStats.grandTotal.toLocaleString() }} total interactions</span>
              <div class="card-head-spacer"></div>
              <div class="chart-legend">
                <span class="legend-dot qa-legend-quick"></span> Quick actions
                <span class="legend-dot qa-legend-chat" style="margin-left:10px"></span> Chat stream
              </div>
            </div>
            <div class="qa-chart-wrap">
              <!-- Quick Action rows -->
              <div class="qa-section-label">Quick Actions</div>
              <div v-for="a in quickActionStats.actions" :key="a.action" class="qa-row">
                <div class="qa-label">
                  <span class="qa-icon">
                    <svg v-if="a.action === 'restaurants'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
                    <svg v-else-if="a.action === 'hotels'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <svg v-else-if="a.action === 'hidden_gems'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg v-else-if="a.action === 'historical'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                  {{ a.label }}
                </div>
                <div class="qa-bar-wrap">
                  <div class="qa-bar">
                    <div class="qa-bar-fill" :style="{ width: quickActionStats.grandTotal > 0 ? Math.round((a.count / quickActionStats.grandTotal) * 100) + '%' : '0%' }"></div>
                  </div>
                </div>
                <div class="qa-count">{{ a.count.toLocaleString() }}</div>
                <div class="qa-pct">{{ quickActionStats.grandTotal > 0 ? Math.round((a.count / quickActionStats.grandTotal) * 100) : 0 }}%</div>
              </div>

              <!-- Divider -->
              <div class="qa-divider"></div>
              <div class="qa-section-label">Chat</div>

              <!-- Chat Stream row -->
              <div class="qa-row qa-row--chat" v-if="quickActionStats.chatStream">
                <div class="qa-label">
                  <span class="qa-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </span>
                  AI Chat Stream
                </div>
                <div class="qa-bar-wrap">
                  <div class="qa-bar">
                    <div class="qa-bar-fill qa-bar-fill--chat" :style="{ width: quickActionStats.grandTotal > 0 ? Math.round((quickActionStats.chatStream.count / quickActionStats.grandTotal) * 100) + '%' : '0%' }"></div>
                  </div>
                </div>
                <div class="qa-count">{{ quickActionStats.chatStream.count.toLocaleString() }}</div>
                <div class="qa-pct">{{ quickActionStats.grandTotal > 0 ? Math.round((quickActionStats.chatStream.count / quickActionStats.grandTotal) * 100) : 0 }}%</div>
              </div>
            </div>
          </div>
          <!-- Onboarding Preference Charts -->
          <div class="card chart-card pref-card" v-if="prefStats.onboarding">
            <div class="card-head pref-head">
              <div class="pref-head-titles">
                <h2>User Preferences</h2>
                <span class="card-sub">{{ prefStats.onboarding.completed }} onboarded users</span>
              </div>
              <div class="card-head-spacer"></div>
              <div class="pref-completion-block">
                <div class="pref-completion-num">{{ prefStats.onboarding.completionRate }}%</div>
                <div class="pref-completion-cap">completion</div>
              </div>
            </div>

            <div class="pref-grid">

              <!-- Travel Style donut -->
              <div class="pref-tile">
                <div class="pref-tile-head">
                  <span class="pref-tile-title">Travel Style</span>
                  <span class="pref-tile-meta">{{ prefStats.travelStyles?.length || 0 }} options</span>
                </div>
                <div class="pref-tile-body pref-tile-body--donut">
                  <div class="pref-donut-wrap">
                    <svg class="pref-donut" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="30" fill="none" stroke-width="11" class="pref-donut-track"/>
                      <circle
                        v-for="(seg, i) in travelStyleSegments" :key="i"
                        cx="40" cy="40" r="30" fill="none" stroke-width="11"
                        :stroke="seg.color"
                        :stroke-dasharray="`${seg.dash} ${188.5 - seg.dash}`"
                        :stroke-dashoffset="seg.offset"
                        class="pref-donut-seg"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="pref-donut-center" v-if="prefStats.travelStyles?.length">
                      <div class="pref-donut-top-val">{{ prefStats.travelStyles[0]._id }}</div>
                      <div class="pref-donut-top-pct">{{ travelStyleTopPct }}%</div>
                    </div>
                  </div>
                  <div class="pref-legend">
                    <div v-for="(s, i) in prefStats.travelStyles?.slice(0,5)" :key="s._id" class="pref-legend-item">
                      <span class="pref-legend-dot" :style="{ background: PREF_DOT_COLORS[i % PREF_DOT_COLORS.length] }"></span>
                      <span class="pref-legend-label">{{ s._id }}</span>
                      <span class="pref-legend-count">{{ s.count }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Currency donut -->
              <div class="pref-tile">
                <div class="pref-tile-head">
                  <span class="pref-tile-title">Currency</span>
                  <span class="pref-tile-meta">{{ prefStats.currencies?.length || 0 }} types</span>
                </div>
                <div class="pref-tile-body pref-tile-body--donut">
                  <div class="pref-donut-wrap">
                    <svg class="pref-donut" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="30" fill="none" stroke-width="11" class="pref-donut-track"/>
                      <circle
                        v-for="(seg, i) in currencySegments" :key="i"
                        cx="40" cy="40" r="30" fill="none" stroke-width="11"
                        :stroke="seg.color"
                        :stroke-dasharray="`${seg.dash} ${188.5 - seg.dash}`"
                        :stroke-dashoffset="seg.offset"
                        class="pref-donut-seg"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="pref-donut-center" v-if="prefStats.currencies?.length">
                      <div class="pref-donut-top-val">{{ prefStats.currencies[0]._id }}</div>
                      <div class="pref-donut-top-pct">{{ currencyTopPct }}%</div>
                    </div>
                  </div>
                  <div class="pref-legend">
                    <div v-for="(c, i) in prefStats.currencies?.slice(0,5)" :key="c._id" class="pref-legend-item">
                      <span class="pref-legend-dot" :style="{ background: PREF_DOT_COLORS[i % PREF_DOT_COLORS.length] }"></span>
                      <span class="pref-legend-label">{{ c._id }}</span>
                      <span class="pref-legend-count">{{ c.count }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Top Interests — spans full width -->
              <div class="pref-tile pref-tile--full">
                <div class="pref-tile-head">
                  <span class="pref-tile-title">Top Interests</span>
                  <span class="pref-tile-meta" v-if="prefStats.interests?.length">{{ prefStats.interests.length }} categories</span>
                </div>
                <div class="pref-tile-body">
                  <div class="pref-bars pref-bars--two-col">
                    <div v-for="(item, i) in prefStats.interests?.slice(0,8)" :key="item._id" class="pref-bar-row">
                      <div class="pref-bar-label">{{ item._id }}</div>
                      <div class="pref-bar-track">
                        <div class="pref-bar-fill"
                          :style="{ width: prefStats.interests[0]?.count > 0 ? Math.round((item.count / prefStats.interests[0].count) * 100) + '%' : '0%',
                                    background: PREF_COLORS[i % PREF_COLORS.length] }">
                        </div>
                      </div>
                      <div class="pref-bar-count">{{ item.count }}</div>
                    </div>
                    <p v-if="!prefStats.interests?.length" class="empty-state" style="padding:16px 0; font-size:12px; grid-column: 1 / -1">No interest data yet</p>
                  </div>
                </div>
              </div>

              <!-- Location Mode -->
              <div class="pref-tile">
                <div class="pref-tile-head">
                  <span class="pref-tile-title">Location Mode</span>
                </div>
                <div class="pref-tile-body">
                  <div class="pref-two-bars">
                    <div v-for="(item, i) in prefStats.locationMode" :key="item._id" class="pref-two-bar-row">
                      <div class="pref-bar-label">{{ item._id }}</div>
                      <div class="pref-bar-track">
                        <div class="pref-bar-fill"
                          :style="{ width: prefLocTotal > 0 ? Math.round((item.count / prefLocTotal) * 100) + '%' : '0%',
                                    background: i === 0 ? (theme === 'day-mode' ? 'linear-gradient(90deg, #0e7490, #164e63)' : 'linear-gradient(90deg, #22d3ee, #0891b2)') : (theme === 'day-mode' ? 'linear-gradient(90deg, #15803d, #14532d)' : 'linear-gradient(90deg, #4ade80, #16a34a)') }">
                        </div>
                      </div>
                      <div class="pref-bar-count">{{ item.count }}</div>
                      <div class="pref-bar-pct">{{ prefLocTotal > 0 ? Math.round((item.count / prefLocTotal) * 100) : 0 }}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Budget Range -->
              <div class="pref-tile">
                <div class="pref-tile-head">
                  <span class="pref-tile-title">Budget Range</span>
                  <span class="pref-tile-meta">≤$300 · ≤$1k · $1k+</span>
                </div>
                <div class="pref-tile-body">
                  <div class="pref-two-bars">
                    <div v-for="(item, i) in prefStats.budgetBuckets" :key="item._id" class="pref-two-bar-row">
                      <div class="pref-bar-label" :title="budgetRangeHint(item._id)">{{ item._id }}</div>
                      <div class="pref-bar-track">
                        <div class="pref-bar-fill"
                          :style="{ width: prefBudgetTotal > 0 ? Math.round((item.count / prefBudgetTotal) * 100) + '%' : '0%',
                                    background: budgetBucketColor(item._id) }">
                        </div>
                      </div>
                      <div class="pref-bar-count">{{ item.count }}</div>
                      <div class="pref-bar-pct">{{ prefBudgetTotal > 0 ? Math.round((item.count / prefBudgetTotal) * 100) : 0 }}%</div>
                    </div>
                    <p v-if="!prefStats.budgetBuckets?.length" class="empty-state" style="padding:10px 0; font-size:12px">No budget data yet</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </section>

        <!-- ── USERS ── -->
        <section v-if="activeTab === 'users'" class="tab-section">
          <div class="toolbar">
            <div class="search-wrap">
              <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="userSearch" class="search-input" placeholder="Search by name or email…" @input="debouncedUserFetch" />
            </div>
            <div class="seg-group">
              <button v-for="opt in userFilterOpts" :key="opt.value"
                class="seg-btn"
                :class="{ 'seg-btn--active': userFilter === opt.value }"
                @click="userFilter = opt.value; fetchUsers()">
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="card table-card">
            <div class="card-head">
              <h2>User Management</h2>
              <span class="card-sub">{{ users.length }} results</span>
            </div>
            <table class="data-table">
              <thead><tr><th>User</th><th>Joined</th><th>Last Active</th><th>Today Tokens</th><th>Today Places</th><th>Total Tokens</th><th>Total Places</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr v-if="usersLoading"><td colspan="9" class="loading-cell"><div class="loader-ring loader-ring--sm"></div> Loading…</td></tr>
                <tr v-else-if="!users.length"><td colspan="9" class="empty-cell">No users found.</td></tr>
                <tr v-for="u in users" :key="u._id" class="table-row">
                  <td data-label="User">
                    <div class="user-cell">
                      <div><div class="user-name">{{ u.name }}</div><div class="user-email">{{ u.email }}</div></div>
                    </div>
                  </td>
                  <td class="dim-cell" data-label="Joined">{{ shortDate(u.createdAt) }}</td>
                  <td class="dim-cell" data-label="Last Active">{{ relativeTime(u.analytics?.lastActive) }}</td>
                  <td data-label="Today Tokens">
                    <div class="usage-bar-wrap">
                      <div class="usage-bar"><div class="usage-fill" :class="dailyTokenPct(u.aiLimits) > 80 ? 'fill-danger' : 'fill-accent'" :style="{ width: dailyTokenPct(u.aiLimits) + '%' }"></div></div>
                      <span class="usage-label">{{ isToday(u.aiLimits?.dailyUsage?.lastResetDate) ? fmt(u.aiLimits?.dailyUsage?.tokensUsed) : '0' }}</span>
                    </div>
                  </td>
                  <td data-label="Today Places">
                    <div class="usage-bar-wrap">
                      <div class="usage-bar"><div class="usage-fill" :class="dailyPlacesPct(u.aiLimits) > 80 ? 'fill-danger' : 'fill-accent'" :style="{ width: dailyPlacesPct(u.aiLimits) + '%' }"></div></div>
                      <span class="usage-label">{{ isToday(u.aiLimits?.dailyUsage?.lastResetDate) ? fmt(u.aiLimits?.dailyUsage?.placesViewed) : '0' }}</span>
                    </div>
                  </td>
                  <td class="num-cell" data-label="Total Tokens">{{ fmtK(u.aiLimits?.statistics?.totalTokensUsed) }}</td>
                  <td class="num-cell" data-label="Total Places">{{ fmt(u.aiLimits?.statistics?.totalPlacesViewed) }}</td>
                  <td data-label="Status"><span class="badge" :class="u.isPremium ? 'badge-premium' : 'badge-free'">{{ u.isPremium ? 'Premium' : 'Free' }}</span></td>
                  <td data-label="Actions" class="td-actions">
                    <div class="action-group">
                      <button class="action-btn action-btn--icon" :class="u.isPremium ? 'btn-muted' : 'btn-accent'" @click="togglePremium(u)" :title="u.isPremium ? 'Revoke Premium' : 'Upgrade to Premium'" :aria-label="u.isPremium ? 'Revoke Premium' : 'Upgrade to Premium'">
                        <svg v-if="u.isPremium" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
                        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                      <button class="action-btn action-btn--icon" :class="u.aiLimits?.onCooldown ? 'btn-warning' : 'btn-cooldown'" @click="toggleCooldown(u)" :title="u.aiLimits?.onCooldown ? 'Lift Cooldown' : 'Apply Cooldown'" :aria-label="u.aiLimits?.onCooldown ? 'Lift Cooldown' : 'Apply Cooldown'">
                        <svg v-if="u.aiLimits?.onCooldown" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>
                        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      </button>
                      <button class="action-btn action-btn--icon btn-delete" @click="deleteUser(u)" title="Delete user" aria-label="Delete user">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" v-if="usersTotalPages > 1">
            <button :disabled="usersPage === 1" @click="usersPage--; fetchUsers()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              Prev
            </button>
            <span>Page <strong>{{ usersPage }}</strong> / {{ usersTotalPages }}</span>
            <button :disabled="usersPage === usersTotalPages" @click="usersPage++; fetchUsers()">
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Location breakdown -->
          <div class="loc-section-label" style="margin-top: 12px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Home / Current Location
          </div>
          <div class="loc-grid">
            <div class="card loc-card">
              <div class="card-head">
                <h2>Users by Country</h2>
                <span class="card-sub">{{ userLocations.total }} located users · top 20</span>
              </div>
              <div class="loc-body" v-if="userLocations.byCountry.length">
                <div v-for="c in userLocations.byCountry" :key="c._id" class="loc-row">
                  <div class="loc-name">{{ c._id }}</div>
                  <div class="loc-bar-wrap">
                    <div class="loc-bar">
                      <div class="loc-bar-fill" :style="{ width: Math.round((c.count / userLocations.byCountry[0].count) * 100) + '%' }"></div>
                      <div class="loc-bar-fill loc-bar-premium" :style="{ width: Math.round((c.premium / userLocations.byCountry[0].count) * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="loc-count">{{ c.count }}</div>
                  <div class="loc-pct">{{ userLocations.total ? Math.round((c.count / userLocations.total) * 100) : 0 }}%</div>
                  <div class="loc-premium-badge" v-if="c.premium > 0">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {{ c.premium }}
                  </div>
                </div>
              </div>
              <p v-else class="empty-state" style="padding: 32px 20px">No location data yet — users haven't set their country.</p>
            </div>
            <div class="card loc-card">
              <div class="card-head">
                <h2>Top Cities</h2>
                <span class="card-sub">Top 10 cities</span>
              </div>
              <div class="loc-body" v-if="userLocations.byCity.length">
                <div v-for="(city, i) in userLocations.byCity" :key="city._id" class="loc-city-row">
                  <div class="loc-city-rank">{{ i + 1 }}</div>
                  <div class="loc-city-info">
                    <div class="loc-city-name">{{ city._id }}</div>
                    <div class="loc-city-country">{{ city.country || '—' }}</div>
                  </div>
                  <div class="loc-bar-wrap" style="max-width: 120px">
                    <div class="loc-bar">
                      <div class="loc-bar-fill" :style="{ width: Math.round((city.count / userLocations.byCity[0].count) * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="loc-count">{{ city.count }}</div>
                </div>
              </div>
              <p v-else class="empty-state" style="padding: 32px 20px">No city data yet.</p>
            </div>
          </div>

          <div class="loc-section-label" style="margin-top: 12px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Travel Destinations
            <span class="loc-section-sub" v-if="userLocations.destinations.total > 0">{{ userLocations.destinations.total }} users planning travel</span>
            <span class="loc-section-sub loc-section-sub--empty" v-else>No destinations set yet</span>
          </div>
          <div class="loc-grid">
            <div class="card loc-card">
              <div class="card-head">
                <h2>Destinations by Country</h2>
                <span class="card-sub">{{ userLocations.destinations.total }} users · top 20</span>
              </div>
              <div class="loc-body" v-if="userLocations.destinations.byCountry.length">
                <div v-for="c in userLocations.destinations.byCountry" :key="c._id" class="loc-row">
                  <div class="loc-name">{{ c._id }}</div>
                  <div class="loc-bar-wrap">
                    <div class="loc-bar">
                      <div class="loc-bar-fill loc-bar-dest" :style="{ width: Math.round((c.count / userLocations.destinations.byCountry[0].count) * 100) + '%' }"></div>
                      <div class="loc-bar-fill loc-bar-premium" :style="{ width: Math.round((c.premium / userLocations.destinations.byCountry[0].count) * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="loc-count">{{ c.count }}</div>
                  <div class="loc-pct">{{ userLocations.destinations.total ? Math.round((c.count / userLocations.destinations.total) * 100) : 0 }}%</div>
                  <div class="loc-premium-badge" v-if="c.premium > 0">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {{ c.premium }}
                  </div>
                </div>
              </div>
              <p v-else class="empty-state" style="padding: 32px 20px">No destinations set yet — users haven't planned travel.</p>
            </div>
            <div class="card loc-card">
              <div class="card-head">
                <h2>Top Destination Cities</h2>
                <span class="card-sub">Top 10 cities</span>
              </div>
              <div class="loc-body" v-if="userLocations.destinations.byCity.length">
                <div v-for="(city, i) in userLocations.destinations.byCity" :key="city._id" class="loc-city-row">
                  <div class="loc-city-rank">{{ i + 1 }}</div>
                  <div class="loc-city-info">
                    <div class="loc-city-name">{{ city._id }}</div>
                    <div class="loc-city-country">{{ city.country || '—' }}</div>
                  </div>
                  <div class="loc-bar-wrap" style="max-width: 120px">
                    <div class="loc-bar">
                      <div class="loc-bar-fill loc-bar-dest" :style="{ width: Math.round((city.count / userLocations.destinations.byCity[0].count) * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="loc-count">{{ city.count }}</div>
                </div>
              </div>
              <p v-else class="empty-state" style="padding: 32px 20px">No destination cities set yet.</p>
            </div>
          </div>
        </section>

        <!-- ── AI USAGE ── -->
        <section v-if="activeTab === 'ai'" class="tab-section">
          <!-- ── AI Provider toggle (DeepSeek ↔ Claude) ───────────────────── -->
          <div class="card provider-card">
            <div class="card-head">
              <h2>AI Provider</h2>
              <span class="card-sub">Switch per endpoint · changes apply within ~30s</span>
            </div>
            <div class="provider-body">
              <div class="provider-row" key="pr-chat">
                <label class="provider-label">Chat <span>(chat-stream)</span></label>
                <div class="prov-seg">
                  <button type="button" key="seg-chat-deepseek" class="prov-seg-btn" :class="{ active: aiProvider.aiProviderChat === 'deepseek' }" @click="setProvider('aiProviderChat', 'deepseek')">DeepSeek</button>
                  <button type="button" key="seg-chat-claude" class="prov-seg-btn" :class="{ active: aiProvider.aiProviderChat === 'claude' }" @click="setProvider('aiProviderChat', 'claude')">Claude</button>
                </div>
              </div>
              <div class="provider-row" key="pr-quick">
                <label class="provider-label">Quick Actions <span>(quick-action-stream)</span></label>
                <div class="prov-seg">
                  <button type="button" key="seg-qa-deepseek" class="prov-seg-btn" :class="{ active: aiProvider.aiProviderQuickAction === 'deepseek' }" @click="setProvider('aiProviderQuickAction', 'deepseek')">DeepSeek</button>
                  <button type="button" key="seg-qa-claude" class="prov-seg-btn" :class="{ active: aiProvider.aiProviderQuickAction === 'claude' }" @click="setProvider('aiProviderQuickAction', 'claude')">Claude</button>
                </div>
              </div>

              <template v-if="aiProvider.aiProviderChat === 'claude' || aiProvider.aiProviderQuickAction === 'claude'">
                <div class="provider-divider" key="pr-divider"></div>
                <div class="provider-row" key="pr-model">
                  <label class="provider-label">Claude model</label>
                  <div class="prov-seg">
                    <button type="button" key="seg-model-haiku" class="prov-seg-btn" :class="{ active: aiProvider.claudeModel === 'claude-haiku-4-5-20251001' }" @click="setProvider('claudeModel', 'claude-haiku-4-5-20251001')">Haiku 4.5 <em>cheapest</em></button>
                    <button type="button" key="seg-model-sonnet" class="prov-seg-btn" :class="{ active: aiProvider.claudeModel === 'claude-sonnet-4-6' }" @click="setProvider('claudeModel', 'claude-sonnet-4-6')">Sonnet 4.6</button>
                  </div>
                </div>
                <div class="provider-row" key="pr-websearch">
                  <label class="provider-label">
                    Enable web search
                    <span class="provider-warn">+$0.01 / search</span>
                  </label>
                  <label class="prov-switch">
                    <input type="checkbox" v-model="aiProvider.claudeWebSearch" />
                    <span class="prov-switch-track"><span class="prov-switch-thumb"></span></span>
                  </label>
                </div>
                <div class="provider-row" key="pr-maxsearch" v-if="aiProvider.claudeWebSearch">
                  <label class="provider-label">Max searches / request</label>
                  <div class="prov-stepper">
                    <button type="button" class="prov-step-btn" @click="aiProvider.claudeWebSearchMaxUses = Math.max(1, (aiProvider.claudeWebSearchMaxUses || 1) - 1)" :disabled="aiProvider.claudeWebSearchMaxUses <= 1">−</button>
                    <input class="provider-num" type="number" min="1" max="10" v-model.number="aiProvider.claudeWebSearchMaxUses" />
                    <button type="button" class="prov-step-btn" @click="aiProvider.claudeWebSearchMaxUses = Math.min(10, (aiProvider.claudeWebSearchMaxUses || 0) + 1)" :disabled="aiProvider.claudeWebSearchMaxUses >= 10">+</button>
                  </div>
                </div>
                <div class="provider-row provider-row--actions" key="pr-searchscope" v-if="aiProvider.claudeWebSearch">
                  <label class="provider-label">
                    Web search actions
                    <span class="provider-warn" v-if="!searchActionCount">none selected — no action will search</span>
                    <span class="provider-hint" v-else>{{ searchActionCount }} of {{ webSearchActionOptions.length }} selected · first tap only</span>
                  </label>
                  <div class="ws-action-grid">
                    <button
                      v-for="opt in webSearchActionOptions"
                      :key="opt.id"
                      type="button"
                      class="ws-chip"
                      :class="{ 'ws-chip--on': isSearchActionOn(opt.id) }"
                      @click="toggleSearchAction(opt.id)"
                    >
                      <span class="ws-chip-check" aria-hidden="true">{{ isSearchActionOn(opt.id) ? '✓' : '' }}</span>
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
              </template>

              <div class="provider-actions" key="pr-actions">
                <button class="provider-save" :disabled="aiProviderSaving" @click="saveAiProvider">
                  {{ aiProviderSaving ? 'Saving…' : 'Save provider settings' }}
                </button>
                <span v-if="aiProviderSavedAt" class="provider-saved">Saved ✓</span>
              </div>
            </div>
          </div>

          <!-- ── Provider breakdown (DeepSeek vs Claude, last N days) ──────── -->
          <div class="card provider-stats-card">
            <div class="card-head">
              <h2>Provider Usage &amp; Cost</h2>
              <span class="card-sub">Last {{ aiChartDays }} days · estimated</span>
            </div>
            <div v-if="providerStatsLoading" class="empty-state">Loading…</div>
            <div v-else class="prov-compare">
              <div class="prov-col prov-col--deepseek">
                <div class="prov-name">DeepSeek</div>
                <div class="prov-cost">${{ deepseekCost }}</div>
                <div class="prov-metric"><span>Tokens</span><b>{{ fmtK(providerStats.summary.deepseek.tokens) }}</b></div>
                <div class="prov-metric"><span>Requests</span><b>{{ fmt(providerStats.summary.deepseek.queries) }}</b></div>
                <div class="prov-metric"><span>Web searches</span><b>—</b></div>
              </div>
              <div class="prov-col prov-col--claude">
                <div class="prov-name">Claude</div>
                <div class="prov-cost">${{ claudeCost }}</div>
                <div class="prov-metric"><span>Tokens</span><b>{{ fmtK(providerStats.summary.claude.tokens) }}</b></div>
                <div class="prov-metric"><span>Requests</span><b>{{ fmt(providerStats.summary.claude.queries) }}</b></div>
                <div class="prov-metric"><span>Web searches</span><b>{{ fmt(providerStats.summary.claude.searches) }} <em>(${{ (providerStats.summary.claude.searches * 0.01).toFixed(2) }})</em></b></div>
              </div>
            </div>
            <div class="prov-note">
              Cost is an estimate from total tokens (DeepSeek ~$0.50/1M blended; Claude Haiku ~$2/1M blended) plus Claude web searches at $0.01 each. For exact figures, check the Anthropic Console and your DeepSeek dashboard.
            </div>
          </div>

          <div class="kpi-grid kpi-grid--4">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></div>
              <div class="kpi-label">Total Tokens Used</div>
              <div class="kpi-value">{{ fmtK(aiSummary.totalTokens) }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></div>
              <div class="kpi-label">Total Queries</div>
              <div class="kpi-value">{{ fmtK(aiSummary.totalQueries) }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
              <div class="kpi-label">Avg Tokens / Query</div>
              <div class="kpi-value">{{ Math.round(aiSummary.avgTokensPerQuery || 0) }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <div class="kpi-label">Users on Cooldown</div>
              <div class="kpi-value">{{ fmt(aiSummary.usersOnCooldown) }}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                </div>
                <div class="kpi-label">Today's Tokens</div>
                <div class="kpi-value">{{ fmtK(aiSummary.todayTokens) }}</div>
                <div class="kpi-sub">{{ fmt(aiSummary.todayQueries) }} queries today</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                </div>
                <div class="kpi-label">Total API Cost</div>
                <div class="kpi-value">${{ aiCost }}</div>
                <div class="kpi-sub">DeepSeek V3 · ~$0.50/1M blended</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                </div>
                <div class="kpi-label">Place Cards Named</div>
                <div class="kpi-value">{{ fmtK(aiSummary.totalPlaces) }}</div>
                <div class="kpi-sub">Total AI recommendations</div>
            </div>
          </div>

          <!-- Daily AI chart -->
          <div class="card chart-card">
            <div class="card-head">
              <h2>Daily AI Usage</h2>
              <span class="card-sub">Last {{ aiChartDays }} days · tokens per day</span>
              <div class="card-head-spacer"></div>
              <div class="seg-group">
                <button class="seg-btn" :class="{ 'seg-btn--active': aiChartDays === 7 }"  @click="aiChartDays = 7;  fetchAIUsage(); fetchProviderStats()">7d</button>
                <button class="seg-btn" :class="{ 'seg-btn--active': aiChartDays === 30 }" @click="aiChartDays = 30; fetchAIUsage(); fetchProviderStats()">30d</button>
              </div>
            </div>
            <div v-if="aiLoading" class="empty-state"><div class="loader-ring loader-ring--sm"></div> Loading…</div>
            <div v-else-if="!aiDailyStats.length || aiDailyStats.every(d => d.tokens === 0)" class="empty-state">No AI usage recorded yet.</div>
            <div v-else class="g-chart-body">
              <div class="g-chart-area">
                <div class="g-grid-lines">
                  <div class="g-grid-line" v-for="i in 4" :key="i"></div>
                </div>
                <div class="g-bars" :class="{ 'g-bars--30d': aiChartDays === 30 }">
                  <div
                    v-for="(day, idx) in aiDailyStats"
                    :key="day.date"
                    class="g-bar-col"
                  >
                    <div class="g-bar-spacer"></div>
                    <div
                      class="g-bar-stack"
                      :style="{ height: day.tokens > 0 ? Math.max(6, Math.round((day.tokens / aiChartMax) * 110)) + 'px' : '3px', animationDelay: idx * 20 + 'ms' }"
                    >
                      <div class="g-seg ai-seg-queries" v-if="day.queries" :style="{ flex: day.queries }"></div>
                      <div class="g-seg ai-seg-tokens"  v-if="day.tokens"  :style="{ flex: day.tokens }"></div>
                      <div class="g-seg g-seg-zero"     v-if="day.tokens === 0" style="flex:1"></div>
                    </div>
                    <div class="g-bar-label">{{ day.label }}</div>
                  </div>
                </div>
              </div>
              <div class="g-legend g-legend--footer">
                <span class="g-legend-item"><span class="g-legend-dot ai-dot-tokens"></span>Tokens</span>
                <span class="g-legend-item"><span class="g-legend-dot ai-dot-queries"></span>Queries</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ── BUSINESSES ── -->
        <section v-if="activeTab === 'businesses'" class="tab-section">
          <div class="kpi-grid kpi-grid--4">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/><line x1="2" y1="12" x2="22" y2="12"/></svg></div>
              <div class="kpi-label">Total Businesses</div>
              <div class="kpi-value">{{ fmt(bizSummary.total) }}</div>
              <div class="kpi-sub">{{ fmt(bizSummary.active) }} active</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div class="kpi-label">Partners</div>
              <div class="kpi-value">{{ fmt(bizSummary.partnerCount) }}</div>
              <div class="kpi-sub">{{ fmt(bizSummary.activePartnerCount) }} active partners</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
              <div class="kpi-label">Monthly Revenue</div>
              <div class="kpi-value">${{ fmtK(bizSummary.monthlyRevenue) }}</div>
              <div class="kpi-sub">From {{ fmt(bizSummary.activePartnerCount) }} active partners</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
              <div class="kpi-label">Views & Interactions</div>
              <div class="kpi-value">{{ fmtK(bizSummary.totalViews) }}</div>
              <div class="kpi-sub">{{ fmtK(bizSummary.totalClicks) }} clicks · {{ fmtK(bizSummary.totalConversions) }} conversions</div>
            </div>
          </div>
          <div class="toolbar toolbar--wrap">
            <div class="search-wrap">
              <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="bizSearch" class="search-input" placeholder="Search businesses…" @input="debouncedBizFetch" />
            </div>
            <div class="search-wrap">
              <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input v-model="bizLocationSearch" class="search-input" placeholder="Filter by location (city, country)…" @input="debouncedBizFetch" />
            </div>
            <div class="seg-group">
              <button v-for="opt in bizStatusFilterOpts" :key="opt.value"
                class="seg-btn"
                :class="{ 'seg-btn--active': bizStatusFilter === opt.value }"
                @click="bizStatusFilter = opt.value; bizPage = 1; fetchBusinesses()">
                {{ opt.label }}
              </button>
            </div>
            <div class="seg-group">
              <button v-for="opt in bizPartnerFilterOpts" :key="opt.value"
                class="seg-btn"
                :class="{ 'seg-btn--active': bizPartnerFilter === opt.value }"
                @click="bizPartnerFilter = opt.value; bizPage = 1; fetchBusinesses()">
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="card table-card">
            <div class="card-head"><h2>Business Directory</h2><span class="card-sub">{{ businesses.length }} results</span></div>
            <table class="data-table">
              <thead><tr><th>Name</th><th>Location</th><th>Status</th><th>Partner</th><th>Action</th></tr></thead>
              <tbody>
                <tr v-if="bizLoading"><td colspan="5" class="loading-cell"><div class="loader-ring loader-ring--sm"></div> Loading…</td></tr>
                <tr v-else-if="!businesses.length"><td colspan="5" class="empty-cell">No businesses found.</td></tr>
                <tr v-for="b in businesses" :key="b._id" class="table-row">
                  <td class="user-name" data-label="Name">
                    {{ b.name }}
                    <!-- Event listings carry a date/time (or weekly recurrence)
                         instead of plain opening hours — surface it here so an
                         admin can scan event timing without opening the modal. -->
                    <span
                      v-if="(b.type || []).includes('events')"
                      class="biz-event-line"
                      :title="eventScheduleSummary(b.eventSchedule)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ eventScheduleSummary(b.eventSchedule) }}
                    </span>
                  </td>
                  <td class="dim-cell" data-label="Location">{{ (() => { const c = b.location?.city; const r = b.location?.region; if (c && r && c !== r) return c + ', ' + r; return c || r || '—'; })() }}</td>
                  <td data-label="Status">
                    <span class="status-pill" :class="`status-${b.status || 'pending'}`">
                      {{ b.status || 'pending' }}
                    </span>
                  </td>
                  <td data-label="Tier">
                    <span class="badge"
                      :class="b.partnership?.tier === 'signature' ? 'badge-signature' : b.partnership?.tier === 'spotlight' ? 'badge-spotlight' : 'badge-free'">
                      {{ b.partnership?.tier === 'signature' ? 'Signature' : b.partnership?.tier === 'spotlight' ? 'Spotlight' : 'Verified' }}
                    </span>
                  </td>
                  <td data-label="Actions" class="td-actions">
                    <div class="action-group">
                      <button class="action-btn btn-edit" @click="openEdit('business', b)" title="View / edit business">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button class="action-btn" :class="b.isActive ? 'btn-muted' : 'btn-accent'" @click="toggleBusiness(b)">{{ b.isActive ? 'Deactivate' : 'Activate' }}</button>
                      <button class="action-btn btn-delete" @click="deleteBusiness(b)" title="Delete business">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" v-if="bizTotalPages > 1">
            <button :disabled="bizPage === 1" @click="bizPage--; fetchBusinesses()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              Prev
            </button>
            <span>Page <strong>{{ bizPage }}</strong> / {{ bizTotalPages }}</span>
            <button :disabled="bizPage === bizTotalPages" @click="bizPage++; fetchBusinesses()">
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </section>

        <!-- ── PLACES CACHE ── -->
        <section v-if="activeTab === 'places'" class="tab-section">
          <div class="kpi-grid kpi-grid--4">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <div class="kpi-label">Cached Places</div>
              <div class="kpi-value">{{ fmt(placesSummary.totalPlaces) }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              <div class="kpi-label">Cache Hits</div>
              <div class="kpi-value">{{ fmtK((placesSummary.totalUses || 0) - (placesSummary.totalFetches || 0)) }}</div>
              <div class="kpi-sub">{{ placesSummary.totalUses ? Math.round(((placesSummary.totalUses - placesSummary.totalFetches) / placesSummary.totalUses) * 100) : 0 }}% served from cache</div>
              <div class="kpi-progress-bar"><div class="kpi-progress-fill" :style="{ width: (placesSummary.totalUses ? Math.round(((placesSummary.totalUses - placesSummary.totalFetches) / placesSummary.totalUses) * 100) : 0) + '%' }"></div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg></div>
              <div class="kpi-label">Total API Fetches</div>
              <div class="kpi-value">{{ fmt(placesSummary.totalFetches) }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
              <div class="kpi-label">Oldest Cache</div>
              <div class="kpi-value" style="font-size:18px;letter-spacing:-0.5px">{{ placesSummary.oldestCreatedAt ? shortDate(placesSummary.oldestCreatedAt) : '—' }}</div>
              <div class="kpi-sub">{{ placesSummary.oldestCreatedAt ? relativeTime(placesSummary.oldestCreatedAt) : 'No data' }}</div>
              <div v-if="placesSummary.oldestPlaceName" class="kpi-oldest-name" @click="placesSearch = placesSummary.oldestPlaceName; fetchPlaces(true)" title="Click to search this place">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                {{ placesSummary.oldestPlaceName }}
              </div>
            </div>
          </div>

          <div class="toolbar">
            <div class="search-wrap">
              <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="placesSearch" class="search-input" placeholder="Search places by name or address…" @input="debouncedPlacesFetch" />
            </div>
            <div class="seg-group">
              <button v-for="opt in placesImageFilterOpts" :key="opt.value"
                class="seg-btn"
                :class="{ 'seg-btn--active': placesImageFilter === opt.value }"
                @click="placesImageFilter = opt.value; fetchPlaces(true)">
                {{ opt.label }}
              </button>
            </div>
            <div class="seg-group">
              <button v-for="opt in placesActionOpts" :key="opt.value"
                class="seg-btn"
                :class="{ 'seg-btn--active': placesActionFilter === opt.value }"
                @click="placesActionFilter = opt.value; fetchPlaces(true)">
                {{ opt.label }}
              </button>
            </div>
            <div class="seg-group">
              <button v-for="opt in placesExploreOpts" :key="opt.value"
                class="seg-btn"
                :class="{ 'seg-btn--active': placesExploreFilter === opt.value }"
                @click="placesExploreFilter = opt.value; fetchPlaces(true)">
                {{ opt.label }}
              </button>
            </div>
            <div class="seg-group">
              <button v-for="opt in placesSortOpts" :key="opt.value"
                class="seg-btn"
                :class="{ 'seg-btn--active': placesSort === opt.value }"
                @click="placesSort = opt.value; fetchPlaces(true)">
                {{ opt.label }}
              </button>
            </div>
            <button class="purge-main" style="border-radius:8px; margin-right:8px" :disabled="backfillBusy"
              @click="backfillRegions" title="Parse country / city for cached places that don't have them yet (needed once for staff Explore moderation scoping; safe to re-run)">
              {{ backfillBusy ? 'Backfilling…' : 'Backfill regions' }}
            </button>
            <div class="purge-split" v-click-outside="() => purgeDropdownOpen = false">
              <button class="purge-main" @click="purgeStale">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                Purge · <span class="purge-period-label">{{ purgeNeverUsed ? 'Never used' : '' }}{{ purgeNeverUsed && purgeDays ? ' + ' : '' }}{{ purgeDays ? selectedPurgeOpt.label : '' }}</span>
              </button>
              <button class="purge-chevron" @click.stop="purgeDropdownOpen = !purgeDropdownOpen">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="{ transform: purgeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="purge-dropdown" v-if="purgeDropdownOpen">
                <div class="purge-dropdown-label">Unused for longer than…</div>
                <button
                  v-for="opt in purgeOpts" :key="opt.days"
                  class="purge-dropdown-item"
                  :class="{ 'purge-dropdown-item--active': purgeDays === opt.days }"
                  @click="purgeDays = opt.days">
                  <svg v-if="purgeDays === opt.days" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-else style="width:12px;display:inline-block"></span>
                  {{ opt.label }}
                </button>
                <div class="purge-dropdown-divider"></div>
                <button
                  class="purge-dropdown-item purge-dropdown-item--never"
                  :class="{ 'purge-dropdown-item--active': purgeNeverUsed }"
                  @click="purgeNeverUsed = !purgeNeverUsed">
                  <svg v-if="purgeNeverUsed" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-else style="width:12px;display:inline-block"></span>
                  Never used (useCount ≤ 1)
                </button>
                <button class="purge-dropdown-apply" @click="purgeStale(); purgeDropdownOpen = false">
                  Apply purge
                </button>
              </div>
            </div>
          </div>

          <div v-if="placesLoading" class="loading-screen" style="min-height:200px">
            <div class="loader-ring"></div>
          </div>
          <div v-else-if="!places.length" class="empty-state">No cached places found.</div>
          <div v-else class="places-grid">
            <div v-for="p in places" :key="p.placeId" class="place-card">
              <div class="place-img-wrap">
                <img
                  v-if="p.imagesStored && p.photos && p.photos.length"
                  :src="`${apiBase}/api/ai/place-image/${p.placeId}/0`"
                  :alt="p.name"
                  class="place-img"
                  loading="lazy"
                  @error="onImgError"
                />
                <div v-else class="place-img-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="place-img-overlay">
                  <button class="place-mod-btn place-mod-verify" :class="{ 'place-mod-btn--on': p.explore?.status === 'verified' }"
                    @click="setExploreStatus(p, 'verified')"
                    :title="p.explore?.status === 'verified' ? 'Unverify (back to visible)' : 'Verify for Explore (always shown, skips auto-rules)'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button class="place-mod-btn place-mod-hide" :class="{ 'place-mod-btn--on': p.explore?.status === 'hidden' }"
                    @click="setExploreStatus(p, 'hidden')"
                    :title="p.explore?.status === 'hidden' ? 'Unhide (back to visible)' : 'Hide everywhere — Explore page, chat and quick-action recommendations'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                  <button class="place-delete-btn" @click="deletePlace(p)" title="Remove from cache">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <span class="place-img-badge" v-if="p.rating">{{ p.rating.toFixed(1) }}</span>
              </div>
              <div class="place-info">
                <div class="place-name">{{ p.name }}</div>
                <div class="place-addr">{{ p.details?.formatted_address || '—' }}</div>
                <div class="place-meta">
                  <span class="badge" :class="p.imagesStored ? 'badge-ok' : 'badge-muted'">{{ p.imagesStored ? 'Image' : 'No img' }}</span>
                  <span class="badge" :class="p.hasDetailedInfo ? 'badge-ok' : 'badge-muted'">{{ p.hasDetailedInfo ? 'Detail' : 'Basic' }}</span>
                  <span v-if="p.explore?.status === 'verified'" class="badge badge-ok" title="Human-verified — always on Explore">✓ Verified</span>
                  <span v-else-if="p.explore?.status === 'hidden'" class="badge badge-hidden" title="Hidden from the Explore page">Hidden</span>
                  <span v-if="p.priceTier" class="badge pf-tier" :title="`Tier ${p.priceTier}/4 · from ${p.priceTierSource === 'price' ? 'Google price level' : 'lodging type'}`">
                    {{ p.priceTierLabel }}<template v-if="p.priceDollars"> · {{ p.priceDollars }}</template>
                  </span>
                  <span class="badge pf-like" title="Community likes">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    {{ fmt(p.likes || 0) }}
                  </span>
                  <span class="badge pf-dislike" title="Community dislikes">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                    {{ fmt(p.dislikes || 0) }}
                  </span>
                </div>
                <div class="place-event" v-if="eventDateLabel(p.eventSchedule)">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>{{ eventDateLabel(p.eventSchedule) }}</span>
                </div>
                <div class="place-stats">
                  <span>Used {{ fmt(p.useCount) }}×</span>
                  <span>·</span>
                  <span>Fetched {{ fmt(p.fetchCount) }}×</span>
                  <span>·</span>
                  <span>{{ shortDate(p.lastUsed) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination" v-if="placesTotalPages > 1">
            <button :disabled="placesPage === 1" @click="placesPage--; fetchPlaces()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              Prev
            </button>
            <span>Page <strong>{{ placesPage }}</strong> / {{ placesTotalPages }}</span>
            <button :disabled="placesPage === placesTotalPages" @click="placesPage++; fetchPlaces()">
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </section>

        <!-- ── DESTINATIONS ── -->
        <section v-if="activeTab === 'destinations'" class="tab-section">
          <div class="kpi-grid kpi-grid--3">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
              <div class="kpi-label">Total Destinations</div>
              <div class="kpi-value">{{ fmt(destSummary.total) }}</div>
              <div class="kpi-sub">{{ fmt(destSummary.active) }} active</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
              <div class="kpi-label">Hidden Gems</div>
              <div class="kpi-value">{{ fmt(destSummary.hiddenGems) }}</div>
              <div class="kpi-sub">{{ destSummary.total ? Math.round((destSummary.hiddenGems / destSummary.total) * 100) : 0 }}% of total</div>
              <div class="kpi-progress-bar"><div class="kpi-progress-fill" :style="{ width: (destSummary.total ? Math.round((destSummary.hiddenGems / destSummary.total) * 100) : 0) + '%' }"></div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
              <div class="kpi-label">Views & Interactions</div>
              <div class="kpi-value">{{ fmtK(destSummary.totalViews) }}</div>
              <div class="kpi-sub">{{ fmtK(destSummary.totalClicks) }} clicks · {{ fmtK(destSummary.totalConversions) }} conversions</div>
            </div>
          </div>
          <div class="toolbar">
            <div class="search-wrap">
              <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="destSearch" class="search-input" placeholder="Search destinations…" @input="debouncedDestFetch" />
            </div>
            <div class="seg-group">
              <button v-for="opt in destFilterOpts" :key="opt.value" class="seg-btn" :class="{ 'seg-btn--active': destFilter === opt.value }" @click="destFilter = opt.value; fetchDestinations(true)">{{ opt.label }}</button>
            </div>
            <button class="action-btn btn-accent" @click="openCreateDestination" title="Add a new destination">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add destination
            </button>
          </div>
          <div class="card table-card">
            <div class="card-head"><h2>Destination Directory</h2><span class="card-sub">{{ destinations.length }} results</span></div>
            <table class="data-table">
              <thead><tr><th>Name</th><th>Location</th><th>Views</th><th>Clicks</th><th>Added by</th><th>Action</th></tr></thead>
              <tbody>
                <tr v-if="destLoading"><td colspan="6" class="loading-cell"><div class="loader-ring loader-ring--sm"></div> Loading…</td></tr>
                <tr v-else-if="!destinations.length"><td colspan="6" class="empty-cell">No destinations found.</td></tr>
                <tr v-for="d in destinations" :key="d._id" class="table-row" :class="{ 'row-hidden-gem': d.isHiddenGem }">
                  <td class="user-name" data-label="Name">
                    {{ d.name }}
                    <span v-if="d.isHiddenGem" class="gem-badge">✦ Hidden Gem</span>
                  </td>
                  <td class="dim-cell" data-label="Location">{{ (() => { const c = d.location?.city; const r = d.location?.region; if (c && r && c !== r) return c + ', ' + r; return c || r || '—'; })() }}</td>
                  <td class="num-cell" data-label="Views">{{ fmt(d.analytics?.views) }}</td>
                  <td class="num-cell" data-label="Clicks">{{ fmt(d.analytics?.clicks) }}</td>
                  <td class="dim-cell" data-label="Added by">
                    <template v-if="d.createdBy && typeof d.createdBy === 'object'">
                      {{ d.createdBy.name || d.createdBy.email || '—' }}
                    </template>
                    <template v-else>—</template>
                  </td>
                  <td data-label="Action" class="td-actions">
                    <div class="action-group">
                      <button class="action-btn btn-edit" @click="openEdit('destination', d)" title="Edit destination">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button class="action-btn" :class="d.isActive ? 'btn-muted' : 'btn-accent'" @click="toggleDestination(d)">{{ d.isActive ? 'Deactivate' : 'Activate' }}</button>
                      <button class="action-btn btn-delete" @click="deleteDestination(d)" title="Delete destination">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" v-if="destTotalPages > 1">
            <button :disabled="destPage === 1" @click="destPage--; fetchDestinations()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Prev
            </button>
            <span>Page <strong>{{ destPage }}</strong> / {{ destTotalPages }}</span>
            <button :disabled="destPage === destTotalPages" @click="destPage++; fetchDestinations()">
              Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </section>

        <!-- ── GOOGLE USAGE ── -->
        <section v-if="activeTab === 'google'" class="tab-section">
          <div class="kpi-grid kpi-grid--4">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              <div class="kpi-label">Cache Hit Rate</div>
              <div class="kpi-value">{{ googleUsage.cacheHitRate || 0 }}%</div>
              <div class="kpi-sub">Served without Google API</div>
              <div class="kpi-progress-bar"><div class="kpi-progress-fill" :style="{ width: (googleUsage.cacheHitRate || 0) + '%' }"></div></div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.454 0-.769-.085-1.357-.187-1.857H12.24z"/></svg></div>
              <div class="kpi-label">Today's Billed Calls</div>
              <div class="kpi-value">{{ fmt(googleUsage.todayBilledCalls) }}</div>
              <div class="kpi-sub">${{ (googleUsage.todayCost || 0).toFixed(3) }} today</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
              <div class="kpi-label">This Month's Calls</div>
              <div class="kpi-value">{{ fmt(googleUsage.monthBilledCalls) }}</div>
              <div class="kpi-sub">${{ (googleUsage.monthCost || 0).toFixed(2) }} this month</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
              <div class="kpi-label">Total API Cost</div>
              <div class="kpi-value">${{ (googleUsage.totalCost || 0).toFixed(2) }}</div>
              <div class="kpi-sub">All-time · all call types</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <div class="kpi-label">Cached Places</div>
              <div class="kpi-value">{{ fmt(googleUsage.totalPlaces) }}</div>
              <div class="kpi-sub">{{ fmt(googleUsage.withImages) }} with images stored</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg></div>
              <div class="kpi-label">Place Details Calls</div>
              <div class="kpi-value">{{ fmtK(googleUsage.totalDetailsCalls) }}</div>
              <div class="kpi-sub">$0.020/call · Place Details Enterprise</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
              <div class="kpi-label">Image Downloads</div>
              <div class="kpi-value">{{ fmtK(googleUsage.totalImageCalls) }}</div>
              <div class="kpi-sub">$0.007/call · Place Photos Enterprise</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
              <div class="kpi-label">Avg Fetches / Place</div>
              <div class="kpi-value">{{ googleUsage.avgFetchesPerPlace ? googleUsage.avgFetchesPerPlace.toFixed(1) : '0' }}</div>
              <div class="kpi-sub">Lower = better cache efficiency</div>
            </div>
          </div>

          <!-- ── Google Prefetch control (writes AppConfig via /ai-provider) ───── -->
          <div class="card g-prefetch-card">
            <div class="card-head">
              <h2>Google Prefetch</h2>
              <span class="card-sub">One area-cached Text Search → up to 20 real places the model ranks. Pricier SKU — watch the calls above.</span>
              <div class="card-head-spacer"></div>
              <label class="prov-switch">
                <input type="checkbox" v-model="aiProvider.googlePrefetch" />
                <span class="prov-switch-track"><span class="prov-switch-thumb"></span></span>
              </label>
            </div>
            <div v-if="aiProviderLoading" class="empty-state"><div class="loader-ring loader-ring--sm"></div> Loading…</div>
            <template v-else>
              <div v-if="aiProvider.googlePrefetch" class="g-prefetch-body">
                <div class="provider-row">
                  <label class="provider-label">
                    Mode
                    <span class="provider-hint" v-if="aiProvider.googlePrefetchMode === 'resolve'">Verify only — AI recommends, Google supplies real place IDs (skips a lookup). Best for thin / well-known markets.</span>
                    <span class="provider-hint" v-else>Suggest — inject Google's real places as recommendations too. Best for dense / unfamiliar markets.</span>
                  </label>
                  <div class="seg-group">
                    <button type="button" class="seg-btn" :class="{ 'seg-btn--active': aiProvider.googlePrefetchMode !== 'resolve' }" @click="aiProvider.googlePrefetchMode = 'suggest'">Suggest</button>
                    <button type="button" class="seg-btn" :class="{ 'seg-btn--active': aiProvider.googlePrefetchMode === 'resolve' }" @click="aiProvider.googlePrefetchMode = 'resolve'">Resolve only</button>
                  </div>
                </div>
                <div class="provider-row provider-row--actions">
                  <label class="provider-label">
                    Layers
                    <span class="provider-hint" v-if="prefetchLayerCount">{{ prefetchLayerCount }} selected · one cached call feeds all chosen layers</span>
                    <span class="provider-hint" v-else>none ticked → runs on all layers</span>
                  </label>
                  <div class="ws-action-grid">
                    <button
                      v-for="opt in prefetchLayerOptions"
                      :key="'pl-' + opt.id"
                      type="button"
                      class="ws-chip"
                      :class="{ 'ws-chip--on': isPrefetchLayerOn(opt.id) }"
                      @click="togglePrefetchLayer(opt.id)"
                    >
                      <span class="ws-chip-check" aria-hidden="true">{{ isPrefetchLayerOn(opt.id) ? '✓' : '' }}</span>
                      {{ opt.label }} <em class="ws-chip-hint">{{ opt.hint }}</em>
                    </button>
                  </div>
                </div>
                <div class="provider-row provider-row--actions">
                  <label class="provider-label">
                    Actions
                    <span class="provider-hint" v-if="prefetchActionCount">{{ prefetchActionCount }} of {{ webSearchActionOptions.length }} selected</span>
                    <span class="provider-hint" v-else>none ticked → runs on all actions</span>
                  </label>
                  <div class="ws-action-grid">
                    <button
                      v-for="opt in webSearchActionOptions"
                      :key="'pa-' + opt.id"
                      type="button"
                      class="ws-chip"
                      :class="{ 'ws-chip--on': isPrefetchActionOn(opt.id) }"
                      @click="togglePrefetchAction(opt.id)"
                    >
                      <span class="ws-chip-check" aria-hidden="true">{{ isPrefetchActionOn(opt.id) ? '✓' : '' }}</span>
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
                <div class="provider-row">
                  <label class="provider-label">Candidates / search <span class="provider-hint">max 20</span></label>
                  <div class="prov-stepper">
                    <button type="button" class="prov-step-btn" @click="aiProvider.googlePrefetchCount = Math.max(1, (aiProvider.googlePrefetchCount || 1) - 1)" :disabled="aiProvider.googlePrefetchCount <= 1">−</button>
                    <input class="provider-num" type="number" min="1" max="20" v-model.number="aiProvider.googlePrefetchCount" />
                    <button type="button" class="prov-step-btn" @click="aiProvider.googlePrefetchCount = Math.min(20, (aiProvider.googlePrefetchCount || 0) + 1)" :disabled="aiProvider.googlePrefetchCount >= 20">+</button>
                  </div>
                </div>
              </div>
              <div class="g-prefetch-foot">
                <button class="provider-save" :disabled="aiProviderSaving" @click="saveAiProvider">
                  {{ aiProviderSaving ? 'Saving…' : 'Save prefetch settings' }}
                </button>
                <span v-if="aiProviderSavedAt" class="provider-saved">Saved ✓</span>
              </div>
            </template>
          </div>
          <div class="card chart-card g-chart-card">
            <div class="card-head">
              <h2>Daily API Calls</h2>
              <span class="card-sub">Last {{ googleChartDays }} days · billed calls per day</span>
              <div class="card-head-spacer"></div>
              <div class="seg-group">
                <button class="seg-btn" :class="{ 'seg-btn--active': googleChartDays === 7 }"  @click="googleChartDays = 7;  fetchGoogleUsage()">7d</button>
                <button class="seg-btn" :class="{ 'seg-btn--active': googleChartDays === 30 }" @click="googleChartDays = 30; fetchGoogleUsage()">30d</button>
              </div>
            </div>
            <div v-if="googleLoading" class="empty-state"><div class="loader-ring loader-ring--sm"></div> Loading…</div>
            <div v-else-if="!googleDailyStats.length || googleDailyStats.every(d => d.total === 0)" class="empty-state">No API calls recorded yet.</div>
            <div v-else class="g-chart-body">
              <div class="g-chart-area">
                <!-- Y-axis gridlines -->
                <div class="g-grid-lines">
                  <div class="g-grid-line" v-for="i in 4" :key="i"></div>
                </div>
                <!-- Bars -->
                <div class="g-bars" :class="{ 'g-bars--30d': googleChartDays === 30 }">
                  <div
                    v-for="(day, idx) in googleDailyStats"
                    :key="day.date"
                    class="g-bar-col"
                    :class="{ 'g-bar-col--active': day.total > 0 }"
                  >
                    <div class="g-bar-spacer"></div>
                    <div
                      class="g-bar-stack"
                      :style="{ height: day.total > 0 ? Math.max(6, Math.round((day.total / googleChartMax) * 110)) + 'px' : '3px', animationDelay: idx * 20 + 'ms' }"
                    >
                      <div class="g-seg g-seg-img"     v-if="day.imageDownload"   :style="{ flex: day.imageDownload }"></div>
                      <div class="g-seg g-seg-geo"     v-if="day.reverseGeocode"  :style="{ flex: day.reverseGeocode }"></div>
                      <div class="g-seg g-seg-details" v-if="day.getPlaceDetails" :style="{ flex: day.getPlaceDetails }"></div>
                      <div class="g-seg g-seg-find"    v-if="day.findPlaces"      :style="{ flex: day.findPlaces }"></div>
                      <div class="g-seg g-seg-zero"    v-if="day.total === 0"     style="flex:1"></div>
                    </div>
                    <div class="g-bar-label">{{ day.label }}</div>
                  </div>
                </div>
              </div>
              <div class="g-legend g-legend--footer">
                <span class="g-legend-item"><span class="g-legend-dot g-dot-find"></span>Find</span>
                <span class="g-legend-item"><span class="g-legend-dot g-dot-details"></span>Details</span>
                <span class="g-legend-item"><span class="g-legend-dot g-dot-geo"></span>Geocode</span>
                <span class="g-legend-item"><span class="g-legend-dot g-dot-img"></span>Images</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ── PRICES ── -->
        <section v-if="activeTab === 'prices'" class="tab-section">
          <div class="kpi-grid kpi-grid--5">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
              <div class="kpi-label">Business Revenue</div>
              <div class="kpi-value kpi-value--income">${{ monthlyRevenue }}</div>
              <div class="kpi-sub">Total from all partners</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
              <div class="kpi-label">Est. Monthly Expenses</div>
              <div class="kpi-value kpi-value--expense">${{ monthlyTotal }}</div>
              <div class="kpi-sub">All services combined</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></div>
              <div class="kpi-label">DeepSeek AI (est.)</div>
              <div class="kpi-value">${{ monthlyAiCost }}</div>
              <div class="kpi-sub">Based on today × 30 days</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.454 0-.769-.085-1.357-.187-1.857H12.24z"/></svg></div>
              <div class="kpi-label">Google Places (this month)</div>
              <div class="kpi-value">${{ monthlyGoogleCost }}</div>
              <div class="kpi-sub">{{ fmt(googleUsage.monthFetches) }} calls · per-SKU free caps</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
              <div class="kpi-label">MongoDB Atlas (proj.)</div>
              <div class="kpi-value">${{ projectedMongoCostStr }}</div>
              <div class="kpi-sub">${{ monthlyMongoCost }} MTD · {{ dbStats ? dbStats.usedMB + ' MB' : 'Atlas Flex' }}</div>
            </div>
          </div>
          <div class="prices-grid">
            <div class="card price-card">
              <div class="card-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                <h2>DeepSeek AI</h2><span class="card-sub">Token-based billing</span>
              </div>
              <div class="price-card-body">
                <div class="price-row"><span class="price-label">Input rate</span><span class="price-val">$0.27 / 1M (cache miss) · $0.07 cached</span></div><div class="price-row"><span class="price-label">Output rate</span><span class="price-val">$1.10 / 1M tokens</span></div><div class="price-row"><span class="price-label">Blended est.</span><span class="price-val">~$0.50 / 1M tokens</span></div>
                <div class="price-row"><span class="price-label">Today's tokens</span><span class="price-val">{{ fmtK(aiSummary.todayTokens) }}</span></div>
                <div class="price-row"><span class="price-label">Today's cost</span><span class="price-val">${{ todayCost }}</span></div>
                <div class="price-row"><span class="price-label">All-time tokens</span><span class="price-val">{{ fmtK(aiSummary.totalTokens) }}</span></div>
                <div class="price-row price-row--total"><span class="price-label">All-time cost</span><span class="price-val">${{ aiCost }}</span></div>
              </div>
            </div>
            <div class="card price-card">
              <div class="card-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.454 0-.769-.085-1.357-.187-1.857H12.24z"/></svg>
                <h2>Google Places API</h2><span class="card-sub">Places API (New) · per-SKU billing</span>
              </div>
              <div class="price-card-body">
                <!-- Per-SKU rows. Each shows: this-month calls, free cap, rate, and SKU cost. -->
                <template v-if="googleUsage.pricing">
                  <div class="price-row" v-for="sku in googleSkuRows" :key="sku.key">
                    <span class="price-label" :title="sku.label + ' — $' + sku.per1k.toFixed(2) + ' per 1K, ' + fmt(sku.free) + ' free/mo'">
                      {{ sku.label }}
                    </span>
                    <span class="price-val">
                      {{ fmt(sku.monthCalls) }} / {{ fmt(sku.free) }} · ${{ sku.monthCost.toFixed(2) }}
                    </span>
                  </div>
                </template>
                <div class="price-row" v-else>
                  <span class="price-label">Rates</span>
                  <span class="price-val db-loading">Loading…</span>
                </div>
                <div class="price-row"><span class="price-label">Today's calls</span><span class="price-val">{{ fmt(googleUsage.todayFetches) }}</span></div>
                <div class="price-row"><span class="price-label">Today's cost (raw)</span><span class="price-val">${{ googleTodayCost }}</span></div>
                <div class="price-row"><span class="price-label">This month's calls</span><span class="price-val">{{ fmt(googleUsage.monthFetches) }}</span></div>
                <div class="price-row price-row--total"><span class="price-label">This month's cost</span><span class="price-val">${{ googleMonthCost }}</span></div>
              </div>
            </div>
            <div class="card price-card">
              <div class="card-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                <h2>MongoDB Atlas</h2><span class="card-sub">Flex tier · AWS Frankfurt (eu-central-1)</span>
              </div>
              <div class="price-card-body">
                <div class="price-row"><span class="price-label">Plan</span><span class="price-val">Atlas Flex · MongoDB 8.0 · 5 GB + 100 ops/sec included</span></div>
                <div class="price-row"><span class="price-label">Pricing model</span><span class="price-val">$8 base → $30 cap (tiered by ops/sec)</span></div>
                <div class="price-row">
                  <span class="price-label">Storage used</span>
                  <span class="price-val" v-if="dbStats">
                    {{ dbStats.usedMB }} MB
                    <span class="db-meta"> · {{ dbStats.collections }} collections · {{ fmt(dbStats.objects) }} docs</span>
                  </span>
                  <span class="price-val db-loading" v-else>Loading…</span>
                </div>
                <div class="price-row db-progress-row" v-if="dbStats">
                  <span class="price-label">Capacity</span>
                  <div class="db-progress-wrap">
                    <div class="db-progress-bar">
                      <div class="db-progress-fill" :style="{ width: Math.min(100, dbStats.usedPct) + '%' }" :class="{ 'db-fill-warn': dbStats.usedPct > 70, 'db-fill-danger': dbStats.usedPct > 90 }"></div>
                    </div>
                    <span class="db-progress-label">{{ dbStats.usedMB }} / {{ dbStats.capacityMB || 5120 }} MB ({{ dbStats.usedPct }}%)</span>
                  </div>
                </div>
                <!-- Real billing from Atlas Admin API (pending invoice, month-to-date) -->
                <div class="price-row" v-if="mongoBilling && mongoBilling.available">
                  <span class="price-label">Billing period</span>
                  <span class="price-val">
                    {{ mongoBilling.periodStart ? mongoBilling.periodStart.slice(0,10) : '—' }} → {{ mongoBilling.periodEnd ? mongoBilling.periodEnd.slice(0,10) : '—' }}
                  </span>
                </div>
                <template v-if="mongoBilling && mongoBilling.available && mongoBilling.breakdown && mongoBilling.breakdown.length">
                  <div class="price-row" v-for="line in mongoBilling.breakdown" :key="line.sku">
                    <span class="price-label" :title="line.sku">{{ prettySku(line.sku) }}</span>
                    <span class="price-val">${{ line.cost.toFixed(2) }}</span>
                  </div>
                </template>
                <div class="price-row" v-else-if="mongoBilling && !mongoBilling.available">
                  <span class="price-label">Live billing</span>
                  <span class="price-val" style="opacity:0.7">Not configured — set ATLAS_ORG_ID + API key env vars</span>
                </div>
                <div class="price-row" v-else>
                  <span class="price-label">Live billing</span>
                  <span class="price-val db-loading">Loading…</span>
                </div>
                <div class="price-row">
                  <span class="price-label">Month-to-date</span>
                  <span class="price-val">
                    {{ mongoBilling && mongoBilling.available ? '$' + mongoBilling.totalCost.toFixed(2) : '—' }}
                    <span v-if="mongoBilling && mongoBilling.stale" class="db-meta" style="margin-left:6px;opacity:0.6"> · cached</span>
                  </span>
                </div>
                <div class="price-row price-row--total">
                  <span class="price-label">Projected monthly</span>
                  <span class="price-val">${{ projectedMongoCostStr }}</span>
                </div>
              </div>
            </div>
            <div class="card price-card">
              <div class="card-head">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <h2>Other / Notes</h2><span class="card-sub">Extra costs &amp; notes</span>
              </div>
              <div class="price-card-body">
                <div class="price-row"><span class="price-label">Extra monthly</span>
                  <div class="price-stepper">
                    <button class="price-step-btn" @click="prices.googleExtra = Math.max(0, (prices.googleExtra || 0) - 1)">−</button>
                    <span class="price-step-symbol">$</span>
                    <input class="price-input" type="number" v-model.number="prices.googleExtra" min="0" step="1" placeholder="0" />
                    <button class="price-step-btn" @click="prices.googleExtra = (prices.googleExtra || 0) + 1">+</button>
                  </div>
                </div>
                <div class="price-row" style="flex-direction:column;gap:6px">
                  <span class="price-label">Notes</span>
                  <textarea class="price-textarea" v-model="prices.notes" placeholder="e.g. hosting, domain, CDN…" rows="3"></textarea>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── STAFF TAB ──────────────────────────────────────────────────── -->
        <section v-if="activeTab === 'staff'" class="tab-section">
          <div class="kpi-grid kpi-grid--4">
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
              <div class="kpi-label">Total Staff</div>
              <div class="kpi-value">{{ fmt(staffSummary.total) }}</div>
              <div class="kpi-sub">{{ fmt(staffSummary.active) }} active</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg></div>
              <div class="kpi-label">Active</div>
              <div class="kpi-value">{{ fmt(staffSummary.active) }}</div>
              <div class="kpi-sub">password set, ready</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div class="kpi-label">Awaiting first login</div>
              <div class="kpi-value">{{ fmt(staffSummary.awaiting) }}</div>
              <div class="kpi-sub">temp password unused</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></div>
              <div class="kpi-label">Revoked</div>
              <div class="kpi-value">{{ fmt(staffSummary.revoked) }}</div>
              <div class="kpi-sub">audit trail kept</div>
            </div>
          </div>

          <div class="toolbar">
            <div class="search-wrap">
              <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="staffSearch" class="search-input" placeholder="Search by email or name…" />
            </div>
            <button class="action-btn btn-accent" @click="openStaffCreate">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add staff
            </button>
          </div>

          <div class="card table-card">
            <div class="card-head">
              <h2>Staff Members</h2>
              <span class="card-sub">{{ staffFiltered.length }} {{ staffSearch ? 'matching' : 'total' }}</span>
            </div>
            <table class="data-table">
              <thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Assignment</th><th>Last active</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>
                <tr v-if="staffLoading"><td colspan="7" class="loading-cell"><div class="loader-ring loader-ring--sm"></div> Loading…</td></tr>
                <tr v-else-if="!staffFiltered.length"><td colspan="7" class="empty-cell">{{ staffSearch ? 'No staff match this search.' : 'No staff accounts yet.' }}</td></tr>
                <tr v-for="s in staffFiltered" :key="s._id" class="table-row" :style="!s.isActive ? 'opacity:0.55' : ''">
                  <td class="user-name" data-label="Email">{{ s.email }}</td>
                  <td class="dim-cell" data-label="Name">{{ s.name }}</td>
                  <td data-label="Status">
                    <span class="staff-status-pill" :class="{
                      'staff-status-pill--revoked': !s.isActive,
                      'staff-status-pill--awaiting': s.isActive && s.mustChangePassword,
                      'staff-status-pill--active': s.isActive && !s.mustChangePassword
                    }">
                      {{ !s.isActive ? 'revoked' : (s.mustChangePassword ? 'awaiting first login' : 'active') }}
                    </span>
                  </td>
                  <td class="staff-assign-cell" data-label="Assignment">
                    <div class="staff-perm-badges">
                      <span v-if="(s.staffAssignment?.permissions?.validateBusinesses ?? true)" class="staff-perm-badge staff-perm-badge--validate" title="Can validate business applications">validate</span>
                      <span v-if="s.staffAssignment?.permissions?.manageDestinations" class="staff-perm-badge staff-perm-badge--destinations" title="Can add and manage destinations">destinations</span>
                      <span v-if="s.staffAssignment?.permissions?.moderateExplore" class="staff-perm-badge staff-perm-badge--explore" title="Can hide / verify Explore-page places">explore</span>
                    </div>
                    <span v-if="!(s.staffAssignment?.countries?.length || s.staffAssignment?.cities?.length)" class="assign-empty">no scope</span>
                    <span v-else class="assign-scope">
                      <span v-if="s.staffAssignment.countries?.length" class="assign-list">
                        {{ s.staffAssignment.countries.join(', ') }}
                      </span>
                      <span v-if="s.staffAssignment.cities?.length" class="assign-list assign-list--sub">
                        · {{ s.staffAssignment.cities.join(', ') }}
                      </span>
                      <span v-if="s.staffAssignment.priorityCountries?.length || s.staffAssignment.priorityCities?.length" class="assign-priority">
                        ★ {{ [...(s.staffAssignment.priorityCountries || []), ...(s.staffAssignment.priorityCities || [])].join(', ') }}
                      </span>
                    </span>
                  </td>
                  <td class="dim-cell" data-label="Last active">{{ s.analytics?.lastActive ? relativeTime(s.analytics.lastActive) : '—' }}</td>
                  <td class="dim-cell" data-label="Created">{{ shortDate(s.createdAt) }}</td>
                  <td class="staff-actions-cell td-actions" data-label="Action">
                    <div class="action-group">
                      <button v-if="s.isActive" class="action-btn btn-muted" @click="openStaffAssign(s)" title="Edit assignment">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        Assign
                      </button>
                      <button v-if="s.isActive" class="action-btn btn-delete" @click="confirmStaffRevoke(s)" title="Revoke staff access">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                        Revoke
                      </button>
                      <span v-if="!s.isActive" class="dim-cell">—</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <!-- ── /STAFF TAB ─────────────────────────────────────────────────── -->

      </div>
    </main>

    <transition name="toast-fade">
      <div v-if="toast.visible" class="toast" :class="`toast--${toast.type}`">
        <span class="toast-icon">
          <svg v-if="toast.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </span>
        {{ toast.message }}
      </div>
    </transition>

    <!-- ── EDIT MODAL ── -->
    <transition name="modal-fade">
      <div v-if="editModal.open" class="edit-overlay" @click.self="closeEdit">
        <div class="edit-panel" :class="theme">
          <!-- Header -->
          <div class="edit-header">
            <div class="edit-header-left">
              <span class="edit-badge">{{ editModal.kind === 'business' ? 'Business' : 'Destination' }}</span>
              <h2 class="edit-title">{{ editModal.isNew ? 'Add New' : 'Edit' }} {{ editModal.kind === 'business' ? 'Business' : 'Destination' }}</h2>
            </div>
            <div class="edit-header-actions">
              <button class="edit-save-btn" :disabled="editModal.saving" @click="saveEdit">
                <svg v-if="!editModal.saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else class="loader-ring loader-ring--sm" style="width:14px;height:14px;border-width:2px"></div>
                {{ editModal.saving ? 'Saving…' : 'Save Changes' }}
              </button>
              <button class="edit-close-btn" @click="closeEdit" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Body scrollable -->
          <div class="edit-body">

            <!-- ── Image Gallery (shown first when editing an existing item) ── -->
            <section v-if="!editModal.isNew" class="edit-section edit-gallery-section">
              <div class="edit-section-title edit-gallery-title-row">
                <span>Image Gallery</span>
                <span v-if="(editModal.form.images || []).filter(u => u && u.trim()).length" class="edit-gallery-counter">
                  {{ editModal.galleryIndex + 1 }} / {{ (editModal.form.images || []).filter(u => u && u.trim()).length }}
                </span>
              </div>

              <!-- Has at least one valid image -->
              <div v-if="(editModal.form.images || []).filter(u => u && u.trim()).length" class="edit-gallery">

                <!-- Hero (large) -->
                <div class="edit-gallery-hero" @click="editModal.lightboxOpen = true">
                  <img
                    :src="(editModal.form.images || []).filter(u => u && u.trim())[Math.min(editModal.galleryIndex, (editModal.form.images || []).filter(u => u && u.trim()).length - 1)]"
                    class="edit-gallery-hero-img"
                    alt="Business image"
                    @error="e => e.target.classList.add('edit-gallery-hero-img--error')"
                  />

                  <!-- Prev / Next arrows -->
                  <button
                    v-if="(editModal.form.images || []).filter(u => u && u.trim()).length > 1"
                    class="edit-gallery-nav edit-gallery-nav--prev"
                    @click.stop="editModal.galleryIndex = (editModal.galleryIndex - 1 + (editModal.form.images || []).filter(u => u && u.trim()).length) % (editModal.form.images || []).filter(u => u && u.trim()).length"
                    title="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    v-if="(editModal.form.images || []).filter(u => u && u.trim()).length > 1"
                    class="edit-gallery-nav edit-gallery-nav--next"
                    @click.stop="editModal.galleryIndex = (editModal.galleryIndex + 1) % (editModal.form.images || []).filter(u => u && u.trim()).length"
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
                <div v-if="(editModal.form.images || []).filter(u => u && u.trim()).length > 1" class="edit-gallery-strip">
                  <button
                    v-for="(url, idx) in (editModal.form.images || []).filter(u => u && u.trim())"
                    :key="'thumb-'+idx"
                    class="edit-gallery-thumb"
                    :class="{ 'edit-gallery-thumb--active': idx === editModal.galleryIndex }"
                    @click="editModal.galleryIndex = idx"
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
                <div class="edit-gallery-empty-sub">Scroll down to the “Images” section to upload or add image URLs.</div>
              </div>
            </section>

            <!-- ── BUSINESS-only: Status banner with quick actions ── -->
            <section v-if="editModal.kind === 'business' && !editModal.isNew" class="edit-section edit-status-bar">
              <div class="edit-status-bar-left">
                <span class="edit-status-label">Status</span>
                <span class="status-pill" :class="`status-${editModal.form.status || 'pending'}`">
                  {{ editModal.form.status || 'pending' }}
                </span>
                <span v-if="editModal.form.status === 'rejected' && editModal.form.verification?.rejectionKind === 'hard'"
                      class="status-pill status-rejected status-pill--permanent" title="Permanent rejection — owner cannot resubmit">
                  permanent
                </span>
                <span v-if="editModal.form.verification?.verifiedAt" class="edit-status-meta">
                  · last action {{ shortDate(editModal.form.verification.verifiedAt) }}
                </span>
              </div>
              <div class="edit-status-actions">
                <button
                  class="edit-status-btn edit-status-btn--approve"
                  :disabled="editModal.statusBusy || editModal.form.status === 'active'"
                  @click="openStatusConfirm('approve')"
                  title="Approve and activate this listing">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Approve
                </button>
                <button
                  class="edit-status-btn edit-status-btn--freeze"
                  :disabled="editModal.statusBusy || editModal.form.status === 'frozen'"
                  @click="openStatusConfirm('freeze')"
                  title="Temporarily hide from users (reversible)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/></svg>
                  Freeze
                </button>
                <button
                  class="edit-status-btn edit-status-btn--reject"
                  :disabled="editModal.statusBusy || editModal.form.status === 'rejected'"
                  @click="openStatusConfirm('reject')"
                  title="Reject this listing — owner can fix and resubmit">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Reject
                </button>
                <button
                  class="edit-status-btn edit-status-btn--reject-permanent"
                  :disabled="editModal.statusBusy || (editModal.form.status === 'rejected' && editModal.form.verification?.rejectionKind === 'hard')"
                  @click="openStatusConfirm('reject_permanent')"
                  title="Permanently reject — owner cannot resubmit, all fingerprints blocked">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Reject permanently
                </button>
                <!-- Downgrade: only meaningful for a listing currently under a
                     PERMANENT rejection. Converts it back to a soft reject so
                     the owner can edit + resubmit. -->
                <button
                  v-if="editModal.form.status === 'rejected' && editModal.form.verification?.rejectionKind === 'hard'"
                  class="edit-status-btn edit-status-btn--downgrade"
                  :disabled="editModal.statusBusy"
                  @click="openStatusConfirm('downgrade')"
                  title="Lift the permanent rejection — owner can resubmit again">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 0 1 0 8h-1"/></svg>
                  Downgrade to soft
                </button>
                <!-- Test-only quick actions: bypass the normal moderation flow.
                     Useful for QA when you need to reset a listing back to
                     the pending queue or simulate a full zone (waitlist). -->
                <button
                  class="edit-status-btn edit-status-btn--test edit-status-btn--pending"
                  :disabled="editModal.statusBusy || editModal.form.status === 'pending'"
                  @click="openStatusConfirm('pending')"
                  title="Reset to pending (test only)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Pending
                </button>
                <button
                  class="edit-status-btn edit-status-btn--test edit-status-btn--waitlist"
                  :disabled="editModal.statusBusy || editModal.form.status === 'waitlisted'"
                  @click="openStatusConfirm('waitlist')"
                  title="Move to waitlist (test only)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Waitlist
                </button>
              </div>
            </section>

            <!-- Inline status confirm — shows below the bar so the user keeps context -->
            <section v-if="editModal.kind === 'business' && editModal.statusConfirm.action" class="edit-section edit-status-confirm">
              <div class="edit-status-confirm-title">
                {{ editModal.statusConfirm.action === 'approve'  ? 'Approve this business?'        :
                   editModal.statusConfirm.action === 'freeze'   ? 'Freeze this business?'         :
                   editModal.statusConfirm.action === 'reject'   ? 'Reject this business?'         :
                   editModal.statusConfirm.action === 'reject_permanent' ? 'Permanently reject this business?' :
                   editModal.statusConfirm.action === 'downgrade' ? 'Lift the permanent rejection?' :
                   editModal.statusConfirm.action === 'pending'  ? 'Reset to pending? (test only)' :
                                                                   'Move to waitlist? (test only)' }}
              </div>
              <div class="edit-status-confirm-help">
                {{ editModal.statusConfirm.action === 'approve'  ? 'It will become visible to users immediately. If the zone is full, it may go to the waitlist.' :
                   editModal.statusConfirm.action === 'freeze'   ? 'It will be hidden from users until you re-approve. The owner is notified by email.' :
                   editModal.statusConfirm.action === 'reject'   ? 'A rejection note (sent to the owner) is required. The owner can fix the issues and resubmit.' :
                   editModal.statusConfirm.action === 'reject_permanent' ? 'PERMANENT: the owner cannot edit or resubmit, and their email, phone, name + city, IP, and account are added to the blocklist. A note (sent to the owner) is required. Only an admin can reverse this.' :
                   editModal.statusConfirm.action === 'downgrade' ? 'Converts the permanent rejection back to a soft one so the owner can edit and resubmit. The blocklist entries created by this rejection are lifted. A note (sent to the owner) is required.' :
                   editModal.statusConfirm.action === 'pending'  ? 'Sends the listing back to the staff validation queue. The owner is NOT notified — this is for testing.' :
                                                                   'Marks the listing as waitlisted (zone-full state). The owner is NOT notified — this is for testing.' }}
              </div>
              <textarea
                class="edit-textarea"
                rows="2"
                v-model="editModal.statusConfirm.notes"
                :placeholder="(editModal.statusConfirm.action === 'reject' || editModal.statusConfirm.action === 'reject_permanent') ? 'Reason (sent to the owner)…' : editModal.statusConfirm.action === 'downgrade' ? 'Note (sent to the owner)…' : 'Optional admin note (internal)…'"></textarea>
              <div class="edit-status-confirm-actions">
                <button class="action-btn btn-muted" :disabled="editModal.statusBusy" @click="closeStatusConfirm">Cancel</button>
                <button
                  class="action-btn"
                  :class="editModal.statusConfirm.action === 'approve' ? 'btn-accent' :
                          editModal.statusConfirm.action === 'downgrade' ? 'btn-accent' :
                          (editModal.statusConfirm.action === 'reject' || editModal.statusConfirm.action === 'reject_permanent') ? 'btn-delete' :
                                                                          'btn-warning'"
                  :disabled="editModal.statusBusy || ((editModal.statusConfirm.action === 'reject' || editModal.statusConfirm.action === 'reject_permanent' || editModal.statusConfirm.action === 'downgrade') && !editModal.statusConfirm.notes.trim())"
                  @click="executeStatusAction">
                  {{ editModal.statusBusy ? 'Working…' :
                     editModal.statusConfirm.action === 'approve' ? 'Approve' :
                     editModal.statusConfirm.action === 'freeze'  ? 'Freeze'  :
                     editModal.statusConfirm.action === 'reject'  ? 'Reject'  :
                     editModal.statusConfirm.action === 'reject_permanent' ? 'Reject permanently' :
                     editModal.statusConfirm.action === 'downgrade' ? 'Downgrade to soft' :
                     editModal.statusConfirm.action === 'pending' ? 'Reset to Pending' :
                                                                    'Move to Waitlist' }}
                </button>
              </div>
            </section>

            <!-- ── SHARED: Basic Info ── -->
            <section class="edit-section">
              <div class="edit-section-title">Basic Info</div>
              <div class="edit-grid-2">
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Name *</label>
                  <input class="edit-input" v-model="editModal.form.name" placeholder="Name" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Region</label>
                  <input class="edit-input" v-model="editModal.form.location.region" placeholder="e.g. South Armenia" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">City</label>
                  <input class="edit-input" v-model="editModal.form.location.city" placeholder="City" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Country</label>
                  <input class="edit-input" v-model="editModal.form.location.country" placeholder="e.g. Armenia" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Address</label>
                  <input class="edit-input" v-model="editModal.form.location.address" placeholder="Street address" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Latitude</label>
                  <input class="edit-input" type="number" step="any" v-model.number="editModal.form.location.coordinates.lat" placeholder="40.177" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Longitude</label>
                  <input class="edit-input" type="number" step="any" v-model.number="editModal.form.location.coordinates.lng" placeholder="44.503" />
                </div>
              </div>
            </section>

            <!-- ── Location Map (shared: business + destination) ──
                 Same Nominatim geocoder used in BusinessOnboarding. As soon as
                 the admin types an address + city, the map pans there and
                 fills in lat/lng automatically. The marker is draggable so
                 the admin can fine-tune the exact pin after Nominatim returns
                 (street-level geocoding can be a few meters off).

                 Unlike the public BusinessOnboarding map, the admin edit map
                 does NOT enforce the 3-slot zone limit — admins are trusted
                 to override zone state through the moderation flow. Nearby
                 businesses are shown only as faint reference dots for
                 context, identical for both kinds. -->
            <section class="edit-section">
              <div class="edit-section-title dest-map-title-row">
                <span>Location on Map</span>
                <span class="dest-map-status" :class="`dest-map-status--${destMap.statusClass}`">{{ destMap.statusText }}</span>
              </div>
              <div class="dest-map-hint">
                Type an address and city above — the map will locate it automatically. Drag the pin to fine-tune the exact spot. Existing businesses nearby are shown as faint dots for context (no zone limits apply when editing as admin).
              </div>
              <div id="dest-map" class="dest-map"></div>
              <div class="dest-map-actions">
                <button type="button" class="action-btn btn-muted" :disabled="destMap.loading || !destMap.canSearch" @click="reGeocodeDestination">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>
                  {{ destMap.loading ? 'Searching…' : 'Re-locate from address' }}
                </button>
                <span v-if="editModal.form.location.coordinates.lat && editModal.form.location.coordinates.lng" class="dest-map-coords">
                  {{ Number(editModal.form.location.coordinates.lat).toFixed(5) }}, {{ Number(editModal.form.location.coordinates.lng).toFixed(5) }}
                </span>
              </div>
            </section>
            <section class="edit-section">
              <div class="edit-section-title">Types &amp; Tags</div>
              <div class="edit-type-grid">
                <label v-for="t in ALL_TYPES" :key="t" class="edit-type-chip" :class="{ active: editModal.form.type.includes(t) }" @click="toggleType(t)">
                  {{ t }}
                </label>
              </div>
            </section>

            <!-- ── Description ── -->
            <section class="edit-section">
              <div class="edit-section-title">Description</div>
              <div v-if="editModal.kind === 'destination'">
                <textarea class="edit-textarea edit-textarea--description" v-model="editModal.form.description" rows="7" placeholder="Describe this destination…"></textarea>
              </div>
              <div v-else>
                <!-- Single description for businesses. The schema has both
                     description.short and description.detailed for legacy reasons,
                     but onboarding writes the same text to both, so we surface
                     just one editor here and mirror it back to both fields on
                     save (see saveEdit). Falls back to short if detailed is empty. -->
                <textarea
                  class="edit-textarea edit-textarea--description"
                  rows="7"
                  :value="editModal.form.description.detailed || editModal.form.description.short || ''"
                  @input="e => { editModal.form.description.detailed = e.target.value; editModal.form.description.short = e.target.value }"
                  placeholder="Describe this business…"></textarea>
                <div class="edit-field edit-field--full" style="margin-top: 12px">
                  <label class="edit-label">Highlights <span class="edit-help-sub" style="font-weight:400">(up to 5, max 25 chars each)</span></label>
                  <div class="edit-highlights-list">
                    <div v-for="(h, idx) in editModal.form.description.highlights" :key="'biz-h-'+idx" class="edit-highlight-row">
                      <span class="edit-highlight-num">{{ idx + 1 }}</span>
                      <input
                        type="text"
                        class="edit-input edit-highlight-input"
                        :value="editModal.form.description.highlights[idx]"
                        @input="e => editModal.form.description.highlights[idx] = e.target.value"
                        :placeholder="businessHighlightPlaceholders[idx]"
                        maxlength="25" />
                      <button
                        v-if="(editModal.form.description.highlights[idx] || '').length"
                        class="edit-img-del"
                        @click="editModal.form.description.highlights[idx] = ''"
                        title="Clear highlight">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- ── Destination-only fields ── -->
            <template v-if="editModal.kind === 'destination'">
              <section class="edit-section">
                <div class="edit-section-title">Extra Details</div>
                <div class="edit-grid-2">
                  <div class="edit-field">
                    <label class="edit-label">Best Time to Visit</label>
                    <input class="edit-input" v-model="editModal.form.bestTimeToVisit" placeholder="e.g. April–June" />
                  </div>
                  <div class="edit-field">
                    <label class="edit-label">Popularity (0–100)</label>
                    <input class="edit-input" type="number" min="0" max="100" v-model.number="editModal.form.popularity" />
                  </div>
                  <!-- Hidden Gem flag is now derived from the 'hidden_gems'
                       chip in Types & Tags (see saveEdit), and Active is
                       controlled from the destination table's Deactivate
                       / Activate button. The redundant toggles that used to
                       live here have been removed to keep the form lean. -->
                </div>
              </section>
            </template>

            <!-- ── Contact (shared: business + destination) ──
                 Same shape on both forms. Booking.com is rarely useful for a
                 destination (it's a hotel-listing site) but we leave it in
                 since some destination types (resorts, ski lodges) overlap. -->
            <section class="edit-section">
              <div class="edit-section-title">Contact</div>
              <div class="edit-grid-2">
                <div class="edit-field">
                  <label class="edit-label">Email</label>
                  <div class="edit-input-wrap">
                    <input class="edit-input edit-input--with-trailing" v-model="editModal.form.contact.email" placeholder="info@example.com" />
                    <button
                      type="button"
                      class="edit-input-icon-btn"
                      :class="{ 'edit-input-icon-btn--on': editModal.form.contact.showEmail }"
                      @click="editModal.form.contact.showEmail = !editModal.form.contact.showEmail"
                      :title="editModal.form.contact.showEmail ? 'Email is shown publicly — click to hide' : 'Email is hidden — click to show publicly'">
                      <svg v-if="editModal.form.contact.showEmail" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="edit-field">
                  <label class="edit-label">Phone</label>
                  <!-- Phone input matches BusinessOnboarding.vue: a fixed "+"
                       prefix decoration outside the field, and the model
                       carries digits + spaces only. The admin doesn't type
                       the plus. Placeholder uses the US country code (1) as
                       a neutral default; admins working in any region will
                       overwrite it anyway. The actual stored value is
                       re-prefixed with "+" on save (see saveEdit). -->
                  <div class="edit-phone-wrap">
                    <span class="edit-phone-prefix">+</span>
                    <input
                      class="edit-input edit-phone-input"
                      type="text"
                      inputmode="numeric"
                      v-model="editModal.form.contact.phone"
                      placeholder="1 212 555 0100"
                      maxlength="20"
                      @input="editModal.form.contact.phone = $event.target.value.replace(/[^0-9\s]/g, '')" />
                  </div>
                </div>
                <div class="edit-field">
                  <label class="edit-label">Website</label>
                  <input class="edit-input" v-model="editModal.form.contact.website" placeholder="https://…" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Facebook</label>
                  <input class="edit-input" v-model="editModal.form.contact.socialMedia.facebook" placeholder="https://facebook.com/…" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Instagram</label>
                  <input class="edit-input" v-model="editModal.form.contact.socialMedia.instagram" placeholder="https://instagram.com/…" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">TripAdvisor</label>
                  <input class="edit-input" v-model="editModal.form.contact.socialMedia.tripadvisor" placeholder="https://tripadvisor.com/…" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Booking.com</label>
                  <input class="edit-input" v-model="editModal.form.contact.socialMedia.booking" placeholder="https://booking.com/hotel/…" />
                </div>
              </div>
            </section>

            <!-- ── Opening Hours (shared: business + destination) ──
                 Destinations like museums and parks have opening hours too;
                 always-open sites use the 24/7 toggle. Same field shape and
                 same UI as a business form.

                 For event listings this same block doubles as the weekly
                 recurrence grid: a recurring event's running days/times live
                 here, so the title switches to "Weekly Schedule" and a hint
                 clarifies the relationship to the Event Schedule section. -->
            <section class="edit-section">
              <div class="edit-section-title">
                {{ editModal.kind === 'business'
                    && editModal.form.type.includes('events')
                    && editModal.form.eventSchedule.isRecurring
                   ? 'Weekly Schedule' : 'Opening Hours' }}
              </div>
              <div
                v-if="editModal.kind === 'business' && editModal.form.type.includes('events')"
                class="edit-help-sub"
                style="margin-top:-4px;margin-bottom:8px">
                <template v-if="editModal.form.eventSchedule.isRecurring">
                  Mark the days this recurring event runs and the time on each day.
                </template>
                <template v-else>
                  This is a one-time / multi-day event — its date and time are set in the Event Schedule section below. Weekly hours here are not used unless you switch it to "Repeats weekly".
                </template>
              </div>
              <div class="edit-field" style="margin-bottom: 12px">
                <label class="edit-label">Availability</label>
                <button
                  type="button"
                  class="edit-free-btn"
                  :class="{ 'edit-free-btn--active': editModal.form.openingHours.is24Hours }"
                  @click="editModal.form.openingHours.is24Hours = !editModal.form.openingHours.is24Hours">
                  <svg v-if="editModal.form.openingHours.is24Hours" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                  Open 24/7
                </button>
                <span class="edit-help-sub">Click if this place is open around the clock — per-day hours below will be hidden.</span>
              </div>
              <div v-if="!editModal.form.openingHours.is24Hours" class="edit-hours-list">
                <div v-for="(d, idx) in editModal.form.openingHours.days" :key="d.day" class="edit-hours-row">
                  <span class="edit-hours-day">{{ d.day }}</span>
                  <div class="edit-hours-pills">
                    <button type="button" class="edit-hours-pill" :class="{ 'edit-hours-pill--active': !d.closed }" @click="d.closed = false">Open</button>
                    <button type="button" class="edit-hours-pill edit-hours-pill--close" :class="{ 'edit-hours-pill--active': d.closed }" @click="d.closed = true">Closed</button>
                  </div>
                  <input v-if="!d.closed" type="time" v-model="d.open"  class="edit-hours-time" />
                  <span  v-if="!d.closed" class="edit-hours-sep">–</span>
                  <input v-if="!d.closed" type="time" v-model="d.close" class="edit-hours-time" />
                  <span  v-else class="edit-hours-closed-text">Closed all day</span>
                </div>
              </div>
              <div v-else class="edit-help-sub">This place is open 24 hours a day, every day.</div>
            </section>

            <!-- ── Destination authorship (shown when editing — read-only) ── -->
            <section v-if="editModal.kind === 'destination' && !editModal.isNew && editModal.form.createdBy" class="edit-section">
              <div class="edit-section-title">Authorship</div>
              <div class="edit-help-sub">
                Added by
                <strong>{{ verifierLabel(editModal.form.createdBy) }}</strong>
              </div>
            </section>

            <!-- ── Pricing (shared: business + destination) ──
                 Same schema shape on both kinds (isFree + min/max/average +
                 currency). For destinations this captures entry fees:
                 free for parks/squares, a flat number for many museums, a
                 range for tour-based sites. -->
            <section class="edit-section">
              <div class="edit-section-title">Pricing</div>
              <!-- Free button. Click to toggle. When turned ON we clear
                   min/max/average so we don't ship stale numbers to the
                   backend. When turned OFF we leave the cleared fields
                   blank — admin can re-enter. -->
              <div class="edit-field" style="margin-bottom: 12px">
                <label class="edit-label">Pricing Type</label>
                <button
                  type="button"
                  class="edit-free-btn"
                  :class="{ 'edit-free-btn--active': editModal.form.pricing.isFree }"
                  @click="() => {
                    const next = !editModal.form.pricing.isFree;
                    editModal.form.pricing.isFree = next;
                    if (next) {
                      editModal.form.pricing.min = null;
                      editModal.form.pricing.max = null;
                      editModal.form.pricing.average = null;
                    }
                  }">
                  <svg v-if="editModal.form.pricing.isFree" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
                  Free
                </button>
                <span class="edit-help-sub">{{ editModal.kind === 'destination' ? 'Click if entry to this destination is free — min / max / average will be cleared.' : 'Click if entry / service is free — min / max / average will be cleared.' }}</span>
              </div>
              <!-- Currency picker as a compact chip group (wraps if needed,
                   each chip a self-contained pill). Disabled when Free. -->
              <div class="edit-field" style="margin-bottom: 12px">
                <label class="edit-label">Currency</label>
                <div class="edit-currency-chips" :class="{ 'edit-currency-chips--disabled': editModal.form.pricing.isFree }">
                  <button
                    v-for="cur in PRICING_CURRENCIES"
                    :key="cur"
                    type="button"
                    class="edit-currency-chip"
                    :class="{ 'edit-currency-chip--active': editModal.form.pricing.currency === cur }"
                    :disabled="editModal.form.pricing.isFree"
                    @click="editModal.form.pricing.currency = cur">
                    {{ cur }}
                  </button>
                </div>
              </div>
              <div class="edit-grid-2">
                <div class="edit-field">
                  <label class="edit-label">Min Price</label>
                  <input class="edit-input" type="number" min="0" v-model.number="editModal.form.pricing.min" :disabled="editModal.form.pricing.isFree" placeholder="e.g. 10" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Max Price</label>
                  <input class="edit-input" type="number" min="0" v-model.number="editModal.form.pricing.max" :disabled="editModal.form.pricing.isFree" placeholder="e.g. 60" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Average Price</label>
                  <input class="edit-input" type="number" min="0" v-model.number="editModal.form.pricing.average" :disabled="editModal.form.pricing.isFree" placeholder="e.g. 25" />
                </div>
              </div>
            </section>

            <!-- ── Business-only fields (continued) ── -->
            <template v-if="editModal.kind === 'business'">

              <!-- ── Event Schedule (only when type includes 'events') ──
                   Events differ from restaurants/hotels: instead of fixed
                   weekly opening hours they have either a specific date+time
                   (one-time or multi-day) OR they repeat on a weekly cycle.
                   The "Repeats weekly" toggle switches between the two modes.
                   Times are kept separate from dates so the time-of-day an
                   organiser set during onboarding is visible and editable —
                   the old date-only inputs silently discarded it. -->
              <section v-if="editModal.form.type.includes('events')" class="edit-section">
                <div class="edit-section-title">Event Schedule</div>

                <!-- Current schedule, read-only — lets the admin see the
                     event day/time at a glance before touching anything. -->
                <div class="edit-event-summary">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>{{ eventScheduleSummary(editModal.form.eventSchedule) }}</span>
                </div>

                <!-- Mode picker: one-time/multi-day vs repeats weekly. -->
                <div class="edit-field" style="margin-bottom: 4px">
                  <label class="edit-label">Schedule Type</label>
                  <div class="edit-event-mode">
                    <button
                      type="button"
                      class="edit-event-mode-btn"
                      :class="{ 'edit-event-mode-btn--active': !editModal.form.eventSchedule.isRecurring }"
                      @click="editModal.form.eventSchedule.isRecurring = false">
                      One-time / multi-day
                    </button>
                    <button
                      type="button"
                      class="edit-event-mode-btn"
                      :class="{ 'edit-event-mode-btn--active': editModal.form.eventSchedule.isRecurring }"
                      @click="editModal.form.eventSchedule.isRecurring = true">
                      Repeats weekly
                    </button>
                  </div>
                  <span class="edit-help-sub">
                    {{ editModal.form.eventSchedule.isRecurring
                        ? 'This event runs on a weekly cycle — set the days and times in the Opening Hours section above.'
                        : 'This event happens on a specific date. Add an end date if it spans multiple days; leave a time empty if it runs all day.' }}
                  </span>
                </div>

                <!-- One-time / multi-day: explicit date + time per bound. -->
                <template v-if="!editModal.form.eventSchedule.isRecurring">
                  <!-- Event timezone. Auto-derived from the venue address on
                       registration; editable here in case geocoding placed the
                       pin just across a timezone border. The date/time fields
                       below are interpreted in THIS zone, so changing it keeps
                       the same wall-clock numbers and re-anchors them. -->
                  <div class="edit-event-block">
                    <div class="edit-event-block-label">Timezone</div>
                    <div class="edit-field">
                      <select class="edit-input" v-model="editModal.form.eventSchedule.timezone">
                        <option v-for="tz in eventTimezoneOptions" :key="tz" :value="tz">
                          {{ tz.replace(/_/g, ' ') }}
                        </option>
                      </select>
                      <span class="edit-help-sub">
                        Event times are shown and stored in this timezone. Auto-set from the address — change it only if it's wrong.
                      </span>
                    </div>
                  </div>
                  <div class="edit-event-block">
                    <div class="edit-event-block-label">
                      Starts
                      <span v-if="editModal.form.eventSchedule.timezone" class="edit-event-optional">
                        {{ tzShortLabel(editModal.form.eventSchedule.timezone) }} time
                      </span>
                    </div>
                    <div class="edit-grid-2">
                      <div class="edit-field">
                        <label class="edit-label">Start Date</label>
                        <input class="edit-input" type="date" v-model="editModal.form.eventSchedule.startDate" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Start Time</label>
                        <input class="edit-input" type="time" v-model="editModal.form.eventSchedule.startTime" />
                      </div>
                    </div>
                  </div>
                  <div class="edit-event-block">
                    <div class="edit-event-block-label">Ends <span class="edit-event-optional">optional</span></div>
                    <div class="edit-grid-2">
                      <div class="edit-field">
                        <label class="edit-label">End Date</label>
                        <input class="edit-input" type="date" v-model="editModal.form.eventSchedule.endDate" :min="editModal.form.eventSchedule.startDate || ''" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">End Time</label>
                        <input class="edit-input" type="time" v-model="editModal.form.eventSchedule.endTime" />
                      </div>
                    </div>
                    <span class="edit-help-sub">Leave the end date empty for a single-day event. An end time on its own is treated as the close time on the start date.</span>
                  </div>
                </template>

                <!-- Repeats weekly: the weekly grid lives in Opening Hours. -->
                <div v-else class="edit-event-recurring-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  <span>This event repeats every week. Its running days and times are set in the <strong>Opening Hours</strong> section above.</span>
                </div>
              </section>

              <section class="edit-section">
                <div class="edit-section-title">Partnership</div>
                <!-- Tier picker as three buttons. Each carries the brand colour
                     used elsewhere for that tier (gold for Signature, blue for
                     Spotlight, neutral for Verified). One click → one save. -->
                <div class="edit-field" style="margin-bottom: 12px">
                  <label class="edit-label">Tier</label>
                  <div class="edit-tier-group">
                    <button
                      v-for="t in PARTNERSHIP_TIERS"
                      :key="t.value"
                      type="button"
                      class="edit-tier-btn"
                      :class="[`edit-tier-btn--${t.value}`, { 'edit-tier-btn--active': editModal.form.partnership.tier === t.value }]"
                      @click="editModal.form.partnership.tier = t.value">
                      <span class="edit-tier-btn-label">{{ t.label }}</span>
                      <span v-if="t.fee" class="edit-tier-btn-fee">${{ t.fee }}/mo</span>
                      <span v-else class="edit-tier-btn-fee">Free</span>
                    </button>
                  </div>
                </div>
                <div class="edit-grid-2">
                  <div class="edit-field">
                    <label class="edit-label">Monthly Fee ($)</label>
                    <input class="edit-input" type="number" v-model.number="editModal.form.partnership.monthlyFee" placeholder="0" />
                  </div>
                  <div class="edit-field">
                    <label class="edit-label">Priority Score</label>
                    <input class="edit-input" type="number" v-model.number="editModal.form.partnership.priorityScore" placeholder="1" />
                  </div>
                  <div v-if="editModal.form.auction && editModal.form.auction.isBidding" class="edit-field edit-field--full">
                    <label class="edit-label">Auction bid <span class="edit-help-sub" style="font-weight:400">(read-only · set via Zone Auction)</span></label>
                    <div class="edit-readonly-value">
                      <span><strong>${{ editModal.form.auction.maxBid ?? '—' }}/mo</strong> — standing bid for zone
                      <span class="mono-sm">{{ editModal.form.auction.targetZoneKey || '—' }}</span>.
                      Monthly fee updates to this if it wins (floor $49).</span>
                    </div>
                  </div>
                  <div v-if="editModal.form.auction && editModal.form.auction.wonAtPrice != null" class="edit-field edit-field--full">
                    <label class="edit-label">Won at <span class="edit-help-sub" style="font-weight:400">(read-only)</span></label>
                    <div class="edit-readonly-value">
                      <span><strong>${{ editModal.form.auction.wonAtPrice }}/mo</strong><template v-if="editModal.form.auction.awaitingApprovalSince"> — slot reserved, awaiting verification</template></span>
                    </div>
                  </div>
                  <div class="edit-field">
                    <label class="edit-label">Subscription Start</label>
                    <input class="edit-input" type="date" :value="editModal.form.partnership.subscriptionStart ? String(editModal.form.partnership.subscriptionStart).slice(0,10) : ''" @input="e => editModal.form.partnership.subscriptionStart = e.target.value" />
                  </div>
                  <div class="edit-field">
                    <label class="edit-label">Subscription End</label>
                    <input class="edit-input" type="date" :value="editModal.form.partnership.subscriptionEnd ? String(editModal.form.partnership.subscriptionEnd).slice(0,10) : ''" @input="e => editModal.form.partnership.subscriptionEnd = e.target.value" />
                  </div>
                </div>
                <!-- Hidden Gem & Active toggles intentionally removed from this
                     section (per admin design feedback). The hidden-gem flag
                     is now driven by the 'hidden_gems' chip in Types & Tags
                     (auto-synced on save in saveEdit), and Active is toggled
                     from the table row's Activate/Deactivate button. -->
              </section>

              <!-- ── Verification (admin can override staff) ── -->
              <section class="edit-section">
                <div class="edit-section-title">Verification</div>
                <div class="edit-grid-2">
                  <!-- AI Score is computed by the AI verification pipeline, so
                       it's read-only here. Admins can re-trigger the pipeline
                       elsewhere; they shouldn't hand-edit a generated number. -->
                  <div class="edit-field">
                    <label class="edit-label">AI Score</label>
                    <div class="edit-readonly-value">
                      <span v-if="editModal.form.verification.aiScore != null">{{ editModal.form.verification.aiScore }}/100</span>
                      <span v-else class="edit-readonly-empty">Not yet scored</span>
                    </div>
                  </div>
                  <!-- Verified by / at: shows who acted on this listing and when.
                       Pulls from verification.verifiedBy (populated User ref) and
                       verification.verifiedAt. If neither exists, the listing
                       hasn't been moderated yet. -->
                  <div class="edit-field">
                    <label class="edit-label">Last Verified</label>
                    <div class="edit-readonly-value">
                      <template v-if="editModal.form.verification.verifiedBy || editModal.form.verification.verifiedAt">
                        <div class="edit-verified-by">
                          <span class="edit-verified-name">{{ verifierLabel(editModal.form.verification.verifiedBy) }}</span>
                          <span v-if="editModal.form.verification.verifiedAction"
                                class="edit-history-action"
                                :class="`status-${editModal.form.verification.verifiedAction === 'approved' ? 'active' : 'rejected'}`">
                            {{ editModal.form.verification.verifiedAction }}
                          </span>
                        </div>
                        <div v-if="editModal.form.verification.verifiedAt" class="edit-verified-at">
                          {{ shortDate(editModal.form.verification.verifiedAt) }} · {{ relativeTime(editModal.form.verification.verifiedAt) }}
                        </div>
                      </template>
                      <span v-else class="edit-readonly-empty">Never verified</span>
                    </div>
                  </div>
                  <div class="edit-field edit-field--full">
                    <label class="edit-label">AI Notes</label>
                    <textarea class="edit-textarea" rows="2" v-autosize v-model="editModal.form.verification.aiNotes" placeholder="AI-generated notes about this listing…"></textarea>
                  </div>
                  <div class="edit-field edit-field--full">
                    <label class="edit-label">Staff Notes</label>
                    <textarea class="edit-textarea" rows="2" v-autosize v-model="editModal.form.verification.staffNotes" placeholder="Notes from staff or admin override…"></textarea>
                  </div>
                </div>
                <!-- History audit trail (read-only). Now also surfaces the
                     verifier's name/email/role when populated. -->
                <div v-if="(editModal.form.verification.history || []).length" class="edit-history-list">
                  <div class="edit-section-title edit-section-title--sub">Audit trail</div>
                  <div v-for="(h, i) in [...editModal.form.verification.history].reverse()" :key="i" class="edit-history-item">
                    <span class="edit-history-action" :class="`status-${h.action === 'approved' ? 'active' : h.action === 'rejected' ? 'rejected' : 'frozen'}`">{{ h.action }}</span>
                    <span class="edit-history-meta">
                      {{ shortDate(h.at) }}
                      <span v-if="h.by">· {{ verifierLabel(h.by) }}</span>
                      <span v-else-if="h.byRole">· {{ h.byRole }}</span>
                    </span>
                    <p v-if="h.notes" class="edit-history-notes">{{ h.notes }}</p>
                  </div>
                </div>
              </section>
            </template>

            <!-- ── Analytics (shared: business + destination) ──
                 Both kinds share the same analytics shape now (views, clicks,
                 conversions, weekly snapshots, performance score), so the same
                 panel renders for both. Hidden for newly-created items since
                 every number would be zero — not useful and visually noisy.
                 The Conversion Channels row uses optional chaining on
                 contact.socialMedia, so it's safe for destinations that
                 haven't filled those in. -->
            <section v-if="!editModal.isNew" class="edit-section">
              <div class="edit-section-title">Analytics</div>

              <!-- A. HEALTH HERO — the four numbers that answer
                   "is this listing healthy right now?" -->
                <div class="edit-an-hero">
                  <div class="edit-an-hero-score">
                    <div class="edit-an-hero-score-ring"
                         :style="{ '--score-deg': (editPerformanceScore * 3.6) + 'deg' }"
                         :class="editPerformanceScore >= 70 ? 'is-good' : editPerformanceScore >= 40 ? 'is-mid' : 'is-low'">
                      <div class="edit-an-hero-score-inner">
                        <div class="edit-an-hero-score-val">{{ editPerformanceScore }}</div>
                        <div class="edit-an-hero-score-sub">/ 100</div>
                      </div>
                    </div>
                    <div class="edit-an-hero-score-label">Performance score</div>
                  </div>
                  <div class="edit-an-hero-tiles">
                    <div class="edit-an-hero-tile">
                      <div class="edit-an-hero-tile-label">Views</div>
                      <div class="edit-an-hero-tile-val">{{ fmt(editAnalytics.views) }}</div>
                    </div>
                    <div class="edit-an-hero-tile">
                      <div class="edit-an-hero-tile-label">Conversion rate</div>
                      <div class="edit-an-hero-tile-val">{{ fmtPct(editConversionRate) }}</div>
                      <div class="edit-an-hero-tile-hint">clicks ÷ views</div>
                    </div>
                    <div class="edit-an-hero-tile">
                      <div class="edit-an-hero-tile-label">Engagement rate</div>
                      <div class="edit-an-hero-tile-val">{{ fmtPct(editEngagementRate) }}</div>
                      <div class="edit-an-hero-tile-hint">saves + asks + img ÷ views</div>
                    </div>
                    <div class="edit-an-hero-tile">
                      <div class="edit-an-hero-tile-label">Total clicks</div>
                      <div class="edit-an-hero-tile-val">{{ fmt(editAnalytics.clicks) }}</div>
                    </div>
                  </div>
                </div>

                <!-- B. SCORE BREAKDOWN — same 4 pillars business owner sees -->
                <div class="edit-an-subsection">
                  <div class="edit-an-subsection-title">Score breakdown</div>
                  <div class="edit-an-pillars">
                    <div class="edit-an-pillar">
                      <div class="edit-an-pillar-head">
                        <span class="edit-an-pillar-label">Recent Activity <span class="edit-an-pillar-weight">30%</span></span>
                        <span class="edit-an-pillar-val">{{ editScoreBreakdown.recentActivity }}</span>
                      </div>
                      <div class="edit-an-pillar-bar"><div class="edit-an-pillar-fill" :style="{ width: editScoreBreakdown.recentActivity + '%' }"></div></div>
                    </div>
                    <div class="edit-an-pillar">
                      <div class="edit-an-pillar-head">
                        <span class="edit-an-pillar-label">Engagement Quality <span class="edit-an-pillar-weight">25%</span></span>
                        <span class="edit-an-pillar-val">{{ editScoreBreakdown.engagement }}</span>
                      </div>
                      <div class="edit-an-pillar-bar"><div class="edit-an-pillar-fill" :style="{ width: editScoreBreakdown.engagement + '%' }"></div></div>
                    </div>
                    <div class="edit-an-pillar">
                      <div class="edit-an-pillar-head">
                        <span class="edit-an-pillar-label">Conversion Actions <span class="edit-an-pillar-weight">30%</span></span>
                        <span class="edit-an-pillar-val">{{ editScoreBreakdown.conversions }}</span>
                      </div>
                      <div class="edit-an-pillar-bar"><div class="edit-an-pillar-fill" :style="{ width: editScoreBreakdown.conversions + '%' }"></div></div>
                    </div>
                    <div class="edit-an-pillar">
                      <div class="edit-an-pillar-head">
                        <span class="edit-an-pillar-label">Profile Completeness <span class="edit-an-pillar-weight">15%</span></span>
                        <span class="edit-an-pillar-val">{{ editScoreBreakdown.completeness }}</span>
                      </div>
                      <div class="edit-an-pillar-bar"><div class="edit-an-pillar-fill" :style="{ width: editScoreBreakdown.completeness + '%' }"></div></div>
                    </div>
                  </div>
                  <div v-if="editAnalytics.performanceUpdatedAt" class="edit-help-sub" style="margin-top: 6px">
                    Last recalculated {{ shortDate(editAnalytics.performanceUpdatedAt) }}
                  </div>
                </div>

                <!-- C. TRAFFIC TREND — weekly views + clicks together -->
                <div v-if="(editAnalytics.weeklyViews || []).length || (editAnalytics.weeklyClicks || []).length" class="edit-an-subsection">
                  <div class="edit-an-subsection-title">Weekly traffic</div>
                  <div class="edit-an-trend">
                    <div class="edit-an-trend-legend">
                      <span class="edit-an-trend-legend-item"><span class="edit-an-trend-dot edit-an-trend-dot--views"></span>Views</span>
                      <span class="edit-an-trend-legend-item"><span class="edit-an-trend-dot edit-an-trend-dot--clicks"></span>Clicks</span>
                    </div>
                    <div class="edit-an-trend-bars">
                      <div
                        v-for="(v, i) in (editAnalytics.weeklyViews || [])"
                        :key="'wv'+i"
                        class="edit-an-trend-col"
                        :title="`Week -${(editAnalytics.weeklyViews || []).length - i}: ${v} views, ${(editAnalytics.weeklyClicks || [])[i] || 0} clicks`">
                        <div class="edit-an-trend-bar edit-an-trend-bar--views" :style="{ height: Math.max(2, (v / editWeeklyMax) * 100) + '%' }"></div>
                        <div class="edit-an-trend-bar edit-an-trend-bar--clicks" :style="{ height: Math.max(0, ((editAnalytics.weeklyClicks || [])[i] || 0) / editWeeklyMax * 100) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- D. CONVERSION CHANNELS — sorted bars, greys out unconfigured -->
                <div class="edit-an-subsection">
                  <div class="edit-an-subsection-title">Conversion actions</div>
                  <div class="edit-an-conv">
                    <div
                      v-for="row in editConversionChannels"
                      :key="row.key"
                      class="edit-an-conv-row"
                      :class="{ 'edit-an-conv-row--disabled': !row.has }">
                      <span class="edit-an-conv-label">
                        {{ row.label }}
                        <span v-if="!row.has" class="edit-an-conv-na">· not configured</span>
                      </span>
                      <div class="edit-an-conv-bar-wrap">
                        <div class="edit-an-conv-bar" :class="'edit-an-conv-bar--' + row.color" :style="{ width: row.has ? row.pct + '%' : 0 }"></div>
                      </div>
                      <span class="edit-an-conv-count">{{ row.has ? fmt(row.count) : '—' }}</span>
                    </div>
                  </div>
                </div>

                <!-- E. ENGAGEMENT BREAKDOWN -->
                <div class="edit-an-subsection">
                  <div class="edit-an-subsection-title">Engagement</div>
                  <div class="edit-an-eng-grid">
                    <div class="edit-stat"><span class="edit-stat-label">Saves</span><span class="edit-stat-val">{{ fmt(editAnalytics.saves) }}</span></div>
                    <div class="edit-stat"><span class="edit-stat-label">AI Asks</span><span class="edit-stat-val">{{ fmt(editAnalytics.aiAsk) }}</span></div>
                    <div class="edit-stat"><span class="edit-stat-label">More Images</span><span class="edit-stat-val">{{ fmt(editAnalytics.moreImages) }}</span></div>
                    <div class="edit-stat"><span class="edit-stat-label">Shares</span><span class="edit-stat-val">{{ fmt(editAnalytics.shares) }}</span></div>
                    <div class="edit-stat edit-stat--double">
                      <span class="edit-stat-label">Like ratio</span>
                      <span class="edit-stat-val">
                        <template v-if="editLikeRatio !== null">{{ fmtPct(editLikeRatio) }}</template>
                        <template v-else>—</template>
                      </span>
                      <span class="edit-an-likebar-wrap">
                        <span class="edit-an-likebar-like" :style="{ width: (editLikeRatio || 0) + '%' }"></span>
                        <span class="edit-an-likebar-dislike" :style="{ width: (100 - (editLikeRatio || 0)) + '%' }"></span>
                      </span>
                      <span class="edit-an-likebar-counts">
                        <span class="edit-an-likebar-count-like">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L15 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                          {{ fmt(editAnalytics.likes) }}
                        </span>
                        <span class="edit-an-likebar-count-dislike">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L9 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>
                          {{ fmt(editAnalytics.dislikes) }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- F. REVENUE & CROSS-INTERACTIONS -->
                <div v-if="editAnalytics.revenue || editAnalytics.crossInteractions != null" class="edit-an-subsection">
                  <div class="edit-an-subsection-title">Revenue impact</div>
                  <div class="edit-an-rev-grid">
                    <div class="edit-an-rev-tile">
                      <div class="edit-an-rev-label">Est. revenue attributed</div>
                      <div class="edit-an-rev-val">${{ fmt(editAnalytics.revenue || 0) }}</div>
                      <div v-if="!editAnalytics.revenue" class="edit-an-rev-hint">Grows as users click contact links</div>
                    </div>
                    <div class="edit-an-rev-tile">
                      <div class="edit-an-rev-label">Cross-zone interactions</div>
                      <div class="edit-an-rev-val">{{ fmt(editAnalytics.crossInteractions || 0) }}</div>
                      <div v-if="!editAnalytics.crossInteractions" class="edit-an-rev-hint">Users who also visited other listings in this zone</div>
                    </div>
                    <div v-if="editAnalytics.conversions" class="edit-an-rev-tile">
                      <div class="edit-an-rev-label">Conversions</div>
                      <div class="edit-an-rev-val">{{ fmt(editAnalytics.conversions) }}</div>
                    </div>
                  </div>
                </div>
              </section>

            <!-- ── Images (shared: business + destination) ── -->
            <section class="edit-section">
              <div class="edit-section-title">Images</div>
              <div class="edit-img-list">

                <!-- Existing image rows -->
                <div v-for="(url, idx) in editModal.form.images" :key="idx" class="edit-img-row">
                  <div class="edit-img-thumb-wrap">
                    <img v-if="url" :src="url" class="edit-img-thumb" @error="e=>e.target.style.display='none'" />
                    <div v-else class="edit-img-thumb-empty">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  </div>
                  <input class="edit-input edit-img-input" v-model="editModal.form.images[idx]" placeholder="https://… or uploaded below" />
                  <button class="edit-img-del" @click="editModal.form.images.splice(idx,1)" title="Remove image">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <!-- Upload drop zone -->
                <div
                  class="edit-dropzone"
                  :class="{ 'is-dragging': editModal.isDragging }"
                  @dragenter.prevent="editModal.isDragging=true"
                  @dragover.prevent="editModal.isDragging=true"
                  @dragleave.prevent="editModal.isDragging=false"
                  @drop.prevent="onImageDrop($event)"
                  @click="$refs.imgFileInput.click()"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <div class="edit-dropzone-text">
                    <span class="edit-dropzone-main">Drop images here or <span class="edit-dropzone-link">browse files</span></span>
                    <span class="edit-dropzone-sub">JPG, PNG, WebP · Max 5 MB each · Stored as base64</span>
                  </div>
                  <input ref="imgFileInput" type="file" accept="image/*" multiple class="edit-file-hidden" @change="onImageFileSelect($event)" />
                </div>

                <!-- Upload progress items -->
                <div v-for="(up, idx) in editModal.uploads" :key="'up'+idx" class="edit-upload-progress">
                  <div class="edit-img-thumb-wrap">
                    <img v-if="up.preview" :src="up.preview" class="edit-img-thumb" />
                  </div>
                  <div class="edit-upload-info">
                    <span class="edit-upload-name">{{ up.name }}</span>
                    <div class="edit-upload-bar-wrap">
                      <div class="edit-upload-bar">
                        <div class="edit-upload-fill" :style="{ width: up.progress + '%' }" :class="{ 'edit-upload-fill--done': up.progress === 100, 'edit-upload-fill--error': up.error }"></div>
                      </div>
                      <span class="edit-upload-pct">{{ up.error ? 'Error' : up.progress === 100 ? 'Done' : up.progress + '%' }}</span>
                    </div>
                  </div>
                  <button v-if="up.error || up.progress === 100" class="edit-img-del" @click="editModal.uploads.splice(idx,1)" title="Dismiss">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <!-- Add URL manually -->
                <button class="edit-add-img-btn" @click="editModal.form.images.push('')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add URL manually
                </button>
              </div>
            </section>

          </div><!-- /edit-body -->
        </div><!-- /edit-panel -->

        <!-- ── Image Lightbox ── -->
        <transition name="modal-fade">
          <div
            v-if="editModal.lightboxOpen && (editModal.form.images || []).filter(u => u && u.trim()).length"
            class="edit-lightbox"
            @click.self="editModal.lightboxOpen = false"
          >
            <button class="edit-lightbox-close" @click="editModal.lightboxOpen = false" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <button
              v-if="(editModal.form.images || []).filter(u => u && u.trim()).length > 1"
              class="edit-lightbox-nav edit-lightbox-nav--prev"
              @click.stop="editModal.galleryIndex = (editModal.galleryIndex - 1 + (editModal.form.images || []).filter(u => u && u.trim()).length) % (editModal.form.images || []).filter(u => u && u.trim()).length"
              title="Previous image"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            <img
              :src="(editModal.form.images || []).filter(u => u && u.trim())[Math.min(editModal.galleryIndex, (editModal.form.images || []).filter(u => u && u.trim()).length - 1)]"
              class="edit-lightbox-img"
              alt="Business image"
            />

            <button
              v-if="(editModal.form.images || []).filter(u => u && u.trim()).length > 1"
              class="edit-lightbox-nav edit-lightbox-nav--next"
              @click.stop="editModal.galleryIndex = (editModal.galleryIndex + 1) % (editModal.form.images || []).filter(u => u && u.trim()).length"
              title="Next image"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <div class="edit-lightbox-counter">
              {{ editModal.galleryIndex + 1 }} / {{ (editModal.form.images || []).filter(u => u && u.trim()).length }}
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── STAFF CREATE MODAL ─────────────────────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="staffModal.open" class="edit-overlay" @click.self="closeStaffCreate">
        <div class="edit-panel" :class="theme" style="max-width: 560px">
          <div class="edit-header">
            <div class="edit-header-left">
              <span class="edit-badge">Staff</span>
              <h2 class="edit-title">Add Staff Member</h2>
            </div>
            <div class="edit-header-actions">
              <button v-if="!staffModal.created" class="edit-save-btn" :disabled="staffModal.saving || !staffCanSubmit" @click="submitStaffCreate">
                <svg v-if="!staffModal.saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else class="loader-ring loader-ring--sm" style="width:14px;height:14px;border-width:2px"></div>
                {{ staffModal.saving ? 'Creating…' : 'Create' }}
              </button>
              <button class="edit-close-btn" @click="closeStaffCreate" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="edit-body">
            <section v-if="!staffModal.created" class="edit-section">
              <div class="edit-section-title">Account Details</div>
              <p style="font-size: 13px; opacity: 0.7; line-height: 1.55; margin-bottom: 14px">
                The staff member will use these credentials to log in. They'll be required to set a new password before they can validate businesses.
              </p>
              <div class="edit-grid-2">
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Email *</label>
                  <input class="edit-input" v-model="staffModal.form.email" type="email" autocomplete="off" placeholder="staff@example.com" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Name <small style="opacity:0.6">(optional)</small></label>
                  <input class="edit-input" v-model="staffModal.form.name" type="text" autocomplete="off" placeholder="Jane Doe" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Temporary password *</label>
                  <div style="display:flex; gap:8px; align-items:stretch">
                    <input class="edit-input" v-model="staffModal.form.tempPassword" :type="staffModal.showPw ? 'text' : 'password'" autocomplete="off" placeholder="Min 8 chars, with letter and number" style="flex:1" />
                    <button type="button" class="action-btn btn-muted" @click="staffModal.showPw = !staffModal.showPw">{{ staffModal.showPw ? 'Hide' : 'Show' }}</button>
                    <button type="button" class="action-btn btn-accent" @click="generateStaffPw">Generate</button>
                  </div>
                  <div v-if="staffPwError" style="color:#ef4444; font-size:12px; margin-top:6px">{{ staffPwError }}</div>
                </div>
                <div class="edit-field edit-field--full">
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px">
                    <input type="checkbox" v-model="staffModal.form.sendEmail" />
                    <span>Email credentials to staff member</span>
                  </label>
                  <small style="opacity:0.6; display:block; margin-top:4px; font-size:12px">If unchecked, you'll need to share the credentials yourself.</small>
                </div>
              </div>

              <div class="edit-section-title" style="margin-top:18px">Permissions</div>
              <p style="font-size:12.5px; opacity:0.65; line-height:1.55; margin-bottom:12px">
                What this staff member can do in the platform. At least one must be enabled. You can change these anytime.
              </p>
              <div class="staff-perms">
                <label class="staff-perm-row">
                  <input type="checkbox" v-model="staffModal.form.permissions.validateBusinesses" />
                  <span class="staff-perm-body">
                    <span class="staff-perm-title">Validate businesses</span>
                    <span class="staff-perm-sub">Review pending business applications in their assigned territory.</span>
                  </span>
                </label>
                <label class="staff-perm-row">
                  <input type="checkbox" v-model="staffModal.form.permissions.manageDestinations" />
                  <span class="staff-perm-body">
                    <span class="staff-perm-title">Manage destinations</span>
                    <span class="staff-perm-sub">Add, edit, and remove destinations (parks, museums, landmarks) inside their territory.</span>
                  </span>
                </label>
                <label class="staff-perm-row">
                  <input type="checkbox" v-model="staffModal.form.permissions.moderateExplore" />
                  <span class="staff-perm-body">
                    <span class="staff-perm-title">Moderate Explore</span>
                    <span class="staff-perm-sub">Hide low-quality places or verify good ones on the Explore page, inside their territory.</span>
                  </span>
                </label>
              </div>
              <div v-if="!staffModal.form.permissions.validateBusinesses && !staffModal.form.permissions.manageDestinations && !staffModal.form.permissions.moderateExplore"
                   style="margin-top:10px; padding:8px 12px; background:rgba(245,158,11,0.1); color:#f59e0b; border-radius:6px; font-size:12.5px">
                Pick at least one — a staff member with no permissions can't do anything.
              </div>

              <div class="edit-section-title" style="margin-top:18px">Territorial Scope</div>
              <p style="font-size:12.5px; opacity:0.65; line-height:1.55; margin-bottom:12px">
                Staff only sees pending businesses in these countries / cities. Priority items bubble to the top of their queue. You can change this anytime from the staff list.
              </p>
              <div class="edit-grid-2">
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Countries</label>
                  <input class="edit-input" v-model="staffModal.form.countriesText" type="text" autocomplete="off" placeholder="Armenia, Georgia" />
                  <small style="opacity:0.55; display:block; margin-top:4px; font-size:11.5px">Comma-separated. Leave blank to set up later — staff sees nothing until assigned.</small>
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Cities <small style="opacity:0.6">(optional, broadens scope)</small></label>
                  <input class="edit-input" v-model="staffModal.form.citiesText" type="text" autocomplete="off" placeholder="Yerevan, Tbilisi" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Priority countries <small style="opacity:0.6">(must be in countries above)</small></label>
                  <input class="edit-input" v-model="staffModal.form.priorityCountriesText" type="text" autocomplete="off" placeholder="Armenia" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Priority cities <small style="opacity:0.6">(must be in cities above)</small></label>
                  <input class="edit-input" v-model="staffModal.form.priorityCitiesText" type="text" autocomplete="off" placeholder="Yerevan" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Internal notes <small style="opacity:0.6">(visible to admins only)</small></label>
                  <input class="edit-input" v-model="staffModal.form.notes" type="text" autocomplete="off" placeholder="e.g. Caucasus region lead" />
                </div>
              </div>

              <div v-if="staffModal.error" style="margin-top:14px; padding:8px 12px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:6px; font-size:12.5px">{{ staffModal.error }}</div>
            </section>

            <section v-else class="edit-section">
              <div class="edit-section-title">Account Created</div>
              <div style="padding:14px 16px; background:rgba(76,175,80,0.08); border-radius:10px">
                <p style="margin:0 0 12px; font-size:13.5px; line-height:1.55">
                  <strong>Account is ready.</strong>
                  <span v-if="staffModal.emailSent">Credentials emailed to the staff member.</span>
                  <span v-else>Share these credentials — they will not be shown again.</span>
                </p>
                <div style="background:rgba(0,0,0,0.15); padding:10px 14px; border-radius:8px; margin-bottom:12px; font-size:13px; font-family:'DM Mono', monospace">
                  <div style="display:flex; gap:12px; padding:4px 0"><span style="opacity:0.5; min-width:75px; font-size:11px; text-transform:uppercase; letter-spacing:0.05em">Email</span><span style="word-break:break-all">{{ staffModal.created.email }}</span></div>
                  <div style="display:flex; gap:12px; padding:4px 0"><span style="opacity:0.5; min-width:75px; font-size:11px; text-transform:uppercase; letter-spacing:0.05em">Password</span><span style="word-break:break-all">{{ staffModal.created.password }}</span></div>
                </div>
                <button class="action-btn btn-accent" @click="copyStaffCreds">{{ staffModal.copied ? 'Copied!' : 'Copy both' }}</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </transition>
    <!-- ── /STAFF CREATE MODAL ────────────────────────────────────────── -->

    <!-- ── STAFF REVOKE CONFIRM MODAL ─────────────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="staffRevokeTarget" class="edit-overlay" @click.self="cancelStaffRevoke">
        <div class="edit-panel" :class="theme" style="max-width: 460px">
          <div class="edit-header">
            <div class="edit-header-left">
              <span class="edit-badge" style="background:rgba(239,68,68,0.15); color:#ef4444">Revoke</span>
              <h2 class="edit-title">Revoke staff access?</h2>
            </div>
            <button class="edit-close-btn" @click="cancelStaffRevoke">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="edit-body">
            <p style="margin:0 0 16px; line-height:1.6; font-size:14px">
              <strong>{{ staffRevokeTarget.email }}</strong> will be deactivated immediately and won't be able to validate businesses anymore. Their record stays for the audit trail.
            </p>
            <div style="display:flex; gap:10px; justify-content:flex-end">
              <button class="action-btn btn-muted" @click="cancelStaffRevoke" :disabled="staffRevokeBusy">Cancel</button>
              <button class="action-btn btn-delete" @click="executeStaffRevoke" :disabled="staffRevokeBusy">
                {{ staffRevokeBusy ? 'Revoking…' : 'Revoke' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- ── /STAFF REVOKE MODAL ────────────────────────────────────────── -->

    <!-- ── STAFF ASSIGNMENT EDIT MODAL ────────────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="staffAssignModal.open" class="edit-overlay" @click.self="closeStaffAssign">
        <div class="edit-panel" :class="theme" style="max-width: 560px">
          <div class="edit-header">
            <div class="edit-header-left">
              <span class="edit-badge">Assignment</span>
              <h2 class="edit-title">Edit staff scope</h2>
            </div>
            <div class="edit-header-actions">
              <button class="edit-save-btn" :disabled="staffAssignModal.saving" @click="submitStaffAssign">
                <svg v-if="!staffAssignModal.saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else class="loader-ring loader-ring--sm" style="width:14px;height:14px;border-width:2px"></div>
                {{ staffAssignModal.saving ? 'Saving…' : 'Save' }}
              </button>
              <button class="edit-close-btn" @click="closeStaffAssign" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="edit-body">
            <section class="edit-section">
              <p style="font-size:13px; opacity:0.7; line-height:1.55; margin:0 0 14px">
                Editing scope for <strong>{{ staffAssignModal.target?.email }}</strong>. Empty all fields to fully unassign — staff will see an empty queue.
              </p>
              <div class="edit-grid-2">
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Countries</label>
                  <input class="edit-input" v-model="staffAssignModal.form.countriesText" type="text" autocomplete="off" placeholder="Armenia, Georgia" />
                  <small style="opacity:0.55; display:block; margin-top:4px; font-size:11.5px">Comma-separated. Case-insensitive.</small>
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Cities</label>
                  <input class="edit-input" v-model="staffAssignModal.form.citiesText" type="text" autocomplete="off" placeholder="Yerevan, Tbilisi" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Priority countries <small style="opacity:0.6">(must be in countries above)</small></label>
                  <input class="edit-input" v-model="staffAssignModal.form.priorityCountriesText" type="text" autocomplete="off" placeholder="Armenia" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Priority cities <small style="opacity:0.6">(must be in cities above)</small></label>
                  <input class="edit-input" v-model="staffAssignModal.form.priorityCitiesText" type="text" autocomplete="off" placeholder="Yerevan" />
                </div>
                <div class="edit-field edit-field--full">
                  <label class="edit-label">Internal notes</label>
                  <input class="edit-input" v-model="staffAssignModal.form.notes" type="text" autocomplete="off" placeholder="e.g. Caucasus region lead" />
                </div>
              </div>

              <div class="edit-section-title" style="margin-top:18px">Permissions</div>
              <div class="staff-perms">
                <label class="staff-perm-row">
                  <input type="checkbox" v-model="staffAssignModal.form.permissions.validateBusinesses" />
                  <span class="staff-perm-body">
                    <span class="staff-perm-title">Validate businesses</span>
                    <span class="staff-perm-sub">Review pending business applications in their assigned territory.</span>
                  </span>
                </label>
                <label class="staff-perm-row">
                  <input type="checkbox" v-model="staffAssignModal.form.permissions.manageDestinations" />
                  <span class="staff-perm-body">
                    <span class="staff-perm-title">Manage destinations</span>
                    <span class="staff-perm-sub">Add, edit, and remove destinations inside their territory.</span>
                  </span>
                </label>
                <label class="staff-perm-row">
                  <input type="checkbox" v-model="staffAssignModal.form.permissions.moderateExplore" />
                  <span class="staff-perm-body">
                    <span class="staff-perm-title">Moderate Explore</span>
                    <span class="staff-perm-sub">Hide low-quality places or verify good ones on the Explore page, inside their territory.</span>
                  </span>
                </label>
              </div>
              <div v-if="!staffAssignModal.form.permissions.validateBusinesses && !staffAssignModal.form.permissions.manageDestinations && !staffAssignModal.form.permissions.moderateExplore"
                   style="margin-top:10px; padding:8px 12px; background:rgba(245,158,11,0.1); color:#f59e0b; border-radius:6px; font-size:12.5px">
                At least one permission must stay enabled.
              </div>

              <div v-if="staffAssignModal.error" style="margin-top:14px; padding:8px 12px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:6px; font-size:12.5px">{{ staffAssignModal.error }}</div>
            </section>
          </div>
        </div>
      </div>
    </transition>
    <!-- ── /STAFF ASSIGNMENT EDIT MODAL ──────────────────────────────── -->

  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const API = import.meta.env.VITE_API_URL || '/api'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, ...opts.headers }
  if (opts.body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API}/admin${path}`, { ...opts, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

function debounce(fn, ms = 400) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

export default {
  name: 'AdminDashboard',
  props: { currentUser: { type: Object, default: null } },
  directives: {
    clickOutside: {
      mounted(el, binding) { el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e) }; document.addEventListener('click', el._clickOutside) },
      unmounted(el) { document.removeEventListener('click', el._clickOutside) }
    },
    // Auto-resize a <textarea> to fit its content. Removes the user's manual
    // resize handle and grows/shrinks as the value changes (either via typing
    // or programmatic v-model updates).
    autosize: {
      mounted(el) {
        el.style.resize = 'none'
        el.style.overflow = 'hidden'
        el._autosize = () => {
          el.style.height = 'auto'
          el.style.height = el.scrollHeight + 'px'
        }
        el.addEventListener('input', el._autosize)
        // First sizing happens after the browser has laid the element out,
        // otherwise scrollHeight can be 0 inside a hidden modal.
        requestAnimationFrame(el._autosize)
      },
      updated(el) {
        // v-model may have changed the value externally (e.g. modal reopen).
        if (el._autosize) requestAnimationFrame(el._autosize)
      },
      unmounted(el) {
        if (el._autosize) el.removeEventListener('input', el._autosize)
      }
    }
  },

  setup(props) {
    const router = useRouter()
    const store = useStore()

    // Map between this component's local theme strings and the app-wide
    // settings/setPreference values consumed by App.vue's effectiveTheme watcher.
    const toAppTheme   = t => t === 'day-mode' ? 'light' : 'dark'
    const fromAppTheme = t => t === 'light'    ? 'day-mode' : 'night-mode'

    const getInitialTheme = () => {
      // Prefer the global app theme (what JinniChat / App.vue use) so Safari's
      // chrome and the admin shell agree on first paint.
      const effective = store.getters['settings/effectiveTheme']
      if (effective === 'light' || effective === 'dark') return fromAppTheme(effective)
      const saved = localStorage.getItem('adminTheme')
      if (saved) return saved
      const appTheme = localStorage.getItem('theme')
      return appTheme === 'day' ? 'day-mode' : 'night-mode'
    }
    const theme = ref(getInitialTheme())
    const toggleTheme = () => {
      theme.value = theme.value === 'night-mode' ? 'day-mode' : 'night-mode'
      localStorage.setItem('adminTheme', theme.value)
      // Mirror into the global app theme so App.vue updates <html> background
      // and <meta name="theme-color">, which is what tints Safari's chrome.
      store.dispatch('settings/setPreference', toAppTheme(theme.value))
    }

    // If the global theme changes elsewhere (e.g. user toggles in JinniChat,
    // or auto-theme flips at night), follow it so the admin stays in sync.
    watch(
      () => store.getters['settings/effectiveTheme'],
      (newAppTheme) => {
        if (!newAppTheme) return
        const mapped = fromAppTheme(newAppTheme)
        if (mapped !== theme.value) {
          theme.value = mapped
          localStorage.setItem('adminTheme', mapped)
        }
      }
    )

    // ── LOGOUT ──────────────────────────────────────────────
    const handleLogout = () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      localStorage.removeItem('adminTheme')
      router.push('/auth')
    }
    // ────────────────────────────────────────────────────────

    const loading = ref(false)
    const activeTab = ref('overview')
    const overviewData = ref(null)
    const overview = computed(() => overviewData.value?.data || {})
    const registrations = ref([])
    const users = ref([])
    const usersLoading = ref(false)
    const usersPage = ref(1)
    const usersTotalPages = ref(1)
    const userSearch = ref('')
    const userFilter = ref('all')
    const aiUsers = ref([])
    const aiLoading = ref(false)
    const aiPage = ref(1)
    const aiTotalPages = ref(1)
    const aiSummary = ref({})
    const aiDailyStats = ref([])
    const aiChartDays = ref(30)
    // ── AI provider toggle (DeepSeek ↔ Claude) ──────────────────────────────
    const aiProvider = ref({
      aiProviderChat: 'deepseek',
      aiProviderQuickAction: 'deepseek',
      claudeModel: 'claude-haiku-4-5-20251001',
      claudeWebSearch: false,
      claudeWebSearchMaxUses: 3,
      claudeWebSearchActions: ['events'],
      googlePrefetch: false,
      googlePrefetchActions: ['restaurants', 'hotels', 'shopping'],
      googlePrefetchCount: 12,
      googlePrefetchTtlMin: 1440,
      googlePrefetchLayers: [2, 3, 4],
      googlePrefetchMode: 'suggest',
      updatedAt: null,
    })
    const aiProviderLoading = ref(false)
    const aiProviderSaving = ref(false)
    const aiProviderSavedAt = ref(null)
    // Tracks whether the admin has touched the provider form. A late-arriving
    // fetch must NOT overwrite an in-progress edit (that's what caused the
    // "neighbor button stays active" flicker). applyingRemoteProvider lets us
    // apply server data without the watcher flagging it as a user edit.
    const aiProviderDirty = ref(false)
    const applyingRemoteProvider = ref(false)
    watch(aiProvider, () => {
      if (!applyingRemoteProvider.value) aiProviderDirty.value = true
    }, { deep: true })
    const applyRemoteProvider = async (data) => {
      applyingRemoteProvider.value = true
      aiProvider.value = { ...aiProvider.value, ...data }
      // claudeWebSearchActions is an explicit allowlist: whatever the backend
      // stores is exactly what the chips reflect (empty = none selected). The
      // master claudeWebSearch switch is the on/off control.
      if (!Array.isArray(aiProvider.value.claudeWebSearchActions)) {
        aiProvider.value.claudeWebSearchActions = []
      }
      await nextTick()
      applyingRemoteProvider.value = false
    }
    // Single source of truth for every segmented toggle. Replacing the whole
    // object (rather than mutating one key) guarantees a reactive re-render, so
    // the previously-selected button always deselects.
    const setProvider = (key, value) => {
      aiProvider.value = { ...aiProvider.value, [key]: value }
      aiProviderDirty.value = true
    }
    // ── Provider analytics (DeepSeek vs Claude usage/cost) ──────────────────
    const providerStats = ref({ summary: { deepseek: { tokens: 0, queries: 0, searches: 0 }, claude: { tokens: 0, queries: 0, searches: 0 } }, daily: [] })
    const providerStatsLoading = ref(false)
    const providerStatsLoaded = ref(false)
    const businesses = ref([])
    const bizLoading = ref(false)
    const bizPage = ref(1)
    const bizTotalPages = ref(1)
    const bizSearch = ref('')
    const bizLocationSearch = ref('')
    const bizPartnerFilter = ref('')
    const bizStatusFilter = ref('')
    const bizSummary = ref({})
    const places = ref([])
    const placesLoading = ref(false)
    const placesPage = ref(1)
    const placesTotalPages = ref(1)
    const placesSearch = ref('')
    const placesImageFilter = ref('')
    const placesActionFilter = ref('')   // quick-action filter (hotels, events, …)
    const placesExploreFilter = ref('')  // explore moderation filter ('', visible, hidden, verified)
    const placesExploreOpts = [
      { value: '', label: 'All' },
      { value: 'verified', label: '✓ Verified' },
      { value: 'hidden', label: 'Hidden' },
    ]
    const placesSort = ref('useCount')
    const placesSummary = ref({})
    const userLocations = ref({ byCountry: [], byCity: [], total: 0, destinations: { byCountry: [], byCity: [], total: 0 } })
    const destinations = ref([])
    const destLoading = ref(false)
    const destPage = ref(1)
    const destTotalPages = ref(1)
    const destSearch = ref('')
    const destFilter = ref('')
    const destSummary = ref({})
    const expandedTypes = ref({})
    const quickActionStats = ref({ actions: [], chatStream: { count: 0 }, quickActionTotal: 0, chatStreamTotal: 0, grandTotal: 0 })
    const prefStats = ref({})
    // Night-mode: vivid neons work on dark backgrounds
    // Day-mode: deeper, more saturated tones that stay legible on light backgrounds
    const NIGHT_PREF_COLORS = [
      'linear-gradient(90deg, #22d3ee, #0891b2)',
      'linear-gradient(90deg, #4ade80, #16a34a)',
      'linear-gradient(90deg, #fbbf24, #d97706)',
      'linear-gradient(90deg, #e879f9, #a855f7)',
      'linear-gradient(90deg, #818cf8, #4f46e5)',
      'linear-gradient(90deg, #34d399, #059669)',
      'linear-gradient(90deg, #f87171, #dc2626)',
      'linear-gradient(90deg, #fb923c, #ea580c)'
    ]
    const DAY_PREF_COLORS = [
      'linear-gradient(90deg, #0e7490, #164e63)',
      'linear-gradient(90deg, #15803d, #14532d)',
      'linear-gradient(90deg, #b45309, #92400e)',
      'linear-gradient(90deg, #7e22ce, #581c87)',
      'linear-gradient(90deg, #3730a3, #1e1b4b)',
      'linear-gradient(90deg, #065f46, #064e3b)',
      'linear-gradient(90deg, #b91c1c, #7f1d1d)',
      'linear-gradient(90deg, #c2410c, #7c2d12)'
    ]
    const NIGHT_DOT_COLORS = ['#22d3ee', '#4ade80', '#fbbf24', '#e879f9', '#818cf8', '#34d399', '#f87171', '#fb923c']
    const DAY_DOT_COLORS   = ['#0e7490', '#15803d', '#b45309', '#7e22ce', '#3730a3', '#065f46', '#b91c1c', '#c2410c']

    const PREF_COLORS     = computed(() => theme.value === 'day-mode' ? DAY_PREF_COLORS     : NIGHT_PREF_COLORS)
    const PREF_DOT_COLORS = computed(() => theme.value === 'day-mode' ? DAY_DOT_COLORS       : NIGHT_DOT_COLORS)
    const googleUsage = ref({})
    const googleTopPlaces = ref([])
    const googleLoading = ref(false)
    const googleDailyStats = ref([])
    const googleChartDays = ref(30)
    const prices = ref({ mongodb: 0, googleExtra: 0, notes: '' })
    const dbStats = ref(null)
    const mongoBilling = ref(null)
    const toast = ref({ visible: false, message: '', type: 'success' })

    // ── STAFF MANAGEMENT ─────────────────────────────────────────────────────
    const staffList = ref([])
    const staffLoading = ref(false)
    const staffSearch = ref('')
    const staffModal = ref({
      open: false,
      saving: false,
      showPw: false,
      error: '',
      created: null,        // { email, password } once successful
      emailSent: false,
      copied: false,
      form: {
        email: '',
        name: '',
        tempPassword: '',
        sendEmail: true,
        // Comma-separated text inputs — parsed to arrays before POST.
        countriesText: '',
        citiesText: '',
        priorityCountriesText: '',
        priorityCitiesText: '',
        notes: '',
        // Permissions — admin checks what this staff member can do.
        // Default: validate yes, destinations/explore no (preserves existing
        // behaviour for admins who don't touch this section).
        permissions: {
          validateBusinesses: true,
          manageDestinations: false,
          moderateExplore: false,
        },
      },
    })
    const staffRevokeTarget = ref(null)
    const staffRevokeBusy = ref(false)

    // ── Assignment-edit modal (separate from create modal) ─────────────────
    const staffAssignModal = ref({
      open: false,
      saving: false,
      error: '',
      target: null,        // staff row being edited
      form: {
        countriesText: '',
        citiesText: '',
        priorityCountriesText: '',
        priorityCitiesText: '',
        notes: '',
        permissions: {
          validateBusinesses: true,
          manageDestinations: false,
          moderateExplore: false,
        },
      },
    })

    // Comma-separated string ↔ string[] helpers used by both modals.
    const splitCsv = (s) => (s || '').split(',').map(x => x.trim()).filter(Boolean)
    const joinCsv  = (arr) => Array.isArray(arr) ? arr.join(', ') : ''

    const staffFiltered = computed(() => {
      const q = staffSearch.value.trim().toLowerCase()
      if (!q) return staffList.value
      return staffList.value.filter(s =>
        (s.email || '').toLowerCase().includes(q) ||
        (s.name || '').toLowerCase().includes(q)
      )
    })
    const staffSummary = computed(() => {
      const all = staffList.value
      return {
        total: all.length,
        active: all.filter(s => s.isActive && !s.mustChangePassword).length,
        awaiting: all.filter(s => s.isActive && s.mustChangePassword).length,
        revoked: all.filter(s => !s.isActive).length,
      }
    })
    const staffAwaitingCount = computed(() => staffSummary.value.awaiting)

    const fetchStaff = async () => {
      staffLoading.value = true
      try {
        const res = await apiFetch('/staff')
        staffList.value = res.staff || []
      } catch (e) {
        showToast(e.message, 'error')
      } finally {
        staffLoading.value = false
      }
    }

    const staffPwError = computed(() => {
      const pw = staffModal.value.form.tempPassword
      if (!pw) return ''
      if (pw.length < 8) return 'Password must be at least 8 characters.'
      if (!/[A-Za-z]/.test(pw)) return 'Password must include a letter.'
      if (!/[0-9]/.test(pw)) return 'Password must include a number.'
      return ''
    })
    const staffCanSubmit = computed(() => {
      const f = staffModal.value.form
      const anyPerm = f.permissions?.validateBusinesses || f.permissions?.manageDestinations || f.permissions?.moderateExplore
      return f.email && f.tempPassword && !staffPwError.value && anyPerm
    })

    const openStaffCreate = () => {
      staffModal.value = {
        open: true, saving: false, showPw: false, error: '',
        created: null, emailSent: false, copied: false,
        form: {
          email: '', name: '', tempPassword: '', sendEmail: true,
          countriesText: '', citiesText: '',
          priorityCountriesText: '', priorityCitiesText: '',
          notes: '',
          permissions: { validateBusinesses: true, manageDestinations: false, moderateExplore: false },
        },
      }
    }
    const closeStaffCreate = () => { staffModal.value.open = false }

    const generateStaffPw = () => {
      const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
      const lower = 'abcdefghjkmnpqrstuvwxyz'
      const digits = '23456789'
      const all = upper + lower + digits
      const pick = (s) => s[Math.floor(Math.random() * s.length)]
      let pw = pick(upper) + pick(lower) + pick(digits)
      for (let i = 0; i < 9; i++) pw += pick(all)
      pw = pw.split('').sort(() => Math.random() - 0.5).join('')
      staffModal.value.form.tempPassword = pw
      staffModal.value.showPw = true
    }

    const submitStaffCreate = async () => {
      if (!staffCanSubmit.value) return
      staffModal.value.saving = true
      staffModal.value.error = ''
      try {
        const f = staffModal.value.form
        const body = {
          email: f.email,
          name: f.name || undefined,
          tempPassword: f.tempPassword,
          sendEmail: f.sendEmail,
          countries:         splitCsv(f.countriesText),
          cities:            splitCsv(f.citiesText),
          priorityCountries: splitCsv(f.priorityCountriesText),
          priorityCities:    splitCsv(f.priorityCitiesText),
          notes: f.notes || '',
          permissions: {
            validateBusinesses: !!f.permissions?.validateBusinesses,
            manageDestinations: !!f.permissions?.manageDestinations,
            moderateExplore:    !!f.permissions?.moderateExplore,
          },
        }
        const res = await apiFetch('/staff', {
          method: 'POST',
          body: JSON.stringify(body)
        })
        staffModal.value.created = { email: res.staff.email, password: f.tempPassword }
        staffModal.value.emailSent = !!res.emailSent
        showToast(res.emailSent ? 'Staff created — credentials emailed' : 'Staff created')
        await fetchStaff()
      } catch (e) {
        staffModal.value.error = e.message
      } finally {
        staffModal.value.saving = false
      }
    }

    const copyStaffCreds = async () => {
      const c = staffModal.value.created
      if (!c) return
      try {
        await navigator.clipboard.writeText(`Email: ${c.email}\nPassword: ${c.password}`)
        staffModal.value.copied = true
        setTimeout(() => { staffModal.value.copied = false }, 2000)
      } catch {
        showToast('Copy failed — please copy manually', 'error')
      }
    }

    // ── Assignment edit ────────────────────────────────────────────────────
    const openStaffAssign = (s) => {
      const a = s.staffAssignment || {}
      const p = a.permissions || {}
      staffAssignModal.value = {
        open: true,
        saving: false,
        error: '',
        target: s,
        form: {
          countriesText:         joinCsv(a.countries),
          citiesText:            joinCsv(a.cities),
          priorityCountriesText: joinCsv(a.priorityCountries),
          priorityCitiesText:    joinCsv(a.priorityCities),
          notes: a.notes || '',
          permissions: {
            // Legacy docs may have no permissions object — default to
            // validate-only so we don't accidentally remove an existing
            // staff's ability to validate.
            validateBusinesses: p.validateBusinesses !== false,
            manageDestinations: p.manageDestinations === true,
            moderateExplore:    p.moderateExplore === true,
          },
        },
      }
    }
    const closeStaffAssign = () => { staffAssignModal.value.open = false }

    const submitStaffAssign = async () => {
      const m = staffAssignModal.value
      if (!m.target) return
      m.saving = true
      m.error = ''
      try {
        const body = {
          countries:         splitCsv(m.form.countriesText),
          cities:            splitCsv(m.form.citiesText),
          priorityCountries: splitCsv(m.form.priorityCountriesText),
          priorityCities:    splitCsv(m.form.priorityCitiesText),
          notes: m.form.notes || '',
          permissions: {
            validateBusinesses: !!m.form.permissions?.validateBusinesses,
            manageDestinations: !!m.form.permissions?.manageDestinations,
            moderateExplore:    !!m.form.permissions?.moderateExplore,
          },
        }
        await apiFetch(`/staff/${m.target._id}/assignment`, {
          method: 'PATCH',
          body: JSON.stringify(body)
        })
        showToast('Assignment updated')
        m.open = false
        await fetchStaff()
      } catch (e) {
        m.error = e.message
      } finally {
        m.saving = false
      }
    }

    const confirmStaffRevoke = (s) => { staffRevokeTarget.value = s }
    const cancelStaffRevoke = () => { staffRevokeTarget.value = null }
    const executeStaffRevoke = async () => {
      if (!staffRevokeTarget.value) return
      staffRevokeBusy.value = true
      try {
        await apiFetch(`/staff/${staffRevokeTarget.value._id}`, { method: 'DELETE' })
        showToast(`${staffRevokeTarget.value.email} revoked`)
        staffRevokeTarget.value = null
        await fetchStaff()
      } catch (e) {
        showToast(e.message, 'error')
      } finally {
        staffRevokeBusy.value = false
      }
    }
    // ── /STAFF MANAGEMENT ────────────────────────────────────────────────────

    const tabs = computed(() => [
      { id: 'overview', label: 'Overview', icon: 'overview' },
      { id: 'users', label: 'Users', icon: 'users' },
      { id: 'staff', label: 'Staff', icon: 'staff', badge: staffAwaitingCount.value || null },
      { id: 'ai', label: 'AI Usage', icon: 'ai', badge: aiSummary.value.usersOnCooldown || null },
      { id: 'google', label: 'Google Usage', icon: 'google' },
      { id: 'businesses', label: 'Businesses', icon: 'businesses' },
      { id: 'destinations', label: 'Destinations', icon: 'destinations' },
      { id: 'places', label: 'Places Cache', icon: 'places', badge: placesSummary.value.totalPlaces || null },
      { id: 'prices', label: 'Prices', icon: 'prices' }
    ])

    // ── Mobile sidebar: looping horizontal strip ──────────────────────────
    // Flat list of every interactive item in the mobile sidebar — the 9
    // tabs plus theme toggle and logout. Each item carries its own SVG
    // (inlined as a string so v-html can render it inside the loop).
    // This array is iterated 3× in the template; the scroll handler below
    // jumps the scroll position back to the middle copy when the user
    // nears either edge, producing a seamless infinite-scroll feel.
    const NAV_ICONS = {
      overview:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      users:        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      ai:           '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
      businesses:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
      places:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>',
      destinations: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
      google:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.454 0-.769-.085-1.357-.187-1.857H12.24z"/></svg>',
      prices:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      staff:        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>',
      themeMoon:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
      themeSun:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
      logout:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
    }
    const mobileNavItems = computed(() => {
      const tabItems = tabs.value.map(t => ({
        key: 'tab-' + t.id,
        type: 'tab',
        id: t.id,
        label: t.label,
        svg: NAV_ICONS[t.icon] || ''
      }))
      return [
        ...tabItems,
        { key: 'theme',  type: 'theme',  label: theme.value === 'night-mode' ? 'Day mode' : 'Night mode', svg: theme.value === 'night-mode' ? NAV_ICONS.themeSun : NAV_ICONS.themeMoon, extraClass: 'nav-item--theme' },
        { key: 'logout', type: 'logout', label: 'Logout', svg: NAV_ICONS.logout, extraClass: 'nav-item--logout' }
      ]
    })
    // Pre-tripled list — 3 copies concatenated. Simpler for Vue to render
    // than a nested v-for, and avoids any key-collision edge cases.
    const mobileNavItemsTripled = computed(() => {
      const items = mobileNavItems.value
      return [...items, ...items, ...items]
    })
    const loopStrip = ref(null)
    const onMobileNavClick = (item) => {
      if (item.type === 'tab')         activeTab.value = item.id
      else if (item.type === 'theme')  toggleTheme()
      else if (item.type === 'logout') handleLogout()
    }
    // Scroll handler: when the user scrolls near either end of the 3-copy
    // strip, silently jump back to the equivalent position in the middle
    // copy. The jump is invisible because the content is identical.
    const onLoopStripScroll = () => {
      const el = loopStrip.value
      if (!el) return
      const total = el.scrollWidth          // width of 3 copies
      const copy  = total / 3               // width of 1 copy
      const x     = el.scrollLeft
      // If we're in the first or last copy, jump by ±copy width
      if (x < copy * 0.5)        el.scrollLeft = x + copy
      else if (x > copy * 2.5)   el.scrollLeft = x - copy
    }
    // After the strip mounts (and whenever the items list changes), park
    // the scroll position at the start of the middle copy so the user has
    // room to scroll in both directions.
    const centerLoopStrip = () => {
      const el = loopStrip.value
      if (!el) return
      // Wait one frame for layout so scrollWidth is correct.
      requestAnimationFrame(() => {
        el.scrollLeft = el.scrollWidth / 3
      })
    }
    onMounted(centerLoopStrip)
    watch(mobileNavItems, () => centerLoopStrip())

    const currentTabLabel = computed(() => tabs.value.find(t => t.id === activeTab.value)?.label || '')
    const premiumPct = computed(() => { const u = overview.value.users; if (!u?.total) return 0; return Math.round((u.premium / u.total) * 100) })
    const formattedDate = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

    const fmt = (n) => n == null ? '0' : Number(n).toLocaleString()
    const fmtK = (n) => { if (n == null) return '0'; if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'; if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'; return String(n) }
    const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    const shortDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
    // Compact label for an event place's cached schedule (admin cache view). Shows a
    // single day, a start–end range, or "Recurring"; '' when there's no date so the
    // row hides for non-event places. Dates are stored as midnight-UTC calendar dates
    // (e.g. 2026-06-05T00:00:00Z = "June 5"), so format in UTC — formatting in the
    // admin's local zone would shift a date-only event to the previous day west of UTC.
    const eventDateLabel = (es) => {
      if (!es) return ''
      if (es.isRecurring && !es.startDate) return 'Recurring'
      if (!es.startDate) return ''
      const f = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
      const start = f(es.startDate)
      const end = es.endDate ? f(es.endDate) : ''
      const label = (end && end !== start) ? `${start} – ${end}` : start
      return es.isRecurring ? `${label} · recurring` : label
    }
    const relativeTime = (d) => { if (!d) return '—'; const diff = Date.now() - new Date(d); const mins = Math.floor(diff / 60000); if (mins < 2) return 'Just now'; if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago` }

    // ── Event schedule date/time helpers ──────────────────────────────────────
    // An event's startDate / endDate are absolute UTC instants. They only mean
    // a wall-clock time when paired with the event's home timezone
    // (eventSchedule.timezone, e.g. "Europe/Moscow"). These helpers always
    // convert against THAT timezone — never the admin's browser zone — so a
    // Moscow event reads as "20:00 Moscow" whether the admin sits in Yerevan,
    // London, or anywhere else. The same converter logic is used in
    // BusinessOnboarding.vue so both sides agree byte-for-byte.

    // The browser's own IANA zone — used only as a fallback when an event has
    // no stored timezone (legacy data from before this field existed).
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
    // Absolute UTC value (Date or ISO string) -> { date:'YYYY-MM-DD', time:'HH:MM' }
    // expressed in `timeZone`. This is what fills the modal's date/time inputs.
    const splitDateTime = (value, timeZone) => {
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
    // { date, time } in `timeZone` -> absolute UTC ISO string (with trailing Z).
    // This is what gets sent back to the backend on save.
    const combineDateTime = (dateStr, timeStr, fallbackTime, timeZone) => {
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
    // Short, readable label for a timezone (e.g. "Europe/Moscow" -> "Moscow").
    const tzShortLabel = (tz) => {
      if (!tz) return ''
      const leaf = tz.split('/').pop() || tz
      return leaf.replace(/_/g, ' ')
    }
    // Human-readable one-line summary of an event schedule. All times are shown
    // in the event's own timezone, with the zone named so there is no ambiguity.
    const eventScheduleSummary = (es) => {
      if (!es) return '—'
      if (es.isRecurring) return 'Repeats weekly — see Weekly Schedule below'
      const tz = es.timezone || browserTz()
      const s = splitDateTime(es.startDate, tz)
      if (!s.date) return 'No date set'
      const e = splitDateTime(es.endDate, tz)
      const dayLabel = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      const to12h = (t) => {
        if (!t) return ''
        const [h, m] = t.split(':').map(Number)
        const ampm = h < 12 ? 'AM' : 'PM'
        const h12 = h % 12 === 0 ? 12 : h % 12
        return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
      }
      const tzTag = es.timezone ? ` (${tzShortLabel(es.timezone)})` : ''
      const startTxt = dayLabel(s.date) + (s.time ? ` · ${to12h(s.time)}` : ' · All day')
      // Single-day event (no end date, or end date equals start date).
      if (!e.date || e.date === s.date) {
        if (s.time && e.time) return `${dayLabel(s.date)} · ${to12h(s.time)} – ${to12h(e.time)}${tzTag}`
        return startTxt + tzTag
      }
      // Multi-day event.
      const endTxt = dayLabel(e.date) + (e.time ? ` · ${to12h(e.time)}` : '')
      return `${startTxt}  →  ${endTxt}${tzTag}`
    }
    // Options for the event timezone <select>. Starts from the full IANA list
    // and guarantees the currently-stored timezone is present even if it is an
    // exotic or deprecated zone not in TIMEZONE_LIST — so editing never drops a
    // value the dropdown can't represent.
    const eventTimezoneOptions = computed(() => {
      const current = editModal.value?.form?.eventSchedule?.timezone
      if (current && !TIMEZONE_LIST.includes(current)) {
        return [current, ...TIMEZONE_LIST]
      }
      return TIMEZONE_LIST
    })
    const maxReg = computed(() => Math.max(...registrations.value.map(r => r.count), 1))
    const barHeight = (count) => Math.max(4, Math.round((count / maxReg.value) * 80))
    const googleChartMax = computed(() => Math.max(...googleDailyStats.value.map(d => d.total), 1))
    const aiChartMax = computed(() => Math.max(...aiDailyStats.value.map(d => d.tokens), 1))
    const isToday = (dateStr) => {
      if (!dateStr) return false
      const d = new Date(dateStr), now = new Date()
      return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate()
    }
    const dailyTokenPct  = (ai) => { if (!isToday(ai?.dailyUsage?.lastResetDate)) return 0; const limit = ai?.isPremium ? 50000 : 10000; return Math.min(100, Math.round(((ai?.dailyUsage?.tokensUsed  || 0) / limit) * 100)) }
    const dailyPlacesPct = (ai) => { if (!isToday(ai?.dailyUsage?.lastResetDate)) return 0; const limit = ai?.isPremium ? 200   : 50;    return Math.min(100, Math.round(((ai?.dailyUsage?.placesViewed || 0) / limit) * 100)) }

    const fetchOverview = async () => { const res = await apiFetch('/overview'); overviewData.value = res }
    const fetchRegistrations = async () => { const res = await apiFetch('/users/registrations?days=30'); registrations.value = res.data || [] }
    const fetchQuickActionStats = async () => {
      try {
        const res = await apiFetch('/quick-action-stats')
        quickActionStats.value = {
          actions: res.data?.actions || [],
          chatStream: res.data?.chatStream || { count: 0 },
          quickActionTotal: res.data?.quickActionTotal || 0,
          chatStreamTotal: res.data?.chatStreamTotal || 0,
          grandTotal: res.data?.grandTotal || 0
        }
      } catch (e) { console.error('Quick action stats error:', e) }
    }
    const fetchPrefStats = async () => {
      try {
        const res = await apiFetch('/preference-stats')
        prefStats.value = res.data || {}
      } catch (e) { console.error('Preference stats error:', e) }
    }

    // Donut segment helpers
    const buildSegments = (items, total) => {
      if (!total) return []
      let offset = 0
      return items.map((item, i) => {
        const pct = item.count / total
        const dash = pct * 188.5
        const dots = PREF_DOT_COLORS.value
        const seg = { color: dots[i % dots.length], dash, offset: 188.5 - offset + 47 }
        offset += dash
        return seg
      })
    }
    const travelStyleSegments = computed(() => {
      const items = prefStats.value.travelStyles || []
      const total = items.reduce((s, i) => s + i.count, 0)
      return buildSegments(items, total)
    })
    const currencySegments = computed(() => {
      const items = prefStats.value.currencies || []
      const total = items.reduce((s, i) => s + i.count, 0)
      return buildSegments(items, total)
    })
    const travelStyleTopPct = computed(() => {
      const items = prefStats.value.travelStyles || []
      const total = items.reduce((s, i) => s + i.count, 0)
      if (!total || !items[0]) return 0
      return Math.round((items[0].count / total) * 100)
    })
    const currencyTopPct = computed(() => {
      const items = prefStats.value.currencies || []
      const total = items.reduce((s, i) => s + i.count, 0)
      if (!total || !items[0]) return 0
      return Math.round((items[0].count / total) * 100)
    })
    const prefLocTotal = computed(() => (prefStats.value.locationMode || []).reduce((s, i) => s + i.count, 0))
    const prefBudgetTotal = computed(() => (prefStats.value.budgetBuckets || []).reduce((s, i) => s + i.count, 0))
    const budgetBucketColor = (id) => {
      const isDay = theme.value === 'day-mode'
      return ({
        'Budget':    isDay ? 'linear-gradient(90deg, #15803d, #14532d)' : 'linear-gradient(90deg, #4ade80, #16a34a)',
        'Mid-range': isDay ? 'linear-gradient(90deg, #0e7490, #164e63)' : 'linear-gradient(90deg, #22d3ee, #0891b2)',
        'Luxury':    isDay ? 'linear-gradient(90deg, #b45309, #92400e)' : 'linear-gradient(90deg, #fbbf24, #d97706)'
      }[id] || (isDay ? 'linear-gradient(90deg, #7e22ce, #581c87)' : 'linear-gradient(90deg, #e879f9, #a855f7)'))
    }
    const budgetRangeHint = (id) => ({ 'Budget': 'Avg budget ≤ $300', 'Mid-range': 'Avg budget $301–$1,000', 'Luxury': 'Avg budget $1,000+' }[id] || id)
    const fetchUsers = async () => {
      usersLoading.value = true
      try { const params = new URLSearchParams({ page: usersPage.value, limit: 20, search: userSearch.value, filter: userFilter.value }); const res = await apiFetch(`/users?${params}`); users.value = res.data.users; usersTotalPages.value = res.data.totalPages }
      catch (e) { showToast(e.message, 'error') } finally { usersLoading.value = false }
    }
    const fetchAIUsage = async () => {
      aiLoading.value = true
      try {
        const [usageRes, dailyRes] = await Promise.all([
          apiFetch(`/ai-usage?page=${aiPage.value}&limit=20`),
          apiFetch(`/ai-usage/daily?days=${aiChartDays.value}`)
        ])
        aiUsers.value = usageRes.data.users
        aiTotalPages.value = usageRes.data.totalPages
        aiSummary.value = usageRes.data.summary || {}
        aiDailyStats.value = dailyRes.data || []
      } catch (e) { showToast(e.message, 'error') } finally { aiLoading.value = false }
    }
    const fetchAiProvider = async () => {
      aiProviderLoading.value = true
      try {
        const res = await apiFetch('/ai-provider')
        // Don't overwrite the form if the admin has already started editing.
        if (res.success && !aiProviderDirty.value) await applyRemoteProvider(res.data)
      } catch (e) { showToast(e.message, 'error') } finally { aiProviderLoading.value = false }
    }
    const saveAiProvider = async () => {
      aiProviderSaving.value = true
      try {
        const res = await apiFetch('/ai-provider', {
          method: 'PATCH',
          body: JSON.stringify(aiProvider.value),
        })
        if (res.success) {
          await applyRemoteProvider(res.data)
          aiProviderDirty.value = false
          aiProviderSavedAt.value = Date.now()
          showToast('Provider settings saved')
          setTimeout(() => { aiProviderSavedAt.value = null }, 2500)
        }
      } catch (e) { showToast(e.message, 'error') } finally { aiProviderSaving.value = false }
    }
    // Per-action web-search picker. The backend gate treats an EMPTY
    // claudeWebSearchActions as "all actions", but in this UI an admin who
    // unticks everything means "search nothing". To avoid that collision we
    // always store an EXPLICIT list: ticking every action saves the full list
    // (not []), and unticking all saves [] which here we intend as "none".
    // (If the stored value arrives as [] from an older config, we treat it as
    // "all" once on load so existing behaviour is preserved — see normalize.)
    const webSearchActionOptions = [
      { id: 'events',       label: 'Events' },
      { id: 'restaurants',  label: 'Restaurants' },
      { id: 'hotels',       label: 'Hotels' },
      { id: 'historical',   label: 'Historical' },
      { id: 'hidden_gems',  label: 'Hidden gems' },
      { id: 'photo_spots',  label: 'Photo spots' },
      { id: 'shopping',     label: 'Shopping' },
    ]
    const isSearchActionOn = (id) => {
      const list = aiProvider.value.claudeWebSearchActions
      return Array.isArray(list) && list.includes(id)
    }
    const searchActionCount = computed(() => {
      const list = aiProvider.value.claudeWebSearchActions
      return Array.isArray(list) ? list.length : 0
    })
    const toggleSearchAction = (id) => {
      const list = Array.isArray(aiProvider.value.claudeWebSearchActions)
        ? [...aiProvider.value.claudeWebSearchActions] : []
      const i = list.indexOf(id)
      if (i === -1) list.push(id); else list.splice(i, 1)
      // Keep a stable, known order so the saved value is tidy.
      aiProvider.value.claudeWebSearchActions =
        webSearchActionOptions.map(o => o.id).filter(x => list.includes(x))
      aiProviderDirty.value = true
    }
    // ── Google prefetch helpers (layers + actions) ───────────────────────────
    const prefetchLayerOptions = [
      { id: 1, label: 'Layer 1', hint: 'first tap' },
      { id: 2, label: 'Layer 2', hint: 'View More' },
      { id: 3, label: 'Layer 3', hint: 'View More' },
      { id: 4, label: 'Layer 4', hint: 'View More' },
    ]
    const isPrefetchLayerOn = (n) => {
      const list = aiProvider.value.googlePrefetchLayers
      return Array.isArray(list) && list.includes(n)
    }
    const prefetchLayerCount = computed(() => {
      const list = aiProvider.value.googlePrefetchLayers
      return Array.isArray(list) ? list.length : 0
    })
    const togglePrefetchLayer = (n) => {
      const list = Array.isArray(aiProvider.value.googlePrefetchLayers)
        ? [...aiProvider.value.googlePrefetchLayers] : []
      const i = list.indexOf(n)
      if (i === -1) list.push(n); else list.splice(i, 1)
      aiProvider.value.googlePrefetchLayers = [1, 2, 3, 4].filter(x => list.includes(x))
      aiProviderDirty.value = true
    }
    const isPrefetchActionOn = (id) => {
      const list = aiProvider.value.googlePrefetchActions
      return Array.isArray(list) && list.includes(id)
    }
    const prefetchActionCount = computed(() => {
      const list = aiProvider.value.googlePrefetchActions
      return Array.isArray(list) ? list.length : 0
    })
    const togglePrefetchAction = (id) => {
      const list = Array.isArray(aiProvider.value.googlePrefetchActions)
        ? [...aiProvider.value.googlePrefetchActions] : []
      const i = list.indexOf(id)
      if (i === -1) list.push(id); else list.splice(i, 1)
      aiProvider.value.googlePrefetchActions =
        webSearchActionOptions.map(o => o.id).filter(x => list.includes(x))
      aiProviderDirty.value = true
    }
    const fetchProviderStats = async () => {
      providerStatsLoading.value = true
      try {
        const res = await apiFetch(`/ai-usage/by-provider?days=${aiChartDays.value}`)
        if (res.success) { providerStats.value = res.data; providerStatsLoaded.value = true }
      } catch (e) { showToast(e.message, 'error') } finally { providerStatsLoading.value = false }
    }
    const fetchBusinesses = async () => {
      bizLoading.value = true
      try {
        const params = new URLSearchParams({
          page: bizPage.value,
          limit: 20,
          search: bizSearch.value,
          partner: bizPartnerFilter.value,
          status: bizStatusFilter.value,
          location: bizLocationSearch.value
        })
        const res = await apiFetch(`/businesses?${params}`)
        businesses.value = res.data.businesses
        bizTotalPages.value = res.data.totalPages
        bizSummary.value = res.data.summary || {}
      }
      catch (e) { showToast(e.message, 'error') } finally { bizLoading.value = false }
    }
    const fetchPlaces = async (resetPage = false) => {
      if (resetPage) placesPage.value = 1
      placesLoading.value = true
      try {
        const isNeverUsed = placesSort.value === 'neverUsed'
        const params = new URLSearchParams({
          page: placesPage.value,
          limit: 24,
          search: placesSearch.value,
          sort: isNeverUsed ? 'useCount' : placesSort.value,
          order: 'asc',
          hasImage: placesImageFilter.value,
          ...(placesActionFilter.value && { action: placesActionFilter.value }),
          ...(placesExploreFilter.value && { explore: placesExploreFilter.value }),
          ...(isNeverUsed && { neverUsed: 'true' })
        })
        if (!isNeverUsed) params.set('order', 'desc')
        const res = await apiFetch(`/places?${params}`)
        places.value = res.data.places
        placesTotalPages.value = res.data.totalPages
        placesSummary.value = res.data.summary || {}
      } catch (e) { showToast(e.message, 'error') } finally { placesLoading.value = false }
    }
    // Parse country/city for legacy cache docs (idempotent; see backend route).
    const backfillBusy = ref(false)
    const backfillRegions = async () => {
      backfillBusy.value = true
      try {
        const res = await apiFetch('/places/backfill-regions', { method: 'POST', body: JSON.stringify({}) })
        showToast(`Regions backfilled: ${res.updated} updated, ${res.unparsed} unparsable of ${res.scanned} scanned`)
      } catch (e) { showToast(e.message, 'error') } finally { backfillBusy.value = false }
    }
    // Toggle a place's Explore moderation status. Clicking the button of the
    // current state reverts to 'visible' (e.g. verify on a verified place unverifies).
    const setExploreStatus = async (place, status) => {
      const next = place.explore?.status === status ? 'visible' : status
      try {
        const res = await apiFetch(`/places/${place.placeId}/explore-status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: next })
        })
        place.explore = res.place?.explore || { status: next }
        showToast(res.message || `"${place.name}" → ${next}`)
      } catch (e) { showToast(e.message, 'error') }
    }
    const deletePlace = async (place) => {
      if (!confirm(`Remove "${place.name}" from cache?`)) return
      try {
        await apiFetch(`/places/${place.placeId}`, { method: 'DELETE' })
        places.value = places.value.filter(p => p.placeId !== place.placeId)
        placesSummary.value.totalPlaces = (placesSummary.value.totalPlaces || 1) - 1
        showToast(`"${place.name}" removed from cache`)
      } catch (e) { showToast(e.message, 'error') }
    }
    const purgeOpts = [
      { days: 1, label: '1 day' },
      { days: 10, label: '10 days' },
      { days: 30, label: '30 days' },
      { days: 90, label: '3 months' },
      { days: 120, label: '4 months' },
      { days: 365, label: '1 year' },
    ]
    const purgeDays = ref(30)
    const purgeDropdownOpen = ref(false)
    const purgeNeverUsed = ref(false)
    const selectedPurgeOpt = computed(() => purgeOpts.find(o => o.days === purgeDays.value) || purgeOpts[2])
    const purgeStale = async () => {
      const parts = []
      if (purgeDays.value) parts.push(`not used in the last ${selectedPurgeOpt.value.label}`)
      if (purgeNeverUsed.value) parts.push('never used (useCount ≤ 1)')
      if (!parts.length) { showToast('Select at least one filter to purge', 'error'); return }
      if (!confirm(`Delete all places that are: ${parts.join(' AND ')}?`)) return
      try {
        const params = new URLSearchParams({ neverUsed: purgeNeverUsed.value ? 'true' : 'false' })
        const res = await apiFetch(`/places/stale/${purgeDays.value}?${params}`, { method: 'DELETE' })
        showToast(res.message)
        fetchPlaces(true)
      } catch (e) { showToast(e.message, 'error') }
    }
    const onImgError = (e) => { e.target.closest('.place-img-wrap').innerHTML = '<div class="place-img-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>' }
    const fetchUserLocations = async () => {
      try {
        const res = await apiFetch('/users/locations')
        userLocations.value = {
          byCountry: res.data.byCountry || [],
          byCity: res.data.byCity || [],
          total: res.data.total || 0,
          destinations: {
            byCountry: res.data.destinations?.byCountry || [],
            byCity: res.data.destinations?.byCity || [],
            total: res.data.destinations?.total || 0
          }
        }
      } catch (e) { console.error('Location fetch failed', e) }
    }
    const fetchDestinations = async (resetPage = false) => {
      if (resetPage) destPage.value = 1
      destLoading.value = true
      try {
        const params = new URLSearchParams({ page: destPage.value, limit: 20, search: destSearch.value, filter: destFilter.value })
        const res = await apiFetch(`/destinations?${params}`)
        destinations.value = res.data.destinations
        destTotalPages.value = res.data.totalPages
        destSummary.value = res.data.summary || {}
      } catch (e) { showToast(e.message, 'error') } finally { destLoading.value = false }
    }
    const toggleDestination = async (dest) => {
      try { await apiFetch(`/destinations/${dest._id}/toggle`, { method: 'PATCH' }); dest.isActive = !dest.isActive; showToast(`"${dest.name}" ${dest.isActive ? 'activated' : 'deactivated'}`) }
      catch (e) { showToast(e.message, 'error') }
    }
    const deleteDestination = async (dest) => {
      if (!confirm(`Delete "${dest.name}"? This cannot be undone.`)) return
      try { await apiFetch(`/destinations/${dest._id}`, { method: 'DELETE' }); destinations.value = destinations.value.filter(d => d._id !== dest._id); showToast(`"${dest.name}" deleted`) }
      catch (e) { showToast(e.message, 'error') }
    }
    const toggleBusiness = async (biz) => {
      try { await apiFetch(`/businesses/${biz._id}/toggle`, { method: 'PATCH' }); biz.isActive = !biz.isActive; showToast(`"${biz.name}" ${biz.isActive ? 'activated' : 'deactivated'}`) }
      catch (e) { showToast(e.message, 'error') }
    }
    const deleteBusiness = async (biz) => {
      if (!confirm(`Delete "${biz.name}"? This cannot be undone.`)) return
      try { await apiFetch(`/businesses/${biz._id}`, { method: 'DELETE' }); businesses.value = businesses.value.filter(b => b._id !== biz._id); showToast(`"${biz.name}" deleted`) }
      catch (e) { showToast(e.message, 'error') }
    }
    const fetchGoogleUsage = async () => {
      googleLoading.value = true
      try {
        const [usageRes, dailyRes] = await Promise.all([
          apiFetch('/google-usage'),
          apiFetch(`/google-usage/daily?days=${googleChartDays.value}`)
        ])
        googleUsage.value = usageRes.data.summary || {}
        googleTopPlaces.value = usageRes.data.topPlaces || []
        googleDailyStats.value = dailyRes.data || []
      } catch (e) { showToast(e.message, 'error') } finally { googleLoading.value = false }
    }
    const debouncedDestFetch = debounce(() => fetchDestinations(true))
    const fetchAll = async () => {
      loading.value = true
      try { await Promise.all([fetchOverview(), fetchRegistrations(), fetchQuickActionStats(), fetchPrefStats(), fetchUsers(), fetchUserLocations(), fetchAIUsage(), fetchProviderStats(), fetchBusinesses(), fetchPlaces(), fetchGoogleUsage(), fetchDbStats()]) }
      catch (e) { showToast(e.message, 'error') } finally { loading.value = false }
    }
    const togglePremium = async (user) => {
      try { await apiFetch(`/users/${user._id}/premium`, { method: 'PATCH', body: JSON.stringify({ isPremium: !user.isPremium }) }); user.isPremium = !user.isPremium; showToast(`${user.name} ${user.isPremium ? 'upgraded to Premium' : 'downgraded to Free'}`) }
      catch (e) { showToast(e.message, 'error') }
    }
    const toggleCooldown = async (user) => {
        try {
            const currentCooldown = user.aiLimits?.onCooldown ?? false
            await apiFetch(`/users/${user._id}/cooldown`, { method: 'PATCH', body: JSON.stringify({ onCooldown: !currentCooldown }) })
            if (user.aiLimits) user.aiLimits.onCooldown = !currentCooldown
            else user.aiLimits = { onCooldown: !currentCooldown }
            showToast(!currentCooldown ? `${user.name} placed on cooldown` : `Cooldown lifted for ${user.name}`)
        } catch (e) { showToast(e.message, 'error') }
    }
    const deleteUser = async (user) => {
      if (!confirm(`Permanently delete "${user.name}" (${user.email})? This cannot be undone.`)) return
      try {
        await apiFetch(`/users/${user._id}`, { method: 'DELETE' })
        users.value = users.value.filter(u => u._id !== user._id)
        showToast(`${user.name} deleted`)
      } catch (e) { showToast(e.message, 'error') }
    }
    const clearCooldown = async (u) => {
      try { await apiFetch(`/ai-usage/${u.userId?._id}/clear-cooldown`, { method: 'PATCH' }); u.onCooldown = false; showToast('Cooldown cleared') }
      catch (e) { showToast(e.message, 'error') }
    }
    const showToast = (message, type = 'success') => { toast.value = { visible: true, message, type }; setTimeout(() => { toast.value.visible = false }, 3000) }
    const debouncedUserFetch = debounce(() => { usersPage.value = 1; fetchUsers() })
    const debouncedBizFetch = debounce(() => { bizPage.value = 1; fetchBusinesses() })
    const debouncedPlacesFetch = debounce(() => fetchPlaces(true))
    const fetchDbStats = async () => {
      try {
        const res = await apiFetch('/db-stats')
        dbStats.value = res.data
      } catch (e) { console.error('DB stats fetch failed', e) }
    }
    const fetchMongoBilling = async (refresh = false) => {
      try {
        const res = await apiFetch('/mongo-billing' + (refresh ? '?refresh=1' : ''))
        mongoBilling.value = res.data
      } catch (e) {
        console.error('Mongo billing fetch failed', e)
        // Don't blank an existing value on transient failure — the user will
        // see a stale cached value, which is better than a flicker.
        if (!mongoBilling.value) {
          mongoBilling.value = { available: false, reason: 'fetch failed' }
        }
      }
    }
    // ── EDIT MODAL ────────────────────────────────────────────────────────────
    const ALL_TYPES = [
      'cultural','history','adventure','relaxation','nature','art','nightlife','food&drink',
      'family','romantic','luxury','budget',
      'restaurants','hotels','historical','events','hidden_gems',
      // Parity with StaffValidation: photo spots + shopping sub-types (there
      // is no plain 'shopping' tag — see the Destination schema comment).
      'photo_spots',
      'market','mall','souvenirs','clothing','jewelry','food'
    ]
    // Currencies match BusinessOnboarding.vue (USD/EUR/GBP/RUB/AED) plus AMD,
    // since several admin-facing listings are local Armenian businesses.
    const PRICING_CURRENCIES = ['USD', 'EUR', 'GBP', 'AMD', 'RUB', 'AED']
    // Partnership tiers — values match the schema enum, fees mirror Business.TIER_FEE.
    // Used by the Partnership tier-button picker. Updating the fee here doesn't
    // change what the backend charges; that's still Business.TIER_FEE in the model.
    const PARTNERSHIP_TIERS = [
      { value: 'verified',  label: 'Jinni Verified',  fee: 0  },
      { value: 'spotlight', label: 'Jinni Spotlight', fee: 29 },
      { value: 'signature', label: 'Jinni Signature', fee: 49 },
    ]

    // ── Event timezone list ───────────────────────────────────────────────
    // The full IANA list straight from the browser (Intl.supportedValuesOf is
    // available in all current browsers). It populates the timezone-override
    // dropdown in the event editor. We keep a small curated fallback for the
    // rare environment where supportedValuesOf is missing, biased toward the
    // regions this product serves. The event's stored timezone is always
    // included even if it is not in the list, so a value never silently
    // disappears from the dropdown.
    const TIMEZONE_LIST = (() => {
      try {
        if (typeof Intl.supportedValuesOf === 'function') {
          return Intl.supportedValuesOf('timeZone')
        }
      } catch (_e) { /* fall through */ }
      return [
        'UTC',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
        'Europe/Istanbul', 'Europe/Kyiv',
        'Asia/Yerevan', 'Asia/Tbilisi', 'Asia/Baku', 'Asia/Dubai',
        'Asia/Tehran', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
        'America/New_York', 'America/Chicago', 'America/Denver',
        'America/Los_Angeles', 'America/Sao_Paulo'
      ]
    })()

    // ── Highlights helper ─────────────────────────────────────────────────
    // Onboarding gives the owner exactly 5 single-line slots to type in their
    // highlights, so we use the same UI here. The schema stores them as a
    // dense array (no empty strings), so on load we pad to 5 slots and on
    // save (in saveEdit) we drop any empty strings before sending.
    const HIGHLIGHT_SLOTS = 5
    // Same placeholder hints as BusinessOnboarding.vue so admin sees what the
    // owner saw. Slot 5 has no hint there either — kept blank.
    const businessHighlightPlaceholders = [
      'e.g. Award-winning chef',
      'e.g. Stunning views',
      'e.g. Live music',
      'e.g. Locally sourced ingredients',
      'e.g. Add a highlight…'
    ]
    const padHighlights = (arr) => {
      const out = [...(arr || [])].slice(0, HIGHLIGHT_SLOTS)
      while (out.length < HIGHLIGHT_SLOTS) out.push('')
      return out
    }

    // ── Phone helpers ─────────────────────────────────────────────────────────
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

    // Renders a User reference (verifiedBy / history.by) as a friendly label.
    // Accepts either a populated User object (with name/email/role) or a raw
    // ObjectId string. If the backend forgot to populate, falls back to '—'
    // rather than printing a 24-char hex string the admin can't make sense of.
    const verifierLabel = (ref) => {
      if (!ref) return '—'
      if (typeof ref === 'string') return '—'  // unpopulated ObjectId
      if (typeof ref === 'object') {
        const name  = ref.name || ref.fullName || ref.username
        const email = ref.email
        const role  = ref.role
        if (name && email) return `${name} <${email}>${role ? ` · ${role}` : ''}`
        if (name)  return name + (role ? ` · ${role}` : '')
        if (email) return email
      }
      return '—'
    }

    const blankBusiness = () => ({
      name: '', type: [],
      location: { city: '', region: '', country: '', address: '', coordinates: { lat: null, lng: null } },
      contact: { email: '', showEmail: false, phone: '', website: '', socialMedia: { facebook: '', instagram: '', tripadvisor: '', booking: '' } },
      description: { short: '', detailed: '', highlights: padHighlights([]) },
      images: [],
      // Pricing matches schema: isFree + min/max/average/currency
      pricing: { isFree: false, min: null, max: null, average: null, currency: 'USD' },
      partnership: { tier: 'verified', monthlyFee: null, priorityScore: 1, subscriptionStart: '', subscriptionEnd: '' },
      auction: { isBidding: false, maxBid: null, targetZoneKey: '', wonAtPrice: null, awaitingApprovalSince: null },
      // Opening hours (24/7 toggle + per-day open/close)
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
      // Event schedule (only used when type includes 'events').
      // startDate/endDate hold the day; startTime/endTime hold the time-of-day,
      // both expressed in `timezone`. They are converted to UTC in saveEdit().
      // timezone defaults to the admin's browser zone for a fresh listing.
      eventSchedule: { startDate: '', startTime: '', endDate: '', endTime: '', isRecurring: false, timezone: '' },
      // Verification (admin can override)
      verification: { aiScore: null, aiNotes: '', staffApproved: false, staffNotes: '', verifiedAt: null, verifiedAction: null, history: [] },
      // Read-only analytics (shown but not edited)
      analytics: { views: 0, clicks: 0, conversions: 0, saves: 0, likes: 0, dislikes: 0, shares: 0, aiAsk: 0, moreImages: 0, directionClicks: 0, phoneClicks: 0, websiteClicks: 0, searchClicks: 0, instagramClicks: 0, facebookClicks: 0, tripadvisorClicks: 0, weeklyViews: [], weeklyClicks: [], performanceScore: 0, performanceUpdatedAt: null },
      isHiddenGem: false,
      status: 'pending',
      isActive: true
    })

    const blankDestination = () => ({
      name: '', type: [],
      location: { city: '', country: '', region: '', address: '', coordinates: { lat: null, lng: null } },
      contact: { email: '', showEmail: false, phone: '', website: '', socialMedia: { facebook: '', instagram: '', tripadvisor: '', booking: '' } },
      description: '',
      images: [],
      // Same per-day defaults as a fresh business — admin can toggle 24/7 or
      // mark a day closed. Sunday closed by default to mirror Business onboarding.
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
      // Same shape as Business.analytics so the edit modal Analytics panel
      // works for both kinds. All zero on a freshly created destination.
      analytics: { views: 0, clicks: 0, conversions: 0, saves: 0, likes: 0, dislikes: 0, shares: 0, aiAsk: 0, moreImages: 0, directionClicks: 0, phoneClicks: 0, websiteClicks: 0, searchClicks: 0, instagramClicks: 0, facebookClicks: 0, tripadvisorClicks: 0, weeklyViews: [], weeklyClicks: [], performanceScore: 0, performanceUpdatedAt: null },
      // Same pricing shape as Business. Default to Free since most
      // destinations (parks, viewpoints, public squares) don't charge entry.
      pricing: { isFree: true, min: null, max: null, average: null, currency: 'USD' },
      bestTimeToVisit: '',
      popularity: 0, isHiddenGem: false, isActive: true,
      createdBy: null
    })

    const editModal = ref({ open: false, kind: 'business', id: null, isNew: false, saving: false, isDragging: false, uploads: [], form: blankBusiness(), statusBusy: false, statusConfirm: { action: null, notes: '' }, galleryIndex: 0, lightboxOpen: false })

    // ── Analytics derivations for the edit modal ──────────────────────────
    // Mirrors Business.js recalcPerformanceScore (30/25/30/15 weights) so the
    // breakdown shown to admin matches what the business owner sees.
    const editAnalytics = computed(() => editModal.value.form?.analytics || {})

    // Conversion rate = clicks ÷ views. Engagement rate = (saves+aiAsk+moreImages) ÷ views.
    const editConversionRate = computed(() => {
      const a = editAnalytics.value
      const v = a.views || 0
      if (!v) return 0
      return ((a.clicks || 0) / v) * 100
    })
    const editEngagementRate = computed(() => {
      const a = editAnalytics.value
      const v = a.views || 0
      if (!v) return 0
      return (((a.saves || 0) + (a.aiAsk || 0) + (a.moreImages || 0)) / v) * 100
    })
    const editLikeRatio = computed(() => {
      const a = editAnalytics.value
      const total = (a.likes || 0) + (a.dislikes || 0)
      if (!total) return null
      return ((a.likes || 0) / total) * 100
    })

    // 4-pillar score breakdown (same formulas as BusinessDashboard scoreBreakdown).
    const editScoreBreakdown = computed(() => {
      const a = editAnalytics.value
      const b = editModal.value.form || {}

      let weeklyViews = a.weeklyViews || []
      if (weeklyViews.length === 0 && (a.views || 0) > 0) weeklyViews = [a.views]

      // 1. Recent Activity (30%) — avg weekly views over last 4 weeks, benchmark 100/wk
      const recentWeeks = weeklyViews.slice(-4)
      const recentAvg = recentWeeks.length
        ? recentWeeks.reduce((s, v) => s + v, 0) / recentWeeks.length : 0
      const recentActivity = Math.min((recentAvg / 100) * 100, 100)

      // 2. Engagement Quality (25%) — saves*3 + aiAsk*2 + moreImages, benchmark 300
      const engagementRaw =
        (a.saves || 0) * 3 + (a.aiAsk || 0) * 2 + (a.moreImages || 0)
      const engagement = Math.min((engagementRaw / 300) * 100, 100)

      // 3. Conversion Actions (30%) — sum all intent clicks, benchmark 150
      const conversionRaw =
        (a.directionClicks || 0) + (a.phoneClicks || 0) + (a.websiteClicks || 0) +
        (a.searchClicks || 0) + (a.instagramClicks || 0) + (a.facebookClicks || 0) +
        (a.tripadvisorClicks || 0)
      const conversions = Math.min((conversionRaw / 150) * 100, 100)

      // 4. Profile Completeness (15%) — 5 groups × 20pts
      let completeness = 0
      if (b.description?.short)                          completeness += 20
      if (b.description?.detailed)                       completeness += 20
      if ((b.images || []).length >= 3)                  completeness += 20
      if (b.contact?.phone || b.contact?.website)        completeness += 20
      if ((b.description?.highlights || []).length >= 2) completeness += 20

      return {
        recentActivity: Math.round(recentActivity),
        engagement:     Math.round(engagement),
        conversions:    Math.round(conversions),
        completeness,
      }
    })

    // Conversion channel rows, sorted by count desc. Each row knows whether
    // the corresponding contact field exists (to grey out unconfigured ones).
    const editConversionChannels = computed(() => {
      const a = editAnalytics.value
      const c = editModal.value.form?.contact || {}
      const social = c.socialMedia || {}
      const rows = [
        { key: 'directions', label: 'Directions',   count: a.directionClicks   || 0, has: true,                    color: 'directions' },
        { key: 'search',     label: 'Online Search', count: a.searchClicks     || 0, has: true,                    color: 'search' },
        { key: 'phone',      label: 'Phone Call',    count: a.phoneClicks      || 0, has: !!c.phone,               color: 'phone' },
        { key: 'website',    label: 'Website',       count: a.websiteClicks    || 0, has: !!c.website,             color: 'website' },
        { key: 'instagram',  label: 'Instagram',     count: a.instagramClicks  || 0, has: !!social.instagram,      color: 'instagram' },
        { key: 'facebook',   label: 'Facebook',      count: a.facebookClicks   || 0, has: !!social.facebook,       color: 'facebook' },
        { key: 'tripadvisor',label: 'TripAdvisor',   count: a.tripadvisorClicks|| 0, has: !!social.tripadvisor,    color: 'tripadvisor' },
      ]
      const max = Math.max(1, ...rows.map(r => r.count))
      rows.forEach(r => { r.pct = (r.count / max) * 100 })
      return rows.sort((a, b) => b.count - a.count)
    })

    // Total weekly figures for the trend chart (views + clicks together).
    const editWeeklyMax = computed(() => {
      const a = editAnalytics.value
      const vs = a.weeklyViews || []
      const cs = a.weeklyClicks || []
      return Math.max(1, ...vs, ...cs)
    })

    // Combined performance score (matches BusinessDashboard performanceScore).
    const editPerformanceScore = computed(() => {
      const b = editScoreBreakdown.value
      return Math.round(b.recentActivity * 0.30 + b.engagement * 0.25 + b.conversions * 0.30 + b.completeness * 0.15)
    })

    const fmtPct = (n) => {
      if (n == null || isNaN(n)) return '—'
      if (n < 10) return n.toFixed(1) + '%'
      return Math.round(n) + '%'
    }

    const openEdit = (kind, item) => {
      editModal.value.kind = kind
      editModal.value.id = item._id
      editModal.value.isNew = false
      editModal.value.saving = false
      editModal.value.isDragging = false
      editModal.value.uploads = []
      editModal.value.statusBusy = false
      editModal.value.statusConfirm = { action: null, notes: '' }
      editModal.value.galleryIndex = 0
      editModal.value.lightboxOpen = false
      if (kind === 'business') {
        // Build openingHours days with sensible defaults if owner left some unset
        const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        const hoursMap = {}
        ;(item.openingHours?.days || []).forEach(d => { if (d?.day) hoursMap[d.day] = d })
        const hoursDays = DAYS.map(name => hoursMap[name]
          ? { day: name, closed: !!hoursMap[name].closed, open: hoursMap[name].open || '09:00', close: hoursMap[name].close || '18:00' }
          : { day: name, closed: name === 'Sunday', open: '09:00', close: '18:00' })

        editModal.value.form = {
          name: item.name || '',
          type: [...(item.type || [])],
          location: {
            city: item.location?.city || '',
            region: item.location?.region || '',
            country: item.location?.country || '',
            address: item.location?.address || '',
            coordinates: { lat: item.location?.coordinates?.lat ?? null, lng: item.location?.coordinates?.lng ?? null }
          },
          contact: {
            email: item.contact?.email || '',
            showEmail: item.contact?.showEmail ?? false,
            phone: stripPlusFromPhone(item.contact?.phone),
            website: item.contact?.website || '',
            socialMedia: {
              facebook:    item.contact?.socialMedia?.facebook    || '',
              instagram:   item.contact?.socialMedia?.instagram   || '',
              tripadvisor: item.contact?.socialMedia?.tripadvisor || '',
              booking:     item.contact?.socialMedia?.booking     || ''
            }
          },
          description: {
            short: item.description?.short || '',
            detailed: item.description?.detailed || '',
            highlights: padHighlights(item.description?.highlights)
          },
          images: [...(item.images || [])],
          pricing: {
            isFree:   item.pricing?.isFree   ?? false,
            min:      item.pricing?.min      ?? null,
            max:      item.pricing?.max      ?? null,
            average:  item.pricing?.average  ?? null,
            currency: item.pricing?.currency || 'USD'
          },
          partnership: {
            tier: item.partnership?.tier || 'verified',
            monthlyFee: item.partnership?.monthlyFee ?? null,
            priorityScore: item.partnership?.priorityScore ?? 1,
            subscriptionStart: item.partnership?.subscriptionStart || '',
            subscriptionEnd: item.partnership?.subscriptionEnd || ''
          },
          // Auction state — read-only context for the admin (the standing bid,
          // won price, and reservation marker). Not edited here; surfaced in the
          // Partnership section so admins can see a waitlisted business's bid.
          auction: {
            isBidding:             item.auction?.isBidding             ?? false,
            maxBid:                item.auction?.maxBid                ?? null,
            targetZoneKey:         item.auction?.targetZoneKey         || '',
            wonAtPrice:            item.auction?.wonAtPrice            ?? null,
            awaitingApprovalSince: item.auction?.awaitingApprovalSince ?? null
          },
          openingHours: { is24Hours: item.openingHours?.is24Hours ?? false, days: hoursDays },
          // Event schedule — startDate / endDate are absolute UTC instants.
          // They are split into date + time fields EXPRESSED IN THE EVENT'S
          // OWN TIMEZONE so the admin sees "20:00 Moscow", not their own local
          // time. saveEdit() converts them back to UTC. A missing timezone
          // (legacy data) falls back to the venue coordinates' best guess or
          // the admin's browser zone.
          eventSchedule: (() => {
            const tz = item.eventSchedule?.timezone || browserTz()
            const s = splitDateTime(item.eventSchedule?.startDate, tz)
            const e = splitDateTime(item.eventSchedule?.endDate, tz)
            return {
              startDate:   s.date,
              startTime:   s.time,
              endDate:     e.date,
              endTime:     e.time,
              isRecurring: item.eventSchedule?.isRecurring ?? false,
              timezone:    tz
            }
          })(),
          verification: {
            aiScore:        item.verification?.aiScore        ?? null,
            aiNotes:        item.verification?.aiNotes        || '',
            staffApproved:  item.verification?.staffApproved  ?? false,
            staffNotes:     item.verification?.staffNotes     || '',
            verifiedAt:     item.verification?.verifiedAt     || null,
            verifiedAction: item.verification?.verifiedAction || null,
            history: [...(item.verification?.history || [])]
          },
          analytics: { ...(item.analytics || {}) },
          isHiddenGem: item.isHiddenGem ?? false,
          status:      item.status      || 'pending',
          isActive:    item.isActive    ?? true
        }
      } else {
        // Destination — build openingHours days with sensible defaults, same
        // as the business branch above, so a destination that was created
        // before the openingHours field existed still gets 7 rows to edit.
        const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        const hoursMap = {}
        ;(item.openingHours?.days || []).forEach(d => { if (d?.day) hoursMap[d.day] = d })
        const hoursDays = DAYS.map(name => hoursMap[name]
          ? { day: name, closed: !!hoursMap[name].closed, open: hoursMap[name].open || '09:00', close: hoursMap[name].close || '18:00' }
          : { day: name, closed: name === 'Sunday', open: '09:00', close: '18:00' })

        editModal.value.form = {
          name: item.name || '',
          type: [...(item.type || [])],
          location: {
            city: item.location?.city || '',
            country: item.location?.country || '',
            region: item.location?.region || '',
            address: item.location?.address || '',
            coordinates: { lat: item.location?.coordinates?.lat ?? null, lng: item.location?.coordinates?.lng ?? null }
          },
          contact: {
            email: item.contact?.email || '',
            showEmail: item.contact?.showEmail ?? false,
            phone: stripPlusFromPhone(item.contact?.phone),
            website: item.contact?.website || '',
            socialMedia: {
              facebook:    item.contact?.socialMedia?.facebook    || '',
              instagram:   item.contact?.socialMedia?.instagram   || '',
              tripadvisor: item.contact?.socialMedia?.tripadvisor || '',
              booking:     item.contact?.socialMedia?.booking     || ''
            }
          },
          description: item.description || '',
          images: [...(item.images || [])],
          openingHours: { is24Hours: item.openingHours?.is24Hours ?? false, days: hoursDays },
          // Pricing — same defaults as a fresh destination if the document
          // pre-dates the field (older destinations have no pricing object).
          pricing: {
            isFree:   item.pricing?.isFree   ?? true,
            min:      item.pricing?.min      ?? null,
            max:      item.pricing?.max      ?? null,
            average:  item.pricing?.average  ?? null,
            currency: item.pricing?.currency || 'USD'
          },
          analytics: { ...(item.analytics || {}) },
          bestTimeToVisit: item.bestTimeToVisit || '',
          popularity: item.popularity ?? 0,
          isHiddenGem: item.isHiddenGem ?? false,
          isActive: item.isActive ?? true,
          // Read-only in the form; rendered as a label.
          createdBy: item.createdBy || null
        }
      }
      editModal.value.open = true
      document.body.style.overflow = 'hidden'
    }

    const closeEdit = () => {
      editModal.value.open = false
      document.body.style.overflow = ''
    }

    // ── Add a new destination ─────────────────────────────────────────────────
    // Opens the same modal as openEdit but seeded with blankDestination() and
    // flagged as isNew. saveEdit branches on isNew to POST instead of PATCH.
    // (No companion function for businesses yet — admin onboarding of
    // businesses goes through a different flow.)
    const openCreateDestination = () => {
      editModal.value.kind = 'destination'
      editModal.value.id = null
      editModal.value.isNew = true
      editModal.value.saving = false
      editModal.value.isDragging = false
      editModal.value.uploads = []
      editModal.value.statusBusy = false
      editModal.value.statusConfirm = { action: null, notes: '' }
      editModal.value.galleryIndex = 0
      editModal.value.lightboxOpen = false
      editModal.value.form = blankDestination()
      editModal.value.open = true
      document.body.style.overflow = 'hidden'
    }

    // ── Destination Location Map ──────────────────────────────────────────────
    // Same approach as BusinessOnboarding.vue: free Nominatim geocoder + Leaflet
    // loaded from CDN on demand. No backend dependency. The map auto-locates
    // when the admin types an address + city; the marker is draggable so they
    // can nudge the exact spot if Nominatim's hit is slightly off (it usually
    // resolves to the street centroid, not the building).
    //
    // Differences from BusinessOnboarding's map:
    //   - No zone rings — destinations don't have a per-zone limit.
    //   - No 3-slot competitor display — nearby businesses are shown as faint
    //     reference dots for context only (admin awareness, not a block).
    //   - Marker is draggable; dragging writes lat/lng back into the form.
    let destLeafletMap = null
    let destMarker     = null
    let destGeoDebounce = null
    const destMap = ref({
      loading:    false,
      statusClass: 'idle',          // idle | searching | found | error
      statusText: 'Waiting for address…',
      canSearch:  false,
    })

    // Has enough input to attempt a geocode? Avoids hammering Nominatim on
    // every keystroke before the admin has finished typing.
    const destHasGeoQuery = () => {
      const f = editModal.value.form
      if (!f || !f.location) return false
      const addr = (f.location.address || '').trim()
      const city = (f.location.city    || '').trim()
      // Same threshold as BusinessOnboarding (≥5 char address + any city)
      return addr.length >= 5 && city.length >= 1
    }

    // Nominatim call. Same format as BusinessOnboarding.geocodeAddress.
    async function destGeocode(address, city, country) {
      const q = [address, city, country].filter(Boolean).join(', ')
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) return null
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }

    // Fetch businesses near the destination's city. Reuses the admin
    // /businesses endpoint (which already supports a `location` filter). We
    // pull up to 50 and then filter client-side by distance to keep the map
    // uncluttered. If the call fails we just skip — the map still works.
    async function destFetchNearby(city, center) {
      if (!city || !center) return []
      try {
        const params = new URLSearchParams({
          page: 1, limit: 50, status: 'active', location: city
        })
        const res = await apiFetch(`/businesses?${params}`)
        const list = res?.data?.businesses || []
        // Keep only those with usable coords within ~3 km of the destination.
        // 3 km comfortably covers any reasonable zoom level while keeping the
        // marker layer light.
        const haversine = (a, b) => {
          const R = 6371e3
          const toRad = d => d * Math.PI / 180
          const dLat = toRad(b.lat - a.lat)
          const dLng = toRad(b.lng - a.lng)
          const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2
          return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
        }
        return list
          .map(b => {
            const c = b.location?.coordinates
            if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') return null
            return { name: b.name, tier: b.partnership?.tier || 'verified', lat: c.lat, lng: c.lng }
          })
          .filter(Boolean)
          .filter(b => haversine(center, b) <= 3000)
          .slice(0, 30)   // cap to 30 markers
      } catch (e) {
        console.warn('[DestMap] nearby fetch failed', e)
        return []
      }
    }

    // Ensures Leaflet is loaded from CDN, then renders/updates the map.
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
        const el = document.getElementById('dest-map')
        if (!el) return
        const center = [coords.lat, coords.lng]
        const isNight = theme.value === 'night-mode'
        // Tear down any previous instance so re-rendering on edit→edit works.
        if (destLeafletMap) {
          try { destLeafletMap.remove() } catch {}
          destLeafletMap = null
          destMarker     = null
        }
        destLeafletMap = L.map('dest-map', {
          zoomControl: false, dragging: true, scrollWheelZoom: false, attributionControl: false
        }).setView(center, 15)
        const tileUrl = isNight
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        L.tileLayer(tileUrl, { attribution: '', subdomains: 'abcd', maxZoom: 19, detectRetina: true }).addTo(destLeafletMap)
        // Custom zoom control (top-right, matches BusinessOnboarding styling)
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

        // Nearby businesses — faint reference dots only (no zone rings).
        const nearby = await destFetchNearby(editModal.value.form.location.city, coords)
        const tierFill = { signature: '#e53e3e', spotlight: '#f97316', verified: '#a78bfa' }
        nearby.forEach(b => {
          const fill = tierFill[b.tier] || '#a78bfa'
          L.marker([b.lat, b.lng], { icon: L.divIcon({
            className: '',
            html: `<div style="width:10px;height:10px;border-radius:50%;background:${fill};border:1.5px solid white;opacity:0.55;box-shadow:0 0 4px ${fill}66"></div>`,
            iconSize: [10, 10], iconAnchor: [5, 5]
          })}).addTo(destLeafletMap).bindPopup(`<strong>${b.name}</strong><br><span style="opacity:0.7;text-transform:capitalize">${b.tier}</span>`)
        })

        // The destination pin itself — gold, draggable. Dragging writes the
        // new lat/lng back into the form so the inputs stay in sync. We use
        // the standard Leaflet marker for drag support (divIcon doesn't drag
        // as cleanly cross-browser).
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
        destMarker = L.marker(center, { icon: pinIcon, draggable: true })
          .addTo(destLeafletMap)
          .bindPopup('<strong>Destination location</strong><br><span style="opacity:0.7">Drag to fine-tune</span>')
        destMarker.on('dragend', (e) => {
          const ll = e.target.getLatLng()
          editModal.value.form.location.coordinates.lat = +ll.lat.toFixed(6)
          editModal.value.form.location.coordinates.lng = +ll.lng.toFixed(6)
          destMap.value.statusClass = 'found'
          destMap.value.statusText  = 'Pin moved — coordinates updated'
        })
      })
    }

    // Main entrypoint — runs on watcher trigger or "Re-locate" click.
    async function geocodeAndRenderDestination() {
      // Guard: only relevant when the edit modal is actually open. The map is
      // shared between business and destination edits, so we no longer gate
      // on kind — but the watcher below still guards the debounce trigger.
      if (!editModal.value.open) return
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
          editModal.value.form.location.address,
          editModal.value.form.location.city,
          editModal.value.form.location.country
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
      // Write coords back into the form (auto-fill the lat/lng inputs).
      editModal.value.form.location.coordinates.lat = +coords.lat.toFixed(6)
      editModal.value.form.location.coordinates.lng = +coords.lng.toFixed(6)
      destMap.value.statusClass = 'found'
      destMap.value.statusText  = 'Located'
      await destRenderMap(coords)
    }

    // Exposed to the template "Re-locate from address" button.
    const reGeocodeDestination = () => geocodeAndRenderDestination()

    // Watcher: re-geocode whenever the address/city/country changes. Debounced
    // 800ms (same as BusinessOnboarding) so we don't fire while typing. Only
    // active when the destination modal is open.
    watch(
      () => [
        editModal.value.open,
        editModal.value.kind,
        editModal.value.form?.location?.address,
        editModal.value.form?.location?.city,
        editModal.value.form?.location?.country,
      ],
      () => {
        // Map is shared between business and destination edits.
        if (!editModal.value.open) return
        destMap.value.canSearch = destHasGeoQuery()
        clearTimeout(destGeoDebounce)
        destGeoDebounce = setTimeout(geocodeAndRenderDestination, 800)
      }
    )

    // When the modal opens for editing an existing business/destination that
    // already has coordinates, render the map immediately (skip geocoding).
    // Reset map state on close.
    watch(() => editModal.value.open, async (open) => {
      if (!open) {
        clearTimeout(destGeoDebounce)
        if (destLeafletMap) { try { destLeafletMap.remove() } catch {}; destLeafletMap = null; destMarker = null }
        destMap.value = { loading: false, statusClass: 'idle', statusText: 'Waiting for address…', canSearch: false }
        return
      }
      // Map is shared between business and destination edits — no kind guard.
      const c = editModal.value.form?.location?.coordinates
      if (c && typeof c.lat === 'number' && typeof c.lng === 'number' && (c.lat || c.lng)) {
        destMap.value.statusClass = 'found'
        destMap.value.statusText  = 'Saved location'
        destMap.value.canSearch   = destHasGeoQuery()
        await destRenderMap({ lat: c.lat, lng: c.lng })
      } else {
        destMap.value.canSearch = destHasGeoQuery()
        if (destMap.value.canSearch) {
          // Address/city already filled — auto-locate.
          geocodeAndRenderDestination()
        }
      }
    })

    // ── Status quick actions (Approve / Freeze / Reject) ──────────────────────
    // These call dedicated admin endpoints rather than the generic PATCH so the
    // backend can handle side effects (zone allocation on approve, notifying
    // the owner on freeze/reject, appending to the verification audit trail).
    const openStatusConfirm = (action) => {
      editModal.value.statusConfirm = { action, notes: '' }
    }
    const closeStatusConfirm = () => {
      editModal.value.statusConfirm = { action: null, notes: '' }
    }
    const executeStatusAction = async () => {
      const action = editModal.value.statusConfirm.action
      const id = editModal.value.id
      if (!action || !id) return
      // Reject / permanent-reject / downgrade all require a note (sent to owner
      // and/or recorded in the audit trail). UI also enforces this on the button.
      const needsNote = action === 'reject' || action === 'reject_permanent' || action === 'downgrade'
      if (needsNote && !editModal.value.statusConfirm.notes.trim()) {
        showToast('A note is required', 'error')
        return
      }
      editModal.value.statusBusy = true
      try {
        // Endpoint + body mapping:
        //   reject            → POST /reject  { reason }
        //   reject_permanent  → POST /reject  { reason, permanent: true }
        //   downgrade         → POST /downgrade-rejection { notes }
        //   everything else   → POST /:action { notes }
        let endpoint, body
        if (action === 'reject' || action === 'reject_permanent') {
          endpoint = 'reject'
          body = { reason: editModal.value.statusConfirm.notes, permanent: action === 'reject_permanent' }
        } else if (action === 'downgrade') {
          endpoint = 'downgrade-rejection'
          body = { notes: editModal.value.statusConfirm.notes }
        } else {
          endpoint = action
          body = { notes: editModal.value.statusConfirm.notes }
        }
        const res = await apiFetch(`/businesses/${id}/${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(body)
        })
        const updated = res.data || {}
        // Update the form so the status pill + audit trail refresh in place
        editModal.value.form.status = updated.status || editModal.value.form.status
        if (updated.verification) editModal.value.form.verification = {
          ...editModal.value.form.verification,
          ...updated.verification,
          history: [...(updated.verification.history || editModal.value.form.verification.history || [])]
        }
        if (typeof updated.isActive === 'boolean') editModal.value.form.isActive = updated.isActive
        // Mirror the change into the table row so the column reflects it without a refetch
        const idx = businesses.value.findIndex(b => b._id === id)
        if (idx !== -1) {
          businesses.value[idx].status = editModal.value.form.status
          if (typeof updated.isActive === 'boolean') businesses.value[idx].isActive = updated.isActive
        }
        const verb = action === 'approve'  ? 'approved'
                    : action === 'freeze'   ? 'frozen'
                    : action === 'reject'   ? 'rejected'
                    : action === 'reject_permanent' ? 'permanently rejected'
                    : action === 'downgrade' ? 'downgraded to a soft rejection'
                    : action === 'pending'  ? 'reset to pending'
                    : action === 'waitlist' ? 'moved to waitlist'
                    : action
        showToast(`"${editModal.value.form.name}" ${verb}`)
        closeStatusConfirm()
      } catch (e) {
        showToast(e.message, 'error')
      } finally {
        editModal.value.statusBusy = false
      }
    }

    const toggleType = (t) => {
      const arr = editModal.value.form.type
      const idx = arr.indexOf(t)
      if (idx === -1) arr.push(t)
      else arr.splice(idx, 1)
    }

    const processImageFiles = (files) => {
      const MAX_SIZE = 5 * 1024 * 1024
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return
        if (file.size > MAX_SIZE) {
          showToast(`"${file.name}" exceeds 5 MB limit`, 'error')
          return
        }
        const upItem = { name: file.name, progress: 0, preview: null, error: false }
        editModal.value.uploads.push(upItem)
        const idx = editModal.value.uploads.length - 1

        // Generate preview immediately
        const previewReader = new FileReader()
        previewReader.onload = e => { editModal.value.uploads[idx].preview = e.target.result }
        previewReader.readAsDataURL(file)

        // Read as base64 for storage
        const reader = new FileReader()
        reader.onprogress = e => {
          if (e.lengthComputable) editModal.value.uploads[idx].progress = Math.round((e.loaded / e.total) * 90)
        }
        reader.onload = e => {
          editModal.value.uploads[idx].progress = 100
          editModal.value.form.images.push(e.target.result)
        }
        reader.onerror = () => {
          editModal.value.uploads[idx].error = true
          showToast(`Failed to read "${file.name}"`, 'error')
        }
        reader.readAsDataURL(file)
      })
    }

    const onImageDrop = (e) => {
      editModal.value.isDragging = false
      processImageFiles(e.dataTransfer.files)
    }

    const onImageFileSelect = (e) => {
      processImageFiles(e.target.files)
      e.target.value = '' // reset so same file can be re-selected
    }

    const saveEdit = async () => {
      if (!editModal.value.form.name?.trim()) { showToast('Name is required', 'error'); return }
      if (!editModal.value.form.type?.length) { showToast('At least one type is required', 'error'); return }
      // Event schedule guard — a one-time event needs a start date, and an end
      // date (if given) can't precede the start. Recurring events skip this:
      // their timing lives entirely in the weekly Opening Hours grid.
      if (editModal.value.kind === 'business'
          && (editModal.value.form.type || []).includes('events')) {
        const es = editModal.value.form.eventSchedule || {}
        if (!es.isRecurring) {
          if (!es.startDate) { showToast('Event start date is required', 'error'); return }
          if (es.endDate && es.endDate < es.startDate) {
            showToast('Event end date cannot be before the start date', 'error'); return
          }
          // Same-day event with both times set: end must be after start.
          if (es.startTime && es.endTime
              && (!es.endDate || es.endDate === es.startDate)
              && es.endTime <= es.startTime) {
            showToast('Event end time must be after the start time', 'error'); return
          }
        }
      }
      editModal.value.saving = true
      try {
        const kind = editModal.value.kind
        const id = editModal.value.id
        const isNew = editModal.value.isNew
        // Deep-copy payload so we don't mutate the form
        const payload = JSON.parse(JSON.stringify(editModal.value.form))
        // Clean empty string image entries
        if (Array.isArray(payload.images)) payload.images = payload.images.filter(u => u && u.trim())
        // Phone is stored with a leading "+", but the form input shows the
        // "+" as a fixed prefix decoration and the model carries digits +
        // spaces only. Re-add the "+" here so the stored value stays
        // consistent. Empty input → empty string (no bare "+").
        if (payload.contact) {
          payload.contact.phone = addPlusToPhone(payload.contact.phone)
        }
        // Strip empty highlight slots — UI shows 5 fixed inputs, schema stores a dense array.
        // Only businesses have highlights (under description.highlights); destinations no longer do.
        if (Array.isArray(payload.description?.highlights)) {
          payload.description.highlights = payload.description.highlights.map(h => (h || '').trim()).filter(Boolean)
        }
        // Keep isHiddenGem in sync with the 'hidden_gems' chip in Types & Tags.
        // The Hidden Gem toggle was removed from the Partnership section; the
        // chip is now the single source of truth for both sides of this flag.
        if (kind === 'business' && Array.isArray(payload.type)) {
          payload.isHiddenGem = payload.type.includes('hidden_gems')
        }
        // `auction` is surfaced in the edit panel for READ-ONLY context (the
        // standing bid / won price). It must never be written back from this
        // form — the auction service (zoneAuction) owns those fields. Strip it
        // so a stale form copy can't clobber a live bid on save.
        if (payload.auction) delete payload.auction
        // ── Event schedule ────────────────────────────────────────────────
        // The form holds the schedule split into separate date + time fields
        // (startDate/startTime/endDate/endTime). The backend expects a single
        // ISO datetime per bound: startDate and endDate. Recombine them here,
        // mirroring BusinessOnboarding.vue's buildEventSchedulePayload():
        //   • start with no time → 00:00 (event runs from start of day)
        //   • end with no time   → 23:59 (event runs to end of day)
        //   • an end time but no end date → falls back to the start date
        //     (a single-day event with an explicit close time)
        // We send explicit null (not undefined) for empty bounds: undefined keys
        // are stripped by JSON.stringify, which would leave the key absent and
        // make "user cleared the end date" indistinguishable from "field not
        // touched". The admin route $sets the whole eventSchedule object, so an
        // explicit null reliably clears a previously-stored value. A recurring
        // event has no fixed date, so both dates go null in that mode.
        // Non-event listings get eventSchedule dropped entirely so we never
        // write the field onto a restaurant/hotel.
        if (kind === 'business') {
          if (Array.isArray(payload.type) && payload.type.includes('events') && payload.eventSchedule) {
            const es = payload.eventSchedule
            const recurring = !!es.isRecurring
            // Times entered in the modal are in the EVENT's timezone; convert
            // them back to absolute UTC against that same zone before sending.
            const tz = es.timezone || browserTz()
            const startDate = recurring ? '' : combineDateTime(es.startDate, es.startTime, '00:00', tz)
            const endDateRaw = recurring ? '' : (es.endDate || (es.endTime ? es.startDate : ''))
            const endDate = recurring ? '' : combineDateTime(endDateRaw, es.endTime, '23:59', tz)
            payload.eventSchedule = {
              startDate: startDate || null,
              endDate:   endDate   || null,
              isRecurring: recurring,
              // Always ship the timezone — it is part of the schedule's
              // identity and the backend needs it to render the event later.
              timezone: tz
            }
          } else {
            // Not an event — don't ship the field at all.
            delete payload.eventSchedule
          }
        }
        // Same rule for destinations — the chip drives the flag.
        if (kind === 'destination' && Array.isArray(payload.type)) {
          payload.isHiddenGem = payload.type.includes('hidden_gems')
        }
        // Drop fields the backend doesn't accept on create/update (createdBy
        // is set server-side from req.user; analytics are zero-initialised by
        // the schema). Keeps the request body lean.
        if (kind === 'destination') {
          delete payload.createdBy
          if (isNew) delete payload.analytics
        }

        // Branch on isNew: POST to create, PATCH to update. The two endpoints
        // return slightly different shapes (POST already populates createdBy,
        // PATCH does too — both lean) so the merge below is the same.
        const baseUrl = `/${kind === 'business' ? 'businesses' : 'destinations'}`
        const res = isNew
          ? await apiFetch(baseUrl,            { method: 'POST',  body: JSON.stringify(payload) })
          : await apiFetch(`${baseUrl}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })

        // Merge saved data back into the local list.
        // res.data may omit fields not in the list .select() (e.g. images),
        // so we explicitly carry our payload values forward too.
        const merged = { ...payload, ...res.data, images: res.data?.images ?? payload.images }
        if (kind === 'business') {
          const targetId = res.data?._id || id
          const idx = businesses.value.findIndex(b => b._id === targetId)
          if (idx !== -1) Object.assign(businesses.value[idx], merged)
          else if (isNew) businesses.value.unshift(merged)
        } else {
          const targetId = res.data?._id || id
          const idx = destinations.value.findIndex(d => d._id === targetId)
          if (idx !== -1) Object.assign(destinations.value[idx], merged)
          else if (isNew) destinations.value.unshift(merged)
        }
        showToast(`"${payload.name}" ${isNew ? 'created' : 'saved'} successfully`)
        closeEdit()
        // Refresh the destinations summary (Total / Hidden Gems counts) after
        // a create so the KPI cards stay in sync with the directory.
        if (isNew && kind === 'destination') fetchDestinations()
      } catch (e) {
        showToast(e.message, 'error')
      } finally {
        editModal.value.saving = false
      }
    }
    
    // ─────────────────────────────────────────────────────────────────────────

    watch(activeTab, (tab) => {
      if (tab === 'users') { if (!users.value.length) fetchUsers(); if (!aiUsers.value.length) fetchAIUsage(); if (!userLocations.value.byCountry.length) fetchUserLocations() }
      if (tab === 'ai' && !aiUsers.value.length) fetchAIUsage()
      if (tab === 'ai' && !aiProvider.value.updatedAt) fetchAiProvider()
      if (tab === 'ai') fetchProviderStats()
      if (tab === 'businesses' && !businesses.value.length) fetchBusinesses()
      if (tab === 'destinations' && !destinations.value.length) fetchDestinations()
      if (tab === 'places' && !places.value.length) fetchPlaces()
      if (tab === 'google' && !googleUsage.value.totalPlaces) fetchGoogleUsage()
      // The Google Prefetch control lives on this tab but writes AppConfig via
      // /ai-provider. Load that config here too so saving from the Google tab never
      // overwrites the provider/model/web-search settings with unloaded defaults.
      if (tab === 'google' && !aiProvider.value.updatedAt) fetchAiProvider()
      if (tab === 'prices') { if (!googleUsage.value.totalPlaces) fetchGoogleUsage(); if (!dbStats.value) fetchDbStats(); if (!mongoBilling.value) fetchMongoBilling() }
      if (tab === 'staff' && !staffList.value.length) fetchStaff()
    })

    onMounted(fetchAll)

    const userFilterOpts = [
      { value: 'all', label: 'All' },
      { value: 'premium', label: 'Premium' },
      { value: 'free', label: 'Free' },
      { value: 'active', label: 'Active' },
    ]
    const destFilterOpts = [
      { value: '', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'hidden_gem', label: 'Hidden Gems' },
    ]
    const bizPartnerFilterOpts = [
      { value: '', label: 'All' },
      { value: 'true', label: 'Spotlight & Signature' },
      { value: 'false', label: 'Verified only' },
    ]
    const bizStatusFilterOpts = [
      { value: '',           label: 'All statuses' },
      { value: 'pending',    label: 'Pending' },
      { value: 'active',     label: 'Active' },
      { value: 'frozen',     label: 'Frozen' },
      { value: 'waitlisted', label: 'Waitlisted' },
      { value: 'rejected',   label: 'Rejected' },
    ]
    const placesImageFilterOpts = [
      { value: '', label: 'All' },
      { value: 'true', label: 'Has image' },
      { value: 'false', label: 'No image' },
    ]
    // Quick-action filter for the cache view. Values match PlaceCache.actions tags
    // (the action a place was actually shown under), so e.g. 'hotels' shows only
    // places served under the Hotels button.
    const placesActionOpts = [
      { value: '',            label: 'All' },
      { value: 'restaurants', label: 'Restaurants' },
      { value: 'hotels',      label: 'Hotels' },
      { value: 'historical',  label: 'Historical' },
      { value: 'hidden_gems', label: 'Hidden gems' },
      { value: 'events',      label: 'Events' },
      { value: 'photo_spots', label: 'Photo spots' },
      { value: 'shopping',    label: 'Shopping' },
    ]
    const placesSortOpts = [
      { value: 'useCount', label: 'Most used' },
      { value: 'fetchCount', label: 'Most fetched' },
      { value: 'lastUsed', label: 'Recently used' },
      { value: 'neverUsed', label: 'Never used' },
      { value: 'createdAt', label: 'Newest' },
    ]
    // DeepSeek V3 actual pricing (2025):
    //   Input:  $0.27/1M tokens (cache miss) · $0.07/1M (cache hit)
    //   Output: $1.10/1M tokens
    // Blended ~$0.50/1M assuming typical 60% input / 40% output mix with ~80% cache hit rate on input
    const DEEPSEEK_RATE_BLENDED = 0.50 / 1_000_000
    // Claude Haiku 4.5: $1/1M input, $5/1M output. We only store total tokens,
    // so this is a blended estimate (assumes input-heavy chat). Adjust if you
    // switch the model to Sonnet ($3/$15). Web search billed separately at $0.01/search.
    const CLAUDE_RATE_BLENDED = 2.00 / 1_000_000
    const CLAUDE_SEARCH_RATE = 0.01
    const fmtCost = (cost) => {
      if (cost <= 0) return '0.000'
      if (cost < 0.001) return '< 0.001'
      if (cost < 1) return cost.toFixed(3)
      if (cost < 1000) return cost.toFixed(2)
      return fmtK(Math.round(cost))
    }
    const deepseekCost = computed(() => {
      const s = providerStats.value.summary.deepseek
      return fmtCost((s.tokens || 0) * DEEPSEEK_RATE_BLENDED)
    })
    const claudeCost = computed(() => {
      const s = providerStats.value.summary.claude
      return fmtCost((s.tokens || 0) * CLAUDE_RATE_BLENDED + (s.searches || 0) * CLAUDE_SEARCH_RATE)
    })
    const aiCost = computed(() => {
      const tokens = aiSummary.value.totalTokens || 0
      return fmtCost(tokens * DEEPSEEK_RATE_BLENDED)
    })
    const todayCost = computed(() => {
      const tokens = aiSummary.value.todayTokens || 0
      return fmtCost(tokens * DEEPSEEK_RATE_BLENDED)
    })

    // Google Places API (New) — March 2025+ pricing. Each call type hits a
    // different SKU with its own rate and free monthly threshold; the caps
    // don't pool. The backend computes all of this from the rates baked into
    // /google-usage and ships per-SKU breakdowns in googleUsage.pricing, so
    // the frontend just reads the numbers instead of duplicating the table.
    //
    // Why "totalCost" doesn't apply free caps: it's lifetime, across many
    // months — caps reset monthly, so subtracting a single cap from a lifetime
    // total would understate cost. We show the raw "what you would have paid
    // without free tier" number. The monthly total in the KPI tile and the
    // "this month's cost" row use the real billed amount (caps applied).
    const googleBillable = (calls, free) => Math.max(0, (calls || 0) - (free || 0))
    const googleMonthCost = computed(() => {
      const u = googleUsage.value
      const p = u.pricing
      if (!p) return '0.00'
      const cost =
        googleBillable(u.monthFindCalls,    p.find.free)    * p.find.rate +
        googleBillable(u.monthDetailsCalls, p.details.free) * p.details.rate +
        googleBillable(u.monthGeocodeCalls, p.geocode.free) * p.geocode.rate +
        googleBillable(u.monthImageCalls,   p.photo.free)   * p.photo.rate
      return cost.toFixed(2)
    })
    const googleTodayCost = computed(() => {
      // Today is fractional within the monthly free window — show the raw
      // "would cost if no free tier" so the user sees activity-level signal,
      // not a flat $0 every day until the cap is exceeded.
      const u = googleUsage.value
      const p = u.pricing
      if (!p) return '0.000'
      const cost =
        (u.todayFindCalls    || 0) * p.find.rate +
        (u.todayDetailsCalls || 0) * p.details.rate +
        (u.todayGeocodeCalls || 0) * p.geocode.rate +
        (u.todayImageCalls   || 0) * p.photo.rate
      return cost.toFixed(3)
    })
    const googleTotalCost = computed(() => {
      const u = googleUsage.value
      const p = u.pricing
      if (!p) return '0.00'
      const cost =
        (u.totalFindCalls    || 0) * p.find.rate +
        (u.totalDetailsCalls || 0) * p.details.rate +
        (u.totalGeocodeCalls || 0) * p.geocode.rate +
        (u.totalImageCalls   || 0) * p.photo.rate
      return cost.toFixed(2)
    })
    const monthlyAiCost = computed(() => (((aiSummary.value.todayTokens || 0) * 30) * DEEPSEEK_RATE_BLENDED).toFixed(2))
    const monthlyGoogleCost = computed(() => parseFloat(googleMonthCost.value).toFixed(2))

    // Per-SKU rows for the Google Places price card. We build them off the
    // pricing block the backend ships, so the labels and rates stay in sync
    // with whatever rates the backend is actually billing at.
    const googleSkuRows = computed(() => {
      const u = googleUsage.value
      const p = u.pricing
      if (!p) return []
      const skus = [
        { key: 'find',    p: p.find,    monthCalls: u.monthFindCalls    || 0 },
        { key: 'details', p: p.details, monthCalls: u.monthDetailsCalls || 0 },
        { key: 'geocode', p: p.geocode, monthCalls: u.monthGeocodeCalls || 0 },
        { key: 'photo',   p: p.photo,   monthCalls: u.monthImageCalls   || 0 },
      ]
      return skus.map(s => ({
        key:       s.key,
        label:     s.p.label,
        per1k:     s.p.per1k,
        rate:      s.p.rate,
        free:      s.p.free,
        monthCalls: s.monthCalls,
        monthCost: googleBillable(s.monthCalls, s.p.free) * s.p.rate,
      }))
    })

    // ── MongoDB Atlas billing helpers ─────────────────────────────────────
    // Atlas SKUs are internal codes (e.g. ATLAS_FLEX_AWS_100_USAGE_HOURS). Map
    // the ones we expect to human-readable labels; fall through to a cleaned-up
    // version of the raw SKU so new SKUs still display reasonably without code
    // changes (e.g. if you enable Atlas Search later, you'll see "Atlas Search"
    // automatically once the right SKU lands in the map).
    const SKU_LABELS = {
      'ATLAS_FLEX_AWS_100_USAGE_HOURS':    'Flex usage (0–100 ops/sec)',
      'ATLAS_FLEX_AWS_200_USAGE_HOURS':    'Flex usage (100–200 ops/sec)',
      'ATLAS_FLEX_AWS_300_USAGE_HOURS':    'Flex usage (200–300 ops/sec)',
      'ATLAS_FLEX_AWS_400_USAGE_HOURS':    'Flex usage (300–400 ops/sec)',
      'ATLAS_FLEX_AWS_500_USAGE_HOURS':    'Flex usage (400–500 ops/sec)',
      'ATLAS_FLEX_AWS_STORAGE':            'Flex storage',
      'ATLAS_BACKUP_STORAGE':              'Backup storage',
      'ATLAS_BACKUP_DOWNLOAD':             'Backup download',
      'ATLAS_DATA_TRANSFER':               'Data transfer',
      'ATLAS_DATA_TRANSFER_INTERNET':      'Data transfer (internet)',
      'ATLAS_DATA_TRANSFER_REGIONAL':      'Data transfer (regional)',
      'ATLAS_SEARCH':                      'Atlas Search',
      'ATLAS_VECTOR_SEARCH':               'Vector Search',
      'ATLAS_STREAM_PROCESSING':           'Stream Processing',
    }
    const prettySku = (sku) => {
      if (!sku) return 'Other'
      if (SKU_LABELS[sku]) return SKU_LABELS[sku]
      // Generic fallback: ATLAS_FOO_BAR_BAZ → "Foo Bar Baz"
      return sku
        .replace(/^ATLAS_/, '')
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    }

    // Project month-to-date Atlas spend to a full-month estimate. We divide
    // MTD by days elapsed in the billing period, then multiply by total days
    // in the period. This is the right number for "how much will Mongo cost
    // me this month" — much more useful for budgeting than raw MTD, which
    // is artificially small early in the month.
    //
    // Edge cases handled: missing dates → fall back to Flex base $8. Zero
    // days elapsed (first hour of the month) → fall back to $8 to avoid
    // dividing by zero. Atlas may also return $0 MTD for a few hours after
    // a fresh cluster — we still show $8 (the base) in that case.
    const projectedMongoCost = computed(() => {
      const mb = mongoBilling.value
      if (!mb || !mb.available || typeof mb.totalCost !== 'number' || !mb.periodStart || !mb.periodEnd) {
        return 8.00
      }
      const start = new Date(mb.periodStart).getTime()
      const end   = new Date(mb.periodEnd).getTime()
      const now   = Math.min(Date.now(), end)
      const elapsedDays = (now - start) / 86400000
      const totalDays   = (end - start) / 86400000
      if (elapsedDays <= 0 || totalDays <= 0) return Math.max(8.00, mb.totalCost)
      const projected = (mb.totalCost / elapsedDays) * totalDays
      // Flex always costs at least $8 — clamp the lower bound. Cap is $30
      // for pure Flex usage, but other SKUs (storage, backups) can push
      // above $30 so we don't clamp the upper bound.
      return Math.max(8.00, projected)
    })
    const projectedMongoCostStr = computed(() => projectedMongoCost.value.toFixed(2))

    // Real Atlas billing (month-to-date) if available; otherwise Flex base.
    // Used in the price card row that shows raw MTD spend so far.
    const monthlyMongoCost = computed(() => {
      const mb = mongoBilling.value
      if (mb && mb.available && typeof mb.totalCost === 'number') return mb.totalCost.toFixed(2)
      return '8.00'
    })
    // The "Est. Monthly Expenses" KPI sums what each service will cost by
    // end of month, so we use projected Mongo (not MTD) here — MTD would
    // make the total look artificially low until ~the 28th.
    const monthlyTotal = computed(() => (parseFloat(monthlyAiCost.value) + parseFloat(monthlyGoogleCost.value) + projectedMongoCost.value + parseFloat(prices.value.googleExtra || 0)).toFixed(2))
    const monthlyRevenue = computed(() => parseFloat(bizSummary.value.monthlyRevenue || 0).toFixed(2))

    return {
      theme, toggleTheme, handleLogout, loading, activeTab, tabs, currentTabLabel, formattedDate,
      mobileNavItems, mobileNavItemsTripled, loopStrip, onMobileNavClick, onLoopStripScroll,
      overviewData, overview, registrations, premiumPct, barHeight, maxReg,
      users, usersLoading, usersPage, usersTotalPages, userSearch, userFilter, userLocations,
      aiUsers, aiLoading, aiPage, aiTotalPages, aiSummary, aiDailyStats, aiChartDays, aiChartMax, dailyTokenPct, dailyPlacesPct, aiCost, todayCost,
      aiProvider, aiProviderLoading, aiProviderSaving, aiProviderSavedAt, fetchAiProvider, saveAiProvider, setProvider,
      webSearchActionOptions, isSearchActionOn, searchActionCount, toggleSearchAction,
      prefetchLayerOptions, isPrefetchLayerOn, prefetchLayerCount, togglePrefetchLayer,
      isPrefetchActionOn, prefetchActionCount, togglePrefetchAction,
      providerStats, providerStatsLoading, fetchProviderStats, deepseekCost, claudeCost,
      businesses, bizLoading, bizPage, bizTotalPages, bizSearch, bizLocationSearch, bizPartnerFilter, bizStatusFilter, bizSummary,
      destinations, destLoading, destPage, destTotalPages, destSearch, destFilter, destSummary,
      places, placesLoading, placesPage, placesTotalPages, placesSearch, placesImageFilter, placesActionFilter, placesSort, placesSummary,
      googleUsage, googleTopPlaces, googleLoading, googleDailyStats, googleChartDays, googleChartMax, googleTotalCost, googleMonthCost, googleTodayCost, googleSkuRows,
      quickActionStats,
      prefStats, PREF_COLORS, PREF_DOT_COLORS, travelStyleSegments, currencySegments, travelStyleTopPct, currencyTopPct, prefLocTotal, prefBudgetTotal, budgetBucketColor, budgetRangeHint,
      prices, dbStats, mongoBilling, fetchMongoBilling, prettySku, projectedMongoCostStr, monthlyAiCost, monthlyGoogleCost, monthlyMongoCost, monthlyTotal, monthlyRevenue,
      toast, fetchAll, fetchDbStats, fmt, fmtK, initials, shortDate, eventDateLabel, relativeTime, isToday,
      splitDateTime, combineDateTime, eventScheduleSummary,
      eventTimezoneOptions, tzShortLabel,
      togglePremium, toggleCooldown, deleteUser, clearCooldown,
      fetchUsers, fetchUserLocations, fetchAIUsage, fetchBusinesses, fetchDestinations, fetchPlaces, fetchGoogleUsage,
      toggleDestination, deleteDestination, toggleBusiness, deleteBusiness, expandedTypes, debouncedUserFetch, debouncedBizFetch, debouncedPlacesFetch, debouncedDestFetch,
      deletePlace, setExploreStatus, placesExploreFilter, placesExploreOpts, backfillRegions, backfillBusy, purgeStale, onImgError,
      purgeOpts, purgeDays, purgeDropdownOpen, purgeNeverUsed, selectedPurgeOpt,
      userFilterOpts, destFilterOpts, bizPartnerFilterOpts, bizStatusFilterOpts, placesImageFilterOpts, placesActionOpts, placesSortOpts,
      apiBase: API_BASE,
      editModal, ALL_TYPES, PRICING_CURRENCIES, PARTNERSHIP_TIERS, openEdit, openCreateDestination, closeEdit, saveEdit, toggleType, onImageDrop, onImageFileSelect,
      destMap, reGeocodeDestination,
      openStatusConfirm, closeStatusConfirm, executeStatusAction,
      verifierLabel,
      businessHighlightPlaceholders,
      // analytics view-model
      editAnalytics, editConversionRate, editEngagementRate, editLikeRatio, editScoreBreakdown, editConversionChannels, editWeeklyMax, editPerformanceScore, fmtPct,
      // staff
      staffList, staffLoading, staffSearch, staffFiltered, staffSummary, staffAwaitingCount,
      staffModal, staffPwError, staffCanSubmit, staffRevokeTarget, staffRevokeBusy,
      fetchStaff, openStaffCreate, closeStaffCreate, generateStaffPw, submitStaffCreate, copyStaffCreds,
      confirmStaffRevoke, cancelStaffRevoke, executeStaffRevoke,
      // staff assignment editor
      staffAssignModal, openStaffAssign, closeStaffAssign, submitStaffAssign,
    }
  }
}
</script>






<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
/* ── LAYOUT ── */
.admin-shell { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; transition: background 0.35s, color 0.35s; }
.sidebar { width: 155px; flex-shrink: 0; display: flex; flex-direction: column; padding: 0; position: sticky; top: 0; height: 100vh; transition: background 0.35s, border-color 0.35s; overflow: hidden; }
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
/* ── SIDEBAR BRAND ── */
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 5px 10px; }
.brand-icon-wrap { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.brand-logo { width: 60px; height: 60px; object-fit: contain; }
.brand-text-wrap { display: flex; flex-direction: column; }
.brand-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -0.3px; }
.brand-text em { font-style: normal; }
.brand-version { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.5; margin-top: 1px; }
/* ── SIDEBAR NAV ── */
.sidebar-section-label { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; padding: 0 20px 8px; opacity: 0.4; }
.sidebar-nav { flex: 1; padding: 6px 12px; display: flex; flex-direction: column; gap: 8px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: none; background: none; font-size: 12px; font-weight: 500; cursor: pointer; text-align: left; width: 100%; transition: all 0.15s ease; position: relative; }
.nav-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; }
.nav-badge { margin-left: auto; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 20px; font-family: 'DM Mono', monospace; min-width: 18px; text-align: center; }
.nav-active-dot { width: 5px; height: 5px; border-radius: 50%; background: white; opacity: 0.7; flex-shrink: 0; }
/* ── LOGOUT BUTTON ── */
.logout-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: inherit; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.logout-btn:hover { background: rgba(229, 62, 62, 0.1); color: #e53e3e; }
/* ── SIDEBAR FOOTER ── */
.sidebar-spacer { flex: 1; }
.sidebar-footer { padding: 16px 12px 20px; display: flex; flex-direction: column; gap: 8px; }
.theme-toggle { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.15s; width: 100%; }
.theme-toggle-icon { font-size: 15px; flex-shrink: 0; }
.theme-label { flex: 1; text-align: left; }
.admin-chip { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; }
.chip-avatar { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.chip-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.chip-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chip-role { font-size: 10px; font-family: 'DM Mono', monospace; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.05em; }
.chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
/* ── TOPBAR ── */
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 28px; position: sticky; top: 0; z-index: 10; transition: all 0.3s; }
.topbar-breadcrumb { font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0; text-transform: none; margin-bottom: 4px; opacity: 0.45; font-weight: 400; }
.topbar-breadcrumb span { opacity: 1; font-weight: 600; color: inherit; }
.topbar-title h1 { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.2px; line-height: 1; }
.topbar-actions { display: flex; align-items: center; gap: 14px; }
.topbar-date { font-size: 11px; font-family: 'DM Sans', sans-serif; font-weight: 400; opacity: 0.5; }
.refresh-btn { width: 36px; height: 36px; border-radius: 9px; border: none; cursor: pointer; display: grid; place-items: center; transition: all 0.15s; }
.refresh-btn.spinning svg { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }
/* ── CONTENT ── */
.content-area { padding: 6px 28px 28px; flex: 1; }
.tab-section { display: flex; flex-direction: column; gap: 16px; animation: fadeSlideIn 0.2s ease; }
@keyframes fadeSlideIn { from { opacity: 0; } to { opacity: 1; } }
.loading-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: 60vh; }
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
.kpi-value--expense { color: #f87171 !important; }
.kpi-value--income { color: #4ade80 !important; }
.kpi-sub { font-size: 11px; font-family: 'DM Mono', monospace; }
.kpi-progress-bar { margin-top: 10px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.2); overflow: hidden; }
.kpi-progress-fill { height: 100%; border-radius: 2px; background: rgba(255,255,255,0.7); transition: width 0.6s ease; }
.kpi-oldest-name { display: inline-flex; align-items: center; gap: 4px; margin-top: 7px; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-family: 'DM Mono', monospace; cursor: pointer; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: all 0.15s; border: 1px solid currentColor; opacity: 0.6; }
.kpi-oldest-name:hover { opacity: 1; }
/* ── CARDS ── */
.card { border-radius: 14px; overflow: hidden; transition: all 0.2s; }
.card-head { display: flex; align-items: baseline; gap: 10px; padding: 16px 20px 13px; flex-wrap: wrap; }
.card-head h2 { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: -0.2px; }
.card-sub { font-size: 11px; font-family: 'DM Mono', monospace; }
.card-head-spacer { flex: 1; }
/* Google Prefetch control card (Google usage tab) */
.g-prefetch-card .card-head { align-items: center; }
.g-prefetch-body { padding: 2px 20px 14px; display: flex; flex-direction: column; gap: 12px; }
.g-prefetch-foot { padding: 0 20px 18px; display: flex; align-items: center; gap: 12px; }
.ws-chip-hint { opacity: 0.55; font-style: normal; font-size: 10px; margin-left: 2px; }
.chart-legend { display: flex; align-items: center; gap: 6px; font-size: 11px; font-family: 'DM Mono', monospace; opacity: 0.6; }
.legend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
/* ── SPARKBAR CHART ── */
.chart-card { padding-bottom: 4px; }
.sparkbar-wrap { display: flex; align-items: flex-end; gap: 3px; padding: 8px 20px 12px; height: 120px; overflow-x: auto; }
.sparkbar-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; min-width: 16px; cursor: default; }
.sparkbar-col:hover .sparkbar { opacity: 0.85; transform-origin: bottom; }
.sparkbar-value { font-size: 8px; font-family: 'DM Mono', monospace; min-height: 10px; color: transparent; transition: color 0.1s; }
.sparkbar-col:hover .sparkbar-value { color: inherit; }
.sparkbar { width: 100%; border-radius: 3px 3px 0 0; transition: height 0.4s ease, transform 0.15s ease, opacity 0.15s; min-height: 4px; }
.sparkbar-label { font-size: 8px; font-family: 'DM Mono', monospace; white-space: nowrap; }
/* ── TOOLBAR ── */
.toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.search-wrap { display: flex; align-items: center; gap: 8px; flex: 1; max-width: 320px; border-radius: 20px; padding: 0 14px; }
.search-icon { flex-shrink: 0 }
.search-input { flex: 1; border: none; background: transparent; outline: none; padding: 9px 0; font-family: 'DM Sans', sans-serif; font-size: 13px; border-radius: 20px; padding: 9px 14px 9px 14px;}
.filter-select { border-radius: 9px; padding: 9px 32px 9px 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; cursor: pointer; transition: all 0.15s; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A0522D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
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
.data-table th:last-child  { padding-right: 16px; }
.data-table td:last-child  { padding-right: 16px; }
.table-row { transition: background 0.1s; }
.table-row:last-child { border-bottom: none !important; }
.loading-cell, .empty-cell { text-align: center; padding: 40px; font-size: 13px; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex-shrink: 0; font-family: 'Syne', sans-serif; }
.avatar--sm { width: 28px; height: 28px; border-radius: 7px; font-size: 10px; }
.user-name { font-weight: 600; font-size: 13px; }
/* Event date/time line shown under an event listing's name in the directory. */
.biz-event-line {
  display: flex; align-items: center; gap: 4px; margin-top: 3px;
  font-weight: 500; font-size: 10.5px; opacity: 0.7;
  font-family: 'DM Mono', monospace;
}
.biz-event-line svg { flex-shrink: 0; opacity: 0.8; }
.user-email { font-size: 11px; font-family: 'DM Mono', monospace; margin-top: 1px; }
.num-cell { font-family: 'DM Mono', monospace; font-size: 13px; }
.dim-cell { font-size: 12px; font-family: 'DM Mono', monospace; }
.badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 600; font-family: 'DM Mono', monospace; white-space: nowrap; }
/* ── BUSINESS STATUS PILLS ── */
.status-pill { display: inline-block; border: none; padding: 3px 9px; border-radius: 12px; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap }
.status-pill.status-pending    { color: #ca8a04; background: rgba(234,179,8,0.10) }
.status-pill.status-active     { color: #16a34a; background: rgba(34,197,94,0.10) }
.status-pill.status-frozen     { color: #64748b; background: rgba(100,116,139,0.10) }
.status-pill.status-waitlisted { color: #6d28d9; background: rgba(139,92,246,0.10) }
.status-pill.status-rejected   { color: #dc2626; background: rgba(239,68,68,0.10) }
.admin-shell.night-mode .status-pill.status-pending    { color: #fbbf24; background: rgba(251,191,36,0.10) }
.admin-shell.night-mode .status-pill.status-active     { color: #4ade80; background: rgba(34,197,94,0.10) }
.admin-shell.night-mode .status-pill.status-frozen     { color: #94a3b8; background: rgba(148,163,184,0.10) }
.admin-shell.night-mode .status-pill.status-waitlisted { color: #c084fc; background: rgba(192,132,252,0.10) }
.admin-shell.night-mode .status-pill.status-rejected   { color: #fb7185; background: rgba(244,63,94,0.10) }
/* Toolbar wrap: lets the search/filter row break onto multiple lines when there are many controls */
.toolbar.toolbar--wrap { flex-wrap: wrap; row-gap: 8px; }
/* ── Edit modal: status banner with quick actions ───────────────────────── */
.edit-status-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 12px 14px; border-radius: 10px; }
.admin-shell.night-mode .edit-status-bar { background: rgba(139,92,246,0.06) }
.admin-shell.day-mode  .edit-status-bar { background: rgba(212,175,55,0.06) }
.edit-status-bar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.edit-status-label { font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; }
.edit-status-meta { font-size: 11.5px; opacity: 0.7; font-family: 'DM Mono', monospace; }
.edit-status-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.edit-status-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 7px; border: 1px solid transparent; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.edit-status-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.edit-status-btn--approve { background: rgba(34,197,94,0.10); color: #16a34a; }
.edit-status-btn--approve:hover:not(:disabled) { background: rgba(34,197,94,0.20); }
.edit-status-btn--freeze  { background: rgba(234,179,8,0.10); color: #ca8a04; }
.edit-status-btn--freeze:hover:not(:disabled)  { background: rgba(234,179,8,0.22); }
.edit-status-btn--reject  { background: rgba(239,68,68,0.10); color: #dc2626; }
.edit-status-btn--reject:hover:not(:disabled)  { background: rgba(239,68,68,0.20); }
/* Permanent reject — solid red, reads as the heavier, irreversible action. */
.edit-status-btn--reject-permanent { background: #dc2626; color: #fff; }
.edit-status-btn--reject-permanent:hover:not(:disabled) { background: #b91c1c; }
/* Downgrade — sky/blue, a recovery action (opposite of reject). */
.edit-status-btn--downgrade { background: rgba(14,165,233,0.12); color: #0284c7; }
.edit-status-btn--downgrade:hover:not(:disabled) { background: rgba(14,165,233,0.24); }
.status-pill--permanent { text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700; }
/* Test-only buttons: dashed border + slate color so they read clearly as "not the real workflow" */
.edit-status-btn--test    { background: transparent; color: #64748b; border-style: dashed; border-color: rgba(100,116,139,0.45); }
.edit-status-btn--test:hover:not(:disabled)    { background: rgba(100,116,139,0.10); border-color: rgba(100,116,139,0.7); }
.edit-status-btn--pending  { color: #ca8a04; border-color: rgba(234,179,8,0.5); background: rgba(234,179,8,0.06); }
.edit-status-btn--pending:hover:not(:disabled)  { background: rgba(234,179,8,0.16); border-color: rgba(234,179,8,0.75); color: #a16207; }
.edit-status-btn--waitlist { color: #7c3aed; border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.06); }
.edit-status-btn--waitlist:hover:not(:disabled) { background: rgba(139,92,246,0.16); border-color: rgba(139,92,246,0.75); color: #6d28d9; }
.admin-shell.night-mode .edit-status-btn--approve { color: #4ade80; }
.admin-shell.night-mode .edit-status-btn--freeze  { color: #fbbf24; }
.admin-shell.night-mode .edit-status-btn--reject  { color: #fb7185; }
.admin-shell.night-mode .edit-status-btn--test    { color: #94a3b8; border-color: rgba(148,163,184,0.4); }
.admin-shell.night-mode .edit-status-btn--test:hover:not(:disabled) { background: rgba(148,163,184,0.08); border-color: rgba(148,163,184,0.65); }
.admin-shell.night-mode .edit-status-btn--pending  { color: #fbbf24; border-color: rgba(251,191,36,0.45); background: rgba(251,191,36,0.06); }
.admin-shell.night-mode .edit-status-btn--pending:hover:not(:disabled)  { background: rgba(251,191,36,0.14); border-color: rgba(251,191,36,0.7); color: #fcd34d; }
.admin-shell.night-mode .edit-status-btn--waitlist { color: #c084fc; border-color: rgba(192,132,252,0.45); background: rgba(192,132,252,0.06); }
.admin-shell.night-mode .edit-status-btn--waitlist:hover:not(:disabled) { background: rgba(192,132,252,0.14); border-color: rgba(192,132,252,0.7); color: #d8b4fe; }
/* Inline status confirm card */
.edit-status-confirm { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 10px; border: 1px dashed; }
.admin-shell.night-mode .edit-status-confirm { border-color: rgba(139,92,246,0.4); background: rgba(139,92,246,0.04); }
.admin-shell.day-mode  .edit-status-confirm { border-color: rgba(212,175,55,0.4); background: rgba(212,175,55,0.04); }
.edit-status-confirm-title { font-size: 13.5px; font-weight: 600; }
.edit-status-confirm-help  { font-size: 11.5px; opacity: 0.75; line-height: 1.5; }
.edit-status-confirm-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
/* ── Edit modal: opening hours ──────────────────────────────────────────── */
.edit-hours-list { display: flex; flex-direction: column; gap: 8px; }
.edit-hours-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 6px 0; }
.edit-hours-day { width: 90px; font-size: 12px; font-weight: 600; }
.edit-hours-pills { display: inline-flex; gap: 0; border-radius: 6px; overflow: hidden; }
.edit-hours-pill { padding: 4px 10px; font-size: 11px; font-weight: 600; border: none; cursor: pointer; background: transparent; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.admin-shell.night-mode .edit-hours-pill { border-color: rgba(255,255,255,0.12); color: #94a3b8; }
.admin-shell.day-mode  .edit-hours-pill { border-color: rgba(0,0,0,0.10); color: #5c3f2e }
.edit-hours-pill.edit-hours-pill--active { background: rgba(34,197,94,0.14); color: #16a34a }
.edit-hours-pill.edit-hours-pill--close.edit-hours-pill--active { background: rgba(239,68,68,0.14); color: #dc2626 }
.admin-shell.night-mode .edit-hours-pill.edit-hours-pill--active { color: #4ade80; }
.admin-shell.night-mode .edit-hours-pill.edit-hours-pill--close.edit-hours-pill--active { color: #fb7185; }
.edit-hours-time { padding: 5px 8px; border-radius: 6px; font-size: 12px; font-family: 'DM Mono', monospace; border: none; }
.admin-shell.night-mode .edit-hours-time { background: rgba(255,255,255,0.04); color: #e2e8f0 }
.admin-shell.day-mode  .edit-hours-time { background: #fff;                  color: #3c2a1e }
.edit-hours-sep { opacity: 0.5; }
.edit-hours-closed-text { font-size: 11.5px; opacity: 0.6; font-style: italic; }
.edit-help-sub { font-size: 11.5px; opacity: 0.65; margin-top: 4px; }

/* ── Edit modal: event schedule ─────────────────────────────────────────── */
/* Read-only summary line — shows the resolved event day/time at a glance. */
.edit-event-summary {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 8px; margin-bottom: 14px;
  font-size: 12.5px; font-weight: 500;
}
.edit-event-summary svg { flex-shrink: 0; opacity: 0.7; }
.edit-panel.night-mode .edit-event-summary { background: rgba(124,58,237,0.12); color: #d8b4fe; }
.edit-panel.day-mode   .edit-event-summary { background: rgba(160,82,45,0.08);  color: #8a4520; }
/* Two-button schedule-type picker (one-time vs recurring). */
.edit-event-mode { display: inline-flex; border-radius: 8px; overflow: hidden; gap: 2px; padding: 3px; }
.edit-panel.night-mode .edit-event-mode { background: rgba(255,255,255,0.05); }
.edit-panel.day-mode   .edit-event-mode { background: rgba(0,0,0,0.05); }
.edit-event-mode-btn {
  padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
  background: transparent; white-space: nowrap; transition: all 0.15s;
}
.edit-panel.night-mode .edit-event-mode-btn { color: #94a3b8; }
.edit-panel.day-mode   .edit-event-mode-btn { color: #5c3f2e; }
.edit-panel.night-mode .edit-event-mode-btn.edit-event-mode-btn--active { background: #7c3aed; color: #fff; }
.edit-panel.day-mode   .edit-event-mode-btn.edit-event-mode-btn--active { background: linear-gradient(135deg,#D4AF37,#C09040); color: #fff; }
/* Start / End grouping blocks for one-time events. */
.edit-event-block { margin-top: 12px; }
.edit-event-block-label {
  font-size: 11px; font-weight: 700; font-family: 'DM Mono', monospace;
  letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 7px;
}
.edit-panel.night-mode .edit-event-block-label { color: #c084fc; }
.edit-panel.day-mode   .edit-event-block-label { color: #A0522D; }
.edit-event-optional {
  font-size: 9.5px; font-weight: 600; opacity: 0.55;
  text-transform: none; letter-spacing: 0; margin-left: 4px;
}
/* Note shown in place of the date fields when the event is recurring. */
.edit-event-recurring-note {
  display: flex; align-items: flex-start; gap: 8px; margin-top: 10px;
  padding: 10px 12px; border-radius: 8px; font-size: 12px; line-height: 1.5;
}
.edit-event-recurring-note svg { flex-shrink: 0; margin-top: 1px; opacity: 0.75; }
.edit-panel.night-mode .edit-event-recurring-note { background: rgba(255,255,255,0.04); color: #94a3b8; }
.edit-panel.day-mode   .edit-event-recurring-note { background: rgba(0,0,0,0.04);    color: #5c3f2e; }

/* ── Edit modal: verification read-only fields (AI score, Last Verified) ── */
.edit-readonly-value { padding: 9px 12px; border-radius: 8px; font-size: 13px; min-height: 38px; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.admin-shell.night-mode .edit-readonly-value { background: rgba(255,255,255,0.03) }
.admin-shell.day-mode  .edit-readonly-value { background: rgba(0,0,0,0.02) }
.edit-readonly-empty { opacity: 0.5; font-style: italic; font-size: 12px; }
.edit-verified-by { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.edit-verified-name { font-weight: 600; font-size: 12.5px; }
.edit-verified-at { font-size: 11px; opacity: 0.7; font-family: 'DM Mono', monospace; }

/* ── Edit modal: verification audit history ─────────────────────────────── */
.edit-history-list { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.edit-section-title--sub { font-size: 11px; opacity: 0.7; margin-bottom: 4px; }
.edit-history-item { padding: 8px 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px; }
.admin-shell.night-mode .edit-history-item { background: rgba(255,255,255,0.03); }
.admin-shell.day-mode  .edit-history-item { background: rgba(0,0,0,0.03); }
.edit-history-action { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; align-self: flex-start; }
.edit-history-meta { font-size: 11px; opacity: 0.65; font-family: 'DM Mono', monospace; }
.edit-history-notes { font-size: 12px; margin: 2px 0 0; line-height: 1.4; }

/* ── Edit modal: analytics grid + weekly trend ──────────────────────────── */
.edit-analytics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
.edit-stat { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 7px; }
.admin-shell.night-mode .edit-stat { background: rgba(255,255,255,0.03); }
.admin-shell.day-mode  .edit-stat { background: rgba(0,0,0,0.03); }
.edit-stat-label { font-size: 10.5px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.04em; }
.edit-stat-val { font-size: 14px; font-weight: 600; font-family: 'DM Mono', monospace; }
.edit-stat--double { grid-column: span 2; gap: 6px; }
.edit-trend { margin-top: 14px; }
.edit-trend-label { font-size: 11px; opacity: 0.7; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
.edit-trend-bars { display: flex; gap: 3px; align-items: flex-end; height: 60px; }
.edit-trend-bar { flex: 1; min-height: 2px; border-radius: 2px 2px 0 0; transition: opacity 0.15s; }
.admin-shell.night-mode .edit-trend-bar { background: linear-gradient(to top, rgba(139,92,246,0.6), rgba(139,92,246,0.3)); }
.admin-shell.day-mode  .edit-trend-bar { background: linear-gradient(to top, rgba(212,175,55,0.7), rgba(212,175,55,0.35)); }
.edit-trend-bar:hover { opacity: 0.8; }
/* ── A. ANALYTICS HERO (score ring + 4 tiles) ─────────────────────────── */
.edit-an-hero { display: grid; grid-template-columns: auto 1fr; gap: 18px; padding: 16px; border-radius: 14px; align-items: center; margin-bottom: 18px; }
.admin-shell.night-mode .edit-an-hero { background: rgba(139,92,246,0.06) }
.admin-shell.day-mode  .edit-an-hero { background: rgba(212,175,55,0.05) }
.edit-an-hero-score { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.edit-an-hero-score-ring { width: 96px; height: 96px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: conic-gradient(var(--ring-color, #8b5cf6) var(--score-deg, 0deg), rgba(255,255,255,0.08) 0deg); position: relative; }
.edit-an-hero-score-ring.is-good { --ring-color: #22c55e; }
.edit-an-hero-score-ring.is-mid  { --ring-color: #eab308; }
.edit-an-hero-score-ring.is-low  { --ring-color: #ef4444; }
.admin-shell.day-mode .edit-an-hero-score-ring { background: conic-gradient(var(--ring-color, #D4AF37) var(--score-deg, 0deg), rgba(0,0,0,0.06) 0deg); }
.edit-an-hero-score-inner { width: 78px; height: 78px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; }
.admin-shell.night-mode .edit-an-hero-score-inner { background: #130f2a; }
.admin-shell.day-mode  .edit-an-hero-score-inner { background: #fdfaf4; }
.edit-an-hero-score-val { font-size: 24px; font-weight: 700; font-family: 'DM Mono', monospace; line-height: 1; }
.edit-an-hero-score-sub { font-size: 10px; opacity: 0.55; font-family: 'DM Mono', monospace; margin-top: 2px; }
.edit-an-hero-score-label { font-size: 11px; font-weight: 600; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.05em; }
.edit-an-hero-tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.edit-an-hero-tile { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 9px; }
.admin-shell.night-mode .edit-an-hero-tile { background: rgba(0,0,0,0.25); }
.admin-shell.day-mode  .edit-an-hero-tile { background: rgba(255,255,255,0.55); }
.edit-an-hero-tile-label { font-size: 10.5px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.04em; }
.edit-an-hero-tile-val { font-size: 22px; font-weight: 700; font-family: 'DM Mono', monospace; line-height: 1.1; }
.edit-an-hero-tile-hint { font-size: 10px; opacity: 0.55; font-family: 'DM Mono', monospace; }
/* ── B-F. SHARED SUBSECTION STYLES ────────────────────────────────────── */
.edit-an-subsection { margin-top: 18px; }
.edit-an-subsection:first-of-type { margin-top: 0; }
.edit-an-subsection-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; margin-bottom: 10px; }
/* ── B. SCORE BREAKDOWN ───────────────────────────────────────────────── */
.edit-an-pillars { display: flex; flex-direction: column; gap: 10px; }
.edit-an-pillar { display: flex; flex-direction: column; gap: 4px; }
.edit-an-pillar-head { display: flex; justify-content: space-between; align-items: baseline; font-size: 12px; }
.edit-an-pillar-label { font-weight: 500; }
.edit-an-pillar-weight { opacity: 0.5; font-size: 10.5px; font-family: 'DM Mono', monospace; margin-left: 4px; }
.edit-an-pillar-val { font-family: 'DM Mono', monospace; font-weight: 600; font-size: 12.5px; }
.edit-an-pillar-bar { height: 6px; border-radius: 3px; overflow: hidden; }
.admin-shell.night-mode .edit-an-pillar-bar { background: rgba(139,92,246,0.08); }
.admin-shell.day-mode  .edit-an-pillar-bar { background: rgba(212,175,55,0.10); }
.edit-an-pillar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.admin-shell.night-mode .edit-an-pillar-fill { background: linear-gradient(90deg, #8b5cf6, #c084fc); }
.admin-shell.day-mode  .edit-an-pillar-fill { background: linear-gradient(90deg, #D4AF37, #C09040); }
/* ── C. WEEKLY TRAFFIC TREND (views + clicks) ─────────────────────────── */
.edit-an-trend { display: flex; flex-direction: column; gap: 8px; }
.edit-an-trend-legend { display: flex; gap: 14px; font-size: 11px; }
.edit-an-trend-legend-item { display: flex; align-items: center; gap: 5px; opacity: 0.8; }
.edit-an-trend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.admin-shell.night-mode .edit-an-trend-dot--views { background: #8b5cf6; }
.admin-shell.day-mode  .edit-an-trend-dot--views { background: #D4AF37; }
.edit-an-trend-dot--clicks { background: #22c55e; }
.edit-an-trend-bars { display: flex; gap: 4px; align-items: flex-end; height: 80px; padding: 4px 0; }
.edit-an-trend-col { flex: 1; height: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 2px; position: relative; }
.edit-an-trend-col:hover .edit-an-trend-bar { opacity: 0.85; }
.edit-an-trend-bar { flex: 1; min-height: 1px; border-radius: 2px 2px 0 0; transition: opacity 0.15s; max-width: 14px; }
.admin-shell.night-mode .edit-an-trend-bar--views { background: linear-gradient(to top, rgba(139,92,246,0.7), rgba(139,92,246,0.4)); }
.admin-shell.day-mode  .edit-an-trend-bar--views { background: linear-gradient(to top, rgba(212,175,55,0.75), rgba(212,175,55,0.4)); }
.edit-an-trend-bar--clicks { background: linear-gradient(to top, rgba(34,197,94,0.7), rgba(34,197,94,0.4)); }
/* ── D. CONVERSION CHANNELS ───────────────────────────────────────────── */
.edit-an-conv { display: flex; flex-direction: column; gap: 8px; }
.edit-an-conv-row { display: grid; grid-template-columns: 130px 1fr 48px; gap: 10px; align-items: center; font-size: 12px; }
.edit-an-conv-row--disabled { opacity: 0.4; }
.edit-an-conv-label { display: flex; flex-direction: column; line-height: 1.2; }
.edit-an-conv-na { font-size: 10px; opacity: 0.7; font-style: italic; font-weight: 400; }
.edit-an-conv-bar-wrap { height: 8px; border-radius: 4px; overflow: hidden; }
.admin-shell.night-mode .edit-an-conv-bar-wrap { background: rgba(255,255,255,0.05); }
.admin-shell.day-mode  .edit-an-conv-bar-wrap { background: rgba(0,0,0,0.05); }
.edit-an-conv-bar { height: 100%; border-radius: 4px; transition: width 0.4s ease; min-width: 0; }
.edit-an-conv-bar--directions  { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.edit-an-conv-bar--search      { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
.edit-an-conv-bar--phone       { background: linear-gradient(90deg, #22c55e, #4ade80); }
.edit-an-conv-bar--website     { background: linear-gradient(90deg, #a855f7, #c084fc); }
.edit-an-conv-bar--instagram   { background: linear-gradient(90deg, #ec4899, #f472b6); }
.edit-an-conv-bar--facebook    { background: linear-gradient(90deg, #1877f2, #4293f5); }
.edit-an-conv-bar--tripadvisor { background: linear-gradient(90deg, #00aa6c, #34c08a); }
.edit-an-conv-count { font-family: 'DM Mono', monospace; font-weight: 600; font-size: 12px; text-align: right; }
/* ── E. ENGAGEMENT BREAKDOWN ──────────────────────────────────────────── */
.edit-an-eng-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
.edit-an-likebar-wrap { display: flex; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 4px; }
.admin-shell.night-mode .edit-an-likebar-wrap { background: rgba(255,255,255,0.05); }
.admin-shell.day-mode  .edit-an-likebar-wrap { background: rgba(0,0,0,0.05); }
.edit-an-likebar-like { background: #22c55e; }
.edit-an-likebar-dislike { background: #ef4444; opacity: 0.7; }
.edit-an-likebar-counts { display: flex; justify-content: space-between; margin-top: 4px; font-size: 10.5px; font-family: 'DM Mono', monospace; }
.edit-an-likebar-count-like,
.edit-an-likebar-count-dislike { display: inline-flex; align-items: center; gap: 4px; }
.edit-an-likebar-count-like   { color: #22c55e; }
.edit-an-likebar-count-dislike { color: #ef4444; opacity: 0.85; }
.edit-an-likebar-count-like svg,
.edit-an-likebar-count-dislike svg { flex-shrink: 0; }
/* ── F. REVENUE TILES ─────────────────────────────────────────────────── */
.edit-an-rev-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.edit-an-rev-tile { padding: 12px 14px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px; }
.admin-shell.night-mode .edit-an-rev-tile { background: rgba(34,197,94,0.06); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.15); }
.admin-shell.day-mode  .edit-an-rev-tile { background: rgba(34,197,94,0.05); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.15); }
.edit-an-rev-label { font-size: 11px; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.04em; }
.edit-an-rev-val { font-size: 22px; font-weight: 700; font-family: 'DM Mono', monospace; }
.edit-an-rev-hint { font-size: 10.5px; opacity: 0.6; line-height: 1.4; }
/* ── RESPONSIVE — stack hero on narrow screens ───────────────────────── */
@media (max-width: 640px) {
  .edit-an-hero { grid-template-columns: 1fr; gap: 14px; }
  .edit-an-hero-score { flex-direction: row; gap: 14px; justify-content: flex-start; }
  .edit-an-hero-tiles { grid-template-columns: 1fr 1fr; }
  .edit-an-conv-row { grid-template-columns: 100px 1fr 40px; gap: 8px; font-size: 11.5px; }
}

/* ── Edit modal: highlights (5 numbered single-line inputs) ─────────────── */
/* ── Edit modal: currency chips (compact, wraps to multiple rows) ──────── */
.edit-currency-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.edit-currency-chip { padding: 6px 12px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.03em; font-family: 'DM Mono', monospace; border: 1px solid; cursor: pointer; background: transparent; border-radius: 7px; transition: all 0.15s; }
.admin-shell.night-mode .edit-currency-chip { color: #94a3b8; border-color: rgba(139,92,246,0.22); }
.admin-shell.day-mode  .edit-currency-chip { color: #5c3f2e; border-color: rgba(0,0,0,0.12); }
.admin-shell.night-mode .edit-currency-chip:hover:not(:disabled) { background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.45); }
.admin-shell.day-mode  .edit-currency-chip:hover:not(:disabled) { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.45); }
.edit-currency-chip--active { background: rgba(139,92,246,0.16); color: #c084fc; border-color: rgba(139,92,246,0.55); }
.admin-shell.day-mode  .edit-currency-chip--active { background: rgba(212,175,55,0.18); color: #8B6914; border-color: rgba(212,175,55,0.55); }
.edit-currency-chip:disabled { cursor: not-allowed; opacity: 0.4; }
.edit-currency-chips--disabled { opacity: 0.55; }

/* ── Edit modal: Free pricing button ───────────────────────────────────── */
.edit-free-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em; font-family: 'DM Sans', sans-serif; border: 1px solid; border-radius: 8px; cursor: pointer; background: transparent; transition: all 0.15s; }
.admin-shell.night-mode .edit-free-btn { color: #94a3b8; border-color: rgba(139,92,246,0.25); }
.admin-shell.day-mode  .edit-free-btn { color: #5c3f2e; border-color: rgba(0,0,0,0.14); }
.admin-shell.night-mode .edit-free-btn:hover:not(.edit-free-btn--active) { background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.45); }
.admin-shell.day-mode  .edit-free-btn:hover:not(.edit-free-btn--active) { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.45); }
.edit-free-btn--active { background: rgba(34,197,94,0.14); color: #16a34a; border-color: rgba(34,197,94,0.5); }
.admin-shell.night-mode .edit-free-btn--active { background: rgba(34,197,94,0.16); color: #4ade80; border-color: rgba(34,197,94,0.5); }
.admin-shell.day-mode  .edit-free-btn--active { background: rgba(34,197,94,0.12); color: #15803d; border-color: rgba(34,197,94,0.5); }
.edit-free-btn--active:hover { box-shadow: 0 0 0 3px rgba(34,197,94,0.12); }

/* ── Edit modal: currency button group (replaces select dropdown) ──────── */
.edit-currency-group { display: inline-flex; gap: 0; border-radius: 8px; overflow: hidden; border: 1px solid; }
.admin-shell.night-mode .edit-currency-group { border-color: rgba(139,92,246,0.22); }
.admin-shell.day-mode  .edit-currency-group { border-color: rgba(0,0,0,0.10); }
.edit-currency-btn { padding: 7px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.03em; font-family: 'DM Mono', monospace; border: none; cursor: pointer; background: transparent; transition: background 0.15s, color 0.15s; }
/* Vertical separators between adjacent buttons (like a segmented control) */
.edit-currency-btn + .edit-currency-btn { border-left: 1px solid; }
.admin-shell.night-mode .edit-currency-btn + .edit-currency-btn { border-left-color: rgba(139,92,246,0.18); }
.admin-shell.day-mode  .edit-currency-btn + .edit-currency-btn { border-left-color: rgba(0,0,0,0.08); }
.admin-shell.night-mode .edit-currency-btn { color: #94a3b8; }
.admin-shell.day-mode  .edit-currency-btn { color: #5c3f2e; }
.edit-currency-btn:hover:not(:disabled) { opacity: 0.85; }
.admin-shell.night-mode .edit-currency-btn:hover:not(:disabled) { background: rgba(255,255,255,0.04); }
.admin-shell.day-mode  .edit-currency-btn:hover:not(:disabled) { background: rgba(0,0,0,0.04); }
.edit-currency-btn--active { background: rgba(139,92,246,0.16); color: #c084fc; }
.admin-shell.day-mode  .edit-currency-btn--active { background: rgba(212,175,55,0.16); color: #8B6914; }
.edit-currency-btn:disabled { cursor: not-allowed; opacity: 0.4; }
.edit-currency-group--disabled { opacity: 0.55; }

/* ── Edit modal: partnership tier buttons (replaces select dropdown) ───── */
/* Three side-by-side cards. Each shows the tier name + monthly price. The
   active tier gets a coloured ring matching the brand colour used in the
   table badges (.badge-signature, .badge-spotlight, .badge-free). */
.edit-tier-group { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.edit-tier-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 12px 10px; border-radius: 10px; cursor: pointer; border: none; background: transparent; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.admin-shell.night-mode .edit-tier-btn { color: #94a3b8 }
.admin-shell.day-mode  .edit-tier-btn { color: #5c3f2e }
.admin-shell.night-mode .edit-tier-btn:hover:not(.edit-tier-btn--active) { background: rgba(255,255,255,0.04) }
.admin-shell.day-mode  .edit-tier-btn:hover:not(.edit-tier-btn--active) { background: rgba(0,0,0,0.03) }
.edit-tier-btn-label { font-size: 12.5px; font-weight: 700; letter-spacing: 0.01em; }
.edit-tier-btn-fee   { font-size: 11px; font-family: 'DM Mono', monospace; opacity: 0.65; }
/* Active states — colour scheme mirrors the table badges */
.edit-tier-btn--verified.edit-tier-btn--active  { background: rgba(139,92,246,0.10); color: #c084fc }
.edit-tier-btn--spotlight.edit-tier-btn--active { background: rgba(59,158,221,0.12); color: #63b3ed }
.edit-tier-btn--signature.edit-tier-btn--active { background: rgba(212,175,55,0.14); color: #d4af37 }
.admin-shell.day-mode .edit-tier-btn--verified.edit-tier-btn--active  { background: rgba(139,69,19,0.06); color: #7a5c3e }
.admin-shell.day-mode .edit-tier-btn--spotlight.edit-tier-btn--active { background: rgba(59,158,221,0.10); color: #1a6fa8 }
.admin-shell.day-mode .edit-tier-btn--signature.edit-tier-btn--active { background: rgba(212,175,55,0.14); color: #8B6914 }
.edit-tier-btn--active .edit-tier-btn-fee { opacity: 0.9; }

.edit-highlights-list { display: flex; flex-direction: column; gap: 6px; }
.edit-highlight-row { display: flex; align-items: center; gap: 8px; }
.edit-highlight-num { flex: 0 0 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; }
.admin-shell.night-mode .edit-highlight-num { background: rgba(139,92,246,0.12); color: #c084fc; }
.admin-shell.day-mode  .edit-highlight-num { background: rgba(212,175,55,0.14); color: #8B6914; }
.edit-highlight-input { flex: 1; }
.action-group { display: flex; align-items: center; justify-content: center; gap: 4px; }
.action-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 7px; border: none; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
.action-btn--sm { padding: 5px 0; width: 52px; justify-content: center; font-size: 11px; }
/* Icon-only action button — used in the user table to save horizontal space */
.action-btn--icon { width: 28px; height: 28px; padding: 0; justify-content: center; }
.action-btn--icon svg { display: block; }
.btn-cooldown { background: rgba(99,102,241,0.1); color: #6366f1; }
.btn-cooldown:hover { background: rgba(99,102,241,0.2); }
.btn-warning { background: rgba(234,179,8,0.12); color: #ca8a04; }
.btn-warning:hover { background: rgba(234,179,8,0.22); }
.btn-delete { background: rgba(239,68,68,0.08); color: #dc2626; }
.btn-delete:hover { background: rgba(239,68,68,0.18); }
.btn-danger-outline { padding: 8px 12px; border-radius: 9px; border: 1px solid currentColor; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }

/* ── STAFF STATUS PILLS ── */
.staff-status-pill { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.staff-status-pill--active { background: rgba(76,175,80,0.15); color: #4caf50; }
.staff-status-pill--awaiting { background: rgba(245,158,11,0.15); color: #f59e0b; }
.staff-status-pill--revoked { background: rgba(239,68,68,0.10); color: #ef4444; }

/* Assignment column */
.staff-assign-cell { font-size: 12.5px; line-height: 1.45; max-width: 260px; }
.assign-empty { color: #ef4444; font-style: italic; opacity: 0.85; }
.assign-scope { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.assign-list { color: var(--text, inherit); }
.assign-list--sub { opacity: 0.6; font-size: 11.5px; }
.assign-priority { font-size: 11px; color: #f59e0b; opacity: 0.95; margin-top: 2px; }

.staff-actions-cell { white-space: nowrap; }

/* Permission badges (inline in the Assignment column) */
.staff-perm-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-bottom: 4px; }
.staff-perm-badge { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.staff-perm-badge--validate { background: rgba(99,102,241,0.14); color: #6366f1; }
.staff-perm-badge--destinations { background: rgba(34,197,94,0.14); color: #22c55e; }
.staff-perm-badge--explore { background: rgba(168,85,247,0.14); color: #c084fc; }

/* Permission picker rows used in both staff modals */
.staff-perms { display: flex; flex-direction: column; gap: 8px; }
.staff-perm-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease; }
.staff-perm-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
.day-mode .staff-perm-row { background: rgba(0,0,0,0.025); border-color: rgba(0,0,0,0.06); }
.day-mode .staff-perm-row:hover { background: rgba(0,0,0,0.045); border-color: rgba(0,0,0,0.1); }
.staff-perm-row input[type="checkbox"] { margin-top: 2px; flex-shrink: 0; width: 16px; height: 16px; cursor: pointer; accent-color: #6366f1; }
.staff-perm-body { display: flex; flex-direction: column; gap: 2px; line-height: 1.4; }
.staff-perm-title { font-size: 13.5px; font-weight: 600; }
.staff-perm-sub { font-size: 12px; opacity: 0.65; }

/* ── PURGE SPLIT BUTTON ── */
.purge-split { position: relative; display: flex; align-items: stretch; border-radius: 9px; overflow: visible; }
.purge-main { display: flex; align-items: center; gap: 6px; padding: 8px 11px; border: 1px solid currentColor; border-right: none; border-radius: 9px 0 0 9px; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
.purge-period-label { font-weight: 700; }
.purge-chevron { display: flex; align-items: center; justify-content: center; padding: 0 9px; border: 1px solid currentColor; border-left: none; border-radius: 0 9px 9px 0; background: transparent; cursor: pointer; transition: all 0.15s; }
.purge-dropdown { position: absolute; top: calc(100% + 6px); right: 0; min-width: 180px; border-radius: 11px; padding: 6px; z-index: 100; display: flex; flex-direction: column; gap: 1px; box-shadow: 0 0 28px rgba(0,0,0,0.18); }
.purge-dropdown-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'DM Mono', monospace; padding: 5px 10px 7px; opacity: 0.45; }
.purge-dropdown-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 7px; border: none; background: transparent; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; text-align: left; transition: background 0.12s; }
.purge-dropdown-divider { height: 1px; margin: 5px 6px; opacity: 0.15; background: currentColor; }
.purge-dropdown-apply { width: calc(100% - 12px); margin: 6px 6px 4px; padding: 8px; border-radius: 7px; border: none; font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
.usage-bar-wrap { display: flex; align-items: center; gap: 7px; }
.usage-bar { width: 56px; height: 4px; border-radius: 2px; overflow: hidden; }
.usage-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }
.usage-label { font-size: 11px; font-family: 'DM Mono', monospace; }
.type-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.type-chip { font-size: 10px; padding: 2px 7px; border-radius: 5px; font-family: 'DM Mono', monospace; }

/* ── PAGINATION ── */
.pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0; font-size: 13px; }
.pagination button { border-radius: 8px; padding: 7px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; transition: all 0.15s; display: flex; align-items: center; gap: 5px; border: none}
.pagination button:disabled { opacity: 0.25; cursor: not-allowed; }

/* ── PLACES GRID ── */
.places-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
.place-card { border-radius: 13px; overflow: hidden; transition: all 0.2s ease; }
.place-img-wrap { position: relative; height: 150px; overflow: hidden; }
.place-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s ease; }
.place-card:hover .place-img { transform: scale(1.05); }
.place-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 34px; }
.place-img-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.2s; display: flex; align-items: flex-start; justify-content: flex-end; gap: 6px; padding: 8px; }
.place-card:hover .place-img-overlay { opacity: 1; }
.place-img-badge { position: absolute; bottom: 8px; left: 8px; padding: 3px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: 'DM Mono', monospace; backdrop-filter: blur(6px); background: rgba(0,0,0,0.5); color: #f0ca5a; }
.place-delete-btn { width: 26px; height: 26px; border-radius: 7px; border: none; cursor: pointer; display: grid; place-items: center; background: rgba(244,63,94,0.85); color: white; transition: all 0.15s; }
.place-delete-btn:hover { background: #f43f5e; transform: scale(1.08); }
/* Explore moderation toggles (verify / hide) — dim until active. */
.place-mod-btn { width: 26px; height: 26px; border-radius: 7px; border: none; cursor: pointer; display: grid; place-items: center; background: rgba(30,30,30,0.6); color: rgba(255,255,255,0.85); transition: all 0.15s; }
.place-mod-btn:hover { transform: scale(1.08); }
.place-mod-verify:hover { background: rgba(34,197,94,0.75); }
.place-mod-hide:hover { background: rgba(148,163,184,0.75); }
.place-mod-verify.place-mod-btn--on { background: #22c55e; color: #fff; }
.place-mod-hide.place-mod-btn--on { background: #64748b; color: #fff; }
.place-info { padding: 12px 14px 13px; }
.place-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.place-addr { font-size: 11px; font-family: 'DM Mono', monospace; margin-bottom: 8px; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.place-meta { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 7px; }
/* Likes / dislikes badges — reuse .badge sizing, icon + count inline. */
.badge.pf-like, .badge.pf-dislike, .badge.pf-tier { display: inline-flex; align-items: center; gap: 3px; }
/* Event date row (events cache only; row hides when no date). */
.place-event { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-family: 'DM Mono', monospace; font-weight: 600; margin-bottom: 7px; }
.place-event svg { flex-shrink: 0; }
.place-stats { display: flex; gap: 5px; flex-wrap: wrap; font-size: 10px; font-family: 'DM Mono', monospace; opacity: 0.6; }

/* ── TOAST ── */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 11px 18px; border-radius: 11px; font-size: 13px; font-weight: 500; z-index: 9999; box-shadow: 0 0 30px rgba(0,0,0,0.18); display: flex; align-items: center; gap: 8px; }
.toast-icon { font-style: normal; font-weight: 700; font-size: 13px; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0 }
.empty-state { padding: 40px 20px; text-align: center; font-size: 14px; font-family: 'DM Mono', monospace; }

/* ── GOOGLE DAILY CHART ── */
.g-legend { display: flex; align-items: center; gap: 12px; }
.g-legend-item { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-family: 'DM Mono', monospace; opacity: 0.7; }
.g-legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.g-dot-find    { background: #c084fc; }
.g-dot-details { background: #67e8f9; }
.g-dot-geo     { background: #86efac; }
.g-dot-img     { background: #fcd34d; }
.ai-dot-tokens  { background: #818cf8; }
.ai-dot-queries { background: #34d399; }
.g-chart-body { padding: 8px 20px 4px; }
.g-chart-area { position: relative; }
/* subtle horizontal gridlines — span the full chart area */
.g-grid-lines { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
.g-grid-line { width: 100%; height: 1px; background: rgba(139,92,246,0.08); }
.g-bars { display: flex; align-items: flex-end; gap: 5px; height: 160px; }
/* Column fills the chart height. flex-direction: column-reverse with
   justify-content: flex-start pins the label to the chart floor and lets
   the bar-stack grow upward directly above it. Since labels are uniform
   height, the bar bases still align on a shared baseline. */
.g-bar-col { display: flex; flex-direction: column-reverse; align-items: center; flex: 1; cursor: default; position: relative; height: 100%; justify-content: flex-start; }
.g-bar-col:hover .g-bar-stack { filter: brightness(1.2); }
/* Spacer no longer needed — flex-direction handles the layout */
.g-bar-spacer { display: none; }
/* stacked bar */
.g-bar-stack { width: 100%; border-radius: 4px 4px 0 0; overflow: hidden; display: flex; flex-direction: column-reverse; transition: height 0.5s cubic-bezier(0.34,1.56,0.64,1), filter 0.15s; animation: gBarGrow 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes gBarGrow { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
.g-seg { min-height: 2px; transition: flex 0.3s ease; }
.g-seg-find    { background: linear-gradient(180deg, #e879f9, #a855f7); }
.g-seg-details { background: linear-gradient(180deg, #67e8f9, #0891b2); }
.g-seg-geo     { background: linear-gradient(180deg, #86efac, #16a34a); }
.g-seg-img     { background: linear-gradient(180deg, #fde68a, #d97706); }
.g-seg-zero    { background: rgba(139,92,246,0.12); border-radius: 4px 4px 0 0; }
.ai-seg-tokens  { background: linear-gradient(180deg, #a5b4fc, #4f46e5); }
.ai-seg-queries { background: linear-gradient(180deg, #6ee7b7, #059669); }
/* Label sits flush against the bottom of the bar's colored segment */
.g-bar-label { font-size: 8px; font-family: 'DM Mono', monospace; color: #64748b; margin-bottom: 2px; white-space: nowrap; letter-spacing: 0.03em; }
/* Footer legend — sits below the chart, centered */
.g-legend--footer { justify-content: center; gap: 16px; padding: 10px 20px 14px; flex-wrap: wrap; border-top: 1px dashed transparent; }
.admin-shell.night-mode .g-legend--footer { border-top-color: rgba(139,92,246,0.12); }
.admin-shell.day-mode   .g-legend--footer { border-top-color: rgba(212,175,55,0.14); }
/* 30-day mode: thin out crowded x-axis labels. */
/* Desktop (30 bars × ~20-30px each): show every other label. */
.g-bars--30d .g-bar-col:nth-child(even) .g-bar-label { display: none; }
/* day-mode overrides */
.admin-shell.day-mode .g-grid-line { background: rgba(0,0,0,0.05); }
.admin-shell.day-mode .g-bar-label { color: #94a3b8; }
.admin-shell.day-mode .g-legend-item { opacity: 0.8; }


/* ── NIGHT MODE ── */
.admin-shell.night-mode { background: #0a0118; color: #e2e8f0; position: relative; }
.admin-shell.night-mode::before { content: ''; position: fixed; inset: 0; background: linear-gradient(180deg, #0a0118 0%, #1a0b2e 40%, #16213e 100%); z-index: -1; pointer-events: none; }
.admin-shell.night-mode .sidebar { background: transparent; }
.admin-shell.night-mode .brand-icon-wrap { background: rgba(139,92,246,0.15) }
.admin-shell.night-mode .brand-text { color: #e2e8f0; }
.admin-shell.night-mode .sidebar-section-label { color: #94a3b8; }
.admin-shell.night-mode .nav-item { color: #94a3b8; }
.admin-shell.night-mode .nav-item:hover { background: rgba(139,92,246,0.1); color: #e2e8f0 }
.admin-shell.night-mode .nav-item.active { background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15)); color: #e2e8f0 }
.admin-shell.night-mode .nav-active-dot { background: #c084fc; box-shadow: 0 0 6px #c084fc }
.admin-shell.night-mode .nav-badge { background: #f43f5e; color: white; }
.admin-shell.night-mode .theme-toggle { background: none; border: none; color: rgba(226,232,240,0.5); }
.admin-shell.night-mode .theme-toggle:hover { background: rgba(139,92,246,0.1); color: #e2e8f0; box-shadow: 0 0 6px rgba(139,92,246,0.15) }
.admin-shell.night-mode .logout-btn { color: rgba(226,232,240,0.6); }
.admin-shell.night-mode .logout-btn:hover { background: rgba(229,62,62,0.12); color: #fc8181; }
.admin-shell.night-mode .admin-chip { background: #1e1438; box-shadow: 0 0 6px rgba(139,92,246,0.2); }
.admin-shell.night-mode .chip-avatar { color: #bfa76a }
.admin-shell.night-mode .chip-name { color: #e2e8f0; }
.admin-shell.night-mode .chip-role { color: #94a3b8; }
.admin-shell.night-mode .chip-dot { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.5); }
.admin-shell.night-mode .topbar { background: #0a0118 }
.admin-shell.night-mode .topbar-title h1 { color: #e2e8f0; }
.admin-shell.night-mode .topbar-date { color: #94a3b8; }
.admin-shell.night-mode .topbar-breadcrumb { color: #94a3b8; }
.admin-shell.night-mode .refresh-btn { background: rgba(139,92,246,0.1); color: #94a3b8; }
.admin-shell.night-mode .refresh-btn:hover { color: #c084fc }
.admin-shell.night-mode .loading-screen { color: #94a3b8; }
.admin-shell.night-mode .loader-ring { border-color: rgba(139,92,246,0.15); border-top-color: #8b5cf6; }
.admin-shell.night-mode .kpi-card { background: #1e1438; box-shadow: 0 0 8px rgba(139,92,246,0.2); }
.admin-shell.night-mode .kpi-accent { background: #6d28d9; border-color: transparent; box-shadow: 0 0 8px rgba(168,85,247,0.4); }
.admin-shell.night-mode .kpi-accent .kpi-label, .admin-shell.night-mode .kpi-accent .kpi-value, .admin-shell.night-mode .kpi-accent .kpi-sub { color: white; }
.admin-shell.night-mode .kpi-accent .kpi-icon svg { stroke: white; }
.admin-shell.night-mode .kpi-highlight { background: #1e1438; border-color: rgba(212,175,55,0.2); }
.admin-shell.night-mode .kpi-highlight .kpi-icon svg { stroke: #bfa76a; }
.admin-shell.night-mode .kpi-danger { background: #1e1438; border-color: rgba(244,63,94,0.25); }
.admin-shell.night-mode .kpi-danger .kpi-value { color: #fb7185; }
.admin-shell.night-mode .kpi-label { color: #c084fc; }
.admin-shell.night-mode .kpi-value { color: #e2e8f0; }
.admin-shell.night-mode .kpi-sub { color: #94a3b8; }
.admin-shell.night-mode .kpi-icon svg { stroke: #c084fc; }
.admin-shell.night-mode .kpi-progress-fill { background: #8b5cf6; }
.admin-shell.night-mode .card { background: #1e1438; box-shadow: 0 0 8px rgba(139,92,246,0.2); }
.admin-shell.night-mode .card-head { border-bottom: 1px dashed rgba(139,92,246,0.2); }
.admin-shell.night-mode .card-head h2 { color: #e2e8f0; }
.admin-shell.night-mode .card-sub { color: #94a3b8; }
.admin-shell.night-mode .legend-dot { background: #8b5cf6; }
.admin-shell.night-mode .sparkbar { background: linear-gradient(180deg, #a78bfa, #6d28d9); }
.admin-shell.night-mode .sparkbar-col:hover .sparkbar { background: linear-gradient(180deg, #c084fc, #8b5cf6); opacity: 1; }
.admin-shell.night-mode .sparkbar-label { color: #94a3b8; }
.admin-shell.night-mode .sparkbar-value { color: #c084fc; }
.admin-shell.night-mode .search-input { background: #241845; color: #e2e8f0; }
.admin-shell.night-mode .search-input::placeholder { color: rgba(226,232,240,0.5); }
.admin-shell.night-mode .search-input:focus { box-shadow: 0 0 4px rgba(168,85,247,0.3); border-color: rgba(168,85,247,0.5); }
.admin-shell.night-mode .search-icon { color: #c084fc; }
.admin-shell.night-mode .filter-select { background: #241845; color: #e2e8f0; }
.admin-shell.night-mode .seg-group { background: #241845 }
.admin-shell.night-mode .seg-btn { color: rgba(226,232,240,0.45); }
.admin-shell.night-mode .seg-btn:hover:not(.seg-btn--active) { background: rgba(139,92,246,0.12); color: rgba(226,232,240,0.85); }
.admin-shell.night-mode .seg-btn--active { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; box-shadow: 0 0 10px rgba(109,40,217,0.45); font-weight: 600; }
.admin-shell.night-mode .data-table thead tr { border-bottom: 1px solid rgba(139,92,246,0.15); }
.admin-shell.night-mode .data-table th { color: #c084fc; }
.admin-shell.night-mode .table-row { border-bottom: 1px solid rgba(139,92,246,0.07); }
.admin-shell.night-mode .table-row:hover { background: rgba(139,92,246,0.08); }
.admin-shell.night-mode .avatar { background: rgba(139,92,246,0.15); color: #bfa76a; }
.admin-shell.night-mode .user-name { color: #e2e8f0; }
.admin-shell.night-mode .user-email { color: #94a3b8; }
.admin-shell.night-mode .num-cell { color: #e2e8f0; }
.admin-shell.night-mode .dim-cell { color: #94a3b8; }
.admin-shell.night-mode .loading-cell, .admin-shell.night-mode .empty-cell, .admin-shell.night-mode .empty-state { color: #94a3b8; }
.admin-shell.night-mode .badge-premium { background: rgba(212,175,55,0.12); color: #bfa76a }
.admin-shell.night-mode .badge-signature { background: rgba(212,175,55,0.12); color: #bfa76a }
.admin-shell.night-mode .badge-spotlight { background: rgba(59,158,221,0.12); color: #63b3ed }
.admin-shell.night-mode .badge-free { background: rgba(139,92,246,0.08); color: #94a3b8 }
.admin-shell.night-mode .badge-ok { background: rgba(34,197,94,0.1); color: #4ade80 }
.admin-shell.night-mode .badge-hidden { background: rgba(244,63,94,0.12); color: #fb7185 }
.admin-shell.night-mode .badge-muted { background: rgba(100,116,139,0.1); color: #94a3b8 }
.admin-shell.night-mode .pf-like { background: rgba(34,197,94,0.1); color: #4ade80 }
.admin-shell.night-mode .pf-dislike { background: rgba(239,68,68,0.12); color: #f87171 }
.admin-shell.night-mode .pf-tier { background: rgba(212,175,55,0.13); color: #e3c45e }
.admin-shell.night-mode .place-event { color: #c4b5fd }
.admin-shell.night-mode .badge-danger { background: rgba(244,63,94,0.1); color: #fb7185 }
.admin-shell.night-mode .btn-accent { background: #6d28d9; color: white; border: none; box-shadow: 0 0 4px rgba(168,85,247,0.4); }
.admin-shell.night-mode .btn-accent:hover { background: #7c3aed; box-shadow: 0 0 10px rgba(168,85,247,0.4); }
.admin-shell.night-mode .btn-muted { background: rgba(192,132,252,0.1); color: #c084fc }
.admin-shell.night-mode .btn-muted:hover { background: rgba(192,132,252,0.2); box-shadow: 0 0 4px rgba(192,132,252,0.3); }
.admin-shell.night-mode .btn-danger-outline { color: #fb7185; }
.admin-shell.night-mode .btn-danger-outline:hover { background: rgba(244,63,94,0.1); }
.admin-shell.night-mode .purge-main { color: #fb7185; }
.admin-shell.night-mode .purge-main:hover { background: rgba(244,63,94,0.1); }
.admin-shell.night-mode .purge-chevron { color: #fb7185; }
.admin-shell.night-mode .purge-chevron:hover { background: rgba(244,63,94,0.1); }
.admin-shell.night-mode .purge-dropdown { background: #1e1438 }
.admin-shell.night-mode .purge-dropdown-item { color: #e2e8f0; }
.admin-shell.night-mode .purge-dropdown-item:hover { background: rgba(244,63,94,0.1); }
.admin-shell.night-mode .purge-dropdown-item--active { color: #fb7185; font-weight: 600; }
.admin-shell.night-mode .purge-dropdown-item--never { color: #fb7185; }
.admin-shell.night-mode .purge-dropdown-apply { background: rgba(244,63,94,0.15); color: #fb7185 }
.admin-shell.night-mode .purge-dropdown-apply:hover { background: rgba(244,63,94,0.25); }
.admin-shell.night-mode .usage-bar { background: rgba(139,92,246,0.12); }
.admin-shell.night-mode .fill-accent { background: linear-gradient(90deg, #8b5cf6, #a855f7); }
.admin-shell.night-mode .fill-danger { background: linear-gradient(90deg, #f43f5e, #e11d48); }
.admin-shell.night-mode .usage-label { color: #94a3b8; }
.admin-shell.night-mode .type-chip { background: rgba(139,92,246,0.08); color: #94a3b8 }
.admin-shell.night-mode .pagination button { background: rgba(192,132,252,0.1); color: #c084fc; }
.admin-shell.night-mode .pagination button:not(:disabled):hover { background: rgba(192,132,252,0.2); box-shadow: 0 0 4px rgba(192,132,252,0.3); }
.admin-shell.night-mode .pagination span { color: #94a3b8; }
.admin-shell.night-mode .toast--success { background: #1e1438; color: #4ade80; box-shadow: 0 0 8px rgba(139,92,246,0.15); }
.admin-shell.night-mode .toast--error { background: #1e1438; color: #fb7185; box-shadow: 0 0 8px rgba(139,92,246,0.15); }
.admin-shell.night-mode .place-card { background: #1e1438; box-shadow: 0 0 8px rgba(139,92,246,0.2); }
.admin-shell.night-mode .place-card:hover { border-color: rgba(139,92,246,0.35); box-shadow: 0 0 16px rgba(139,92,246,0.3); }
.admin-shell.night-mode .place-img-placeholder { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.admin-shell.night-mode .place-name { color: #e2e8f0; }
.admin-shell.night-mode .place-addr { color: #94a3b8; }
.admin-shell.night-mode .place-stats { color: #94a3b8; }
.admin-shell.night-mode .btn-danger { color: #f43f5e; }
.admin-shell.night-mode .btn-danger:hover { background: rgba(244,63,94,0.1); }

/* ── DAY MODE ── */
.admin-shell.day-mode { background: #f4efe4; color: #2c1e10; }
.admin-shell.day-mode .sidebar { background: #f4efe4 }
.admin-shell.day-mode .brand-icon-wrap { background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(160,82,45,0.1)) }
.admin-shell.day-mode .brand-text { color: #2c1e10; }
.admin-shell.day-mode .sidebar-section-label { color: #A0522D; }
.admin-shell.day-mode .nav-item { color: #5c3f2e; }
.admin-shell.day-mode .nav-item:hover { background: rgba(212,175,55,0.2); color: #2c1e10; }
.admin-shell.day-mode .nav-item.active { background: linear-gradient(135deg, #D4AF37, #C09040); color: white }
.admin-shell.day-mode .nav-badge { background: #e53e3e; }
.admin-shell.day-mode .theme-toggle { background: none; border:none; color: #3c2a1e; }
.admin-shell.day-mode .theme-toggle:hover { background: rgba(212,175,55,0.2) }
.admin-shell.day-mode .logout-btn { color: #5c3f2e; }
.admin-shell.day-mode .logout-btn:hover { background: rgba(229,62,62,0.08); color: #c53030; }
.admin-shell.day-mode .admin-chip { background: rgba(212,175,55,0.06); border-radius: 10px; }
.admin-shell.day-mode .chip-avatar { background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(160,82,45,0.15)); color: #A0522D; }
.admin-shell.day-mode .chip-name { color: #3c2a1e; }
.admin-shell.day-mode .chip-role { color: #A0522D; }
.admin-shell.day-mode .chip-dot { background: #22c55e; }
.admin-shell.day-mode .topbar { background: #f4efe4 }
.admin-shell.day-mode .topbar-title h1 { color: #2c1e10; }
.admin-shell.day-mode .topbar-date { color: #A0522D; }
.admin-shell.day-mode .topbar-breadcrumb { color: #A0522D }
.admin-shell.day-mode .refresh-btn { background: rgba(255,255,255,0.9); color: #5c3f2e; }
.admin-shell.day-mode .refresh-btn:hover { color: #A0522D }
.admin-shell.day-mode .loading-screen { color: #5c3f2e; }
.admin-shell.day-mode .loader-ring { border-color: rgba(212,175,55,0.2); border-top-color: #D4AF37; }
.admin-shell.day-mode .kpi-card { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px rgba(139,69,19,0.05); }
.admin-shell.day-mode .kpi-accent { background: linear-gradient(135deg, #D4AF37, #B8860B); border-color: transparent; box-shadow: 0 0 20px rgba(212,175,55,0.4); }
.admin-shell.day-mode .kpi-accent .kpi-label, .admin-shell.day-mode .kpi-accent .kpi-value, .admin-shell.day-mode .kpi-accent .kpi-sub { color: white; }
.admin-shell.day-mode .kpi-highlight { background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(160,82,45,0.05)); border-color: rgba(212,175,55,0.25); }
.admin-shell.day-mode .kpi-danger { border-color: rgba(229,62,62,0.3); }
.admin-shell.day-mode .kpi-danger .kpi-value { color: #c53030; }
.admin-shell.day-mode .kpi-label { color: #A0522D; font-weight: 600; }
.admin-shell.day-mode .kpi-value { color: #2c1e10; }
.admin-shell.day-mode .kpi-sub { color: #7a5c3e; }
.admin-shell.day-mode .card { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px rgba(139,69,19,0.04); }
.admin-shell.day-mode .card-head { border-bottom: 1px solid rgba(212,175,55,0.12); }
.admin-shell.day-mode .card-head h2 { color: #2c1e10; }
.admin-shell.day-mode .card-sub { color: #A0522D; }
.admin-shell.day-mode .legend-dot { background: #D4AF37; }
.admin-shell.day-mode .sparkbar { background: linear-gradient(180deg, #e0c050, #D4AF37); }
.admin-shell.day-mode .sparkbar-col:hover .sparkbar { background: linear-gradient(180deg, #f0d060, #c8a020); }
.admin-shell.day-mode .sparkbar-label { color: #A0522D; }
.admin-shell.day-mode .sparkbar-value { color: #A0522D; }
.admin-shell.day-mode .search-input { background: #fdfaf4; color: #2c1e10; }
.admin-shell.day-mode .search-input:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,0.12); }
.admin-shell.day-mode .search-input::placeholder { color: rgba(92,63,46,0.4); }
.admin-shell.day-mode .search-icon { color: #A0522D }
.admin-shell.day-mode .filter-select { background: rgba(255,255,255,0.9); color: #2c1e10; }
.admin-shell.day-mode .seg-group { background: rgba(255,255,255,0.75) }
.admin-shell.day-mode .seg-btn { color: rgba(92,63,46,0.5); }
.admin-shell.day-mode .seg-btn:hover:not(.seg-btn--active) { background: rgba(212,175,55,0.1); color: #3c2a1e; }
.admin-shell.day-mode .seg-btn--active { background: linear-gradient(135deg, #D4AF37, #C09040); color: #fff; box-shadow: 0 0 8px rgba(212,175,55,0.4); font-weight: 600; }
.admin-shell.day-mode .data-table thead tr { border-bottom: 1px solid rgba(212,175,55,0.18); }
.admin-shell.day-mode .data-table th { color: #A0522D; }
.admin-shell.day-mode .table-row { border-bottom: 1px solid rgba(212,175,55,0.07); }
.admin-shell.day-mode .table-row:hover { background: rgba(212,175,55,0.05); }
.admin-shell.day-mode .avatar { background: rgba(212,175,55,0.1); color: #A0522D; }
.admin-shell.day-mode .user-name { color: #2c1e10; }
.admin-shell.day-mode .user-email { color: #A0522D; }
.admin-shell.day-mode .num-cell { color: #2c1e10; }
.admin-shell.day-mode .dim-cell { color: #7a5c3e; }
.admin-shell.day-mode .loading-cell, .admin-shell.day-mode .empty-cell, .admin-shell.day-mode .empty-state { color: #A0522D; }
.admin-shell.day-mode .badge-premium { background: rgba(212,175,55,0.12); color: #8B6914 }
.admin-shell.day-mode .badge-signature { background: rgba(212,175,55,0.12); color: #8B6914 }
.admin-shell.day-mode .badge-spotlight { background: rgba(59,158,221,0.1); color: #1a6fa8 }
.admin-shell.day-mode .badge-free { background: rgba(139,69,19,0.06); color: #7a5c3e }
.admin-shell.day-mode .badge-ok { background: rgba(34,197,94,0.08); color: #166534 }
.admin-shell.day-mode .badge-hidden { background: rgba(244,63,94,0.09); color: #be123c }
.admin-shell.day-mode .badge-muted { background: rgba(100,116,139,0.07); color: #64748b }
.admin-shell.day-mode .pf-like { background: rgba(34,197,94,0.08); color: #166534 }
.admin-shell.day-mode .pf-dislike { background: rgba(239,68,68,0.08); color: #b91c1c }
.admin-shell.day-mode .pf-tier { background: rgba(160,82,45,0.09); color: #A0522D }
.admin-shell.day-mode .place-event { color: #A0522D }
.admin-shell.day-mode .badge-danger { background: rgba(229,62,62,0.08); color: #c53030 }
.admin-shell.day-mode .btn-accent { background: linear-gradient(135deg, #D4AF37, #C09040); color: white; border: none; }
.admin-shell.day-mode .btn-accent:hover { box-shadow: 0 0 14px rgba(212,175,55,0.45); }
.admin-shell.day-mode .btn-muted { background: rgba(255,255,255,0.9); color: #5c3f2e }
.admin-shell.day-mode .btn-muted:hover { background: rgba(212,175,55,0.07); color: #2c1e10; }
.admin-shell.day-mode .btn-danger-outline { color: #c53030; }
.admin-shell.day-mode .btn-cooldown { background: rgba(99,102,241,0.08); color: #4f46e5; }
.admin-shell.day-mode .btn-cooldown:hover { background: rgba(99,102,241,0.16); }
.admin-shell.day-mode .btn-warning { background: rgba(234,179,8,0.1); color: #b45309; }
.admin-shell.day-mode .btn-warning:hover { background: rgba(234,179,8,0.2); }
.admin-shell.day-mode .btn-delete { background: rgba(239,68,68,0.07); color: #b91c1c; }
.admin-shell.day-mode .btn-delete:hover { background: rgba(239,68,68,0.15); }
.admin-shell.day-mode .btn-danger-outline:hover { background: rgba(229,62,62,0.07); }
.admin-shell.day-mode .purge-main { color: #c53030; }
.admin-shell.day-mode .purge-main:hover { background: rgba(229,62,62,0.07); }
.admin-shell.day-mode .purge-chevron { color: #c53030; }
.admin-shell.day-mode .purge-chevron:hover { background: rgba(229,62,62,0.07); }
.admin-shell.day-mode .purge-dropdown { background: #fff; box-shadow: 0 0 28px rgba(139,69,19,0.1); }
.admin-shell.day-mode .purge-dropdown-item { color: #2c1e10; }
.admin-shell.day-mode .purge-dropdown-item:hover { background: rgba(229,62,62,0.06); }
.admin-shell.day-mode .purge-dropdown-item--active { color: #c53030; font-weight: 600; }
.admin-shell.day-mode .purge-dropdown-item--never { color: #c53030; }
.admin-shell.day-mode .purge-dropdown-apply { background: rgba(229,62,62,0.08); color: #c53030 }
.admin-shell.day-mode .purge-dropdown-apply:hover { background: rgba(229,62,62,0.15); }
.admin-shell.day-mode .usage-bar { background: rgba(212,175,55,0.15); }
.admin-shell.day-mode .fill-accent { background: linear-gradient(90deg, #D4AF37, #C09040); }
.admin-shell.day-mode .fill-danger { background: linear-gradient(90deg, #e53e3e, #c53030); }
.admin-shell.day-mode .usage-label { color: #A0522D; }
.admin-shell.day-mode .type-chip { background: rgba(212,175,55,0.08); color: #A0522D }
.admin-shell.day-mode .pagination button { background: rgba(255,255,255,0.9); color: #5c3f2e }
.admin-shell.day-mode .pagination button:not(:disabled):hover { border-color: #D4AF37; color: #A0522D; background: rgba(212,175,55,0.06); }
.admin-shell.day-mode .pagination span { color: #5c3f2e; }
.admin-shell.day-mode .toast--success { background: rgba(255,255,255,0.97); color: #166534; box-shadow: 0 0 30px rgba(0,0,0,0.1); }
.admin-shell.day-mode .toast--error { background: rgba(255,255,255,0.97); color: #c53030; box-shadow: 0 0 30px rgba(0,0,0,0.1); }
.admin-shell.day-mode .place-card { background: rgba(255,255,255,0.9); box-shadow: 0 0 8px rgba(139,69,19,0.05); }
.admin-shell.day-mode .place-card:hover { border-color: rgba(212,175,55,0.4); box-shadow: 0 0 28px rgba(212,175,55,0.14); }
.admin-shell.day-mode .place-img-placeholder { background: rgba(212,175,55,0.07); color: #D4AF37; }
.admin-shell.day-mode .place-name { color: hsl(30, 47%, 12%); }
.admin-shell.day-mode .place-addr { color: #A0522D; }
.admin-shell.day-mode .place-stats { color: #A0522D; }
.admin-shell.day-mode .btn-danger { color: #e53e3e; }
.admin-shell.day-mode .btn-danger:hover { background: rgba(229,62,62,0.07); }

/* ── USER LOCATION CHARTS ── */
.loc-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 14px }
.loc-card .card-head { padding: 14px 20px 11px; }
.loc-body { padding: 6px 20px 16px; display: flex; flex-direction: column; gap: 7px; }
.loc-row { display: grid; grid-template-columns: 140px 1fr 36px 36px 44px; align-items: center; gap: 10px; }
.loc-name { font-size: 12px; font-family: 'DM Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.loc-bar-wrap { flex: 1; }
.loc-bar { height: 7px; border-radius: 4px; background: rgba(255,255,255,0.07); position: relative; overflow: hidden; }
.loc-bar-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #a78bfa, #7c3aed); transition: width 0.5s ease; }
.loc-bar-premium { background: linear-gradient(90deg, #fbbf24, #D4AF37); opacity: 0.7; }
.loc-count { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 600; text-align: right; }
.loc-pct { font-family: 'DM Mono', monospace; font-size: 10px; opacity: 0.5; text-align: right; }
.loc-premium-badge { display: inline-flex; align-items: center; gap: 3px; font-family: 'DM Mono', monospace; font-size: 10px; color: #D4AF37; font-weight: 600; white-space: nowrap; }
.loc-city-row { display: grid; grid-template-columns: 22px 1fr 100px 32px; align-items: center; gap: 10px; padding: 5px 0; }
.loc-city-rank { font-family: 'DM Mono', monospace; font-size: 10px; opacity: 0.35; text-align: center; }
.loc-city-name { font-size: 13px; font-weight: 600; }
.loc-city-country { font-size: 10px; font-family: 'DM Mono', monospace; opacity: 0.5; margin-top: 1px; }
.admin-shell.night-mode .loc-bar { background: rgba(255,255,255,0.06); }
.admin-shell.day-mode .loc-bar { background: rgba(0,0,0,0.07); }
.admin-shell.day-mode .loc-bar-fill { background: linear-gradient(90deg, #D4AF37, #B8860B); }
.admin-shell.day-mode .loc-name, .admin-shell.day-mode .loc-count { color: #2c1e10; }
.admin-shell.day-mode .loc-pct { color: #7a5c3e; }
.admin-shell.day-mode .loc-city-name { color: #2c1e10; }
.admin-shell.day-mode .loc-city-country { color: #A0522D; }

/* ── PRICES ── */
.prices-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 16px; }
.price-card .card-head { display: flex; align-items: center; gap: 8px; padding: 14px 18px 12px; }
.price-card .card-head h2 { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
.price-card-body { padding: 4px 18px 16px; display: flex; flex-direction: column; gap: 10px; }
.price-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.price-row:last-child { border-bottom: none; }
.price-row--total { margin-top: 4px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1) !important; border-bottom: none !important; }
.price-row--total .price-label { font-weight: 700; }
.price-row--total .price-val { font-weight: 700; font-size: 15px; font-family: 'DM Mono', monospace; }
.price-label { font-family: 'DM Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; opacity: 0.6; }
.price-val { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; }
.price-editable { display: flex; align-items: center; gap: 2px; }
.price-stepper { display: flex; align-items: center; gap: 0; border-radius: 8px; overflow: hidden; }
.price-step-btn { background: rgba(255,255,255,0.06); border: none; color: inherit; width: 28px; height: 30px; cursor: pointer; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; opacity: 0.7; }
.price-step-btn:hover { background: rgba(255,255,255,0.12); opacity: 1; }
.price-step-btn:active { background: rgba(255,255,255,0.18); }
.price-step-symbol { font-family: 'DM Mono', monospace; font-size: 12px; opacity: 0.5; padding: 0 2px 0 6px; }
.price-input { width: 60px; background: transparent; border: none; border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); padding: 4px 6px; font-family: 'DM Mono', monospace; font-size: 13px; color: inherit; outline: none; text-align: center; }
/* Hide native number spinners */
.price-input::-webkit-outer-spin-button,
.price-input[type=number] { -moz-appearance: textfield; appearance: textfield; }
.price-textarea { width: 100%; border:none; background: transparent; border-radius: 8px; padding: 8px 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; color: inherit; outline: none; resize: vertical; transition: border-color 0.15s; }
.admin-shell.day-mode .price-row { border-bottom-color: rgba(212,175,55,0.08); }
.admin-shell.day-mode .price-row--total { border-top-color: rgba(212,175,55,0.18) !important; }
.admin-shell.day-mode .price-stepper { border-color: rgba(0,0,0,0.15); }
.admin-shell.day-mode .price-step-btn { background: rgba(0,0,0,0.04); }
.admin-shell.day-mode .price-step-btn:hover { background: rgba(0,0,0,0.09); }
.admin-shell.day-mode .price-input { border-left-color: rgba(0,0,0,0.08); border-right-color: rgba(0,0,0,0.08); color: #2c1e10; }
.admin-shell.day-mode .price-textarea { color: #2c1e10 }

/* ── QUICK ACTION CHART ── */
.qa-chart-wrap { padding: 10px 20px 18px; display: flex; flex-direction: column; gap: 10px; }
.qa-row { display: grid; grid-template-columns: 130px 1fr 52px 36px; align-items: center; gap: 12px; }
.qa-label { display: flex; align-items: center; gap: 7px; font-size: 12px; font-family: 'DM Mono', monospace; font-weight: 500; white-space: nowrap; }
.qa-icon { display: flex; align-items: center; opacity: 0.65; }
.qa-bar-wrap { flex: 1; }
.qa-bar { height: 8px; border-radius: 4px; background: rgba(255,255,255,0.07); position: relative; overflow: hidden; }
.qa-bar-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #D4AF37, #a78bfa); transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.qa-bar-fill--chat { background: linear-gradient(90deg, #38bdf8, #818cf8); }
.qa-count { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 600; text-align: right; }
.qa-pct { font-family: 'DM Mono', monospace; font-size: 10px; opacity: 0.45; text-align: right; }
.qa-section-label { font-size: 9px; font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.35; padding: 2px 0 0; }
.qa-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }
.qa-row--chat .qa-label { opacity: 0.85; }
.qa-legend-quick { background: linear-gradient(90deg, #D4AF37, #a78bfa); }
.qa-legend-chat { background: linear-gradient(90deg, #38bdf8, #818cf8); }
.admin-shell.day-mode .qa-bar { background: rgba(0,0,0,0.07); }
.admin-shell.day-mode .qa-divider { background: rgba(0,0,0,0.07); }
.admin-shell.day-mode .qa-label { color: #2c1e10; }
.admin-shell.day-mode .qa-count { color: #2c1e10; }
.admin-shell.day-mode .qa-pct { color: #A0522D; }
.legend-dot--accent { background: linear-gradient(90deg, #D4AF37, #a78bfa); }

/* ── PREFERENCE CHARTS — TILE LAYOUT ── */

/* Header: title block on the left, completion-rate "stat" on the right */
.pref-head { align-items: center; }
.pref-head-titles { display: flex; flex-direction: column; gap: 2px; }
.pref-completion-block { display: flex; flex-direction: column; align-items: flex-end; line-height: 1; }
.pref-completion-num { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
.pref-completion-cap { font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.55; margin-top: 3px; }
.admin-shell.night-mode .pref-completion-num { color: #a78bfa; }
.admin-shell.day-mode   .pref-completion-num { color: #8B6914; }

/* 2-column grid; Interests tile spans both columns */
.pref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 14px 20px 20px; }
.pref-tile--full { grid-column: 1 / -1; }

/* Tile — subtle bordered container */
.pref-tile { border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; transition: background 0.2s ease; }
.admin-shell.night-mode .pref-tile { background: rgba(139,92,246,0.04) }
.admin-shell.night-mode .pref-tile:hover { background: rgba(139,92,246,0.07) }
.admin-shell.day-mode   .pref-tile { background: rgba(212,175,55,0.04) }
.admin-shell.day-mode   .pref-tile:hover { background: rgba(212,175,55,0.07) }

.pref-tile-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.pref-tile-title { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: -0.1px; }
.pref-tile-meta  { font-family: 'DM Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; }
.admin-shell.night-mode .pref-tile-title { color: #e2e8f0; }
.admin-shell.day-mode   .pref-tile-title { color: #2c1e10; }
.admin-shell.night-mode .pref-tile-meta  { color: #c084fc; }
.admin-shell.day-mode   .pref-tile-meta  { color: #A0522D; }

.pref-tile-body { display: flex; flex-direction: column; gap: 12px; }
.pref-tile-body--donut { flex-direction: row; align-items: center; gap: 16px; }

/* Donut chart — larger, with overlaid HTML center for the "winner" */
.pref-donut-wrap { position: relative; width: 110px; height: 110px; flex-shrink: 0; }
.pref-donut { width: 100%; height: 100%; transform: rotate(-90deg); }
.pref-donut-track { stroke: rgba(167,139,250,0.10); }
.pref-donut-seg { transition: stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1); }
.admin-shell.night-mode .pref-donut-track { stroke: rgba(255,255,255,0.08); }
.admin-shell.day-mode   .pref-donut-track { stroke: rgba(0,0,0,0.08); }

/* HTML center label — captures the "winning" category */
.pref-donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; pointer-events: none; text-align: center; padding: 0 10px; }
.pref-donut-top-val { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; text-transform: capitalize; letter-spacing: -0.2px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pref-donut-top-pct { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 700; letter-spacing: -0.3px; }
.admin-shell.night-mode .pref-donut-top-val { color: #e2e8f0; }
.admin-shell.night-mode .pref-donut-top-pct { color: #a78bfa; }
.admin-shell.day-mode   .pref-donut-top-val { color: #2c1e10; }
.admin-shell.day-mode   .pref-donut-top-pct { color: #8B6914; }

/* Legend (next to donut on desktop, below on narrow) */
.pref-legend { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.pref-legend-item { display: flex; align-items: center; gap: 8px; font-size: 11px; min-width: 0; }
.pref-legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.pref-legend-label { flex: 1; font-family: 'DM Mono', monospace; font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: capitalize; }
.pref-legend-count { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.admin-shell.night-mode .pref-legend-label { color: #cbd5e1; }
.admin-shell.night-mode .pref-legend-count { color: #a78bfa; }
.admin-shell.day-mode   .pref-legend-label { color: #2c1e10; }
.admin-shell.day-mode   .pref-legend-count { color: #8B6914; }

/* Top Interests: two-column bar grid on desktop, single-column on mobile */
.pref-bars { display: flex; flex-direction: column; gap: 9px; }
.pref-bars--two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 9px 24px; }
.pref-bar-row { display: grid; grid-template-columns: 100px 1fr 36px; align-items: center; gap: 10px; }
.pref-bar-label { font-family: 'DM Mono', monospace; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: capitalize; }
.pref-bar-track { height: 7px; border-radius: 4px; position: relative; overflow: hidden; }
.pref-bar-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.pref-bar-count { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600; text-align: right; }
.pref-two-bars { display: flex; flex-direction: column; gap: 10px; }
.pref-two-bar-row { display: grid; grid-template-columns: 110px 1fr 32px 36px; align-items: center; gap: 10px; }
.pref-bar-pct { font-family: 'DM Mono', monospace; font-size: 10px; opacity: 0.6; text-align: right; }
.admin-shell.night-mode .pref-bar-track { background: rgba(255,255,255,0.06); }
.admin-shell.night-mode .pref-bar-label { color: #e2e8f0; }
.admin-shell.night-mode .pref-bar-count { color: #e2e8f0; }
.admin-shell.day-mode   .pref-bar-track { background: rgba(0,0,0,0.07); }
.admin-shell.day-mode   .pref-bar-label { color: #2c1e10; }
.admin-shell.day-mode   .pref-bar-count { color: #2c1e10; }

/* ── LOCATION SECTION LABELS ── */
.loc-section-label { display: flex; align-items: center; gap: 7px; font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; padding: 0 2px; }
.loc-section-sub { font-size: 10px; font-weight: 400; text-transform: none; letter-spacing: 0; opacity: 0.7; margin-left: 6px; }
.loc-section-sub--empty { opacity: 0.35; }
.loc-bar-dest { background: linear-gradient(90deg, #22d3ee, #0891b2) !important; }
.admin-shell.day-mode .loc-bar-dest { background: linear-gradient(90deg, #0e7490, #164e63) !important; }
.admin-shell.day-mode .loc-section-label { color: #A0522D; }
.admin-shell.night-mode .loc-section-label { color: #a78bfa; }

/* ── DB STATS ── */
.db-meta { font-size: 10px; opacity: 0.5; margin-left: 2px; }
.db-loading { opacity: 0.4; font-style: italic; }
.db-progress-row { align-items: center; }
.db-progress-wrap { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.db-progress-bar { height: 6px; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,0.08); }
.admin-shell.day-mode .db-progress-bar { background: rgba(0,0,0,0.08); }
.db-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #4ade80, #22d3ee); transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.db-fill-warn { background: linear-gradient(90deg, #fbbf24, #f97316); }
.db-fill-danger { background: linear-gradient(90deg, #f87171, #dc2626); }
.db-progress-label { font-family: 'DM Mono', monospace; font-size: 10px; opacity: 0.5; }

/* ── HIDDEN GEM ROW ── */
.row-hidden-gem { position: relative; }
.admin-shell.night-mode .row-hidden-gem { background: linear-gradient(90deg, rgba(212,175,55,0.07) 0%, transparent 60%) !important; border-left: 2px solid rgba(212,175,55,0.5); }
.admin-shell.day-mode  .row-hidden-gem { background: linear-gradient(90deg, rgba(212,175,55,0.09) 0%, transparent 60%) !important; border-left: 2px solid rgba(212,175,55,0.55); }
.gem-badge { display: inline-flex; align-items: center; gap: 3px; margin-left: 7px; padding: 1px 6px; border-radius: 10px; font-size: 9px; font-family: 'DM Mono', monospace; font-weight: 600; letter-spacing: 0.04em; white-space: nowrap; vertical-align: middle; }
.admin-shell.night-mode .gem-badge { background: rgba(212,175,55,0.14); color: #D4AF37 }
.admin-shell.day-mode  .gem-badge { background: rgba(212,175,55,0.15); color: #8B6914 }

/* ── USER ACTIONS CELL ── */
.row-actions { display: flex; align-items: center; gap: 5px; }
.user-actions-cell { display: flex; flex-direction: column; gap: 3px; }
.ua-item { display: grid; grid-template-columns: 14px 28px 1fr; align-items: center; gap: 5px; }
.ua-item svg { opacity: 0.4; flex-shrink: 0; }
.ua-label { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.45; }
.ua-val { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 600; }
.admin-shell.night-mode .ua-val { color: #e2e8f0; }
.admin-shell.night-mode .ua-item svg { stroke: #a78bfa; }
.admin-shell.day-mode .ua-val { color: #2c1e10; }
.admin-shell.day-mode .ua-item svg { stroke: #A0522D; }

/* ─ Tablet: 768px–1100px ─ */
@media (max-width: 1100px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .kpi-grid--4 { grid-template-columns: repeat(2, 1fr); }
  .kpi-grid--5 { grid-template-columns: repeat(3, 1fr); }
  .loc-grid { grid-template-columns: 1fr; }
  .prices-grid { grid-template-columns: 1fr; }
}
/* ─ Mobile: ≤ 768px ─ */
@media (max-width: 768px) {
  .admin-shell { flex-direction: column; }
  .sidebar { width: 100%; height: 54px; position: fixed; bottom: 0; left: 0; right: 0; top: auto; z-index: 100; flex-direction: row; align-items: stretch; padding: 0; border-top: 1px solid rgba(139,92,246,0.18); box-shadow: 0 -4px 24px rgba(0,0,0,0.18); overflow: hidden; }
  .admin-shell.night-mode .sidebar { background: #16213e }
  .sidebar-brand, .sidebar-spacer, .sidebar-section-label { display: none; }
  .sidebar-nav {
    flex-direction: row; flex: 1; min-width: 0;
    padding: 0; gap: 0;
    overflow-x: auto; overflow-y: hidden;
    scrollbar-width: none;
    /* Stop iOS/Android rubber-band bounce from leaking into the page or
       making the nav feel like it scrolls forever past the last tab.
       Note: we intentionally don't set `-webkit-overflow-scrolling: touch`
       here — that enables iOS momentum scroll which is what causes the
       dramatic rubber-band feel even when overscroll-behavior is contained. */
    overscroll-behavior-x: contain;
  }
  .sidebar-nav::-webkit-scrollbar { display: none; }
  /* Nav items: 32px each so all 9 tabs (288px) + footer (84px) = 372px
     fits comfortably on a 375px-wide iPhone without needing to scroll. */
  .nav-item { flex-direction: column; align-items: center; justify-content: center; gap: 0; padding: 0; border-radius: 0; border: none; flex: 0 0 32px; width: 32px; height: 54px; }
  .nav-label, .nav-badge, .nav-active-dot { display: none; }
  .sidebar-footer { flex-direction: row; flex-shrink: 0; padding: 0; gap: 0; border-left: 1px solid rgba(139,92,246,0.15); }
  .admin-shell.day-mode .sidebar-footer { border-left-color: rgba(212,175,55,0.2) }
  .theme-toggle { flex-direction: column; align-items: center; justify-content: center; padding: 0; border-radius: 0; width: 42px; height: 54px; flex-shrink: 0; }
  .theme-label { display: none; }
  .logout-btn { flex-direction: column; align-items: center; justify-content: center; padding: 0; border-radius: 0; width: 42px; height: 54px; flex-shrink: 0; }
  .logout-btn .theme-label { display: none; }
  .main-content { padding-bottom: 64px; min-height: 100vh; }
  .topbar { padding: 14px 16px 12px; position: sticky; top: 0; z-index: 10; }
  .topbar-title h1 { font-size: 17px; }
  .topbar-breadcrumb, .topbar-date { display: none; }
  .topbar-actions { gap: 8px; }
  .content-area { padding: 12px 14px 20px; }
  .tab-section { gap: 12px; }
  .kpi-grid, .kpi-grid--3, .kpi-grid--4, .kpi-grid--5 { grid-template-columns: 1fr 1fr; gap: 10px; }
  .kpi-card { padding: 12px 13px; border-radius: 12px; }
  .kpi-value { font-size: 22px; }
  .kpi-label { font-size: 9px; }
  .kpi-sub { font-size: 10px; }
  .kpi-icon { margin-bottom: 8px; }
  .brand-icon-wrap { width: 36px; height: 36px; }
  .card { border-radius: 12px; }
  .card-head { padding: 13px 15px 11px; gap: 6px; flex-wrap: wrap; }
  .card-head h2 { font-size: 13px; }
  .card-head-spacer { display: none; }
  .chart-legend { width: 100%; margin-top: 2px; }
  .sparkbar-wrap { padding: 6px 14px 10px; height: 100px; }
  .toolbar { flex-direction: column; align-items: stretch; gap: 8px; }
  .toolbar > .action-btn { align-self: flex-start; }
  .search-wrap { max-width: 100%; }
  .seg-group { align-self: stretch; display: flex; flex-wrap: wrap; max-width: 100%; box-sizing: border-box; }
  .seg-btn { flex: 0 1 auto; }
  .table-card { border-radius: 12px; }
  .user-name { font-size: 12px; }
  .user-email { font-size: 10px; }
  .action-btn--sm { width: 44px; font-size: 10px; padding: 4px 0; }
  .usage-bar { width: 52px; }
  .pagination { gap: 10px; font-size: 12px; }
  .pagination button { padding: 6px 12px; font-size: 12px; }
  .places-grid { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 10px; }
  .place-img-wrap { height: 120px; }
  .loc-grid { grid-template-columns: 1fr; gap: 10px; }
  .loc-row { grid-template-columns: 100px 1fr 32px 32px 38px; gap: 7px; }
  .loc-name { font-size: 11px; }
  .loc-city-row { grid-template-columns: 18px 1fr 80px 28px; gap: 7px; }
  .loc-body { padding: 4px 14px 13px; }
  /* Pref tiles: stack 1-column, slightly tighter padding */
  .pref-grid { grid-template-columns: 1fr; gap: 10px; padding: 12px 14px 16px; }
  .pref-tile { padding: 12px 13px; gap: 10px; }
  /* Donut + legend side-by-side stays on mobile (donut shrinks slightly) */
  .pref-donut-wrap { width: 96px; height: 96px; }
  .pref-tile-body--donut { gap: 12px; }
  /* Top Interests: single-column bars on mobile */
  .pref-bars--two-col { grid-template-columns: 1fr; gap: 8px; }
  .pref-bar-row { grid-template-columns: 90px 1fr 32px; gap: 7px; }
  .pref-two-bar-row { grid-template-columns: 90px 1fr 28px 30px; gap: 6px; }
  /* Header completion stat: still visible but tighter */
  .pref-completion-num { font-size: 18px; }
  .qa-chart-wrap { padding: 8px 14px 14px; gap: 14px; }
  /* On mobile, stack the label above the bar so neither gets cramped.
     Top row: label (full width, can wrap).
     Bottom row: bar (flexes) + count + pct. */
  .qa-row { grid-template-columns: 1fr auto auto; grid-template-areas: "label label label" "bar count pct"; gap: 4px 8px; }
  .qa-label { grid-area: label; white-space: normal; font-size: 11.5px; }
  .qa-bar-wrap { grid-area: bar; }
  .qa-bar { height: 10px; border-radius: 5px; }
  .qa-bar-fill { border-radius: 5px; }
  .qa-count { grid-area: count; font-size: 11.5px; min-width: 40px; }
  .qa-pct { grid-area: pct; font-size: 10px; min-width: 30px; }
  .prices-grid { grid-template-columns: 1fr; gap: 10px; }
  .g-chart-body { padding: 6px 14px 4px; }
  .g-bars { gap: 3px; height: 130px; }
  /* In 30-day mode on mobile, 30 bars at ~10px wide can't fit 30 labels.
     Override the desktop "every other" rule and show only every 5th label
     (days 1, 6, 11, 16, 21, 26) — six anchor labels with comfortable spacing. */
  .g-bars--30d .g-bar-col .g-bar-label { display: none; }
  .g-bars--30d .g-bar-col:nth-child(5n+1) .g-bar-label { display: block; }
  .g-legend--footer { gap: 10px; padding: 8px 14px 12px; font-size: 10px; }
  .toast { left: 14px; right: 14px; bottom: 74px; width: auto; }
  .empty-state { padding: 28px 14px; font-size: 12px; }
  .loading-cell, .empty-cell { padding: 28px 14px; font-size: 12px; }
  /* ── Mobile sidebar: looping strip replaces nav + footer ─────────────
     The .sidebar-loop-strip renders 3 copies of all nav items in a single
     horizontally-scrolling row. A JS scroll handler in setup() jumps the
     scroll position back to the middle copy when the user reaches either
     edge, producing seamless infinite scrolling. */
  .sidebar-nav { display: none; }
  .sidebar-footer { display: none; }
  /* Use .sidebar prefix here so this rule has higher specificity than the
     base `.sidebar-loop-strip { display: none }` outside the media query —
     otherwise the source-order would hide the strip even on mobile. */
  .sidebar .sidebar-loop-strip { display: flex; flex: 1; min-width: 0; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
  .sidebar-loop-strip::-webkit-scrollbar { display: none; }
  .sidebar-loop-strip .nav-item { flex: 0 0 42px; width: 42px; height: 54px; flex-direction: column; align-items: center; justify-content: center; gap: 0; padding: 0; border-radius: 0; border: none; background: transparent; }
  /* Hide labels (we already do this on the original .nav-item for mobile;
     repeat here in case the loop-strip uses different markup) */
  .sidebar-loop-strip .nav-item .nav-label { display: none; }
  /* Theme and logout get a subtle visual separator so they're distinguishable
     from the tabs as the strip scrolls past them. */
  .admin-shell.night-mode .sidebar-loop-strip .nav-item--theme,
  .admin-shell.night-mode .sidebar-loop-strip .nav-item--logout { color: rgba(226,232,240,0.55); }
  .admin-shell.day-mode  .sidebar-loop-strip .nav-item--theme,
  .admin-shell.day-mode  .sidebar-loop-strip .nav-item--logout { color: rgba(92,63,46,0.6); }
  .sidebar-loop-strip .nav-item--logout:hover { color: #e53e3e !important; }
}

/* Loop-strip is mobile-only — hidden on desktop. */
.sidebar-loop-strip { display: none; }

/* ── MOBILE: Table → Vertical Cards ──────────────────────────────────────
   Transforms <table> rows into stacked cards on screens ≤768px. Each <td>
   becomes a labeled row using its `data-label` attribute. Loading/empty
   rows fall back to a centered single-column display. The action cell
   spans the full card width with a thin divider on top. */
@media (max-width: 768px) {
  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td { display: block; width: 100%; }
  /* Hide the table header — labels are now inline per cell */
  .data-table thead { display: none; }
  /* Each row = card */
  .data-table tbody tr.table-row { padding: 14px 14px 10px; margin: 0; border-bottom: 1px solid; box-sizing: border-box; }
  .admin-shell.night-mode .data-table tbody tr.table-row { border-bottom-color: rgba(139,92,246,0.10); }
  .admin-shell.day-mode  .data-table tbody tr.table-row { border-bottom-color: rgba(212,175,55,0.10); }
  .data-table tbody tr.table-row:last-child { border-bottom: none; }
  .admin-shell.night-mode .data-table tbody tr.table-row:hover { background: rgba(139,92,246,0.04); }
  .admin-shell.day-mode  .data-table tbody tr.table-row:hover { background: rgba(212,175,55,0.04); }
  /* Each cell = labeled row inside the card */
  .data-table tbody tr.table-row td { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 6px 0; text-align: right; border: none; }
  /* Label on the left, derived from data-label */
  .data-table tbody tr.table-row td::before { content: attr(data-label); flex-shrink: 0; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'DM Mono', monospace; opacity: 0.6; text-align: left; }
  /* Cells without data-label (loading/empty rows): center the content */
  .data-table tbody tr.table-row td:not([data-label]) { justify-content: center; text-align: center; }
  .data-table tbody tr.table-row td:not([data-label])::before { display: none; }
  /* The first cell (name/title) gets larger styling and no label */
  .data-table tbody tr.table-row td:first-child { padding: 0 0 10px; margin-bottom: 6px; border-bottom: 1px dashed; text-align: left; flex-direction: column; align-items: flex-start; gap: 2px; }
  .admin-shell.night-mode .data-table tbody tr.table-row td:first-child { border-bottom-color: rgba(139,92,246,0.12); }
  .admin-shell.day-mode  .data-table tbody tr.table-row td:first-child { border-bottom-color: rgba(212,175,55,0.15); }
  .data-table tbody tr.table-row td:first-child::before { display: block; }
  /* The action cell goes full-width with a top divider, buttons centered */
  .data-table tbody tr.table-row td.td-actions { padding-top: 10px; margin-top: 6px; border-top: 1px dashed; flex-direction: column; align-items: stretch; gap: 6px; }
  .admin-shell.night-mode .data-table tbody tr.table-row td.td-actions { border-top-color: rgba(139,92,246,0.12); }
  .admin-shell.day-mode  .data-table tbody tr.table-row td.td-actions { border-top-color: rgba(212,175,55,0.15); }
  .data-table tbody tr.table-row td.td-actions::before { text-align: center; margin-bottom: 2px; }
  .data-table tbody tr.table-row td.td-actions .action-group { justify-content: center; flex-wrap: wrap; gap: 6px; }
  /* Buttons in the action row should be auto-width (not the 44px shrunk size) */
  .data-table tbody tr.table-row td.td-actions .action-btn--sm { width: auto; padding: 6px 12px; }
  /* Icon-only buttons: bump tap target on mobile */
  .data-table tbody tr.table-row td.td-actions .action-btn--icon { width: 36px; height: 36px; }
  /* Multi-line content cells (chips, user-actions, assignment) flow naturally */
  .data-table tbody tr.table-row td .type-chips,
  .data-table tbody tr.table-row td .user-actions-cell { justify-content: flex-end; flex-wrap: wrap; }
  .data-table tbody tr.table-row td.staff-assign-cell { flex-direction: column; align-items: flex-end; text-align: right; max-width: none; }
  .data-table tbody tr.table-row td.staff-assign-cell::before { align-self: flex-start; }
  .data-table tbody tr.table-row td.staff-assign-cell .assign-scope { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  /* Usage bars (today tokens / today places): give them a clean compact look */
  .data-table tbody tr.table-row td .usage-bar-wrap { justify-content: flex-end; }
  .data-table tbody tr.table-row td .usage-bar { width: 80px; }
  /* The user-cell (name + email) inside the first cell of users table */
  .data-table tbody tr.table-row td:first-child .user-cell { width: 100%; }
}
/* ── EDIT BUTTON ── */
.btn-edit { display: inline-flex; align-items: center; gap: 4px; }
.admin-shell.night-mode .btn-edit { background: rgba(99,179,237,0.1); color: #63b3ed }
.admin-shell.night-mode .btn-edit:hover { background: rgba(99,179,237,0.2); box-shadow: 0 0 6px rgba(99,179,237,0.2); }
.admin-shell.day-mode .btn-edit { background: rgba(49,130,206,0.08); color: #2b6cb0 }
.admin-shell.day-mode .btn-edit:hover { background: rgba(49,130,206,0.15); }

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
.admin-shell.night-mode .edit-input-icon-btn:hover { background: rgba(255,255,255,0.05); }
.admin-shell.day-mode  .edit-input-icon-btn:hover { background: rgba(0,0,0,0.04); }
/* "On" state = email is publicly visible. Highlights the icon so the admin can
   tell at a glance which fields are exposed without hovering each one. */
.edit-input-icon-btn.edit-input-icon-btn--on { opacity: 1; color: #16a34a; }
.admin-shell.night-mode .edit-input-icon-btn.edit-input-icon-btn--on { color: #4ade80; }
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

/* ── IMAGE GALLERY (large preview at top of edit modal) ── */
.edit-gallery-section { padding-bottom: 4px; }
.edit-gallery-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.edit-gallery-counter { font-size: 11px; font-family: 'DM Mono', monospace; padding: 3px 8px; border-radius: 6px; }
.edit-panel.night-mode .edit-gallery-counter { background: rgba(139,92,246,0.14); color: #c4b5fd; }
.edit-panel.day-mode   .edit-gallery-counter { background: rgba(212,175,55,0.12); color: #8B4513; }

.edit-gallery { display: flex; flex-direction: column; gap: 10px; }

.edit-gallery-hero { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; cursor: zoom-in; display: flex; align-items: center; justify-content: center; }
.edit-panel.night-mode .edit-gallery-hero { background: rgba(139,92,246,0.06); box-shadow: 0 8px 24px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(139,92,246,0.18); }
.edit-panel.day-mode .edit-gallery-hero { background: rgba(212,175,55,0.05); box-shadow: 0 8px 22px rgba(60,42,30,0.12), inset 0 0 0 1px rgba(212,175,55,0.25); }
.edit-gallery-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
.edit-gallery-hero:hover .edit-gallery-hero-img { transform: scale(1.02); }
.edit-gallery-hero-img--error { opacity: 0.2; }

.edit-gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: all 0.18s; }
.edit-gallery-nav--prev { left: 12px; }
.edit-gallery-nav--next { right: 12px; }
.edit-panel.night-mode .edit-gallery-nav { background: rgba(15,15,30,0.55); color: #fff; }
.edit-panel.night-mode .edit-gallery-nav:hover { background: rgba(139,92,246,0.7); }
.edit-panel.day-mode   .edit-gallery-nav { background: rgba(255,255,255,0.7); color: #3c2a1e; }
.edit-panel.day-mode   .edit-gallery-nav:hover { background: rgba(212,175,55,0.85); color: #fff; }

.edit-gallery-expand-hint { position: absolute; bottom: 12px; right: 12px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 7px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); pointer-events: none; opacity: 0; transition: opacity 0.2s; }
.edit-gallery-hero:hover .edit-gallery-expand-hint { opacity: 1; }
.edit-panel.night-mode .edit-gallery-expand-hint { background: rgba(15,15,30,0.6); color: #e2e8f0; }
.edit-panel.day-mode   .edit-gallery-expand-hint { background: rgba(255,255,255,0.78); color: #3c2a1e; }

.edit-gallery-strip { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px; scrollbar-width: thin; }
.edit-panel.night-mode .edit-gallery-strip::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
.edit-panel.day-mode   .edit-gallery-strip::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px; }
.edit-gallery-strip::-webkit-scrollbar { height: 5px; }

.edit-gallery-thumb { flex-shrink: 0; width: 72px; height: 72px; padding: 0; border-radius: 8px; overflow: hidden; border: 2px solid transparent; cursor: pointer; background: transparent; transition: all 0.18s; opacity: 0.7; }
.edit-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.edit-gallery-thumb:hover { opacity: 1; transform: translateY(-2px); }
.edit-panel.night-mode .edit-gallery-thumb--active { border-color: #a78bfa; opacity: 1; box-shadow: 0 0 0 1px rgba(167,139,250,0.4), 0 4px 12px rgba(139,92,246,0.3); }
.edit-panel.day-mode   .edit-gallery-thumb--active { border-color: #D4AF37; opacity: 1; box-shadow: 0 0 0 1px rgba(212,175,55,0.4), 0 4px 12px rgba(160,82,45,0.2); }

.edit-gallery-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; border-radius: 14px; text-align: center; }
.edit-panel.night-mode .edit-gallery-empty { background: rgba(139,92,246,0.04); color: #94a3b8; }
.edit-panel.night-mode .edit-gallery-empty svg { stroke: #8b5cf6; opacity: 0.5; }
.edit-panel.day-mode   .edit-gallery-empty { background: rgba(212,175,55,0.04); color: #A0522D; }
.edit-panel.day-mode   .edit-gallery-empty svg { stroke: #D4AF37; opacity: 0.6; }
.edit-gallery-empty-title { font-size: 14px; font-weight: 600; margin-top: 4px; }
.edit-panel.night-mode .edit-gallery-empty-title { color: #cbd5e1; }
.edit-panel.day-mode   .edit-gallery-empty-title { color: #3c2a1e; }
.edit-gallery-empty-sub { font-size: 12px; max-width: 320px; line-height: 1.5; }

/* ── LIGHTBOX ── */
.edit-lightbox { position: fixed; inset: 0; z-index: 10010; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; padding: 40px; cursor: zoom-out; }
.edit-lightbox-img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); cursor: default; }
.edit-lightbox-close { position: absolute; top: 20px; right: 20px; width: 44px; height: 44px; border-radius: 50%; border: none; background: rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.18s; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.edit-lightbox-close:hover { background: rgba(255,255,255,0.22); }
.edit-lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 52px; height: 52px; border-radius: 50%; border: none; background: rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.18s; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.edit-lightbox-nav:hover { background: rgba(255,255,255,0.22); }
.edit-lightbox-nav--prev { left: 24px; }
.edit-lightbox-nav--next { right: 24px; }
.edit-lightbox-counter { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); font-size: 13px; font-family: 'DM Mono', monospace; color: #e2e8f0; padding: 6px 14px; border-radius: 8px; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }

@media (max-width: 640px) {
  .edit-gallery-hero { aspect-ratio: 4 / 3; border-radius: 10px; }
  .edit-gallery-nav { width: 32px; height: 32px; }
  .edit-gallery-nav--prev { left: 8px; }
  .edit-gallery-nav--next { right: 8px; }
  .edit-gallery-thumb { width: 58px; height: 58px; }
  .edit-lightbox { padding: 16px; }
  .edit-lightbox-nav { width: 40px; height: 40px; }
  .edit-lightbox-nav--prev { left: 10px; }
  .edit-lightbox-nav--next { right: 10px; }
}

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

/* ── DROP ZONE ── */
.edit-dropzone { border: 2px dashed; border-radius: 12px; padding: 24px 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 12px; transition: all 0.2s; text-align: center; }
.edit-panel.night-mode .edit-dropzone { background: rgba(139,92,246,0.04); }
.edit-panel.night-mode .edit-dropzone:hover,
.edit-panel.night-mode .edit-dropzone.is-dragging { background: rgba(139,92,246,0.1); box-shadow: 0 0 20px rgba(139,92,246,0.15); }
.edit-panel.night-mode .edit-dropzone svg { stroke: #8b5cf6; opacity: 0.7; }
.edit-panel.night-mode .edit-dropzone.is-dragging svg { opacity: 1; }
.edit-panel.day-mode .edit-dropzone { background: rgba(212,175,55,0.04); }
.edit-panel.day-mode .edit-dropzone:hover,
.edit-panel.day-mode .edit-dropzone.is-dragging { background: rgba(212,175,55,0.09); box-shadow: 0 0 18px rgba(212,175,55,0.14); }
.edit-panel.day-mode .edit-dropzone svg { stroke: #D4AF37; opacity: 0.7; }
.edit-panel.day-mode .edit-dropzone.is-dragging svg { opacity: 1; }

.edit-dropzone-text { display: flex; flex-direction: column; gap: 4px; }
.edit-dropzone-main { font-size: 13px; font-weight: 500; }
.edit-panel.night-mode .edit-dropzone-main { color: #cbd5e1; }
.edit-panel.day-mode   .edit-dropzone-main { color: #3c2a1e; }
.edit-dropzone-link { font-weight: 700; text-decoration: underline; }
.edit-panel.night-mode .edit-dropzone-link { color: #a78bfa; }
.edit-panel.day-mode   .edit-dropzone-link { color: #A0522D; }
.edit-dropzone-sub { font-size: 10.5px; font-family: 'DM Mono', monospace; }
.edit-panel.night-mode .edit-dropzone-sub { color: #64748b; }
.edit-panel.day-mode   .edit-dropzone-sub { color: #A0522D; opacity: 0.7; }
.edit-file-hidden { display: none; }

/* ── UPLOAD PROGRESS ── */
.edit-upload-progress { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 9px; }
.edit-panel.night-mode .edit-upload-progress { background: rgba(139,92,246,0.07)}
.edit-panel.day-mode   .edit-upload-progress { background: rgba(212,175,55,0.06) }
.edit-upload-info { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.edit-upload-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.edit-panel.night-mode .edit-upload-name { color: #cbd5e1; }
.edit-panel.day-mode   .edit-upload-name { color: #2c1e10; }
.edit-upload-bar-wrap { display: flex; align-items: center; gap: 8px; }
.edit-upload-bar { flex: 1; height: 4px; border-radius: 2px; overflow: hidden; }
.edit-panel.night-mode .edit-upload-bar { background: rgba(139,92,246,0.15); }
.edit-panel.day-mode   .edit-upload-bar { background: rgba(212,175,55,0.15); }
.edit-upload-fill { height: 100%; border-radius: 2px; transition: width 0.2s ease; }
.edit-panel.night-mode .edit-upload-fill { background: linear-gradient(90deg, #8b5cf6, #a855f7); }
.edit-panel.night-mode .edit-upload-fill--done { background: linear-gradient(90deg, #4ade80, #22c55e); }
.edit-panel.night-mode .edit-upload-fill--error { background: linear-gradient(90deg, #f87171, #ef4444); }
.edit-panel.day-mode   .edit-upload-fill { background: linear-gradient(90deg, #D4AF37, #C09040); }
.edit-panel.day-mode   .edit-upload-fill--done { background: linear-gradient(90deg, #22c55e, #16a34a); }
.edit-panel.day-mode   .edit-upload-fill--error { background: linear-gradient(90deg, #ef4444, #dc2626); }
.edit-upload-pct { font-size: 10px; font-family: 'DM Mono', monospace; white-space: nowrap; flex-shrink: 0; }
.edit-panel.night-mode .edit-upload-pct { color: #94a3b8; }
.edit-panel.day-mode   .edit-upload-pct { color: #A0522D; }

/* ── ADD URL BUTTON ── */
.edit-add-img-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: 1px dashed; align-self: flex-start; transition: all 0.15s; }
.edit-panel.night-mode .edit-add-img-btn {color: #a78bfa; background: transparent; }
.edit-panel.night-mode .edit-add-img-btn:hover { background: rgba(139,92,246,0.1)}
.edit-panel.day-mode   .edit-add-img-btn {color: #8B6914; background: transparent; }
.edit-panel.day-mode   .edit-add-img-btn:hover { background: rgba(212,175,55,0.1)}

/* ── DESTINATION LOCATION MAP ── */
/* Embedded Leaflet map for the destination edit modal. Same look-and-feel
   as BusinessOnboarding's zone-map but simpler — no rings, no slot logic. */
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

@keyframes dest-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.22 }
  50%      { transform: translate(-50%, -50%) scale(1.7); opacity: 0    }
}

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

/* ── MOBILE ── */
@media (max-width: 768px) {
  .edit-panel { width: 100vw; }
  .edit-grid-2 { grid-template-columns: 1fr; }
  .edit-field--full { grid-column: unset; }
  .edit-body { padding: 16px 16px 80px; }
  .edit-header { padding: 14px 16px 12px; }
  .edit-save-btn span { display: none; }
  .dest-map { height: 240px; }
}
/* ─ Very small phones: ≤ 420px ─ */
@media (max-width: 420px) {
  /* Keep 2-column KPI layout — single column makes the page feel sparse
     and forces excessive scrolling. */
  .kpi-grid, .kpi-grid--3, .kpi-grid--4, .kpi-grid--5 { grid-template-columns: 1fr 1fr; gap: 8px; }
  .kpi-value { font-size: 22px; }
  .kpi-card { padding: 12px 13px; }
  .kpi-sub { font-size: 10px; }
  .nav-item { min-width: 48px; padding: 10px 4px 8px; }
  .nav-label { font-size: 8px; }
  .topbar { padding: 12px 14px 10px; }
  .topbar-title h1 { font-size: 16px; }
  .content-area { padding: 10px 12px 18px; }
  .loc-row { grid-template-columns: 80px 1fr 28px 28px; gap: 5px; }
  .loc-pct { display: none; }
  /* Pref tiles: tighter on very small phones; shrink donut, shrink bar columns */
  .pref-tile { padding: 11px 12px; }
  .pref-donut-wrap { width: 86px; height: 86px; }
  .pref-tile-body--donut { gap: 10px; }
  .pref-donut-top-val { font-size: 10px; }
  .pref-donut-top-pct { font-size: 12px; }
  .pref-bar-row { grid-template-columns: 76px 1fr 30px; gap: 6px; }
  .pref-two-bar-row { grid-template-columns: 76px 1fr 30px; gap: 6px; }
  .pref-bar-pct { display: none; }
  .pref-completion-num { font-size: 16px; }
}
/* ── GLOBAL PAGE SCROLLBAR (theme-aware) ── */
.admin-shell {scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.35) transparent}
.admin-shell::-webkit-scrollbar,
html::-webkit-scrollbar,
body::-webkit-scrollbar {width: 8px; height: 8px}
.admin-shell::-webkit-scrollbar-track,
html::-webkit-scrollbar-track,
body::-webkit-scrollbar-track {background: transparent}
.admin-shell::-webkit-scrollbar-thumb,
html::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {border-radius: 8px; border: 2px solid transparent; background-clip: padding-box}
/* Night mode — purple, matches sidebar accents */
.admin-shell.night-mode { scrollbar-color: rgba(139,92,246,0.40) transparent; }
.admin-shell.night-mode::-webkit-scrollbar-thumb,
html:has(.admin-shell.night-mode)::-webkit-scrollbar-thumb,
body:has(.admin-shell.night-mode)::-webkit-scrollbar-thumb {background-color: rgba(139,92,246,0.35)}
.admin-shell.night-mode::-webkit-scrollbar-thumb:hover,
html:has(.admin-shell.night-mode)::-webkit-scrollbar-thumb:hover,
body:has(.admin-shell.night-mode)::-webkit-scrollbar-thumb:hover {background-color: rgba(168,85,247,0.55)}
/* Day mode — gold, matches cream background */
.admin-shell.day-mode { scrollbar-color: rgba(212,175,55,0.45) transparent; }
.admin-shell.day-mode::-webkit-scrollbar-thumb,
html:has(.admin-shell.day-mode)::-webkit-scrollbar-thumb,
body:has(.admin-shell.day-mode)::-webkit-scrollbar-thumb {background-color: rgba(212,175,55,0.40)}
.admin-shell.day-mode::-webkit-scrollbar-thumb:hover,
html:has(.admin-shell.day-mode)::-webkit-scrollbar-thumb:hover,
body:has(.admin-shell.day-mode)::-webkit-scrollbar-thumb:hover {background-color: rgba(160,82,45,0.55)}

/* ── AI Provider toggle card ─────────────────────────────────────────────── */
.provider-card { margin-bottom: 20px; }
.provider-body { padding: 16px 20px 20px; }
.provider-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 12px 0; flex-wrap: wrap; }
.provider-label { font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
.provider-label span { font-size: 12px; opacity: 0.55; font-weight: 400; }
.provider-check { cursor: pointer; }
.provider-check input { width: 16px; height: 16px; cursor: pointer; }
.provider-warn { color: #c0392b; font-size: 12px; font-weight: 500; }
.provider-select, .provider-num {
  font: inherit; font-size: 14px; padding: 7px 10px; border-radius: 8px;
  border: 1px solid rgba(139,92,246,0.35); background: transparent; color: inherit;
  min-width: 180px; cursor: pointer;
}
.provider-num { min-width: 90px; }
.provider-select:focus, .provider-num:focus { outline: none; border-color: #a78bfa; }
/* Web-search per-action picker */
.provider-row--actions { align-items: flex-start; }
.provider-hint { font-size: 12px; font-weight: 400; opacity: 0.6; margin-left: 8px; }
.ws-action-grid {
  display: flex; flex-wrap: wrap; gap: 8px;
  max-width: 380px; justify-content: flex-end;
}
.ws-chip {
  font: inherit; font-size: 13px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 999px; cursor: pointer;
  border: 1px solid rgba(139,92,246,0.35);
  background: transparent; color: inherit;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.ws-chip:hover { border-color: #a78bfa; }
.ws-chip-check { font-size: 11px; width: 10px; text-align: center; line-height: 1; }
.ws-chip--on {
  border-color: transparent; color: #fff;
  background: linear-gradient(90deg, #D4AF37, #a78bfa);
}
.admin-shell.day-mode .ws-chip { border-color: rgba(160,82,45,0.30); }
.admin-shell.day-mode .ws-chip:hover { border-color: #a05a2d; }
.admin-shell.day-mode .ws-chip--on { border-color: transparent; }
.provider-divider { height: 1px; background: rgba(139,92,246,0.18); margin: 16px 0; }
.provider-actions { display: flex; align-items: center; gap: 12px; margin-top: 18px; }
.provider-save {
  font: inherit; font-size: 14px; font-weight: 600; padding: 9px 18px; border-radius: 9px;
  border: none; cursor: pointer; color: #fff;
  background: linear-gradient(90deg, #D4AF37, #a78bfa);
}
.provider-save:disabled { opacity: 0.6; cursor: default; }
.provider-saved { color: #27ae60; font-size: 13px; font-weight: 500; }
.admin-shell.day-mode .provider-select,
.admin-shell.day-mode .provider-num { border-color: rgba(160,82,45,0.30); }

/* ── Segmented provider toggle buttons ───────────────────────────────────── */
.prov-seg { display: inline-flex; border: 1px solid rgba(139,92,246,0.25); border-radius: 10px; padding: 3px; gap: 3px; }
.prov-seg-btn {
  font: inherit; font-size: 13px; font-weight: 600; padding: 7px 16px; border: none;
  border-radius: 7px; cursor: pointer; background: transparent; color: inherit; opacity: 0.6;
  transition: opacity 0.15s, color 0.15s; display: inline-flex; align-items: center; gap: 6px;
}
.prov-seg-btn em { font-style: normal; font-weight: 500; font-size: 11px; opacity: 0.7; }
.prov-seg-btn:hover { opacity: 0.9; }
.prov-seg-btn.active { opacity: 1; color: #fff; background: linear-gradient(90deg, #D4AF37, #a78bfa); }
.admin-shell.day-mode .prov-seg { border-color: rgba(160,82,45,0.30); }

/* Hard reset: only the ACTIVE segment may be filled. Higher specificity than a
   bare .prov-seg / .prov-seg-btn rule, so a stray global gradient on the
   control can't make every button look selected. */
.provider-body .prov-seg { background: transparent; }
.provider-body .prov-seg .prov-seg-btn { background: transparent; color: inherit; opacity: 0.6; }
.provider-body .prov-seg .prov-seg-btn.active { background: linear-gradient(90deg, #D4AF37, #a78bfa); color: #fff; opacity: 1; }

/* ── Web-search on/off switch ─────────────────────────────────────────────── */
.prov-switch { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
.prov-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.prov-switch-track {
  width: 46px; height: 26px; border-radius: 999px; box-sizing: border-box;
  background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.30);
  padding: 2px; display: inline-flex; align-items: center;
  transition: background 0.2s, border-color 0.2s;
}
.prov-switch-thumb {
  width: 20px; height: 20px; border-radius: 50%; background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25); transition: transform 0.2s;
}
.prov-switch input:checked + .prov-switch-track {
  background: linear-gradient(90deg, #D4AF37, #a78bfa); border-color: transparent;
}
.prov-switch input:checked + .prov-switch-track .prov-switch-thumb { transform: translateX(20px); }
.prov-switch input:focus-visible + .prov-switch-track { outline: 2px solid #a78bfa; outline-offset: 2px; }
.admin-shell.day-mode .prov-switch-track { background: rgba(160,82,45,0.12); border-color: rgba(160,82,45,0.30); }

/* ── Number stepper (no native spinners) ─────────────────────────────────── */
.prov-stepper { display: inline-flex; align-items: center; gap: 6px; }
.prov-step-btn {
  font: inherit; font-size: 18px; font-weight: 600; line-height: 1; width: 32px; height: 32px;
  border: 1px solid rgba(139,92,246,0.30); border-radius: 8px; background: transparent;
  color: inherit; cursor: pointer; display: grid; place-items: center; transition: all 0.15s;
}
.prov-step-btn:hover:not(:disabled) { border-color: #a78bfa; }
.prov-step-btn:disabled { opacity: 0.35; cursor: default; }
.provider-num { width: 56px; text-align: center; }
/* Remove the up/down spinner arrows */
.provider-num::-webkit-outer-spin-button,
.provider-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.provider-num { -moz-appearance: textfield; appearance: textfield; }
.admin-shell.day-mode .prov-step-btn { border-color: rgba(160,82,45,0.30); }

/* ── Provider breakdown card ─────────────────────────────────────────────── */
.provider-stats-card { margin-bottom: 20px; }
.prov-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 20px 4px; }
.prov-col { border: 1px solid rgba(139,92,246,0.18); border-radius: 12px; padding: 16px; }
.prov-col--claude { border-color: rgba(212,175,55,0.35); }
.prov-name { font-size: 13px; font-weight: 600; opacity: 0.7; text-transform: uppercase; letter-spacing: .04em; }
.prov-cost { font-size: 30px; font-weight: 700; margin: 6px 0 14px; }
.prov-metric { display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding: 6px 0; border-top: 1px solid rgba(139,92,246,0.10); }
.prov-metric span { opacity: 0.65; }
.prov-metric em { font-style: normal; opacity: 0.6; font-size: 12px; }
.prov-note { font-size: 12px; opacity: 0.6; padding: 8px 20px 18px; line-height: 1.5; }
@media (max-width: 640px) { .prov-compare { grid-template-columns: 1fr; } }
</style>