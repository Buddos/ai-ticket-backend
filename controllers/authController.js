// controllers/authController.js
const { hashPassword, comparePassword, signAccessToken, signRefreshToken } = require("../helpers/auth");
const User = require("../models/User");
const Role = require("../models/Role");

exports.register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });

    const pwHash = await hashPassword(password);
    const user = await User.create({ email, password_hash: pwHash, full_name });

    // assign default role = customer
    const [role] = await Role.findOrCreate({ where: { name: "customer" } });
    await user.addRole(role);

    res.status(201).json({ user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(400).json({ error: "Email already in use" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });

    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const roles = user.Roles.map((r) => r.name);

    const accessToken = signAccessToken({ userId: user.id, email, roles });
    const refreshToken = signRefreshToken({ userId: user.id });

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax" });

    await user.update({ last_login_at: new Date() });

    res.json({ user: { id: user.id, email: user.email }, roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ ok: true });
};
