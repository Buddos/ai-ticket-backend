const Message = require("../models/Message");

async function createMessage(ticketId, senderId, content) {
  return await Message.create({
    ticketId,
    senderId,
    content,
  });
}

async function getMessagesByTicket(ticketId) {
  return await Message.findAll({
    where: { ticketId },
    order: [["createdAt", "ASC"]],
  });
}

module.exports = {
  createMessage,
  getMessagesByTicket,
};
