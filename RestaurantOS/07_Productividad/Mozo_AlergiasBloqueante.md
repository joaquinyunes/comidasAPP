# 2.7.2 — Alergias como Alerta Bloqueante

## Descripción
Las alergias/intolerancias del cliente se muestran como alerta grande y bloqueante al tomar el pedido, para que nadie olvide preguntar ni envíe un plato peligroso.

## Dependencias
- `Cliente.alergias` (ver 2.4), catálogo de alérgenos.
- `Operativo_ComandaEstructurada.md`.

## Contenido
- Icono grande de alergia visible al abrir la mesa del cliente.
- Al seleccionar producto con alérgeno presente, aviso bloqueante que pide confirmar.
- La alerta viaja en la comanda a cocina.
- El dueño puede cargar alérgenos por producto en el catálogo.

## Criterio de validación
- La alergia se muestra grande al tomar el pedido.
- Seleccionar producto con alérgeno dispara aviso bloqueante.
- La alerta llega a cocina en la comanda.
