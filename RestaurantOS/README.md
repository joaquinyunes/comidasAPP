# RestaurantOS

**Sistema Operativo para Restaurantes** — Plataforma SaaS multi-tenant que unifica POS, ERP, CRM, KDS, Reservas, Inventario, Compras, RRHH, Marketing, BI e IA en un solo ecosistema.

## Visión rápida

No es una web de restaurante. Es un **Shopify para restaurantes físicos**: un sistema que cualquier restaurante puede registrar, configurar y operar en pocas horas.

## Para quién es

| Rol | Qué obtiene |
|-----|-------------|
| **Cliente** | Menú enriquecido, pedido por QR, seguimiento en tiempo real, fidelización |
| **Mozo** | Vista de sus mesas, notificaciones, cobro rápido, división de cuentas |
| **Chef** | KDS con pedidos ordenados, temporizador, alertas de alergias |
| **Bartender** | KDS separado solo para bebidas |
| **Cajero** | Cobros múltiples, facturación, arqueo, reembolsos |
| **Gerente** | Vista general del turno, empleados, reportes |
| **Dueño** | Dashboard completo, BI, IA predictiva, multi-sucursal |
| **Limpieza** | Lista de mesas/áreas pendientes |

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14+ + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes + Prisma ORM |
| DB | PostgreSQL + Row-Level Security |
| Realtime | Redis + Socket.io |
| Auth | NextAuth.js + JWT + RBAC |
| Pagos | MercadoPago + Stripe |
| Mobile | Flutter |
| IA | APIs externas (OpenAI/Anthropic) |
| Hosting | Vercel + Railway |

## Cómo está organizado

```
00_Vision/        → Por qué existe el producto
01_Ideacion/      → Brainstorm, funcionalidades, diferenciadores
02_PRD/           → Requisitos, casos de uso, historias de usuario
03_Arquitectura/  → Arquitectura, schema de DB, API, seguridad
04_UI_UX/         → Wireframes, dashboard, flujos
05_Modulos/       → Especificación de cada módulo
06_Roadmap/       → Fases incrementales y micro-fases
```

## Cómo empezar

1. Leer `HANDOFF.md` — documento maestro de transferencia
2. Leer `SYSTEM_PROMPT.md` — contexto para IA
3. Leer `06_Roadmap/MicroFases.md` — plan de ejecución
4. Ejecutar micro-fase 1.1

## Principio rector

No competir por ser "otro POS". Competir por ser el sistema que conecta **todos** los actores del restaurante en una sola fuente de verdad, con un **gemelo digital** como eje visual y **IA predictiva** como diferenciador.

## Monetización

| Plan | Incluye | Público |
|------|---------|---------|
| Básico | Menú digital, reservas, pedidos | Locales chicos |
| Profesional | + KDS, inventario, caja, analíticas | Restaurantes establecidos |
| Premium | + IA, CRM, marketing, multi-sucursal | Cadenas |

Ingresos adicionales: marketplace de proveedores, hardware, módulos IA premium, API, white-label.
