const {
  fetchAllReports,
  fetchReportById,
  createNewReport,
  validateCoordinates,
  toNumberOrNull,
  AppError,
} = require("../services/reportsService");

const getReports = async (req, res) => {
  try {
    const reports = await fetchAllReports();

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      count: reports.length,
      reports,
    });
  } catch (err) {
    console.error("GET /reports error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to fetch reports",
      error: err.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    const report = await fetchReportById(reportId);

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: report,
    });
  } catch (err) {
    console.error("GET /reports/:id error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to fetch report",
      error: err.message,
    });
  }
};

const createReport = async (req, res) => {
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


    validateCoordinates(report_lat, report_lng);

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


    const result = await createNewReport({
      tokenUserId,
      checkpoint_id,
      category,
      description,
      report_lat,
      report_lng,
    });

    const isDuplicate = result.duplicate_detection.is_duplicate_candidate;

    return res.status(201).json({
      success: true,
      message: isDuplicate
        ? "Report created successfully and linked as a potential duplicate"
        : "Report created successfully",
      data: result,
    });
  } catch (err) {
    console.error("POST /reports error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to create report",
      error: err.message,
    });
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
};
