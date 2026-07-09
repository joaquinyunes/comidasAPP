# Fase 7 — Multi-sucursal / Franquicias

**Objetivo**: Escalar de un solo local a multiples sucursales con control central.

**Tiempo estimado**: 5-7 semanas

**Dependencia**: Todas las fases anteriores estables en un solo tenant

## Que se construye

### 1. Control central (casa central)
- Vista consolidada de todas las sucursales
- Control de recetas estandar (precios, ingredientes, preparacion)
- Promociones centralizadas o por sucursal
- Configuracion de menus por sucursal

### 2. Comparativas de rendimiento
- Ranking de sucursales por ventas, ticket, ocupacion
- Comparativa de metricas entre locales
- Deteccion de souscales con bajo rendimiento
- Analisis de tendencias por zona/geografia

### 3. Transferencia de stock
- Movimiento de ingredientes entre sucursales
- Registro y auditoria de transferencias
- Stock consolidado visible desde casa central

### 4. Autonomia configurable
- Cada sucursal puede tener reglas propias (horarios, promociones)
- Permisos por sucursal (que gerente de local solo vea su local)
- Configuracion de que campos pueden modificar las sucursales vs. solo casa central

### 5. BI multi-sucursal
- Dashboard consolidado
- Reportes por sucursal exportables
- Alertas centralizadas (stock critico en cualquier local)

## Consideraciones tecnicas
- Multi-tenancy ya funciona (cada sucursal es una entrada en tabla sucursales)
- La complejidad es de logica de negocio, no de infraestructura
- Las queries de comparativa necesitan cruzar sucursales del mismo tenant

## Criterio de exito
- [ ] El duenio ve todas sus sucursales en un solo dashboard
- [ ] Se puede comparar rendimiento entre locales
- [ ] Las recetas estandar se propagan desde casa central
- [ ] Se pueden transferir stock entre sucursales con registro
- [ ] Cada gerente solo ve datos de su sucursal
