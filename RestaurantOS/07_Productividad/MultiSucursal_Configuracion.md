# 2.3.5 — Configuración y Permisos Multi-sucursal

## Descripción
Definición de qué empleados y roles operan en qué sucursal, y qué puede ver/editar cada uno a nivel cadena vs local.

## Dependencias
- `Empleado`, `Sucursal`, roles (ADMIN/CAJERO/MOZO/COCINA).
- RLS / permisos por `sucursalId`.

## Contenido
- Un empleado puede estar asignado a una o varias sucursales.
- El dueño ve todas; un encargado ve solo la suya.
- Configuración de catálogo, impresoras y checklists por sucursal.
- Auditoría de cambios de configuración a nivel cadena.

## Criterio de validación
- Un encargado solo ve/opera su sucursal asignada.
- El dueño accede a la configuración de todas.
- Los cambios de configuración quedan registrados.
