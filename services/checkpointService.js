const db = require("../config/db.js");
const { sequelize, Checkpoint } = require("../models");

const fetchCheckpoints = async ({ page, limit, offset, status, q, sortBy, sortOrder }) => {
  const where = [];
  const params = [];

  if (status) {
    where.push("current_status = ?");
    params.push(status);
  }

  if (q) {
    where.push("checkpoint_name LIKE ?");
    params.push(`%${q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `SELECT COUNT(*) AS total FROM checkpoints ${whereSql}`;
  const [countRows] = await db.query(countSql, params);
  const total = Number(countRows?.[0]?.total || 0);

  const sql = `
    SELECT checkpoint_id, checkpoint_name, current_status, lat, lng, created_at, updated_at
    FROM checkpoints
    ${whereSql}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const [checkPoints] = await db.query(sql, [...params, limit, offset]);

  return { total, checkPoints };
};

const fetchCheckpointById = async (checkpointId) => {
  return await Checkpoint.findByPk(checkpointId);
};

const editCheckpoint = async (checkpoint, updates) => {
  await checkpoint.update(updates);
  return {
    ...checkpoint.toJSON(),
    lat: Number(checkpoint.lat),
    lng: Number(checkpoint.lng),
  };
};

const editCheckpointStatus = async (checkpointId, checkpoint, newStatus) => {
  const t = await sequelize.transaction();

  try {
    await Checkpoint.update(
      { current_status: newStatus },
      { where: { checkpoint_id: checkpointId }, transaction: t }
    );

    await sequelize.query(
      `UPDATE checkpoint_status_history
       SET end_time = NOW()
       WHERE checkpoint_id = ? AND end_time IS NULL`,
      { replacements: [checkpointId], transaction: t }
    );

    await sequelize.query(
      `INSERT INTO checkpoint_status_history (checkpoint_id, start_time, end_time, status)
       VALUES (?, NOW(), NULL, ?)`,
      { replacements: [checkpointId, newStatus], transaction: t }
    );

    await t.commit();

    return await Checkpoint.findByPk(checkpointId);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const insertCheckpoint = async ({ cleanName, status, latNum, lngNum }) => {
  const t = await sequelize.transaction();

  try {
    const checkpoint = await Checkpoint.create(
      {
        checkpoint_name: cleanName,
        current_status: status,
        lat: latNum,
        lng: lngNum,
        created_at: new Date(),
        updated_at: null,
      },
      { transaction: t }
    );

    await sequelize.query(
      `INSERT INTO checkpoint_status_history (checkpoint_id, start_time, end_time, status)
       VALUES (?, NOW(), NULL, ?)`,
      { replacements: [checkpoint.checkpoint_id, status], transaction: t }
    );

    await t.commit();
    return checkpoint;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
const fetchCheckpointHistory = async (checkpointId) => {
  const [rows] = await db.query(
    `SELECT history_id, checkpoint_id, status, start_time, end_time
     FROM checkpoint_status_history
     WHERE checkpoint_id = ?
     ORDER BY start_time DESC`,
    [checkpointId]
  );
  return rows;
};
module.exports = {
  fetchCheckpoints,
  fetchCheckpointById,
  editCheckpoint,
  editCheckpointStatus,
  insertCheckpoint,
  fetchCheckpointHistory,
};