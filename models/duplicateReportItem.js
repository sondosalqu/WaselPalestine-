
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const DuplicateReportItem = sequelize.define(
  "DuplicateReportItem",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    group_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "duplicate_report_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["group_id", "report_id"] }], 
  }
);

module.exports = DuplicateReportItem;