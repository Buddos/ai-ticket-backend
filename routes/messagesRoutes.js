// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// POST /api/messages
router.post("/", messageController.createMessage);

// GET /api/messages/:ticketId
router.get("/:ticketId", messageController.getMessages);

module.exports = router;
