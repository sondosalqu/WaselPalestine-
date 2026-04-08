"use strict";

module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define(
    "Area",
    {
      area_id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },

      area_name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
    },
    {
      tableName: "area",
      timestamps: false,
    }
  );


  return Area;
};