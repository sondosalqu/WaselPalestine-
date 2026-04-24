const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");

const { createAlertSubscription, markAlertAsRead } = require("../controllers/alertsController");
const { getUserSubscriptions, deactivateAlertSubscription, getUserAlerts } = require("../controllers/alertsController");

router.get("/alerts", requireAuth, getUserAlerts);
router.patch("/alerts/:id/read", requireAuth, markAlertAsRead);

router.post("/subscriptions", requireAuth, createAlertSubscription);
router.get("/subscriptions", requireAuth, getUserSubscriptions);
router.patch("/subscriptions/:id", requireAuth, deactivateAlertSubscription);

module.exports = router;