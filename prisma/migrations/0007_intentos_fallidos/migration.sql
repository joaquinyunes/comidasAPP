-- Contadores de intentos fallidos en base de datos (login, 2FA, QR del local): el tope ya no
-- depende de cuántas instancias haya levantadas. Idempotente.
CREATE TABLE IF NOT EXISTS "intentos_fallidos" (
    "clave" VARCHAR(200) NOT NULL,
    "n" INTEGER NOT NULL,
    "desde" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "intentos_fallidos_pkey" PRIMARY KEY ("clave")
);
