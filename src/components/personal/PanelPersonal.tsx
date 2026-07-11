"use client";

import { useEffect, useState, useCallback } from "react";

interface FichajeEmpleado {
  empleadoId: string;
  nombre: string;
  cargo: string | null;
  sucursal: string | null;
  estado: string;
  entrada: string | null;
  breakInicio: string | null;
  salida: string | null;
  horasTrabajadas: number | null;
}

export function PanelPersonal() {
  const [plantel, setPlantel] = useState<FichajeEmpleado[]>([]);
  const [empleadoSel, setEmpleadoSel] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");
  const [tab, setTab] = useState<"fichaje" | "checklist" | "rendimiento">("fichaje");

  const cargarPlantel = useCallback(async () => {
    const res = await fetch("/api/personal/fichaje");
    if (res.ok) {
      const data = await res.json();
      setPlantel(data.data);
      if (!empleadoSel && data.data.length) setEmpleadoSel(data.data[0].empleadoId);
    }
  }, [empleadoSel]);

  useEffect(() => {
    cargarPlantel();
  }, [cargarPlantel]);

  async function fichar(tipo: "ENTRADA" | "SALIDA" | "BREAK_IN" | "BREAK_OUT") {
    if (!empleadoSel) return;
    setMensaje("");
    const res = await fetch("/api/personal/fichaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: empleadoSel, tipo }),
    });
    const data = await res.json();
    setMensaje(data.success ? `${tipo} registrado` : data.error);
    if (res.ok) cargarPlantel();
  }

  const colorEstado: Record<string, string> = {
    trabajando: "bg-green-100 text-green-700",
    en_break: "bg-yellow-100 text-yellow-700",
    con_turno: "bg-blue-100 text-blue-700",
    sin_fichar: "bg-gray-100 text-gray-600",
    finalizo: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Gestión de Personal y Turnos</h1>
      <p className="text-sm text-gray-500 mb-4">Fichaje, checklists de apertura/cierre y rendimiento.</p>

      <div className="flex gap-2 mb-4">
        {(["fichaje", "checklist", "rendimiento"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === t ? "bg-red-600 text-white" : "bg-white border text-gray-700"
            }`}
          >
            {t === "fichaje" ? "Fichaje" : t === "checklist" ? "Checklists" : "Rendimiento"}
          </button>
        ))}
      </div>

      {mensaje && <div className="mb-3 text-sm text-blue-600">{mensaje}</div>}

      {tab === "fichaje" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-white rounded-xl p-4 ring-1 ring-gray-200">
            <h2 className="font-semibold mb-2">Registrar</h2>
            <select
              value={empleadoSel}
              onChange={(e) => setEmpleadoSel(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm mb-3"
            >
              {plantel.map((p) => (
                <option key={p.empleadoId} value={p.empleadoId}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fichar("ENTRADA")} className="bg-green-600 text-white rounded-lg py-2 text-sm">Entrada</button>
              <button onClick={() => fichar("SALIDA")} className="bg-red-600 text-white rounded-lg py-2 text-sm">Salida</button>
              <button onClick={() => fichar("BREAK_IN")} className="bg-yellow-500 text-white rounded-lg py-2 text-sm">Iniciar break</button>
              <button onClick={() => fichar("BREAK_OUT")} className="bg-yellow-600 text-white rounded-lg py-2 text-sm">Fin break</button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl p-4 ring-1 ring-gray-200">
            <h2 className="font-semibold mb-2">Plantel en vivo (hoy)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-1">Empleado</th>
                  <th>Estado</th>
                  <th>Entrada</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                {plantel.map((p) => (
                  <tr key={p.empleadoId} className="border-b">
                    <td className="py-1.5">{p.nombre}{p.cargo ? ` (${p.cargo})` : ""}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${colorEstado[p.estado] ?? "bg-gray-100"}`}>
                        {p.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td>{p.entrada ? new Date(p.entrada).toLocaleTimeString("es-AR") : "-"}</td>
                    <td>{p.horasTrabajadas ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "checklist" && <ChecklistPanel recargar={cargarPlantel} />}
      {tab === "rendimiento" && <RendimientoPanel />}
    </div>
  );
}

function ChecklistPanel({ recargar }: { recargar: () => void }) {
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [tipo, setTipo] = useState<"APERTURA" | "CIERRE">("APERTURA");
  const [nombre, setNombre] = useState("");
  const [items, setItems] = useState<string[]>([""]);
  const [mensaje, setMensaje] = useState("");
  const [ejecutarId, setEjecutarId] = useState<string>("");

  async function cargar() {
    const res = await fetch(`/api/personal/checklists?tipo=${tipo}`);
    if (res.ok) setPlantillas((await res.json()).data);
  }
  useEffect(() => { cargar(); }, [tipo]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/personal/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, nombre, items: items.filter((i) => i.trim()).map((descripcion) => ({ descripcion })) }),
    });
    const data = await res.json();
    setMensaje(data.success ? "Plantilla creada" : data.error);
    if (res.ok) { setNombre(""); setItems([""]); cargar(); }
  }

  async function ejecutar(pid: string) {
    const plantilla = plantillas.find((p) => p.id === pid);
    if (!plantilla) return;
    const marcados = plantilla.items.map((it: any) => ({ itemId: it.id, marcado: true }));
    const res = await fetch(`/api/personal/checklists/${pid}/ejecutar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sucursalId: "", items: marcados }),
    });
    const data = await res.json();
    setMensaje(data.success ? `Ejecutado (completo: ${data.completo})` : data.error);
    setEjecutarId("");
    recargar();
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
        <h2 className="font-semibold mb-2">Plantillas {tipo.toLowerCase()}</h2>
        <div className="space-y-2">
          {plantillas.map((p) => (
            <div key={p.id} className="border rounded-lg p-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{p.nombre}</div>
                <div className="text-xs text-gray-500">{p._count.items} ítems · {p._count.ejecuciones} ejecuciones</div>
              </div>
              <button onClick={() => ejecutar(p.id)} className="text-sm bg-red-600 text-white px-2 py-1 rounded-lg">
                Ejecutar
              </button>
            </div>
          ))}
          {plantillas.length === 0 && <p className="text-sm text-gray-500">Sin plantillas.</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
        <h2 className="font-semibold mb-2">Nueva plantilla</h2>
        <form onSubmit={crear} className="space-y-2">
          <div className="flex gap-2">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className="border rounded-lg px-2 py-1.5 text-sm">
              <option value="APERTURA">Apertura</option>
              <option value="CIERRE">Cierre</option>
            </select>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="flex-1 border rounded-lg px-2 py-1.5 text-sm" required />
          </div>
          {items.map((it, i) => (
            <input key={i} value={it} onChange={(e) => setItems((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder={`Ítem ${i + 1}`} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          ))}
          <button type="button" onClick={() => setItems((prev) => [...prev, ""])} className="text-sm text-blue-600">+ ítem</button>
          <button type="submit" className="w-full bg-red-600 text-white rounded-lg py-2 text-sm">Crear plantilla</button>
        </form>
      </div>
      {mensaje && <div className="md:col-span-2 text-sm text-blue-600">{mensaje}</div>}
    </div>
  );
}

function RendimientoPanel() {
  const [filas, setFilas] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/personal/rendimiento").then((r) => r.json()).then((d) => setFilas(d.data ?? []));
  }, []);
  return (
    <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
      <h2 className="font-semibold mb-2">Rendimiento por empleado (últimos 7 días)</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-1">Empleado</th><th>Turnos</th><th>Horas</th><th>Pedidos</th><th>Ventas</th><th>$/h</th><th>Prep. min</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.empleadoId} className="border-b">
              <td className="py-1.5">{f.nombre}</td>
              <td>{f.turnos}</td><td>{f.horasTrabajadas}</td><td>{f.pedidosAtendidos}</td>
              <td>${f.ventasTotales}</td><td>${f.ventasPorHora}</td>
              <td>{f.tiempoPromedioPreparacionMin ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
