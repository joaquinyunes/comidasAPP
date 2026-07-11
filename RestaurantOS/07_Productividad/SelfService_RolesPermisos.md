# 2.20.2 — Roles y Permisos Configurables

## Descripción (Función 11/20)
El dueño crea roles intermedios (encargado de turno, cajero) y decide qué ve cada uno, sin programar caso por caso. Base de seguridad multi-rol.

## Dependencias
- `Empleado`, `Rol` (modelo nuevo o extensible), RLS.

## Contenido
- Editor de roles con permisos por sección/acción.
- Roles predefinidos (dueño, encargado, mozo, cocina, cajero, repartidor) editables.
- Herencia y excepciones por empleado.
- Cambios aplican sin redeploy.

## Criterio de validación
- El dueño crea/editar roles y permisos.
- Un empleado ve solo lo que su rol permite.
- Los cambios aplican sin programador.
