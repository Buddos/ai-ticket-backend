// routes/authRoutes.js
const express = require("express");
const cookieParser = require("cookie-parser");
const { hashPassword, comparePassword, signAccessToken, signRefreshToken } = require("../helpers/auth");
const User = require("../models/User");
const Role = require("../models/Role");
const UserRole = require("../models/UserRole");

const router = express.Router();
router.use(cookieParser());

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email & password required" });

    const pwHash = await hashPassword(password);
    const user = await User.create({ email, password_hash: pwHash, full_name });

    // assign default role = "customer"
    const role = await Role.findOne({ where: { name: "customer" } });
    if (role) {
      await UserRole.create({ user_id: user.id, role_id: role.id });
    }

    res.status(201).json({ user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email & password required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const roles = await user.getRoles(); // Sequelize association
    const roleNames = roles.map(r => r.name);

    const accessToken = signAccessToken({ userId: user.id, email: user.email, roles: roleNames });
    const refreshToken = signRefreshToken({ userId: user.id });

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax" });

    user.last_login_at = new Date();
    await user.save();

    res.json({ user: { id: user.id, email: user.email }, roles: roleNames });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ ok: true });
});

module.exports = router;
