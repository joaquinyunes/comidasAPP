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
    { id: "mesa-1", numero: "1", capacidad: 2, sectorId: "sec-salon", posicionX: 100, posicionY: 100 },
    { id: "mesa-2", numero: "2", capacidad: 4, sectorId: "sec-salon", posicionX: 200, posicionY: 100 },
    { id: "mesa-3", numero: "3", capacidad: 4, sectorId: "sec-salon", posicionX: 300, posicionY: 100 },
    { id: "mesa-4", numero: "4", capacidad: 6, sectorId: "sec-salon", posicionX: 100, posicionY: 200 },
    { id: "mesa-5", numero: "5", capacidad: 2, sectorId: "sec-terraza", posicionX: 500, posicionY: 100 },
    { id: "mesa-6", numero: "6", capacidad: 4, sectorId: "sec-terraza", posicionX: 600, posicionY: 100 },
    { id: "mesa-7", numero: "7", capacidad: 8, sectorId: "sec-vip", posicionX: 100, posicionY: 400 },
    { id: "mesa-8", numero: "8", capacidad: 2, sectorId: "sec-barra", posicionX: 700, posicionY: 100 },
  ];

  for (const mesa of mesas) {
    const id = uid(mesa.id);
    await prisma.mesa.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        sucursalId: SUCURSAL_ID,
        sectorId: uid(mesa.sectorId),
        numero: mesa.numero,
        capacidad: mesa.capacidad,
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
    { id: "ing-harina", nombre: "Harina 000", unidadMedida: "g", costoUnitario: 0.09 },
    { id: "ing-muzzarella", nombre: "Muzzarella", unidadMedida: "g", costoUnitario: 2.8 },
    { id: "ing-tomate", nombre: "Salsa de tomate", unidadMedida: "g", costoUnitario: 0.6 },
    { id: "ing-aceite", nombre: "Aceite de oliva", unidadMedida: "ml", costoUnitario: 3.5 },
    { id: "ing-cebolla", nombre: "Cebolla", unidadMedida: "g", costoUnitario: 0.4 },
    { id: "ing-jamon", nombre: "Jamón cocido", unidadMedida: "g", costoUnitario: 1.8 },
    { id: "ing-ricota", nombre: "Ricota", unidadMedida: "g", costoUnitario: 1.2 },
    { id: "ing-huevo", nombre: "Huevos", unidadMedida: "un", costoUnitario: 150 },
  ];

  for (const ing of ingredientes) {
    const id = uid(ing.id);
    await prisma.ingrediente.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: TENANT_ID,
        nombre: ing.nombre,
        unidadMedida: ing.unidadMedida,
        costoUnitario: ing.costoUnitario,
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
