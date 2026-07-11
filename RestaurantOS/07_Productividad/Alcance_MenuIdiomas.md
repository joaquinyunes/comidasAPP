# 2.15.1 — Menú en Varios Idiomas

## Descripción
El menú del cliente se puede mostrar en más de un idioma (útil en zonas turísticas), configurado desde el panel, no reprogramando.

## Dependencias
- `Producto` con traducciones por campo, `WhiteLabel_MultiIdiomaMoneda.md`.

## Contenido
- Cada producto/categoría tiene texto por idioma (nombre, descripción).
- Toggle de idioma en la app cliente.
- El dueño carga traducciones desde el panel.
- No afecta la cocina (que usa el idioma base).

## Criterio de validación
- El cliente cambia idioma y ve el menú traducido.
- El dueño carga traducciones sin programador.
- La cocina sigue viendo el idioma base.
