# 2.20.4 — Calculadora de Costo y Margen en Tiempo Real

## Descripción (Función 13/20)
Basado en el costo de cada ingrediente (cargado en inventario), el sistema muestra el margen de ganancia de cada plato al editar precios. Valor altísimo para vender: lo que el dueño hace hoy a mano en una planilla.

## Dependencias
- `RecetaInsumo`, `Insumo.costo`, `Producto.precio`, `Compras_PedidoRecepcion.md`.

## Contenido
- Por producto: costo = suma de insumos × cantidad de receta.
- Margen y % de ganancia en vivo al editar precio.
- Alerta si el margen baja de un umbral del dueño.
- Reporte de rentabilidad por producto.

## Criterio de validación
- El sistema calcula costo y margen por producto.
- Al editar precio, el margen se actualiza en vivo.
- Se alerta margen bajo.
