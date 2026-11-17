import { describe, it, expect } from "vitest";
import { transicionPermitida } from "@/lib/pedidos/transicion-permitida";
import { ROLES_BASE } from "../prisma/roles-base";

const permisosDe = (id: string) => [...ROLES_BASE.find((r) => r.id === id)!.permisos];

describe("transiciones de estado del pedido", () => {
  it("«pagado» no se puede forzar por PUT, ni siquiera siendo admin", () => {
    expect(transicionPermitida("pagado", permisosDe("rol-admin"))).toMatchObject({ ok: false, status: 409 });
  });
  it("mozo y cocinero no cancelan ni cierran; cajero, gerente y admin sí", () => {
    for (const e of ["cancelado", "cerrado"]) {
      expect(transicionPermitida(e, permisosDe("rol-mozo"))).toMatchObject({ ok: false, status: 403 });
      expect(transicionPermitida(e, permisosDe("rol-cocinero"))).toMatchObject({ ok: false, status: 403 });
      for (const r of ["rol-cajero", "rol-gerente", "rol-admin"]) expect(transicionPermitida(e, permisosDe(r))).toEqual({ ok: true });
    }
  });
  it("los estados de trabajo (preparación, listo, entregado) quedan libres", () => {
    for (const e of ["en_preparacion", "listo", "entregado", undefined]) expect(transicionPermitida(e, permisosDe("rol-mozo"))).toEqual({ ok: true });
  });
});
