# Fase 2 — POS Completo + Reservas

**Objetivo**: Operar el día a día sin planillas, con roles claros y reservas integradas.

**Tiempo estimado**: 7-9 semanas

**Dependencia**: Fase 1 completada y validada en restaurante piloto

## Qué se construye

### 1. Roles y permisos granulares
- Roles separados: Mozo, Chef, Bartender, Cajero, Gerente, Dueño
- RBAC/ABAC real: cada rol ve solo lo que le corresponde
- Panel de administración de usuarios
- Invitación de empleados por email/WhatsApp

### 2. Cobro avanzado
- Propinas: configuración de reparto (mozo, cocina, mixto)
- División de cuenta: por items, por personas, o por partes iguales
- Reembolsos con motivo obligatorio y autorización
- Apertura y cierre de caja con arqueo
- Conciliación con pasarelas de pago
- Facturación electrónica (integración con AFCA/ARCA según país)

### 3. Reservas
- Reserva visual sobre el plano (arrastrar fecha/hora/zona)
- Selección de mesa por cliente (interior, terraza, ventana, VIP)
- Campo de ocasión especial (cumpleaños, aniversario)
- Confirmación automática por email/WhatsApp
- Recordatorios 24h y 1h antes
- No-show: registro y penalización configurable

### 4. Lista de espera
- Registro de grupo en espera (nombre, cantidad, teléfono)
- Asignación automática cuando se libera una mesa compatible
- Notificación al cliente por WhatsApp/SMS cuando hay mesa
- Tiempo estimado de espera visible
- Estadísticas de espera por día/hora

### 5. Notificaciones (infraestructura)
- Sistema de notificaciones push (in-app)
- Integración email (transaccional: reservas, confirmaciones)
- Integración WhatsApp Business API (confirmaciones, recordatorios)
- Configuración por tenant (qué notificaciones activar)

### 6. Bitácora de tiempos completa
- Cada `pedido_evento` ya viene registrando timestamps desde Fase 1
- Aquí se agregan las vistas de analítica:
  - Tiempo promedio de preparación por plato
  - Tiempo promedio por chef
  - Pedidos demorados (> umbral configurable)
  - Cuellos de botella detectados

## Tablas nuevas (se agregan al schema de Fase 1)
- `reservas`
- `lista_espera`
- `notificaciones`
- `arqueos_caja`
- `propinas_config`
- `cajas` (apertura/cierre)

## Tablas de Fase 1 que se modifican
- `usuarios`: se conecta con `roles` de forma granular
- `pagos`: se agrega campo `propina`, `reembolso`, `metodo_pago_detallado`

## Criterio de éxito
- [ ] Cada empleado tiene su rol y ve solo sus pantallas
- [ ] Un mozo puede dividir la cuenta de 4 personas en < 1 minuto
- [ ] Las reservas aparecen en el plano y se confirman automáticamente
- [ ] La lista de espera notifica al cliente cuando hay mesa
- [ ] El cierre de caja cuadra con las ventas del día
