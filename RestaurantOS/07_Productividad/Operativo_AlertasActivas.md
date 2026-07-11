# 2.5.1 — Alertas Activas Cocina → Mozo

## Descripción
Cuando cocina marca un plato "Listo", el mozo recibe alerta activa (vibra + sonido + visual) en su terminal, sin que cocina tenga que gritar el pedido. Cierra el bucle de comunicación.

## Dependencias
- `kds.tsx`, `PedidoItem.estado` (LISTO).
- Socket.io / `Notificacion` en tiempo real.

## Contenido
- Al pasar ítem a LISTO, se emite evento a la terminal del mozo de esa mesa.
- Feedback háptico + sonido + badge en la mesa.
- El mozo confirma "en camino" para limpiar la alerta.
- Si el mozo no confirma en X seg, la alerta escala al responsable.

## Criterio de validación
- Marcar LISTO dispara alerta visible/sonora en el mozo de la mesa.
- El mozo puede confirmar y silenciar.
- La alerta no despensa si no se confirma.
