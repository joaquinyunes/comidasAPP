# 2.23.1 — Panel de Planes y Licencias

## Descripción (Función 21/20 — extra)
Panel dentro del propio software donde el dueño ve en qué plan está y activa módulos nuevos (delivery propio, multi-sucursal, proveedores) con un botón, sin que vos intervengas manualmente en cada upgrade.

## Dependencias
- `Tenant`/`Sucursal`, módulos (2.10, 2.3, 2.11), facturación.

## Contenido
- Vista de plan actual y módulos incluidos.
- Activación de módulo con un botón (cambia flag de tenant).
- Límites por plan (nº sucursales, módulos).
- Historial de cambios de plan.

## Criterio de validación
- El dueño ve su plan y módulos en el panel.
- Activa un módulo con un botón.
- El cambio aplica sin intervención tuya.
