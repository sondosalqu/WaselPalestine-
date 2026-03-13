const db = require("../config/db.js");
const { v4: uuidv4 } = require("uuid");

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isValidLat(lat) {
  return typeof lat === "number" && lat >= -90 && lat <= 90;
}

function isValidLng(lng) {
  return typeof lng === "number" && lng >= -180 && lng <= 180;
}

function toPositiveIntOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const createstimateRoute = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing user in token",
      });
    }

    const {
      origin_lat,
      origin_lng,
      dest_lat,
      dest_lng,
      constraints = [],
    } = req.body;

    if (
      origin_lat === undefined ||
      origin_lng === undefined ||
      dest_lat === undefined ||
      dest_lng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "origin_lat, origin_lng, dest_lat, dest_lng are required",
      });
    }

    const originLat = toNumberOrNull(origin_lat);
    const originLng = toNumberOrNull(origin_lng);
    const destLat = toNumberOrNull(dest_lat);
    const destLng = toNumberOrNull(dest_lng);

    if (
      originLat === null ||
      originLng === null ||
      destLat === null ||
      destLng === null
    ) {
      return res.status(400).json({
        success: false,
        message: "All coordinates must be valid numbers",
      });
    }

    if (
      !isValidLat(originLat) ||
      !isValidLng(originLng) ||
      !isValidLat(destLat) ||
      !isValidLng(destLng)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coordinate range (lat: -90..90, lng: -180..180)",
      });
    }

    if (!Array.isArray(constraints)) {
      return res.status(400).json({
        success: false,
        message: "constraints must be an array",
      });
    }

    const [typeRows] = await db.query(
      `SELECT constraint_type_id, name
       FROM route_constraint_type
       WHERE name IN ('avoid_area', 'avoid_checkpoint')`
    );

    const typeMap = new Map(typeRows.map((r) => [r.name, r.constraint_type_id]));

    const validatedConstraints = [];

    for (const c of constraints) {
      const type = c?.type;

      if (type !== "avoid_area" && type !== "avoid_checkpoint") {
        return res.status(400).json({
          success: false,
          message: `Invalid constraint type: ${type}`,
        });
      }

      const constraint_type_id = typeMap.get(type);
      if (!constraint_type_id) {
        return res.status(500).json({
          success: false,
          message: `Constraint type not found in DB: ${type}`,
        });
      }

      const area_id = toPositiveIntOrNull(c?.area_id);
      const checkpoint_id = toPositiveIntOrNull(c?.checkpoint_id);

      if (type === "avoid_area") {
        if (area_id === null || checkpoint_id !== null) {
          return res.status(400).json({
            success: false,
            message:
              "avoid_area requires a valid area_id and must not include checkpoint_id",
          });
        }
      }

      if (type === "avoid_checkpoint") {
        if (checkpoint_id === null || area_id !== null) {
          return res.status(400).json({
            success: false,
            message:
              "avoid_checkpoint requires a valid checkpoint_id and must not include area_id",
          });
        }
      }

      validatedConstraints.push({
        id: uuidv4(),
        constraint_type_id,
        type,
        area_id,
        checkpoint_id,
      });
    }

    const route_req_id = uuidv4();

    await db.query(
      `INSERT INTO route_request
        (route_req_id, user_id, origin_lat, origin_lng, dest_lat, dest_lng)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [route_req_id, user_id, originLat, originLng, destLat, destLng]
    );

    for (const c of validatedConstraints) {
      await db.query(
        `INSERT INTO route_request_constraint
          (id, route_req_id, constraint_type_id, area_id, checkpoint_id)
         VALUES (?, ?, ?, ?, ?)`,
        [c.id, route_req_id, c.constraint_type_id, c.area_id, c.checkpoint_id]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Route request created successfully",
      data: {
        route_req_id,
        origin: {
          lat: originLat,
          lng: originLng,
        },
        destination: {
          lat: destLat,
          lng: destLng,
        },
        saved_constraints_count: validatedConstraints.length,
        constraints: validatedConstraints.map((c) => ({
          type: c.type,
          area_id: c.area_id,
          checkpoint_id: c.checkpoint_id,
        })),
      },
    });
  } catch (error) {
    console.error("Error create estimateRoute:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create route request",
      error: error.message,
    });
  }
};

module.exports = { createstimateRoute };