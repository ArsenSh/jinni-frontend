<template>
  <!-- ──────────────────────────────────────────────────────────────────────
       FlightDeals — "Where to escape this week ✈️" strip on Discoveries.
       Self-contained & deletable: this file + two wiring lines in
       ExploreView + flightdeals.* locale keys. Renders NOTHING until the
       backend says enabled and has deals (fail-dark, like the chat tool).
       Prices are cached fares → the caveat line always shows; every tap is
       an affiliate link (earns commission). Budget wish = client-side filter
       of the same data; tapping a card expands its cheapest dates (one
       extra cached call). Zero LLM involvement.
  ─────────────────────────────────────────────────────────────────────── -->
  <section v-if="deals.length" class="fd" :class="{ 'fd--night': night }">
    <div class="fd-head">
      <h2 class="fd-title">✈️ {{ $t('flightdeals.title') }}</h2>
      <input v-model.trim="budget" class="fd-budget" inputmode="numeric"
             :placeholder="$t('flightdeals.budget_ph')" />
    </div>

    <div class="fd-rail">
      <div v-for="d in filtered" :key="d.destination" class="fd-card" :class="{ 'fd-card--open': expanded === d.destination }">
        <button class="fd-card-main" @click="toggleWeek(d)">
          <span class="fd-city">{{ d.name }}</span>
          <span class="fd-price">{{ $t('flightdeals.from') }} {{ fmtPrice(d.price) }}</span>
          <span class="fd-meta">
            {{ fmtDate(d.departureAt) }}<template v-if="d.airlineName"> · {{ d.airlineName }}</template><template v-if="d.transfers === 0"> · {{ $t('flightdeals.direct') }}</template>
          </span>
        </button>
        <div v-if="expanded === d.destination" class="fd-week">
          <p v-if="weekLoading" class="fd-meta">…</p>
          <template v-else-if="week.length">
            <a v-for="w in week" :key="w.date" class="fd-day" :href="w.bookUrl" target="_blank" rel="noopener">
              <span>{{ fmtDate(w.date) }}<template v-if="w.airlineName"> · {{ w.airlineName }}</template></span><strong>{{ fmtPrice(w.price) }}</strong>
            </a>
          </template>
          <a class="fd-book" :href="d.bookUrl" target="_blank" rel="noopener">{{ $t('flightdeals.book') }} →</a>
        </div>
      </div>
    </div>

    <p class="fd-caveat">{{ $t('flightdeals.caveat') }}</p>
  </section>
</template>

<script>
const API = import.meta.env.VITE_API_URL || '/api';

export default {
  name: 'FlightDeals',
  props: { night: { type: Boolean, default: false } },
  data() {
    return { deals: [], currency: 'AMD', budget: '', expanded: null, week: [], weekLoading: false };
  },
  computed: {
    filtered() {
      const b = parseInt(String(this.budget).replace(/\D/g, ''), 10);
      return Number.isFinite(b) && b > 0 ? this.deals.filter(d => d.price <= b) : this.deals;
    },
    lang() {
      try { return (JSON.parse(localStorage.getItem('jinni_settings') || '{}').language || 'en').slice(0, 2); }
      catch { return 'en'; }
    },
  },
  async mounted() {
    try {
      const r = await fetch(`${API}/flightdeals/deals?origin=EVN&currency=amd&locale=${this.lang}`);
      const d = await r.json();
      if (r.ok && d.enabled && Array.isArray(d.deals)) { this.deals = d.deals; this.currency = d.currency || 'AMD'; }
    } catch (e) { /* strip stays invisible */ }
  },
  methods: {
    fmtPrice(p) {
      try { return `${new Intl.NumberFormat(this.lang).format(p)} ${this.currency}`; }
      catch { return `${p} ${this.currency}`; }
    },
    fmtDate(iso) {
      if (!iso) return '';
      try { return new Date(iso).toLocaleDateString(this.lang, { day: 'numeric', month: 'short' }); }
      catch { return String(iso).slice(0, 10); }
    },
    async toggleWeek(d) {
      if (this.expanded === d.destination) { this.expanded = null; return; }
      this.expanded = d.destination; this.week = []; this.weekLoading = true;
      try {
        const month = (d.departureAt || new Date().toISOString()).slice(0, 7);
        const r = await fetch(`${API}/flightdeals/week?origin=EVN&destination=${d.destination}&month=${month}&currency=amd`);
        const j = await r.json();
        if (r.ok && j.enabled) this.week = j.days || [];
      } catch (e) { /* book link still shown */ }
      this.weekLoading = false;
    },
  },
};
</script>

<style scoped>
.fd { margin: 6px 16px 18px; padding: 14px 14px 10px; border-radius: 16px; border: 1px solid rgba(184,115,51,0.25); background: rgba(255,247,232,0.6); box-shadow: 0 0 16px -2px rgba(184,115,51,0.10); }
.fd--night { border-color: rgba(212,175,55,0.28); background: rgba(17,25,52,0.5); box-shadow: 0 0 18px -2px rgba(212,175,55,0.12); }
.fd-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.fd-title { margin: 0; font-size: 1.05rem; font-weight: 600; }
.fd--night .fd-title { color: #f3dfae; }
.fd-budget { width: 130px; border-radius: 999px; border: 1px solid rgba(128,96,60,0.35); background: rgba(255,255,255,0.55); padding: 6px 12px; font-size: 0.82rem; font-family: inherit; color: inherit; }
.fd--night .fd-budget { background: rgba(165,192,255,0.08); border-color: rgba(165,192,255,0.25); color: #e8ecf8; }
.fd-rail { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
.fd-rail::-webkit-scrollbar { display: none; }
.fd-card { flex: 0 0 auto; min-width: 150px; border-radius: 12px; border: 1px solid rgba(184,115,51,0.22); background: rgba(255,255,255,0.55); }
.fd--night .fd-card { border-color: rgba(165,192,255,0.16); background: rgba(24,34,68,0.55); }
.fd-card--open { border-color: rgba(184,115,51,0.5); }
.fd--night .fd-card--open { border-color: rgba(212,175,55,0.5); }
.fd-card-main { display: flex; flex-direction: column; gap: 2px; align-items: flex-start; width: 100%; padding: 10px 12px; background: none; border: none; cursor: pointer; font-family: inherit; color: inherit; text-align: left; }
.fd-city { font-weight: 600; font-size: 0.95rem; }
.fd-price { font-size: 0.9rem; color: #8b5e1a; }
.fd--night .fd-price { color: #f3dfae; }
.fd-meta { font-size: 0.75rem; opacity: 0.65; }
.fd-week { display: flex; flex-direction: column; gap: 4px; padding: 0 10px 10px; }
.fd-day { display: flex; justify-content: space-between; gap: 12px; font-size: 0.8rem; text-decoration: none; color: inherit; padding: 4px 6px; border-radius: 8px; }
.fd-day:hover { background: rgba(184,115,51,0.10); }
.fd--night .fd-day:hover { background: rgba(165,192,255,0.10); }
.fd-book { display: block; text-align: center; margin-top: 4px; padding: 7px; border-radius: 10px; font-size: 0.82rem; text-decoration: none; color: inherit; border: 1px solid rgba(184,115,51,0.35); }
.fd--night .fd-book { border-color: rgba(212,175,55,0.4); color: #f3dfae; }
.fd-caveat { margin: 8px 2px 0; font-size: 0.7rem; opacity: 0.55; }
</style>
