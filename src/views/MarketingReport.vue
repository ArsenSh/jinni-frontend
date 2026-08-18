<template>
  <div class="mr-page" :class="{ 'mr-dark': isDark }">
    <header class="mr-head">
      <div class="mr-head-top">
        <div>
          <div class="mr-brand">Jinni</div>
          <h1>Growth &amp; Retention</h1>
        </div>
        <button v-if="authedMode && report" class="mr-signout" @click="signOut">Sign out</button>
      </div>
      <p v-if="report" class="mr-sub">
        Live report · updated {{ fmtTime(report.generatedAt) }} · last {{ report.windowDays }} days ·
        aggregate numbers only, no personal data
      </p>
    </header>

    <!-- Country / city filters — scope every number below; default = worldwide -->
    <div class="mr-filters" v-if="report">
      <select class="mr-select" v-model="selCountry" @change="selCity = ''; load(true)">
        <option value="">All countries</option>
        <option v-for="c in report.filterOptions.countries" :key="c" :value="c">{{ c }}</option>
      </select>
      <select class="mr-select" v-model="selCity" :disabled="!selCountry" @change="load(true)">
        <option value="">All cities</option>
        <option v-for="c in report.filterOptions.cities" :key="c" :value="c">{{ c }}</option>
      </select>
      <span v-if="selCountry" class="mr-filter-note">
        Scoped to users from {{ selCity ? selCity + ', ' : '' }}{{ selCountry }}
      </span>
    </div>

    <div v-if="loading" class="mr-note">Loading report…</div>
    <div v-else-if="error" class="mr-note mr-error">{{ error }}</div>

    <main v-else-if="report" :class="{ 'mr-refreshing': refreshing }">
      <!-- Hero: the comeback question -->
      <section class="mr-hero-row">
        <div class="mr-hero">
          <div class="mr-hero-num">{{ pct(report.returnRates.comeback.pct) }}</div>
          <div class="mr-hero-label">of users come back after their first day</div>
          <div class="mr-hero-foot">{{ report.returnRates.comeback.returned }} of {{ report.returnRates.comeback.eligible }} users (first seen ≥ 7 days ago)</div>
        </div>
        <div class="mr-tiles">
          <div class="mr-tile"><span class="t-label">Total users</span><span class="t-value">{{ report.totals.totalUsers }}</span></div>
          <div class="mr-tile"><span class="t-label">Active this month</span><span class="t-value">{{ report.totals.mau }}</span></div>
          <div class="mr-tile"><span class="t-label">Active this week</span><span class="t-value">{{ report.totals.wau }}</span></div>
          <div class="mr-tile"><span class="t-label">Active today</span><span class="t-value">{{ report.totals.dau }}</span></div>
          <div class="mr-tile"><span class="t-label">New users, 7 days</span><span class="t-value">{{ report.totals.newUsers7 }}</span></div>
          <div class="mr-tile"><span class="t-label">New users, 30 days</span><span class="t-value">{{ report.totals.newUsers30 }}</span></div>
        </div>
      </section>

      <!-- Return-rate tiles -->
      <section class="mr-card">
        <h2>Return rates</h2>
        <p class="mr-desc">Of everyone old enough to judge: did they use Jinni again within N days of their first visit?</p>
        <div class="mr-tiles mr-tiles-3">
          <div class="mr-tile" v-for="(r, k) in rateTiles" :key="k">
            <span class="t-label">{{ r.label }}</span>
            <span class="t-value">{{ pct(r.data.pct) }}</span>
            <span class="t-foot">{{ r.data.returned }}/{{ r.data.eligible }} users</span>
          </div>
        </div>
      </section>

      <!-- Daily active: new vs returning -->
      <section class="mr-card">
        <h2>Daily active users — new vs returning</h2>
        <div class="mr-legend">
          <span class="lg"><i class="sw sw-ret"></i>Returning</span>
          <span class="lg"><i class="sw sw-new"></i>New</span>
        </div>
        <div class="mr-chart-wrap" v-if="maxDaily > 0">
          <div class="mr-grid">
            <div v-for="t in yTicks" :key="t" class="grid-line" :style="{ bottom: (t / maxDaily * 100) + '%' }">
              <span class="grid-tick">{{ t }}</span>
            </div>
          </div>
          <div class="mr-bars" @pointerleave="tip.show = false">
            <div v-for="d in report.daily" :key="d.day" class="bar-band" tabindex="0"
                 :aria-label="barAria(d)"
                 @pointermove="showTip($event, d)" @focus="showTipFocus($event, d)" @blur="tip.show = false">
              <div class="bar-col">
                <!-- DOM order = visual top→bottom: new rides on top of returning;
                     only the stack's TOP segment gets the rounded data-end. -->
                <div class="seg seg-new topSeg" v-if="d.newUsers"
                     :style="{ height: segH(d.newUsers) }"></div>
                <div class="seg seg-ret" v-if="d.returning"
                     :class="{ topSeg: !d.newUsers }"
                     :style="{ height: segH(d.returning) }"></div>
              </div>
              <div class="bar-x" v-if="showXLabel(d.day)">{{ fmtDay(d.day) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="mr-note">No activity recorded in this window yet.</div>
        <details class="mr-table">
          <summary>View as table</summary>
          <div class="mr-scroll">
            <table>
              <thead><tr><th>Day</th><th>Active</th><th>New</th><th>Returning</th></tr></thead>
              <tbody>
                <tr v-for="d in [...report.daily].reverse()" :key="d.day">
                  <td>{{ d.day }}</td><td>{{ d.active }}</td><td>{{ d.newUsers }}</td><td>{{ d.returning }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <!-- Weekly cohorts -->
      <section class="mr-card">
        <h2>Weekly cohorts — % still active</h2>
        <p class="mr-desc">Each row = the people who tried Jinni for the first time that week. Columns show what share of them was active in the following weeks. This is the after-campaign picture: a good ad week shows a big cohort whose later cells stay warm.</p>
        <div class="mr-scroll" v-if="report.cohorts.length">
          <table class="mr-cohorts">
            <thead>
              <tr><th>First week</th><th>Users</th><th v-for="k in maxCohortWeeks" :key="k">W{{ k - 1 }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in report.cohorts" :key="c.week">
                <td class="c-week">{{ fmtDay(c.week) }}</td>
                <td class="c-size">{{ c.size }}</td>
                <td v-for="(w, i) in padWeeks(c.weeks)" :key="i" class="c-cell"
                    :style="w === null ? {} : cellStyle(w)">{{ w === null ? '' : pct(w) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mr-note">Cohorts appear once there is activity history.</div>
      </section>

      <!-- Splits -->
      <section class="mr-split">
        <div class="mr-card">
          <h2>What people ask for ({{ report.windowDays }}d)</h2>
          <div v-for="q in qaRows" :key="q.key" class="hbar-row">
            <span class="hbar-label" :title="q.label">{{ q.label }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(q, qaRows) }"></div></div>
            <span class="hbar-val">{{ q.users }}</span>
          </div>
          <div v-if="!qaRows.length" class="mr-note-sm">No searches in this window yet.</div>
        </div>
        <div class="mr-card">
          <h2>Travel styles</h2>
          <div v-for="s in report.preferences.travelStyles" :key="s.key" class="hbar-row">
            <span class="hbar-label" :title="s.key">{{ s.key }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(s, report.preferences.travelStyles) }"></div></div>
            <span class="hbar-val">{{ s.users }}</span>
          </div>
        </div>
        <div class="mr-card">
          <h2>Top interests</h2>
          <div v-for="s in report.preferences.interests" :key="s.key" class="hbar-row">
            <span class="hbar-label" :title="s.key">{{ s.key }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(s, report.preferences.interests) }"></div></div>
            <span class="hbar-val">{{ s.users }}</span>
          </div>
        </div>
        <div class="mr-card">
          <h2>Users by country</h2>
          <div v-for="c in report.locations.byCountry" :key="c.key" class="hbar-row">
            <span class="hbar-label" :title="c.key">{{ c.key }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(c, report.locations.byCountry) }"></div></div>
            <span class="hbar-val">{{ c.users }}</span>
          </div>
        </div>
        <div class="mr-card">
          <h2>Top user cities</h2>
          <div v-for="c in report.locations.byCity" :key="c.key" class="hbar-row">
            <span class="hbar-label" :title="c.key + (c.country ? ', ' + c.country : '')">{{ c.key }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(c, report.locations.byCity) }"></div></div>
            <span class="hbar-val">{{ c.users }}</span>
          </div>
        </div>
        <div class="mr-card">
          <h2>Destinations by country</h2>
          <p class="mr-desc-sm">Where users say they're planning to travel.</p>
          <div v-for="c in report.locations.destinations.byCountry" :key="c.key" class="hbar-row">
            <span class="hbar-label" :title="c.key">{{ c.key }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(c, report.locations.destinations.byCountry) }"></div></div>
            <span class="hbar-val">{{ c.users }}</span>
          </div>
          <div v-if="!report.locations.destinations.byCountry.length" class="mr-note-sm">No destinations set yet.</div>
        </div>
        <div class="mr-card">
          <h2>Destination cities</h2>
          <div v-for="c in report.locations.destinations.byCity" :key="c.key" class="hbar-row">
            <span class="hbar-label" :title="c.key + (c.country ? ', ' + c.country : '')">{{ c.key }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(c, report.locations.destinations.byCity) }"></div></div>
            <span class="hbar-val">{{ c.users }}</span>
          </div>
          <div v-if="!report.locations.destinations.byCity.length" class="mr-note-sm">No destination cities set yet.</div>
        </div>
        <div class="mr-card">
          <h2>Users by language</h2>
          <div v-for="l in report.languages" :key="l.key" class="hbar-row">
            <span class="hbar-label">{{ l.key || 'unknown' }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: rowW(l, report.languages) }"></div></div>
            <span class="hbar-val">{{ l.users }}</span>
          </div>
        </div>
        <div class="mr-card">
          <h2>App surfaces ({{ report.windowDays }}d, requests)</h2>
          <div v-for="s in surfaceRows" :key="s.key" class="hbar-row">
            <span class="hbar-label">{{ s.label }}</span>
            <div class="hbar-track"><div class="hbar-fill" :style="{ width: s.w }"></div></div>
            <span class="hbar-val">{{ s.n }}</span>
          </div>
        </div>
      </section>

      <footer class="mr-foot">
        Jinni · jinni.travel — this report is private to the marketing team; numbers refresh automatically.
      </footer>
    </main>

    <!-- Tooltip -->
    <div v-show="tip.show" class="mr-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
      <div class="tip-day">{{ tip.day }}</div>
      <div class="tip-row"><i class="sw sw-ret"></i><b>{{ tip.ret }}</b>&nbsp;returning</div>
      <div class="tip-row"><i class="sw sw-new"></i><b>{{ tip.new }}</b>&nbsp;new</div>
      <div class="tip-row tip-total"><b>{{ tip.total }}</b>&nbsp;total active</div>
    </div>
  </div>
</template>

<script>
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* Sequential blue ramp (reference palette). In light mode magnitude runs
 * light→dark (near-zero recedes toward the light surface); in dark mode it
 * runs dark→light (near-zero recedes toward the dark surface). */
const SEQ_LIGHT = ['#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab'];
const SEQ_DARK = ['#0d366b', '#104281', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#86b6ef', '#b7d3f6'];

export default {
  name: 'MarketingReport',
  data() {
    return {
      loading: true,
      refreshing: false,
      error: '',
      report: null,
      isDark: false,
      selCountry: '',
      selCity: '',
      tip: { show: false, x: 0, y: 0, day: '', new: 0, ret: 0, total: 0 },
      _themeObserver: null,
      _mq: null
    };
  },
  computed: {
    authedMode() { return !this.$route.params.token; },
    rateTiles() {
      const rr = this.report.returnRates;
      return [
        { label: 'Back within 1 day', data: rr.d1 },
        { label: 'Back within 7 days', data: rr.d7 },
        { label: 'Back within 30 days', data: rr.d30 }
      ];
    },
    maxDaily() {
      return Math.max(0, ...this.report.daily.map(d => d.active));
    },
    yTicks() {
      const m = this.maxDaily;
      if (m <= 0) return [];
      const step = m <= 5 ? 1 : m <= 10 ? 2 : m <= 25 ? 5 : m <= 50 ? 10 : Math.ceil(m / 5 / 10) * 10;
      const ticks = [];
      for (let t = step; t <= m; t += step) ticks.push(t);
      return ticks;
    },
    maxCohortWeeks() {
      return Math.max(1, ...this.report.cohorts.map(c => c.weeks.length));
    },
    qaRows() {
      return (this.report.quickActions || []).map(q => ({ key: q.key, label: q.label, users: q.n }));
    },
    surfaceRows() {
      const labels = { chat: 'Chat', quickAction: 'Quick actions', explore: 'Explore', itinerary: 'Itineraries', saves: 'Saved places', other: 'Other' };
      const s = this.report.surfaces || {};
      const rows = Object.keys(labels).map(k => ({ key: k, label: labels[k], n: s[k] || 0 }));
      const max = Math.max(1, ...rows.map(r => r.n));
      rows.forEach(r => { r.w = Math.round(100 * r.n / max) + '%'; });
      return rows.filter(r => r.n > 0);
    }
  },
  async mounted() {
    this.syncTheme();
    /* Follow the app's day/night toggle (html[data-theme]) and, for the
     * external token link where no app theme exists, the OS preference. */
    this._themeObserver = new MutationObserver(() => this.syncTheme());
    this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this._mq = window.matchMedia('(prefers-color-scheme: dark)');
    this._mqHandler = () => this.syncTheme();
    this._mq.addEventListener('change', this._mqHandler);

    await this.load();
  },
  beforeUnmount() {
    if (this._themeObserver) this._themeObserver.disconnect();
    if (this._mq && this._mqHandler) this._mq.removeEventListener('change', this._mqHandler);
  },
  methods: {
    /* isRefetch=true = a filter change: keep the current render dimmed
     * instead of flashing back to the loading state. */
    async load(isRefetch = false) {
      if (isRefetch) this.refreshing = true; else this.loading = true;
      try {
        const qs = new URLSearchParams();
        if (this.selCountry) qs.set('country', this.selCountry);
        if (this.selCity) qs.set('city', this.selCity);
        const suffix = qs.toString() ? `?${qs.toString()}` : '';
        let res;
        if (this.authedMode) {
          const jwt = localStorage.getItem('authToken') || localStorage.getItem('token');
          res = await fetch(`${API_BASE_URL}/api/analytics/marketing-report${suffix}`, { headers: { Authorization: `Bearer ${jwt}` } });
          if (res.status === 401 || res.status === 403) { this.error = 'Your account does not have access to this report.'; return; }
        } else {
          res = await fetch(`${API_BASE_URL}/api/analytics/marketing-report/${encodeURIComponent(this.$route.params.token)}${suffix}`);
          if (res.status === 403 || res.status === 404) { this.error = 'This report link is not valid (it may have been rotated). Ask the Jinni team for a fresh link.'; return; }
        }
        if (!res.ok) { this.error = 'Could not load the report right now — please try again in a minute.'; return; }
        const body = await res.json();
        this.report = body.data;
        this.error = '';
      } catch {
        this.error = 'Could not load the report right now — please try again in a minute.';
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    syncTheme() {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'dark') this.isDark = true;
      else if (attr === 'light') this.isDark = false;
      else this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    signOut() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.$router.push({ name: 'Auth' });
    },
    pct(v) { return v === null || v === undefined ? '—' : v + '%'; },
    fmtDay(d) {
      const dt = new Date(d + 'T00:00:00Z');
      return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    },
    fmtTime(iso) {
      return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    },
    segH(v) { return (v / this.maxDaily * 100) + '%'; },
    showXLabel(day) {
      const i = this.report.daily.findIndex(d => d.day === day);
      const n = this.report.daily.length;
      const every = n > 20 ? 5 : n > 10 ? 3 : 1;
      return i % every === 0 || i === n - 1;
    },
    barAria(d) { return `${this.fmtDay(d.day)}: ${d.active} active users, ${d.newUsers} new, ${d.returning} returning`; },
    placeTip(x, y, d) {
      this.tip = { show: true, x: Math.min(x + 14, window.innerWidth - 190), y: y + 14, day: this.fmtDay(d.day), new: d.newUsers, ret: d.returning, total: d.active };
    },
    showTip(e, d) { this.placeTip(e.clientX, e.clientY, d); },
    showTipFocus(e, d) {
      const r = e.target.getBoundingClientRect();
      this.placeTip(r.left + r.width / 2, r.top, d);
    },
    padWeeks(weeks) {
      const out = [...weeks];
      while (out.length < this.maxCohortWeeks) out.push(null);
      return out;
    },
    cellStyle(v) {
      if (v <= 0) return { background: 'transparent', color: 'var(--mr-muted)' };
      const stops = this.isDark ? SEQ_DARK : SEQ_LIGHT;
      const idx = Math.min(stops.length - 1, Math.floor(v / 100 * stops.length));
      /* Label ink flips by fill luminance: light fills take dark ink, dark
       * fills take white — always legible regardless of theme. */
      const lightFill = this.isDark ? idx >= 7 : idx <= 4;
      return { background: stops[idx], color: lightFill ? '#0b0b0b' : '#ffffff' };
    },
    rowW(row, rows) {
      const max = Math.max(1, ...rows.map(r => r.users));
      return Math.round(100 * row.users / max) + '%';
    }
  }
};
</script>

<style scoped>
/* Theme tokens — DAY defaults match the app's day background (#f9f5eb,
 * genie-theme.css); the dark blocks swap to the app's night background
 * (#0a0118). Chart series use the reference palette's per-mode steps. */
.mr-page {
  --mr-page: #f9f5eb;
  --mr-card: #fffdf6;
  --mr-border: rgba(26, 26, 26, 0.10);
  --mr-ink: #1a1a1a;
  --mr-ink2: #52514e;
  --mr-muted: #898781;
  --mr-grid: #e5e0d0;
  --mr-ret: #2a78d6;
  --mr-new: #eb6834;
  --mr-tip-bg: #ffffff;
  --mr-tip-border: rgba(26, 26, 26, 0.14);
  --mr-brand: #a67c00;

  min-height: 100vh;
  background: var(--mr-page);
  color: var(--mr-ink);
  font-family: 'Segoe UI', system-ui, -apple-system, Tahoma, sans-serif;
  padding: 24px 16px 48px;
}
/* Dark tokens ride on the reactive .mr-dark class — the component watches
 * html[data-theme] (the app's day/night toggle) and, for the external token
 * link, the OS color-scheme preference, so this single class covers both. */
.mr-page.mr-dark {
  --mr-page: #0a0118;
  --mr-card: rgba(255, 255, 255, 0.05);
  --mr-border: rgba(255, 255, 255, 0.10);
  --mr-ink: #ffffff;
  --mr-ink2: #c3c2b7;
  --mr-muted: #898781;
  --mr-grid: rgba(255, 255, 255, 0.09);
  --mr-ret: #3987e5;
  --mr-new: #d95926;
  --mr-tip-bg: #241b38;
  --mr-tip-border: rgba(255, 255, 255, 0.14);
  --mr-brand: #d4af37;
}

.mr-head { max-width: 1060px; margin: 0 auto 20px; }
.mr-head-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.mr-brand { color: var(--mr-brand); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; font-size: 13px; }
.mr-head h1 { margin: 4px 0 6px; font-size: 26px; font-weight: 650; }
.mr-sub { color: var(--mr-muted); font-size: 13px; margin: 0; }
.mr-signout {
  background: transparent; color: var(--mr-ink2); border: 1px solid var(--mr-border);
  border-radius: 8px; padding: 7px 14px; font-size: 13px; cursor: pointer;
}
.mr-signout:hover { background: var(--mr-card); }
main { max-width: 1060px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
main.mr-refreshing { opacity: 0.55; pointer-events: none; transition: opacity 0.2s; }

/* Filter row — one row above the content it scopes */
.mr-filters { max-width: 1060px; margin: 0 auto 16px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.mr-select {
  background: var(--mr-card); color: var(--mr-ink); border: 1px solid var(--mr-border);
  border-radius: 8px; padding: 8px 12px; font-size: 13.5px; font-family: inherit;
  min-width: 160px; cursor: pointer;
}
.mr-select:disabled { opacity: 0.45; cursor: default; }
.mr-filter-note { color: var(--mr-muted); font-size: 12.5px; }

.mr-note { max-width: 1060px; margin: 24px auto; color: var(--mr-ink2); }
.mr-note-sm { color: var(--mr-muted); font-size: 13px; }
.mr-error { color: #d03b3b; }

.mr-hero-row { display: flex; gap: 16px; flex-wrap: wrap; }
.mr-hero {
  background: var(--mr-card); border: 1px solid var(--mr-border); border-radius: 14px;
  padding: 22px 26px; flex: 1 1 260px; display: flex; flex-direction: column; justify-content: center;
}
.mr-hero-num { font-size: 52px; font-weight: 650; line-height: 1; }
.mr-hero-label { color: var(--mr-ink2); margin-top: 8px; font-size: 15px; }
.mr-hero-foot { color: var(--mr-muted); margin-top: 6px; font-size: 12.5px; }

.mr-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 2 1 420px; }
.mr-tiles-3 { grid-template-columns: repeat(3, 1fr); }
.mr-tile {
  background: var(--mr-card); border: 1px solid var(--mr-border); border-radius: 12px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 4px;
}
.t-label { color: var(--mr-muted); font-size: 12.5px; }
.t-value { font-size: 26px; font-weight: 650; }
.t-foot { color: var(--mr-muted); font-size: 12px; }

.mr-card {
  background: var(--mr-card); border: 1px solid var(--mr-border); border-radius: 14px;
  padding: 18px 20px;
}
.mr-card h2 { margin: 0 0 6px; font-size: 16px; font-weight: 650; }
.mr-desc { color: var(--mr-muted); font-size: 13px; margin: 0 0 14px; max-width: 70ch; }
.mr-desc-sm { color: var(--mr-muted); font-size: 12px; margin: 0 0 8px; }

.mr-legend { display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px; color: var(--mr-ink2); }
.lg { display: inline-flex; align-items: center; gap: 6px; }
.sw { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
.sw-ret { background: var(--mr-ret); }
.sw-new { background: var(--mr-new); }

.mr-chart-wrap { position: relative; height: 240px; margin: 8px 0 4px; }
.mr-grid { position: absolute; inset: 0 0 20px 0; }
.grid-line { position: absolute; left: 28px; right: 0; height: 1px; background: var(--mr-grid); }
.grid-tick { position: absolute; left: -28px; top: -7px; width: 22px; text-align: right; font-size: 11px; color: var(--mr-muted); font-variant-numeric: tabular-nums; }
.mr-bars { position: absolute; inset: 0 0 0 32px; display: flex; align-items: flex-end; gap: 2px; }
.bar-band { flex: 1 1 0; height: calc(100% - 20px); display: flex; flex-direction: column; justify-content: flex-end; position: relative; outline: none; min-width: 0; }
.bar-band:focus-visible .seg { filter: brightness(1.25); }
.bar-band:hover .seg { filter: brightness(1.15); }
.bar-col { display: flex; flex-direction: column; justify-content: flex-end; height: 100%; max-width: 24px; width: 100%; margin: 0 auto; gap: 2px; }
.seg { width: 100%; }
.seg-ret { background: var(--mr-ret); }
.seg-new { background: var(--mr-new); }
.topSeg { border-radius: 4px 4px 0 0; }
.bar-x { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 10.5px; color: var(--mr-muted); white-space: nowrap; }

.mr-table summary { color: var(--mr-muted); font-size: 13px; cursor: pointer; margin-top: 22px; }
.mr-scroll { overflow-x: auto; margin-top: 10px; }
table { border-collapse: collapse; font-size: 13px; min-width: 320px; }
th, td { padding: 6px 12px; text-align: right; border-bottom: 1px solid var(--mr-grid); font-variant-numeric: tabular-nums; }
th:first-child, td:first-child { text-align: left; }
th { color: var(--mr-muted); font-weight: 600; }

.mr-cohorts .c-week { white-space: nowrap; color: var(--mr-ink2); }
.mr-cohorts .c-size { color: var(--mr-ink); font-weight: 600; }
.mr-cohorts .c-cell { text-align: center; min-width: 52px; border-radius: 4px; border-bottom: 2px solid var(--mr-card); }
.mr-cohorts th { text-align: center; }
.mr-cohorts th:first-child { text-align: left; }

.mr-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.hbar-row { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
.hbar-label { width: 100px; flex-shrink: 0; font-size: 13px; color: var(--mr-ink2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize; }
.hbar-track { flex: 1; height: 14px; }
.hbar-fill { height: 100%; background: var(--mr-ret); border-radius: 0 4px 4px 0; min-width: 2px; }
.hbar-val { width: 40px; font-size: 13px; font-variant-numeric: tabular-nums; }

.mr-foot { color: var(--mr-muted); font-size: 12px; text-align: center; margin-top: 8px; }

.mr-tip {
  position: fixed; z-index: 50; pointer-events: none;
  background: var(--mr-tip-bg); border: 1px solid var(--mr-tip-border); border-radius: 8px;
  padding: 8px 12px; font-size: 13px; color: var(--mr-ink2); min-width: 150px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}
.tip-day { color: var(--mr-ink); font-weight: 600; margin-bottom: 4px; }
.tip-row { display: flex; align-items: center; gap: 6px; margin: 2px 0; }
.tip-row b { color: var(--mr-ink); }
.tip-total { border-top: 1px solid var(--mr-grid); margin-top: 5px; padding-top: 5px; }

@media (max-width: 640px) {
  .mr-tiles { grid-template-columns: repeat(2, 1fr); }
  .mr-hero-num { font-size: 42px; }
}
</style>
