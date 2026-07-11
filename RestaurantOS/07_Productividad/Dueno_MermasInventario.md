# 2.9.3 — Mermas y Quiebres de Inventario

## Descripción
Registro de merma en el momento (se cayó, se venció, error de porción) y detección de diferencia entre stock físico y digital, para que el dueño vea dónde se pierde plata y producto en tiempo real.

## Dependencias
- `MovimientoStock` con tipo MERMA y motivo.
- `StockPorSucursal` y conteo de inventario (`inventario.tsx`).
- Diferenciación merma interna vs proveedor (ver 2.11/2.12).

## Contenido
- Botón "registrar merma" con motivo y cantidad; descuenta stock y queda en reporte.
- Conteo periódico que compara físico vs digital y resalta la diferencia por insumo.
- Ajuste de stock con motivo registrado.
- Reporte en vivo de mermas del día y de insumos con diferencia recurrente.

## Criterio de validación
- Toda merma se registra con motivo y descuenta stock al momento.
- El conteo marca diferencia físico vs digital y el ajuste queda registrado.
- El dueño ve mermas del día y diferencias recurrentes en vivo.
