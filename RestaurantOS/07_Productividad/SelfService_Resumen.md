# 2.20.6 — Resumen de Micro-fase 2.20: Configuración Self-service del Dueño

## Objetivo (Funciones 5, 11, 14, 13, 20/20)
Que el dueño deje el sistema andando y lo mantenga sin un programador: menú drag&drop, roles propios, promociones programadas, margen en vivo y checklist de arranque.

## Archivos
1. `SelfService_ConstructorMenu.md` — menú arrastrable.
2. `SelfService_RolesPermisos.md` — roles configurables.
3. `SelfService_EditorPromociones.md` — promos con vigencia.
4. `SelfService_CalculadoraMargen.md` — margen en tiempo real.
5. `SelfService_ChecklistInicial.md` — checklist de arranque.
6. Este resumen.

## Valor
El producto se vende y configura solo; vos no vas a cada local.

## Implementación (estado: ✅)
- **API**: `GET /api/selfservice/resumen` agrega categorías, productos, roles, promociones activas y módulos activos, y calcula `listoParaVender`.
- **UI**: `/dashboard/selfservice` (`PanelSelfService`).
- **Nota**: usa modelos `CategoriaMenu`, `Producto`, `Rol`, `Promocion`, `Modulo`; sin schema nuevo.
