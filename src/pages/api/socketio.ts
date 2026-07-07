import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";

// ============================================
// CONFIGURACIÓN DEL SERVIDOR SOCKET.IO
// ============================================

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const resAny = res as any;
  if (!resAny.socket?.server?.io) {
    const httpServer: NetServer = resAny.socket.server as NetServer;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    // ============================================
    // MIDDLEWARE DE AUTENTICACIÓN
    // ============================================
    io.use((socket, next) => {
      const tenantId = socket.handshake.auth.tenantId;
      if (!tenantId) {
        return next(new Error("Tenant ID requerido"));
      }
      // En el futuro: validar JWT token
      socket.data.tenantId = tenantId;
      next();
    });

    // ============================================
    // CONEXIÓN
    // ============================================
    io.on("connection", (socket) => {
      const tenantId = socket.data.tenantId;
      console.log(`🔌 Cliente conectado: ${socket.id} (tenant: ${tenantId})`);

      // Unirse a la sala del tenant
      socket.join(`tenant:${tenantId}`);

      // ============================================
      // EVENTOS DE PEDIDOS
      // ============================================
      socket.on("pedido:nuevo", (data) => {
        console.log(`📦 Nuevo pedido en tenant ${tenantId}:`, data);
        // Emitir a todos los clientes del mismo tenant
        io.to(`tenant:${tenantId}`).emit("pedido:nuevo", {
          ...data,
          tenantId,
          timestamp: new Date(),
        });
      });

      socket.on("pedido:actualizado", (data) => {
        console.log(`📦 Pedido actualizado en tenant ${tenantId}:`, data);
        io.to(`tenant:${tenantId}`).emit("pedido:actualizado", {
          ...data,
          tenantId,
          timestamp: new Date(),
        });
      });

      socket.on("pedido:estado_cambiado", (data) => {
        console.log(`📦 Estado cambiado en tenant ${tenantId}:`, data);
        io.to(`tenant:${tenantId}`).emit("pedido:estado_cambiado", {
          ...data,
          tenantId,
          timestamp: new Date(),
        });
      });

      // ============================================
      // EVENTOS DE KDS
      // ============================================
      socket.on("kds:pedido_listo", (data) => {
        console.log(`🍳 Pedido listo en tenant ${tenantId}:`, data);
        io.to(`tenant:${tenantId}`).emit("kds:pedido_listo", {
          ...data,
          tenantId,
          timestamp: new Date(),
        });
      });

      // ============================================
      // EVENTOS DE MESAS
      // ============================================
      socket.on("mesa:actualizada", (data) => {
        console.log(`🪑 Mesa actualizada en tenant ${tenantId}:`, data);
        io.to(`tenant:${tenantId}`).emit("mesa:actualizada", {
          ...data,
          tenantId,
          timestamp: new Date(),
        });
      });

      // ============================================
      // EVENTOS DE CAJA
      // ============================================
      socket.on("caja:movimiento", (data) => {
        console.log(`💰 Movimiento de caja en tenant ${tenantId}:`, data);
        io.to(`tenant:${tenantId}`).emit("caja:movimiento", {
          ...data,
          tenantId,
          timestamp: new Date(),
        });
      });

      // ============================================
      // DESCONEXIÓN
      // ============================================
      socket.on("disconnect", () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
      });
    });

    resAny.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
