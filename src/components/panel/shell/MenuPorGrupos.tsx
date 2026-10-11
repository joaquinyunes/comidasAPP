import { usePathname } from "next/navigation";
import { TITULO_GRUPO } from "./items-nav";
import { agruparItems, estaActivo } from "./filtrar-nav";
import EnlaceNav from "./EnlaceNav";
import type { ItemNav } from "./items-nav";

interface Props {
  items: ItemNav[];
  onNavegar?: () => void;
}

// Menú completo, agrupado por área de trabajo.
export default function MenuPorGrupos({ items, onNavegar }: Props) {
  const pathname = usePathname();
  const grupos = agruparItems(items);

  return (
    <nav aria-label="Secciones del panel" className="space-y-5">
      {grupos.map((g) => (
        <div key={g.grupo}>
          <p className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-pn-suave">
            {TITULO_GRUPO[g.grupo]}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((item) => (
              <li key={item.href}>
                <EnlaceNav item={item} activo={estaActivo(item.href, pathname)} onNavegar={onNavegar} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
