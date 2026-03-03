const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");

const {
  createstimateRoute,
  getRouteDetails,
  getRouteHistory,
} = require("../controllers/routeEstimationController");


router.post("/estimate", requireAuth, createstimateRoute);


//router.get("/:route_req_id", getRouteDetails);

//router.get("/", getRouteHistory);

module.exports = router;