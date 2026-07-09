# Módulo: Cocina (KDS - Kitchen Display System)

**Depende de**: Pedidos (Fase 1), Menú y Recetas (Fase 1), Stock (Fase 3)

## Fases que implementan este módulo
- **Fase 1**: KDS básico con pedidos ordenados, temporizador, botón "Listo"
- **Fase 2**: Bitácora de tiempos completa, estadísticas
- **Fase 3**: Validación de stock antes de aceptar, descuento automático

## Funcionalidades por fase

### Fase 1 — KDS básico
- Pedidos ordenados por prioridad y hora de llegada
- Agrupados por mesa/sector
- Temporizador visible por plato con alerta visual si se acerca al límite
- Botón "Listo" que notifica automáticamente al mozo
- Vista separada para Bartender (solo bebidas, sin ver cocina caliente)
- Observaciones del cliente resaltadas (sin sal, sin gluten, alergias)

### Fase 2 — Analytics de cocina
- Registro de timestamps en `pedido_eventos` (ya viene de Fase 1)
- Tiempo promedio de preparación por plato y por chef
- Tasa de pedidos demorados (> umbral configurable)
- Detección de cuellos de botella

### Fase 3 — Integración con stock
- Validación: si stock no alcanza, alerta **antes** de aceptar el pedido
- Descuento automático de ingredientes al marcar "listo"
- Alerta al mozo si un ingrediente se agota durante la preparación

## Datos que gestiona
Pedidos en curso, recetas, tiempos por etapa (bitácora), stock consumido

## Reglas de negocio
1. Un pedido no puede marcarse "listo" sin haber pasado por "en preparación"
2. Si el stock no alcanza, se alerta antes de aceptar el pedido
3. Cada cambio de estado registra timestamp + usuario en `pedido_eventos`
4. Las alergias siempre se muestran en rojo y no se pueden ignorar

## Métricas del módulo
- Tiempo promedio de preparación por plato
- Tiempo promedio por chef
- Tasa de pedidos demorados
- Mermas detectadas por cocina
- Pedidos cancelados por falta de stock
