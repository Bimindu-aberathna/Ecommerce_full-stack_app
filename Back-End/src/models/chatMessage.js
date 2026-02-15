const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');


const ChatMessage = sequelize.define('ChatMessage', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model:'chats',
            key:'id'
        },
    },
    sender: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    viewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    tableName: 'chat_messages',
    timestamps: true
});

module.exports = ChatMessage;