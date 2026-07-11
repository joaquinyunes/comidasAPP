# 2.17.4 — Integridad de Datos del Turno

## Descripción
Garantizar que ventas, stock y caja del turno sean coherentes aunque hubo caídas, para que el cierre cuadre.

## Dependencias
- `Caja`, `MovimientoStock`, `Resiliencia_Backup.md`.

## Contenido
- Validación de integridad al cerrar turno (ventas = caja + stock descontado).
- Alerta si hay inconsistencia por pérdida de datos.
- Reconciliación asistida de diferencias.
- El dueño firma el cierre sabiendo el estado.

## Criterio de validación
- El cierre valida coherencia ventas/caja/stock.
- Se alerta inconsistencia por pérdida.
- La reconciliación es asistida.
