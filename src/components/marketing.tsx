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

interface Cupon {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: "porcentaje" | "monto_fijo" | "2x1";
  valor: number;
  fechaInicio: Date;
  fechaFin: Date;
  usosMaximos: number;
  usosRealizados: number;
  estado: "activo" | "inactivo" | "vencido";
}

interface Campaña {
  id: string;
  nombre: string;
  tipo: "email" | "push" | "whatsapp" | "redes";
  fechaEnvio: Date;
  segmento: string;
  enviados: number;
  abiertos: number;
  clics: number;
  estado: "programada" | "enviando" | "completada" | "borrador";
}

// ============================================
// GESTIÓN DE CUPONES
// ============================================

export function GestionCupones() {
  const cuponesMock: Cupon[] = [
    {
      id: "cup-1",
      codigo: "BIENVENIDO10",
      descripcion: "10% de descuento en primera compra",
      tipo: "porcentaje",
      valor: 10,
      fechaInicio: new Date("2026-07-01"),
      fechaFin: new Date("2026-07-31"),
      usosMaximos: 100,
      usosRealizados: 42,
      estado: "activo",
    },
    {
      id: "cup-2",
      codigo: "MARTES2x1",
      descripcion: "Martes 2x1 en pizzas",
      tipo: "2x1",
      valor: 0,
      fechaInicio: new Date("2026-07-01"),
      fechaFin: new Date("2026-07-31"),
      usosMaximos: 500,
      usosRealizados: 128,
      estado: "activo",
    },
    {
      id: "cup-3",
      codigo: "DESCUENTO500",
      descripcion: "$500 de descuento en pedidos mayores a $5000",
      tipo: "monto_fijo",
      valor: 500,
      fechaInicio: new Date("2026-06-01"),
      fechaFin: new Date("2026-06-30"),
      usosMaximos: 200,
      usosRealizados: 200,
      estado: "vencido",
    },
  ];

  const getEstadoColor = (estado: Cupon["estado"]) => {
    const colores: Record<string, string> = {
      activo: "bg-green-100 text-green-800",
      inactivo: "bg-gray-100 text-gray-800",
      vencido: "bg-red-100 text-red-800",
    };
    return colores[estado];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Cupones de Descuento</h3>
        <Button className="bg-red-600 hover:bg-red-700">+ Nuevo cupón</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cuponesMock.map((cupon) => (
          <Card key={cupon.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-lg">{cupon.codigo}</code>
                    <Badge className={cn("text-xs", getEstadoColor(cupon.estado))}>
                      {cupon.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{cupon.descripcion}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo:</span>
                  <span>{cupon.tipo === "porcentaje" ? `${cupon.valor}%` : cupon.tipo === "2x1" ? "2x1" : `$${cupon.valor}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Usos:</span>
                  <span>{cupon.usosRealizados} / {cupon.usosMaximos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Válido:</span>
                  <span>{cupon.fechaInicio.toLocaleDateString("es-AR")} - {cupon.fechaFin.toLocaleDateString("es-AR")}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(cupon.usosRealizados / cupon.usosMaximos) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">✏️ Editar</Button>
                <Button variant="outline" size="sm" className="flex-1">📊 Stats</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CAMPAÑAS
// ============================================

export function GestionCampanas() {
  const campanasMock: Campaña[] = [
    {
      id: "camp-1",
      nombre: "Bienvenida nuevos clientes",
      tipo: "email",
      fechaEnvio: new Date("2026-07-01"),
      segmento: "Nuevos clientes",
      enviados: 150,
      abiertos: 98,
      clics: 42,
      estado: "completada",
    },
    {
      id: "camp-2",
      nombre: "Promo fin de semana",
      tipo: "push",
      fechaEnvio: new Date("2026-07-05"),
      segmento: "Todos los clientes",
      enviados: 800,
      abiertos: 450,
      clics: 180,
      estado: "completada",
    },
    {
      id: "camp-3",
      nombre: "Reactivación clientes inactivos",
      tipo: "whatsapp",
      fechaEnvio: new Date("2026-07-10"),
      segmento: "Inactivos 30+ días",
      enviados: 0,
      abiertos: 0,
      clics: 0,
      estado: "programada",
    },
  ];

  const getEstadoColor = (estado: Campaña["estado"]) => {
    const colores: Record<string, string> = {
      borrador: "bg-gray-100 text-gray-800",
      programada: "bg-blue-100 text-blue-800",
      enviando: "bg-yellow-100 text-yellow-800",
      completada: "bg-green-100 text-green-800",
    };
    return colores[estado];
  };

  const getTipoIcon = (tipo: Campaña["tipo"]) => {
    const icones: Record<string, string> = {
      email: "📧",
      push: "🔔",
      whatsapp: "💬",
      redes: "📱",
    };
    return icones[tipo];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Campañas</h3>
        <Button className="bg-red-600 hover:bg-red-700">+ Nueva campaña</Button>
      </div>

      <div className="space-y-3">
        {campanasMock.map((camp) => (
          <Card key={camp.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTipoIcon(camp.tipo)}</span>
                    <h3 className="font-medium">{camp.nombre}</h3>
                    <Badge className={cn("text-xs", getEstadoColor(camp.estado))}>
                      {camp.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Segmento: {camp.segmento} • Programada: {camp.fechaEnvio.toLocaleDateString("es-AR")}
                  </p>
                </div>
                {camp.estado === "completada" && (
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold">{camp.enviados}</p>
                      <p className="text-xs text-gray-500">Enviados</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{camp.abiertos}</p>
                      <p className="text-xs text-gray-500">Abiertos</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{camp.clics}</p>
                      <p className="text-xs text-gray-500">Clics</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {camp.estado === "borrador" && <Button size="sm">📤 Enviar</Button>}
                  {camp.estado === "programada" && <Button variant="outline" size="sm">✏️ Editar</Button>}
                  <Button variant="outline" size="sm">👁️</Button>
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
// PÁGINA MARKETING
// ============================================

export function PaginaMarketing() {
  const [tab, setTab] = useState<"cupones" | "campanas">("cupones");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing</h1>
          <p className="text-gray-500">Cupones, campañas y fidelización</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === "cupones" ? "default" : "outline"} onClick={() => setTab("cupones")} className={tab === "cupones" ? "bg-red-600 hover:bg-red-700" : ""}>🎫 Cupones</Button>
          <Button variant={tab === "campanas" ? "default" : "outline"} onClick={() => setTab("campanas")} className={tab === "campanas" ? "bg-red-600 hover:bg-red-700" : ""}>📢 Campañas</Button>
        </div>
      </div>

      {tab === "cupones" ? <GestionCupones /> : <GestionCampanas />}
    </div>
  );
}
