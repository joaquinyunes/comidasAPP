# 2.7.5 — Botón "Necesito Ayuda" / "Mesa Urgente"

## Descripción
El mozo puede marcar una mesa como urgente o pedir ayuda sin dejar de atender, disparando aviso al responsable o a cocina según el caso.

## Dependencias
- `Mesa`, `Notificacion` / Socket.io.
- `Mozo_MapaSemaforo.md`.

## Contenido
- Botón en la mesa: "ayuda" (pide encargado) o "urgente" (salta en el mapa).
- La mesa cambia a rojo en el mapa y avisa al responsable.
- Útil para mesa que espera mucho o conflicto.
- Se limpia al resolverse.

## Criterio de validación
- El mozo puede marcar mesa urgente/ayuda.
- El responsable recibe el aviso y ve la mesa en rojo.
- La marca se limpia al resolver.
