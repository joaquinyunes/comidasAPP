"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StockProducto } from "@/types";

// ============================================
// GESTIÓN DE INVENTARIO
// ============================================

interface GestionInventarioProps {
  sucursalId: string;
}

export function GestionInventario({ sucursalId }: GestionInventarioProps) {
  const [filtro, setFiltro] = useState<"todos" | "bajo" | "critico">("todos");
  const [busqueda, setBusqueda] = useState("");

  // Mock data
  const stockMock: StockProducto[] = [
    {
      productoId: "ing-1",
      nombre: "Harina 000",
      unidad: "kg",
      cantidadActual: 25,
      cantidadMinima: 10,
      cantidadMaxima: 100,
      costoUnitario: 450,
      ubicacion: "Despensa",
      lote: "LOT-2026-001",
      fechaVencimiento: new Date("2026-08-15"),
    },
    {
      productoId: "ing-2",
      nombre: "Muzzarella",
      unidad: "kg",
      cantidadActual: 8,
      cantidadMinima: 10,
      cantidadMaxima: 50,
      costoUnitario: 2800,
      ubicacion: "Heladera",
      lote: "LOT-2026-002",
      fechaVencimiento: new Date("2026-07-20"),
    },
    {
      productoId: "ing-3",
      nombre: "Salsa de tomate",
      unidad: "l",
      cantidadActual: 3,
      cantidadMinima: 5,
      cantidadMaxima: 20,
      costoUnitario: 600,
      ubicacion: "Despensa",
    },
    {
      productoId: "ing-4",
      nombre: "Aceite de oliva",
      unidad: "l",
      cantidadActual: 12,
      cantidadMinima: 5,
      cantidadMaxima: 30,
      costoUnitario: 3500,
      ubicacion: "Despensa",
    },
    {
      productoId: "ing-5",
      nombre: "Cerveza artesanal",
      unidad: "un",
      cantidadActual: 48,
      cantidadMinima: 24,
      cantidadMaxima: 100,
      costoUnitario: 800,
      ubicacion: "Barra",
    },
  ];

  const getEstadoStock = (item: StockProducto) => {
    if (item.cantidadActual <= item.cantidadMinima * 0.5) return "critico";
    if (item.cantidadActual <= item.cantidadMinima) return "bajo";
    return "ok";
  };

  const getEstadoColor = (estado: string) => {
    const colores: Record<string, string> = {
      ok: "bg-green-100 text-green-800",
      bajo: "bg-yellow-100 text-yellow-800",
      critico: "bg-red-100 text-red-800",
    };
    return colores[estado] || "bg-gray-100";
  };

  const stockFiltrado = stockMock.filter((item) => {
    const estado = getEstadoStock(item);
    if (filtro === "bajo" && estado !== "bajo") return false;
    if (filtro === "critico" && estado !== "critico") return false;
    if (busqueda && !item.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const totalValor = stockMock.reduce((sum, item) => sum + item.cantidadActual * item.costoUnitario, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-gray-500">Gestión de stock e ingredientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📥 Ingreso</Button>
          <Button variant="outline">📤 Egreso</Button>
          <Button variant="outline">📊 Ajuste</Button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stockMock.length}</p>
            <p className="text-sm text-gray-500">Ingredientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {stockMock.filter((i) => getEstadoStock(i) === "critico").length}
            </p>
            <p className="text-sm text-gray-500">Críticos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stockMock.filter((i) => getEstadoStock(i) === "bajo").length}
            </p>
            <p className="text-sm text-gray-500">Bajos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">${totalValor.toLocaleString("es-AR")}</p>
            <p className="text-sm text-gray-500">Valor total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar ingrediente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Select value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="bajo">Stock bajo</SelectItem>
            <SelectItem value="critico">Críticos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de stock */}
      <div className="space-y-3">
        {stockFiltrado.map((item) => {
          const estado = getEstadoStock(item);
          const porcentaje = (item.cantidadActual / item.cantidadMaxima) * 100;

          return (
            <Card key={item.productoId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.nombre}</p>
                        <Badge className={cn("text-xs", getEstadoColor(estado))}>
                          {estado === "critico" ? "CRÍTICO" : estado === "bajo" ? "BAJO" : "OK"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.ubicacion} • Lote: {item.lote || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {item.cantidadActual} {item.unidad}
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {item.cantidadMinima} / Max: {item.cantidadMaxima}
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            estado === "critico" ? "bg-red-500" : estado === "bajo" ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${item.costoUnitario.toLocaleString("es-AR")}</p>
                      <p className="text-xs text-gray-500">
                        Total: ${(item.cantidadActual * item.costoUnitario).toLocaleString("es-AR")}
                      </p>
                    </div>
                    {item.fechaVencimiento && (
                      <Badge variant={item.fechaVencimiento < new Date() ? "destructive" : "outline"}>
                        Vence: {item.fechaVencimiento.toLocaleDateString("es-AR")}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">✏️</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
