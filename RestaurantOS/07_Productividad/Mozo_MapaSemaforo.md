# 2.7.1 — Mapa de Mesas con Semáforo de Atención

## Descripción
Vista de planta del salón con cada mesa coloreada por estado de atención (libre / esperando pedido / comiendo / cuenta solicitada / alerta). El mozo ve todo el salón de una mirada.

## Dependencias
- `Mesa`, `Pedido` por mesa, estados.
- `reservas.tsx` / mapa de mesas.

## Contenido
- Plano editable de mesas (añadir/quitar/mover).
- Color por estado: verde libre, azul atendiendo, amarillo cuenta pedida, rojo esperando hace rato.
- Clic en mesa abre su pedido/estado.
- Filtro por mozo asignado.

## Criterio de validación
- El mozo ve el salón completo con semáforo por mesa.
- El color refleja el estado real del pedido.
- Se puede abrir la mesa desde el mapa.
