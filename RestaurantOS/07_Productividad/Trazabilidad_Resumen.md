# 2.12.6 — Resumen de Micro-fase 2.12: Trazabilidad y Responsabilidad Interna

## Objetivo
Que cada acción crítica quede registrada con autor y motivo, para resolver disputas con datos y entender patrones, sin vigilancia punitiva.

## Archivos
1. `Trazabilidad_LogAnulaciones.md` — anulación con usuario/hora/motivo.
2. `Trazabilidad_LogModificaciones.md` — ediciones y descuentos manuales.
3. `Trazabilidad_LogQuienHizoQue.md` — log solo para el dueño.
4. `Trazabilidad_Patrones.md` — detectar desviaciones.
5. `Trazabilidad_ResolucionDisputas.md` — usar el registro para resolver.
6. Este resumen.

## Valor
Responsabilidad con datos, no con sospechas.

## Implementación (estado: ✅)
- **API**: `GET /api/trazabilidad/resumen` agrega anulaciones (`Anulacion` + producto + usuario), eventos (`PedidoEvento`) y conteo por usuario (quién hizo qué).
- **UI**: `/dashboard/trazabilidad` (`PanelTrazabilidad`).
- **Nota**: usa modelos `Anulacion` y `PedidoEvento` existentes; sin schema nuevo.
