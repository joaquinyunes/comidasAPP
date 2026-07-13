import { z } from "zod";
import { prisma } from "./prisma";

// ============================================
// SCHEMAS DE VALIDACIÓN (Zod)
// ============================================

// Tenant
export const TenantSchema = z.object({
  nombre: z.string().min(1).max(100).trim(),
  subdominio: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  direccion: z.string().max(200).optional(),
});

// Producto
export const ProductoSchema = z.object({
  nombre: z.string().min(1).max(100).trim(),
  descripcion: z.string().max(500).trim().optional(),
  precioBase: z.number().positive("El precio debe ser positivo"),
  categoriaId: z.string().uuid("ID de categoría inválido"),
  imagenUrl: z.string().url("URL inválida").optional().nullable(),
  codigoBarras: z.string().max(50).optional(),
  disponible: z.boolean().default(true),
});

// Pedido
export const PedidoSchema = z.object({
  mesaId: z.string().uuid("ID de mesa inválido"),
  mozoId: z.string().uuid("ID de mozo inválido"),
  tipo: z.enum(["mesa", "delivery", "retiro"]),
  items: z.array(z.object({
    productoId: z.string().uuid("ID de producto inválido"),
    cantidad: z.number().int().positive("La cantidad debe ser positiva"),
    notas: z.string().max(200).trim().optional(),
  })).min(1, "Debe haber al menos un item"),
  notas: z.string().max(500).trim().optional(),
});

// Caja
export const CajaSchema = z.object({
  tipo: z.enum(["apertura", "cierre", "ingreso", "egreso"]),
  monto: z.number(),
  descripcion: z.string().min(1).max(200).trim(),
  metodoPago: z.enum(["efectivo", "tarjeta_credito", "tarjeta_debito", "qr", "transferencia"]).optional(),
});

// ============================================
// UTILIDADES DE VALIDACIÓN
// ============================================

export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: string[];
};

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
}

// Sanitizar strings contra XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Validar que el ID sea UUID válido
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Rate limiting simple en memoria
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// ============================================
// SCHEMAS FALTANTES PARA MÓDULOS CORE
// ============================================

// Mesa
export const MesaSchema = z.object({
  numero: z.string().min(1).max(10).trim(),
  capacidad: z.number().int().positive().max(50),
  sectorId: z.string().uuid("ID de sector inválido"),
  posicionX: z.number().min(0).optional(),
  posicionY: z.number().min(0).optional(),
  activa: z.boolean().default(true),
});

// Sector
export const SectorSchema = z.object({
  nombre: z.string().min(1).max(100).trim(),
  tipo: z.enum(["interior", "exterior", "privado", "barra", "terraza"]).optional(),
  orden: z.number().int().min(0).default(0),
});

// Reserva
export const ReservaSchema = z.object({
  clienteNombre: z.string().min(1).max(100).trim(),
  clienteTelefono: z.string().min(8).max(20).trim(),
  clienteEmail: z.string().email().optional().nullable(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  cantidadPersonas: z.number().int().min(1).max(50),
  sector: z.string().max(50).trim().optional(),
  occasion: z.string().max(100).trim().optional(),
  notas: z.string().max(300).trim().optional(),
  mesaId: z.string().uuid().optional(),
});

// Inventario - Ingrediente
export const IngredienteSchema = z.object({
  nombre: z.string().min(1).max(255).trim(),
  unidadMedida: z.string().min(1).max(50).trim(),
  costoUnitario: z.number().positive().optional(),
  stockMinimo: z.number().nonnegative().optional(),
  stockMaximo: z.number().nonnegative().optional(),
  proveedorId: z.string().uuid().optional(),
  activo: z.boolean().default(true),
});

// Inventario - Movimiento de stock
export const StockMovimientoSchema = z.object({
  tipo: z.string().min(1).max(50).trim(),
  cantidad: z.number().positive("La cantidad debe ser positiva"),
  motivo: z.string().max(300).trim().optional(),
  origen: z.string().max(50).trim().optional(),
  ingredienteId: z.string().uuid(),
  sucursalId: z.string().uuid(),
  pedidoId: z.string().uuid().optional(),
  usuarioId: z.string().uuid().optional(),
});

// Inventario - Stock por sucursal
export const StockPorSucursalSchema = z.object({
  sucursalId: z.string().uuid(),
  ingredienteId: z.string().uuid(),
  cantidadActual: z.number().nonnegative(),
  cantidadReservada: z.number().nonnegative().default(0),
  lote: z.string().max(100).optional(),
  fechaVencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Compras - Proveedor
export const ProveedorSchema = z.object({
  nombre: z.string().min(1).max(255).trim(),
  contactoNombre: z.string().max(100).trim().optional(),
  contactoEmail: z.string().email().optional().nullable(),
  contactoTelefono: z.string().max(50).trim().optional(),
  direccion: z.string().max(500).trim().optional(),
  tiempoEntregaDias: z.number().int().positive().optional(),
  calificacion: z.number().min(0).max(5).optional(),
  activo: z.boolean().default(true),
});

// Compras - Orden de compra
export const OrdenCompraSchema = z.object({
  proveedorId: z.string().uuid(),
  sucursalId: z.string().uuid(),
  items: z.array(z.object({
    ingredienteId: z.string().uuid(),
    cantidad: z.number().positive(),
    precioUnitario: z.number().positive(),
  })).min(1),
  notas: z.string().max(500).trim().optional(),
});

// RRHH - Empleado
export const EmpleadoSchema = z.object({
  usuarioId: z.string().uuid(),
  sucursalId: z.string().uuid(),
  cargo: z.string().max(100).trim().optional(),
  fechaIngreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  salarioBase: z.number().positive().optional(),
  tipoContrato: z.enum(["tiempo_completo", "medio_tiempo", "temporal", "contratista"]).optional(),
  estado: z.enum(["activo", "inactivo", "licencia", "despedido"]).default("activo"),
});

// RRHH - Turno
export const TurnoSchema = z.object({
  empleadoId: z.string().uuid(),
  sucursalId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/),
  estado: z.enum(["asignado", "confirmado", "en_curso", "completado", "cancelado"]).default("asignado"),
});

// RRHH - Asistencia
export const AsistenciaSchema = z.object({
  empleadoId: z.string().uuid(),
  turnoId: z.string().uuid().optional(),
  entrada: z.string().datetime().optional(),
  salida: z.string().datetime().optional(),
});

// Marketing - Campaña
export const CampanaSchema = z.object({
  nombre: z.string().min(1).max(100).trim(),
  descripcion: z.string().max(500).trim().optional(),
  tipo: z.enum(["email", "sms", "push", "whatsapp", "redes_sociales"]),
  estado: z.enum(["borrador", "programada", "enviando", "enviada", "pausada", "cancelada"]).default("borrador"),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  publicoObjetivo: z.object({
    niveles: z.array(z.string()).optional(),
    minPuntos: z.number().optional(),
    maxPuntos: z.number().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  contenido: z.object({
    asunto: z.string().max(200).optional(),
    cuerpo: z.string().optional(),
    imagenUrl: z.string().url().optional(),
    ctaUrl: z.string().url().optional(),
    ctaTexto: z.string().max(50).optional(),
  }).optional(),
});

// Marketing - Cupón
export const CuponSchema = z.object({
  codigo: z.string().min(3).max(20).regex(/^[A-Z0-9-]+$/, "Solo mayúsculas, números y guiones"),
  descripcion: z.string().min(1).max(200).trim(),
  tipo: z.enum(["porcentaje", "monto_fijo", "2x1"]),
  valor: z.number().min(0),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  usosMaximos: z.number().int().positive(),
  usosPorCliente: z.number().int().positive().default(1),
  minimoCompra: z.number().nonnegative().default(0),
  productosAplicables: z.array(z.string().uuid()).optional(),
  categoriasAplicables: z.array(z.string().uuid()).optional(),
  activo: z.boolean().default(true),
});

// Auditoría
export const AuditLogSchema = z.object({
  accion: z.string().min(1).max(100),
  entidad: z.string().min(1).max(100),
  entidadId: z.string().uuid().optional(),
  valorAnterior: z.record(z.string(), z.unknown()).optional(),
  valorNuevo: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// IA - Predicción
export const PrediccionSchema = z.object({
  tipo: z.enum(["ventas", "stock", "demanda", "personal"]),
  modelo: z.string().max(50),
    parametros: z.record(z.string(), z.unknown()),
  horizonteDias: z.number().int().min(1).max(90),
});

// Configuración Tenant
export const ConfigTenantSchema = z.object({
  nombre: z.string().min(1).max(100).trim(),
  moneda: z.string().length(3).default("ARS"),
  zonaHoraria: z.string().default("America/Argentina/Buenos_Aires"),
  idioma: z.string().length(2).default("es"),
  configuracionPOS: z.object({
    mostrarPropina: z.boolean().default(true),
    propinaSugerida: z.array(z.number()).default([10, 15, 20]),
    permitirPedidosSinMozo: z.boolean().default(false),
    tiempoMaximoEsperaMin: z.number().int().positive().default(45),
  }).optional(),
  configuracionCocina: z.object({
    tiempoAlertaAmarilloMin: z.number().int().positive().default(15),
    tiempoAlertaRojaMin: z.number().int().positive().default(30),
    agruparPorSector: z.boolean().default(true),
    imprimirAutomatico: z.boolean().default(false),
  }).optional(),
  notificaciones: z.object({
    emailNuevosPedidos: z.boolean().default(false),
    pushStockBajo: z.boolean().default(true),
    emailCierreCaja: z.boolean().default(true),
  }).optional(),
});

// ============================================
// BLOQUE 2 — MICRO-FASES 2.1 / 2.2 / 2.3
// ============================================

// 2.1 — Checklist de apertura/cierre
export const ChecklistItemInputSchema = z.object({
  descripcion: z.string().min(1).max(300).trim(),
  obligatorio: z.boolean().default(true),
  orden: z.number().int().min(0).default(0),
});

export const ChecklistPlantillaSchema = z.object({
  tipo: z.enum(["APERTURA", "CIERRE"]),
  nombre: z.string().min(1).max(100).trim(),
  sucursalId: z.string().uuid().optional(),
  items: z.array(ChecklistItemInputSchema).min(1, "Debe haber al menos un ítem"),
});

export const ChecklistEjecucionSchema = z.object({
  plantillaId: z.string().uuid(),
  sucursalId: z.string().uuid(),
  turnoId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        itemId: z.string().uuid(),
        marcado: z.boolean().default(false),
        valor: z.string().max(500).optional(),
      })
    )
    .min(1),
});

// 2.1 — Fichaje (entrada/salida/break)
export const FichajeSchema = z.object({
  empleadoId: z.string().uuid(),
  turnoId: z.string().uuid().optional(),
  tipo: z.enum(["ENTRADA", "SALIDA", "BREAK_IN", "BREAK_OUT"]),
});

// 2.2 — Anulación trazable de ítem de pedido
export const AnulacionSchema = z.object({
  pedidoItemId: z.string().uuid(),
  motivo: z.string().min(1).max(100).trim(),
  motivoLibre: z.string().max(300).trim().optional(),
});

// 2.2 — Cola offline (LAN local / sync degradado)
export const OfflineItemSchema = z.object({
  ruta: z.string().min(1),
  metodo: z.enum(["POST", "PUT", "DELETE", "PATCH"]).default("POST"),
  payload: z.record(z.string(), z.unknown()).default({}),
  clientId: z.string().min(1),
});

export const OfflineSyncSchema = z.object({
  items: z.array(OfflineItemSchema).min(1).max(100),
});

// 2.3 — Recetas centralizadas (catálogo por tenant)
export const RecetaCentralizadaSchema = z.object({
  productoId: z.string().uuid(),
  nombre: z.string().max(255).trim().optional(),
  porciones: z.number().int().positive().default(1),
  instrucciones: z.string().max(2000).optional(),
  ingredientes: z
    .array(
      z.object({
        ingredienteId: z.string().uuid(),
        cantidad: z.number().positive(),
        unidad: z.string().min(1).max(50),
        opcional: z.boolean().default(false),
      })
    )
    .min(1),
});

// 2.3 — Configuración por sucursal (multi-sucursal)
export const SucursalConfigSchema = z.object({
  nombre: z.string().min(1).max(255).trim().optional(),
  direccion: z.string().max(500).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email().optional().nullable(),
  horario: z.record(z.string(), z.unknown()).optional(),
  activa: z.boolean().optional(),
});

// 2.4 — Fidelización: registro de visita en mesa
export const VisitaMesaSchema = z.object({
  clienteId: z.string().uuid().optional(),
  mesaId: z.string().uuid(),
  sucursalId: z.string().uuid().optional(),
  personas: z.number().int().positive().max(50).optional(),
  monto: z.number().nonnegative().optional(),
});

// 2.4 — Reconocimiento por QR (vincular cliente a mesa)
export const ReconocimientoSchema = z.object({
  mesaId: z.string().uuid(),
  clienteId: z.string().uuid(),
});

// ============================================
// TIPOS EXPORTADOS
// ============================================
export type MesaInput = z.infer<typeof MesaSchema>;
export type SectorInput = z.infer<typeof SectorSchema>;
export type ReservaInput = z.infer<typeof ReservaSchema>;
export type IngredienteInput = z.infer<typeof IngredienteSchema>;
export type StockPorSucursalInput = z.infer<typeof StockPorSucursalSchema>;
export type ProveedorInput = z.infer<typeof ProveedorSchema>;
export type OrdenCompraInput = z.infer<typeof OrdenCompraSchema>;
export type EmpleadoInput = z.infer<typeof EmpleadoSchema>;
export type TurnoInput = z.infer<typeof TurnoSchema>;
export type AsistenciaInput = z.infer<typeof AsistenciaSchema>;
export type CampanaInput = z.infer<typeof CampanaSchema>;
export type CuponInput = z.infer<typeof CuponSchema>;
export type AuditLogInput = z.infer<typeof AuditLogSchema>;
export type PrediccionInput = z.infer<typeof PrediccionSchema>;
export type ConfigTenantInput = z.infer<typeof ConfigTenantSchema>;
export type ChecklistPlantillaInput = z.infer<typeof ChecklistPlantillaSchema>;
export type ChecklistEjecucionInput = z.infer<typeof ChecklistEjecucionSchema>;
export type FichajeInput = z.infer<typeof FichajeSchema>;
export type AnulacionInput = z.infer<typeof AnulacionSchema>;
export type OfflineSyncInput = z.infer<typeof OfflineSyncSchema>;
export type RecetaCentralizadaInput = z.infer<typeof RecetaCentralizadaSchema>;
export type SucursalConfigInput = z.infer<typeof SucursalConfigSchema>;
export type VisitaMesaInput = z.infer<typeof VisitaMesaSchema>;
export type ReconocimientoInput = z.infer<typeof ReconocimientoSchema>;

// Cliente autogestión: pedido desde el salón
export const ClientePedidoItemSchema = z.object({
  productoId: z.string().uuid("ID de producto inválido"),
  cantidad: z.number().int().positive().max(20).default(1),
  notas: z.string().max(200).trim().optional(),
});
export const ClientePedidoSchema = z.object({
  mesaId: z.string().uuid("ID de mesa inválido"),
  clienteId: z.string().uuid().optional(),
  items: z.array(ClientePedidoItemSchema).min(1, "El pedido debe tener al menos un item").max(30),
});
export type ClientePedidoItemInput = z.infer<typeof ClientePedidoItemSchema>;
export type ClientePedidoInput = z.infer<typeof ClientePedidoSchema>;
