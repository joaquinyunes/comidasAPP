# 2.9.6 — Rendimiento por Turno/Empleado (operativo)

## Descripción
Métrica de desempeño por empleado y turno (tiempos, errores, ventas) con fines operativos de mejora, no punitivos. Base para la gamificación (ver 2.18).

## Dependencias
- `Asistencia`, `Pedido`, tiempos (2.9.2), devoluciones (2.9.1).
- `dashboard-bi.tsx`.

## Contenido
- Por empleado: pedidos atendidos, tiempo promedio, devoluciones.
- Por turno: ventas, tiempos, mermas.
- Comparativa entre turnos y entre empleados.
- Datos accesibles al dueño y, en modo resumen, al equipo (2.18).

## Criterio de validación
- El dueño ve rendimiento por empleado y turno.
- Las métricas vienen de tiempos y devoluciones reales.
- Se puede comparar turnos/empleados.
