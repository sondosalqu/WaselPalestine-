const db = require("../config/db.js");

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

    const [routeRequestRows] = await db.query(
      `SELECT *
       FROM route_request
       WHERE route_req_id = ? AND user_id = ?`,
      [route_req_id, user_id]
    );

    if (!routeRequestRows.length) {
      return res.status(404).json({
        success: false,
        message: "Route request not found",
      });
    }

    const [resultRows] = await db.query(
      `SELECT *
       FROM route_result
       WHERE route_req_id = ?
       ORDER BY calculated_at DESC
       LIMIT 1`,
      [route_req_id]
    );

    const [constraintRows] = await db.query(
      `SELECT
          rrc.id,
          rrc.route_req_id,
          rrc.area_id,
          rrc.checkpoint_id,
          rct.name AS constraint_type
       FROM route_request_constraint rrc
       JOIN route_constraint_type rct
         ON rrc.constraint_type_id = rct.constraint_type_id
       WHERE rrc.route_req_id = ?`,
      [route_req_id]
    );

    return res.status(200).json({
      success: true,
      message: "Route details fetched",
      data: {
        route_request: routeRequestRows[0],
        constraints: constraintRows,
        result: resultRows[0] || null,
      },
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