# 2.7.3 — Disponibilidad en Tiempo Real al Tomar el Pedido

## Descripción
El mozo ve en el momento qué productos no se pueden hacer (quiebre de stock), para no prometer algo imposible. Misma fuente que cocina (ver 2.5.4).

## Dependencias
- `StockPorSucursal`, `Producto.disponible`.
- `Operativo_StockTiempoReal.md`.

## Contenido
- Productos agotados se ven deshabilitados al tomar el pedido.
- Banner de "hoy no hay X" en la toma de pedido.
- Al reponer, se habilitan solos.
- El mozo puede ofrecer sustituto desde el catálogo.

## Criterio de validación
- El agotado se ve deshabilitado al tomar el pedido.
- El banner de quiebre aparece en la toma.
- Al reponer, se habilita automáticamente.
