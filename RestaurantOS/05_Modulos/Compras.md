# Módulo: Compras

**Depende de**: Stock / Inventario (Fase 3)

## Fases que implementan este módulo
- **Fase 3**: Catálogo de proveedores, órdenes de compra, recepción, comparación de precios
- **Fase 6**: Marketplace de proveedores

## Funcionalidades

### Catálogo de proveedores
- Cada proveedor: nombre, contacto, catálogo de productos, precios, tiempos de entrega
- Historial de calidad y cumplimiento
- Comparación de precios entre proveedores para el mismo ingrediente

### Sugerencia automática de compra
- Cuando stock cruza umbral mínimo → genera sugerencia
- Sugerencia incluye: ingrediente, cantidad sugerida, proveedor más conveniente
- Gerente revisa, modifica y aprueba (o rechaza)

### Órdenes de compra
- Generación manual o automática
- Envío al proveedor por email/WhatsApp
- Estados: borrador → enviada → confirmada → recibida → completada
- Requiere confirmación humana antes de enviarse (salvo auto-aprobación bajo monto)

### Recepción de mercadería
- Gerente confirma recepción de mercadería
- Stock se actualiza automáticamente
- Registro de discrepancias (pedido vs. recibido)
- Trazabilidad: cada recepción vinculada a orden de compra

### Comparación de precios
- Historial de precios por proveedor
- Alerta si un proveedor sube precios
- Sugerencia de alternativa más económica

## Datos que gestiona
Proveedores, órdenes de compra, precios históricos, tiempos de entrega, recepciones

## Reglas de negocio
1. Toda orden de compra requiere confirmación humana antes de enviarse
2. El historial de precios alimenta la IA de sugerencia (Fase 6)
3. La recepción actualiza stock automáticamente
4. Las discrepancias se registran para auditoría

## Métricas del módulo
- Tiempo promedio de entrega por proveedor
- Ahorro por comparación de precios
- Frecuencia de quiebres de stock evitados
- Índice de cumplimiento por proveedor
