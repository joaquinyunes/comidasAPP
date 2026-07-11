# 2.19.3 — Motor de Recomendación por Stock

## Descripción (Función 3/20)
Si un ingrediente está por agotarse, el sistema promueve automáticamente en el menú opciones que no lo usan (ej: si se acaba la muzzarella, sugiere pizza de rúcula). Resuelve stock y experiencia con una sola función.

## Dependencias
- `StockPorSucursal`, `RecetaInsumo`, `Cliente_SoloPosible.md`.

## Contenido
- Al bajar stock de un insumo, el sistema sube en visibilidad productos sin ese insumo.
- Sugiere alternativas en la app cliente ("quizás quieras probar X").
- No oculta lo agotado (eso lo hace 2.8.1), lo compensa con sugerencia.
- El dueño elige si activar la promoción automática.

## Criterio de validación
- Al quiebrestock de un insumo, se promueven alternativas.
- La sugerencia aparece en el menú del cliente.
- El dueño puede activar/desactivar.
