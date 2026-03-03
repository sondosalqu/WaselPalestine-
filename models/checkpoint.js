'use strict';

module.exports = (sequelize, DataTypes) => {
  const Checkpoint = sequelize.define('Checkpoint', {
    checkpoint_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    checkpoint_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    current_status: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    lat: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: false,
    },
    lng: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'checkpoints',
    timestamps: false
  });

  return Checkpoint;
};