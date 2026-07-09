# PRD — RestaurantOS

**Documento maestro de requisitos del producto.**

## 1. Resumen ejecutivo

RestaurantOS es una plataforma SaaS multi-tenant que unifica sitio web, POS, ERP, CRM, KDS, reservas, inventario, compras, RRHH, marketing, BI e IA para restaurantes.

## 2. Alcance por fase

### Fase 1 — Fundación + Operativa Básica

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | El sistema debe reflejar el estado de cada mesa en tiempo real (< 2s) | Alta |
| RF-02 | Todo pedido registra timestamps de cada etapa | Alta |
| RF-03 | QR único por mesa que abre menú y permite pedir | Alta |
| RF-04 | KDS muestra pedidos ordenados por hora y prioridad | Alta |
| RF-05 | El mozo puede cerrar mesa y cobrar (efectivo/tarjeta) | Alta |
| RF-06 | Gemelo digital interactivo con estados de mesa | Alta |
| RF-07 | Multi-tenancy con aislamiento por RLS | Alta |
| RF-08 | Modo degradado ante caída de internet | Alta |
| RF-09 | Auditoría de acciones sensibles | Alta |
| RF-10 | Roles básicos (staff) con auth JWT | Alta |

### Fase 2 — POS Completo + Reservas

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-11 | Roles granulares: Mozo, Chef, Bartender, Cajero, Gerente, Dueño | Alta |
| RF-12 | División de cuenta (por items, personas, partes iguales) | Alta |
| RF-13 | Propinas con reparto configurable | Alta |
| RF-14 | Apertura/cierre de caja con arqueo | Alta |
| RF-15 | Reserva visual sobre plano | Alta |
| RF-16 | Confirmación y recordatorios por WhatsApp/email | Alta |
| RF-17 | Lista de espera con notificación automática | Media |
| RF-18 | Facturación electrónica | Alta |
| RF-19 | Bitácora de tiempos con reportes | Media |

### Fase 3 — Stock + Inventario + Compras

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-20 | Descuento automático de stock al confirmar preparación | Alta |
| RF-21 | Validación de stock antes de aceptar pedido | Alta |
| RF-22 | Alertas de stock crítico y vencimientos | Alta |
| RF-23 | Catálogo de proveedores con precios | Alta |
| RF-24 | Sugerencia automática de compra | Media |
| RF-25 | Recepción de mercadería con actualización de stock | Alta |
| RF-26 | Costo automático por plato (margen, rentabilidad) | Alta |
| RF-27 | Detección de mermas | Media |

### Fase 4 — CRM + Marketing

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-28 | Perfil de cliente con historial y preferencias | Alta |
| RF-29 | Programa de puntos y niveles (Bronce/Plata/Oro/Diamante) | Alta |
| RF-30 | Cupones automáticos (cumpleaños, reactivación) | Alta |
| RF-31 | Campañas por email, WhatsApp, SMS, push | Media |
| RF-32 | Segmentación de clientes | Media |
| RF-33 | Menú digital enriquecido (video, calorías, maridajes) | Alta |
| RF-34 | Cumplimiento RGPD (opt-in, derecho al borrado) | Alta |

### Fase 5 — RRHH + Analytics

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-35 | Gestión de empleados, turnos, asistencia | Alta |
| RF-36 | Portal del empleado (horario, recibos, vacaciones) | Media |
| RF-37 | Dashboards de ventas, ocupación, ticket promedio | Alta |
| RF-38 | Analytics por plato, mozo, chef, mesa | Alta |
| RF-39 | Detección de anomalías (heurísticas) | Media |

### Fase 6 — IA + Marketplace

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-40 | Predicción de demanda por día/hora | Media |
| RF-41 | Recomendaciones personalizadas al cliente | Media |
| RF-42 | Marketplace de proveedores | Baja |
| RF-43 | Alertas inteligentes (stock, demanda, anomalías) | Media |

### Fase 7 — Multi-sucursal

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-44 | Control central de recetas/precios/promociones | Alta |
| RF-45 | Comparativas de rendimiento entre sucursales | Alta |
| RF-46 | Transferencia de stock entre sucursales | Media |
| RF-47 | Autonomía configurable por sucursal | Media |

### Fase 8 — Enterprise

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-48 | White-label completo | Baja |
| RF-49 | API pública para integraciones | Baja |
| RF-50 | Aislamiento físico de DB por tenant | Baja |
| RF-51 | SLA de disponibilidad y soporte diferenciado | Baja |

## 3. Requisitos no funcionales

| Categoría | Requisito | Target |
|-----------|-----------|--------|
| Disponibilidad | Módulos críticos (pedidos, caja, cocina) | 99.9% |
| Rendimiento | Tiempo de respuesta lectura | < 300ms |
| Rendimiento | Estado de mesas en tiempo real | < 2s |
| Seguridad | OWASP Top 10 | Cumplimiento |
| Seguridad | Cifrado en tránsito y reposo | TLS 1.3 + AES-256 |
| Escalabilidad | Miles de tenants sin degradación cruzada | Sí |
| Privacidad | RGPD: acceso, rectificación, borrado | Cumplimiento |
| Offline | Operaciones críticas sin internet | Funcional |

## 4. Modelo de negocio

| Plan | Precio estimado | Incluye |
|------|-----------------|---------|
| Básico | $29-49/mes | Menú digital, reservas, pedidos, 1 sucursal |
| Profesional | $99-149/mes | + KDS, inventario, caja, analytics, 3 sucursales |
| Premium | $249-399/mes | + IA, CRM, marketing, multi-sucursal ilimitada |

## 5. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Adopción del personal | Alto | UX simple, onboarding guiado, 5 min para aprender |
| Conectividad | Alto | Modo offline, cache local, sync posterior |
| Costo de hardware | Medio | Opción BYOD (traer tu device), tablets genéricas |
| Rotación de personal | Medio | Sistema autoexplicativo, poco training necesario |
| IA sin datos suficientes | Bajo | Empezar con reglas heurísticas, ML después |
