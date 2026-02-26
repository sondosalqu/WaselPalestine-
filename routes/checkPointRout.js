const express = require("express");
const router = express.Router();
const {getCheckPoints} = require("../controllers/checkPointControllers");

const { requireAuth } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorizeRoles');



router.get("/checkpoint", getCheckPoints)


module.exports = router;
