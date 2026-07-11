# 2.9.2 — Tiempos de Servicio (pedido→listo, listo→entregado)

## Descripción
Dos tiempos distintos que el dueño debe ver por separado: cuánto tarda cocina (pedido→listo) y cuánto tarda el salón en llevar (listo→entregado). Separa culpa de cocina de culpa de salón.

## Dependencias
- `PedidoItem` con `horaEnviado`, `horaListo`, `horaEntregado`.
- Semáforo (2.5.2), código urgencia (2.6.3).

## Contenido
- Tiempo A: pedido→listo (cocina).
- Tiempo B: listo→entregado (salón).
- Promedios por franja horaria y por producto.
- Alerta si alguno se dispara por encima de la media.

## Criterio de validación
- El sistema calcula ambos tiempos por pedido.
- Se ven promedios por franja y producto.
- Se alerta cuando un tiempo supera la media.
