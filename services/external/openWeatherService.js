const axios = require("axios");
const { getCache, setCache } = require("../../utils/routeUtils");

const WEATHER_TTL_MS = 10 * 60 * 1000; 

const weatherClient = axios.create({
  baseURL:
    process.env.OPENWEATHER_BASE_URL ||
    "https://api.openweathermap.org/data/2.5",
  timeout: 10000,
});

function buildWeatherCacheKey(lat, lng) {
  return `openweather:${Number(lat).toFixed(4)}:${Number(lng).toFixed(4)}`;
}

async function getOpenWeather(lat, lng) {
  const cacheKey = buildWeatherCacheKey(lat, lng);

  const cached = getCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      cache_hit: true,
    };
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    const error = new Error("Missing OPENWEATHER_API_KEY");
    error.code = "OPENWEATHER_MISSING_KEY";
    throw error;
  }

  try {
    const response = await weatherClient.get("/weather", {
      params: {
        lat,
        lon: lng,
        appid: apiKey,
        units: "metric",
        lang: "ar",
      },
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
      const rateError = new Error("OpenWeather rate limit exceeded");
      rateError.code = "OPENWEATHER_RATE_LIMIT";
      rateError.status = 429;
      throw rateError;
    }

    if (status === 401 || status === 403) {
      const authError = new Error("OpenWeather authentication failed");
      authError.code = "OPENWEATHER_AUTH_ERROR";
      authError.status = status;
      throw authError;
    }

    if (err.code === "ECONNABORTED") {
      const timeoutError = new Error("OpenWeather request timeout");
      timeoutError.code = "OPENWEATHER_TIMEOUT";
      throw timeoutError;
    }

    const genericError = new Error(
      err.response?.data?.message || err.message || "OpenWeather request failed"
    );
    genericError.code = "OPENWEATHER_REQUEST_FAILED";
    genericError.status = status || 500;
    throw genericError;
  }
}

function getWeatherDurationMultiplier(weather) {
  if (!weather?.main) return 1;

  const main = String(weather.main).toLowerCase();
  const wind = Number(weather.wind_mps || 0);

  if (main.includes("thunderstorm")) return 1.3;
  if (main.includes("rain") || main.includes("drizzle")) return 1.2;
  if (main.includes("snow")) return 1.35;
  if (main.includes("fog") || main.includes("mist") || main.includes("haze")) {
    return 1.15;
  }
  if (wind >= 10) return 1.1;

  return 1;
}

module.exports = {
  getOpenWeather,
  getWeatherDurationMultiplier,
};