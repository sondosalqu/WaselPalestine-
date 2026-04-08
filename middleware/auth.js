// middleware/auth.js
const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
      error: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
   
    // ✅ فرق بين expired و invalid
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        error: "TokenExpired",
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "Unauthorized",
    });
  }
};