
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ModerationAction = sequelize.define(
  "ModerationAction",
  {
    moderation_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    action_type: {
      type: DataTypes.ENUM("verify", "reject", "close", "edit", "mark_duplicate"),
      allowNull: false,
    },

    target_type: {
      type: DataTypes.ENUM("report", "vote", "duplicate_group"),
      allowNull: false,
      defaultValue: "report",
    },

    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    performed_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    performed_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    old_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    new_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "moderation_actions",
    timestamps: false, 
  }
);

module.exports = ModerationAction;