const db = require("../config/db.js");
const { v4: uuidv4 } = require("uuid");

const createstimateRoute = async (req, res) => {
  try {
    
    const user_id = req.user?.user_id || req.user?.id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing user in token",
      });
    }

    const { origin_lat, origin_lng, dest_lat, dest_lng } = req.body;

    if (
      origin_lat === undefined ||
      origin_lng === undefined ||
      dest_lat === undefined ||
      dest_lng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required coordinates",
      });
    }

    const route_req_id = uuidv4();

    await db.query(
      `INSERT INTO route_request
        (route_req_id, user_id, origin_lat, origin_lng, dest_lat, dest_lng)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [route_req_id, user_id, origin_lat, origin_lng, dest_lat, dest_lng]
    );

    return res.status(201).json({
      success: true,
      message: "Route request created",
      data: { route_req_id },
    });
  } catch (error) {
    console.error("Error create estimateRoute", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create estimateRoute",
      error: error.message,
    });
  }
};

module.exports = { createstimateRoute };






