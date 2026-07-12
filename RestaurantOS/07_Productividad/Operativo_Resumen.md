# 2.5.6 — Resumen de Micro-fase 2.5: Comunicación Cocina-Mozos

## Objetivo
Que cocina y mozos dejen de depender del grito y la memoria: la comanda viaja sola, avisa cuando está lista, y el tiempo de espera se ve a simple vista.

## Archivos
1. `Operativo_AlertasActivas.md` — aviso vibra+sonido al listo.
2. `Operativo_SemaforoPase.md` — semáforo de tiempo en el pase.
3. `Operativo_ComandaEstructurada.md` — sin texto libre.
4. `Operativo_StockTiempoReal.md` — quiebres visibles.
5. `Operativo_ConfirmacionVoz.md` — confirmar antes de enviar.
6. Este resumen.

## Valor
Menos errores de comunicación = menos platos mal hechos y mesas esperando.

## Implementación (estado: ✅)
- **API**: `GET /api/operativo/alertas` (semáforo de pase por tiempo de espera), `POST /api/operativo/pase` (mozo confirma entrega, cierra pedido si corresponde), `GET /api/operativo/comandas-estructuradas` (vista cocina agrupada por estación), `GET /api/operativo/stock-tiempo-real` (quiebres visibles), `POST /api/operativo/confirmacion-voz` (evento de confirmación).
- **UI**: `/dashboard/operativo` (`PanelOperativo`) — alertas con auto-refresh, comandas por estación, stock en tiempo real y confirmación de voz.
- **Eventos**: `PedidoEvento` tipos `PASE_MOZO` y `CONFIRMACION_VOZ` para trazabilidad.
- **Nota**: usa `PedidoItem.horaListo`/`horaEntregado` y `producto.estacion` para derivar el semáforo y agrupar comandas.
