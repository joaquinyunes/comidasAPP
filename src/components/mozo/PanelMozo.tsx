"use client";

import { useEffect, useState } from "react";

interface Mesa { id: string; numero: number; estado: string; capacidad: number; segundosDesdeCambio: number; }
interface Cuenta { subtotal: number; sugerenciaPropina: number; totalConPropina: number; totalPedidos: number; }
interface Alergias { cliente: { id: string; nombre: string } | null; alergenos: string[]; productosAEvitar: { id: string; nombre: string; alergenos: string[] }[]; }
interface Disponibilidad { productosNoDisponibles: { id: string; nombre: string; categoria: string }[]; quiebresIngredientes: { ingrediente: string }[]; }

function colorEstado(estado: string) {
  switch (estado) {
    case "libre": return "bg-green-100 border-green-300";
    case "ocupada": return "bg-red-100 border-red-300";
    case "reservada": return "bg-amber-100 border-amber-300";
    case "esperando_pedido": return "bg-blue-100 border-blue-300";
    case "cuenta_solicitada": return "bg-purple-100 border-purple-300";
    default: return "bg-zinc-100 border-zinc-300";
  }
}

export default function PanelMozo() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaSel, setMesaSel] = useState<string>("");
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [alergias, setAlergias] = useState<Alergias | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad | null>(null);

  async function cargar() {
    const [m, d] = await Promise.all([fetch("/api/mozo/mapa-semaforo"), fetch("/api/mozo/disponibilidad")]);
    const md = await m.json();
    const dd = await d.json();
    setMesas(md.data ?? []);
    setDisponibilidad(dd.data ?? null);
  }
  useEffect(() => { cargar(); const i = setInterval(cargar, 8000); return () => clearInterval(i); }, []);

  async function seleccionarMesa(id: string) {
    setMesaSel(id);
    const [c, a] = await Promise.all([
      fetch(`/api/mozo/cuenta?mesaId=${id}`).then((r) => r.json()),
      fetch(`/api/mozo/alergias?mesaId=${id}`).then((r) => r.json()),
    ]);
    setCuenta(c.data ?? null);
    setAlergias(a.data ?? null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Mapa semáforo de mesas</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {mesas.map((m) => (
            <button
              key={m.id}
              onClick={() => seleccionarMesa(m.id)}
              className={`rounded border p-2 text-left text-xs ${colorEstado(m.estado)} ${mesaSel === m.id ? "ring-2 ring-zinc-500" : ""}`}
            >
              <div className="font-bold">M{m.numero}</div>
              <div className="capitalize">{m.estado.replace("_", " ")}</div>
              <div className="text-zinc-500">{Math.floor(m.segundosDesdeCambio / 60)}m</div>
            </button>
          ))}
          {mesas.length === 0 && <p className="col-span-full text-sm text-zinc-400">Sin mesas.</p>}
        </div>
      </div>

      {mesaSel && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border border-zinc-200 p-3">
            <h4 className="font-medium mb-2">Alergias bloqueantes</h4>
            {alergias?.cliente ? (
              <>
                <p className="text-sm">Cliente: <b>{alergias.cliente.nombre}</b></p>
                <p className="text-sm">Alérgenos: {alergias.alergenos.join(", ") || "—"}</p>
                <p className="text-sm mt-1 text-red-600">Evitar: {alergias.productosAEvitar.map((p) => p.nombre).join(", ") || "ninguno"}</p>
              </>
            ) : <p className="text-sm text-zinc-400">Mesa sin cliente asociado.</p>}
          </div>
          <div className="rounded border border-zinc-200 p-3">
            <h4 className="font-medium mb-2">Ayuda con la cuenta</h4>
            {cuenta ? (
              <ul className="text-sm space-y-1">
                <li>Subtotal: ${cuenta.subtotal}</li>
                <li>Propina sugerida (10%): ${cuenta.sugerenciaPropina}</li>
                <li className="font-semibold">Total: ${cuenta.totalConPropina}</li>
              </ul>
            ) : <p className="text-sm text-zinc-400">Sin pedidos abiertos.</p>}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Disponibilidad en tiempo real</h3>
        <div className="text-sm space-y-1">
          <p className="text-red-600">Platos no disponibles: {disponibilidad?.productosNoDisponibles.map((p) => p.nombre).join(", ") || "ninguno"}</p>
          <p className="text-amber-600">Quiebres de ingrediente: {disponibilidad?.quiebresIngredientes.map((q) => q.ingrediente).join(", ") || "ninguno"}</p>
        </div>
      </div>
    </div>
  );
}
