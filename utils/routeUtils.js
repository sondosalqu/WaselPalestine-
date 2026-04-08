

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

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (Number(x) * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLon = toRad(Number(lon2) - Number(lon1));
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

module.exports = {
  toNumberOrNull,
  isValidLat,
  isValidLng,
  toPositiveIntOrNull,
  haversineKm,
};