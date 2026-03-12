

const db=require("../config/db.js");

const {  sequelize,Checkpoint } = require("../models");



const getCheckPoints = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const allowedSortFields = ["checkpoint_id", "checkpoint_name"];
  let sortBy = String(req.query.sortBy || "checkpoint_id").trim();

  if (!allowedSortFields.includes(sortBy)) {
    sortBy = "checkpoint_id";
  }

  const sortOrder =
    String(req.query.sortOrder || "asc").toLowerCase() === "desc"
      ? "DESC"
      : "ASC";

  const status = req.query.status
    ? String(req.query.status).toUpperCase().trim()
    : null;

  const allowedStatuses = ["OPEN", "DELAY", "CLOSED"];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid checkpoint status",
      error: "Bad Request",
    });
  }

  const qRaw = req.query.q ?? req.query.name;
  const q = qRaw ? String(qRaw).trim() : null;

  try {
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

    return res.status(200).json({
      success: true,
      message: "Checkpoints fetched successfully",
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: checkPoints,
    });
  } catch (error) {
    console.error("Error fetching checkpoints:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch checkpoints",
      error: "Internal Server Error",
    });
  }
};

const getCheckpointById = async (req, res) => {
  try {
    const checkpointId = Number(req.params.id);

    if (!Number.isInteger(checkpointId) || checkpointId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error: "Bad Request",
      });
    }

    const checkpoint = await Checkpoint.findByPk(checkpointId);

    if (!checkpoint) {
      return res.status(404).json({
        success: false,
        message: "Checkpoint not found",
        error: "Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Checkpoint fetched successfully",
      data: checkpoint,
    });
  } catch (error) {
    console.error("Error fetching checkpoint by ID:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch checkpoint by ID",
      error: "Internal Server Error",
    });
  }
};

const updateCheckpoint = async (req, res) => {
  try {
    const checkpointId = Number(req.params.id);

    if (!Number.isInteger(checkpointId) || checkpointId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error: "Bad Request",
      });
    }

    const checkpoint = await Checkpoint.findByPk(checkpointId);

    if (!checkpoint) {
      return res.status(404).json({
        success: false,
        message: "Checkpoint not found",
        error: "Not Found",
      });
    }

    const { checkpoint_name, lat, lng } = req.body;

    if (
      checkpoint_name === undefined &&
      lat === undefined &&
      lng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
        error: "Bad Request",
      });
    }

    const updates = {};

    if (checkpoint_name !== undefined) {
      const cleanName = String(checkpoint_name).trim();
      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "checkpoint_name cannot be empty",
          error: "Bad Request",
        });
      }
      updates.checkpoint_name = cleanName;
    }

    if (lat !== undefined) {
      const latNum = Number(lat);
      if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude value",
          error: "Bad Request",
        });
      }
      updates.lat = latNum;
    }

    if (lng !== undefined) {
      const lngNum = Number(lng);
      if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        return res.status(400).json({
          success: false,
          message: "Invalid longitude value",
          error: "Bad Request",
        });
      }
      updates.lng = lngNum;
    }

    await checkpoint.update(updates);

  return res.status(200).json({
  success: true,
  message: "Checkpoint updated successfully",
  data: {
    ...checkpoint.toJSON(),
    lat: Number(checkpoint.lat),
    lng: Number(checkpoint.lng),
  },
});
  } catch (error) {
    console.error("Error updating checkpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update checkpoint",
      error: "Internal Server Error",
    });
  }
};

const updateCheckpointStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const checkpointId = Number(req.params.id);
    const { current_status } = req.body;

    if (!Number.isInteger(checkpointId) || checkpointId <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error: "Bad Request",
      });
    }

    if (!current_status) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "current_status is required",
        error: "Bad Request",
      });
    }

    const allowedStatuses = ["OPEN", "DELAY", "CLOSED"];
    const newStatus = String(current_status).toUpperCase();

    if (!allowedStatuses.includes(newStatus)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint status",
        error: "Bad Request",
      });
    }

    const checkpoint = await Checkpoint.findByPk(checkpointId, { transaction: t });
    if (!checkpoint) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Checkpoint not found",
        error: "Not Found",
      });
    }

    const oldStatus = String(checkpoint.current_status || "").toUpperCase();

 
    if (oldStatus === newStatus) {
      await t.rollback();
      return res.status(200).json({
        success: true,
        message: "Status is already set to this value",
        data: checkpoint,
      });
    }

    await Checkpoint.update(
      { current_status: newStatus },
      { where: { checkpoint_id: checkpointId }, transaction: t }
    );

 
    await sequelize.query(
      `
      UPDATE checkpoint_status_history
      SET end_time = NOW()
      WHERE checkpoint_id = ?
        AND end_time IS NULL
      `,
      {
        replacements: [checkpointId],
        transaction: t,
      }
    );

    await sequelize.query(
      `
      INSERT INTO checkpoint_status_history (checkpoint_id, start_time, end_time, status)
      VALUES (?, NOW(), NULL, ?)
      `,
      {
        replacements: [checkpointId, newStatus],
        transaction: t,
      }
    );

   
    await t.commit();

   
    const updated = await Checkpoint.findByPk(checkpointId);
    return res.status(200).json({
      success: true,
      message: "Checkpoint status updated successfully",
      data: updated,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating checkpoint status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update checkpoint status",
      error: "Internal Server Error",
    });
  }
}

const createCheckpoint = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { checkpoint_name, current_status, lat, lng } = req.body;

    if (
      checkpoint_name === undefined ||
      current_status === undefined ||
      lat === undefined ||
      lng === undefined
    ) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "checkpoint_name, current_status, lat, and lng are required",
        error: "Bad Request",
      });
    }

    const cleanName = String(checkpoint_name).trim();
    const status = String(current_status).toUpperCase().trim();
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (!cleanName) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "checkpoint_name cannot be empty",
        error: "Bad Request",
      });
    }

    const allowedStatuses = ["OPEN", "DELAY", "CLOSED"];
    if (!allowedStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint status",
        error: "Bad Request",
      });
    }

    if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid latitude value",
        error: "Bad Request",
      });
    }

    if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid longitude value",
        error: "Bad Request",
      });
    }

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
      `
      INSERT INTO checkpoint_status_history
      (checkpoint_id, start_time, end_time, status)
      VALUES (?, NOW(), NULL, ?)
      `,
      {
        replacements: [checkpoint.checkpoint_id, status],
        transaction: t,
      }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Checkpoint created successfully",
      data: checkpoint,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating checkpoint:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create checkpoint",
      error: "Internal Server Error",
    });
  }
};







module.exports = {
  getCheckPoints,
  getCheckpointById,
  updateCheckpoint,
  updateCheckpointStatus,
  createCheckpoint
};