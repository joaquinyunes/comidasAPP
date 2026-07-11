# 2.2.5 — Sincronización en LAN y Respaldo de Turno

## Descripción
Toda la operación del turno queda replicada en la LAN del local y con respaldo periódico, para que un corte no borre ventas ni stock del turno en curso.

## Dependencias
- Mismo que 2.2.2 (offline degradado) + backup automático (ver 2.17).
- `Pedido`, `MovimientoStock`, `Caja`.

## Contenido
- Réplica de escritura en la base local del local cada N segundos.
- Al reconectar, diff y merge controlado por `id` y `updatedAt`.
- El cierre de turno fuerza volcado antes de permitir apagar.

## Criterio de validación
- La operación del turno sobrevive a un reinicio de red.
- El cierre de turno no se pierde aunque se caiga el servidor central.
- El dueño puede recuperar el estado del turno tras una caída.
