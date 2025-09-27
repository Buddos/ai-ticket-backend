// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // make sure this exports your initialized Sequelize instance

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    full_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    last_login_at: { type: DataTypes.DATE },
  },
  {
    tableName: "User", // force exact table name
    timestamps: true,  // include createdAt and updatedAt
  }
);

module.exports = User;
