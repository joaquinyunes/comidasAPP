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

interface TenantConfig {
  // Datos generales
  nombre: string;
  slug: string;
  email: string;
  telefono: string;
  direccion: string;
  logoUrl: string | null;
  plan: "basico" | "profesional" | "enterprise";

  // Configuración del negocio
  tipoNegocio: string;
  moneda: string;
  timezone: string;
  idioma: string;

  // Horarios
  horarioApertura: string;
  horarioCierre: string;
  diasActivos: string[];

  // Funcionalidades
  habilitarDelivery: boolean;
  habilitarReservas: boolean;
  habilitarQR: boolean;
  habilitarPuntos: boolean;

  // Branding
  colorPrimario: string;
  colorSecundario: string;
  fuentePrincipal: string;
}

// ============================================
// COMPONENTE: Configuración General
// ============================================

export function ConfiguracionTenant() {
  const [config, setConfig] = useState<TenantConfig>({
    nombre: "Pizzaria Demo",
    slug: "pizzaria-demo",
    email: "admin@pizzaria-demo.com",
    telefono: "+54 11 1234-5678",
    direccion: "Av. Corrientes 1234, CABA",
    logoUrl: null,
    plan: "profesional",

    tipoNegocio: "restaurante",
    moneda: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
    idioma: "es",

    horarioApertura: "10:00",
    horarioCierre: "02:00",
    diasActivos: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],

    habilitarDelivery: true,
    habilitarReservas: true,
    habilitarQR: true,
    habilitarPuntos: true,

    colorPrimario: "#DC2626",
    colorSecundario: "#1F2937",
    fuentePrincipal: "Inter",
  });

  const [activeTab, setActiveTab] = useState<"general" | "horarios" | "funciones" | "branding">("general");

  const handleGuardar = () => {
    // En producción: enviar a API
    console.log("Guardando configuración:", config);
    alert("Configuración guardada (demo)");
  };

  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-gray-500">Ajustes generales del restaurante</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">
          Plan: {config.plan}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { value: "general", label: "📋 General" },
          { value: "horarios", label: "🕐 Horarios" },
          { value: "funciones", label: "⚙️ Funciones" },
          { value: "branding", label: "🎨 Branding" },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.value as typeof activeTab)}
            className={activeTab === tab.value ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* General */}
      {activeTab === "general" && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del restaurante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input
                  value={config.slug}
                  onChange={(e) => setConfig({ ...config, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={config.telefono}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Dirección</label>
                <Input
                  value={config.direccion}
                  onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo de negocio</label>
                <Select value={config.tipoNegocio} onValueChange={(v) => { if (v) setConfig({ ...config, tipoNegocio: v }) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                    <SelectItem value="pizzeria">Pizzería</SelectItem>
                    <SelectItem value="cafe">Cafetería</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="heladeria">Heladería</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Moneda</label>
                <Select value={config.moneda} onValueChange={(v) => { if (v) setConfig({ ...config, moneda: v }) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">ARS (Peso argentino)</SelectItem>
                    <SelectItem value="USD">USD (Dólar)</SelectItem>
                    <SelectItem value="BRL">BRL (Real)</SelectItem>
                    <SelectItem value="CLP">CLP (Peso chileno)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Zona horaria</label>
                <Select value={config.timezone} onValueChange={(v) => { if (v) setConfig({ ...config, timezone: v }) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
                    <SelectItem value="America/Sao_Paulo">São Paulo</SelectItem>
                    <SelectItem value="America/Santiago">Santiago</SelectItem>
                    <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horarios */}
      {activeTab === "horarios" && (
        <Card>
          <CardHeader>
            <CardTitle>Horarios de atención</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Horario apertura</label>
                <Input
                  type="time"
                  value={config.horarioApertura}
                  onChange={(e) => setConfig({ ...config, horarioApertura: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Horario cierre</label>
                <Input
                  type="time"
                  value={config.horarioCierre}
                  onChange={(e) => setConfig({ ...config, horarioCierre: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Días activos</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map((dia) => (
                  <Button
                    key={dia}
                    variant={config.diasActivos.includes(dia) ? "default" : "outline"}
                    onClick={() => {
                      const nuevosDias = config.diasActivos.includes(dia)
                        ? config.diasActivos.filter((d) => d !== dia)
                        : [...config.diasActivos, dia];
                      setConfig({ ...config, diasActivos: nuevosDias });
                    }}
                    className={config.diasActivos.includes(dia) ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funciones */}
      {activeTab === "funciones" && (
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades habilitadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "habilitarDelivery", label: "Delivery", description: "Permitir pedidos para delivery" },
              { key: "habilitarReservas", label: "Reservas", description: "Sistema de reservas de mesas" },
              { key: "habilitarQR", label: "Código QR", description: "Menú digital por código QR en mesa" },
              { key: "habilitarPuntos", label: "Programa de puntos", description: "Fidelización con puntos" },
            ].map((funcion) => (
              <div key={funcion.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{funcion.label}</p>
                  <p className="text-sm text-gray-500">{funcion.description}</p>
                </div>
                <Button
                  variant={config[funcion.key as keyof TenantConfig] ? "default" : "outline"}
                  onClick={() => setConfig({ ...config, [funcion.key]: !config[funcion.key as keyof TenantConfig] })}
                  className={config[funcion.key as keyof TenantConfig] ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {config[funcion.key as keyof TenantConfig] ? "✅ Activo" : "❌ Inactivo"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Branding */}
      {activeTab === "branding" && (
        <Card>
          <CardHeader>
            <CardTitle>Personalización visual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Color primario</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={config.colorPrimario}
                    onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={config.colorPrimario}
                    onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Color secundario</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={config.colorSecundario}
                    onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={config.colorSecundario}
                    onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Fuente principal</label>
              <Select value={config.fuentePrincipal} onValueChange={(v) => { if (v) setConfig({ ...config, fuentePrincipal: v }) }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-500 mb-2">Vista previa</p>
              <div
                className="rounded-lg p-6 text-white"
                style={{ backgroundColor: config.colorPrimario }}
              >
                <h3 className="text-xl font-bold" style={{ fontFamily: config.fuentePrincipal }}>
                  {config.nombre}
                </h3>
                <p className="opacity-90">{config.direccion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleGuardar} className="bg-red-600 hover:bg-red-700 px-8">
          💾 Guardar configuración
        </Button>
      </div>
    </div>
  );
}
