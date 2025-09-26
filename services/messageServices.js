// services/messageService.js
const Message = require("../models/Message");

async function createMessage(ticketId, senderId, content) {
  return await Message.create({ ticketId, senderId, content });
}

async function getMessages(ticketId) {
  return await Message.findAll({
    where: { ticketId },
    order: [["createdAt", "ASC"]],
  });
}

module.exports = { createMessage, getMessages };
