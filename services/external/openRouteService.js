const axios = require("axios");
const { getCache, setCache } = require("../../utils/routeUtils");

const ROUTE_TTL_MS = 10 * 60 * 1000; 

const orsClient = axios.create({
  baseURL:
    process.env.ORS_BASE_URL || "https://api.openrouteservice.org",
  timeout: 10000,
  headers: {
    Authorization: process.env.ORS_API_KEY || "",
    "Content-Type": "application/json",
    Accept: "application/json, application/geo+json, application/gpx+xml",
  },
});

function buildRouteCacheKey({
  originLat,
  originLng,
  destLat,
  destLng,
  profile = "driving-car",
}) {
  return `ors-route:${profile}:${Number(originLat).toFixed(5)}:${Number(
    originLng
  ).toFixed(5)}:${Number(destLat).toFixed(5)}:${Number(destLng).toFixed(5)}`;
}

async function getRouteFromORS({
  originLat,
  originLng,
  destLat,
  destLng,
  profile = "driving-car",
}) {
  const cacheKey = buildRouteCacheKey({
    originLat,
    originLng,
    destLat,
    destLng,
    profile,
  });

  const cached = getCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      cache_hit: true,
    };
  }

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

    const response = await orsClient.post(
      `/v2/directions/${profile}/geojson`,
      body
    );

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
      const rateError = new Error("ORS rate limit exceeded");
      rateError.code = "ORS_RATE_LIMIT";
      rateError.status = 429;
      throw rateError;
    }

    if (status === 401 || status === 403) {
      const authError = new Error("ORS authentication failed");
      authError.code = "ORS_AUTH_ERROR";
      authError.status = status;
      throw authError;
    }

    if (err.code === "ECONNABORTED") {
      const timeoutError = new Error("ORS request timeout");
      timeoutError.code = "ORS_TIMEOUT";
      throw timeoutError;
    }

    const genericError = new Error(
      err.response?.data?.error?.message ||
        err.message ||
        "ORS request failed"
    );
    genericError.code = "ORS_REQUEST_FAILED";
    genericError.status = status || 500;
    throw genericError;
  }
}

module.exports = {
  getRouteFromORS,
};