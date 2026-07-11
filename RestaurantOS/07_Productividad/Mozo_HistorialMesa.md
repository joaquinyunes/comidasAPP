# 2.7.4 — Historial Rápido de Mesa

## Descripción
Al abrir una mesa, el mozo ve qué se pidió en esa mesa en el turno (o del cliente frecuente), para atender con contexto y no preguntar todo de cero.

## Dependencias
- `Pedido`, `Fidelizacion_HistorialMesa.md`.

## Contenido
- Resumen de lo pedido en la mesa en el turno.
- Si es cliente frecuente, "suele pedir X" (ver 2.4).
- Acceso rápido a repetir pedido anterior.
- No expone datos de otros clientes.

## Criterio de validación
- Al abrir mesa se ve el historial del turno.
- Cliente frecuente muestra sus gustos.
- Se puede repetir el pedido anterior con un toque.
