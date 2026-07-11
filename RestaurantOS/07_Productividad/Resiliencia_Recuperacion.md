# 2.17.3 — Recuperación ante Caída de Red/Servidor

## Descripción
Procedimiento y soporte técnico para volver a operar tras una caída, combinando offline (2.2.2) y backup (2.17.1).

## Dependencias
- `Resiliencia_Backup.md`, `Friccion_OfflineDegradado.md`.

## Contenido
- Detección de caída y paso a modo offline automático.
- Al reconectar, sincronización y merge (2.2.5).
- Si el servidor se perdió, restauración desde backup.
- Log de incidente para el dueño.

## Criterio de validación
- La caída dispara modo offline sin perder operación.
- La reconexión sincroniza sin duplicados.
- Se puede restaurar desde backup si hace falta.
