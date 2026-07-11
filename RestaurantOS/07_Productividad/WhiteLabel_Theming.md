# 2.21.1 — Theming / Marca Blanca

## Descripción (Función 7/20)
El dueño sube su logo y elige colores; toda la interfaz (las 4 vistas) se adapta automáticamente. Es la función que permite vender la MISMA app a 50 pizzerías distintas sin tocar el código.

## Dependencias
- Tokens de tema (CSS variables), `Sucursal`/`Tenant`.

## Contenido
- Editor de marca: logo, colores primario/secundario, fuente.
- Los tokens se aplican a web, móvil y KDS sin cambios de código.
- Vista previa en vivo del theming.
- Por tenant/sucursal, no global.

## Criterio de validación
- El dueño cambia logo/colores y se aplican a todas las vistas.
- No requiere cambio de código por cliente.
- La preview es en vivo.
