const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Ticket = sequelize.define("Ticket", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING },
  priority: { type: DataTypes.ENUM("Low", "Medium", "High", "Urgent"), defaultValue: "Low" },
  status: { 
    type: DataTypes.ENUM("Open", "In Progress", "Resolved", "Closed"), 
    defaultValue: "Open" 
  },
  attachment: { type: DataTypes.STRING }, // store file path or URL
});

// Associations
User.hasMany(Ticket, { foreignKey: "userId" });
Ticket.belongsTo(User, { foreignKey: "userId" });

module.exports = Ticket;
