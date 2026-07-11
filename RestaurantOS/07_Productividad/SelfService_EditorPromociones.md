# 2.20.3 — Editor de Promociones con Vigencia

## Descripción (Función 14/20)
El dueño arma una promo (2x1 los martes, 20% de 20 a 21hs) y la deja programada; el sistema la activa y desactiva solo. Sin acordarse de prender/apagar.

## Dependencias
- `Promocion` (modelo nuevo), `Cliente_CombosInteligentes.md` (reglas).

## Contenido
- Editor de promo con condición, descuento y rango de vigencia (días/horas).
- El sistema evaluá vigencia y aplica/desactiva automático.
- Vista de promociones activas programadas.
- Historial de promociones pasadas.

## Criterio de validación
- El dueño programa promo con vigencia.
- El sistema la activa/desactiva solo.
- Se ve el calendario de promociones.
