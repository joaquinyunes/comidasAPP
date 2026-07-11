# 2.1.6 — Resumen de Micro-fase 2.1: Gestión de Personal y Turnos

## Objetivo
Que el local deje de depender de papel y memoria para el personal, y tenga trazabilidad real de quién trabajó, qué se verificó al abrir/cerrar, y cómo rinde cada turno.

## Archivos de la micro-fase
1. `Personal_Fichaje.md` — entrada/salida/break integrados.
2. `Personal_Checklist.md` — apertura/cierre digital obligatorio.
3. `Personal_Capacitacion.md` — modo práctica sin tocar datos reales.
4. `Personal_TurnosRendimiento.md` — turno + cruce con ventas/tiempos.
5. `Personal_Asistencia.md` — plantel en vivo y alertas.
6. Este resumen.

## Modelos sugeridos en Prisma
- Extender `Asistencia` con `tipo` (ENTRADA/SALIDA/BREAK_IN/BREAK_OUT) y `sucursalId`.
- Nuevos: `ChecklistPlantilla`, `ChecklistEjecucion`, `ChecklistItem`.

## Valor para el dueño
Reduce pérdida de información operativa y da base para el resto de las micro-fases (rendimiento, trazabilidad, control).
