const allowedCheckpointStatuses = ["OPEN", "DELAY", "CLOSED"];
const allowedSeverity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const allowedIncidentStatuses = ["OPEN", "CLOSED"];

const isValidId = (id) => Number.isInteger(id) && id > 0;

const isValidCheckpointStatus = (status) =>
  allowedCheckpointStatuses.includes(String(status).toUpperCase());

const isValidSeverity = (severity) =>
  allowedSeverity.includes(String(severity).toUpperCase());

const isValidIncidentStatus = (status) =>
  allowedIncidentStatuses.includes(String(status).toUpperCase());

const isValidLat = (lat) => {
  const n = Number(lat);
  return !Number.isNaN(n) && n >= -90 && n <= 90;
};

const isValidLng = (lng) => {
  const n = Number(lng);
  return !Number.isNaN(n) && n >= -180 && n <= 180;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

module.exports = {
  allowedCheckpointStatuses,
  allowedSeverity,
  allowedIncidentStatuses,
  isValidId,
  isValidCheckpointStatus,
  isValidSeverity,
  isValidIncidentStatus,
  isValidLat,
  isValidLng,
  isValidEmail,
  isValidPhone,
};