import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getTenantBySlug, getDefaultSucursal } from "@/lib/prisma";

// ============================================
// POST /api/publico/reservas
// Reserva pública desde la landing (sin auth).
// ============================================

export const runtime = "nodejs";

const ReservaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  telefono: z.string().min(6, "Teléfono inválido"),
  email: z.string().email().optional().or(z.literal("")),
  fecha: z.string().min(1),
  hora: z.string().min(1),
  cantidadPersonas: z.coerce.number().int().min(1).max(20),
  zona: z.string().optional(),
  notas: z.string().optional(),
  tenant: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ReservaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const slug = data.tenant || "pizzaria-demo";

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
