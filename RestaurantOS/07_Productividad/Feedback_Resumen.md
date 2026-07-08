# 2.16.6 — Resumen de Micro-fase 2.16: Feedback de Calidad Post-consumo

## Objetivo
Un termómetro de calidad de dos segundos que avisa al dueño en el momento si algo salió mal, sin encuestas ni marketing.

## Archivos
1. `Feedback_CaritaCierre.md` — carita al cerrar.
2. `Feedback_AlertaDueno.md` — alerta inmediata.
3. `Feedback_NoEncuesta.md` — límites (no marketing).
4. `Feedback_Termometro.md` — pulso en tiempo real.
5. `Feedback_ResumenTurno.md` — agregado por turno.
6. Este resumen.

## Valor
Saber que algo falla esta noche, no el mes que viene.

## Implementación (estado: ✅)
- **API**: `GET /api/feedback/resumen` agrega total, % feliz, caritas tristes recientes (modelo `Feedback`) y flag de alerta al dueño.
- **UI**: `/dashboard/feedback` (`PanelFeedback`).
- **Nota**: usa el modelo `Feedback` existente; sin schema nuevo.
