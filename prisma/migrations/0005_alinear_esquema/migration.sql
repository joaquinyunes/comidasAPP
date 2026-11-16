-- Alinea una base creada SOLO con migraciones con prisma/schema.prisma.
-- La migración 0001 nació antes de: datos de entrega del pedido, costo de envío por zona,
-- medidas del producto, datos de contacto de la reserva y la tabla de recuperación de clave.
-- Producción (Supabase `comida-app`) se creó con `db push` y ya tiene todo esto: por eso cada
-- sentencia es idempotente (IF NOT EXISTS) y puede correr sin efecto sobre una base ya alineada.
-- Hallado con scripts/prueba-local/despliegue-de-cero.mts (una base nueva no tenía `pedidos.costo_envio`).

ALTER TABLE "pedidos"
  ADD COLUMN IF NOT EXISTS "costo_envio" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "direccion_entrega" TEXT,
  ADD COLUMN IF NOT EXISTS "telefono_contacto" VARCHAR(50);

ALTER TABLE "productos"
  ADD COLUMN IF NOT EXISTS "incluye" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "peso_gr" INTEGER,
  ADD COLUMN IF NOT EXISTS "tamano_cm" INTEGER;

ALTER TABLE "reservas"
  ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "nombre_cliente" TEXT,
  ADD COLUMN IF NOT EXISTS "telefono" VARCHAR(50);

ALTER TABLE "zonas_reparto"
  ADD COLUMN IF NOT EXISTS "costo_envio" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "password_resets" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "password_resets_usuario_id_idx" ON "password_resets"("usuario_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'password_resets_usuario_id_fkey') THEN
    ALTER TABLE "password_resets"
      ADD CONSTRAINT "password_resets_usuario_id_fkey"
      FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
