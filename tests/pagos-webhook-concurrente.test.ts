import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------
// BD falsa en memoria (NO toca Supabase). Imita lo que importa para la
// carrera: cada operación cede el turno (como una ida y vuelta a Postgres)
// y `pagos` tiene el índice único (pedido_id, referencia) de la migración
// 0002 (las referencias nulas no chocan, igual que en Postgres).
// ---------------------------------------------------------------
type PagoFila = { id: string; pedidoId: string; referencia: string | null; estado: string; monto: number };
const db = vi.hoisted(() => ({
  pagos: [] as PagoFila[],
  pedidos: new Map<string, { id: string; tenantId: string; mesaId: string | null; estado: string }>(),
  eventos: [] as unknown[],
  seq: 0,
}));

const tick = () => new Promise<void>((r) => setImmediate(r));

vi.mock("@/lib/prisma", () => {
  type CrearArgs = { data: { pedidoId: string; referencia?: string | null; monto: number; estado: string } };
  type Log = { pagos: PagoFila[]; eventos: unknown[] };

  const crearPago = async ({ data }: CrearArgs, log?: Log) => {
    await tick();
    const referencia = data.referencia ?? null;
    if (referencia !== null && db.pagos.some((p) => p.pedidoId === data.pedidoId && p.referencia === referencia)) {
      throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    }
    const fila = { id: "pago-" + ++db.seq, pedidoId: data.pedidoId, referencia, estado: data.estado, monto: data.monto };
    db.pagos.push(fila);
    log?.pagos.push(fila);
    return { id: fila.id };
  };

  const findFirst = async ({ where }: { where: { pedidoId: string; referencia?: string } }) => {
    await tick();
    return db.pagos.find((p) => p.pedidoId === where.pedidoId && p.referencia === (where.referencia ?? p.referencia)) ?? null;
  };

  const makeTx = (log: Log) => ({
    pago: { create: (a: CrearArgs) => crearPago(a, log) },
    pedido: { update: async () => { await tick(); return {}; }, count: async () => 0 },
    mesa: { update: async () => ({}) },
    pedidoEvento: {
      create: async ({ data }: { data: unknown }) => {
        await tick();
        db.eventos.push(data);
        log.eventos.push(data);
        return {};
      },
    },
  });

  return {
    prisma: {
      pago: { create: (a: CrearArgs) => crearPago(a), findFirst },
      pedido: {
        findUnique: async ({ where }: { where: { id: string } }) => {
          await tick();
          const p = db.pedidos.get(where.id);
          return p ? { ...p, pagos: db.pagos.filter((x) => x.pedidoId === p.id && x.estado === "completado") } : null;
        },
      },
      // Transacción de verdad: si algo falla se deshace SOLO lo escrito dentro de ella.
      $transaction: async (fn: (t: ReturnType<typeof makeTx>) => Promise<unknown>) => {
        const log: Log = { pagos: [], eventos: [] };
        try {
          return await fn(makeTx(log));
        } catch (e) {
          db.pagos = db.pagos.filter((p) => !log.pagos.includes(p));
          db.eventos = db.eventos.filter((v) => !log.eventos.includes(v));
          throw e;
        }
      },
    },
  };
});

import { registrarPagoPedido } from "@/lib/pedidos/registrar-pago";

const args = { pedidoId: "ped-1", monto: 5000, metodo: "qr", referencia: "mp:123" };

beforeEach(() => {
  db.pagos = [];
  db.eventos = [];
  db.seq = 0;
  db.pedidos.clear();
  db.pedidos.set("ped-1", { id: "ped-1", tenantId: "t-1", mesaId: null, estado: "abierto" });
});

describe("registrarPagoPedido — webhooks simultáneos de MercadoPago", () => {
  it("dos webhooks del mismo pago al mismo tiempo dejan UN solo pago", async () => {
    const [a, b] = await Promise.all([registrarPagoPedido(args), registrarPagoPedido(args)]);

    expect(db.pagos).toHaveLength(1);
    expect(db.eventos).toHaveLength(1);
    expect("error" in a || "error" in b).toBe(false);
    // Los dos responden con el mismo pago; exactamente uno lo creó.
    const ids = [a, b].map((r) => ("pagoId" in r ? r.pagoId : null));
    expect(ids[0]).toBe(ids[1]);
    expect([a, b].filter((r) => "yaPagado" in r && !r.yaPagado)).toHaveLength(1);
  });

  it("diez webhooks simultáneos siguen dejando un solo pago", async () => {
    await Promise.all(Array.from({ length: 10 }, () => registrarPagoPedido(args)));
    expect(db.pagos).toHaveLength(1);
  });

  it("un reintento posterior no crea otro pago", async () => {
    await registrarPagoPedido(args);
    const r = await registrarPagoPedido(args);
    expect(db.pagos).toHaveLength(1);
    expect("yaPagado" in r && r.yaPagado).toBe(true);
  });

  it("pedido inexistente devuelve error y no crea nada", async () => {
    const r = await registrarPagoPedido({ ...args, pedidoId: "no-existe" });
    expect(r).toEqual({ error: "Pedido no encontrado" });
    expect(db.pagos).toHaveLength(0);
  });
});
