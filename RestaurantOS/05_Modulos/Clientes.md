# Módulo: Clientes (Web pública, Menú, Reservas, CRM, Fidelización)

**Depende de**: Menú y Recetas (Fase 1), Salón y Mesas (Fase 1)

## Fases que implementan este módulo
- **Fase 1**: Menú digital público, QR por mesa, perfil básico
- **Fase 2**: Reservas, lista de espera
- **Fase 4**: CRM completo, fidelización, segmentación

## Funcionalidades por fase

### Fase 1 — Menú + QR
- Landing page del restaurante (fotos, historia, contacto, redes)
- Menú digital: foto HD, video, precio, descripción, alérgenos, nivel de picante, tiempo de preparación
- QR único por mesa → abre menú y sabe la mesa automáticamente
- Responsive: funciona en celular del cliente
- Seguimiento de pedido en tiempo real (recibido → preparando → listo → servido)

### Fase 2 — Reservas
- Reserva visual sobre el plano (fecha, hora, cantidad, zona, ocasión)
- Selección de mesa por tipo (interior, terraza, ventana, VIP)
- Confirmación automática por email/WhatsApp
- Recordatorios 24h y 1h antes
- Lista de espera con notificación cuando hay mesa

### Fase 4 — CRM + Fidelización
- Perfil del cliente: historial, favoritos, alergias, dieta, facturas, reservas
- Programa de puntos: acumulación por compra, canje por recompensas
- Niveles: Bronce → Plata → Oro → Diamante (con beneficios crecientes)
- Cupones automáticos: cumpleaños, reactivación de inactivos, bienvenida
- Menú enriquecido: maridajes, productos relacionados, reseñas
- Segmentación: por frecuencia, gasto, preferencias, alergias

## Datos que gestiona
Clientes, preferencias, alergias, historial de consumo, reservas, puntos/canjes, reseñas, favoritos

## Reglas de negocio
1. El QR de cada mesa es único y permanente
2. Un cliente puede tener múltiples reservas activas
3. Los puntos expiran después de X meses (configurable por tenant)
4. Los cupones automáticos tienen límite de uso y vigencia
5. Todo envío de marketing requiere opt-in explícito (RGPD)

## Métricas del módulo
- Tasa de conversión de visita a pedido
- Tasa de repetición de clientes
- Ticket promedio por cliente frecuente
- NPS por reseñas
- % de clientes en cada nivel de fidelización
- Tasa de canje de puntos
