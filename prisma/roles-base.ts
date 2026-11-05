// Roles que lleva toda instalación (seed de demo y alta de un cliente nuevo).
export const ROLES_BASE = [
  { id: "rol-admin", nombre: "Administrador", permisos: ["*"] },
  {
    id: "rol-gerente",
    nombre: "Gerente",
    permisos: [
      "pedidos:*", "caja:*", "pagos:*", "reservas:*", "mesas:*",
      "inventario:leer", "clientes:leer", "reportes:leer",
    ],
  },
  { id: "rol-mozo", nombre: "Mozo", permisos: ["pedidos:crear", "pedidos:leer", "pedidos:actualizar", "mesas:leer", "mesas:actualizar", "reservas:leer"] },
  { id: "rol-cocinero", nombre: "Cocinero", permisos: ["pedidos:leer", "pedidos:actualizar", "productos:leer"] },
  { id: "rol-barman", nombre: "Barman", permisos: ["pedidos:leer", "pedidos:actualizar", "productos:leer"] },
  { id: "rol-cajero", nombre: "Cajero", permisos: ["caja:*", "pagos:*", "pedidos:leer", "pedidos:actualizar", "reservas:leer", "clientes:leer"] },
] as const;
