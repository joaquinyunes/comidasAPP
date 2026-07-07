import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <header className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-red-50 to-white">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          🍽️ Restaurant<span className="text-red-600">OS</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          El sistema operativo completo para restaurantes. POS, CRM, KDS,
          Inventario, Reservas, Marketing e IA — todo en una sola plataforma.
        </p>
        <div className="flex gap-4">
          <Link href="/menu">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
              Ver Menú
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Features */}
      <main className="flex-1 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📱"
            title="Menú Digital"
            description="QR por menú. El cliente pide desde su celular sin esperar al mozo."
          />
          <FeatureCard
            icon="🗺️"
            title="Gemelo Digital"
            description="Plano interactivo del restaurante en tiempo real. Cada mesa cambia de color."
          />
          <FeatureCard
            icon="👨‍🍳"
            title="KDS Cocina"
            description="Pedidos ordenados, temporizador, alertas. Sin papel."
          />
          <FeatureCard
            icon="📦"
            title="Stock Inteligente"
            description="Descuento automático por receta. Alertas de stock bajo."
          />
          <FeatureCard
            icon="🤖"
            title="IA Predictiva"
            description="Predice demanda, sugiere compras, detecta cuellos de botella."
          />
          <FeatureCard
            icon="📊"
            title="Analytics"
            description="Dashboards de ventas, clientes, mesas, chefs. Todo en tiempo real."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-gray-500 text-sm">
        RestaurantOS — Sistema Operativo para Restaurantes
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
