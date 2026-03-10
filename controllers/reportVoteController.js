const { Report, ReportVote } = require("../models");

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
    {
      where: { report_id: reportId },
    }
  );
}

// POST /api/v1/reports/:id/vote
const voteOnReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const userId = Number(req.user?.user_id);
    const voteType = Number(req.body?.vote_type);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid user",
        error: "Unauthorized",
      });
    }

    if (![1, -1].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: "vote_type must be 1 (upvote) or -1 (downvote)",
        error: "Bad Request",
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

    const existingVote = await ReportVote.findOne({
      where: {
        report_id: reportId,
        user_id: userId,
      },
    });

    if (!existingVote) {
      await ReportVote.create({
        report_id: reportId,
        user_id: userId,
        vote_type: voteType,
      });

      await recalculateReportStats(reportId);

      return res.status(201).json({
        success: true,
        message: "Vote added successfully",
      });
    }

    if (Number(existingVote.vote_type) === voteType) {
      return res.status(200).json({
        success: true,
        message: "Vote already exists with the same value",
      });
    }

    existingVote.vote_type = voteType;
    await existingVote.save();

    await recalculateReportStats(reportId);

    return res.status(200).json({
      success: true,
      message: "Vote updated successfully",
    });
  } catch (err) {
    console.error("voteOnReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to vote on report",
      error: err.message,
    });
  }
};

// DELETE /api/v1/reports/:id/vote
const removeVoteFromReport = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const userId = Number(req.user?.user_id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report id",
        error: "Bad Request",
      });
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid user",
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

    const deleted = await ReportVote.destroy({
      where: {
        report_id: reportId,
        user_id: userId,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vote not found for this user on this report",
        error: "Not Found",
      });
    }

    await recalculateReportStats(reportId);

    return res.status(200).json({
      success: true,
      message: "Vote removed successfully",
    });
  } catch (err) {
    console.error("removeVoteFromReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove vote",
      error: err.message,
    });
  }
};

module.exports = {
  voteOnReport,
  removeVoteFromReport,
};