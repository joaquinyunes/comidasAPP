# Arquitectura de Software

## Patrón: Monolito Modular con Bounded Contexts

**No empezar con microservicios.** Monolito bien modularizado, evolucionable a microservicios cuando la escala lo justifique.

### Por qué no microservicios desde el inicio
- Complejidad operativa innecesaria para equipo chico
- La mayoría de los módulos comparten transacciones fuertemente acopladas
- Un monolito permite iterar mucho más rápido en etapas tempranas

### Cuándo separar en servicios independientes
- **IA/ML**: distinto ciclo de despliegue, distinta carga de cómputo
- **Notificaciones**: alto volumen, puede escalar independiente
- **BI/Reporting pesado**: consultas analíticas no deben afectar tráfico transaccional

---

## Bounded Contexts

```
┌─────────────────────────────────────────────────────────┐
│                    RESTAURANTOS                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Identidad   │  │   Salón y    │  │  Pedidos y   │  │
│  │  y Accesos   │  │    Mesas     │  │   Cocina     │  │
│  │              │  │  (Gemelo)    │  │    (KDS)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐  │
│  │   Menú y     │  │  Inventario  │  │   Caja y     │  │
│  │  Recetas     │  │  y Compras   │  │   Pagos      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  CRM y       │  │  Marketing   │  │    RRHH      │  │
│  │ Fidelización │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ BI/Analítica │  │      IA      │                    │
│  │              │  │ (Fase 6+)    │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Descripción de cada contexto

| Contexto | Responsabilidad | Fase |
|----------|-----------------|------|
| Identidad y Accesos | Usuarios, roles, permisos, auth, multi-tenancy | 1 |
| Salón y Mesas | Plano interactivo, estados, gemelo digital | 1 |
| Pedidos y Cocina | Toma de pedidos, KDS, bitácora de tiempos | 1 |
| Menú y Recetas | Productos, categorías, recetas, ingredientes | 1 |
| Inventario y Compras | Stock, proveedores, órdenes de compra | 3 |
| Caja y Pagos | Cobros, facturación, propinas, arqueo | 1-2 |
| CRM y Fidelización | Perfiles de clientes, puntos, niveles | 4 |
| Marketing | Campañas, segmentación, cupones | 4 |
| RRHH | Empleados, turnos, asistencia, portal | 5 |
| BI/Analítica | Dashboards, reportes, KPIs | 5 |
| IA | Predicciones, recomendaciones, alertas | 6 |

---

## Patrones de diseño

### Por módulo
- **Repository Pattern**: aislar lógica de persistencia de la lógica de negocio
- **Clean/Hexagonal Architecture**: lógica de negocio no depende de frameworks
- **CQRS** (solo en BI/Dashboard): modelo de escritura ≠ modelo de lectura

### Entre contextos
- **Event-Driven** interno: comunicación via bus de eventos (Redis Pub/Sub en etapas tempranas)
- Ejemplo: "PedidoListo" → notifica al mozo + descuento de stock + actualiza plano

### Ejemplo de flujo de eventos

```
Cliente pide →
  [PedidoCreado] →
    KDS recibe y ordena
    Mozo recibe notificación
    Stock valida disponibilidad

Chef marca "Listo" →
  [PedidoListo] →
    Mozo recibe notificación push
    Stock descuenta ingredientes
    Plano actualiza estado de mesa
    Bitácora registra timestamp

Mozo cobra →
  [PagoRegistrado] →
    Mesa pasa a "limpieza"
    CRM registra compra del cliente
    Dashboard actualiza ventas del día
    Analytics registra para BI
```

---

## Multi-tenancy

### Estrategia: Columna `tenant_id` + PostgreSQL RLS

```sql
-- Ejemplo de RLS policy
CREATE POLICY tenant_isolation ON pedidos
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Reglas
1. **Toda tabla operativa** tiene columna `tenant_id`
2. **Toda query** filtra por `tenant_id` (protegido por RLS)
3. **Ninguna función** puede acceder a datos de otro tenant
4. **Migraciones** se ejecutan una sola vez (no por tenant)
5. **Excepción**: tablas de sistema (`tenants`, `planes`, `config_global`) no tienen `tenant_id`

### Migración futura
Para tenants Enterprise que exijan aislamiento físico:
- Migrar a **Base de datos por tenant** (Opción A del documento de DB)
- Mantener la misma lógica de aplicación, solo cambiar la conexión

---

## Tiempo real

### Tecnología: Socket.io sobre Redis

| Evento | Emisor | Receptor | Datos |
|--------|--------|----------|-------|
| `mesa:estado_cambiado` | Cualquier módulo | Gemelo digital | mesa_id, estado anterior, estado nuevo |
| `pedido:nuevo` | Cliente/Mozo | KDS, Mozo | pedido_id, mesa, items |
| `pedido:listo` | KDS | Mozo | pedido_id, items listos |
| `stock:critico` | Inventario | Dueño, Gerente | ingrediente_id, stock_actual |
| `reserva:confirmada` | Reservas | Dueño, Recepción | reserva_id, fecha, hora |
| `alerta:ia` | IA | Dueño, Gerente | tipo_alerta, datos |

### Latencia objetivo
- Estado de mesas: < 2 segundos
- Notificación de pedido listo: < 1 segundo
- Dashboard: < 3 segundos

---

## Offline-first

### Estrategia
1. **Service Worker** en el frontend para cachear UI estática
2. **IndexedDB** para cola de pedidos locales
3. **Background Sync**: cuando vuelve internet, sincronizar cola
4. **Conflictos**: último write wins + registro de conflicto en `pedido_eventos`

### Operaciones que funcionan offline
- Tomar pedidos (se almacenan localmente)
- Marcar pedidos como "listo" en KDS
- Cobrar (registro local, sincroniza después)

### Operaciones que requieren internet
- Pago con tarjeta (pasarela externa)
- Notificaciones WhatsApp/email
- IA / analytics en tiempo real

---

## Infraestructura

### Desarrollo
- Docker Compose: PostgreSQL + Redis + App
- Hot reload en desarrollo

### Producción (Fase 1-3)
- Frontend: Vercel
- Backend: Railway o Render
- DB: Railway (PostgreSQL)
- Redis: Railway

### Producción (Fase 4+)
- Frontend: Vercel
- Backend: AWS ECS o GCP Cloud Run
- DB: AWS RDS o Cloud SQL (PostgreSQL)
- Redis: AWS ElastiCache o Redis Cloud
- CDN: CloudFront o Cloudflare

### CI/CD
- GitHub Actions
- Lint → Test → Build → Deploy
- Deploy automático a Vercel (frontend)
- Deploy automático a Railway/Render (backend)
