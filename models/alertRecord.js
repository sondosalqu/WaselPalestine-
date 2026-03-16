module.exports = (sequelize, DataTypes) => {
  const AlertRecord = sequelize.define(
    "AlertRecord",
    {
      alert_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      incident_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      subscription_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      channel: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "IN_APP",
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "alert_record",
      timestamps: false,
      freezeTableName: true,
      underscored: true,
    }
  );

  return AlertRecord;
};