# 2.8.2 — Personalización Guiada con Tope

## Descripción
El cliente arma su pizza/conjunto mediante pasos guiados con opciones acotadas (no infinitas), para que la cocina reciba algo factible y el cliente no se frustre.

## Dependencias
- `Modificador`, `Producto` con opciones acotadas.
- `Operativo_ComandaEstructurada.md`.

## Contenido
- Pasos: tamaño → masa → ingredientes permitidos → extras.
- Límites por config (máx de ingredientes, combos válidos).
- Validación en cliente antes de enviar (no errores en cocina).
- Sugerencia de combos populares.

## Criterio de validación
- La personalización es por pasos con opciones acotadas.
- Hay un tope configurable de ingredientes.
- La selección se valida antes de enviar.
