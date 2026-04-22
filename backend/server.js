import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Custom Architectures & Configs
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// ⚡ IMPORT LIVE SOCKET ENGINE
import { app, server } from './socket/socket.js';

// Initialization
dotenv.config();
connectDB(); // Connects securely to MongoDB

// Middleware Layers
// Allow local dev + production frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    const isLocalhost =
      typeof origin === "string" &&
      /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

    // Allow any vercel.app subdomain (covers all preview + production deployments)
    const isVercel = typeof origin === "string" && origin.endsWith('.vercel.app');
    const isOnRender = typeof origin === "string" && origin.endsWith('.onrender.com');

    if (!origin || allowedOrigins.includes(origin) || isLocalhost || isVercel || isOnRender) {
      callback(null, true);
    } else {
      console.error(`[CORS] Blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true 
}));

// IMPORTANT: Increased limit precisely to 50MB so massive Cloudinary base64 image strings never crash your endpoints
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Directing traffic down the required API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Landing heartbeat route
app.get('/', (req, res) => {
  res.send('Chat API & Socket Engine actively running! 🎉');
});

// Trailing Security Fallbacks (Catch-alls for 404s and 500 crashes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// IMPORTANT: We use `server.listen()` instead of `app.listen()` so Socket.IO runs concurrently alongside Express!
server.listen(PORT, () => {
  console.log(`Server and Socket.IO are LIVE on port ${PORT}`);
});
