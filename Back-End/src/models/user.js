const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'First name is required'
      },
      len: {
        args: [1, 50],
        msg: 'First name cannot exceed 50 characters'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Last name is required'
      },
      len: {
        args: [1, 50],
        msg: 'Last name cannot exceed 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Email address already exists'
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required'
      },
      len: {
        args: [6, 128],
        msg: 'Password must be at least 6 characters long'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  addressNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  addressStreet: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  addressCity: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  addressCountry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    }
  }
});

// Virtual field for full name
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Hash password before save
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user data for authentication
User.prototype.toAuthJSON = function() {
  return {
    id: this.id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.getFullName(),
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    createdAt: this.createdAt,
  };
};

module.exports = User;