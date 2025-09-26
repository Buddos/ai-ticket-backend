// controllers/authController.js
const {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
} = require("../helpers/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ error: "full_name, email & password are required" });
    }

    // check duplicate user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password (use helpers if available, else bcrypt fallback)
    const pwHash = hashPassword
      ? await hashPassword(password)
      : await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      password_hash: pwHash,
      full_name,
    });

    // assign default role = customer
    const [role] = await Role.findOrCreate({ where: { name: "customer" } });
    await user.addRole(role);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, full_name: user.full_name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email & password required" });

    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // compare password
    const ok = comparePassword
      ? await comparePassword(password, user.password_hash)
      : await bcrypt.compare(password, user.password_hash);

    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const roles = user.Roles.map((r) => r.name);

    // generate tokens
    const accessToken = signAccessToken
      ? signAccessToken({ userId: user.id, email, roles })
      : jwt.sign({ userId: user.id, email, roles }, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });

    const refreshToken = signRefreshToken
      ? signRefreshToken({ userId: user.id })
      : jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
          expiresIn: "7d",
        });

    // set cookies
    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax" });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    await user.update({ last_login_at: new Date() });

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, full_name: user.full_name },
      roles,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ ok: true, message: "Logged out successfully" });
};
