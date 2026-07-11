# 2.17.1 — Backup Automático de la Operación del Día

## Descripción
Respaldo automático de toda la operación del turno (ventas, stock, caja, pedidos) para que una caída no borre la información del día.

## Dependencias
- `Pedido`, `MovimientoStock`, `Caja`, `Asistencia`.
- Modo offline (2.2.2) como base local.

## Contenido
- Respaldo periódico de la operación del turno a almacenamiento seguro.
- Al cierre de turno, volcado forzado antes de permitir apagar.
- Restauración simple del turno en caso de caída.
- El dueño ve fecha/hora del último backup.

## Criterio de validación
- La operación del turno se respalda automáticamente.
- El cierre fuerza el volcado final.
- Se puede restaurar el turno tras una caída.
