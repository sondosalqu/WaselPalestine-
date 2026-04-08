

const axios = require("axios");
const { getCache, setCache } = require("../../utils/cache");

const ROUTE_TTL_MS = 10 * 60 * 1000;

const orsClient = axios.create({
  baseURL: process.env.ORS_BASE_URL || "https://api.openrouteservice.org",
  timeout: 10000,
  headers: {
    Authorization: process.env.ORS_API_KEY || "",
    "Content-Type": "application/json",
    Accept: "application/json, application/geo+json, application/gpx+xml",
  },
});

function buildRouteCacheKey({ originLat, originLng, destLat, destLng, profile = "driving-car" }) {
  return `ors-route:${profile}:${Number(originLat).toFixed(5)}:${Number(originLng).toFixed(5)}:${Number(destLat).toFixed(5)}:${Number(destLng).toFixed(5)}`;
}

async function getRouteFromORS({ originLat, originLng, destLat, destLng, profile = "driving-car" }) {
  const cacheKey = buildRouteCacheKey({ originLat, originLng, destLat, destLng, profile });

  const cached = getCache(cacheKey);
  if (cached) return { ...cached, cache_hit: true };

  if (!process.env.ORS_API_KEY) {
    const error = new Error("Missing ORS_API_KEY");
    error.code = "ORS_MISSING_KEY";
    throw error;
  }

  try {
    const body = {
      coordinates: [
        [Number(originLng), Number(originLat)],
        [Number(destLng), Number(destLat)],
      ],
    };

    const response = await orsClient.post(`/v2/directions/${profile}/geojson`, body);
    const feature = response.data?.features?.[0];
    const summary = feature?.properties?.summary;

    if (!summary) {
      const error = new Error("Invalid response from ORS");
      error.code = "ORS_INVALID_RESPONSE";
      throw error;
    }

    const result = {
      source: "external",
      provider: "openrouteservice",
      profile,
      distance_km: Number((summary.distance / 1000).toFixed(3)),
      duration_min: Number((summary.duration / 60).toFixed(2)),
      raw_summary: summary,
      cache_hit: false,
      upstream_status: response.status,
    };

    setCache(cacheKey, result, ROUTE_TTL_MS);
    return result;
  } catch (err) {
    const status = err.response?.status;

    if (status === 429) {
      const e = new Error("ORS rate limit exceeded");
      e.code = "ORS_RATE_LIMIT"; e.status = 429; throw e;
    }
    if (status === 401 || status === 403) {
      const e = new Error("ORS authentication failed");
      e.code = "ORS_AUTH_ERROR"; e.status = status; throw e;
    }
    if (err.code === "ECONNABORTED") {
      const e = new Error("ORS request timeout");
      e.code = "ORS_TIMEOUT"; throw e;
    }

    const e = new Error(err.response?.data?.error?.message || err.message || "ORS request failed");
    e.code = "ORS_REQUEST_FAILED"; e.status = status || 500;
    throw e;
  }
}

module.exports = { getRouteFromORS };