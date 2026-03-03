
const sequelize = require("../config/sequelize");
const { DataTypes } = require("sequelize");

// Your current models (instance-direct style)
const Report = require("./report");
const ReportVote = require("./reportVote");
const DuplicateReportGroup = require("./duplicateReportGroup");
const DuplicateReportItem = require("./duplicateReportItem");
const ModerationAction = require("./moderationAction");

// Factory style model (your current checkpoint.js)
const Checkpoint = require("./checkpoint")(sequelize, DataTypes);

// If you don't have user.js now, leave it null (still ok)
let User = null;
try {
  User = require("./user");
} catch (e) {
  User = null;
}

module.exports = {
  sequelize,
  Report,
  ReportVote,
  DuplicateReportGroup,
  DuplicateReportItem,
  ModerationAction,
  Checkpoint,
  User,
};