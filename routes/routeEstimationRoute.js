
const express = require("express");
const router  = express.Router();

const { requireAuth } = require("../middleware/auth");

const { createEstimateRoute }  = require("../controllers/routeEstimationController");
const { getRouteDetails }      = require("../controllers/getRouteDetailsControllers");
const { calculateRoute }       = require("../controllers/routeCalculationController");
const { getRouteHistory }      = require("../controllers/routeHistoryController");

router.post("/estimate",                  requireAuth, createEstimateRoute);
router.post("/:route_req_id/calculate",   requireAuth, calculateRoute);
router.get("/:route_req_id",              requireAuth, getRouteDetails);
router.get("/",                           requireAuth, getRouteHistory);

module.exports = router;