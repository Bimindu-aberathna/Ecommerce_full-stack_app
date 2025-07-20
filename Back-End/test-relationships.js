// Test script to verify model relationships
const { Category, SubCategory, Product, ProductVariety } = require('./src/models');

console.log('Testing model relationships...');

// Check if associations are properly defined
console.log('Category associations:', Object.keys(Category.associations));
console.log('SubCategory associations:', Object.keys(SubCategory.associations));
console.log('Product associations:', Object.keys(Product.associations));
console.log('ProductVariety associations:', Object.keys(ProductVariety.associations));

console.log('\nRelationship verification complete!');
