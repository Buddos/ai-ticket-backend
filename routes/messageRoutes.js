// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageService = require("../services/messageService");

// POST: create a new message
router.post("/", async (req, res) => {
  const { ticketId, senderId, content } = req.body;

  try {
    const message = await messageService.createMessage(ticketId, senderId, content);
    res.status(201).json(message);
  } catch (err) {
    console.error("❌ Error creating message:", err.message);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// GET: fetch messages for a ticket
router.get("/:ticketId", async (req, res) => {
  try {
    const messages = await messageService.getMessagesByTicket(req.params.ticketId);
    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
