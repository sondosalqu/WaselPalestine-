console.log("reports.routes.js loaded");

const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const {
  getReports,
  getReportById,
  createReport,
} = require("../controllers/reportsController");

// GET /api/v1/reports
router.get("/", getReports);

router.get("/test-id/:id", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "test route works",
    id: req.params.id,
  });
});


// GET /api/v1/reports/:id
router.get("/:id", getReportById);

// POST /api/v1/reports
router.post("/", requireAuth, createReport);

//console.log("✅ reports.routes.js loaded");
module.exports = router;