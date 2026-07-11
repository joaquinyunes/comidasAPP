# 2.6.6 — Resumen de Micro-fase 2.6: Eficiencia dentro de la Cocina

## Objetivo
Que la cocina trabaje como trabaja de verdad: por estación, en lote, mirando el tiempo de cocción y no el orden de llegada, con señales claras de urgencia y pausa.

## Archivos
1. `Cocina_AgrupacionEstacion.md` — cola por tipo de preparación.
2. `Cocina_TiempoCoccion.md` — el horno como variable central.
3. `Cocina_CodigoUrgencia.md` — verde/amarillo/rojo por antigüedad.
4. `Cocina_VistaPorEstacion.md` — pantallas divididas.
5. `Cocina_GolpeCampanaPausa.md` — mesa completa + pausa.
6. Este resumen.

## Valor
Menos caos en cocina = más pizzas salidas por hora con la misma gente.

## Implementación (estado: ✅)
- **Modelo**: `PedidoItem.urgente` (Boolean) para código de urgencia.
- **API**: `GET /api/cocina/estaciones` (agrupación por estación, urgentes primero), `GET /api/cocina/tiempos-coccion` (promedio por producto), `POST /api/cocina/items/[id]/urgente` (toggle), `POST /api/cocina/items/[id]/pausa` (golpe de campana / pausa).
- **UI**: `/dashboard/cocina` (`PanelCocinaEficiencia`) con auto-refresh.
- **Nota**: la pausa usa `estado = "en_pausa"` y reanuda a `en_preparacion`; el semáforo prioriza `urgente` y antigüedad de `horaEnviado`.
