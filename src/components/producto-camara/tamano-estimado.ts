import type { ProductoCamara } from "./tipos";

export type TipoMedida = "diametro" | "largo" | "alto";

export interface TamanoResuelto {
  cm: number;
  tipo: TipoMedida;
  // true cuando el valor no vino de la BD sino de una estimación por nombre.
  estimado: boolean;
}

interface Regla {
  patron: RegExp;
  cm: number;
  tipo: TipoMedida;
}

// Medidas típicas por familia de producto. Sólo se usan cuando el producto
// no trae `tamanoCm`: así un producto nuevo igual se ve a escala razonable.
const REGLAS: Regla[] = [
  { patron: /pizza|fugazzeta|muzzarella|calabresa|napolitana|pizzanaut/i, cm: 32, tipo: "diametro" },
  { patron: /empanada/i, cm: 13, tipo: "largo" },
  { patron: /hot ?dog|pancho|hyperdog/i, cm: 20, tipo: "largo" },
  { patron: /hamburguesa|burger|galaxy bite/i, cm: 12, tipo: "diametro" },
  { patron: /papas|fries|fritas/i, cm: 15, tipo: "alto" },
  { patron: /ñoqui|noqui|ravioles|pasta|fideos|tallarin/i, cm: 24, tipo: "diametro" },
  { patron: /helado/i, cm: 11, tipo: "alto" },
  { patron: /flan|postre|torta|tarta/i, cm: 10, tipo: "diametro" },
  { patron: /cerveza|ipa|lager|stout|pinta/i, cm: 16, tipo: "alto" },
  { patron: /soda|coca|agua|limonada|gaseosa|jugo|bebida|batido|shake/i, cm: 20, tipo: "alto" },
];

const POR_DEFECTO: Regla = { patron: /./, cm: 22, tipo: "diametro" };

function reglaPara(nombre: string): Regla {
  return REGLAS.find((r) => r.patron.test(nombre)) ?? POR_DEFECTO;
}

export function resolverTamano(p: Pick<ProductoCamara, "nombre" | "tamanoCm">): TamanoResuelto {
  const regla = reglaPara(p.nombre);
  const real = p.tamanoCm && p.tamanoCm > 0 ? p.tamanoCm : null;
  return {
    cm: real ?? regla.cm,
    tipo: regla.tipo,
    estimado: real === null,
  };
}

export const ETIQUETA_MEDIDA: Record<TipoMedida, string> = {
  diametro: "Diámetro",
  largo: "Largo",
  alto: "Alto",
};
