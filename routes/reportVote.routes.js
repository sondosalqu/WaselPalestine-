const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");

const {
  voteOnReport,
  removeVoteFromReport,
} = require("../controllers/reportVoteController");

router.post("/:id/vote", requireAuth, authorizeRoles(1, 2), voteOnReport);
router.delete("/:id/vote", requireAuth, authorizeRoles(1, 2), removeVoteFromReport);

module.exports = router;
