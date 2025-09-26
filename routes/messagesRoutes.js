// src/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/", messageController.createMessage);
router.get("/:ticketId", messageController.getMessages);

module.exports = router;
