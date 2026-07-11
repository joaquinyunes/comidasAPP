# 2.3.2 — Recetas y Precios Centralizados

## Descripción
El dueño define receta y precio de cada producto una vez y se aplican a todas las sucursales, evitando que cada local tenga su propia versión desactualizada.

## Dependencias
- `Producto`, `Receta`, `RecetaInsumo` ya existen.
- `Sucursal` y relación con precios.

## Contenido
- Catálogo central: definición de producto, receta e insumos en un solo lugar.
- Precio base central con opción de ajuste por sucursal (ej. zona cara).
- Al cambiar una receta, se propaga a todas las sucursales (con aviso).
- Bloqueo de edición local de recetas críticas.

## Criterio de validación
- Una receta/precio se define una vez y se ve igual en todas las sucursales.
- El dueño puede fijar precio por sucursal si lo necesita.
- Un cambio central se propaga y deja registro.
