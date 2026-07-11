# 2.14.4 — Confirmación y Señal del Evento

## Descripción
Flujo de confirmar el evento con el cliente (señal/anticipo) y avisar cuando está listo para retiro/entrega, para no dejarlo caer.

## Dependencias
- `Pedido` evento, `Cliente`, `Delivery` (2.10) si aplica.

## Contenido
- Confirmación de evento con seña registrada.
- Recordatorio al cliente cercano a la hora.
- Al listo, aviso de "listo para retiro" o despacho (2.10.2).
- Cierre de cuenta de evento por separado.

## Criterio de validación
- El evento se confirma con seña registrada.
- El cliente recibe recordatorio y aviso de listo.
- La cuenta del evento se cierra aparte.
