
const { calculateRouteForRequest } = require("../services/routeEstimationService");

const calculateRoute = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;
    const { route_req_id } = req.params;

    const result = await calculateRouteForRequest(route_req_id, user_id);

    return res.status(201).json({
      success: true,
      message:
        result.routingSource === "external"
          ? result.weatherAvailable
            ? "Route calculated successfully using external providers"
            : "Route calculated successfully using external routing (weather unavailable)"
          : "Route calculated successfully using fallback heuristics",
      data: result.data,
    });
  } catch (error) {
    console.error("calculateRoute error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to calculate route",
      error: error.message,
    });
  }
};

module.exports = { calculateRoute };