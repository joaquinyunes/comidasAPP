import { esModoDemo } from "@/lib/demo";

// Cartel fijo del entorno de demo: nadie puede confundirlo con el restaurante real.
export default function AvisoDemo() {
  if (!esModoDemo()) return null;
  return (
    <div role="status" className="sticky top-0 z-[100] bg-amber-400 px-3 py-2 text-center text-sm font-semibold text-black">
      DEMO — datos de ejemplo. Nada de lo que cargues acá es real.
    </div>
  );
}
