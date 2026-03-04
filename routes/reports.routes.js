const express = require("express");
const router = express.Router();

const { Report, Checkpoint, User } = require("../models");

// Helpers
function toNumberOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isValidLat(lat) {
  return typeof lat === "number" && lat >= -90 && lat <= 90;
}

function isValidLng(lng) {
  return typeof lng === "number" && lng >= -180 && lng <= 180;
}

// GET /api/v1/reports
router.get("/", async (req, res) => {
  try {
    const include = [];

    if (User) {
      include.push({
        model: User,
        attributes: ["user_id", "name", "email"],
      });
    }

    //  prevent crash if Checkpoint model is missing
    if (Checkpoint) {
      include.push({
        model: Checkpoint,
        attributes: ["checkpoint_id", "checkpoint_name", "current_status", "lat", "lng"],
        required: false,
      });
    }

    const reports = await Report.findAll({
      include,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      count: reports.length,
      reports,
    });
  } catch (err) {
    console.error("GET /reports error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: err.message,
    });
  }
});

//  POST /api/v1/reports
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      checkpoint_id,
      category,
      description,
      report_lat,
      report_lng,
    } = req.body;

    // user_id
    const finalUserId = Number(user_id);
    if (!Number.isInteger(finalUserId) || finalUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id",
        error: "Bad Request",
      });
    }

    // category + description
    if (!category || typeof category !== "string" || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "category is required",
        error: "Bad Request",
      });
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "description is required",
        error: "Bad Request",
      });
    }

    // location (required)
    const lat = toNumberOrNull(report_lat);
    const lng = toNumberOrNull(report_lng);

    if (lat === null || lng === null) {
      return res.status(400).json({
        success: false,
        message: "report_lat and report_lng are required and must be numbers",
        error: "Bad Request",
      });
    }

    if (!isValidLat(lat) || !isValidLng(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location range (lat: -90..90, lng: -180..180)",
        error: "Bad Request",
      });
    }

    // checkpoint_id optional
    const finalCheckpointId = toNumberOrNull(checkpoint_id);
    if (finalCheckpointId !== null && (!Number.isInteger(finalCheckpointId) || finalCheckpointId <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint_id",
        error: "Bad Request",
      });
    }

    //  verify user exists (recommended)
    if (User) {
      const u = await User.findByPk(finalUserId);
      if (!u) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: "Not Found",
        });
      }
    }

    //  verify checkpoint exists (if provided)
    if (finalCheckpointId !== null && Checkpoint) {
      const cp = await Checkpoint.findByPk(finalCheckpointId);
      if (!cp) {
        return res.status(404).json({
          success: false,
          message: "Checkpoint not found",
          error: "Not Found",
        });
      }
    }

    const newReport = await Report.create({
      user_id: finalUserId,
      checkpoint_id: finalCheckpointId,
      category: category.trim(),
      description: description.trim(),
      report_lat: lat,
      report_lng: lng,
      // status, confidence_score, votes_count defaults from DB/model
    });

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: newReport,
    });
  } catch (err) {
    console.error("POST /reports error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: err.message,
    });
  }
});

module.exports = router;