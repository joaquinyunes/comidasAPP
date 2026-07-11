# 2.19.4 — Feedback en el Momento con Alerta Automática

## Descripción (Función 16/20)
La carita feliz/neutral/triste (ver 2.16) como función de producto: si hay 3 respuestas negativas seguidas, dispara automáticamente una notificación push al dueño, sin intervención humana. Reutiliza el módulo operativo de feedback.

## Dependencias
- `Feedback_CaritaCierre.md`, `Feedback_AlertaDueno.md`, `Notificacion`.

## Contenido
- La carita se registra por pedido/mesa.
- Contador de negativas seguidas por local/turno.
- Al llegar a 3 negativas, push automático al dueño con contexto.
- El dueño ve el hilo de respuestas en su panel.

## Criterio de validación
- 3 negativas seguidas disparan push automático.
- El push trae contexto (mesas/pedidos).
- Reutiliza el módulo de feedback sin duplicar.
