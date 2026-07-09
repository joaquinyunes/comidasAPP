# Módulo: Caja / Pagos

**Depende de**: Pedidos (Fase 1), Salón y Mesas (Fase 1)

## Fases que implementan este módulo
- **Fase 1**: Cobro básico (efectivo/tarjeta), cierre de mesa
- **Fase 2**: Cobro completo, propinas, arqueo, facturación, reembolsos

## Funcionalidades por fase

### Fase 1 — Cobro básico
- Cobro por efectivo y tarjeta (MercadoPago/Stripe)
- Cierre de mesa
- Comprobante simple

### Fase 2 — Caja completa
- Cobro por múltiples medios (efectivo, tarjeta crédito/débito, QR, transferencia)
- Propinas: registro y reparto configurable
- Apertura y cierre de caja con arqueo (diferencia entre esperado y contado)
- Reembolsos con motivo obligatorio y autorización por rol
- Facturación electrónica automática (integración AFCA/ARCA)
- Conciliación con pasarelas de pago
- División de cuenta (por items, personas, partes iguales)

## Datos que gestiona
Pagos, facturas, propinas, movimientos de caja, arqueos

## Reglas de negocio
1. Ninguna mesa pasa a "limpieza" sin pago registrado (o anulación con autorización)
2. Los reembolsos requieren rol con permiso explícito
3. El arqueo se registra con timestamp y usuario
4. La facturación electrónica se genera automáticamente al cerrar cuenta
5. Todo pago queda registrado en auditoría

## Métricas del módulo
- Ticket promedio
- Distribución de medios de pago
- Diferencias de arqueo por turno/cajero
- Total de propinas por turno
- Volumen de reembolsos
