const db = require("../config/db");
const { AlertSubscription, Area, IncidentType } = require("../models");
const { createError, validatePositiveInt } = require("../utils/alertsUtils");

const createAlertSubscription = async ({ user_id, area_id, type_id }) => {
  if (!area_id && !type_id) {
    throw createError("area_id or type_id must be provided", 400);
  }

  if (area_id) {
    const area = await Area.findByPk(area_id);
    if (!area) {
      throw createError("Area not found", 404);
    }
  }

  if (type_id) {
    const incidentType = await IncidentType.findByPk(type_id);
    if (!incidentType) {
      throw createError("Incident type not found", 404);
    }
  }

  const existingSubscription = await AlertSubscription.findOne({
    where: {
      user_id,
      area_id: area_id || null,
      type_id: type_id || null,
      is_active: true,
    },
  });

  if (existingSubscription) {
    throw createError("Subscription already exists", 409);
  }

  const subscription = await AlertSubscription.create({
    user_id,
    area_id: area_id || null,
    type_id: type_id || null,
    created_at: new Date(),
    is_active: true,
  });

  return subscription;
};

const triggerAlertsForVerifiedIncident = async (incidentId) => {
  const sIncidentId = validatePositiveInt(incidentId, "incident ID");

  const [incidentRow] = await db.query(
    `SELECT incident_id, type_id, area_id, checkpoint_id, is_verified FROM incidents WHERE incident_id = ? LIMIT 1`,
    [sIncidentId]
  );

  if (!incidentRow.length) {
    throw new Error("Incident not found");
  }

  const incident = incidentRow[0];

  if (!incident.is_verified) {
    throw new Error("Incident is not verified");
  }

  const incidentAreaId = incident.area_id;
  const incidentTypeId = incident.type_id;

  const [subscriptionRow] = await db.query(
    `SELECT subscription_id, user_id, area_id, type_id FROM alert_subscription
    WHERE is_active = 1
      AND (
        (area_id IS NOT NULL AND type_id IS NULL AND area_id = ?)
        OR
        (area_id IS NULL AND type_id IS NOT NULL AND type_id = ?)
        OR
        (area_id IS NOT NULL AND type_id IS NOT NULL AND area_id = ? AND type_id = ?)
      )
    `,
    [incidentAreaId, incidentTypeId, incidentAreaId, incidentTypeId]
  );

  if (!subscriptionRow.length) {
    return {
      success: true,
      message: "No matching subscriptions found",
      createdCount: 0,
    };
  }

  let createdCount = 0;
  let skippedDuplicates = 0;

  for (const subscription of subscriptionRow) {
    const [existingRows] = await db.query(
      `SELECT alert_id FROM alert_record WHERE incident_id = ? AND subscription_id = ? LIMIT 1`,
      [sIncidentId, subscription.subscription_id]
    );

    if (existingRows.length) {
      skippedDuplicates += 1;
      continue;
    }

    const payload = JSON.stringify({
      incident_id: sIncidentId,
      subscription_id: subscription.subscription_id,
      user_id: subscription.user_id,
      area_id: incidentAreaId,
      type_id: incidentTypeId,
      message: "New verified incident matched this subscription",
    });

    await db.query(
      `INSERT INTO alert_record (incident_id, subscription_id, created_at, status, channel, payload) VALUES (?, ?, NOW(), ?, ?, ?)`,
      [sIncidentId, subscription.subscription_id, "PENDING", "IN_APP", payload]
    );

    createdCount += 1;
  }

  return {
    success: true,
    message: "Alert records processed successfully",
    createdCount,
    skippedDuplicates,
    matchedSubscriptions: subscriptionRow.length,
  };
};

const getUserAlertSubscriptions = async (userid) => {
  const subscriptions = await AlertSubscription.findAll({
    where: { user_id: userid },
  });

  return subscriptions;
};

const deactivateAlertSubscription = async (userid, subscriptionId) => {
  const subscriptions = await AlertSubscription.findOne({
    where: {
      user_id: userid,
      subscription_id: subscriptionId,
    },
  });

  if (!subscriptions) {
    throw createError("Subscription not found", 404);
  }

  if (!subscriptions.is_active) {
    throw createError("Subscription is already inactive", 400);
  }

  await subscriptions.update({ is_active: false });

  return subscriptions;
};

const getUserAlerts = async (userid) => {
  if (!userid) {
    throw createError("User ID is required", 400);
  }

  const parsedUserId = validatePositiveInt(userid, "user ID");

  const [alerts] = await db.query(
    `SELECT ar.*
     FROM alert_record ar
     JOIN alert_subscription s
     ON ar.subscription_id = s.subscription_id
     WHERE s.user_id = ?
     ORDER BY ar.created_at DESC`,
    [parsedUserId]
  );

  return alerts;
};

const markAlertAsRead = async (userid, alertId) => {
  const parsedUserId = validatePositiveInt(userid, "user ID");
  const parsedAlertId = validatePositiveInt(alertId, "alert ID");

  const [rows] = await db.query(
    `SELECT ar.alert_id, ar.status, s.user_id
     FROM alert_record ar
     JOIN alert_subscription s
       ON ar.subscription_id = s.subscription_id
     WHERE ar.alert_id = ? AND s.user_id = ?
     LIMIT 1`,
    [parsedAlertId, parsedUserId]
  );

  if (!rows.length) {
    throw createError("Alert not found", 404);
  }

  const alert = rows[0];

  if (String(alert.status).toUpperCase() === "READ") {
    throw createError("Alert is already marked as read", 400);
  }

  await db.query(`UPDATE alert_record SET status = ? WHERE alert_id = ?`, [
    "READ",
    parsedAlertId,
  ]);

  const [updatedRows] = await db.query(
    `SELECT ar.* FROM alert_record ar WHERE ar.alert_id = ? LIMIT 1`,
    [parsedAlertId]
  );

  return updatedRows[0];
};

module.exports = {
  createAlertSubscription,
  triggerAlertsForVerifiedIncident,
  getUserAlertSubscriptions,
  deactivateAlertSubscription,
  getUserAlerts,
  markAlertAsRead,
};
