# 2.16.2 — Alerta Automática al Dueño

## Descripción
Si la respuesta es negativa, se dispara alerta al dueño en el momento, para corregir en caliente, no a fin de mes.

## Dependencias
- `Feedback_CaritaCierre.md`, `Notificacion` / Socket.io.

## Contenido
- Carita triste → notificación inmediata al dueño/responsable.
- Incluye mesa, pedido y motivo libre si lo hubo.
- La alerta aparece en el panel del dueño en vivo.
- No se expone al equipo operativo (evita conflicto en el momento).

## Criterio de validación
- Una carita triste dispara alerta inmediata al dueño.
- La alerta trae contexto (mesa/pedido/motivo).
- No se muestra al equipo operativo.
