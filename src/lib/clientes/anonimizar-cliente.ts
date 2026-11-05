// Ley 25.326: baja de los datos personales de un cliente a su pedido.
// Se anonimiza en vez de borrar la fila: los pedidos y pagos pasados siguen
// sumando en los reportes y la caja, pero ya no apuntan a una persona.

import { prisma } from "@/lib/prisma";

export async function anonimizarCliente(tenantId: string, clienteId: string): Promise<boolean> {
  const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, tenantId }, select: { id: true } });
  if (!cliente) return false;

  await prisma.$transaction([
    prisma.cliente.update({
      where: { id: clienteId },
      data: {
        nombre: "Cliente eliminado",
        email: null,
        telefono: null,
        fechaNacimiento: null,
        alergias: [],
        dieta: null,
        preferencias: {},
        optInMarketing: false,
        deletedAt: new Date(),
      },
    }),
    prisma.clienteFavorito.deleteMany({ where: { clienteId } }),
    prisma.pedido.updateMany({
      where: { clienteId, tenantId },
      data: { direccionEntrega: null, telefonoContacto: null, notas: null },
    }),
    prisma.reserva.updateMany({
      where: { clienteId, tenantId },
      data: { nombreCliente: null, telefono: null, email: null, notas: null },
    }),
  ]);
  return true;
}
