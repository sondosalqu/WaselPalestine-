
module.exports = (sequelize, DataTypes) => {
  const IncidentType = sequelize.define(
    "IncidentType",
    {
      type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      type_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "incident_types",
      timestamps: false,
      freezeTableName: true,
      underscored: true,
    }
  );

  return IncidentType;
};