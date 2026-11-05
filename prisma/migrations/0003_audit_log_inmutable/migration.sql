-- S7: el registro de auditoría solo se puede agregar: ni la app ni un usuario del panel
-- pueden modificarlo o borrarlo. NO aplicada a producción (Supabase comida-app): la aplica
-- el dueño con `npx prisma migrate deploy`.
CREATE OR REPLACE FUNCTION audit_log_solo_agregar() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log es de solo agregar (% bloqueado)', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_sin_update_ni_delete
  BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION audit_log_solo_agregar();
