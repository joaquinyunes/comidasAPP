# 2.6.5 — Golpe de Campana y Pausa por Insumo

## Descripción
- "Golpe de campana": marcar visualmente que una mesa completa está lista para servir junta (no llevar de a uno).
- "En espera por insumo": pausar un ítem si falta algo, sin fingir que avanza.

## Dependencias
- `PedidoItem.estado`, `Pedido` agrupado por mesa.

## Contenido
- Botón "mesa completa lista" que junta todos los ítems LISTO de la mesa.
- Estado `EN_ESPERA` para ítems detenidos por falta de insumo, con motivo.
- Los ítems en espera no cuentan como demora injusta en las métricas (2.9).
- Al reanudar, vuelve a cola normal.

## Criterio de validación
- Se puede marcar una mesa completa como lista junta.
- Un ítem se puede pausar con motivo "falta insumo".
- La pausa no infla el tiempo de cocción reportado.
