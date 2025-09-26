// src/models/Message.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");  // ✅ fixed path

const Message = sequelize.define("Message", {
  ticketId: { type: DataTypes.INTEGER, allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  timestamps: true,
});

module.exports = Message;
