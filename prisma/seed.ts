import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { createHash } from "crypto";

// ============================================
// SEED DATA — RestaurantOS
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// El schema define los `id` como @db.Uuid, así que derivamos UUIDs válidos y
// deterministas a partir de las claves de texto (para que el seed sea idempotente).
function uid(key: string): string {
  const h = createHash("md5").update(`seed::${key}`).digest();
  h[6] = (h[6] & 0x0f) | 0x40; // version 4
  h[8] = (h[8] & 0x3f) | 0x80; // variant RFC4122
  const hex = h.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const TENANT_ID = uid("tenant-demo-001");
const SUCURSAL_ID = uid("sucursal-demo-001");

async function main() {
  console.log("🌱 Iniciando seed...");

  // ============================================
  // TENANT
  // ============================================
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: {
      id: TENANT_ID,
      nombre: "Pizzaria Demo",
      slug: "pizzaria-demo",
      plan: "premium",
      activo: true,
    },
  });
  console.log("✅ Tenant creado");

  // ============================================
  // SUCURSAL
  // ============================================
  await prisma.sucursal.upsert({
    where: { id: SUCURSAL_ID },
    update: {},
    create: {
      id: SUCURSAL_ID,
      tenantId: TENANT_ID,
      nombre: "Sucursal Principal",
      direccion: "Av. Corrientes 1234, CABA",
      telefono: "+54 11 1234-5678",
      email: "sucursal@pizzaria-demo.com",
      activa: true,
    },
  });
  console.log("✅ Sucursal creada");

  // ============================================
  // ROLES
  // ============================================
  const roles = [
    { id: "rol-admin", nombre: "Administrador", permisos: ["*"] },
    { id: "rol-mozo", nombre: "Mozo", permisos: ["pedidos:crear", "pedidos:leer", "mesas:leer", "mesas:actualizar"] },
    { id: "rol-cocinero", nombre: "Cocinero", permisos: ["pedidos:leer", "pedidos:actualizar", "productos:leer"] },
    { id: "rol-barman", nombre: "Barman", permisos: ["pedidos:leer", "pedidos:actualizar", "productos:leer"] },
    { id: "rol-cajero", nombre: "Cajero", permisos: ["caja:*", "pagos:*", "pedidos:leer"] },
  ];

  for (const rol of roles) {
    const id = uid(rol.id);
    await prisma.rol.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        nombre: rol.nombre,
        permisos: rol.permisos,
      },
    });
  }
  console.log("✅ Roles creados");

  // ============================================
  // USUARIOS
  // ============================================
  const passwordHash = await hash("admin123", 12);

  const usuarios = [
    { id: "user-admin", email: "admin@pizzaria.com", nombre: "Admin Sistema", rolId: "rol-admin" },
    { id: "user-carlos", email: "carlos@pizzaria.com", nombre: "Carlos García", rolId: "rol-mozo" },
    { id: "user-ana", email: "ana@pizzaria.com", nombre: "Ana López", rolId: "rol-cocinero" },
    { id: "user-pedro", email: "pedro@pizzaria.com", nombre: "Pedro Martínez", rolId: "rol-barman" },
    { id: "user-maria", email: "maria@pizzaria.com", nombre: "María Fernández", rolId: "rol-cajero" },
  ];

  for (const user of usuarios) {
    const userId = uid(user.id);
    const rolId = uid(user.rolId);
    await prisma.usuario.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        tenantId: TENANT_ID,
        email: user.email,
        passwordHash,
        nombre: user.nombre,
        activo: true,
      },
    });

    // Asignar rol via tabla intermedia
    await prisma.usuarioRol.upsert({
      where: {
        usuarioId_rolId_sucursalId: {
          usuarioId: userId,
          rolId: rolId,
          sucursalId: SUCURSAL_ID,
        },
      },
      update: {},
      create: {
        id: uid(`ur-${user.id}`),
        usuarioId: userId,
        rolId: rolId,
        sucursalId: SUCURSAL_ID,
      },
    });
  }
  console.log("✅ Usuarios creados");

  // ============================================
  // SECTORES Y MESAS
  // ============================================
  const sectores = [
    { id: "sec-salon", nombre: "Salón Principal", tipo: "interior" },
    { id: "sec-terraza", nombre: "Terraza", tipo: "exterior" },
    { id: "sec-vip", nombre: "VIP", tipo: "privado" },
    { id: "sec-barra", nombre: "Barra", tipo: "barra" },
  ];

  for (let i = 0; i < sectores.length; i++) {
    const sector = sectores[i];
    const id = uid(sector.id);
    await prisma.sector.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        sucursalId: SUCURSAL_ID,
        nombre: sector.nombre,
        tipo: sector.tipo,
        orden: i + 1,
      },
    });
  }
  console.log("✅ Sectores creados");

  const mesas = [
    { id: "mesa-1", numero: "1", capacidad: 2, sectorId: "sec-salon", posicionX: 100, posicionY: 100, estado: "en_cocina" },
    { id: "mesa-2", numero: "2", capacidad: 4, sectorId: "sec-salon", posicionX: 200, posicionY: 100, estado: "comiendo" },
    { id: "mesa-3", numero: "3", capacidad: 4, sectorId: "sec-salon", posicionX: 300, posicionY: 100, estado: "libre" },
    { id: "mesa-4", numero: "4", capacidad: 6, sectorId: "sec-salon", posicionX: 100, posicionY: 200, estado: "esperando_cuenta" },
    { id: "mesa-5", numero: "5", capacidad: 2, sectorId: "sec-terraza", posicionX: 500, posicionY: 100, estado: "en_cocina" },
    { id: "mesa-6", numero: "6", capacidad: 4, sectorId: "sec-terraza", posicionX: 600, posicionY: 100, estado: "libre" },
    { id: "mesa-7", numero: "7", capacidad: 8, sectorId: "sec-vip", posicionX: 100, posicionY: 400, estado: "reservada" },
    { id: "mesa-8", numero: "8", capacidad: 2, sectorId: "sec-barra", posicionX: 700, posicionY: 100, estado: "libre" },
  ];

  for (const mesa of mesas) {
    const id = uid(mesa.id);
    await prisma.mesa.upsert({
      where: { id },
      update: { estado: mesa.estado },
      create: {
        id,
        tenantId: TENANT_ID,
        sucursalId: SUCURSAL_ID,
        sectorId: uid(mesa.sectorId),
        numero: mesa.numero,
        capacidad: mesa.capacidad,
        estado: mesa.estado,
        posicionX: mesa.posicionX,
        posicionY: mesa.posicionY,
        activa: true,
      },
    });
  }
  console.log("✅ Mesas creadas");

  // ============================================
  // CATEGORÍAS Y PRODUCTOS
  // ============================================
  const categorias = [
    { id: "cat-pizzas", nombre: "Pizzas", orden: 1 },
    { id: "cat-empanadas", nombre: "Empanadas", orden: 2 },
    { id: "cat-pastas", nombre: "Pastas", orden: 3 },
    { id: "cat-postres", nombre: "Postres", orden: 4 },
    { id: "cat-bebidas", nombre: "Bebidas", orden: 5 },
    { id: "cat-cervezas", nombre: "Cervezas", orden: 6 },
  ];

  for (const cat of categorias) {
    const id = uid(cat.id);
    await prisma.categoriaMenu.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        nombre: cat.nombre,
        orden: cat.orden,
        activa: true,
      },
    });
  }
  console.log("✅ Categorías creadas");

  const productos = [
    { id: "prod-muzzarella", nombre: "Pizza Muzzarella", precio: 5000, categoriaId: "cat-pizzas" },
    { id: "prod-fugazzeta", nombre: "Fugazzeta Rellena", precio: 6500, categoriaId: "cat-pizzas" },
    { id: "prod-calabresa", nombre: "Pizza Calabresa", precio: 5500, categoriaId: "cat-pizzas" },
    { id: "prod-napolitana", nombre: "Pizza Napolitana", precio: 5800, categoriaId: "cat-pizzas" },
    { id: "prod-4quesos", nombre: "Pizza 4 Quesos", precio: 6200, categoriaId: "cat-pizzas" },
    { id: "prod-empanada-carne", nombre: "Empanada de Carne", precio: 900, categoriaId: "cat-empanadas" },
    { id: "prod-empanada-jamon", nombre: "Empanada de Jamón y Queso", precio: 950, categoriaId: "cat-empanadas" },
    { id: "prod-empanada-cebolla", nombre: "Empanada de Cebolla", precio: 850, categoriaId: "cat-empanadas" },
    { id: "prod-noquis", nombre: "Ñoquis Caseros", precio: 4500, categoriaId: "cat-pastas" },
    { id: "prod-ravioles", nombre: "Ravioles de Ricota", precio: 5200, categoriaId: "cat-pastas" },
    { id: "prod-helado", nombre: "Helado Artesanal (3 bochas)", precio: 2500, categoriaId: "cat-postres" },
    { id: "prod-flan", nombre: "Flan Casero", precio: 1800, categoriaId: "cat-postres" },
    { id: "prod-coca", nombre: "Coca-Cola 500ml", precio: 1200, categoriaId: "cat-bebidas" },
    { id: "prod-agua", nombre: "Agua Mineral 500ml", precio: 800, categoriaId: "cat-bebidas" },
    { id: "prod-limonada", nombre: "Limonada Natural", precio: 1500, categoriaId: "cat-bebidas" },
    { id: "prod-ipa", nombre: "IPA Artesanal", precio: 1800, categoriaId: "cat-cervezas" },
    { id: "prod-lager", nombre: "Lager Rubia", precio: 1500, categoriaId: "cat-cervezas" },
  ];

  for (const prod of productos) {
    const id = uid(prod.id);
    await prisma.producto.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        nombre: prod.nombre,
        precio: prod.precio,
        categoriaId: uid(prod.categoriaId),
        disponible: true,
      },
    });
  }
  console.log("✅ Productos creados");

  // ============================================
  // INGREDIENTES
  // ============================================
  const ingredientes = [
    { id: "ing-harina", nombre: "Harina 000", unidadMedida: "g", costoUnitario: 0.09, stockMinimo: 30000 },
    { id: "ing-muzzarella", nombre: "Muzzarella", unidadMedida: "g", costoUnitario: 2.8, stockMinimo: 10000 },
    { id: "ing-tomate", nombre: "Salsa de tomate", unidadMedida: "g", costoUnitario: 0.6, stockMinimo: 5000 },
    { id: "ing-aceite", nombre: "Aceite de oliva", unidadMedida: "ml", costoUnitario: 3.5, stockMinimo: 15000 },
    { id: "ing-cebolla", nombre: "Cebolla", unidadMedida: "g", costoUnitario: 0.4, stockMinimo: 12000 },
    { id: "ing-jamon", nombre: "Jamón cocido", unidadMedida: "g", costoUnitario: 1.8, stockMinimo: 8000 },
    { id: "ing-ricota", nombre: "Ricota", unidadMedida: "g", costoUnitario: 1.2, stockMinimo: 10000 },
    { id: "ing-huevo", nombre: "Huevos", unidadMedida: "un", costoUnitario: 150, stockMinimo: 120 },
  ];

  for (const ing of ingredientes) {
    const id = uid(ing.id);
    await prisma.ingrediente.upsert({
      where: { id },
      update: { stockMinimo: ing.stockMinimo },
      create: {
        id,
        tenantId: TENANT_ID,
        nombre: ing.nombre,
        unidadMedida: ing.unidadMedida,
        costoUnitario: ing.costoUnitario,
        stockMinimo: ing.stockMinimo,
        activo: true,
      },
    });
  }
  console.log("✅ Ingredientes creados");

  // ============================================
  // CLIENTES
  // ============================================
  const clientes = [
    { id: "cli-1", nombre: "Juan Pérez", telefono: "+54 11 1111-2222", email: "juan@email.com", puntos: 1200 },
    { id: "cli-2", nombre: "María García", telefono: "+54 11 3333-4444", email: "maria@email.com", puntos: 800 },
    { id: "cli-3", nombre: "Carlos López", telefono: "+54 11 5555-6666", email: "carlos@email.com", puntos: 2500 },
  ];

  for (const cli of clientes) {
    const id = uid(cli.id);
    await prisma.cliente.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        nombre: cli.nombre,
        telefono: cli.telefono,
        email: cli.email,
        puntos: cli.puntos,
      },
    });
  }
  console.log("✅ Clientes creados");

  // ============================================
  // PROVEEDORES
  // ============================================
  const proveedores = [
    { id: "prov-1", nombre: "Distribuidora La Norteña", contactoNombre: "Roberto", contactoEmail: "roberto@lanortena.com", contactoTelefono: "+54 11 4567-8901", direccion: "Av. San Martín 1234" },
    { id: "prov-2", nombre: "Verdulería Express", contactoNombre: "Laura", contactoEmail: "laura@verduleriaexpress.com", contactoTelefono: "+54 11 5678-9012", direccion: "San Juan 567" },
    { id: "prov-3", nombre: "Lácteos del Sur", contactoNombre: "Martín", contactoEmail: "martin@lacteosdelsur.com", contactoTelefono: "+54 11 6789-0123", direccion: "Lavalle 890" },
  ];

  for (const prov of proveedores) {
    const id = uid(prov.id);
    await prisma.proveedor.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        nombre: prov.nombre,
        contactoNombre: prov.contactoNombre,
        contactoEmail: prov.contactoEmail,
        contactoTelefono: prov.contactoTelefono,
        direccion: prov.direccion,
        activo: true,
      },
    });
  }
  console.log("✅ Proveedores creados");

  // ============================================
  // EMPLEADOS (vinculados a usuarios existentes)
  // ============================================
  const empleados = [
    { id: "emp-1", usuarioId: "user-carlos", sucursalId: SUCURSAL_ID, cargo: "Mozo" },
    { id: "emp-2", usuarioId: "user-ana", sucursalId: SUCURSAL_ID, cargo: "Cocinero" },
    { id: "emp-3", usuarioId: "user-pedro", sucursalId: SUCURSAL_ID, cargo: "Barman" },
    { id: "emp-4", usuarioId: "user-maria", sucursalId: SUCURSAL_ID, cargo: "Cajero" },
  ];

  for (const emp of empleados) {
    const id = uid(emp.id);
    await prisma.empleado.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        usuarioId: uid(emp.usuarioId),
        sucursalId: emp.sucursalId,
        cargo: emp.cargo,
        estado: "activo",
      },
    });
  }
  console.log("✅ Empleados creados");

  // ============================================
  // STOCK INICIAL
  // ============================================
  const stockInicial = [
    { ingredienteId: "ing-harina", cantidad: 25000 },
    { ingredienteId: "ing-muzzarella", cantidad: 8000 },
    { ingredienteId: "ing-tomate", cantidad: 3000 },
    { ingredienteId: "ing-aceite", cantidad: 12000 },
    { ingredienteId: "ing-cebolla", cantidad: 5000 },
    { ingredienteId: "ing-jamon", cantidad: 4000 },
    { ingredienteId: "ing-ricota", cantidad: 6000 },
    { ingredienteId: "ing-huevo", cantidad: 48 },
  ];

  for (const stock of stockInicial) {
    await prisma.stockPorSucursal.upsert({
      where: {
        sucursalId_ingredienteId_lote: {
          sucursalId: SUCURSAL_ID,
          ingredienteId: uid(stock.ingredienteId),
          lote: "LOTE-DEFAULT",
        },
      },
      update: {},
      create: {
        tenantId: TENANT_ID,
        sucursalId: SUCURSAL_ID,
        ingredienteId: uid(stock.ingredienteId),
        cantidadActual: stock.cantidad,
        lote: "LOTE-DEFAULT",
      },
    });
  }
  console.log("✅ Stock inicial creado");

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000);

  const mesaIds = mesas.map((m) => uid(m.id));
  const productoIds = productos.map((p) => uid(p.id));
  const clienteIds = clientes.map((c) => uid(c.id));
  const proveedorIds = proveedores.map((p) => uid(p.id));
  const userIds = {
    admin: uid("user-admin"),
    carlos: uid("user-carlos"),
    ana: uid("user-ana"),
    pedro: uid("user-pedro"),
    maria: uid("user-maria"),
  };

  // ============================================
  // CAJA DEL DÍA
  // ============================================
  const cajaId = uid("caja-demo-001");
  await prisma.caja.upsert({
    where: { id: cajaId },
    update: {},
    create: {
      id: cajaId,
      tenantId: TENANT_ID,
      sucursalId: SUCURSAL_ID,
      cajeroId: userIds.maria,
      montoInicial: 20000,
      estado: "abierta",
      abiertaEn: daysAgo(0),
    },
  });
  console.log("✅ Caja del día creada");

  // ============================================
  // PEDIDOS + MICRO-FASES + PAGOS
  // ============================================
  const FASES = ["recibido", "confirmado", "en_preparacion", "listo", "entregado", "pagado"];

  async function crearPedido(opts: {
    key: string;
    creadoEn: Date;
    mesaIdx: number;
    clienteIdx: number | null;
    itemIdxs: number[];
    estadoFinal: string;
  }) {
    const pedidoId = uid(opts.key);
    const finalIdx = FASES.indexOf(opts.estadoFinal);
    const baseT = opts.creadoEn.getTime();

    const itemsData = opts.itemIdxs.map((pi, i) => {
      const prod = productos[pi];
      const cantidad = i % 2 === 0 ? 1 : 2;
      const subtotal = prod.precio * cantidad;
      return { prodId: productoIds[pi], cantidad, precio: prod.precio, subtotal };
    });
    const total = itemsData.reduce((s, it) => s + it.subtotal, 0);

    const fases =
      opts.estadoFinal === "anulado"
        ? ["recibido", "anulado"]
        : FASES.slice(0, finalIdx + 1);

    await prisma.pedido.upsert({
      where: { id: pedidoId },
      update: {},
      create: {
        id: pedidoId,
        tenantId: TENANT_ID,
        sucursalId: SUCURSAL_ID,
        mesaId: mesaIds[opts.mesaIdx],
        clienteId: opts.clienteIdx !== null ? clienteIds[opts.clienteIdx] : null,
        mozoId: userIds.carlos,
        creadoPorId: userIds.carlos,
        estado: opts.estadoFinal,
        tipo: "mesa",
        total,
        createdAt: opts.creadoEn,
      },
    });

    const itemEstado =
      opts.estadoFinal === "anulado"
        ? "recibido"
        : opts.estadoFinal === "pagado" || opts.estadoFinal === "entregado"
          ? "entregado"
          : opts.estadoFinal;

    for (let i = 0; i < itemsData.length; i++) {
      const it = itemsData[i];
      await prisma.pedidoItem.upsert({
        where: { id: uid(`${opts.key}-item-${i}`) },
        update: {},
        create: {
          id: uid(`${opts.key}-item-${i}`),
          tenantId: TENANT_ID,
          pedidoId,
          productoId: it.prodId,
          cantidad: it.cantidad,
          precioUnitario: it.precio,
          subtotal: it.subtotal,
          estado: itemEstado,
          horaEnviado: opts.estadoFinal === "anulado" ? null : new Date(baseT + 4 * 60000),
          horaListo:
            opts.estadoFinal === "anulado" || finalIdx < 3 ? null : new Date(baseT + 8 * 60000),
          horaEntregado:
            opts.estadoFinal === "anulado" || finalIdx < 4 ? null : new Date(baseT + 12 * 60000),
          anulado: opts.estadoFinal === "anulado",
          urgente:
            i === 0 &&
            opts.estadoFinal !== "pagado" &&
            opts.estadoFinal !== "entregado" &&
            opts.estadoFinal !== "anulado",
        },
      });
    }

    for (let i = 0; i < fases.length; i++) {
      await prisma.pedidoEvento.upsert({
        where: { id: uid(`${opts.key}-ev-${i}`) },
        update: {},
        create: {
          id: uid(`${opts.key}-ev-${i}`),
          tenantId: TENANT_ID,
          pedidoId,
          evento: fases[i],
          usuarioId: userIds.carlos,
          metadata: {},
          createdAt: new Date(baseT + i * 4 * 60000),
        },
      });
    }

    if (opts.estadoFinal === "pagado" || opts.estadoFinal === "entregado") {
      await prisma.pago.upsert({
        where: { id: uid(`${opts.key}-pago`) },
        update: {},
        create: {
          id: uid(`${opts.key}-pago`),
          tenantId: TENANT_ID,
          pedidoId,
          cajaId,
          monto: total,
          propina: Math.round(total * 0.1),
          metodoPago: opts.itemIdxs.length % 2 === 0 ? "efectivo" : "tarjeta",
          estado: "completado",
          usuarioId: userIds.maria,
          createdAt: new Date(baseT + 13 * 60000),
        },
      });
    }
  }

  const pedidoDefs: Array<{
    key: string;
    creadoEn: Date;
    mesaIdx: number;
    clienteIdx: number | null;
    itemIdxs: number[];
    estadoFinal: string;
  }> = [];

  let pidx = 0;
  for (let d = 1; d <= 28; d += 2) {
    pedidoDefs.push({
      key: `ped-h${pidx}`,
      creadoEn: daysAgo(d),
      mesaIdx: pidx % 8,
      clienteIdx: pidx % 3,
      itemIdxs: [pidx % 17, (pidx + 3) % 17],
      estadoFinal: "pagado",
    });
    pidx++;
  }
  pedidoDefs.push({ key: "ped-a1", creadoEn: minutesAgo(25), mesaIdx: 0, clienteIdx: 0, itemIdxs: [0, 12], estadoFinal: "en_preparacion" });
  pedidoDefs.push({ key: "ped-a2", creadoEn: minutesAgo(18), mesaIdx: 1, clienteIdx: 1, itemIdxs: [4, 13], estadoFinal: "listo" });
  pedidoDefs.push({ key: "ped-a3", creadoEn: minutesAgo(8), mesaIdx: 2, clienteIdx: 2, itemIdxs: [1], estadoFinal: "recibido" });
  pedidoDefs.push({ key: "ped-a4", creadoEn: minutesAgo(40), mesaIdx: 3, clienteIdx: null, itemIdxs: [7, 8], estadoFinal: "entregado" });
  pedidoDefs.push({ key: "ped-an1", creadoEn: daysAgo(2), mesaIdx: 4, clienteIdx: 0, itemIdxs: [2, 14], estadoFinal: "anulado" });
  pedidoDefs.push({ key: "ped-an2", creadoEn: daysAgo(5), mesaIdx: 5, clienteIdx: 1, itemIdxs: [9], estadoFinal: "anulado" });

  for (const def of pedidoDefs) {
    await crearPedido(def);
  }
  console.log(`✅ Pedidos creados (${pedidoDefs.length}) con micro-fases`);

  // ============================================
  // RESERVAS
  // ============================================
  const reservasSeed = [
    { clienteIdx: 0, mesaIdx: 6, dias: 0, hora: "21:00", personas: 6, estado: "confirmada" },
    { clienteIdx: 1, mesaIdx: 0, dias: 1, hora: "20:30", personas: 2, estado: "pendiente" },
    { clienteIdx: 2, mesaIdx: 1, dias: 2, hora: "13:00", personas: 4, estado: "confirmada" },
    { clienteIdx: 0, mesaIdx: 7, dias: 3, hora: "21:30", personas: 2, estado: "pendiente" },
    { clienteIdx: 1, mesaIdx: 2, dias: 7, hora: "20:00", personas: 8, estado: "confirmada" },
  ];
  for (let i = 0; i < reservasSeed.length; i++) {
    const r = reservasSeed[i];
    const [hh, mm] = r.hora.split(":").map(Number);
    const fecha = daysAgo(-r.dias);
    const hora = new Date(fecha);
    hora.setHours(hh, mm, 0, 0);
    await prisma.reserva.upsert({
      where: { id: uid(`res-${i}`) },
      update: {},
      create: {
        id: uid(`res-${i}`),
        tenantId: TENANT_ID,
        sucursalId: SUCURSAL_ID,
        mesaId: mesaIds[r.mesaIdx],
        clienteId: clienteIds[r.clienteIdx],
        fecha,
        hora,
        cantidadPersonas: r.personas,
        zona: "salon",
        occasion: "Cumpleaños",
        notas: "Mesa con torta",
        estado: r.estado,
      },
    });
  }
  console.log("✅ Reservas creadas");

  // ============================================
  // ÓRDENES DE COMPRA
  // ============================================
  const ordenes = [
    { key: "oc-1", prov: 0, estado: "recibida", items: [0, 1, 4] },
    { key: "oc-2", prov: 1, estado: "pendiente", items: [2, 5] },
    { key: "oc-3", prov: 2, estado: "recibida", items: [3, 6, 7] },
  ];
  for (const oc of ordenes) {
    const ocId = uid(oc.key);
    let totalOC = 0;
    const ocItems: Array<{ ingId: number; cant: number; pu: number }> = [];
    for (const ii of oc.items) {
      const ing = ingredientes[ii];
      const cant = 5000 + ii * 1000;
      const pu = ing.costoUnitario;
      totalOC += cant * pu;
      ocItems.push({ ingId: ii, cant, pu });
    }
    await prisma.ordenCompra.upsert({
      where: { id: ocId },
      update: {},
      create: {
        id: ocId,
        tenantId: TENANT_ID,
        sucursalId: SUCURSAL_ID,
        proveedorId: proveedorIds[oc.prov],
        estado: oc.estado,
        total: Math.round(totalOC * 100) / 100,
        notas: "Reposición semanal",
        usuarioId: userIds.admin,
        createdAt: daysAgo(oc.prov + 1),
      },
    });
    for (let i = 0; i < ocItems.length; i++) {
      const oi = ocItems[i];
      await prisma.ordenCompraItem.upsert({
        where: { id: uid(`${oc.key}-item-${i}`) },
        update: {},
        create: {
          id: uid(`${oc.key}-item-${i}`),
          tenantId: TENANT_ID,
          ordenCompraId: ocId,
          ingredienteId: uid(ingredientes[oi.ingId].id),
          cantidad: oi.cant,
          precioUnitario: oi.pu,
          subtotal: Math.round(oi.cant * oi.pu * 100) / 100,
        },
      });
    }
  }
  console.log("✅ Órdenes de compra creadas");

  // ============================================
  // FIDELIZACIÓN
  // ============================================
  const favs = [
    [0, 0], [0, 1], [1, 4], [2, 12], [1, 7],
  ];
  for (const [ci, pi] of favs) {
    await prisma.clienteFavorito.upsert({
      where: {
        clienteId_productoId: { clienteId: clienteIds[ci], productoId: productoIds[pi] },
      },
      update: {},
      create: { clienteId: clienteIds[ci], productoId: productoIds[pi] },
    });
  }
  const puntos = [
    { cli: 0, tipo: "acumulacion", puntos: 150, motivo: "Compra de pizza" },
    { cli: 1, tipo: "acumulacion", puntos: 80, motivo: "Compra de empanadas" },
    { cli: 2, tipo: "canje", puntos: -200, motivo: "Cupón de descuento" },
  ];
  for (let i = 0; i < puntos.length; i++) {
    const p = puntos[i];
    await prisma.puntosHistorial.upsert({
      where: { id: uid(`ph-${i}`) },
      update: {},
      create: {
        id: uid(`ph-${i}`),
        tenantId: TENANT_ID,
        clienteId: clienteIds[p.cli],
        tipo: p.tipo,
        puntos: p.puntos,
        motivo: p.motivo,
        createdAt: daysAgo(i + 1),
      },
    });
  }
  await prisma.campana.upsert({
    where: { id: uid("camp-1") },
    update: {},
    create: {
      id: uid("camp-1"),
      tenantId: TENANT_ID,
      nombre: "Pizza 2x1 Jueves",
      descripcion: "Dos pizzas al precio de una los jueves",
      tipo: "promocion",
      estado: "activa",
      fechaInicio: daysAgo(7),
      fechaFin: daysAgo(-7),
    },
  });
  await prisma.cupon.upsert({
    where: { id: uid("cupon-1") },
    update: {},
    create: {
      id: uid("cupon-1"),
      tenantId: TENANT_ID,
      codigo: "BIENVENIDA10",
      descripcion: "10% de descuento en tu primera compra",
      tipo: "porcentaje",
      valor: 10,
      fechaInicio: daysAgo(10),
      fechaFin: daysAgo(-10),
      usosMaximos: 100,
      usosActuales: 12,
      usosPorCliente: 1,
      minimoCompra: 2000,
      activo: true,
    },
  });
  console.log("✅ Fidelización (favoritos, puntos, campaña, cupón) creada");

  // ============================================
  // NOTIFICACIONES
  // ============================================
  const notifs = [
    { user: "carlos", tipo: "pedido", titulo: "Nuevo pedido en Mesa 3", mensaje: "Mesa 3 realizó un pedido" },
    { user: "ana", tipo: "cocina", titulo: "Pedido urgente", mensaje: "Pizza 4 Quesos marcada urgente" },
    { user: "maria", tipo: "caja", titulo: "Cierre pendiente", mensaje: "La caja del día sigue abierta" },
    { user: "admin", tipo: "sistema", titulo: "Backup completado", mensaje: "Respaldo nocturno exitoso" },
  ];
  for (let i = 0; i < notifs.length; i++) {
    const n = notifs[i];
    await prisma.notificacion.upsert({
      where: { id: uid(`notif-${i}`) },
      update: {},
      create: {
        id: uid(`notif-${i}`),
        tenantId: TENANT_ID,
        usuarioId: userIds[n.user as keyof typeof userIds],
        tipo: n.tipo,
        titulo: n.titulo,
        mensaje: n.mensaje,
        leida: i % 2 === 0,
        createdAt: minutesAgo(i * 15 + 5),
      },
    });
  }
  console.log("✅ Notificaciones creadas");

  // ============================================
  // FEEDBACK
  // ============================================
  await prisma.feedback.upsert({
    where: { id: uid("fb-1") },
    update: {},
    create: {
      id: uid("fb-1"),
      tenantId: TENANT_ID,
      sucursalId: SUCURSAL_ID,
      pedidoId: uid("ped-h0"),
      mesaId: mesaIds[0],
      calificacion: "FELIZ",
      motivo: "Excelente atención y velocidad",
    },
  });
  await prisma.feedback.upsert({
    where: { id: uid("fb-2") },
    update: {},
    create: {
      id: uid("fb-2"),
      tenantId: TENANT_ID,
      sucursalId: SUCURSAL_ID,
      pedidoId: uid("ped-h1"),
      mesaId: mesaIds[1],
      calificacion: "NEUTRAL",
      motivo: "La pizza tardó un poco",
    },
  });
  console.log("✅ Feedback creado");

  // ============================================
  // AUDITORÍA
  // ============================================
  const audit = [
    { accion: "LOGIN", entidad: "Usuario", entidadId: userIds.admin, valorNuevo: { email: "admin@pizzaria.com" } },
    { accion: "CREAR", entidad: "Pedido", entidadId: uid("ped-h0"), valorNuevo: { mesa: "1", total: 5900 } },
    { accion: "ACTUALIZAR", entidad: "Producto", entidadId: productoIds[0], valorAnterior: { precio: 4800 }, valorNuevo: { precio: 5000 } },
    { accion: "CREAR", entidad: "Reserva", entidadId: uid("res-0"), valorNuevo: { personas: 6 } },
    { accion: "ANULAR", entidad: "Pedido", entidadId: uid("ped-an1"), valorNuevo: { motivo: "Cliente no asistió" } },
  ];
  for (let i = 0; i < audit.length; i++) {
    const a = audit[i];
    await prisma.auditLog.upsert({
      where: { id: uid(`audit-${i}`) },
      update: {},
      create: {
        id: uid(`audit-${i}`),
        tenantId: TENANT_ID,
        usuarioId: a.entidadId ? userIds.admin : null,
        accion: a.accion,
        entidad: a.entidad,
        entidadId: a.entidadId,
        valorAnterior: a.valorAnterior ?? null,
        valorNuevo: a.valorNuevo ?? null,
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0",
        createdAt: daysAgo(i),
      },
    });
  }
  console.log("✅ AuditLog creado");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log(`   Tenant: ${TENANT_ID}`);
  console.log(`   Sucursal: ${SUCURSAL_ID}`);
  console.log(`   Usuarios: ${usuarios.length}`);
  console.log(`   Mesas: ${mesas.length}`);
  console.log(`   Productos: ${productos.length}`);
  console.log(`   Ingredientes: ${ingredientes.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
