# 2.11.3 — Diferenciación de Mermas (interna vs proveedor)

## Descripción
Separar "merma por error interno" (se cayó, se venció) de "merma por diferencia con proveedor" (llegó menos de lo pedido), porque hoy se mezclan y nadie sabe dónde se pierde la plata.

## Dependencias
- `MovimientoStock` tipo MERMA con `origen` (INTERNA/PROVEEDOR).
- Recepción de compra (2.11.2).

## Contenido
- Al recibir, se contrasta cantidad pedida vs recibida; diferencia = merma de proveedor.
- Merma interna se registra aparte (ver 2.9.3).
- Reportes separados: pérdida propia vs pérdida de proveedor.
- El dueño ve en qué canal se pierde plata.

## Criterio de validación
- La recepción marca diferencia proveedor como merma de proveedor.
- Las mermas internas y de proveedor se reportan por separado.
- El dueño distingue ambos canales de pérdida.
