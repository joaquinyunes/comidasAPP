# 2.5.3 — Comanda Estructurada (no texto libre)

## Descripción
La comanda se arma con botones y modificadores predefinidos, no con texto libre que cocina debe interpretar. Reduce errores de lectura y ambigüedad.

## Dependencias
- `Producto`, `Modificador`, `PedidoItem`.
- Catálogo central (ver 2.3.2).

## Contenido
- El mozo selecciona producto + modificadores desde catálogo (sin escribir).
- La comanda llega a cocina ya estructurada: ítems, cantidad, modificadores, urgencia.
- Notas libres solo como complemento, marcadas aparte.
- Cocina ve lo mismo que el mozo (una sola fuente de verdad).

## Criterio de validación
- El pedido se arma sin texto libre obligatorio.
- Cocina recibe la comanda estructurada idéntica a lo tomado.
- Las notas libres se ven separadas de los ítems.
