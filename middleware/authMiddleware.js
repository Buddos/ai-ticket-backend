const { verifyAccessToken } = require("../helpers/auth");
const User = require("../models/User");
const Role = require("../models/Role");

/**
 * Verify JWT token and attach user + roles
 */
async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = verifyAccessToken(token);

    // Fetch user and roles from DB
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Role,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    // Attach user info + roles to request
    req.user = {
      id: user.id,
      email: user.email,
      roles: user.Roles.map((r) => r.name),
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware to require specific role (e.g., admin, agent)
 */
function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user?.roles || !req.user.roles.includes(roleName)) {
      return res
        .status(403)
        .json({ error: `Forbidden: ${roleName} role required` });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
