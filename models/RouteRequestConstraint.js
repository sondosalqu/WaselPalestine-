module.exports = (sequelize, DataTypes) => {
  const RouteRequestConstraint = sequelize.define(
    "RouteRequestConstraint",
    {
      id: { type: DataTypes.STRING(36), primaryKey: true },
      route_req_id: { type: DataTypes.STRING(36), allowNull: false },
      constraint_type_id: { type: DataTypes.STRING(36), allowNull: false },
      area_id: { type: DataTypes.STRING(36), allowNull: true },
      checkpoint_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: "route_request_constraint",
      timestamps: false,
    }
  );

  return RouteRequestConstraint;
};