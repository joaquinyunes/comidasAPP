# 2.4.1 — Reconocimiento de Cliente Recurrente

## Descripción
Cuando un cliente recurrente se identifica (QR, login o mesa vinculada), el sistema lo reconoce y muestra contexto al mozo sin ser una campaña de marketing. Es operativo: saber con quién se está atendiendo.

## Dependencias
- `Cliente`, `HistorialCliente` (ver 2.4.2).
- `pedidos.tsx` / flujo de mesa.

## Contenido
- Identificación por QR de mesa, login de cliente o tarjeta.
- Al abrir la mesa/pedido, el sistema marca "Cliente frecuente".
- Muestra datos útiles al mozo: visitas, preferencias, alergias conocidas.
- Sin exposición de datos personales sensible al resto del equipo.

## Criterio de validación
- Un cliente identificado se marca como recurrente en su mesa.
- El mozo ve contexto relevante (no marketing).
- Los datos sensibles no se muestran a quien no corresponde.
