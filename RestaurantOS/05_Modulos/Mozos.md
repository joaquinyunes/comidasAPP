# Módulo: Mozos (Salón, Mesas, Cobro)

**Depende de**: Salón y Mesas (Fase 1), Pedidos (Fase 1), Caja (Fase 1-2)

## Fases que implementan este módulo
- **Fase 1**: Mapa de mesas, tomar pedido, cobro básico
- **Fase 2**: Roles separados, cobro avanzado, división de cuenta, propinas

## Funcionalidades por fase

### Fase 1 — Operativa básica
- Mapa de mesas propias (gemelo digital filtrado por mozo asignado)
- Tomar pedidos desde tablet con menú compacto
- Notificación push cuando cocina/barra terminan un pedido
- Cerrar mesa y cobrar (básico: efectivo/tarjeta)
- Historial de mesas atendidas en el turno

### Fase 2 — Cobro avanzado y roles
- Roles separados: Mozo, Chef, Bartender, Cajero (con permisos propios)
- División de cuenta: por items, por personas, partes iguales
- Propinas: configuración de reparto (mozo, cocina, mixto)
- Solicitud rápida a cocina/barra ("urgente", "cliente con apuro")
- Reasignación automática o manual si un mozo se satura

## Datos que gestiona
Asignación mozo ↔ mesa, estado de atención, propinas registradas

## Reglas de negocio
1. Un mozo solo ve sus mesas asignadas (RBAC/ABAC)
2. El Gerente/Dueño ven todas las mesas
3. Una mesa no puede pasar a "limpieza" sin pago registrado
4. La reasignación automática se activa cuando el mozo tiene > X mesas activas

## Métricas del módulo
- Tiempo promedio de atención por mozo
- Mesas atendidas por turno
- Propinas promedio
- Ticket promedio por mozo
- Satisfacción reportada por clientes
