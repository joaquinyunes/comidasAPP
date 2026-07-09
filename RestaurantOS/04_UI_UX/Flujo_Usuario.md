# Flujos de Usuario — RestaurantOS

## Flujo 1: Cliente pide desde mesa

```
Escanea QR
    │
    ▼
Abre menú (sabe la mesa)
    │
    ▼
Navega menú ──→ Ve fotos, ingredientes, alérgenos
    │
    ▼
Agrega items al pedido
    │
    ▼
Envía pedido
    │
    ├──→ KDS recibe pedido
    ├──→ Mozo recibe notificación
    └──→ Stock valida disponibilidad
    │
    ▼
Ve estado en tiempo real
    │
    ├── Recibido ✓
    ├── Preparando ✓
    ├── Listo ✓
    └── Servido ✓
    │
    ▼
Pide la cuenta (botón en la app)
    │
    ▼
Paga (efectivo/tarjeta/QR)
    │
    ▼
Puede dejar reseña ⭐
```

## Flujo 2: Chef procesa pedido

```
Pedido aparece en KDS
    │
    ▼
Chef selecciona "En preparación"
    │
    ▼
Prepara el plato
    │
    ▼
Marca "Listo"
    │
    ├──→ Mozo recibe notificación push
    ├──→ Stock descuenta ingredientes (Fase 3)
    ├──→ Bitácora registra timestamp
    └──→ Plano actualiza estado de mesa
```

## Flujo 3: Mozo cobra

```
Cliente pide la cuenta
    │
    ▼
Mozo selecciona mesa en el mapa
    │
    ▼
Ve resumen del pedido y total
    │
    ▼
¿Dividir cuenta?
    │
    ├── Sí → Elige modo (items/personas/igual)
    │         └── Sistema calcula montos
    │
    └── No → Total único
    │
    ▼
Cliente paga
    │
    ├── Efectivo → Registrar monto
    ├── Tarjeta → Procesar con pasarela
    └── QR → Mostrar QR de cobro
    │
    ▼
Pago registrado
    │
    ├──→ Mesa pasa a "limpieza"
    ├──→ CRM registra compra del cliente
    ├──→ Dashboard actualiza ventas
    └──→ Analytics registra para BI
```

## Flujo 4: Reserva

```
Cliente selecciona fecha y hora
    │
    ▼
Sistema muestra disponibilidad
    │
    ▼
Cliente elige zona (interior/terraza/ventana)
    │
    ▼
Selecciona mesa disponible
    │
    ▼
Indica cantidad de personas y ocasión (opcional)
    │
    ▼
Confirma reserva
    │
    ├──→ Reserva creada en el sistema
    ├──→ Confirmación por email/WhatsApp
    ├──→ Mesa aparece como "reservada" en el plano
    └──→ Recordatorio 24h antes
    └──→ Recordatorio 1h antes
```

## Flujo 5: Descuento automático de stock (Fase 3)

```
Chef marca "Listo" un plato
    │
    ▼
Sistema identifica receta del producto
    │
    ▼
Por cada ingrediente de la receta:
    │
    ├── Descuenta cantidad del stock
    ├── Registra movimiento en stock_movimientos
    └── ¿Stock < mínimo?
         │
         ├── Sí → Alerta al gerente
         └── No → OK
```

## Flujo 6: Sugerencia de compra (Fase 3)

```
Sistema detecta stock bajo
    │
    ▼
Genera sugerencia de compra
    │
    ├── Ingrediente
    ├── Cantidad sugerida
    └── Proveedor más conveniente
    │
    ▼
Gerente revisa
    │
    ├── Aprueba → Crea orden de compra
    ├── Modifica → Ajusta cantidad/proveedor
    └── Rechaza → Descarta sugerencia
    │
    ▼
Orden enviada al proveedor
    │
    ▼
Proveedor confirma entrega
    │
    ▼
Gerente recibe mercadería
    │
    ▼
Stock se actualiza automáticamente
```
