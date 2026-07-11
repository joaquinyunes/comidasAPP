# 2.8.4 — Un Pedido Vivo por Mesa (consolidar)

## Descripción
En una mesa, todos los clientes suman al mismo pedido vivo (no pedidos separados que confunden a cocina). Se consolida en uno solo para la cocina y la cuenta.

## Dependencias
- `Pedido` por mesa, `PedidoItem` agregables.
- `Fidelizacion_ReconocimientoQR.md` (vínculo mesa↔cliente).

## Contenido
- Varios clientes de la misma mesa agregan al pedido vivo.
- Cocina ve un solo pedido con todos los ítems.
- La cuenta se cierra una sola vez.
- Separación de ítems por cliente solo para dividir la cuenta.

## Criterio de validación
- Varios clientes suman al mismo pedido de mesa.
- Cocina recibe un pedido consolidado.
- Se puede dividir la cuenta por cliente al cerrar.
