import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------
// BD falsa en memoria (NO toca Supabase). Imita lo que importa para las carreras: cada operación
// cede el turno (como una ida y vuelta a Postgres), `pagos` tiene el índice único
// (pedido_id, referencia) de la migración 0002 y `SELECT … FOR UPDATE` serializa a quienes
// toman el mismo pedido (cola por pedido, como el bloqueo de fila de Postgres).
// ---------------------------------------------------------------
type PagoFila = { id: string; pedidoId: string; referencia: string | null; estado: string; monto: number; propina: number };
type Pedido = { id: string; tenantId: string; mesaId: string | null; estado: string; total: number };
const db = vi.hoisted(() => ({
  pagos: [] as PagoFila[],
  pedidos: new Map<string, Pedido>(),
  eventos: [] as { evento: string; metadata?: unknown }[],
  notificaciones: [] as unknown[],
  seq: 0,
  colas: new Map<string, Promise<void>>(),
}));

const tick = () => new Promise<void>((r) => setImmediate(r));

vi.mock("@/lib/prisma", () => {
  type CrearArgs = { data: { pedidoId: string; referencia?: string | null; monto: number; propina?: number; estado: string } };
  type Log = { pagos: PagoFila[]; eventos: unknown[]; notifs: unknown[]; liberar: (() => void)[] };

  const crearPago = async ({ data }: CrearArgs, log?: Log) => {
    await tick();
    const referencia = data.referencia ?? null;
    if (referencia !== null && db.pagos.some((p) => p.pedidoId === data.pedidoId && p.referencia === referencia)) {
      throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    }
    const fila = { id: "pago-" + ++db.seq, pedidoId: data.pedidoId, referencia, estado: data.estado, monto: Number(data.monto), propina: Number(data.propina ?? 0) };
    db.pagos.push(fila);
    log?.pagos.push(fila);
    return { id: fila.id };
  };

  const findFirst = async ({ where }: { where: { pedidoId: string; referencia?: string } }) => {
    await tick();
    return db.pagos.find((p) => p.pedidoId === where.pedidoId && p.referencia === (where.referencia ?? p.referencia)) ?? null;
  };
  const findMany = async ({ where }: { where: { pedidoId: string; estado?: string } }) => {
    await tick();
    return db.pagos.filter((p) => p.pedidoId === where.pedidoId && (!where.estado || p.estado === where.estado));
  };

  const makeTx = (log: Log) => ({
    // SELECT ... FOR UPDATE: espera su turno para ese pedido y lo suelta al terminar la transacción.
    $queryRaw: async (_strings: TemplateStringsArray, id: string) => {
      const previa = db.colas.get(id) ?? Promise.resolve();
      let soltar!: () => void;
      const mia = new Promise<void>((r) => (soltar = r));
      db.colas.set(id, previa.then(() => mia));
      await previa;
      log.liberar.push(soltar);
      return [{ id }];
    },
    pago: {
      create: (a: CrearArgs) => crearPago(a, log),
      findMany,
      findFirst,
      update: async ({ where, data }: { where: { id: string }; data: { estado?: string } }) => {
        await tick();
        const p = db.pagos.find((x) => x.id === where.id);
        if (p && data.estado) p.estado = data.estado;
        return {};
      },
    },
    pedido: {
      update: async ({ where, data }: { where: { id: string }; data: { estado?: string } }) => {
        await tick();
        const p = db.pedidos.get(where.id);
        if (p && data.estado) p.estado = data.estado;
        return {};
      },
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        await tick();
        return { ...db.pedidos.get(where.id)! };
      },
      count: async () => 0,
    },
    mesa: { update: async () => ({}) },
    pedidoEvento: {
      create: async ({ data }: { data: { evento: string; metadata?: unknown } }) => {
        await tick();
        db.eventos.push(data);
        log.eventos.push(data);
        return {};
      },
    },
    notificacion: {
      create: async ({ data }: { data: unknown }) => {
        db.notificaciones.push(data);
        log.notifs.push(data);
        return {};
      },
    },
  });

  return {
    prisma: {
      pago: { create: (a: CrearArgs) => crearPago(a), findFirst, findMany },
      pedido: {
        findUnique: async ({ where }: { where: { id: string } }) => {
          await tick();
          const p = db.pedidos.get(where.id);
          return p ? { ...p } : null;
        },
      },
      // Transacción de verdad: si algo falla se deshace SOLO lo escrito dentro de ella y se sueltan los bloqueos.
      $transaction: async (fn: (t: ReturnType<typeof makeTx>) => Promise<unknown>) => {
        const log: Log = { pagos: [], eventos: [], notifs: [], liberar: [] };
        try {
          return await fn(makeTx(log));
        } catch (e) {
          db.pagos = db.pagos.filter((p) => !log.pagos.includes(p));
          db.eventos = db.eventos.filter((v) => !log.eventos.includes(v));
          db.notificaciones = db.notificaciones.filter((v) => !log.notifs.includes(v));
          throw e;
        } finally {
          log.liberar.forEach((f) => f());
        }
      },
    },
  };
});

import { registrarPagoPedido } from "@/lib/pedidos/registrar-pago";
import { revertirPagoPedido } from "@/lib/pedidos/revertir-pago";

const args = { pedidoId: "ped-1", monto: 5000, metodo: "qr", referencia: "mp:123" };

beforeEach(() => {
  db.pagos = [];
  db.eventos = [];
  db.notificaciones = [];
  db.colas.clear();
  db.seq = 0;
  db.pedidos.clear();
  db.pedidos.set("ped-1", { id: "ped-1", tenantId: "t-1", mesaId: null, estado: "abierto", total: 5000 });
});

describe("registrarPagoPedido — webhooks simultáneos de MercadoPago", () => {
  it("dos webhooks del mismo pago al mismo tiempo dejan UN solo pago", async () => {
    const [a, b] = await Promise.all([registrarPagoPedido(args), registrarPagoPedido(args)]);
    expect(db.pagos).toHaveLength(1);
    expect(db.eventos.filter((e) => e.evento === "PAGO_COMPLETADO")).toHaveLength(1);
    expect("error" in a || "error" in b).toBe(false);
    const ids = [a, b].map((r) => ("pagoId" in r ? r.pagoId : null));
    expect(ids[0]).toBe(ids[1]);
    expect([a, b].filter((r) => "yaPagado" in r && !r.yaPagado)).toHaveLength(1);
    expect(db.pedidos.get("ped-1")!.estado).toBe("pagado");
  });

  it("diez webhooks simultáneos siguen dejando un solo pago", async () => {
    await Promise.all(Array.from({ length: 10 }, () => registrarPagoPedido(args)));
    expect(db.pagos).toHaveLength(1);
  });

  it("un reintento posterior no crea otro pago ni alerta", async () => {
    await registrarPagoPedido(args);
    const r = await registrarPagoPedido(args);
    expect(db.pagos).toHaveLength(1);
    expect("yaPagado" in r && r.yaPagado).toBe(true);
    expect(db.notificaciones).toHaveLength(0);
  });

  it("pedido inexistente devuelve error y no crea nada", async () => {
    const r = await registrarPagoPedido({ ...args, pedidoId: "no-existe" });
    expect(r).toEqual({ error: "Pedido no encontrado" });
    expect(db.pagos).toHaveLength(0);
  });
});

describe("registrarPagoPedido — dos pagos con DISTINTA referencia (hallazgo ALTA)", () => {
  it("simultáneos: solo el primero salda el pedido; el segundo no lo vuelve a pagar y deja alerta", async () => {
    const [a, b] = await Promise.all([
      registrarPagoPedido({ ...args, referencia: "mp:111" }),
      registrarPagoPedido({ ...args, referencia: "mp:222" }),
    ]);
    expect("error" in a || "error" in b).toBe(false);
    expect(db.pagos.filter((p) => p.estado === "completado")).toHaveLength(1);
    expect(db.eventos.filter((e) => e.evento === "PAGO_COMPLETADO")).toHaveLength(1);
    expect(db.eventos.filter((e) => e.evento === "PAGO_MP_SOBRANTE")).toHaveLength(1);
    expect(db.notificaciones).toHaveLength(1);
  });

  it("un pago aprobado que llega con el pedido ya saldado (por caja) genera alerta y no otro pago", async () => {
    db.pagos.push({ id: "caja-1", pedidoId: "ped-1", referencia: null, estado: "completado", monto: 5000, propina: 0 });
    const r = await registrarPagoPedido(args);
    expect("yaPagado" in r && r.yaPagado).toBe(true);
    expect(db.pagos).toHaveLength(1);
    const ev = db.eventos.find((e) => e.evento === "PAGO_MP_SOBRANTE");
    expect(ev?.metadata).toMatchObject({ referencia: "mp:123", monto: 5000 });
    expect(db.notificaciones).toHaveLength(1);
  });
});

describe("registrarPagoPedido — monto menor al saldo (hallazgo ALTA)", () => {
  it("un pago aprobado por MENOS del saldo no marca el pedido como pagado: queda parcial con alerta", async () => {
    const r = await registrarPagoPedido({ ...args, monto: 2000 });
    expect("error" in r).toBe(false);
    expect(db.pedidos.get("ped-1")!.estado).toBe("abierto");
    expect(db.pagos).toHaveLength(1);
    expect(db.eventos.map((e) => e.evento)).toContain("PAGO_PARCIAL");
    expect(db.eventos.map((e) => e.evento)).not.toContain("PAGO_COMPLETADO");
    expect(db.notificaciones).toHaveLength(1);
  });

  it("el resto del saldo llega después: ahí sí queda pagado", async () => {
    await registrarPagoPedido({ ...args, monto: 2000, referencia: "mp:1" });
    await registrarPagoPedido({ ...args, monto: 3000, referencia: "mp:2" });
    expect(db.pedidos.get("ped-1")!.estado).toBe("pagado");
    expect(db.eventos.filter((e) => e.evento === "PAGO_COMPLETADO")).toHaveLength(1);
  });
});

describe("registrarPagoPedido — pedido cancelado (revisión 2, M1)", () => {
  it("un pago aprobado sobre un pedido CANCELADO no crea pago ni lo reabre: sobrante con alerta", async () => {
    db.pedidos.get("ped-1")!.estado = "cancelado";
    const r = await registrarPagoPedido(args);
    expect("error" in r).toBe(false);
    expect(db.pagos).toHaveLength(0);
    expect(db.pedidos.get("ped-1")!.estado).toBe("cancelado");
    const ev = db.eventos.find((e) => e.evento === "PAGO_MP_SOBRANTE");
    expect(ev?.metadata).toMatchObject({ motivo: "pedido_cancelado", referencia: "mp:123" });
    expect(db.notificaciones).toHaveLength(1);
  });
});

describe("revertirPagoPedido — reembolso o contracargo (B6)", () => {
  it("un pago cobrado y luego reembolsado pasa a «reembolsado», el pedido vuelve a tener saldo y se avisa", async () => {
    await registrarPagoPedido(args);
    expect(db.pedidos.get("ped-1")!.estado).toBe("pagado");
    const r = await revertirPagoPedido({ pedidoId: "ped-1", referencia: "mp:123", motivo: "refunded" });
    expect("error" in r).toBe(false);
    expect(db.pagos[0].estado).toBe("reembolsado");
    expect(db.pedidos.get("ped-1")!.estado).toBe("entregado");
    expect(db.eventos.map((e) => e.evento)).toContain("PAGO_REVERTIDO");
    expect(db.notificaciones).toHaveLength(1);
  });

  it("avisar dos veces el mismo reembolso no duplica nada", async () => {
    await registrarPagoPedido(args);
    await revertirPagoPedido({ pedidoId: "ped-1", referencia: "mp:123", motivo: "refunded" });
    const antes = { eventos: db.eventos.length, notifs: db.notificaciones.length };
    await revertirPagoPedido({ pedidoId: "ped-1", referencia: "mp:123", motivo: "refunded" });
    expect(db.eventos.length).toBe(antes.eventos);
    expect(db.notificaciones.length).toBe(antes.notifs);
  });

  it("reembolso de un pago que nunca registramos: solo alerta, no inventa nada", async () => {
    const r = await revertirPagoPedido({ pedidoId: "ped-1", referencia: "mp:999", motivo: "charged_back" });
    expect("error" in r).toBe(false);
    expect(db.pagos).toHaveLength(0);
    expect(db.notificaciones).toHaveLength(1);
  });
});
