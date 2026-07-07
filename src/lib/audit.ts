import { prisma } from "./prisma";

// ============================================
// SERVICIO DE AUDITORÍA
// ============================================

export type AccionAudit = "create" | "update" | "delete" | "login" | "logout" | "export" | "config_change";

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  usuarioId: string | null;
  accion: string;
  entidad: string;
  entidadId: string | null;
  valorAnterior: unknown;
  valorNuevo: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export class AuditService {
  // Registrar evento de auditoría
  static async log(data: {
    tenantId: string;
    usuarioId?: string;
    accion: AccionAudit;
    entidad: string;
    entidadId?: string;
    valorAnterior?: Record<string, unknown>;
    valorNuevo?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          usuarioId: data.usuarioId,
          accion: data.accion,
          entidad: data.entidad,
          entidadId: data.entidadId,
          valorAnterior: data.valorAnterior ? JSON.parse(JSON.stringify(data.valorAnterior)) : undefined,
          valorNuevo: data.valorNuevo ? JSON.parse(JSON.stringify(data.valorNuevo)) : undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // No fallar la operación principal por un error de auditoría
      console.error("Error al registrar auditoría:", error);
    }
  }

  // Auditar creación
  static async logCreate(
    tenantId: string,
    entidad: string,
    entidadId: string,
    datos: Record<string, unknown>,
    usuarioId?: string
  ) {
    return this.log({
      tenantId,
      usuarioId,
      accion: "create",
      entidad,
      entidadId,
      valorNuevo: datos,
    });
  }

  // Auditar actualización
  static async logUpdate(
    tenantId: string,
    entidad: string,
    entidadId: string,
    antes: Record<string, unknown>,
    despues: Record<string, unknown>,
    usuarioId?: string
  ) {
    return this.log({
      tenantId,
      usuarioId,
      accion: "update",
      entidad,
      entidadId,
      valorAnterior: antes,
      valorNuevo: despues,
    });
  }

  // Auditar eliminación
  static async logDelete(
    tenantId: string,
    entidad: string,
    entidadId: string,
    datos: Record<string, unknown>,
    usuarioId?: string
  ) {
    return this.log({
      tenantId,
      usuarioId,
      accion: "delete",
      entidad,
      entidadId,
      valorAnterior: datos,
    });
  }

  // Auditar login
  static async logLogin(
    tenantId: string,
    usuarioId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log({
      tenantId,
      usuarioId,
      accion: "login",
      entidad: "usuario",
      entidadId: usuarioId,
      ipAddress,
      userAgent,
    });
  }

  // Auditar exportación de datos
  static async logExport(
    tenantId: string,
    entidad: string,
    formato: string,
    usuarioId?: string
  ) {
    return this.log({
      tenantId,
      usuarioId,
      accion: "export",
      entidad,
      valorNuevo: { formato },
    });
  }

  // Consultar logs
  static async query(params: {
    tenantId: string;
    entidad?: string;
    usuarioId?: string;
    accion?: AccionAudit;
    desde?: Date;
    hasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
    };

    if (params.entidad) where.entidad = params.entidad;
    if (params.usuarioId) where.usuarioId = params.usuarioId;
    if (params.accion) where.accion = params.accion;
    if (params.desde || params.hasta) {
      where.createdAt = {};
      if (params.desde) (where.createdAt as Record<string, Date>).gte = params.desde;
      if (params.hasta) (where.createdAt as Record<string, Date>).lte = params.hasta;
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.limit || 100,
      skip: params.offset || 0,
    });
  }

  // Estadísticas de auditoría
  static async stats(tenantId: string, desde: Date, hasta: Date) {
    const logs = await prisma.auditLog.findMany({
      where: {
        tenantId,
        createdAt: { gte: desde, lte: hasta },
      },
    });

    const porAccion: Record<string, number> = {};
    const porEntidad: Record<string, number> = {};
    const porUsuario: Record<string, number> = {};

    for (const log of logs) {
      porAccion[log.accion] = (porAccion[log.accion] || 0) + 1;
      porEntidad[log.entidad] = (porEntidad[log.entidad] || 0) + 1;
      if (log.usuarioId) {
        porUsuario[log.usuarioId] = (porUsuario[log.usuarioId] || 0) + 1;
      }
    }

    return {
      total: logs.length,
      porAccion,
      porEntidad,
      porUsuario,
    };
  }
}
