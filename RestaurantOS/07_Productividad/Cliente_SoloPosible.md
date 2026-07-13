# 2.8.1 — Mostrar Solo lo que la Cocina Puede Hacer

## Descripción
El cliente en autogestión solo ve productos realmente disponibles ahora (respeta quiebres y horarios), para no generar pedidos imposibles que el mozo deba negar.

## Dependencias
- `Producto.disponible`, `StockPorSucursal` (ver 2.7.3).
- App cliente / web (ver 2.8).

## Contenido
- El menú cliente oculta lo agotado en tiempo real.
- Horarios de disponibilidad por producto (ej. postre solo después de X).
- Sin mostrar "agotado" de forma ruidosa: simplemente no aparece.
- Al reponer, vuelve a aparecer solo.

## Implementación (estado: ✅) — Micro-fase 2.8 Autogestión del Cliente
- **API**: `GET /api/cliente/menu?mesaId=` (solo productos `disponible=true`, agrupados por categoría, con alérgenos), `GET /api/cliente/producto/[id]/opciones` (personalización guiada), `POST /api/cliente/pedido` (crea pedido validando disponibilidad), `GET /api/cliente/pedido/[id]` (estado vivo), `GET /api/cliente/pedido/[id]/estado` (mensaje amable sin apurar + progreso).
- **UI**: `/cliente/[mesaId]` (`PanelAutoCliente`) — menú, carrito y seguimiento en vivo del pedido.
- **Validación**: `ClientePedidoSchema` en `src/lib/validation.ts`.
- **Nota**: las rutas cliente son públicas; el `tenantId` se deriva de la `Mesa`. Solo se permiten productos disponibles (Solo Posible).

## Criterio de validación
- El cliente no ve productos agotados.
- Los horarios de producto se respetan en el menú.
- Al reponer, el producto reaparece.
