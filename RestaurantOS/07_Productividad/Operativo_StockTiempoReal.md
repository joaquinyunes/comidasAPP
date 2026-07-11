# 2.5.4 — Stock Crítico Visible en Tiempo Real

## Descripción
Cocina ve en pantalla, en el momento, qué insumos están por agotarse, para avisar al mozo antes de que prometa un plato que no se puede hacer.

## Dependencias
- `StockPorSucursal`, umbrales de alerta.
- `inventario.tsx` ya existe.

## Contenido
- Banner de "Productos no disponibles ahora" en cocina y en toma de pedido.
- Al bajar de umbral, el producto se marca agotado automáticamente (o sugerido).
- El mozo ve la misma disponibilidad al tomar el pedido (ver 2.7.3).
- Aviso al responsable para reposición.

## Criterio de validación
- Cocina ve en vivo los insumos en quiebre.
- El producto se marca no disponible en la toma de pedido.
- El responsable recibe aviso de quiebre.
