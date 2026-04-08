// controllers/incidentController.js
const {
  insertIncident,
  fetchIncidents,
  fetchIncidentById,
  editIncident,
  closeIncidentById,
  verifyIncidentById,
} = require("../services/incidentService");


const {
  isValidId,
  isValidSeverity,
  isValidIncidentStatus,
} = require("../utils/validators");

const db=require("../config/db.js");

const {  sequelize,Incident } = require("../models");

const { triggerAlertsForVerifiedIncident } = require("../services/alertsService");



const createIncident = async (req, res) => {
  try {
    const { type_id, severity, description, checkpoint_id } = req.body;

    if (
      type_id === undefined ||
      severity === undefined ||
      description === undefined ||
      checkpoint_id === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "type_id, severity, description, and checkpoint_id are required",
        error: "Bad Request",
      });
    }

    const typeId = Number(type_id);
    const checkpointId = Number(checkpoint_id);
    const cleanDescription = String(description).trim();
    const sev = String(severity).toUpperCase().trim();

    if (!isValidId(typeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type_id",
        error: "Bad Request",
      });
    }

    if (!isValidId(checkpointId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint_id",
        error: "Bad Request",
      });
    }

    if (!cleanDescription) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
        error: "Bad Request",
      });
    }

    if (!isValidSeverity(sev)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity value",
        error: "Bad Request",
      });
    }

   
    const created_by = req.user.user_id;

    const incident = await insertIncident({ typeId, sev, cleanDescription, checkpointId, created_by });

    return res.status(201).json({
      success: true,
      message: "Incident created successfully",
      data: incident,
    });
  } catch (error) {
    console.error("Error creating incident:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create incident",
      error: "Internal Server Error",
    });
  }
};

const getIncidents = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const severity = req.query.severity
    ? String(req.query.severity).toUpperCase().trim()
    : null;

  const status = req.query.status
    ? String(req.query.status).toUpperCase().trim()
    : null;

  const type_id = req.query.type_id ? Number(req.query.type_id) : null;

  const allowedSortFields = ["incident_id", "created_at", "severity", "status", "type_id"];
  let sortBy = String(req.query.sortBy || "created_at").trim();
  if (!allowedSortFields.includes(sortBy)) sortBy = "created_at";

  const sortOrder =
    String(req.query.sortOrder || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

  try {
    const where = {};

    if (severity) {
      if (!isValidSeverity(severity)) {
        return res.status(400).json({
          success: false,
          message: "Invalid severity value",
          error: "Bad Request",
        });
      }
      where.severity = severity;
    }

    if (req.query.checkpoint_id !== undefined) {
      const checkpointId = Number(req.query.checkpoint_id);
      if (!isValidId(checkpointId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid checkpoint_id",
          error: "Bad Request",
        });
      }
      where.checkpoint_id = checkpointId;
    }

    if (type_id !== null) {
      if (!isValidId(type_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type_id",
          error: "Bad Request",
        });
      }
      where.type_id = type_id;
    }

    if (req.query.is_verified !== undefined) {
      if (req.query.is_verified === "true") where.is_verified = true;
      else if (req.query.is_verified === "false") where.is_verified = false;
      else {
        return res.status(400).json({
          success: false,
          message: "Invalid is_verified value",
          error: "Bad Request",
        });
      }
    }

    if (status) {
      if (!isValidIncidentStatus(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
          error: "Bad Request",
        });
      }
      where.status = status;
    }

    const { count, rows: incidents } = await fetchIncidents({ where, limit, offset, sortBy, sortOrder });

    return res.status(200).json({
      success: true,
      message: "Incidents retrieved successfully",
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      data: incidents,
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
      error: "Internal Server Error",
    });
  }
};



const updateIncident = async (req, res) => {
  try {
    const incidentId = Number(req.params.id);

    if (!isValidId(incidentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID",
        error: "Bad Request",
      });
    }

    const incident = await fetchIncidentById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
        error: "Not Found",
      });
    }

    const { type_id, severity, description, checkpoint_id } = req.body;

    if (
      type_id === undefined &&
      severity === undefined &&
      description === undefined &&
      checkpoint_id === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
        error: "Bad Request",
      });
    }

    let updatedSeverity = incident.severity;

    if (severity !== undefined) {
      const sev = String(severity).toUpperCase();
      if (!isValidSeverity(sev)) {
        return res.status(400).json({
          success: false,
          message: "Invalid severity value",
          error: "Bad Request",
        });
      }
      updatedSeverity = sev;
    }

    const updated = await editIncident(incident, {
      type_id: type_id ?? incident.type_id,
      severity: updatedSeverity,
      description: description ?? incident.description,
      checkpoint_id: checkpoint_id ?? incident.checkpoint_id,
    });

    return res.status(200).json({
      success: true,
      message: "Incident updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating incident:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update incident",
      error: "Internal Server Error",
    });
  }
};

const closeIncident = async (req, res) => {
  try {
    const incidentId = Number(req.params.id);

    if (!isValidId(incidentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID",
        error: "Bad Request",
      });
    }

    const incident = await fetchIncidentById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
        error: "Not Found",
      });
    }

    if (String(incident.status || "").toUpperCase() === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Incident is already closed",
        error: "Bad Request",
      });
    }


    const closed = await closeIncidentById(incident, req.user.user_id);

    return res.status(200).json({
      success: true,
      message: "Incident closed successfully",
      data: closed,
    });
  } catch (error) {
    console.error("Error closing incident:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to close incident",
      error: "Internal Server Error",
    });
  }
};

const verifyIncident = async (req, res) => {
  try {
    const incidentId = Number(req.params.id);

    if (!isValidId(incidentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID",
        error: "Bad Request",
      });
    }

    const incident = await fetchIncidentById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
        error: "Not Found",
      });
    }

    if (incident.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Incident is already verified",
        error: "Bad Request",
      });
    }

    if (String(incident.status || "").toUpperCase() === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Closed incident cannot be verified",
        error: "Bad Request",
      });
    }

    const verified = await verifyIncidentById(incident, req.user.user_id);


await triggerAlertsForVerifiedIncident(incidentId);

    return res.status(200).json({
      success: true,
      message: "Incident verified successfully",
      data: verified,
    });
  } catch (error) {
    console.error("Error verifying incident:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify incident",
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  
  updateIncident,
  closeIncident,
  verifyIncident,
};