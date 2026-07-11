# 2.12.2 — Log de Modificaciones y Descuentos Manuales

## Descripción
Cualquier cambio manual a un pedido (precio, descuento, cantidad) queda registrado con autor y motivo, para saber quién hizo qué ajuste.

## Dependencias
- `AuditoriaMovimiento` (modelo nuevo), `PedidoItem`, `Empleado`.

## Contenido
- Cada edición manual de precio/descuento escribe en auditoría.
- Incluye valor anterior y nuevo, autor y motivo.
- Descuentos requieren motivo (lista + libre).
- Consultable por turno y por empleado.

## Criterio de validación
- Toda edición manual queda en auditoría con autor/motivo.
- Se registra valor previo y nuevo.
- El dueño filtra por turno/empleado.
