import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with strict CORS policies
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

// A hashmap that stores exactly which socket.id belongs to which database userId
// Format: { "mongodb_user_id_1": "socket_id_abc123", "mongodb_user_id_2": "socket_id_xyz987" }
const userSocketMap = {}; 

// Helper function to extract a specific socket ID at blazing speed
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user magically connected:", socket.id);

  // 1. When the frontend connects, it secretly passes its Database User ID in the connection packet
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    // We lock their identity into our Map
    userSocketMap[userId] = socket.id;
  }

  // 2. Broadcast to EVERYONE currently online! 
  // Object.keys(userSocketMap) returns an array like ["id_1", "id_2"]
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- Real-time Typing Signal Handlers ---
  socket.on("typing", ({ senderId, receiverId }) => {
     const receiverSocketId = getReceiverSocketId(receiverId);
     if(receiverSocketId) {
        // Direct beam: specifically target ONLY the person they are typing to!
        io.to(receiverSocketId).emit("typing", { senderId });
     }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
     const receiverSocketId = getReceiverSocketId(receiverId);
     if(receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId });
     }
  });

  // 3. Cleanup logic when they close the browser tab
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if(userId) {
       delete userSocketMap[userId]; // scrub them from the server map
    }
    // Instantly notify everyone else so their green dot turns grey
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// We must export these specifically so server.js can use the exact same instance!
export { app, io, server };
