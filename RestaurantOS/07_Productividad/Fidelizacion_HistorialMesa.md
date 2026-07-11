# 2.4.2 — Historial de Mesa y Preferencias

## Descripción
Registro del qué suele pedir cada cliente, para que el mozo pueda sugerir o anticipar ("suele pedir X"). Basado en pedidos reales, no en perfiles inventados.

## Dependencias
- `Pedido`, `Cliente`, `PedidoItem`.
- Stats de frecuencia por producto (ver 2.4.3).

## Contenido
- Por cliente: productos más pedidos, modificadores habituales, franja horaria típica.
- "Suele pedir" se muestra como sugerencia rápida al mozo.
- Respeta alergias/intolerancias (cruza con 2.7.2).
- El cliente puede pedir borrar su historial (privacidad mínima).

## Criterio de validación
- El sistema calcula "suele pedir X" desde pedidos reales.
- La sugerencia aparece al abrir la mesa del cliente frecuente.
- Se respeta la preferencia de borrado de historial.
