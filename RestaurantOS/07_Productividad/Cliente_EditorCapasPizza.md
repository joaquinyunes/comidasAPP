# 2.19.1 — Editor Visual de Pizza por "Capas"

## Descripción (Función 1/20)
Editor visual donde el cliente ve la pizza en pantalla y toca zonas (mitad y mitad, extra en un borde) con actualización de precio en vivo. Se programa una sola vez y se reutiliza en cualquier cliente. Reemplaza la lista de checkboxes por una UI concreta y vendible.

## Dependencias
- `Producto`, `Modificador` con posición/zona, `Cliente_ConfirmacionPedido.md`.

## Contenido
- Lienzo de pizza con zonas editables (entera, mitad A/B, borde).
- Tocar zona agrega ingrediente y recalcula precio en vivo.
- Validación de tope de ingredientes (ver 2.8.2).
- El resultado se convierte en comanda estructurada (2.5.3).

## Criterio de validación
- El cliente edita por zonas y ve el precio actualizarse en vivo.
- Se respetan los topes configurados.
- La selección sale como comanda estructurada.
