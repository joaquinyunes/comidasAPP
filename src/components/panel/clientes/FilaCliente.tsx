import { MessageCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { diasDesde, enlaceWhatsapp } from "@/lib/clientes/segmentar";
import Etiqueta from "../ui/Etiqueta";

export interface ClientePanel {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  puntos: number;
  nivel: string;
  totalGastado: number;
  totalVisitas: number;
  ultimaVisita: string | null;
  alergias: string[];
  optInMarketing: boolean;
}

function cuando(dias: number | null): string {
  if (dias === null) return "Sin visitas registradas";
  if (dias === 0) return "Vino hoy";
  if (dias === 1) return "Vino ayer";
  return `Vino hace ${dias} días`;
}

export default function FilaCliente({ cliente: c }: { cliente: ClientePanel }) {
  const dias = diasDesde(c.ultimaVisita);
  const wa = enlaceWhatsapp(c.telefono, `Hola ${c.nombre.split(" ")[0]}, ¡te extrañamos en Cozizina!`);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium">{c.nombre}</p>
        <p className="mt-0.5 text-sm text-pn-suave">
          {c.telefono ?? c.email ?? "Sin datos de contacto"}
        </p>
        <p className="mt-1 flex flex-wrap gap-1.5">
          <Etiqueta>{c.nivel}</Etiqueta>
          {c.alergias.length > 0 && <Etiqueta tono="peligro">Alergia: {c.alergias.join(", ")}</Etiqueta>}
          {!c.optInMarketing && <Etiqueta>No quiere promociones</Etiqueta>}
        </p>
      </div>

      <div className="pn-num w-32 text-right">
        <p className="font-semibold">{formatCurrency(c.totalGastado)}</p>
        <p className="text-xs text-pn-suave">
          {c.totalVisitas} {c.totalVisitas === 1 ? "visita" : "visitas"} · {c.puntos} pts
        </p>
        <p className="text-xs text-pn-suave">{cuando(dias)}</p>
      </div>

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-pn-linea-fuerte px-3 text-sm font-medium hover:bg-pn-hundido"
        >
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp
        </a>
      )}
    </li>
  );
}
