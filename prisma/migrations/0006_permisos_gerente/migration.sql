-- Mínimo privilegio en la API (proxy.ts): ahora cada ruta exige permiso por método.
-- Los roles «Gerente» ya creados (seed viejo) tenían `inventario:leer` y nada de compras: con la
-- regla nueva no podrían registrar movimientos de stock ni órdenes de compra. Se les agrega
-- lo que ROLES_BASE (prisma/roles-base.ts) ya da a un gerente nuevo. Idempotente.
UPDATE "roles"
SET "permisos" = "permisos" || '["inventario:*"]'::jsonb
WHERE "nombre" = 'Gerente' AND NOT ("permisos" @> '["inventario:*"]'::jsonb);

UPDATE "roles"
SET "permisos" = "permisos" || '["compras:*"]'::jsonb
WHERE "nombre" = 'Gerente' AND NOT ("permisos" @> '["compras:*"]'::jsonb);
