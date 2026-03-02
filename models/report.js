
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Report = sequelize.define(
  "Report",
  {
    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    checkpoint_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "verified", "rejected", "closed"),
      allowNull: false,
      defaultValue: "pending",
    },

    confidence_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: "0.00",
    },

    votes_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Report;