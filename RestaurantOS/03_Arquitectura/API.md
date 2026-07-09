# API — RestaurantOS

**Estilo**: REST + WebSocket (Socket.io)
**Auth**: JWT Bearer token en header `Authorization: Bearer <token>`
**Multi-tenancy**: Header `X-Tenant-ID` o token JWT con tenant claim

---

## Convenciones

- Todas las respuestas: `{ data: T, error?: string, meta?: object }`
- Paginación: `?page=1&limit=20` → `{ data: [], meta: { page, limit, total, pages } }`
- Filtros: `?estado=activo&fecha_desde=2026-01-01`
- Errores: `{ error: { code: "STOCK_INSUFICIENTE", message: "..." } }`
- Timestamps en ISO 8601 UTC

---

## Endpoints por módulo

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con email/password |
| POST | `/api/auth/refresh` | Refrescar token |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario actual |

### Tenants (solo Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tenants` | Listar tenants |
| POST | `/api/tenants` | Crear tenant |
| PUT | `/api/tenants/:id` | Actualizar tenant |

### Sucursales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sucursales` | Listar sucursales del tenant |
| POST | `/api/sucursales` | Crear sucursal |
| PUT | `/api/sucursales/:id` | Actualizar sucursal |

### Mesas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mesas` | Listar mesas (filtrar por sucursal) |
| GET | `/api/mesas/:id` | Detalle de mesa |
| POST | `/api/mesas` | Crear mesa |
| PUT | `/api/mesas/:id` | Actualizar mesa |
| PUT | `/api/mesas/:id/estado` | Cambiar estado de mesa |
| GET | `/api/mesas/plano` | Obtener plano con estados |

### Menú / Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categorias` | Listar categorías |
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Detalle de producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| GET | `/api/productos/publico` | Menú público (sin auth) |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pedidos` | Listar pedidos |
| GET | `/api/pedidos/:id` | Detalle de pedido |
| POST | `/api/pedidos` | Crear pedido |
| PUT | `/api/pedidos/:id/estado` | Cambiar estado del pedido |
| PUT | `/api/pedidos/:id/items/:itemId/estado` | Cambiar estado de item |
| GET | `/api/pedidos/:id/timeline` | Bitácora de eventos |

### Reservas (Fase 2)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reservas` | Listar reservas |
| POST | `/api/reservas` | Crear reserva |
| PUT | `/api/reservas/:id/estado` | Confirmar/cancelar |
| GET | `/api/reservas/disponibilidad` | Verificar disponibilidad |

### Stock (Fase 3)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ingredientes` | Listar ingredientes |
| GET | `/api/stock` | Ver stock por sucursal |
| POST | `/api/stock/movimiento` | Registrar movimiento |
| GET | `/api/stock/alertas` | Ingredientes con stock bajo |
| GET | `/api/stock/historial` | Historial de movimientos |

### Compras (Fase 3)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proveedores` | Listar proveedores |
| POST | `/api/proveedores` | Crear proveedor |
| GET | `/api/ordenes-compra` | Listar órdenes |
| POST | `/api/ordenes-compra` | Crear orden |
| PUT | `/api/ordenes-compra/:id/estado` | Cambiar estado |
| POST | `/api/ordenes-compra/:id/recepcion` | Registrar recepción |

### Caja

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cajas` | Listar cajas |
| POST | `/api/cajas` | Abrir caja |
| PUT | `/api/cajas/:id/cerrar` | Cerrar caja con arqueo |
| GET | `/api/pagos` | Listar pagos |
| POST | `/api/pagos` | Registrar pago |

### Clientes (Fase 4)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes/:id` | Perfil del cliente |
| PUT | `/api/clientes/:id` | Actualizar perfil |
| GET | `/api/clientes/:id/historial` | Historial de pedidos |
| GET | `/api/clientes/:id/puntos` | Saldo de puntos |

### Marketing (Fase 4)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/campanas` | Listar campañas |
| POST | `/api/campanas` | Crear campaña |
| POST | `/api/campanas/:id/enviar` | Enviar campaña |
| GET | `/api/cupones` | Listar cupones |
| POST | `/api/cupones` | Crear cupón |

### RRHH (Fase 5)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/empleados` | Listar empleados |
| GET | `/api/turnos` | Listar turnos |
| POST | `/api/turnos` | Crear turno |
| GET | `/api/asistencia` | Listar asistencia |
| POST | `/api/asistencia/check-in` | Registrar entrada |

### Dashboard / Analytics

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/resumen` | KPIs del día |
| GET | `/api/dashboard/ventas` | Ventas por período |
| GET | `/api/dashboard/top-productos` | Top productos vendidos |
| GET | `/api/dashboard/horas-pico` | Ocupación por hora |
| GET | `/api/dashboard/mesas` | Estadísticas de mesas |

---

## WebSocket Events

| Evento | Dirección | Datos |
|--------|-----------|-------|
| `mesa:estado_cambiado` | Server → Client | mesa_id, estado |
| `pedido:nuevo` | Server → Client | pedido completo |
| `pedido:item_listo` | Server → Client | pedido_id, item_id |
| `stock:critico` | Server → Client | ingrediente, stock |
| `notificacion:nueva` | Server → Client | notificacion |

### Conexión

```javascript
const socket = io('wss://api.restaurantos.com', {
  auth: { token: 'jwt_token', tenantId: 'uuid' }
});

socket.on('pedido:nuevo', (pedido) => { /* ... */ });
socket.on('pedido:item_listo', (data) => { /* ... */ });
```
