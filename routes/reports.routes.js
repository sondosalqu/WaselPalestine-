console.log("reports.routes.js loaded");

const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");

const {
  getReports,
  getReportById,
  createReport,
} = require("../controllers/reportsController");


router.get("/", getReports);



router.get("/:id", getReportById);


router.post("/", requireAuth, authorizeRoles(3), createReport);

module.exports = router;