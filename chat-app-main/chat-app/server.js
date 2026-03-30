import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

// Allow the browser to call this server from any dev port.
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket.IO client connected:", socket.id);

  // Client sends: { text: string, timestamp: string }
  socket.on("chat:message", (payload) => {
    // Ensure required fields exist before broadcasting.
    const safePayload = {
      id: payload?.id ?? `${socket.id}_${Date.now()}`,
      senderId: payload?.senderId ?? socket.id,
      timestamp: payload?.timestamp ?? new Date().toISOString(),
      text: String(payload?.text ?? ""),
    };

    // Broadcast to all connected clients (including the sender).
    io.emit("chat:message", safePayload);
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

