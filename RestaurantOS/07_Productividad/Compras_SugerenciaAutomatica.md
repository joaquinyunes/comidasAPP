# 2.11.1 — Sugerencia Automática de Pedido a Proveedor

## Descripción
El sistema sugiere qué comprar al proveedor basado en el consumo histórico ya registrado por las ventas (regla simple, no IA): "a este ritmo, la muzzarella se termina en 2 días, pedí X kilos".

## Dependencias
- `MovimientoStock` de consumo, `Insumo`, `StockPorSucursal`.
- Ventas históricas (ver 2.9).

## Contenido
- Por insumo: consumo promedio diario (ventas ÷ días).
- Proyección de días restantes según stock actual.
- Al bajar de umbral, sugiere cantidad a pedir (regla configurable).
- Un botón "generar pedido sugerido" arma la lista para el proveedor.

## Criterio de validación
- El sistema calcula días restantes por insumo desde el consumo real.
- Sugiere cantidad a pedir al bajar de umbral.
- Se puede generar la lista de compra sugerida.
