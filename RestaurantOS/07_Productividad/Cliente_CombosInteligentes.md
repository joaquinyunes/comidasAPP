# 2.19.2 — Combos Inteligentes por Reglas

## Descripción (Función 2/20)
El dueño configura reglas tipo "si compra 2 pizzas grandes, bebida al 50%" y el sistema arma el combo solo, sin crearlo pedido por pedido. Una función de reglas, no de catálogo estático.

## Dependencias
- `Producto`, motor de reglas (modelo `ReglaCombo` nuevo).

## Contenido
- El dueño define reglas (condición → descuento) desde el panel.
- Al armar el carrito, el sistema detecta reglas aplicables y aplica.
- El combo se muestra como ahorro visible al cliente.
- Se puede apilar o excluir según config.

## Criterio de validación
- El dueño crea reglas sin programador.
- El sistema aplica el combo automáticamente al carrito.
- El ahorro es visible para el cliente.
