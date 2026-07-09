# Casos de Uso — RestaurantOS

## CU-01: Cliente pide desde mesa (Fase 1)

**Actor**: Cliente | **Precondiciones**: Mesa con QR, menú publicado

1. Escanea QR → se abre menú (sabe la mesa automáticamente)
2. Navega menú (fotos, ingredientes, alérgenos)
3. Agrega items al pedido
4. Envía pedido
5. Ve estado en tiempo real

**Postcondiciones**: Pedido registrado, notificado a cocina y mozo

---

## CU-02: Chef procesa pedido (Fase 1)

**Actor**: Chef | **Precondiciones**: Pedido recibido en KDS

1. Ve pedido nuevo en pantalla
2. Marca "en preparación"
3. Prepara el plato
4. Marca "listo"
5. Sistema notifica al mozo
6. Timestamp registrado en bitácora

**Postcondiciones**: Pedido actualizado, mozo notificado

---

## CU-03: Mozo toma pedido presencial (Fase 1)

**Actor**: Mozo | **Precondiciones**: Mozo asignado a la mesa

1. Ve sus mesas en el mapa
2. Selecciona mesa
3. Toma pedido en la tablet
4. Envía a cocina
5. Recibe notificación cuando está listo
6. Sirve al cliente

**Postcondiciones**: Pedido registrado, cocina notificada

---

## CU-04: Mozo cobra y cierra mesa (Fase 1)

**Actor**: Mozo/Cajero | **Precondiciones**: Pedido entregado, cliente quiere pagar

1. Cliente pide la cuenta
2. Mozo selecciona mesa → ve total
3. Cliente paga (efectivo/tarjeta)
4. Mozo registra pago
5. Mesa pasa a "limpieza"

**Postcondiciones**: Pago registrado, mesa liberada

---

## CU-05: Dueño ve dashboard (Fase 1)

**Actor**: Dueño | **Precondiciones**: Autenticado

1. Abre app/web
2. Ve gemelo digital del restaurante
3. Ve indicadores en vivo: ventas, mesas ocupadas, pedidos en cocina
4. Navega a diferentes vistas

**Postcondiciones**: Dueño tiene visibilidad total

---

## CU-06: Reserva de mesa (Fase 2)

**Actor**: Cliente | **Precondiciones**: Mesas configuradas, horarios disponibles

1. Selecciona fecha, hora, cantidad
2. Ve disponibilidad en el plano
3. Elige mesa (interior, terraza, ventana)
4. Indica ocasión especial (opcional)
5. Confirma reserva
6. Recibe confirmación por email/WhatsApp

**Postcondiciones**: Reserva creada, confirmación enviada

---

## CU-07: División de cuenta (Fase 2)

**Actor**: Mozo | **Precondiciones**: Mesa con pedido, cliente quiere dividir

1. Cliente solicita dividir cuenta
2. Mozo elige: por items, por personas, partes iguales
3. Sistema calcula montos
4. Cada parte paga por separado
5. Mesa se cierra cuando todos pagan

**Postcondiciones**: Pagos registrados, mesa cerrada

---

## CU-08: Descuento automático de stock (Fase 3)

**Actor**: Sistema (automático) | **Precondiciones**: Receta vinculada, stock registrado

1. Chef marca pedido como "listo"
2. Sistema identifica receta del producto
3. Descuenta ingredientes del stock
4. Si stock baja del mínimo → alerta al dueño
5. Movimiento registrado en bitácora de stock

**Postcondiciones**: Stock actualizado, alerta generada si aplica

---

## CU-09: Sugerencia de compra automática (Fase 3)

**Actor**: Sistema / Gerente | **Precondiciones**: Stock con umbrales configurados

1. Sistema detecta ingrediente por debajo del mínimo
2. Genera sugerencia de compra
3. Gerente revisa y aprueba (o modifica)
4. Se crea orden de compra
5. Se envía al proveedor (email/WhatsApp)
6. Proveedor confirma entrega
7. Gerente recibe mercadería → stock se actualiza

**Postcondiciones**: Stock repuesto, orden completada

---

## CU-10: Cliente acumula puntos (Fase 4)

**Actor**: Cliente/Sistema | **Precondiciones**: Cliente registrado, programa activo

1. Cliente paga pedido
2. Sistema calcula puntos según monto
3. Puntos se acreditan al perfil del cliente
4. Si alcanza siguiente nivel → notificación de upgrade
5. Cliente puede canjear puntos por recompensas

**Postcondiciones**: Puntos actualizados, recompensaRegistrada si aplica

---

## CU-11: Marketing automático (Fase 4)

**Actor**: Sistema | **Precondiciones**: Campañas configuradas, clientes con opt-in

1. Sistema detecta触发 (cumpleaños, inactividad, nivel)
2. Genera cupón/promoción automáticamente
3. Envía por canal configurado (email/WhatsApp/SMS)
4. Registra envío y apertura
5. Si cliente canjea → registra conversión

**Postcondiciones**: Campaña enviada, métrica registrada
