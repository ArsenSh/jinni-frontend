<template>
  <!-- ──────────────────────────────────────────────────────────────────────
       ShotCaptureView — staff Capture Mode for Jinni Shot Spots (Stage 1).
       Internal tool (English-only, like AdminDashboard). The point of this
       page: the hero photo and its sensor truth (GPS + accuracy + compass
       heading + pitch) are recorded IN THE SAME INSTANT the shutter is
       tapped, on site — never typed in later from memory.
       Self-contained: deleting this file + its router entry removes it.
  ─────────────────────────────────────────────────────────────────────── -->
  <div class="shotcap">
    <header class="sc-head">
      <h1>Shot Spots — Capture</h1>
      <button v-if="view !== 'list'" class="sc-btn" @click="backToList">✕ Close</button>
      <div v-else class="sc-newgroup">
        <button class="sc-btn sc-btn--gold" @click="startCapture">📸 Capture</button>
        <label class="sc-btn sc-file">🖼 Import
          <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" @change="onImportPicked" hidden />
        </label>
        <button class="sc-btn" @click="startScout">📍 Scout</button>
        <button class="sc-btn" @click="openLeads">⛏ Leads</button>
      </div>
    </header>

    <!-- ── LIST ─────────────────────────────────────────────────────────── -->
    <div v-if="view === 'list'" class="sc-list">
      <p v-if="importError" class="sc-error">{{ importError }}</p>
      <p v-if="loading" class="sc-muted">Loading…</p>
      <p v-else-if="error" class="sc-error">{{ error }}</p>
      <p v-else-if="!spots.length" class="sc-muted">No shot spots yet. Go somewhere beautiful and tap “New capture”.</p>
      <div v-for="s in spots" :key="s.id" class="sc-row">
        <img v-if="s.photo.url" :src="apiBase + s.photo.url" alt="" loading="lazy" />
        <div v-else class="sc-noimg" title="Scouted — no photo yet">📍</div>
        <div class="sc-row-main">
          <strong>{{ s.title }}</strong>
          <span class="sc-muted">{{ s.city }}<template v-if="s.access && s.access.nearestPlace"> · {{ s.access.nearestPlace }}</template></span>
          <span class="sc-meta">
            GPS ±{{ s.camera.accuracyMeters == null ? '?' : Math.round(s.camera.accuracyMeters) }}m
            · {{ s.camera.heading == null ? 'no heading' : Math.round(s.camera.heading) + '°' }}
            · {{ s.camera.orientation }}
          </span>
        </div>
        <div class="sc-row-actions">
          <span class="sc-status" :class="'sc-status--' + s.status">{{ s.status }}</span>
          <button v-if="s.recreationCount" class="sc-btn sc-btn--sm" @click="openRecs(s)">📸 {{ s.recreationCount }} got it</button>
          <button class="sc-btn sc-btn--sm" @click="togglePublish(s)">{{ s.status === 'active' ? 'Unpublish' : 'Publish' }}</button>
          <button class="sc-btn sc-btn--sm" @click="editSpot(s)">Edit</button>
          <button class="sc-btn sc-btn--sm sc-btn--danger" @click="removeSpot(s)">Delete</button>
        </div>
      </div>
    </div>

    <!-- ── CAMERA ───────────────────────────────────────────────────────── -->
    <div v-else-if="view === 'camera'" class="sc-camera">
      <video ref="video" autoplay playsinline muted></video>
      <div class="sc-hud">
        <span :class="{ 'sc-hud-bad': !gps }">
          {{ gps ? `GPS ±${Math.round(gps.accuracy)}m` : 'GPS: waiting…' }}
        </span>
        <span :class="{ 'sc-hud-bad': heading == null }">
          {{ heading == null ? 'Compass: —' : `Compass ${Math.round(heading)}°` }}
        </span>
        <span>{{ pitch == null ? 'Pitch: —' : `Pitch ${Math.round(pitch)}°` }}</span>
      </div>
      <button v-if="compassAsk" class="sc-btn sc-btn--gold sc-compass-ask" @click="enableCompass">Enable compass</button>
      <p v-if="cameraError" class="sc-error sc-cam-error">
        {{ cameraError }}
        <label class="sc-btn sc-btn--sm sc-file">Use camera app instead
          <input type="file" accept="image/*" capture="environment" @change="onFilePicked" hidden />
        </label>
      </p>
      <button v-else class="sc-shutter" :disabled="!gps" @click="takeShot" aria-label="Take photo"></button>
      <p v-if="!gps && !cameraError" class="sc-muted sc-cam-hint">Shutter unlocks when GPS has a fix — the spot IS the coordinates.</p>
    </div>

    <!-- ── FORM ─────────────────────────────────────────────────────────── -->
    <div v-else-if="view === 'form'" class="sc-form">
      <img v-if="shot.dataUrl" :src="shot.dataUrl" class="sc-preview" alt="" />
      <img v-else-if="editingId && editingHasPhoto" :src="apiBase + '/api/shotspots/' + editingId + '/photo'" class="sc-preview" alt="" />
      <p class="sc-meta" v-if="shot.dataUrl">
        Recorded: {{ shot.lat && shot.lat.toFixed ? shot.lat.toFixed(5) : shot.lat }}, {{ shot.lng && shot.lng.toFixed ? shot.lng.toFixed(5) : shot.lng }}
        ±{{ shot.accuracy == null ? '?' : Math.round(shot.accuracy) }}m ·
        {{ shot.heading == null ? 'no heading' : Math.round(shot.heading) + '°' }} ·
        {{ shot.orientation }}
      </p>
      <div class="sc-photoacts">
        <button class="sc-btn sc-btn--sm" @click="startCapture">📸 {{ canPublish ? 'Retake on site' : 'Capture on site' }}</button>
        <label class="sc-btn sc-btn--sm sc-file">🖼 Import photo
          <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" @change="onImportPicked" hidden />
        </label>
      </div>
      <p v-if="importError" class="sc-error">{{ importError }}</p>

      <label v-if="scouting">Coordinates * — paste from Google Maps (right-click the spot → first menu line)
        <input v-model.trim="scoutCoords" placeholder="40.17925, 44.51262" />
      </label>
      <label>Title * <input v-model.trim="form.title" maxlength="120" placeholder="Cascade symmetry from the fountain steps" /></label>
      <div class="sc-two">
        <label>City * <input v-model.trim="form.city" maxlength="80" placeholder="Yerevan" /></label>
        <label>Country <input v-model.trim="form.country" maxlength="80" placeholder="Armenia" /></label>
      </div>
      <label>What's in the photo <input v-model.trim="form.subjectName" maxlength="120" placeholder="Cascade Complex" /></label>
      <label>Nearest known place <input v-model.trim="form.nearestPlace" maxlength="160" placeholder="Cascade Complex, Tamanyan St" /></label>
      <label>How to reach the exact spot
        <textarea v-model.trim="form.instructions" maxlength="600" rows="3"
          placeholder="From the Tamanyan statue walk to the central fountain; stand on the second step, center of the pool in front of you."></textarea>
      </label>
      <div class="sc-two">
        <label>Walk (min) <input v-model.number="form.walkMinutes" type="number" min="0" max="600" /></label>
        <label>Best time
          <select v-model="form.bestTime">
            <option v-for="t in bestTimes" :key="t" :value="t">{{ t }}</option>
          </select>
        </label>
      </div>
      <label>Season note <input v-model.trim="form.season" maxlength="120" placeholder="Fountains run May–Oct" /></label>
      <label>Shooting notes <textarea v-model.trim="form.notes" maxlength="600" rows="2" placeholder="Wide lens helps; keep the axis centered."></textarea></label>

      <div class="sc-access">
        <button class="sc-btn sc-btn--sm" :disabled="!gps" @click="markAccessPoint">
          📍 Mark access point = where I stand now
        </button>
        <span class="sc-muted">{{ accessPointLabel }}</span>
      </div>

      <p v-if="error" class="sc-error">{{ error }}</p>
      <p v-if="!canPublish" class="sc-muted">Scout draft — travelers see it only after a real photo is captured or imported.</p>
      <div class="sc-actions">
        <button class="sc-btn" :disabled="saving" @click="submit('draft')">{{ saving ? 'Saving…' : 'Save draft' }}</button>
        <button v-if="canPublish" class="sc-btn sc-btn--gold" :disabled="saving" @click="submit('active')">{{ saving ? 'Saving…' : 'Save & publish' }}</button>
      </div>
    </div>

    <!-- ── RECREATIONS (Stage 2 moderation) ─────────────────────────────── -->
    <div v-else-if="view === 'recs'" class="sc-list">
      <h2 class="sc-sub">Recreations — {{ recSpot ? recSpot.title : '' }}</h2>
      <p class="sc-meta">Traveler photos are private until you promote one. "Make hero" replaces the public photo (source shown as traveler); your camera point and instructions stay as they are.</p>
      <p v-if="error" class="sc-error">{{ error }}</p>
      <p v-if="recsLoading" class="sc-muted">Loading…</p>
      <p v-else-if="!recs.length" class="sc-muted">None yet.</p>
      <div v-for="r in recs" :key="r.id" class="sc-row">
        <img v-if="r.photoUrl" :src="r.photoUrl" alt="" />
        <div v-else class="sc-noimg">{{ r.hasPhoto ? '⏳' : '✔️' }}</div>
        <div class="sc-row-main">
          <strong>{{ new Date(r.createdAt).toLocaleString() }}</strong>
          <span class="sc-meta">
            {{ r.distanceM == null ? '?' : r.distanceM + 'm' }} from spot
            · GPS ±{{ r.accuracyMeters == null ? '?' : Math.round(r.accuracyMeters) }}m
            · {{ r.heading == null ? 'no heading' : Math.round(r.heading) + '°' }}
          </span>
          <span v-if="r.promotedAt" class="sc-status sc-status--active">current hero</span>
        </div>
        <div class="sc-row-actions">
          <button v-if="r.hasPhoto && !r.promotedAt" class="sc-btn sc-btn--sm sc-btn--gold" @click="promoteRec(r)">Make hero</button>
          <button class="sc-btn sc-btn--sm sc-btn--danger" @click="deleteRec(r)">Delete</button>
        </div>
      </div>
    </div>

    <!-- ── LEADS (Stage 3 miner — evidence, never the face) ─────────────── -->
    <div v-else-if="view === 'leads'" class="sc-form">
      <h2 class="sc-sub">Leads — where photographers already stand</h2>
      <p class="sc-meta">Coordinates and counts only (OSM viewpoints + Commons camera positions). Images are never imported — a lead becomes a spot only after you scout and shoot it.</p>
      <div class="sc-two">
        <label>Center (lat, lng) <input v-model.trim="leadCoords" placeholder="40.17925, 44.51262" /></label>
        <label>Radius
          <select v-model.number="leadRadius">
            <option :value="1">1 km</option><option :value="3">3 km</option>
            <option :value="5">5 km</option><option :value="10">10 km</option>
          </select>
        </label>
      </div>
      <div class="sc-photoacts">
        <button class="sc-btn sc-btn--sm" :disabled="!gps" @click="useMyLocation">📍 Use my location</button>
        <button class="sc-btn sc-btn--sm sc-btn--gold" :disabled="leadsLoading" @click="findLeads">{{ leadsLoading ? 'Searching…' : 'Find leads' }}</button>
      </div>
      <p v-if="error" class="sc-error">{{ error }}</p>
      <template v-if="leads">
        <p class="sc-meta">Commons: {{ leads.sources.commons }} · OSM viewpoints: {{ leads.sources.osm }}</p>
        <div v-for="(c, i) in leads.clusters" :key="'c' + i" class="sc-row">
          <div class="sc-noimg">📷</div>
          <div class="sc-row-main">
            <strong>{{ c.photographers }} photographers stood here</strong>
            <span class="sc-meta">{{ (c.distanceM / 1000).toFixed(1) }} km · {{ c.sampleTitles.join(' · ') }}</span>
          </div>
          <div class="sc-row-actions">
            <a class="sc-btn sc-btn--sm" :href="'https://maps.google.com/?q=' + c.lat + ',' + c.lng" target="_blank" rel="noopener">Map</a>
            <button class="sc-btn sc-btn--sm sc-btn--gold" @click="scoutLead(c.lat, c.lng, '')">Scout</button>
          </div>
        </div>
        <div v-for="(vp, i) in leads.viewpoints" :key="'v' + i" class="sc-row">
          <div class="sc-noimg">🏔</div>
          <div class="sc-row-main">
            <strong>{{ vp.name }}</strong>
            <span class="sc-meta">viewpoint · {{ (vp.distanceM / 1000).toFixed(1) }} km</span>
          </div>
          <div class="sc-row-actions">
            <a class="sc-btn sc-btn--sm" :href="'https://maps.google.com/?q=' + vp.lat + ',' + vp.lng" target="_blank" rel="noopener">Map</a>
            <button class="sc-btn sc-btn--sm sc-btn--gold" @click="scoutLead(vp.lat, vp.lng, vp.name)">Scout</button>
          </div>
        </div>
        <p v-if="!leads.clusters.length && !leads.viewpoints.length" class="sc-muted">Nothing found in this radius.</p>
      </template>
    </div>
  </div>
</template>

<script>
import { startCompass, compassNeedsPermission, requestCompassPermission } from '@/utils/shotSensors';
import { parseExifGps } from '@/utils/exifGps';

const API = import.meta.env.VITE_API_URL || '/api';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token') || ''}`,
});
const emptyForm = () => ({
  title: '', city: '', country: '', subjectName: '', nearestPlace: '',
  instructions: '', walkMinutes: null, bestTime: 'any', season: '', notes: '',
  accessPoint: null,
});

export default {
  name: 'ShotCaptureView',
  data() {
    return {
      apiBase: API_BASE,
      view: 'list', spots: [], loading: true, saving: false, error: '',
      cameraError: '',
      // live sensors
      gps: null, heading: null, pitch: null, compassAsk: false,
      // the captured instant
      shot: { dataUrl: '', width: 0, height: 0, lat: null, lng: null, accuracy: null, heading: null, pitch: null, orientation: 'portrait' },
      form: emptyForm(),
      editingId: null, editingHasPhoto: false,
      scouting: false, scoutCoords: '', importError: '',
      recSpot: null, recs: [], recsLoading: false, _recBlobUrls: [],
      leadCoords: '', leadRadius: 3, leads: null, leadsLoading: false,
      bestTimes: ['sunrise', 'morning', 'midday', 'afternoon', 'sunset', 'blue_hour', 'night', 'any'],
      _stream: null, _gpsWatch: null, _stopCompass: null,
    };
  },
  computed: {
    canPublish() { return !!this.shot.dataUrl || this.editingHasPhoto; },
    accessPointLabel() {
      const p = this.form.accessPoint;
      return p ? `Access point set (${p.lat.toFixed(5)}, ${p.lng.toFixed(5)})` : 'Not set — navigation will aim at the camera spot itself';
    },
  },
  mounted() { this.loadSpots(); },
  beforeUnmount() { this.stopSensors(); this.freeRecBlobs(); },
  methods: {
    async loadSpots() {
      this.loading = true; this.error = '';
      try {
        const r = await fetch(`${API}/shotspots/staff/list`, { headers: authHeaders() });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load');
        this.spots = d.spots || [];
      } catch (e) { this.error = e.message; }
      this.loading = false;
    },

    // ── sensors ──
    startGps() {
      if (this._gpsWatch != null || !navigator.geolocation) return;
      this._gpsWatch = navigator.geolocation.watchPosition(
        (p) => { this.gps = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }; },
        () => {}, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
      );
    },
    startCompassNow() {
      if (this._stopCompass) return;
      this._stopCompass = startCompass(({ heading, pitch }) => {
        if (heading != null) this.heading = heading;
        if (pitch != null) this.pitch = pitch;
      });
    },
    async enableCompass() {
      if (await requestCompassPermission()) { this.compassAsk = false; this.startCompassNow(); }
    },
    stopSensors() {
      if (this._stream) { this._stream.getTracks().forEach(t => t.stop()); this._stream = null; }
      if (this._gpsWatch != null) { navigator.geolocation.clearWatch(this._gpsWatch); this._gpsWatch = null; }
      if (this._stopCompass) { this._stopCompass(); this._stopCompass = null; }
    },

    resetShot() {
      this.shot = { dataUrl: '', width: 0, height: 0, lat: null, lng: null, accuracy: null, heading: null, pitch: null, orientation: 'portrait' };
    },
    // ── scout flow (desk pinning: coordinates now, photo later) ──
    startScout() {
      this.editingId = null; this.editingHasPhoto = false;
      this.form = emptyForm(); this.resetShot();
      this.scouting = true; this.scoutCoords = ''; this.importError = ''; this.error = '';
      this.view = 'form';
    },
    // ── gallery import (EXIF: recorded GPS/heading or rejection — never a guess) ──
    async onImportPicked(ev) {
      const file = ev.target.files && ev.target.files[0];
      ev.target.value = '';
      if (!file) return;
      this.importError = '';
      let gps = null;
      try { gps = parseExifGps(await file.arrayBuffer()); } catch (e) { /* no GPS */ }
      if (!gps) {
        this.importError = 'No location data in this photo — internet photos and screenshots are rejected. '
          + 'Note: iPhone Safari often strips location from picked photos; import from a computer or Android, or use Capture on site.';
        return;
      }
      const fromList = this.view === 'list';
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        const img = this.frameToJpeg(im, im.naturalWidth, im.naturalHeight);
        URL.revokeObjectURL(url);
        this.shot = {
          ...img, lat: gps.lat, lng: gps.lng, accuracy: gps.accuracyM,
          heading: gps.headingDeg, pitch: null,
          orientation: img.width >= img.height ? 'landscape' : 'portrait',
        };
        if (fromList) { this.editingId = null; this.editingHasPhoto = false; this.form = emptyForm(); }
        this.scouting = false;
        this.view = 'form';
      };
      im.onerror = () => { URL.revokeObjectURL(url); this.importError = 'Could not read this image file.'; };
      im.src = url;
    },
    // ── capture flow ──
    async startCapture() {
      this.view = 'camera'; this.cameraError = ''; this.error = ''; this.importError = '';
      if (!this.editingId) { this.form = emptyForm(); }
      this.startGps();
      if (compassNeedsPermission()) this.compassAsk = true; else this.startCompassNow();
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false,
        });
        await this.$nextTick();
        if (this.$refs.video) this.$refs.video.srcObject = this._stream;
      } catch (e) {
        this.cameraError = 'Camera blocked — allow it in browser settings, or:';
      }
    },
    snapshotSensors() {
      return {
        lat: this.gps ? this.gps.lat : null, lng: this.gps ? this.gps.lng : null,
        accuracy: this.gps ? this.gps.accuracy : null,
        heading: this.heading, pitch: this.pitch,
      };
    },
    frameToJpeg(source, w, h) {
      const MAX = 1600, scale = Math.min(1, MAX / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
      canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
      return { dataUrl: canvas.toDataURL('image/jpeg', 0.85), width: canvas.width, height: canvas.height };
    },
    takeShot() {
      const v = this.$refs.video;
      if (!v || !v.videoWidth) return;
      // ONE instant: pixels and sensors together — this is the whole point.
      const s = this.snapshotSensors();
      const img = this.frameToJpeg(v, v.videoWidth, v.videoHeight);
      this.shot = { ...img, ...s, orientation: img.width >= img.height ? 'landscape' : 'portrait' };
      this.scouting = false; // real on-site coords now beat any desk pin
      if (this._stream) { this._stream.getTracks().forEach(t => t.stop()); this._stream = null; }
      this.view = 'form';
    },
    onFilePicked(ev) {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      // Fallback path (camera app): sensors are read at PICK time, not
      // shutter time — heading is usually stale, so GPS still rules.
      const s = this.snapshotSensors();
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        const img = this.frameToJpeg(im, im.naturalWidth, im.naturalHeight);
        URL.revokeObjectURL(url);
        this.shot = { ...img, ...s, heading: null, pitch: null, orientation: img.width >= img.height ? 'landscape' : 'portrait' };
        this.scouting = false;
        this.view = 'form';
      };
      im.src = url;
    },
    markAccessPoint() {
      if (this.gps) this.form.accessPoint = { lat: this.gps.lat, lng: this.gps.lng };
    },

    // ── save / manage ──
    payload(status) {
      const f = this.form;
      const body = {
        title: f.title, city: f.city, country: f.country, status,
        subject: { name: f.subjectName },
        access: {
          nearestPlace: f.nearestPlace, instructions: f.instructions,
          walkMinutes: f.walkMinutes, point: f.accessPoint || { lat: null, lng: null },
        },
        shooting: { bestTime: f.bestTime, season: f.season, notes: f.notes },
      };
      if (this.shot.dataUrl) {
        body.camera = {
          lat: this.shot.lat, lng: this.shot.lng, accuracyMeters: this.shot.accuracy,
          heading: this.shot.heading, pitch: this.shot.pitch, orientation: this.shot.orientation,
        };
        body.photoData = this.shot.dataUrl;
        body.photoWidth = this.shot.width; body.photoHeight = this.shot.height;
      } else if (this._scoutCam) {
        // Desk pin: a human chose the point deliberately; sensors stay null.
        body.camera = { lat: this._scoutCam.lat, lng: this._scoutCam.lng, accuracyMeters: null, heading: null, pitch: null, orientation: 'portrait' };
      }
      return body;
    },
    async submit(status) {
      this.error = ''; this._scoutCam = null;
      if (!this.form.title) { this.error = 'Title is required'; return; }
      if (!this.form.city) { this.error = 'City is required'; return; }
      if (this.scouting && !this.shot.dataUrl) {
        const m = this.scoutCoords.match(/(-?\d{1,3}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
        const lat = m && parseFloat(m[1]), lng = m && parseFloat(m[2]);
        if (!m || Math.abs(lat) > 90 || Math.abs(lng) > 180) { this.error = 'Coordinates must look like: 40.17925, 44.51262'; return; }
        this._scoutCam = { lat, lng };
      }
      if (!this.editingId && !this.shot.dataUrl && !this._scoutCam) { this.error = 'Photo is required (or use Scout to pin coordinates first)'; return; }
      if (status === 'active' && !this.canPublish) { this.error = 'A spot needs a real photo before publishing'; return; }
      this.saving = true;
      try {
        const url = this.editingId ? `${API}/shotspots/staff/${this.editingId}` : `${API}/shotspots/staff`;
        const r = await fetch(url, {
          method: this.editingId ? 'PATCH' : 'POST',
          headers: authHeaders(), body: JSON.stringify(this.payload(status)),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Save failed');
        this.backToList(); this.loadSpots();
      } catch (e) { this.error = e.message; }
      this.saving = false;
    },
    editSpot(s) {
      this.editingId = s.id;
      this.editingHasPhoto = !!(s.photo && s.photo.url);
      this.scouting = !this.editingHasPhoto;
      this.scoutCoords = this.scouting ? `${s.camera.lat}, ${s.camera.lng}` : '';
      this.importError = '';
      this.resetShot();
      this.form = {
        title: s.title, city: s.city, country: s.country || '',
        subjectName: (s.subject && s.subject.name) || '',
        nearestPlace: (s.access && s.access.nearestPlace) || '',
        instructions: (s.access && s.access.instructions) || '',
        walkMinutes: (s.access && s.access.walkMinutes) != null ? s.access.walkMinutes : null,
        bestTime: (s.shooting && s.shooting.bestTime) || 'any',
        season: (s.shooting && s.shooting.season) || '',
        notes: (s.shooting && s.shooting.notes) || '',
        accessPoint: (s.access && s.access.point && s.access.point.lat != null) ? { lat: s.access.point.lat, lng: s.access.point.lng } : null,
      };
      this.startGps(); // so "mark access point" works while editing on site
      this.view = 'form';
    },
    async togglePublish(s) {
      try {
        const r = await fetch(`${API}/shotspots/staff/${s.id}`, {
          method: 'PATCH', headers: authHeaders(),
          body: JSON.stringify({ status: s.status === 'active' ? 'draft' : 'active' }),
        });
        if (r.ok) this.loadSpots();
      } catch (e) { /* list refresh will show truth */ }
    },
    async removeSpot(s) {
      if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
      try {
        const r = await fetch(`${API}/shotspots/staff/${s.id}`, { method: 'DELETE', headers: authHeaders() });
        if (r.ok) this.loadSpots();
      } catch (e) { /* ignore; list shows truth */ }
    },
    // ── Stage 2 moderation ──
    async openRecs(s) {
      this.recSpot = s; this.view = 'recs'; this.recsLoading = true;
      this.freeRecBlobs(); this.recs = []; this.error = '';
      try {
        const r = await fetch(`${API}/shotspots/staff/${s.id}/recreations`, { headers: authHeaders() });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load');
        this.recs = (d.recreations || []).map(x => ({ ...x, photoUrl: '' }));
        // photo endpoint needs the auth header, so <img src> can't load it —
        // fetch each as a blob (first 30 with photos).
        for (const rec of this.recs.filter(x => x.hasPhoto).slice(0, 30)) {
          try {
            const pr = await fetch(`${API}/shotspots/staff/recreations/${rec.id}/photo`, { headers: authHeaders() });
            if (pr.ok) { const u = URL.createObjectURL(await pr.blob()); rec.photoUrl = u; this._recBlobUrls.push(u); }
          } catch (e) { /* row shows without thumb */ }
        }
      } catch (e) { this.error = e.message; }
      this.recsLoading = false;
    },
    freeRecBlobs() { (this._recBlobUrls || []).forEach(u => URL.revokeObjectURL(u)); this._recBlobUrls = []; },
    async promoteRec(r) {
      if (!window.confirm('Make this traveler photo the public hero for this spot?')) return;
      const resp = await fetch(`${API}/shotspots/staff/recreations/${r.id}/promote`, { method: 'POST', headers: authHeaders() });
      if (resp.ok) { this.openRecs(this.recSpot); this.loadSpots(); }
      else { const d = await resp.json().catch(() => ({})); this.error = d.error || 'Promote failed'; }
    },
    async deleteRec(r) {
      if (!window.confirm('Delete this recreation?')) return;
      const resp = await fetch(`${API}/shotspots/staff/recreations/${r.id}`, { method: 'DELETE', headers: authHeaders() });
      if (resp.ok) this.openRecs(this.recSpot);
    },
    // ── Stage 3 leads ──
    openLeads() { this.view = 'leads'; this.error = ''; this.leads = null; this.startGps(); },
    useMyLocation() { if (this.gps) this.leadCoords = `${this.gps.lat.toFixed(5)}, ${this.gps.lng.toFixed(5)}`; },
    async findLeads() {
      this.error = '';
      const m = this.leadCoords.match(/(-?\d{1,3}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
      if (!m) { this.error = 'Coordinates must look like: 40.17925, 44.51262'; return; }
      this.leadsLoading = true; this.leads = null;
      try {
        const r = await fetch(`${API}/shotspots/staff/mine?lat=${m[1]}&lng=${m[2]}&radiusKm=${this.leadRadius}`, { headers: authHeaders() });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Search failed');
        this.leads = d;
      } catch (e) { this.error = e.message; }
      this.leadsLoading = false;
    },
    scoutLead(lat, lng, name) {
      this.startScout();
      this.scoutCoords = `${lat}, ${lng}`;
      if (name && name !== 'Unnamed viewpoint') this.form.title = name;
    },
    backToList() {
      this.stopSensors();
      this.freeRecBlobs(); this.recSpot = null; this.leads = null;
      this.view = 'list'; this.editingId = null; this.editingHasPhoto = false;
      this.scouting = false; this.scoutCoords = ''; this.error = '';
      this.resetShot();
    },
  },
};
</script>

<style scoped>
.shotcap { min-height: 100vh; background: #0d1226; color: #e8ecf8; font-family: 'DM Sans', 'Segoe UI', sans-serif; padding: 16px; box-sizing: border-box; }
.sc-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.sc-head h1 { font-size: 1.15rem; margin: 0; font-weight: 600; letter-spacing: 0.02em; }
.sc-btn { background: rgba(165,192,255,0.10); color: #e8ecf8; border: 1px solid rgba(165,192,255,0.22); border-radius: 10px; padding: 8px 14px; font-size: 0.9rem; cursor: pointer; }
.sc-btn:hover { background: rgba(165,192,255,0.18); }
.sc-btn:disabled { opacity: 0.45; cursor: default; }
.sc-btn--gold { background: rgba(212,175,55,0.16); border-color: rgba(212,175,55,0.45); color: #f3dfae; }
.sc-btn--gold:hover { background: rgba(212,175,55,0.26); }
.sc-btn--sm { padding: 5px 10px; font-size: 0.8rem; border-radius: 8px; }
.sc-btn--danger { border-color: rgba(255,120,120,0.4); color: #ffb4b4; }
.sc-muted { color: #93a0c4; font-size: 0.85rem; }
.sc-meta { color: #7d8ab2; font-size: 0.75rem; }
.sc-error { color: #ffb4b4; font-size: 0.85rem; }
/* list */
.sc-list { display: flex; flex-direction: column; gap: 10px; max-width: 720px; margin: 0 auto; }
.sc-row { display: flex; gap: 12px; align-items: center; background: rgba(17,25,52,0.62); border: 1px solid rgba(165,192,255,0.15); border-radius: 14px; padding: 10px; }
.sc-row img { width: 72px; height: 72px; object-fit: cover; border-radius: 10px; flex: none; }
.sc-row-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.sc-row-main strong { font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sc-row-actions { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; flex: none; }
.sc-status { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; }
.sc-status--active { background: rgba(80,200,120,0.15); color: #9fe8bb; }
.sc-status--draft { background: rgba(165,192,255,0.12); color: #aebadd; }
/* camera */
.sc-camera { position: relative; max-width: 720px; margin: 0 auto; }
.sc-camera video { width: 100%; border-radius: 16px; background: #000; min-height: 50vh; object-fit: cover; }
.sc-hud { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
.sc-hud span { background: rgba(13,18,38,0.72); backdrop-filter: blur(6px); border-radius: 999px; padding: 4px 10px; font-size: 0.75rem; }
.sc-hud-bad { color: #ffd9a0; }
.sc-compass-ask { position: absolute; top: 52px; left: 10px; }
.sc-shutter { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); width: 64px; height: 64px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.9); background: rgba(255,255,255,0.25); cursor: pointer; }
.sc-shutter:disabled { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.08); }
.sc-cam-hint { text-align: center; margin-top: 8px; }
.sc-cam-error { margin-top: 10px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.sc-file { display: inline-block; }
.sc-newgroup { display: flex; gap: 8px; }
.sc-noimg { width: 72px; height: 72px; border-radius: 10px; background: rgba(165,192,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex: none; }
.sc-photoacts { display: flex; gap: 10px; flex-wrap: wrap; }
.sc-sub { font-size: 1rem; margin: 0; font-weight: 600; }
/* form */
.sc-form { display: flex; flex-direction: column; gap: 10px; max-width: 560px; margin: 0 auto; }
.sc-preview { width: 100%; max-height: 300px; object-fit: contain; border-radius: 14px; background: #000; }
.sc-form label { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: #aebadd; }
.sc-form input, .sc-form textarea, .sc-form select { background: rgba(17,25,52,0.62); border: 1px solid rgba(165,192,255,0.18); border-radius: 10px; color: #e8ecf8; padding: 9px 11px; font-size: 0.95rem; font-family: inherit; }
.sc-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sc-access { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.sc-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; padding-bottom: 32px; }
</style>
