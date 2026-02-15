const { Sequelize } = require('sequelize');

// Create Sequelize instance with correct database name
const sequelize = new Sequelize(
  'dev_champion_db', // Correct database name
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function resetDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully');
    
    console.log('Dropping all tables...');
    await sequelize.drop();
    console.log('All tables dropped');
    
    console.log('Creating tables from scratch...');
    // Import all models to ensure they're registered
    require('./src/models');
    
    await sequelize.sync({ force: true });
    console.log('Database recreated successfully');
    
    console.log('Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
