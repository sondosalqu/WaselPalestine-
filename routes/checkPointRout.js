const express = require("express");
const router = express.Router();
const {
  getCheckPoints,
  getCheckpointById,
  updateCheckpoint,
  updateCheckpointStatus,
  createCheckpoint,
  getCheckpointHistory,
} = require("../controllers/checkPointControllers");

const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");

router.get("/", getCheckPoints);
router.get("/:id", getCheckpointById);
router.get("/:id/history", getCheckpointHistory);
router.put("/:id", requireAuth, authorizeRoles(1, 2), updateCheckpoint);
router.patch("/:id/status", requireAuth, authorizeRoles(1, 2), updateCheckpointStatus);
router.post("/", requireAuth, authorizeRoles(1, 2), createCheckpoint);

module.exports = router;