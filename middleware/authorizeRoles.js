const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRoleId = Number(req.user?.role);

      if (!Number.isInteger(userRoleId)) {
        return res.status(403).json({
          success: false,
          message: "User role not found in token",
        });
      }

      if (!allowedRoles.includes(userRoleId)) {
        return res.status(403).json({
          success: false,
          message: `Access denied for role_id: ${userRoleId}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Role verification failed",
      });
    }
  };
};

module.exports = { authorizeRoles };