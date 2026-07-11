# 2.2.6 — Resumen de Micro-fase 2.2: Reducción de Fricción Física

## Objetivo
Eliminar los pasos manuales que hoy frican al mozo y a la cocina: avisar a mano, depender de internet, y anular cosas "por las buenas". Que el sistema cubra el respaldo físico (papel) y el fallo técnico.

## Archivos
1. `Friccion_ImpresionComanda.md` — ticket automático en cocina.
2. `Friccion_OfflineDegradado.md` — operación en LAN si cae internet.
3. `Friccion_AnulacionTrazable.md` — cancelar con doble confirmación + motivo.
4. `Friccion_HardwareResp.md` — botón físico de acciones críticas.
5. `Friccion_LANLocal.md` — sincronización y respaldo de turno.
6. Este resumen.

## Modelos sugeridos
- `Anulacion` (pedidoItemId, empleadoId, motivo, timestamp).
- Extender `PedidoItem` con `estadoAnulacion`.

## Valor
Menos errores, menos tiempo muerto, y operación que no se detiene por un fallo técnico.

## Implementación (estado: ✅)
- **Modelos**: `Anulacion` + `PedidoItem.anulado` / `motivoAnulacion`; eventos `PedidoEvento` (ANULACION, IMPRESION_COMANDA).
- **API**:
  - Anulación trazable: `POST /api/pedidos/[id]/items/[itemId]/anular`, `GET /api/pedidos/[id]/items/[itemId]/anulaciones`.
  - Impresión: `GET /api/cocina/comandas`, `POST /api/cocina/comandas/[id]/imprimir` (genera ticket de comanda).
  - Offline/LAN: `GET /api/friccion/estado` (health), `POST /api/friccion/sync` (vacía cola offline de anulaciones).
- **UI**: `src/app/dashboard/friccion` + `src/components/friccion/PanelFriccion.tsx` (anulación, indicador online/offline, cola y ticket).
- **Validación**: `AnulacionSchema`, `OfflineSyncSchema` en `src/lib/validation.ts`.
