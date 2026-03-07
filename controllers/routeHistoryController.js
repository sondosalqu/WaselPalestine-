const { RouteRequest, RouteResult } = require("../models");

const getRouteHistory = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const offset = (page - 1) * limit;

    const { count, rows } = await RouteRequest.findAndCountAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: RouteResult,
           as: "results",
          required: false,
        },
      ],
    });

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