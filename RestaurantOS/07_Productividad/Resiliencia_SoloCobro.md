# 2.17.2 — Modo "Solo Cobro" de Emergencia

## Descripción
Si todo lo demás falla, el sistema permite seguir facturando manualmente sin perder el registro. El local no se queda sin poder cobrar.

## Dependencias
- `Caja`, `Pedido` mínimo, modo offline (2.2.2).

## Contenido
- Pantalla de emergencia solo con cobro manual (producto + precio + mesa).
- Registra la venta aunque KDS/comanda no funcionen.
- Al volver el sistema, las ventas de emergencia se concilian.
- No requiere internet ni impresora para cobrar (ticket en pantalla).

## Criterio de validación
- En emergencia se puede cobrar manualmente.
- La venta queda registrada.
- Al recuperar, se concilia con el sistema.
