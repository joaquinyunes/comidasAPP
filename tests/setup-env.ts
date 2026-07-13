// Setup de entorno para tests sin base de datos real.
// Se ejecuta ANTES que tests/setup.ts y antes de que se importe Prisma,
// para poder construir el PrismaClient aunque no haya conexión (no se hacen queries reales).
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://test_user:test_pass@localhost:5432/restaurantos_test?schema=public";
}
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-testing-min-32-chars-xxxx";
(process.env as Record<string, string>).NODE_ENV = process.env.NODE_ENV || "test";
