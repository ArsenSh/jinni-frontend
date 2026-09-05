// ─────────────────────────────────────────────────────────────────────────────
//  exifGps.js — minimal EXIF GPS reader for Jinni Shot Spots gallery import.
//  Part of the deletable Shot Spots file set; used only by ShotCaptureView.
//
//  Reads ONLY what the feature needs from a JPEG's APP1/TIFF block:
//  GPSLatitude/Longitude (+refs), GPSImgDirection (compass heading at the
//  shutter — many phones record it), GPSHPositioningError (accuracy, rare).
//  No library on purpose: the honesty rule is "recorded or null", and a tiny
//  reader we fully understand can't quietly invent values.
//
//  Returns { lat, lng, headingDeg|null, accuracyM|null } or null when the
//  file has no usable GPS — which is exactly the gate: internet photos and
//  screenshots have stripped EXIF and are rejected upstream.
// ─────────────────────────────────────────────────────────────────────────────

export function parseExifGps(arrayBuffer) {
  try {
    const v = new DataView(arrayBuffer);
    if (v.byteLength < 12 || v.getUint16(0) !== 0xFFD8) return null; // JPEG only
    let o = 2;
    while (o + 4 <= v.byteLength) {
      if (v.getUint8(o) !== 0xFF) break;
      const marker = v.getUint8(o + 1);
      if (marker === 0x01 || (marker >= 0xD0 && marker <= 0xD8)) { o += 2; continue; }
      if (marker === 0xDA) break; // start of image data — EXIF can't follow
      const len = v.getUint16(o + 2);
      if (len < 2 || o + 2 + len > v.byteLength) break;
      if (marker === 0xE1 && len >= 10
          && v.getUint32(o + 4) === 0x45786966 /* "Exif" */ && v.getUint16(o + 8) === 0) {
        return readTiffGps(v, o + 10, o + 2 + len);
      }
      o += 2 + len;
    }
  } catch (e) { /* malformed file = no GPS */ }
  return null;
}

function readTiffGps(v, t, end) {
  const bom = v.getUint16(t);
  const le = bom === 0x4949; // "II" little-endian, "MM" big-endian
  if (!le && bom !== 0x4D4D) return null;
  const u16 = (p) => v.getUint16(p, le), u32 = (p) => v.getUint32(p, le);
  if (u16(t + 2) !== 42) return null;

  // IFD0 → GPS sub-IFD pointer (tag 0x8825)
  let gps = null;
  const ifd0 = t + u32(t + 4);
  if (ifd0 + 2 > end) return null;
  const n0 = u16(ifd0);
  for (let i = 0; i < n0; i++) {
    const e = ifd0 + 2 + i * 12;
    if (e + 12 > end) return null;
    if (u16(e) === 0x8825) { gps = t + u32(e + 8); break; }
  }
  if (gps == null || gps + 2 > end) return null;

  const rational = (p) => {
    if (p + 8 > end) return null;
    const den = u32(p + 4);
    return den ? u32(p) / den : null;
  };
  const dms = (entry) => { // 3 RATIONALs (24 bytes → always stored at offset)
    const p = t + u32(entry + 8);
    const d = rational(p), m = rational(p + 8), s = rational(p + 16);
    return (d == null || m == null || s == null) ? null : d + m / 60 + s / 3600;
  };

  let latRef = null, lngRef = null, lat = null, lng = null, heading = null, acc = null;
  const ng = u16(gps);
  for (let i = 0; i < ng; i++) {
    const e = gps + 2 + i * 12;
    if (e + 12 > end) return null;
    const tag = u16(e);
    if (tag === 0x0001) latRef = String.fromCharCode(v.getUint8(e + 8));
    else if (tag === 0x0002) lat = dms(e);
    else if (tag === 0x0003) lngRef = String.fromCharCode(v.getUint8(e + 8));
    else if (tag === 0x0004) lng = dms(e);
    else if (tag === 0x0011) heading = rational(t + u32(e + 8)); // GPSImgDirection
    else if (tag === 0x001F) acc = rational(t + u32(e + 8));     // GPSHPositioningError
  }

  if (lat == null || lng == null) return null;
  if (latRef === 'S') lat = -lat;
  if (lngRef === 'W') lng = -lng;
  if (!lat && !lng) return null; // exact 0,0 = stripped-but-present, not the Atlantic
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return {
    lat, lng,
    headingDeg: heading != null && heading >= 0 && heading <= 360 ? heading % 360 : null,
    accuracyM: acc != null && acc >= 0 && acc < 100000 ? acc : null,
  };
}
