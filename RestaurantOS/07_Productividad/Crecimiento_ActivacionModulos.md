# 2.23.2 — Activación de Módulos de Crecimiento

## Descripción
Al activar un módulo (delivery, multi-sucursal, proveedores), el sistema habilita las funciones y la configuración asociada sin redeploy.

## Dependencias
- `Crecimiento_PlanesLicencias.md`, micro-fases 2.3/2.10/2.11.

## Contenido
- Cada módulo es un flag que enciende features y menús.
- Al activar, el checklist de configuración (2.20.5) guía el setup.
- Las features aparecen solo si el módulo está activo.
- El dueño no necesita soporte para activar.

## Criterio de validación
- Activar un módulo enciende sus features/menús.
- El checklist guía el setup del módulo.
- No requiere soporte para activar.
