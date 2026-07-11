# 2.22.1 — Exportador de Reportes PDF/Excel con un Clic

## Descripción (Función 10/20)
Cualquier reporte del dashboard (ventas, mermas, tiempos) se descarga listo para imprimir o mandar por mail, sin armarlo manualmente.

## Dependencias
- `dashboard-bi.tsx`, reportes de 2.9/2.11/2.16.

## Contenido
- Botón de exportar en cada reporte (PDF y Excel).
- El documento respeta el theme del local (2.21.1).
- Incluye filtros aplicados (fecha, sucursal).
- Listo para imprimir o adjuntar.

## Criterio de validación
- Un clic exporta el reporte a PDF y Excel.
- El documento respeta el theme.
- Incluye los filtros aplicados.
