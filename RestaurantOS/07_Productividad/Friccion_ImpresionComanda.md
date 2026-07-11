# 2.2.1 — Impresión Automática de Comanda en Cocina

## Descripción
Al enviar un pedido, la comanda se imprime sola en la impresora de cocina (respaldo físico del KDS). El mozo no pierde tiempo yendo a avisar; la cocina tiene papel si la pantalla falla.

## Dependencias
- `Pedido`, `PedidoItem`, impresora térmica en LAN.
- `kds.tsx` / `kds-completo.tsx` ya existen como pantalla; esto agrega el ticket impreso.

## Contenido
- Envío de pedido dispara impresión de ticket estructurado (nro, mesa, ítems, modificadores, urgencia).
- Reintento automático si la impresora no responde; avisa si falla después de N intentos.
- Botón "reimprimir comanda" desde cocina/mozo.
- Formato legible para cocina: agrupado por estación (ver 2.6).

## Criterio de validación
- Al enviar pedido se genera el ticket en impresora configurada.
- Ante fallo de impresora, el sistema lo señala sin bloquear el envío al KDS.
- Se puede reimprimir una comanda específica.
