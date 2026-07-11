# 2.14.5 — Impacto en Stock y Compras del Evento

## Descripción
Un pedido grande reserva/descuenta stock por adelantado y alimenta la sugerencia de compra (2.11.1), para no quedarse cortos el día del evento.

## Dependencias
- `StockPorSucursal`, `Compras_SugerenciaAutomatica.md`.

## Contenido
- Al crear evento, se reserva stock estimado de insumos.
- La proyección de quiebre considera los eventos programados.
- La sugerencia de compra incluye lo del evento.
- Al ejecutar, confirma el descuento real.

## Criterio de validación
- El evento reserva stock estimado al crearse.
- La sugerencia de compra considera eventos.
- Al ejecutar, confirma el descuento.
