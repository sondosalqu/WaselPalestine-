const {
  Report,
  ModerationAction,
  DuplicateReportGroup,
  DuplicateReportItem,
} = require("../models");

async function logModerationAction({
  action_type,
  target_type = "report",
  report_id = null,
  performed_by,
  old_value = null,
  new_value = null,
}) {
  await ModerationAction.create({
    action_type,
    target_type,
    report_id,
    performed_by,
    old_value: old_value ? JSON.stringify(old_value) : null,
    new_value: new_value ? JSON.stringify(new_value) : null,
  });
}

// PATCH /api/v1/reports/:id/verify
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

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
        error: "Not Found",
      });
    }

    const oldValue = {
      status: report.status,
    };

    report.status = "verified";
    await report.save();

    await logModerationAction({
      action_type: "verify",
      target_type: "report",
      report_id: report.report_id,
      performed_by: moderatorId,
      old_value: oldValue,
      new_value: { status: report.status },
    });

    return res.status(200).json({
      success: true,
      message: "Report verified successfully",
      data: report,
    });
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

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
        error: "Not Found",
      });
    }

    const oldValue = {
      status: report.status,
    };

    report.status = "rejected";
    await report.save();

    await logModerationAction({
      action_type: "reject",
      target_type: "report",
      report_id: report.report_id,
      performed_by: moderatorId,
      old_value: oldValue,
      new_value: { status: report.status },
    });

    return res.status(200).json({
      success: true,
      message: "Report rejected successfully",
      data: report,
    });
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

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
        error: "Not Found",
      });
    }

    const oldValue = {
      status: report.status,
    };

    report.status = "closed";
    await report.save();

    await logModerationAction({
      action_type: "close",
      target_type: "report",
      report_id: report.report_id,
      performed_by: moderatorId,
      old_value: oldValue,
      new_value: { status: report.status },
    });

    return res.status(200).json({
      success: true,
      message: "Report closed successfully",
      data: report,
    });
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

    const sourceReport = await Report.findByPk(reportId);
    const targetReport = await Report.findByPk(duplicate_of_report_id);

    if (!sourceReport || !targetReport) {
      return res.status(404).json({
        success: false,
        message: "One or both reports were not found",
        error: "Not Found",
      });
    }

    let groupItem = await DuplicateReportItem.findOne({
      where: { report_id: duplicate_of_report_id },
    });

    let groupId;

    if (groupItem) {
      groupId = groupItem.group_id;
    } else {
      const group = await DuplicateReportGroup.create({});
      groupId = group.group_id;

      await DuplicateReportItem.create({
        group_id: groupId,
        report_id: duplicate_of_report_id,
      });
    }

    const existingSourceItem = await DuplicateReportItem.findOne({
      where: { report_id: reportId },
    });

    if (!existingSourceItem) {
      await DuplicateReportItem.create({
        group_id: groupId,
        report_id: reportId,
      });
    }

    const oldValue = {
      status: sourceReport.status,
    };

    sourceReport.status = "rejected";
    await sourceReport.save();

    await logModerationAction({
      action_type: "mark_duplicate",
      target_type: "duplicate_group",
      report_id: sourceReport.report_id,
      performed_by: moderatorId,
      old_value: oldValue,
      new_value: {
        status: sourceReport.status,
        duplicate_of_report_id,
        group_id: groupId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Report marked as duplicate successfully",
      data: {
        report_id: sourceReport.report_id,
        duplicate_of_report_id,
        group_id: groupId,
        status: sourceReport.status,
      },
    });
  } catch (err) {
    console.error("markReportAsDuplicate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark report as duplicate",
      error: err.message,
    });
  }
};

module.exports = {
  verifyReport,
  rejectReport,
  closeReport,
  markReportAsDuplicate,
};