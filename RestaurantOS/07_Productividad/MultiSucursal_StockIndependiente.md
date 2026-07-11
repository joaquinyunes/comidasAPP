# 2.3.3 — Stock Independiente por Sucursal

## Descripción
Cada sucursal maneja su propio stock e inventario (no se mezcla), pero sobre las recetas centralizadas. La cocina de cada local descuenta de su propia bodega.

## Dependencias
- `StockPorSucursal`, `Insumo` ya existen.
- Movimientos de stock por `sucursalId` (ver 2.11/2.12).

## Contenido
- Cada sucursal tiene su inventario independiente del mismo insumo.
- Las ventas descuentan solo del stock de la sucursal que vende.
- Alertas de stock crítico por sucursal, no global.
- Transferencia entre sucursales (opcional) con registro.

## Criterio de validación
- El stock de la Sucursal A no se mezcla con el de B.
- Una venta en A descuenta solo del stock de A.
- Las alertas de quiebre son por sucursal.
