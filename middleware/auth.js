// middleware/auth.js
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};


const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 1) {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };