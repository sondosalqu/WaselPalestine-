const { addOrUpdateVote, deleteVote } = require("../services/reportVoteService");

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

   
    const result = await addOrUpdateVote(reportId, userId, voteType);

    return res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error("voteOnReport error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to vote on report",
      error: err.message,
    });
  }
};

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


    await deleteVote(reportId, userId);

    return res.status(200).json({
      success: true,
      message: "Vote removed successfully",
    });
  } catch (err) {
    console.error("removeVoteFromReport error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to remove vote",
      error: err.message,
    });
  }
};

module.exports = {
  voteOnReport,
  removeVoteFromReport,
};
