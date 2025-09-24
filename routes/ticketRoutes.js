const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");

const router = express.Router();

router.post("/", authMiddleware, createTicket);       // create
router.get("/", authMiddleware, getTickets);          // list
router.get("/:id", authMiddleware, getTicket);        // detail
router.put("/:id", authMiddleware, updateTicket);     // update
router.delete("/:id", authMiddleware, deleteTicket);  // delete

module.exports = router;
