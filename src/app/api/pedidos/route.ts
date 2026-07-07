import { NextResponse } from "next/server";
import type { PedidoEstado } from "@/types";

// ============================================
// GET /api/pedidos - Listar pedidos
// ============================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mesaId = searchParams.get("mesaId");
  const estado = searchParams.get("estado");

  // TODO: Reemplazar con Prisma
  const pedidos = [
    {
      id: "ped-1",
      mesaId: "2",
      mesaNumero: "2",
      sector: "Salón Principal",
      mozo: "Carlos",
      estado: "en_preparacion" as PedidoEstado,
      tipo: "mesa",
      total: 18500,
      items: [
        {
          id: "item-1",
          productoId: "p1",
          nombre: "Pizza Napolitana",
          cantidad: 2,
          precioUnitario: 12500,
          subtotal: 25000,
          notas: "Sin cebolla",
          estado: "en_preparacion" as PedidoEstado,
        },
        {
          id: "item-2",
          productoId: "b1",
          nombre: "Coca-Cola",
          cantidad: 2,
          precioUnitario: 2500,
          subtotal: 5000,
          estado: "listo" as PedidoEstado,
        },
      ],
      createdAt: new Date(Date.now() - 30 * 60000),
    },
    {
      id: "ped-2",
      mesaId: "4",
      mesaNumero: "4",
      sector: "Terraza",
      mozo: "Carlos",
      estado: "recibido" as PedidoEstado,
      tipo: "mesa",
      total: 14000,
      items: [
        {
          id: "item-3",
          productoId: "pa1",
          nombre: "Ñoquis Caseros",
          cantidad: 1,
          precioUnitario: 9800,
          subtotal: 9800,
          estado: "recibido" as PedidoEstado,
        },
        {
          id: "item-4",
          productoId: "b2",
          nombre: "Cerveza Artesanal",
          cantidad: 1,
          precioUnitario: 4500,
          subtotal: 4500,
          estado: "recibido" as PedidoEstado,
        },
      ],
      createdAt: new Date(Date.now() - 5 * 60000),
    },
  ];

  return NextResponse.json(pedidos);
}

// ============================================
// POST /api/pedidos - Crear pedido
// ============================================
export async function POST(request: Request) {
  const body = await request.json();

  // TODO: Validar con Zod, verificar stock, guardar en Prisma
  const nuevoPedido = {
    id: crypto.randomUUID(),
    ...body,
    estado: "recibido",
    total: body.items?.reduce((sum: number, item: any) => sum + item.subtotal, 0) || 0,
    createdAt: new Date(),
  };

  return NextResponse.json(nuevoPedido, { status: 201 });
}
