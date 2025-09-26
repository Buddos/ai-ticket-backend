// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");           // ✅ http wrapper
const { Server } = require("socket.io"); // ✅ Socket.IO
require("dotenv").config();

const sequelize = require("./config/db");

// -----------------------------
// ✅ Load models
// -----------------------------
require("./models/User");
require("./models/Role");
require("./models/UserRole");
require("./models/Message"); // <-- NEW

// -----------------------------
// ✅ Import routes
// -----------------------------
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const messageRoutes = require("./routes/messageRoutes");

// -----------------------------
// ✅ Express app setup
// -----------------------------
const app = express();
app.use(cors());
app.use(express.json());

// Root test route
app.get("/", (req, res) => {
  res.send("Support System API with Sequelize + Socket.IO is running...");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/messages", messageRoutes);

// -----------------------------
// ✅ Database connection + sync
// -----------------------------
sequelize.authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connected");
    return sequelize.sync(); // { alter: true } for dev schema updates
  })
  .then(() => console.log("✅ Database synced"))
  .catch(err => console.error("❌ DB connection error:", err));

// -----------------------------
// ✅ Setup Socket.IO
// -----------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // change to frontend domain when deployed
    methods: ["GET", "POST"],
  },
});

// import service for DB persistence
const messageService = require("./services/messageService");

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // join a ticket room
  socket.on("joinRoom", (ticketId) => {
    socket.join(`ticket_${ticketId}`);
    console.log(`📌 User ${socket.id} joined ticket_${ticketId}`);
  });

  // send + save message
  socket.on("sendMessage", async (data) => {
    const { ticketId, message, senderId } = data;

    try {
      // Save message in DB
      const savedMessage = await messageService.createMessage(ticketId, senderId, message);

      // Broadcast to room
      io.to(`ticket_${ticketId}`).emit("new_message", savedMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// -----------------------------
// ✅ Start server
// -----------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + WebSocket running on port ${PORT}`)
);
