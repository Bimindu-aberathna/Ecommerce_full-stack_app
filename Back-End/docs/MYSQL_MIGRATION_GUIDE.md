# MongoDB to MySQL Migration Guide

## Overview
This guide helps you migrate the Champion Server from MongoDB to MySQL using Sequelize ORM. MySQL is easier to learn and work with for developers familiar with SQL.

## 🔄 What Changed

### Database System
- **Before**: MongoDB (NoSQL)
- **After**: MySQL (SQL) with Sequelize ORM

### Dependencies
- **Removed**: `mongoose`
- **Added**: `mysql2`, `sequelize`

### Model Structure
- **Before**: Mongoose schemas with embedded documents
- **After**: Sequelize models with relational tables

### ID System
- **Before**: MongoDB ObjectIds (24-character hex strings)
- **After**: Auto-incrementing integers (1, 2, 3, etc.)

## 📋 Setup Instructions

### 1. Install MySQL
Download and install MySQL from: https://dev.mysql.com/downloads/mysql/

#### Windows Installation:
1. Download MySQL Installer
2. Choose "Developer Default" setup
3. Set root password during installation
4. Start MySQL service

#### Create Database:
```sql
CREATE DATABASE champion_db;
USE champion_db;
```

### 2. Install Dependencies
```bash
cd Back-End
npm install mysql2 sequelize
npm uninstall mongoose
```

### 3. Environment Configuration
Copy `.env.mysql` to `.env` and update your database credentials:
```bash
cp .env.mysql .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=champion_db
DB_USER=root
DB_PASSWORD=your_mysql_root_password
```

### 4. Start the Server
```bash
npm run dev
```

The server will automatically create all tables on first run.

## 🗃️ Database Schema Changes

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  addressNumber VARCHAR(20),
  addressStreet VARCHAR(255),
  addressCity VARCHAR(100),
  addressCountry VARCHAR(100),
  phone VARCHAR(20),
  avatar VARCHAR(255),
  lastLogin DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  image VARCHAR(255),
  parentId INT,
  isActive BOOLEAN DEFAULT true,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES categories(id)
);
```

### Products Table
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  originalPrice DECIMAL(10,2),
  categoryId INT NOT NULL,
  subCategoryId INT,
  brand VARCHAR(100),
  sku VARCHAR(50) UNIQUE NOT NULL,
  images JSON,
  tags JSON,
  ratingAverage DECIMAL(2,1) DEFAULT 0,
  ratingCount INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  weight DECIMAL(8,3) NOT NULL,
  warranty VARCHAR(100),
  isFeatured BOOLEAN DEFAULT false,
  dimensionLength DECIMAL(8,2),
  dimensionWidth DECIMAL(8,2),
  dimensionHeight DECIMAL(8,2),
  dimensionWeight DECIMAL(8,3),
  createdById INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id),
  FOREIGN KEY (subCategoryId) REFERENCES categories(id),
  FOREIGN KEY (createdById) REFERENCES users(id),
  INDEX idx_name (name),
  INDEX idx_category (categoryId),
  INDEX idx_price (price),
  INDEX idx_brand (brand),
  INDEX idx_created (createdAt)
);
```

### Product Varieties Table
```sql
CREATE TABLE product_varieties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  stock INT DEFAULT 0,
  preorderLevel INT DEFAULT 0,
  ignoreWarnings BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

## 🔧 API Changes

### Request Format Changes

#### Before (MongoDB):
```json
{
  "category": "65a1b2c3d4e5f6789abcdef0",
  "subCategory": "65a1b2c3d4e5f6789abcdef1"
}
```

#### After (MySQL):
```json
{
  "category": 1,
  "subCategory": 2
}
```

### Response Format Changes

#### Before (MongoDB):
```json
{
  "data": {
    "product": {
      "_id": "65a1b2c3d4e5f6789abcdef3",
      "category": "65a1b2c3d4e5f6789abcdef0"
    }
  }
}
```

#### After (MySQL):
```json
{
  "data": {
    "product": {
      "id": 1,
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Electronics"
      }
    }
  }
}
```

## 🚀 Getting Started

### 1. Create Sample Categories
```sql
INSERT INTO categories (name, isActive) VALUES 
('Electronics', true),
('Clothing', true),
('Books', true),
('Home & Garden', true);
```

### 2. Create Admin User
Use the registration endpoint with admin role (you may need to manually update the role in the database):
```bash
POST /api/auth/register
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "Admin123"
}
```

Then update the role in MySQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### 3. Test Product Creation
Use the updated Postman collection with integer category IDs:
```json
{
  "name": "Test Product",
  "description": "A test product for the new MySQL setup",
  "price": 29.99,
  "category": 1,
  "sku": "TEST-001",
  "weight": 0.5,
  "varieties": [
    {
      "name": "Default",
      "stock": 10
    }
  ]
}
```

## 🔍 Key Benefits of MySQL

1. **Easier Learning Curve**: Standard SQL is more familiar
2. **Better Tooling**: Many GUI tools available (phpMyAdmin, MySQL Workbench)
3. **Structured Data**: Clear relationships and constraints
4. **Performance**: Optimized for relational queries
5. **ACID Compliance**: Better data consistency

## 🛠️ Development Tools

### Recommended MySQL GUI Tools:
- **MySQL Workbench** (Official)
- **phpMyAdmin** (Web-based)
- **DBeaver** (Cross-platform)
- **Sequel Pro** (Mac)

### Useful Commands:
```bash
# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE champion_db;

# Show tables
SHOW TABLES;

# Describe table structure
DESCRIBE products;

# View data
SELECT * FROM products LIMIT 5;
```

## 🔧 Troubleshooting

### Connection Issues:
1. Ensure MySQL service is running
2. Check credentials in `.env` file
3. Verify database exists
4. Check firewall settings

### Table Creation Issues:
- The app automatically creates tables on startup
- If issues occur, check console logs
- Ensure user has CREATE privileges

### Data Migration:
If you have existing MongoDB data, you'll need to:
1. Export MongoDB data
2. Transform ObjectIds to integers
3. Restructure embedded documents to separate tables
4. Import into MySQL

This migration makes the project much more approachable for developers learning backend development!
