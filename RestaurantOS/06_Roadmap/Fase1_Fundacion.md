# Fase 1 — Fundación + Operativa Básica

**Objetivo**: Que un restaurante piloto pueda operar un día completo usando solo RestaurantOS.

**Tiempo estimado**: 10-12 semanas (1-2 devs full-stack)

## Qué se construye

### 1. Infraestructura base
- Auth/RBAC con NextAuth.js + JWT
- Multi-tenancy: columna `tenant_id` en todas las tablas
- PostgreSQL con Row-Level Security (RLS)
- Redis para cache y sesiones
- Event bus interno (Redis Pub/Sub)
- Schema DB completo para Fases 1-3

### 2. Menú digital público
- Landing page del restaurante (fotos, historia, contacto)
- Menú digital enriquecido (foto, precio, descripción, alérgenos)
- QR único por mesa → abre menú y sabe la mesa automáticamente
- Responsive: funciona en celular del cliente

### 3. Pedido desde mesa
- Cliente escanea QR, ve menú,arma pedido
- Envía pedido a cocina (KDS) y mozo simultáneamente
- Ve estado del pedido en tiempo real (recibido → preparando → listo → servido)

### 4. KDS (Kitchen Display System)
- Pedidos ordenados por hora y prioridad
- Temporizador por plato
- Botón "Listo" que notifica al mozo
- Vista separada para cocina caliente vs. barra
- Registro de timestamps (`pedido_eventos` desde día 1)

### 5. Panel del mozo
- Mapa de mesas (solo sus mesas asignadas)
- Tomar pedidos desde tablet
- Notificación cuando un plato está listo
- Cerrar mesa y cobrar (básico: efectivo/tarjeta)

### 6. Gemelo digital (plano interactivo)
- Plano del restaurante con mesas que cambian de color por estado
- Estados: libre, esperando pedido, en cocina, comiendo, esperando cuenta, reservada, limpieza
- Click en mesa → info detallada (tiempo, consumo, mozo, pedido)
- Zoom, pan, sectores (salón, terraza, barra)

### 7. Cobro básico
- Efectivo y tarjeta (MercadoPago/Stripe)
- Cierre de mesa
- Comprobante simple

### 8. Roles simplificados
- Un solo rol "staff" (combina mozo + cajero) para MVP
- Auth completo listo para expandir a roles en Fase 2

## Qué NO se construye (aparece en fases posteriores)
- Roles granulares (Fase 2)
- Cobro avanzado / propinas / división de cuenta (Fase 2)
- Reservas (Fase 2)
- Stock / inventario (Fase 3)
- CRM / fidelización (Fase 4)
- Marketing (Fase 4)
- RRHH (Fase 5)
- IA (Fase 6)
- Multi-sucursal (Fase 7)

## Dependencias de datos que se crean en esta fase
Estas tablas se crean aquí y son usadas por TODAS las fases posteriores:
- `tenants`, `sucursales`
- `usuarios`, `roles`, `permisos`, `usuario_roles`
- `mesas`, `sectores`
- `productos`, `categorias_menu`
- `recetas`, `receta_ingredientes`
- `pedidos`, `pedido_items`, `pedido_eventos`
- `pagos`

## Criterio de éxito
- [ ] El restaurante piloto opera 2 semanas completas usando solo RestaurantOS
- [ ] El mozo puede tomar un pedido en < 30 segundos
- [ ] El chef ve pedidos ordenados y puede marcar "listo" en 1 click
- [ ] El dueño puede ver el plano interactivo y saber qué pasa en tiempo real
- [ ] No se usa papel para pedidos durante las 2 semanas de prueba

## Validación de calidad
- [ ] Todas las queries filtran por `tenant_id`
- [ ] `pedido_eventos` registra timestamps desde el primer pedido
- [ ] El plano refleja cambios de estado en < 2 segundos
- [ ] El sistema funciona en modo degradado (sin internet, pedidos locales)
