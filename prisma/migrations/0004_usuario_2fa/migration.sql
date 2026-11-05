-- S4: segundo factor (TOTP) opcional por usuario. NO aplicada a producción
-- (Supabase comida-app): la aplica el dueño con `npx prisma migrate deploy`.
ALTER TABLE "usuarios" ADD COLUMN "totp_secreto" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "totp_activo" BOOLEAN NOT NULL DEFAULT false;
