

const db = require("../config/db.js");
const { RouteRequest, RouteResult } = require("../models");


async function getRouteHistoryForUser(user_id, { page, limit }) {
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

  return { count, rows };
}

async function getRouteDetailsById(route_req_id, user_id) {
  const [routeRequestRows] = await db.query(
    `SELECT * FROM route_request WHERE route_req_id = ? AND user_id = ?`,
    [route_req_id, user_id]
  );

  if (!routeRequestRows.length) return null;

  const [resultRows] = await db.query(
    `SELECT * FROM route_result
     WHERE route_req_id = ?
     ORDER BY calculated_at DESC
     LIMIT 1`,
    [route_req_id]
  );

  const [constraintRows] = await db.query(
    `SELECT
        rrc.id,
        rrc.route_req_id,
        rrc.area_id,
        rrc.checkpoint_id,
        rct.name AS constraint_type
     FROM route_request_constraint rrc
     JOIN route_constraint_type rct
       ON rrc.constraint_type_id = rct.constraint_type_id
     WHERE rrc.route_req_id = ?`,
    [route_req_id]
  );

  return {
    route_request: routeRequestRows[0],
    constraints: constraintRows,
    result: resultRows[0] || null,
  };
}

module.exports = { getRouteHistoryForUser, getRouteDetailsById };