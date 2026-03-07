'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('reports', 'report_lat', {
      type: Sequelize.DECIMAL(10,7),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('reports', 'report_lng', {
      type: Sequelize.DECIMAL(10,7),
      allowNull: false,
      defaultValue: 0
    });

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.removeColumn('reports', 'report_lat');
    await queryInterface.removeColumn('reports', 'report_lng');

  }
};
