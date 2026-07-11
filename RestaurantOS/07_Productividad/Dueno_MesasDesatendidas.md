# 2.9.5 — Mesas Desatendidas (mapa de calor)

## Descripción
El dueño ve en el mapa de salón cuánto tiempo estuvo cada mesa sin atención (esperando pedido, esperando cuenta), para detectar cuellos de mozo.

## Dependencias
- `Mesa`, tiempos de pedido/cuenta, `Mozo_MapaSemaforo.md`.

## Contenido
- Mapa de calor por tiempo de espera por mesa.
- Reporte de mesas que esperaron más de X.
- Cruza con turno y mozo asignado.
- Ayuda a redistribuir plantel en el momento.

## Criterio de validación
- El dueño ve mapa de calor de espera por mesa.
- Se reportan mesas sobre el umbral.
- Se puede filtrar por turno/mozo.
