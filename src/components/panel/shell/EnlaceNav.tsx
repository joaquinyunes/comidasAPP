import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ItemNav } from "./items-nav";

interface Props {
  item: ItemNav;
  activo: boolean;
  onNavegar?: () => void;
}

// Un enlace del menú. El estado activo se marca con barra + peso,
// no solo con color.
export default function EnlaceNav({ item, activo, onNavegar }: Props) {
  const Icono = item.icono;
  return (
    <Link
      href={item.href}
      onClick={onNavegar}
      aria-current={activo ? "page" : undefined}
      className={cn(
        "relative flex min-h-10 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
        activo
          ? "bg-pn-hundido font-semibold text-pn-tinta"
          : "text-pn-suave hover:bg-pn-hundido hover:text-pn-tinta"
      )}
    >
      {activo && <span aria-hidden className="absolute inset-y-1.5 left-0 w-0.5 rounded bg-pn-tinta" />}
      <Icono className="size-4 shrink-0" aria-hidden />
      {item.etiqueta}
    </Link>
  );
}
