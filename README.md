# Cozizina — sitio + panel para un restaurante

Sistema completo para un restaurante: sitio público con carta y reservas,
pedido desde la mesa por QR, y panel de gestión (cocina, pedidos, caja,
reservas, mesas).

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4,
  Prisma 7 + PostgreSQL.
- **Auth:** JWT propio en cookie httpOnly, con roles y permisos.
- **Tiempo real:** los paneles se refrescan por polling (no requiere
  servidor de sockets aparte).

## Requisitos

- Node.js 20+
- PostgreSQL 16 (local, o un servicio como Neon / Supabase / RDS)

## Puesta en marcha (local)

```bash
cp .env.example .env      # y completá DATABASE_URL y JWT_SECRET
npm install
npm run db:push           # crea las tablas
npm run db:seed           # datos de demo (menú, mesas, usuarios)
npm run dev
```

Abrí http://localhost:3000

- Sitio público: `/`
- Panel: `/dashboard` (te redirige a `/login`)
- Pedido desde la mesa: `/cliente/<id-de-mesa>` (los QR se imprimen desde
  `/dashboard/mesas`)

### Usuarios de demo

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@cozizina.com` | `admin123` |
| Gerente | `gerente@cozizina.com` | `admin123` |
| Mozo | `mozo@cozizina.com` | `admin123` |
| Cocina | `cocina@cozizina.com` | `admin123` |
| Caja | `caja@cozizina.com` | `admin123` |

Cada rol ve solo las secciones que le corresponden.

## Puesta en marcha (Docker)

```bash
docker compose up
```

Levanta Postgres + la app, corre `db:push` y `db:seed`, y sirve en
http://localhost:3000

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a Postgres. |
| `JWT_SECRET` | Secreto para firmar la sesión. Generá uno real (mín. 32 chars). |
| `NEXT_PUBLIC_APP_URL` | URL pública (para los links de los QR de mesa). |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` |

## Comandos

```bash
npm run dev          # desarrollo
npm run build        # build de producción
npm run start        # servir el build
npm run lint         # análisis estático
npm run typecheck    # tsc --noEmit
npm run test         # tests (vitest)
npm run db:push      # sincronizar el esquema con la BD
npm run db:seed      # cargar datos de demo
npm run db:studio    # explorar la BD (Prisma Studio)
```

## Estructura

```
src/
  app/
    (público)         page.tsx, menu, reservar, ordenar, nosotros, ubicaciones…
    cliente/[mesaId]  pedido desde la mesa
    dashboard/        panel de gestión
    api/              endpoints
  components/
    landing/          sitio público (estética Cozizina)
    cliente/          pedido desde la mesa
    cocina-tablero/   KDS
    pedidos-panel/    pedidos + cobro
    reservas-panel/   reservas
    caja-resumen/     arqueo de caja
    mesas-qr/         generación de QR
    dashboard/        navegación y sesión
  lib/
    pedidos/          lógica de negocio de pedidos (estados, precio, stock…)
    reservas/         estados de reservas
prisma/
  schema.prisma       modelo de datos
  seed.ts             datos de demo
```

## Despliegue

Cualquier plataforma que corra Next.js (Vercel, Fly, Railway, un VPS con
Docker). Necesita una base Postgres accesible y las variables de entorno.
Antes del primer arranque: `npm run db:push` (y `npm run db:seed` si querés
los datos de demo).
