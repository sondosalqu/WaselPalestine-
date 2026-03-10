const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const {
  voteOnReport,
  removeVoteFromReport,
} = require("../controllers/reportVoteController");

// POST /api/v1/reports/:id/vote
router.post("/reports/:id/vote", requireAuth, voteOnReport);

// DELETE /api/v1/reports/:id/vote
router.delete("/reports/:id/vote", requireAuth, removeVoteFromReport);

module.exports = router;