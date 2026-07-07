"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

interface Proveedor {
  id: string;
  nombre: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  categorias: string[];
  calificacion: number;
  activo: boolean;
}

interface OrdenCompra {
  id: string;
  proveedorId: string;
  proveedorNombre: string;
  fecha: Date;
  estado: "borrador" | "enviada" | "confirmada" | "en_camino" | "recibida" | "cancelada";
  items: { descripcion: string; cantidad: number; precioUnitario: number }[];
  total: number;
  fechaEntregaEstimada?: Date;
}

// ============================================
// LISTA DE PROVEEDORES
// ============================================

export function ListaProveedores() {
  const [busqueda, setBusqueda] = useState("");

  const proveedoresMock: Proveedor[] = [
    {
      id: "prov-1",
      nombre: "Distribuidora La Norteña",
      cuit: "30-71234567-9",
      telefono: "+54 11 4567-8901",
      email: "ventas@lanortena.com",
      direccion: "Av. San Martín 1234, CABA",
      categorias: ["Carnes", "Lácteos"],
      calificacion: 4,
      activo: true,
    },
    {
      id: "prov-2",
      nombre: "Verdulería Express",
      cuit: "30-79876543-2",
      telefono: "+54 11 5678-9012",
      email: "pedidos@verduleriaexpress.com",
      direccion: "San Juan 567, CABA",
      categorias: ["Frutas y Verduras"],
      calificacion: 5,
      activo: true,
    },
  ];

  const proveedoresFiltrados = proveedoresMock.filter(
    (p) => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar proveedor..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proveedoresFiltrados.map((prov) => (
          <Card key={prov.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{prov.nombre}</h3>
                  <p className="text-sm text-gray-500">{prov.cuit}</p>
                  <p className="text-sm text-gray-500">{prov.telefono}</p>
                  <p className="text-sm text-gray-500">{prov.email}</p>
                  <div className="flex gap-1 mt-2">
                    {prov.categorias.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={s <= prov.calificacion ? "text-yellow-400" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <Badge variant={prov.activo ? "default" : "secondary"}>
                    {prov.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">✏️ Editar</Button>
                <Button variant="outline" size="sm" className="flex-1">📦 Nueva OC</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// ÓRDENES DE COMPRA
// ============================================

export function OrdenesDeCompra() {
  const [filtro, setFiltro] = useState<string>("todas");

  const ocsMock: OrdenCompra[] = [
    {
      id: "OC-001",
      proveedorId: "prov-1",
      proveedorNombre: "Distribuidora La Norteña",
      fecha: new Date("2026-07-01"),
      estado: "recibida",
      items: [
        { descripcion: "Muzzarella x kg", cantidad: 10, precioUnitario: 2800 },
        { descripcion: "Mortadela x kg", cantidad: 5, precioUnitario: 1200 },
      ],
      total: 34000,
    },
    {
      id: "OC-002",
      proveedorId: "prov-2",
      proveedorNombre: "Verdulería Express",
      fecha: new Date("2026-07-05"),
      estado: "en_camino",
      items: [
        { descripcion: "Tomates x kg", cantidad: 8, precioUnitario: 600 },
        { descripcion: "Lechugas", cantidad: 6, precioUnitario: 400 },
      ],
      total: 7200,
      fechaEntregaEstimada: new Date("2026-07-07"),
    },
    {
      id: "OC-003",
      proveedorId: "prov-1",
      proveedorNombre: "Distribuidora La Norteña",
      fecha: new Date("2026-07-06"),
      estado: "borrador",
      items: [
        { descripcion: "Harina 000 x 50kg", cantidad: 2, precioUnitario: 12000 },
      ],
      total: 24000,
    },
  ];

  const getEstadoColor = (estado: OrdenCompra["estado"]) => {
    const colores: Record<string, string> = {
      borrador: "bg-gray-100 text-gray-800",
      enviada: "bg-blue-100 text-blue-800",
      confirmada: "bg-green-100 text-green-800",
      en_camino: "bg-yellow-100 text-yellow-800",
      recibida: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    };
    return colores[estado] || "bg-gray-100";
  };

  const ocsFiltradas = ocsMock.filter((oc) => filtro === "todas" || oc.estado === filtro);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["todas", "borrador", "enviada", "confirmada", "en_camino", "recibida"].map((f) => (
          <Button
            key={f}
            variant={filtro === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro(f)}
            className={filtro === f ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {f === "todas" ? "Todas" : f.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {ocsFiltradas.map((oc) => (
          <Card key={oc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{oc.id}</h3>
                    <Badge className={cn("text-xs", getEstadoColor(oc.estado))}>
                      {oc.estado.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{oc.proveedorNombre}</p>
                  <p className="text-sm text-gray-500">
                    {oc.fecha.toLocaleDateString("es-AR")} • {oc.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(oc.total)}</p>
                  {oc.fechaEntregaEstimada && (
                    <p className="text-xs text-gray-500">
                      Entrega: {oc.fechaEntregaEstimada.toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {oc.estado === "borrador" && <Button size="sm">📤 Enviar</Button>}
                  {oc.estado === "en_camino" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      ✅ Recibir
                    </Button>
                  )}
                  <Button variant="outline" size="sm">👁️ Ver</Button>
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
// PÁGINA DE COMPRAS
// ============================================

export function PaginaCompras() {
  const [tab, setTab] = useState<"proveedores" | "ordenes">("proveedores");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compras</h1>
          <p className="text-gray-500">Proveedores y órdenes de compra</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === "proveedores" ? "default" : "outline"}
            onClick={() => setTab("proveedores")}
            className={tab === "proveedores" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            🏢 Proveedores
          </Button>
          <Button
            variant={tab === "ordenes" ? "default" : "outline"}
            onClick={() => setTab("ordenes")}
            className={tab === "ordenes" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            📦 Órdenes de Compra
          </Button>
        </div>
      </div>

      {tab === "proveedores" ? <ListaProveedores /> : <OrdenesDeCompra />}
    </div>
  );
}
