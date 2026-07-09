# Historias de Usuario — RestaurantOS

## Fase 1 — Fundación

### HU-01: Escanear QR y ver menú
**Como** cliente quiero escanear el QR de mi mesa para ver el menú y poder pedir sin esperar al mozo.
**Estimación**: 5 pts | **Criterio**: QR abre menú, sabe la mesa, menú carga en < 3s

### HU-02: Enviar pedido a cocina
**Como** cliente quiero enviar mi pedido desde el celular para que llegue directo a cocina.
**Estimación**: 5 pts | **Criterio**: Pedido aparece en KDS en < 5s, mozo recibe notificación

### HU-03: Ver estado del pedido
**Como** cliente quiero ver en qué estado está mi pedido (recibido, preparando, listo, servido).
**Estimación**: 3 pts | **Criterio**: Estado se actualiza en tiempo real (< 2s)

### HU-04: Tomar pedido desde tablet
**Como** mozo quiero tomar pedidos desde una tablet para enviarlos a cocina rápidamente.
**Estimación**: 5 pts | **Criterio**: Pedido enviado en < 30s, con notas y alergias

### HU-05: Ver pedidos en cocina
**Como** chef quiero ver los pedidos ordenados por prioridad y hora para organizar la preparación.
**Estimación**: 5 pts | **Criterio**: Pedidos ordenados, temporizador visible, 1 click para marcar "listo"

### HU-06: Cerrar mesa y cobrar
**Como** mozo quiero cerrar una mesa y cobrar para liberarla para el siguiente cliente.
**Estimación**: 5 pts | **Criterio**: Cobro registrado, mesa cambia a "limpieza"

### HU-07: Ver gemelo digital
**Como** dueño quiero ver un plano interactivo del restaurante para saber qué pasa en tiempo real.
**Estimación**: 8 pts | **Criterio**: Plano con mesas que cambian de color, click para info detallada

### HU-08: Login y roles básicos
**Como** empleado quiero loguearme para acceder a mi panel según mi rol.
**Estimación**: 3 pts | **Criterio**: Auth funciona, cada rol ve sus pantallas

---

## Fase 2 — POS Completo + Reservas

### HU-09: Dividir la cuenta
**Como** cliente quiero dividir la cuenta con mis amigos por items o por partes iguales.
**Estimación**: 5 pts | **Criterio**: 3 modos de división, cálculo correcto, cobro separado

### HU-10: Reservar mesa
**Como** cliente quiero reservar una mesa eligiendo fecha, hora, cantidad y zona.
**Estimación**: 8 pts | **Criterio**: Disponibilidad en tiempo real, confirmación automática

### HU-11: Recibir recordatorio de reserva
**Como** cliente quiero recibir un recordatorio 24h y 1h antes de mi reserva.
**Estimación**: 3 pts | **Criterio**: Notificación enviada por WhatsApp/email

### HU-12: Gestionar lista de espera
**Como** recepción quiero agregar grupos a la espera y notificarlos cuando haya mesa.
**Estimación**: 5 pts | **Criterio**: Registro, notificación automática, tiempo estimado visible

### HU-13: Abrir y cerrar caja
**Como** cajero quiero abrir la caja con un monto inicial y cerrarla con arqueo al final del turno.
**Estimación**: 5 pts | **Criterio**: Arqueo calcula diferencia, registro completo

### HU-14: Repartir propinas
**Como** gerente quiero configurar cómo se reparten las propinas entre mozos y cocina.
**Estimación**: 3 pts | **Criterio**: Configurable por tenant, cálculo automático

---

## Fase 3 — Stock + Inventario

### HU-15: Descontar stock automáticamente
**Como** sistema quiero descontar ingredientes cuando un chef marca "listo" un plato.
**Estimación**: 8 pts | **Criterio**: Descuento correcto según receta, bitácora registrada

### HU-16: Recibir alerta de stock bajo
**Como** gerente quiero recibir una alerta cuando un ingrediente esté por debajo del mínimo.
**Estimación**: 3 pts | **Criterio**: Alerta visible en dashboard y push

### HU-17: Ver costo de cada plato
**Como** dueño quiero ver cuánto cuesta cada plato y cuánto gano con cada uno.
**Estimación**: 5 pts | **Criterio**: Costo calculado automáticamente, margen visible

### HU-18: Crear orden de compra
**Como** gerente quiero crear una orden de compra para un proveedor cuando falta stock.
**Estimación**: 5 pts | **Criterio**: Orden generada, enviada por email, recepción actualiza stock

---

## Fase 4 — CRM + Marketing

### HU-19: Ver perfil del cliente
**Como** mozo quiero ver el perfil del cliente (historial, favoritos, alergias) al atenderlo.
**Estimación**: 5 pts | **Criterio**: Perfil completo visible en < 2s

### HU-20: Acumular y canjear puntos
**Como** cliente quiero acumular puntos con cada compra y canjearlos por recompensas.
**Estimación**: 8 pts | **Criterio**: Puntos acreditados automáticamente, catálogo de recompensas

### HU-21: Enviar cupón de cumpleaños
**Como** sistema quiero enviar un cupón automáticamente el día del cumpleaños del cliente.
**Estimación**: 3 pts | **Criterio**: Cupón generado y enviado, registrado en historial

### HU-22: Crear campaña de marketing
**Como** gerente quiero crear una campaña de email/WhatsApp segmentada por clientes.
**Estimación**: 5 pts | **Criterio**: Segmentación funcional, envío registrado, métricas visibles

---

## Fase 5 — RRHH + Analytics

### HU-23: Ver horario y turnos
**Como** empleado quiero ver mis turnos asignados y solicitar cambios.
**Estimación**: 5 pts | **Criterio**: Turnos visibles, solicitud de cambio funcional

### HU-24: Ver dashboard de analytics
**Como** dueño quiero ver gráficos de ventas, horas pico, productos más vendidos.
**Estimación**: 8 pts | **Criterio**: Mínimo 5 gráficos, datos en tiempo real, exportable

### HU-25: Detectar cuellos de botella
**Como** sistema quiero alertar cuando un pedido o una mesa estén tardando más de lo normal.
**Estimación**: 5 pts | **Criterio**: Umbral configurable, alerta en dashboard y push

---

## Fase 6 — IA + Marketplace

### HU-26: Recibir sugerencia de compra por IA
**Como** gerente quiero que la IA me sugiera qué comprar según historial y demanda.
**Estimación**: 8 pts | **Criterio**: Sugerencia con justificación, editable, ahorro medible

### HU-27: Recibir recomendación personalizada
**Como** cliente quiero que el menú me recomiende platos según mis gustos anteriores.
**Estimación**: 8 pts | **Criterio**: Recomendación visible en menú, CTR > 5%

---

## Resumen de estimación

| Fase | Historias | Puntos totales |
|------|-----------|----------------|
| Fase 1 | 8 | 39 |
| Fase 2 | 6 | 29 |
| Fase 3 | 4 | 21 |
| Fase 4 | 4 | 21 |
| Fase 5 | 3 | 18 |
| Fase 6 | 2 | 16 |
| **Total** | **27** | **144** |
