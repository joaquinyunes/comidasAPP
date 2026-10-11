import type { ResumenSalon as Datos } from "@/lib/salon/resumir-salon";

// Cuatro números para ubicarse: sin tarjetas, en una línea.
export default function ResumenSalon({ r }: { r: Datos }) {
  const items: { etiqueta: string; valor: number; destacar?: boolean }[] = [
    { etiqueta: "Libres", valor: r.libres },
    { etiqueta: "Ocupadas", valor: r.ocupadas },
    { etiqueta: "Piden la cuenta", valor: r.pidenCuenta, destacar: r.pidenCuenta > 0 },
    { etiqueta: "Platos para llevar", valor: r.platosParaLlevar, destacar: r.platosParaLlevar > 0 },
  ];

  return (
    <dl className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-pn-linea bg-pn-papel px-4 py-3 sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.etiqueta}>
          <dt className="text-xs text-pn-suave">{i.etiqueta}</dt>
          <dd className={`pn-num text-2xl font-semibold ${i.destacar ? "text-pn-peligro" : ""}`}>{i.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
