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

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  rol: string;
  sector: string;
  fechaIngreso: Date;
  estado: "activo" | "inactivo" | "vacaciones";
  foto?: string;
}

interface Turno {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  horasTrabajadas?: number;
  estado: "programado" | "en_curso" | "completado" | "ausente";
}

interface Asistencia {
  empleadoId: string;
  empleadoNombre: string;
  fecha: Date;
  entrada?: Date;
  salida?: Date;
  horasTrabajadas?: number;
  estado: "presente" | "ausente" | "tardanza" | "permiso";
}

// ============================================
// GESTIÓN DE EMPLEADOS
// ============================================

export function GestionEmpleados() {
  const [busqueda, setBusqueda] = useState("");

  const empleadosMock: Empleado[] = [
    {
      id: "emp-1",
      nombre: "Carlos",
      apellido: "García",
      dni: "32.123.456",
      telefono: "+54 11 1111-2222",
      email: "carlos@pizzaria.com",
      rol: "Mozo",
      sector: "Salón",
      fechaIngreso: new Date("2025-03-15"),
      estado: "activo",
    },
    {
      id: "emp-2",
      nombre: "Ana",
      apellido: "López",
      dni: "33.234.567",
      telefono: "+54 11 3333-4444",
      email: "ana@pizzaria.com",
      rol: "Cocinero",
      sector: "Cocina",
      fechaIngreso: new Date("2025-06-01"),
      estado: "activo",
    },
    {
      id: "emp-3",
      nombre: "Pedro",
      apellido: "Martínez",
      dni: "30.345.678",
      telefono: "+54 11 5555-6666",
      email: "pedro@pizzaria.com",
      rol: "Barman",
      sector: "Barra",
      fechaIngreso: new Date("2024-11-10"),
      estado: "vacaciones",
    },
  ];

  const getEstadoColor = (estado: Empleado["estado"]) => {
    const colores: Record<string, string> = {
      activo: "bg-green-100 text-green-800",
      inactivo: "bg-gray-100 text-gray-800",
      vacaciones: "bg-blue-100 text-blue-800",
    };
    return colores[estado];
  };

  const empleadosFiltrados = empleadosMock.filter(
    (e) => !busqueda || `${e.nombre} ${e.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar empleado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1"
        />
        <Button className="bg-red-600 hover:bg-red-700">+ Nuevo empleado</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empleadosFiltrados.map((emp) => (
          <Card key={emp.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{emp.nombre} {emp.apellido}</h3>
                    <Badge className={cn("text-xs", getEstadoColor(emp.estado))}>
                      {emp.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">DNI: {emp.dni}</p>
                  <p className="text-sm text-gray-500">{emp.email}</p>
                  <p className="text-sm text-gray-500">{emp.telefono}</p>
                  <div className="flex gap-1 mt-2">
                    <Badge variant="outline">{emp.rol}</Badge>
                    <Badge variant="outline">{emp.sector}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Ingreso: {emp.fechaIngreso.toLocaleDateString("es-AR")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">✏️ Editar</Button>
                <Button variant="outline" size="sm" className="flex-1">📅 Turnos</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// GESTIÓN DE TURNOS
// ============================================

export function GestionTurnos() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const turnosMock: Turno[] = [
    { id: "turn-1", empleadoId: "emp-1", empleadoNombre: "Carlos García", fecha: new Date(), horaInicio: "10:00", horaFin: "18:00", horasTrabajadas: 8, estado: "completado" },
    { id: "turn-2", empleadoId: "emp-2", empleadoNombre: "Ana López", fecha: new Date(), horaInicio: "14:00", horaFin: "22:00", horasTrabajadas: 4, estado: "en_curso" },
    { id: "turn-3", empleadoId: "emp-3", empleadoNombre: "Pedro Martínez", fecha: new Date(), horaInicio: "18:00", horaFin: "02:00", estado: "programado" },
  ];

  const getEstadoColor = (estado: Turno["estado"]) => {
    const colores: Record<string, string> = {
      programado: "bg-blue-100 text-blue-800",
      en_curso: "bg-green-100 text-green-800",
      completado: "bg-gray-100 text-gray-800",
      ausente: "bg-red-100 text-red-800",
    };
    return colores[estado];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input type="date" className="w-48" />
        <Button className="bg-red-600 hover:bg-red-700">+ Nuevo turno</Button>
      </div>

      <div className="space-y-3">
        {turnosMock.map((turno) => (
          <Card key={turno.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{turno.empleadoNombre}</h3>
                    <Badge className={cn("text-xs", getEstadoColor(turno.estado))}>
                      {turno.estado.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {turno.horaInicio} - {turno.horaFin}
                  </p>
                </div>
                <div className="text-right">
                  {turno.horasTrabajadas && (
                    <p className="text-lg font-bold">{turno.horasTrabajadas}h</p>
                  )}
                  <div className="flex gap-2">
                    {turno.estado === "programado" && (
                      <Button size="sm">▶️ Iniciar</Button>
                    )}
                    {turno.estado === "en_curso" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">⏹️ Finalizar</Button>
                    )}
                    <Button variant="outline" size="sm">✏️</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CONTROL DE ASISTENCIA
// ============================================

export function ControlAsistencia() {
  const asistenciaMock: Asistencia[] = [
    { empleadoId: "emp-1", empleadoNombre: "Carlos García", fecha: new Date(), entrada: new Date("2026-07-07T09:55:00"), horasTrabajadas: 8, estado: "presente" },
    { empleadoId: "emp-2", empleadoNombre: "Ana López", fecha: new Date(), entrada: new Date("2026-07-07T14:10:00"), estado: "tardanza" },
    { empleadoId: "emp-3", empleadoNombre: "Pedro Martínez", fecha: new Date(), estado: "permiso" },
  ];

  const getEstadoColor = (estado: Asistencia["estado"]) => {
    const colores: Record<string, string> = {
      presente: "bg-green-100 text-green-800",
      ausente: "bg-red-100 text-red-800",
      tardanza: "bg-yellow-100 text-yellow-800",
      permiso: "bg-blue-100 text-blue-800",
    };
    return colores[estado];
  };

  const totalPresentes = asistenciaMock.filter((a) => a.estado === "presente" || a.estado === "tardanza").length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">Asistencia del día</h3>
          <p className="text-sm text-gray-500">{totalPresentes} empleados presentes</p>
        </div>
        <Button variant="outline">📥 Exportar</Button>
      </div>

      <div className="space-y-2">
        {asistenciaMock.map((asist) => (
          <Card key={asist.empleadoId}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-xs", getEstadoColor(asist.estado))}>
                    {asist.estado}
                  </Badge>
                  <span className="font-medium">{asist.empleadoNombre}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {asist.entrada && `Entrada: ${asist.entrada.toLocaleTimeString("es-AR")}`}
                  {asist.salida && ` | Salida: ${asist.salida.toLocaleTimeString("es-AR")}`}
                  {asist.horasTrabajadas && ` | ${asist.horasTrabajadas}h`}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PÁGINA RRHH
// ============================================

export function PaginaRRHH() {
  const [tab, setTab] = useState<"empleados" | "turnos" | "asistencia">("empleados");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recursos Humanos</h1>
          <p className="text-gray-500">Empleados, turnos y asistencia</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === "empleados" ? "default" : "outline"} onClick={() => setTab("empleados")} className={tab === "empleados" ? "bg-red-600 hover:bg-red-700" : ""}>👥 Empleados</Button>
          <Button variant={tab === "turnos" ? "default" : "outline"} onClick={() => setTab("turnos")} className={tab === "turnos" ? "bg-red-600 hover:bg-red-700" : ""}>📅 Turnos</Button>
          <Button variant={tab === "asistencia" ? "default" : "outline"} onClick={() => setTab("asistencia")} className={tab === "asistencia" ? "bg-red-600 hover:bg-red-700" : ""}>✅ Asistencia</Button>
        </div>
      </div>

      {tab === "empleados" && <GestionEmpleados />}
      {tab === "turnos" && <GestionTurnos />}
      {tab === "asistencia" && <ControlAsistencia />}
    </div>
  );
}
