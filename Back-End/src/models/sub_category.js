const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubCategory = sequelize.define('SubCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Sub-Category name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Sub-Category name must be between 2 and 100 characters'
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
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'sub_categories',
  timestamps: true,
  indexes: [
    {
      name: 'idx_subcategory_category_id',
      fields: ['categoryId']
    }
  ]
});

module.exports = SubCategory;