'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    const moduleExport = require(path.join(__dirname, file));

    const model =
      typeof moduleExport === 'function'
        ? moduleExport(sequelize, Sequelize.DataTypes)
        : moduleExport;

    if (!model || !model.name) {
      console.warn(`[models/index] Skipped "${file}" because it did not export a Sequelize model.`);
      return;
    }

    db[model.name] = model;
  });

// If any model defines associate(db)
Object.keys(db).forEach((modelName) => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// =========================
// Existing associations
// =========================
if (db.User && db.Report) {
  db.User.hasMany(db.Report, { foreignKey: "user_id" });
  db.Report.belongsTo(db.User, { foreignKey: "user_id" });
}

if (db.Checkpoint && db.Report) {
  db.Checkpoint.hasMany(db.Report, { foreignKey: "checkpoint_id" });
  db.Report.belongsTo(db.Checkpoint, { foreignKey: "checkpoint_id" });
}

if (db.Report && db.ReportVote) {
  db.Report.hasMany(db.ReportVote, { foreignKey: "report_id" });
  db.ReportVote.belongsTo(db.Report, { foreignKey: "report_id" });
}

if (db.User && db.ReportVote) {
  db.User.hasMany(db.ReportVote, { foreignKey: "user_id" });
  db.ReportVote.belongsTo(db.User, { foreignKey: "user_id" });
}

if (db.DuplicateReportGroup && db.DuplicateReportItem) {
  db.DuplicateReportGroup.hasMany(db.DuplicateReportItem, { foreignKey: "group_id" });
  db.DuplicateReportItem.belongsTo(db.DuplicateReportGroup, { foreignKey: "group_id" });
}

if (db.Report && db.DuplicateReportItem) {
  db.Report.hasMany(db.DuplicateReportItem, { foreignKey: "report_id" });
  db.DuplicateReportItem.belongsTo(db.Report, { foreignKey: "report_id" });
}

if (db.Report && db.ModerationAction) {
  db.Report.hasMany(db.ModerationAction, { foreignKey: "report_id" });
  db.ModerationAction.belongsTo(db.Report, { foreignKey: "report_id" });
}

if (db.User && db.ModerationAction) {
  db.User.hasMany(db.ModerationAction, { foreignKey: "performed_by" });
  db.ModerationAction.belongsTo(db.User, { foreignKey: "performed_by" });
}

if (db.RouteRequest && db.RouteRequestConstraint && db.RouteConstraintType && db.RouteResult) {
  db.RouteRequest.hasMany(db.RouteRequestConstraint, {
    foreignKey: "route_req_id",
    as: "constraints",
  });

  db.RouteRequestConstraint.belongsTo(db.RouteConstraintType, {
    foreignKey: "constraint_type_id",
    as: "type",
  });

  db.RouteRequest.hasMany(db.RouteResult, {
    foreignKey: "route_req_id",
    as: "results",
  });

  db.RouteResult.belongsTo(db.RouteRequest, {
    foreignKey: "route_req_id",
    as: "request",
  });
}

if (db.User && db.AlertSubscription) {
  db.User.hasMany(db.AlertSubscription, {
    foreignKey: "user_id",
    as: "alertSubscriptions",
  });

  db.AlertSubscription.belongsTo(db.User, {
    foreignKey: "user_id",
    as: "user",
  });
}

if (db.Area && db.AlertSubscription) {
  db.Area.hasMany(db.AlertSubscription, {
    foreignKey: "area_id",
    as: "subscriptions",
  });

  db.AlertSubscription.belongsTo(db.Area, {
    foreignKey: "area_id",
    as: "area",
  });
}

if (db.IncidentType && db.AlertSubscription) {
  db.IncidentType.hasMany(db.AlertSubscription, {
    foreignKey: "type_id",
    as: "subscriptions",
  });

  db.AlertSubscription.belongsTo(db.IncidentType, {
    foreignKey: "type_id",
    as: "type",
  });
}

if (db.Incident && db.AlertRecord) {
  db.Incident.hasMany(db.AlertRecord, {
    foreignKey: "incident_id",
    as: "alertRecords",
  });

  db.AlertRecord.belongsTo(db.Incident, {
    foreignKey: "incident_id",
    as: "incident",
  });
}

if (db.AlertSubscription && db.AlertRecord) {
  db.AlertSubscription.hasMany(db.AlertRecord, {
    foreignKey: "subscription_id",
    as: "alertRecords",
  });

  db.AlertRecord.belongsTo(db.AlertSubscription, {
    foreignKey: "subscription_id",
    as: "subscription",
  });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;