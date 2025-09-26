// src/controllers/messageController.js
const messageService = require("../services/messageService");

async function createMessage(req, res) {
  try {
    const { ticketId, senderId, content } = req.body;
    const newMessage = await messageService.createMessage(ticketId, senderId, content);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMessages(req, res) {
  try {
    const { ticketId } = req.params;
    const messages = await messageService.getMessages(ticketId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createMessage,
  getMessages,
};
