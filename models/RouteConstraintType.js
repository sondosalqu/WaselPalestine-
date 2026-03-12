module.exports = (sequelize, DataTypes) => {
  const RouteConstraintType = sequelize.define(
    "RouteConstraintType",
    {
      constraint_type_id: { type: DataTypes.STRING(36), primaryKey: true },
      name: { type: DataTypes.STRING(80), allowNull: false },
    },
    {
      tableName: "route_constraint_type",
      timestamps: false,
    }
  );

  return RouteConstraintType;
};