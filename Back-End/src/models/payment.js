const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');



const Payment = sequelize.define('Payment', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'carts',
            key: 'id'
        }
    },
    stripePaymentIntentId: {
        type: DataTypes.STRING(255), 
        allowNull: false,
        unique: true 
    },
    stripeChargeId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'lkr'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'canceled'), allowNull: false,
        defaultValue: 'pending'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },
    failureReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['stripePaymentIntentId']
        }
    ]
});

module.exports = Payment;
 