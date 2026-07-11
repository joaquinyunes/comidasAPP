"use client";

import { useEffect, useState } from "react";

type Tab = "dashboard" | "recetas" | "stock" | "comparativas" | "config";

export function ControlCentral() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Control Multi-sucursal</h1>
      <p className="text-sm text-gray-500 mb-4">Visión centralizada sin perder autonomía de stock por local.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {([
          ["dashboard", "Dashboard"],
          ["recetas", "Recetas centralizadas"],
          ["stock", "Stock por sucursal"],
          ["comparativas", "Comparativas"],
          ["config", "Configuración"],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === t ? "bg-red-600 text-white" : "bg-white border text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "recetas" && <RecetasTab />}
      {tab === "stock" && <StockTab />}
      {tab === "comparativas" && <ComparativasTab />}
      {tab === "config" && <ConfigTab />}
    </div>
  );
}

function DashboardTab() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/multisucursal/dashboard").then((r) => r.json()).then(setData);
  }, []);
  if (!data) return <p className="text-sm text-gray-500">Cargando…</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Sucursales" value={data.resumen.sucursales} />
        <Stat label="Ventas totales" value={`$${data.resumen.totalVentas}`} />
        <Stat label="Pedidos" value={data.resumen.totalPedidos} />
        <Stat label="Ticket promedio" value={`$${data.resumen.ticketPromedioGlobal}`} />
      </div>
      <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-1">Sucursal</th><th>Ventas</th><th>Pedidos</th><th>Ticket</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((s: any) => (
              <tr key={s.sucursalId} className="border-b">
                <td className="py-1.5">{s.nombre}{!s.activa && " (inactiva)"}</td>
                <td>${s.ventas}</td><td>{s.pedidos}</td><td>${s.ticketPromedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecetasTab() {
  const [recetas, setRecetas] = useState<any[]>([]);
  const [productoId, setProductoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  useEffect(() => { cargar(); }, []);
  async function cargar() {
    const res = await fetch("/api/multisucursal/recetas");
    if (res.ok) setRecetas((await res.json()).data);
  }
  async function crear(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/multisucursal/recetas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId, nombre, ingredientes: [] }),
    });
    const data = await res.json();
    setMensaje(data.success ? "Receta creada" : data.error);
    if (res.ok) { setProductoId(""); setNombre(""); cargar(); }
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
        <h2 className="font-semibold mb-2">Catálogo centralizado ({recetas.length})</h2>
        <ul className="text-sm space-y-1">
          {recetas.map((r) => (
            <li key={r.id} className="border-b py-1">{r.producto?.nombre ?? r.nombre} — {r.recetaIngredientes.length} ingredientes</li>
          ))}
          {recetas.length === 0 && <li className="text-gray-500">Sin recetas.</li>}
        </ul>
      </div>
      <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
        <h2 className="font-semibold mb-2">Nueva receta</h2>
        <form onSubmit={crear} className="space-y-2">
          <input value={productoId} onChange={(e) => setProductoId(e.target.value)} placeholder="ID de producto" className="w-full border rounded-lg px-2 py-1.5 text-sm" required />
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre (opcional)" className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          <button type="submit" className="w-full bg-red-600 text-white rounded-lg py-2 text-sm">Crear</button>
        </form>
        {mensaje && <p className="text-sm text-blue-600 mt-2">{mensaje}</p>}
      </div>
    </div>
  );
}

function StockTab() {
  const [stock, setStock] = useState<any[]>([]);
  const [bajo, setBajo] = useState(false);
  useEffect(() => { cargar(); }, [bajo]);
  async function cargar() {
    const res = await fetch(`/api/multisucursal/stock${bajo ? "?bajo=true" : ""}`);
    if (res.ok) setStock((await res.json()).data);
  }
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={bajo} onChange={(e) => setBajo(e.target.checked)} /> Solo líneas bajo stock
      </label>
      {stock.map((s) => (
        <div key={s.sucursalId} className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex justify-between mb-1">
            <h3 className="font-semibold text-sm">{s.nombre}</h3>
            <span className="text-xs text-gray-500">{s.lineasBajoStock} bajo stock</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {s.items.slice(0, 10).map((it: any) => (
                <tr key={it.ingredienteId} className="border-b">
                  <td className="py-1">{it.nombre}</td>
                  <td className={it.bajo ? "text-red-600" : ""}>{it.cantidadActual} {it.unidad}</td>
                  <td className="text-gray-400">mín {it.stockMinimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function ComparativasTab() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/multisucursal/comparativas").then((r) => r.json()).then(setData);
  }, []);
  if (!data) return <p className="text-sm text-gray-500">Cargando…</p>;
  return (
    <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
      <h2 className="font-semibold mb-2">Benchmarks entre sucursales</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-1">Sucursal</th><th>Ventas</th><th>Pedidos</th><th>Ticket</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((f: any) => (
            <tr key={f.sucursalId} className="border-b">
              <td className="py-1.5">{f.nombre}</td><td>${f.ventas}</td><td>{f.pedidos}</td><td>${f.ticketPromedio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.benchmarks.sucursalTopVentas && (
        <p className="text-xs text-gray-500 mt-2">Top ventas: {data.benchmarks.sucursalTopVentas.nombre}</p>
      )}
    </div>
  );
}

function ConfigTab() {
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  useEffect(() => { cargar(); }, []);
  async function cargar() {
    const res = await fetch("/api/multisucursal/sucursales");
    if (res.ok) setSucursales((await res.json()).data);
  }
  async function guardar(s: any) {
    const res = await fetch(`/api/multisucursal/sucursales/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: s.nombre, activa: s.activa }),
    });
    setMensaje(res.ok ? `Guardado: ${s.nombre}` : "Error al guardar");
    if (res.ok) cargar();
  }
  return (
    <div className="space-y-3">
      {sucursales.map((s) => (
        <div key={s.id} className="bg-white rounded-xl p-4 ring-1 ring-gray-200 flex items-center gap-3">
          <input
            value={s.nombre}
            onChange={(e) => setSucursales((prev) => prev.map((x) => (x.id === s.id ? { ...x, nombre: e.target.value } : x)))}
            className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
          />
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={s.activa}
              onChange={(e) => setSucursales((prev) => prev.map((x) => (x.id === s.id ? { ...x, activa: e.target.checked } : x)))}
            /> Activa
          </label>
          <button onClick={() => guardar(s)} className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-sm">Guardar</button>
        </div>
      ))}
      {mensaje && <p className="text-sm text-blue-600">{mensaje}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl p-3 ring-1 ring-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
