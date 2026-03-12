module.exports = (sequelize, DataTypes) => {
  const RouteRequest = sequelize.define(
    "RouteRequest",
    {
      route_req_id: { type: DataTypes.STRING(36), primaryKey: true },
      user_id: { type: DataTypes.STRING(36), allowNull: true },
      requested_by_user_id: { type: DataTypes.STRING(36), allowNull: true },

      origin_lat: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
      origin_lng: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
      dest_lat: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
      dest_lng: { type: DataTypes.DECIMAL(9, 6), allowNull: false },

      created_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "route_request",
      timestamps: false,
    }
  );

  return RouteRequest;
};