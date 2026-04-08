

const axios = require("axios");
const { getCache, setCache } = require("../../utils/cache");

const WEATHER_TTL_MS = 10 * 60 * 1000;

const weatherClient = axios.create({
  baseURL: process.env.OPENWEATHER_BASE_URL || "https://api.openweathermap.org/data/2.5",
  timeout: 10000,
});

function buildWeatherCacheKey(lat, lng) {
  return `openweather:${Number(lat).toFixed(4)}:${Number(lng).toFixed(4)}`;
}

async function getOpenWeather(lat, lng) {
  const cacheKey = buildWeatherCacheKey(lat, lng);

  const cached = getCache(cacheKey);
  if (cached) return { ...cached, cache_hit: true };

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    const error = new Error("Missing OPENWEATHER_API_KEY");
    error.code = "OPENWEATHER_MISSING_KEY";
    throw error;
  }

  try {
    const response = await weatherClient.get("/weather", {
      params: { lat, lon: lng, appid: apiKey, units: "metric", lang: "ar" },
    });

    const d = response.data;

    const result = {
      provider: "openweather",
      temp_c: d?.main?.temp ?? null,
      feels_like_c: d?.main?.feels_like ?? null,
      humidity: d?.main?.humidity ?? null,
      wind_mps: d?.wind?.speed ?? null,
      description: d?.weather?.[0]?.description ?? null,
      main: d?.weather?.[0]?.main ?? null,
      city: d?.name ?? null,
      cache_hit: false,
      upstream_status: response.status,
    };

    setCache(cacheKey, result, WEATHER_TTL_MS);
    return result;
  } catch (err) {
    const status = err.response?.status;

    if (status === 429) {
      const e = new Error("OpenWeather rate limit exceeded");
      e.code = "OPENWEATHER_RATE_LIMIT"; e.status = 429; throw e;
    }
    if (status === 401 || status === 403) {
      const e = new Error("OpenWeather authentication failed");
      e.code = "OPENWEATHER_AUTH_ERROR"; e.status = status; throw e;
    }
    if (err.code === "ECONNABORTED") {
      const e = new Error("OpenWeather request timeout");
      e.code = "OPENWEATHER_TIMEOUT"; throw e;
    }

    const e = new Error(err.response?.data?.message || err.message || "OpenWeather request failed");
    e.code = "OPENWEATHER_REQUEST_FAILED"; e.status = status || 500;
    throw e;
  }
}

module.exports = { getOpenWeather };