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

// Reserva
export const ReservaSchema = z.object({
  clienteNombre: z.string().min(1).max(100).trim(),
  clienteTelefono: z.string().min(8).max(20).trim(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  cantidad: z.number().int().min(1).max(50),
  sector: z.string().max(50).trim(),
  notas: z.string().max(300).trim().optional(),
});

// Caja
export const CajaSchema = z.object({
  tipo: z.enum(["apertura", "cierre", "ingreso", "egreso"]),
  monto: z.number(),
  descripcion: z.string().min(1).max(200).trim(),
  metodoPago: z.enum(["efectivo", "tarjeta_credito", "tarjeta_debito", "qr", "transferencia"]).optional(),
});

// Proveedor
export const ProveedorSchema = z.object({
  nombre: z.string().min(1).max(100).trim(),
  cuit: z.string().regex(/^\d{2}-\d{8}-\d{1}$/, "CUIT inválido (XX-XXXXXXXX-X)"),
  telefono: z.string().min(8).max(20).trim(),
  email: z.string().email("Email inválido"),
  direccion: z.string().max(200).trim(),
  categorias: z.array(z.string().max(50)).max(10),
});

// Empleado
export const EmpleadoSchema = z.object({
  nombre: z.string().min(1).max(50).trim(),
  apellido: z.string().min(1).max(50).trim(),
  dni: z.string().regex(/^\d{2}\.\d{3}\.\d{3}$/, "DNI inválido (XX.XXX.XXX)"),
  telefono: z.string().min(8).max(20).trim(),
  email: z.string().email("Email inválido"),
  rol: z.string().max(50).trim(),
  sector: z.string().max(50).trim(),
});

// Cupón
export const CuponSchema = z.object({
  codigo: z.string().min(3).max(20).regex(/^[A-Z0-9-]+$/, "Solo mayúsculas, números y guiones"),
  descripcion: z.string().min(1).max(200).trim(),
  tipo: z.enum(["porcentaje", "monto_fijo", "2x1"]),
  valor: z.number().min(0),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  usosMaximos: z.number().int().positive(),
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
