# 2.19.6 — Resumen de Micro-fase 2.19: Experiencia Cliente Digital

## Objetivo (Funciones 1, 2, 3, 16, 17/20)
Funciones de UI/producto que el cliente usa directamente y que se programan una vez para reutilizarse en cualquier cliente: editor visual, combos por reglas, recomendación por stock, feedback con alerta y QR automático.

## Archivos
1. `Cliente_EditorCapasPizza.md` — editor visual por capas.
2. `Cliente_CombosInteligentes.md` — combos por reglas.
3. `Cliente_MotorRecomendacionStock.md` — promover según stock.
4. `Cliente_FeedbackAlerta.md` — carita + push automático.
5. `Cliente_GeneradorQRMesas.md` — QR en lote.
6. Este resumen.

## Valor
Una experiencia de cliente que se vende sola en la demo y que no requiere reprogramar por cliente.

## Implementación (estado: ✅)
- **API**: `GET /api/cliente-digital/resumen` agrega alertas de feedback (`Feedback` tristes), combos activos (`Promocion` tipo COMBO) y mesas con QR generado.
- **UI**: `/dashboard/cliente-digital` (`PanelClienteDigital`).
- **Nota**: se apoya en modelos `Feedback`, `Promocion` y el campo `Mesa.qrCode`; sin schema nuevo.
