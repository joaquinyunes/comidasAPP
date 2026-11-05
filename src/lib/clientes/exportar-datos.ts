// Ley 25.326: el titular puede pedir copia de sus datos. Junta todo lo personal
// que el sistema guarda de un cliente (sin datos de otros clientes).

import { prisma } from "@/lib/prisma";

export async function exportarDatosCliente(tenantId: string, clienteId: string) {
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, tenantId },
    include: {
      favoritos: { select: { productoId: true, createdAt: true } },
      puntosHistorial: { select: { tipo: true, puntos: true, motivo: true, createdAt: true } },
      pedidos: {
        select: { id: true, tipo: true, estado: true, total: true, direccionEntrega: true, telefonoContacto: true, notas: true, createdAt: true },
      },
      reservas: {
        select: { fecha: true, hora: true, cantidadPersonas: true, nombreCliente: true, telefono: true, email: true, notas: true, estado: true },
      },
    },
  });
  if (!cliente) return null;

  const { tenantId: _tenant, ...datos } = cliente;
  void _tenant;
  return { exportadoEn: new Date().toISOString(), cliente: datos };
}
