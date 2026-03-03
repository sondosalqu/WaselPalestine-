const express = require("express");
const router = express.Router();


const {
  signupUser,
  signinUser,  
  refreshAccessToken 
} = require("../controllers/userController");

const { requireAuth } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/authorizeRoles");




router.post("/signup", signupUser);

router.post("/signin", signinUser);

router.post("/refresh", refreshAccessToken);

module.exports = router;