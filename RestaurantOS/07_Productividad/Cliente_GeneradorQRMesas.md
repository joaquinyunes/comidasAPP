# 2.19.5 — Generador Automático de QR por Mesa

## Descripción (Función 17/20)
El dueño ingresa la cantidad de mesas y el sistema genera todos los QR listos para descargar e imprimir. Automatiza una tarea que hoy alguien hace a mano.

## Dependencias
- `Mesa.qrToken`, `Fidelizacion_ReconocimientoQR.md`.

## Contenido
- El dueño indica nº de mesas y el sistema crea `Mesa` + `qrToken` por cada una.
- Descarga en lote (PDF con todos los QR).
- Al escanear, vincula mesa↔cliente (2.8.4).
- Regeneración si se pierde un QR.

## Criterio de validación
- El dueño genera N mesas con QR en un clic.
- La descarga es en lote imprimible.
- El QR escaneado vincula la mesa.
