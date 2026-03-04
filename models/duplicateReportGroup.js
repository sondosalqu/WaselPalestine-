'use strict';

module.exports = (sequelize, DataTypes) => {
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

  return DuplicateReportGroup;
};