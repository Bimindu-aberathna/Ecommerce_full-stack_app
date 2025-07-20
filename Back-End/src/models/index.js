const { sequelize } = require('../config/database');
const User = require('./user');
const Category = require('./category');
const SubCategory = require('./sub_category');
const { Product, ProductVariety } = require('./product');

// Set up all associations here to avoid circular dependencies

// User associations
User.hasMany(Product, { 
  foreignKey: 'createdById', 
  as: 'products' 
});

Product.belongsTo(User, { 
  foreignKey: 'createdById', 
  as: 'createdBy' 
});

// Category -> SubCategory relationship
Category.hasMany(SubCategory, { 
  foreignKey: 'categoryId', 
  as: 'subCategories' 
});

SubCategory.belongsTo(Category, { 
  foreignKey: 'categoryId', 
  as: 'category' 
});

// SubCategory -> Product relationship
SubCategory.hasMany(Product, { 
  foreignKey: 'subCategoryId', 
  as: 'products' 
});

Product.belongsTo(SubCategory, { 
  foreignKey: 'subCategoryId', 
  as: 'subCategory' 
});

// Product -> ProductVariety relationship
Product.hasMany(ProductVariety, { 
  foreignKey: 'productId', 
  as: 'varieties',
  onDelete: 'CASCADE' 
});

ProductVariety.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'product' 
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Category,
  SubCategory,
  Product,
  ProductVariety
};
