const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const {
  RouteRequest,
  RouteRequestConstraint,
  RouteConstraintType,
  RouteResult,
} = require("../models");

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

async function getOpenWeather(lat, lng) {
  const base = process.env.OPENWEATHER_BASE_URL || "https://api.openweathermap.org/data/2.5";
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENWEATHER_API_KEY");

  const url = `${base}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=ar`;
  const resp = await axios.get(url, { timeout: 15000 });

  const d = resp.data;
  return {
    temp_c: d?.main?.temp,
    feels_like_c: d?.main?.feels_like,
    humidity: d?.main?.humidity,
    wind_mps: d?.wind?.speed,
    description: d?.weather?.[0]?.description,
    main: d?.weather?.[0]?.main,
    city: d?.name,
  };
}

const calculateRoute = async (req, res) => {
  try {
    // JWT
    const user_id = req.user?.user_id || req.user?.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { route_req_id } = req.params;

    const routeReq = await RouteRequest.findByPk(route_req_id);
    if (!routeReq) {
      return res.status(404).json({
        success: false,
        message: "Route request not found",
      });
    }

    if (routeReq.user_id && String(routeReq.user_id) !== String(user_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: not your route request",
      });
    }

  
    const constraints = await RouteRequestConstraint.findAll({
      where: { route_req_id },
      include: [{ model: RouteConstraintType, as: "type" }],
    });

    
    const distKm = haversineKm(
      routeReq.origin_lat,
      routeReq.origin_lng,
      routeReq.dest_lat,
      routeReq.dest_lng
    );

    const durationMin = (distKm / 40) * 60;

    const [weather_origin, weather_dest] = await Promise.all([
      getOpenWeather(routeReq.origin_lat, routeReq.origin_lng),
      getOpenWeather(routeReq.dest_lat, routeReq.dest_lng),
    ]);

   
    const created = await RouteResult.create({
      route_result_id: uuidv4(),
      route_req_id,
      est_distance_km: Number(distKm.toFixed(3)),
      est_duration_min: Number(durationMin.toFixed(2)),
      provider_id: "POC+OpenWeather", 
      calculated_at: new Date(),
      metadata: {
        note: "Distance/duration are POC estimates (no routing provider yet).",
        weather: {
          origin: weather_origin,
          destination: weather_dest,
        },
        constraints: constraints.map((c) => ({
          type: c.type?.name,
          area_id: c.area_id,
          checkpoint_id: c.checkpoint_id,
        })),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Route calculated (POC) + weather fetched",
      data: created,
    });
  } catch (error) {
    console.error("calculateRoute error:", error);

  
    const msg = String(error.message || "");
    const isWeatherIssue = msg.includes("OPENWEATHER") || msg.includes("OpenWeather") || msg.includes("timeout");

    return res.status(isWeatherIssue ? 502 : 500).json({
      success: false,
      message: isWeatherIssue ? "Weather provider failed" : "Failed to calculate route",
      error: error.message,
    });
  }
};

module.exports = { calculateRoute };