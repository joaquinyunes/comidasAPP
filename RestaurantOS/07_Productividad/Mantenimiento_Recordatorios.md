# 2.13.1 — Recordatorios de Mantenimiento Preventivo

## Descripción
Recordatorios de mantenimiento para equipos críticos (horno, heladera, freezer): fechas de limpieza y service técnico. Un horno roto un sábado es una catástrofe; hoy se maneja "de memoria".

## Dependencias
- `Equipo` (modelo nuevo), `Sucursal`.

## Contenido
- Alta de equipos con tipo, ubicación y plan de mantenimiento.
- Recordatorios por frecuencia (semanal, mensual, por horas de uso).
- Aviso al responsable antes de la fecha.
- Registro de mantenimientos hechos (quiénes, cuándo).

## Criterio de validación
- Se programan recordatorios por equipo y frecuencia.
- El responsable recibe aviso antes de la fecha.
- Los mantenimientos hechos quedan registrados.
