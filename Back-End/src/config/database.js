const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Database connected successfully');

    //await sequelize.sync();

    require('../models');

    console.log('Database models loaded successfully');
  } catch (error) {
    console.error('Database connection error:', error.message);
    // Let the caller decide whether to exit; this avoids hard crashes in dev tooling.
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('PostgreSQL connection closed through app termination');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await sequelize.close();
  console.log('PostgreSQL connection closed through app termination');
  process.exit(0);
});

module.exports = { sequelize, connectDB };