
const models = require("./models");

function applyAssociations() {
  const {
    User,
    Report,
    Checkpoint,
    ReportVote,
    DuplicateReportGroup,
    DuplicateReportItem,
    ModerationAction,
  } = models;

  // Report <-> User
  if (User) {
    User.hasMany(Report, { foreignKey: "user_id" });
    Report.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(ReportVote, { foreignKey: "user_id" });
    ReportVote.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(ModerationAction, { foreignKey: "performed_by" });
    ModerationAction.belongsTo(User, { foreignKey: "performed_by" });
  }

  // Report <-> Checkpoint
  Report.belongsTo(Checkpoint, { foreignKey: "checkpoint_id" });
  Checkpoint.hasMany(Report, { foreignKey: "checkpoint_id" });

  // Votes
  Report.hasMany(ReportVote, { foreignKey: "report_id" });
  ReportVote.belongsTo(Report, { foreignKey: "report_id" });

  // Duplicates
  DuplicateReportGroup.hasMany(DuplicateReportItem, { foreignKey: "group_id" });
  DuplicateReportItem.belongsTo(DuplicateReportGroup, { foreignKey: "group_id" });

  Report.hasMany(DuplicateReportItem, { foreignKey: "report_id" });
  DuplicateReportItem.belongsTo(Report, { foreignKey: "report_id" });

  // Moderation -> Report
  ModerationAction.belongsTo(Report, { foreignKey: "report_id" });
  Report.hasMany(ModerationAction, { foreignKey: "report_id" });
}

module.exports = applyAssociations;