# 2.3.4 — Comparativas y Benchmarks entre Sucursales

## Descripción
Cuadros comparativos que muestran qué sucursal rinde mejor en cada métrica (ventas, mermas, tiempo de servicio), para que el dueño detecte buenas prácticas y problemas.

## Dependencias
- `dashboard-bi.tsx` (BI) ya existe.
- Métricas de 2.9 (tiempos, mermas, devoluciones).

## Contenido
- Ranking de sucursales por métrica seleccionable.
- Mapa de calor de mermas por sucursal.
- Detectar sucursal con tiempos de cocina más altos.
- Exportar comparativa a CSV/PDF para reunión de dueños.

## Criterio de validación
- El dueño puede ordenar sucursales por cualquier métrica.
- Se resalta la mejor y la peor en cada indicador.
- La comparativa es exportable.
