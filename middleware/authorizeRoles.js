// middleware/authorizeRoles.js
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {

      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: "User role not found in token",
          error: "Forbidden",
        });
      }

      const userRoleId = Number(req.user.role);

      if (!Number.isInteger(userRoleId)) {
        return res.status(403).json({
          success: false,
          message: "Invalid role format in token",
          error: "Forbidden",
        });
      }

      if (!allowedRoles.includes(userRoleId)) {
        return res.status(403).json({
          success: false,
          message: `Access denied for role_id: ${userRoleId}`,
          error: "Forbidden",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Role verification failed",
        error: "Internal Server Error",
      });
    }
  };
};

module.exports = { authorizeRoles };