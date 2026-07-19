import { NextResponse } from "next/server";
import { prisma, getTenantBySlug, getDefaultSucursal } from "@/lib/prisma";

// ============================================
// GET /api/publico/landing
// Datos públicos de la pizzería para la home.
// Lee desde la BD (tenant "pizzaria-demo").
// ============================================

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("tenant") || "pizzaria-demo";

  try {
    const tenant = await getTenantBySlug(slug);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }
    const tenantId = tenant.id;

    const [sucursal, categorias, mesas, promos, feedbacks, campanas] = await Promise.all([
      getDefaultSucursal(tenantId),
      prisma.categoriaMenu.findMany({
        where: { tenantId },
        orderBy: { orden: "asc" },
        include: {
          productos: {
            where: { disponible: true },
            orderBy: { nombre: "asc" },
          },
        },
      }),
      prisma.mesa.findMany({
        where: { tenantId },
        orderBy: { numero: "asc" },
      }),
      prisma.promocion.findMany({
        where: { tenantId, activa: true },
        take: 6,
      }),
      prisma.feedback.findMany({
        where: { tenantId, calificacion: "FELIZ" },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.campana.findMany({
        where: { tenantId, estado: "activa" },
        take: 4,
      }),
    ]);

    const carta = categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      productos: c.productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        imagenUrl: p.imagenUrl,
        tiempoPreparacionMin: p.tiempoPreparacionMin,
        nivelPicante: p.nivelPicante,
        calorias: p.calorias,
        alergenos: p.alergenos,
        destacado: p.destacado,
        tipo: p.tipo,
      })),
    }));

    const mesasPublicas = mesas.map((m) => ({
      id: m.id,
      numero: m.numero,
      capacidad: m.capacidad,
      estado: m.estado,
      sector: m.sector,
    }));

    const promociones = [
      ...promos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        tipo: p.tipo,
      })),
      ...campanas.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        descripcion: c.descripcion,
        tipo: "CAMPANA",
      })),
    ];

    const reseñas = feedbacks.map((f) => ({
      id: f.id,
      calificacion: f.calificacion,
      motivo: f.motivo,
      cliente: "Cliente",
      mesa: null,
    }));

    return NextResponse.json({
      tenant: { nombre: tenant.nombre, slug: tenant.slug },
      sucursal: sucursal
        ? {
            nombre: sucursal.nombre,
            direccion: sucursal.direccion,
            telefono: sucursal.telefono,
            ciudad: sucursal.ciudad,
          }
        : null,
      carta,
      mesas: mesasPublicas,
      promociones,
      reseñas,
    });
  } catch (error) {
    console.error("Error landing público:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Error interno", detail: message }, { status: 500 });
  }
}
