<template>
  <!-- ──────────────────────────────────────────────────────────────────────
       ShotSpotsView — "Jinni Shot Spots" traveler page (Stage 1).
       Curated photographs with recorded ground truth; "Get This Shot" walks
       the traveler to the CAMERA point (not the subject's address), via the
       access point when one exists. GPS is promised, compass only assists —
       every guidance string degrades honestly when a sensor is absent.
       Self-contained: this file + its router entry are the whole surface.
  ─────────────────────────────────────────────────────────────────────── -->
  <div class="shots">
    <header class="sh-head">
      <button class="sh-back" @click="$router.back()" aria-label="Back">←</button>
      <div>
        <h1>{{ $t('shotspots.title') }}</h1>
        <p class="sh-sub">{{ $t('shotspots.subtitle') }}</p>
      </div>
    </header>

    <div v-if="cities.length > 1" class="sh-cities">
      <button :class="['sh-chip', { 'sh-chip--on': !cityFilter }]" @click="cityFilter = ''">{{ $t('shotspots.all_cities') }}</button>
      <button v-for="c in cities" :key="c" :class="['sh-chip', { 'sh-chip--on': cityFilter === c }]" @click="cityFilter = c">{{ c }}</button>
    </div>

    <p v-if="loading" class="sh-muted">{{ $t('shotspots.loading') }}</p>
    <div v-else-if="!filtered.length" class="sh-empty">
      <span class="sh-empty-spark">✨</span>
      <p>{{ $t('shotspots.empty') }}</p>
    </div>

    <div class="sh-grid">
      <button v-for="s in filtered" :key="s.id" class="sh-card" @click="openSpot(s)">
        <div class="sh-imgwrap"><img :src="apiBase + s.photo.url" :alt="s.title" loading="lazy" /></div>
        <div class="sh-card-body">
          <strong>{{ s.title }}</strong>
          <span class="sh-muted">{{ s.access && s.access.nearestPlace ? s.access.nearestPlace : s.city }}</span>
          <span class="sh-time">✦ {{ $t('shotspots.best.' + ((s.shooting && s.shooting.bestTime) || 'any')) }}</span>
        </div>
      </button>
    </div>

    <!-- ── DETAIL ───────────────────────────────────────────────────────── -->
    <div v-if="spot" class="sh-detail" @click.self="closeSpot">
      <div class="sh-sheet">
        <button class="sh-close" @click="closeSpot" aria-label="Close">✕</button>

        <template v-if="!guiding">
          <img :src="apiBase + spot.photo.url" :alt="spot.title" class="sh-hero" />
          <h2>{{ spot.title }}</h2>
          <p class="sh-muted sh-cred">{{ $t(spot.photo.source === 'traveler' ? 'shotspots.photo_traveler' : 'shotspots.photo_staff') }}</p>
          <p v-if="spot.recreationCount" class="sh-count">📸 {{ $t('shotspots.got_count', { n: spot.recreationCount }) }}</p>
          <div class="sh-facts">
            <p v-if="spot.access && spot.access.nearestPlace"><span>{{ $t('shotspots.nearest') }}</span>{{ spot.access.nearestPlace }}<template v-if="spot.access.walkMinutes != null"> · {{ $t('shotspots.walk_min', { n: spot.access.walkMinutes }) }}</template></p>
            <p><span>{{ $t('shotspots.best_time') }}</span>{{ $t('shotspots.best.' + ((spot.shooting && spot.shooting.bestTime) || 'any')) }}<template v-if="spot.shooting && spot.shooting.season"> · {{ spot.shooting.season }}</template></p>
            <p v-if="spot.access && spot.access.instructions"><span>{{ $t('shotspots.how_to_get') }}</span>{{ spot.access.instructions }}</p>
            <p v-if="spot.shooting && spot.shooting.notes"><span>{{ $t('shotspots.notes') }}</span>{{ spot.shooting.notes }}</p>
          </div>
          <div class="sh-actions">
            <a class="sh-btn" :href="mapsLink(spot)" target="_blank" rel="noopener">{{ $t('shotspots.open_maps') }}</a>
            <button class="sh-btn sh-btn--gold" @click="startGuide">📸 {{ $t('shotspots.get_shot') }}</button>
          </div>
        </template>

        <!-- ── GUIDE ("Get This Shot") ─────────────────────────────────── -->
        <template v-else>
          <img :src="apiBase + spot.photo.url" :alt="spot.title" class="sh-guide-thumb" />
          <p class="sh-phase">{{ arrived ? $t('shotspots.at_spot') : (phase === 'access' ? $t('shotspots.to_access') : $t('shotspots.to_spot')) }}</p>

          <div v-if="!arrived" class="sh-compassbox">
            <div v-if="deviceHeading != null" class="sh-arrow" :style="{ transform: `rotate(${arrowDeg}deg)` }">➤</div>
            <p class="sh-dist">{{ distanceLabel }}</p>
            <p v-if="deviceHeading == null" class="sh-muted">{{ $t('shotspots.head_dir', { dir: $t('shotspots.dir_' + cardinal) }) }}</p>
          </div>

          <div v-else class="sh-compassbox">
            <template v-if="spot.camera.heading != null">
              <div v-if="deviceHeading != null" class="sh-arrow sh-arrow--gold" :style="{ transform: `rotate(${faceDeg}deg)` }">➤</div>
              <p class="sh-muted">{{ deviceHeading != null ? $t('shotspots.face_arrow') : $t('shotspots.face_dir', { dir: $t('shotspots.dir_' + cameraCardinal) }) }}</p>
            </template>
            <p class="sh-frame">
              {{ spot.camera.orientation === 'landscape' ? $t('shotspots.hold_landscape') : $t('shotspots.hold_portrait') }}<template v-if="pitchHint"> · {{ pitchHint }}</template>
            </p>
            <button class="sh-btn sh-btn--gold sh-got" @click="startRecreate">📸 {{ $t('shotspots.got_shot_btn') }}</button>
          </div>

          <p v-if="gpsWeak" class="sh-honest">{{ $t('shotspots.gps_weak', { m: gpsWeak }) }}</p>
          <button v-if="compassAsk" class="sh-btn sh-btn--gold" @click="enableCompass">{{ $t('shotspots.enable_compass') }}</button>
          <div class="sh-actions">
            <a class="sh-btn" :href="mapsLink(spot)" target="_blank" rel="noopener">{{ $t('shotspots.open_maps') }}</a>
            <button class="sh-btn" @click="stopGuide">{{ $t('shotspots.back') }}</button>
          </div>
        </template>
      </div>

      <!-- Stage 2: recreate overlay — hero photo as a translucent ghost over
           the live camera; sensors are snapshotted at the traveler's shutter. -->
      <div v-if="recreating" class="sh-rec">
        <template v-if="recStage === 'camera'">
          <video ref="recVideo" autoplay playsinline muted></video>
          <img v-if="ghostOn" class="sh-ghost" :src="apiBase + spot.photo.url" alt="" />
          <div class="sh-rec-top">
            <button class="sh-btn sh-btn--sm2" @click="ghostOn = !ghostOn">{{ $t('shotspots.ghost') }}</button>
            <button class="sh-btn sh-btn--sm2" @click="stopRecreate">{{ $t('shotspots.rec_cancel') }}</button>
          </div>
          <button class="sh-rec-shutter" @click="recShot" aria-label="shutter"></button>
        </template>
        <template v-else-if="recStage === 'preview'">
          <img class="sh-rec-preview" :src="recPhoto.dataUrl" alt="" />
          <div class="sh-rec-row">
            <button class="sh-btn" @click="startRecreate">{{ $t('shotspots.rec_retake') }}</button>
            <button class="sh-btn sh-btn--gold" :disabled="submitting" @click="submitRecreation(true)">{{ $t('shotspots.rec_submit') }}</button>
          </div>
        </template>
        <template v-else-if="recStage === 'blocked'">
          <p class="sh-honest">{{ $t('shotspots.rec_camera_blocked') }}</p>
          <div class="sh-rec-row">
            <button class="sh-btn" @click="stopRecreate">{{ $t('shotspots.rec_cancel') }}</button>
            <button class="sh-btn sh-btn--gold" :disabled="submitting" @click="submitRecreation(false)">{{ $t('shotspots.rec_no_photo') }}</button>
          </div>
        </template>
        <template v-else-if="recStage === 'done'">
          <p class="sh-phase">{{ $t('shotspots.rec_thanks', { n: submittedCount }) }}</p>
          <button class="sh-btn sh-btn--gold" @click="stopRecreate">{{ $t('shotspots.back') }}</button>
        </template>
        <p v-if="recError" class="sh-honest">{{ recError }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { startCompass, compassNeedsPermission, requestCompassPermission, haversineM, bearingDeg, cardinalKey } from '@/utils/shotSensors';

const API = import.meta.env.VITE_API_URL || '/api';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default {
  name: 'ShotSpotsView',
  data() {
    return {
      apiBase: API_BASE,
      spots: [], loading: true, cityFilter: '',
      spot: null, guiding: false,
      me: null, deviceHeading: null, lastPitch: null, compassAsk: false,
      recreating: false, recStage: 'camera', recPhoto: null, recError: '',
      submitting: false, submittedCount: 0, ghostOn: true,
      _gpsWatch: null, _stopCompass: null, _recStream: null,
    };
  },
  computed: {
    cities() { return [...new Set(this.spots.map(s => s.city))].sort(); },
    filtered() { return this.cityFilter ? this.spots.filter(s => s.city === this.cityFilter) : this.spots; },
    // Aim at the access point first when one exists and the spot is still far;
    // inside 120m the camera point takes over (the instructions do the rest).
    target() {
      if (!this.spot || !this.me) return null;
      const cam = { lat: this.spot.camera.lat, lng: this.spot.camera.lng };
      const ap = this.spot.access && this.spot.access.point;
      if (ap && ap.lat != null && haversineM(this.me, cam) > 120) return { ...ap, phase: 'access' };
      return { ...cam, phase: 'spot' };
    },
    phase() { return this.target ? this.target.phase : 'spot'; },
    distM() { return this.target ? haversineM(this.me, this.target) : null; },
    // Honest arrival: within GPS confidence, never a fake 5m promise.
    arrived() {
      if (this.distM == null) return false;
      const acc = (this.me && this.me.accuracy) || 15;
      return this.phase === 'spot' && this.distM <= Math.max(12, Math.min(35, acc));
    },
    bearing() { return this.target ? bearingDeg(this.me, this.target) : 0; },
    arrowDeg() { return ((this.bearing - (this.deviceHeading || 0)) % 360 + 360) % 360 - 90; },
    faceDeg() { return (((this.spot.camera.heading || 0) - (this.deviceHeading || 0)) % 360 + 360) % 360 - 90; },
    cardinal() { return cardinalKey(this.bearing); },
    cameraCardinal() { return cardinalKey(this.spot.camera.heading || 0); },
    distanceLabel() {
      if (this.distM == null) return '…';
      return this.distM >= 1000
        ? `${(this.distM / 1000).toFixed(1)} ${this.$t('shotspots.unit_km')}`
        : `${Math.round(this.distM)} ${this.$t('shotspots.unit_m')}`;
    },
    // Surface the WEAKER of capture-time and live GPS accuracy when rough.
    gpsWeak() {
      const cap = this.spot && this.spot.camera.accuracyMeters;
      const live = this.me && this.me.accuracy;
      const worst = Math.max(cap || 0, live || 0);
      return worst > 25 ? Math.round(worst) : null;
    },
    pitchHint() {
      const p = this.spot && this.spot.camera.pitch;
      if (p == null) return '';
      if (p > 12) return this.$t('shotspots.tilt_up');
      if (p < -12) return this.$t('shotspots.tilt_down');
      return this.$t('shotspots.hold_level');
    },
  },
  async mounted() {
    try {
      const r = await fetch(`${API}/shotspots`);
      const d = await r.json();
      this.spots = d.spots || [];
    } catch (e) { /* empty state shows */ }
    this.loading = false;
  },
  beforeUnmount() { this.stopRecStream(); this.stopSensors(); },
  methods: {
    openSpot(s) { this.spot = s; },
    closeSpot() { this.stopGuide(); this.spot = null; },
    mapsLink(s) {
      const ap = s.access && s.access.point;
      const t = (ap && ap.lat != null) ? ap : s.camera;
      return `https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lng}&travelmode=walking`;
    },
    startGuide() {
      this.guiding = true;
      if (navigator.geolocation && this._gpsWatch == null) {
        this._gpsWatch = navigator.geolocation.watchPosition(
          (p) => { this.me = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }; },
          () => {}, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
        );
      }
      if (compassNeedsPermission()) this.compassAsk = true;
      else this._stopCompass = startCompass(({ heading, pitch }) => { if (heading != null) this.deviceHeading = heading; if (pitch != null) this.lastPitch = pitch; });
    },
    async enableCompass() {
      if (await requestCompassPermission()) {
        this.compassAsk = false;
        this._stopCompass = startCompass(({ heading, pitch }) => { if (heading != null) this.deviceHeading = heading; if (pitch != null) this.lastPitch = pitch; });
      } else { this.compassAsk = false; } // cardinal-text fallback takes over
    },
    stopGuide() { this.stopRecreate(); this.guiding = false; this.stopSensors(); },
    // ── Stage 2: recreate flow ──
    async startRecreate() {
      this.recreating = true; this.recStage = 'camera'; this.recError = ''; this.recPhoto = null;
      try {
        this._recStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false,
        });
        await this.$nextTick();
        if (this.$refs.recVideo) this.$refs.recVideo.srcObject = this._recStream;
      } catch (e) { this.recStage = 'blocked'; } // GPS already proved presence
    },
    recShot() {
      const v = this.$refs.recVideo;
      if (!v || !v.videoWidth) return;
      const MAX = 1600, scale = Math.min(1, MAX / Math.max(v.videoWidth, v.videoHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale);
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      this.recPhoto = { dataUrl: c.toDataURL('image/jpeg', 0.85), width: c.width, height: c.height };
      this.stopRecStream();
      this.recStage = 'preview';
    },
    stopRecStream() { if (this._recStream) { this._recStream.getTracks().forEach(t => t.stop()); this._recStream = null; } },
    stopRecreate() { this.stopRecStream(); this.recreating = false; this.recPhoto = null; this.recError = ''; },
    async submitRecreation(withPhoto) {
      if (!this.me) { this.recError = this.$t('shotspots.rec_far'); return; }
      this.submitting = true; this.recError = '';
      try {
        const body = {
          lat: this.me.lat, lng: this.me.lng, accuracyMeters: this.me.accuracy,
          heading: this.deviceHeading, pitch: this.lastPitch,
        };
        if (withPhoto && this.recPhoto) {
          body.photoData = this.recPhoto.dataUrl;
          body.photoWidth = this.recPhoto.width; body.photoHeight = this.recPhoto.height;
        }
        const r = await fetch(`${API}/shotspots/${this.spot.id}/recreations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(body),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error === 'too_far' ? this.$t('shotspots.rec_far') : (d.error || 'failed'));
        this.submittedCount = d.count || 1;
        this.spot.recreationCount = this.submittedCount;
        this.recStage = 'done';
      } catch (e) { this.recError = e.message; }
      this.submitting = false;
    },
    stopSensors() {
      if (this._gpsWatch != null) { navigator.geolocation.clearWatch(this._gpsWatch); this._gpsWatch = null; }
      if (this._stopCompass) { this._stopCompass(); this._stopCompass = null; }
      this.me = null; this.deviceHeading = null; this.compassAsk = false;
    },
  },
};
</script>

<style scoped>
.shots { min-height: 100vh; background: linear-gradient(180deg, #0d1226 0%, #111934 55%, #131a3a 100%); color: #e8ecf8; font-family: var(--app-font, 'Segoe UI', sans-serif); padding: 18px 16px 40px; box-sizing: border-box; position: relative; }
/* genie starfield — pure CSS, two layers, second one breathes */
.shots::before, .shots::after { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    radial-gradient(1px 1px at 22% 28%, rgba(190,210,255,0.9) 50%, transparent 51%),
    radial-gradient(1px 1px at 68% 12%, rgba(190,210,255,0.7) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 84% 46%, rgba(220,232,255,0.8) 50%, transparent 51%),
    radial-gradient(1px 1px at 40% 68%, rgba(190,210,255,0.6) 50%, transparent 51%),
    radial-gradient(1px 1px at 10% 84%, rgba(190,210,255,0.7) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 55% 91%, rgba(243,223,174,0.7) 50%, transparent 51%);
  background-size: 340px 340px; opacity: 0.45; }
.shots::after {
  background-image:
    radial-gradient(1px 1px at 12% 52%, rgba(243,223,174,0.9) 50%, transparent 51%),
    radial-gradient(1.5px 1.5px at 76% 74%, rgba(201,163,245,0.8) 50%, transparent 51%),
    radial-gradient(1px 1px at 48% 22%, rgba(220,232,255,0.8) 50%, transparent 51%),
    radial-gradient(1px 1px at 92% 88%, rgba(243,223,174,0.8) 50%, transparent 51%);
  background-size: 420px 420px; opacity: 0.2; animation: sh-twinkle 7s ease-in-out infinite alternate; }
@keyframes sh-twinkle { from { opacity: 0.12; } to { opacity: 0.5; } }
.shots > * { position: relative; z-index: 1; }
.sh-head { display: flex; gap: 14px; align-items: flex-start; max-width: 860px; margin: 0 auto 14px; }
.sh-back { background: rgba(165,192,255,0.10); border: 1px solid rgba(165,192,255,0.22); color: #e8ecf8; border-radius: 10px; width: 38px; height: 38px; font-size: 1.1rem; cursor: pointer; flex: none; }
.sh-head h1 { margin: 0; font-size: 1.55rem; letter-spacing: 0.015em; background: linear-gradient(105deg, #f3dfae 10%, #e9c46a 45%, #c9a3f5 90%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 24px rgba(212,175,55,0.25); }
.sh-sub { margin: 2px 0 0; color: #93a0c4; font-size: 0.85rem; }
.sh-muted { color: #93a0c4; font-size: 0.9rem; text-align: center; }
.sh-cities { display: flex; gap: 8px; flex-wrap: wrap; max-width: 860px; margin: 0 auto 16px; }
.sh-chip { background: rgba(165,192,255,0.10); border: 1px solid rgba(165,192,255,0.18); color: #aebadd; border-radius: 999px; padding: 6px 14px; font-size: 0.85rem; cursor: pointer; }
.sh-chip--on { background: rgba(212,175,55,0.16); border-color: rgba(212,175,55,0.45); color: #f3dfae; }
.sh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; max-width: 860px; margin: 0 auto; }
.sh-card { text-align: left; background: rgba(17,25,52,0.62); border: 1px solid rgba(212,175,55,0.22); border-radius: 16px; overflow: hidden; cursor: pointer; padding: 0; color: inherit; font-family: inherit; box-shadow: 0 0 18px -2px rgba(212,175,55,0.12), 0 0 16px rgba(0,0,0,0.25), inset 0 0.5px 0 rgba(255,255,255,0.10); }
.sh-card:hover { background: rgba(24,34,68,0.72); border-color: rgba(212,175,55,0.45); box-shadow: 0 0 22px -2px rgba(212,175,55,0.22), 0 0 16px rgba(0,0,0,0.25), inset 0 0.5px 0 rgba(255,255,255,0.14); }
.sh-imgwrap { aspect-ratio: 3 / 2; overflow: hidden; position: relative; }
.sh-imgwrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sh-card-body { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px 12px; }
.sh-card-body strong { font-size: 0.98rem; }
.sh-card-body .sh-muted { text-align: left; font-size: 0.8rem; }
.sh-time { color: #f3dfae; font-size: 0.75rem; }
/* detail sheet */
.sh-detail { position: fixed; inset: 0; background: rgba(6,9,20,0.7); backdrop-filter: blur(6px); display: flex; align-items: flex-end; justify-content: center; z-index: 60; }
.sh-sheet { position: relative; background: #111934; border: 1px solid rgba(212,175,55,0.28); border-bottom: none; border-radius: 20px 20px 0 0; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; padding: 18px 18px 28px; box-sizing: border-box; box-shadow: 0 0 28px -4px rgba(212,175,55,0.18); }
@media (min-width: 640px) { .sh-detail { align-items: center; } .sh-sheet { border-radius: 20px; border-bottom: 1px solid rgba(165,192,255,0.16); } }
.sh-close { position: absolute; top: 12px; right: 12px; z-index: 2; background: rgba(17,25,52,0.8); border: 1px solid rgba(165,192,255,0.22); color: #e8ecf8; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }
.sh-hero { width: 100%; max-height: 46vh; object-fit: contain; border-radius: 14px; background: #000; }
.sh-sheet h2 { margin: 12px 0 2px; font-size: 1.15rem; }
.sh-cred { text-align: left; font-size: 0.75rem; margin: 0 0 10px; }
.sh-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 48px 20px; color: #93a0c4; text-align: center; }
.sh-empty-spark { font-size: 2rem; filter: drop-shadow(0 0 12px rgba(243,223,174,0.6)); animation: sh-twinkle 3s ease-in-out infinite alternate; }
.sh-empty p { margin: 0; font-size: 0.95rem; max-width: 340px; }
.sh-facts p { margin: 0 0 9px; font-size: 0.9rem; line-height: 1.45; color: #cfd7ee; }
.sh-facts span { display: block; color: #7d8ab2; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1px; }
.sh-actions { display: flex; gap: 10px; margin-top: 14px; }
.sh-btn { flex: 1; text-align: center; background: rgba(165,192,255,0.10); border: 1px solid rgba(165,192,255,0.22); color: #e8ecf8; border-radius: 12px; padding: 11px 12px; font-size: 0.92rem; cursor: pointer; text-decoration: none; font-family: inherit; box-sizing: border-box; }
.sh-btn:hover { background: rgba(165,192,255,0.18); }
.sh-btn--gold { background: rgba(212,175,55,0.16); border-color: rgba(212,175,55,0.45); color: #f3dfae; }
.sh-btn--gold:hover { background: rgba(212,175,55,0.26); }
/* guide */
.sh-guide-thumb { width: 100%; max-height: 26vh; object-fit: contain; border-radius: 12px; background: #000; }
.sh-phase { text-align: center; font-size: 1rem; color: #f3dfae; margin: 12px 0 4px; }
.sh-compassbox { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 0; }
.sh-arrow { font-size: 64px; line-height: 1; color: #a5c0ff; transition: transform 0.25s ease; will-change: transform; }
.sh-arrow--gold { color: #f3dfae; }
.sh-dist { font-size: 1.6rem; font-weight: 600; margin: 4px 0 0; }
.sh-frame { color: #cfd7ee; font-size: 0.9rem; margin: 6px 0 0; text-align: center; }
.sh-honest { background: rgba(212,175,55,0.10); border: 1px solid rgba(212,175,55,0.3); color: #f3dfae; border-radius: 10px; padding: 8px 12px; font-size: 0.82rem; margin: 10px 0 0; text-align: center; }
.sh-count { color: #f3dfae; font-size: 0.85rem; margin: 0 0 10px; }
.sh-got { width: 100%; margin-top: 10px; flex: none; }
/* recreate overlay */
.sh-rec { position: fixed; inset: 0; background: #05070f; z-index: 70; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; }
.sh-rec video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sh-ghost { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0.32; pointer-events: none; }
.sh-rec-top { position: absolute; top: 14px; left: 14px; right: 14px; display: flex; justify-content: space-between; z-index: 2; }
.sh-btn--sm2 { flex: none; padding: 7px 14px; font-size: 0.85rem; background: rgba(13,18,38,0.72); }
.sh-rec-shutter { position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%); width: 68px; height: 68px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.92); background: rgba(255,255,255,0.25); cursor: pointer; z-index: 2; }
.sh-rec-preview { max-width: 100%; max-height: 68vh; border-radius: 14px; position: relative; z-index: 1; }
.sh-rec-row { display: flex; gap: 10px; margin-top: 14px; position: relative; z-index: 1; width: 100%; max-width: 420px; }
.sh-rec .sh-honest, .sh-rec .sh-phase { position: relative; z-index: 2; }
</style>
