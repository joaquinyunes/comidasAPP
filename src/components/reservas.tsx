"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

type ReservaEstado = "pendiente" | "confirmada" | "sentada" | "cancelada" | "no_show";

interface Reserva {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  fecha: Date;
  hora: string;
  cantidad: number;
  sector: string;
  mesaId?: string;
  estado: ReservaEstado;
  notas?: string;
}

interface CalendarioReservasProps {
  onSeleccionarReserva: (reserva: Reserva) => void;
  onCrearReserva: () => void;
}

// ============================================
// CALENDARIO
// ============================================

export function CalendarioReservas({ onSeleccionarReserva, onCrearReserva }: CalendarioReservasProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vista, setVista] = useState<"dia" | "semana">("dia");

  // Mock data
  const reservasMock: Reserva[] = [
    {
      id: "res-1",
      clienteNombre: "Juan Pérez",
      clienteTelefono: "+54 11 1234-5678",
      fecha: new Date(),
      hora: "19:00",
      cantidad: 4,
      sector: "Salón Principal",
      estado: "confirmada",
    },
    {
      id: "res-2",
      clienteNombre: "María García",
      clienteTelefono: "+54 11 8765-4321",
      fecha: new Date(),
      hora: "20:30",
      cantidad: 2,
      sector: "Terraza",
      estado: "pendiente",
      notas: "Celebración de aniversario",
    },
    {
      id: "res-3",
      clienteNombre: "Carlos López",
      clienteTelefono: "+54 11 5555-1234",
      fecha: new Date(),
      hora: "21:00",
      cantidad: 6,
      sector: "Salón Principal",
      estado: "sentada",
      mesaId: "mesa-3",
    },
  ];

  const horasDisponibles = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

  const getEstadoColor = (estado: ReservaEstado) => {
    const colores: Record<ReservaEstado, string> = {
      pendiente: "bg-yellow-100 border-yellow-300",
      confirmada: "bg-green-100 border-green-300",
      sentada: "bg-blue-100 border-blue-300",
      cancelada: "bg-gray-100 border-gray-300",
      no_show: "bg-red-100 border-red-300",
    };
    return colores[estado];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="text-gray-500">Gestión de mesas y reservas</p>
        </div>
        <div className="flex gap-2">
          <Select value={vista} onValueChange={(v) => setVista(v as "dia" | "semana")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Día</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onCrearReserva} className="bg-red-600 hover:bg-red-700">
            + Nueva reserva
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-sm">
        {(["pendiente", "confirmada", "sentada", "cancelada", "no_show"] as ReservaEstado[]).map((estado) => (
          <div key={estado} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded", getEstadoColor(estado))} />
            <span className="capitalize">{estado.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      {/* Grid de horas */}
      <div className="grid grid-cols-[80px_1fr] gap-2">
        {horasDisponibles.map((hora) => {
          const reservasEnHora = reservasMock.filter((r) => r.hora === hora);
          return (
            <div key={hora} className="contents">
              <div className="text-sm font-medium text-gray-500 py-2">{hora}</div>
              <div className="min-h-[60px] border rounded-lg p-2 flex gap-2 flex-wrap">
                {reservasEnHora.length === 0 ? (
                  <span className="text-xs text-gray-300">Sin reservas</span>
                ) : (
                  reservasEnHora.map((reserva) => (
                    <button
                      key={reserva.id}
                      onClick={() => onSeleccionarReserva(reserva)}
                      className={cn(
                        "text-left p-2 rounded border-2 text-sm flex-1 min-w-[200px]",
                        getEstadoColor(reserva.estado)
                      )}
                    >
                      <p className="font-medium">{reserva.clienteNombre}</p>
                      <p className="text-xs text-gray-600">
                        {reserva.cantidad} personas • {reserva.sector}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// MODAL NUEVA RESERVA
// ============================================

interface ModalNuevaReservaProps {
  onGuardar: (reserva: Omit<Reserva, "id">) => void;
  onCerrar: () => void;
}

export function ModalNuevaReserva({ onGuardar, onCerrar }: ModalNuevaReservaProps) {
  const [form, setForm] = useState({
    clienteNombre: "",
    clienteTelefono: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "20:00",
    cantidad: 2,
    sector: "Salón Principal",
    notas: "",
  });

  const handleSubmit = () => {
    onGuardar({
      ...form,
      fecha: new Date(form.fecha),
      estado: "pendiente",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">📅 Nueva Reserva</h2>
            <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre del cliente</label>
            <Input
              value={form.clienteNombre}
              onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })}
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <Input
              value={form.clienteTelefono}
              onChange={(e) => setForm({ ...form, clienteTelefono: e.target.value })}
              placeholder="+54 11 1234-5678"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hora</label>
              <Select value={form.hora}                 onValueChange={(v) => { if (v) setForm({ ...form, hora: v }) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cantidad</label>
              <Input
                type="number"
                min={1}
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sector</label>
              <Select value={form.sector}                 onValueChange={(v) => { if (v) setForm({ ...form, sector: v }) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salón Principal">Salón Principal</SelectItem>
                  <SelectItem value="Terraza">Terraza</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Barra">Barra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notas</label>
            <Input
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Celebración, alergias, etc."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCerrar} className="flex-1">Cancelar</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-red-600 hover:bg-red-700">Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
