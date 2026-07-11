# 2.5.5 — Confirmación de "Voz" Digital al Enviar

## Descripción
Al enviar el pedido a cocina, el mozo tiene un paso de confirmación explícita ("¿enviar a cocina?") que funciona como el "buah, va" digital: evita enviar por error y deja registrado el envío.

## Dependencias
- Flujo de `pedidos.tsx`, `PedidoItem`.

## Contenido
- Botón "Enviar a cocina" abre resumen del pedido a confirmar.
- Al confirmar, se marca `horaEnviado` y se notifica cocina.
- Permite corregir antes de enviar (no after-the-fact).
- El envío queda en el registro de la mesa.

## Criterio de validación
- No se envía a cocina sin confirmación explícita.
- El envío registra hora y dispara la comanda.
- Se puede corregir antes de confirmar.
