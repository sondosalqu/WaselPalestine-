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

  
    const { origin_lat, origin_lng, dest_lat, dest_lng, constraints = [] } =
      req.body;

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

   
    if (!Array.isArray(constraints)) {
      return res.status(400).json({
        success: false,
        message: "constraints must be an array",
      });
    }

    let savedConstraints = 0;

    if (constraints.length > 0) {
      
      const [typeRows] = await db.query(
        `SELECT constraint_type_id, name
         FROM route_constraint_type
         WHERE name IN ('avoid_area','avoid_checkpoint')`
      );

      const typeMap = new Map(typeRows.map((r) => [r.name, r.constraint_type_id]));

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

        const area_id = c?.area_id ?? null;
        const checkpoint_id = c?.checkpoint_id ?? null;

       
        if (type === "avoid_area") {
          if (!area_id || checkpoint_id !== null) {
            return res.status(400).json({
              success: false,
              message:
                "avoid_area requires area_id and must not include checkpoint_id",
            });
          }
        }

        if (type === "avoid_checkpoint") {
          if (checkpoint_id === null || checkpoint_id === undefined || area_id) {
            return res.status(400).json({
              success: false,
              message:
                "avoid_checkpoint requires checkpoint_id and must not include area_id",
            });
          }
        }

        await db.query(
          `INSERT INTO route_request_constraint
            (id, route_req_id, constraint_type_id, area_id, checkpoint_id)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), route_req_id, constraint_type_id, area_id, checkpoint_id]
        );

        savedConstraints++;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Route request created",
      data: {
        route_req_id,
        saved_constraints_count: savedConstraints,
      },
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