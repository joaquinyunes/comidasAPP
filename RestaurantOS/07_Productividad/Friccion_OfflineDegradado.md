# 2.2.2 — Modo Offline Degradado (LAN Local)

## Descripción
Si se cae la red/internet, el local sigue operando en la LAN local: toma de pedidos, cocina y caja funcionan; al volver la conexión, se sincroniza con el servidor. Evita el "cerramos porque se cortó el wifi".

## Dependencias
- Backend capaz de correr en red local (mismo servidor que atiende tablets/PC del local).
- Cola de pendientes por terminal para sincronizar al reconectar.

## Contenido
- Detección de pérdida de conexión al servidor principal.
- Cambio a modo local: cada terminal sigue operando contra una réplica/base local.
- Los pedidos generados offline se encolan y se vuelcan al servidor al reconectar (sin duplicados).
- Banner visible "MODO OFFLINE — se sincronizará al reconectar".

## Criterio de validación
- Con internet caído, mozo + cocina + caja siguen operando en LAN.
- Al reconectar, los pedidos offline aparecen en el servidor sin duplicar.
- El usuario ve claramente que está en modo offline.
