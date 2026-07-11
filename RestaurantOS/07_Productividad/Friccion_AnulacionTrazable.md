# 2.2.3 — Anulación y Cancelación con Trazabilidad

## Descripción
Botón de anular/cancelar con doble confirmación y motivo obligatorio, registrado con usuario y hora. Resuelve disputas ("yo no anulé eso") y permite ver patrones sin ser punitivo.

## Dependencias
- `Pedido`, `PedidoItem`, `Empleado`.
- Log de auditoría (ver micro-fase 2.12).
- Modelo propuesto `Anulacion` con `motivo`, `empleadoId`, `timestamp`.

## Contenido
- Primer toque abre confirmación; segundo confirma y pide motivo (lista + libre).
- La anulación queda registrada y visible en el historial de la mesa/pedido.
- No borra el ítem: lo marca `anulado` y resta del stock solo si corresponde.
- Diferencia anulación (nunca se cocinó) de "plato devuelto" (ver 2.9).

## Criterio de validación
- No se anula sin doble confirmación + motivo.
- Toda anulación queda en log con usuario, hora y motivo.
- El ítem queda trazable en el historial, no desaparece.
