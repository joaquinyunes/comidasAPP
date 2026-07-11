# 2.12.1 — Log de Anulaciones con Usuario, Hora y Motivo

## Descripción
Toda anulación queda registrada con usuario, hora y motivo, para resolver "yo no anulé eso" y detectar patrones. No punitivo: es trazabilidad.

## Dependencias
- `Anulacion` (ver 2.2.3), `Empleado`, `PedidoItem`.

## Contenido
- Toda anulación escribe en log: quién, cuándo, por qué, sobre qué ítem.
- El registro es inmutable (no se borra, solo se anota corrección).
- Consultable por pedido y por empleado.
- Base para detectar patrones (ver 2.12.4).

## Criterio de validación
- Toda anulación queda en log con usuario/hora/motivo.
- El log es inmutable y consultable.
- Se puede filtrar por empleado y por pedido.
