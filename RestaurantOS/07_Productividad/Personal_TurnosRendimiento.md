# 2.1.4 — Turnos y Cruce con Rendimiento

## Descripción
Gestión de turnos (mañana/tarde/noche) y la capacidad de cruzar cada turno con las ventas y el tiempo de servicio logrado, para que el dueño vea si un turno rinde distinto por composición de equipo u horario.

## Dependencias
- `Turno`, `Asistencia`, `Pedido` (con `sucursalId`, `turnoId`, timestamps de servicio).
- Datos de tiempos de la micro-fase 2.9 (Control Operativo Dueño).

## Contenido
- Apertura de turno asigna empleados presentes (desde fichaje).
- Cada pedido queda etiquetado con el turno activo.
- Al cierre, el sistema resume: ventas del turno, tickets, tiempo promedio pedido→entregado, mermas.
- Comparativa turno a turno para detectar dónde cae el rendimiento.

## Criterio de validación
- Los pedidos se etiquetan automáticamente con el turno abierto.
- El resumen de cierre de turno incluye ventas + tiempos + mermas.
- El dueño puede comparar dos turnos cualesquiera.
