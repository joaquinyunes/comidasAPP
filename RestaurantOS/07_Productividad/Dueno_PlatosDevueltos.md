# 2.9.1 — Platos Devueltos / Rehechos por Motivo

## Descripción
Registro de cada plato devuelto o rehecho con motivo (error de cocina, equivocación de mozo, calidad, alergia), para ver dónde se pierde plata y producto.

## Dependencias
- `PedidoItem` con estado de devolución, `Anulacion` (ver 2.2.3).
- Distinción anulación vs devolución.

## Contenido
- Al devolver, se elige motivo de lista (cocina/mozo/calidad/alergia).
- El ítem queda marcado devuelto y cuenta para métrica.
- Reporte por motivo y por producto.
- Cruza con responsable para detectar patrón (no punitivo).

## Criterio de validación
- Toda devolución registra motivo.
- El ítem queda marcado y contabilizado.
- El dueño ve reporte por motivo/producto.
