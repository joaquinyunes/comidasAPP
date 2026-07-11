# 2.10.2 — Estado Visible para el Cliente ("en camino")

## Descripción
El cliente ve el estado de su delivery (preparando / en camino / entregado) sin app de terceros, reduciendo llamadas "¿dónde está mi pedido?".

## Dependencias
- `Pedido` estado de delivery, app cliente (ver 2.8.5).
- Asignación de repartidor (2.10.1).

## Contenido
- Estados empujados al cliente: preparando → en camino → entregado.
- Al marcar "en camino", el cliente recibe notificación.
- Sin mostrar ubicación GPS exacta si no se quiere (solo etapa).
- Coherente con autogestión (2.8).

## Criterio de validación
- El cliente ve "en camino" al despachar.
- El estado refleja el del repartidor.
- No requiere app de terceros.
