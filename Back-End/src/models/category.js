const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Category name already exists'
    },
    validate: {
      notEmpty: {
        msg: 'Category name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Category name must be between 2 and 100 characters'
      }
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Sort order cannot be negative'
      }
    }
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    {
      name: 'idx_category_name',
      unique: true,
      fields: ['name']
    },
    {
      name: 'idx_category_active',
      fields: ['isActive']
    },
    {
      name: 'idx_category_sort_order',
      fields: ['sortOrder']
    },
    {
      name: 'idx_category_active_sort',
      fields: ['isActive', 'sortOrder']
    },
    { 
      name: 'idx_category_created_at',
      fields: ['createdAt']
    }
  ]
});

module.exports = Category;
