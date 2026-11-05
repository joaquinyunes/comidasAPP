-- WP-10: un mismo cobro externo (p. ej. "mp:123") no puede registrarse dos veces
-- para el mismo pedido. NO aplicada a producción (Supabase comida-app): la aplica
-- el dueño con `npx prisma migrate deploy` tras revisar duplicados existentes:
--   SELECT pedido_id, count(*) FROM pagos GROUP BY 1 HAVING count(*) > 1;
ALTER TABLE "pagos" ADD COLUMN "referencia" VARCHAR(100);
CREATE UNIQUE INDEX "pagos_pedido_id_referencia_key" ON "pagos"("pedido_id", "referencia");
