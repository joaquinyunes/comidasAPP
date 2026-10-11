import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "peligro" | "texto";
type Tamano = "normal" | "grande";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
}

const VARIANTE: Record<Variante, string> = {
  primario: "bg-pn-tinta text-white hover:bg-black border border-pn-tinta",
  secundario: "bg-pn-papel text-pn-tinta border border-pn-linea-fuerte hover:bg-pn-hundido",
  peligro: "bg-pn-papel text-pn-peligro border border-pn-peligro hover:bg-pn-peligro-fondo",
  texto: "bg-transparent text-pn-tinta border border-transparent hover:bg-pn-hundido",
};

// "grande" es para pantallas que se tocan con las manos ocupadas
// (salón, cocina, caja): objetivo táctil de al menos 48 px.
const TAMANO: Record<Tamano, string> = {
  normal: "min-h-9 px-3 text-sm",
  grande: "min-h-12 px-4 text-base",
};

export default function Boton({ variante = "secundario", tamano = "normal", className, type, ...resto }: Props) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        VARIANTE[variante],
        TAMANO[tamano],
        className
      )}
      {...resto}
    />
  );
}
