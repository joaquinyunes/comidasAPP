import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verify } from "jsonwebtoken";
import { prisma } from "./lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "tu-secreto-super-seguro-cambiar-en-produccion";

interface AuthenticatedSocket extends Socket {
  tenantId?: string;
  usuarioId?: string;
  roles?: string[];
  permisos?: string[];
}

// Mapa de salas activas: tenantId -> Set<socketId>
const tenantRooms = new Map<string, Set<string>>();

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticación
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return next(new Error("Token requerido"));
      }

      const decoded = verify(token, JWT_SECRET) as {
        tenantId: string;
        usuarioId: string;
        roles: string[];
        permisos: string[];
      };

      // Verificar usuario activo
      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.usuarioId },
        select: { id: true, activo: true, tenantId: true },
      });

      if (!usuario || !usuario.activo || usuario.tenantId !== decoded.tenantId) {
        return next(new Error("Usuario inválido"));
      }

      socket.tenantId = decoded.tenantId;
      socket.usuarioId = decoded.usuarioId;
      socket.roles = decoded.roles;
      socket.permisos = decoded.permisos;

      next();
    } catch (error) {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const { tenantId, usuarioId } = socket;

    console.log(`[Socket] Conectado: ${usuarioId} (tenant: ${tenantId})`);

    // Unirse a la sala del tenant
    socket.join(tenantId!);
    if (!tenantRooms.has(tenantId!)) {
      tenantRooms.set(tenantId!, new Set());
    }
    tenantRooms.get(tenantId!)!.add(socket.id);

    // Unirse a salas específicas por rol
    socket.roles?.forEach((rol) => {
      socket.join(`${tenantId}:${rol}`);
    });

    // Eventos de mesas
    socket.on("mesa:actualizar", async (data: { mesaId: string; estado: string }) => {
      try {
        const mesa = await prisma.mesa.findFirst({
          where: { id: data.mesaId, tenantId },
        });
        if (!mesa) return;

        await prisma.mesa.update({
          where: { id: data.mesaId },
          data: { estado: data.estado },
        });

        await prisma.auditLog.create({
          data: {
            tenantId,
            usuarioId,
            accion: "ACTUALIZAR_ESTADO_SOCKET",
            entidad: "Mesa",
            entidadId: data.mesaId,
            valorNuevo: { estado: data.estado },
          },
        });

        // Emitir a todos en el tenant
        io.to(tenantId!).emit("mesa:actualizada", { mesaId: data.mesaId, estado: data.estado });
      } catch (error) {
        console.error("[Socket] Error mesa:actualizar:", error);
      }
    });

    // Eventos de pedidos
    socket.on("pedido:nuevo", async (data) => {
      // Emitir a cocina/barra
      io.to(`${tenantId}:cocinero`).emit("pedido:nuevo", data);
      io.to(`${tenantId}:bartender`).emit("pedido:nuevo", data);
      // Emitir a mozos
      io.to(`${tenantId}:mozo`).emit("pedido:nuevo", data);
    });

    socket.on("pedido:actualizar", async (data: { pedidoId: string; estado: string; itemId?: string; itemEstado?: string }) => {
      io.to(tenantId!).emit("pedido:actualizado", data);
    });

    socket.on("pedido:item:estado", async (data: { pedidoId: string; itemId: string; estado: string }) => {
      io.to(`${tenantId}:cocinero`).emit("pedido:item:estado", data);
      io.to(`${tenantId}:bartender`).emit("pedido:item:estado", data);
      io.to(tenantId!).emit("pedido:item:estado", data);
    });

    // Eventos de KDS
    socket.on("kds:tomar", async (data: { pedidoId: string; itemId: string }) => {
      io.to(`${tenantId}:cocinero`).emit("kds:tomado", { ...data, usuarioId });
      io.to(tenantId!).emit("kds:tomado", { ...data, usuarioId });
    });

    socket.on("kds:completar", async (data: { pedidoId: string; itemId: string }) => {
      io.to(`${tenantId}:cocinero`).emit("kds:completado", data);
      io.to(`${tenantId}:mozo`).emit("kds:completado", data);
      io.to(tenantId!).emit("kds:completado", data);
    });

    // Eventos de caja/pagos
    socket.on("caja:movimiento", async (data) => {
      io.to(`${tenantId}:cajero`).emit("caja:movimiento", data);
      io.to(`${tenantId}:gerente`).emit("caja:movimiento", data);
    });

    // Eventos de inventario
    socket.on("stock:actualizar", async (data: { ingredienteId: string; sucursalId: string; cantidad: number }) => {
      io.to(`${tenantId}:gerente`).emit("stock:actualizado", data);
      io.to(`${tenantId}:compras`).emit("stock:actualizado", data);
    });

    // Suscripción a eventos específicos
    socket.on("suscribir", (eventos: string[]) => {
      eventos.forEach((evento) => {
        socket.join(`${tenantId}:${evento}`);
      });
    });

    socket.on("desuscribir", (eventos: string[]) => {
      eventos.forEach((evento) => {
        socket.leave(`${tenantId}:${evento}`);
      });
    });

    // Heartbeat
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    // Desconexión
    socket.on("disconnect", () => {
      console.log(`[Socket] Desconectado: ${usuarioId} (tenant: ${tenantId})`);
      const room = tenantRooms.get(tenantId!);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          tenantRooms.delete(tenantId!);
        }
      }
    });
  });

  // Funciones helper para emitir desde API routes
  io.emitToTenant = (tenantId: string, event: string, data: any) => {
    io.to(tenantId).emit(event, data);
  };

  io.emitToRole = (tenantId: string, rol: string, event: string, data: any) => {
    io.to(`${tenantId}:${rol}`).emit(event, data);
  };

  io.emitToModule = (tenantId: string, modulo: string, event: string, data: any) => {
    io.to(`${tenantId}:${modulo}`).emit(event, data);
  };

  return io;
}

// Extender tipo Socket.io
declare module "socket.io" {
  interface Server {
    emitToTenant: (tenantId: string, event: string, data: any) => void;
    emitToRole: (tenantId: string, rol: string, event: string, data: any) => void;
    emitToModule: (tenantId: string, modulo: string, event: string, data: any) => void;
  }
}