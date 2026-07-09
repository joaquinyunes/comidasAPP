# Fase 5 — RRHH + Analytics

**Objetivo**: Gestionar el equipo y tomar decisiones basadas en datos.

**Tiempo estimado**: 6-8 semanas

**Dependencia**: Fases 1-4 completadas (auth, pedidos, pagos, CRM con historial)

## Que se construye

### 1. Modulo RRHH
- ABM de empleados vinculados a usuarios
- Turnos: creacion, asignacion, solicitud de cambios
- Asistencia: registro de entrada/salida, cruce con turnos
- Vacaciones: solicitud y aprobacion
- Portal del empleado: ver turnos, solicitar, capacitaciones, anuncios

### 2. Analytics / BI
- Dashboard de ventas: por hora, dia, semana, mes
- Top productos vendidos
- Horas pico de ocupacion
- Ticket promedio tendencia
- Comparativa con periodos anteriores
- Exportacion a PDF/Excel

### 3. Analytics por entidad
- Por plato: vendidos, margen, rotacion
- Por mozo: mesas atendidas, tiempo promedio, propinas
- Por chef: tiempo de preparacion, pedidos completados
- Por mesa: facturacion, ocupacion, ticket promedio
- Por sucursal: comparativa (si multi-sucursal)

### 4. Bitacora completa
- Tiempos de cada pedido (ya viene desde Fase 1)
- Vista consolidada: tiempo promedio por etapa
- Deteccion de pedidos demorados (> umbral)
- Alertas en dashboard

### 5. Deteccion de anomalias (heuristica)
- Pedidos que tardan mas de 2x el promedio
- Mesa sin atencion por mas de X minutos
- Stock con consumo anomalo
- Caja abierta fuera de horario

### 6. Gamificacion basica
- Ranking de mozos (mesas, tiempo, propinas)
- Ranking de chefs (tiempo, pedidos)
- Insignias por logros (opcional)

## Tablas nuevas
- `empleados`, `turnos`, `asistencia`, `vacaciones`
- `analytics_snapshots` (para dashboards pre-calculados)
- `alertas`
- `gamificacion_logros`

## Criterio de exito
- [ ] El gerente ve dashboards de ventas actualizados en tiempo real
- [ ] Los empleados pueden ver sus turnos y solicitar cambios
- [ ] Se detectan automaticamente pedidos demorados
- [ ] El dueño puede comparar rendimiento entre mozos/chefs
- [ ] Los reportes se exportan a PDF/Excel
