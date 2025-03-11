const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
app.use(cors());
app.use(express.json());
// Store active chats (In production, replace this with a database)
let activeChats = {};
// WebSocket connection
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  socket.on("joinChat", ({ storefrontId }) => {
    console.log("joinchat", storefrontId);
    socket.join(storefrontId);
    if (!activeChats[storefrontId]) {
      activeChats[storefrontId] = [];
    }
    socket.emit("chatHistory", activeChats[storefrontId]);
  });
  socket.on("sendMessage", ({ storefrontId, message }) => {
    console.log("sendMessage", message);
    const chatMessage = { sender: "Operator", message, timestamp: new Date() };
    if (!activeChats[storefrontId]) {
      activeChats[storefrontId] = [];
    }
    activeChats[storefrontId].push(chatMessage);
    io.to(storefrontId).emit("receiveMessage", chatMessage);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});
app.get("/", (req, res) => {
  res.send("Chat Dashboard API Running");
});
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`Chat Dashboard running on port ${PORT}`));