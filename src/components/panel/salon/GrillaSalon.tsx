import MesaTile from "./MesaTile";
import type { MesaSalon } from "./tipos";

interface Props {
  mesas: MesaSalon[];
  seleccionada: string | null;
  onElegir: (mesaId: string) => void;
}

// Las mesas agrupadas por sector, en el orden en que el mozo las recorre.
export default function GrillaSalon({ mesas, seleccionada, onElegir }: Props) {
  const sectores = [...new Set(mesas.map((m) => m.sector))];

  return (
    <div className="space-y-6">
      {sectores.map((sector) => (
        <section key={sector} aria-label={sector}>
          <h2 className="mb-2 text-sm font-semibold text-pn-suave">{sector}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {mesas
              .filter((m) => m.sector === sector)
              .map((m) => (
                <MesaTile
                  key={m.id}
                  mesa={m}
                  seleccionada={seleccionada === m.id}
                  onElegir={() => onElegir(m.id)}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
