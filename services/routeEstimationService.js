

const { v4: uuidv4 } = require("uuid");
const {
  RouteRequest,
  RouteRequestConstraint,
  RouteConstraintType,
  RouteResult,
} = require("../models");

const { getRouteFromORS } = require("./external/openRouteService");
const { getOpenWeather } = require("./external/openWeatherService");
const { haversineKm } = require("../utils/routeUtils");



function getWeatherDurationMultiplier(weather) {
  if (!weather?.main) return 1;

  const main = String(weather.main).toLowerCase();
  const wind = Number(weather.wind_mps || 0);

  if (main.includes("thunderstorm")) return 1.3;
  if (main.includes("rain") || main.includes("drizzle")) return 1.2;
  if (main.includes("snow")) return 1.35;
  if (main.includes("fog") || main.includes("mist") || main.includes("haze")) return 1.15;
  if (wind >= 10) return 1.1;

  return 1;
}



async function calculateRouteForRequest(route_req_id, user_id) {
  if (!user_id) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const routeReq = await RouteRequest.findByPk(route_req_id);
  if (!routeReq) {
    const error = new Error("Route request not found");
    error.status = 404;
    throw error;
  }

  if (routeReq.user_id && String(routeReq.user_id) !== String(user_id)) {
    const error = new Error("Forbidden: not your route request");
    error.status = 403;
    throw error;
  }

  const constraints = await RouteRequestConstraint.findAll({
    where: { route_req_id },
    include: [{ model: RouteConstraintType, as: "type" }],
  });

  const appliedConstraints = constraints.map((c) => ({
    type: c.type?.name || null,
    area_id: c.area_id,
    checkpoint_id: c.checkpoint_id,
  }));

  let checkpointPenaltyKm = 0, areaPenaltyKm = 0;
  let checkpointPenaltyMin = 0, areaPenaltyMin = 0;

  for (const c of constraints) {
    const type = c.type?.name;
    if (type === "avoid_checkpoint") { checkpointPenaltyKm += 2; checkpointPenaltyMin += 6; }
    if (type === "avoid_area")       { areaPenaltyKm += 4;        areaPenaltyMin += 10; }
  }

  let baseDistanceKm, baseDurationMin;
  let routingSource = "external", routingProvider = "openrouteservice";
  let routingCacheHit = false, routingStatus = 200, routingFallbackReason = null;

  try {
    const routeData = await getRouteFromORS({
      originLat: routeReq.origin_lat,
      originLng: routeReq.origin_lng,
      destLat: routeReq.dest_lat,
      destLng: routeReq.dest_lng,
      profile: "driving-car",
    });

    baseDistanceKm  = routeData.distance_km;
    baseDurationMin = routeData.duration_min;
    routingCacheHit = routeData.cache_hit;
    routingStatus   = routeData.upstream_status;
  } catch (routeError) {
    baseDistanceKm  = haversineKm(routeReq.origin_lat, routeReq.origin_lng, routeReq.dest_lat, routeReq.dest_lng);
    baseDurationMin = (baseDistanceKm / 40) * 60;
    routingSource   = "heuristic_fallback";
    routingProvider = "internal-haversine";
    routingStatus   = routeError.status || 500;
    routingFallbackReason = routeError.message;
  }

  let weather_origin = null, weather_dest = null;
  let weatherAvailable = true, weatherNote = null;
  let weatherOriginCacheHit = false, weatherDestCacheHit = false;
  let weatherOriginStatus = 200, weatherDestStatus = 200;

  try {
    const [originWeather, destWeather] = await Promise.all([
      getOpenWeather(routeReq.origin_lat, routeReq.origin_lng),
      getOpenWeather(routeReq.dest_lat, routeReq.dest_lng),
    ]);

    weather_origin = originWeather;
    weather_dest   = destWeather;
    weatherOriginCacheHit = originWeather.cache_hit;
    weatherDestCacheHit   = destWeather.cache_hit;
    weatherOriginStatus   = originWeather.upstream_status || 200;
    weatherDestStatus     = destWeather.upstream_status || 200;
  } catch (weatherError) {
    weatherAvailable    = false;
    weatherNote         = "Weather provider unavailable. Estimation continued without external weather impact.";
    weatherOriginStatus = weatherError.status || 500;
    weatherDestStatus   = weatherError.status || 500;
  }


  const weatherMultiplier = weatherAvailable
    ? Math.max(
        getWeatherDurationMultiplier(weather_origin),
        getWeatherDurationMultiplier(weather_dest)
      )
    : 1;

  const weatherAdjustedBaseMin = baseDurationMin * weatherMultiplier;
  const weatherPenaltyMin      = weatherAdjustedBaseMin - baseDurationMin;
  const finalDistanceKm        = baseDistanceKm + checkpointPenaltyKm + areaPenaltyKm;
  const finalDurationMin       = weatherAdjustedBaseMin + checkpointPenaltyMin + areaPenaltyMin;


  const metadata = {
    estimation_method: routingSource === "external" ? "external-routing-plus-heuristics" : "heuristic-fallback",
    note: "Estimated using external routing when available, constraints penalties, and weather impact when available.",
    providers: {
      routing_provider: routingProvider,
      weather_provider: "openweather",
    },
    routing: {
      source: routingSource,
      fallback_reason: routingFallbackReason,
      profile: "driving-car",
    },
    weather_available: weatherAvailable,
    weather_note: weatherNote,
    factors_applied: {
      avoid_checkpoint_count: appliedConstraints.filter((c) => c.type === "avoid_checkpoint").length,
      avoid_area_count:       appliedConstraints.filter((c) => c.type === "avoid_area").length,
      weather_multiplier:     Number(weatherMultiplier.toFixed(2)),
    },
    cache: {
      route_hit:          routingCacheHit,
      weather_origin_hit: weatherOriginCacheHit,
      weather_dest_hit:   weatherDestCacheHit,
    },
    upstream_status: {
      routing:             routingStatus,
      weather_origin:      weatherOriginStatus,
      weather_destination: weatherDestStatus,
    },
    breakdown: {
      base_distance_km:       Number(baseDistanceKm.toFixed(3)),
      checkpoint_penalty_km:  Number(checkpointPenaltyKm.toFixed(3)),
      area_penalty_km:        Number(areaPenaltyKm.toFixed(3)),
      final_distance_km:      Number(finalDistanceKm.toFixed(3)),
      base_duration_min:      Number(baseDurationMin.toFixed(2)),
      weather_penalty_min:    Number(weatherPenaltyMin.toFixed(2)),
      checkpoint_penalty_min: Number(checkpointPenaltyMin.toFixed(2)),
      area_penalty_min:       Number(areaPenaltyMin.toFixed(2)),
      final_duration_min:     Number(finalDurationMin.toFixed(2)),
    },
    weather: { origin: weather_origin, destination: weather_dest },
    constraints: appliedConstraints,
  };

  const created = await RouteResult.create({
    route_result_id: uuidv4(),
    route_req_id,
    est_distance_km: Number(finalDistanceKm.toFixed(3)),
    est_duration_min: Number(finalDurationMin.toFixed(2)),
    provider_id:
      routingSource === "external"
        ? "openrouteservice+openweather"
        : "heuristic-routing+openweather",
    calculated_at: new Date(),
    metadata,
  });

  return { routingSource, weatherAvailable, data: created };
}

module.exports = { calculateRouteForRequest };