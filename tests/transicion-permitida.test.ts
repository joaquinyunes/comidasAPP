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

import { puedeTransicionarPedido } from "@/lib/pedidos/transicion-permitida";

describe("puedeTransicionarPedido (revisión 2, M6 y B9)", () => {
  const admin = permisosDe("rol-admin");
  const mozo = permisosDe("rol-mozo");
  it("un pedido pagado o cancelado no cambia de estado, ni siquiera un admin", () => {
    for (const actual of ["pagado", "cancelado"]) {
      for (const nuevo of ["en_preparacion", "listo", "entregado", "cerrado", "cancelado", undefined]) {
        expect(puedeTransicionarPedido({ actual, nuevo, total: 100, permisos: admin }), `${actual} → ${nuevo}`).toMatchObject({ ok: false, status: 409 });
      }
    }
  });
  it("un pedido abierto sigue las reglas de siempre", () => {
    expect(puedeTransicionarPedido({ actual: "recibido", nuevo: "listo", total: 100, permisos: mozo })).toEqual({ ok: true });
    expect(puedeTransicionarPedido({ actual: "recibido", nuevo: "cancelado", total: 100, permisos: mozo })).toMatchObject({ ok: false, status: 403 });
    expect(puedeTransicionarPedido({ actual: "recibido", nuevo: "pagado", total: 100, permisos: admin })).toMatchObject({ ok: false, status: 409 });
  });
  it("B9: un pedido en 0 (cupón del 100%) puede pasar a «pagado»: no hay nada que cobrar", () => {
    expect(puedeTransicionarPedido({ actual: "entregado", nuevo: "pagado", total: 0, permisos: mozo })).toEqual({ ok: true });
  });
});
