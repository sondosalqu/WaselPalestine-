
const { Report } = require("../models");

// POST /api/v1/reports
const createReport = async (req, res) => {
  try {
    const {
      user_id,
      checkpoint_id = null,
      report_lat,
      report_lng,
      category,
      description,
    } = req.body;

    
    if (!user_id || report_lat === undefined || report_lng === undefined || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "user_id, report_lat, report_lng, category, description are required",
        error: "Bad Request",
      });
    }

    const lat = Number(report_lat);
    const lng = Number(report_lng);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "report_lat must be a valid number between -90 and 90",
        error: "Bad Request",
      });
    }

    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "report_lng must be a valid number between -180 and 180",
        error: "Bad Request",
      });
    }

    const newReport = await Report.create({
      user_id,
      checkpoint_id,
      report_lat: lat,
      report_lng: lng,
      category,
      description,
      
    });

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: newReport,
    });
  } catch (err) {
    console.error("createReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: err.message,
    });
  }
};

module.exports = { createReport };