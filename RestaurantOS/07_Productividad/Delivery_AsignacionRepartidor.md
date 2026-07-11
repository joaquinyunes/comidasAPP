# 2.10.1 — Asignación de Repartidor por Pedido

## Descripción
Cada pedido de delivery se asigna a un repartidor propio desde el sistema, con estado visible, sin depender de app de terceros ni de coordinar a los gritos.

## Dependencias
- `Empleado` con rol REPARTIDOR, `Pedido` tipo DELIVERY.
- `Notificacion` / Socket.io.

## Contenido
- Lista de repartidores disponibles/ocupados en tiempo real.
- Al cerrar un delivery, se asigna repartidor (manual o sugerido por cercanía).
- El repartidor ve sus pedidos asignados en su terminal.
- Cambio de estado: asignado → en camino → entregado.

## Criterio de validación
- Un delivery se asigna a un repartidor desde el sistema.
- El estado del repartidor se actualiza al asignar/entregar.
- El repartidor ve su cola asignada.
