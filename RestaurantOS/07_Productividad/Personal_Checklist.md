# 2.1.2 — Checklist Digital de Apertura y Cierre

## Descripción
Lista de tareas obligatorias al abrir y al cerrar el local, marcadas desde la tablet/PC en vez de un papel que se pierde. Cubre temperatura de heladera, stock contado, caja inicial, cierre de caja, limpieza y apagado de equipos.

## Dependencias
- `Empleado`, `Sucursal`, `Turno`.
- Modelo nuevo propuesto: `ChecklistApertura` / `ChecklistCierre` (ver 2.1.6 Resumen).

## Contenido
- Plantilla configurable por sucursal (ítems editables por el dueño).
- Al abrir: temperatura de heladera/freezer, stock de insumos críticos contado, monto de caja inicial, equipos encendidos.
- Al cerrar: cierre de caja, limpieza, respaldo del día, equipos apagados.
- No se puede cerrar turno si el checklist de cierre está incompleto (o requiere motivo + firma del responsable).
- Historial de checklists por fecha para auditoría.

## Criterio de validación
- El responsable no cierra el turno sin checklist completo o con justificación registrada.
- Cada ítem queda con valor (ej. temperatura), quién lo cargó y hora.
- El dueño puede revisar cualquier checklist pasado desde el panel.
