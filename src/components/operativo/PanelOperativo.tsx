"use client";

import { useEffect, useState, useCallback } from "react";

const colorMap: Record<string, string> = {
  verde: "bg-green-100 text-green-700",
  amarillo: "bg-yellow-100 text-yellow-700",
  rojo: "bg-red-100 text-red-700",
};

export function PanelOperativo() {
  const [tab, setTab] = useState<"alertas" | "comandas" | "stock" | "voz">("alertas");
  const [alertas, setAlertas] = useState<any[]>([]);
  const [comandas, setComandas] = useState<Record<string, any[]>>({});
  const [quiebres, setQuiebres] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");

  const cargarAlertas = useCallback(async () => {
    const res = await fetch("/api/operativo/alertas");
    if (res.ok) setAlertas((await res.json()).data);
  }, []);

  const cargarComandas = useCallback(async () => {
    const res = await fetch("/api/operativo/comandas-estructuradas");
    if (res.ok) {
      const d = await res.json();
      setComandas(d.data);
    }
  }, []);

  const cargarStock = useCallback(async () => {
    const res = await fetch("/api/operativo/stock-tiempo-real");
    if (res.ok) setQuiebres((await res.json()).data);
  }, []);

  useEffect(() => {
    if (tab === "alertas") { cargarAlertas(); const t = setInterval(cargarAlertas, 10000); return () => clearInterval(t); }
    if (tab === "comandas") { cargarComandas(); const t = setInterval(cargarComandas, 10000); return () => clearInterval(t); }
    if (tab === "stock") { cargarStock(); const t = setInterval(cargarStock, 15000); return () => clearInterval(t); }
  }, [tab, cargarAlertas, cargarComandas, cargarStock]);

  async function pasar(pedidoId: string, itemId: string) {
    const res = await fetch("/api/operativo/pase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId, itemId }),
    });
    const data = await res.json();
    setMensaje(data.success ? "Pase confirmado" : data.error);
    if (res.ok) cargarAlertas();
  }

  async function confirmarVoz(pedidoId: string) {
    const res = await fetch("/api/operativo/confirmacion-voz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId, texto: "Pedido confirmado por voz" }),
    });
    const data = await res.json();
    setMensaje(data.success ? "Confirmación de voz registrada" : data.error);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Comunicación Cocina-Mozos</h1>
      <p className="text-sm text-gray-500 mb-4">La comanda viaja sola, avisa al listo y el pase se ve a simple vista.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {([
          ["alertas", "Alertas activas"],
          ["comandas", "Comandas estructuradas"],
          ["stock", "Stock tiempo real"],
          ["voz", "Confirmación voz"],
        ] as [typeof tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === t ? "bg-red-600 text-white" : "bg-white border text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {mensaje && <div className="mb-3 text-sm text-blue-600">{mensaje}</div>}

      {tab === "alertas" && (
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <h2 className="font-semibold mb-2">Semáforo de pase</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-1">Mesa</th><th>Producto</th><th>Estación</th><th>Espera</th><th></th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a) => (
                <tr key={a.itemId} className="border-b">
                  <td className="py-1.5">{a.mesa}</td>
                  <td>{a.producto}</td>
                  <td>{a.estacion ?? "-"}</td>
                  <td><span className={`px-2 py-0.5 rounded-full text-xs ${colorMap[a.color]}`}>{a.minutosEspera != null ? `${a.minutosEspera} min` : a.estado}</span></td>
                  <td><button onClick={() => pasar(a.pedidoId, a.itemId)} className="text-sm bg-green-600 text-white px-2 py-1 rounded-lg">Pasar</button></td>
                </tr>
              ))}
              {alertas.length === 0 && <tr><td colSpan={5} className="text-gray-500">Sin alertas activas.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "comandas" && (
        <div className="space-y-3">
          {Object.entries(comandas).map(([est, items]) => (
            <div key={est} className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
              <h3 className="font-semibold text-sm mb-2 capitalize">{est.replace("_", " ")} ({items.length})</h3>
              <ul className="text-sm space-y-1">
                {items.map((it, i) => (
                  <li key={i} className="border-b py-1 flex justify-between">
                    <span>Mesa {it.mesa} — {it.producto} ×{it.cantidad}{it.notas ? ` (${it.notas})` : ""}</span>
                    <span className="text-xs text-gray-500">{it.estado}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {Object.keys(comandas).length === 0 && <p className="text-sm text-gray-500">Sin comandas en cocina.</p>}
        </div>
      )}

      {tab === "stock" && (
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <h2 className="font-semibold mb-2">Quiebres de stock</h2>
          <table className="w-full text-sm">
            <tbody>
              {quiebres.map((q) => (
                <tr key={q.ingredienteId} className="border-b">
                  <td className="py-1.5">{q.nombre}</td>
                  <td className="text-red-600">{q.cantidadActual} {q.unidad}</td>
                  <td className="text-gray-400">mín {q.stockMinimo}</td>
                </tr>
              ))}
              {quiebres.length === 0 && <tr><td className="text-gray-500">Sin quiebres.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "voz" && <ConfirmacionVoz onConfirmar={confirmarVoz} />}
    </div>
  );
}

function ConfirmacionVoz({ onConfirmar }: { onConfirmar: (pedidoId: string) => void }) {
  const [pedidoId, setPedidoId] = useState("");
  return (
    <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 max-w-md space-y-2">
      <p className="text-sm text-gray-500">Confirmá el pedido por voz antes de enviarlo a cocina.</p>
      <input value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} placeholder="ID de pedido" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
      <button disabled={!pedidoId} onClick={() => onConfirmar(pedidoId)} className="w-full bg-red-600 text-white rounded-lg py-2 text-sm disabled:opacity-50">
        Confirmar por voz
      </button>
    </div>
  );
}
