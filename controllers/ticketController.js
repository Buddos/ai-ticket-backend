const Ticket = require("../models/Ticket");
const User = require("../models/User");

// ✅ Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      userId: req.user.id, // from authMiddleware
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// ✅ Get Tickets (customer → own, admin/agent → all)
exports.getTickets = async (req, res) => {
  try {
    let where = {};
    if (!req.user.roles.includes("admin") && !req.user.roles.includes("agent")) {
      where.userId = req.user.id;
    }

    const tickets = await Ticket.findAll({
      where,
      include: [{ model: User, attributes: ["id", "full_name", "email"] }],
    });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// ✅ Get Single Ticket
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [{ model: User, attributes: ["id", "full_name", "email"] }],
    });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // customers can only see their own tickets
    if (!req.user.roles.includes("admin") && !req.user.roles.includes("agent") && ticket.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};

// ✅ Update Ticket (status or details)
exports.updateTicket = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // only admin/agent can change status
    if (!req.user.roles.includes("admin") && !req.user.roles.includes("agent")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await ticket.update({ status });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update ticket" });
  }
};

// ✅ Delete Ticket (admin only)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (!req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await ticket.destroy();
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};
