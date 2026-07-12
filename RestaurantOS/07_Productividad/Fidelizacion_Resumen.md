# 2.4.6 — Resumen de Micro-fase 2.4: Fidelización Operativa

## Objetivo
Que el mozo reconozca al cliente recurrente y anticipe sus gustos en el momento de atender, mejorando la experiencia sin recursos de marketing.

## Archivos
1. `Fidelizacion_ClienteRecurrente.md` — reconocimiento en mesa.
2. `Fidelizacion_HistorialMesa.md` — preferencias y "suele pedir X".
3. `Fidelizacion_ReconocimientoQR.md` — vinculación por QR/login.
4. `Fidelizacion_SugerenciasMozo.md` — sugerencia en el momento.
5. `Fidelizacion_Logistica.md` — límites (no marketing).
6. Este resumen.

## Valor
Atender como local de barrio que conoce a su gente, pero con la memoria del sistema.

## Implementación (estado: ✅)
- **Modelo**: `VisitaMesa` (historial por mesa + cliente, monto, personas) y campos de lealtad ya existentes en `Cliente` (puntos, nivel, totalVisitas, ultimaVisita, favoritos).
- **API**: `GET /api/fidelizacion/clientes-recurrentes`, `POST /api/fidelizacion/visitas`, `GET /api/fidelizacion/historial-mesa`, `POST /api/fidelizacion/reconocimiento` (QR), `GET /api/fidelizacion/sugerencias-mozo`, `GET /api/fidelizacion/logistica`.
- **UI**: `/dashboard/fidelizacion` (`PanelFidelizacion`) — clientes, registro de visita, reconocimiento QR con sugerencias y resumen de logística.
- **Validación**: `VisitaMesaSchema`, `ReconocimientoSchema` en `src/lib/validation.ts`.
- **Nota**: sin recursos de marketing; usa memoria del sistema para anticipar gustos.
