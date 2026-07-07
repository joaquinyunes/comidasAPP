"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ============================================
// LANDING PAGE — RestaurantOS
// ============================================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <Badge className="bg-white/20 text-white mb-4">🚀 Plataforma SaaS para Restaurantes</Badge>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              Gestiona tu restaurante
              <span className="block text-yellow-300">de forma inteligente</span>
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto mb-8">
              POS, KDS, Inventario, CRM, Marketing y BI en una sola plataforma.
              Multi-sucursal, multi-tenant, con IA predictiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                Comenzar gratis
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Ver demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Todo lo que necesitás</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa que reemplaza múltiples herramientas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📱", title: "Menú QR", desc: "Código QR por mesa para que tus clientes pedan desde su celular" },
              { icon: "🍳", title: "KDS Cocina", desc: "Sistema de pantalla para cocina y barra con tiempos y prioridades" },
              { icon: "📦", title: "Inventario", desc: "Control de stock por ingrediente con alertas automáticas" },
              { icon: "💰", title: "Caja y Pagos", desc: "Cobro con efectivo, tarjeta, QR MercadoPago y transferencia" },
              { icon: "👥", title: "CRM Clientes", desc: "Perfiles, historial, puntos de fidelización y segmentación" },
              { icon: "📊", title: "BI Analytics", desc: "Dashboards, KPIs, reportes y comparativas en tiempo real" },
            ].map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <span className="text-4xl">{feature.icon}</span>
                  <h3 className="text-xl font-bold mt-4 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planes simples</h2>
            <p className="text-gray-600">Elegí el plan que mejor se adapte a tu negocio</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Básico", price: "$29.990", features: ["1 sucursal", "POS + KDS", "Menú QR", "Soporte email"] },
              { name: "Profesional", price: "$49.990", features: ["Hasta 5 sucursales", "Todo lo del Básico", "Inventario + Compras", "CRM + Marketing", "BI básico", "Soporte prioritario"], popular: true },
              { name: "Enterprise", price: "Personalizado", features: ["Sucursales ilimitadas", "Todo lo anterior", "IA predictiva", "API pública", "White-label", "Soporte 24/7"] },
            ].map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-2 border-red-500 shadow-lg" : ""}>
                <CardContent className="p-8">
                  {plan.popular && <Badge className="bg-red-600 mb-4">Más popular</Badge>}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-4xl font-bold my-4">{plan.price}</p>
                  {plan.price !== "Personalizado" && <p className="text-gray-500 mb-6">por mes</p>}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.price === "Personalizado" ? "Contactar ventas" : "Comenzar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 RestaurantOS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// MENÚ RESPONSIVE (mobile-first)
// ============================================

interface ProductoMenu {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  disponible: boolean;
  destacado: boolean;
  alergenos: string[];
}

interface CategoriaMenu {
  id: string;
  nombre: string;
  productos: ProductoMenu[];
}

export function MenuResponsive({ mesa, sector }: { mesa?: string; sector?: string }) {
  const [carrito, setCarrito] = useState<{ producto: ProductoMenu; cantidad: number }[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("pizzas");
  const [busqueda, setBusqueda] = useState("");

  const categorias: CategoriaMenu[] = [
    {
      id: "pizzas",
      nombre: "Pizzas",
      productos: [
        { id: "p1", nombre: "Muzzarella", descripcion: "Salsa de tomate y mozzarella", precio: 5000, disponible: true, destacado: true, alergenos: ["gluten", "lactosa"] },
        { id: "p2", nombre: "Fugazzeta", descripcion: "Cebolla y mozzarella", precio: 6500, disponible: true, destacado: false, alergenos: ["gluten", "lactosa"] },
        { id: "p3", nombre: "Calabresa", descripcion: "Longaniza, morrones, mozzarella", precio: 5500, disponible: true, destacado: false, alergenos: ["gluten", "lactosa"] },
      ],
    },
    {
      id: "empanadas",
      nombre: "Empanadas",
      productos: [
        { id: "e1", nombre: "Carne", descripcion: "Carne cortada a cuchillo, huevo, aceituna", precio: 900, disponible: true, destacado: false, alergenos: ["gluten"] },
        { id: "e2", nombre: "Jamón y Queso", descripcion: "Jamón cocido y mozzarella", precio: 950, disponible: true, destacado: false, alergenos: ["gluten", "lactosa"] },
      ],
    },
    {
      id: "bebidas",
      nombre: "Bebidas",
      productos: [
        { id: "b1", nombre: "Coca-Cola 500ml", descripcion: "Gaseosa original", precio: 1200, disponible: true, destacado: false, alergenos: [] },
        { id: "b2", nombre: "Agua mineral", descripcion: "Sin gas 500ml", precio: 800, disponible: true, destacado: false, alergenos: [] },
        { id: "b3", nombre: "Limonada natural", descripcion: "Receta casera", precio: 1500, disponible: true, destacado: true, alergenos: [] },
      ],
    },
  ];

  const totalCarrito = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  const agregarAlCarrito = (producto: ProductoMenu) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Pizzaria Demo</h1>
            {mesa && <p className="text-xs text-red-200">Mesa {mesa} • {sector || "Salón"}</p>}
          </div>
          <div className="relative">
            <span className="text-2xl">🛒</span>
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="p-4 bg-white sticky top-16 z-30">
        <Input
          placeholder="🔍 Buscar en el menú..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="bg-gray-100"
        />
      </div>

      {/* Categorías horizontales */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              categoriaActiva === cat.id
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Productos */}
      <div className="p-4 space-y-3">
        {categorias
          .find((c) => c.id === categoriaActiva)
          ?.productos.filter((p) =>
            !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
          )
          .map((producto) => (
            <Card key={producto.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{producto.nombre}</h3>
                      {producto.destacado && <Badge className="bg-yellow-400 text-black text-xs">⭐ Popular</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{producto.descripcion}</p>
                    {producto.alergenos.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {producto.alergenos.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-lg font-bold text-red-600 mt-2">
                      ${producto.precio.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <Button
                    onClick={() => agregarAlCarrito(producto)}
                    className="bg-red-600 hover:bg-red-700 self-end"
                    size="sm"
                  >
                    + Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Barra flotante del carrito */}
      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{carrito.reduce((sum, item) => sum + item.cantidad, 0)} items</span>
              <span className="text-xl font-bold">${totalCarrito.toLocaleString("es-AR")}</span>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Hacer pedido • ${totalCarrito.toLocaleString("es-AR")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
