# 2.6.3 — Código de Urgencia por Antigüedad

## Descripción
Los pedidos en espera reciben un código de color por antigüedad (verde recién llegó → amarillo apretado → rojo hace rato), para que cocina sepa qué empujar sin que el dueño pregunte.

## Dependencias
- `PedidoItem.horaEnviado` (ver 2.5.2 semáforo).
- Config de umbrales por sucursal.

## Contenido
- Color automático por tiempo en cola.
- Rojo dispara aviso al dueño/responsable (ver 2.5.2).
- El mozo ve el mismo código en su mesa (contexto de espera).
- No requiere acción manual para colorear.

## Criterio de validación
- Los ítems en cola se colorean por antigüedad automáticamente.
- El rojo es visible y notifica al responsable.
- Mozo y cocina ven el mismo código.
