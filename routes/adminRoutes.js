const express = require("express");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Role = require("../models/Role");

const router = express.Router();

// ✅ Admin Dashboard
router.get("/dashboard", authMiddleware, requireRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin 🚀", user: req.user });
});

// ✅ Get all users with roles
router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "full_name", "email", "createdAt"],
      include: [{ model: Role, attributes: ["name"], through: { attributes: [] } }],
    });

    res.json(
      users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        roles: u.Roles.map((r) => r.name),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
