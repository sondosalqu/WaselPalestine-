'use strict';

module.exports = (sequelize, DataTypes) => {
  const ReportVote = sequelize.define(
    "ReportVote",
    {
      vote_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      report_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },

      // DB: (1 = upvote, -1 = downvote)
      vote_type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          isIn: [[1, -1]],
        },
      },
    },
    {
      tableName: "report_votes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { unique: true, fields: ["report_id", "user_id"] },
      ],
    }
  );

  return ReportVote;
};