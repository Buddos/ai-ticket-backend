// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");           // ✅ import http
const { Server } = require("socket.io"); // ✅ import Socket.IO
require("dotenv").config();

const sequelize = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes"); // make sure this exists

// Load models so Sequelize knows them
require("./models/User");
require("./models/Role");
require("./models/UserRole");

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

// DB connection + sync
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
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("joinRoom", (ticketId) => {
    socket.join(`ticket_${ticketId}`);
    console.log(`📌 User ${socket.id} joined ticket_${ticketId}`);
  });

  socket.on("sendMessage", (data) => {
    const { ticketId, message, sender } = data;

    // TODO: Save message in DB with Sequelize (Message.create)

    // Emit to all clients in this room
    io.to(`ticket_${ticketId}`).emit("new_message", {
      ticketId,
      sender,
      message,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

//Dashboard 
const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// Start server with HTTP wrapper
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server + WebSocket running on port ${PORT}`));
