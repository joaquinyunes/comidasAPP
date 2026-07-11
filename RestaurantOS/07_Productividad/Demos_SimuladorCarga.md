# 2.22.2 — Simulador de Carga (Stress Test Visual)

## Descripción (Función 8/20)
Una función que genera pedidos ficticios en cadena para que el dueño vea en la demo cómo se comporta el sistema en un rush simulado, sin un local real prendido.

## Dependencias
- `Pedido`, generador de datos ficticios, `kds.tsx`.

## Contenido
- Botón "simular rush" que inyecta N pedidos en cola.
- La cocina y el dashboard reaccionan como en vivo.
- Detener y limpiar la simulación sin afectar datos reales.
- Útil para vender en demo y para capacitar (2.1.3).

## Criterio de validación
- El dueño dispara una simulación de rush.
- El sistema reacciona como en vivo.
- Se limpia sin tocar datos reales.
