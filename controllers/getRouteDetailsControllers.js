
const { getRouteDetailsById } = require("../services/routeQueryService");

const getRouteDetails = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing user in token",
      });
    }

    const { route_req_id } = req.params;

    if (!route_req_id) {
      return res.status(400).json({
        success: false,
        message: "route_req_id is required",
      });
    }

    const data = await getRouteDetailsById(route_req_id, user_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Route request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Route details fetched",
      data,
    });
  } catch (error) {
    console.error("Error fetching route details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch route details",
      error: error.message,
    });
  }
};

module.exports = { getRouteDetails };