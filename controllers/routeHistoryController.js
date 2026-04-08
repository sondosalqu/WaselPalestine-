

const { getRouteHistoryForUser } = require("../services/routeQueryService");

const getRouteHistory = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page  = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const { count, rows } = await getRouteHistoryForUser(user_id, { page, limit });

    return res.status(200).json({
      success: true,
      message: "Route history fetched",
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching route history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch route history",
      error: error.message,
    });
  }
};

module.exports = { getRouteHistory };