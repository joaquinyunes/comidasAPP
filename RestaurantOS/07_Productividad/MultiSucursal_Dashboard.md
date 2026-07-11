# 2.3.1 — Dashboard Consolidado Multi-sucursal

## Descripción
Una vista única para el dueño con varias sucursales: compara ventas, tickets, tiempos y mermas entre locales en tiempo real, sin entrar sucursal por sucursal.

## Dependencias
- `Sucursal` ya existe; todos los modelos operativos llevan `sucursalId`.
- Datos de las micro-fases 2.1, 2.9 (turnos, tiempos, mermas).

## Contenido
- Tarjetas por sucursal: ventas hoy, ticket promedio, pedidos activos, alertas.
- Comparativa lado a lado (ej. Sucursal A vs B en la misma franja).
- Filtro por fecha/rango y por sucursal.
- Drill-down: clic en sucursal → su panel operativo.

## Criterio de validación
- El dueño ve todas las sucursales en una pantalla.
- Puede comparar dos sucursales en el mismo rango.
- El drill-down abre el detalle operativo de la sucursal.
