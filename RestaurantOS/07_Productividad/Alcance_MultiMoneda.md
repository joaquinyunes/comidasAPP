# 2.15.3 — Multi-moneda Configurable

## Descripción
El menú y los reportes pueden mostrarse en otra moneda configurada, para vender el mismo producto en distintos países sin reprogramar.

## Dependencias
- `WhiteLabel_MultiIdiomaMoneda.md`, `Producto.precio`.

## Contenido
- El dueño define moneda y tipo de cambio del local.
- Los precios se muestran convertidos en la app cliente.
- Los reportes del dueño pueden verse en la moneda base.
- Conversión solo de visualización (la base queda en moneda local).

## Criterio de validación
- El cliente ve precios en la moneda configurada.
- El dueño ve reportes en moneda base.
- El tipo de cambio se configura sin programador.
