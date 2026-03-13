const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const {
  verifyReport,
  rejectReport,
  closeReport,
  markReportAsDuplicate,
} = require("../controllers/moderationController");

// 1 = admin, 2 = moderator
router.patch("/reports/:id/verify", requireAuth, authorizeRoles(1, 2), verifyReport);
router.patch("/reports/:id/reject", requireAuth, authorizeRoles(1, 2), rejectReport);
router.patch("/reports/:id/close", requireAuth, authorizeRoles(1, 2), closeReport);
router.patch(
  "/reports/:id/mark-duplicate",
  requireAuth,
  authorizeRoles(1, 2),
  markReportAsDuplicate
);

module.exports = router;