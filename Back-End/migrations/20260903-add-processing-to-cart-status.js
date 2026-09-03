'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('carts', 'status', {
      type: Sequelize.ENUM('pending', 'completed', 'cancelled', 'processing'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('carts', 'status', {
      type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};