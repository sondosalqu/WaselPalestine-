const {
  verifyReportService,
  rejectReportService,
  closeReportService,
  markReportAsDuplicateService,
  getModerationActionsByReportService,
  getPendingReportsService,
} = require("../services/moderationService");


const verifyReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const moderatorId = Number(req.user?.user_id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    if (!Number.isInteger(moderatorId) || moderatorId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid moderator user",
        error: "Unauthorized",
      });
    }

    return await verifyReportService(reportId, moderatorId, res);
  } catch (err) {
    console.error("verifyReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify report",
      error: err.message,
    });
  }
};

// PATCH /api/v1/reports/:id/reject
const rejectReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const moderatorId = Number(req.user?.user_id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    if (!Number.isInteger(moderatorId) || moderatorId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid moderator user",
        error: "Unauthorized",
      });
    }

    return await rejectReportService(reportId, moderatorId, res);
  } catch (err) {
    console.error("rejectReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reject report",
      error: err.message,
    });
  }
};

// PATCH /api/v1/reports/:id/close
const closeReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const moderatorId = Number(req.user?.user_id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    if (!Number.isInteger(moderatorId) || moderatorId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid moderator user",
        error: "Unauthorized",
      });
    }

    return await closeReportService(reportId, moderatorId, res);
  } catch (err) {
    console.error("closeReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to close report",
      error: err.message,
    });
  }
};

// PATCH /api/v1/reports/:id/mark-duplicate
const markReportAsDuplicate = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const moderatorId = Number(req.user?.user_id);
    const duplicate_of_report_id = Number(req.body?.duplicate_of_report_id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    if (!Number.isInteger(moderatorId) || moderatorId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid moderator user",
        error: "Unauthorized",
      });
    }

    if (!Number.isInteger(duplicate_of_report_id) || duplicate_of_report_id <= 0) {
      return res.status(400).json({
        success: false,
        message: "duplicate_of_report_id is required and must be a positive integer",
        error: "Bad Request",
      });
    }

    if (reportId === duplicate_of_report_id) {
      return res.status(400).json({
        success: false,
        message: "A report cannot be marked as duplicate of itself",
        error: "Bad Request",
      });
    }

    return await markReportAsDuplicateService(reportId, moderatorId, duplicate_of_report_id, res);
  } catch (err) {
    console.error("markReportAsDuplicate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark report as duplicate",
      error: err.message,
    });
  }
};

const getModerationActionsByReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    return await getModerationActionsByReportService(reportId, res);
  } catch (err) {
    console.error("getModerationActionsByReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch moderation actions",
      error: err.message,
    });
  }
};

const getPendingReports = async (req, res) => {
  try {
    return await getPendingReportsService(res);
  } catch (err) {
    console.error("getPendingReports error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending reports",
      error: err.message,
    });
  }
};

module.exports = {
  verifyReport,
  rejectReport,
  closeReport,
  markReportAsDuplicate,
  getModerationActionsByReport,
  getPendingReports,
};