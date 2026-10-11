import { cn } from "@/lib/utils";

interface Props {
  activo: boolean;
  onCambio: (activo: boolean) => void;
  etiqueta: string;
  disabled?: boolean;
}

// Interruptor de dos estados (sí/no). El estado se dice con texto
// accesible; el color solo lo refuerza.
export default function Interruptor({ activo, onCambio, etiqueta, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={disabled}
      onClick={() => onCambio(!activo)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:opacity-45",
        activo ? "border-pn-ok bg-pn-ok" : "border-pn-linea-fuerte bg-pn-hundido"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
          activo ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
