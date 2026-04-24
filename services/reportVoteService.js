const { Report, ReportVote } = require("../models");
const { AppError } = require("./reportsService");


async function recalculateReportStats(reportId) {
  const votes = await ReportVote.findAll({
    where: { report_id: reportId },
    attributes: ["vote_type"],
  });

  const votesCount = votes.length;
  const confidenceScore = votes.reduce((sum, v) => sum + Number(v.vote_type || 0), 0);

  await Report.update(
    {
      votes_count: votesCount,
      confidence_score: confidenceScore,
    },
    { where: { report_id: reportId } }
  );
}


async function addOrUpdateVote(reportId, userId, voteType) {
  const report = await Report.findByPk(reportId);
  if (!report) {
    throw new AppError(404, "Report not found");
  }

  const existingVote = await ReportVote.findOne({
    where: { report_id: reportId, user_id: userId },
  });

  
  if (!existingVote) {
    await ReportVote.create({ report_id: reportId, user_id: userId, vote_type: voteType });
    await recalculateReportStats(reportId);
    return { created: true, message: "Vote added successfully" };
  }

  if (Number(existingVote.vote_type) === voteType) {
    return { created: false, message: "Vote already exists with the same value" };
  }

  
  existingVote.vote_type = voteType;
  await existingVote.save();
  await recalculateReportStats(reportId);
  return { created: false, message: "Vote updated successfully" };
}

async function deleteVote(reportId, userId) {
  const report = await Report.findByPk(reportId);
  if (!report) {
    throw new AppError(404, "Report not found");
  }

  const deleted = await ReportVote.destroy({
    where: { report_id: reportId, user_id: userId },
  });

  if (!deleted) {
    throw new AppError(404, "Vote not found for this user on this report");
  }

  await recalculateReportStats(reportId);
}

module.exports = {
  addOrUpdateVote,
  deleteVote,
};
