# 2.10.4 — Trazabilidad de Retiro y Entrega

## Descripción
Registro de quién retiró qué pedido y a qué hora, para resolver reclamos de "nunca llegó" con datos, no opiniones.

## Dependencias
- `Pedido`, `Empleado` repartidor.
- Log de auditoría (2.12).

## Contenido
- Al despachar, se registra repartidor, hora de salida.
- Al entregar, el repartidor confirma hora de entrega (o firma/cliente).
- Historial consultable por pedido.
- Alerta si un delivery lleva mucho tiempo sin entregar.

## Criterio de validación
- Todo despacho registra repartidor y hora.
- Toda entrega registra hora de entrega.
- El dueño puede auditar cualquier pedido.
