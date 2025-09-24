// models/UserRole.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Role = require("./Role");

const UserRole = sequelize.define("UserRole", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
});

User.belongsToMany(Role, { through: UserRole, foreignKey: "user_id" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "role_id" });

module.exports = UserRole;
