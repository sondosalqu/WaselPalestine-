"use strict";

module.exports = (sequelize, DataTypes) => {
  const AlertSubscription = sequelize.define(
    "AlertSubscription",
    {
      subscription_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },

      area_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
      },

      type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "alert_subscription",
      timestamps: false,
    }
  );

 

  
  return AlertSubscription;
};