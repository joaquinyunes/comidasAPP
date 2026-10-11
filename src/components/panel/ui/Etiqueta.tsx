import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CLASE_TONO, type Tono } from "../tonos";

interface Props {
  tono?: Tono;
  children: ReactNode;
  className?: string;
}

// Estado en una palabra. El texto dice el estado; el color lo refuerza.
export default function Etiqueta({ tono = "neutro", children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        CLASE_TONO[tono],
        className
      )}
    >
      {children}
    </span>
  );
}
