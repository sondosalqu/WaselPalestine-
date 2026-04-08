const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { createAlertSubscription,markAlertAsRead } = require("../controllers/alertsController");
const { getUserSubscriptions,deactivateAlertSubscription,getUserAlerts } = require("../controllers/alertsController");
router.get("/alerts", requireAuth, getUserAlerts);

router.post("/subscriptions", requireAuth, createAlertSubscription);

router.get("/subscriptions", requireAuth, getUserSubscriptions);

router.patch("/subscriptions/:id", requireAuth, deactivateAlertSubscription);
router.patch("/alerts/:id/read", requireAuth, markAlertAsRead);

module.exports = router;