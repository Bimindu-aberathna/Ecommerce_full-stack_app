# E-Commerce Full-Stack Application

A modern, scalable e-commerce platform built with Next.js frontend and Node.js backend. This application provides a complete solution for online retail with separate interfaces for buyers and sellers.

## 🚀 Live Demo
<!-- Add your deployed links here -->
- **Frontend**: [Live Demo](your-vercel-url)
- **Backend API**: [API Documentation](your-backend-url)

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## ✨ Features

### For Buyers
- 🛍️ Browse products with advanced filtering
- 🛒 Shopping cart management
- 💳 Secure checkout process
- 📦 Order tracking
- ❤️ Wishlist functionality
- 👤 User profile management

### For Sellers
- 📊 Sales analytics dashboard
- 📦 Product management (CRUD)
- 🔄 Order management
- 📈 Performance metrics
- ⚙️ Account settings

### Backend Features
- 🔐 JWT-based authentication
- 🛡️ Role-based access control
- 📝 Input validation
- 🔒 Security middleware
- 📊 Database relationships
- 🚀 RESTful API design

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

## 📁 Project Structure

```
E-Commerce Store/
├── Back-End/                 # Node.js/Express Backend
│   ├── src/
│   │   ├── app.js           # Main application file
│   │   ├── config/          # Database & Firebase config
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper utilities
│   ├── tests/               # API tests
│   └── docs/                # API documentation
├── e-commerce_store/         # Next.js Frontend
│   ├── app/                 # App Router pages
│   │   ├── (buyer)/         # Buyer interface
│   │   ├── (seller)/        # Seller dashboard
│   │   └── api/             # API routes (if any)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── public/              # Static assets
└── README.md                # This file
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/your-username/e-commerce-store.git
cd e-commerce-store
```

## ⚙️ Environment Setup

### Backend Environment Variables
Create a `.env` file in the `Back-End` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration (if using)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### Frontend Environment Variables
Create a `.env.local` file in the `e-commerce_store` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Other configurations
NEXT_PUBLIC_APP_NAME=E-Commerce Store
```

## 🏃‍♂️ Running the Application

### Start the Backend
```bash
cd Back-End
npm install
npm start
```
The API will be available at `http://localhost:5000`

### Start the Frontend
```bash
cd e-commerce_store
npm install
npm run dev
```
The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Category Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)

For detailed API documentation, check the `Back-End/docs/` directory.

## 🧪 Testing

### Backend Tests
```bash
cd Back-End
npm test
```

### Frontend Tests
```bash
cd e-commerce_store
npm test
```

## 🚀 Deployment

### Backend Deployment
- Can be deployed on Railway, Heroku, or DigitalOcean
- Ensure environment variables are set in production

### Frontend Deployment
- Easily deployed on Vercel or Netlify
- Connect your GitHub repository for automatic deployments

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Your Name**
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)
- Portfolio: [Your Portfolio](https://your-portfolio.com)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Thanks to the Next.js team for the amazing framework
- Express.js for the robust backend framework
- Tailwind CSS for the utility-first CSS framework

---

⭐ Star this repository if you found it helpful!
