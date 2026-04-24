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

<<<<<<< HEAD


router.get("/", getReports);



router.get("/:id", getReportById);


router.post("/", requireAuth, authorizeRoles(1, 2), createReport);
=======
router.get("/", getReports);


router.get("/:id", getReportById);


router.post("/", requireAuth, createReport);
>>>>>>> b94b67e77c7269fcba74cce410ebc31d039180b2

module.exports = router;