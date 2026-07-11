# 2.11.4 — Pedido de Compra y Recepción

## Descripción
Flujo de generar pedido al proveedor, recibirlo y actualizar stock automáticamente, cerrando el círculo con el inventario.

## Dependencias
- `Compra`, `Proveedor`, `StockPorSucursal`.

## Contenido
- Generar pedido desde sugerencia (2.11.1) o manual.
- Al recibir, ingresar cantidades y precios; actualiza stock.
- Contraste pedido vs recibido (ver 2.11.3).
- El costo ingresado alimenta la calculadora de margen (2.20.4).

## Criterio de validación
- Un pedido de compra genera y se recibe desde el sistema.
- La recepción actualiza stock automáticamente.
- El costo queda registrado para margen.
