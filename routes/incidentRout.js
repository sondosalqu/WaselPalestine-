const express = require("express");
const router = express.Router();

const{
 createIncident,
  getIncidents,
  updateIncident,
  closeIncident,
  verifyIncident
}=require("../controllers/incidentController");

const { requireAuth } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorizeRoles');


router.post("/", requireAuth, authorizeRoles(1,2), createIncident);
router.get("/", getIncidents);
router.put("/:id", requireAuth, authorizeRoles(1,2), updateIncident);
router.patch("/:id/close", requireAuth, authorizeRoles(1,2), closeIncident);
router.patch("/:id/verify", requireAuth, authorizeRoles(1,2), verifyIncident);

module.exports = router;