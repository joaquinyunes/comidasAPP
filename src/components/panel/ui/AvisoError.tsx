import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onReintentar?: () => void;
}

// Error visible y accionable, sin dramatismo.
export default function AvisoError({ children, onReintentar }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-pn-peligro bg-pn-peligro-fondo px-3 py-2 text-sm text-pn-peligro"
    >
      <span>{children}</span>
      {onReintentar && (
        <button onClick={onReintentar} className="font-medium underline underline-offset-2">
          Reintentar
        </button>
      )}
    </div>
  );
}
