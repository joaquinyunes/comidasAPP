# 2.21.2 — Multi-idioma y Multi-moneda Configurables

## Descripción (Función 6/20)
Un toggle cambia el menú del cliente a otro idioma/moneda automáticamente, para vender el mismo producto en distintos países sin reprogramar.

## Dependencias
- `Alcance_MenuIdiomas.md`, `Alcance_MultiMoneda.md`, `Producto` traducciones.

## Contenido
- Config de idiomas y moneda por tenant.
- Toggle que cambia texto y precios en la app cliente.
- La cocina/back sigue en idioma base.
- Activación sin programador.

## Criterio de validación
- El toggle cambia idioma y moneda del cliente.
- No se reprograma por país.
- El back queda en idioma base.
