import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getTenantBySlug, getDefaultSucursal } from "@/lib/prisma";
import { strictRateLimit } from "@/lib/rate-limit";
import { SITE_TENANT_SLUG } from "@/lib/tenant-slug";
import { fechaValida, horaValida } from "@/lib/reservas/fecha-hora";

// ============================================
// POST /api/publico/reservas
// Reserva pública desde la landing (sin auth).
// ============================================

export const runtime = "nodejs";

const ReservaSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido").max(100),
  telefono: z.string().trim().min(6, "Teléfono inválido").max(30),
  email: z.string().email().max(255).optional().or(z.literal("")),
  fecha: z.string().refine(fechaValida, "Fecha inválida (AAAA-MM-DD)"),
  hora: z.string().refine(horaValida, "Hora inválida (HH:MM)"),
  cantidadPersonas: z.coerce.number().int().min(1).max(20),
  zona: z.string().max(50).optional(),
  notas: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const limitada = await strictRateLimit(request);
    if (limitada) return limitada;

    const body = await request.json();
    const parsed = ReservaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }
    const data = parsed.data;
    // El restaurante lo define el servidor (TENANT_SLUG): un despliegue = un restaurante.
    const slug = SITE_TENANT_SLUG;

    const tenant = await getTenantBySlug(slug);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }
    const sucursal = await getDefaultSucursal(tenant.id);
    if (!sucursal) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }

    const reserva = await prisma.reserva.create({
      data: {
        tenantId: tenant.id,
        sucursalId: sucursal.id,
        nombreCliente: data.nombre,
        telefono: data.telefono,
        email: data.email || null,
        fecha: new Date(data.fecha),
        hora: new Date(`${data.fecha}T${data.hora}`),
        cantidadPersonas: data.cantidadPersonas,
        zona: data.zona || null,
        notas: data.notas || null,
        estado: "pendiente",
      },
    });

    return NextResponse.json({ success: true, reservaId: reserva.id }, { status: 201 });
  } catch (error) {
    console.error("Error reserva pública:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
