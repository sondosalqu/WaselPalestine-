const {
  fetchCheckpoints,
  fetchCheckpointById,
  editCheckpoint,
  editCheckpointStatus,
  insertCheckpoint,
  fetchCheckpointHistory,
} = require("../services/checkpointService.js");

const {
  isValidId,
  isValidCheckpointStatus,
  isValidLat,
  isValidLng,
  allowedCheckpointStatuses,
} = require("../utils/validators");

const getCheckPoints = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const allowedSortFields = ["checkpoint_id", "checkpoint_name"];
  let sortBy = String(req.query.sortBy || "checkpoint_id").trim();
  if (!allowedSortFields.includes(sortBy)) sortBy = "checkpoint_id";

  const sortOrder =
    String(req.query.sortOrder || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

  const status = req.query.status
    ? String(req.query.status).toUpperCase().trim()
    : null;

  if (status && !isValidCheckpointStatus(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid checkpoint status",
      error: "Bad Request",
    });
  }

  const qRaw = req.query.q ?? req.query.name;
  const q = qRaw ? String(qRaw).trim() : null;

  try {
    const { total, checkPoints } = await fetchCheckpoints({
      page, limit, offset, status, q, sortBy, sortOrder,
    });

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

    if (!isValidId(checkpointId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error: "Bad Request",
      });
    }

    const checkpoint = await fetchCheckpointById(checkpointId);

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

    if (!isValidId(checkpointId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error: "Bad Request",
      });
    }

    const checkpoint = await fetchCheckpointById(checkpointId);

    if (!checkpoint) {
      return res.status(404).json({
        success: false,
        message: "Checkpoint not found",
        error: "Not Found",
      });
    }

    const { checkpoint_name, lat, lng } = req.body;

    if (checkpoint_name === undefined && lat === undefined && lng === undefined) {
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
      if (!isValidLat(lat)) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude value",
          error: "Bad Request",
        });
      }
      updates.lat = Number(lat);
    }

    if (lng !== undefined) {
      if (!isValidLng(lng)) {
        return res.status(400).json({
          success: false,
          message: "Invalid longitude value",
          error: "Bad Request",
        });
      }
      updates.lng = Number(lng);
    }

    const data = await editCheckpoint(checkpoint, updates);

    return res.status(200).json({
      success: true,
      message: "Checkpoint updated successfully",
      data,
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
  try {
    const checkpointId = Number(req.params.id);
    const { current_status } = req.body;

    if (!isValidId(checkpointId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error: "Bad Request",
      });
    }

    if (!current_status) {
      return res.status(400).json({
        success: false,
        message: "current_status is required",
        error: "Bad Request",
      });
    }

    const newStatus = String(current_status).toUpperCase();

    if (!isValidCheckpointStatus(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint status",
        error: "Bad Request",
      });
    }

    const checkpoint = await fetchCheckpointById(checkpointId);

    if (!checkpoint) {
      return res.status(404).json({
        success: false,
        message: "Checkpoint not found",
        error: "Not Found",
      });
    }

    const oldStatus = String(checkpoint.current_status || "").toUpperCase();

    if (oldStatus === newStatus) {
      return res.status(200).json({
        success: true,
        message: "Status is already set to this value",
        data: checkpoint,
      });
    }

    const updated = await editCheckpointStatus(checkpointId, checkpoint, newStatus);

    return res.status(200).json({
      success: true,
      message: "Checkpoint status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating checkpoint status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update checkpoint status",
      error: "Internal Server Error",
    });
  }
};

const createCheckpoint = async (req, res) => {
  try {
    const { checkpoint_name, current_status, lat, lng } = req.body;

    if (
      checkpoint_name === undefined ||
      current_status === undefined ||
      lat === undefined ||
      lng === undefined
    ) {
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
      return res.status(400).json({
        success: false,
        message: "checkpoint_name cannot be empty",
        error: "Bad Request",
      });
    }

    if (!isValidCheckpointStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint status",
        error: "Bad Request",
      });
    }

    if (!isValidLat(latNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude value",
        error: "Bad Request",
      });
    }

    if (!isValidLng(lngNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude value",
        error: "Bad Request",
      });
    }

    const checkpoint = await insertCheckpoint({ cleanName, status, latNum, lngNum });

    return res.status(201).json({
      success: true,
      message: "Checkpoint created successfully",
      data: checkpoint,
    });
  } catch (error) {
    console.error("Error creating checkpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create checkpoint",
      error: "Internal Server Error",
    });
  }
};
const getCheckpointHistory = async (req, res) => {
  try {
    const checkpointId = Number(req.params.id);

    if (!isValidId(checkpointId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error: "Bad Request",
      });
    }

    const checkpoint = await fetchCheckpointById(checkpointId);
    if (!checkpoint) {
      return res.status(404).json({
        success: false,
        message: "Checkpoint not found",
        error: "Not Found",
      });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const history = await fetchCheckpointHistory(checkpointId, limit, offset);

    return res.status(200).json({
      success: true,
      message: "Checkpoint history fetched successfully",
      meta: {
        page,
        limit,
      },
      data: history,
    });
  } catch (error) {
    console.error("Error fetching checkpoint history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch checkpoint history",
      error: "Internal Server Error",
    });
  }
};
 
module.exports = {
  getCheckPoints,
  getCheckpointById,
  updateCheckpoint,
  updateCheckpointStatus,
  createCheckpoint,
  getCheckpointHistory,
};