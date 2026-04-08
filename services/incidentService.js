// services/incidentService.js
const db = require("../config/db.js");
const { Incident } = require("../models");

const insertIncident = async ({ typeId, sev, cleanDescription, checkpointId, created_by }) => {
  return await Incident.create({
    type_id: typeId,
    severity: sev,
    description: cleanDescription,
    checkpoint_id: checkpointId,
    created_by,
    is_verified: false,
    status: "OPEN",
  });
};


const fetchIncidents = async ({ where, limit, offset, sortBy, sortOrder }) => {
  console.log("WHERE:", where);
console.log("SORT:", sortBy, sortOrder);
console.log("LIMIT OFFSET:", limit, offset);
  const conditions = [];
  const params = [];

  if (where.severity) {
    conditions.push("severity = ?");
    params.push(where.severity);
  }

  if (where.status) {
    conditions.push("status = ?");
    params.push(where.status);
  }

  if (where.type_id) {
    conditions.push("type_id = ?");
    params.push(where.type_id);
  }

  if (where.checkpoint_id) {
    conditions.push("checkpoint_id = ?");
    params.push(where.checkpoint_id);
  }

  if (where.is_verified !== undefined) {
    conditions.push("is_verified = ?");
    params.push(where.is_verified ? 1 : 0);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countSql = `SELECT COUNT(*) AS total FROM incidents ${whereSql}`;
  const [countRows] = await db.query(countSql, params);
  const count = Number(countRows?.[0]?.total || 0);

  const sql = `
    SELECT incident_id, type_id, severity, description, checkpoint_id,
           created_by, is_verified, verified_by, verified_at,
           status, closed_by, closed_at, created_at, updated_at
    FROM incidents
    ${whereSql}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, [...params, limit, offset]);

  return { count, rows };
};

const fetchIncidentById = async (incidentId) => {
  return await Incident.findByPk(incidentId);
};

const editIncident = async (incident, updates) => {
  await incident.update(updates);
  return incident;
};

const closeIncidentById = async (incident, userId) => {
  await incident.update({
    status: "CLOSED",
    closed_by: userId,
    closed_at: new Date(),
  });
  return incident;
};

const verifyIncidentById = async (incident, userId) => {
  await incident.update({
    is_verified: true,
    verified_by: userId,
    verified_at: new Date(),
  });
  return incident;
};

module.exports = {
  insertIncident,
  fetchIncidents,
  fetchIncidentById,
  editIncident,
  closeIncidentById,
  verifyIncidentById,
};