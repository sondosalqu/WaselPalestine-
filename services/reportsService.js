const {
  Report,
  Checkpoint,
  User,
  DuplicateReportGroup,
  DuplicateReportItem,
} = require("../models");

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

function buildReportIncludes() {
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

  return include;
}


class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
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

async function fetchAllReports() {
  const include = buildReportIncludes();

  const reports = await Report.findAll({
    include,
    order: [["created_at", "DESC"]],
  });

  return reports;
}

async function fetchReportById(reportId) {
  const include = buildReportIncludes();

  const report = await Report.findByPk(reportId, { include });

  if (!report) {
    throw new AppError(404, "Report not found");
  }

  return report;
}

async function createNewReport({ tokenUserId, checkpoint_id, category, description, report_lat, report_lng }) {

  if (User) {
    const user = await User.findByPk(tokenUserId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
  }

  const finalCheckpointId = toNumberOrNull(checkpoint_id);

  if (finalCheckpointId !== null && Checkpoint) {
    const checkpoint = await Checkpoint.findByPk(finalCheckpointId);
    if (!checkpoint) {
      throw new AppError(404, "Checkpoint not found");
    }
  }

  const lat = toNumberOrNull(report_lat);
  const lng = toNumberOrNull(report_lng);

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
    const diffMinutes = (Date.now() - new Date(recentDuplicate.created_at).getTime()) / (1000 * 60);
    if (diffMinutes <= 10) {
      throw new AppError(409, "A very similar report was already submitted recently");
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

  const candidateReports = await Report.findAll({
    where: { category: category.trim() },
    order: [["created_at", "DESC"]],
  });

  let matchedDuplicateReport = null;

  for (const report of candidateReports) {
    if (Number(report.report_id) === Number(newReport.report_id)) continue;
    if (report.status === "rejected") continue;

    const within24Hours =
      hoursDifference(new Date(report.created_at), new Date(newReport.created_at)) <= 24;

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

    return {
      report: newReport,
      duplicate_detection: {
        is_duplicate_candidate: true,
        matched_report_id: matchedDuplicateReport.report_id,
        group_id: groupId,
      },
    };
  }

  return {
    report: newReport,
    duplicate_detection: {
      is_duplicate_candidate: false,
      matched_report_id: null,
      group_id: null,
    },
  };
}


function validateCoordinates(report_lat, report_lng) {
  const lat = toNumberOrNull(report_lat);
  const lng = toNumberOrNull(report_lng);

  if (lat === null || lng === null) {
    throw new AppError(400, "report_lat and report_lng are required and must be numbers");
  }
  if (!isValidLat(lat) || !isValidLng(lng)) {
    throw new AppError(400, "Invalid location range (lat: -90..90, lng: -180..180)");
  }

  return { lat, lng };
}

module.exports = {
  fetchAllReports,
  fetchReportById,
  createNewReport,
  validateCoordinates,
  toNumberOrNull,
  AppError,
};
