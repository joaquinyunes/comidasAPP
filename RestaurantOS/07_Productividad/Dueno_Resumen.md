# 2.9.6 — Resumen de Micro-fase 2.9: Control Operativo del Dueño

## Objetivo
Que el dueño tenga, en vivo y por separado, la verdad del local: qué se devuelve y por qué, cuánto tarda cocina vs salón, dónde se pierde stock, y qué mesas se descuidan.

## Archivos
1. `Dueno_PlatosDevueltos.md` — devoluciones por motivo.
2. `Dueno_TiemposServicio.md` — pedido→listo (cocina) y listo→entregado (salón).
3. `Dueno_MermasInventario.md` — mermas + diferencia físico/digital.
4. `Dueno_MesasDesatendidas.md` — mapa de calor de espera.
5. `Dueno_RendimientoEmpleado.md` — rendimiento por turno/empleado + alertas de cuellos de botella.
6. Este resumen.

## Valor
Pasar de "ver la caja a fin de mes" a corregir en la noche lo que sale mal, antes de que se repita.

## Implementación (estado: ✅)
- **API**: `GET /api/dueno/control-operativo` agrega platos devueltos (modelo `Anulacion`), tiempo promedio de servicio (`PedidoItem.horaListo - horaEnviado`), mermas/quiebres (`stockPorSucursal`), mesas desatendidas (mesas ocupadas sin pedido reciente) y ranking de mozos.
- **UI**: `/dashboard/dueno` (`PanelControlDueno`).
- **Nota**: todo se calcula sobre los últimos 30 días sin schema nuevo (usa modelos existentes).
