"use client";

import { useEffect, useRef, useState } from "react";

interface ItemMenu { id: string; nombre: string; descripcion: string | null; precio: number; alergenos: string[]; nivelPicante: number; tiempoMin: number | null; }
interface Cat { categoria: string; items: ItemMenu[]; }

export default function PanelAutoCliente({ mesaId }: { mesaId: string }) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [estado, setEstado] = useState<any>(null);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    fetch(`/api/cliente/menu?mesaId=${mesaId}`).then((r) => r.json()).then((d) => setCats(d.data ?? []));
  }, [mesaId]);

  useEffect(() => {
    if (!pedidoId) return;
    const i = setInterval(async () => {
      const d = await (await fetch(`/api/cliente/pedido/${pedidoId}/estado`)).json();
      setEstado(d.data ?? null);
    }, 5000);
    return () => clearInterval(i);
  }, [pedidoId]);

  function cambiar(id: string, delta: number) {
    setCart((c) => {
      const n = (c[id] ?? 0) + delta;
      if (n <= 0) { const { [id]: _, ...rest } = c; return rest; }
      return { ...c, [id]: n };
    });
  }

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  async function enviar() {
    const items = Object.entries(cart).map(([productoId, cantidad]) => ({ productoId, cantidad }));
    if (items.length === 0) return;
    const res = await fetch("/api/cliente/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesaId, items }),
    });
    const d = await res.json();
    if (d.data?.pedidoId) {
      setPedidoId(d.data.pedidoId);
      setMsg(d.data.mensaje);
      setCart({});
    } else {
      setMsg(d.error ?? "No se pudo enviar");
    }
  }

  if (pedidoId) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Tu pedido</h1>
        <p className="text-zinc-600 mb-2">{estado?.mensaje}</p>
        <div className="my-4 h-3 w-full rounded bg-zinc-100">
          <div className="h-3 rounded bg-green-500 transition-all" style={{ width: `${estado?.progreso ?? 0}%` }} />
        </div>
        <p className="text-sm text-zinc-500">{estado?.sinApurar}</p>
        <button onClick={() => { setPedidoId(null); setEstado(null); }} className="mt-4 rounded bg-zinc-900 px-4 py-2 text-white text-sm">Hacer otro pedido</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-bold mb-1">Menú de la mesa</h1>
      <p className="text-sm text-zinc-500 mb-4">Elegí solo lo posible. Pedí cuando quieras.</p>
      {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}
      {cats.map((c) => (
        <div key={c.categoria} className="mb-5">
          <h2 className="font-semibold mb-2">{c.categoria}</h2>
          <div className="space-y-2">
            {c.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded border border-zinc-200 p-3">
                <div>
                  <div className="font-medium">{it.nombre} {it.nivelPicante > 0 && "🌶️".repeat(Math.min(it.nivelPicante, 3))}</div>
                  <div className="text-xs text-zinc-500">{it.descripcion ?? ""}</div>
                  {it.alergenos.length > 0 && <div className="text-xs text-red-500">Alérgenos: {it.alergenos.join(", ")}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">${it.precio}</span>
                  <button onClick={() => cambiar(it.id, -1)} className="h-7 w-7 rounded bg-zinc-100">−</button>
                  <span className="w-5 text-center text-sm">{cart[it.id] ?? 0}</span>
                  <button onClick={() => cambiar(it.id, 1)} className="h-7 w-7 rounded bg-zinc-100">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={enviar} disabled={totalItems === 0} className="sticky bottom-0 w-full rounded bg-green-600 py-3 text-white font-semibold disabled:opacity-40">
        Enviar pedido ({totalItems})
      </button>
    </div>
  );
}
