const {
  Report,
  Checkpoint,
  User,
  DuplicateReportGroup,
  DuplicateReportItem,
} = require("../models");

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

function hoursDifference(date1, date2) {
  return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
}

function isNearbyLocation(lat1, lng1, lat2, lng2, tolerance = 0.001) {
  return (
    Math.abs(Number(lat1) - Number(lat2)) <= tolerance &&
    Math.abs(Number(lng1) - Number(lng2)) <= tolerance
  );
}

async function attachReportsToDuplicateGroup(existingReportId, newReportId) {
  let existingItem = await DuplicateReportItem.findOne({
    where: { report_id: existingReportId },
  });

  let groupId;

  if (existingItem) {
    groupId = existingItem.group_id;
  } else {
    const group = await DuplicateReportGroup.create({});
    groupId = group.group_id;

    await DuplicateReportItem.create({
      group_id: groupId,
      report_id: existingReportId,
    });
  }

  const newItem = await DuplicateReportItem.findOne({
    where: { report_id: newReportId },
  });

  if (!newItem) {
    await DuplicateReportItem.create({
      group_id: groupId,
      report_id: newReportId,
    });
  }

  return groupId;
}

// GET /api/v1/reports
const getReports = async (req, res) => {
  try {
    const include = [];

    if (User) {
      include.push({
        model: User,
        attributes: ["user_id", "name", "email"],
      });
    }

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
};

// GET /api/v1/reports/:id
const getReportById = async (req, res) => {
   console.log("✅ getReportById hit:", req.params.id);
  try {
    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    const include = [];

    if (User) {
      include.push({
        model: User,
        attributes: ["user_id", "name", "email"],
      });
    }

    if (Checkpoint) {
      include.push({
        model: Checkpoint,
        attributes: ["checkpoint_id", "checkpoint_name", "current_status", "lat", "lng"],
        required: false,
      });
    }

    const report = await Report.findByPk(reportId, { include });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
        error: "Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: report,
    });
  } catch (err) {
    console.error("GET /reports/:id error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: err.message,
    });
  }
};

// POST /api/v1/reports
const createReport = async (req, res) => {
  console.log("✅ NEW createReport version is running");
  try {
    const { checkpoint_id, category, description, report_lat, report_lng } = req.body;

    const tokenUserId = Number(req.user?.user_id);

    if (!Number.isInteger(tokenUserId) || tokenUserId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid user_id",
        error: "Unauthorized",
      });
    }

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

    if (category.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "category must be at most 50 characters",
        error: "Bad Request",
      });
    }

    if (description.trim().length < 5 || description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "description must be between 5 and 1000 characters",
        error: "Bad Request",
      });
    }

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

    const finalCheckpointId = toNumberOrNull(checkpoint_id);
    if (
      finalCheckpointId !== null &&
      (!Number.isInteger(finalCheckpointId) || finalCheckpointId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint_id",
        error: "Bad Request",
      });
    }

    if (User) {
      const user = await User.findByPk(tokenUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: "Not Found",
        });
      }
    }

    if (finalCheckpointId !== null && Checkpoint) {
      const checkpoint = await Checkpoint.findByPk(finalCheckpointId);
      if (!checkpoint) {
        return res.status(404).json({
          success: false,
          message: "Checkpoint not found",
          error: "Not Found",
        });
      }
    }

    // exact same report spam prevention
    const recentDuplicate = await Report.findOne({
      where: {
        user_id: tokenUserId,
        category: category.trim(),
        description: description.trim(),
        report_lat: lat,
        report_lng: lng,
      },
      order: [["created_at", "DESC"]],
    });

    if (recentDuplicate) {
      const createdAt = new Date(recentDuplicate.created_at).getTime();
      const now = Date.now();
      const diffMinutes = (now - createdAt) / (1000 * 60);

      if (diffMinutes <= 10) {
        return res.status(409).json({
          success: false,
          message: "A very similar report was already submitted recently",
          error: "Conflict",
        });
      }
    }

    const newReport = await Report.create({
      user_id: tokenUserId,
      checkpoint_id: finalCheckpointId,
      category: category.trim(),
      description: description.trim(),
      report_lat: lat,
      report_lng: lng,
    });

    // automatic duplicate detection
    const candidateReports = await Report.findAll({
      where: {
        category: category.trim(),
      },
      order: [["created_at", "DESC"]],
    });

    let matchedDuplicateReport = null;

    for (const report of candidateReports) {
      if (Number(report.report_id) === Number(newReport.report_id)) continue;
      if (report.status === "rejected") continue;

      const reportCreatedAt = new Date(report.created_at);
      const newReportCreatedAt = new Date(newReport.created_at);

      const within24Hours = hoursDifference(reportCreatedAt, newReportCreatedAt) <= 24;
      const sameArea = isNearbyLocation(
        report.report_lat,
        report.report_lng,
        newReport.report_lat,
        newReport.report_lng
      );

      if (within24Hours && sameArea) {
        matchedDuplicateReport = report;
        break;
      }
    }

    if (matchedDuplicateReport) {
      const groupId = await attachReportsToDuplicateGroup(
        matchedDuplicateReport.report_id,
        newReport.report_id
      );

      return res.status(201).json({
        success: true,
        message: "Report created successfully and linked as a potential duplicate",
        data: {
          report: newReport,
          duplicate_detection: {
            is_duplicate_candidate: true,
            matched_report_id: matchedDuplicateReport.report_id,
            group_id: groupId,
          },
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: {
        report: newReport,
        duplicate_detection: {
          is_duplicate_candidate: false,
          matched_report_id: null,
          group_id: null,
        },
      },
    });
  } catch (err) {
    console.error("POST /reports error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: err.message,
    });
  }
};
module.exports = {
  getReports,
  getReportById,
  createReport,
};