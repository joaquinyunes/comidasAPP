# 2.1.5 — Asistencia y Alertas de Personal

## Descripción
Visión en vivo de quién está fichado, quién está en break y quién no llegó, con alertas simples para el responsable del turno (ej. "faltan 2 mozos para el rush").

## Dependencias
- `Asistencia`, `Empleado`, `Turno`.
- Notificaciones en tiempo real (Socket.io / `Notificacion`).

## Contenido
- Panel de plantel del turno: presente / break / ausente.
- Alerta al responsable si a la hora de apertura falta personal asignado.
- Registro de inasistencias para el dueño (sin exposición al resto del equipo).
- Cruce con fichaje incompleto para marcar inconsistencias.

## Criterio de validación
- El responsable ve en tiempo real el estado de cada empleado del turno.
- Se genera alerta ante falta de personal a la hora de apertura.
- Las inasistencias quedan registradas y solo visibles para el dueño.
