const { sequelize } = require('../config/database');
const User = require('./user');
const Category = require('./category');
const SubCategory = require('./sub_category');
const { Product, ProductVariety } = require('./product');
const Cart = require('./cart');
const CartItem = require('./cartItem');
const Payment = require('./payment');
const Order = require('./order');
const OrderItem = require('./orderItem');
const Chat = require('./chat');
const ChatMessage = require('./chatMessage');

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

// Cart associations
Cart.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Cart, {
  foreignKey: 'userId',
  as: 'carts'
});

Cart.hasMany(CartItem, {
  foreignKey: 'cartId',
  as: 'items'
});

CartItem.belongsTo(Cart, {
  foreignKey: 'cartId',
  as: 'cart'
});

CartItem.belongsTo(ProductVariety, {
  foreignKey: 'productVarietyId',
  as: 'productVariety'
});

ProductVariety.hasMany(CartItem, {
  foreignKey: 'productVarietyId',
  as: 'cartItems'
});


Payment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Payment.belongsTo(Cart, {
  foreignKey: 'cartId',
  as: 'cart'
});


User.hasMany(Payment, {
  foreignKey: 'userId',
  as: 'payments'
});

Cart.hasOne(Payment, {
  foreignKey: 'cartId',
  as: 'payment'
});

// Order associations
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
Order.belongsTo(Payment, {
  foreignKey: 'paymentId',
  as: 'payment'
});

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
});

Payment.hasOne(Order, {
  foreignKey: 'paymentId',
  as: 'order'
});

// OrderItem associations
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

OrderItem.belongsTo(ProductVariety, {
  foreignKey: 'productVarietyId',
  as: 'productVariety'
});

ProductVariety.hasMany(OrderItem, {
  foreignKey: 'productVarietyId',
  as: 'orderItems'
});

Chat.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
User.hasMany(Chat, {
  foreignKey: 'userId',
  as: 'chats'
});
Chat.hasMany(ChatMessage, {
  foreignKey: 'chatId',
  as: 'messages'
});
ChatMessage.belongsTo(Chat, {
  foreignKey: 'chatId',
  as: 'chat'
});



module.exports = {
  sequelize,
  User,
  Category,
  SubCategory,
  Product,
  ProductVariety,
  Cart,
  CartItem,
  Payment,
  Order,
  OrderItem,
  Chat,
  ChatMessage
};
