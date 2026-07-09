# Fase 6 — IA + Marketplace

**Objetivo**: Diferenciarse con inteligencia artificial y crear una fuente de ingresos adicional.

**Tiempo estimado**: 8-10 semanas

**Dependencia**: Fases 1-5 completadas (6+ meses de datos operativos)

## Por que la IA va despues de tener datos

La IA depende de historial real de ventas, tiempos y stock. Construirla antes de tener ese historial produce predicciones pobres.

## Sub-fases de IA

### 6.1 Analitica descriptiva (ya empezada en Fase 5)
Dashboards de lo que ya paso. Valida que los datos se estan capturando correctamente.

### 6.2 Prediccion de demanda y stock
- Modelo que usa historial de ventas + estacionalidad + clima
- Sugiere cuanto preparar/comprar antes del horario pico
- Explicabilidad: el dueño debe entender por que la IA sugiere algo

### 6.3 Deteccion de anomalias operativas
- Cuellos de botella (mesa/pedido demorado vs. su promedio historico)
- Stock con consumo anomalo (posible merma o error)
- Alertas inteligentes configurables

### 6.4 Recomendaciones al cliente
- Maridajes y upselling segun historial de compra
- Menu personalizado (orden de platos recomendados)
- Requiere CRM maduro (Fase 4)

### 6.5 Asistentes conversacionales
- Chatbot de atencion al cliente (reservas, menu, horarios)
- Asistente de texto para duenio ("como van las ventas hoy?")

## Marketplace de proveedores
- Proveedores publican catalogo dentro de la plataforma
- Restaurantes comparan precios y hacen pedidos
- Comision por transaccion (modelo de negocio)
- Resenas y calificaciones de proveedores

## Consideraciones tecnicas
- Empezar con reglas heuristicas simples antes de ML complejo
- Mantener explicabilidad en toda sugerencia
- Todo modelo debe poder desactivarse por tenant
- Costo de IA: modelar por restaurante/mes (las llamadas a modelos no son gratis)

## Criterio de exito
- [ ] La IA sugiere compras basadas en historial + estacionalidad
- [ ] Se detectan cuellos de botella en tiempo real
- [ ] El menu muestra recomendaciones personalizadas
- [ ] El marketplace tiene al menos 5 proveedores activos
- [ ] El dueño puede preguntar por ventas y obtener respuesta
