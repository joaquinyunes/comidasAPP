# 2.8.5 — Estado del Pedido sin Apurar

## Descripción
El cliente ve el estado de su pedido en vivo (en preparación / listo / en camino), para no tener que preguntar al mozo cada dos minutos.

## Dependencias
- `PedidoItem.estado`, Socket.io.
- `Operativo_AlertasActivas.md`.

## Contenido
- Estado visible en la app cliente por ítem o por pedido.
- No muestra tiempos exactos punitivos, solo etapa.
- Al listo, el cliente ve "listo" y el mozo va (ver 2.5.1).
- Para delivery, muestra "en camino" (ver 2.10).

## Criterio de validación
- El cliente ve la etapa de su pedido en vivo.
- No se muestran tiempos punitivos.
- El estado refleja el de cocina.
