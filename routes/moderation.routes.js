const express = require("express");
console.log("MODERATION FILE RUNNING: moderation.routes.js");
const router = express.Router();

console.log("moderation.routes.js loaded");

const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const {
  verifyReport,
  rejectReport,
  closeReport,
  markReportAsDuplicate,
  getModerationActionsByReport,
  getPendingReports,
} = require("../controllers/moderationController");

// 1 = admin, 2 = moderator
router.patch("/reports/:id/verify", requireAuth, authorizeRoles(1, 2), verifyReport);
router.patch("/reports/:id/reject", requireAuth, authorizeRoles(1, 2), rejectReport);
router.patch("/reports/:id/close", requireAuth, authorizeRoles(1, 2), closeReport);
router.patch("/reports/:id/mark-duplicate", requireAuth, authorizeRoles(1, 2), markReportAsDuplicate);

router.get("/reports/pending", requireAuth, authorizeRoles(1, 2), getPendingReports);
router.get("/reports/:id/moderation-actions", requireAuth, authorizeRoles(1, 2), getModerationActionsByReport);

// test route
//router.get("/moderation-test", (req, res) => {
 // res.json({ success: true, message: "moderation routes working" });
//});

router.get("/moderation-test", (req, res) => {
  res.json({ ok: true, where: "moderation.routes.js" });
});
module.exports = router;