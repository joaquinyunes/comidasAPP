# 2.11.2 — Registro de Entregas por Proveedor

## Descripción
Registro de qué proveedor entregó qué y cuándo, para comparar precio/calidad entre proveedores a lo largo del tiempo.

## Dependencias
- `Proveedor` (modelo nuevo), `Compra`, `Insumo`.

## Contenido
- Alta de proveedores con datos de contacto.
- Cada compra queda vinculada a proveedor, fecha, precios.
- Historial de precios por insumo y proveedor.
- Comparativa de proveedores para el mismo insumo.

## Criterio de validación
- Toda compra queda vinculada a proveedor y fecha.
- Se ve el historial de precios por insumo/proveedor.
- El dueño puede comparar proveedores.
