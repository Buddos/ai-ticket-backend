// server.js
const express = require("express");
const cors = require("cors");
const http = require("http"); // HTTP wrapper for Socket.IO
const { Server } = require("socket.io");
require("dotenv").config();

const sequelize = require("./config/db");

// -----------------------------
// ✅ Load models
// -----------------------------
require("./models/User");
require("./models/Role");
require("./models/UserRole");
require("./models/Message");

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

// Root route
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
    return sequelize.sync(); // { alter: true } can be used during dev
  })
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ DB connection error:", err));

// -----------------------------
// ✅ Setup Socket.IO
// -----------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",                  // for local dev
      "https://your-frontend.vercel.app"        // your Vercel domain
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// import service for DB persistence
const messageService = require("./services/messageService");

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join a ticket-specific room
  socket.on("joinRoom", (ticketId) => {
    socket.join(`ticket_${ticketId}`);
    console.log(`📌 User ${socket.id} joined ticket_${ticketId}`);
  });

  // Handle new message
  socket.on("sendMessage", async (data) => {
    const { ticketId, message, senderId } = data;

    try {
      // ✅ Save to DB
      const savedMessage = await messageService.createMessage(
        ticketId,
        senderId,
        message
      );

      // ✅ Emit message to all clients in that room
      io.to(`ticket_${ticketId}`).emit("new_message", savedMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err.message);
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
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running on port ${PORT}`);
});
