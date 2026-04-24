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

const verifyReportService = async (reportId, moderatorId, res) => {
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
};

const rejectReportService = async (reportId, moderatorId, res) => {
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
};

const closeReportService = async (reportId, moderatorId, res) => {
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
};

const markReportAsDuplicateService = async (reportId, moderatorId, duplicate_of_report_id, res) => {
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

  sourceReport.status = "duplicate";
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
};

const getModerationActionsByReportService = async (reportId, res) => {
  const report = await Report.findByPk(reportId);
  if (!report) {
    return res.status(404).json({
      success: false,
      message: "Report not found",
      error: "Not Found",
    });
  }

  const actions = await ModerationAction.findAll({
    where: { report_id: reportId },
    order: [["performed_time", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    message: "Moderation actions fetched successfully",
    data: actions,
  });
};

const getPendingReportsService = async (res) => {
  const reports = await Report.findAll({
    where: { status: "pending" },
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    message: "Pending reports fetched successfully",
    data: reports,
  });
};

module.exports = {
  verifyReportService,
  rejectReportService,
  closeReportService,
  markReportAsDuplicateService,
  getModerationActionsByReportService,
  getPendingReportsService,
};