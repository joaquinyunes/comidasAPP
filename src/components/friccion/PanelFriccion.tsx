"use client";

import { useEffect, useState, useCallback } from "react";

interface ColaItem {
  clientId: string;
  ruta: string;
  metodo: string;
  payload: Record<string, unknown>;
}

export function PanelFriccion() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [serverTime, setServerTime] = useState<string>("");
  const [cola, setCola] = useState<ColaItem[]>([]);
  const [mensaje, setMensaje] = useState("");

  const [pedidoId, setPedidoId] = useState("");
  const [itemId, setItemId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [anulaciones, setAnulaciones] = useState<any[]>([]);

  const [comandas, setComandas] = useState<any[]>([]);
  const [ticket, setTicket] = useState("");

  const chequearEstado = useCallback(async () => {
    try {
      const res = await fetch("/api/friccion/estado");
      const data = await res.json();
      setOnline(data.online);
      setServerTime(data.serverTime);
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    chequearEstado();
    const t = setInterval(chequearEstado, 15000);
    return () => clearInterval(t);
  }, [chequearEstado]);

  async function anular() {
    if (!pedidoId || !itemId || !motivo) {
      setMensaje("Completa pedido, ítem y motivo");
      return;
    }
    const payload = { motivo };
    const ruta = `/api/pedidos/${pedidoId}/items/${itemId}/anular`;
    if (!online) {
      const clientId = `off_${Date.now()}`;
      setCola((prev) => [...prev, { clientId, ruta, metodo: "POST", payload }]);
      setMensaje("Sin conexión: anulación encolada para sincronizar.");
      return;
    }
    const res = await fetch(ruta, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMensaje(data.success ? "Ítem anulado" : data.error);
    if (res.ok) {
      setAnulaciones((prev) => [data.anulacion, ...prev]);
      setPedidoId(""); setItemId(""); setMotivo("");
    }
  }

  async function sincronizar() {
    if (cola.length === 0) return;
    const res = await fetch("/api/friccion/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cola }),
    });
    const data = await res.json();
    setMensaje(`Sincronizadas ${data.aplicados}/${data.total} operaciones.`);
    setCola([]);
    chequearEstado();
  }

  async function cargarComandas() {
    const res = await fetch("/api/cocina/comandas");
    if (res.ok) setComandas((await res.json()).data);
  }
  useEffect(() => { cargarComandas(); }, []);

  async function imprimir(id: string) {
    const res = await fetch(`/api/cocina/comandas/${id}/imprimir`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setTicket(data.ticket);
    else setMensaje(data.error);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Reducción de Fricción Física</h1>
        <span className={`px-3 py-1 rounded-full text-sm ${online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {online === null ? "..." : online ? "Online" : "Offline (LAN local)"}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">Anulación trazable, impresión de comandas y operación degradada sin internet.</p>

      {mensaje && <div className="mb-3 text-sm text-blue-600">{mensaje}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <h2 className="font-semibold mb-2">Anulación trazable</h2>
          <div className="space-y-2">
            <input value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} placeholder="ID de pedido" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
            <input value={itemId} onChange={(e) => setItemId(e.target.value)} placeholder="ID de ítem" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (doble confirmación)" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
            <button onClick={anular} className="w-full bg-red-600 text-white rounded-lg py-2 text-sm">Anular ítem</button>
          </div>
          {anulaciones.length > 0 && (
            <ul className="mt-3 text-xs text-gray-600 space-y-1">
              {anulaciones.map((a) => (
                <li key={a.id}>• {a.motivo} — {new Date(a.createdAt).toLocaleTimeString("es-AR")}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <h2 className="font-semibold mb-2">Cola offline (LAN local)</h2>
          <p className="text-xs text-gray-500 mb-2">Si cae internet, las anulaciones se encolan y se vacían al recuperar.</p>
          {cola.length === 0 ? (
            <p className="text-sm text-gray-500">Sin operaciones pendientes.</p>
          ) : (
            <>
              <ul className="text-xs text-gray-600 space-y-1 mb-2">
                {cola.map((c) => <li key={c.clientId}>• {c.ruta}</li>)}
              </ul>
              <button onClick={sincronizar} className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm">Sincronizar cola ({cola.length})</button>
            </>
          )}
          {serverTime && <p className="text-xs text-gray-400 mt-2">Último server: {new Date(serverTime).toLocaleTimeString("es-AR")}</p>}
        </div>

        <div className="md:col-span-2 bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Comandas para imprimir</h2>
            <button onClick={cargarComandas} className="text-sm text-blue-600">Actualizar</button>
          </div>
          <div className="space-y-2">
            {comandas.map((p) => (
              <div key={p.id} className="border rounded-lg p-2 flex items-center justify-between">
                <div className="text-sm">
                  Mesa {p.mesa?.numero ?? "DELIVERY"} — {p.items.length} ítems
                </div>
                <button onClick={() => imprimir(p.id)} className="text-sm bg-gray-800 text-white px-2 py-1 rounded-lg">Imprimir</button>
              </div>
            ))}
            {comandas.length === 0 && <p className="text-sm text-gray-500">Sin comandas pendientes.</p>}
          </div>
          {ticket && (
            <pre className="mt-3 bg-gray-900 text-green-300 text-xs p-3 rounded-lg overflow-auto whitespace-pre-wrap">{ticket}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
