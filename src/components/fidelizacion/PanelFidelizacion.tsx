"use client";

import { useEffect, useState } from "react";

export function PanelFidelizacion() {
  const [tab, setTab] = useState<"recurrentes" | "visita" | "reconocimiento" | "logistica">("recurrentes");
  const [clientes, setClientes] = useState<any[]>([]);
  const [mesas, setMesas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");

  const [mesaId, setMesaId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [personas, setPersonas] = useState("");
  const [monto, setMonto] = useState("");
  const [reconocido, setReconocido] = useState<any>(null);
  const [logistica, setLogistica] = useState<any>(null);

  useEffect(() => {
    fetch("/api/fidelizacion/clientes-recurrentes").then((r) => r.json()).then((d) => setClientes(d.data ?? []));
    fetch("/api/mesas").then((r) => r.json()).then((d) => setMesas(d.data ?? d ?? []));
  }, []);

  async function registrarVisita() {
    if (!mesaId) return setMensaje("Elegí una mesa");
    const res = await fetch("/api/fidelizacion/visitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesaId,
        clienteId: clienteId || undefined,
        personas: personas ? parseInt(personas) : undefined,
        monto: monto ? parseFloat(monto) : undefined,
      }),
    });
    const data = await res.json();
    setMensaje(data.success ? "Visita registrada" + (data.cliente ? ` · ${data.cliente.puntos} pts` : "") : data.error);
    if (res.ok) { setMonto(""); setPersonas(""); }
  }

  async function reconocer() {
    if (!mesaId || !clienteId) return setMensaje("Mesa y cliente requeridos");
    const res = await fetch("/api/fidelizacion/reconocimiento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesaId, clienteId }),
    });
    const data = await res.json();
    if (res.ok) {
      setReconocido(data);
      setMensaje(`Reconocido: ${data.cliente?.nombre}`);
    } else setMensaje(data.error);
  }

  async function cargarLogistica() {
    const res = await fetch("/api/fidelizacion/logistica");
    if (res.ok) setLogistica(await res.json());
  }
  useEffect(() => { if (tab === "logistica") cargarLogistica(); }, [tab]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Fidelización Operativa</h1>
      <p className="text-sm text-gray-500 mb-4">Reconocé al cliente recurrente y anticipá sus gustos en la mesa.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {([
          ["recurrentes", "Clientes"],
          ["visita", "Registrar visita"],
          ["reconocimiento", "Reconocimiento QR"],
          ["logistica", "Logística"],
        ] as [typeof tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === t ? "bg-red-600 text-white" : "bg-white border text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {mensaje && <div className="mb-3 text-sm text-blue-600">{mensaje}</div>}

      {tab === "recurrentes" && (
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-1">Cliente</th><th>Nivel</th><th>Visitas</th><th>Puntos</th><th>Gastado</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-1.5">{c.nombre}</td>
                  <td className="capitalize">{c.nivel}</td>
                  <td>{c.totalVisitas}</td>
                  <td>{c.puntos}</td>
                  <td>${Number(c.totalGastado).toFixed(2)}</td>
                </tr>
              ))}
              {clientes.length === 0 && <tr><td colSpan={5} className="text-gray-500">Sin clientes.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "visita" && (
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 max-w-md space-y-2">
          <select value={mesaId} onChange={(e) => setMesaId(e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            <option value="">Seleccioná mesa…</option>
            {mesas.map((m: any) => <option key={m.id} value={m.id}>{m.numero}{m.sector?.nombre ? ` (${m.sector.nombre})` : ""}</option>)}
          </select>
          <input value={clienteId} onChange={(e) => setClienteId(e.target.value)} placeholder="ID cliente (opcional)" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          <input value={personas} onChange={(e) => setPersonas(e.target.value)} placeholder="Personas" type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          <input value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto $" type="number" step="0.01" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={registrarVisita} className="w-full bg-red-600 text-white rounded-lg py-2 text-sm">Registrar visita</button>
        </div>
      )}

      {tab === "reconocimiento" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 max-w-md space-y-2">
            <select value={mesaId} onChange={(e) => setMesaId(e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-sm">
              <option value="">Seleccioná mesa…</option>
              {mesas.map((m: any) => <option key={m.id} value={m.id}>{m.numero}</option>)}
            </select>
            <input value={clienteId} onChange={(e) => setClienteId(e.target.value)} placeholder="ID cliente" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
            <button onClick={reconocer} className="w-full bg-red-600 text-white rounded-lg py-2 text-sm">Vincular por QR</button>
          </div>
          {reconocido && (
            <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
              <h2 className="font-semibold">{reconocido.cliente?.nombre}</h2>
              <p className="text-xs text-gray-500 mb-2">Nivel {reconocido.cliente?.nivel} · {reconocido.cliente?.puntos} pts · {reconocido.cliente?.totalVisitas} visitas</p>
              {reconocido.cliente?.alergias?.length > 0 && (
                <p className="text-xs text-red-600 mb-2">⚠ Alergias: {reconocido.cliente.alergias.join(", ")}</p>
              )}
              <h3 className="text-sm font-medium mt-2">Suele pedir</h3>
              <ul className="text-sm list-disc ml-5">{reconocido.sugerencias.map((s: any) => <li key={s.productoId}>{s.nombre} ×{s.cantidad}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {tab === "logistica" && (
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          {logistica ? (
            <div className="space-y-2 text-sm">
              <p>Total clientes: <b>{logistica.data.totalClientes}</b></p>
              <p>Cupones activos: <b>{logistica.data.cuponesActivos}</b></p>
              <p>Por nivel: {Object.entries(logistica.data.porNivel).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
              <h3 className="font-medium mt-2">Top puntos</h3>
              <ul className="list-disc ml-5">{logistica.data.topClientes.map((c: any) => <li key={c.id}>{c.nombre} ({c.puntos} pts)</li>)}</ul>
            </div>
          ) : <p className="text-sm text-gray-500">Cargando…</p>}
        </div>
      )}
    </div>
  );
}
