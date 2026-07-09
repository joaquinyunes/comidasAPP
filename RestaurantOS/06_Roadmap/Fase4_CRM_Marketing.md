# Fase 4 — CRM + Marketing

**Objetivo**: Retener clientes y aumentar frecuencia y ticket promedio.

**Tiempo estimado**: 5-7 semanas

**Dependencia**: Fases 1-3 completadas (pedidos, pagos, stock con datos operativos)

## Que se construye

### 1. Perfil del cliente
- Registro y perfil: nombre, email, telefono, fecha_nacimiento
- Historial de pedidos y gasto total
- Preferencias y favoritos
- Alergias y dieta
- Nivel de fidelizacion actual

### 2. Programa de puntos
- Acumulacion por compra (configurable: X puntos por $)
- Canje por recompensas (descuento, postre gratis, bebida)
- Niveles: Bronce, Plata, Oro, Diamante
- Cada nivel tiene beneficios crecientes
- Historial de movimientos de puntos

### 3. Cupones y promociones
- Cupon de bienvenida (al registrarse)
- Cupon de cumpleaños (automatico)
- Cupon de reactivacion (si no visita en X dias)
- Cupones manuales (gerente crea y distribuye)
- Limite de uso y vigencia configurable

### 4. Menu enriquecido
- Video por plato
- Calorias, proteinas, grasas, carbohidratos
- Maridajes sugeridos
- Productos relacionados
- Resenas y ratings por plato

### 5. Marketing basico
- Campanas por email (transaccionales + promocionales)
- Segmentacion de clientes (por frecuencia, gasto, nivel)
- Metricas de campana (apertura, clics, conversion)

### 6. RGPD
- Opt-in explicito para marketing
- Derecho al borrado (anonimizar historial)
- Registro de consentimientos

## Tablas nuevas
- `clientes` (ya definida en schema)
- `cliente_favoritos`
- `puntos_historial`
- `cupones`
- `campanas`
- `campana_envios`
- `consentimientos`

## Criterio de exito
- [ ] Cada cliente tiene perfil con historial y preferencias
- [ ] Los puntos se acumulan y canjean automaticamente
- [ ] Los cupones de cumpleaños se envian automaticamente
- [ ] El gerente puede crear y enviar campanas basicas
- [ ] El menu muestra maridajes y productos relacionados
