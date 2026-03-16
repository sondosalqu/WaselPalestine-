// models/incident.js
module.exports = (sequelize, DataTypes) => {
  const Incident = sequelize.define(
    "Incident",
    {
      incident_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      area_id: {
  type: DataTypes.BIGINT.UNSIGNED,
  allowNull: true,
},

      severity: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      checkpoint_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      status: {
  type: DataTypes.STRING(20),
  allowNull: false,
  defaultValue: "ACTIVE",
},
verified_by: {
  type: DataTypes.BIGINT,
  allowNull: true,
},
verified_at: {
  type: DataTypes.DATE,
  allowNull: true,
},
closed_by: {
  type: DataTypes.BIGINT,
  allowNull: true,
},
closed_at: {
  type: DataTypes.DATE,
  allowNull: true,
},
    },
    {
      tableName: "incidents",
      timestamps: false,
      freezeTableName: true,
      underscored: true,
    }
  );

  return Incident;
};