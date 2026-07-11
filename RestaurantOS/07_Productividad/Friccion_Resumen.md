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
