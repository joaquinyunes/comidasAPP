# 2.13.6 — Resumen de Micro-fase 2.13: Mantenimiento de Equipos Críticos

## Objetivo
Que el mantenimiento de horno, heladera y freezer deje de ser "de memoria" y pase a estar programado, registrado y alertable.

## Archivos
1. `Mantenimiento_Recordatorios.md` — preventivo por frecuencia.
2. `Mantenimiento_Temperatura.md` — temperatura de heladeras.
3. `Mantenimiento_PlanLimpieza.md` — limpieza y service.
4. `Mantenimiento_AlertasFalla.md` — aviso de falla crítica.
5. `Mantenimiento_Historial.md` — historial de intervenciones.
6. Este resumen.

## Valor
Evitar catástrofes de sábado y tener respaldo de cumplimiento sanitario.

## Implementación (estado: ✅)
- **API**: `GET /api/mantenimiento/equipos` (próxima intervención, vencidos, temperaturas fuera de rango), `POST /api/mantenimiento/equipos/[id]/intervencion` (registra y calcula próxima según frecuencia), `POST /api/mantenimiento/equipos/[id]/temperatura` (marca fuera de rango).
- **UI**: `/dashboard/mantenimiento` (`PanelMantenimiento`).
- **Nota**: usa modelos `Equipo`, `EquipoIntervencion`, `RegistroTemperatura` existentes.
