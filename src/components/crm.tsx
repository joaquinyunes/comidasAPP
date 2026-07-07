"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  puntos: number;
  nivel: "bronce" | "plata" | "oro" | "platino";
  totalGastado: number;
  totalVisitas: number;
  ultimaVisita?: Date;
  favoritos: string[];
  notas?: string;
  optInMarketing: boolean;
}

interface PuntosHistorial {
  id: string;
  tipo: "acumulado" | "canjeado" | "expirado" | "bonificado";
  puntos: number;
  motivo: string;
  pedidoId?: string;
  fecha: Date;
}

// ============================================
// NIVELES DE FIDELIZACIÓN
// ============================================

const NIVELES = {
  bronce: { nombre: "Bronce", minPuntos: 0, color: "bg-orange-100 text-orange-800", beneficios: ["5% descuento en tu cumpleaños"] },
  plata: { nombre: "Plata", minPuntos: 500, color: "bg-gray-100 text-gray-800", beneficios: ["10% descuento permanente", "Postre gratis por cumpleaños"] },
  oro: { nombre: "Oro", minPuntos: 1500, color: "bg-yellow-100 text-yellow-800", beneficios: ["15% descuento", "Bebida gratis por cumpleaños", "Acceso a eventos VIP"] },
  platino: { nombre: "Platino", minPuntos: 3000, color: "bg-purple-100 text-purple-800", beneficios: ["20% descuento", "Mesa reservada permanente", "Menú exclusivo", "Concierge personal"] },
};

function getNivel(puntos: number): keyof typeof NIVELES {
  if (puntos >= 3000) return "platino";
  if (puntos >= 1500) return "oro";
  if (puntos >= 500) return "plata";
  return "bronce";
}

// ============================================
// COMPONENTE: Lista de Clientes
// ============================================

export function ListaClientes() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("todos");

  const clientesMock: Cliente[] = [
    {
      id: "cli-1",
      nombre: "Juan Pérez",
      email: "juan@email.com",
      telefono: "+54 11 1111-2222",
      puntos: 1200,
      nivel: "oro",
      totalGastado: 320000,
      totalVisitas: 24,
      ultimaVisita: new Date("2026-07-05"),
      favoritos: ["Pizza Muzzarella", "Fugazzeta"],
      optInMarketing: true,
    },
    {
      id: "cli-2",
      nombre: "María García",
      email: "maria@email.com",
      telefono: "+54 11 3333-4444",
      puntos: 800,
      nivel: "plata",
      totalGastado: 240000,
      totalVisitas: 18,
      ultimaVisita: new Date("2026-07-03"),
      favoritos: ["Empanadas x12"],
      optInMarketing: true,
    },
    {
      id: "cli-3",
      nombre: "Carlos López",
      email: "carlos@email.com",
      telefono: "+54 11 5555-6666",
      puntos: 2500,
      nivel: "oro",
      totalGastado: 480000,
      totalVisitas: 32,
      ultimaVisita: new Date("2026-07-06"),
      favoritos: ["Ñoquis", "Helado"],
      notas: "Alérgico a frutos del mar",
      optInMarketing: false,
    },
    {
      id: "cli-4",
      nombre: "Ana Martínez",
      email: "ana@email.com",
      telefono: "+54 11 7777-8888",
      puntos: 3500,
      nivel: "platino",
      totalGastado: 650000,
      totalVisitas: 48,
      ultimaVisita: new Date("2026-07-07"),
      favoritos: ["Pizza Napolitana", "IPA Artesanal"],
      optInMarketing: true,
    },
  ];

  const clientesFiltrados = clientesMock.filter((c) => {
    if (busqueda && !c.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !c.email.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroNivel !== "todos" && c.nivel !== filtroNivel) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="🔍 Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1"
        />
        <Select value={filtroNivel} onValueChange={(v) => { if (v) setFiltroNivel(v) }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="bronce">Bronce</SelectItem>
            <SelectItem value="plata">Plata</SelectItem>
            <SelectItem value="oro">Oro</SelectItem>
            <SelectItem value="platino">Platino</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-red-600 hover:bg-red-700">+ Nuevo cliente</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientesFiltrados.map((cliente) => {
          const nivelInfo = NIVELES[cliente.nivel];
          return (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{cliente.nombre}</h3>
                      <Badge className={cn("text-xs", nivelInfo.color)}>
                        ⭐ {nivelInfo.nombre}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{cliente.email}</p>
                    <p className="text-sm text-gray-500">{cliente.telefono}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{cliente.puntos} pts</p>
                    <div className="flex gap-1">
                      {cliente.optInMarketing && <Badge variant="outline" className="text-xs">📧 Marketing</Badge>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Gastado</p>
                    <p className="font-medium">{formatCurrency(cliente.totalGastado)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Visitas</p>
                    <p className="font-medium">{cliente.totalVisitas}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Última visita</p>
                    <p className="font-medium">
                      {cliente.ultimaVisita?.toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>

                {cliente.favoritos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Favoritos:</p>
                    <div className="flex flex-wrap gap-1">
                      {cliente.favoritos.map((fav) => (
                        <Badge key={fav} variant="outline" className="text-xs">{fav}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {cliente.notas && (
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    📝 {cliente.notas}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">👤 Ver perfil</Button>
                  <Button variant="outline" size="sm" className="flex-1">📊 Historial</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Programa de Puntos
// ============================================

export function ProgramaPuntos() {
  const historialMock: PuntosHistorial[] = [
    { id: "ph-1", tipo: "acumulado", puntos: 500, motivo: "Pedido #1234", fecha: new Date("2026-07-05") },
    { id: "ph-2", tipo: "canjeado", puntos: -200, motivo: "Descuento aplicado", fecha: new Date("2026-07-04") },
    { id: "ph-3", tipo: "bonificado", puntos: 100, motivo: "Bono por cumpleaños", fecha: new Date("2026-07-01") },
    { id: "ph-4", tipo: "acumulado", puntos: 350, motivo: "Pedido #1230", fecha: new Date("2026-06-28") },
  ];

  const getTipoColor = (tipo: PuntosHistorial["tipo"]) => {
    const colores: Record<string, string> = {
      acumulado: "text-green-600",
      canjeado: "text-red-600",
      expirado: "text-gray-500",
      bonificado: "text-blue-600",
    };
    return colores[tipo];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Puntos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Puntos por peso gastado</label>
              <Input type="number" defaultValue={1} />
            </div>
            <div>
              <label className="text-sm font-medium">Valor del punto (pesos)</label>
              <Input type="number" defaultValue={10} />
            </div>
            <div>
              <label className="text-sm font-medium">Puntos de bienvenida</label>
              <Input type="number" defaultValue={100} />
            </div>
            <div>
              <label className="text-sm font-medium">Puntos por referido</label>
              <Input type="number" defaultValue={200} />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Niveles de fidelización</h4>
            <div className="space-y-2">
              {Object.entries(NIVELES).map(([key, nivel]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", nivel.color)}>{nivel.nombre}</Badge>
                    <span className="text-sm text-gray-500">{nivel.minPuntos}+ puntos</span>
                  </div>
                  <span className="text-xs text-gray-400">{nivel.beneficios[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos movimientos de puntos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {historialMock.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{item.motivo}</p>
                  <p className="text-xs text-gray-500">{item.fecha.toLocaleDateString("es-AR")}</p>
                </div>
                <span className={cn("font-bold", getTipoColor(item.tipo))}>
                  {item.puntos > 0 ? "+" : ""}{item.puntos}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// PÁGINA CRM
// ============================================

export function PaginaCRM() {
  const [tab, setTab] = useState<"clientes" | "puntos">("clientes");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM & Fidelización</h1>
          <p className="text-gray-500">Gestión de clientes y programa de puntos</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === "clientes" ? "default" : "outline"} onClick={() => setTab("clientes")} className={tab === "clientes" ? "bg-red-600 hover:bg-red-700" : ""}>
            👥 Clientes
          </Button>
          <Button variant={tab === "puntos" ? "default" : "outline"} onClick={() => setTab("puntos")} className={tab === "puntos" ? "bg-red-600 hover:bg-red-700" : ""}>
            ⭐ Puntos
          </Button>
        </div>
      </div>

      {tab === "clientes" ? <ListaClientes /> : <ProgramaPuntos />}
    </div>
  );
}
