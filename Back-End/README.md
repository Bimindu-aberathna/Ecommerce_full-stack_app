# E-commerce Backend API

A modern, scalable e-commerce backend API built with Node.js, Express, MySQL, and JWT authentication.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: User registration, login, profile management
- **Product Management**: CRUD operations for products with advanced filtering and varieties
- **Security**: Rate limiting, input validation, secure headers
- **Database**: MySQL with Sequelize ORM
- **Error Handling**: Centralized error handling with detailed error messages
- **Validation**: Input validation using express-validator
- **Pagination**: Built-in pagination for all list endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Password Hashing**: bcryptjs

## Project Structure

```
src/
├── app.js                 # Main application file
├── config/
│   └── database.js        # MySQL database configuration
├── models/
│   ├── index.js          # Model relationships and exports
│   ├── user.js           # User model (Sequelize)
│   ├── category.js       # Category model
│   └── product.js        # Product & ProductVariety models
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── validation.js     # Validation middleware
│   └── errorHandler.js   # Error handling middleware
└── routes/
    ├── auth.js           # Authentication routes
    ├── product.js        # Product routes
    └── users.js          # User management routes
```

## Installation

## Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Back-End
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up MySQL Database:**
   - Install MySQL if not already installed
   - Create a database: `CREATE DATABASE champion_db;`
   - Note your MySQL credentials

4. **Create environment file:**
```bash
cp .env.mysql .env
```

5. **Update the environment variables in `.env`:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=champion_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

6. **Start the server:**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will automatically create all necessary tables on first run.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/featured` - Get featured products

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `GET /api/users/stats/dashboard` - Get user statistics

### Health Check
- `GET /api/health` - Server health check

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get Products
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&category=electronics&sort=-createdAt"
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "iPhone 14",
    "description": "Latest iPhone with amazing features",
    "price": 999,
    "category": "electronics",
    "sku": "IPHONE14",
    "stock": 50,
    "brand": "Apple"
  }'
```

## Query Parameters

### Products API
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: -createdAt)
- `category`: Filter by category
- `brand`: Filter by brand
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `search`: Text search in name and description
- `featured`: Filter featured products (true/false)
- `inStock`: Filter products in stock (true/false)

## Error Handling

The API uses a centralized error handling system that returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Validation errors (if any)
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **Secure Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policy

## Database Schema

### User Model
- Personal information (firstName, lastName, email)
- Authentication (password, role)
- Profile data (address, phone, avatar)
- Account status (isActive, lastLogin)

### Product Model
- Product details (name, description, price, category)
- Inventory (stock, sku)
- Media (images array)
- Metadata (tags, rating, dimensions)
- Status (isActive, isFeatured)

## Development

### Running Tests
```bash
npm test
```

### Code Structure Guidelines
- Follow MVC pattern
- Use middleware for cross-cutting concerns
- Implement proper error handling
- Add input validation for all endpoints
- Use async/await for database operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.