const express = require("express");
const router = express.Router();


const {
  signupUser,
  signinUser,  
  refreshAccessToken ,
  logoutUser,
} = require("../controllers/userController");

const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");




router.post("/signup", signupUser);

router.post("/signin", signinUser);

router.post("/refresh", refreshAccessToken);

router.post("/logout", requireAuth, logoutUser);

module.exports = router;