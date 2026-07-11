# 2.6.4 — Vista por Estación (pantallas divididas)

## Descripción
Cocina puede tener varias pantallas o secciones, una por estación, para que cada cocinero mire solo su cola y no se pierda en el ruido de todo el local.

## Dependencias
- `Cocina_AgrupacionEstacion.md`, `kds.tsx`.

## Contenido
- Config de qué estación muestra cada pantalla/terminal.
- Cada pantalla muestra solo los ítems de su estación.
- Sincronización en tiempo real entre pantallas.
- Modo "todo en una" para locales chicos.

## Criterio de validación
- Se puede asignar una estación a una pantalla.
- Esa pantalla muestra solo su cola.
- Las pantallas están sincronizadas.
