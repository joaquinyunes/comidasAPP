# Fase 3 — Stock + Inventario + Compras

**Objetivo**: Que el sistema sepa cuánto ingrediente hay, cuánto se usa, y cuándo comprar.

**Tiempo estimado**: 6-8 semanas

**Dependencia**: Fase 1 completada (KDS + recetas + `pedido_eventos`)

## Qué se construye

### 1. Inventario por ingrediente
- Cada ingrediente tiene: nombre, unidad de medida, costo, proveedor, stock actual, stock mínimo, stock máximo
- Stock por sucursal (preparado para Fase 7 multi-sucursal)
- Historial de movimientos: entradas (compras, ajustes), salidas (ventas, mermas, transferencias)
- Trazabilidad por lote (para retiros de producto o control de calidad)
- Alertas de stock crítico (configurable por ingrediente)
- Alertas de productos próximos a vencer

### 2. Recetas con descuento automático
- Cada producto del menú tiene una receta vinculada
- Cada receta lista sus ingredientes con cantidades
- Cuando el chef marca "listo" en KDS → se descuenta automáticamente los ingredientes
- Validación antes de aceptar pedido: "¿hay stock suficiente para esta receta?"
- Si no hay stock → alerta al mozo/cliente antes de confirmar

### 3. Módulo de Compras básico
- Catálogo de proveedores (nombre, contacto, catálogo de productos, precios, tiempos de entrega)
- Sugerencia automática de compra cuando stock cruza umbral mínimo
- Generación de orden de compra (manual o automática)
- Envío de orden al proveedor (email/WhatsApp)
- Recepción de mercadería con actualización automática de stock
- Comparación de precios entre proveedores para el mismo ingrediente

### 4. Reportes de stock
- Mermas: diferencia entre stock teórico (ventas registradas) y stock físico (conteo)
- Ingredientes con mayor variabilidad de consumo
- Rotación de inventario
- Costo de ingredientes por plato vendido

### 5. Costos automáticos por plato
- Cada receta calcula automáticamente: costo total, ganancia, margen
- Cuando cambia el precio de un ingrediente → se recalcula el margen de todos los platos que lo usan
- Alerta si un plato queda por debajo del margen mínimo configurable

## Tablas nuevas
- `ingredientes`
- `stock_por_sucursal`
- `stock_movimientos`
- `lotes`
- `proveedores`
- `proveedor_producto`
- `ordenes_compra`
- `ordenes_compra_items`
- `recepciones`

## Tablas de Fase 1 que se modifican
- `receta_ingredientes`: se conecta con `ingredientes`
- `pedido_items`: al confirmar "listo", dispara descuento de stock

## Reglas de negocio clave
1. Todo movimiento de stock queda registrado con motivo (venta, merma, ajuste, transferencia)
2. El umbral de alerta es configurable por ingrediente y por sucursal
3. Toda orden de compra automática requiere confirmación humana (salvo auto-aprobación bajo monto configurable)
4. Si el stock no alcanza, el sistema alerta **antes** de aceptar el pedido, no después

## Criterio de éxito
- [ ] Cuando un chef marca "listo", el stock se descuenta automáticamente
- [ ] El sistema alerta cuando un ingrediente está por debajo del mínimo
- [ ] El dueño puede ver el costo de cada plato y su margen
- [ ] Se puede generar una orden de compra y recibirla actualizando stock
- [ ] Las mermas se detectan automáticamente (stock teórico vs. físico)
