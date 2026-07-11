# 2.1.1 — Fichaje de Personal Integrado

## Descripción
Registro de entrada/salida de cada empleado desde el propio sistema (no reloj externo), vinculado a turno y sucursal. Reemplaza el cuaderno o planilla suelta por un fichaje que ya existe en la base y alimenta después el cálculo de horas y el rendimiento por turno.

## Dependencias
- `Empleado` y `Turno` ya existen en `prisma/schema.prisma`.
- `Asistencia` (modelo ya presente) se usa como base del fichaje.
- Auth por PIN/QR del empleado (ver `rrhh.tsx` y `src/app/api/rrhh/*`).

## Contenido
- Pantalla de fichaje en cada terminal: el empleado se identifica y marca **Entrada** / **Salida** / **Inicio de break** / **Fin de break**.
- El fichaje queda atado a `sucursalId` y `turnoId` activo.
- Cálculo automático de horas trabajadas del turno al cerrarlo.
- Si un empleado no fichó salida, el cierre de turno lo alerta al responsable.
- El fichaje no es punitivo: es la fuente de verdad para pagos y para cruzar con ventas por turno.

## Criterio de validación
- Un empleado puede fichar entrada y salida sin salir del flujo normal de trabajo.
- El registro queda en `Asistencia` con `sucursalId`, `turnoId`, `tipo` y timestamps.
- El cierre de turno muestra horas calculadas y marca faltantes de salida.
