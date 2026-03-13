'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('report_votes', {
      vote_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      report_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'reports', key: 'report_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      vote_type: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // unique (report_id, user_id) عشان ما يصوت مرتين
    await queryInterface.addConstraint('report_votes', {
      fields: ['report_id', 'user_id'],
      type: 'unique',
      name: 'uniq_report_user_vote',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('report_votes');
  },
};