# Módulo: Stock / Inventario

**Depende de**: Menú y Recetas (Fase 1), Cocina (Fase 1)

## Fases que implementan este módulo
- **Fase 3 completo**: Ingredientes, descuento automático, alertas, trazabilidad, costos

## Funcionalidades

### Stock por ingrediente
- Cada ingrediente: nombre, unidad de medida, costo, proveedor, stock actual, stock mínimo, stock máximo
- Stock por sucursal (preparado para Fase 7)
- Historial de movimientos: entradas, salidas, mermas, ajustes, transferencias
- Trazabilidad por lote (retiros de producto, control de calidad)

### Descuento automático
- Cada producto del menú tiene receta vinculada
- Cuando chef marca "listo" → se descuentan ingredientes automáticamente
- Validación antes de aceptar pedido: ¿hay stock suficiente?
- Si no hay stock → alerta al mozo/cliente **antes** de confirmar

### Alertas
- Stock por debajo del mínimo configurable por ingrediente
- Productos próximos a vencimiento
- Consumo anómalo (posible merma o error de carga)

### Costos automáticos
- Cada receta calcula: costo total, ganancia, margen
- Cuando cambia precio de ingrediente → se recalcula margen de todos los platos
- Alerta si plato queda por debajo del margen mínimo

### Reportes
- Mermas: diferencia entre stock teórico y stock físico contado
- Ingredientes con mayor variabilidad de consumo
- Rotación de inventario
- Costo de ingredientes por plato vendido

## Datos que gestiona
Ingredientes, lotes, stock por sucursal, historial de movimientos (entradas/salidas)

## Reglas de negocio
1. Todo movimiento de stock queda registrado con motivo (venta, merma, ajuste, transferencia)
2. El umbral de alerta es configurable por ingrediente y sucursal
3. Si stock no alcanza, se alerta antes de aceptar pedido, no después
4. Las transferencias entre sucursales requieren autorización (Fase 7)

## Métricas del módulo
- % de mermas sobre ventas
- Rotación de inventario
- Ingredientes con mayor variabilidad de consumo
- Costo promedio de ingredientes por plato
- Ahorro por comparación de precios
