// ─── Coordinate helpers ───────────────────────────────────────────────────────

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isValidLat(lat) {
  return typeof lat === "number" && lat >= -90 && lat <= 90;
}

function isValidLng(lng) {
  return typeof lng === "number" && lng >= -180 && lng <= 180;
}

function toPositiveIntOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ─── Distance calculation ─────────────────────────────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (Number(x) * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLon = toRad(Number(lon2) - Number(lon1));

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// ─── In-memory API cache ──────────────────────────────────────────────────────

const cache = new Map();

function getCache(key) {
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCache(key, value, ttlMs) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function deleteCache(key) {
  cache.delete(key);
}

function clearCache() {
  cache.clear();
}

module.exports = {
  toNumberOrNull,
  isValidLat,
  isValidLng,
  toPositiveIntOrNull,
  haversineKm,
  getCache,
  setCache,
  deleteCache,
  clearCache,
};
