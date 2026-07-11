# 2.12.3 — Log de "Quién Hizo Qué" (solo dueño)

## Descripción
Un registro simple de acciones críticas accesible solo para el dueño, sin exponerlo al resto del equipo.

## Dependencias
- `AuditLog` ya existe; `Trazabilidad_LogAnulaciones.md`, `Trazabilidad_LogModificaciones.md`.
- Roles y permisos (2.20.2).

## Contenido
- Vista de auditoría filtrada por tipo de acción y rango.
- Visible solo para ADMIN/dueño (RLS).
- No aparece en pantallas del equipo operativo.
- Exportable para revisión (ver 2.22.1).

## Criterio de validación
- El log de acciones es visible solo para el dueño.
- No se expone al equipo operativo.
- Se puede filtrar y exportar.
