# 2.6.1 — Agrupación por Estación de Preparación

## Descripción
El pase agrupa los ítems por tipo de preparación (horno, frío, frito) y no por mesa, para que cada cocinero vea solo lo suyo y prepare en lote. Refleja cómo se cocina de verdad.

## Dependencias
- `Producto` con `estacion` (HORNO/FRIO/FRITO/ARMADO).
- `kds.tsx` / `kds-completo.tsx`.

## Contenido
- Cada producto tiene estación asignada en el catálogo.
- El pase permite vista "por estación": horno ve solo lo del horno.
- Agrupa por estación y por lote (mismos ítems juntos).
- Al listo, se libera el ítem para el mozo (ver 2.5.1).

## Criterio de validación
- El pase permite filtrar por estación.
- Los ítems del mismo tipo se agrupan, no dispersos por mesa.
- Cada estación ve solo su cola.
