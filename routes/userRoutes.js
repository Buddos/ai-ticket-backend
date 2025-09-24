const express = require("express");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/admin-dashboard",
  authenticate,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard" });
  }
);

module.exports = router;
