
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const DuplicateReportGroup = sequelize.define(
  "DuplicateReportGroup",
  {
    group_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "duplicate_report_groups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = DuplicateReportGroup;