# 2.10.5 — Coordinación Cocina-Delivery por Zona

## Desrípción
La cocina ve cuándo debe soltar cada delivery según la zona, para que salga caliente y el repartidor no espere. Cierra el ciclo con 2.10.3.

## Dependencias
- `Delivery_ZonasTiempo.md`, `kds.tsx`.

## Contenido
- En el pase, los delivery llevan etiqueta de zona y hora de salida sugerida.
- Alerta si un delivery está listo pero su hora de salida aún no llega (no lo despaches).
- Alerta si pasó la hora y sigue sin despachar.
- El repartidor se libera solo al entregar.

## Criterio de validación
- El pase muestra hora de salida sugerida por delivery.
- Se alerta si se despacha fuera de hora o se retrasa.
- Cocina coordina sin preguntar.
