const alertsService = require("../services/alertsService");
const { validatePositiveInt } = require("../utils/alertsUtils");

const createAlertSubscription = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { area_id, type_id } = req.body;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "User not authenticated",
      });
    }

    const subscription = await alertsService.createAlertSubscription({
      user_id,
      area_id,
      type_id,
    });

    return res.status(201).json({
      success: true,
      message: "Alert subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create alert subscription",
      error: error.name || "Server Error",
    });
  }
};

const getUserSubscriptions = async (req, res) => {
  try {
    if (!req.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "User authentication required",
      });
    }

    const subscriptions = await alertsService.getUserAlertSubscriptions(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "User subscriptions retrieved successfully",
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: "Internal Server Error",
    });
  }
};

const deactivateAlertSubscription = async (req, res) => {
  try {
    if (!req.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "User authentication required",
      });
    }

    let subscriptionId;
    try {
      subscriptionId = validatePositiveInt(req.params.id, "subscription ID");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID",
        error: "Bad Request",
      });
    }

    const subscription = await alertsService.deactivateAlertSubscription(
      req.user.user_id,
      subscriptionId
    );

    return res.status(200).json({
      success: true,
      message: "Subscription deactivated successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Error deactivating subscription:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to deactivate subscription",
      error:
        statusCode === 500 ? "Internal Server Error" : error.name || "Error",
    });
  }
};

const getUserAlerts = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "User authentication required",
      });
    }

    const alerts = await alertsService.getUserAlerts(userId);

    return res.status(200).json({
      success: true,
      message: "User alerts retrieved successfully",
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: "Internal Server Error",
    });
  }
};

const markAlertAsRead = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "User authentication required",
      });
    }

    let alertId;
    try {
      alertId = validatePositiveInt(req.params.id, "alert ID");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid alert ID",
        error: "Bad Request",
      });
    }

    const updatedAlert = await alertsService.markAlertAsRead(userId, alertId);

    return res.status(200).json({
      success: true,
      message: "Alert marked as read successfully",
      data: updatedAlert,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to mark alert as read",
      error:
        statusCode === 500 ? "Internal Server Error" : error.name || "Error",
    });
  }
};

module.exports = {
  createAlertSubscription,
  getUserSubscriptions,
  deactivateAlertSubscription,
  getUserAlerts,
  markAlertAsRead,
};
