# 2.8.1 — Mostrar Solo lo que la Cocina Puede Hacer

## Descripción
El cliente en autogestión solo ve productos realmente disponibles ahora (respeta quiebres y horarios), para no generar pedidos imposibles que el mozo deba negar.

## Dependencias
- `Producto.disponible`, `StockPorSucursal` (ver 2.7.3).
- App cliente / web (ver 2.8).

## Contenido
- El menú cliente oculta lo agotado en tiempo real.
- Horarios de disponibilidad por producto (ej. postre solo después de X).
- Sin mostrar "agotado" de forma ruidosa: simplemente no aparece.
- Al reponer, vuelve a aparecer solo.

## Criterio de validación
- El cliente no ve productos agotados.
- Los horarios de producto se respetan en el menú.
- Al reponer, el producto reaparece.
