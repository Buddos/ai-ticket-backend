const express = require("express");
const { Ticket } = require("../models");
const router = express.Router();

// Customer summary (filter by userId)
router.get("/customer/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const open = await Ticket.count({ where: { userId, status: "Open" } });
    const resolved = await Ticket.count({ where: { userId, status: "Resolved" } });
    const closed = await Ticket.count({ where: { userId, status: "Closed" } });

    res.json({ open, resolved, closed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agent/Admin summary (overall system metrics)
router.get("/admin", async (req, res) => {
  try {
    const open = await Ticket.count({ where: { status: "Open" } });
    const inProgress = await Ticket.count({ where: { status: "In Progress" } });
    const resolved = await Ticket.count({ where: { status: "Resolved" } });
    const closed = await Ticket.count({ where: { status: "Closed" } });

    // Priority distribution
    const highPriority = await Ticket.count({ where: { priority: "High" } });
    const mediumPriority = await Ticket.count({ where: { priority: "Medium" } });
    const lowPriority = await Ticket.count({ where: { priority: "Low" } });

    res.json({
      open,
      inProgress,
      resolved,
      closed,
      priorities: { highPriority, mediumPriority, lowPriority }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
