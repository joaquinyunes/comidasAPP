# Dashboard — RestaurantOS

## Dashboard del Dueño (Desktop)

### Layout: 3 columnas

```
┌──────────┬──────────────────────┬──────────┐
│ Sidebar  │     Contenido        │ Alertas  │
│          │                      │          │
│ 🗺️ Mapa  │  [Widget Grid]       │ 🔔 3     │
│ 📊 BI    │                      │ 📦 2     │
│ 📦 Stock │                      │ ⚠️ 1     │
│ 👥 CRM   │                      │          │
│ 🍽️ Pedidos│                     │          │
│ 💰 Caja  │                      │          │
│ 👤 Empleados│                   │          │
│ ⚙️ Config │                     │          │
└──────────┴──────────────────────┴──────────┘
```

### Widgets del Dashboard principal

| Widget | Datos | Actualización |
|--------|-------|---------------|
| Ventas del día | Monto total, comparación con ayer | Tiempo real |
| Ventas del mes | Gráfico de tendencia | Diario |
| Ticket promedio | Monto, tendencia | Tiempo real |
| Mesas ocupadas | X/Y, porcentaje | Tiempo real |
| Pedidos en cocina | Cantidad, tiempo promedio | Tiempo real |
| Stock crítico | Ingredientes por debajo del mínimo | Cada 5 min |
| Clientes hoy | Nuevos vs. recurrentes | Diario |
| Top platos | Los 5 más vendidos hoy | Tiempo real |
| Horas pico | Gráfico de ocupación por hora | Cada hora |
| Empleados activos |turno actual | Tiempo real |

### Gráficos

1. **Ventas por hora** (barras): identifica horas pico
2. **Ventas por día** (línea): tendencia semanal/mensual
3. **Top 10 platos** (barras horizontales): qué se vende más
4. **Ventas por categoría** (torta): pizzas, pastas, bebidas, postres
5. **Ocupación por zona** (barras): salón, terraza, barra
6. **Ticket promedio por día** (línea): tendencia de gasto
7. **Comparativa con semana anterior** (barras dobles)

### Gemelo digital (widget principal)
- Plano interactivo del restaurante
- Mesas cambian de color por estado
- Click en mesa → info detallada
- Zoom, pan, sectores

---

## Dashboard del Gerente (Desktop)

Más enfocado en operativa diaria:
- Turnos del día
- Reservas del día
- Pedidos activos
- Incidencias
- Stock crítico

---

## Dashboard del Cliente (Celular)

- Historial de pedidos
- Puntos acumulados
- Nivel actual
- Cupones disponibles
- Reservas activas
- Favoritos
- Perfil

---

## Dashboard del Empleado (Tablet)

- Mis turnos
- Mis mesas (mozo)
- Mis pedidos (chef)
- Mensajes del gerente
- Capacitaciones pendientes
