# 2.16.1 — Pregunta de Cierre con Carita

## Descripción
Al cerrar la cuenta, una pregunta de dos segundos ("¿todo bien con tu pedido?") con carita feliz/neutral/triste. No es encuesta larga: es un termómetro de calidad.

## Dependencias
- `Pedido` al cerrar, app cliente/mozo.
- Reutilizado por la función producto de feedback (2.19.4).

## Contenido
- Al cerrar, se muestra carita feliz/neutral/triste (un toque).
- Opcional: un campo libre corto si sale triste.
- No pide email ni datos de marketing.
- El mozo o el cliente pueden responder según el flujo.

## Criterio de validación
- Al cerrar cuenta aparece la carita de 2 segundos.
- No pide datos de marketing.
- La respuesta queda registrada por pedido.
