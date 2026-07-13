# 2.21.6 — Resumen de Micro-fase 2.21: White-label & Multi-tenant

## Objetivo (Funciones 7, 6, 12, 19, 15/20)
Funciones que hacen el software vendible a muchos clientes sin tocar el código: marca blanca, idioma/moneda, clonar config, clonar a otro rubro y widget embebible.

## Archivos
1. `WhiteLabel_Theming.md` — marca blanca.
2. `WhiteLabel_MultiIdiomaMoneda.md` — idioma/moneda.
3. `WhiteLabel_ModoFranquicia.md` — clonar config.
4. `WhiteLabel_ClonadoRubro.md` — nueva instancia por rubro.
5. `WhiteLabel_WidgetEmbebible.md` — menú embebible.
6. Este resumen.

## Valor
Una sola base de código vendida a 50 locales (y a otros rubros) con solo configuración.

## Implementación (estado: ✅)
- **API**: `GET /api/whitelabel/resumen` (marca, tenants, idiomas, monedas, módulos, snippet de widget), `POST /api/whitelabel/clonar-rubro` (copia categorías y productos de un tenant origen al actual).
- **UI**: `/dashboard/whitelabel` (`PanelWhiteLabel`).
- **Nota**: usa modelos `Tenant`, `CategoriaMenu`, `Producto` y `Modulo`; sin schema nuevo.
