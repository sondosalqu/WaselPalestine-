const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const {
  voteOnReport,
  removeVoteFromReport,
} = require("../controllers/reportVoteController");

router.post("/:id/vote", requireAuth, voteOnReport);
router.delete("/:id/vote", requireAuth, removeVoteFromReport);

module.exports = router;
