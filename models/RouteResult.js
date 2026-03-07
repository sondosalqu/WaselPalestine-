module.exports = (sequelize, DataTypes) => {
  const RouteResult = sequelize.define(
    "RouteResult",
    {
      route_result_id: { type: DataTypes.STRING(36), primaryKey: true },
      route_req_id: { type: DataTypes.STRING(36), allowNull: false },

      est_distance_km: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
      est_duration_min: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      metadata: { type: DataTypes.JSON, allowNull: false },

      calculated_at: { type: DataTypes.DATE, allowNull: false },
      provider_id: { type: DataTypes.STRING(60), allowNull: true },
    },
    {
      tableName: "route_result",
      timestamps: false,
    }
  );

  return RouteResult;
};