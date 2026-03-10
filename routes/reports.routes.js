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

// GET /api/v1/reports/:id
router.get("/:id", getReportById);

// POST /api/v1/reports
router.post("/", requireAuth, createReport);

module.exports = router;