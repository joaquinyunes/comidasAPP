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

interface WhiteLabelConfig {
  // Branding
  nombreRestaurante: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  fuentePrincipal: string;
  fuenteSecundaria: string;

  // Dominio
  subdominio: string;
  dominioPersonalizado: string | null;
  sslHabilitado: boolean;

  // Footer
  footerTexto: string;
  footerLinks: { label: string; url: string }[];

  // Social
  instagram: string;
  facebook: string;
  whatsapp: string;
  tiktok: string;

  // Email
  emailFrom: string;
  emailNombre: string;
  plantillaEmailPersonalizada: boolean;
}

// ============================================
// COMPONENTE: Configuración White-Label
// ============================================

export function ConfigWhiteLabel() {
  const [config, setConfig] = useState<WhiteLabelConfig>({
    nombreRestaurante: "Pizzaria Demo",
    logoUrl: null,
    faviconUrl: null,
    colorPrimario: "#DC2626",
    colorSecundario: "#1F2937",
    colorAcento: "#F59E0B",
    fuentePrincipal: "Inter",
    fuenteSecundaria: "Georgia",

    subdominio: "pizzaria-demo",
    dominioPersonalizado: null,
    sslHabilitado: true,

    footerTexto: "© 2026 Pizzaria Demo. Todos los derechos reservados.",
    footerLinks: [
      { label: "Términos", url: "/terminos" },
      { label: "Privacidad", url: "/privacidad" },
    ],

    instagram: "",
    facebook: "",
    whatsapp: "+54 11 1234-5678",
    tiktok: "",

    emailFrom: "noreply@pizzaria-demo.com",
    emailNombre: "Pizzaria Demo",
    plantillaEmailPersonalizada: false,
  });

  const [activeTab, setActiveTab] = useState<"branding" | "dominio" | "social" | "email">("branding");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">White-Label & Personalización</h1>
          <p className="text-gray-500">Configurá la marca y apariencia de tu plataforma</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { value: "branding", label: "🎨 Branding" },
          { value: "dominio", label: "🌐 Dominio" },
          { value: "social", label: "📱 Redes" },
          { value: "email", label: "📧 Email" },
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

      {/* Branding */}
      {activeTab === "branding" && (
        <Card>
          <CardHeader>
            <CardTitle>Apariencia visual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre del restaurante</label>
                <Input
                  value={config.nombreRestaurante}
                  onChange={(e) => setConfig({ ...config, nombreRestaurante: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subdominio</label>
                <div className="flex">
                  <Input
                    value={config.subdominio}
                    onChange={(e) => setConfig({ ...config, subdominio: e.target.value })}
                  />
                  <span className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r text-sm text-gray-500">
                    .restaurantos.com
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Color primario</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={config.colorPrimario}
                    onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })}
                    className="w-10 h-10 rounded border"
                  />
                  <Input value={config.colorPrimario} onChange={(e) => setConfig({ ...config, colorPrimario: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Color secundario</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={config.colorSecundario}
                    onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })}
                    className="w-10 h-10 rounded border"
                  />
                  <Input value={config.colorSecundario} onChange={(e) => setConfig({ ...config, colorSecundario: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Color acento</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={config.colorAcento}
                    onChange={(e) => setConfig({ ...config, colorAcento: e.target.value })}
                    className="w-10 h-10 rounded border"
                  />
                  <Input value={config.colorAcento} onChange={(e) => setConfig({ ...config, colorAcento: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-6 mt-4">
              <p className="text-sm text-gray-500 mb-3">Vista previa</p>
              <div className="space-y-3">
                <div className="rounded-lg p-4 text-white" style={{ backgroundColor: config.colorPrimario }}>
                  <h3 className="text-xl font-bold">{config.nombreRestaurante}</h3>
                  <p className="opacity-80 text-sm">Menú digital • Delivery • Reservas</p>
                </div>
                <div className="flex gap-2">
                  <Button style={{ backgroundColor: config.colorSecundario }}>Botón primario</Button>
                  <Button variant="outline" style={{ borderColor: config.colorAcento, color: config.colorAcento }}>Botón secundario</Button>
                </div>
                <p className="text-xs text-gray-500">{config.footerTexto}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dominio */}
      {activeTab === "dominio" && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de dominio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Dominio actual</p>
              <p className="text-lg font-mono">
                {config.subdominio}.restaurantos.com
              </p>
              <Badge className="mt-2 bg-green-100 text-green-800">SSL habilitado</Badge>
            </div>

            <div>
              <label className="text-sm font-medium">Dominio personalizado (opcional)</label>
              <Input
                placeholder="www.mipizzeria.com"
                value={config.dominioPersonalizado || ""}
                onChange={(e) => setConfig({ ...config, dominioPersonalizado: e.target.value || null })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Configurá un registro CNAME apuntando a restaurants.com
              </p>
            </div>

            {config.dominioPersonalizado && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">Instrucciones de configuración</p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Creá un registro CNAME en tu DNS</li>
                  <li>Apuntá <code>{config.dominioPersonalizado}</code> → <code>proxy.restaurantos.com</code></li>
                  <li>Esperá a que la propagación DNS se complete (24-48hs)</li>
                  <li>Habilitá SSL automáticamente</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Redes sociales */}
      {activeTab === "social" && (
        <Card>
          <CardHeader>
            <CardTitle>Redes sociales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "instagram", label: "Instagram", icon: "📸", placeholder: "@tupizzeria" },
              { key: "facebook", label: "Facebook", icon: "👥", placeholder: "https://facebook.com/tupizzeria" },
              { key: "whatsapp", label: "WhatsApp", icon: "💬", placeholder: "+54 11 1234-5678" },
              { key: "tiktok", label: "TikTok", icon: "🎵", placeholder: "@tupizzeria" },
            ].map((red) => (
              <div key={red.key}>
                <label className="text-sm font-medium">{red.icon} {red.label}</label>
                <Input
                  placeholder={red.placeholder}
                  value={config[red.key as keyof WhiteLabelConfig] as string}
                  onChange={(e) => setConfig({ ...config, [red.key]: e.target.value })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Email */}
      {activeTab === "email" && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email remitente</label>
                <Input
                  value={config.emailFrom}
                  onChange={(e) => setConfig({ ...config, emailFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre remitente</label>
                <Input
                  value={config.emailNombre}
                  onChange={(e) => setConfig({ ...config, emailNombre: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Plantilla personalizada</p>
                <p className="text-sm text-gray-500">Usar colores y logo del restaurante en emails</p>
              </div>
              <Button
                variant={config.plantillaEmailPersonalizada ? "default" : "outline"}
                onClick={() => setConfig({ ...config, plantillaEmailPersonalizada: !config.plantillaEmailPersonalizada })}
                className={config.plantillaEmailPersonalizada ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {config.plantillaEmailPersonalizada ? "✅ Activo" : "❌ Inactivo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guardar */}
      <div className="flex justify-end">
        <Button className="bg-red-600 hover:bg-red-700 px-8">💾 Guardar configuración</Button>
      </div>
    </div>
  );
}
