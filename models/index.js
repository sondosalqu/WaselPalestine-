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

    // ✅ Support BOTH styles:
    // 1) factory: module.exports = (sequelize, DataTypes) => Model
    // 2) direct:  module.exports = Model
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

// ✅ Manual associations (safe + won't break if some models missing)
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

db.sequelize = sequelize;
db.Sequelize = Sequelize;










<<<<<<< HEAD


=======
>>>>>>> main
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


module.exports = db;
