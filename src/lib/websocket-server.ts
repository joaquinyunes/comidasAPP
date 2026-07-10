import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocketServer } from "@/lib/socket-server";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Inicializar socket server
initializeSocketServer(io);

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🔌 Socket.io server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando socket server...");
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT recibido, cerrando socket server...");
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});