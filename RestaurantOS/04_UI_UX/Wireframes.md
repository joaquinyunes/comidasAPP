# Wireframes — RestaurantOS

## Principios de diseño
1. **Manos ocupadas**: botones grandes, gestos simples, mínimo typing
2. **Ambiente ruidoso**: alertas sonoras + visuales, alto contraste
3. **Alta rotación**: onboarding progresivo, sistema autoexplicativo
4. **Modo oscuro**: obligatorio en cocina y áreas con poca luz

---

## 1. Menú digital (Cliente - Celular)

```
┌─────────────────────────┐
│ 🍕 Pizzería La Nonna    │
│ ⭐ 4.8 (324 reseñas)   │
├─────────────────────────┐
│ [Fotos] [Menú] [Reservar]│
├─────────────────────────┤
│ 🔍 Buscar plato...      │
├─────────────────────────┤
│ PIZZAS                   │
│ ┌─────┐ Pizza Napolitana│
│ │ 📷  │ $12.500         │
│ │     │ ⭐ 4.9 · 🔥      │
│ └─────┘ 15 min          │
│ Gluten, Lactosa          │
│ Combina con: Coca, Papas │
│ [+ Agregar]              │
├─────────────────────────┤
│ ENSALADAS                │
│ ...                      │
└─────────────────────────┘
```

## 2. Gemelo digital (Dueño - Desktop/Tablet)

```
┌──────────────────────────────────────────┐
│ Dashboard    │  Gemelo Digital    │ Alertas│
├──────────────┴───────────────────┴───────┤
│                                          │
│           ENTRADA                        │
│     🪑1🟡    🪑2🟢    🪑3🔴            │
│                                          │
│  ───────── PASILLO ─────────             │
│                                          │
│     🪑4🔵    🪑5🟣    🪑6🟢            │
│                                          │
│  🍷 Barra          👨‍🍳 Cocina            │
│                                          │
├──────────────────────────────────────────┤
│ 💰 Ventas: $845.000   │  👥 48/72 mesas │
│ ⏱️ Ticket: $42.000    │  🍽️ 21 pedidos  │
│ 📦 Stock crítico: 2    │  ⚠️ Mesa 5 lenta │
└──────────────────────────────────────────┘
```

## 3. KDS Cocina (Chef - Tablet/Pantalla grande)

```
┌──────────────────────────────────────────┐
│ COCINA CALIENTE           ⏰ 20:45       │
├──────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐        │
│ │ MESA 5      │  │ MESA 2      │        │
│ │ 2 Milanesas │  │ 1 Pizza     │        │
│ │ 1 Ensalada  │  │ 2 Cervezas  │        │
│ │ ⏱️ 12 min   │  │ ⏱️ 5 min    │        │
│ │ [Listo ✅]  │  │ [Listo ✅]  │        │
│ └─────────────┘  └─────────────┘        │
├──────────────────────────────────────────┤
│ BARRA                      ⏰ 20:45      │
│ ┌─────────────┐                         │
│ │ MESA 8      │                         │
│ │ 3 Tragos    │                         │
│ │ ⏱️ 3 min    │                         │
│ └─────────────┘                         │
└──────────────────────────────────────────┘
```

## 4. Panel del Mozo (Tablet)

```
┌──────────────────────────────────────────┐
│ Mis Mesas (4 activas)        │ 🔔 2 nuevos│
├──────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ │ M1 │ │ M2 │ │ M5 │ │ M8 │            │
│ │ 🟡 │ │ 🔵 │ │ 🟣 │ │ 🟢 │            │
│ │ 3p │ │ 2p │ │ 4p │ │ 2p │            │
│ └────┘ └────┘ └────┘ └────┘            │
├──────────────────────────────────────────┤
│ Mesa 5 — Comiendo (45 min)              │
│ 👤 Carlos                                 │
│ 🍕 2 Milanesas, 1 Ensalada              │
│ 💰 $38.000                               │
│ [Ver pedido] [Cobrar] [Pedir cuenta]    │
└──────────────────────────────────────────┘
```

## 5. Cobro (Mozo/Cajero - Tablet)

```
┌──────────────────────────────────────────┐
│ Mesa 5 — Cerrar cuenta                   │
├──────────────────────────────────────────┤
│ 2 Milanesas         $24.000             │
│ 1 Ensalada          $8.000              │
│ 2 Cervezas          $6.000              │
├──────────────────────────────────────────┤
│ Subtotal            $38.000             │
│ Propina (10%)       $3.800              │
│ TOTAL               $41.800             │
├──────────────────────────────────────────┤
│ Dividir: [Por items] [Por partes] [Igual]│
├──────────────────────────────────────────┤
│ Pagar: [Efectivo] [Tarjeta] [QR]        │
│                                          │
│        [ CONFIRMAR PAGO ]                │
└──────────────────────────────────────────┘
```

## 6. Reserva (Cliente - Celular)

```
┌──────────────────────────────────────────┐
│ Reservar mesa                             │
├──────────────────────────────────────────┤
│ Fecha: [📅 15 Jul 2026]                 │
│ Hora:  [🕐 21:00]                        │
│ Personas: [👤 4]                         │
│ Zona: ( Interior | Terraza | Ventana )   │
│                                          │
│ ┌──────────────────────────┐             │
│ │   Mapa de mesas           │             │
│ │   M5 🟢  M6 ⚫  M7 🟢   │             │
│ │   (haz clic para elegir) │             │
│ └──────────────────────────┘             │
│                                          │
│ Ocasión: [Cumpleaños 🎂]                │
│ Notas: [Decoración especial...]          │
│                                          │
│      [ CONFIRMAR RESERVA ]               │
└──────────────────────────────────────────┘
```
