"use client";

interface Bloque {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Variante {
  fondo: string;
  columnas: ReadonlyArray<readonly [number, number]>; // [x, ancho]
  pinX: number;
  parque: number; // índice del bloque de abajo que es parque
  ruta: string;
}

const FILAS: ReadonlyArray<readonly [number, number]> = [
  [14, 52],
  [74, 44],
  [166, 46],
  [220, 48],
];

const VARIANTES: Record<"a" | "b", Variante> = {
  a: {
    fondo: "var(--red)",
    columnas: [[14, 98], [122, 96], [228, 66], [304, 82]],
    pinX: 214,
    parque: 2,
    ruta: "M -10 216 L 117 216 L 117 142 L 214 142",
  },
  b: {
    fondo: "var(--purple)",
    columnas: [[14, 70], [94, 108], [212, 78], [300, 86]],
    pinX: 150,
    parque: 5,
    ruta: "M 410 216 L 295 216 L 295 142 L 150 142",
  },
};

function construirBloques(v: Variante) {
  const arriba: Bloque[] = [];
  const abajo: Bloque[] = [];
  v.columnas.forEach(([x, w]) => {
    FILAS.slice(0, 2).forEach(([y, h]) => arriba.push({ x, y, w, h }));
    FILAS.slice(2).forEach(([y, h]) => abajo.push({ x, y, w, h }));
  });
  return { arriba, abajo };
}

// Mapa ilustrado de la zona: manzanas blancas, la avenida resaltada, un
// parque, el pin con onda pulsante y un repartidor que recorre la ruta hasta
// el local. Todo SVG + SMIL (sin JS): liviano y visible aunque falle GSAP.
export default function WhereMap({ variante, nombre }: { variante: "a" | "b"; nombre: string }) {
  const v = VARIANTES[variante];
  const { arriba, abajo } = construirBloques(v);
  const idRuta = `ruta-${variante}`;

  return (
    <svg
      className="donde-mapa"
      viewBox="0 0 400 280"
      role="img"
      aria-label={`Mapa ilustrado de la zona de ${nombre}`}
    >
      <rect width="400" height="280" fill={v.fondo} />

      {arriba.map((b, i) => (
        <rect key={`a${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="9" fill="#FFF7E7" stroke="#111" strokeWidth="3" />
      ))}
      {abajo.map((b, i) =>
        i === v.parque ? (
          <g key={`p${i}`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="9" fill="#67C158" stroke="#111" strokeWidth="3" />
            <circle cx={b.x + b.w * 0.3} cy={b.y + b.h * 0.5} r="9" fill="#3F8A4D" stroke="#111" strokeWidth="2.5" />
            <circle cx={b.x + b.w * 0.65} cy={b.y + b.h * 0.42} r="11" fill="#3F8A4D" stroke="#111" strokeWidth="2.5" />
          </g>
        ) : (
          <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="9" fill="#FFF7E7" stroke="#111" strokeWidth="3" />
        )
      )}

      {/* Avenida principal */}
      <rect x="-6" y="126" width="412" height="32" fill="#F6BE3B" stroke="#111" strokeWidth="3" />
      <line x1="0" y1="142" x2="400" y2="142" stroke="#111" strokeWidth="2" strokeDasharray="12 10" opacity="0.55" />
      <text x="26" y="136" fontFamily="var(--font-anton), sans-serif" fontSize="11" letterSpacing="2" fill="#111">
        AV. CORRIENTES
      </text>

      {/* Ruta del repartidor */}
      <path id={idRuta} d={v.ruta} fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 12" />
      <g>
        <circle r="13" fill="#fff" stroke="#111" strokeWidth="3" />
        <text textAnchor="middle" y="5" fontSize="15">
          🛵
        </text>
        <animateMotion dur="5.5s" repeatCount="indefinite" rotate="0" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1">
          <mpath href={`#${idRuta}`} />
        </animateMotion>
      </g>

      {/* Pin del local con onda */}
      <g transform={`translate(${v.pinX} 142)`}>
        <circle r="10" fill="none" stroke="#fff" strokeWidth="4">
          <animate attributeName="r" values="10;38" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <g className="donde-pin">
          <path d="M0 0 C-22 -22 -22 -52 0 -52 C22 -52 22 -22 0 0 Z" fill="#EF4136" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
          <circle cy="-33" r="8" fill="#fff" stroke="#111" strokeWidth="3" />
        </g>
      </g>
    </svg>
  );
}
