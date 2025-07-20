const { Op, Sequelize } = require('sequelize');

/**
 * Database utility functions for cross-platform compatibility
 */

/**
 * Creates a case-insensitive LIKE condition compatible with different databases
 * @param {string} value - The value to search for
 * @param {string} position - 'start', 'end', 'contains' (default: 'contains')
 * @returns {Object} Sequelize where condition
 */
const caseInsensitiveLike = (value, position = 'contains') => {
  let searchValue = value;
  
  switch (position) {
    case 'start':
      searchValue = `${value}%`;
      break;
    case 'end':
      searchValue = `%${value}`;
      break;
    case 'contains':
    default:
      searchValue = `%${value}%`;
      break;
  }

  // For MySQL/MariaDB, use LIKE with LOWER() for guaranteed case-insensitivity
  // For PostgreSQL, use ILIKE
  const dialect = process.env.DB_DIALECT || 'mysql';
  
  if (dialect === 'postgres' || dialect === 'postgresql') {
    return { [Op.iLike]: searchValue };
  } else {
    // MySQL/MariaDB: Use LIKE with LOWER() for case-insensitive search
    return Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('name')),
      'LIKE',
      searchValue.toLowerCase()
    );
  }
};

/**
 * Creates a case-insensitive exact match condition
 * @param {string} value - The value to match exactly
 * @param {string} columnName - The column name to search in (default: 'name')
 * @returns {Object} Sequelize where condition
 */
const caseInsensitiveEqual = (value, columnName = 'name') => {
  const dialect = process.env.DB_DIALECT || 'mysql';
  
  if (dialect === 'postgres' || dialect === 'postgresql') {
    return { [Op.iLike]: value };
  } else {
    // MySQL/MariaDB: Use LIKE with LOWER() for case-insensitive exact match
    return Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col(columnName)),
      'LIKE',
      value.toLowerCase()
    );
  }
};

/**
 * Creates an OR condition for searching across multiple fields
 * @param {Array} fields - Array of field names to search
 * @param {string} searchTerm - The search term
 * @param {string} position - 'start', 'end', 'contains' (default: 'contains')
 * @returns {Object} Sequelize OR condition
 */
const multiFieldSearch = (fields, searchTerm, position = 'contains') => {
  let searchValue = searchTerm;
  
  switch (position) {
    case 'start':
      searchValue = `${searchTerm}%`;
      break;
    case 'end':
      searchValue = `%${searchTerm}`;
      break;
    case 'contains':
    default:
      searchValue = `%${searchTerm}%`;
      break;
  }

  const dialect = process.env.DB_DIALECT || 'mysql';
  
  const conditions = fields.map(field => {
    if (dialect === 'postgres' || dialect === 'postgresql') {
      return { [field]: { [Op.iLike]: searchValue } };
    } else {
      // MySQL/MariaDB
      return Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col(field)),
        'LIKE',
        searchValue.toLowerCase()
      );
    }
  });

  return { [Op.or]: conditions };
};

module.exports = {
  caseInsensitiveLike,
  caseInsensitiveEqual,
  multiFieldSearch
};
