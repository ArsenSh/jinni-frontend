<template>
  <div class="explore" :class="theme">
    <!-- ═══ Header ═══ -->
    <header class="ex-head">
      <button class="ex-back" @click="goBack" :title="t('explore.back') || 'Back'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="ex-head-main">
        <h1 class="ex-title">{{ t('explore.title') || "Jinni's Eye" }}</h1>
        <p class="ex-sub" v-if="location && (location.city || location.country)">
          {{ [location.city, location.country].filter(Boolean).join(', ') }}
        </p>
      </div>
    </header>

    <!-- ═══ Category nav (sticky) ═══ -->
    <nav v-if="hasAny" class="ex-nav">
      <button v-for="c in orderedCategories" :key="c"
              class="ex-chip" :class="{ active: activeCat === c }"
              @click="scrollToCat(c)">
        {{ catLabel(c) }}
        <span class="ex-chip-count">{{ categories[c].length }}</span>
      </button>
    </nav>

    <!-- ═══ Loading ═══ -->
    <div v-if="loading" class="ex-grid">
      <div v-for="n in 8" :key="'sk'+n" class="ex-card ex-card--sk">
        <span class="ex-card-img shimmer"></span>
        <span class="ex-sk-line shimmer" style="width:72%"></span>
        <span class="ex-sk-line shimmer" style="width:44%"></span>
      </div>
    </div>

    <!-- ═══ Not explored yet ═══ -->
    <div v-else-if="!hasAny" class="ex-empty">
      <div class="ex-empty-icon">✨</div>
      <p class="ex-empty-title">{{ notExploredTitle }}</p>
      <p class="ex-empty-sub">{{ t('explore.empty_sub') || 'Ask Jinni in chat to discover places here — they’ll appear on this page as you explore.' }}</p>
      <button class="ex-cta" @click="goChat">{{ t('explore.ask_chat') || 'Ask Jinni' }}</button>
    </div>

    <!-- ═══ Content ═══ -->
    <template v-else>
      <section v-for="c in orderedCategories" :key="c" :ref="el => catEls[c] = el" class="ex-section">
        <div class="ex-section-head">
          <h2 class="ex-section-title">{{ catLabel(c) }}</h2>
          <span class="ex-section-count">{{ categories[c].length }}</span>
        </div>
        <div class="ex-grid">
          <div v-for="p in categories[c]" :key="c + p.placeId" class="ex-card" @click="openPlace(p)">
            <div class="ex-card-img" :class="{ 'is-empty': !p.image }">
              <img v-if="p.image" :src="imgUrl(p.image)" :alt="p.name" loading="lazy" @error="$event.target.style.display='none'"/>
              <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>
              <span v-if="Number.isFinite(p.rating)" class="ex-card-rating">★ {{ p.rating.toFixed(1) }}</span>
            </div>
            <div class="ex-card-body">
              <div class="ex-card-name">{{ p.name }}</div>
              <div class="ex-card-meta">
                <span v-if="p.region" class="ex-card-region">{{ p.region }}</span>
                <span v-if="Number.isFinite(p.distanceKm)" class="ex-card-dist">{{ p.distanceKm }} {{ t('explore.km') || 'km' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
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
      theme: 'night-mode',
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
      const tpl = this.t('explore.not_explored') || "Jinni hasn’t been to {place} yet";
      return tpl.replace('{place}', where);
    },
  },
  mounted() {
    this.theme = (localStorage.getItem('theme') === 'day' || document.documentElement.classList.contains('day-mode'))
      ? 'day-mode' : 'night-mode';
    this.load();
  },
  methods: {
    t(key, params) { return this.$t ? this.$t(key, params) : null; },
    imgUrl(u) { return u && u.startsWith('/api/') ? `${API_BASE}${u}` : u; },
    catLabel(c) { return (this.$t && this.$t('explore.cat.' + c)) || CAT_LABELS[c] || c; },
    async load() {
      this.loading = true;
      try {
        const res = await fetch(`${API_BASE}/api/ai/explore`, {
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
      }
    },
    scrollToCat(c) {
      this.activeCat = c;
      this.catEls[c]?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
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
  },
};
</script>

<style scoped>
/* ── Glacier tokens — mirror JinniChat/ItineraryView ── */
.explore.day-mode {
  --ex-bg: #fbf7f2; --ex-heading: #8B4513; --ex-text: #3c2a1e; --ex-muted: #5a4a42;
  --ex-glass: rgba(255,255,255,0.6); --ex-glass-2: rgba(255,255,255,0.85);
  --ex-ring: inset 0 0 0 1px rgba(255,255,255,0.7); --ex-line: rgba(160,82,45,0.18);
  --ex-chip: rgba(255,255,255,0.55); --ex-chip-text: rgba(92,74,66,0.9);
  --ex-shadow: 0 8px 24px rgba(120,80,30,0.10); --ex-shimmer: rgba(160,82,45,0.10); --ex-glint: rgba(255,255,255,0.6);
  --ex-accent: #A0522D;
}
.explore.night-mode {
  --ex-bg: #14101f; --ex-heading: #e8c766; --ex-text: #d5dce4; --ex-muted: #94a3b8;
  --ex-glass: rgba(255,255,255,0.06); --ex-glass-2: rgba(255,255,255,0.10);
  --ex-ring: inset 0 0 0 1px rgba(255,255,255,0.08); --ex-line: rgba(255,255,255,0.10);
  --ex-chip: rgba(255,255,255,0.07); --ex-chip-text: #cbd5e1;
  --ex-shadow: 0 8px 26px rgba(0,0,0,0.45); --ex-shimmer: rgba(255,255,255,0.06); --ex-glint: rgba(255,255,255,0.10);
  --ex-accent: #c084fc;
}

.explore { min-height: 100vh; background: var(--ex-bg); color: var(--ex-text); padding: 0 0 40px; }

/* Header */
.ex-head { display: flex; align-items: center; gap: 12px; padding: 18px 18px 10px; max-width: 1200px; margin: 0 auto; }
.ex-back { flex: none; width: 38px; height: 38px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--ex-text); background: var(--ex-glass); box-shadow: var(--ex-ring); backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s; }
.ex-back:hover { background: var(--ex-glass-2); }
.ex-head-main { min-width: 0; }
.ex-title { margin: 0; font-size: 1.55rem; font-weight: 800; letter-spacing: -0.01em;
  color: #D4AF37; background: linear-gradient(45deg, #D4AF37, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.ex-sub { margin: 2px 0 0; font-size: 0.88rem; color: var(--ex-muted); }

/* Sticky category nav */
.ex-nav { position: sticky; top: 0; z-index: 10; display: flex; gap: 8px; overflow-x: auto; padding: 10px 18px; max-width: 1200px; margin: 0 auto;
  scrollbar-width: none; background: color-mix(in srgb, var(--ex-bg) 82%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
.ex-nav::-webkit-scrollbar { display: none; }
.ex-chip { flex: none; display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 999px; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.85rem; font-weight: 600; color: var(--ex-chip-text); background: var(--ex-chip); box-shadow: var(--ex-ring);
  backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%); transition: background .18s, color .18s; white-space: nowrap; }
.ex-chip:hover { background: var(--ex-glass-2); }
.ex-chip.active { color: #fff; background: linear-gradient(135deg, #D4AF37, #FF8C00); box-shadow: 0 4px 14px rgba(212,175,55,0.35); }
.ex-chip-count { font-size: 0.72rem; font-weight: 700; opacity: 0.75; font-variant-numeric: tabular-nums; }
.ex-chip.active .ex-chip-count { opacity: 0.9; }

/* Sections + grid */
.ex-section { max-width: 1200px; margin: 0 auto; padding: 18px 18px 6px; scroll-margin-top: 60px; }
.ex-section-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
.ex-section-title { margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--ex-heading); }
.ex-section-count { font-size: 0.8rem; color: var(--ex-muted); font-variant-numeric: tabular-nums; }
.ex-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; max-width: 1200px; margin: 0 auto; }

/* Card — recommendation-card recipe */
.ex-card { border-radius: 16px; overflow: hidden; cursor: pointer; background: var(--ex-glass); box-shadow: var(--ex-ring), var(--ex-shadow);
  backdrop-filter: blur(18px) saturate(180%); -webkit-backdrop-filter: blur(18px) saturate(180%); transition: transform .18s ease, box-shadow .18s ease; }
.ex-card:hover { transform: translateY(-3px); box-shadow: var(--ex-ring), 0 14px 34px rgba(0,0,0,0.22); }
.ex-card-img { position: relative; aspect-ratio: 4 / 3; display: flex; align-items: center; justify-content: center; overflow: hidden; background: var(--ex-glass-2); color: var(--ex-muted); }
.ex-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ex-card-img.is-empty { opacity: 0.7; }
.ex-card-rating { position: absolute; top: 8px; left: 8px; padding: 3px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; color: #fff;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.ex-card-body { padding: 11px 12px 13px; }
.ex-card-name { font-size: 0.95rem; font-weight: 700; line-height: 1.25; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.ex-card-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 0.78rem; color: var(--ex-muted); }
.ex-card-region { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.ex-card-dist { flex: none; font-variant-numeric: tabular-nums; }

/* Empty / not explored */
.ex-empty { max-width: 520px; margin: 60px auto; padding: 0 24px; text-align: center; }
.ex-empty-icon { font-size: 44px; margin-bottom: 14px; }
.ex-empty-title { font-size: 1.25rem; font-weight: 800; color: var(--ex-heading); margin: 0 0 8px; }
.ex-empty-sub { font-size: 0.95rem; color: var(--ex-muted); line-height: 1.5; margin: 0 0 22px; }
.ex-cta { padding: 11px 24px; border: none; border-radius: 999px; cursor: pointer; font-family: inherit; font-size: 0.95rem; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #D4AF37, #FF8C00); box-shadow: 0 6px 20px rgba(212,175,55,0.35); transition: filter .18s, transform .15s; }
.ex-cta:hover { filter: brightness(1.06); }
.ex-cta:active { transform: scale(0.98); }

/* Skeleton */
.ex-card--sk { padding: 0 0 12px; }
.ex-card--sk .ex-card-img { aspect-ratio: 4 / 3; }
.ex-sk-line { display: block; height: 11px; border-radius: 6px; margin: 10px 12px 0; }
.shimmer { position: relative; overflow: hidden; background: var(--ex-shimmer); }
.shimmer::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, var(--ex-glint), transparent); animation: exShimmer 1.5s infinite; }
@keyframes exShimmer { 100% { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .shimmer::after { animation: none; } .ex-card:hover { transform: none; } }

@media (max-width: 520px) {
  .ex-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 11px; }
  .ex-title { font-size: 1.35rem; }
  .ex-section { padding: 14px 14px 4px; }
  .ex-head, .ex-nav { padding-left: 14px; padding-right: 14px; }
}
</style>
